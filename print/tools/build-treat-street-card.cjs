// Renders the Treat Street business card: a plain 3.5 x 2 in rectangle for the
// UPS Store, handed out at one event (Treat Street, Sat Oct 24, 2026, 4 to 7
// PM, Evergreen Speedway, Monroe).
//
//   cd print/tools && npm install && npm run treat
//
// Output lands in print/treat-street-card/: print-files/front.pdf and
// back.pdf (3.75 x 2.25 in, trim plus 0.125 in bleed), preview PNGs and a
// mockup. Read print/treat-street-card/README.md before changing copy. It is
// one more copy of the facts table in CLAUDE.md.
//
// Mikey asked (2026-10-15) for a clean, professional card that isn't a rehash
// of the others, with one hint that it came from Treat Street. So: the front
// is his own work (a black hood he detailed, reflecting the trees), the logo
// and one line. The back is the contact block and the QR. The one Treat
// Street touch is the orange line at the bottom of the back.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'treat-street-card');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
// From Mikey's shared album, cleared for posting (CLAUDE.md, Instagram and
// Facebook posts). Cropped to the hood: no plate, no badge, no faces.
const PHOTO = path.join(ROOT, 'social', 'photos', 'mach-e-black.jpg');
const PHOTO_CROP = { left: 160, top: 70, width: 1240, height: 330 };
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts, from the CLAUDE.md facts table. ----
const OWNER = 'Mikey Miller';
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';
// Its own utm_source, so a booking from this card shows up apart from the
// hangers, postcards, signs and the everyday card ("treatstreet / event").
const QR_URL = 'https://mikeysdetailing.com/?utm_source=treatstreet&utm_medium=event#booking';
// The Treat Street line is the Rain-Ready offer on the hangers' terms (CLAUDE.md,
// Offers and countdowns): the same three extras, the same Dec 31 booking date.
// Don't widen it, extend it or swap the extras without Mikey.
const RR_LAST_DAY = new Date('2027-01-01T00:00:00-08:00');

// ---- Geometry, inches. Trim 3.5 x 2, y runs down from its top. ----
const W = 3.5, H = 2, BLEED = 0.125, SAFE = 0.15;
const PW = W + 2 * BLEED, PH = H + 2 * BLEED;
const DPI = 600;
const MIN_PT = 7;                       // printers' floor (print/business-card/RESEARCH.md)
const QR_IN = 0.8, QR_QUIET = 4;        // Vistaprint's floor; the QR standard's margin
const BAND = 1.02;                      // photo band height from the top of the trim

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const css = () => `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
@page{size:${PW}in ${PH}in;margin:0}
:root{--ink:#111113;--red:#E31924;--pump:#E8761A;--paper:#FAFAF8;--sub:#6b6b70;--hair:#d9d9dc}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:${PW}in;height:${PH}in;overflow:hidden}
.abs{position:absolute}

/* ============ FRONT: his work, the logo, one line ============ */
.front{background:var(--ink);color:#fff}
.front .photo{left:0;top:0;width:${PW}in;height:${BLEED + BAND}in;background-size:cover;background-position:center}
.front .fade{left:0;top:0;width:${PW}in;height:${BLEED + BAND + 0.02}in;
  background:linear-gradient(to bottom,rgba(17,17,19,0) 45%,rgba(17,17,19,.65) 78%,var(--ink) 100%)}
.front .word{left:${BLEED + SAFE}in;top:${BLEED + BAND + 0.08}in;width:1.62in}
.front .line{right:${BLEED + SAFE}in;top:${BLEED + BAND + 0.2}in;text-align:right;line-height:1}
.front .line b{display:block;font-weight:600;font-size:9pt;letter-spacing:.01em}
.front .line span{display:block;font-weight:500;font-size:7pt;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-top:4pt}

/* ============ BACK: who, how to reach him, the QR ============ */
.back{background:var(--paper);color:var(--ink)}
.back .who{left:${BLEED + SAFE}in;top:${BLEED + SAFE + 0.02}in;line-height:1}
.back .who b{display:block;font-weight:800;font-size:13pt;letter-spacing:-.01em}
.back .who span{display:block;font-weight:500;font-size:7.5pt;color:var(--sub);margin-top:3pt}
.back .rule{left:${BLEED + SAFE}in;top:${BLEED + 0.66}in;width:.32in;height:1.4pt;background:var(--red)}
.back .contact{left:${BLEED + SAFE}in;top:${BLEED + 0.8}in;line-height:1}
.back .contact .k{font-weight:600;font-size:7pt;letter-spacing:.16em;text-transform:uppercase;color:var(--sub)}
.back .contact .phone{font-weight:700;font-size:12.5pt;margin-top:2.5pt;white-space:nowrap}
.back .contact .site{font-weight:500;font-size:8pt;margin-top:4pt}
.back .qr{background:#fff;box-shadow:0 0 0 .5pt var(--hair)}
.back .qr svg{display:block;width:100%;height:100%}
.back .qcap{text-align:center;line-height:1.15;font-size:7pt;font-weight:600;color:var(--sub)}
.back .qcap b{color:var(--ink);font-weight:700}
.back .ts{left:${BLEED + SAFE}in;width:${W - 2 * SAFE}in;bottom:${BLEED + SAFE - 0.02}in;
  border-top:.6pt solid var(--hair);padding-top:4pt;font-size:7pt;font-weight:500;line-height:1.3;color:var(--sub)}
.back .ts b{color:var(--pump);font-weight:700}
`;

