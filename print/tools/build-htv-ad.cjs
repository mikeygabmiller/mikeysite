// Renders Mikey's quarter-page ad for Hometown Values Savings Magazine.
//
//   cd print/tools && npm install && npm run htv
//
// Output lands in print/hometown-values/: print-files/ad.pdf (vector, for Jim's
// designer), print-files/ad-300dpi.jpg (for anyone who wants an image) and
// preview.png. Read print/hometown-values/README.md before changing any copy:
// every line is one more copy of the facts table in the repo's CLAUDE.md.
//
// 4.0625 x 4.75 in, portrait, no bleed: the ad sits inside a box on a shared
// magazine page. That's the frame on Mikey's 2024 proof from Jim, measured
// off the PDF (it was a quarter page). Jim confirms the real spec before art
// goes in; change W and H here if his differs.
//
// OFFER='$40 off|Any Full Detail. Mention Hometown Values when you book.'
// adds a coupon box above the call to action (the photo gets shorter to make room). Off by default: a new offer is
// Mikey's call (CLAUDE.md, Offers and countdowns), and it writes ad-offer.*
// so the two versions can't get mixed up.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'hometown-values');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');
const SOCIAL = path.join(ROOT, 'social');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';
const REVIEWS = 39; // what the Google profile shows; recheck before sending art
// Its own utm_source so Google Analytics keeps the magazine apart from the
// postcard and the hanger: Reports > Acquisition > Traffic acquisition,
// "hometownvalues / mail".
const QR_URL = 'https://mikeysdetailing.com/?utm_source=hometownvalues&utm_medium=mail#booking';
const TOWNS = ['Snohomish', 'Lake Stevens', 'Everett', 'Monroe', 'Mill Creek', 'Marysville',
  'Bothell', 'Duvall', 'Mukilteo', 'Woodinville', 'Granite Falls', 'Arlington'];

const W = 4.0625, H = 4.75;
const SAFE = 0.14;       // magazines trim and register loosely; keep type off the frame
const MIN_PT = 6.5;      // nothing smaller survives coupon-magazine printing

const [OFFER_BIG, OFFER_SMALL] = (process.env.OFFER || '').split('|');
const SUFFIX = OFFER_BIG ? '-offer' : '';

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const logoSvg = () => fs.readFileSync(path.join(SOCIAL, 'brand', 'logo.svg'), 'utf8')
  .replace('stroke-width="15"', 'stroke-width="22"')
  .replace('<svg ', '<svg class="logo" ');

const star = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = n => `<span class="stars">${star.repeat(n)}</span>`;

const qrSvg = () => QRCode.toString(QR_URL, {
  type: 'svg', errorCorrectionLevel: 'L', margin: 0, // L: 33 modules, not 37, so each dot prints bigger at this size
  color: { dark: '#0e0e0f', light: '#ffffff' },
});

