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

  // ---------------- WEEK 5 ----------------
  // October. W01 and W02 come from the winter set, kept under their own ids.
  {
    id: 'W01', week: 5, pillar: 'Teach', title: 'Check the cowl',
    slides: [
      { t: 'tipcover', eyebrow: 'Before the heavy rain', h: 'Wet passenger footwell? <em>Check the cowl.</em>', sub: 'The five-minute check that keeps the inside of your car dry.' },
      { t: 'tipstep', n: 1, h: 'Find it.', body: 'The cowl is the plastic panel along the bottom of the windshield, under the wipers. Rain runs into it and out through drains underneath.' },
      { t: 'tipstep', n: 2, h: 'Look for needles and leaves.', body: 'Fir needles, maple seeds and leaves pile up in there all fall. Once they mat down, the drains clog and the water has to go somewhere.' },
      { t: 'tipstep', n: 3, h: 'Clear what you can reach.', body: "Lift the wipers off the glass first so one can't snap back onto the windshield. Then pull out what's on top by hand or with a shop vac." },
      { t: 'tipstep', n: 4, h: 'Still damp inside? Get it looked at.', body: "Some drains sit under the panel, out of reach, and a mechanic can clear those. Don't leave the carpet wet: that's how the musty smell starts." },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: a wet passenger footwell often starts at the cowl, the panel under the wipers. Look for needles and leaves clogging its drains, lift the wipers and clear what you can reach, and get a mechanic to clear the drains you cannot.',
    ig: `Wet passenger footwell after a heavy rain? Before you blame a seal, check the cowl.

The cowl is the plastic panel along the bottom of the windshield, under the wipers. Rain runs into it and drains out underneath. In the fall it fills with fir needles, maple seeds and leaves, the drains clog, and the water finds its own way out. Sometimes that's into the car.

1. Lift the wipers off the glass so one can't snap back onto the windshield.
2. Pull out what's sitting on top, by hand or with a shop vac.
3. Still damp inside after the next rain? Some drains are under the panel, and a mechanic can clear those.

Don't leave the carpet wet. That's how the musty smell starts.

Save this for the next windy week.

#pnwrain #carcaretips #cardetailingtips #snohomishcounty #woodinville`,
  },
  {
    id: 'P13', week: 5, pillar: 'Teach', title: 'Pumpkin patch mud',
    slides: [
      { t: 'tipcover', eyebrow: 'Pumpkin patch season', h: 'Mud on the carpet? <em>Let it dry first.</em>', sub: 'Wet mud smears in. Dry mud lifts out.' },
      { t: 'tipstep', n: 1, h: 'Leave the carpet alone tonight.', body: 'Scrubbing wet mud pushes it down into the carpet fibers and spreads it wider. Pull the floor mats out and dry them in the house.' },
      { t: 'tipstep', n: 2, h: 'Break it up once it\'s dry.', body: 'When it\'s dry and crumbly, a stiff brush knocks it loose from the fibers. Work it from a couple of directions.' },
      { t: 'tipstep', n: 3, h: 'Vacuum slowly, twice.', body: 'Slow passes pick up the fine dust a fast pass leaves behind. Go over it again from the other direction.' },
      { t: 'tipstep', n: 4, h: 'Blot what\'s left.', body: 'A damp microfiber, pressed in and lifted. A brown shadow that still won\'t come out is what a carpet extractor is for.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: getting mud out of car carpet. Leave wet mud alone and dry the mats inside, break it up with a stiff brush once dry, vacuum slowly twice, then blot what is left with a damp microfiber.',
    ig: `Muddy boots from the pumpkin patch? Don't scrub the carpet tonight. Let the mud dry first.

Wet mud smears down into the carpet fibers. Dry mud breaks up and lifts out.

1. Pull the floor mats out and dry them in the house. Leave the carpet alone tonight.
2. Once it's dry and crumbly, knock it loose with a stiff brush.
3. Vacuum slowly, twice, from two directions.
4. Blot what's left with a damp microfiber. A shadow that still won't come out is what a carpet extractor is for.

Save this for the corn maze trip. Which patch does your family go to?

#pumpkinpatch #snohomish #carcleaninghacks #carcaretips #snohomishcounty`,
  },
  {
    id: 'W02', week: 5, pillar: 'Teach', title: 'Leaves on the paint',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'October', h: 'Wet leaves on your paint <em>leave a mark.</em>', sub: 'Why that brown shadow shows up, and how to keep it off.' },
      { t: 'tipstep', n: 1, h: 'Leaves leak tannin.', body: 'A wet leaf sitting on the paint for days bleeds the same brown stain it leaves on a sidewalk. On white and silver cars you can see the outline.' },
      { t: 'tipstep', n: 2, h: "Don't wipe them off dry.", body: 'There is grit under every leaf. Rinse them off, blow them off, or lift them straight up instead of dragging them across the clear coat.' },
      { t: 'tipstep', n: 3, h: 'Check the corners.', body: 'Leaves hide where the hood meets the windshield, in the door gaps and around the hatch. They stay wet there the longest.' },
      { t: 'tipstep', n: 4, h: 'Already stained?', body: 'A wash takes the fresh ones off. One that sat for weeks can take a polish to get out. Wax underneath makes the next ones slide off.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: wet leaves leak tannin and can stain paint, especially white and silver. Rinse or lift them off instead of wiping dry, check the corners where they hide, and old stains can take a polish.',
    ig: `Wet leaves on your paint leave a mark. Here's why, and how to keep it off.

A wet leaf leaks tannin, the same brown stain it leaves on a sidewalk. Let one sit on the hood for a couple of weeks and you can see its outline, especially on white and silver cars.

1. Don't wipe them off dry. There's grit under every leaf. Rinse them off, blow them off, or lift them straight up.
2. Check the corners: where the hood meets the windshield, the door gaps, around the hatch. They stay wet there the longest.
3. Already stained? A wash takes the fresh ones off. One that's been there for weeks can take a polish to get out.

What's dropping on your car right now, maple or oak?

#pnwfall #carcaretips #cardetailingtips #snohomishcounty #millcreekwa`,
  },

  // ---------------- WEEK 6 ----------------
  // W03 has to go up before the clocks go back on November 1. B07 is the month's
  // ask: the live Rain-Ready offer, word for word as the site has it.
  {
    id: 'P14', week: 6, pillar: 'Teach', title: 'Wet dog season',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'Rain season, dog owners', h: 'Wet dog in the car? <em>Three things before you drive.</em>', sub: 'The musty car in February starts with the damp seats in October.' },
      { t: 'tipstep', n: 1, h: 'Towel them at the door.', body: 'Keep an old towel in the car and dry paws and belly before they jump in. Most of the water and mud is on the bottom half of the dog.' },
      { t: 'tipstep', n: 2, h: 'Cover the seat.', body: 'A washable seat cover or an old blanket. Wet fur on cloth seats soaks through to the foam underneath, and that takes days to dry.' },
      { t: 'tipstep', n: 3, h: 'Dry the car out after.', body: 'Heat on fresh air, not recirculate, for the drive home. Then take the wet towel and blanket inside. A damp car shut up overnight smells musty by morning.' },
      { t: 'tipend', h: 'Save this for the next muddy walk.', body: "Hair already woven into the carpet? A rubber dish glove pulls it out (that's an older post of mine). I'm Mikey, I detail cars around Snohomish County." },
    ],
    alt: 'Five-slide tip carousel: wet dog in the car. Towel the dog off at the door, cover the seat with a washable cover or blanket, and dry the car out with heat on fresh air and the wet towels taken inside.',
    ig: `Wet dog in the car? Three things before you drive, because the musty car in February starts with damp seats in October.

1. Towel them at the door. Paws and belly. Most of the water and mud is on the bottom half of the dog.
2. Cover the seat. A washable seat cover or an old blanket. Wet fur on cloth seats soaks through to the foam, and that takes days to dry.
3. Dry the car out after. Heat on fresh air, not recirculate, on the drive home, and take the wet towel and blanket inside. A damp car shut up overnight smells musty by morning.

Save this for the next muddy walk. Whose dog refuses to sit on the towel?

#dogsofinstagram #pnwdogs #carcaretips #snohomishcounty #lakestevens`,
  },
  {
    id: 'W03', week: 6, pillar: 'Teach', title: 'Streaky wipers',
    slides: [
      { t: 'tipcover', eyebrow: 'Before the clocks go back', h: 'Streaky wipers? <em>Check this first.</em>', sub: 'Most streaks come from the glass, not the blade.' },
      { t: 'tipstep', n: 1, h: 'Wipe the blade edge.', body: 'Run a damp paper towel down the rubber edge of each blade. The black line that comes off is what has been smearing.' },
      { t: 'tipstep', n: 2, h: 'Clean where the wipers park.', body: 'Road film builds up along the bottom of the windshield, right where the blades rest. Glass cleaner, then a dry towel.' },
      { t: 'tipstep', n: 3, h: 'Still streaking? Replace them.', body: 'If they still smear or skip after both of those, the rubber is worn out. Blades are cheap, and the dark wet evenings are coming.' },
      { t: 'tipstep', n: 4, h: 'RainX goes on clean glass only.', body: 'On clean glass, rain sheets off at speed and you use the wipers less. On dirty glass it just smears over the film.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: fixing streaky wipers. Wipe the blade edge with a damp paper towel, clean the strip of windshield where the wipers park, replace blades that still smear, and only put RainX on clean glass.',
    ig: `Streaky wipers? Most of the time it's the glass, not the blade.

1. Wipe the blade edge. A damp paper towel down the rubber. The black line that comes off is what's been smearing.
2. Clean where the wipers park. Road film builds up along the bottom of the windshield, right where the blades rest.
3. Still streaking or skipping after both? The rubber's worn out. Blades are cheap.
4. RainX only goes on clean glass. On clean glass the rain sheets off at speed. On dirty glass it smears over the film.

The clocks go back November 1. Do this before the dark, wet drives home.

Save this one.

#pnwrain #carcaretips #cardetailingtips #snohomishcounty #everettwa`,
  },
  {
    id: 'B07', week: 6, pillar: 'Offer', title: 'Rain-Ready offer (not before week 5)', offer: true,
    slides: [{ t: 'offer' }],
    alt: 'Offer graphic: The Rain-Ready Full Detail, book by December 31. Full detail from $369, plus exterior polish ($30), ceramic wax ($20) and RainX on the glass ($10), all free. Pick Full Detail in the quote and the extras go on by themselves. You don\'t pay until you love it.',
    ig: `The Rain-Ready Full Detail. Book it by December 31.

From October to March your car is wet more days than it's dry. So every Full Detail booked by December 31 gets the three things that help most in the rain, free:
Exterior polish ($30)
Ceramic wax ($20)
RainX on the glass ($10)

Polish first, so the wax goes onto clean paint instead of sealing the film in. Ceramic wax on top, so rain beads and rolls off. RainX on the windshield, so water sheets off at speed on a dark wet night.

That's on top of the normal full detail (from $369, exact price in 60 seconds). And you don't pay anything until we've walked around the car and you love it.

How to get it: pick Full Detail in the quote on my site and the extras go on by themselves. Or text me at (425) 600-7897 and say Rain-Ready.

The quote on my site shows my real open times, so you can grab a day without texting back and forth.

#snohomishcounty #cardetailing #mobiledetailing #pnwrain #lakestevens`,
  },

  // ---------------- WEEK 7 ----------------
  // Halloween week. P15 still beats the clocks going back on November 1.
  {
    id: 'P15', week: 7, pillar: 'Teach', title: 'Headlights before the clocks go back',
    slides: [
      { t: 'tipcover', eyebrow: 'The clocks go back Nov 1', h: 'Dim headlights? <em>Check the lens first.</em>', sub: 'Four checks before the drives home turn dark.' },
      { t: 'tipstep', n: 1, h: 'Wipe off the road film.', body: 'The same grey film that coats the lower doors coats your headlights and taillights. A wet towel, then a dry one, every time you stop for gas.' },
      { t: 'tipstep', n: 2, h: "Yellow or cloudy? That's the plastic.", body: "Headlight lenses have a clear protective layer that the sun breaks down over the years. The haze is on the outside of the lens, and a wash won't take it off." },
      { t: 'tipstep', n: 3, h: 'Restoring them? Seal it after.', body: 'A restoration sands and polishes the haze off. Without a UV sealant on top, the bare plastic can go cloudy again within months.' },
      { t: 'tipstep', n: 4, h: 'Walk around with them on.', body: 'Park facing the garage door at dusk. Low beams, high beams, turn signals, and have someone press the brake while you look at the back.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: dim headlights before the clocks go back. Wipe road film off the lenses, yellow haze is the lens plastic breaking down, seal the lens after a restoration, and check every bulb at dusk.',
    ig: `Dim headlights? Check the lens before you buy new bulbs. The clocks go back November 1, and the drive home is about to be dark.

1. Wipe off the road film. The grey film on your lower doors is on your headlights and taillights too. A wet towel, then a dry one, whenever you stop for gas.
2. Yellow or cloudy? That's the plastic. The clear protective layer on the lens breaks down in the sun over the years. It's on the outside, and a wash won't take it off.
3. Restoring them? Seal it after. Sanding and polishing takes the haze off. Without a UV sealant on top, it can go cloudy again within months. (I do restorations as an add-on, but a parts store kit works too if you seal it.)
4. Walk around with them on. Park facing the garage door at dusk: low beams, high beams, signals, and someone on the brake while you check the back.

Save this one.

#pnwwinter #carcaretips #cardetailingtips #snohomishcounty #marysvillewa`,
  },
  {
    id: 'P16', week: 7, pillar: 'Teach', title: 'Sticky cup holders',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'Candy season', h: 'Sticky cup holders? <em>Soak it, don\'t scrape it.</em>', sub: 'Soda rings, coffee drips and melted candy, out without scratching the plastic.' },
      { t: 'tipstep', n: 1, h: 'See if it lifts out.', body: 'A lot of cup holders have a rubber or plastic insert that pulls straight up. If yours does, wash it in the sink with warm soapy water.' },
      { t: 'tipstep', n: 2, h: "If it doesn't, soak it.", body: 'Lay a warm, wet microfiber in the bottom for a few minutes. The sugar softens and wipes out instead of fighting you.' },
      { t: 'tipstep', n: 3, h: 'A soft brush for the ridges.', body: 'An old toothbrush or a detail brush gets into the corners. Skip the butter knife and the screwdriver: they scratch the plastic for good.' },
      { t: 'tipstep', n: 4, h: 'Dry it, then line it.', body: 'A silicone cup holder liner catches the next spill, and next time it just goes in the sink.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: cleaning sticky cup holders. Check if the insert lifts out and wash it in the sink, otherwise soak the gunk with a warm wet microfiber, use a soft brush in the ridges instead of a knife, then dry it and add a silicone liner.',
    ig: `Candy season means sticky cup holders. Soak them, don't scrape them.

1. See if it lifts out. Lots of cup holders have an insert that pulls straight up. If yours does, it goes in the sink with warm soapy water.
2. If it doesn't, soak it. A warm, wet microfiber in the bottom for a few minutes softens the sugar so it wipes out.
3. A soft brush for the ridges. An old toothbrush works. Skip the butter knife and the screwdriver, they scratch the plastic for good.
4. Dry it, then line it. A silicone liner catches the next spill and goes in the sink next time.

What's the stickiest thing you've found in a cup holder?

#halloween #carcleaninghacks #carcaretips #snohomishcounty #millcreekwa`,
  },
  {
    id: 'P17', week: 7, pillar: 'Teach', title: 'The trunk, October to March',
    slides: [
      { t: 'tipcover', eyebrow: 'Before the first freeze', h: "What I'd keep in the trunk <em>October to March.</em>", sub: 'Four cheap things that save the glass, the paint and the carpet.' },
      { t: 'tipstep', n: 1, h: 'Winter washer fluid.', body: 'Summer fluid can freeze in the lines on a cold night, right when the road spray is worst. Get a bottle rated below freezing and top up before the tank runs dry.' },
      { t: 'tipstep', n: 2, h: 'Two microfiber towels.', body: 'One for the inside of the glass when it fogs, one for mirrors and lights. Paper towels leave lint and streaks.' },
      { t: 'tipstep', n: 3, h: 'A snow brush with a scraper.', body: 'Brush the snow off first, then scrape. A scraper dragged through snow and grit is dragging that grit across the glass.' },
      { t: 'tipstep', n: 4, h: 'A trash bag.', body: 'Wet umbrellas, wet jackets and muddy boots go in it instead of soaking into the carpet on the way home.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: what to keep in the trunk from October to March. Winter washer fluid rated below freezing, two microfiber towels, a snow brush with a scraper, and a trash bag for wet gear.',
    ig: `What I'd keep in the trunk from October to March. Four cheap things:

1. Winter washer fluid. Summer fluid can freeze in the lines on a cold night, right when the road spray is worst. Get one rated below freezing and top up before it runs dry.
2. Two microfiber towels. One for the inside of the glass when it fogs, one for mirrors and lights. Paper towels leave lint.
3. A snow brush with a scraper. Brush the snow off first, then scrape, so you're not dragging grit across the glass.
4. A trash bag. Wet umbrellas, jackets and muddy boots go in it instead of soaking into the carpet.

Save this and stock it this weekend. What's in your trunk right now?

#pnwwinter #carcaretips #cardetailingtips #snohomishcounty #monroewa`,
  },

  // ---------------- WEEK 8 ----------------
  // First frosts. B12 is the second and last ask of the month, six posts after B07.
  {
    id: 'W04', week: 8, pillar: 'Myths', title: '4 winter car myths',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'Myths', h: '4 winter car myths <em>I hear every year.</em>', swipe: 'Swipe', sub: 'One of them can crack your windshield.' },
      { t: 'tipstep', kick: 'Myth 1', h: '"No point washing it in winter."', body: "Road film and de-icer sit on the paint until something takes them off, and rain doesn't. A wash every few weeks keeps them from settling in." },
      { t: 'tipstep', kick: 'Myth 2', h: '"Hot water clears a frozen windshield."', body: 'Hot water on freezing glass can crack it. Start the car, run the defroster, and use a plastic scraper.' },
      { t: 'tipstep', kick: 'Myth 3', h: '"The rain washes it for me."', body: 'Rain lands dirty and dries in spots. It moves the dust around. It does not take off the film underneath.' },
      { t: 'tipstep', kick: 'Myth 4', h: '"Wax is a summer thing."', body: "Wax matters more in the rain, not less. It's what makes water bead and roll off instead of sitting on the paint for days." },
      { t: 'tipend', h: 'Got a winter one I missed?', body: "Put it in the comments and I'll tell you straight whether it's true. I'm Mikey, I detail cars around Snohomish County." },
    ],
    alt: 'Six-slide carousel: four winter car myths. Washing in winter is worth it, hot water can crack a frozen windshield, rain does not wash a car, and wax matters more in the rain.',
    ig: `Four winter car myths I hear every year:

"No point washing it in winter." Road film and de-icer sit on the paint until something takes them off, and rain doesn't.

"Hot water clears a frozen windshield." Hot water on freezing glass can crack it. Defroster and a plastic scraper.

"The rain washes it for me." Rain lands dirty and dries in spots. It moves the dust around, it doesn't take the film off.

"Wax is a summer thing." Wax matters more in the rain. It's what makes water bead and roll off instead of sitting on the paint.

Got a winter one I missed? Comment it and I'll tell you straight.

#pnwwinter #carcaretips #cardetailing #snohomishcounty #lakestevens`,
  },
  {
    id: 'P18', week: 8, pillar: 'Teach', title: 'Frozen door seals',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'First frosty mornings', h: 'Door frozen shut? <em>It\'s the rubber seals.</em>', sub: 'Two minutes now saves a torn seal later.' },
      { t: 'tipstep', n: 1, h: 'Why it sticks.', body: 'Rain sits on the rubber seals around the doors. On a frosty night that water freezes the seal to the door frame.' },
      { t: 'tipstep', n: 2, h: 'Wipe the seals clean.', body: 'Open each door and wipe the rubber with a damp microfiber, then dry it. Grit in the seal holds water and wears the rubber down.' },
      { t: 'tipstep', n: 3, h: 'Then a rubber protectant.', body: 'Silicone spray or a rubber seal conditioner, put on a towel first and wiped onto the seal. Water beads off it instead of freezing the door shut.' },
      { t: 'tipstep', n: 4, h: 'Stuck anyway? Push, then pull.', body: 'Lean firmly on the door a few times to crack the ice, then open it. Yanking a frozen door is how seals tear.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: doors frozen shut. Water on the rubber seals freezes them to the frame; wipe the seals clean and dry, wipe on a silicone or rubber protectant from a towel, and if stuck, push on the door before pulling.',
    ig: `Door frozen shut on a frosty morning? It's the rubber seals, and two minutes now fixes it.

Rain sits on the seals around your doors. On a frosty night that water freezes the seal to the frame.

1. Open each door and wipe the rubber with a damp microfiber, then dry it. Grit in the seal holds water and wears it down.
2. Put a little silicone spray or rubber seal conditioner on a towel, not straight on the car, and wipe it onto the seals. Water beads off instead of freezing.
3. Stuck anyway? Lean on the door a few times to crack the ice, then open it. Yanking it is how seals tear.

Save this for the first frost. Has a door ever beaten you?

#pnwwinter #carcaretips #cardetailingtips #snohomishcounty #duvallwa`,
  },
  {
    id: 'B12', week: 8, pillar: 'Trust', title: 'Review: on time, as quoted',
    slides: [{ t: 'review', quote: 'Mikey showed up on time, did exactly what he said, charged exactly what he quoted. That kind of service is really rare these days.' }],
    alt: 'Five-star customer review: Mikey showed up on time, did exactly what he said, charged exactly what he quoted. That kind of service is really rare these days.',
    ig: `"Mikey showed up on time, did exactly what he said, charged exactly what he quoted."

This one means a lot, because those are the three things I actually control: when I show up, what I do, and what I charge. No upsells, no surprise add-ons at the end.

5.0 across 41 Google reviews so far. Thank you to everyone who took the time.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #snohomish #shoplocal`,
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

If you'd rather never let it get that far, that's what the Clean Club is for. I come back every 4 or 8 weeks for a flat $125 a visit, so the car never gets bad enough to need the deep reset.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #interiordetailing #snohomish`,
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
    id: 'B13', week: 'bank', pillar: 'Trust', title: 'Review: truck before selling',
    slides: [{ t: 'review', quote: 'We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles.' }],
    alt: 'Five-star customer review: We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles.',
    ig: `"We first hired Mikey to detail our truck before selling it. He did a great job so we had him come back for our other 3 vehicles."

Selling a car? A detail before you list it is money well spent. A clean car photographs better, shows better, and tells a buyer it was looked after.

${Q}

#snohomishcounty #cardetailing #mobiledetailing #sellingmycar #lakestevens`,
  },
  {
    id: 'B14', week: 'bank', pillar: 'Story', title: 'Driveway or garage',
    slides: [{ t: 'photocard', slim: 'dark', photo: 'pilot-garage.jpg', pos: '45% 55%',
      eyebrow: 'A customer\'s garage',
      h: 'Driveway or garage. I work where your car is.',
      body: "This one's in the owner's garage, not a shop. All I need is an outdoor spigot and a power outlet within reach." }],
    alt: "A grey Honda Pilot parked in a customer's garage, with another car in the next bay. Text: Driveway or garage. I work where your car is.",
    ig: `No, that's not my shop. It's a customer's garage.

I don't have a shop. I come to wherever your car lives: the driveway, the garage, wherever it's parked. All I need is an outdoor spigot and a power outlet within reach, and I bring the rest.

Where does your car live? Tell me below.

#mobiledetailing #snohomishcounty #cardetailing #garagelife #pnw`,
  },
  // ---------------- WINTER: November to December, in this order ----------------
  // W01 to W04 were scheduled into weeks 5 to 8 on 2026-10-05; these five are
  // what's left. Three teach, two ask, and the two asks (W06 gift cards, W08
  // winter spigots) never sit next to each other. W06 by early December, W09
  // once the passes have snow. W06 sells something: Mikey's yes first, same
  // as B07.
  {
    id: 'W05', week: 'winter', pillar: 'Teach', title: 'The crumb cave',
    slides: [
      { t: 'tipcover', eyebrow: 'Parents', h: 'The crumb cave <em>under the car seat.</em>', sub: 'Cleaning under and around it without messing up the install.' },
      { t: 'tipstep', n: 1, h: 'Only take it out if you can put it back right.', body: "If you remove it, reinstall it the way the seat's manual says. Not sure it's back in right? A certified car seat tech can check it." },
      { t: 'tipstep', n: 2, h: 'Crevice tool on every seam.', body: 'Along the seams of the car seat and under the buckle pad. That is where the crackers and the cereal end up.' },
      { t: 'tipstep', n: 3, h: 'Straps: read the manual first.', body: "Many car seat makers say the harness straps get surface-cleaned with mild soap and water, never soaked, bleached or machine-washed, because that can weaken them. Your manual says what yours needs." },
      { t: 'tipstep', n: 4, h: 'Careful with mats underneath.', body: "Vacuum the dent in the car's seat cushion. Before adding a protector mat under the car seat, check its manual: some makers don't allow them." },
      { t: 'tipend', h: 'Save this for the next big crumb day.' },
    ],
    alt: 'Six-slide tip carousel: cleaning around a child car seat. Only remove it if you can reinstall it per the manual, use a crevice tool on every seam, surface-clean harness straps per the manual, and check the manual before adding a mat underneath.',
    ig: `The crumb cave under the car seat. Here's how I'd clean it without messing up the install.

1. Only take the seat out if you can put it back the way its manual says. Not sure it's back in right? A certified car seat tech can check it.
2. Crevice tool along every seam and under the buckle pad. That's where the crackers end up.
3. Straps: read the manual first. Many makers say surface-clean with mild soap and water, never soak, bleach or machine-wash them, because that can weaken them.
4. Vacuum the dent in the car's seat cushion underneath. Before adding a protector mat under the car seat, check the manual: some makers don't allow them.

Save this for the next big crumb day. Parents, what's the strangest thing you've found under there?

#momlife #carcleaninghacks #carcaretips #snohomishcounty #marysvillewa`,
  },
  {
    id: 'W06', week: 'winter', pillar: 'Ask', title: 'Gift cards (Mikey\'s yes first)', offer: true,
    slides: [{
      t: 'statement', slim: 'dark',
      eyebrow: 'For the person who has everything',
      h: "Somebody's getting <em>a clean car.</em>",
      body: [
        'Gift cards for any detail I do, in any amount. They never expire and there are no fees.',
        "Text me who it's for and how much. You get a card with its own number to print, forward, or tuck in a stocking.",
      ],
      note: 'Text (425) 600-7897 and say gift card.',
      sign: 'Mikey',
    }],
    alt: "Text post: Somebody's getting a clean car. Gift cards for any detail, in any amount, that never expire and have no fees. Text 425-600-7897 and say gift card.",
    ig: `Somebody on your list drives a car that needs me.

Gift cards are good for any detail I do: interior, exterior, full detail, ceramic coating or paint correction. Any amount you want. They never expire and there are no fees, and if the job costs less than the card, the rest stays on it for next time.

Text me at (425) 600-7897 with who it's for and how much. You get a card with its own number that you can print, forward, or tuck in a stocking. They text me the number, I come to their driveway, and the card comes off the price.

Who's the one person you know whose car could really use it?

#giftideas #shoplocal #snohomishcounty #mobiledetailing #christmasgifts`,
  },
  {
    id: 'W07', week: 'winter', pillar: 'Teach', title: 'Selling it? Detail before the photos',
    slides: [
      { t: 'tipcover', dark: true, eyebrow: 'Selling or trading in', h: 'Clean it <em>before the photos.</em>', sub: 'Buyers decide from the pictures. Here is what they notice.' },
      { t: 'tipstep', n: 1, h: 'The smell goes first.', body: "A buyer opens the door before anything else. Smoke, dog or old food is the first thing they'll ask money off for." },
      { t: 'tipstep', n: 2, h: 'Door jambs and glass.', body: 'Open doors show the jambs in every interior photo. Hazy glass makes the whole car look older than it is.' },
      { t: 'tipstep', n: 3, h: 'Empty it completely.', body: 'Door pockets, glovebox, trunk, under the seats. A car full of stuff looks like a car that was lived in hard.' },
      { t: 'tipstep', n: 4, h: 'Shoot on a gray day.', body: 'Hard sun glares off the paint and hides the shape of the car. A cloudy PNW afternoon is actually perfect for car photos.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: getting a car ready to sell. Deal with the smell first, clean the door jambs and glass, empty it completely, and photograph it on a cloudy day.',
    ig: `Selling your car or trading it in this winter? Clean it before you take the photos. Buyers decide from the pictures.

1. The smell goes first. A buyer opens the door before anything else, and smoke, dog or old food is the first thing they ask money off for.
2. Door jambs and glass. Open doors show the jambs in every interior photo, and hazy glass makes the whole car look older.
3. Empty it completely. Door pockets, glovebox, trunk, under the seats.
4. Shoot on a gray day. Hard sun glares off the paint. A cloudy afternoon is perfect, and we get plenty.

Save this for when it's time to sell.

#carsforsale #cardetailingtips #snohomishcounty #pnw #everettwa`,
  },
  {
    id: 'W08', week: 'winter', pillar: 'How I do it', title: 'Winter spigots',
    slides: [{
      t: 'statement', slim: 'dark',
      eyebrow: 'Booked on a cold day?',
      h: 'If your spigot is <em>shut off for winter</em>',
      body: [
        "Lots of outdoor spigots get turned off from inside for the winter so the pipe doesn't freeze. That's smart.",
        "If yours is, turn it back on the day of the job and off again after I leave. No water, no wash.",
      ],
      note: 'All I need is an outdoor spigot and a power outlet. I bring the rest.',
      sign: 'Mikey',
    }],
    alt: 'Text post: if your outdoor spigot is shut off for winter, turn it back on the day of the job and off again after. All Mikey needs is an outdoor spigot and a power outlet.',
    ig: `A winter thing nobody thinks about until the day of the job: the outdoor spigot.

Lots of people shut their outdoor spigot off from inside for the winter so the pipe doesn't freeze. That's smart. If yours is, turn it back on the day I'm coming and back off after I leave.

All I need from you is an outdoor spigot and a power outlet within reach of the car. I bring everything else.

${Q}

#snohomishcounty #mobiledetailing #cardetailing #pnwwinter #monroewa`,
  },
  {
    id: 'W09', week: 'winter', pillar: 'Teach', title: 'Back from the pass',
    slides: [
      { t: 'tipcover', eyebrow: 'Ski and snow trips', h: 'Back from the pass? <em>Rinse underneath.</em>', sub: 'What a snowy trip up US-2 leaves on your car, and the ten minutes that take it off.' },
      { t: 'tipstep', n: 1, h: "What's on the road up there.", body: 'When it snows, the passes get sand and de-icer. Both get sprayed into the wheel wells, onto the lower doors and underneath the car.' },
      { t: 'tipstep', n: 2, h: 'Rinse within a few days.', body: 'Aim the hose into the wheel wells and along the bottom of the doors. No hose? A self-serve wand at a coin wash does the job.' },
      { t: 'tipstep', n: 3, h: 'Then the inside.', body: 'Snow melts off boots into the carpet. Pull the mats out that night and let them dry inside the house, not in the trunk.' },
      { t: 'tipstep', n: 4, h: 'Wet gear on a towel.', body: 'Wet ski bags, boards and jackets drip onto seats and cargo carpet. An old towel or blanket underneath saves the carpet.' },
      { t: 'tipend' },
    ],
    alt: 'Six-slide tip carousel: after a snowy trip over the pass, rinse sand and de-icer out of the wheel wells and off the lower doors within a few days, dry the floor mats inside, and put wet gear on a towel.',
    ig: `Back from a snowy trip up US-2? Give your car ten minutes before the week starts.

1. When it snows, the passes get sand and de-icer, and both get sprayed into your wheel wells, onto the lower doors and underneath.
2. Rinse within a few days. Aim the hose into the wheel wells and along the bottom of the doors. No hose? A self-serve wand at a coin wash does it.
3. Then the inside. Pull the mats out that night and dry them in the house, not in the trunk.
4. Wet ski bags and jackets go on an old towel, not straight on the seats.

Save this for your first trip up this season. Stevens or Baker?

#stevenspass #pnwwinter #carcaretips #snohomishcounty #monroewa`,
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
