# Mikey's New Tab (Chrome extension)

A new tab page built for the business, not for an office. Every new tab shows:

- **Snohomish weather**: chance of rain by the hour (next 13 hours, or tomorrow
  7 AM to 7 PM after 5 PM), the temperature (32° and below in blue), and the
  next four days. Hours after dark are faded. From the National Weather Service
  (public, free, no account).
- **Sunset, dark and light left today**, plus tomorrow's sunset, and a warning
  the week before the clocks change. Worked out on the computer, no network.
  Checked against sunrise-sunset.org on 2026-10-29: within a minute.
- **Open times customers see**: the next four openings for Exterior, Interior
  and Full Detail (SUV size), from the dashboard's public `/api/next-openings`,
  the same answer the website's calculator gives.
- **Follow-ups**: what the dashboard says is due (reply owed, quote
  follow-ups, review asks), plus your own "remind me" dates, due ones first
  and the rest of this week under them. Tap one to open that chat in the
  dashboard. Refreshes every 2 minutes. Read only: nothing is sent from here.
- **Go to**: one-tap links (dashboard, Google Business, Ads, Search Console,
  Analytics, Stripe, Gmail, Calendar, Photos, Make, the site, GitHub, Claude).
  Edit them in Settings.
- **Copy to text a customer**: the quote calculator, the call page and the
  Google review link, one tap each.
- **Notes**: saves as you type.

## What it can see

One permission: your dashboard's address
(`texting.mikeysdetailingsnohomish.workers.dev`), so Chrome sends your
dashboard sign-in along when it asks for the follow-up list. Chrome shows it
as "Read and change your data on texting.mikeysdetailingsnohomish.workers.dev".
It only ever reads the list. It can't read other tabs, your Gmail or anything
you browse. The follow-up list isn't saved anywhere; notes and settings stay
in this browser on this computer (they don't sync to your phone).

## Install (one time, about 2 minutes)

1. Download the `newtab-extension` folder (or the zip, then unzip it). Put it
   somewhere you won't delete it, like Documents. Chrome runs it from that
   folder.
2. In Chrome's address bar type `chrome://extensions` and press Enter.
3. Turn on **Developer mode** (switch, top right).
4. Click **Load unpacked** and pick the `newtab-extension` folder (the one with
   `manifest.json` in it).
5. Open a new tab. If Chrome asks "Change back to Google?", click **Keep it**.
6. If the Follow-ups card says to sign in, click **Sign in to the dashboard**
   and sign in once. The sign-in lasts 90 days; after that it asks again.

## Updating it

Replace the files in the folder with the new ones, then on
`chrome://extensions` click the circular arrow on "Mikey's New Tab". Notes and
settings are kept.

## Checked

On 2026-10-29 in a test Chrome: the dashboard sign-in cookie is sent with the
follow-up request, the signed-out message shows without it, and sample
follow-ups draw and link to `?c=<phone>`, which opens that chat. Not yet
seen against the live list with a real sign-in; if the card looks wrong once
you're signed in, say so.
