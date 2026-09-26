// Renders the door hanger to print-ready PDFs and preview PNGs.
//
//   cd print/tools && npm install && npm run hanger
//
// Output lands in print/door-hanger/: print-files/<size>/{front,back}.pdf for
// the printer, preview-*.png and mockup-*.png for looking at. OFFER=0 builds
// the version without the Rain-Ready offer (files end in -no-offer). Read print/door-hanger/README.md before
// changing any copy: every line on the hanger is one more copy of the facts
// table in the repo's CLAUDE.md, and the README says why each section is there.
//
// Two trim sizes, same design:
//   4.25 x 11 in  the industry standard (GotPrint, UPrinting, 4over, PsPrint...)
//   4.50 x 11 in  Vistaprint's "large" door hanger
// Each PDF is one side at trim + 0.125 in bleed on every side.
//
// The die-cut hole is NOT in the file. The printer cuts it, and its size and
// position vary by printer (Vistaprint 1.18 in; most others 1.25 to 1.5 in,
// centred about 1.1 in down). So the top HOLE_ZONE inches of both sides hold
// nothing but the red band, and the previews draw a 1.5 in hole to check it.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'door-hanger');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');
const SOCIAL = path.join(ROOT, 'social');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';
// utm_* tells Google Analytics the visit came from a hanger; #booking lands
// them on the quote calculator. GA already fires qqc_submission on a sent
// quote, so Reports > Engagement > Events > qqc_submission, filtered by
// session source "doorhanger", is the hanger's booking count from the web.
// No utm_campaign on purpose: it pushed the code from 37x37 to 41x41 squares,
// and bigger squares scan more reliably off a door in bad light.
const QR_URL = 'https://mikeysdetailing.com/?utm_source=doorhanger&utm_medium=print#booking';
const TOWNS = ['Snohomish', 'Lake Stevens', 'Everett', 'Monroe', 'Mill Creek', 'Marysville',
  'Bothell', 'Duvall', 'Mukilteo', 'Woodinville', 'Granite Falls', 'Arlington'];

// The Rain-Ready offer is social/PLAYBOOK.md section 3, word for word in its
// terms. It needs Mikey's yes before it is printed. OFFER=0 builds the
// version without it.
const WITH_OFFER = process.env.OFFER !== '0';

const BLEED = 0.125;
const TRIM_H = 11;
const HOLE_ZONE = 2.2;   // inches from the top trim kept clear for the die cut
const SIZES = [
  { key: '4.25x11', w: 4.25, label: 'standard' },
  { key: '4.5x11', w: 4.5, label: 'vistaprint' },
];

// Static weights from @fontsource, not the variable files in social/fonts/.
// Chromium can only embed a variable font in a PDF as Type 3 glyph outlines,
// and some print shops' preflight rejects Type 3. Static files embed as normal
// TrueType. Same typefaces (Outfit, Caveat), both OFL.
const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const logoSvg = (variant) => {
  let s = fs.readFileSync(path.join(SOCIAL, 'brand', 'logo.svg'), 'utf8');
  if (variant === 'white') s = s.replace('fill="#E31924"', 'fill="#fff"').replace('stroke="#fff"', 'stroke="none"');
  if (variant === 'thick') s = s.replace('stroke-width="15"', 'stroke-width="22"');
  return s.replace('<svg ', '<svg class="logo" ');
};

const star = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = n => `<span class="stars">${star.repeat(n)}</span>`;

async function qrSvg() {
  return QRCode.toString(QR_URL, {
    type: 'svg', errorCorrectionLevel: 'M', margin: 0,
    color: { dark: '#0e0e0f', light: '#ffffff' },
  });
}

