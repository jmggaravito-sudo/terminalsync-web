---
name: Siigo
logo: /connectors/siigo.svg
category: productivity
status: available
simpleTitle: "Pregúntale a tu Siigo en lenguaje normal"
simpleSubtitle: "\"¿Qué facturas le emitimos a este cliente?\" \"¿Tenemos stock de este producto?\" — tu IA lee tu Siigo."
devTitle: "Conector MCP de Siigo (comunidad)"
devSubtitle: "MCP de solo lectura sobre la API oficial de Siigo Colombia — clientes, facturas de venta, productos y servicios."
ctaUrl: "https://www.siigo.com"
tokenHelpUrl: "https://developers.siigo.com/docs/siigoapi/autenticacion/autenticacion"
manifest:
  mcpServers:
    siigo:
      command: npx
      args: ["-y", "siigo-mcp"]
      env:
        SIIGO_USERNAME: "${SECRET:SIIGO_USERNAME}"
        SIIGO_ACCESS_KEY: "${SECRET:SIIGO_ACCESS_KEY}"
affiliate: false
tagline: "Tus facturas y clientes de Siigo, a una pregunta"
originalAuthor: "Juan Manuel Garavito (build de la comunidad, no es de Siigo)"
originalAuthorUrl: "https://developers.siigo.com/docs/siigoapi/"
license: "MIT"
marketplaceSource: "community"
---
Si tu negocio en Colombia lleva la contabilidad en **Siigo**, este conector deja que tu IA consulte datos sin que abras la aplicación: quién es un cliente, qué le facturaste, cuánto cuesta un producto y cuánto stock queda. Es **solo lectura** — no puede crear, editar ni anular nada.

Pregúntale *"Muéstrame las facturas que le emitimos al NIT 900123456 este mes"* y las lista con totales y saldo. Pregúntale *"¿Cuál es el precio y el stock del producto X?"* y lo lee de tu catálogo. Pregúntale *"¿Qué clientes se crearon la semana pasada?"* y filtra por fecha.

### Qué le puedes pedir

- *"Lista las facturas de venta de los últimos 7 días y dime el total."*
- *"Busca al cliente con identificación 900123456 y muéstrame sus datos de contacto."*
- *"¿Cuáles son los productos activos y sus precios?"*
- *"Abre la factura FV-1-123 y dime qué está sin pagar."*

### Qué necesitas

Siigo se conecta con **credenciales de API** de tu propia cuenta de Siigo Nube:

1. En Siigo Nube abre **Alianzas** en el menú izquierdo y pulsa **Mi Credencial API** para obtener tu usuario y tu clave de acceso ([cómo lo explica Siigo](https://developers.siigo.com/docs/siigoapi/autenticacion/autenticacion)).
2. Pégalas cuando el Lab te pida `SIIGO_USERNAME` y `SIIGO_ACCESS_KEY`. Quedan guardadas cifradas en tu Keychain — nunca se escriben en el chat.

**Divulgación honesta:** este conector es un **build de la comunidad**, **no está publicado ni avalado por Siigo**, y está en **beta**: se probó con respuestas simuladas, todavía no contra una cuenta real de Siigo. Cada request identifica el software ante Siigo con el header `Partner-Id` que Siigo exige. Siigo puede bloquear temporalmente a un usuario API cuyos requests fallan en su mayoría, así que el conector nunca reintenta a ciegas. Puede leer lo que tu credencial de API pueda leer en tu empresa.

--- dev ---

`siigo-mcp` es un servidor MCP stdio (Node ≥ 20) sobre la API oficial de Siigo en `https://api.siigo.com`. Se autentica con `POST /auth` (`username` + `access_key`), guarda el token Bearer de 24 horas y lo renueva 5 minutos antes, y envía el header obligatorio `Partner-Id` (por defecto `TerminalSync`, configurable con `SIIGO_PARTNER_ID`).

Herramientas (todas `readOnlyHint`): `siigo_list_customers` (`GET /v1/customers`), `siigo_list_invoices` (`GET /v1/invoices`), `siigo_get_invoice` (`GET /v1/invoices/{id}`), `siigo_list_products` (`GET /v1/products`), `siigo_get_product` (`GET /v1/products/{id}`). Las de listado aceptan `page` y `page_size` (tope 100) más los filtros que documenta Siigo.

Un `401` dispara una reautenticación y un reintento; nada más se reintenta.

Licencia: MIT. Endpoints y parámetros: developers.siigo.com/docs/siigoapi.
