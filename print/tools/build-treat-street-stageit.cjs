// Renders the Treat Street booth board for the board Mikey actually bought
// (2026-10-22): a Royal Brites Stage-It display board, item 27146, white
// corrugated tri-fold with a pop-out header and a shelf. Open it is 44 in wide
// and 37 in tall: a 22 in centre panel, two 11 in wings, the arched header on
// top of the centre, the shelf across the bottom of it.
//
//   cd print/tools && npm install && npm run treat-stageit
//
// Royal Brites doesn't publish the header or shelf sizes, so the ones below
// are estimates off his photo of the box. Every piece is printed BLEED inches
// oversize on every side with nothing important near its edge: glue it on,
// then trim it to the board's own edge with a box cutter, the header's arch
// included. Measure the real board and change PIECES if it's far off.
//
//   header   the logo, black, the first thing seen over the crowd
//   centre   "I come to you", the back-seat before/after, the Google rating,
//            the phone
//   left     four Google reviews, word for word
//   right    "See your price in 60 seconds" with a QR, and a small Rain-Ready
//            box (Mikey, 2026-10-22: the offer is not a whole side)
//   shelf    the strip on the shelf's front edge: the free drawing
//
// Output lands in print/treat-street/stageit/:
//   pieces/*.pdf          each piece at its size plus bleed
//   poster-1-center-24x36.pdf    the centre panel on one 24 x 36 poster
//   poster-2-wings-shelf-24x36.pdf   both wings and the shelf strip on another
//   PRINT-ME-letter.pdf   everything on plain 8.5 x 11 pages for a normal
//                         printer, one file: a map of where every page goes,
//                         every piece cut into labelled pages with trim marks,
//                         and a QR patch for if the tiled QR won't scan
//   preview.png           the board assembled
//
// One more copy of the facts table in CLAUDE.md: the phone, 5.0 across 40,
// 300+ cars since 2021, 60 seconds, and the Rain-Ready offer as it stands
// as his Canva quote sign prints it (2026-10-22: wax $20, rain repellent $15,
// anti-fog $15, from $369, book by Dec 31; the site still says $10 and $30, so
// no "worth" total here until those agree). It refuses to build from January 1, 2027. The reviews are
// his Google reviews word for word, read off the Business Profile through
// Windsor on 2026-10-22; never one that isn't on Google (see the README).

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'treat-street', 'stageit');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const PHOTOS = path.join(ROOT, 'social', 'photos');
const fileUrl = (p) => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The board. Inches, finished size before bleed. ----
const BLEED = 0.4;
const PIECES = {
  header: { w: 22, h: 6.5 },   // estimate: the arched pop-out header
  left: { w: 11, h: 30.5 },    // the wings stand below the header's top
  center: { w: 22, h: 30.5 },
  right: { w: 11, h: 30.5 },
  shelf: { w: 22, h: 3 },      // estimate: the shelf's front edge
};

// ---- The facts. ----
const PHONE = '(425) 600-7897';
const QR_URL = 'https://mikeysdetailing.com/?utm_source=treatstreet&utm_medium=event#booking';
const RR_END = new Date('2027-01-01T00:00:00-08:00');
const FREEBIES = [['Ceramic wax', 20], ['Windshield rain repellent', 15], ['Windshield anti-fog', 15]];
const FROM = 369;
const RATING = '5.0', REVIEWS = 40, CARS = '300+';
const QUOTES = [
  ['Matt M.', 'With two kids in car seats, we had things stuck in those seats that were half-eaten and melted! Mikey has provided us with what seems like a brand new vehicle and allowed us to finally see the floor mats!!'],
  ['Kathryn M.', 'I have two young kids so my car gets quite messy! Very pleased and highly recommend to anyone and everyone!'],
  ['Diandra P.', 'We recently hired Mikey to detail our car to get it ready for baby #3, and we couldn’t be happier with the results!'],
  ['C. Wilson', 'Mikey has done my car 4 times now and each time was amazing, quick, thorough, and a fabulous result.'],
];

const RED = '#E31924', INK = '#111114', YELLOW = '#FFD100', CREAM = '#F4F1EA', GOLD = '#F5B400';
const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;
const star = (size, color) => `<svg viewBox="0 0 24 24" style="width:${size};height:${size};display:inline-block"><path fill="${color}" d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z"/></svg>`;
const stars = (size, color = GOLD) => `<span class="stars">${star(size, color).repeat(5)}</span>`;
const logo = (k) => fileUrl(path.join(BRAND, 'transparent-png', `${k}.png`));

