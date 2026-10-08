# Muse brief, 2026-10-08: everything a session can't do

Written for Muse (the browser agent) to run with Mikey at the keyboard. It
collects every hand step left by `reports/2026-10-scoreboard.md`,
`reports/2026-10-07-aeo.md` and the Search Console read of 2026-10-08.
Paste everything below the line into Muse. Its report comes back to a Claude
session, which files it.

Left out on purpose, because a session can do them once Mikey says yes: the
old blog redirect and the old quote widget (Netlify deploys), and the MyQqc
GitHub Pages fix.

---

You're helping Mikey of Mikey's Mobile Detailing (mobile car detailing,
Snohomish County, WA) with a list of jobs in his own accounts. Mikey is at the
computer. Work through the parts in order. Each part can be done by itself, so
if one gets stuck, report it and move on to the next.

## Rules for the whole run

1. **Mikey signs in himself.** Whenever a site asks for a password, a
   verification code or a passkey, stop and ask Mikey to type it. Never type,
   save, read out or ask for a password, and never let the browser save one.
2. **Never pay for anything.** If a page asks for a card, an upgrade or a paid
   plan, stop that part and report the plan name and price exactly as shown.
3. **Never delete anything** unless this brief says to and Mikey says yes in
   the chat at that moment.
4. **Record before you change.** For every field you edit, write down what it
   said before, word for word, then what you changed it to.
