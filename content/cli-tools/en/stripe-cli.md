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
description: Stripe's official CLI. Forward webhooks to localhost while you build, trigger any event for testing, browse charges and customers from the shell, and tail real-time logs. TerminalSync keeps the Stripe workflow close to the project terminal and protects `.env` secrets through the encrypted vault.
status: available
---

## What it does

`stripe` is the official Stripe CLI. The killer feature is `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, which proxies live webhook events to your local server so you can test the full payment flow without ngrok. Beyond that: trigger events (`stripe trigger checkout.session.completed`), browse customers and charges, generate test cards, and tail logs in real-time.

## What TerminalSync adds

- **CLI Auth Sync.** If Stripe stores `~/.config/stripe/config.toml` on your Mac, TerminalSync can encrypt and copy that auth/config file to your other machines.
- **Webhook secret in env vault.** Put the `whsec_…` value from `stripe listen` in a project `.env` file and TerminalSync can keep that file encrypted in the folder vault.
- **MCP bridge.** Pair with the Stripe MCP connector and Claude can read customers, refund charges and query subscriptions through the connector's own Stripe auth.

## Typical commands

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
stripe customers list --limit 5
stripe logs tail
stripe products list
```
