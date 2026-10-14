---
name: Shopify
logo: /connectors/shopify.svg
category: automation
markets: ["GLOBAL"]
status: soon
simpleTitle: "Tu tienda de Shopify, con tu IA — todavía no disponible"
simpleSubtitle: "Todavía no disponible en TerminalSync: Shopify no publica una dirección pública que podamos conectar."
devTitle: "Shopify (todavía no disponible)"
devSubtitle: "Sin dirección MCP oficial pública para conectar; el conector integrado se retiró."
ctaUrl: "https://www.shopify.com"
tokenHelpUrl: "https://help.shopify.com/en/manual/ai-powered-tools/connecting-ai-tools/shopify-connector-for-claude"
affiliate: false
tagline: "Shopify: todavía no disponible en TerminalSync"
originalAuthor: "Shopify"
originalAuthorUrl: "https://help.shopify.com/en/manual/apps/connecting-ai-tools"
license: "proprietary"
licenseUrl: "https://terminalsync.ai"
installableForAi: false
installableForAiReason: "no-manifest"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-09-19T12:19:33.156Z"
verifiedPackageVersion: null
---
**Shopify** todavía no está disponible en TerminalSync, y preferimos decirlo antes que prometer algo que no podemos cumplir.

Antes teníamos un conector integrado en la app. Ese conector integrado se **retiró el 2026-09-10**, así que **ya no existe el paso "Ajustes → Integraciones"** y esta página no lo ofrece. Hoy TerminalSync **no puede leer ni cambiar tu tienda de Shopify**.

### Qué le puedes pedir

- *Hoy, nada sobre tu tienda:* TerminalSync todavía no puede leer ni cambiar tus datos de Shopify.
- *"¿Cómo configuro las tarifas de envío en Shopify?"* — las preguntas generales funcionan, y la respuesta viene de conocimiento general, no de tu tienda.
- *"Aquí está la exportación de pedidos que bajé de Shopify — ¿qué productos se venden más?"* — tú exportas el archivo desde tu admin de Shopify y lo compartes en el chat.

### Por qué no está disponible

Los conectores de TerminalSync que funcionan con un simple login usan una **dirección oficial que publica el proveedor**. Para Shopify no encontramos una que podamos usar:

- Shopify sí ofrece conectores oficiales para dueños de negocio, pero se instalan **desde el directorio de conectores de ciertas herramientas de IA** (el centro de ayuda de Shopify describe el de Claude), y las páginas de Shopify no publican una dirección de servidor a la que TerminalSync pueda conectarse. Mira [la página de Shopify sobre conectar herramientas de IA](https://help.shopify.com/en/manual/apps/connecting-ai-tools).
- El MCP para desarrolladores de Shopify (`@shopify/dev-mcp`) es para quien **construye apps y temas**: trabaja con la documentación de Shopify y no usa el login de tu tienda. No sirve para preguntar por tus ventas o pedidos.
- Los servidores de storefront de Shopify son para **asistentes de compradores** que hablan con una tienda pública, no para que el dueño la administre.

Agregaremos Shopify apenas tenga una dirección oficial que podamos conectar con tu propio login, y actualizaremos esta página entonces.

--- dev ---

Estado: **bloqueado, no disponible**. El sidecar propio (`terminalsync-shopify-mcp`) y su flujo Ajustes → Integraciones se retiraron de la app el 2026-09-10; no hay manifest y ninguna de sus tools existe ya.

Investigado el 2026-10-14 contra fuentes oficiales: (1) Shopify Dev MCP / AI Toolkit (`shopify.dev/docs/apps/build/devmcp`, `shopify.dev/docs/apps/build/ai-toolkit`): corre local con `@shopify/dev-mcp`, no requiere autenticación, es documentación/schema/validación para desarrolladores; la gestión de la tienda pasa por el contexto autenticado de Shopify CLI, no por una URL MCP. (2) Storefront MCP (`shopify.dev/docs/apps/build/storefront-mcp`): `https://{shop}/api/mcp` y los endpoints UCP son por tienda y para compradores. (3) Conectores para comerciantes (`help.shopify.com/en/manual/ai-powered-tools/connecting-ai-tools/shopify-connector-for-claude`): se instalan desde el directorio de Claude y se aprueban en el admin de Shopify; la página no publica URL MCP, así que no se puede puentear con `mcp-remote` desde una dirección documentada.

Condición de desbloqueo: que Shopify documente una URL MCP remota pública para comerciantes en la que `node scripts/smoke-remote-login.mjs --slugs shopify` llegue al paso de autorización.
