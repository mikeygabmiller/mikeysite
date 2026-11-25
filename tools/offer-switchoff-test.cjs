// Proves the homepage's two dated offers switch themselves off, by faking the
// browser clock either side of each end.
//
//   python3 -m http.server 8766   (from the repo root, in another terminal)
//   node tools/offer-switchoff-test.cjs
//
// 1. The gift card bonus (#gift-cards) shows at 11:59 PM Dec 24 and is gone at
//    12:01 AM Dec 25, Pacific.
// 2. Rain-Ready: since 2026-11-25 it only applies to a visit that came from a
//    printed piece that promised it (utm_source doorhanger, postcard,
//    sharedcard, treatstreet). At 11:59 PM Dec 31 a door hanger visit's sedan
//    Full Detail quotes $369 with the three extras free; a plain visit quotes
//    $369 with none; at 12:01 AM Jan 1 the door hanger visit gets none either.
// After January 1 the dormant Rain-Ready code comes out (CLAUDE.md, Offers and
// countdowns) and part 2 goes with it.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8766';

(async () => {
  const b = await chromium.launch();
  let bad = 0;
  const open = async (t, qs) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date(t) });
    await p.route(/googletagmanager|clarity|workers\.dev|google-analytics|\/api\//, r => r.abort());
    await p.goto(BASE + '/' + qs, { waitUntil: 'domcontentloaded' });
    await p.clock.runFor(1500);
    return { ctx, p };
  };

  for (const [label, t, live] of [['Dec 24, 11:59 PM PST', '2026-12-25T07:59:00Z', true],
                                  ['Dec 25, 12:01 AM PST', '2026-12-25T08:01:00Z', false]]) {
    const { ctx, p } = await open(t, '');
    const shown = await p.evaluate(() => { const e = document.querySelector('#gift-cards'); return !!e && getComputedStyle(e).display !== 'none'; });
    const ok = shown === live; if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} gift cards, ${label}: section ${shown}`);
    await ctx.close();
  }

  for (const [label, t, qs, live] of [['Dec 31, 11:59 PM PST, door hanger', '2027-01-01T07:59:00Z', '?utm_source=doorhanger&utm_medium=print', true],
                                      ['Dec 31, 11:59 PM PST, no print source', '2027-01-01T07:59:00Z', '', false],
                                      ['Jan 1, 12:01 AM PST, door hanger', '2027-01-01T08:01:00Z', '?utm_source=doorhanger&utm_medium=print', false]]) {
    const { ctx, p } = await open(t, qs);
    const click = async sel => { await p.evaluate(s => { const e = document.querySelector(s); e.scrollIntoView(); e.click(); }, sel); await p.clock.runFor(400); };
    for (const sel of ['[data-role="vehicle"][data-value="0"]', '#qqHeroFull', '#qqNext2',
                       '[data-role="condition"][data-value="0"]', '#qqNext3', '[data-role="calc"]']) await click(sel);
    await p.clock.runFor(1500);
    const quote = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
    const price = (quote.match(/Your estimate \$(\d+)/) || [])[1];
    const extras = /Rain-Ready, book by Dec 31/.test(quote);
    const ok = extras === live && price === '369'; if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} Rain-Ready, ${label}: extras on quote ${extras}, price $${price}`);
    await ctx.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
