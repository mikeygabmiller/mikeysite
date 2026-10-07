#!/usr/bin/env python3
"""
Rewrite every page's separate JSON-LD blocks into one @graph with canonical
@id anchoring, so the whole site resolves to a single business entity.

Design:
  - ONE canonical business node (#business), byte-identical on every page.
    A service-area business has one address; the cities it serves live in
    areaServed and in per-page Service nodes, not in a per-page address.
  - ONE Person node (#mikey), founder/employee, linked both ways.
  - ONE WebSite node (#website).
  - Per page: WebPage (#webpage), BreadcrumbList (#breadcrumb),
    FAQPage (#faq), and where applicable a Service (#service) carrying the
    city served and that service's price band.

Nothing is dropped: per-page city + geo + price data moves from the
(incorrect) business address/geo/priceRange into the Service node where
schema.org actually wants it.
"""
import html as _html
import json, re, sys
from pathlib import Path

ROOT = Path("/home/user/mikeysite")
SITE = "https://mikeysdetailing.com"
BLOCK = re.compile(
    r'[ \t]*<!--[^\n>]*Schema[^\n>]*-->\n?|[ \t]*<script[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>\n?',
    re.DOTALL | re.IGNORECASE)
JSONLD = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE)

BIZ_ID   = f"{SITE}/#business"
PERSON_ID= f"{SITE}/#mikey"
SITE_ID  = f"{SITE}/#website"
OG_IMAGE = f"{SITE}/images/og-image.jpg"
LOGO     = f"{SITE}/images/logo-square.png"

# --- canonical city data (one coordinate per city; the repo had drift) -----
# The twelve served towns, in the order areaServed lists them. This is one more
# copy of the TOWNS list in index.html: a town added there goes here too, or a
# rerun drops it from every page's schema. Duvall and Woodinville are King
# County; filing them under Snohomish is the error check-site caught on
# 2026-09-10.
SNO, KING = "Snohomish County, WA", "King County, WA"
CITIES = {
    "Snohomish":     ("98290", 47.9129, -122.0982, SNO),
    "Everett":       ("98201", 47.9789, -122.2021, SNO),
    "Lake Stevens":  ("98258", 48.0151, -122.0610, SNO),
    "Mill Creek":    ("98012", 47.8601, -122.2043, SNO),
    "Monroe":        ("98272", 47.8554, -121.9718, SNO),
    "Bothell":       ("98021", 47.7623, -122.2054, SNO),
    "Duvall":        ("98019", 47.7423, -121.9854, KING),
    "Marysville":    ("98270", 48.0518, -122.1771, SNO),
    "Mukilteo":      ("98275", 47.9445, -122.3046, SNO),
    "Granite Falls": ("98252", 48.0832, -121.9676, SNO),
    "Arlington":     ("98223", 48.1987, -122.1251, SNO),
    "Woodinville":   ("98072", 47.7543, -122.1635, KING),
}

# --- canonical price book -------------------------------------------------
# The homepage OfferCatalog and the visible copy on every page agree on these;
# the stale numbers found only in services/* schema are corrected to match.
CORE_SERVICES = [
    ("Interior Detail", "Interior Car Detailing", 249, 329,
     "Deep vacuum, steam clean, upholstery shampoo, leather cleaning and conditioning, "
     "plastics dressed, interior glass, deodorised."),
    ("Exterior Detail", "Exterior Car Detailing", 199, 279,
     "Hand wash, decontamination, clay bar, wheels and tires, exterior glass, "
     "wax or sealant applied to the paint."),
    ("Full Detail", "Full Car Detailing", 369, 449,
     "Interior and exterior combined. The complete service, inside and out."),
]

