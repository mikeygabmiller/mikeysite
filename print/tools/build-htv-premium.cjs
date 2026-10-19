// Three premium takes on the Hometown Values quarter page (Mikey, 2026-10-14:
// the seven concepts "look cheap / amateur"). What made them cheap: every
// fact crammed into every ad, gimmicks, and phone-snapshot photos. These follow
// the rules a print designer would: one strong photo, one headline, two
// typefaces, one accent colour, a fixed margin and room to breathe. The
// review sentence is cut (the rating stays); everything the facts table and
// the ad README require is still on each one, just smaller and quieter.
//
//   cd print/tools && npm run htv-premium
//
// Writes print/hometown-values/premium/p1..p3.png and all-three.jpg. For
// choosing only: the pick moves into build-htv-ad.cjs with its full checks.

const { chromium } = require('playwright');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'hometown-values', 'premium');
const SOCIAL = path.join(ROOT, 'social');
const fileUrl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F/, '/');
const photo = n => fileUrl(path.join(SOCIAL, 'photos', n));

// ---- The facts (CLAUDE.md facts table) ----
const PHONE = '(425) 600-7897';
const REVIEWS = 40; // what the Google profile shows (Windsor, 2026-10-19)
const QR_URL = 'https://mikeysdetailing.com/?utm_source=hometownvalues&utm_medium=mail#booking';
const REVIEW = 'Mikey showed up on time, did exactly what he said, and charged exactly what he quoted. That kind of service is really rare these days.';
const TERMS = 'on any Full Detail booked by Dec 31, 2026. Mention Hometown Values.';
const W = 4.0625, H = 4.75, SAFE = 0.14, MIN_PT = 6.5;

const FS = path.join(__dirname, 'node_modules', '@fontsource');
const face = (name, pkg, w) => `@font-face{font-family:'${name}';src:url(${fileUrl(path.join(FS, pkg, 'files', `${pkg}-latin-${w}-normal.woff2`))}) format('woff2');font-weight:${w}}`;
const FONTS = [
  ...[400, 500, 600, 700, 800, 900].map(w => face('Outfit', 'outfit', w)),
  ...[600, 700, 800].map(w => face('Barlow Condensed', 'barlow-condensed', w)),
  ...[600, 700, 800].map(w => face('Fira XC', 'fira-sans-extra-condensed', w)),
  face('Caveat', 'caveat', 700), face('Anton', 'anton', 400), face('Marker', 'permanent-marker', 400),
  face('Racing', 'racing-sans-one', 400), ...[400, 700].map(w => face('Arimo', 'arimo', w)),
].join('');
const logo = dark => fs.readFileSync(path.join(SOCIAL, 'brand', dark ? 'logo.svg' : 'logo-light.svg'), 'utf8').replace('<svg ', '<svg class="logo" ');
const icon = () => fs.readFileSync(path.join(SOCIAL, 'brand', 'logo-icon.svg'), 'utf8').replace('<svg ', '<svg class="icon" ');
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
const stars = (n = 5) => `<span class="stars">${STAR.repeat(n)}</span>`;

const BASE = `
${FONTS}
@page{size:${W}in ${H}in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.ad{position:relative;width:${W}in;height:${H}in;overflow:hidden}
.in{position:absolute;inset:${SAFE}in;display:flex;flex-direction:column;justify-content:space-between}
.stars{display:inline-flex;gap:.5pt;vertical-align:-1pt}
.stars svg{width:7pt;height:7pt;fill:#E8A317}
.qr{flex:none;background:#fff;padding:.035in;border-radius:2pt}
.qr svg{display:block;width:1in;height:1in}
.ph{position:relative;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
`;

const M = 0.18; // one margin for everything, wider than the 0.14 in safe line
const COUPON = 'Free ceramic wax, RainX and anti-fog with a Full Detail booked by Dec 31, 2026. Mention Hometown Values.';
const FINE = "No travel fee. You provide an outdoor spigot and outlet: that's how I keep prices down.";

