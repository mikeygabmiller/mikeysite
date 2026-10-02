// Renders the shared EDDM postcard: Mikey's Mobile Detailing on one side,
// Trinity Exterior Co. (Mikey's brother Louis) holiday lighting on the other.
// One 11 x 8.5 in card, mailed once, postage split two ways.
//
//   cd print/tools && npm install && npm run shared
//
// Output lands in print/postcard-shared/. Mikey's side follows the repo's
// CLAUDE.md like every other print piece (facts table, voice, no em dashes).
// Trinity's side uses only the facts Trinity's own CLAUDE.md lists as
// established, plus the lighting prices Louis approved on 2026-09-26
// (trinityexteriorco.com/christmas-lighting-cost/). No timers, no customer
// count, no install dates: those are on Trinity's "ask first" list.
//
// Why one full side each and not half and half: a card gets about three
// seconds at the mailbox. One business per side reads as one clear message
// whichever way it lands; two halves with two looks read as a coupon pack.
// Each side carries a one-line pointer to the other.
//
// TR_OFFER: Louis has no postcard offer yet. Set it to a short string (with
// an end date) and it prints as a yellow band on his side.

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
const TOWNS = ['Snohomish', 'Lake Stevens', 'Everett', 'Monroe', 'Mill Creek', 'Marysville', 'Bothell', 'Duvall', 'Mukilteo', 'Woodinville', 'Granite Falls', 'Arlington'];
// ---- Trinity's facts: Trinity's CLAUDE.md, checked 2026-10-01. ----
const TR_PHONE = '425-595-7758';
const TR_SITE = 'trinityexteriorco.com/lights';
const TR_QR = 'https://trinityexteriorco.com/lights/?utm_source=sharedcard&utm_medium=mail';
const TR_REVIEWS = 34; // cleaning reviews, as of 2026-09-24. Recheck before printing.
// e.g. OFFER='$100 off|Book by Oct 31 and mention this postcard' npm run shared
const TR_OFFER = process.env.OFFER ? (([big, small]) => ({ big, small }))(process.env.OFFER.split('|')) : null;

const BLEED = 0.125, W = 11, H = 8.5, SAFE = 0.25, STRIP = 0.5;
const INDICIA_MAX = { right: 1.625, top: 1.375 };
const MAILZONE = { w: 3.5, h: 1.95 };
const HERO = 5.7; // height of Louis's photo on his side, trim to where the band starts

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;
const logoSvg = () => fs.readFileSync(path.join(SOCIAL, 'brand', 'logo.svg'), 'utf8').replace('<svg ', '<svg class="logo" ');
const star = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = n => `<span class="stars">${star.repeat(n)}</span>`;
const qr = url => QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
const IN = n => `${n}in`;

