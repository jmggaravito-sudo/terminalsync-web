---
name: Stripe CLI
binary: stripe
installCommand: brew install stripe/stripe-cli/stripe
authCommand: stripe login
vendor: Stripe
homepage: https://stripe.com/docs/stripe-cli
repo: https://github.com/stripe/stripe-cli
category: payments
tagline: Forward webhooks, trigger events, inspect logs — without touching the dashboard.
description: Stripe's official CLI. Forward webhooks to localhost while you build, trigger any event for testing, browse charges and customers from the shell, and tail real-time logs. TerminalSync syncs your Stripe auth between machines so you can pick up debugging on whichever laptop is in front of you.
status: available
---

## What it does

`stripe` is the official Stripe CLI. The killer feature is `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, which proxies live webhook events to your local server so you can test the full payment flow without ngrok. Beyond that: trigger events (`stripe trigger checkout.session.completed`), browse customers and charges, generate test cards, and tail logs in real-time.

## What TerminalSync adds

- **Auth Sync.** `~/.config/stripe/config.toml` (test + live mode) is encrypted and synced across machines. Stripe login on one Mac = logged in on every machine.
- **Webhook secret in env vault.** When `stripe listen` prints a `whsec_…`, TerminalSync prompts to store it encrypted in your folder's `.env` vault so it survives reboots without leaking.
- **MCP bridge.** Pair with the Stripe MCP connector and Claude can read customers, refund charges and query subscriptions through the same Stripe auth.

## Typical commands

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
stripe customers list --limit 5
stripe logs tail
stripe products list
```
