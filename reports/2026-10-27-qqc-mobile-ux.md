# Quote calculator on a phone: a hands-on teardown (2026-10-27)

R&D track 2 of 4: the calculator (QQC) the way a customer uses it, on the live
site, at phone sizes. The other three reports cover the funnel numbers
(`2026-10-27-qqc-funnel-data.md`), competitors and evidence
(`2026-10-27-qqc-competitor-research.md`) and the price screen's offer, trust
and follow-up (`2026-10-27-qqc-decision-step.md`). Nothing on the site was
changed; this is a report only.

**No dead button and no broken step.** Every path worked end to end, up to the
last tap before a real send: all three services, all three sizes, all three
conditions, add-ons, "Pick my time" to the name/phone/town/street step, "Text
me this quote instead", and the empty-form errors on both forms. When the
calendar is down, slow, empty or erroring, the price screen falls back to the
phone form exactly as designed, so a lead is never stranded. Nothing found here
is losing leads outright today. What it finds is friction, and most of it sits
on phones 375px wide and narrower, which is the iPhone SE/mini and most budget
Androids.

**The two that matter most:**

1. **On a 360 to 375px phone the Continue button is below the screen on steps
   2, 3 and 4.** Every middle step needs a scroll to find the button. On step 4
   it's below the screen even on an iPhone 14. The funnel report measures this
   stretch losing about 4 in 10 (45 started, 28 saw a price).
2. **Step 2 shows the sedan's prices to a van owner.** Pick Van, and the cards
   still say Full Detail $369, Interior $249, Exterior $199, while the running
   total above them says $449. The $80 looks like a fee that appeared out of
   nowhere.

## How it was tested

- Playwright's Chromium against `https://mikeysdetailing.com/`, four sizes:
  iPhone SE 375x667, iPhone 14 390x844, small Android 360x740 (all touch, 2x),
  and a 1366x800 laptop. Plus slow 3G (400 kbps, 400 ms, CPU 4x slower) and
  fast 3G.
- **Every request that could reach Mikey or his accounts was blocked** at the
  browser: `/api/book`, `/submit`, Web3Forms, the dashboard's `/px` page
  counter and journey beacons (so no "Saw their quote" alert went out), Google
  Tag Manager/GA4 and Clarity. The blocked list is in `results-*.json`
  (`_blocked`): only `GET /px`, `POST /px/e`, `gtag/js` and Clarity were ever
  attempted, all stopped. The one call allowed out was the read-only
  `GET /api/next-openings`. No form was ever submitted with data in it.
- Scripts: `2026-10-27-qqc-mobile-ux/scripts/walk.cjs` (the walks) and
  `edge.cjs` (back, refresh, network, calendar failures, field attributes).
  Raw numbers: `results-walk.json`, `results-edge.json`. Screenshots are in
  `2026-10-27-qqc-mobile-ux/`, named `<device>-<nn>-<step>.jpg`
  (`se`, `ip14`, `android`, `desk`) and `edge-<nn>-<case>.jpg`.

## The numbers

**Taps and screens to a price:** 7 taps and 5 screens from landing ("Get My
Instant Quote", vehicle (moves on by itself), service, Continue, condition,
Continue, See my quote). On a 375px or 360px phone add 3 scrolls, one each on
steps 2, 3 and 4, to reach Continue. From the price to a booked time: Pick my
time, a time, four fields, Book: 7 more taps plus typing.

**Time to a price:** the script took 6.6 to 7.1 s, but about 5.5 s of that is
its own waiting, so it isn't a human number. The site's own animations add
about 1.4 s (0.28 s before step 1 moves on, a 0.45 s fade per step, 0.6 s for
the price to count up). A person reading each screen is realistically 25 to 45
seconds, inside the "60 seconds" promise.

**Speed is not the problem:**

| | No throttle | Fast 3G, CPU 4x | Slow 3G, CPU 4x |
|---|---|---|---|
| First paint (LCP is the headline) | 0.22 s | 0.44 s | 0.88 s |
| Calculator script ready | 0.33 s | 0.59 s | 1.6 s |
| Page fully loaded | 0.48 s | 1.1 s | 5.7 s |

The homepage HTML is 364 KB (98 KB gzipped, the biggest single file by far),
and the whole page is 0.54 MB with images lazy-loaded. On a bad connection the
calculator works 1.6 s in, well before anyone scrolls to it. Not worth
engineering time.

**Where the main button lands on each step** (top/bottom of the button in CSS
px after the step scrolls into place; the screen ends at the device height):

