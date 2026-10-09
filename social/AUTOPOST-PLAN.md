# Automated posting: the game plan

Written 2026-10-09 at Mikey's request: posts on Google Business Profile,
Instagram, Facebook, Nextdoor and maybe YouTube, made by Claude, posted on
their own, as cheap as possible, with Mikey's only regular job being photos.

This file is the plan. Nothing in it is built yet. `PLAYBOOK.md` is still the
source for what a post says; this file is only about how posts get made and
published without anyone opening the apps.

---

## The short version

| Platform | Can it post by itself? | How | Cost |
|---|---|---|---|
| **Instagram** | Yes | Make.com (already on your account) | $0 |
| **Facebook** | Yes | Make.com | $0 |
| **Google Business Profile** | Yes | Make.com. Your GBP connection is already in Make | $0 |
| **YouTube Shorts** | Yes, but only once there are videos | Make.com | $0 |
| **Nextdoor** | **No.** There is no way in for a small business | A text with the post ready to paste, 2 a month | $0 |

**Total: $0 a month.** The only thing that costs anything is Claude's time,
which is your existing Claude plan.

What you do, ongoing:

1. **Photos into the Drive folder after each job** (about 60 seconds, the
   routine in `PLAYBOOK.md` section 6). This is the one job nobody else can do.
2. **First month only:** a Sunday check-in from Claude shows you next week's
   posts. Reply "yes" or "swap that one". After the first month, only posts
   that promise something (an offer, a price, a gift card) wait for your yes.
3. **Nextdoor, twice a month:** you get a text with the post. Open Nextdoor,
   paste, attach the photo. About 2 minutes.
4. **Reply to comments and messages.** That can't be automated well, and it's
   where bookings come from.

---

## What I'm pushing back on (read this part)

- **Posting is the easy 10%.** The hard part is having something worth posting.
  The finished bank has 41 posts. At 3 a week that runs out around the second
  week of January. After that, every post comes from your photos and your
  story answers. No photos means the automation posts nothing, or posts
  filler, and filler is worse than nothing for a page whose job is proof.
- **Facebook and Instagram don't exist yet** (`outreach/DIRECTORIES.md`, checked
  2026-10-05: no Facebook page found). You can't automate an account that
  isn't there. Making them is step 0 and it has to be you, on your phone (see
  "Who does what").
- **Nextdoor cannot be automated legitimately.** Its publishing API only takes
  approved partners (government agencies and the tools that serve them). There
  are unofficial bots for it (Apify "Nextdoor Poster"), and I'm recommending
  against them: they break Nextdoor's rules, and Nextdoor is where neighbors
  recommend you. Losing that page to save 2 minutes a month is a bad trade.
- **YouTube is pointless without video.** Shorts are vertical clips. Until you
  film a few 10 second clips a week (extractor pulling dirty water, a
  before/after cut, `PLAYBOOK.md` section 7), there's nothing to put there. I
  could turn photos into slideshow videos, but those do noticeably worse than
  real footage. Phase 3, not now.
- **Paid schedulers aren't worth it here.** Buffer, Publer and Metricool all
  handle Instagram, Facebook, Google and YouTube, but none do Nextdoor, and
  their free plans are too small for 4 channels (Buffer: 3 channels, 10 queued
  posts each; Metricool free: about 20 posts a month). Paid is roughly $20 to
  $24 a month. They also want you to build posts in their editor, and ours are
  already built by `tools/posts.cjs`. Make does the same job for $0.

---

## How it works

```
 you                     Claude (weekly)                Make.com (daily)        the platforms
 ───                     ───────────────                ────────────────        ─────────────
 photos into Drive  ──▶  picks next week's posts   ──▶  6:30 PM: reads the  ──▶ Instagram
 story answers           writes captions               queue, posts today's    Facebook
                         renders images                 entries, marks them     Google Business
                         runs the fact checks           done                    YouTube (later)
                         adds them to queue.json
                         Sunday check-in to you    ──▶  Nextdoor: texts you the post to paste
```

### 1. The queue (`social/queue.json`, in this repo)

One file lists every post with its date and its version for each platform.
`tools/posts.cjs` already holds the images, captions and alt text; a new
`npm run queue` writes them into the queue with dates, so the queue never
drifts from the posts. Images are fetched from GitHub
(`raw.githubusercontent.com/mikeygabmiller/mikeysite/main/social/posts/...`,
checked 2026-10-09: serves `image/jpeg`, which Instagram requires). The repo
is already public and already holds every post, so this exposes nothing new.

Each entry looks like:

```json
{
  "id": "P07",
  "date": "2026-10-20",
  "approved": true,
  "instagram": { "images": ["P07-1.jpg", "P07-2.jpg"], "caption": "..." },
  "facebook":  { "images": ["P07-1.jpg", "P07-2.jpg"], "caption": "..." },
  "gbp":       null,
  "nextdoor":  null,
  "youtube":   null
}
```

`approved: false` means it waits. Offers, prices and gift cards are always
`false` until you say yes.

### 2. The publisher (one Make.com scenario)

