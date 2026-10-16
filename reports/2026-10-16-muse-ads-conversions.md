# Muse brief, 2026-10-16: Google Ads conversions

Makes Google Ads count only real leads, each one once, and makes sure the live
campaign bids on them. About 30 to 45 minutes, with Mikey at the keyboard for
the sign-in. Paste everything below the line into Muse. Its report comes back
to a Claude session, which records it in `reports/2026-10-15-google-ads.md`.

**What Claude checked first (2026-10-16).** On the live site, with every
request to Google blocked so no test reached the account:

- The Google tag `AW-16856115492` loads on every page (`site-stats.js`).
- Tapping a phone or text link sends an Ads conversion with label
  `pCPGCP69oO0cEKTSz-U-` (wired 2026-09-03).
- A sent quote or a booked time fires `qqc_submission`, which `site-stats.js`
  mirrors to an Ads conversion with label `13rMCOG9vfQcEKTSz-U-` and the
  quote's dollar total (wired 2026-09-11; the first lead came Sep 12).
- The same taps and quotes also go to GA4 as `generate_lead`, `phone_click`
  and `qqc_submission`, in **two** GA4 properties: `G-G9WMXW2MF5` (the site's
  own snippet) and `G-7L605ZX0RV` (attached to the Ads Google tag, not to
  anything in this repo).

So the site side works and no code needs to change. What's left is the Ads
account's settings, which no session can see now that Windsor reads Search
Console instead.

**This replaces one line of yesterday's report.** It said to make the GA4
import of `qqc_submission` primary. Don't: the site already sends every quote
to Ads directly, so a primary GA4 copy would count each quote twice and the
bidder would chase people who send quotes, twice as hard as it should. The GA4
copy is only the fallback if the direct quote action turns out to be missing.

Left out on purpose: negative keywords, the Same Day ad group and the Oct 1
traffic drop's fix. Those change what the ads buy, and Mikey decides them once
Part 5's change history says what happened.

---

You're helping Mikey of Mikey's Mobile Detailing (mobile car detailing,
Snohomish County, WA) in his Google Ads account **862-091-0274**. Mikey is at
the computer. The job: Google Ads should count only real leads, count each one
once, and the live campaign ("Snohomish Detailing - Search - 2026") should bid
on exactly those. Do the parts in order. If one gets stuck, write down why and
go to the next.

## What's already done (don't redo it)

The website side was tested on 2026-10-16 and works. The site sends two
conversions straight to Google Ads under the Google tag `AW-16856115492`:

| What the person did | Conversion label |
|---|---|
| Tapped the phone number or the text link | `pCPGCP69oO0cEKTSz-U-` |
| Sent a quote or booked a time in the quote calculator | `13rMCOG9vfQcEKTSz-U-` |

The site also sends the same actions to Google Analytics 4 as `qqc_submission`,
`generate_lead` and `phone_click`. Those are copies. If Ads imports them too,
they must not count.

So: **don't install or edit any tag, don't use Tag Assistant to fire test
conversions, and never submit the quote form on mikeysdetailing.com.** It
texts Mikey a real lead.

## Rules

1. **Mikey types every password, code and passkey.** Never type, save or ask
   for one, and don't let the browser save one.
2. **Conversions only.** Don't touch the budget, the bid strategy, billing,
   keywords, ads, locations, ad schedule or audiences. The one exception is a
   call asset in Part 2D, and only after Mikey says yes.
3. **Never apply a recommendation.** Don't click Apply on the Recommendations
   page, don't turn auto-apply on, and decline offers of a call from a Google
   rep.
4. **Record before you change.** Part 1 writes down every conversion action
   as it is now. Don't change anything until Part 1 is finished.
5. **Never remove a conversion action.** Set it to Secondary instead.
   Secondary keeps its history and can be switched back. Removing can't.
6. **Don't create a conversion action** unless a scenario below tells you
   to. Never create one that counts a page load, a page view or a URL.
7. **Make every change in one sitting.** Each change to what counts restarts
   the campaign's learning. One batch means one restart, not five.
8. **Don't turn on enhanced conversions** or accept any customer data terms.
   Just write down what the setting says.
9. **No customer details in your report.** Call details and lead form
   entries show real people's names and numbers. Don't copy any of them.
10. **Stop and report** if you see a suspension, a policy or billing
    warning, an advertiser verification request, or anything asking for a
    card.

## What "fixed" looks like

