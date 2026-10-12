---
name: Siigo
logo: /plugins/siigo.svg
category: sales
status: available
tagline: "Cotiza con los precios reales de tu catálogo y convierte lo aceptado en factura de Siigo."
description: "Junta el conector de Siigo (MCP oficial: tu catálogo de productos con precios reales, tus clientes y tus facturas de venta por OAuth) con Cotizaciones y Presupuestos (convierte un alcance en una cotización protegida — ítems, vencimiento, exclusiones, condiciones de pago), para que la cotización lleve los precios que realmente cobras y el trabajo aceptado termine en una factura de venta registrada — solo después de tu confirmación."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: siigo
skillSlugs: ["cotizaciones"]
---
## Cuándo usarlo

- Tu negocio funciona sobre Siigo (facturación, clientes, catálogo) y armás las cotizaciones tipeando precios de memoria — o desde una planilla que ya no coincide con tu catálogo real.
- Mandas cotizaciones o presupuestos a prospectos y clientes, y quieres las protecciones puestas por defecto: vencimiento, qué queda explícitamente excluido, condiciones de pago.
- Cuando un cliente acepta, quieres la factura registrada en Siigo sin retipear cada ítem a mano.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Siigo (el conector)** es el MCP oficial hospedado de Siigo: con el login de tu propia cuenta (sin pegar ninguna API key), el agente lee tu catálogo de productos con código, saldos, descripción y precio, tus clientes con su información comercial y de contacto, y tus facturas de venta emitidas. También puede crear facturas de venta y crear o actualizar clientes — y por regla del propio Siigo, te pide confirmación explícita antes de registrar cualquier cosa, y nunca borra: *"Borrar, nunca."*
- **Cotizaciones y Presupuestos (la skill)** convierte tu alcance en una cotización lista para enviar: los entregables como ítems, un vencimiento (ej. "válida 15 días"), exclusiones explícitas, condiciones de pago, y la nota corta de email/WhatsApp que la acompaña. Nunca inventa un precio que no le diste — y aquí, el precio que le das puede salir directo de tu catálogo.

**Un ejemplo real:** un cliente pide cotización de dos sillas ejecutivas más instalación. Pides: *"¿Qué precio tiene la silla ejecutiva en mi catálogo de Siigo? Escríbeme una cotización por 2 sillas más instalación, válida 15 días, seña del 50%."* El agente lee el precio y el saldo real de tu catálogo, la skill arma la cotización protegida, y cuando el cliente acepta: *"Crea la factura para Carlos Pérez: 2 sillas ejecutivas, pago al contado"* — se registra solo después de tu confirmación.

## Cómo usarlo

1. Instala el Plugin y conecta Siigo — sin API key. Tu empresa debe tener habilitadas las credenciales de integración de Siigo API (en Siigo: **Configuración → Credenciales de integración a plataformas digitales**); si faltan, el propio asistente te guía para activarlas.
2. Pide la cotización nombrando qué entra en el alcance — el agente toma precios y saldos reales de tu catálogo en lugar de adivinar.
3. Revisa las exclusiones y las condiciones de pago, y envíala tú; la skill escribe la nota que la acompaña.
4. Cuando el cliente acepta, pídele al agente crear la factura de venta en Siigo con los ítems de la cotización — revísala y confirma. Nada se registra sin tu visto bueno.

## Por qué el combo funciona

La skill por sí sola protege tu precio, pero necesita que se lo des — de memoria, o desde una planilla que ya no calza con el catálogo. El conector por sí solo conoce tus precios y saldos reales, pero no arma un documento protegido. Juntos: la cotización lleva los precios reales de tu catálogo (así nunca te cobra de menos por accidente), y lo aceptado fluye a una factura registrada en lugar de una sesión de retipeo entre dos pantallas.

## Límites

- El conector no registra cotizaciones en Siigo — su superficie documentada son facturas de venta, clientes y catálogo de productos. La cotización es un documento que envías; lo que llega a Siigo es la factura que confirmas explícitamente.
- Crear una factura o un cliente siempre requiere tu aprobación explícita, según la documentación del propio Siigo — y nunca borra información.
- Es un server hospedado por Siigo (`mcp.siigo.com`), no algo que corre en tu computadora: lo que el agente puede ver y hacer está acotado por los permisos de tu usuario de Siigo, y tu empresa debe tener las credenciales de integración habilitadas.
- El puntaje 0–100 con el que cierra la skill refleja qué tan protegida está la cotización (vencimiento, exclusiones y condiciones de pago presentes) — no una promesa de que el cliente acepte el precio o pague a tiempo.
- Los precios y saldos están tan al día como tu catálogo de Siigo; si el catálogo está desactualizado, la cotización hereda ese atraso.
