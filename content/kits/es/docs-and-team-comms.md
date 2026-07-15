---
name: Kit de Docs y Comunicación Interna
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Redactá documentación apoyada en el Notion de tu equipo y convertila en anuncios internos claros."
description: "Un bundle de operaciones para equipos de conocimiento y ops que escriben documentación y comunicaciones internas, manteniendo los borradores apoyados en el Notion y el Slack que el equipo ya usa en vez de arrancar de una página en blanco."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: doc-coauthoring
    reason: "Co-escribe y reestructura documentación con el usuario, produciendo docs claros y bien organizados en vez de un muro de texto."
  - kind: skill
    slug: internal-comms
    reason: "Convierte una decisión o un doc en un anuncio interno claro con el encuadre correcto para el equipo, no un pegado crudo."
  - kind: connector
    slug: notion
    reason: "Lee y escribe los docs y la wiki del equipo para que los borradores estén apoyados en el contexto actual y vuelvan a donde el equipo ya mira."
  - kind: connector
    slug: slack
    reason: "Trae el contexto del hilo de lo que se va a anunciar y es donde se comparte la comunicación interna resultante."
---
## Para quién es

Equipos de operaciones, conocimiento y programa que dedican tiempo real a escribir documentación y anuncios internos, y que ya mantienen su fuente de verdad en Notion y sus conversaciones en Slack.

Usalo cuando el trabajo recurrente es "escribí esto claro, apoyado en lo que ya tenemos, y después contáselo al equipo".

## Qué te ayuda a hacer

Este kit conecta la redacción con la distribución:

- Leer los docs y la wiki de Notion del equipo para que un borrador arranque de contexto real, no de una página en blanco.
- Co-escribir y reestructurar un documento con Doc Co-authoring en algo claro y organizado.
- Traer el contexto del hilo de Slack de lo que hay que anunciar.
- Convertir el doc o la decisión en un anuncio interno claro con Internal Comms.

El resultado esperado es una decisión documentada, apoyada en el material propio del equipo, y un anuncio a juego listo para compartir — sin reescribir todo desde cero.

## Qué incluye

### Skills

- **Doc Co-authoring** — co-escribe y reestructura docs con el usuario. Es el motor de redacción del kit.
- **Internal Comms** — convierte un doc o una decisión en un anuncio interno claro con el encuadre correcto. Cierra el loop de "documentado" a "comunicado".

### Conectores

- **Notion** — lee y escribe los docs y la wiki del equipo, para que los borradores estén apoyados en el contexto actual y se guarden donde el equipo ya mira.
- **Slack** — trae el contexto del hilo detrás de un anuncio y es la superficie donde se comparte la comunicación interna.

### CLI

No se incluye ninguna CLI. El usuario objetivo suele ser no-técnico, y el workflow — leer contexto, redactar, anunciar — no requiere ejecución en la terminal.

## Cómo usarlo

1. Instalá el kit y conectá Notion y Slack.
2. Pedile al asistente que lea la(s) página(s) de Notion relevante(s) y resuma el estado actual.
3. Usá Doc Co-authoring para redactar o reestructurar el doc, y guardalo de vuelta en Notion.
4. Traé el contexto del hilo de Slack de la decisión que se comunica.
5. Usá Internal Comms para convertir el doc en un anuncio corto y claro, y compartilo en el canal de Slack correcto.

## Por qué estas piezas van juntas

El kit sirve porque escribir y contarle al equipo son un mismo workflow:

- Notion apoya el borrador en lo que el equipo ya sabe.
- Doc Co-authoring hace que el borrador sea realmente claro y estructurado.
- Internal Comms lo reencuadra para una audiencia en vez de pegar un doc crudo.
- Slack es donde esa audiencia realmente está.

Instalados por separado, el usuario copia contexto entre herramientas a mano y reescribe el mismo contenido para el doc y para el anuncio. Instalados juntos, el kit da un camino coherente: **apoyarse en Notion → redactar el doc → reencuadrar como comunicación → compartir en Slack**.

## Límites

- No toma la decisión ni es dueño del mensaje; una persona aprueba qué se publica y se anuncia.
- Trabaja con el contenido de Notion y Slack al que tiene acceso; espacios y canales privados a los que no está conectado quedan fuera de alcance.
- Notion y Slack requieren sus propias conexiones y están sujetos a los permisos de esas cuentas.
- No es una plataforma completa de comunicación interna (sin programación, aprobaciones ni analytics) — redacta y te ayuda a compartir, nada más.
- Para comunicación externa o de cara al cliente, usá otro workflow — este kit está acotado a docs y comunicación internos.