| Conversion action | Source | Action optimization | Count |
|---|---|---|---|
| Tap to call or text on the site (label `pCPGCP69oO0cEKTSz-U-`) | Website | **Primary** | **One** |
| Quote sent or time booked (label `13rMCOG9vfQcEKTSz-U-`) | Website | **Primary** | **One** |
| Calls from ads (only if a call asset runs) | Call from ads | **Primary** | **One** |
| Lead form (only if a lead form asset runs) | Lead form | **Primary** | **One** |
| Anything imported from Google Analytics (GA4) | Website (Google Analytics) | Secondary | |
| Local actions: directions, clicks to call, website visits, menu views, other engagements | Google Business Profile | Secondary | |
| Anything that counts a page load, page view or URL | any | Secondary | |
| Smart campaign actions (map clicks to call, ad clicks to call) | Smart campaign | Secondary | |

"One" means one lead per ad click. A person who taps call and then sends three
quotes is one lead, not four. Counting "Every" teaches the bidder to find more
of that one indecisive person.

## Part 1: Write down every conversion action (read only)

1. Go to **Goals → Conversions → Summary**. If the page groups actions by
   goal, switch to the table view or the list of all conversion actions so
   every action shows as one row. Include removed and hidden actions if a
   filter offers it.
2. For every action, write one row:
   - name
   - source
   - status (Recording conversions / No recent conversions / Unverified /
     Inactive / Needs attention / Removed)
   - Primary or Secondary
   - count (One / Every)
   - goal category (for example Phone call lead, Submit lead form, Contact,
     Page view)
   - conversions in the last 30 days, if a column shows them
3. For every **Website** action, open it and find its label: the action's
   settings, then **Tag setup**, then **Use Google Tag Manager** shows a
   Conversion ID and a Conversion label. Write both down. Don't copy any code
   to the site.

## Part 2: Fix each action, by what you find

### A. The tap-to-call action (label `pCPGCP69oO0cEKTSz-U-`)

- **Found, Primary, count One:** leave it.
- **Found but Secondary:** make it Primary.
- **Count says Every:** change it to One.
- **Category is Page view or Other:** change it to Contact or Phone call
  lead. Don't change its name.
- **Status says No recent conversions:** that's expected. No ad click has
  turned into a lead since Sep 30, and the tag works. Leave the tag alone and
  write down the status.
- **Status says Unverified or Inactive:** don't touch the tag. Write down the
  status and any date it shows for the last conversion.
- **Two actions have this same label:** keep the older one Primary, set the
  other to Secondary, and report both names.
- **No action has this label:** create one. Goals → Conversions → New
  conversion action → Website → `mikeysdetailing.com`, then add it manually:
  - category: Contact
  - name: `Site: tap to call or text`
  - value: Don't use a value
  - count: One
  - click-through window: 30 days
  - leave the other settings at their defaults
  - Primary

  On the tag setup screen pick **Use Google Tag Manager** and copy the
  Conversion ID and Conversion label into your report, word for word. A
  Claude session puts the label on the site. Don't install anything yourself.

### B. The quote action (label `13rMCOG9vfQcEKTSz-U-`)

Same steps as A, with these differences:

- The right category is Submit lead form or Request quote.
- If you have to create it, name it `Site: quote sent or time booked`, and
  for the value pick **use different values for each conversion** with a
  default of `0`. The site sends the quote's total.
- Don't change the value setting on an action that already exists.

### C. Anything imported from Google Analytics (GA4)

These are copies of A and B. Set every one to **Secondary**, whatever its
name: `qqc_submission`, `generate_lead`, `phone_click`, `qqc_booking`,
`qqc_quote`, `page_view`, `session_start`, anything else from GA4.

**The one exception (fallback):**
- If A doesn't exist and you couldn't create it, make GA4 `generate_lead`
  Primary with count One. Not `phone_click`: both fire on the same tap.
- If B doesn't exist and you couldn't create it, make GA4 `qqc_submission`
  Primary with count One.
- Report clearly which fallback you used.

### D. Calls from ads (people who tap Call on the ad itself)

1. Open the live campaign → **Assets** (or Ads & assets → Assets) → filter
   to **Call**. Write down every call asset's phone number and status.
2. **A call asset shows any number other than (425) 600-7897** (for example
   (425) 232-1355 or (360) 799-9312, his old numbers): edit it to
   `(425) 600-7897`. Write down the old number. That isn't a customer detail,
   so it's fine in the report.
3. **A call asset exists:** make sure call reporting is on (**Admin → Account
   settings → Call reporting**). Then make sure an action with source "Call
   from ads" exists, Primary, count One. Leave its minimum call length where it
   is if it's 30 seconds or more. If it's under 30, set it to 60. If there's no
   such action, create one: New conversion action → Phone calls → Calls from
   ads using call assets → category Phone call lead, value Don't use a value,
   count One, call length 60 seconds, Primary.
