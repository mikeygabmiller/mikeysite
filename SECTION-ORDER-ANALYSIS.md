# Homepage Section-Order Analysis v3 — mikeysdetailing.com

**Prepared:** 2026-07-25 · **Supersedes:** v1 (2026-07-23), v2 (2026-07-25 morning)
**Scope:** the ORDER of sections in `index.html`, plus the mobile height and headline
line-breaking work that came out of it. No copy was rewritten.
**Business:** Mikey's Mobile Detailing, Snohomish County WA — solo owner-operator, mobile,
appointment-based, review-driven local trade.

> **v3 status: the v2 recommendations are now implemented and re-measured.** Section
> "RESULTS — measured before vs after" below is the verification. Everything else in this
> document is the reasoning and sourcing behind those changes, kept for the record.

---

## RESULTS — measured before vs after

All numbers from headless Chromium at 390×844 (phone), same method before and after.

### Where the money sections landed

| Asset | Before | After | Change |
|---|---|---|---|
| **Free Exterior Offer** (the countdown deal) | 8,407px · **54.1%** | 6,166px · **40.3%** | The whole offer now *ends* at 48% — countdown and CTA included — so it sits entirely above the ~55% median mobile scroll depth. Before, the median visitor saw only its headline. |
| **Before & After** (strongest proof) | 7,099px · **45.7%** | 4,386px · **28.6%** | Moves from "half of mobile misses it" to seen by most. |
| Services menu (3.1 screens tall) | 4,479px · 28.8% | 7,318px · 47.8% | Still comfortably above the median, but no longer blocking the two above it. |

### The CTA dead zones

| | Before | After |
|---|---|---|
| Worst CTA-free stretch | **3,690px / 4.4 screens** (spanned the entire Trust band) | **2,006px / 2.4 screens** — down 46% |
| Second-worst | **2,615px / 3.1 screens** (spanned all of Before & After) | **1,543px / 1.8 screens** |
| Stretches over 3 screens | 2 | **0** |

### Page height and headlines

| | Before | After |
|---|---|---|
| Mobile page height | 15,526px (18.4 screens) | **15,311px (18.1 screens)** — and that is *after* adding two new CTA bands, so the spacing work saved roughly 650px |
| How It Works height | 2.1 screens | **1.9 screens** |
| Guarantee height | 2.2 screens | **1.9 screens** |
| Headlines ending in a single orphaned word (measured at 320/360/390/414/430px) | **27 instances** | **0** |
| Headlines breaking mid-word at a hyphen | 1 ("One Jaw- / Dropping Car.") | **0** |
| Horizontal overflow at any tested width | none | **none** |

Desktop grew slightly (12,364px → 12,720px) from the two added CTA bands. That is the right
trade: desktop scroll depth runs ~70% vs ~55% on mobile, and mobile is where this business
gets booked.

### What was changed, precisely

1. **Moved `#beforeafter` above `#allservices`** — desire before catalog.
2. **Moved `#free-exterior-offer` to directly follow it** — the countdown now rides the
   transformation peak instead of sitting under a 3.1-screen menu.
3. **Moved the photo strip up** to sit between Before & After and the offer as reinforcement,
   instead of interrupting offer → guarantee.
4. **Added a CTA band under the Trust band** — closes the 4.4-screen dead zone that sat on top
   of the Google-review card. Review count is bound to `site-stats.js` via `data-md-reviews`,
   so it stays in sync.
5. **Added a CTA band under Before & After** — closes the 3.1-screen dead zone at peak desire.
6. **Repointed the "pick your service" link** in How It Works from `#allservices` to
   `#booking`, since service selection actually happens inside the Quick Quote Calculator.
7. **Compressed How It Works and the Guarantee on mobile** — padding and margins only, no
   content removed, desktop untouched.
8. **Fixed every headline widow** — `text-wrap: balance` on headings, `text-wrap: pretty` on
   body copy, `&nbsp;` binding the last two words of the five headlines that still orphaned,
   a non-breaking hyphen in "Jaw‑Dropping", and mobile type trims so the bound pairs fit
   without overflow.
9. **Added scroll-depth and section-reach tracking** — see the next section.

### Verified working after the move

