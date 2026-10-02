# Working on mikeysdetailing.com

This is a static site: hand-written HTML per page, no build step, no framework.
Every page carries its own `<head>`, its own JSON-LD, and its own copy of the
nav, footer, quote calculator and FAQ. That's the thing to keep in mind before
you change any sentence — **there is almost certainly more than one copy of it.**

## The facts. Don't restate them from memory, and don't let them drift

These numbers appear on 30+ pages and in JSON-LD that Google reads separately
from the visible text. A customer reads one page and holds Mikey to it, so two
pages disagreeing is a promise he can't keep on one of them.

| Fact | The answer | Notes |
|---|---|---|
| Exterior detail | **$199–$279** | $199 sedan / $239 SUV-pickup / $279 van-3-row |
| Interior detail | **$249–$329** | $249 / $289 / $329 |
| Full detail | **$369–$449** | $369 / $409 / $449 |
| Size step | **+$40 SUV or pickup, +$80 van or 3-row** | condition (+$30 / +$60) and add-ons ride on top, outside the ranges |
| Ceramic coating | **from $500** | tiered, quoted |
| Clean Club | **$125 a visit** | members' price is locked in; kept at $125 on 2026-09-27 |
| Paint correction | **from $400** | 1-Step $400+ / 2-Step $650+ / Multi-Stage $900+, quoted. One-step **6–8 hrs**, multi-stage **1–2 days** |
| Quote calculator takes | **60 seconds** | never 30, never 90 |
| Full detail takes | **3–5 hours** | never 3–4 |
| Basic interior takes | **about 90 minutes** | 2–4 hrs with extraction or pet hair |
| Cars detailed | **300+** | |
| Google rating | **5.0 across 41 reviews** | |
| Detailing since | **2021** | |
| Base / radius | **Snohomish, WA 98290**, ~25 miles | |
| Phone | **(425) 600-7897** | |
| When he works | **Mon–Fri one job at 1:00 PM; Sat 7:00 AM and 1:00 PM; never Sunday** | Mikey, 2026-09-29, while he's in school until noon. Copy says "weekday afternoons and Saturdays", not exact times, because it'll change. The real times live in the dashboard (Bookings → Settings → My start times) |
| Longest job times | **Exterior 2 hrs, Interior 3 hrs, Full Detail 4.5 hrs** | the booking calendar plans on these; not customer copy (customers get the ranges above) |
| Capacity | **no weekly number** | "12 cars a week" was retired 2026-09-29 (his real week holds about 7). Scarcity is the live "Next opening" line instead |
| Payment | after the work, never a deposit | |
| **Customer must provide** | **outdoor water spigot + power outlet** | no tank, no generator — do not write that he can bring his own |

Still **unconfirmed**, ask Mikey before writing it:

- **The schema's hours.** `openingHoursSpecification` on every page says open
  24 hours, 7 days. That's true for quotes and texts, not appointments, and it
  should match whatever his Google Business Profile says. Left alone on
  2026-09-29 until he checks his GBP hours; the terms page and `llms.txt` now
  say weekday afternoons and Saturdays.
- **Licensed and insured.** It appears nowhere on the site. It's a strong trust
  signal for a stranger in a driveway, but don't assert it until he confirms.

**Prices have their own file: `PRICING.md`.** It has the price book, what
old quotes and printed pieces are honored at, and the checklist for the next
change. `tools/check-site.py` holds the same book in `PRICE_BOOK` and fails on
any retired price, so a price change starts there.

**Changing one of these means changing it everywhere,** including the JSON-LD
`"text"` fields in FAQPage blocks and `llms.txt`. Grep the whole repo, don't
edit the page you're looking at.

## Voice

Mikey writes like a person who details cars, not like an agency describing one.
The test: could he say this out loud to someone in their driveway?

**This is the voice:**

> "I'd rather redo a car than have a review I have to explain."
> "No judgment at all — I've seen everything."
> "Stay in your PJs."
> "War Zone / Really rough"

**This is not, and it's the failure mode to watch for:**

> ~~"Three Steps. Zero Effort. One Jaw-Dropping Car."~~
> ~~"Open the Door and Grin"~~
> ~~"You run your hand down paint that feels like glass."~~

Rules that follow from that:

- **First person, always.** "I come to you", not "we come to you". It's one guy.
  Buttons say **"Get My Instant Quote"**, not "Get Your". Headings can stay
  second person — a heading describes what happens to the reader.
- **Don't narrate the customer's emotions.** Say what happens in the driveway.
  "We walk around it together and I fix anything you point at" beats "you'll be
  grinning ear to ear."
