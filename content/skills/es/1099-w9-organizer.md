---
name: 1099/W-9 Organizer
logo: /skills/1099-w9-organizer.svg
category: finance
vendors: ["claude", "codex", "gemini"]
author: "TerminalSync"
status: available
tagline: "Sabé quién necesita un 1099 antes de que te agarre la fecha límite"
description: "Lee tu lista de contratistas/proveedores pagados este año y te dice quién probablemente necesita un 1099-NEC, a quién le falta el W-9, y qué queda sin saber — usando los umbrales y reglas que declara el IRS, sin adivinar nunca un monto, SSN o EIN que no diste."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]
---
## Cuándo usarlo

- Dijiste "¿a quién le tengo que mandar un 1099?", "¿junté los W-9 de todos a los que pagué?", o "¿estoy por perderme la fecha límite del 1099?"
- Tenés una lista de personas/negocios a los que pagaste este año (contratistas, freelancers, proveedores) y querés ordenarla en "necesita un 1099", "no necesita" y "no hay info suficiente para saber".
- No estás seguro si alguien a quien pagaste cuenta como contratista (necesita un 1099) o debería haber sido empleado (no lo necesita) — querés que se marque la distinción, no que se decida por vos.
- Querés un tracker del estado de recolección de W-9 para no andar corriendo en enero.

No lo uses para completar un W-9/1099 con datos inventados (SSN, EIN, dirección) ni para tomar la decisión final de clasificación de trabajador — marca los casos ambiguos para un CPA/EA, no los resuelve.

## Qué hace

Toma tu lista de pagados (nombre, qué se le pagó, total pagado, y si hay W-9 en archivo si se sabe) y devuelve:

- **Probablemente necesita un 1099-NEC**: no-empleado, pagado $600 o más en el año, la estructura del negocio no es una C-corp/S-corp (según el umbral y la excepción corporativa vigentes del IRS) — citado como la regla actual, con nota para confirmar en IRS.gov porque los umbrales pueden cambiar.
- **Probablemente no necesita uno**: pagado por debajo del umbral, marcado como corporación, o pagado a través de una red de terceros (tarjeta de crédito/PayPal/Stripe) donde la plataforma — no vos — emite el 1099-K.
- **Falta el W-9**: cualquiera en el grupo "probablemente necesita un 1099" sin W-9 en archivo, para que lo persigas antes de la fecha límite de enero en vez de después.
- **Sin resolver / necesita un humano**: cualquiera donde no se dio el tipo de entidad, el total pagado o el estado trabajador-vs-empleado, o que se ve límite (por ejemplo, alguien pagado con regularidad de empleado) — nunca puesto en un grupo por defecto en silencio.
- **Recordatorio de fecha límite**: indica la fecha límite general de presentación del 1099-NEC (31 de enero) como un dato para verificar en el año fiscal actual, no una fecha personalizada.

Nunca inventa el SSN/EIN de un pagado, nunca completa un W-9 en nombre de alguien, y nunca falla sobre si un trabajador legalmente debería ser empleado W-2 en vez de contratista 1099 — esa determinación tiene consecuencias legales reales y se marca para un CPA/abogado laboral, no se decide acá.

## Cómo usarlo

1. Listá a quién le pagaste este año: nombre/negocio, total pagado, tipo de entidad si lo sabés (individuo, LLC, corporación), y si ya tenés un W-9 firmado.
2. Recibí la clasificación en tres: necesita un 1099, no necesita, y sin resolver.
3. Perseguí primero los W-9 faltantes — no podés presentar un 1099 preciso sin uno.
4. Llevá lo que quede en "sin resolver", especialmente las alertas de clasificación de trabajador, a tu contador antes de la fecha límite, no después.

## Ideal para

Dueños de pequeños negocios y founders solo que pagan contratistas o freelancers y no tienen un bookkeeper que les rastree las obligaciones de 1099. No reemplaza a un CPA/EA cuando el estado de un pagado es genuinamente ambiguo — el trabajo de la skill es achicar la pila a los pocos casos que realmente necesitan un profesional, no tomar la decisión legal final.
