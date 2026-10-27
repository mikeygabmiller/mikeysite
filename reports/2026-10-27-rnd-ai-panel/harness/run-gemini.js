// Logged-out Gemini panel. One fresh page per prompt. Saves raw answer text + every source link.
const { chromium } = require('playwright'); const fs = require('fs');
const [cdp, outdir, only] = process.argv.slice(2);
const prompts = JSON.parse(fs.readFileSync(__dirname + '/../prompts.json')).filter(x => !only || only.split(',').includes(x[0]));
async function one(b, [id, kind, prompt]) {
  const f = `${outdir}/${id}.json`; if (fs.existsSync(f)) return;
  const p = await b.contexts()[0].newPage();
  try {
    // Fresh logged-out chat per prompt: wipe gemini.google.com storage so no earlier prompt leaks in.
    const cdp = await p.context().newCDPSession(p);
    await cdp.send('Storage.clearDataForOrigin', {origin: 'https://gemini.google.com', storageTypes: 'all'}).catch(()=>{});
    await p.goto('https://gemini.google.com/app', {waitUntil:'domcontentloaded', timeout:60000}); await p.waitForTimeout(6000);
    if (/unusual traffic|not a robot/i.test(await p.innerText('body'))) throw new Error('bot check shown, stopped');
    await p.locator('rich-textarea [contenteditable], div[contenteditable="true"]').first().click({timeout:20000});
    await p.keyboard.type(prompt, {delay:10}); await p.keyboard.press('Enter');
    await p.waitForTimeout(5000);
    if (!(await p.locator('model-response').count())) {
      await p.keyboard.press('Escape').catch(()=>{});
      const send = p.locator('button[aria-label*="Send" i]').first();
      if (await send.count()) await send.click({timeout:5000}).catch(()=>{}); else { await p.locator('rich-textarea [contenteditable]').first().click().catch(()=>{}); await p.keyboard.press('Enter'); }
    }
    let last = '', stable = 0;
    for (let i = 0; i < 45; i++) {
      await p.waitForTimeout(4000);
      const a = (await p.locator('model-response').count()) ? (await p.locator('model-response').last().innerText({timeout:5000}).catch(()=> '')).trim() : '';
      if (a.length > 150 && a === last) { if (++stable >= 3) break; } else stable = 0; last = a;
    }
    const links = await p.evaluate(() => [...document.querySelectorAll('model-response a[href^="http"], sources-list a[href^="http"]')]
      .map(a => ({text: a.innerText.trim().slice(0,120), href: a.href})).filter(l => !/gemini\.google\.com|support\.google\.com|policies\.google/.test(l.href)));
    const uniq = [...new Map(links.map(l => [l.href, l])).values()];
    fs.writeFileSync(f, JSON.stringify({id, kind, prompt, engine:'Gemini (gemini.google.com, logged out, site storage cleared before the prompt)', run_at:new Date().toISOString(), page_url:p.url(), answer:last, links:uniq}, null, 1));
    console.log(id, 'ok', last.length, uniq.length);
  } catch (e) { console.log(id, 'ERR', e.message.split('\n')[0]); fs.writeFileSync(`${outdir}/${id}.err`, e.message); }
  await p.close().catch(()=>{});
}
(async () => {
  const b = await chromium.connectOverCDP(cdp, {timeout:60000});
  for (const x of prompts) await one(b, x);
})().catch(e => console.log('FATAL', e.message)).finally(() => process.exit(0));
