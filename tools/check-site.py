#!/usr/bin/env python3
"""Final gate: schema sanity, link integrity, sitemap sync, entity consistency."""
import json, re, sys
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path("/home/user/mikeysite")
SKIP = {"mockups", "systems", "_disabled", "social", "print", "tools"}  # _disabled/ is parked code, not served
# tools/ is excluded in _config.yml too; tools/blog-redirect/ is deployed to the old
# blog subdomain on Netlify, not to this site.
# social/ is the Instagram/Facebook kit, excluded in _config.yml. Its npm install
# drops vendor HTML into social/tools/node_modules that is not ours to police;
# the post copy gets its own em dash check in social/tools/render.cjs.
# print/ is the same arrangement for the door hanger: excluded in _config.yml,
# vendor HTML in print/tools/node_modules, and its own copy check (em dashes,
# unserved towns, "insured") in print/tools/build-door-hanger.cjs.
JSONLD = re.compile(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
                    re.DOTALL | re.IGNORECASE)
VOID = {'area','base','br','col','embed','hr','img','input','link','meta',
        'param','source','track','wbr'}

fails, warns = [], []

class Tags(HTMLParser):
    def __init__(s): super().__init__(); s.stack=[]; s.bad=[]
    def handle_starttag(s,t,a):
        if t not in VOID: s.stack.append(t)
    def handle_endtag(s,t):
        if s.stack and s.stack[-1]==t: s.stack.pop()
        elif t in s.stack:
            while s.stack and s.stack.pop()!=t: pass

pages = [p for p in sorted(ROOT.rglob("*.html")) if p.relative_to(ROOT).parts[0] not in SKIP]

# --- entity consistency: the #business node must be identical everywhere ----
biz_fingerprints = {}
person_fingerprints = {}
for p in pages:
    rel = str(p.relative_to(ROOT))
    html = p.read_text(encoding="utf-8")
    blocks = JSONLD.findall(html)
    if not blocks:
        # A noindex page (the call page, /onbored/, and its /onboard/ alias)
        # is kept out of search on purpose, so it has no schema to check.
        if re.search(r'<meta name="robots" content="[^"]*noindex', html):
            continue
        warns.append(f"{rel}: no JSON-LD")
        continue
    if len(blocks) != 1:
        fails.append(f"{rel}: expected 1 JSON-LD block, found {len(blocks)}")
    try:
        d = json.loads(blocks[0])
    except json.JSONDecodeError as e:
        fails.append(f"{rel}: JSON-LD does not parse — {e}")
        continue
    if "@graph" not in d:
        fails.append(f"{rel}: JSON-LD is not a @graph")
        continue
    g = d["@graph"]
    ids = [n.get("@id") for n in g]
    for need in ("https://mikeysdetailing.com/#business",
                 "https://mikeysdetailing.com/#mikey",
                 "https://mikeysdetailing.com/#website"):
        if need not in ids:
            fails.append(f"{rel}: graph missing {need}")
    biz = next((n for n in g if n.get("@id","").endswith("#business")), None)
    per = next((n for n in g if n.get("@id","").endswith("#mikey")), None)
    if biz:
        # reviews/speakable legitimately vary; ignore them in the fingerprint
        f = {k: v for k, v in biz.items() if k not in ("review", "speakable")}
        biz_fingerprints.setdefault(json.dumps(f, sort_keys=True), []).append(rel)
    if per:
        person_fingerprints.setdefault(json.dumps(per, sort_keys=True), []).append(rel)

    # WebPage @id must match this page's canonical
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if m:
        wp = next((n for n in g if n.get("@type") == "WebPage"), None)
        if wp and wp.get("url") != m.group(1):
            fails.append(f"{rel}: WebPage.url {wp.get('url')} != canonical {m.group(1)}")

    # tag balance
    t = Tags(); t.feed(html)
    if t.stack:
        warns.append(f"{rel}: unclosed tags {t.stack[:5]}")

