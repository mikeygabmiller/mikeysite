// Renders every post in posts.cjs to social/posts/*.jpg and rewrites
// social/CAPTIONS.md from the same data.
//
//   cd social/tools && npm install && npm run photos && npm run render
//
// Each post is an HTML page screenshotted by Chromium at exactly 1080x1350,
// which is Instagram's tallest feed shape (4:5) and also what Facebook shows
// uncropped. Designing at the real pixel size means what you see here is what
// lands on the phone: no rescaling step to soften the type.
//
// Photos are shown at or below about 1.4x their real size. The site's gallery
// shots are only 680px wide, so a template never stretches one across the full
// 1080 unless it's in a grid or side by side, where it's shrunk instead.

const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { POSTS, ACCOUNT } = require('./posts.cjs');

const SOCIAL = path.join(__dirname, '..');
const OUT = path.join(SOCIAL, 'posts');
const url = rel => 'file://' + path.join(SOCIAL, rel).split(path.sep).map(encodeURIComponent).join('/').replace(/^%2F|^\//, '/');
const photo = f => url('photos/' + f);
const LOGO = url('brand/logo.svg');
const ICON = url('brand/logo-icon.svg');

const CSS = `
@font-face{font-family:'Outfit';src:url(${url('fonts/outfit-latin.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:'Caveat';src:url(${url('fonts/caveat-latin.woff2')}) format('woff2');font-weight:400 700}
:root{--ink:#0e0e0f;--ink2:#19191c;--red:#E31924;--red2:#B50E22;--gold:#D2AE5E;--cream:#F4EFE6;--muted:rgba(255,255,255,.74)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--ink);overflow:hidden}
body{font-family:'Outfit',sans-serif;color:#fff;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
em{font-style:normal;color:var(--red)}
.post{position:relative;width:1080px;height:1350px;display:flex;flex-direction:column;background:var(--ink)}
.main{position:relative;flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}
.foot{height:104px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 60px;background:#000;border-top:5px solid var(--red)}
.foot img{height:58px;display:block}
.foot .url{font-weight:600;font-size:31px;letter-spacing:.01em}
.eyebrow{display:flex;align-items:center;gap:16px;font-weight:700;font-size:28px;letter-spacing:.16em;text-transform:uppercase;color:var(--red)}
.eyebrow:before{content:'';width:14px;height:14px;border-radius:50%;background:currentColor}
.chip{position:absolute;top:26px;left:26px;z-index:2;font-weight:800;font-size:30px;letter-spacing:.16em;text-transform:uppercase;padding:12px 22px 11px;border-radius:10px;background:rgba(10,10,10,.8);color:#fff}
.chip.after{background:var(--red)}
.ph{position:relative;overflow:hidden;background:#222}
.ph img{width:100%;height:100%;object-fit:cover;display:block}

/* statement */
.stmt{padding:100px 84px 70px}
.stmt h1{font-weight:800;font-size:116px;line-height:.98;letter-spacing:-.03em;margin-top:40px}
.stmt .body{margin-top:26px}
.stmt .body p{font-size:44px;line-height:1.36;color:var(--muted);margin-top:26px}
.stmt .body strong{color:#fff;font-weight:700}
.stmt .note{font-family:'Caveat';font-weight:700;font-size:58px;line-height:1.1;margin-top:auto;color:#fff;max-width:880px}
.stmt .sign{font-family:'Caveat';font-weight:700;font-size:100px;line-height:1;margin-top:auto;transform:rotate(-4deg);transform-origin:left bottom}
.stmt .note + .sign{margin-top:18px;font-size:74px}
.stmt .wm{position:absolute;right:-150px;bottom:-150px;width:560px;opacity:.07;pointer-events:none}
.stmt.red{background:linear-gradient(160deg,#E31924 0%,#B50E22 70%,#8f0a1a 100%)}
.stmt.red .eyebrow{color:rgba(255,255,255,.85)}
.stmt.red em{color:#140405}
.stmt.red .body p{color:rgba(255,255,255,.9)}
.stmt.red .wm{display:none}

/* split before/after */
.split .head{padding:46px 60px 34px}
.split h2{font-weight:800;font-size:72px;letter-spacing:-.025em;line-height:1}
.split .sub{font-size:34px;color:var(--muted);margin-top:14px;line-height:1.3}
.panes{flex:1;display:flex;gap:8px;min-height:0}
.panes.rows{flex-direction:column}
.panes .ph{flex:1}

/* single slide */
.slide .ph{position:absolute;inset:0}
.slide .chip,.fit .chip{top:40px;left:40px;font-size:40px;padding:16px 30px 15px}
.cta{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:120px 60px 44px;background:linear-gradient(to top,rgba(0,0,0,.88),rgba(0,0,0,0));font-weight:800;font-size:54px;line-height:1.08;letter-spacing:-.02em}
.fit{justify-content:center;background:var(--ink)}
.fit .bgblur{position:absolute;inset:-60px;background-size:cover;background-position:center;filter:blur(40px) brightness(.35);z-index:0}
.fit > *:not(.bgblur){position:relative;z-index:1}
.fit .ph{width:1080px;height:818px;flex:none}
.fit .chip{position:relative;display:inline-block;margin:0 0 30px 60px;align-self:flex-start;top:auto;left:auto}
.fit .cta{position:static;background:none;padding:40px 60px 0}

/* photo card */
.pcard{padding:56px 68px 60px}
.pcard .ph{height:660px;border-radius:28px;flex:none}
.pcard .eyebrow{margin-top:48px}
.pcard h2{font-weight:800;font-size:78px;line-height:1.02;letter-spacing:-.025em;margin-top:22px}
.pcard p{font-size:40px;line-height:1.36;color:var(--muted);margin-top:22px}

/* duo */
.duo{padding:84px 68px 60px}
.duo h1{font-weight:800;font-size:100px;line-height:1;letter-spacing:-.03em;margin-top:30px}
.duo .pair{display:flex;gap:16px;margin-top:52px}
.duo .ph{flex:1;height:440px;border-radius:24px}
.duo .chip{top:18px;left:18px;font-size:26px;padding:10px 18px 9px}
.duo p{font-size:44px;line-height:1.34;color:var(--muted);margin-top:44px}
.duo .note{font-family:'Caveat';font-weight:700;font-size:68px;line-height:1.05;margin-top:auto;color:#fff}

/* grid */
.grid{padding:70px 60px 60px}
.grid h2{font-weight:800;font-size:84px;line-height:1;letter-spacing:-.03em;margin-top:24px}
.grid .four{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:14px;margin-top:44px;min-height:0}
.grid .ph{border-radius:20px}

/* review */
.review{background:var(--cream);color:#151515;padding:92px 84px 70px}
.review .stars{display:flex;gap:10px}
.review .stars svg{width:62px;height:62px;fill:#C9A24B}
.review .qm{font-family:Georgia,serif;font-weight:700;font-size:300px;line-height:1;height:140px;color:var(--red);margin-top:50px}
.review .quote{font-weight:600;letter-spacing:-.02em;line-height:1.16;margin-top:20px}
.review .src{margin-top:auto;padding-top:34px;border-top:3px solid rgba(0,0,0,.1);display:flex;justify-content:space-between;align-items:center;font-size:30px;font-weight:600;color:#5a5a5a}
.review .src b{color:#151515;font-weight:800}

/* offer */
.offer{padding:64px 68px 56px;background:radial-gradient(120% 70% at 100% 0%,rgba(227,25,36,.28),rgba(227,25,36,0) 60%),var(--ink)}
.offer .eyebrow{color:var(--gold)}
.offer h1{font-weight:800;font-size:100px;line-height:.96;letter-spacing:-.03em;margin-top:26px}
.offer .lede{font-size:38px;line-height:1.3;color:var(--muted);margin-top:22px}
.offer .stack{margin-top:34px;border-radius:24px;background:var(--ink2);border:2px solid rgba(255,255,255,.08);padding:10px 34px}
.offer .row{display:flex;justify-content:space-between;align-items:baseline;padding:19px 0;border-bottom:2px solid rgba(255,255,255,.08);font-size:36px}
.offer .row:last-child{border-bottom:0}
.offer .row .p{font-weight:700;white-space:nowrap}
.offer .row s{color:rgba(255,255,255,.45);font-weight:500;margin-right:14px;text-decoration-thickness:3px;text-decoration-color:var(--red)}
.offer .row .free{color:var(--red);font-weight:800;letter-spacing:.06em}
.offer .row.base{font-weight:700}
.offer .row.tot{font-weight:800;font-size:40px}
.offer .row.tot .p{color:var(--gold)}
.offer .code{margin-top:30px;font-size:35px;line-height:1.3}
.offer .code b{display:inline-block;background:#fff;color:#111;font-weight:800;letter-spacing:.08em;padding:4px 16px;border-radius:8px;margin:0 4px}
.offer .guar{margin-top:auto;font-family:'Caveat';font-weight:700;font-size:62px;line-height:1;color:#fff}

/* steps */
.steps{padding:84px 72px 60px}
.steps h1{font-weight:800;font-size:92px;line-height:1;letter-spacing:-.03em;margin-top:26px}
.steps ol{list-style:none;margin-top:60px;display:flex;flex-direction:column;gap:48px}
.steps li{display:flex;gap:30px;align-items:flex-start}
.steps .close{margin-top:auto;font-family:'Caveat';font-weight:700;font-size:66px;line-height:1}
.steps .n{flex:none;width:92px;height:92px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:44px}
.steps .t{font-weight:700;font-size:50px;line-height:1.1;letter-spacing:-.01em;padding-top:4px}
.steps .d{font-size:37px;line-height:1.32;color:var(--muted);margin-top:8px}

/* map */
.mapp{padding:70px 60px 50px}
.mapp h1{font-weight:800;font-size:92px;line-height:1;letter-spacing:-.03em;margin-top:24px}
.mapp .mapwrap{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;margin-top:18px}
.mapp .mapwrap svg{height:100%;width:auto;max-width:100%;border-radius:24px}
.mapp .nofee{display:flex;justify-content:center;gap:14px;font-size:36px;font-weight:700;margin-top:18px}
.mapp .nofee span{color:var(--gold)}
.sa-map{font-family:'Outfit',sans-serif}
.sa-rd{fill:none;stroke:#2a2a2a;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.sa-rd--major{stroke:#343434;stroke-width:3}
.sa-rd-lbl{fill:#555;font-size:13px;font-weight:800;letter-spacing:.6px}
.sa-water-lbl{fill:#2c4d5e;font-size:15px;font-weight:800;letter-spacing:3.4px;text-anchor:middle}
.sa-scale line{stroke:#4a4a4a;stroke-width:1.5}.sa-scale text{fill:#6b6b6b;font-size:12px;font-weight:700}
.sa-zone-core{fill:rgba(200,16,46,.16);stroke:rgba(200,16,46,.46);stroke-width:1.5}
.sa-hit{fill:transparent}
.sa-ring{fill:rgba(227,25,36,.18);stroke:rgba(227,25,36,.55);stroke-width:1.5}
.sa-dot{fill:#E31924;stroke:#fff;stroke-width:2}
.sa-lbl{fill:#f2f2f2;font-size:20px;font-weight:700}
.sa-pin--home .sa-dot{fill:#fff;stroke:#E31924;stroke-width:4}
.sa-pin--home .sa-lbl{fill:#fff;font-size:22px;font-weight:900}
.sa-sublbl{fill:var(--gold);font-size:12px;font-weight:800;letter-spacing:1.5px}

/* account images */
.profile{width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;background:radial-gradient(60% 60% at 50% 50%,#2a0a0e,#0b0b0c 70%)}
.profile img{width:700px}
.cover{width:1702px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;background:radial-gradient(50% 90% at 50% 50%,#2a0a0e,#0b0b0c 75%)}
.cover img{width:760px}
.cover .tag{font-size:40px;font-weight:600;letter-spacing:.01em;color:rgba(255,255,255,.85)}
.cover .tag span{color:var(--gold)}
`;

const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.1l-6.1 3.5 1.5-6.8L2.2 9.2l6.9-.7z"/></svg>';
const foot = `<div class="foot"><img src="${LOGO}" alt=""><div class="url">mikeysdetailing.com</div></div>`;
const ph = (f, pos, extra = '') => `<div class="ph">${extra}<img src="${photo(f)}" style="object-position:${pos || '50% 50%'}"></div>`;

// Review quotes vary a lot in length; size the type so every card fills the
// same space instead of short ones floating and long ones overflowing.
const quoteSize = q => q.length <= 95 ? 88 : q.length <= 128 ? 78 : q.length <= 150 ? 72 : 64;

function mapSvg() {
  let s = fs.readFileSync(path.join(SOCIAL, '..', 'tools', 'service-area-map.svg'), 'utf8');
  // Only the twelve "most weeks" towns go on social. The grey "ask me" labels
  // (Lynnwood, Edmonds and the rest) read as served on a phone screen, and
  // Mikey has said no to Lynnwood and Edmonds. The "you are here" marker is
  // interactive-only on the site.
  s = dropGroup(dropGroup(s, 'sa-nearby'), 'sa-you');
  // Bothell's label runs right, straight over Woodinville's pin at this size.
  // Put it above its own pin instead.
  return s.replace(/(data-city="Bothell"[\s\S]*?<text class="sa-lbl") x="13" y="4" text-anchor="start"/, '$1 x="0" y="-18" text-anchor="middle"');
}

// Removes <g class="cls"> and everything inside it, counting nested <g>s so the
// cut ends at its own closing tag rather than the first </g> it meets.
function dropGroup(s, cls) {
  const start = s.indexOf(`<g class="${cls}"`);
  if (start < 0) return s;
  const re = /<g\b|<\/g>/g;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(s))) {
    depth += m[0] === '</g>' ? -1 : 1;
    if (depth === 0) return s.slice(0, start) + s.slice(m.index + 4);
  }
  throw new Error('unbalanced <g> in map svg');
}

