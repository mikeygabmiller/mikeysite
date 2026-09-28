// Mikey's Mobile Detailing logo, v3: Caveat Bold script (the site's own
// signature font) over a boxy Bronco-style front. No Ford name or badge on it:
// the shape says "4x4", the logo stays Mikey's.
const fs = require('fs');
const opentype = require('opentype.js');
const load = p => { const b = fs.readFileSync(p); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const caveat = load('node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff');
const outfit = load('node_modules/@fontsource/outfit/files/outfit-latin-800-normal.woff');

const RED = '#E31924', WHITE = '#FFFFFF', GOLD = '#C9A24A';
function rpoly(pts, r) {
  const n = pts.length; let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a = [p1[0] + v1[0] / l1 * rr, p1[1] + v1[1] / l1 * rr];
    const b = [p1[0] + v2[0] / l2 * rr, p1[1] + v2[1] / l2 * rr];
    d += (i ? 'L' : 'M') + a.map(v => v.toFixed(1)).join(',') + 'Q' + p1.join(',') + ' ' + b.map(v => v.toFixed(1)).join(',');
  }
  return d + 'Z';
}
const rect = (x, y, w, h, r) => rpoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], r);
const flipX = pts => pts.map(([x, y]) => [300 - x, y]).reverse();
const both = (pts, r) => [rpoly(pts, r), rpoly(flipX(pts), r)];
const circ = (cx, cy, r) => `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
// C-shaped running light inside each round headlight, the Bronco's signature
function cRing(cx, cy, R, w, open, facing) {
  const r = R - w, a0 = open / 2, a1 = 2 * Math.PI - open / 2;
  const s = facing < 0 ? Math.PI : 0; // opening faces the grille
  const P = (rad, a) => [(cx + Math.cos(a + s) * rad).toFixed(1), (cy + Math.sin(a + s) * rad).toFixed(1)];
  const [x0, y0] = P(R, a0), [x1, y1] = P(R, a1), [x2, y2] = P(r, a1), [x3, y3] = P(r, a0);
  const cap = w / 2;
  return `M${x0},${y0}A${R},${R} 0 1,1 ${x1},${y1}A${cap},${cap} 0 0,1 ${x2},${y2}A${r},${r} 0 1,0 ${x3},${y3}A${cap},${cap} 0 0,1 ${x0},${y0}Z`;
}
function star4(cx, cy, R, w) {
  const p = [[cx, cy - R], [cx + w, cy - w], [cx + R, cy], [cx + w, cy + w], [cx, cy + R], [cx - w, cy + w], [cx - R, cy], [cx - w, cy - w]];
  let d = `M${p[0]}`;
  for (let i = 1; i <= 8; i++) d += `Q${cx},${cy} ` + p[i % 8];
  return d + 'Z';
}

// glyph by glyph: opentype.js chokes on Caveat's contextual-substitution tables
function layout(font, s, z, ls) {
  const g = [...s].map(c => font.charToGlyph(c)), k = z / font.unitsPerEm; let x = 0; const out = [];
  g.forEach((gl, i) => { out.push([gl, x]); x += gl.advanceWidth * k + ls * z; if (g[i + 1]) x += font.getKerningValue(gl, g[i + 1]) * k; });
  return { out, w: x - ls * z };
}
// Caveat draws each letter as overlapping pen strokes, some wound the opposite
// way, which punches holes under nonzero fill. Re-wind every contour one way
// unless it sits wholly inside another (a real counter, like the eye of the e).
function contours(cmds) {
  const out = []; let cur = null;
  for (const c of cmds) { if (c.type === 'M') { cur = { start: [c.x, c.y], segs: [] }; out.push(cur); } else if (c.type !== 'Z') cur.segs.push(c); }
  return out.filter(k => k.segs.length);
}
function poly(k) {
  const pts = [k.start]; let prev = k.start;
  for (const s of k.segs) {
    for (let t = 0.25; t <= 1.001; t += 0.25) {
      let x, y;
      if (s.type === 'Q') { x = (1 - t) ** 2 * prev[0] + 2 * (1 - t) * t * s.x1 + t * t * s.x; y = (1 - t) ** 2 * prev[1] + 2 * (1 - t) * t * s.y1 + t * t * s.y; }
      else if (s.type === 'C') { x = (1 - t) ** 3 * prev[0] + 3 * (1 - t) ** 2 * t * s.x1 + 3 * (1 - t) * t * t * s.x2 + t ** 3 * s.x; y = (1 - t) ** 3 * prev[1] + 3 * (1 - t) ** 2 * t * s.y1 + 3 * (1 - t) * t * t * s.y2 + t ** 3 * s.y; }
      else { x = prev[0] + (s.x - prev[0]) * t; y = prev[1] + (s.y - prev[1]) * t; }
      pts.push([x, y]); if (s.type === 'L') break;
    }
    prev = [s.x, s.y];
  }
  return pts;
}
const area = P => P.reduce((a, p, i) => { const q = P[(i + 1) % P.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
function inside(pt, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; }
const f = v => +v.toFixed(1);
function kd(k, rev) {
  if (!rev) return `M${f(k.start[0])},${f(k.start[1])}` + k.segs.map(s => s.type === 'Q' ? `Q${f(s.x1)},${f(s.y1)} ${f(s.x)},${f(s.y)}` : s.type === 'C' ? `C${f(s.x1)},${f(s.y1)} ${f(s.x2)},${f(s.y2)} ${f(s.x)},${f(s.y)}` : `L${f(s.x)},${f(s.y)}`).join('') + 'Z';
  const ends = [k.start, ...k.segs.map(s => [s.x, s.y])];
  let d = `M${f(ends[ends.length - 1][0])},${f(ends[ends.length - 1][1])}`;
  for (let i = k.segs.length - 1; i >= 0; i--) {
    const s = k.segs[i], to = ends[i];
    d += s.type === 'Q' ? `Q${f(s.x1)},${f(s.y1)} ${f(to[0])},${f(to[1])}` : s.type === 'C' ? `C${f(s.x2)},${f(s.y2)} ${f(s.x1)},${f(s.y1)} ${f(to[0])},${f(to[1])}` : `L${f(to[0])},${f(to[1])}`;
  }
  return d + 'Z';
}
function glyphD(gl, x, y, z) {
  const ks = contours(gl.getPath(x, y, z).commands), ps = ks.map(poly);
  return ks.map((k, i) => {
    const hole = ps.some((P, j) => j !== i && Math.abs(area(P)) > Math.abs(area(ps[i])) && ps[i].every(pt => inside(pt, P)));
    const pos = area(ps[i]) > 0;
    return kd(k, hole ? pos : !pos);
  }).join('');
}
const tp = (font, s, x, y, z, ls = 0) => layout(font, s, z, ls).out.map(([gl, dx]) => glyphD(gl, x + dx, y, z)).join('');
const tw = (font, s, z, ls = 0) => layout(font, s, z, ls).w;

const F = f => load('node_modules/@fontsource/' + f);
const marker = F('permanent-marker/files/permanent-marker-latin-400-normal.woff');
const racingF = F('racing-sans-one/files/racing-sans-one-latin-400-normal.woff');
const bungee = F('bungee/files/bungee-latin-400-normal.woff');
const barlow7 = F('barlow-condensed/files/barlow-condensed-latin-700-normal.woff');
const outfit6 = F('outfit/files/outfit-latin-600-normal.woff');
// Final logo set, no curved type. Same two fonts as the badge: Racing Sans One
// for MIKEY'S, Barlow Condensed for MOBILE DETAILING between red rules.
const truckB64 = 'data:image/png;base64,' + fs.readFileSync('ready/truck.png').toString('base64');
const _p = fs.readFileSync('ready/truck.png'), TRW = _p.readUInt32BE(16), TRH = _p.readUInt32BE(20);
const OUT = 'ready/out';
fs.mkdirSync(OUT, { recursive: true });

// wordmark geometry at a fixed 640 width; returns inner svg + its box
function wordmark(sub) {
  const W = 640, s = 'MIKEY’S', z = 100 * W / tw(racingF, s, 100), cap = z * 0.72;
  const s2 = 'MOBILE DETAILING', ls = 0.28, z2 = 100 * (W * 0.7) / tw(barlow7, s2, 100, ls), y2 = cap + 34 + z2 * 0.7;
  const lw = W * 0.15 - 16;
  const inner = `<path d="${tp(racingF, s, 0, cap, z)}" fill="${RED}" stroke="${WHITE}" stroke-width="16" stroke-linejoin="round" paint-order="stroke"/>
    <rect x="0" y="${(y2 - z2 * 0.35 - 3).toFixed(1)}" width="${lw}" height="6" fill="${RED}"/><rect x="${W - lw}" y="${(y2 - z2 * 0.35 - 3).toFixed(1)}" width="${lw}" height="6" fill="${RED}"/>
    <path d="${tp(barlow7, s2, W * 0.15 + z2 * ls / 2, y2, z2, ls)}" fill="${sub}"/>
    <path d="${star4(W - 4, 10, 26, 6)}" fill="${WHITE}" stroke="${RED}" stroke-width="3" paint-order="stroke"/>`;
  return { inner, x: -20, y: -34, w: W + 50, h: y2 + 56 };
}
const truck = (x, y, w) => `<image href="${truckB64}" x="${x}" y="${y}" width="${w}" height="${(w * TRH / TRW).toFixed(1)}"/>`;
const svg = (w, h, inner, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}${inner}</svg>`;

