# Mikey's Mobile Detailing — 12-Month SEO + AIEO Growth Plan

**Owner:** Mikey · **Started:** 2026-08-01 · **Horizon:** 2027-08-01
**Supersedes:** `SEO-ROADMAP.md` (kept for the city-data table)

---

## 0. The one-sentence strategy

> The site already converts. The machine already answers. **The only remaining job is
> volume** — so every hour spent from here goes into being the answer that Google's Map
> Pack, Google's classic results, and the AI assistants all hand to someone in Snohomish
> County who needs their car detailed.

Everything below is downstream of that. If a task doesn't put more qualified people into
the quote calculator, it isn't in this plan.

---

## 1. Where you're starting (audited 2026-08-01)

**Assets that are genuinely strong — don't rebuild these:**

| Asset | State |
|---|---|
| Site | 34 real pages, static, fast, GitHub Pages |
| Quote calculator | **Fully on-domain now** (the old `github.io` leak is closed — 0 references left) |
| Schema | LocalBusiness, FAQPage, BreadcrumbList, Review, AggregateRating, OfferCatalog, Speakable |
| Booking machine | Cloudflare Worker + Twilio: quote → instant auto-text → owner alert → dashboard |
| Analytics | GA4 + Microsoft Clarity + first-party pixel + `generate_lead` on every tap-to-call/text |
| Proof | 5.0★ · 40 reviews · 300+ cars |
| Stats plumbing | `site-stats.js` — one number updates the whole site |

**Gaps found in the code — these are the plan's raw material:**

| # | Gap | Why it costs you | Fixed in |
|---|---|---|---|
| G1 | Brand images on **third-party free hosts** (`iili.io` OG image, `i.ibb.co` logo) | One host outage = every social preview and logo on 34 pages breaks. Also zero Google Images traffic. | Phase 1 |
| G2 | Blog lives at **`blog.mikeysdetailing.com`** (43 references) | Subdomain splits your entity + link authority in half, and AI retrieval treats it as a separate site | Phase 1 |
| G3 | ~~**No `Organization` / `Person` entity schema**~~ | ~~Machines can't resolve "Mikey" to a real person.~~ | ✅ **Done** — one `@graph` per page, `#business` / `#mikey` / `#website` anchored |
| G4 | ~~`robots.txt` is 4 lines, no AI-crawler declarations~~ | — | ✅ **Done** |
| G5 | ~~No `llms.txt`~~ | — | ✅ **Done** |
| G6 | `site-stats.js` **rewrites JSON-LD client-side** | Most AI crawlers don't run JavaScript. The HTML fallbacks (currently `40`) are what they actually read — they must never go stale. | ✅ Documented in the file + the weekly checklist |
| G7 | Only **8 cities** in `areaServed`; 7 more mapped but unbuilt | Every unbuilt city is a Map Pack you're not in | Phase 4 |
| G8 | **Zero off-site presence** (no Reddit, Nextdoor, or directory footprint in evidence) | Community platforms account for ~52% of AI citations — you're invisible in the biggest AI source pool | Phase 5 |
| G9 | No AI-visibility measurement of any kind | You cannot improve what you don't score | Phase 0 |

---

## 2. The scoreboard — 5 numbers, checked the 1st of every month

Everything in this plan moves one of these. Log them in one sheet, one row per month.
**Takes 20 minutes a month. Do not skip it — this is what makes the plan a plan.**

| # | Metric | Where | Why it's on the list |
|---|---|---|---|
| **M1** | GBP: searches shown, calls, direction requests, website clicks | GBP → Performance | ~70% of detailing leads originate here |
| **M2** | Total impressions, clicks, avg. position | Search Console, 28-day | Classic organic |
| **M3** | Quote-calculator **starts → completions** | GA4 | Your funnel's true throughput |
| **M4** | Review count + **reviews added this month** | GBP | Velocity outranks volume |
| **M5** | **AI citation rate** (of 25 fixed prompts, how many name you) | Prompt panel, §6 | The AIEO KPI nobody's tracking |

