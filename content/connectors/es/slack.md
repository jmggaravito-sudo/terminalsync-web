---
name: Slack
logo: /connectors/slack.svg
category: messaging
status: available
simpleTitle: "Que tu IA lea y escriba en Slack"
simpleSubtitle: "Canales, threads, usuarios, perfiles, mensajes y reacciones — con scopes explícitos."
devTitle: "Slack MCP Connector"
devSubtitle: "Servidor oficial @modelcontextprotocol para Slack Web API: channel history, post, replies, users."
ctaUrl: "https://slack.com"
tokenHelpUrl: "https://api.slack.com/apps"
manifest:
  mcpServers:
    slack:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-slack"]
      env:
        SLACK_BOT_TOKEN: "${SECRET:SLACK_BOT_TOKEN}"
        SLACK_TEAM_ID: "${SECRET:SLACK_TEAM_ID}"
affiliate: false
tagline: "Tu workspace Slack, conectado al agente"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-slack"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-slack"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
**Slack** es el lugar donde quedan decisiones, status, incidentes, threads y conversaciones del equipo. El server MCP oficial conecta Claude con la Slack Web API para *"interact with Slack workspaces"*: leer canales, recuperar threads, listar usuarios, consultar perfiles, publicar mensajes y agregar reacciones.

Qué hace: lista canales públicos o predefinidos, lee historial reciente de un canal, trae replies de un thread, postea mensajes, responde en threads, agrega emoji reactions y consulta usuarios/perfiles. Si definís `SLACK_CHANNEL_IDS`, limitás el alcance a canales concretos.

### Qué le podés pedir

- *"Summarize the last 50 messages in the incident channel and extract action items."*
- *"Post this deploy status in `#engineering` and reply in the release thread."*
- *"Find the profile for this user ID and tell me their timezone before I ping them."*

### Qué token necesitás

Necesitás una **Slack App** instalada en tu workspace y su **Bot User OAuth Token** (`xoxb-...`). El README oficial pide crear la app desde [api.slack.com/apps](https://api.slack.com/apps), ir a OAuth & Permissions y agregar estos scopes:

- `channels:history` — View messages and other content in public channels
- `channels:read` — View basic channel information
- `chat:write` — Send messages as the app
- `reactions:write` — Add emoji reactions to messages
- `users:read` — View users and their basic information
- `users.profile:read` — View detailed profiles about users

Después instalá la app en el workspace, copiá el Bot User OAuth Token y buscá el Team ID (empieza con `T`). Pegalos cuando el Lab pida `SLACK_BOT_TOKEN` y `SLACK_TEAM_ID`. Terminal Sync los guarda cifrados en tu Keychain.

--- dev ---

`@modelcontextprotocol/server-slack` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-slack` con `SLACK_BOT_TOKEN` y `SLACK_TEAM_ID` en `env`. El README también documenta `SLACK_CHANNEL_IDS` como opcional para limitar acceso: comma-separated list of channel IDs.

Tools verificadas contra el README oficial: `slack_list_channels`, `slack_post_message`, `slack_reply_to_thread`, `slack_add_reaction`, `slack_get_channel_history`, `slack_get_thread_replies`, `slack_get_users`, `slack_get_user_profile`.

Scopes oficiales requeridos para las capacidades completas: `channels:history`, `channels:read`, `chat:write`, `reactions:write`, `users:read`, `users.profile:read`. Si querés limitar riesgo, instalá la app solo en canales necesarios y configura `SLACK_CHANNEL_IDS`.

Terminal Sync mantiene los secretos en el Keychain via `apiKeyHelper`, sincronizados cifrados con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-slack` en npm.
