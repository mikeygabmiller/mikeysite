# Shared EDDM postcard: Mikey's + Trinity Exterior Co. holiday lights

One 11" x 8.5" card mailed through USPS Every Door Direct Mail. **Mikey's
Mobile Detailing on one side, Louis's Christmas light installation (Trinity
Exterior Co.) on the other.** Postage and printing split 50/50. Final version
built 2026-10-01.

![both sides](mockup-both-sides.jpg)

## Why one full side each, not half and half

- **A card gets about three seconds at the mailbox.** One business per side is
  one clear message whichever way it lands. Two halves in two different looks
  read as a coupon pack, which is the mail people bin without reading.
- **Each brand keeps its own look.** Mikey's side is mikeysdetailing.com
  (black, red, gold). Louis's side is trinityexteriorco.com/lights (night blue,
  yellow CTA, his own roofline photo). They'd clash on one side.
- **Each side points at the other** with a one-line strip ("Flip it over"), so
  the brothers angle still lands and nobody misses the second business.
- **The trade:** Trinity's side carries the postage box. On an 11 x 8.5 card
  that's about 8% of the side, and his side needs less copy than Mikey's
  (a photo, four inclusions, a price, a QR). Carriers often deliver flats
  mail side up, so his side may be seen first. That's fair: lights have a
  hard season and a short window; detailing doesn't.

## Files

| File | What it is |
|---|---|
| `print-files/11x8.5/front-mikey.pdf` | Mikey's side. 11.25" x 8.75" (trim plus 1/8" bleed) |
| `print-files/11x8.5/back-trinity-mail-side.pdf` | Trinity's side, with the EDDM Retail indicia and "Local Postal Customer" |
| `preview-*.jpg`, `mockup-both-sides.jpg` | For looking at, not printing |
| `assets/trinity-roofline.webp` | Louis's photo, from trinityexteriorco.com/lights (he uploaded it 2026-09-23) |

QR codes (both decode out of the finished image, sharp and blurred, every run):

- Mikey: `mikeysdetailing.com/?utm_source=sharedcard&utm_medium=mail#booking`
- Louis: `trinityexteriorco.com/lights/?utm_source=sharedcard&utm_medium=mail`

## What's on each side, and where it came from

**Mikey:** the facts table in the repo's `CLAUDE.md`. Back-seat before/after,
"You don't pay until you love it", the Rain-Ready Full Detail (book by Dec 31,
2026, work can run to Jan 31, 2027; polish, ceramic wax and RainX free, worth
$508, from $369), the three prices, 5.0 across 41 reviews, 300+ cars, since
2021, spigot and outlet, the twelve towns. Nothing about being insured.

**Louis:** only what Trinity's own `CLAUDE.md` lists as established, plus the
lighting prices he approved on his site on 2026-09-26:

- Supplies commercial-grade LEDs, custom-cut, hung on clips (no nails or
  staples), mid-season repairs free, takedown and off-season storage included
- Owner-operated, Louis does the work; licensed, bonded and insured
- 5.0 on Google, **34 reviews of his cleaning work** (labelled that way, same as
  his /lights page, because none are lighting reviews)
- **From $600**: rooflines $5 to $8 a foot one story, $7 to $10 two stories
- One review, quoted word for word from his /lights page
- No timers (false), no customer count, no install dates (both unverified)

## Before you order: Louis checks four things

1. **Review count.** 34 was checked 2026-09-24. If it's higher, change
   `TR_REVIEWS` and re-run.
2. **The photo is his job.** It's the "project" photo he put on /lights. If
   it isn't his work, swap it; a mailed card can't show someone else's house
   as his.
3. **Prices.** From $600, $5 to $8 / $7 to $10 a foot, as on his site.
4. **An offer (optional, recommended).** Mikey's side has one; Louis's prints
   without one. A dated deal plus "mention this postcard" is what lets him
   count calls. Set `TR_OFFER` to one short line (for example a dollar amount
   off a roofline booked by a date he picks) and re-run. Don't invent one for
   him.

## The plan: 1,151 homes, mailed twice

Same two routes as Mikey's solo plan (`../postcard/README.md`): the
highest-income, biggest-household rural routes out of the Snohomish post
office. Single-family homes with driveways and rooflines, which is the
customer for both businesses.

