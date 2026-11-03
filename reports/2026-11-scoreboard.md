# November 2026 scoreboard

Started 2026-11-03. GROWTH-PLAN.md §2 defines the five numbers. Windsor's one
connected source is still the **Business Profile** (checked 2026-11-03:
`google_my_business` only), so M1 and M4 are pulled here and M2, M3 and M5 are
read by hand. Blank means not pulled yet, never estimated.

## Summary

| # | Metric | November reading (October's data) |
|---|---|---|
| M1 | GBP: impressions, calls, website clicks, directions | **325 impressions, 4 calls, 29 website clicks, 26 direction requests** (Oct 1 to 30, Windsor, pulled 2026-11-03) |
| M2 | Search Console 28-day impressions, clicks, avg. position | not pulled yet: by hand (Search Console → Performance, last 28 days, web) |
| M3 | Quote-calculator starts → completions | not pulled yet: by hand (GA4), and the first full 4 weeks after the 2026-10-27 calculator batch end Nov 24 |
| M4 | Review count + reviews added this month | **5.0 across 41** (public profile and API agree, 2026-11-03). **2 added in October**: Bradley J. (Oct 10) and Brittany H. (Oct 30) |
| M5 | AI citation rate | not run yet |

## M1: the Business Profile, October in full

| Month | Impressions | Maps (mobile / desktop) | Search (mobile / desktop) | Calls | Website | Directions |
|---|---|---|---|---|---|---|
| Aug | 343 | 78 / 45 | 164 / 56 | 6 | 30 | 52 |
| Sep | 589 | 55 / 318 | 165 / 51 | 7 | 23 | 49 |
| Sep without Sep 22 to 23 | about 336 | 55 / about 65 | 165 / 51 | 7 | 23 | 49 |
| **Oct 1 to 30** | **325** | **23 / 45** | **193 / 64** | **4** | **29** | **26** |
| Oct 1 to 15 | 172 | 9 / 29 | 100 / 34 | 2 | 14 | 17 |
| Oct 16 to 30 | 153 | 14 / 16 | 93 / 30 | 2 | 15 | 9 |

Oct 31 to Nov 2 read zero on every line, which is GBP's usual lag, so they're
left out. The October rows can still grow by a few as late data lands; re-pull
before the December comparison.

What it says, plainly:

- **October is flat against a real September, not down.** September's 589 had
  253 desktop Maps views on Sep 22 and 23 with no calls or clicks (see
  `reports/2026-10-27-rnd-money-map.md` section 5). Take those out and
  September is about 336; October is 325.
- **Mobile Search is the one line that grew** (165 to 193). That's people on
  a phone looking at the profile in Google results.
- **Website clicks went up (23 to 29) while calls went down (7 to 4).** More
  people are going to the site instead of calling from the profile. That's
  only worth something if the site turns them into quotes, which is what M3
  measures, so read M3 before reading this as good or bad.
- **Directions (26) mean little for a business that drives to people.** 17 of
  them came in the first five days of the month. Don't chase that line.
- **Search terms for October aren't out yet.** Windsor returned no rows for
  October's keywords on 2026-11-03; Google publishes them some days into the
  next month. Pull them with the December read.

## M4: reviews

41 on the public profile (fetched 2026-11-03) and 41 from the API. 39 have
words, 2 are stars only. Both October reviews are five stars. Bradley J.'s was
already on `/reviews/`; Brittany H.'s went on top on 2026-11-03, word for word,
and every copy of the count on the site moved from 40 to 41 the same day.

Two reviews a month is still the rate from before (about 1.3 a month over the
last year). GROWTH-PLAN SG1 wanted 1.5 a week. The question from
`reports/2026-10-27-seo-research.md` section 1 still stands: is the
dashboard's review ask actually going out after each job (jobs marked Won,
the ask switched on in Settings)?

## Why reviews are slow: the dashboard texts, read 2026-11-03

Mikey gave the session his dashboard login to read every conversation
(read-only: `?peek=1`, which leaves unread badges alone; checked before and
after). No names or numbers go in this file; the repo is public.

- **146 conversations since June 21, 1,508 messages. Only 6 are marked
  "won".** The dashboard's review ask only fires for "won" customers, so it
  has barely run. Most finished jobs stay "new".
- **13 finished jobs since July never got the review link.** Most of those
  customers said something like "looks fantastic" in the same thread. The link
  went out 9 times in all, nearly always typed by hand.
- **Two hand-typed asks said "5-star"** ("as long as it is 5 stars"). Google's
  policy forbids asking for positive reviews specifically. The dashboard's own
  wording is fine; only typed ones did it.
- The fix for the code side is twillowdashbored PR #235 (waiting on Mikey).
  The fix that works today is tapping Done on the Jobs board: its "all
  finished" text carries the link.

Other things the texts showed:

- **Reply speed:** median 61 minutes to a personal reply; a quarter of new
  leads wait over 4 hours. One same-day lead was gone in 33 minutes.
- **What people ask before booking:** when he can come (52 of 162 questions),
  price (24), what's included (24), water/power/being home (9), how to pay (9),
  how long (8). How to pay isn't answered anywhere on the site.
- **Hand quotes drift from the price book:** a sedan Full Detail at $260, SUV
  interiors at $250 and $270 (book: $289), and two prices set after the job
  ("I'd say $350 would be fair"). The site promises an exact price up front.
- **Payment friction:** Zelle goes to (425) 232-1355, the old number the facts
  table says never to publish, and two customers couldn't find it; Venmo goes
  to a personal account under another name, which two customers asked about.
- A ceramic lead from North Bend said they found him on ChatGPT.

## Fixed alongside this pull (2026-11-03)

- **Angela's quote on the door hanger, the EDDM postcard, the shared postcard
  and social post B04** ended with "Incredible attention to detail." and the
  print pieces signed it "Angela, Snohomish". Neither the sentence nor the
  town is in her Google review. All four now use her first sentence word for
  word, signed "Angela · Google review". None of these had been ordered or
  posted (`print/ORDERING.md` log; B04 isn't in `APPROVED`).
- **Still open, Mikey's to answer:** the "Matt K." quote ("showed up on time,
  did exactly what he said...") is on the homepage, the maintenance page and
  city pages under "5.0 stars across 41+ Google reviews", and it's social post
  B12, slotted for Nov 22 (not approved, so it won't post). It isn't one of
  the 41 Google reviews. If it isn't from a real customer who said it, it
  comes off; if it is, it stays without the word Google near it.
