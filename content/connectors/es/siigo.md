---
name: Siigo
logo: /connectors/siigo.svg
category: productivity
status: available
simpleTitle: "Pregúntale a tu Siigo en lenguaje normal"
simpleSubtitle: "\"¿Qué facturas le emitimos a este cliente?\" \"Crea este cliente.\" — tu IA lee y actualiza tu Siigo, y te pregunta antes."
devTitle: "Conector MCP de Siigo (comunidad)"
devSubtitle: "MCP sobre la API oficial de Siigo Colombia — consulta clientes, facturas y productos; crea clientes, productos y facturas."
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
Si tu negocio en Colombia lleva la contabilidad en **Siigo**, este conector deja que tu IA trabaje con ella sin que abras la aplicación: consultar quién es un cliente, qué le facturaste, cuánto cuesta un producto y cuánto stock queda — y, cuando se lo pides, crear un cliente, un producto o una factura. **Consultar corre solo; todo lo que escribe en tu contabilidad te pide confirmación antes.**

Pregúntale *"Muéstrame las facturas que le emitimos al NIT 900123456 este mes"* y las lista con totales y saldo. Pídele *"Crea un cliente para ACME SAS, NIT 900123456"* y prepara el registro y espera tu visto bueno antes de guardarlo en Siigo.

### Qué le puedes pedir

- *"Lista las facturas de venta de los últimos 7 días y dime el total."*
- *"Busca al cliente con identificación 900123456 y muéstrame sus datos de contacto."*
- *"¿Cuáles son los productos activos y sus precios?"*
- *"Crea un cliente para ACME SAS, NIT 900123456, y agrega el contacto Ana Pérez."*
- *"Crea el producto HORA-CONSULTORIA, de tipo servicio, y luego una factura a ACME por 3 horas — todavía no la envíes a la DIAN."*

### Qué necesitas

Siigo se conecta con **credenciales de API** de tu propia cuenta de Siigo Nube:

1. En Siigo Nube abre **Alianzas** en el menú izquierdo y pulsa **Mi Credencial API** para obtener tu usuario y tu clave de acceso ([cómo lo explica Siigo](https://developers.siigo.com/docs/siigoapi/autenticacion/autenticacion)).
2. Pégalas cuando el Lab te pida `SIIGO_USERNAME` y `SIIGO_ACCESS_KEY`. Quedan guardadas cifradas en Secretos de la app — nunca se escriben en el chat.

**Divulgación honesta:** este conector es un **build de la comunidad**, **no está publicado ni avalado por Siigo**, y está en **beta**: se probó con respuestas simuladas, todavía no contra una cuenta real de Siigo. **Escribe en tu contabilidad real**, así que lee cada confirmación antes de aceptarla. **Enviar una factura a la DIAN no se deshace** (solo se corrige con una nota crédito): el conector crea las facturas sin enviarlas y se niega a enviar una salvo que lo hayas pedido expresamente. Editar un cliente reemplaza su registro en Siigo, así que la IA debe leerlo primero. Puede leer y cambiar lo que tu credencial de API pueda en tu empresa. Cada request identifica el software ante Siigo con el header `Partner-Id` que Siigo exige, y Siigo puede bloquear temporalmente a un usuario API cuyos requests fallan en su mayoría, así que el conector nunca reintenta una escritura a ciegas.

--- dev ---

`siigo-mcp` es un servidor MCP stdio (Node ≥ 20) sobre la API oficial de Siigo en `https://api.siigo.com`. Se autentica con `POST /auth` (`username` + `access_key`), guarda el token Bearer de 24 horas y lo renueva 5 minutos antes, y envía el header obligatorio `Partner-Id` (por defecto `TerminalSync`, configurable con `SIIGO_PARTNER_ID`).

Herramientas de lectura (`readOnlyHint: true`, corren solas): `list_customers` (`GET /v1/customers`), `list_invoices` (`GET /v1/invoices`), `get_invoice` (`GET /v1/invoices/{id}`), `list_products` (`GET /v1/products`), `get_product` (`GET /v1/products/{id}`). Las de listado aceptan `page` y `page_size` (tope 100) más los filtros que documenta Siigo.

Herramientas de escritura (`readOnlyHint: false`, por eso TerminalSync pide confirmación): `create_customer` (`POST /v1/customers`), `update_customer` (`PUT /v1/customers/{id}`, declarada destructiva porque Siigo reemplaza el registro), `create_product` (`POST /v1/products`), `create_invoice` (`POST /v1/invoices`). `create_invoice` solo envía a la DIAN cuando `stamp.send` y `confirm_send_to_dian` son `true`, y acepta `idempotency_key`, que se reenvía como el header `Idempotency-Key` de Siigo (solo en POST, como lo documenta Siigo). Fuera de TerminalSync, `SIIGO_READ_ONLY=1` quita todas las herramientas de escritura.

Un `401` dispara una reautenticación y un reintento; nada más se reintenta, escrituras incluidas.

Licencia: MIT. Endpoints y parámetros: developers.siigo.com/docs/siigoapi.
