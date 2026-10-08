// Renders the EDDM postcard to print-ready PDFs and preview PNGs.
//
//   cd print/tools && npm install && npm run postcard
//
// Output lands in print/postcard/: print-files/6.5x9/{front,back}.pdf for the
// printer, preview-*.png and mockup-front-back.png for looking at. Read
// print/postcard/README.md before changing any copy: every line on the card is
// one more copy of the facts table in the repo's CLAUDE.md, the same as the
// door hanger (build-door-hanger.cjs), which this file borrows its look from.
//
// 9 x 6.5 in, landscape, both sides full color. Each PDF is one side at trim
// + 0.125 in bleed on every side. 6.5 x 9 is the size every EDDM printer
// stocks (55Printing, GotPrint, Vistaprint, NextDayFlyers) and the cheapest
// one that counts as a USPS flat, which EDDM requires: taller than 6.125 in.
//
// The back carries the EDDM Retail indicia and "Local Postal Customer" in a
// plain white zone, top right. The generator fails if anything else touches
// that zone, or if the indicia sits outside the corner USPS allows.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'postcard');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');
const SOCIAL = path.join(ROOT, 'social');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';
// Same shape as the hanger's link, with its own utm_source so Google Analytics
// keeps the two apart: Reports > Acquisition > Traffic acquisition, "postcard / mail".
const QR_URL = 'https://mikeysdetailing.com/?utm_source=postcard&utm_medium=mail#booking';

const TOWNS = ['Snohomish', 'Lake Stevens', 'Everett', 'Monroe', 'Mill Creek', 'Marysville',
  'Bothell', 'Duvall', 'Mukilteo', 'Woodinville', 'Granite Falls', 'Arlington'];

const BLEED = 0.125;
const W = 9, H = 6.5;
const SAFE = 0.22;
// USPS: the EDDM Retail indicia goes in the upper right corner, inside the
// area 1.625 in from the right edge and 1.375 in from the top.
const INDICIA_MAX = { right: 1.625, top: 1.375 };
const MAILZONE = { w: 3.55, h: 2.05 }; // plain white, top right of the back

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const logoSvg = (variant) => {
  // the backs are cream paper, where the dark-background logo's white
  // MOBILE DETAILING would vanish, so they get the light version
  let s = fs.readFileSync(path.join(SOCIAL, 'brand', variant === 'light' ? 'logo-light.svg' : 'logo.svg'), 'utf8');
  if (variant === 'thick') s = s.replace('stroke-width="15"', 'stroke-width="22"');
  return s.replace('<svg ', '<svg class="logo" ');
};

const star = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = n => `<span class="stars">${star.repeat(n)}</span>`;

const qrSvg = () => QRCode.toString(QR_URL, {
  type: 'svg', errorCorrectionLevel: 'M', margin: 0,
  color: { dark: '#0e0e0f', light: '#ffffff' },
});

const PHOTO_W = 4.3, PHOTO_H = 4.42; // front photo block, inches inside the trim