const CSS = (trimW) => `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
@page{size:${trimW + 2 * BLEED}in ${TRIM_H + 2 * BLEED}in;margin:0}
:root{--ink:#0e0e0f;--ink2:#1a1a1d;--red:#E31924;--red2:#B50E22;--red3:#8f0a1a;--gold:#D2AE5E;--gold-d:#9A7A2E;
  --cream:#F6F2EA;--line:#DDD5C6;--muted:rgba(255,255,255,.76);--sub:#55504a}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:${trimW + 2 * BLEED}in;height:${TRIM_H + 2 * BLEED}in;overflow:hidden;break-after:page}
.page:last-child{break-after:auto}
/* .trim is the finished piece; .page adds the bleed around it. */
.trim{position:absolute;left:${BLEED}in;top:${BLEED}in;width:${trimW}in;height:${TRIM_H}in}
.safe{position:absolute;left:.2in;right:.2in;top:${HOLE_ZONE + 0.14}in;bottom:.18in;display:flex;flex-direction:column}
.safe>*{flex-shrink:0}

/* the band the hole is punched through: red on both sides, a tag at a glance */
.band{position:absolute;left:0;right:0;top:0;height:${HOLE_ZONE + BLEED}in;
  background:radial-gradient(120% 90% at 85% 0%,#F0323C 0%,var(--red) 38%,var(--red2) 78%,var(--red3) 100%)}
.band:after{content:'';position:absolute;left:0;right:0;bottom:0;height:.045in;background:var(--gold)}
.band .side{position:absolute;top:${BLEED + 0.62}in;width:1.02in;color:#fff;text-align:center;line-height:1.05}
.band .side.l{left:${BLEED + 0.16}in}
.band .side.r{right:${BLEED + 0.16}in}
.band .side b{display:block;font-weight:800;font-size:22pt;letter-spacing:-.02em}
.band .side span{display:block;font-weight:700;font-size:6.6pt;letter-spacing:.14em;text-transform:uppercase;margin-top:3pt;opacity:.92}
.band .side .stars{display:flex;justify-content:center;gap:1.2pt;margin-top:3pt}
.band .side .stars svg{width:8.5pt;height:8.5pt;fill:#fff}

.stars{display:inline-flex;gap:1.5pt;vertical-align:middle}
.stars svg{width:9pt;height:9pt;fill:var(--gold)}

/* ============ FRONT ============ */
.front{background:var(--ink);color:#fff}
.front .page-bg{position:absolute;inset:0;background:
  radial-gradient(90% 40% at 100% 38%,rgba(227,25,36,.20),transparent 70%),var(--ink)}
.front .logo{display:block;width:2.62in;height:auto;margin:0 auto;overflow:visible}
.eyebrow{font-weight:700;font-size:7.4pt;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);text-align:center;margin-top:.13in}
.front h1{font-weight:800;font-size:25.5pt;line-height:1.02;letter-spacing:-.025em;text-align:center;margin-top:.07in}
.front h1 em{font-style:normal;color:var(--red)}
.front .promise{font-family:'Caveat';font-weight:700;font-size:21pt;line-height:1;text-align:center;margin-top:.08in;color:#fff}
.front .promise u{text-decoration:none;background:linear-gradient(transparent 78%,rgba(227,25,36,.9) 78%,rgba(227,25,36,.9) 92%,transparent 92%)}

.ba{position:relative;margin:.15in -${0.2 + BLEED}in 0;height:2.6in;display:flex;gap:.03in;background:#fff}
.ba .ph{position:relative;flex:1;overflow:hidden;background:#222}
.ba .ph img{width:100%;height:100%;object-fit:cover;display:block}
.ba .chip{position:absolute;top:.1in;font-weight:800;font-size:7pt;letter-spacing:.16em;text-transform:uppercase;padding:3.5pt 6pt 3pt;border-radius:3pt;color:#fff}
.ba .ph.b .chip{left:${0.2 + BLEED}in;background:rgba(10,10,10,.82)}
.ba .ph.a .chip{right:${0.2 + BLEED}in;background:var(--red)}
.ba .cap{position:absolute;left:0;right:0;bottom:0;padding:.3in ${0.2 + BLEED}in .07in;text-align:center;
  background:linear-gradient(transparent,rgba(8,8,8,.86) 62%);font-family:'Caveat';font-weight:700;font-size:13.5pt;line-height:1;color:#fff}

.proof{display:flex;align-items:center;justify-content:center;gap:5pt;margin-top:.11in;font-size:8.6pt;font-weight:600;color:var(--muted);white-space:nowrap}
.proof b{color:#fff;font-weight:800}
.proof i{font-style:normal;opacity:.45}

.offer{position:relative;margin-top:.16in;border:1.1pt solid rgba(210,174,94,.75);border-radius:7pt;padding:.1in .13in .1in;
  background:linear-gradient(180deg,rgba(210,174,94,.10),rgba(210,174,94,.03))}
.offer .when{font-weight:700;font-size:6.8pt;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
.offer .name{font-weight:800;font-size:15pt;line-height:1.05;letter-spacing:-.015em;margin-top:2pt}
.offer .name em{font-style:normal;color:var(--red)}
.offer .what{font-size:8.4pt;line-height:1.3;color:var(--muted);margin-top:3pt}
.offer .what b{color:#fff;font-weight:700}
.offer .code{display:flex;align-items:center;gap:4pt;margin-top:4pt;font-size:8.1pt;color:var(--muted)}
.offer .code kbd{font-family:'Outfit';font-weight:800;font-size:8pt;letter-spacing:.1em;background:#fff;color:var(--ink);padding:1.6pt 5pt 1.2pt;border-radius:2.5pt}
.offer .free{position:absolute;right:.12in;top:.1in;text-align:right;line-height:1}
.offer .free b{display:block;font-weight:800;font-size:19pt;color:var(--gold);letter-spacing:-.02em}
.offer .free span{display:block;font-weight:700;font-size:6.4pt;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-top:1.5pt}

.plain{margin-top:.16in;border:1.1pt solid rgba(255,255,255,.18);border-radius:7pt;padding:.1in .13in;display:flex;gap:.12in}
.plain div{flex:1}
.plain b{display:block;font-weight:800;font-size:12pt;line-height:1.05}
.plain span{display:block;font-size:7.8pt;line-height:1.25;color:var(--muted);margin-top:2pt}

.frev{margin-top:.14in;text-align:center}
.frev p{font-size:10pt;line-height:1.3;font-weight:500;color:#fff}
.frev .by{display:flex;align-items:center;justify-content:center;gap:4pt;font-size:7.6pt;color:var(--muted);margin-top:3pt}
.frev .by .stars svg{width:8pt;height:8pt}
.cta{display:flex;align-items:center;gap:.14in;margin-top:auto}
.qr{flex:none;background:#fff;border-radius:6pt;padding:.075in}
.qr svg{display:block;width:1.15in;height:1.15in}
.cta .txt{flex:1;min-width:0}
.cta .scan{font-weight:800;font-size:13pt;line-height:1.05;letter-spacing:-.01em}
.cta .scan-sub{font-size:8pt;line-height:1.25;color:var(--muted);margin-top:2.5pt}
.cta .or{font-size:7.4pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-top:6pt}
.cta .phone{font-weight:800;font-size:21pt;line-height:1;letter-spacing:-.01em;margin-top:1.5pt;white-space:nowrap}
.cta .url{font-size:8.4pt;font-weight:600;color:var(--muted);margin-top:3pt}

/* ============ BACK ============ */
.back{background:var(--cream);color:var(--ink)}
.back .band .side{top:${BLEED + 0.7}in}
.hi{display:flex;gap:.12in;align-items:flex-start}
.hi .logo{flex:none;width:1.18in;height:auto;margin-top:.02in}
.hi .who{flex:1}
.hi h2{font-family:'Caveat';font-weight:700;font-size:21pt;line-height:.95;color:var(--ink)}
.hi p{font-size:8.3pt;line-height:1.26;color:var(--sub);margin-top:2pt}
.hi p b{color:var(--ink);font-weight:700}

.sec{margin-top:.09in}
.sec h3{display:flex;align-items:center;gap:6pt;font-weight:800;font-size:7.4pt;letter-spacing:.18em;text-transform:uppercase;color:var(--red2)}
.sec h3:after{content:'';flex:1;height:.8pt;background:var(--line)}

.prices{margin-top:4pt}
.prices .row{display:flex;align-items:baseline;gap:4pt;padding:2.6pt 0;border-bottom:.6pt dotted #cfc6b5}
.prices .row:last-child{border-bottom:0}
.prices .nm{font-weight:700;font-size:10pt}
.prices .nm small{font-weight:500;font-size:7.6pt;color:var(--sub)}
.prices .tag{font-weight:800;font-size:5.8pt;letter-spacing:.12em;text-transform:uppercase;background:var(--red);color:#fff;padding:1.6pt 3.5pt 1.2pt;border-radius:2pt;position:relative;top:-1pt}
.prices .fill{flex:1}
.prices .pr{font-size:8pt;color:var(--sub);white-space:nowrap}
.prices .pr b{font-weight:800;font-size:12pt;color:var(--ink);letter-spacing:-.01em}
.note{font-size:7.7pt;line-height:1.3;color:var(--sub);margin-top:3pt}
.note b{color:var(--ink)}

.steps{margin-top:4pt;display:flex;flex-direction:column;gap:4pt}
.step{display:flex;gap:7pt;align-items:flex-start}
.step .n{flex:none;width:15pt;height:15pt;border-radius:50%;background:var(--ink);color:#fff;font-weight:800;font-size:8.4pt;display:flex;align-items:center;justify-content:center;margin-top:.5pt}
.step b{display:block;font-weight:800;font-size:9.6pt;line-height:1.15}
.step span{display:block;font-size:8pt;line-height:1.28;color:var(--sub);margin-top:1pt}

.grt{margin-top:.1in;background:var(--ink);color:#fff;border-radius:7pt;padding:.11in .13in .1in;position:relative;overflow:hidden}
.grt:before{content:'';position:absolute;right:-.4in;top:-.5in;width:1.6in;height:1.6in;border-radius:50%;background:radial-gradient(rgba(227,25,36,.35),transparent 70%)}
.grt h4{position:relative;font-weight:800;font-size:14pt;line-height:1.02;letter-spacing:-.015em}
.grt h4 em{font-style:normal;color:var(--red)}
.grt .three{position:relative;display:flex;gap:.08in;margin-top:5pt}
.grt .three div{flex:1}
.grt .three b{display:block;font-weight:800;font-size:7.8pt;color:var(--gold);letter-spacing:.02em}
.grt .three span{display:block;font-size:7.2pt;line-height:1.25;color:var(--muted);margin-top:1pt}
.grt .zero{position:relative;font-size:7.4pt;color:var(--muted);margin-top:4pt;padding-top:3pt;border-top:.6pt solid rgba(255,255,255,.14)}
.grt .zero b{color:#fff}

.rev{margin-top:.09in;display:flex;gap:7pt;align-items:flex-start}
.rev .q{font-family:'Outfit';font-weight:800;font-size:30pt;line-height:.7;color:var(--red);flex:none;margin-top:3pt}
.rev p{font-size:9pt;line-height:1.3;font-weight:500}
.rev .by{display:flex;align-items:center;gap:4pt;font-size:7.4pt;color:var(--sub);margin-top:2pt}
.rev .by .stars svg{width:7.5pt;height:7.5pt}

.gets{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:2.5pt 10pt;margin-top:5pt}
.gets li{position:relative;padding-left:11pt;font-size:8.4pt;line-height:1.25;font-weight:500}
.gets li:before{content:'';position:absolute;left:0;top:2.6pt;width:6.5pt;height:3.6pt;border-left:1.6pt solid var(--red);border-bottom:1.6pt solid var(--red);transform:rotate(-45deg)}
.towns{margin-top:.08in;font-size:7.3pt;line-height:1.35;color:var(--sub);text-align:center}
.towns b{color:var(--ink);font-weight:700}

.today{display:flex;align-items:center;gap:7pt;margin-top:.08in;border:1pt dashed #bdb3a2;border-radius:6pt;padding:4pt 8pt;
  font-family:'Caveat';font-weight:700;font-size:13.5pt;line-height:1;color:var(--ink)}
.today .box{flex:none;width:11pt;height:11pt;border:1.3pt solid var(--ink);border-radius:2pt;background:#fff}
.back .cta{margin-top:auto;padding-top:.08in;border-top:1pt solid var(--line)}
.back .cta .scan-sub,.back .cta .url{color:var(--sub)}
.back .cta .or{color:var(--gold-d)}
.back .qr{box-shadow:0 0 0 .6pt var(--line);padding:.06in}
.back .qr svg{width:1.1in;height:1.1in}
.fine{font-size:6.3pt;line-height:1.3;color:#7a746b;margin-top:.06in}
`;