if len(biz_fingerprints) != 1:
    fails.append(f"#business node differs across pages — {len(biz_fingerprints)} variants:")
    for fp, files in biz_fingerprints.items():
        fails.append(f"    {len(files)} page(s): {files[:3]}")
if len(person_fingerprints) != 1:
    fails.append(f"#mikey node differs across pages — {len(person_fingerprints)} variants")

# --- internal link integrity ------------------------------------------------
hrefs = set()
for p in pages:
    html = p.read_text(encoding="utf-8")
    for h in re.findall(r'href="(/[^"#?]*)"', html):
        hrefs.add(h)
for h in sorted(hrefs):
    if h.endswith(".js") or h.endswith(".xml") or h.endswith(".txt"):
        target = ROOT / h.lstrip("/")
    elif h.endswith("/"):
        target = ROOT / h.strip("/") / "index.html" if h != "/" else ROOT / "index.html"
    elif h.endswith(".html"):
        target = ROOT / h.lstrip("/")
    else:
        continue
    if not target.exists():
        fails.append(f"BROKEN internal link: {h} -> {target.relative_to(ROOT)}")

# --- sitemap sync -----------------------------------------------------------
sm = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
sm_urls = set(re.findall(r"<loc>(.*?)</loc>", sm))
canon = set()
for p in pages:
    m = re.search(r'<link rel="canonical" href="([^"]+)"',
                  p.read_text(encoding="utf-8"))
    if m: canon.add(m.group(1))
LEGAL = {"privacy-policy", "terms", "sms-opt-in"}
missing = {c for c in canon - sm_urls
           if not any(f"/{l}/" in c for l in LEGAL)}
if missing:
    warns.append(f"canonical URLs not in sitemap: {sorted(missing)}")
stale = sm_urls - canon
if stale:
    fails.append(f"sitemap lists URLs with no matching page: {sorted(stale)}")

# --- no em dashes anywhere a customer or a crawler can read -------------------
# Mikey's call, 2026-09-11: a dash used as punctuation is the single clearest
# tell that copy was written by a machine, and this site is one guy talking.
# Full stop, comma, colon or brackets, whichever the sentence actually wants.
# This runs over the served files including comments and JS strings, because a
# rule with no exceptions is the only kind that survives the next edit.
EM = re.compile(r"&mdash;|&#8212;|&#x2014;|\u2014")
served = [q for q in sorted(ROOT.rglob("*.html")) if q.relative_to(ROOT).parts[0] not in SKIP]
served += [ROOT / "llms.txt", ROOT / "robots.txt"]
dashed = []
for q in served:
    if not q.exists():
        continue
    for lineno, line in enumerate(q.read_text(encoding="utf-8").splitlines(), 1):
        if EM.search(line):
            dashed.append(f"{q.relative_to(ROOT)}:{lineno}: {line.strip()[:90]}")
if dashed:
    fails.append(f"em dash in served copy ({len(dashed)}), use a full stop, comma or colon:")
    for d in dashed[:12]:
        fails.append(f"    {d}")
    if len(dashed) > 12:
        fails.append(f"    ...and {len(dashed) - 12} more")

# --- prices: one price book, and nothing left over from the last one ----------
# The price book lives here and in the facts table in CLAUDE.md. Every range on
# the site is base + the calculator's size step: sedan +0, SUV/pickup +40,
# van/3-row +80. Condition (+30 / +60) and add-ons ride on top and are not in
# the published ranges. See PRICING.md for why and for the history.
PRICE_BOOK = {"Exterior Detail": 199, "Interior Detail": 249, "Full Detail": 369}
SIZE_STEPS = [0, 40, 80]
# Every price the site has retired. None of these may appear as "$NNN" in a
# served file or in a generator that prints the facts. $200 was the old
# interior base; the one legitimate "$200" left is a vacuum, not our price.
RETIRED = {"160", "240", "280", "299", "339", "379", "319", "349"}
RETIRED_OK = {"$200 cordless"}

