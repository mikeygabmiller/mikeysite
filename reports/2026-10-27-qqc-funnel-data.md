# Quote calculator funnel: where people actually drop off (2026-10-27)

One of four R&D reports on the quote calculator (QQC). This one is the
numbers: what each step reports, what the real counts are, where the leaks
are, and how to judge a change on a site this size. Nothing on the site or
the dashboard was changed. Every number below says where it came from; where
a number couldn't be reached, it says so and says what to click to get it.

## The short version

1. **The only real funnel on file is Sep 7 to Oct 4:** 45 people started the
   calculator, 28 saw a price, 11 sent it, 1 booked a time (GA4 users, read by
   Muse on 2026-10-08). Online booking had only been live 6 days of that. No
   October funnel has been pulled yet, and a session can't pull one: GA4 isn't
   on Windsor (its one free source is the Business Profile) and the
   dashboard's quote log is behind Mikey's login.
2. **The three biggest leaks, in order:**
   1. **The price screen.** 17 of 28 people (61%) saw their price and left
      without sending it or booking. This is the biggest leak we can actually
      measure.
   2. **Landing on the site but never starting.** Not measured directly
      (there's no "calculator seen" event), but the homepage got roughly 190+
      visits in that window from ads, the Business Profile and Google
      search alone, against 45 starts. So something like 3 in 4 homepage
      visitors never pick a vehicle. This is probably the biggest leak by
      head count, and the least certain.
   3. **Between the car and the price** (steps 2 to 4). 17 of 45 (38%) picked a
      vehicle and never reached a price. Which of the three steps loses them
      isn't in the read we have.
   And one blind spot that may be bigger in dollars than all three: **sent or
   booked → became a job** is not measured anywhere a report can see.
3. **The tracking would make an October funnel lie in five ways** (section 2):
   back buttons and the "text me instead" link re-fire step events, the
   maintenance page sends the same event names with different step numbers,
   a bot tripping the honeypot counts as a success, nothing says whether the
   price screen offered booking at all, and "started" really means "picked a
   vehicle" because step 1 never fires on load.
4. **A/B testing is mostly out of reach at this traffic.** At about 28 people
   a month reaching a price, telling a real 16-point lift apart from luck
   takes about 300 people at the price, which is about 11 months. Section 5
   has what to do instead.

---

## 1. Every step of the calculator, and what it fires

The calculator is in `index.html` (`#booking`). There's a second, separate
calculator on `/mobile-auto-maintenance/` (oil changes). Every step change
goes through `goStep(n)`, which sends GA4 `qqc_step {step, step_name}` and
the dashboard's own beacon `MDTrack('Quote form, step n')` (site-stats.js,
`/px/e`, stored per visitor for 45 days).

| # | Screen | How they get there | GA4 | Dashboard journey |
|---|---|---|---|---|
| 1 | Your vehicle | page load (shown by default) | **nothing** on load. `qqc_step 1` only fires if they press Back to it, or Rain-Ready's button opens it | nothing on load |
| 2 | Choose your detail | tap a vehicle | `qqc_step 2` | `Quote form, step 2` |
| 3 | Condition | Continue | `qqc_step 3` (also starts the calendar fetch) | step 3 |
| 4 | Extras (optional) | Continue | `qqc_step 4` | step 4 |
| 5 | Your quote (price) | "See my price" → `calcQuote()` | `qqc_quote {value, services}` then `qqc_step 5` | `Saw their quote` ($, car, items), step 5 |
| 5a | Price, "Switch to Full Detail" | swap button | `qqc_swap_full`, then `qqc_quote` and `qqc_step 5` **again** | `Switched to Full Detail…`, `Saw their quote` again |

From the price screen there are two roads, and which one they see depends on
whether the calendar answered within 4.5 seconds (`has-booking` on `#step5`):

**"Pick my time" road** (calendar answered):

| # | Screen | How | GA4 | Dashboard |
|---|---|---|---|---|
| 7 | Pick your time | "Pick my time" | `qqc_step 7` only; **the tap itself has no event** | `Opened the booking times` |
| 7 | "More times" | button | **nothing** | nothing |
| 8 | Lock it in (name, phone, town, street) | tap a time | `qqc_step 8` | `Picked a time` |
| 8 | form invalid | Book with a field missing | **nothing** | nothing |
| 6 | Booked / Request sent | `/api/book` ok | `qqc_submission {source:'qqc_booking'}`, `qqc_booking {status}`, `qqc_step 6`; Ads quote conversion (mirrored from `qqc_submission`) | `BOOKED online` |
| 7 | slot taken (409) | someone booked it first | `qqc_step 7` **again**, no error event | `Opened the booking times` again |
| 8 | failed | any other error | `qqc_booking_error {}` (no status code) | nothing |

