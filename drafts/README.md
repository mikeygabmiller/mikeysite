# Blog drafts

Posts written ahead so the blog keeps to about one a week (CLAUDE.md, "The
blog"). `drafts/` is excluded in `_config.yml` and skipped by
`tools/check-site.py`, so nothing here is served or checked until it moves
into `blog/`. Each was checked clean (facts, voice, em dashes, schema) on
2026-11-03 while sitting in `blog/`, then moved here. The December two were
written and checked the same way the same night; their meta line says
"December 2026" already.

Each one only says what the site already says Mikey does. Re-read it against
the facts table before publishing: a price or a fact may have changed since.

## The order

| Publish on | Post | Feeds | Why now |
|---|---|---|---|
| Mon Nov 17 | `how-to-pick-a-mobile-detailer` (queue #9) | homepage, `/services/` | AI panel prompt 23; nothing about insurance |
| Mon Nov 24 | `detailing-a-car-before-selling-it` (queue #5) | `/services/` (Full Detail) | Marissa J.'s review; no promised dollar figure |
| Mon Dec 1 | `how-to-get-vomit-smell-out-of-car` (queue #4) | `/services/interior.html` | Teresa H.'s review; high-intent search; no new price |
| Mon Dec 8 | `wax-vs-sealant-vs-ceramic-coating` (queue #10) | ceramic page | rainy season; only the ceramic page's own tiers and years; read the ceramic page's Search Console numbers before adding the link back |

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
5. `python3 tools/site-header.py --apply` (the drafts were written before the shared header, 2026-11-07),
   `python3 tools/build-entity-graph.py --apply`, then
   `python3 tools/sitemap-lastmod.py --apply`, then
   `python3 tools/check-site.py` until it says PASS.
6. Cross it off in section 6 of `reports/2026-10-27-seo-research.md`.
7. Merge, wait for it to serve, then `python3 tools/indexnow.py /blog/SLUG/ /blog/`.

The RV post went live 2026-11-10.

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

### how-to-get-vomit-smell-out-of-car

- `blog/index.html`: `<li><a href="/blog/how-to-get-vomit-smell-out-of-car/">How to Get Vomit Smell Out of a Car</a><p>The first hour, where it hides, and why the smell comes back on the first warm day.</p></li>`
- `llms.txt`: `- [How to get vomit smell out of a car](https://mikeysdetailing.com/blog/how-to-get-vomit-smell-out-of-car/): lift and blot, enzyme cleaner, dry it, where it hides, why it comes back (padding), hot water extraction; Interior Detail $249 to $329.`
- `sitemap.xml`: same shape as above.
- Link back: on `/services/interior.html`, wherever it talks about odor or extraction: `<a href="/blog/how-to-get-vomit-smell-out-of-car/">Someone got sick in the car? Start here.</a>` If that's a visible FAQ answer, step 5 rewrites the schema.
- Read before publishing: the car seat paragraph says most manuals say not to soak or use strong cleaners on harness straps. That's general advice, not a claim about one brand; keep it that way.

### wax-vs-sealant-vs-ceramic-coating

- `blog/index.html`: `<li><a href="/blog/wax-vs-sealant-vs-ceramic-coating/">Wax vs Sealant vs Ceramic Coating in Washington Rain</a><p>How long each one lasts here, what each costs, and which one is worth it for your car.</p></li>`
- `llms.txt`: `- [Wax vs sealant vs ceramic coating](https://mikeysdetailing.com/blog/wax-vs-sealant-vs-ceramic-coating/): wax shortest, sealant months, coating 2 to 7 years by tier; Exterior Detail $199 to $279 ends with wax or sealant; ceramic from $500.`
- `sitemap.xml`: same shape as above.
- Link back: in the ceramic page's "Why Ceramic Coating in the PNW?" section, after "waxing every 3 months barely keeps up.": ` <a href="/blog/wax-vs-sealant-vs-ceramic-coating/" style="color:var(--red);">Wax, sealant or coating: which one I'd pick.</a>`
- Read before publishing: it restates the ceramic tiers (Standard $500 2 to 3 yr, Pro $850 3 to 5 yr, Elite $1,300 5 to 7 yr) and the exterior prices. If either changed, change it here.
