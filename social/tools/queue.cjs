// Writes social/queue.json: what goes out on which day. The Make.com scenario
// "Social publisher" reads that file from GitHub every evening at 6:30 PM
// Pacific and posts the entries dated today that are approved.
//
// Run after `npm run render` (it reads posts/posts.json, which render writes):
//   npm run queue
//
// Rules this schedule keeps (social/PLAYBOOK.md):
//   - Tuesday, Thursday and Sunday evenings. Launch day is all three pinned
//     posts at once.
//   - At most one ask in any four posts, never two asks in a row.
//   - Seasonal posts go up while they're true: wipers and headlights before the
//     clocks go back on Nov 1, cup holders in Halloween week.
//   - An offer or anything that sells (B07 Rain-Ready, W06 gift cards) waits for
//     Mikey's yes no matter what.
//
// Nothing posts until its id is in APPROVED. Mikey approves in the Claude chat;
// Claude adds the ids here, reruns this, and merges.

const fs = require('fs');
const path = require('path');

const SOCIAL = path.join(__dirname, '..');
const RAW = 'https://raw.githubusercontent.com/mikeygabmiller/mikeysite/main/social/posts/';

const SCHEDULE = [
  ['2026-10-11', 'P01'], ['2026-10-11', 'P02'], ['2026-10-11', 'P03'], // launch, pin all three
  ['2026-10-13', 'W01'], ['2026-10-15', 'P13'], ['2026-10-18', 'P06'],
  ['2026-10-20', 'W02'], ['2026-10-22', 'W03'], ['2026-10-25', 'P04'],
  ['2026-10-27', 'P15'], ['2026-10-29', 'P16'], ['2026-11-01', 'P12'],
  ['2026-11-03', 'P05'], ['2026-11-05', 'P14'], ['2026-11-08', 'P07'],
  ['2026-11-10', 'B07'], ['2026-11-12', 'P08'], ['2026-11-15', 'W04'],
  ['2026-11-17', 'P17'], ['2026-11-19', 'P10'], ['2026-11-22', 'B12'],
  ['2026-11-24', 'P11'], ['2026-11-26', 'P18'], ['2026-11-29', 'P09'],
  ['2026-12-01', 'W05'], ['2026-12-03', 'W06'], ['2026-12-06', 'W07'],
  ['2026-12-08', 'W09'], ['2026-12-10', 'B06'], ['2026-12-13', 'W08'],
];

// Ids Mikey has said yes to. Empty until he approves.
const APPROVED = new Set([]);

// These sell something, so they need his yes even after the first month.
const NEEDS_YES = new Set(['B07', 'W06']);

// What PLAYBOOK.md section 4 counts as an ask: the offer, the guarantee, how
// booking works, reviews, the map, and the winter-spigot reminder.
const ASK_PILLARS = new Set(['Ask', 'Offer', 'Trust']);
const ASK_IDS = new Set(['B09', 'B10', 'B11', 'W08']);

// The Rain-Ready offer ends December 31, 2026 (CLAUDE.md, Offers and countdowns).
const RR_LAST_DAY = '2026-12-31';

const posts = JSON.parse(fs.readFileSync(path.join(SOCIAL, 'posts', 'posts.json'), 'utf8'));
const byId = Object.fromEntries(posts.map(p => [p.id, p]));

const errors = [];
const seen = new Set();
const out = SCHEDULE.map(([date, id], i) => {
  const p = byId[id];
  if (!p) { errors.push(`${id}: not in posts.json`); return null; }
  if (seen.has(id)) errors.push(`${id}: scheduled twice`);
  seen.add(id);
  const d = new Date(date + 'T12:00:00Z');
  if (![0, 2, 4].includes(d.getUTCDay())) errors.push(`${id}: ${date} isn't a Tue, Thu or Sun`);
  if (id === 'B07' && date > RR_LAST_DAY) errors.push('B07: after the Rain-Ready offer ends');
  for (const f of p.images) {
    if (!fs.existsSync(path.join(SOCIAL, 'posts', f))) errors.push(`${id}: missing image ${f}`);
  }
  if (/\u2014/.test(p.ig + p.fb)) errors.push(`${id}: em dash in a caption`);
  if (p.ig.length > 2200) errors.push(`${id}: Instagram caption over 2,200 characters`);
  const urls = p.images.map(f => RAW + f);
  return {
    date, id, title: p.title, pillar: p.pillar,
    ask: ASK_PILLARS.has(p.pillar) || ASK_IDS.has(id),
    pin: p.pin,
    needs_yes: NEEDS_YES.has(id),
    approved: APPROVED.has(id),
    carousel: urls.length > 1,
    ig_caption: p.ig,
    fb_caption: p.fb,
    ig_image: urls[0],
    ig_media: urls.map(u => ({ media_type: 'IMAGE', image_url: u })),
    fb_photos: urls.map(u => ({ type: 'url', url: u })),
    gbp: null,
  };
}).filter(Boolean);

// One ask in any four posts, never two in a row (launch-day posts count separately).
for (let i = 0; i < out.length; i++) {
  const window = out.slice(i, i + 4).filter(e => e.ask);
  if (window.length > 1) errors.push(`asks too close: ${window.map(e => e.id).join(', ')}`);
}
for (const id of APPROVED) {
  if (!seen.has(id)) errors.push(`${id}: approved but not scheduled`);
}

if (errors.length) {
  console.error('queue.json NOT written:\n  ' + errors.join('\n  '));
  process.exit(1);
}

fs.writeFileSync(path.join(SOCIAL, 'queue.json'), JSON.stringify(out, null, 2) + '\n');
const approved = out.filter(e => e.approved).length;
console.log(`queue.json: ${out.length} posts, ${out[0].date} to ${out[out.length - 1].date}, ${approved} approved`);