- **Concrete beats superlative.** "Sanding grit embeds in the lower panels over a
  winter" is worth more than "showroom shine."
- **No agency words:** seamless, elevate, unlock, transform, jaw-dropping,
  bumper-to-bumper-perfection. No "it's not just X, it's Y."
- **Never an em dash.** Not `&mdash;`, not the character, not in visible copy,
  meta tags, alt text, JSON-LD, code comments or JS strings. Mikey's call: a
  dash used as punctuation is the clearest tell that a machine wrote the
  sentence, and this site is one guy talking. Use what the sentence actually
  wants:

  | The dash was doing | Use instead |
  |---|---|
  | joining two whole sentences | a full stop. "Yes. I'm in Everett most weeks." |
  | an aside inside one sentence | a comma. "Bigger vehicles take more time, so I want your estimate accurate." |
  | introducing a list | a colon. "I bring the tools: extractor, polisher, product." (Never "water" or "power": the customer provides both.) |
  | a true parenthetical | brackets. "I run a real trade (300+ cars, 5.0 stars) on this system." |
  | separating a title | the pipe. "Mobile Car Detailing Snohomish, WA \| See Your Price Now" |

  `tools/check-site.py` fails the build on any em dash in a served file, so a
  new one cannot reach the site without someone deliberately deleting a check.
  En dashes in number ranges are fine and are left alone: `$369–$449`,
  `3–5 hours`. Those read as ranges, not as punctuation.

## Say the guarantee four times, not thirteen

"You don't pay until you love it" is the strongest thing on the site and it was
on the homepage 13 times, which reads as protesting too much. It belongs in
exactly four places, where a customer actually hesitates:

1. the hero
2. the price reveal inside the quote calculator
3. the Love It Guarantee section
4. the final CTA

Anywhere else, use the slot for a fact that appears nowhere else — same detailer
every time, exact price not a range, door jambs and glass included.

Same discipline for scarcity: **one** claim, and it's the live **"Next opening:
Thu, Oct 1 at 1:00 PM"** line (`data-next-opening`, filled by `site-stats.js`
from his real calendar). No fixed weekly number: "12 cars a week" was retired
on 2026-09-29 because his real week holds about 7, and 7 reads as part-time.
Not "limited spots" or "a few a week" either. Write the element's fallback text
so it stands on its own when the calendar can't be reached.

## Online booking

Back on 2026-09-29, rebuilt so it can't cost a lead. The quote calculator shows
the price, then **"Pick my time"** (steps 7 and 8: three next openings, then
name, phone, town, street) or **"Text me this quote instead"** (the old phone
form). If the calendar doesn't answer, the price screen is just the phone form,
exactly as before.

- **The calendar lives in the dashboard repo** (`twillowdashbored`,
  `bkSlotAvailability` in `src/index.js`), not here. The site asks
  `/api/next-openings` and books through `/api/book`, the same engine his
  Bookings screen, his texts and his Google Calendar feed into.
- **A time is only offered if the job finishes before dark** at his longest
  time (sunset is computed, so it follows the season). Weekday Full Details
  drop out after the clocks go back on Nov 1 until his work lights are ready;
  that's a checkbox in Bookings → Settings.
- **Never same day.** Tomorrow's times close at 9 PM tonight.
- **Instant confirm only in the twelve towns.** They get his confirm text and
  both reminders at once. Anywhere else is a request he confirms himself.
- **A street without a house number is allowed.** His alert tells him to ask.
- Anything on his Google Calendar blocks a time. That's his off switch.

## The service area

Base is **Snohomish, WA 98290** (`47.9129, -122.0982`). Mikey is in these twelve
towns most weeks — they're the pins on the homepage map and the `tier: 'yes'`
entries in the `TOWNS` list inside the `#service-area` section:

> Snohomish · Lake Stevens · Everett · Monroe · Mill Creek · Marysville ·
> Bothell · Duvall · Mukilteo · Woodinville · Granite Falls · Arlington

- **Lynnwood and Edmonds are NOT served.** They sit in the "ask me" tier on
  purpose. Don't add them to the served list, to `areaServed`, or to any "towns
  I serve" copy without Mikey saying so — he was asked directly and said no.
- "Ask me" towns are ones he sometimes reaches. Never promise them.
- **No travel fee anywhere in the area**, and the price is the same in every town.

Three places have to agree when the area changes: the `TOWNS` list, the
`areaServed` array in the homepage JSON-LD, and the map SVG. The map is
generated — run `python3 tools/service-area-map.py` and paste the result over
the `<svg class="sa-map">` block rather than nudging pin coordinates by hand.

## Offers and countdowns

