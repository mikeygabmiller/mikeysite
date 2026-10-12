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
// puts a coupon box in the review's slot (there's room for one or the other). Off by default: a new offer is
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
// This is the Lake Stevens edition, so the ad talks to Lake Stevens only (Mikey,
// 2026-10-12: "make it like I'm local right in Lake Stevens"). The town is
// in the headline. He's based in Snohomish, so
// it says he's in Lake Stevens most weeks (true of all twelve towns), never
// that he lives or is based there.
const TOWN = 'Lake Stevens';
// The review slot. Right now it holds an EXAMPLE of the review that would sell
// best, so Mikey can find the closest real one (2026-10-12). A made-up review
// can't go to print (FTC rule, 16 CFR 465), so while REVIEW_IS_EXAMPLE is true
// the ad says EXAMPLE on it and the generator warns. Swap in a real customer's
// words (trimmed with "...", never reworded), their first name, and set it false.
const REVIEW = "My kids wrecked the back seat. Mikey came to my driveway, charged exactly what he quoted, and it looked brand new. I didn't even have to be home.";
const REVIEW_BY = 'First name, Lake Stevens';
const REVIEW_IS_EXAMPLE = true;

const W = 4.0625, H = 4.75;
const SAFE = 0.14;       // magazines trim and register loosely; keep type off the frame
const MIN_PT = 6.5;      // nothing smaller survives coupon-magazine printing

const [OFFER_BIG, OFFER_SMALL] = (process.env.OFFER || '').split('|');
const SUFFIX = OFFER_BIG ? '-offer' : '';

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

// White ad, so the light logo (black MOBILE DETAILING). A coupon magazine is
// mostly white ads with busy borders; a clean white box with a red headline
// and one black band at the bottom is what stands out there (and white is what
// Mikey picked for the call page, 2026-10-04).
const logoSvg = () => fs.readFileSync(path.join(SOCIAL, 'brand', 'logo-light.svg'), 'utf8')
  .replace('<svg ', '<svg class="logo" ');

const star = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = n => `<span class="stars">${star.repeat(n)}</span>`;

const qrSvg = () => QRCode.toString(QR_URL, {
  type: 'svg', errorCorrectionLevel: 'L', margin: 0, // L: 33 modules, not 37, so each dot prints bigger at this size
  color: { dark: '#0e0e0f', light: '#ffffff' },
});

const BAR_H = 1.27; // the black call band across the bottom: 1 in QR plus its frame

