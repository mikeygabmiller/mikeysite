# SEO R&D track 1: the money map (2026-10-27)

The question: of all the SEO work Mikey could do next, which turns into the
most **booked jobs per hour** spent? This answers it from his own numbers.
Three other sessions cover the map pack and competitors, the AI answer
engines, and search platforms other than Google web; this report stays out of
those except where a number is needed for scale.

**The short answer, before the table.** Google web search is a small pond for
this business: about **3,200 impressions and 55 clicks a month** across every
query (Search Console, 3 months to 2026-10-04). Even if every page-level move
below works, the total is about **1.5 to 2.5 extra booked jobs a month by
spring**. That's worth doing, because most of it is cheap, but it means two
things the plans don't say:

1. **Position 5 to 15 is not the same as money.** GROWTH-PLAN §7 treats any
   query at 5 to 15 as one edit from page one. The how-long page is the
   biggest such cluster on the site (about 110 impressions a month) and it is
   informational: at position 1 it would still book close to nothing. Rank by
   *buying* intent times ticket, not by position.
2. **The first job is measurement, not copy.** The dashboard already records
   which page every quote and booking started on, then throws it away after 45
   days and never shows it. Two small changes there turn every row below from a
   guess into a number.

## The 10 best next moves

"Jobs/month" is the expected extra booked jobs per month once the move has
had time to work (4 to 8 weeks for a page change). Every one uses the model in
[§6](#6-sizing-the-model-and-every-opportunity): **about 50 local-intent
clicks make one booked job, at about $330.** Informational clicks need about
ten times that.

| # | Move | Jobs/month | Hours | Confidence | Who |
|---|---|---|---|---|---|
| 1 | **Dashboard: keep the landing page and split Business Profile from Google search** on every lead (`markOrigin`), and show leads, won and revenue by landing page in Insights → Channels | 0 directly; it's what proves or kills rows 3 to 10 | 2 (Claude), 5 min Mikey's yes | High (the data is already collected) | Claude, dashboard repo |
| 2 | **Read the Nov 4 title test on position and CTR, not clicks.** Season alone takes 15 to 33% off impressions between the two windows | Protects the decision to roll the title to 9 more city pages | 0.25 | High | Whoever does the Nov 4 pull |
| 3 | **Cost page: the price goes in the title** (`Car Detailing Cost in Snohomish County | $199–$449`). It earns 0.42% CTR at position 8.5; his own pages earn about 3% there | 0.08 (0.3 per hour, the best ratio on the list) | Medium | Claude, after Nov 4 |
| 4 | **Roll the title test's winner to Mill Creek, Monroe and Marysville**, only if Everett and Bothell moved | 0.1 to 0.2 | 0.5 | Medium (conditional) | Claude, after Nov 4 |
| 5 | **Consolidate paint correction**: four pages (county + Snohomish + Lake Stevens + Mill Creek) share 67 to 69% of their text and split about 10 impressions a month between them. 301 the three city pages into the county page, then Mikey's first real paint photo goes on it | 0.1 to 0.3 (at $400 to $900 a job) | 1.5 + Mikey 30 min for photos | Low to medium | Claude, Mikey's yes on the 301s |
| 6 | **Ceramic page: RV/trailer section and real coating photos** (after Nov 4; it's in the window). 153 impressions a month at about 13 on "ceramic coating near me" and its variants, plus RV searches the page never answers | 0.15 to 0.25 (at $500+ a job) | 2 + Mikey's photos | Low to medium | Claude, Mikey |
| 7 | **Winter-to-spring pages live by mid-December**: damp carpet and musty smell (in Washington, "mold in car" runs about three times its yearly average Jan to Mar and near zero in summer), and the best-time page refreshed for after-winter salt and sand | 0.2 to 0.5, Feb to Apr only | 4 | Low | Claude, Mikey answers first |
| 8 | **Everett, the one big pond**: Semrush counts about 990 searches a month on six Everett phrases and the page sits at 22 to 42. Copy won't move it; links from the blog posts, an Everett-named review ask and the citations the other lanes are fixing will | 0.5 to 1.2 if it reaches the top 5 by spring | 6 to 10 over two months | Low | Claude (internal links), Mikey (reviews) |
| 9 | **Hub pages link their spokes, then request indexing**: the ceramic county page doesn't link the Monroe or Mill Creek ceramic pages; the paint county page doesn't link its city pages | 0.05 | 0.5 | Medium | Claude, then Muse in URL Inspection |
| 10 | **The six dead pages: 301 three, keep three** (near-me → `/`, the two city interior pages → their city pages; keep pet hair, vs car wash, Monroe ceramic) | about 0; removes duplicate-content risk and stops hours going into them | 0.75 | Medium | Claude, Mikey's yes on the 301s |

**Stop doing:** further work on the how-long page (row 2 of §6's table:
informational, about 0.1 job a month at any position), rewrites of the
near-me page, and new city *service* pages built from a template (§3: the templated
ones share 55 to 69% of their text with a sibling).

**For scale, outside this lane:** the Business Profile sent the largest share
of Google clicks (65 of 168 page-level clicks landed on addresses only the
profile uses, Search Console, 3 months to 2026-10-04), and 1 review in
September and October together (Windsor GBP reviews, read 2026-10-27, in
`reports/2026-10-27-seo-research.md`). Fixing the review ask is likely worth
more than rows 3 to 10 combined. It belongs to the map-pack session; it's
noted here so nobody reads this table as "the site is where the money is".

---

## 1. Search Console: what there is to win

**Data available.** Windsor's one free source is the Business Profile
(`get_connectors`, 2026-10-27: only `google_my_business`). Search Console is
not connected, so the newest numbers are the hand pull of 2026-10-07 in
`reports/2026-10-scoreboard.md` (3 months to 2026-10-04, top 50 queries, all
41 pages). **Missing:** anything after Oct 4, the query × page split for most
queries, and URL Inspection after the Oct 14 internal links.

| Window | Clicks | Impressions | CTR | Avg. position | Source |
|---|---|---|---|---|---|
| 28 days, Sep 7 to Oct 4 | 46 | 2,681 | 1.7% | 13.1 | SC by hand, 2026-10-07 |
| 3 months to Oct 4 | 163 | 9,558 | 1.7% | 14.7 | same |

### His own CTR curve

Generic CTR studies don't fit a page that sits under a map pack, so this uses
his own rows (SC, 3 months to 2026-10-04):

| Position | What his pages earn | Rows it comes from |
|---|---|---|
| 3 to 4 | about 11 to 13% | auto detailing snohomish 3.6 → 11.1%; car detailing snohomish (homepage at 4.4) 12.8% |
| 5 to 6 | about 5% | GBP website button 5.2 → 4.45%; `http://` homepage 5.5 → 4.9% |
| 8 to 11 | about 1.3 to 2.6% | /monroe/ 10.8 → 2.6%; /duvall/ 11.1 → 2.5%; /mill-creek/ 11.5 → 1.3% |
| 15 to 24 | under 1% | /marysville/ 15.8 → 0.8%; /everett/ 23.7 → 0.6% |

Used below: top 3 = 12%, 4 to 6 = 6%, 7 to 10 = 3%, 11 to 15 = 1.5%,
16+ = 0.5%.

### Position 5 to 20 queries, by what a top-3 move is worth

Monthly impressions are the 3-month figure ÷ 3. "Click gain" is moving to the
top 3 from today's position using the curve above. "Jobs" uses §6.

| Query (cluster) | Impr./mo | Position | Click gain at top 3 | Intent | Jobs/mo at top 3 |
|---|---|---|---|---|---|
| near-me cluster: mobile detailing / car detailing / detailing / auto detailing / mobile car detailing / mobile auto / interior car detailing near me | 428 | 5.9 to 11.3 (about 8) | +38 | buying, but localized: Google picks the city page nearest the searcher | 0.76 (not reachable by one page: it's 12 city pages at once) |
| ceramic coating near me (+ rv ceramic, car ceramic, for cars) | 153 | 12.9 to 19.7 | +17 | buying, high ticket | 0.34 × ($650 ÷ $330) ≈ 0.7 job-equivalents |
| how-long cluster (6 phrasings) | 110 | 17 to 38 | +13 | informational | 0.03 |
| car detailing mill creek | 25 | 9.8 | +2.7 | buying | 0.05 |
| car detailing / auto detailing monroe wa | 22 | 10.1 to 10.3 | +2.1 | buying | 0.04 |
| rv detailing near me | 15 | 17.2 | +1.7 | buying, quote by photo | 0.03 |
| water spot removal mill creek | 12 | 15.4 | +1.3 | buying | 0.03 |
| car detailing prices | 12 | 9.9 | +1.1 | buying | 0.02 |
| car interior cleaning / interior car cleaning | 19 | 6.4 to 8.1 | +1.7 | mixed | 0.02 |

What this says: the only single-page prize in the 5 to 15 band is
**ceramic**, and even that is under one job a month at the top 3. The near-me
cluster is bigger but moves with all twelve city pages and the map pack, not
with an edit.

### Pages with a below-average CTR for their position

| Page | Impr. (3 mo) | Position | CTR | Expected at that position | Why, from the HTML |
|---|---|---|---|---|---|
| `/car-detailing-cost-snohomish-county/` | 471 | 8.45 | 0.42% | about 3% | Title has no price: "Car Detailing Cost in Snohomish County". The meta does ($199–$279 ...), but the title is what's read. Row 3 |
| `/reviews/` | 253 | 8.7 | 0% | about 3% | Probably "mikeys auto detailing reviews" (24 @ 11.3) and brand-adjacent searches; rebuilt 2026-10-27 with all 38 reviews. Re-read in December, don't touch |
| `/best-time-to-detail-car-washington/` | 206 | 5.44 | 0% | about 5% | Shows for "car detailing near me" (7 @ 2.3) and similar, where the searcher wants a detailer, not a guide. Wrong intent, not a bad title: leave it, refresh it for row 7 |
| `/ceramic-coating-snohomish-county/` | 946 | 18.75 | 0.21% | about 0.5% | Slightly under even for page two. Position is the problem, not the title (it already says "From $500, At Home") |
| `/how-long-does-car-detailing-take/` | 882 | 19.39 | 0.11% | about 0.5% | Page two and informational. Not worth more work |

Everything else sits on or near the curve: most "high impressions, no
clicks" pages are on page two, as the scoreboard said.

## 2. The six pages with no impressions

All six were "URL is unknown to Google" on 2026-10-08 (Muse, URL Inspection,
`reports/2026-10-scoreboard.md`), and `sitemap.xml` had never been submitted
before that day. So the first cause is the same for all six: **Google had
never crawled them.** Five months live with two or three links from pages that
themselves got little crawling, and no sitemap. Links were added on
2026-10-14 (#224). Read from the HTML on 2026-10-27:

| Page | Canonical / robots | Words (visible) | Linked from (served pages) | Nearest other page | Verdict |
|---|---|---|---|---|---|
| `/mobile-car-detailing-near-me/` | self, index | 1,065 | 3: home, cost, ceramic | none over 25% | **301 to `/`** once the November inspection confirms it's still unknown or "crawled, not indexed". A "near me" search is answered by location: Google already sends those searches to the city page nearest the searcher (3 to 9 on "mobile detailing near me"), and a page with no town can't beat that. Keeping it costs nothing; working on it costs hours for nothing |
| `/pet-hair-removal-car-detailing/` | self, index | 1,088 | 6: home, services, Granite Falls, Woodinville, Lake Stevens interior, the pet hair blog post | none over 25% | **Keep, no rewrite.** Best-linked of the six. The blog post ("how to get pet hair out of car seats") is the do-it-yourself version and links to it; different intent, not cannibalization |
| `/mobile-detailing-vs-car-wash/` | self, no robots tag (defaults to index) | 705 | 4: home, blog index, services exterior and interior | none over 25% | **Keep, don't invest.** National question, answered by national sites in the AI panel (prompts 17, 22). Old blog posts 301 to it, so a 301 away would make a chain. The 41 to 44 "car wash" Maps searches a month in Feb and Mar (Windsor GBP keywords) are people wanting a car wash, not this page |
| `/lake-stevens/interior-detail.html` | self, index | 1,032 | 3: Lake Stevens, services, Mill Creek interior | **68% of its text** is shared with the Mill Creek interior page | **301 to `/lake-stevens/`** and move its one or two local paragraphs there. Its search ("interior detail lake stevens") has no impressions anywhere in the SC pull; the interior searches that do exist ("interior car detailing near me" 29 @ 8.3) go to `/services/interior.html` |
| `/mill-creek/interior-detail.html` | self, index | 1,024 | 3: Mill Creek, services, Lake Stevens interior | the same 68% | **301 to `/mill-creek/`**, same reason. Once Google crawls a pair this similar it tends to file one as "Duplicate" or "Crawled, not indexed", which is the next thing that would have happened |
| `/monroe/ceramic-coating.html` | self, index | 989 | 3: Monroe, services, Mill Creek ceramic | none over 25% | **Keep, link it from the ceramic county page** (row 9). Its content is its own. "ceramic coating cost monroe" had 40 impressions in 3 months at 27.5 on the county page, so there's a little Monroe ceramic demand looking for it |

How the similarity was measured: visible text with nav, header, footer,
scripts and styles removed, cut into 6-word runs, and the share of the smaller
page's runs that also appear in the other (script in this session's
scratchpad, run 2026-10-27). City pages that share process steps, pricing
and FAQs score 35 to 46% against each other; that's the template CLAUDE.md
allows. Above 55% the pages differ by little more than the town name.

**Before any 301:** the November Search Console pull should check two things
in Pages → the URL: (a) none of these has picked up impressions since Oct 14,
(b) for Mill Creek, which page "water spot removal mill creek" lands on (only
the Mill Creek paint page mentions water spots). Each 301 needs Mikey's yes:
it removes a page.

## 3. Cannibalization

From the SC query × page table (3 months to 2026-10-04) and the similarity
scan above:

| Topic | Pages competing | What SC shows | Do |
|---|---|---|---|
| **Paint correction** | `/paint-correction-snohomish-county/`, `/snohomish/paint-correction.html`, `/lake-stevens/paint-correction-in-lake-stevens.html`, `/mill-creek/paint-correction-in-mill-creek.html`, and since today the scratch post | 15, 2, 9 and 4 impressions in 3 months; the three city pages share 67 to 69% of their text with each other. The county page doesn't link any of them | Row 5: one strong page, the scratch post feeding it |
| **"car detailing snohomish"** | homepage 4.4, `/snohomish/` 44.5, `/services/interior.html` 42.6, `/services/exterior.html` 63, five more past 55 | Google has chosen the homepage as the Snohomish page | Leave it (the scoreboard said the same). Don't add "Snohomish" to more page titles |
| **Ceramic** | county page, Monroe and Mill Creek city pages | Only the county page has impressions (946); it also took "ceramic coating cost monroe" and "ceramic coating everett" (86 @ 28) | Not cannibalization yet, because the city pages aren't indexed. Link them (row 9) so Google can choose |
| **Everett** | `/everett/`, `/everett/exterior.html`, `/everett/interior.html` | The service pages share 55 to 60% with the city page and with each other; they had 12 and 2 impressions. "car detailing everett" went to `/everett/` (86 @ 30.6) | Don't add more. If Everett moves in November, fold these two into it in December |
| **Interior** | `/services/interior.html`, Lake Stevens and Mill Creek interior, `/everett/interior.html`, pet hair page, blog posts | `/services/interior.html` takes the interior searches (634 impressions @ 10.8) | Row 10 removes two; blog posts link to the services page, which is right |
| **"near me"** | 14 addresses on one query | Expected: Google picks by the searcher's location | Nothing to fix |

## 4. Lead attribution in the dashboard

Read from `mikeygabmiller/twillowdashbored`, live branch
`claude/qqc-submission-auto-text-cspjc3` at commit `1e9258c` (2026-10-24).
Read only; nothing changed.

### What's tracked

- **Every website visit is a journey** (`journeyStep`, `handlePixelEvents`,
  `src/index.js` around lines 5940 to 6030), keyed by the `md_vid` id
  `site-stats.js` keeps in the browser: every page path, the referrer of the
  first page, `utm_source`, `utm_campaign`, any ad click id (`gclid`,
  `gbraid`, `msclkid`, `fbclid`), the city from Cloudflare, and taps
  ("Tapped to CALL/TEXT", quote form steps). `site-stats.js` sends the query
  string (line 140), so the profile's `utm_` tags arrive.
- **At a quote** (`/submit`, line 1424) **and a booking** (line 17899) the
  worker reads that journey once and stamps the conversation's `origin`, first
  touch, never overwritten: `{ ch, utm, ad, ref }` (`markOrigin`, line 2768).
- **Channels** (`CHANNELS`, line 2703; `/api/channels`, line 2808): Google
  Ads, Meta, hangers, signs, postcards, cards, gift cards, Google search &
  Maps, social, word of mouth, other websites, direct, not sure. Revenue is
  real job money. Hangers and signs also credit by QR and by address.
- **Insights → Customers** (line 8132) splits leads, won, lost and revenue by
  how the lead arrived: quote, booking, call, text.

### What's blind

1. **Which page.** `markOrigin` keeps the referrer host but **not the landing
   page**. The page is in the journey, which expires after 45 days
   (`JOURNEY_TTL`, line 5837), and no report reads it. So "which page booked
   jobs" can't be answered today, and in six weeks the evidence is gone.
2. **Business Profile vs Google search.** `UTM_CHANNEL` maps both `google`
   and `gbp` to `search` (line 2727). The profile's links all carry
   `utm_campaign=google_profile` (`reports/2026-10-15-gbp.md`), and the journey
   stores `camp`, but `originChannel` never looks at it. The two biggest
   sources of free leads land in one bucket.
3. **The search query.** Google doesn't pass it to any site. The only proxy
   is landing page → that page's queries in Search Console, which is why
   blind spot 1 matters.
4. **Calls.** A call has no journey, so it lands in "Not sure yet" unless
   Mikey taps where they came from. The profile's Call button, the site's
   tap-to-call, cards and hangers all ring (425) 600-7897, so a call can't be
   told apart by number. The profile counts its own Call taps (0 to 10 a month,
   Windsor GBP, Nov 2025 to Sep 2026), which is the only check.

### The smallest change that ties a booking to a page

About 20 lines, no new data collected, no customer-facing text:

1. `journeyFirstTouch` also returns `land: first.p` and `camp: doc.camp`;
   `markOrigin` stores both on `thread.origin`.
2. A `gbp` row in `CHANNELS` ("Google Business Profile"), and
   `originChannel` returns it when `camp === 'google_profile'` before the
   `search` fallback.
3. `/api/channels` adds a "by landing page" table: leads, won, revenue per
   `origin.land`.

Because journeys keep 45 days, leads from the last six weeks could be
backfilled once from their journeys. It's a deploy to the dashboard, so it
follows that repo's `CLAUDE.md` (bump `BUILD`, full test suite) and needs
Mikey's yes; it doesn't text anyone or rewrite stored data, which are the
things that repo says to stop and ask about.

**Step two, only if calls turn out to be most of the jobs:** when a journey
records "Tapped to CALL" and a new number calls within two minutes, with one
candidate, credit that call to the journey's page. That's a heuristic and
deserves its own test; it's not in the smallest change.

## 5. Seasonality: November to March

### Google Trends, Seattle-Tacoma market (DMA 819), Oct 2021 to Sep 2026

Pulled 2026-10-27 from Google Trends' own API. Each term's monthly average
over five years, scaled so its year averages 100. Snohomish County has no
separate Trends market; it's inside Seattle-Tacoma.

| Term | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| car detailing | 88 | 104 | 115 | 118 | 124 | 116 | 111 | 98 | 88 | 75 | 75 | 85 |
| mobile detailing | 75 | 114 | 121 | 151 | 155 | 135 | 140 | 90 | 79 | 53 | 39 | 47 |
| ceramic coating | 86 | 98 | 123 | 126 | 126 | 120 | 109 | 109 | 91 | 69 | 71 | 73 |
| car wash | 88 | 92 | 95 | 116 | 123 | 122 | 137 | 122 | 91 | 72 | 67 | 74 |

Washington state, same method, for terms too thin for the metro (monthly
values jump around; read the shape, not the number):

| Term | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| mold in car | 296 | 316 | 263 | 43 | 59 | 27 | 0 | 0 | 27 | 0 | 32 | 136 |
| headlight restoration | 30 | 90 | 172 | 219 | 39 | 158 | 72 | 164 | 125 | 61 | 36 | 35 |
| car detailing near me | 90 | 102 | 122 | 127 | 129 | 127 | 108 | 109 | 68 | 76 | 66 | 78 |

"Paint correction", "pet hair removal" and "interior detailing" were too
sparse even at state level (most months zero) to read. Semrush, which would
give monthly volumes, had no API units (2026-10-27).

### His own Business Profile, the last 19 months

Windsor `google_my_business`, pulled 2026-10-27 (October is to the 26th):

| Month | Views | Calls | Website clicks |
|---|---|---|---|
| 2025-10 | 157 | 1 | 20 |
| 2025-11 | 209 | 0 | 25 |
| 2025-12 | 271 | 4 | 33 |
| 2026-01 | 216 | 6 | 20 |
| 2026-02 | 345 | 7 | 39 |
| 2026-03 | 361 | 10 | 47 |
| 2026-04 | 245 | 3 | 42 |
| 2026-05 to 07 | 176 to 198 | 3 to 4 | 12 to 35 |
| 2026-08 | 343 | 6 | 30 |
| 2026-09 | 589 | 7 | 23 |
| 2026-10 (to 26th) | 255 | 2 | 20 |

**What it says, and where it argues with the plans:**

- **November is the bottom; February and March are his best free-lead months
  so far.** March 2026 had 10 profile calls and 47 website clicks, the most
  of any month before the September ad push. Trends shows the same turn: the
  market climbs from February and peaks April to May. The profile was young in
  2025 (18 views in April 2025), so some of the climb is growth, but both
  sources point the same way.
- **"Mobile detailing" swings four times over a year** (39 in November, 155
  in May). It's a fair-weather search. Pages meant to catch spring demand have
  to be indexed before February, which means **live by mid-December**.
- **The one winter-only topic is damp and mold** (Washington, Jan to Mar
  about three times the yearly average, near zero in summer). That's an interior job, the site's second-best
  ticket. Row 7. Ask Mikey whether he treats mold before the word goes in
  (already flagged in the post queue, item 8).
- **The Nov 4 title test will look worse than it is.** Its windows are Sep 7
  to Oct 4 against Oct 6 to Nov 2. Season alone: car detailing 88 → 75
  (−15%), ceramic 91 → 69 (−24%), mobile detailing 79 → 53 (−33%). Read
  position and CTR; read clicks only after taking 15 to 30% off the "before".
  Row 2.

### "Paint correction, 113" probably wasn't 113 people

The scoreboard and CLAUDE.md lean on September's Business Profile keywords:
"detailing 141, paint correction 113". The daily numbers (Windsor, pulled
2026-10-27) show **253 of September's 318 desktop Maps views came on two days,
Sep 22 (91) and Sep 23 (162)**, with zero calls and zero website clicks on
either day. Every other day that month had 0 to 6. Neither keyword appears in
any other month of the 19, and desktop Maps fell back to 38 in October. That's
the pattern of something automated, or one person checking rankings from a
computer, not 113 customers. It doesn't make paint correction a bad page to
improve, but the case for it has to come from somewhere else: Mikey's own
paint jobs this year, and the November pull. Row 5 is sized on Search
Console, not on the 113.

## 6. Sizing: the model, and every opportunity

### The model (all assumptions written out)

| Step | Value used | Where it comes from |
|---|---|---|
| Local-intent click → lead (quote sent or call) | **5%** | Measured on paid clicks: 8 leads from 202 clicks, Aug 29 to Sep 30 (`reports/2026-10-15-google-ads.md`). Free local clicks assumed at least as good. M3 (45 started, 11 sent, Sep 7 to Oct 4) is consistent but has no visit count |
| Informational click → lead | **0.5%** | Assumption: a how-to reader is rarely ready to book. No data |
| Lead → booked job | **40%** | **Assumption.** No close rate exists in this repo. The dashboard computes it (Insights → Customers, `winRate` by source), and only Mikey can read it. This one number moves every row in the table proportionally |
| Average ticket | **$330** | Assumption from the price book: sedan Full $369, Interior $249, Exterior $199, SUV steps +$40. Ceramic from $500 and paint correction from $400 are sized at $650 and $500. The dashboard's `avgTicket` is the real number |
| So | **1 booked job ≈ 50 local clicks ≈ $330** | |
| For comparison | Ads: $58.57 per lead (live campaign, Aug 29 to Oct 15) ≈ $146 per booked job at 40% | `reports/2026-10-15-google-ads.md` |

### Each opportunity

| # | Move | Clicks/mo added | Leads | Jobs | $/mo | Assumptions beyond the model |
|---|---|---|---|---|---|---|
| 3 | Cost page title | 157 impr. × (3% − 0.42%) = +4 | 0.2 | 0.08 | $27 | Title change lifts CTR to his curve at the same position |
| 4 | Title rollout (Mill Creek, Monroe, Marysville) | Mill Creek 180 impr./mo 1.3% → 3% = +3; Monroe and Marysville about +2 each | 0.35 | 0.14 | $46 | Only if the test wins; CTR lift, no position change |
| 5 | Paint correction consolidation | 10 impr./mo today; if one page reaches position 8 on its local searches, maybe +3 to +8 | 0.15 to 0.4 | 0.06 to 0.16 (× $500/$330) ≈ 0.1 to 0.25 equiv. | $30 to $80 | Local paint searches are small in SC; this is the least certain row |
| 6 | Ceramic + RV | 153 impr./mo from about 13 to about 7: (3% − 1.5%) = +2.3; RV 38 impr./mo 16 → 8: +1; plus Everett ceramic 29 impr./mo at 28 | 0.2 to 0.3 | 0.08 to 0.12 (× $650/$330) ≈ 0.15 to 0.25 equiv. | $50 to $80 | Photos and the RV section are what moves position; the title already has the price |
| 7 | Winter-to-spring pages | 20 to 60 informational + 3 to 8 local in Feb to Apr | 0.25 to 0.7 | 0.1 to 0.3, call it 0.2 to 0.5 with the interior posts already live | $60 to $165 in season | Musty-smell and post-winter searches are partly local ("near me"), so some convert like local clicks |
| 8 | Everett | Semrush: about 990 searches/mo on six phrases (US database, 2026-10-05). Today about 0. At position 5: 990 × 6% = 59 | 3 | 1.2 | $390 | Requires position 5, which needs links and reviews; copy alone hasn't moved it (24 to 42 for three months) |
| 9 | Hub links | Monroe ceramic: 13 impr./mo at 27.5 → about 10 = +0.3 | small | 0.05 | $15 | Gets the page crawled first |
| 10 | Six pages | 0 | 0 | 0 | $0 | Housekeeping; frees hours |
| | **Total, rows 3 to 9** | | | **about 1.5 to 2.5** | **about $500 to $800 a month** by spring, mostly rows 7 and 8 | |

The total is small next to what the map pack and reviews are worth, and the
Everett row is half of it at the lowest confidence. Rows 3, 4 and 9 are an
hour together and pay back on the first job.

---

## Questions for Mikey

1. **How many quotes and calls turn into jobs?** Dashboard → Insights →
   Customers shows a win rate by source and an average ticket. Those two
   numbers replace the 40% and $330 every row above uses.
2. **Yes to the dashboard change in §4?** It stamps the landing page and splits
   "Google Business Profile" from "Google search" on every new lead. It
   doesn't text anyone and doesn't change stored data.
3. **Will you tap "where did you find me" on calls?** Calls are blind
   otherwise, and your profile's Call button is likely your biggest free lead
   source.
4. **Paint correction:** how many paint jobs have you done this year, and do
   you have one before-and-after photo (plate and house out of shot)? The
   September "113" looks like two days of automated or desktop checking on
   Sep 22 and 23, not customers. Did you or anyone check your Maps ranking from
   a computer those two days?
5. **OK to 301** the three city paint-correction pages into the county page,
   and the Lake Stevens and Mill Creek interior pages into their city pages?
   (Only after the November pull confirms they still have no impressions.)
6. **Do you treat mold or a musty interior?** If yes, a damp-carpet post goes
   up before mid-December for the January to March searches. If no, it's a
   smell post without the word.
7. **Windsor:** keep the Business Profile as the one free source, or pay so
   Search Console comes in too? Until then Search Console is read by hand once
   a month, and every query number in this report is three weeks old.

## Sources

- Search Console: hand pull 2026-10-07, 3 months and 28 days to 2026-10-04,
  tables in `reports/2026-10-scoreboard.md`.
- Business Profile: Windsor `google_my_business`, location
  `locations/8659452995326437651`, monthly Apr 2025 to Oct 26 2026, daily Aug
  20 to Oct 26 2026, search keywords Apr 2025 to Sep 2026, all pulled
  2026-10-27.
- Google Trends: trends.google.com API, geo US-WA-819 and US-WA, Oct 2021 to
  Sep 2026, pulled 2026-10-27.
- Semrush: volumes from the 2026-10-05 pull in the scoreboard; no API units
  on 2026-10-27, so nothing new.
- Google Ads: `reports/2026-10-15-google-ads.md`.
- Dashboard code: `twillowdashbored` at `1e9258c` (2026-10-24), live branch.
- Site HTML: `main` at `c1a868d` (2026-10-26).