const CSS = (qrSvg) => `
${fontFace('Barlow Condensed', 'barlow-condensed', 800)}
${fontFace('Inter', 'inter', 600)}
${fontFace('Inter', 'inter', 800)}
@page{margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
.piece{position:relative;overflow:hidden}
.safe{position:absolute;display:flex;flex-direction:column;align-items:center;text-align:center}
.stars{display:inline-flex;gap:.06em}

.header{background:${INK}}
.header .safe{justify-content:flex-end}
.header img{width:15.5in}

.center{background:#fff;color:${INK}}
.center .safe{justify-content:space-evenly}
.center .come{font:800 3.4in/1 'Barlow Condensed';text-transform:uppercase;color:${RED};white-space:nowrap}
.ba{display:flex;gap:.4in;width:100%}
.ph{position:relative;flex:1;height:11in;border-radius:.25in;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.ph span{position:absolute;left:.25in;top:.25in;font:800 .6in/1 'Inter';letter-spacing:.08em;padding:.14in .24in;border-radius:.1in}
.ph.b span{background:#fff;color:${INK}}
.ph.a span{background:${RED};color:#fff}
.center .cap{font:600 .55in/1.2 'Inter';margin-top:.3in}
.rate{display:flex;align-items:center;gap:.4in;background:${INK};color:#fff;border-radius:.35in;padding:.32in .6in}
.rate .big{font:800 1.9in/1 'Barlow Condensed'}
.rate .what{text-align:left;font:800 .62in/1.2 'Inter'}
.rate .what small{display:block;font:600 .46in/1.3 'Inter';color:#cfd0d4}
.reach{display:flex;flex-direction:column;align-items:center}
.reach .call{font:800 .75in/1 'Inter';letter-spacing:.2em;text-transform:uppercase}
.reach .num{font:800 3in/1 'Barlow Condensed';margin-top:.15in;white-space:nowrap}

.left{background:${CREAM};color:${INK}}
.left .safe{justify-content:space-evenly}
.left h2{font:800 1.15in/1 'Barlow Condensed';text-transform:uppercase}
.quotes{display:flex;flex-direction:column;gap:.3in;width:100%}
.q{background:#fff;border-radius:.22in;padding:.34in .36in .3in;text-align:left;box-shadow:0 .03in .1in rgba(0,0,0,.12)}
.q p{font:600 .43in/1.3 'Inter';margin-top:.14in}
.q .by{font:800 .34in/1 'Inter';margin-top:.16in;color:#4a4c54}
.left .foot{font:800 .5in/1.2 'Inter'}

.right{background:${INK};color:#fff}
.right .safe{justify-content:space-evenly}
.right h2{font:800 1.5in/.95 'Barlow Condensed';text-transform:uppercase}
.right h2 em{font-style:normal;color:${YELLOW}}
.qr{background:#fff;border-radius:.3in;padding:.45in;width:8in;height:8in}
.qr svg{display:block;width:100%;height:100%}
.right .scan{font:800 .52in/1.2 'Inter';letter-spacing:.12em;text-transform:uppercase;margin-top:.35in}
.rr{width:100%;background:${YELLOW};color:${INK};border-radius:.25in;padding:.35in .4in .3in}
.rr .t{font:800 .9in/1 'Barlow Condensed';text-transform:uppercase}
.rr .d{font:800 .34in/1.2 'Inter';text-transform:uppercase;letter-spacing:.05em;margin-top:.12in}
.rr ul{list-style:none;margin-top:.2in}
.rr li{display:flex;align-items:center;gap:.16in;font:800 .5in/1 'Inter';padding:.1in 0;border-top:.03in solid rgba(0,0,0,.25)}
.rr li span{flex:1;text-align:left}
.rr li s{text-decoration-thickness:.05in}
.rr li b{background:${INK};color:${YELLOW};font:800 .34in/1 'Inter';letter-spacing:.1em;padding:.08in .15in;border-radius:.08in}
.rr .w{font:800 .44in/1.25 'Inter';margin-top:.16in}
.rr .say{font:600 .34in/1.3 'Inter';margin-top:.06in}

.shelf{background:${RED};color:#fff}
.shelf .safe{flex-direction:row;justify-content:center;align-items:center;gap:.35in}
.shelf .t{font:800 1.1in/1 'Barlow Condensed';text-transform:uppercase;white-space:nowrap}
.shelf .t em{font-style:normal;color:${YELLOW}}
`;

