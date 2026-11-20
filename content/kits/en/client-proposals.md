---
name: Client Proposals Kit
logo: /logos/ts-kit.svg
category: sales
status: available
tagline: "Turn rough notes into a proposal that looks like your business and lands in the client's inbox — in one sitting."
description: "A coherent proposal-workflow bundle for service-business owners who send quotes and proposals every week: write the proposal content from your call notes, put it in a designed document built on your own brand, and email the PDF to the client — without a designer, a DTP tool, or a copy-paste relay between four tabs."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: doc-coauthoring
    reason: "The proposal's substance: scope, deliverables, price, timeline and terms, built through a brief → outline → draft → review loop on the client's real context, so the document says something specific instead of filling a generic template."
  - kind: connector
    slug: canva
    reason: "The proposal's face: generates and edits the designed proposal document from your own Canva account and brand assets, and exports it as a PDF that does not look like everyone else's text file. Without it the kit ends at a wall of text."
  - kind: connector
    slug: gmail
    reason: "The delivery: the finished PDF goes to the client as an email with a proper cover message, so the workflow ends with a sent proposal instead of a file on the desktop. Sending is confirmation-gated — nothing leaves without your approval."
---
## Who it is for

Freelancers, consultants, agencies, studios, and small service businesses whose recurring job includes sending proposals or quotes to clients — the weekly or biweekly ritual of turning a call into a document a client can say yes to.

Use it when the honest today is: the notes are in one place, the text gets written in a doc, the design never happens (or takes a day), and the send is a manual attach-and-email relay.

## What it helps you do

This kit covers the full proposal artifact, from notes to the client's inbox:

- **Draft the substance**: scope, deliverables, pricing, timeline and terms, co-authored from your real notes about this client.
- **Design it**: generate a branded proposal document in Canva from your own account and brand assets, edit it, and export it as a PDF.
- **Send it**: email the PDF to the client with a short cover message, confirming before anything goes out.

The expected outcome: proposals go from notes to the client's inbox in one sitting, and they look like your business — not like a plain text file.

## What's included

### Skills

- **Doc Co-Authoring** — the words. Runs the proposal through brief → outline → draft → review with the client's context, keeping scope, numbers and terms consistent across revisions. Pricing is your call; the skill structures and argues it.

### Connectors

- **Canva** — the look. Reads your brand assets, generates and edits the proposal document, and exports it as a PDF. Works against your own Canva account over your own login (OAuth in the browser; no API key), with the same access level you already have.
- **Gmail** — the send. Delivers the PDF with a cover message from the Gmail account you connect. Sending is gated behind a confirmation step.

### CLI

No CLI tool is included. The target user is non-technical, and this workflow is documents and email, not terminal execution.

## How to use it

1. Install the kit. Doc Co-authoring needs no setup. Connect Canva with your Canva login (browser OAuth) and Gmail with your Google credentials.
2. Dump the client context: *"Here are my notes from the call with Acme — draft the proposal."* Co-author scope, deliverables, price, timeline.
3. Ask for the artifact: *"Turn this into a clean two-page proposal document with our brand assets"* — review it in Canva, adjust, and export the PDF.
4. Send it: *"Email this to ana@client.com with a short note saying we can start on the 1st."* Confirm, and it goes.
5. Reuse the structure: the next proposal starts from the last one's outline and design, not from scratch.

## Why these pieces belong together

A proposal is one artifact with three halves that usually live in three tabs: the words, the look, and the send.

- Doc Co-authoring writes the substance — the part that gets a yes.
- Canva gives it the presentation the words deserve and produces the actual PDF the client receives.
- Gmail delivers it with a cover message — with a confirmation gate, because email is irreversible.

Remove any piece and the loop breaks: without Doc Co-authoring the deck is a pretty shell with nothing specific in it; without Canva the owner sends a text document or waits days on a designer; without Gmail the finished PDF dies on the desktop and the owner re-attaches it by hand. Installed together the kit is one flow: **notes → content → designed PDF → sent**.

Scope note: this kit produces and delivers the proposal artifact; it does not run the deal around it. The Business Owner kit tracks leads and cash around the proposal, and the B2B Sales Pipeline kit manages the pipeline in a CRM — if your recurring pain is the proposal itself (its content, its look, and getting it sent), this is the kit for that job.

## Limits

- It does not price the job for you: scope and pricing are your decisions; the pieces structure and present them.
- No e-signature or contract management — a proposal is not a signed agreement; use your contract flow after acceptance.
- It does not track the client or the deal after sending; that is CRM work (see the Business Owner or B2B Sales Pipeline kits).
- Canva capabilities depend on your Canva plan: brand kits, autofill templates and resizing unlock on Pro or Enterprise; the free plan has limits.
- Gmail requires Google OAuth credentials (client ID and secret) and sends from the Gmail account you connect; every send is confirmation-gated and nothing is sent without your approval.
- Design generation is bounded by what your Canva account allows — review the export before it goes to a client.
