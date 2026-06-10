---
name: Slack
logo: /connectors/slack.svg
category: messaging
status: available
simpleTitle: "Hablále a tu workspace de Slack desde tu IA"
simpleSubtitle: "\"Resumime lo de hoy en #general\", \"mandale un mensaje a @juan\" — sin abrir Slack."
devTitle: "Slack MCP Connector"
devSubtitle: "Acceso a la API web de Slack. Lectura de canales, post de mensajes, lookup de usuarios."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack"
affiliate: false
tagline: "Leé y posteá en Slack desde tu IA"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Útil para ponerte al día con canales mientras estabas en deep work, postear status updates, o encontrar mensajes de una persona específica.

Los permisos se rigen por el token de Slack que le des — exactamente lo que puede hacer en tu workspace.

--- dev ---

`@modelcontextprotocol/server-slack` requiere `SLACK_BOT_TOKEN` y `SLACK_TEAM_ID`. Operaciones: `slack_list_channels`, `slack_post_message`, `slack_reply_to_thread`, `slack_add_reaction`, `slack_get_channel_history`, `slack_get_thread_replies`, `slack_get_users`, `slack_get_user_profile`.

Licencia: MIT.
