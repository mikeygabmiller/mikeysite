# Page audit, 2026-10-28

Mikey: "go through all the current live pages on my site and improve for SEO
and AEO ... keep the functionality, let me know if there's any bugs." Every
page in `sitemap.xml` (48) plus the 404 and the call page was read and loaded
in a browser. The pages November reads for the title test (`/everett/`,
`/bothell/`, `/mill-creek/`, the how-long page, the ceramic page) got no
visible change; see the scoreboard's "Changed on 2026-10-28".

## What the 2026 research says (and what it doesn't)

- **AI Overviews and AI Mode cite opposite things.** Steady Demand's August
  2026 study (7,990 local-service searches, 50 metros): on local searches,
  70.7% of AI Overview citations went to the business's own site; 79.8% of AI
  Mode citations went to Google Maps / the Business Profile. So the site
  feeds AI Overviews and the Business Profile feeds AI Mode. Pages that were
  cited more often had schema, the phone number in the HTML and concrete
  numbers in the copy (a correlation, the study had no uncited control).
  https://www.steadydemand.com/ai-overviews-and-ai-mode-both-cite-local-businesses-in-almost-opposite-ways-ai-optimization-is-different-for-each/
- **BrightLocal** (about 2M AI citations): business sites 42% of citations,
  the Business Profile 28.6%, Yelp 9.5%, Facebook 2.2%. Service-area
  businesses get named a little less than storefronts, least so on AI
  Overviews (36.9% against 38.4%).
  https://www.brightlocal.com/research/local-ai-visibility-study/
- **FAQ rich results are gone** from Google (deprecated May 2026, per the
  trade press; Google's own page wasn't checked). The markup is harmless and
  the visible Q&A is still what answer engines lift, so the site keeps both.
- **Templated city pages** are what the March 2026 core update is reported to
  have hit (agency reports, no Google statement). Measured here: the twelve
  town pages are 58% to 89% unique sentences, which is fine. The town-service
  pages are 26% to 48% unique, but what they share is the process steps and
  FAQ answers the house rules say should be shared. What made them look like
  doorway pages was the link lists (below), not the copy.

## Fixed

1. **Answer boxes on 22 pages.** Nine town pages, ten town-service pages,
   Interior, Exterior and Reviews had none. Each now opens with one question
   in the words people type ("Who does mobile car detailing in Monroe, WA?")
   and one paragraph that names Mikey's Mobile Detailing, the town, the drive
   time from Snohomish (the `TOWNS` list), the price and the time. They feed
   the FAQPage through `build-entity-graph.py` like the guides' boxes.
   The Mill Creek paint correction box answers "swirls and water spots",
   because "water spot removal mill creek" had 37 impressions at 15.4.
2. **"Done in one day" on three paint correction pages** (Lake Stevens, Mill
   Creek, Snohomish), plus a "Corrected in One Day" heading. The facts table
   says Multi-Stage takes one to two days. Now: a 1-Step is 6 to 8 hours, a
   2-Step or Multi-Stage can run into a second day.
3. **Link lists that faked town pages.** "Truck detailing in Monroe / Mill
   Creek / Lake Stevens / Duvall" all pointed at the Snohomish truck page;
   "Interior detail in Monroe / Duvall / Snohomish" all at `/services/interior.html`;
   "Ceramic coating in Mill Creek" at the county page when a Mill Creek
   ceramic page exists. Seven lists rewritten with honest names, real targets,
   and links to the blog posts that had only 2 to 4 links in.
4. **The business `@type` wasn't real.** `AutoDetailing` is not a schema.org
   type (schema.org/AutoDetailing is a 404). Now `AutomotiveBusiness` +
   `AutoWash` on every page, from the generator.
5. **About page.** Paint correction and ceramic said "Quoted" where every
   other page says from $400 and from $500. And "I can work in apartment lots
   ... where people have nowhere to wash a car" now says it needs a spigot
   and an outlet he can reach and the property's OK.
6. **Granite Falls** (newest page) had no `og:image` or Twitter card, loaded
   the full-size before/after photos (about 430 KB more than the other town
   pages) without sizes, and jumped from h2 to h4.
7. **Twitter/X large-preview tag** added to 15 pages that had an `og:image`
   but no `twitter:card` (blog, about, reviews, Interior, Exterior,
   Marysville). Bothell left alone for the test.

## Checked and fine

- No JavaScript errors, broken images or failed files on any page, and
  nothing wider than a 375 px phone.
- The quote calculator: SUV, Full Detail, Needs Work gives $439, the
  Rain-Ready extras show as $60 free, and the live next opening loads.
- `robots.txt` invites every AI crawler; `llms.txt` lists every post.
- The Everett exterior page's clay and iron decontamination match the
  Exterior Detail's schema and price list.

## For Mikey (the site can't do these)

1. **Reviews**, still the biggest lever for the Map Pack and for AI Mode
   (one in October). See `reports/2026-10-27-seo-research.md` section 1.
2. **Bing Webmaster Tools** (10 minutes): import from Search Console, submit
   the sitemap. Bing is what ChatGPT search and Copilot read.
3. **Business Profile additional categories**: still only "Car detailing
   service".
4. **"Matt K."** on the homepage, the maintenance page and eight city pages,
   labeled "Lake Stevens, WA" on the Lake Stevens interior page: not one of
   the 40 Google reviews. Where did it come from? Until that's answered it's
   the one quote on the site that can't be checked.
5. **The Lake Stevens and Mill Creek interior pages** sell Refresh $249+ /
   Standard $289+ / Deep Clean $399+, while the calculator prices interiors by
   size ($249 / $289 / $329) and has no Deep Clean. Both are in `PRICING.md`,
   so nothing changed, but a customer who reads "Deep Clean $399+" and gets a
   $309 quote (sedan, War Zone) will ask. Worth one decision.

## After November 4

If the title test reads well, the same answer box goes on `/everett/`,
`/bothell/` and `/mill-creek/`; they were left out only to keep the test clean.
