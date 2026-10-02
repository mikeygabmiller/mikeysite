// Renders the roadside yard sign to a print-ready PDF and a preview PNG.
//
//   cd print/tools && npm install && npm run sign
//
// Output lands in print/yard-signs/: print-files/18x24/sign.pdf (one page, the
// same art on both sides: order it "printed both sides, same design"),
// preview.png and mockup.png for looking at. Read print/yard-signs/README.md
// before changing any copy: the sign is one more copy of the facts table in the
// repo's CLAUDE.md, and the README says why every word is there.
//
// What a sign has to survive: a driver with 3 to 5 seconds, reading about three
// words a second, 50 to 100 ft away. So seven words and a phone number, the
// biggest type the board allows, and nothing that changes (no price, no offer).
//
// The design Mikey picked (2026-10-01, wording changed 2026-10-02), two ink
// colours (red, black) on white so it prints at the cheaper 2-colour rate:
//
//   MIKEY'S              red, Racing Sans One (the logo's face), small: it
//                        tells the regulars who it is without competing
//                        with what, the ask and the number
//   MOBILE CAR DETAILING black, Barlow Condensed stretched 1.3x tall: three
//                        words across the board would only be 1.9 in
//   CALL OR TEXT ME      white on a full-width red band: the one line that
//                        asks for the call (Mikey wanted this over
//                        "I come to you" on 2026-10-02)
//   425-600-7897         black, Anton stretched tall: about 5 in digits
//
// No QR and no website: drivers don't scan, and the room went to the number
// (2.6 in tall on the old layout, 5 in now). Sign leads get logged by asking
// "where did you see me?" (README section 6).
//
// 18 x 24 in landscape, corrugated plastic, 0.125 in bleed on every side. Keep
// everything that matters 0.75 in inside the trim: the H-stake flutes and the
// printer's cut both eat the edges. Only the red band runs to the edge.

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
// The red band's line. CTA="..." npm run sign tries another wording.
const CTA = process.env.CTA || 'CALL OR TEXT ME';

const W = 24, H = 18, BLEED = 0.125, SAFE = 0.75;
const RED = '#E31924', INK = '#111114';
// Anton is stretched vertically by this much: a tall, narrow number gets far
// more height out of 22.5 in of width (the idea came off the printer's proof).
const STRETCH = 1.42;

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

// Each line: top and height on the trimmed 24 x 18 board, the width its text
// may fill, and the largest font size (in) it may grow to.
const LINES = [
  { id: 'name', text: "MIKEY'S", y: 0.8, h: 1.75, w: 22.5, max: 1.85, font: "400 1in/1 'Racing Sans One'", color: RED },
  { id: 'what', text: 'MOBILE CAR DETAILING', y: 2.85, h: 4.1, w: 22.5, max: 5.0, font: "800 1in/1 'Barlow Condensed'", color: INK, stretch: 1.3 },
  { id: 'how', text: CTA, y: 7.3, h: 3.85, w: 21, max: 3.9, font: "800 1in/1 'Barlow Condensed'", color: '#fff', band: true },
  { id: 'phone', text: PHONE, y: 11.4, h: 5.85, w: 22.5, max: 4.2, font: "400 1in/1 'Anton'", color: INK, stretch: STRETCH },
];

const CSS = `
${fontFace('Barlow Condensed', 'barlow-condensed', 800)}
${fontFace('Racing Sans One', 'racing-sans-one', 400)}
${fontFace('Anton', 'anton', 400)}
@page{size:${W + 2 * BLEED}in ${H + 2 * BLEED}in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
.page{position:relative;width:${W + 2 * BLEED}in;height:${H + 2 * BLEED}in;overflow:hidden;background:#fff}
.band{position:absolute;left:0;right:0;background:${RED}}
.ln{position:absolute;left:${BLEED + SAFE}in;right:${BLEED + SAFE}in;display:flex;align-items:center;justify-content:center}
.ln span{display:inline-block;white-space:nowrap}
`;

