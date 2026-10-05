// Renders the car window decal: one transparent PNG to upload to a
// print-and-transfer sticker maker (UV DTF, the kind Temu sells), and a
// preview of it on glass.
//
//   cd print/tools && npm install && npm run decal
//   WIDTH=10 npm run decal        (the decal's width in inches; default 12)
//
// Output lands in print/car-decal/: print-files/window-decal-<W>in.png (square,
// transparent, 300 dpi: that's the upload) and preview.png (on tinted glass
// and on clear glass over light seats). For cutting it out of vinyl yourself
// (the DIY way) it also writes print-files/window-decal-cut.svg (Cricut Design
// Space, Silhouette Designer) and print-files/hand-cut-template.pdf (print it,
// tape it over the vinyl, cut along the letters with a knife). Read
// print/car-decal/README.md before changing copy: like the sign and the card,
// the decal is one more copy of the facts table in CLAUDE.md.
//
// Who reads it: someone on the sidewalk or across the street while Mikey works
// in their neighbour's driveway, 20 to 50 ft away, or a driver beside him at a
// light. So it follows the yard sign: what it is and the number, big, with
// MIKEY'S as the brand mark, and nothing that changes (no price, no offer, no
// review count: a decal stays on the glass for years). No QR: nobody scans a
// car. The website went on at Mikey's request (2026-10-05), smallest and last:
// a parked car gets read by people walking past, and the site gives them a
// price without a phone call.
//
//   MIKEY'S              the logo's own MIKEY'S (vector: red, white outline,
//                        sparkle), from logo-final/svg/wordmark-dark.svg
//   MOBILE DETAILING     white, Fira Sans Extra Condensed 700, 1.25x tall, full width
//   425-600-7897         white, same face, 1.42x tall, full width: the biggest thing
//   mikeysdetailing.com  white, same face, 1.25x tall, 3/4 width, lower case like
//                        the business card has it
//
// White, because what's behind a car window is dark: tint, or the shadow
// inside the car. A thin black keyline around everything keeps it readable on
// clear glass over light seats; on tint it disappears. The type is Fira for
// the sign's reason: its 0, 6, 8 and 9 keep open insides at a distance
// (print/yard-signs/README.md). 700, not the sign's 800, because white on dark
// glows into the ground and closes those gaps; it's the weight the sign uses
// for its yellow-on-black number.
//
// The canvas is square because the sticker maker's upload frame is: the design
// sits in the middle with clear above and below, so the upload can't be
// cropped, and nothing prints there (a transfer only lays down ink).

const { chromium } = require('playwright');
const { Potrace } = require('potrace');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'print', 'car-decal');
const WORDMARK = path.join(ROOT, 'social', 'brand', 'logo-final', 'svg', 'wordmark-dark.svg');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
// Same number as (425) 600-7897; the brackets cost digit height, as on the sign.
const PHONE = '425-600-7897';
const SITE = 'mikeysdetailing.com';

const W = +(process.env.WIDTH || 12);   // decal width, in; the canvas is W x W
if (!(W >= 4 && W <= 24)) throw new Error('WIDTH is the decal width in inches, 4 to 24');
const DPI = 300;
const SIDE = 0.03 * W;                  // clear margin left and right
const KEY = 0.04;                       // keyline, in (about 1 mm)
const MARK_W = 0.62;                    // MIKEY'S, as a share of the type width
const GAPS = [0.035, 0.045, 0.035];     // under MIKEY'S, MOBILE DETAILING and the number, as a share of W
const FIRA = { pkg: 'fira-sans-extra-condensed', family: 'Fira Sans Extra Condensed', weight: 700 };
// share: how much of the type width the line's ink fills, centred.
const LINES = [
  { id: 'what', text: 'MOBILE DETAILING', stretch: 1.25, ref: 'H', share: 1 },
  { id: 'phone', text: PHONE, stretch: 1.42, ref: '8', share: 1 },
  { id: 'site', text: SITE, stretch: 1.25, ref: 'x', share: 0.75 },
];
// Feet per inch of letter height for these exact faces and stretches, from
// sign-legibility.py's model (2026-10-05; it gives the yard sign's 68 ft for
// Fira 800 the same way). The website's is per inch of x-height, scored on the
// letters in it. Glass reflects the sky, so on a car this is the best case.
const FT_PER_IN = { what: 18.3, phone: 19.5, site: 23.2 };

