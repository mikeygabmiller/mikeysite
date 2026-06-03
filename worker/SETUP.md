# Mikey's Detailing — SMS Worker + Dashboard Setup

## What this does

- **Auto-texts clients** the moment they submit your quote form
- **Alerts you** with a full lead breakdown via text
- **Forwards inbound texts** to your cell in real time
- **Forwards calls** to your cell; voicemail recording link texted to you if missed
- **SMS Dashboard** — web app at your Worker URL to read and reply to every conversation

---

## One-time setup (~30 minutes)

### 1. Get your Twilio credentials
- Log in at twilio.com → Console Dashboard
- Copy **Account SID** and **Auth Token**
- Note your Twilio phone number in E.164 format: `+12065551234`

### 2. Install Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 3. Create the KV namespace (message storage)
```bash
wrangler kv:namespace create MESSAGES
```
It prints something like:
```
id = "abc123def456..."
```
Paste that `id` into `wrangler.toml` under `[[kv_namespaces]]`.

### 4. Deploy
```bash
npm install
wrangler deploy
```
You'll get a URL like `https://mikeys-detailing-sms.YOUR_ACCOUNT.workers.dev`

### 5. Set secrets
```bash
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_FROM          # e.g. +12065551234
wrangler secret put MIKEY_PHONE          # e.g. +13607975831
wrangler secret put DASHBOARD_PASSWORD   # pick any password you want
```

### 6. Update the Worker URL in index.html
Find this line in the main site's `index.html`:
```js
var WORKER_URL = 'https://mikeys-detailing-sms.YOUR_SUBDOMAIN.workers.dev/submit';
```
Replace `YOUR_SUBDOMAIN` with your actual workers.dev subdomain.

### 7. Wire Twilio webhooks
In Twilio Console → Phone Numbers → your number:

**Messaging:**
- "A message comes in" → Webhook → POST
- `https://mikeys-detailing-sms.YOUR_ACCOUNT.workers.dev/sms`

**Voice:**
- "A call comes in" → Webhook → POST
- `https://mikeys-detailing-sms.YOUR_ACCOUNT.workers.dev/call`

---

## Using the dashboard

Open `https://mikeys-detailing-sms.YOUR_ACCOUNT.workers.dev` in your browser.

Sign in with the `DASHBOARD_PASSWORD` you set. It stays logged in for 30 days.

**Features:**
- See all conversations in the left panel, sorted by most recent
- Red badge = unread messages
- Click a thread to read the full history
- Type and hit Enter (or tap ➤) to send a reply
- Tap "Rename" on any contact to save their name
- "+ New" button to start a fresh conversation with any number
- Auto-refreshes every 5 seconds — no need to reload

**Bookmark it on your phone** — add to home screen from Safari/Chrome for an app-like experience.

---

## Notifications you get at (360) 797-5831

| Event | Text you get |
|---|---|
| Quote form submitted | 🔔 Full lead alert |
| Client texts your Twilio number | 📱 Forwarded instantly |
| Someone calls | 📞 Alert + your cell rings |
| Missed call | 📵 Alert while they record |
| Voicemail left | 🎙️ Direct MP3 link |

---

## Costs
- Cloudflare Workers free tier: 100k requests/day — free for your volume
- Cloudflare KV free tier: 100k reads/day, 1k writes/day — free for your volume
- Twilio SMS: ~$0.0079/message
- Twilio number: ~$1.15/month
