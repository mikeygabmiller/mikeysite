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
