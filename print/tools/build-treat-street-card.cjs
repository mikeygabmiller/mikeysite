// Renders the Treat Street handout card: a plain 3.5 x 2 in rectangle for the
// UPS Store, one event only (Treat Street, Sat Oct 24, 2026, 4 to 7 PM,
// Evergreen Speedway, Monroe). Mikey won't use these after that night.
//
//   cd print/tools && npm install && npm run treat
//
// Output lands in print/treat-street-card/: print-files/front.pdf and
// back.pdf (3.75 x 2.25 in, trim plus 0.125 in bleed), preview PNGs and a
// mockup. Read print/treat-street-card/README.md before changing copy. It is
// one more copy of the facts table in CLAUDE.md.
//
// Why it differs from the die-cut card in print/business-card/: that one is
// kept for years, so it carries no prices and no offer. This one is handed to
// parents at a Halloween event and carries the Rain-Ready offer, which ends
// on the same day the card stops mattering (book by December 31, 2026). Same
// terms as the hangers and postcards, never wider.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'treat-street-card');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts, from the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';
// Its own utm_source, so a booking from this card shows up apart from the
// hangers, postcards, signs and the everyday card ("treatstreet / event").
const QR_URL = 'https://mikeysdetailing.com/?utm_source=treatstreet&utm_medium=event#booking';
// The Rain-Ready offer, word for word the hanger's terms (CLAUDE.md, Offers and
// countdowns). Don't widen it, extend it or swap the extras without Mikey.
const RR_BOOK_BY = 'December 31, 2026';
const RR_LAST_DAY = new Date('2027-01-01T00:00:00-08:00');

// ---- Geometry, inches. Trim 3.5 x 2, y runs down from its top. ----
const W = 3.5, H = 2, BLEED = 0.125, SAFE = 0.125;
const PW = W + 2 * BLEED, PH = H + 2 * BLEED;
const DPI = 600;
const MIN_PT = 7;                       // printers' floor (print/business-card/RESEARCH.md)
const QR_IN = 0.8, QR_QUIET = 4;        // Vistaprint's floor; the QR standard's margin

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const css = () => `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${[600, 700].map(w => fontFace('Barlow Condensed', 'barlow-condensed', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
@page{size:${PW}in ${PH}in;margin:0}
:root{--ink:#0e0e0f;--red:#E31924;--gold:#D2AE5E;--pump:#F28A1E;--cream:#F6F2EA;--line:#CFC6B5;--sub:#55504a}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:${PW}in;height:${PH}in;overflow:hidden}
.abs{position:absolute}
.layer{position:absolute;left:0;top:0;width:${PW}in;height:${PH}in}

/* ============ FRONT: black, the brand red, one pumpkin-orange accent ============ */
.front{background:var(--ink);color:#fff}
.front .glow{background:radial-gradient(55% 70% at 22% 45%,rgba(227,25,36,.30),transparent 70%),
  radial-gradient(45% 55% at 100% 100%,rgba(242,138,30,.16),transparent 70%)}
.front .truck{left:${BLEED + 0.1}in;top:${BLEED + 0.14}in;width:1.5in}
.front .thanks{left:${BLEED + SAFE}in;width:1.45in;top:${BLEED + 1.38}in;text-align:center;
  font-family:'Barlow Condensed';font-weight:700;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:var(--pump);line-height:1.15}
.front .rcol{left:${BLEED + 1.72}in;width:1.66in;top:${BLEED + SAFE + 0.02}in;text-align:center}
.front .word{display:block;width:100%}
.front .hook{font-family:'Caveat';font-weight:700;font-size:13.5pt;line-height:.98;margin-top:5pt}
.front .hook u{text-decoration:none;background:linear-gradient(transparent 72%,rgba(227,25,36,.95) 72%,rgba(227,25,36,.95) 90%,transparent 90%)}
.front .lbl{font-weight:700;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-top:6pt;line-height:1}
.front .phone{font-weight:800;font-size:15pt;letter-spacing:-.01em;line-height:1;margin-top:2pt;white-space:nowrap}
.front .site{font-weight:600;font-size:7.5pt;color:rgba(255,255,255,.82);margin-top:3pt;line-height:1}

/* ============ BACK: cream, the offer and the QR ============ */
.back{background:var(--cream);color:var(--ink)}
.back .offer{left:${BLEED + SAFE}in;top:${BLEED + SAFE}in;width:2.08in}
.back .when{font-family:'Barlow Condensed';font-weight:700;font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:var(--red);line-height:1}
.back .name{font-weight:800;font-size:12pt;line-height:1;margin-top:2pt;letter-spacing:-.01em;white-space:nowrap}
.back .name em{font-style:normal;color:var(--red)}
.back ul{list-style:none;margin-top:4pt;border-top:.6pt solid var(--line)}
.back li{display:flex;justify-content:space-between;align-items:baseline;font-size:8pt;font-weight:600;line-height:1;padding:2.2pt 0;border-bottom:.6pt solid var(--line)}
.back li i{font-style:normal;font-weight:800;color:var(--red)}
.back .sum{display:flex;justify-content:space-between;align-items:baseline;margin-top:3.5pt;line-height:1}
.back .sum span{font-size:8pt;font-weight:600;color:var(--sub)}
.back .sum b{font-size:11pt;font-weight:800}
.back .code{margin-top:3.5pt;font-family:'Caveat';font-weight:700;font-size:11pt;line-height:1;color:var(--ink)}
.back .qr{background:#fff;border-radius:3pt;box-shadow:0 0 0 .6pt var(--line)}
.back .qr svg{display:block;width:100%;height:100%}
.back .qcap{text-align:center;line-height:1}
.back .qcap b{display:block;font-weight:800;font-size:8pt}
.back .qcap span{display:block;font-weight:600;font-size:7.5pt;color:var(--sub);margin-top:1pt}
.back .bar{left:0;top:${BLEED + 1.52}in;width:${PW}in;height:${PH - BLEED - 1.52}in;background:var(--ink)}
.back .barin{left:${BLEED + SAFE}in;width:${W - 2 * SAFE}in;top:${BLEED + 1.52 + 0.06}in;display:flex;justify-content:space-between;align-items:center;color:#fff;white-space:nowrap}
.back .barin .k{font-weight:700;font-size:7pt;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);line-height:1}
.back .barin .phone{font-weight:800;font-size:12.5pt;line-height:1;margin-top:1.5pt}
.back .barin .towns{text-align:right;font-size:7pt;font-weight:600;line-height:1.2;color:rgba(255,255,255,.85)}
`;

