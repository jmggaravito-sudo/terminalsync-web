---
name: Brevo
logo: /plugins/brevo.svg
category: marketing
status: available
tagline: "Your next campaign reads like you wrote it — because it learned your voice first."
description: "Bundles the Brevo connector (official Brevo MCP: contacts, campaigns and CRM over your own Brevo account) with Brand Voice (extracts your voice profile from 3–5 real samples and drafts in it), so the campaign the agent creates in Brevo comes out in your voice instead of generic AI copy."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: brevo
skillSlugs: ["brand-voice"]
---
## When to use

- Your newsletters and promos go out through Brevo, and every draft sounds like generic AI — you end up rewriting them by hand before they can be sent.
- You delegate the writing and need the campaign to be indistinguishable from what you would have written.
- You already write emails and posts that sound like you, and want the next campaign to start from that voice instead of a blank page that produces the same AI paragraphs.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Brevo (the connector)** is the official hosted Brevo MCP: with a Brevo MCP token from your own account, the agent reads your contacts and lists, your campaign performance and your CRM deals, and creates campaigns — email, SMS or WhatsApp. Creating or sending a campaign is a real change to your account: review and explicitly approve the exact campaign before it runs.
- **Brand Voice (the skill)** asks for 3–5 things you actually wrote before drafting anything in your name, builds a voice profile (sentence rhythm, vocabulary, how you open and close, what you never say), drafts the campaign in that voice, and points at the lines where a draft still sounds like everyone else's AI. It never guesses facts, numbers or commitments: the offer, the price and the dates come from you.

**A real example:** *"Draft the Black Friday email in my voice — 20% off everything, Friday only."* The skill drafts it from your samples plus the facts you gave; you read it, fix what's off, approve, and the campaign is created in Brevo through the connector.

## How to use

1. Install the Plugin and connect Brevo — paste the Brevo MCP token from your own account (Account > SMTP & API > API Keys, with the "Create MCP server API key" option on).
2. Paste 3–5 real samples into the skill — emails, posts, a newsletter. Real ones, not ones you like. Correct the voice profile it returns ("I'd never use an exclamation mark") — that correction sticks.
3. Ask for the campaign with the facts: offer, price, dates, audience. The skill drafts; you read the draft before anything moves.
4. Approve the exact campaign and let the connector create it in Brevo. Sending stays your decision, campaign by campaign.

## Why the bundle works

The skill alone drafts in your voice, but the text still has to be rebuilt inside Brevo by hand; the connector alone creates campaigns in whatever voice the prompt implies — usually generic AI. Together: the copy is yours before it exists as a campaign, and it lands in the tool that actually sends it.

## Limits

- Your Brevo MCP token has no scopes and grants full read/write access to your account, and Brevo's docs describe no server-side confirmation step — treat every create or send as a decision you approve explicitly. This pack adds no approval gate to the server.
- The voice profile is a strong approximation from your samples, not a copy of your head. The skill never invents facts, numbers or commitments to make the writing sound more like you, and it refuses to imitate a specific real person from material that person did not hand you.
- The profile is built from the samples you paste — the skill doesn't read your Brevo campaign history by itself. If you want it to learn from past campaigns, paste them as samples.
- SMS and WhatsApp campaigns are short-form: the voice profile still applies, but rhythm and vocabulary carry less in 160 characters than in an email. Judge those drafts accordingly.
