/**
 * Mikey's Mobile Detailing — Cloudflare Worker
 *
 * Webhooks (called by Twilio):
 *   POST /submit        — quote form → auto-texts client + Mikey
 *   POST /sms           — inbound SMS → stores in KV, relays to Mikey's cell
 *   POST /call          — inbound call → rings Mikey's cell
 *   POST /voicemail     — missed call → record voicemail
 *   POST /voicemail-done — recording done → text Mikey the link
 *
 * Dashboard API (password-protected):
 *   GET  /              — serve the dashboard HTML
 *   GET  /api/threads   — list all conversations
 *   GET  /api/thread?phone=+1xxx — messages for one conversation
 *   POST /api/send      — send an outbound SMS { to, body }
 *   POST /api/name      — save a display name for a number { phone, name }
 *
 * Required Worker Secrets:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM        — Twilio number e.g. +12065551234
 *   MIKEY_PHONE        — personal cell e.g. +13607975831
 *   DASHBOARD_PASSWORD — password to access the dashboard
 *
 * Required KV Namespace binding (wrangler.toml):
 *   MESSAGES
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
    }

    // --- Twilio webhooks (no auth needed — Twilio calls these) ---
    if (request.method === 'POST' && url.pathname === '/submit')        return handleSubmit(request, env);
    if (request.method === 'POST' && url.pathname === '/sms')           return handleInboundSms(request, env);
    if (request.method === 'POST' && url.pathname === '/call')          return handleInboundCall(request, env);
    if (request.method === 'POST' && url.pathname === '/voicemail')     return handleVoicemail(request, env);
    if (request.method === 'POST' && url.pathname === '/voicemail-done') return handleVoicemailDone(request, env);

    // --- Dashboard (password-protected) ---
    if (url.pathname === '/' || url.pathname === '')                    return serveDashboard(request, env);
    if (url.pathname.startsWith('/api/'))                               return handleApi(request, env, url);

    return new Response('Not found', { status: 404 });
  },
};

// ============================================================
// Dashboard auth
// ============================================================
function checkAuth(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const token  = cookie.match(/mkd_token=([^;]+)/)?.[1];
  return token === env.DASHBOARD_PASSWORD;
}

function serveDashboard(request, env) {
  // Login form POST
  if (request.method === 'POST') return handleLogin(request, env);

  if (!checkAuth(request, env)) return loginPage();
  return new Response(DASHBOARD_HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function handleLogin(request, env) {
  const form = await request.formData();
  const pass = form.get('password') || '';
  if (pass !== env.DASHBOARD_PASSWORD) {
    return new Response(loginPage('Wrong password').body, {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': `mkd_token=${env.DASHBOARD_PASSWORD}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`,
    },
  });
}

function loginPage(error = '') {
  const html = `<!DOCTYPE html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Mikey's Detailing — Login</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#111;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
.box{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:40px;width:100%;max-width:360px;text-align:center}
h1{color:#fff;font-size:1.3rem;margin-bottom:8px}p{color:#888;font-size:.9rem;margin-bottom:24px}
input{width:100%;padding:12px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:1rem;margin-bottom:16px}
button{width:100%;padding:12px;background:#C8102E;border:none;border-radius:8px;color:#fff;font-weight:700;font-size:1rem;cursor:pointer}
.err{color:#ff6b6b;font-size:.85rem;margin-bottom:12px}</style></head>
<body><div class=box><h1>🚗 Mikey's Detailing</h1><p>SMS Dashboard</p>
${error ? `<div class=err>${error}</div>` : ''}
<form method=POST><input type=password name=password placeholder="Password" autofocus><button type=submit>Sign In</button></form></div></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// ============================================================
// Dashboard API
// ============================================================
async function handleApi(request, env, url) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (url.pathname === '/api/threads' && request.method === 'GET')  return apiThreads(env);
  if (url.pathname === '/api/thread'  && request.method === 'GET')  return apiThread(env, url);
  if (url.pathname === '/api/send'    && request.method === 'POST') return apiSend(request, env);
  if (url.pathname === '/api/name'    && request.method === 'POST') return apiSaveName(request, env);

  return new Response('Not found', { status: 404 });
}

async function apiThreads(env) {
  const raw = await env.MESSAGES.get('threads');
  const threads = raw ? JSON.parse(raw) : [];
  // Enrich with last message preview
  const enriched = await Promise.all(threads.map(async t => {
    const msgs = await getMessages(env, t.phone);
    const last = msgs[msgs.length - 1];
    return { ...t, lastMessage: last?.body || '', lastTime: last?.ts || t.ts, unread: t.unread || 0 };
  }));
  enriched.sort((a, b) => b.lastTime - a.lastTime);
  return new Response(JSON.stringify(enriched), { headers: { 'Content-Type': 'application/json' } });
}

async function apiThread(env, url) {
  const phone = url.searchParams.get('phone');
  if (!phone) return new Response('missing phone', { status: 400 });
  const msgs = await getMessages(env, phone);
  // Mark as read
  await markRead(env, phone);
  return new Response(JSON.stringify(msgs), { headers: { 'Content-Type': 'application/json' } });
}

async function apiSend(request, env) {
  const { to, body } = await request.json();
  if (!to || !body) return new Response(JSON.stringify({ error: 'missing to/body' }), { status: 422, headers: { 'Content-Type': 'application/json' } });
  const phone = normalizePhone(to);
  if (!phone) return new Response(JSON.stringify({ error: 'bad phone' }), { status: 422, headers: { 'Content-Type': 'application/json' } });
  await sendSms(env, phone, body);
  const msg = { id: genId(), ts: Date.now(), direction: 'out', from: env.TWILIO_FROM, to: phone, body };
  await storeMessage(env, phone, msg);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

async function apiSaveName(request, env) {
  const { phone, name } = await request.json();
  if (!phone) return new Response('missing phone', { status: 400 });
  const raw = await env.MESSAGES.get('threads');
  const threads = raw ? JSON.parse(raw) : [];
  const t = threads.find(x => x.phone === phone);
  if (t) { t.name = name; await env.MESSAGES.put('threads', JSON.stringify(threads)); }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

// ============================================================
// KV helpers
// ============================================================
async function storeMessage(env, phone, msg) {
  // Store message in thread list
  const key = `thread:${phone}`;
  const raw = await env.MESSAGES.get(key);
  const msgs = raw ? JSON.parse(raw) : [];
  msgs.push(msg);
  // Keep last 200 messages per thread
  if (msgs.length > 200) msgs.splice(0, msgs.length - 200);
  await env.MESSAGES.put(key, JSON.stringify(msgs));

  // Update thread index
  const tRaw = await env.MESSAGES.get('threads');
  const threads = tRaw ? JSON.parse(tRaw) : [];
  const existing = threads.find(t => t.phone === phone);
  if (existing) {
    existing.ts = msg.ts;
    if (msg.direction === 'in') existing.unread = (existing.unread || 0) + 1;
  } else {
    threads.push({ phone, name: '', ts: msg.ts, unread: msg.direction === 'in' ? 1 : 0 });
  }
  await env.MESSAGES.put('threads', JSON.stringify(threads));
}

async function getMessages(env, phone) {
  const raw = await env.MESSAGES.get(`thread:${phone}`);
  return raw ? JSON.parse(raw) : [];
}

async function markRead(env, phone) {
  const raw = await env.MESSAGES.get('threads');
  if (!raw) return;
  const threads = JSON.parse(raw);
  const t = threads.find(x => x.phone === phone);
  if (t) { t.unread = 0; await env.MESSAGES.put('threads', JSON.stringify(threads)); }
}

// ============================================================
// Twilio webhooks
// ============================================================
async function handleSubmit(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return cors(json({ ok: false, error: 'bad_json' }, 400)); }

  const { name, phone, email, location, total, vehicle, condition, services, notes } = body;
  if (!name || !phone) return cors(json({ ok: false, error: 'missing_fields' }, 422));

  const clientPhone = normalizePhone(phone);
  if (!clientPhone) return cors(json({ ok: false, error: 'bad_phone' }, 422));

  const serviceList = Array.isArray(services) ? services.join(', ') : (services || '');
  const quoteLine   = total ? `$${total}` : 'TBD';

  const clientMsg = [
    `Hey ${name.split(' ')[0]}! 👋 Got your quote request — Mikey's Mobile Detailing.`,
    `Your estimate: ${quoteLine}`,
    vehicle     ? `Vehicle: ${vehicle}` : null,
    serviceList ? `Services: ${serviceList}` : null,
    `Mikey will text you back shortly to confirm. Reply here anytime!`,
  ].filter(Boolean).join('\n');

  const mikeyMsg = [
    `🔔 NEW QUOTE — ${name}`,
    `Phone: ${clientPhone}`,
    email       ? `Email: ${email}` : null,
    location    ? `City: ${location}` : null,
    `Quote: ${quoteLine}`,
    vehicle     ? `Vehicle: ${vehicle}` : null,
    condition   ? `Condition: ${condition}` : null,
    serviceList ? `Services: ${serviceList}` : null,
    notes       ? `Notes: ${notes}` : null,
  ].filter(s => s !== null).join('\n');

  const ts = Date.now();
  const [r1, r2] = await Promise.allSettled([
    sendSms(env, clientPhone, clientMsg),
    sendSms(env, env.MIKEY_PHONE, mikeyMsg),
  ]);

  // Store outbound client message in dashboard
  await storeMessage(env, clientPhone, {
    id: genId(), ts, direction: 'out',
    from: env.TWILIO_FROM, to: clientPhone,
    body: clientMsg,
    meta: { name, quote: quoteLine, vehicle, services: serviceList },
  }).catch(() => {});

  const ok = r1.status === 'fulfilled' && r2.status === 'fulfilled';
  return cors(json({ ok, clientSms: r1.status, mikeySms: r2.status }, ok ? 200 : 207));
}

async function handleInboundSms(request, env) {
  const form     = await request.formData();
  const from     = form.get('From')  || '';
  const body     = form.get('Body')  || '';
  const numMedia = parseInt(form.get('NumMedia') || '0', 10);

  const mikeyPhone = normalizePhone(env.MIKEY_PHONE);
  const fromNorm   = normalizePhone(from);

  // Store the inbound message
  await storeMessage(env, fromNorm || from, {
    id: genId(), ts: Date.now(), direction: 'in',
    from, to: env.TWILIO_FROM, body,
    media: numMedia > 0 ? numMedia : undefined,
  }).catch(() => {});

  if (fromNorm === mikeyPhone) return twimlResponse('');

  const mediaNote = numMedia > 0 ? `\n📎 ${numMedia} attachment(s) — check dashboard.` : '';
  await sendSms(env, env.MIKEY_PHONE,
    `📱 New text from ${from}:\n"${body}"${mediaNote}`
  );

  return twimlResponse('Got it! Mikey will get back to you soon. 🚗✨');
}

async function handleInboundCall(request, env) {
  const form       = await request.formData();
  const from       = form.get('From') || 'Unknown';
  const mikeyPhone = normalizePhone(env.MIKEY_PHONE) || '+13607975831';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="20" action="/voicemail" method="POST">
    <Number>${escapeXml(mikeyPhone)}</Number>
  </Dial>
</Response>`;

  sendSms(env, mikeyPhone, `📞 Incoming call from ${from} to your detailing number.`).catch(() => {});
  return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
}

async function handleVoicemail(request, env) {
  const form       = await request.formData();
  const from       = form.get('From') || 'Unknown';
  const dialStatus = form.get('DialCallStatus') || '';
  const mikeyPhone = normalizePhone(env.MIKEY_PHONE) || '+13607975831';

  if (dialStatus === 'completed') {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
  }

  sendSms(env, mikeyPhone, `📵 Missed call from ${from} — recording voicemail now.`).catch(() => {});

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hey, you've reached Mikey's Mobile Detailing. Leave a message and Mikey will get back to you soon.</Say>
  <Record maxLength="120" action="/voicemail-done" method="POST" playBeep="true" />
</Response>`, { headers: { 'Content-Type': 'text/xml' } });
}

async function handleVoicemailDone(request, env) {
  const form         = await request.formData();
  const from         = form.get('From') || 'Unknown';
  const recordingUrl = form.get('RecordingUrl') || '';
  const duration     = form.get('RecordingDuration') || '?';
  const mikeyPhone   = normalizePhone(env.MIKEY_PHONE) || '+13607975831';

  if (recordingUrl) {
    await sendSms(env, mikeyPhone, `🎙️ Voicemail from ${from} (${duration}s):\n${recordingUrl}.mp3`).catch(() => {});
  }
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
}

// ============================================================
// Shared helpers
// ============================================================
async function sendSms(env, to, body) {
  const url   = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const creds = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const res   = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ From: env.TWILIO_FROM, To: to, Body: body }),
  });
  if (!res.ok) { const e = await res.text(); throw new Error(`Twilio ${res.status}: ${e}`); }
  return res.json();
}

function normalizePhone(raw) {
  if (!raw) return null;
  if (/^\+1\d{10}$/.test(raw)) return raw;
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d[0] === '1') return `+${d}`;
  return null;
}

function formatPhone(p) {
  const d = (p || '').replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return p;
}

function twimlResponse(message) {
  const xml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
  return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
}

function escapeXml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function cors(response) {
  const r = new Response(response.body, response);
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return r;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

// ============================================================
// Dashboard HTML (served at GET /)
// ============================================================
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mikey's Detailing — SMS Dashboard</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f0f0f; --surface: #1a1a1a; --surface2: #222;
    --border: #2a2a2a; --red: #C8102E; --red2: #a00c24;
    --text: #f0f0f0; --muted: #888; --green: #22c55e;
  }
  html, body { height: 100%; overflow: hidden; background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; font-size: 15px; }

  /* Layout */
  #app { display: flex; height: 100vh; }
  #sidebar { width: 300px; min-width: 260px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--surface); }
  #main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  /* Sidebar header */
  .sidebar-head { padding: 16px; border-bottom: 1px solid var(--border); }
  .sidebar-head h1 { font-size: 1rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .sidebar-head h1 span { color: var(--red); }
  .sidebar-head .subtitle { font-size: .75rem; color: var(--muted); margin-top: 2px; }

  /* New conversation */
  .new-convo { padding: 10px 16px; border-bottom: 1px solid var(--border); display: flex; gap: 8px; }
  .new-convo input { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); padding: 7px 10px; font-size: .85rem; }
  .new-convo input::placeholder { color: var(--muted); }
  .new-convo button { background: var(--red); border: none; border-radius: 8px; color: #fff; padding: 7px 12px; cursor: pointer; font-size: .85rem; font-weight: 600; white-space: nowrap; }

  /* Thread list */
  #thread-list { flex: 1; overflow-y: auto; }
  .thread-item { padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background .1s; display: flex; align-items: center; gap: 10px; }
  .thread-item:hover { background: var(--surface2); }
  .thread-item.active { background: #1f0a0e; border-left: 3px solid var(--red); }
  .thread-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--red); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .9rem; flex-shrink: 0; }
  .thread-info { flex: 1; min-width: 0; }
  .thread-name { font-weight: 600; font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .thread-preview { font-size: .78rem; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .thread-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .thread-time { font-size: .72rem; color: var(--muted); }
  .unread-badge { background: var(--red); color: #fff; border-radius: 999px; font-size: .7rem; font-weight: 700; padding: 1px 6px; min-width: 18px; text-align: center; }

  /* Main header */
  #chat-header { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; background: var(--surface); }
  #chat-header-name { font-weight: 700; font-size: 1rem; }
  #chat-header-phone { font-size: .8rem; color: var(--muted); }
  #rename-btn { margin-left: auto; background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--muted); padding: 4px 10px; cursor: pointer; font-size: .78rem; }
  #rename-btn:hover { border-color: var(--red); color: var(--text); }

  /* Messages */
  #messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
  .msg-wrap { display: flex; }
  .msg-wrap.out { justify-content: flex-end; }
  .bubble { max-width: 65%; padding: 10px 14px; border-radius: 16px; font-size: .9rem; line-height: 1.45; word-break: break-word; white-space: pre-wrap; }
  .msg-wrap.in  .bubble { background: var(--surface2); border-bottom-left-radius: 4px; }
  .msg-wrap.out .bubble { background: var(--red); color: #fff; border-bottom-right-radius: 4px; }
  .msg-time { font-size: .68rem; color: var(--muted); margin-top: 3px; text-align: right; }
  .msg-wrap.in .msg-time { text-align: left; }
  .msg-col { display: flex; flex-direction: column; max-width: 65%; }

  /* Empty state */
  #empty-state { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; color: var(--muted); }
  #empty-state .icon { font-size: 3rem; }

  /* Compose */
  #compose { padding: 14px 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; align-items: flex-end; background: var(--surface); }
  #compose textarea { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; color: var(--text); padding: 10px 14px; font-size: .9rem; font-family: inherit; resize: none; min-height: 44px; max-height: 120px; line-height: 1.4; }
  #compose textarea:focus { outline: none; border-color: var(--red); }
  #compose textarea::placeholder { color: var(--muted); }
  #send-btn { background: var(--red); border: none; border-radius: 10px; color: #fff; width: 44px; height: 44px; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .15s; }
  #send-btn:hover { background: var(--red2); }
  #send-btn:disabled { background: #444; cursor: default; }

  /* Toast */
  #toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 10px 20px; border-radius: 8px; font-size: .85rem; opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 99; }
  #toast.show { opacity: 1; }

  /* Status dot */
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); display: inline-block; margin-left: 6px; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

  /* Mobile */
  @media (max-width: 640px) {
    #sidebar { width: 100%; position: absolute; z-index: 10; height: 100%; transform: translateX(0); transition: transform .2s; }
    #sidebar.hidden { transform: translateX(-100%); }
    #main { width: 100%; }
    #back-btn { display: flex !important; }
  }
  #back-btn { display: none; background: none; border: none; color: var(--text); cursor: pointer; font-size: 1.2rem; padding: 4px; }
</style>
</head>
<body>
<div id="app">
  <!-- Sidebar -->
  <div id="sidebar">
    <div class="sidebar-head">
      <h1>🚗 <span>Mikey's</span> Detailing</h1>
      <div class="subtitle">SMS Dashboard <span class="dot"></span></div>
    </div>
    <div class="new-convo">
      <input id="new-phone" type="tel" placeholder="New: (360) 555-0100">
      <button onclick="startNewConvo()">+ New</button>
    </div>
    <div id="thread-list"></div>
  </div>

  <!-- Main -->
  <div id="main">
    <div id="empty-state">
      <div class="icon">💬</div>
      <div>Select a conversation or start a new one</div>
    </div>

    <div id="chat-view" style="display:none;flex:1;flex-direction:column;overflow:hidden;">
      <div id="chat-header">
        <button id="back-btn" onclick="showSidebar()">‹</button>
        <div>
          <div id="chat-header-name"></div>
          <div id="chat-header-phone"></div>
        </div>
        <button id="rename-btn" onclick="renameContact()">Rename</button>
      </div>
      <div id="messages"></div>
      <div id="compose">
        <textarea id="msg-input" placeholder="Type a message…" rows="1" onkeydown="handleKey(event)"></textarea>
        <button id="send-btn" onclick="sendMessage()">➤</button>
      </div>
    </div>
  </div>
</div>
<div id="toast"></div>

<script>
let activePhone = null;
let threads = [];
let pollTimer = null;
let msgPollTimer = null;

// ---- Boot ----
loadThreads();
setInterval(loadThreads, 8000); // refresh thread list every 8s

async function loadThreads() {
  try {
    const res = await fetch('/api/threads');
    if (res.status === 401) { location.reload(); return; }
    threads = await res.json();
    renderThreadList();
  } catch(e) {}
}

function renderThreadList() {
  const el = document.getElementById('thread-list');
  if (!threads.length) {
    el.innerHTML = '<div style="padding:20px;color:var(--muted);font-size:.85rem;text-align:center">No conversations yet</div>';
    return;
  }
  el.innerHTML = threads.map(t => {
    const display = t.name || formatPhone(t.phone);
    const initial = (t.name || t.phone).slice(-2).toUpperCase();
    const active  = t.phone === activePhone ? 'active' : '';
    const badge   = t.unread > 0 ? \`<div class="unread-badge">\${t.unread}</div>\` : '';
    const time    = t.lastTime ? relTime(t.lastTime) : '';
    return \`<div class="thread-item \${active}" onclick="openThread('\${t.phone}')">
      <div class="thread-avatar">\${initial}</div>
      <div class="thread-info">
        <div class="thread-name">\${esc(display)}</div>
        <div class="thread-preview">\${esc((t.lastMessage||'').slice(0,50))}</div>
      </div>
      <div class="thread-meta"><div class="thread-time">\${time}</div>\${badge}</div>
    </div>\`;
  }).join('');
}

async function openThread(phone) {
  activePhone = phone;
  const t = threads.find(x => x.phone === phone) || {};

  // Mobile: hide sidebar
  document.getElementById('sidebar').classList.add('hidden');

  document.getElementById('empty-state').style.display = 'none';
  const cv = document.getElementById('chat-view');
  cv.style.display = 'flex';

  document.getElementById('chat-header-name').textContent = t.name || formatPhone(phone);
  document.getElementById('chat-header-phone').textContent = t.name ? formatPhone(phone) : '';
  document.getElementById('msg-input').focus();

  renderThreadList(); // refresh active highlight
  await loadMessages();

  clearInterval(msgPollTimer);
  msgPollTimer = setInterval(loadMessages, 5000); // poll active thread every 5s
}

async function loadMessages() {
  if (!activePhone) return;
  try {
    const res  = await fetch('/api/thread?phone=' + encodeURIComponent(activePhone));
    const msgs = await res.json();
    renderMessages(msgs);
    // Update unread count locally
    const t = threads.find(x => x.phone === activePhone);
    if (t) { t.unread = 0; renderThreadList(); }
  } catch(e) {}
}

function renderMessages(msgs) {
  const el  = document.getElementById('messages');
  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  el.innerHTML = msgs.map(m => {
    const dir  = m.direction === 'out' ? 'out' : 'in';
    const time = m.ts ? new Date(m.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '';
    return \`<div class="msg-wrap \${dir}"><div class="msg-col">
      <div class="bubble">\${esc(m.body)}</div>
      <div class="msg-time">\${time}</div>
    </div></div>\`;
  }).join('');
  if (atBottom || msgs.length < 5) el.scrollTop = el.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('msg-input');
  const body  = input.value.trim();
  if (!body || !activePhone) return;

  const btn = document.getElementById('send-btn');
  btn.disabled = true;
  input.value = '';
  autoResize(input);

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: activePhone, body }),
    });
    if (!res.ok) throw new Error('send failed');
    await loadMessages();
  } catch(e) {
    toast('Failed to send — try again');
    input.value = body;
  }
  btn.disabled = false;
  input.focus();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  autoResize(e.target);
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function startNewConvo() {
  const input = document.getElementById('new-phone');
  const phone = input.value.trim();
  if (!phone) { input.focus(); return; }
  const norm = normalizePhone(phone);
  if (!norm) { toast('Invalid phone number'); return; }
  input.value = '';
  // Create a synthetic thread if not existing
  if (!threads.find(t => t.phone === norm)) {
    threads.unshift({ phone: norm, name: '', ts: Date.now(), unread: 0, lastMessage: '' });
    renderThreadList();
  }
  openThread(norm);
}

async function renameContact() {
  if (!activePhone) return;
  const t    = threads.find(x => x.phone === activePhone) || {};
  const name = prompt('Name for ' + formatPhone(activePhone) + ':', t.name || '');
  if (name === null) return;
  await fetch('/api/name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: activePhone, name }),
  });
  t.name = name;
  document.getElementById('chat-header-name').textContent = name || formatPhone(activePhone);
  document.getElementById('chat-header-phone').textContent = name ? formatPhone(activePhone) : '';
  renderThreadList();
}

function showSidebar() {
  document.getElementById('sidebar').classList.remove('hidden');
  clearInterval(msgPollTimer);
}

// ---- Utilities ----
function formatPhone(p) {
  const d = (p||'').replace(/\\D/g,'');
  if (d.length===11&&d[0]==='1') return '('+d.slice(1,4)+') '+d.slice(4,7)+'-'+d.slice(7);
  if (d.length===10) return '('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);
  return p;
}

function normalizePhone(raw) {
  if (!raw) return null;
  if (/^\\+1\\d{10}$/.test(raw)) return raw;
  const d = raw.replace(/\\D/g,'');
  if (d.length===10) return '+1'+d;
  if (d.length===11&&d[0]==='1') return '+'+d;
  return null;
}

function relTime(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)   return 'just now';
  if (diff < 3600000) return Math.floor(diff/60000)+'m';
  if (diff < 86400000) return Math.floor(diff/3600000)+'h';
  return new Date(ts).toLocaleDateString([],{month:'short',day:'numeric'});
}

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\n/g,'<br>');
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}
</script>
</body>
</html>`;
