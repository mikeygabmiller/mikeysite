# QQC R&D: the moment of decision

2026-10-27. One of four parallel R&D reports on the quote calculator (QQC). This
one covers the price reveal (step 5), the booking steps (7 and 8), the success
screen (6), and what happens to people who see a price and leave. Funnel
numbers, the mobile teardown and competitors are the other three reports.

Nothing here has been changed on the site or in the dashboard. Every fix below is
a proposal for Mikey to pick from.

**How this was read:** `index.html` lines 1483–2937 (markup and script), the
dashboard worker on its live branch `claude/qqc-submission-auto-text-cspjc3`
(`/submit`, `/api/book`, `/api/next-openings`, the quote-watch alert, the
follow-up engine, the quote opener and the booking texts), `PRICING.md`, and the
calculator driven in a 390 px phone browser (Full Detail, SUV, Needs Work) with
every beacon to the dashboard blocked so Mikey got no fake "saw a price and
left" email. `/api/next-openings` was read live for all three services.

---

## The short version

1. **The guarantee isn't on the price screen.** CLAUDE.md puts it there (one
   of its four places). In the code it's on the *success* screen instead, which
   people only see after they've decided. `check-site.py` counts three outside
   the guarantee section either way, so it passes. Moving that one line is free.
2. **At the moment of decision a phone visitor can't see** what the detail
   actually includes, how long it takes, that they need a spigot and an outlet,
   or that it's the same guy every time. The desktop side panel says some of it;
   phones (most of the traffic) don't get the panel.
