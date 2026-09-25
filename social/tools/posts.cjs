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
//   - Give before you ask (Mikey's call, and Hormozi's): the feed is tips,
//     techniques, myths and stories that are useful even to someone who never
//     books. At most one post in four asks for anything. Value posts end with
//     "save this" or a question, not a quote link; the bio does the selling.
//
// `ig` is the Instagram caption. `fb` is built from it: the "link in bio" line
// becomes the real address and the hashtags come off, because Facebook shows
// links and Instagram doesn't.

const Q = 'Exact price for your car in 60 seconds, link in bio.';

const POSTS = [
  // ---------------- WEEK 1: launch. Post all three the same day, pin them. ----------------
  {
    id: 'P01', week: 1, pillar: 'Story', title: 'Meet Mikey', pin: true,
    slides: [{
      t: 'statement', slim: 'dark',
      eyebrow: "Hi, I'm Mikey",
      h: '300+ cars in.<br>Here\'s what<br><em>I\'ve learned.</em>',
      body: [
        "I've detailed cars in driveways around Snohomish County since 2021, <strong>every one of them myself.</strong>",
        "This page is where I share what actually works: washing without scratching, getting dog hair out, killing a smell for good. Stuff you can do in your own driveway.",
      ],
      sign: 'Mikey',
    }],
    alt: "Text post on black: Hi, I'm Mikey. 300+ cars in, here's what I've learned. Detailing in driveways around Snohomish County since 2021.",
    ig: `Hi, I'm Mikey. I've detailed 300+ cars in driveways around Snohomish County since 2021, every one of them myself.

I'm not going to fill this page with ads. I'm going to post what I've actually learned doing this: how to wash your car without scratching it, how to get dog hair out of carpet, why the inside of your windshield keeps fogging up, and which car care "rules" are myths.

Most of it you can do yourself, in your own driveway, with stuff you probably already have.

Got a question about your car? Ask in the comments. I answer every one.

#cardetailingtips #carcaretips #snohomishcounty #mobiledetailing #pnw`,
  },
  {
    id: 'P02', week: 1, pillar: 'Teach', title: 'Wash without scratching', pin: true,
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'Wash day', h: 'How to wash your car <em>without scratching it.</em>',
        sub: 'A lot of the fine swirls you see in the sun come from how a car gets washed. Five habits fix most of it.' },
      { t: 'tipstep', n: 1, h: 'Rinse before you touch it.', body: 'Hose the whole car down first, top to bottom. Every bit of grit that rinses off is grit your mitt won\'t drag across the paint.' },
      { t: 'tipstep', n: 2, h: 'Use two buckets.', body: 'One with soapy water, one with plain water. Rinse the mitt in the plain bucket before it goes back in the soap, so the dirt stays out of your wash water.' },
      { t: 'tipstep', n: 3, h: 'Top down. Wheels last.', body: 'The wheels and lower panels are the dirtiest part of the car. Do them last, with their own mitt or brush, so that grime never touches the hood.' },
      { t: 'tipstep', n: 4, h: 'Skip the dish soap.', body: "It's made to cut grease, and it takes your wax or sealant with it. A bottle of car wash soap costs a few dollars and lasts months." },
      { t: 'tipstep', n: 5, h: "Dry it. Don't let it air dry.", body: 'Water drying on paint leaves spots. A clean, soft microfiber drying towel gets it all.', why: 'Bonus: wash in the shade. Soap drying on hot paint spots too.' },
      { t: 'tipend' },
    ],
    alt: 'Seven-slide tip carousel: how to wash your car without scratching it. Rinse first, use two buckets, go top down with wheels last, skip dish soap, and dry with a microfiber towel instead of letting it air dry.',
    ig: `How to wash your car at home without scratching it. Save this for your next wash day.

A lot of the fine scratches and swirls you see on paint in the sun come from how the car gets washed. These five habits fix most of it:

1. Rinse the whole car before you touch it.
2. Two buckets: one soap, one plain water to rinse your mitt.
3. Top down. Wheels and lower panels last, with their own mitt.
4. No dish soap. It strips your wax and sealant.
5. Dry it with a clean microfiber towel instead of letting it air dry.

Bonus: wash in the shade. Soap drying on hot paint leaves spots.

Questions? Ask below, I answer every one.

#cardetailingtips #carcaretips #cardetailing #snohomishcounty #pnw`,
  },
  {
    id: 'P03', week: 1, pillar: 'Teach', title: 'Back seat: the order I clean it', pin: true,
    slides: [
      { t: 'split', dir: 'cols', h: 'Same back seat.', sub: "Here's the order I clean one like this. Swipe.",
        before: 'backseat-before.jpg', after: 'backseat-after.jpg', posB: '42% 50%', posA: '42% 50%', slim: 'dark' },
      { t: 'tipstep', n: 1, h: 'Everything loose comes out first.', body: "Trash, toys, car seats, floor mats. You can't clean around stuff, and you'll find things under it you forgot were there." },
      { t: 'tipstep', n: 2, h: 'Dry before wet.', body: 'Vacuum everything before any cleaner touches it. Wet crumbs turn into paste in the seams.' },
      { t: 'tipstep', n: 3, h: 'Brush the seams, then vacuum again.', body: 'Crumbs pack into the stitching and the gap between cushions. A soft brush lifts them out so the vacuum can reach them.' },
      { t: 'tipstep', n: 4, h: 'Clean leather before you condition it.', body: 'Conditioner on dirty leather seals the dirt in. Clean it with a leather cleaner and a soft brush, wipe it off, then condition.' },
      { t: 'slide', photo: 'backseat-after.jpg', chip: 'After', pos: '50% 50%', cta: "No judgment. I've seen everything.", slim: 'dark' },
    ],
    alt: 'Before and after of the same leather back seat, then the four steps Mikey uses: everything loose out first, vacuum before any cleaner, brush the seams then vacuum again, clean leather before conditioning it.',
    ig: `Same back seat, before and after. Swipe for the order I clean one like this, because it works the same in your car.

1. Everything loose comes out first, car seats and mats included.
2. Dry before wet. Vacuum everything before any cleaner touches it, or the crumbs turn to paste.
3. Brush the seams, then vacuum again. Crumbs pack into the stitching.
4. Clean leather before you condition it. Conditioner on dirty leather seals the dirt in.

If you've got kids, your back seat probably looks like the before. No judgment at all. I've seen everything.

(If you'd rather hand it off, the link's in my bio.)

#cardetailingtips #interiordetailing #carcleaning #snohomishcounty #carcleaninghacks`,
  },

  // ---------------- WEEK 2 ----------------
  {
    id: 'P04', week: 2, pillar: 'Teach', title: 'Foggy windshield',
    slides: [
      { t: 'tipcover', eyebrow: 'Rain season', h: 'Why the inside of your windshield <em>keeps fogging up.</em>', sub: "It's not only the weather. It's the film on the glass." },
      { t: 'tipstep', n: 1, h: "There's a film on the inside of the glass.", body: 'It builds up from the dash, the vents and everyone breathing in the car. Moisture grabs onto it, so dirty glass fogs faster and clears slower.' },
      { t: 'tipstep', n: 2, h: 'Two towels.', body: 'One microfiber with glass cleaner, a second dry one right behind it to buff off what\'s left. One towel just moves the film around.' },
      { t: 'tipstep', n: 3, h: 'Spray the towel, not the glass.', body: 'Spraying the inside of the windshield puts cleaner all over your dash. Mist the towel instead.', why: 'Streak trick: wipe side to side inside, up and down outside. A streak\'s direction tells you which side it\'s on.' },
      { t: 'tipstep', n: 4, h: 'Turn on the AC with the defrost.', body: 'The AC pulls moisture out of the air, even with the heat on. Recirculate keeps the damp air in, so switch to fresh air.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: why the inside of your windshield fogs up. A film builds up on the glass; clean it with two microfiber towels, spray the towel not the glass, and run the AC with defrost on fresh air.',
    ig: `Why does the inside of your windshield fog up so fast when it rains? Part of it is the weather. Part of it is the glass.

A film builds up on the inside of the windshield from the dash, the vents and everyone breathing in the car. Moisture grabs onto that film, so dirty glass fogs faster and clears slower.

The fix:
1. Two microfiber towels. One with glass cleaner, one dry right behind it.
2. Spray the towel, not the glass, so the cleaner doesn't end up on your dash.
3. Wipe side to side on the inside, up and down on the outside. If you see a streak, its direction tells you which side it's on.
4. In the rain, run the AC with the defrost and switch off recirculate.

Save this for the first rainy morning.

#cardetailingtips #carcaretips #pnwrain #snohomishcounty #pnw`,
  },
  {
    id: 'P05', week: 2, pillar: 'Myths', title: '4 car care myths',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'Myths', h: '4 car care myths<br><em>I hear every week.</em>', swipe: 'Swipe', sub: 'Some cost you money. Some cost you paint.' },
      { t: 'tipstep', kick: 'Myth 1', h: '"Dish soap is fine."', body: "It strips wax and sealant and leaves the paint bare. Car wash soap is cheap and made for the job." },
      { t: 'tipstep', kick: 'Myth 2', h: '"Ceramic coating means I never wash it."', body: "A coating makes washing faster and easier. Dirt still lands on the car. You still wash it, it just goes quicker." },
      { t: 'tipstep', kick: 'Myth 3', h: '"An air freshener fixes the smell."', body: "It covers it for a week. The smell is coming from something: a spill in the carpet, a wet floor mat, food under a seat. Find it and it's gone for good." },
      { t: 'tipstep', kick: 'Myth 4', h: '"More tire shine looks better."', body: 'Extra slings off onto your paint the first time you drive. A thin coat on an applicator, then wipe off what\'s left.' },
      { t: 'tipend', h: 'Heard a different one?', body: "Tell me in the comments and I'll tell you straight whether it's true. I'm Mikey, I detail cars around Snohomish County." },
    ],
    alt: 'Six-slide carousel: four car care myths. Dish soap is not fine, ceramic coating does not mean you never wash, air fresheners only cover smells, and more tire shine slings onto paint.',
    ig: `Four car care myths I hear every single week:

"Dish soap is fine." It strips your wax and sealant and leaves the paint bare.

"Ceramic coating means I never have to wash it." A coating makes washing faster and easier. Dirt still lands on the car.

"An air freshener fixes the smell." It covers it for a week. Something is causing it. Find that and it's gone for good.

"More tire shine looks better." The extra slings off onto your paint the first time you drive.

Heard a different one? Drop it in the comments and I'll tell you straight whether it's true.

#cardetailingtips #carcaretips #cardetailing #ceramiccoating #snohomishcounty`,
  },
  {
    id: 'P06', week: 2, pillar: 'Teach', title: 'Winter prep',
    slides: [
      { t: 'tipcover', eyebrow: 'Before November', h: 'Get your car ready for <em>a PNW winter.</em>', sub: 'Three things I\'d do now, before the roads get sanded.', photo: 'highlander-gloss.jpg', pos: '40% 45%' },
      { t: 'tipstep', n: 1, h: 'Protect the paint.', body: 'A coat of wax or sealant gives road film and water something to slide off, instead of sitting on the clear coat. Every wash all winter gets easier.' },
      { t: 'tipstep', n: 2, h: 'Rinse the lower half after sanded roads.', body: "Sanding grit and de-icer collect on the lower panels, in the wheel wells and underneath. A quick rinse there after a cold snap does a lot, even if you skip the full wash." },
      { t: 'tipstep', n: 3, h: 'Swap to rubber floor mats.', body: 'Wet boots soak carpet mats, and wet carpet in a closed-up car is how you get that musty smell by February.' },
      { t: 'tipend' },
    ],
    alt: 'Five-slide tip carousel: get your car ready for a Pacific Northwest winter. Protect the paint with wax or sealant, rinse the lower half after sanded roads, and swap to rubber floor mats.',
    ig: `Three things I'd do to your car now, before the roads get sanded and the rain settles in:

1. Protect the paint. Wax or sealant gives road film and water something to slide off, instead of sitting on the clear coat. Every wash all winter goes easier.

2. Rinse the lower half after sanded roads. Grit and de-icer collect on the lower panels, in the wheel wells and underneath. A quick rinse after a cold snap does a lot, even if you skip the full wash.

3. Swap to rubber floor mats. Wet boots soak carpet mats, and a wet carpet in a closed-up car is how you get that musty smell by February.

Save this and do it this weekend.

#pnwwinter #cardetailingtips #carcaretips #snohomishcounty #pnw`,
  },

  // ---------------- WEEK 3 ----------------
  {
    id: 'P07', week: 3, pillar: 'Teach', title: 'Dog hair trick',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'Dog owners', h: 'The trick for dog hair <em>in car carpet.</em>', sub: "A vacuum can't grab it on its own. Here's what can." },
      { t: 'tipstep', n: 1, h: 'Put on a rubber glove.', body: 'A regular dish glove, or a rubber pet brush. Drag it across the carpet and the hair starts to ball up.' },
      { t: 'tipstep', n: 2, h: 'Short strokes, one direction.', body: 'Hair weaves itself into carpet fibers. Short pulls toward you lift it out instead of pushing it deeper.' },
      { t: 'tipstep', n: 3, h: 'Then vacuum.', body: "Now it's sitting on top in clumps, and the vacuum gets it in one pass.", why: 'Heavy shedder? This is why pet hair turns a 90 minute interior into 2 to 4 hours.' },
      { t: 'tipend' },
    ],
    alt: 'Five-slide tip carousel: getting dog hair out of car carpet. Use a rubber glove or rubber pet brush, pull in short strokes in one direction to ball the hair up, then vacuum.',
    ig: `The trick for dog hair in car carpet: a rubber glove.

A vacuum can't pull dog hair out on its own, because the hair weaves itself into the carpet fibers. So:

1. Put on a regular rubber dish glove (or use a rubber pet brush).
2. Drag it across the carpet in short strokes, one direction. The hair balls up on top.
3. Then vacuum. It comes up in one pass.

For heavy shedders, this is exactly why pet hair turns a 90 minute interior into a 2 to 4 hour job for me.

Tag someone whose car is more dog than car.

#dogsofinstagram #cardetailingtips #pethair #carcleaninghacks #snohomishcounty`,
  },
  {
    id: 'P08', week: 3, pillar: 'Teach', title: 'Spilled on the seat',
    slides: [
      { t: 'tipcover', eyebrow: 'Save this one', h: 'Spilled coffee on the seat? <em>Do this first.</em>', sub: 'What you do in the first few minutes decides whether it comes out.' },
      { t: 'tipstep', n: 1, h: "Blot. Don't rub.", body: 'Rubbing pushes it deeper and spreads it wider. Press a dry towel into it and lift, over and over.' },
      { t: 'tipstep', n: 2, h: 'A little cold water, then blot again.', body: "Dampen the spot lightly and keep blotting. You're rinsing it out of the fabric, not flooding it." },
      { t: 'tipstep', n: 3, h: "Don't soak the seat.", body: 'Water that gets into the foam underneath takes days to dry and can start to smell. Less is more.' },
      { t: 'tipstep', n: 4, h: 'Leather? Wipe it now.', body: "Leather doesn't soak much up if you get it fast. Wipe it with a damp microfiber, then dry it." },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: what to do when you spill coffee on a car seat. Blot, do not rub; use a little cold water and blot again; do not soak the seat; on leather, wipe it right away.',
    ig: `Spilled coffee on the seat? What you do in the first few minutes decides whether it comes out.

1. Blot, don't rub. Rubbing pushes it deeper and spreads it wider.
2. A little cold water, then blot again. You're rinsing it out, not flooding it.
3. Don't soak the seat. Water in the foam underneath takes days to dry and can start to smell.
4. Leather? Wipe it right away with a damp microfiber, then dry it.

Keep a microfiber towel in the glovebox. It's the cheapest car insurance there is.

#cardetailingtips #carcleaninghacks #coffee #snohomishcounty #carcaretips`,
  },

  {
    id: 'P09', week: 3, pillar: 'Story', title: 'R8 or Odyssey',
    slides: [{ t: 'duo', slim: 'dark', a: 'r8.jpg', aLabel: 'R8', aPos: '50% 60%', b: 'odyssey-interior.jpg', bLabel: 'Odyssey', bPos: '50% 50%',
      eyebrow: 'Same guy, same checklist',
      h: 'R8 or Odyssey, it gets the <em>same detail.</em>',
      body: 'My price goes by size and condition, not the badge on the hood.',
      note: 'Same steps. Same checklist. Same guy.' }],
    alt: 'Two photos side by side: a green Audi R8 with bronze wheels, and the clean dashboard of a Honda Odyssey. Text: R8 or Odyssey, it gets the same detail.',
    ig: `An R8 and an Odyssey get the same detail from me. Same steps, same checklist, same guy.

What a car is worth doesn't change how I clean it. Honestly, the minivan hauling kids to practice every day usually needs me more than the car that lives in a garage.

What's the worst thing that's ever happened in your car? Tell me below. I've probably cleaned it.

#snohomishcounty #cardetailing #mobiledetailing #audir8 #hondaodyssey`,
  },

  // ---------------- WEEK 4 ----------------
  {
    id: 'P10', week: 4, pillar: 'Teach', title: 'Bird droppings and sap',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: "Don't wait on this one", h: 'Bird droppings <em>eat into paint.</em>', sub: "Here's how to get them off without making it worse." },
      { t: 'tipstep', n: 1, h: 'Get it off within a few days.', body: "Droppings are acidic. Sitting on warm paint, they can etch into the clear coat and leave a mark that won't wash off." },
      { t: 'tipstep', n: 2, h: "Soften it. Don't scrub it.", body: 'Lay a soaked microfiber over it for a minute or two, then lift it off. Scrubbing a dry dropping grinds its grit into the paint.' },
      { t: 'tipstep', n: 3, h: 'Tree sap: same idea.', body: "Don't pick at it with a fingernail. Soften it and lift it, or use a bug and tar remover made for paint." },
      { t: 'tipend' },
    ],
    alt: 'Five-slide tip carousel: bird droppings can etch car paint. Remove them within a few days, soften with a soaked microfiber and lift instead of scrubbing, and treat tree sap the same way.',
    ig: `Bird droppings eat into paint. Here's how to get them off without making it worse.

1. Don't leave it. Droppings are acidic, and on warm paint they can etch into the clear coat and leave a mark that won't wash off.
2. Soften it, don't scrub it. Lay a soaked microfiber over it for a minute or two, then lift it off. Scrubbing a dry one grinds the grit into the paint.
3. Tree sap works the same way. Don't pick at it with a fingernail. Soften it and lift it, or use a bug and tar remover made for paint.

Parking under the trees this fall? Save this.

#cardetailingtips #carcaretips #paintprotection #snohomishcounty #pnw`,
  },
  {
    id: 'P11', week: 4, pillar: 'Teach', title: 'Find the smell',
    slides: [
      { t: 'tipcover', eyebrow: 'Mystery smell', h: "Car smells and you can't find why? <em>Check these 4 places.</em>" },
      { t: 'tipstep', n: 1, h: 'Under the seats.', body: 'Old food, a sippy cup, a gym sock. Slide each seat all the way forward and back and look with a flashlight.' },
      { t: 'tipstep', n: 2, h: 'Under the floor mats.', body: "Water gets tracked in all winter and soaks the carpet under the mat, where it can't dry out." },
      { t: 'tipstep', n: 3, h: 'Between the seats and the console.', body: 'The gap everything falls into. A flashlight and a crevice tool on the vacuum.' },
      { t: 'tipstep', n: 4, h: 'The cabin air filter.', body: "It's what the vents breathe through. If the smell gets worse with the fan on, check it. Your owner's manual says where it is and when to change it." },
      { t: 'tipend' },
    ],
    alt: "Six-slide tip carousel: car smells and you can't find why. Check under the seats, under the floor mats, between the seats and the console, and the cabin air filter.",
    ig: `Car smells and you can't figure out why? Check these four places before you buy another air freshener:

1. Under the seats. Slide each one all the way forward and back and look with a flashlight.
2. Under the floor mats. Water gets tracked in all winter and soaks the carpet underneath, where it can't dry.
3. Between the seats and the console. The gap everything falls into.
4. The cabin air filter. If the smell gets worse with the fan on, check it. Your owner's manual says where it is.

An air freshener covers a smell. Finding the source gets rid of it.

#cardetailingtips #carcleaninghacks #carcaretips #snohomishcounty #pnw`,
  },
  {
    id: 'P12', week: 4, pillar: 'Ask', title: 'The guarantee',
    slides: [{
      t: 'statement', bg: 'red', slim: 'dark',
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

  // ---------------- BANK: finished posts, use when a week needs filling ----------------
  // Reviews: no more than one every two weeks. The offer (B07) and the
  // booking/area posts are asks: only after a month of giving, and never two
  // asks in a row.
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
  {
    id: 'B07', week: 'bank', pillar: 'Offer', title: 'Rain-Ready offer (not before week 5)', offer: true,
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
  {
    id: 'B08', week: 'bank', pillar: 'Proof', title: 'Cargo area before/after',
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
  {
    id: 'B09', week: 'bank', pillar: 'How I do it', title: 'How booking works',
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
    id: 'B10', week: 'bank', pillar: 'How I do it', title: 'Spigot and an outlet',
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
    id: 'B11', week: 'bank', pillar: 'Local', title: 'Where I work',
    slides: [{ t: 'map' }],
    alt: 'Map of Snohomish County with pins on the twelve towns Mikey is in most weeks: Arlington, Marysville, Granite Falls, Lake Stevens, Everett, Mukilteo, Snohomish, Mill Creek, Monroe, Bothell, Woodinville and Duvall. No travel fee.',
    ig: `Where I am most weeks: Snohomish, Lake Stevens, Everett, Monroe, Mill Creek, Marysville, Bothell, Duvall, Mukilteo, Woodinville, Granite Falls and Arlington.

No travel fee anywhere on that list, and the price is the same in every town.

Just outside it? Ask anyway. I'll tell you straight whether I can get there.

${Q}

#snohomishcounty #everettwa #lakestevens #monroewa #millcreekwa`,
  },
  {
    id: 'B12', week: 'bank', pillar: 'Trust', title: 'Review: on time, as quoted',
    slides: [{ t: 'review', quote: 'Mikey showed up on time, did exactly what he said, charged exactly what he quoted. That kind of service is really rare these days.' }],
    alt: 'Five-star customer review: Mikey showed up on time, did exactly what he said, charged exactly what he quoted. That kind of service is really rare these days.',
    ig: `"Mikey showed up on time, did exactly what he said, charged exactly what he quoted."

This one means a lot, because those are the three things I actually control: when I show up, what I do, and what I charge. No upsells, no surprise add-ons at the end.

5.0 across 40 Google reviews so far. Thank you to everyone who took the time.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #snohomish #shoplocal`,
  },
  {
    id: 'B13', week: 'bank', pillar: 'Trust', title: 'Review: truck before selling',
    slides: [{ t: 'review', quote: 'We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles.' }],
    alt: 'Five-star customer review: We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles.',
    ig: `"We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles."

Selling a car? A detail before you list it is money well spent. A clean car photographs better, shows better, and tells a buyer it was looked after.

${Q}

#snohomishcounty #cardetailing #mobiledetailing #sellingmycar #lakestevens`,
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
    .replace('get your quote on my site', 'get your quote at mikeysdetailing.com')
    .replace("(If you'd rather hand it off, the link's in my bio.)", "(If you'd rather hand it off: mikeysdetailing.com)");
}

POSTS.forEach(p => { p.fb = fbCaption(p.ig); });

module.exports = { POSTS, ACCOUNT };
