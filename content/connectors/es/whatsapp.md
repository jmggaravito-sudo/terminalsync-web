---
name: WhatsApp
logo: /connectors/whatsapp.svg
category: messaging
status: soon
simpleTitle: "Tu WhatsApp Business, con IA que responde"
simpleSubtitle: "Claude contesta tus clientes automáticamente mientras dormís. Vos aprobás, él manda."
devTitle: "WhatsApp Business MCP (via Meta Cloud API)"
devSubtitle: "Programmatic access to conversations, templates, and outbound sends."
ctaUrl: "https://business.whatsapp.com"
affiliate: false
tagline: "Atención 24/7, con vos al mando"
---

Pensado para negocios en LatAm donde WhatsApp es el canal principal. Claude te ayuda a:

- Responder preguntas frecuentes con tu tono
- Triagear qué conversaciones necesitan humano
- Mandar seguimientos programados

Viene con tu approval layer: ningún mensaje sale sin que vos lo autorices (o podés dar auto-aprobación a ciertos templates).

*Disponible en beta próxima — hoy lo tenés vía n8n + Meta Cloud API.*

--- dev ---

Bridges to Meta's WhatsApp Business Cloud API. Claude gets tools for: `list_conversations`, `read_thread`, `send_template`, `send_free_form` (within 24h window), `react`, `mark_read`.

Terminal Sync syncs your WABA phone_number_id + access_token across machines. Rate limits and template approval handled at the MCP server level.

**Status**: schema locked, server in private beta. Production release Q2.