const frontHtml = (qr) => `
<section class="page front">
  <div class="page-bg"></div>
  <div class="band">
    <div class="side l"><b>5.0</b>${stars(5)}<span>40 Google reviews</span></div>
    <div class="side r"><b>300+</b><span>cars detailed<br>since 2021</span></div>
  </div>
  <div class="trim"><div class="safe">
    ${logoSvg('thick')}
    <div class="eyebrow">Mobile car detailing · Snohomish County</div>
    <h1>Your car, detailed<br><em>right here</em> in<br>your driveway.</h1>
    <div class="promise"><u>You don't pay until you love it.</u></div>
    <div class="ba">
      <div class="ph b"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-before.jpg'))}" style="object-position:40% 78%"><span class="chip">Before</span></div>
      <div class="ph a"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-after.jpg'))}" style="object-position:40% 78%"><span class="chip">After</span></div>
      <div class="cap">Same back seat. No judgment, I've seen everything.</div>
    </div>
    ${WITH_OFFER ? `
    <div class="offer">
      <div class="when">Book by December 31</div>
      <div class="name">The Rain-Ready<br><em>Full Detail</em></div>
      <div class="free"><b>$50</b><span>of extras free</span></div>
      <div class="what">Full detail <b>from $299</b>, plus <b>ceramic wax, RainX on the windows and carpet shampoo</b> on me.</div>
      <div class="code">Just mention this hanger when you book.</div>
    </div>` : `
    <div class="plain">
      <div><b>No deposit.</b><span>You pay after the walk-around, never before.</span></div>
      <div><b>Same guy.</b><span>It's just me. No crew, no strangers.</span></div>
    </div>
    <div class="frev">
      <p>&ldquo;Mikey has done my car 4 times now and each time was amazing, quick, thorough, and a fabulous result.&rdquo;</p>
      <div class="by">${stars(5)} C. Wilson, Snohomish</div>
    </div>`}
    <div class="cta">
      <div class="qr">${qr}</div>
      <div class="txt">
        <div class="scan">Scan for your<br>exact price</div>
        <div class="scan-sub">About 60 seconds. No phone tag.</div>
        <div class="or">Rather talk? Call or text</div>
        <div class="phone">${PHONE}</div>
        <div class="url">${SITE}</div>
      </div>
    </div>
  </div></div>
</section>`;

