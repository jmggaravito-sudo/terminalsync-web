---
name: Help Center Kit
logo: /logos/ts-kit.svg
category: support
status: available
tagline: "Turn the questions customers keep asking into help-center articles they can find and use on their own."
description: "A coherent support bundle for the owner or the person who handles support in a business that runs its customer conversations on Intercom: find which questions repeat in the real inbox, read how the answer was actually resolved, co-author a clear article, publish it to the help center, and point open tickets at it."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: intercom
    reason: "Holds both ends of the loop: the raw evidence (real conversations, contacts, companies) and the shelf where the answer lands (help-center articles it can create and update). It is also the kit's honest boundary — it cannot reply to a customer, which is exactly why the answer has to become an article instead of another one-off reply."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns a messy support thread into a structured article — brief, outline, section drafts, revision passes — keeping audience, tone, and what was actually decided consistent across rounds, instead of a one-shot draft that invents your refund policy or hides an open question."
---
## Who it is for

The owner, or the person who handles support, in a small business that runs its customer conversations on Intercom. The recurring job this kit covers is the one behind every repetitive inbox week: the same questions arrive again and again — refunds, shipping times, how to reset something, what a plan includes — and the answers live in old tickets, not anywhere a customer can find them.

Use it when the honest pattern is *"we already answered this three times this month"* and the help center is empty, thin, or stale.

## What it helps you do

This kit covers the loop from a repeated question to a published answer:

- **Find what repeats**: search the real conversations for a topic and see how many customers asked it, in which words, and what got promised back.
- **Get the true answer**: read the thread where the team actually worked the case out, so the article reflects what the business really does — not a plausible guess.
- **Write it properly**: co-author the article with structure — audience, outline, section drafts, review passes — instead of one thin paragraph.
- **Put it where customers look**: create or update the help-center article so the next person self-serves, and drop an internal note on the tickets already open pointing your teammate at it.

The expected outcome: every question that arrives twice becomes an article, so the third time it never needs a person. The inbox shrinks by the questions you stop having to answer, not by ignoring anyone.

## What's included

### Connectors

- **Intercom** — the inbox and the help center in one connection. Reads conversations, contacts, companies, and existing help-center articles; writes help-center articles and team-only internal notes. It connects with your own Intercom login in the browser — no token to paste. It deliberately cannot send replies to customers, and this kit never claims it can.

### Skills

- **Doc Co-Authoring** — the writing process for the article. Guides it through brief → outline → section drafts → revision → final, preserving the audience, the tone, the decisions, and the open questions across rounds, so the article says what the business actually does and flags what still needs confirming instead of inventing it.

## How to use it

1. Install the kit and connect Intercom with your own account — a browser login, no API key. Your Intercom permissions travel with the connection.
2. Name the topic that keeps coming back: *"Search our conversations from the last 30 days about refunds and summarize what customers actually ask and what we answered."*
3. Open the best thread: *"Read this conversation and list what we promised, what we charged, and what we told the customer to do."*
4. Co-author it: ask Doc Co-Authoring for the outline first — question, short answer, steps, edge cases — then draft it section by section. Anything not confirmed in a thread goes in as an open question, not as policy.
5. Publish it: *"Create a help-center article titled 'How refunds work' with this content."* Review the title and body before it goes — articles are customer-visible the moment they exist.
6. For the tickets already open on that topic: *"Add an internal note to this conversation pointing at the new article"* — and send the reply yourself in Intercom.

## Why these pieces belong together

The kit follows the real loop of self-serve support, not a pile of support tools:

- Intercom holds **the evidence and the destination** — the conversations where the question actually got answered, and the help center where the answer needs to live. Without it there is nothing to write from and nowhere to publish.
- Doc Co-Authoring makes **the middle beat good** — a structured, reviewed article instead of a paraphrased ticket, which is the difference between an article that deflects the question and one that generates a follow-up.

Installed separately, you get accurate answers in a chat window that close and vanish, and a help center that stays empty because writing it is nobody's job. Installed together, one path covers the loop: **find the repeat → read the real answer → write it with structure → put it in the help center → point open tickets at it.**

It shares Doc Co-Authoring with the finance and sales kits, but the artifact and the audience are different: those write owner-facing memos and proposals; this one writes the public page a customer reads, sourced from real tickets instead of memory. And it is deliberately **not** a customer-service-replies kit — the Intercom connector has no reply tool, so this kit's promise is exactly what the pieces can do: turn tickets into self-serve articles.

## Limits

- **It requires Intercom.** If your customer conversations run on another inbox or helpdesk, there is nothing to connect; this kit has no equivalent anchor for another support platform.
- **It cannot answer a customer.** The connector has no reply tool, and this kit does not claim live triage, chat coverage, or automatic responses. Replies stay with you in Intercom — the kit's job is to make fewer replies necessary.
- **Articles are customer-visible the moment they are created or updated.** Review before publishing. Internal notes are the only write that stays inside the team.
- **The connection targets US-hosted workspaces.** Intercom hosts EU workspaces at a different MCP address this connector does not use, and Australia-hosted workspaces are not supported by Intercom's MCP.
- **Writes are attributed to whoever authorized the connection** (the admin who logged in), and if internal notes fail with a permission error, reconnect so the connection picks up the write scope.
- **Intercom's page does not document plan or role requirements** — if the login fails, check with your Intercom admin.
- **The article is only as true as the thread it came from.** The skill labels assumptions instead of inventing facts, but it does not know your policy: confirm anything involving money, refunds, or commitments before it goes public.