home = (ROOT / "index.html").read_text(encoding="utf-8")
m = re.search(r"var PRICE = \{([^}]*)\}", home)
calc = {k: int(v) for k, v in re.findall(r"'([^']+)':(\d+)", m.group(1))} if m else {}
if calc != PRICE_BOOK:
    fails.append(f"quote calculator PRICE {calc} != price book {PRICE_BOOK}")
steps = [int(v) for v in re.findall(r'data-role="vehicle" data-value="(\d+)"', home)]
if steps != SIZE_STEPS:
    fails.append(f"quote calculator vehicle steps {steps} != {SIZE_STEPS}")
for name, v in PRICE_BOOK.items():
    if f'data-name="{name}" data-value="{v}"' not in home:
        fails.append(f"quote calculator card for {name} does not carry data-value={v}")
# The "#allservices" chooser is a second, separate estimator. It sat at
# $130/$160/$260 with +20/+40 sizes until 2026-09-27, below even the old book.
m = re.search(r'<section id="allservices".*?var SVC = \{(.*?)\};\s*var SIZE = \{(.*?)\};', home, re.S)
if not m:
    fails.append("#allservices chooser: could not find its SVC / SIZE tables")
else:
    bases = dict(re.findall(r"label: '([^']+)', base: (\d+)", m.group(1)))
    want_b = {"Interior": str(PRICE_BOOK["Interior Detail"]),
              "Exterior": str(PRICE_BOOK["Exterior Detail"]),
              "Full Detail": str(PRICE_BOOK["Full Detail"])}
    if bases != want_b:
        fails.append(f"#allservices chooser bases {bases} != price book {want_b}")
    adds = [int(a) for a in re.findall(r"add: (\d+)", m.group(2))]
    if adds != SIZE_STEPS:
        fails.append(f"#allservices chooser size steps {adds} != {SIZE_STEPS}")

want = {n: (str(v), str(v + SIZE_STEPS[-1])) for n, v in PRICE_BOOK.items()}
for fp in biz_fingerprints:
    biz = json.loads(fp)
    for offer in biz.get("hasOfferCatalog", {}).get("itemListElement", []) + biz.get("makesOffer", []):
        nm = offer.get("itemOffered", {}).get("name")
        ps = offer.get("priceSpecification", {})
        if nm in want and (ps.get("minPrice"), ps.get("maxPrice")) != want[nm]:
            fails.append(f"#business offer {nm}: {ps.get('minPrice')}-{ps.get('maxPrice')} != {'-'.join(want[nm])}")

price_files = served + [ROOT / "social/tools/posts.cjs", ROOT / "social/tools/render.cjs",
                        ROOT / "print/tools/build-door-hanger.cjs", ROOT / "print/tools/build-postcard.cjs",
                        ROOT / "outreach/FLEET-EMAILS.md",
                        ROOT / "outreach/DIRECTORIES.md"]
OLD = re.compile(r"\$(\d{3})\b(?: cordless)?")
stale_prices = []
for q in price_files:
    if not q.exists():
        continue
    for lineno, line in enumerate(q.read_text(encoding="utf-8").splitlines(), 1):
        for hit in OLD.finditer(line):
            if hit.group(0) in RETIRED_OK:
                continue
            if hit.group(1) in RETIRED or hit.group(1) == "200":
                stale_prices.append(f"{q.relative_to(ROOT)}:{lineno}: {hit.group(0)}  {line.strip()[:80]}")
if stale_prices:
    fails.append(f"retired price still on the site ({len(stale_prices)}), see PRICING.md:")
    for d in stale_prices[:12]:
        fails.append(f"    {d}")
    if len(stale_prices) > 12:
        fails.append(f"    ...and {len(stale_prices) - 12} more")

