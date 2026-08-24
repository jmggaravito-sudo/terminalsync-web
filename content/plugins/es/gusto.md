---
name: Gusto
logo: /connectors/gusto.svg
category: operations
status: available
tagline: "Tus números de nómina, ya sacados — conectados a tu checklist de temporada de impuestos."
description: "Junta el conector de Gusto (empleados, contratistas, calendarios de pago y datos de nómina de solo lectura de tu cuenta de Gusto) con Tax Prep Checklist (convierte tipo de entidad, estados, empleados y contratistas en una checklist de documentos personalizada), para que '¿qué necesito antes de la temporada de impuestos?' arranque de tus números reales de nómina en vez de una adivinanza."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gusto
skillSlugs: ["tax-prep-checklist"]
---
## Cuándo usarlo

- Llevas la nómina por **Gusto** y quieres llegar a la temporada de impuestos con tu cantidad real de empleados, estados y pagos a contratistas ya sacados — no tipeados de memoria.
- Dijiste "¿qué necesito para declarar los impuestos de mi negocio este año?" y quieres que el intake (¿tienes empleados?, ¿en qué estados?, ¿pagaste contratistas?) se responda con tus propios datos de nómina.
- Quieres que el aviso de "persigue los W-9 faltantes" y las declaraciones de impuestos de nómina reflejen a quién le pagaste de verdad este año, no una lista genérica.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Gusto (el conector)** lee tu planilla de empleados y sus estados de trabajo, tu lista de contratistas y cuánto se les pagó, y tu calendario de pago — de solo lectura, directo de tu cuenta de Gusto.
- **Tax Prep Checklist (la skill)** convierte eso en una checklist de documentos personalizada: qué ítems específicos de la entidad aplican, si las declaraciones de impuestos de nómina van en la lista, y — como tienes contratistas — el aviso explícito de perseguir cualquier W-9 faltante antes de la fecha límite.

**Un ejemplo real:** es noviembre y quieres adelantarte a la reunión con tu contador. Preguntas *"¿qué necesito para los impuestos este año, según mi cuenta de Gusto?"*. Gusto reporta que tienes 4 empleados en dos estados y le pagaste a 3 contratistas este año, Tax Prep Checklist usa eso para incluir las declaraciones de impuestos de nómina en la lista y nombra el chequeo de W-9 para cada uno de los 3 contratistas — marcando lo que no puede confirmar (como cuáles contratistas ya tienen un W-9 en archivo, porque Gusto no lleva ese dato) como pregunta abierta para tu contador.

## Cómo usarlo

1. Instala el Plugin y conecta **Gusto** — se abre una ventana del navegador para que entres y apruebes qué categorías de datos compartes (Empresa, Empleados, Contratistas, Nómina).
2. Pregunta: *"¿qué necesito para prepararme para los impuestos este año?"* — menciona tu tipo de entidad si la skill todavía no lo tiene.
3. Revisa la checklist, y lleva lo marcado "consultá a tu contador" como tu agenda para esa reunión.

## Por qué el combo funciona

Tax Prep Checklist solo tiene que preguntarte cantidad de empleados, estados y contratistas a mano — de esas cosas fáciles de errar de memoria en noviembre. Gusto solo reporta datos de nómina pero no sabe qué necesita de eso una checklist de documentos fiscales. Juntos, el conector responde las preguntas de intake con tu cuenta de nómina real, y la skill lo convierte en la lista categorizada — sin calcular nunca cuánto debes ni reemplazar a tu contador.

## Límites

- Gusto es de **solo lectura**: este Plugin no puede correr la nómina, editar un empleado, ni chequear si un W-9 está en archivo — las tools de Gusto no exponen el estado del W-9, así que ese chequeo sigue necesitando tus propios registros o al contratista.
- Nunca te dice cuánto debes, qué formularios presentar, ni cómo clasificar un trabajador límite — eso va a un CPA/EA o a IRS.gov, igual que la skill sola.
- Refleja solo lo que hay en Gusto — los ingresos, gastos y datos bancarios viven en otro lado y no son parte de este Plugin.
- Requiere conectar tu cuenta de Gusto por OAuth; solo ve las categorías de datos que apruebes.
