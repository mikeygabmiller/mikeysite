# Mikey's Detailing — SMS Worker Setup

## What this does

Every time someone fills out the quote form on your site, this Cloudflare Worker:

1. **Texts the client** an instant confirmation with their quote total, vehicle, and services — from YOUR Twilio number.
2. **Texts you (Mikey)** a full lead alert with every detail the form captured.
3. **Relays inbound replies** — when the client texts back, you get a forwarded copy instantly.

---

## One-time setup (takes ~20 minutes)

### 1. Get your Twilio credentials
- Log in at twilio.com → Console Dashboard
- Copy **Account SID** and **Auth Token**
- Your Twilio phone number (the one you bought) — note it in E.164 format: `+12065551234`

### 2. Install Wrangler (Cloudflare's CLI)
```bash
npm install -g wrangler
wrangler login   # opens browser, sign in to Cloudflare
```

### 3. Deploy the Worker
```bash
cd worker
npm install
wrangler deploy
```
It will print a URL like:
`https://mikeys-detailing-sms.YOUR_ACCOUNT.workers.dev`

### 4. Set secrets (never hard-coded — stored encrypted in Cloudflare)
```bash
wrangler secret put TWILIO_ACCOUNT_SID
# paste your SID when prompted

wrangler secret put TWILIO_AUTH_TOKEN
# paste your Auth Token

wrangler secret put TWILIO_FROM
# paste your Twilio number: +12065551234

wrangler secret put MIKEY_PHONE
# paste YOUR personal cell: +13607975831
```

### 5. Update the Worker URL in index.html
Find this line in `index.html`:
```
var WORKER_URL = 'https://mikeys-detailing-sms.YOUR_SUBDOMAIN.workers.dev/submit';
```
Replace `YOUR_SUBDOMAIN` with the actual subdomain from Step 3.

### 6. Wire Twilio webhooks (both SMS and calls)
- In Twilio Console → Phone Numbers → your number

**Messaging section:**
- "A message comes in" → Webhook → `POST`
- URL: `https://mikeys-detailing-sms.YOUR_ACCOUNT.workers.dev/sms`

**Voice section:**
- "A call comes in" → Webhook → `POST`
- URL: `https://mikeys-detailing-sms.YOUR_ACCOUNT.workers.dev/call`

- Save.

### 7. Commit and push the updated index.html

---

## Full SMS communication system

This is your primary client communication channel now. Here's the full picture:

| Flow | How it works |
|------|-------------|
| Client submits form | Auto-text sent to client + alert to you instantly |
| Client replies to your Twilio number | Forwarded to your cell as a notification |
| You reply to a client | Text them directly FROM YOUR PERSONAL NUMBER or via the Twilio console/app |
| You want to text first | Use the Twilio mobile app (free) or text from your phone |

### Recommended: Twilio mobile app
Download the **Twilio app** (iOS/Android). It lets you send/receive from your Twilio number directly — keeps your personal number private and all client threads in one place.

### Message templates to have ready

**After getting the lead alert, reply with:**
```
Hey [Name]! It's Mikey — got your quote request. 
I'm free [day] at [time] — does that work for you?
```

**To confirm a booking:**
```
You're locked in! [Date] at [Time], [Address].
I'll send a reminder the morning of. See you then! 🚗
```

**Day-before reminder:**
```
Hey [Name], reminder — Mikey's Detail tomorrow at [Time]. 
Reply CONFIRM to lock it in or text me to reschedule. 👍
```

**After the job:**
```
Thanks [Name]! Hope you love the detail. 
If you have 2 min, a Google review means the world: [your review link]
```

---

## Costs
- Cloudflare Workers free tier: 100,000 requests/day — effectively free for your volume
- Twilio SMS: ~$0.0079/message (pennies per lead)
- Twilio number: ~$1.15/month
