---
name: PayPal
logo: /plugins/paypal.svg
category: operations
status: available
tagline: "Mira qué facturas están vencidas de verdad y manda el cobro que cada una merece."
description: "Junta el conector de PayPal (MCP oficial de PayPal: tus facturas, pagos, suscripciones y reportes de transacciones por OAuth) con Cobros Vencidos (convierte la lista de vencidos en una escalera de recordatorio → seguimiento firme → aviso final, dentro de tus condiciones), para que el cobro arranque del registro de la factura — cuántos días lleva, qué ya le dijiste — en lugar de tu memoria."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: paypal
skillSlugs: ["cobros-vencidos"]
---
## Cuándo usarlo

- Facturas a tus clientes por PayPal y el cobro de los atrasados vive en tu cabeza: quién debe, desde cuándo y qué le dijiste la última vez.
- Quieres que el seguimiento escale por pasos según cuán atrasado esté cada cliente — un empujón primero, una nota firme después, el aviso final al final — en lugar de un solo mail enojado para todos.
- La documentación del propio conector de PayPal usa este trabajo como ejemplo: *"Which invoices are still unpaid? Send a reminder to the client who's late."*

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **PayPal (el conector)** es el MCP oficial hospedado de PayPal: con el login de tu propia cuenta (sin pegar ninguna API key), el agente lee tus facturas (`list_invoices`, `get_invoice`), sus pagos y tus transacciones, y puede enviar una factura o su recordatorio (`send_invoice`, `send_invoice_reminder`) sobre la factura que le nombres.
- **Cobros Vencidos (la skill)** convierte tu lista de vencidos en una escalera de mensajes: el recordatorio amable, el seguimiento firme, el aviso final — cada uno con el número de factura, el monto, el vencimiento y los días de atraso. Pide lo que falta (contacto previo, condiciones acordadas) en vez de inventarlo, y nunca inventa intereses, recargos ni consecuencias legales que no estén en tus condiciones.

**Un ejemplo real:** *"¿Qué facturas tengo vencidas? Redacta el seguimiento de cada una."* El agente lee las vencidas de tu cuenta de PayPal, la skill separa a quién le toca el empujón y a quién la nota firme, y redacta cada mensaje con los montos y las fechas reales. Los envías tú — o le pides al agente enviar el recordatorio de una factura puntual, y confirmas antes de que salga.

## Cómo usarlo

1. Instala el Plugin y conecta PayPal — sin API key; entras con tu propia cuenta.
2. Pregunta qué facturas están vencidas. El agente las lee de tu cuenta en lugar de que tipes la lista a mano.
3. Dale a la skill lo que el registro de la factura no muestra: qué ya le dijiste a ese cliente y las condiciones de pago que acordaron. Pide lo que falta en vez de adivinarlo.
4. Revisa cada mensaje redactado y envíalo tú — o, para una factura puntual, pídele al agente enviar el recordatorio y confirma antes de que salga.

## Por qué el combo funciona

La skill por sí sola es una buena redactora trabajando a ciegas — su propia ficha dice "la IA no ve tu sistema de facturación", así que la lista de vencidos llega de tu memoria. El conector por sí solo ve las facturas, pero el recordatorio que manda es genérico. Juntos: el cobro arranca del registro real (quién debe, cuánto hace, por cuánto) y cada cliente recibe el mensaje que corresponde a su grado de atraso.

## Límites

- Enviar es una acción real: `send_invoice` y `send_invoice_reminder` salen de verdad, y la documentación del MCP de PayPal no declara un paso de confirmación por acción — así que trata el "envíalo" como una decisión por factura, y revisa antes de confirmar.
- El conector conoce el registro de la factura, no tu relación con el cliente: el contacto previo y las condiciones acordadas las das tú, y la skill pregunta en lugar de llenar el hueco con algo verosímil.
- La skill nunca promete que el cliente va a pagar, y no amenaza con consecuencias que no estén en tus condiciones. Para una deuda seria es una ayuda de redacción — no un abogado ni una empresa de cobranza.
- Este pack lee facturas y redacta o envía recordatorios. El conector tiene otras herramientas de escritura (reembolsos, reclamos de disputas, suscripciones) que no forman parte de este trabajo.
- Es un server hospedado por PayPal (`mcp.paypal.com`), no algo que corre en tu computadora: lo que el agente puede ver y hacer está acotado por la cuenta que conectes.