const backHtml = (qr) => `
<section class="page back">
  <div class="band">
    <div class="side l"><b>$0</b><span>deposit</span></div>
    <div class="side r"><b>$0</b><span>travel fee</span></div>
  </div>
  <div class="trim"><div class="safe">
    <div class="hi">
      ${logoSvg()}
      <div class="who">
        <h2>Hey, I'm Mikey.</h2>
        <p><b>300+ cars</b> around Snohomish County since 2021. It's just me, so the guy who texts you back is the guy who does your car.</p>
      </div>
    </div>

    <div class="rev">
      <div class="q">&ldquo;</div>
      <div>
        <p>As someone who is very protective over their car, I was absolutely amazed at how Mike handled such a detailed task. Incredible attention to detail.</p>
        <div class="by">${stars(5)} Angela, Snohomish · Google review</div>
      </div>
    </div>

    <div class="sec"><h3>What a full detail gets</h3>
      <ul class="gets">
        <li>Full vacuum, every crevice</li><li>Hand wash and dry</li>
        <li>Seats and carpet steam cleaned</li><li>Tires and wheels deep cleaned</li>
        <li>Leather cleaned</li><li>Spray sealant on the paint</li>
        <li>Door jambs wiped down</li><li>Glass inside and out</li>
      </ul>
    </div>

    <div class="sec"><h3>Prices</h3>
      <div class="prices">
        <div class="row"><span class="nm">Exterior detail</span><span class="fill"></span><span class="pr">from <b>$160</b></span></div>
        <div class="row"><span class="nm">Interior detail</span><span class="fill"></span><span class="pr">from <b>$200</b></span></div>
        <div class="row"><span class="nm">Full detail <small>inside + out</small></span> <span class="tag">Most popular</span><span class="fill"></span><span class="pr">from <b>$299</b></span></div>
      </div>
      <div class="note">Size and condition set the price. <b>The quote gives you the exact number.</b></div>
    </div>

    <div class="sec"><h3>How it works</h3>
      <div class="steps">
        <div class="step"><div class="n">1</div><div><b>Get your exact price.</b><span>Scan the code. About 60 seconds, then I text you a time.</span></div></div>
        <div class="step"><div class="n">2</div><div><b>I come to you, home or work.</b><span>I bring every product. You just need an outdoor spigot and an outlet. You don't have to be home.</span></div></div>
        <div class="step"><div class="n">3</div><div><b>Look it over, then pay.</b><span>We walk around it together and I fix anything you point at.</span></div></div>
      </div>
    </div>

    <div class="grt">
      <h4>Don't love it? <em>You don't pay.</em></h4>
      <div class="three">
        <div><b>Walk-around</b><span>See something? I fix it on the spot.</span></div>
        <div><b>Free comeback</b><span>Notice it the next day? I come back.</span></div>
        <div><b>Every penny back</b><span>Still not happy? You pay nothing.</span></div>
      </div>
      <div class="zero"><b>300+ cars in, nobody has ever asked for a refund.</b></div>
    </div>

    <div class="today"><span class="box"></span><span>I just detailed a car on your street.</span></div>

    <div class="cta">
      <div class="qr">${qr}</div>
      <div class="txt">
        <div class="scan">Your exact price<br>in 60 seconds</div>
        <div class="or">Rather talk? Call or text</div>
        <div class="phone">${PHONE}</div>
        <div class="url">${SITE}</div>
      </div>
    </div>
    ${WITH_OFFER ? `<div class="fine">Rain-Ready: book a Full Detail by December 31, 2026 and mention this hanger. Ceramic wax, RainX and carpet shampoo come free. I take 12 cars a week.</div>` : ''}
  </div></div>
</section>`;

