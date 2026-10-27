# Quote calculator R&D: competitors and outside evidence (2026-10-27)

One of four R&D tracks on the quote calculator (QQC). This one is outside
research: what other mobile detailers in his area and a few national services
do, and what published evidence says about quote and booking flows. The other
three tracks cover his funnel numbers, a mobile UX teardown, and the price
screen's offer, trust and follow-up. Nothing on the site was changed; Mikey
picks from the four reports first.

**Bottom line.** His flow is already ahead of every local competitor I could
find. No one else in his twelve towns gives an exact price for this car in
this condition and then a real opening to tap, with no deposit and no
account. Most local sites either hide prices behind a contact form or show
"starting at" lists and hand you to a generic booking tool. So the job is not
to copy anyone. It's to fix the few places he's behind: **phones see no
review near the calculator**, and **people who stop short of booking get no
follow-up**. Both have reasonable evidence behind them and are cheap.

Screenshots (390 px phone, taken 2026-10-27) are in
`reports/2026-10-27-qqc-competitor-research/`. No forms were submitted.

---

## 1. What his calculator does today (so the comparison is fair)

Read from `index.html`, `#booking`:

1. Vehicle size (sedan / SUV-pickup / van-3-row)
2. Service (Full Detail card first, or build your own: Interior, Exterior)
3. Condition (Pretty Clean / Needs Work / War Zone), with optional year-make-model,
   town or ZIP, and notes
4. Add-ons (optional, "Skip straight to your price")
5. **Exact price**, "No hidden fees. Pay when the job's done.", then one big
   **Pick my time** button, or "Not ready? Text me this quote instead"
   (name + phone, consent text above the button)
6. (steps 7 and 8) Three next openings from his real calendar, then name,
   phone, town, street (house number optional)

Trust items: "No deposit / Pay when complete / Price held 30 days" under each
button, and a "Next opening" line above the card. On desktop (980 px and
wider) a side panel shows 5.0 on Google, 40 reviews and a real review (C
Wilson, verbatim on `/reviews/`). **Below 980 px that panel is
`display:none`**, so a phone sees no rating or review anywhere near the
calculator.

---

## 2. Competitors

### 2a. Local (sites that show up for mobile detailing in his towns)

Found from the Everett results page already logged in
`reports/2026-10-scoreboard.md`, the competitor list in
`reports/2026-10-27-seo-research.md`, and searches for the other towns.
Search results for the small towns (Monroe, Duvall, Granite Falls, Arlington)
were thin: mostly directories and an agency's audit pages, which says the
field there is weak.

| Business (base) | Price online? | Taps to a price | How you book | Asks for, and when | Deposit | Trust shown | Offer |
|---|---|---|---|---|---|---|---|
| **Slide In** (Everett, shop + mobile) | Yes, by size: Complete $359.99 / $399.99 on the homepage, but **$375 on the booking page** | 1 (list) | Wix Bookings: pick service, add-ons, then calendar | Add-ons first, contact at checkout (not walked past Next) | None stated on the site; Wix supports one | Seattle Times Best of PNW 2023–25, "Licensed & Insured", "100% Up Front Pricing", no review count | "Save $90", free headlight restoration with Complete |
| **Big's Mobile** (Seattle area) | "Starting at": Big Wash $149, Biggest Detail $399 | 0 on page; booking tool unknown | Fieldd booking app; **first screen is "Enter the full address" on a map** | Full street address before anything else | None stated | BBB A+, "Since 2014", CarFax upload, 6 reviews shown, no count | Membership, gift cards |
| **Alex's Mobile** (Everett) | Homepage: "Starting at $100". Booking page: full menu by size, **tax shown** (Full Detail sedan $320 + 9.9% = $351.68) | 2 (size, then list) | Acuity Scheduling, Stripe loaded; "SIGN UP / LOGIN" at the top | Size first; contact at checkout | None seen | BBB A+, "Nominated Best in the PNW 2026", no review count | None |
| **Everett Lux** (everettcardetailing.com) | "From": Full Service $229 (on sale from $300), Interior $150 | n/a | **Request form, no calendar**: "We'll reply with a quote and open times" | Name, phone, email, city, vehicle, service, timing, details; photos invited | None | 5.0 from 79 Google reviews | Full Service sale |
| **Cream Puff** (Everett) | **No.** "send me 5-6 photos" | n/a | Contact form only | Name, phone, email (all required), message | None | None | None |
| **The Detail Buff** (Marysville, shop + mobile) | **No.** "Get a Free Quote" | n/a | Contact form / phone | Not shown | None | "EXCELLENT, 460 reviews" (Trustindex) | Gift cards (Square) |
| **Dunamis** (Duvall / Eastside) | Yes: Full $270 / $380 / $520 tiers, +$40 large vehicle | 0 (price list) | YouCanBook.me | Not walked | None | None | 20% off 2 exteriors, 10% senior |

