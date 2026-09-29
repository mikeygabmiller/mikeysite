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
// 18 x 24 in landscape, corrugated plastic, 0.125 in bleed on every side. Keep
// everything that matters 0.75 in inside the trim: the H-stake flutes and the
// printer's cut both eat the edges.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'yard-signs');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';
// utm_source=yardsign is what the dashboard reads to credit a sign lead (the
// visitor's journey is tagged at /submit and /api/book). Change it here and
// the credit stops.
const QR_URL = 'https://mikeysdetailing.com/?utm_source=yardsign#booking';

const W = 24, H = 18, BLEED = 0.125, SAFE = 0.75;
const RED = '#E31924', INK = '#111114';

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const logo = fs.readFileSync(path.join(ROOT, 'social', 'brand', 'logo-light.svg'), 'utf8').replace('<svg ', '<svg class="logo" ');

async function qrSvg() {
  return QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: INK, light: '#ffffff' } });
}

const CSS = `
${fontFace('Barlow Condensed', 'barlow-condensed', 800)}
${fontFace('Barlow Condensed', 'barlow-condensed', 700)}
@page{size:${W + 2 * BLEED}in ${H + 2 * BLEED}in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
.page{position:relative;width:${W + 2 * BLEED}in;height:${H + 2 * BLEED}in;overflow:hidden;background:#fff}
.safe{position:absolute;left:${BLEED + SAFE}in;right:${BLEED + SAFE}in;top:${BLEED + SAFE}in;bottom:${BLEED + SAFE}in}
.logo{position:absolute;left:50%;transform:translateX(-50%);top:${BLEED + 0.9}in;width:11.6in;height:auto}
.band{position:absolute;left:0;right:0;top:${BLEED + 4.55}in;height:4.6in;background:${RED};display:flex;align-items:center;justify-content:center}
.band span{font:800 1in/1 'Barlow Condensed';color:#fff;letter-spacing:.02em;white-space:nowrap}
.phone{position:absolute;left:${BLEED + SAFE}in;right:${BLEED + SAFE}in;top:${BLEED + 9.55}in;height:4.4in;display:flex;align-items:center;justify-content:center}
.phone span{font:800 1in/1 'Barlow Condensed';color:${INK};white-space:nowrap;letter-spacing:.01em}
.foot{position:absolute;left:${BLEED + SAFE}in;right:${BLEED + SAFE}in;bottom:${BLEED + SAFE}in;height:3.1in;display:flex;align-items:center;gap:.45in;border-top:.09in solid ${INK};padding-top:.3in}
.foot .txt{flex:1;display:flex;flex-direction:column;justify-content:center}
.foot .url{font:800 1.15in/1 'Barlow Condensed';color:${INK}}
.foot .sub{font:700 .6in/1.1 'Barlow Condensed';color:${RED};margin-top:.12in}
.foot .qr{width:2.8in;height:2.8in;background:#fff;padding:.12in}
.foot .qr svg{width:100%;height:100%;display:block}
`;

const html = (qr) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="page">
  ${logo}
  <div class="band"><span id="fit1">I COME TO YOU</span></div>
  <div class="phone"><span id="fit2">${PHONE}</span></div>
  <div class="foot"><div class="txt"><div class="url">${SITE}</div><div class="sub">Scan for your exact price in 60 seconds</div></div><div class="qr">${qr}</div></div>
  <div class="safe"></div>
</div></body></html>`;

async function checkQr(pngBuf) {
  const { data, info } = await sharp(pngBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (!code || code.data !== QR_URL) throw new Error(`QR does not decode to ${QR_URL}: ${code && code.data}`);
  // Seen from about 4 ft on a phone: roughly 40 dpi of board, a little blur.
  const rough = await sharp(pngBuf).resize({ width: Math.round(info.width * 40 / 150) }).blur(1)
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hard = jsQR(new Uint8ClampedArray(rough.data), rough.info.width, rough.info.height);
  if (!hard || hard.data !== QR_URL) throw new Error('QR fails at low resolution with blur');
  console.log('  QR ok (sharp and rough):', code.data);
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'print-files', '18x24'), { recursive: true });
  const qr = await qrSvg();
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, html(qr));
  const browser = await chromium.launch();
  // 150 dpi is plenty for a sign read from a car, and keeps the preview sane.
  const ctx = await browser.newContext({ deviceScaleFactor: 150 / 96, viewport: { width: Math.round((W + 2 * BLEED) * 96), height: Math.round((H + 2 * BLEED) * 96) } });
  const page = await ctx.newPage();
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
  // Biggest type that fits: grow each line until it touches its box.
  const sizes = await page.evaluate(() => {
    const out = {};
    for (const [id, maxH] of [['fit1', 0.78], ['fit2', 0.9]]) {
      const s = document.getElementById(id), box = s.parentElement.getBoundingClientRect();
      let lo = 10, hi = 2000;
      while (hi - lo > 1) {
        const mid = (lo + hi) / 2; s.style.fontSize = mid + 'px';
        const r = s.getBoundingClientRect();
        if (r.width <= box.width * 0.96 && r.height <= box.height * maxH) lo = mid; else hi = mid;
      }
      s.style.fontSize = lo + 'px';
      out[id] = +(lo / 96).toFixed(2);
    }
    return out;
  });
  // Cap height of Barlow Condensed is about 0.7 of the font size.
  console.log(`  "I COME TO YOU" ${(sizes.fit1 * 0.7).toFixed(1)} in tall, phone ${(sizes.fit2 * 0.7).toFixed(1)} in tall`);
  if (sizes.fit2 * 0.7 < 2.3) { console.error('  FAIL phone number under 2.3 in tall: unreadable from a car'); process.exitCode = 1; }

  const problems = await page.evaluate(({ BLEED, SAFE }) => {
    const out = [], px = 96, page = document.querySelector('.page').getBoundingClientRect();
    const inset = (BLEED + SAFE) * px - 1;
    ['.logo', '#fit1', '#fit2', '.foot'].forEach(sel => {
      const r = document.querySelector(sel).getBoundingClientRect();
      if (sel !== '#fit1' && (r.left < page.left + inset || r.right > page.right - inset || r.top < page.top + inset || r.bottom > page.bottom - inset + 2))
        out.push(sel + ' outside the safe area');
    });
    return out;
  }, { BLEED, SAFE });
  const text = await page.evaluate(() => document.body.innerText);
  const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
    [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$\d/, 'a price (a printed sign cannot follow a price change)'],
    [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'], [/free|rain-ready|offer/i, 'an offer (the Rain-Ready offer is not on signs)'],
    [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds']];
  for (const [re, what] of banned) if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  const words = text.replace(SITE, '').replace(PHONE, '').replace(/Scan for your exact price in 60 seconds/, '').split(/\s+/).filter(Boolean);
  if (words.length > 7) problems.push(`the big copy is ${words.length} words; a driver reads 7`);
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }

  const pdf = path.join(OUT, 'print-files', '18x24', 'sign.pdf');
  await page.pdf({ path: pdf, width: `${W + 2 * BLEED}in`, height: `${H + 2 * BLEED}in`, printBackground: true, preferCSSPageSize: true });
  console.log('wrote', path.relative(ROOT, pdf));
  const buf = await (await page.$('.page')).screenshot({ type: 'png' });
  await checkQr(buf);
  const px = 150, b = Math.round(BLEED * px);
  await sharp(buf).extract({ left: b, top: b, width: W * px, height: H * px }).resize({ width: 1800 }).toFile(path.join(OUT, 'preview.png'));
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
