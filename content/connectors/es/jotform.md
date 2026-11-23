---
name: Jotform
logo: /connectors/jotform.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Tus formularios y respuestas de Jotform, gestionados conversando"
simpleSubtitle: "Server MCP oficial de Jotform: crea formularios, lee respuestas y prepara documentos para firma con tu cuenta de Jotform, sin API key."
devTitle: "Conector MCP de Jotform"
devSubtitle: "MCP oficial hospedado de Jotform (mcp.jotform.com) — Forms, Sign y Apps por login en el navegador."
ctaUrl: "https://www.jotform.com"
tokenHelpUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
manifest:
  mcpServers:
    jotform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.jotform.com"]
affiliate: false
tagline: "Formularios, firmas y respuestas de clientes, al alcance del agente"
originalAuthor: "Jotform"
originalAuthorUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
license: "MIT"
licenseUrl: "https://github.com/jotform/mcp-server/blob/master/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-23T14:16:08.606Z"
verifiedPackageVersion: null
---
**Jotform** es la plataforma de formularios con la que los negocios capturan pedidos, inscripciones, presupuestos y feedback de clientes — y con Jotform Sign convierte documentos en acuerdos firmados digitalmente. El conector oficial de Jotform es un **server MCP hospedado** (`https://mcp.jotform.com`). En sus palabras oficiales: *"Use Jotform from your AI assistant. Create forms, read responses, prepare documents for signature, and build apps."*

Qué significa en la práctica: tu agente puede crear y editar formularios a partir de una descripción en lenguaje natural, leer las respuestas que llegan, resumirlas y encontrar patrones, y enviar un formulario por email a quien corresponda. Además de ese server principal, Jotform expone dos servers de producto: **Jotform Sign** (preparar documentos, enviarlos a firma y seguir el estado de cada firmante) y **Jotform Apps** (portales de cliente y apps de evento). El server principal expone **7 tools**; Sign y Apps suman las suyas en `mcp.jotform.com/mcp-sign-v1` y `mcp.jotform.com/mcp-jotform-apps-v1`.

### Qué le puedes pedir

- *"Encuentra mis formularios."*
- *"Crea un formulario de feedback de clientes con una calificación y un comentario."*
- *"Resume las respuestas de esta semana de mi formulario de feedback y dime qué patrones ves."*
- *"Prepara un borrador de acuerdo de servicio a partir de estos términos y envíalo a firma."* (Sign)

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu cuenta de Jotform en el navegador:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Jotform en tu navegador. La doc oficial lo describe así: *"You sign in to Jotform in your browser. Your AI tool then keeps the connection for you. You never paste a password or API key."*
3. Inicias sesión y apruebas el acceso. Lo que el agente puede ver queda acotado por tu cuenta: *"Your AI tool sees what your Jotform account can see. It cannot do more than your account can."*
4. Para cortar el acceso: **My Account → Connected Apps → Jotform MCP → Clients** → **Revoke**.

**Aclaración honesta:** es un **server hospedado por Jotform** (`https://mcp.jotform.com`), no algo que corre en tu computadora. Jotform MCP es gratis, pero los límites de tu plan de Jotform siguen aplicando — *"Jotform MCP is free. Your Jotform plan limits still apply."* En organizaciones con workspace, un admin debe instalar Jotform para que el equipo pueda conectarlo. Y si ves un error HTTP 429, enviaste demasiadas peticiones seguidas: espera y reintenta.

--- dev ---

Jotform publica su server MCP como **server remoto/hospedado**, documentado en el repo oficial `github.com/jotform/mcp-server` y en `jotform.com/developers/mcp`. No hay paquete npm stdio; el puente del catálogo es el patrón genérico de cliente:

```
npx -y mcp-remote@latest https://mcp.jotform.com
```

La auth es **OAuth por navegador** — sin API key ni secret (molde B). Jotform tiene un server principal y tres servers de producto; el manifiesto usa el principal:

| Server | Address | Uso |
| --- | --- | --- |
| Main server | `https://mcp.jotform.com` | Forms y respuestas, como texto |
| Forms app | `https://mcp.jotform.com/mcp-app` | Forms y respuestas, con previews y tablas (MCP Apps) |
| Sign app | `https://mcp.jotform.com/mcp-sign-v1` | Documentos para firma |
| Apps app | `https://mcp.jotform.com/mcp-jotform-apps-v1` | Portales de cliente y apps de evento |

Tools oficiales del server principal (7, verbatim): `search`, `create_form`, `edit_form`, `fetch`, `get_submissions`, `assign_form`, `analyze_submissions`. Forms app: las del principal excepto `get_submissions`, más `display_form`, `list_submissions`, `create_submission`, `get_embed_code`, `get_teams`. Sign app: `search`, `list_submissions`, `create_sign_document`, `edit_sign_document`, `display_sign_document`, `update_sign_document_content`, `get_signers`, `update_signer`, `send_for_signature`, `get_signing_status`, `get_signing_links`, `get_teams`. Apps app: `search`, `fetch`, `create_app`, `edit_app`, `get_teams`. Algunos nombres se repiten entre servers — `search` busca formularios en el principal, documentos en Sign y apps en Apps — cada tool opera sobre el producto de su server.

Gotchas verbatim de la doc: *"Previews and tables only show in tools that support MCP Apps"*; en Claude, Forms/Sign/Apps son plugins separados y hay que iniciar sesión con la misma cuenta de Jotform en cada uno para que compartan formularios; la lista en vivo se consulta con `tools/list` y hay que usar el schema del server al que estás conectado; organizaciones que limitan conexiones piden que un admin instale Jotform; HTTP 429 ante exceso de requests.

Licencia: MIT (LICENSE del repo oficial `github.com/jotform/mcp-server`). Fuente: README + `docs/mcp/endpoints.md` + `docs/mcp/tools.md` + `docs/mcp/authentication.md` del repo oficial, leídos verbatim en esta corrida; docs oficiales del producto en `jotform.com/developers/mcp/?tab=mcp`.