// Preview-only overlay: the die-cut hole and slit, so a human can see nothing
// important sits under it. Never in the print PDF.
const holeOverlay = (trimW, dia = 1.5, cy = 1.15) => `
<div style="position:absolute;left:${BLEED + trimW / 2 - dia / 2}in;top:${BLEED + cy - dia / 2}in;width:${dia}in;height:${dia}in;border-radius:50%;background:#e9e7e3;box-shadow:inset 0 0 0 .6pt rgba(0,0,0,.35)"></div>
<div style="position:absolute;left:${BLEED + trimW / 2 - 0.02}in;top:0;width:.04in;height:${BLEED + cy - dia / 2 + 0.05}in;background:#e9e7e3"></div>`;

async function checkQr(page, pngBuf, label) {
  // Decode the QR out of the rendered page itself, not the SVG: this is the
  // same pixels the printer gets.
  const { data, info } = await sharp(pngBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (!code) throw new Error(`QR did not decode on ${label}`);
  if (code.data !== QR_URL) throw new Error(`QR on ${label} decodes to ${code.data}`);
  // And again the hard way: ~95 dpi, blurred, 30% darker. A phone held at a
  // door in November light sees something like this. Checked on the trimmed
  // width so the dpi figure means the same thing on both sizes.
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
  const suffix = WITH_OFFER ? '' : '-no-offer';

  for (const size of SIZES) {
    const pageW = size.w + 2 * BLEED, pageH = TRIM_H + 2 * BLEED;
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS(size.w)}</style></head>
      <body>${frontHtml(qr)}${backHtml(qr)}</body></html>`;
    const tmp = path.join(OUT, `.render-${size.key}.html`);
    fs.writeFileSync(tmp, html);

    const ctx = await browser.newContext({ deviceScaleFactor: 300 / 96, viewport: { width: Math.round(pageW * 96), height: Math.round(pageH * 96) } });
    const page = await ctx.newPage();
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));

    // Overflow check: anything spilling out of the safe column is a bug.
    const problems = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.safe').forEach((s, i) => {
        const sb = s.getBoundingClientRect();
        s.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect();
          if (!r.width || el.closest('.ba')) return;
          if (r.bottom > sb.bottom + 0.5 || r.top < sb.top - 0.5 || r.left < sb.left - 0.5 || r.right > sb.right + 0.5)
            out.push(`${i ? 'back' : 'front'}: <${el.tagName.toLowerCase()} class="${el.className}"> outside the safe area`);
        });
        if (s.scrollHeight > s.clientHeight + 1) out.push(`${i ? 'back' : 'front'}: content taller than the safe area by ${s.scrollHeight - s.clientHeight}px`);
      });
      return out;
    });
    // Copy guard: the same rules as CLAUDE.md, checked on what actually rendered.
    const text = await page.evaluate(() => document.body.innerText);
    const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (unconfirmed)'],
      [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'],
      [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b|\bour (?:team|crew|detailers)\b/i, 'business "we" (it is one guy: "I"; "we walk around it together" is fine)'], [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day (unconfirmed)']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
    if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }

    // One file per side: Vistaprint and GotPrint both ask for front and back
    // as separate uploads, and every printer takes it that way.
    const dir = path.join(OUT, 'print-files', size.key === '4.25x11' ? '4.25x11-standard' : '4.5x11-vistaprint');
    fs.mkdirSync(dir, { recursive: true });
    for (const [range, side] of [['1', 'front'], ['2', 'back']]) {
      const pdf = path.join(dir, `${side}${suffix}.pdf`);
      await page.pdf({ path: pdf, width: `${pageW}in`, height: `${pageH}in`, printBackground: true, preferCSSPageSize: true, pageRanges: range });
      console.log('wrote', path.relative(ROOT, pdf));
    }

    // Previews: each side at 300 dpi with the bleed, then trimmed + holed.
    const sides = await page.$$('.page');
    for (const [i, name] of ['front', 'back'].entries()) {
      const buf = await sides[i].screenshot({ type: 'png' });
      await checkQr(page, buf, `${size.key} ${name}`);
      if (size.key === '4.25x11') {
        fs.writeFileSync(path.join(OUT, `.${name}${suffix}-bleed.png`), buf);
      }
    }
    // Hole check on the smallest usable width with the largest common die.
    // CHECK_DIR=/some/dir also writes the other size there, for eyeballing.
    if (size.key === '4.25x11' || process.env.CHECK_DIR) {
      const pdir = size.key === '4.25x11' ? OUT : process.env.CHECK_DIR;
      const tag = size.key === '4.25x11' ? suffix : `${suffix}-${size.key}`;
      await page.evaluate((o) => document.querySelectorAll('.page').forEach(p => p.insertAdjacentHTML('beforeend', o)), holeOverlay(size.w));
      for (const [i, name] of ['front', 'back'].entries()) {
        const el = (await page.$$('.page'))[i];
        const buf = await el.screenshot({ type: 'png' });
        const px = 300, b = Math.round(BLEED * px);
        await sharp(buf).extract({ left: b, top: b, width: Math.round(size.w * px), height: TRIM_H * px })
          .toFile(path.join(pdir, `preview-${name}${tag}.png`));
      }
    }
    await ctx.close();
    fs.unlinkSync(tmp);
  }
  await browser.close();

  // Side-by-side mockup of front and back on a door-ish grey.
  const f = await sharp(path.join(OUT, `preview-front${suffix}.png`)).resize({ height: 1500 }).toBuffer();
  const bk = await sharp(path.join(OUT, `preview-back${suffix}.png`)).resize({ height: 1500 }).toBuffer();
  const fm = await sharp(f).metadata();
  const pad = 70, W = fm.width * 2 + pad * 3, H = 1500 + pad * 2;
  await sharp({ create: { width: W, height: H, channels: 3, background: '#e9e7e3' } })
    .composite([{ input: f, left: pad, top: pad }, { input: bk, left: fm.width + pad * 2, top: pad }])
    .png().toFile(path.join(OUT, `mockup-front-back${suffix}.png`));
  for (const n of ['front', 'back']) { try { fs.unlinkSync(path.join(OUT, `.${n}${suffix}-bleed.png`)); } catch {} }
  console.log('wrote previews + mockup');
})().catch(e => { console.error(e); process.exit(1); });
