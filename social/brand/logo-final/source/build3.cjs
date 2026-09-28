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

// ---- icon variants. Each is parts on a 300-wide grid, centre x=150. ----
// solids: red body.  holes: cut through (dark or transparent).
// red: redrawn on top of holes (lamps, slats).  dark: dark again on top (lamp
// centres).  white: running lights and sparkles.
const lamp = (x, y, R, ri, rd, w, face) => ({ red: [circ(x, y, R)], dark: [circ(x, y, ri)], white: [cRing(x, y, rd, w, 1.3, face)] });
const merge = (...ps) => { const o = { solids: [], holes: [], red: [], dark: [], white: [] }; for (const p of ps) for (const k in p) o[k] = Array.isArray(p[k]) ? o[k].concat(p[k]) : p[k]; return o; };

const V = {};
V.classic = merge({
  H: 300,
  solids: [rpoly([[62, 14], [238, 14], [250, 104], [50, 104]], 8), ...both([[4, 78], [44, 82], [44, 112], [8, 110]], 6),
    rpoly([[26, 100], [274, 100], [280, 118], [280, 206], [20, 206], [20, 118]], 10), ...both([[4, 176], [70, 176], [70, 224], [4, 224]], 7),
    rpoly([[28, 212], [272, 212], [278, 240], [22, 240]], 6), ...both([[16, 214], [84, 214], [84, 296], [16, 296]], 12)],
  holes: [rpoly([[76, 28], [224, 28], [232, 90], [68, 90]], 6), rect(30, 124, 240, 60, 10), rect(40, 204, 220, 5, 2), rect(92, 220, 14, 12, 3), rect(194, 220, 14, 12, 3)],
  red: [rect(96, 136, 108, 9, 3), rect(96, 150, 108, 9, 3), rect(96, 164, 108, 9, 3)],
  white: [star4(106, 60, 24, 6), star4(150, 44, 13, 3.4), star4(196, 66, 10, 2.6)],
}, lamp(62, 154, 25, 17, 15, 5, 1), lamp(238, 154, 25, 17, 15, 5, -1));

// lifted: wider flares, taller tyres, roof light bar, winch in the bumper
V.lifted = merge({
  H: 322,
  solids: [rect(70, 8, 160, 18, 6), rect(84, 22, 10, 16, 2), rect(206, 22, 10, 16, 2),
    rpoly([[64, 34], [236, 34], [246, 118], [54, 118]], 8), ...both([[6, 92], [46, 96], [46, 124], [10, 122]], 6),
    rpoly([[24, 114], [276, 114], [282, 132], [282, 210], [18, 210], [18, 132]], 10), ...both([[0, 178], [78, 178], [78, 238], [0, 238]], 8),
    rpoly([[28, 214], [272, 214], [278, 248], [22, 248]], 6), ...both([[6, 222], [90, 222], [90, 320], [6, 320]], 15)],
  holes: [rpoly([[78, 48], [222, 48], [230, 104], [70, 104]], 6), rect(30, 138, 240, 58, 10), rect(40, 203, 220, 5, 2),
    rect(122, 222, 56, 18, 4), rect(88, 224, 14, 12, 3), rect(198, 224, 14, 12, 3)],
  red: [rect(94, 149, 112, 9, 3), rect(94, 162, 112, 9, 3), rect(94, 175, 112, 9, 3)],
  white: [circ(94, 17, 4.5), circ(122, 17, 4.5), circ(150, 17, 4.5), circ(178, 17, 4.5), circ(206, 17, 4.5),
    star4(108, 76, 20, 5), star4(150, 62, 11, 2.8), star4(192, 82, 8, 2.2)],
}, lamp(60, 167, 25, 17, 15, 5, 1), lamp(240, 167, 25, 17, 15, 5, -1));

// bold: fewer, fatter pieces so it still reads as a 24px favicon
V.bold = merge({
  H: 294,
  solids: [rpoly([[66, 16], [234, 16], [246, 100], [54, 100]], 14), ...both([[8, 78], [50, 82], [50, 112], [12, 110]], 9),
    rpoly([[22, 96], [278, 96], [282, 114], [282, 230], [18, 230], [18, 114]], 18), ...both([[20, 200], [94, 200], [94, 292], [20, 292]], 18)],
  holes: [rpoly([[82, 34], [218, 34], [226, 84], [74, 84]], 9), rect(34, 122, 232, 74, 16)],
  red: [rect(112, 151, 76, 16, 6)],
  white: [star4(120, 58, 20, 5), star4(172, 50, 10, 2.6)],
}, lamp(76, 159, 30, 20, 18, 6.5, 1), lamp(224, 159, 30, 20, 18, 6.5, -1));

// face: just the grille and the two round lights, a headlight gets the sparkle
V.face = merge({
  H: 210,
  solids: [rpoly([[14, 14], [286, 14], [296, 36], [296, 196], [4, 196], [4, 36]], 20)],
  holes: [rect(20, 42, 260, 126, 16), rect(34, 180, 232, 6, 3)],
  red: [rect(126, 80, 48, 12, 4), rect(126, 99, 48, 12, 4), rect(126, 118, 48, 12, 4)],
}, lamp(72, 105, 44, 31, 28, 9, 1), lamp(228, 105, 44, 31, 28, 9, -1), { white: [star4(52, 82, 16, 4), star4(76, 70, 7, 1.8)] });

