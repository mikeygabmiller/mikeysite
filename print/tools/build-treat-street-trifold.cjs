// Renders the Treat Street tri-fold board: a standard 36 x 48 in board, open
// flat it is 48 wide, a 24 in centre and two 12 in wings. It stands raised on
// a crate at the back of the booth, so it has to be read from 30 ft by
// people walking past and then hold them for a minute once they stop:
//   left wing    the back-seat before/after
//   centre       the logo, "I come to you", the Google rating, the phone
//   right wing   three real Google reviews over a small Rain-Ready box
// (Mikey, 2026-10-22: reviews to build trust, and the offer not a whole side.)
//
//   cd print/tools && npm install && npm run treat-trifold
//
// Output lands in print/treat-street/trifold/:
//   full-48x36.pdf      the whole board as one print; cut at 12 and 36 in
//                       (where the colours change) and glue a panel to each fold
//   left-12x36.pdf, center-24x36.pdf, right-12x36.pdf   the same, one per panel
//   tiled-letter.pdf    the same board on 28 letter pages for any printer:
//                       trim each on its marks and butt them edge to edge
//   preview.png
//
// It is one more copy of the facts table in CLAUDE.md (phone, 5.0 across 40,
// 300+ cars) and carries the Rain-Ready offer as it stands since 2026-10-15
// (ceramic wax $20, RainX $10, RainX Anti-Fog $30, worth $508, from $369, book
// by Dec 31). It refuses to build from January 1, 2027.
//
// The reviews are his Google reviews, word for word, read from the Business
// Profile through Windsor on 2026-10-22 (all 40, all five stars). Quote them
// exactly or not at all; a trimmed one says so with "...". Never a review that
// isn't on Google: the site's reviews page has two that aren't (see README).

const { chromium } = require('playwright');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'treat-street', 'trifold');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const PHOTOS = path.join(ROOT, 'social', 'photos');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

const PHONE = '(425) 600-7897';
const RR_END = new Date('2027-01-01T00:00:00-08:00');
// PRICING.md: the add-ons the offer gives away, and the bundle's value.
const FREEBIES = [['Ceramic wax', 20], ['RainX windshield', 10], ['RainX anti-fog', 30]];
const WORTH = 508, FROM = 369;

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

const CSS = `
${fontFace('Barlow Condensed', 'barlow-condensed', 800)}
${fontFace('Inter', 'inter', 600)}
${fontFace('Inter', 'inter', 800)}
@page{margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
.board{position:relative;width:48in;height:36in;display:flex;overflow:hidden}
.panel{height:36in;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden}
.stars{display:inline-flex;gap:.06em}
.l{width:12in;background:${INK};color:#fff;padding:.7in .6in}
.c{width:24in;background:#fff;color:${INK};padding:.9in 1in .9in;justify-content:space-evenly}
.r{width:12in;background:${CREAM};color:${INK};padding:.75in .55in .6in;justify-content:space-between}

.l h2{font:800 1.5in/1 'Barlow Condensed';text-transform:uppercase;letter-spacing:.01em}
.ph{position:relative;width:100%;height:13.6in;margin-top:.45in;border-radius:.25in;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.ph span{position:absolute;left:.3in;top:.3in;font:800 .75in/1 'Inter';letter-spacing:.08em;padding:.18in .3in;border-radius:.12in}
.ph.b span{background:#fff;color:${INK}}
.ph.a span{background:${RED};color:#fff}
.l .cap{margin-top:auto;font:600 .62in/1.25 'Inter'}

.c .logo{width:15.5in}
.c .come{font:800 3.8in/1 'Barlow Condensed';text-transform:uppercase;color:${RED};white-space:nowrap}
.c .rate{display:flex;align-items:center;gap:.45in;background:${INK};color:#fff;border-radius:.4in;padding:.4in .7in}
.c .rate .big{font:800 2.2in/1 'Barlow Condensed'}
.c .rate .what{text-align:left;font:800 .72in/1.2 'Inter'}
.c .rate .what small{display:block;font:600 .55in/1.3 'Inter';color:#cfd0d4}
.c .reach{display:flex;flex-direction:column;align-items:center}
.c .call{font:800 .9in/1 'Inter';letter-spacing:.2em;text-transform:uppercase}
.c .ph2{font:800 3.3in/1 'Barlow Condensed';margin-top:.2in;white-space:nowrap}

.r h2{font:800 1.25in/1 'Barlow Condensed';text-transform:uppercase}
.r .hs{margin-top:.2in}
.quotes{display:flex;flex-direction:column;gap:.3in;width:100%;margin:.35in 0}
.q{background:#fff;border-radius:.25in;padding:.38in .4in .34in;text-align:left;box-shadow:0 .04in .12in rgba(0,0,0,.12)}
.q p{font:600 .47in/1.3 'Inter';margin-top:.16in}
.q .by{font:800 .38in/1 'Inter';margin-top:.2in;color:#4a4c54}
.rr{width:100%;background:${YELLOW};border:.1in solid ${INK};border-radius:.25in;padding:.35in .4in .32in}
.rr .t{font:800 .95in/1 'Barlow Condensed';text-transform:uppercase}
.rr .d{font:800 .36in/1.2 'Inter';text-transform:uppercase;letter-spacing:.06em;margin-top:.12in}
.rr ul{list-style:none;margin-top:.22in}
.rr li{display:flex;align-items:center;gap:.18in;font:800 .54in/1 'Inter';padding:.1in 0;border-top:.03in solid rgba(0,0,0,.25)}
.rr li span{flex:1;text-align:left}
.rr li s{text-decoration-thickness:.05in}
.rr li b{background:${INK};color:${YELLOW};font:800 .36in/1 'Inter';letter-spacing:.1em;padding:.08in .16in;border-radius:.08in}
.rr .w{font:800 .44in/1.25 'Inter';margin-top:.18in}
.rr .say{font:600 .34in/1.3 'Inter';margin-top:.06in}
`;

