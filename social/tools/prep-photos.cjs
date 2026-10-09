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
// unnamed (5).webp (the Honda Pilot) looks like a shop bay, but it's a
// customer's garage (Mikey confirmed 2026-09-25). Captions using it should say
// so, since a stranger will otherwise read it as "he has a shop".

const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'images');
const OUT = path.join(__dirname, '..', 'photos');
const INBOX = path.join(__dirname, '..', 'inbox');
const fs = require('fs');
// Album photos come out at most this wide: sharp for Google and Instagram,
// small enough for the repo.
const MAX_W = 1600;

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
  // Plate on the front bumper, angled toward the camera.
  { src: 'unnamed (5).webp', out: 'pilot-garage.jpg', blur: [[566, 274, 60, 80]] },

  // ---- From Mikey's Google Photos album (all cleared for posting, Mikey 2026-10-09) ----
  // `album` is Google's id; the original is in social/inbox/ (never committed),
  // so a rerun skips these unless `npm run album` has fetched them again.
  // `rel` boxes are fractions of the width and height: [x, y, w, h].
  // Two people in the background by the container, and the front plate.
  { album: 'AF1QipNzUIGX_rERbncMZ7ZNI6hhAjnxf5KeSCutLEy-', out: 'corolla-gravel.jpg', rel: [[0, 0.36, 0.08, 0.15], [0.185, 0.095, 0.115, 0.1]] },
  { album: 'AF1QipOU2Lfrilfw8PEXKBQM0bYb1mgEWq6l84MeVd_2', out: 'impreza-white.jpg', rel: [[0.765, 0.445, 0.1, 0.115]] },
  // In the customer's own garage.
  { album: 'AF1QipO0BWO1W3_oCuchDEi9MbcjiSbpKFHoSFb6tNPM', out: 'explorer-garage.jpg', rel: [[0.05, 0.755, 0.115, 0.15]] },
  // Plate, and the house number over the garage.
  { album: 'AF1QipMOIBetnbeFqRdJ11ubBvp0c72eEKrpxWTb9osb', out: '4runner-white.jpg', rel: [[0.225, 0.615, 0.1, 0.125], [0.93, 0.115, 0.07, 0.06]] },
  // Plate, and the sign by the mailbox across the street.
  { album: 'AF1QipO3f6hSz4yf8In0BQF3PZAlBTNvRAZ4J6R6TJNe', out: 'grand-cherokee-black.jpg', rel: [[0, 0.595, 0.1, 0.175], [0.93, 0.38, 0.06, 0.07]] },
  { album: 'AF1QipNdbnZb3H3eMvIPThD0_PySoqj1K3bG6xwQx19W', out: 'ram-hd-white.jpg' },
  { album: 'AF1QipNPl9j9FIu6pliJHBiTQGtaJosIMkJu_Ch1fd3c', out: 'yukon-white.jpg', rel: [[0.14, 0.585, 0.11, 0.14]] },
  { album: 'AF1QipMBmKh-nkcIOBkSxhYVr4AVYUQrA90OIJ6HPztu', out: 'legacy-blue.jpg' },
  // Plate, and the person sitting inside.
  { album: 'AF1QipNllEzcqX3hQvP4PSjp_ghjRrLPJ8iMaqmNKDcL', out: 'wrangler-red.jpg', rel: [[0.2, 0.695, 0.165, 0.105], [0.49, 0.04, 0.075, 0.13]] },
  // Covered in foam; the plate is under it.
  { album: 'AF1QipO6AvMWGxDcEfROw9Xl730WqMFeiDKbFg7_Gyy6', out: 'foam-sedan.jpg' },
  // In a parking lot, not a driveway.
  { album: 'AF1QipO8Fj1VqaKNtmWxsjdciKAstvkjGDeI4mV2muJ7', out: 'blazer-ev-white.jpg', rel: [[0.16, 0.635, 0.092, 0.11]] },
  { album: 'AF1QipNQqeBIrSFcHHDuVwQAi-PyM1udJAfrwzfpR2x0', out: 'silverado-gray.jpg', rel: [[0.195, 0.64, 0.08, 0.095]] },
  // Plate, and the small sign on the tree.
  { album: 'AF1QipOueM6jKzrbc1F6uVqsKLrxvNxIJnRmKHoIt6JV', out: 'accord-wash.jpg', rel: [[0.818, 0.615, 0.062, 0.1], [0.085, 0.24, 0.035, 0.045]] },
  // No plate on the car; the neighbor house plaque and the street sign by the stop sign are blurred.
  { album: 'AF1QipMc9HADhwjDU4yJzLWb-gadR9-ZPL_cQJhMUMqe', out: 'lexus-suv-white.jpg', rel: [[0.71, 0.165, 0.05, 0.035], [0.005, 0.09, 0.07, 0.1]] },
  { album: 'AF1QipPdwL5CJOvHf1_7CI1lZlk3DfzIF1HRmFSOJkga', out: 'roadster-red.jpg' },
  // Front plate under the bumper, and the camper trailer's plate.
  { album: 'AF1QipOwcSi7Hr4tqgg8GnKvyjfksnFPWx0k05hN4KIm', out: 'chevy-truck-classic.jpg', rel: [[0.71, 0.765, 0.1, 0.08], [0.03, 0.46, 0.05, 0.04]] },
  { album: 'AF1QipOg_VAVubVz_sk2tbhHKtdmqSAVWfFrcrqQJ7o_', out: 'superduty-black.jpg', rel: [[0.685, 0.73, 0.09, 0.085]] },
  { album: 'AF1QipMetfQrKhCWtpjJv2x-uEsw6POVbcLt-_7HbH2f', out: 'mach-e-black.jpg' },
  // The gray box across the street, in case it carries a number.
  { album: 'AF1QipM_QetEqhEKMCaUbXohYFh_wJfcKw6cDZoJzeF4', out: 'escalade-white.jpg', rel: [[0.245, 0.095, 0.035, 0.06]] },
  { album: 'AF1QipMj2s0kMNMrlYz2vkw2sZgHp0aayemLpJzTeP8-', out: 'rav4-red.jpg', rel: [[0.89, 0.485, 0.072, 0.105]] },
  { album: 'AF1QipOuShQVgNGwluU57SzXy5kVQQx1dsnxD89rrmdF', out: 'ram-white-side.jpg' },
  { album: 'AF1QipMpSheYbw2MHURK08OfDNE-DJ67udh8dt8AOGo7', out: 'rav4-prime-silver.jpg' },
  { album: 'AF1QipOzEQff5k3HQhJ5TTD3X60UeZPNYGCnhXMDTJV1', out: 'corolla-interior.jpg' },
  { album: 'AF1QipMJ8Xv7CD06-6guW558ciPfPM6wxNiIyRzrIjXy', out: 'etron-dash.jpg' },
  // The sticker on the windshield.
  { album: 'AF1QipNIrrSaGmDaA4FNIo-PSmoTeKcy4CtiGCUIz_vg', out: 'volvo-interior.jpg', rel: [[0.865, 0.165, 0.1, 0.065]] },
  { album: 'AF1QipPiRZk2H31jIrVPm6kVEWjyy3qmzB2DtKwjWRkw', out: 'wrangler-interior.jpg' },
  { album: 'AF1QipMb26SjtQNa89TLPfAsd9sBjKjo06gpYY94po9Z', out: 'lexus-interior.jpg' },
  { album: 'AF1QipNdmGnJupqzbvcnIxJZP9ol8p-ahJybvYte_8Tw', out: 'mach-e-interior.jpg' },
  // A face in the rear-view mirror, the house number through the windshield, and a windshield sticker.
  { album: 'AF1QipPzLH2kFKllMKQeCPA9VDeIdEa8b__FaCN5XILH', out: 'escalade-interior.jpg', rel: [[0.58, 0, 0.17, 0.11], [0.79, 0.015, 0.1, 0.075], [0.65, 0.105, 0.08, 0.09]] },
  // Before and after, side by side (the moldy wheel).
  { album: 'AF1QipPiC-DZgzrM5P6N_LnA5BOHMmkiCWGPRhue0dRm', out: 'steering-wheel-before-after.jpg' },
  // Before and after, side by side.
  { album: 'AF1QipMObdkI_H0qk9ehek5kspenvlNBKR5Rqb_v1wmx', out: 'rav4-cargo-before-after.jpg' },
  // Pairs with rav4-cargo-after.jpg.
  { album: 'AF1QipNDS04yrpy8RGNhk9CazME0VmaThNOUEmjuuSsB', out: 'rav4-cargo-before.jpg' },
  // Pairs with rav4-cargo-before.jpg.
  { album: 'AF1QipOoMbyWBnJ-UQA8XqJnvSrZiD4uNHzdNm9z2M5-', out: 'rav4-cargo-after.jpg' },
];