// ---------------------------------------------------------------------------
// 1. NIGHT. Dark and quiet, like a car brand's ad. One dramatic photo that
// fades into black, white type, a thin gold rule. Nothing shouts.
const p1 = qr => ({
  name: 'p1-night', title: 'Night', designer: 'Premium dark', bg: 'black, red RAV4',
  css: `
.ad{background:#0b0b0c;color:#fff}
.hero{position:absolute;left:0;right:0;top:0;height:2.05in}
.hero img{object-position:50% 58%}
.hero:after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,11,12,.55) 0,rgba(11,11,12,0) 30%,rgba(11,11,12,0) 55%,#0b0b0c 100%)}
.hero .logo{position:absolute;left:${M}in;top:${M}in;width:1.15in;height:auto;z-index:1}
.body{position:absolute;left:${M}in;right:${M}in;top:1.86in;bottom:${M}in;display:flex;flex-direction:column;justify-content:space-between}
.k{font-family:'Barlow Condensed';font-weight:600;font-size:8pt;letter-spacing:.28em;text-transform:uppercase;color:#D2AE5E}
h1{font-family:'Barlow Condensed';font-weight:700;font-size:21pt;line-height:.95;text-transform:uppercase;letter-spacing:.01em;margin-top:2pt}
.rule{height:.6pt;background:#D2AE5E;opacity:.7}
.pr{display:flex;align-items:baseline;justify-content:space-between}
.pr .f{font-size:8pt;color:#bdbdbd}
.pr .f b{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:21pt;color:#fff;letter-spacing:.01em;line-height:1}
.pr .o{text-align:right;font-size:7.5pt;color:#bdbdbd;line-height:1.5}
.pr .o b{color:#fff;font-weight:600}
.cp{border:.8pt solid #D2AE5E;padding:3.5pt 6pt;font-size:6.8pt;line-height:1.35;color:#e9e3d3}
.bot{display:flex;gap:.11in;align-items:center}
.bot .p{font-family:'Barlow Condensed';font-weight:700;font-size:20pt;letter-spacing:.02em;line-height:1}
.bot .t{font-size:6.5pt;line-height:1.4;color:#a9a9a9;margin-top:2pt}
.bot .r{font-size:6.5pt;color:#fff;margin-bottom:2pt}
`,
  html: `<section class="ad">
  <div class="ph hero"><img src="${photo('rav4-red.jpg')}">${logo(true)}</div>
  <div class="body">
    <div><div class="k">Lake Stevens</div><h1>Detailed in<br>your driveway.</h1></div>
    <div class="rule"></div>
    <div class="pr"><div class="f">Full detail from<b>$369</b></div><div class="o">Interior from <b>$249</b><br>Exterior from <b>$199</b></div></div>
    <div class="cp">${COUPON}</div>
    <div class="bot"><div class="qr">${qr}</div><div><div class="r">5.0 ${stars()} ${REVIEWS} Google reviews</div><div class="p">${PHONE}</div>
      <div class="t">Call or text Mikey, or scan for your exact price in 60 seconds. ${FINE}</div></div></div>
  </div>
</section>`,
});

// ---------------------------------------------------------------------------
// 2. GALLERY. White and editorial, like a magazine spread. A clean white SUV
// in a driveway, black type, hairline rules, one red accent.
const p2 = qr => ({
  name: 'p2-gallery', title: 'Gallery', designer: 'Clean editorial', bg: 'white, white Escalade',
  css: `
.ad{background:#fff;color:#111;border:.8pt solid #111}
.hero{position:absolute;left:0;right:0;top:0;height:1.6in}
.hero img{object-position:50% 52%}
.hero .chip{position:absolute;left:${M}in;top:${M}in;background:#fff;padding:3pt 5pt;border-radius:2pt}
.hero .chip .logo{width:1in;height:auto;display:block}
.body{position:absolute;left:${M}in;right:${M}in;top:1.72in;bottom:${M}in;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;justify-content:space-between;align-items:flex-end}
.k{font-family:'Barlow Condensed';font-weight:700;font-size:8pt;letter-spacing:.26em;text-transform:uppercase;color:#E31924}
h1{font-family:'Barlow Condensed';font-weight:700;font-size:22pt;line-height:.95;text-transform:uppercase;margin-top:2pt}
.top .logo{width:1.05in;height:auto;display:block}
.pr{display:flex;border-top:.6pt solid #111;border-bottom:.6pt solid #111}
.pr div{flex:1;padding:4pt 0 3pt;text-align:center;line-height:1}
.pr div+div{border-left:.6pt solid #d0d0d0}
.pr span{display:block;font-size:6.5pt;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#666}
.pr b{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:17pt;margin-top:2pt}
.pr .f b{color:#E31924}
.cp{font-size:6.8pt;line-height:1.35;color:#333;padding-left:6pt;border-left:2pt solid #E31924}
.bot{display:flex;gap:.11in;align-items:center}
.bot .qr{border:.8pt solid #111}
.bot .p{font-family:'Barlow Condensed';font-weight:700;font-size:20pt;letter-spacing:.02em;line-height:1}
.bot .t{font-size:6.5pt;line-height:1.4;color:#555;margin-top:2pt}
.bot .r{font-size:6.5pt;color:#111;font-weight:600;margin-bottom:2pt}
`,
  html: `<section class="ad">
  <div class="ph hero"><img src="${photo('escalade-white.jpg')}"><div class="chip">${logo(false)}</div></div>
  <div class="body">
    <div class="top"><div><div class="k">Lake Stevens</div><h1>Mobile detailing<br>at your home or work.</h1></div></div>
    <div class="pr"><div class="f"><span>Full detail</span><b>$369</b></div><div><span>Interior</span><b>$249</b></div><div><span>Exterior</span><b>$199</b></div></div>
    <div class="cp">${COUPON}</div>
    <div class="bot"><div class="qr">${qr}</div><div><div class="r">5.0 ${stars()} ${REVIEWS} Google reviews</div><div class="p">${PHONE}</div>
      <div class="t">Call or text, or scan for your exact price in 60 seconds. ${FINE}</div></div></div>
  </div>
</section>`,
});

