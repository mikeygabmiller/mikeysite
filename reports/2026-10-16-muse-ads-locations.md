# Muse brief, 2026-10-16 (second run): locations, auto-apply, Misconfigured

Follows the conversions run recorded in `reports/2026-10-15-google-ads.md`.
Mikey said yes (2026-10-16) to fixing the campaign's locations and turning off
auto-apply. About 20 to 30 minutes, with Mikey at the keyboard for the sign-in.
Paste everything below the line into Muse. Its report comes back to a Claude
session, which records it in the same Ads report.

Why each part:

1. **Locations.** On Sep 29 the campaign was set to target "Snohomish" and to
   exclude Marysville and Arlington. Impressions fell from about 180 a day to
   16 two days later. Mikey then set the rule (2026-10-16, "for now"): **ads
   only within 30 minutes' drive of his home.** Google Ads can't target by
   drive time, and a mileage circle fits badly here (Mill Creek is 11 miles
   away in a straight line but 36 minutes by road), so the target is the
   served towns whose centre is under 30 minutes by road. Drive times are
   OSRM routing from his home (east of Snohomish town; the street isn't
   written here because this repo is public), with no traffic, so real
   afternoon times run a little longer:

   | Town | Drive | In the ads? |
   |---|---|---|
   | Monroe | 14 min | yes |
   | Snohomish | 14 min | yes |
   | Lake Stevens | 20 min | yes |
   | Everett | 24 min | yes |
   | Duvall | 28 min | yes |
   | Marysville | 29 min | no, borderline (over 30 with traffic) |
   | Granite Falls | 30 min | no, borderline |
   | Woodinville | 31 min | no |
   | Bothell | 34 min | yes, Mikey added it |
   | Mukilteo | 35 min | no |
   | Mill Creek | 36 min | yes, Mikey added it |
   | Arlington | 42 min | no |

   Mikey then added Bothell and Mill Creek (2026-10-16), over the 30
   minutes, so the ads cover seven towns. The website still serves all
   twelve; only the ads narrow. Sultan (25 min)
   is inside the line but isn't a served town, so it stays out. "Presence"
   (people in the place) stays, because a mobile detailer gains nothing from
   a click by someone who only searched about the area.
2. **Auto-apply** was on for 20 of 21 types. It lets Google rewrite the ads
   (which could add "same day" or "licensed", neither true), add broad match
   keywords, move money to Display and change the bidding.
3. **"Misconfigured"** shows on both website conversions while their tags fire
   correctly (tested 2026-10-16). The reason is written on each action's
   Diagnostics tab. This run reads it and changes nothing.
4. **The GBP extra phone** is (360) 797-5831, which isn't Mikey's
   (`reports/2026-10-15-gbp.md`).

---

You're helping Mikey of Mikey's Mobile Detailing (mobile car detailing,
Snohomish County, WA) in his Google Ads account **862-091-0274** and his
Google Business Profile. Mikey is at the computer and has said yes to Parts 1,
2 and 4. Do the parts in order. If one gets stuck, write down why and go to
the next.

## Rules

1. **Mikey types every password, code and passkey.** Never type, save or ask
   for one, and don't let the browser save one.
2. **Only what this brief says.** Don't touch the budget, the bid strategy,
   keywords, ads, ad groups, conversion actions, billing or audiences.
3. **Never apply or dismiss a recommendation,** and decline offers of a call
   from a Google rep.
4. **Record before you change.** Write down each setting word for word
   before you edit it.
5. **Don't click any "Fix" button** on a conversion or tag diagnostic, and
   don't accept any terms. Part 3 is read only.
6. **No customer details in your report.** That means no names or phone
   numbers from calls or leads.
7. **Stop and report** if you see a suspension, a policy or billing warning,
   an advertiser verification request, a request to re-verify the business
   profile, or anything asking for a card.

## Part 1: Locations on the live campaign

Go to **Campaigns → Snohomish Detailing - Search - 2026 → Settings →
Locations**. (Or open the campaign's **Locations** page, then **Edit
locations**.)

**1. Write down what's there now**, word for word:
- every targeted location, with the type Google shows (City, County, Postal
  code, Radius)
- every excluded location, with its type
- the "Location options" (Presence, or Presence or interest)

