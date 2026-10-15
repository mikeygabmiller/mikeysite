# Treat Street handout card (one event)

A plain 3.5 x 2 in card for **Treat Street, Saturday October 24, 2026, 4 to 7
PM, Evergreen Speedway in Monroe** (under the grandstands). Macaroni KID runs
it, 1,300+ tickets were reserved by October 14, and every booth gives out
candy and has a game. Mikey won't use these cards after that night, so it
leans into the event. Not served (`_config.yml` excludes `print/`).

![front and back](mockup.png)

## What's on it, and why

**Front:** the truck, the MIKEY'S wordmark, "Candy in the car seat? I get it
out.", the phone and the site, and "Thanks for stopping by my booth at Treat
Street" in pumpkin orange. Most people who take a card are parents with kids
carrying candy, and that's the mess they'll have in the car the next morning.
The thank-you line tells them where the card came from when they find it in a
pocket a week later.

**Back:** the **Rain-Ready Full Detail** (book by Dec 31: exterior polish,
ceramic wax and RainX free, worth $508, from $369), "Mention Treat Street when
you book", a QR to the quote calculator, the phone, and "Monroe, Snohomish,
Everett and 9 more towns".

- **The offer is the hangers' and postcards' offer, word for word.** It isn't
  new and it isn't wider. It's allowed here, unlike on the everyday card,
  because this card is only handed out on one night and the offer ends before
  the card stops mattering. The generator refuses to build from January 1,
  2027. "Mention Treat Street" works the way "mention this hanger" does, so
  Mikey knows where the job came from.
- **The QR** goes to
  `https://mikeysdetailing.com/?utm_source=treatstreet&utm_medium=event#booking`,
  so in Google Analytics it shows as **treatstreet / event**, separate from the
  hangers, postcards, signs and the everyday card.
- **No review count, licensed/insured, or towns he doesn't serve.** The
  generator fails on those, on any em dash, on any type under 7 pt, on type
  within 0.125 in of the trim, and if the QR stops decoding.

## Printing it

`print-files/front.pdf` and `print-files/back.pdf`. Each one is 3.75 x 2.25
in: 3.5 x 2 trim plus 0.125 in bleed. Tell the printer: "3.5 x 2 trim, bleed
is already in the file, print at 100%, don't resize." Full color on both
sides, 16 pt stock if they have it.

Check one printed card before they run the rest: scan the QR with your phone,
and look that nothing important is close to the cut edge.

Rebuild with `cd print/tools && npm install && npm run treat`.

## Ideas for the booth (not on the card)

- Hand a card to the **adult**, not into the candy bag. The adult books.
- The booth decorating contest is voted with tickets in a jar. The truck logo
  and a foam-bubble theme fit a detailing booth.
- 100 cards for 1,300+ tickets runs out fast if one goes in every bag.
  Hand them to adults who stop and talk.