**"Text me this quote instead" road** (or no calendar, where the phone form is
the whole price screen):

| # | Screen | How | GA4 | Dashboard |
|---|---|---|---|---|
| 5 | Price with name + phone form | "Not ready? Text me this quote instead" (on 5 or 7) | `qqc_step 5` **again**; the choice itself has no GA4 event | `Chose text instead of booking` |
| 5 | form invalid | Lock in with a field missing | **nothing** | nothing |
| 6 | Sent | Web3Forms or `/submit` ok | `qqc_submission {source:'qqc_form'}`, `qqc_step 6`; Ads quote conversion | phone lands on the journey |
| 5 | failed | both sends failed | `qqc_submit_error {}`; the "Text My Quote to Mikey" fallback link then fires `generate_lead` and the Ads **lead** conversion (site-stats.js counts every `sms:` tap) | nothing |

**Shortcuts in:** the Services section's buttons call `MikeyQQC.book()`, which
fires `qqc_prefill {source:'services_section'}` and jumps straight to the price
(step 5) without steps 1 to 4. Rain-Ready's button fires `qqc_prefill
{source:'rain_ready'}` and opens step 1 or 2.

### 2. What would make a funnel report lie

Ranked by how much they'd bend the numbers:

1. **The maintenance calculator shares the event names.** It sends
   `qqc_step`, `qqc_quote` and `qqc_submission {source:'qqc_form'}` too, but its
   step 4 is the *price* and step 5 is *success* (`stepNames` at
   `mobile-auto-maintenance/index.html:2928`). A GA4 funnel on "step 5" mixes
   detailing price-seers with oil-change successes. It also means an oil-change
   quote fires the Ads "quote sent" conversion, so the bidder is told an
   oil-change lead is a detailing lead. Any funnel has to filter on
   `page_location` until the names differ.
2. **Step events re-fire.** Every Back button (`data-role="go"`), the "text me
   instead" link (re-fires 5), the Full Detail swap (re-fires `qqc_quote` and
   5) and a 409 (re-fires 7) send the event again. Read in **users**, a GA4
   funnel is fine; read in **event count**, or summing `qqc_quote`'s `value`,
   it double counts. The `value` on `qqc_quote` is not "pipeline": one person
   flipping services sends three values.
3. **"Started" means picked a vehicle, not opened the calculator.** Step 1
   never fires on load, so the 45 "started" are people who already answered
   one question. Anyone who scrolled to the calculator and left is invisible,
   and that's leak #2 above. Worse, `qqc_step 1` users are *only* people who
   pressed Back, so a funnel that starts at step 1 shows a tiny, wrong top.
4. **Nothing records which price screen they saw.** Booking can add bookings
   only when the calendar answered. If it didn't (slow phone signal, worker
   down), the screen is the plain phone form. Without a flag on `qqc_quote`,
   "booking didn't lift sends" and "booking wasn't offered" look identical.
   The "Pick my time" tap and the "text me instead" tap have no GA4 event
   either, so the choice between the two roads can't be read in GA4 at all
   (the dashboard journey does have both).
5. **The honeypot counts as a success.** A bot filling the hidden field goes
   to `goStep(6)`, which fires `qqc_step 6` with no submission. Small, but a
   "step 6 users" count is not "people who sent a quote". Use
   `qqc_submission`.
6. **Two GA4 properties get every event.** `G-G9WMXW2MF5` (the site's snippet)
   and `G-7L605ZX0RV` (attached to the Ads Google tag), per
   `reports/2026-10-16-muse-ads-conversions.md`. Read the funnel from
   `G-G9WMXW2MF5` only, every time, or two months won't be comparable.
7. **The dashboard's "saw the price and left" email can fire for someone who
   never saw a price.** `isQuoteRevealStep()` in the dashboard
   (`src/index.js`, about line 6111) treats `Quote form, step 4` as the price
   reveal, from when step 4 *was* the price. On the homepage step 4 is now
   Extras, so a visitor who leaves on Extras gets reported as "Saw their quote
   and left". It doesn't touch GA4, but it inflates the leak Mikey sees in his
   inbox. (Dashboard repo; not changed here.)
8. **Counts that are fine:** `qqc_submission` fires once per real send on each
   road (the old generic tracker block near the bottom of `index.html` looks
   for `form#qqc`, `data-track="qqc-submit"` and an iframe message, and none
   of those exist any more, so it adds nothing). The dashboard's quote log
   drops a repeat with the same phone and total inside 10 minutes; GA4
   doesn't, so GA4's sends can run a little above the dashboard's.

