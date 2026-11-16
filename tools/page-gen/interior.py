import sys; sys.path.insert(0, __file__.rsplit('/', 1)[0])
from lib import *

H = hero(
  h1='Mobile Interior Car Detailing in Snohomish County',
  headline='Crumbs, Stains, Dog&nbsp;Hair. Out of Your&nbsp;Car. <span>Interior Detail.</span>',
  lede="I vacuum every crevice, steam the seats and carpet, and clean the leather, dash, vents and cup holders, in your driveway. Most cars take about 90 minutes. Twelve towns, Arlington down to Bothell.",
  cta='Get My Exact Price', cta_href='#booking',
  note='Pick your size, answer two questions, and the calculator shows your price in 60 seconds. You pay after the work, never a deposit.',
  pills=[('Sedan', '$249'), ('SUV or pickup', '$289'), ('Van or 3-row', '$329')], pills_label='Interior Detail prices',
  img640='/images/job-lexus-interior-640.webp', img1200='/images/job-lexus-interior-1200.webp', w=1200, h=900,
  alt="Tan leather seats, console and dash of a Lexus SUV after Mikey's interior detail",
  cap='Tan leather shows everything. <b>This Lexus is one of mine.</b>')

M = answer('Who does interior car detailing in Snohomish County?',
  "I do. I'm Mikey, of Mikey's Mobile Detailing in Snohomish, WA, and I clean interiors in your driveway in twelve towns from Arlington to Woodinville. An Interior Detail is <strong>$249</strong> for a sedan, <strong>$289</strong> for an SUV or pickup and <strong>$329</strong> for a van or 3-row: vacuum, steam on the seats and carpet, leather, dash and trim, and door jambs. It takes about 90 minutes, or 2 to 4 hours with extraction or pet hair.")

incl = [
 ('Full vacuum, every crevice', 'Seats, carpets, under the seats, the cracks beside them, and the trunk.'),
 ('Steam on the seats and carpet', "Lifts the ground-in dirt a vacuum leaves behind. I match the heat to the material."),
 ('Leather cleaned', 'Dirt and grime lifted off the surface, seams included.'),
 ('Dash, console and door panels', 'Wiped clean of dust and grime, with no greasy film left on them.'),
 ('Vents, cup holders and door pockets', 'Where the dust and the sticky stuff actually collect.'),
 ('Floor mats pulled and cleaned', 'Out of the car, cleaned, dried and put back.'),
 ('Inside glass', 'Windshield, windows and mirrors, without the haze.'),
 ('Door jambs', "The dirty edge you see every time the door opens."),
]
s = head2("What's in it", "Same Checklist, <em>Every Car</em>", "Everything below is in the price. Nothing gets added halfway through the job.")
s += '\n    <ul class="incl">\n' + ''.join('      <li>%s<span><b>%s</b><span>%s</span></span></li>\n' % (CHECK, a, b) for a, b in incl) + '    </ul>\n'
s += ('    <div class="extras">\n      <h3>Extras, only if you want them</h3>\n      <ul>\n'
      '        <li><span>Carpet shampoo<small>For carpets that have taken the worst of it.</small></span><b>$20</b></li>\n'
      '        <li><span>RainX Anti-Fog on the inside glass<small>Helps the windshield stay clear on wet mornings.</small></span><b>$30</b></li>\n'
      '        <li><span><a href="/pet-hair-removal-car-detailing/">Heavy pet hair removal</a><small>For hair that has woven itself into the carpet and seats.</small></span><b>$50 to $80</b></li>\n'
      '      </ul>\n    </div>')
M += sec(s)

M += sizepicker('interior', (249, 289, 329), 'Your price', 'Pick Your Size. <em>See Your Price.</em>',
  "Tap your vehicle. The calculator opens with the Interior Detail already picked, asks what shape the car is in, and shows your exact price.",
  "A car that <b>needs work</b> adds $30 and a <b>war zone</b> adds $60. No judgment at all, I've seen everything. After the price you can pick a time online or have me text you the quote. "
  "Outside needs it too? A <a href=\"/services/\">Full Detail</a> is $369 to $449, which is $79 less than booking the two separately.")

