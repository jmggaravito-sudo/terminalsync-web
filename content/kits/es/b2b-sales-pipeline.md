---
name: Kit de Pipeline de Ventas B2B
logo: /logos/ts-kit.svg
category: sales
status: available
tagline: "Mantén el CRM al día, escribe la propuesta, y dale al equipo un estado claro — el ciclo de venta B2B con varios stakeholders, en un solo lugar."
description: "Un combo coherente para un vendedor B2B o un equipo chico de ventas que corre oportunidades por un CRM real: sacar a la luz las oportunidades frenadas o en riesgo en HubSpot, convertir el contexto de la oportunidad en una propuesta o respuesta a RFP estructurada, y mantener informado a liderazgo de ventas o CS con un update interno claro."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: hubspot
    reason: "Muestra el pipeline en sí: contactos, etapas de oportunidad, notas y tareas de seguimiento, así una oportunidad frenada o en riesgo queda visible en vez de perdida en algún inbox."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte el contexto de la oportunidad (oferta, stakeholders, objeciones, timeline) en una propuesta o respuesta a RFP estructurada, en vez de reescribir de cero para cada prospecto."
  - kind: skill
    slug: internal-comms
    reason: "Redacta el update interno de status de la oportunidad o la nota de handoff para liderazgo de ventas o Customer Success, así una oportunidad frenada o un handoff de vendedor a CS se marca en vez de quedar en silencio."
---
## Para quién es

Un vendedor B2B, account executive, o un equipo chico de ventas que corre oportunidades por un CRM real — varios stakeholders por cuenta, un pipeline de varias etapas, y gente interna (un manager, un par de CS, un deal desk) que necesita visibilidad más allá del inbox del vendedor.

Usalo cuando el trabajo recurrente es "¿qué oportunidades necesitan atención, qué le mando a este prospecto, y a quién adentro hay que avisarle?" — no un tracker de una sola persona, sino un CRM que es el registro real.

## Qué te ayuda a hacer

Este kit cubre el loop de CRM-a-comunicación de un ciclo de venta B2B:

- Encontrar las oportunidades frenadas, viejas, o sin próximo paso en HubSpot.
- Registrar llamadas, notas y tareas de seguimiento para que el CRM siga siendo el registro real de la cuenta.
- Convertir el contexto de la oportunidad en una **propuesta o respuesta a RFP** estructurada con Doc Co-authoring.
- Redactar el **update interno de status o el handoff** con Internal Comms, así un manager o un par de CS no es el último en enterarse.

El resultado esperado es un pipeline que se mantiene al día, una propuesta que refleja la oportunidad real en vez de una plantilla genérica, y un equipo interno que se entera del riesgo antes de perder la oportunidad, no después.

## Qué incluye

### Conectores

- **HubSpot** — lee y actualiza contactos, oportunidades, notas y tareas, así *"¿qué oportunidades no se movieron en dos semanas?"* tiene una respuesta real y el CRM no queda desactualizado entre llamada y llamada.

### Skills

- **Doc Co-authoring** — arma la propuesta o respuesta a RFP sección por sección a partir del contexto real de la oportunidad (oferta, stakeholders, objeciones, timeline), en vez de un borrador genérico de una sola pasada.
- **Internal Comms** — convierte un riesgo de oportunidad, un cambio de etapa, o un handoff de cuenta en un mensaje interno claro para quien tiene que actuar, no un export crudo del CRM.

## Cómo usarlo

1. Instalá el kit y conectá HubSpot con un token de Private App, con scopes de solo lectura para arrancar.
2. Preguntá *"¿qué oportunidades en Propuesta o etapas posteriores no tuvieron actividad en dos semanas?"* y revisá lo que devuelve HubSpot.
3. Dale a Doc Co-authoring la oferta, los stakeholders, las objeciones y el timeline de la oportunidad, y pedile un primer borrador de propuesta o respuesta a RFP.
4. Registrá la conversación resultante de vuelta en HubSpot: *"agregá una nota a este contacto y creá una tarea de seguimiento para el viernes."*
5. Cuando una oportunidad necesite atención interna, pedile a Internal Comms un update de status corto o una nota de handoff para tu manager o tu par de CS.

## Por qué estas piezas van juntas

El kit es coherente porque sigue el loop real de una oportunidad B2B, no un montón de herramientas de ventas sueltas:

- HubSpot guarda **el estado real de la cuenta** — quién está involucrado, en qué etapa, qué se dijo.
- Doc Co-authoring convierte ese estado en **lo que le mandás al prospecto**.
- Internal Comms convierte ese estado en **lo que tu propio equipo necesita escuchar**.

Instaladas por separado, el vendedor mantiene el CRM en una pestaña, redacta propuestas de cero en otra, y se olvida de avisarle a alguien interno hasta que la oportunidad ya está en riesgo. Instaladas juntas, el kit da un solo camino: **ver qué está frenado → escribir la propuesta con contexto real → avisarle a tu equipo antes de que sea una sorpresa**.

Se solapa con el Kit Dueño de Negocio en Doc Co-authoring e Internal Comms, y con Docs & Team Comms en Internal Comms — pero el propósito es distinto: el Kit Dueño de Negocio es un tracker liviano en Airtable para un dueño solo que hace de todo un poco, no un CRM que es el registro de sistema de un pipeline B2B con varios stakeholders.

## Límites

- No cierra oportunidades, no negocia ni manda nada en tu nombre — redacta y muestra, vos decidís y mandás.
- HubSpot necesita su propio token de Private App, y el kit solo ve los scopes que ese token otorga — arrancá en solo lectura y ampliá a propósito.
- Las acciones de creación/actualización en lote en HubSpot modifican registros reales del CRM y están frenadas por un paso de confirmación; una persona sigue aprobando el cambio.
- No es una herramienta de forecasting o reporting — para dashboards de pipeline y seguimiento de cuota, usá el reporting propio de HubSpot o una herramienta de BI.
- Internal Comms está pensado para mensajes a tu propio equipo (updates de status, handoffs); para el mensaje externo de cara al cliente, ese es el trabajo de Doc Co-authoring.
