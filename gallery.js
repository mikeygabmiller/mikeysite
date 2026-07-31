/* ============================================================
   MIKEY'S MOBILE DETAILING — LIVE BEFORE/AFTER GALLERY
   ------------------------------------------------------------
   Pulls recent real jobs from /gallery.json and appends them to
   any before/after grid on the page. The hardcoded pairs already
   in the HTML stay exactly where they are — this only ADDS.

   The photos come from the Photo Engine in the SMS dashboard:
   Mikey texts before/after shots to his business number from the
   driveway, and the same job that becomes a Google post also
   lands here. Nobody edits this file to add a car.

   To turn a grid live, tag it with the city slug:
       <div class="ba-grid" data-md-gallery="lake-stevens">
   Use data-md-gallery="all" to show jobs from every city.

   Fails silently and completely. If gallery.json is missing,
   empty, or malformed, the page looks exactly as it does today.
   ============================================================ */
(function () {
  var grids = document.querySelectorAll('[data-md-gallery]');
  if (!grids.length) return;

  var MAX_PER_GRID = 6;

  fetch('/gallery.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var items = (data && data.items) || [];
      if (!items.length) return;

      Array.prototype.forEach.call(grids, function (grid) {
        var want = (grid.getAttribute('data-md-gallery') || 'all').toLowerCase();
        var mine = items.filter(function (it) {
          if (!it || !it.after) return false;                  // an after shot is the minimum
          return want === 'all' || String(it.citySlug || '').toLowerCase() === want;
        });
        // Newest first, and never push the curated pairs off the page.
        mine.sort(function (a, b) { return (b.date || 0) - (a.date || 0); });
        var room = Math.max(0, MAX_PER_GRID - grid.querySelectorAll('.ba-pair').length);
        mine.slice(0, room).forEach(function (it) { grid.appendChild(pair(it)); });
      });
    })
    .catch(function () { /* never break the page over a gallery */ });

  // Build the same .ba-pair markup the hardcoded examples use, so a live job is
  // visually indistinguishable from a curated one.
  function pair(it) {
    var wrap = document.createElement('div');
    wrap.className = 'ba-pair';

    var imgs = document.createElement('div');
    imgs.className = 'ba-imgs';
    if (it.before) imgs.appendChild(figure(it.before, 'before', altFor(it, 'before')));
    imgs.appendChild(figure(it.after, 'after', altFor(it, 'after')));
    wrap.appendChild(imgs);

    if (it.caption || it.city) {
      var cap = document.createElement('div');
      cap.className = 'ba-cap';
      cap.textContent = it.caption || (it.service ? it.service + ' — ' + it.city : it.city);
      wrap.appendChild(cap);
    }
    return wrap;
  }

  function figure(src, tag, alt) {
    var f = document.createElement('figure');
    var s = document.createElement('span');
    s.className = 'ba-tag ' + tag;
    s.textContent = tag === 'before' ? 'Before' : 'After';
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    // A dead photo link would leave a broken-image icon on a landing page.
    img.onerror = function () { if (f.parentNode) f.parentNode.removeChild(f); };
    f.appendChild(s);
    f.appendChild(img);
    return f;
  }

  // Alt text is written by the Photo Engine off the actual photo; fall back to
  // something factual and city-specific rather than leaving it empty.
  function altFor(it, which) {
    if (it.alt) return which === 'before' ? ('Before detailing — ' + it.alt) : it.alt;
    var what = it.vehicle || 'vehicle';
    return which === 'before'
      ? (what + ' before detailing in ' + (it.city || 'Snohomish County'))
      : (what + ' after a detail by Mikey\'s Mobile Detailing in ' + (it.city || 'Snohomish County'));
  }
})();