ba = head2('Before and after', 'Same Car, <em>Same Angle</em>', "My own jobs, shot before I started and after I finished.")
ba += '''
    <div class="ba">
      <figure>
        <div class="pair">
          <div><img src="/images/job-backseat-before-640.webp" width="640" height="912" alt="Back seat of an Acura MDX before an interior detail, with crumbs, wrappers and a dried spill on the leather" loading="lazy" decoding="async"><span>Before</span></div>
          <div><img src="/images/job-backseat-after-640.webp" width="640" height="912" alt="The same Acura MDX back seat after the interior detail, clean black leather and clear floor" loading="lazy" decoding="async"><span>After</span></div>
        </div>
        <figcaption><b>Acura MDX, back seat.</b> Crumbs, wrappers and a dried spill across the leather.</figcaption>
      </figure>
      <figure>
        <div class="pair">
          <div><img src="/images/job-cargo-before-640.webp" width="640" height="485" style="aspect-ratio:4/3" alt="Cargo area of an Acura MDX before cleaning, full of bags, boxes and loose trash" loading="lazy" decoding="async"><span>Before</span></div>
          <div><img src="/images/job-cargo-after-640.webp" width="640" height="485" style="aspect-ratio:4/3" alt="The same Acura MDX cargo area after cleaning, empty with a clean rubber mat" loading="lazy" decoding="async"><span>After</span></div>
        </div>
        <figcaption><b>Same MDX, cargo area.</b> Emptied, vacuumed, mat cleaned.</figcaption>
      </figure>
      <figure class="one">
        <img src="/images/job-steering-wheel-before-after-640.webp" srcset="/images/job-steering-wheel-before-after-640.webp 640w, /images/job-steering-wheel-before-after-1200.webp 1200w" sizes="(max-width:860px) 100vw, 540px" width="1200" height="883" alt="A Honda steering wheel side by side: covered in spots of mold on the left, clean on the right" loading="lazy" decoding="async">
        <figcaption><b>Honda steering wheel.</b> Left is how I found it, right is how I left it.</figcaption>
      </figure>
      <figure class="one">
        <img src="/images/job-rav4-cargo-before-after-640.webp" srcset="/images/job-rav4-cargo-before-after-640.webp 640w, /images/job-rav4-cargo-before-after-1200.webp 1200w" sizes="(max-width:860px) 100vw, 540px" width="1200" height="557" alt="Toyota RAV4 cargo mat side by side: caked in dried mud on the left, clean black rubber on the right" loading="lazy" decoding="async">
        <figcaption><b>Toyota RAV4, cargo mat.</b> Dried mud on the left, the same mat on the right.</figcaption>
      </figure>
    </div>'''
M += sec(ba)

c = head2('What I get called for', "The Mess Is <em>Usually One of These</em>", "If yours is on this list, here is what I'd do about it, and what you can do tonight before I get there.")
c += '\n' + cards([
 ('kid', 'Kids and car seats', 'Crumbs in the seat cracks, melted snacks, the milk smell. <a class="more" href="/blog/how-to-clean-a-car-after-kids/">Cleaning up after kids &rarr;</a>'),
 ('paw', 'Dog hair', 'Short hair weaves into carpet and a vacuum alone won\'t pull it. <a class="more" href="/pet-hair-removal-car-detailing/">Pet hair removal &rarr;</a>'),
 ('cup', 'Coffee and spills', 'Blot it, don\'t scrub it. What you do in the first hour matters most. <a class="more" href="/blog/how-to-get-coffee-stains-out-of-car-seats/">Coffee stains &rarr;</a>'),
 ('wind', 'A smell that keeps coming back', 'A smell has a source. Covering it doesn\'t last; finding it does. <a class="more" href="/blog/why-your-car-smells-bad/">Why your car smells &rarr;</a>'),
])
M += sec(c, alt=True)

