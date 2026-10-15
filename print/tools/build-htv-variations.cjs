// Five different takes on the Hometown Values quarter page, for Mikey to pick
// from (2026-10-14: "5 variations with different styles and layouts, don't be
// biased to what is already made"). Same facts, same real review, same
// Rain-Ready coupon and the same 1 in QR on every one; only the idea changes.
//
//   cd print/tools && npm run htv-variations
//
// Writes print/hometown-values/variations/v1..v5.png and a side-by-side
// sheet. These are for choosing. Whichever one Mikey picks becomes the real
// generator (build-htv-ad.cjs), with its full checks, before art goes to Jim.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'hometown-values', 'variations');
const SOCIAL = path.join(ROOT, 'social');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts (CLAUDE.md facts table) ----
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';
const REVIEWS = 39;
const QR_URL = 'https://mikeysdetailing.com/?utm_source=hometownvalues&utm_medium=mail#booking';
const REVIEW = 'Mikey showed up on time, did exactly what he said, and charged exactly what he quoted. That kind of service is really rare these days.';
const REVIEW_BY = 'Matt K.';
const COUPON_TERMS = 'on any Full Detail booked by Dec 31, 2026. Mention Hometown Values.';
const W = 4.0625, H = 4.75, SAFE = 0.14, MIN_PT = 6.5;

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const face = (name, pkg, w) => `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${w}-normal.woff2`))}) format('woff2');font-weight:${w}}`;
const FONTS = [
  ...[400, 500, 600, 700, 800].map(w => face('Outfit', 'outfit', w)),
  ...[600, 700, 800].map(w => face('Barlow Condensed', 'barlow-condensed', w)),
  face('Caveat', 'caveat', 700), face('Anton', 'anton', 400),
  ...[600, 700, 800].map(w => face('Fira XC', 'fira-sans-extra-condensed', w)),
].join('');

const logo = dark => fs.readFileSync(path.join(SOCIAL, 'brand', dark ? 'logo.svg' : 'logo-light.svg'), 'utf8').replace('<svg ', '<svg class="logo" ');
const icon = () => fs.readFileSync(path.join(SOCIAL, 'brand', 'logo-icon.svg'), 'utf8').replace('<svg ', '<svg class="icon" ');
const BEFORE = fileUrl(path.join(SOCIAL, 'photos', 'backseat-before.jpg'));
const AFTER = fileUrl(path.join(SOCIAL, 'photos', 'backseat-after.jpg'));
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = n => `<span class="stars">${STAR.repeat(n)}</span>`;

const BASE = `
${FONTS}
@page{size:${W}in ${H}in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact}
:root{--ink:#0e0e0f;--red:#E31924;--gold:#D2AE5E;--sub:#4a4640;--line:#e3ddd2;--yel:#FFD200}
.ad{position:relative;width:${W}in;height:${H}in;overflow:hidden;background:#fff;color:var(--ink)}
.stars{display:inline-flex;gap:.6pt;vertical-align:-1pt}
.stars svg{width:7pt;height:7pt;fill:#E8A317}
.qr{flex:none;background:#fff;padding:.035in;border-radius:2pt}
.qr svg{display:block;width:1in;height:1in}
.ph{position:relative;overflow:hidden;background:#222}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.chip{position:absolute;top:.04in;left:.04in;font-weight:800;font-size:6.5pt;letter-spacing:.12em;text-transform:uppercase;padding:2pt 4pt 1.5pt;border-radius:2pt;color:#fff;background:var(--ink)}
.chip.r{background:var(--red)}
`;

// ---------------------------------------------------------------------------
// V1 "The clip-out coupon": the whole ad is a coupon. In a coupon magazine,
// readers flip for the dashed border and the big FREE. Price and phone ride on it.
const v1 = qr => ({
  name: 'v1-clip-out-coupon',
  title: 'The clip-out coupon',
  css: `
.ad{border:1.6pt dashed var(--ink);background:#fffdf6}
.sc{position:absolute;top:-6pt;left:.3in;font-size:11pt;background:#fffdf6;padding:0 2pt;line-height:1}
.in{position:absolute;inset:${SAFE + 0.04}in;display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:space-between}
.top{display:flex;align-items:center;justify-content:space-between;width:100%}
.top .logo{width:1.3in;height:auto}
.top .rt{font-size:6.5pt;font-weight:600;color:var(--sub);text-align:right;line-height:1.25}
.top .rt b{font-size:12pt;color:var(--ink);font-weight:800}
.kick{font-family:'Barlow Condensed';font-weight:700;font-size:10pt;letter-spacing:.14em;text-transform:uppercase;color:var(--sub)}
.free{font-family:'Anton';font-size:40pt;line-height:.9;color:var(--red);letter-spacing:.01em}
.what{font-family:'Barlow Condensed';font-weight:800;font-size:13.5pt;text-transform:uppercase;line-height:1.02}
.what small{display:block;font-family:'Outfit';text-transform:none;font-weight:600;font-size:7pt;color:var(--sub);margin-top:2pt;letter-spacing:0}
.mid{display:flex;gap:.07in;width:100%;align-items:center}
.mid .ph{width:.62in;height:.88in;border-radius:2pt}
.mid .q{flex:1;font-size:7pt;font-style:italic;font-weight:600;line-height:1.25;text-align:left}
.mid .q span{display:block;font-style:normal;font-weight:500;color:var(--sub);margin-top:2pt;font-size:6.5pt}
.bot{display:flex;gap:.1in;align-items:center;width:100%;border-top:1pt solid var(--ink);padding-top:.06in}
.bot .qr{border:1pt solid var(--ink)}
.bot .t{flex:1;text-align:left}
.bot .c{font-family:'Barlow Condensed';font-weight:700;font-size:8.5pt;letter-spacing:.1em;text-transform:uppercase;color:var(--red)}
.bot .p{font-weight:800;font-size:17pt;line-height:1;white-space:nowrap}
.bot .s{font-size:6.5pt;line-height:1.3;color:var(--sub);margin-top:2pt}
`,
  html: `<section class="ad"><span class="sc">&#9986;</span><div class="in">
  <div class="top">${logo(false)}<div class="rt"><b>5.0</b> ${stars(5)}<br>${REVIEWS} Google reviews</div></div>
  <div class="kick">Lake Stevens car detailing at your house</div>
  <div class="free">3 EXTRAS FREE</div>
  <div class="what">Ceramic wax, RainX and anti-fog<small>Free ${COUPON_TERMS} Full Detail from $369, Interior from $249, Exterior from $199.</small></div>
  <div class="mid"><div class="ph"><img src="${BEFORE}"><span class="chip">Before</span></div><div class="ph"><img src="${AFTER}"><span class="chip r">After</span></div>
    <div class="q">"${REVIEW}"<span>${stars(5)} ${REVIEW_BY}, Google review</span></div></div>
  <div class="bot"><div class="qr">${qr}</div><div class="t"><div class="c">Call or text Mikey</div><div class="p">${PHONE}</div>
    <div class="s">Or scan for your exact price in 60 seconds. I'm in Lake Stevens most weeks, no travel fee. You provide a spigot and outlet: that's how I keep prices down.</div></div></div>
</div></section>`,
});

// ---------------------------------------------------------------------------
// V2 "The photo does the talking": before and after fill the top half,
// cropped square onto the seat itself, with the headline on a red band across.
const v2 = qr => ({
  name: 'v2-big-photo',
  title: 'The photo does the talking',
  css: `
.ad{border:1.6pt solid var(--ink)}
.photos{position:absolute;left:0;right:0;top:0;height:2.05in;display:flex;gap:.03in;background:#fff}
.photos .ph{flex:1;height:100%}
.photos .ph img{object-position:50% 62%}
.photos .chip{top:${SAFE}in;left:${SAFE}in;font-size:8pt}
.photos .ph+.ph .chip{left:auto;right:${SAFE}in}
.band{position:absolute;left:0;right:0;top:1.62in;background:var(--red);color:#fff;padding:.05in ${SAFE}in;text-align:center}
.band h1{font-family:'Barlow Condensed';font-weight:800;font-size:17pt;line-height:.95;text-transform:uppercase}
.band h1 span{display:block;font-size:10pt;letter-spacing:.06em;font-weight:700}
.body{position:absolute;left:${SAFE}in;right:${SAFE}in;top:2.27in;bottom:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.prices{display:flex;justify-content:space-between;text-align:center;border-bottom:1pt solid var(--line);padding-bottom:.04in}
.prices div{flex:1;line-height:1}
.prices div+div{border-left:1pt solid var(--line)}
.prices span{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase;color:var(--sub)}
.prices b{font-weight:800;font-size:15pt}
.prices .f b{color:var(--red)}
.cp{border:1pt dashed var(--ink);border-radius:2pt;padding:2pt .07in;font-size:6.8pt;font-weight:600;line-height:1.25;display:flex;gap:.06in;align-items:center}
.cp b{flex:none;font-family:'Barlow Condensed';font-weight:800;font-size:13pt;color:var(--red)}
.q{font-size:6.8pt;font-style:italic;font-weight:600;line-height:1.25;text-align:center}
.q span{font-style:normal;font-weight:500;color:var(--sub)}
.bot{display:flex;gap:.1in;align-items:center}
.bot .t{flex:1}
.bot .p{font-weight:800;font-size:17pt;line-height:1;white-space:nowrap}
.bot .c{font-family:'Barlow Condensed';font-weight:700;font-size:8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--sub)}
.bot .s{font-size:6.5pt;line-height:1.3;color:var(--sub);margin-top:2pt}
.bot .rt{font-size:6.5pt;font-weight:700;margin-top:2pt}
`,
  html: `<section class="ad">
  <div class="photos"><div class="ph"><img src="${BEFORE}"><span class="chip">Before</span></div><div class="ph"><img src="${AFTER}"><span class="chip r">After</span></div></div>
  <div class="band"><h1>Lake Stevens car detailing<span>I come to your home or work</span></h1></div>
  <div class="body">
    <div class="prices"><div class="f"><span>Full detail</span><b>$369</b></div><div><span>Interior</span><b>$249</b></div><div><span>Exterior</span><b>$199</b></div></div>
    <div class="cp"><b>3 EXTRAS FREE</b><span>Ceramic wax, RainX and anti-fog ${COUPON_TERMS}</span></div>
    <div class="q">"${REVIEW}" <span>${REVIEW_BY}</span></div>
    <div class="bot"><div class="qr" style="border:1pt solid var(--ink)">${qr}</div><div class="t"><div class="c">Call or text Mikey</div><div class="p">${PHONE}</div>
      <div class="rt">5.0 ${stars(5)} ${REVIEWS} Google reviews</div>
      <div class="s">Scan for your exact price in 60 seconds. In Lake Stevens most weeks, no travel fee. You provide a spigot and outlet: that's how I keep prices down.</div></div></div>
  </div>
</section>`,
});

// ---------------------------------------------------------------------------
// V3 "The black box": a black ad on a page of white ones, safety yellow like
// his yard sign. Built to be the first thing the eye lands on.
const v3 = qr => ({
  name: 'v3-black-and-yellow',
  title: 'The black box',
  css: `
.ad{background:var(--ink);color:#fff}
.in{position:absolute;inset:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;justify-content:space-between}
.top .logo{width:1.35in;height:auto}
.top .rt{text-align:right;font-size:6.5pt;color:#cfcfcf;line-height:1.2}
.top .rt b{font-size:13pt;color:#fff;font-weight:800}
h1{font-family:'Fira XC';font-weight:800;font-size:25pt;line-height:.9;text-transform:uppercase;color:var(--yel)}
h1 span{display:block;color:#fff;font-size:14pt;font-weight:700;margin-top:2pt}
.row{display:flex;gap:.07in;align-items:stretch}
.row .ph{width:.78in;height:1.1in;border-radius:2pt}
.row .pr{flex:1;display:flex;flex-direction:column;justify-content:space-between}
.row .pr div{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1pt solid #333;padding-bottom:2pt}
.row .pr span{font-family:'Fira XC';font-weight:700;font-size:9pt;text-transform:uppercase;letter-spacing:.04em}
.row .pr b{font-family:'Fira XC';font-weight:800;font-size:15pt;color:var(--yel)}
.row .pr small{font-size:6.5pt;color:#bdbdbd}
.cp{background:var(--yel);color:var(--ink);border-radius:2pt;padding:3pt .07in;font-size:6.8pt;font-weight:600;line-height:1.25;display:flex;gap:.06in;align-items:center}
.cp b{flex:none;font-family:'Fira XC';font-weight:800;font-size:14pt;text-transform:uppercase}
.q{font-size:6.8pt;font-style:italic;color:#e6e6e6;line-height:1.25}
.q span{font-style:normal;color:#a9a9a9}
.bot{display:flex;gap:.1in;align-items:center}
.bot .p{font-family:'Fira XC';font-weight:800;font-size:22pt;line-height:1;color:var(--yel);white-space:nowrap}
.bot .c{font-family:'Fira XC';font-weight:700;font-size:8.5pt;letter-spacing:.08em;text-transform:uppercase}
.bot .s{font-size:6.5pt;line-height:1.3;color:#cfcfcf;margin-top:2pt}
`,
  html: `<section class="ad"><div class="in">
  <div class="top">${logo(true)}<div class="rt"><b>5.0</b> ${stars(5)}<br>${REVIEWS} Google reviews</div></div>
  <h1>Lake Stevens car detailing<span>I come to your driveway</span></h1>
  <div class="row"><div class="ph"><img src="${BEFORE}"><span class="chip">Before</span></div><div class="ph"><img src="${AFTER}"><span class="chip r">After</span></div>
    <div class="pr"><div><span>Full detail</span><b>$369</b></div><div><span>Interior</span><b>$249</b></div><div><span>Exterior</span><b>$199</b></div><small>Starting prices for a sedan. Exact price before I start.</small></div></div>
  <div class="cp"><b>3 extras free</b><span>Ceramic wax, RainX and anti-fog ${COUPON_TERMS}</span></div>
  <div class="q">"${REVIEW}" <span>${REVIEW_BY}, Google</span></div>
  <div class="bot"><div class="qr">${qr}</div><div><div class="c">Call or text Mikey</div><div class="p">${PHONE}</div>
    <div class="s">Or scan for your exact price in 60 seconds. In Lake Stevens most weeks, no travel fee. You provide a spigot and outlet: that's how I keep prices down.</div></div></div>
</div></section>`,
});

// ---------------------------------------------------------------------------
// V4 "The menu board": no big photo. A clean price menu with what each job
// is and how long it takes, like a sign in a shop. For the reader who is
// comparing prices, which in a coupon magazine is most of them.
const v4 = qr => ({
  name: 'v4-price-menu',
  title: 'The menu board',
  css: `
.ad{border:1.6pt solid var(--ink)}
.hd{position:absolute;left:0;right:0;top:0;background:var(--red);color:#fff;padding:${SAFE}in ${SAFE}in .07in;display:flex;justify-content:space-between;align-items:flex-end}
.hd h1{font-family:'Barlow Condensed';font-weight:800;font-size:19pt;line-height:.92;text-transform:uppercase}
.hd h1 span{display:block;font-size:9.5pt;letter-spacing:.06em;font-weight:700}
.hd .rt{text-align:right;font-size:6.5pt;line-height:1.2}
.hd .rt b{font-size:13pt;font-weight:800}
.hd .stars svg{fill:#fff}
.in{position:absolute;left:${SAFE}in;right:${SAFE}in;top:.86in;bottom:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.menu div{display:grid;grid-template-columns:1fr auto;align-items:baseline;padding:3pt 0;border-bottom:1pt dotted #999}
.menu b{font-family:'Barlow Condensed';font-weight:800;font-size:12pt;text-transform:uppercase}
.menu i{font-style:normal;font-weight:800;font-size:14pt}
.menu small{grid-column:1 / -1;font-size:6.5pt;color:var(--sub);line-height:1.25}
.menu .f b,.menu .f i{color:var(--red)}
.cp{border:1.2pt dashed var(--red);border-radius:2pt;padding:3pt .07in;text-align:center;font-size:6.8pt;font-weight:600;line-height:1.25}
.cp b{display:block;font-family:'Barlow Condensed';font-weight:800;font-size:12.5pt;color:var(--red);text-transform:uppercase}
.q{display:flex;gap:.06in;align-items:center}
.q .ph{width:.62in;height:.62in;border-radius:2pt;flex:none}
.q p{font-size:6.8pt;font-style:italic;font-weight:600;line-height:1.25}
.q p span{font-style:normal;font-weight:500;color:var(--sub)}
.bot{display:flex;gap:.1in;align-items:center;border-top:1.6pt solid var(--ink);padding-top:.05in}
.bot .logo{width:1.15in;height:auto;display:block}
.bot .p{font-weight:800;font-size:16pt;line-height:1;white-space:nowrap;margin-top:2pt}
.bot .s{font-size:6.5pt;line-height:1.3;color:var(--sub);margin-top:2pt}
`,
  html: `<section class="ad">
  <div class="hd"><h1>Lake Stevens<br>car detailing<span>I come to your home or work</span></h1><div class="rt"><b>5.0</b> ${stars(5)}<br>${REVIEWS} Google reviews</div></div>
  <div class="in">
    <div class="menu">
      <div class="f"><b>Full detail</b><i>$369</i><small>The interior and exterior below, together. 3 to 5 hours.</small></div>
      <div><b>Interior</b><i>$249</i><small>Full vacuum, steam on seats and carpet, dash, trim, door jambs. About 90 minutes.</small></div>
      <div><b>Exterior</b><i>$199</i><small>Hand wash, wheel deep clean, glass, spray sealant. About 1 to 2 hours.</small></div>
    </div>
    <div class="cp"><b>Free ceramic wax, RainX and anti-fog</b>${COUPON_TERMS.replace(/^on/, 'On')}</div>
    <div class="q"><div class="ph"><img src="${BEFORE}" style="object-position:50% 65%"><span class="chip">Before</span></div><p>"${REVIEW}" <span>${REVIEW_BY}, Google review</span></p></div>
    <div class="bot"><div class="qr" style="border:1pt solid var(--ink)">${qr}</div><div>${logo(false)}<div class="p">${PHONE}</div>
      <div class="s">Call, text, or scan for your exact price in 60 seconds. No travel fee. You provide a spigot and outlet: that's how I keep prices down.</div></div></div>
  </div>
</section>`,
});

// ---------------------------------------------------------------------------
// V5 "A note from Mikey": reads like a person, not an ad. Handwritten
// opener, a few plain first-person lines, signed. Everyone else in the
// magazine sounds like a company; this one sounds like the guy who shows up.
const v5 = qr => ({
  name: 'v5-note-from-mikey',
  title: 'A note from Mikey',
  css: `
.ad{border:1.6pt solid var(--ink);background:#fbf8f1}
.in{position:absolute;inset:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;gap:.08in}
.top .icon{width:.75in;height:auto;flex:none}
.hi{font-family:'Caveat';font-weight:700;font-size:23pt;line-height:.95;color:var(--red)}
.hi span{display:block;color:var(--ink);font-size:15pt}
.note{font-size:7.4pt;line-height:1.35}
.note b{font-weight:700}
.pics{display:flex;gap:.05in;align-items:stretch}
.pics .ph{width:.66in;height:.92in;border-radius:2pt}
.pics .pr{flex:1;display:flex;flex-direction:column;justify-content:center;gap:2pt;font-size:7.4pt}
.pics .pr div{display:flex;justify-content:space-between;border-bottom:1pt solid var(--line)}
.pics .pr b{font-weight:800}
.pics .pr .f{color:var(--red);font-weight:700}
.cp{border:1pt dashed var(--ink);border-radius:2pt;padding:2pt .07in;font-size:6.8pt;font-weight:600;line-height:1.25;background:#fff}
.cp b{color:var(--red);font-weight:800}
.q{font-size:6.8pt;font-style:italic;line-height:1.25;color:var(--sub)}
.bot{display:flex;gap:.1in;align-items:center}
.bot .sig{font-family:'Caveat';font-weight:700;font-size:16pt;line-height:1}
.bot .p{font-weight:800;font-size:16pt;line-height:1;white-space:nowrap}
.bot .s{font-size:6.5pt;color:var(--sub);margin-top:2pt;line-height:1.3}
`,
  html: `<section class="ad"><div class="in">
  <div class="top">${icon()}<div class="hi">Hi Lake Stevens,<span>I'm Mikey. I detail cars in your driveway.</span></div></div>
  <div class="note">You don't drive anywhere or wait in a lobby. I bring the tools, you provide an outdoor spigot and outlet (that's how I keep prices down). <b>You get the exact price before I start</b>, and you don't pay until you've walked around the car with me. <b>5.0 on Google across ${REVIEWS} reviews.</b></div>
  <div class="pics"><div class="ph"><img src="${BEFORE}"><span class="chip">Before</span></div><div class="ph"><img src="${AFTER}"><span class="chip r">After</span></div>
    <div class="pr"><div class="f"><span>Full detail from</span><b>$369</b></div><div><span>Interior from</span><b>$249</b></div><div><span>Exterior from</span><b>$199</b></div><div><span>Travel fee</span><b>none</b></div></div></div>
  <div class="cp"><b>3 extras free:</b> ceramic wax, RainX and anti-fog ${COUPON_TERMS}</div>
  <div class="q">"${REVIEW}" ${stars(5)} ${REVIEW_BY}</div>
  <div class="bot"><div class="qr" style="border:1pt solid var(--ink)">${qr}</div><div><div class="sig">Mikey</div><div class="p">${PHONE}</div>
    <div class="s">Call or text me, or scan for your exact price in 60 seconds. I'm in Lake Stevens most weeks.</div></div></div>
</div></section>`,
});

async function decodes(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ok = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  const rough = await sharp(buf).resize({ width: Math.round(info.width * 95 / 300) }).blur(1.2).modulate({ brightness: 0.7 })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hard = jsQR(new Uint8ClampedArray(rough.data), rough.info.width, rough.info.height);
  return ok && ok.data === QR_URL && hard && hard.data === QR_URL;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const qr = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'L', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 300 / 96, viewport: { width: Math.round(W * 96), height: Math.round(H * 96) } });
  const page = await ctx.newPage();
  const tmp = path.join(OUT, '.render.html');
  let failed = false;
  const shots = [];
  for (const build of [v1, v2, v3, v4, v5]) {
    const v = build(qr);
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${v.css}</style></head><body>${v.html}</body></html>`);
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    const problems = await page.evaluate(({ W, H, SAFE, MIN_PT }) => {
      const out = [], IN = 96, ad = document.querySelector('.ad').getBoundingClientRect();
      const box = { l: ad.left + SAFE * IN, t: ad.top + SAFE * IN, r: ad.left + (W - SAFE) * IN, b: ad.top + (H - SAFE) * IN };
      document.querySelectorAll('.ad *').forEach(el => {
        // the scissors sit on the dashed border on purpose
        if (el.closest('svg') || el.closest('.ph') || el.closest('.qr') || el.closest('.sc')) return;
        const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (!hasText) return;
        const r = el.getBoundingClientRect();
        if (r.left < box.l - .5 || r.top < box.t - .5 || r.right > box.r + .5 || r.bottom > box.b + .5)
          out.push(`"${el.textContent.trim().slice(0, 30)}" outside the safe area`);
        const pt = parseFloat(getComputedStyle(el).fontSize) * .75;
        if (pt < MIN_PT - .01) out.push(`"${el.textContent.trim().slice(0, 30)}" is ${pt.toFixed(1)} pt`);
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).whiteSpace === 'nowrap') out.push(`"${el.textContent.trim().slice(0, 20)}" overflows`);
      });
      document.querySelectorAll('.in, .body').forEach(c => { if (c.scrollHeight > c.clientHeight + 1) out.push(`content too tall by ${c.scrollHeight - c.clientHeight}px`); });
      return out;
    }, { W, H, SAFE, MIN_PT });
    const text = await page.evaluate(() => document.body.innerText);
    const banned = [[/—/, 'an em dash'], [/insur|licens/i, 'licensed/insured'], [/lynnwood|edmonds|snohomish|everett|monroe|marysville/i, 'another town'],
      [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b/i, 'business "we"'],
      [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day'], [/360-799|232-1355/, 'an old phone number'],
      [/bring\s+(the\s+)?(water|power)/i, 'bringing water or power']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`copy has ${what}: "${text.match(re)[0]}"`);
    for (const must of ['spigot', 'outlet', PHONE, '60 seconds', '5.0', String(REVIEWS), '$199', '$249', '$369', 'Lake Stevens', 'RainX', 'Dec 31, 2026', 'Matt K.'])
      if (!text.toLowerCase().includes(must.toLowerCase())) problems.push(`missing "${must}"`);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: W * 96, height: H * 96 } });
    if (!(await decodes(png))) problems.push('QR does not decode sharp and blurred');
    const file = path.join(OUT, `${v.name}.png`);
    fs.writeFileSync(file, png);
    shots.push({ file, title: v.title });
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${v.name}`);
    problems.forEach(p => console.log('     ', p));
    if (problems.length) failed = true;
  }
  fs.unlinkSync(tmp);
  await browser.close();
  // one sheet with all five, labelled, so they can be compared on a phone
  const tw = 900, th = Math.round(tw * H / W), pad = 40, lab = 70;
  const tiles = await Promise.all(shots.map(async (s, i) => ({
    input: await sharp(s.file).resize(tw, th).toBuffer(), left: pad + (i % 3) * (tw + pad), top: pad + lab + Math.floor(i / 3) * (th + lab + pad),
  })));
  const labels = shots.map((s, i) => ({ input: Buffer.from(`<svg width="${tw}" height="${lab}"><text x="0" y="48" font-family="sans-serif" font-size="44" font-weight="700">${i + 1}. ${s.title}</text></svg>`),
    left: pad + (i % 3) * (tw + pad), top: pad + Math.floor(i / 3) * (th + lab + pad) }));
  await sharp({ create: { width: pad + 3 * (tw + pad), height: pad + 2 * (th + lab + pad), channels: 3, background: '#d9d6cf' } })
    .composite([...tiles, ...labels]).jpeg({ quality: 82 }).toFile(path.join(OUT, 'all-five.jpg'));
  console.log('wrote print/hometown-values/variations/');
  if (failed) process.exitCode = 1;
})();