(async () => {
  if (Date.now() >= RR_LAST_DAY.getTime()) throw new Error(`the Rain-Ready offer ended ${RR_BOOK_BY}; this card is for Treat Street 2026 only`);
  fs.mkdirSync(path.join(OUT, 'print-files'), { recursive: true });

  const qr = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const qrN = QRCode.create(QR_URL, { errorCorrectionLevel: 'M' }).modules.size;
  const qrMod = QR_IN / qrN, qrPad = QR_QUIET * qrMod, qrBox = QR_IN + 2 * qrPad;
  const qrL = BLEED + W - SAFE - qrBox, qrT = BLEED + SAFE;

  const front = `<div class="page front">
  <div class="layer glow"></div>
  <img class="abs truck" src="${fileUrl(path.join(BRAND, 'source', 'truck-cutout.png'))}">
  <div class="abs thanks txt">Thanks for stopping by<br>my booth at Treat Street</div>
  <div class="abs rcol">
    <img class="word txt" src="${fileUrl(path.join(BRAND, 'transparent-png', 'wordmark-dark.png'))}">
    <div class="hook txt">Candy in the car seat?<br><u>I get it out.</u></div>
    <div class="lbl txt">Text or call</div>
    <div class="phone txt">${PHONE}</div>
    <div class="site txt">${SITE}</div>
  </div>
</div>`;

  const back = `<div class="page back">
  <div class="abs offer txt">
    <div class="when">Book by Dec 31</div>
    <div class="name">Rain-Ready <em>Full Detail</em></div>
    <ul>
      <li><span>Exterior polish</span><i>Free</i></li>
      <li><span>Ceramic wax</span><i>Free</i></li>
      <li><span>RainX on the glass</span><i>Free</i></li>
    </ul>
    <div class="sum"><span>Worth $508</span><b>from $369</b></div>
    <div class="code">Mention Treat Street when you book.</div>
  </div>
  <div class="abs qr txt" style="left:${qrL}in;top:${qrT}in;width:${qrBox}in;height:${qrBox}in;padding:${qrPad}in">${qr}</div>
  <div class="abs qcap txt" style="left:${qrL}in;width:${qrBox}in;top:${qrT + qrBox + 0.05}in"><b>See your price</b><span>in 60 seconds</span></div>
  <div class="abs bar"></div>
  <div class="abs barin txt">
    <div><div class="k">Text or call</div><div class="phone">${PHONE}</div></div>
    <div class="towns">I come to your driveway in Monroe,<br>Snohomish, Everett and 9 more towns</div>
  </div>
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

    // Copy rules, the same list the hanger and the everyday card enforce. Prices
    // and the offer are allowed here (see the top of the file); nothing else is.
    const text = await page.evaluate(() => document.body.innerText);
    const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (he is neither)'],
      [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'],
      [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/deposit/i, 'a deposit'],
      [/seamless|elevate|unlock|transform|jaw-dropping/i, 'an agency word']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`${name}: copy contains ${what}: "${text.match(re)[0]}"`);
    if (name === 'back') for (const must of ['$508', '$369', 'Dec 31', 'Mention Treat Street', PHONE])
      if (!text.toLowerCase().includes(must.toLowerCase())) problems.push(`back: missing "${must}"`);

    // Type at MIN_PT or more, inside the safe area, and nothing spilling its box.
    const m = await page.evaluate(() => ({
      boxes: [...document.querySelectorAll('.txt')].map(e => { const r = e.getBoundingClientRect(); return { c: e.className, x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; }),
      over: [...document.querySelectorAll('.txt, .txt *')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline').map(e => e.textContent.trim().slice(0, 40)),
      small: [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
        .map(e => ({ t: e.textContent.trim().slice(0, 32), pt: parseFloat(getComputedStyle(e).fontSize) * 0.75 })),
    }));
    m.over.forEach(t => problems.push(`${name}: runs past its box: "${t}"`));
    m.small.filter(e => e.pt < MIN_PT - 0.01).forEach(e => problems.push(`${name}: "${e.t}" is ${e.pt.toFixed(1)} pt, under ${MIN_PT} pt`));
    const lo = (BLEED + SAFE) * 96 - 0.5, hiX = (BLEED + W - SAFE) * 96 + 0.5, hiY = (BLEED + H - SAFE) * 96 + 0.5;
    m.boxes.forEach(b => { if (b.x0 < lo || b.y0 < lo || b.x1 > hiX || b.y1 > hiY) problems.push(`${name}: "${b.c}" reaches within ${SAFE} in of the trim`); });
    // the back's offer block must clear the QR and sit above the black bar
    if (name === 'back') {
      const off = m.boxes.find(b => /offer/.test(b.c)), q = m.boxes.find(b => /\bqr\b/.test(b.c)), cap = m.boxes.find(b => /qcap/.test(b.c));
      if (off.x1 > q.x0 - 6) problems.push('back: the offer runs into the QR');
      if (Math.max(off.y1, cap.y1) > (BLEED + 1.52) * 96 - 2) problems.push('back: the offer or the QR caption runs into the black bar');
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
    const mask = Buffer.from(`<svg width="820" height="469"><rect width="820" height="469" rx="10" fill="#fff"/></svg>`);
    return sharp(img).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  };
  const fr = await sharp(await card('front')).rotate(-4, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const bk = await sharp(await card('back')).rotate(3, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: 1900, height: 700, channels: 3, background: '#c9c3b8' } })
    .composite([{ input: fr, left: 70, top: 90 }, { input: bk, left: 990, top: 100 }]).png().toFile(path.join(OUT, 'mockup.png'));
  console.log('wrote', path.relative(ROOT, OUT) + '/print-files/{front,back}.pdf, preview-{front,back}.png, mockup.png');

  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }
  else console.log(`  checks ok: copy rules, offer terms, type ${MIN_PT} pt or more, inside the ${SAFE} in safe area, QR`);
})().catch(e => { console.error(e); process.exit(1); });
