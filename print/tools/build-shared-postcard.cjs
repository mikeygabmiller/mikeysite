// Renders the DRAFT shared EDDM postcard: Mikey's Mobile Detailing + Trinity
// Exterior Co. (Mikey's brother Louis) on one 11 x 8.5 in card.
//
//   cd print/tools && npm install && npm run shared
//
// Output lands in print/postcard-shared/. It is a pitch mockup until Louis
// fills in his side: the boxes marked "Louis:" are placeholders, and the
// generator lists them on every run. Mikey's half follows the repo's CLAUDE.md
// like every other print piece (facts table, voice, no em dashes). Trinity's
// half uses only what trinityexteriorco.com says about itself (2026-09-29).
//
// Why 11 x 8.5: each business gets half of each side, so neither one is "the
// back". Postage is the same $0.26 whatever the size; only printing grows.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'postcard-shared');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');
const SOCIAL = path.join(ROOT, 'social');

// ---- Mikey's facts: the CLAUDE.md facts table and PRICING.md. ----
const MK_PHONE = '(425) 600-7897';
const MK_QR = 'https://mikeysdetailing.com/?utm_source=sharedcard&utm_medium=mail#booking';
// ---- Trinity's facts: from trinityexteriorco.com, 2026-09-29. ----
const TR_PHONE = '(425) 595-7758';
const TR_SITE = 'trinityexteriorco.com';
const TR_QR = 'https://trinityexteriorco.com/?utm_source=sharedcard&utm_medium=mail';

const BLEED = 0.125, W = 11, H = 8.5, SAFE = 0.25, HALF = W / 2, BANNER = 1.25;
const INDICIA_MAX = { right: 1.625, top: 1.375 };
const MAILZONE = { w: 3.55, h: 2.05 };

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;
const logoSvg = (variant) => fs.readFileSync(path.join(SOCIAL, 'brand', variant === 'light' ? 'logo-light.svg' : 'logo.svg'), 'utf8')
  .replace('<svg ', '<svg class="logo" ');
const star = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = n => `<span class="stars">${star.repeat(n)}</span>`;
const qr = url => QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });

