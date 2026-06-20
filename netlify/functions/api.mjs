/**
 * Mikey's Mobile Detailing — Netlify Function (SMS engine)
 *
 * This is the GitHub-native replacement for the Cloudflare Worker.
 * It lives in your repo, and Netlify auto-deploys it whenever you push.
 *
 * Webhooks (called by Twilio):
 *   POST /submit         — quote form → auto-texts client + Mikey
 *   POST /sms            — inbound SMS → stores it, relays to Mikey's cell
 *   POST /call           — inbound call → rings Mikey's cell
 *   POST /voicemail      — missed call → record voicemail
 *   POST /voicemail-done — recording done → text Mikey the link
 *
 * Dashboard API (password-protected via the x-dashboard-pass header):
 *   GET  /api/threads             — list all conversations
 *   GET  /api/thread?phone=+1xxx  — messages for one conversation
 *   POST /api/send                — send an outbound SMS { to, body }
 *   POST /api/name                — save a display name { phone, name }
 *
 * Required Netlify environment variables (set in the Netlify UI):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM         — Twilio number e.g. +12065551234
 *   MIKEY_PHONE         — personal cell e.g. +14256007897
 *   DASHBOARD_PASSWORD  — password to access the dashboard
 *
 * Storage: Netlify Blobs (built in — no setup needed).
 */

import { getStore } from '@netlify/blobs';

// Netlify Functions v2: one function handles all these paths.
export const config = {
  path: [
    '/submit',
    '/sms',
    '/call',
    '/voicemail',
    '/voicemail-done',
    '/api/threads',
    '/api/thread',
    '/api/send',
    '/api/name',
  ],
};

export default async function handler(request) {
  const env = process.env;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return cors(new Response(null, { status: 204 }));
  }

  // --- Twilio webhooks (no auth — Twilio calls these) ---
  if (request.method === 'POST' && url.pathname === '/submit')         return handleSubmit(request, env);
  if (request.method === 'POST' && url.pathname === '/sms')            return handleInboundSms(request, env);
  if (request.method === 'POST' && url.pathname === '/call')           return handleInboundCall(request, env);
  if (request.method === 'POST' && url.pathname === '/voicemail')      return handleVoicemail(request, env);
  if (request.method === 'POST' && url.pathname === '/voicemail-done') return handleVoicemailDone(request, env);

  // --- Dashboard API (password-protected) ---
  if (url.pathname.startsWith('/api/'))                                return handleApi(request, env, url);

  return new Response('Not found', { status: 404 });
}

// ============================================================
// Storage (Netlify Blobs) — drop-in for the old KV helpers
// ============================================================
function store() {
  return getStore('mkd-messages');
}

async function kvGet(key) {
  return (await store().get(key)) ?? null;
}

async function kvPut(key, value) {
  await store().set(key, value);
}

// ============================================================
// Dashboard auth
// ============================================================
function checkAuth(request, env) {
  const pass = request.headers.get('x-dashboard-pass') || '';
  return env.DASHBOARD_PASSWORD && pass === env.DASHBOARD_PASSWORD;
}

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
  const raw = await kvGet('threads');
  const threads = raw ? JSON.parse(raw) : [];
  const enriched = await Promise.all(threads.map(async t => {
    const msgs = await getMessages(t.phone);
    const last = msgs[msgs.length - 1];
    return { ...t, lastMessage: last?.body || '', lastTime: last?.ts || t.ts, unread: t.unread || 0 };
  }));
  enriched.sort((a, b) => b.lastTime - a.lastTime);
  return json(enriched);
}

async function apiThread(env, url) {
  const phone = url.searchParams.get('phone');
  if (!phone) return new Response('missing phone', { status: 400 });
  const msgs = await getMessages(phone);
  await markRead(phone);
  return json(msgs);
}

async function apiSend(request, env) {
  const { to, body } = await request.json();
  if (!to || !body) return json({ error: 'missing to/body' }, 422);
  const phone = normalizePhone(to);
  if (!phone) return json({ error: 'bad phone' }, 422);
  await sendSms(env, phone, body);
  const msg = { id: genId(), ts: Date.now(), direction: 'out', from: env.TWILIO_FROM, to: phone, body };
  await storeMessage(env, phone, msg);
  return json({ ok: true });
}

async function apiSaveName(request, env) {
  const { phone, name } = await request.json();
  if (!phone) return new Response('missing phone', { status: 400 });
  const raw = await kvGet('threads');
  const threads = raw ? JSON.parse(raw) : [];
  const t = threads.find(x => x.phone === phone);
  if (t) { t.name = name; await kvPut('threads', JSON.stringify(threads)); }
  return json({ ok: true });
}

// ============================================================
// Message helpers
// ============================================================
async function storeMessage(env, phone, msg) {
  const key = `thread:${phone}`;
  const raw = await kvGet(key);
  const msgs = raw ? JSON.parse(raw) : [];
  msgs.push(msg);
  if (msgs.length > 200) msgs.splice(0, msgs.length - 200);
  await kvPut(key, JSON.stringify(msgs));

  const tRaw = await kvGet('threads');
  const threads = tRaw ? JSON.parse(tRaw) : [];
  const existing = threads.find(t => t.phone === phone);
  if (existing) {
    existing.ts = msg.ts;
    if (msg.direction === 'in') existing.unread = (existing.unread || 0) + 1;
  } else {
    threads.push({ phone, name: '', ts: msg.ts, unread: msg.direction === 'in' ? 1 : 0 });
  }
  await kvPut('threads', JSON.stringify(threads));
}

async function getMessages(phone) {
  const raw = await kvGet(`thread:${phone}`);
  return raw ? JSON.parse(raw) : [];
}

async function markRead(phone) {
  const raw = await kvGet('threads');
  if (!raw) return;
  const threads = JSON.parse(raw);
  const t = threads.find(x => x.phone === phone);
  if (t) { t.unread = 0; await kvPut('threads', JSON.stringify(threads)); }
}

// ============================================================
// Twilio webhooks
// ============================================================
async function handleSubmit(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return cors(json({ ok: false, error: 'bad_json' }, 400)); }

  const { name, phone, email, location, total, vehicle, condition, services, notes, smsConsent } = body;
  if (!name || !phone) return cors(json({ ok: false, error: 'missing_fields' }, 422));

  const clientPhone = normalizePhone(phone);
  if (!clientPhone) return cors(json({ ok: false, error: 'bad_phone' }, 422));

  const serviceList = Array.isArray(services) ? services.join(', ') : (services || '');
  const quoteLine   = total ? `$${total}` : 'TBD';

  const clientMsg = `Hey ${name.split(' ')[0]}, it's Mikey! I got your form submission on my site. Whenever you have a moment, please send over the car(s) year, make, and model and I can confirm that price for you. Thanks!`;

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
    smsConsent
      ? sendSms(env, clientPhone, clientMsg)
      : Promise.resolve({ skipped: true }),
    sendSms(env, env.MIKEY_PHONE, mikeyMsg),
  ]);

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
  const mikeyPhone = normalizePhone(env.MIKEY_PHONE) || '+14256007897';

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
  const mikeyPhone = normalizePhone(env.MIKEY_PHONE) || '+14256007897';

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
  const mikeyPhone   = normalizePhone(env.MIKEY_PHONE) || '+14256007897';

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

function twimlResponse(message) {
  const xml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
  return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