# --- FAQ prices: the schema answer can't quote a price the page doesn't -------
# Most pages carry each FAQ answer twice, visible and in the FAQPage JSON-LD.
# Every dollar amount in a schema answer has to appear in the page's visible
# text (the questions are often worded differently, so this doesn't pair them
# up), or Google is reading a price the customer never sees.
import html as _html
for p in pages:
    rel = str(p.relative_to(ROOT))
    src = p.read_text(encoding="utf-8")
    blocks = JSONLD.findall(src)
    try:
        g = json.loads(blocks[0]).get("@graph", []) if blocks else []
    except json.JSONDecodeError:
        continue
    text = re.sub(r"\s+", " ", _html.unescape(re.sub(r"<[^>]+>", " ", JSONLD.sub("", src))))
    for node in g:
        if node.get("@type") != "FAQPage":
            continue
        for q in node.get("mainEntity", []):
            ans = q.get("acceptedAnswer", {}).get("text", "")
            for amt in sorted(set(re.findall(r"\$\d[\d,]*\d|\$\d", ans))):
                if not re.search(re.escape(amt) + r"(?![\d,]*\d)", text):
                    fails.append(f"{rel}: FAQ schema says {amt} for \"{q.get('name','')[:50]}\" but the page never shows it")

# --- review count: the raw HTML has to match site-stats.js ---------------------
# site-stats.js fixes the count in the browser, but AI crawlers read the raw
# HTML, so every hard-coded count has to be bumped with it. It drifted once:
# site-stats.js went to 41 and 35 pages stayed at 40.
m = re.search(r"reviewCount:\s*(\d+)", (ROOT / "site-stats.js").read_text(encoding="utf-8"))
if not m:
    fails.append("site-stats.js: no reviewCount")
else:
    n = m.group(1)
    REV = re.compile(r'"reviewCount": "(\d+)"|\b(\d{2,3})\+?(?:</strong>|</span>|</div>)?\s*(?:five-star\s+|Google\s+)*reviews?\b'
                     r'|across (\d{2,3}) (?:Google )?reviews'
                     r'|data-md-reviews="[^"]*">(\d+)|stat-num">(\d+)\+?</(?:div|span)>\s*<div class="stat-label">Reviews',
                     re.I)
    off = []
    for q in price_files:
        if not q.exists():
            continue
        for lineno, line in enumerate(q.read_text(encoding="utf-8").splitlines(), 1):
            for hit in REV.finditer(line):
                got = next(g for g in hit.groups() if g)
                if got != n:
                    off.append(f"{q.relative_to(ROOT)}:{lineno}: {got}  {line.strip()[:70]}")
    if off:
        fails.append(f"review count differs from site-stats.js ({n}) in {len(off)} place(s):")
        for d in off[:12]:
            fails.append(f"    {d}")

# --- the schema generator reproduces every page ------------------------------
# tools/build-entity-graph.py writes each page's JSON-LD from the page itself
# (title, meta description, FAQ, breadcrumb) and its own tables (the business
# node, the twelve towns, each page's Service). If a rerun would change a page,
# the two have drifted apart: on 2026-10-05 a rerun would have dropped four
# towns from areaServed on every page and put Duvall back in Snohomish County,
# and 15 pages had a meta description edited without its JSON-LD copy. Fix the
# page or the generator's tables, then `python3 tools/build-entity-graph.py --apply`.
import importlib.util
sys.dont_write_bytecode = True
_spec = importlib.util.spec_from_file_location("entity_graph", ROOT / "tools" / "build-entity-graph.py")
eg = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(eg)
regen = []
for p in pages:
    rel = str(p.relative_to(ROOT))
    src = p.read_text(encoding="utf-8")
    new, _ = eg.rebuild(rel, src)
    if new is not None and new != src:
        regen.append(rel)
if regen:
    fails.append(f"a rerun of tools/build-entity-graph.py would change {len(regen)} page(s), "
                 f"so its tables and the pages disagree: {regen[:8]}")
