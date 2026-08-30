# Snohomish Detailing - Search - 2026 — Launch Runbook

Campaign id `24190821998` · Account `862-091-0274` · $10/day · Manual CPC

**Do not touch** `LocalServicesCampaign:SystemGenerated:000656d997750be5`
(id `24043356917`) — it is the only ENABLED campaign in the account.

---

## Verified state (read back from the Google Ads API, 2026-08-30)

| Thing | State | Verified? |
|---|---|---|
| Campaign `24190821998` | PAUSED | yes |
| Ad groups (6) | all PAUSED | yes |
| Responsive search ads (6) | all PAUSED, all **APPROVED** | yes |
| Campaign negative keywords | 45 present | yes |
| Language criterion | `1000` (English) | yes |
| Device criteria | `30000` / `30001` / `30002` (mobile/tablet/desktop) | yes |
| **Location criteria** | **none — campaign is geographically unrestricted** | yes |
| Extensions / assets | could not read (see note) | **no** |

Ad group ids:

| Ad group | id |
|---|---|
| Mobile Detailing | `199348858069` |
| Cost & Pricing | `199582444053` |
| Interior | `199582455973` |
| Core Detailing | `203278187681` |
| Same Day | `203534243950` |
| Near Me | `208123677308` |

Ad ids (`ad_group_id` ~ `ad_id`), all APPROVED and paused:

```
199348858069~822558479913    203278187681~822558459309
199582444053~822675133910    203534243950~822602259490
199582455973~822558480858    208123677308~822602249182
```

**Note on extensions:** the connector's asset tables return zero rows for this
account at every date range tried. Assets that have never served produce no
report rows, so the two call extensions and the two sitelink URLs could not be
confirmed from the API. The steps below assume they are as described.

**Also unverified:** `ad_group_cpc_bid_micros` reads null for all six ad groups,
but that column reads null account-wide (including for the live LSA campaign),
so it is a connector gap, not proof the bids are unset. Check the Max CPC column
in the UI before enabling — manual CPC with no ad group bid will not serve.

---

## Blockers — all UI, in order

Confirmed against `list_actions` on the Windsor.ai `google_ads` connector:
there is **no** location/geo targeting action, **no** conversion action tooling,
and `create_ad_asset` is create-only (no update, no delete). These five cannot
be automated from here.

### 1. Remove the wrong call extension

Keep **(425) 600-7897**. Delete **(360) 797-5831**.

Assets → Calls (or Campaign → Assets → Calls) → find (360) 797-5831.

**Check the level column before removing.** If that number is linked at
*account* level rather than campaign level, removing it there affects every
campaign in the account. Remove it at the campaign level for `24190821998`
only; if it is account-level, unlink it from this campaign rather than
deleting the asset outright.

### 2. Conversion action for (425) 600-7897

Goals → Conversions → Summary → **New conversion action** → **Phone calls** →
**Calls from ads** (calls from your call asset / call-only ads).

- Phone number: **(425) 600-7897** — must match the kept call extension exactly
- Category: **Phone lead** (under Contact)
- Count: **One** (a solo detailer wants one lead per caller, not per call)
- Call length threshold: 30–60s (filters misdials)
- **Mark as Primary** — required, or bidding and the Conversions column ignore it

Do this *before* enabling, so calls are tracked from the first click rather
than retroactively lost.

### 3. Geo targeting

The campaign currently has **no location criterion at all**, so it is unrestricted.
This is the single most expensive thing to get wrong: $10/day against nationwide
search intent for a mobile detailer who drives to the customer.

Settings → Locations → **Enter another location** → type `Snohomish, Washington`
→ hover the result → **Radius** → `5` miles → Target.

Then remove any leftover United States / all-countries entry so 5-mile Snohomish
is the *only* positive location.

### 4. Location option — Presence

Same Locations panel → **Location options** → choose:

> **Presence:** People in or regularly in your targeted locations

Not the default "Presence or interest: People in, regularly in, or who've shown
interest in your targeted locations". The default will serve to someone in
Florida searching "car detailing Snohomish", and you cannot detail their car.

### 5. Sitelink URLs

Two sitelinks point at anchors that do not exist on mikeysdetailing.com
(verified against `index.html` — `id="faq"` and `id="guarantee"` are absent,
`id="qanda"` and `id="about"` are present):

| Sitelink target | Change to |
|---|---|
| `https://mikeysdetailing.com/#faq` | `https://mikeysdetailing.com/#qanda` |
| `https://mikeysdetailing.com/#guarantee` | `https://mikeysdetailing.com/#about` |

Assets → Sitelinks → hover the sitelink → pencil icon → edit Final URL → Save.

Editing in place keeps the sitelink's identity. Do **not** create replacements
and leave the originals — the connector cannot delete assets, so duplicates
would serve alongside the broken ones.

