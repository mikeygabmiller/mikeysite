#!/usr/bin/env python3
"""Final gate: schema sanity, link integrity, sitemap sync, entity consistency."""
import json, re, sys
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path("/home/user/mikeysite")
SKIP = {"mockups", "systems"}
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
