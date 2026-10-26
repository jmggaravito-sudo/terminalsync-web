---
name: Jotform
logo: /connectors/jotform.png
category: productivity
markets: ["GLOBAL"]
status: available
simpleTitle: "Tus formularios de Jotform, gestionados conversando"
simpleSubtitle: "Server MCP oficial de Jotform: crea formularios, lee respuestas y prepara documentos para firma con el login de tu cuenta."
devTitle: "Conector MCP de Jotform"
devSubtitle: "MCP oficial hospedado de Jotform (mcp.jotform.com) — formularios, respuestas y servers de producto Sign y Apps."
ctaUrl: "https://www.jotform.com"
tokenHelpUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
manifest:
  mcpServers:
    jotform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.jotform.com"]
affiliate: false
tagline: "Formularios y firmas, al alcance del agente"
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
verifiedAt: "2026-10-26T15:15:00.000Z"
verifiedPackageVersion: null
---
**Jotform** es la plataforma de formularios con la que los negocios capturan pedidos, inscripciones y datos de clientes —y con la que también preparan documentos para firma y arman apps de portal de cliente—. El conector oficial de Jotform es un **server MCP hospedado** (`https://mcp.jotform.com`); su misión, en palabras oficiales: *"Create forms, read responses, prepare documents for signature, and build apps."*

Qué significa en la práctica: por el server principal tu agente puede buscar formularios, crearlos desde una descripción, editarlos, leer una respuesta puntual, analizar respuestas (resúmenes y patrones) y enviárselos a alguien por email. La doc oficial lista las tools del server principal: `search`, `create_form`, `edit_form`, `fetch`, `get_submissions`, `assign_form` y `analyze_submissions`. Para firmas y apps, Jotform publica además dos servers de producto separados: **Sign** (`mcp.jotform.com/mcp-sign-v1`, documentos para firma) y **Apps** (`mcp.jotform.com/mcp-jotform-apps-v1`, portales de cliente y apps de eventos).

### Qué le puedes pedir

- *"Crea un formulario de inscripción para mi taller con nombre, email y horario preferido."*
- *"¿Cuántas respuestas tuvo el formulario de contacto esta semana y qué patrones ves?"*
- *"Busca el formulario de pedidos y tráeme las respuestas de hoy."*
- *"Mándale el formulario de contrato a este cliente por email."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key** — la doc es tajante: *"You never paste a password or API key."*

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Jotform en tu navegador: *"Sign in to Jotform in your browser and approve access."*
3. Vuelves a TerminalSync y las tools quedan listas: *"Your AI tool sees what your Jotform account can see"* y *"It cannot do more than your account can."*

**Aclaración honesta:** es un **server hospedado por Jotform**, no algo que corre en tu computadora. Conectado por dirección de server (el camino de este conector), el alcance documentado son **formularios y respuestas**; la firma y las apps corren en los servers de producto de Jotform. Tu organización puede limitar qué conexiones se pueden usar (*"Your organization may limit which connections you can use"*), y en instalaciones de workspace las instala un admin. Puedes revocar el acceso cuando quieras desde My Account → Connected Apps → Jotform MCP → Clients. El repo oficial es un proyecto joven (10 commits al 2026-10-26): la doc y el server recién arrancan.

--- dev ---

Jotform publica su server MCP como **server remoto/hospedado**, documentado en el repo oficial `github.com/jotform/mcp-server` y en `jotform.com/developers/mcp/?tab=mcp`. Server principal: `https://mcp.jotform.com` — *"Jotform has one main MCP server and three product servers. Most people only need the main server."*; servers de producto: `https://mcp.jotform.com/mcp-app` (Forms), `https://mcp.jotform.com/mcp-sign-v1` (Sign), `https://mcp.jotform.com/mcp-jotform-apps-v1` (Apps) y `https://mcp.jotform.com/default` (el mismo server principal, para la extensión de Gemini). Requisito del cliente: *"Your tool must support remote HTTP MCP servers and browser sign-in."* El puente del catálogo:

```
npx -y mcp-remote@latest https://mcp.jotform.com
```

Auth: login por navegador, sin passwords ni API keys; conexión revocable desde My Account → Connected Apps → Jotform MCP → Clients (*"The AI tool must sign in again to use Jotform."* tras revocar).

Tools del server principal (7, verbatim de la doc oficial): `search` (*"Finds forms and apps."*), `create_form` (*"Creates a form from your description."*), `edit_form` (*"Changes a form."*), `fetch` (*"Reads one form or response."*), `get_submissions` (trae las respuestas de un formulario), `assign_form` (*"Sends a form to someone by email."*), `analyze_submissions` (*"Summarizes responses and finds patterns."*). El server de Forms (`/mcp-app`) trae todas las del principal salvo `get_submissions`, más las app-specific: `display_form`, `list_submissions`, `create_submission`, `get_embed_code` y `get_teams`. Sign (`/mcp-sign-v1`): `search`, `list_submissions`, `create_sign_document`, `edit_sign_document`, `display_sign_document`, `update_sign_document_content`, `get_signers`, `update_signer`, `send_for_signature`, `get_signing_status`, `get_signing_links`, `get_teams`. Apps (`/mcp-jotform-apps-v1`): `search`, `fetch`, `create_app`, `edit_app`, `get_teams`. Ojo con los nombres repetidos: *"search finds forms and apps on the main server, documents on the Sign app, and apps on the Apps app"* — *"Each tool works on its own server's product."*

Divulgación: paridad de permisos con la cuenta (*"It cannot do more than your account can"*); rate limiting con 429 (*"You sent too many requests. Wait and try again."*); los previews y tablas de MCP Apps solo se ven en clientes que soportan Apps.

Licencia: MIT (LICENSE del repo oficial `jotform/mcp-server`). Fuente: github.com/jotform/mcp-server (README + `docs/mcp/endpoints.md` + `docs/mcp/tools.md` + `docs/mcp/authentication.md`).
