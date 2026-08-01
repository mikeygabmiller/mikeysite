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
OG_IMAGE = "https://iili.io/qKtjLcx.jpg"   # TODO: swap to /images/og-image.jpg once self-hosted (G1)
LOGO     = "https://i.ibb.co/Kxzv8C6d/logo.jpg"

# --- canonical city data (one coordinate per city; the repo had drift) -----
CITIES = {
    "Snohomish":    ("98290", 47.9129, -122.0982),
    "Everett":      ("98201", 47.9789, -122.2021),
    "Lake Stevens": ("98258", 48.0151, -122.0610),
    "Mill Creek":   ("98012", 47.8601, -122.2043),
    "Monroe":       ("98272", 47.8554, -121.9718),
    "Bothell":      ("98021", 47.7623, -122.2054),
    "Duvall":       ("98019", 47.7423, -121.9854),
    "Marysville":   ("98270", 48.0518, -122.1771),
}

# --- canonical price book -------------------------------------------------
# The homepage OfferCatalog and the visible copy on every page agree on these;
# the stale numbers found only in services/* schema are corrected to match.
CORE_SERVICES = [
    ("Interior Detail", "Interior Car Detailing", 200, 280,
     "Deep vacuum, steam clean, upholstery shampoo, leather cleaning and conditioning, "
     "plastics dressed, interior glass, deodorised."),
    ("Exterior Detail", "Exterior Car Detailing", 160, 240,
     "Hand wash, decontamination, clay bar, wheels and tires, exterior glass, "
     "wax or sealant applied to the paint."),
    ("Full Detail", "Full Car Detailing", 299, 379,
     "Interior and exterior combined — the complete service, inside and out."),
]

# --- per-page Service definitions -----------------------------------------
# (city or None for county-wide, service name, serviceType, minPrice, maxPrice)
PAGE_SERVICE = {
    "snohomish/index.html":            ("Snohomish",   "Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "snohomish/paint-correction.html": ("Snohomish",   "Paint Correction",     "Paint Correction",     300, 700),
    "snohomish/truck-detailing.html":  ("Snohomish",   "Truck Detailing",      "Truck Detailing",      200, 340),
    "everett/index.html":              ("Everett",     "Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "everett/interior.html":           ("Everett",     "Interior Detail",      "Interior Car Detailing", 200, 280),
    "everett/exterior.html":           ("Everett",     "Exterior Detail",      "Exterior Car Detailing", 160, 240),
    "lake-stevens/index.html":         ("Lake Stevens","Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "lake-stevens/interior-detail.html": ("Lake Stevens","Interior Detail",    "Interior Car Detailing", 200, 320),
    "lake-stevens/paint-correction-in-lake-stevens.html": ("Lake Stevens","Paint Correction","Paint Correction",300,700),
    "mill-creek/index.html":           ("Mill Creek",  "Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "mill-creek/interior-detail.html": ("Mill Creek",  "Interior Detail",      "Interior Car Detailing", 200, 320),
    "mill-creek/paint-correction-in-mill-creek.html": ("Mill Creek","Paint Correction","Paint Correction",300,700),
    "monroe/index.html":               ("Monroe",      "Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "monroe/ceramic-coating.html":     ("Monroe",      "Ceramic Coating",      "Ceramic Coating",      600, 1800),
    "bothell/index.html":              ("Bothell",     "Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "duvall/index.html":               ("Duvall",      "Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "marysville/index.html":           ("Marysville",  "Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "mobile-car-detailing-near-me/index.html": (None,  "Mobile Car Detailing", "Mobile Car Detailing", 160, 379),
    "paint-correction-snohomish-county/index.html": (None,"Paint Correction",  "Paint Correction",     400, 1200),
    "ceramic-coating-snohomish-county/index.html": (None,"Ceramic Coating",    "Ceramic Coating",      600, 1800),
    "pet-hair-removal-car-detailing/index.html":   (None,"Pet Hair Removal",   "Pet Hair Removal",      80, 220),
    "mobile-auto-maintenance/index.html":          (None,"Mobile Auto Maintenance","Auto Maintenance",  25, 199),
    "services/index.html":             (None, "Full Detail",     "Full Car Detailing",     299, 379),
    "services/interior.html":          (None, "Interior Detail", "Interior Car Detailing", 200, 280),
    "services/exterior.html":          (None, "Exterior Detail", "Exterior Car Detailing", 160, 240),
}

SKIP_DIRS = {"mockups", "systems"}


def price_spec(lo, hi):
    return {"@type": "PriceSpecification", "minPrice": str(lo),
            "maxPrice": str(hi), "priceCurrency": "USD"}


def area_served():
    out = []
    for name, (zipc, lat, lng) in CITIES.items():
        out.append({
            "@type": "City", "name": name,
            "containedInPlace": {"@type": "AdministrativeArea",
                                 "name": "Snohomish County, WA"},
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
            "the vehicle in your driveway — there is no shop to visit. Interior, exterior, "
            "full detail, paint correction and ceramic coating. You don't pay until you "
            "love it."
        ),
        "slogan": "You don't pay until you love it.",
        "url": SITE + "/",
        "logo": LOGO,
        "image": OG_IMAGE,
        "telephone": "+1-425-600-7897",
        "email": "book@mikeysdetailing.com",
        "priceRange": "$160-$379",
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
                            "reviewCount": "40", "bestRating": "5"},
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
        "sameAs": ["https://g.page/r/CRCuKQ982VIZEBE",
                   "https://blog.mikeysdetailing.com"],
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
            "Detailing single-handed — every car on the books is detailed by him, not "
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
                                  "name": "Snohomish County, WA"},
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
    return node


def main(apply=False):
    changed, report = [], []
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS:
            continue
        rels = str(rel)
        html = p.read_text(encoding="utf-8")

        m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        if not m:
            report.append(f"SKIP (no canonical): {rels}")
            continue
        page_url = m.group(1)

        blocks = JSONLD.findall(html)
        faq = breadcrumb = None
        reviews = speakable = None
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

        if faq:
            faq = dict(faq)
            faq.pop("@context", None)
            faq["@id"] = page_url + "#faq"
            faq["isPartOf"] = {"@id": page_url + "#webpage"}
            faq["about"] = {"@id": BIZ_ID}
            graph.append(faq)

        spec = PAGE_SERVICE.get(rels)
        if spec:
            graph.append(service_node(page_url, spec))

        payload = {"@context": "https://schema.org", "@graph": graph}
        script = ('<!-- Schema: one linked entity graph — see GROWTH-PLAN.md -->\n'
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
                report.append(f"SKIP (no </head>): {rels}")
                continue
            new_html = new_html[:head_close] + script + new_html[head_close:]

        report.append(f"{'WROTE' if apply else 'would write'} {len(graph)} nodes "
                      f"({'+svc' if spec else '   '}{',+faq' if faq else ''}) {rels}")
        if apply:
            p.write_text(new_html, encoding="utf-8")
        changed.append(rels)

    print("\n".join(report))
    print(f"\n{len(changed)} pages")


if __name__ == "__main__":
    main(apply="--apply" in sys.argv)
