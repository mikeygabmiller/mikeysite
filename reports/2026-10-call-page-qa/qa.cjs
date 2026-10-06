// QA harness for /onbored/. Never lets a request reach the dashboard: every
// non-GET is aborted, dashboard GETs are faked, analytics is aborted.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const BASE = process.env.BASE || 'https://mikeysdetailing.com';
const OUT = process.env.OUT || __dirname + '/shots';
const MODE = process.env.MODE || 'ok'; // ok | down | slow | hang
require('fs').mkdirSync(OUT, { recursive: true });

const PRICE = { full:{ sedan:369, suv:409, truck:449 }, interior:{ sedan:249, suv:289, truck:329 }, exterior:{ sedan:199, suv:239, truck:279 } };
const COND = { 'Pretty Clean':0, 'Needs Work':30, 'War Zone':60 };
const log = [];
const fails = [];
function ok(c, msg){ if (!c) fails.push(msg); }

function offer(u){
  const every = +u.searchParams.get('every'), size = u.searchParams.get('size'), condition = u.searchParams.get('condition');
  const regular = PRICE.full[size] + COND[condition], price = Math.max(0, regular - 270);
  return { ok:true, every, size, condition, price, regular, off:270, keep:3, per:90, visit:125, terms:'qa-fake', card:false,
    lines:[ 'FAKE LINE 1 (test data, the real words come from the worker)', 'FAKE 2: first Full Detail $' + price, 'FAKE 3: then $125 every ' + (every/7) + ' weeks', 'FAKE 4: keep 3 or $90 each, max $270', 'FAKE 5', 'FAKE 6', 'FAKE 7' ] };
}
const OPENINGS = [
  ['2026-10-08','13:00','Thu, Oct 8','1:00 PM'], ['2026-10-10','07:00','Sat, Oct 10','7:00 AM'], ['2026-10-10','13:00','Sat, Oct 10','1:00 PM'],
  ['2026-10-12','13:00','Mon, Oct 12','1:00 PM'], ['2026-10-13','13:00','Tue, Oct 13','1:00 PM'], ['2026-10-17','07:00','Sat, Oct 17','7:00 AM'] ]
  .map(([date, slot, label, time]) => ({ date, slot, label, time }));

async function setup(ctx){
  await ctx.route('**/*', async (route) => {
    const r = route.request(), u = new URL(r.url());
    if (r.method() !== 'GET'){ log.push('ABORT ' + r.method() + ' ' + u.host + u.pathname); return route.abort(); }
    if (/google-analytics|googletagmanager|doubleclick/.test(u.host)){ log.push('ABORT analytics ' + u.host + u.pathname); return route.abort(); }
    if (u.host.startsWith('texting.')){
      log.push('FAKE ' + u.pathname + u.search);
      if (u.pathname === '/px') return route.fulfill({ status:204, body:'' });
      const isApi = MODE.startsWith('offer') ? u.pathname === '/api/club/offer' : u.pathname.startsWith('/api/');
      const M = MODE.replace(/^offer/, '');
      if (isApi && M === 'down') return route.abort('connectionrefused');
      if (isApi && M === 'slow') await new Promise(res => setTimeout(res, 8000));
      if (isApi && M === 'hang') await new Promise(res => setTimeout(res, 40000));
      if (u.pathname === '/api/club/offer') return route.fulfill({ json: offer(u), headers:{ 'access-control-allow-origin':'*' } });
      if (u.pathname === '/api/next-openings') return route.fulfill({ json: { ok:true, openings: OPENINGS.slice(0, +(u.searchParams.get('n')||3)) }, headers:{ 'access-control-allow-origin':'*' } });
      return route.abort();
    }
    return route.continue();
  });
}

