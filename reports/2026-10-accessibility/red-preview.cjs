// Before/after of the small-red-text proposal, in the browser only (nothing in the site changes).
// It recolours exactly what axe fails in brand red: text under 24px (18.66px bold) needs 4.5:1.
// Buttons, big headings and the logo keep #c8102e. Usage: node red-preview.cjs <port> <outdir>, run where axe-core and playwright are installed.
const { chromium } = require('playwright');
const [port, out] = process.argv.slice(2);
const PAGES = [['home', '/'], ['services-interior', '/services/interior.html']];
const FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await ctx.route('**/*', r => r.request().method() === 'GET' ? r.continue() : r.abort());
  for (const [name, path] of PAGES) {
    const pg = await ctx.newPage();
    await pg.goto(`http://localhost:${port}${path}`, { waitUntil: 'load' }); await pg.waitForTimeout(1200);
    await pg.addStyleTag({ content: FREEZE });
    await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    // mark exactly what axe fails for contrast in brand red; axe already applies the small-text rule
    await pg.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const marks = await pg.evaluate(async () => {
      const r = await axe.run(document, { runOnly: ['color-contrast'] });
      const out = [];
      for (const v of r.violations) for (const n of v.nodes) {
        if (!/foreground color: #c8102e/.test(n.failureSummary)) continue;
        const e = document.querySelector(n.target[0]); if (!e || e.closest('button, .btn, [class*="logo"]')) continue;
        e.setAttribute('data-small-red', ''); out.push(e.getBoundingClientRect().top + scrollY);
      }
      return out;
    });
    // the 844px window holding the most of them
    let best = 0, top = 0;
    for (const t of marks) { const n = marks.filter(x => x >= t - 40 && x < t - 40 + 844).length; if (n > best) { best = n; top = Math.max(0, t - 40); } }
    const H = await pg.evaluate(() => document.documentElement.scrollHeight); top = Math.min(top, H - 844);
    const clip = { x: 0, y: top, width: 390, height: 844 };
    await pg.screenshot({ path: `${out}/red-before-${name}.png`, fullPage: true, clip });
    await pg.addStyleTag({ content: '[data-small-red]{color:#ff4d5e!important}' });
    await pg.screenshot({ path: `${out}/red-after-${name}.png`, fullPage: true, clip });
    console.log(name, 'small red elements on page:', marks.length, '| in shot:', best, '| top:', Math.round(top));
    await pg.close();
  }
  await b.close();
})();
