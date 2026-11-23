---
name: Holded
logo: /plugins/holded.svg
category: operations
status: available
tagline: "Mira qué facturas de Holded siguen sin cobrar y consigue el cobro de cada cliente redactado."
description: "Junta el conector de Holded (MCP oficial hospedado de Holded: tu facturación, contactos y datos del negocio con tu propio login de Holded) con Cobros Vencidos (convierte la lista de vencidos en una escalera de recordatorio → seguimiento firme → aviso final, dentro de tus condiciones), para que el cobro arranque del registro de la factura — quién debe, cuánto hace, por cuánto — en lugar de tu memoria."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: holded
skillSlugs: ["cobros-vencidos"]
---
## Cuándo usarlo

- Llevas tu día a día en Holded y el cobro de las facturas impagas vive en tu cabeza: quién te debe, desde cuándo y qué le dijiste la última vez.
- Quieres que el seguimiento escale por pasos según cuán atrasado esté cada cliente — un empujón primero, una nota firme después, el aviso final al final — en lugar de un solo mail enojado para todos.
- La documentación del propio conector usa este trabajo como ejemplo: *"Show me this month's unpaid invoices and what the total adds up to."* (Muéstrame las facturas impagas de este mes y cuánto suman.)

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Holded (el conector)** es el MCP oficial hospedado de Holded (`mcp.holded.com`): con tu propio login de Holded (sin pegar ninguna API key), el agente lee tus facturas con sus líneas, tus contactos y sus datos — el número de factura, el monto, el cliente, lo que sigue abierto.
- **Cobros Vencidos (la skill)** convierte esa lista de impagas en una escalera de mensajes: el recordatorio amable, el seguimiento firme, el aviso final — cada uno con el número de factura, el monto, el vencimiento y los días de atraso. Pide lo que falta (contacto previo, condiciones acordadas) en vez de inventarlo, y nunca inventa intereses, recargos ni consecuencias legales que no estén en tus condiciones.

**Un ejemplo real:** *"¿Qué facturas de Holded siguen sin cobrar? Redacta el seguimiento de cada una."* El agente lee las impagas de tu cuenta, la skill separa a quién le toca el empujón y a quién la nota firme, y redacta cada mensaje con los montos y las fechas reales. Los envías tú desde tu propio correo.

## Cómo usarlo

1. Instala el Plugin y conecta Holded — sin API key; entras con tu propia cuenta y apruebas el acceso.
2. Pregunta qué facturas están impagas y cuánto llevan abiertas. El agente las lee de tu cuenta en lugar de que tipes la lista a mano.
3. Dale a la skill lo que el registro de la factura no muestra: qué ya le dijiste a ese cliente y las condiciones de pago que acordaron. Pide lo que falta en vez de adivinarlo.
4. Revisa los mensajes redactados y envíalos tú desde tu propio correo.

## Por qué el combo funciona

La skill por sí sola es una buena redactora trabajando a ciegas — la lista de vencidos llegaría de tu memoria. El conector por sí solo ve las facturas, pero un "¿está impaga?" sin más te deja la redacción a ti. Juntos: el cobro arranca del registro real (quién debe, cuánto hace, por cuánto) y cada cliente recibe el mensaje que corresponde a su grado de atraso. La propia frase de Holded para su MCP es *"The AI drafts and organizes; you issue and collect"* (la IA redacta y organiza; tú emites y cobras) — exactamente esta división del trabajo: el pack redacta el cobro, tú lo envías y lo cobras.

## Límites

- **Este pack lee y redacta; no envía.** Bajo los perfiles de permisos de Holded, las facturas y los documentos fiscales son de solo lectura para la IA, así que el recordatorio sale desde tu propio correo — este pack no tiene un paso "envíalo desde Holded".
- El conector conoce el registro de la factura, no tu relación con el cliente: el contacto previo y las condiciones acordadas los das tú, y la skill pregunta en lugar de llenar el hueco con algo verosímil.
- La skill nunca promete que el cliente va a pagar, y no amenaza con consecuencias que no estén en tus condiciones. Para una deuda seria es una ayuda de redacción — no un abogado ni una empresa de cobranza.
- El MCP de Holded cubre mucho más que facturación (CRM, proyectos, inventario — 360 tools documentadas). Este pack usa solo la porción de facturación y contactos, y no crea ni modifica nada en tu cuenta.
- Es un server hospedado por Holded (`mcp.holded.com`), no algo que corre en tu computadora: lo que el agente puede ver queda acotado por el perfil que autorices (Analítico, de solo lectura, es el preseleccionado). La API de Holded está en los planes de pago, no en el plan Free.
