const { chromium } = require('playwright'); const fs=require('fs');
const B='/home/user/mikeysite/social/';
const svgFile=(f,style,sw)=>fs.readFileSync(B+'brand/'+f,'utf8').replace('<svg ',`<svg style="${style}" `).replace('stroke-width="15"',`stroke-width="${sw}"`);
const ff=(name,file,w,s='normal')=>`@font-face{font-family:'${name}';src:url(data:font/woff2;base64,${fs.readFileSync(file).toString('base64')}) format('woff2');font-weight:${w};font-style:${s}}`;
const fonts=ff('Outfit',B+'fonts/outfit-latin.woff2','100 900')+ff('Anton','fonts/anton-latin-400-normal.woff2',400)+ff('Bebas','fonts/bebas-neue-latin-400-normal.woff2',400)
 +ff('Marker','fonts/permanent-marker-latin-400-normal.woff2',400)+ff('Barlow','fonts/barlow-condensed-latin-800-italic.woff2',800,'italic')+ff('Barlow','fonts/barlow-condensed-latin-600-normal.woff2',600)+ff('Arimo','fonts/arimo-latin-700-normal.woff2',700)+ff('RobotoC','fonts/roboto-condensed-latin-400-normal.woff2',400);
const R='#E31924', W='#ffffff';
const css=`${fonts}html,body{margin:0;background:transparent}*{box-sizing:border-box}
#a{width:1200px;height:1400px;position:relative;color:${W};font-family:Outfit;display:flex;flex-direction:column;align-items:center}`;
const star=(cx,cy,r,fill)=>{let p=[];for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,rr=i%2?r*0.45:r;p.push((cx+rr*Math.cos(a)).toFixed(1)+','+(cy-rr*Math.sin(a)).toFixed(1));}return `<polygon points="${p.join(' ')}" fill="${fill}"/>`;};
const phoneSite=(top)=>`<div style="position:absolute;top:${top}px;width:100%;text-align:center">
  <div style="font-family:Anton;font-size:104px;letter-spacing:3px;line-height:1">(425) 600-7897</div>
  <div style="font-family:Barlow;font-weight:600;font-size:62px;letter-spacing:4px;margin-top:18px;line-height:1">MIKEYSDETAILING.COM</div></div>`;

const tee=(inner)=>`<div style="width:1500px;height:1500px;background:#e9e7e3;position:relative;overflow:hidden">
 <svg viewBox="0 0 1000 1000" width="1500" height="1500" style="position:absolute;top:0;left:0"><path d="M 360,70 C 410,105 590,105 640,70 L 850,150 C 900,170 930,210 945,260 L 985,390 L 835,440 L 790,350 L 790,960 C 790,975 780,985 765,985 L 235,985 C 220,985 210,975 210,960 L 210,350 L 165,440 L 15,390 L 55,260 C 70,210 100,170 150,150 Z" fill="#141414"/>
 <path d="M 360,70 C 410,105 590,105 640,70" fill="none" stroke="#262626" stroke-width="14"/></svg>
 <div style="position:absolute;left:487px;top:250px;transform:scale(.4375);transform-origin:0 0">${inner}</div></div>`;


