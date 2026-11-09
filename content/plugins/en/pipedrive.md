---
name: Pipedrive
logo: /plugins/pipedrive.svg
category: sales
status: available
tagline: "See which deals went quiet — and get the follow-up written, in one product."
description: "Bundles the official Pipedrive connector (deals, contacts, activities and notes over OAuth) with Internal Comms (drafts the follow-up in the right tone), so 'which deals haven't been updated in two weeks' turns into a ready-to-send message and a logged follow-up — with you approving before anything goes out."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: pipedrive
skillSlugs: ["internal-comms"]
---
## When to use

- Your pipeline moves only while you're working it, and the deals that went quiet two weeks ago are exactly the ones you can't name from memory.
- You keep Pipedrive up to date yourself and the follow-up drafting — the part that gets put off — is what actually stalls the deal.
- You want the AI to propose the message and log the follow-up, but **you approve before it goes out**.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Pipedrive (the connector)** is the official hosted Pipedrive MCP server: with your own Pipedrive login ("Allow and install", no API key), the agent searches and updates deals, contacts, organizations, leads, activities and notes with the permissions of your own user. Its own setup guide uses this job as the example: *"Show me all open deals that haven't been updated in two weeks."*
- **Internal Comms (the skill)** drafts the follow-up with structure and tone — a check-in, a nudge, a status update — and flags what a real message needs: what's confirmed versus pending, the next step, and the sensitive topics that must go through human review instead of being automated.

**A real example:** Monday morning, you say *"which deals haven't moved in two weeks?"*. Pipedrive hands you the list with each deal's stage and last update. You say *"draft a follow-up for each — the warm ones a nudge, the ones about to close a status update."* Internal Comms writes a distinct message per deal referencing what's actually pending, you review and approve, and the agent logs the outreach as a note and a follow-up activity in Pipedrive so the next review starts from what was already done.

## How to use

1. Install the Plugin and connect Pipedrive — no API key; you sign in and click *"Allow and install"*.
2. Ask: *"which deals haven't been updated in two weeks?"* or *"which deals are stuck before the closing stage?"*.
3. Ask for the drafts — **you approve** — then send each one from your own email, and let the agent log the note and the follow-up activity in Pipedrive.

## Why the bundle works

Pipedrive alone tells you the deal went quiet — and then you still have to write each follow-up by hand, which is why the follow-ups don't happen. Internal Comms alone writes well but works blind: it doesn't know which deal is stuck in which stage or what the last contact said. Together: the state comes from the pipeline, the message comes from the skill, and the record comes back into Pipedrive — from "who went quiet" to "already followed up", with your OK in the middle.

## Limits

- **It never sends without your approval.** The connector drafts, logs and schedules; there is no email-sending step in this pack — you send the message from your own email, so the "send" decision stays yours.
- Every action the connector takes is recorded in Pipedrive's change log, and it can only see and modify what your Pipedrive user already has permission to view and edit.
- Sensitive situations — a lost deal, a pricing dispute, a client threatening to leave — get flagged for human review, not automated.
- The server is hosted by Pipedrive (`mcp.pipedrive.ai`), it's in beta, and usage is subject to token limits based on your plan.