# The served towns live in three places: TOWNS on the homepage (the map and the
# ZIP checker), CITIES in the generator (areaServed on every page), and a city
# page for each one that has p: set. They have to name the same twelve.
yes = re.findall(r"\{\s*n:'([^']+)',\s*t:'yes'", home)
if set(yes) != set(eg.CITIES):
    fails.append(f"served towns disagree: TOWNS has {sorted(set(yes) - set(eg.CITIES))} that CITIES "
                 f"in build-entity-graph.py doesn't, CITIES has {sorted(set(eg.CITIES) - set(yes))} that TOWNS doesn't")
for bad in ("Lynnwood", "Edmonds"):
    if bad in eg.CITIES or bad in yes:
        fails.append(f"{bad} is listed as served; Mikey said no (CLAUDE.md, the service area)")

# --- the facts table, in the copy --------------------------------------------
# What the 2026-10-05 audit found by reading, written down so it fails next time
# instead of waiting for the next audit. Each rule is a fact from CLAUDE.md.
def copy_text(src):
    """What a reader or a crawler gets: visible text, meta content, alt text and
    JSON-LD, without CSS, SVG or the page's own JavaScript."""
    attrs = " . ".join(re.findall(r'<meta [^>]*content="([^"]*)"', src) + re.findall(r'\balt="([^"]*)"', src))
    s = re.sub(r"<(style|svg|noscript)\b.*?</\1>", " ", src, flags=re.S | re.I)
    s = re.sub(r"<script(?![^>]*ld\+json)\b.*?</script>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<(?:/p|/li|/h\d|/td|/tr|br|/div)\b[^>]*>", " . ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", _html.unescape(s + " . " + attrs))

SENT = re.compile(r"(?<=[.!?])[\"”']?,?\s+|\s\.\s")
copies = {str(p.relative_to(ROOT)): copy_text(p.read_text(encoding="utf-8")) for p in pages}
copies["llms.txt"] = (ROOT / "llms.txt").read_text(encoding="utf-8")

# Durations. A range's subject is the last of these named before it in the
# sentence (or the first after it): full detail 3-5 h, never 3-4; a basic
# interior about 90 minutes, 2-4 h with extraction or pet hair; one-step
# correction 6-8 h (multi-stage is counted in days). Exterior, coating and
# pet hair on its own have no number in the facts table, so they aren't checked.
# An exterior is about 1-2 h (CLAUDE.md, 2026-10-05).
HOURS = re.compile(r"(\d+(?:\.\d+)?)\s*(?:–|-|to)\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b", re.I)
SUBJ = re.compile(r"full details?|interior (?:and|\+|&) exterior|\binteriors?\b|\bexteriors?\b|correction|coating|pet hair|\bwash\b", re.I)
ALLOWED = {"full detail": {("3", "5")}, "interior": {("2", "4")}, "correction": {("6", "8")},
           "exterior": {("1", "2")}}   # exterior: set 2026-10-05 to fit the calendar's 2 hr plan
wrong_time = []
for rel, text in copies.items():
    for sent in SENT.split(text):
        for h in HOURS.finditer(sent):
            before = list(SUBJ.finditer(sent, 0, h.start()))
            after = SUBJ.search(sent, h.end())
            if after and after.start() - h.end() > 30:
                after = None   # "2-5 hours of hands-on work ... covering interior stains" isn't about an interior
            m = before[-1] if before else after
            if not m:
                continue
            subj = m.group(0).lower().rstrip("s")
            subj = "full detail" if subj.startswith(("full detail", "interior and", "interior +", "interior &")) else subj
            if subj in ALLOWED and (h.group(1), h.group(2)) not in ALLOWED[subj]:
                wrong_time.append(f"{rel}: {subj} {h.group(0)!r} in \"{sent.strip()[:90]}\"")
if wrong_time:
    fails.append(f"a duration that isn't the facts table's ({len(wrong_time)}):")
    fails.extend(f"    {w}" for w in wrong_time[:12])

# The quote calculator takes 60 seconds, never 30 or 90.
for rel, text in copies.items():
    for m in re.finditer(r"\b(30|90)[- ]second", text):
        fails.append(f"{rel}: \"{m.group(0)}\", the quote takes 60 seconds")

