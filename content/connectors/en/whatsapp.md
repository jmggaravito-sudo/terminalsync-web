---
name: WhatsApp
logo: /connectors/whatsapp.svg
category: messaging
status: soon
simpleTitle: "Your WhatsApp Business, with AI that replies"
simpleSubtitle: "Claude answers your clients automatically while you sleep. You approve, it sends."
devTitle: "WhatsApp Business MCP (via Meta Cloud API)"
devSubtitle: "Programmatic access to conversations, templates, and outbound sends."
ctaUrl: "https://business.whatsapp.com"
affiliate: false
tagline: "24/7 support, with you in charge"
---

Built for LatAm businesses where WhatsApp is the primary channel. Claude helps you:

- Reply to FAQs in your tone
- Triage which conversations need a human
- Send scheduled follow-ups

Comes with your approval layer: no message ships without your green light (or you can auto-approve certain templates).

*Private beta coming — today you can wire it via n8n + Meta Cloud API.*

--- dev ---

Bridges to Meta's WhatsApp Business Cloud API. Claude gets tools for: `list_conversations`, `read_thread`, `send_template`, `send_free_form` (within 24h window), `react`, `mark_read`.

Terminal Sync syncs your WABA phone_number_id + access_token across machines. Rate limits and template approval handled at the MCP server level.

**Status**: schema locked, server in private beta. Production release Q2.
