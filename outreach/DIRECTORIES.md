# Directory listings kit (SG6)

Everything you need to put **byte-identical** listings on the 15 directories in
GROWTH-PLAN.md SG6, in one sitting, in your own browser. Nothing here has been
submitted and no accounts were made. Researched 2026-10-05.

Why it matters: Apple Maps, Siri, Alexa, Bing, Copilot and ChatGPT don't only
read your website. They read these directories, compare what each one says
about you, and trust a business less when the answers disagree. Right now they
disagree (see "What's out there now"). Same name, same phone, same website,
same towns, everywhere, character for character.

This folder is not served on mikeysdetailing.com (`_config.yml` excludes
`outreach/`). **But the GitHub repo is public**, so anyone can read this file
on github.com. That's why it never writes your street address, your personal
email or any login. Keep it that way: no passwords, no card numbers, no home
address in this file, ever.

It's one more copy of the facts table in `CLAUDE.md`. A price or fact change
lands here too, and `tools/check-site.py` scans it for retired prices.

---

## Do these 5 this week

About 2 hours total. In this order, because each one makes the next easier.

0. **Before anything (10 min): answer two questions for yourself.**
   - **(425) 232-1355 is your old number** (you confirmed it on 2026-10-05).
     Yelp shows it as your phone and Yahoo copies it from Yelp, so it has to
     come off both. Only (425) 600-7897 goes on any listing. Yelp verifies by
     calling the number on the page, so if you can't answer 232-1355 any
     more, ask Yelp support to change it to 600-7897 before you verify.
   - **Does your Google Business Profile match the canonical block below?**
     Open it and check name, phone, website, the twelve towns and that the
     address is hidden. Bing copies it in step 2, so fix GBP first or you copy
     the mistake.
1. **Yelp: fix the page that already exists** (30 min). It shows the wrong
   phone, a street address, old prices, Sultan (not served) and the wrong
   start year. It also feeds Apple Maps, Alexa, Bing and Yahoo, so it's the
   single most copied page about you. Details below.
2. **Bing Places: import from Google** (10 min). One click pulls your GBP in
   and usually verifies on the spot. Bing feeds Copilot and part of ChatGPT's
   web search.
3. **Apple Business Connect** (30 min, then wait up to 5 business days for
   verification). Apple Maps and Siri on every iPhone. Set it up as a service
   area, no address shown.
4. **Nextdoor: claim the page that already exists** (15 min). It's unclaimed,
   the name has "- Snohomish" stuck on the end, and it lists a Gmail address.
5. **Facebook: make the page** (20 min). There isn't one. Meta's AI and
   Facebook search can't name a business that has no page.

The other ten can wait for a second sitting. Ranked list further down.

---

## The canonical block (copy from here, never from memory)

Taken from the `#business` JSON-LD node on `index.html` on 2026-10-05.

