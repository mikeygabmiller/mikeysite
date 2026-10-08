# Muse brief, 2026-10-08 (short version)

Only the jobs that are quick for a browser agent and a pain to do by hand.
About 20 to 30 minutes, with Mikey at the keyboard for sign-ins. Paste
everything below the line into Muse; its report comes back to a Claude session.

Cut from the first draft (and why) is listed at the bottom of this file, under
the brief.

---

You're helping Mikey of Mikey's Mobile Detailing (mobile car detailing,
Snohomish County, WA) with four short jobs in his own accounts. Mikey is at the
computer. Do them in order. If one gets stuck, report it and go to the next.

## Rules

1. **Mikey types every password, code and passkey.** Never type, save or ask
   for one, and never let the browser save one.
2. **Never pay.** If anything asks for a card, an upgrade or a paid plan, stop
   that part and report the plan and price exactly as shown.
3. **Record before you change.** For every field you edit, write down what it
   said before, word for word.
4. **Copy text exactly** from this brief. Don't rewrite or improve it.
5. **Stop and report** if you see a suspension notice, a request for video
   verification or a postcard code, or "this change needs verification".
6. **Don't touch:** the business name, category, phone, hours, Google posts,
   review replies, photos, or anything not listed here.

## Part 1. Connect three Google sources to Windsor.ai (about 5 minutes)

This lets a Claude session pull Mikey's numbers itself every month, so nobody
has to do this by hand again. Open each link. Sign in to Windsor if asked, then
to Google with the account that owns the property (Mikey types both).

1. Search Console:
   https://onboard.windsor.ai/connect?connector=searchconsole&next=/searchconsole/authorize
   Tick the Search Console permission. Select `sc-domain:mikeysdetailing.com`
   (or however Windsor names the site) before clicking Finish.
2. Google Business Profile:
   https://onboard.windsor.ai/connect?connector=google_my_business&next=/google_my_business/authorize
   Tick the Business Profile permission. Select Mikey's Mobile Detailing.
3. Google Analytics 4:
   https://onboard.windsor.ai/connect?connector=googleanalytics4&next=/googleanalytics4/authorize
   Tick the Analytics permission. Select the mikeysdetailing.com property
   (measurement ID `G-G9WMXW2MF5`).

For each: connected or not, the name Windsor shows, any error. **If Windsor asks
to upgrade or pay, stop Part 1** and report the plan and price word for word.

## Part 2. Fix the Google Business Profile (about 10 minutes)

The profile still tells people a full detail is "From $200". It's $369–$449,
and AI search engines repeat what the profile says.

Search Google for **my business** (or open business.google.com) and pick
Mikey's Mobile Detailing. While you're there, record the **star rating** and
**review count** exactly as shown. Then open **Edit profile**.

**2a. Services.** Record every service listed now, with price and description.
Delete **Auto detailing, From $200** (and anything else priced $200 or under).
Add these five. Price type **From**, the number shown; paste the description.

| Service name | Price | Description |
|---|---|---|
| Exterior Detail | From $199 | Hand wash, decontamination, clay bar, wheels and tires, exterior glass, wax or sealant. Sedan to van. |
| Interior Detail | From $249 | Deep vacuum, steam clean, shampoo, leather cleaned and conditioned, plastics, glass. Sedan to van. |
| Full Detail | From $369 | Interior and exterior together, 3–5 hours. Sedan to van. |
| Paint Correction | From $400 | Machine polish to take out swirls and scratches. 1-step from $400, 2-step from $650. Quoted after I see the paint. |
| Ceramic Coating | From $500 | Tiered, quoted after I see the paint. |

Google's own suggested services with no price can stay.

**2b. Description.** Record the old one, then replace it with exactly this:

```text
I'm Mikey. I've detailed 300+ cars since 2021, and I come to you: your driveway or your work lot in Snohomish, Lake Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite Falls and Arlington. Interior, exterior, full details, paint correction and ceramic coating. Same price in every town, no travel fee. You provide an outdoor spigot and an outlet, I bring the rest. You pay after the work, never a deposit. Exact price in 60 seconds on my site.
```

