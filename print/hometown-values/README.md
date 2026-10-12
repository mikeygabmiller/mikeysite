# Hometown Values magazine ad

A quarter-page ad for **Hometown Values Savings Magazine**, the coupon
magazine Jim Lee mails from Marysville (206-261-0752,
jim@myhometownvalues.com). Built 2026-10-12.

![the ad](preview.png)

## History: the 2024 ad

Mikey ran one quarter page with Jim in fall 2024: the **Monroe/Sky Valley**
edition, 15,000 homes, **$460** (invoice 6262FAB dated Sep 17, paid Sep 26,
2024), mailed **Oct 1 to 3, 2024**. He skipped the holiday issue Jim offered
next ($435 for 15,000 homes in Snohomish, $505 for 20,000 in Lake Stevens). That ad
had:

- **360-799-9312**, an old number, and that phone was down for a stretch
  around when the magazine landed (his email of Dec 5, 2024: "My phone just
  came back online")
- "MOBLIE AUTO DETAILING" in the headline
- "Low Prices", "Full detail from $99", "$20 off": a bargain pitch
- no photo of his work, no reviews, no towns, no website or QR

So whatever it pulled says little about the magazine. This ad is the fair
test.

## Files

| File | What it is |
|---|---|
| `print-files/ad.pdf` | The ad, 4.0625" x 4.75", vector type. Send this one |
| `print-files/ad-300dpi.jpg` | The same at 300 dpi, if Jim's designer wants an image |
| `preview.png` | For looking at |
| `preview-SAMPLE-offer-not-approved.png` | How a coupon box would look. **A sample, not an offer Mikey has made** |

**Size:** measured off the frame on the 2024 proof (4.06" x 4.75"). No
bleed, because a quarter page sits in a box on a shared page. **Jim confirms
the spec before art goes in**: change `W` and `H` in the generator if his
differs, then re-run.

The QR goes to `mikeysdetailing.com/?utm_source=hometownvalues&utm_medium=mail#booking`,
so magazine visits show up in Google Analytics as **hometownvalues / mail**.
It's 1 inch at error-correction level L because that's what passes the
generator's blurry-phone check at this size. Ask Jim not to shrink it.

## What's on it, and why

- **White, with one black band.** Version 1 was black like the site and Mikey
  didn't like it (2026-10-12). A coupon magazine is mostly busy ads on white
  paper, so a clean white box with a big red headline stands out, and white is
  what he picked for the call page. The thin black frame keeps it from melting
  into the page.
- **One big headline**, YOUR CAR, DETAILED / IN YOUR DRIVEWAY, in the logo's
  Barlow Condensed. It says what he does from across the room.
- **The back-seat before/after, shown whole.** Picked 2026-10-12 out of every
  photo in `social/photos/` and `images/`, at Mikey's ask for the highest
  converting one. There are five real before/after pairs. The back seat
  (crushed snacks, juice, stained leather) is the one every parent recognizes,
  and it's the website's lead photo. The RAV4 cargo (mud) is real cleaning but
  a trunk doesn't sell a detail. The MDX cargo reads as "emptied the trunk".
  The Focus exterior is 640 px with the after shot from a different angle.
  The steering wheel's fuzzy cover confuses the before. The photos are
  portrait, so they sit whole beside the prices: cropping them to a strip cut
  off the mess, and Mikey called that out.
- **The three "from" prices**, stacked beside the photo, Full Detail in red
  on top. A coupon magazine is read
  by people comparing prices, so the price is right there, and "from $369"
  filters out the $99 crowd the 2024 ad drew.
- **5.0, 39 reviews, 300+ cars** up top beside the logo, where trust gets read
  first.
- **The black band is the call to action**: the 1 in QR, "Call or text
  Mikey", the phone big, and the guarantee once.
- **The spigot and outlet line**, with the reason. Every piece of print says
  who provides water and power.
- **The twelve towns and "no travel fee"**, because the magazine goes to whole
  towns.
- **No offer.** Rain-Ready ends December 31, 2026 and this ad runs after it.
  A new offer is Mikey's call. A coupon box probably pulls better in a coupon
  magazine; if he picks one, `OFFER='$40 off|Any Full Detail. Mention
  Hometown Values when you book.' npm run htv` writes `ad-offer.pdf` (the
  photo gets shorter to make room). The amount and wording there are only
  the sample.

## The schedule

Every edition mails four times a year, in one of two cycles six weeks apart.
Jim's 2024 schedule (expect 2027 to land within a few days of it):

| Cycle | Editions (homes) | Spring | Summer | Fall | Winter |
|---|---|---|---|---|---|
| **A** | Lake Stevens (20,000), Snohomish (15,000), Mill Creek/Silver Lake (15,000), Marysville/Tulalip (30,000), plus Skagit, Pasco, Richland, Kennewick, Yakima | Feb 27 to 29, art 2/2 | May 21 to 23, art 4/26 | Aug 13 to 15, art 7/19 | Nov 19 to 21, art 10/25 |
| **B** | Monroe/Sky Valley (15,000), North Snohomish County (30,000: Smokey Point, Arlington, Lakewood, Stanwood, Camano), Bothell/Kenmore (15,000) | Apr 9 to 11, art 3/15 | Jul 1 to 3, art 6/7 | Oct 1 to 3, art 9/6 | Jan 16 to 18, art 12/27 |

Some editions cover towns he doesn't serve: Sky Valley (Sultan, Gold Bar,
Index), Stanwood and Camano, Kenmore. Those homes are paid for and can't book.

## The plan

**Lake Stevens, Spring A 2027** (mails about Feb 27, art due about Feb 2).
One issue, no contract, until it shows bookings.

- **Lake Stevens** is a served town end to end, the cheapest per home (Jim's
  2024 holiday price: $505 for 20,000, 2.5 cents), and gets no EDDM postcards.
  Monroe/Sky Valley cost 3.1 cents a home in 2024, and the Sky Valley part
  is outside the twelve towns.
- **Late February** because the days are long enough again: a weekday 1:00
  PM Full Detail finishes about 5:30 PM, before a late-February sunset
  (around 5:55 PM). The booking calendar decides from the real sunset.
  November through January, Full Details only fit the 7:00 AM Saturday slot.
- **Second choice:** Monroe/Sky Valley, Spring B (about Apr 9, art about Mar
  15). It's the same edition as 2024, so it's a straight rematch with a
  better ad.

**Count it:** "how'd you hear about me?" on every booking, plus
**hometownvalues / mail** in Google Analytics. Break-even is about one Full
Detail.

**Before sending the art:**

1. Jim's spec (size, bleed, PDF or JPG, CMYK).
2. The review count on Google. If it's moved past 39, change `REVIEWS` and
   re-run.
3. The prices against `PRICING.md`.
4. Ask Jim to take down anything of Mikey's old ad in the Hometown Values app
   or website (the 360 number, $99).

## Changing it

Copy lives in `print/tools/build-htv-ad.cjs`. Never edit the PDF.

```sh
cd print/tools
npm install
npm run htv
```

It fails if anything leaves the safe area, type drops under 6.5 pt, blocks
touch, the QR stops decoding (sharp, and at 95 dpi blurred), or the copy
picks up an em dash, "insured" or "licensed", a business "we", a work day,
Lynnwood, Edmonds or Kenmore, Rain-Ready, an old phone number, a quote time
other than 60 seconds, or loses a price, the spigot and outlet, or one of the
twelve towns. Every fact on the ad is one more copy of the table in the
repo's `CLAUDE.md`.
