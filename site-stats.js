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
