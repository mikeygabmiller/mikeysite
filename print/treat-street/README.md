# Treat Street booth (Sat Oct 24, 2026)

Macaroni KID's Treat Street at Evergreen Speedway, under the grandstands,
4 to 7 PM (setup from about 2). Toni Hill runs it; her number on the day is
206-852-2546. Booth: $37.50 returning-vendor rate; $40.99 went to Macaroni KID on Square Oct 14, which looks like that plus a fee. Not served
(`_config.yml` excludes `print/`).

Three pieces, all on plain letter paper so a home printer or a UPS Store can do
them the same day. Copy lives in `print/tools/build-treat-street.cjs`
(`npm run treat-signs`); never edit the PDFs. The handout card for the same night is `print/treat-street-card/` (`npm run treat`): same QR tag, same offer wording.

| File | What it's for | How many |
|---|---|---|
| `entry-slips.pdf` | the drawing slip, four to a sheet, cut on the dashed lines | 25 sheets = 100 slips is plenty; entries are one per household |
| `giveaway-sign.pdf` | "Win a free interior detail", on an easel at the parent end of the table | 1 (cardstock) |
| `quote-sign.pdf` | QR to the quote calculator, the price ranges, the Rain-Ready offer | 1 (cardstock) |

## The drawing is a LEGO set now (Mikey, 2026-10-23)

He dropped the free interior detail ("I don't think it'll be worth it") for a
LEGO set from Fred Meyer, and the slip per person for one sign-up sheet with
many lines. `print/tools/build-treat-street-lego.cjs` (`npm run treat-lego`)
writes `lego/entry-sheet.pdf` (black and white, 18 numbered lines, a
"Sheet #" blank, the text-me box per line) and `lego/lego-sign.pdf` (colour,
for the left wing under his Canva quote sign). Same terms as before: free, no
purchase, one line per household, a grown-up fills it in, drawn Monday Oct 26,
48 hours to reply or he draws again. No prize value, since the set isn't
bought. The Stage-It shelf strip now says "Win a LEGO set". `entry-slips.pdf`,
`giveaway-sign.pdf` and his Canva slips and giveaway sign are the old prize:
don't print them.

## The old drawing (Mikey's call, 2026-10-15, replaced above)

- **Prize:** one Interior Detail, any size and any condition (worth up to
  $389: $329 van plus $60 War Zone). Add-ons like pet hair and carpet shampoo
  aren't included, which is why the sign says "sticky cup holders" and not
  "dog hair". Done in the winner's driveway in one of the twelve towns, booked
  within 60 days.
- **Free to enter, no purchase.** That keeps it a promotional drawing, not a
  raffle; Washington leaves raffles to licensed nonprofits. Adults 18+, one
  entry per household.
- **Draw Monday, Oct 26** and text the winner that day.
- **Texting everyone else** is only for slips with the box ticked
  (Washington's Commercial Electronic Mail Act covers texts). One thank-you
  text with the Rain-Ready offer, nothing more without a reason.

## Things to know

- The QR goes to
  `https://mikeysdetailing.com/?utm_source=treatstreet&utm_medium=event#booking`,
  so the dashboard can tell a booth scan from a hanger or a card. The
  generator fails if it stops decoding.
- The quote sign is one more copy of the facts table (prices, 60 seconds, the
  phone, the twelve towns) and carries the Rain-Ready offer with the hanger's
  terms ("mention Treat Street" in place of "mention this hanger"). After
  Dec 31, 2026 the generator builds it without the offer; don't print the old
  PDF.
- The generator fails on an em dash, "we", Lynnwood or Edmonds, licensed or
  insured, a quote time other than 60 seconds, pet hair as part of the prize,
  anything that reads like a paid raffle, type under 7 pt, or anything within
  0.3 in of the paper's edge (where home printers can't reach).

## Tri-fold board (`trifold/`)

A standard 36 x 48 in tri-fold (24 in centre, two 12 in wings), raised on a
crate at the back of the table so it clears the kids' heads and reads from
30 ft. Left wing: the back-seat before/after. Centre: the logo, "I come to
you", a 5.0 / 40 Google reviews badge and the phone. Right wing (Mikey,
2026-10-22: reviews for trust, the offer not a whole side): four of his Google
reviews, word for word, with a small yellow Rain-Ready box under them. Copy
lives in `print/tools/build-treat-street-trifold.cjs` (`npm run
treat-trifold`); it refuses to build from Jan 1, 2027 and fails if the
freebies stop adding up to $508 or a review count other than 40 appears.

