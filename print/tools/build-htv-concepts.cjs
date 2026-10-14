// Seven Hometown Values ad concepts, each as if a different designer made it
// (Mikey, 2026-10-14: "go outside the box with different text approaches,
// images, everything, even different colors as the main background so it
// stands out"). Each has its own idea, its own headline approach, its own
// photo (or none) and its own background colour. The facts don't change:
// prices, phone, 60 seconds, Lake Stevens, spigot and outlet, the Rain-Ready
// coupon, and a 1 in QR.
//
//   cd print/tools && npm run htv-concepts
//
// Writes print/hometown-values/concepts/c1..c7.png and all-seven.jpg. For
// choosing only: the pick moves into build-htv-ad.cjs with its full checks.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'hometown-values', 'concepts');
const SOCIAL = path.join(ROOT, 'social');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');
const photo = n => fileUrl(path.join(SOCIAL, 'photos', n));

// ---- The facts (CLAUDE.md facts table) ----
const PHONE = '(425) 600-7897';
const REVIEWS = 39;
const QR_URL = 'https://mikeysdetailing.com/?utm_source=hometownvalues&utm_medium=mail#booking';
const REVIEW = 'Mikey showed up on time, did exactly what he said, and charged exactly what he quoted. That kind of service is really rare these days.';
const TERMS = 'on any Full Detail booked by Dec 31, 2026. Mention Hometown Values.';
const W = 4.0625, H = 4.75, SAFE = 0.14, MIN_PT = 6.5;

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const face = (name, pkg, w) => `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${w}-normal.woff2`))}) format('woff2');font-weight:${w}}`;
const FONTS = [
  ...[400, 500, 600, 700, 800, 900].map(w => face('Outfit', 'outfit', w)),
  ...[600, 700, 800].map(w => face('Barlow Condensed', 'barlow-condensed', w)),
  ...[600, 700, 800].map(w => face('Fira XC', 'fira-sans-extra-condensed', w)),
  face('Caveat', 'caveat', 700), face('Anton', 'anton', 400), face('Marker', 'permanent-marker', 400),
  face('Racing', 'racing-sans-one', 400), ...[400, 700].map(w => face('Arimo', 'arimo', w)),
].join('');
const logo = dark => fs.readFileSync(path.join(SOCIAL, 'brand', dark ? 'logo.svg' : 'logo-light.svg'), 'utf8').replace('<svg ', '<svg class="logo" ');
const icon = () => fs.readFileSync(path.join(SOCIAL, 'brand', 'logo-icon.svg'), 'utf8').replace('<svg ', '<svg class="icon" ');
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = (n = 5) => `<span class="stars">${STAR.repeat(n)}</span>`;

const BASE = `
${FONTS}
@page{size:${W}in ${H}in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.ad{position:relative;width:${W}in;height:${H}in;overflow:hidden}
.in{position:absolute;inset:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.stars{display:inline-flex;gap:.5pt;vertical-align:-1pt}
.stars svg{width:7pt;height:7pt;fill:#E8A317}
.qr{flex:none;background:#fff;padding:.035in;border-radius:2pt}
.qr svg{display:block;width:1in;height:1in}
.ph{position:relative;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
`;

// ---------------------------------------------------------------------------
// 1. THE CITATION. Designer: the prankster. A bright yellow "ticket" for the
// back seat, with tick boxes for what every family car has. The fine is a detail.
const c1 = qr => ({
  name: 'c1-the-citation', title: 'The citation', designer: 'The prankster', bg: 'ticket yellow',
  css: `
.ad{background:#FFE14D;color:#151515;font-family:'Arimo',sans-serif}
.hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2pt solid #151515;padding-bottom:3pt}
.hd b{display:block;font-family:'Fira XC';font-weight:800;font-size:21pt;line-height:.9;letter-spacing:.01em}
.hd span{font-size:6.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.hd .no{text-align:right;font-family:'Arimo';font-size:6.5pt;line-height:1.3}
.hd .no i{display:block;font-style:normal;font-family:'Fira XC';font-weight:800;font-size:11pt;color:#C8102E}
.sec{font-size:6.5pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:2pt}
.box{display:grid;grid-template-columns:1fr 1fr;gap:2pt 6pt;font-size:8pt;font-weight:700}
.box div:before{content:'\\2611';font-size:10pt;margin-right:3pt;vertical-align:-1pt;color:#C8102E}
.loc{font-size:7pt;line-height:1.3;border-top:1pt dashed #151515;border-bottom:1pt dashed #151515;padding:3pt 0}
.loc b{font-weight:700}
.fine{display:flex;justify-content:space-between;align-items:center;background:#151515;color:#FFE14D;padding:4pt 6pt;border-radius:2pt}
.fine span{font-size:6.8pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff;line-height:1.25}
.fine b{font-family:'Fira XC';font-weight:800;font-size:20pt;line-height:1}
.fine small{display:block;font-size:6.5pt;font-weight:400;letter-spacing:0;text-transform:none;color:#ddd}
.cp{font-size:6.8pt;line-height:1.25}
.cp b{color:#C8102E}
.bot{display:flex;gap:.09in;align-items:center}
.bot .qr{border:1.2pt solid #151515}
.bot .p{font-family:'Fira XC';font-weight:800;font-size:19pt;line-height:1}
.bot .t{font-size:6.5pt;line-height:1.3}
.bot .t b{display:block;font-size:7pt;letter-spacing:.08em;text-transform:uppercase}
`,
  html: `<section class="ad"><div class="in">
  <div class="hd"><div><span>Mikey's Mobile Detailing</span><b>BACK SEAT<br>CITATION</b></div><div class="no">Issued in<i>LAKE STEVENS</i>5.0 ${stars()} ${REVIEWS} Google reviews</div></div>
  <div><div class="sec">Found in vehicle (check all that apply)</div>
    <div class="box"><div>Crumbs in the seams</div><div>Dog hair</div><div>Sticky cup holders</div><div>Road grime</div><div>Juice on the seat</div><div>Foggy glass</div></div></div>
  <div class="loc"><b>Remedy:</b> I come to your driveway or work. You provide an outdoor spigot and outlet: that's how I keep prices down. No travel fee.</div>
  <div class="fine"><span>Fine due<small>Full detail. Interior from $249, exterior from $199.</small></span><b>$369</b></div>
  <div class="cp"><b>Dismissed with this ad:</b> free polish, ceramic wax and RainX ${TERMS}</div>
  <div class="bot"><div class="qr">${qr}</div><div><div class="t"><b>Pay after it's done</b></div><div class="p">${PHONE}</div><div class="t">Call or text. Or scan for your exact price in 60 seconds.</div></div></div>
</div></section>`,
});

// ---------------------------------------------------------------------------
// 2. FOAM. Designer: the photographer. One picture: a car buried in foam on
// a driveway. Deep teal panel, few words. The picture says "he comes to you".
const c2 = qr => ({
  name: 'c2-foam', title: 'Foam', designer: 'The photographer', bg: 'full photo + deep teal',
  css: `
.ad{background:#0B4A55;color:#fff}
.hero{position:absolute;left:0;right:0;top:0;height:2.35in}
.hero img{object-position:50% 60%}
.hero:after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.45),rgba(0,0,0,0) 45%)}
.hero h1{position:absolute;left:${SAFE}in;right:${SAFE}in;top:${SAFE}in;z-index:1;font-family:'Anton';font-weight:400;font-size:22pt;line-height:.98;text-transform:uppercase;text-shadow:0 1pt 4pt rgba(0,0,0,.5)}
.hero .logo{position:absolute;right:${SAFE}in;bottom:.08in;width:1.05in;height:auto;z-index:1;filter:drop-shadow(0 1pt 3pt rgba(0,0,0,.6))}
.body{position:absolute;left:${SAFE}in;right:${SAFE}in;top:2.43in;bottom:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.lead{font-size:8pt;line-height:1.3;color:#d8eef0}
.lead b{color:#fff}
.pr{display:flex;gap:4pt}
.pr div{flex:1;text-align:center;background:rgba(255,255,255,.1);border-radius:2pt;padding:3pt 0;line-height:1}
.pr span{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:7pt;letter-spacing:.1em;text-transform:uppercase;color:#9fd3d8}
.pr b{font-weight:800;font-size:14pt}
.pr .f{background:#FFC845;color:#0B4A55}.pr .f span{color:#0B4A55}
.cp{font-size:6.8pt;line-height:1.25;color:#d8eef0;border-left:2pt solid #FFC845;padding-left:5pt}
.cp b{color:#FFC845}
.bot{display:flex;gap:.09in;align-items:center}
.bot .p{font-weight:800;font-size:17pt;line-height:1}
.bot .t{font-size:6.5pt;line-height:1.3;color:#d8eef0;margin-top:2pt}
`,
  html: `<section class="ad">
  <div class="ph hero"><img src="${photo('foam-sedan.jpg')}"><h1>The car wash<br>comes to you.</h1>${logo(true)}</div>
  <div class="body">
    <div class="lead"><b>Lake Stevens, I come to your driveway or work.</b> You provide an outdoor spigot and outlet: that's how I keep prices down. 5.0 on Google across ${REVIEWS} reviews.</div>
    <div class="pr"><div class="f"><span>Full detail</span><b>$369</b></div><div><span>Interior</span><b>$249</b></div><div><span>Exterior</span><b>$199</b></div></div>
    <div class="cp"><b>Free polish, ceramic wax and RainX</b> ${TERMS}</div>
    <div class="bot"><div class="qr">${qr}</div><div><div class="p">${PHONE}</div><div class="t">Call or text Mikey. Or scan for your exact price in 60 seconds.</div></div></div>
  </div>
</section>`,
});

// ---------------------------------------------------------------------------
// 3. JUST THE NUMBER. Designer: the Swiss modernist. Cobalt blue, one giant
// price, almost nothing else. In a magazine full of red and black, blue is the one that stops you.
const c3 = qr => ({
  name: 'c3-just-the-number', title: 'Just the number', designer: 'The minimalist', bg: 'cobalt blue',
  css: `
.ad{background:#1938C9;color:#fff}
.top{display:flex;justify-content:space-between;align-items:baseline;font-size:7pt;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.big{font-family:'Outfit';font-weight:900;font-size:76pt;line-height:.8;letter-spacing:-.04em;margin-top:2pt}
.big sup{font-size:30pt;vertical-align:28pt;letter-spacing:0}
.what{font-size:12pt;font-weight:700;line-height:1.15}
.what span{color:#9fb2ff}
.rule{height:1.5pt;background:#fff}
.row{display:flex;justify-content:space-between;font-size:8pt;font-weight:600}
.row b{font-weight:800}
.cp{font-size:7pt;line-height:1.3;color:#dfe5ff}
.cp b{color:#fff;background:#FF4D3D;padding:0 3pt;border-radius:1.5pt}
.bot{display:flex;gap:.1in;align-items:flex-end}
.bot .p{font-weight:800;font-size:18pt;line-height:1}
.bot .t{font-size:6.5pt;line-height:1.3;color:#dfe5ff;margin-top:3pt}
.bot .logo{width:1.1in;height:auto;display:block;margin-bottom:4pt}
`,
  html: `<section class="ad"><div class="in">
  <div class="top"><span>Lake Stevens</span><span>5.0 ${stars()} ${REVIEWS} Google reviews</span></div>
  <div><div class="big"><sup>$</sup>369</div>
  <div class="what">A full detail, inside and out.<br><span>In your driveway. I come to you.</span></div></div>
  <div><div class="rule"></div><div class="row" style="margin-top:3pt"><span>Interior only</span><b>$249</b></div><div class="row"><span>Exterior only</span><b>$199</b></div></div>
  <div class="cp"><b>Free polish, ceramic wax and RainX</b> ${TERMS} You provide an outdoor spigot and outlet.</div>
  <div class="bot"><div class="qr">${qr}</div><div>${logo(true)}<div class="p">${PHONE}</div><div class="t">Call or text. Or scan for your exact price in 60 seconds.</div></div></div>
</div></section>`,
});

// ---------------------------------------------------------------------------
// 4. ROADSIDE '74. Designer: the retro sign painter. Cream, mustard, burnt
// orange and brown stripes like an old car wash sign. Warm and local.
const c4 = qr => ({
  name: 'c4-retro-sign', title: "Roadside '74", designer: 'The sign painter', bg: 'cream + 70s stripes',
  css: `
.ad{background:#F6ECD6;color:#3B2414}
.stripes{position:absolute;left:0;right:0;top:1.02in;height:.32in;background:linear-gradient(#E9A23B 0 33%,#D9622B 33% 66%,#7A3B1D 66%)}
.top{display:flex;align-items:center;gap:.06in}
.top .icon{width:.95in;height:auto;flex:none}
.top h1{font-family:'Racing';font-weight:400;font-size:26pt;line-height:.85;color:#D9622B;-webkit-text-stroke:.5pt #3B2414}
.top h1 span{display:block;font-family:'Barlow Condensed';font-weight:800;font-size:11pt;letter-spacing:.14em;color:#3B2414;-webkit-text-stroke:0}
.gap{height:.34in}
.say{font-family:'Barlow Condensed';font-weight:800;font-size:15pt;line-height:1;text-transform:uppercase;text-align:center}
.say em{font-style:normal;color:#D9622B}
.menu{display:flex;gap:4pt}
.menu div{flex:1;text-align:center;border:1.5pt solid #3B2414;border-radius:12pt;padding:3pt 0;line-height:1;background:#fff8e8}
.menu span{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase}
.menu b{font-family:'Racing';font-weight:400;font-size:16pt;color:#D9622B}
.cp{font-size:6.8pt;line-height:1.25;text-align:center;background:#3B2414;color:#F6ECD6;border-radius:12pt;padding:3pt 8pt}
.cp b{color:#E9A23B}
.small{font-size:6.5pt;text-align:center;line-height:1.3}
.bot{display:flex;gap:.09in;align-items:center}
.bot .qr{border:1.5pt solid #3B2414}
.bot .p{font-family:'Racing';font-weight:400;font-size:20pt;line-height:1;color:#3B2414}
.bot .t{font-size:6.5pt;line-height:1.3;margin-top:2pt}
`,
  html: `<section class="ad"><div class="stripes"></div><div class="in">
  <div class="top">${icon()}<h1>Mikey's<span>Mobile car detailing</span></h1></div>
  <div class="gap"></div>
  <div class="say">Lake Stevens: <em>I'll wash it right where it's parked</em></div>
  <div class="menu"><div><span>Full detail</span><b>$369</b></div><div><span>Interior</span><b>$249</b></div><div><span>Exterior</span><b>$199</b></div></div>
  <div class="cp"><b>Free polish, ceramic wax and RainX</b> ${TERMS}</div>
  <div class="small">5.0 ${stars()} ${REVIEWS} Google reviews. No travel fee. You provide an outdoor spigot and outlet: that's how I keep prices down.</div>
  <div class="bot"><div class="qr">${qr}</div><div><div class="p">${PHONE}</div><div class="t">Call or text Mikey, or scan for your exact price in 60 seconds.</div></div></div>
</div></section>`,
});

// ---------------------------------------------------------------------------
// 5. THE FRIDGE NOTE. Designer: the scrapbooker. Notebook paper, two taped
// snapshots and Mikey's handwriting. Looks like something a neighbour left you.
const c5 = qr => ({
  name: 'c5-fridge-note', title: 'The fridge note', designer: 'The scrapbooker', bg: 'lined notebook paper',
  css: `
.ad{background:#FFFDF4 repeating-linear-gradient(transparent 0 15.5pt,#BFD4EA 15.5pt 16.2pt);color:#1d2a44}
.ad:before{content:'';position:absolute;top:0;bottom:0;left:.3in;width:1pt;background:#E58C8C}
.in{left:.4in}
.hi{font-family:'Marker';font-size:14pt;line-height:1.05;color:#1d2a44;padding-right:.02in}
.hi small{display:block;font-family:'Outfit';font-weight:700;font-size:6.5pt;letter-spacing:.12em;text-transform:uppercase;color:#6b7690;margin-bottom:2pt}
.hi span{color:#D7263D}
.snaps{position:relative;height:1.24in}
.snap{position:absolute;top:.05in;width:1.3in;background:#fff;padding:.05in .05in .2in;box-shadow:0 1pt 3pt rgba(0,0,0,.3)}
.snap .ph{height:.92in}
.snap span{position:absolute;left:0;right:0;bottom:.02in;text-align:center;font-family:'Marker';font-size:8.5pt}
.snap.a{left:0;transform:rotate(-5deg)}
.snap.b{left:1.45in;transform:rotate(4deg)}
.snap:before{content:'';position:absolute;top:-.06in;left:.42in;width:.45in;height:.14in;background:rgba(255,226,140,.85);transform:rotate(-3deg);z-index:1}
.arrow{position:absolute;left:1.2in;top:.42in;font-family:'Marker';font-size:20pt;color:#D7263D;z-index:2}
.note{font-family:'Caveat';font-weight:700;font-size:12.5pt;line-height:1.05}
.note b{color:#D7263D;font-weight:700}
.cp{font-family:'Outfit';font-size:6.8pt;line-height:1.25;border:1.2pt dashed #D7263D;padding:2pt 5pt;background:#fff;border-radius:2pt}
.cp b{color:#D7263D}
.bot{display:flex;gap:.09in;align-items:center}
.bot .qr{box-shadow:0 1pt 3pt rgba(0,0,0,.25)}
.bot .p{font-family:'Outfit';font-weight:800;font-size:16pt;line-height:1}
.bot .t{font-size:6.5pt;line-height:1.3;margin-top:2pt}
.bot .sig{font-family:'Caveat';font-weight:700;font-size:14pt;line-height:1;color:#D7263D}
`,
  html: `<section class="ad"><div class="in">
  <div class="hi"><small>Mikey's Mobile Detailing</small>Hey Lake Stevens,<br><span>I'll clean your back seat.</span></div>
  <div class="snaps"><div class="snap a"><div class="ph"><img src="${photo('backseat-before.jpg')}" style="object-position:50% 62%"></div><span>before</span></div>
    <div class="arrow">&rarr;</div>
    <div class="snap b"><div class="ph"><img src="${photo('backseat-after.jpg')}" style="object-position:50% 62%"></div><span>after</span></div></div>
  <div class="note">In your driveway. You just need an outdoor spigot and outlet. <b>Full detail $369</b>, interior $249, exterior $199. No travel fee. 5.0 on Google, ${REVIEWS} reviews.</div>
  <div class="cp"><b>Free polish, ceramic wax and RainX</b> ${TERMS}</div>
  <div class="bot"><div class="qr">${qr}</div><div><div class="sig">Mikey</div><div class="p">${PHONE}</div><div class="t">Call or text me. Or scan for your exact price in 60 seconds.</div></div></div>
</div></section>`,
});

// ---------------------------------------------------------------------------
// 6. THAT'S ALL I NEED. Designer: the copywriter. Turns the one thing people
// wonder about (what do I need?) into the headline. Mint green, a real
// driveway job with the hose and cord in shot.
const c6 = qr => ({
  name: 'c6-thats-all-i-need', title: "That's all I need", designer: 'The copywriter', bg: 'mint green',
  css: `
.ad{background:#BFEFD6;color:#0F2E22}
.top{display:flex;justify-content:space-between;align-items:center}
.top .logo{width:1.25in;height:auto}
.top .rt{font-size:6.5pt;font-weight:600;text-align:right;line-height:1.25}
.top .rt b{font-size:12pt;font-weight:800}
h1{font-family:'Outfit';font-weight:900;font-size:16pt;line-height:1.02;letter-spacing:-.01em}
.mid{display:flex;gap:.08in;align-items:stretch}
.mid .ph{width:1.55in;border-radius:3pt;flex:none}
.list{flex:1;display:flex;flex-direction:column;justify-content:space-between;font-size:8.5pt;font-weight:700}
.list div{display:flex;gap:4pt;align-items:center}
.list i{flex:none;width:11pt;height:11pt;border:1.5pt solid #0F2E22;border-radius:2pt;display:grid;place-items:center;font-style:normal;font-size:8pt;background:#fff}
.list small{font-size:6.8pt;font-weight:500;line-height:1.25}
.pr{display:flex;justify-content:space-between;background:#0F2E22;color:#BFEFD6;border-radius:3pt;padding:4pt 7pt;line-height:1}
.pr span{font-size:6.8pt;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
.pr b{display:block;color:#fff;font-weight:800;font-size:13pt;margin-top:1pt}
.cp{font-size:6.8pt;line-height:1.25}
.cp b{background:#fff;padding:0 3pt;border-radius:1.5pt}
.bot{display:flex;gap:.09in;align-items:center}
.bot .p{font-weight:800;font-size:17pt;line-height:1}
.bot .t{font-size:6.5pt;line-height:1.3;margin-top:2pt}
`,
  html: `<section class="ad"><div class="in">
  <div class="top">${logo(false)}<div class="rt"><b>5.0</b> ${stars()}<br>${REVIEWS} Google reviews</div></div>
  <h1>Got an outdoor spigot and an outlet? Then I can detail your car without you leaving home.</h1>
  <div class="mid"><div class="ph"><img src="${photo('highlander-gloss.jpg')}" style="object-position:40% 50%"></div>
    <div class="list"><div><i>&#10003;</i>Outdoor spigot</div><div><i>&#10003;</i>Power outlet</div><div><i>&#10003;</i>Your keys</div>
      <small>Using yours is how I keep prices down. I'm in Lake Stevens most weeks, no travel fee.</small></div></div>
  <div class="pr"><div><span>Full detail</span><b>$369</b></div><div><span>Interior</span><b>$249</b></div><div><span>Exterior</span><b>$199</b></div></div>
  <div class="cp"><b>Free polish, ceramic wax and RainX</b> ${TERMS}</div>
  <div class="bot"><div class="qr">${qr}</div><div><div class="p">${PHONE}</div><div class="t">Call or text Mikey. Or scan for your exact price in 60 seconds.</div></div></div>
</div></section>`,
});

// ---------------------------------------------------------------------------
// 7. TUNNEL VS DRIVEWAY. Designer: the strategist. A straight comparison
// with the drive-thru wash every reader already uses. Navy and yellow.
const c7 = qr => ({
  name: 'c7-wash-vs-mikey', title: 'Tunnel vs driveway', designer: 'The strategist', bg: 'navy + yellow',
  css: `
.ad{background:#13213D;color:#fff}
h1{font-family:'Fira XC';font-weight:800;font-size:19pt;line-height:.95;text-transform:uppercase}
h1 em{font-style:normal;color:#FFC300}
table{width:100%;border-collapse:collapse;font-size:7.5pt}
th{font-family:'Fira XC';font-weight:700;font-size:8pt;letter-spacing:.06em;text-transform:uppercase;padding:2pt 0;text-align:center;color:#9aa6c2}
th.m{color:#13213D;background:#FFC300;border-radius:2pt 2pt 0 0}
td{padding:2.5pt 3pt;border-top:1pt solid #2a3a5e;text-align:center}
td:first-child{text-align:left;color:#d6dcea}
td.m{background:rgba(255,195,0,.14);font-weight:800;color:#FFC300}
td.x{color:#7d89a6}
.pr{display:flex;gap:4pt}
.pr div{flex:1;text-align:center;border:1pt solid #2f4170;border-radius:2pt;padding:2pt 0;line-height:1}
.pr span{display:block;font-size:6.5pt;color:#9aa6c2;text-transform:uppercase;letter-spacing:.06em}
.pr b{font-weight:800;font-size:13pt}
.pr .f{border-color:#FFC300}.pr .f b{color:#FFC300}
.cp{font-size:6.8pt;line-height:1.25;color:#d6dcea}
.cp b{color:#FFC300}
.bot{display:flex;gap:.09in;align-items:center}
.bot .logo{width:1.05in;height:auto;display:block}
.bot .p{font-family:'Fira XC';font-weight:800;font-size:19pt;line-height:1;color:#FFC300;margin-top:2pt}
.bot .t{font-size:6.5pt;line-height:1.3;color:#d6dcea;margin-top:2pt}
`,
  html: `<section class="ad"><div class="in">
  <h1>The drive-thru wash<br>vs. <em>Mikey in your driveway</em></h1>
  <table><tr><th></th><th>Tunnel wash</th><th class="m">Mikey</th></tr>
    <tr><td>Who drives</td><td class="x">You</td><td class="m">I do</td></tr>
    <tr><td>Seats and carpet</td><td class="x">Not touched</td><td class="m">Steam cleaned</td></tr>
    <tr><td>Door jambs</td><td class="x">Skipped</td><td class="m">Wiped down</td></tr>
    <tr><td>Who does it</td><td class="x">A machine</td><td class="m">Same guy every time</td></tr>
    <tr><td>Where you wait</td><td class="x">In line</td><td class="m">At home</td></tr></table>
  <div class="pr"><div class="f"><span>Full detail</span><b>$369</b></div><div><span>Interior</span><b>$249</b></div><div><span>Exterior</span><b>$199</b></div></div>
  <div class="cp"><b>Free polish, ceramic wax and RainX</b> ${TERMS} In Lake Stevens most weeks. You provide an outdoor spigot and outlet. 5.0 on Google, ${REVIEWS} reviews.</div>
  <div class="bot"><div class="qr">${qr}</div><div>${logo(true)}<div class="p">${PHONE}</div><div class="t">Call or text. Or scan for your exact price in 60 seconds.</div></div></div>
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
  for (const build of [c1, c2, c3, c4, c5, c6, c7]) {
    const v = build(qr);
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${v.css}</style></head><body>${v.html}</body></html>`);
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    const problems = await page.evaluate(({ W, H, SAFE, MIN_PT }) => {
      const out = [], IN = 96, ad = document.querySelector('.ad').getBoundingClientRect();
      const box = { l: ad.left + SAFE * IN, t: ad.top + SAFE * IN, r: ad.left + (W - SAFE) * IN, b: ad.top + (H - SAFE) * IN };
      document.querySelectorAll('.ad *').forEach(el => {
        if (el.closest('svg') || el.closest('.qr') || el.closest('.snap') || el.closest('.arrow')) return;
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
        const r = el.getBoundingClientRect();
        if (r.left < box.l - .5 || r.top < box.t - .5 || r.right > box.r + .5 || r.bottom > box.b + .5)
          out.push(`"${el.textContent.trim().slice(0, 30)}" outside the safe area`);
        const pt = parseFloat(getComputedStyle(el).fontSize) * .75;
        if (pt < MIN_PT - .01) out.push(`"${el.textContent.trim().slice(0, 30)}" is ${pt.toFixed(1)} pt`);
      });
      document.querySelectorAll('.in, .body').forEach(c => { if (c.scrollHeight > c.clientHeight + 1) out.push(`content too tall by ${c.scrollHeight - c.clientHeight}px`); });
      return out;
    }, { W, H, SAFE, MIN_PT });
    const text = await page.evaluate(() => document.body.innerText);
    const banned = [[/—/, 'an em dash'], [/insur|licens/i, 'licensed/insured'], [/lynnwood|edmonds|snohomish|everett|monroe|marysville/i, 'another town'],
      [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b/i, 'business "we"'],
      [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day'], [/360-799|232-1355/, 'an old phone number'],
      [/bring\s+(the\s+)?(water|power)/i, 'bringing water or power'], [/seamless|elevate|unlock|transform|jaw-dropping/i, 'an agency word']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`copy has ${what}: "${text.match(re)[0]}"`);
    for (const must of ['spigot', 'outlet', PHONE, '60 seconds', '$199', '$249', '$369', 'Lake Stevens', 'RainX', 'Dec 31, 2026', String(REVIEWS)])
      if (!text.toLowerCase().includes(must.toLowerCase())) problems.push(`missing "${must}"`);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: W * 96, height: H * 96 } });
    if (!(await decodes(png))) problems.push('QR does not decode sharp and blurred');
    const file = path.join(OUT, `${v.name}.png`);
    fs.writeFileSync(file, png);
    shots.push({ file, label: `${shots.length + 1}. ${v.title}`, sub: `${v.designer} · ${v.bg}` });
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${v.name}`);
    problems.forEach(p => console.log('     ', p));
    if (problems.length) failed = true;
  }
  fs.unlinkSync(tmp);
  await browser.close();
  const cols = 4, tw = 800, th = Math.round(tw * H / W), pad = 40, lab = 100;
  const at = i => ({ left: pad + (i % cols) * (tw + pad), top: pad + Math.floor(i / cols) * (th + lab + pad) });
  const comp = [];
  for (const [i, s] of shots.entries()) {
    const { left, top } = at(i);
    comp.push({ input: Buffer.from(`<svg width="${tw}" height="${lab}"><text x="0" y="44" font-family="sans-serif" font-size="40" font-weight="700">${s.label.replace("'", '&#39;')}</text><text x="0" y="84" font-family="sans-serif" font-size="28" fill="#555">${s.sub}</text></svg>`), left, top });
    comp.push({ input: await sharp(s.file).resize(tw, th).toBuffer(), left, top: top + lab });
  }
  await sharp({ create: { width: pad + cols * (tw + pad), height: pad + 2 * (th + lab + pad), channels: 3, background: '#e4e1da' } })
    .composite(comp).jpeg({ quality: 82 }).toFile(path.join(OUT, 'all-seven.jpg'));
  console.log('wrote print/hometown-values/concepts/');
  if (failed) process.exitCode = 1;
})();
