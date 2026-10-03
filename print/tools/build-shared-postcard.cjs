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
// OFFER='amount|terms' puts Louis's offer in a badge on his side (he has none
// yet) and writes -with-offer files. LAYOUT=matched puts Mikey's side in the
// same template as Louis's and writes -matched files. See README.

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
// LAYOUT=matched puts Mikey's side in Louis's template too (a test, see README).
const MATCHED = process.env.LAYOUT === 'matched';
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

let CSS = `
${[400, 500, 600, 700, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
${[500, 600, 700, 800, 900].map(w => fontFace('Inter', 'inter', w)).join('')}
${fontFace('Marker', 'permanent-marker', 400)}
${process.env.CANVA ? [400, 500, 600, 700, 800].map(w => fontFace('Poppins', 'poppins', w)).join('') : ''}
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

/* ================= THE TEMPLATE (.mt) =================
   Louis's side always uses it; with LAYOUT=matched, Mikey's does too. Built to the
   postcard rules in README: one photo carries the side, a short headline in the top
   half, the CTA is the brightest block, bottom right. Each brand sets the variables.
   Trinity: trinityexteriorco.com/lights (Inter, blues, yellow CTA).
   Mikey: mikeysdetailing.com (Outfit, black, red CTA, gold). */
.mt{font-family:var(--font);background:var(--bg);color:#fff}
.mt.trv{--font:'Inter',sans-serif;--bg:#121a4a;--blue:#2e3eb0;--deep:#1a2360;--accent:#ffb400;--accent-ink:#231a02;--warm:#ffd98a;--soft:#cdd3f2;
  --em:#ffb400;--chip:#ffb400;--chip-ink:#231a02;--price:#2e3eb0;--price-font:'Marker';--price-weight:400;--check:#f59e0b;--card-sub:#5a6075;--card-line:#e6e9f2;
  --shade:rgba(10,14,44,.55);--strip:#fff;--strip-ink:#1a2360;--glow:rgba(255,180,0,.25)}
.mt.mkv{--font:'Outfit',sans-serif;--bg:#0a0a0a;--blue:#A00C24;--deep:#0a0a0a;--accent:#C8102E;--accent-ink:#fff;--warm:#E4CD8B;--soft:#c2c2c2;
  --em:#ff3347;--chip:#C9A24B;--chip-ink:#1a1408;--price:#C8102E;--price-font:'Outfit';--price-weight:800;--check:#C8102E;--card-sub:#6b6b6b;--card-line:#e8e2d6;
  --shade:rgba(6,6,6,.62);--strip:#C8102E;--strip-ink:#fff;--glow:rgba(200,16,46,.35)}
.mt .stars svg{fill:var(--accent)}
.mt .photo{position:absolute;left:0;top:0;width:${W + 2 * BLEED}in;height:${HERO + BLEED}in;
  -webkit-mask-image:linear-gradient(180deg,#000 74%,transparent 100%)}
.mt .photo img{width:100%;height:100%;object-fit:cover;object-position:50% 38%;display:block}
.mt .shade{position:absolute;left:0;top:0;width:${W + 2 * BLEED}in;height:${HERO + BLEED}in;
  background:linear-gradient(180deg,transparent 45%,var(--shade) 72%,transparent 100%),linear-gradient(90deg,var(--shade) 0%,transparent 55%)}
.mt .wm{left:${BLEED + SAFE}in;top:${BLEED + SAFE}in;line-height:1;text-shadow:0 1pt 8pt rgba(0,0,0,.6)}
.mt .wm b{display:block;font-weight:900;font-size:20pt;letter-spacing:.1em}
.mt .wm span{display:block;font-weight:700;font-size:7.4pt;letter-spacing:.36em;margin-top:3pt;color:var(--warm)}
.mt .wm i{display:block;font-style:normal;font-weight:600;font-size:7.4pt;letter-spacing:.04em;margin-top:5pt;color:#fff;opacity:.85}
.mt .hero{left:${BLEED + SAFE}in;width:7.3in;top:${BLEED + HERO - 2.55}in}
.mt .eb{display:inline-block;background:var(--chip);color:var(--chip-ink);font-weight:800;font-size:8pt;letter-spacing:.14em;text-transform:uppercase;padding:3.5pt 8pt;border-radius:3pt}
.mt h1{font-weight:900;font-size:50pt;line-height:.95;letter-spacing:-.035em;margin-top:.1in;text-shadow:0 2pt 14pt rgba(0,0,0,.55)}
.mt h1 em{font-style:normal;color:var(--em)}
.mt .sub{max-width:5.7in;font-size:13pt;font-weight:600;line-height:1.3;margin-top:.1in;color:#fff;text-shadow:0 1pt 8pt rgba(0,0,0,.7)}
.mt .badge{left:${BLEED + 7.75}in;top:${BLEED + HERO - 2.75}in;width:1.75in;height:1.75in;border-radius:50%;background:var(--accent);color:var(--accent-ink);
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.16in;transform:rotate(-8deg);box-shadow:0 4pt 18pt rgba(0,0,0,.45);
  font-weight:900;font-size:25pt;line-height:1;letter-spacing:-.02em}
.mt .badge small{display:block;font-weight:800;font-size:8.4pt;line-height:1.2;letter-spacing:0;margin-top:5pt}
.mt .band{left:${BLEED + SAFE}in;right:${BLEED + SAFE}in;top:${BLEED + HERO + 0.02}in;bottom:${BLEED + STRIP + 0.14}in;display:flex;gap:.14in;align-items:stretch}
.mt .val{flex:1.15;background:#fff;color:var(--deep);border-radius:9pt;padding:.1in .14in;display:flex;flex-direction:column;justify-content:space-between}
.mt .val .top{display:flex;align-items:flex-end;gap:.1in}
.mt .val .lbl{font-weight:800;font-size:7.4pt;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);line-height:1.2}
.mt .val .big{font-family:var(--price-font);font-weight:var(--price-weight);font-size:34pt;line-height:.9;color:var(--price)}
.mt .val ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:2.5pt 10pt}
.mt .val li{position:relative;padding-left:12pt;font-size:8.6pt;font-weight:700;line-height:1.2}
.mt .val li:before{content:'';position:absolute;left:1pt;top:2pt;width:6pt;height:3.4pt;border-left:1.8pt solid var(--check);border-bottom:1.8pt solid var(--check);transform:rotate(-45deg)}
.mt .val .rates{font-size:7.2pt;line-height:1.3;color:var(--card-sub);border-top:.6pt solid var(--card-line);padding-top:3pt}
.mt .trust{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:.02in 0}
.mt .trust .rate{display:flex;align-items:center;gap:5pt}
.mt .trust .rate b{font-weight:900;font-size:17pt}
.mt .trust .rate + p{font-size:7.6pt;color:var(--soft);margin-top:1pt}
.mt .trust .t{font-size:8.6pt;line-height:1.3;color:var(--soft)}
.mt .trust .t b{display:block;color:#fff;font-weight:800;font-size:10pt}
.mt .cta{flex:1.3;display:flex;align-items:center;gap:.12in;background:var(--accent);color:var(--accent-ink);border-radius:10pt;padding:.11in;box-shadow:0 0 0 2pt var(--glow),0 6pt 22pt var(--glow)}
.mt .cta .scan{font-weight:900;font-size:14pt;line-height:1.05}
.mt .cta .or{font-size:6.8pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-top:6pt;opacity:.8}
.mt .cta .phone{font-weight:900;font-size:17pt;line-height:1;margin-top:1pt;white-space:nowrap}
.mt .cta .sub2{font-size:8pt;font-weight:600;margin-top:2pt;opacity:.9}
.mt .cta .url{font-size:7.2pt;font-weight:700;margin-top:3pt}
.mt .cta .qr{padding:.06in}
.mt .label{position:absolute;right:${BLEED + 0.16}in;top:${BLEED + 0.16}in;width:${MAILZONE.w - 0.16}in;height:${MAILZONE.h - 0.16}in;background:#fff;border-radius:9pt;box-shadow:0 4pt 16pt rgba(0,0,0,.35)}
.mt .indicia{position:absolute;right:${BLEED + 0.28}in;top:${BLEED + 0.26}in;width:1.08in;border:1pt solid #000;padding:4pt 3pt;
  font-family:'Inter';font-weight:700;font-size:6.6pt;line-height:1.28;text-align:center;letter-spacing:.03em;color:#000}
.mt .addr{position:absolute;right:${BLEED + 0.28}in;top:${BLEED + 1.3}in;width:${MAILZONE.w - 0.56}in;font-family:'Inter';font-weight:600;font-size:10pt;letter-spacing:.06em;text-transform:uppercase;color:#000}
.mt .strip{background:var(--strip);color:var(--strip-ink)}
/* Mikey in the template: before/after across the photo slot, a review in the label slot */
.mt .photo.ba{display:flex;gap:.04in;background:var(--bg)}
.mt .photo.ba .ph{position:relative;flex:1;overflow:hidden}
.mt .photo.ba img{object-position:50% 58%}
.mt .seam{position:absolute;top:${BLEED + 2.25}in;left:50%;transform:translateX(-50%);display:flex;gap:.3in}
.mt .seam span{font-weight:800;font-size:8.5pt;letter-spacing:.16em;text-transform:uppercase;padding:4pt 8pt 3.5pt;border-radius:3pt;color:#fff;box-shadow:0 2pt 8pt rgba(0,0,0,.4)}
.mt .seam .b{background:rgba(10,10,10,.88)}.mt .seam .a{background:var(--accent)}
.mt .wm .logo{display:block;width:2.3in;height:auto;filter:drop-shadow(0 2pt 8pt rgba(0,0,0,.6))}
.mt .quote{right:${BLEED + 0.38}in;top:${BLEED + 0.26}in;width:${MAILZONE.w - 0.6}in;height:${MAILZONE.h - 0.36}in;display:flex;flex-direction:column;justify-content:center;color:#1a1a1a}
.mt .quote p{font-size:10.2pt;line-height:1.35;font-weight:500}
.mt .quote p:before{content:'\\201C';font-weight:800;font-size:26pt;line-height:0;vertical-align:-9pt;color:var(--accent);margin-right:2pt}
.mt .quote .by{display:flex;align-items:center;gap:4pt;margin-top:5pt;font-size:7.6pt;font-weight:700;letter-spacing:.04em;color:#555}
.mt .quote .by .stars svg{width:8pt;height:8pt;fill:#C9A24B}
.mt .badge.rr{background:linear-gradient(145deg,#E4CD8B,#C9A24B);color:#1a1408}
.mt.mkv .badge{left:${BLEED + 4.55}in;top:${BLEED + 3.85}in;width:1.45in;height:1.45in;font-size:18pt;padding:.12in;transform:rotate(-6deg)}
.mt.mkv .badge small{font-size:7.6pt}
.mt.mkv .sub{max-width:4.1in}
.mt .photo.prints{-webkit-mask-image:none;background:radial-gradient(70% 90% at 78% 45%,#3a0a10 0%,#160608 45%,#0a0a0a 75%)}
.mt .pr{position:absolute;top:${BLEED + 2.2}in;width:2.15in;height:3.0in;background:#fff;padding:.07in .07in .07in;box-shadow:0 8pt 24pt rgba(0,0,0,.6)}
.mt .pr.b{left:${BLEED + 6.05}in;transform:rotate(-3deg)}
.mt .pr.a{left:${BLEED + 8.4}in;top:${BLEED + 2.32}in;transform:rotate(2.5deg)}
.mt .pr img{width:100%;height:100%;object-fit:cover;object-position:50% 55%;display:block}
.mt .pr span{position:absolute;left:.16in;bottom:.16in;font-weight:800;font-size:8.5pt;letter-spacing:.16em;text-transform:uppercase;padding:3.5pt 7pt 3pt;border-radius:3pt;color:#fff;background:rgba(10,10,10,.88)}
.mt .pr.a span{background:#C8102E}
.mt .note{left:${BLEED + 6.0}in;width:4.7in;top:${BLEED + 5.3}in;text-align:center;font-family:'Caveat';font-weight:700;font-size:15pt;line-height:1;color:#E4CD8B}
.mt.mkv .hero{width:5.6in;top:${BLEED + 2.05}in}
.mt.mkv h1{font-size:44pt}
`;