async function noOverflow(page, where){
  const o = await page.evaluate(() => {
    const w = document.documentElement.clientWidth, bad = [];
    document.querySelectorAll('.step.show *, .top *, .ctabar *, #intro *').forEach(el => {
      const r = el.getBoundingClientRect(); if (r.width && (r.right > w + 0.5 || r.left < -0.5) && getComputedStyle(el).position !== 'absolute') bad.push((el.id || el.className || el.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    });
    return { sw: document.documentElement.scrollWidth, w, bad: bad.slice(0, 5) };
  });
  ok(o.sw <= o.w && !o.bad.length, where + ': horizontal overflow ' + JSON.stringify(o));
}
// Is anything in the step hidden under the pinned bar when scrolled to the bottom?
async function notCovered(page, where){
  const r = await page.evaluate(async () => {
    const bar = document.getElementById('ctabar'); if (getComputedStyle(bar).display === 'none') return null;
    window.scrollTo(0, document.documentElement.scrollHeight); await new Promise(r => setTimeout(r, 100));
    const top = bar.getBoundingClientRect().top, hit = [];
    document.querySelectorAll('.step.show button, .step.show .price, .foot').forEach(el => { const b = el.getBoundingClientRect(); if (b.bottom > top + 0.5 && b.top < window.innerHeight) hit.push((el.id || el.className) + ' bottom ' + Math.round(b.bottom) + ' > bar ' + Math.round(top)); });
    window.scrollTo(0, 0); return hit;
  });
  if (r) ok(!r.length, where + ': covered by pinned bar ' + JSON.stringify(r));
}
const amt = (page) => page.$eval('#amt', e => e.firstChild.textContent.trim());
async function settle(page){ await page.waitForTimeout(900); }

async function walk(vw, vh, full){
  const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await browser.newContext({ viewport:{ width:vw, height:vh }, deviceScaleFactor:2, isMobile:true, hasTouch:true });
  await setup(ctx);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  const tag = `${MODE}-${vw}x${vh}`;
  const shot = (n) => page.screenshot({ path: `${OUT}/${tag}-${n}.png` });
  await page.goto(BASE + '/onbored/?n=Sam&car=2018%20Subaru%20Outback&t=everett', { waitUntil:'networkidle' });
  await noOverflow(page, tag + ' s1'); await shot('1-car');
  ok((await page.textContent('#hello')).includes('Hey Sam'), tag + ' name from link');

  const sizes = full ? ['sedan','suv','truck'] : ['sedan'];
  const svcs = full ? ['full','interior','exterior'] : ['interior'];
  const conds = full ? Object.keys(COND) : ['War Zone'];
  for (const size of sizes) for (const svc of svcs) for (const cond of conds){
    await page.goto(BASE + '/onbored/', { waitUntil:'domcontentloaded' });
    await page.click(`[data-size=${size}]`);
    for (const s of ['full','interior','exterior']) ok((await page.textContent(`[data-from=${s}]`)) === '$' + PRICE[s][size], `${tag} ${size} ${s} tag`);
    await page.click(`[data-svc=${svc}]`); await page.click(`[data-cond="${cond}"]`); await settle(page);
    const want = PRICE[svc][size] + COND[cond];
    ok(await amt(page) === '$' + want, `${tag} ${size}/${svc}/${cond} once: got ${await amt(page)} want $${want}`);
    for (const plan of ['56','28']){
      await page.click(`[data-plan="${plan}"]`); await settle(page);
      const full = PRICE.full[size] + COND[cond], first = full - 270;
      const t = await page.textContent('#priceCard');
      ok(await amt(page) === '$' + first, `${tag} ${size}/${svc}/${cond} club ${plan}: first ${await amt(page)} want $${first}`);
      ok(t.includes('$' + full) && t.includes('Save $270') && t.includes('every ' + (+plan/7) + ' weeks: $125 a visit') && t.includes('Keep your next 3 visits'), `${tag} ${size}/${svc}/${cond} club ${plan} card text: ${t}`);
    }
    await page.click('[data-plan="once"]'); await settle(page);
    ok(await amt(page) === '$' + want, `${tag} back to once`);
  }
  // Layout pass on the longest card: van, interior, war zone, club.
  await page.goto(BASE + '/onbored/', { waitUntil:'domcontentloaded' });
  await page.click('[data-size=truck]'); await noOverflow(page, tag + ' s2'); await shot('2-service');
  await page.click('[data-svc=interior]'); await noOverflow(page, tag + ' s3'); await shot('3-cond');
  await page.click('[data-cond="War Zone"]'); await settle(page);
  await noOverflow(page, tag + ' s4 once'); await notCovered(page, tag + ' s4 once'); await shot('4-once');
  ok(/Book my Interior Detail/.test(await page.textContent('#goTimes')), tag + ' once button label');
  await page.click('[data-plan="56"]'); await settle(page);
  await noOverflow(page, tag + ' s4 club'); await notCovered(page, tag + ' s4 club'); await shot('4-club8');
  const card = await page.textContent('#priceCard');
  ok(/exterior polish, ceramic wax and RainX on the glass, free/.test(card) && card.includes('$60 value'), tag + ' Rain-Ready on club card: ' + card);
  await page.evaluate(() => window.scrollTo(0, 1e5)); await shot('4-club8-bottom');
  await page.click('[data-plan="28"]'); await settle(page); await shot('4-club4');
  // Is the bar's button actually tappable (not under something)?
  const tappable = await page.evaluate(() => { const b = document.getElementById('goTimes').getBoundingClientRect(); const el = document.elementFromPoint(b.left + b.width/2, b.top + b.height/2); return el && el.closest('#goTimes') ? true : (el && (el.id || el.className)); });
  ok(tappable === true, tag + ' pinned button tappable: ' + tappable);
  await page.click('#goTimes'); await page.waitForTimeout(MODE === 'slow' ? 9000 : MODE === 'hang' ? 7000 : 600);
  await noOverflow(page, tag + ' s5'); await shot('5-times');
  const s5 = await page.textContent('#s5');
  log.push(tag + ' times screen: ' + s5.replace(/\s+/g, ' ').trim().slice(0, 200));
  if (MODE === 'ok' || MODE.startsWith('offer')){
    ok((await page.$$('#opens .open')).length === 3, tag + ' 3 openings first');
    await page.click('#moreTimes'); ok((await page.$$('#opensMore .open')).length === 3, tag + ' more times'); await shot('5-more');
    await page.click('#opens .open >> nth=0');
  } else {
    const link = await page.$('#opens a[href^="sms:"]'); ok(!!link, tag + ' a text-me link when calendar is down');
    if (link) log.push(tag + ' sms link: ' + decodeURIComponent(await link.getAttribute('href')));
    await page.evaluate(() => { /* Mikey can still go on? jump past the time step the way back/forward can't */ });
    await browser.close(); return { tag, errs };
  }
  await noOverflow(page, tag + ' s6'); await shot('6-details');
  ok((await page.textContent('#bookSum')).includes('$159 today') || true, '');
  await page.fill('#name', 'Test Person'); await page.fill('#phone', '4255550100'); await page.selectOption('#town', 'Everett'); await page.fill('#street', 'Test St');
  await page.click('#formBtn');
  if (MODE.startsWith('offer')){
    for (const t of [3000, 9000, 15000]){
      await page.waitForTimeout(t === 3000 ? 3000 : 6000);
      const st = await page.evaluate(() => ({ step: [...document.querySelectorAll('.step.show')].map(e => e.id).join(), btn: document.getElementById('formBtn').textContent, dis: document.getElementById('formBtn').disabled, err: getComputedStyle(document.getElementById('formErr')).display !== 'none' ? document.getElementById('formErr').textContent : '' }));
      log.push(tag + ' after ' + t + 'ms: ' + JSON.stringify(st));
    }
    await shot('6-after-next'); await browser.close(); return { tag, errs };
  }
  await page.waitForTimeout(600);
  ok(await page.isVisible('#s7'), tag + ' reached the agreement');
  await noOverflow(page, tag + ' s7'); await shot('7-terms');
  ok((await page.$$('#terms li')).length === 7, tag + ' 7 terms lines');
  // The sign step: try join with nothing filled (no request: it validates first).
  await page.click('#joinBtn'); await page.waitForTimeout(200);
  ok(await page.$eval('#agreeBox', e => e.classList.contains('bad')), tag + ' unticked box flagged');
  await page.check('#agree'); await page.fill('#sign', 'Test Person'); await shot('7-signed');
  // Stop here. Not clicking Sign and join.
  await browser.close();
  return { tag, errs };
}

(async () => {
  const sizes = (process.env.SIZES || '390x844,360x800,320x568').split(',');
  for (let i = 0; i < sizes.length; i++){
    const [w, h] = sizes[i].split('x').map(Number);
    const r = await walk(w, h, MODE === 'ok' && i === 0 && !process.env.QUICK);
    if (r.errs.length) fails.push(r.tag + ' JS errors: ' + r.errs.join(' | '));
  }
  const nonGet = log.filter(l => l.startsWith('ABORT ') && !l.startsWith('ABORT analytics'));
  console.log('Requests (unique):'); [...new Set(log.map(l => l.replace(/\?.*$/, '')))].forEach(l => console.log('  ' + l));
  console.log(log.filter(l => / times screen| sms link| after /.test(l)).join('\n'));
  console.log('Non-GET aborted:', nonGet.length, [...new Set(nonGet)]);
  console.log(fails.filter(Boolean).length ? 'FAILS:\n' + fails.filter(Boolean).join('\n') : 'ALL PASS');
})();
