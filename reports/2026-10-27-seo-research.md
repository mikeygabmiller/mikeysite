# SEO research, 2026-10-27

Mikey: "need more SEO work than that, do research and find what else I can do
to progress." This is what the research found and what to do about it, most
lead-moving first. Sources: the Business Profile through Windsor (performance,
reviews, posts, settings), the live search results through a web search tool,
competitors' sitemaps, the dashboard's code (`twillowdashbored`, live branch)
and the site itself. Semrush had no API units left, so there are no new search
volumes in this report.

## 1. Reviews have stopped, and the dashboard explains why

| | Reviews added |
|---|---|
| Aug 2026 | 2 |
| Sep 2026 | 0 |
| Oct 2026 (to the 27th) | 1 |

40 in total. L&M Pro Car Detailing (Everett) shows 283, Beverly Auto Detailing
65. Reviews are about a fifth of what decides the Map Pack, and the Map Pack is
where most of his clicks come from (scoreboard, Search Console finding 1).

**Why it stalled.** In the dashboard a review ask goes out in two ways only:

1. **"All finished" on the Jobs board** on job day. That text carries the
   Google link (`dayJobText('done')`, needs `reviewUrl` set and `reviewAsk` on).
2. **A job marked Won** puts a review ask due a day later
   (`FOLLOWUP.WON_REVIEW_MS`). It only sends itself when **Autopilot** is on,
   and Autopilot is **off by default** (`autopilot: false`). Off, it waits as
   a suggestion until he taps it.

So a job that isn't finished on the Jobs board, or isn't marked Won, or whose
suggestion isn't tapped, never gets asked. Two fixes, Mikey's choice:

- **No code:** tap "All finished" on every job (it asks on the spot), or turn
  Autopilot on. Autopilot also sends the unanswered-quote chase texts and the
  30-day win-back, so it's more than the review ask.
- **Small code change (needs his yes, it texts customers on its own):** a
  separate switch so the review ask a day after Won sends itself even with
  Autopilot off. Quiet hours still apply.

Don't ask on Yelp: Yelp's rules forbid asking customers for reviews, and it
filters reviews it thinks were solicited.

## 2. The reviews page put words in customers' mouths (fixed in this PR)

`/reviews/` showed 9 quotes in a moving strip, cut at three lines. Checked
against the 40 real Google reviews:

