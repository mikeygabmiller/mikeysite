/* ============================================================
   MIKEY'S MOBILE DETAILING — SITEWIDE OFFER BAR
   ------------------------------------------------------------
   ★ EDIT THE OFFER IN ONE PLACE: the CONFIG block below. ★
   Change it here and it updates on EVERY page of the site.

   Why this file exists: before it, the free-exterior offer lived
   only in one section, two thirds of the way down the homepage.
   Someone who landed on /everett/ or a blog-referred guide page
   never saw it at all. This puts the offer on every page, at the
   top of the viewport, on the first paint.

   ⚠️ This bar is injected by JavaScript, so AI crawlers (GPTBot,
   PerplexityBot, ClaudeBot …) do NOT see it — they only read raw
   HTML. The offer is written into the raw HTML of
   /car-detailing-deals/ and /free-exterior-detail/ (including
   Offer schema) so the answer engines still have it. Keep the
   wording here in step with those two pages.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    // Where the bar sends them. Always the claim page — it's built to
    // turn one tap into one text message.
    href: "/free-exterior-detail/",

    // The bar runs seven days a week, but the wording changes. The
    // homepage offer section only opens Fri–Mon (0=Sun … 6=Sat), so on
    // the off days the bar says so instead of pretending otherwise —
    // and still takes the booking, because a Tuesday lead just gets
    // booked into the weekend.
    activeDays: [5, 6, 0, 1],
    open: {
      text:    "Free exterior detail",
      subtext: "with any interior — a $160 service, free",
      cta:     "See the deal"
    },
    closed: {
      text:    "Free exterior detail",
      subtext: "with any interior — this week's spots open Friday",
      cta:     "Get on the list"
    },

    // Days to stay hidden after someone dismisses it.
    snoozeDays: 3,
    // Pages that ARE the offer — no bar needed, they're already it.
    skipPaths: ["/free-exterior-detail/", "/car-detailing-deals/"]
  };

  var KEY = "md_offer_dismissed_until";

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  // --- should the bar show at all? -----------------------------------------
  var path = window.location.pathname.replace(/\/index\.html$/, "/");
  for (var i = 0; i < CONFIG.skipPaths.length; i++) {
    if (path === CONFIG.skipPaths[i]) return;
  }

  var isOpen = CONFIG.activeDays.indexOf(new Date().getDay()) !== -1;
  var COPY = isOpen ? CONFIG.open : CONFIG.closed;

  // localStorage throws in some privacy modes — never let that break the page.
  try {
    var until = window.localStorage.getItem(KEY);
    if (until && Date.now() < parseInt(until, 10)) return;
  } catch (e) { /* no storage: just show the bar */ }

  // --- styles ---------------------------------------------------------------
  var css = [
    '.md-offerbar{position:sticky;top:0;z-index:9000;background:linear-gradient(135deg,#C8102E 0%,#A00C24 100%);',
      'color:#fff;font-family:Outfit,system-ui,-apple-system,sans-serif;box-shadow:0 2px 14px rgba(0,0,0,.35)}',
    '.md-offerbar__wrap{position:relative}',
    '.md-offerbar__in{max-width:1100px;margin:0 auto;padding:8px 40px 8px 16px}',
    '.md-offerbar a.md-offerbar__link{color:#fff;text-decoration:none;display:flex;align-items:center;',
      'justify-content:center;gap:14px}',
    '.md-offerbar__txt{font-weight:800;font-size:14px;line-height:1.3;letter-spacing:-.2px}',
    '.md-offerbar__txt small{font-weight:600;opacity:.92;font-size:12.5px;margin-left:7px}',
    '.md-offerbar__cta{background:#fff;color:#C8102E;font-weight:900;font-size:11.5px;text-transform:uppercase;',
      'letter-spacing:.8px;padding:7px 14px;border-radius:999px;white-space:nowrap;flex-shrink:0}',
    '.md-offerbar__x{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;',
      'color:#fff;opacity:.75;font-size:20px;line-height:1;cursor:pointer;padding:4px 9px;font-family:inherit}',
    '.md-offerbar__x:hover{opacity:1}',
    /* Phones: stack the two lines of copy but keep the pill on the same row,
       so the bar stays one compact strip instead of three stacked lines. */
    '@media(max-width:620px){',
      '.md-offerbar a.md-offerbar__link{justify-content:space-between;gap:10px;text-align:left}',
      '.md-offerbar__txt{font-size:13px;line-height:1.25}',
      '.md-offerbar__txt small{display:block;margin-left:0;font-size:11.5px}',
      '.md-offerbar__cta{font-size:10.5px;padding:6px 11px;letter-spacing:.5px}',
      '.md-offerbar__in{padding:7px 32px 7px 13px}}',
    '@media(prefers-reduced-motion:no-preference){.md-offerbar{animation:mdOfferIn .32s ease-out}',
      '@keyframes mdOfferIn{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:none}}}'
  ].join("");

  function build() {
    if (document.querySelector(".md-offerbar")) return;

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var bar = document.createElement("div");
    bar.className = "md-offerbar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Current offer");

    var wrap = document.createElement("div");
    wrap.className = "md-offerbar__wrap";

    var inner = document.createElement("div");
    inner.className = "md-offerbar__in";

    var link = document.createElement("a");
    link.className = "md-offerbar__link";
    link.href = CONFIG.href;
    link.innerHTML =
      '<span class="md-offerbar__txt">' + COPY.text +
        '<small>' + COPY.subtext + '</small></span>' +
      '<span class="md-offerbar__cta">' + COPY.cta + ' &rarr;</span>';
    link.addEventListener("click", function () {
      track("offer_bar_click", {from_path: path, state: isOpen ? "open" : "closed"});
    });

    var close = document.createElement("button");
    close.className = "md-offerbar__x";
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss this offer");
    close.innerHTML = "&times;";
    close.addEventListener("click", function () {
      bar.dispatchEvent(new Event("md:removed"));
      bar.parentNode.removeChild(bar);
      track("offer_bar_dismiss", {from_path: path});
      try {
        window.localStorage.setItem(
          KEY, String(Date.now() + CONFIG.snoozeDays * 86400000));
      } catch (e) { /* nothing to remember it with — fine */ }
    });

    inner.appendChild(link);
    wrap.appendChild(inner);
    wrap.appendChild(close);
    bar.appendChild(wrap);
    document.body.insertBefore(bar, document.body.firstChild);

    offsetStickyHeader(bar);
    track("offer_bar_view", {from_path: path, state: isOpen ? "open" : "closed"});
  }

  /* Nearly every page on this site has its own `position:sticky; top:0`
     header. Ours is sticky at top:0 too, and two sticky elements pinned to
     the same edge overlap: the header would slide up over the bar the moment
     you scrolled. So push the page's header down by exactly the bar's height
     and keep it there through resizes and font swaps. */
  function offsetStickyHeader(bar) {
    var header = document.querySelector("header");
    if (!header) return;
    var pos = window.getComputedStyle(header).position;
    if (pos !== "sticky" && pos !== "fixed") return;

    var apply = function () {
      if (!bar.parentNode) return;             // dismissed
      header.style.top = bar.offsetHeight + "px";
    };
    apply();
    window.addEventListener("resize", apply);
    // Outfit loads async; when it swaps, the bar's height can change.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(apply).catch(function () {});
    }
    // Put the header back where it was if the bar gets dismissed.
    bar.addEventListener("md:removed", function () { header.style.top = ""; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