const CSS = `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
@page{size:${W + 2 * BLEED}in ${H + 2 * BLEED}in;margin:0}
:root{--ink:#0e0e0f;--red:#E31924;--red2:#B50E22;--red3:#8f0a1a;--gold:#D2AE5E;--gold-d:#9A7A2E;
  --cream:#F6F2EA;--line:#DDD5C6;--muted:rgba(255,255,255,.76);--sub:#55504a}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:${W + 2 * BLEED}in;height:${H + 2 * BLEED}in;overflow:hidden;break-after:page}
.page:last-child{break-after:auto}
.trim{position:absolute;left:${BLEED}in;top:${BLEED}in;width:${W}in;height:${H}in}
.stars{display:inline-flex;gap:1.5pt;vertical-align:middle}
.stars svg{width:9pt;height:9pt;fill:var(--gold)}

/* ============ FRONT ============ */
.front{background:var(--ink);color:#fff}
.front .bg{position:absolute;inset:0;background:radial-gradient(70% 70% at 100% 0%,rgba(227,25,36,.22),transparent 70%),var(--ink)}
.ba{position:absolute;left:0;top:0;width:${PHOTO_W + BLEED}in;height:${PHOTO_H + BLEED}in;display:flex;gap:.03in;background:#fff}
.ba .ph{position:relative;flex:1;overflow:hidden;background:#222}
.ba .ph img{width:100%;height:100%;object-fit:cover;display:block}
.ba .chip{position:absolute;top:${BLEED + 0.16}in;font-weight:800;font-size:8pt;letter-spacing:.16em;text-transform:uppercase;padding:4pt 7pt 3.5pt;border-radius:3pt;color:#fff}
.ba .ph.b .chip{left:${BLEED + 0.18}in;background:rgba(10,10,10,.82)}
.ba .ph.a .chip{right:.16in;background:var(--red)}
.ba .cap{position:absolute;left:0;right:0;bottom:0;padding:.4in .2in .1in ${BLEED + 0.2}in;text-align:center;
  background:linear-gradient(transparent,rgba(8,8,8,.88) 60%);font-family:'Caveat';font-weight:700;font-size:15.5pt;line-height:1;color:#fff}
.stats{position:absolute;left:${BLEED + SAFE}in;top:${BLEED + PHOTO_H + 0.22}in;width:${PHOTO_W - SAFE - 0.1}in;display:flex;justify-content:space-between}
.stats div{text-align:center;line-height:1.05}
.stats b{display:block;font-weight:800;font-size:27pt;letter-spacing:-.02em}
.stats b.g{color:var(--gold)}
.stats span{display:block;font-weight:700;font-size:7.2pt;letter-spacing:.13em;text-transform:uppercase;margin-top:3pt;color:var(--muted)}
.stats .stars{justify-content:center;margin-top:2pt}
.stats .stars svg{width:8pt;height:8pt}

.right{position:absolute;left:${PHOTO_W + 0.28}in;right:${SAFE}in;top:${SAFE}in;bottom:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.right>*{flex-shrink:0}
.front .logo{display:block;width:2.15in;height:auto;margin:0 auto;overflow:visible}
.eyebrow{font-weight:700;font-size:7.2pt;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);text-align:center;margin-top:.09in}
.front h1{font-weight:800;font-size:26pt;line-height:1.02;letter-spacing:-.025em;text-align:center;margin-top:.05in}
.front h1 em{font-style:normal;color:var(--red)}
.promise{font-family:'Caveat';font-weight:700;font-size:20pt;line-height:1;text-align:center;margin-top:.06in}
.promise u{text-decoration:none;background:linear-gradient(transparent 78%,rgba(227,25,36,.9) 78%,rgba(227,25,36,.9) 92%,transparent 92%)}

.offer{position:relative;margin-top:.12in;border:1.1pt solid rgba(210,174,94,.75);border-radius:7pt;padding:.09in .13in;
  background:linear-gradient(180deg,rgba(210,174,94,.10),rgba(210,174,94,.03))}
.offer .when{font-weight:700;font-size:6.8pt;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
.offer .name{font-weight:800;font-size:14.5pt;line-height:1.05;letter-spacing:-.015em;margin-top:2pt}
.offer .name em{font-style:normal;color:var(--red)}
.offer .what{font-size:8.3pt;line-height:1.3;color:var(--muted);margin-top:3pt}
.offer .what b{color:#fff;font-weight:700}
.offer .code{font-size:8pt;color:#fff;font-weight:600;margin-top:3pt}
.offer .free{position:absolute;right:.13in;top:.09in;text-align:right;line-height:1}
.offer .free b{display:block;font-weight:800;font-size:20pt;color:var(--gold);letter-spacing:-.02em}
.offer .free span{display:block;font-weight:700;font-size:6.4pt;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-top:1.5pt}

.cta{display:flex;align-items:center;gap:.13in}
.towns{position:absolute;left:${BLEED + SAFE}in;width:${PHOTO_W - SAFE - 0.1}in;bottom:${BLEED + SAFE}in;font-size:7.6pt;line-height:1.4;color:var(--muted);text-align:center}
.towns b{color:#fff;font-weight:700}
.btowns{font-size:8pt;line-height:1.4;color:var(--sub)}
.btowns b{color:var(--ink)}
.qr{flex:none;background:#fff;border-radius:6pt;padding:.07in}
.qr svg{display:block;width:1.15in;height:1.15in}
.cta .txt{flex:1;min-width:0}
.cta .scan{font-weight:800;font-size:12.5pt;line-height:1.05;letter-spacing:-.01em}
.cta .scan-sub{font-size:7.8pt;line-height:1.25;color:var(--muted);margin-top:2pt}
.cta .or{font-size:7pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-top:5pt}
.cta .phone{font-weight:800;font-size:19pt;line-height:1;letter-spacing:-.01em;margin-top:1.5pt;white-space:nowrap}
.cta .url{font-size:8pt;font-weight:600;color:var(--muted);margin-top:2pt}

/* ============ BACK ============ */
.back{background:var(--cream);color:var(--ink)}
.mailzone{position:absolute;right:0;top:0;width:${MAILZONE.w + BLEED}in;height:${MAILZONE.h + BLEED}in;background:#fff;
  border-bottom-left-radius:10pt}
.indicia{position:absolute;right:${BLEED + 0.28}in;top:${BLEED + 0.26}in;width:1.08in;border:1pt solid #000;padding:4pt 3pt;
  font-family:'Outfit';font-weight:700;font-size:6.6pt;line-height:1.28;text-align:center;letter-spacing:.03em;color:#000}
.addr{position:absolute;right:${BLEED + 0.28}in;top:${BLEED + 1.3}in;width:${MAILZONE.w - 0.56}in;
  font-family:'Outfit';font-weight:600;font-size:10pt;letter-spacing:.06em;text-transform:uppercase;color:#000}

.left{position:absolute;left:${BLEED + SAFE}in;top:${BLEED + SAFE}in;width:${W - MAILZONE.w - SAFE - 0.22}in;bottom:${BLEED + SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.left>*{margin-top:0!important}
.left>*{flex-shrink:0}
.hi{display:flex;gap:.12in;align-items:flex-start}
.hi .logo{flex:none;width:1.05in;height:auto;margin-top:.02in}
.hi h2{font-family:'Caveat';font-weight:700;font-size:21pt;line-height:.95}
.hi p{font-size:8.2pt;line-height:1.28;color:var(--sub);margin-top:2pt}
.hi p b{color:var(--ink);font-weight:700}
.rev{margin-top:.09in;display:flex;gap:7pt;align-items:flex-start}
.rev .q{font-weight:800;font-size:28pt;line-height:.7;color:var(--red);flex:none;margin-top:3pt}
.rev p{font-size:8.8pt;line-height:1.3;font-weight:500}
.rev .by{display:flex;align-items:center;gap:4pt;font-size:7.3pt;color:var(--sub);margin-top:2pt}
.rev .by .stars svg{width:7.5pt;height:7.5pt}
.sec{margin-top:.09in}
.sec h3{display:flex;align-items:center;gap:6pt;font-weight:800;font-size:7.2pt;letter-spacing:.18em;text-transform:uppercase;color:var(--red2)}
.sec h3:after{content:'';flex:1;height:.8pt;background:var(--line)}
.two{display:flex;gap:.2in}
.two>div{flex:1;min-width:0}
.gets{list-style:none;margin-top:5pt;display:flex;flex-direction:column;gap:3.2pt}
.gets li{position:relative;padding-left:11pt;font-size:8.8pt;line-height:1.22;font-weight:500}
.gets li:before{content:'';position:absolute;left:0;top:2.5pt;width:6.5pt;height:3.6pt;border-left:1.6pt solid var(--red);border-bottom:1.6pt solid var(--red);transform:rotate(-45deg)}
.prices{margin-top:3pt}
.prices .row{display:flex;align-items:baseline;gap:4pt;padding:2.4pt 0;border-bottom:.6pt dotted #cfc6b5}
.prices .row:last-child{border-bottom:0}
.prices .nm{font-weight:700;font-size:10.2pt}
.prices .nm small{display:block;font-weight:500;font-size:6.9pt;color:var(--sub)}
.prices .fill{flex:1}
.prices .pr{font-size:7.6pt;color:var(--sub);white-space:nowrap}
.prices .pr b{font-weight:800;font-size:11.5pt;color:var(--ink)}
.note{font-size:7.3pt;line-height:1.3;color:var(--sub);margin-top:3pt}
.note b{color:var(--ink)}
.steps{margin-top:4pt;display:flex;gap:.14in}
.step{flex:1;display:flex;gap:6pt;align-items:flex-start}
.step .n{flex:none;width:15pt;height:15pt;border-radius:50%;background:var(--ink);color:#fff;font-weight:800;font-size:8.4pt;display:flex;align-items:center;justify-content:center}
.step b{display:block;font-weight:800;font-size:9.4pt;line-height:1.15}
.step span{display:block;font-size:7.9pt;line-height:1.26;color:var(--sub);margin-top:1pt}

.rcol{position:absolute;right:${BLEED + SAFE}in;top:${BLEED + MAILZONE.h + 0.14}in;width:${MAILZONE.w - SAFE - 0.06}in;bottom:${BLEED + SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.rcol>*{flex-shrink:0}
.grt{background:var(--ink);color:#fff;border-radius:7pt;padding:.1in .13in;position:relative;overflow:hidden}
.grt:before{content:'';position:absolute;right:-.4in;top:-.5in;width:1.6in;height:1.6in;border-radius:50%;background:radial-gradient(rgba(227,25,36,.35),transparent 70%)}
.grt h4{position:relative;font-weight:800;font-size:15pt;line-height:1.02;letter-spacing:-.015em}
.grt h4 em{font-style:normal;color:var(--red)}
.grt .three{position:relative;margin-top:4pt;display:flex;flex-direction:column;gap:2pt}
.grt .three div{font-size:8.1pt;line-height:1.25;color:var(--muted)}
.grt .three b{color:var(--gold);font-weight:800}
.grt .zero{position:relative;font-size:8pt;color:#fff;font-weight:700;margin-top:4pt;padding-top:3pt;border-top:.6pt solid rgba(255,255,255,.14)}
.back .cta{padding-top:0}
.back .cta .scan-sub,.back .cta .url{color:var(--sub)}
.back .cta .or{color:var(--gold-d)}
.back .qr{box-shadow:0 0 0 .6pt var(--line);padding:.06in}
.back .qr svg{width:1.15in;height:1.15in}
.back .cta .phone{font-size:17pt}
.fine{font-size:6.2pt;line-height:1.3;color:#7a746b;margin-top:.06in}
`;

