---
name: Alegra
logo: /connectors/alegra.svg
category: automation
status: available
simpleTitle: "Tu facturación y tu contabilidad, respondidas en lenguaje natural"
simpleSubtitle: "MCP oficial de Alegra: facturas, contactos, inventario, bancos, pagos y reportes, directo desde tu cuenta."
devTitle: "Conector MCP de Alegra"
devSubtitle: "MCP oficial hospedado de Alegra (mcp.alegra.com) — facturas, contactos, inventario, bancos, pagos, reportes y contabilidad, con autenticación Basic del token del API."
ctaUrl: "https://www.alegra.com"
tokenHelpUrl: "https://app.alegra.com"
manifest:
  mcpServers:
    alegra:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.alegra.com/mcp", "--header", "Authorization:${ALEGRA_AUTH_HEADER}"]
      env:
        ALEGRA_AUTH_HEADER: "Basic ${SECRET:ALEGRA_API_TOKEN_BASE64}"
affiliate: false
tagline: "Tus facturas, tu inventario y tus reportes, al alcance del agente"
originalAuthor: "Alegra"
originalAuthorUrl: "https://developer.alegra.com"
license: "MIT"
licenseUrl: "https://opensource.org/licenses/MIT"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-10T07:31:32.656Z"
verifiedPackageVersion: null
---
**Alegra** es la plataforma en la nube con la que administras tu negocio: facturación electrónica, contactos, inventario, cuentas bancarias y contabilidad en un solo lugar. El conector oficial de Alegra es un **server MCP hospedado** (`https://mcp.alegra.com/mcp`), publicado por Alegra en su portal de desarrolladores, que conecta a tu agente con la operación de tu empresa — en palabras de la documentación oficial, *"permite acceso a herramientas de gestión empresarial como inventarios, contactos, facturas, bancos, pagos, retenciones, entre otros"*.

Le preguntas *"¿Cuánto facturé este mes y a qué clientes?"* y el agente consulta tus facturas y te arma el resumen. *"¿Qué stock tengo de cada producto?"* sale del inventario, sin recorrer pantallas. También trabaja por ti: *"Actualiza el teléfono de Ana Gómez en sus datos de contacto"* o *"Registra el pago recibido de la factura 245"*. Todo queda registrado en tu cuenta de Alegra, con la misma credencial con la que tú accedes al API.

### Qué le puedes pedir

- *"¿Cuánto facturé este mes y a qué clientes?"*
- *"Muéstrame el stock disponible de cada producto."*
- *"Lista mis contactos y actualiza el teléfono de Ana Gómez."*
- *"¿Cuánto debo y cuánto me deben?"*
- *"Muéstrame el estado de resultados de este mes."*
- *"Registra el pago recibido de la factura 245."*

### Qué token necesitas

Necesitas el **token del API de tu usuario de Alegra**, convertido a Base64 — el mismo token del API de Alegra, en el formato que el servidor MCP espera.