Checked in a real browser: the offer's live countdown still runs (read "2D 18H 38M 27S"), the
Quick Quote Calculator keeps all 4 steps, the Before & After drag slider works, all 13 sections
are tagged, and there are **no JavaScript errors**. (Some external image CDNs fail to load
inside the test sandbox because outbound requests to them are blocked there — unrelated to
these changes.)

---

## The scroll tracking, and how to actually look at it

GA4's built-in scroll tracking fires **one** event, at 90% depth — it cannot tell you who
reached 25%, 50% or 75%, and it cannot tell you which *section* people stopped at
([Analytics Mania](https://www.analyticsmania.com/post/scroll-tracking-with-google-analytics-4-and-google-tag-manager/),
[Root & Branch](https://www.rootandbranchgroup.com/ga4-scroll-tracking/)). The usual fix needs
Google Tag Manager; this site loads `gtag` directly, so the tracking is written straight into
`site-stats.js` instead — no GTM, no new dependency.

**Three ways to see it, easiest first:**

1. **On your phone, right now:** open **`mikeysdetailing.com/?scrollcheck`**. A panel sticks to
   the bottom of the screen showing your live scroll %, the page height in screens, and every
   section with the % of the page it starts at — ticking green as you reach it, and showing
   red for any section past the 55% median line. This is the fastest way to sanity-check the
   page yourself, with no waiting and no dashboard.
2. **GA4 → Reports → Engagement → Events.** Look for `scroll_depth` (fires at 25/50/75/90/100)
   and `section_view` (fires once per section, with the % of the page it sits at). *The one
   number that matters:* how many people fire `section_view` for `7-OFFER` versus `1-hero` —
   that ratio is the share of visitors who actually reach the countdown deal. A `scroll_summary`
   event also fires on exit with each visitor's deepest point, since milestone events alone
   get lost when someone closes the tab mid-scroll.
3. **Clarity → Recordings → Filters → Custom tags.** Filter by `max_scroll` or
   `deepest_section` to watch recordings of only the people who bailed early
   ([Clarity custom tags docs](https://learn.microsoft.com/en-us/clarity/filters/custom-tags)).

Tracking only fires on the live domain, so local previews don't pollute the numbers. The
`?scrollcheck` overlay works anywhere. To track a new section, add `data-md-section="name"` to
it — nothing else to wire up.

**This replaces the industry-average scroll figures used in this analysis with your own
traffic.** Give it two weeks, then re-check whether the offer's reach actually improved.

---

## What changed since v1

v1's five recommended moves **were implemented** (PR #43, #44). I re-measured the live page
to confirm, and the block order now matches what v1 asked for. That part is done.

This v2 is a different, harder look. Instead of reasoning about order on paper, I **rendered
the actual page in a real browser at real phone and desktop sizes and measured where every
section physically lands in pixels**, then compared those positions against published
scroll-depth data. That surfaced two problems v1 could not have seen, because they only
show up when you know how *tall* each section is:

1. Your strongest desire asset and your entire limited-time offer sit **at or below the point
   where the median mobile visitor stops scrolling**.
2. There are **two enormous stretches of page with nothing to click** — 4.4 screens and 3.1
   screens — and they sit on top of your best proof and your best desire asset.

---

## Method (so you can check my work)

- Rendered `index.html` in headless Chromium at **390×844** (typical phone) and **1440×900**
  (typical laptop), scrolled the full page to trigger lazy content, then read the real
  `getBoundingClientRect()` top offset and height of all 13 sections.
- Separately enumerated every visible, tappable in-page CTA (`#booking` links, `tel:` links,
  buttons), excluding the sticky bar, and measured the vertical gaps between them.
- Compared those measurements to published benchmarks on scroll depth, CTA placement, social
  proof placement, and offer/urgency placement. Every claim below is tagged with its source.

Raw numbers are in the two tables that follow — nothing here is estimated.

---

## MEASURED: where your sections actually land today

**Mobile (390×844) — total page height 15,526px = 18.4 screens**

| # | Section | Top (px) | Screens down | Section height | % into page |
|---|---|---|---|---|---|
| 1 | Hero | 140 | 0.2 | 0.8 scr | 0.9% |
| 2 | Quick Quote Calculator | 790 | 0.9 | 0.8 scr | 5.1% |
| 3 | Trust band | 1,428 | 1.7 | 1.5 scr | 9.2% |
| 4 | How It Works | 2,669 | 3.2 | 2.1 scr | 17.2% |
| 5 | **Services menu** | 4,479 | 5.3 | **3.1 scr** ← biggest block | 28.8% |
| 6 | **Before & After** | 7,099 | 8.4 | 1.5 scr | **45.7%** |
| 7 | **Free Exterior Offer** | 8,407 | 10.0 | 1.4 scr | **54.1%** |
| 8 | Photo strip | 9,559 | 11.3 | 0.3 scr | 61.6% |
| 9 | Guarantee | 10,014 | 11.9 | 2.2 scr | 64.5% |
| 10 | About Mikey | 11,875 | 14.1 | 0.9 scr | 76.5% |
| 11 | FAQ | 12,620 | 15.0 | 1.2 scr | 81.3% |
| 12 | Final CTA band | 13,646 | 16.2 | 0.9 scr | **87.9%** |
| 13 | Explore links | 14,436 | 17.1 | 0.2 scr | 93.0% |

**Desktop (1440×900) — total 12,364px = 13.7 screens.** Same order, same shape; the offer
lands at 53.9%, Before & After at 43.5%, final CTA at 90.2%. Mobile is the harsher case and
mobile is where this business gets booked, so the rest of this document uses mobile numbers.

---

## Finding 1 — your offer sits exactly on the mobile drop-off line

Measured mobile scroll depth for landing pages runs about **55% on mobile vs 70% on desktop**,
and **64% of mobile visitors never scroll past the first viewport at all**
([shno.co landing-page conversion statistics](https://www.shno.co/marketing-statistics/landing-page-conversion-statistics)).
Broader benchmarks put landing-page average scroll depth at **40–60%**
([Sleek Analytics](https://getsleek.io/blog/what-is-scroll-depth), [Personizely](https://www.personizely.net/glossary/scroll-depth)).

55% of your 15,526px mobile page = **8,539px**.

- Your **Free Exterior Offer starts at 8,407px** and runs to 9,559px.
- So the median mobile visitor reaches the *headline* of the offer and stops — **before the
  countdown timer and before the offer's CTA.**
- Your **Before & After slider starts at 7,099px (45.7%)** — roughly half of mobile visitors
  never reach your single best piece of visual proof.
- Your **final CTA is at 87.9%**. Effectively nobody on mobile sees it.

This matters more for you than for most businesses because your offer is genuinely
action-forcing — real scarcity ("I only open a few spots a week"), a real deadline, a live
countdown. Urgency should be placed **where the decision happens, not buried under product
copy** ([ConvertCart](https://www.convertcart.com/blog/limited-time-offer-examples),
[Instapage](https://instapage.com/blog/scarcity-examples),
[Unbounce](https://unbounce.com/landing-pages/5-ways-to-use-scarcity-on-your-landing-page-with-examples/)).
Right now it's placed past the point where half the audience has left.

## Finding 2 — the 3.1-screen Services menu is what's pushing everything down

Your Services menu is **3.1 screens tall — the largest block on the page** — and it sits at
position 5, *above* both the transformation proof and the offer. It alone accounts for
2,620px of the 7,099px that a visitor must scroll before reaching Before & After.

A long service menu is a **consideration** asset: it's what someone reads once they already
want the thing. The before/after transformation is what *creates* the wanting — and for a
visual trade like detailing, that's the engine. Spending a third of your mobile scroll budget
on a catalog before you've made anyone want it is the ordering mistake.

Note also: the "pick your service" link in How It Works step 1 (`index.html:2589`) points
down to `#allservices`, but the service picking actually happens **inside the Quick Quote
Calculator** ("Build your detail. Get a price in 60 seconds."). That link should point to
`#booking`, which is *above* the reader — not to a menu that's two screens below.

## Finding 3 — two huge stretches of page with nothing to click

Measured gaps between visible CTAs on mobile (sticky bar excluded):

| Gap | Size | What it spans |
|---|---|---|
| 592px → 4,282px | **3,690px = 4.4 screens** | The whole **Trust band** (Google 5.0 · 39 reviews, guarantee seal, testimonial) and all of How It Works |
| 6,735px → 9,350px | **2,615px = 3.1 screens** | The whole **Before & After** section |
| 9,935px → 11,567px | 1,632px = 1.9 screens | Most of the Guarantee section |

The first two are the leaks, and they're the worst possible places for them.

The research here is unusually consistent: social proof should sit **adjacent to a CTA**, not
in its own isolated zone — a testimonial directly next to the button creates the association
that makes hesitant visitors act ([The Good](https://thegood.com/insights/social-proof/),
[Mouseflow](https://mouseflow.com/blog/social-proof-for-cro/),
[Spinutech](https://www.spinutech.com/digital-marketing/analytics/conversion/the-role-of-social-proof-in-cro-why-it-matters-and-how-to-optimize-it/)).
And on long pages you should **repeat the same CTA after each major section — typically after
the value prop, after social proof, and at the bottom** — with 3–5 instances of one single
action being the standard recommendation
([Bitly](https://bitly.com/blog/cta-button-best-practices-for-landing-pages/),
[SeedProd](https://www.seedprod.com/call-to-action-best-practices/),
[LandingPageFlow](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages)).

Right now your proof lands and then hands the reader nothing to do for 4.4 screens, and your
best desire asset does the same for 3.1 screens.

*(Your sticky mobile call/book bar partly covers this, and it's the right call to keep —
sticky mobile CTAs are credited with 15–25% conversion lift on long pages
([Bitly](https://bitly.com/blog/cta-button-best-practices-for-landing-pages/)). But a sticky
bar is ambient; an in-context CTA right under a five-star review is a specific ask at a
specific moment, and they are not substitutes.)*

## Finding 4 — the photo strip is the weakest asset in a strong position

The plain photo strip is **0.3 screens tall** — the smallest block on the page — and it
currently sits at position 8, *between the offer and the Guarantee*, interrupting the
offer → reassurance → close chain. It's also largely redundant with the Before & After
slider, which is the stronger version of the same idea (interactive before/after sliders
outperform static photo galleries for exactly this purpose —
[Design Detail](https://www.designdetail.io/blog/car-detailing-website-best-practices-conversions)).

---

## RECOMMENDED LAYOUT

The arc: **front-load the ready buyer, then create want, then force action — all above the
55% mobile line. Everything below that line is objection handling for people already
engaged.**

```
                                                    projected     % into
                                                    mobile pos      page
  ─── ATTENTION ────────────────────────────────────────────────────────
   1. HERO                                            0.2 scr        1%
      service + area + 5.0★/39 + "I come to you"
      + risk reversal + quote CTA + tap-to-call        (keep)

  ─── ACTION (catch the already-sold) ──────────────────────────────────
   2. QUICK QUOTE CALCULATOR                          0.9 scr        5%
      "Build your detail. Price in 60 seconds."        (keep)

  ─── PROOF ────────────────────────────────────────────────────────────
   3. TRUST BAND                                      1.7 scr        9%
      Google 5.0 · 39 reviews · guarantee seal
      ✚ ADD CTA HERE  ← closes the 4.4-screen gap

  ─── HOW (kill the "how does mobile even work" fear) ──────────────────
   4. HOW IT WORKS                                    3.2 scr       17%
      three steps, zero effort                         (keep)
      ⚑ repoint "pick your service" → #booking

  ─── WOW (desire) ─────────────────────────────────────────────────────
   5. BEFORE & AFTER            ▲ up from 6           5.3 scr       29%
      + photo strip merged in as reinforcement
      ✚ ADD CTA HERE  ← closes the 3.1-screen gap

  ─── OFFER (act now, while attention is still there) ──────────────────
   6. FREE EXTERIOR + COUNTDOWN ▲ up from 7           7.4 scr       40%
      ★ entire offer now sits above the 55% line

  ─── WHAT (now that they want it, what do they book) ──────────────────
   7. SERVICES MENU             ▼ down from 5         8.8 scr       48%
      full menu + concierge / Clean Club

  ─── REASSURE ─────────────────────────────────────────────────────────
   8. GUARANTEE — "Love It Guarantee"                11.9 scr       65%
   9. ABOUT MIKEY — "who's coming to my house"       14.1 scr       77%

  ─── OBJECTIONS ───────────────────────────────────────────────────────
  10. FAQ                                            15.0 scr       81%

  ─── CLOSE ────────────────────────────────────────────────────────────
  11. FINAL CTA BAND                                 16.2 scr       88%

  ─── SEO (outside the conversion arc) ─────────────────────────────────
  12. EXPLORE / MORE DETAILING INFO                  17.1 scr       93%
```

### What this buys you, in measured terms

These are block moves — total page height is unchanged at 15,526px — so the gain is purely
from *what lands above the mobile drop-off line*:

| Asset | Now | After | Effect |
|---|---|---|---|
| **Before & After** | 7,099px · 45.7% | 4,479px · **28.8%** | moves from "half of mobile misses it" to seen by most |
| **Free Exterior Offer** | 8,407px · 54.1% | 6,242px · **40.2%** | **the entire offer — countdown and CTA included — now ends at 48%, fully above the 55% median** |
| Services menu | 4,479px · 28.8% | 7,394px · 47.6% | still above the median line, but no longer blocking |

The offer is the one that matters. Today the median mobile visitor sees the offer's headline
and nothing else. After the move, they see the headline, the countdown, and the button.

---

## The moves, in priority order

**Do these two first — they're the biggest measured leaks, and neither touches copy:**

1. **Add a CTA to the Trust band** (after the Google review card / testimonial, `.trust-section`).
   Closes a 4.4-screen dead zone sitting on your strongest proof. Reuse the existing
   `GET YOUR INSTANT QUOTE →` + tap-to-call pair.
2. **Add a CTA directly under Before & After** (`#beforeafter`). Closes a 3.1-screen dead zone
   at the peak of desire. Same button pair.

**Then the re-sequencing — three block moves:**

3. **Move `#beforeafter` above `#allservices`** (position 6 → 5).
4. **Move `#free-exterior-offer` to immediately follow it** (position 7 → 6), so the countdown
   rides the transformation peak and lands at 40% instead of 54%.
5. **Move the photo strip up into/directly under `#beforeafter`** as reinforcement — or cut it.
   Either way it stops interrupting offer → guarantee.

**Small fix:**

6. **`index.html:2589`** — repoint the "pick your service" link from `#allservices` to
   `#booking`, since service selection happens in the calculator.

**Worth considering, not an order change:**

7. The mobile page is **18.4 screens**. Long pages are correct for a considered purchase —
   long-form pages generate materially more leads when the offer needs explaining
   ([Woobox](https://woobox.com/articles/long-vs-short-landing-pages),
   [Brand House](https://brandhousela.com/blog/how-long-should-a-landing-page-be-short-vs-long-pages/))
   — but two blocks are disproportionate: **How It Works is 2.1 screens for three steps** and
   the **Guarantee is 2.2 screens**. Tightening those two by ~40% would lift everything below
   them by roughly a screen and a half.

Every move above is reversible and none of them rewrites a sentence.

---

## What is already right — don't touch it

- **Hero.** Service + area in the H1, 5.0★/39 reviews and "300+ cars" above the fold, risk
  reversal stated, one primary CTA plus tap-to-call, price visible. That is the full
  home-service checklist, and it matters because 64% of mobile visitors never get past this
  screen ([shno.co](https://www.shno.co/marketing-statistics/landing-page-conversion-statistics),
  [BeKind Local](https://bekindlocal.com/the-high-converting-checklist-for-home-service-landing-pages-in-2026/),
  [Built-Right Digital](https://builtrightdigital.com/home-service-landing-page-design/)).
- **Calculator at position 2 (0.9 screens down).** Correct. It catches the visitor who is
  already sold, and the faster they submit, the more the speed-to-lead advantage compounds
  ([HBR](https://hbr.org/2011/03/the-short-life-of-online-sales-leads),
  [Lead Response Management study](https://www.leadresponsemanagement.org/lrm_study)).
- **Trust band at position 3.** Reviews immediately after the ask is right, and reviews are
  decisive for local buyers — **97% of US consumers read reviews for local businesses, 85% are
  more likely to use a business after reading positive ones**, and recent reviews carry the
  most weight ([BrightLocal Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/)).
  It just needs a button attached.
- **Guarantee → About → FAQ → Final CTA → Explore.** The tail is correctly ordered:
  reassurance, then who-am-I trust, then objections, then the close, then SEO links outside
  the funnel ([CXL](https://cxl.com/blog/how-to-build-a-high-converting-landing-page/),
  [Shopify](https://www.shopify.com/blog/high-converting-landing-pages)).
- **Sticky mobile call/book bar.** Keep it. 15–25% lift on long pages
  ([Bitly](https://bitly.com/blog/cta-button-best-practices-for-landing-pages/)).

---

## Sources

**Scroll depth & attention**
1. shno.co — *Landing Page Conversion Statistics 2026* (mobile vs desktop scroll depth 55%/70%; 64% of mobile never scroll past viewport one; mobile = 60% of traffic but 40% of conversions). https://www.shno.co/marketing-statistics/landing-page-conversion-statistics
2. Sleek Analytics — *What Is Scroll Depth Tracking* (landing pages 40–60% average scroll depth). https://getsleek.io/blog/what-is-scroll-depth
3. Personizely — *Scroll Depth: Meaning & Examples*. https://www.personizely.net/glossary/scroll-depth
4. Nielsen Norman Group — *Scrolling and Attention* (attention concentrates above and just below the fold). https://www.nngroup.com/articles/scrolling-and-attention/

**CTA placement & repetition**
5. Bitly — *Landing Page CTA Button Best Practices* (repeat one CTA after each major section; sticky mobile CTA 15–25% lift). https://bitly.com/blog/cta-button-best-practices-for-landing-pages/
6. SeedProd — *Call to Action Best Practices* (3–5 instances of a single CTA on a standard page). https://www.seedprod.com/call-to-action-best-practices/
7. LandingPageFlow — *Best CTA Placement Strategies for 2026 Landing Pages* (above-fold vs mid-page vs final). https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages
8. Unbounce — *Call to Action Examples*. https://unbounce.com/conversion-rate-optimization/call-to-action-examples/

**Social proof placement**
9. The Good — *Leveraging Social Proof to Improve Your Conversion Rate* (place proof near the CTA / friction point). https://thegood.com/insights/social-proof/
10. Mouseflow — *Using Social Proof for CRO* (testimonial adjacent to the button). https://mouseflow.com/blog/social-proof-for-cro/
11. Spinutech — *The Role of Social Proof in CRO*. https://www.spinutech.com/digital-marketing/analytics/conversion/the-role-of-social-proof-in-cro-why-it-matters-and-how-to-optimize-it/

**Offer / urgency placement**
12. ConvertCart — *Limited-Time Offer Examples* (place urgency where the decision happens; not buried under copy). https://www.convertcart.com/blog/limited-time-offer-examples
13. Instapage — *10 Scarcity Examples for Landing Pages*. https://instapage.com/blog/scarcity-examples
14. Unbounce — *5 Ways to Use Scarcity on Your Landing Page*. https://unbounce.com/landing-pages/5-ways-to-use-scarcity-on-your-landing-page-with-examples/
15. Venture Harbour — *19 Ways to Add Urgency to Landing Pages (2026)*. https://ventureharbour.com/add-urgency-to-your-landing-pages-with-examples/

**Page structure & funnel order**
16. CXL — *How to Build a High-Converting Landing Page: Anatomy, Structure & Design*. https://cxl.com/blog/how-to-build-a-high-converting-landing-page/
17. Shopify — *High Converting Landing Pages: 8 Best Practices*. https://www.shopify.com/blog/high-converting-landing-pages
18. Landingi — *25 Landing Page Best Practices That Convert in 2026* (each section earns the next scroll; CTA at peak interest). https://landingi.com/landing-page/41-best-practices/
19. Woobox — *Long vs Short Landing Pages: Which Wins (and When)*. https://woobox.com/articles/long-vs-short-landing-pages
20. Brand House — *How Long Should a Landing Page Be?* https://brandhousela.com/blog/how-long-should-a-landing-page-be-short-vs-long-pages/
21. Prospeo — *AIDA Model Examples* (Attention → Interest → Desire → Action page layout). https://prospeo.io/s/aida-model-examples
22. LeadScripts — *Sales Page Copywriting Formula: PAS, AIDA & Other Proven Frameworks*. https://leadscripts.co/sales-page-copywriting-formula-pas-aida-other-proven-frameworks/

**Home-service & auto-detailing specific**
23. BeKind Local — *The High-Converting Checklist for Home Service Landing Pages in 2026*. https://bekindlocal.com/the-high-converting-checklist-for-home-service-landing-pages-in-2026/
24. Built-Right Digital — *Landing Page Design for Home Service Companies*. https://builtrightdigital.com/home-service-landing-page-design/
25. Contracting Empire — *Contractor Landing Pages: 8 Tips To Boost Your Conversion Rate*. https://contractingempire.com/contractor-landing-pages/
26. DemandConvert — *Landing Page Optimization: A Practical Playbook for Local Contractors*. https://demandconvert.com/learn/blog/landing-page-optimization-a-practical-playbook-for-local-contractors/
27. Gatorworks — *The Anatomy of a High-Converting Home Services Website*. https://gatorworks.net/anatomy-high-converting-home-services-website/
28. Design Detail — *Car Detailing Website Best Practices: Converting Visitors to Customers* (before/after sliders outperform static galleries; pricing tables; mobile booking). https://www.designdetail.io/blog/car-detailing-website-best-practices-conversions

**Local reviews & trust**
29. BrightLocal — *Local Consumer Review Survey 2026* (97% read reviews; 85% more likely to use a business after positive reviews; recency now weighted most; rising 4.5★ floor). https://www.brightlocal.com/research/local-consumer-review-survey/
30. Digital Applied — *Online Review Statistics 2026: Trust and Local SEO Data*. https://www.digitalapplied.com/blog/online-review-statistics-2026-consumer-trust-data

**Speed-to-lead (why the calculator belongs high)**
31. Harvard Business Review — *The Short Life of Online Sales Leads*. https://hbr.org/2011/03/the-short-life-of-online-sales-leads
32. Lead Response Management Study (Dr. James Oldroyd, MIT Sloan / InsideSales.com). https://www.leadresponsemanagement.org/lrm_study

**Headline line-breaking / widows (v3)**
33. MDN — *`text-wrap` CSS property*. https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap
34. MDN — *`text-wrap-style` CSS property* (`balance`, `pretty`, `stable`). https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap-style
35. Can I Use — *CSS `text-wrap: balance` support table* (Chrome/Edge 114+, Firefox 121+, Safari 17.5+). https://caniuse.com/css-text-wrap-balance
36. Chrome for Developers — *CSS `text-wrap: balance`*. https://developer.chrome.com/docs/css-ui/css-text-wrap-balance
37. modern.css — *Balance Headlines in CSS with `text-wrap: balance`* (use `balance` on headings, `pretty` on body copy). https://modern-css.com/balanced-headlines-without-manual-line-breaks/
38. Wikipedia — *Widows and orphans* (definition; a widow is a short dangling final line). https://en.wikipedia.org/wiki/Widows_and_orphans
39. Davey & Krista — *Avoid Orphans and Widows in Typography* (widows interrupt the eye's skim and read as unfinished; matters most in marketing material). https://daveyandkrista.com/design-tip-avoid-orphans-typography/
40. Montana State University — *University Publications Typography Guide* (avoid leaving a short word alone on a final line). https://www.montana.edu/creativeservices/upubstypography.html

**Scroll-depth instrumentation (v3)**
41. Analytics Mania — *Scroll Tracking with Google Analytics 4* (GA4 Enhanced Measurement fires a single scroll event at 90%). https://www.analyticsmania.com/post/scroll-tracking-with-google-analytics-4-and-google-tag-manager/
42. Root & Branch — *GA4 Scroll Tracking: Track 25%, 50%, 75% and More*. https://www.rootandbranchgroup.com/ga4-scroll-tracking/
43. Microsoft Learn — *Custom tags in Clarity* (`clarity("set", key, value)`; filter recordings and heatmaps by tag). https://learn.microsoft.com/en-us/clarity/filters/custom-tags

### Sourcing notes

- All pixel positions, section heights, and CTA-gap measurements in this document were taken
  from the live `index.html` rendered in headless Chromium on 2026-07-25 — they are measured,
  not estimated. Re-running the measurement after any layout change will shift them.
- The "~100× contact / ~21× qualification" speed-to-lead multipliers originate in the 2007
  MIT/InsideSales study (Oldroyd); HBR's 2011 article contributed the 42-hour average response
  time and the "7× within an hour" finding. Both are cited so the numbers trace to their
  origin rather than the common misattribution.
- Scroll-depth benchmarks are industry aggregates, not measurements of *your* traffic. If you
  want the exact number for this site, `site-stats.js` already fires a first-party beacon —
  adding scroll-depth milestones (25/50/75/100%) to it would replace every estimate above with
  your own data, and is the single best next step for validating this plan.
