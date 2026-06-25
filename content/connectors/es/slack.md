---
name: Slack
logo: /connectors/slack.svg
category: messaging
status: available
simpleTitle: "Que tu IA lea y escriba en Slack"
simpleSubtitle: "Resúmenes de canales, respuestas en threads, mensajes nuevos — con permisos explícitos que vos elegís."
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
**Slack** es donde el equipo conversa: canales por tema, threads en los mensajes importantes, decisiones que quedan ahí escritas, incidentes que se gestionan en vivo. Con el tiempo se acumula mucha información valiosa — y mucho ruido también.

Este conector deja que tu IA entre a Slack para leer y escribir, igual que un compañero de equipo más. Puede resumir lo que pasó en un canal, contestar threads, postear mensajes nuevos o reaccionar con emojis. Importante: **solo puede hacer lo que vos le permitiste explícitamente** al instalar la Slack App — cada permiso (leer canales, escribir, ver usuarios) se activa por separado.

### Qué le podés pedir

- *"Resumime los últimos 50 mensajes del canal de incidentes y sacame una lista de pendientes."*
- *"Posteá este estado del deploy en `#engineering` y respondé también en el thread del release."*
- *"Buscá el perfil de este usuario y decime en qué zona horaria está antes de que le escriba."*

### Qué token necesitás

Necesitás dos cosas: instalar una **Slack App** en tu workspace y conseguir su **Bot User OAuth Token** (empieza con `xoxb-`). La app es la que va a hablar con Slack en nombre del agente.

1. Andá a [api.slack.com/apps](https://api.slack.com/apps) y creá una app nueva.
2. En **OAuth & Permissions**, agregá estos permisos (cada uno habilita una capacidad concreta):

   - `channels:history` — leer mensajes de canales públicos
   - `channels:read` — ver información básica de canales
   - `chat:write` — postear mensajes como la app
   - `reactions:write` — agregar reacciones con emojis
   - `users:read` — ver usuarios y su info básica
   - `users.profile:read` — ver perfiles detallados de usuarios

3. **Instalá la app en tu workspace** desde esa misma página. Slack te va a pedir confirmación de los permisos.
4. Copiá el Bot User OAuth Token y también el **Team ID** (el ID de tu workspace, empieza con `T` — lo ves en la URL cuando estás en `app.slack.com/...`).
5. Pegá ambos cuando el Lab te pida `SLACK_BOT_TOKEN` y `SLACK_TEAM_ID`. Terminal Sync los guarda cifrados en tu Keychain.

Buena práctica: agregá el bot solo a los canales donde realmente lo querés. Aunque el token tenga permiso de leer canales públicos, si el bot no está invitado a un canal privado, no lo ve.

--- dev ---

`@modelcontextprotocol/server-slack` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-slack` con `SLACK_BOT_TOKEN` y `SLACK_TEAM_ID` en `env`. El README también documenta `SLACK_CHANNEL_IDS` como opcional para limitar acceso: comma-separated list of channel IDs.

Tools verificadas contra el README oficial: `slack_list_channels`, `slack_post_message`, `slack_reply_to_thread`, `slack_add_reaction`, `slack_get_channel_history`, `slack_get_thread_replies`, `slack_get_users`, `slack_get_user_profile`.

Scopes oficiales requeridos para las capacidades completas: `channels:history`, `channels:read`, `chat:write`, `reactions:write`, `users:read`, `users.profile:read`. Si querés limitar riesgo, instalá la app solo en canales necesarios y configura `SLACK_CHANNEL_IDS`.

Terminal Sync mantiene los secretos en el Keychain via `apiKeyHelper`, sincronizados cifrados con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-slack` en npm.