1. Entra a [app.alegra.com](https://app.alegra.com) con tu cuenta. Arriba a la derecha, haz clic en **Configuración** y abre la sección **API - Integraciones con otros sistemas**. Ahí aparecen el correo con el que accedes al API y tu token; si todavía no tienes token, puedes generarlo en esa misma pantalla.
2. El servidor espera la credencial como `correo:token` codificada en Base64. El ejemplo de la propia documentación: `Authorization: Basic ZWplbXBsb2FwaUBhbGVncmEuY29tOnRva2VuZWplbXBsb2FwaTEyMzQ1`, donde esa cadena es `base64('<ejemploapi@alegra.com>:tokenejemploapi12345')`.
3. Codifica tu propio `correo:token` en tu computadora — nunca uses páginas web de "codificador Base64" con tus credenciales de acceso. En la Terminal de macOS o Linux: `printf 'correo:token' | base64`. En Windows (PowerShell): `[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('correo:token'))`.
4. Pega la cadena resultante cuando TerminalSync te pida `ALEGRA_API_TOKEN_BASE64`. Se guarda cifrada en los Secretos de la app y se envía al servidor como el header `Authorization: Basic …` que Alegra espera.

**Aviso honesto:** es un **server hospedado por Alegra** (`https://mcp.alegra.com`), no algo que corre en tu computadora: tus pedidos viajan al servidor de Alegra, que responde con los datos de tu cuenta. Lee **y escribe**: puede crear y actualizar facturas, contactos, productos y pagos, y el catálogo documentado también incluye herramientas para borrar (por ejemplo, eliminar una factura o un contacto). Lo que el agente puede hacer queda acotado por tu token — el mismo acceso que tiene tu usuario en el API de Alegra — y la documentación del MCP no describe un mecanismo de confirmación previa del lado del servidor. El API de Alegra documenta un límite de uso de 150 solicitudes por minuto por usuario; si se supera, responde con un error 429 hasta que termine el minuto. Los datos salen de tu cuenta, y verificarlos es tu responsabilidad.

--- dev ---

Alegra publica su **MCP oficial** como server remoto/hospedado en `https://mcp.alegra.com` (el "Servidor de Producción" de su definición OpenAPI, v1.0.0), documentado en su portal de desarrolladores (`developer.alegra.com`). No hay paquete npm ni server stdio local — se puentea con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.alegra.com/mcp --header "Authorization:${ALEGRA_AUTH_HEADER}"
```

**Protocolo.** JSON-RPC 2.0 sobre `POST /mcp`, con los métodos `tools/list` y `tools/call`; conexión SSE por `GET /mcp` ("Establece conexión SSE (Server-Sent Events) para streaming de eventos MCP"), más cierre de sesión y health check como endpoints propios. La invocación de ejemplo de la doc es `tools/call` con `name: "items__getItems"` y `arguments: {"limit": 10, "offset": 0}`.

**Autenticación: Basic Access.** El header `Authorization` lleva el correo y el token del usuario registrado en Alegra, separados por dos puntos y todo en Base64 — la misma credencial del API de Alegra (la definición del MCP la describe como "Token de Alegra codificado en Base64 (usuario:token)"; un 401 significa credenciales inválidas). Ejemplo verbatim de la doc: `Authorization: Basic ZWplbXBsb2FwaUBhbGVncmEuY29tOnRva2VuZWplbXBsb2FwaTEyMzQ1`. El manifest de esta ficha inyecta la credencial desde los Secretos de la app como `${SECRET:ALEGRA_API_TOKEN_BASE64}` dentro de ese header — el argumento `--header` va sin espacios alrededor de los dos puntos, como recomienda el README de `mcp-remote` para esquivar el bug de escaping de algunos clientes.

**Token:** app.alegra.com → **Configuración** → **API - Integraciones con otros sistemas** (muestra el correo del API y el token; permite generar uno si no existe).

**Grupos de herramientas (`mcp-groups`).** Header opcional — "Grupos de herramientas a habilitar separados por comas" — con los valores documentados: `invoices`, `items`, `contacts`, `banks`, `income-payments`, `resolutions`, `currencies`, `sellers`, `taxes`, `retentions`, `reports`, `ledger`, `accounting`, `support-center` (ejemplo de la doc: `invoices,items,contacts,banks`). El manifest no lo envía — la doc no especifica qué grupos quedan activos cuando el header está ausente. Para acotar la superficie se suma como otro header al puente (`--header "mcp-groups:invoices,items"`).

**Catálogo documentado por grupo** (páginas oficiales bajo `developer.alegra.com/reference/`):

- **Facturas de venta** (`invoices`): `invoices__getInvoices`, `invoices__getInvoiceById`, `invoices__getInvoiceByNumber`, `invoices__createInvoice`, `invoices__updateInvoice`, `invoices__deleteInvoice`, `invoices__getPaymentTypes` (solo República Dominicana).
- **Productos e inventario** (`items` y grupos asociados): `items__getItems`, `items__getItem`, `items__createItem`, `items__updateItem`, `items__deleteItem`; stock (`itemStock__get_item_stock`, `itemStock__get_item_stock_summary`), categorías, listas de precios, bodegas y traslados, ajustes de inventario, campos personalizados y variantes.
- **Contactos** (`contacts`): `contacts__getContacts`, `contacts__getContactByName`, `contacts__createContact`, `contacts__updateContact`, `contacts__deleteContact`.
- **Bancos** (`banks`): bancos y cuentas bancarias (consultar, crear, actualizar, eliminar), conciliaciones y transferencias entre cuentas.
- **Pagos** (`income-payments`, pagos salientes): pagos recibidos (consultar, crear, actualizar, eliminar) y pagos salientes, incluida su anulación.
- **Gastos — paquete "MCP Expenses"** (`@alegradev/mcp-expenses`): según la doc, cubre "facturas de compra (bills), notas de débito de gastos, órdenes de compra y pagos salientes", con herramientas públicas documentadas que se invocan igual vía JSON-RPC sobre `POST /mcp`. Ojo: ese paquete no está publicado en el registro público de npm al día de esta ficha (verificado 2026-10-10) — los grupos de gastos se documentan sobre el server hospedado.
- **Reportes** (`reports`): 30 herramientas — ventas por cliente, vendedor, producto y bodega (con totales), rentabilidad por producto, estado de resultados, balance general, balance de comprobación, flujo de caja, cuentas por pagar y por cobrar (con resúmenes), detalle de retenciones y exportables.
- **Contabilidad** (`ledger`, `accounting`): categorías del libro (consultar, crear, actualizar), comprobantes contables (journals) y centros de costo (consultar, crear, actualizar, eliminar).
- **Centro de soporte** (`support-center`): crear tickets, consultar el historial y buscar ayuda.
- **Maestros**: numeraciones y resoluciones, monedas y tasas de cambio, vendedores, impuestos y retenciones fiscales.

**Divulgación:** server hospedado (no local) que lee, escribe y borra — el catálogo incluye tools de borrado (`invoices__deleteInvoice`, `items__deleteItem`, `contacts__deleteContact`, `banks__deleteBankAccount`, …). La doc del MCP no documenta un gate de confirmación del lado del servidor: el control queda en el cliente que orquesta las tools y en los permisos del token. Límite del API: "150 request por minuto por usuario"; al superarlo devuelve un código 429, y cada respuesta incluye los headers `X-Rate-Limit-Limit`, `X-Rate-Limit-Remaining` y `X-Rate-Limit-Reset`.

Licencia: MIT (declarada en la definición OpenAPI del MCP Alegra). Fuente: developer.alegra.com — documentación MCP de Alegra (`mcpexecute`, `mcpsse`, autenticación, límite de requests). Soporte: developer.alegra.com.
