/* ============================================================
   MIKEY'S MOBILE DETAILING - SITE STATS
   ------------------------------------------------------------
   ★ THIS IS THE ONLY PLACE YOU EDIT THESE NUMBERS. ★
   Change a number below and it updates automatically on EVERY
   page of the site: the visible counts, the Google search
   description, and the star-rating schema.

   When you get a new Google review, just bump reviewCount.

   ⚠️ ALSO update the hard-coded numbers in the HTML when you do.
   This file rewrites the visible counts and the JSON-LD *in the
   browser*. Google runs JavaScript, but most AI crawlers (GPTBot,
   PerplexityBot, ClaudeBot, …) do NOT — they only ever see the raw
   HTML. So the values baked into each page are the ones AI assistants
   quote. Keep them in sync, or ChatGPT will keep telling people you
   have an out-of-date review count. See GROWTH-PLAN.md §1 (G6).
   ============================================================ */
window.MD_STATS = {
  reviewCount: 41,    // ← number of Google reviews   (update this one!)
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
   FIRST-PARTY BEHAVIOUR TRACKING → the dashboard's Journey tab
   ------------------------------------------------------------
   Two things go out from here, and they do different jobs:

   1. The 1×1 GIF ping (unchanged) — feeds the day counters that
      Grow → Website has always drawn. How many people came.

   2. A batched event POST — feeds Grow → Journey. What ONE person
      actually did: which sections they scrolled to, which buttons
      they pushed, how far down they got, how long they stayed.

   Both carry a VISITOR ID that lives only in this browser's
   localStorage. It identifies nobody. When the customer fills out
   the quote or booking form, that same id rides along with the
   lead, and THAT is the only moment an anonymous path becomes
   "this is what Sarah did before she texted." Clearing site data
   breaks the link, by design.

   Everything here is auto-instrumented — sections are found by
   their aria-label / id / heading, buttons by their own text — so
   the 30-odd pages on this site are covered without touching one
   of them. Mark anything by hand with data-track="Some name" when
   the automatic label reads badly.

   Nothing in this block may ever throw into the page. A detailing
   site that won't load because analytics broke is a catastrophe;
   missing analytics is a Tuesday.
   ============================================================ */
(function () {
  var BASE = 'https://texting.mikeysdetailingsnohomish.workers.dev';
  var LIVE = /(^|\.)mikeysdetailing\.com$/i.test(location.hostname);

  // ---- visitor id ----------------------------------------------------------
  var vid = '';
  try {
    vid = localStorage.getItem('md_vid') || '';
    if (!vid) {
      vid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('md_vid', vid);
    }
  } catch (e) { /* private mode — the site works, there's just no journey */ }
  window.MD_VID = vid;

  // ---- the day counters, plus the one fact only the landing URL knows ------
  // A paid Google click and a free Google search click arrive with the exact
  // same referrer, so for as long as this sent the bare pathname the dashboard
  // had no way to tell them apart and filed every ad click under "Found you on
  // Google". The proof is the click id the ad platform staples onto its own
  // landing URL — gclid, msclkid, fbclid — and that lives in the query string.
  //
  // It goes out on `q`, not glued onto `p`: the worker caps `p` at 120 chars,
  // and a gclid is long enough to push a city page's path past that and get the
  // id chopped in half. `q` is uncapped and the worker reads either one.
  try {
    if (LIVE) {
      var img = new Image();
      img.src = BASE + '/px?p=' + encodeURIComponent(location.pathname) +
        (location.search ? '&q=' + encodeURIComponent(location.search) : '') +
        '&r=' + encodeURIComponent(document.referrer) +
        (vid ? '&v=' + encodeURIComponent(vid) : '') + '&t=' + Date.now();
    }
  } catch (e) { /* never break the page over analytics */ }

  if (!vid) return;                       // no id, no journey — nothing to send

  // ---- the event queue -----------------------------------------------------
  // Events batch and go out together. One request per flush, not per click:
  // a person who taps six things costs one POST, not six.
  var Q = [], t0 = Date.now(), depth = 0, sent = false, timer = null;
  var PAGE = location.pathname;

  function push(kind, label, detail) {
    if (Q.length > 60) return;            // a rage-clicker can't flood the queue
    Q.push({ t: Date.now(), k: kind,
             l: String(label == null ? '' : label).replace(/\s+/g, ' ').trim().slice(0, 60),
             d: String(detail == null ? '' : detail).replace(/\s+/g, ' ').trim().slice(0, 80) });
    // Anything the customer DID goes out promptly — if they tap "Book" and the
    // page navigates away, that tap is the whole story and must not be lost.
    if (kind === 'c' || kind === 'f') schedule(1200);
    else schedule(8000);
  }
  function schedule(ms) {
    if (timer) return;
    timer = setTimeout(function () { timer = null; flush(false); }, ms);
  }
  function flush(final) {
    if (timer) { clearTimeout(timer); timer = null; }
    if (final) {
      if (sent) return;                   // pagehide + visibilitychange both fire
      sent = true;
      push('x', 'Left the page', Math.round((Date.now() - t0) / 1000) + 's · ' + depth + '% down');
    }
    if (!Q.length || !LIVE) { Q = []; return; }
    var body = JSON.stringify({ v: vid, p: PAGE, e: Q });
    Q = [];
    try {
      // text/plain keeps this a "simple" request — no CORS preflight, and
      // sendBeacon survives the page being closed mid-flight.
      var blob = new Blob([body], { type: 'text/plain;charset=UTF-8' });
      if (navigator.sendBeacon && navigator.sendBeacon(BASE + '/px/e', blob)) return;
    } catch (e) { /* fall through to fetch */ }
    try {
      fetch(BASE + '/px/e', { method: 'POST', body: body, keepalive: true,
        headers: { 'Content-Type': 'text/plain' }, mode: 'no-cors' });
    } catch (e) { /* dropped — analytics is never worth an error */ }
  }

  // ---- what a thing is called ---------------------------------------------
  // In order of how much the label was meant for a human: an explicit
  // data-track wins, then the accessible name, then the visible text.
  function labelFor(el) {
    if (!el) return '';
    var d = el.getAttribute('data-track');
    if (d) return d;
    var al = el.getAttribute('aria-label');
    if (al) return al;
    var by = el.getAttribute('aria-labelledby');
    if (by) {
      var t = document.getElementById(by.split(/\s+/)[0]);
      if (t && t.textContent.trim()) return t.textContent.trim();
    }
    var txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (txt) return txt.slice(0, 60);
    var h = el.querySelector && el.querySelector('h1,h2,h3');
    if (h && h.textContent.trim()) return h.textContent.trim().slice(0, 60);
    return el.id || el.className || '';
  }

  // ---- clicks --------------------------------------------------------------
  // Delegated and capturing, so it still records when the handler on the button
  // stops propagation or navigates away.
  var lastClick = '', lastClickAt = 0;
  document.addEventListener('click', function (ev) {
    try {
      var el = ev.target && ev.target.closest &&
        ev.target.closest('a,button,[role="button"],.btn,input[type="submit"],[data-track]');
      if (!el) return;
      var name = labelFor(el) || 'Button';
      // A double-tap is one intent, not two.
      if (name === lastClick && Date.now() - lastClickAt < 1000) return;
      lastClick = name; lastClickAt = Date.now();
      var href = el.getAttribute('href') || '';
      var what = /^tel:/i.test(href) ? 'Tapped to CALL'
               : /^sms:/i.test(href) ? 'Tapped to TEXT'
               : /^mailto:/i.test(href) ? 'Tapped to email' : '';
      push('c', what || name, what ? name : href);
    } catch (e) { /* a click must never fail because of tracking */ }
  }, true);

  // ---- which parts of the page they actually reached -----------------------
  // A section counts as "seen" once half of it has been on screen. Reported
  // once each — the interesting fact is that they got there, not how many
  // times it crossed the fold while they scrolled around.
  try {
    if (window.IntersectionObserver) {
      var seen = {};
      var io = new IntersectionObserver(function (rows) {
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (!r.isIntersecting) continue;
          var name = labelFor(r.target) || r.target.id;
          if (!name || seen[name]) continue;
          seen[name] = 1;
          push('s', name);
          io.unobserve(r.target);
        }
      }, { threshold: 0.5 });
      var secs = document.querySelectorAll('section,[data-track-section],main > div[id]');
      for (var i = 0; i < secs.length && i < 40; i++) io.observe(secs[i]);
    }
  } catch (e) { /* no section tracking, everything else still works */ }

  // ---- how far down they got ----------------------------------------------
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      try {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (h > 0) {
          var pct = Math.round(((window.scrollY || window.pageYOffset) / h) * 100);
          if (pct > depth) depth = Math.max(0, Math.min(100, pct));
        }
      } catch (e) { /* ignore */ }
    });
  }, { passive: true });

  // ---- the page ending -----------------------------------------------------
  // Both events, because iOS fires one and desktop the other, and `sent`
  // guards against counting the exit twice.
  window.addEventListener('pagehide', function () { flush(true); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush(true);
  });

  // ---- the public hook the forms use --------------------------------------
  // window.MDTrack('Picked a service', 'Full Detail') from the quote flow, so
  // form progress lands on the same timeline as everything else.
  window.MDTrack = function (label, detail) { try { push('f', label, detail); } catch (e) {} };

  push('v', 'Landed on the page', document.referrer || '');
})();