(Alternative if editing the sitelinks proves awkward: add `id="faq"` and
`id="guarantee"` alias anchors to `index.html` next to the existing sections.
Fixing the ads side is cleaner and leaves the site alone.)

---

## 6. Enable — only after 1–5 are done

Order matters: campaign, then ad groups, then ads. Enabling an ad inside a
paused ad group does nothing; enabling the campaign first means the moment an
ad goes live it can serve.

This step **can** be run through the connector on request:

```
enable_campaign   campaign_id=24190821998
enable_ad_group   x6   (ids above)
enable_ad         x6   (ad_group_id + ad_id pairs above)
```

Held deliberately until steps 1–5 are confirmed. Enabling with no location
criterion set would spend the $10/day budget on nationwide traffic.

---

## First 48 hours after enabling

- Search terms report daily — broad match on 18 keywords with a fresh account
  will pull junk; add campaign negatives as they appear
- Confirm the call conversion action leaves "No recent conversions" once a real
  call lands
- Watch that all six ads stay APPROVED after they start serving

---

# Keyword & copy work — 2026-08-30

## Research source

Google Keyword Planner via the connector, seeded with five detailing terms,
geo `21175` (Washington state), language `1000` (English), Google Search network.
4,749 keyword ideas returned.

**Read the volumes as relative, not absolute.** They are statewide. A 5-mile
radius around Snohomish will see a small fraction of them. They are useful for
ranking terms against each other and for CPC estimates, not for forecasting.

## The budget math nobody had done

Planner CPCs for the terms in this campaign run **$2.04–$5.42**. At $10/day that
is roughly **2–5 clicks per day**, spread across 6 ad groups. Most ad groups will
not get one click a day.

This is the real constraint on the account. Everything below follows from it.

## Findings

### The "Same Day" ad group is built on dead volume

| Keyword | Statewide vol/mo |
|---|---|
| `same day auto detailing` | no planner data |
| `same day car detailing` | no planner data |
| `same day detailing near me` | 10 |
| `same day car detailing near me` | 10 |

Every "same day" variant in the dataset is at 10/month statewide. In a 5-mile
radius that is effectively zero. This ad group will not spend and will not
produce leads. Recommend leaving it paused at launch, or folding "same day"
messaging into Core Detailing as a headline rather than a whole ad group.

### `auto detailing` was missing and is the best-value term available

| Keyword | Vol/mo | Competition | Avg CPC | In account before? |
|---|---|---|---|---|
| `auto detailing` | 1,000 | 23 (low) | **$2.04** | no |
| `car detailing near me` | 5,400 | 68 (high) | $2.94 | yes |
| `car detailing` | 2,400 | 39 | $3.14 | yes |
| `car detailing services` | 1,900 | **6** | $5.42 | no |
| `mobile car detailing` | 590 | 28 | $3.81 | yes |

`auto detailing` has half the volume of the head term at two-thirds the cost and
a third of the competition. `automotive detailing`, which *was* in the account,
returns no planner data at all.

### The Cost & Pricing ad group had one working keyword

`car detailing cost` is 30/mo. `car detailing prices near me` and
`how much does it cost to detail a car` return no planner data. The working
variants are `car detailing prices` / `auto detailing cost` / `mobile detailing
cost`, all 140/mo at competition 44 and **$2.32** — cheaper than the head terms.

### No Snohomish-area geo keywords exist

Zero results for snohomish, everett, monroe, lake stevens, mill creek or
marysville. Do not build city-name keywords; the 5-mile radius does that job.

## Keywords added (15, all PHRASE match)

Phrase, not broad, deliberately: at 2–5 clicks/day, broad match on a new account
spends the budget on junk before the search terms report has enough data to
write negatives against.

| Ad group | Added |
|---|---|
| Core Detailing | `auto detailing`, `car detailing services`, `auto detailing services` |
| Mobile Detailing | `mobile auto detailing`, `mobile vehicle detailing`, `mobile car detailing near me` |
| Cost & Pricing | `car detailing prices`, `auto detailing cost`, `mobile detailing cost`, `auto detailing prices` |
| Interior | `auto interior cleaning`, `mobile interior car detailing`, `car detailing interior` |
| Near Me | `vehicle detailing near me`, `mobile detailing near me` |
| Same Day | none — dead volume |

Reversible with `remove_keywords` using the criterion ids from the
`ad_group_criterion` report.

## Ad copy

### What was wrong with the originals

**12 of the 15 headlines were byte-identical across all six ad groups**, and 3 of
4 descriptions. Only the last three headlines differed. Responsive search ads
assemble from the whole pool, so the Cost & Pricing ad group was as likely to
serve "Interior And Exterior" as anything about price. That suppresses Ad
Relevance, which is a third of Quality Score.

**The strongest offer on the site was in none of the ads.** `index.html` carries
"Love it or you don't pay, guaranteed". No ad mentioned it.