- **"Pat Job"** was quoted as "Great work, fair price, on time every time.
  Couldn't ask for more from a local detailer." His real review says something
  else ("Top notch service! ... my choice for monthly car detailing for both my
  car and truck, along with my wife's car!").
- **"James Bell"** ("Mikey did an AMAZING JOB detailing my Ford...") isn't
  among the 40 Google reviews.
- **Flon R** had "Outstanding value." added, and **Angela** had "Incredible
  attention to detail." added and was labeled "Snohomish". Neither wrote
  those words.

A changed or made-up testimonial under a real name is what the FTC's 2024
rule on fake reviews (16 CFR Part 465) is about, and a customer who reads
their own name over words they didn't write is a review he has to explain.
The page now shows all 38 written Google reviews in full, newest first, word
for word (one em dash shown as a spaced hyphen, per the house rule), with the
month each was written and a link to the profile. The two star-only reviews
are counted in the note. It's also the most specific local text on the site:
an M5 Competition, a Silverado and a 28 ft travel trailer, two kids' car
seats, a car before baby #3, a truck detailed before it was sold.

**Still open, Mikey's answer needed:** the "Matt K." quote ("showed up on
time, did exactly what he said, and charged exactly what he quoted") is on the
homepage, the maintenance page and eight city pages (Bothell, Duvall, Lake
Stevens and its interior page, Mill Creek, Mukilteo, Woodinville, Arlington).
It isn't a Google review. If it's from a real customer (a text, Facebook,
Nextdoor), say where and it stays, labeled honestly. If not, it gets replaced
with a real Google review, as Granite Falls already was. Bothell waits until
after the November 4 title-test read either way.

## 3. The AI engines' index is still reading old copies

A search through the engine an AI assistant uses (2026-10-27) quoted the
homepage at Interior $200, Exterior $160, Full $299 with the old
free-exterior offer, and Duvall, Marysville and Bothell at the same old
numbers. The live pages say none of that (checked by fetching each one). The
same index still lists `blog.mikeysdetailing.com`, which has 301'd since Oct
8. IndexNow tells Bing; that index refreshes on its own schedule.

What speeds it up, Mikey's job (about 10 minutes, once):
**Bing Webmaster Tools** (bing.com/webmasters): sign in, "Import from Google
Search Console" (it verifies the site with no code), then submit
`https://mikeysdetailing.com/sitemap.xml`. Bing feeds ChatGPT search and
Copilot, and its URL Inspection shows what Bing has stored for each page. It
was cut from the October 8 brief; it's the cheapest thing on this list.

## 4. The Business Profile: one real gap

Read through the Business Profile API (Windsor), 2026-10-27:

- **Not a duplicate.** Search results show two `business.google.com/v/`
  links (ids ending 7006399 and 0898714); both show the same 40 reviews and
  the API reports one location and no duplicate. Nothing to merge.
- **Additional categories: none.** Only "Car detailing service". Google allows
  more, and it's the one profile setting the scoreboard flagged that's still
  undone. With Mikey signed in: Edit profile → Business category → Add
  another; type "detail", "ceramic", "paint", "wash" and pick only ones for
  work he does.
- **Posts are going up.** 16 in October; 15 live, **1 rejected** (Oct 22, the
  rubber-glove dog hair tip). Google doesn't say why; the likeliest cause is
  its own automated filter. Worth reposting reworded.
- Services, prices, attributes, service area (all twelve towns) and links are
  right.

## 5. What the competitors have that the site doesn't

From their sitemaps and the live results for Snohomish, Everett and
Marysville:

| Competitor | Where | What they've built |
|---|---|---|
| The Detail Buff | Marysville shop + mobile | 8 town pages incl. Stanwood, mold remediation, PPF, "how to choose a car detailer in Snohomish County", "wax or paint correction", "automatic car washes bad for your car" |
| Slide In | Everett | 67 posts: tree sap, mold, water spots, rainy-season care, ozone odor, engine bay; ran customer voting for Seattle Times "Best in the PNW" (won 2023 and 2024) |
| Big's | Seattle area | 100+ how-to posts; business/fleet and apartment pages |
| Russell's, Golden Hour, PrimeTouch | Everett, Brier | small sites, ranking on "mobile detailing Snohomish" anyway |

Also on page one for "mobile detailing Snohomish WA": **his own unclaimed
Nextdoor page** (first result), detailerdirectory.com (shows a street address,
fix in `outreach/DIRECTORIES.md`), Yelp (Elite Mobile Detailing) and
detail.com.

## 6. The post queue (about one a week, CLAUDE.md "The blog")

Each one is written from work he does and backed by a real review or a real
local condition, links to the page it feeds, and gets a link back from it.

| # | Post | Feeds | Why this one |
|---|---|---|---|
| 1 | ~~Can a scratch be buffed out?~~ | paint correction | live 2026-10-27 |
| 2 | ~~Tree sap off paint without hurting it~~ (live 2026-10-27) | exterior, paint correction | firs everywhere he works; Slide In and Big's rank on it |
| 3 | ~~Cleaning up after kids: car seats, crumbs, melted snacks~~ (live 2026-10-27) | interior | two reviews (Matt Miller, Kathryn Miller) |
| 4 | Getting a smell out after someone's been sick in the car | interior | Teresa Hekker's review; high-intent search |
| 5 | Is detailing a car before you sell it worth it? | full detail | Marissa Jones's review |
| 6 | Water spots: why they etch, what takes them off | paint correction | "water spot removal mill creek" in Search Console |
| 7 | RV and travel trailer detailing | quote by photo | Mikey's yes 2026-10-17; Jason Brandvold's review; no price |
| 8 | Damp carpet and the musty smell (rainy season) | interior | Nov–Mar; ask Mikey first whether he does mold before the word goes in |
| 9 | How to pick a mobile detailer | homepage | AI panel prompt 23; honest checklist, nothing about insurance |
| 10 | Wax, sealant or ceramic in Washington rain | ceramic | after the Nov 4 read (ceramic page is in the title test) |

## 7. Local links and mentions (slow, but they last)

- **Claim the Nextdoor page** that ranks first for "mobile detailing
  Snohomish WA". It's the one with his posts; claiming lets him fix it and
  answer recommendation threads as the business.
- **Herald "Best of Snohomish County"** (Everett Daily Herald, yearly:
  nominations, then reader voting). The 2026 dates weren't findable; check
  heraldnet.com's Best Of page and nominate in the auto category when it
  opens. Slide In built two years of "award-winning" off the Seattle Times
  version by asking customers to vote.
- **Chamber listings:** the Snohomish Chamber and Economic Alliance Snohomish
  County both run member directories with links. Paid, so it's Mikey's call.

## 8. Checked and fine

- Granite Falls and the scratch post are live and were sent to IndexNow.
- No duplicate Business Profile.
- The live site carries none of the old prices the AI index quotes.
- The ceramic page's Standard $500 / Pro $850 / Elite $1,300 and "15-25% more
  for trucks" predate this and sit under PRICING.md's open ceramic item; left
  alone (it's also in the title test).
