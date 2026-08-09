---
name: B2B Sales Pipeline Kit
logo: /logos/ts-kit.svg
category: sales
status: available
tagline: "Keep the CRM honest, write the proposal, and give the team a straight status update — the multi-stakeholder B2B deal cycle in one place."
description: "A coherent bundle for a B2B sales rep or small sales team running deals through a real CRM: surface stalled or at-risk deals in HubSpot, turn deal context into a structured proposal or RFP response, and keep sales leadership or CS informed with a clear internal update."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: hubspot
    reason: "Surfaces the pipeline itself: contacts, deal stages, notes, and follow-up tasks, so a stalled or at-risk deal is visible instead of buried in someone's inbox."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns deal context (offer, stakeholders, objections, timeline) into a structured proposal or RFP response instead of rewriting from a blank page for every prospect."
  - kind: skill
    slug: internal-comms
    reason: "Drafts the internal deal-status update or handoff note for sales leadership or Customer Success, so a stuck deal or a rep-to-CS handoff gets flagged instead of going quiet."
---
## Who it is for

A B2B sales rep, account executive, or small sales team running deals through a real CRM — multiple stakeholders per account, a multi-step pipeline, and internal people (a manager, a CS counterpart, a deal desk) who need visibility beyond the rep's own inbox.

Use it when the recurring job is "which deals need attention, what do I send this prospect, and who internally needs to know?" — not a one-person tracker, a CRM system of record.

## What it helps you do

This kit covers the CRM-to-communication loop of a B2B sales cycle:

- Find the deals that are stuck, aging, or missing next steps in HubSpot.
- Log calls, notes, and follow-up tasks so the CRM stays the real record of the account.
- Turn deal context into a structured **proposal or RFP response** with Doc Co-authoring.
- Draft the **internal deal-status update or handoff** with Internal Comms so a manager or CS teammate isn't the last to know.

The expected outcome is a pipeline that stays current, a proposal that reflects the actual deal instead of a generic template, and an internal team that hears about risk before the deal is lost, not after.

## What's included

### Connectors

- **HubSpot** — reads and updates contacts, deals, notes, and tasks, so "which deals haven't moved in two weeks?" has a real answer and the CRM doesn't go stale between calls.

### Skills

- **Doc Co-authoring** — builds the proposal or RFP response section by section from the deal's real context (offer, stakeholders, objections, timeline), instead of a one-shot generic draft.
- **Internal Comms** — turns a deal risk, a stage change, or an account handoff into a clear internal message for the people who need to act on it, not a raw CRM export.

## How to use it

1. Install the kit and connect HubSpot with a Private App access token, scoped read-only to start.
2. Ask *"which deals in Proposal or later haven't had activity in two weeks?"* and review what HubSpot returns.
3. Give Doc Co-authoring the deal's offer, stakeholders, objections, and timeline, and ask for a first proposal or RFP-response draft.
4. Log the resulting conversation back into HubSpot: *"add a note to this contact and create a follow-up task for Friday."*
5. When a deal needs internal attention, ask Internal Comms to draft a short status update or handoff note for your manager or CS counterpart.

## Why these pieces belong together

The kit is coherent because it follows the actual B2B deal loop, not a pile of unrelated sales tools:

- HubSpot holds **the real state of the account** — who's involved, what stage, what's been said.
- Doc Co-authoring turns that state into **what you send the prospect**.
- Internal Comms turns that state into **what your own team needs to hear**.

Installed separately, the rep keeps the CRM in one tab, drafts proposals from scratch in another, and forgets to loop in anyone internal until the deal is already at risk. Installed together, the kit gives one path: **see what's stalled → write the proposal from real context → tell your team before it's a surprise**.

It overlaps with the Business Owner Kit on Doc Co-authoring and Internal Comms, and with Docs & Team Comms on Internal Comms — but the purpose is different: the Business Owner Kit is a lightweight Airtable-based tracker for a solo owner doing a bit of everything, not a CRM system of record for a multi-stakeholder B2B pipeline.

## Limits

- It does not close deals, negotiate, or send anything on your behalf — it drafts and surfaces, you decide and send.
- HubSpot needs its own Private App access token, and the kit only sees the scopes that token grants — start read-only and widen deliberately.
- Batch create/update actions in HubSpot mutate real CRM records and are gated behind a confirmation step; a human still approves the change.
- It is not a forecasting or reporting tool — for pipeline dashboards and quota tracking, use HubSpot's own reporting or a BI tool.
- Internal Comms is scoped to messages for your own team (status updates, handoffs); for the external, customer-facing message, that's Doc Co-authoring's job.