const frontHtml = (qr) => `
<section class="page front">
  <div class="bg"></div>
  <div class="ba">
    <div class="ph b"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-before.jpg'))}" style="object-position:40% 72%"><span class="chip">Before</span></div>
    <div class="ph a"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-after.jpg'))}" style="object-position:40% 72%"><span class="chip">After</span></div>
    <div class="cap">Same back seat. No judgment, I've seen everything.</div>
  </div>
  <div class="stats">
    <div><b>5.0</b>${stars(5)}<span>39 Google reviews</span></div>
    <div><b>300+</b><span>cars since 2021</span></div>
    <div><b class="g">$0</b><span>deposit, ever</span></div>
  </div>
  <div class="towns">Same price in every town, no travel fee:<br><b>${TOWNS.join('&nbsp;· ')}</b></div>
  <div class="trim"><div class="right">
    ${logoSvg('thick')}
    <div class="eyebrow">Mobile car detailing · Snohomish County</div>
    <h1>Your car, detailed<br><em>right here</em> in<br>your driveway.</h1>
    <div class="promise"><u>You don't pay until you love it.</u></div>
    <div class="offer">
      <div class="when">Book by December 31</div>
      <div class="name">The Rain-Ready<br><em>Full Detail</em></div>
      <div class="free"><b>$50</b><span>of extras free</span></div>
      <div class="what">Full detail <b>from $369</b>, plus <b>ceramic wax, RainX on the windows and carpet shampoo</b> on me.</div>
      <div class="code">Just mention this postcard when you book.</div>
    </div>
    <div class="cta">
      <div class="qr">${qr}</div>
      <div class="txt">
        <div class="scan">Scan for your<br>exact price</div>
        <div class="scan-sub">About 60 seconds. No phone tag.</div>
        <div class="or">Rather talk? Call or text</div>
        <div class="phone">${PHONE}</div>
      </div>
    </div>
  </div></div>
</section>`;