// Canva has no Outfit and a free plan can't upload fonts, so the Canva copy of Mikey's
// side uses Poppins, the closest geometric sans in Canva's library. Print keeps Outfit.
if (process.env.CANVA) CSS = CSS.replace("--font:'Outfit',sans-serif", "--font:'Poppins',sans-serif").replace("--price-font:'Outfit'", "--price-font:'Poppins'") + '.mt.mkv .strip{font-size:7.8pt}.mt.mkv .badge small{font-size:7.6pt}';

const ph = (f, cls, label) => `<div class="ph ${cls}"><img src="${fileUrl(path.join(SOCIAL, 'photos', f))}"><span class="chip">${label}</span></div>`;

const mikey = q => `
<section class="page mk" data-biz="mk">
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

// One template, two brands. d = { biz, cls, photo, brand, label, chip, h1, sub, badge, val, trust, cta, strip }
const sideT = d => `
<section class="page mt ${d.cls}" data-biz="${d.biz}">
  ${d.photo}<div class="shade"></div>
  <div class="box wm">${d.brand}</div>
  <div class="label"></div>${d.label}

  <div class="box hero"><span class="eb">${d.chip}</span>
    <h1>${d.h1}</h1>
    <div class="sub">${d.sub}</div></div>
  ${d.badge || ''}

  <div class="box band">
    <div class="val">${d.val}</div>
    <div class="trust">${d.trust}</div>
    <div class="cta" data-qr="${d.biz}">${d.cta}</div>
  </div>

  <div class="strip"><span>${d.strip}</span></div>
