// Walk the homepage quote calculator at 390 wide. Every non-GET request is aborted, so nothing can be sent.
const { chromium } = require('/home/user/mikeysite/social/tools/node_modules/playwright');
const BASE = process.env.BASE || 'https://mikeysdetailing.com';
const SVC = { 'Full Detail': 369, 'Interior Detail': 249, 'Exterior Detail': 199 };
const ADD = { 'Carpet Shampoo': 20, 'Exterior Polish': 30, 'Ceramic Wax': 20, 'RainX Windows': 10 };
(async () => {
  const proxy = BASE.includes('localhost') ? undefined : { server: process.env.HTTPS_PROXY };
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const aborted = [], gets = [], errs = [];
  await p.route('**/*', r => { const q = r.request(); if (q.method() !== 'GET') { aborted.push(q.method() + ' ' + q.url().slice(0, 90)); return r.abort(); } if (/\/api\//.test(q.url())) gets.push(q.url().slice(0, 120)); return r.continue(); });
  p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const shot = async n => { await p.locator('#qqcCard').screenshot({ path: `shots/calc-${n}.png` }).catch(e => console.log('shot fail', n, String(e).slice(0, 80))); };
  const over = async tag => { const w = await p.evaluate(() => document.documentElement.scrollWidth); const wide = await p.evaluate(() => [...document.querySelectorAll('#qqcCard *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1); }).map(e => e.id || e.className).slice(0, 5)); if (w > 391 || wide.length) console.log('  OVERFLOW at', tag, w, wide); };
  const tap = async sel => { const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); await l.tap(); await p.waitForTimeout(350); };
  // Rain-Ready chip and section
  console.log('RR chip:', await p.evaluate(() => { const c = document.querySelector('.mh-rr'); return c && getComputedStyle(c).display !== 'none' ? c.textContent.replace(/\s+/g, ' ').trim() : 'hidden'; }));
  const rr = p.locator('#rain-ready'); if (await rr.count()) { await rr.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await rr.screenshot({ path: 'shots/rain-ready-section.png' }); console.log('RR section text:', (await rr.innerText()).replace(/\s+/g, ' ').slice(0, 400)); }
  let i = 0;
  for (const v of [0, 40, 80]) for (const s of Object.keys(SVC)) {
    const cond = [0, 30, 60][i % 3]; const allAdd = i % 2 === 0; i++;
    await p.goto(BASE + '/?qa=' + i + '#booking', { waitUntil: 'load' }); await p.waitForTimeout(900);
    await tap(`#step1 .choice[data-value="${v}"]`); if (i === 1) await shot('1-vehicle');
    // step 2 may auto-advance
    await p.waitForSelector('#step2.show', { timeout: 5000 }).catch(() => {});
    await tap(`#step2 [data-role="service"][data-name="${s}"]`); if (i === 1) { await shot('2-service'); await over('step2'); }
    await tap('#qqNext2');
    await tap(`#step3 .choice[data-value="${cond}"]`); if (i === 1) { await shot('3-condition'); await over('step3'); }
    await tap('#qqNext3');
    const chips = await p.$$eval('#qqAddons .chip', cs => cs.map(c => ({ n: c.dataset.name, role: c.dataset.role, sel: c.classList.contains('sel'), txt: c.textContent.replace(/\s+/g, ' ').trim() })));
    if (allAdd) for (const c of chips) if (c.role === 'addon' && !c.sel) await tap(`#qqAddons .chip[data-name="${c.n}"]`);
    if (!allAdd) for (const c of chips) if (c.role === 'addon' && c.sel) await tap(`#qqAddons .chip[data-name="${c.n}"]`);
    if (i === 1) { await shot('4-addons'); await over('step4'); }
    const chosen = await p.$$eval('#qqAddons .chip.sel', cs => cs.map(c => [c.dataset.name, c.dataset.role]));
    await tap('#qqNext4'); await p.waitForTimeout(900);
    const amt = (await p.locator('#qqAmount').innerText()).trim();
    const bd = (await p.locator('#qqBreakdown').innerText()).replace(/\s+/g, ' ').trim();
    let exp = SVC[s] + v + cond; for (const [n, role] of chosen) if (role === 'addon') exp += ADD[n];
    const ok = amt.replace(/[^0-9]/g, '') === String(exp);
    console.log(`${ok ? 'OK ' : 'BAD'} size+${v} ${s} cond+${cond} addons=[${chosen.map(c => c[0] + (c[1] === 'addon-free' ? '(free)' : '')).join(', ')}] -> shows ${amt}, expect $${exp} | ${bd.slice(0, 160)}`);
    if (i === 1) {
      await shot('5-price'); await over('step5');
      const hasBooking = await p.evaluate(() => document.getElementById('step5').classList.contains('has-booking'));
      console.log('  price screen has-booking:', hasBooking, '| next line:', (await p.locator('#qqNextLine').innerText().catch(() => '')).trim());
      if (hasBooking) {
        await tap('#qqPickTime'); await p.waitForTimeout(1500); await shot('7-times'); await over('step7');
        console.log('  openings:', (await p.locator('#qqOpens').innerText()).replace(/\s+/g, ' ').slice(0, 200));
        const first = p.locator('#qqOpens .qq-open').first();
        if (await first.count()) { await first.tap(); await p.waitForTimeout(800);
          await p.fill('#qqBName', 'Test Person'); await p.fill('#qqBPhone', '4255550100');
          const opts = await p.$$eval('#qqBTown option', os => os.map(o => o.value || o.textContent));
          console.log('  town options:', opts.join(' | '));
          await p.selectOption('#qqBTown', { index: 1 }); await p.fill('#qqBStreet', '123 Example St');
          await shot('8-details'); await over('step8');
          console.log('  step 8 summary:', (await p.locator('#qqBookSum').innerText()).replace(/\s+/g, ' '));
          await tap('#step8 [data-role="go"], #step8 .btn-ghost').catch(() => {});
        }
        await p.locator('#step7 [data-role="text-instead"], #step5 [data-role="text-instead"]').first().scrollIntoViewIfNeeded().catch(() => {});
        // back to price and use the text-me path
        await p.evaluate(() => { const b = document.querySelector('#step7 [data-role="go"][data-step="5"]'); if (b && b.offsetParent) b.click(); });
        await p.waitForTimeout(500);
        await tap('#step5 [data-role="text-instead"]');
      }
      await p.fill('#qqName', 'Test Person'); await p.fill('#qqPhone', '4255550100');
      await shot('5-text-form'); await over('step5-form');
      console.log('  text-me form visible:', await p.locator('#qqForm').isVisible(), '| submit button:', (await p.locator('#qqSubmitBtn').innerText()).trim(), '(not tapped)');
    }
  }
  console.log('API GETs:', [...new Set(gets)].join('\n  '));
  console.log('aborted non-GET:', [...new Set(aborted)].join('\n  '));
  console.log('page errors:', errs);
  await b.close();
})();