t = head2('How long', 'About <em>90 Minutes</em> for Most Cars', "I give you a clear time window when we confirm. You don't have to be home for any of it.")
t += '''
    <div class="times">
      <div><span>Basic interior</span><b>About 90 min</b><p>Most cars in normal day-to-day shape.</p></div>
      <div><span>Extraction or pet hair</span><b>2&ndash;4 hrs</b><p>Stains pulled from the carpet, embedded pet hair, kid spills, a smoker's car.</p></div>
    </div>
    <p class="cc-fine"><a href="/how-long-does-car-detailing-take/" style="color:#ddd">How long every kind of detail takes</a></p>'''
M += sec(t)

d = head2('The day of', 'How It <em>Goes</em>', "No shop, no drop-off, no waiting room.")
d += '\n' + steps([
 ('tag', '60 seconds', 'Get your price', 'Pick your size above and answer two questions. The number you see is the number you pay.'),
 ('cal', 'Online', 'Pick a time', 'The calculator shows my real openings: weekday afternoons and Saturdays. Or have me text you the quote.'),
 ('plug', 'At your place', 'I pull up', 'I bring the tools and products. All I need from you is an outdoor spigot and a power outlet I can reach.'),
 ('wallet', 'After the work', 'Walk around, then pay', 'We look it over together and I fix anything you point at. Then cash, check, Venmo or Zelle.'),
])
M += sec(d, alt=True)

M += sec(reviews([
 ('Matt M.', 'Mikey&rsquo;s Mobile Detailing was exactly what we needed and above and beyond what we were expecting!! With two kids in car seats, we had things stuck in those seats that were half-eaten and melted! Mikey has provided us with what seems like a brand new vehicle and allowed us to finally see the floor mats!! I whole-heartedly recommend him for any of your detailing needs!!'),
 ('Kathryn M.', 'Amazing job! Mikey is very professional and thorough. I have two young kids so my car gets quite messy! Very pleased and highly recommend to anyone and everyone!'),
]))

g = head2('The work', "Interiors I've <em>Cleaned</em>", "Real cars in real driveways, photographed when I finished.")
g += '\n' + gallery([
 ('/images/job-etron-dash-640.webp', '/images/job-etron-dash-1200.webp', 1200, 900, 'Audi e-tron dash, console and cream cloth seats after an interior detail', 'Audi e-tron'),
 ('/images/job-escalade-interior-640.webp', None, 640, 480, 'Cadillac Escalade steering wheel, curved dash screen and tan quilted leather after an interior detail', 'Cadillac Escalade'),
 ('/images/job-volvo-interior-640.webp', None, 640, 480, 'Volvo XC40 dash, console and floor mats after an interior detail', 'Volvo XC40'),
 ('/images/job-corolla-interior-640.webp', None, 640, 480, 'Toyota Corolla dash and front seats with red and black seat covers after an interior detail', 'Toyota Corolla'),
 ('/images/job-wrangler-interior-640.webp', None, 640, 480, 'Jeep Wrangler steering wheel, dash and rubber floor mat after an interior detail', 'Jeep Wrangler'),
])
M += sec(g, alt=True)

M += area('Where I work', 'Twelve Towns, <em>Same Price</em>', 'I detail interiors at homes and workplaces in all twelve towns I serve.', [
  'Same price in every one of them, no travel fee.',
  "Somewhere close by that isn't on the list? Text me and ask.",
  'I wrote these up on their own: <a href="/everett/interior.html">Everett</a>, <a href="/lake-stevens/interior-detail.html">Lake Stevens</a> and <a href="/mill-creek/interior-detail.html">Mill Creek</a> interiors.'])