// ---------------------------------------------------------------------------
// 3. PROOF. The back seat, shown big and clean on charcoal: a thin divider,
// small labels, and Mikey's own line from the site as the headline.
const p3 = qr => ({
  name: 'p3-proof', title: 'Proof', designer: 'Before and after, done clean', bg: 'charcoal, back seat',
  css: `
.ad{background:#1a1b1e;color:#fff}
.hero{position:absolute;left:0;right:0;top:0;height:1.8in;display:flex;gap:1.2pt;background:#fff}
.hero .ph{flex:1}
.hero img{object-position:50% 64%}
.hero .lb{position:absolute;left:${M}in;bottom:.07in;font-family:'Barlow Condensed';font-weight:700;font-size:8pt;letter-spacing:.24em;text-transform:uppercase;color:#fff;text-shadow:0 1pt 3pt rgba(0,0,0,.8)}
.hero .ph+.ph .lb{left:.1in}
.hero .ph:first-child .lb{left:${M}in}
.body{position:absolute;left:${M}in;right:${M}in;top:1.9in;bottom:${M}in;display:flex;flex-direction:column;justify-content:space-between}
.k{font-family:'Barlow Condensed';font-weight:600;font-size:8pt;letter-spacing:.26em;text-transform:uppercase;color:#ff5a5f}
h1{font-family:'Barlow Condensed';font-weight:700;font-size:18.5pt;line-height:.95;text-transform:uppercase;margin-top:2pt}
.pr{display:flex;justify-content:space-between;align-items:baseline;border-top:.6pt solid #3a3b40;padding-top:4pt}
.pr div{line-height:1;font-size:6.5pt;letter-spacing:.12em;text-transform:uppercase;color:#a0a0a6}
.pr b{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:17pt;color:#fff;letter-spacing:.01em;margin-top:2pt}
.pr .f b{color:#ff5a5f}
.cp{font-size:6.8pt;line-height:1.35;color:#d9d9dd;background:#26272b;padding:4pt 6pt;border-radius:2pt}
.bot{display:flex;gap:.11in;align-items:center}
.bot .p{font-family:'Barlow Condensed';font-weight:700;font-size:20pt;letter-spacing:.02em;line-height:1}
.bot .t{font-size:6.5pt;line-height:1.4;color:#a0a0a6;margin-top:2pt}
.bot .r{font-size:6.5pt;margin-bottom:2pt}
.bot .logo{width:1in;height:auto;display:block;margin-bottom:3pt}
`,
  html: `<section class="ad">
  <div class="hero"><div class="ph"><img src="${photo('backseat-before.jpg')}"><span class="lb">Before</span></div><div class="ph"><img src="${photo('backseat-after.jpg')}"><span class="lb">After</span></div></div>
  <div class="body">
    <div><div class="k">Mikey's Mobile Detailing &middot; Lake Stevens</div><h1>No judgment.<br>I've seen everything.</h1></div>
    <div class="pr"><div class="f">Full detail<b>$369</b></div><div>Interior<b>$249</b></div><div>Exterior<b>$199</b></div></div>
    <div class="cp">${COUPON}</div>
    <div class="bot"><div class="qr">${qr}</div><div><div class="r">5.0 ${stars()} ${REVIEWS} Google reviews</div><div class="p">${PHONE}</div>
      <div class="t">Call or text Mikey, or scan for your exact price in 60 seconds. ${FINE}</div></div></div>
  </div>
</section>`,
});

