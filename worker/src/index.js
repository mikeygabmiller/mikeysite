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
 * Booking endpoints (public):
 *   GET  /slots         — available time slots for next 14 days
 *   POST /book          — claim a slot + send notifications
 *
 * Dashboard API (password-protected):
 *   GET  /              — serve the SMS dashboard HTML
 *   GET  /schedule      — serve the schedule management HTML
 *   GET  /api/threads   — list all conversations
 *   GET  /api/thread?phone=+1xxx — messages for one conversation
 *   POST /api/send      — send an outbound SMS { to, body }
 *   POST /api/name      — save a display name for a number { phone, name }
 *   GET  /api/schedule  — get template + overrides + upcoming bookings
 *   POST /api/schedule/template — save weekly availability template
 *   POST /api/schedule/slot     — block/unblock/cancel a specific slot
 *   GET  /api/bookings  — list upcoming bookings
 *
 * Required Worker Secrets:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM        — Twilio number e.g. +12065551234
 *   MIKEY_PHONE        — personal cell e.g. +14256007897
 *   DASHBOARD_PASSWORD — password to access the dashboard
 *
 * Required KV Namespace binding (wrangler.toml):
 *   MESSAGES
 *
 * KV structure:
 *   avail:template      — JSON weekly schedule { mon: ["08:00",...], ... }
 *   avail:overrides     — JSON { "YYYY-MM-DD:HH:MM": "blocked"|"open", ... }
 *   bookings:index      — JSON array [{ date, time, name, phone }, ...]
 *   booking:YYYY-MM-DD:HH:MM — JSON full booking detail
 */

// ============================================================
// Default weekly availability template
// ============================================================
const DEFAULT_SCHEDULE = {
  mon: ['08:00','10:00','12:00','14:00'],
  tue: ['08:00','10:00','12:00','14:00'],
  wed: ['08:00','10:00','12:00','14:00'],
  thu: ['08:00','10:00','12:00','14:00'],
  fri: ['08:00','10:00','12:00','14:00'],
  sat: ['08:00','10:00','12:00','14:00'],
  sun: [],
};

const DAY_KEYS  = ['sun','mon','tue','wed','thu','fri','sat'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
    }

    // --- Public booking endpoints ---
    if (request.method === 'GET'  && url.pathname === '/slots') return handleGetSlots(request, env);
    if (request.method === 'POST' && url.pathname === '/book')  return handleBook(request, env);

    // --- Twilio webhooks (no auth needed — Twilio calls these) ---
    if (request.method === 'POST' && url.pathname === '/submit')         return handleSubmit(request, env);
    if (request.method === 'POST' && url.pathname === '/sms')            return handleInboundSms(request, env);
    if (request.method === 'POST' && url.pathname === '/call')           return handleInboundCall(request, env);
    if (request.method === 'POST' && url.pathname === '/voicemail')      return handleVoicemail(request, env);
    if (request.method === 'POST' && url.pathname === '/voicemail-done') return handleVoicemailDone(request, env);

    // --- Dashboard (password-protected) ---
    if (url.pathname === '/' || url.pathname === '')                                    return serveDashboard(request, env);
    if (url.pathname === '/schedule' || url.pathname === '/schedule/')                  return serveSchedule(request, env);
    if (url.pathname.startsWith('/api/'))                                               return handleApi(request, env, url);

    return new Response('Not found', { status: 404 });
  },
};