---

## 3. The SMART goals

Framed the SMART way: **S**pecific · **M**easurable · **A**chievable · **R**elevant · **T**ime-bound.

### 🎯 North Star (12 months)

> **Triple the number of monthly quote-calculator completions that originate from organic
> search + Google Maps — from the Month-0 baseline to 3× that baseline — by 2027-08-01,
> without increasing ad spend.**

- **Specific:** organic + Maps sourced completions only. Not total traffic, not referrals.
- **Measurable:** GA4 quote-completion event, segmented by source/medium.
- **Achievable:** 3× over 12 months on a 34-page site with a 5.0★ profile and near-zero
  local competition doing this properly. Review velocity alone typically moves Map Pack
  rank within 90 days.
- **Relevant:** completions are booked-job precursors. This *is* revenue.
- **Time-bound:** 2027-08-01, with the quarterly checkpoints below.

**Checkpoints:** 1.3× by Month 3 · 1.8× by Month 6 · 2.4× by Month 9 · 3.0× by Month 12.

> ⚠️ **Week 1 must establish the baseline**, or the North Star is meaningless. That's
> literally task one of Phase 0.

### 🎯 Supporting goals

| ID | SMART goal | Deadline |
|---|---|---|
| **SG1** | Grow from **40 → 120 Google reviews** by averaging **1.5 new reviews/week**, tracked weekly. Milestones: 60 by M3 · 80 by M6 · 120 by M12. | 2027-08-01 |
| **SG2** | Rank in the **Map Pack top 3** for "mobile detailing near me" from **8 of 12** geo-grid points across the service area (measured monthly with a grid tracker). | Month 9 |
| **SG3** | Get named by **AI assistants in ≥ 60% of a fixed 25-prompt panel** (baseline it in Week 2; expect a near-zero start). Milestones: 20% by M3 · 40% by M6 · 60% by M12. | Month 12 |
| **SG4** | Publish **1 answer-layer page or 1 city page per month, 12 total**, each with unique local research, full schema, and 2+ internal inbound links. **Never bulk-publish.** | Monthly |
| **SG5** | Consolidate the blog to **`mikeysdetailing.com/blog/`** with 301s, and self-host every brand image, eliminating all third-party image dependencies. | Month 2 |
| **SG6** | Reach **NAP-consistent listings on 15 directories** (Yelp, Apple Maps, Bing Places, Nextdoor, Facebook, Angi, Thumbtack, BBB, Alignable, Yellow Pages, Manta, Hotfrog, Chamber of Commerce, Waze, Foursquare). | Month 6 |
| **SG7** | Keep **LCP < 2.0s and INP < 200ms** on mobile for the homepage and all city pages, verified monthly in PageSpeed Insights. | Ongoing |

---

## 4. Why AIEO matters here, and how it actually works

Worth understanding before the tactics, because most "AIEO advice" online is nonsense.

**There are two completely different ways an AI names your business, and they need
opposite strategies:**

### Path A — Retrieval-time (this is 95% of what you can win)
Perplexity, Google AI Overviews, ChatGPT with search, Gemini, and Claude with search all
run a live web search when asked, pull back a handful of pages, and synthesize an answer
from them. **This is winnable in weeks, not years.** You win it by being:

1. **Retrievable** — indexed, crawlable, not blocked, fast.
2. **Quotable** — your facts sit in short, self-contained, extractable chunks.
3. **Corroborated** — the same facts about you appear on GBP, Yelp, Reddit, and your site.
   Models weight agreement across independent sources heavily.

For a *local* query specifically, the retrieval corpus leans on Google Business Profile,
review aggregators, directories, and Reddit threads — often **more than** on your own
website. That's why Phases 2 and 5 aren't optional side quests.

