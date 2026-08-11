---
name: Google Sheets
logo: /connectors/google-sheets.svg
category: operations
status: available
tagline: "La lista de contratistas que ya está en tu planilla — ordenada según quién necesita un 1099."
description: "Junta el conector de Google Sheets (lee la pestaña donde ya llevas a quién le pagaste) con 1099/W-9 Organizer (ordena esa lista en quién probablemente necesita un 1099-NEC, a quién le falta el W-9 y qué queda sin resolver), para que 'a quién le debo un 1099' no requiera exportar ni retipear nada."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: google-sheets
skillSlugs: ["1099-w9-organizer"]
---
## Cuándo usarlo

- Llevas a quién le pagaste — contratistas, freelancers, proveedores — en un Google Sheet, y la fecha límite del 1099 en enero es de esas cosas que te agarran en el peor momento.
- Quieres preguntar "¿a quién le tengo que mandar un 1099?" y recibir una respuesta leída directo de la planilla que ya llevas, no un export que tienes que reformatear a mano.
- Quieres saber en cualquier momento a quién le falta el W-9, sin abrir la planilla y revisar fila por fila tú mismo.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Google Sheets (el conector)** lee la pestaña donde listas a quién le pagaste este año — nombre, monto, tipo de entidad, estado del W-9 — igual que lo leerías tú.
- **1099/W-9 Organizer (la skill)** ordena esa lista en quién probablemente necesita un 1099-NEC (según el umbral y la excepción corporativa vigentes del IRS), quién no, a quién le falta el W-9, y quién queda sin resolver y necesita una decisión humana — sin inventar nunca un total, un SSN/EIN, ni una clasificación de trabajador que no estaba en la planilla.

**Un ejemplo real:** es diciembre y quieres adelantarte a enero en vez de correr a último momento. Preguntas *"mira mi pestaña Contratistas y dime quién necesita un 1099 este año."* Google Sheets lee las filas, 1099/W-9 Organizer las ordena en necesita-1099 / no-necesita / falta-W-9 / sin-resolver, y marca a cualquiera que sea límite para tu contador. Lo que antes era revisar una planilla a mano contra las reglas del IRS, es una sola pregunta.

## Cómo usarlo

1. Lleva a tus contratistas/proveedores pagados en una pestaña de Google Sheet — nombre, total pagado, tipo de entidad si lo sabes, estado de W-9 en archivo si lo sabes.
2. Pregunta: *"lee mi pestaña [nombre] y dime quién necesita un 1099 este año."*
3. Persigue primero los W-9 faltantes, y lleva lo marcado "sin resolver" a tu contador antes de la fecha límite del 31 de enero.

## Por qué el combo funciona

Google Sheets solo devuelve celdas — no distingue un umbral de 1099-NEC de un número de teléfono. 1099/W-9 Organizer solo no tiene datos salvo que se los tipees a mano, un pagado a la vez. Juntos, el conector aporta los números que ya están en tu planilla, y la skill les aplica las reglas que declara el IRS — así que conseguir la respuesta no significa retipear tu propia contabilidad en un chat.

## Límites

- Es tan bueno como lo que hay en la planilla — una columna faltante (tipo de entidad, total pagado) aparece como "sin resolver", nunca como una adivinanza.
- Nunca inventa un SSN/EIN, nunca completa un W-9 en nombre de alguien, y nunca falla sobre una clasificación de trabajador genuinamente ambigua — eso va a un CPA/EA.
- No presenta nada ni marca ninguna casilla; lee tu planilla y organiza lo que encuentra. Este Plugin no presenta 1099s, W-9s ni W-2s electrónicamente — ningún conector del catálogo hace eso hoy.
