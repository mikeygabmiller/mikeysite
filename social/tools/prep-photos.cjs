// Makes the post-ready copies of site photos in social/photos/.
//
// Why this exists: the originals in /images are what the website serves, and
// several of them show a readable license plate or a house number. A plate on
// Instagram tells anyone which car was parked at which house, and the customer
// never agreed to that. So every photo that goes on social gets its identifying
// bits blurred here, once, and the post templates only ever read social/photos/.
//
// Adding a photo: add a line below with its blur boxes (x, y, w, h in the
// original image's pixels), run `npm run photos`, then LOOK at the output.
// Boxes are drawn by eye; a plate one pixel outside the box is still a plate.
//
// unnamed (5).webp (the Honda Pilot) is left out on purpose: it was shot in a
// shop bay next to a Jeep with its hood up, which reads as a garage and fights
// "I come to you".

const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'images');
const OUT = path.join(__dirname, '..', 'photos');

const PHOTOS = [
  // Before/after pairs. Same Acura MDX, same angle, so they read as a pair.
  { src: 'ba_2.jpg', out: 'backseat-before.jpg' },
  { src: 'ba_1.jpg', out: 'backseat-after.jpg' },
  // The cargo pair carries a thin coloured strip along the bottom edge from
  // whatever app first exported them; cropping 21px takes it off both equally.
  { src: 'ba_4.jpg', out: 'cargo-before.jpg', crop: { left: 0, top: 0, width: 900, height: 682 } },
  { src: 'ba_3.jpg', out: 'cargo-after.jpg', crop: { left: 0, top: 0, width: 900, height: 682 } },

  { src: 'unnamed (3).webp', out: 'lexus-front.jpg', blur: [[578, 270, 76, 66]] },
  { src: 'unnamed (8).webp', out: 'lexus-side.jpg' },
  // House number screwed to the wall beside the garage.
  { src: 'unnamed (4).webp', out: 'subaru-driveway.jpg', blur: [[448, 28, 22, 48]] },
  { src: 'unnamed (6).webp', out: 'etron-interior.jpg' },
  { src: 'unnamed (7).webp', out: 'highlander-gloss.jpg', blur: [[622, 254, 58, 68]] },
  // Plate, plus faint numbers on the porch post of the house behind it.
  { src: 'unnamed (9).webp', out: 'volvo-driveway.jpg', blur: [[148, 272, 70, 52], [56, 146, 20, 44]] },
  // Plate is cut off by the right edge, the visible half is still readable.
  { src: 'unnamed (10).webp', out: 'mazda-woods.jpg', blur: [[352, 292, 30, 50]] },
  { src: 'unnamed (11).webp', out: 'r8.jpg' },
  { src: 'unnamed (12).webp', out: 'odyssey-interior.jpg' },
];

async function blurBox(img, meta, [x, y, w, h]) {
  // Clamp to the frame so a box drawn against an edge doesn't throw.
  const left = Math.max(0, x), top = Math.max(0, y);
  const width = Math.min(meta.width - left, w), height = Math.min(meta.height - top, h);
  // Pixelate first (down to a handful of blocks, back up with nearest), then
  // blur the blocks. Blur alone can leave big plate characters guessable.
  const patch = await sharp(img).extract({ left, top, width, height })
    .resize(Math.max(2, Math.round(width / 10)), Math.max(2, Math.round(height / 10)))
    .resize(width, height, { kernel: 'nearest' })
    .blur(4)
    .toBuffer();
  return { input: patch, left, top };
}

(async () => {
  for (const p of PHOTOS) {
    let img = await sharp(path.join(SRC, p.src)).rotate();
    if (p.crop) img = img.extract(p.crop);
    let buf = await img.png().toBuffer();
    const meta = await sharp(buf).metadata();
    if (p.blur) {
      const layers = [];
      for (const b of p.blur) layers.push(await blurBox(buf, meta, b));
      buf = await sharp(buf).composite(layers).png().toBuffer();
    }
    await sharp(buf).jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toFile(path.join(OUT, p.out));
    console.log(p.out.padEnd(24), meta.width + 'x' + meta.height, p.blur ? `(${p.blur.length} blurred)` : '');
  }
})();
