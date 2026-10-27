# R&D track 3: AI answer engines, 2026-10-27

The question: when someone around Snohomish County asks an AI assistant for a
mobile detailer, a price or a detailing how-to, who gets named, what does the
engine read to decide, and what would get Mikey's Mobile Detailing named more?

Everything below comes from a panel run today (28 prompts, four engines, raw
answers in `reports/2026-10-27-rnd-ai-panel/`), the vendors' own documentation,
and the studies that hold up. Search Console, map-pack rankings, competitors and
non-Google platforms are other sessions' lanes and aren't covered here.

## Where he stands today

25 non-branded prompts per engine (10 local picks, 5 price, 6 how-to, 4
comparison). "Named" means the answer names Mikey's Mobile Detailing.

| Engine (logged out) | Named | Local picks | Price | How-to | Compare | Where he ranks when named |
|---|---|---|---|---|---|---|
| ChatGPT | **7 / 25** | 4 / 10 | 3 / 5 | 0 / 6 | 0 / 4 | #1 Snohomish, #1 Mill Creek, #2 Lake Stevens, #2 Woodinville, #1 or #2 on three price prompts |
| Gemini | **5 / 25** | 4 / 10 | 1 / 5 | 0 / 6 | 0 / 4 | #1 Lake Stevens, Mill Creek, Marysville; #4 ceramic. His site was the price source on 3 more without his name |
| Microsoft Copilot | **3 / 25** | 2 / 10 | 1 / 5 | 0 / 6 | 0 / 4 | #1 Snohomish, #4 Lake Stevens, #4 Lake Stevens interior price |
| Claude web search | **3 / 15** run | 1 / 10 | 2 / 5 | not run | not run | #1 on all three, every time with wrong facts from an old copy of his Google profile |
| Perplexity, Google AI Overviews / AI Mode | not reachable | | | | | bot check or "unusual traffic" page from this sandbox |

What that means in plain terms:

1. **He wins his home turf and loses the biggest market.** Snohomish names him
   #1 on three of four engines. **Everett names him on no engine** (0 of 3
   ChatGPT runs, 0 on Gemini, Copilot, Claude). Slide In (862 reviews), Alex's
   (136) and The Detail Buff (441) own it. Bothell, Monroe and paint correction
   near Everett: 0 everywhere.
2. **How-to and comparison answers name nobody local.** 0 of 30 such answers
   (ChatGPT, Gemini, Copilot) named him, and almost none named any Snohomish
   County business at all. GROWTH-PLAN §4 expected answer-first how-to pages to
   get him named here; in October 2026 that isn't how these engines answer a
   how-to. Blog posts still earn Google search traffic; they won't get him
   named by an assistant.
