---
name: Kit de Reuniones con Clientes
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Mira qué llamadas con clientes vienen esta semana, saca lo que realmente se dijo, y conviértelo en seguimiento con dueño y fecha — el loop completo de la reunión en un solo lugar."
description: "Un combo coherente de operaciones para un consultor, dueño de agencia, coach o freelancer cuyo negocio vive de las reuniones con clientes: ver las reuniones de la semana antes de que pasen, sacar el resumen y las decisiones después, convertir los acuerdos en tareas con seguimiento, y mantener al equipo alineado — en vez de dejar que lo acordado se evapore cuando la llamada termina."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: google-calendar
    reason: "Muestra la semana de clientes antes de que pase — qué viene, de qué va cada reunión, dónde estás libre — así preparas en vez de descubrir la agenda cuando arranca la llamada, y es donde se agenda el seguimiento mientras está fresco."
  - kind: connector
    slug: zoom
    reason: "Guarda lo que realmente se dijo — resúmenes con IA, transcripciones, grabaciones con próximos pasos — así *¿qué acordamos?* tiene una respuesta real en vez de dos personas recordándolo distinto, y convierte las notas en un doc de seguimiento."
  - kind: connector
    slug: todoist
    reason: "Convierte lo acordado en tareas reales con fecha, prioridad y proyecto, así las promesas de la llamada se vuelven trabajo con seguimiento en vez de buenas intenciones que reaparecen un mes después."
  - kind: skill
    slug: internal-comms
    reason: "Redacta el resumen para el equipo de qué se decidió y qué cambia — audiencia, tono, quién tiene qué, qué sigue — en vez de reenviar una transcripción cruda que nadie lee."
---
## Para quién es

Un consultor, dueño de agencia, coach, o cualquier dueño de negocio de servicios cuya semana es una serie de llamadas con clientes. Las reuniones ya las tienes — el trabajo recurrente que cubre este kit es todo lo que las rodea: prepararse, recordar qué se dijo y qué se acordó, y asegurarse de que el seguimiento realmente pase.

Úsalo cuando las preguntas recurrentes son *"¿qué acordamos?"*, *"¿quién tenía que hacer eso?"* y *"¿cuándo vuelvo a ver a este cliente?"* — y nadie las puede responder sin volver a ver una grabación.

## Qué te ayuda a hacer

Este kit cubre el loop alrededor de una reunión con clientes — antes, durante y después:

- **Antes**: ver las reuniones de clientes de la semana y de qué va cada una, para entrar preparado en vez de descubrir la agenda cuando arranca la llamada.
- **Después**: sacar el resumen, la transcripción o la grabación de lo que realmente se dijo — decisiones, objeciones, números — sin volver a ver la llamada entera.
- **Seguimiento**: convertir lo acordado en tareas con fecha y prioridad, y agendar la próxima reunión mientras tienes el calendario abierto adelante.
- **Alineación**: darle al equipo un resumen claro de qué se decidió y qué cambia, así las decisiones no quedan atrapadas en la grabación.

El resultado esperado: nada de lo acordado en una reunión con un cliente se pierde entre la llamada y el trabajo.

## Qué incluye

### Conectores

- **Google Calendar** — el mapa de la semana de clientes: qué viene, qué es cada evento, si estás libre antes de comprometerte, y dónde se agenda la llamada de seguimiento.
- **Zoom** — el registro de lo que se dijo: resúmenes de reunión generados con IA, transcripciones, grabaciones con links de reproducción y próximos pasos, el chat del equipo, y Zoom Docs de seguimiento creados a partir de tus notas y puntos de acción.
- **Todoist** — el seguimiento: tareas creadas con fecha, prioridad y proyecto, y que se leen de vuelta cuando preguntas *"¿qué no terminé esta semana?"*.

### Skills

- **Internal Comms** — convierte los resultados de la reunión en un resumen para el equipo: qué se decidió, qué cambia, quién tiene qué, y qué sigue, con el tono justo para la audiencia — no un volcado crudo de la transcripción.

## Cómo usarlo

1. Instala el kit, conecta Zoom con tu propia cuenta de Zoom (login en el navegador — sin API key), conecta Google Calendar con su setup único de Google Cloud, y pega tu token de API de Todoist.
2. El lunes, pregunta *"¿qué reuniones con clientes tengo esta semana y de qué va cada una?"* — y prepara las que lo necesiten.
3. Después de una reunión, pide *"saca el resumen y los puntos de acción de la llamada de hoy con [cliente]"* — Zoom trae lo que se dijo y acordó, y puede redactar el doc de seguimiento.
4. Convierte los acuerdos en trabajo: *"crea una tarea en Todoist por cada punto de acción, para esta semana"*, y *"agenda el seguimiento con [cliente] en dos semanas si estoy libre"*.
5. Cuando una decisión afecta al equipo, pídele a Internal Comms un resumen corto — qué se decidió, qué cambia, quién lo tiene — y compártelo donde lee tu equipo.

## Por qué estas piezas van juntas

El kit sigue el loop real de un negocio que vive de reuniones con clientes, no un montón de herramientas de productividad sueltas:

- Google Calendar te dice **qué viene** — la preparación y la agenda.
- Zoom guarda **lo que se dijo** — el resumen, la transcripción y la grabación que hacen respondible el *"¿qué acordamos?"*.
- Todoist sigue **qué pasa después** — acuerdos convertidos en trabajo con fecha y prioridad.
- Internal Comms cierra el loop **con el equipo** — las decisiones se vuelven un mensaje que la gente de verdad lee.

Instaladas por separado, miras un calendario, vuelves a ver una grabación, guardas las promesas en la cabeza, y el equipo se entera de las decisiones de segunda mano. Instaladas juntas, un solo camino cubre el loop entero: **ver la reunión → capturar lo que se dijo → tarea al seguimiento → informar al equipo.**

Comparte Internal Comms con el Kit de Operaciones de Equipo, pero el terreno es distinto: ese kit corre sobre el tablero de tareas de ClickUp para el status del día a día del equipo; este corre sobre la reunión con el cliente — el calendario, la llamada, y las promesas hechas en ella.

## Límites

- Lee lo que Zoom conservó: si una reunión no fue grabada ni resumida por Zoom — eso depende de tu plan y configuración de Zoom — no hay nada para sacar, y el kit no puede reconstruir una reunión que no dejó registro. Las reuniones fuera de Zoom (una llamada telefónica, Google Meet, Teams) no dejan registro acá.
- No maneja la reunión por ti: sin enforcement de agenda, sin notas en vivo, sin logging en CRM — para el seguimiento de negocios y pipeline, usa el Kit de B2B Sales Pipeline.
- Zoom y Google Calendar se conectan con tus propias cuentas (OAuth); el setup único de proyecto de Google Cloud de Calendar es el paso más engorroso de la instalación. Todoist necesita su token de API. Cada pieza queda acotada por los permisos de esa cuenta.
- Crear eventos, tareas y docs de seguimiento cambia cosas reales — esas acciones están frenadas por un paso de confirmación antes de escribir nada.
- Zoom Workspace es un server hospedado por Zoom, alcanzado a través del puente `mcp-remote`; lo que el agente puede ver o crear queda acotado por tu cuenta de Zoom.
