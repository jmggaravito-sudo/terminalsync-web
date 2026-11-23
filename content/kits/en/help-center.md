---
name: Help Center Kit
logo: /logos/ts-kit.svg
category: support
status: available
tagline: "See which questions keep coming back with no article behind them, write the missing help center entries properly, publish them, and leave the team a note so they know where to point customers."
description: "A coherent support bundle for the owner or support lead who runs customer service on Intercom: compare what customers actually ask against what the help center actually answers, draft the missing articles through a structured co-authoring pass, publish them where customers read them, and mark the conversations they close."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: intercom
    reason: "Holds both halves of the gap this kit exists to close — the conversations customers actually send (search conversations, read one in full) and the articles the help center actually has (list, search, read) — plus the publish actions themselves (create and update articles) and the team-facing note (internal note), so the articles get written from real tickets instead of guessed FAQs."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns a pile of raw tickets into an article worth publishing — brief, outline, draft, revision — keeping structure, terminology, and open questions consistent across passes, instead of a one-shot answer that reads like a chat reply pasted into the help center."
---
## Who it is for

An owner or support lead of a small business that runs customer service on Intercom — where the same ten questions arrive every week, some of them answered nowhere, and the help center is a handful of articles that stopped matching the product months ago.

The recurring job this kit covers is keeping the help center in sync with what customers actually ask: find the questions with no article behind them, write those articles properly, publish them, and let the team know they exist. It is not a kit for answering the inbox itself — see Limits.

## What it helps you do

This kit covers the loop of help-center maintenance, from the real tickets to the published article to the conversation it closes:

- **See the gap**: pull the questions that repeat across recent conversations, and check which ones your help center doesn't answer — the difference is the backlog, ranked by how often customers actually hit it.
- **Write the article**: draft each missing article through a structured pass — what question it answers, what sections it needs, what terminology the product actually uses — grounded in how the real conversations phrased it.
- **Publish it**: create the article in your help center, or update the one that's wrong or incomplete — remembering that customers see it the moment it's saved.
- **Close the loop**: leave an internal note on the conversations the new article answers, so teammates link it instead of retyping the same answer next week.

The expected outcome: the help center stops being a stale page and starts deflecting the tickets it should — fewer repeated questions, and the ones that do arrive get a link instead of a re-written answer.

## What's included

### Connectors

- **Intercom** — the two halves of the gap and the way to close it. Reads your conversations (search them, read one in full, see the customer and company behind it) and your help center (list, search, and read articles); writes the three things it can — create an article, update one, and leave an internal note your teammates see. It connects with your Intercom login in the browser; no token to paste. It cannot reply to a customer — that part stays with you, and this kit never claims it.

### Skills

- **Doc Co-Authoring** — the writing process. Guides each article from brief to outline to draft to revision, keeping the structure and terminology consistent from one article to the next, so the help center reads like one team wrote it instead of twelve improvised answers.

## How to use it

1. Install the kit and connect Intercom with your own account — a browser login, no token.
2. Find the backlog: *"Which questions came up most in conversations this month, and which ones don't have a help article?"*
3. Pick the one that repeats most and draft it with Doc Co-Authoring: give it the conversation threads as source material and the answer your team actually gives, and let the brief → outline → draft → revision pass shape it into an article.
4. Review it like a customer would read it, then publish: *"Create this as a help article titled …"*. Customers see it the moment it's saved — that's the point, and the reason to review first.
5. Close the loop on the tickets that prompted it: *"Leave an internal note on these conversations pointing to the new article."* Next week, teammates link instead of retype.

## Why these pieces belong together

The kit follows the real loop of help-center maintenance, not a pile of support tools:

- Intercom holds **the evidence and the destination** — the conversations that prove which questions repeat, the article list that shows what's missing, and the actions that publish the fix and mark the tickets done.
- Doc Co-Authoring turns that evidence into **an article worth publishing** — the difference between a help center entry and a chat answer pasted into one is structure, and structure is what this skill does.

Installed separately, you get a summary of your inbox in a chat window that closes and vanishes, and articles written from memory that drift from what customers actually ask. Installed together, one path covers the loop: **read the tickets → write the missing article → publish it → note the conversations it closes.**

This is the half of the support role that a kit can honestly cover today. The other half — drafting the replies customers receive — has no piece in the catalog that serves it, so this kit doesn't pretend to: no item here touches a customer-facing reply.

## Limits

- **It requires Intercom.** The connector targets Intercom's US-hosted MCP endpoint; EU-hosted workspaces use a different address this connector does not use, and Australia-hosted workspaces aren't supported. Intercom's page doesn't list plan or role requirements — if the login fails, check with your Intercom admin.
- **It does not reply to customers.** The connector has no tool that sends a message to a customer; replies stay with you in Intercom. Internal notes are team-only, and they're attributed to the admin who authorized the connection — a 401 on a note usually means the connection predates the write scope and must be reconnected.
- **Publishing is customer-visible.** Articles can be seen by your customers the moment they're saved; reviewing before publishing is part of the workflow, not an optional step.
- **It doesn't do everything a support team needs.** It won't migrate or import a help center from another platform, design your help-center structure from scratch, or measure how many tickets an article actually deflected — those need work outside this kit.
- **It reports what the inbox gives it.** Gap-finding is as good as the conversations you point it at; a help center for a product with little ticket history has nothing to mine yet, and the articles should come from your own product knowledge instead.