## 3. The real numbers I could reach

| Source | What it gave | Reached? |
|---|---|---|
| GA4 funnel, Sep 7 to Oct 4 | 45 started → 28 price → 11 sent → 1 booked (users) | from `reports/2026-10-scoreboard.md` (M3), read by Muse 2026-10-08 |
| GA4, October | nothing | **no.** Not on Windsor; the free plan holds one source and it's the Business Profile |
| Business Profile (Windsor, pulled today) | website clicks: **Aug 30, Sep 23, Oct 20** (Oct runs through about the 24th; GBP lags a few days). Calls: 6, 7, 2. Impressions: 343, 589, 255 | yes |
| Search Console, Sep 7 to Oct 4 | 46 clicks site-wide (homepage and its `http://` and GBP-button addresses carry most of them) | from the scoreboard; not on Windsor now |
| Google Ads, live campaign | Aug 29 to Sep 30: 202 clicks, 8 leads. Oct 1 to 15: 19 clicks, 0 leads (impressions fell from ~180 to ~16 a day on Oct 1) | from `reports/2026-10-15-google-ads.md`; Windsor no longer reads Ads |
| Dashboard quote log (Insights → Quote results) | count, booked, value, by month; CSV has vehicle, condition, services, location, type (quote or booking) | **no**: behind his login. Read the code only |
| Dashboard channels (Insights → Channels: cost per customer) | leads and customers by first touch (Google Ads, search and Maps, hangers, signs, postcards, word of mouth…) | **no**: behind his login |
| Dashboard lead pipeline (new / active / won / lost) | won count, win rate | **no**: behind his login |
| Dashboard journeys | every visitor's steps for 45 days, so roughly Sep 12 onward | **no**: behind his login |

One more number from the dashboard's own code comments (its offline-import
section): in one month Google Ads counted 2 conversions while the dashboard
logged **27 leads, 11 of them calls or texts**. Calls and texts are a big
share of his leads and they never pass through the calculator, so a
calculator funnel is part of the lead picture, not all of it.

## 4. The funnel

Sep 7 to Oct 4, users, homepage calculator. The visit row is a floor built
from the sources that can see clicks, not a GA4 count.

| Stage | People | From the stage before | Source |
|---|---|---|---|
| Homepage visits | **~190+ (estimate)** | | ~170 ad clicks (202 over 33 days, scaled to 28), ~23 GBP website clicks, plus search clicks to the homepage. Ad clicks aren't sessions (bots, people who bounce before GA loads), so treat it as rough |
| Started (picked a vehicle) | **45** | ~24% or less | GA4 via Muse |
| Saw a price | **28** | 62% (95% range 48 to 75%) | GA4 via Muse |
| Sent it (text road) or booked | **11** | 39% of price-seers (24 to 58%) | GA4 via Muse |
| of those, booked a time | **1** | booking live 6 of 28 days | GA4 via Muse |
| Became a job | **unknown** | | dashboard pipeline (won), behind login |

The ranges are 95% Wilson intervals. With numbers this small they're wide,
which matters for section 5: a "big" change between two months can easily be
luck.

**Leak 1, the price screen (61% leave).** The biggest one we can measure. The
other three reports cover what's on that screen; the numbers part is that
this is where the largest measured drop sits, and that the dashboard already
emails Mikey within two minutes when someone leaves here (with the step-4
false alarm above), which no other leak gets.

**Leak 2, never starting (~3 in 4 visitors).** Bigger by head count, but only
estimated, because nothing fires when someone sees the calculator. Two things
make it worse than it looks: city pages have no calculator (they link to
`/#booking`, a page change people can drop on), and in September most of the
traffic was ad clicks, which bounce more. Whether this leak is real or an ad
traffic artifact is the first thing an October pull should answer, split by
channel.

