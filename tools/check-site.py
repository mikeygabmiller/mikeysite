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
# Note the fragment handling below. This check used to read hrefs with
# `href="(/[^"#?]*)"`, which skips every link that carries a "#" — so /#contact,
# /#faq and /#services all passed the gate for months while /#contact pointed at
# an id the homepage has never had. Fragments are now resolved against the real
# ids of the page they land on.

def page_url(p):
    """The site path a page file answers on.

    index.html -> /  ·  everett/index.html -> /everett/
    lake-stevens/interior-detail.html -> /lake-stevens/interior-detail.html

    The non-index pages have to keep their own filename here. Folding them onto
    the directory URL makes them collide with that directory's index.html, and
    whichever loaded last silently replaces the other's ids — which reads as a
    dead anchor on a link that is perfectly fine.
    """
    rel = p.relative_to(ROOT)
    if rel.name != "index.html":
        return "/" + str(rel)
    return "/" if str(rel) == "index.html" else "/" + str(rel.parent) + "/"

# id="..." for every page, keyed by the URL that serves it
page_ids = {}
for p in pages:
    page_ids[page_url(p)] = set(re.findall(r'id="([^"]+)"', p.read_text(encoding="utf-8")))

def resolve(path):
    """Map a site path to the file that serves it, or None."""
    if path.endswith((".js", ".xml", ".txt", ".html")):
        return ROOT / path.lstrip("/")
    if path == "/":
        return ROOT / "index.html"
    if path.endswith("/"):
        return ROOT / path.strip("/") / "index.html"
    return None

for p in pages:
    rel = str(p.relative_to(ROOT))
    html = p.read_text(encoding="utf-8")
    here = page_url(p)
    seen = set()
    for h in re.findall(r'href="([^"]*)"', html):
        h = h.replace("https://mikeysdetailing.com", "")
        # Skip off-site, protocol and script-built hrefs ("#' + a.icon + '").
        if not h.startswith(("/", "#")) or h.startswith("//"):
            continue
        if any(c in h for c in "'\"+{"):
            continue
        path, _, frag = h.partition("#")
        path = path.split("?")[0]
        if path == "":
            path = here            # same-page anchor
        if (path, frag) in seen:
            continue
        seen.add((path, frag))

        target = resolve(path)
        if target is None:
            continue
        if not target.exists():
            fails.append(f"{rel}: BROKEN internal link {h}")
            continue
        if frag and frag != "top" and path in page_ids and frag not in page_ids[path]:
            fails.append(f"{rel}: DEAD ANCHOR {h} — {path} has no id=\"{frag}\"")

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
      f"{sum(len(v) for v in page_ids.values())} anchor ids")
sys.exit(1 if fails else 0)
