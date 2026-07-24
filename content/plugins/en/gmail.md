---
name: Gmail
logo: /connectors/gmail.svg
category: communication
status: available
tagline: "Your inbox, drafted and sent — the AI writes the message and Gmail sends it."
description: "Bundles the Gmail connector (read, search, and send mail) with Internal Comms (drafts the follow-up, reminder, or update in the right tone), so 'email this client' is a single action — with you approving before it goes out."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gmail
skillSlugs: ["internal-comms"]
---
## When to use

- You want your AI to draft and send emails — follow-ups, reminders, client updates — from your Gmail, without hopping between a draft and the app.
- You handle client email yourself and want the repetitive from-scratch writing off your plate.
- You want the AI to propose the message but **you approve before it sends**.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Gmail (the connector)** reads, searches, and sends mail in your account — so the AI can see the prior thread with a client before writing the reply.
- **Internal Comms (the skill)** drafts the message in the right tone — follow-up, reminder, update — and states its limits (sensitive topics like HR or legal go through human review, never automatic).

**A real example:** you sent a client a proposal a week ago and they didn't reply. You say *"write Acme a friendly follow-up on the proposal"*. Gmail finds the original thread, Internal Comms drafts a courteous reminder that references what you sent, and shows it to you. You read it, tweak a line if you want, approve, and it goes. What used to take ten minutes and a bit of awkwardness is now thirty seconds.

## How to use

1. Install the Plugin and connect your Gmail account.
2. Ask: *"draft a friendly follow-up for the client Acme about the proposal I sent last week"*.
3. Review the draft — **you approve** — and send it via Gmail.

## Why the bundle works

A drafting skill alone leaves you the text, but then you have to copy it, open Gmail, find the thread, and send. The connector alone gives you the tools, but doesn't know *how* to write a good follow-up. Together they close the loop: the AI reads your email context, drafts with judgment, and sends — all in one action, with your OK in the middle.

## Limits

- **It never sends without your approval** — it drafts and shows you; you decide what goes out.
- Sensitive topics (layoffs, legal, delicate complaints) get flagged for human review, not automated.
- Requires connecting your Gmail account; it only sees and acts on what that account allows.
