import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1010, height: 638 }, deviceScaleFactor: 2 });

const lightBg = 'radial-gradient(130% 130% at 30% 15%, #f3efe9 0%, #d9cfc2 60%, #b9ab98 100%)';

for (const v of ['a', 'b', 'c']) {
  await page.goto('file://' + path.join(__dirname, `card-${v}.html`), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  // transparent print-ready
  await page.screenshot({ path: path.join(__dirname, `mikeys-${v}-PRINT-transparent.png`), omitBackground: true });

  // light preview
  await page.evaluate((bg) => {
    document.body.style.background = bg;
    const c = document.querySelector('.card');
    c.style.outline = '2px solid rgba(0,0,0,0.14)';
    c.style.borderRadius = '26px';
    c.style.boxShadow = '0 30px 70px rgba(0,0,0,0.45)';
  }, lightBg);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(__dirname, `mikeys-${v}-preview-light.png`), omitBackground: false });
}

await browser.close();
console.log('done');
