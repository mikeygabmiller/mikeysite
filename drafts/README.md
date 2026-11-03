# Blog drafts

Posts written ahead so the blog keeps to about one a week (CLAUDE.md, "The
blog"). `drafts/` is excluded in `_config.yml` and skipped by
`tools/check-site.py`, so nothing here is served or checked until it moves
into `blog/`. Each was checked clean (facts, voice, em dashes, schema) on
2026-11-03 while sitting in `blog/`, then moved here.

Each one only says what the site already says Mikey does. Re-read it against
the facts table before publishing: a price or a fact may have changed since.

## The order

| Publish on | Post | Feeds | Why now |
|---|---|---|---|
| Mon Nov 10 | `rv-travel-trailer-detailing` (queue #7) | ceramic page's RV answer | trailers go into winter storage now; Mikey's yes 2026-10-17; quoted from photos, no price |
| Mon Nov 17 | `how-to-pick-a-mobile-detailer` (queue #9) | homepage, `/services/` | AI panel prompt 23; nothing about insurance |
| Mon Nov 24 | `detailing-a-car-before-selling-it` (queue #5) | `/services/` (Full Detail) | Marissa J.'s review; no promised dollar figure |

## Publishing one (about two minutes)

Replace `SLUG` with the folder name, then:

1. `git mv drafts/blog/SLUG blog/SLUG`
2. In `blog/SLUG/index.html`, set `datePublished` and `dateModified` to the
   day it goes live (they say 2026-11-03 from when they were built). If it
   goes live after November, change "November 2026" under the headline too.
3. Add its line to the top of the list in `blog/index.html`, `llms.txt` (Blog
   section, top) and `sitemap.xml` (above the newest post). The lines are
   below.
4. Add the link back from the page it feeds (below).
5. `python3 tools/build-entity-graph.py --apply`, then
   `python3 tools/sitemap-lastmod.py --apply`, then
   `python3 tools/check-site.py` until it says PASS.
6. Cross it off in section 6 of `reports/2026-10-27-seo-research.md`.
7. Merge, wait for it to serve, then `python3 tools/indexnow.py /blog/SLUG/ /blog/`.

### rv-travel-trailer-detailing

- `blog/index.html`: `<li><a href="/blog/rv-travel-trailer-detailing/">RV and Travel Trailer Detailing</a><p>Gelcoat, chalky oxidation, black streaks, getting one ready for winter storage, and a real price from photos.</p></li>`
- `llms.txt`: `- [RV and travel trailer detailing](https://mikeysdetailing.com/blog/rv-travel-trailer-detailing/): gelcoat, oxidation, black streaks, winter storage; RVs, travel trailers and horse trailers quoted per job from photos.`
- `sitemap.xml`: `<url><loc>https://mikeysdetailing.com/blog/rv-travel-trailer-detailing/</loc><lastmod>YYYY-MM-DD</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`
- Link back: in the ceramic page's RV answer (`ceramic-coating-snohomish-county/index.html`, "Yes, RVs, travel trailers and horse trailers"), add after its last sentence: ` <a href="/blog/rv-travel-trailer-detailing/" style="color:var(--red);">What to know about detailing one.</a>` That's a visible FAQ answer, so the generator rewrites the FAQ schema in step 5.

### how-to-pick-a-mobile-detailer

- `blog/index.html`: `<li><a href="/blog/how-to-pick-a-mobile-detailer/">How to Pick a Mobile Detailer</a><p>Eight things to check before anyone works on your car in your driveway, and the red flags.</p></li>`
- `llms.txt`: `- [How to pick a mobile detailer](https://mikeysdetailing.com/blog/how-to-pick-a-mobile-detailer/): exact price before they come, written reviews, their own photos, who shows up, when you pay, red flags.`
- `sitemap.xml`: same shape as above.
- Link back: `/services/` is the safe place (the homepage has its own rules about what goes where). A line under its intro: `<p>Comparing detailers? <a href="/blog/how-to-pick-a-mobile-detailer/">Here's the checklist I'd use</a>, on me too.</p>`

### detailing-a-car-before-selling-it

- `blog/index.html`: `<li><a href="/blog/detailing-a-car-before-selling-it/">Detailing a Car Before You Sell It</a><p>When it pays (private sale), when to skip it (trade-in), and what a buyer notices first.</p></li>`
- `llms.txt`: `- [Detailing a car before you sell it](https://mikeysdetailing.com/blog/detailing-a-car-before-selling-it/): worth it for a private sale, usually not for a trade-in, what buyers notice, Full Detail $369 to $449.`
- `sitemap.xml`: same shape as above.
- Link back: from the Full Detail part of `/services/`: `<a href="/blog/detailing-a-car-before-selling-it/">Selling the car? Read this first.</a>`