// MIKEY'S and its sparkle, lifted from the vector wordmark with the transform
// they sit in. MOBILE DETAILING and its red rules stay behind: at decal size
// the letter-spaced Barlow reads at a quarter of the distance Fira does, and
// thin rules are the first thing a transfer loses.
const wm = fs.readFileSync(WORDMARK, 'utf8');
const wmPaths = wm.match(/<path[^>]*\/>/g);
const wmG = wm.match(/<g transform="([^"]+)"/);
if (!wmPaths || wmPaths.length !== 3 || !wmG || !/fill="#E31924"/.test(wmPaths[0])) throw new Error('wordmark-dark.svg changed shape: expected MIKEY\'S, MOBILE DETAILING, sparkle');
const MARK = `<g transform="${wmG[1]}">${wmPaths[0]}${wmPaths[2]}</g>`;
const MARK_PAD = 8;                     // half the white outline's 16-unit stroke, outside the path

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const font = path.join(FS, FIRA.pkg, 'files', `${FIRA.pkg}-latin-${FIRA.weight}-normal.woff2`);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'${FIRA.family}';src:url(${fileUrl(font)}) format('woff2');font-weight:${FIRA.weight}}
html,body{margin:0;background:transparent}
svg{display:block;width:${W}in;height:${W}in}
</style></head><body>
<svg id="art" viewBox="0 0 ${W} ${W}" xmlns="http://www.w3.org/2000/svg">
  <g id="mark">${MARK}</g>
