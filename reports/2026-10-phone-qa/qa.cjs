// Phone QA: every sitemap URL at phone sizes. GET only; non-GET requests aborted.
const { chromium } = require('/home/user/mikeysite/social/tools/node_modules/playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'https://mikeysdetailing.com';
const OUT = process.env.OUT || 'qa-live.json';
const sitemap = fs.readFileSync('/home/user/mikeysite/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].replace('https://mikeysdetailing.com', BASE));
const ONLY = process.env.ONLY; // substring filter
(async () => {
  const proxy = BASE.startsWith('http://localhost') ? undefined : { server: process.env.HTTPS_PROXY };
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy });
  const results = [];
  for (const url of urls.filter(u => !ONLY || u.includes(ONLY))) {
    const sizes = [[390, 844], [360, 800]];
    if (/\/$/.test(url) && new URL(url).pathname === '/') sizes.push([375, 667]);
    for (const [w, h] of sizes) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ignoreHTTPSErrors: false });
      const page = await ctx.newPage();
      const r = { url, w, console: [], failed: [], aborted: 0, abortedUrls: new Set() };
      await page.route('**/*', route => { if (route.request().method() !== 'GET') { r.aborted++; r.abortedUrls.add(route.request().url()); return route.abort(); } return route.continue(); });
      page.on('console', m => { if (m.type() !== 'error') return; const lu = (m.location() || {}).url || ''; if (r.abortedUrls.has(lu)) return; r.console.push(m.text().slice(0, 160) + ' @' + lu.slice(0, 120)); });
      page.on('pageerror', e => r.console.push('pageerror: ' + String(e).slice(0, 200)));
      page.on('requestfailed', q => { if (q.method() === 'GET' && !/ERR_BLOCKED_BY_ORB/.test((q.failure()||{}).errorText||'')) r.failed.push(q.url().slice(0, 150) + ' ' + (q.failure() || {}).errorText); });
      page.on('response', s => { if (s.status() >= 400) r.failed.push(s.status() + ' ' + s.url().slice(0, 150)); });
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 45000 });
        // scroll to trigger lazy content
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
        await page.waitForTimeout(800);
        Object.assign(r, await page.evaluate((vw) => {
          const out = {};
          const de = document.documentElement;
          out.scrollW = Math.max(de.scrollWidth, document.body.scrollWidth);
          out.hscroll = out.scrollW > vw + 1;
          const vis = el => { const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
          // clipped by an ancestor with overflow hidden/clip/auto? then not a page-level problem
          const clipped = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) { const pb = p.getBoundingClientRect(); if (pb.right <= vw + 1 && pb.left >= -1) return true; } } return false; };
          const sel = el => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.'); const p = el.parentElement; return (p ? (p.id ? p.tagName.toLowerCase()+'#'+p.id : p.tagName.toLowerCase() + (p.className && typeof p.className==='string' ? '.'+p.className.trim().split(/\s+/)[0] : '')) + '>' : '') + s; };
          out.wide = [];
          for (const el of document.body.querySelectorAll('*')) {
            if (!vis(el)) continue; const b = el.getBoundingClientRect();
            if ((b.right > vw + 1 || b.left < -1) && getComputedStyle(el).position !== 'fixed' && !clipped(el)) out.wide.push(sel(el) + ` [${Math.round(b.left)},${Math.round(b.right)}]`);
          }
          out.wide = out.wide.slice(0, 12);
          out.brokenImg = []; out.noDims = []; out.imgs = [];
          for (const img of document.images) {
            const src = (img.currentSrc || img.src || '').replace(location.origin, '');
            if (img.complete && img.naturalWidth === 0 && src) out.brokenImg.push(src);
            if (!img.getAttribute('width') || !img.getAttribute('height')) out.noDims.push(src || img.outerHTML.slice(0, 80));
            const b = img.getBoundingClientRect();
            out.imgs.push({ src, nw: img.naturalWidth, nh: img.naturalHeight, rw: Math.round(b.width), top: Math.round(b.top + scrollY), loading: img.getAttribute('loading'), fp: img.getAttribute('fetchpriority') });
          }
          out.smallText = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const seen = new Set();
          while (walker.nextNode()) { const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (seen.has(el) || !vis(el)) continue; seen.add(el); const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12) out.smallText.push(`${fs}px ${sel(el)} "${t.textContent.trim().slice(0, 30)}"`); }
          out.smallText = [...new Set(out.smallText)].slice(0, 15);
          out.tap = [];
          const taps = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button],label[for]')].filter(vis);
          for (const el of taps) {
            const b = el.getBoundingClientRect();
            if (b.width >= 44 && b.height >= 44) continue;
            // inline links inside a paragraph of text are exempt (WCAG 2.5.8 inline exception)
            if (el.tagName === 'A' && getComputedStyle(el).display === 'inline' && /^(P|LI|SPAN|TD|EM|STRONG|SMALL)$/.test(el.parentElement.tagName) && el.parentElement.textContent.trim().length > el.textContent.trim().length + 10) continue;
            // crowded: another tap target within 8px
            const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
            const near = taps.some(o => { if (o === el || o.contains(el) || el.contains(o)) return false; const c = o.getBoundingClientRect(); const dx = Math.max(c.left - b.right, b.left - c.right, 0), dy = Math.max(c.top - b.bottom, b.top - c.bottom, 0); return Math.hypot(dx, dy) < 8; });
            if (near) out.tap.push(`${Math.round(b.width)}x${Math.round(b.height)} ${sel(el)} "${(el.textContent||el.value||el.getAttribute('aria-label')||'').trim().slice(0,25)}"`);
          }
          out.tap = [...new Set(out.tap)].slice(0, 15);
          out.fixed = [];
          for (const el of document.body.querySelectorAll('*')) { const s = getComputedStyle(el); if ((s.position === 'fixed' || s.position === 'sticky') && vis(el)) { const b = el.getBoundingClientRect(); out.fixed.push(`${s.position} ${sel(el)} top=${Math.round(b.top)} h=${Math.round(b.height)} w=${Math.round(b.width)}`); } }
          out.bodyPadBottom = getComputedStyle(document.body).paddingBottom;
          return out;
        }, w));
        // fixed bar covering content at the very bottom of the page: scroll to end and see what's under a bottom fixed bar
        r.bottomCover = await page.evaluate(async () => {
          window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 400));
          const bars = [...document.querySelectorAll('body *')].filter(el => { const s = getComputedStyle(el); if (s.position !== 'fixed' || s.display === 'none' || s.visibility === 'hidden') return false; const b = el.getBoundingClientRect(); return b.height > 20 && b.bottom >= innerHeight - 2 && b.top > innerHeight / 2 && b.width > innerWidth * 0.5; });
          if (!bars.length) return null;
          const bar = bars[0].getBoundingClientRect();
          // last meaningful content element: footer's last text
          const els = [...document.querySelectorAll('footer a, footer p, footer small, footer div')].filter(e => e.getBoundingClientRect().height > 0 && !bars[0].contains(e));
          const last = els.map(e => e.getBoundingClientRect().bottom).reduce((a, b) => Math.max(a, b), 0);
          return { barTop: Math.round(bar.top), lastContentBottom: Math.round(last), covered: last > bar.top + 2 };
        });
      } catch (e) { r.error = String(e).slice(0, 200); }
      r.abortedUrls = [...new Set([...r.abortedUrls].map(u => new URL(u).host + new URL(u).pathname))]; results.push(r);
      process.stdout.write(`${w} ${url} hs=${r.hscroll} wide=${(r.wide||[]).length} broken=${(r.brokenImg||[]).length} nodims=${(r.noDims||[]).length} con=${r.console.length} fail=${r.failed.length} small=${(r.smallText||[]).length} tap=${(r.tap||[]).length} cover=${JSON.stringify(r.bottomCover)}${r.error ? ' ERR ' + r.error : ''}\n`);
      await ctx.close();
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  await browser.close();
})();