const T = {
  statement: s => `<div class="main stmt ${s.bg || ''}">
    <div class="eyebrow">${s.eyebrow}</div><h1>${s.h}</h1>
    <div class="body">${s.body.map(p => `<p>${p}</p>`).join('')}</div>
    ${s.note ? `<div class="note">${s.note}</div>` : ''}
    <div class="sign">${s.sign}</div>
    <img class="wm" src="${ICON}" alt=""></div>`,

  split: s => `<div class="main split">
    <div class="head"><h2>${s.h}</h2><div class="sub">${s.sub}</div></div>
    <div class="panes ${s.dir}">${ph(s.before, s.posB, '<div class="chip">Before</div>')}${ph(s.after, s.posA, '<div class="chip after">After</div>')}</div></div>`,

  slide: s => `<div class="main slide">${ph(s.photo, s.pos)}
    <div class="chip ${s.chip === 'After' ? 'after' : ''}">${s.chip}</div>
    ${s.cta ? `<div class="cta">${s.cta}</div>` : ''}</div>`,

  fit: s => `<div class="main fit"><div class="bgblur" style="background-image:url('${photo(s.photo)}')"></div><div class="chip ${s.chip === 'After' ? 'after' : ''}">${s.chip}</div>
    ${ph(s.photo, '50% 50%')}${s.cta ? `<div class="cta">${s.cta}</div>` : ''}</div>`,

  photocard: s => `<div class="main pcard">${ph(s.photo, s.pos)}
    <div class="eyebrow">${s.eyebrow}</div><h2>${s.h}</h2><p>${s.body}</p></div>`,

  duo: s => `<div class="main duo"><div class="eyebrow">${s.eyebrow}</div><h1>${s.h}</h1>
    <div class="pair">${ph(s.a, s.aPos, `<div class="chip">${s.aLabel}</div>`)}${ph(s.b, s.bPos, `<div class="chip">${s.bLabel}</div>`)}</div>
    <p>${s.body}</p>${s.note ? `<div class="note">${s.note}</div>` : ''}</div>`,

  grid: s => `<div class="main grid"><div class="eyebrow">${s.eyebrow}</div><h2>${s.h}</h2>
    <div class="four">${s.photos.map(([f, p]) => ph(f, p)).join('')}</div></div>`,

  review: s => `<div class="main review">
    <div class="stars">${STAR.repeat(5)}</div><div class="qm">&ldquo;</div>
    <div class="quote" style="font-size:${quoteSize(s.quote)}px">${s.quote}</div>
    <div class="src"><span>Customer review</span><span><b>5.0</b> across 40 Google reviews</span></div></div>`,

  offer: () => `<div class="main offer">
    <div class="eyebrow">October through March</div>
    <h1>The Rain-Ready<br><em>Full Detail</em></h1>
    <div class="lede">Book a full detail and every extra<br>on my menu comes free.</div>
    <div class="stack">
      <div class="row base"><span>Full detail, inside and out</span><span class="p">from $299</span></div>
      <div class="row"><span>Exterior polish</span><span class="p"><s>$30</s><span class="free">FREE</span></span></div>
      <div class="row"><span>Ceramic wax</span><span class="p"><s>$20</s><span class="free">FREE</span></span></div>
      <div class="row"><span>RainX on the windows</span><span class="p"><s>$10</s><span class="free">FREE</span></span></div>
      <div class="row"><span>Carpet shampoo</span><span class="p"><s>$20</s><span class="free">FREE</span></span></div>
      <div class="row tot"><span>Extras on me</span><span class="p">$80</span></div>
    </div>
    <div class="code">Type <b>RAIN READY</b> in the notes when you get your quote.</div>
    <div class="guar">You don't pay until you love it.</div></div>`,

  steps: () => `<div class="main steps"><div class="eyebrow">Booking with me</div>
    <h1>Four steps.<br><em>No phone tag.</em></h1>
    <ol>
      <li><div class="n">1</div><div><div class="t">Get your exact price</div><div class="d">60 seconds at mikeysdetailing.com</div></div></li>
      <li><div class="n">2</div><div><div class="t">I text you back</div><div class="d">Usually within a couple of minutes, and we pick a day</div></div></li>
      <li><div class="n">3</div><div><div class="t">I show up with everything</div><div class="d">You just need an outdoor spigot and a power outlet</div></div></li>
      <li><div class="n">4</div><div><div class="t">You pay after</div><div class="d">Once we've walked around the car together</div></div></li>
    </ol><div class="close">No deposit. Nothing to pay up front.</div></div>`,

  map: () => `<div class="main mapp"><div class="eyebrow">Where I work</div>
    <h1>12 towns, <em>most weeks.</em></h1>
    <div class="mapwrap">${mapSvg()}</div>
    <div class="nofee">No travel fee. <span>Same price in every town.</span></div></div>`,

  profile: () => `<div class="profile"><img src="${ICON}" alt=""></div>`,
  cover: () => `<div class="cover"><img src="${LOGO}" alt="">
    <div class="tag">Mobile detailing in your driveway <span>&middot;</span> Snohomish County</div></div>`,
};

