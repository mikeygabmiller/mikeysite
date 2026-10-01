# Yard signs: the plan and the source of truth

Everything about putting out yard signs for Mikey's Mobile Detailing lives here:
what to print, where the signs go, who puts them out, how every sign gets
tracked, and what it should cost and bring in. Not served (`_config.yml`
excludes `print/`).

Three pieces work together:

| Piece | Where | What it does |
|---|---|---|
| **The spot list** | `spots.json` + `SPOTS.md` here, made by `print/tools/sign-spots.py` | Every intersection approach in the twelve towns worth a sign, ranked by real traffic counts |
| **The Sign Crew app** | dashboard repo, `public/signs.html` (link below) | What a helper opens: suggests where to go, builds the route, logs each sign with GPS and a photo |
| **Yard signs in the dashboard** | dashboard → Insights → Yard signs (opens the same app as Mikey) | Crew links, who put out what, what's still up, pay owed, leads from signs |

A sign is one more copy of the facts table in the repo's `CLAUDE.md`. The phone
number, "I come to you" and the twelve towns on it have to match everywhere else.

---

## 1. The honest math first

Signs are cheap to print and expensive to lose. Budget them like this:

| Line | Per sign | 1,000 signs |
|---|---|---|
| 18 x 24 in coroplast, printed both sides, with an H-stake | about $2 to $4 at quantity (100 full colour with stakes lists at $395 from one printer, so under $4 even at 100) | $2,000 to $4,000 |
| Paying a helper to place it (optional) | $1 to $2 (placement services charge around $2.15) | $1,000 to $2,000 |
| **All in** | **$3 to $6** | **$3,000 to $6,000** |

The average job is roughly $300. So **1,000 signs pay for themselves at about 10
to 20 booked jobs**, which is 1 to 2 jobs per 100 signs. Real-estate investors
(a more urgent product) report 1 to 8 calls per 100 bandit signs. A detail is a
lower-urgency buy, so plan on the low end and let the app's numbers tell you
the truth after the first two weekends.

What that means in practice:

- **Don't order 1,000 on day one.** Order 100 to 200, run two weekends, read
  the numbers in Insights → Yard signs (leads per 100 signs, how long signs
  survive, which towns answer), then order the big batch.
- **Signs are consumable.** Roadside signs get pulled. The app measures how
  long yours last. If the average is 10 days, 1,000 signs is about 10 to 12
  weeks of keeping 250 up at a time.
- **The part that lasts is the brand.** People who see "Mikey's" at the light
  every day are the ones who later search the name. Watch branded searches in
  Insights → Website, not only direct sign calls.

## 2. Push back: where the best signs actually go

Roadside corners get the traffic. Yards with permission get the time. Do both:

