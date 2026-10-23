// The Treat Street drawing, LEGO version (Mikey, 2026-10-23: a LEGO set from
// Fred Meyer instead of the free interior detail, and one sign-up sheet with
// many lines instead of a slip per person).
//
//   cd print/tools && npm run treat-lego
//
// Output lands in print/treat-street/lego/:
//   entry-sheet.pdf   black and white, 18 numbered lines a page, for a clipboard
//   lego-sign.pdf     "Win a LEGO set", colour, for the left wing under the quote sign
//   preview-*.png
//
// Same rules as the slips it replaces: free to enter, no purchase (a
// promotional drawing, not a raffle, which Washington leaves to licensed
// nonprofits), and a text afterwards only to a line with its box ticked
// (Washington's Commercial Electronic Mail Act covers texts). The prize has no
// stated value because the set isn't bought yet. "LEGO" is the LEGO Group's
// mark: the word only, in capitals before "set", never their logo.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'treat-street', 'lego');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const fileUrl = (p) => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

const PHONE = '(425) 600-7897';
const DRAW = 'Monday, Oct 26';
const LINES = 18;
const RULES = `Free to enter, no purchase needed. One entry per household; a grown-up (18+) fills it in. I draw one winner ${DRAW} and text them. No reply in 48 hours, I draw again. Mikey's Mobile Detailing, ${PHONE}. LEGO is a trademark of the LEGO Group, which doesn't sponsor this drawing.`;
const CONSENT = 'Yes, Mikey can text me deals. Reply STOP anytime.';

const RED = '#E31924', INK = '#111114';
const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;
const logo = (k) => fileUrl(path.join(BRAND, 'transparent-png', `${k}.png`));

const CSS = `
${fontFace('Barlow Condensed', 'barlow-condensed', 800)}
${fontFace('Inter', 'inter', 600)}
${fontFace('Inter', 'inter', 800)}
@page{size:8.5in 11in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff;color:${INK};font-family:Inter}
.page{position:relative;width:8.5in;height:11in;overflow:hidden}
.safe{position:absolute;left:.5in;right:.5in;top:.45in;bottom:.45in;display:flex;flex-direction:column}

.sheet .head{display:flex;align-items:center;gap:.25in}
.sheet .head img{height:.85in;filter:grayscale(1) contrast(1.2)}
.sheet h1{font:800 .55in/1 'Barlow Condensed';text-transform:uppercase;flex:1;white-space:nowrap}
.sheet .no{font:800 11pt Inter;white-space:nowrap}
.sheet .how{font:600 10pt/1.35 Inter;margin-top:.12in}
table{width:100%;border-collapse:collapse;margin-top:.14in}
th{font:800 8.5pt/1.15 Inter;text-transform:uppercase;letter-spacing:.04em;text-align:left;padding:.05in .06in;border-bottom:.025in solid #000}
td{height:.39in;border-bottom:.01in solid #000;font:800 10pt Inter;padding:0 .06in;vertical-align:middle}
td.n{width:.32in;text-align:right;color:#000}
th.ok,td.ok{width:1.05in;text-align:center}
.box{display:inline-block;width:.2in;height:.2in;border:.02in solid #000}
.sheet .rules{font:600 7.5pt/1.35 Inter;margin-top:auto;padding-top:.1in}

.sign{text-align:center}
.sign .safe{align-items:center;justify-content:space-between;top:.6in;bottom:.6in}
.sign img{width:5.2in}
.sign h1{font:800 1.75in/.9 'Barlow Condensed';text-transform:uppercase}
.sign h1 em{font-style:normal;color:${RED};display:block}
.sign .steps{list-style:none;text-align:left;font:800 .3in/1.25 Inter}
.sign .steps li{display:flex;align-items:center;gap:.22in;margin:.16in 0}
.sign .steps b{flex:none;width:.55in;height:.55in;border-radius:50%;background:${RED};color:#fff;display:flex;align-items:center;justify-content:center;font:800 .3in Inter}
.sign .rules{font:600 9pt/1.4 Inter;color:#333;max-width:7in}
`;

const sheet = `<div class="page sheet"><div class="safe">
  <div class="head"><img src="${logo('horizontal-light')}"><h1>Win a LEGO set</h1><div class="no">Sheet # _____</div></div>
  <div class="how">One line per household. I draw one line ${DRAW} and text the winner. Tick the last box only if it's OK for me to text you deals.</div>
  <table><tr><th></th><th style="width:2.3in">Name</th><th style="width:1.75in">Phone</th><th>Town</th><th class="ok">${CONSENT.replace('. Reply', '.<br>Reply')}</th></tr>
  ${Array.from({ length: LINES }, (_, i) => `<tr><td class="n">${i + 1}</td><td></td><td></td><td></td><td class="ok"><span class="box"></span></td></tr>`).join('')}</table>
  <div class="rules">${RULES}</div></div></div>`;

const sign = `<div class="page sign"><div class="safe">
  <img src="${logo('horizontal-light')}">
  <h1>Win a<em>LEGO set</em></h1>
  <ol class="steps"><li><b>1</b>A grown-up writes your name on my sheet.</li><li><b>2</b>One line per household.</li><li><b>3</b>I draw ${DRAW} and text the winner.</li></ol>
  <div class="rules">${RULES}</div></div></div>`;

const doc = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
  const problems = [];
  for (const [name, body] of [['entry-sheet', sheet], ['lego-sign', sign]]) {
    const tmp = path.join(OUT, `.render-${name}.html`);
    fs.writeFileSync(tmp, doc(body));
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    const text = await page.evaluate(() => document.body.innerText);
    for (const [re, what] of [[/—|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured'], [/\bwe\b|\bour\b/i, 'business "we"'],
      [/raffle|ticket|purchase required|\$\d/i, 'anything that reads like a paid raffle or a prize value'], [/interior detail/i, 'the old prize']])
      if (re.test(text)) problems.push(`${name}: copy contains ${what}: "${text.match(re)[0]}"`);
    const spill = await page.evaluate(() => { const s = document.querySelector('.safe'); return s.scrollHeight - s.clientHeight; });
    if (spill > 1) problems.push(`${name}: spills ${spill}px past the 0.45 in printer margin`);
    const tiny = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((n) => n.childNodes.length && [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())).map((n) => parseFloat(getComputedStyle(n).fontSize) * 0.75).filter((pt) => pt < 7));
    if (tiny.length) problems.push(`${name}: type under 7 pt`);
    if (!problems.length) {
      await page.pdf({ path: path.join(OUT, `${name}.pdf`), width: '8.5in', height: '11in', printBackground: true });
      await page.screenshot({ path: path.join(OUT, `preview-${name}.png`) });
    }
    fs.unlinkSync(tmp);
  }
  await browser.close();
  if (problems.length) { console.error(problems.map((p) => '  x ' + p).join('\n')); process.exit(1); }
  console.log(`  wrote ${path.relative(ROOT, OUT)}/: entry-sheet.pdf (${LINES} lines, black and white), lego-sign.pdf, previews`);
})();