</section>`;

const trinity = (q, hero) => sideT({
  biz: 'tr', cls: 'trv',
  photo: `<div class="photo"><img src="${fileUrl(hero)}"></div>`,
  brand: `<b>TRINITY</b><span>EXTERIOR CO.</span><i>Snohomish County, WA</i>`,
  label: `<div class="indicia">PRSRT STD<br>ECRWSS<br>U.S. POSTAGE PAID<br>EDDM RETAIL</div>
  <div class="addr">Local Postal Customer</div>`,
  chip: 'Christmas light installation',
  h1: 'This year,<br><em>skip the ladder.</em>',
  sub: 'I bring commercial-grade lights, cut them to fit your roofline and clip them on. A strand goes out, I fix it. After the holidays I take them down and store them for next year.',
  badge: TR_OFFER ? `<div class="box badge">${TR_OFFER.big}<small>${TR_OFFER.small}</small></div>` : '',
  val: `<div class="top"><div class="big">$600</div><div class="lbl">Rooflines from<br>lights included</div></div>
      <ul>
        <li>Commercial-grade LEDs</li><li>Custom-cut to your roof</li>
        <li>Clips, no nails or staples</li><li>Repairs all season</li>
        <li>Takedown and storage</li><li>Free quote</li>
      </ul>
      <div class="rates">One story $5 to $8 a foot, two stories $7 to $10, before tax. Steep roofs, trees and wreaths are quoted on their own. I confirm the price after I see the house.</div>`,
  trust: `<div><div class="rate"><b>5.0</b>${stars(5)}</div><p>${TR_REVIEWS} Google reviews of my cleaning work</p></div>
      <div class="t"><b>Stays lit, or I fix it free.</b>A strand quits in the middle of the season? Call or text and I come back out.</div>
      <div class="t"><b>I'm the one on your roof.</b>Owner-operated, licensed, bonded and insured. The ladder is my risk, not yours.</div>`,
  cta: `<div class="qr">${q}</div>
      <div><div class="scan">Scan for your free lighting quote</div>
        <div class="or">Or call or text Louis</div><div class="phone">${TR_PHONE}</div><div class="url">${TR_SITE}</div></div>`,
  strip: `<b>Flip it over:</b> my brother Mikey details cars right in your driveway. Mikey's Mobile Detailing.`,
});

