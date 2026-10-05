// Renders the custom air freshener in two shapes, with print files, cut lines
// and mockups, so Mikey can pick one and send it to a printer for quotes.
//
//   cd print/tools && npm install && npm run freshener
//
// Output lands in print/air-freshener/: print-files/<shape>/ for the printer
// (front.pdf, back.pdf, dieline.pdf, dieline-front.svg, dieline-back.svg),
// preview-*.png and proof-*.png per side, and the mockups. Read
// print/air-freshener/README.md before changing copy: every line here is one
// more copy of the facts table in CLAUDE.md.
//
// Both shapes are cut to the logo truck, the same way the business card is: the
// truck is grown by DIE_GAP, merged with whatever else is in the shape (the
// string tab, and in B the body under the truck), then rounded with a
// CLOSE-radius closing so no inside corner is tighter than a die can follow.
//
//   A, truck only: the outline is the truck. Smallest, and the front is just
//      the logo truck with MIKEY'S on the grille.
//   B, truck and name: the truck's roof and mirrors break out of the top of a
//      rounded body that carries MIKEY'S / MOBILE DETAILING, like the card.
//
// The back carries the same three things on both: the phone, the twelve towns
// and a QR to the quote calculator. No name line (Mikey questioned it on 2026-10-05, and the
// logo already says MIKEY'S), no prices, no offer, no review count. A
// freshener gets used up, but a box of 500 sits in the van for a year.

const { chromium } = require('playwright');
const { Potrace } = require('potrace');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'air-freshener');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const TRUCK_PNG = path.join(BRAND, 'source', 'truck-cutout.png');
const WORD_PNG = path.join(BRAND, 'transparent-png', 'wordmark-dark.png');
// The mockup's backdrop: a dashboard from the site's own gallery, blurred out of focus.
const CAR_PHOTO = path.join(ROOT, 'images', 'unnamed (12).webp');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
// Its own utm_source so Google Analytics keeps fresheners apart from cards,
// hangers, postcards and signs: Traffic acquisition, "freshener / print".
const QR_URL = 'https://mikeysdetailing.com/?utm_source=freshener&utm_medium=print#booking';
const TOWNS = ['Snohomish', 'Lake Stevens', 'Everett', 'Monroe', 'Mill Creek', 'Marysville',
  'Bothell', 'Duvall', 'Mukilteo', 'Woodinville', 'Granite Falls', 'Arlington'];

// ---- Geometry, inches. y runs down from the top of the trim box. ----
const BLEED = 0.125;
const DPI = 600;               // mask resolution; the PDFs stay vector
const DIE_GAP = 0.06;          // black between the truck's white outline and the cut
const CLOSE = 0.125;           // smallest inside radius on the die
const SAFE = 0.1;              // type stays this far inside the cut and the hole
const HOLE_D = 0.15;           // the string hole, about 5/32 in
const TAB_R = 0.22;            // the rounded tab above the roof that the hole sits in
const ART_CLEAR = 0.06;        // between the hole and the top of the truck art
const SPLIT_AT = 0.35;         // the back turns from red to black this far down the truck, under the mirrors
const MIN_PT = 7;              // printers' floor for type (see print/business-card/RESEARCH.md)
const QR_MIN = 0.8, QR_QUIET = 4; // the code itself no smaller than Vistaprint's floor, and its margin in squares
const PAD = 0.4;               // extra canvas round the page so the closing sees empty space on every side

// A has no room under the red for the phone as well as the towns and the QR,
// so its phone goes up in the red cab. B's body has room, so the phone sits
// big on the black and the QR gets bigger.
const SHAPES = [
  { key: 'a', dir: 'a-truck', title: 'A: truck only', truckW: 3.5, phonePt: 18, townPt: 8, qrIn: 0.85 },
  { key: 'b', dir: 'b-truck-name', title: 'B: truck and name', truckW: 2.5, bodyW: 3.25, corner: 0.2, phonePt: 21, townPt: 8, qrIn: 0.95 },
];

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

