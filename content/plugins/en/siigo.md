---
name: Siigo
logo: /plugins/siigo.svg
category: sales
status: available
tagline: "Quote with your real catalog prices, then turn what's accepted into a Siigo invoice."
description: "Bundles the Siigo connector (official Siigo MCP: your product catalog with real prices, your customers, and your sales invoices over OAuth) with Quotes & Estimates (turns a scope into a protected quote — line items, validity window, exclusions, payment terms), so the quote carries the prices you actually charge, and the accepted job becomes a registered sales invoice — only after your confirmation."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: siigo
skillSlugs: ["cotizaciones"]
---
## When to use

- Your business runs on Siigo (invoicing, customers, catalog) and you build quotes by typing prices from memory — or from a spreadsheet that has drifted from your real catalog.
- You send quotes or estimates to prospects and clients, and you want the protections built in by default: a validity window, what's explicitly excluded, payment terms.
- When a client accepts, you want the invoice registered in Siigo without retyping every line item by hand.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Siigo (the connector)** is the official hosted Siigo MCP: with your own Siigo login (no API key to paste), the agent reads your product catalog with code, stock, description and price, your customers with their commercial and contact info, and your issued sales invoices. It can also create sales invoices and create or update customers — and per Siigo's own rules, it asks for your explicit confirmation before registering anything, and never deletes: *"Borrar, nunca."*
- **Quotes & Estimates (the skill)** turns your scope into a clean, sendable quote: deliverables as line items, a validity window (e.g. "valid 15 days"), explicit exclusions, payment terms, and the short email/WhatsApp note that goes with it. It never invents a price you didn't give it — and here, the price you give it can come straight from your catalog.

**A real example:** a client asks for a quote on two executive chairs plus installation. You ask: *"What's the price of the executive chair in my Siigo catalog? Write me a quote for 2 chairs plus installation, valid 15 days, 50% deposit."* The agent reads the real price and stock from your catalog, the skill builds the protected quote, and when the client says yes: *"Create the invoice for Carlos Pérez: 2 executive chairs, cash payment"* — registered only after your confirmation.

## How to use

1. Install the Plugin and connect Siigo — no API key. Your company needs Siigo API integration credentials enabled (in Siigo: **Configuración → Credenciales de integración a plataformas digitales**); if they're missing, the assistant walks you through activating them.
2. Ask for a quote naming what's in scope — the agent pulls real prices and stock from your catalog instead of guessing.
3. Review the exclusions and payment terms, then send the quote yourself; the skill writes the note that accompanies it.
4. When the client accepts, ask the agent to create the sales invoice in Siigo with the quote's line items — review it and confirm. Nothing is registered without your green light.

## Why the bundle works

The skill alone protects your price, but it needs you to supply that price — from memory, or from a spreadsheet that no longer matches the catalog. The connector alone knows your real prices and stock, but doesn't build a protected document. Together: the quote carries your actual catalog prices (so it never undercharges you by accident), and the accepted quote flows into a registered invoice instead of a retyping session between two screens.

## Limits

- The connector does not register quotes or *cotizaciones* in Siigo — its documented surface is sales invoices, customers and the product catalog. The quote is a document you send; what lands in Siigo is the invoice you explicitly confirm.
- Creating an invoice or a customer always requires your explicit approval, per Siigo's own docs — and it never deletes information.
- This is a server hosted by Siigo (`mcp.siigo.com`), not something on your computer: what the agent can see and do is bounded by your Siigo user's permissions, and your company must have the API integration credentials enabled.
- The skill's 0–100 closing score reflects how well-protected the quote is (expiry, exclusions, payment terms present) — not a promise that the client accepts the price or pays on time.
- Prices and stock are only as current as your Siigo catalog; if the catalog is stale, the quote inherits it.