const CSS = `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
${[500, 600, 700, 800, 900].map(w => fontFace('Inter', 'inter', w)).join('')}
${fontFace('Marker', 'permanent-marker', 400)}
@page{size:${W + 2 * BLEED}in ${H + 2 * BLEED}in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}
.page{position:relative;width:${W + 2 * BLEED}in;height:${H + 2 * BLEED}in;overflow:hidden;break-after:page}
.page:last-child{break-after:auto}
.stars{display:inline-flex;gap:1.5pt;vertical-align:middle}
.stars svg{width:10pt;height:10pt}
.box{position:absolute}
.qr{flex:none;background:#fff;border-radius:6pt;padding:.08in}
.qr svg{display:block;width:1.25in;height:1.25in}
.strip{position:absolute;left:0;right:0;bottom:0;height:${STRIP + BLEED}in;display:flex;align-items:flex-start;justify-content:center;padding-top:.08in;font-size:8.6pt;letter-spacing:.01em}
.strip b{font-weight:800}

/* ================= MIKEY (photo side) =================
   mikeysdetailing.com: near-black, brand red #C8102E, gold #C9A24B, Outfit, Caveat for the human bits. */
.mk{font-family:'Outfit',sans-serif;background:#0a0a0a;color:#fff;
  --red:#C8102E;--red2:#A00C24;--gold:#C9A24B;--gold2:#E4CD8B;--muted:#c2c2c2;--dim:#9a9a9a;--line:rgba(201,162,75,.34)}
.mk .stars svg{fill:var(--gold)}
.mk .ba{position:absolute;left:0;top:0;width:${5.35 + BLEED}in;height:${4.95 + BLEED}in;display:flex;gap:.035in;background:#0a0a0a}
.mk .ba .ph{position:relative;flex:1;overflow:hidden}
.mk .ba img{width:100%;height:100%;object-fit:cover;object-position:50% 62%;display:block}
.mk .chip{position:absolute;top:${BLEED + SAFE}in;font-weight:800;font-size:8pt;letter-spacing:.16em;text-transform:uppercase;padding:3.5pt 7pt 3pt;border-radius:3pt}
.mk .b .chip{left:${BLEED + SAFE}in;background:rgba(10,10,10,.85)}.mk .a .chip{right:.16in;background:var(--red)}
.mk .ba .cap{position:absolute;left:0;right:0;bottom:0;padding:.45in .2in .1in ${BLEED + SAFE}in;background:linear-gradient(transparent,rgba(8,8,8,.92) 62%);
  font-family:'Caveat';font-weight:700;font-size:16pt;line-height:1}
.mk .left{left:${BLEED + SAFE}in;width:${5.35 - SAFE - 0.15}in;top:${BLEED + 5.1}in;bottom:${BLEED + STRIP + 0.14}in;display:flex;flex-direction:column;justify-content:space-between}
.mk .promise{font-family:'Caveat';font-weight:700;font-size:28pt;line-height:1}
.mk .promise u{text-decoration:none;background:linear-gradient(transparent 76%,var(--red) 76%,var(--red) 90%,transparent 90%)}
.mk .grt{font-size:9.2pt;line-height:1.35;color:var(--muted);margin-top:3pt}
.mk .grt b{color:var(--gold2);font-weight:700}
.mk .stats{display:flex;gap:.1in}
.mk .stats div{flex:1;border:1pt solid var(--line);border-radius:6pt;padding:.06in .08in;background:rgba(201,162,75,.07)}
.mk .stats b{display:block;font-weight:800;font-size:15pt;line-height:1}
.mk .stats span{display:block;font-size:6.8pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-top:3pt}
.mk .need{font-size:8.8pt;line-height:1.35;color:var(--muted)}
.mk .need b{color:#fff}
.mk .right{left:${BLEED + 5.6}in;right:${BLEED + SAFE}in;top:${BLEED + SAFE}in;bottom:${BLEED + STRIP + 0.14}in;display:flex;flex-direction:column;justify-content:space-between}
.mk .head{display:flex;gap:.16in;align-items:center}
.mk .logo{flex:none;width:1.45in;height:auto}
.mk .eb{font-weight:700;font-size:7.4pt;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
.mk h1{font-weight:800;font-size:27pt;line-height:1.02;letter-spacing:-.02em;margin-top:.05in}
.mk h1 em{font-style:normal;color:var(--red)}
.mk .offer{border:1.2pt solid var(--gold);border-radius:8pt;padding:.1in .14in;background:linear-gradient(135deg,rgba(201,162,75,.14),rgba(201,162,75,.04))}
.mk .offer .when{font-weight:800;font-size:7.4pt;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
.mk .offer .name{font-weight:800;font-size:18pt;line-height:1.05;margin-top:2pt}
.mk .offer .name em{font-style:normal;color:var(--red)}
.mk .stack{list-style:none;margin-top:5pt;display:grid;grid-template-columns:1fr 1fr;gap:2pt 14pt}
.mk .stack li{display:flex;justify-content:space-between;font-size:8.6pt;color:var(--muted)}
.mk .stack li i{font-style:normal;font-weight:700;color:#fff}
.mk .stack li s{color:rgba(255,255,255,.45);margin-right:4pt;font-weight:500}
.mk .stack li.f i{color:var(--gold2)}
.mk .offer .tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:5pt;padding-top:4pt;border-top:.6pt solid rgba(255,255,255,.18);font-size:8.6pt;color:var(--muted)}
.mk .offer .tot b{font-weight:800;font-size:19pt;color:#fff}
.mk .offer .code{font-size:8.2pt;font-weight:700;margin-top:2pt}
.mk .prices{display:flex;gap:.09in}
.mk .prices div{flex:1;background:#141414;border:1pt solid #2a2a2a;border-radius:6pt;padding:.06in .09in}
.mk .prices span{display:block;font-size:7pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
.mk .prices b{display:block;font-weight:800;font-size:15pt;margin-top:1pt}
.mk .prices small{font-size:7.4pt;font-weight:600;color:var(--dim);margin-right:2pt}
.mk .pnote{font-size:7.4pt;color:var(--dim);margin-top:3pt}
.mk .cta{display:flex;align-items:center;gap:.16in;background:linear-gradient(135deg,#d81232,#a00c24);box-shadow:0 6pt 22pt rgba(200,16,46,.35);border-radius:9pt;padding:.1in}
.mk .cta .scan{font-weight:800;font-size:15pt;line-height:1.05}
.mk .cta .sub{font-size:8.2pt;color:#fff;opacity:.9;margin-top:2pt}
.mk .cta .or{font-size:7.2pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold2);margin-top:6pt}
.mk .cta .phone{font-weight:800;font-size:22pt;line-height:1;margin-top:1pt;white-space:nowrap}
.mk .cta .url{font-size:8.2pt;font-weight:600;color:#fff;opacity:.9;margin-top:2pt}
.mk .fine{font-size:6.5pt;line-height:1.35;color:#8a8a8a}
.mk .strip{background:var(--red);color:#fff;font-family:'Outfit'}

/* ================= TRINITY (mail side) =================
   trinityexteriorco.com/lights: Inter, blues #2e3eb0 / #232f8a / #1a2360, yellow #ffb400 CTA.
   Built to the postcard rules in README: one photo carries the side, a short headline
   in the top half, the CTA is the brightest block, bottom right. */
.tr{font-family:'Inter',sans-serif;background:#121a4a;color:#fff;
  --blue:#2e3eb0;--deep:#1a2360;--accent:#ffb400;--accent-ink:#231a02;--warm:#ffd98a;--soft:#cdd3f2}
.tr .stars svg{fill:var(--accent)}
.tr .photo{position:absolute;left:0;top:0;width:${W + 2 * BLEED}in;height:${HERO + BLEED}in;
  -webkit-mask-image:linear-gradient(180deg,#000 74%,transparent 100%)}
.tr .photo img{width:100%;height:100%;object-fit:cover;object-position:50% 38%;display:block}
.tr .shade{position:absolute;left:0;top:0;width:${W + 2 * BLEED}in;height:${HERO + BLEED}in;
  background:linear-gradient(180deg,transparent 45%,rgba(10,14,44,.55) 72%,rgba(18,26,74,.0) 100%),linear-gradient(90deg,rgba(10,14,44,.55) 0%,transparent 55%)}
.tr .wm{left:${BLEED + SAFE}in;top:${BLEED + SAFE}in;line-height:1;text-shadow:0 1pt 8pt rgba(0,0,0,.6)}
.tr .wm b{display:block;font-weight:900;font-size:20pt;letter-spacing:.1em}
.tr .wm span{display:block;font-weight:700;font-size:7.4pt;letter-spacing:.36em;margin-top:3pt;color:var(--warm)}
.tr .wm i{display:block;font-style:normal;font-weight:600;font-size:7.4pt;letter-spacing:.04em;margin-top:5pt;color:#fff;opacity:.85}
.tr .hero{left:${BLEED + SAFE}in;width:7.3in;top:${BLEED + HERO - 2.55}in}
.tr .eb{display:inline-block;background:var(--accent);color:var(--accent-ink);font-weight:800;font-size:8pt;letter-spacing:.14em;text-transform:uppercase;padding:3.5pt 8pt;border-radius:3pt}
.tr h1{font-weight:900;font-size:50pt;line-height:.95;letter-spacing:-.035em;margin-top:.1in;text-shadow:0 2pt 14pt rgba(0,0,0,.55)}
.tr h1 em{font-style:normal;color:var(--accent)}
.tr .sub{max-width:5.7in;font-size:13pt;font-weight:600;line-height:1.3;margin-top:.1in;color:#fff;text-shadow:0 1pt 8pt rgba(0,0,0,.7)}
.tr .badge{left:${BLEED + 7.75}in;top:${BLEED + HERO - 2.75}in;width:1.75in;height:1.75in;border-radius:50%;background:var(--accent);color:var(--accent-ink);
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.16in;transform:rotate(-8deg);box-shadow:0 4pt 18pt rgba(0,0,0,.45);
  font-weight:900;font-size:25pt;line-height:1;letter-spacing:-.02em}
.tr .badge small{display:block;font-weight:800;font-size:8.4pt;line-height:1.2;letter-spacing:0;margin-top:5pt}
.tr .band{left:${BLEED + SAFE}in;right:${BLEED + SAFE}in;top:${BLEED + HERO + 0.02}in;bottom:${BLEED + STRIP + 0.14}in;display:flex;gap:.14in;align-items:stretch}
.tr .val{flex:1.15;background:#fff;color:var(--deep);border-radius:9pt;padding:.1in .14in;display:flex;flex-direction:column;justify-content:space-between}
.tr .val .top{display:flex;align-items:flex-end;gap:.1in}
.tr .val .lbl{font-weight:800;font-size:7.4pt;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);line-height:1.2}
.tr .val .big{font-family:'Marker';font-size:34pt;line-height:.9;color:var(--blue)}
.tr .val ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:2.5pt 10pt}
.tr .val li{position:relative;padding-left:12pt;font-size:8.6pt;font-weight:700;line-height:1.2}
.tr .val li:before{content:'';position:absolute;left:1pt;top:2pt;width:6pt;height:3.4pt;border-left:1.8pt solid var(--accent-dark,#f59e0b);border-bottom:1.8pt solid #f59e0b;transform:rotate(-45deg)}
.tr .val .rates{font-size:7.2pt;line-height:1.3;color:#5a6075;border-top:.6pt solid #e6e9f2;padding-top:3pt}
.tr .trust{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:.02in 0}
.tr .trust .rate{display:flex;align-items:center;gap:5pt}
.tr .trust .rate b{font-weight:900;font-size:17pt}
.tr .trust .rate + p{font-size:7.6pt;color:var(--soft);margin-top:1pt}
.tr .trust .t{font-size:8.6pt;line-height:1.3;color:var(--soft)}
.tr .trust .t b{display:block;color:#fff;font-weight:800;font-size:10pt}
.tr .cta{flex:1.3;display:flex;align-items:center;gap:.12in;background:var(--accent);color:var(--accent-ink);border-radius:10pt;padding:.11in;box-shadow:0 0 0 2pt rgba(255,180,0,.25),0 6pt 22pt rgba(255,180,0,.25)}
.tr .cta .scan{font-weight:900;font-size:14pt;line-height:1.05}
.tr .cta .or{font-size:6.8pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-top:6pt;opacity:.8}
.tr .cta .phone{font-weight:900;font-size:17pt;line-height:1;margin-top:1pt;white-space:nowrap}
.tr .cta .url{font-size:7.2pt;font-weight:700;margin-top:3pt}
.tr .cta .qr{padding:.06in}
.tr .mailzone{position:absolute;right:${BLEED + 0.16}in;top:${BLEED + 0.16}in;width:${MAILZONE.w - 0.16}in;height:${MAILZONE.h - 0.16}in;background:#fff;border-radius:9pt;box-shadow:0 4pt 16pt rgba(0,0,0,.35)}
.tr .indicia{position:absolute;right:${BLEED + 0.28}in;top:${BLEED + 0.26}in;width:1.08in;border:1pt solid #000;padding:4pt 3pt;
  font-family:'Inter';font-weight:700;font-size:6.6pt;line-height:1.28;text-align:center;letter-spacing:.03em;color:#000}
.tr .addr{position:absolute;right:${BLEED + 0.28}in;top:${BLEED + 1.3}in;width:${MAILZONE.w - 0.56}in;font-family:'Inter';font-weight:600;font-size:10pt;letter-spacing:.06em;text-transform:uppercase;color:#000}
.tr .strip{background:#fff;color:var(--deep)}
`;