**The live offer is the Rain-Ready Full Detail,** on the homepage since
2026-09-28 at Mikey's request. It's the door hanger's version: book a Full
Detail by **December 31, 2026** and exterior polish, ceramic wax and RainX come
free (worth $508, from $369). It's the **booking** date that counts: a job
booked by Dec 31 can be done as late as **January 31, 2027** (Mikey,
2026-09-29), because weekday Full Details don't fit before dark in November and
December and there aren't enough Saturdays to go round. It lives in three places in `index.html`, and
all three switch off on their own at midnight Pacific going into January 1:

1. the gold chip above the hero headline (`.mh-rr`)
2. the `#rain-ready` section after Before & After, with its value stack
3. the quote calculator: `RR_END` / `RR_FREE`, which put the three extras on
   any Full Detail at $0 and label them "(free, Rain-Ready)" in the text and
   email Mikey gets

The section's script holds its own copy of the end date. Change one, change
both. Don't widen it, extend the window or swap the extras without Mikey; it's
the same promise the hangers and postcards make. After January 1 take the
dormant code out rather than leaving it.

The old free-exterior Fri-Mon offer is parked whole in
`_disabled/free-exterior-offer.html`. Keep the rule it taught: **don't write
copy that implies a one-off deadline** for something that runs every week, the
second visit makes a real deadline look fake. Name the window instead.

## City pages

Eleven of them (every served town but Granite Falls), plus service pages nested under some cities. They share process
steps, FAQ answers, pricing and footers — that's correct and it's what keeps the
facts consistent. What must be **unique** per city is the intro prose and the
neighborhood sections.

The failure mode is mad-libs: taking Snohomish's paragraphs and swapping SR-9 for
US-2. Write from something only true of that city — Stevens Pass ski traffic and
sanding grit on US-2 through Monroe; salt film off Port Gardner and Boeing shift
schedules in Everett; HOA rules in Mill Creek; gravel roads in Duvall.

Keep city pages **900+ words**. Everett is the biggest market and was the
shortest page on the site.

**Granite Falls is written and parked** at `_disabled/granite-falls/index.html`
(2026-10-02), because the growth plan paces city pages at 1 to 2 a month and
Woodinville and Arlington went live that day. Put it up in November: move it
to `granite-falls/index.html`, set `p:'/granite-falls/'` on its `TOWNS` entry,
turn its homepage chip into a link, add it to the About list, the Lake Stevens
and Arlington footers, `sitemap.xml` and `llms.txt`, re-read it against the
facts table, then run `check-site.py`.

## SEO copy

- **Meta descriptions under 155 characters.** Google cuts past that. Front-load
  city, service and price so they survive the trim. Fifteen were over; the
  longest was 260.
- Titles follow `Mobile Detailing <City>, WA | Mikey's Mobile Detailing`.
- FAQ answers exist **twice** on most pages: once visible, once inside a
  JSON-LD `FAQPage` block. Edit both or the schema starts lying.

## The logo

Picked by Mikey on 2026-09-28: a red 4x4 with MIKEY'S across the grille and
soap foam at the tyres, over MIKEY'S (Racing Sans One, red, white outline) and
MOBILE DETAILING (Barlow Condensed) between red rules. No curved type.
Everything lives in `social/brand/logo-final/` with a README saying which file
goes where. The generators read `social/brand/logo.svg` (dark backgrounds),
`logo-light.svg` (cream or white, the hanger and postcard backs) and
`logo-icon.svg`; the site serves its copies from `/images/`. The truck is
built from the full-size Canva image in `logo-final/source/`: at 300 dpi the
side-by-side logo is sharp to ~12 in wide, the stacked one to ~5 in. Its
grille is still close to a real Bronco's: redraw it before a big print run.

## Instagram and Facebook posts

They live in `social/`, which is not served (`_config.yml` excludes it). Read
`social/PLAYBOOK.md` before making or changing a post: it has the weekly
rhythm, the caption shape, the photo privacy rules and the Rain-Ready offer.

- **Posts follow this file.** Same facts table, same voice, no em dashes. A
  post is one more copy of the facts, so a fact change lands there too:
  `social/tools/posts.cjs`, then re-render.
- **Edit copy in `social/tools/posts.cjs`**, never in `social/CAPTIONS.md`,
  which the renderer rewrites. `npm run render` in `social/tools`.
- **No readable plates, house numbers, faces or names** in any photo. New
  photos get blur boxes in `social/tools/prep-photos.cjs`; look at the output.
- **Give before you ask.** Most posts are tips, techniques, myths or Mikey's
  own stories, useful to someone who never books. At most one post in four
  asks for anything. Never invent a story; stories come from his answers.