const backHtml = (qr) => `
<section class="page back">
  <div class="mailzone"></div>
  <div class="indicia">PRSRT STD<br>ECRWSS<br>U.S. POSTAGE PAID<br>EDDM RETAIL</div>
  <div class="addr">Local Postal Customer</div>

  <div class="left">
    <div class="hi">
      ${logoSvg('light')}
      <div>
        <h2>Hey, I'm Mikey.</h2>
        <p><b>300+ cars</b> around Snohomish County since 2021. It's just me, so the guy who texts you back is the guy who does your car. I bring every product and tool. You provide an outdoor spigot and an outlet.</p>
      </div>
    </div>
    <div class="rev">
      <div class="q">&ldquo;</div>
      <div>
        <p>As someone who is very protective over their car, I was absolutely amazed at how Mike handled such a detailed task. Incredible attention to detail.</p>
        <div class="by">${stars(5)} Angela, Snohomish · Google review</div>
      </div>
    </div>
    <div class="two">
      <div class="sec"><h3>A full detail gets</h3>
        <ul class="gets">
          <li>Full vacuum, every crevice</li><li>Seats and carpet steam cleaned</li>
          <li>Leather cleaned</li><li>Door jambs wiped down</li>
          <li>Hand wash and dry</li><li>Tires and wheels deep cleaned</li>
          <li>Spray sealant on the paint</li><li>Glass inside and out</li>
        </ul>
      </div>
      <div class="sec"><h3>Prices</h3>
        <div class="prices">
          <div class="row"><span class="nm">Exterior</span><span class="fill"></span><span class="pr">from <b>$199</b></span></div>
          <div class="row"><span class="nm">Interior</span><span class="fill"></span><span class="pr">from <b>$249</b></span></div>
          <div class="row"><span class="nm">Full detail<small>inside + out, most popular</small></span><span class="fill"></span><span class="pr">from <b>$369</b></span></div>
        </div>
        <div class="note">Size and condition set the price. <b>The quote gives you the exact number.</b> No travel fee.</div>
      </div>
    </div>
    <div class="rev">
      <div class="q">&ldquo;</div>
      <div>
        <p>Mikey has done my car 4 times now and each time was amazing, quick, thorough, and a fabulous result.</p>
        <div class="by">${stars(5)} C. Wilson, Snohomish · Google review</div>
      </div>
    </div>
    <div class="sec"><h3>How it works</h3>
      <div class="steps">
        <div class="step"><div class="n">1</div><div><b>Get your price.</b><span>Scan the code. About 60 seconds, then I text you a time.</span></div></div>
        <div class="step"><div class="n">2</div><div><b>I come to you.</b><span>Home or work. You don't have to be home.</span></div></div>
        <div class="step"><div class="n">3</div><div><b>Look, then pay.</b><span>We walk around it together and I fix anything you point at.</span></div></div>
      </div>
    </div>
  </div>

  <div class="rcol">
    <div class="grt">
      <h4>Don't love it? <em>You don't pay.</em></h4>
      <div class="three">
        <div><b>Walk-around.</b> See something? I fix it on the spot.</div>
        <div><b>Free comeback.</b> Notice it the next day? I come back.</div>
        <div><b>Every penny back.</b> Still not happy? You pay nothing.</div>
      </div>
      <div class="zero">300+ cars in, nobody has ever asked for a refund.</div>
    </div>
    <div class="cta">
      <div class="qr">${qr}</div>
      <div class="txt">
        <div class="scan">Your exact price<br>in 60 seconds</div>
        <div class="or">Or call or text</div>
        <div class="phone">${PHONE}</div>
        <div class="url">${SITE}</div>
      </div>
    </div>
    <div class="fine">Rain-Ready: book a Full Detail by December 31, 2026 and mention this postcard. Ceramic wax, RainX and carpet shampoo come free.</div>
  </div>
</section>`;

