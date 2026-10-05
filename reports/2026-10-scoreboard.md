# October 2026 scoreboard

Pulled 2026-10-05 (due Oct 1). Sources: Windsor.ai (GBP, Search Console, GA4),
Semrush (US database), and one engine of the AI prompt panel. GROWTH-PLAN.md §2
defines the five numbers; §6 defines the panel.

## Summary

| # | Metric | October reading |
|---|---|---|
| M1 | GBP: searches, calls, directions, website clicks | **blank**: Google Business Profile isn't connected to Windsor |
| M2 | Search Console 28-day impressions, clicks, avg. position | **blank**: Search Console isn't connected to Windsor |
| M3 | Quote-calculator starts → completions | **blank**: GA4 isn't connected to Windsor |
| M4 | Review count + reviews added this month | **blank** (GBP not connected). The site says 5.0 across 41; this month's adds are unknown |
| M5 | AI citation rate | **6 of 25 (24%) on 1 engine of 5** (Claude with web search). The other 4 engines are Mikey's to run |

The only connected Windsor source is Google Ads (account 862-091-0274). Nothing
above was estimated: a blank means there was no data.

**Semrush, as a stand-in for M2 until Search Console is connected:** 78 organic
keywords, about 22 visits a month estimated. 1 keyword in the top 3 (the brand
name), 0 at 4–10, 4 at 11–20, 17 at 21–30. Only 2 keywords sit at positions 5–15,
both on the how-long page. The city pages sit at 22–35 for their main terms.

**The 3 edits made this month (shipped in the same PR as this report):**

1. **Everett** (`/everett/`): biggest local volume on the site, about 990
   searches a month across six "car/mobile/auto detailing everett" phrases
   ranked 22–35. Title and H1 now say *Mobile Car Detailing* Everett, WA. The
   meta now leads with "Car detailing in Everett, WA". The FAQ schema had 1 of
   the 3 visible questions; now it has all 3.
2. **How-long page** (`/how-long-does-car-detailing-take/`): the only page in
   the 5–15 band (13, 15, 17, 18). The bigger phrasings sit at 48–53: "how long
   does it take to detail a car" (880 a month) and "how long does car detailing
   take" (390). The H1 now uses the 880 phrasing; the title keeps the 390 one;
   the meta answers the question up front. New internal links come from the
   Everett, Mukilteo and Arlington FAQs, all with the anchor text "how long car
   detailing takes" (only 5 pages linked to it before). Also fixed a facts error in its
   schema: paint correction said 4–6 / 8–12 hours, while the facts table says
   6–8 hours / 1–2 days.
