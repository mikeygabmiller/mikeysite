/* ============================================================
   MIKEY'S MOBILE DETAILING - SITE STATS
   ------------------------------------------------------------
   ★ THIS IS THE ONLY PLACE YOU EDIT THESE NUMBERS. ★
   Change a number below and it updates automatically on EVERY
   page of the site: the visible counts, the Google search
   description, and the star-rating schema.

   When you get a new Google review, just bump reviewCount.
   ============================================================ */
window.MD_STATS = {
  reviewCount: 39,    // ← number of Google reviews   (update this one!)
  rating: "5.0",      // ← average star rating
  carsDetailed: 300   // ← cars detailed
};

/* --- No need to edit anything below this line. --- */
(function () {
  var s = window.MD_STATS;

  function apply() {
    // 1) Visible numbers. Mark any element with a data attribute, e.g.
    //    <span data-md-reviews="{n}+">38+</span>  →  "{n}" becomes the number.
    [['data-md-reviews', s.reviewCount],
     ['data-md-rating',  s.rating],
     ['data-md-cars',    s.carsDetailed]].forEach(function (pair) {
      var nodes = document.querySelectorAll('[' + pair[0] + ']');
      Array.prototype.forEach.call(nodes, function (el) {
        var tmpl = el.getAttribute(pair[0]);
        el.textContent = (tmpl && tmpl.indexOf('{n}') > -1)
          ? tmpl.replace('{n}', pair[1])
          : String(pair[1]);
      });
    });

    // 2) Search-result descriptions: swap the number that sits before "review".
    ['meta[name="description"]',
     'meta[property="og:description"]',
     'meta[name="twitter:description"]'].forEach(function (sel) {
      var metas = document.querySelectorAll(sel);
      Array.prototype.forEach.call(metas, function (m) {
        if (m.content) {
          m.content = m.content.replace(
            /\b\d+(\+?\s*(?:five-star\s+|Google\s+)?reviews?)/i,
            s.reviewCount + '$1');
        }
      });
    });

    // 3) Structured data (Google rich snippets): set reviewCount everywhere.
    var blocks = document.querySelectorAll('script[type="application/ld+json"]');
    Array.prototype.forEach.call(blocks, function (sc) {
      try {
        var data = JSON.parse(sc.textContent), changed = false;
        (function walk(o) {
          if (o && typeof o === 'object') {
            for (var k in o) {
              if (k === 'reviewCount') { o[k] = String(s.reviewCount); changed = true; }
              else walk(o[k]);
            }
          }
        })(data);
        if (changed) sc.textContent = JSON.stringify(data);
      } catch (e) { /* leave this block untouched if it can't be parsed */ }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();

/* ============================================================
   FIRST-PARTY VISIT BEACON → the SMS dashboard's built-in
   analytics (Grow → Website tab). One image ping per page load.
   No cookies, no third party — the Worker hashes the IP for a
   same-day unique count and never stores it. Only fires on the
   live site so local previews don't pollute the numbers.
   ============================================================ */
(function () {
  try {
    if (!/(^|\.)mikeysdetailing\.com$/i.test(location.hostname)) return;
    var img = new Image();
    img.src = 'https://texting.mikeysdetailingsnohomish.workers.dev/px?p=' +
      encodeURIComponent(location.pathname) + '&r=' +
      encodeURIComponent(document.referrer) + '&t=' + Date.now();
  } catch (e) { /* never break the page over analytics */ }
})();

/* ============================================================
   SCROLL-DEPTH + SECTION-REACH TRACKING
   ------------------------------------------------------------
   WHY THIS EXISTS
   GA4's built-in "Enhanced measurement" scroll tracking fires
   exactly ONE event, at 90% depth. That tells you almost nothing
   — you can't see who reached 25%, 50% or 75%, and you can't see
   which SECTION people stopped at. This adds both.

   WHAT IT SENDS
     scroll_depth   { percent_scrolled: 25|50|75|90|100 }
     section_view   { section_name: "offer", section_pct: 40 }
     scroll_summary { max_percent, deepest_section }  ← on exit
   ...to GA4, plus Clarity tags so you can filter session
   recordings and heatmaps by how far someone got.

   ─────────────────────────────────────────────────────────────
   HOW TO SEE IT — three ways, easiest first
   ─────────────────────────────────────────────────────────────
   1) ON YOUR PHONE, RIGHT NOW (no waiting, no dashboard):
        open  mikeysdetailing.com/?scrollcheck
      A little panel sticks to the bottom of the screen showing
      your live scroll %, and it lights up each section as you
      reach it. Best way to sanity-check the page yourself.

   2) GA4 → Reports → Engagement → Events
      Look for `scroll_depth` and `section_view`. The one number
      that matters: how many people fire section_view for
      "offer" vs how many fired it for "hero". That ratio is the
      share of visitors who actually reach the countdown deal.

   3) Microsoft Clarity → Recordings → Filters → Custom tags
      Filter by `max_scroll` or `deepest_section` to watch
      recordings of only the people who bailed early.

   To tag a section, add data-md-section="name" to it. Nothing
   else to wire up.
   ============================================================ */
(function () {
  var MILESTONES = [25, 50, 75, 90, 100];
  var firedDepth = {};
  var firedSection = {};
  var maxPct = 0;
  var deepest = '';
  var deepestPct = -1;

  // Analytics only on the live site, so local previews and
  // Mikey's own testing don't pollute the numbers. The visual
  // overlay (?scrollcheck) still works anywhere.
  var LIVE = /(^|\.)mikeysdetailing\.com$/i.test(location.hostname);

  function ga(name, params) {
    if (!LIVE) return;
    try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (e) {}
  }
  function tag(k, v) {
    if (!LIVE) return;
    try { if (typeof clarity === 'function') clarity('set', k, String(v)); } catch (e) {}
  }

  function docHeight() {
    var d = document.documentElement, b = document.body;
    return Math.max(b.scrollHeight, d.scrollHeight, b.offsetHeight, d.offsetHeight) || 1;
  }

  function currentPct() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var scrollable = docHeight() - vh;
    if (scrollable <= 0) return 100;              // page fits on one screen
    var p = ((window.scrollY || window.pageYOffset) / scrollable) * 100;
    return Math.max(0, Math.min(100, Math.round(p)));
  }

  function onScroll() {
    var p = currentPct();
    if (p > maxPct) maxPct = p;
    for (var i = 0; i < MILESTONES.length; i++) {
      var m = MILESTONES[i];
      if (p >= m && !firedDepth[m]) {
        firedDepth[m] = 1;
        ga('scroll_depth', { percent_scrolled: m, page_path: location.pathname });
      }
    }
    tag('max_scroll', Math.floor(maxPct / 25) * 25);   // bucketed: 0/25/50/75/100
  }

  // rAF-throttled so this never costs scroll performance.
  var ticking = false;
  function schedule() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }

  function start() {
    var sections = [].slice.call(document.querySelectorAll('[data-md-section]'));

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    onScroll();

    if (sections.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var name = en.target.getAttribute('data-md-section');
          if (!name || firedSection[name]) return;
          firedSection[name] = 1;

          var top = en.target.getBoundingClientRect().top + (window.scrollY || 0);
          var pct = Math.round((top / docHeight()) * 100);
          if (pct > deepestPct) { deepestPct = pct; deepest = name; }

          ga('section_view', { section_name: name, section_pct: pct, page_path: location.pathname });
          tag('deepest_section', deepest);
          render();
        });
      }, { threshold: 0.01, rootMargin: '0px 0px -15% 0px' });
      sections.forEach(function (s) { io.observe(s); });
    }

    // One summary on the way out — milestone events alone are lossy
    // when someone closes the tab mid-scroll.
    var sent = false;
    function summary() {
      if (sent || !LIVE) return;
      sent = true;
      ga('scroll_summary', {
        max_percent: maxPct,
        deepest_section: deepest || 'none',
        page_path: location.pathname
      });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') summary();
    });
    window.addEventListener('pagehide', summary);

    if (/[?&]scrollcheck\b/.test(location.search)) buildOverlay(sections);
  }

  /* ---------- the ?scrollcheck overlay ---------- */
  var panel, pctEl, listEl;
  function buildOverlay(sections) {
    panel = document.createElement('div');
    panel.setAttribute('role', 'status');
    panel.style.cssText =
      'position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;' +
      'background:rgba(12,12,12,.96);color:#fff;border:1px solid #C8102E;' +
      'border-radius:12px;padding:10px 12px;font:12px/1.35 system-ui,-apple-system,sans-serif;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.6);max-height:44vh;overflow:auto;' +
      '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)';

    var head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px';
    pctEl = document.createElement('b');
    pctEl.style.cssText = 'font-size:15px;color:#fff';
    var close = document.createElement('button');
    close.textContent = 'close';
    close.style.cssText = 'background:#C8102E;border:0;color:#fff;border-radius:6px;padding:4px 9px;font-size:11px;font-weight:700;cursor:pointer';
    close.onclick = function () { panel.remove(); };
    head.appendChild(pctEl);
    head.appendChild(close);

    listEl = document.createElement('div');
    listEl.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:2px 10px';

    panel.appendChild(head);
    panel.appendChild(listEl);
    document.body.appendChild(panel);

    panel._sections = sections;
    window.addEventListener('scroll', render, { passive: true });
    render();
  }

  function render() {
    if (!panel) return;
    var h = docHeight();
    pctEl.textContent = 'Scroll ' + currentPct() + '%  ·  max ' + maxPct + '%  ·  page ' +
      (h / (window.innerHeight || 1)).toFixed(1) + ' screens';
    listEl.innerHTML = '';
    (panel._sections || []).forEach(function (s) {
      var name = s.getAttribute('data-md-section');
      var top = s.getBoundingClientRect().top + (window.scrollY || 0);
      var pct = Math.round((top / h) * 100);
      var seen = !!firedSection[name];

      var a = document.createElement('span');
      a.textContent = (seen ? '✓ ' : '· ') + name;
      a.style.color = seen ? '#4ade80' : '#8b8b90';

      var b = document.createElement('span');
      b.textContent = pct + '%';
      // Red once a section sits past the ~55% median mobile scroll depth.
      b.style.color = pct > 55 ? '#ff6b6b' : '#8b8b90';

      listEl.appendChild(a);
      listEl.appendChild(b);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ============================================================
   TAP-TO-CALL / TEXT CONVERSION TRACKING
   Fires a GA4 `generate_lead` event whenever anyone taps a
   tel: or sms: link, on ANY page (home or city landing pages).
   Lets you see calls/texts as conversions, not just form fills.
   ============================================================ */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="sms:"]');
    if (!a) return;
    var method = a.getAttribute('href').indexOf('sms:') === 0 ? 'text' : 'call';
    try {
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          method: method,
          page_path: location.pathname
        });
      }
    } catch (e) { /* ignore */ }
    try {
      if (typeof clarity === 'function') { clarity('event', 'lead_' + method); }
    } catch (e) { /* ignore */ }
  }, true);
})();
