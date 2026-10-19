---
name: Tiendanube
logo: /connectors/tiendanube.png
category: automation
markets: ["AR", "MX", "CL", "CO", "BR"]
status: available
simpleTitle: "Pregúntale a tu tienda de Tiendanube qué se vende y qué falta"
simpleSubtitle: "MCP oficial de Tiendanube: productos, stock, pedidos, clientes, cupones y promociones por OAuth, sin pegar ninguna API key."
devTitle: "Conector MCP de Tiendanube"
devSubtitle: "MCP oficial hospedado de Tiendanube/Nuvemshop (admin-mcp.tiendanube.com) — catálogo, stock, pedidos, cupones y promociones sobre OAuth."
ctaUrl: "https://www.tiendanube.com"
tokenHelpUrl: "https://nuvemshop.dev/ai-agents/admin-mcp"
manifest:
  mcpServers:
    tiendanube:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://admin-mcp.tiendanube.com/mcp"]
affiliate: false
tagline: "Tu tienda de Tiendanube, al alcance del agente"
originalAuthor: "Tiendanube (Nuvemshop)"
originalAuthorUrl: "https://nuvemshop.dev/ai-agents/admin-mcp"
license: "proprietary"
licenseUrl: "https://www.tiendanube.com/terminos"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-15T09:18:23.125Z"
verifiedPackageVersion: null
---
**Tiendanube** es la plataforma de comercio electrónico con la que los negocios de América Latina manejan su tienda online: catálogo, pedidos, clientes y promociones en un solo lugar. Opera en Argentina, México, Chile y Colombia como Tiendanube, y en Brasil como Nuvemshop. El server MCP oficial de Tiendanube le da a tu agente acceso directo a la administración de tu tienda — sin pegar ninguna API key en TerminalSync, solo con el login de la cuenta de tu tienda.

Le preguntas *"Muéstrame los pedidos de los últimos 7 días"* y el agente los trae directo de tu tienda. Le pides *"Crea un cupón BIENVENIDA10 con 10% de descuento"* y el cupón queda creado sin abrir el administrador. Además de consultar, el conector crea y actualiza productos, ajusta precios y stock en lote, publica o despublica productos, organiza categorías, arma promociones (incluido envío gratis) y revisa tus clientes — siempre sobre los datos reales de tu tienda.

### Qué le puedes pedir

- *"Muéstrame los pedidos de los últimos 7 días y dime cuáles siguen sin pagar."*
- *"¿Qué productos me quedan con menos de 5 unidades de stock?"*
- *"Actualiza el stock del producto 45678 a 100 unidades."*
- *"Crea un cupón BIENVENIDA10 con 10% de descuento para la primera compra."*
- *"¿Cuáles son mis promociones activas y cuáles dan envío gratis?"*