1. **Permission yards (lasts weeks to months).** Friends and family who live on
   a busy road, and customers right after a detail ("Mind if I leave a sign up
   for two weeks?"). Contractors trade $100 off for six months of sign; for a
   detail, a free add-on is plenty. A sign in a neighbour's yard is also an
   endorsement no roadside sign can buy. In the app these are **Yard, with
   permission** and get re-checked monthly, not weekly.
2. **Roadside corners (lasts days to weeks).** Lights and stop signs on busy
   roads, which the spot list ranks. This is where volume comes from.

The only places the app keeps signs out of on purpose:

- **HOA neighbourhoods known to pull them.** The Mill Creek Community
  Association's divisions are excluded (their outlines are in OpenStreetMap and
  match MCCA's own division list). Any spot the crew marks "HOA took it" or
  "told to remove it" twice drops out on its own, and Mikey can draw no-go
  circles in the app.
- **State highway frontage is allowed but scored down to 60%.** WSDOT
  maintenance crews pull every non-traffic sign on state highway right of way
  (SR 9, SR 204, SR 527, SR 524, SR 96, US 2 and the rest), so those signs die
  fastest. The cross street at the same light usually does better.
- **Nothing on a road posted 50 mph or faster, no ramps, no medians.** Nobody
  can read it at that speed, and nobody should be standing on that shoulder.
- **Private roads and gated streets.**

Everything else is fair game, as the plan asks. The app is deliberately
generous about *where* a sign may go and strict about *whether enough people
will see it*.

One more honest note: a sign carries the phone number, so every sign is
traceable to the business. Some neighbours treat roadside signs as litter and
say so in local Facebook groups. Keep them straight, clean, one per corner, and
pull any a homeowner asks about. That is the difference between "that detailing
guy is everywhere" and "that detailing guy is trashing our street".

## 3. The sign itself

Research on roadside reading (billboard and bandit-sign guidance): drivers get
3 to 5 seconds, read about 3 words a second, and **7 words or fewer** is the
limit. Letter height: about 1 inch per 30 feet of reading distance at best,
so a phone number you want read from 100 feet needs 3 to 4 inch characters.

**Spec**

- 18 x 24 in, landscape, 4 mm corrugated plastic (coroplast), **flutes
  vertical** so the H-stake slides in, **printed both sides** (the back faces
  cars leaving the intersection).
- H-stakes, 10 x 30 in or similar heavy wire. Push the sign down so its bottom
  sits about a foot off the grass.
- Colour: **two inks only**, the brand red (`#E31924`) and black on white, so
  it prices at a printer's 2-colour rate. High contrast is what matters; never
  mid-tones or photos.

**Copy (7 words and a number)**, picked by Mikey on 2026-10-01 ("C1" of the
options compared that day):

```
            MIKEY'S               (red, Racing Sans One, the logo's face: 1.9 in letters)
         CAR DETAILING            (black, Barlow Condensed: 2.9 in letters)
         I COME TO YOU            (white on a full-width red band: 2.6 in letters)
          425-600-7897            (black, Anton stretched tall: 5 in digits)
```

Why it's laid out that way:

- **What it is, big.** The first version only said "detailing" inside the logo,
  in letters under an inch tall, so a driver read "Mikey's... I come to
  you... number" and had to guess. "Car detailing" is now the second-biggest
  line.
- **The number is the biggest thing**, and the only thing a driver can act on.
  A tall, narrow number font (an idea taken off the printer's first proof)
  and dropping the brackets took the digits from 2.6 in to 5 in.
- **No QR and no website.** Drivers don't scan, and the strip they took up was
  most of the number's lost height. Sign leads get logged by asking (section 6).
- **No "call or text" line.** Mikey's call: people text a number on a sign
  anyway, and the line would cost about half an inch of digit height.

**The print file is ready:** `print-files/18x24/sign.pdf` (one page, 18 x 24 in
plus 0.125 in bleed, fonts embedded; order it "same design both sides").
`preview.png` and `mockup.png` are for looking at. Rebuild with `npm run sign`
in `print/tools`: the generator fails if the phone number drops under 2.3 in or
"car detailing" under 2 in, if the big copy passes 7 words, if a price, an
offer, "we", an em dash or an unserved town gets in, or if any ink other than
the red band reaches the 0.75 in margin.

- First person, per the voice rules. "I come to you" is the whole pitch.
- **No price and no offer on the sign.** Prices change and 1,000 printed
  signs can't. The Rain-Ready offer ends Dec 31, 2026 and stays on the hangers
  and postcards only (CLAUDE.md, "Offers and countdowns").
- If a QR ever goes on a sign (a small run for permission yards, where people
  walk past), it encodes `https://mikeysdetailing.com/?utm_source=yardsign#booking`.
  The dashboard already reads `utm_source` off every visit, so anyone who scans
  it and then sends a quote or books a time is tagged **sign** and credited to
  yard signs automatically. Print it at least 5 in square: a QR scans from
  about 10 times its own width.

## 4. Where exactly a sign goes

The app shows this at every stop. The rules behind it:

- **Right side of the road, as cars come up to the light or stop sign**, on the
  grass strip. At a light, about 100 ft before it, where the line of cars
  stops. At a stop sign, right next to it, where the car waits.
- **Facing the oncoming cars**, turned a little toward them.
- **One sign per corner, two per intersection at most**, on the two busiest
  approaches. Four of the same sign on one corner reads as litter.
- **Spread out.** Not every light on the same road: every second or third one.
  The route builder spaces stops at least 500 m apart for this reason.
- **Never** where it blocks a driver's view of cross traffic or a crosswalk,
  never on a median, never stapled to a pole (the PUD pulls them and staples
  hurt linemen), never on someone's mowed front lawn without asking.
- **Safety beats the spot.** Park legally with hazards on, never cross a busy
  road on foot to reach a corner, skip it ("Not safe to stop") and move on.

## 5. The crew: from Mikey alone to 1,000 signs

**The link.** Dashboard → Insights → Yard signs → *Crew link*. It looks like
`https://texting.mikeysdetailingsnohomish.workers.dev/signs.html#k=…`. Text it
to anyone willing to help. They type their first name once and they're in. They
see the map, the spots and the other helpers' signs, and nothing else: no texts,
no customers, no money. Mikey can turn a link off (everyone on it stops) or
turn one person off, from the same screen.

**What a helper does, start to finish:**

1. Opens the link, says how many signs they have with them.
2. Picks **Best near me**, **a town**, **the area on the map**, or taps the
   app's **Suggestion** (the best uncovered area right now, scored by spot
   quality, how long since anyone covered it, and how far away it is).
3. Gets a route: the best open spots in driving order, spaced out, with the
   drive time. Starting it reserves those spots for three hours so two helpers
   never double up.
4. Drives. **Navigate** opens Google or Apple Maps to the stop. When they pull
   up within about 60 m, the phone buzzes and shows the big **Sign placed**
   button.
5. Taps it. The GPS point is saved on the spot, the camera opens for one photo
   (step back about 20 ft so the sign and the corner are both in it), and the
   next stop comes up. Can't place it? **Skip** with a reason, which teaches the
   list.
6. Everything is saved on the phone first and uploads in batches, so a dead
   zone loses nothing.

**Checking and pickup.** The *My signs* and *Check* views route a helper past
signs nobody has looked at in a week: **Still up**, **Gone**, **Knocked over
(fixed it)** or **Picked up**. That is how the app learns which corners keep a
sign and which lose it in a day.

**Pay.** If Mikey sets a per-sign rate in the app's settings, each helper sees
what they've earned and Mikey sees what he owes. A sign counts once it has a
photo (if photo proof is on) and Mikey hasn't rejected it. Common rates for
placement services are around $1 to $2 per sign; for friends and family,
whatever Mikey decides. Mark people paid in the same screen.

**Scaling in phases:**

| Phase | Signs | Who | Goal |
|---|---|---|---|
| 1. Test | 100 to 200 | Mikey + 1 helper, 2 weekends | Real survival and lead numbers for 3 to 4 towns |
| 2. Cover the twelve towns | 300 to 500 | 3 to 5 helpers | ~25 signs per town at the best lights; permission yards on every busy-road friend |
| 3. Keep it up | 1,000 ordered | anyone with the link | Keep about 250 up at once; each weekend, re-check and refill what's gone |

Timing: put roadside signs out **Friday afternoon or evening** so they catch the
whole weekend, when people are home, errands are slow and detailing gets
booked. Recheck Monday.

## 6. Tracking: how leads get credited

| How | Automatic? | Counts as |
|---|---|---|
| Scanned a sign QR, then sent a quote or booked a time (the roadside sign has none; only a QR yard run would) | Yes (`utm_source=yardsign` on the visit, tagged at `/submit` and `/api/book`) | QR |
| A conversation tagged **sign** | Yes, once tagged | tagged |
| "Saw your sign" by text or call | One tap: **+ Add one** in the app's Results | said so |

With no QR on the roadside sign, asking is the count. Ask "where did you see
me?" on every new call or text and note the corner. A dedicated tracking phone number printed on the signs would make every
call automatic; it costs about $1 to $2 a month on Twilio plus usage, and needs
replies routed from that number too, so it is a later decision, not built yet.

## 7. How the spot list is made

`python3 print/tools/sign-spots.py` (needs `pip install shapely rasterio numpy scipy pillow`). Plain words
are in the script's header. In short: every intersection in the twelve towns
from OpenStreetMap; cars per day from the 2023 federal HPMS counts that WSDOT
files for every arterial and collector; how long drivers have to read (stopped
at a light counts fully, rolling through at 45 mph barely); the homes within a
mile that fit the customer (income, owners, two-car households, from the Census);
how long a sign survives there (state highway 60%, shopping-centre frontage
85%, MCCA left out); and distance from Snohomish. Score 100 is the best spot in
the area.

A corner where cars drive past without stopping only makes the list on a
counted road with 10,000+ cars a day. Below that the driver gets a second at
speed, and those spots were 70% of the first list and buried the lights and
stop signs. The list is about 3,400 spots at about 2,000 corners, which is
still three times what 1,000 signs can fill.

**Where the pin goes, and how it's checked.** The first list put every pin a
fixed distance back and a guessed distance sideways and never looked at the
ground; one of the best Snohomish spots landed on the deck of the Avenue D
bridge. Now each pin is placed on the ground itself:

- **Grass.** The 2023 NAIP aerial photo (USDA, 60 cm) has an infrared band:
  growing plants reflect it and pavement, roofs and water don't. The pin's
  3 m patch has to be green.
- **Not trees.** Meta's canopy-height map says how tall what's growing is:
  under 1 m at the pin, not a gap in the woods (at most a third of the ground
  within 5 m under trees) and not a road through the woods (under a third
  within 20 m).
- **Off roads, rails, bridges and cemeteries**, with nothing mapped between
  the pin and its road, so it's never across a side street or the tracks.
- **As close to the ideal spot as that allows:** just past the curb, where the
  cars in question are looking (the line of cars at a light, the waiting car
  at a stop sign). The app's directions give the real distance: "about 120 ft
  before the light, on the grass about 10 ft past the curb."

An approach with no such spot is dropped, not guessed.

**Look before you trust it.** `python3 print/tools/sign-spot-check.py` draws
the top pins per town on the aerial photo (`random 24` for a fair sample). Page through the sheets after every change
to the script.

**How good it is, measured.** Graded by eye against the photos on random
samples: roughly 8 to 9 pins in 10 are on clear grass beside the right road;
1 to 2 in 10 are against a shrub or small tree the canopy map is too coarse to see
(it's soft at a few metres). Washington DNR's lidar hillshades were tried to
catch those and didn't separate them reliably, so they aren't used. None of
the pins in the samples were on a bridge, pavement, water, a roof or a
parking lot.

**Mikey's Check tab closes the gap.** In the crew app's owner view, **Check**
shows the best open spots one at a time on the satellite photo with the pin and
the drivers' direction drawn. Good puts a spot ahead of unchecked ones; Bad
takes it off every map. Two or three seconds a pin: the best 300 corners take
about fifteen minutes, and that's the list the crew should work from first.

**It learns from the checking.** Every pin carries 17 ground measurements
(greenness, shade, texture, tree cover at 3 to 20 m, pavement nearby). The app
learns from Mikey's Good/Bad and from the crew in the field (a sign placed
there = good, "no good spot" = bad) which measurements mean a bad pin, shows
its guess on each card with its running score, and picks the next card to
teach it most. Once it has 30+ of his checks and gets 75%+ of them right on
ones it didn't learn from, it sinks the pins it doubts for the whole crew. It
never removes one; only his Bad does. Expect it to need about 150 to 300
checks to get good. If the measurement set in `sign-spots.py` changes, bump
`FX_VERSION`: his marks are kept (they're by spot id) and the app re-learns.

**What it still can't see:** those shrubs and small trees until someone checks, a ditch, a
fence line, a sight line blocked by something upstream, a lawn someone will
defend, or change since the 2023 photo. The map's **Satellite** button and each spot's **Street
View** button are the look before driving; the crew's skip reasons and
Mikey's "hide this corner" do the rest. The weights are judgment until real
signs are out: after the first two weekends, compare survival and sign leads
by town and adjust.

After running it, **copy `spots.json` to the dashboard repo as
`public/sign-spots.json`** so the app matches. The app also learns on top of the
list: fast removals, "HOA" and "no good spot" skips push a spot down or out.

## 8. Ordering checklist

- [ ] Print file: `print-files/18x24/sign.pdf`. 18 x 24, landscape, **both sides, same design**, 2 colours, 4 mm coroplast, vertical flutes.
- [ ] Order 100 to 200 first (250 is fine if the price break is real), H-stakes included, 10 x 30 if offered.
- [ ] Read the proof before approving: quantity, both sides, and the number is 425-600-7897.
- [ ] Dashboard → Insights → Yard signs → set sign cost, pay per sign (if any), photo proof.
- [ ] Make the crew link, text it to the first helper, do the first route together.
- [ ] After two weekends: read leads per 100 signs and median days up, then decide on the 1,000.

## Sources

- Placement and design practice: [FortuneBuilders](https://www.fortunebuilders.com/p/tips-to-make-your-next-bandit-sign-campaign-a-huge-success/),
  [Property M.O.B.](https://propertymob.com/blog/how-to-create-a-high-converting-bandit-sign/),
  [SimpleCrew on directing placers](https://www.simplecrew.com/how-to-give-directions-to-bandit-sign-placers/),
  [SimpleCrew app](https://www.simplecrew.com/sp-get-app/)
- Placer pay and results: [BiggerPockets, placer hiring](https://www.biggerpockets.com/forums/93/topics/478176-bandit-sign-placers-hiring-question),
  [window cleaning bandit signs](https://community.windowcleaner.com/t/bandit-signs/3046)
- Contractor yard signs and permission discounts: [Pipeline](https://pipelineon.com/blog/yard-sign-strategy/),
  [FieldPulse](https://www.fieldpulse.com/resources/blog/yard-sign-marketing-guide)
- Reading at speed: [FHWA conspicuity summary](https://www.fhwa.dot.gov/publications/research/safety/13044/006.cfm),
  [seven-word rule](https://trailheadmedia.com/how-many-words-should-a-billboard-have/);
  QR sizing: [QR code minimum size](https://www.qr-code-generator.com/blog/minimum-qr-code-size/)
- Pricing anchor: [Dirt Cheap Signs, 100 18x24 with stakes $395](https://www.dirtcheapsigns.com/Custom-395-full-color-yard-signs.php)
- WSDOT removes non-traffic signs from highway right of way: [WSDOT](https://wsdot.wa.gov/business-wsdot/highway-signs/political-signs-highways)
- Traffic counts: [FHWA HPMS](https://www.fhwa.dot.gov/policyinformation/hpms.cfm) (geo.dot.gov `HPMS_FULL_WA_2023`)
- MCCA divisions: [mcca.info](https://mcca.info/?page_id=14)