const plate=({vanity='MIKEYS',slogan='MOBILE DETAILING',attrs='style="width:100%;display:block"'}={})=>{
 const cap=[300,262,360,232,420,200,455,183,500,180,540,190,600,215,660,245,720,275,700,300,680,286,660,322,630,300,610,342,585,310,560,352,540,316,515,346,495,310,470,342,450,300,425,332,405,296,380,316,360,281,330,296];
 const rock=[[470,192,480,190,470,252,462,246],[520,195,528,198,545,262,536,264],[430,210,438,207,415,266,408,261],[575,215,582,218,615,282,607,285],[395,236,402,233,378,282,372,277],[630,246,636,249,660,292,653,294]];
 const snow=[[cap],...[[180,320,230,312,215,335],[790,310,840,325,815,338],[250,305,280,298,270,318],[860,336,900,350,880,360]].map(p=>[p])];
 const n=vanity.length, tl=Math.min(815,815*n/7);
 return `<svg viewBox="0 0 960 481" ${attrs}>
 <defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .10 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1efeb"/><stop offset="1" stop-color="#e2dfda"/></linearGradient>
  <clipPath id="face"><rect x="14" y="14" width="932" height="453" rx="24"/></clipPath>
 </defs>
 <rect x="2" y="2" width="956" height="477" rx="34" fill="url(#sheen)" stroke="#b9b5ae" stroke-width="3"/>
 <g clip-path="url(#face)">
  <polygon points="10,470 10,352 90,330 160,310 230,300 300,262 360,232 420,200 455,183 500,180 540,190 600,215 660,245 720,275 790,300 860,330 950,375 950,470" fill="#8CC5DD"/>
  ${snow.map(([p])=>`<polygon points="${p.join(',')}" fill="#F5F8F9"/>`).join('')}${rock.map(p=>`<polygon points="${p.join(',')}" fill="#8CC5DD"/>`).join('')}
 </g>
 <rect x="12" y="12" width="936" height="457" rx="26" fill="none" stroke="#d3cfc9" stroke-width="7"/>
 <rect x="2" y="2" width="956" height="477" rx="34" fill="#000" filter="url(#grain)" opacity=".9"/>
 ${[[202,47],[768,47],[205,432],[767,430]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="12" fill="#2a2a2a" stroke="#9c978f" stroke-width="3"/>`).join('')}
 <text x="78" y="138" font-family="Arimo" font-weight="700" font-size="76" fill="#D0312D" textLength="500" lengthAdjust="spacingAndGlyphs">WASHINGTON</text>
 <rect x="652" y="70" width="120" height="82" fill="#0E8C6B"/>
 <text x="664" y="126" font-family="Arimo" font-weight="700" font-size="62" fill="#fff">21</text>
 ${'EST'.split('').map((c,i)=>`<text x="752" y="${92+i*17}" font-family="Arimo" font-weight="700" font-size="16" fill="#fff" text-anchor="middle">${c}</text>`).join('')}
 <text x="712" y="146" font-family="Arimo" font-weight="700" font-size="13" fill="#fff" text-anchor="middle" textLength="100" lengthAdjust="spacingAndGlyphs">WASHINGTON</text>
 <rect x="772" y="70" width="120" height="82" fill="#F6F4EC" stroke="#cfcabd" stroke-width="1.5"/>
 <text x="782" y="96" font-family="Arimo" font-weight="700" font-size="22" fill="#111">W</text>
 <text x="882" y="94" font-family="Arimo" font-weight="700" font-size="13" fill="#111" text-anchor="end" textLength="72" lengthAdjust="spacingAndGlyphs">SNOHOMISH</text>
 <text x="832" y="140" font-family="Arimo" font-weight="700" font-size="38" fill="#111" text-anchor="middle" textLength="102" lengthAdjust="spacingAndGlyphs">98290</text>
 <text x="480" y="398" font-family="RobotoC" font-size="300" fill="#1E2A45" text-anchor="middle" textLength="${tl}" lengthAdjust="spacingAndGlyphs">${vanity}</text>
 <text x="488" y="446" font-family="Arimo" font-weight="700" font-size="46" fill="#8C1F3F" text-anchor="middle" textLength="${Math.min(520,slogan.length*29)}" lengthAdjust="spacingAndGlyphs">${slogan}</text>
</svg>`;};
const towns=['SNOHOMISH','LAKE STEVENS','EVERETT','MONROE','MILL CREEK','MARYSVILLE','BOTHELL','DUVALL','MUKILTEO','WOODINVILLE','GRANITE FALLS','ARLINGTON'];
const framed=()=>`<svg viewBox="0 0 1040 604" style="width:100%;display:block">
 <defs><linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfb"/><stop offset=".35" stop-color="#bdbdbd"/><stop offset=".5" stop-color="#f2f2f2"/><stop offset=".78" stop-color="#9a9a9a"/><stop offset="1" stop-color="#e6e6e6"/></linearGradient></defs>
 <rect x="2" y="2" width="1036" height="600" rx="46" fill="url(#chrome)" stroke="#6d6d6d" stroke-width="3"/>
 <rect x="36" y="42" width="968" height="489" rx="30" fill="#3a3a3a"/>
 ${plate({attrs:'x="40" y="46" width="960" height="481"'})}
 <text x="520" y="32" font-family="Arimo" font-weight="700" font-size="26" fill="#1a1a1a" text-anchor="middle" letter-spacing="7">SNOHOMISH COUNTY, WA</text>
 <text x="520" y="580" font-family="Arimo" font-weight="700" font-size="40" fill="#1a1a1a" text-anchor="middle" letter-spacing="5">MIKEYSDETAILING.COM</text>