const CSS = `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${process.env.CANVA ? [400, 500, 600, 700, 800].map(w => fontFace('Poppins', 'poppins', w)).join('') : ''}
${[700, 800].map(w => fontFace('Barlow Condensed', 'barlow-condensed', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
@page{size:${W}in ${H}in;margin:0}
:root{--ink:#0e0e0f;--red:#E31924;--gold:#D2AE5E;--sub:#4a4640;--line:#e3ddd2}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:${process.env.CANVA ? "'Poppins'" : "'Outfit'"},sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.ad{position:relative;width:${W}in;height:${H}in;overflow:hidden;background:#fff;color:var(--ink);border:1.6pt solid var(--ink)}
.in{position:absolute;left:${SAFE}in;right:${SAFE}in;top:${SAFE}in;bottom:${BAR_H + 0.05}in;display:flex;flex-direction:column;justify-content:space-between}
.in>*{flex-shrink:0}
.stars{display:inline-flex;gap:.8pt}
.stars svg{width:7.5pt;height:7.5pt;fill:#E8A317}

.top{display:flex;align-items:center;justify-content:space-between}
.logo{width:1.62in;height:auto;display:block}
.rate{text-align:center;line-height:1}
.rate .r1{display:flex;align-items:center;justify-content:center;gap:3pt}
.rate b{font-weight:800;font-size:15pt;letter-spacing:-.02em}
.rate .stars{margin-top:0}
.rate span{display:block;font-weight:600;font-size:6.5pt;color:var(--sub);margin-top:2pt}
.rate span+span{margin-top:1pt}

h1{font-family:'Barlow Condensed';font-weight:800;text-transform:uppercase;font-size:23pt;line-height:.92;letter-spacing:.004em}
h1 em{font-style:normal;color:var(--red);display:block}

.mid{display:flex;gap:.07in;align-items:stretch}
/* The back-seat photos are portrait (900 x 1282). Shown whole, side by side,
   because cropping them to a strip cuts off the mess, which is the point. */
.ba{position:relative;flex:none;display:flex;gap:.025in;height:1.28in;border-radius:3pt;overflow:hidden;background:#fff}
.ba .ph{position:relative;height:100%;aspect-ratio:900/1282;overflow:hidden;background:#222}
.ba img{width:100%;height:100%;object-fit:cover;display:block}
.ba .chip{position:absolute;top:.05in;font-weight:800;font-size:6.5pt;letter-spacing:.12em;text-transform:uppercase;padding:2.5pt 4.5pt 2pt;border-radius:2pt;color:#fff}
.ba .b .chip{left:.05in;background:#0e0e0f}
.ba .a .chip{right:.05in;background:var(--red)}

.prices{flex:1;display:flex;flex-direction:column;gap:.045in}
.prices div{flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;line-height:1;background:var(--line);border-radius:3pt}
.prices span{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:8pt;letter-spacing:.08em;text-transform:uppercase;color:var(--sub)}
.prices b{display:block;font-weight:800;font-size:16pt;letter-spacing:-.015em;margin-top:1.5pt}
.prices .full{background:var(--red);color:#fff}
.prices .full span{color:#ffffff}

.fine{font-size:6.5pt;line-height:1.3;color:var(--sub);text-align:center}
.fine b{color:var(--ink);font-weight:700}
.rev{text-align:center}
.rev .q{font-weight:700;font-style:italic;font-size:7.4pt;line-height:1.2}
.rev .by{font-size:6.5pt;color:var(--sub);margin-top:2pt}
.rev .by .stars svg{width:6.5pt;height:6.5pt}
.rev .by i{font-style:normal;font-weight:800;color:#ffffff;background:var(--red);padding:.5pt 3pt;border-radius:2pt;margin-left:3pt}

.offer{display:flex;align-items:center;gap:.08in;border:1pt dashed var(--ink);border-radius:3pt;padding:2.5pt .08in}
.offer b{flex:none;font-family:'Barlow Condensed';font-weight:800;font-size:17pt;color:var(--red)}
.offer span{font-size:7pt;line-height:1.25;font-weight:600}

.bar{position:absolute;left:0;right:0;bottom:0;height:${BAR_H}in;background:var(--ink);color:#fff;
  display:flex;align-items:center;gap:.11in;padding:0 ${SAFE}in}
.qr{flex:none;background:#fff;border-radius:3pt;padding:.04in}
.qr svg{display:block;width:1in;height:1in}
.bar .txt{flex:1;min-width:0}
.bar .call{font-family:'Barlow Condensed';font-weight:700;font-size:8.5pt;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
.bar .phone{font-weight:800;font-size:18.5pt;line-height:1;letter-spacing:-.015em;white-space:nowrap;margin-top:1pt}
.bar .scan{font-size:7pt;line-height:1.25;color:#d6d6d6;margin-top:3pt}
.bar .scan b{color:#fff;font-weight:700}
.bar .promise{font-family:'Caveat';font-weight:700;font-size:13pt;line-height:1;margin-top:4pt}
.bar .promise u{text-decoration:none;background:linear-gradient(transparent 76%,rgba(227,25,36,.95) 76%,rgba(227,25,36,.95) 92%,transparent 92%)}
${process.env.CANVA ? '/* Poppins runs wider than Outfit */ .ba{height:1.16in} .rev .q{font-size:7.1pt}' : ''}
`;