const page = (inner, w, h, isPost) => `<!doctype html><html><head><meta charset="utf-8">
  <style>${CSS} html,body{width:${w}px;height:${h}px}</style></head>
  <body>${isPost ? `<div class="post">${inner}${foot}</div>` : inner}</body></html>`;

// The site's gate (tools/check-site.py) skips social/, so the no-em-dash rule
// is enforced here instead, on every string that ends up on a post or caption.
const dash = JSON.stringify(POSTS).match(/.{0,40}(\u2014|&mdash;).{0,40}/);
if (dash) { console.error('em dash in posts.cjs, rewrite it:', dash[0]); process.exit(1); }

(async () => {
  const only = process.argv.slice(2);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mikey-social-'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const pg = await ctx.newPage();

  async function shoot(name, html, w, h) {
    const file = path.join(tmp, name + '.html');
    fs.writeFileSync(file, html);
    await pg.setViewportSize({ width: w, height: h });
    await pg.goto('file://' + file);
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    // A template that overflows its box is a layout bug, not a style choice.
    const over = await pg.evaluate(() => { document.querySelectorAll('.wm,.bgblur').forEach(e => e.style.display = 'none'); const o = [...document.querySelectorAll('.main')].some(m => m.scrollHeight > m.clientHeight + 1); document.querySelectorAll('.wm,.bgblur').forEach(e => e.style.display = ''); return o; });
    if (over) console.warn('  ! content overflows in', name);
    const png = await pg.screenshot({ type: 'png' });
    await sharp(png).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(path.join(OUT, name + '.jpg'));
    console.log('  ' + name + '.jpg');
  }

  for (const p of POSTS) {
    if (only.length && !only.includes(p.id)) continue;
    for (let i = 0; i < p.slides.length; i++) {
      const s = p.slides[i];
      const name = p.slides.length > 1 ? `${p.id}-${i + 1}` : p.id;
      await shoot(name, page(T[s.t](s), 1080, 1350, true), 1080, 1350);
    }
  }
  for (const a of ACCOUNT) {
    if (only.length && !only.includes(a.id)) continue;
    await shoot(a.id, page(T[a.t](a), a.w, a.h, false), a.w, a.h);
  }
  await browser.close();

  if (!only.length) writeCaptions();
})();

