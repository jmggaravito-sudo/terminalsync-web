---
name: Pipedrive
logo: /plugins/pipedrive.svg
category: sales
status: available
tagline: "See which deals went quiet — and send the follow-up, in one product."
description: "Bundles the official Pipedrive connector (your deals, contacts, activities and notes from your pipeline, over OAuth) with Internal Comms (drafts the follow-up with the right structure and tone), so 'which deals haven't moved in two weeks' turns into a ready-to-send message — with you approving before anything goes out."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: pipedrive
skillSlugs: ["internal-comms"]
---
## When to use

- You want to see **which deals are stuck without activity** — the ones your pipeline quietly loses — without opening Pipedrive and filtering by hand.
- You run the follow-ups yourself and want the repetitive drafting off your plate.
- The connector's own documentation uses this job as an example: *"Show me all open deals that haven't been updated in two weeks."* and *"Move the [company name] deal to the [stage name] stage and schedule a follow-up for [date]."*

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Pipedrive (the connector)** is the official hosted Pipedrive MCP: with your own account login (no API key to paste), the agent searches and updates your deals, contacts, organizations, leads, activities and notes — within the permissions your Pipedrive user already has, and every action is recorded in Pipedrive's change log.
- **Internal Comms (the skill)** drafts the follow-up with a process, not vibes: it maps the audience, structures the message (what changed, what you're asking, what happens next), calibrates the tone — a check-in, a nudge, an update — and runs a risk pass that flags vague promises or missing owners. It asks what's unclear instead of inventing approvals or commitments.

**A real example:** it's Monday and three deals haven't moved in two weeks. You say *"show me the open deals that haven't been updated in two weeks"*. Pipedrive hands you the list with the last activity on each. You say *"draft a follow-up for each"*. Internal Comms writes a distinct message per deal — referencing where it stalled and what the next step was — and shows them to you. You review, tweak, and send each one yourself; once sent, the agent can log the outreach as a note on the deal, with your OK.

## How to use

1. Install the Plugin and connect Pipedrive — the bridge opens Pipedrive's login in your browser; you sign in and click *"Allow and install"*.
2. Ask: *"which open deals haven't been updated in two weeks?"* or *"which deals are stuck in the Proposal stage?"*.
3. Ask: *"draft a follow-up for each"* — review the drafts, adjust, and send them from your own email; then have the agent log a note on each deal so the pipeline reflects reality.

## Why the bundle works

Pipedrive alone shows you the stale deals, but then you still have to write each follow-up by hand — the part that gets put off until the deal is dead. Internal Comms alone drafts well, but doesn't know which deal stalled or where. Together: the agent reads the real state of the pipeline, writes the message with the right tone for each deal, and leaves the CRM ready to log it — from "who went quiet" to "already followed up", with your OK in the middle.

## Limits

- **It never sends without your approval.** The Pipedrive MCP has no email tool: the drafted messages are the deliverable, and you send them from your own inbox. What the agent can do inside Pipedrive — a note, an activity, a stage change — happens after you approve.
- Internal Comms is a team-facing communications skill by design (authored by Anthropic): this pack applies its audience, structure and tone process to deal follow-ups, and it still flags sensitive topics — a lost client, a pricing dispute — for human review instead of automating them.
- Access is limited to what your own Pipedrive user can see and edit; the server is hosted by Pipedrive (`mcp.pipedrive.ai`), in beta, and usage is subject to token limits based on your plan.
- This pack drafts follow-ups and logs them. Other things the connector can write (converting leads, creating deals) are not part of this job.
