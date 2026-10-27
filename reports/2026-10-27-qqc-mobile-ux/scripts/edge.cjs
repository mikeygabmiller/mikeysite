// Edge cases: back button, refresh, slow 3G, calendar down / slow / empty,
// page weight, time until the calculator answers a tap. Same blocking as walk.cjs.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const R = {};
const blocked = new Set();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const URL0 = 'https://mikeysdetailing.com/';
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

function isAllowed(u, method) {
  const url = new URL(u);
  if (url.hostname === 'mikeysdetailing.com') return method === 'GET';
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return true;
  if (url.hostname === 'texting.mikeysdetailingsnohomish.workers.dev') return method === 'GET' && url.pathname === '/api/next-openings';
  return u.startsWith('data:');
}
async function ctxFor(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: IOS_UA });
  await ctx.route('**/*', async (route) => {
    const req = route.request(), u = req.url();
    if (opts.openings && u.includes('/api/next-openings')) return opts.openings(route);
    if (isAllowed(u, req.method())) return route.continue();
    blocked.add(req.method() + ' ' + u.split('?')[0]);
    return route.abort('blockedbyclient');
  });
  return ctx;
}
async function toPrice(page, { size = '0', cond = '30' } = {}) {
  await page.locator('#booking').scrollIntoViewIfNeeded();
  await page.click(`#step1 .choice[data-value="${size}"]`); await sleep(700);
  await page.click('#qqHeroFull'); await page.click('#qqNext2'); await sleep(500);
  await page.click(`#step3 .choice[data-value="${cond}"]`); await page.click('#qqNext3'); await sleep(500);
  await page.click('#qqNext4'); await sleep(1500);
}
const shown = (page) => page.evaluate(() => { const s = document.querySelector('#qqcCard .step.show'); return s ? s.id : null; });
const shot = (page, f) => page.screenshot({ path: path.join(OUT, f + '.jpg'), type: 'jpeg', quality: 72 });