const ph = (f, cls, label) => `<div class="ph ${cls}"><img src="${fileUrl(path.join(SOCIAL, 'photos', f))}"><span class="chip">${label}</span></div>`;

const mikey = q => `
<section class="page mk">
  <div class="ba">${ph('backseat-before.jpg', 'b', 'Before')}${ph('backseat-after.jpg', 'a', 'After')}
    <div class="cap">Same back seat. No judgment, I've seen everything.</div></div>

  <div class="box left">
    <div><div class="promise"><u>You don't pay until you love it.</u></div>
      <div class="grt">We walk around it together and I fix anything you point at. <b>Free comeback</b> if you spot something the next day. <b>Every penny back</b> if you're still not happy.</div></div>
    <div class="stats">
      <div><b>5.0 ${stars(5)}</b><span>41 Google reviews</span></div>
      <div><b>300+</b><span>cars detailed</span></div>
      <div><b>2021</b><span>detailing since</span></div>
    </div>
    <div class="need">It's just me, so the guy who texts you back is the guy who does your car. <b>I bring every product and tool. You provide an outdoor spigot and an outlet.</b></div>
  </div>

  <div class="box right">
    <div class="head">${logoSvg()}<div>
      <div class="eb">Mobile detailing · Snohomish, WA</div>
      <h1>Your car, detailed <em>right here</em> in your driveway.</h1></div></div>
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
      <div class="code">Mention this postcard when you book.</div>
    </div>
    <div>
      <div class="prices">
        <div><span>Exterior</span><b><small>from</small>$199</b></div>
        <div><span>Interior</span><b><small>from</small>$249</b></div>
        <div><span>Full detail</span><b><small>from</small>$369</b></div>
      </div>
      <div class="pnote">Size and condition set the price. Same price in every town, no travel fee.</div>
    </div>
    <div class="cta" data-qr="mk">
      <div class="qr">${q}</div>
      <div><div class="scan">Scan for your exact price</div><div class="sub">About 60 seconds. Then pick a time.</div>
        <div class="or">Rather talk? Call or text Mikey</div><div class="phone">${MK_PHONE}</div><div class="url">mikeysdetailing.com</div></div>
    </div>
    <div class="fine">Rain-Ready: book a Full Detail by December 31, 2026 and mention this postcard. The work can be done as late as January 31, 2027. $508 is a sedan's Interior and Exterior booked apart, plus the extras. I come to ${TOWNS.slice(0, -1).join(', ')} and ${TOWNS.at(-1)}.</div>
  </div>

  <div class="strip"><span><b>Flip it over:</b> Christmas lights, hung and taken down by my brother Louis at Trinity Exterior Co.</span></div>
</section>`;

