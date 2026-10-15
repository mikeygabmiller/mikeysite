// Three looks for the Treat Street card, side by side, for Mikey to pick from
// (2026-10-15). These are previews, not print files: the one he picks gets
// built properly in build-treat-street-card.cjs, with the bleed and the checks.
//
//   cd print/tools && node build-treat-street-concepts.cjs
//
// Writes print/treat-street-card/concepts/concepts.png (and one PNG per side).

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'treat-street-card', 'concepts');
const BRAND = path.join(ROOT, 'social', 'brand', 'logo-final');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');
const FS = path.join(__dirname, 'node_modules', '@fontsource');
const fontFace = (name, pkg, weight) =>
  `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${weight}-normal.woff2`))}) format('woff2');font-weight:${weight}}`;

const PHONE = '(425) 600-7897';
const QR_URL = 'https://mikeysdetailing.com/?utm_source=treatstreet&utm_medium=event#booking';
const TRUCK = fileUrl(path.join(BRAND, 'source', 'truck-cutout.png'));
const WORD_DARK = fileUrl(path.join(BRAND, 'transparent-png', 'wordmark-dark.png'));
const STACK_LIGHT = fileUrl(path.join(BRAND, 'transparent-png', 'stacked-light.png'));
const WORD_LIGHT = fileUrl(path.join(BRAND, 'transparent-png', 'wordmark-light.png'));

// Coloring-book outline of the logo truck, made from the cutout's edges.
async function lineArt() {
  const src = path.join(BRAND, 'source', 'truck-cutout.png');
  const flat = await sharp(src).flatten({ background: '#fff' }).greyscale().blur(1.5).toBuffer();
  const e = await sharp(flat).convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] }).threshold(20).toBuffer();
  const png = await sharp(e).blur(2.2).threshold(28).negate().png().toBuffer();
  return 'data:image/png;base64,' + png.toString('base64');
}

const pumpkin = (size, fill = '#F28A1E', stem = '#3a6b2a') => `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
  <path d="M19 9c0-3 1-5 4-6" stroke="${stem}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="12" cy="24" rx="9" ry="12" fill="${fill}"/><ellipse cx="28" cy="24" rx="9" ry="12" fill="${fill}"/>
  <ellipse cx="20" cy="24" rx="9" ry="13" fill="${fill}" stroke="rgba(0,0,0,.18)" stroke-width="1"/></svg>`;
const bat = (w, fill = '#0e0e0f') => `<svg width="${w}" viewBox="0 0 64 28"><path fill="${fill}" d="M32 8c2-4 4-5 4-5l1 4c3-1 5 0 6 2 4-4 12-6 21-2-6 2-8 6-8 10-4-3-8-2-10 1-2-3-5-4-8-2-2 2-4 6-6 10-2-4-4-8-6-10-3-2-6-1-8 2-2-3-6-4-10-1 0-4-2-8-8-10 9-4 17-2 21 2 1-2 3-3 6-2l1-4s2 1 4 5z"/></svg>`;

const css = `
${[400, 500, 600, 700, 800, 900].map(w => fontFace('Outfit', 'outfit', w)).join('')}
${[600, 700].map(w => fontFace('Barlow Condensed', 'barlow-condensed', w)).join('')}
${fontFace('Caveat', 'caveat', 700)}
${fontFace('Permanent Marker', 'permanent-marker', 400)}
${fontFace('Racing Sans One', 'racing-sans-one', 400)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;background:#fff}
.card{position:relative;width:3.5in;height:2in;overflow:hidden}
.abs{position:absolute}
.qr{background:#fff;border-radius:3pt}
.qr svg{display:block;width:100%;height:100%}
`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const qrSvg = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const art = await lineArt();

  const concepts = {
    // A: Halloween all the way. Black and pumpkin orange, bats, the truck lit orange.
    A: {
      title: 'A. Full Halloween',
      front: `<div class="card" style="background:#0e0e0f;color:#fff">
        <div class="abs" style="inset:0;background:radial-gradient(60% 80% at 25% 55%,rgba(242,138,30,.45),transparent 70%)"></div>
        <div class="abs" style="left:.14in;top:.12in;opacity:.9">${bat('0.42in', '#F28A1E')}</div>
        <div class="abs" style="left:1.25in;top:.2in;opacity:.7;transform:scale(.7)">${bat('0.42in', '#F28A1E')}</div>
        <img class="abs" src="${TRUCK}" style="left:.1in;top:.4in;width:1.5in">
        <div class="abs" style="left:.06in;bottom:.06in">${pumpkin('0.3in')}</div>
        <div class="abs" style="left:1.38in;bottom:.06in">${pumpkin('0.26in')}</div>
        <div class="abs" style="left:1.8in;top:.16in;width:1.55in;text-align:center">
          <div style="font-family:'Permanent Marker';font-size:12.5pt;line-height:1;color:#F28A1E">Happy Halloween!</div>
          <img src="${WORD_DARK}" style="width:100%;margin-top:6pt">
          <div style="font-family:'Caveat';font-weight:700;font-size:12pt;line-height:1;margin-top:5pt">Candy in the car seat?<br>I get it out.</div>
          <div style="font-weight:800;font-size:13.5pt;line-height:1;margin-top:6pt;white-space:nowrap">${PHONE}</div>
        </div></div>`,
      back: `<div class="card" style="background:#F28A1E;color:#0e0e0f">
        <div class="abs" style="left:.15in;top:.14in;width:2.05in">
          <div style="font-family:'Barlow Condensed';font-weight:700;font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase">Rain-Ready Full Detail</div>
          <div style="font-weight:900;font-size:13pt;line-height:1.02;margin-top:2pt">Book a Full Detail by Dec 31</div>
          <div style="font-weight:600;font-size:8.5pt;line-height:1.25;margin-top:4pt">Exterior polish, ceramic wax and RainX on the glass: <b>free</b>.<br>Worth $508, from $369.</div>
          <div style="font-family:'Permanent Marker';font-size:10pt;line-height:1;margin-top:6pt">Mention Treat Street!</div>
        </div>
        <div class="abs qr" style="right:.14in;top:.14in;width:1.05in;height:1.05in">${qrSvg}</div>
        <div class="abs" style="right:.14in;top:1.24in;width:1.05in;text-align:center;font-weight:800;font-size:7.5pt;line-height:1.1">See your price<br>in 60 seconds</div>
        <div class="abs" style="left:0;right:0;bottom:0;height:.36in;background:#0e0e0f;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 .15in">
          <span style="font-weight:800;font-size:12pt">${PHONE}</span><span style="font-size:7pt;font-weight:600;opacity:.85">I come to your driveway</span></div>
        <div class="abs" style="right:1.32in;bottom:.4in">${pumpkin('0.3in', '#0e0e0f', '#0e0e0f')}</div>
      </div>`,
    },
    // B: Clean and simple. White, the logo, the phone, a big QR. Almost no words.
    B: {
      title: 'B. Clean and simple',
      front: `<div class="card" style="background:#fff;color:#0e0e0f;border:1px solid #ddd">
        <img class="abs" src="${STACK_LIGHT}" style="left:50%;transform:translateX(-50%);top:.14in;height:1.08in">
        <div class="abs" style="left:0;right:0;top:1.3in;text-align:center">
          <div style="font-weight:800;font-size:16pt;line-height:1">${PHONE}</div>
          <div style="font-weight:600;font-size:7.5pt;letter-spacing:.16em;text-transform:uppercase;color:#E31924;margin-top:4pt">I come to your driveway.</div>
        </div></div>`,
      back: `<div class="card" style="background:#fff;color:#0e0e0f;border:1px solid #ddd">
        <div class="abs qr" style="left:.14in;top:.14in;width:1.25in;height:1.25in;box-shadow:0 0 0 .6pt #ccc">${qrSvg}</div>
        <div class="abs" style="left:1.55in;top:.2in;width:1.8in">
          <div style="font-weight:900;font-size:15pt;line-height:1">See your price<br>in 60 seconds.</div>
          <div style="font-weight:500;font-size:8pt;line-height:1.3;margin-top:6pt;color:#444">Scan it, pick your car, done.<br>No deposit. You pay after.</div>
        </div>
        <div class="abs" style="left:.14in;right:.14in;bottom:.12in;border-top:1pt solid #E31924;padding-top:4pt;font-size:7.5pt;font-weight:600;line-height:1.25">
          <span style="color:#E31924;font-weight:800">Mention Treat Street:</span> polish, ceramic wax and RainX free on a Full Detail booked by Dec 31.</div>
      </div>`,
    },
    // C: A card kids keep. The back is the truck to color; the front is for the parents.
    C: {
      title: 'C. Coloring card for the kids',
      front: `<div class="card" style="background:#0e0e0f;color:#fff">
        <img class="abs" src="${TRUCK}" style="left:.12in;top:.22in;width:1.5in">
        <div class="abs" style="left:1.78in;top:.22in;width:1.6in;text-align:center">
          <img src="${WORD_DARK}" style="width:100%">
          <div style="font-weight:700;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;color:#D2AE5E;margin-top:8pt">Text or call</div>
          <div style="font-weight:800;font-size:14pt;line-height:1;margin-top:2pt;white-space:nowrap">${PHONE}</div>
          <div style="font-weight:600;font-size:7.5pt;color:rgba(255,255,255,.82);margin-top:4pt">mikeysdetailing.com</div>
          <div style="font-family:'Caveat';font-weight:700;font-size:11pt;color:#F28A1E;margin-top:6pt;line-height:1">Thanks for stopping by!</div>
        </div></div>`,
      back: `<div class="card" style="background:#fff;color:#0e0e0f;border:1px solid #ddd">
        <div class="abs" style="left:0;right:0;top:.08in;text-align:center;font-family:'Permanent Marker';font-size:13pt;line-height:1">Color Mikey's truck!</div>
        <img class="abs" src="${art}" style="left:50%;transform:translateX(-50%);top:.36in;height:1.42in">
        <div class="abs" style="left:.1in;bottom:.08in">${pumpkin('0.3in')}</div>
        <div class="abs" style="right:.1in;bottom:.08in">${pumpkin('0.3in')}</div>
      </div>`,
    },
  };

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 4, viewport: { width: 400, height: 240 } });
  const tmp = path.join(OUT, '.render.html');
  const tiles = [];
  for (const [k, c] of Object.entries(concepts)) {
    for (const side of ['front', 'back']) {
      fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${c[side]}</body></html>`);
      await page.goto(fileUrl(tmp));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
      const f = path.join(OUT, `${k}-${side}.png`);
      await (await page.$('.card')).screenshot({ path: f });
      tiles.push({ k, side, f, title: c.title });
    }
  }
  await browser.close();
  fs.unlinkSync(tmp);

  // One sheet: a row per concept, front and back, rounded corners, a label.
  const TW = 820, TH = Math.round(TW * 2 / 3.5), GAP = 50, LAB = 70, PAD = 50;
  const rows = Object.keys(concepts).length;
  const sheetW = PAD * 2 + TW * 2 + GAP, sheetH = PAD + rows * (LAB + TH + GAP);
  const comps = [];
  let r = 0;
  for (const [k, c] of Object.entries(concepts)) {
    const y = PAD + r * (LAB + TH + GAP);
    comps.push({ input: Buffer.from(`<svg width="${sheetW}" height="${LAB}"><text x="${PAD}" y="48" font-family="Arial, sans-serif" font-weight="700" font-size="40" fill="#222">${c.title}</text><text x="${sheetW - PAD}" y="48" text-anchor="end" font-family="Arial, sans-serif" font-size="28" fill="#555">front / back</text></svg>`), left: 0, top: y });
    for (const [i, side] of ['front', 'back'].entries()) {
      const t = tiles.find(t => t.k === k && t.side === side);
      const mask = Buffer.from(`<svg width="${TW}" height="${TH}"><rect width="${TW}" height="${TH}" rx="12" fill="#fff"/></svg>`);
      const img = await sharp(t.f).resize(TW, TH).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
      comps.push({ input: img, left: PAD + i * (TW + GAP), top: y + LAB });
    }
    r++;
  }
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#d6d0c6' } }).composite(comps).png().toFile(path.join(OUT, 'concepts.png'));
  console.log('wrote', path.relative(ROOT, path.join(OUT, 'concepts.png')));
})().catch(e => { console.error(e); process.exit(1); });
