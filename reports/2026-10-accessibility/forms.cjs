const { chromium } = require('playwright'); const fs=require('fs');
const axeSrc = fs.readFileSync(__dirname + '/node_modules/axe-core/axe.min.js', 'utf8');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('**/*', r => r.request().method() === 'GET' ? r.continue() : r.abort());
  for (const u of ['/', '/onbored/']) {
    const p = await ctx.newPage(); await p.goto('http://localhost:8099' + u, { waitUntil: 'load' }); await p.waitForTimeout(800);
    // reveal every hidden step/form so axe sees them (display only, nothing is clicked or sent)
    await p.addStyleTag({ content: '.step,form,[id^=step],[class*=step],[class*=screen]{display:block!important;visibility:visible!important;opacity:1!important}' });
    await p.evaluate(() => document.querySelectorAll('[hidden]').forEach(e => e.hidden = false));
    await p.addScriptTag({ content: axeSrc });
    const r = await p.evaluate(async () => (await axe.run(document, { runOnly: ['label','button-name','link-name','image-alt','select-name','aria-input-field-name','input-button-name'] })).violations.map(v => v.id + ': ' + v.nodes.map(n => n.html.slice(0, 140)).join(' || ')));
    console.log(u, r.length ? r : 'clean');
  }
  await b.close();
})();