| Step | iPhone SE 375x667 | Android 360x740 | iPhone 14 390x844 | Laptop 1366x800 |
|---|---|---|---|---|
| Landing: Get My Instant Quote | 689 to 740, **below** | 689 to 740, just fits | 675 to 726, fits | 860 to 916, **below** |
| 1 Vehicle tiles | 513 to 676, last 9 px cut | fits | fits | fits |
| 2 Continue | 776 to 826, **below** (844 after picking) | 792 to 842, **below** | 624 to 674, fits | fits |
| 3 Continue | 768 to 818, **below** | 768 to 818, **below** | 711 to 761, fits | fits |
| 4 See my quote | 838 to 888, **below** | 838 to 888, **below** | 837 to 887, **below** | fits |
| 5 Pick my time | 599 to 653, fits | fits | fits | fits |
| 5 Text form: Lock in $X | 817 to 871, **below** | 834 to 888, **below** | 828 to 882, **below** | 811 to 865, **below** |
| 7 Times | fits | fits | fits | fits |
| 8 Book [time] | 655 to 709, **below** until fields are filled | fits | fits | fits |

**Tap targets under 44 px** (Apple's minimum): "SMS Terms" and "Privacy Policy"
(14 px tall), "Edit my details" and "Pick a different time" (32 px), "See more
days" and "Not ready? Text me this quote instead" (34 px). Every main button,
tile, chip and field is 46 px or taller.

**Fields and keyboards:** every field is 16 px, so iOS never zooms in. Phone
fields are `type="tel"` with `inputmode="tel"` and `autocomplete="tel"`, names
are `autocomplete="name"`, the street is `street-address`. Gaps: the town
`<select>` has no `autocomplete`, name/phone/street have no visible label (the
placeholder disappears as you type), and no field sets `enterkeyhint`. With the
keyboard up on step 8 the Book button is under it, which is normal; Return
submits the form, which works.

## Friction points and bugs, with fixes

Ordered by how much they plausibly cost, not by where they appear.

### F1. Continue is below the screen on steps 2, 3 and 4 on small phones

`se-02-step2-service.jpg`, `se-03-step2-picked.jpg`, `se-04-step3-condition.jpg`,
`android-04-step3-condition.jpg`, `ip14-06-step4-addons.jpg`

People do find a button below the fold, but every screen that makes you hunt
for the next step is a screen where some people put the phone down. Three causes, each fixable on its own:

- **Step 2: a breakpoint stacks Interior and Exterior on 380px and under.**
  `@media (max-width: 380px) { #qqcCard .duo { grid-template-columns: 1fr; } }`
  (`index.html:1773`). At 390 they sit side by side at 142 px each and look
  fine (`ip14-03-step2-picked.jpg`); at 375 the card is 297 px inside, which
  fits two 142 px cards just as well. Stacking them adds about 150 px and is
  the whole reason Continue is off an iPhone SE. **Fix:** delete that one line.
- **Step 4: the three free Rain-Ready extras each get a full chip** that can't
  be tapped (they're locked on), about 400 px of the screen for no decision
  (`ip14-06-step4-addons.jpg`). **Fix:** fold them into one gold line above the
  paid extras: *"On me with a Full Detail until Dec 31: ceramic wax, RainX and
  anti-fog."* That frees about 270 px and puts "See my quote" on screen on
  every phone tested. The breakdown on the price screen still itemises them,
  so Mikey's text and email don't change.
- **Step 3: the Full Detail tile is 199 to 215 px tall** on a phone and step 3
  stacks Year/Make/Model and City/ZIP on 380px and under (`index.html:1738`).
  **Fix (smaller):** keep the two fields side by side at 375 (they fit at 143
  px each, same as on the iPhone 14). If that's still not enough, a sticky
  Continue bar at the bottom of the card on steps 2 to 4, the same way the
  call page pins its main button, guarantees it on every phone.

### F2. Step 2 shows sedan prices after you've said it's a van or SUV

`edge-05-van-both-step2.jpg`, `ip14-03-step2-picked.jpg`

The service cards print `$369 / $249 / $199` whatever size was picked one tap
earlier. The running total then shows the real number ($449 for a van), so
the first thing a van owner sees is $80 they weren't told about. It also
contradicts "No hidden fees" two screens later. **Fix:** when a size is picked,
rewrite the three card prices to that size's price (`PRICE[name] +
S.vehicle.value`), so a van owner sees $449 / $329 / $279 from the start. Same
book, same numbers; nothing in `PRICING.md` changes. Leave the condition out
of the card price (it hasn't been asked yet).

### F3. The homepage pushes "Get My Instant Quote" off the first screen

`se-00-landing.jpg`, `desk-00-landing.jpg`

There's an 81 px empty band between the header and the hero on every size.
The fixed header is cleared twice: `body { padding-top: 70px }` (90 px on
desktop) **and** `main { padding-top: 70px; }` (`index.html:234`), and the hero
adds its own 40 px (90 px desktop) on top. Result: the hero's quote button
starts at 689 px on a 667 px iPhone SE and at 860 px on a 1366x800 laptop,
below the first screen on both. The funnel report's biggest leak by head count
is people who never start (about 3 in 4); this doesn't explain all of that,
but the first screen of an ad click not showing the quote button is the
cheapest piece of it to fix. **Fix:** drop `main { padding-top: 70px; }` on the
homepage (check the hero under the header after, on 375 and 1366). That moves
the button to about 619 px on the SE, on screen. Check the other pages'
`<head>` before copying the change: each page carries its own CSS.

### F4. The text-me form looks like it already has errors

`se-12-text-instead-form.jpg`, `edge-03-openings-down.jpg`

On the "Text me this quote instead" road (and on the price screen whenever the
calendar is down), Name and Phone are drawn with a red border, a red tint and
a red **REQUIRED** badge before anyone has typed (`index.html:1714 to 1716`).
Red outline is how every form on a phone says "you did this wrong". The
booking form on step 8 doesn't do it, so the two forms on the same calculator
disagree. **Fix:** draw them like step 8's fields; red only after a failed send
(the `.bad` state already does that). If they need a nudge, put it in the
placeholder: *"Your name"* and *"Your cell, so I can text you"*.

### F5. The text form's send button is below the screen on every device, laptop included

`se-12-text-instead-form.jpg`, `desk-12-text-instead-form.jpg`

The full price breakdown sits between the number and the form, so "Lock in
$419" lands at 811 to 888 px everywhere. With the Rain-Ready extras that's
three free rows plus the service (`se-07-step5-price.jpg`). **Fix:** collapse
the three free extras into one row on the price screen too: *"Ceramic wax,
RainX, anti-fog: free (Rain-Ready)"*, about 110 px back. This is the screen
the decision-step report owns, so take its layout if it moves things; the
point from here is only the measurement.

### F6. Back button and refresh throw the quote away

`edge-01-after-back-once.jpg`, `edge-02-after-refresh.jpg`

On a phone, "back" is the swipe or the button people use to undo a step. On
step 4, the first back only removes `#booking` from the URL and jumps to the
top of the page (step 4 is still there, 2,000 px below). The second back
leaves the site. A refresh (or iOS reloading a tab someone left for a text
message) wipes everything back to step 1, Year/Make/Model included.
**Fix:** (a) push a history entry per step (`history.pushState({qqc:n})`,
`popstate` calls `goStep`), so back goes back a step and stays in the card;
(b) save the answers to `sessionStorage` on each step and restore them on
load, in a try/catch so private mode still works. Keep the restored visitor
on the step they left, never past the price.

### F7. "Last step" twice

`se-08-step7-times.jpg`, `se-09-step8-details.jpg`

Step 7 says "Last step · Pick your time", then step 8 says "Last step · Lock
it in". The second "last step" reads as a broken promise right before the one
screen that asks for a phone number and street. **Fix:** step 7 *"Almost done ·
Pick your time"*, step 8 *"Last step · Where I'm headed"*.

### F8. What you type on step 8 doesn't come back to the text form

If someone types their name and number on step 8, then taps "Pick a different
time" and "None of these work? Text me this quote instead", the text form is
empty. The copy goes the other way (price screen to step 8) but not back.
**Fix:** in the `text-instead` handler, copy `qqBName`/`qqBPhone` into
`qqName`/`qqPhone` when those are empty. Three lines.

### F9. Small tap targets

The SMS Terms and Privacy links are 14 px tall, and "Edit my details", "See
more days" and "Not ready? Text me this quote instead" are 32 to 34 px. The
text links are the ones that matter: "Not ready? Text me" is the second road
off the price. **Fix:** `min-height: 44px` on `.qq-textlink` and `.qq-edit`,
and `padding: 6px 0` on the consent links (keeps the TCPA wording where it is).

### F10. Forms: labels and autofill

- Name, Phone, Street and the text form's fields rely on placeholders as
  labels. Once a field has text, there's nothing saying what it was. **Fix:**
  `aria-label` on each now (no visual change), and later a small label above.
- The town `<select>` has no autocomplete. **Fix:** `autocomplete="address-level2"`
  so Chrome can fill it from a saved address.
- Add `enterkeyhint="next"` to Name and Phone and `enterkeyhint="send"` to the
  last field of each form, so the keyboard's Return key says what it does.

### F11. Smaller things seen on the way

- **"Save $79 vs. buying separately"** wraps to three lines inside a pill on
  phones and spills past its rounded ends (`se-03-step2-picked.jpg`). Shorter:
  *"$79 less than both separately"*, or let it be a plain line, not a pill.
- **Step 3's Continue is greyed out until a condition is picked, with no word
  why.** Tapping it does nothing. Either pick nothing and say *"Pick one, it
  just helps me prep"* under the tiles when the disabled button is tapped, or
  move on by itself after a condition tap the way step 1 does (the two text
  fields are optional and could move to the price screen or step 8).
- **A late calendar answer can swap the price screen under someone.** The
  openings fetch starts on step 3 and gives up after 4.5 s; the price screen
  asks again. If the answer then arrives while they're looking at the form but
  haven't typed, the form is swapped for "Pick my time". The code already
  guards against yanking it from someone typing; this is only the reading case,
  and it's rare. Leave it.
- **The card hides about 70 px of horizontal overflow** (`#qqcCard`
  scrollWidth 403 against 333 on a 375 phone; it's the decorative glow).
  Under automation the card once got scrolled sideways inside itself and the
  right edge was cut off (`edge-05-van-both-step2.jpg`,
  `edge-07-van-both-price.jpg`). I couldn't make a finger do it, so it may only
  be a test artefact, but `overflow: clip` instead of `overflow: hidden` on the
  card makes it impossible for one line.
- **Outside this track, noticed in passing:** the mini "Which detail do I need"
  quiz further down the homepage lists **"Same-day turnaround"** as a Full
  Detail feature (`index.html`, the `SVC.full.feats` list). That isn't in the
  facts table and could be read as a same-day booking promise, which the
  calendar never offers. Worth Mikey's look.

## What worked well (keep it)

- The calendar fallback: down, empty, HTTP 500 or 6 s slow, the price screen
  shows the text form and nobody is stuck (`edge-03-openings-*.jpg`).
- The masthead collapsing from step 2 on, and step 1 moving on by itself.
- "Pick my time" sits right under the price on every device, with the next
  opening under it.
- Validation: an empty submit marks every missing field, focuses the first one
  and clears each complaint as it's fixed.
- The street hint on step 8 ("Just the street or the nearest cross street is
  fine") is the right call for strangers.
- The mobile sticky bar gets out of the way while the calculator is on screen.

## Ranked changes

Effect is a judgment of how many more people reach the price or send, not a
measured number; the funnel report's base is 45 starts and 28 prices a month,
so anything here needs a few weeks of data to read. All of these are small
edits to `index.html`; none changes a price, the offer, the terms or the
consent wording.

| # | Change | Expected effect | Effort | Risk | How we'd measure it |
|---|---|---|---|---|---|
| 1 | **F1:** delete the 380px `.duo` stack; fold the three free extras into one line on step 4 | Middle steps (38% lost today) lose fewer on small phones; Continue on screen on every phone tested | 20 min | Low: layout only. Re-check 320px and the Exterior-only step 4 | GA4 `qqc_step` 2→3→4→5 by device category, 4 weeks before/after; and rerun `scripts/walk.cjs`, every main button should read "fits" |
| 2 | **F2:** service cards show the price for the size picked | Removes the "$80 appeared" moment for SUV and van owners, the bigger tickets | 15 min | Low: display only, the total already does this math | `qqc_step` 2→3 for SUV/van vs sedan (needs size added to the event; the journey line already has it) |
| 3 | **F3:** remove the doubled header padding so "Get My Instant Quote" is on the first screen | Some of the never-started leak, on SE-size phones and 800px-tall laptops | 10 min | Low, but check the hero on 375 and 1366 after | Starts per homepage visit (`qqc_step 1` or first vehicle tap per session), before/after |
| 4 | **F4 + F5:** text form drawn normally until a failed send; one free-extras row on the price screen | More sends on the text road and whenever the calendar is down | 20 min | Low. Coordinate with the decision-step report, which owns that screen | `qqc_submission` with `source: qqc_form` per `qqc_quote` |
| 5 | **F6:** back goes back a step; answers survive a refresh | Fewer lost half-quotes from the swipe-back gesture and tab reloads | 1 to 2 h | Medium: history handling across the Rain-Ready button and the services quiz hand-offs needs testing | Count of `popstate` restores and session restores (one new GA event each) |
| 6 | **F7, F8, F9, F10:** "Last step" once, carry name/phone back, 44 px links, labels and autofill hints | Small, cumulative polish on the last two screens | 30 min | Very low | Step 8 → booked rate; mostly verified by rerunning the scripts |
| 7 | **F11:** pill copy, step 3 nudge, `overflow: clip` | Small | 15 min | Very low | Visual check |

Do 1 to 4 together (about an hour, all layout or display) and ship them in one
change, so the before/after has a single date to read from. 5 is worth doing
next on its own, with its own test. After any of them, rerun
`node reports/2026-10-27-qqc-mobile-ux/scripts/walk.cjs <out-dir> walk`: it
blocks every write and prints where each step's button lands, so it doubles as
the regression check.
