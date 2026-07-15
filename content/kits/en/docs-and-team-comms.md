---
name: Docs & Team Comms Kit
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Draft docs grounded in your team's Notion, then turn them into clear internal announcements."
description: "A coherent operations bundle for knowledge and ops teams who write documentation and internal updates, keeping drafts grounded in the team's existing Notion and Slack context instead of starting from a blank page."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: doc-coauthoring
    reason: "Co-writes and restructures documentation with the user, producing clear, well-organized docs instead of a wall of text."
  - kind: skill
    slug: internal-comms
    reason: "Turns a decision or doc into a clear internal announcement with the right framing for the team, not a raw paste."
  - kind: connector
    slug: notion
    reason: "Reads and writes the team's existing docs and wiki so drafts are grounded in current context and land back where the team already looks."
  - kind: connector
    slug: slack
    reason: "Pulls thread context for what's being announced and is where the resulting internal comms are shared."
---
## Who it is for

Operations, knowledge, and program teams who spend real time writing documentation and internal announcements, and who already keep their source of truth in Notion and their conversations in Slack.

Use it when the recurring job is "write this up clearly, grounded in what we already have, then tell the team."

## What it helps you do

This kit connects drafting to distribution:

- Read the team's existing Notion docs and wiki so a draft starts from real context, not a blank page.
- Co-write and restructure a document with Doc Co-authoring into something clear and organized.
- Pull the relevant Slack thread context for what needs to be announced.
- Turn the doc or decision into a clear internal announcement with Internal Comms.

The expected outcome is a documented decision that is grounded in the team's own material and a matching announcement ready to share — without rewriting everything from scratch.

## What's included

### Skills

- **Doc Co-authoring** — co-writes and restructures docs with the user. It is the drafting engine of the kit.
- **Internal Comms** — turns a doc or decision into a clear internal announcement with the right framing. It closes the loop from "documented" to "communicated".

### Connectors

- **Notion** — reads and writes the team's docs and wiki, so drafts are grounded in current context and saved where the team already looks.
- **Slack** — pulls the thread context behind an announcement and is the surface where the internal comms are shared.

### CLI

No CLI tool is included. The target user is often non-technical, and the workflow — read context, draft, announce — does not require terminal execution.

## How to use it

1. Install the kit and connect Notion and Slack.
2. Ask the assistant to read the relevant Notion page(s) and summarize the current state.
3. Use Doc Co-authoring to draft or restructure the doc, and save it back to Notion.
4. Pull the Slack thread context for the decision being communicated.
5. Use Internal Comms to turn the doc into a short, clear announcement, and share it in the right Slack channel.

## Why these pieces belong together

The kit is useful because writing and telling the team are one workflow:

- Notion grounds the draft in what the team already knows.
- Doc Co-authoring makes the draft actually clear and structured.
- Internal Comms reframes it for an audience instead of pasting a raw doc.
- Slack is where that audience actually is.

Installed separately, the user copies context between tools by hand and rewrites the same content for the doc and the announcement. Installed together, the kit gives a coherent path: **ground in Notion → draft the doc → reframe as comms → share in Slack**.

## Limits

- It does not make the decision or own the message; a human approves what gets published and announced.
- It works with the Notion and Slack content it has access to; private spaces and channels it isn't connected to are out of scope.
- Notion and Slack require their own connections and are subject to those accounts' permissions.
- It is not a full internal-communications platform (no scheduling, approvals, or analytics) — it drafts and helps you share, nothing more.
- For external or customer-facing communication, use a different workflow — this kit is scoped to internal docs and comms.