### Path B — Training-time (slow, but permanent)
The base models "know" businesses that were widely written about before their training
cutoff. You influence this only by accumulating genuine third-party mentions over years.
**Don't chase this directly.** It's the compounding byproduct of doing Path A well.

### The practical translation

| Principle | What it means for your pages |
|---|---|
| **Answer-first** | Every page: an H2 phrased as the exact question, then a **40–60 word bolded answer** that stands alone with no context. Models lift these verbatim. |
| **Fact density beats prose** | "An interior detail on a mid-size SUV in Snohomish County runs $200–$280 and takes 3–4 hours" gets cited. "We provide premium detailing services" never does. Numbers, ZIPs, durations, neighborhood names. |
| **Entity clarity** | One `@graph` per page: `Organization` → `Person` (founder) → `Service` → `Place`, all `@id`-anchored. Machines must be able to resolve you to exactly one entity. |
| **No JS-gated facts** | Most AI crawlers don't execute JavaScript. Anything `site-stats.js` injects is invisible to them — **the raw HTML values are the ones that count.** |
| **Consistency across sources** | Price ranges, hours, phone, and service list must be byte-identical on the site, GBP, and every directory. Contradictions make models drop you. |

---

## 5. The phases

Each phase lists **Do this** (concrete, checkable) and **Done when** (the exit test).

---

### ▸ Phase 0 — Instrument (Week 1–2) · *~4 hours total*

**You cannot run a 12-month plan without a Month-0 row.** Nothing else starts until this is done.

**Do this:**
1. Verify Search Console for **both** `mikeysdetailing.com` and `blog.mikeysdetailing.com`. Submit both sitemaps.
2. In GA4: mark quote-**completion** as a key event. Build one exploration: *conversions by source/medium × landing page*.
3. Export the last 90 days of GBP Performance data before it rolls off (GBP only keeps 6 months).
4. Create the tracking sheet: one tab for **M1–M5 monthly**, one tab for the **prompt panel** (§6), one tab for the **geo grid** (§SG2).
5. **Write the Month-0 baseline row.** All five metrics. This is the number the North Star multiplies.
6. Run PageSpeed Insights on the homepage + 3 city pages; record LCP/INP as the SG7 baseline.

**Done when:** the sheet has a complete Month-0 row and both properties are verified in GSC.

---

### ▸ Phase 1 — Entity foundation (Month 1–2) · *the code phase*

This is where I can do most of the work for you. It's the highest-leverage code you'll
ever ship on this site, because it's what every later phase compounds on top of.

