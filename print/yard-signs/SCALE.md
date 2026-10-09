# Scaling yard signs so Mikey only orders and hands off

Written 2026-10-09 at Mikey's request: "a game plan of how I massively scale
yard signs so the most work I have to do is ordering the signs and leaving them
for someone to pick up." Not served (`_config.yml` excludes `print/`).

This builds on `README.md` (the sign, the spot list, the crew app). Read that
first. This file is only about taking Mikey out of the loop: who does the work,
what has to be true before it's safe to scale, what the app still needs, and
what Mikey's week looks like at the end.

**The goal, in numbers:** Mikey spends **15 minutes a week** on signs. He
approves a reorder when the app says stock is low, puts the boxes in the
pickup bin (or doesn't touch them at all, phase 3), and pays the crew from one
screen on Monday. Everything else is the crew captain and the app.

---

## 1. Straight talk before the plan

Four things decide whether "massive" is a good idea. None of them is about the
sign.

### a. The ceiling is his calendar, not the signs

His real week holds about **7 jobs** (CLAUDE.md, capacity). The README's
planning number is **1 to 2 booked jobs per 100 signs** placed, which is a
guess until the first 250 report. At that rate:

| Signs placed a week | Cost a week (about $5 a sign all in) | Jobs a week it should bring |
|---|---|---|
| 100 | $500 | 1 to 2 |
| 250 | $1,250 | 2.5 to 5 |
| 500 | $2,500 | 5 to 10 |

So somewhere around **250 to 500 signs a week he's booked out.** Past that,
more signs don't make money: they make people wait, and a lead told "next
opening is in three weeks" books someone else. The plan below makes the app
**slow placements down on its own when his calendar is full** (section 4).
The way to grow past 7 jobs a week is the Clean Club (recurring visits fill
the calendar without new leads) or a second detailer, not more signs.

### b. The spot list runs out of good corners fast

About **730 spots score 50 or better**, and **320 of those are in Everett**
(`SPOTS.md`). After that the signs go on weaker corners for the same money.
Monroe has 3 spots over 50, Duvall 4, Arlington 8. "Massive" in his twelve
towns means **a few hundred good signs up at once, kept fresh**, not
thousands.

### c. Signs in the right of way may not be legal everywhere he's putting them

The README says "everything else is fair game". That's not verified, and at
scale it's the risk that can bite, because **every sign carries his phone
number**, so every fine finds him.

- **Everett** (the city's own guidance on temporary signs, under EMC
  19.36.060): a temporary sign in the right of way needs **the permission of
  the owner of the property next to it**, and none on shoulders, medians or
  roundabouts. That rules out most of the "grass strip at a light" spots in
  Everett unless the business or homeowner behind the strip says yes.
  [Everett's guidance](https://www.everettwa.gov/1716/Political-Sign-Guidelines)
  is written for election signs; confirm it applies the same way to his.
- **Lynnwood** has an ordinance banning signs in the right of way (he doesn't
  serve Lynnwood, but it shows the area's direction).
- The other ten towns and unincorporated Snohomish County: **not checked yet.**
  Other cities' bandit-sign fines run **$100 to $2,000 per sign**.

**Before the second order, check all twelve towns' sign codes** and add each
town's rule to the app (allowed / allowed with owner permission / banned). A
session can do the research; the yes/no on risk is Mikey's. Where a town
needs owner permission, permission yards (README section 2) become the plan
there instead of corners.

### d. Paid helpers are almost certainly employees under Washington law

Washington's L&I uses its own test, not the IRS's. A helper is exempt from
workers' comp only if they pass **all six parts**, including running their own
business, filing a business tax return, having a UBI number and keeping their
own books. A student or friend placing signs passes none of that. A 1099
doesn't change it ("a 1099 form has no bearing on Washington state workers'
compensation coverage", L&I).

That matters more than usual here: the job is **standing on road shoulders**,
and Mikey is **not insured** (facts table). If a helper is hit by a car and
there's no L&I coverage, that bill is his.

The three honest ways to do it, best first:

1. **Register with L&I as an employer** and report the crew's hours. Workers'
   comp in Washington is paid per hour worked, so a crew working a few hours
   a weekend costs little. Payroll for a few people can go through a cheap
   payroll service. Call L&I (360-902-4817) to get the risk class and rate.
2. **Hire a placement company that carries its own coverage.** Cleanest
   hands-off option if one exists locally. None found in the Everett area on
   2026-10-09 (SignTraker does real-estate posts in King County; ask them).
3. **Mikey places, family helps unpaid.** Doesn't scale; fine for phase 1.

Not an option: paying cash or Venmo per sign and calling it a contractor.

Taxes, for completeness: the federal 1099-NEC threshold is **$2,000** a year
per person for payments made in 2026 (it was $600). If people are on payroll
(option 1) that doesn't apply; payroll does.

---

## 2. The model: one captain, a small crew, a bin

Mikey shouldn't manage five helpers. He manages **one captain**, and the
captain manages the crew.

| Who | What they do | Paid (starting point, adjust after phase 1) |
|---|---|---|
| **Mikey** | Approves reorders, fills the bin, pays on Monday, says yes/no on anything that touches a customer or a city | |
| **Captain** (1 person, 18+, own car) | Picks up from the bin, splits bundles, runs routes, reviews the crew's photos, rejects bad ones, does the Monday re-check route, recruits the next helper | $1.50 a sign they place, $0.25 a check, plus **$0.50 for every sign the crew places** |
| **Helpers** (2 to 4, 18+, own car) | Pick up a bundle from the captain, run the app's routes Friday evening, Saturday | $1.50 a photo-verified sign, $0.25 a check |

Adults only: under-18 workers in Washington need a minor work permit
endorsement and have hour limits, and nobody under 18 should be on a road
shoulder for him.

**All in per sign: about $2 to $4 to print + about $2 to $2.50 to place and
check = $4 to $6.50,** in line with the README's $3 to $6.

**Who to make captain:** someone who already did phase 1 with him and was
reliable. Not a stranger from an ad. The captain holds his signs and his
reputation at every corner.

**The bin:** a lockable outdoor deck box or job box by his garage or porch
(a 100+ gallon box holds about 200 signs and stakes), with a combination
lock. The captain has the code. Mikey's whole hand-off is putting the
delivered boxes in it.

**Phase 3, no bin:** the printer ships straight to the captain. Mikey never
touches a sign. Only after the captain's counts have matched the app's for a
month (section 4, "who took how many").

---

## 3. The phases, each with a gate

Don't move to the next phase on a date. Move when the gate is met.

### Phase 0: decide before the 250 arrive (now)

The first order (250, Yard Sign Plus, order 2608539798) is waiting on a new
proof. Three decisions should land first, because two of them change what's
printed:

- [ ] **A tracking phone number on the signs? (recommended)** A separate
  Twilio number used only on signs, forwarding calls to his phone and texts
  into the dashboard. Every sign call and text is then counted automatically,
  instead of relying on "where did you see me?", which people forget and he
  forgets to ask. About $1 to $2 a month plus usage. **This has to be decided
  before printing**, because 1,000 printed signs can't change their number.
  It's real dashboard work (replies have to go out from that number too), and
  anything that texts customers is Mikey's call. If no, the signs keep
  425-600-7897 and leads are counted by asking.
- [ ] **The legal check** (1c) for at least the towns the first 250 go into.
- [ ] **How the crew is covered** (1d). Phase 1 can be Mikey plus an unpaid
  family member while the L&I registration is sorted.

### Phase 1: test with 250 (2 to 3 weekends)

What README section 5 already says: Mikey and one helper (the captain-to-be),
3 to 4 towns, photo proof on ("Needed to get paid"), sign cost and stock set
in Settings.

**Gate to phase 2:**
- At least **2 booked jobs per 100 signs** placed (cost per booked job about
  $250 or less at $5 a sign). Under 1 per 100: stop and fix the sign, the
  spots or the towns before spending more.
- Median sign life known (the app's re-checks).
- The helper ran at least one weekend without Mikey in the car.

### Phase 2: the captain runs it (500 signs, about 4 to 6 weeks)

- Captain plus 2 helpers. Mikey fills the bin and pays.
- The app's captain view (section 4) is live: photo review, low-stock alert,
  Monday summary.
- Reorders are 250 to 500 at a time, from the saved cart.

**Gate to phase 3:** four weekends in a row where **Mikey did nothing but
reorder, fill the bin and pay**, and cost per booked job stayed under the
phase 1 number.

### Phase 3: steady state (keep a few hundred good signs up)

- The printer ships to the captain.
- The app throttles placements against his calendar (section 4).
- Every quarter: read cost per booked job by town, drop the towns that don't
  pay, and rerun the spot list if anything changed.

---

## 4. What the app needs so Mikey can step out

The crew app (dashboard repo, `public/signs.html`, `/api/crew/*` and
`/api/signs` in `src/index.js`) already does the hard part: routes,
reservations, GPS-checked placement, photos, re-check routes, pay owed per
helper, a Paid button, total stock and signs left, leads and cost per lead.

What it doesn't have yet, in the order to build it:

1. **Who took how many from the bin.** Today stock is one number ("signs you
   have ordered in total") and "signs left" is ordered minus placed. Add a
   "took 25 from the bin" / "handed 25 to Sam" step, so each person carries a
   count and signs that went out but were never placed show up as missing.
   That's what makes it safe to hand the bin to someone.
2. **Low-stock text to Mikey.** When signs left (in the bin plus in hands)
   drops under about two weekends' worth, one text to him: how many are left,
   what the last order was, and the printer link. He approves the total; an
   order is placed only in his own browser (`print/ORDERING.md`).
3. **Captain role.** A crew member Mikey promotes who can review and reject
   photos and see everyone's counts, but **not** pay settings, money or
   anything outside signs. Same rule as the crew link today: no texts, no
   customers, no money.
4. **Monday summary text to Mikey.** One text: signs placed, still up, gone,
   leads, booked jobs, cost per booked job, stock left, and what he owes each
   person. That text is the whole management job.
5. **Pay day in one screen.** Each person adds their Venmo or PayPal handle
   when they join; the owed list gets a pay link per person with the amount
   filled in, and **Paid** after he sends it. (If the crew is on payroll,
   this becomes an hours-and-signs export for the payroll service instead.)
6. **Throttle on the calendar.** The app already shares the booking engine
   (`/api/next-openings`). When his next opening is more than about **10
   days** out, the crew's suggestion switches to re-checks only (keep what's
   up, don't add more), and switches back when the calendar opens up. That
   stops him paying for leads he can't serve.
7. **Town rules from the legal check.** A per-town setting (allowed / owner
   permission only / banned). Banned towns drop out of routes; permission
   towns show only permission-yard spots.
8. **The tracking number** (phase 0 decision), if he says yes.

Items 1 to 5 are what phase 2 needs. 6 and 7 before phase 3. Each one follows
the dashboard's own rules (its `CLAUDE.md` and `DEPLOY.md`: bump `BUILD`, run
every suite, merge into the live branch only).

**Quality control without Mikey looking at photos:** the app already checks
the phone was within about 60 m of the spot. On top of that, pay only on a
photo (Settings: "Needed to get paid"), have the captain review photos, and
have **re-checks done by someone other than the person who placed the sign**,
so nobody grades their own work. A placer whose signs keep showing "Gone" on
the first re-check gets fewer signs.

---

## 5. Mikey's week at the end

| When | What | Time |
|---|---|---|
| Monday morning | Read the summary text. Tap pay links. | 5 to 10 min |
| When the low-stock text comes (every few weeks) | Open the printer's saved cart, check the total, say yes | 5 min |
| When boxes arrive (phase 2) | Put them in the bin | 2 min |
| Phase 3 | Nothing physical: the printer ships to the captain | 0 |
| Once a quarter | Read cost per booked job by town, keep or drop towns | 15 min |

---

## 6. What could go wrong, and the fix

| Risk | Fix |
|---|---|
| A city fines him per sign | The legal check (1c) and town rules in the app (4.7). Pull signs the same day a city or homeowner asks. |
| A helper is hurt on a shoulder | L&I coverage (1d), the app's "Not safe to stop" skip, nothing on 50+ mph roads (README) |
| Signs vanish (taken and dumped, or fake photos) | Per-person counts (4.1), pay only on a photo within 60 m, re-checks by someone else |
| Neighbours call it litter in Facebook groups | One sign per corner, two per intersection max, straight and clean, and pull on request (README section 2). At scale this is the reputation risk, so the captain owns it. |
| More leads than he can book | Throttle on the calendar (4.6) |
| The captain quits | The captain recruits and trains the next helper as part of the job, so there's always one person who could step up. Phase 3 only with a backup. |
| Old signs with the wrong number or a retired claim | There's nothing on the sign that changes: no price, no offer, no review count (README section 3). Keep it that way. |

---

## Sources

- Everett, temporary signs in the right of way: [Political Sign Guidelines](https://www.everettwa.gov/1716/Political-Sign-Guidelines) (points to EMC 19.36.060)
- Lynnwood right-of-way sign ordinance: [Ordinance No. 1960](https://lynnwood.municipal.codes/enactments/Ord1960)
- Washington independent contractor test for workers' comp: [L&I, independent contractors](https://www.lni.wa.gov/insurance/insurance-requirements/independent-contractors/), [L&I F212-248-000](https://lni.wa.gov/forms-publications/F212-248-000.pdf)
- 1099 threshold rising to $2,000 for 2026 payments: [Patriot Software](https://www.patriotsoftware.com/blog/accounting/1099-reporting-threshold/) (check against the IRS 2026 instructions)
- Spot counts: `SPOTS.md` (generated 2026-10-01)
