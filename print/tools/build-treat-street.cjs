// Renders the Treat Street booth printables (Macaroni KID, Evergreen Speedway,
// Sat Oct 24, 2026). All three print on plain letter paper at home or a UPS
// Store; white backgrounds so a home printer's ink lasts.
//
//   cd print/tools && npm install && npm run treat-street
//
// Output lands in print/treat-street/:
//   entry-slips.pdf     four drawing slips per sheet, cut on the dashed lines
//   giveaway-sign.pdf   "Win a free interior detail", for an easel at the table
//   quote-sign.pdf      the QR to the quote calculator, prices and the live offer
//   preview-*.png
//
// Read print/treat-street/README.md first. These are one more copy of the
// facts table in CLAUDE.md (prices, 60 seconds, the phone, the twelve towns,
// spigot and outlet), and the quote sign carries the Rain-Ready offer with the
// hanger's own terms, so after Dec 31, 2026 it must not be printed again.
//
// The drawing is free to enter, no purchase: that keeps it a promotional
// drawing rather than a raffle, which Washington leaves to licensed
// nonprofits. Texting anyone afterwards needs the box on their slip ticked
// (Washington's Commercial Electronic Mail Act covers texts).

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'treat-street');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Every one of these is in the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
// The dashboard reads utm_source off every visit, so a scan at the booth is
// told apart from hangers, cards and signs.
const QR_URL = 'https://mikeysdetailing.com/?utm_source=treatstreet&utm_medium=event#booking';
const TOWNS = ['Snohomish', 'Lake Stevens', 'Everett', 'Monroe', 'Mill Creek', 'Marysville',
  'Bothell', 'Duvall', 'Mukilteo', 'Woodinville', 'Granite Falls', 'Arlington'];
// The drawing. Mikey's call (2026-10-15): one free Interior Detail.
// Any size and any condition: $329 van + $60 War Zone = $389 at the top.
const DRAW_DAY = 'Monday, Oct 26';
const PRIZE_TOP = '$389';
// The quote sign carries the live offer only while it's live.
const RR_END = new Date('2027-01-01T00:00:00-08:00');
const WITH_OFFER = Date.now() < RR_END.getTime();

const RED = '#E31924', INK = '#141418', GREY = '#5b5d66';
const MIN_PT = 7;
const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;
const logo = (kind) => fileUrl(path.join(BRAND, 'transparent-png', `${kind}-light.png`));
const nb = (s) => s.replace(/ /g, ' ');

const CSS = `
${fontFace('Barlow Condensed', 'barlow-condensed', 600)}
${fontFace('Barlow Condensed', 'barlow-condensed', 800)}
${fontFace('Inter', 'inter', 400)}
${fontFace('Inter', 'inter', 600)}
${fontFace('Inter', 'inter', 800)}
@page{margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff;color:${INK}}
.sheet{position:relative;width:8.5in;height:11in;overflow:hidden;background:#fff}
.red{color:${RED}}

/* entry slips: 2 x 2 on the sheet, each 4.25 x 5.5 */
.slip{position:absolute;width:4.25in;height:5.5in;padding:.36in .38in .4in;display:flex;flex-direction:column}
.cut{position:absolute;border:0 dashed #9a9ca4}
.cut.v{left:4.25in;top:0;bottom:0;border-left-width:1px}
.cut.h{top:5.5in;left:0;right:0;border-top-width:1px}
.slip .top{display:flex;align-items:center;gap:.14in}
.slip .top img{width:1.3in}
.slip .top .t{font:800 21pt/.95 'Barlow Condensed';text-transform:uppercase}
.slip .top .t em{font-style:normal;color:${RED}}
.slip .sub{font:600 8.4pt/1.3 'Inter';color:${GREY};margin-top:.08in}
.slip .f{display:flex;align-items:flex-end;gap:.08in;margin-top:.14in}
.slip .f .l{font:800 7.6pt/1 'Inter';letter-spacing:.12em;text-transform:uppercase;color:${GREY};flex:none;width:.72in}
.slip .f .u{flex:1;border-bottom:1.2px solid ${INK};height:.27in}
.slip .ok{display:flex;gap:.09in;align-items:flex-start;margin-top:.16in;font:600 8.4pt/1.32 'Inter'}
.slip .ok i{flex:none;width:.19in;height:.19in;border:1.4px solid ${INK};border-radius:.03in;margin-top:.01in}
.slip .ok small{display:block;font:400 7.4pt/1.3 'Inter';color:${GREY}}
.slip .terms{margin-top:auto;padding-top:.1in;font:400 7pt/1.36 'Inter';color:${GREY}}

/* signs: letter portrait */
.sign{padding:.5in .6in .5in;display:flex;flex-direction:column;align-items:center;text-align:center}
.sign .logo{width:3.2in}
.sign .eyebrow{font:800 11pt/1 'Inter';letter-spacing:.22em;text-transform:uppercase;color:${GREY};margin-top:.28in}
.sign h1{font:800 76pt/.9 'Barlow Condensed';text-transform:uppercase;margin-top:.14in}
.sign h1 em{font-style:normal;color:${RED}}
.sign .rule{width:2in;height:5px;background:${RED};margin:.26in 0 .24in}
.sign .line{font:600 21pt/1.28 'Inter'}
.sign .worth{font:800 15pt/1.3 'Inter';margin-top:.24in}
.sign .how{margin-top:auto;display:flex;flex-direction:column;gap:.12in;align-self:stretch}
.sign .how div{display:flex;align-items:center;gap:.16in;text-align:left;font:600 16pt/1.25 'Inter'}
.sign .how b{flex:none;width:.5in;height:.5in;border-radius:50%;background:${RED};color:#fff;font:800 19pt/.5in 'Inter';text-align:center}
.sign .fine{font:400 9pt/1.4 'Inter';color:${GREY};margin-top:.3in}

.q h1{font-size:56pt}
.q .code{width:2.9in;height:2.9in;margin-top:.22in;padding:.16in;border:3px solid ${INK};border-radius:.12in;background:#fff}
.q .code svg{display:block;width:100%;height:100%}
.q .scan{font:800 15pt/1 'Inter';letter-spacing:.14em;text-transform:uppercase;margin-top:.16in}
.q .prices{display:flex;gap:.12in;margin-top:.24in;align-self:stretch}
.q .prices div{flex:1;border:1.5px solid ${INK};border-radius:.08in;padding:.1in .04in}
.q .prices b{display:block;font:800 11pt/1 'Inter';letter-spacing:.1em;text-transform:uppercase;color:${GREY}}
.q .prices span{display:block;font:800 19pt/1.1 'Barlow Condensed';margin-top:.06in}
.q .note{font:400 10pt/1.3 'Inter';color:${GREY};margin-top:.08in}
.q .rr{margin-top:.2in;align-self:stretch;background:${RED};color:#fff;border-radius:.08in;padding:.12in .18in;font:600 12.5pt/1.32 'Inter'}
.q .rr b{font-weight:800}
.q .bottom{margin-top:auto;padding-top:.16in;font:600 12pt/1.45 'Inter'}
.q .bottom .ph{font:800 26pt/1.1 'Barlow Condensed';letter-spacing:.02em}
.q .bottom .towns{font:400 10pt/1.45 'Inter';color:${GREY};margin-top:.06in}
`;