// Each piece: its finished size plus BLEED all round, and a safe box inset
// from the finished edge (more on the header's top, where the arch is cut).
// The centre's bottom stays clear by the shelf's height: the shelf sits across
// it and would hide anything there.
const SAFE = { header: [1.4, 1.2, 0.5, 1.2], left: [0.8, 0.6, 0.7, 0.6], center: [0.7, 0.9, PIECES.shelf.h + 0.9, 0.9], right: [0.8, 0.6, 0.7, 0.6], shelf: [0.35, 0.8, 0.35, 0.8] };
const piece = (name, inner) => {
  const { w, h } = PIECES[name], [t, r, b, l] = SAFE[name];
  return `<div class="piece ${name}" id="p-${name}" style="width:${w + 2 * BLEED}in;height:${h + 2 * BLEED}in">
    <div class="safe" style="left:${BLEED + l}in;top:${BLEED + t}in;right:${BLEED + r}in;bottom:${BLEED + b}in">${inner}</div></div>`;
};

const PIECE_HTML = (qrSvg) => ({
  header: piece('header', `<img src="${logo('horizontal-dark')}">`),
  center: piece('center', `
    <div class="come">I come to you</div>
    <div style="width:100%"><div class="ba">
      <div class="ph b"><img src="${fileUrl(path.join(PHOTOS, 'backseat-before.jpg'))}" style="object-position:40% 70%"><span>BEFORE</span></div>
      <div class="ph a"><img src="${fileUrl(path.join(PHOTOS, 'backseat-after.jpg'))}" style="object-position:40% 70%"><span>AFTER</span></div>
    </div><div class="cap">Same back seat. No judgment, I've seen it all.</div></div>
    <div class="rate"><div class="big">${RATING}</div>${stars('.9in')}<div class="what">${REVIEWS} Google reviews<small>${CARS} cars detailed since 2021</small></div></div>
    <div class="reach"><div class="call">Call or text</div><div class="num">${PHONE}</div></div>`),
  left: piece('left', `
    <div><h2>Don't take my<br>word for it</h2><div style="margin-top:.18in">${stars('.55in')}</div></div>
    <div class="quotes">${QUOTES.map(([who, q]) => `<div class="q">${stars('.38in')}<p>"${q}"</p><div class="by">${who} · Google review</div></div>`).join('')}</div>
    <div class="foot">${RATING} on Google · ${REVIEWS} reviews</div>`),
  right: piece('right', `
    <div><h2>See your price<br><em>in 60 seconds</em></h2></div>
    <div style="display:flex;flex-direction:column;align-items:center"><div class="qr" id="qr">${qrSvg}</div><div class="scan">Scan for my instant quote</div></div>
    <div class="rr"><div class="t">Rain-Ready Full Detail</div><div class="d">Free with any Full Detail · book by Dec 31</div>
      <ul>${FREEBIES.map(([n, p]) => `<li><span>${n}</span><s>$${p}</s><b>FREE</b></li>`).join('')}</ul>
      <div class="w">Full Detail from $${FROM}.</div><div class="say">Say "Treat Street" when you book.</div></div>`),
  shelf: piece('shelf', `<div class="t">Win a free <em>interior detail</em></div><div class="t" style="font-size:.72in">· enter at the table</div>`),
});

