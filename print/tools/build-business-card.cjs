// Renders the die-cut business card to print-ready PDFs, the cut line, and
// previews.
//
//   cd print/tools && npm install && npm run card
//
// Output lands in print/business-card/: print-files/3.5x2/ for the printer
// (front.pdf, back.pdf, dieline.pdf, dieline-front.svg, dieline-back.svg),
// and preview-front.png, preview-back.png, mockup.png for looking at. Read
// print/business-card/README.md before changing copy: like the hanger and the
// sign, every line here is one more copy of the facts table in CLAUDE.md.
//
// The card fits a 3.5 x 2 in box (wallet slot, card holder) but it isn't a
// rectangle: the truck's roof and mirrors break out of the top edge. That cut
// line is generated, not drawn. It is the truck from the logo, grown by DIE_GAP
// and merged with the card body, then rounded with a CLOSE-radius closing so
// no inside corner is tighter than a steel rule die can follow. Change the
// truck's size or position and the die follows; nothing to redraw by hand.
//
// Each PDF is one side at trim + 0.125 in bleed. The front is black to the
// edge of the bleed, so a cut that drifts 1/32 in shows nothing. The back is
// drawn as seen from the back: mirrored left to right, so its truck bump is
// at the top right.

const { chromium } = require('playwright');
const { Potrace } = require('potrace');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'business-card');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
// No prices and no Rain-Ready offer: a card is kept for years, 500 printed
// cards can't follow a price change, and the offer ends December 31, 2026.
// The review count is left off for the same reason (41 today, more later);
// "5.0 on Google" stays true as it grows.
const PHONE = '(425) 600-7897';
const OWNER = 'Mikey Miller';
const SITE = 'mikeysdetailing.com';
// Its own utm_source so Google Analytics keeps cards apart from hangers,
// postcards and signs: Reports > Acquisition > Traffic acquisition, "card / print".
const QR_URL = 'https://mikeysdetailing.com/?utm_source=card&utm_medium=print#booking';

// The back is for reaching Mikey, because most of these go to strangers. It
// carries three things, the most any printer guide allows a back (RESEARCH.md):
// the phone big, the twelve towns so a stranger can tell at a glance whether
// he comes to them, and the QR to the quote calculator. The web address is on
// the front, and 4OVER4's rule is "Do not repeat the front".
const TOWNS = ['Snohomish', 'Lake Stevens', 'Everett', 'Monroe', 'Mill Creek', 'Marysville',
  'Bothell', 'Duvall', 'Mukilteo', 'Woodinville', 'Granite Falls', 'Arlington'];

// ---- Geometry, inches. The trim box is 3.5 x 2; y runs down from its top. ----
const W = 3.5, H = 2, BLEED = 0.125;
const DPI = 600;                        // mask resolution; the PDFs stay vector
const BODY_TOP = 0.55;                  // top edge of the rectangle part
const CORNER = 0.125;                   // the body's corner radius
const TRUCK = { x: 0.12, y: 0.075, w: 1.72 }; // front side; height follows the image
const DIE_GAP = 0.06;                   // black between the truck's white outline and the cut
const CLOSE = 0.125;                    // smallest inside radius on the die; 4OVER4 asks for 0.125 in or more
const SAFE = 0.1;                       // type stays this far inside the cut
// Printers' floor for type on a card is 7 pt (4OVER4) to 8 pt (Vistaprint,
// UPrinting); see print/business-card/RESEARCH.md. The generator fails on
// anything smaller, except the front labels in SMALL_OK.
const MIN_PT = 7;
// Mikey likes the front as it is (2026-10-01), so these two 5.6 pt labels stay
// until he says otherwise. Raising them is recommendation 1 in RESEARCH.md.
const SMALL_OK = { front: ['lbl', 'where'], back: [] };
// The QR itself, not counting its white margin. Vistaprint's floor is 0.8 in,
// and the QR standard wants a margin four squares wide on every side.
const QR_IN = 0.8, QR_QUIET = 4;

const PW = W + 2 * BLEED, PH = H + 2 * BLEED;
const MW = Math.round(PW * DPI), MH = Math.round(PH * DPI);
const px = inch => Math.round(inch * DPI);

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

