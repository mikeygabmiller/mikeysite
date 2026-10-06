// Renders a sheet of Avery 5821 labels (2.5 x 4 in, 8 to a letter sheet):
// the logo, the phone number and the website on every label.
//
//   cd print/tools && npm install && npm run labels
//
// Output lands in print/avery-labels/: print-files/ for whoever prints it
// (the sheet, a plain-paper test sheet, one label on its own) and preview.png
// for looking at. Read print/avery-labels/README.md before changing copy:
// like the card and the decal, every line here is one more copy of the facts
// table in CLAUDE.md, and it carries no prices, no offer and no review count,
// because a box of 80 labels outlives all three.
//
// The sheet geometry is Avery's own. It was measured from the template Avery
// publishes for 5821 (avery.com/templates/5821, PDF "U-1496-01", 2026-10-06):
// two columns of four, no gap between rows, a 1/6 in gap between columns.
// Label backgrounds stay white, because a shop printer can land the page
// 1/16 in or more off; with no colour to the edge, a drift shows nothing.

const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'avery-labels');
const FILES = path.join(OUT, 'print-files');
// DARK=1 renders the black version: white type, the logo made for dark
// backgrounds, black printed past every label edge (see BLEED).
const DARK = process.env.DARK === '1';
const LOGO = path.join(ROOT, 'social', 'brand', 'logo-final', 'transparent-png', DARK ? 'horizontal-dark.png' : 'horizontal-light.png');
const TAG = DARK ? '-BLACK' : '';
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');

// ---- The facts. Both are in the CLAUDE.md facts table. ----
const PHONE = '(425) 600-7897';
const SITE = 'mikeysdetailing.com';

// ---- Avery 5821, inches. y runs down from the top of the sheet. ----
const PAGE_W = 8.5, PAGE_H = 11;
const LW = 4, LH = 2.5, RADIUS = 0.125;
const COLS = [1 / 6, 1 / 6 + LW + 1 / 6];        // left edges
const ROWS = [0.5, 3.0, 5.5, 8.0];               // top edges
// Type and logo stay this far inside each label, so a page that feeds 1/8 in
// off still keeps everything on its own label.
const SAFE = 0.18;
// The black version fills the whole block of labels and runs this far past it
// at top and bottom, and to the paper's edge at the sides, so a page that
// lands off still has black at every label edge. Rows touch and the column gap
// and margins are waste, so the overrun lands on nothing that's kept.
const BLEED = 0.125;

const LABELS = ROWS.flatMap(y => COLS.map(x => ({ x, y })));