const trinity = (q, hero) => `
<section class="page tr">
  <div class="photo"><img src="${fileUrl(hero)}"></div><div class="shade"></div>
  <div class="box wm"><b>TRINITY</b><span>EXTERIOR CO.</span><i>Snohomish County, WA</i></div>
  <div class="mailzone"></div>
  <div class="indicia">PRSRT STD<br>ECRWSS<br>U.S. POSTAGE PAID<br>EDDM RETAIL</div>
  <div class="addr">Local Postal Customer</div>

  <div class="box hero"><span class="eb">Christmas light installation</span>
    <h1>This year,<br><em>skip the ladder.</em></h1>
    <div class="sub">I hang them, fix them all season, then take them down and store them. You just enjoy the house.</div></div>
  ${TR_OFFER ? `<div class="box badge">${TR_OFFER.big}<small>${TR_OFFER.small}</small></div>` : ''}

  <div class="box band">
    <div class="val">
      <div class="top"><div class="big">$600</div><div class="lbl">All-in<br>starting price</div></div>
      <ul>
        <li>Commercial-grade LEDs</li><li>Custom-cut to your roof</li>
        <li>Clips, no nails or staples</li><li>Repairs all season</li>
        <li>Takedown and storage</li><li>Free quote</li>
      </ul>
      <div class="rates">Rooflines: one story $5 to $8 a foot, two stories $7 to $10. Exact price after I see the house.</div>
    </div>
    <div class="trust">
      <div><div class="rate"><b>5.0</b>${stars(5)}</div><p>${TR_REVIEWS} Google reviews of my cleaning work</p></div>
      <div class="t"><b>Stays lit, or I fix it free.</b>A strand quits mid-season? Call or text, I come back out.</div>
      <div class="t"><b>Louis does the work.</b>Licensed, bonded and insured. The ladder is my risk.</div>
    </div>
    <div class="cta" data-qr="tr">
      <div class="qr">${q}</div>
      <div><div class="scan">Scan for your free lighting quote</div>
        <div class="or">Or call or text Louis</div><div class="phone">${TR_PHONE}</div><div class="url">${TR_SITE}</div></div>
    </div>
  </div>

  <div class="strip"><span><b>Flip it over:</b> your car detailed in your driveway by my brother Mikey, Mikey's Mobile Detailing.</span></div>
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
  // Louis's photo is 1575 px wide; full width is 11.25 in. Resample to 300 dpi so the
  // printer gets smooth pixels instead of blocks. It adds no detail: a bigger original
  // from Louis's phone is the real fix (see README).
  const hero = path.join(OUT, '.hero.jpg');
  await sharp(path.join(OUT, 'assets', 'trinity-roofline.webp')).resize({ width: Math.round((W + 2 * BLEED) * 300), kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8 }).jpeg({ quality: 94 }).toFile(hero);
  const sfx = TR_OFFER ? '-with-offer' : '';
  const browser = await chromium.launch();
  const pageW = W + 2 * BLEED, pageH = H + 2 * BLEED;
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${mikey(mq)}${trinity(tq, hero)}</body></html>`);
  const ctx = await browser.newContext({ deviceScaleFactor: 300 / 96, viewport: { width: Math.round(pageW * 96), height: Math.round(pageH * 96) } });
  const page = await ctx.newPage();
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));

  const problems = await page.evaluate(({ BLEED, W, H, SAFE, INDICIA_MAX, MAILZONE }) => {
    const out = [], IN = 96;
    const fonts = [...document.fonts].filter(f => f.status !== 'loaded' && f.status !== 'unloaded');
    if (fonts.length) out.push(`fonts not loaded: ${fonts.map(f => f.family).join(', ')}`);
    document.querySelectorAll('.page').forEach((pg, i) => {
      const pr = pg.getBoundingClientRect(), side = i ? 'Trinity side' : 'Mikey side';
      const box = { l: pr.left + (BLEED + SAFE) * IN, t: pr.top + (BLEED + SAFE) * IN, r: pr.left + (BLEED + W - SAFE) * IN, b: pr.top + (BLEED + H - SAFE) * IN };
      pg.querySelectorAll('.box *, .box, .strip span').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width && (r.left < box.l - .5 || r.top < box.t - .5 || r.right > box.r + .5 || r.bottom > box.b + .5))
          out.push(`${side}: <${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}"> outside the safe area`);
      });
      pg.querySelectorAll('.left, .right').forEach(p => { if (p.scrollHeight > p.clientHeight + 1) out.push(`${side}: .${p.classList[1]} column is ${p.scrollHeight - p.clientHeight}px too tall`); });
      // nothing sits on the colour strip
      const st = pg.querySelector('.strip').getBoundingClientRect();
      pg.querySelectorAll('.box *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.bottom > st.top) out.push(`${side}: <${el.tagName.toLowerCase()}> runs into the bottom strip`); });
    });
    const back = document.querySelector('.page.tr'), br = back.getBoundingClientRect();
    const zone = { l: br.left + (BLEED + W - MAILZONE.w) * IN, b: br.top + (BLEED + MAILZONE.h) * IN };
    back.querySelectorAll('.box, .box *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > zone.l && r.top < zone.b) out.push(`Trinity side: <${el.tagName.toLowerCase()}> intrudes on the mail zone`);
    });
    const ind = back.querySelector('.indicia').getBoundingClientRect();
    const fr = (br.left + (BLEED + W) * IN - ind.left) / IN, ft = (ind.bottom - br.top - BLEED * IN) / IN;
    if (fr > INDICIA_MAX.right || ft > INDICIA_MAX.top) out.push(`indicia at ${fr.toFixed(2)} in / ${ft.toFixed(2)} in, USPS max ${INDICIA_MAX.right} / ${INDICIA_MAX.top}`);
    return out;
  }, { BLEED, W, H, SAFE, INDICIA_MAX, MAILZONE });

  const all = await page.evaluate(() => document.body.innerText);
  const mk = await page.evaluate(() => document.querySelector('.page.mk').innerText);
  // The badge is Louis's own offer, book-by date included, so it's left out of the date check.
  const tr = await page.evaluate(() => { const c = document.querySelector('.page.tr').cloneNode(true); c.querySelector('.badge')?.remove(); document.body.append(c); const t = c.innerText; c.remove(); return t; });
  if (/\u2014|&mdash;/.test(all)) problems.push('copy contains an em dash');
  // Mikey's side: the CLAUDE.md facts table and voice.
  const banned = [[/insur|licens/i, 'licensed/insured on Mikey\'s side (unconfirmed)'], [/lynnwood|edmonds/i, 'a town Mikey does not serve'],
    [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b/i, 'business "we"'],
    [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day'], [/\$(160|200|240|280|299|339|379)\b/, 'a retired price'],
    [/cars a week|limited spots|a few a week/i, 'a retired scarcity claim'], [/tank|generator|bring (my|the) own water/i, 'water or power he brings']];
  for (const [re, what] of banned) if (re.test(mk)) problems.push(`Mikey's side: ${what}: "${mk.match(re)[0]}"`);
  for (const m of ['spigot', 'outlet', MK_PHONE, '60 seconds', '41 Google reviews', '300+', '2021', 'December 31, 2026', '$369', '$508', ...TOWNS])
    if (!mk.toLowerCase().includes(m.toLowerCase())) problems.push(`Mikey's side is missing "${m}"`);
  // Trinity's side: established facts only (Trinity CLAUDE.md, rule 2).
  for (const [re, what] of [[/timer/i, 'timers (known false)'], [/hundreds|\d{3,}\+? (homes|customers|houses)/i, 'a customer count (unverified)'],
    [/\b(nov|dec|thanksgiving)/i, 'an install date (ask Louis first)'], [/peace of mind|crystal clear|reach out|proudly/i, 'a phrase Trinity bans']])
    if (re.test(tr)) problems.push(`Trinity side: ${what}: "${tr.match(re)[0]}"`);
  for (const m of [TR_PHONE, 'Commercial-grade LEDs', 'Custom-cut', 'no nails or staples', 'Takedown and storage', 'fix it free', 'Repairs all season', 'Licensed, bonded and insured', '$600'])
    if (!tr.includes(m)) problems.push(`Trinity side is missing "${m}"`);
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }
  if (!TR_OFFER) console.log('  note: no Trinity offer set (TR_OFFER). His side prints without one.');

  for (const [sel, url] of [['[data-qr=mk] .qr', MK_QR], ['[data-qr=tr] .qr', TR_QR]])
    await checkQr(await page.$(sel), url, sel);

  const dir = path.join(OUT, 'print-files', '11x8.5');
  fs.mkdirSync(dir, { recursive: true });
  for (const [range, name] of [['1', 'front-mikey'], ['2', 'back-trinity-mail-side']])
    await page.pdf({ path: path.join(dir, `${name}${sfx}.pdf`), width: `${pageW}in`, height: `${pageH}in`, printBackground: true, preferCSSPageSize: true, pageRanges: range });
  const sides = await page.$$('.page'), px = 300, b = Math.round(BLEED * px);
  for (const [i, name] of ['mikey', 'trinity'].entries()) {
    const buf = await sides[i].screenshot({ type: 'png' });
    await sharp(buf).extract({ left: b, top: b, width: W * px, height: Math.round(H * px) }).jpeg({ quality: 90 }).toFile(path.join(OUT, `preview-${name}${sfx}.jpg`));
  }
  await ctx.close(); await browser.close(); fs.unlinkSync(tmp); fs.unlinkSync(hero);
  const s1 = await sharp(path.join(OUT, `preview-mikey${sfx}.jpg`)).resize({ width: 1800 }).toBuffer();
  const s2 = await sharp(path.join(OUT, `preview-trinity${sfx}.jpg`)).resize({ width: 1800 }).toBuffer();
  const h = (await sharp(s1).metadata()).height, pad = 70;
  await sharp({ create: { width: 1800 + pad * 2, height: h * 2 + pad * 3, channels: 3, background: '#e9e7e3' } })
    .composite([{ input: s1, left: pad, top: pad }, { input: s2, left: pad, top: h + pad * 2 }]).jpeg({ quality: 88 })
    .toFile(path.join(OUT, `mockup-both-sides${sfx}.jpg`));
  console.log('wrote print/postcard-shared/');
})().catch(e => { console.error(e); process.exit(1); });