# Claims retired or never true, in the pages and in everything that prints or
# posts the facts. Lines that define a generator's own ban list are skipped.
RETIRED_CLAIMS = [
    (re.compile(r"cars? (?:a|per) week|limited spots|a few (?:a|per) week|\d+-spot cap|spots? left", re.I),
     "a scarcity claim: the one scarcity line is the live next opening"),
    (re.compile(r"onsite in \d+\s*-\s*\d+\s*hrs", re.I),
     "a turnaround his week can't keep (one weekday job, Saturdays, never same day)"),
    (re.compile(r"every 1 to 3 months|frequency tiers|\d+-\d+ a year \(clean club", re.I),
     "a Clean Club schedule: it's every 4 or 8 weeks"),
    (re.compile(r"(?=.*\b(?:club|member|recurring)).*?\b(bi-monthly|quarterly)\b", re.I),
     "a Clean Club schedule: it's every 4 or 8 weeks"),
]
claim_files = price_files + [ROOT / "outreach/DIRECTORIES.md", ROOT / "outreach/CALL-SCRIPT.md",
                             ROOT / "print/tools/build-business-card.cjs", ROOT / "print/tools/build-yard-sign.cjs",
                             ROOT / "print/tools/build-air-freshener.cjs", ROOT / "print/tools/build-car-decal.cjs",
                             ROOT / "print/tools/build-gift-card.cjs", ROOT / "print/tools/build-shared-postcard.cjs"]
for q in claim_files:
    if not q.exists():
        continue
    for lineno, line in enumerate(q.read_text(encoding="utf-8").splitlines(), 1):
        if re.search(r"\[/.*/i?,\s*'", line):
            continue
        for rx, why in RETIRED_CLAIMS:
            m = rx.search(line)
            if m:
                fails.append(f"{q.relative_to(ROOT)}:{lineno}: \"{m.group(m.lastindex or 0)}\" is {why}")

# Payment is after the work, never a deposit. A sentence about a deposit has to
# say no to it (questions are fine: "Is a deposit required?").
for rel, text in copies.items():
    for sent in SENT.split(text):
        if re.search(r"deposit", sent, re.I) and not sent.rstrip().endswith("?") \
                and not re.search(r"\b(no|never|not|don't|do not|without|zero|nothing)\b|\$0", sent, re.I):
            fails.append(f"{rel}: deposit without a no: \"{sent.strip()[:90]}\"")

# Voice: one guy, "I". The descriptions are what Google and share cards show,
# where "we" never means "you and me". On the page, only the business "we".
# Legal pages are written in "we" on purpose; reviews are customers talking.
LEGAL_PAGES = ("privacy-policy/", "terms/", "sms-opt-in/")
NOT_MIKEY = LEGAL_PAGES + ("reviews/",)
for p in pages:
    rel = str(p.relative_to(ROOT))
    src = p.read_text(encoding="utf-8")
    descs = re.findall(r'<meta (?:name|property)="(?:description|og:description|twitter:description)" content="([^"]*)"', src)
    descs += re.findall(r'"description": "((?:[^"\\]|\\.)*)"', src)
    for d in descs if not rel.startswith(LEGAL_PAGES) else []:
        m = re.search(r"\b(we|we're|we’re|we'll|our)\b", d, re.I)
        if m:
            fails.append(f"{rel}: \"{m.group(0)}\" in a description, it's one guy: \"{d[:70]}\"")
    if rel.startswith(NOT_MIKEY):
        continue
    text = copies[rel]
    for m in re.finditer(r"\bwe(?: come| bring| detail| offer| serve| service| extract| work in| send| don't just| don’t just)\b"
                         r"|\bour (?:team|crew|detailers|services)\b|\bOur Services\b", text, re.I):
        fails.append(f"{rel}: business \"{m.group(0)}\", it's \"I\"")
    for m in re.finditer(r"\b(seamless\w*|elevat(?:e|es|ed|ing)|unlock\w*|transform(?:s|ed|ing|ative|ation)?|jaw[- ]dropping"
                         r"|meticulous\w*|showroom[- ](?:shine|clean|finish|ready|quality)|bumper[- ]to[- ]bumper perfection)\b|\b(?:it'?s|is|isn['’]t) not just\b|\bnot just\b",
                         text, re.I):
        fails.append(f"{rel}: agency word \"{m.group(0)}\"")
    for m in re.finditer(r"<(?:a|button)\b[^>]*>\s*(Get Your[^<]{0,30})", src):
        fails.append(f"{rel}: button says \"{m.group(1).strip()}\", buttons say \"Get My\"")

