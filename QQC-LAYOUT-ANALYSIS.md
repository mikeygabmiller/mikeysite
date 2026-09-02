# Quick Quote Calculator — Service & Add-On Layout Analysis

**Prepared:** 2026-09-02 · **Scope:** How services and add-ons are laid out inside the
Quick Quote Calculator (`index.html`, `#booking` → `#qqcCard`, steps 1–5). Flow order,
choice architecture and add-on presentation — not a visual redesign. · **Business:**
Mikey's Mobile Detailing, Snohomish County WA.

---

## TL;DR — the verdict

**The flow is right. The menu inside it is too small.**

The step sequence you have (vehicle → detail → condition → extras → quote + capture) is
close to textbook, and the step-2 layout — one hero package with "Most Popular" over a
"build your own" pair — is already doing real choice-architecture work. Don't rebuild it.

The problem is the **ceiling**. Step 2's most expensive option is $299 and it is also the
one flagged Most Popular, so the highest-priced thing on the screen is the thing you're
steering people toward. Every add-on then reads as money *above* the top price. And the
whole add-on menu adds up to **$80** — a typical customer taps one or two, so the
calculator's realistic outcome band is about **$299–$350** on a site that also sells
$400–$700 paint correction, $500–$1,500 ceramic coating, $120–$220 pet hair removal, and
a $125/clean Clean Club. **None of those exist inside the calculator at all.**

Three things to fix, in order:

1. **A pricing mismatch that's live right now** — the calculator quotes an SUV full detail
   at **$319** while `/services` publishes **$339** and `/car-detailing-cost…` publishes a
   third set of numbers. Trucks are worse: $319 vs a published $379.
2. **Add-ons are presented as a price list, not as outcomes** — the only thing separating
   one chip from another is how much it costs, which is the exact frame in which people
   choose zero.
3. **No top tier and no bundle** — the two highest-leverage AOV moves in the research, and
   neither exists on the screen.

---

## The research this rests on