/* ============================================================
   TAP-TO-CALL / TEXT → GA4, AND EVERY CONVERSION → GOOGLE ADS
   ------------------------------------------------------------
   GA4 has always seen the phone taps. Google Ads never has, and
   that is the expensive half. A Search campaign with no conversion
   signal cannot bid toward anything except the click itself, so it
   buys the cheapest click rather than the one that books a job —
   and the "Conversions" column reads 0 forever, which looks like
   the ads failing when it only means nothing was counted.

   Two conversions get sent from here:
     - a tapped call or text, on every page that loads this file
     - a submitted quote, with its dollar total, on the pages that
       carry the calculator

   PASTE THE THREE VALUES BELOW AND IT STARTS WORKING. Leave them
   blank and this block does nothing whatsoever — no config call,
   no events, not one extra request — so the site is never worse
   off for the code sitting here unset.

   Where the values come from: Google Ads → Goals → Conversions →
   the conversion action → "Tag setup" → "Use Google Tag Manager".
   Google prints a Conversion ID (AW-…) and a Conversion label.
   ADS_LEAD and ADS_QUOTE are those two joined with a slash, which
   is the exact form the send_to field wants.

   Count setting matters as much as the tag: in the Ads UI a lead
   conversion should be set to count "One" per click. On "Every",
   one indecisive person submitting three quotes reads to the bidder
   as three booked jobs and it will go chase more of him.

   Nothing here fires anywhere but the live domain. A conversion
   logged from a local copy or a preview is a real number in a real
   bidding algorithm, and it never washes back out.
   ============================================================ */
