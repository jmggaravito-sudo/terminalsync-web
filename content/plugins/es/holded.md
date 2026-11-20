---
name: Holded
logo: /plugins/holded.svg
category: operations
status: available
tagline: "Mira qué facturas están sin pagar desde tu cuenta de Holded y manda el cobro que cada una merece."
description: "Junta el conector de Holded (MCP oficial de Holded: facturación, contabilidad, CRM e inventario con tu propio login) con Cobros Vencidos (convierte la lista de vencidos en una escalera de recordatorio → seguimiento firme → aviso final, dentro de tus condiciones), para que el cobro arranque del registro real de la factura en lugar de tu memoria."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: holded
skillSlugs: ["cobros-vencidos"]
---
## Cuándo usarlo

- Llevas tu día a día en Holded y las facturas sin pagar se acumulan mientras pospones el mensaje incómodo: quién debe, desde cuándo y por cuánto.
- Quieres que el seguimiento escale por pasos según cuán atrasado esté cada cliente — un empujón primero, una nota firme después, el aviso final al final — en lugar de un solo mail enojado para todos.
- La documentación del propio conector de Holded usa este trabajo como ejemplo: *"Show me this month's unpaid invoices and what the total adds up to."*

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Holded (el conector)** es el MCP oficial hospedado de Holded: con el login de tu propia cuenta (sin pegar ninguna API key), el agente lee tus facturas, contactos, productos y stock directo de tu cuenta, y puede preparar documentos operativos (presupuestos, facturas pro forma, contactos) cuando apruebas cada acción.
- **Cobros Vencidos (la skill)** convierte tu lista de vencidos en una escalera de mensajes: el recordatorio amable (días 1–7 de atraso), el seguimiento firme con plazo (semanas 2–4) y el aviso final (pasado un mes) — cada uno con el número de factura, el monto, el vencimiento y los días de atraso. Pide lo que falta (contacto previo, condiciones acordadas) en vez de inventarlo, y nunca inventa intereses, recargos ni consecuencias legales que no estén en tus condiciones.

**Un ejemplo real:** *"¿Qué facturas están sin pagar este mes? Redacta el seguimiento de cada una."* El agente lee las impagas de tu cuenta de Holded, la skill separa a quién le toca el empujón y a quién la nota firme, y redacta cada mensaje con los montos y las fechas reales.

## Cómo usarlo

1. Instala el Plugin y conecta Holded — sin API key; entras con tu propia cuenta.
2. Pregunta qué facturas están vencidas. El agente las lee de tu cuenta en lugar de que tipes la lista a mano.
3. Dale a la skill lo que el registro de la factura no muestra: qué ya le dijiste a ese cliente y las condiciones de pago que acordaron. Pide lo que falta en vez de adivinarlo.
4. Revisa cada mensaje redactado y envíalo desde tu propio correo, donde vive de verdad tu relación con el cliente.

## Por qué el combo funciona

La skill por sí sola es una buena redactora trabajando a ciegas — su propia ficha dice "la IA no ve tu sistema de facturación", así que la lista de vencidos llega de tu memoria. El conector por sí solo ve las facturas, pero el resumen que devuelve es genérico. Juntos: el cobro arranca del registro real (quién debe, cuánto hace, por cuánto) y cada cliente recibe el mensaje que corresponde a su grado de atraso — el chequeo que la skill pide ("que monto, número y fechas coincidan con tu factura real") ya lo hizo la lectura.

## Límites

- Este pack lee facturas; no manda mensajes desde Holded. Las facturas son de solo lectura con los perfiles de permisos recomendados de Holded (el perfil Analítico preseleccionado alcanza para este trabajo), y los mensajes redactados salen desde tu propio correo.
- Tu cuenta necesita acceso al API — el API de Holded está disponible en los planes pagos, no en el plan Free.
- El conector conoce el registro de la factura, no tu relación con el cliente: el contacto previo y las condiciones acordadas las das tú, y la skill pregunta en lugar de llenar el hueco con algo verosímil.
- La skill nunca promete que el cliente va a pagar, y no amenaza con consecuencias que no estén en tus condiciones. Para una deuda seria es una ayuda de redacción — no un abogado ni una empresa de cobranza.
- Es un server hospedado por Holded (`mcp.holded.com`), no algo que corre en tu computadora: lo que el agente puede ver y hacer está acotado por la cuenta y el perfil de permisos que conectes. Este trabajo usa solo el lado de lectura — contabilidad, nómina y Team/HR no forman parte de él.