- **The reviews** are Matt Miller, Kathryn Miller, Diandra Preza and C Wilson (credited C. W., as `/reviews/` does),
  read off his Business Profile through Windsor on 2026-10-22 (all 40 are five
  stars). Names are shortened to a last initial. Never put a review on the
  board that isn't on Google: two on the site's `/reviews/` page don't match
  any of the 40 (James Bell's isn't there at all, and Pat Job's real review
  says something different), and neither does the "Matt K." quote. Ask Mikey
  where those came from before using them anywhere.

- **Easiest:** print `full-48x36.pdf` as one 36 x 48 poster, cut it at 12 in
  and 36 in (exactly where the colours change), and spray-glue each piece to
  its panel.
- **Or** print the three panel files (`left-12x36`, `center-24x36`,
  `right-12x36`) and glue one to each panel.
- **Cheapest, any printer:** `tiled-letter.pdf` is the board on 28 letter
  pages (7 columns x 4 rows, labelled A1 to D7, no page crosses a fold). Print
  at 100% ("actual size", not "fit"), trim each page on its corner marks,
  and glue them edge to edge, row A at the top. About $17 to $21 at a copy
  counter's color rate, or your own printer (the yellow and black panels use a
  lot of ink).
- **On a 22 x 28 poster board** (laid sideways): `poster-28x22.pdf` is the
  same design at 58% (48 x 36 is 4:3, 28 x 22 isn't, so there's a half inch
  of white top and bottom), and `tiled-28x22-letter.pdf` is it on 9
  landscape letter pages, A1 to C3. At that size the phone number is about
  1.3 in tall (readable to roughly 13 ft instead of 23) and the reviews are
  about 20 pt, so they're read at the table, not from the aisle.
- Prices checked 2026-10-19: a 36 x 48 paper poster runs roughly $45 to $90
  and usually isn't same-day at Staples or FedEx (3 to 10 days); one UPS
  Store lists $84 rolled, $144 on foam. A 24 x 36 is often same-day.
- Tell the shop "print at 100%, no resizing, no white border". The photos are
  900 px wide, so they're soft up close and fine from a few feet; the logo
  and type are sharp.

## The Stage-It board (`stageit/`), the one Mikey bought

A Royal Brites Stage-It display board (item 27146, 2026-10-22): white
corrugated tri-fold, 44 x 37 in open, a 22 in centre and two 11 in wings, a
pop-out arched header on top of the centre and a shelf across its bottom.
Copy lives in `print/tools/build-treat-street-stageit.cjs` (`npm run
treat-stageit`). Same facts and reviews as the tri-fold above. Its Rain-Ready
box follows Mikey's Canva quote sign (2026-10-22): ceramic wax $20, windshield
rain repellent $15, windshield anti-fog $15, all free with a Full Detail from
$369, and no "worth" total. The site's price book still says $10 and $30
(worth $508); ask Mikey which is right before printing either again.

- **Header:** the logo on black. **Centre:** "I come to you", the back-seat
  before/after, the 5.0 / 40 Google reviews badge, the phone; its bottom
  stays clear because the shelf sits across it. **Left wing:** four Google
  reviews. **Right wing:** "See your price in 60 seconds" with a big QR
  (`utm_source=treatstreet`) and the small Rain-Ready box. **Shelf edge:**
  "Win a LEGO set · enter at the table".
- **The header and shelf sizes are estimates** (Royal Brites doesn't publish
  them): header 22 x 6.5 in, shelf edge 22 x 3 in. Every piece prints 0.4 in
  oversize all round with nothing important near its edge, so it's glued on
  and trimmed to the board's own edge with a box cutter. If the real board is
  far off, measure it and change `PIECES`.
- **Print it:** `PRINT-ME-letter.pdf`, 42 plain letter pages for a normal
  printer, all portrait: page 1 is a map of where every page goes (H, L, C,
  R, S plus row-column), then the tiles with trim marks, then a QR patch for
  if the glued-up QR won't scan (it crosses a seam). Print at 100% / Actual
  size. About $25 to $32 at a copy counter's color rate.
- **Or at a print shop:** `poster-1-center-24x36.pdf` and
  `poster-2-wings-shelf-24x36.pdf` (24 x 36 is often same-day), plus the
  header from `pieces/` or the letter file's H pages.
