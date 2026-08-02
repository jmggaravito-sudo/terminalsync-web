---
name: HubSpot
logo: /connectors/hubspot.svg
category: sales
status: available
tagline: "See who hasn't bought lately — and send the follow-up, in one product."
description: "Bundles the HubSpot connector (contacts, deals, notes, and tasks from your CRM) with Internal Comms (drafts the client follow-up in the right tone), so 'which clients have gone quiet' turns into a ready-to-send message — with you approving before it sends."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: hubspot
skillSlugs: ["internal-comms"]
---
## When to use

- You want to see **which clients haven't bought in a while** or which deals are stuck, without opening HubSpot and filtering by hand.
- You run sales follow-ups for a small team yourself and want the repetitive drafting off your plate.
- You want the AI to propose the message but **you approve before it sends**.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **HubSpot (the connector)** reads and updates your CRM — contacts, deals stuck without activity, notes, and follow-up tasks — the real state of every relationship.
- **Internal Comms (the skill)** drafts the follow-up in the right tone — a check-in, a nudge, an update — and states its limits (sensitive topics go through human review, never automatic).

**A real example:** it's the start of the month and you want to reconnect with clients who've gone quiet. You say *"which clients haven't bought in 60 days?"*. HubSpot searches your contacts and hands you the list with their last activity. You say *"draft a friendly check-in for each"*. Internal Comms writes a distinct message per client, referencing their history, and shows them to you. You review, tweak, approve, and HubSpot logs the outreach as a note once you send it.

## How to use

1. Install the Plugin and connect HubSpot with a Private App access token.
2. Ask: *"which clients haven't bought in 60 days?"* or *"which deals are stuck in 'Proposal'?"*.
3. Ask: *"draft a follow-up for each"* — **you approve** — then send and log the note.

## Why the bundle works

HubSpot alone shows you the CRM data, but then you still have to write each follow-up by hand — the part that gets put off. Internal Comms alone drafts, but doesn't know who's gone quiet or what deal stage they're stuck in. Together: the AI reads the real state of the relationship, writes the message with judgment, and leaves the CRM ready to log it — from "who's gone quiet" to "already followed up", with your OK in the middle.

## Limits

- **It never sends without your approval** — it drafts and shows you; you decide what goes out and through which channel.
- Sensitive topics (a lost client, a pricing dispute) get flagged for human review, not automated.
- It reads and writes only what your Private App token's scopes allow — start read-only, widen later.
- Requires connecting your HubSpot account with a Private App access token.
