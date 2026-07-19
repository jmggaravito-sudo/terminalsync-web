---
name: Shopify
logo: /connectors/shopify.svg
category: automation
status: available
simpleTitle: "Preguntale a tu IA por tu tienda de Shopify"
simpleSubtitle: "Conector propio de Terminal Sync sobre la Admin API oficial de Shopify: ventas, pedidos, productos y clientes."
devTitle: "Shopify Admin GraphQL Connector"
devSubtitle: "Servidor MCP first-party sobre la Admin GraphQL API oficial de Shopify."
ctaUrl: "https://www.shopify.com"
tokenHelpUrl: "https://help.shopify.com/en/manual/apps/app-types/custom-apps"
affiliate: false
tagline: "Tu tienda de Shopify, al alcance del agente"
originalAuthor: "Terminal Sync"
originalAuthorUrl: "https://terminalsync.ai"
license: "proprietary"
licenseUrl: "https://terminalsync.ai"
---
**Shopify** es la plataforma detrás de millones de tiendas online. Este conector es **propio de Terminal Sync**: hablamos con la **Admin GraphQL API oficial** de Shopify para que tu asistente lea tu negocio y te responda en lenguaje natural — sin que tengas que entrar al panel.

A diferencia de otras integraciones, **no se instala pegando un paquete**: se conecta **desde adentro de la app**, en **Ajustes → Integraciones → Shopify**. Pegás la dirección de tu tienda y una clave de acceso que generás en Shopify, le das "Probar conexión", y listo. La clave se guarda **cifrada en tu computadora** (nunca en un archivo a la vista).

Le preguntás *"¿cuánto vendí esta semana?"* y lee tus datos de Shopify y te contesta. Le pedís *"mostrame los pedidos sin enviar"* y te arma la lista. También puede **hacer cambios seguros** — como crear un producto (queda en borrador) o publicar/despublicar uno — pero **siempre te muestra primero qué va a hacer y espera tu OK** antes de tocar nada. Nunca cambia tu tienda sin que confirmes.

### Qué le podés pedir

- *"¿Cuántas ventas y cuánta plata hicimos esta semana?"*
- *"Mostrame los últimos 10 pedidos y cuáles faltan enviar."*
- *"¿Qué productos tengo activos y con cuánto stock?"*
- *"Buscá al cliente con el email ana@empresa.com y cuántas compras hizo."*

### Qué necesitás

Necesitás dos cosas de tu cuenta de Shopify:

1. **La dirección de tu tienda** — algo como `mi-tienda.myshopify.com`.
2. **Una clave de acceso (Admin API access token)** — se genera creando una *"custom app"* en tu Shopify, con permisos de lectura de pedidos, productos y clientes. La guía oficial está en [help.shopify.com](https://help.shopify.com/en/manual/apps/app-types/custom-apps).

Después vas a **Ajustes → Integraciones → Shopify** en Terminal Sync, pegás las dos cosas y conectás. La clave viaja cifrada entre tus computadoras junto con el resto de tu perfil.

--- dev ---

Conector **first-party**: Terminal Sync bundlea su propio servidor MCP (`terminalsync-shopify-mcp`, sidecar vía Tauri `externalBin`) que habla la **Admin GraphQL API** de Shopify. No es un paquete npm de terceros ni un servidor remoto — es código nuestro sobre la API oficial, elegido porque Shopify no publica un servidor MCP operador para el dueño de la tienda (`@shopify/dev-mcp` es solo para documentación/schema).

**Config (inyectada por la app desde el almacén cifrado):** `SHOPIFY_STORE_DOMAIN` (ej. `mi-tienda.myshopify.com`), `SHOPIFY_ADMIN_ACCESS_TOKEN` (`shpat_…`, guardado en el llavero del sistema, nunca en un archivo de config), y `SHOPIFY_API_VERSION` opcional.

**Tools de lectura:** `shopify_shop_info`, `shopify_list_orders`, `shopify_sales_summary`, `shopify_list_products`, `shopify_search_customers`. **Tools de escritura (con confirm gate de dos pasos):** `shopify_create_product` (crea en BORRADOR), `shopify_set_product_status` (publica/despublica). Sin `confirm` devuelven un PREVIEW y no mutan nada; el agente muestra el preview y recién con `confirm: true` (tras aprobación del usuario) aplican. Más writes (precio, inventario, fulfillment) pueden agregarse con el mismo patrón.

La conexión se hace desde **Ajustes → Integraciones → Shopify** (verifica la tienda antes de guardar y cablea el servidor en Claude/Codex/Gemini). Fuente: Admin GraphQL API oficial de Shopify (`help.shopify.com`, `shopify.dev`).
