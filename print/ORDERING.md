# Ordering print: the order book

This is what lets Mikey say "order the door hangers" and have Claude do it:
open the printer's site, pick every option, upload the right files, and take
the order to the final checkout page. One section per product, with the exact
options, the files, and what to check before paying. Not served (`_config.yml`
excludes `print/`).

The product READMEs are the source of truth. This file is the short version
for the person (or Claude) at the checkout page. If the two disagree, the
README wins and this file gets fixed.

## Where an order can run

**Only on Mikey's own computer:** Claude in Chrome (the browser extension) or
the Claude desktop app. That's where his printer logins and saved card are.
A cloud session (Claude Code on the web) can't reach his browser and must
never be handed a login or a card to get around that.

## The money rules

1. **Claude never sees the card.** The card is saved on the printer account
   (Vistaprint, 55Printing) or in Chrome's autofill. Claude never types, reads
   out, stores or asks for a card number, a CVV or a password. If checkout
   wants the CVV again, Mikey types it.
2. **No address in this repo.** Ship-to is the address saved on the printer
   account. Addresses and card details don't go into git.
3. **Claude stops at the final page and asks.** It reports: printer, product,
   size, paper, quantity, files uploaded, ship-to town, arrival date, and the
   total with tax and shipping. It clicks Place Order only after Mikey says yes
   to that total in the chat. One yes covers one order.
4. **Stop if the total is more than 15% over the number below.** Say what
   changed (rush shipping got ticked, a paper upgrade, a price rise) instead
   of paying it.
5. **Small batch first** on anything that hasn't been printed before. A
   misprint on 50 costs a few dollars; on 2,500 it costs the run.
6. **Offer versions stop on December 31, 2026.** From January 1, 2027, order
   only the `-no-offer` hanger files, and the postcards need a rebuild
   without the Rain-Ready offer first (CLAUDE.md, "Offers and countdowns").
7. **After paying,** add a row to the order log at the bottom: date, what,
   quantity, total, order number, expected arrival. Nothing else.

## Getting the files onto the computer

The upload has to come from the computer doing the ordering. Keep the PDFs in
one folder there (a GitHub "Download ZIP" of this repo works; the files are
under `print/`), and re-download after any change to a design, because the
generators rewrite them.

---

## Door hangers: Vistaprint

Details: `door-hanger/README.md`, "Ordering it, step by step".

