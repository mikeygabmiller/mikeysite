# Mikey's Detailing — Netlify SMS Dashboard Setup

This is the **GitHub-native** version of your SMS dashboard. Everything lives in
this repo — the dashboard screen (`dashboard/index.html`) and the engine
behind it (`netlify/functions/api.mjs`). You edit them right here in GitHub,
and Netlify automatically redeploys whenever you save/push. No command-line,
no Cloudflare.

> Your old Cloudflare worker in the `/worker` folder is **left untouched** and
> keeps running at your existing `workers.dev` URL, so your old conversations
> stay accessible there for reference.

---

## What it does (same as before)

- **Auto-texts clients** when they submit your quote form
- **Alerts you** with a full lead breakdown via text
- **Forwards inbound texts** to your cell in real time
- **Forwards calls** to your cell; voicemail link texted to you if missed
- **SMS Dashboard** — a web app to read and reply to every conversation

---

## One-time setup (~10 minutes)

### 1. Connect this repo to Netlify
- Go to [netlify.com](https://netlify.com) and sign in (free).
- **Add new site → Import an existing project → GitHub** → pick
  `mikeygabmiller/mikeysite`.
- Leave the build settings as-is and click **Deploy**.
- Netlify gives you a URL like `https://YOUR-SITE.netlify.app`.

### 2. Add your secrets (environment variables)
In Netlify: **Site configuration → Environment variables → Add a variable**.
Add these five (same values you used for Cloudflare):

| Key | Example value |
|---|---|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxx...` |
| `TWILIO_AUTH_TOKEN`  | `your auth token` |
| `TWILIO_FROM`        | `+12065551234` (your Twilio number) |
| `MIKEY_PHONE`        | `+14256007897` (your cell) |
| `DASHBOARD_PASSWORD` | pick any password for the dashboard |

After adding them, trigger a redeploy: **Deploys → Trigger deploy → Deploy site**.

### 3. Point Twilio at the new engine
In Twilio Console → **Phone Numbers → your number**:

**Messaging → "A message comes in":**
- Webhook → POST → `https://YOUR-SITE.netlify.app/sms`

**Voice → "A call comes in":**
- Webhook → POST → `https://YOUR-SITE.netlify.app/call`

### 4. Point your quote form at the new engine
In `index.html`, find this line (around line 2707):

```js
var WORKER_URL = 'https://mikeys-detailing-sms.mikeysdetailingsnohomish.workers.dev/submit';
```

Change it to your Netlify site:

```js
var WORKER_URL = 'https://YOUR-SITE.netlify.app/submit';
```

Save it. That's the switch — new quote leads now flow into the new dashboard.

### 5. Open your dashboard
Go to `https://YOUR-SITE.netlify.app/dashboard/` and sign in with the
`DASHBOARD_PASSWORD` you set. **Add it to your phone's home screen** for an
app-like icon.

---

## Editing it later (the whole point)

- Want to change the dashboard's look or wording? Edit
  `dashboard/index.html` right here in GitHub and commit. Netlify redeploys
  in ~30 seconds.
- Want to change a text message clients receive? Edit
  `netlify/functions/api.mjs` (look for `clientMsg` / `mikeyMsg`).

---

## Notes

- **Storage:** conversations are saved in **Netlify Blobs**, which is built in —
  nothing to set up. Old Cloudflare conversations don't carry over; they remain
  viewable at your old `workers.dev` URL.
- **Security:** the dashboard page is public, but it holds no secrets. Nothing
  loads until the correct `DASHBOARD_PASSWORD` is entered, and your Twilio keys
  live only in Netlify's environment variables (never in the public files).
- **Cost:** Netlify free tier easily covers your volume — $0/month. Twilio
  charges its usual per-text + number fees, same as before.

---

## Optional: put it on your own domain

If you later want the dashboard at `mikeysdetailing.com/dashboard/` instead of
the `netlify.app` URL, you'd point your domain's DNS at Netlify (Netlify walks
you through it under **Domain management**). Not required — the `netlify.app`
URL works fine on its own.