- **Only the twelve served towns** on the map or in copy. The renderer strips
  the "ask me" tier from the map for that reason.
- **The Rain-Ready offer (B07) is a promise to customers.** Don't widen it,
  extend its window, or add a new offer without Mikey saying so.

## Fleet and dealership emails

Cold emails to businesses with vans, lots and fleets live in
`outreach/FLEET-EMAILS.md` (not served). They restate the facts table, so a
fact change lands there too. Same voice, no em dashes, only the twelve towns,
and nothing about being insured until Mikey confirms it.

## Door hangers

The print files live in `print/door-hanger/` (not served, `_config.yml`
excludes `print/`). Read its `README.md` before changing anything: it has the
ordering steps, the distribution rules and why each section is there.

- **A hanger is one more copy of the facts table.** Prices, 60 seconds, 300+,
  5.0 across 41, the phone, the twelve towns, spigot and outlet: a fact change
  lands there too. Edit `print/tools/build-door-hanger.cjs`, then
  `npm run hanger` (and `OFFER=0 npm run hanger`) in `print/tools`.
- **It prints the Rain-Ready offer** with its own terms: book a Full Detail by
  **December 31, 2026** and mention the hanger (no code word). Mikey set that
  window; don't widen it or extend it without him. Reprints after that date
  use the `-no-offer` version.