const html = (qr) => `
<section class="ad${OFFER_BIG ? ' has-offer' : ''}">
  <div class="in">
    <div class="top">
      ${logoSvg()}
      <div class="rate"><div class="r1"><b>5.0</b>${stars(5)}</div><span>${REVIEWS} Google reviews</span></div>
    </div>
    <h1>${TOWN} car detailing.<em>I come to your home or work.</em></h1>
    <div class="mid">
      <div class="ba">
        <div class="ph b"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-before.jpg'))}"><span class="chip">Before</span></div>
        <div class="ph a"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-after.jpg'))}"><span class="chip">After</span></div>
      </div>
      <div class="prices">
        <div class="full"><span>Full detail from</span><b>$369</b></div>
        <div><span>Interior from</span><b>$249</b></div>
        <div><span>Exterior from</span><b>$199</b></div>
      </div>
    </div>
    ${OFFER_BIG ? `<div class="offer"><b>${OFFER_BIG}</b><span>${OFFER_SMALL || ''}</span></div>` : ''}
    ${OFFER_BIG ? '' : `<div class="rev"><div class="q">“${REVIEW}”</div><div class="by">${stars(5)} ${REVIEW_BY} · Google review${REVIEW_IS_EXAMPLE ? ' <i>EXAMPLE: swap in a real one</i>' : ''}</div></div>`}
    <div class="fine">I'm in ${TOWN} most weeks, no travel fee. You provide an outdoor spigot and outlet: that's how I keep prices down.</div>
  </div>
  <div class="bar">
    <div class="qr">${qr}</div>
    <div class="txt">
      <div class="call">Call or text Mikey</div>
      <div class="phone">${PHONE}</div>
      <div class="scan">Or scan for <b>your exact price</b> in 60 seconds. ${SITE}</div>
      <div class="promise"><u>You don't pay until you love it.</u></div>
    </div>
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
    document.querySelectorAll('.in *, .bar *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      // the QR's white frame may sit closer to the band's edge than type does
      if (el.closest('.qr')) return;
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
  const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (he is neither)'],
    [/lynnwood|edmonds|kenmore/i, 'a town Mikey does not serve'], [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'],
    [/cars a week|limited spots|a few a week/i, 'a retired scarcity claim (CLAUDE.md, 2026-09-29)'],
    [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b|\bour (?:team|crew|detailers)\b/i, 'business "we" (it is one guy)'],
    [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day (it will change)'],
    [/rain-ready|december 31/i, 'the Rain-Ready offer (it ends Dec 31, 2026; this ad runs after)'],
    [/360-799|232-1355/, 'an old phone number'],
    [/(bring|brings|own)\s+(my own\s+)?(water|power|generator|tank)/i, 'bringing water or power (the customer provides both)']];
  for (const [re, what] of banned) if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  for (const must of ['spigot', 'outlet', PHONE, '60 seconds', '5.0', `${REVIEWS} Google reviews`, '$199', '$249', '$369', `${TOWN} car detailing`, 'home or work', `in ${TOWN} most weeks`, 'no travel fee'])
    if (!text.toLowerCase().includes(must.toLowerCase())) problems.push(`copy is missing "${must}"`);
  // it goes to Lake Stevens homes only; any other town on it is wasted space
  for (const t of TOWNS) if (t !== TOWN && text.includes(t)) problems.push(`names ${t}, but this ad goes to ${TOWN} homes only`);
  if (REVIEW_IS_EXAMPLE && !OFFER_BIG) console.warn('  WARN the review is the EXAMPLE, not a real customer. Swap in a real one before this goes to Jim.');
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }

  // CANVA=1: write an HTML version Canva imports as an editable design, the same
  // way as the shared postcard (a PDF import loses the photos and doubles
  // letter-spaced text). Photos, the QR and the logo become image files; every
  // word stays a live text box. Canva has no Outfit, so this version is Poppins.
  if (process.env.CANVA) {
    const BASE = process.env.CANVA_BASE || 'https://raw.githubusercontent.com/mikeygabmiller/mikeysite/main/print/hometown-values/canva/';
    const cdir = path.join(OUT, 'canva');
    fs.mkdirSync(cdir, { recursive: true });
    // Canva's importer ignores aspect-ratio and crops the photo frames: pin each frame to its rendered size
    await page.$$eval('.ba .ph', els => els.forEach(e => {
      const r = e.getBoundingClientRect();
      e.style.width = r.width + 'px'; e.style.height = r.height + 'px'; e.style.aspectRatio = 'auto'; e.style.flex = 'none';
      const im = e.querySelector('img'); im.style.width = r.width + 'px'; im.style.height = r.height + 'px';
    }));
    // the photos go in whole at full size (they're shown uncropped), so they stay sharp if resized in Canva
    for (const side of ['before', 'after']) {
      fs.copyFileSync(path.join(SOCIAL, 'photos', `backseat-${side}.jpg`), path.join(cdir, `photo-${side}.jpg`));
      await page.$eval(`.ba .${side[0]} img`, (el, u) => { el.src = u; }, BASE + `photo-${side}.jpg`);
    }
    const q = await page.$('.qr svg'), qname = `qr${SUFFIX}.png`;
    await q.screenshot({ path: path.join(cdir, qname) });
    await q.evaluate((el, u) => { el.outerHTML = `<img src="${u}" style="display:block;width:${el.getBoundingClientRect().width}px">`; }, BASE + qname);
    // rasterize the logo SVG itself so the PNG is transparent
    const lg = await page.$('svg.logo'), lw = (await lg.boundingBox()).width, lname = `logo${SUFFIX}.png`;
    await sharp(Buffer.from(await lg.evaluate(el => el.outerHTML)), { density: 600 }).resize({ width: Math.round(lw / 96 * 300) }).png().toFile(path.join(cdir, lname));
    await lg.evaluate((el, a) => { el.outerHTML = `<img src="${a.u}" style="display:block;width:${a.w}px">`; }, { u: BASE + lname, w: lw });
    await page.evaluate(() => {
      const ad = document.querySelector('.ad');
      ad.querySelectorAll('.stars').forEach(st => { st.outerHTML = `<span style="color:${getComputedStyle(st.querySelector('svg')).fill};letter-spacing:1px">★★★★★</span>`; });
      // the hand-drawn underline is a gradient, which the importer drops
      ad.querySelectorAll('.promise u').forEach(u => { u.style.background = 'none'; u.style.textDecoration = 'underline'; u.style.textDecorationColor = '#E31924'; u.style.textDecorationThickness = '2px'; u.style.textUnderlineOffset = '2px'; });
      // Canva's importer misses CSS variables: write each box's own colors and fonts
      [ad, ...ad.querySelectorAll('*')].forEach(n => {
        const cs = getComputedStyle(n);
        if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') n.style.backgroundColor = cs.backgroundColor;
        if (parseFloat(cs.borderTopWidth)) n.style.border = `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`;
        if (![...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim())) return;
        n.style.fontFamily = cs.fontFamily; n.style.fontWeight = cs.fontWeight; n.style.fontSize = cs.fontSize; n.style.color = cs.color;
        n.style.letterSpacing = cs.letterSpacing; n.style.lineHeight = cs.lineHeight; n.style.textTransform = cs.textTransform;
      });
      ad.setAttribute('data-document-role', 'page');
      ad.setAttribute('data-label', 'Hometown Values quarter page (Lake Stevens)');
    });
    const css = CSS.replace(/@font-face\{[^}]*\}/g, '');
    const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;800&family=Caveat:wght@700&display=swap">';
    const body = await page.evaluate(() => document.body.innerHTML);
    const out = `<!doctype html><html><head><meta charset="utf-8"><title>Hometown Values ad (Lake Stevens)</title>${fonts}<style>${css}</style></head><body>${body}</body></html>`;
    if (/file:\/\//.test(out)) throw new Error('canva html still points at a local file');
    fs.writeFileSync(path.join(cdir, `ad${SUFFIX}.html`), out);
    console.log(`  wrote canva/ad${SUFFIX}.html (import from ${BASE}ad${SUFFIX}.html)`);
    await ctx.close(); await browser.close(); fs.unlinkSync(tmp);
    return;
  }

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