const html = () => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="page">
${LINES.filter(l => l.band).map(l => `  <div class="band" style="top:${BLEED + l.y}in;height:${l.h}in"></div>`).join('\n')}
${LINES.map(l => `  <div class="ln" style="top:${BLEED + l.y}in;height:${l.h}in"><span id="${l.id}" style="font:${l.font};color:${l.color}${l.stretch ? `;transform:scaleY(${l.stretch})` : ''}">${l.text}</span></div>`).join('\n')}
</div></body></html>`;

(async () => {
  fs.mkdirSync(path.join(OUT, 'print-files', '18x24'), { recursive: true });
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, html());
  const browser = await chromium.launch();
  // 150 dpi is plenty for a sign read from a car, and keeps the preview sane.
  const DPI = 150;
  const ctx = await browser.newContext({ deviceScaleFactor: DPI / 96, viewport: { width: Math.round((W + 2 * BLEED) * 96), height: Math.round((H + 2 * BLEED) * 96) } });
  const page = await ctx.newPage();
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate(() => ["400 20px 'Racing Sans One'", "800 20px 'Barlow Condensed'", "400 20px 'Anton'"].filter(f => !document.fonts.check(f)));
  if (missing.length) throw new Error('fonts did not load: ' + missing.join(', '));

  // Biggest type that fits: each line as large as its width allows, up to its
  // max. Ink height is measured off the glyphs, so the numbers are real.
  const sizes = await page.evaluate((LINES) => {
    const c = document.createElement('canvas').getContext('2d'), out = {};
    for (const l of LINES) {
      const s = document.getElementById(l.id), cs = getComputedStyle(s);
      c.font = `${cs.fontWeight} 960px ${cs.fontFamily}`;
      const perIn = c.measureText(l.text).width / 960; // inches of width per inch of font size
      const size = Math.min(l.max, l.w / perIn);
      s.style.fontSize = size + 'in';
      const m = c.measureText(l.id === 'phone' ? '8' : 'H');
      out[l.id] = +(size * m.actualBoundingBoxAscent / 960 * (l.stretch || 1)).toFixed(2);
    }
    return out;
  }, LINES);
  console.log(`  MIKEY'S ${sizes.name} in, MOBILE CAR DETAILING ${sizes.what} in, ${CTA} ${sizes.how} in, phone ${sizes.phone} in tall`);
  const problems = [];
  if (sizes.phone < 2.3) problems.push(`phone number ${sizes.phone} in tall: unreadable from a car`);
  if (sizes.name >= sizes.how) problems.push(`MIKEY'S (${sizes.name} in) is as big as the red band's line: the name is meant to sit back`);
  if (sizes.what < 2) problems.push(`MOBILE CAR DETAILING ${sizes.what} in tall: a driver has to see what this is`);

  const text = await page.evaluate(() => document.body.innerText);
  const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
    [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$\d/, 'a price (a printed sign cannot follow a price change)'],
    [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'], [/free|rain-ready|offer/i, 'an offer (the Rain-Ready offer is not on signs)'],
    [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds']];
  for (const [re, what] of banned) if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  // The glance copy: what it is and the ask. MIKEY'S is the small brand mark
  // for people who pass it every day, so it doesn't count against the 7.
  const words = LINES.filter(l => l.id === 'what' || l.id === 'how').map(l => l.text).join(' ').split(/\s+/);
  if (words.length > 7) problems.push(`the big copy is ${words.length} words; a driver reads 7`);

  const buf = await (await page.$('.page')).screenshot({ type: 'png' });
  // Safe area, checked on the ink itself: outside the red band's rows, nothing
  // but white may sit in the 0.75 in margin or the bleed.
  {
    const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = info.width / (W + 2 * BLEED), edge = Math.ceil((BLEED + SAFE) * px);
    const bandRows = LINES.filter(l => l.band).map(l => [Math.floor((BLEED + l.y) * px) - 1, Math.ceil((BLEED + l.y + l.h) * px) + 1]);
    let bad = 0;
    for (let y = 0; y < info.height; y++) {
      if (bandRows.some(([a, b]) => y >= a && y <= b)) continue;
      const inYMargin = y < edge || y >= info.height - edge;
      for (let x = 0; x < info.width; x++) {
        if (!inYMargin && x >= edge && x < info.width - edge) continue;
        const i = (y * info.width + x) * 3;
        if (data[i] < 200 || data[i + 1] < 200 || data[i + 2] < 200) bad++;
      }
    }
    if (bad) problems.push(`${bad} pixels of ink outside the safe area`);
    else console.log('  safe area ok: nothing but the red band reaches the margin');
  }
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }

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
  console.log('wrote preview.png + mockup.png');
  await browser.close();
  fs.unlinkSync(tmp);
})().catch(e => { console.error(e); process.exit(1); });
