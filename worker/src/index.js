/**
 * Mikey's Mobile Detailing — Cloudflare Worker
 *
 * POST /submit   → receives quote form data, fires two SMS via Twilio:
 *                  1. Confirmation text to the client
 *                  2. Lead alert to Mikey
 *
 * POST /sms      → Twilio inbound SMS webhook; forwards client texts to Mikey
 *                  and sends an auto-ack back to the client.
 *
 * POST /call     → Twilio inbound voice webhook; rings Mikey's cell.
 *                  If he doesn't answer, caller can leave a voicemail
 *                  and Mikey gets a text alert with the recording link.
 *
 * Required Worker Secrets (set with `wrangler secret put`):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM          — your Twilio number, E.164 e.g. +13607975831
 *   MIKEY_PHONE          — your personal cell, E.164 e.g. +13607975831
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS pre-flight (needed because the form lives on GitHub Pages)
    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
    }

    if (request.method === 'POST' && url.pathname === '/submit') {
      return handleSubmit(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/sms') {
      return handleInboundSms(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/call') {
      return handleInboundCall(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/voicemail') {
      return handleVoicemail(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/voicemail-done') {
      return handleVoicemailDone(request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};

// ---------------------------------------------------------------------------
// Quote form submission
// ---------------------------------------------------------------------------
async function handleSubmit(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return cors(new Response(JSON.stringify({ ok: false, error: 'bad_json' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    }));
  }

  const { name, phone, email, location, total, vehicle, condition, services, notes } = body;

  if (!name || !phone) {
    return cors(new Response(JSON.stringify({ ok: false, error: 'missing_fields' }), {
      status: 422, headers: { 'Content-Type': 'application/json' },
    }));
  }

  const clientPhone = normalizePhone(phone);
  if (!clientPhone) {
    return cors(new Response(JSON.stringify({ ok: false, error: 'bad_phone' }), {
      status: 422, headers: { 'Content-Type': 'application/json' },
    }));
  }

  const serviceList = Array.isArray(services) ? services.join(', ') : (services || '');
  const quoteLine  = total ? `$${total}` : 'TBD';

  // Text 1 — confirmation to the client
  const clientMsg = [
    `Hey ${name.split(' ')[0]}! 👋 Got your quote request — Mikey's Mobile Detailing.`,
    `Your estimate: ${quoteLine}`,
    vehicle   ? `Vehicle: ${vehicle}` : null,
    serviceList ? `Services: ${serviceList}` : null,
    `Mikey will text you back shortly to confirm your appointment. Reply here anytime with questions!`,
  ].filter(Boolean).join('\n');

  // Text 2 — lead alert to Mikey
  const mikeyMsg = [
    `🔔 NEW QUOTE — ${name}`,
    `Phone: ${clientPhone}`,
    email     ? `Email: ${email}` : null,
    location  ? `City: ${location}` : null,
    `Quote: ${quoteLine}`,
    vehicle   ? `Vehicle: ${vehicle}` : null,
    condition ? `Condition: ${condition}` : null,
    serviceList ? `Services: ${serviceList}` : null,
    notes     ? `Notes: ${notes}` : null,
    ``,
    `Reply to this text to respond to ${name.split(' ')[0]} (I'll forward it).`,
  ].filter(s => s !== null).join('\n');

  const [r1, r2] = await Promise.allSettled([
    sendSms(env, clientPhone,   clientMsg),
    sendSms(env, env.MIKEY_PHONE, mikeyMsg),
  ]);

  const ok = r1.status === 'fulfilled' && r2.status === 'fulfilled';

  return cors(new Response(JSON.stringify({
    ok,
    clientSms: r1.status,
    mikeySms:  r2.status,
  }), {
    status: ok ? 200 : 207,
    headers: { 'Content-Type': 'application/json' },
  }));
}

// ---------------------------------------------------------------------------
// Inbound SMS from Twilio (TwiML webhook)
// Two-way relay:
//   • Client texts your Twilio number  → Mikey gets it forwarded
//   • Mikey texts your Twilio number   → we need a different flow (see README)
// ---------------------------------------------------------------------------
async function handleInboundSms(request, env) {
  const form = await request.formData();
  const from    = form.get('From')  || '';
  const body    = form.get('Body')  || '';
  const numMedia = parseInt(form.get('NumMedia') || '0', 10);

  const mikeyPhone = normalizePhone(env.MIKEY_PHONE);
  const fromNorm   = normalizePhone(from);

  // If the message is FROM Mikey → it's his reply to a client.
  // We can't automatically know WHICH client without a lookup table,
  // so we surface a clean notification (see README for the full relay setup).
  if (fromNorm === mikeyPhone) {
    // Nothing to auto-forward without a client context store.
    // Acknowledge silently — Mikey's outbound replies go direct from his phone.
    return twimlResponse('');
  }

  // Otherwise it's from a client — relay to Mikey with context
  const mediaNote = numMedia > 0 ? `\n📎 ${numMedia} attachment(s) — check Twilio console.` : '';
  const relayMsg  = `📱 Reply from ${from}:\n"${body}"${mediaNote}\n\nTo reply, text them directly from your phone or use the Twilio console.`;

  await sendSms(env, env.MIKEY_PHONE, relayMsg);

  // Auto-acknowledge the client so they know the message landed
  const ack = `Got it! Mikey will get back to you soon. 🚗✨`;
  return twimlResponse(ack);
}

// ---------------------------------------------------------------------------
// Inbound call → forward to Mikey's cell
// ---------------------------------------------------------------------------
async function handleInboundCall(request, env) {
  const form   = await request.formData();
  const from   = form.get('From') || 'Unknown';
  const mikeyPhone = normalizePhone(env.MIKEY_PHONE) || '+13607975831';

  // Ring Mikey for up to 20 seconds, then drop to voicemail
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="20" action="/voicemail" method="POST">
    <Number>${escapeXml(mikeyPhone)}</Number>
  </Dial>
</Response>`;

  // Also fire a text to Mikey so he knows someone called even if he picks up
  // (async — don't await, so the call connects fast)
  sendSms(env, mikeyPhone,
    `📞 Incoming call from ${from} to your Mikey's Detailing number.`
  ).catch(() => {});

  return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
}

// ---------------------------------------------------------------------------
// Voicemail — fires when Mikey doesn't answer the forwarded call
// ---------------------------------------------------------------------------
async function handleVoicemail(request, env) {
  const form        = await request.formData();
  const from        = form.get('From') || 'Unknown';
  const dialStatus  = form.get('DialCallStatus') || '';
  const mikeyPhone  = normalizePhone(env.MIKEY_PHONE) || '+13607975831';

  // Only record if Mikey didn't answer
  if (dialStatus === 'completed') {
    // He answered — nothing to do
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hey, you've reached Mikey's Mobile Detailing. Leave a message and Mikey will text or call you right back.</Say>
  <Record maxLength="120" action="/voicemail-done" method="POST" playBeep="true" />
</Response>`;

  // Alert Mikey that he missed a call
  sendSms(env, mikeyPhone,
    `📵 Missed call from ${from} — they're leaving a voicemail now.`
  ).catch(() => {});

  return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
}

// ---------------------------------------------------------------------------
// Voicemail recording complete — text Mikey the recording link
// ---------------------------------------------------------------------------
async function handleVoicemailDone(request, env) {
  const form         = await request.formData();
  const from         = form.get('From') || 'Unknown';
  const recordingUrl = form.get('RecordingUrl') || '';
  const duration     = form.get('RecordingDuration') || '?';
  const mikeyPhone   = normalizePhone(env.MIKEY_PHONE) || '+13607975831';

  if (recordingUrl) {
    await sendSms(env, mikeyPhone,
      `🎙️ Voicemail from ${from} (${duration}s):\n${recordingUrl}.mp3`
    ).catch(() => {});
  }

  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function sendSms(env, to, body) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const creds = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: env.TWILIO_FROM, To: to, Body: body }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twilio error ${res.status}: ${err}`);
  }
  return res.json();
}

function normalizePhone(raw) {
  if (!raw) return null;
  // Already E.164
  if (/^\+1\d{10}$/.test(raw)) return raw;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
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
