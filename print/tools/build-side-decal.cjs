// Renders the side window decal: the car decal cut down to its two biggest
// lines, for the rear door glass. One cut-vinyl file to upload to a vinyl
// lettering shop (Signs.com takes SVG) and a preview of it on glass.
//
//   cd print/tools && npm install && npm run side-decal
//   WIDTH=12 npm run side-decal     (the decal's width in inches; default 13)
//
// Output lands in print/car-decal/: print-files/side-window-cut.svg (the
// upload, sized in inches so the shop reads the width off it) and
// preview-side.png. Read print/car-decal/README.md before changing copy: like
// the back window decal, it's one more copy of the facts table in CLAUDE.md.
//
// Mikey wanted something simple on the side windows (2026-10-07), after the
// back window got the full decal (build-car-decal.cjs). Side glass is a short
// strip, so it carries the two lines that work from the next lane or across
// the street, each the full width:
//
//   MOBILE DETAILING   Fira Sans Extra Condensed 700, 1.25x tall
//   425-600-7897       same face, 1.42x tall: the biggest thing
//
// MIKEY'S and the website stay on the back window. On a 5 in strip they would
// shrink the number to make room. Same face, weight and stretch as the back
// window, so the two read as one set, and white for the same reason: what's
// behind a car window is dark. It's one colour of cut vinyl, so no keyline.

const { chromium } = require('playwright');
const { Potrace } = require('potrace');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'print', 'car-decal');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
const PHONE = '425-600-7897';

