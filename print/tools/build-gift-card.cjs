// Renders the printed gift card: a 5 x 7 in card that goes in an envelope, and
// a letter sheet of two to print at home or at a UPS Store on cardstock.
//
//   cd print/tools && npm install && npm run gift
//
// Output lands in print/gift-card/:
//   print-files/5x7/front.pdf, back.pdf   one side each, trim + 0.125 in bleed,
//                                         for a printer's 5x7 flat card
//   print-files/letter/two-up.pdf         two finished backs on one 11 x 8.5
//                                         sheet with crop marks; the back is
//                                         the whole card on its own (logo,
//                                         blanks, how to use it, the terms)
//   preview-front.png, preview-back.png, preview-two-up.png, mockup.png
//
// Read print/gift-card/README.md before changing copy. A gift card is one more
// copy of the facts table in CLAUDE.md (the phone, first person, the twelve
// towns, spigot and outlet), and the terms on it are Washington law, not a
// style choice: RCW 19.240.020 bans expiration dates, fees and dormancy
// charges, keeps the unused value on the card, and makes a balance under $5
// cash on request.
//
// What it does NOT carry, on purpose:
//   - a price list: the card is kept for months and prices move (PRICING.md)
//   - the Rain-Ready offer: that's a promise with an end date, the card is not
//   - a review count, "insured", Lynnwood or Edmonds (CLAUDE.md)
//   - a printed card number: each card's number comes from the dashboard
//     (Get Paid → Sell a gift card) and is written in by hand, so the dashboard
//     is the one place a balance lives. A pre-numbered card would be a second
//     ledger.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'gift-card');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';
// Its own utm_source so a scan from a gift card is told apart from hangers,
// postcards, cards and signs (dashboard: Insights, journeys tagged giftcard).
const QR_URL = 'https://mikeysdetailing.com/?utm_source=giftcard&utm_medium=print#booking';
const TOWNS = ['Snohomish', 'Lake Stevens', 'Everett', 'Monroe', 'Mill Creek', 'Marysville',
  'Bothell', 'Duvall', 'Mukilteo', 'Woodinville', 'Granite Falls', 'Arlington'];