5. **Copy text exactly** from this brief: straight apostrophes ('), the en
   dashes in price ranges ($199–$279), nothing added. Don't rewrite or improve
   it.
6. **Report what the screen says, word for word.** Status lines, error
   messages and "under review" notices go in your report as quoted text, not
   as a summary.
7. **Stop and report, don't push through,** if you see: a suspension or
   "profile disabled" banner, a request for video verification or a postcard
   code, a "this change needs verification" prompt, or anything you're not
   sure Mikey wants.
8. **Out of scope today. Don't do these even if a page suggests it:** creating
   or editing Google posts (eight are already scheduled), replying to reviews,
   changing the business name, primary category, phone number or hours, adding
   photos, signing up for any directory, any Netlify deploy, any ad account.

## Part 1. Google Business Profile: read it before changing anything

Mikey signs in to the Google account that owns the profile. Search Google for
**my business** or open business.google.com, and pick Mikey's Mobile Detailing.

**1a. Numbers for the monthly scoreboard.** Open **Performance**. Set the date
range to **September 2026** (whole month). Record every number the page shows:

- Total profile interactions, and each kind: calls, messages, bookings,
  directions, website clicks
- People who viewed the profile, split by Google Search mobile, Google Search
  desktop, Google Maps mobile, Google Maps desktop
- Searches: the total, and the top 10 search terms with their counts

Then do the same for **August 2026**, so there's a month to compare against. If
the page only offers preset ranges, use the closest ones and write down exactly
which range each number is for.

**1b. Reviews.** Record the star rating and the review count exactly as the
profile shows them (the site says 5.0 across 41; an earlier check saw 39). Then
open the reviews list, sort by newest, and count how many reviews are dated
in **September 2026** and how many in **October 2026** so far. Don't reply to
any.

**1c. Current settings.** Open **Edit profile** and record, word for word:

- The **description**
- The **website** link
- Any **appointment / booking link** (look in Edit profile and on the
  **Bookings** card if there is one)
- Any other field that holds a link starting `http://` or
  `https://mikeysdetailing.com` (menu, products, order or similar)
- **Services**: every service listed, with its price and description
- **Location**: whether the business address is shown to customers (just say
  shown or hidden; **don't write the street address in your report**)
- **Service area**: every place listed

## Part 2. Google Business Profile: the fixes

The profile currently tells people a full detail is "From $200". The real price
is $369–$449, and AI search engines repeat what the profile says, so this part
matters most.

**2a. Services.** Delete the service that says **Auto detailing, From $200**
(or anything else priced at $200 or under). Then add these five, exactly. Where
there's a price type, pick **From** and enter the first number shown. Where
there's a description, paste the description.

| Service name | Price | Description |
|---|---|---|
| Exterior Detail | From $199 | Hand wash, decontamination, clay bar, wheels and tires, exterior glass, wax or sealant. Sedan to van. |
| Interior Detail | From $249 | Deep vacuum, steam clean, shampoo, leather cleaned and conditioned, plastics, glass. Sedan to van. |
| Full Detail | From $369 | Interior and exterior together, 3–5 hours. Sedan to van. |
| Paint Correction | From $400 | Machine polish to take out swirls and scratches. 1-step from $400, 2-step from $650. Quoted after I see the paint. |
| Ceramic Coating | From $500 | Tiered, quoted after I see the paint. |

If Google lists its own suggested services under the category with no price,
leave them. Any other service with a price that isn't in this table: remove the
price, and report what it said.

**2b. Description.** Replace the whole description with this (489 characters):

```text
I'm Mikey. I've detailed 300+ cars since 2021, and I come to you: your driveway or your work lot in Snohomish, Lake Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite Falls and Arlington. Interior, exterior, full details, paint correction and ceramic coating. Same price in every town, no travel fee. You provide an outdoor spigot and an outlet, I bring the rest. You pay after the work, never a deposit. Exact price in 60 seconds on my site.
```

**2c. Links to https.** Every link that starts `http://mikeysdetailing.com`
changes to start with `https://mikeysdetailing.com`. Change **only** those five
letters; everything after the domain stays exactly as it is. The two expected:

- Website: `https://mikeysdetailing.com/?utm_source=google&utm_medium=organic&utm_campaign=google_profile&utm_content=website_button`
  (if the old one had different tags after the `?`, keep the old tags and only
  change `http` to `https`)
- Appointment link: `https://mikeysdetailing.com/#booking`

**2d. Address and service area.** Mikey goes to his customers, so:

- Turn **off** showing the business address to customers. If Google says
  this needs verification, stop 2d and report the message.
- Set the service area to exactly these twelve, each one as Google suggests it
  ("Snohomish, WA, USA" and so on): Snohomish, Lake Stevens, Everett, Monroe,
  Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite
  Falls, Arlington.
- Remove anything else that's listed. **Lynnwood and Edmonds must not be on
  it**; Mikey doesn't serve them.

**2e. Save and check.** After saving each section, record what Google says
("Your edits are under review" and similar are normal; don't resubmit). Then
open the public profile (search Google for **Mikey's Mobile Detailing
Snohomish**) and record what the Services and Website show to the public. It's
fine if they still show the old version; edits can take days.

## Part 3. Search Console: why six pages aren't showing

Mikey signs in at search.google.com/search-console. Pick
`sc-domain:mikeysdetailing.com`.

**3a. URL Inspection.** In the search bar at the top ("Inspect any URL"), check
each of these six, one at a time:

1. `https://mikeysdetailing.com/mobile-car-detailing-near-me/`
2. `https://mikeysdetailing.com/pet-hair-removal-car-detailing/`
3. `https://mikeysdetailing.com/mobile-detailing-vs-car-wash/`
4. `https://mikeysdetailing.com/lake-stevens/interior-detail.html`
5. `https://mikeysdetailing.com/mill-creek/interior-detail.html`
6. `https://mikeysdetailing.com/monroe/ceramic-coating.html`

For each, record word for word:

- The headline: "URL is on Google" or "URL is not on Google" (or whatever it says)
- The **Page indexing** line (for example "Crawled - currently not indexed")
- Open the Page indexing section and record **Last crawl**, **User-declared
  canonical** and **Google-selected canonical**
- If it says "URL is not on Google", click **Request indexing** and record what
  comes back. If you hit a quota message, record it and stop requesting.

**3b. Pages report.** Left menu, **Indexing → Pages**. Record the **Indexed**
and **Not indexed** counts. Under "Why pages aren't indexed", record every row
(reason and number of pages). Click into each reason and list the URLs it shows.

**3c. Sitemaps.** Left menu, **Indexing → Sitemaps**. Is
`https://mikeysdetailing.com/sitemap.xml` listed under "Submitted sitemaps"?
Record its Status, Last read and Discovered pages (the file lists 43). If it
isn't listed, type `sitemap.xml` in "Add a new sitemap", submit it, and record
the result.

## Part 4. Connect Windsor.ai so a Claude session can pull the numbers itself

Right now Windsor.ai only has Google Ads connected, so every monthly number has
to be pulled by hand like this. Connecting three Google sources fixes that.
Open each link, sign in to Windsor if asked (Mikey types it), then sign in to
Google with the account that owns the property (Mikey types it).

1. **Search Console:**
   https://onboard.windsor.ai/connect?connector=searchconsole&next=/searchconsole/authorize
   Tick the Search Console permission when Google asks. Select the site
   (`sc-domain:mikeysdetailing.com` or however Windsor names it) before
   clicking Finish.
2. **Google Business Profile:**
   https://onboard.windsor.ai/connect?connector=google_my_business&next=/google_my_business/authorize
   Tick the Business Profile permission. Select Mikey's Mobile Detailing.
3. **Google Analytics 4:**
   https://onboard.windsor.ai/connect?connector=googleanalytics4&next=/googleanalytics4/authorize
   Tick the Analytics permission. Select the property for mikeysdetailing.com
   (its measurement ID is `G-G9WMXW2MF5`).

For each, record: connected or not, the account or property name Windsor shows,
and any error. **If Windsor asks to upgrade or pay to add another source, stop
Part 4** and report the plan and price shown, word for word. Mikey decides that
separately.

## Part 5. Google Analytics: the quote calculator numbers

Do this even if Part 4 worked; it's quick. Open analytics.google.com, pick the
mikeysdetailing.com property (`G-G9WMXW2MF5`). Go to **Reports → Engagement →
Events**. Set the date range to **Sep 7, 2026 to Oct 4, 2026** (custom).

Record **Event count** and **Total users** for each of these rows (use the
search box on the table):

| Event | What it means |
|---|---|
| `qqc_step` | someone moved through a step of the quote calculator |
| `qqc_quote` | the calculator showed them a price |
| `qqc_submission` | they sent their details (text-me form or booking) |
| `qqc_booking` | they picked a time and booked |
| `qqc_booking_error` | booking failed |
| `qqc_submit_error` | sending failed |

If an event isn't in the list, write "not in the list". Also record the
property's total **Users** for the same dates (Reports → Reports snapshot).

## Part 6. Bing Webmaster Tools (optional; skip if it asks to pay)

ChatGPT search and Microsoft Copilot use Bing's index, so Bing needs to know
the site well. Open bing.com/webmasters. Mikey signs in (the Google account
works). If mikeysdetailing.com is already listed, record what the dashboard
shows (clicks, impressions, indexed pages) and whether `sitemap.xml` is
submitted. If it isn't listed, choose **Import from Google Search Console**,
allow it, select mikeysdetailing.com, and record the result. Don't change any
other setting.

## Part 7. An old app that's still public (ask Mikey first)

`https://mikeyscrm.netlify.app` ("Mikey's Detailing - Pro Business Manager")
is still public and shows old prices ($150–$250). Ask Mikey in the chat:
**"Do you still use mikeyscrm.netlify.app?"**

- If **yes**, or he isn't sure: do nothing and record his answer.
- If **no**: warn him that anything that app saved lives only in the browser
  it was used in, and deleting the site makes that unreachable. If he still
  says delete it, open app.netlify.com, open the project that serves
  `mikeyscrm.netlify.app`, go to **Project configuration → General → Delete
  project**, and confirm. Record each screen's wording. Delete only that one
  project; don't touch **mikeysqqc** or **mikeysquote**.

## Part 8. The AI prompt panel, 4 engines (long; do it last)

This is the monthly check of whether AI assistants name Mikey's Mobile
Detailing. Claude was already done on Oct 5. Run all 25 prompts below in each
of these four:

- **ChatGPT** (chatgpt.com) logged out, or in a Temporary Chat
- **Perplexity** (perplexity.ai) logged out
- **Gemini** (gemini.google.com) logged out if it allows; otherwise signed in
  with no saved activity, and say which
- **Google AI Overviews**: a normal Google search, logged out or in a private
  window. If no AI Overview appears, score it **n/a**, not 0

Paste each prompt exactly, one per new chat. Don't add anything to it.

**Score 1** if the answer names **Mikey's Mobile Detailing** or
**mikeysdetailing.com**; otherwise 0. For every prompt, record:

- the score
- if he's named: what it said about him, especially any **price, time, review
  count or rating** (quote it exactly; old wrong numbers are what we're hunting)
- the sources the answer cited or linked (domain names are enough)

The 25 prompts:

1. Best mobile car detailing in Snohomish WA
2. Mobile detailing near me Snohomish County
3. Who does mobile car detailing in Lake Stevens WA
4. Mobile car detailer Everett Washington
5. Best car detailing Monroe WA
6. Mobile detailing Mill Creek WA
7. Car detailing that comes to you Marysville WA
8. Mobile auto detailing Bothell WA
9. Ceramic coating Snohomish County
10. Paint correction near Everett WA
11. Pet hair removal car detailing Washington
12. Interior car detailing Snohomish WA
13. Truck detailing Snohomish County
14. Mobile detailing for apartment dwellers Seattle area
15. Boat/RV detailing Snohomish County
16. How much does mobile car detailing cost in the Seattle area
17. Is mobile detailing worth it vs a car wash
18. How long does a full car detail take
19. Best time of year to detail a car in Washington
20. Is ceramic coating worth it in the Pacific Northwest
21. How often should I detail my car in a rainy climate
22. Mobile detailing vs drive-through car wash which is better
23. What should I look for in a mobile detailer
24. Cheapest vs best car detailing Snohomish County
25. Mobile detailer that takes card and comes to your driveway WA

Also record, once per engine, the location it seemed to assume (if an answer
says "near you in ..." or shows a map).

If you run out of time, finish the engine you're on and report the ones done.

## Your report

Send it back in this shape, with every quoted thing word for word:

```
## Part 1: GBP before
1a Performance: September 2026 ... / August 2026 ... (say the exact ranges used)
   Top 10 search terms with counts
1b Rating ... / Review count ... / Added in Sept ... / Added in Oct so far ...
1c Description (verbatim) / Website / Appointment link / other links /
   Services (each with price and description) / Address shown or hidden /
   Service area list

## Part 2: GBP changes
For 2a to 2d: before → after, and Google's message after saving
2e What the public profile shows now

## Part 3: Search Console
3a One block per URL: headline / Page indexing / Last crawl /
   User-declared canonical / Google-selected canonical / Request indexing result
3b Indexed N, Not indexed N; every reason with its count and URLs
3c Sitemap status, Last read, Discovered pages (or what happened on submit)

## Part 4: Windsor
Search Console / GBP / GA4: connected or not, the name shown, any error or price

## Part 5: GA4 (Sep 7 to Oct 4, 2026)
Table: event, event count, total users. Property total users.

## Part 6: Bing Webmaster
What it showed, or what the import did, or "skipped" and why

## Part 7: mikeyscrm
Mikey's answer, and what was done

## Part 8: Prompt panel
One table per engine: # | score (1/0/n/a) | what it said about him | sources
Totals per engine. Assumed location per engine.

## Anything that stopped you
Every stop, with the exact message on screen
```
