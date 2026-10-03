// Renders the roadside yard sign to a print-ready PDF and a preview PNG.
//
//   cd print/tools && npm install && npm run sign
//   python3 sign-legibility.py        (how far away each line reads; run it after any change here)
//
// Output lands in print/yard-signs/: print-files/18x24/sign.pdf (one page, the
// same art on both sides: order it "printed both sides, same design"),
// preview.png and mockup.png for looking at, and sign-type.json (the measured
// type, which sign-legibility.py reads). Read print/yard-signs/README.md before
// changing any copy: the sign is one more copy of the facts table in the repo's
// CLAUDE.md, and the README says why every word is there.
//
// What a sign has to survive: a driver with 3 to 5 seconds, reading about three
// words a second, 50 to 100 ft away. So seven words and a phone number, type
// picked for how far it reads (not how tall it looks), and nothing that changes
// (no price, no offer).
//
// The design (Mikey's wording, 2026-10-02; colour and type rebuilt for distance
// the same day):
//
//   MIKEY'S              red, Racing Sans One (the logo's face), small: it
//                        tells the regulars who it is without competing
//                        with what it is and the number
//   MOBILE CAR           black, Fira Sans Extra Condensed 800, stretched 1.25
//   DETAILING            tall, two lines at one size
//   425-600-7897         same face at 700, stretched 1.42 tall, full width:
//                        the biggest thing on the sign (Mikey, 2026-10-02),
//                        in yellow on a black strip that runs off the
//                        bottom and both sides (Mikey, 2026-10-03), so the
//                        number reads as its own thing, apart from what
//                        the sign is selling
//
// all on safety yellow. Black on yellow is what warning signs use: it reads
// about as far as black on white and is far easier to spot among the white
// campaign and real-estate signs at every corner. The type is Fira because its
// 0, 6, 8 and 9 keep open insides at a distance; the old stretched Anton
// digits were 5 in tall but closed up into blobs past about 64 ft
// (sign-legibility.py has the numbers).
//
// No red band and no call line (Mikey, 2026-10-02): what it is and the number,
// nothing else competing for the glance. No QR and no website: drivers don't
// scan. Sign leads get logged by asking "where did you see me?" (README
// section 6).
//
// 18 x 24 in landscape, corrugated plastic, 0.125 in bleed on every side. The
// yellow runs into the bleed; keep all type 0.75 in inside the trim: the
// H-stake flutes and the printer's cut both eat the edges.

const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'yard-signs');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
// Same number as (425) 600-7897; the brackets cost digit height on a sign.
const PHONE = '425-600-7897';

const W = 24, H = 18, BLEED = 0.125, SAFE = 0.75;
// Safety yellow (Pantone 109 C). Ordering it on yellow coroplast stock, or as
// a printed background, is in print/ORDERING.md.
const RED = '#E31924', INK = '#111114', YELLOW = '#FFD100';
const BG = YELLOW;

// Each line, top to bottom: the cap height it aims for (in), how much it is
// stretched tall, and the gap (in) to the next line. A line that would pass
// the 22.5 in between the margins is shrunk to fit. The words and number
// sizes are the best split of the board's height between them (both read to
// about the same distance; sign-legibility.py), with room left around them.
const FIRA = { pkg: 'fira-sans-extra-condensed', family: 'Fira Sans Extra Condensed', weight: 800 };
const LINES = [
  { id: 'name', text: "MIKEY'S", cap: 1.45, stretch: 1, gap: 0.7, pkg: 'racing-sans-one', family: 'Racing Sans One', weight: 400, color: RED, ref: 'H' },
  { id: 'what', text: 'MOBILE CAR', cap: 3.75, stretch: 1.25, gap: 0.7, ...FIRA, color: INK, ref: 'H', group: 'what' },
  { id: 'what2', text: 'DETAILING', cap: 3.75, stretch: 1.25, gap: 0.95, ...FIRA, color: INK, ref: 'H', group: 'what' },
  { id: 'phone', text: PHONE, cap: 4.3, stretch: 1.42, gap: 0, ...FIRA, weight: 700, color: YELLOW, ref: '8', strip: true },
];
// The black strip behind the number: it starts STRIP_PAD in above the top of
// the digits and runs off the bottom and both sides into the bleed, so there
// is no thin black edge for the printer's cut to wander across. Yellow on
// black is the same two inks and the same contrast as black on yellow, just
// reversed. Light type on a dark ground looks bolder than it is (the yellow
// glows into the black at a distance and closes the gaps in 0, 6, 8 and 9),
// so the number is a weight lighter (700) than the words: thinner strokes,
// wider gaps, and it fits 0.08 in taller across the same width. At least STRIP_GAP in of yellow has to stay between DETAILING and
// the strip, or the two run together from a distance.
const STRIP_PAD = 0.5, STRIP_GAP = 0.35;

