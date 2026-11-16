"""Shared pieces for the service page rebuilds (interior first, 2026-11-16).
Run a page script from anywhere: python3 tools/page-gen/interior.py. The pages it writes are plain
hand-editable HTML; this is only how they were typed. Everything that has to
be byte-identical with the rest of the site (Clarity, GA, the footer's social
row, the base .cc-* CSS) is lifted from the ceramic coating page."""
import re, json, html
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CER = (ROOT / 'ceramic-coating-snohomish-county/index.html').read_text(encoding='utf-8')
SITE = 'https://mikeysdetailing.com'

CLARITY = re.search(r'<!-- Microsoft Clarity -->.*?</script>\n', CER, re.S).group(0)
FONTS = re.search(r'<link rel="preload" as="style" href="https://fonts.googleapis.com.*?</noscript>\n', CER, re.S).group(0)
_css = re.search(r'<style>\n/\* Ceramic coating page.*?</style>', CER, re.S).group(0)
# drop the ceramic-only header comment and its quote calculator block
_css = re.sub(r'<style>\n/\*.*?\*/\n', '', _css, count=1, flags=re.S)
_css = re.sub(r'/\* ceramic quote \(the page\'s QQC\) \*/.*?(?=@media \(max-width:1020px\))', '', _css, flags=re.S)
BASE_CSS = _css.replace('</style>', '')
STATS_GA = re.search(r'  <script src="/site-stats.js" defer></script>.*?<style>\.skip-nav.*?</style>\n', CER, re.S).group(0)
SOCIAL = re.search(r'  <!-- SOCIAL:.*?</p>\n', CER, re.S).group(0)
STICKY_JS = re.search(r'<script>\n\(function\(\)\{\n  var bar=document.getElementById\(\'ccSticky\'\).*?</script>', CER, re.S).group(0)
PHONE_SVG = re.search(r'<a class="call" href="tel:\+14256007897">(<svg.*?</svg>)', CER, re.S).group(1)
GOOGLE_G = re.search(r'<div class="g">(<svg.*?</svg>)Google Reviews</div>', CER, re.S).group(1)
HDR = ("<!-- site-header: written by tools/site-header.py from tools/site-header/header.html. Edit that file and rerun; don't edit here. -->\n"
       "<!-- /site-header -->")

CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'

