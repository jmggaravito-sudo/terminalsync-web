---
name: Gusto
logo: /connectors/gusto.svg
category: operations
status: available
tagline: "Tus pagos a contratistas, leídos directo de Gusto — ordenados según quién necesita un 1099."
description: "Junta el conector de Gusto (lee tu lista de contratistas y su historial de pagos directo de tu cuenta de nómina, solo lectura) con 1099/W-9 Organizer (ordena a los pagados en necesita-un-1099, no necesita, y falta-W-9 según las reglas que declara el IRS), para que los números detrás de la clasificación vengan de tu plataforma de nómina real y no de una lista tipeada a mano."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gusto
skillSlugs: ["1099-w9-organizer"]
---
## Cuándo usarlo

- Le pagás a contratistas a través de Gusto y querés saber quién necesita un 1099-NEC sin sacar un reporte y re-tipearlo en una planilla.
- Querés detectar los W-9 faltantes antes de la fecha límite de enero, usando los totales de pago que Gusto ya tiene registrados.
- Querés la lectura honesta sobre qué puede y qué no puede decirte — esto no presenta nada ni calcula cuánto debés.

## Qué hace

Junta dos piezas que se refuerzan entre sí, en una sola instalación:

- **Gusto (el conector)** lee tu planilla de contratistas y su historial de pagos — `list_company_contractors` y `list_company_contractor_payments` — directo de tu cuenta de nómina, solo lectura.
- **1099/W-9 Organizer (la skill)** toma esa lista de pagados y los totales pagados y los ordena en probablemente-necesita-un-1099-NEC, probablemente-no-necesita, falta-W-9, y sin resolver — según el umbral y la excepción corporativa vigentes del IRS, sin adivinar nunca un monto que no se le dio.

**Un ejemplo real:** decís *"¿a quién le tengo que mandar un 1099 este año?"* Gusto trae tu lista de contratistas y lo que se le pagó a cada uno a través de la plataforma. 1099/W-9 Organizer ordena esa lista: quién cruzó el umbral de $600, quién es una corporación y probablemente está exento, y a quién le falta un W-9 en archivo — para que persigas el papeleo faltante mientras todavía hay tiempo antes de la fecha límite.

## Cómo usarlo

1. Instala el Plugin y conectá Gusto — inicia sesión con tu cuenta de Gusto y otorgá acceso a Datos de Contratistas y Datos de Nómina (sin ninguna API key que pegar).
2. Pedí: *"Traé los pagos a mis contratistas este año y decime quién necesita un 1099."*
3. Revisá la clasificación en tres y perseguí primero cualquier W-9 faltante marcado.
4. Llevá lo que quede marcado "sin resolver" — como un caso límite de clasificación de trabajador — a tu contador antes de la fecha límite.

## Por qué funciona el combo

1099/W-9 Organizer sola es tan buena como la lista de pagados que le das — si escribís mal un total o te olvidás de alguien, la clasificación sale mal. Gusto solo puede mostrarte los pagos a contratistas, pero no sabe del umbral de $600, la excepción corporativa, ni a cuál de tus pagados todavía le falta un W-9. Juntos: Gusto aporta los números reales de pago, y la skill les aplica las reglas que declara el IRS — así la clasificación se construye sobre tus datos reales de nómina, no sobre una copia a mano.

## Límites

- Gusto es de **solo lectura** — no puede presentar un 1099, correr la nómina, ni editar el registro de un contratista; eso sigue pasando adentro de Gusto o de tu software de presentación.
- 1099/W-9 Organizer nunca inventa el SSN/EIN de un pagado y nunca toma la decisión final de clasificación de trabajador — los casos ambiguos se marcan para tu CPA/EA, no se decide acá.
- Solo ve contratistas y pagos en las categorías a las que le diste acceso a Gusto (Datos de Contratistas, Datos de Nómina).
- Las tools de pagos a contratistas de Gusto no rastrean si hay un W-9 firmado en archivo — ese estado sigue viniendo de lo que le digas a la skill.
