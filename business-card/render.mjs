import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const browser = await chromium.launch({ executablePath: exe });

// ~600 DPI: base 1010x638 CSS px (300dpi) at deviceScaleFactor 2
const page = await browser.newPage({
  viewport: { width: 1010, height: 638 },
  deviceScaleFactor: 2,
});

await page.goto('file://' + path.join(__dirname, 'card.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

// 1) Transparent print-ready PNG (this is what gets uploaded to Temu)
await page.screenshot({
  path: path.join(__dirname, 'mikeys-card-PRINT-transparent.png'),
  omitBackground: true,
});

// 2) Realistic clear-acrylic previews. The card is transparent and the black
//    ink only reads against a lighter background, so show it on both a light
//    surface (true to how it usually looks in hand) and a dark one.
async function preview(bg, file, ring) {
  await page.evaluate((args) => {
    document.body.style.background = args.bg;
    const c = document.querySelector('.card');
    c.style.outline = '2px solid ' + args.ring;
    c.style.borderRadius = '26px';
    c.style.boxShadow = '0 30px 70px rgba(0,0,0,0.45)';
  }, { bg, ring });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(__dirname, file), omitBackground: false });
}

await preview(
  'radial-gradient(130% 130% at 30% 15%, #f3efe9 0%, #d9cfc2 60%, #b9ab98 100%)',
  'mikeys-card-preview-light.png',
  'rgba(0,0,0,0.14)'
);
await preview(
  'radial-gradient(120% 120% at 30% 20%, #2a2a2a 0%, #121212 55%, #050505 100%)',
  'mikeys-card-preview-dark.png',
  'rgba(255,255,255,0.18)'
);

await browser.close();
console.log('done');
