// boxes.cjs PORT_A PORT_B path... : compare every <img> rendered box at 390 and 1280
const { chromium } = require('/home/user/mikeysite/social/tools/node_modules/playwright');
const [,, A, B, ...paths] = process.argv;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const grab = async (port, path, w) => {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 500, reducedMotion: 'reduce' })).newPage();
    await p.route('**/*', r => r.request().method() !== 'GET' || !/localhost/.test(r.request().url()) && !/fonts\.g/.test(r.request().url()) ? r.abort() : r.continue());
    await p.goto(`http://localhost:${port}${path}`, { waitUntil: 'load' });
    await p.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, imgs: [...document.images].map(i => { const b = i.getBoundingClientRect(); return [(i.getAttribute('src') || '').slice(-40), Math.round(b.width), Math.round(b.height), i.naturalWidth]; }) }));
    await p.context().close(); return r;
  };
  for (const path of paths) for (const w of [390, 1280]) {
    const x = await grab(A, path, w), y = await grab(B, path, w);
    const diffs = x.imgs.map((im, i) => [im, y.imgs[i]]).filter(([p, q]) => !q || Math.abs(p[1] - q[1]) > 1 || Math.abs(p[2] - q[2]) > 1);
    console.log(`${path} @${w} docH ${x.h}->${y.h} imgs ${x.imgs.length}/${y.imgs.length} diffs ${diffs.length}`, diffs.slice(0, 6).map(d => JSON.stringify(d)).join(' '));
    if (process.env.SIZES) console.log(x.imgs.map(i => i.join(':')).join('  '));
  }
  await b.close();
})();