const board = () => `<div class="board" id="board">
  <div class="panel l">
    <h2>Same back seat</h2>
    <div class="ph b"><img src="${fileUrl(path.join(PHOTOS, 'backseat-before.jpg'))}" style="object-position:40% 70%"><span>BEFORE</span></div>
    <div class="ph a"><img src="${fileUrl(path.join(PHOTOS, 'backseat-after.jpg'))}" style="object-position:40% 70%"><span>AFTER</span></div>
    <div class="cap">No judgment.<br>I've seen it all.</div>
  </div>
  <div class="panel c">
    <img class="logo" src="${fileUrl(path.join(BRAND, 'transparent-png', 'stacked-light.png'))}">
    <div class="come">I come to you</div>
    <div class="rate"><div class="big">${RATING}</div>${stars('1.05in')}<div class="what">${REVIEWS} Google reviews<small>${CARS} cars detailed since 2021</small></div></div>
    <div class="reach"><div class="call">Call or text</div><div class="ph2">${PHONE}</div></div>
  </div>
  <div class="panel r">
    <div><h2>Don't take my<br>word for it</h2><div class="hs">${stars('.6in')}</div></div>
    <div class="quotes">${QUOTES.map(([who, q]) => `<div class="q">${stars('.42in')}<p>"${q}"</p><div class="by">${who} · Google review</div></div>`).join('')}</div>
    <div class="rr"><div class="t">Rain-Ready Full Detail</div><div class="d">Free with any Full Detail · book by Dec 31</div>
      <ul>${FREEBIES.map(([n, p]) => `<li><span>${n}</span><s>$${p}</s><b>FREE</b></li>`).join('')}</ul>
      <div class="w">Worth $${WORTH}. From $${FROM}.</div><div class="say">Say "Treat Street" when you book.</div></div>
  </div>
</div>`;