Your Make account (free plan) already has a Google Business Profile connection
and two scenarios that are switched off (`Mikey QQC Auto-Text` and
`Photo Engine → Google Business Profile`, neither has ever run). One new
scenario does everything:

1. Runs every day at 6:30 PM Pacific (evenings are when people scroll).
2. Reads `queue.json`, keeps entries dated today that are approved and not
   already posted.
3. Posts each one: Instagram (photo, carousel or reel), Facebook (photo,
   multi-photo or reel), Google Business Profile (post with a Book button),
   YouTube (Short, later).
4. Writes the id into a Make data store so nothing ever posts twice.
5. If anything fails, emails `mikeysdetailing4u@gmail.com` with which post and
   why, and the next Claude check-in fixes it.

**Why Make and not a scheduler or our own code:** Make has official modules for
all four platforms, and its Google and YouTube apps are already approved by
Google. Doing it ourselves would mean applying for Google Business Profile API
access (a form, then a wait for approval) and passing a YouTube audit, or every
upload gets stuck as private. Make skips both.

**Fits the free plan:** Make Free is 1,000 credits a month and 2 active
scenarios. A daily run that finds nothing costs about 3 credits (about 90 a
month); each post costs a few more. Three posts a week to Instagram and
Facebook plus one Google post a week comes to roughly 200 of the 1,000. If it
ever outgrows that, Make Core is $12 a month for 10,000. Files passing through
Make are capped at 5 MB on the free plan, which only matters for YouTube
uploads; Claude shrinks each clip under that before it goes in the queue.
Instagram and Facebook fetch videos from their link, so the cap doesn't touch
them.

**Fallback if Make ever changes its free plan:** the dashboard Worker
(`twillowdashbored`) already runs a cron every minute. It can post to
Instagram and Facebook directly through Meta's API for free; Google and
YouTube would then need the approvals above. Not worth building unless Make
stops working for us.

### 3. The weekly Claude check-in (Sundays)

A scheduled Claude routine runs every Sunday afternoon:

1. Looks in the **Mikey Social Photos** Drive folder for new job folders.
2. Builds next week's posts from those photos, your story answers and the
   bank, following `PLAYBOOK.md` (give, give, give, then ask; at most one ask
   in four; never two asks in a row).
3. Blurs plates and house numbers (`tools/prep-photos.cjs`), renders, and
   **looks at every image**.
4. Runs the same checks as everything else: facts table in `CLAUDE.md`, no em
   dashes, only the twelve towns, nothing about licensing or insurance,
   no days or hours.
5. Adds them to `queue.json` and merges.
6. Sends you the week's posts in the Claude app. First month: nothing posts
   until you reply yes. After that: it tells you what's going out and only
   waits on offers.
7. Writes the Nextdoor post and the Google post when they're due.
8. Checks the last week's Make runs for errors.

---

## Each platform, what's true and what it means

### Instagram

- Posting by API needs a **professional (business) account linked to a
  Facebook Page**. That's the setup in `PLAYBOOK.md` section 2.
- Limits: 100 posts a day (we'll use 3 a week), JPEG only, carousels up to 10
  images, reels supported. Images must be at a public link; ours are.
- What the API can't do: music from Instagram's library on a reel, filters,
  shopping tags, and Stories through Make. Reels go up with whatever sound is
  in the clip. Stories stay a phone thing, straight from the driveway, as the
  playbook already says.
- Alt text: the Make module doesn't take it. Small loss; I'll check whether it
  can go in through a raw API call when building.

### Facebook

- Same posts, Facebook caption (real link, no hashtags). Make posts photos,
  multi-photo posts and reels to the Page.
- Some Pages get asked for "Page Publishing Authorization" (an ID check)
  before anything can post. If yours does, it's a one-time thing in the
  Facebook app.

### Google Business Profile

- **The 8 posts already scheduled natively (Oct 12 to Nov 30) stay as they
  are.** Make takes over from the next batch, Monday **December 7**, as
  `outreach/GBP-POSTS.md` already planned.
- GBP posts go out the moment Make sends them (the API has no "schedule"
  switch), so the date in the queue is the posting day.
- Rules that don't change: wide photos from `social/photos/`, never the
  square graphics; no phone number in the text; Book button to
  `https://mikeysdetailing.com/#booking`; nothing mentioning Rain-Ready after
  December 31, 2026. A scheduled post is one more copy of the facts table.
- Google wants a profile verified for 60+ days for its own API. Yours is, but
  through Make we don't need to apply at all.

### Nextdoor

- **Policy change on August 19, 2026:** anything that promotes a business has
  to come from a free **Business Page**, including replies when someone asks
  "anyone know a detailer?". Answering from your personal account now gets the
  post flagged and shown to fewer people. `PLAYBOOK.md` section 9 is updated
  to match.
- Your page exists but is **unclaimed**, with the name "Mikey's Mobile
  Detailing- Snohomish" and your Gmail on it (`outreach/DIRECTORIES.md`
  row 4). Claiming it comes first.
