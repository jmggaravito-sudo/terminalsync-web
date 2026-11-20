---
name: Facturapi
logo: /plugins/facturapi.svg
category: sales
status: available
tagline: "Cotiza con tus condiciones y tus precios, y registra el CFDI cuando te lo aceptan."
description: "Junta el conector de Facturapi (tus clientes y facturas CFDI 4.0 sobre el API v2 de Facturapi) con Cotizaciones (convierte alcance, precio y condiciones en una cotización protegida — vigencia, exclusiones, condiciones de pago — y nunca inventa un precio), para que lo que el cliente acepta sea lo que aterriza en tu facturación."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: facturapi
skillSlugs: ["cotizaciones"]
---
## Cuándo usarlo

- Cotizas trabajos antes de facturarlos y la cotización se despega de lo que finalmente aterriza en tu facturación: un monto distinto, una cláusula que faltó, sin rastro en papel.
- Quieres que cada cotización lleve las mismas protecciones — ventana de vigencia, qué queda excluido, condiciones de pago — y que la aceptada se convierta en un CFDI real sin volver a tipear los datos a mano.
- Facturas en México con Facturapi y quieres que los datos del receptor salgan del registro real del cliente, no de un mensaje de chat.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Cotizaciones (la skill)** convierte un alcance, un precio y condiciones en una cotización limpia y lista para enviar: partidas solo de lo que describiste, ventana de vigencia, exclusiones explícitas, condiciones de pago según lo que le dijiste, el mensaje para enviarla y un veredicto 0–100 de qué tan protegido está el documento. Nunca inventa un precio que no le diste.
- **Facturapi (el conector)** es el puente a tu cuenta de Facturapi: lee tus clientes y facturas CFDI, crea clientes (Facturapi valida el RFC contra el SAT) y crea facturas CFDI 4.0 en borrador o definitivas cuando confirmas — con las partidas, montos y condiciones de la cotización aceptada.

**Un ejemplo real:** *"Cotiza 15 horas de consultoría a $850 más IVA, válida 15 días, 50% de anticipo."* La skill escribe la cotización protegida y el mensaje para enviarla. El cliente acepta; tú dices *"regístrala en Facturapi para el cliente que te di"* — el agente crea la factura en borrador con los números aceptados y, con llave live, te pide la confirmación de timbrado aparte.

## Cómo usarlo

1. Instala el Plugin y conecta Facturapi con tu Secret Key (dashboard → API Keys): `sk_test_...` para probar, `sk_live_...` para producción.
2. Describe el trabajo: alcance, tu precio, cómo te pagan. La skill redacta la cotización, marca lo que falta y cierra con su veredicto.
3. Envía la cotización desde tu propio correo o WhatsApp — Facturapi no emite cotizaciones; el CFDI es el documento fiscal que viene después de la aceptación.
4. Cuando el cliente acepta, pídele al agente registrar la factura con el cliente que creaste, y da la confirmación de timbrado cuando la pida.

## Por qué el combo funciona

La skill por sí sola protege el documento, pero lo que el cliente acepta es un PDF de tu lado del cerco — los datos de la factura se vuelven a tipear a mano, y ahí pasa la desviación. El conector por sí solo puede timbrar una factura, pero no conoce tus condiciones, tus exclusiones ni tu anticipo — ese es el trabajo de la skill. Juntos: los números de la cotización aceptada se vuelven las partidas de la factura, y el receptor es el registro real del cliente (RFC validado contra el SAT), no un recuerdo de chat.

## Límites

- La cotización es un documento que envías tú; Facturapi no emite cotizaciones. Lo que aterriza en Facturapi es el CFDI que confirmas después de la aceptación.
- Las herramientas de este conector cubren clientes y facturas — no tiene consulta de catálogo de productos ni precios, así que los precios los das tú. Esa es la regla de la propia skill: nunca inventa un precio que no le diste.
- Timbrar es irreversible: un CFDI timbrado solo se corrige con una nota de crédito. Los borradores no necesitan confirmación; con llave live, el timbrado es una confirmación aparte que das explícitamente. Con llave de pruebas, las facturas nunca llegan al SAT y no consumen timbres.
- El veredicto mide qué tan protegido está el documento de la cotización — no si el cliente acepta el precio o paga a tiempo.
- Este es un MCP comunitario de TerminalSync, no construido ni avalado por Facturapi — la propia ficha del conector lo dice, y el dashboard de Facturapi sigue siendo el lugar para cancelaciones y complementos de pago, que este conector no cubre.