async function checkQr(pngBuf, label) {
  const { data, info } = await sharp(pngBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (!code) throw new Error(`QR did not decode on ${label}`);
  if (code.data !== QR_URL) throw new Error(`QR on ${label} decodes to ${code.data}`);
  // Again at ~95 dpi, blurred and 30% darker: a phone at a kitchen counter.
  const rough = await sharp(pngBuf).resize({ width: Math.round(info.width * 95 / 300) }).blur(1.2)
    .modulate({ brightness: 0.7 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hard = jsQR(new Uint8ClampedArray(rough.data), rough.info.width, rough.info.height);
  if (!hard || hard.data !== QR_URL) throw new Error(`QR on ${label} fails at 95 dpi with blur`);
  console.log(`  QR ok on ${label} (sharp and rough): ${code.data}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const qr = await qrSvg();
  const browser = await chromium.launch();
  const pageW = W + 2 * BLEED, pageH = H + 2 * BLEED;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
    <body>${frontHtml(qr)}${backHtml(qr)}</body></html>`;
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, html);

  const ctx = await browser.newContext({ deviceScaleFactor: 300 / 96, viewport: { width: Math.round(pageW * 96), height: Math.round(pageH * 96) } });
  const page = await ctx.newPage();
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));

  const problems = await page.evaluate(({ BLEED, W, H, SAFE, INDICIA_MAX, MAILZONE }) => {
    const out = [], IN = 96;
    const pages = document.querySelectorAll('.page');
    // Everything in the text columns stays inside the trim minus the safe margin.
    pages.forEach((pg, i) => {
      const pr = pg.getBoundingClientRect();
      const box = { l: pr.left + (BLEED + SAFE) * IN, t: pr.top + (BLEED + SAFE) * IN, r: pr.left + (BLEED + W - SAFE) * IN, b: pr.top + (BLEED + H - SAFE) * IN };
      pg.querySelectorAll('.right *, .left *, .rcol *, .stats *, .towns *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        if (r.left < box.l - .5 || r.top < box.t - .5 || r.right > box.r + .5 || r.bottom > box.b + .5)
          out.push(`${i ? 'back' : 'front'}: <${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}"> outside the safe area`);
      });
      pg.querySelectorAll('.right, .left, .rcol').forEach(c => {
        if (c.scrollHeight > c.clientHeight + 1) out.push(`${i ? 'back' : 'front'}: .${c.className} content taller than its column by ${c.scrollHeight - c.clientHeight}px`);
      });
    });
    // Back: nothing but the indicia and the address line inside the mail zone.
    const back = pages[1], br = back.getBoundingClientRect();
    const zone = { l: br.left + (BLEED + W - MAILZONE.w) * IN, t: br.top, r: br.right, b: br.top + (BLEED + MAILZONE.h) * IN };
    back.querySelectorAll('.left *, .rcol *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > zone.l && r.left < zone.r && r.bottom > zone.t && r.top < zone.b)
        out.push(`back: <${el.tagName.toLowerCase()}> intrudes on the mail zone`);
    });
    const ind = back.querySelector('.indicia').getBoundingClientRect();
    const fromRight = (br.left + (BLEED + W) * IN - ind.left) / IN, fromTop = (ind.bottom - br.top - BLEED * IN) / IN;
    if (fromRight > INDICIA_MAX.right || fromTop > INDICIA_MAX.top)
      out.push(`indicia reaches ${fromRight.toFixed(2)} in from the right and ${fromTop.toFixed(2)} in from the top (USPS max ${INDICIA_MAX.right} / ${INDICIA_MAX.top})`);
    return out;
  }, { BLEED, W, H, SAFE, INDICIA_MAX, MAILZONE });

  const text = await page.evaluate(() => document.body.innerText);
  const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
    [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/cars a week|limited spots|a few a week/i, 'a retired scarcity claim (CLAUDE.md, 2026-09-29)'],
    [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b|\bour (?:team|crew|detailers)\b/i, 'business "we" (it is one guy)'],
    [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day (unconfirmed)'],
    [/(bring|brings|own)\s+(my own\s+)?(water|power|generator|tank)/i, 'bringing water or power (the customer provides both)']];
  for (const [re, what] of banned) if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  for (const must of ['spigot', 'outlet', '(425) 600-7897', '60 seconds', '5.0', '39 Google reviews', '300+', 'December 31, 2026'])
    if (!text.toLowerCase().includes(must.toLowerCase())) problems.push(`copy is missing "${must}"`);
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }

  const dir = path.join(OUT, 'print-files', '6.5x9');
  fs.mkdirSync(dir, { recursive: true });
  for (const [range, side] of [['1', 'front'], ['2', 'back']]) {
    const pdf = path.join(dir, `${side}.pdf`);
    await page.pdf({ path: pdf, width: `${pageW}in`, height: `${pageH}in`, printBackground: true, preferCSSPageSize: true, pageRanges: range });
    console.log('wrote', path.relative(ROOT, pdf));
  }

  const sides = await page.$$('.page');
  const px = 300, b = Math.round(BLEED * px);
  for (const [i, name] of ['front', 'back'].entries()) {
    const buf = await sides[i].screenshot({ type: 'png' });
    await checkQr(buf, name);
    await sharp(buf).extract({ left: b, top: b, width: W * px, height: H * px }).toFile(path.join(OUT, `preview-${name}.png`));
  }
  await ctx.close();
  await browser.close();
  fs.unlinkSync(tmp);

  // Front over back, on a counter-ish grey.
  const f = await sharp(path.join(OUT, 'preview-front.png')).resize({ width: 1800 }).toBuffer();
  const bk = await sharp(path.join(OUT, 'preview-back.png')).resize({ width: 1800 }).toBuffer();
  const fh = (await sharp(f).metadata()).height, pad = 70;
  await sharp({ create: { width: 1800 + pad * 2, height: fh * 2 + pad * 3, channels: 3, background: '#e9e7e3' } })
    .composite([{ input: f, left: pad, top: pad }, { input: bk, left: pad, top: fh + pad * 2 }])
    .png().toFile(path.join(OUT, 'mockup-front-back.png'));
  console.log('wrote previews + mockup');
})().catch(e => { console.error(e); process.exit(1); });
