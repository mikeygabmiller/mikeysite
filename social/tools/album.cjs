// Pulls new job photos from Mikey's shared Google Photos album into
// social/inbox/, which git ignores. Nothing from the inbox is ever committed:
// the originals show plates and house numbers and carry the phone's location
// data. A photo only reaches the repo through prep-photos.cjs, blurred and
// with its metadata stripped, as a file in social/photos/.
//
//   ALBUM_URL='https://photos.app.goo.gl/...' npm run album
//
// The album link is NOT in this repo (it's public on GitHub, and the link opens
// the unblurred originals). It lives in the "GBP post writer" routine's prompt.
//
// social/photos/album-seen.json records every album photo already looked at,
// by Google's opaque id, and what became of it, so a photo is reviewed once.
// The album page lists its photos in one go for small albums; past a few
// hundred Google pages them and this would need the next-page request.

const fs = require('fs');
const path = require('path');
const https = require('https');

const URL0 = process.env.ALBUM_URL;
if (!URL0) { console.error('Set ALBUM_URL to the shared album link.'); process.exit(1); }

const SOCIAL = path.join(__dirname, '..');
const INBOX = path.join(SOCIAL, 'inbox');
const SEEN = path.join(SOCIAL, 'photos', 'album-seen.json');

function get(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && redirects) {
        res.resume();
        return resolve(get(new URL(res.headers.location, url).href, redirects - 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`${res.statusCode} for ${url.slice(0, 80)}`)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

(async () => {
  const html = (await get(URL0)).toString('utf8');
  // Each photo appears as ["<id>",["<lh3 url>",<width>,<height>,...
  const items = [];
  const re = /\["(AF1Qip[A-Za-z0-9_-]+)",\["(https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_-]+)",(\d+),(\d+)/g;
  for (let m; (m = re.exec(html));) {
    if (!items.some(i => i.id === m[1])) items.push({ id: m[1], url: m[2], w: +m[3], h: +m[4] });
  }
  if (!items.length) { console.error('No photos found: the link may have changed or sharing was turned off.'); process.exit(1); }

  const seen = fs.existsSync(SEEN) ? JSON.parse(fs.readFileSync(SEEN, 'utf8')) : {};
  const fresh = items.filter(i => !seen[i.id]);
  fs.mkdirSync(INBOX, { recursive: true });
  const list = [];
  for (const [n, it] of fresh.entries()) {
    const file = path.join(INBOX, `${it.id}.jpg`);
    // =w2400 asks Google for a 2400px-wide JPEG: plenty for a post, and it
    // comes without the original's location data.
    if (!fs.existsSync(file)) fs.writeFileSync(file, await get(`${it.url}=w2400`));
    list.push({ ...it, file: path.relative(SOCIAL, file), orientation: it.w >= it.h ? 'wide' : 'tall' });
    process.stdout.write(`\r  ${n + 1}/${fresh.length}`);
  }
  fs.writeFileSync(path.join(INBOX, 'new.json'), JSON.stringify(list, null, 2));
  console.log(`\nalbum: ${items.length} photos, ${fresh.length} new (${list.filter(i => i.orientation === 'wide').length} wide), in social/inbox/`);
})().catch(e => { console.error(e.message); process.exit(1); });