${LINES.map(l => `  <text id="${l.id}" fill="#FFFFFF" style="font:${FIRA.weight} 1px '${FIRA.family}'">${l.text}</text>`).join('\n')}
</svg></body></html>`;

// Exact Euclidean distance transform (Felzenszwalb & Huttenlocher), as in
// build-business-card.cjs, so the keyline comes out round at the corners.
function edt1(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s;
    while (true) {
      const p = v[k];
      s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p);
      if (s <= z[k]) { k--; continue; }
      break;
    }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}
function dist2(mask, w, h) {
  const INF = 1e20, out = new Float64Array(w * h), n = Math.max(w, h);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let i = 0; i < w * h; i++) out[i] = mask[i] ? 0 : INF;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = out[y * w + x];
    edt1(f, h, d, v, z);
    for (let y = 0; y < h; y++) out[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = out[y * w + x];
    edt1(f, w, d, v, z);
    for (let x = 0; x < w; x++) out[y * w + x] = d[x];
  }
  return out;
}

// Black-on-white render to outlines. Every outline gets its Z: potrace ends
// each one on its start point but leaves the Z out, and some cutting software
// wants it (as in build-business-card.cjs).
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
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const side = Math.ceil(W * 96);
  const ctx = await browser.newContext({ deviceScaleFactor: DPI / 96, viewport: { width: side, height: side } });
  const page = await ctx.newPage();
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  if (!(await page.evaluate(f => document.fonts.check(f), `${FIRA.weight} 20px '${FIRA.family}'`))) throw new Error('Fira Sans Extra Condensed did not load: run npm install in print/tools');

  // Lay it out off the ink: each line's font size is whatever makes its ink
  // fill the width, the mark is MARK_W of that width, and the stack is centred.
  const L = await page.evaluate(({ W, SIDE, KEY, MARK_W, GAPS, LINES, MARK_PAD, FIRA }) => {
    const usable = W - 2 * SIDE - 2 * KEY;
    const c = document.createElement('canvas').getContext('2d');
    const mark = document.getElementById('mark');
    const bb = mark.getBBox();
    const bx = bb.x - MARK_PAD, by = bb.y - MARK_PAD, bw = bb.width + 2 * MARK_PAD, bh = bb.height + 2 * MARK_PAD;
    const s = usable * MARK_W / bw;
    const lines = LINES.map(l => {
      c.font = `${FIRA.weight} 100px '${FIRA.family}'`;
      const t = c.measureText(l.text), r = c.measureText(l.ref);
      const width = usable * l.share, size = width / ((t.actualBoundingBoxLeft + t.actualBoundingBoxRight) / 100);
      return { id: l.id, stretch: l.stretch, size, x: (W - width) / 2 + t.actualBoundingBoxLeft / 100 * size,
        asc: t.actualBoundingBoxAscent / 100 * size * l.stretch, desc: t.actualBoundingBoxDescent / 100 * size * l.stretch,
        cap: r.actualBoundingBoxAscent / 100 * size * l.stretch };
    });
    const markH = bh * s, total = markH + lines.reduce((a, l, i) => a + GAPS[i] * W + l.asc + l.desc, 0);
    let y = (W - total) / 2;
    const top = y;
    mark.setAttribute('transform', `translate(${(W - bw * s) / 2 - bx * s} ${y - by * s}) scale(${s})`);
    y += markH + GAPS[0] * W;
    lines.forEach((l, i) => {
      const t = document.getElementById(l.id), base = y + l.asc;
      t.setAttribute('x', l.x);
      t.setAttribute('y', base / l.stretch);
      t.setAttribute('transform', `scale(1 ${l.stretch})`);
      t.style.fontSize = l.size + 'px';
      y = base + l.desc + (GAPS[i + 1] || 0) * W;
    });
    return { top, bottom: top + total, markW: bw * s, markH, markCap: 110.0 * s, lines };
  }, { W, SIDE, KEY, MARK_W, GAPS, LINES, MARK_PAD, FIRA });

  const art = await page.locator('#art').screenshot({ omitBackground: true, type: 'png' });
  const copy = await page.evaluate(() => [...document.querySelectorAll('text')].map(t => t.textContent).join('\n'));

  // ---- The DIY cut file: one colour, the same layout, cut from white vinyl. ----
  // Cut vinyl is one colour a sheet, so MIKEY'S is plain letters: its white
  // outline in one colour would melt the letters into one blob, and the
  // sparkle's points are too fine to weed. No keyline either. Traced from the
  // 300 dpi render, so the cutter gets outlines and needs no fonts.
  await page.evaluate(() => {
    document.documentElement.style.background = document.body.style.background = '#fff';
    const [letters, sparkle] = document.querySelectorAll('#mark path');
    letters.setAttribute('fill', '#000');
    letters.setAttribute('stroke', 'none');
    sparkle.remove();
    for (const t of document.querySelectorAll('text')) t.setAttribute('fill', '#000');
  });
  const band = { x: SIDE, y: L.top - 0.1, w: W - 2 * SIDE, h: L.bottom - L.top + 0.2 };
  const flat = await page.screenshot({ type: 'png', clip: { x: band.x * 96, y: band.y * 96, width: band.w * 96, height: band.h * 96 } });
  const fm = await sharp(flat).metadata();
  const outlines = await traceOutlines(flat);
  const cutSvg = (size = true) => `<svg xmlns="http://www.w3.org/2000/svg"${size ? ` width="${band.w.toFixed(3)}in" height="${band.h.toFixed(3)}in"` : ''} viewBox="0 0 ${fm.width} ${fm.height}">` +
    `<path d="${outlines}" fill="#000" fill-rule="evenodd"/></svg>`;
  fs.writeFileSync(path.join(OUT, 'print-files', 'window-decal-cut.svg'), cutSvg() + '\n');

  // The template for cutting it by hand: the same outlines on Letter paper
  // turned sideways, as wide as fits inside a home printer's margins (to the
  // half inch, 10 in at most), and a bar to measure so a printer that shrinks
  // it to fit gets caught before the vinyl is cut. The steps go on page 2.
  const TPL_ROOM = 8.5 - 1.75;            // the page less its margins, the top line, the bar and its label
  const TPL_W = Math.min(10, Math.floor(TPL_ROOM * band.w / band.h * 2) / 2);
  const tplH = TPL_W * band.h / band.w;
  const arimo = wt => fileUrl(path.join(FS, 'arimo', 'files', `arimo-latin-${wt}-normal.woff2`));
  const tpl = await browser.newPage();
  await tpl.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Arimo';src:url(${arimo(400)}) format('woff2');font-weight:400}
@font-face{font-family:'Arimo';src:url(${arimo(700)}) format('woff2');font-weight:700}
@page{size:11in 8.5in;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font:400 10pt/1.3 'Arimo';color:#111}
.p{position:relative;width:11in;height:8.5in;padding:0.45in 0.5in;overflow:hidden;break-after:page}
.p:last-child{break-after:auto}
.top{margin-bottom:0.12in;text-align:center}
.art svg{display:block;margin:0 auto;width:${TPL_W}in;height:${tplH}in}
.lbl{margin:0.15in 0 0.05in;text-align:center}
.bar{width:${TPL_W}in;height:0.1in;margin:0 auto;background:#111}
h1{font:700 14pt 'Arimo';margin-bottom:0.2in}
ol{padding-left:0.3in;font-size:12pt;line-height:1.4;max-width:8.6in}
li{margin-bottom:0.14in}
</style></head><body>
<div class="p">
<p class="top"><b>Mikey's Mobile Detailing window decal, hand-cut template.</b> Print at Actual size (100%), not Fit to page. The steps are on page 2.</p>
<div class="art">${cutSvg(false)}</div>
<p class="lbl">This bar has to measure exactly ${TPL_W} inches. If it doesn't, the letters are off too.</p>
<div class="bar"></div>
</div>
<div class="p">
<h1>Cutting it by hand</h1>
<ol>
<li>Tape page 1 on top of white permanent outdoor vinyl (Oracal 651), on a cutting mat or thick cardboard.</li>
<li>With a brand new hobby knife blade, cut along every letter edge, the holes inside letters too: through the paper and the vinyl, not the backing under it. Change the blade when it starts to drag.</li>
<li>Lift off the paper and peel away all the vinyl that isn't a letter. Pick out the holes: the O, B, D and A, the 6, 0, 8 and 9, and the e, d, a, g and o in the website. The dots on the i's and the full stop are small, so leave them on the backing.</li>
<li>Lay transfer tape over the letters and rub it down hard.</li>
<li>Get the glass ready: polish any RainX or sealant off that spot until water sheets off instead of beading, wipe it with rubbing alcohol and let it dry.</li>
<li>Put it on: tape it in place with a strip of masking tape across the middle. Flip one half up, peel the backing off that half, cut it away and squeegee that half down from the middle out. Pull the tape and do the other half. Then peel the transfer tape back slowly, flat against itself. Give it a couple of days before it gets washed.</li>
</ol>
</div>
</body></html>`);
  await tpl.evaluate(() => document.fonts.ready);
  const tplOver = await tpl.evaluate(() => [...document.querySelectorAll('.p')].map(p => p.scrollHeight > p.clientHeight + 1));
  const tplPdf = await tpl.pdf({ width: '11in', height: '8.5in', printBackground: true });
  fs.writeFileSync(path.join(OUT, 'print-files', 'hand-cut-template.pdf'), tplPdf);
  await browser.close();
  fs.unlinkSync(tmp);

  // The keyline: black wherever a pixel is within KEY of the art, drawn under it.
  const { data, info } = await sharp(art).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, r = KEY * DPI;
  const solid = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) solid[i] = data[i * 4 + 3] >= 128 ? 1 : 0;
  const d2 = dist2(solid, w, h);
  const key = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const a = Math.max(0, Math.min(1, r + 0.5 - Math.sqrt(d2[i])));
    key[i * 4] = 0x11; key[i * 4 + 1] = 0x11; key[i * 4 + 2] = 0x14; key[i * 4 + 3] = Math.round(a * 255);
  }
  const png = await sharp(key, { raw: { width: w, height: h, channels: 4 } })
    .composite([{ input: art }]).png({ compressionLevel: 9 }).withMetadata({ density: DPI }).toBuffer();
  const file = path.join(OUT, 'print-files', `window-decal-${W}in.png`);
  fs.writeFileSync(file, png);

  // ---- Checks. ----
  const problems = [];
  const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
    [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$\d/, 'a price (a decal cannot follow a price change)'],
    [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'], [/free|rain-ready|offer/i, 'an offer (decals stay on for years)'],
    [/\b\d+ reviews?\b/i, 'a review count (it grows; the decal does not)']];
  for (const [re, what] of banned) if (re.test(copy)) problems.push(`copy contains ${what}: "${copy.match(re)[0]}"`);
  if (!copy.includes(PHONE)) problems.push(`the phone number is not ${PHONE}`);
  // Nothing but clear above, below and beside the design: a white or grey
  // background would print as a box on the glass.
  const out = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const alphaAt = (x, y) => out.data[(y * out.info.width + x) * 4 + 3];
  const edge = Math.floor(SIDE * DPI * 0.5);
  for (let y = 0; y < out.info.height; y += 4) for (const x of [0, edge, out.info.width - 1 - edge, out.info.width - 1])
    if (alphaAt(x, y)) { problems.push(`ink at the side margin (${x}, ${y})`); y = Infinity; break; }
  for (let x = 0; x < out.info.width; x += 4) for (const y of [0, out.info.height - 1])
    if (alphaAt(x, y)) { problems.push(`ink on the top or bottom edge (${x}, ${y})`); x = Infinity; break; }
  const [what, phone, site] = L.lines;
  if (!copy.includes(SITE)) problems.push(`the website is not ${SITE}`);
  if (site.cap >= what.cap * 0.7) problems.push('the website is meant to sit under MOBILE DETAILING, not compete with it');
  const pages = (tplPdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
  if (pages !== 2) problems.push(`the hand-cut template is ${pages} pages: it should be the cut sheet and the steps`);
  tplOver.forEach((over, i) => over && problems.push(`page ${i + 1} of the hand-cut template runs off the paper`));
  if (TPL_W < 8) problems.push(`the hand-cut template only fits ${TPL_W} in wide`);
  if (phone.cap < what.cap) problems.push('the number is meant to be the biggest thing');

  // ---- Preview: the same decal on tinted glass and on clear glass over light seats. ----
  const PW = 900, crop = { top: Math.max(0, Math.floor((L.top - 0.4) * DPI)), height: Math.min(h, Math.ceil((L.bottom - L.top + 0.8) * DPI)) };
  crop.height = Math.min(crop.height, h - crop.top);
  const shot = await sharp(png).extract({ left: 0, top: crop.top, width: w, height: crop.height }).resize({ width: PW - 80 }).toBuffer();
  const sh = (await sharp(shot).metadata()).height, PH = sh + 120;
  const glass = (a, b, label, ink) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0.3" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.07"/><stop offset="0.7" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<rect width="${PW}" height="${PH}" fill="url(#g)"/><rect width="${PW}" height="${PH}" fill="url(#r)"/>
<text x="24" y="40" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${ink}">${label}</text></svg>`);
  const panel = async (a, b, label, ink) => sharp(glass(a, b, label, ink)).composite([{ input: shot, left: 40, top: 80 }]).png().toBuffer();
  const tinted = await panel('#2b3238', '#0b0d10', 'On tinted glass', '#9aa3ab');
  const clear = await panel('#c9c4bb', '#a9a49b', 'On clear glass, light seats', '#4a4740');
  await sharp({ create: { width: PW, height: PH * 2 + 20, channels: 3, background: '#ffffff' } })
    .composite([{ input: tinted, left: 0, top: 0 }, { input: clear, left: 0, top: PH + 20 }])
    .png().toFile(path.join(OUT, 'preview.png'));

  const inch = v => v.toFixed(2) + ' in';
  console.log(`  ${path.relative(ROOT, file)}: ${w} x ${h} px, ${(png.length / 1e6).toFixed(2)} MB, the design ${inch(W - 2 * SIDE)} wide x ${inch(L.bottom - L.top + 2 * KEY)} tall`);
  console.log(`  MIKEY'S ${inch(L.markCap)} letters, MOBILE DETAILING ${inch(what.cap)}, phone ${inch(phone.cap)}, website ${inch(site.cap)} x-height`);
  console.log(`  reads to about ${Math.round(what.cap * FT_PER_IN.what)} ft (what it is), ${Math.round(phone.cap * FT_PER_IN.phone)} ft (the number) and ${Math.round(site.cap * FT_PER_IN.site)} ft (the website), 20/40 eyes, best case`);
  if (problems.length) { console.error('\nPROBLEMS:\n  ' + problems.join('\n  ')); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
