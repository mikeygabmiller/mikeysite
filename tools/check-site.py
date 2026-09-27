#!/usr/bin/env python3
"""Final gate: schema sanity, link integrity, sitemap sync, entity consistency."""
import json, re, sys
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path("/home/user/mikeysite")
SKIP = {"mockups", "systems", "_disabled", "social", "print"}  # _disabled/ is parked code, not served
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
                        ROOT / "outreach/FLEET-EMAILS.md"]
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