3. **Someone who sees a price and leaves is gone for good.** The dashboard emails
   Mikey ("👀 Saw $439 and left") but there is no number to reach them on, and
   the site forgets the quote. Two fixes need no texting at all: remember the
   quote in the browser, and a one-tap "text it to me" button that opens *their*
   messages app (they text him, so there's no consent question).
4. **Full Detail booking thins out to Saturdays at 7 AM from Nov 1** (live
   check today: 7 openings in the next 30 days, 4 of them Saturdays at 7 AM).
   That's the Rain-Ready product. The time screen doesn't say why, and "None of
   these work?" drops the day they wanted on the floor.

The ranked list is at the end.

---

## 1. The price screen (step 5)

### What's there now (phone, Full Detail, SUV, Needs Work)

```
Almost done · Your quote
Your estimate
$439
No hidden fees. Pay when the job's done.
┌ WHAT'S INCLUDED ─────────────────────────┐
│ ✓ Full Detail          $439              │
│   SUV / Truck · Needs Work               │
│ ✓ Ceramic Wax          ~~$20~~ Free      │
│   Rain-Ready, until Dec 31               │
│ ✓ RainX Windows        ~~$10~~ Free      │
│ ✓ RainX Anti-Fog       ~~$30~~ Free      │
└──────────────────────────────────────────┘
[ Pick my time → ]
Next opening: Wed, Oct 28 at 1:00 PM
Not ready? Text me this quote instead
‹ Edit my details
```

The button lands on the first screen at 390×844, just. Good: the rule "nothing
between the amount and the button" is holding.

### What a hesitating customer still doesn't know at that moment

| Question in their head | Where the site answers it today | On the price screen? |
|---|---|---|
| Will he guarantee it? | Hero, guarantee section, final CTA, **success screen** | **No** |
| What does a Full Detail actually include? | Services section cards, far down the page | No. "What's included" lists line names, not work |
| How long will it take / how long am I stuck at home? | FAQ, city pages | No |
| Do I need to be home / supply anything? | FAQ ("spigot and outlet") | No. Only after an *instant* booking succeeds |
| When do I pay? | "Pay when the job's done" | Yes |
| Is it a crew or him? | Desktop side panel only ("Same detailer every time, no crew") | No, on phones |
| Is this the real price or a ballpark? | Meta description says "exact price" | Heading says "Your **estimate**" |

The spigot-and-outlet one matters most of these after the guarantee. A customer
who books and *then* reads "All I need there is an outdoor spigot and an outlet"
on the success screen is the one who texts back "I live in an apartment" and
cancels. Better they read it before they tap.

### Draft copy (Mikey's voice, facts table only)

**Heading.** `Your price` instead of `Your estimate`. *Needs Mikey's yes:* it's a
promise that he won't adjust it on arrival (beyond what the notes box says). The
magazine-ad notes already treat the calculator figure as exact ("the calculator
quotes $369, so this version never says 'your exact price'"), and the
reassurance row says "Price held 30 days", so "estimate" is the odd one out. If
he does adjust on arrival, keep "estimate" and drop "exact" from the meta
description instead. Either way, they should agree.

**Line under the amount (guarantee slot 2 of 4):**

> No hidden fees. You don't pay until you love it.

and the success screen's line changes from "No deposit, and you don't pay until
you love it." to:

> No deposit. You pay when the job's done.

That keeps the homepage at exactly four, as `check-site.py` requires, and puts
the guarantee where people hesitate rather than where they've already decided.

**One line of what's in it, under the service name in the breakdown** (all
taken from the services cards already on the homepage; nothing new claimed):

| Service | Line | Time (facts table) |
|---|---|---|
| Full Detail | Everything inside and out: vacuum, steam clean seats and carpet, hand wash, wheels, door jambs and glass. | Takes 3–5 hours. |
| Interior | Vacuum and crevices, steam clean seats and carpet, leather, door jambs. | About 90 minutes, 2–4 hours with pet hair or heavy stains. |
| Exterior | Hand wash and dry, wheels and tires, outside glass, spray sealant. | About 1–2 hours. |

Caveat: the homepage Exterior card says "spray sealant" while its JSON-LD says
"decontamination, clay bar ... wax or sealant". Pick one before this line goes
up; I've used the card's words. The exterior time (1–2 hours) is marked "Mikey
to confirm" in the facts table.

**Collapse the three Rain-Ready rows into one** (saves about 200 px on a phone,
which buys room for the lines above without pushing the button down):

> ✓ Rain-Ready extras: ceramic wax, RainX, anti-fog  ~~$60~~ **Free**
>   Book by Dec 31

The text and email Mikey gets keep listing all three with "(free, Rain-Ready)":
that's `S.items`, not the on-screen breakdown, so nothing he relies on changes.

**Three facts under the button** (where the "No deposit / Pay when complete"
row sits on the form; the price screen has no row today):

> ✓ Just me, every time  ✓ You pay after  ✓ You provide a spigot and an outlet

"Same detailer every time" is one of the slots CLAUDE.md names for exactly this
use. The spigot line goes with its reason if there's room: "Using yours is how I
keep the price down." Never "I bring water and power".

**One real review under the button, optional.** Below the button is allowed;
above it isn't. It has to be word for word from `/reviews/`. Short ones that
answer a doubt at this moment (both verbatim from the reviews page):

> "Super friendly, showed up on time, and didn't rush through the job."

Both are whole sentences. Quote at least a whole sentence, under the name exactly as `/reviews/` gives it, and see the
C. W. problem in section 6 first. My view: test it *after* items 1–3 above,
because every line here pushes the button lower.

### What not to add here

- No scarcity line beyond the existing "Next opening". No "spots filling up".
- No second guarantee wording ("love it or it's free") on this screen: one is
  the rule.
- No new offer, no "book today and..." line.

---

## 2. The booking step (steps 7 and 8)

### Three openings: right number, wrong explanation in winter

Three buttons and "See more days" (up to 12) is right. Three get tapped; a wall
of days gets thought about. Keep it.

The problem is what the three *are* after the clocks change. Live
`/api/next-openings` today:

- **Interior / Exterior (SUV):** 12+ openings, weekday 1:00 PMs and Saturdays.
- **Full Detail (SUV):** 7 in the whole 30-day window. Wed Oct 28 1 PM, Fri Oct
  30 1 PM, Sat Oct 31 7 AM and 1 PM, then **Sat Nov 7, 14, 21 at 7:00 AM only.**

That's the before-dark rule working as designed (weekday Full Details are off
until his work lights are ready). But from Nov 1 a Full Detail customer sees
three Saturdays at 7 AM spread over three weeks, with nothing saying why, and
the Full Detail is the Rain-Ready product the hangers and postcards push.