const CSS = `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
@page{size:${W}in ${H}in;margin:0}
:root{--ink:#0e0e0f;--red:#E31924;--gold:#D2AE5E;--muted:rgba(255,255,255,.78)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.ad{position:relative;width:${W}in;height:${H}in;overflow:hidden;background:var(--ink);color:#fff}
.ad .bg{position:absolute;inset:0;background:radial-gradient(80% 55% at 100% 0%,rgba(227,25,36,.24),transparent 70%)}
.in{position:absolute;inset:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.in>*{flex-shrink:0}
.stars{display:inline-flex;gap:1pt;vertical-align:-1pt}
.stars svg{width:7pt;height:7pt;fill:var(--gold)}

.top{display:flex;align-items:center;gap:.1in}
.logo{flex:none;width:1.62in;height:auto;overflow:visible}
.top h1{flex:1;font-weight:800;font-size:14pt;line-height:1;letter-spacing:-.02em;text-align:right}
.top h1 em{font-style:normal;color:var(--red)}

.ba{position:relative;display:flex;gap:.025in;height:1.28in;border-radius:4pt;overflow:hidden;background:#fff}
.has-offer .ba{height:.98in}
.ba .ph{position:relative;flex:1;overflow:hidden;background:#222}
.ba img{width:100%;height:100%;object-fit:cover;display:block}
.ba .chip{position:absolute;top:.07in;font-weight:800;font-size:6.5pt;letter-spacing:.14em;text-transform:uppercase;padding:2.5pt 5pt 2pt;border-radius:2pt}
.ba .b .chip{left:.07in;background:rgba(10,10,10,.85)}
.ba .a .chip{right:.07in;background:var(--red)}
.ba .cap{position:absolute;left:0;right:0;bottom:0;padding:.2in .08in .04in;text-align:center;
  background:linear-gradient(transparent,rgba(8,8,8,.9) 60%);font-family:'Caveat';font-weight:700;font-size:11.5pt;line-height:1}

.prices{display:flex;gap:.06in}
.prices div{flex:1;border:.8pt solid rgba(255,255,255,.22);border-radius:4pt;padding:3pt 0 3.5pt;text-align:center;line-height:1.05}
.prices span{display:block;font-weight:700;font-size:6.5pt;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.prices b{display:block;font-weight:800;font-size:14pt;letter-spacing:-.01em;margin-top:1pt}
.prices small{font-weight:500;font-size:6.5pt;color:var(--muted);margin-right:1.5pt}
.prices .full{border-color:var(--gold);background:rgba(210,174,94,.1)}
.prices .full span{color:var(--gold)}

.promise{font-family:'Caveat';font-weight:700;font-size:16pt;line-height:1;text-align:center}
.promise u{text-decoration:none;background:linear-gradient(transparent 78%,rgba(227,25,36,.9) 78%,rgba(227,25,36,.9) 92%,transparent 92%)}
.proof{font-size:7pt;line-height:1.3;text-align:center;color:var(--muted)}
.proof b{color:#fff;font-weight:700}

.offer{display:flex;align-items:center;gap:.08in;border:1pt dashed var(--gold);border-radius:4pt;padding:3pt .08in}
.offer b{flex:none;font-weight:800;font-size:15pt;color:var(--gold);letter-spacing:-.01em}
.offer span{font-size:7pt;line-height:1.25;color:#fff;font-weight:600}

.cta{display:flex;align-items:center;gap:.1in}
.qr{flex:none;background:#fff;border-radius:4pt;padding:.045in}
.qr svg{display:block;width:1in;height:1in}
.cta .txt{flex:1;min-width:0}
.cta .scan{font-weight:800;font-size:10.5pt;line-height:1.05}
.cta .sub{font-size:6.8pt;line-height:1.25;color:var(--muted);margin-top:1pt}
.cta .or{font-size:6.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-top:3pt}
.cta .phone{font-weight:800;font-size:16.5pt;line-height:1;letter-spacing:-.01em;margin-top:1pt;white-space:nowrap}
.cta .url{font-size:7pt;font-weight:600;color:var(--muted);margin-top:1.5pt}

.towns{font-size:6.5pt;line-height:1.3;text-align:center;color:var(--muted)}
.towns b{color:#fff;font-weight:600}
`;

const html = (qr) => `
<section class="ad${OFFER_BIG ? ' has-offer' : ''}">
  <div class="bg"></div>
  <div class="in">
    <div class="top">
      ${logoSvg()}
      <h1>Your car, detailed<br><em>right here</em> in<br>your driveway.</h1>
    </div>
    <div class="ba">
      <div class="ph b"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-before.jpg'))}" style="object-position:40% 70%"><span class="chip">Before</span></div>
      <div class="ph a"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-after.jpg'))}" style="object-position:40% 70%"><span class="chip">After</span></div>
      <div class="cap">Same back seat. No judgment, I've seen everything.</div>
    </div>
    <div class="prices">
      <div><span>Exterior</span><b><small>from</small>$199</b></div>
      <div><span>Interior</span><b><small>from</small>$249</b></div>
      <div class="full"><span>Full detail</span><b><small>from</small>$369</b></div>
    </div>
    <div class="promise"><u>You don't pay until you love it.</u></div>
    <div class="proof"><b>5.0</b> ${stars(5)} <b>${REVIEWS} Google reviews</b> · <b>300+ cars</b> since 2021 · no deposit<br>
      You provide an outdoor spigot and outlet. That's how I keep prices down.</div>
    ${OFFER_BIG ? `<div class="offer"><b>${OFFER_BIG}</b><span>${OFFER_SMALL || ''}</span></div>` : ''}
    <div class="cta">
      <div class="qr">${qr}</div>
      <div class="txt">
        <div class="scan">Scan for your exact price</div>
        <div class="sub">About 60 seconds. No phone tag.</div>
        <div class="or">Or call or text Mikey</div>
        <div class="phone">${PHONE}</div>
        <div class="url">${SITE}</div>
      </div>
    </div>
    <div class="towns">I come to you, same price everywhere, no travel fee:<br><b>${TOWNS.join(' · ')}</b></div>
  </div>
</section>`;

