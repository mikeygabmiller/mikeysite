# October 2026 scoreboard

Pulled 2026-10-05 (due Oct 1). Sources: Windsor.ai (GBP, Search Console, GA4),
Semrush (US database), and one engine of the AI prompt panel. GROWTH-PLAN.md §2
defines the five numbers; §6 defines the panel. **M2 added 2026-10-08** from
Search Console itself, pulled by hand on 2026-10-07 (see
[Search Console](#search-console-added-2026-10-08) below).

## Summary

| # | Metric | October reading |
|---|---|---|
| M1 | GBP: searches, calls, directions, website clicks | **September: 589 profile views, 31 interactions, 7 calls, 23 website clicks** (directions not reported). Read by Muse 2026-10-08 |
| M2 | Search Console 28-day impressions, clicks, avg. position | **46 clicks, 2,681 impressions, 1.7% CTR, avg. position 13.1** (Sep 7 to Oct 4, web search). Pulled by hand; still not on Windsor |
| M3 | Quote-calculator starts → completions | **45 started → 28 saw a price → 11 sent it → 1 booked a time** (users, Sep 7 to Oct 4; online booking only went live Sep 29). Read by Muse 2026-10-08 |
| M4 | Review count + reviews added this month | **5.0 across 39** on the public profile (2026-10-08). The site said 41; it says 39 now. This month's adds weren't counted |
| M5 | AI citation rate | **6 of 25 (24%) on 1 engine of 5** (Claude with web search). The other 4 engines are Mikey's to run |

The only connected Windsor source is Google Ads (account 862-091-0274). Nothing
above was estimated: a blank means there was no data.

**Semrush, written before Search Console came in (it got the small towns and
the traffic wrong, see below):** 78 organic
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

*Added 2026-10-08, ahead of the list below* ((a) is done: deployed that
day, with the old quote widget and MyQqc): (a) deploy the blog redirect,
because the old Lake Stevens post is on page one quoting $130/$160/$260
(Search Console finding 3); (b) the GBP fixes in `reports/2026-10-07-aeo.md`,
and in the same sitting switch the profile's `http://` links to `https://`
(finding 2); (c) the indexing brief at the end of the Search Console section.

1. **Connect GBP, Search Console and GA4 to Windsor.** Each is one Google sign-in:
   - GBP: https://onboard.windsor.ai/connect?connector=google_my_business&next=/google_my_business/authorize
   - Search Console: https://onboard.windsor.ai/connect?connector=searchconsole&next=/searchconsole/authorize
     (pick the Google account that owns the Search Console property, tick the
     Search Console permission, select the site before clicking Finish)
   - GA4: https://onboard.windsor.ai/connect?connector=googleanalytics4&next=/googleanalytics4/authorize
     (same steps, tick Google Analytics, select the GA4 property)

   Until then M1–M4 can't be filled in from a session. You can also read them
   straight off GBP → Performance, Search Console → Performance (28 days) and GA4.
   (2026-10-08: Windsor's free plan allows one source, and Google Ads holds
   it, so this needs either swapping that slot or a paid plan; Mikey's call.
   Checked 2026-10-08: Windsor still has only Google Ads. M2 was pulled by hand
   instead, which took a browser agent and Search Console's Sheets export because
   its table wouldn't show more than 10 rows. Connected, it's a one-minute pull.)
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
   **Done 2026-10-07:** all five came back "Indexing requested", no quota message.
4. **Get on Yelp properly.** Yelp came back on 8 of the 25 prompts and is #3 on
   the "mobile detailing everett wa" results page. It's the most-cited
   third-party source in this panel.

Semrush cost about 3,880 API units this run (the keyword-gap report alone was
2,400). Next month, skip the gap report unless there's a reason to rerun it.

## Muse's run, 2026-10-08 (brief: `reports/2026-10-08-muse-brief.md`)

**Business Profile, changed** (all showed "pending review", up to a day):

- **Services.** Out: "Auto detailing, from $200" ("Full interior/exterior
  detail starting at just $200"), "Car waxing from $10" ($10 / $30 / $50),
  "Clay bar treatment $25", "Engine detailing $40". None of those is in
  `PRICING.md`. In: Exterior from $199, Interior from $249, Full from $369,
  Paint Correction from $400, Ceramic Coating from $500, with the
  `outreach/DIRECTORIES.md` descriptions. Google's unpriced suggestions stayed.
- **Description.** The old one was agency voice ("We offer a comprehensive
  range...", "experience the difference!"); now the 489-character block.
- **Links.** Website and appointment link went from `http://` to `https://`,
  tags unchanged.
- **Address** hidden ("No location; deliveries and home services only").
- **Service area** went from **3 places** (Monroe, Everett, Snohomish) to the
  twelve towns. Google says the service area isn't a ranking factor, but it is
  what the profile tells people (and the engines that read it) about where he
  works, and it named three of twelve.

**Search Console: the six pages were never found.** All six say "URL is not on
Google" / "URL is unknown to Google", no last crawl. And **`sitemap.xml` had
never been submitted** (0 sitemaps). Both were done on 2026-10-08: indexing
requested for all six, sitemap submitted (first status "Couldn't fetch", which
is normal for a minute-old submission; the file serves 200 as XML to
Googlebot's user agent, checked that day). Recheck around Oct 15: if the six
are still unknown, they need links from pages Google already crawls.

**Funnel (M3), read plainly.** Of 45 people who started the calculator, 28
reached a price (62%) and 11 of those sent it (39%). One used "Pick my time" in
the six days it existed in this window. The month to watch is October.

**Not done (cut from the brief):** the 4-engine prompt panel, Bing Webmaster,
the mikeyscrm decision. Windsor stays Google Ads only (free plan, one source).

---

## Search Console (added 2026-10-08)

Pulled by hand on 2026-10-07 from the only property on the account,
`sc-domain:mikeysdetailing.com` (a Domain property, so it also counts the
`blog.` and `carcheck.` subdomains), search type Web. The tables came from
Search Console's own export to Google Sheets ("mikeysdetailing.com-Performance-on-Search-2026-10-07",
in Mikey's Drive), cross-checked against the screen. Raw tables are at the
bottom of this file.

| Window | Clicks | Impressions | CTR | Avg. position |
|---|---|---|---|---|
| Last 28 days (Sep 7 to Oct 4) | 46 | 2,681 | 1.7% | 13.1 |
| Last 3 months | 163 | 9,558 | 1.7% | 14.7 |

The 28 days ran about 10% under the 3-month pace (a 28-day share of the 3
months is about 51 clicks and 2,970 impressions) at a better position (13.1
against 14.7). That's within normal wobble; nothing to read into it yet. The
28-day window ends the day before the October 5 edits, so it's a clean
before-picture for November.

### What it says

1. **The Business Profile sends the most clicks.** By page, 65 of the clicks
   landed on addresses only the profile uses: 28 on
   `http://mikeysdetailing.com/?utm_source=google&...&utm_content=website_button`
   (the profile's Website button, by its own tags), 32 on
   `http://mikeysdetailing.com/` and 5 on `http://mikeysdetailing.com/#booking`.
   The site never shows Google an `http://` address (every one redirects to
   `https://` and every canonical says `https://`, checked 2026-10-08), and
   those rows sit at position 1 for "mobile detailing", "car detailing" and
   "car detailing snohomish", which is how Search Console counts the map pack.
   City pages brought 63, the `https://` homepage 20, service and guide pages
   19. (Page rows add to 168, not 163: Search Console counts by page a little
   differently from the total.) So the GBP fixes in `reports/2026-10-07-aeo.md`
   are worth more than another round of copy.
2. **The profile's links say `http://`.** It costs one redirect per tap (about
   a tenth of a second on a phone) and splits the homepage into three rows
   here. Not urgent, but while he's in the profile for the "from $200" fix,
   change every link that starts `http://mikeysdetailing.com` to `https://`,
   keeping everything after the domain exactly as it is (the `utm_` tags are
   how the dashboard knows a lead came from the profile).
3. **The old blog is on page one with the old prices.**
   `blog.mikeysdetailing.com/posts/car-detailing-lake-stevens-wa` had 76
   impressions at position 10.0. Checked 2026-10-08: it still loads, quoting
   $130, $160 and $260. The redirect in `tools/blog-redirect/` (2 minutes,
   steps in the AEO report) turns that ranking into a 301 to the real site.
   Nothing else in this pull is doing visible harm.
4. **Six pages live since May have had no impressions at all in three
   months:**

   | Page | Live since | Pages linking to it |
   |---|---|---|
   | `/mobile-car-detailing-near-me/` | 2026-05-13 | 2 |
   | `/pet-hair-removal-car-detailing/` | 2026-05-13 | 3 |
   | `/mobile-detailing-vs-car-wash/` | 2026-05-12 | 4 |
   | `/lake-stevens/interior-detail.html` | 2026-05-14 | 2 |
   | `/mill-creek/interior-detail.html` | 2026-05-14 | 2 |
   | `/monroe/ceramic-coating.html` | 2026-05-14 | 3 |

   A page Google doesn't show once in three months is almost always a page it
   hasn't indexed. The near-me page is the plainest case: "mobile car
   detailing near me" had 102 impressions, and Google sent them to Everett,
   the interior page and 11 other addresses, never to the page written for that
   search. (City pages each have 9 or more pages linking to them.) Two of
   these got named answer boxes on 2026-10-07 (near-me and pet
   hair, for panel prompts 2 and 11); that only pays off if they're indexed.
   **Don't rewrite them yet.** URL Inspection says which problem it is (see
   the brief below): "Discovered, currently not indexed" wants more links;
   "Crawled, currently not indexed" or "Duplicate" means Google thinks it
   repeats another page, and the fix is folding it into that page, not adding
   words. Too new to judge: Mukilteo (Sep 23), Mill Creek ceramic (Sep 24),
   Woodinville and Arlington (Oct 2) and the blog (Oct 5). `/polish-test/` has
   none either, but it's a game nobody searches for, and nothing has linked to
   it since its homepage links came out on 2026-09-28.
5. **City pages rank on "near me", not on the town's name.** When Google fills
   in the town, the city pages show at 3 to 9 on "mobile detailing near me" and
   5 to 14 on "car detailing near me". When the searcher types it, only Mill Creek (9.8) and
   Monroe (about 10) are near page one; Everett is 24 to 42, Bothell 32,
   Marysville 36 ("car detailing") and 51 ("auto detailing"). That gap is what
   the Everett and Bothell title test and the directory kit
   (`outreach/DIRECTORIES.md`) are for; copy alone won't take Marysville from
   36 to 10. No city page says "auto detailing" anywhere (checked), but Google
   treats auto and car as the same here, and Monroe ranks 10 on "auto detailing
   monroe wa" without it, so that's not Marysville's problem.
6. **Lots of impressions and almost no clicks means page two, not bad titles.**
   Marysville 962 impressions and 8 clicks (position 15.8), ceramic 946 and 2
   (18.8), how-long 882 and 1 (19.4), Everett 833 and 5 (23.7). Results on
   page two get almost no clicks whatever they say.
7. **Semrush was wrong about the small towns and the traffic.** It had
   Snohomish, Mill Creek, Lake Stevens and Duvall "not in top 100", and 22
   visits a month. Search Console has the homepage at 4.4 for "car detailing
   snohomish", Mill Creek at 9.8, and about 50 clicks a month. It put the
   how-long page at 48 to 53 on the big phrasings; Search Console says 17 to
   38. From now on M2 comes from Search Console. Semrush is for competitors
   only.

### No new edits this round, and why

GROWTH-PLAN §7 says a query at position 5 to 15 is one edit from page one. The
list is below, and **every page on it was edited on October 5, 6 or 7** (the
Everett and Bothell titles, the how-long H1, FAQ questions renamed on every city
and service page, answer boxes on the ceramic and cost pages). A third change in
a week would leave November unable to say which edit did what. So this is the
baseline; judge it in November, then edit.

| Query | Impr. (3 mo) | Position | Page (where the pull had it) |
|---|---|---|---|
| ceramic coating near me | 341 | 12.9 | `/ceramic-coating-snohomish-county/` |
| car detailing mill creek | 75 | 9.8 | `/mill-creek/` |
| water spot removal mill creek | 37 | 15.4 | not pulled |
| car detailing prices | 36 | 9.9 | not pulled |
| car interior cleaning | 35 | 8.1 | not pulled |
| car detailing monroe wa | 35 | 10.3 | not pulled |
| auto detailing monroe wa | 30 | 10.1 | not pulled |
| interior car detailing near me | 29 | 8.3 | not pulled |
| mikeys auto detailing reviews | 24 | 11.3 | not pulled |
| interior car cleaning | 23 | 6.4 | not pulled |

Mill Creek is at 9.8 on its town's name and isn't in the title test. If Everett
and Bothell move by November, it's the first page to roll the title to.

**The title test's before-picture** (3-month averages, nearly all before the
October 5 change; the November comparison should use Search Console's Compare
mode, 28 days before against 28 days after, below):

| Page | Impr. | Clicks | Position | Its queries |
|---|---|---|---|---|
| `/everett/` | 833 | 5 | 23.7 | car detailing everett 30.7 (on this page), mobile detailing everett wa 24.1, mobile car detailing everett 25.2, auto detailing everett wa 40.5, auto detailing everett 42.2 |
| `/bothell/` | 481 | 3 | 19.4 | car detailing bothell 31.7 |
| `/how-long-does-car-detailing-take/` | 882 | 1 | 19.4 | how long does car detailing take 17.0, how long does a car detail take 18.1, how long does it take to detail a car 25.8 (on this page), how long does detailing a car take 27.9, how long does auto detailing take 34.4, how long does it take to detail a car interior 38.1 |

### Best position per town, from Search Console

Only queries in the top 50 by impressions, so a town with none listed may still
rank for something smaller.

| Town | Typed with the town | City page on "mobile / car detailing near me" |
|---|---|---|
| Snohomish | car detailing snohomish **4.4** (homepage; `/snohomish/` is 44.5), auto detailing snohomish **3.6** | 6.0 / 6.8 |
| Lake Stevens | car care near lake stevens wa 37.2; the old blog's Lake Stevens post 10.0 | 4.5 / 7.0 |
| Everett | 24.1 to 42.2 (above) | 8.7 / 12.0 |
| Monroe | auto detailing monroe wa **10.1**, car detailing monroe wa **10.3** | 3.2 / 7.2 |
| Mill Creek | car detailing mill creek **9.8** | 6.0 / 8.2 |
| Marysville | car detailing marysville 36.4, auto detailing marysville 51.4 | 5.1 / 8.2 |
| Bothell | car detailing bothell 31.7 | 8.2 / 14.4 |
| Duvall | none in the top 50 | 4.0 (1 impression) / 5.1 |
| Mukilteo, Woodinville, Arlington | none; no impressions on their pages yet | none |

Google treats the homepage as the Snohomish page (4.4 against 44.5). That's
fine: don't fight it.

### Questions for Mikey

- **RVs.** "rv ceramic coating near me" had 69 impressions at 15.6 and "rv
  detailing near me" 45 at 17.2, on the ceramic page. The site never mentions
  RVs. If you do them, that's worth a section; if you don't, ignore it.
- **Water spots in Mill Creek.** 37 impressions at 15.4. Only the Mill Creek
  paint correction page mentions water spots. If it's a real Mill Creek thing
  (sprinklers, hard water), say so and it becomes a line on the Mill Creek page.

### Next Search Console pass (a brief for Muse, about 15 minutes)

Mikey signs in and types his own password. Read only, except step 1's
"Request indexing" and step 3's submit. Report every status line word for word.

1. **URL Inspection** (search bar at the top, "Inspect any URL") for each of
   the six pages in the table above, as `https://mikeysdetailing.com/...`.
   For each, record: the headline ("URL is on Google" or "URL is not on
   Google"), the **Page indexing** line (for example "Crawled - currently not
   indexed"), and, after expanding Page indexing, **Last crawl**,
   **User-declared canonical** and **Google-selected canonical**. If it says
   "URL is not on Google", click **Request indexing** and record the result.
2. **Indexing → Pages**: the **Indexed** and **Not indexed** counts, and every
   row of "Why pages aren't indexed" (Reason, Pages). Click each reason and
   list the URLs it shows.
3. **Indexing → Sitemaps**: is `https://mikeysdetailing.com/sitemap.xml` in
   "Submitted sitemaps"? Record its Status, Last read and Discovered pages
   (the sitemap has 43). If it isn't there, submit `sitemap.xml` and record
   what Search Console says.
4. **On or after November 4** (Search Console runs 2 to 3 days behind):
   Performance → Date → **Compare** → custom ranges **Sep 7 to Oct 4** against
   **Oct 6 to Nov 2**. Then **+ Add filter → Page → URLs containing** each of
   `/everett/`, `/bothell/`, `/how-long-does-car-detailing-take/`, `/mill-creek/`
   and `/ceramic-coating-snohomish-county/` in turn, and export the Queries
   table each time. If Search Console is on Windsor by then, a session does
   this step instead.

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
doesn't track a small-town phrase at all. Search Console is the real answer,
and it disagrees: see "Best position per town, from Search Console" above.

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

### Search Console, queries (last 3 months, top 50 by impressions)

From the Sheets export, because the "Rows per page" control wouldn't go past
10. The first rows were checked against the screen and matched. Not worth
chasing: "key detailing" and "mobile detailing keystone" (other businesses or
places), "semi detailing near me" (77.9), "mikeys everett" (unclear what
they wanted; 0 clicks).

| Query | Clicks | Impr. | CTR | Position |
|---|---|---|---|---|
| mobile detailing near me | 5 | 527 | 0.95% | 7.42 |
| car detailing near me | 2 | 351 | 0.57% | 8.53 |
| ceramic coating near me | 1 | 341 | 0.29% | 12.88 |
| detailing near me | 2 | 125 | 1.60% | 5.92 |
| auto detailing near me | 2 | 124 | 1.61% | 11.31 |
| mobile detailing | 2 | 110 | 1.82% | 3.13 |
| mobile car detailing near me | 4 | 102 | 3.92% | 10.34 |
| how long does car detailing take | 0 | 97 | 0% | 16.98 |
| car detailing | 0 | 90 | 0% | 3.42 |
| car detailing everett | 0 | 90 | 0% | 31.04 |
| ceramic coating everett | 0 | 86 | 0% | 27.97 |
| how long does it take to detail a car | 0 | 83 | 0% | 25.54 |
| car detailing snohomish | 10 | 78 | 12.82% | 12.41 |
| car detailing mill creek | 1 | 75 | 1.33% | 9.84 |
| rv ceramic coating near me | 0 | 69 | 0% | 15.58 |
| car detailing marysville | 0 | 65 | 0% | 36.74 |
| auto detailing marysville | 0 | 55 | 0% | 51.49 |
| auto detailing | 0 | 52 | 0% | 8.02 |
| how long does detailing a car take | 0 | 51 | 0% | 27.92 |
| key detailing | 0 | 50 | 0% | 63.26 |
| rv detailing near me | 0 | 45 | 0% | 17.18 |
| mobile detailing everett wa | 0 | 45 | 0% | 24.13 |
| mobile car detailing everett | 1 | 41 | 2.44% | 25.2 |
| ceramic coating cost monroe | 0 | 40 | 0% | 27.52 |
| water spot removal mill creek | 0 | 37 | 0% | 15.38 |
| car detailing bothell | 0 | 37 | 0% | 31.73 |
| how long does auto detailing take | 0 | 37 | 0% | 34.41 |
| car detailing prices | 0 | 36 | 0% | 9.92 |
| car interior cleaning | 0 | 35 | 0% | 8.06 |
| mikeys everett | 0 | 35 | 0% | 9.71 |
| car detailing monroe wa | 0 | 35 | 0% | 10.26 |
| how long does it take to detail a car interior | 0 | 34 | 0% | 38.09 |
| auto detailing everett | 0 | 34 | 0% | 42.18 |
| mobile car detailing | 0 | 33 | 0% | 8.7 |
| car care near lake stevens wa | 0 | 31 | 0% | 37.16 |
| auto detailing monroe wa | 3 | 30 | 10% | 10.07 |
| interior car detailing near me | 0 | 29 | 0% | 8.31 |
| how long does a car detail take | 0 | 29 | 0% | 18.07 |
| mobile detailing keystone | 0 | 28 | 0% | 49.25 |
| auto detailing snohomish | 3 | 27 | 11.11% | 3.59 |
| mobile auto detailing near me | 3 | 27 | 11.11% | 6.15 |
| detailing | 0 | 26 | 0% | 7.69 |
| mobile auto detailing | 1 | 25 | 4% | 13.64 |
| car ceramic coating near me | 0 | 25 | 0% | 16.84 |
| mikeys auto detailing reviews | 0 | 24 | 0% | 11.25 |
| semi detailing near me | 0 | 24 | 0% | 77.92 |
| interior car cleaning | 0 | 23 | 0% | 6.39 |
| ceramic coating near me for cars | 0 | 23 | 0% | 19.7 |
| auto detailing everett wa | 0 | 22 | 0% | 40.45 |
| car paint protection services | 0 | 21 | 0% | 21.05 |

### Search Console, pages (last 3 months, all 41 with impressions)

`carcheck.mikeysdetailing.com` is The Buying Buddy, a used-car listing
checker on GitHub Pages, not the detailing site; it's here because the Domain
property counts every subdomain. The `#about`, `#booking` and other `#`
rows are jump links Google showed under the homepage result.

| Page | Clicks | Impr. | CTR | Position |
|---|---|---|---|---|
| `/marysville/` | 8 | 962 | 0.83% | 15.83 |
| `/ceramic-coating-snohomish-county/` | 2 | 946 | 0.21% | 18.75 |
| `/how-long-does-car-detailing-take/` | 1 | 882 | 0.11% | 19.39 |
| `/everett/` | 5 | 833 | 0.60% | 23.67 |
| `/` | 20 | 832 | 2.40% | 13.93 |
| `http://mikeysdetailing.com/` | 32 | 653 | 4.90% | 5.53 |
| `/services/interior.html` | 8 | 634 | 1.26% | 10.78 |
| GBP button (http://...?utm_source=google&...website_button) | 28 | 629 | 4.45% | 5.2 |
| `/snohomish/` | 13 | 607 | 2.14% | 16.65 |
| `/mill-creek/` | 7 | 540 | 1.30% | 11.48 |
| `/bothell/` | 3 | 481 | 0.62% | 19.39 |
| `/car-detailing-cost-snohomish-county/` | 2 | 471 | 0.42% | 8.45 |
| `/monroe/` | 12 | 467 | 2.57% | 10.81 |
| `/lake-stevens/` | 8 | 454 | 1.76% | 16.4 |
| `/duvall/` | 7 | 280 | 2.50% | 11.1 |
| `/reviews/` | 0 | 253 | 0% | 8.7 |
| `/best-time-to-detail-car-washington/` | 0 | 206 | 0% | 5.44 |
| `http://mikeysdetailing.com/#booking` | 5 | 147 | 3.40% | 8.06 |
| `/snohomish/truck-detailing.html` | 1 | 135 | 0.74% | 27.59 |
| `/services/exterior.html` | 2 | 132 | 1.52% | 22.47 |
| `/about/` | 0 | 132 | 0% | 20.45 |
| `/services/` | 2 | 82 | 2.44% | 33.63 |
| `blog.mikeysdetailing.com/posts/car-detailing-lake-stevens-wa` | 0 | 76 | 0% | 9.97 |
| `/#about` | 0 | 66 | 0% | 7.47 |
| `/#allservices` | 0 | 66 | 0% | 7.47 |
| `/#beforeafter` | 0 | 66 | 0% | 7.47 |
| `/#booking` | 0 | 52 | 0% | 7.52 |
| `/#qanda` | 0 | 52 | 0% | 7.52 |
| `/terms/` | 0 | 16 | 0% | 8.19 |
| `/paint-correction-snohomish-county/` | 1 | 15 | 6.67% | 6.8 |
| `/everett/exterior.html` | 0 | 12 | 0% | 32.42 |
| `/privacy-policy/` | 0 | 11 | 0% | 3.1 |
| `/mobile-auto-maintenance/` | 0 | 10 | 0% | 5.3 |
| `/lake-stevens/paint-correction-in-lake-stevens.html` | 0 | 9 | 0% | 6.89 |
| `/sms-opt-in/` | 0 | 9 | 0% | 31 |
| `/#service-area` | 0 | 8 | 0% | 7.12 |
| `blog.mikeysdetailing.com/` | 0 | 8 | 0% | 15.38 |
| `carcheck.mikeysdetailing.com/` | 1 | 7 | 14.29% | 20.43 |
| `/mill-creek/paint-correction-in-mill-creek.html` | 0 | 4 | 0% | 6.25 |
| `/everett/interior.html` | 0 | 2 | 0% | 7.5 |
| `/snohomish/paint-correction.html` | 0 | 2 | 0% | 9 |

### Search Console, query by page (last 3 months, pulled 2026-10-07)

Each page as impressions @ position, biggest first. "GBP button" is
`http://mikeysdetailing.com/?utm_source=google&utm_medium=organic&utm_campaign=google_profile&utm_content=website_button`;
`http:/` and `http:/#booking` are the profile's other two links. Positions came
from the Sheets export, because the per-query Pages view shows none. The pull
listed `/services/interior.html` twice for "detailing near me" with the same
numbers; it's counted once here.

| Query | Pages |
|---|---|
| mobile detailing near me | `GBP button` 136 @ 8.4; `/snohomish/` 110 @ 6; `/marysville/` 85 @ 5.1; `http:/` 72 @ 9.4; `/everett/` 64 @ 8.7; `/bothell/` 43 @ 8.2; `/mill-creek/` 33 @ 6; `/services/exterior.html` 19 @ 15.3; `/lake-stevens/` 8 @ 4.5; `/monroe/` 5 @ 3.2; `http:/#booking` 4 @ 5.8; `/` 2 @ 1; `/services/interior.html` 2 @ 12.5; `/duvall/` 1 @ 4 |
| car detailing near me | `/marysville/` 96 @ 8.2; `/mill-creek/` 52 @ 8.2; `/lake-stevens/` 38 @ 7; `/services/interior.html` 32 @ 7.8; `/everett/` 28 @ 12; `/monroe/` 27 @ 7.2; `/bothell/` 26 @ 14.4; `/duvall/` 14 @ 5.1; `GBP button` 13 @ 10.5; `/snohomish/` 13 @ 6.8; `http:/` 8 @ 11.9; `/best-time-to-detail-car-washington/` 7 @ 2.3; `http:/#booking` 3 @ 1; `/services/exterior.html` 2 @ 19 |
| ceramic coating near me | `/ceramic-coating-snohomish-county/` 341 @ 12.9 |
| detailing near me | `/monroe/` 33 @ 4.8; `/marysville/` 26 @ 5; `/everett/` 25 @ 6.6; `/` 14 @ 73.3; `/snohomish/` 10 @ 3; `/lake-stevens/` 10 @ 5; `/bothell/` 10 @ 7.1; `http:/` 4 @ 25.5; `/best-time-to-detail-car-washington/` 2 @ 4.5; `GBP button` 1 @ 4; `/mill-creek/` 1 @ 4; `/services/interior.html` 1 @ 4 |
| auto detailing near me | `/mill-creek/` 31 @ 9.5; `/everett/` 26 @ 18.4; `/marysville/` 18 @ 13.3; `GBP button` 14 @ 5.3; `/services/interior.html` 12 @ 11.6; `/snohomish/` 7 @ 11.9; `http:/` 6 @ 4.3; `/lake-stevens/` 6 @ 7.5; `/monroe/` 4 @ 7.5; `/services/exterior.html` 3 @ 14.3; `/bothell/` 3 @ 19.7; `http:/#booking` 2 @ 1; `/best-time-to-detail-car-washington/` 2 @ 2.5; `/duvall/` 1 @ 5 |
| mobile detailing | `GBP button` 50 @ 1; `/snohomish/` 30 @ 5.9; `http:/` 25 @ 1.2; `/everett/` 6 @ 7.5; `/bothell/` 4 @ 10.8; `/lake-stevens/` 2 @ 7; `/marysville/` 2 @ 5.5 |
| mobile car detailing near me | `/everett/` 43 @ 14; `/services/interior.html` 16 @ 6.9; `/lake-stevens/` 8 @ 4.5; `/marysville/` 8 @ 8.2; `/mill-creek/` 7 @ 4.7; `/snohomish/` 7 @ 7.3; `/bothell/` 6 @ 14.2; `http:/` 3 @ 7.7; `/duvall/` 2 @ 3.5; `GBP button` 2 @ 19; `http:/#booking` 1 @ 1; `/monroe/` 1 @ 4; `/services/exterior.html` 1 @ 7 |
| how long does car detailing take | `/how-long-does-car-detailing-take/` 97 @ 17 |
| car detailing | `http:/` 39 @ 1.3; `GBP button` 26 @ 1; `/marysville/` 13 @ 8.8; `/duvall/` 3 @ 5; `/monroe/` 3 @ 8.7; `/best-time-to-detail-car-washington/` 2 @ 2.5; `/services/interior.html` 2 @ 6; `/lake-stevens/` 2 @ 11.5; `/bothell/` 2 @ 13 |
| car detailing everett | `/everett/` 86 @ 30.6; `GBP button` 4 @ 39.5 |
| ceramic coating everett | `/ceramic-coating-snohomish-county/` 86 @ 28.1 |
| how long does it take to detail a car | `/how-long-does-car-detailing-take/` 83 @ 25.8 |
| car detailing snohomish | `/` 64 @ 4.4; `http:/` 23 @ 1.1; `GBP button` 13 @ 2; `http:/#booking` 11 @ 2.3; `/snohomish/` 8 @ 44.5; `/#about (and #allservices, #beforeafter, #booking, #qanda, /reviews/, each)` 7 @ 5.7; `/services/interior.html` 5 @ 42.6; `/services/exterior.html` 5 @ 63; `/services/` 5 @ 84.2; `/about/` 4 @ 85.5; `/snohomish/truck-detailing.html` 4 @ 93.8; `/car-detailing-cost-snohomish-county/` 3 @ 55.7; `/#service-area` 2 @ 5 |
| car detailing mill creek | `/mill-creek/` 74 @ 9.9 |
| rv ceramic coating near me | `/ceramic-coating-snohomish-county/` 69 @ 15.6 |
| car detailing marysville | `/marysville/` 64 @ 36.4 |
| auto detailing marysville | `/marysville/` 54 @ 51.4 |
| auto detailing | `GBP button` 32 @ 4.1; `http:/` 14 @ 5.2; `/snohomish/` 4 @ 42.5; `/marysville/` 2 @ 15; `/best-time-to-detail-car-washington/` 1 @ 2; `/monroe/` 1 @ 7; `/bothell/` 1 @ 9; `/mill-creek/` 1 @ 20; `/` 1 @ 74 |
| how long does detailing a car take | `/how-long-does-car-detailing-take/` 51 @ 27.9 |
| key detailing | `/` 12 @ 44.2; `/services/exterior.html` 12 @ 90.6; `/services/interior.html` 9 @ 73.4; `/services/` 7 @ 92.9; `/snohomish/` 5 @ 94; `http:/` 4 @ 5.2; `GBP button` 3 @ 4; `/everett/` 2 @ 65 |
