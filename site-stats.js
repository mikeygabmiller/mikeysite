/* ============================================================
   MIKEY'S MOBILE DETAILING — SITE STATS
   ------------------------------------------------------------
   ★ THIS IS THE ONLY PLACE YOU EDIT THESE NUMBERS. ★
   Change a number below and it updates automatically on EVERY
   page of the site: the visible counts, the Google search
   description, and the star-rating schema.

   When you get a new Google review, just bump reviewCount.
   ============================================================ */
window.MD_STATS = {
  reviewCount: 38,    // ← number of Google reviews   (update this one!)
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