**Draft line**, shown on step 7 only when the service is a Full Detail and no
weekday made the list:

> A Full Detail takes most of a day, so this time of year it only fits before
> dark on a Saturday. Need a weekday? Tell me which one and I'll see what I can
> do.

Check this with Mikey before it goes up: if he'd rather not offer weekday Full
Details at all, cut the second sentence. (The CLAUDE.md note says Rain-Ready jobs
booked by Dec 31 can run to Jan 31 for exactly this reason. With a 30-day
window the screen never shows January, which is fine.)

### "None of these work?" loses the day they wanted

Today it opens the phone form, which sends name, number and the quote. The
dashboard's quote opener **already reads a preferred day** (`quoteWhen(f)` looks
at `f.appointment` and replies "I saw you were hoping for Tuesday, let me check
what I've got open"). The site never sends `appointment`.

**Fix, site only:** when they arrive at the form from step 7, show one optional
box above name and phone:

> What day works for you? (optional)  `e.g. Tuesday, or any Saturday`

and send it as `appointment` in the `/submit` payload. No dashboard change; the
opener already handles it.

### Step 8 fields: do they all earn their place?

| Field | Keep? | Why |
|---|---|---|
| Name | Yes | `/api/book` returns `missing_contact` without it, and the confirm text greets them by first name |
| Phone | Yes | It's how he confirms |
| Town (select) | Yes | Decides instant confirm (twelve towns) vs request. Already prefilled from step 3's "City or ZIP" when it matches |
| Street | Yes, as it is | The "just the street is fine" hint is good; his alert tells him to ask |

Nothing to cut. Two small things:

- **The summary box drops what they're getting.** It reads "Full Detail · SUV /
  Truck · $439". Add a second line when Rain-Ready is on: "+ ceramic wax, RainX
  and anti-fog, free". It's the reason a lot of them picked Full Detail.
- **"Price held 30 days" on a booking makes little sense** (they've booked; the
  price is the price). Swap that tick for the one that matters before they tap
  Book: "You provide a spigot and an outlet". It also stops the spigot line
  appearing for the first time on the success screen.

"Price held 30 days" also isn't in CLAUDE.md's facts table. `PRICING.md` says
the *old* auto-text promised it and that text no longer does; the site still
promises it on the text-me form. If Mikey still stands behind it, add it to
the facts table; if not, take it off the form too.

### The success screen

- **Booked, in his towns:** good. Says it's on his schedule, the confirm text,
  the reminder, spigot and outlet.
- **Request (outside the twelve):** good. Honest that he'll check the drive.
- **"Text me this quote" path:** "Mikey will text you ASAP to confirm the price
  and help get you on his schedule." Third person, and the rest of the site is
  first person. Draft:

  > I'll text you in a few minutes. If it's late at night, first thing in the
  > morning.

  That matches what the worker does: a 2–4 minute delay, held to 5 AM for
  anything sent between 11 PM and 5 AM (`firstReachoutAt`).

- **The confirm text itself** (dashboard, `bkMessageBody('confirm')`) is
  already in his voice, mentions the spigot and outlet (if his "How I talk"
  switch is on), and leaves the door open. Nothing to change there.

---

## 3. People who see a price and leave

### What the dashboard keeps today

- Every visitor gets an anonymous id (`MD_VID`, `site-stats.js`), and the
  calculator reports each step to the dashboard's journey log (`MDTrack`).
- On the price, the site sends **"Saw their quote"** with the total, the car and
  the items. The worker arms a watch. After **2 minutes of silence** (not two
  minutes of clock), if no phone has been linked to that visitor, it **emails
  and texts Mikey**: "👀 Saw $439 and left, no name, no number", with what they
  picked, the page, how they found the site and a link to their whole journey.
  Max one per visitor. Switch: `quoteAbandon` / `quoteAbandonMin` in settings.
- Grow shows "people who saw a price and left" for this week and last, by the
  step they stopped on (`priceLeftSummary`).
- **Nothing customer-facing.** No phone, so nobody to text, and the site itself
  forgets the quote on reload.

