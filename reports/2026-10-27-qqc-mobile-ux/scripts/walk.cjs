// QQC mobile UX teardown. Read-only against the live site.
// Blocks every write: /api/book, /submit, web3forms, the dashboard's /px and
// tracking, GA/Ads/Clarity. Only GET /api/next-openings reaches the worker.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
const ONLY = process.argv[3] || 'all';
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'https://mikeysdetailing.com/';
const results = {};
const blocked = [];
const allowed = [];

const DEVICES = {
  se:      { name: 'iPhone SE',     viewport: { width: 375, height: 667 }, dsf: 2, mobile: true },
  ip14:    { name: 'iPhone 14',     viewport: { width: 390, height: 844 }, dsf: 2, mobile: true },
  android: { name: 'Small Android', viewport: { width: 360, height: 740 }, dsf: 2, mobile: true },
  desk:    { name: 'Desktop',       viewport: { width: 1366, height: 800 }, dsf: 1, mobile: false },
};
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const AND_UA = 'Mozilla/5.0 (Linux; Android 13; SM-A136U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';

function isAllowed(u, method) {
  const url = new URL(u);
  if (url.hostname === 'mikeysdetailing.com' || url.hostname === 'www.mikeysdetailing.com') return method === 'GET';
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return true;
  if (url.hostname === 'texting.mikeysdetailingsnohomish.workers.dev') return method === 'GET' && url.pathname === '/api/next-openings';
  if (u.startsWith('data:')) return true;
  return false;
}

async function newCtx(browser, key, opts = {}) {
  const d = DEVICES[key];
  const ctx = await browser.newContext({
    viewport: d.viewport, deviceScaleFactor: d.dsf, isMobile: d.mobile, hasTouch: d.mobile,
    userAgent: d.mobile ? (key === 'android' ? AND_UA : IOS_UA) : undefined,
    reducedMotion: opts.reducedMotion || 'no-preference',
  });
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const u = req.url();
    if (opts.openings && u.includes('/api/next-openings')) return opts.openings(route);
    if (isAllowed(u, req.method())) { allowed.push(req.method() + ' ' + u.split('?')[0]); return route.continue(); }
    blocked.push(req.method() + ' ' + u.split('?')[0]);
    return route.abort('blockedbyclient');
  });
  return ctx;
}

let shotN = 0;
async function shot(page, tag, full = false) {
  shotN++;
  const f = `${tag}.jpg`;
  await page.screenshot({ path: path.join(OUT, f), type: 'jpeg', quality: 72, fullPage: full });
  return f;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Where the step's main controls sit against the viewport, and what's on top of them.
async function fold(page, sels) {
  return page.evaluate((sels) => {
    const vh = innerHeight; const out = {};
    const hdr = document.getElementById('mikeyHeader');
    const hb = hdr ? hdr.getBoundingClientRect().bottom : 0;
    out._headerBottom = Math.round(hb);
    const card = document.getElementById('qqcCard');
    out._cardTop = Math.round(card.getBoundingClientRect().top);
    for (const s of sels) {
      const el = document.querySelector(s);
      if (!el || !el.offsetParent) { out[s] = null; continue; }
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = Math.min(Math.max(r.top + r.height / 2, 0), vh - 1);
      const hit = document.elementFromPoint(cx, cy);
      out[s] = { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width),
        visible: r.top >= hb && r.bottom <= vh, coveredBy: hit && !el.contains(hit) && !hit.contains(el) ? (hit.id || hit.className || hit.tagName) : null };
    }
    return out;
  }, sels);
}

// Every visible tappable thing in the card under 44x44.
async function tapTargets(page) {
  return page.evaluate(() => {
    const card = document.getElementById('qqcCard');
    const els = card.querySelectorAll('button, a, input, select, textarea, [role=button], .chip');
    const small = [];
    els.forEach(el => {
      if (!el.offsetParent) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (el.tabIndex === -1 && el.getAttribute('aria-hidden') === 'true') return;
      if (r.height < 44 || r.width < 44) small.push({ el: el.id || (el.className && String(el.className)) || el.tagName, text: (el.textContent || el.placeholder || '').trim().slice(0, 50), w: Math.round(r.width), h: Math.round(r.height) });
    });
    return small;
  });
}

