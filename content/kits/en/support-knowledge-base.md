---
name: Support Knowledge Base Kit
logo: /logos/ts-kit.svg
category: support
status: available
tagline: "Mine the questions customers actually asked this week, write the help-center article that answers them, and brief the team when the question points at a process problem."
description: "A coherent support-workflow bundle for the person who owns customer questions at a small business running on Intercom: read the conversations that really came in, turn the recurring ones into help-center articles customers can find, and tell the team what needs to change so the question stops coming back."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: intercom
    reason: "Holds the ground truth of what customers actually ask — conversation, contact, company and article search over your real Intercom workspace — and is also where the output lands: the help-center articles customers read and the internal notes your teammates see. Without it the article backlog is guesswork from memory."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns a pile of real questions into one structured article — brief, outline, draft, review — so the answer is written once and properly instead of being retyped in chat every time the same question comes in."
  - kind: skill
    slug: internal-comms
    reason: "Handles the half of support that is not the customer: when the same question keeps coming back because of a policy or process, the team needs a clear update — what changed, who it affects, what to do now — not another unresolved ticket."
---
## Who it is for

The owner or support lead of a small business that runs customer conversations in Intercom — an agency, a studio, an online store with a real inbox, a service company with a support email that became a queue.

The recurring job this kit covers: *the same questions keep coming in, the help center doesn't answer them, and nobody has time to write the articles*. Today the answer lives in one agent's head and gets retyped per customer.

## What it helps you do

This kit covers the loop from real questions to published answers:

- **See what actually came in**: search and read the week's conversations, and spot the questions that repeat.
- **Write the answer once**: co-author a help-center article that answers the recurring question properly — the question as customers phrase it, the short answer, the steps, the edge cases.
- **Put it where customers look**: create or update the article in your Intercom help center. You review it before it goes live, because articles are customer-visible.
- **Fix the cause**: when the question points at a process or policy gap, leave an internal note on the conversation and send the team a clear update.

The expected outcome: the help center answers the questions customers really ask, and fewer conversations start from zero — the team gets briefed on what changed instead of absorbing the same ticket forever.

## What's included

### Connectors

- **Intercom** — the questions and the destination. Reads conversations, contacts, companies and existing help-center articles over your own Intercom login (OAuth in the browser; no token pasted), and writes the two things this workflow produces: help-center articles (`create_article`, `update_article`) and internal notes on conversations. It cannot reply to a customer — that stays with you, on purpose.

### Skills

- **Doc Co-Authoring** — the article. Guides the piece through brief → outline → draft → review so the answer is structured and consistent across revisions, instead of a paragraph someone typed into chat and lost.
- **Internal Comms** — the team half. Drafts the update that goes to your own people when a recurring question exposes a policy or process gap: what changed, who it affects, what to do now.

### CLI

No CLI tool is included. The target user is non-technical, and this workflow needs an inbox and a doc, not a terminal.

## How to use it

1. Install the kit and connect Intercom with your own account — the `mcp-remote` bridge opens Intercom's login in the browser and you approve access. No API key.
2. Start from the real inbox: *"Search last week's conversations and list the questions that came up more than once."*
3. Pick one and co-author the article with Doc Co-authoring: *"Draft a help-center article about our returns policy based on these conversations"* — question, answer, steps, exceptions.
4. Publish it where customers look: *"Create the article in our help center."* Review before it goes live — articles are visible to customers.
5. Close the loop with the team: if the question exposed a real gap, *"Add an internal note on the conversation saying we're updating the policy"*, and ask Internal Comms for the update your team should read.

## Why these pieces belong together

Support splits into three jobs that usually live in three different places: hearing what customers ask, writing the answer down, and telling the team what needs to change. This kit runs all three on the same workspace:

- Intercom holds **the questions** (conversation search over the real inbox) and is also **the destination** — the help-center articles customers read and the internal notes teammates see. The output doesn't leave the system where the work happens.
- Doc Co-authoring makes the article worth reading, so the answer is written once and reused.
- Internal Comms makes the recurring question stop recurring, by reaching the people who can change the policy or process behind it.

Remove any piece and the loop breaks: without Intercom the articles answer questions nobody asked and the "publish" step is manual copy-paste; without Doc Co-authoring the answer lives in chat scrollback and dies there; without Internal Comms the same ticket comes back forever because the cause was never fixed.

This kit writes **knowledge**, not replies. Intercom's connector has no tool to answer a customer, and none of the pieces here pretends otherwise — that is the negative fit: it is a knowledge-base and team-communication kit, not a reply-automation kit.

## Limits

- It does not answer customers directly. Intercom's connector has no tool to reply to a customer — drafting and sending replies stays with you in Intercom.
- The only write actions are `create_article`, `update_article`, and internal notes. Nothing else in the workspace is modified.
- Articles are customer-visible once published; review before publishing. Internal notes are visible only to your team and are attributed to the admin who authorized the connection.
- Requires an Intercom account and a browser OAuth login. Intercom documents the hosted MCP for **US- and EU-hosted workspaces** (EU uses a different address, `mcp.eu.intercom.com`, which this connector does not use); Australia-hosted workspaces are not supported.
- Intercom's page does not list plan or role requirements. If login or writes fail, check with your Intercom admin — a 401 on internal notes usually means the connection predates the write scope and must be reconnected.
- If your support runs on a different helpdesk, this kit is not it — the connector is Intercom-specific. There is no email, WhatsApp, or chat connector bundled here.