**2c. Links.** Any link starting `http://mikeysdetailing.com` (website,
appointment or booking link, anything else): change `http` to `https` and
nothing else. Expected results:

- Website: `https://mikeysdetailing.com/?utm_source=google&utm_medium=organic&utm_campaign=google_profile&utm_content=website_button`
- Appointment link: `https://mikeysdetailing.com/#booking`

**2d. Address and service area.**

- Turn **off** showing the business address to customers. (Say "was shown" or
  "was hidden"; **don't write the street address in your report**.)
- Service area: exactly these twelve, as Google suggests them: Snohomish, Lake
  Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo,
  Woodinville, Granite Falls, Arlington. Record what was there, then remove
  everything else. **Lynnwood and Edmonds must not be on it.**

After each save, record Google's message. "Under review" is normal; don't
resubmit.

## Part 3. Search Console: six pages Google isn't showing (about 5 minutes)

Open search.google.com/search-console, property `sc-domain:mikeysdetailing.com`.
In the top search bar ("Inspect any URL"), check each of these:

1. `https://mikeysdetailing.com/mobile-car-detailing-near-me/`
2. `https://mikeysdetailing.com/pet-hair-removal-car-detailing/`
3. `https://mikeysdetailing.com/mobile-detailing-vs-car-wash/`
4. `https://mikeysdetailing.com/lake-stevens/interior-detail.html`
5. `https://mikeysdetailing.com/mill-creek/interior-detail.html`
6. `https://mikeysdetailing.com/monroe/ceramic-coating.html`

For each, record word for word: the headline ("URL is on Google" / "URL is not
on Google"), the **Page indexing** line, and inside it **Last crawl** and
**Google-selected canonical**. If it's not on Google, click **Request
indexing** and record the result (stop requesting if you hit a quota message).

Then **Indexing → Sitemaps**: is `sitemap.xml` listed? Record its Status and
Discovered pages. If it isn't listed, submit `sitemap.xml` and record the result.

## Part 4. Only if Part 1 didn't connect them (about 5 minutes)

- **If the Business Profile didn't connect:** in the profile, open
  **Performance**, set **September 2026**, and record calls, website clicks,
  directions, total interactions and profile views.
- **If Google Analytics didn't connect:** open analytics.google.com, property
  `G-G9WMXW2MF5`, **Reports → Engagement → Events**, custom dates **Sep 7 to
  Oct 4, 2026**. Record Event count and Total users for `qqc_step`,
  `qqc_quote`, `qqc_submission` and `qqc_booking`.

If both connected, skip this part.

## Report back in this shape

```
Part 1 Windsor: Search Console / GBP / GA4: connected or not, name shown, any error or price
Part 2 GBP: rating, review count
  2a services before (verbatim) → after; Google's message
  2b description before (verbatim); Google's message
  2c each link before → after; Google's message
  2d address was shown/hidden; service area before → after; Google's message
Part 3 Search Console: one block per URL (headline / Page indexing / Last crawl /
  Google-selected canonical / Request indexing result); sitemap status
Part 4 (if done): the numbers, with the exact date range
Anything that stopped you: the exact message on screen
```

---

## Cut from the first draft, and why

| Cut | Why | What happens to it |
|---|---|---|
| The AI prompt panel (25 prompts in 4 engines) | About 100 separate chats, an hour or more | Run it on Nov 1 with the monthly scoreboard, one engine at a time if needed |
| GBP August numbers and the top search terms | Nice to have, not needed for a decision | Windsor pulls them if Part 1 connects |
| GA4 and GBP numbers when Windsor connects | A session can pull them itself | Part 4 only runs if Windsor fails |
| Pages report drill-down (every reason, every URL) | Slow clicking; the six URL Inspections answer the real question | Ask for it only if the six don't explain it |
| Bing Webmaster Tools import | Useful, not urgent; one more sign-in | Next Muse run |
| Deleting mikeyscrm.netlify.app | Needs Mikey's decision, not an agent's clicks | Mikey says whether he still uses it |
| The Nov 4 before/after comparison | Its data doesn't exist yet | A session does it if Windsor connects, otherwise the next Muse run |
| Netlify redirects (old blog, old quote widget) and MyQqc | A session can do these | Waiting on Mikey's yes |
