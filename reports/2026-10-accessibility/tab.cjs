const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  let blocked = 0;
  await ctx.route('**/*', r => { if (r.request().method() !== 'GET') { blocked++; return r.abort(); } return r.continue(); });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8099/', { waitUntil: 'load' }); await p.waitForTimeout(800);
  // first Tab must land on the skip link
  await p.keyboard.press('Tab');
  console.log('first stop:', await p.evaluate(() => document.activeElement.className + ' ' + document.activeElement.textContent.trim()));
  // start just before the calculator
  await p.evaluate(() => { const s = document.getElementById('booking'); s.setAttribute('tabindex','-1'); s.focus(); });
  const seen = []; const done = { vehicle:0, service:0, condition:0 }; let priceSeen = false, after = 0, invisible = [];
  for (let i = 0; i < 160; i++) {
    await p.keyboard.press('Tab'); await p.waitForTimeout(60);
    const info = await p.evaluate(() => {
      const e = document.activeElement; const cs = getComputedStyle(e);
      const vis = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
      const r = e.getBoundingClientRect();
      return { tag: e.tagName, id: e.id, role: e.dataset.role || '', step: e.closest('.step')?.id || '', inCalc: !!e.closest('#booking'), txt: (e.getAttribute('aria-label') || e.textContent || e.placeholder || '').trim().replace(/\s+/g,' ').slice(0,40), vis, onscreen: r.width > 0 && r.height > 0, disabled: e.disabled, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0,50) };
    });
    seen.push(info);
    if (info.inCalc && !info.vis) invisible.push(info);
    if (!info.inCalc && priceSeen) { after++; if (after > 2) break; }
    const k = info.role;
    if (['vehicle','service','condition'].includes(k) && !done[k]) { await p.keyboard.press(k === 'vehicle' ? 'Enter' : 'Space'); done[k] = 1; await p.waitForTimeout(400); }
    if (info.id === 'qqYmm') await p.keyboard.type('2016 Honda Civic');
    if (info.id === 'qqLocation') await p.keyboard.type('Snohomish');
    if (info.tag === 'BUTTON' && /Continue|See my (price|quote)/i.test(info.txt) && !/Back/.test(info.txt) && info.step !== 'step5') { await p.keyboard.press('Enter'); await p.waitForTimeout(600); }
    if (info.id === 'qqPickTime') priceSeen = true;
  }
  for (const s of seen) console.log((s.vis ? ' ' : '!') + (s.onscreen ? ' ' : 'H'), s.step.padEnd(6), s.tag, s.id || s.role, '|', s.txt, s.vis ? '' : '| ' + s.outline + ' / ' + s.shadow);
  console.log('price screen reached:', priceSeen, '| focus left calc after:', after, '| non-GET blocked:', blocked, '| no visible focus in calc:', invisible.length);
  await p.screenshot({ path: __dirname + '/tab-price.png' });
  await b.close();
})();