</svg>`;
const FINAL=`<div id="a" style="height:auto;padding-bottom:12px">
 ${svgFile('logo.svg','width:700px;margin-top:10px;overflow:visible',22)}
 <div style="width:1100px;margin-top:44px">${framed()}</div>
 <div style="font-family:Anton;font-size:112px;letter-spacing:3px;margin-top:50px;line-height:1">I COME TO YOU.</div>
 <div style="font-family:Marker;font-size:74px;color:${R};margin-top:22px;line-height:1.2">You don't pay until you love it.</div>
 <div style="font-family:Anton;font-size:108px;letter-spacing:4px;margin-top:40px;line-height:1">(425) 600-7897</div>
</div>`;
const G1=`<div id="a">
 ${svgFile('logo.svg','width:760px;margin-top:20px;overflow:visible',22)}
 <div style="width:1100px;margin-top:56px">${plate()}</div>
 <div style="font-family:Anton;font-size:112px;letter-spacing:3px;margin-top:56px;line-height:1">I COME TO YOU.</div>
 <div style="margin-top:36px;text-align:center"><div style="font-family:Anton;font-size:104px;letter-spacing:3px;line-height:1">(425) 600-7897</div><div style="font-family:Barlow;font-weight:600;font-size:62px;letter-spacing:4px;margin-top:18px;line-height:1">MIKEYSDETAILING.COM</div></div>
</div>`;
const G2=`<div id="a">
 <div style="font-family:Bebas;font-size:74px;letter-spacing:14px;margin-top:10px;color:${R}">DETAILED IN YOUR DRIVEWAY</div>
 <div style="width:1100px;margin-top:30px;transform:rotate(-3deg)">${plate()}</div>
 ${svgFile('logo.svg','width:640px;margin-top:60px;overflow:visible',22)}
 <div style="width:1060px;margin-top:40px;text-align:center;font-family:Bebas;font-size:48px;letter-spacing:4px;line-height:1.35">${[0,4,8].map(i=>towns.slice(i,i+4).join(' · ')).join('<br>')}</div>
 <div style="margin-top:40px;text-align:center"><div style="font-family:Anton;font-size:104px;letter-spacing:3px;line-height:1">(425) 600-7897</div><div style="font-family:Barlow;font-weight:600;font-size:62px;letter-spacing:4px;margin-top:18px;line-height:1">MIKEYSDETAILING.COM</div></div>
</div>`;
(async()=>{const b=await chromium.launch();
 let p=await b.newPage({viewport:{width:1100,height:551},deviceScaleFactor:1});
 await p.setContent(`<style>${css}html,body{background:#111}</style><div id="p" style="width:1100px">${framed()}</div>`);await p.evaluate(()=>document.fonts.ready);
 await (await p.$('#p')).screenshot({path:'plate-closeup.png'});await p.close();
 for(const [n,h] of [['FINAL-plate',FINAL]]){
  p=await b.newPage({viewport:{width:1200,height:1400},deviceScaleFactor:3});
  await p.setContent(`<style>${css}</style>${h}`);await p.evaluate(()=>document.fonts.ready);
  await (await p.$('#a')).screenshot({path:`back-${n}-12x14in.png`,omitBackground:true});await p.close();
  p=await b.newPage({viewport:{width:1500,height:1500}});
  await p.setContent(`<style>${css}</style>${tee(h)}`);await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({path:`mockup-${n}.png`});await p.close();}
 const frontTee=`<div style="width:1500px;height:1500px;background:#e9e7e3;position:relative;overflow:hidden">
 <svg viewBox="0 0 1000 1000" width="1500" height="1500" style="position:absolute;top:0;left:0"><path d="M 360,70 C 400,150 600,150 640,70 L 850,150 C 900,170 930,210 945,260 L 985,390 L 835,440 L 790,350 L 790,960 C 790,975 780,985 765,985 L 235,985 C 220,985 210,975 210,960 L 210,350 L 165,440 L 15,390 L 55,260 C 70,210 100,170 150,150 Z" fill="#141414"/>
 <path d="M 360,70 C 400,150 600,150 640,70" fill="none" stroke="#262626" stroke-width="16"/></svg>
 <div style="position:absolute;left:870px;top:350px;width:175px">${svgFile('logo.svg','width:175px;overflow:visible',40)}</div></div>`;
 p=await b.newPage({viewport:{width:3000,height:1500}});
 await p.setContent(`<style>${css}</style><div style="display:flex">${frontTee}${tee(FINAL)}</div>`);await p.evaluate(()=>document.fonts.ready);
 await p.screenshot({path:'mockup-FINAL-front-back.png'});await p.close();
 await b.close();})();
