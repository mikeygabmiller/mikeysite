// Proves the Rain-Ready offer switches itself off at midnight Pacific going
// into January 1, 2027, by faking the browser clock either side of it.
//
//   python3 -m http.server 8766   (from the repo root, in another terminal)
//   node tools/rain-ready-switchoff-test.cjs
//
// Passes when, at 11:59 PM Dec 31, the #rain-ready section shows and a sedan
// Full Detail quotes $369 with the three extras free; and at 12:01 AM Jan 1
// the section is gone and the same quote is $369 with no extras. First run
// 2026-11-03: pass. The hero chip it also checked came off the homepage on
// 2026-11-14 (Mikey: take the offer off the first screen). After January 1 the dormant code
// comes out (CLAUDE.md, Offers and countdowns) and this file goes with it.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8766';

(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const [label, t, live] of [['Dec 31, 11:59 PM PST', '2027-01-01T07:59:00Z', true],
                                  ['Jan 1, 12:01 AM PST', '2027-01-01T08:01:00Z', false]]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date(t) });
    await p.route(/googletagmanager|clarity|workers\.dev|google-analytics|\/api\//, r => r.abort());
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await p.clock.runFor(1500);
    const shown = await p.evaluate(() => {
      const vis = el => !!el && !el.hidden && getComputedStyle(el).display !== 'none';
      return { section: vis(document.querySelector('#rain-ready')) };
    });
    const click = async sel => { await p.evaluate(s => { const e = document.querySelector(s); e.scrollIntoView(); e.click(); }, sel); await p.clock.runFor(400); };
    for (const sel of ['[data-role="vehicle"][data-value="0"]', '#qqHeroFull', '#qqNext2',
                       '[data-role="condition"][data-value="0"]', '#qqNext3', '[data-role="calc"]']) await click(sel);
    await p.clock.runFor(1500);
    const quote = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
    const price = (quote.match(/Your estimate \$(\d+)/) || [])[1];
    const extras = /Rain-Ready, book by Dec 31/.test(quote);
    const ok = shown.section === live && extras === live && price === '369';
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: section ${shown.section}, extras on quote ${extras}, price $${price}`);
    await ctx.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