4. **No call asset on the live campaign:** ask Mikey, word for word, "Your
   live campaign has no call button on the ad. Add one with (425) 600-7897,
   reporting calls of 60 seconds or more?"
   - **If he says yes:** add a campaign-level call asset with
     `(425) 600-7897`, call reporting on, no schedule. Then do step 3.
   - **If he says no:** write that down and move on.

### E. Lead form asset

1. Check the live campaign's assets for a **Lead form**.
2. **One exists:** make sure its action is Primary, count One. Then write down
   where its leads go: download only, a webhook, or an email address. Don't
   change it. A lead that only lives in Google Ads is one Mikey never sees,
   so that matters.
3. **None exists:** write "no lead form" and move on. Don't add one.

### F. Google Business Profile local actions

Set every one to **Secondary**: directions, clicks to call, website visits,
menu views, other engagements. They count people using his Google profile,
mostly people who'd have found him anyway. They made the campaign look like
it had 23 more results than it did.

### G. Page loads, page views, URL actions

Set every one to **Secondary**. That includes "Page load
mikeysdetailing.com/" from the old "Real" campaign: 52 of its 58
"conversions" were just someone landing on the homepage. The Google tag now
loads on every page, so an action like that would count every visitor.

### H. Smart campaign actions

Set them to **Secondary**. Those campaigns are paused or removed.

### I. Anything else

For example offline imports, "Converted leads", or another app. Write down
its name and source, and leave it as it is.

## Part 3: The campaign's goals

1. Go to **Campaigns → Snohomish Detailing - Search - 2026 → Settings →
   Goals**. Write down whether it says "Use account-default goals" or
   "Use campaign-specific goals", and which goals are listed.
2. **It uses account-default goals:** go back to Goals → Summary. The goal
   (category) that holds A, the one that holds B, and the ones that hold D
   and E if they exist must each be an account-default goal. If one isn't,
   use that goal's menu to make it an account default.
3. **It uses campaign-specific goals:** make sure the goals holding A and B
   (and D and E if they exist) are selected. Leave the others alone.
4. Write down the campaign's bid strategy, and a target CPA if one is set.
   **Don't change either.**

## Part 4: Four settings to read

1. **Auto-tagging** (Admin → Account settings). It must be **on**. This
   adds the click ID that ties a website lead to an ad click. If it's off,
   turn it on and report it. It's the only setting here you may change.
2. **Enhanced conversions** (Goals → Settings). Write down on or off. Don't
   change it.
3. **Linked Google Analytics** (Admin → Linked accounts → Google Analytics
   (GA4) & Firebase). Write down every linked property: its name, property
   ID and measurement ID if shown (`G-G9WMXW2MF5`, `G-7L605ZX0RV`, or
   something else). Don't link or unlink anything.
4. **The Google tag** (Goals → Settings → Google tag, or Admin → Google tag).
   For `AW-16856115492`, write down the destinations listed, especially
   whether `G-7L605ZX0RV` is one. Don't change it.

## Part 5: What changed around Oct 1 (read only)

The campaign went from about 180 impressions a day to about 16 on Oct 1, with
the same $10 budget. Find out why. **Don't fix anything here.**

1. Go to **Change history**. Set the dates to **Sep 25 to Oct 5, 2026** for
   the whole account.
2. Write down every change:
   - date and time
   - who made it (a person's email, "Google Ads", or "Recommendations
     auto-apply")
   - what it changed, with the before and after
3. Look hardest at:
   - keywords paused, removed or changed to exact match
   - locations or radius
   - ad schedule
   - bid strategy or target CPA
   - conversion goals
   - ads disapproved or paused
   - negative keywords added
   - budget
4. Then open **Recommendations → Auto-apply** and write down what's turned
   on. Don't change it.

## Part 6: Check your work

1. Go back to **Goals → Conversions → Summary**.
2. Compare it, row by row, with the table in "What 'fixed' looks like".
   Write down anything that doesn't match, and why.

## Your report

Plain text, in this order:

1. **Before:** every conversion action from Part 1, one row each, with its
   label if it's a website action.
2. **Changes:** each change you made, written as action, field, before,
   after.
3. **After:** the same table as step 1, as it stands now.
4. **Campaign goals:** account-default or campaign-specific, the goals before
   and after, and the bid strategy and target CPA as you found them.
5. **Assets and settings:**
   - the call asset's number and what Mikey said if you asked
   - the lead form and where its leads go
   - auto-tagging
   - enhanced conversions
   - the linked GA4 properties
   - the Google tag's destinations
6. **Change history, Sep 25 to Oct 5:** every entry, and what auto-apply
   has turned on.
7. **Not done:** anything stuck, skipped or unclear, and why.

No passwords, and no customer names or phone numbers anywhere in it.
