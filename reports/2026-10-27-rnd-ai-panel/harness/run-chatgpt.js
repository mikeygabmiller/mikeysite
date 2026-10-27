// Logged-out ChatGPT panel. One fresh page per prompt. Saves raw answer text + every outbound link.
const { chromium } = require('playwright'); const fs = require('fs');
const [cdp, outdir, only] = process.argv.slice(2);
const prompts = JSON.parse(fs.readFileSync(__dirname + '/../prompts.json')).filter(x => !only || only.split(',').includes(x[0]));
async function one(b, [id, kind, prompt]) {
  const f = `${outdir}/${id}.json`; if (fs.existsSync(f)) return;
  const p = await b.contexts()[0].newPage();
  try {
    // Fresh logged-out session per prompt: wipe chatgpt.com cookies and storage first,
    // so no earlier prompt can leak into this answer (a private window per prompt).
    const cdp = await p.context().newCDPSession(p);
    for (const origin of ['https://chatgpt.com', 'https://openai.com', 'https://auth.openai.com'])
      await cdp.send('Storage.clearDataForOrigin', {origin, storageTypes: 'all'}).catch(()=>{});
    const ck = await p.context().cookies(); 
    await p.context().clearCookies({domain: /chatgpt\.com|openai\.com/}).catch(async () => {
      await cdp.send('Network.deleteCookies', {name: '__x', domain: 'chatgpt.com'}).catch(()=>{});
    });
    await p.goto('https://chatgpt.com/', {waitUntil:'domcontentloaded', timeout:60000}); await p.waitForTimeout(5000);
    const body0 = await p.innerText('body');
    if (/verify you are human|security verification|unusual activity/i.test(body0)) throw new Error('bot check shown, stopped');
    await p.locator('textarea[name=prompt]:visible, #prompt-textarea:visible').first().click({timeout:20000});
    await p.keyboard.type(prompt, {delay:10}); await p.keyboard.press('Enter');
    let last = '', stable = 0;
    for (let i = 0; i < 45; i++) {
      await p.waitForTimeout(4000);
      const t = await p.innerText('body').catch(()=> '');
      const m = t.split('ChatGPT said:')[1] || '';
      const a = m.split('ChatGPT is AI and can make mistakes')[0].trim();
      if (a.length > 150 && a === last) { if (++stable >= 3) break; } else stable = 0; last = a;
    }
    const links = await p.evaluate(() => [...document.querySelectorAll('main a[href^="http"], [role=main] a[href^="http"], article a[href^="http"]')]
      .map(a => ({text: a.innerText.trim().slice(0,120), href: a.href})).filter(l => !/chatgpt\.com|openai\.com|mapbox\.com|openstreetmap\.org/.test(l.href)));
    const uniq = [...new Map(links.map(l => [l.href, l])).values()];
    fs.writeFileSync(f, JSON.stringify({id, kind, prompt, engine:'ChatGPT (chatgpt.com, logged out, site data cleared before the prompt)', run_at:new Date().toISOString(), page_url:p.url(), answer:last, links:uniq}, null, 1));
    console.log(id, 'ok', last.length, uniq.length);
  } catch (e) { console.log(id, 'ERR', e.message.split('\n')[0]); fs.writeFileSync(`${outdir}/${id}.err`, e.message); }
  await p.close().catch(()=>{});
}
(async () => {
  const b = await chromium.connectOverCDP(cdp, {timeout:60000});
  const q = [...prompts]; const workers = [0].map(async () => { while (q.length) await one(b, q.shift()); });
  await Promise.all(workers);
})().catch(e => console.log('FATAL', e.message)).finally(() => process.exit(0));