const CSS = `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
@page{size:${W + 2 * BLEED}in ${H + 2 * BLEED}in;margin:0}
:root{--ink:#0e0e0f;--red:#E31924;--red2:#B50E22;--gold:#D2AE5E;--gold-d:#9A7A2E;--cream:#F6F2EA;--line:#DDD5C6;
  --muted:rgba(255,255,255,.78);--sub:#55504a;--blue:#2b2fa8;--blue2:#1b1f78;--blue3:#12155a;--sky:#eef1f9;--bsub:#4a4f6e}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}
.page{position:relative;width:${W + 2 * BLEED}in;height:${H + 2 * BLEED}in;overflow:hidden;break-after:page}
.page:last-child{break-after:auto}
.stars{display:inline-flex;gap:1.5pt;vertical-align:middle}
.stars svg{width:9pt;height:9pt;fill:var(--gold)}
/* a half: bleed on its outer edges, content inside .pad at the safe margin */
.half{position:absolute;top:0;bottom:0}
.half.l{left:0;width:${HALF + BLEED}in}
.half.r{right:0;width:${HALF + BLEED}in}
.pad{position:absolute;display:flex;flex-direction:column;justify-content:space-between}
.pad>*{flex-shrink:0}
.qr{flex:none;background:#fff;border-radius:6pt;padding:.07in}
.qr svg{display:block;width:1.15in;height:1.15in}
.cta{display:flex;align-items:center;gap:.14in}
.cta .scan{font-weight:800;font-size:13pt;line-height:1.05}
.cta .sub{font-size:8pt;line-height:1.25;margin-top:2pt;opacity:.8}
.cta .or{font-size:7pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-top:5pt}
.cta .phone{font-weight:800;font-size:20pt;line-height:1;margin-top:1.5pt;white-space:nowrap}
.cta .url{font-size:8pt;font-weight:600;margin-top:2pt;opacity:.8}
.todo{border:1.4pt dashed #F5B301;border-radius:6pt;padding:.07in .1in;background:rgba(245,179,1,.12);font-size:8.4pt;line-height:1.3}
.todo b{display:block;font-weight:800;font-size:7pt;letter-spacing:.16em;text-transform:uppercase;color:#F5B301;margin-bottom:1pt}

/* ======== SIDE 1 ======== */
.banner{position:absolute;left:0;right:0;top:0;height:${BANNER + BLEED}in;background:linear-gradient(90deg,#1a0a0c 0%,#0e0e0f 45%,#0e0e0f 55%,var(--blue3) 100%);color:#fff;text-align:center}
.banner:after{content:'';position:absolute;left:0;right:0;bottom:0;height:.05in;background:var(--gold)}
.banner .in{position:absolute;left:${BLEED + SAFE}in;right:${BLEED + SAFE}in;top:${BLEED + 0.27}in}
.banner .eb{font-weight:700;font-size:7.8pt;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
.banner h1{font-weight:800;font-size:27pt;line-height:1.05;letter-spacing:-.02em;margin-top:.05in}
.banner h1 em{font-style:normal;color:var(--gold)}
.s1 .half{top:${BANNER + BLEED}in}
.s1 .mk{background:var(--ink);color:#fff}
.ba{position:absolute;left:0;right:0;top:0;height:2.45in;display:flex;gap:.03in;background:#fff}
.ba .ph{position:relative;flex:1;overflow:hidden}
.ba img{width:100%;height:100%;object-fit:cover;display:block}
.ba .chip{position:absolute;top:.14in;font-weight:800;font-size:7.5pt;letter-spacing:.16em;text-transform:uppercase;padding:3.5pt 6pt 3pt;border-radius:3pt;color:#fff}
.ba .b .chip{left:${BLEED + SAFE}in;background:rgba(10,10,10,.82)}.ba .a .chip{right:.14in;background:var(--red)}
.ba .cap{position:absolute;left:0;right:0;bottom:0;padding:.3in .2in .07in ${BLEED}in;text-align:center;background:linear-gradient(transparent,rgba(8,8,8,.88) 60%);
  font-family:'Caveat';font-weight:700;font-size:14pt;line-height:1;color:#fff}
.s1 .mk .pad{left:${BLEED + SAFE}in;right:${SAFE + 0.1}in;top:2.6in;bottom:${BLEED + SAFE}in}
.s1 .mk .top{display:flex;gap:.14in;align-items:center}
.s1 .mk .logo{flex:none;width:1.45in;height:auto}
.s1 .mk h2{font-weight:800;font-size:17pt;line-height:1.05;letter-spacing:-.02em}
.s1 .mk h2 em{font-style:normal;color:var(--red)}
.promise{font-family:'Caveat';font-weight:700;font-size:18pt;line-height:1;margin-top:4pt}
.promise u{text-decoration:none;background:linear-gradient(transparent 78%,rgba(227,25,36,.9) 78%,rgba(227,25,36,.9) 92%,transparent 92%)}
.offer{border:1.1pt solid rgba(210,174,94,.75);border-radius:7pt;padding:.08in .12in;background:rgba(210,174,94,.07)}
.offer .when{font-weight:700;font-size:6.8pt;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
.offer .name{font-weight:800;font-size:13pt;line-height:1.05;margin-top:1pt}
.offer .name em{font-style:normal;color:var(--red)}
.stack{list-style:none;margin-top:4pt;display:grid;grid-template-columns:1fr 1fr;gap:1.5pt 12pt}
.stack li{display:flex;justify-content:space-between;font-size:8.2pt;color:var(--muted)}
.stack li i{font-style:normal;font-weight:700;color:#fff}
.stack li s{color:rgba(255,255,255,.5);margin-right:4pt;font-weight:500}
.stack li.f i{color:var(--gold)}
.offer .tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:4pt;padding-top:3pt;border-top:.6pt solid rgba(255,255,255,.18);font-size:8.4pt;color:var(--muted)}
.offer .tot b{font-weight:800;font-size:15pt;color:#fff}
.offer .code{font-size:7.8pt;font-weight:600;margin-top:2pt}
.s1 .mk .cta .or{color:var(--gold)}

.s1 .tr{background:radial-gradient(90% 80% at 100% 0%,#3a40c4 0%,var(--blue) 40%,var(--blue2) 100%);color:#fff}
.s1 .tr .pad{left:${SAFE + 0.1}in;right:${BLEED + SAFE}in;top:.3in;bottom:${BLEED + SAFE}in}
.wm{line-height:.9}
.wm b{display:block;font-weight:800;font-size:34pt;letter-spacing:.06em}
.wm span{display:block;font-weight:700;font-size:10pt;letter-spacing:.42em;margin-top:3pt;opacity:.9}
.s1 .tr h2{font-weight:800;font-size:19pt;line-height:1.08;letter-spacing:-.015em}
.trstats{display:flex;gap:.18in}
.trstats div{line-height:1.1}
.trstats b{display:block;font-weight:800;font-size:18pt}
.trstats span{display:block;font-size:7pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.75);margin-top:2pt}
.svc{display:grid;grid-template-columns:1fr 1fr;gap:.07in}
.svc div{background:rgba(255,255,255,.1);border-radius:6pt;padding:.06in .09in}
.svc b{display:block;font-weight:800;font-size:10.5pt}
.svc span{display:block;font-size:7.6pt;line-height:1.25;color:rgba(255,255,255,.78);margin-top:1pt}
.s1 .tr .cta .or{color:#F5C542}
.s1 .tr .todo{color:#fff}

/* ======== SIDE 2 ======== */
.s2 .mk{background:var(--cream);color:var(--ink)}
.s2 .mk .pad{left:${BLEED + SAFE}in;right:${SAFE + 0.1}in;top:${BLEED + SAFE}in;bottom:${BLEED + SAFE}in}
.hi{display:flex;gap:.12in;align-items:flex-start}
.hi .logo{flex:none;width:1.1in;height:auto}
.hi h3{font-family:'Caveat';font-weight:700;font-size:21pt;line-height:.95}
.hi p{font-size:8.3pt;line-height:1.3;color:var(--sub);margin-top:2pt}
.hi p b{color:var(--ink)}
.rev{display:flex;gap:7pt}
.rev .q{font-weight:800;font-size:28pt;line-height:.7;color:var(--red);flex:none;margin-top:3pt}
.rev p{font-size:8.8pt;line-height:1.3;font-weight:500}
.rev .by{display:flex;align-items:center;gap:4pt;font-size:7.3pt;color:var(--sub);margin-top:2pt}
.rev .by .stars svg{width:7.5pt;height:7.5pt}
.sec h4{display:flex;align-items:center;gap:6pt;font-weight:800;font-size:7.2pt;letter-spacing:.18em;text-transform:uppercase;color:var(--red2)}
.sec h4:after{content:'';flex:1;height:.8pt;background:var(--line)}
.prices{margin-top:3pt}
.prices .row{display:flex;align-items:baseline;gap:4pt;padding:2.2pt 0;border-bottom:.6pt dotted #cfc6b5}
.prices .row:last-child{border-bottom:0}
.prices .nm{font-weight:700;font-size:9.8pt}
.prices .nm small{font-weight:500;font-size:7pt;color:var(--sub);margin-left:4pt}
.prices .fill{flex:1}
.prices .pr{font-size:7.6pt;color:var(--sub)}
.prices .pr b{font-weight:800;font-size:11.5pt;color:var(--ink)}
.note{font-size:7.4pt;color:var(--sub);margin-top:2pt}
.steps{margin-top:4pt;display:flex;gap:.12in}
.step{flex:1;display:flex;gap:5pt}
.step .n{flex:none;width:14pt;height:14pt;border-radius:50%;background:var(--ink);color:#fff;font-weight:800;font-size:8pt;display:flex;align-items:center;justify-content:center}
.step b{display:block;font-weight:800;font-size:8.8pt;line-height:1.15}
.step span{display:block;font-size:7.4pt;line-height:1.25;color:var(--sub);margin-top:1pt}
.grt{background:var(--ink);color:#fff;border-radius:7pt;padding:.09in .12in}
.grt h5{font-weight:800;font-size:13pt;line-height:1.05}
.grt h5 em{font-style:normal;color:var(--red)}
.grt p{font-size:7.8pt;line-height:1.3;color:var(--muted);margin-top:3pt}
.grt p b{color:var(--gold)}
.fine{font-size:6.3pt;line-height:1.3;color:#7a746b}

.s2 .tr{background:var(--sky);color:var(--blue3)}
.mailzone{position:absolute;right:0;top:0;width:${MAILZONE.w + BLEED}in;height:${MAILZONE.h + BLEED}in;background:#fff;border-bottom-left-radius:10pt}
.indicia{position:absolute;right:${BLEED + 0.28}in;top:${BLEED + 0.26}in;width:1.08in;border:1pt solid #000;padding:4pt 3pt;
  font-weight:700;font-size:6.6pt;line-height:1.28;text-align:center;letter-spacing:.03em;color:#000}
.addr{position:absolute;right:${BLEED + 0.28}in;top:${BLEED + 1.3}in;width:${MAILZONE.w - 0.56}in;font-weight:600;font-size:10pt;letter-spacing:.06em;text-transform:uppercase;color:#000}
.s2 .tr .corner{position:absolute;left:${SAFE + 0.1}in;top:${BLEED + SAFE}in;width:${HALF - MAILZONE.w - SAFE - 0.25}in;color:var(--blue)}
.s2 .tr .corner .wm b{font-size:22pt}.s2 .tr .corner .wm span{font-size:6.6pt;letter-spacing:.3em}
.s2 .tr .corner p{font-size:7.6pt;line-height:1.3;color:var(--bsub);margin-top:5pt}
.s2 .tr .pad{left:${SAFE + 0.1}in;right:${BLEED + SAFE}in;top:${BLEED + MAILZONE.h + 0.16}in;bottom:${BLEED + SAFE}in}
.s2 .tr h3{font-family:'Caveat';font-weight:700;font-size:21pt;line-height:.95;color:var(--blue3)}
.s2 .tr .sec h4{color:var(--blue)}
.s2 .tr .sec h4:after{background:#cfd5ea}
.list{list-style:none;margin-top:4pt;display:flex;flex-direction:column;gap:3pt}
.list li{position:relative;padding-left:11pt;font-size:8.6pt;line-height:1.25}
.list li b{font-weight:800}
.list li:before{content:'';position:absolute;left:0;top:2.6pt;width:6.5pt;height:3.6pt;border-left:1.6pt solid var(--blue);border-bottom:1.6pt solid var(--blue);transform:rotate(-45deg)}
.badge{display:flex;gap:.1in}
.badge div{flex:1;background:#fff;border-radius:6pt;padding:.06in .09in;font-size:7.6pt;line-height:1.25;color:var(--bsub)}
.badge b{display:block;font-weight:800;font-size:10pt;color:var(--blue3)}
.s2 .tr .todo{color:var(--blue3)}
.s2 .tr .cta .or{color:var(--blue)}
.s2 .tr .qr{box-shadow:0 0 0 .6pt #cfd5ea}
.s2 .mk .qr{box-shadow:0 0 0 .6pt var(--line)}
.s2 .mk .cta .or{color:var(--gold-d)}
`;

