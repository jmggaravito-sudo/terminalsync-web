---
name: Gmail
logo: /connectors/gmail.svg
category: messaging
status: available
simpleTitle: "Tu inbox, hablando con tu IA"
simpleSubtitle: "\"¿Algo urgente hoy?\" \"Resumime los correos de mi cliente X\" — sin pegar nada."
devTitle: "Gmail MCP Connector"
devSubtitle: "OAuth-scoped Gmail API access for search, read, and draft composition."
ctaUrl: "https://gmail.com"
affiliate: false
tagline: "Triage inteligente en el inbox"
---

Llegás a la mañana con 80 correos sin leer. Le decís a Claude *"qué es urgente hoy"* y te resume lo importante. Le pedís *"redactame respuesta para el cliente X con tono formal"* y arma el draft.

No manda nada automático — vos revisás y enviás.

--- dev ---

Gmail MCP uses OAuth 2.0 scopes: `gmail.readonly` (default) or `gmail.modify` for draft creation. Supports Gmail search operators, thread traversal, label management, and draft composition. Sends still require user confirmation.

Terminal Sync syncs the OAuth refresh token encrypted per-machine. Multi-account supported via profiles — configure once, available on every device.
