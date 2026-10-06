const { chromium } = require('playwright');
const fs = require('fs');
const axeSrc = fs.readFileSync(__dirname + '/node_modules/axe-core/axe.min.js', 'utf8');
const site = fs.readFileSync('/home/user/mikeysite/sitemap.xml', 'utf8');
let paths = [...site.matchAll(/<loc>https:\/\/mikeysdetailing\.com([^<]*)<\/loc>/g)].map(m => m[1] || '/');
paths.push('/onbored/', '/404.html');
if (process.argv[2]) paths = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await ctx.route('**/*', r => r.request().method() === 'GET' ? r.continue() : r.abort());
  const out = {};
  for (const p of paths) {
    const page = await ctx.newPage();
    try {
      await page.goto('http://localhost:8099' + p, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(800);
      await page.addScriptTag({ content: axeSrc });
      const r = await page.evaluate(async () => await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] } }));
      out[p] = r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ t: n.target.join(' '), h: n.html.slice(0, 160), s: n.failureSummary.slice(0, 200) })) }));
    } catch (e) { out[p] = 'ERR ' + e.message; }
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(process.env.OUT || __dirname + '/axe-results.json', JSON.stringify(out, null, 1));
  const tally = {};
  for (const [p, vs] of Object.entries(out)) { if (typeof vs === 'string') { console.log(p, vs); continue; } for (const v of vs) { const k = v.impact + ' ' + v.id; tally[k] = tally[k] || { pages: 0, nodes: 0 }; tally[k].pages++; tally[k].nodes += v.nodes.length; } }
  console.log(Object.keys(out).length, 'pages'); console.log(tally);
})();