// ---- Geometry, inches. ----
const W = 5, H = 7, BLEED = 0.125, SAFE = 0.25;
const PW = W + 2 * BLEED, PH = H + 2 * BLEED;
const DPI = 300;
const RED = '#E31924', INK = '#141418', CREAM = '#FBF8F1', BLACK = '#0E0E10';
const QR_IN = 0.88, QR_QUIET = 4;
const MIN_PT = 7;                      // the printers' floor for type (business-card/RESEARCH.md)

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const CSS = (qrBox, qrPad) => `
${fontFace('Barlow Condensed', 'barlow-condensed', 600)}
${fontFace('Barlow Condensed', 'barlow-condensed', 800)}
${fontFace('Racing Sans One', 'racing-sans-one', 400)}
${fontFace('Inter', 'inter', 400)}
${fontFace('Inter', 'inter', 600)}
${fontFace('Inter', 'inter', 800)}
${fontFace('Caveat', 'caveat', 700)}
@page{margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
.page{position:relative;width:${PW}in;height:${PH}in;overflow:hidden}
.front{background:${BLACK};color:#fff}
.back{background:${CREAM};color:${INK}}
.abs{position:absolute}
.safe{position:absolute;left:${BLEED + SAFE}in;right:${BLEED + SAFE}in;top:${BLEED + SAFE}in;bottom:${BLEED + SAFE}in;display:flex;flex-direction:column;align-items:center}

/* front */
.front .glow{position:absolute;inset:0;background:radial-gradient(3.4in 2.6in at 50% 36%,rgba(227,25,36,.28),rgba(227,25,36,0) 70%)}
.front .frame{position:absolute;left:${BLEED + 0.18}in;right:${BLEED + 0.18}in;top:${BLEED + 0.18}in;bottom:${BLEED + 0.18}in;border:1.5px solid rgba(227,25,36,.75);border-radius:.14in}
.front .frame:after{content:"";position:absolute;inset:.06in;border:1px dashed rgba(255,255,255,.18);border-radius:.1in}
.front .logo{width:3.7in;margin-top:.55in}
.front .kind{font:800 .62in/1 'Barlow Condensed';letter-spacing:.09em;margin-top:.42in;color:#fff}
.front .rule{width:1.5in;height:3px;background:${RED};margin:.18in 0}
.front .line{font:700 .36in/1.05 'Caveat';color:#f4f4f6;text-align:center}
.front .foot{position:absolute;left:0;right:0;bottom:${BLEED + 0.42}in;text-align:center;font:600 9pt/1.2 'Inter';letter-spacing:.08em;color:rgba(255,255,255,.72);text-transform:uppercase}

/* back */
.back .border{position:absolute;left:${BLEED + 0.14}in;right:${BLEED + 0.14}in;top:${BLEED + 0.14}in;bottom:${BLEED + 0.14}in;border:1.5px solid ${RED};border-radius:.14in}
.back .border:after{content:"";position:absolute;inset:.06in;border:1px dashed rgba(227,25,36,.35);border-radius:.1in}
.back .logo{width:2.55in;margin-top:.12in}
.back .kind{font:800 10pt/1 'Inter';letter-spacing:.32em;color:${RED};margin-top:.06in;text-transform:uppercase;padding-left:.32em}
.fields{width:100%;margin-top:.26in;display:flex;flex-direction:column;gap:.18in;padding:0 .12in}
.f{display:flex;align-items:flex-end;gap:.1in}
.f .l{font:800 8pt/1 'Inter';letter-spacing:.16em;text-transform:uppercase;color:#6b6d75;flex:none;width:.95in}
.f .u{flex:1;border-bottom:1.3px solid ${INK};height:.3in}
.f .u.amt{position:relative}
.f .u.amt:before{content:"$";position:absolute;left:0;bottom:.03in;font:800 15pt/1 'Inter'}
.f .boxes{display:flex;gap:.045in;align-items:center}
.f .boxes i{display:block;width:.27in;height:.34in;border:1.3px solid ${INK};border-radius:.04in;background:#fff}
.f .boxes b{font:800 14pt/1 'Inter';margin:0 .03in}
.how{margin-top:.26in;padding:0 .12in;font:400 10pt/1.42 'Inter';color:#2c2e35;align-self:stretch}
.how b{font-weight:800;color:${INK}}
.row{display:flex;gap:.2in;align-items:center;align-self:stretch;margin-top:.2in;padding:0 .12in}
.towns{flex:1;font:400 8.7pt/1.42 'Inter';color:#3d3f47}
.towns b{display:block;font:800 8pt/1 'Inter';letter-spacing:.14em;text-transform:uppercase;color:#6b6d75;margin-bottom:.05in}
.qr{flex:none;width:${qrBox}in;text-align:center}
.qr .code{width:${qrBox}in;height:${qrBox}in;background:#fff;padding:${qrPad}in;border-radius:.04in}
.qr .code svg{display:block;width:100%;height:100%}
.qr .cap{font:600 7.4pt/1.25 'Inter';color:#4a4c54;margin-top:.04in}
.terms{margin-top:auto;padding:0 .12in .02in;font:400 7.4pt/1.42 'Inter';color:#6b6d75;align-self:stretch}

/* letter sheet: two backs, landscape, with crop marks */
.sheet{position:relative;width:11in;height:8.5in;background:#fff;overflow:hidden}
.sheet .slot{position:absolute;top:${(8.5 - H) / 2 - BLEED}in;width:${PW}in;height:${PH}in;overflow:hidden}
.sheet .slot .page{transform-origin:0 0}
.crop{position:absolute;background:#000}
`;

const front = () => `<div class="page front" id="front">
  <div class="glow"></div><div class="frame"></div>
  <div class="safe">
    <img class="logo" src="${fileUrl(path.join(BRAND, 'transparent-png', 'stacked-dark.png'))}">
    <div class="kind">GIFT CARD</div>
    <div class="rule"></div>
    <div class="line">Somebody's getting a clean car.</div>
  </div>
  <div class="foot">I come to you · Snohomish County</div>
</div>`;

const back = (qrSvg, id) => `<div class="page back" id="${id}">
  <div class="border"></div>
  <div class="safe">
    <img class="logo" src="${fileUrl(path.join(BRAND, 'transparent-png', 'horizontal-light.png'))}">
    <div class="kind">Gift Card</div>
    <div class="fields">
      <div class="f"><span class="l">For</span><span class="u"></span></div>
      <div class="f"><span class="l">From</span><span class="u"></span></div>
      <div class="f"><span class="l">Amount</span><span class="u amt"></span></div>
      <div class="f"><span class="l">Card number</span><span class="boxes"><i></i><i></i><i></i><i></i><b>-</b><i></i><i></i><i></i><i></i></span></div>
    </div>
    <div class="how"><b>To use it:</b> text me at <b>${PHONE}</b> with the card number and we'll find a day. I come to your driveway; all I need is an outdoor spigot and a power outlet. When the job's done, the card comes off the price. Good toward any detail I do: interior, exterior, full detail, ceramic coating or paint correction.</div>
    <div class="row">
      <div class="towns"><b>Where I come to</b>${TOWNS.map((t) => t.replace(/ /g, '\u00a0')).join(' · ')}</div>
      <div class="qr"><div class="code">${qrSvg}</div><div class="cap">What each detail includes</div></div>
    </div>
    <div class="terms">Never expires. No fees. If the job costs less than the card, the rest stays on it for next time, and anything under $5 is yours in cash if you'd rather. Lost it? Text me; I keep a record of every card. Mikey's Mobile Detailing · ${SITE}</div>
  </div>
</div>`;