### New ads (v2) — created PAUSED alongside the originals

| Ad group | New ad id | Shared headlines |
|---|---|---|
| Mobile Detailing | `199348858069~822788859041` | 5 of 15 |
| Cost & Pricing | `199582444053~822713800255` | 5 of 15 |
| Interior | `199582455973~822672152532` | 5 of 15 |
| Core Detailing | `203278187681~822788888549` | 5 of 15 |
| Same Day | `203534243950~822788896709` | 5 of 15 |
| Near Me | `208123677308~822788918048` | 5 of 15 |

Overlap cut from 12/15 to 5/15. The guarantee now appears in every ad, as both a
headline ("Love It Or You Don't Pay") and a description line.

The six original APPROVED ads were **not deleted or modified**. They remain
paused as a fallback.

### Claims and where they are substantiated

| Claim in copy | Source |
|---|---|
| `300+ Cars Detailed` | `index.html` — "300+ cars detailed" |
| `Love It Or You Don't Pay` | `index.html` — "Love it or you don't pay, guaranteed" |
| `38+ Five-Star Reviews` | site schema says `reviewCount: 40`, `ratingValue: 5.0` |
| `I Bring Water And Power` | carried over from the approved originals |

**Two things to check yourself:**

1. The site's structured data says **40** reviews; the ads say **38+**. Not a
   contradiction, but stale. Bump it if 40 is current — a factual claim about
   your own business is yours to make, not mine to change silently.
2. "since I started at 12" appears in the *original* descriptions and is not
   stated anywhere on the site. It is not in the v2 copy. If it is true and you
   want it, it is a good line — just make sure it is substantiated somewhere.

## Validation status — what is and is not confirmed

**Mechanically verified before upload (all 6 ads pass):**

- every headline ≤ 30 characters (longest: 27)
- every description ≤ 90 characters (longest: 85)
- 15 headlines and 4 descriptions per ad (Google's maximum)
- no phone number in any headline or description — this is the PROHIBITED policy
  trap; checked with a digit-sequence regex, not by eye
- no exclamation marks in headlines, no all-caps words
- no duplicate headlines or descriptions within an ad
- display paths ≤ 15 characters

**Not confirmed — pending Google:**

All six v2 ads currently read `approval_status: UNKNOWN`,
`review_status: REVIEW_IN_PROGRESS`. Policy review typically completes within one
business day. **Do not enable these ads until they read APPROVED.** Re-check with
the `ad_group_ad_policy_summary_approval_status` field.

**Not knowable in advance:**

Whether this copy outperforms the originals. There is no impression or CTR data
on this campaign — it has never served. Ad Strength reads PENDING for every ad,
original and new, for the same reason. The copy is better-targeted and better-
substantiated on reasoning any experienced advertiser would recognise, but
"better" here is an argument, not a measurement. The search terms report in week
one is what settles it.

## Revised enable order

1. Confirm the five UI blockers above are done
2. Confirm all six v2 ads read APPROVED
3. Enable campaign → ad groups → ads
4. **Enable only ONE ad per ad group** (the v2), leaving the original paused.
   At 2–5 clicks/day, splitting traffic across two ads per group means neither
   ever reaches significance
5. Consider leaving **Same Day** paused entirely — it has no volume to win

---

# LAUNCHED — 2026-08-30

Enabled on the owner's explicit instruction, after the geo risk below was
raised and declined twice. Verified live via the API:

| Object | Status |
|---|---|
| Campaign `24190821998` | **ENABLED** |
| All 6 ad groups | **ENABLED** |
| 6 original ads | **ENABLED**, APPROVED — serving now |
| 6 v2 ads | **ENABLED**, approval still UNKNOWN — will serve once reviewed |

Budget and bidding untouched: $10/day, manual CPC.

## Live and unresolved

**No geographic targeting.** The campaign is serving nationwide. At planner CPCs
of $2.04–$5.42 this spends the daily budget on searches outside any serviceable
distance. This is the highest-cost open item by a wide margin and is fixable only
in the UI:

> Settings → Locations → Enter another location → `Snohomish, Washington`
> → hover → Radius → `5` → Target. Then Location options → **Presence**.

**No conversion tracking.** Calls to (425) 600-7897 will not be attributed. The
campaign works; you just cannot tell which keyword produced a call.

**Two call extensions.** (360) 797-5831 may serve alongside (425) 600-7897.

**Two broken sitelinks.** `/#faq` and `/#guarantee` resolve to no anchor; the
visitor lands at the top of the page. Not fatal, wastes a click.

## Reversing

Every enable above is reversible with `pause_campaign`, `pause_ad_group` and
`pause_ad`. `pause_campaign` on `24190821998` stops all spend immediately.

## Once the v2 ads are approved

Pause the six originals so each ad group runs one ad. At 2–5 clicks/day, two ads
per group means neither accumulates enough data to judge.
