// Renders the Treat Street tri-fold board: a standard 36 x 48 in board, open
// flat it is 48 wide, a 24 in centre and two 12 in wings. It stands raised on
// a crate at the back of the booth, so its job is to be read from 30 ft by
// people walking past. Three things only, big: a before/after, who and the
// phone, the live offer.
//
//   cd print/tools && npm install && npm run treat-trifold
//
// Output lands in print/treat-street/trifold/:
//   full-48x36.pdf      the whole board as one print; cut at 12 and 36 in
//                       (where the colours change) and glue a panel to each fold
//   left-12x36.pdf, center-24x36.pdf, right-12x36.pdf   the same, one per panel
//   preview.png
//
// It is one more copy of the facts table in CLAUDE.md (phone, 5.0 across 39,
// 300+ cars) and carries the Rain-Ready offer as it stands since 2026-10-15
// (ceramic wax $20, RainX $10, RainX Anti-Fog $30, worth $508, from $369, book
// by Dec 31). It refuses to build from January 1, 2027.

const { chromium } = require('playwright');
const fs = require('fs');
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

const RED = '#E31924', INK = '#111114', YELLOW = '#FFD100';
const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const CSS = `
${fontFace('Barlow Condensed', 'barlow-condensed', 800)}
${fontFace('Inter', 'inter', 600)}
${fontFace('Inter', 'inter', 800)}
@page{margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
.board{position:relative;width:48in;height:36in;display:flex;overflow:hidden}
.panel{height:36in;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden}
.l{width:12in;background:${INK};color:#fff;padding:.7in .6in}
.c{width:24in;background:#fff;color:${INK};padding:1in 1in .9in;justify-content:space-evenly}
.r{width:12in;background:${YELLOW};color:${INK};padding:.9in .6in .8in;justify-content:space-between}

.l h2{font:800 1.5in/1 'Barlow Condensed';text-transform:uppercase;letter-spacing:.01em}
.ph{position:relative;width:100%;height:13.6in;margin-top:.45in;border-radius:.25in;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.ph span{position:absolute;left:.3in;top:.3in;font:800 .75in/1 'Inter';letter-spacing:.08em;padding:.18in .3in;border-radius:.12in}
.ph.b span{background:#fff;color:${INK}}
.ph.a span{background:${RED};color:#fff}
.l .cap{margin-top:auto;font:600 .62in/1.25 'Inter'}

.c .logo{width:17in}
.c .reach{display:flex;flex-direction:column;align-items:center}
.c .come{font:800 3.8in/1 'Barlow Condensed';text-transform:uppercase;color:${RED};white-space:nowrap}
.c .call{font:800 .9in/1 'Inter';letter-spacing:.2em;text-transform:uppercase}
.c .ph2{font:800 3.3in/1 'Barlow Condensed';margin-top:.25in;white-space:nowrap}
.c .proof{font:600 .78in/1 'Inter';color:#4a4c54;margin-top:.55in;white-space:nowrap}

.r h2{font:800 2.25in/.92 'Barlow Condensed';text-transform:uppercase}
.r .sub{font:800 .62in/1.3 'Inter';text-transform:uppercase;letter-spacing:.06em}
.boxes{display:flex;flex-direction:column;gap:.55in;width:100%}
.box{border:.12in solid ${INK};border-radius:.3in;padding:.5in .2in .55in}
.box .n{font:800 1.3in/1 'Barlow Condensed';text-transform:uppercase;white-space:nowrap}
.box .p{font:800 1.05in/1 'Inter';text-decoration:line-through;text-decoration-thickness:.09in;margin-top:.3in}
.box .f{display:inline-block;font:800 .9in/1 'Inter';letter-spacing:.14em;background:${INK};color:${YELLOW};border-radius:.15in;padding:.2in .45in;margin-top:.3in}
.r .worth{font:800 .9in/1.15 'Inter'}
.r .say{font:600 .55in/1.3 'Inter';margin-top:.25in}
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
    <div class="reach"><div class="call">Call or text</div>
    <div class="ph2">${PHONE}</div>
    <div class="proof">5.0 on Google · 300+ cars detailed</div></div>
  </div>
  <div class="panel r">
    <div><h2>Rain-Ready<br>Full Detail</h2>
    <div class="sub" style="margin-top:.4in">Free with any Full Detail<br>Book by Dec 31</div></div>
    <div class="boxes">${FREEBIES.map(([n, p]) => `<div class="box"><div class="n">${n}</div><div class="p">$${p}</div><div class="f">FREE</div></div>`).join('')}</div>
    <div><div class="worth">Worth $${WORTH}.<br>From $${FROM}.</div>
    <div class="say">Say "Treat Street" when you book.</div></div>
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
  const text = (await page.evaluate(() => document.body.innerText)).replace(/ /g, ' ');
  for (const [re, what] of [[/—|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured'], [/lynnwood|edmonds/i, 'a town he does not serve'],
    [/\bwe\b|\bour\b/i, 'business "we"'], [/\b4\d reviews\b|41/, 'a review count other than the facts table'], [/polish/i, 'exterior polish (no longer in the offer)']])
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
