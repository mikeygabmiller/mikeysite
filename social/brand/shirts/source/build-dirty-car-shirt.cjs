// Black work shirt, back: "DIRTY CAR?" design (Mikey's layout, 2026-09-28).
// Print file is 12 in wide at 300 dpi on a transparent background: on a black
// shirt the panels in the mockup are the shirt itself, and DTF would print any
// black we leave in as a visible box.
// Run from a folder holding fonts/bebas-neue-latin-400-normal.woff2 (@fontsource),
// like build-plate-shirt.cjs.
const { chromium } = require('playwright'); const fs = require('fs');
const B = '/home/user/mikeysite/social/';
const ff = (name, file, w, s = 'normal') => `@font-face{font-family:'${name}';src:url(data:font/woff2;base64,${fs.readFileSync(file).toString('base64')}) format('woff2');font-weight:${w};font-style:${s}}`;
const fonts = ff('Outfit', B + 'fonts/outfit-latin.woff2', '100 900') + ff('Bebas', 'fonts/bebas-neue-latin-400-normal.woff2', 400);
const W = '#ffffff', GOLD = '#C9A24A';
const logo = fs.readFileSync(B + 'brand/logo.svg', 'utf8').replace('<svg ', '<svg style="display:block;width:100%;height:auto" ');
const star = '<svg viewBox="0 0 24 24" style="width:78px;height:78px;display:block"><path fill="' + GOLD + '" d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3l-5.3-5 7.2-.9z"/></svg>';
// Google "G" in Google's four brand colours; the 5.0 means a Google rating
const G = `<svg viewBox="0 0 48 48" style="width:100px;height:100px;display:block">
 <path fill="#FBBC05" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
 <path fill="#EA4335" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
 <path fill="#34A853" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
 <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>`;
const css = `${fonts}html,body{margin:0;background:transparent}*{box-sizing:border-box}
#a{width:1200px;padding:30px 0 40px;color:${W};font-family:Outfit;display:flex;flex-direction:column;align-items:center}
.fit{white-space:nowrap;line-height:1;display:inline-block}`;
const BACK = `<div id="a">
 <div class="fit" data-w="1130" style="font-family:Bebas;font-size:300px;letter-spacing:6px;line-height:.9">DIRTY CAR?</div>
 <div class="fit" data-w="1000" style="font-weight:700;font-size:80px;margin-top:40px;transform:skewX(-10deg)">I'll clean it in your driveway.</div>
 <div class="fit" data-w="860" style="font-weight:700;font-size:150px;color:${GOLD};margin-top:110px;letter-spacing:1px">(425) 600-7897</div>
 <div style="display:flex;align-items:center;gap:34px;margin-top:44px">${G}<div style="display:flex;gap:10px">${star.repeat(5)}</div><div style="font-weight:700;font-size:92px;line-height:1">5.0</div></div>
 <div style="width:880px;margin-top:120px">${logo}</div>
</div>`;
// size each .fit line to its data-w width, so the lines keep Mikey's proportions
const fitLines = () => document.querySelectorAll('.fit').forEach(e => { const w = +e.dataset.w; const r = w / e.offsetWidth; /* offsetWidth ignores the mockup's scale() */ e.style.fontSize = (parseFloat(getComputedStyle(e).fontSize) * r) + 'px'; });
const tee = inner => `<div style="width:1500px;height:1500px;background:#e9e7e3;position:relative;overflow:hidden">
 <svg viewBox="0 0 1000 1000" width="1500" height="1500" style="position:absolute;top:0;left:0"><path d="M 360,70 C 410,105 590,105 640,70 L 850,150 C 900,170 930,210 945,260 L 985,390 L 835,440 L 790,350 L 790,960 C 790,975 780,985 765,985 L 235,985 C 220,985 210,975 210,960 L 210,350 L 165,440 L 15,390 L 55,260 C 70,210 100,170 150,150 Z" fill="#161616"/>
 <path d="M 360,70 C 410,105 590,105 640,70" fill="none" stroke="#262626" stroke-width="14"/></svg>
 <div style="position:absolute;left:487px;top:230px;transform:scale(.4375);transform-origin:0 0">${inner}</div></div>`;
const frontTee = `<div style="width:1500px;height:1500px;background:#e9e7e3;position:relative;overflow:hidden">
 <svg viewBox="0 0 1000 1000" width="1500" height="1500" style="position:absolute;top:0;left:0"><path d="M 360,70 C 400,150 600,150 640,70 L 850,150 C 900,170 930,210 945,260 L 985,390 L 835,440 L 790,350 L 790,960 C 790,975 780,985 765,985 L 235,985 C 220,985 210,975 210,960 L 210,350 L 165,440 L 15,390 L 55,260 C 70,210 100,170 150,150 Z" fill="#161616"/>
 <path d="M 360,70 C 400,150 600,150 640,70" fill="none" stroke="#262626" stroke-width="16"/></svg>
 <div style="position:absolute;left:870px;top:350px;width:175px">${logo}</div></div>`;
(async () => {
  const b = await chromium.launch();
  let p = await b.newPage({ viewport: { width: 1200, height: 1600 }, deviceScaleFactor: 3 });
  await p.setContent(`<style>${css}</style>${BACK}`); await p.evaluate(() => document.fonts.ready); await p.evaluate(fitLines);
  await (await p.$('#a')).screenshot({ path: 'back-dirty-car-12in.png', omitBackground: true });
  const bb = await (await p.$('#a')).boundingBox(); console.log('back print size: 12 x ' + (bb.height / 100).toFixed(2) + ' in'); await p.close();
  p = await b.newPage({ viewport: { width: 3000, height: 1500 } });
  await p.setContent(`<style>${css}</style><div style="display:flex">${frontTee}${tee(BACK)}</div>`); await p.evaluate(() => document.fonts.ready); await p.evaluate(fitLines);
  await p.screenshot({ path: 'mockup-dirty-car-front-back.png' }); await p.close();
  p = await b.newPage({ viewport: { width: 1300, height: 1700 } });
  await p.setContent(`<style>${css}html,body{background:#111}#a{background:#111}</style>${BACK}`); await p.evaluate(() => document.fonts.ready); await p.evaluate(fitLines);
  await (await p.$('#a')).screenshot({ path: 'back-dirty-car-preview-on-black.png' }); await p.close();
  await b.close();
})();