// ---- Mask morphology. Exact Euclidean distance (Felzenszwalb & Huttenlocher),
// so dilations and closings come out round, which a die needs. ----
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
// squared distance from every pixel to the nearest set pixel of mask
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
const dilate = (m, r) => { const d = dist2(m, MW, MH), o = new Uint8Array(m.length); for (let i = 0; i < m.length; i++) o[i] = d[i] <= r * r ? 1 : 0; return o; };
const erode = (m, r) => { const inv = m.map(b => 1 - b), d = dist2(inv, MW, MH), o = new Uint8Array(m.length); for (let i = 0; i < m.length; i++) o[i] = d[i] > r * r ? 1 : 0; return o; };
const flipX = m => { const o = new Uint8Array(m.length); for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) o[y * MW + x] = m[y * MW + (MW - 1 - x)]; return o; };
const maskPng = (m, on = [0, 0, 0], off = [255, 255, 255]) => {
  const buf = Buffer.alloc(m.length * 3);
  for (let i = 0; i < m.length; i++) { const c = m[i] ? on : off; buf[i * 3] = c[0]; buf[i * 3 + 1] = c[1]; buf[i * 3 + 2] = c[2]; }
  return sharp(buf, { raw: { width: MW, height: MH, channels: 3 } }).png().toBuffer();
};

async function buildDie(truckH) {
  const src = path.join(BRAND, 'source', 'truck-cutout.png');
  const tw = px(TRUCK.w), th = px(truckH);
  const { data } = await sharp(src).resize(tw, th, { fit: 'fill' }).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const truck = new Uint8Array(MW * MH);
  const ox = px(BLEED + TRUCK.x), oy = px(BLEED + TRUCK.y);
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) if (data[y * tw + x] > 100) truck[(oy + y) * MW + ox + x] = 1;
  // The body: a rounded rectangle from BODY_TOP to the bottom of the trim.
  const body = new Uint8Array(MW * MH);
  const bx0 = BLEED, bx1 = BLEED + W, by0 = BLEED + BODY_TOP, by1 = BLEED + H;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const X = (x + 0.5) / DPI, Y = (y + 0.5) / DPI;
    if (X < bx0 || X > bx1 || Y < by0 || Y > by1) continue;
    const cx = Math.min(Math.max(X, bx0 + CORNER), bx1 - CORNER), cy = Math.min(Math.max(Y, by0 + CORNER), by1 - CORNER);
    if ((X - cx) ** 2 + (Y - cy) ** 2 <= CORNER * CORNER) body[y * MW + x] = 1;
  }
  const grown = dilate(truck, px(DIE_GAP + CLOSE));
  const union = new Uint8Array(MW * MH);
  for (let i = 0; i < union.length; i++) union[i] = grown[i] || body[i] ? 1 : 0;
  // grown is already DIE_GAP + CLOSE out from the truck; eroding by CLOSE
  // brings it back to DIE_GAP and rounds every inside corner to >= CLOSE.
  // Re-adding the body keeps its square-ish corners from shrinking.
  const closed = erode(union, px(CLOSE));
  for (let i = 0; i < closed.length; i++) if (body[i]) closed[i] = 1;
  return closed;
}

function trace(maskBuf) {
  return new Promise((res, rej) => {
    const t = new Potrace({ turdSize: 200, optTolerance: 0.4, threshold: 128, alphaMax: 1 });
    t.loadImage(maskBuf, err => {
      if (err) return rej(err);
      const tag = t.getPathTag();
      // One closed outline, said explicitly: potrace ends the path on its start
      // point but leaves out the Z, and some cutting software wants the Z.
      const d = tag.match(/ d="([^"]+)"/)[1].trim();
      res(/z$/i.test(d) ? d : d + ' Z');
    });
  });
}

const dieSvg = (d, stroke = '#EC008C', sw = 4, px = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${px ? MW : PW + 'in'}" height="${px ? MH : PH + 'in'}" viewBox="0 0 ${MW} ${MH}">` +
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}"/></svg>`;

const star = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';