People who *do* leave a number (the text-me form) are already chased: the
follow-up engine queues nudges at 1, 3 and 7 days after Mikey's last
unanswered text. By default (`autopilot: false`) those are suggestions he taps,
not texts that send themselves. Whether he has switched autopilot on is in his
Settings; I couldn't read his live config from here.

### A bug in that alert

`isQuoteRevealStep()` in the worker treats **"Quote form, step 4"** as "a price
is on their screen". That was true when step 4 was the price. Step 4 is now the
**add-ons** screen; the price is step 5. So someone who quits on add-ons, having
never seen a number, gets an alert reading "Saw their quote and left" (with no
price). The priced "Saw their quote" event has shipped, so the legacy step-4
match can go. The alert email's comment also still says "step 4". Dashboard
change, no customer texts involved, so it doesn't need Mikey's yes under the
dashboard's rules, but it's outside this session's brief (read only).

### Options, cheapest first

**A. Remember the quote in their browser (site only, no texting).**
Save the car, service, condition, extras and total in `localStorage` when the
price shows. When the same browser comes back (most people who leave come back
later to "think about it"), open the calculator on their price:

> Your quote's still here: **$439**, Full Detail, SUV.
> [ Pick my time → ]   Start over

Rules: wrapped in try/catch (private windows throw), expire it after 30 days,
re-price from today's `PRICE` rather than trusting the saved total (so a price
change or the end of Rain-Ready on Jan 1 can't show a stale number), and drop
the Rain-Ready rows once `RR_END` passes. Measure with a new `MDTrack('Came back
to their quote')`.

**B. One-tap "text it to me" (site only, customer starts the conversation).**
On phones, add a button on the price screen and on step 7 that opens *their*
messages app with the quote filled in, addressed to (425) 600-7897:

> Hi Mikey, I got a quote on your site: $439 for a Full Detail, SUV, needs
> work. Can you fit me in?

The site already builds exactly this link as its error fallback
(`sms:+14256007897?&body=...`). Because the customer sends the first text, it's
a 1:1 conversation they started: no consent box, no TCPA question for Mikey's
reply. It lands in the dashboard as an inbound text like any other. Cost to the
customer: one tap and Send, no typing a name or number into a form. Show it only
on touch devices (desktop `sms:` links do nothing useful).

Where it goes: inside the "Not ready? Text me this quote instead" form, as the
first option ("Send it from my phone" button, then "or I'll text you" with the
fields). Not as a fourth link on the price screen: three choices there is
already the limit.

