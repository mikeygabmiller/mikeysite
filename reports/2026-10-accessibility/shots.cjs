// usage: node shots.cjs <port> <outdir> ; full-page screenshots of every page in list.txt at phone and desktop size
const { chromium } = require('playwright'); const fs = require('fs');
const [port, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const pages = fs.readFileSync(__dirname + '/list.txt', 'utf8').trim().split(/\s+/);
const FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [tag, opt] of [['m', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }], ['d', { viewport: { width: 1280, height: 800 } }]]) {
    const ctx = await b.newContext({ ...opt, reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles' });
    await ctx.route('**/*', r => { const u = r.request().url(); if (r.request().method() !== 'GET') return r.abort(); if (!u.startsWith('http://localhost')) return r.abort(); return r.continue(); });
    for (const p of pages) {
      const pg = await ctx.newPage();
      const url = `http://localhost:${port}/` + p.replace(/index\.html$/, '');
      await pg.goto(url, { waitUntil: 'load' }); await pg.addStyleTag({ content: FREEZE });
      await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
      await pg.waitForTimeout(500);
      await pg.screenshot({ path: `${out}/${tag}__${p.replace(/\//g, '_')}.png`, fullPage: true });
      await pg.close();
    }
    await ctx.close();
  }
  await b.close();
})();