| | |
|---|---|
| Path | Marketing Materials → Door Hangers → **Large (4.5" x 11")** → Upload your design |
| Files | front `door-hanger/print-files/4.5x11-vistaprint/front.pdf`, back `.../back.pdf` (from Jan 1, 2027: `front-no-offer.pdf` / `back-no-offer.pdf`) |
| Paper | the thickest **matte** they offer (16 pt if listed, else 14) |
| Quantity | **50 first** (Vistaprint's minimum). After the 50 check out: about **2,500** |
| Shipping | standard, not rush |

**Before paying:** in the preview, the hole lands inside the red band and cuts
nothing but red. Front and back are the right way round.

**When the 50 arrive (Mikey):** scan both QR codes with two phones from about a
foot away, check the reds and blacks, check the hole. Then order the 2,500.

Another printer instead: **4.25" x 11"**, files from `4.25x11-standard/`. Stop
and ask if their hole is bigger than 1.75" or sits lower than 2.2" from the top.

## Shared EDDM postcard (with Trinity): 55Printing, then USPS

Details: `postcard-shared/README.md`, "Step by step".

**Don't start until** Louis has paid his half (~$549) and both brothers have
approved `postcard-shared/mockup-both-sides.jpg`. Ask Mikey if either isn't
confirmed.

| | |
|---|---|
| Path | EDDM Postcards → **8.5" x 11"** → **14 pt Gloss** → **Full Color Both Sides** |
| Files | front `postcard-shared/print-files/11x8.5/front-mikey.pdf`, back `.../back-trinity-mail-side.pdf` |
| If Louis set an offer | the `-with-offer.pdf` pair instead (same folder). Never the SAMPLE mockup's offer: only one Louis picked |
| If they picked the matched layout | `front-mikey-matched.pdf` + `back-trinity-mail-side-matched.pdf`. Always a pair from the same layout |
| Quantity | **2,500** |
| Turnaround / shipping | regular turnaround, ground |
| If asked about EDDM indicia | it's already in the file |

**Proof (both brothers approve it):** the indicia box is top right in the
white area, nothing is cut off, both QR codes scan from the proof on a phone.

**Then the postage, on eddm.usps.com** (signed in with Mikey's USPS.com
account): ZIP 98290, routes **R006** and **R028**, **Residential only**, size
**Flat**, and **two orders**, one per drop date. Same money rules. Print the
facing slips for each order.

## Solo EDDM postcard: 55Printing

Details: `postcard/README.md`, "Ordering at 55Printing" and "The $1,000
version". The shared card above mails the same two routes (R006, R028), so
**ask Mikey before ordering this one**; it isn't the default.

| | |
|---|---|
| Path | EDDM Postcards → **6.5" x 9"** → **14 pt Gloss** → **Full Color Both Sides** |
| Files | front `postcard/print-files/6.5x9/front.pdf`, back `.../back.pdf` |
| Quantity | **2,500** (~$247 + ~$60 shipping, their price file, 2026-09-27) |
| Turnaround / shipping | regular (3 to 5 business days), ground |

**Proof:** indicia box top right on the white area, nothing cut off at the edges.

## Yard signs: Yard Sign Plus

Details: `yard-signs/README.md`, sections 1 and 3.

| | |
|---|---|
| Printer | yardsignplus.com. Mikey's first order is 2608539798 (proof #1 on Aug 28 was the old design, 50 single-sided: needs a new proof) |
| Product | **18 x 24 in coroplast**, **yellow** sign: yellow stock with **2 imprint colours** (black, red) if the printer stocks it, otherwise white stock with **3 imprint colours** (yellow, black, red). Printed **both sides, same design**, with **H-stakes** (10 x 30 if offered) |
| File | `yard-signs/print-files/18x24/sign.pdf` (one page; it goes on both sides) |
| Quantity | **250** (Mikey, 2026-10-01). Then run two weekends, read Insights → Yard signs, before any bigger batch |
| Price guide | about $2 to $4 a sign with stake; 100 full colour with stakes listed at $395 at one printer. Yard Sign Plus prices by imprint colour (white is free, the first colour is included), so a printed yellow background is one more colour: compare the 2- and 3-colour totals in the cart |

**First order:** Claude prices the same spec at two or three sign printers up
to the final page (no payment), lists the totals, and Mikey picks. Then write
the winner and its menu path into this section so reorders skip the search.

**Before paying:** "same design both sides" (or "double sided, same artwork")
is selected, stakes are in the cart, the quantity is right, and the proof
shows MIKEY'S / MOBILE CAR / DETAILING in black on yellow and 425-600-7897 in
yellow on a black strip across the bottom (no red band), yellow and black
right to the edge with no white rim, with the number nowhere
near the edge. The sign has no QR on purpose.

**If yellow costs too much:** the third colour is the only extra. If it adds
more than about 50 cents a sign, stop and tell Mikey before switching anything:
the cheaper fallback is MIKEY'S in black (yellow and black, two colours), not
going back to white.

## Business cards (die-cut truck shape)

Details: `business-card/README.md`, "Ordering".

| | |
|---|---|
| Product | **Custom die-cut business cards**, 3.5 x 2 in, full color both sides, **your own die line** (not a preset shape) |
| Files | front `business-card/print-files/3.5x2/front.pdf`, back `.../back.pdf`, cut line `.../dieline.pdf` (or `dieline-front.svg` if they want vector) |
| Paper | **16 pt or thicker, matte or uncoated** (writable), not soft-touch or gloss |
| Quantity | **500** (Mikey, 2026-10-01) |
| Printer | **YardSignPlus** (Mikey, 2026-10-02): Business Cards → 3.5" x 2" → Step 4 shape **Custom** (500 showed $35.00 before paper and finish). They make the cut from the artwork and send a free proof, so attach `dieline.pdf` and `proof-front.png` / `proof-back.png` and say: cut to the magenta line, don't trace the art |

**Before paying:** the proof's cut follows the truck's roof and mirrors, the
back's red bump is at the **top right**, and no type sits near the cut. The die's
inside corners are 0.125 in; if the printer's minimum is bigger, stop and say so
(it's one number in the generator). When the sample arrives, Mikey scans the QR
with two or three phones, one of them old, in dim light.

## Gift cards (5 x 7, in an envelope): Vistaprint, or print at home

Details: `gift-card/README.md`, "Getting them made". The number and balance
of every card live in the dashboard (Work → Get Paid → Gift cards); these
cards have blanks, no printed number.

| | |
|---|---|
| Path | Stationery → **Note Cards** → **5" x 7" flat** → Upload your design |
| Files | front `gift-card/print-files/5x7/front.pdf`, back `.../back.pdf` |
| Paper | a **matte** stock (the back gets written on in pen); envelopes come with note cards |
| Quantity | **10 to 25** the first time (small batch first); more once one has been written on and handed over |
| No order needed | `gift-card/print-files/letter/two-up.pdf` on letter cardstock at Actual size, cut on the crop marks, A7 envelopes (5.25 x 7.25) |

**Before paying:** the size reads 5" x 7", the front is black to the edge, the
back's red border sits inside the trim line on the preview, and the envelope
count matches the card count.

## Flyers: not designed yet

There are no flyer files in this repo. They get designed first, the same way
as the others (a generator in `print/tools/` that checks the facts and the
voice), and then they get a section here.

---

## Order log

| Date | What | Qty | Printer | Total | Order # | Arrives |
|---|---|---|---|---|---|---|