(function () {
  var ADS_ID    = 'AW-16856115492';                          // Conversion ID
  var ADS_LEAD  = 'AW-16856115492/pCPGCP69oO0cEKTSz-U-';     // tapped call or text
  var ADS_QUOTE = '';   // 'AW-XXXXXXXXX/MnO-P_qrStUvWx' — quote submitted

  var LIVE = /(^|\.)mikeysdetailing\.com$/i.test(location.hostname);

  // Captured before the wrapper further down is installed, so a conversion this
  // file sends never travels back through the wrapper that sent it.
  var baseGtag = typeof window.gtag === 'function' ? window.gtag : null;
  function rawGtag() {
    return baseGtag || (typeof window.gtag === 'function' ? window.gtag : null);
  }

  // The Ads destination rides the gtag.js the GA4 snippet already loaded — one
  // tag file, two destinations, no second script to download.
  try {
    if (ADS_ID && LIVE && rawGtag()) rawGtag()('config', ADS_ID);
  } catch (e) { /* ignore */ }

  // send_to is the whole trick: it routes the event to the Ads account instead
  // of leaving it as one more GA4 event nobody bids on.
  function adsConvert(sendTo, value) {
    if (!sendTo || !LIVE) return;
    var g = rawGtag();
    if (!g) return;
    var params = { send_to: sendTo };
    if (value > 0) { params.value = value; params.currency = 'USD'; }
    try { g('event', 'conversion', params); } catch (e) { /* ignore */ }
  }

  // ---- tapped call or text -------------------------------------------------
  // The GA4 and Clarity events are unchanged; the Ads conversion is new.
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
    } catch (err) { /* ignore */ }
    try {
      if (typeof clarity === 'function') { clarity('event', 'lead_' + method); }
    } catch (err) { /* ignore */ }
    adsConvert(ADS_LEAD, 0);
  }, true);

  // ---- a submitted quote ---------------------------------------------------
  // The calculator already fires `qqc_submission` carrying the dollar total.
  // Rather than edit the pages that have a form today — and remember to edit
  // the next one that grows one — this listens to gtag itself and mirrors the
  // single event that means money. Same bargain as the section and button
  // tracking above: instrument once here, cover every page without touching it.
  //
  // GA4 is called first and its return value handed straight back, so the
  // existing reporting behaves exactly as it did before this wrapper existed.
  if (ADS_QUOTE) {
    var prev = window.gtag;
    if (typeof prev === 'function') {
      window.gtag = function () {
        var out = prev.apply(this, arguments);
        try {
          if (arguments[0] === 'event' && arguments[1] === 'qqc_submission') {
            var d = arguments[2] || {};
            adsConvert(ADS_QUOTE, Number(d.value) || 0);
          }
        } catch (e) { /* a mirrored conversion never breaks the real one */ }
        return out;
      };
    }
  }
})();