# Meta descriptions over 155 characters get cut by Google.
for p in pages:
    m = re.search(r'<meta name="description" content="([^"]*)"', p.read_text(encoding="utf-8"))
    if m and len(_html.unescape(m.group(1))) > 155:
        fails.append(f"{p.relative_to(ROOT)}: meta description is {len(_html.unescape(m.group(1)))} characters, keep it under 155")

# City pages stay 900+ words of content (nav, header and footer don't count).
def words(src):
    s = re.sub(r"<head\b.*?</head>", " ", src, flags=re.S | re.I)
    s = re.sub(r"<(script|style|svg|noscript|template|nav|footer|header)\b.*?</\1>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    return len(re.findall(r"[A-Za-z0-9$][\w'’$.,/+-]*", _html.unescape(re.sub(r"<[^>]+>", " ", s))))
for town, path in re.findall(r"\{\s*n:'([^']+)',\s*t:'yes'[^}]*?p:'(/[^']+/)'", home):
    page = ROOT / path.strip("/") / "index.html"
    if page.exists() and words(page.read_text(encoding="utf-8")) < 900:
        fails.append(f"{page.relative_to(ROOT)}: {words(page.read_text(encoding='utf-8'))} words, city pages keep 900+")

# The guarantee goes in four places on the homepage: the hero, the price reveal
# in the calculator, the Love It Guarantee section and the final CTA. Outside
# that section, that's three.
outside = re.sub(r'<section class="grt4".*?</section>', " ", home, flags=re.S)
outside = re.sub(r"<(script|style|svg|noscript|head)\b.*?</\1>", " ", outside, flags=re.S | re.I)
outside = _html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<!--.*?-->", " ", outside, flags=re.S)))
said = re.findall(r"pay (?:only )?(?:if|until|when) you(?:'re| are)? (?:love|happy)|love it or it'?s free|don'?t love it\?",
                  outside.replace("’", "'"), re.I)
if len(said) != 3:
    fails.append(f"index.html: the guarantee is said {len(said)} times outside the Love It Guarantee section; "
                 f"it belongs in the hero, the price reveal and the final CTA only")

# Every image is served from mikeysdetailing.com (GROWTH-PLAN.md SG5). Until
# 2026-10-05, 22 loaded from Google Drive, two of them 1.6 MB with a customer's
# plate readable. A Drive or i.ibb.co link breaks the day its owner tidies up.
for p in pages:
    src = p.read_text(encoding="utf-8")
    for m in re.finditer(r'<img\b[^>]*\ssrc="(https?://(?!mikeysdetailing\.com/)[^"]+)"'
                         r'|<meta property="og:image" content="(https?://(?!mikeysdetailing\.com/)[^"]+)"', src):
        fails.append(f"{p.relative_to(ROOT)}: image served from another site: {(m.group(1) or m.group(2))[:80]}")

# --- report -----------------------------------------------------------------
print("=" * 72)
if fails:
    print(f"FAIL — {len(fails)} problem(s):")
    for f in fails: print("  ✗", f)
else:
    print("PASS — no problems")
if warns:
    print(f"\n{len(warns)} warning(s):")
    for w in warns: print("  !", w)
print("=" * 72)
print(f"{len(pages)} pages checked · {len(biz_fingerprints)} distinct #business node(s) · "
      f"{len(hrefs)} internal link targets")
sys.exit(1 if fails else 0)