function carParts(v, o, fill, id, mono) {
  const hd = v.holes.join(''), sd = v.solids.join('');
  if (mono) // line art: the same parts, drawn as red lines
    // one outline around the whole truck: stroke the parts, then mask away
    // everything inside them so the overlaps (flare over tyre) leave no lines
    return `<mask id="m${id}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="400" height="420"><rect x="-50" y="-50" width="400" height="420" fill="#fff"/><path d="${sd}" fill="#000"/></mask>
      <path mask="url(#m${id})" d="${sd}" fill="none" stroke="${RED}" stroke-width="${o * 2.4}" stroke-linejoin="round"/>
      <path d="${hd}${v.red.join('')}" fill="none" stroke="${RED}" stroke-width="${o * 0.9}" stroke-linejoin="round"/>
      <path d="${v.white.join('')}" fill="${WHITE}"/>`;
  const B = 'maskUnits="userSpaceOnUse" x="-50" y="-50" width="400" height="420"';
  return `<mask id="w${id}" ${B}><rect x="-50" y="-50" width="400" height="420" fill="#fff"/><path d="${hd}" fill="#000"/></mask>
  <mask id="r${id}" ${B}><rect x="-50" y="-50" width="400" height="420" fill="#fff"/><path d="${hd}" fill="#000" stroke="#000" stroke-width="${o * 0.9}" stroke-linejoin="round"/></mask>
  <path mask="url(#w${id})" d="${sd}" fill="${WHITE}" stroke="${WHITE}" stroke-width="${o * 2}" stroke-linejoin="round"/>
  <path mask="url(#r${id})" d="${sd}" fill="${RED}"/>
  ${fill ? `<path d="${hd}" fill="${fill}"/>` : ''}
  <path d="${v.red.join('')}" fill="${RED}" stroke="${WHITE}" stroke-width="${o * 0.9}" paint-order="stroke"/>
  <path d="${v.dark.join('')}" fill="${fill || '#000'}"/>
  <path d="${v.white.join('')}" fill="${WHITE}"/>`;
}
// badge: bold truck inside a white-ringed round seal
function badge(o, id) {
  return `<circle cx="150" cy="150" r="150" fill="${WHITE}"/><circle cx="150" cy="150" r="138" fill="#111"/>
  <circle cx="150" cy="150" r="128" fill="none" stroke="${RED}" stroke-width="4"/>
  <g transform="translate(150,154) scale(0.62) translate(-150,-147)">${carParts(V.bold, o, '#111', id)}</g>`;
}
const ICONS = [
  ['A-classic', 'Classic (last round)', id => carParts(V.classic, 9, null, id), 300],
  ['B-lifted', 'Lifted: light bar, bigger tires, winch', id => carParts(V.lifted, 9, null, id), 322],
  ['C-bold', 'Bold: fewer, fatter parts, best small', id => carParts(V.bold, 9, null, id), 294],
  ['D-badge', 'Badge: round seal', id => badge(9, id), 300],
  ['E-face', 'Face: just the grille and lights', id => carParts(V.face, 9, null, id), 210],
  ['F-line', 'Line art: red outline, no fill', id => carParts(V.classic, 9, null, id, true), 300],
];

const script = (x, base, z, o) => `<g transform="translate(${x},${base}) skewX(-6) translate(0,${-base})">
  <path d="${tp(caveat, 'Mikey’s', 0, base, z)}" fill="${RED}" stroke="${WHITE}" stroke-width="${o * 2.2}" stroke-linejoin="round" paint-order="stroke"/></g>`;
const svg = (x, y, w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}">${inner}</svg>`;
fs.mkdirSync('icons', { recursive: true });
for (const [key, , draw, h] of ICONS) {
  const pad = 16;
  fs.writeFileSync(`icons/icon-${key}.svg`, svg(-pad, -pad, 300 + pad * 2, h + pad * 2, draw('i')));
  // lockup: icon scaled to 300 tall, wordmark beside it
  const k = 300 / h, iw = 300 * k, tx = iw + 34, TW = 620;
  const z1 = 250 * TW / tw(caveat, 'Mikey’s', 250), s2 = 'MOBILE DETAILING', ls = 0.16, z2 = 60 * (TW - 20) / tw(outfit, s2, 60, ls);
  const inner = `<g transform="scale(${k})">${draw('l')}</g>` + script(tx, 178, z1, 9) +
    `<path d="${tp(outfit, s2, tx + 14, 272, z2, ls)}" fill="${WHITE}"/><rect x="${tx + 14}" y="292" width="${TW - 20}" height="6" rx="1" fill="${GOLD}"/>`;
  fs.writeFileSync(`icons/lockup-${key}.svg`, svg(-pad, -pad, tx + tw(caveat, 'Mikey’s', z1) + 40 + pad * 2, 306 + pad * 2, inner));
}
fs.writeFileSync('icons/sheet.html', `<body style="margin:0;background:#000;color:#bbb;font:600 17px system-ui,sans-serif">` +
  ICONS.map(([key, label]) => `<div style="display:flex;align-items:center;gap:26px;padding:14px 20px;border-bottom:1px solid #222">
    <div style="width:30px;font-size:26px;color:#fff">${key[0]}</div>
    <img src="icon-${key}.svg" style="height:150px;width:150px;object-fit:contain">
    <img src="icon-${key}.svg" style="height:48px;width:48px;object-fit:contain">
    <img src="icon-${key}.svg" style="height:24px;width:24px;object-fit:contain">
    <div><img src="lockup-${key}.svg" style="height:92px;display:block"><div style="margin-top:6px">${label}</div></div></div>`).join('') + `</body>`);
