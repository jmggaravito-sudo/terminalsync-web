---
name: Jotform
logo: /connectors/jotform.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Tus formularios y sus respuestas, al alcance del agente"
simpleSubtitle: "Server MCP oficial de Jotform: crea formularios, lee las respuestas y los envía por email, conectándote con tu cuenta de Jotform."
devTitle: "Conector MCP de Jotform"
devSubtitle: "MCP oficial hospedado de Jotform (mcp.jotform.com) — formularios, respuestas y análisis, con login por navegador."
ctaUrl: "https://www.jotform.com"
tokenHelpUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
manifest:
  mcpServers:
    jotform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.jotform.com"]
affiliate: false
tagline: "Formularios que capturan clientes, gestionados conversando"
originalAuthor: "Jotform"
originalAuthorUrl: "https://github.com/jotform/mcp-server"
license: "proprietary"
licenseUrl: "https://www.jotform.com/terms/"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 7
aiReadOnlyTools: 4
verifiedAt: "2026-11-09T12:00:00.000Z"
verifiedPackageVersion: null
---
**Jotform** es la plataforma de formularios con la que los negocios capturan clientes, toman pedidos y recolectan información de todo tipo — de su README oficial: *"Use Jotform from your AI assistant. Create forms, read responses, prepare documents for signature, and build apps."*

Qué significa en la práctica: tu agente puede crear formularios a partir de una descripción en palabras, editarlos, leer las respuestas que llegan, resumirlas y detectar patrones, y enviar un formulario por email a un cliente. Es el server principal de Jotform, con **7 tools** documentadas para formularios y sus respuestas.

### Qué le puedes pedir

- *"Busca mis formularios y dime cuáles recibieron respuestas esta semana."*
- *"Crea un formulario de feedback de clientes con una pregunta de puntuación y un campo de comentario."*
- *"Resume las respuestas de esta semana de mi formulario de feedback y dime qué patrones ves."*
- *"Envíale el formulario de presupuesto a este cliente por email."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Se conecta con tu cuenta de Jotform:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre `https://mcp.jotform.com` en tu navegador para que inicies sesión con tu cuenta de Jotform y apruebes el acceso.
3. Vuelve al agente y las tools de Jotform quedan listas. La conexión queda asociada a tu cuenta: *"Your AI tool sees what your Jotform account can see. It cannot do more than your account can."*

**Aclaración honesta:** es un **server hospedado por Jotform** — no algo que corre en tu computadora. El MCP de Jotform es gratuito, pero los límites de tu plan de Jotform siguen aplicando (*"Jotform MCP is free. Your Jotform plan limits still apply"*). Si una organización administra tu cuenta, un admin puede restringir qué conexiones se pueden usar. Y si en algún momento quieres cortar el acceso, se revoca desde **My Account → Connected Apps → Jotform MCP → Clients** — la herramienta tendría que iniciar sesión de nuevo.

--- dev ---

Jotform publica su server MCP como **server remoto/hospedado**, documentado en `jotform.com/developers/mcp/?tab=mcp` y en el repo oficial `github.com/jotform/mcp-server` (MIT). Endpoint del server principal: `https://mcp.jotform.com` — las respuestas llegan como texto. La doc oficial para clientes genéricos es exactamente este camino: *“Add the server address … Codex, Cursor, VS Code, any MCP tool”*, y el README remite a `docs/mcp/endpoints.md` como fuente. La auth es **login por navegador** (OAuth): *"You sign in to Jotform in your browser. Your AI tool then keeps the connection for you. You never paste a password or API key."* El cliente debe soportar servers MCP remotos por HTTP y login en el navegador.

Tools oficiales del server principal (7, verbatim de `docs/mcp/tools.md`):

| Tool | Qué hace (según la doc oficial) |
|---|---|
| `search` | Finds forms and apps. |
| `create_form` | Creates a form from your description. |
| `edit_form` | Changes a form. |
| `fetch` | Reads one form or response. |
| `get_submissions` | Lists the responses of a form. |
| `assign_form` | Sends a form to someone by email. |
| `analyze_submissions` | Summarizes responses and finds patterns. |

Cuatro son de lectura, tres de escritura (`create_form`, `edit_form`, `assign_form`). Errores HTTP 429 indican que se mandaron demasiadas requests (*"You sent too many requests. Wait and try again"*).

La misma infraestructura expone servers por producto para los plugins de Claude de Jotform: `https://mcp.jotform.com/mcp-app` (previews y tablas, requiere soporte MCP Apps en el cliente), `https://mcp.jotform.com/mcp-sign-v1` (documentos para firma: `create_sign_document`, `send_for_signature`, `get_signing_status`, entre otras) y `https://mcp.jotform.com/mcp-jotform-apps-v1` (apps/portales de cliente). Este conector del catálogo usa el **server principal**, que es el camino documentado para clientes MCP genéricos; las respuestas llegan como texto, sin previews ni tablas.

Licencia: SaaS propietario (términos de Jotform, `jotform.com/terms/`); el repo del MCP es MIT. Fuente: repo oficial `github.com/jotform/mcp-server` (`README.md`, `docs/mcp/endpoints.md`, `docs/mcp/tools.md`, `docs/mcp/authentication.md`) + página oficial `jotform.com/developers/mcp/?tab=mcp`.