(async () => {
  fs.mkdirSync(FILES, { recursive: true });
  const problems = [];

  // The logo with its empty margin trimmed, so the layout below is the logo's
  // real size. The source is 3000 px wide: about 800 dpi at this size.
  const logo = await sharp(LOGO).trim().png().toBuffer();
  const logoUrl = 'data:image/png;base64,' + logo.toString('base64');

  const FS = path.join(__dirname, 'node_modules', '@fontsource');
  const fontFace = (name, pkg, weight) =>
    `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

  const css = `
${[600, 800].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${fontFace('Barlow Condensed', 'barlow-condensed', 700)}
@page{size:${PAGE_W}in ${PAGE_H}in;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:#fff}
.fill{position:absolute;left:0;width:${PAGE_W}in;top:${ROWS[0] - BLEED}in;height:${ROWS.length * LH + 2 * BLEED}in;background:#000}
body{font-family:'Outfit',sans-serif;color:${DARK ? '#fff' : '#111'};-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.sheet{position:relative;width:${PAGE_W}in;height:${PAGE_H}in;overflow:hidden;background:#fff}
.label{position:absolute;width:${LW}in;height:${LH}in;border-radius:${RADIUS}in;
  display:flex;flex-direction:column;align-items:center;justify-content:center;padding:${SAFE}in}
.outline .label{box-shadow:0 0 0 0.75pt ${DARK ? '#EC008C' : '#9a9a9a'}}
.logo{display:block;width:3.4in;height:auto}
.k{font-family:'Barlow Condensed';font-weight:700;font-size:9pt;letter-spacing:.2em;text-transform:uppercase;
  color:#E31924;line-height:1;margin-top:0.13in}
.phone{font-weight:800;font-size:27pt;letter-spacing:-.01em;line-height:1;margin-top:0.035in;white-space:nowrap}
.site{font-weight:600;font-size:13pt;letter-spacing:.01em;line-height:1;margin-top:0.07in;color:${DARK ? '#e8e8e8' : '#222'};white-space:nowrap}
.note{position:absolute;left:${COLS[0]}in;top:0.16in;font-family:'Outfit';font-weight:600;font-size:9pt;color:#555}
`;

  const label = ({ x, y }) => `<div class="label" style="left:${x}in;top:${y}in">
  <img class="logo" src="${logoUrl}" alt="">
  <div class="k">Call or text</div>
  <div class="phone">${PHONE}</div>
  <div class="site">${SITE}</div>
</div>`;

  const sheetHtml = (outline, note = '') => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="sheet${outline ? ' outline' : ''}">${DARK ? '<div class="fill"></div>' : ''}${note ? `<div class="note">${note}</div>` : ''}${LABELS.map(label).join('\n')}</div></body></html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 300 / 96, viewport: { width: PAGE_W * 96, height: PAGE_H * 96 } });
  const tmp = path.join(OUT, '.render.html');
  const load = async html => {
    fs.writeFileSync(tmp, html);
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
  };

  // ---- The sheet that goes on the labels. ----
  await load(sheetHtml(false));

  // Copy rules, the same list the card and the decal enforce.
  const text = await page.evaluate(() => document.body.innerText);
  const banned = [[/\u2014|&mdash;/, 'an em dash'], [/insur|licens/i, 'licensed/insured (he is neither)'],
    [/lynnwood|edmonds/i, 'a town Mikey does not serve'], [/\$\d/, 'a price (80 labels cannot follow a price change)'],
    [/\bwe\b|\bour\b/i, 'business "we" (it is one guy: "I")'], [/free\b|rain-ready|offer/i, 'an offer'],
    [/\b41\b/, 'the review count (it will grow; the labels will not)'], [/232-1355/, 'the old phone number']];
  for (const [re, what] of banned) if (re.test(text)) problems.push(`copy contains ${what}: "${text.match(re)[0]}"`);
  const phones = text.match(/\(\d{3}\) \d{3}-\d{4}/g) || [];
  if (phones.length !== LABELS.length || phones.some(p => p !== PHONE)) problems.push(`expected ${PHONE} once on each of ${LABELS.length} labels, found ${JSON.stringify(phones)}`);
  if ((text.match(new RegExp(SITE.replace('.', '\\.'), 'g')) || []).length !== LABELS.length) problems.push(`expected ${SITE} on every label`);

  // Everything on a label sits inside that label's safe area, and nothing is
  // squeezed: the labels themselves land where Avery's template puts them.
  const boxes = await page.evaluate(() => [...document.querySelectorAll('.label')].map(l => {
    const r = l.getBoundingClientRect();
    return { l: { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom },
      kids: [...l.children].map(k => { const q = k.getBoundingClientRect(); return { c: k.className, x0: q.left, y0: q.top, x1: q.right, y1: q.bottom }; }) };
  }));
  boxes.forEach((b, i) => {
    const want = LABELS[i], inch = v => v / 96;
    if (Math.abs(inch(b.l.x0) - want.x) > 0.002 || Math.abs(inch(b.l.y0) - want.y) > 0.002 ||
        Math.abs(inch(b.l.x1 - b.l.x0) - LW) > 0.002 || Math.abs(inch(b.l.y1 - b.l.y0) - LH) > 0.002)
      problems.push(`label ${i + 1} is not where Avery 5821 puts it`);
    for (const k of b.kids) {
      const gap = Math.min(inch(k.x0 - b.l.x0), inch(b.l.x1 - k.x1), inch(k.y0 - b.l.y0), inch(b.l.y1 - k.y1));
      if (gap < SAFE - 0.005) problems.push(`label ${i + 1}: "${k.c}" comes within ${gap.toFixed(3)} in of the label edge (safe is ${SAFE})`);
    }
  });
  if (process.env.DEBUG_BOXES) for (const k of boxes[0].kids)
    console.log(k.c, ((k.x0 - boxes[0].l.x0) / 96).toFixed(3), ((k.y0 - boxes[0].l.y0) / 96).toFixed(3), ((k.x1 - k.x0) / 96).toFixed(3), ((k.y1 - k.y0) / 96).toFixed(3));

  const PRINT = path.join(FILES, `avery-5821${TAG}-PRINT-THIS.pdf`);
  await page.pdf({ path: PRINT, width: `${PAGE_W}in`, height: `${PAGE_H}in`, printBackground: true, preferCSSPageSize: true });

  // One label on its own, 4 x 2.5 in at 300 dpi, for Avery Design & Print
  // (avery.com/templates/5821) if the shop would rather fill the sheet there.
  const one = await (await page.$('.label')).screenshot({ type: 'png', omitBackground: false });
  await sharp(one).resize(LW * 300, LH * 300).png().toFile(path.join(FILES, `one-label${TAG}-4x2.5in-300dpi.png`));

  // ---- Plain-paper test: same sheet with the label outlines drawn on. ----
  await load(sheetHtml(true, 'TEST SHEET: print on plain paper at Actual size (100%), lay it on a label sheet and hold both up to a light. The words should sit inside the outlines.'));
  await page.pdf({ path: path.join(FILES, `avery-5821${TAG}-TEST-on-plain-paper.pdf`), width: `${PAGE_W}in`, height: `${PAGE_H}in`, printBackground: true, preferCSSPageSize: true });
  const shot = await page.screenshot({ type: 'png', fullPage: false });
  await sharp(shot).resize({ width: 1700 }).png().toFile(path.join(OUT, `preview${TAG.toLowerCase()}.png`));

  await browser.close();
  fs.unlinkSync(tmp);

  // The PDF has to be one letter page, or "Actual size" still lands wrong.
  const pdf = fs.readFileSync(PRINT, 'latin1');
  const boxesIn = [...pdf.matchAll(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/g)];
  const pages = (pdf.match(/\/Type\s*\/Page\b/g) || []).length;
  if (pages !== 1) problems.push(`the print PDF has ${pages} pages, not 1`);
  if (!boxesIn.length || boxesIn.some(m => Math.abs(m[3] - 612) > 0.5 || Math.abs(m[4] - 792) > 0.5)) problems.push('the print PDF is not 8.5 x 11 in');

  console.log('wrote', path.relative(ROOT, OUT) + `/preview${TAG.toLowerCase()}.png, print-files/*${TAG}*`);
  if (problems.length) { problems.forEach(p => console.error('  FAIL', p)); process.exitCode = 1; }
  else console.log(`  checks ok: copy rules, ${LABELS.length} labels where Avery 5821 puts them, everything ${SAFE} in inside each label, one letter page`);
})().catch(e => { console.error(e); process.exit(1); });