const photo = (f, cls, label) => `<div class="ph ${cls}"><img src="${fileUrl(path.join(SOCIAL, 'photos', f))}" style="object-position:40% 70%"><span class="chip">${label}</span></div>`;

const side1 = (mq, tq) => `
<section class="page s1">
  <div class="banner"><div class="in">
    <div class="eb">Two brothers · two Snohomish businesses · both 5.0 on Google</div>
    <h1>Rain's coming. Get the <em>house</em> and the <em>car</em> ready.</h1>
  </div></div>

  <div class="half l mk">
    <div class="ba">${photo('backseat-before.jpg', 'b', 'Before')}${photo('backseat-after.jpg', 'a', 'After')}
      <div class="cap">Same back seat. No judgment, I've seen everything.</div></div>
    <div class="pad">
      <div>
        <div class="top">${logoSvg()}<h2>Your car, detailed <em>right here</em> in your driveway.</h2></div>
        <div class="promise"><u>You don't pay until you love it.</u></div>
      </div>
      <div class="offer">
        <div class="when">Book by December 31</div>
        <div class="name">The Rain-Ready <em>Full Detail</em></div>
        <ul class="stack">
          <li><span>Interior detail</span><i>$249</i></li>
          <li class="f"><span>Exterior polish</span><i><s>$30</s>Free</i></li>
          <li><span>Exterior detail</span><i>$199</i></li>
          <li class="f"><span>Ceramic wax</span><i><s>$20</s>Free</i></li>
          <li><span></span><i></i></li>
          <li class="f"><span>RainX on the glass</span><i><s>$10</s>Free</i></li>
        </ul>
        <div class="tot"><span>Worth $508</span><span>from <b>$369</b></span></div>
        <div class="code">Just mention this postcard when you book.</div>
      </div>
      <div class="cta" data-qr="mk">
        <div class="qr">${mq}</div>
        <div><div class="scan">Scan for your exact price</div><div class="sub">About 60 seconds. No phone tag.</div>
          <div class="or">Rather talk? Call or text Mikey</div><div class="phone">${MK_PHONE}</div></div>
      </div>
    </div>
  </div>

  <div class="half r tr">
    <div class="pad">
      <div class="wm"><b>TRINITY</b><span>EXTERIOR CO.</span></div>
      <h2>Gutters clear, roof moss off and windows clean before the rain sets in.</h2>
      <div class="trstats">
        <div><b>5.0 ${stars(5)}</b><span>34 Google reviews</span></div>
        <div><b>Louis</b><span>does the work himself</span></div>
        <div><b>&lt; 24 hrs</b><span>free quote</span></div>
      </div>
      <div class="svc">
        <div><b>Gutters</b><span>Debris out, flushed, downspouts cleared</span></div>
        <div><b>Roofs</b><span>Soft-wash for moss, algae and staining</span></div>
        <div><b>Windows</b><span>Window cleaning</span></div>
        <div><b>Pressure washing</b><span>Driveways, walkways, siding, decks, patios</span></div>
      </div>
      <div class="todo"><b>Louis: your offer</b>One deal with an end date, for example a price on a gutter clean or a roof soft-wash booked by December 31. Mention this postcard.</div>
      <div class="cta" data-qr="tr">
        <div class="qr">${tq}</div>
        <div><div class="scan">Scan for a free quote</div><div class="sub">Back to you in under 24 hours.</div>
          <div class="or">Or call Louis</div><div class="phone">${TR_PHONE}</div><div class="url">${TR_SITE}</div></div>
      </div>
    </div>
  </div>
</section>`;