3. **When he is named, a third of the time the facts are a month old.**
   ChatGPT quotes $200–$280 / $160–$240 / $299–$379 for Mill Creek and Lake
   Stevens in every sample (the pages' prices before 2026-09-27). Claude's search
   quotes "from $200, 29 reviews, closed Wednesdays". Gemini says he brings his
   own water and power. None of that is on any live page.
4. **Two engines show his home street address.** Copilot (from Bing's local
   listing) on 5 answers, Claude (from an old copy of his Google profile) on 1.
   The live Google profile hides it.

## The best moves, ranked

Ranked by how often the source showed up in today's answers times how doable it
is. "Mikey" means it needs his sign-in; "session" means a future session can do
it as a site change.

| # | Move | Who | Time | Why (evidence below) |
|---|---|---|---|---|
| 1 | **Claim Bing Places, hide the street address, set the twelve towns** | Mikey | 15 min | Copilot's local picks come from Bing's own listing data ("Bing" is the source on 15 of 28 Copilot answers). It names him only where Bing has him, and shows his street address on 5 answers. Import from Google Business Profile, then switch the address off. `outreach/DIRECTORIES.md` step 2 has the clicks; it's still unchecked there |
| 2 | **Bing Webmaster Tools: import from Search Console, submit the sitemap, inspect and resubmit the stale pages** | Mikey | 10 min | ChatGPT read Mill Creek and Lake Stevens at their pre-2026-09-27 prices in every sample (3 of 3, 2 of 2), and Copilot found no prices on his site at all (B26). Bing's index is what Copilot reads, and reportedly part of what ChatGPT reads. URL Inspection shows what Bing holds. Pages: `/mill-creek/`, `/lake-stevens/`, `/lake-stevens/interior-detail.html`, `/everett/`, `/marysville/`, `/duvall/`, `/bothell/` |
| 3 | **Everett: a named answer box and a price FAQ** | session | 1 hr | Everett is 0 on every engine. The page names "Mikey's Mobile Detailing" only in its title and footer, and its prices sit in a list with no name, no town and no sentence around them. The cost guide, which does have a named answer box, is the page Gemini lifted county prices from. Wait for the Nov 4 title-test read before touching the title |
| 4 | **Get reviews moving again** | Mikey | ongoing | The engines pick on review count. ChatGPT gave Everett to Slide In for "hundreds of reviews" over businesses "with perfect ratings but only a handful of customers" (C25). 8ight's Sept 2026 test: ChatGPT named businesses with under 25 reviews 3.4% of the time, 1,000+ reviews 22.2%; median 175 for named, 97 for not. He has 40, and adds about one a month (`reports/2026-10-27-seo-research.md` §1 has the dashboard fix) |
| 5 | **Put his name inside every price sentence** | session | 1 hr | Gemini used his pages as the county price source 4 times without naming him: its Snohomish County ceramic answer ("$500 to $1,500+", "15% to 25% more" for trucks) is his cost and ceramic pages, word for word, with his name dropped. Engines lift a sentence, not a page, so "Ceramic coating at Mikey's Mobile Detailing in Snohomish County starts at $500" survives where "Ceramic coating $500–$1,500" loses him |
| 6 | **Google's Refresh Outdated Content on his old profile copy** | Mikey | 5 min | Claude's search has only one page of him, an old snapshot of `business.google.com/v/mikeys-mobile-detailing-snohomish/013336338832647006399/a392/_` ("from $200", 29 reviews, closed Wednesdays, street address). The live page says 40 reviews, no address, no prices. The tool is search.google.com/search-console/remove-outdated-content; it takes a URL you don't own. First suggested 2026-10-18 in the scoreboard, still not done |
| 7 | **A water-and-power question, word for word, with his name** | session | 30 min | Gemini told 3 askers he brings his own water and power (L05, P15, B27), Copilot guessed the same (B28), and ChatGPT answered B28 about a different "Mikey's Mobile Detailing" in Elkton, MD. Asked directly, Gemini gets it right from his homepage. A visible FAQ "Does Mikey's Mobile Detailing in Snohomish bring its own water and power?" with the facts table's answer (customer's spigot and outlet; he can bring both only if there's truly none) on the homepage and the city pages |
| 8 | **TopDetailers.com: get listed (free)** | Mikey | 10 min | The "best of" listicle the engines lean on for Everett: ChatGPT cited it on 4 answers, Copilot on 2, mostly to rank Slide In #1 in Everett. Its homepage says "Claim your listing or get added, free" and "Placement can't be bought". He isn't on it. Only the twelve towns, no street address |
| 9 | **Claim the Nextdoor page, then post an up-to-date one** | Mikey | 15 min | Copilot's only third-party source on "Is Mikey's any good?" was his own old Nextdoor posts, quoting 28, 29 and 38 reviews. Already in `reports/2026-10-27-seo-research.md` §7 for search reasons; this is a second reason |
| 10 | **Run this panel monthly, from a real browser for the engines a cloud can't reach** | session + Muse | 30 min | Perplexity and Google's AI surfaces need a person's browser. The scripts are in `reports/2026-10-27-rnd-ai-panel/harness/`. Run each local prompt at least twice (answers change run to run; see the method section) |

**Not worth his time for AI naming (with the evidence):** writing a Reddit
presence (1 Reddit citation in 84 answers here, on a generic water-supply question, and self-promotion breaks
most subreddit rules), YouTube for this (0 citations), more schema (Ahrefs found
no citation lift; below), a bigger `llms.txt` (crawlers barely read it; below).
Keep `llms.txt` and the schema as they are: they cost nothing and are right.

## Evidence

### 1. The panel

**Method** (full detail in `reports/2026-10-27-rnd-ai-panel/README.md`). A
TinyFish cloud Chrome on a US residential IP, logged out everywhere, one fresh
tab per prompt, driven by Playwright from this sandbox. 28 prompts: 10 local
picks, 5 price, 6 how-to, 4 comparison, 3 branded. Raw answers saved as
captured. Run 2026-10-27, about 04:30 to 06:00 UTC.

- **ChatGPT carries context between logged-out chats in the same browser.**
  The dog-hair question came back as an answer about "car detailing in
  Snohomish" because the question before it was about Snohomish prices. Wiping
  chatgpt.com's site data before each prompt fixed it, for 8 prompts, until
  ChatGPT put a "Verify you are human" check in front of the fresh device; the
  run stopped there. The other 20 ChatGPT answers are the first pass; a script
  found carry-over only in H16 (replaced) and C23 (the "what to look for"
  answer opens with the car-wash comparison before it; it still names no
  local business). GROWTH-PLAN §6 says "logged-out / temporary-chat session": that's
  not enough in 2026. It has to be a new private window per prompt.
- **Answers change run to run, so one run is a sample, not a score.** ChatGPT
  named him on L01 and L04 in all 3 samples, on L03 in both, and on L02
  (Everett) in none of 3,
  so the big patterns held. Studies measure the same thing at scale:
  BrightLocal (2026-09-16, 200,875 prompts): 20–33% overlap between repeat
  runs. 8ight.AI (2026-10-05): ChatGPT's named businesses overlapped 29% on a
  repeat 39 minutes later.
- **Not reachable from this sandbox:** Perplexity (Cloudflare verification on
  load), Google AI Overviews and AI Mode (google.com/sorry "unusual traffic"),
  the claude.ai app and the Copilot app (sign-in). The Claude column is the web
  search tool this session has, not the consumer app.

### 2. Where the engines get their answers

Counted from the source pills and cards in the saved answers (ChatGPT and
Gemini show sources as a page title or domain, not a link, so this is a count
of what's shown).

| Engine | What decides a local pick | Sources seen most |
|---|---|---|
| ChatGPT | A places layer: answers carry a map (Mapbox), star ratings and review counts from Google listings ("google.com" pills), then business websites for prices | business websites (his homepage, "See Your Price Now", on 3), TopDetailers (4), BestProsInTown (4), google.com (4), Birdeye, Yellow Pages, Yelp (1) |
| Gemini | Business websites, almost nothing else | his site (12 answers, as "Mobile Car Detailing Snohomish, WA" or mikeysdetailing.com), primetouchauto.com, c2detailing.com, Yelp (2), every competitor's own site |
| Copilot | **Bing's own Places data** ("Bing" as source on 15 of 28) for names, hours, phone and address, then a few websites | Bing Places, Detail.com (3), topdetailers.com (2), pandahub.com (2), Yelp (2), detailerdirectory.com, Reddit (1, a generic water-supply thread), Nextdoor (his own posts) |
| Claude web search | Its own search index, thin on this area | old copy of his Google profile, Northwest.net "audit" pages (12 mentions; a web agency's template pages with made-up price ranges), BBB (9), Yelp (5), Thumbtack, checkbook.org |

Which of those he can honestly show up on, ranked by citations times
doability:

| Source | Cited today | Can he be on it honestly? | Doability |
|---|---|---|---|
| Bing Places | Copilot 15 of 28 | Yes, it's his own listing | 15 min, Mikey |
| His own pages | Gemini 12, ChatGPT 3 | Already is; the gaps are stale copies (move 2) and missing names (moves 3, 5) | session |
| Google Business Profile | ChatGPT's map layer, Claude | Already is; it's right live, an old copy circulates (move 6) | 5 min, Mikey |
| TopDetailers.com | ChatGPT 4, Copilot 2 | Yes, free listing, says it can't be bought | 10 min, Mikey |
| Nextdoor | Copilot 1 (his own posts) | Yes, claim and post as the business | 15 min, Mikey |
| BestProsInTown | ChatGPT 4 | Probably scraped from Google; unknown whether he's listed | check, Mikey |
| Yelp | ChatGPT 1, Gemini 2, Copilot 2, Claude 5 | Already listed (`outreach/DIRECTORIES.md`); can't ask for Yelp reviews (Yelp's rules) | nothing to do now |
| BBB | Claude (9 mentions) | Listing is free to create, accreditation is paid; nothing on BBB was cited for him | low |
| Detail.com, Panda Hub, Thumbtack | Copilot 3, Copilot 2, Claude 2 | These are marketplaces that sell leads to other detailers; joining means working through them | his call, not recommended |
| Northwest.net | Claude 12 | No: a web agency's marketing pages, not a directory | none |
| Reddit, YouTube | Reddit 1 (generic), YouTube 0 | | not for this |

Third-party studies agree with the shape and disagree on the numbers:

- BrightLocal, 2026-09-16, ChatGPT, AI Mode and AI Overviews only: business
  websites 42% of citations, Google Business Profile 28.6% ("by far the most
  important source, especially for AI Mode and AI Overviews"), Yelp 9.5%,
  Facebook 2.2%. ChatGPT "rarely uses GBP and relies more on Yelp and Bing".
  Service-area businesses were mentioned slightly less than storefronts (29.4%
  against 33.6%). (brightlocal.com/research/local-ai-visibility-study/)
- Foundation Marketing and AirOps, published 2026-05-28, Q4 2025 data: among
  six local platforms, Yelp led in AI Mode (72.5% of that set) and Perplexity
  (62.1%); BBB led in ChatGPT; Angi in Gemini. (reported by ppc.land,
  2026-05-30)
- 8ight.AI, 2026-10-05, API runs Sept 10–30, 1,412 ChatGPT and 218 Claude
  answers: Claude cited Yelp in 92.7% of answers, ChatGPT in 0%; ChatGPT leaned
  on BBB (38.7%) and licensing sites (25.1%). Review count predicted being
  named; star rating didn't. The firm sells AI-visibility services. (ppc.land,
  2026-10-06)

Today's run fits the review-count finding (Everett) and the "ChatGPT reads
licensing boards" one points at something he can't use: he isn't licensed, so
there's nothing to list there, and nothing in this report suggests claiming it.

### 3. Wrong information about him, and where each piece comes from

| What an engine said | Engines (prompt) | Where it comes from | Fix |
|---|---|---|---|
| Interior $200–$280, Exterior $160–$240, Full $299–$379 (or "$200 / $160 / $299") | ChatGPT L04 (3 of 3 samples), L03 (2 of 2), P14, P12 first pass | `/mill-creek/` and `/lake-stevens/` before commit af2bb33 (2026-09-27); their meta descriptions said "Interior $200+, Exterior $160+, Full Detail $299+". Live pages are right (checked), sitemap lastmod is current (2026-10-24 and 10-26). It's the engine's old copy | move 2, then IndexNow again |
| "From $200", "29 reviews", "closed Wednesdays" | Claude L01, P11, P15, B26 | an old snapshot of his Google profile page. Live page fetched today: 40 reviews, no prices, open 24 hours, no address | move 6 |
| His street address | Copilot L01, L03, P14, B26, B27; Claude B26 | Bing's local listing (Copilot labels it "Places"); the old Google profile snapshot (Claude) | moves 1 and 6 |
| "Brings his own water and power" / "They likely bring their own water" | Gemini L05, P15, B27; Copilot B28 | Not on any live page (grep of every served page: they all ask for the customer's spigot and outlet). Gemini cites his homepage while saying it, so it's the model assuming what "mobile" means; the retired blog's "I bring water, power" (CLAUDE.md, The blog) may also still be in its memory. Asked directly (B28), Gemini answers correctly | move 7 |
| A different business: "Mikey's Mobile Detailing in Elkton, MD", (410) 996-4898 | ChatGPT B28 | a name collision; that business exists | move 7 helps (his name with "Snohomish" in the answer) |
| "Everett Lux Detailing / Mikey's Detailing" as one entry | Gemini L09 | the model merged two businesses | move 5 |
| 28, 29 and 38 reviews | Copilot B27 | his own older Nextdoor posts | move 9 |
| 39 reviews | ChatGPT L01 (2 of 4 samples; the clean run said "39–40") | his profile showed 39 for a while (`reports/2026-10-07-aeo.md`) | clears on its own |
| "Mold treatment (including work for the Snohomish School District)" | Copilot B27 | his Nextdoor posts, per Copilot | a question for Mikey, below |

**Checked and not found** in any of the 113 saved answers (96 captured, 17 Claude): the old numbers
(425) 232-1355, 360-799-9312 and (360) 797-5831; $130 / $160 / $260 attributed
to him (a $130 shows up once, as a generic Everett range); a 2 to 4 hour full
detail; licensed or insured said about him. Insurance did come up as general
advice ("ask for insurance") on C23 and in Claude's L01; nothing on the site
should answer it.

### 4. What's proven about getting cited, and what isn't

**From the vendors themselves:**

- **Google** (AI features page, last updated 2025-12-10): "There are no
  additional requirements to appear in AI Overviews or AI Mode, nor other
  special optimizations necessary." A page has to be "indexed and eligible to
  be shown in Google Search with a snippet". "You don't need to create new
  machine readable files, AI text files, or markup", and "no special
  schema.org structured data". Both features use "query fan-out", running
  related searches across subtopics. (developers.google.com/search/docs/appearance/ai-features)
- **Google-Extended** (crawlers page, updated 2026-10-15) controls Gemini
  training and grounding in Gemini Apps; it "does not impact a site's
  inclusion in Google Search nor is it used as a ranking signal". It has no
  crawler of its own. (developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- **OpenAI** (bots page, undated): OAI-SearchBot is what puts a site in ChatGPT
  search ("Sites that are opted out of OAI-SearchBot will not be shown in
  ChatGPT search answers"); GPTBot is training; ChatGPT-User is user-initiated
  and "is not used to determine whether content may appear in Search".
  Changes take about 24 hours. Nothing about how it ranks. (developers.openai.com/api/docs/bots)
- **Perplexity** (bots page, undated): PerplexityBot surfaces sites in results
  and isn't used for training; Perplexity-User "generally ignores robots.txt"
  because a person asked. (docs.perplexity.ai/guides/bots)
- **Anthropic** (help center, 2026-04-07): ClaudeBot training, Claude-User for
  a person's question, Claude-SearchBot for search quality.
- **Apple** (support 119829, 2026-09-04): Applebot powers Siri, Spotlight and
  Safari search; Applebot-Extended "does not crawl webpages" and blocking it
  doesn't remove a site from results.
- **IndexNow** (FAQ): Bing, Amazon, Naver, Seznam, Yandex and Yep take it;
  "Submitting a URL does not guarantee immediate indexing." No mention of
  Copilot. (indexnow.org/faq)
- **Bing**: rewrote its Webmaster Guidelines for Copilot in late 2025 (reported
  by Search Engine Journal); NOARCHIVE keeps a page out of Copilot answers, and
  its October 2025 post on AI answers says content is judged in sections, on
  how directly each answers the question. Bing Webmaster Tools has had an "AI
  Performance" report (Copilot citations by page and query) in public preview
  since February 2026, per agency write-ups; I couldn't open Microsoft's own
  page from here. One more reason for move 2: it would show whether Copilot
  cites him at all.

**The robots.txt check:** the live file matches the repo and allows
everything. It names GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Googlebot,
Google-Extended, Bingbot, Applebot, Applebot-Extended, meta-externalagent,
Amazonbot, DuckAssistBot, cohere-ai and three Grok tokens, and its comments
describe each one the way the vendors' pages above do. Requests with the
OAI-SearchBot, PerplexityBot, ClaudeBot, bingbot and GPTBot user agents all
got a 200 and the full page in under half a second (2026-10-27). Nothing to
change. (OAI-AdsBot isn't named; it only visits ad landing pages, and the
wildcard covers it anyway.)

**What the studies say about the popular advice:**

| Claim | Verdict | Evidence |
|---|---|---|
| `llms.txt` gets you cited | **Hype.** Keep the file, don't invest in it | The spec (llmstxt.org, v2, 2026-08-10) claims no engine uses it. Google says no AI text files are needed. Log studies: OtterlyAI, 84 of 62,100 AI-bot visits went to llms.txt (0.1%); EZY.ai, 83 sites, 12 weeks: OpenAI read it 7 times, Perplexity 0. (Both vendors; Ahrefs' June 2026 log study is reported second-hand as 97% of files getting zero requests.) |
| Schema markup gets you cited | **Not shown.** Keep it accurate, don't add more for AI | Google: no special schema needed. Ahrefs (2026, reported second-hand): 1,885 pages that added JSON-LD against 4,000 matched controls, +2.2% ChatGPT and +2.4% AI Mode, within noise. Most AI crawlers read visible text (`reports/2026-10-07-aeo.md`) |
| Fresh content gets cited more | **Real, modest** | Ahrefs, 2025-07-28, 17 million citations: AI-cited URLs averaged 1,064 days old against 1,432 for Google results; ChatGPT leaned newest. Today's stale prices are the flip side: the copy an engine holds matters more than the page you edited |
| Answer-first, self-contained paragraphs | **Supported** for pages the engine already uses | Bing's October 2025 guidance (judged by section). Today: Gemini lifted his numbers sentence by sentence and dropped the name wherever the sentence didn't carry it |
| Brand mentions across the web | **Strongest correlation measured** | Ahrefs, 2025-05-26, 75,000 brands: branded web mentions correlated 0.664 with AI Overview mentions, the strongest factor; branded search 0.392. Correlation, and for sites far bigger than his. Locally the same idea is reviews and listings |
| Review count | **Strong for local** | 8ight.AI (above); Zarla's August 2026 index (1,851 businesses, cited second-hand) put named businesses at a median 444 Google reviews against 192, with ratings about equal |
| Reddit | **Not for this market** | Big in national studies (Profound puts it at 21% of AI Overview sources), but 1 of 84 answers here (a generic thread) and 6 times in 1,630 answers in the 8ight local study |

### 5. Three pages: can an engine lift a self-contained, named answer?

Read from the raw HTML with scripts stripped, the way most AI crawlers see it.

**`/car-detailing-cost-snohomish-county/`: yes.** The first paragraph under
"How much does car detailing cost in Snohomish County?":

> A full mobile detail in Snohomish County runs $369–$449 at Mikey's Mobile
> Detailing, depending on vehicle size. An exterior-only detail is $199–$279
> and an interior-only detail is $249–$329. [...] I'm Mikey, I do every car
> myself, and my quote calculator gives you an exact price in about 60 seconds.

Name, place and price in the first sentence. The weak spot is the sentence
Gemini actually lifted: "Paint correction runs $400–$1,200 and ceramic coating
$500–$1,500" has neither his name nor a place, so it travelled without him
(move 5).

**`/pet-hair-removal-car-detailing/`: yes.** "Yes. I'm Mikey (Mikey's Mobile
Detailing, Snohomish, WA), and I pull pet hair out of cloth seats and carpet in
your driveway [...] It's $50–$80 as an add-on to an interior, or $120–$220 on
its own for heavy hair." Self-contained, named, placed, priced. It still didn't
get him named on H16 (dog hair), because none of the engines answered that
how-to with a business at all.

**`/everett/`: no.** The visible page names "Mikey's Mobile Detailing" twice:
the title and the footer. The prices ($369-$449, $249-$329, $199-$279) are
three bare figures in a list. The intro paragraphs are good and specific
(Port Gardner salt film, Boeing shift hours, BNSF rail dust) and say "I'm
Mikey, I come to you", but no paragraph has the business name, Everett and a
price together, and there's no Everett price question. That matches Everett
being 0 on every engine (move 3).

## Questions for Mikey

1. **Bing Places:** have you ever claimed it? Copilot shows your street address
   from it. Can you sign in and import from Google this week (move 1)?
2. **Bing Webmaster Tools:** OK to do the 10-minute import from Search Console
   (move 2)? It's the one way to see what Bing and Copilot hold for your pages.
3. **Nextdoor:** Copilot read your Nextdoor posts as saying you did mold work
   for the Snohomish School District. Is that true? If it isn't, which post says
   it, so it can be edited?
4. **TopDetailers.com:** OK to get listed there (free), with the twelve towns
   and no street address?
5. **Google's Refresh Outdated Content tool** for your old profile copy: will you
   submit the URL in move 6, or should Muse do it with you signed in?
6. **Everett page:** OK for a session to add a named answer box and an "How much
   does mobile detailing cost in Everett?" question after the November 4 title
   read?