// ---- Mask morphology. Exact Euclidean distance (Felzenszwalb & Huttenlocher),
// so dilations and closings come out round, which a die needs. Same as the card. ----
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
const dilate = (m, w, h, r) => { const d = dist2(m, w, h), o = new Uint8Array(m.length); for (let i = 0; i < m.length; i++) o[i] = d[i] <= r * r ? 1 : 0; return o; };
const erode = (m, w, h, r) => { const inv = m.map(b => 1 - b), d = dist2(inv, w, h), o = new Uint8Array(m.length); for (let i = 0; i < m.length; i++) o[i] = d[i] > r * r ? 1 : 0; return o; };
const flipX = (m, w, h) => { const o = new Uint8Array(m.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o[y * w + x] = m[y * w + (w - 1 - x)]; return o; };
// fill anything the outside can't reach (pockets under the bumper, between the tyres)
function fillHoles(m, w, h) {
  const seen = new Uint8Array(m.length), q = new Int32Array(m.length);
  let head = 0, tail = 0;
  const push = i => { if (!m[i] && !seen[i]) { seen[i] = 1; q[tail++] = i; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (head < tail) {
    const i = q[head++], x = i % w, y = (i - x) / w;
    if (x > 0) push(i - 1); if (x < w - 1) push(i + 1); if (y > 0) push(i - w); if (y < h - 1) push(i + w);
  }
  const o = new Uint8Array(m.length);
  for (let i = 0; i < m.length; i++) o[i] = m[i] || !seen[i] ? 1 : 0;
  return o;
}
// how many separate pieces the die would cut out (it has to be one)
function pieces(m, w, h) {
  const seen = new Uint8Array(m.length), q = new Int32Array(m.length);
  let n = 0;
  for (let s = 0; s < m.length; s++) {
    if (!m[s] || seen[s]) continue;
    n++; let head = 0, tail = 0; seen[s] = 1; q[tail++] = s;
    while (head < tail) {
      const i = q[head++], x = i % w, y = (i - x) / w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1])
        if (j >= 0 && m[j] && !seen[j]) { seen[j] = 1; q[tail++] = j; }
    }
  }
  return n;
}
const maskPng = (m, w, h, on = [0, 0, 0], off = [255, 255, 255]) => {
  const buf = Buffer.alloc(m.length * 3);
  for (let i = 0; i < m.length; i++) { const c = m[i] ? on : off; buf[i * 3] = c[0]; buf[i * 3 + 1] = c[1]; buf[i * 3 + 2] = c[2]; }
  return sharp(buf, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
};
function trace(maskBuf) {
  return new Promise((res, rej) => {
    const t = new Potrace({ turdSize: 200, optTolerance: 0.4, threshold: 128, alphaMax: 1 });
    t.loadImage(maskBuf, err => {
      if (err) return rej(err);
      const d = t.getPathTag().match(/ d="([^"]+)"/)[1].trim();
      res(/z$/i.test(d) ? d : d + ' Z');
    });
  });
}
// the hole as its own closed subpath, a true circle, in mask pixels
const holePath = (cx, cy, r) => `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
const dieSvg = (g, d, stroke = '#EC008C', sw = 4, pxSize = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${pxSize ? g.MW : g.PW + 'in'}" height="${pxSize ? g.MH : g.PH + 'in'}" viewBox="0 0 ${g.MW} ${g.MH}">` +
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}"/></svg>`;

