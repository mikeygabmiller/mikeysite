# Shared EDDM postcard: Mikey's + Trinity Exterior Co. holiday lights

One 11" x 8.5" card mailed through USPS Every Door Direct Mail. **Mikey's
Mobile Detailing on one side, Louis's Christmas light installation (Trinity
Exterior Co.) on the other.** Postage and printing split 50/50. Final version
built 2026-10-01, redesigned 2026-10-02 to the postcard rules below.

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

## Two layouts to pick from (added 2026-10-02)

Mikey asked for a test where both sides share one design, so a reader who
flips the card finds everything in the same place.

| | **Split** (`mockup-both-sides.jpg`) | **Matched** (`mockup-both-sides-matched.jpg`) |
|---|---|---|
| Louis's side | the template | the same template, pixel for pixel |
| Mikey's side | its own layout: before/after on the left, offer box, guarantee in big handwriting | Louis's template in Mikey's colors: before/after across the top, big headline, gold Rain-Ready badge, $369 card, red QR panel |
| Top-right white box | postage on Louis's side only | postage on Louis's side, Angela's review in the same box on Mikey's |
| Mikey's photos | ~280 dpi | ~160 dpi (stretched wider), softer up close |

**Why matched is the pick:** both sides read in the same order: photo,
headline, price, proof, then the button. Mikey's side gets the same
treatment that made Louis's strong. The card also reads as one piece from two
brothers, not two ads glued together. The cost is softer back-seat photos:
the copies in `social/photos/` are 900 px web versions. The full-size
originals from Mikey's phone fix that; swap them in and re-run.

**Don't split-test it in the mail.** At about 3 bookings per 1,000 cards, two
versions across 1,151 homes would give each a handful of calls, and that's
noise, not an answer. Two print versions also cost more. Pick one by eye.

## Files

| File | What it is |
|---|---|
| `print-files/11x8.5/front-mikey.pdf` | Mikey's side. 11.25" x 8.75" (trim plus 1/8" bleed) |
| `print-files/11x8.5/back-trinity-mail-side.pdf` | Trinity's side, with the EDDM Retail indicia and "Local Postal Customer" |
| `front-mikey-matched.pdf`, `back-trinity-mail-side-matched.pdf` | The matched layout (`LAYOUT=matched npm run shared`). Upload this pair **or** the pair above, never one of each |
| `preview-*.jpg`, `mockup-both-sides*.jpg` | For looking at, not printing |
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

## The design rules it follows (researched 2026-10-02)

| Rule | Where it shows |
|---|---|
| **One picture carries each side.** People sort mail over the bin in about 3 seconds | Louis: his lit house, full width. Mikey: the before/after back seat |
| **Headline and image in the top half, 4 to 8 words** | "This year, skip the ladder." 50 pt. "Your car, detailed right here in your driveway." |
| **The call to action is the brightest block, bottom right**, where the eye ends | Yellow QR panel (Louis), red QR panel (Mikey) |
| **Simple offer with a deadline beats a clever one.** For lights, early-bird pricing with a book-by date is the standard lever | Mikey: Rain-Ready, book by Dec 31. Louis: the badge, once he picks one |
| **Price builds trust when it's all-in** | "$600 all-in starting price" with what's included under it |
| **Real local photos beat stock** | Louis's own install photo, not the AI-looking ones in his site history |
| **Proof next to the ask** | 5.0 stars and the guarantee sit beside each QR |
| **Mail twice.** A second touch in early November catches the deciders | Drop 2, Nov 2 |