3. **Bothell** (`/bothell/`): ranks 27–30 for three phrases with keyword
   difficulty 0–4, the cheapest to move on the site. Same title/H1/meta change
   as Everett. Its og:description said "We"; it's first person now. The FAQ
   schema had drifted from the visible answers on 4 of 5; it now matches word
   for word. The apartment answer now says he needs a spigot and an outlet
   (Everett's already did).

The titles now read `Mobile Car Detailing <City>, WA | Mikey's Mobile Detailing`,
one word off the CLAUDE.md pattern. That's deliberate: "car detailing <town> wa"
is the bigger search in every town Semrush has data for, and the new title
contains both phrasings. If Everett and Bothell move by the November pull, roll
it to the other city pages. If they don't, put it back.

**What Mikey has to do by hand:**

1. **Connect GBP, Search Console and GA4 to Windsor.** Each is one Google sign-in:
   - GBP: https://onboard.windsor.ai/connect?connector=google_my_business&next=/google_my_business/authorize
   - Search Console: https://onboard.windsor.ai/connect?connector=searchconsole&next=/searchconsole/authorize
     (pick the Google account that owns the Search Console property, tick the
     Search Console permission, select the site before clicking Finish)
   - GA4: https://onboard.windsor.ai/connect?connector=googleanalytics4&next=/googleanalytics4/authorize
     (same steps, tick Google Analytics, select the GA4 property)

   Until then M1–M4 can't be filled in from a session. You can also read them
   straight off GBP → Performance, Search Console → Performance (28 days) and GA4.
2. **Run the other 4 engines of the prompt panel**: ChatGPT, Perplexity, Gemini,
   Google AI Overviews, logged out or in a temporary chat. Same 25 prompts,
   score 1 if he's named, and note the cited sources. The table below has an
   empty column for each.
3. **Ask Google to re-crawl the city pages.** The AI answers quoted *old* prices
   and times: Interior $160+/$200+, Full $260+/$299+, "3-4 hours", "38+
   reviews". None of those is on the live site any more (checked 2026-10-05),
   so they come from stale copies in the index. In Search Console → URL
   Inspection, request indexing for `/`, `/mill-creek/`, `/marysville/`,
   `/snohomish/` and `/ceramic-coating-snohomish-county/` first.
4. **Get on Yelp properly.** Yelp came back on 8 of the 25 prompts and is #3 on
   the "mobile detailing everett wa" results page. It's the most-cited
   third-party source in this panel.

Semrush cost about 3,880 API units this run (the keyword-gap report alone was
2,400). Next month, skip the gap report unless there's a reason to rerun it.

---

## Raw tables

### Semrush domain overview (US, 2026-10-05)

| Field | Value |
|---|---|
| Semrush rank | 6,598,829 |
| Organic keywords | 78 |
| Positions 1–3 | 1 |
| Positions 4–10 | 0 |
| Positions 11–20 | 4 |
| Positions 21–30 | 17 |
| Est. organic traffic | 22 / month |
| Keywords with a local pack on the SERP | 46 |
| Keywords with an AI Overview on the SERP | 19 |

### Positions 5–15 (one edit from page one)

| Keyword | Pos | Vol | KD | URL |
|---|---|---|---|---|
| how long do car details take | 13 | 40 | 6 | /how-long-does-car-detailing-take/ |
| how long does car detail take | 15 | 110 | 14 | /how-long-does-car-detailing-take/ |

Just outside the band: "mickey auto detail" 17 (40, misspelled brand),
"how long does auto detailing take" 18 (40).

### Positions 16–35, the city-page tier

| Keyword | Pos | Vol | KD | URL |
|---|---|---|---|---|
| car detailing everett wa | 22 | 260 | 21 | /everett/ |
| mikeys car wash | 23 | 70 | 31 | /services/ |
| monroe detailing | 25 | 70 | 17 | /monroe/ |
| car detailing marysville wa | 25 | 90 | 43 | /marysville/ |
| monroe auto detailing | 26 | 70 | 12 | /monroe/ |
| mobile detailing everett wa | 26 | 210 | 25 | /everett/ |
| smokey point car wash | 27 | 40 | 19 | /marysville/ |
| car detailing bothell wa | 27 | 70 | 0 | /bothell/ |
| car detailing everett | 27 | 170 | 21 | /everett/ |
| car detailing bothell | 29 | 90 | 0 | /bothell/ |
| auto detailing bothell | 30 | 50 | 4 | /bothell/ |
| auto detailing in marysville wa | 30 | 70 | 32 | /marysville/ |
| ceramic coating everett | 30 | 110 | 4 | /ceramic-coating-snohomish-county/ |
| auto detailing everett | 34 | 170 | 39 | /everett/ |
| auto detailing everett wa | 35 | 110 | 37 | /everett/ |

### All 78 organic keywords, condensed

Brand and name-collision terms (mikeys mobile detailing 1, mike's detailing 49,
mike's auto detail 58, moxie/wicked/jamie's/blk luxe detailing 39–61, and so on)
make up about half the list and aren't worth chasing. The how-long page holds 13
of the informational terms, from position 13 up to 54: "how long does it take to
detail a car" 52 (880), "how long does detailing a car take" 53 (480), "how long
does car detailing take" 48 (390), "how long does a car detail take" 48 (260).
Other notable ones: semi detailing near me 52 (110, truck page), ceramic coating
keystone 58, car detailing sammamish 63 (homepage; Sammamish isn't served).

### Best position per served town ("mobile / car / auto detailing <town>")

| Town | Best position | Keyword | Page |
|---|---|---|---|
| Snohomish | not in Semrush's top 100 | | /snohomish/ ranks only for "mike's detail(ing)" brand collisions, 49–59 |
| Lake Stevens | not in top 100 | | |
| Everett | **22** | car detailing everett wa (260) | /everett/ |
| Monroe | **25** | monroe detailing (70) | /monroe/ |
| Mill Creek | not in top 100 | | |
| Marysville | **25** | car detailing marysville wa (90) | /marysville/ |
| Bothell | **27** | car detailing bothell wa (70) | /bothell/ |
| Duvall | not in top 100 | | |
| Mukilteo | not in top 100 | | |
| Woodinville | not in top 100 | | page went live 2026-10-02, too new |
| Granite Falls | n/a | | page parked until November |
| Arlington | not in top 100 | | page went live 2026-10-02, too new |

"Not in top 100" means Semrush doesn't see a ranking, which also happens when it
doesn't track a small-town phrase at all. Search Console is the real answer;
connect it.

### Competitors

Semrush's own competitor report is noise: the top five are other businesses
named Mikey (mikeysmobiledetail.com, mikeysmobiledetailing.com, mikeysdetail.com,
mikeysdetailingtx.com) sharing 1 keyword each. So the real competitors come from
the live results page for "mobile detailing everett wa" (210 a month):

| Pos | Domain |
|---|---|
| 1 | slideinmobiledetail.com |
| 2 | bigsmobile.com (/car-detailing-everett-wa/) |
| 3 | yelp.com (Everett auto detailing search) |
| 4 | alexmobilecardetailing.com |
| 5 | creampuffmobiledetailing.com |
| 6 | everettcardetailing.com |
| 7 | pandahub.com (/car-detailing/everett-wa) |
| 8–10 | Instagram (Slide In), a Facebook group post |

Top three business sites: **slideinmobiledetail.com, bigsmobile.com,
alexmobilecardetailing.com.** Keywords they rank for and we don't (top 30 by
volume, US):

| Keyword | Slide In | Big's | Alex | Vol | KD |
|---|---|---|---|---|---|
| detailing car detailing | | | 66 | 33,100 | 48 |
| how to freshen car interior | | 9 | | 33,100 | 24 |
| clean the interior of a car | | 60 | | 22,200 | 55 |
| car detail near me | | | 92 | 14,800 | 42 |
| car detailers near me | | | 82 | 14,800 | 44 |
| mobile auto detailing near me | | | 88 | 12,100 | 27 |
| mobile detailing | | 72 | | 12,100 | 48 |
| paint correction | | 11 | | 12,100 | 18 |
| correct paint | | 21 | | 8,100 | 32 |
| how to clean headlights | | 37 | | 6,600 | 14 |
| affordable car cleaning | | | 71 | 5,400 | 23 |
| auto detail near me | | | 91 | 5,400 | 43 |
| car interior detailing | | 86 | | 5,400 | 36 |
| car paintwork touch up | | 44 | | 5,400 | 57 |
| wash leather car seats | | 57 | | 5,400 | 41 |
| auto detailers near me | | | 65 | 4,400 | 32 |
| best car detailing near me | | | 81 | 4,400 | 27 |
| car detail close to me | | | 70 | 4,400 | 41 |
| car detailer | | | 87 | 4,400 | 43 |
| detail shop near me | | | 71 | 4,400 | 30 |
| how to buff scratches off a car | | 35 | | 4,400 | 25 |
| touch up paint car | | 31 | | 4,400 | 48 |
| auto detailing services near me | | | 74 | 3,600 | 30 |
| best glass cleaner | | 46 | | 3,600 | 32 |
| clay bar car | | 44 | | 3,600 | 25 |
| hand car cleaning near me | | | 84 | 3,600 | 39 |
| how to clean inside of windshield | | 53 | | 3,600 | 23 |
| how to fix scratches on car | | 36 | | 3,600 | 35 |
| mobile car wax service | | 16 | | 3,600 | 24 |
| best auto detailing near me | | | 56 | 2,900 | 36 |

What that says: Big's wins with how-to blog posts (freshen an interior,
paint correction, scratches, headlights). That's the answer-layer content in
GROWTH-PLAN Phase 3, and it's a new-page job for a later month. Alex's "near
me" rankings are 56–92, so nobody owns those terms organically; that's the Map
Pack's job. Slide In ranks for nothing we don't. It wins Everett on a local
homepage plus Instagram.