> **Status: items 2–5 and 7 are shipped.** All 35 pages now carry one linked entity
> graph. Remaining: **item 1 (self-host the images — needs you to download two files)**
> and **item 6 (blog migration — needs the blog's content)**.

**Do this:**

1. ⬜ **Self-host the brand images** (fixes G1) — **needs you; I can't reach those hosts**
   Save these two files and drop them in `/images/`, then tell me and I'll swap every
   reference sitewide in one pass:
   - `https://iili.io/qKtjLcx.jpg` → `/images/og-image.jpg` (resize to 1200×630)
   - `https://i.ibb.co/Kxzv8C6d/logo.jpg` → `/images/logo.jpg`

   Also worth mirroring the `lh3.googleusercontent.com` job photos into `/images/` —
   Google-hosted URLs are outside your control and earn you nothing in Google Images.

2. ✅ **Build the entity `@graph`** (fixes G3 — *biggest AIEO win in the plan*)
   Replace the flat `LocalBusiness` block with a linked graph on every page:
   ```
   Organization  @id: https://mikeysdetailing.com/#business
     ├─ founder → Person @id: .../#mikey
     │    knowsAbout: [paint correction, ceramic coating, interior detailing, …]
     ├─ areaServed → GeoCircle (center + 25mi radius) + every City
     ├─ makesOffer → Service ×N, each with its own @id and Offer
     └─ mainEntityOfPage → WebPage @id: <this page>
   ```
   Add `foundingDate`, `paymentAccepted`, `currenciesAccepted`, `slogan`, and
   `hasCredential` if applicable. Every page's schema points back to the *same*
   `#business` `@id`. That's what turns 34 pages into one confident entity.

3. ✅ **Add a real `Person` entity for you.** Live at [`/about/`](https://mikeysdetailing.com/about/)
   — Mikey Miller, Owner & Detailer, detailing since 2021, with `knowsAbout`, `worksFor`
   and `founder` wired both ways into the graph on all 35 pages. E-E-A-T for classic SEO,
   and the entity AI engines look for when deciding whether a business is real.

4. ✅ **Rewrite `robots.txt`** (fixes G4) — AI crawlers explicitly welcomed, blog sitemap declared.

5. ✅ **Add `llms.txt`** (fixes G5) — plain-text map of who you are, what you charge, where
   you work, and your best pages. Honest assessment: crawlers mostly ignore it today and
   Google has said it won't support it. But it cost 30 minutes and the downside is zero.

6. ⬜ **Consolidate the blog to `/blog/`** (fixes G2) — **needs the blog's content**; the
   posts aren't in this repo. Export them from `blog.mikeysdetailing.com` and I'll move
   them in, 301 the subdomain, and update all 43 references in one commit.

7. ✅ **Guardrail for G6:** documented in `site-stats.js` and in the weekly checklist —
   *when you bump `reviewCount`, the hardcoded HTML values must be bumped too*, because
   JS-blind crawlers only ever see the HTML. (They're in sync at `40` today.)

**Done when:** zero third-party image hosts, `@graph` validates clean in the Rich Results
Test on all 34 pages, blog serving from `/blog/` with 301s live, `robots.txt` + `llms.txt`
deployed.

---

### ▸ Phase 2 — The review + GBP engine (Month 2–4) · *highest ROI per hour in the entire plan*

GBP is ~32% of local ranking weight; reviews are ~20%. Together that's **over half of
everything**, and it's the half your competitors neglect. It's also disproportionately
what AI assistants read when answering "who's the best detailer near me."

**Do this — weekly, forever:**

1. **Automate the review ask.** You already have Twilio + the Worker. Add a delayed job:
   **2 hours after** a job is marked complete, text the `g.page/r/CRCuKQ982VIZEBE` link.
   Two hours beats immediately — the car has dried, they've shown a family member, the
   feeling has set. **This one automation is most of SG1.**
2. **Coach the review content.** Ask them to mention **city + service**:
   *"interior detail in Lake Stevens."* Reviews containing a city name are a genuine local
   relevance signal, and they're what AI engines quote back when asked about that city.
3. **Reply to every review within 24 hours**, using the service and city naturally in the
   reply. Owner responses are a ranking signal and they're indexed text.
4. **GBP post 1×/week.** Rotate: a before/after, a seasonal tip, an offer, a city callout.
5. **Photos 2×/week, geotagged**, named descriptively (`interior-detail-lake-stevens-suv.jpg`)
   — not `IMG_4471.jpg`.
6. **Seed GBP Q&A with your own top 10 FAQs**, answered by you as the owner. This is
   literally an AI-readable FAQ sitting on the highest-authority page about your business.
7. **Complete every GBP field**: all services with descriptions + prices, all attributes
   (mobile, appointment required, LGBTQ+ friendly, etc.), full service-area city list.
8. **Confirm the primary category is `Car Detailing Service`** and add every relevant
   secondary. Primary category is the single most powerful GBP lever — a wrong one caps
   your ceiling no matter what else you do.

**Done when:** the review automation is live and unattended, and you've hit 4 consecutive
weeks at ≥1 new review/week.

---

### ▸ Phase 3 — The answer layer (Month 3–6) · *1 page/month*

Build the pages AI engines quote. These target **question** queries — lower commercial
intent per visit, but they're what gets you *named*, and being named is what wins the
"who should I hire" query later.

Each page: answer-first block under the H1 → detailed body → FAQ schema → internal links
to the relevant city + service pages → a quote-calculator CTA.

**Queue (in priority order):**

| Month | Page | Target question |
|---|---|---|
| M3 | `/how-much-does-mobile-detailing-cost-seattle-area/` | "how much does mobile detailing cost near me" |
| M4 | `/ceramic-coating-worth-it-pacific-northwest/` | "is ceramic coating worth it in rainy climates" |
| M5 | `/detailing-checklist-what-you-actually-get/` | "what's included in a full detail" |
| M6 | `/how-often-should-you-detail-your-car-washington/` | "how often should I detail my car" |

**Also upgrade your 4 existing guides** with the answer-first format — they're already
written and indexed, so this is the cheapest AIEO win available. Reformat, don't rewrite:
`car-detailing-cost-snohomish-county`, `how-long-does-car-detailing-take`,
`best-time-to-detail-car-washington`, `mobile-detailing-vs-car-wash`.

**Done when:** all 4 existing guides are reformatted and 4 new answer pages are live.

---

### ▸ Phase 4 — Geographic expansion (Month 4–9) · *1–2 cities/month, never more*

Each new city page is a new Map Pack you can appear in. But **bulk-publishing near-duplicate
city pages is how sites get flagged as doorway spam** — pace it, and make each one genuinely
local. If you can't write 200 words about a city that only someone who's worked there could
write, don't publish it yet.

**Queue (from the old roadmap, re-prioritized by population × affluence × drive time):**

| Order | City | ZIP | Lat, Lng | Local hooks to actually write about |
|---|---|---|---|---|
| 1 | **Lynnwood** | 98036 | 47.8279, -122.3051 | Alderwood, I-5/405 grime, Link light rail, apartment-dweller pain (no hose) |
| 2 | **Edmonds** | 98020 | 47.8107, -122.3774 | Ferry, the Bowl, waterfront, **salt air on clear coat** |
| 3 | **Mukilteo** | 98275 | 47.9445, -122.3046 | Ferry line, Paine Field, Harbour Pointe, bluff homes |
| 4 | **Woodinville** | 98072 | 47.7543, -122.1635 | Wine country, estates, premium/ceramic demand |
| 5 | **Arlington** | 98223 | 48.1987, -122.1251 | Smokey Point, airport, work trucks, rural acreage |
| 6 | **Stanwood** | 98292 | 48.2415, -122.3496 | Camano, farmland, boats/RVs, coastal grime |
| 7 | **Granite Falls** | 98252 | 48.0832, -121.9676 | Mountain Loop, trail mud, lifted trucks |

**Every city page needs, without exception:** unique 400+ word local body · full entity
`@graph` incl. `AutoDetailing` + FAQ + Breadcrumb · a **real photo taken in that city** ·
inbound links from 2–3 neighbor city footers + the homepage list · a sitemap entry · the
city added to homepage `areaServed`.

**Also:** add a **geo-grid rank check** to the monthly routine — 12 points across the
service area, checking Map Pack position for "mobile detailing near me." That's how SG2
gets measured, and it tells you exactly which city to build next.

**Done when:** 7 new city pages live, `areaServed` at 15 cities, geo grid tracked monthly.

---

### ▸ Phase 5 — Off-site authority (Month 6–12) · *the AIEO force multiplier*

Community platforms account for roughly **half of all AI citations**. Right now you have no
presence in that pool at all — this is your single largest untapped AIEO surface.

**Do this — 30 minutes/week, and be genuinely useful, not promotional:**

1. **Reddit.** Answer real questions in r/Snohomish, r/Seattle, r/SeattleWA, r/AutoDetailing.
   Lead with expertise, mention the business only when directly relevant or asked. Reddit is
   heavily represented in AI retrieval; a single well-upvoted comment can get you named for
   years. Spammy self-promo gets removed and does nothing — **the helpfulness is the tactic.**
2. **Nextdoor**, in each service-area city. Local-recommendation threads are gold and are
   exactly what "best detailer near me" queries surface.
3. **15 directories** with byte-identical NAP (SG6). AI engines lean on aggregators for
   local facts — this is how you get corroborated.
4. **Local partnerships** for real backlinks: used-car lots, mobile mechanics, body shops,
   car clubs, apartment complexes (mobile detailing solves the no-hose problem — pitch a
   resident-perk deal).
5. **One local press mention.** A Snohomish/Everett community blog or paper. Pitch an angle,
   not an ad: *"local detailer explains what PNW rain actually does to your clear coat."*

**Done when:** 15 directories consistent, 10+ genuine community contributions, 3+ real
inbound links from local sites.

---

### ▸ Phase 6 — Compound (Month 9–12 and onward)

By now the machine runs itself and you're tuning rather than building.

- **Double down on what converts.** GA4 tells you which cities and pages produce booked
  jobs. Build more of those; quietly retire what produces nothing.
- **Seasonal campaigns.** Pollen (Apr–Jun) · road salt & winter prep (Oct–Dec) · pre-sale
  detail (year-round, high intent) · spring reset (Mar).
- **The membership funnel.** Cheapest growth in the business isn't SEO at all — it's the
  Clean Club. A recurring customer costs nothing to acquire twice.
- **Quarterly content refresh.** Update prices, dates, and stats on existing pages.
  Freshness is a ranking signal and stale prices actively hurt AI citation accuracy.

---

## 6. The AI prompt panel — how SG3 gets measured

**Set up once, run monthly, ~30 minutes.** This is the only honest way to know whether AIEO
is working. Almost nobody does this, which is precisely why it's an edge.

**Method:** run each prompt in **ChatGPT, Perplexity, Gemini, Claude, and Google AI
Overviews** (5 engines). Use a logged-out / temporary-chat session so personalization and
memory don't fake a result. Score **1** if you're named, **0** if not. Rate = named ÷ 125.

**The 25 prompts:**

*Direct intent (1–8)*
1. Best mobile car detailing in Snohomish WA
2. Mobile detailing near me Snohomish County
3. Who does mobile car detailing in Lake Stevens WA
4. Mobile car detailer Everett Washington
5. Best car detailing Monroe WA
6. Mobile detailing Mill Creek WA
7. Car detailing that comes to you Marysville WA
8. Mobile auto detailing Bothell WA

*Service-specific (9–15)*
9. Ceramic coating Snohomish County
10. Paint correction near Everett WA
11. Pet hair removal car detailing Washington
12. Interior car detailing Snohomish WA
13. Truck detailing Snohomish County
14. Mobile detailing for apartment dwellers Seattle area
15. Boat/RV detailing Snohomish County *(gap-finder — do you want this business?)*

*Question / research (16–21)*
16. How much does mobile car detailing cost in the Seattle area
17. Is mobile detailing worth it vs a car wash
18. How long does a full car detail take
19. Best time of year to detail a car in Washington
20. Is ceramic coating worth it in the Pacific Northwest
21. How often should I detail my car in a rainy climate

*Comparison / decision (22–25)*
22. Mobile detailing vs drive-through car wash which is better
23. What should I look for in a mobile detailer
24. Cheapest vs best car detailing Snohomish County
25. Mobile detailer that takes card and comes to your driveway WA

**Log per row:** date · prompt · engine · named? (1/0) · what it said · which source it cited.

**The cited-source column is the most valuable data in this entire plan.** It tells you
exactly which sites the AI trusts for your market — and that list *is* your Phase 5 target
list. If Yelp keeps getting cited and you're barely on Yelp, that's your next hour of work,
identified by evidence instead of guesswork.

---

## 7. The operating rhythm — what "consistently working toward it" actually looks like

The plan above is the map. **This is the part you actually run.** ~3 hours/week.

### Every week (~2.5 hrs)
- [ ] **Review asks fired** on every completed job (automated after Phase 2 — just verify)
- [ ] **1 GBP post**
- [ ] **2 geotagged photos** uploaded, descriptively named
- [ ] **Reply to every new review** within 24h, naming city + service
- [ ] **30 min off-site**: one genuinely helpful Reddit/Nextdoor/FB answer
- [ ] If `reviewCount` changed → **bump `site-stats.js` AND the hardcoded HTML values**

### Every month (~3 hrs, 1st of the month)
- [ ] **Log M1–M5** in the tracking sheet
- [ ] **Run the 25-prompt panel** (§6) and log it
- [ ] **Geo-grid check**, 12 points
- [ ] **Ship the month's one page** (SG4)
- [ ] **PageSpeed check** on homepage + 2 city pages
- [ ] **Read GSC Queries**: any keyword at position 5–15 is a page one edit away from page one

### Every quarter (~2 hrs)
- [ ] Compare the quarter's numbers against the checkpoint targets in §3
- [ ] Refresh prices/dates/stats across existing pages
- [ ] Re-audit the top 3 competitors' GBPs — categories, review velocity, photo cadence
- [ ] **Adjust the plan.** A 12-month plan that never changes is a 12-month guess.

---

## 8. Sequencing — if you only ever do part of this

Ranked strictly by lead impact per hour. If a week collapses, protect the top of this list.

1. **The review automation** (Phase 2, #1) — one build, permanent compounding. Do it first.
2. **GBP weekly cadence** — posts, photos, Q&A, replies. Half of local ranking weight.
3. **The entity `@graph` + self-hosted images** (Phase 1) — one-time code, fixes real
   fragility, unlocks AIEO.
4. **Answer-first reformat of the 4 existing guides** — cheapest AIEO win on the site.
5. **The prompt panel** — cheap, and it aims everything else.
6. **City pages** — steady, slow, compounding.
7. **Off-site/community** — slowest to pay, largest AI ceiling.
8. **llms.txt** — free lottery ticket. Genuinely might do nothing.

---

## 9. Honest risks

| Risk | Reality | Mitigation |
|---|---|---|
| **Proximity caps you** | You can't rank in the Map Pack 25 miles from your base, no matter how good you are. This is the hard ceiling on SG2. | City pages + service-area settings capture the classic-organic and AI paths that *aren't* proximity-bound |
| **AIEO is young and shifts fast** | Anyone selling certainty about AI citations is guessing. The tactics here are the durable ones (entity clarity, fact density, corroboration) precisely because they're also just good SEO. | Re-run the panel monthly; let evidence steer |
| **Doorway-page penalty** | Mass-published thin city pages are an actual, common penalty. | Hard cap: 1–2/month, each genuinely local |
| **Review gating is against Google's TOS** | Never filter for positive reviews only. Ask everyone. | Ask all customers; a 4.9 with 120 reviews outperforms a 5.0 with 40 |
| **You are the bottleneck** | Every hour here competes with detailing a car at $200/hr. | The weekly list is 2.5 hours. Automate the review ask so it's not 5. |
| **Plan abandonment** | The #1 failure mode. Month 3 is where these die. | The monthly scoreboard is the antidote — visible progress is what sustains it |

---

## 10. What happens next

**This week:** Phase 0. Baseline everything. It's 4 hours and nothing else counts without it.

**Then:** Phase 1 is mostly code — tell me and I'll ship the entity graph, self-host the
images, migrate the blog, and reformat the guides. That's the biggest single lift in the
plan and it's the part you don't have to do by hand.

**Already shipped with this plan:** `robots.txt` (AI crawlers explicitly welcomed, blog
sitemap declared) and `llms.txt` — Phase 1 items #4 and #5, done.
