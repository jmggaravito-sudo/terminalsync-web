---
name: Facturapi
logo: /plugins/facturapi.svg
category: sales
status: available
tagline: "Quote with your terms and your prices, then register the CFDI when it's accepted."
description: "Bundles the Facturapi connector (your customers and CFDI 4.0 invoices over the Facturapi v2 API) with Quotes & Estimates (turns scope, price and terms into a protected quote — validity window, exclusions, payment terms — and never invents a price), so what the client accepts is what lands in your invoicing."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: facturapi
skillSlugs: ["cotizaciones"]
---
## When to use

- You quote jobs before you invoice them and the quote drifts from what finally lands in your invoicing: a different amount, a missing clause, no paper trail.
- You want every quote to carry the same protections — a validity window, what's excluded, payment terms — and then have the accepted one become a real CFDI without re-typing the data by hand.
- You invoice in Mexico through Facturapi and want the bill-to to come from the real customer record, not from a chat message.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Quotes & Estimates (the skill)** turns a scope, a price and terms into a clean, sendable quote: line items only from what you described, a validity window, explicit exclusions, payment terms from what you told it, the message to send it with, and a 0–100 verdict on how protected the document is. It never invents a price you didn't give it.
- **Facturapi (the connector)** is the bridge to your Facturapi account: it reads your customers and CFDI invoices, creates customers (Facturapi validates the RFC against the SAT), and creates draft or final CFDI 4.0 invoices when you confirm — with the accepted quote's line items, amounts and terms.

**A real example:** *"Quote 15 hours of consulting at $850 plus VAT, valid 15 days, 50% deposit."* The skill writes the protected quote and the message to send it with. The client accepts; you say *"register it in Facturapi for the customer I gave you"* — the agent creates the draft invoice from the accepted numbers and, with a live key, asks for the separate stamping confirmation.

## How to use

1. Install the Plugin and connect Facturapi with your Secret Key (dashboard → API Keys): `sk_test_...` to try things, `sk_live_...` for production.
2. Describe the job: scope, your price, how you get paid. The skill drafts the quote, flags what's missing and closes with its verdict.
3. Send the quote from your own email or WhatsApp — Facturapi doesn't issue quotes; the CFDI is the tax document that comes after acceptance.
4. When the client accepts, ask the agent to register the invoice with the customer you created, and give the stamping confirmation when it asks.

## Why the bundle works

The skill alone protects the document, but what the client accepts is a PDF on your side of the fence — the invoice data gets re-typed by hand, and that's where the drift happens. The connector alone can stamp an invoice, but it doesn't know your terms, your exclusions or your deposit — that's the skill's job. Together: the accepted quote's numbers become the invoice's line items, and the bill-to is the real customer record (RFC validated against the SAT), not a chat recollection.

## Limits

- The quote is a document you send; Facturapi doesn't issue quotes. What lands in Facturapi is the CFDI you confirm after acceptance.
- This connector's tools cover customers and invoices — it has no product or price catalog lookup, so prices come from you. That is the skill's own rule: it never invents a price you didn't give it.
- Stamping is irreversible: a stamped CFDI can only be corrected with a credit memo. Drafts need no confirmation; with a live key, stamping is a separate confirmation you give explicitly. With a test key, invoices never reach the SAT and don't consume folios.
- The verdict scores how well-protected the quote document is — not whether the client accepts the price or pays on time.
- This is a TerminalSync community MCP, not built or endorsed by Facturapi — the connector's own card says so, and Facturapi's dashboard remains the place for cancellations and payment complements, which this connector doesn't cover.