- Business posts are free. Nextdoor's own FAQ says up to 2 a month into the
  neighborhood feed (an older announcement said unlimited; we'll go with 2).
  They reach neighbors within about 2 miles and anyone who has "Faved" you.
- The plan: twice a month Claude writes a Nextdoor version (more local, less
  polished, like you'd talk to a neighbor) and the dashboard texts it to you
  with the photo. You paste it. The bigger win on Nextdoor is Faves and
  recommendations from customers, so the post-job text could ask for one; that
  changes what customers get texted, so it's your call.

### YouTube Shorts (phase 3)

- Make uploads Shorts with title, description and a scheduled publish time.
  Make's YouTube app is Google-approved, so uploads go public (a
  home-made app would be stuck on private until Google audits it).
- One clip, three places: the same vertical clip goes up as an Instagram reel,
  a Facebook reel and a YouTube Short.
- Needs a YouTube channel under the business name. Do it when you've filmed
  your first 5 clips, not before; an empty channel does nothing.

---

## Who does what

The click-by-click steps for the accounts are in `ACCOUNT-SETUP.md`.

### Only you (it's your identity or your password)

| Task | Time | Notes |
|---|---|---|
| Make the Facebook Page and the Instagram business account, and link them | 20 min, on your phone | Exactly as `PLAYBOOK.md` section 2. Meta locks brand-new accounts that get logged into from strange computers, so this one should be you, in the apps, not a browser agent |
| Sign in when Make asks to connect Facebook/Instagram (and later YouTube) | 5 min | It's a "Continue as Mikey" screen. Make gets permission to post, never your password |
| Claim the Nextdoor page (verification) | 5 min | Nextdoor says verifying takes about a minute |
| Photos into Drive after each job | 60 sec a job | The whole system runs on this |

### Worth handing to Muse (tedious clicking, you just sign in)

| Task | Why Muse |
|---|---|
| Fill in the Nextdoor page after you claim it: fix the name (drop "- Snohomish"), `book@` email, description, the twelve towns, photos | Lots of fields; the copy is ready in `outreach/DIRECTORIES.md` |
| Fill in the Facebook Page after you make it: About, service area (12 towns, no address), cover and profile photo, website with the link tail | Same: long forms, copy already written |
| Later: set up the YouTube channel (name, banner, About, links) | Same |

Same rules Muse already follows: you type your own passwords, nothing saved
in a bot, no cloud browser logging into your Google account.

### Claude, with no time from you

1. `npm run queue` in `social/tools` and the first `queue.json` (weeks 1 to 8
   of the playbook, plus GBP from Dec 7).
2. The Make scenario, built through the Make connector, then one test post to
   Facebook that gets deleted straight after.
3. Failure emails, the data store, the 6:30 PM schedule in Pacific time.
4. The Sunday routine.
5. The Nextdoor text through the dashboard (a dashboard change, so it follows
   that repo's rules: tests, build bump, the live branch).
6. Updating `PLAYBOOK.md` so "Scheduling tool" says the posting is automatic.

---

## Order of operations

| When | What | Who |
|---|---|---|
| Now | This plan, your yes | you |
| This week | Facebook Page + Instagram, linked | you (20 min) |
| This week | Claim Nextdoor; Muse fills in Nextdoor and Facebook details | you (5 min) + Muse |
| Right after | Connect Facebook/Instagram in Make (one sign-in) | you (5 min) |
| Same day | Queue, scenario, test post | Claude |
| Launch day | P01, P02, P03 go up together, then pin them (pinning is 3 taps in the app; the API can't pin) | Make, then you |
| Weekly from then | Sunday check-in, 3 posts a week | Claude, Make |
| Dec 7 | GBP moves from native scheduling to Make | Claude |
| When you have 5 clips | YouTube channel, reels and Shorts | you + Muse + Claude |

---

## Sources (checked 2026-10-09)

- Meta, Instagram content publishing: https://developers.facebook.com/documentation/instagram-platform/content-publishing
- Google, Business Profile API prerequisites: https://developers.google.com/my-business/content/prereqs
- Make pricing (free plan limits): https://www.make.com/en/pricing
- Make modules, listed from your account through the Make connector: Instagram
  for Business (photo, carousel, reel), Facebook Pages (photo, multi-photo,
  reel), Google Business Profile (create a post), YouTube (upload a video)
- Nextdoor developer site: https://developer.nextdoor.com/
- Nextdoor's partner list for publishing: https://help.nextdoor.com/s/article/How-to-share-content-to-Nextdoor-as-an-Agency-Partner?language=en_US
- Nextdoor self-promotion policy, Aug 19, 2026: https://blog.nextdoor.com/self-promotion-update
- Nextdoor business FAQ (2 posts a month): https://business.nextdoor.com/en-au/local-businesses-faq
- YouTube uploads from unaudited apps are private: https://www.ayrshare.com/solutions/google-api-error-403-unverified-app-how-to-fix-the-audit-pipeline/
- Scheduler free plans: https://thestacc.com/best/free-social-media-scheduling-tools/