const side2 = (mq, tq) => `
<section class="page s2">
  <div class="half l mk"><div class="pad">
    <div class="hi">${logoSvg('light')}<div><h3>Hey, I'm Mikey.</h3>
      <p><b>300+ cars</b> around Snohomish County since 2021. It's just me, so the guy who texts you back is the guy who does your car. I bring every product and tool. You provide an outdoor spigot and an outlet.</p></div></div>
    <div class="rev"><div class="q">&ldquo;</div><div>
      <p>As someone who is very protective over their car, I was absolutely amazed at how Mike handled such a detailed task. Incredible attention to detail.</p>
      <div class="by">${stars(5)} Angela, Snohomish · one of 41 Google reviews</div></div></div>
    <div class="sec"><h4>Prices</h4>
      <div class="prices">
        <div class="row"><span class="nm">Exterior</span><span class="fill"></span><span class="pr">from <b>$199</b></span></div>
        <div class="row"><span class="nm">Interior</span><span class="fill"></span><span class="pr">from <b>$249</b></span></div>
        <div class="row"><span class="nm">Full detail<small>inside + out, most popular</small></span><span class="fill"></span><span class="pr">from <b>$369</b></span></div>
      </div>
      <div class="note">Size and condition set the price. The quote gives you the exact number. No travel fee.</div>
    </div>
    <div class="sec"><h4>How it works</h4>
      <div class="steps">
        <div class="step"><div class="n">1</div><div><b>Get your price.</b><span>Scan the code. About 60 seconds, then I text you a time.</span></div></div>
        <div class="step"><div class="n">2</div><div><b>I come to you.</b><span>Home or work. You don't have to be home.</span></div></div>
        <div class="step"><div class="n">3</div><div><b>Look, then pay.</b><span>We walk around it together and I fix anything you point at.</span></div></div>
      </div>
    </div>
    <div class="grt"><h5>Don't love it? <em>You don't pay.</em></h5>
      <p><b>Walk-around:</b> I fix it on the spot. <b>Free comeback</b> if you notice it the next day. <b>Every penny back</b> if you're still not happy. 300+ cars in, nobody has ever asked for a refund.</p></div>
    <div class="cta" data-qr="mk2">
      <div class="qr">${mq}</div>
      <div><div class="scan">Your exact price in 60 seconds</div><div class="or">Or call or text</div><div class="phone">${MK_PHONE}</div><div class="url">mikeysdetailing.com</div></div>
    </div>
    <div class="fine">Rain-Ready: book a Full Detail by December 31, 2026 and mention this postcard. $508 is a sedan's Interior and Exterior booked apart, plus the extras. I take 12 cars a week.</div>
  </div></div>

  <div class="half r tr">
    <div class="mailzone"></div>
    <div class="indicia">PRSRT STD<br>ECRWSS<br>U.S. POSTAGE PAID<br>EDDM RETAIL</div>
    <div class="addr">Local Postal Customer</div>
    <div class="corner"><div class="wm"><b>TRINITY</b><span>EXTERIOR CO.</span></div>
      <p>Owner-operated exterior cleaning, Snohomish County.</p></div>
    <div class="pad">
      <div><h3>Hey, I'm Louis.</h3>
        <div class="todo" style="margin-top:4pt"><b>Louis: two lines about you</b>How long you've been doing this, and why you do the work yourself. In your words.</div></div>
      <div class="sec"><h4>What I clean</h4>
        <ul class="list">
          <li><b>Gutters:</b> full debris removal, flush-outs, downspouts cleared</li>
          <li><b>Roofs:</b> soft-wash treatment for moss, algae and staining</li>
          <li><b>Windows:</b> window cleaning</li>
          <li><b>Pressure washing:</b> driveways, walkways, siding, decks and patios</li>
          <li><b>Christmas lights:</b> installation</li>
        </ul></div>
      <div class="badge">
        <div><b>5.0 on Google</b>34 reviews</div>
        <div><b>Licensed, bonded and insured</b>Trinity Exterior Co.</div>
      </div>
      <div class="todo"><b>Louis: pick a Google review</b>A short one from a customer in Snohomish, first name and town.</div>
      <div class="cta" data-qr="tr2">
        <div class="qr">${tq}</div>
        <div><div class="scan">Free quote, back in under 24 hours</div><div class="or">Call or text</div><div class="phone">${TR_PHONE}</div><div class="url">${TR_SITE}</div></div>
      </div>
    </div>
  </div>
</section>`;