M += faq([
 ('How much does interior car detailing cost in Snohomish?', 'An Interior Detail is $249 for a sedan, $289 for an SUV or pickup and $329 for a van or 3-row. A car that needs work adds $30 and a war zone adds $60. Pick your size on this page and the calculator gives you the exact number, or see the <a href="/car-detailing-cost-snohomish-county/" style="color:var(--red);">full pricing breakdown</a>.'),
 ('How long does an interior detail take?', 'A basic interior takes about 90 minutes. Stain extraction, heavy pet hair, kid messes or a smoker\'s car take it to 2-4 hours. <a href="/how-long-does-car-detailing-take/" style="color:var(--red);">See the full time breakdown</a>.'),
 ('Do I need to be home during the service?', "Nope. As long as I have access to the car and a spot to park, you can be at work or running errands. I'll text when I'm done and we'll do the walkthrough then."),
 ('Do you need water and power for an interior?', "Yes. I need an outdoor water spigot and a power outlet I can reach. Using yours is how I keep my prices where they are. If you really don't have one, tell me when you book: I can bring water and power if I have to."),
 ('Should I empty my car before you arrive?', 'Yes, please pull personal items, papers, child seats if possible, and anything in the trunk or glove box. The more I can reach, the better the result.'),
 ('Will steam cleaning damage my upholstery or leather?', 'No. I match the heat and pressure to the material. Steam is actually gentler than chemical shampoos on most fabrics, and it kills bacteria and odors at the source.'),
 ('Do you remove pet hair?', 'Standard vacuuming pulls most surface hair. For heavily embedded pet hair, I offer a dedicated <a href="/pet-hair-removal-car-detailing/" style="color:var(--red);">pet hair removal</a> add-on with rubber brushes and compressed air.'),
 ('Someone got sick in the car. Can you deal with that?', 'Yes. Blot up what you can, keep the windows cracked and text me. The smell lives in the carpet and the padding under it, so that is where the work goes.'),
 ('When and how do I pay?', "You pay when I'm done and you're happy with it, not before. I take cash, check, Venmo or Zelle. No cards right now."),
 ('What if it rains?', "This is the PNW, so I work around the weather all the time. If it's pouring I'll reach out to reschedule. A lot of the work is interior or done under cover anyway."),
 ("What if I'm not happy with the result?", "We do a walkthrough together when I'm done. Anything off gets fixed on the spot. Notice something later? I come back free. Still not 100%? Full refund."),
], related=[
 ('/services/', 'Full Detail, inside and out'), ('/services/exterior.html', 'Exterior Detail'), ('/pet-hair-removal-car-detailing/', 'Pet hair removal'),
 ('/blog/how-to-clean-inside-of-windshield/', 'Cleaning the inside of a windshield'), ('/car-detailing-cost-snohomish-county/', 'What detailing costs here'), ('/reviews/', 'All my reviews'),
])

A = final('Interior Detail', 'Ready When <em class="nw">You Are</em>', 'Pick your size and see your exact price in 60 seconds. Then pick a time online, or have me text you the quote.',
          'Get My Exact Price', '#booking', ['Pay after the work', 'No deposit', 'Your driveway', 'Same detailer every time'])

page(path='services/interior.html',
     title="Interior Car Detailing in Snohomish, WA | Mikey's Mobile Detailing",
     desc="Mobile interior car detailing in Snohomish, WA. Vacuum, steam clean, leather, dashboard. From $249, I come to your driveway. Get a quote.",
     ogdesc="Inside-only deep clean in your driveway. Sedan $249, SUV or pickup $289, van or 3-row $329. Twelve towns around Snohomish.",
     crumbs=[('Services', SITE + '/services/'), ('Interior Car Detailing in Snohomish, WA', SITE + '/services/interior.html')],
     comment='Interior Detail page, rebuilt 2026-11-16 to the ceramic page\'s standard: real photos of his own jobs, price by size up top, and its own way into the quote calculator (the size picker)',
     hero=H, main=M, after_main=A,
     footer_line='Interior, exterior and full detailing in twelve towns, Arlington down to Bothell. Based in Snohomish, WA.')
finish()
