---
name: PayPal
logo: /connectors/paypal.svg
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Pregúntale a tu cuenta de PayPal cómo va tu dinero"
simpleSubtitle: "MCP oficial de PayPal: transacciones, facturas, disputas y suscripciones por OAuth, sin pegar ninguna API key."
devTitle: "Conector MCP de PayPal"
devSubtitle: "MCP oficial hospedado de PayPal (mcp.paypal.com/sse) — facturas, órdenes, reembolsos, disputas y suscripciones sobre OAuth."
ctaUrl: "https://www.paypal.com"
tokenHelpUrl: "https://developer.paypal.com/tools/mcp-server/"
manifest:
  mcpServers:
    paypal:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.paypal.com/sse"]
affiliate: false
tagline: "Tus cobros y facturas de PayPal, al alcance del agente"
originalAuthor: "PayPal (PayPal Holdings, Inc.)"
originalAuthorUrl: "https://developer.paypal.com/tools/mcp-server/"
license: "proprietary"
licenseUrl: "https://www.paypal.com/legalhub/useragreement-full"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:40:27.000Z"
verifiedPackageVersion: null
---
**PayPal** es una de las formas más usadas por los negocios para enviar y recibir dinero: el propio PayPal dice que atiende negocios en casi 200 mercados. El server MCP oficial de PayPal conecta a tu agente directamente con tu cuenta de comercio: transacciones, facturas, disputas, suscripciones y más, con el login de tu propia cuenta — sin pegar ninguna API key en TerminalSync.

Le preguntas *"Muéstrame las transacciones de esta semana y márcame las que siguen pendientes"* y el agente las trae directo de tu cuenta. *"¿Qué facturas siguen sin pagar?"* y revisa tu lista de facturas en segundos. Está pensado para las preguntas reales de un dueño de negocio: si entró el dinero, quién no ha pagado, de qué trata esta disputa y qué planes de suscripción tengo activos. Y cuando le pides algo que escribe en tu cuenta — crear y enviar una factura, mandar un recordatorio de pago — el agente te muestra qué va a hacer y te pide confirmación antes de ejecutarlo.

### Qué le puedes pedir

- *"Muéstrame las transacciones de esta semana y márcame las que siguen pendientes."*
- *"¿Qué facturas siguen sin pagar? Mándale un recordatorio al cliente que va tarde."*
- *"Crea una factura de PayPal por $850 por los honorarios de noviembre y envíala al cliente."*
- *"¿Hay alguna disputa abierta? Muéstrame los detalles."*
- *"Muéstrame mis planes de suscripción y cuánto cobra cada uno."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de PayPal:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de PayPal en tu navegador y te pide autorizar el acceso — la propia doc de PayPal describe el flujo: iniciar sesión en PayPal y luego "Authorize the client to work with the MCP server".
3. Apruébalo con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta tenga permitido. La guía oficial de configuración está en [developer.paypal.com/tools/mcp-server](https://developer.paypal.com/tools/mcp-server/).

**Aclaración honesta:** es un **server hospedado por PayPal** (`https://mcp.paypal.com/sse`), no algo que corre en tu computadora. Lo que el agente puede ver o hacer queda acotado por lo que apruebes al iniciar sesión con tu cuenta de PayPal. Algunas de sus tools ejecutan acciones reales en tu cuenta — enviar facturas, emitir reembolsos, aceptar el reclamo de una disputa — así que conviene leer qué va a hacer el agente antes de aprobar. La documentación del MCP de PayPal no declara requisitos de plan ni de país.

--- dev ---

PayPal (PayPal Holdings, Inc.) publica un **server MCP remoto oficial** en `https://mcp.paypal.com/sse` (SSE), documentado en developer.paypal.com/tools/mcp-server/. También documenta un endpoint Streamable HTTP (`/http`) — en el smoke de esta corrida respondió 404 sin autenticar, así que el manifest usa `/sse`, el endpoint del propio ejemplo oficial de setup con `mcp-remote`. Existe además un server de sandbox en `https://mcp.sandbox.paypal.com`.

La autenticación es un login OAuth en el navegador: la doc de PayPal dice que el cliente *"sends you to the PayPal login page"*, haces *"Log into PayPal"* y luego *"Authorize the client to work with the MCP server"*. PayPal también documenta que *"With remote MCP server, users can continue their tasks across devices with a single login after authentication"* y una alternativa Bearer con client ID/secret del Developer Dashboard. TerminalSync usa el flujo OAuth (sin secret que pegar); según la sección de troubleshooting de PayPal, el puente guarda los tokens del login en `~/.mcp-auth`.

TerminalSync hace de puente localmente con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.paypal.com/sse
```

**Smoke (2026-10-16):** `GET /sse` sin token devuelve 401 (`invalid_token`); `https://mcp.paypal.com/.well-known/oauth-authorization-server` publica `issuer https://mcp.paypal.com` con `/authorize`, `/token` y `/register` (registro dinámico de clientes), PKCE `S256` y grants `authorization_code` + `refresh_token`. El puente `mcp-remote` completó el registro dinámico de cliente y llegó a la pantalla de autorización de PayPal (verificado con `node scripts/smoke-remote-login.mjs --slugs paypal`; completar el login necesita una cuenta real de PayPal). `POST /http` sin autenticar respondió 404.

Tools documentadas, verbatim del catálogo oficial de agent-tools de PayPal (mayo 2026):

- **Facturas** — `create_invoice`, `list_invoices`, `get_invoice`, `send_invoice`, `send_invoice_reminder`, `cancel_sent_invoice`, `generate_invoice_qr_code`
- **Pagos** — `create_order`, `get_order`, `pay_order`, `create_refund`, `get_refund`
- **Disputas** — `list_disputes`, `get_dispute`, `accept_dispute_claim`
- **Catálogo** — `create_product`, `list_product`, `show_product_details`
- **Suscripciones** — `create_subscription`, `create_subscription_plan`, `list_subscription_plans`, `show_subscription_details`, `show_subscription_plan_details`, `update_subscription`, `cancel_subscription`
- **Reportes** — `get_merchant_insights`, `list_transaction`
- **Seguimiento de envíos** — `create_shipment_tracking`, `get_shipment_tracking`, `update_shipment_tracking`
- **Solo remoto (comercio)** — `search_product`, `create_cart`, `checkout_cart`; según PayPal hoy cubren solo gift cards y requieren el header `x-feature-flags: commerce:true` contra `https://mcp.paypal.com/sse`

**Divulgación:** es un **server hospedado por PayPal**, no algo que corre en tu computadora. Lee **y escribe** a través de tu cuenta — enviar facturas, emitir reembolsos, aceptar reclamos de disputa y crear/cancelar suscripciones son acciones reales; el alcance del agente queda acotado por lo que apruebes al iniciar sesión. La doc del MCP de PayPal no declara requisitos de plan ni de país. PayPal también publica una variante local (`npx @paypal/mcp`, repo github.com/paypal/paypal-mcp-server, Apache-2.0) que toma un `PAYPAL_ACCESS_TOKEN` de corta vida (*"Valid for 8 hours"* en producción, 3–8 horas en sandbox) — esa carga de re-pegar el token cada pocas horas es justo lo que evita el flujo OAuth del server hospedado, y por eso este conector shipea el remoto.

Licencia: términos propietarios de SaaS (paypal.com/legalhub/useragreement-full). Fuente: developer.paypal.com/tools/mcp-server/ y developer.paypal.com/ai-tools/agent-tools/.