# --- per-page Service definitions -----------------------------------------
# (city or None for county-wide, service name, serviceType, minPrice, maxPrice)
PAGE_SERVICE = {
    "snohomish/index.html":            ("Snohomish",   "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "snohomish/paint-correction.html": ("Snohomish",   "Paint Correction",     "Paint Correction",     400, 1200),
    "snohomish/truck-detailing.html":  ("Snohomish",   "Truck Detailing",      "Truck Detailing",      239, 409),
    "everett/index.html":              ("Everett",     "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "everett/interior.html":           ("Everett",     "Interior Detail",      "Interior Car Detailing", 249, 329),
    "everett/exterior.html":           ("Everett",     "Exterior Detail",      "Exterior Car Detailing", 199, 279),
    "lake-stevens/index.html":         ("Lake Stevens","Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "lake-stevens/interior-detail.html": ("Lake Stevens","Interior Detail",    "Interior Car Detailing", 249, 399),
    "lake-stevens/paint-correction-in-lake-stevens.html": ("Lake Stevens","Paint Correction","Paint Correction",400,1200),
    "mill-creek/index.html":           ("Mill Creek",  "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "mill-creek/interior-detail.html": ("Mill Creek",  "Interior Detail",      "Interior Car Detailing", 249, 399),
    "mill-creek/paint-correction-in-mill-creek.html": ("Mill Creek","Paint Correction","Paint Correction",400,1200),
    "monroe/index.html":               ("Monroe",      "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "monroe/ceramic-coating.html":     ("Monroe",      "Ceramic Coating",      "Ceramic Coating",      500, None),
    "mill-creek/ceramic-coating.html": ("Mill Creek", "Ceramic Coating", "Ceramic Coating", 500, None),
    "bothell/index.html":              ("Bothell",     "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "duvall/index.html":               ("Duvall",      "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "marysville/index.html":           ("Marysville",  "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "mukilteo/index.html":             ("Mukilteo",    "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "woodinville/index.html":          ("Woodinville", "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "arlington/index.html":            ("Arlington",   "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "mobile-car-detailing-near-me/index.html": (None,  "Mobile Car Detailing", "Mobile Car Detailing", 199, 449),
    "paint-correction-snohomish-county/index.html": (None,"Paint Correction",  "Paint Correction",     400, 1200),
    "ceramic-coating-snohomish-county/index.html": (None,"Ceramic Coating",    "Ceramic Coating",      500, None),
    "pet-hair-removal-car-detailing/index.html":   (None,"Pet Hair Removal",   "Pet Hair Removal",      50, 220),
    "mobile-auto-maintenance/index.html":          (None,"Mobile Auto Maintenance","Auto Maintenance",  25, 199),
    "services/index.html":             (None, "Full Detail",     "Full Car Detailing",     369, 449),
    "services/interior.html":          (None, "Interior Detail", "Interior Car Detailing", 249, 329),
    "services/exterior.html":          (None, "Exterior Detail", "Exterior Car Detailing", 199, 279),
}

# The same set check-site.py skips: parked code, design experiments, and the
# social and print kits (their node_modules carry vendor HTML). A noindex page
# (the call page) is skipped in main(), because it is kept out of search on
# purpose and has no schema to write.
SKIP_DIRS = {"mockups", "systems", "_disabled", "social", "print", "tools"}


def price_spec(lo, hi):
    # Key order matches the pages as they are (maxPrice before priceCurrency),
    # so a rerun that changes nothing writes nothing.
    spec = {"@type": "PriceSpecification", "minPrice": str(lo)}
    if hi is not None:
        spec["maxPrice"] = str(hi)
    spec["priceCurrency"] = "USD"
    return spec


def area_served():
    out = []
    for name, (zipc, lat, lng, county) in CITIES.items():
        out.append({
            "@type": "City", "name": name,
            "containedInPlace": {"@type": "AdministrativeArea",
                                 "name": county},
        })
    out.append({
        "@type": "GeoCircle",
        "geoMidpoint": {"@type": "GeoCoordinates",
                        "latitude": CITIES["Snohomish"][1],
                        "longitude": CITIES["Snohomish"][2]},
        "geoRadius": "40000",
    })
    return out


def business_node(reviews, speakable):
    node = {
        "@type": ["LocalBusiness", "AutoDetailing"],
        "@id": BIZ_ID,
        "name": "Mikey's Mobile Detailing",
        "legalName": "Mikey's Mobile Detailing",
        "description": (
            "Owner-operated mobile car detailing serving Snohomish County and north "
            "King County, Washington. Mikey drives to your home or workplace and details "
            "the vehicle in your driveway. There is no shop to visit. Interior, exterior, "
            "full detail, paint correction and ceramic coating. You don't pay until you "
            "love it."
        ),
        "slogan": "You don't pay until you love it.",
        "url": SITE + "/",
        "logo": LOGO,
        "image": OG_IMAGE,
        "telephone": "+1-425-600-7897",
        "email": "book@mikeysdetailing.com",
        "priceRange": "$199-$449",
        "currenciesAccepted": "USD",
        "paymentAccepted": "Cash, Credit Card, Debit Card",
        "foundingDate": "2021",
        "founder": {"@id": PERSON_ID},
        "employee": {"@id": PERSON_ID},
        # No streetAddress: this is a service-area business with no shop to visit.
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Snohomish",
            "addressRegion": "WA",
            "postalCode": "98290",
            "addressCountry": "US",
        },
        "geo": {"@type": "GeoCoordinates",
                "latitude": CITIES["Snohomish"][1],
                "longitude": CITIES["Snohomish"][2]},
        "areaServed": area_served(),
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday",
                          "Friday", "Saturday", "Sunday"],
            "opens": "00:00",
            "closes": "23:59",
        }],
        "aggregateRating": {"@type": "AggregateRating", "ratingValue": "5.0",
                            "reviewCount": "41", "bestRating": "5"},
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Detailing Services",
            "itemListElement": [
                {"@type": "Offer",
                 "itemOffered": {"@type": "Service", "name": n,
                                 "serviceType": st, "description": d},
                 "priceSpecification": price_spec(lo, hi)}
                for n, st, lo, hi, d in CORE_SERVICES
            ],
        },
        "makesOffer": [
            {"@type": "Offer",
             "itemOffered": {"@type": "Service", "name": n, "serviceType": st},
             "priceSpecification": price_spec(lo, hi)}
            for n, st, lo, hi, _ in CORE_SERVICES
        ],
        # The blog lives at /blog/ since 2026-10-05; the old subdomain redirects there.
        "sameAs": ["https://g.page/r/CRCuKQ982VIZEBE"],
    }
    if reviews:
        node["review"] = reviews
    if speakable:
        node["speakable"] = speakable
    return node


def person_node():
    return {
        "@type": "Person",
        "@id": PERSON_ID,
        "name": "Mikey Miller",
        "givenName": "Mikey",
        "familyName": "Miller",
        "jobTitle": "Owner & Detailer",
        "description": (
            "Mikey Miller has been detailing cars since 2021 and runs Mikey's Mobile "
            "Detailing single-handed. Every car on the books is detailed by him, not "
            "by a crew. Over 300 vehicles detailed across Snohomish County at a 5.0-star "
            "average."
        ),
        "image": OG_IMAGE,
        "telephone": "+1-425-600-7897",
        "email": "book@mikeysdetailing.com",
        "worksFor": {"@id": BIZ_ID},
        "owns": {"@id": BIZ_ID},
        "url": f"{SITE}/about/",
        "knowsAbout": [
            "Mobile car detailing", "Interior car detailing",
            "Exterior car detailing", "Paint correction", "Ceramic coating",
            "Automotive paint protection", "Pet hair removal",
            "Truck and SUV detailing", "Pacific Northwest vehicle care",
        ],
        "knowsLanguage": "en-US",
        "areaServed": {"@type": "AdministrativeArea", "name": "Snohomish County, WA"},
    }


def website_node():
    return {
        "@type": "WebSite",
        "@id": SITE_ID,
        "url": SITE + "/",
        "name": "Mikey's Mobile Detailing",
        "inLanguage": "en-US",
        "publisher": {"@id": BIZ_ID},
    }


def service_node(page_url, spec):
    city, name, stype, lo, hi = spec
    node = {
        "@type": "Service",
        "@id": page_url + "#service",
        "name": f"{name} in {city}, WA" if city else name,
        "serviceType": stype,
        "provider": {"@id": BIZ_ID},
        "areaServed": (
            {"@type": "City", "name": city,
             "containedInPlace": {"@type": "AdministrativeArea",
                                  "name": CITIES[city][3]},
             "geo": {"@type": "GeoCoordinates",
                     "latitude": CITIES[city][1], "longitude": CITIES[city][2]}}
            if city else
            {"@type": "AdministrativeArea", "name": "Snohomish County, WA"}
        ),
        "offers": {"@type": "Offer", "priceCurrency": "USD",
                   "price": str(lo), "priceSpecification": price_spec(lo, hi),
                   "availability": "https://schema.org/InStock",
                   "url": page_url},
    }
    if hi is None:
        node["offers"].pop("price", None)
    return node


# --- the FAQ a reader can see ------------------------------------------------
# The FAQPage node is built from the page's visible questions, never kept as
# its own copy. On 2026-10-07, 23 pages carried FAQ schema that had drifted
# from what the page showed: questions only the schema asked, answers only the
# schema gave, and some of them wrong (8 towns instead of 12, "25-50% more"
# for an SUV, "every 3-4 months"). Most AI crawlers drop <script> and read the
# visible text, and Google wants marked-up answers on the page, so a hidden
# answer is invisible to one and a liability with the other. To change a
# question, change the page and rerun this; check-site fails until you do.
#
# The four shapes the site uses, in page order:
#   <div class="answer-first"><h2>Q</h2><p>A</p></div>    (the guides)
#   <div class="faq-item"><div class="faq-q">Q</div><div class="faq-a">A</div></div>
#   <details class="faq2-item"><summary>Q</summary><p>A</p></details>
#   <h2>Common Questions</h2> then <h3>Q</h3><p>A</p> pairs, up to the next h2
FAQ_SHAPES = [
    re.compile(r'<div class="answer-first">\s*<h2[^>]*>(.*?)</h2>(.*?)</div>', re.S),
    re.compile(r'<div class="faq-item"[^>]*>\s*<div class="faq-q"[^>]*>(.*?)</div>\s*<div class="faq-a"[^>]*>(.*?)</div>\s*</div>', re.S),
    re.compile(r'<details class="faq2-item">\s*<summary>(.*?)</summary>(.*?)</details>', re.S),
]
FAQ_SECTION = re.compile(r'<h2[^>]*>\s*Common Questions\s*</h2>(.*?)(?=<h2|<div class="related-links"|</main>|</section>)',
                         re.S | re.I)
FAQ_PAIR = re.compile(r'<h3[^>]*>([^<]*\?)\s*</h3>\s*((?:<p\b.*?</p>\s*)+)', re.S)


def _faq_text(fragment):
    s = re.sub(r"<(?:/p|br|/li)\b[^>]*>", " ", fragment)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", _html.unescape(s)).strip()


def visible_faq(html):
    body = html.split("</head>", 1)[-1]
    body = re.sub(r"<script\b.*?</script>|<style\b.*?</style>|<!--.*?-->", "", body, flags=re.S)
    found = []
    for rx in FAQ_SHAPES:
        found += [(m.start(), m.group(1), m.group(2)) for m in rx.finditer(body)]
    for sec in FAQ_SECTION.finditer(body):
        found += [(sec.start(1) + m.start(), m.group(1), m.group(2)) for m in FAQ_PAIR.finditer(sec.group(1))]
    return [(_faq_text(q), _faq_text(a)) for _, q, a in sorted(found)]


def rebuild(rels, html):
    """The page as this script would write it: (new_html, note), or (None,
    reason) for a page it leaves alone. check-site.py calls this and fails if
    a rerun would change any page, so the generator and the pages can't drift
    apart unnoticed (a meta description edited without its JSON-LD twin, a new
    town missing from CITIES)."""
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if not m:
        return None, "SKIP (no canonical)"
    page_url = m.group(1)
    if re.search(r'<meta name="robots" content="[^"]*noindex', html):
        return None, "SKIP (noindex)"

    blocks = JSONLD.findall(html)
    faq = breadcrumb = None
    reviews = speakable = None
    extras = []
    # Flatten: a page may hold separate blocks (first run) or a single
    # @graph (re-run). Both must yield the same nodes, or re-running the
    # script silently drops the FAQ and breadcrumb it can no longer see.
    nodes = []
    for b in blocks:
        d = json.loads(b)
        nodes.extend(d["@graph"] if "@graph" in d else [d])
    for d in nodes:
        t = d.get("@type")
        ts = set(t) if isinstance(t, list) else {t}
        if t == "FAQPage":
            faq = d
        elif t == "BreadcrumbList":
            breadcrumb = d
        elif ts & {"LocalBusiness", "AutoDetailing", "AutoRepair"}:
            reviews = d.get("review") or reviews
            speakable = d.get("speakable") or speakable
        elif not ts & {"Person", "WebSite", "WebPage", "Service"}:
            extras.append(d)   # a node this script doesn't build itself

    title = re.search(r"<title>(.*?)</title>", html, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', html)

    graph = [business_node(reviews, speakable), person_node(), website_node()]

    webpage = {
        "@type": "WebPage",
        "@id": page_url + "#webpage",
        "url": page_url,
        "name": (title.group(1).strip() if title else "Mikey's Mobile Detailing"),
        "isPartOf": {"@id": SITE_ID},
        "about": {"@id": BIZ_ID},
        "primaryImageOfPage": OG_IMAGE,
        "inLanguage": "en-US",
    }
    if desc:
        webpage["description"] = desc.group(1)
    if breadcrumb:
        webpage["breadcrumb"] = {"@id": page_url + "#breadcrumb"}
    graph.append(webpage)

    if breadcrumb:
        breadcrumb = dict(breadcrumb)
        breadcrumb.pop("@context", None)
        breadcrumb["@id"] = page_url + "#breadcrumb"
        graph.append(breadcrumb)

    qa = visible_faq(html)
    if faq and not qa:
        print(f"  note: {rels} drops a FAQPage whose questions aren't on the page", file=sys.stderr)
    faq = {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
        for q, a in qa]} if qa else None
    if faq:
        faq["@id"] = page_url + "#faq"
        faq["isPartOf"] = {"@id": page_url + "#webpage"}
        faq["about"] = {"@id": BIZ_ID}
        graph.append(faq)

    # Anything else on the page (the Polish Test's VideoGame) is kept as
    # it is and anchored to the page. "Nothing is dropped" has to include
    # node types this script has never heard of.
    for d in extras:
        d = dict(d)
        d.pop("@context", None)
        t = d.get("@type")
        d.setdefault("@id", page_url + "#" + str((t[0] if isinstance(t, list) else t) or "node").lower())
        graph.append(d)

    spec = PAGE_SERVICE.get(rels)
    if spec:
        graph.append(service_node(page_url, spec))

    payload = {"@context": "https://schema.org", "@graph": graph}
    script = ('<!-- Schema: one linked entity graph, see GROWTH-PLAN.md -->\n'
              '<script type="application/ld+json">\n'
              + json.dumps(payload, indent=2, ensure_ascii=False)
              + '\n</script>\n')

    new_html, n = BLOCK.subn("", html)
    if blocks:
        # Re-insert at the position the first block occupied.
        first = JSONLD.search(html)
        head_close = new_html.find("</head>")
        new_html = new_html[:head_close] + script + new_html[head_close:]
    else:
        head_close = new_html.find("</head>")
        if head_close == -1:
            return None, "SKIP (no </head>)"
        new_html = new_html[:head_close] + script + new_html[head_close:]


    return new_html, (f"{len(graph)} nodes "
                      f"({'+svc' if spec else '   '}{',+faq' if faq else ''})")


def main(apply=False):
    changed, report = [], []
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS:
            continue
        rels = str(rel)
        new_html, note = rebuild(rels, p.read_text(encoding="utf-8"))
        if new_html is None:
            report.append(f"{note}: {rels}")
            continue
        report.append(f"{'WROTE' if apply else 'would write'} {note} {rels}")
        if apply:
            p.write_text(new_html, encoding="utf-8")
        changed.append(rels)

    print("\n".join(report))
    print(f"\n{len(changed)} pages")


if __name__ == "__main__":
    main(apply="--apply" in sys.argv)