// Where the truck's roof is, as a fraction of its width, so the hole hangs it level.
async function roofCentre() {
  const { data, info } = await sharp(TRUCK_PNG).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const rows = Math.round(info.height * 0.02);
  let sum = 0, n = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < info.width; x++) if (data[y * info.width + x] > 100) { sum += x; n++; }
  return sum / n / info.width;
}
// The wordmark PNG has a wide transparent margin; place it by what's drawn.
async function alphaBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, x1 = 0, y0 = info.height, y1 = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++)
    if (data[y * info.width + x] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { w: info.width, h: info.height, x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

function geometry(s, truckAR, roofX, word) {
  const g = { ...s };
  g.truckH = s.truckW * truckAR;
  g.holeY = TAB_R;
  g.truckTop = g.holeY + HOLE_D / 2 + ART_CLEAR;
  if (!s.bodyW) {
    const edge = DIE_GAP + 0.01;
    g.W = s.truckW + 2 * edge;
    g.truckX = edge;
    g.H = g.truckTop + g.truckH + edge;
    g.split = g.truckTop + SPLIT_AT * g.truckH;
  } else {
    g.W = s.bodyW;
    g.truckX = (g.W - s.truckW) / 2;
    g.bodyTop = g.truckTop + SPLIT_AT * g.truckH;
    g.split = g.bodyTop;
    // the drawn part of the wordmark, 0.2 in in from each side
    g.wordW = g.W - 0.4;
    const k = g.wordW / (word.x1 - word.x0);
    g.wordImgW = word.w * k;
    g.wordX = 0.2 - word.x0 * k;
    const drawnTop = g.truckTop + g.truckH + 0.05;
    g.wordY = drawnTop - word.y0 * k;
    g.H = drawnTop + (word.y1 - word.y0) * k + 0.2;
  }
  g.holeX = g.truckX + roofX * s.truckW;
  g.PW = g.W + 2 * BLEED; g.PH = g.H + 2 * BLEED;
  g.MW = Math.round(g.PW * DPI); g.MH = Math.round(g.PH * DPI);
  return g;
}

async function buildDie(g) {
  const P = Math.round(PAD * DPI), CW = g.MW + 2 * P, CH = g.MH + 2 * P;
  const px = inch => Math.round(inch * DPI);
  const tw = px(g.truckW), th = px(g.truckH);
  const { data } = await sharp(TRUCK_PNG).resize(tw, th, { fit: 'fill' }).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const truck = new Uint8Array(CW * CH);
  const ox = P + px(BLEED + g.truckX), oy = P + px(BLEED + g.truckTop);
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) if (data[y * tw + x] > 100) truck[(oy + y) * CW + ox + x] = 1;

  const union = dilate(truck, CW, CH, px(DIE_GAP + CLOSE));
  // the string tab, grown by CLOSE so the closing brings it back to TAB_R and rounds its neck
  const hx = P + (BLEED + g.holeX) * DPI, hy = P + (BLEED + g.holeY) * DPI, tr = (TAB_R + CLOSE) * DPI;
  for (let y = Math.floor(hy - tr); y <= Math.ceil(hy + tr); y++) for (let x = Math.floor(hx - tr); x <= Math.ceil(hx + tr); x++)
    if ((x - hx) ** 2 + (y - hy) ** 2 <= tr * tr) union[y * CW + x] = 1;
  // B's body: a rounded rectangle from under the mirrors to the bottom of the trim
  const body = new Uint8Array(CW * CH);
  if (g.bodyW) {
    const bx0 = BLEED, bx1 = BLEED + g.W, by0 = BLEED + g.bodyTop, by1 = BLEED + g.H, R = g.corner;
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const X = (x - P + 0.5) / DPI, Y = (y - P + 0.5) / DPI;
      if (X < bx0 || X > bx1 || Y < by0 || Y > by1) continue;
      const cx = Math.min(Math.max(X, bx0 + R), bx1 - R), cy = Math.min(Math.max(Y, by0 + R), by1 - R);
      if ((X - cx) ** 2 + (Y - cy) ** 2 <= R * R) body[y * CW + x] = union[y * CW + x] = 1;
    }
  }
  const closed = erode(union, CW, CH, px(CLOSE));
  for (let i = 0; i < closed.length; i++) if (body[i]) closed[i] = 1;
  const filled = fillHoles(closed, CW, CH);
  // back to page size
  const die = new Uint8Array(g.MW * g.MH);
  let spill = false;
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    if (!filled[y * CW + x]) continue;
    const X = x - P, Y = y - P;
    if (X < 0 || Y < 0 || X >= g.MW || Y >= g.MH) { spill = true; continue; }
    die[Y * g.MW + X] = 1;
  }
  return { die, spill };
}

// The widest run of x where the mask is set on every row from y0 to y1 (page inches).
function span(m, g, y0, y1) {
  const ok = new Uint8Array(g.MW).fill(1);
  for (let y = Math.floor(y0 * DPI); y <= Math.ceil(y1 * DPI); y++) for (let x = 0; x < g.MW; x++) if (!m[y * g.MW + x]) ok[x] = 0;
  let best = [0, 0], run = -1;
  for (let x = 0; x <= g.MW; x++) {
    if (x < g.MW && ok[x]) { if (run < 0) run = x; }
    else if (run >= 0) { if (x - run > best[1] - best[0]) best = [run, x]; run = -1; }
  }
  return { l: best[0] / DPI, r: best[1] / DPI };
}

