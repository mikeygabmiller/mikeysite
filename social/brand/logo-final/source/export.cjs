const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const IN = path.resolve('ready/out'), DST = process.argv[2];
const sizes = JSON.parse(fs.readFileSync(IN + '/sizes.json'));
const dirs = ['print-pdf', 'transparent-png', 'jpg', 'svg', 'web'];
for (const d of dirs) fs.mkdirSync(`${DST}/${d}`, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 4000, height: 4000 } });
  async function png(svgFile, out, width, { transparent = true, type = 'png' } = {}) {
    const svgText = fs.readFileSync(`${IN}/${svgFile}`, 'utf8');
    await p.setContent(`<body style="margin:0;background:transparent"><div id="w" style="width:${width}px;display:inline-block;line-height:0">${svgText.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div></body>`);
    await p.waitForTimeout(150);
    await p.locator('#w').screenshot({ path: out, omitBackground: transparent, type, ...(type === 'jpeg' ? { quality: 92 } : {}) });
  }
  async function pdf(svgFile, out) {
    const svgText = fs.readFileSync(`${IN}/${svgFile}`, 'utf8');
    const m = svgText.match(/width="(\d+)" height="(\d+)"/), w = +m[1], h = +m[2];
    await p.setContent(`<html><head><style>@page{size:${w}px ${h}px;margin:0}html,body{margin:0}</style></head><body>${svgText}</body></html>`);
    await p.pdf({ path: out, width: w + 'px', height: h + 'px', printBackground: true, pageRanges: '1' });
  }
  for (const name of Object.keys(sizes)) {
    fs.copyFileSync(`${IN}/${name}.svg`, `${DST}/svg/${name}.svg`);
    const w = name.startsWith('horizontal') ? 3000 : 2400;
    await png(`${name}.svg`, `${DST}/transparent-png/${name}.png`, w);
    await png(`${name}-bg.svg`, `${DST}/jpg/${name}.jpg`, w, { transparent: false, type: 'jpeg' });
    await pdf(`${name}.svg`, `${DST}/print-pdf/${name}.pdf`);
  }
  // web and social sizes
  await png('profile-stacked.svg', `${DST}/web/profile-picture-logo-1080.png`, 1080, { transparent: false });
  await png('profile-truck.svg', `${DST}/web/profile-picture-truck-1080.png`, 1080, { transparent: false });
  await png('profile-truck.svg', `${DST}/web/apple-touch-icon-180.png`, 180, { transparent: false });
  await png('profile-truck.svg', `${DST}/web/icon-512.png`, 512, { transparent: false });
  await png('icon.svg', `${DST}/web/favicon-32.png`, 32);
  await png('horizontal-dark.svg', `${DST}/web/website-header-600.png`, 600);
  await png('horizontal-light.svg', `${DST}/web/email-signature-400.png`, 400);
  await b.close();
})();
