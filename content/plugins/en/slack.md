---
name: Slack
logo: /connectors/slack.svg
category: communication
status: available
tagline: "Your Slack messages, drafted and posted — you approve before sending."
description: "Bundles the Slack connector (read and post to your channels) with Internal Comms (drafts the update, announcement, or reminder in the right tone), to keep your team in the loop without writing every message by hand."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: slack
skillSlugs: ["internal-comms"]
---
## When to use

- You want your AI to draft and post updates, announcements, or reminders to your Slack channels.
- You run comms for a small team and want the repetitive writing off your plate.
- You want the AI to propose the message but **you approve before it posts**.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Slack (the connector)** reads and posts to your channels — so the AI can see the channel's recent context before writing.
- **Internal Comms (the skill)** drafts the message in the right tone — update, announcement, reminder — and states its limits (sensitive topics like HR or legal go through human review).

**A real example:** a delivery date slipped and you need to tell the team without sounding alarmist. You say *"tell #general the delivery moved to Friday, calm tone, make clear nothing else changes"*. Internal Comms drafts a clear, level message, and Slack has it ready to post to the channel. You read it, approve, and it goes — without reading like a fire drill.

## How to use

1. Install the Plugin and connect your Slack workspace.
2. Ask: *"draft a reminder for #sales about tomorrow's meeting"*.
3. Review the message — **you approve** — and it posts to the channel.

## Why the bundle works

The comms skill alone leaves you the text, but then you have to copy it and post to the right channel. The connector alone posts, but doesn't know how to draft in the right tone. Together: the AI reads the channel, writes with judgment, and posts — with your OK before the team sees it.

## Limits

- **It never posts without your approval** — it drafts and shows you; you decide what's sent.
- Delicate topics (conflicts, HR, sensitive announcements) get flagged for human review.
- Requires connecting your Slack workspace; it only sees and posts to the channels that access allows.