// ============================================================
// Slot availability — public
// ============================================================
async function handleGetSlots(request, env) {
  // Load template, overrides, and bookings index in parallel
  const [tplRaw, ovrRaw, idxRaw] = await Promise.all([
    env.MESSAGES.get('avail:template'),
    env.MESSAGES.get('avail:overrides'),
    env.MESSAGES.get('bookings:index'),
  ]);
  const template  = tplRaw ? JSON.parse(tplRaw) : DEFAULT_SCHEDULE;
  const overrides = ovrRaw ? JSON.parse(ovrRaw) : {};
  const bookings  = idxRaw ? JSON.parse(idxRaw) : [];
  const bookedSet = new Set(bookings.map(b => `${b.date}:${b.time}`));

  const now = new Date();
  const result = {};

  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    const dateStr = getPacificDateStr(d);
    const dayKey  = getPacificDayKey(d);
    const dayName = getPacificDayName(d);
    const shortDate = getPacificShortDate(d);

    const templateSlots = template[dayKey] || [];
    if (templateSlots.length === 0) continue;

    // Pacific "now" hour for same-day cutoff (require 2h notice)
    const nowPT    = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const nowHour  = nowPT.getHours() + nowPT.getMinutes() / 60;
    const isToday  = (getPacificDateStr(new Date()) === dateStr);

    const slots = templateSlots
      .filter(time => {
        const [h] = time.split(':').map(Number);
        if (isToday && h < nowHour + 2) return false; // skip past/too-soon slots
        return true;
      })
      .map(time => {
        const key = `${dateStr}:${time}`;
        const override = overrides[key];
        let available = true;
        if (override === 'blocked') available = false;
        if (bookedSet.has(key))    available = false;
        if (override === 'open')   available = !bookedSet.has(key); // explicit open (cancellation)
        return { time, label: formatTimeLabel(time), available };
      });

    if (slots.length === 0) continue;

    result[dateStr] = { dayName, shortDate, slots };
  }

  return cors(json({ slots: result }));
}

// ============================================================
// Book a slot — public
// ============================================================
async function handleBook(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return cors(json({ ok: false, error: 'bad_json' }, 400)); }

  const { date, time, name, phone, email, location, total, vehicle, condition, services, notes, smsConsent } = body;
  if (!date || !time || !name || !phone) return cors(json({ ok: false, error: 'missing_fields' }, 422));

  const clientPhone = normalizePhone(phone);
  if (!clientPhone) return cors(json({ ok: false, error: 'bad_phone' }, 422));

  // Atomically check and claim the slot
  const bookingKey = `booking:${date}:${time}`;
  const existing   = await env.MESSAGES.get(bookingKey);
  if (existing) return cors(json({ ok: false, error: 'slot_taken' }, 409));

  // Check override
  const ovrRaw    = await env.MESSAGES.get('avail:overrides');
  const overrides = ovrRaw ? JSON.parse(ovrRaw) : {};
  if (overrides[`${date}:${time}`] === 'blocked') return cors(json({ ok: false, error: 'slot_blocked' }, 409));

  // Save booking
  const booking = {
    name, phone: clientPhone,
    email: email || '', location: location || '',
    total, vehicle, condition,
    services: Array.isArray(services) ? services : [services],
    notes: notes || '',
    bookedAt: Date.now(),
  };
  await env.MESSAGES.put(bookingKey, JSON.stringify(booking));

  // Update bookings index
  const idxRaw = await env.MESSAGES.get('bookings:index');
  const index  = idxRaw ? JSON.parse(idxRaw) : [];
  index.push({ date, time, name, phone: clientPhone });
  index.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  if (index.length > 500) index.splice(0, index.length - 500);
  await env.MESSAGES.put('bookings:index', JSON.stringify(index));

  // Format for messages
  const dayName     = getDayNameFromDateStr(date);
  const dateFormatted = formatDateStr(date);
  const timeLabel   = formatTimeLabel(time);
  const serviceList = Array.isArray(services) ? services.join(', ') : (services || '');
  const quoteLine   = total ? `$${total}` : 'TBD';

  const clientMsg = [
    `Hey ${name.split(' ')[0]}! ✅ You're booked with Mikey's Mobile Detailing!`,
    `📅 ${dayName}, ${dateFormatted} at ${timeLabel}`,
    `Services: ${serviceList}`,
    `Estimated total: ${quoteLine}`,
    `I come to you — no need to go anywhere. Reply here if you need to change anything. See you then! 🚗✨`,
  ].join('\n');

  const mikeyMsg = [
    `✅ NEW BOOKING — ${name}`,
    `📅 ${dayName}, ${dateFormatted} at ${timeLabel}`,
    `Phone: ${clientPhone}`,
    email       ? `Email: ${email}`         : null,
    location    ? `City: ${location}`       : null,
    `Quote: ${quoteLine}`,
    vehicle     ? `Vehicle: ${vehicle}`     : null,
    condition   ? `Condition: ${condition}` : null,
    serviceList ? `Services: ${serviceList}` : null,
    notes       ? `Notes: ${notes}`         : null,
  ].filter(Boolean).join('\n');

  const ts = Date.now();
  const [r1, r2] = await Promise.allSettled([
    smsConsent
      ? sendSms(env, clientPhone, clientMsg)
      : Promise.resolve({ skipped: true }),
    sendSms(env, env.MIKEY_PHONE, mikeyMsg),
  ]);

  // Store in SMS dashboard
  await storeMessage(env, clientPhone, {
    id: genId(), ts, direction: 'out',
    from: env.TWILIO_FROM, to: clientPhone,
    body: smsConsent ? clientMsg : `[Booking confirmed — SMS consent not given]\n${mikeyMsg}`,
    meta: { name, quote: quoteLine, vehicle, services: serviceList, booking: `${date} ${time}` },
  }).catch(() => {});

  return cors(json({ ok: true, clientSms: r1.status, mikeySms: r2.status }));
}