(async () => {
  if (Date.now() >= RR_LAST_DAY.getTime()) throw new Error('the Rain-Ready offer ended December 31, 2026; this card is for Treat Street 2026 only');
  fs.mkdirSync(path.join(OUT, 'print-files'), { recursive: true });

  // The photo: cropped to the reflection in the hood, in black and white with
  // the contrast up, so it reads as gloss and the red logo is the only colour.
  const bandPx = { w: Math.round(PW * 300), h: Math.round((BLEED + BAND) * 300) };
  const photo = await sharp(PHOTO).extract(PHOTO_CROP).resize(bandPx.w, bandPx.h, { fit: 'cover', position: 'top' })
    .greyscale().linear(1.35, -38).modulate({ brightness: 0.9 }).jpeg({ quality: 92 }).toBuffer();
  const photoUrl = 'data:image/jpeg;base64,' + photo.toString('base64');
  const srcDpi = PHOTO_CROP.width / PW;
  console.log(`  photo: ${PHOTO_CROP.width} px across ${PW} in = ${Math.round(srcDpi)} dpi from the original`);

  const qr = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#111113', light: '#ffffff' } });
  const qrN = QRCode.create(QR_URL, { errorCorrectionLevel: 'M' }).modules.size;
  const qrMod = QR_IN / qrN, qrPad = QR_QUIET * qrMod, qrBox = QR_IN + 2 * qrPad;
  const qrL = BLEED + W - SAFE - qrBox, qrT = BLEED + SAFE - 0.02;

  const front = `<div class="page front">
  <div class="abs photo" style="background-image:url(${photoUrl})"></div>
  <div class="abs fade"></div>
  <img class="abs word txt" src="${fileUrl(path.join(BRAND, 'transparent-png', 'wordmark-dark.png'))}">
  <div class="abs line txt"><b>I come to your driveway.</b><span>Snohomish, WA</span></div>
</div>`;

  const back = `<div class="page back">
  <div class="abs who txt"><b>${OWNER}</b><span>Owner, Mikey's Mobile Detailing</span></div>
  <div class="abs rule"></div>
  <div class="abs contact txt">
    <div class="k">Call or text</div>
    <div class="phone">${PHONE}</div>
    <div class="site">${SITE}</div>
  </div>
  <div class="abs qr txt" style="left:${qrL}in;top:${qrT}in;width:${qrBox}in;height:${qrBox}in;padding:${qrPad}in">${qr}</div>
  <div class="abs qcap txt" style="left:${qrL}in;width:${qrBox}in;top:${qrT + qrBox + 0.04}in"><b>Your price</b><br>in 60 seconds</div>
  <div class="abs ts txt"><b>From Treat Street?</b> Mention it when you book a Full Detail by Dec 31 and the polish, ceramic wax and RainX are free.</div>
</div>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: DPI / 96, viewport: { width: Math.ceil(PW * 96), height: Math.ceil(PH * 96) } });
  const tmp = path.join(OUT, '.render.html');
  const problems = [];
  const shots = {};

  for (const [name, inner] of [['front', front], ['back', back]]) {
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${css()}</style></head><body>${inner}</body></html>`);
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));

    // Copy rules, the same list the hanger and the everyday card enforce.
    const text = await page.evaluate(() => document.body.innerText);
    const banned = [[/—|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (he is neither)'],
      [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'],
      [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/deposit/i, 'a deposit'],
      [/seamless|elevate|unlock|transform|jaw-dropping/i, 'an agency word']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`${name}: copy contains ${what}: "${text.match(re)[0]}"`);
    if (name === 'back') for (const must of ['Dec 31', 'polish, ceramic wax and RainX', 'Treat Street', PHONE])
      if (!text.toLowerCase().includes(must.toLowerCase())) problems.push(`back: missing "${must}"`);

    // Type at MIN_PT or more, inside the safe area, nothing spilling, nothing overlapping.
    const m = await page.evaluate(() => ({
      boxes: [...document.querySelectorAll('.txt')].map(e => { const r = e.getBoundingClientRect(); return { c: e.className, x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; }),
      over: [...document.querySelectorAll('.txt, .txt *')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline').map(e => e.textContent.trim().slice(0, 40)),
      small: [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
        .map(e => ({ t: e.textContent.trim().slice(0, 32), pt: parseFloat(getComputedStyle(e).fontSize) * 0.75 })),
    }));
    m.over.forEach(t => problems.push(`${name}: runs past its box: "${t}"`));
    m.small.filter(e => e.pt < MIN_PT - 0.01).forEach(e => problems.push(`${name}: "${e.t}" is ${e.pt.toFixed(1)} pt, under ${MIN_PT} pt`));
    const lo = (BLEED + 0.125) * 96 - 0.5, hiX = (BLEED + W - 0.125) * 96 + 0.5, hiY = (BLEED + H - 0.125) * 96 + 0.5;
    m.boxes.forEach(b => { if (b.x0 < lo || b.y0 < lo || b.x1 > hiX || b.y1 > hiY) problems.push(`${name}: "${b.c}" reaches within 0.125 in of the trim`); });
    for (let i = 0; i < m.boxes.length; i++) for (let j = i + 1; j < m.boxes.length; j++) {
      const a = m.boxes[i], b = m.boxes[j];
      if (a.x0 < b.x1 - 1 && b.x0 < a.x1 - 1 && a.y0 < b.y1 - 1 && b.y0 < a.y1 - 1) problems.push(`${name}: "${a.c}" overlaps "${b.c}"`);
    }

    await page.pdf({ path: path.join(OUT, 'print-files', `${name}.pdf`), width: `${PW}in`, height: `${PH}in`, printBackground: true, preferCSSPageSize: true });
    shots[name] = await (await page.$('.page')).screenshot({ type: 'png' });

    if (name === 'back') {
      for (const [w, blur, label] of [[300, 0, '300 dpi'], [150, 0.8, '150 dpi with a blur']]) {
        let img = sharp(shots.back).resize({ width: Math.round(PW * w) });
        if (blur) img = img.blur(blur);
        const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
        if (!code || code.data !== QR_URL) problems.push(`back: QR does not decode at ${label}`);
        else console.log(`  QR decodes at ${label}: ${code.data}`);
      }
    }
  }
  await browser.close();
  fs.unlinkSync(tmp);

  // Previews at trim (what the cut card looks like) and a mockup of both sides.
  const b = Math.round(BLEED * DPI);
  for (const n of ['front', 'back']) {
    const full = await sharp(shots[n]).resize(Math.round(PW * DPI), Math.round(PH * DPI)).toBuffer();
    await sharp(full).extract({ left: b, top: b, width: Math.round(W * DPI), height: Math.round(H * DPI) }).resize({ width: 1400 }).png().toFile(path.join(OUT, `preview-${n}.png`));
  }
  const card = async n => {
    const img = await sharp(path.join(OUT, `preview-${n}.png`)).resize({ width: 820 }).toBuffer();
    const mask = Buffer.from(`<svg width="820" height="469"><rect width="820" height="469" rx="8" fill="#fff"/></svg>`);
    return sharp(img).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  };
  const shadow = Buffer.from(`<svg width="860" height="509"><filter id="b"><feGaussianBlur stdDeviation="10"/></filter><rect x="20" y="24" width="820" height="469" rx="8" fill="rgba(0,0,0,.28)" filter="url(#b)"/></svg>`);
  const fr = await card('front'), bk = await card('back');
  await sharp({ create: { width: 1900, height: 680, channels: 3, background: '#cfcac2' } })
    .composite([{ input: shadow, left: 50, top: 76 }, { input: fr, left: 70, top: 96 },
      { input: shadow, left: 990, top: 76 }, { input: bk, left: 1010, top: 96 }]).png().toFile(path.join(OUT, 'mockup.png'));
  console.log('wrote', path.relative(ROOT, OUT) + '/print-files/{front,back}.pdf, preview-{front,back}.png, mockup.png');

  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }
  else console.log(`  checks ok: copy rules, offer terms, type ${MIN_PT} pt or more, inside the safe area, no overlaps, QR`);
})().catch(e => { console.error(e); process.exit(1); });