**Leak 3, the middle steps (38% lost between car and price).** Steps 2 to 4
are three screens; the one read we have doesn't say which loses them.
Step-by-step users in GA4 will.

**The blind spot: sent → job.** 11 sends a month only matters if they turn
into jobs. Nobody has counted that. The dashboard has the pieces (the quote
log has the phone; the pipeline has won and lost); no report joins them yet.

**Read October with care.** Ad impressions fell about 90% on Oct 1, so
October's visitors are mostly search and GBP, who arrive warmer than ad
clickers. October's rates will move even if the calculator didn't change.
Compare by channel, never site-wide.

### What Mikey would click to get October

GA4 (about 5 minutes, on a computer):

1. analytics.google.com → pick the property whose measurement ID is
   **G-G9WMXW2MF5** (Admin → Data streams shows it).
2. **Explore** → **Funnel exploration**.
3. Date range **Sep 29 to Oct 26, 2026** (booking live the whole way).
4. Steps (pencil icon), each one an event with a parameter, and on each step
   add the parameter **page_location does not contain `maintenance`**:
   - Started: `qqc_step`, step = 2
   - Condition: `qqc_step`, step = 3
   - Extras: `qqc_step`, step = 4
   - Saw a price: `qqc_quote`
   - Sent or booked: `qqc_submission`
   - Booked: `qqc_booking`
5. Turn **Make open funnel** on (the Services buttons skip to the price).
6. Breakdown: **Session default channel group**.
7. Screenshot it, or send the table. Also, from Reports → Engagement →
   Pages and screens, the **Views and Users of `/`** for the same dates.

Dashboard (on his phone, 2 minutes):

1. **Insights → Quote results**, last 2 months: the count, "booked", and the
   month rows. Not the CSV into a chat or the repo: it has names and phone
   numbers, and the repo is public. Counts are enough.
2. **Insights → Channels: cost per customer**, 30 and 60 days: leads and
   customers per channel.
3. **Lead pipeline** (Home widget or Work → Leads): won and lost since Sep 29,
   and of the won, how many came from the website quote or booking.

Google Ads: **Goals → Conversions → Summary**, Oct 1 to today, the two website
actions' counts.

## 5. Measurement plan

### Events to add (proposals; nothing changed yet)

Small, all in the calculator script, plus one rename on the maintenance page.
Whoever builds the winning changes from the four reports should do these in
the same pass so the change can be judged.

| Event | When | Why |
|---|---|---|
| `qqc_view` | calculator 50% on screen, once per page view | the missing top of the funnel (leak 2) |
| `qqc_start` | first vehicle tap, once per page view | a clean "started" that Back can't inflate |
| `qqc_step` + `first: true/false` | add a flag, true only the first time each step is reached in a page view | lets event counts be read without double counting |
| `qqc_quote` + `booking_offered`, `repeat` | whether `has-booking` was on; whether it's a re-quote (swap, back and forth) | splits leak 1 by which screen they saw |
| `qqc_pick_time` | tap "Pick my time" | the road choice |
| `qqc_text_instead` + `from: 5/7` | tap "Text me this quote instead" | the road choice, and whether the times put them off |
| `qqc_time_picked` + `days_out`, `index` | tap a time | do people take the first time, or hunt |
| `qqc_invalid` + `field` | a submit blocked by a missing field (both forms) | is the street field (booking) the wall |
| `qqc_slot_taken` | the 409 | rare, but today it reads as a second visit to step 7 |
| `qqc_booking_error` + `code` | add the HTTP status | tells a dead worker from a bad request |
| honeypot | stop firing `qqc_step 6`; fire `qqc_bot` instead | success means success |
| maintenance page | rename to `maint_step`, `maint_quote`, `maint_submission`, and point the Ads mirror only at `qqc_submission` from the homepage, or give oil changes their own Ads action | stops two calculators sharing one funnel and one conversion |