(async () => {
  if (Date.now() >= RR_END.getTime()) { console.error('  x Rain-Ready ended Dec 31, 2026: this board carries it, so it is not built.'); process.exit(1); }
  if (FREEBIES.reduce((s, [, p]) => s + p, 0) + 249 + 199 !== WORTH) { console.error('  x the freebies no longer add up to $' + WORTH + ' (PRICING.md)'); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 48 * 96, height: 36 * 96 } })).newPage();
  const tmp = path.join(OUT, '.render.html');
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${board()}</body></html>`);
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
  fs.unlinkSync(tmp);

  const problems = [];
  // Mikey's own words only: the customers' quotes are theirs, "we" and all.
  const text = (await page.evaluate(() => { const b = document.body.cloneNode(true); b.querySelectorAll('.q p').forEach((n) => n.remove()); document.documentElement.appendChild(b); const t = b.innerText; b.remove(); return t; })).replace(/\u00a0/g, ' ');
  for (const [re, what] of [[/—|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured'], [/lynnwood|edmonds/i, 'a town he does not serve'],
    [/\bwe\b|\bour\b/i, 'business "we"'], [/\b(?!40\b)\d+ (Google )?reviews\b/i, 'a review count other than the facts table (40)'], [/polish/i, 'exterior polish (no longer in the offer)']])
    if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  // Nothing may overflow its panel, and no line may be wider than its panel.
  const spill = await page.evaluate(() => [...document.querySelectorAll('.panel')].flatMap((p) => {
    const r = p.getBoundingClientRect(), out = [];
    if (p.scrollHeight - p.clientHeight > 1) out.push(`${p.className} spills ${p.scrollHeight - p.clientHeight}px at the bottom`);
    for (const n of p.querySelectorAll('*')) { const b = n.getBoundingClientRect(); if (b.width && (b.left < r.left - 1 || b.right > r.right + 1)) out.push(`${p.className}: ${n.className || n.tagName} is wider than the panel`); }
    return out;
  }));
  problems.push(...spill);
  if (problems.length) { console.error(problems.map((p) => '  x ' + p).join('\n')); await browser.close(); process.exit(1); }

  await page.pdf({ path: path.join(OUT, 'full-48x36.pdf'), width: '48in', height: '36in', printBackground: true });
  const shot = await (await page.$('#board')).screenshot({ type: 'png', scale: 'css' });
  fs.writeFileSync(path.join(OUT, 'preview.png'), shot);
  // Tiled on letter paper. Columns follow the folds (wings 6 + 6, centre
  // 8 + 8 + 8) so no page straddles a fold, and rows are 9 in, so every tile
  // fits a home printer's 8 x 10.5 printable area. 7 x 4 = 28 pages.
  {
    const DPI = 150, COLS = [6, 6, 8, 8, 8, 6, 6], ROW = 9, ROWS = 4;
    const where = (c) => (c < 2 ? 'left wing' : c < 5 ? 'centre' : 'right wing');
    const big = await browser.newPage({ viewport: { width: 48 * 96, height: 36 * 96 }, deviceScaleFactor: DPI / 96 });
    const tmp2 = path.join(OUT, '.render-tiles.html');
    fs.writeFileSync(tmp2, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${board()}</body></html>`);
    await big.goto(fileUrl(tmp2));
    await big.evaluate(() => document.fonts.ready);
    await big.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    fs.unlinkSync(tmp2);
    const full = await (await big.$('#board')).screenshot({ type: 'png' });
    await big.close();
    const pages = [];
    let x0 = 0;
    for (let c = 0; c < COLS.length; c++) {
      for (let r = 0; r < ROWS; r++) {
        const jpg = await sharp(full).extract({ left: Math.round(x0 * DPI), top: Math.round(r * ROW * DPI), width: Math.round(COLS[c] * DPI), height: Math.round(ROW * DPI) }).jpeg({ quality: 88 }).toBuffer();
        pages.push({ c, r, w: COLS[c], src: 'data:image/jpeg;base64,' + jpg.toString('base64') });
      }
      x0 += COLS[c];
    }
    pages.sort((a, b) => a.r - b.r || a.c - b.c);
    const mark = (x, y, w, h) => `<i style="position:absolute;left:${x}in;top:${y}in;width:${w}in;height:${h}in;background:#000"></i>`;
    const html = pages.map(({ c, r, w, src }) => {
      const L = (8.5 - w) / 2, T = 0.75, M = 0.18, G = 0.05, t = 0.01;
      const corners = [[L, T], [L + w, T], [L, T + ROW], [L + w, T + ROW]].map(([x, y]) =>
        mark(x - t / 2, y < T + 1 ? y - G - M : y + G, t, M) + mark(x < L + 1 ? x - G - M : x + G, y - t / 2, M, t)).join('');
      return `<div style="position:relative;width:8.5in;height:11in;overflow:hidden;page-break-after:always">
        <img src="${src}" style="position:absolute;left:${L}in;top:${T}in;width:${w}in;height:${ROW}in">${corners}
        <div style="position:absolute;left:0;right:0;top:${T + ROW + 0.3}in;text-align:center;font:600 11pt/1.4 Inter">
          <b style="font-size:20pt">${'ABCD'[r]}${c + 1}</b><br>Row ${'ABCD'[r]} of 4 (top to bottom), column ${c + 1} of 7 (left to right), ${where(c)}. Trim on the marks.</div></div>`;
    }).join('');
    const tp = await browser.newPage();
    const tmp3 = path.join(OUT, '.render-tiled.html');
    fs.writeFileSync(tmp3, `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace('Inter', 'inter', 600)}@page{margin:0}*{margin:0;padding:0}</style></head><body>${html}</body></html>`);
    await tp.goto(fileUrl(tmp3));
    await tp.evaluate(() => document.fonts.ready);
    await tp.pdf({ path: path.join(OUT, 'tiled-letter.pdf'), width: '8.5in', height: '11in', printBackground: true });
    fs.unlinkSync(tmp3);
    await tp.close();
    console.log(`  tiled-letter.pdf: ${pages.length} pages`);
  }

  // One panel per file: a window the panel's width, with the board slid left
  // inside it, so each print is exactly that panel and nothing of its neighbour.
  for (const [name, x, w] of [['left-12x36', 0, 12], ['center-24x36', 12, 24], ['right-12x36', 36, 12]]) {
    await page.evaluate(({ x, w }) => {
      const b = document.getElementById('board');
      const win = document.createElement('div');
      win.id = 'win'; win.style.cssText = `position:relative;width:${w}in;height:36in;overflow:hidden`;
      b.style.cssText = `position:absolute;top:0;left:-${x}in`;
      document.body.replaceChildren(win); win.appendChild(b);
    }, { x, w });
    await page.pdf({ path: path.join(OUT, `${name}.pdf`), width: `${w}in`, height: '36in', printBackground: true });
  }
  await browser.close();
  console.log(`  wrote ${path.relative(ROOT, OUT)}/full-48x36.pdf, left/center/right panels, preview.png`);
})();