async function stepShown(page) { return page.evaluate(() => { const s = document.querySelector('#qqcCard .step.show'); return s ? s.id : null; }); }

async function walk(browser, key, variant = 'full') {
  const d = DEVICES[key]; const R = { device: d.name, viewport: d.viewport, steps: {}, taps: 0, shots: [] };
  const ctx = await newCtx(browser, key); const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const t0 = Date.now();
  await page.goto(URL0, { waitUntil: 'load' });
  R.loadMs = Date.now() - t0;
  await sleep(800);
  const pre = variant === 'full' ? key : key + '-' + variant;
  R.shots.push(await shot(page, `${pre}-00-landing`));
  // Landing: is the hero CTA there, where does it go?
  R.heroCta = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a[href="#booking"], a[href="/#booking"]')].filter(a => a.offsetParent).map(a => ({ t: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), top: Math.round(a.getBoundingClientRect().top) }));
    return a.slice(0, 6);
  });
  // Customer path: tap the hero's quote button.
  const hero = page.locator('a.mh-cta-primary').first();
  if (await hero.count()) { await hero.click(); } else { await page.locator('#booking').scrollIntoViewIfNeeded(); }
  await sleep(1200);
  R.steps.s1 = await fold(page, ['#step1 .choice[data-value="0"]', '#step1 .choice[data-value="80"]', '#qqcCard .progress']);
  R.steps.s1.tiny = await tapTargets(page);
  R.shots.push(await shot(page, `${pre}-01-step1-vehicle`));
  const tFirst = Date.now();
  // Size
  const size = variant === 'van' ? '80' : variant === 'suv' ? '40' : '0';
  await page.click(`#step1 .choice[data-value="${size}"]`);
  await sleep(1100);
  R.steps.s2 = await fold(page, ['#qqHeroFull', '#services .svc-card[data-name="Exterior Detail"]', '#qqNext2', '#qqcCard .progress']);
  R.steps.s2.tiny = await tapTargets(page);
  R.shots.push(await shot(page, `${pre}-02-step2-service`));
  // Service
  if (variant === 'both') { await page.click('#services [data-name="Interior Detail"]'); await page.click('#services [data-name="Exterior Detail"]'); }
  else if (variant === 'ext') await page.click('#services [data-name="Exterior Detail"]');
  else if (variant === 'int') await page.click('#services [data-name="Interior Detail"]');
  else await page.click('#qqHeroFull');
  await sleep(400);
  R.steps.s2sel = await fold(page, ['#qqNext2', '#qqSaveTip']);
  R.shots.push(await shot(page, `${pre}-03-step2-picked`));
  await page.click('#qqNext2'); await sleep(1100);
  R.steps.s3 = await fold(page, ['#step3 .choice[data-value="60"]', '#qqYmm', '#qqNotes', '#qqNext3', '#qqcCard .progress']);
  R.steps.s3.tiny = await tapTargets(page);
  R.shots.push(await shot(page, `${pre}-04-step3-condition`));
  await page.click(`#step3 .choice[data-value="${variant === 'van' ? '60' : '30'}"]`); await sleep(300);
  R.steps.s3sel = await fold(page, ['#qqNext3']);
  R.shots.push(await shot(page, `${pre}-05-step3-picked`));
  await page.click('#qqNext3'); await sleep(1100);
  R.steps.s4 = await fold(page, ['#qqAddons', '#qqAddonNote', '#qqNext4', '#qqTicker']);
  R.steps.s4.tiny = await tapTargets(page);
  R.steps.s4.addons = await page.$$eval('#qqAddons .chip', els => els.map(e => e.textContent.trim().replace(/\s+/g, ' ')));
  R.shots.push(await shot(page, `${pre}-06-step4-addons`));
  const chip = page.locator('#qqAddons .chip[data-role="addon"]').first();
  if (await chip.count()) { await chip.click(); await sleep(300); }
  await page.click('#qqNext4');
  await sleep(1800);
  R.timeToPriceMs = Date.now() - tFirst;
  R.steps.s5 = await fold(page, ['#qqAmount', '#qqPickTime', '#qqNextLine', '#qqName', '#qqSubmitBtn', '#qqBreakdown', '#qqFullSwap']);
  R.steps.s5.tiny = await tapTargets(page);
  R.steps.s5.hasBooking = await page.evaluate(() => document.getElementById('step5').classList.contains('has-booking'));
  R.steps.s5.amount = await page.textContent('#qqAmount');
  R.steps.s5.label = await page.textContent('#qqProgLabel');
  R.shots.push(await shot(page, `${pre}-07-step5-price`));
  R.shots.push(await shot(page, `${pre}-07b-step5-price-full`, false));
  if (R.steps.s5.hasBooking) {
    await page.click('#qqPickTime'); await sleep(1100);
    R.steps.s7 = await fold(page, ['#qqOpens .qq-open', '#qqMoreTimes', '#step7 [data-role="text-instead"]', '#step7 .btn-ghost']);
    R.steps.s7.tiny = await tapTargets(page);
    R.steps.s7.times = await page.$$eval('#qqOpens .qq-open', e => e.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
    R.shots.push(await shot(page, `${pre}-08-step7-times`));
    await page.click('#qqOpens .qq-open'); await sleep(1100);
    R.steps.s8 = await fold(page, ['#qqBName', '#qqBPhone', '#qqBTown', '#qqBStreet', '#qqBookBtn', '#qqBConsentText']);
    R.steps.s8.tiny = await tapTargets(page);
    R.steps.s8.btn = await page.textContent('#qqBookBtn');
    R.shots.push(await shot(page, `${pre}-09-step8-details`));
    // Empty submit: validation only, never reaches the network (and /api/book is blocked anyway).
    await page.click('#qqBookBtn'); await sleep(500);
    R.steps.s8.afterEmpty = await page.evaluate(() => ({ focused: document.activeElement.id, bad: [...document.querySelectorAll('#qqBookForm .field.bad')].map(f => f.id) }));
    R.shots.push(await shot(page, `${pre}-10-step8-empty-submit`));
    // Type like a person would, to see the keyboard-free layout and the error state clear.
    await page.fill('#qqBName', 'Test Person'); await page.fill('#qqBPhone', '4255550100');
    await page.selectOption('#qqBTown', 'Snohomish'); await page.fill('#qqBStreet', 'Main St');
    await sleep(300);
    R.steps.s8.filled = await fold(page, ['#qqBookBtn']);
    R.shots.push(await shot(page, `${pre}-11-step8-filled-STOP`));
    // Back to the text road.
    await page.click('#step8 .qq-edit'); await sleep(900);
    await page.click('#step7 [data-role="text-instead"]'); await sleep(900);
  } else {
    R.steps.s7 = 'no booking button: calendar did not answer';
  }
  R.steps.s5form = await fold(page, ['#qqName', '#qqPhone', '#qqConsentText', '#qqSubmitBtn', '#qqAmount']);
  R.steps.s5form.tiny = await tapTargets(page);
  R.steps.s5form.focused = await page.evaluate(() => document.activeElement.id);
  R.shots.push(await shot(page, `${pre}-12-text-instead-form`));
  await page.evaluate(() => { document.getElementById('qqName').blur(); });
  await page.click('#qqSubmitBtn'); await sleep(500);
  R.steps.s5form.afterEmpty = await page.evaluate(() => ({ focused: document.activeElement.id, bad: [...document.querySelectorAll('#qqForm .field.bad')].map(f => f.id) }));
  R.shots.push(await shot(page, `${pre}-13-text-form-empty-submit`));
  R.errors = errors;
  await ctx.close();
  return R;
}

(async () => {
  const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:36143' } });
  try {
    if (ONLY === 'all' || ONLY === 'walk') {
      for (const k of ['se', 'ip14', 'android', 'desk']) results['walk_' + k] = await walk(browser, k, 'full');
    }
    if (ONLY === 'all' || ONLY === 'variants') {
      results.walk_se_both = await walk(browser, 'se', 'both');
      results.walk_se_ext = await walk(browser, 'se', 'ext');
      results.walk_se_int = await walk(browser, 'se', 'int');
      results.walk_se_van = await walk(browser, 'se', 'van');
    }
  } finally {
    await browser.close();
  }
  results._blocked = [...new Set(blocked)];
  results._allowedHosts = [...new Set(allowed.map(a => a.split(' ')[0] + ' ' + new URL(a.split(' ')[1]).hostname))];
  fs.writeFileSync(path.join(OUT, `results-${ONLY}.json`), JSON.stringify(results, null, 2));
  console.log('done', Object.keys(results));
})();