**C. Make the name optional on the text-me form (site only).**
`/submit` already accepts a phone with no name ("Only the number is required...
a number with no name is still a lead"), and the opener asks for the name in its
first text. The site still requires it. One box fewer at the moment of decision.
Booking (step 8) keeps the name: `/api/book` needs it.

**D. Ask for the phone before the price. Don't.**
Gating the price behind a number is the common industry move and it would
capture more numbers, but it breaks the site's main promise ("See your price in
60 seconds, no phone tag") that's in the title, the meta, the hero and the GBP
copy. Also, a number taken that way, with "text me my price" consent, covers
texting them the price, not chasing them for a week. Not recommended.

**E. An automatic follow-up text to people who left a number but didn't book.
STOP AND ASK MIKEY. Designed here, not built.**

This is the only option that texts a customer on its own, so it's his call under
the dashboard's rules, and it needs consent that covers it.

- **Who:** people who submitted the text-me form (they ticked nothing, but the
  disclosure above the button says "text messages about your quote and
  appointment", and tapping it is the opt-in, with the wording and timestamp
  stored). **Never** people who only saw a price: there's no number, and buying
  or matching one would be a CEMA/TCPA problem.
- **Already covered?** Mostly. The follow-up engine's 1/3/7-day nudges are this
  feature, sitting behind the `autopilot` switch. The real decision for Mikey
  is whether to turn autopilot on for quote leads, not to build something new.
- **If he wants it:** one text, about 24 hours after the opener if they never
  replied, inside quiet hours, opt-out aware (the reserve-then-send cron already
  is), no em dashes, his words. Draft:

  > Hey Sarah, Mikey here. Still want that Full Detail on the SUV? Saturdays are
  > what I've got for those right now. Just text me a day and I'll hold it.

  One text, then stop. "Saturdays" only while that's true; better, read the
  next opening from `/api/next-openings` at send time.
- **Law, briefly:** a marketing text needs prior express written consent under
  the TCPA, and Washington's CEMA (RCW 19.190) lets a recipient sue for $500 a
  message. A reply about the quote they asked for is the safest ground; a
  promotional nudge ("$50 off if you book today") is the riskiest. Keep any
  follow-up about *their* quote, not a new offer. STOP has to work (it does).

---

## 4. Pricing presentation (no price or offer changes)

All of these show the same numbers in a different order. None moves a price,
so none needs a `PRICE_BOOK` change. Each still needs Mikey's say-so because
he set how a quote reads ("Vehicle size and condition are priced into the
service line... Mikey's call").

1. **Anchor the Full Detail where the choice is made.** Step 2 already says
   "Save $79 vs. buying separately". On step 5 for an Interior-only or
   Exterior-only quote, a single quiet line under the breakdown:

   > A Full Detail on this car is $439 (inside and out, plus the Rain-Ready
   > extras free).

   Only the Interior+Exterior combo gets a swap card today (`qqFullSwap`). This
   would extend it to single-service quotes as an upgrade the customer can
   ignore. Risk: it reads as a push. Test it, don't assume.

2. **Show the size step, don't hide it.** The breakdown folds +$40/+$80 and
   condition into the service line ("Full Detail · SUV / Truck · Needs Work
   $439"). An SUV owner who saw "from $369" everywhere sees $439 and may think
   the price grew. Option: keep the single line (his call) but add the
   arithmetic in the grey sub-line: "SUV +$40 · Needs work +$30". Same total,
   no surprise.

3. **Add-on bundling.** Not now. Rain-Ready already bundles the three exterior
   extras free on a Full Detail; a paid bundle on top would confuse. Revisit in
   January when Rain-Ready ends (that's also when `RR_FREE` comes out).

4. **Don't show the $50 deal again by accident.** It ended Oct 26 and the code
   is dormant (`DEAL_OFF`, `DEAL_END`, the `data-deal` lines, `qqDeal`,
   `DEAL_ITEM`). `PRICING.md` and the comment both say to take it out after the
   end date. Do that in the same change as anything above, so the price screen
   has one less hidden branch.

---

## 5. Other things found on the way

- **Reviews rule: the "C Wilson" quote is spliced and given a town.** The QQC
  desktop panel shows "Mikey has done my car 4 times now and each time was
  amazing, quick, thorough, and a fabulous result. 10/10 would recommend!",
  credited "C Wilson, Snohomish WA". On `/reviews/` the review is by **C. W.**,
  names no town, and has a sentence in the middle ("I will be returning to him
  soon and plan on using his services far into the future.") that this version
  drops. Across the site there are four versions: 24 copies end "returning to
  him soon. 10/10" (cut mid-sentence), 2 drop the sentence, and 9 pages carry
  "C Wilson" (likely in JSON-LD). CLAUDE.md: never shorten one into words they
  didn't say, never add a town. Needs a site-wide pass, its own PR. Not done
  here.
- **"Same-day turnaround"** on the homepage Full Detail card means "finished the
  same day", but it sits a scroll away from a calendar whose rule is "never same
  day" booking. A customer can read it as "come today". Suggest "Done in one
  visit".
- **The Full Detail card says "bumper to bumper"**, which is close to the
  banned "bumper-to-bumper-perfection". Fine as plain description; noting it.

---

## 6. Ranked changes

Effort: S = under an hour, M = half a day, L = more. "Yes" = needs Mikey's yes
first. Measurement uses what's already wired: GA4 `qqc_step` / `qqc_quote` /
`qqc_submission` / `qqc_booking`, and the dashboard journey labels (`MDTrack`).
The baseline is the four weeks before the change; the main ratio is
**submissions + bookings ÷ `qqc_quote`** (people who saw a price and acted).

| # | Change | Expected effect | Effort | Mikey's yes? | How we'd measure it |
|---|---|---|---|---|---|
| 1 | Move the guarantee from the success screen to under the price (§1) | Medium. It's the strongest line on the site and it's currently missing at the one moment it's meant for | S | No (restores the documented rule) | Act-on-price ratio; step 5 → step 7 rate (`qqc_step` 7 ÷ `qqc_quote`) |
| 2 | Three facts under the button: just me, pay after, spigot and outlet (§1); same tick on step 8 instead of "Price held 30 days" (§2) | Medium on bookings that stick; fewer cancels from "I don't have an outlet" | S | No for the copy; **yes** on dropping "Price held 30 days" | Booking cancel rate in Bookings; act-on-price ratio |
| 3 | Remember the quote in the browser (§3A) | Medium. Catches the "I'll think about it" visitor who comes back | M | No (nothing is sent) | New `MDTrack('Came back to their quote')`; submissions from return visits |
| 4 | Full Detail Saturday-only explainer + "What day works?" box sent as `appointment` (§2) | Medium in Nov–Dec on the Rain-Ready product; the opener already uses the day | S | **Yes** (whether to offer weekday Full Details at all) | Step 7 → text-me rate for Full Detail; `appointment` filled rate in quote log |
| 5 | One-tap "Send it from my phone" text link inside the text-me path (§3B) | Medium. Removes typing for the not-ready crowd, no consent risk | S | No (customer starts the text) | New `MDTrack('Texted the quote from their phone')`; inbound threads whose first text is the prefilled body |
| 6 | Name optional on the text-me form (§3C) | Small to medium | S | No (worker already accepts it) | Form errors on name (`bad` class) and submission rate on that path |
| 7 | One-line "what's in it, how long" under the service in the breakdown, and collapse the Rain-Ready rows (§1) | Small to medium; answers "what am I paying for" | S | **Yes** on the Exterior wording (card vs schema disagree) and the exterior time | Act-on-price ratio; time on step 5 (journey) |
| 8 | "Your price" instead of "Your estimate" (§1) | Small, but it's a promise | S | **Yes** (does he ever change it on arrival?) | Act-on-price ratio |
| 9 | Success screen, text-me path in first person (§2) | Small (trust) | S | No | n/a, voice fix |
| 10 | Rain-Ready line in the step 8 summary (§2) | Small | S | No | Step 8 → booked rate |
| 11 | Dashboard: stop treating "Quote form, step 4" as a price reveal (§3) | No customer effect; makes Mikey's "saw a price and left" alerts and the Grow count honest | S | No (dashboard copy/logic, no texts) | Alerts with no price drop to zero |
| 12 | Show the size and condition arithmetic in the sub-line (§4.2) | Small; fewer "why isn't it $369" drop-offs for SUVs and vans | S | **Yes** (he set the one-line format) | Act-on-price ratio split by vehicle size (`qqc_quote` services/value) |
| 13 | Full Detail anchor line on single-service quotes (§4.1) | Unknown, could cut either way | S | **Yes** | Swap rate (`qqc_swap_full`-style event) and act-on-price ratio, A/B if traffic allows |
| 14 | Take the dead $50-deal code out (§4.4) | None for customers; less to break | S | No (PRICING.md already says to) | `check-site.py` passes |
| 15 | Fix the "C Wilson" quote everywhere (§5) | Compliance (FTC fake-review rule), not conversion | M | No (it's the documented rule) | `grep -r "C Wilson"` returns nothing |
| 16 | One real review under the button (§1) | Small; test only after 1–7 | S | No, if word for word | Act-on-price ratio before/after |
| 17 | Automatic follow-up text to text-me leads who went quiet (§3E) | Medium, but mostly already built (autopilot nudges) | S to switch on, M to build a new one | **Yes, stop-and-ask** (texts customers on its own; consent scope) | Replies and bookings from nudged threads in the follow-up board |

Items 1, 2, 5, 6, 9, 10 and 14 are copy and small script changes in one block of
`index.html` and could ship as one PR once the four reports are merged and Mikey
has picked. Item 3 is its own PR (new behaviour, worth a test drive on a phone).
Item 11 is a dashboard PR on its own live branch.

Traffic is small (a handful of quotes a week), so most of these won't reach
significance alone. Ship the no-yes items together, read the act-on-price ratio
over four weeks against the four before, and use the journey log for the "why".