Antes de pedir al agente que cambie tu tienda, revisa y aprueba expresamente esa acción concreta. La [documentación oficial](https://nuvemshop.dev/en-US/ai-agents/mcps) describe indicaciones para que el agente decida cuándo preguntar; esto no acredita una pantalla de confirmación obligatoria del servidor. Conectar tu tienda no autoriza todas las escrituras.

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de la cuenta de tu tienda:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Tiendanube en tu navegador y te pide autorizar el acceso a tu tienda.
3. Apruébalo con tu cuenta — una conexión corresponde a una sola tienda, y el conector solo puede ver y hacer lo que esa cuenta tenga permitido. La guía oficial está en [nuvemshop.dev](https://nuvemshop.dev/ai-agents/admin-mcp).

**Tiendas de Brasil:** en Brasil la plataforma opera como Nuvemshop y tiene su propia dirección del mismo server, en portugués. El conector del catálogo usa la dirección de Tiendanube; la de Nuvemshop está documentada en la sección técnica de abajo.

**Aviso honesto:** es un **server hospedado por Tiendanube** (`https://admin-mcp.tiendanube.com/mcp`), no algo que corre en tu computadora. Lo que el agente puede ver o cambiar queda acotado por los permisos de la cuenta de tu tienda. El server gestiona datos de la tienda — catálogo, stock, pedidos, clientes, cupones, promociones y medios de pago y envío — y también incluye herramientas que borran (productos, categorías, cupones, promociones): esos borrados son irreversibles, y la propia documentación recomienda desactivar en lugar de borrar cuando quieras volver a usar algo. El uso tiene un límite de 200 llamadas por minuto por tienda.

--- dev ---

Tiendanube (Nuvemshop en Brasil) publica un **server MCP remoto oficial**, el Admin MCP, en su portal de desarrolladores ([nuvemshop.dev/ai-agents/admin-mcp](https://nuvemshop.dev/ai-agents/admin-mcp); overview en [/ai-agents/mcps](https://nuvemshop.dev/ai-agents/mcps)). Cada marca tiene su endpoint, con tools idénticas:

- Tiendanube (Argentina, México, Chile, Colombia; idioma por defecto es): `https://admin-mcp.tiendanube.com/mcp`
- Nuvemshop (Brasil; idioma por defecto pt-BR): `https://admin-mcp.nuvemshop.com.br/mcp`

El manifiesto del catálogo usa el endpoint de Tiendanube. La doc oficial declara el server utilizable con clientes MCP genéricos (además de publicarse como app de ChatGPT). La auth es OAuth con el login de la cuenta de la tienda: *"The connection uses OAuth: sign in with the store account and authorize access."* Cada conexión se vincula a una sola tienda (*"One connection = one store"*): la URL no incluye identificador de tienda — la autorización determina sobre qué tienda opera cada conexión.

TerminalSync hace de puente con el endpoint hospedado:

```
npx -y mcp-remote@latest https://admin-mcp.tiendanube.com/mcp
```

**Smoke (2026-10-15):** el puente `mcp-remote` llegó a la pantalla de autorización contra `admin-mcp.tiendanube.com` (el server responde 401 sin credenciales). El endpoint publica `/.well-known/oauth-authorization-server` con registro dinámico de clientes (`/register`, PKCE `S256`) y scopes por grupo de datos (`read_products`, `write_orders`, `read_customers`, `read_coupons`, `write_shipping`…); el endpoint gemelo de Nuvemshop publica el mismo discovery. Completar el login necesita una cuenta real de tienda, así que el flujo quedó verificado hasta la pantalla de consentimiento.

Son 28 tools en seis grupos; el comportamiento de cada una está tipado en la doc (lectura / escritura / destructiva):

- **Productos:** `search_products`, `list_products` (lectura); `create_product` (1 producto por llamada), `update_product`, `update_stock_and_price` (hasta 50 variantes), `update_visibility` (hasta 20 productos) (escritura); `delete_product`, `bulk_delete_products` (hasta 20) (destructivas).
- **Categorías:** `list_categories` (lectura); `create_category`, `assign_categories`, `update_category_visibility` (escritura); `delete_category` (destructiva, borra subcategorías en cascada).
- **Pedidos y clientes:** `list_orders` (filtros por estado, pago, envío, cliente, número y fecha), `list_customers` (lectura).
- **Cupones:** `list_coupons`, `get_coupon_details` (lectura); `create_coupon` (porcentual, valor fijo o envío gratis; campo `first_consumer_purchase` para primera compra), `update_coupon` (desactiva con `valid=false`) (escritura); `delete_coupon` (destructiva).
- **Promociones:** `get_promotions`, `get_free_shipping_promotions`, `get_promotions_by_products` (lectura); `create_promotion` (automática, sin código), `update_promotion` (activa/desactiva con `published`) (escritura); `delete_promotion` (destructiva).
- **Pago y envío:** `get_payment_methods`, `get_shipping_methods` (lectura; esta última puede calcular costos y plazos reales con los datos de un carrito).

**Límites (documentados):** 200 llamadas a tools por tienda en una ventana móvil de 60 segundos (cuenta `tools/call`, no `tools/list`; las conexiones que comparten tienda comparten el contador). Máximos por operación: `create_product` 1 producto — *"Admin MCP does not expose a bulk product creation tool"* —, `update_stock_and_price` 50 variantes, `update_visibility` y `bulk_delete_products` 20 productos, `list_products` 50 por página, `search_products` 10–20 resultados. La doc advierte no interpretar el límite como capacidad garantizada de crear 200 productos por minuto.

**Divulgación:** server hospedado que lee y escribe datos reales de la tienda; las tools `delete_*` son irreversibles y la doc recomienda desactivar cupones (`valid=false`) y promociones (`published=false`) en lugar de borrarlos. El Storefront MCP oficial (por tienda, `https://<dominio-de-la-tienda>/api/mcp`) es un server distinto, para acciones de compra del lado del cliente, y no forma parte de este conector. La página no menciona requisitos de plan.

Licencia: SaaS propietario (términos de uso, `tiendanube.com/terminos`). Fuente: nuvemshop.dev/ai-agents/admin-mcp.