async function decodes(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ok = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  const rough = await sharp(buf).resize({ width: Math.round(info.width * 95 / 300) }).blur(1.2).modulate({ brightness: 0.7 })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hard = jsQR(new Uint8ClampedArray(rough.data), rough.info.width, rough.info.height);
  return ok && ok.data === QR_URL && hard && hard.data === QR_URL;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const qr = await QRCode.toString(QR_URL, { type: 'svg', errorCorrectionLevel: 'L', margin: 0, color: { dark: '#0e0e0f', light: '#ffffff' } });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 300 / 96, viewport: { width: Math.round(W * 96), height: Math.round(H * 96) } });
  const page = await ctx.newPage();
  const tmp = path.join(OUT, '.render.html');
  let failed = false;
  const shots = [];
  for (const build of [p1, p2, p3]) {
    const v = build(qr);
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${v.css}</style></head><body>${v.html}</body></html>`);
    await page.goto(fileUrl(tmp));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    const problems = await page.evaluate(({ W, H, SAFE, MIN_PT }) => {
      const out = [], IN = 96, ad = document.querySelector('.ad').getBoundingClientRect();
      const box = { l: ad.left + SAFE * IN, t: ad.top + SAFE * IN, r: ad.left + (W - SAFE) * IN, b: ad.top + (H - SAFE) * IN };
      document.querySelectorAll('.ad *').forEach(el => {
        if (el.closest('svg') || el.closest('.qr') || el.closest('.snap') || el.closest('.arrow')) return;
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
        const r = el.getBoundingClientRect();
        if (r.left < box.l - .5 || r.top < box.t - .5 || r.right > box.r + .5 || r.bottom > box.b + .5)
          out.push(`"${el.textContent.trim().slice(0, 30)}" outside the safe area`);
        const pt = parseFloat(getComputedStyle(el).fontSize) * .75;
        if (pt < MIN_PT - .01) out.push(`"${el.textContent.trim().slice(0, 30)}" is ${pt.toFixed(1)} pt`);
      });
      document.querySelectorAll('.in, .body').forEach(c => { if (c.scrollHeight > c.clientHeight + 1) out.push(`content too tall by ${c.scrollHeight - c.clientHeight}px`); });
      return out;
    }, { W, H, SAFE, MIN_PT });
    const text = await page.evaluate(() => document.body.innerText);
    const banned = [[/—/, 'an em dash'], [/insur|licens/i, 'licensed/insured'], [/lynnwood|edmonds|snohomish|everett|monroe|marysville/i, 'another town'],
      [/\b(30|90)[ -]sec/i, 'a quote time other than 60 seconds'], [/\bwe(?:'re| are| come| bring| detail| offer| serve| have)\b/i, 'business "we"'],
      [/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, 'a named work day'], [/360-799|232-1355/, 'an old phone number'],
      [/bring\s+(the\s+)?(water|power)/i, 'bringing water or power'], [/seamless|elevate|unlock|transform|jaw-dropping/i, 'an agency word']];
    for (const [re, what] of banned) if (re.test(text)) problems.push(`copy has ${what}: "${text.match(re)[0]}"`);
    for (const must of ['spigot', 'outlet', PHONE, '60 seconds', '$199', '$249', '$369', 'Lake Stevens', 'RainX', 'Dec 31, 2026', String(REVIEWS)])
      if (!text.toLowerCase().includes(must.toLowerCase())) problems.push(`missing "${must}"`);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: W * 96, height: H * 96 } });
    if (!(await decodes(png))) problems.push('QR does not decode sharp and blurred');
    const file = path.join(OUT, `${v.name}.png`);
    fs.writeFileSync(file, png);
    shots.push({ file, label: `${shots.length + 1}. ${v.title}`, sub: `${v.designer} · ${v.bg}` });
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${v.name}`);
    problems.forEach(p => console.log('     ', p));
    if (problems.length) failed = true;
  }
  fs.unlinkSync(tmp);
  await browser.close();
  const cols = 3, tw = 900, th = Math.round(tw * H / W), pad = 40, lab = 100;
  const at = i => ({ left: pad + (i % cols) * (tw + pad), top: pad + Math.floor(i / cols) * (th + lab + pad) });
  const comp = [];
  for (const [i, s] of shots.entries()) {
    const { left, top } = at(i);
    comp.push({ input: Buffer.from(`<svg width="${tw}" height="${lab}"><text x="0" y="44" font-family="sans-serif" font-size="40" font-weight="700">${s.label.replace("'", '&#39;')}</text><text x="0" y="84" font-family="sans-serif" font-size="28" fill="#555">${s.sub}</text></svg>`), left, top });
    comp.push({ input: await sharp(s.file).resize(tw, th).toBuffer(), left, top: top + lab });
  }
  await sharp({ create: { width: pad + cols * (tw + pad), height: pad + 1 * (th + lab + pad), channels: 3, background: '#e4e1da' } })
    .composite(comp).jpeg({ quality: 82 }).toFile(path.join(OUT, 'all-three.jpg'));
  console.log('wrote print/hometown-values/premium/');
  if (failed) process.exitCode = 1;
})();