| Principle used | Source |
|---|---|
| Multi-step forms convert materially better than single-page equivalents (~14–21% lift for lead-gen; much larger in individual case studies); keep the visible journey to roughly 4–7 steps | [LeadGen — Multi-Step Forms](https://www.leadgen-economy.com/blog/multi-step-forms-conversion-optimization/) · [Venture Harbour](https://ventureharbour.com/multi-step-lead-forms-get-300-conversions/) |
| Three-tier "good-better-best" structures outperform both single-price and many-tier alternatives; conversion rises when people face three choices rather than ten-plus; the middle tier absorbs most volume | [Jobber — Good, Better, Best Pricing for Service Businesses](https://www.getjobber.com/academy/good-better-best-pricing-examples/) · [Monetizely — Does Three-Tier Still Work](https://www.getmonetizely.com/articles/good-better-best-does-the-three-tier-pricing-model-still-work-in-saas) |
| Tier spacing: the low tier shouldn't sit more than ~25% below the middle, and the top shouldn't exceed the middle by more than ~50% | [Leap — How to Present Good-Better-Best Pricing](https://leaptodigital.com/2022/11/18/how-to-present-good-better-best-pricing) |
| Cross-sells must carry enough attributes to be judged; most sites strip them down to a name and a price, which is the main reason they're ignored | [Baymard — Cross-Sell Recommendations: 6 List Item Attributes](https://baymard.com/blog/product-page-suggestions-information) · [Baymard — Recommend Alternative & Supplementary Products](https://baymard.com/blog/product-page-suggestions) |
| Limit add-on offers to roughly 1–3 targeted ones; a long list produces decision fatigue and fewer attachments than a short relevant one | [Monk — Increasing AOV at Checkout](https://monkcommerce.com/blogs/how-to-increase-aov-at-checkout) · [Usermaven — Sales Funnel Mistakes](https://usermaven.com/blog/sales-funnel-mistakes) |
| A single frictionless bundle / one-tap upgrade beats an à la carte list; bundles that *add* something incremental move AOV, bundles that repackage defaults don't | [Zipify — Bundle & FBT Upsells](https://zipify.com/blog-bundle-upsells-shopify-2026/) · [Loopwork — One-Click Upsell](https://www.loopwork.co/blog/one-click-upsell-shopify-how-to-offer-add-ons-one-tap-2026) |

---

## What's already right — do not touch

- **Vehicle first.** A three-tile, zero-typing, zero-commitment opener. It's the correct
  low-friction first step and it auto-advances on tap (`index.html:2096`).
- **Contact details last.** Name and phone appear only on step 5, after the number is on
  screen. This is the single biggest structural reason a multi-step quote form outperforms
  a contact form, and you have it.
- **The hero/duo split on step 2.** "Full Detail $299, Most Popular, Save $61 vs. buying
  separately" over an *or build your own* divider is a genuine anchor. The `refreshNudge()`
  behaviour — pick Interior + Exterior and the Full Detail card starts suggesting itself
  with "Switch to Full Detail and save $61" — is better than most paid configurators.
- **Add-ons filtered by chosen service.** `addonApplies()` builds only the extras that fit,
  rather than greying out the rest, and prunes stale selections when the service changes
  (`index.html:1975`, `1980`). Correct, and rarer than it should be.
- **Condition-aware recommendations with a stated reason.** `rec()` plus the `why` line is
  real personalization, and giving a *reason* for a recommendation is what makes it read as
  advice instead of an upsell.
- **The running total gated on a service, not on a number** — so picking an SUV first doesn't
  flash "Running total $20" and read as a surprise fee (`index.html:1885`).

---

## Problem 1 — the calculator underquotes what the rest of the site publishes

This is the one to fix before any layout work.

| Vehicle | Calculator (full detail) | `/services` pill row | `/car-detailing-cost…` |
|---|---|---|---|
| Sedan | **$299** | $299 | $299–$319 |
| SUV | **$319** | $339 | $319–$349 |
| Truck / Large | **$319** | $379 | $349–$379 |
| Van / XL SUV | **$339** | — | — |

The calculator's vehicle uplifts are `+$0 / +$20 / +$40` (`index.html:1638–1650`), and it
merges **SUV and Truck into one bucket** while your published price table separates them by
$40. A truck owner gets quoted $319 here and $379 on `/services`.

Three different price sets for the same vehicle is a trust problem on a site whose whole
pitch is *"no surprises, no hidden fees."* It's also margin: every truck full detail booked
through the calculator is $60 light.

**Fix:** pick the real numbers, then make the calculator the source of truth and reconcile
the two static pages to it. Likely that means four vehicle tiles (Sedan / SUV / Truck /
Van–XL) with uplifts of `+$0 / +$40 / +$80 / +$80`, or three tiles with SUV and Truck
genuinely priced the same and the static pages corrected to match.

---

## Problem 2 — there's no tier above the one you're recommending

Step 2 today:

```
   ┌──────────────────────────────────────┐
   │  ★ MOST POPULAR                      │   ← also the most expensive
   │  Full Detail            $299         │
   │  Save $61 vs. buying separately      │
   └──────────────────────────────────────┘
              — or build your own —
   ┌─────────────────┐ ┌─────────────────┐
   │ Interior  $200  │ │ Exterior  $160  │
   └─────────────────┘ └─────────────────┘
```

Everything on the screen is at or below $299. The "Save $61" line does good work, but it
anchors *downward* — it teaches that $299 is the top of the market and that anything more is
you charging extra.

The research is consistent that three tiers with a highlighted middle beat both a single
price and a long menu, and that the middle tier is where volume lands. Right now your
"middle" is your ceiling.

**The move: add a top tier and let $299 become the middle.**

```
   ┌─────────────────┐ ┌──────────────────────┐ ┌─────────────────┐
   │  Interior $200  │ │  ★ MOST POPULAR      │ │  Full Detail    │
   │  Exterior $160  │ │  Full Detail   $299  │ │  + Protection   │
   │  build your own │ │  Inside & out        │ │       $349      │
   └─────────────────┘ └──────────────────────┘ └─────────────────┘
```

Where the top tier is Full Detail plus the four existing extras — carpet shampoo ($20),
exterior polish ($30), ceramic wax ($20), RainX ($10) — which come to $379 à la carte.
Priced at **$349** it reads *"save $30,"* it's a one-tap decision, and it moves the ceiling
$50 without inventing a single new service. That spacing also sits inside the recommended
band: the low option is not more than ~25% below the middle, the top is well under +50%.

Two consequences worth naming:

- It **collides with vehicle-size pricing** if you show flat numbers. Show tiers as
  **"from $299"** and let the ticker resolve the exact figure, or apply the size uplift
  before rendering the tier prices.
- People who take the top tier skip step 4 entirely, which is fine — you've captured more
  than the average add-on attach would have produced anyway. Keep step 4 for them but
  pre-select the included extras and mark them *Included*, don't re-charge.

---

## Problem 3 — add-ons are a price list, not a menu

Every chip on step 4 renders as icon + name + `+$XX` (`index.html:1997`). The reason a chip
is worth taking lives in an *aggregated* line under the whole grid — *"Flagged for you
because carpets take the worst of it on a car that's overdue, and polish is what brings
paint back."* The justification is separated from the thing it justifies.

Baymard's finding on cross-sells is exactly this: strip an offer down to a name and a price
and the only available comparison is cost, so the rational answer is no.

**Fix — put the outcome and the time on the chip itself:**

```
   ┌──────────────────────────────────┐
   │  ★ RECOMMENDED                   │
   │  💧 Carpet Shampoo    +$20       │
   │  Lifts set-in stains and the     │
   │  smell that comes with them      │
   │  ~30 min                         │
   └──────────────────────────────────┘
```

You already have the time estimates published on `/car-detailing-cost…` (+30 min, +45 min,
+15 min) and the `why` strings written in `ADDONS`. This is mostly re-siting copy that
exists, not writing new copy.

**Also on step 4:**

- **Cap Recommended at one.** When condition is Needs Work or War Zone, *both* Carpet
  Shampoo and Exterior Polish get the gold flag. Two recommendations read as a sales
  sweep; one reads as advice. Flag the highest-value applicable one, leave the other plain.
- **Add a one-tap bundle row above the grid.** *"Add all four — $80 $65."* This is the
  single highest-AOV action available on the screen and the research favours it over the
  à la carte list. If the $349 tier ships, this becomes the same offer for people who
  arrived via Interior or Exterior only.
- **Make "something else" a chip, not a text box.** The `#qqAddonNote` input
  (`index.html:1770`) is a good idea in a format people skip. A fifth chip — *"Something
  else — pet hair, engine bay, headliner"* — that reveals the input on tap will get many
  times the fill rate, and it's how you surface the $120–$220 pet-hair job that currently
  has no route into the quote.

---

## Problem 4 — the $400+ services and the recurring plan have no door

Someone lands on `/ceramic-coating-snohomish-county` (a page that sells $500–$1,500 work),
scrolls to the calculator, and gets quoted $299 with no mention of coating anywhere in the
flow. Same for paint correction. Same for Clean Club at $125/clean — your highest-LTV
product, invisible inside your main conversion tool.

You don't need to price these in the calculator; they're genuinely custom. You need **one
line on the quote screen** so the flow doesn't silently close the door:

- Selected **War Zone** and/or **Exterior Polish** → *"Heavy swirls or scratches? Paint
  correction may be the better call — I'll flag it when I call you."*
- Any quote → *"Detail regularly? Clean Club members pay a flat $125 a clean."*

Both are text, both are free, and they catch the two segments worth the most per lead.

---

## Problem 5 — the running total on step 4 is untested and cuts both ways

The code comment says the ticker *"matters most on the add-on step, where each tap moves
it"* (`index.html:1948`). That's true — and it's the argument *for* it and *against* it at
the same time. Transparency is on brand, but watching $299 → $319 → $349 climb makes each
tap register as a penalty rather than an upgrade.

Don't guess this one. It's the cheapest A/B on the list: on **step 4 only**, hold the ticker
at the base price and show extras as a separate, smaller `+$50 extras` line beneath it.
Measure attach rate. Keep whichever wins.

---

## Minor — the step counter is wrong on first paint

`index.html:1628` hardcodes **"Step 1 of 4 · Your vehicle."** The JS says
`1: 'Step 1 of 5 · Your vehicle'` (`index.html:1862`), there are five progress segments, and
`goStep()` is never called on load — so the first thing a visitor reads is "of 4," and it
silently becomes "of 5" the moment they tap. Two-character fix, and it's the label sitting
directly above the first question.

---

## Ordering — one thing considered and rejected

Current order is vehicle → detail → **condition** → **add-ons** → quote. That means people
absorb one mandatory price increase (condition, up to +$60) immediately before being asked
to opt into another. Reversing them would put the optional upsell in front of the mandatory
uplift.

**Keep the current order anyway.** `rec()` depends on condition being known, so flipping
them costs you the personalized Recommended flag and the *"flagged for you because…"* line —
and a relevant recommendation is worth more than the ordering effect. The code comments at
`index.html:1737` also record that add-ons were deliberately split out of step 2 because
bundling them pushed Continue off the phone screen. That decision was right; leave it.

---

## Priority order

| # | Change | Effort | Why it's here |
|---|---|---|---|
| 1 | Reconcile vehicle pricing across calculator, `/services`, `/car-detailing-cost…` | ~30 min | Live trust problem; $60/truck margin leak |
| 2 | Fix the "Step 1 of 4" label | 2 min | First line a visitor reads |
| 3 | ~~Outcome + time copy on add-on chips; cap Recommended at one~~ **shipped** | ~1 hr | Highest-return cheap change on the screen |
| 4 | ~~One-tap "add all four" bundle row on step 4~~ **shipped** | ~1 hr | Best-evidenced AOV move available |
| 5 | ~~Third tier at $349 on step 2~~ **shipped** | half day | Biggest AOV lever; needs your pricing call first |
| 6 | Paint-correction and Clean Club lines on the quote screen | ~30 min | Free capture of the two highest-LTV segments |
| 7 | "Something else" as a chip | ~30 min | Routes the $120–$220 pet-hair job into the funnel |
| 8 | A/B the step-4 ticker | 1 hr + wait | Genuinely unknown; don't guess |

Items 1, 2, 3, 6 and 7 are all safe to ship without a decision from you. **Item 5 needs you
to confirm the $349 number and what's in it** before anything gets built.


---

## Update — 2026-09-02: items 3, 4 and 5 shipped

Built and verified against a real browser (28 assertions, 320–1280px). What changed:

**Step 2 — third tier.** *Full Detail + Protection, $349*, carrying the four extras
($80 à la carte). $299 keeps the Most Popular flag and becomes the middle choice.

**Step 4 — chips carry outcomes.** Each chip is now name + price on one row, with what
it does to the car and how long it adds beneath. The flagged chip states why it's flagged
for *this* car; the aggregated "flagged for you because…" paragraph under the grid is
gone, since it separated the justification from the thing it justified. Only ever one
Recommended flag — `recRank` decides which extra earns it.

**Step 4 — one-tap bundle.** *"Add all four — save $30."* $10 off per extra past the
first, so it scales: three applicable extras save $20, two save $10, one shows no bundle.

**The invariant that mattered most.** The tier and the bundle are two routes to one
basket, so they must never produce two prices. `bundleDiscount()` is *derived from what's
ticked*, never stored — ticking all four by hand costs exactly what tapping the bundle
costs ($349 base, $399 on an SUV in Needs Work condition either way), and the Protection
tier suppresses the discount because its price already contains it. Both routes are
asserted equal in the test.

### Two bugs found while building

- **Stale add-ons briefly double-charged.** Add-ons were only pruned when step 4 next
  painted, but the running total is live on step 2 — switching Full Detail + four extras
  over to the Protection tier showed **$429** (the tier plus the extras it already
  includes) until step 4 cleaned it up. Pruning now runs the moment the service changes.
- **The card was rendering ~70px left-shifted on step 4** — slicing the left edge off
  every label on a phone. Pre-existing, reproduced identically on `main`. Nothing actually
  overflows (force `scrollLeft` to 0 and no descendant exceeds the client box), so
  `goStep()` now pins `scrollLeft` on each step.

### Still open

Item 1, the vehicle-price mismatch, is **not** fixed and is now worse than the doc says:
the Services-section ballpark estimator on the homepage uses a **fourth** set of numbers
(`interior 160 / exterior 130 / full 260`). That's four price sets for one job. It needs
your decision on the real numbers before anyone can reconcile them.

Also unshipped: the step counter fix (item 2), the Clean Club / paint-correction lines on
the quote screen (item 6), the "something else" chip (item 7), and the step-4 ticker A/B
(item 8).