def icon(paths):
    return ('<div class="cc-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            'stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg></div>')

IC = {
 'drop': '<path d="M12 2.7s6 6.1 6 11a6 6 0 0 1-12 0c0-4.900 6-11 6-11z"/>'.replace('4.900','4.9'),
 'spark': '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.900z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'.replace('1.900','1.9'),
 'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'cal': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
 'home': '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 'check': '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
 'tag': '<path d="M20.6 13.4 13.400 20.600a2 2 0 0 1-2.800 0L3 13V3h10l7.600 7.600a2 2 0 0 1 0 2.800z"/><circle cx="7.500" cy="7.500" r="1.500"/>'.replace('.400','.4').replace('.600','.6').replace('.800','.8').replace('.500','.5'),
 'paw': '<circle cx="6" cy="10" r="2"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="18" cy="10" r="2"/><path d="M12 12c-3 0-5 2.500-5 5 0 1.700 1.300 2.500 2.500 2.500 1 0 1.700-.500 2.500-.500s1.500.500 2.500.500c1.200 0 2.500-.800 2.500-2.500 0-2.500-2-5-5-5z"/>'.replace('.500','.5').replace('.700','.7').replace('.300','.3').replace('.800','.8').replace('.200','.2'),
 'cup': '<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 10h1.500a2.500 2.500 0 0 1 0 5H17"/><path d="M8 2v3M12 2v3"/>'.replace('.500','.5'),
 'wind': '<path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h7"/>',
 'kid': '<circle cx="12" cy="6" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3"/>',
 'eye': '<path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'.replace('.600','.6'),
 'shield': '<path d="M20 13c0 5-3.500 7.500-7.700 9a1 1 0 0 1-.600 0C7.500 20.500 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.500-1.200 6.200-2.700a1.200 1.200 0 0 1 1.600 0C14.500 3.800 17 5 19 5a1 1 0 0 1 1 1z"/>'.replace('.500','.5').replace('.700','.7').replace('.600','.6').replace('.200','.2').replace('.800','.8'),
 'tree': '<path d="M12 2 6 10h3l-4 6h14l-4-6h3z"/><path d="M12 16v6"/>',
 'road': '<path d="M5 21 9 3M19 21 15 3M12 6v2M12 11v2M12 16v2"/>',
 'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M6.300 17.700l-1.400 1.400M19.100 4.900l-1.400 1.400"/>'.replace('.900','.9').replace('.400','.4').replace('.700','.7').replace('.300','.3').replace('.100','.1'),
 'wheel': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',
 'phone': '<rect x="6" y="2" width="12" height="20" rx="2.500"/><path d="M11 18h2"/>'.replace('.500','.5'),
 'wallet': '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M16 15h2"/>',
 'plug': '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v4"/>',
 'car': '<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.500" cy="17" r="2"/><circle cx="16.500" cy="17" r="2"/><path d="M9.500 17h5M3 12h18"/>'.replace('.500','.5'),
 'search': '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.500-3.500"/>'.replace('.500','.5'),
}

EXTRA_CSS = """
/* size picker: the page's way into the quote calculator. Each card is a link
   that opens the homepage calculator with the service and size already picked
   (MikeyQQC.start in index.html). The prices here are the price book's, in
   plain text, so check-site.py reads them like any other copy. */
#booking{scroll-margin-top:72px}
.sp{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:860px;margin:30px auto 0}
.sp a{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:26px 16px 22px;border-radius:20px;text-decoration:none;text-align:center;
  background:linear-gradient(180deg,#1c1c1c,#131313);border:1.5px solid #2c2c2c;transition:transform .2s,border-color .2s,box-shadow .2s}
.sp a:hover{transform:translateY(-4px);border-color:var(--red);box-shadow:0 24px 46px -20px var(--glow)}
.sp a:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.sp .sz{font-size:.78rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--red)}
.sp .eg{color:#9a9a9a;font-size:.86rem}
.sp .pr{font-size:2.7rem;font-weight:900;letter-spacing:-1px;line-height:1.1;margin:8px 0 10px}
.sp .go{display:inline-flex;align-items:center;justify-content:center;min-height:46px;width:100%;border-radius:11px;background:var(--red);color:#fff;font-weight:800;font-size:.86rem;letter-spacing:.06em;text-transform:uppercase}
.sp-fine{max-width:700px;margin:20px auto 0;color:#a9a9a9;font-size:.95rem;line-height:1.65;text-align:center}
.sp-fine b{color:#fff}
.sp-fine a{color:#fff}
/* what's included */
.incl{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:34px;text-align:left}
.incl li{list-style:none;display:flex;gap:12px;padding:16px 18px;border-radius:16px;background:linear-gradient(180deg,#1b1b1b,#131313);border:1.5px solid #262626;line-height:1.45}
.incl svg{flex:none;width:20px;height:20px;margin-top:3px;color:#4ade80}
.incl b{display:block;color:#fff;font-weight:800}
.incl span span{color:var(--muted);font-size:.93rem}
.extras{max-width:860px;margin:26px auto 0;text-align:left;border:1.5px solid #262626;border-radius:18px;overflow:hidden}
.extras h3{padding:16px 20px;font-size:1rem;font-weight:800;background:#181818;border-bottom:1px solid #262626}
.extras li{list-style:none;display:flex;justify-content:space-between;gap:16px;padding:14px 20px;border-bottom:1px solid #222;color:#d6d6d6}
.extras li:last-child{border-bottom:0}
.extras li b{color:var(--gold2);white-space:nowrap}
.extras li small{display:block;color:#8f8f8f;font-size:.86rem}
.extras a{color:#fff}
/* before and after pairs */
.ba{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:36px;align-items:start}
.ba figure{margin:0;border-radius:18px;overflow:hidden;border:1px solid #262626;background:#151515}
.ba .pair{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:#000}
.ba .pair div{position:relative}
.ba .pair img,.ba .one img{width:100%;height:100%;object-fit:cover;aspect-ratio:3/4}
.ba .one img{aspect-ratio:auto;height:auto}
.ba .pair span{position:absolute;left:8px;top:8px;padding:4px 10px;border-radius:999px;font-size:.68rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;background:rgba(10,10,10,.8);color:#fff}
.ba .pair div+div span{background:var(--red)}
.ba figcaption{padding:12px 16px;font-size:.92rem;color:#d6d6d6;text-align:left}
.ba figcaption b{color:#fff}
/* time cards */
.times{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;max-width:860px;margin:34px auto 0;text-align:left}
.times div{padding:22px;border-radius:18px;background:linear-gradient(180deg,#1b1b1b,#131313);border:1.5px solid #262626}
.times span{font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--red)}
.times b{display:block;font-size:1.7rem;font-weight:900;margin:6px 0 4px}
.times p{color:var(--muted);font-size:.93rem;line-height:1.55}
/* plain table */
.tbl{width:100%;max-width:860px;margin:30px auto 0;border-collapse:collapse;text-align:left;font-size:.98rem}
.tbl th,.tbl td{padding:14px 16px;border-bottom:1px solid #262626}
.tbl thead th{font-size:.72rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--red);border-bottom:2px solid #333}
.tbl td b{color:#fff}
.tbl td.n{font-weight:900;color:var(--gold2);white-space:nowrap}
.tblwrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.prose{max-width:760px;margin:0 auto;text-align:left}
.prose p{color:#d2d2d2;font-size:1.05rem;line-height:1.75;margin-top:16px}
.prose p a,.cc-sub a,.cc-card a,.incl a,.times a{color:#fff}
.prose h3{font-size:1.25rem;font-weight:800;margin-top:30px}
.cc-steps.four{grid-template-columns:repeat(4,1fr)}
.cc-why.three{grid-template-columns:repeat(3,1fr)}
.cc-card a.more{display:inline-block;margin-top:10px;color:var(--red);font-weight:700;text-decoration:none;font-size:.92rem}
.upd{color:#8d8d8d;font-size:.86rem;margin-top:14px}
@media (max-width:1020px){.cc-steps.four{grid-template-columns:repeat(2,1fr)}.cc-steps.four .cc-step:last-child{grid-column:auto}.cc-why.three{grid-template-columns:1fr 1fr}}
@media (max-width:860px){.ba{grid-template-columns:1fr}}
@media (max-width:560px){
  .sp{grid-template-columns:1fr}
  .sp a{flex-direction:row;flex-wrap:wrap;justify-content:space-between;align-items:center;text-align:left;padding:18px}
  .sp .sz{flex:1 1 60%}.sp .eg{order:3;flex:1 1 60%}.sp .pr{order:2;margin:0;font-size:2.1rem}.sp .go{order:4;margin-top:12px}
  .incl{grid-template-columns:1fr}
  .cc-steps.four,.cc-why.three{grid-template-columns:1fr}
  .extras li{flex-direction:row}
  .tbl th,.tbl td{padding:12px 10px}
}
"""

def proof():
    return ('<div class="cc-proof" role="list" aria-label="Google rating">\n'
            '        <span role="listitem"><span class="st" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <b data-md-rating>5.0</b> on Google</span>\n'
            '        <span class="dot" aria-hidden="true"></span>\n'
            '        <span role="listitem"><b data-md-reviews="{n}">44</b> reviews</span>\n'
            '        <span class="dot" aria-hidden="true"></span>\n'
            '        <span role="listitem"><b>300+</b> cars detailed</span>\n'
            '      </div>')

def sec(inner, alt=False, id=None, center=True, style=''):
    return ('<section class="cc-sec%s"%s%s>\n  <div class="cc-wrap%s">\n%s\n  </div>\n</section>\n' %
            (' alt' if alt else '', ' id="%s"' % id if id else '', ' style="%s"' % style if style else '',
             ' cc-center' if center else '', inner))

def head2(eyebrow, h2, sub=''):
    s = '    <span class="cc-eyebrow">%s</span>\n    <h2 class="cc-h2">%s</h2>' % (eyebrow, h2)
    if sub: s += '\n    <p class="cc-sub">%s</p>' % sub
    return s

def answer(q, a):
    return ('<section class="cc-sec" style="padding-bottom:0">\n  <div class="cc-wrap">\n    <div class="answer-first">\n'
            '      <h2>%s</h2>\n      <p>%s</p>\n    </div>\n  </div>\n</section>\n' % (q, a))

def faq(items, related=None, eyebrow='Common questions', h2='Before You <em>Book</em>', alt=True):
    s = head2(eyebrow, h2) + '\n    <div class="cc-faq" style="text-align:left">\n'
    for q, a in items:
        s += '      <details class="faq2-item">\n        <summary>%s</summary>\n        <p>%s</p>\n      </details>\n' % (q, a)
    s += '    </div>'
    if related:
        s += '\n    <div class="cc-related" style="text-align:left">\n'
        for href, label in related:
            s += '      <a href="%s">%s <span>&rarr;</span></a>\n' % (href, label)
        s += '    </div>'
    return sec(s, alt=alt, id='faq')

def reviews(revs, h2='From My <em>Google Reviews</em>'):
    s = head2('Reviews', h2) + '\n    <div class="cc-reviews" style="text-align:left">\n'
    s += ('      <div class="cc-gcard">\n        <div class="g">%sGoogle Reviews</div>\n        <div class="big" data-md-rating>5.0</div>\n'
          '        <div class="st" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>\n'
          '        <div class="ct"><span data-md-reviews="{n}">44</span> reviews</div>\n        <a href="/reviews/">Read every one &rarr;</a>\n      </div>\n' % GOOGLE_G)
    for name, text in revs:
        s += ('      <figure class="review"><div class="stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>&ldquo;%s&rdquo;</p>\n'
              '        <figcaption><span class="av" aria-hidden="true">%s</span>%s<small>Google review</small></figcaption></figure>\n' % (text, name[0], name))
    s += '    </div>\n    <p class="cc-rnote">Copied word for word from my Google profile. <a href="/reviews/">Read all <span data-md-reviews="{n}">44</span></a>.</p>'
    return s

TOWNS = [('snohomish','Snohomish'),('lake-stevens','Lake Stevens'),('everett','Everett'),('monroe','Monroe'),('mill-creek','Mill Creek'),
         ('marysville','Marysville'),('bothell','Bothell'),('duvall','Duvall'),('mukilteo','Mukilteo'),('woodinville','Woodinville'),
         ('granite-falls','Granite Falls'),('arlington','Arlington')]

def area(eyebrow, h2, sub, facts):
    s = ('    <div>\n      <span class="cc-eyebrow">%s</span>\n      <h2 class="cc-h2">%s</h2>\n      <p class="cc-sub">%s</p>\n      <ul class="cc-area-facts">\n' % (eyebrow, h2, sub))
    for f in facts:
        s += '        <li>%s<span>%s</span></li>\n' % (CHECK, f)
    s += '      </ul>\n    </div>\n    <nav class="cc-towns" aria-label="Towns I serve">\n'
    for slug, name in TOWNS:
        s += '      <a href="/%s/">%s</a>\n' % (slug, name)
    s += '    </nav>'
    return '<section class="cc-sec">\n  <div class="cc-wrap cc-area">\n%s\n  </div>\n</section>\n' % s

def sizepicker(service, prices, eyebrow, h2, sub, fine):
    """service: interior|exterior|full; prices: (sedan, suv, van)."""
    rows = [('sedan', 'Sedan', 'Compact or coupe', prices[0]), ('suv', 'SUV or pickup', 'Crossover or truck', prices[1]),
            ('van', 'Van or 3-row', 'Minivan or XL SUV', prices[2])]
    s = head2(eyebrow, h2, sub) + '\n    <div class="sp">\n'
    for key, name, eg, p in rows:
        s += ('      <a href="/?quote=%s&amp;size=%s#booking"><span class="sz">%s</span><span class="eg">%s</span>'
              '<span class="pr">$%d</span><span class="go">Get My Exact Price &rarr;</span></a>\n' % (service, key, name, eg, p))
    s += '    </div>\n    <p class="sp-fine">%s</p>' % fine
    return sec(s, alt=True, id='booking')

def steps(items, four=True):
    s = '    <div class="cc-steps%s" style="text-align:left">\n' % (' four' if four else '')
    for i, (ic, chip, h, p) in enumerate(items, 1):
        s += ('      <article class="cc-step"><div class="num" aria-hidden="true">%02d</div>\n        %s<span class="node" aria-hidden="true">%d</span>\n'
              '        <span class="chip">%s</span><h3>%s</h3>\n        <p>%s</p></article>\n' % (i, icon(IC[ic]), i, chip, h, p))
    return s + '    </div>'

def cards(items, three=False):
    s = '    <div class="cc-why%s" style="text-align:left">\n' % (' three' if three else '')
    for ic, h, p in items:
        s += '      <article class="cc-card">\n        %s\n        <h3>%s</h3>\n        <p>%s</p>\n      </article>\n' % (icon(IC[ic]), h, p)
    return s + '    </div>'

def final(eyebrow, h2, sub, btn, href, checks):
    s = ('    <div class="cc-final">\n      <span class="cc-eyebrow">%s</span>\n      <h2 class="cc-h2">%s</h2>\n      <p class="cc-sub" style="margin:0 auto">%s</p>\n'
         '      <div class="cc-ctas">\n        <a class="cc-btn cc-btn-red" href="%s">%s &rarr;</a>\n        <a class="cc-btn cc-btn-line" href="tel:+14256007897">(425) 600-7897</a>\n      </div>\n      <ul class="cc-checks">\n' % (eyebrow, h2, sub, href, btn))
    for c in checks:
        s += '        <li>%s%s</li>\n' % (CHECK.replace('2.6', '2.8'), c)
    s += '      </ul>\n    </div>'
    return '<section class="cc-sec">\n  <div class="cc-wrap">\n%s\n  </div>\n</section>\n' % s

def page(*, path, title, desc, ogdesc, crumbs, comment, hero, main, after_main='', footer_line, sticky=('Get My Price', '#booking'),
         extra_css='', og_type='website', scripts=''):
    """crumbs: [(name, url)] after Home. Writes ROOT/path."""
    url = SITE + '/' + (path[:-len('index.html')] if path.endswith('index.html') else path)
    bc = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement":
          [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"}] +
          [{"@type": "ListItem", "position": i + 2, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]}
    out = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n' + CLARITY +
           '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
           '<title>%s</title>\n<meta name="description" content="%s">\n<link rel="canonical" href="%s">\n'
           '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:url" content="%s">\n'
           '<meta property="og:image" content="https://mikeysdetailing.com/images/og-image.jpg">\n<meta property="og:image:width" content="1200">\n'
           '<meta property="og:image:height" content="630">\n'
           '<meta property="og:image:alt" content="Mikey\'s Mobile Detailing logo: a red 4x4 in soap foam beside MIKEY\'S, MOBILE DETAILING.">\n'
           '<meta name="twitter:card" content="summary_large_image">\n<meta property="og:type" content="%s">\n' % (title, desc, url, title, ogdesc, url, og_type))
    out += FONTS + '\n<style>\n/* ' + comment + ' */\n' + BASE_CSS + EXTRA_CSS + extra_css + '</style>\n' + STATS_GA
    out += '<script type="application/ld+json">\n' + json.dumps(bc, indent=2) + '\n</script>\n</head>\n<body>\n'
    out += '<a class="skip-nav" href="#main-content">Skip to main content</a>\n\n' + HDR + '\n\n' + hero + '\n<main>\n\n' + main + '\n</main>\n\n' + after_main
    out += ('<footer>\n  <p class="ft-name">Mikey\'s Mobile Detailing</p>\n  <p>%s</p>\n  <p style="margin-top:8px;"><a href="/">Back to home</a></p>\n' % footer_line) + SOCIAL + '</footer>\n\n'
    if sticky:
        out += ('<div class="cc-sticky" id="ccSticky" aria-label="Call or text Mikey">\n  <a class="call" href="tel:+14256007897">%s(425) 600-7897</a>\n'
                '  <a class="text" href="%s">%s</a>\n</div>\n' % (PHONE_SVG, sticky[1], sticky[0])) + STICKY_JS + '\n'
    out += scripts + '\n</body>\n</html>\n'
    assert '—' not in out and '&mdash;' not in out, 'em dash'
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(out, encoding='utf-8')
    return p

def hero(*, h1, headline, lede, cta, cta_href, note, pills, img640, img1200, w, h, alt, cap, pills_label='Prices'):
    s = ('<section class="cc-hero" aria-labelledby="main-content">\n  <div class="cc-wrap cc-hero-grid">\n    <div>\n'
         '      <h1 class="cc-seo-h1" id="main-content">%s</h1>\n      %s\n      <div class="cc-headline">%s</div>\n      <p class="cc-lede">%s</p>\n'
         '      <div class="cc-ctas">\n        <a class="cc-btn cc-btn-red" href="%s">%s &rarr;</a>\n        <a class="cc-btn cc-btn-line" href="tel:+14256007897">(425) 600-7897</a>\n      </div>\n'
         '      <p class="cc-note">%s</p>\n' % (h1, proof(), headline, lede, cta_href, cta, note))
    if pills:
        s += '      <div class="cc-pills" aria-label="%s">\n' % pills_label
        for a, b in pills:
            s += '        <div class="cc-pill"><span>%s</span><b>%s</b></div>\n' % (a, b)
        s += '      </div>\n'
    s += ('    </div>\n    <figure class="cc-photo">\n      <picture>\n        <source media="(max-width:640px)" srcset="%s">\n'
          '        <img src="%s" width="%d" height="%d" alt="%s" fetchpriority="high" decoding="async">\n      </picture>\n      <figcaption>%s</figcaption>\n    </figure>\n  </div>\n</section>\n'
          % (img640, img1200, w, h, alt, cap))
    return s

def gallery(items):
    """items: [(src640, src1200 or None, w, h, alt, caption)], first is the big one."""
    s = '    <div class="cc-gallery">\n'
    for i, (a, b, w, h, alt, cap) in enumerate(items):
        if i == 0 and b:
            img = '<img src="%s" srcset="%s 640w, %s 1200w" sizes="(max-width:860px) 100vw, 520px" width="%d" height="%d" alt="%s" loading="lazy" decoding="async">' % (b, a, b, w, h, alt)
        else:
            img = '<img src="%s" width="%d" height="%d" alt="%s" loading="lazy" decoding="async">' % (a, w, h, alt)
        s += '      <figure>\n        %s\n        <figcaption>%s</figcaption>\n      </figure>\n' % (img, cap)
    return s + '    </div>'

def finish():
    """Header, schema, then report."""
    import subprocess
    for cmd in (['python3', 'tools/site-header.py', '--apply'], ['python3', 'tools/build-entity-graph.py', '--apply']):
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-300:])
