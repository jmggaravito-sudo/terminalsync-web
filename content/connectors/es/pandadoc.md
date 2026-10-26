---
name: PandaDoc
logo: /connectors/pandadoc.svg
category: productivity
markets: ["GLOBAL"]
status: available
simpleTitle: "Tus propuestas y contratos, enviados y firmados"
simpleSubtitle: "Server MCP oficial de PandaDoc: crea, envía y hace seguimiento de propuestas, cotizaciones y facturas por OAuth."
devTitle: "Conector MCP de PandaDoc"
devSubtitle: "MCP oficial hospedado de PandaDoc (mcp.pandadoc.com/v1/mcp) — documentos, cotizaciones, aprobaciones y facturas."
ctaUrl: "https://www.pandadoc.com"
tokenHelpUrl: "https://github.com/PandaDoc/mcp-server-guide"
manifest:
  mcpServers:
    pandadoc:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.pandadoc.com/v1/mcp"]
affiliate: false
tagline: "Propuestas y contratos que salen solos"
originalAuthor: "PandaDoc"
originalAuthorUrl: "https://github.com/PandaDoc/mcp-server-guide"
license: "MIT"
licenseUrl: "https://github.com/PandaDoc/mcp-server-guide/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-26T15:15:00.000Z"
verifiedPackageVersion: null
---
**PandaDoc** es la plataforma con la que los negocios arman propuestas, cotizaciones, contratos y facturas, los envían a firma electrónica y hacen el seguimiento de cada documento. El conector oficial de PandaDoc es un **server MCP hospedado**: en su descripción oficial, *"Official PandaDoc MCP server and AI plugins · Hosted by PandaDoc · OAuth sign-in"*, y lo dice sin rodeos: *"PandaDoc hosts the server; you do not need to run one locally."*

Qué significa en la práctica: tu agente puede acompañar el ciclo completo de un documento —armar propuestas y cotizaciones, mandar NDAs y acuerdos de onboarding a firma, pasar aprobaciones internas, entregar la factura y ver quién ya firmó—. La guía oficial organiza ese trabajo en **9 flujos guiados**: engagement tracker (avance de firmas), follow-up list (lista de seguimiento), signing velocity (ritmo de firma), contract register (registro de contratos), NDA fast send, quote builder (armador de cotizaciones), approval send (aprobaciones internas), onboarding agreement (acuerdo de onboarding) e invoice handoff (entrega de la factura a cobros).

### Qué le puedes pedir

- *"Arma una propuesta con nuestros precios estándar y déjala lista para enviar al cliente."*
- *"Mándale el NDA a este proveedor y avísame cuando quede firmado."*
- *"¿Quién todavía no firmó el contrato que mandé el lunes?"*
- *"Pasale la factura del proyecto al equipo de cobros."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa OAuth con tu cuenta de PandaDoc:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de PandaDoc en tu navegador. Al autorizar eliges tu workspace y qué puede usar el asistente: *"During authorization, select your workspace and choose what your assistant can access."*
3. Inicias sesión y apruebas el acceso. Lo que el agente puede hacer sigue tus propios permisos: *"Actions follow the access you grant and your existing PandaDoc permissions."*

**Aclaración honesta:** es un **server hospedado por PandaDoc** (`https://mcp.pandadoc.com/v1/mcp`), no algo que corre en tu computadora. Enviar un documento puede notificar a los destinatarios — *"Sending a document can notify its recipients"* — y el contenido de los documentos que devuelve pasa a formar parte de la conversación de tu asistente. Se aplican los límites de documentos y operaciones de PandaDoc. Y si tu cuenta vive en `app.pandadoc.eu`, tu cuenta usa el endpoint europeo `https://mcp.pandadoc.eu/v1/mcp`, no este.

--- dev ---

PandaDoc publica su server MCP como **server remoto/hospedado**, documentado en la guía oficial `github.com/PandaDoc/mcp-server-guide`. Endpoints: `https://mcp.pandadoc.com/v1/mcp` (global) y `https://mcp.pandadoc.eu/v1/mcp` (cuentas de `app.pandadoc.eu`), ambos Streamable HTTP. No hay paquete stdio local; el puente del catálogo es el patrón genérico de cliente que la propia guía documenta para clientes HTTP (`claude mcp add pandadoc --transport http https://mcp.pandadoc.com/v1/mcp`):

```
npx -y mcp-remote@latest https://mcp.pandadoc.com/v1/mcp
```

La auth es **OAuth por navegador** — *"OAuth sign-in"* — con selección de workspace en la autorización. La guía no publica una lista plana de tools: la superficie se organiza en 9 skills/workflows oficiales (`pandadoc-engagement-tracker`, `pandadoc-followup-list`, `pandadoc-signing-velocity`, `pandadoc-contract-register`, `pandadoc-nda-fast-send`, `pandadoc-quote-builder`, `pandadoc-approval-send`, `pandadoc-onboarding-agreement`, `pandadoc-invoice-handoff`) que cubren propuestas, cotizaciones, NDAs, aprobaciones internas, acuerdos de onboarding, registro de contratos, métricas de firma y entrega de facturas.

Divulgación: server hospedado que **lee y escribe** (envía documentos y puede notificar a los destinatarios); *"Returned document content becomes part of your assistant's conversation"*; se aplican *"PandaDoc document and operation limits"* (los rate limits del API de PandaDoc); cada conexión queda atada al workspace y a los permisos elegidos al autorizar.

Licencia: MIT (LICENSE del repo de la guía, publicado por la org oficial `PandaDoc`). Fuente: github.com/PandaDoc/mcp-server-guide (README oficial).