(async () => {
  const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:36143' } });

  // 1. Back button and refresh mid-flow.
  {
    const ctx = await ctxFor(browser); const page = await ctx.newPage();
    await page.goto('https://mikeysdetailing.com/mobile-detailing-everett-wa/', { waitUntil: 'load' });
    await page.goto(URL0, { waitUntil: 'load' });
    await page.click('a.mh-cta-primary'); await sleep(900);
    const urlAfterHero = page.url();
    await page.click('#step1 .choice[data-value="40"]'); await sleep(700);
    await page.click('#qqHeroFull'); await page.click('#qqNext2'); await sleep(500);
    await page.click('#step3 .choice[data-value="30"]'); await page.click('#qqNext3'); await sleep(600);
    const before = await shown(page);
    await page.goBack(); await sleep(1200);
    const afterBack1 = { url: page.url(), step: await shown(page).catch(() => null), scrollY: await page.evaluate(() => scrollY).catch(() => null) };
    await shot(page, 'edge-01-after-back-once');
    await page.goBack(); await sleep(1500);
    const afterBack2 = { url: page.url() };
    R.back = { urlAfterHero, before, afterBack1, afterBack2 };
    // refresh at step 4
    await page.goto(URL0, { waitUntil: 'load' });
    await page.locator('#booking').scrollIntoViewIfNeeded();
    await page.click('#step1 .choice[data-value="40"]'); await sleep(700);
    await page.click('#qqHeroFull'); await page.click('#qqNext2'); await sleep(500);
    await page.fill('#qqYmm', '2019 Honda Pilot');
    await page.click('#step3 .choice[data-value="30"]'); await page.click('#qqNext3'); await sleep(600);
    await page.reload({ waitUntil: 'load' }); await sleep(1200);
    R.refresh = { step: await shown(page), ymmKept: await page.inputValue('#qqYmm'), vehicleSel: await page.$$eval('#step1 .choice.sel', e => e.length), scrollY: await page.evaluate(() => scrollY) };
    await shot(page, 'edge-02-after-refresh');
    await ctx.close();
  }

  // 2. Calendar down: request aborted.
  for (const [name, handler] of [
    ['down', (route) => route.abort('failed')],
    ['empty', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, openings: [] }) })],
    ['http500', (route) => route.fulfill({ status: 500, body: 'err' })],
    ['slow6s', async (route) => { await sleep(6000); return route.continue(); }],
  ]) {
    const ctx = await ctxFor(browser, { openings: handler }); const page = await ctx.newPage();
    await page.goto(URL0, { waitUntil: 'load' });
    const t = Date.now();
    await toPrice(page);
    const s5 = await page.evaluate(() => ({ booking: document.getElementById('step5').classList.contains('has-booking'),
      formShown: getComputedStyle(document.getElementById('qqForm')).display !== 'none',
      submitText: document.getElementById('qqSubmitBtn').textContent.trim() }));
    await shot(page, 'edge-03-openings-' + name);
    let later = null;
    if (name === 'slow6s') {
      await page.click('#qqName'); await sleep(7000);
      later = await page.evaluate(() => ({ booking: document.getElementById('step5').classList.contains('has-booking') }));
      await shot(page, 'edge-03b-openings-slow6s-after-wait');
    }
    if (name === 'empty') {
      // A visitor already on the "Pick my time" road when the list is empty can't happen (no button), so note it.
    }
    R['openings_' + name] = { ms: Date.now() - t, s5, later };
    await ctx.close();
  }

  // 3. Slow 3G + 4x CPU: when does the page paint, and when does a tap on the calculator work?
  for (const prof of [
    { name: 'slow3g', down: 400 * 1024 / 8, up: 400 * 1024 / 8, lat: 400, cpu: 4 },
    { name: 'fast3g', down: 1.6 * 1024 * 1024 / 8, up: 750 * 1024 / 8, lat: 150, cpu: 4 },
    { name: 'none', down: -1, up: -1, lat: 0, cpu: 1 },
  ]) {
    const ctx = await ctxFor(browser); const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    if (prof.down > 0) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: prof.lat, downloadThroughput: prof.down, uploadThroughput: prof.up });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: prof.cpu });
    let bytes = 0; const byType = {}; const reqs = [];
    page.on('response', async (res) => {
      try { const b = await res.body(); bytes += b.length; const ty = res.request().resourceType(); byType[ty] = (byType[ty] || 0) + b.length; reqs.push([b.length, res.url().split('?')[0]]); } catch (e) {}
    });
    const t0 = Date.now();
    await page.goto(URL0, { waitUntil: 'commit', timeout: 120000 });
    // poll for: header visible, calculator script ready, vehicle tap works.
    let readyAt = null, fcp = null;
    while (Date.now() - t0 < 120000) {
      const st = await page.evaluate(() => ({ mq: !!window.MikeyQQC, card: !!document.getElementById('qqcCard') })).catch(() => ({}));
      if (st.mq && !readyAt) { readyAt = Date.now() - t0; break; }
      await sleep(100);
    }
    await page.waitForLoadState('load', { timeout: 180000 }).catch(() => {});
    const loadAt = Date.now() - t0;
    const perf = await page.evaluate(() => {
      const p = performance.getEntriesByType('paint').map(e => [e.name, Math.round(e.startTime)]);
      const nav = performance.getEntriesByType('navigation')[0];
      const lcp = new Promise(res => { try { new PerformanceObserver(l => { const e = l.getEntries(); res(Math.round(e[e.length - 1].startTime)); }).observe({ type: 'largest-contentful-paint', buffered: true }); setTimeout(() => res(null), 500); } catch (e) { res(null); } });
      return lcp.then(l => ({ paint: p, lcp: l, dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), htmlBytes: nav.encodedBodySize, htmlDecoded: nav.decodedBodySize }));
    });
    await sleep(prof.name === 'none' ? 1500 : 4000);
    reqs.sort((a, b) => b[0] - a[0]);
    R['perf_' + prof.name] = { calcReadyMs: readyAt, loadMs: loadAt, perf, totalBytes: bytes, byType, top: reqs.slice(0, 12) };
    if (prof.name === 'slow3g') await page.screenshot({ path: path.join(OUT, 'edge-04-slow3g-loaded.jpg'), type: 'jpeg', quality: 72 });
    await ctx.close();
  }

  // 4. Form field attributes.
  {
    const ctx = await ctxFor(browser); const page = await ctx.newPage();
    await page.goto(URL0, { waitUntil: 'load' });
    R.fields = await page.$$eval('#qqcCard input, #qqcCard select, #qqcCard textarea', els => els.map(e => ({ id: e.id, type: e.type, name: e.name || '', autocomplete: e.getAttribute('autocomplete'), inputmode: e.getAttribute('inputmode'), label: !!(e.labels && e.labels.length) || !!e.getAttribute('aria-label'), placeholder: e.placeholder || '', enterkeyhint: e.getAttribute('enterkeyhint'), fontSize: getComputedStyle(e).fontSize })));
    // The keyboard: iPhone SE's is ~260px tall in portrait, plus ~44px QuickType bar.
    await toPrice(page);
    if (await page.evaluate(() => document.getElementById('step5').classList.contains('has-booking'))) {
      await page.click('#qqPickTime'); await sleep(900);
      await page.click('#qqOpens .qq-open'); await sleep(900);
      await page.click('#qqBName'); await sleep(600);
      R.kbd = await page.evaluate(() => {
        const vis = innerHeight - 300; const b = document.getElementById('qqBookBtn').getBoundingClientRect();
        const f = document.activeElement.getBoundingClientRect();
        return { visibleAboveKeyboard: vis, focusedFieldBottom: Math.round(f.bottom), bookBtnTop: Math.round(b.top), bookBtnHiddenByKeyboard: b.top > vis };
      });
    }
    // Repeat-visit: is anything remembered? (localStorage keys)
    R.storage = await page.evaluate(() => Object.keys(localStorage));
    await ctx.close();
  }

  // 5. Interior + Exterior then "Switch to Full Detail" on the price screen; also check van prices shown on step 2 cards.
  {
    const ctx = await ctxFor(browser); const page = await ctx.newPage();
    await page.goto(URL0, { waitUntil: 'load' });
    await page.locator('#booking').scrollIntoViewIfNeeded();
    await page.click('#step1 .choice[data-value="80"]'); await sleep(800);
    R.vanCards = await page.evaluate(() => ({ full: document.querySelector('#qqHeroFull .amt').textContent, int: document.querySelector('[data-name="Interior Detail"] .price').textContent, ext: document.querySelector('[data-name="Exterior Detail"] .price').textContent }));
    await page.click('#services [data-name="Interior Detail"]'); await sleep(200);
    R.vanTickerAfterInterior = await page.textContent('#qqTickerAmt');
    await page.click('#services [data-name="Exterior Detail"]'); await sleep(500);
    await page.screenshot({ path: path.join(OUT, 'edge-05-van-both-step2.jpg'), type: 'jpeg', quality: 72, fullPage: false });
    R.vanSaveTip = await page.textContent('#qqSaveTip');
    await page.click('#qqNext2'); await sleep(500);
    await page.click('#step3 .choice[data-value="0"]'); await page.click('#qqNext3'); await sleep(600);
    await page.screenshot({ path: path.join(OUT, 'edge-06-van-both-step4.jpg'), type: 'jpeg', quality: 72 });
    await page.click('#qqNext4'); await sleep(1600);
    R.vanBothPrice = await page.evaluate(() => ({ amt: document.getElementById('qqAmount').textContent, swap: document.getElementById('qqFullSwap').hidden ? null : document.getElementById('qqFullSwapText').textContent, swapTop: Math.round(document.getElementById('qqFullSwap').getBoundingClientRect().top), vh: innerHeight }));
    await page.screenshot({ path: path.join(OUT, 'edge-07-van-both-price.jpg'), type: 'jpeg', quality: 72 });
    await page.screenshot({ path: path.join(OUT, 'edge-07b-van-both-price-full.jpg'), type: 'jpeg', quality: 60, fullPage: true, clip: undefined });
    await ctx.close();
  }

  // 6. Exterior only, clean: what step 4 looks like with few add-ons; and the "allservices" mini quiz handoff.
  {
    const ctx = await ctxFor(browser); const page = await ctx.newPage();
    await page.goto(URL0, { waitUntil: 'load' });
    await page.locator('#booking').scrollIntoViewIfNeeded();
    await page.click('#step1 .choice[data-value="0"]'); await sleep(800);
    await page.click('#services [data-name="Exterior Detail"]'); await page.click('#qqNext2'); await sleep(500);
    await page.click('#step3 .choice[data-value="0"]'); await page.click('#qqNext3'); await sleep(700);
    await page.screenshot({ path: path.join(OUT, 'edge-08-exterior-step4.jpg'), type: 'jpeg', quality: 72 });
    R.extAddons = await page.$$eval('#qqAddons .chip', e => e.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
    await page.click('#qqNext4'); await sleep(1500);
    R.extPrice = await page.textContent('#qqAmount');
    await ctx.close();
  }

  // 7. Sticky bar and the calculator; the bar's "Book Now" on a city page.
  {
    const ctx = await ctxFor(browser); const page = await ctx.newPage();
    await page.goto(URL0, { waitUntil: 'load' });
    await page.evaluate(() => scrollTo(0, 1400)); await sleep(800);
    R.sticky = await page.evaluate(() => { const b = document.getElementById('mobileBookingBar'); return { visible: b.classList.contains('is-visible'), h: Math.round(b.getBoundingClientRect().height) }; });
    // Find a scroll spot where the bar shows (past hero, calculator off screen).
    for (const y of [1400, 2500, 3500, 6000, 9000]) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(700); if (await page.evaluate(() => document.getElementById('mobileBookingBar').classList.contains('is-visible'))) { R.sticky = { visibleAt: y }; break; } }
    try { await page.click('#mobileBookingBar .sticky-cta-book', { timeout: 4000 }); } catch (e) { R.stickyErr = 'bar never visible'; }
    await sleep(1500);
    R.stickyLands = await page.evaluate(() => ({ cardTop: Math.round(document.getElementById('qqcCard').getBoundingClientRect().top), firstTileBottom: Math.round(document.querySelector('#step1 .choice').getBoundingClientRect().bottom), vh: innerHeight }));
    await page.screenshot({ path: path.join(OUT, 'edge-09-sticky-book-now-lands.jpg'), type: 'jpeg', quality: 72 });
    await ctx.close();
  }

  await browser.close();
  R._blocked = [...blocked];
  fs.writeFileSync(path.join(OUT, 'results-edge.json'), JSON.stringify(R, null, 2));
  console.log(JSON.stringify(R, null, 1));
})();