**2. Set the targets to exactly these seven.** Mikey wants the ads to reach
only people near him, for now: the towns within about 30 minutes' drive,
plus Bothell and Mill Creek. Search each one
and pick the result marked **City** in **Washington, United States**:

`Snohomish` · `Monroe` · `Lake Stevens` · `Everett` · `Duvall` ·
`Bothell` · `Mill Creek`

- Pick the **Snohomish** that says City, never "Snohomish County".
- If a town shows no City result, try its ZIP code and write down what you
  used:
  - Snohomish 98290 and 98296
  - Monroe 98272
  - Lake Stevens 98258
  - Everett 98201, 98203, 98204, 98208
  - Duvall 98019
  - Bothell 98011, 98012, 98021
  - Mill Creek 98012
- If Google says a town's reach is too small to show, add it anyway.
- After adding the seven, **remove every other target**: Snohomish County, a
  radius, any other town or ZIP.
- **Don't add** Marysville, Granite Falls, Woodinville, Mukilteo,
  Arlington, Sultan, Lynnwood or Edmonds, even if Google suggests
  them.
- **Don't type Mikey's home address** anywhere, and don't use a radius.

**3. Exclusions:** leave every existing exclusion as it is (Arlington,
Bellevue, Marysville, Seattle, Shoreline). None of them overlap the seven
towns. Don't add any. If Google won't save because an exclusion overlaps
a target, stop and report it.

**4. Location options:** keep **"Presence: People in or regularly in your
targeted locations"**. If it says anything else, change it to that and write
down what it said.

**5. Save.** Then reopen the settings and write down the twelve targets, the
exclusions and the location option as they now stand.

## Part 2: Turn auto-apply off

1. Go to **Recommendations → Auto-apply** (the link is at the top of the
   Recommendations page, or under the page's menu).
2. Write down every type that's on, under both **Maintain** and **Grow**.
3. **Turn every one off**, so all 21 types are off. If Google asks you to
   confirm, or asks why, pick the closest answer to "I want to review
   changes myself". Don't add a comment.
4. Open the **auto-apply history**. For each change applied since Sep 1,
   2026, write down the date, the type and what it changed. Don't undo any
   of them.
5. Reopen Auto-apply and confirm all 21 types show off.

## Part 3: Why the two website conversions say "Misconfigured" (read only)

1. Go to **Goals → Conversions → Summary**.
2. Open **"Site tap-to-call"**. Find its diagnostics. That's the
   **Diagnostics** tab, or the status "Misconfigured" itself (hover or click
   it). Write down every message, word for word, with any date it shows.
3. Do the same for **"Submit lead form"**.
4. Go to **Goals → Settings → Enhanced conversions** and write down every
   message under it, word for word. That includes "setup issues detected" and
   whatever its details say.
5. **Change nothing here.** Don't click Fix, don't turn anything off, don't
   install anything.

## Part 4: Take the wrong extra phone off the Google Business Profile

1. Search Google for **Mikey's Mobile Detailing** while signed in as Mikey,
   or open business.google.com. Click **Edit profile → Contact**.
2. Write down the primary phone and every additional phone exactly as shown.
3. If an additional phone is **(360) 797-5831**, remove it (the X beside it)
   and save.
4. **Don't change the primary phone.** It must stay **(425) 600-7897**. If
   it shows anything else, don't edit it; report it.
5. If Google asks to verify the business again, **stop and report** without
   finishing.

## Part 5: Two quick reads

1. On the live campaign's assets, find the call asset that was changed from
   (360) 797-5831 earlier today. Write down its status: Approved, Pending, or
   Disapproved with the reason.
2. Write down the campaign's status line (for example "Eligible" or
   "Eligible (Learning)"), exactly as it shows on the Campaigns page.

## Your report

Plain text, in this order:

1. **Locations:** before (targets, exclusions, option) and after, plus
   anything you used a ZIP code for. If Google shows an estimated reach for
   the new targets, write it down.
2. **Auto-apply:** the types that were on, the auto-apply history since
   Sep 1, and confirmation that all 21 are now off.
3. **Misconfigured:** every message for each of the two actions, and the
   enhanced conversions messages, word for word.
4. **Business profile:** the phones before and after.
5. **Call asset status and campaign status.**
6. **Not done:** anything stuck, skipped or unclear, and why.

No passwords, and no customer names or numbers anywhere in it.