// Two backs side by side on landscape letter, centred, with crop marks in the
// margins only, so a trim on the marks gives two clean 5 x 7 cards.
const twoUp = (qrSvg) => {
  const gap = 0.5, left = (11 - (2 * W + gap)) / 2, top = (8.5 - H) / 2;
  const xs = [left, left + W, left + W + gap, left + 2 * W + gap], ys = [top, top + H];
  const L = 0.3, off = 0.08, T = 0.01;
  let marks = '';
  for (const x of xs) {
    marks += `<div class="crop" style="left:${x - T / 2}in;top:${top - off - L}in;width:${T}in;height:${L}in"></div>`;
    marks += `<div class="crop" style="left:${x - T / 2}in;top:${top + H + off}in;width:${T}in;height:${L}in"></div>`;
  }
  for (const y of ys) {
    marks += `<div class="crop" style="left:${left - off - L}in;top:${y - T / 2}in;width:${L}in;height:${T}in"></div>`;
    marks += `<div class="crop" style="left:${left + 2 * W + gap + off}in;top:${y - T / 2}in;width:${L}in;height:${T}in"></div>`;
  }
  // Each slot shows the trimmed card only (the bleed is cut off by the slot).
  const slot = (x, id) => `<div class="slot" style="left:${x}in;top:${top}in;width:${W}in;height:${H}in"><div style="position:absolute;left:-${BLEED}in;top:-${BLEED}in">${back(qrSvg, id)}</div></div>`;
  return `<div class="sheet" id="sheet">${slot(left, 'b1')}${slot(left + W + gap, 'b2')}${marks}</div>`;
};