async function checkQr(pngBuf) {
  const { data, info } = await sharp(pngBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (!code || code.data !== QR_URL) throw new Error(`QR does not decode to ${QR_URL}`);
  // Again at ~95 dpi, blurred and 30% darker: a phone over a magazine on a counter.
  const rough = await sharp(pngBuf).resize({ width: Math.round(info.width * 95 / 300) }).blur(1.2)
    .modulate({ brightness: 0.7 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hard = jsQR(new Uint8ClampedArray(rough.data), rough.info.width, rough.info.height);
  if (!hard || hard.data !== QR_URL) throw new Error('QR fails at 95 dpi with blur');
  console.log(`  QR ok (sharp and rough): ${code.data}`);
}

(async () => {
  const dir = path.join(OUT, 'print-files');
  fs.mkdirSync(dir, { recursive: true });
  const qr = await qrSvg();
  const browser = await chromium.launch();
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${html(qr)}</body></html>`);

  const ctx = await browser.newContext({ deviceScaleFactor: 300 / 96, viewport: { width: Math.round(W * 96), height: Math.round(H * 96) } });
  const page = await ctx.newPage();
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));

  const problems = await page.evaluate(({ W, H, SAFE, MIN_PT }) => {
    const out = [], IN = 96;
    const ad = document.querySelector('.ad').getBoundingClientRect();
    const box = { l: ad.left + SAFE * IN, t: ad.top + SAFE * IN, r: ad.left + (W - SAFE) * IN, b: ad.top + (H - SAFE) * IN };
    document.querySelectorAll('.in *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      if (r.left < box.l - .5 || r.top < box.t - .5 || r.right > box.r + .5 || r.bottom > box.b + .5)
        out.push(`<${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}"> outside the safe area`);
      if (el.closest('svg')) return;
      const pt = parseFloat(getComputedStyle(el).fontSize) * 0.75;
      if ([...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && pt < MIN_PT - .01)
        out.push(`"${el.textContent.trim().slice(0, 30)}" is ${pt.toFixed(1)} pt (minimum ${MIN_PT})`);
    });
    const col = document.querySelector('.in');
    if (col.scrollHeight > col.clientHeight + 1) out.push(`content taller than the ad by ${col.scrollHeight - col.clientHeight}px`);
    // the stack is spread with space-between; under ~2pt between blocks means it's crammed
    const kids = [...col.children].map(c => c.getBoundingClientRect());
    for (let i = 1; i < kids.length; i++) if (kids[i].top - kids[i - 1].bottom < 2.5)
      out.push(`blocks ${i} and ${i + 1} are touching (${(kids[i].top - kids[i - 1].bottom).toFixed(1)}px apart)`);
    return out;
  }, { W, H, SAFE, MIN_PT });

  const text = await page.evaluate(() => document.body.innerText);
  const banned = [[/—|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (he is neither)'],
    [/lynnwood|edmonds|kenmore/i, 'a town Mikey does not serve'], [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'],
    [/cars a week|limited spots|a few a week/i, 'a retired scarcity claim (CLAUDE.md, 2026-09-29)'],
    [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b|\bour (?:team|crew|detailers)\b/i, 'business "we" (it is one guy)'],
    [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day (it will change)'],
    [/rain-ready|december 31/i, 'the Rain-Ready offer (it ends Dec 31, 2026; this ad runs after)'],
    [/360-799|232-1355/, 'an old phone number'],
    [/(bring|brings|own)\s+(my own\s+)?(water|power|generator|tank)/i, 'bringing water or power (the customer provides both)']];
  for (const [re, what] of banned) if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  for (const must of ['spigot', 'outlet', PHONE, '60 seconds', '5.0', `${REVIEWS} Google reviews`, '300+', '$199', '$249', '$369', ...TOWNS])
    if (!text.toLowerCase().includes(must.toLowerCase())) problems.push(`copy is missing "${must}"`);
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }

  const pdf = path.join(dir, `ad${SUFFIX}.pdf`);
  await page.pdf({ path: pdf, width: `${W}in`, height: `${H}in`, printBackground: true, preferCSSPageSize: true });
  console.log('wrote', path.relative(ROOT, pdf));
  const buf = await (await page.$('.ad')).screenshot({ type: 'png' });
  await checkQr(buf);
  await sharp(buf).flatten({ background: '#0e0e0f' }).jpeg({ quality: 95 }).withMetadata({ density: 300 })
    .toFile(path.join(dir, `ad${SUFFIX}-300dpi.jpg`));
  await ctx.close();
  await browser.close();
  fs.unlinkSync(tmp);

  // The ad at actual size on a white magazine page, for looking at.
  const ad = await sharp(buf).resize({ width: 1219 }).toBuffer();
  const pad = 60, ah = (await sharp(ad).metadata()).height;
  await sharp({ create: { width: 1219 + pad * 2, height: ah + pad * 2, channels: 3, background: '#ffffff' } })
    .composite([{ input: ad, left: pad, top: pad }])
    .png().toFile(path.join(OUT, `preview${SUFFIX}.png`));
  console.log('wrote', `print/hometown-values/preview${SUFFIX}.png`);
})().catch(e => { console.error(e); process.exit(1); });