| Route | Homes | Median income |
|---|---|---|
| 98290-R006 | 584 | $178k |
| 98290-R028 | 567 | $178k |
| **Total** | **1,151** | |

**Twice, two weeks apart.** People need to see a card more than once, and
lights have a short buying window, so the second drop can't land in December.

### Cost, split two ways

| | |
|---|---|
| Printing 2,500 cards, 11x8.5, 14 pt gloss, both sides (55Printing) | ~$394 + ~$105 shipping |
| Postage, 1,151 x 2 drops x ~$0.26 | ~$599 |
| **Total** | **~$1,098** |
| **Each pays** | **~$549** |

Prices are from 2026-09-27; the checkout and the EDDM tool show the real
numbers. About 200 cards are spare: hand them to customers for neighbors.
Never put one in a mailbox yourself (18 U.S.C. § 1725).

### Break-even

- **Mikey:** 2 full details (~$400 each).
- **Louis:** 1 roofline install. His minimum is $600.

Realistic case (3 bookings per 1,000 cards, from the solo plan): about 7 jobs
each from 2,302 cards. Nobody knows yet how a shared card does against a solo
one; each side gets the full card for half the cost.

## Step by step

**Tonight (Thu Oct 1)**
1. Both look at `mockup-both-sides.jpg`. Louis checks the four things above.
2. Louis Venmos Mikey his half (~$549) before anything is ordered. One person
   orders and pays USPS: Mikey.

**Fri Oct 2: order the print**
3. 55Printing → EDDM Postcards → **8.5" x 11"** → **14 pt Gloss** → **Full Color
   Both Sides** → **2,500** → regular turnaround → ground shipping to Mikey.
4. Upload `front-mikey.pdf` as the front and `back-trinity-mail-side.pdf` as
   the back. If asked about the indicia: it's already in the file.
5. **Check the proof before approving:** the indicia box is top right in the
   white area, nothing is cut off, both QR codes scan from the proof on a
   phone. Both brothers approve.

**While it prints (Oct 2 to ~Oct 14)**
6. On USPS's EDDM tool (eddm.usps.com, sign in with a USPS.com account): search
   ZIP 98290, select **R006** and **R028**, **Residential only**, mail piece size
   "Flat", and make **two orders**, one per drop date. Pay online. Print the
   **facing slips** for each order.
7. Have Louis put "Postcard?" as a question on his quote calls, and Mikey asks
   "How'd you hear about me?" on every booking. That plus the QR tags is the
   count.

**Drop 1: the first weekday after the cards arrive, no later than Mon Oct 19**
8. Count 584 for R006 and 567 for R028. Bundle in stacks of 50 to 100, all
   facing the same way, a rubber band each way, and a facing slip on top of
   each bundle (the route on it).
9. Take them to the **retail counter at the Snohomish post office** (the one
   that delivers 98290) with the receipt. Homes get them in 1 to 3 days.

**Drop 2: two weeks later, no later than Mon Nov 2.** Same homes, same
bundles. Keep the second half of the cards in the box until then.

**Around Dec 1: count.** Each shares "mentioned the postcard" plus QR scans
(`utm_source=sharedcard`). Mikey: 7 or more full details, scale to the
seven-route plan in `../postcard/README.md`. Louis: the lighting season is
over by then, so his decision is about next year's October drop. Each honors
only his own offer; neither promises anything for the other.

## Changing it

Copy lives in `print/tools/build-shared-postcard.cjs` (`npm run shared` in
`print/tools`). The generator fails if:

- anything leaves the safe area, runs into the bottom strip or the mail zone,
  or the indicia leaves the corner USPS allows;
- either QR stops decoding;
- Mikey's side drifts from the CLAUDE.md facts table (retired prices, "12 cars
  a week", 30/90 seconds, "insured", Lynnwood/Edmonds, business "we", missing
  spigot/outlet, any of the twelve towns);
- Trinity's side claims timers, a customer count or install dates, uses a
  phrase his CLAUDE.md bans, or loses one of his established facts;
- anything has an em dash.

The card prints the Rain-Ready offer: **don't reprint it after December 31,
2026.**