// `strong` is for album photos: at 1600px a plate is ten times the pixels it
// was in the site's 680px photos, and /10 blocks plus blur(4) still let the
// characters read through (checked 2026-10-09). Five blocks across a plate and
// a blur scaled to the box leave nothing to guess.
async function blurBox(img, meta, [x, y, w, h], strong) {
  // Clamp to the frame so a box drawn against an edge doesn't throw.
  const left = Math.max(0, x), top = Math.max(0, y);
  const width = Math.min(meta.width - left, w), height = Math.min(meta.height - top, h);
  // Pixelate first (down to a handful of blocks, back up with nearest), then
  // blur the blocks. Blur alone can leave big plate characters guessable.
  const across = strong ? Math.max(2, Math.min(5, Math.round(width / 10))) : Math.max(2, Math.round(width / 10));
  const down = strong ? Math.max(2, Math.round(across * height / width)) : Math.max(2, Math.round(height / 10));
  const patch = await sharp(img).extract({ left, top, width, height })
    .resize(across, down)
    .resize(width, height, { kernel: 'nearest' })
    .blur(strong ? Math.max(4, Math.min(width, height) / 6) : 4)
    .toBuffer();
  return { input: patch, left, top };
}

(async () => {
  for (const p of PHOTOS) {
    const src = p.album ? path.join(INBOX, `${p.album}.jpg`) : path.join(SRC, p.src);
    if (p.album && !fs.existsSync(src)) { console.log(p.out.padEnd(24), 'skipped (original not in social/inbox; run npm run album)'); continue; }
    let img = sharp(src).rotate();
    if (p.crop) img = img.extract(p.crop);
    if (p.album) img = img.resize({ width: MAX_W, withoutEnlargement: true });
    let buf = await img.png().toBuffer();
    const meta = await sharp(buf).metadata();
    const boxes = (p.blur || []).concat((p.rel || []).map(([x, y, w, h]) =>
      [Math.round(x * meta.width), Math.round(y * meta.height), Math.round(w * meta.width), Math.round(h * meta.height)]));
    if (boxes.length) {
      const layers = [];
      for (const b of boxes) layers.push(await blurBox(buf, meta, b, !!p.album));
      buf = await sharp(buf).composite(layers).png().toBuffer();
    }
    await sharp(buf).jpeg(p.album ? { quality: 85 } : { quality: 94, chromaSubsampling: '4:4:4' }).toFile(path.join(OUT, p.out));
    console.log(p.out.padEnd(24), meta.width + 'x' + meta.height, boxes.length ? `(${boxes.length} blurred)` : '');
  }
})();
