---
name: Xero
logo: /connectors/xero.svg
category: automation
status: available
simpleTitle: "Tu contabilidad, respondiendo en voz alta"
simpleSubtitle: "\"¿Quién me debe?\" \"¿Qué está vencido?\" \"¿Cómo nos fue el mes pasado?\" — tu IA lee tus libros por vos."
devTitle: "Conector MCP de Xero"
devSubtitle: "OAuth2 custom-connection sobre la Xero Accounting API — facturas, cuentas por cobrar vencidas, pagos, P&L, balance, contactos."
ctaUrl: "https://www.xero.com"
tokenHelpUrl: "https://developer.xero.com/documentation/guides/oauth2/custom-connections/"
manifest:
  mcpServers:
    xero:
      command: npx
      args: ["-y", "@xeroapi/xero-mcp-server"]
      env:
        XERO_CLIENT_ID: "${SECRET:XERO_CLIENT_ID}"
        XERO_CLIENT_SECRET: "${SECRET:XERO_CLIENT_SECRET}"
affiliate: false
tagline: "Facturas, plata por cobrar y P&L al alcance de la IA"
originalAuthor: "Xero"
originalAuthorUrl: "https://github.com/XeroAPI/xero-mcp-server"
license: "MIT"
licenseUrl: "https://github.com/XeroAPI/xero-mcp-server/blob/master/LICENSE"
---
La parte del negocio que nadie quiere abrir es la contabilidad. Quién te debe, qué debés vos, qué facturas están vencidas, si el mes pasado de verdad dio ganancia. Si llevás tus libros en **Xero**, este conector deja que tu IA los lea y te responda esas preguntas en palabras simples — sin armar reportes ni buscar entre columnas.

Preguntale *"¿quién me debe y cuánto?"* y te trae las cuentas por cobrar. Preguntale *"¿qué está vencido?"* y lista las facturas pasadas de fecha. Preguntale *"¿cómo nos fue el mes pasado?"* y lee tu estado de resultados. También puede armarte una factura o un presupuesto para que lo revises antes de mandarlo — nunca manda plata ni finaliza nada solo.

### Qué le podés pedir

- *"Listame las facturas impagas y decime cuáles están vencidas y por cuántos días."*
- *"¿Cuánto facturamos este mes contra el mes pasado?"*
- *"Armá una factura para la clienta María García, $450, por 'consultoría', a 15 días."*

### Qué necesitás

Xero se conecta con una **Custom Connection** — la forma de Xero de enlazar una app con los libros de una empresa. Es una configuración de una sola vez en el portal de desarrolladores de Xero:

1. Entrá a [developer.xero.com](https://developer.xero.com/documentation/guides/oauth2/custom-connections/) y creá una app **Custom Connection** para tu organización.
2. Agregá los permisos (scopes) que querés que tenga la IA — como mínimo `accounting.transactions` y `accounting.contacts` (lectura); sumá el scope de reportes de solo lectura para el P&L y el balance.
3. Copiá el **Client ID** y el **Client Secret** que te da y pegalos cuando el Lab te pida `XERO_CLIENT_ID` y `XERO_CLIENT_SECRET`.

Los dos valores quedan guardados cifrados en tu Keychain y sincronizados entre tus máquinas. La conexión está atada a tu única empresa, así que la IA solo ve tus libros — nada más.

> Aviso: las Custom Connections necesitan un plan pago de Xero y son el único paso de configuración realmente engorroso. Si estás en Latinoamérica y usás **Alegra** o **Siigo** en vez de Xero, esos todavía no tienen conector — avisanos y lo evaluamos. Mientras tanto, muchas de las preguntas de "facturas y presupuesto" también funcionan con el conector de **Google Sheets** si las llevás en una planilla.

--- dev ---

`@xeroapi/xero-mcp-server` (publicado por **Xero**, oficial) habla la Xero Accounting API por OAuth2. Tools verificadas contra el README del paquete:

- **Lectura**: `list-invoices`, `list-credit-notes`, `list-payments`, `list-aged-receivables-by-contact`, `list-aged-payables-by-contact`, `list-contacts`, `list-accounts`, `list-bank-transactions`, `list-items`, `list-quotes`, `list-tax-rates`, `list-organisation-details`, y reportes `list-profit-and-loss`, `list-report-balance-sheet`, `list-trial-balance` (más los `list-*` de payroll).
- **Escritura**: `create-invoice`, `create-payment`, `create-quote`, `create-credit-note`, `create-contact`, `create-bank-transaction`, `create-item`, y los `update-*` correspondientes.

La auth es OAuth2 vía **Custom Connections** (machine-to-machine, una organización por conexión): env `XERO_CLIENT_ID` + `XERO_CLIENT_SECRET`, opcional `XERO_SCOPES` (separados por espacio) para pisar los defaults. El server prueba primero los scopes V1 (bundled) y cae a V2 (granulares). Existe una alternativa `XERO_CLIENT_BEARER_TOKEN` que tiene precedencia si está seteada.

Terminal Sync guarda el client id/secret en tu Keychain, sincronizados cifrados entre máquinas con AES-256-GCM. Como los tools de create/update mutan registros contables reales, el escritorio los pasa por un paso de confirmación.

Licencia: MIT. Fuente: github.com/XeroAPI/xero-mcp-server.
