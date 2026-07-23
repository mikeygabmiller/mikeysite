# Homepage Section-Order Analysis — mikeysdetailing.com

**Prepared:** 2026-07-23 · **Scope:** Section ORDER of `index.html` (content is not being
rewritten — the question is sequence). · **Business:** Mikey's Mobile Detailing, Snohomish
County WA — solo owner-operator, mobile, appointment-based, review-driven local trade.

---

## TL;DR — the verdict

Your **content is strong and your top of page is genuinely well built** — the hero and the
quote calculator right below it are exactly what the research says a local-service page
should lead with. The problem is the **middle of the funnel**: the sequence oscillates
(ask → proof → ask → proof → proof → offer → menu → process…) instead of descending in one
clean arc, and your **three highest-leverage persuasion pieces are in the wrong place**:

1. **"How It Works" is buried at position 9** — the "wait, how does a mobile detail even
   work?" question is answered *after* you've already asked people to book five times.
2. **Your services menu sits at position 8**, below two photo galleries — people can't form
   desire for options they haven't seen yet.
3. **Your limited-time offer (Free Exterior + countdown) is at position 7**, ~5+ screens
   down, where only about a quarter of visitors are still looking.

The fix is a **re-order, not a rewrite** — five moves, described at the bottom.

---

## How this analysis was done (and why you can trust it)

I mapped every section of `index.html` in its current order, then compared that order
against the funnel structure recommended by conversion-optimization and UX research. Every
recommendation below is tagged with the source it comes from. The frameworks and data used:

| Principle used | Source |
|---|---|
| Landing-page anatomy: Hero → Problem → Solution → Benefits → Social proof near CTAs → Details/FAQ → Final CTA | [CXL — How to Build a High-Converting Landing Page](https://cxl.com/blog/how-to-build-a-high-converting-landing-page/) |
| 57% of viewing time is spent above the fold; 74% within the first two screenfuls — attention drops sharply as users scroll | [Nielsen Norman Group — Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/) |
| Reviews are decisive for local businesses; Google is the #1 platform; consumers expect a critical mass of reviews to trust you | [BrightLocal — Local Consumer Review Survey 2025](https://www.brightlocal.com/research/local-consumer-review-survey-2025/) |
| Speed-to-lead: responding in ~5 min makes contact ~100× more likely and qualification ~21× more likely; within 1 hour ~7× more likely to qualify | [Harvard Business Review — The Short Life of Online Sales Leads](https://hbr.org/2011/03/the-short-life-of-online-sales-leads) · [MIT/InsideSales Lead Response Management Study (Oldroyd)](https://www.leadresponsemanagement.org/lrm_study) |
| AIDA (Attention-Interest-Desire-Action) and PAS (Problem-Agitate-Solution) copy arcs; PAS/AIDA are the standard structures for a landing page | [Hive Digital — Writing Frameworks: AIDA, PAS](https://www.hivedigital.com/blog/writing-frameworks-for-marketing-content/) |
| Message match / "scent": the page must echo what the visitor was promised; matching lifts conversion dramatically | [CXL — Maintaining Scent](https://cxl.com/blog/give-your-advertising-roi-a-serious-boost-by-maintaining-scent/) · [Unbounce](https://unbounce.com/landing-page-examples/high-converting-landing-pages/) |
| Home-service specifics: service + area + single CTA + click-to-call above the fold; explain the process; visible trust stack | [BeKind Local — High-Converting Home Service Landing Page Checklist 2026](https://bekindlocal.com/the-high-converting-checklist-for-home-service-landing-pages-in-2026/) · [Diamond Group — Why Your Home Service Website Isn't Generating Leads](https://www.diamond-group.co/blog/why-your-home-service-website-isnt-generating-leads-and-how-to-fix-it) |
| Single focus, one CTA per section, social proof placed near CTAs (not only at the bottom), close with a final CTA | [Shopify — High-Converting Landing Pages](https://www.shopify.com/blog/high-converting-landing-pages) · CXL (above) |

---

## Your CURRENT section order

| # | Section (id/class) | What it does | Funnel stage |
|---|---|---|---|
| 1 | **Hero** (`.mh-hero`) | H1 "Mobile Car Detailing in Snohomish County", 5.0★ · 38 reviews · 300+ cars, "I Come To You", "You don't pay until you love it", quote + call CTAs, price pills | **Attention** ✅ |
| 2 | **Quick Quote Calculator** (`#booking`) | "Know your price before you book" — interactive instant-price form | **Action (for the ready)** ✅ |
| 3 | **Trust band** (`.trust-section`) | Google review card (5.0/39), 100% guarantee seal, hero testimonial, recent-work photos | **Proof** ✅ |
| 4 | **Mid CTA band** (`.qcta`) | "Your Car Could Be Next. See Your Price in 60 Seconds." | Action |
| 5 | **Before & After** (`#beforeafter`) | "SEE THE DIFFERENCE" drag slider | **Desire** |
| 6 | **Photo strip** (gallery) | "More Real Cars. Real Results." | Desire (dup) |
| 7 | **Free Exterior Offer** (`#free-exterior-offer`) | Limited-time deal + live countdown timer | **Offer / urgency** ⚠️ too deep |
| 8 | **Services** (`#allservices`) | "Our Services" full menu + concierge / Clean Club | **Interest** ⚠️ too deep |
| 9 | **How It Works** (`.hiw4`) | "Three Steps. Zero Effort." process explainer | **Friction removal** ⚠️ too deep |
| 10 | **Guarantee** (`.grt4`) | "The Love It Guarantee — you don't pay" | Reassurance |
| 11 | **About Mikey** (`#about`) | "Hey, I'm Mikey" founder story | Reassurance/trust |
| 12 | **FAQ** (`#qanda`) | "Everything You're Wondering" | **Objection handling** ✅ |
| 13 | **Explore** (`.explore`) | Internal links to city/service pages | SEO (correctly last) |

*(A sticky mobile call/book bar is always present — good; keep it.)*

### What's already right (don't touch)

- **Hero (1).** Textbook. It names the service + area in the H1 (message match / local-SEO),
  stacks social proof above the fold, states the risk reversal, gives one primary CTA plus
  click-to-call, and shows price — everything NN/g and the home-service checklists ask for
  in the 57% of time people spend above the fold.
- **Quote calculator at (2).** Putting the instant-quote path immediately below the hero is
  correct: it captures the visitor who is *already sold*, which is where the speed-to-lead
  math pays off (the faster you can get them to submit, the more the ~5-minute contact
  advantage compounds). CXL's rule — "if the offer is appealing, visitors don't need to
  scroll" — is exactly why the form belongs high.
- **Trust band at (3).** Social proof directly after the CTA, not dumped at the bottom, is
  precisely what CXL prescribes, and reviews are the #1 local trust driver (BrightLocal).
- **FAQ (12) and Explore (13) at the end.** Objection-handling last, SEO link farm dead
  last. Correct.

### The ordering problems (where leads leak)

1. **The offer is buried (currently 7).** Your Free-Exterior-this-week deal with a live
   countdown is the single most action-forcing element on the page — real scarcity + real
   urgency. It sits below *two* galleries, roughly five-plus screens down. Per NN/g,
   attention has fallen off a cliff by then (well past the 74%-in-two-screens zone). A
   time-boxed offer that most visitors never scroll to is a wasted lever.

2. **Services are below the galleries (currently 8).** In an AIDA arc, *Interest* (what can
   I even buy?) precedes *Desire* (look how good the result is). Right now you show the
   transformation before you show the menu, and the menu sits under both galleries. Worse:
   your own "How It Works" step 1 says *"pick your service"* and links to `#allservices` —
   which is far below where the reader is. The reference points down the page instead of to
   something they've already seen.

3. **"How It Works" is near the bottom (currently 9).** For *mobile* detailing, the #1
   unspoken objection is procedural: *"How does this work — do I need to be home? Do you
   need my water/power? Do I pay upfront?"* That's textbook PAS friction, and it should be
   answered *early*, right after the form and trust — not after you've already asked for the
   booking five times. Answering "how" late means the hesitant visitor bounces before they
   ever reach the reassurance.

4. **Two galleries back-to-back (5 + 6) delay everything below them.** Before/After is your
   strongest visual proof; the plain photo strip is weaker and partly redundant. Stacked
   together they form a "proof wall" that pushes the offer, services, and process deeper than
   they should be. One strong proof beat is better placed than two adjacent ones.

5. **No dedicated closing CTA.** Your main CTA band (`.qcta`) is mid-page (4). After the FAQ
   handles the last objections, the page slides straight into SEO links — there's no
   "you've got all your answers, book now" moment. CXL and Shopify both say: close with a
   final CTA.

---

## The RECOMMENDED funnel order

The arc below follows **AIDA, front-loaded for the ready buyer** (hero + calculator), then a
clean descent for everyone who needs convincing: **Proof → How → What → Wow → Offer →
Reassure → Objections → Close.**

| # | Section | Stage | Change | Why (source) |
|---|---|---|---|---|
| 1 | **Hero** | Attention | keep | Above-fold value prop + proof + CTA (NN/g, home-service checklist) |
| 2 | **Quick Quote Calculator** | Action (ready buyer) | keep | Capture the already-sold; speed-to-lead (HBR/MIT; CXL) |
| 3 | **Trust band** (reviews, guarantee seal, testimonial) | Proof | keep | Social proof next to the CTA (CXL; BrightLocal) |
| 4 | **How It Works** | Friction removal | **▲ up from 9** | Kill the "how does mobile even work" objection early (PAS; home-service "explain the process") |
| 5 | **Services menu** (+ concierge / Clean Club) | Interest | **▲ up from 8** | Show what's buyable before building desire; fixes the "pick your service" link pointing downward (AIDA) |
| 6 | **Before & After** | Desire | keep (~here) | Peak visual proof — the transformation (AIDA Desire) |
| 7 | **Free Exterior Offer** (+ countdown) | Offer / urgency | **▲ up from 7 to ride the desire peak** | Strongest act-now lever must land while attention is still high (NN/g; scarcity/PAS) |
| 8 | **Photo strip** ("More Real Cars") | Reinforcement | **▼ down from 6, or merge/trim** | Secondary proof reinforces the offer instead of delaying it; de-duplicate with Before/After |
| 9 | **Guarantee** ("Love It Guarantee") | Reassurance | keep (cluster) | Risk reversal restated at the decision point (CXL) |
| 10 | **About Mikey** | Reassurance / trust | keep (cluster) | "Who's coming to my house?" — owner-operator trust (local-trust research) |
| 11 | **FAQ** | Objection handling | keep | Last doubts before converting (CXL) |
| 12 | **Final CTA band** (reuse `.qcta` styling) | Close | **✚ add / relocate here** | Finish with a strong CTA after objections are cleared (CXL; Shopify) |
| 13 | **Explore / More Detailing Info** | SEO | keep last | Internal links belong outside the conversion arc |

### The whole page at a glance

```
ATTENTION   1. Hero  (service + area + proof + risk reversal + CTA)
ACTION ►     2. Quick Quote Calculator            ← catch the ready buyer
PROOF        3. Trust band (Google 5.0 · guarantee · testimonial)
HOW          4. How It Works        ▲ moved up (was 9)
WHAT         5. Services menu       ▲ moved up (was 8)
WOW          6. Before & After
OFFER ►      7. Free Exterior + countdown   ▲ moved up (was 7, now rides the "wow")
MORE PROOF   8. Photo strip         ▼ moved down / trimmed (was 6)
REASSURE     9. Guarantee
            10. About Mikey
OBJECTIONS  11. FAQ
CLOSE ►      12. Final CTA band      ✚ new/relocated
SEO         13. Explore links
```

---

## The five moves (minimal-risk changelist)

If you implement nothing else, do these — each is a block move, not a content change:

1. **Move `How It Works` (`.hiw4`) up** to right after the Trust band (position 3 → 4).
2. **Move `Services` (`#allservices`) up** to right after How It Works (→ 5), so the menu
   precedes the galleries and the "pick your service" link points to something above it.
3. **Keep `Before & After` (`#beforeafter`), then place the `Free Exterior Offer`
   (`#free-exterior-offer`) immediately after it** so the countdown offer rides the peak of
   the transformation proof.
4. **Move the `Photo strip` down** to just after the offer (reinforcement), or trim it so
   you don't have two galleries in a row.
5. **Add a closing CTA** after the FAQ (reuse the existing `.qcta` band styling) before the
   Explore links.

These are all re-sequencing edits — no copy is rewritten, so the risk is low and it's fully
reversible. Nothing about the hero, the calculator, or the trust band changes.

---

## Sources

1. CXL — *How to Build a High-Converting Landing Page: Anatomy, Structure & Design.* https://cxl.com/blog/how-to-build-a-high-converting-landing-page/
2. Nielsen Norman Group — *Scrolling and Attention.* https://www.nngroup.com/articles/scrolling-and-attention/
3. BrightLocal — *Local Consumer Review Survey 2025.* https://www.brightlocal.com/research/local-consumer-review-survey-2025/
4. Harvard Business Review — *The Short Life of Online Sales Leads.* https://hbr.org/2011/03/the-short-life-of-online-sales-leads
5. Lead Response Management Study (Dr. James Oldroyd, MIT Sloan / InsideSales.com). https://www.leadresponsemanagement.org/lrm_study
6. Hive Digital — *Writing Frameworks for Marketing Content: AIDA, PAS, and More.* https://www.hivedigital.com/blog/writing-frameworks-for-marketing-content/
7. CXL — *Give Your Advertising ROI a Serious Boost by Maintaining Scent.* https://cxl.com/blog/give-your-advertising-roi-a-serious-boost-by-maintaining-scent/
8. Unbounce — *High-Converting Landing Page Examples.* https://unbounce.com/landing-page-examples/high-converting-landing-pages/
9. Shopify — *High Converting Landing Pages: 8 Best Practices.* https://www.shopify.com/blog/high-converting-landing-pages
10. BeKind Local — *The High-Converting Checklist for Home Service Landing Pages in 2026.* https://bekindlocal.com/the-high-converting-checklist-for-home-service-landing-pages-in-2026/
11. Diamond Group — *Why Your Home Service Website Isn't Generating Leads.* https://www.diamond-group.co/blog/why-your-home-service-website-isnt-generating-leads-and-how-to-fix-it

> Notes on sourcing: The "~100× / ~21×" speed-to-lead multipliers originate in the 2007
> MIT/InsideSales Lead Response Management study (Oldroyd); HBR's own 2011 article
> contributed the 42-hour average response time and the "7× within an hour" qualification
> finding. Both are cited above so the numbers trace to their real origin rather than the
> common misattribution. NN/g's 57%/74% figures are from their eye-tracking research on
> scrolling and attention.