const W = +(process.env.WIDTH || 13);   // the file's width, in
if (!(W >= 6 && W <= 24)) throw new Error('WIDTH is the decal width in inches, 6 to 24');
const DPI = 300;
const PAD = 0.05;                       // clear edge round the letters, in, so the trace never clips
const GAP = 0.045;                      // between the lines, as a share of W (the back window's gap)
const FIRA = { pkg: 'fira-sans-extra-condensed', family: 'Fira Sans Extra Condensed', weight: 700 };
const LINES = [
  { id: 'what', text: 'MOBILE DETAILING', stretch: 1.25, ref: 'H' },
  { id: 'phone', text: PHONE, stretch: 1.42, ref: '8' },
];
// Feet per inch of letter height, the back window's numbers (sign-legibility.py's
// model for these exact faces and stretches). Glass reflects the sky: best case.
const FT_PER_IN = { what: 18.3, phone: 19.5 };

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const font = path.join(FS, FIRA.pkg, 'files', `${FIRA.pkg}-latin-${FIRA.weight}-normal.woff2`);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'${FIRA.family}';src:url(${fileUrl(font)}) format('woff2');font-weight:${FIRA.weight}}
html,body{margin:0;background:transparent}
svg{display:block;width:${W}in;height:${W}in}
</style></head><body>
<svg id="art" viewBox="0 0 ${W} ${W}" xmlns="http://www.w3.org/2000/svg">
${LINES.map(l => `  <text id="${l.id}" fill="#FFFFFF" style="font:${FIRA.weight} 1px '${FIRA.family}'">${l.text}</text>`).join('\n')}
</svg></body></html>`;

// Black-on-white render to outlines, every outline closed with a Z (as in
// build-car-decal.cjs: some cutting software wants it).
function traceOutlines(png) {
  return new Promise((res, rej) => {
    const t = new Potrace({ turdSize: 100, optTolerance: 0.2, threshold: 128, alphaMax: 1 });
    t.loadImage(png, err => {
      if (err) return rej(err);
      const d = t.getPathTag().match(/ d="([^"]+)"/)[1].trim();
      res(d.split(/(?=M)/).map(s => s.trim().replace(/\s*[zZ]?$/, ' Z')).join(' '));
    });
  });
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'print-files'), { recursive: true });
  const tmp = path.join(OUT, '.render-side.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const side = Math.ceil(W * 96);
  const ctx = await browser.newContext({ deviceScaleFactor: DPI / 96, viewport: { width: side, height: side } });
  const page = await ctx.newPage();
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  if (!(await page.evaluate(f => document.fonts.check(f), `${FIRA.weight} 20px '${FIRA.family}'`))) throw new Error('Fira Sans Extra Condensed did not load: run npm install in print/tools');

  // Each line's font size is whatever makes its ink fill the width; the stack
  // starts PAD down from the top, and the file is cut to its height.
  const L = await page.evaluate(({ W, PAD, GAP, LINES, FIRA }) => {
    const usable = W - 2 * PAD;
    const c = document.createElement('canvas').getContext('2d');
    c.font = `${FIRA.weight} 100px '${FIRA.family}'`;
    const lines = LINES.map(l => {
      const t = c.measureText(l.text), r = c.measureText(l.ref);
      const size = usable / ((t.actualBoundingBoxLeft + t.actualBoundingBoxRight) / 100);
      return { id: l.id, size, stretch: l.stretch, x: PAD + t.actualBoundingBoxLeft / 100 * size,
        asc: t.actualBoundingBoxAscent / 100 * size * l.stretch, desc: t.actualBoundingBoxDescent / 100 * size * l.stretch,
        cap: r.actualBoundingBoxAscent / 100 * size * l.stretch };
    });
    let y = PAD;
    lines.forEach((l, i) => {
      const t = document.getElementById(l.id), base = y + l.asc;
      t.setAttribute('x', l.x);
      t.setAttribute('y', base / l.stretch);
      t.setAttribute('transform', `scale(1 ${l.stretch})`);
      t.style.fontSize = l.size + 'px';
      y = base + l.desc + (i < lines.length - 1 ? GAP * W : 0);
    });
    return { H: y + PAD, lines };
  }, { W, PAD, GAP, LINES, FIRA });

  const clip = { x: 0, y: 0, width: W * 96, height: L.H * 96 };
  const art = await page.screenshot({ type: 'png', omitBackground: true, clip });
  const copy = await page.evaluate(() => [...document.querySelectorAll('text')].map(t => t.textContent).join('\n'));

  // ---- The cut file: traced, so the shop gets outlines and needs no fonts.
  // Drawn black so it shows on a white screen; it's cut from white vinyl.
  await page.evaluate(() => {
    document.documentElement.style.background = document.body.style.background = '#fff';
    for (const t of document.querySelectorAll('text')) t.setAttribute('fill', '#000');
  });
  const flat = await page.screenshot({ type: 'png', clip });
  await browser.close();
  fs.unlinkSync(tmp);
  const fm = await sharp(flat).metadata();
  const outlines = await traceOutlines(flat);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(3)}in" height="${L.H.toFixed(3)}in" viewBox="0 0 ${fm.width} ${fm.height}">` +
    `<path d="${outlines}" fill="#000" fill-rule="evenodd"/></svg>`;
  const file = path.join(OUT, 'print-files', 'side-window-cut.svg');
  fs.writeFileSync(file, svg + '\n');

  // ---- Checks. ----
  const problems = [];
  const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
    [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$\d/, 'a price (a decal cannot follow a price change)'],
    [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'], [/free|rain-ready|offer/i, 'an offer (decals stay on for years)'],
    [/\b\d+ reviews?\b/i, 'a review count (it grows; the decal does not)']];
  for (const [re, what] of banned) if (re.test(copy)) problems.push(`copy contains ${what}: "${copy.match(re)[0]}"`);
  if (!copy.includes(PHONE)) problems.push(`the phone number is not ${PHONE}`);
  const [what, phone] = L.lines;
  if (phone.cap < what.cap) problems.push('the number is meant to be the biggest thing');
  // Ink must stop short of every edge, or the trace (and the cut) loses it.
  const ink = await sharp(flat).greyscale().raw().toBuffer({ resolveWithObject: true });
  const iw = ink.info.width, ih = ink.info.height, dark = (x, y) => ink.data[y * iw + x] < 128;
  for (let x = 0; x < iw; x += 2) if (dark(x, 0) || dark(x, ih - 1)) { problems.push('ink on the top or bottom edge'); break; }
  for (let y = 0; y < ih; y += 2) if (dark(0, y) || dark(iw - 1, y)) { problems.push('ink on a side edge'); break; }

  // ---- Preview: on tinted glass and on clear glass over light seats. ----
  const PW = 900;
  const shot = await sharp(art).resize({ width: PW - 80 }).toBuffer();
  const sh = (await sharp(shot).metadata()).height, PH = sh + 120;
  const glass = (a, b, label, inkc) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="${PW}" height="${PH}" fill="url(#g)"/>
<text x="24" y="40" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${inkc}">${label}</text></svg>`);
  const panel = async (a, b, label, inkc) => sharp(glass(a, b, label, inkc)).composite([{ input: shot, left: 40, top: 80 }]).png().toBuffer();
  const tinted = await panel('#2b3238', '#0b0d10', 'Side glass, tinted or shaded', '#9aa3ab');
  const clear = await panel('#c9c4bb', '#a9a49b', 'Side glass, clear over light seats', '#4a4740');
  await sharp({ create: { width: PW, height: PH * 2 + 20, channels: 3, background: '#ffffff' } })
    .composite([{ input: tinted, left: 0, top: 0 }, { input: clear, left: 0, top: PH + 20 }])
    .png().toFile(path.join(OUT, 'preview-side.png'));

  const inch = v => v.toFixed(2) + ' in';
  console.log(`  ${path.relative(ROOT, file)}: ${inch(W)} wide x ${inch(L.H)} tall (letters ${inch(W - 2 * PAD)} wide)`);
  console.log(`  MOBILE DETAILING ${inch(what.cap)}, phone ${inch(phone.cap)}`);
  console.log(`  reads to about ${Math.round(what.cap * FT_PER_IN.what)} ft (what it is) and ${Math.round(phone.cap * FT_PER_IN.phone)} ft (the number), 20/40 eyes, best case`);
  if (problems.length) { console.error('\nPROBLEMS:\n  ' + problems.join('\n  ')); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
