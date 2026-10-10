---
name: Mercado Pago
logo: /connectors/mercado-pago.svg
category: automation
status: available
simpleTitle: "Pregúntale a tu cuenta de Mercado Pago qué cobraste"
simpleSubtitle: "MCP oficial de Mercado Pago: búsqueda de pagos y órdenes e historial de notificaciones, por OAuth y sin pegar ninguna API key."
devTitle: "Conector MCP de Mercado Pago"
devSubtitle: "MCP oficial hospedado de Mercado Pago (mcp.mercadopago.com) — búsqueda de pagos y órdenes, notificaciones y tooling de integración sobre OAuth."
ctaUrl: "https://www.mercadopago.com"
tokenHelpUrl: "https://github.com/mercadopago/mercadopago-claude-marketplace"
manifest:
  mcpServers:
    mercado-pago:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.mercadopago.com/mcp"]
affiliate: false
tagline: "Tus cobros de Mercado Pago, al alcance del agente"
originalAuthor: "Mercado Pago (MercadoLibre S.R.L.)"
originalAuthorUrl: "https://github.com/mercadopago/mercadopago-claude-marketplace"
license: "Apache-2.0"
licenseUrl: "https://github.com/mercadopago/mercadopago-claude-marketplace/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-10T07:17:04.622Z"
verifiedPackageVersion: null
---
**Mercado Pago** es la plataforma de pagos de Mercado Libre y una de las formas principales en que los negocios de América Latina cobran y reciben dinero: está presente en Argentina, Brasil, México, Chile, Colombia, Perú y Uruguay. El server MCP oficial de Mercado Pago le da a tu agente acceso directo a los pagos y las órdenes que pasan por tu cuenta, con el login de tu propia cuenta — sin pegar ninguna API key en TerminalSync.

Le preguntas *"¿Entró el pago del pedido de ayer?"* y el agente busca entre tus pagos y te trae la respuesta. *"¿En qué estado está la orden 1234?"* y la lee directo de tu cuenta. *"Muéstrame las notificaciones de pagos de hoy"* y revisa el historial de notificaciones para contarte qué reportó Mercado Pago. Además de las consultas, el server también lleva las herramientas con las que Mercado Pago integra los pagos en apps y sitios web — webhooks, aplicaciones, credenciales, usuarios de prueba, chequeos de calidad — que alguien técnico de tu equipo puede usar por la misma conexión.

### Qué le puedes pedir

- *"¿Entró el pago del pedido de ayer?"*
- *"¿En qué estado está la orden 1234567890?"*
- *"Muéstrame las notificaciones de pagos de hoy."*
- *"Busca los pagos de esta semana y dime cuáles siguen pendientes."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Mercado Pago:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Mercado Pago en tu navegador y te pide autorizar el acceso.
3. Apruébalo con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta tenga permitido. La documentación oficial vive en [github.com/mercadopago/mercadopago-claude-marketplace](https://github.com/mercadopago/mercadopago-claude-marketplace).

**Aviso honesto:** es un **server hospedado por Mercado Pago** (`https://mcp.mercadopago.com/mcp`), no algo que corre en tu computadora. Lo que el agente puede ver o hacer queda acotado por los permisos de tu cuenta de Mercado Pago. El kit oficial que publica este server está marcado **Beta** por el propio Mercado Pago — en desarrollo activo, con interfaces que pueden cambiar entre versiones. Y conviene ser claro sobre para qué sirve: las tools documentadas consultan pagos y órdenes, revisan notificaciones y administran la parte de integración (aplicaciones, webhooks, usuarios de prueba, chequeos de calidad); las tools documentadas del server no incluyen cobrar, reembolsar ni mover dinero real.

--- dev ---

Mercado Pago (MercadoLibre S.R.L.) publica un **server MCP remoto oficial** en `https://mcp.mercadopago.com/mcp`, documentado en su org oficial de GitHub a través del repo del plugin oficial de Claude Code (`github.com/mercadopago/mercadopago-claude-marketplace` — README más `plugins/mercadopago/.mcp.json`, que declara el server como `"type": "http"` en esa URL). La auth es OAuth: *"No Access Token or keychain setup is required — the MCP server handles authentication via OAuth."* El README agrega que el server *"is remote and does not require a local Node.js server"* y lista 7 países soportados: Argentina, Brasil, México, Chile, Colombia, Perú y Uruguay.

TerminalSync hace de puente localmente con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.mercadopago.com/mcp
```

**Smoke (2026-10-10):** un `initialize` sin credenciales devuelve 401; `https://mcp.mercadopago.com/.well-known/oauth-authorization-server` publica `registration_endpoint` (registro dinámico de clientes, PKCE `S256`, cliente público), y el puente `mcp-remote` completó el registro dinámico y llegó a la pantalla de autorización de Mercado Pago (`auth.mercadopago.com/mcp/authorization`). Completar el login necesita una cuenta real, así que el flujo quedó verificado hasta la pantalla de consentimiento — a diferencia de `zoom`, cuyo OAuth no permite registro dinámico, este login sí es alcanzable por el puente.

Tools MCP documentadas, verbatim de la tabla "When MCP connection is required" del README:

- `search_payments`, `get_payment`, `get_order` — buscar o verificar un pago / una orden
- `save_webhook`, `notifications_history` — registrar o diagnosticar webhooks
- `application_list`, `get_credentials` — listar aplicaciones o importar credenciales; `create_application` — crear una aplicación
- `search_documentation` — llenar huecos no cubiertos por el `llms.txt` oficial o las referencias incluidas
- `create_test_user`, `add_money_test_user` — crear usuarios de prueba o cargarles fondos
- `quality_checklist`, `quality_evaluation`, `form_homologation` — correr los chequeos oficiales de calidad o la homologación
- `authenticate`, `complete_authentication` — solo bootstrap de OAuth, "not used as pre-flight checks"

**Divulgación:** el repo está marcado **Beta** (*"This project is under active development. APIs, skill structures, and plugin interfaces may change between versions. Use in production integrations at your own discretion."*). El asistente de integración y las skills (Checkout Pro, Bricks, QR, Point, Suscripciones…) pertenecen al plugin de Claude Code de Mercado Pago, no a este server MCP — la superficie del server es la lista de tools de arriba. La disponibilidad de productos *"still depends on country, account eligibility, commercial enablement, and the selected API."*

Licencia: Apache-2.0 (NOTICE del repo — "Copyright (c) 2026 Mercado Pago (MercadoLibre S.R.L.)"). Fuente: github.com/mercadopago/mercadopago-claude-marketplace.
