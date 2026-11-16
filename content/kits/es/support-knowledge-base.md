---
name: Kit de Base de Conocimiento de Soporte
logo: /logos/ts-kit.svg
category: support
status: available
tagline: "Saca las preguntas que los clientes hicieron de verdad esta semana, escribe el artículo del centro de ayuda que las responde, y avísale al equipo cuando la pregunta delata un problema de proceso."
description: "Un bundle de soporte coherente para quien atiende las preguntas de los clientes en un negocio que corre en Intercom: lee las conversaciones que de verdad entraron, convierte las que se repiten en artículos del centro de ayuda que los clientes encuentran, y dile al equipo qué tiene que cambiar para que la pregunta deje de volver."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: intercom
    reason: "Tiene la verdad de lo que los clientes preguntan de verdad — búsqueda de conversaciones, contactos, empresas y artículos sobre tu workspace real de Intercom — y además es donde aterriza el resultado: los artículos del centro de ayuda que leen los clientes y las notas internas que ve tu equipo. Sin él, la lista de artículos pendientes es memoria, no datos."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte una pila de preguntas reales en un artículo con estructura — brief, outline, borrador, revisión — así la respuesta se escribe una vez y bien, en vez de reescribirse en el chat cada vez que la misma pregunta aparece de nuevo."
  - kind: skill
    slug: internal-comms
    reason: "Se encarga de la mitad del soporte que no es el cliente: cuando la pregunta se repite por una política o un proceso, el equipo necesita una actualización clara — qué cambió, a quién afecta, qué hacer ahora — no otro ticket sin resolver."
---
## Para quién es

El dueño o responsable de soporte de un negocio que corre sus conversaciones de clientes en Intercom — una agencia, un estudio, una tienda online con una bandeja de verdad, una empresa de servicios cuyo correo de soporte se volvió una cola.

El trabajo recurrente que cubre este kit: *las mismas preguntas entran una y otra vez, el centro de ayuda no las responde, y nadie tiene tiempo de escribir los artículos*. Hoy la respuesta vive en la cabeza de un agente y se reescribe cliente por cliente.

## Qué te ayuda a hacer

Este kit cubre el loop de las preguntas reales a las respuestas publicadas:

- **Ver lo que entró de verdad**: busca y lee las conversaciones de la semana y detecta las preguntas que se repiten.
- **Escribir la respuesta una vez**: co-autoriza un artículo del centro de ayuda que responda bien la pregunta recurrente — la pregunta como la formula el cliente, la respuesta corta, los pasos, los casos límite.
- **Publicarlo donde el cliente busca**: crea o actualiza el artículo en el centro de ayuda de Intercom. Lo revisas antes de publicar, porque los artículos los ven los clientes.
- **Arreglar la causa**: cuando la pregunta delata un hueco de proceso o de política, deja una nota interna en la conversación y mándale al equipo una actualización clara.

El resultado esperado: el centro de ayuda responde las preguntas que los clientes hacen de verdad, y entran menos conversaciones desde cero — el equipo se entera de lo que cambió en vez de absorber el mismo ticket para siempre.

## Qué incluye

### Conectores

- **Intercom** — las preguntas y el destino. Lee conversaciones, contactos, empresas y los artículos que ya tienes, con tu propio login de Intercom (OAuth en el navegador; sin pegar ningún token), y escribe las dos cosas que este flujo produce: artículos del centro de ayuda (`create_article`, `update_article`) y notas internas en conversaciones. No puede responder a un cliente — eso se queda contigo, a propósito.

### Skills

- **Doc Co-Authoring** — el artículo. Guía la pieza por brief → outline → borrador → revisión para que la respuesta quede estructurada y consistente entre rondas, en vez de un párrafo que alguien escribió en el chat y se perdió.
- **Internal Comms** — la mitad del equipo. Redacta la actualización para tu propia gente cuando una pregunta recurrente expone un hueco de política o de proceso: qué cambió, a quién afecta, qué hacer ahora.

### CLI

No incluye ninguna herramienta CLI. El usuario objetivo no es técnico, y este flujo necesita una bandeja y un documento, no una terminal.

## Cómo usarlo

1. Instala el kit y conecta Intercom con tu propia cuenta — el puente `mcp-remote` abre el login de Intercom en el navegador y apruebas el acceso. Sin API key.
2. Arranca de la bandeja real: *"Busca las conversaciones de la semana pasada y lista las preguntas que aparecieron más de una vez."*
3. Elige una y co-autoriza el artículo con Doc Co-Authoring: *"Redacta un artículo del centro de ayuda sobre nuestra política de devoluciones basado en estas conversaciones"* — pregunta, respuesta, pasos, excepciones.
4. Publícalo donde el cliente busca: *"Crea el artículo en nuestro centro de ayuda."* Revísalo antes de publicar — los artículos los ven los clientes.
5. Cierra el loop con el equipo: si la pregunta expuso un hueco de verdad, *"Agrega una nota interna en la conversación diciendo que estamos actualizando la política"*, y pídele a Internal Comms la actualización que tu equipo debe leer.

## Por qué estas piezas van juntas

El soporte se parte en tres trabajos que normalmente viven en tres lugares distintos: escuchar lo que preguntan los clientes, escribir la respuesta, y avisarle al equipo lo que hay que cambiar. Este kit corre los tres sobre el mismo workspace:

- Intercom tiene **las preguntas** (búsqueda de conversaciones sobre la bandeja real) y a la vez es **el destino** — los artículos del centro de ayuda que leen los clientes y las notas internas que ve el equipo. El resultado no sale del sistema donde ocurre el trabajo.
- Doc Co-Authoring hace que el artículo valga la pena leerlo, así la respuesta se escribe una vez y se reutiliza.
- Internal Comms hace que la pregunta deje de repetirse, llegando a la gente que puede cambiar la política o el proceso detrás de ella.

Quita cualquier pieza y el loop se rompe: sin Intercom los artículos responden preguntas que nadie hizo y el paso de publicar es copiar y pegar a mano; sin Doc Co-Authoring la respuesta vive en el scrollback del chat y ahí se muere; sin Internal Comms el mismo ticket vuelve para siempre porque la causa nunca se arregló.

Este kit escribe **conocimiento**, no respuestas. El conector de Intercom no tiene ninguna tool para contestarle a un cliente, y ninguna pieza acá pretende lo contrario — ese es el límite honesto: es un kit de base de conocimiento y comunicación de equipo, no un kit de automatización de respuestas.

## Límites

- No responde a los clientes directamente. El conector de Intercom no tiene tool para responder a un cliente — redactar y enviar respuestas se queda contigo en Intercom.
- Las únicas acciones de escritura son `create_article`, `update_article` y notas internas. Nada más del workspace se modifica.
- Los artículos son visibles para los clientes una vez publicados; revísalo antes de publicar. Las notas internas solo las ve tu equipo y quedan atribuidas al admin que autorizó la conexión.
- Requiere una cuenta de Intercom y un login OAuth en el navegador. Intercom documenta el MCP hospedado para workspaces hospedados en **EE. UU. y la UE** (la UE usa otra dirección, `mcp.eu.intercom.com`, que este conector no usa); los workspaces hospedados en Australia no están soportados.
- La página de Intercom no lista requisitos de plan ni de rol. Si el login o las escrituras fallan, consulta con tu admin de Intercom — un 401 en notas internas normalmente significa que la conexión es anterior al scope de escritura y hay que reconectarla.
- Si tu soporte corre en otro helpdesk, este kit no es para ti — el conector es específico de Intercom. Aquí no va ningún conector de email, WhatsApp ni chat.
