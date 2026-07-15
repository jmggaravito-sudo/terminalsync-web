---
name: Stripe
logo: /connectors/stripe.svg
category: automation
status: available
simpleTitle: "Preguntale a tu IA por tus pagos — y dejá que actúe sobre ellos"
simpleSubtitle: "Server oficial de Stripe: clientes, facturas, pagos, suscripciones y reembolsos."
devTitle: "Stripe MCP Connector"
devSubtitle: "Official @stripe/mcp server (stripe/ai): tools over the Stripe API, secret-key scoped."
ctaUrl: "https://stripe.com"
tokenHelpUrl: "https://dashboard.stripe.com/apikeys"
manifest:
  mcpServers:
    stripe:
      command: npx
      args: ["-y", "@stripe/mcp", "--tools=all"]
      env:
        STRIPE_SECRET_KEY: "${SECRET:STRIPE_SECRET_KEY}"
affiliate: false
tagline: "Tus pagos, al alcance del agente"
originalAuthor: "Stripe"
originalAuthorUrl: "https://github.com/stripe/ai"
license: "MIT"
licenseUrl: "https://github.com/stripe/ai/blob/main/LICENSE"
---
**Stripe** es la plataforma de pagos detrás de millones de negocios — checkout, suscripciones, facturación y todo el lado del dinero de tu producto. El conector oficial, publicado por Stripe, deja que el agente trabaje directo sobre tu cuenta: buscar clientes, leer facturas y pagos, crear productos y precios, administrar suscripciones y emitir reembolsos. La lista completa y siempre actualizada de tools está en la [documentación de Stripe MCP](https://docs.stripe.com/mcp).

Le preguntás *"¿cuánto facturamos el mes pasado?"* y lee tus datos de Stripe y te responde. Le pedís *"creá un producto Pro de $29 por mes y dame un link de pago"* y lo arma solo — sin tocar el panel. Habla con Stripe usando tu clave secreta, así que puede hacer todo lo que vos podés hacer desde tu propia cuenta.

### Qué le podés pedir

- *"¿Cuántas suscripciones activas tenemos ahora, y cuánto ingreso recurrente es eso por mes?"*
- *"Buscá al cliente con el email ana@empresa.com y mostrame sus últimas tres facturas."*
- *"Creá un producto 'Consultoría 1h' a $80, generá un link de pago y dame la URL."*

### Qué token necesitás

Necesitás una **clave secreta de API** de Stripe — la que permite que un software actúe sobre tu cuenta.

1. Andá a [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys).
2. Arrancá con una clave en **modo test** (`sk_test_…`) mientras la probás — toca datos falsos, no se mueve nada real. Copiala.
3. Pegala cuando el Lab te pida `STRIPE_SECRET_KEY`. Se guarda cifrada en tu Keychain.

La clave secreta puede mover plata de verdad cuando pasás a una clave live (`sk_live_…`), así que tratala como una contraseña. Tip: creá una **clave restringida** en el panel para dar solo los permisos que el agente necesita (por ejemplo, solo lectura de pagos) en vez de una clave con acceso total.

--- dev ---

`@stripe/mcp` (Stripe, oficial — repo `stripe/ai`, `tools/modelcontextprotocol`) corre con `npx -y @stripe/mcp --tools=all`. La auth es una clave secreta de Stripe, pasada como la env var `STRIPE_SECRET_KEY` o el flag `--api-key=`; el manifest de acá usa la env var para que la clave quede en Keychain. `--stripe-account=<acct>` apunta a una cuenta conectada. El flag `--tools=` selecciona qué grupos de tools exponer (`all`, o un subconjunto separado por comas).

Las tools mapean sobre la superficie de la API de Stripe (customers, products, prices, payment links, invoices, subscriptions, refunds, disputes, balance y búsqueda de documentación); la lista autoritativa y versionada está en docs.stripe.com/mcp#tools. Acotá el riesgo con una **clave restringida** (la clave de Stripe con permisos read/write por recurso) y arrancá en **modo test** — la misma semántica de la clave que limita cualquier integración limita al agente.

Terminal Sync mantiene la clave secreta en Keychain vía `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: github.com/stripe/ai.