Evidence: `slidein-service-list-390.jpg`, `slidein-addons-390.jpg`,
`alex-acuity-packages-390.jpg`, `bigs-fieldd-address-first-390.jpg`,
`everett-lux-quote-form-390.jpg`. Everett Lux also lists Lynnwood, Edmonds,
Seattle and the Eastside, and says "Open 24 hours"; Alex's water-and-power
line reads "Access to water and power is required", same as his.

**What the local field says:**

- **Nobody else asks about condition.** Slide In and Cream Puff add a flat
  "$50 upcharge" for dirty or pet hair that the customer learns about in the
  fine print. His three condition tiers, priced into the number, are the
  fairer and clearer version of the same thing.
- **Nobody else shows live openings next to an exact price.** The three that
  book online (Slide In, Alex, Big's) use generic tools that start from a
  service list or an address, not from "what's your car".
- **Price drift is real out there.** Slide In's Complete Detail is $359.99 on
  the homepage and $375 on the booking page. A customer who notices that stops
  trusting both. `check-site.py` is what keeps that from happening to him.
- **His Full Detail ($369 sedan) sits in the middle of the market:** Alex
  $320 plus tax, Slide In $360 to $375, Dunamis $380, Big's from $399.
  Everett Lux's $229 sale is the outlier. Pricing isn't this report's call;
  the point is that his price isn't a reason to hide it.
- **The ones with no price online are the bigger review counts** (Detail Buff
  460, Everett Lux 79). They lean on reviews instead of price. He can do both.

### 2b. National and best-in-class flows

| Service | Flow | What to take from it |
|---|---|---|
| **Spiffy** (national mobile detailing) | Packages by sedan / non-sedan ($89 to $329 sedan); book in app or customer portal. Its Garner, NC page says it asks for payment only after you're satisfied. I couldn't walk the booking flow from a session (the consumer pages redirect). | Same promise as his ("pay when it's done"), same two-size simplicity. Nothing he lacks. |
| **LawnStarter** (lawn care, instant quote) | Address, then **name and phone, then "See My Price"**. Email only if you book. | A contact gate before the price. This is the opposite of his flow and is what he should **not** copy (see 3b). |
| **Big's / Fieldd**, **Alex / Acuity**, **Slide In / Wix** | Off-the-shelf booking tools | Accounts, address-first maps and service lists are what you get from a generic tool. His hand-built flow avoids all three. |

Urable, Jobber and Housecall Pro didn't turn up on any local site I could
read (Detail Buff and Cream Puff pages contained the word "urable" only inside
minified script). Square shows up only for gift cards.

---

## 3. What the evidence says

Rated **Strong** (large sample, primary source, methods published),
**Moderate** (real data but narrow, vendor-run, or old), or **Weak**
(single case study, vendor blog, or stated intent). "Fits him" means: does it
transfer to a one-man local service with a few hundred calculator visitors a
month.

### 3a. Multi-step vs one long form

- **Evidence:** case studies favour multi-step for longer forms: an AC repair
  company's quote form went from 7.62% to 13.13% in a two-week 50/50 test
  (Geek Powered Studios), a credit union saw 175% more leads (Voyage FCU,
  99.98% confidence). NN/g recommends wizards "for novice users or infrequent
  processes", with progress shown and explicit back buttons.
- **Strength:** Moderate. The tests are single companies, often published by
  the agency that ran them. NN/g is guidance, not a conversion study.
- **Fits him:** Yes. Booking a detail is infrequent and people don't know
  the vocabulary. His flow already does what NN/g asks: a progress bar with
  labels ("Step 3 of 5 · Condition"), a Back on every step, sequential order.
  **Keep it.**

### 3b. Price before contact info, or after

- **Evidence:** Baymard's checkout survey (US shoppers): 40% of abandoners
  left over **extra costs too high**, 12% because they **couldn't see the
  total up front**. NN/g: price is the #1 thing people look for on any site.
  The Seim, Vitorino and Muir study (*Quantitative Marketing and Economics*,
  2017, driving schools) estimated people would pay about **11% of the price
  for transparency** itself.
- **Strength:** Strong that hidden or late costs drive people off (Baymard is
  large, repeated yearly). Moderate on the size of the effect for services.
- **Fits him:** Yes, and he's already on the right side. LawnStarter gates
  the price behind name and phone; most local detailers hide it entirely.
  A contact gate would get more phone numbers and fewer people who trust the
  number. **Don't move contact before the price.**
- **One thing to check (not a conversion idea):** Alex shows Washington sales
  tax on top (9.9%). Washington generally treats cleaning a customer's
  property, vehicles included, as a retail sale (RCW 82.04.050). The
  calculator says "No hidden fees". Mikey should confirm with DOR or his
  accountant how tax applies to him and whether the shown price includes it,
  because Baymard's top abandonment reason is exactly a surprise added at the
  end.

### 3c. Number of fields

- **Evidence:** Baymard: the average US checkout shows 14.88 form fields,
  where 7 to 8 would do. Imagescape (2007 to 2008): cutting a contact form
  from 11 fields to 4 raised conversions 120%, with no drop in lead quality.
  Counterpoint (CXL, Michael Aagaard at Unbounce): removing the *wrong* fields
  cost 14%, and keeping them with better labels gained 19%.
- **Strength:** Moderate. Old and single-site, but the direction is
  consistent, and the counterpoint matters: what counts is whether each field
  earns its place.
- **Fits him:** He's lean already. Booking asks name, phone, town, street
  (four, house number optional). The text form asks two. Year-make-model and
  town on step 3 are optional. **Nothing to cut.** Everett Lux asks for seven
  fields plus a dropdown, and you still don't get a price.

### 3d. Phone vs email

- **Evidence:** Baymard: 14% of users abandon when a phone number is simply
  required with no reason given; most just need to be told why. Unbounce's
  figure for a required phone field is about 5% (quoted secondhand); one
  ebook test lost 47% by adding it (single case, a download, not a booking).
- **Strength:** Moderate (Baymard's is from usability testing, with a stated
  method).
- **Fits him:** He needs the phone; his whole operation is texting. He
  already explains it at the field ("Enter a valid phone number so I can text
  you"), and the street field says why the house number can wait. That is
  Baymard's fix. **Ahead.** Don't add email.

### 3e. Instant booking vs a request

- **Evidence:** Expedia Group's figure for vacation rentals is about 35%
  higher conversion with instant booking than request-and-approve (vendor
  number, quoted secondhand). For home services, the after-hours share of
  online bookings ranges from 38% to 71% depending on who's counting (one
  ServiceTitan customer: 71% of online jobs booked after hours).
- **Strength:** Weak to moderate. Vendor numbers, no independent study.
- **Fits him:** Yes. He works days and is in school until noon, so a lot of
  quotes arrive when he can't answer. His instant confirm in the twelve towns
  and "request" elsewhere is the right split. **Ahead.**

### 3f. Deposits

- **Evidence:** OpenTable reports a 60% drop in no-shows where restaurants
  take deposits (its own data). No controlled study of how many bookings a
  deposit costs; one restaurateur cut his from £50 to £5 because he believed it
  scared people off.
- **Fits him:** **Not allowed** (CLAUDE.md: payment after the work, never a
  deposit). No local competitor shows one either. "No deposit" is one of his
  differentiators. If no-shows become a problem, the tools are the reminders
  he already sends and the fact that a time is only confirmed in the twelve
  towns.

### 3g. Reviews near the decision

- **Evidence:** Spiegel Research Center with PowerReviews (Northwestern,
  2015, retail products): showing reviews raises purchase likelihood sharply
  (the widely quoted figure is 270% for five reviews against none), and
  purchase likelihood **peaks at 4.2 to 4.5 stars and falls as the average
  nears a perfect 5.0**, because perfect looks too good to be true.
- **Strength:** Moderate. Real purchase data, but for products, not local
  services.
- **Fits him:** Partly. The "show reviews" half transfers. The 5.0 half means
  the **number alone is weaker than the words**: a real, specific review with a
  first name and month does more than "5.0" with nothing under it. He can't
  and mustn't lower his rating; he can show the text. Right now a phone
  visitor gets neither near the calculator (section 1).

### 3h. Following up a quote that didn't book

- **Evidence:** Oldroyd with InsideSales (15,000+ web leads, 100,000 call
  attempts): contacting a lead within 5 minutes rather than 30 made qualifying
  it 21 times likelier. It's vendor data analysed by an academic, often
  mislabelled "MIT", and compares 5 against 30 minutes only. Klaviyo's
  e-commerce abandoned-cart emails average about a 3.33% order rate per
  recipient.
- **Strength:** Moderate on speed. Weak for a local service (the cart numbers
  are online shops).
- **Fits him:** He can only follow up people who left a number, which means
  "Text me this quote" and any booking request. Someone who saw the price and
  left gave nothing, and should stay that way (asking for a phone earlier is
  3b's mistake). The useful gap: a text-quote customer who doesn't reply. What
  the dashboard already sends there is a question for the funnel track and
  the dashboard repo; any new automatic text to a customer needs Mikey's yes
  (dashboard `CLAUDE.md`).

### 3i. Low traffic changes how to test

To tell a 5% quote rate from 6.5% with normal confidence takes roughly
**3,400 visitors per version** (n ≈ 16·p(1−p)/δ²). At his traffic that's
months per test. So: pick changes with outside evidence behind them, ship one
at a time, and compare four-week windows before and after, rather than
running A/B tests he can't finish.

---

## 4. Where he's ahead (don't undo these)

1. **Exact price for this car, size and condition, before any contact info.**
   No local competitor does it. (3b)
2. **Condition priced in up front**, not a "$50 upcharge" in fine print. (2a)
3. **Real openings from his calendar, three at a time, tap to book.** (3e)
4. **No deposit, no account, pay after.** Alex shows SIGN UP / LOGIN, Big's
   pushes an app, Wix and Acuity can take deposits. (3f)
5. **Few fields, each explained**, house number optional. (3c, 3d)
6. **A step-by-step flow with labelled progress and Back.** (3a)
7. **One price everywhere**, guarded by `check-site.py`, where Slide In's
   homepage and booking page disagree by $15. (2a)

---

## 5. Where he's behind, ranked

| # | Idea | Evidence | Expected effect | Effort | Conflicts / notes |
|---|---|---|---|---|---|
| 1 | **Show the rating and one real review on phones**, near the calculator's first step or the price (the desktop panel's content, sized for a phone). | Moderate (3g); every review-led competitor puts its count up front | Small to medium. Phones are most of his traffic and see nothing today | Small: CSS and markup | Review must be verbatim from `/reviews/` (C Wilson's already is). Not the guarantee (four places only). Overlaps the mobile UX track; whoever builds it, build it once |
| 2 | **Follow-up for "Text me this quote" people who don't reply** (one text the next day, in his voice, with the price and a link back to pick a time). | Moderate on speed (3h) | Medium per lead, small number of leads | Medium, in the dashboard | Texts customers on its own, so **Mikey's yes first**. Check what the dashboard already does. Overlaps the follow-up track |
| 3 | **Ask for a photo when the condition is War Zone** (an optional "text me a photo" link or upload on step 3 or the confirm text). | Weak (Everett Lux, Cream Puff and Dunamis all ask for photos) | Small. Cuts the "is my car really War Zone" doubt and price surprises at the driveway | Small as a text prompt, medium as an upload | Upload needs storage in the worker. The text prompt is free |
| 4 | **Remember a half-done quote on the same phone** (local storage, so coming back from a text or tab restores their car and price). | Weak (NN/g: let people resume) | Small | Small | Per-device only, nothing sent anywhere. Must not break the calendar steps |
| 5 | **Settle sales tax** before the price says "No hidden fees" again. | Strong on the risk (Baymard's #1 reason, 3b) | Protects trust, not a lift | Mikey and his accountant | Not a site change until he answers. Any change lands in `PRICE_BOOK`, `PRICING.md` and every copy |
| 6 | Consider showing the price after condition and offering add-ons on the price screen (one step less to the number). | Weak to moderate (fewer steps before the value) | Unknown, could be small either way | Medium | The code comment on step 4 explains why add-ons got their own step. Belongs to the price-screen track; listed here only so it isn't lost |

**Not recommended**, with the reason:

- **Name and phone before the price** (LawnStarter's way). More numbers,
  less trust, and it throws away his biggest lead over the local field. (3b)
- **Deposits.** Banned, and a local differentiator. (3f)
- **An off-the-shelf booking tool** (Urable, Square, Acuity, Fieldd). Every
  one seen here is worse than what he has: accounts, address first, service
  lists. (2b)
- **Email field, account, or app.** (3d, 2b)
- **Running A/B tests.** Not enough traffic to finish one; ship
  evidence-backed changes one at a time instead. (3i)

---

## Sources

Read on 2026-10-27.

Competitors: [slideinmobiledetail.com](https://slideinmobiledetail.com/) and
[/book-online](https://www.slideinmobiledetail.com/book-online);
[bigsmobile.com](https://bigsmobile.com/) and
[bigsmobiledetailing.fieldd.co](https://bigsmobiledetailing.fieldd.co/);
[alexmobilecardetailing.com](https://alexmobilecardetailing.com/) and its
[Acuity page](https://alexsmobilecardetailing.as.me/schedule/92aa9641/);
[everettcardetailing.com/contact](https://www.everettcardetailing.com/contact/);
[creampuffmobiledetailing.com](https://creampuffmobiledetailing.com/);
[thedetailbuff.com](https://thedetailbuff.com/);
[dunamismobiledetailing.minisite.ai](https://dunamismobiledetailing.minisite.ai/);
[getspiffy.com](https://getspiffy.com/wash-detail);
[LawnStarter, "How to get a lawn care quote"](https://www.lawnstarter.com/blog/lawnstarter/how-to-get-lawn-care-quote/).

Evidence:
[Baymard, cart abandonment rate and reasons](https://baymard.com/lists/cart-abandonment-rate);
[Baymard, explain the phone number field](https://baymard.com/blog/explain-phone-number-field);
[Baymard, inline form validation](https://baymard.com/research-articles/inline-form-validation);
[NN/g, wizards](https://www.nngroup.com/articles/wizards/);
[NN/g, Hoa Loranger author page (price as #1 info need)](https://www.nngroup.com/articles/author/hoa-loranger/?page=5);
[Wharton Mack Institute, "Do Consumers Value Price Transparency?" (Seim, Vitorino, Muir)](https://mackinstitute.wharton.upenn.edu/2017/do-consumers-value-price-transparency/);
[Imagescape form-field study](https://imagescape.com/filer/canonical/1455648270/152) and
[CXL, "Should you really reduce form fields?"](https://cxl.com/blog/reduce-form-fields/);
[Geek Powered Studios AC multi-step test, via Conversion Fanatics and Medium case study](https://medium.com/@jenningscreate/case-study-stans-ac-multi-step-form-25ee54cfb5aa);
[Voyage FCU A/B test](https://www.cuinsight.com/how-voyage-fcu-used-a-b-testing-to-get-more-members/);
[Spiegel Research Center / PowerReviews, "From Reviews to Revenue"](https://spiegel.medill.northwestern.edu/wp-content/uploads/sites/2/2021/04/Online-Reviews-Whitepaper.pdf);
[Oldroyd / InsideSales lead response study (PDF)](https://www.mortech.com/hs-fs/hub/25649/file-13535879-pdf/docs/mit_study.pdf);
[Klaviyo abandoned-cart benchmarks, via Attribuly](https://attribuly.com/blogs/abandoned-cart-recovery-rate-klaviyo/);
[ServiceTitan, Schedule Engine webinar recap (after-hours bookings)](https://www.servicetitan.com/blog/webinar-recap-mastering-24-7-customer-service-with-scheduling-pros-live-services);
[Instant booking conversion, Expedia figure via your.rentals](https://your.rentals/blog/instant-booking-for-vacation-rental-hosts/);
[OpenTable deposits and no-shows, via The Drinks Business](https://www.thedrinksbusiness.com/2023/04/could-bigger-restaurant-booking-deposits-stop-no-show-customers/);
[Unbounce phone-field figure, via GitLab issue](https://gitlab.com/gitlab-org/gitlab/-/issues/196799).