(async () => {
  if (Date.now() >= RR_END.getTime()) { console.error('  x Rain-Ready ended Dec 31, 2026: this board carries it, so it is not built.'); process.exit(1); }
  fs.mkdirSync(path.join(OUT, 'pieces'), { recursive: true });
  const qrSvg = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const P = PIECE_HTML(qrSvg);
  const css = CSS(qrSvg);
  const doc = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;

  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 2400, height: 3600 } })).newPage();
  const load = async (html, name) => {
    const tmp = path.join(OUT, `.render-${name}.html`);
    fs.writeFileSync(tmp, html);
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    fs.unlinkSync(tmp);
  };

  // ---- Checks: copy, overflow, the QR. ----
  const problems = [];
  await load(doc(Object.values(P).join('')), 'all');
  const text = (await page.evaluate(() => { const b = document.body.cloneNode(true); b.querySelectorAll('.q p').forEach((n) => n.remove()); document.documentElement.appendChild(b); const t = b.innerText; b.remove(); return t; })).replace(/ /g, ' ');
  for (const [re, what] of [[/—|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured'], [/lynnwood|edmonds/i, 'a town he does not serve'],
    [/\bwe\b|\bour\b/i, 'business "we"'], [/\b(?!40\b)\d+ (Google )?reviews\b/i, 'a review count other than 40'], [/polish/i, 'exterior polish (no longer in the offer)'],
    [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds']])
    if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  const spill = await page.evaluate(() => [...document.querySelectorAll('.safe')].flatMap((s) => {
    const r = s.getBoundingClientRect(), out = [];
    if (s.scrollHeight - s.clientHeight > 1) out.push(`${s.parentElement.id} spills ${s.scrollHeight - s.clientHeight}px past its safe area`);
    for (const n of s.querySelectorAll('*')) { const b = n.getBoundingClientRect(); if (b.width && (b.left < r.left - 1 || b.right > r.right + 1)) out.push(`${s.parentElement.id}: ${n.className || n.tagName} is wider than its safe area`); }
    return out;
  }));
  problems.push(...spill);
  {
    const shot = await (await page.$('#qr')).screenshot({ type: 'png' });
    const { data, info } = await sharp(shot).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const got = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    if (!got || got.data !== QR_URL) problems.push(`QR does not decode to ${QR_URL}`);
  }
  if (problems.length) { console.error(problems.map((p) => '  x ' + p).join('\n')); await browser.close(); process.exit(1); }

  // ---- Each piece as its own PDF, and a 150 dpi image of it for tiling. ----
  const DPI = 150, img = {};
  const hi = await browser.newPage({ viewport: { width: 2400, height: 3600 }, deviceScaleFactor: DPI / 96 });
  for (const name of Object.keys(PIECES)) {
    const { w, h } = PIECES[name];
    await load(doc(P[name]), name);
    await page.pdf({ path: path.join(OUT, 'pieces', `${name}-${w}x${h}-plus-bleed.pdf`), width: `${w + 2 * BLEED}in`, height: `${h + 2 * BLEED}in`, printBackground: true });
    const tmp = path.join(OUT, `.render-hi-${name}.html`);
    fs.writeFileSync(tmp, doc(P[name]));
    await hi.goto(fileUrl(tmp));
    await hi.evaluate(() => document.fonts.ready);
    await hi.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    fs.unlinkSync(tmp);
    img[name] = await (await hi.$(`#p-${name}`)).screenshot({ type: 'png' });
  }
  await hi.close();

  // ---- Two 24 x 36 posters for a print shop (24 x 36 is often same-day). ----
  const poster = async (file, placed) => {
    const body = `<div style="position:relative;width:24in;height:36in;background:#fff">${placed.map(([name, x, y]) =>
      `<div style="position:absolute;left:${x}in;top:${y}in">${P[name]}</div>`).join('')}</div>`;
    await load(doc(body), file);
    await page.pdf({ path: path.join(OUT, file), width: '24in', height: '36in', printBackground: true });
  };
  const pw = (n) => PIECES[n].w + 2 * BLEED, ph = (n) => PIECES[n].h + 2 * BLEED;
  await poster('poster-1-center-24x36.pdf', [['center', (24 - pw('center')) / 2, 0.3]]);
  await poster('poster-2-wings-shelf-24x36.pdf', [['left', (24 - pw('left') - pw('right')) / 2, 0.2], ['right', (24 - pw('left') - pw('right')) / 2 + pw('left'), 0.2],
    ['shelf', (24 - pw('shelf')) / 2, 0.2 + ph('left') + 0.3]]);

  // ---- Everything on plain letter paper, in ONE file for a normal printer
  // (Mikey, 2026-10-22): page 1 is the map of where every page goes, then
  // every piece cut into portrait pages (tiles fit a 7.5 x 10 printable area),
  // then the QR patch. Trim each page on its corner marks and butt them edge
  // to edge.
  const ORIGIN = { header: [PIECES.left.w, 0], left: [0, PIECES.header.h], center: [PIECES.left.w, PIECES.header.h],
    right: [PIECES.left.w + PIECES.center.w, PIECES.header.h], shelf: [PIECES.left.w, PIECES.header.h + PIECES.center.h - PIECES.shelf.h] };
  const CODE = { header: 'H', left: 'L', center: 'C', right: 'R', shelf: 'S' };
  const LABEL = { header: 'HEADER', left: 'LEFT WING', center: 'CENTRE PANEL', right: 'RIGHT WING', shelf: 'SHELF EDGE' };
  const tiles = [];
  for (const name of ['header', 'left', 'center', 'right', 'shelf']) {
    const W = pw(name), H = ph(name), cols = Math.ceil(W / 7.5), rows = Math.ceil(H / 10), tw = W / cols, th = H / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const jpg = await sharp(img[name]).extract({ left: Math.round(c * tw * DPI), top: Math.round(r * th * DPI),
        width: Math.min(Math.round(tw * DPI), Math.round(W * DPI) - Math.round(c * tw * DPI)), height: Math.min(Math.round(th * DPI), Math.round(H * DPI) - Math.round(r * th * DPI)) }).jpeg({ quality: 88 }).toBuffer();
      tiles.push({ name, r, c, rows, cols, tw, th, id: `${CODE[name]}${r + 1}-${c + 1}`, src: 'data:image/jpeg;base64,' + jpg.toString('base64') });
    }
  }
  const total = tiles.length + 2;
  const foot = (n) => `<div style="position:absolute;left:0;right:0;bottom:.35in;text-align:center;font:600 8pt Inter;color:#666">Page ${n} of ${total} · Treat Street board · print at 100% / Actual size</div>`;
  const mark = (x, y, w, h) => `<i style="position:absolute;left:${x}in;top:${y}in;width:${w}in;height:${h}in;background:#000"></i>`;

  // Page 1: the map.
  const k = 7.5 / 44, MX = 0.5, MY = 1.35;
  const crop = async (name) => sharp(img[name]).extract({ left: Math.round(BLEED * DPI), top: Math.round(BLEED * DPI), width: Math.round(PIECES[name].w * DPI), height: Math.round(PIECES[name].h * DPI) }).toBuffer();
  const layers = [];
  for (const n of ['header', 'left', 'center', 'right', 'shelf']) layers.push({ input: await crop(n), left: Math.round(ORIGIN[n][0] * DPI), top: Math.round(ORIGIN[n][1] * DPI) });
  const assembled = await sharp({ create: { width: 44 * DPI, height: 37 * DPI, channels: 3, background: '#ffffff' } }).composite(layers).png().toBuffer();
  const pvB64 = 'data:image/png;base64,' + (await sharp(assembled).resize(1500).png().toBuffer()).toString('base64');
  const grid = tiles.map(({ name, r, c, tw, th, id }) => {
    const x = MX + (ORIGIN[name][0] - BLEED + c * tw) * k, y = MY + (ORIGIN[name][1] - BLEED + r * th) * k;
    return `<div style="position:absolute;left:${x}in;top:${y}in;width:${tw * k}in;height:${th * k}in;border:1px solid ${name === 'shelf' ? '#ffd100' : '#00a0ff'};font:800 6.5pt/1 Inter;color:#fff;text-shadow:0 0 2px #000,0 0 2px #000;display:flex;align-items:center;justify-content:center">${id}</div>`;
  }).join('');
  const mapPage = `<div style="position:relative;width:8.5in;height:11in;overflow:hidden;page-break-after:always;font-family:Inter">
    <div style="position:absolute;left:.5in;top:.45in;font:800 18pt Inter">Treat Street board: where every page goes</div>
    <div style="position:absolute;left:.5in;top:.85in;font:600 9.5pt Inter;color:#444">Royal Brites Stage-It, 44 x 37 in open. Each box is one page, labelled the same as the page.</div>
    <img src="${pvB64}" style="position:absolute;left:${MX}in;top:${MY}in;width:7.5in">${grid}
    <div style="position:absolute;left:.5in;right:.5in;top:${MY + 37 * k + 0.3}in;font:600 10pt/1.5 Inter">
      <b>How to put it up</b><br>
      1. Print every page at <b>100% / Actual size</b> (not "Fit to page"). ${total} pages.<br>
      2. Trim each page on its four corner marks.<br>
      3. Lay each piece out on the floor first: H = header, L = left wing, C = centre, R = right wing, S = shelf edge.
         "C2-3" means centre panel, row 2, column 3, counting from the top left.<br>
      4. Glue the pages onto the board edge to edge (glue stick or spray adhesive), starting at the top left of each panel.
         Every piece is printed a little bigger than the board on purpose: once it's dry, trim it to the board's own edge with a
         box cutter, around the header's arch too.<br>
      5. The shelf edge strip goes on the front lip of the shelf.<br>
      6. Scan the QR with your phone. If it won't open the quote page, glue the last page (the QR patch) right over it.</div>
    ${foot(1)}</div>`;

  const tilePages = tiles.map(({ name, r, c, rows, cols, tw, th, id, src }, i) => {
    const L = (8.5 - tw) / 2, T = 0.5, M = 0.16, G = 0.05, t = 0.01;
    const corners = [[L, T], [L + tw, T], [L, T + th], [L + tw, T + th]].map(([x, y]) =>
      mark(x - t / 2, y < T + 1 ? y - G - M : y + G, t, M) + mark(x < L + 1 ? x - G - M : x + G, y - t / 2, M, t)).join('');
    return `<div style="position:relative;width:8.5in;height:11in;overflow:hidden;page-break-after:always">
      <img src="${src}" style="position:absolute;left:${L}in;top:${T}in;width:${tw}in;height:${th}in">${corners}
      <div style="position:absolute;left:0;right:0;top:${T + th + 0.22}in;text-align:center;font:600 9.5pt/1.35 Inter">
        <b style="font-size:16pt">${id}</b> &nbsp; ${LABEL[name]}, row ${r + 1} of ${rows}, column ${c + 1} of ${cols}. Trim on the marks.</div>${foot(i + 2)}</div>`;
  }).join('');

  const qrPage = `<div style="position:relative;width:8.5in;height:11in;background:#fff;overflow:hidden">
    <div class="qr" style="position:absolute;left:.25in;top:1in">${qrSvg}</div>
    <div style="position:absolute;left:.5in;right:.5in;top:9.35in;text-align:center;font:600 10pt/1.4 Inter"><b>QR PATCH</b>: only if the QR on the right wing won't scan once it's glued up. Trim to the white square and glue it right over it.</div>${foot(total)}</div>`;

  await load(doc(mapPage + tilePages + qrPage), 'print-me');
  await page.pdf({ path: path.join(OUT, 'PRINT-ME-letter.pdf'), width: '8.5in', height: '11in', printBackground: true });
  console.log(`  PRINT-ME-letter.pdf: ${total} letter pages (map, ${tiles.length} tiles, QR patch)`);

  // ---- Preview: the board assembled (finished sizes, bleed trimmed off). ----
  const crop2 = async (name) => sharp(img[name]).extract({ left: Math.round(BLEED * DPI), top: Math.round(BLEED * DPI), width: Math.round(PIECES[name].w * DPI), height: Math.round(PIECES[name].h * DPI) }).toBuffer();
  const S = DPI, top = PIECES.header.h, gap = 0;
  const boardW = PIECES.left.w + PIECES.center.w + PIECES.right.w, boardH = top + PIECES.center.h;
  const pv = await sharp({ create: { width: Math.round(boardW * S), height: Math.round(boardH * S), channels: 3, background: '#d9d6cf' } })
    .composite([
      { input: await crop2('header'), left: Math.round(PIECES.left.w * S), top: 0 },
      { input: await crop2('left'), left: 0, top: Math.round(top * S) },
      { input: await crop2('center'), left: Math.round(PIECES.left.w * S), top: Math.round(top * S) },
      { input: await crop2('right'), left: Math.round((PIECES.left.w + PIECES.center.w) * S), top: Math.round(top * S) },
      { input: await crop2('shelf'), left: Math.round(PIECES.left.w * S), top: Math.round((boardH - PIECES.shelf.h) * S) },
    ]).png().toBuffer();
  fs.writeFileSync(path.join(OUT, 'preview.png'), await sharp(pv).resize(2000).png().toBuffer());
  await browser.close();
  console.log(`  wrote ${path.relative(ROOT, OUT)}/: pieces, two 24 x 36 posters, letter tiles, preview.png (QR decodes)`);
})();