Dashboard side (its repo, its own rules): make `isQuoteRevealStep()` match
only `Saw their quote` (and the maintenance page's own price step), and add a
"quote → won" count to Quote results by matching the quote log's phone to the
pipeline's status. That last one is the only way the funnel's bottom row ever
gets a number.

### How to judge a change with this little traffic

The honest maths. To tell a real lift from luck (95% confidence, 80% chance of
catching a real effect), each side of a test needs:

| Change you hope for | People needed per side | At today's traffic |
|---|---|---|
| price → sent, 39% to 55% | ~150 at the price | ~11 months for a 50/50 split (28 a month) |
| price → sent, 39% to 65% | ~57 | ~4 months |
| started → price, 62% to 80% | ~99 started | ~4.5 months |
| visit → start, 20% to 30% | ~290 visits | ~3 months |
| visit → start, 20% to 40% | ~81 visits | ~1 month |

So:

1. **No 50/50 split tests on the price screen.** They'd run most of a year,
   through a season change, a price change and the Rain-Ready offer ending.
   Only the top of the funnel (visit → start) has the volume for a test, and
   only for a big change.
2. **Ship one change at a time, write the date in the scoreboard, and compare
   4-week blocks before and after**, split by channel (GBP and search
   separately from ads). Only believe a move that lands outside the earlier
   block's 95% range. At 28 price-seers that means price → sent has to go
   from 39% to about 60% before it counts. Anything smaller is "keep it if it
   makes sense, don't call it proven".
3. **Decide the yardstick before shipping.** One number per change: for a
   price-screen change, sends plus bookings per person who saw a price (users,
   `G-G9WMXW2MF5`, page filtered); for a top-of-funnel change, starts per
   homepage visitor.
4. **Use the dashboard journeys for the why.** 45 days of per-person paths is
   small enough to read one by one: after a change, read the last 20 people
   who saw a price and didn't send. That's evidence a split test can't give
   at this size.
5. **The number that pays is jobs.** Sends can rise while jobs fall (a cheaper
   looking screen that pulls tyre-kickers). Every comparison ends with won
   jobs from website quotes, once the dashboard can count them.
6. **Don't change two things in the same 4 weeks**, and note anything outside
   the calculator that moves traffic (an ad change, a GBP post push, a
   postcard drop). The Oct 1 ad drop is exactly what would have been read as
   "the calculator got better" otherwise.

## 6. Ranked changes

Ranked by what they're worth to Mikey per hour of work, with the measurement
fixes first because nothing after them can be judged without them.

| # | Change | Expected effect | Effort | Needs from Mikey | How we'd measure it |
|---|---|---|---|---|---|
| 1 | **Fix the tracking**: the events in section 5, the maintenance rename, the honeypot | no conversion change; makes every other change judgeable and stops oil-change leads reaching the Ads bidder as detailing quotes | about 1 to 2 hours, site only | a yes (it touches `index.html` and the maintenance page) | GA4 Realtime / DebugView: walk both roads once on a phone and watch each event arrive once |
| 2 | **Pull October's funnel** (the clicks in section 4) | tells us whether leak 2 is real or a September ad artifact, and gives the first booking-era numbers | 10 minutes of his time | the GA4, dashboard and Ads clicks above | one table in the scoreboard, by channel |
| 3 | **Count sent → job** in the dashboard (quote log phone matched to won) | finds out if the real leak is after the calculator; if so it beats every on-page change | a few hours, dashboard repo | a yes (dashboard change; no texts, no stored data rewritten) | the new count, monthly |
| 4 | **Work on the price screen** (leak 1): whatever the offer/trust and mobile reports pick | biggest measured leak; a change that moved 39% to 50% would be about 3 more sends a month at today's traffic | per those reports | per those reports | 4-week before/after on sends per price-seer, split by `booking_offered`; believe only a jump to about 60%+ |
| 5 | **Fix the abandoned-quote email's step-4 false alarm** (dashboard) | his inbox stops counting Extras-leavers as price-leavers, so the leak he sees is the real one | 15 minutes, dashboard repo | a yes | the email only arrives for journeys that carry `Saw their quote` |
| 6 | **Top of the funnel** (leak 2): make starting easier (first question visible sooner, the calculator on city pages instead of a link to the homepage) | if 3 in 4 visitors really never start, this is the most people; but it's an estimate until #1 and #2 land | medium; city pages are 12 copies | a yes on city-page layout | `qqc_view` → `qqc_start` per visitor; the one place a real split test is feasible (about a month for a 20% → 40% change) |
| 7 | **The middle steps** (leak 3): only after GA4 says which step loses them | 38% lost across three screens; fix the worst one | small once known | nothing until the data's in | step-to-step users, 4-week blocks |

**What I'd do first:** #1 and #2 in the same week. Until then every other
report's recommendation, including the good ones, can only be judged by how
it reads, not by what it did.