function css(g) {
  return `
${[500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${[600, 700].map(w => fontFace('Barlow Condensed', 'barlow-condensed', w)).join('')}
@page{size:${g.PW}in ${g.PH}in;margin:0}
:root{--ink:#0e0e0f;--red:#E31924;--gold:#D2AE5E}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:${g.PW}in;height:${g.PH}in;overflow:hidden}
.abs{position:absolute}
.layer{position:absolute;left:0;top:0;width:${g.PW}in;height:${g.PH}in}
.front{background:var(--ink)}
.front .glow{background:radial-gradient(55% 40% at 50% 82%,rgba(227,25,36,.22),transparent 70%)}
.back{background:var(--ink);color:#fff}
.back .call{font-family:'Barlow Condensed';font-weight:700;font-size:11pt;letter-spacing:.18em;text-transform:uppercase;line-height:1;white-space:nowrap}
.back .phone{font-weight:800;font-size:${g.phonePt}pt;letter-spacing:-.015em;line-height:1;white-space:nowrap;text-align:center}
.back .k{font-family:'Barlow Condensed';font-weight:700;font-size:8pt;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);line-height:1;white-space:nowrap}
/* alphabetical, down two columns of six, so a stranger finds their town the way they'd find it in any list */
.back .towns{display:grid;grid-auto-flow:column;grid-template-rows:repeat(6,auto);column-gap:9pt;row-gap:1.6pt;justify-content:start;
  margin-top:4pt;font-size:${g.townPt}pt;line-height:1;font-weight:500;color:rgba(255,255,255,.9);white-space:nowrap}
.back .qr{background:#fff;border-radius:3pt}
.back .qr svg{display:block;width:100%;height:100%}
.back .qcap{text-align:center;line-height:1}
.back .qcap b{display:block;font-weight:800;font-size:8pt}
.back .qcap span{display:block;font-weight:600;font-size:7.5pt;color:rgba(255,255,255,.72);margin-top:1.5pt}
`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const truckMeta = await sharp(TRUCK_PNG).metadata();
  const truckAR = truckMeta.height / truckMeta.width;
  const roofX = await roofCentre();
  const word = await alphaBox(WORD_PNG);
  const truckUrl = fileUrl(TRUCK_PNG), wordUrl = fileUrl(WORD_PNG);

  const qr = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const qrN = QRCode.create(QR_URL, { errorCorrectionLevel: 'M' }).modules.size;

  const browser = await chromium.launch();
  const problems = [];
  const tmp = path.join(OUT, '.render.html');
  const built = [];

  for (const s of SHAPES) {
    const g = geometry(s, truckAR, roofX, word);
    const qrMod = s.qrIn / qrN, qrPad = QR_QUIET * qrMod, qrBox = s.qrIn + 2 * qrPad;
    console.log(`${s.title}: ${g.W.toFixed(2)} x ${g.H.toFixed(2)} in; QR ${qrN} x ${qrN} squares, ${(qrMod * 25.4).toFixed(2)} mm each, ${qrBox.toFixed(3)} in with its margin`);
    if (s.qrIn < QR_MIN) problems.push(`${s.key}: the QR is ${s.qrIn} in, under the ${QR_MIN} in floor`);
    const px = inch => Math.round(inch * DPI);
    const { die: dieF, spill } = await buildDie(g);
    if (spill) problems.push(`${s.key}: the cut line runs off the page; widen the trim box`);
    const n = pieces(dieF, g.MW, g.MH);
    if (n !== 1) problems.push(`${s.key}: the die cuts ${n} pieces, not one (a bubble is too far from the truck)`);
    const dieB = flipX(dieF, g.MW, g.MH);

    // the hole, front and back (the back is the mirror image)
    const hxF = (BLEED + g.holeX) * DPI, hy = (BLEED + g.holeY) * DPI, hr = HOLE_D / 2 * DPI;
    const hxB = g.MW - hxF;
    const holeMask = hx => { const m = new Uint8Array(g.MW * g.MH); for (let y = Math.floor(hy - hr); y <= Math.ceil(hy + hr); y++) for (let x = Math.floor(hx - hr); x <= Math.ceil(hx + hr); x++) if ((x - hx) ** 2 + (y - hy) ** 2 <= hr * hr) m[y * g.MW + x] = 1; return m; };
    const holeF = holeMask(hxF), holeB = holeMask(hxB);
    const minus = (a, b) => a.map((v, i) => v && !b[i] ? 1 : 0);
    const safeF = erode(minus(dieF, holeF), g.MW, g.MH, px(SAFE));
    const safeB = erode(minus(dieB, holeB), g.MW, g.MH, px(SAFE));
    const dF = (await trace(await maskPng(dieF, g.MW, g.MH))) + ' ' + holePath(hxF, hy, hr);
    const dB = (await trace(await maskPng(dieB, g.MW, g.MH))) + ' ' + holePath(hxB, hy, hr);

    // The back's top (roof, cab and mirrors) is solid red, grown into the bleed
    // so a drifting cut still lands on red; under the split it's black.
    const splitPx = px(BLEED + g.split);
    const top = new Uint8Array(g.MW * g.MH);
    for (let y = 0; y < splitPx; y++) for (let x = 0; x < g.MW; x++) top[y * g.MW + x] = dieB[y * g.MW + x];
    const topGrown = dilate(top, g.MW, g.MH, px(BLEED));
    for (let y = splitPx; y < g.MH; y++) for (let x = 0; x < g.MW; x++) topGrown[y * g.MW + x] = 0;
    const topPng = await maskPng(topGrown, g.MW, g.MH, [227, 25, 36], [14, 14, 15]);

    // Back layout, page inches, read off the actual shape. T(f) is f of the way down the truck.
    const T = f => BLEED + g.truckTop + f * g.truckH;
    const phoneH = g.phonePt / 72 * 1.05;
    g.phoneOnRed = !g.bodyW;
    let callY, phoneTop, blockTop0, blockBot0;
    if (g.phoneOnRed) {
      // A: "Text or call" in the cab, the number across the mirrors, both on red
      callY = T(0.085);
      phoneTop = T(0.205);
      blockTop0 = BLEED + g.split + 0.06;
      blockBot0 = T(0.94);
    } else {
      // B: "Text or call" in the cab on red, the number big on the black body under it
      callY = T(0.1);
      phoneTop = BLEED + g.split + 0.17;
      blockTop0 = phoneTop + phoneH + 0.1;
      blockBot0 = BLEED + g.H - 0.12;
    }
    const cab = span(safeB, g, callY - 0.08, callY + 0.08);
    const phoneSpan = span(safeB, g, phoneTop, phoneTop + phoneH);
    // the towns and the QR side by side, centred in what's left under the red
    const blockH = qrBox + 0.04 + 0.27;
    const rowTop = blockTop0 + Math.max(0, (blockBot0 - blockTop0 - blockH) / 2);
    const row = span(safeB, g, rowTop, rowTop + blockH);
    const qrL = row.r - 0.03 - qrBox;
    // the towns centred in the room left of the QR, and level with it
    const townsCx = (row.l + qrL - 0.1) / 2;
    const townsH = (8 + 4 + 6 * g.townPt + 5 * 1.6) / 72;
    const townsTop = rowTop + (qrBox - townsH) / 2;

    const front = `<div class="page front">
  <div class="layer glow"></div>
  <img class="abs" src="${truckUrl}" style="left:${BLEED + g.truckX}in;top:${BLEED + g.truckTop}in;width:${g.truckW}in">
  ${g.bodyW ? `<img class="abs" src="${wordUrl}" style="left:${BLEED + g.wordX}in;top:${BLEED + g.wordY}in;width:${g.wordImgW}in">` : ''}
</div>`;
    const back = `<div class="page back">
  <img class="layer" src="data:image/png;base64,${topPng.toString('base64')}">
  <div class="abs call txt" style="left:${(cab.l + cab.r) / 2}in;top:${callY}in;transform:translate(-50%,-50%)">Text or call</div>
  <div class="abs phone txt" style="left:${phoneSpan.l + 0.01}in;width:${phoneSpan.r - phoneSpan.l - 0.02}in;top:${phoneTop}in">${PHONE}</div>
  <div class="abs txt tw" style="left:${townsCx}in;top:${townsTop}in;width:max-content;transform:translateX(-50%)">
    <div class="k">I come to you in</div>
    <div class="towns">${[...TOWNS].sort().map(t => `<span>${t}</span>`).join('')}</div>
  </div>
  <div class="abs qr txt" style="left:${qrL}in;top:${rowTop}in;width:${qrBox}in;height:${qrBox}in;padding:${qrPad}in">${qr}</div>
  <div class="abs qcap txt" style="left:${qrL}in;width:${qrBox}in;top:${rowTop + qrBox + 0.04}in"><b>See your price</b><span>in 60 seconds</span></div>
</div>`;

    const page = await browser.newPage({ deviceScaleFactor: DPI / 96, viewport: { width: Math.ceil(g.PW * 96), height: Math.ceil(g.PH * 96) } });
    const files = path.join(OUT, 'print-files', s.dir);
    fs.mkdirSync(files, { recursive: true });
    const cut = {};

    for (const [side, inner, safe, die, hole, d] of [['front', front, safeF, dieF, holeF, dF], ['back', back, safeB, dieB, holeB, dB]]) {
      const name = `${s.key}-${side}`;
      fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${css(g)}</style></head><body>${inner}</body></html>`);
      await page.goto(fileUrl(tmp));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));

      // Copy rules, the same list the card, the sign and the hanger enforce.
      const text = await page.evaluate(() => document.body.innerText);
      const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
        [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$\d/, 'a price (a box of fresheners cannot follow a price change)'],
        [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'], [/free\b|rain-ready|offer/i, 'an offer (the Rain-Ready offer ends Dec 31)'],
        [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/\b41\b/, 'the review count (it will grow; the print will not)']];
      for (const [re, what] of banned) if (re.test(text)) problems.push(`${name}: copy contains ${what}: "${text.match(re)[0]}"`);
      if (side === 'back') for (const t of TOWNS) if (!text.includes(t)) problems.push(`${name}: ${t} is missing from the towns`);

      const rects = await page.evaluate(() => ({
        boxes: [...document.querySelectorAll('.txt')].map(e => { const r = e.getBoundingClientRect(); return { c: e.className, x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; }),
        over: [...document.querySelectorAll('.phone, .tw, .towns')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.slice(0, 40)),
        small: [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
          .map(e => ({ t: e.textContent.trim().slice(0, 32), pt: parseFloat(getComputedStyle(e).fontSize) * 0.75 })),
      }));
      rects.over.forEach(t => problems.push(`${name}: runs past its column: "${t}"`));
      for (const e of rects.small) if (e.pt < MIN_PT - 0.01) problems.push(`${name}: "${e.t}" is ${e.pt.toFixed(1)} pt, under the ${MIN_PT} pt floor`);
      for (const b of rects.boxes) {
        const k = DPI / 96;
        let bad = null;
        for (let y = Math.floor(b.y0 * k); y <= Math.ceil(b.y1 * k) && !bad; y += 4)
          for (let x = Math.floor(b.x0 * k); x <= Math.ceil(b.x1 * k); x += 4)
            if (!safe[Math.min(g.MH - 1, y) * g.MW + Math.min(g.MW - 1, x)]) { bad = [x, y]; break; }
        if (bad) problems.push(`${name}: "${b.c}" reaches within ${SAFE} in of the cut or the hole (at ${(bad[0] / DPI - BLEED).toFixed(2)}, ${(bad[1] / DPI - BLEED).toFixed(2)} in)`);
      }
      // "Text or call" sits on the red, the towns and the QR on the black, the
      // phone on whichever its shape puts it on, and nothing straddles the line
      if (side === 'back') {
        const box = c => rects.boxes.find(b => new RegExp(`\\b${c}\\b`).test(b.c));
        const splitY = (BLEED + g.split) * 96, gap = 0.03 * 96;
        const onRed = b => b.y1 < splitY - gap, onBlack = b => b.y0 > splitY + gap;
        if (!onRed(box('call'))) problems.push(`${name}: "Text or call" runs below the red onto the black`);
        if (g.phoneOnRed ? !onRed(box('phone')) : !onBlack(box('phone'))) problems.push(`${name}: the phone straddles the red and the black`);
        for (const c of ['tw', 'qr', 'qcap']) if (!onBlack(box(c))) problems.push(`${name}: "${c}" runs up onto the red`);
        if (box('tw').x1 > box('qr').x0 - 0.06 * 96) problems.push(`${name}: the towns run into the QR`);
      }

      await page.pdf({ path: path.join(files, `${side}.pdf`), width: `${g.PW}in`, height: `${g.PH}in`, printBackground: true, preferCSSPageSize: true });
      const shot = await (await page.$('.page')).screenshot({ type: 'png' });

      if (side === 'back') {
        // the QR has to decode at printed size, and roughly at a phone's
        const { data, info } = await sharp(shot).resize({ width: Math.round(g.PW * 300) }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const c1 = jsQR(new Uint8ClampedArray(data), info.width, info.height);
        if (!c1 || c1.data !== QR_URL) problems.push(`${name}: QR does not decode to ${QR_URL}`);
        const soft = await sharp(shot).resize({ width: Math.round(g.PW * 150) }).blur(0.8).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const c2 = jsQR(new Uint8ClampedArray(soft.data), soft.info.width, soft.info.height);
        if (!c2 || c2.data !== QR_URL) problems.push(`${name}: QR does not decode at 150 dpi with a blur`);
      }

      // Preview: the piece as it comes off the die, hole and all, on transparent.
      const rgb = await sharp(shot).resize(g.MW, g.MH).removeAlpha().raw().toBuffer();
      const rgba = Buffer.alloc(g.MW * g.MH * 4);
      for (let i = 0; i < g.MW * g.MH; i++) { rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2]; rgba[i * 4 + 3] = die[i] && !hole[i] ? 255 : 0; }
      const b = px(BLEED);
      const prev = path.join(OUT, `preview-${name}.png`);
      await sharp(await sharp(rgba, { raw: { width: g.MW, height: g.MH, channels: 4 } }).png().toBuffer())
        .extract({ left: b, top: b, width: px(g.W), height: px(g.H) }).resize({ width: 1000 }).toFile(prev);
      cut[side] = prev;
      // Proof: the art with the cut line drawn on, to hold against the printer's proof.
      await sharp(await sharp(await sharp(shot).resize(g.MW, g.MH).toBuffer()).composite([{ input: Buffer.from(dieSvg(g, d, '#EC008C', 5, true)) }]).png().toBuffer())
        .resize({ width: 1000 }).toFile(path.join(OUT, `proof-${name}.png`));
    }

    fs.writeFileSync(path.join(files, 'dieline-front.svg'), dieSvg(g, dF) + '\n');
    fs.writeFileSync(path.join(files, 'dieline-back.svg'), dieSvg(g, dB) + '\n');
    fs.writeFileSync(tmp, `<!doctype html><html><head><style>@page{size:${g.PW}in ${g.PH}in;margin:0}*{margin:0}html,body{width:${g.PW}in;height:${g.PH}in;overflow:hidden}svg{display:block}</style></head><body>${dieSvg(g, dF)}</body></html>`);
    await page.goto(fileUrl(tmp));
    await page.pdf({ path: path.join(files, 'dieline.pdf'), width: `${g.PW}in`, height: `${g.PH}in`, preferCSSPageSize: true });
    await page.close();
    built.push({ s, g, cut });
  }

  // ---- Mockups ----
  // 1. Each shape front and back on a table, the string through the hole.
  // 2. Both hanging in a car, the dashboard out of focus behind them.
  const SCALE = 230;  // mockup pixels per inch, the same for both shapes so their sizes compare
  const mock = await browser.newPage({ deviceScaleFactor: 1 });
  // through a file, not setContent: an about:blank page can't load the local images
  const show = async html => {
    fs.writeFileSync(tmp, html);
    await mock.goto(fileUrl(tmp));
    await mock.evaluate(() => document.fonts.ready);
    await mock.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
  };
  const loop = (w, h) => `<svg class="string" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="M${w / 2} ${h} C ${w * 0.1} ${h * 0.7}, ${w * 0.05} ${h * 0.12}, ${w * 0.42} ${h * 0.06} C ${w * 0.62} ${h * 0.02}, ${w * 0.9} ${h * 0.3}, ${w / 2} ${h}" fill="none" stroke="#f3efe8" stroke-width="3.2" stroke-linecap="round"/></svg>`;
  const mockCss = `${[600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',sans-serif}
.piece{position:absolute;filter:drop-shadow(0 10px 14px rgba(0,0,0,.38))}
.piece img{display:block;width:100%}
.string{position:absolute;overflow:visible;filter:drop-shadow(0 3px 3px rgba(0,0,0,.25))}
.tag{position:absolute;font-weight:700;font-size:26px;color:#2b2825;letter-spacing:.01em}
.tag span{font-weight:600;color:#6b645b}`;
  for (const { s, g, cut } of built) {
    const w = g.W * SCALE, h = g.H * SCALE, hx = g.holeX * SCALE, hy = g.holeY * SCALE;
    const sideHtml = (img, x, y, rot, holeX) => `<div class="piece" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);transform-origin:${holeX}px ${hy}px">
  ${loop(150, 240).replace('class="string"', `class="string" style="left:${holeX - 75}px;top:${hy - 240}px"`)}<img src="${fileUrl(img)}"></div>`;
    const CW = Math.round(2 * w + 300), CH = Math.round(h + 420);
    await mock.setViewportSize({ width: CW, height: CH });
    await show(`<!doctype html><html><head><style>${mockCss}</style></head><body style="width:${CW}px;height:${CH}px;background:#c9c3b8;position:relative;overflow:hidden">
${sideHtml(cut.front, 100, 300, -4, hx)}
${sideHtml(cut.back, w + 200, 310, 3, w - hx)}
<div class="tag" style="left:100px;top:${CH - 70}px">${s.title} <span>| ${g.W.toFixed(2)} x ${g.H.toFixed(2)} in, front and back</span></div>
</body></html>`);
    await mock.screenshot({ path: path.join(OUT, `mockup-${s.key}.png`) });
  }

  // The car: both shapes hanging side by side, each from a string that runs up
  // out of frame to the mirror, in front of a dashboard blurred out of focus.
  const bg = await sharp(CAR_PHOTO).extract({ left: 300, top: 40, width: 330, height: 390 }).resize({ width: 1100 }).modulate({ brightness: 0.78 }).png().toBuffer();
  const bgUrl = 'data:image/png;base64,' + bg.toString('base64');
  const PANEL_W = 1000, PANEL_H = 1180, CAR = 200;  // pixels per inch in the car shot
  const panels = built.map(({ s, g, cut }, i) => {
    const w = g.W * CAR, hx = g.holeX * CAR, hy = g.holeY * CAR;
    const x = (PANEL_W - w) / 2 + (w / 2 - hx), y = 300;
    const rot = i ? 4 : -5;
    return `<div class="panel" style="left:${i * (PANEL_W + 20)}px">
  <div class="bg"></div><div class="vig"></div>
  <svg class="cord" width="${PANEL_W}" height="${PANEL_H}"><path d="M${x + hx - 9} -10 L${x + hx} ${y + hy} L${x + hx + 9} -10" fill="none" stroke="#e9e4dc" stroke-width="2.6" stroke-linejoin="round"/></svg>
  <div class="piece" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);transform-origin:${hx}px ${hy}px"><img src="${fileUrl(cut.front)}"></div>
  <div class="cap">${s.title}</div>
</div>`;
  });
  const CW = 2 * PANEL_W + 20;
  await mock.setViewportSize({ width: CW, height: PANEL_H });
  await show(`<!doctype html><html><head><style>${mockCss}
.panel{position:absolute;top:0;width:${PANEL_W}px;height:${PANEL_H}px;overflow:hidden;background:#1d1c1b}
.bg{position:absolute;inset:-60px;background:url(${bgUrl}) center/cover;filter:blur(13px)}
.vig{position:absolute;inset:0;background:radial-gradient(80% 70% at 50% 45%,transparent 40%,rgba(0,0,0,.45))}
.cord{position:absolute;left:0;top:0;filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))}
.piece{filter:drop-shadow(0 18px 22px rgba(0,0,0,.5))}
.cap{position:absolute;left:36px;bottom:30px;font-weight:700;font-size:30px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)}
</style></head><body style="width:${CW}px;height:${PANEL_H}px;background:#fff;position:relative">${panels.join('')}</body></html>`);
  await mock.screenshot({ path: path.join(OUT, 'mockup-car.png') });

  await browser.close();
  fs.unlinkSync(tmp);
  console.log('wrote', path.relative(ROOT, OUT) + '/{mockup-a,mockup-b,mockup-car}.png, {preview,proof}-*.png, print-files/*');
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }
  else console.log(`  checks ok: copy rules, the twelve towns, one piece per die, nothing spills its column, type ${MIN_PT} pt or more, type clear of the cut and the hole, QR`);
})().catch(e => { console.error(e); process.exit(1); });