// Mikey in the same template (LAYOUT=matched). Same facts as his split side.
const mikeyT = q => sideT({
  biz: 'mk', cls: 'mkv',
  // The before/after reads as proof only when you can see it's the same seat, so it's two
  // framed prints, not a background: at 2.15 in wide the 900 px photos print at ~400 dpi.
  photo: `<div class="photo prints">
    <div class="pr b"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-before.jpg'))}"><span>Before</span></div>
    <div class="pr a"><img src="${fileUrl(path.join(SOCIAL, 'photos', 'backseat-after.jpg'))}"><span>After</span></div></div>
  <div class="box note">Same back seat. No judgment, I've seen everything.</div>`,
  brand: `${logoSvg()}<i>Snohomish, WA</i>`,
  label: `<div class="box quote"><p>As someone who is very protective over their car, I was absolutely amazed at how Mike handled such a detailed task. Incredible attention to detail.</p>
    <div class="by">${stars(5)} ANGELA, SNOHOMISH</div></div>`,
  chip: 'Mobile detailing · Snohomish',
  h1: 'Your car, detailed<br><em>in your driveway.</em>',
  sub: 'No dropping it off, no waiting room. I bring every product and tool and do the whole car right there. All I need from you is an outdoor spigot and an outlet.',
  badge: `<div class="box badge rr">3 extras free<small>with a Full Detail booked by Dec 31</small></div>`,
  val: `<div class="top"><div class="big">$369</div><div class="lbl">Rain-Ready Full Detail<br>worth $508 on a sedan</div></div>
      <ul>
        <li>Interior detail</li><li>Exterior polish, free</li>
        <li>Exterior detail</li><li>Ceramic wax, free</li>
        <li>Mention this postcard</li><li>RainX on the glass, free</li>
      </ul>
      <div class="rates">SUV or pickup +$40, van or 3-row +$80. Book by December 31, 2026 and I can do the work as late as January 31, 2027. $508 is a sedan's Interior and Exterior booked apart, plus the three extras.</div>`,
  trust: `<div><div class="rate"><b>5.0</b>${stars(5)}</div><p>41 Google reviews</p></div>
      <div class="t"><b>You don't pay until you love it.</b>We walk around the car together first. Anything you point at, I fix right there.</div>
      <div class="t"><b>One guy, every car.</b>300+ cars since 2021. The person who texts you back is the one in your driveway.</div>`,
  cta: `<div class="qr">${q}</div>
      <div><div class="scan">Scan for your<br>exact price</div><div class="sub2">About 60 seconds, then pick a time.</div>
        <div class="or">Or call or text Mikey</div><div class="phone">${MK_PHONE}</div><div class="url">mikeysdetailing.com</div></div>`,
  strip: `<b>Flip it over:</b> my brother Louis hangs Christmas lights, fixes them all season and takes them down. Trinity Exterior Co.`,
});

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
  const sfx = (MATCHED ? '-matched' : '') + (TR_OFFER ? '-with-offer' : '');
  const browser = await chromium.launch();
  const pageW = W + 2 * BLEED, pageH = H + 2 * BLEED;
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${MATCHED ? mikeyT(mq) : mikey(mq)}${trinity(tq, hero)}</body></html>`);
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
          out.push(`${side}: <${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}"> outside the safe area ("${(el.textContent || "").trim().slice(0, 40)}")`);
      });
      pg.querySelectorAll('.left, .right, .band > *').forEach(p => { if (p.scrollHeight > p.clientHeight + 1) out.push(`${side}: .${p.classList[p.classList.length - 1]} is ${p.scrollHeight - p.clientHeight}px too tall`); });
      // nothing sits on the colour strip
      const st = pg.querySelector('.strip').getBoundingClientRect();
      pg.querySelectorAll('.box *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.bottom > st.top) out.push(`${side}: <${el.tagName.toLowerCase()}> runs into the bottom strip`); });
    });
    const back = document.querySelector('.page[data-biz=tr]'), br = back.getBoundingClientRect();
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
  const mk = await page.evaluate(() => document.querySelector('.page[data-biz=mk]').innerText);
  // The badge is Louis's own offer, book-by date included, so it's left out of the date check.
  const tr = await page.evaluate(() => { const c = document.querySelector('.page[data-biz=tr]').cloneNode(true); c.querySelector('.badge')?.remove(); document.body.append(c); const t = c.innerText; c.remove(); return t; });
  if (/\u2014|&mdash;/.test(all)) problems.push('copy contains an em dash');
  // Mikey's side: the CLAUDE.md facts table and voice.
  const banned = [[/insur|licens/i, 'licensed/insured on Mikey\'s side (unconfirmed)'], [/lynnwood|edmonds/i, 'a town Mikey does not serve'],
    [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b/i, 'business "we"'],
    [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day'], [/\$(160|200|240|280|299|339|379)\b/, 'a retired price'],
    [/cars a week|limited spots|a few a week/i, 'a retired scarcity claim'], [/tank|generator|bring (my|the) own water/i, 'water or power he brings']];
  for (const [re, what] of banned) if (re.test(mk)) problems.push(`Mikey's side: ${what}: "${mk.match(re)[0]}"`);
  for (const m of ['spigot', 'outlet', MK_PHONE, '60 seconds', '41 Google reviews', '300+', '2021', 'December 31, 2026', '$369', '$508', ...(MATCHED ? [] : TOWNS)])
    if (!mk.toLowerCase().includes(m.toLowerCase())) problems.push(`Mikey's side is missing "${m}"`);
  // Trinity's side: established facts only (Trinity CLAUDE.md, rule 2).
  for (const [re, what] of [[/timer/i, 'timers (known false)'], [/hundreds|\d{3,}\+? (homes|customers|houses)/i, 'a customer count (unverified)'],
    [/\b(nov|dec|thanksgiving)/i, 'an install date (ask Louis first)'], [/peace of mind|crystal clear|reach out|proudly/i, 'a phrase Trinity bans']])
    if (re.test(tr)) problems.push(`Trinity side: ${what}: "${tr.match(re)[0]}"`);
  for (const m of [TR_PHONE, 'Commercial-grade LEDs', 'Custom-cut', 'no nails or staples', 'Takedown and storage', 'fix it free', 'Repairs all season', 'licensed, bonded and insured', '$600'])
    if (!tr.toLowerCase().includes(m.toLowerCase())) problems.push(`Trinity side is missing "${m}"`);
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }
  if (!TR_OFFER) console.log('  note: no Trinity offer set (TR_OFFER). His side prints without one.');

  for (const [sel, url] of [['[data-qr=mk] .qr', MK_QR], ['[data-qr=tr] .qr', TR_QR]])
    await checkQr(await page.$(sel), url, sel);

  // CANVA=1: write an HTML version Canva can import as an editable design (a PDF
  // import loses the photos and doubles letter-spaced text). Photos, QR codes and
  // the logo become image files; every text block stays live text.
  if (process.env.CANVA) {
    const BASE = process.env.CANVA_BASE || 'https://raw.githubusercontent.com/mikeygabmiller/mikeysite/main/print/postcard-shared/canva/';
    const cdir = path.join(OUT, 'canva'), tag = MATCHED ? 'matched' : 'split';
    fs.mkdirSync(cdir, { recursive: true });
    const shot = async (el, name, opts = {}) => { await el.screenshot({ path: path.join(cdir, name), ...opts }); return BASE + name; };
    const pages = await page.$$('.page');
    for (const [i, pg] of pages.entries()) {
      const biz = await pg.getAttribute('data-biz');
      // Bake the photo with its fade and shade into one picture: hide everything else for a moment.
      const heroEl = await pg.$('.photo');
      if (heroEl) {
        await pg.evaluate(el => el.querySelectorAll(':scope > *').forEach(c => { if (!c.matches('.photo, .shade')) c.style.visibility = 'hidden'; }));
        const bb = await pg.boundingBox();
        const hh = (HERO + BLEED) * 96;
        const url = BASE + `hero-${tag}-${biz}.jpg`;
        await page.screenshot({ path: path.join(cdir, `hero-${tag}-${biz}.jpg`), type: 'jpeg', quality: 92, fullPage: true, clip: { x: bb.x, y: bb.y + (await page.evaluate(() => scrollY)), width: bb.width, height: hh } });
        await pg.evaluate((el, a) => {
          el.querySelectorAll(':scope > *').forEach(c => { c.style.visibility = ''; });
          el.querySelector('.shade')?.remove();
          const ph = el.querySelector('.photo');
          const img = document.createElement('img');
          img.src = a.url; img.style.cssText = `position:absolute;left:0;top:0;width:100%;height:${a.hh}px;display:block`;
          ph.replaceWith(img);
        }, { url, hh });
      }
      for (const [j, q] of (await pg.$$('.qr')).entries()) {
        const url = await shot(await q.$('svg'), `qr-${tag}-${biz}${j || ''}.png`);
        await q.evaluate((el, u) => { el.querySelector('svg').outerHTML = `<img src="${u}" style="display:block;width:${el.querySelector('svg').getBoundingClientRect().width}px">`; }, url);
      }
      for (const [j, lg] of (await pg.$$('svg.logo')).entries()) {
        const w = (await lg.boundingBox()).width;
        // Rasterize the SVG itself so the PNG is transparent (a screenshot would carry the photo behind it).
        const name = `logo-${tag}-${biz}${j || ''}.png`, url = BASE + name;
        await sharp(Buffer.from(await lg.evaluate(el => el.outerHTML)), { density: 600 }).resize({ width: Math.round(w / 96 * 300) }).png().toFile(path.join(cdir, name));
        await lg.evaluate((el, a) => { el.outerHTML = `<img src="${a.url}" style="display:block;width:${a.w}px">`; }, { url, w });
      }
      // Simple flat backgrounds stay as shapes; any remaining img (split layout photos) gets a public URL.
      for (const [j, im] of (await pg.$$('img:not([src^="https"])')).entries()) {
        const url = await shot(im, `photo-${tag}-${biz}${j}.jpg`, { type: 'jpeg', quality: 92 });
        await im.evaluate((el, u) => { el.src = u; el.style.objectFit = 'fill'; }, url);
      }
      await pg.evaluate(el => {
        // Canva's importer misses CSS variables and grid lists: write each text box's own font,
        // and turn the two-column checklists into plain rows with a check mark character.
        el.querySelectorAll('ul').forEach(ul => {
          const ck = getComputedStyle(ul.querySelector('li'), '::before').borderLeftColor;
          const li0 = getComputedStyle(ul.querySelector('li'));
          const box = document.createElement('div');
          box.style.cssText = 'display:flex;flex-wrap:wrap;column-gap:10pt;row-gap:2.5pt';
          ul.querySelectorAll('li').forEach(li => {
            const d = document.createElement('div');
            d.style.cssText = `width:calc(50% - 5pt);font-size:${li0.fontSize};font-weight:${li0.fontWeight};line-height:${li0.lineHeight};color:${li0.color}`;
            d.innerHTML = `<span style="color:${ck};font-weight:900">\u2713</span> ${li.textContent}`;
            box.append(d);
          });
          ul.replaceWith(box);
        });
        el.querySelectorAll('*').forEach(n => {
          if (![...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim())) return;
          const cs = getComputedStyle(n);
          n.style.fontFamily = cs.fontFamily.replace(/^["']?Marker["']?$/, "'Permanent Marker'");
          n.style.fontWeight = cs.fontWeight; n.style.fontSize = cs.fontSize; n.style.color = cs.color;
          n.style.letterSpacing = cs.letterSpacing; n.style.lineHeight = cs.lineHeight; n.style.textTransform = cs.textTransform;
        });
        el.querySelectorAll('.stars').forEach(s => { s.outerHTML = `<span style="color:${getComputedStyle(s.querySelector('svg')).fill};letter-spacing:1px">★★★★★</span>`; });
        el.setAttribute('data-document-role', 'page');
        el.setAttribute('data-label', el.dataset.biz === 'mk' ? "Mikey's side" : "Trinity side (mail side)");
      });
    }
    const css = CSS.replace(/@font-face\{[^}]*\}/g, '');
    const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@500;600;700;800;900&family=Caveat:wght@700&family=Permanent+Marker&display=swap">';
    let body = await page.evaluate(() => document.body.innerHTML);
    body = body.replace(/font-family:'Marker'/g, "font-family:'Permanent Marker'");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Shared EDDM postcard (${tag})</title>${fonts}<style>${css.replace(/'Marker'/g, "'Permanent Marker'")}</style></head><body>${body}</body></html>`;
    if (/file:\/\//.test(html)) throw new Error('canva html still points at a local file');
    fs.writeFileSync(path.join(cdir, `postcard-${tag}.html`), html);
    console.log(`  wrote canva/postcard-${tag}.html (import from ${BASE}postcard-${tag}.html)`);
    await ctx.close(); await browser.close(); fs.unlinkSync(tmp); fs.unlinkSync(hero);
    return;
  }

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
