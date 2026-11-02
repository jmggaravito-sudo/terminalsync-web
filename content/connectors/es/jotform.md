---
name: Jotform
logo: /connectors/jotform.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Crea formularios y lee las respuestas de Jotform desde el chat"
simpleSubtitle: "MCP oficial de Jotform: crea formularios, mira las respuestas y resume resultados con el login de tu cuenta de Jotform, sin pegar ninguna API key."
devTitle: "Jotform MCP Connector"
devSubtitle: "MCP oficial hospedado de Jotform (mcp.jotform.com) — formularios y respuestas por OAuth; servers de producto aparte para Sign y Apps."
ctaUrl: "https://www.jotform.com"
tokenHelpUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
manifest:
  mcpServers:
    jotform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.jotform.com"]
affiliate: false
tagline: "Tus formularios y sus respuestas, al alcance del agente"
originalAuthor: "Jotform"
originalAuthorUrl: "https://github.com/jotform/mcp-server"
license: "MIT"
licenseUrl: "https://github.com/jotform/mcp-server/blob/master/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-02T14:20:00.000Z"
verifiedPackageVersion: null
---
**Jotform** es una de las plataformas de formularios más usadas del mundo: encuestas de satisfacción, pedidos, solicitudes, registros de eventos — el formulario que armas una vez y después llenan tus clientes. El server MCP oficial de Jotform deja que tu agente trabaje esos formularios contigo — en sus propias palabras, *"Use Jotform from your AI assistant. Create forms, read responses, prepare documents for signature, and build apps"* — sin pegar ninguna API key en TerminalSync, solo con el login de tu cuenta de Jotform.

Le pides *"Encuentra mis formularios"* y te los lista. Le pides *"Créame un formulario de opinión de clientes con una calificación y un comentario"* y te lo arma listo para compartir. Le pides *"Resúmeme las respuestas de esta semana de mi formulario de feedback"* y te devuelve los patrones sin que abras Jotform. El server principal trabaja con **formularios y sus respuestas como texto**; la doc oficial también documenta tres servers de producto (formularios con vistas previas, documentos para firma con Jotform Sign, y apps de cliente con Jotform Apps) que se conectan por separado — el conector de TerminalSync usa el principal.

Un dato importante de la doc oficial: **el MCP de Jotform es gratis** — *"Jotform MCP is free. Your Jotform plan limits still apply."* Lo que sí aplica son los límites de uso de tu plan de Jotform, y si el server contesta un error HTTP 429 la recomendación oficial es *"You sent too many requests. Wait and try again."*

### Qué le puedes pedir

- *"Encuentra mis formularios."*
- *"Créame un formulario de opinión de clientes con una calificación y un comentario."*
- *"Resúmeme las respuestas de esta semana de mi formulario de feedback."*
- *"¿Cuántas respuestas tuvo mi formulario de pedidos hoy?"*
- *"Envía el formulario de inscripción a este email."*
- *"¿Qué patrones ves en las respuestas del último mes?"*

Antes de cualquier cosa que cambie tus formularios — crear o editar uno — tu agente te pide confirmación primero.

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Jotform — la doc oficial lo dice textual: *"You sign in to Jotform in your browser... You never paste a password or API key."*

1. Activas el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Jotform en tu navegador.
3. Inicias sesión y apruebas el acceso. *"Your AI tool sees what your Jotform account can see. It cannot do more than your account can."* La guía oficial está en [jotform.com/developers/mcp](https://www.jotform.com/developers/mcp/?tab=mcp).

Puedes revocar el acceso cuando quieras desde tu cuenta de Jotform: **Mi cuenta → Connected Apps → Jotform MCP → Clients**, y ahí eliges el cliente y **Revoke** — la doc oficial lo documenta así.

**Aclaración honesta:** es un server **hospedado por Jotform** (`https://mcp.jotform.com`), no algo que corre en tu computadora. Lo que el agente puede ver o hacer queda acotado por lo que apruebas en el login y por lo que tu cuenta de Jotform ya tiene. Si tu organización usa Jotform Enterprise, un admin debe instalar la conexión — también está en la doc oficial.

--- dev ---

Jotform publica un **server MCP remoto oficial** — el registro MCP lista `com.jotform/mcp`, y el repo del vendor es `github.com/jotform/mcp-server` (MIT, org `jotform`). Doc oficial del server: `jotform.com/developers/mcp/?tab=mcp`, con la guía del repo en `docs/` (`endpoints.md`, `tools.md`, `authentication.md`).

TerminalSync usa el puente `mcp-remote` para conectar tu equipo con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.jotform.com
```

Endpoints oficiales: un **server principal** (`https://mcp.jotform.com` — formularios y respuestas como texto; la dirección `/default` de la extensión de Gemini tiene las mismas tools) y **tres servers de producto**: `https://mcp.jotform.com/mcp-app` (formularios con previews y tablas — las tools del principal excepto `get_submissions`, más `display_form`, `list_submissions`, `create_submission`, `get_embed_code`, `get_teams`), `https://mcp.jotform.com/mcp-sign-v1` (Jotform Sign: `create_sign_document`, `edit_sign_document`, `display_sign_document`, `update_sign_document_content`, `get_signers`, `update_signer`, `send_for_signature`, `get_signing_status`, `get_signing_links`) y `https://mcp.jotform.com/mcp-jotform-apps-v1` (Jotform Apps: `create_app`, `edit_app`, `search`, `fetch`, `get_teams`). Este conector shipea el server principal; los servers de producto se conectan por separado (los plugins de Claude de Jotform los agregan de a uno).

Tools del server principal, verbatim de la doc oficial (`docs/mcp/tools.md`): `search` (*"Finds forms and apps"*), `create_form` (*"Creates a form from your description"*), `edit_form` (*"Changes a form"*), `fetch` (*"Reads one form or response"*), `get_submissions` (*"Lists the responses of a form"*), `assign_form` (*"Sends a form to someone by email"*) y `analyze_submissions` (*"Summarizes responses and finds patterns"*). Nota oficial: *"Your AI tool shows the current tool list after you connect"* — siempre usar el schema del server conectado.

Auth: login de Jotform en el navegador; *"You never paste a password or API key."* Sin `env` ni `${SECRET:…}` — molde OAuth puro. Alcance: *"Your AI tool sees what your Jotform account can see. It cannot do more than your account can."* Revocación: `My Account → Connected Apps → Jotform MCP → Clients` → Revoke. Límite documentado: HTTP 429 ante exceso de requests (*"You sent too many requests. Wait and try again."*). Costo: *"Jotform MCP is free. Your Jotform plan limits still apply."*

Smoke 2026-11-02: `POST initialize` a `https://mcp.jotform.com` sin credenciales → **401** (server vivo, exige OAuth antes del login), y el smoke de login con `mcp-remote` llegó a la pantalla de autorización. Mercados: `["GLOBAL"]` — la doc del MCP no declara restricciones de país (Jotform opera globalmente; el único requisito documentado es una cuenta Jotform).

Licencia: MIT (LICENSE del repo `github.com/jotform/mcp-server`); el servicio Jotform es SaaS propietario bajo los términos de `jotform.com/terms`. Fuente: github.com/jotform/mcp-server (README + docs/mcp/*.md, leídos verbatim 2026-11-02) + jotform.com/developers/mcp/?tab=mcp.