const slip = (x, y) => `<div class="slip" style="left:${x}in;top:${y}in">
  <div class="top"><img src="${logo('stacked')}"><div class="t">Win a free<br><em>interior detail</em></div></div>
  <div class="sub">Any size, any condition. Crumbs, juice boxes, car seats: no judgment, I've seen it all.</div>
  <div class="f"><span class="l">Name</span><span class="u"></span></div>
  <div class="f"><span class="l">Phone</span><span class="u"></span></div>
  <div class="f"><span class="l">Town</span><span class="u"></span></div>
  <div class="f"><span class="l">You drive</span><span class="u"></span></div>
  <div class="ok"><i></i><span>Yes, Mikey can text me about detailing now and then.<small>Reply STOP any time. I text the winner either way.</small></span></div>
  <div class="terms">Free to enter, no purchase needed. Adults 18+, one entry per household. I draw one winner ${nb(DRAW_DAY)} and text them that day. Prize: one Interior Detail, any size, any condition (worth up to ${PRIZE_TOP}), add-ons (pet hair, carpet shampoo) not included, done in your driveway in any of the twelve towns I serve, booked within 60 days. You provide an outdoor spigot and a power outlet, like every job. Mikey's Mobile Detailing, ${nb(PHONE)}</div>
</div>`;

const slips = () => `<div class="sheet" id="slips">
  ${slip(0, 0)}${slip(4.25, 0)}${slip(0, 5.5)}${slip(4.25, 5.5)}
  <div class="cut v"></div><div class="cut h"></div>
</div>`;

const giveaway = () => `<div class="sheet sign" id="give">
  <img class="logo" src="${logo('stacked')}">
  <div class="eyebrow">Free drawing</div>
  <h1>Win a free<br><em>interior detail</em></h1>
  <div class="rule"></div>
  <div class="line">Crumbs, juice boxes, car seats, sticky cup holders.<br>No judgment, I've seen it all.</div>
  <div class="worth">Any size, any condition. Worth up to ${PRIZE_TOP}.</div>
  <div class="how">
    <div><b>1</b><span>Fill out a slip while your kid takes a shot.</span></div>
    <div><b>2</b><span>Drop it in the box.</span></div>
    <div><b>3</b><span>I draw one winner ${nb(DRAW_DAY)} and text them.</span></div>
  </div>
  <div class="fine">Free to enter, no purchase needed. Adults 18+, one entry per household. Full terms on the slip.</div>
</div>`;