- **Where to hang them** is `print/door-hanger/ROUTES.md`, generated by
  `python3 print/tools/hanger-zones.py` (Census blocks and incomes, only the
  twelve towns' ZIPs). It also writes `zones.geojson`; copy that to the
  dashboard repo as `public/hanger-zones.json` so the Hangers map matches.
- The generator exits with an error if copy spills out of the safe area,
  picks up an em dash or a banned claim, or the QR code stops decoding. Look
  at the previews anyway.

## Yard signs

`print/yard-signs/` (not served) is the plan and the source of truth: read its
`README.md` before changing anything about signs. It covers what to print, the
honest cost math, where signs go, the crew link, pay, and lead tracking.

- **The spot list** is `print/yard-signs/spots.json`, made by
  `python3 print/tools/sign-spots.py` (FHWA HPMS traffic counts, OpenStreetMap
  lights and stop signs, Census households). Every pin is placed on grass
  checked against the NAIP infrared photo and Meta's canopy-height map, off
  roads, rails, bridges and cemeteries; an approach with no such spot is
  dropped. About 1 to 2 pins in 10 still sit against a shrub or small tree the
  data can't see; Mikey's **Check** tab in the crew app (Good / Bad on the
  satellite photo, best spots first) is how those get caught, and the app
  learns from those marks (plus the crew's field results) using the 17 ground
  measurements each pin carries (`fx`). Change that set only with a new
  `FX_VERSION` in `sign-spots.py`.
  **Look at the pins after every change:** `python3 print/tools/sign-spot-check.py`
  draws them on the aerial photo. Copy the list to the dashboard repo as
  `public/sign-spots.json` after every run, same as the hanger zones.
- **The crew app** lives in the dashboard repo (`public/signs.html`, routes
  `/api/crew/*` and `/api/signs` in `src/index.js`). Helpers join from a link
  Mikey makes in Insights → Yard signs.
- **A sign is one more copy of the facts table:** the phone number, first
  person if any line ever speaks. No prices and no offer on a sign: 1,000 printed signs
  can't follow a price change, and the Rain-Ready offer stays on the hangers and
  postcards.
- **The roadside sign has no QR and no website** (Mikey picked the design on
  2026-10-01, wording 2026-10-02: MIKEY'S small in red / MOBILE CAR /
  DETAILING / 425-600-7897, two inks, no red band and no slogan line).
  The room went to a 5 in phone number. If a QR ever goes on a sign, it is
  `https://mikeysdetailing.com/?utm_source=yardsign#booking`; the dashboard tags
  a quote or booking from that visit **sign** and credits it. Don't change the
  `utm_source` without changing the dashboard.
- **Only the twelve towns.** The Mill Creek Community Association's divisions
  are excluded as an HOA that pulls signs; don't add other HOAs to the script
  without Mikey or the crew's removal data saying so.

## Business card

`print/business-card/` (not served) holds the die-cut card: 3.5 x 2 in, cut
to the truck's outline so the roof and mirrors stick up out of the top edge.
Read its `README.md` first. Copy lives in `print/tools/build-business-card.cjs`
(`npm run card`), which also generates the cut line from the logo truck, so
never hand-edit `dieline*.svg`. Same rules as the sign: it's one more copy of
the facts table, and it carries **no prices, no offer and no review count**,
because a kept card outlives all three. Most cards go to strangers, so the
back is for reaching him: the phone, the twelve towns and a QR to the quote
calculator, nothing smaller than 7 pt (Mikey, 2026-10-01: not a glovebox cheat
sheet, and no "300+ cars" on the front). `RESEARCH.md` beside it has what
printers and the few real studies say goes on a card; read it before adding
anything to the back.

## Gift cards

Sold and tracked in the dashboard (Work → Get Paid → Gift cards, or Tools →
Sell a gift card in a conversation): each card gets a number like `ABCD-EFGH`
and a printable page at `/g/<token>` on the dashboard's domain. The printed
5 x 7 card is `print/gift-card/` (`npm run gift` in `print/tools`); it has
blanks for the number, never a printed one. Read its `README.md` first.

- **The terms are Washington law** (RCW 19.240.020): no expiration date, no
  fees, the unused value stays on the card, under $5 is cash on request. Never
  write "expires", "valid for", "non-refundable" or a fee on anything that
  sells a gift card.
- **A gift card is not an offer.** It's face value, no discount, so it doesn't
  need Mikey's yes the way a new offer does. A "buy $100, get $20" bonus would
  be an offer: ask him.
- **Not on the website yet.** Putting "gift cards available" on the site (a
  homepage line, a page, a FAQ) is Mikey's call; ask before adding it.

## EDDM postcard

`print/postcard/` (not served) holds the 6.5" x 9" Every Door Direct Mail
card, and its `README.md` has the printer, the routes, the drop dates and the
ROI math. Same rules as the hanger: it's one more copy of the facts table,
copy lives in `print/tools/build-postcard.cjs` (`npm run postcard`), and it
prints the Rain-Ready offer with the hanger's terms (book a Full Detail by
**December 31, 2026**, mention the postcard). Mikey approved the offer on the
postcard on 2026-09-27; don't reprint it after that date with the offer on.
The generator also fails if anything touches the white mail zone or the EDDM
indicia leaves the corner USPS allows.

## Ordering print

When Mikey says "order the hangers" (or signs, or postcards), read
`print/ORDERING.md` first: it has each product's printer, menu path, options,
files and pre-payment checks. Orders run only in his own browser (Claude in
Chrome or the desktop app), never from a cloud session.

- **Never handle the card.** It's saved on the printer account or in Chrome.
  Don't type, read out, store or ask for a card number, CVV or password, and
  never put an address or card detail in this repo.
- **Stop at the final page** with the total (tax and shipping in) and click
  Place Order only after he says yes to that total. One yes, one order.
- Small batch first on anything new, and log every order at the bottom of
  `ORDERING.md`.

## Shipping

**Mikey wants work merged and live in the same session, not left sitting in a
draft PR.** Unless he says otherwise, finish the job: open the PR, mark it ready,
merge it, and confirm the change is actually serving on mikeysdetailing.com
before reporting done. Don't stop at "pushed" and wait to be asked.

That only works if the checks below are genuinely run first — merging fast and
verifying nothing is how a wrong price or a town he doesn't serve ends up in
front of a customer. Fast is the default; careless isn't.

**Run `python3 tools/check-site.py` before you merge.** It's the gate: it parses
every JSON-LD block, checks that the `#business` node is identical on every page,
and follows every internal link. It's what catches the drift this repo is prone
to — one edit that landed on the page you were looking at and nowhere else. On
2026-09-10 it caught Duvall and Woodinville filed under the wrong county in
schema on 35 pages, which no amount of reading the visible copy would have
surfaced. It also fails on any em dash in a served file, per the Voice section.
It currently reports 2 pre-existing failures, both in `polish-test/`; anything
beyond those two is yours.

**Deploying is automatic.** GitHub Pages serves `main` (confirmed 2026-09-10:
a merge to `main` was live at `mikeysdetailing.com` within a couple of minutes,
no workflow file involved). `CNAME` holds the domain. To verify a deploy, poll
the live URL for something the change added rather than trusting the merge:

```sh
until curl -s https://mikeysdetailing.com/ | grep -q 'id="service-area"'; do sleep 15; done
```

If `main` has moved while you were working, merge it into your branch rather than
rebasing, and read what landed — copy edits on this site are often deliberate
(the guarantee-frequency rule below came from one), so resolve in favour of
keeping both intentions rather than taking your own side wholesale.

`sitemap.xml`, `robots.txt` and `llms.txt` are maintained by hand. A new page
means adding it to all three, and `llms.txt` restates the prices and durations,
so a fact change lands there too.
