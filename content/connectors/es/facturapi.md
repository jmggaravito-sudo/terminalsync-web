---
name: Facturapi
logo: /connectors/facturapi.png
category: automation
markets: ["MX"]
status: available
simpleTitle: "Tu facturación CFDI, por chat"
simpleSubtitle: "Tu AI consulta clientes y facturas de Facturapi, y crea borradores o facturas cuando tú lo confirmas."
devTitle: "Facturapi MCP Connector"
devSubtitle: "MCP comunitario de TerminalSync sobre la API v2 de Facturapi: clientes, productos y facturas CFDI 4.0."
ctaUrl: "https://www.facturapi.io"
tokenHelpUrl: "https://dashboard.facturapi.io/integration/apikeys"
manifest:
  mcpServers:
    facturapi:
      command: npx
      args: ["-y", "@terminalsync/facturapi-mcp"]
      env:
        FACTURAPI_SECRET_KEY: "${SECRET:FACTURAPI_SECRET_KEY}"
affiliate: false
tagline: "Tus facturas de México, a mano"
originalAuthor: "Comunidad TerminalSync"
originalAuthorUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/tree/main/packages/facturapi"
license: "MIT"
licenseUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/blob/main/packages/facturapi/LICENSE"
marketplaceSource: "ts-curated"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "ok"
aiToolsCount: 6
aiReadOnlyTools: 4
verifiedAt: "2026-10-26T22:07:24.531Z"
verifiedPackageVersion: "0.1.0"
---
Si facturas en México con **Facturapi**, este conector le deja a tu AI la parte burocrática: buscar el dato que necesitas y armar la factura.

Pregúntale *"¿cuántas facturas emití este mes?"* y te lo dice. Pídele *"crea una factura para el cliente RFC XABI010101, con dos horas de consultoría, forma de pago transferencia"* y la arma; si usas una llave de pruebas no llega al SAT, y con llave de producción tu AI te pide confirmar expresamente antes de timbrar, porque timbrar **no se deshace**.

### Qué le puedes pedir

- *"¿Cuántas facturas emití este mes y por cuánto total?"*
- *"Busca al cliente con RFC XABI010101 y muéstrame su información."*
- *"Crea un borrador de factura para XABI010101: dos horas de consultoría a $850 más IVA."*
- *"Crea la factura final de ese borrador." (con llave de producción te pedirá confirmar el timbrado)*
- *"Dame los datos del cliente María López para revisar su régimen fiscal."*

### Cómo se conecta

Con tu **Secret Key de Facturapi** (dashboard → API Keys):

- La llave `sk_test_...` para probar (las facturas de prueba no llegan al SAT ni consumen timbres) o `sk_live_...` para producción.
- Se guarda cifrada en los Secretos de TerminalSync, no en el chat ni en el conector.

### Qué cubre y qué no

- **Lee** (sin pedirte permiso cada vez): clientes y facturas con sus ítems.
- **Escribe con tu confirmación**: crea clientes (Facturapi valida el RFC contra el SAT) y facturas. Con llave de producción, timbrar exige una confirmación aparte porque un CFDI timbrado solo se corrige con una factura de egreso; con `status: draft` no hace falta. Soporta la clave de idempotencia de Facturapi para no duplicar al reintentar.
- **No cubre**: retenciones, recibos, complementos de pago, descarga masiva ni cancelaciones (facturapi las maneja por su panel).
- Es un proyecto de la comunidad de TerminalSync: **no es de Facturapi ni está avalado por ellos**. Las escrituras se verificaron el 2026-10-27 con una cuenta de pruebas: se creó un cliente y una factura CFDI timbrada en modo test (no llega al SAT); quedaron como registros de prueba en esa cuenta.
