---
name: Quipu
logo: /plugins/quipu.svg
category: operations
status: available
tagline: "Mira qué facturas de Quipu siguen sin cobrar y consigue el cobro de cada cliente redactado."
description: "Junta el conector de Quipu (MCP comunitario de TerminalSync sobre la API de Quipu: tus contactos, facturas y asientos) con Cobros Vencidos (convierte la lista de vencidos en una escalera de recordatorio → seguimiento firme → aviso final, dentro de tus condiciones), para que el cobro arranque del registro de la factura — quién debe, cuánto hace, por cuánto — en lugar de tu memoria."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: quipu
skillSlugs: ["cobros-vencidos"]
---
## Cuándo usarlo

- Facturas con Quipu y el cobro de las facturas impagas vive en tu cabeza: quién te debe, desde cuándo y qué le dijiste la última vez.
- Quieres que el seguimiento escale por pasos según cuán atrasado esté cada cliente — un empujón primero, una nota firme después, el aviso final al final — en lugar de un solo mail enojado para todos.
- La documentación del propio conector usa este trabajo como ejemplo: *"Find the client Fisioterapia Ana and tell me if she has unpaid invoices."* (Busca a la clienta Fisioterapia Ana y dime si tiene facturas sin cobrar.)

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Quipu (el conector)** es el MCP comunitario de TerminalSync sobre la API de Quipu: con tus credenciales de la API de Quipu, el agente lee tus facturas (búsqueda por texto y por periodo), tus contactos (filtrables por NIF, tipo o país) y tus asientos — así ve la factura, el cliente detrás y si la plata entró.
- **Cobros Vencidos (la skill)** convierte esa lista de impagas en una escalera de mensajes: el recordatorio amable, el seguimiento firme, el aviso final — cada uno con el número de factura, el monto, el vencimiento y los días de atraso. Pide lo que falta (contacto previo, condiciones acordadas) en vez de inventarlo, y nunca inventa intereses, recargos ni consecuencias legales que no estén en tus condiciones.

**Un ejemplo real:** *"¿Qué clientes tienen facturas sin cobrar? Redacta el seguimiento de cada uno."* El agente busca en tus facturas y contactos de Quipu, la skill separa a quién le toca el empujón y a quién la nota firme, y redacta cada mensaje con los montos y las fechas reales. Los envías tú desde tu propio correo.

## Cómo usarlo

1. Instala el Plugin y conecta Quipu con tus credenciales de la API v1 (App ID, App secret y el slug de tu cuenta — Quipu los muestra en Configuración → Integraciones → API v1).
2. Pregunta qué facturas están impagas y cuánto lleva atrasada cada una. El agente las lee de tu cuenta en lugar de que tipes la lista a mano.
3. Dale a la skill lo que el registro de la factura no muestra: qué ya le dijiste a ese cliente y las condiciones de pago que acordaron. Pide lo que falta en vez de adivinarlo.
4. Revisa los mensajes redactados y envíalos tú desde tu propio correo.

## Por qué el combo funciona

La skill por sí sola es una buena redactora trabajando a ciegas — la lista de vencidos llegaría de tu memoria. El conector por sí solo ve las facturas y responde "¿tiene impagas?", pero la redacción del recordatorio te queda a ti. Juntos: el cobro arranca del registro real (quién debe, cuánto hace, por cuánto) y cada cliente recibe el mensaje que corresponde a su grado de atraso.

## Límites

- **Este pack lee y redacta; no envía.** El conector lee facturas, contactos y asientos — el recordatorio sale desde tu propio correo, no desde Quipu.
- Este conector es un **proyecto comunitario de TerminalSync, no lo construye ni lo respalda Quipu/TeamSystem** — la misma divulgación que carga su propia ficha. Las escrituras fueron verificadas por el conector contra una cuenta real (un contacto y una factura de ingreso, creados y leídos de vuelta); este pack usa solo el lado de lectura.
- La superficie del conector es facturación, contactos y asientos. Los gastos por asiento, las nóminas, la conciliación bancaria y las presentaciones fiscales quedan fuera de él — y fuera de este trabajo.
- El conector conoce el registro de la factura, no tu relación con el cliente: el contacto previo y las condiciones acordadas los das tú, y la skill pregunta en lugar de llenar el hueco con algo verosímil.
- La skill nunca promete que el cliente va a pagar, y no amenaza con consecuencias que no estén en tus condiciones. Para una deuda seria es una ayuda de redacción — no un abogado ni una empresa de cobranza.
