---
name: Gusto
logo: /connectors/gusto.svg
category: operations
status: available
tagline: "Tu foto real de nómina, convertida directo en tu lista de preparación de impuestos."
description: "Combina el conector de Gusto (datos de solo lectura de empleados, contratistas y nómina de tu cuenta) con Tax Prep Checklist (arma una lista de documentos personalizada según tipo de entidad, estado y plantilla), para que las preguntas sobre empleados, contratistas y reportes de nómina se respondan con tus datos reales de Gusto en vez de una suposición."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gusto
skillSlugs: ["tax-prep-checklist"]
---
## Cuándo usarlo

- Manejas la nómina por **Gusto** y quieres llegar a la temporada de impuestos con una lista de documentos personalizada en vez de una lista genérica que tienes que adaptar tú mismo.
- No estás seguro de quién contó exactamente como empleado o como contratista este año, o si algo cambió (una contratación nueva, una desvinculación, una nueva sede) que suma a lo que necesitas reunir.
- Quieres que las alertas de "consulta a tu contador" de la lista estén basadas en tu planilla y tu historial de pagos reales, no en una suposición sobre si siquiera tienes empleados.

## Qué hace

Combina dos piezas que se potencian entre sí, en una sola instalación:

- **Gusto (el conector)** lee la planilla de tu empresa, la lista de contratistas y su historial de pagos, los calendarios de pago y las corridas de nómina directo de tu cuenta — de solo lectura, no puede ejecutar la nómina, mover dinero ni cambiar un registro.
- **Tax Prep Checklist (la skill)** convierte tipo de entidad, estado, plantilla y lo que cambió este año en una lista de documentos por categoría — documentos de ingresos, documentos de gastos, elementos específicos de la entidad y alertas abiertas para tu contador — sin estimar nunca cuánto debes.

**Un ejemplo real:** es enero y quieres adelantarte a la temporada de impuestos. Le dices *"arma mi lista de preparación de impuestos — primero trae mi información de empleados y contratistas de Gusto"*. Gusto reporta que tienes 4 empleados W-2 en dos estados y le pagaste a 3 contratistas el año pasado, además de una desvinculación en septiembre. Tax Prep Checklist usa eso para armar la lista exacta para tu situación — declaraciones de nómina para ambos estados, W-9 pendientes de confirmar de cada contratista antes de la fecha límite del 1099-NEC, y una alerta sobre la desvinculación de septiembre para tu contador — en vez de pedirte que respondas esas preguntas de memoria.

## Cómo usarlo

1. Instala el Plugin y conecta tu cuenta de Gusto (inicia sesión con Gusto, y elige qué categorías de datos compartir — Empresa, Empleados, Contratistas, Nómina, Control de tiempo).
2. Pide: *"arma mi lista de preparación de impuestos del negocio usando mis datos de Gusto"*.
3. Responde las preguntas pendientes que Gusto no cubra (tu tipo de entidad, los estados donde operas más allá de la nómina, fuentes de ingreso que no pasan por nómina).
4. Usa la lista por categoría —y las alertas de "consulta a tu contador"— como tu guía para reunir documentos y tu agenda para la reunión de entrega.

## Por qué funciona el combo

Tax Prep Checklist sola tiene que preguntarte si tienes empleados, si pagaste contratistas, y si algo cambió este año — preguntas que podrías responder de memoria y equivocarte. Gusto sola te da la planilla y los datos de pago en bruto, pero no los convierte en una lista de documentos ni te dice qué te va a pedir un contador. Juntas: la IA lee primero tus datos reales de nómina, y luego arma la rama de la lista que corresponde a tu situación real — menos respuestas adivinadas, y la alerta de W-9 antes del 1099 recae sobre los contratistas a los que Gusto realmente muestra que les pagaste.

## Límites

- **Gusto es de solo lectura.** No puede ejecutar la nómina, mover dinero, ni crear, editar o borrar el registro de un empleado — para cualquier cosa más allá de consultar, sigues trabajando directo dentro de Gusto.
- **Este Plugin no calcula cuánto debes, no prepara una declaración, ni interpreta la ley fiscal para tu situación.** Tax Prep Checklist solo organiza documentos y datos; las decisiones límite (trabajador o contratista, deducible o no) siempre quedan marcadas para tu contador o IRS.gov, nunca respondidas.
- Refleja solo lo que está en Gusto — ingresos, gastos o pagos a contratistas hechos fuera de Gusto quedan afuera de su alcance y deben agregarse a mano.
- Requiere conectar tu cuenta de Gusto; solo ve las categorías de datos a las que le des acceso.
