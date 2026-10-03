# The Clean Club call

How to use the call page (`mikeysdetailing.com/onbored`) on the phone. Not
served (`_config.yml` excludes `outreach/`). Same facts as `CLAUDE.md`; if a
price changes there, it changes here.

## The deal, so it's the same every time

- They see their **one-time price** first, the real one from the book.
- **Joining the Clean Club** makes their first visit a **Full Detail at $150
  off**, whatever they called about. A clean sedan is $219 instead of $369.
- Then **$125 a visit, every 4 or every 8 weeks**, any size. It stays $125
  while they're in.
- For the $150 off they **keep their next 2 club visits**. Cancel before those
  are done and it's **$75 for each one skipped** (never more than $150), on the
  card they save. Cancel before the first visit and they owe nothing. After
  the 2 visits, cancel anytime.
- Rain-Ready still applies: a Full Detail booked by Dec 31 gets polish, ceramic
  wax and RainX free, club or not.

## Before you call

Open their conversation in the dashboard, tap **Tools → Send the Clean Club
page**, check the text in the box and send it. The link has their first name,
car and town on it, so the page says "Hey Sarah" when they open it.

No conversation yet? Tell them to go to **mikeysdetailing.com/onboard**.
Either spelling works.

## The call

1. **Who you are, first.** "Hey, it's Mikey from Mikey's Mobile Detailing. You
   asked about getting your car detailed. Got two minutes? I just texted you a
   link, tap it and I'll walk you through it."
2. **Their car.** "Tap the size that fits. You can type the make and model if
   you want."
3. **What they want.** "Now tap what you were thinking: full, interior or
   exterior."
4. **The condition.** "How's it looking? No judgment, I've seen everything."
5. **The price.** Let them read it. **Say nothing for a couple of seconds.**
   It's a real price, so you don't need to defend it.
6. **The club.** "See the three buttons right above the price? Tap Every 4
   weeks." Then: "That's my Clean Club. Because you're joining, your first
   visit is my full detail, inside and out, $150 off. After that I come back
   every 4 weeks at $125, any size. Are you more of an every-4-weeks person or
   every 8?"
   - Called about an interior? The page already says it: the whole car on the
     club costs less than the interior alone. Point at the gold line.
7. **Say the catch out loud.** "The one thing: for the $150 off, you keep your
   next two visits. Cancel before that and it's $75 for each one you skip.
   After those two, cancel anytime." Saying it now is what keeps it from
   feeling like a trick later.
8. **Book it.** "Tap Join, pick a time, put in your address." Then: "Now read
   the deal with me. Number 4 is the cancelling one. Tick the box, type your
   name, and it'll take you to Stripe to save a card. It's not charged today."
9. **Close.** "You'll get my confirmation text in a second. See you [day]."

If they say no to the club: "No problem at all. Tap Just once and let's book
the [service]." Then the same page books the one-time job. Don't push twice.

## Two things never to say

- **Don't make the price look higher than it is.** The page shows the real
  book. The club only works because the one-time number is honest.
- **Don't say "most people around here get detailed twice a month"** or any
  number you can't back up. "Every 4 or every 8 weeks, which sounds more like
  you?" does the same job and it's true.

## What people ask

| They say | You say |
|---|---|
| "Why do you need my card?" | "Because the first one's $150 off. It's only ever charged if you cancel before your two visits, $75 each, and I'll text you before I charge anything. Stripe holds it, I never see the number." |
| "Is it $125 for my truck too?" | "Yep, any size." |
| "What if I need to move a visit?" | "Moving isn't cancelling. Just text me." |
| "What if you can't make it?" | "Then you don't owe anything for that visit." |
| "Can I just do the one?" | "Of course. Tap Just once." |
| "What's in a club visit?" | Tell them what you actually do on an upkeep visit. The page only says "an upkeep detail, inside and out". |

## After the call

- You get an email: **🔁 Clean Club sign-up**. When the card saves, a second
  one: **💳 Card saved**.
- In their conversation, **Tools → Clean Club** shows the card, the first
  visit, how many club visits they've had, and what they'd owe if they left
  today.
- The plan reminds you when each club visit is due, with the rebook text
  written. It never texts them by itself.
- No card yet (they backed out of Stripe, or Stripe isn't connected)? **Tools →
  Clean Club → Card link in the box**, then send it.

## If someone cancels early

1. **Tools → Clean Club → They cancelled.** It writes down what they owe and
   stops the plan. Nothing is charged or sent.
2. **Heads-up text in the box**, check it, send it. The terms promise a text
   first, so never skip this.
3. Charge it in Stripe: **Open in Stripe** on the same sheet, then on their
   customer page create a payment for the amount, on their saved card.
4. Back on the sheet, tap **I charged it**.

## Setting up Stripe (once)

Until this is done, sign-ups still book, but nobody saves a card. Your alert
will say so.

1. Make an account at **stripe.com** (Sign up). Business type: individual /
   sole proprietor. You'll need your SSN and the bank account for payouts. If
   you're under 18, Stripe needs a parent or guardian on the account.
2. In Stripe, open **Developers → API keys** and click **Create restricted
   key**. Name it `texting worker`. Set these four and leave everything else
   on None:
   - **Customers**: Write
   - **Checkout Sessions**: Write
   - **SetupIntents**: Read
   - **PaymentMethods**: Read
   Click **Create key**, copy it (it starts `rk_live_`), and keep it somewhere
   safe. Stripe only shows it once.
3. In Cloudflare: **Workers & Pages → texting → Settings → Variables and
   Secrets → Add**. Type **Secret**, name **`STRIPE_SECRET_KEY`**, paste the
   key, and save / deploy.
4. Test it once with yourself: open the call page, join, save a real card,
   then check Tools → Clean Club says the card is saved. Nothing is charged.

To try it without a real card first, make the key in Stripe's **test mode**
(it starts `rk_test_`) and use the card `4242 4242 4242 4242`, any future
date and any CVC. Swap in the live key when it works.

## Calling rules

Calling someone who asked about a detail is a reply, not a cold call. If you
ever call homes that didn't ask, Washington's rule (RCW 80.36.390) is: say
your name, your business and why you're calling in the first 30 seconds, only
call between 8 AM and 8 PM their time, and if they say don't call, end the
call within 10 seconds and don't call that number again for at least a year.