(async () => {
  fs.mkdirSync(path.join(OUT, 'print-files', '5x7'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'print-files', 'letter'), { recursive: true });
  const qrN = QRCode.create(QR_URL, { errorCorrectionLevel: 'M' }).modules.size;
  const qrSvg = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const qrMod = QR_IN / qrN, qrBox = QR_IN + 2 * QR_QUIET * qrMod;
  console.log(`  QR: ${qrN} x ${qrN} squares, ${(qrMod * 25.4).toFixed(2)} mm each, ${qrBox.toFixed(2)} in with its margin`);
  const css = CSS(qrBox.toFixed(3), (QR_QUIET * qrMod).toFixed(4));

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: DPI / 96, viewport: { width: Math.ceil(11 * 96), height: Math.ceil(8.5 * 96) } });
  const page = await ctx.newPage();
  const problems = [];
  const render = async (body, name) => {
    const tmp = path.join(OUT, `.render-${name}.html`);
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`);
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    fs.unlinkSync(tmp);
  };

  const checkCopy = async (label) => {
    const text = (await page.evaluate(() => document.body.innerText)).replace(/\u00a0/g, ' ');
    const banned = [[/—|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
      [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$(?!5\b)\d/, 'a price (the card outlives a price change)'],
      [/\bwe\b(?!'ll find a day)|\bour\b/i, 'business "we" (it is one guy: "I")'], [/rain-ready|\boffer\b|free/i, 'an offer'],
      [/expire(?!s\. No fees)/i, 'an expiration date (illegal on a WA gift card)'], [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'],
      [/\b\d{2,3} reviews\b/i, 'a review count']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`${label}: copy contains ${what}: "${text.match(re)[0]}"`);
    // Every served town, and nothing about Washington's terms left out.
    for (const t of TOWNS) if (label.startsWith('back') && !text.includes(t)) problems.push(`${label}: town missing: ${t}`);
    if (label.startsWith('back')) for (const need of ['Never expires', 'No fees', 'rest stays on it', 'under $5', PHONE, 'spigot', 'outlet'])
      if (!text.includes(need)) problems.push(`${label}: missing "${need}"`);
    // Type size floor.
    const small = await page.evaluate((min) => [...document.querySelectorAll('body *')].filter((n) => n.childNodes.length && [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()))
      .map((n) => [n.className || n.tagName, parseFloat(getComputedStyle(n).fontSize) * 0.75]).filter(([, pt]) => pt < min - 0.05), MIN_PT);
    for (const [cls, pt] of small) problems.push(`${label}: ${cls} is ${pt.toFixed(1)} pt, under the ${MIN_PT} pt floor`);
  };
  // Safe area: nothing but the background (and the decorative border, which
  // is drawn outside the safe line on purpose) may sit in the outer margin.
  const checkSafe = async (id, label) => {
    const over = await page.evaluate(({ id, BLEED, SAFE }) => {
      const pg = document.getElementById(id).getBoundingClientRect(), dpi = pg.width / (BLEED * 2 + 5);
      const lo = (BLEED + SAFE) * dpi, out = [];
      for (const n of document.getElementById(id).querySelectorAll('.safe *')) {
        const r = n.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const x0 = r.left - pg.left, y0 = r.top - pg.top, x1 = r.right - pg.left, y1 = r.bottom - pg.top;
        if (x0 < lo - 0.5 || y0 < lo - 0.5 || x1 > pg.width - lo + 0.5 || y1 > pg.height - lo + 0.5) out.push(n.className || n.tagName);
      }
      return out;
    }, { id, BLEED, SAFE });
    if (over.length) problems.push(`${label}: outside the safe area: ${[...new Set(over)].join(', ')}`);
    // Content must also fit: nothing pushed past the bottom of the safe box.
    const spill = await page.evaluate((id) => { const s = document.querySelector('#' + id + ' .safe'); return s.scrollHeight - s.clientHeight; }, id);
    if (spill > 1) problems.push(`${label}: copy spills ${spill}px past the bottom of the safe area`);
  };

  // ---- front ----
  await page.setViewportSize({ width: Math.ceil(PW * 96), height: Math.ceil(PH * 96) });
  await render(front(), 'front');
  await checkCopy('front'); await checkSafe('front', 'front');
  const frontPng = await (await page.$('#front')).screenshot({ type: 'png' });
  await page.pdf({ path: path.join(OUT, 'print-files', '5x7', 'front.pdf'), width: `${PW}in`, height: `${PH}in`, printBackground: true });

  // ---- back ----
  await render(back(qrSvg, 'back'), 'back');
  await checkCopy('back'); await checkSafe('back', 'back');
  const backPng = await (await page.$('#back')).screenshot({ type: 'png' });
  await page.pdf({ path: path.join(OUT, 'print-files', '5x7', 'back.pdf'), width: `${PW}in`, height: `${PH}in`, printBackground: true });
  // The QR has to scan off the rendered card, not just exist in the SVG.
  {
    const qrEl = await page.$('#back .qr .code');
    const shot = await qrEl.screenshot({ type: 'png' });
    const { data, info } = await sharp(shot).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const got = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    if (!got || got.data !== QR_URL) problems.push(`back: QR does not decode to ${QR_URL} (got ${got && got.data})`);
    else console.log('  QR decodes ok');
  }

  // ---- two-up letter sheet ----
  await page.setViewportSize({ width: Math.ceil(11 * 96), height: Math.ceil(8.5 * 96) });
  await render(twoUp(qrSvg), 'sheet');
  await checkCopy('back (sheet)');
  const sheetPng = await (await page.$('#sheet')).screenshot({ type: 'png' });
  await page.pdf({ path: path.join(OUT, 'print-files', 'letter', 'two-up.pdf'), width: '11in', height: '8.5in', printBackground: true });

  // ---- previews ----
  const b = Math.round(BLEED * DPI);
  const trim = (buf) => sharp(buf).extract({ left: b, top: b, width: W * DPI, height: H * DPI });
  await trim(frontPng).resize({ width: 900 }).toFile(path.join(OUT, 'preview-front.png'));
  await trim(backPng).resize({ width: 900 }).toFile(path.join(OUT, 'preview-back.png'));
  await sharp(sheetPng).resize({ width: 1650 }).toFile(path.join(OUT, 'preview-two-up.png'));
  // Front and back side by side, at the size they'd sit on a table.
  const fr = await trim(frontPng).resize({ width: 520 }).png().toBuffer();
  const bk = await trim(backPng).resize({ width: 520 }).png().toBuffer();
  await sharp({ create: { width: 1300, height: 900, channels: 3, background: '#2b2d33' } })
    .composite([{ input: fr, left: 80, top: 80 }, { input: bk, left: 700, top: 80 }])
    .png().toFile(path.join(OUT, 'mockup.png'));
  await browser.close();

  if (problems.length) { problems.forEach((p) => console.error('  FAIL', p)); process.exit(1); }
  console.log('  copy, type sizes and safe area ok');
  console.log('wrote print-files/5x7/front.pdf, back.pdf, print-files/letter/two-up.pdf and the previews');
})().catch((e) => { console.error(e); process.exit(1); });
