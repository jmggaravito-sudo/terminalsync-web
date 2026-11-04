---
name: Quipu
logo: /plugins/quipu.svg
category: operations
status: available
tagline: "Mira qué facturas de Quipu siguen sin cobrar y manda el mensaje de cobro que cada una merece."
description: "Junta el conector de Quipu (tus contactos, facturas y asientos por el API v1 de Quipu) con Cobros Vencidos (convierte la lista de vencidos en una escalera de recordatorio → seguimiento firme → aviso final, dentro de tus condiciones), para que el cobro arranque del registro real de la factura — cuántos días lleva, qué ya le dijiste — en lugar de tu memoria."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: quipu
skillSlugs: ["cobros-vencidos"]
---
## Cuándo usarlo

- Facturas a tus clientes por Quipu y el cobro de los atrasados vive en tu cabeza: quién debe, desde cuándo y qué le dijiste la última vez.
- Quieres que el seguimiento escale por pasos según cuán atrasado esté cada cliente — un empujón primero, una nota firme después, el aviso final al final — en lugar de un solo correo enojado para todos.
- La documentación del propio conector usa este trabajo como ejemplo: *"Find the client Fisioterapia Ana and tell me if she has unpaid invoices."*

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Quipu (el conector)** es un MCP comunitario sobre el API v1 de Quipu: con tus credenciales del API v1 (App ID, App secret y el slug de tu cuenta), el agente lee tus contactos (filtrables por NIF, tipo o país), tus facturas (búsqueda por texto y por periodo) y tus asientos. También puede crear contactos y facturas de ingresos, siempre pidiendo tu confirmación primero — cada factura se asienta bajo las normas de Veri*Factu.
- **Cobros Vencidos (la skill)** convierte tu lista de vencidos en una escalera de mensajes: el recordatorio amable (días 1–7 de atraso), el seguimiento firme con plazo (semanas 2–4) y el aviso final (pasado un mes) — cada uno con el número de factura, el monto, el vencimiento y los días de atraso. Pide lo que falta (contacto previo, condiciones acordadas) en vez de inventarlo, y nunca inventa intereses, recargos ni consecuencias legales que no estén en tus condiciones.

**Un ejemplo real:** *"¿Qué facturas tengo sin cobrar? Redacta el seguimiento de cada una."* El agente busca las facturas de tu cuenta de Quipu por periodo, la skill separa a quién le toca el empujón y a quién la nota firme, y redacta cada mensaje con los montos y las fechas reales. Revisas, ajustas y envías cada uno tú.

## Cómo usarlo

1. Instala el Plugin y conecta Quipu con tus credenciales del API v1 (Configuración → Integraciones → API v1 → Activar → Credenciales): el App ID, el App secret y el slug de tu cuenta — el que aparece en tu dirección de Quipu, `getquipu.com/d/<slug>`.
2. Pregunta qué facturas están sin cobrar. El agente las lee de tu cuenta de Quipu en lugar de que tipes la lista a mano.
3. Dale a la skill lo que el registro de la factura no muestra: qué ya le dijiste a ese cliente y las condiciones de pago que acordaron. Pide lo que falta en vez de adivinarlo.
4. Revisa cada mensaje redactado y envíalo desde tu propio correo — este pack no envía nada por ti.

## Por qué el combo funciona

La skill por sí sola es una buena redactora trabajando a ciegas — sus propios pasos dicen de comprobar que el monto, el número y las fechas coinciden con tu factura real porque "la IA no ve tu sistema de facturación", así que la lista de vencidos llegaría de tu memoria. El conector por sí solo ve las facturas, pero el recordatorio que produciría es genérico. Juntos: el cobro arranca del registro real (quién debe, cuánto hace, por cuánto) y cada cliente recibe el mensaje que corresponde a su grado de atraso.

## Límites

- **Nada se envía solo.** El conector no tiene herramienta de correo: la escalera redactada es el entregable, y cada mensaje lo envías tú desde tu correo.
- Crear facturas y contactos es una escritura con tu confirmación explícita, y cada factura se asienta bajo las normas de Veri*Factu — pero crear registros no es el trabajo de este pack: lee tus facturas y redacta los mensajes de cobro.
- El conector es un **proyecto comunitario de TerminalSync, no construido ni avalado por Quipu/TeamSystem**. Sus escrituras se verificaron el 2026-10-27 contra una cuenta real (un contacto y una factura de ingresos creados y releídos). No cubre facturas simplificadas, asientos de gastos, nóminas, conciliación bancaria ni presentaciones de impuestos, y no borra nada.
- La skill nunca promete que el cliente va a pagar y no amenaza con consecuencias que no estén en tus condiciones. Para una deuda seria es una ayuda de redacción — no un abogado ni una empresa de cobranza; te avisa cuando el caso llegó a ese punto.
- Quipu está enfocado en España (el conector está acotado a la facturación española bajo Veri*Factu), así que este pack encaja en un negocio que factura a clientes españoles.