| Field | Exactly this | Notes |
|---|---|---|
| Business name | `Mikey's Mobile Detailing` | Straight apostrophe ( ' ), not a curly one. Nothing after it: not "- Snohomish", not "LLC", not "Car Detailing". Adding words to the name breaks the match and most directories ban it anyway. |
| Phone | `(425) 600-7897` | If a form wants one string with no punctuation: `4256007897`. International: `+1 425-600-7897`. Same digits always. |
| Website | `https://mikeysdetailing.com/` | No `www`, no tracking tags, no blog link here. |
| Email | `book@mikeysdetailing.com` | Not the Gmail. |
| City / ZIP | `Snohomish, WA 98290` | |
| Street address | **Hidden. Never shown.** | You go to the customer, so no directory should show a street. Where a site demands one to verify, use the same address your Google Business Profile has on file and switch on "hide address" / "I serve customers at their locations". If it can't be hidden, skip the address field or skip the directory. Never invent one. |
| Service area | `Snohomish, Lake Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite Falls, Arlington` | Those twelve, in that order, and only those. **Not Lynnwood, not Edmonds, not Sultan.** If a site wants ZIPs or a radius instead, use about 25 miles around 98290 and then untick anything outside the twelve. |
| Hours | `[match your Google Business Profile]` | Not decided yet (see CLAUDE.md "unconfirmed"). Whatever GBP says, every directory says. Don't type "24 hours" on one and "Sat 7-5" on another. |
| Payment | Cash, credit card, debit card | Tick those three only. Not PayPal, not checks, not "pay later financing". |
| When you pay | After the work, never a deposit. | |
| Started | 2021 | Not 2020, not 2022. |
| Logo | `https://mikeysdetailing.com/images/logo-square.png` | Download it once and upload the same file everywhere. |
| Cover photo | `https://mikeysdetailing.com/images/og-image.jpg` | |
| Google review link (for "other profiles" fields) | `https://g.page/r/CRCuKQ982VIZEBE` | |

**Leave off every listing:** your hours if they don't match GBP, "licensed" or
"insured" (not confirmed), the Clean Club (sold only on the call page), the
Rain-Ready offer (a listing outlives Dec 31), gift cards, any review count
(it goes stale), and anything that says you bring water or power: the customer
provides an outdoor spigot and an outlet.

**Photos:** before/afters and you working. No readable plates, house numbers
or faces, same rule as `social/PLAYBOOK.md`. Reuse the blurred ones from
`social/`.

---

## What's out there now

Searched the web on 2026-10-05 for the name and for both phone numbers. Yelp
blocks automated readers, so its details come from search engine snippets of
the page; look at it yourself while you fix it.

| Where | URL | What it shows | What's wrong |
|---|---|---|---|
| **Yelp** | https://www.yelp.com/biz/mikeys-mobile-detailing-snohomish-4 | "Mikey's Mobile Detailing", Auto Detailing, 96 photos, open 24 hours | **Phone (425) 232-1355** (the main search snippets show it; some show 600-7897 too). **A full street address on Spada Rd is public.** Old starting prices in the "from the business" text (full from 260, interior from 160, exterior from 130). Service area lists **Sultan** and only five towns. Says "established 2020" and "started in 2022" (it's 2021). Slogan "Quality Detailing at an Affordable Price" is fine but off-voice. The **"-4"** in the URL means Yelp already had three pages with that name: open `...-snohomish`, `...-snohomish-2` and `...-snohomish-3`; if any is yours, use Yelp's "report a duplicate" to merge it into -4. |
| **Yahoo Local** | https://local.yahoo.com/info-236167338-mikey-s-mobile-detailing-snohomish/ | Name right, phone **(425) 232-1355**, the Spada Rd street address, 24 hours | Copied from Yelp. You can't edit it directly: fix Yelp and Yahoo follows. |
| **Nextdoor** | https://nextdoor.com/pages/mikeys-mobile-detailing-snohomish-snohomish-wa/ | "Mikey's Mobile Detailing- Snohomish", (425) 600-7897, website right, "Snohomish County", Auto detailer, a 2025 pricing poll | **Unclaimed.** Name has "- Snohomish" on the end. Shows your Gmail instead of book@. Description mentions "polishing" but no towns. |
| **detailerdirectory.com** (not on the 15, but it's out there) | https://www.detailerdirectory.com/united-states/snohomish/detailer/mikey-s-mobile-detailing-snohomish | "Mikey's Mobile Detailing - Snohomish", 425-600-7897, the Spada Rd street address | Name with "- Snohomish". **Street address public.** Says you do **window tinting, leather repair, engine bays and headlight restoration** and take **PayPal, checks and "pay later"**. Wrong services are worse than a missing listing: claim it or ask them to correct it after the top 5. |
| Facebook | none found | | Only other people's "Mike's Mobile Detailing" pages come up. Make one. |
| Apple Maps, Bing, Angi, Thumbtack, BBB, Alignable, Yellow Pages, Manta, Hotfrog, chamberofcommerce.com, Waze, Foursquare | none found by web search | | Most of these don't let search engines index every page, so "not found" isn't proof. Every one below starts with "search for yourself first and claim, don't create a duplicate." |

Where the street address came from: Yelp has it, and Yahoo and
detailerdirectory both copied it. Hiding it on Yelp is the root fix. If it's
your home, that matters for more than SEO.

---

## The ranked list

Ranked by how much each one is read by maps, voice assistants and AI engines,
not by how many people browse it. Costs and verification were looked up on
2026-10-05; sites change these often, so trust what the form shows you.

| # | Directory | What reads it | Cost | How it verifies | Do |
|---|---|---|---|---|---|
| 1 | **Yelp** | Apple Maps (reviews, photos), Alexa, Bing, Yahoo; Yelp licenses its data to OpenAI | Free. Ads are optional and not worth it for you | Phone call with a PIN to the number on the page | **Fix now** |
| 2 | **Bing Places** | Bing, Copilot, part of ChatGPT's web search | Free | Import from Google Business Profile usually verifies instantly | **Now** |
| 3 | **Apple Business Connect** | Apple Maps, Siri, Spotlight, Safari | Free | Phone call or document upload (business license works); up to 5 business days | **Now** |
| 4 | **Nextdoor** | Neighbors asking "who do you use", and AI engines that read those threads | Free page. Local Deals (from a few dollars) and Neighborhood Sponsorships (roughly $30 to $150 a month a ZIP) are optional | Claim the existing page; Nextdoor may ask for a business document | **Now** |
| 5 | **Facebook** | Facebook search, Meta AI, and a page that AI engines cite | Free. Boosts optional | None for a page; you need a personal profile to own it | **Now** |
| 6 | **Foursquare** | Foursquare's place data is licensed to a lot of apps; several SEO studies say it supplies most of ChatGPT's map results (not confirmed by OpenAI) | Free claim | Phone call with a code (postcard or small card charge are the backups) | Second sitting |
| 7 | **BBB** | Searched by people checking you out; AI engines quote BBB ratings | Free profile. Accreditation is a separate yearly fee, at least about $500 for a business your size | They contact you; accreditation has its own checks | Second sitting, **free profile only** |
| 8 | **Yellow Pages (yp.com)** | Old-school data resellers, and searches still turn it up | Free basic listing at adsolutions.yp.com/listings/basic. Thryv will call to sell ads; say no | Automated phone call to the listed number | Second sitting |
| 9 | **Waze** | Waze drivers; Waze also reads Google Maps | Free listing; branded pins are paid ads | Through the Waze ads portal (advertise.waze.com, "get started for free") | Second sitting, **only if it can hide the address** |
| 10 | **Manta** | Small-business data resellers | Free listing. Paid plans run about $37 to $49 a month; skip | "Verify Now" on the listing | Second sitting |
| 11 | **Hotfrog** | Minor citation | Free | Email | Second sitting |
| 12 | **Alignable** | Other local business owners (referrals, dealership and fleet intros) | Free guest account. Paid plans $29 to $89 a month; skip | Email | Second sitting. Useful for FLEET-EMAILS.md contacts |
| 13 | **Chamber of Commerce** | See note | chamberofcommerce.com: free listing, heavy upsells. Real Snohomish Chamber: about **$210 a year** for 4 or fewer employees | Claim button / membership form | See note |
| 14 | **Angi** | Mostly sells leads | See the honest math below | Phone and background check if you buy leads | **Free profile only, or skip** |
| 15 | **Thumbtack** | Mostly sells leads | See the honest math below | Phone, background check before you can get leads | **Free profile, budget off** |

**Chamber of Commerce, two different things.** `chamberofcommerce.com` is a
private directory company with no tie to any real chamber; it's on the list
because it's a citation, so claim the free listing and ignore every upsell
(their "Review Defender" pitch included). The **Snohomish Chamber of Commerce**
(snohomishchamber.org, 360-568-2526) is the real one: about $210 a year at your
size, a member listing on a local site (a real backlink, which the free
directories aren't) and a room full of business owners with vehicles. Worth it
when you start sending the fleet emails, not before.

### Angi and Thumbtack: the honest math

Both sell you the chance to quote a customer who also asked other pros.

- **Thumbtack** charges per lead, no subscription. Detailers report $30 or more
  a lead, $50+ in busy areas, and close maybe 1 in 5. At $35 a lead that's
  about $175 of leads per booked job, on a $199 to $449 job. You pay for the
  lead whether they book or not.
- **Angi** is worse for you: about $300 a year to join, a monthly ad budget on
  top (often $250 to $600), each lead shared with 3 to 8 other pros, 12-month
  contracts that auto-renew. Its pro reviews on Trustpilot and the BBB are
  bad. It's also built for home services; detailing may not even be a
  category it offers near 98290.

**For one guy with about 7 slots a week, already filling them from his own
site: don't buy leads.** Every job from Thumbtack costs more to win than a job
from your quote calculator, and you'd be racing the cheapest guy in the county
on price. Make the **free** profile on each (it's a citation and it holds your
reviews), keep Thumbtack's budget **off**, don't sign Angi's ad contract. If
Angi has no detailing category for 98290, skip it; a listing in the wrong
category does more harm than none.

---

## Paste-ready copy

Write once, paste everywhere. The character counts below were checked by
script against each site's limit. Ranges use an en dash ( – ), which is
allowed; there are no em dashes anywhere in this kit.

### The universal pieces

**Tagline / one-liner** (fits Facebook's 101-character intro; 93 characters)

```text
Mobile car detailing in your driveway, Snohomish County. Pay after the work, never a deposit.
```

**Short description** (fits 250; 247 characters)

```text
I'm Mikey. I detail cars in your driveway or at work in Snohomish County: interior, exterior, full details, paint correction and ceramic coating. Same detailer every time. You pay after the work, never a deposit. Exact price at mikeysdetailing.com
```

**500-character description** (Apple "About", Nextdoor, Hotfrog, Foursquare; 489 characters)

```text
I'm Mikey. I've detailed 300+ cars since 2021, and I come to you: your driveway or your work lot in Snohomish, Lake Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite Falls and Arlington. Interior, exterior, full details, paint correction and ceramic coating. Same price in every town, no travel fee. You provide an outdoor spigot and an outlet, I bring the rest. You pay after the work, never a deposit. Exact price in 60 seconds on my site.
```

**750-character description** (Bing; 722 characters)

```text
I'm Mikey, and I do every detail myself, in your driveway or your work parking lot. 300+ cars since 2021.

Exterior detail $199–$279. Interior detail $249–$329. Full detail $369–$449, 3–5 hours. Paint correction from $400, ceramic coating from $500, quoted. The low end is a sedan, the high end a van or 3-row.

I serve Snohomish, Lake Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite Falls and Arlington. Same price in every town, no travel fee. You provide an outdoor water spigot and a power outlet.

When I'm done we walk around the car together and I fix anything you point at. You pay after the work, never a deposit. Exact price in 60 seconds at mikeysdetailing.com.
```

**Long description** (Yelp Specialties 1,500, Facebook About, Thumbtack intro, Manta, Yellow Pages, BBB, Alignable, chamberofcommerce.com; 1,346 characters)

```text
I come to you. Every job happens in your driveway or your work parking lot, and I do every car myself, so it's the same detailer every time.

Exterior detail, $199–$279: hand wash, decontamination, clay bar, wheels and tires, exterior glass, wax or sealant on the paint.

Interior detail, $249–$329: deep vacuum, steam clean, upholstery shampoo, leather cleaned and conditioned, plastics dressed, interior glass, deodorized. About 90 minutes for a basic interior, 2–4 hours with extraction or pet hair.

Full detail, $369–$449: both, inside and out. 3–5 hours.

Paint correction from $400 and ceramic coating from $500, quoted once I've seen the paint.

The low end of each range is a sedan. An SUV or pickup is $40 more, a van or 3-row $80 more. A car in rough shape adds $30 or $60, and I tell you that before I start, not after. Same price in every town I serve, no travel fee.

Towns: Snohomish, Lake Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite Falls and Arlington.

You provide an outdoor water spigot and a power outlet. I bring the extractor, the polisher and the product.

When I'm done we walk around the car together and I fix anything you point at. You pay after the work, never a deposit.

Get your exact price in 60 seconds at mikeysdetailing.com, or call or text (425) 600-7897.
```

**History / "about the owner"** (Yelp History and Meet the Owner are 1,000 each; 465 characters)

```text
I started detailing cars in 2021 and it's still just me: one guy, one setup, your driveway. 300+ cars later that's the point. You deal with the person doing the work, from the walk-around to the last wipe of the glass.

No judgment on the state of the car. I've seen everything, kids, dogs, a winter of sanding grit. I'd rather redo a car than have a review I have to explain, so we walk around it together at the end and I fix anything you point at before you pay.
```

### Services (for any "services" or "menu" field)

Same names on every site. Paste the price into a price field if there is one;
otherwise use the line as the description.

| Service name | Price | Description (under 150 characters) |
|---|---|---|
| Exterior Detail | $199–$279 | Hand wash, decontamination, clay bar, wheels and tires, exterior glass, wax or sealant. Sedan to van. |
| Interior Detail | $249–$329 | Deep vacuum, steam clean, shampoo, leather cleaned and conditioned, plastics, glass. Sedan to van. |
| Full Detail | $369–$449 | Interior and exterior together, 3–5 hours. Sedan to van. |
| Paint Correction | from $400 | Machine polish to take out swirls and scratches. 1-step from $400, 2-step from $650. Quoted after I see the paint. |
| Ceramic Coating | from $500 | Tiered, quoted after I see the paint. |

If a field only takes one number, use the low end and tick "starting at".
Never type a single flat price for a range.

### Categories

Pick the category with "detail" in the name as the main one every time. Only
fall back to "Car Wash" if a site has nothing with "detail" in it, and never
pick a category for something you don't do (tinting, body work, repair).

| Directory | Main category | Extras, if it allows them |
|---|---|---|
| Yelp | Auto Detailing | Car Wash (only if offered as a second) |
| Bing | Car detailing (comes over from GBP) | Car wash |
| Apple | the "detailing" option in the Automotive group | none needed |
| Nextdoor | Auto detailer (already set) | |
| Facebook | type "detail" and take the closest match; if nothing, Automotive Service | Car Wash |
| Foursquare, Yellow Pages, Manta, Hotfrog, BBB, chamberofcommerce.com | Auto Detailing / Automobile Detailing (whichever spelling the site uses) | Car Wash |
| Thumbtack | Car Detailing (mobile) | |
| Angi | only if it offers a detailing category; otherwise skip Angi | |
| Alignable | Automotive | |
| Waze | Car Wash is the closest Waze has; skip if it forces the address public | |

---

## Directory by directory

Same order as the ranked list. "Long", "500", "short" and so on mean the
blocks above.

### 1. Yelp (fix the existing page)

- Go to **biz.yelp.com**, search "Mikey's Mobile Detailing" Snohomish, and
  claim the page at `.../mikeys-mobile-detailing-snohomish-4`. It calls the
  phone on the page, so sort out (425) 232-1355 first (step 0).
- Name `Mikey's Mobile Detailing`. Phone `(425) 600-7897`. Website exact.
- **Service area on, address hidden.** Yelp lets mobile businesses hide the
  address once a Service Area is set; it still needs the ZIP 98290. Set the
  twelve towns and remove Sultan.
- **Specialties:** Long (1,346 of 1,500). **History:** History block, and set
  "Established in" to 2021. **Meet the Business Owner:** the same History
  block, name "Mikey M.".
- Hours: [match your Google Business Profile].
- Delete the old "from the business" text with the 260/160/130 prices.
- Check `-snohomish`, `-snohomish-2`, `-snohomish-3` for duplicates of you.
- Yelp sells ads after you claim. Say no.

### 2. Bing Places

- **bingplaces.com**, sign in with the Google account that owns your GBP,
  choose **Import from Google Business Profile**. It usually verifies on the
  spot and keeps syncing.
- After import, check: service-area business, **address hidden**, twelve
  towns, website exact. Bing makes hiding optional, so make sure it's on.
- Description: 750 block (722 of about 750). Up to 10 categories.

### 3. Apple Business Connect

- **businessconnect.apple.com**, sign in with your Apple Account.
- Search for yourself first. If there's no place card, add one as a business
  that serves customers at their location (service area), not a storefront.
  Apple has supported businesses without a public location since late 2024.
- **About:** 500 block (489 of 500). Website, phone exact. Twelve towns as
  the service area.
- Verification: phone call if offered; otherwise upload a document with the
  business name on it (your Washington business license works). Up to 5
  business days.
- Logo and cover photo from the canonical block.

### 4. Nextdoor (claim the existing page)

- Open the page link above, tap **Claim page**. Nextdoor may ask for a
  business document.
- Display name: `Mikey's Mobile Detailing` (drop "- Snohomish"; 50-character
  limit, it's 24). Email `book@mikeysdetailing.com`.
- Description: 500 block. Reach: pick the twelve towns' neighborhoods, not the
  default radius, which runs into Lynnwood and Edmonds.
- After that, it's the playbook rule: answer recommendation threads, don't
  advertise.

### 5. Facebook (new page)

- From your personal profile: Pages, Create. Name `Mikey's Mobile Detailing`.
- Category: see the table. **Intro:** the tagline (93 of 101).
- Address: **leave it blank** and set the service area to the twelve towns.
- About / details: Long block. Website, phone, email exact.
- Username: `mikeysdetailing` if it's free. Instagram is
  `@mikeysdetailing_sno` (`social/PLAYBOOK.md`).
- Then follow `social/PLAYBOOK.md` for posting.

### 6. Foursquare

- **foursquare.com**, search yourself; if nothing, add a place. Then claim it
  (business.foursquare.com) and verify by phone.
- 500 block. No street address shown; if it insists on one, stop and skip
  rather than put a pin on a house.

### 7. BBB (free profile)

- **bbb.org**, "Get listed" / "Add your business" for BBB Great West +
  Pacific. Long block.
- They'll offer accreditation (yearly fee, at least about $500 at your size).
  Not now. A free profile is the citation.
- Don't fill in any "licensed" or "insured" field until you've confirmed both.

### 8. Yellow Pages

- **adsolutions.yp.com/listings/basic**. NAP, your name and email, up to 5
  categories. An automated call verifies the phone.
- Long block in the description. Thryv sales will call: you only want the free
  listing.

### 9. Waze

- **advertise.waze.com**, "Get started for free", search, claim or add.
- Waze is built around a pin you can drive to. If it won't let you hide the
  street, skip Waze. An unhidden home address on a navigation app is the worst
  place for it.

### 10. Manta

- **manta.com**, search, "Verify Now" to claim (or add). Long block. Decline
  the paid plans.

### 11. Hotfrog

- **hotfrog.com**, add business. 500 block (their limit is 500). Services table.

### 12. Alignable

- **alignable.com**, free account. Long block. Category Automotive.
- This is the one built for business-to-business: connect with used-car lots,
  body shops and dealers in the twelve towns before the fleet emails go out.
  Don't pay for a plan.

### 13. Chamber of Commerce

- **chamberofcommerce.com**: search, claim, Long block, decline every upsell.
- The real **Snohomish Chamber** (about $210 a year): later, alongside the
  fleet emails.

### 14. Angi (free profile only, or skip)

- First check that Angi has a detailing category for 98290. If not, skip.
- If yes: free business profile only, Long block, services table. **Don't sign
  the ad contract** (12 months, auto-renews, shared leads).

### 15. Thumbtack (free profile, budget off)

- **thumbtack.com/pro**. Category Car Detailing. Long block as the
  introduction (Thumbtack doesn't publish a limit; if it cuts off, use the 750
  block). Services table for pricing. Travel area: the twelve towns.
- **Set the weekly budget to zero / pause**, so you're listed but never charged
  for a lead.

---

## When you're done

1. Tick each one off in the checklist below and paste the listing's URL.
2. A week later, search `"Mikey's Mobile Detailing"` and `"425-232-1355"`
   again. The second search should come back empty as Yahoo picks up the Yelp
   fix.
3. Any fact change (price, phone, towns): change it here first, then on each
   listing in this order.

| # | Directory | Done | Listing URL |
|---|---|---|---|
| 1 | Yelp | [ ] | https://www.yelp.com/biz/mikeys-mobile-detailing-snohomish-4 |
| 2 | Bing Places | [ ] | |
| 3 | Apple Business Connect | [ ] | |
| 4 | Nextdoor | [ ] | https://nextdoor.com/pages/mikeys-mobile-detailing-snohomish-snohomish-wa/ |
| 5 | Facebook | [ ] | |
| 6 | Foursquare | [ ] | |
| 7 | BBB | [ ] | |
| 8 | Yellow Pages | [ ] | |
| 9 | Waze | [ ] | |
| 10 | Manta | [ ] | |
| 11 | Hotfrog | [ ] | |
| 12 | Alignable | [ ] | |
| 13 | Chamber of Commerce | [ ] | |
| 14 | Angi | [ ] | |
| 15 | Thumbtack | [ ] | |
| | detailerdirectory.com (off-list cleanup) | [ ] | https://www.detailerdirectory.com/united-states/snohomish/detailer/mikey-s-mobile-detailing-snohomish |

---

## Sources

Looked up 2026-10-05. Limits and prices are what these pages said that day.

- Yelp field limits (Specialties 1,500; History and Meet the Owner 1,000): https://www.yext.com/blog/2022/08/how-to-write-business-description
- Yelp service areas and hiding the address: https://biz.yelp.com/support-center/article/What-are-Service-Areas
- Yelp phone PIN verification: https://www.localdataexchange.com/yelp-business-verification-process/
- Apple Business Connect for businesses without a location: https://www.apple.com/newsroom/2024/10/apple-expands-tools-to-help-businesses-connect-with-customers/
- Apple verification (phone or document, up to 5 business days): https://www.brightlocal.com/learn/add-claim-apple-maps-business-listing/
- Apple "About" 500 characters: https://learn.thryv.com/hc/en-us/articles/34644475573901-Thryv-Business-Center-New-Apple-Business-Description-Field-Launch-Date-1-28-25
- Bing import from GBP, hiding the address: https://whitespark.ca/guides/the-ultimate-guide-to-your-bing-places-listing/
- Bing description ~750, 10 categories: https://thestacc.com/blog/bing-places-guide/
- Who reads what (Yelp to Apple, Alexa, Bing; Foursquare and ChatGPT): https://www.brightlocal.com/learn/local-listings-management-explained/ and https://www.surfacelocal.com/blog/how-chatgpt-finds-local-businesses
- Nextdoor page claim and verification: https://help.nextdoor.com/s/article/Verify-your-business?language=en_US
- Nextdoor limits (description 500, display name 50): https://allplatforms.io/nextdoor/
- Nextdoor ad costs: https://powerdigitalmarketing.com/blog/nextdoor-advertising-cost/
- Facebook intro 101 characters: https://snappa.com/blog/facebook-bio/
- Foursquare claim and verification: https://www.soci.ai/knowledge-articles/how-to-claim-your-listing-on-foursquare/
- BBB accreditation fees: https://www.bbb.org/bbb/great-west-pacific/accreditation-benefits and https://www.business.org/business/startup/what-you-should-know-about-the-bbb/
- Yellow Pages free listing and phone verification: https://www.localseoguide.com/how-to-add-a-business-listing-to-yp-com/
- Waze free listing: https://support.google.com/waze/answer/6263233?hl=en and https://www.localseoguide.com/how-to-add-a-business-listing-to-waze/
- Manta free listing and plan prices: https://www.manta.com/business-listings/free-business-listing and https://www.trustradius.com/products/manta-business-directory/pricing
- Hotfrog 500-character description: https://freebusinesslisting.com/directories/hotfrog
- Alignable pricing: https://support.alignable.com/hc/en-us/articles/360023661552-Does-Alignable-Cost-Anything
- chamberofcommerce.com is not a real chamber: https://localsearchforum.com/threads/chamberofcommerce-com.50312/
- Snohomish Chamber dues: https://snohomishchamber.org/membership-opportunities/
- Thumbtack lead costs for detailers: https://riotgarage.shop/blog/news/is-thumbtack-worth-it-for-auto-detailers-2026/ and https://auto-respond.com/blog/thumbtack-lead-cost-wasted-slow-response/
- Angi fees, shared leads, contracts: https://www.leadtruffle.co/blog/angi-leads-cost-pricing-contractors-2026/ and https://fitsmallbusiness.com/what-is-angis-list/