const layouts = {};
for (const v of ['dark', 'light']) {
  const sub = v === 'dark' ? WHITE : '#111111';
  const wm = wordmark(sub), pad = 30;
  const place = (x, y, sc) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${sc.toFixed(4)}) translate(${-wm.x},${-wm.y})">${wm.inner}</g>`;
  // stacked: truck over the words, for shirts, hangers, postcards, square posts
  { const W = wm.w + pad * 2, tw_ = wm.w * 0.82, th = tw_ * TRH / TRW;
    layouts['stacked-' + v] = [W, pad + th + 6 + wm.h + pad, truck((W - tw_) / 2, pad, tw_) + place(pad, pad + th + 6, 1)]; }
  // horizontal: truck beside the words, for the website header, email, cards
  { const th = 300, tw_ = th * TRW / TRH, sc = 230 / wm.h, ww = wm.w * sc;
    const W = pad + tw_ + 26 + ww + pad, H = th + pad * 2;
    layouts['horizontal-' + v] = [W, H, truck(pad, pad, tw_) + place(pad + tw_ + 26, pad + (th - 230) / 2, sc)]; }
  // words only
  layouts['wordmark-' + v] = [wm.w + pad * 2, wm.h + pad * 2, place(pad, pad, 1)];
}
// truck only: one version works on dark and light (it carries its own outline)
layouts['icon'] = [TRW + 60, TRH + 60, truck(30, 30, TRW)];

for (const [name, [w, h, inner]] of Object.entries(layouts)) {
  fs.writeFileSync(`${OUT}/${name}.svg`, svg(w, h, inner));
  const bg = name.endsWith('light') ? '#FFFFFF' : '#000000';
  fs.writeFileSync(`${OUT}/${name}-bg.svg`, svg(w, h, inner, bg));
}
// square profile pictures: stacked on black, and the truck alone on black
{ const [w, h, inner] = layouts['stacked-dark'], S = Math.max(w, h) * 1.12;
  fs.writeFileSync(`${OUT}/profile-stacked.svg`, svg(S, S, `<g transform="translate(${(S - w) / 2},${(S - h) / 2})">${inner}</g>`, '#000000')); }
{ const S = TRW * 1.25; fs.writeFileSync(`${OUT}/profile-truck.svg`, svg(S, S, truck((S - TRW) / 2, (S - TRH) / 2 + 10, TRW), '#000000')); }
fs.writeFileSync(`${OUT}/sizes.json`, JSON.stringify(Object.fromEntries(Object.entries(layouts).map(([k, v]) => [k, [v[0], v[1]]]))));
