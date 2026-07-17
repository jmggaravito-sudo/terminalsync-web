---
name: Slack Summarizer
logo: /skills/slack-summarizer.svg
category: productivity
vendors: ["claude", "codex"]
author: "TerminalSync"
status: soon
hidden: true
tagline: "Slack digests when connected"
description: "Summarizes Slack channels and threads into decisions, blockers, action items, and follow-ups, but only when the Slack connector or pasted messages provide access."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## When to use

- You need to catch up on Slack after PTO, meetings, focus time, incident response, or a busy day.
- You have the Slack connector installed with access to the relevant workspace, channels, and threads.
- You can provide pasted Slack messages or exports when the connector is not available.
- You want a digest that separates decisions, blockers, action items, open questions, and messages that deserve manual reading.

Do not use it to promise Slack access without the Slack connector, proper OAuth scopes, and channel permissions. If Slack is not connected and no messages are pasted, the skill must ask for the connector or source text instead of inventing a summary.

## What it does

Creates a Slack catch-up workflow:

- **Scope selection**: channels, users, timeframe, thread depth, and priority topics.
- **Message collection**: reads via the Slack connector or uses pasted/exported messages supplied by the user.
- **Signal extraction**: decisions, blockers, action items, owners, deadlines, questions, and unresolved threads.
- **Noise control**: compresses chatter, reactions, repeats, and low-value status pings.
- **Follow-up view**: highlights where the user is mentioned, expected to decide, or should read the original thread.
- **Limit notes**: states when private channels, deleted messages, missing thread replies, or connector scopes limit the summary.

It should preserve uncertainty and avoid attributing decisions or ownership unless the source messages support it.

## How to use

1. Confirm the Slack connector is installed and authorized for the workspace/channels, or paste/export the messages.
2. Specify channels, timeframe, and objective: *"Summarize #engineering and #product since 9am for decisions and blockers."*
3. Ask for the desired format: executive TL;DR, action list, incident digest, manager catch-up, or daily log.
4. Review linked/high-priority threads manually before acting on sensitive decisions.
5. If the connector is missing, install/connect Slack or provide the source messages.

## Best for

Managers, founders, PMs, engineers, support leads, and operators who need to catch up quickly without reading every message. Strongest with Slack connector access and thread permissions; limited when the assistant only sees partial pasted excerpts.
