---
name: Sales Meeting Follow-up Kit
logo: /logos/ts-kit.svg
category: sales
status: available
tagline: "Turn what actually happened on the call into the follow-up the prospect gets and the update your team sees."
description: "A coherent bundle for a sales rep or account executive who runs discovery, demo, or check-in calls over Zoom: pull the real meeting summary and action items instead of re-watching the recording, turn them into a client-ready follow-up, and keep your manager or teammates in the loop with a short internal update."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: zoom
    reason: "Pulls the AI-generated meeting summary, transcript, recording link, and action items straight from the call, so the follow-up starts from what was actually said instead of a rep's memory of it."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns the raw call summary and action items into a structured, client-ready follow-up document instead of a one-shot generic recap email."
  - kind: skill
    slug: internal-comms
    reason: "Turns the same call outcome into a short internal update for a sales manager or teammate, so deal risk or next steps don't stay buried in a recording nobody re-watches."
---
## Who it is for

A sales rep, account executive, or founder doing their own sales who runs discovery, demo, or check-in calls over Zoom and needs to act on what happened in the call, not re-watch the recording to remember it.

Use it when the recurring job is "what did we actually agree to on that call, what does the prospect need next, and does my manager know where this deal stands?" — a call-to-action loop, not a full CRM system of record.

## What it helps you do

This kit covers the meeting-to-action loop of a sales call:

- Pull the **meeting summary, transcript, and action items** Zoom already generated, instead of relistening to the recording to reconstruct what was said.
- Turn that summary into a **client-ready follow-up** — recap, open questions answered, and next steps — with Doc Co-authoring.
- Turn the same call outcome into a **short internal update** for a manager or teammate with Internal Comms, so deal risk or a stalled next step gets flagged instead of going quiet.

The expected outcome is a follow-up that reflects what was actually said on the call, sent faster than manual note-taking allows, plus an internal update so the deal's status isn't locked inside one rep's head.

## What's included

### Connectors

- **Zoom** — reads the meeting summary, transcript, recording, and chat/docs tied to a specific call, so "what did we agree to on Tuesday's demo?" has a real, sourced answer instead of a guess.

### Skills

- **Doc Co-authoring** — builds the client-facing follow-up (recap, next steps, and any proposal-style content) section by section from the call's real content, instead of a generic template.
- **Internal Comms** — turns the call outcome into a clear internal message: what was discussed, what's at risk, who owns the next step, so a manager isn't the last to know.

## How to use it

1. Install the kit and connect Zoom with your own account — the connector only sees what you can already see in Zoom.
2. After a call, ask *"pull the summary and action items from today's call with [prospect]."*
3. Give Doc Co-authoring that summary and ask for a first draft of the follow-up: *"turn this into a follow-up email with the recap and next steps."*
4. Review and send the follow-up yourself — the kit drafts, it doesn't send anything on your behalf.
5. If the deal needs internal visibility, ask Internal Comms for a short status update: *"draft a two-line update for my manager on where this deal stands after today's call."*

## Why these pieces belong together

The kit is coherent because it follows the actual loop a sales call creates, not a pile of unrelated meeting tools:

- Zoom holds **the real record of the call** — what was said, what was promised, what's still open.
- Doc Co-authoring turns that record into **what the prospect receives next**.
- Internal Comms turns that record into **what your own team needs to hear**.

Installed separately, a rep re-listens to the recording to remember what happened, writes the follow-up from memory, and tells their manager about a stalled deal only after it's already lost. Installed together, the kit gives one path: **pull what was actually said → draft the follow-up from it → flag internal risk before it's a surprise**.

It overlaps with the B2B Sales Pipeline Kit on Doc Co-authoring and Internal Comms, but the anchor and the job are different: that kit is grounded in HubSpot's CRM record across a multi-stage pipeline (which deals are stalled, what's the account history); this kit is grounded in a single Zoom call's actual content (what was said, what was promised) and is useful even for a solo rep or founder with no CRM at all.

## Limits

- It does not replace a CRM — it does not track deal stages, quotas, or a multi-account pipeline. For that, use the B2B Sales Pipeline Kit.
- It only covers meetings held in Zoom. Calls on Google Meet, Teams, or a phone line leave nothing for this kit to pull from.
- It does not send the follow-up or post the internal update on your behalf — it drafts, you review and send.
- Zoom's AI summary quality depends on the plan and whether AI Companion was enabled for that meeting; if a call has no summary or transcript, there is nothing to pull.
- Internal Comms is scoped to your own team's update, not the customer-facing message — that's Doc Co-authoring's job.
