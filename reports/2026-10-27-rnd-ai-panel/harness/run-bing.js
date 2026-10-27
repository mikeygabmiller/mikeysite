// Bing Copilot Search ("AI mode" tab, logged out). One fresh page per prompt. Reads through shadow roots and iframes.
const { chromium } = require('playwright'); const fs = require('fs');
const [cdp, outdir, only] = process.argv.slice(2);
const prompts = JSON.parse(fs.readFileSync(__dirname + '/../prompts.json')).filter(x => !only || only.split(',').includes(x[0]));
const DEEP = () => {
  const out = {text: [], links: []};
  const walk = (root) => {
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) walk(el.shadowRoot);
      if (el.tagName === 'A' && /^http/.test(el.href)) out.links.push({text: (el.innerText||'').trim().slice(0,120), href: el.href});
    }
  };
  walk(document);
  // text: innerText of shadow hosts' content
  const texts = [];
  const walkT = (root) => { for (const el of root.querySelectorAll('*')) if (el.shadowRoot) { texts.push(el.shadowRoot.textContent ? [...el.shadowRoot.children].map(c => c.innerText || c.textContent || '').join('\n') : ''); walkT(el.shadowRoot); } };
  walkT(document);
  out.text = texts.filter(t => t && t.trim().length > 40);
  out.body = document.body.innerText;
  return out;
};
async function grab(p) {
  const frames = p.frames(); let text = '', links = [];
  for (const f of frames) { try { const r = await f.evaluate(DEEP); text += '\n' + r.body + '\n' + r.text.join('\n'); links.push(...r.links); } catch (e) {} }
  return {text, links};
}
async function one(b, [id, kind, prompt]) {
  const f = `${outdir}/${id}.json`; if (fs.existsSync(f)) return;
  const p = await b.contexts()[0].newPage();
  try {
    await p.goto('https://www.bing.com/copilotsearch?q=' + encodeURIComponent(prompt), {waitUntil:'domcontentloaded', timeout:60000});
    let last = '', stable = 0, g;
    for (let i = 0; i < 30; i++) {
      await p.waitForTimeout(4000);
      g = await grab(p);
      if (/verify you are human|unusual traffic|captcha/i.test(g.text)) throw new Error('bot check shown, stopped');
      if (g.text.length > 600 && g.text === last) { if (++stable >= 3) break; } else stable = 0; last = g.text;
    }
    // Visible-text answer via accessibility of rendered page as a cross-check
    const vis = await p.locator('body').innerText().catch(()=> '');
    const links = [...new Map(g.links.filter(l => !/bing\.com|microsoft\.com|msn\.com|live\.com|microsoftonline/.test(l.href)).map(l => [l.href, l])).values()];

    fs.writeFileSync(f, JSON.stringify({id, kind, prompt, engine:'Microsoft Copilot Search (bing.com/copilotsearch, logged out)', run_at:new Date().toISOString(), page_url:p.url(), answer:last.trim(), links}, null, 1));
    console.log(id, 'ok', last.length, links.length);
  } catch (e) { console.log(id, 'ERR', e.message.split('\n')[0]); fs.writeFileSync(`${outdir}/${id}.err`, e.message); }
  await p.close().catch(()=>{});
}
(async () => { const b = await chromium.connectOverCDP(cdp, {timeout:60000}); for (const x of prompts) await one(b, x); })()
  .catch(e => console.log('FATAL', e.message)).finally(() => process.exit(0));