### M5 prompt panel: 1 engine of 5

Run 2026-10-05 by Claude with web search (US). Score 1 only if the answer
names Mikey's Mobile Detailing or mikeysdetailing.com. "Site in results" means
one of his pages came back in the search results, whether or not the answer
used it. The ChatGPT, Perplexity, Gemini and AI Overviews columns are blank on
purpose: Mikey runs those logged out.

| # | Prompt | Claude | Site in results | What it said about him | Sources that came back | ChatGPT | Perplexity | Gemini | AI Ovw |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Best mobile car detailing in Snohomish WA | **1** | / | "5.0 stars with **40** reviews and 300+ cars" | yelp, bbb, freshchalk, burdysautodetail, mikeysdetailing.com, royaldetailllc, thedetailbuff | | | | |
| 2 | Mobile detailing near me Snohomish County | 0 | no | | yelp (Finest Mobile), detail.com, aestheticautosalon, thedetailbuff, goldenhourmobiledetailing, primetouchauto, finestmobiledetailing425, prodetailwash | | | | |
| 3 | Who does mobile car detailing in Lake Stevens WA | **1** | /lake-stevens/ | "one-man mobile detailing operation", phone right | facebook, yelp, thedetailbuff, mvpautodetailservices, alexmobilecardetailing, lakestevensautodetailing, schmittsmobiledetailing, a1autodetailing.online | | | | |
| 4 | Mobile car detailer Everett Washington | 0 | no | | alexmobilecardetailing, lmcardetailing, mvpautodetailservices, everettcardetailing, creampuffmobiledetailing, pandahub | | | | |
| 5 | Best car detailing Monroe WA | 0 | no | | yelp (x5), mvpautodetailservices, autodetailplusllc, fxproautosalon | | | | |
| 6 | Mobile detailing Mill Creek WA | **1** | /mill-creek/ | **stale**: "Interior $160+, Exterior $130+, Full $260+", "38+ reviews" | nextdoor, yelp (Big's, Custom Automotive), wailesdetail, lmcardetailing, aestheticautosalon, sosmobiledetailing, richdetailing, mikeysdetailing.com | | | | |
| 7 | Car detailing that comes to you Marysville WA | **1** | /marysville/ | **stale**: "3-4 hours", "Interior $200+, Exterior $160+, Full $299+"; guarantee quoted | yelp (DSG), thedetailbuff, trcardetailing, lmcardetailing, evolutionwax, dsgautodetail, blackliondetailing, mikeysdetailing.com, a1autodetailing.online, pandahub | | | | |
| 8 | Mobile auto detailing Bothell WA | 0 | no | | facebook, losjefesdetail, sumacccarwash, aestheticautosalon, lmcardetailing, detaildudesnw, scrubbrosdetailing, dhillonsmobiledetailing, a1autodetailing.online, pandahub | | | | |
| 9 | Ceramic coating Snohomish County | **1** | /ceramic-coating-snohomish-county/ | "38+ five-star reviews" (stale); lists 6 towns | ceramicpro.com, apcautospa, mikeysdetailing.com, c2detailing, bluestarautosalon, lmcardetailing | | | | |
| 10 | Paint correction near Everett WA | 0 | no | | alpineautodetailing, everettcardetailing, dunnsautodetailsalon, specterdetail, mvpautodetailservices, amplifiedreflections, lmcardetailing | | | | |
| 11 | Pet hair removal car detailing Washington | 0 | no | | deltasoniccarwash, sharpdetail (DC), wadetail, mendezautodetailing, dereksdetail | | | | |
| 12 | Interior car detailing Snohomish WA | **1** | / | **stale**: "Interior starts at $200" | apcautospa, nationaldetailpros, dunnsautodetailsalon, c2detailing, thedetailbuff, mikeysdetailing.com, lakestevensautodetailing, royalautocarewa | | | | |
| 13 | Truck detailing Snohomish County | 0 | /car-detailing-cost-snohomish-county/ | not named | bbb, apcautospa, sudsautosalon, henrysautodetail, nationaldetailpros, mikeysdetailing.com, lakestevensautodetailing | | | | |
| 14 | Mobile detailing for apartment dwellers Seattle area | 0 | no | | sudsautosalon, wadetail, bryanzautodetailing, mobiledetailingexpert, aestheticautosalon, seattledetails, bigsmobile, sudbrosdetails | | | | |
| 15 | Boat/RV detailing Snohomish County | 0 | no | | trcardetailing, seaandrvmobiledetailing, cleanimagerv, prodetailwash, yelp | | | | |
| 16 | How much does mobile car detailing cost in the Seattle area | 0 | no | | yelp costs, groupon, mrdetailseattle, seattlemobiledetailing, sudbrosdetails, royalcardetailingseattle, pandahub (x2) | | | | |
| 17 | Is mobile detailing worth it vs a car wash | 0 | no | | lookingoodauto, dennisautodetails, mobigleam, apcdetailingllc, cvautospa, vibrantmobiledetail and others (none local) | | | | |
| 18 | How long does a full car detail take | 0 | no | | brilliatech, fortworthautodetail, hogwashcarwash, quincycardetailing, nicksautodetail, lmcardetailing, hugosdetails | | | | |
| 19 | Best time of year to detail a car in Washington | 0 | /best-time-to-detail-car-washington/ | **his page shaped the answer** (April-May and Sept-Oct, "smartest detail of the year for PNW drivers") but didn't name him | detailingfinder, mikeysdetailing.com, bigsmobile, revolutionautosalon, blissautodetailing | | | | |
| 20 | Is ceramic coating worth it in the Pacific Northwest | 0 | no | | autospa360, peakdetailwash, seattleautodetailandtint, blissautodetailing, mycaliforniatint, finaltouchautospa | | | | |
| 21 | How often should I detail my car in a rainy climate | 0 | no | | gilroyblackout, detailerreview, detailingfinder, mobiledetailingexpert and others (none local) | | | | |
| 22 | Mobile detailing vs drive-through car wash which is better | 0 | no | | cleanzsdetailing, robsautodetailaz, dennisautodetails, phenomenaldetailing and others (none local) | | | | |
| 23 | What should I look for in a mobile detailer | 0 | no | says a real mobile detailer "should bring their own water, power" and to ask about insurance | topstardetailing, vision-detailing, famousdetailing, birdsdetail, fresh-layer, pandahub | | | | |
| 24 | Cheapest vs best car detailing Snohomish County | 0 | / and /car-detailing-cost-snohomish-county/ | quoted **Clean Club $125** and "saves 30-50%" from his cost page, without naming him | yelp (x3), yellowpages, mechanicadvisor, mikeysdetailing.com (x2), dunnsautodetailsalon, royalautocarewa | | | | |
| 25 | Mobile detailer that takes card and comes to your driveway WA | 0 | no | | dsgautodetail, detailstart, eastvancouvermobiledetailing, milesmobiledetailing, mobigleam, felixdetailing | | | | |
| | **Total** | **6 / 25** | 9 / 25 | | | | | | | |

**Read-outs from the source column:**

- **Yelp** came back on 8 prompts (1, 2, 5, 6, 7, 15, 16, 24) and
  ranks #3 on the Everett results page. It's the top third-party source.
- **The directory-style sites that keep coming back**: lmcardetailing.com (7
  prompts, a site with a page per town), pandahub.com (5, a marketplace with
  per-city pages), aestheticautosalon.com and a1autodetailing.online (per-town
  pages). Their per-town pages are what the engine reaches for on town prompts.
  Mikey already has those for 11 towns; the gap is that they rank 22+.
- **He's named on town prompts and invisible on question prompts.** 6 of 15
  local prompts name him, 0 of 10 research and comparison prompts do, even
  where his page was used (19 and 24). Question pages that sign the answer in
  first person, "I'm Mikey, I've detailed 300+ cars in Snohomish County", give
  the engine a name to repeat.
- **Prompt 23 works against him.** The answer tells people a real mobile
  detailer brings his own water and power. Mikey asks the customer for both. A
  short "why I use your spigot" answer on the site would be the counter-source.
- **Insurance** comes up as a top thing to check (23). It's still unconfirmed in
  CLAUDE.md, so nothing was written.