function writeCaptions() {
  const files = p => p.slides.length > 1 ? p.slides.map((_, i) => `\`posts/${p.id}-${i + 1}.jpg\``).join(', ') : `\`posts/${p.id}.jpg\``;
  let md = `# Captions

Generated by \`tools/render.cjs\` from \`tools/posts.cjs\`. Edit the captions
there, not here, or the next render will overwrite your change.

Post order and the weekly rhythm are in \`PLAYBOOK.md\`.

`;
  let week = null;
  for (const p of POSTS) {
    if (p.week !== week) {
      week = p.week;
      md += week === 'bank' ? `\n---\n\n## Bank (ready to go, use to fill any week)\n\n` : `\n---\n\n## Week ${week}\n\n`;
    }
    md += `### ${p.id} · ${p.title}${p.pin ? ' · 📌 pin' : ''}${p.offer ? ' · ⚠️ offer' : ''}\n\n`;
    md += `**Image${p.slides.length > 1 ? 's (carousel, in this order)' : ''}:** ${files(p)}  \n**Type:** ${p.pillar}\n\n`;
    md += `**Instagram**\n\n\`\`\`\n${p.ig}\n\`\`\`\n\n**Facebook**\n\n\`\`\`\n${p.fb}\n\`\`\`\n\n`;
    md += `**Alt text** (Instagram: Advanced settings → Accessibility)\n\n> ${p.alt}\n\n`;
  }
  fs.writeFileSync(path.join(SOCIAL, 'CAPTIONS.md'), md);
  fs.writeFileSync(path.join(SOCIAL, 'posts', 'posts.json'), JSON.stringify(POSTS.map(p => ({
    id: p.id, week: p.week, title: p.title, pillar: p.pillar, pin: !!p.pin, offer: !!p.offer,
    images: p.slides.length > 1 ? p.slides.map((_, i) => `${p.id}-${i + 1}.jpg`) : [`${p.id}.jpg`],
    ig: p.ig, fb: p.fb, alt: p.alt,
  })), null, 2));
  console.log('  CAPTIONS.md, posts/posts.json');
}
