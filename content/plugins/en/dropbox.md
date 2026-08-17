---
name: Dropbox
logo: /connectors/dropbox.svg
category: productivity
status: available
tagline: "Write the document and save it to your Dropbox — in one action."
description: "Bundles the Dropbox connector (find files by plain-language search and create shareable links) with Doc Co-Authoring (writes proposals, reports, and send-ready documents), so 'draft this and put it where my other client files live' is a single flow."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: dropbox
skillSlugs: ["doc-coauthoring"]
---
## When to use

- You want your AI to write a document — proposal, report, summary — using a prior file **already in your Dropbox** as the format or context, without downloading it by hand first.
- You keep client contracts, invoices, and proposals in Dropbox and want the initial drafting of each new one off your plate.
- You want a shareable link to the finished draft ready to send, instead of digging through folders for it afterward.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Dropbox (the connector)** finds files by plain-language search and hands back a temporary download link or a gated public share link — so the AI can pull a prior document as reference and hand back a link to the new one.
- **Doc Co-Authoring (the skill)** writes proposals, reports, and send-ready documents, with coherence, evidence, and tone passes, and its limits (it doesn't replace a lawyer on legally binding contracts).

**A real example:** you just finished a client call and have loose notes. You say *"find the proposal template I used for the García project, and draft a new one for Acme in the same format from these notes."* Dropbox searches and finds the prior proposal, Doc Co-Authoring writes the new one matching that structure, and you ask for a share link to send it — Dropbox generates one only after you confirm, since a public link is visible to anyone who has it.

## How to use

1. Install the Plugin and connect your Dropbox account (an access token from the Dropbox developer console; a one-click "Connect with Dropbox" flow is on the way).
2. Ask: *"find [prior document] in my Dropbox and use it as the format for a new [proposal/report] about [topic]."*
3. Review the draft, then ask for a share link when it's ready to send — you confirm before any public link is created.

## Why the bundle works

The writing skill alone gives you text with no prior context to match and nowhere it automatically lives. The connector alone finds and links files, but doesn't write them. Together: the AI searches your Dropbox for the reference that matters, writes the new document with that structure and judgment, and hands you a link ready to share — no manual download-and-reupload step.

## Limits

- It writes review-ready drafts, not final documents without your eye — you approve before sending.
- It doesn't replace legal, accounting, or medical advice; for binding contracts or regulated topics, get professional review.
- Dropbox reading and searching are free; **creating a public share link is outward-facing** — the AI shows you what it will share and only creates the link when you confirm.
- Requires connecting your Dropbox account; it only sees and links what that account allows.
