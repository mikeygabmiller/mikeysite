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
- **Calendar**: your Google Calendar's agenda, once you add its ID in Settings.
- **Go to**: one-tap links (dashboard, Google Business, Ads, Search Console,
  Analytics, Stripe, Gmail, Calendar, Photos, Make, the site, GitHub, Claude).
  Edit them in Settings.
- **Copy to text a customer**: the quote calculator, the call page and the
  Google review link, one tap each.
- **Notes**: saves as you type.

## What it can see

No permissions. It can't read other tabs, your Gmail or anything you browse.
Notes and settings stay in this browser on this computer (they don't sync to
your phone or another computer). The calendar ID is typed in Settings, never
stored in this repo, which is public.

## Install (one time, about 2 minutes)

1. Download the `newtab-extension` folder (or the zip, then unzip it). Put it
   somewhere you won't delete it, like Documents. Chrome runs it from that
   folder.
2. In Chrome's address bar type `chrome://extensions` and press Enter.
3. Turn on **Developer mode** (switch, top right).
4. Click **Load unpacked** and pick the `newtab-extension` folder (the one with
   `manifest.json` in it).
5. Open a new tab. If Chrome asks "Change back to Google?", click **Keep it**.
6. Click **Settings** (top right of the page), paste your calendar ID, Save.

Your main Google Calendar's ID is your Gmail address. Another calendar's ID is
in Google Calendar: Settings, click the calendar on the left, "Integrate
calendar", Calendar ID. Put more than one with commas between.

## Updating it

Replace the files in the folder with the new ones, then on
`chrome://extensions` click the circular arrow on "Mikey's New Tab". Notes and
settings are kept.

## Not checked yet

- **A private calendar in the embed.** Tested with a public calendar
  (2026-10-29), which works. Your own calendar should show as long as you're
  signed in to Google in that Chrome; if it says you don't have permission,
  use the Open link on the card instead.
