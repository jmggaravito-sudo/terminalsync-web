---
name: Support Docs Kit
logo: /logos/ts-kit.svg
category: support
status: available
tagline: "Mine the questions customers actually ask, write the help-center articles that answer them, and keep the team in sync on what's still unresolved."
description: "A coherent support bundle for the owner or support lead of a small business that runs on Intercom: read real conversations to find the repeat questions, check what the help center already covers, write or refresh the missing article, and leave the internal notes that hand unresolved cases to the team with context."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: intercom
    reason: "Holds both ends of the job: the real customer conversations where repeat questions appear verbatim, the help-center articles already published (search and read), the write path that creates or updates an article, and the internal note that hands a conversation to the team — so the docs get written from what customers actually asked, not from memory."
  - kind: skill
    slug: doc-coauthoring
    reason: "Shapes each answer into a durable artifact — an article with a problem, steps, and limits that holds its structure through outline, draft, and revision — instead of a chat answer that evaporates and leaves the same question unanswered next week."
  - kind: skill
    slug: internal-comms
    reason: "Covers the team-facing half: the internal note that hands an unresolved conversation to a teammate with context, and the short brief that tells the team a new article is live and when to link it instead of re-answering by hand."
---
## Who it is for

The owner or support lead of a small business that runs customer support on Intercom and has a help center that keeps falling behind. The recurring job this kit covers is the repeat-question loop: the same handful of questions arrive in the inbox every week, the help center answers last year's version of them, and every teammate re-answers from scratch.

Use it when the honest answer to *"what are customers asking this month?"* is scrolling conversations, and *"where's the article for that?"* is either a stale page or nothing.

## What it helps you do

This kit covers the loop from observed questions to published answers to a team that knows what changed:

- **Find the repeat questions**: search real conversations and read the threads where a question keeps showing up — in the customer's words, not a paraphrase from memory.
- **Check what's already covered**: search and read the help-center articles you already have, and see whether the answer is stale, partial, or missing.
- **Write or fix the article**: draft the missing article (or update the outdated one) with structure — the problem, the steps, what it doesn't cover — and publish it to the help center.
- **Keep the team in sync**: leave an internal note on a conversation that still needs a human, and brief the team when a new article changes what they should link instead of re-answering.

The expected outcome: each repeat question gets answered once, in the help center, and the team links to it — the inbox stops re-answering the same five questions by hand.

## What's included

### Connectors

- **Intercom** — the evidence and the publish target in one place. Searches and reads your real conversations, contacts, and companies; searches, reads, creates, and updates help-center articles; and adds internal notes for teammates. It connects with your Intercom login in the browser (OAuth, no API key), and what the agent can see and do is bounded by the account you connect.

### Skills

- **Doc Co-Authoring** — the article artifact. Guides each piece through outline → draft → revision, keeping the problem, the steps, and the limits consistent across rounds, so you're refining one article per repeat question instead of regenerating an answer every time.
- **Internal Comms** — the team-facing half. Drafts the internal note that hands a conversation to a teammate with context, and the team brief for a new or updated article — what changed, when to link it, and what still needs a human answer.

## How to use it

1. Install the kit and connect Intercom with your own account — a browser login, no API key. What the agent sees is what your account can see.
2. Name this week's repeat question and go find it: *"Search conversations from the last 30 days where customers ask about refunds, and summarize the three most common versions."*
3. Check your coverage: *"Search our help articles for refund."* If the article exists but reads stale, pull it; if nothing covers it, start one.
4. Draft the article with Doc Co-Authoring — problem first, steps second, limits last — then publish it into the help center, and keep revising that same article as the question evolves.
5. Close the loop with the team: an internal note on the conversations that still need a human answer, and — once the article is live — a short brief on when to link it instead of re-typing the same paragraph.

## Why these pieces belong together

The kit follows the real loop of support documentation, not a pile of support tools:

- Intercom holds **both ends of the job** — the conversations where the question actually appears, and the help center where the answer has to live.
- Doc Co-Authoring turns a thread into **the artifact** — an article with structure that survives past the chat and gets revised instead of rewritten.
- Internal Comms closes the loop **inside the team** — a note that hands off context, and a brief that makes the article the team's default answer.

Installed separately, you get conversation summaries in a chat window and an article you never finish; the help center drifts and the inbox keeps re-answering. Installed together, one path covers the loop: **read the conversations → check the coverage → write the article → tell the team.**

It shares two skills with the Docs & Team Comms kit, but the ground is different: that kit's loop starts from internal docs and team announcements, with no customer evidence at the front. This kit starts from real customer conversations and ends in help-center content — the article is the deliverable, and the inbox is where the raw material comes from.

## Limits

- **It cannot reply to customers.** Intercom's documented MCP surface has no tool for sending replies to customers — replies stay where they are today: a human in Intercom, or Intercom's own automation. This kit documents and equips the team; it does not answer anyone.
- **Internal notes are team-only.** The note tool is for teammates, and Intercom attributes the note to the admin who authorized the connection — the customer never sees it.
- **It is not ticket management.** It doesn't assign, close, route, or prioritize conversations — the workflows that live in Intercom's inbox stay there.
- **It requires Intercom.** If your support doesn't run on Intercom, there is nothing to connect; this kit has no equivalent anchor for another helpdesk.
- **Access follows the connected account.** The agent can only read and write what your Intercom user can; Intercom's MCP documentation doesn't publish plan or role requirements, so confirm yours before promising article access to the whole team.
- **It documents what was asked; it doesn't decide strategy.** Which questions deserve an article, what tone your brand uses, and what you promise customers are still your calls — the kit works from observed conversations, not from a content plan.
