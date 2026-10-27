# AI answer panel, 2026-10-27 (raw answers)

The raw material behind `reports/2026-10-27-rnd-ai-engines.md`. Every answer here
is what the engine returned, word for word, captured by a script, not retyped.
The only edit: Mikey's street address, which two engines quoted, is replaced with
`[street address removed]` (no street address goes in this public repo).

## How it was run

- **Prompts:** 28, in `prompts.json` order: L01 to L10 local picks, P11 to P15
  price, H16 to H21 how-tos, C22 to C25 comparisons, B26 to B28 branded (his
  name in the prompt, to see what each engine believes about him).
- **Browser:** a TinyFish cloud Chrome on a US residential IP, driven with
  Playwright from this sandbox. Logged out everywhere. One fresh tab per prompt.
- **ChatGPT** (`chatgpt/`): chatgpt.com, logged out. Logged-out ChatGPT turned
  out to carry context from one chat to the next in the same browser (H16 dog
  hair answered as if it were the previous Snohomish price question). So:
  - `ID.json` = clean run, chatgpt.com site data wiped before the prompt (a
    private window per prompt). 8 prompts got one: L01, L02, L04, L09, P12, H16,
    H17, H18. After that, ChatGPT showed a "Verify you are human" check to the
    fresh device and the run stopped there; nothing tried to get past it.
  - `ID.runA.json` = first full pass, all 28, same cookie throughout. A script
    checked each how-to, comparison and branded answer for a topic from the
    prompt before it: only H16 and C23 showed one. H16 is replaced by its
    clean run; C23 is flagged in the report.
  - `ID.run1.json` = a first try at L01 to L04, kept as a repeat sample.
  - The scoreboard uses `ID.json` where it exists, else `ID.runA.json`.
- **Gemini** (`gemini/`): gemini.google.com, logged out (the free Flash-Lite
  model). L01 to P11 ran on the first browser, the rest with
  gemini.google.com storage wiped before each prompt.
- **Copilot** (`copilot/`): Microsoft Copilot Search, `bing.com/copilotsearch`,
  logged out. The answer text includes Bing's source cards; "Bing" as a source
  means Bing's own Places (local listing) data.
- **Claude** (`claude/answers.md`): the web search tool this Claude Code session
  has, on L01 to P15 and B26, B28. Not the claude.ai app (needs a sign-in).
- **Links:** ChatGPT and Gemini show sources as pills with a page title or
  domain ("See Your Price Now" and "Mobile Car Detailing Snohomish, WA" are his
  homepage's title), not as links, so `links` is mostly empty and the sources
  are read from the answer text.

## Not reachable from this sandbox (2026-10-27)

| Engine | What happened |
|---|---|
| Perplexity | Cloudflare "Performing security verification" on first load. Not attempted further. |
| Google AI Overviews / AI Mode | google.com/search returned Google's "unusual traffic" page (google.com/sorry). |
| Claude (claude.ai app) | Needs a sign-in. The Claude column is Claude's web search tool instead. |
| Copilot app (copilot.microsoft.com) | Redirects to a sign-in landing page. Copilot Search on bing.com works logged out and is what ran. |

These need a real person's browser: Mikey, or Muse with Mikey signed in.

## Scoreboard (named = the answer names Mikey's Mobile Detailing; # = his place among businesses listed)

| ID | Prompt | ChatGPT | Gemini | Copilot | Claude |
|---|---|---|---|---|---|
| L01 | Best mobile car detailing in Snohomish WA | **#1** | 0 | **#1** | **#1** (stale) |
| L02 | Best mobile detailer in Everett WA | 0 | 0 | 0 | 0 |
| L03 | Who does mobile car detailing in Lake Stevens WA? | **#2** (stale prices) | **#1** | **#4** | 0 |
| L04 | Mobile detailing Mill Creek WA | **#1** (stale prices) | **#1** | 0 | 0 |
| L05 | Car detailing that comes to you in Marysville WA | 0 | **#1** (wrong: "own water and power") | 0 | 0 |
| L06 | Mobile auto detailing Bothell WA | 0 | 0 | 0 | 0 |
| L07 | Best car detailing in Monroe WA | 0 | 0 | 0 | 0 |
| L08 | Mobile car detailing Woodinville WA | **#2** | 0 | 0 | 0 |
| L09 | Ceramic coating in Snohomish County WA | 0 | **#4** (merged with Everett Lux) | 0 | 0 |
| L10 | Paint correction near Everett WA | 0 | 0 | 0 | 0 |
| P11 | How much is a full detail in Snohomish WA? | **#2** | his site cited, not named | 0 | **#1** (stale "from $200") |
| P12 | Mobile detailing cost in Everett WA | 0 | his site cited, not named | 0 | 0 |
| P13 | Ceramic coating cost in Snohomish County | **#1** | his site cited, not named | 0 | 0 |
| P14 | Interior detailing price in Lake Stevens WA | **#2** (stale prices) | source label only | **#4** | 0 |
| P15 | Cheapest vs best detailing in Snohomish County | 0 | **#1** (wrong: "own water, power") | 0 | **#1** (stale) |
| H16 to H21 | six how-tos | 0 of 6 | 0 of 6 | 0 of 6 | not run |
| C22 to C25 | four comparisons | 0 of 4 (C23 flagged) | 0 of 4 | 0 of 4 | not run |
| **L+P+H+C** | **25 non-branded prompts** | **7 / 25** | **5 / 25** (+3 unnamed uses) | **3 / 25** | **3 / 15 run** |
| B26 | His prices and phone | right | right | phone right, no prices, street address | wrong ("from $200"), street address |
| B27 | Is he any good? | right | wrong: "brings ... water/power" | old Nextdoor review counts, street address | not run |
| B28 | Does he bring water and power? | **wrong business** (Elkton, MD) | right | wrong ("likely bring their own") | not found |