function css() {
  return `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${[600, 700].map(w => fontFace('Barlow Condensed', 'barlow-condensed', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
@page{size:${PW}in ${PH}in;margin:0}
:root{--ink:#0e0e0f;--red:#E31924;--red2:#B50E22;--gold:#D2AE5E;--cream:#F6F2EA;--line:#CFC6B5;--sub:#55504a}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:${PW}in;height:${PH}in;overflow:hidden}
.abs{position:absolute}
.layer{position:absolute;left:0;top:0;width:${PW}in;height:${PH}in}
.die{position:absolute;left:0;top:0;width:${PW}in;height:${PH}in;pointer-events:none}
.stars{display:inline-flex;gap:1pt;vertical-align:-0.5pt}
.stars svg{width:6.2pt;height:6.2pt;fill:var(--gold)}

/* ============ FRONT ============ */
.front{background:var(--ink);color:#fff}
.front .glow{background:radial-gradient(60% 75% at 22% 52%,rgba(227,25,36,.30),transparent 70%),
  radial-gradient(50% 60% at 100% 100%,rgba(227,25,36,.12),transparent 70%)}
.front .truck{left:${BLEED + TRUCK.x}in;top:${BLEED + TRUCK.y}in;width:${TRUCK.w}in}
.front .come{left:${BLEED + TRUCK.x}in;width:${TRUCK.w}in;text-align:center;top:${BLEED + 1.42}in}
.front .come .hand{font-family:'Caveat';font-weight:700;font-size:17pt;line-height:1}
.front .come .hand u{text-decoration:none;background:linear-gradient(transparent 74%,rgba(227,25,36,.95) 74%,rgba(227,25,36,.95) 90%,transparent 90%)}
.front .come .where{font-weight:700;font-size:5.6pt;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-top:2.5pt}
.front .rcol{left:${BLEED + 1.98}in;width:${1.4}in;top:${BLEED + BODY_TOP + 0.11}in;text-align:center}
.front .word{display:block;width:100%}
.front .lbl{font-weight:700;font-size:5.6pt;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-top:7pt}
.front .phone{font-weight:800;font-size:14.6pt;letter-spacing:-.01em;line-height:1;margin-top:2pt;white-space:nowrap}
.front .site{font-weight:600;font-size:7.4pt;letter-spacing:.02em;color:rgba(255,255,255,.82);margin-top:4pt}
.front .rule{left:${BLEED + 1.9}in;top:${BLEED + BODY_TOP + 0.16}in;width:.6pt;height:${H - BODY_TOP - 0.32}in;
  background:linear-gradient(transparent,rgba(255,255,255,.22),transparent)}

/* ============ BACK ============ */
.back{background:var(--cream);color:var(--ink)}
.back .bump{left:0;top:0}
/* a column of lines, each as wide as its own text, so the safe-area check sees the shape the bump has */
.back .rate{display:flex;flex-direction:column;align-items:center;color:#fff;text-align:center;line-height:1}
.back .rate b{font-weight:800;font-size:10pt;line-height:.95;letter-spacing:-.01em}
.back .rate .stars{display:flex;justify-content:center;margin-top:1.8pt}
.back .rate .stars svg{width:6.4pt;height:6.4pt;fill:#fff}
.back .rate .on{font-weight:700;font-size:7pt;line-height:1;letter-spacing:.2em;text-transform:uppercase;margin-top:1.8pt;color:rgba(255,255,255,.9)}
.back .k{font-family:'Barlow Condensed';font-weight:700;font-size:8pt;letter-spacing:.16em;text-transform:uppercase;color:var(--red);line-height:1}
.back .phone{font-weight:800;font-size:16pt;letter-spacing:-.015em;line-height:1;margin-top:3pt;white-space:nowrap}
.back .area{margin-top:5pt}
/* Mikey's layout (2026-10-01): his name and "Owner", then "Call or text", then the number */
.back .who{display:flex;align-items:baseline;gap:5pt;white-space:nowrap;margin-bottom:3pt}
.back .who b{font-weight:800;font-size:11pt;letter-spacing:-.01em;line-height:1}
/* alphabetical, down the columns, so a stranger finds their town the way they'd find it in any list */
.back .towns{display:grid;grid-auto-flow:column;grid-template-rows:repeat(4,auto);column-gap:9pt;row-gap:.6pt;justify-content:start;
  margin-top:3pt;font-size:7.5pt;line-height:1;font-weight:500;color:#2b2825;white-space:nowrap}
.back .qr{background:#fff;border-radius:3pt;box-shadow:0 0 0 .6pt var(--line)}
.back .qr svg{display:block;width:100%;height:100%}
.back .qcap{text-align:center;line-height:1}
.back .qcap b{display:block;font-weight:800;font-size:8pt}
.back .qcap span{display:block;font-weight:600;font-size:7.5pt;color:var(--sub);margin-top:1pt}
`;
}