async function decode(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height);
}
async function checkQr(el, want, label) {
  const buf = await el.screenshot({ type: 'png' });
  const a = await decode(buf);
  if (!a || a.data !== want) throw new Error(`QR ${label} decodes to ${a && a.data}`);
  const m = await sharp(buf).metadata();
  const rough = await sharp(buf).resize({ width: Math.round(m.width * 95 / 300) }).blur(1.2).modulate({ brightness: 0.7 }).png().toBuffer();
  const b = await decode(rough);
  if (!b || b.data !== want) throw new Error(`QR ${label} fails at 95 dpi with blur`);
  console.log(`  QR ok (${label}): ${want}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const [mq, tq] = await Promise.all([qr(MK_QR), qr(TR_QR)]);
  const browser = await chromium.launch();
  const pageW = W + 2 * BLEED, pageH = H + 2 * BLEED;
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${side1(mq, tq)}${side2(mq, tq)}</body></html>`);
  const ctx = await browser.newContext({ deviceScaleFactor: 300 / 96, viewport: { width: Math.round(pageW * 96), height: Math.round(pageH * 96) } });
  const page = await ctx.newPage();
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));

  const problems = await page.evaluate(({ BLEED, W, H, SAFE, INDICIA_MAX, MAILZONE }) => {
    const out = [], IN = 96;
    document.querySelectorAll('.page').forEach((pg, i) => {
      const pr = pg.getBoundingClientRect(), side = `side ${i + 1}`;
      const box = { l: pr.left + (BLEED + SAFE) * IN, t: pr.top + (BLEED + SAFE) * IN, r: pr.left + (BLEED + W - SAFE) * IN, b: pr.top + (BLEED + H - SAFE) * IN };
      pg.querySelectorAll('.pad *, .banner .in *, .corner *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width && (r.left < box.l - .5 || r.top < box.t - .5 || r.right > box.r + .5 || r.bottom > box.b + .5))
          out.push(`${side}: <${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}"> outside the safe area`);
      });
      pg.querySelectorAll('.pad').forEach(p => { if (p.scrollHeight > p.clientHeight + 1) out.push(`${side}: a column is ${p.scrollHeight - p.clientHeight}px too tall`); });
      // halves don't spill into each other
      pg.querySelectorAll('.half').forEach(h => {
        const hr = h.getBoundingClientRect();
        h.querySelectorAll('.pad *, .corner *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width && (r.left < hr.left + .1 * IN - .5 && !h.classList.contains('l') || r.right > hr.right - .1 * IN + .5 && h.classList.contains('l')))
            out.push(`${side}: <${el.tagName.toLowerCase()}> crosses into the other business's half`);
        });
      });
    });
    const back = document.querySelectorAll('.page')[1], br = back.getBoundingClientRect();
    const zone = { l: br.left + (BLEED + W - MAILZONE.w) * IN, b: br.top + (BLEED + MAILZONE.h) * IN };
    back.querySelectorAll('.pad *, .corner *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > zone.l && r.top < zone.b) out.push(`side 2: <${el.tagName.toLowerCase()}> intrudes on the mail zone`);
    });
    const ind = back.querySelector('.indicia').getBoundingClientRect();
    const fr = (br.left + (BLEED + W) * IN - ind.left) / IN, ft = (ind.bottom - br.top - BLEED * IN) / IN;
    if (fr > INDICIA_MAX.right || ft > INDICIA_MAX.top) out.push(`indicia at ${fr.toFixed(2)} in / ${ft.toFixed(2)} in, USPS max ${INDICIA_MAX.right} / ${INDICIA_MAX.top}`);
    return out;
  }, { BLEED, W, H, SAFE, INDICIA_MAX, MAILZONE });

  // Mikey's halves follow CLAUDE.md. Trinity's claims (insured) are Trinity's own.
  const all = await page.evaluate(() => document.body.innerText);
  const mk = await page.evaluate(() => [...document.querySelectorAll('.mk')].map(e => e.innerText).join('\n'));
  if (/—|&mdash;/.test(all)) problems.push('copy contains an em dash');
  const banned = [[/insur|licens/i, 'licensed/insured on Mikey\'s half (unconfirmed)'], [/lynnwood|edmonds/i, 'a town Mikey does not serve'],
    [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b/i, 'business "we"'],
    [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day'], [/\$(160|200|240|280|299|339|379)\b/, 'a retired price']];
  for (const [re, what] of banned) if (re.test(mk)) problems.push(`Mikey's half: ${what}: "${mk.match(re)[0]}"`);
  if (/lynnwood|edmonds/i.test(all)) problems.push('card names Lynnwood or Edmonds');
  for (const m of ['spigot', 'outlet', MK_PHONE, '60 seconds', '41 Google reviews', '300+', 'December 31, 2026', '$369', '$508'])
    if (!mk.toLowerCase().includes(m.toLowerCase())) problems.push(`Mikey's half is missing "${m}"`);
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }
  const todos = await page.$$eval('.todo b', els => els.map(e => e.textContent));
  console.log(`  DRAFT: ${todos.length} placeholders for Louis: ${todos.join(' | ')}`);

  for (const [sel, url] of [['[data-qr=mk] .qr', MK_QR], ['[data-qr=tr] .qr', TR_QR], ['[data-qr=mk2] .qr', MK_QR], ['[data-qr=tr2] .qr', TR_QR]])
    await checkQr(await page.$(sel), url, sel);

  const dir = path.join(OUT, 'print-files', '11x8.5');
  fs.mkdirSync(dir, { recursive: true });
  for (const [range, name] of [['1', 'side-1'], ['2', 'side-2']])
    await page.pdf({ path: path.join(dir, `${name}-DRAFT.pdf`), width: `${pageW}in`, height: `${pageH}in`, printBackground: true, preferCSSPageSize: true, pageRanges: range });
  const sides = await page.$$('.page'), px = 300, b = Math.round(BLEED * px);
  for (const [i, name] of ['side-1', 'side-2'].entries()) {
    const buf = await sides[i].screenshot({ type: 'png' });
    await sharp(buf).extract({ left: b, top: b, width: W * px, height: Math.round(H * px) }).toFile(path.join(OUT, `preview-${name}.png`));
  }
  await ctx.close(); await browser.close(); fs.unlinkSync(tmp);
  const s1 = await sharp(path.join(OUT, 'preview-side-1.png')).resize({ width: 1800 }).toBuffer();
  const s2 = await sharp(path.join(OUT, 'preview-side-2.png')).resize({ width: 1800 }).toBuffer();
  const h = (await sharp(s1).metadata()).height, pad = 70;
  await sharp({ create: { width: 1800 + pad * 2, height: h * 2 + pad * 3, channels: 3, background: '#e9e7e3' } })
    .composite([{ input: s1, left: pad, top: pad }, { input: s2, left: pad, top: h + pad * 2 }]).jpeg({ quality: 88 })
    .toFile(path.join(OUT, 'mockup-both-sides.jpg'));
  console.log('wrote print/postcard-shared/');
})().catch(e => { console.error(e); process.exit(1); });
