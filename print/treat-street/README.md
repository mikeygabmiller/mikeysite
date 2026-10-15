# Treat Street booth (Sat Oct 24, 2026)

Macaroni KID's Treat Street at Evergreen Speedway, under the grandstands,
4 to 7 PM (setup from about 2). Toni Hill runs it; her number on the day is
206-852-2546. Booth paid Oct 14 ($37.50 returning-vendor rate). Not served
(`_config.yml` excludes `print/`).

Three pieces, all on plain letter paper so a home printer or a UPS Store can do
them the same day. Copy lives in `print/tools/build-treat-street.cjs`
(`npm run treat-street`); never edit the PDFs.

| File | What it's for | How many |
|---|---|---|
| `entry-slips.pdf` | the drawing slip, four to a sheet, cut on the dashed lines | 25 sheets = 100 slips is plenty; entries are one per household |
| `giveaway-sign.pdf` | "Win a free interior detail", on an easel at the parent end of the table | 1 (cardstock) |
| `quote-sign.pdf` | QR to the quote calculator, the price ranges, the Rain-Ready offer | 1 (cardstock) |

## The drawing (Mikey's call, 2026-10-15)

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