(async () => {
  for (const d of ['print-files/3.5x2']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
  const truckMeta = await sharp(path.join(BRAND, 'source', 'truck-cutout.png')).metadata();
  const truckH = TRUCK.w * truckMeta.height / truckMeta.width;

  console.log('building the cut line');
  const dieF = await buildDie(truckH);
  const dieB = flipX(dieF);
  const dF = await trace(await maskPng(dieF));
  const dB = await trace(await maskPng(dieB));
  const safeF = erode(dieF, px(SAFE)), safeB = flipX(safeF);

  // The back's truck bump is solid red: everything above the body's top edge,
  // grown into the bleed so a drifting cut still lands on red. Below that
  // edge, cream to the bleed for the same reason.
  // Only the bump itself grows into the bleed: growing the whole die would lay
  // a red strip above the body's top edge that a high cut leaves as a sliver.
  const bumpOnly = new Uint8Array(MW * MH);
  for (let y = 0; y < px(BLEED + BODY_TOP - 0.01); y++) for (let x = 0; x < MW; x++) bumpOnly[y * MW + x] = dieB[y * MW + x];
  const bumpB = dilate(bumpOnly, px(BLEED));
  for (let y = px(BLEED + BODY_TOP); y < MH; y++) for (let x = 0; x < MW; x++) bumpB[y * MW + x] = 0;
  const bumpPng = await sharp(await maskPng(bumpB, [227, 25, 36], [246, 242, 234])).png().toBuffer();
  let bx0 = MW, bx1 = 0;
  for (let y = 0; y < px(BLEED + BODY_TOP - 0.05); y++) for (let x = 0; x < MW; x++) if (dieB[y * MW + x]) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); }
  const bumpL = bx0 / DPI, bumpW = (bx1 - bx0) / DPI;

  const qr = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const qrN = QRCode.create(QR_URL, { errorCorrectionLevel: 'M' }).modules.size;
  const qrMod = QR_IN / qrN, qrPad = QR_QUIET * qrMod, qrBox = QR_IN + 2 * qrPad;
  console.log(`  QR: ${qrN} x ${qrN} squares, ${(qrMod * 25.4).toFixed(2)} mm each, ${QR_IN} in code + ${QR_QUIET}-square margin = ${qrBox.toFixed(3)} in box`);
  const truckUrl = fileUrl(path.join(BRAND, 'source', 'truck-cutout.png'));
  const wordUrl = fileUrl(path.join(BRAND, 'transparent-png', 'wordmark-dark.png'));
  const bumpUrl = 'data:image/png;base64,' + bumpPng.toString('base64');

  // Back layout, in page inches. The bump is at the top right after the flip,
  // and the QR sits under it, as high and as far right as the safe area allows.
  const qrL = BLEED + W - SAFE - 0.02 - qrBox, qrT = BLEED + BODY_TOP + SAFE + 0.005;
  const B = { left: BLEED + 0.16, top: BLEED + BODY_TOP + SAFE + 0.005 };
  B.colW = qrL - 0.14 - B.left;

  const front = `<div class="page front" id="front">
  <div class="layer glow"></div>
  <img class="abs truck" src="${truckUrl}">
  <div class="abs rule"></div>
  <div class="abs come txt"><div class="hand"><u>I come to you.</u></div><div class="where">Snohomish County, WA</div></div>
  <div class="abs rcol">
    <img class="word txt" src="${wordUrl}">
    <div class="lbl txt">Text or call</div>
    <div class="phone txt">${PHONE}</div>
    <div class="site txt">${SITE}</div>
  </div>
</div>`;

  const back = `<div class="page back" id="back">
  <img class="layer bump" src="${bumpUrl}">
  <div class="abs rate" style="left:${bumpL + bumpW / 2}in;transform:translateX(-50%);width:max-content;top:${BLEED + 0.135}in">
    <b class="txt rl">5.0</b><span class="stars txt rl">${star.repeat(5)}</span><span class="on txt rl">on Google</span></div>
  <div class="abs txt" style="left:${B.left}in;top:${B.top}in;width:${B.colW}in">
    <div class="who"><b>${OWNER}</b><span class="k">Owner</span></div>
    <div class="k">Call or text</div>
    <div class="phone">${PHONE}</div>
    <div class="k area">I come to you in</div>
    <div class="towns">${[...TOWNS].sort().map(t => `<span>${t}</span>`).join('')}</div>
  </div>
  <div class="abs qr txt" style="left:${qrL}in;top:${qrT}in;width:${qrBox}in;height:${qrBox}in;padding:${qrPad}in">${qr}</div>
  <div class="abs qcap txt" style="left:${qrL}in;width:${qrBox}in;top:${qrT + qrBox + 0.03}in">
    <b>See your price</b><span>in 60 seconds</span></div>
</div>`;

  const htmlFor = (inner, dieD) => `<!doctype html><html><head><meta charset="utf-8"><style>${css()}</style></head><body>
${inner}${dieD ? `<div class="die">${dieSvg(dieD)}</div>` : ''}</body></html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: DPI / 96, viewport: { width: Math.ceil(PW * 96), height: Math.ceil(PH * 96) } });
  const tmp = path.join(OUT, '.render.html');
  const problems = [];
  const files = path.join(OUT, 'print-files', '3.5x2');

  for (const [name, inner, safe, dieD] of [['front', front, safeF, dF], ['back', back, safeB, dB]]) {
    fs.writeFileSync(tmp, htmlFor(inner));
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));

    // Copy rules, same list the sign and hanger enforce, minus prices (none here).
    const text = await page.evaluate(() => document.body.innerText);
    const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
      [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$\d/, 'a price (500 cards cannot follow a price change)'],
      [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'], [/free\b|rain-ready|offer/i, 'an offer (the Rain-Ready offer ends Dec 31)'],
      [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/\b41\b/, 'the review count (it will grow; the card will not)']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`${name}: copy contains ${what}: "${text.match(re)[0]}"`);

    // Nothing spills out of its column, nothing is set under MIN_PT, and every
    // piece of type is inside the safe area.
    const rects = await page.evaluate(() => ({
      boxes: [...document.querySelectorAll('.txt')].map(e => { const r = e.getBoundingClientRect(); return { c: e.className, x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; }),
      over: [...document.querySelectorAll('.phone, .towns, .site, .who')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent),
      small: [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
        .map(e => ({ c: [...e.classList], t: e.textContent.trim().slice(0, 32), pt: parseFloat(getComputedStyle(e).fontSize) * 0.75 })),
    }));
    rects.over.forEach(t => problems.push(`${name}: runs past its column: "${t}"`));
    if (process.env.DEBUG_BOXES) rects.boxes.forEach(b => console.log(name, b.c, (b.x0/96-BLEED).toFixed(3), (b.y0/96-BLEED).toFixed(3), (b.x1/96-BLEED).toFixed(3), (b.y1/96-BLEED).toFixed(3)));
    for (const e of rects.small) if (e.pt < MIN_PT - 0.01 && !e.c.some(c => SMALL_OK[name].includes(c)))
      problems.push(`${name}: "${e.t}" is ${e.pt.toFixed(1)} pt, under the ${MIN_PT} pt floor`);
    // the rating is white on the red bump; below the body's top edge it is white on cream
    const rateBottom = Math.max(0, ...rects.boxes.filter(b => /\brl\b/.test(b.c)).map(b => b.y1));
    if (name === 'back' && !rateBottom) problems.push('back: the rating lines are missing');
    if (rateBottom / 96 > BLEED + BODY_TOP - 0.03) problems.push(`${name}: the rating runs below the bump onto the cream`);
    let outside = 0;
    for (const b of rects.boxes) {
      const s = DPI / 96;
      for (let y = Math.floor(b.y0 * s); y <= Math.ceil(b.y1 * s) && !outside; y += 4)
        for (let x = Math.floor(b.x0 * s); x <= Math.ceil(b.x1 * s); x += 4)
          if (!safe[Math.min(MH - 1, y) * MW + Math.min(MW - 1, x)]) {
            outside++;
            problems.push(`${name}: "${b.c}" reaches within ${SAFE} in of the cut (at ${(x / DPI - BLEED).toFixed(2)}, ${(y / DPI - BLEED).toFixed(2)} in from the top left of the trim)`);
            break;
          }
      outside = 0;
    }

    await page.pdf({ path: path.join(files, `${name}.pdf`), width: `${PW}in`, height: `${PH}in`, printBackground: true, preferCSSPageSize: true });
    const shot = await (await page.$('.page')).screenshot({ type: 'png' });

    if (name === 'back') {
      // the QR has to decode from the printed size, not just exist
      const { data, info } = await sharp(shot).resize({ width: Math.round(PW * 300) }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
      if (!code || code.data !== QR_URL) problems.push(`back: QR code does not decode to ${QR_URL}`);
      else console.log('  QR decodes:', code.data);
      // A rough stand-in for a phone in poor light: half the resolution and a
      // blur. Not a substitute for scanning the printed sample with real phones.
      const soft = await sharp(shot).resize({ width: Math.round(PW * 150) }).blur(0.8).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const code2 = jsQR(new Uint8ClampedArray(soft.data), soft.info.width, soft.info.height);
      if (!code2 || code2.data !== QR_URL) problems.push('back: QR code does not decode at 150 dpi with a blur');
      else console.log('  QR also decodes at 150 dpi, blurred');
    }

    // Preview: the card as it comes off the die, on transparent.
    const die = name === 'front' ? dieF : dieB;
    const rgb = await sharp(shot).resize(MW, MH).removeAlpha().raw().toBuffer();
    const rgba = Buffer.alloc(MW * MH * 4);
    for (let i = 0; i < MW * MH; i++) { rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2]; rgba[i * 4 + 3] = die[i] * 255; }
    const cut = await sharp(rgba, { raw: { width: MW, height: MH, channels: 4 } }).png().toBuffer();
    const b = px(BLEED);
    await sharp(cut).extract({ left: b, top: b, width: px(W), height: px(H) }).resize({ width: 1400 }).toFile(path.join(OUT, `preview-${name}.png`));
    // Proof with the cut line drawn on, for checking against the printer's proof.
    const base = await sharp(shot).resize(MW, MH).toBuffer();
    await sharp(await sharp(base).composite([{ input: Buffer.from(dieSvg(dieD, '#EC008C', 5, true)) }]).png().toBuffer())
      .resize({ width: 1400 }).toFile(path.join(OUT, `proof-${name}.png`));
  }

  // Cut lines: SVG per side (back is the mirror image) and a PDF of the front's.
  fs.writeFileSync(path.join(files, 'dieline-front.svg'), dieSvg(dF) + '\n');
  fs.writeFileSync(path.join(files, 'dieline-back.svg'), dieSvg(dB) + '\n');
  fs.writeFileSync(tmp, `<!doctype html><html><head><style>@page{size:${PW}in ${PH}in;margin:0}*{margin:0}html,body{width:${PW}in;height:${PH}in;overflow:hidden}svg{display:block}</style></head><body>${dieSvg(dF)}</body></html>`);
  await page.goto(fileUrl(tmp));
  await page.pdf({ path: path.join(files, 'dieline.pdf'), width: `${PW}in`, height: `${PH}in`, preferCSSPageSize: true });

  // Mockup: both sides on a table, tilted a touch, with a shadow.
  const side = async n => sharp(path.join(OUT, `preview-${n}.png`)).resize({ width: 820 }).toBuffer();
  const shadow = async buf => {
    const m = await sharp(buf).metadata();
    const a = await sharp(buf).extractChannel(3).toBuffer();
    return sharp({ create: { width: m.width, height: m.height, channels: 3, background: '#000' } })
      .joinChannel(await sharp(a).linear(0.45, 0).toBuffer()).png().blur(14).toBuffer();
  };
  const fr = await sharp(await side('front')).rotate(-4, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const bk = await sharp(await side('back')).rotate(3, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: 1900, height: 760, channels: 3, background: '#c9c3b8' } })
    .composite([
      { input: await shadow(fr), left: 92, top: 112 }, { input: fr, left: 70, top: 90 },
      { input: await shadow(bk), left: 1012, top: 122 }, { input: bk, left: 990, top: 100 },
    ]).png().toFile(path.join(OUT, 'mockup.png'));
  console.log('wrote', path.relative(ROOT, OUT) + '/{preview,proof}-{front,back}.png, mockup.png, print-files/3.5x2/*');

  await browser.close();
  fs.unlinkSync(tmp);
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }
  else console.log(`  checks ok: copy rules, nothing spills its column, type ${MIN_PT} pt or more (front labels excepted), type inside the safe area, QR`);
})().catch(e => { console.error(e); process.exit(1); });
