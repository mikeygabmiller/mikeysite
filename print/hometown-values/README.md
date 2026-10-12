# Hometown Values magazine ad

A quarter-page ad for **Hometown Values Savings Magazine**, the coupon
magazine Jim Lee mails from Marysville (206-261-0752,
jim@myhometownvalues.com). Built 2026-10-12.

![the ad](preview.png)

## History: the 2024 ad

Mikey ran one quarter page with Jim in fall 2024 ($460 on Sep 26, 2024,
invoice 6262FAB; most likely the Snohomish edition, about 15,000 homes, at
$435 plus a $25 extra proof). He skipped the holiday issue Jim offered next
($435 for 15,000 homes in Snohomish, $505 for 20,000 in Lake Stevens). That ad
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

- **Your car, detailed right here in your driveway**, the logo, and the
  back-seat before/after: the same front as the postcard, because it's the
  photo that shows the work best.
- **The three "from" prices**, Full Detail in gold. A coupon magazine is read
  by people comparing prices, so the price is right there, and "from $369"
  filters out the $99 crowd the 2024 ad drew.
- **The guarantee once**, then 5.0 across 39 reviews, 300+ cars, no deposit.
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

## The plan

One issue, late February or March 2027, in the **Lake Stevens** or
**Monroe/Sky Valley** edition. Not Snohomish, where the EDDM postcards go,
so the two tests don't blur together. Not before then: weekday Full Details
don't fit before dark from November through January, so winter calls would
mostly land on the 7:00 AM Saturday slot. One issue, no contract, until it
shows bookings.

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
