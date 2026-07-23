---
name: Cart Recovery
logo: /skills/cart-recovery.svg
category: marketing
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Turn abandoned carts into a recovery sequence"
description: "Reads abandoned checkouts, separates the recoverable from the noise, and drafts a short timed recovery sequence per cart type — with honest limits on what a message can fix."
license: "proprietary"
marketplaceSource: "terminalsync"
catalogReady: false
compatibleWith: ["claude", "codex"]
---
## When to use

- People add to cart and leave, and you want to recover a share of that without a paid app doing it as a black box.
- You want a **recovery sequence you can read and edit** — what to send, when, and to whom — matched to why the cart was likely abandoned.
- You want to know which carts are worth chasing (real intent, high value) versus the ones that will never convert.
- You want the reusable capability an abandoned-cart loop can call: it reads carts and drafts the sequence; sending runs through your connected store/email.

Works from Shopify abandoned-checkout data (connected or exported). If all you have is "some carts were abandoned" with no cart contents or timestamps, it will say it can't sequence and ask for the checkout export.

## What it does

- **Separates recoverable from noise**: high-value carts with contact info and recent timestamps are worth a sequence; anonymous, tiny, or very old carts are not — so you don't burn goodwill or budget chasing everyone.
- **Reads the likely reason**: shipping-cost shock at checkout, comparison shopping, distraction, payment friction — inferred from where and when they dropped — and matches the message to it instead of one generic "you left something."
- **Drafts a short timed sequence**: typically a helpful nudge within hours, a reminder with a reason to finish next day, and an optional final touch — with an incentive only where the margin allows and only when a plain reminder is unlikely to work.
- **Respects the customer**: caps the sequence length, honors opt-outs, and never fabricates false scarcity ("only 1 left" when it isn't) or fake countdowns.
- **The verdict (always close with this)**: a **0–100 score** for how strong this recovery opportunity is (value and recency of recoverable carts vs. contactability); a traffic light with a threshold (🟢 80+ real recoverable value, launch the sequence; 🟡 50–79 run it on high-value carts only; 🔴 <50 mostly anonymous/stale/tiny — fix checkout or capture email earlier instead); **the single fix or cart group with the highest payoff**; and the reminder that a message can't fix a broken checkout or a price problem — it only recovers hesitation.

It won't invent scarcity, won't promise a recovery rate, and will tell you when the real fix is the checkout, not the email.

## How to use

1. Connect Shopify or export abandoned checkouts with cart contents, value, timestamp, and contact (email/phone) where captured.
2. Ask it to separate recoverable carts from noise and infer the likely abandonment reason per group.
3. Ask for the sequence (message + timing) for the top group, with any offer limits you allow.
4. If it flags a structural cause (surprise shipping, payment errors), fix that first — the sequence won't save a broken checkout.
5. Send through your store/email (or hand it to a cart-recovery loop) and measure recovered revenue before adding incentives.

## Best for

Online stores with real cart-abandon volume and captured contact info, especially on Shopify. Best when checkout data includes contents, value, and timestamps; weaker for stores that don't capture contact before abandonment or have too few carts to sequence.