// CANVA=1 npm run sign writes print-files/18x24/sign-canva.pdf instead: the
// same sign with no tall stretch, because Canva can't stretch text and an
// import of the stretched file spills off the board. Canva's lines come out a
// little shorter (they fill the width instead); the print file stays sign.pdf.
const CANVA = process.env.CANVA === '1';
if (CANVA) for (const l of LINES) l.stretch = 1;

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFile = l => path.join(FS, l.pkg, 'files', `${l.pkg}-latin-${l.weight}-normal.woff2`);
const faces = [...new Map(LINES.map(l => [l.family + l.weight, l])).values()]
  .map(l => `@font-face{font-family:'${l.family}';src:url(${fileUrl(fontFile(l))}) format('woff2');font-weight:${l.weight}}`).join('\n');

const CSS = `
${faces}
@page{size:${W + 2 * BLEED}in ${H + 2 * BLEED}in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:${BG}}
.page{position:relative;width:${W + 2 * BLEED}in;height:${H + 2 * BLEED}in;overflow:hidden;background:${BG}}
svg{position:absolute;left:0;top:0;width:${W + 2 * BLEED}in;height:${H + 2 * BLEED}in}
`;

// Lines are SVG text in inch units, so the PDF keeps them as vector type.
// set: [{ id, size (font size, in), base (baseline y on the trimmed board, in) }]
const html = (set, strip) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="page"><svg viewBox="0 0 ${W + 2 * BLEED} ${H + 2 * BLEED}" xmlns="http://www.w3.org/2000/svg">
${strip == null ? '' : `  <rect x="0" y="${BLEED + strip}" width="${W + 2 * BLEED}" height="${H + BLEED - strip}" fill="${INK}"/>`}
${LINES.map(l => {
  const s = set.find(o => o.id === l.id);
  return `  <text id="${l.id}" x="${BLEED + W / 2}" y="${(BLEED + s.base) / l.stretch}" transform="scale(1 ${l.stretch})" text-anchor="middle" fill="${l.color}" style="font:${l.weight} ${s.size}px '${l.family}'">${l.text.replace(/'/g, '&#39;')}</text>`;
}).join('\n')}
</svg></div></body></html>`;

(async () => {
  fs.mkdirSync(path.join(OUT, 'print-files', '18x24'), { recursive: true });
  const tmp = path.join(OUT, '.render.html');
  const browser = await chromium.launch();
  // 150 dpi is plenty for a sign read from a car, and keeps the preview sane.
  const DPI = 150;
  const ctx = await browser.newContext({ deviceScaleFactor: DPI / 96, viewport: { width: Math.round((W + 2 * BLEED) * 96), height: Math.round((H + 2 * BLEED) * 96) } });
  const page = await ctx.newPage();
  // First pass only loads the fonts so they can be measured.
  fs.writeFileSync(tmp, html(LINES.map(l => ({ id: l.id, size: 1, base: 1 }))));
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate(L => L.map(l => `${l.weight} 20px '${l.family}'`).filter(f => !document.fonts.check(f)), LINES);
  if (missing.length) throw new Error('fonts did not load: ' + missing.join(', '));

  // Measure every line off its glyphs: font size for the cap height asked for,
  // shrunk if it won't fit across, and the ink's real top and bottom.
  const m = await page.evaluate(({ LINES, maxW }) => {
    const c = document.createElement('canvas').getContext('2d'), out = {};
    for (const l of LINES) {
      c.font = `${l.weight} 100px '${l.family}'`;
      const capPer = c.measureText(l.ref).actualBoundingBoxAscent / 100 * l.stretch; // ink cap height per unit of font size
      const t = c.measureText(l.text);
      const widthPer = (t.actualBoundingBoxLeft + t.actualBoundingBoxRight) / 100;
      let size = l.cap / capPer;
      if (size * widthPer > maxW) size = maxW / widthPer;
      out[l.id] = { size, cap: size * capPer, width: size * widthPer, asc: size * t.actualBoundingBoxAscent / 100 * l.stretch, desc: size * t.actualBoundingBoxDescent / 100 * l.stretch };
    }
    return out;
  }, { LINES, maxW: W - 2 * SAFE - (CANVA ? 0.3 : 0) });
  // Lines in a group share the smallest size, so a stacked phrase reads as one.
  for (const l of LINES) if (l.group) {
    const k = Math.min(...LINES.filter(o => o.group === l.group).map(o => m[o.id].size)) / m[l.id].size;
    for (const f of ['size', 'cap', 'width', 'asc', 'desc']) m[l.id][f] *= k;
  }
  // Stack the ink with the gaps asked for and centre the block on the board.
  const total = LINES.reduce((a, l) => a + m[l.id].asc + m[l.id].desc + l.gap, 0);
  let y = (H - total) / 2;
  const set = LINES.map(l => { const base = y + m[l.id].asc; y = base + m[l.id].desc + l.gap; return { id: l.id, size: m[l.id].size, base }; });
  // Top of the black strip (in, on the trimmed board), from the line marked strip.
  const sl = LINES.find(l => l.strip), ss = sl && set.find(o => o.id === sl.id);
  const strip = sl ? ss.base - m[sl.id].asc - STRIP_PAD : null;
  fs.writeFileSync(tmp, html(set, strip));
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);

  const sizes = Object.fromEntries(LINES.map(l => [l.id, +m[l.id].cap.toFixed(2)]));
  console.log(`  MIKEY'S ${sizes.name} in, MOBILE CAR / DETAILING ${sizes.what} in, phone ${sizes.phone} in tall (${m.phone.width.toFixed(1)} in wide)`);
  console.log(`  margin above the type ${((H - total) / 2).toFixed(2)} in, below ${((H - total) / 2).toFixed(2)} in`);
  const problems = [];
  if (sizes.phone < 2.3) problems.push(`phone number ${sizes.phone} in tall: unreadable from a car`);
  if (sizes.name >= sizes.what / 2) problems.push(`MIKEY'S (${sizes.name} in) is over half the size of MOBILE CAR DETAILING: the name is meant to sit back`);
  if (sizes.what < 2) problems.push(`MOBILE CAR DETAILING ${sizes.what} in tall: a driver has to see what this is`);
  if (sl) {
    const above = LINES[LINES.indexOf(sl) - 1], aboveSet = set.find(o => o.id === above.id);
    const yellowGap = strip - (aboveSet.base + m[above.id].desc);
    console.log(`  black strip from ${strip.toFixed(2)} in down (${(H - strip).toFixed(2)} in tall), ${yellowGap.toFixed(2)} in of yellow above it`);
    if (yellowGap < STRIP_GAP) problems.push(`only ${yellowGap.toFixed(2)} in of yellow between ${above.text} and the black strip`);
  }

  const text = await page.evaluate(() => [...document.querySelectorAll('text')].map(t => t.textContent).join('\n'));
  const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
    [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$\d/, 'a price (a printed sign cannot follow a price change)'],
    [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'], [/free|rain-ready|offer/i, 'an offer (the Rain-Ready offer is not on signs)'],
    [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds']];
  for (const [re, what] of banned) if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  if (!text.includes(PHONE)) problems.push(`the phone number is not ${PHONE}`);
  // The glance copy: what it is. MIKEY'S is the small brand mark for people
  // who pass it every day, so it doesn't count against the 7.
  const words = LINES.filter(l => l.group === 'what').map(l => l.text).join(' ').split(/\s+/);
  if (words.length > 7) problems.push(`the big copy is ${words.length} words; a driver reads 7`);

  const buf = await (await page.$('.page')).screenshot({ type: 'png' });
  // Safe area, checked on the ink itself: nothing but the background colour
  // may sit in the 0.75 in margin or the bleed (black, inside the strip).
  {
    const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = info.width / (W + 2 * BLEED), edge = Math.ceil((BLEED + SAFE) * px);
    const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    const stripPx = strip == null ? Infinity : (BLEED + strip) * px;
    let bad = 0;
    for (let y = 0; y < info.height; y++) {
      if (Math.abs(y + 0.5 - stripPx) < 1.5) continue; // the strip's own anti-aliased edge
      // The screenshot rounds the page up to whole pixels, so its last row and
      // column are part page, part the yellow behind it: not on the sign.
      if (strip != null && y === info.height - 1) continue;
      const bg = rgb(y + 0.5 > stripPx ? INK : BG);
      const inYMargin = y < edge || y >= info.height - edge;
      for (let x = 0; x < info.width; x++) {
        if (!inYMargin && x >= edge && x < info.width - edge) continue;
        if (strip != null && x === info.width - 1) continue;
        const i = (y * info.width + x) * 3;
        if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 60) bad++;
      }
    }
    if (bad) problems.push(`${bad} pixels of ink outside the safe area`);
    else console.log('  safe area ok: no ink in the margin');
  }
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }

  if (CANVA) {
    const out = path.join(OUT, 'print-files', '18x24', 'sign-canva.pdf');
    await page.pdf({ path: out, width: `${W + 2 * BLEED}in`, height: `${H + 2 * BLEED}in`, printBackground: true, preferCSSPageSize: true });
    console.log('wrote', path.relative(ROOT, out), '(for importing into Canva; print sign.pdf)');
    await browser.close();
    fs.unlinkSync(tmp);
    return;
  }

  // What sign-legibility.py needs to score the type.
  fs.writeFileSync(path.join(OUT, 'sign-type.json'), JSON.stringify({
    note: 'Written by print/tools/build-yard-sign.cjs; read by print/tools/sign-legibility.py. Cap heights in inches on the 24 x 18 in board.',
    background: BG,
    strip: strip == null ? null : { top_in: +strip.toFixed(2), color: INK },
    lines: LINES.map(l => ({ id: l.id, text: l.text, pkg: l.pkg, weight: l.weight, stretch: l.stretch, capRef: l.ref, cap_in: sizes[l.id], width_in: +m[l.id].width.toFixed(2), color: l.color })),
  }, null, 2) + '\n');

  const pdf = path.join(OUT, 'print-files', '18x24', 'sign.pdf');
  await page.pdf({ path: pdf, width: `${W + 2 * BLEED}in`, height: `${H + 2 * BLEED}in`, printBackground: true, preferCSSPageSize: true });
  console.log('wrote', path.relative(ROOT, pdf));
  const b = Math.round(BLEED * DPI);
  await sharp(buf).extract({ left: b, top: b, width: W * DPI, height: H * DPI }).resize({ width: 1800 }).toFile(path.join(OUT, 'preview.png'));
  // On a stake, on grass, at the size a driver sees it from ~60 ft.
  const small = await sharp(path.join(OUT, 'preview.png')).resize({ width: 520 }).toBuffer();
  const sm = await sharp(small).metadata();
  const stake = { create: { width: 14, height: 180, channels: 3, background: '#6b7280' } };
  const Wm = 900, Hm = 700;
  await sharp({ create: { width: Wm, height: Hm, channels: 3, background: '#a7c7e7' } })
    .composite([
      { input: { create: { width: Wm, height: 260, channels: 3, background: '#5f8f3e' } }, left: 0, top: Hm - 260 },
      { input: await sharp(stake).png().toBuffer(), left: Math.round(Wm / 2 - 120), top: 90 + sm.height - 10 },
      { input: await sharp(stake).png().toBuffer(), left: Math.round(Wm / 2 + 106), top: 90 + sm.height - 10 },
      { input: small, left: Math.round((Wm - 520) / 2), top: 90 },
    ]).png().toFile(path.join(OUT, 'mockup.png'));
  console.log('wrote preview.png + mockup.png + sign-type.json');
  await browser.close();
  fs.unlinkSync(tmp);
})().catch(e => { console.error(e); process.exit(1); });