const quote = (qrSvg) => `<div class="sheet sign q" id="quote">
  <img class="logo" src="${logo('horizontal')}" style="width:3.8in">
  <h1 style="margin-top:.2in">See your price<br><em>in 60 seconds</em></h1>
  <div class="code">${qrSvg}</div>
  <div class="scan">Scan for my instant quote</div>
  <div class="prices">
    <div><b>Exterior</b><span>$199–$279</span></div>
    <div><b>Interior</b><span>$249–$329</span></div>
    <div><b>Full Detail</b><span>$369–$449</span></div>
  </div>
  <div class="note">Sedan to van or 3-row. How rough it is can add $30 or $60.</div>
  ${WITH_OFFER ? `<div class="rr"><b>Rain-Ready:</b> book a Full Detail by December 31 and the exterior polish, ceramic wax and RainX are free (worth $508, from $369). Mention Treat Street.</div>` : ''}
  <div class="bottom">
    I come to your driveway. You pay after the work, never a deposit.
    <div class="ph">Call or text ${PHONE}</div>
    <div class="towns">${TOWNS.map(nb).join(' · ')}</div>
  </div>
</div>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const qrSvg = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 816, height: 1056 } });
  const page = await ctx.newPage();
  const problems = [];

  const render = async (body, name) => {
    const tmp = path.join(OUT, `.render-${name}.html`);
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`);
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    fs.unlinkSync(tmp);
  };

  const check = async (label, id) => {
    const text = (await page.evaluate(() => document.body.innerText)).replace(/ /g, ' ');
    const banned = [[/—|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (he is neither)'],
      [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'],
      [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'],
      [/dog hair|pet hair(?! *, carpet)/i, 'pet hair as part of the prize (it is an add-on)'], [/raffle|ticket purchase|\$\d+ (to|per) enter/i, 'a paid raffle (WA: nonprofits only)']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`${label}: copy contains ${what}: "${text.match(re)[0]}"`);
    if (label === 'quote') {
      for (const need of ['$199–$279', '$249–$329', '$369–$449', '60 seconds', PHONE, ...TOWNS])
        if (!text.toLowerCase().includes(need.toLowerCase())) problems.push(`quote: missing "${need}"`);
    }
    if (label === 'slips') for (const need of ['no purchase', '18+', 'Reply STOP', 'spigot', 'outlet'])
      if (!text.includes(need)) problems.push(`slips: missing "${need}"`);
    const small = await page.evaluate((min) => [...document.querySelectorAll('body *')].filter((n) => [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()))
      .map((n) => [n.className || n.tagName, parseFloat(getComputedStyle(n).fontSize) * 0.75]).filter(([, pt]) => pt < min - 0.05), MIN_PT);
    for (const [cls, pt] of small) problems.push(`${label}: ${cls} is ${pt.toFixed(1)} pt, under ${MIN_PT} pt`);
    // Nothing may spill out of its box, and nothing within 0.3 in of the
    // paper's edge, where a home printer can't reach.
    const spill = await page.evaluate((id) => [...document.querySelectorAll(`#${id}, #${id} .slip`)]
      .filter((n) => n.scrollHeight - n.clientHeight > 1).map((n) => n.className), id);
    if (spill.length) problems.push(`${label}: copy spills past the bottom of ${spill.join(', ')}`);
    const edge = await page.evaluate((id) => {
      const s = document.getElementById(id).getBoundingClientRect(), m = 0.3 * 96, out = [];
      for (const n of document.querySelectorAll(`#${id} *`)) {
        if (n.classList.contains('cut') || n.classList.contains('slip')) continue;
        const r = n.getBoundingClientRect(); if (!r.width || !r.height) continue;
        if (r.left - s.left < m || r.top - s.top < m || s.right - r.right < m || s.bottom - r.bottom < m) out.push(n.className || n.tagName);
      }
      return [...new Set(out)];
    }, id);
    if (edge.length) problems.push(`${label}: too close to the paper edge: ${edge.join(', ')}`);
  };

  const out = async (body, id, name) => {
    await render(body, name);
    await check(name, id);
    fs.writeFileSync(path.join(OUT, `preview-${name}.png`), await (await page.$('#' + id)).screenshot({ type: 'png' }));
    await page.pdf({ path: path.join(OUT, `${name === 'slips' ? 'entry-slips' : name + '-sign'}.pdf`), width: '8.5in', height: '11in', printBackground: true });
  };

  await out(slips(), 'slips', 'slips');
  await out(giveaway(), 'give', 'giveaway');
  await out(quote(qrSvg), 'quote', 'quote');
  {
    const shot = await (await page.$('#quote .code')).screenshot({ type: 'png' });
    const { data, info } = await sharp(shot).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const got = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    if (!got || got.data !== QR_URL) problems.push(`quote: QR does not decode to ${QR_URL} (got ${got && got.data})`);
    else console.log('  QR decodes ok');
  }
  await browser.close();
  if (!WITH_OFFER) console.log('  Rain-Ready has ended: the quote sign was built without it.');
  if (problems.length) { console.error('\n' + problems.map((p) => '  x ' + p).join('\n')); process.exit(1); }
  console.log(`  wrote ${path.relative(ROOT, OUT)}/entry-slips.pdf, giveaway-sign.pdf, quote-sign.pdf`);
})();