// ============================================================
// Dashboard auth
// ============================================================
function checkAuth(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const token  = cookie.match(/mkd_token=([^;]+)/)?.[1];
  return token === env.DASHBOARD_PASSWORD;
}

function serveDashboard(request, env) {
  if (request.method === 'POST') return handleLogin(request, env);
  if (!checkAuth(request, env)) return loginPage();
  return new Response(DASHBOARD_HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function serveSchedule(request, env) {
  if (!checkAuth(request, env)) {
    return new Response(null, { status: 302, headers: { 'Location': '/' } });
  }
  return new Response(SCHEDULE_HTML, {
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

  if (url.pathname === '/api/threads'  && request.method === 'GET')  return apiThreads(env);
  if (url.pathname === '/api/thread'   && request.method === 'GET')  return apiThread(env, url);
  if (url.pathname === '/api/send'     && request.method === 'POST') return apiSend(request, env);
  if (url.pathname === '/api/name'     && request.method === 'POST') return apiSaveName(request, env);

  // Schedule management
  if (url.pathname === '/api/schedule'          && request.method === 'GET')  return apiGetSchedule(env);
  if (url.pathname === '/api/schedule/template' && request.method === 'POST') return apiSetTemplate(request, env);
  if (url.pathname === '/api/schedule/slot'     && request.method === 'POST') return apiToggleSlot(request, env);
  if (url.pathname === '/api/bookings'          && request.method === 'GET')  return apiBookings(env);

  return new Response('Not found', { status: 404 });
}

async function apiThreads(env) {
  const raw = await env.MESSAGES.get('threads');
  const threads = raw ? JSON.parse(raw) : [];
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

async function apiGetSchedule(env) {
  const [tplRaw, ovrRaw, idxRaw] = await Promise.all([
    env.MESSAGES.get('avail:template'),
    env.MESSAGES.get('avail:overrides'),
    env.MESSAGES.get('bookings:index'),
  ]);
  const template  = tplRaw ? JSON.parse(tplRaw) : DEFAULT_SCHEDULE;
  const overrides = ovrRaw ? JSON.parse(ovrRaw) : {};
  const index     = idxRaw ? JSON.parse(idxRaw) : [];

  // Only return upcoming bookings (today onwards)
  const todayStr = getPacificDateStr(new Date());
  const upcoming = index.filter(b => b.date >= todayStr).slice(0, 60);

  return new Response(JSON.stringify({ template, overrides, upcoming }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function apiSetTemplate(request, env) {
  const { template } = await request.json();
  if (!template) return new Response(JSON.stringify({ error: 'missing template' }), { status: 422, headers: { 'Content-Type': 'application/json' } });
  await env.MESSAGES.put('avail:template', JSON.stringify(template));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

async function apiToggleSlot(request, env) {
  // action: 'block' | 'unblock' | 'cancel'
  const { date, time, action } = await request.json();
  if (!date || !time || !action) return new Response(JSON.stringify({ error: 'missing fields' }), { status: 422, headers: { 'Content-Type': 'application/json' } });

  const ovrRaw    = await env.MESSAGES.get('avail:overrides');
  const overrides = ovrRaw ? JSON.parse(ovrRaw) : {};
  const key       = `${date}:${time}`;

  if (action === 'block') {
    overrides[key] = 'blocked';
  } else if (action === 'unblock') {
    delete overrides[key];
  } else if (action === 'cancel') {
    // Cancel a booking: remove it and mark slot open
    await env.MESSAGES.delete(`booking:${date}:${time}`);
    const idxRaw = await env.MESSAGES.get('bookings:index');
    if (idxRaw) {
      const index = JSON.parse(idxRaw).filter(b => !(b.date === date && b.time === time));
      await env.MESSAGES.put('bookings:index', JSON.stringify(index));
    }
    overrides[key] = 'open'; // explicitly open so it re-appears as available
  }

  await env.MESSAGES.put('avail:overrides', JSON.stringify(overrides));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

async function apiBookings(env) {
  const idxRaw = await env.MESSAGES.get('bookings:index');
  const index  = idxRaw ? JSON.parse(idxRaw) : [];
  const todayStr = getPacificDateStr(new Date());
  const upcoming = index.filter(b => b.date >= todayStr);
  // Enrich with full detail
  const enriched = await Promise.all(upcoming.map(async b => {
    const detail = await env.MESSAGES.get(`booking:${b.date}:${b.time}`);
    return { ...b, ...(detail ? JSON.parse(detail) : {}) };
  }));
  return new Response(JSON.stringify(enriched), { headers: { 'Content-Type': 'application/json' } });
}

// ============================================================
// KV helpers
// ============================================================
async function storeMessage(env, phone, msg) {
  const key  = `thread:${phone}`;
  const raw  = await env.MESSAGES.get(key);
  const msgs = raw ? JSON.parse(raw) : [];
  msgs.push(msg);
  if (msgs.length > 200) msgs.splice(0, msgs.length - 200);
  await env.MESSAGES.put(key, JSON.stringify(msgs));

  const tRaw    = await env.MESSAGES.get('threads');
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

  const { name, phone, email, location, total, vehicle, condition, services, notes, smsConsent } = body;
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
    email       ? `Email: ${email}`         : null,
    location    ? `City: ${location}`       : null,
    `Quote: ${quoteLine}`,
    vehicle     ? `Vehicle: ${vehicle}`     : null,
    condition   ? `Condition: ${condition}` : null,
    serviceList ? `Services: ${serviceList}` : null,
    notes       ? `Notes: ${notes}`         : null,
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

function formatPhone(p) {
  const d = (p || '').replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return p;
}

function getPacificDateStr(d) {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); // YYYY-MM-DD
}

function getPacificDayKey(d) {
  return d.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short' }).toLowerCase(); // 'mon'
}

function getPacificDayName(d) {
  return d.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long' }); // 'Monday'
}

function getPacificShortDate(d) {
  return d.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', month: 'short', day: 'numeric' }); // 'Mon, Jan 15'
}

function formatTimeLabel(time) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour  = h % 12 || 12;
  return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2,'0')} ${ampm}`;
}

function formatDateStr(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

function getDayNameFromDateStr(dateStr) {
  // Parse as Pacific date (already Pacific, just need day of week)
  const [year, month, day] = dateStr.split('-').map(Number);
  // Build the date at noon UTC so timezone shifts don't push the day
  const d = new Date(Date.UTC(year, month - 1, day, 20, 0, 0)); // noon PT ≈ 20:00 UTC
  return DAY_NAMES[d.getUTCDay()];
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
// Schedule management HTML
// ============================================================
const SCHEDULE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mikey's Detailing — Schedule</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f0f0f; --surface: #1a1a1a; --surface2: #222; --surface3: #2a2a2a;
  --border: #2a2a2a; --red: #C8102E; --red2: #a00c24;
  --text: #f0f0f0; --muted: #888; --green: #22c55e; --gold: #C9A24B;
}
body { background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; font-size: 15px; min-height: 100vh; padding: 0; }
a { color: var(--red); text-decoration: none; }
a:hover { text-decoration: underline; }

.topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 14px 24px; display: flex; align-items: center; gap: 16px; }
.topbar h1 { font-size: 1rem; font-weight: 700; }
.topbar h1 span { color: var(--red); }
.topbar nav { display: flex; gap: 4px; margin-left: auto; }
.topbar nav a { padding: 6px 14px; border-radius: 8px; font-size: .85rem; font-weight: 600; color: var(--muted); }
.topbar nav a:hover { background: var(--surface2); color: var(--text); text-decoration: none; }
.topbar nav a.active { background: var(--red); color: #fff; }

.wrap { max-width: 960px; margin: 0 auto; padding: 32px 20px 60px; display: grid; gap: 28px; }

.card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; }
.card-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 6px; }
.card-sub { font-size: .85rem; color: var(--muted); margin-bottom: 20px; }

/* Weekly template grid */
.template-grid { display: grid; gap: 12px; }
.day-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface2); border-radius: 10px; }
.day-label { width: 90px; font-weight: 700; font-size: .9rem; flex-shrink: 0; }
.day-slots { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
.slot-toggle { padding: 6px 14px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--bg); color: var(--muted); font-size: .8rem; font-weight: 600; cursor: pointer; transition: all .15s; font-family: inherit; }
.slot-toggle.on { border-color: var(--green); background: rgba(34,197,94,.1); color: var(--green); }
.slot-toggle:hover { border-color: #555; color: var(--text); }
.slot-toggle.on:hover { border-color: var(--green); }
.save-btn { margin-top: 18px; padding: 11px 28px; background: var(--red); border: none; border-radius: 10px; color: #fff; font-weight: 700; font-size: .95rem; cursor: pointer; font-family: inherit; transition: background .15s; }
.save-btn:hover { background: var(--red2); }
.save-btn:disabled { opacity: .5; cursor: default; }

/* Upcoming bookings */
.booking-list { display: grid; gap: 10px; }
.booking-item { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: flex; align-items: flex-start; gap: 14px; }
.booking-time { text-align: center; flex-shrink: 0; width: 56px; }
.booking-time .bt-day { font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 700; }
.booking-time .bt-date { font-size: 1.6rem; font-weight: 900; line-height: 1; color: var(--red); }
.booking-time .bt-month { font-size: .7rem; color: var(--muted); font-weight: 600; }
.booking-info { flex: 1; min-width: 0; }
.booking-info .bi-name { font-weight: 700; font-size: .95rem; }
.booking-info .bi-meta { font-size: .82rem; color: var(--muted); margin-top: 3px; }
.booking-info .bi-services { font-size: .82rem; color: var(--gold); margin-top: 2px; font-weight: 600; }
.booking-info .bi-time { font-size: .82rem; color: var(--text); margin-top: 2px; font-weight: 600; }
.booking-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; flex-shrink: 0; }
.cancel-btn { padding: 5px 12px; border-radius: 7px; border: 1px solid rgba(200,16,46,.4); background: transparent; color: #ff6b6b; font-size: .75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.cancel-btn:hover { background: rgba(200,16,46,.12); }
.badge-booked { background: rgba(34,197,94,.12); color: var(--green); border-radius: 6px; padding: 3px 8px; font-size: .72rem; font-weight: 700; letter-spacing: .04em; }

/* Override slots */
.override-form { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.override-form label { font-size: .85rem; color: var(--muted); }
.override-form input[type=date], .override-form select { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); padding: 8px 12px; font-size: .85rem; font-family: inherit; }
.override-form .block-btn { padding: 8px 16px; border-radius: 8px; border: none; background: #444; color: var(--text); font-weight: 600; font-size: .85rem; cursor: pointer; font-family: inherit; }
.override-form .block-btn:hover { background: #555; }
.override-list { display: grid; gap: 6px; margin-top: 12px; }
.override-item { display: flex; align-items: center; gap: 10px; background: var(--surface2); border-radius: 8px; padding: 8px 12px; font-size: .82rem; }
.override-item .oi-key { flex: 1; font-family: monospace; color: var(--muted); }
.override-item .oi-status { font-weight: 700; color: #ff6b6b; }
.unblock-btn { padding: 3px 10px; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: .75rem; cursor: pointer; font-family: inherit; }
.unblock-btn:hover { color: var(--text); }

.empty { text-align: center; padding: 32px; color: var(--muted); font-size: .9rem; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 10px 20px; border-radius: 8px; font-size: .85rem; opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 99; }
.toast.show { opacity: 1; }
</style>
</head>
<body>
<div class="topbar">
  <h1>🚗 <span>Mikey's</span> Detailing</h1>
  <nav>
    <a href="/">Messages</a>
    <a href="/schedule" class="active">Schedule</a>
  </nav>
</div>

<div class="wrap">

  <!-- Weekly Template -->
  <div class="card">
    <div class="card-title">Weekly Availability</div>
    <div class="card-sub">Toggle which time slots you're open each week. This is your default schedule — you can block specific dates below.</div>
    <div class="template-grid" id="templateGrid">Loading…</div>
    <button class="save-btn" id="saveTemplateBtn" onclick="saveTemplate()">Save Schedule</button>
  </div>

  <!-- Upcoming Bookings -->
  <div class="card">
    <div class="card-title">Upcoming Bookings</div>
    <div class="card-sub">All confirmed appointments. Cancel to reopen the slot.</div>
    <div id="bookingList"><div class="empty">Loading…</div></div>
  </div>

  <!-- Block Specific Slots -->
  <div class="card">
    <div class="card-title">Block / Unblock Specific Dates</div>
    <div class="card-sub">Need a day off or want to open an extra slot? Override here.</div>
    <div class="override-form">
      <label>Date</label>
      <input type="date" id="overrideDate">
      <label>Time</label>
      <select id="overrideTime">
        <option value="08:00">8 AM</option>
        <option value="10:00">10 AM</option>
        <option value="12:00">12 PM</option>
        <option value="14:00">2 PM</option>
        <option value="ALL">Whole day</option>
      </select>
      <button class="block-btn" onclick="blockSlot()">Block Slot</button>
    </div>
    <div id="overrideList" class="override-list"></div>
  </div>

</div>
<div id="toast" class="toast"></div>

<script>
const ALL_TIMES = ['08:00','10:00','12:00','14:00'];
const ALL_DAYS  = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_NAMES = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };
const TIME_LABELS = { '08:00':'8 AM', '10:00':'10 AM', '12:00':'12 PM', '14:00':'2 PM' };

let currentTemplate = null;
let currentOverrides = {};

async function load() {
  const res  = await fetch('/api/schedule');
  const data = await res.json();
  currentTemplate  = data.template;
  currentOverrides = data.overrides || {};
  renderTemplate(data.template);
  renderBookings(data.upcoming || []);
  renderOverrides(currentOverrides);
}

function renderTemplate(tpl) {
  const grid = document.getElementById('templateGrid');
  grid.innerHTML = ALL_DAYS.map(day => {
    const active = tpl[day] || [];
    const slots = ALL_TIMES.map(t =>
      \`<button class="slot-toggle \${active.includes(t)?'on':''}" data-day="\${day}" data-time="\${t}" onclick="toggleSlot(this)">\${TIME_LABELS[t]}</button>\`
    ).join('');
    return \`<div class="day-row"><div class="day-label">\${DAY_NAMES[day]}</div><div class="day-slots">\${slots}</div></div>\`;
  }).join('');
}

function toggleSlot(btn) {
  btn.classList.toggle('on');
}

async function saveTemplate() {
  const btn = document.getElementById('saveTemplateBtn');
  btn.disabled = true; btn.textContent = 'Saving…';
  const template = {};
  ALL_DAYS.forEach(day => {
    template[day] = [];
    document.querySelectorAll(\`.slot-toggle.on[data-day="\${day}"]\`).forEach(b => template[day].push(b.dataset.time));
  });
  await fetch('/api/schedule/template', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template }),
  });
  currentTemplate = template;
  btn.disabled = false; btn.textContent = 'Save Schedule';
  toast('Schedule saved!');
}

function renderBookings(bookings) {
  const el = document.getElementById('bookingList');
  if (!bookings.length) { el.innerHTML = '<div class="empty">No upcoming bookings yet.</div>'; return; }
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  el.innerHTML = '<div class="booking-list">' + bookings.map(b => {
    const [yr, mo, dy] = b.date.split('-').map(Number);
    const svc = Array.isArray(b.services) ? b.services.join(', ') : (b.services || '');
    const timeLabel = formatTimeLabel(b.time);
    return \`<div class="booking-item">
      <div class="booking-time">
        <div class="bt-day">\${b.date ? new Date(yr,mo-1,dy).toLocaleDateString('en-US',{weekday:'short'}) : ''}</div>
        <div class="bt-date">\${dy}</div>
        <div class="bt-month">\${MONTHS_SHORT[mo-1]}</div>
      </div>
      <div class="booking-info">
        <div class="bi-name">\${esc(b.name)}</div>
        <div class="bi-time">⏰ \${timeLabel}</div>
        \${svc ? \`<div class="bi-services">\${esc(svc)}\${b.total?'  ·  $'+b.total:''}</div>\` : ''}
        <div class="bi-meta">\${esc(b.phone||'')} \${b.location?'· '+esc(b.location):''}</div>
      </div>
      <div class="booking-actions">
        <span class="badge-booked">BOOKED</span>
        <button class="cancel-btn" onclick="cancelBooking('\${b.date}','\${b.time}','\${esc(b.name)}')">Cancel</button>
      </div>
    </div>\`;
  }).join('') + '</div>';
}

function renderOverrides(overrides) {
  const el = document.getElementById('overrideList');
  const blocked = Object.entries(overrides).filter(([,v]) => v === 'blocked');
  if (!blocked.length) { el.innerHTML = ''; return; }
  el.innerHTML = blocked.map(([key]) => {
    const [date, time] = key.split(':');
    return \`<div class="override-item">
      <span class="oi-key">\${date} at \${formatTimeLabel(time)}</span>
      <span class="oi-status">BLOCKED</span>
      <button class="unblock-btn" onclick="unblockSlot('\${date}','\${time}')">Unblock</button>
    </div>\`;
  }).join('');
}

async function blockSlot() {
  const date = document.getElementById('overrideDate').value;
  const time = document.getElementById('overrideTime').value;
  if (!date) { toast('Pick a date first'); return; }
  const times = time === 'ALL' ? ALL_TIMES : [time];
  for (const t of times) {
    await fetch('/api/schedule/slot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time: t, action: 'block' }),
    });
    currentOverrides[\`\${date}:\${t}\`] = 'blocked';
  }
  renderOverrides(currentOverrides);
  toast('Slot blocked!');
}

async function unblockSlot(date, time) {
  await fetch('/api/schedule/slot', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, time, action: 'unblock' }),
  });
  delete currentOverrides[\`\${date}:\${time}\`];
  renderOverrides(currentOverrides);
  toast('Slot unblocked!');
}

async function cancelBooking(date, time, name) {
  if (!confirm(\`Cancel booking for \${name} on \${date} at \${formatTimeLabel(time)}?\`)) return;
  await fetch('/api/schedule/slot', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, time, action: 'cancel' }),
  });
  toast('Booking cancelled — slot is open again.');
  load();
}

function formatTimeLabel(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m === 0 ? \`\${hour} \${ampm}\` : \`\${hour}:\${String(m).padStart(2,'0')} \${ampm}\`;
}

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

load();
</script>
</body>
</html>`;

// ============================================================
// SMS Dashboard HTML
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
  #app { display: flex; height: 100vh; flex-direction: column; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .topbar h1 { font-size: .95rem; font-weight: 700; }
  .topbar h1 span { color: var(--red); }
  .topbar nav { display: flex; gap: 4px; margin-left: auto; }
  .topbar nav a { padding: 5px 12px; border-radius: 7px; font-size: .8rem; font-weight: 600; color: var(--muted); text-decoration: none; }
  .topbar nav a:hover { background: var(--surface2); color: var(--text); }
  .topbar nav a.active { background: var(--red); color: #fff; }
  .inner { display: flex; flex: 1; min-height: 0; }

  #sidebar { width: 300px; min-width: 260px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--surface); }
  #main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  /* Sidebar header */
  .sidebar-head { padding: 16px; border-bottom: 1px solid var(--border); }
  .sidebar-head .subtitle { font-size: .75rem; color: var(--muted); margin-top: 2px; }

  /* New conversation */
  .new-convo { padding: 10px 16px; border-bottom: 1px solid var(--border); display: flex; gap: 8px; }
  .new-convo input { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); padding: 7px 10px; font-size: .85rem; }
  .new-convo input::placeholder { color: var(--muted); }
  .new-convo button { background: var(--red); border: none; border-radius: 8px; color: #fff; padding: 7px 12px; cursor: pointer; font-size: .85rem; font-weight: 600; white-space: nowrap; }

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

  #chat-header { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; background: var(--surface); }
  #chat-header-name { font-weight: 700; font-size: 1rem; }
  #chat-header-phone { font-size: .8rem; color: var(--muted); }
  #rename-btn { margin-left: auto; background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--muted); padding: 4px 10px; cursor: pointer; font-size: .78rem; }
  #rename-btn:hover { border-color: var(--red); color: var(--text); }

  #messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
  .msg-wrap { display: flex; }
  .msg-wrap.out { justify-content: flex-end; }
  .bubble { max-width: 65%; padding: 10px 14px; border-radius: 16px; font-size: .9rem; line-height: 1.45; word-break: break-word; white-space: pre-wrap; }
  .msg-wrap.in  .bubble { background: var(--surface2); border-bottom-left-radius: 4px; }
  .msg-wrap.out .bubble { background: var(--red); color: #fff; border-bottom-right-radius: 4px; }
  .msg-time { font-size: .68rem; color: var(--muted); margin-top: 3px; text-align: right; }
  .msg-wrap.in .msg-time { text-align: left; }
  .msg-col { display: flex; flex-direction: column; max-width: 65%; }

  #empty-state { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; color: var(--muted); }
  #empty-state .icon { font-size: 3rem; }

  #compose { padding: 14px 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; align-items: flex-end; background: var(--surface); }
  #compose textarea { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; color: var(--text); padding: 10px 14px; font-size: .9rem; font-family: inherit; resize: none; min-height: 44px; max-height: 120px; line-height: 1.4; }
  #compose textarea:focus { outline: none; border-color: var(--red); }
  #compose textarea::placeholder { color: var(--muted); }
  #send-btn { background: var(--red); border: none; border-radius: 10px; color: #fff; width: 44px; height: 44px; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .15s; }
  #send-btn:hover { background: var(--red2); }
  #send-btn:disabled { background: #444; cursor: default; }

  #toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 10px 20px; border-radius: 8px; font-size: .85rem; opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 99; }
  #toast.show { opacity: 1; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); display: inline-block; margin-left: 6px; }

  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

  @media (max-width: 640px) {
    #sidebar { width: 100%; position: absolute; z-index: 10; height: calc(100% - 48px); top: 48px; transform: translateX(0); transition: transform .2s; }
    #sidebar.hidden { transform: translateX(-100%); }
    #main { width: 100%; }
    #back-btn { display: flex !important; }
  }
  #back-btn { display: none; background: none; border: none; color: var(--text); cursor: pointer; font-size: 1.2rem; padding: 4px; }
</style>
</head>
<body>
<div id="app">
  <div class="topbar">
    <h1>🚗 <span>Mikey's</span> Detailing</h1>
    <div class="dot"></div>
    <nav>
      <a href="/" class="active">Messages</a>
      <a href="/schedule">Schedule</a>
    </nav>
  </div>
  <div class="inner">
    <!-- Sidebar -->
    <div id="sidebar">
      <div class="sidebar-head">
        <div class="subtitle">SMS Conversations</div>
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
</div>
<div id="toast"></div>

<script>
let activePhone = null;
let threads = [];
let msgPollTimer = null;

loadThreads();
setInterval(loadThreads, 8000);

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
    const initial  = (t.name || t.phone).slice(-2).toUpperCase();
    const active   = t.phone === activePhone ? 'active' : '';
    const badge    = t.unread > 0 ? \`<div class="unread-badge">\${t.unread}</div>\` : '';
    const time     = t.lastTime ? relTime(t.lastTime) : '';
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
  document.getElementById('sidebar').classList.add('hidden');
  document.getElementById('empty-state').style.display = 'none';
  const cv = document.getElementById('chat-view');
  cv.style.display = 'flex';
  document.getElementById('chat-header-name').textContent = t.name || formatPhone(phone);
  document.getElementById('chat-header-phone').textContent = t.name ? formatPhone(phone) : '';
  document.getElementById('msg-input').focus();
  renderThreadList();
  await loadMessages();
  clearInterval(msgPollTimer);
  msgPollTimer = setInterval(loadMessages, 5000);
}

async function loadMessages() {
  if (!activePhone) return;
  try {
    const res  = await fetch('/api/thread?phone=' + encodeURIComponent(activePhone));
    const msgs = await res.json();
    renderMessages(msgs);
    const t = threads.find(x => x.phone === activePhone);
    if (t) { t.unread = 0; renderThreadList(); }
  } catch(e) {}
}

function renderMessages(msgs) {
  const el = document.getElementById('messages');
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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
    method: 'POST', headers: { 'Content-Type': 'application/json' },
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
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return Math.floor(diff/60000)+'m';
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
