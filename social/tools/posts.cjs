// Every post, in one place: what the image says, what the caption says, and
// what the alt text says. render.cjs turns this into the JPGs in social/posts/
// and regenerates social/CAPTIONS.md, so the image and its caption can't drift.
//
// Rules the copy follows (the same ones the website follows, see CLAUDE.md):
//   - First person. It's one guy. "I come to you", never "we".
//   - No em dashes anywhere, including captions and alt text.
//   - Facts come from the CLAUDE.md table, never from memory. Two are NOT
//     confirmed and stay out of every post: which days Mikey works, and
//     whether he's licensed and insured.
//   - Say what happens in the driveway, not how the customer will feel.
//   - Before/after captions only claim what the photo shows. We don't know
//     which service a given car got, so describe what the service covers,
//     not what was done to that car.
//
// `ig` is the Instagram caption. `fb` is built from it: the "link in bio" line
// becomes the real address and the hashtags come off, because Facebook shows
// links and Instagram doesn't.

const Q = 'Exact price for your car in 60 seconds, link in bio.';

const POSTS = [
  // ---------------- WEEK 1: launch. Post all three the same day, pin them. ----------------
  {
    id: 'P01', week: 1, pillar: 'Trust', title: 'Meet Mikey', pin: true,
    slides: [{
      t: 'statement',
      eyebrow: "Hi, I'm Mikey",
      h: 'One guy.<br>No crew.<br><em>Your driveway.</em>',
      body: [
        "I've detailed <strong>300+ cars</strong> around Snohomish County since 2021, and I did every one of them myself.",
        "No subcontractors, no new guy at your door. If something isn't right, I'm the one you text.",
      ],
      sign: 'Mikey',
    }],
    alt: "Text post on black: Hi, I'm Mikey. One guy. No crew. Your driveway. 300+ cars around Snohomish County since 2021, every one done by Mikey himself.",
    ig: `Hi, I'm Mikey. I detail cars in driveways around Snohomish County, and it's just me.

I started in 2021 and I've done 300+ cars since. Every one of them was me, start to finish. No crew, no subcontractors, no new guy showing up at your house.

That also means I'm the one who answers when something isn't right. That's kind of the whole point.

This is where I'll post my before and afters, what I do to a car and why, and where I'm working. Ask me anything in the comments.

${Q}

#snohomish #snohomishcounty #mobiledetailing #cardetailing #lakestevens`,
  },
  {
    id: 'P02', week: 1, pillar: 'Proof', title: 'Back seat before/after', pin: true,
    slides: [
      { t: 'split', dir: 'cols', h: 'Same back seat.', sub: 'Crumbs ground into the leather, a floor full of kid stuff.',
        before: 'backseat-before.jpg', after: 'backseat-after.jpg', posB: '42% 50%', posA: '42% 50%' },
      { t: 'slide', photo: 'backseat-before.jpg', chip: 'Before', pos: '50% 50%' },
      { t: 'slide', photo: 'backseat-after.jpg', chip: 'After', pos: '50% 50%', cta: 'Yours next? Exact price in 60 seconds.' },
    ],
    alt: 'Before and after of the same leather back seat in an SUV. Before: crumbs ground into the seat seams, a book on the seat, toys, a sippy cup and snack wrappers on the floor. After: clean leather and a clean, empty floor.',
    ig: `Same back seat, before and after. Swipe for the full shots.

Crumbs ground into every seam of the leather, snacks and toys all over the floor. Nothing about this car was unusual. It's what a back seat looks like when kids ride in it every day.

My interior detail covers it: deep vacuum into every crevice, steam clean, leather cleaned and conditioned, plastics dressed, interior glass.

No judgment at all. I've seen everything.

${Q}

#snohomishcounty #cardetailing #interiordetailing #mobiledetailing #everettwa`,
  },
  {
    id: 'P03', week: 1, pillar: 'Offer', title: 'Rain-Ready Full Detail offer', pin: true, offer: true,
    slides: [{ t: 'offer' }],
    alt: 'Offer graphic: The Rain-Ready Full Detail, October through March. Full detail from $299, plus exterior polish ($30), ceramic wax ($20), RainX on the windows ($10) and carpet shampoo ($20), all free. Type RAIN READY in the notes when you get your quote. You don\'t pay until you love it.',
    ig: `The Rain-Ready Full Detail. Runs October through March.

Book a full detail and every extra on my menu comes free:
Exterior polish ($30)
Ceramic wax ($20)
RainX on the windows ($10)
Carpet shampoo ($20)

That's $80 of extras on me. You pay the normal full detail price, $299 to $379 depending on the vehicle, and you don't pay anything until we've walked around the car and you love it.

Why these four: polish brings back paint that's gone dull, ceramic wax makes the rain bead up and roll off, RainX helps rain clear off the windshield, and carpet shampoo deals with the mud and wet boots winter brings in.

How to get it: get your quote on my site and type RAIN READY in the notes box. Or text me at (425) 600-7897 and say RAIN READY.

I take 12 cars a week, so book early if you want a specific day.

#snohomishcounty #cardetailing #mobiledetailing #pnwrain #lakestevens`,
  },

  // ---------------- WEEK 2 ----------------
  {
    id: 'P04', week: 2, pillar: 'How I do it', title: 'How booking works',
    slides: [{ t: 'steps' }],
    alt: 'How booking works, in four steps: get your exact price in 60 seconds, Mikey texts you back, he shows up with everything (you provide a spigot and an outlet), and you pay after.',
    ig: `How booking with me works, start to finish:

1. Get your exact price in 60 seconds on my site. No "starting at" prices. Your car, your number.
2. I text you back, usually within a couple of minutes, and we pick a day.
3. I show up with everything. All I need from you is an outdoor spigot and a power outlet.
4. When I'm done we walk around the car together. You pay after, not before. Cash, card or the usual apps.

No deposit, no phone tag.

Link in bio for the 60 second quote.

#snohomishcounty #mobiledetailing #cardetailing #millcreekwa #monroewa`,
  },
  {
    id: 'P05', week: 2, pillar: 'Trust', title: 'Review: on time, as quoted',
    slides: [{ t: 'review', quote: 'Mikey showed up on time, did exactly what he said, charged exactly what he quoted. That kind of service is really rare these days.' }],
    alt: 'Five-star customer review: Mikey showed up on time, did exactly what he said, charged exactly what he quoted. That kind of service is really rare these days.',
    ig: `"Mikey showed up on time, did exactly what he said, charged exactly what he quoted."

This one means a lot, because those are the three things I actually control: when I show up, what I do, and what I charge. No upsells, no surprise add-ons at the end.

5.0 across 40 Google reviews so far. Thank you to everyone who took the time.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #snohomish #shoplocal`,
  },
  {
    id: 'P06', week: 2, pillar: 'Proof', title: 'Cargo area before/after',
    slides: [
      { t: 'split', dir: 'rows', h: 'Same cargo area.', sub: 'What it looked like when I opened it, and when I closed it.',
        before: 'cargo-before.jpg', after: 'cargo-after.jpg', posB: '50% 55%', posA: '50% 55%' },
      { t: 'fit', photo: 'cargo-before.jpg', chip: 'Before' },
      { t: 'fit', photo: 'cargo-after.jpg', chip: 'After', cta: 'Yours next? Exact price in 60 seconds.' },
    ],
    alt: 'Before and after of the same SUV cargo area. Before: a board, a sunshade, snack bags, a box and loose items scattered on the mat. After: an empty, clean cargo area and mat.',
    ig: `Same cargo area, before and after. Swipe for the full shots.

Here's what it looked like when I opened the hatch, and what it looked like when I closed it.

Cargo areas take a beating: groceries, sports gear, dogs, wet boots. They get the same deep vacuum into every corner as the rest of the car.

${Q}

#snohomishcounty #cardetailing #interiordetailing #mobiledetailing #marysvillewa`,
  },

  // ---------------- WEEK 3 ----------------
  {
    id: 'P07', week: 3, pillar: 'How I do it', title: 'Spigot and an outlet',
    slides: [{ t: 'photocard', photo: 'subaru-driveway.jpg', pos: '30% 60%',
      eyebrow: 'All I need from you',
      h: 'An outdoor spigot and a power outlet.',
      body: "I bring everything else. You don't even need to be home. Leave me the keys and come back to a finished car." }],
    alt: 'A blue Subaru in a driveway with all four doors and the hatch open, detailing gear and bags by the garage. Text: All I need from you: an outdoor spigot and a power outlet.',
    ig: `People ask what they need to have ready. Two things: an outdoor water spigot and a power outlet I can reach.

I bring everything else. You don't need to be home either. Plenty of people leave me the keys, go to work, and come back to a finished car.

Just tell me where the spigot and outlet are when you book.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #bothellwa #woodinvillewa`,
  },
  {
    id: 'P08', week: 3, pillar: 'Proof', title: 'R8 or Odyssey',
    slides: [{ t: 'duo', a: 'r8.jpg', aLabel: 'R8', aPos: '50% 60%', b: 'odyssey-interior.jpg', bLabel: 'Odyssey', bPos: '50% 50%',
      eyebrow: 'Same guy, same checklist',
      h: 'R8 or Odyssey, it gets the <em>same detail.</em>',
      body: 'My price goes by size and condition, not the badge on the hood.',
      note: 'Same steps. Same checklist. Same guy.' }],
    alt: 'Two photos side by side: a green Audi R8 with bronze wheels, and the clean dashboard of a Honda Odyssey. Text: R8 or Odyssey, it gets the same detail.',
    ig: `An R8 and an Odyssey get the same detail from me. Same steps, same checklist, same guy.

My price goes by the size of the vehicle and the shape it's in, not what it's worth. Honestly, the minivan hauling three kids to practice every day usually needs me more than the car that lives in a garage.

${Q}

#snohomishcounty #cardetailing #mobiledetailing #audir8 #hondaodyssey`,
  },
  {
    id: 'P09', week: 3, pillar: 'Local', title: 'Where I work',
    slides: [{ t: 'map' }],
    alt: 'Map of Snohomish County with pins on the twelve towns Mikey is in most weeks: Arlington, Marysville, Granite Falls, Lake Stevens, Everett, Mukilteo, Snohomish, Mill Creek, Monroe, Bothell, Woodinville and Duvall. No travel fee.',
    ig: `Where I am most weeks: Snohomish, Lake Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite Falls and Arlington.

No travel fee anywhere on that list, and the price is the same in every town.

Just outside it? Ask anyway. I'll tell you straight whether I can get there.

${Q}

#snohomishcounty #everettwa #lakestevens #monroewa #millcreekwa`,
  },

  // ---------------- WEEK 4 ----------------
  {
    id: 'P10', week: 4, pillar: 'How I do it', title: 'Rain season tip',
    slides: [{ t: 'photocard', photo: 'highlander-gloss.jpg', pos: '40% 45%',
      eyebrow: 'Rain season tip',
      h: 'Protect the paint before the rain settles in.',
      body: 'Wax or sealant gives water and road film something to slide off, instead of sitting on the clear coat.' }],
    alt: 'A black Toyota Highlander with a deep gloss on the paint, parked on a driveway. Text: Rain season tip. Protect the paint before the rain settles in.',
    ig: `Rain season tip: get protection on the paint before the rain settles in for the winter.

A coat of wax or sealant gives water and road film something to slide off, instead of sitting on the clear coat. The car stays cleaner longer, and every wash after that goes easier.

Every exterior and full detail I do ends with wax or sealant. Through March, ceramic wax is free with any full detail: type RAIN READY in the notes when you get your quote.

${Q}

#pnwrain #snohomishcounty #cardetailing #mobiledetailing #paintprotection`,
  },
  {
    id: 'P11', week: 4, pillar: 'Trust', title: 'Review: truck before selling',
    slides: [{ t: 'review', quote: 'We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles.' }],
    alt: 'Five-star customer review: We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles.',
    ig: `"We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles."

Selling a car? A detail before you list it is money well spent. A clean car photographs better, shows better, and tells a buyer it was looked after.

${Q}

#snohomishcounty #cardetailing #mobiledetailing #sellingmycar #lakestevens`,
  },
  {
    id: 'P12', week: 4, pillar: 'Trust', title: 'The guarantee',
    slides: [{
      t: 'statement', bg: 'red',
      eyebrow: 'How paying me works',
      h: "You don't pay until you <em>love it.</em>",
      body: [
        "When I'm done we walk around the car together. See something off? I fix it on the spot.",
        'Notice it later? I come back free. Still not happy? Full refund.',
      ],
      note: "I'd rather redo a car than have a review I have to explain.",
      sign: 'Mikey',
    }],
    alt: "Text post on red: You don't pay until you love it. We walk around the car together when I'm done, and I fix anything on the spot. Notice it later? I come back free.",
    ig: `You don't pay until you love it. Here's what that means in practice.

When I'm done, we walk around the car together. See something off? I fix it right there. Notice something later? I come back for free. Still not happy? You get a full refund.

I'd rather redo a car than have a review I have to explain.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #snohomish #everettwa`,
  },

  // ---------------- BANK: ready to go, use when a week needs filling ----------------
  {
    id: 'B01', week: 'bank', pillar: 'Proof', title: 'Recent driveways',
    slides: [{ t: 'grid', photos: [['lexus-front.jpg', '50% 55%'], ['volvo-driveway.jpg', '45% 60%'], ['mazda-woods.jpg', '50% 55%'], ['etron-interior.jpg', '50% 50%']],
      eyebrow: 'Recent work', h: 'A few recent driveways.' }],
    alt: 'Four recent jobs in a grid: a green Lexus on gravel, a red Volvo in a driveway, a blue Mazda in the woods, and a clean Audi interior with cream leather seats.',
    ig: `A few recent driveways.

Every one of these was detailed right where it was parked. An outdoor spigot, an outlet, and I bring the rest.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #autodetailing #snohomish`,
  },
  {
    id: 'B02', week: 'bank', pillar: 'Trust', title: 'Review: 4 times now',
    slides: [{ t: 'review', quote: 'Mikey has done my car 4 times now and each time was amazing, quick, thorough, and a fabulous result. 10/10 would recommend!' }],
    alt: 'Five-star customer review: Mikey has done my car 4 times now and each time was amazing, quick, thorough, and a fabulous result. 10/10 would recommend!',
    ig: `"Mikey has done my car 4 times now and each time was amazing, quick, thorough, and a fabulous result."

Repeat customers are the whole business when it's one guy. If I get it right the first time, you call me the second time.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #snohomish #shoplocal`,
  },
  {
    id: 'B03', week: 'bank', pillar: 'Trust', title: 'Review: never been detailed',
    slides: [{ t: 'review', quote: 'He was so professional, well spoken, hard working and thorough. My car had never been detailed before. It looks amazing now.' }],
    alt: 'Five-star customer review: He was so professional, well spoken, hard working and thorough. My car had never been detailed before. It looks amazing now.',
    ig: `"My car had never been detailed before. It looks amazing now."

First details are my favorite jobs. Years of stuff comes out and you finally see what the car looks like underneath it.

Never had yours done? ${Q}

#snohomishcounty #mobiledetailing #cardetailing #everettwa #shoplocal`,
  },
  {
    id: 'B04', week: 'bank', pillar: 'Trust', title: 'Review: protective of their car',
    slides: [{ t: 'review', quote: 'As someone who is very protective over their car, I was absolutely amazed at how Mike handled such a detailed task. Incredible attention to detail.' }],
    alt: 'Five-star customer review: As someone who is very protective over their car, I was absolutely amazed at how Mike handled such a detailed task. Incredible attention to detail.',
    ig: `"As someone who is very protective over their car, I was absolutely amazed at how Mike handled such a detailed task."

Particular about your car? Good. Tell me what you care about before I start, and that's where I'll spend the extra time.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #millcreekwa #shoplocal`,
  },
  {
    id: 'B05', week: 'bank', pillar: 'Trust', title: 'Review: on time every time',
    slides: [{ t: 'review', quote: "Great work, fair price, on time every time. Couldn't ask for more from a local detailer." }],
    alt: "Five-star customer review: Great work, fair price, on time every time. Couldn't ask for more from a local detailer.",
    ig: `"Great work, fair price, on time every time. Couldn't ask for more from a local detailer."

Showing up on time is the easiest part of this job to get right, and it's the part people remember.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #monroewa #shoplocal`,
  },
  {
    id: 'B06', week: 'bank', pillar: 'How I do it', title: 'How often to detail',
    slides: [{ t: 'photocard', photo: 'etron-interior.jpg', pos: '50% 55%',
      eyebrow: 'Good question',
      h: 'How often should you detail?',
      body: 'Most cars: a full detail every 4 to 6 months. Or join the Clean Club and never let it get that far.' }],
    alt: 'A clean Audi interior with cream leather seats and a spotless dashboard. Text: How often should you detail? Most cars: a full detail every 4 to 6 months.',
    ig: `How often should you detail your car? For most cars, a full detail every 4 to 6 months.

If you'd rather never let it get that far, that's what the Clean Club is for. I come back every 1 to 3 months for a flat $125 a visit, so the car never gets bad enough to need the deep reset.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #interiordetailing #snohomish`,
  },
];

// Account images, not posts. Rendered at their own sizes.
const ACCOUNT = [
  { id: 'profile-picture', t: 'profile', w: 1080, h: 1080 },
  { id: 'facebook-cover', t: 'cover', w: 1702, h: 630 },
];

function fbCaption(ig) {
  return ig
    .replace(/\n\n#[^\n]*$/, '')
    .replace('Exact price for your car in 60 seconds, link in bio.', 'Exact price for your car in 60 seconds: mikeysdetailing.com')
    .replace('Link in bio for the 60 second quote.', 'The 60 second quote is at mikeysdetailing.com')
    .replace('get your quote on my site', 'get your quote at mikeysdetailing.com');
}

POSTS.forEach(p => { p.fb = fbCaption(p.ig); });

module.exports = { POSTS, ACCOUNT };
