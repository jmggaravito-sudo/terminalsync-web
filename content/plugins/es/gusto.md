---
name: Gusto
logo: /plugins/gusto.svg
category: operations
status: available
tagline: "Tu lista de contratistas ya vive en Gusto — el orden del 1099 sin exportar nada."
description: "Junta el conector de Gusto (oficial, solo lectura: tus contratistas y su historial de pagos, con el login de tu propia cuenta) con 1099/W-9 Organizer (ordena a quién le pagaste en quién probablemente necesita un 1099-NEC, quién no, a quién le falta el W-9 y qué queda sin resolver), para que enero no empiece con un export a CSV."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gusto
skillSlugs: ["1099-w9-organizer"]
---
## Cuándo usarlo

- Pagas contratistas por Gusto, y la fecha límite del 1099 es de esas cosas que prefieres resolver en una tarde y no a las apuradas en enero.
- Quieres preguntar "¿a quién le tengo que mandar un 1099?" y recibir una respuesta leída de la misma cuenta con la que les pagas — no de una planilla que volviste a armar a mano.
- Quieres saber en todo momento a quién le falta el W-9 mientras todavía hay tiempo de perseguirlo.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Gusto (el conector)** es el server oficial y hospedado por la propia Gusto. Lo conectas con el login de tu cuenta — no hay API key que pegar — y lee tus contratistas, su historial de pagos, tus calendarios de pago y tus nóminas. Es solo lectura por diseño: no puede correr una nómina, mover dinero ni cambiar el registro de nadie.
- **1099/W-9 Organizer (la skill)** ordena esa lista de pagados en quién probablemente necesita un 1099-NEC (según el umbral y la excepción corporativa vigentes del IRS), quién probablemente no (por debajo del umbral, una corporación, o pagado por tarjeta/PayPal, donde la plataforma —no tú— emite el 1099-K), a quién le falta el W-9, y quién queda sin resolver y necesita una decisión humana — sin inventar nunca un total, un SSN/EIN, ni una clasificación de trabajador.

**Un ejemplo real:** es diciembre y quieres adelantarte a enero en vez de correr a último momento. Preguntas *"mira a quién le pagamos como contratista este año y dime quién necesita un 1099."* Gusto lee la lista de contratistas y cuánto se le pagó a cada uno; 1099/W-9 Organizer los ordena en necesita-1099 / no-necesita / falta-W-9 / sin-resolver, y marca a cualquiera cuyo tipo de entidad o total no alcance para clasificarlo. Lo que antes era un export de nómina más una tarde de reglas del IRS, es una sola pregunta.

## Cómo usarlo

1. Conecta Gusto con el login de tu propia cuenta: se abre una ventana del navegador, inicias sesión y eliges qué categorías de datos compartir — dales Contractor Data y Payroll Data, y solo lo que quieras que el agente vea.
2. Pregunta: *"¿a quién le pagamos como contratista este año y quién necesita un 1099?"*
3. Persigue primero los W-9 faltantes, y lleva lo marcado "sin resolver" a tu contador antes de la fecha límite del 31 de enero.

## Por qué el combo funciona

Gusto solo puede decirte cuánto le pagaste a cada contratista — no le aplica las reglas del IRS a la lista, y su propio server es solo lectura por diseño. 1099/W-9 Organizer solo necesita que le retipees tus pagados en un chat, un contratista a la vez. Juntos, el conector aporta los nombres y los totales que ya están en tu cuenta de nómina, y la skill les aplica las reglas que declara el IRS. Es el mismo combo que ofrece el Plugin de Google Sheets para una planilla — pero apuntando a la cuenta de la que salieron los pagos.

## Límites

- Solo lectura de punta a punta: nunca presenta un 1099, nunca junta un W-9, nunca corre una nómina y nunca edita el registro de un contratista. Presentar sigue pasando en Gusto, en tu software de impuestos o con tu contador.
- Es tan bueno como lo que Gusto expone: donde el tipo de entidad, el estado del W-9 o el total pagado no están disponibles, el pagado queda en "sin resolver" — nunca en una adivinanza.
- Nunca inventa un SSN/EIN y nunca decide si alguien debería ser empleado W-2 en vez de contratista — la clasificación dudosa se marca para un CPA/EA, no se resuelve acá.
- La fecha límite del 31 de enero que menciona es la regla general del 1099-NEC para verificar en el año fiscal vigente, no una fecha personalizada.