Sources: [Lob postcard guide](https://www.lob.com/content/direct-mail-postcards-the-ultimate-guide),
[Modern Postcard design guide](https://www.modernpostcard.com/guide/creating-a-high-impact-campaign-through-direct-mail-design),
[Birdseye Post design principles](https://birdseyepost.com/blog/effective-direct-mail-postcard-design-principles),
[GoodMail EDDM for holiday lights](https://goodmail.ai/eddm/holiday-lights),
[USPS EDDM requirements](https://www.usps.com/business/every-door-direct-mail.htm) (indicia box, $0.26 Retail, bundles of 50 to 100).

## Before you order: Louis checks four things

1. **Review count.** 34 was checked 2026-09-24. If it's higher, change
   `TR_REVIEWS` and re-run.
2. **The photo is his job, and send the original.** It's the "project" photo
   he put on /lights. If it isn't his work, swap it; a mailed card can't show
   someone else's house as his. The copy on his site is only 1,575 px wide;
   full width on the card that's about 140 dpi, resampled to 300 so it prints
   smooth, but it's soft up close. **The original from his phone** (3,000+ px),
   dropped in as `assets/trinity-roofline.webp`, fixes that. Re-run after.
3. **Prices.** From $600, $5 to $8 / $7 to $10 a foot, as on his site.
4. **An offer. This is the biggest lever on his side.** Early-bird pricing
   with a book-by date is what works for lights, and "mention this postcard"
   is how he counts calls. `mockup-SAMPLE-offer-not-approved.jpg` shows the
   badge with "$100 off, book by Nov 15": **that's a sample, not his offer.**
   Both drops use the same cards, so the date has to outlast drop 2 (lands
   about Nov 4). Nov 15 gives the second drop ten days and still leaves him
   time to install before December. He picks the amount and date, then:
   `OFFER='$100 off|Book by Nov 15. Mention this postcard.' npm run shared`
   writes `*-with-offer.pdf` files; upload those instead.

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

Rechecked 2026-10-03 against 55Printing's own price data: $394.01 printing +
$104.51 ground, unchanged. No live coupon (their EDDM shipping code ran out
Aug 24). Rush (2 to 3 business days) is +$51.22. Postage is $0.26 EDDM Retail
(USPS). Elsewhere for the same card: ClubFlyers lists 2,500 at $383.99 before
shipping (shown only at checkout), BlockbusterPrint $780 (16 pt, free
shipping). Smaller sizes at 55Printing, 2,500 with shipping: 6x11 $351.58,
6.5x9 $307.69, but the layout is built for 11 x 8.5 and each business would
lose space. The checkout and the EDDM tool show the final numbers. About 200 cards are spare: hand them to customers for neighbors.
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

## Editing in Canva

**The editable copy:** "EDDM Postcard: Mikey's + Trinity (editable)" in
Mikey's Canva, made 2026-10-02 from `canva/postcard-matched.html`. Every word
is a live text box; the photos, QR codes and logo are images.

- **Mikey's side is in Poppins there, not Outfit.** Canva has no Outfit and a
  free plan can't upload fonts. The print PDFs in `print-files/` keep Outfit.
- **The page is 11.25" x 8.75"**, bleed included, same as the PDFs. Keep
  text 0.375" in from every edge. Nothing in Canva checks the safe area, the
  postage box corner or the facts; this generator does.
- **To print from Canva:** Share → Download → PDF Print, then upload that to
  55Printing exactly like the files above. Check the proof the same way.
- **To rebuild it** after a copy change here:
  `CANVA=1 LAYOUT=matched npm run shared`, commit, then import
  `https://raw.githack.com/mikeygabmiller/mikeysite/<commit>/print/postcard-shared/canva/postcard-matched.html`
  with Canva's import tool. Set `CANVA_BASE` to the raw URL of a commit that
  already has the images so a cached old image can't sneak in. A plain PDF
  import is broken in Canva: it drops the photos and doubles letter-spaced
  letters ("EXTERIIOR").

## Changing it

Copy lives in `print/tools/build-shared-postcard.cjs` (`npm run shared` in
`print/tools`, `LAYOUT=matched npm run shared` for the matched layout; Louis's
side is the same template in both). The generator fails if:

- anything leaves the safe area, runs into the bottom strip or the mail zone,
  or the indicia leaves the corner USPS allows;
- either QR stops decoding;
- Mikey's side drifts from the CLAUDE.md facts table (retired prices, "12 cars
  a week", 30/90 seconds, "insured", Lynnwood/Edmonds, business "we", missing
  spigot/outlet, and in the split layout any of the twelve towns);
- Trinity's side claims timers, a customer count or install dates, uses a
  phrase his CLAUDE.md bans, or loses one of his established facts;
- anything has an em dash.

The card prints the Rain-Ready offer: **don't reprint it after December 31,
2026.**
