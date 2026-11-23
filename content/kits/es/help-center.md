---
name: Kit de Centro de Ayuda
logo: /logos/ts-kit.svg
category: support
status: available
tagline: "Mira qué preguntas se repiten sin un artículo que las responda, escribe bien las entradas que faltan en el centro de ayuda, publícalas, y deja una nota al equipo para que sepa dónde mandar al cliente."
description: "Un bundle de soporte coherente para el dueño o responsable de soporte que atiende a sus clientes en Intercom: compara lo que los clientes realmente preguntan contra lo que el centro de ayuda realmente responde, redacta los artículos que faltan con un proceso de coautoría estructurado, publícalos donde el cliente los lee, y marca las conversaciones que cierra cada uno."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: intercom
    reason: "Tiene las dos mitades del hueco que este kit existe para cerrar — las conversaciones que los clientes realmente mandan (buscarlas, leer una completa) y los artículos que el centro de ayuda realmente tiene (listar, buscar, leer) — más las acciones de publicación (crear y actualizar artículos) y la nota para el equipo (nota interna), así los artículos se escriben desde tickets reales en vez de FAQs adivinadas."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte una pila de tickets crudos en un artículo que vale la pena publicar — brief, esquema, borrador, revisión — manteniendo estructura, terminología y preguntas abiertas consistentes entre pasadas, en vez de una respuesta de una sola vez que se lee como un mensaje de chat pegado en el centro de ayuda."
---
## Para quién es

Un dueño o responsable de soporte de una pyme que atiende a sus clientes en Intercom — donde las mismas diez preguntas llegan cada semana, algunas no están respondidas en ningún lado, y el centro de ayuda es un puñado de artículos que dejó de parecerse al producto hace meses.

El trabajo recurrente que cubre este kit es mantener el centro de ayuda sincronizado con lo que los clientes realmente preguntan: encontrar las preguntas que no tienen un artículo detrás, escribir esos artículos bien, publicarlos, y avisarle al equipo que existen. No es un kit para atender la bandeja de entrada en sí — mira Límites.

## Qué te ayuda a hacer

Este kit cubre el loop de mantenimiento del centro de ayuda, desde el ticket real hasta el artículo publicado y la conversación que cierra:

- **Ver el hueco**: consulta las preguntas que se repiten en las conversaciones recientes y chequea cuáles no responde tu centro de ayuda — la diferencia es la lista de pendientes, ordenada por cuánto la pegan los clientes de verdad.
- **Escribir el artículo**: redacta cada artículo faltante con una pasada estructurada — qué pregunta responde, qué secciones necesita, qué terminología usa realmente el producto — anclado en cómo lo formularon las conversaciones reales.
- **Publicarlo**: crea el artículo en tu centro de ayuda, o actualiza el que está mal o incompleto — recordando que el cliente lo ve en el momento en que se guarda.
- **Cerrar el loop**: deja una nota interna en las conversaciones que el nuevo artículo responde, para que el equipo la linkee la próxima semana en vez de reescribir la misma respuesta.

El resultado esperado: el centro de ayuda deja de ser una página vieja y empieza a desviar los tickets que le tocan — menos preguntas repetidas, y las que llegan reciben un link en vez de una respuesta reescrita.

## Qué incluye

### Conectores

- **Intercom** — las dos mitades del hueco y la forma de cerrarlo. Lee tus conversaciones (búscalas, lee una completa, ve el cliente y la empresa detrás) y tu centro de ayuda (lista, busca y lee artículos); escribe las tres cosas que puede — crear un artículo, actualizar uno y dejar una nota interna que ve tu equipo. Se conecta con tu login de Intercom en el navegador; sin token que pegar. No puede responderle a un cliente — esa parte queda en tus manos, y este kit nunca lo promete.

### Skills

- **Doc Co-Authoring** — el proceso de escritura. Guía cada artículo de brief a esquema a borrador a revisión, manteniendo la estructura y la terminología consistentes de un artículo al siguiente, para que el centro de ayuda se lea como si un solo equipo lo hubiera escrito en vez de doce respuestas improvisadas.

## Cómo usarlo

1. Instalá el kit y conectá Intercom con tu propia cuenta — un login en el navegador, sin token.
2. Encontrá la lista de pendientes: *"¿Qué preguntas se repitieron más en las conversaciones de este mes, y cuáles no tienen un artículo de ayuda?"*
3. Elegí la que más se repite y redactala con Doc Co-Authoring: dale los hilos de conversación como material de origen y la respuesta que tu equipo realmente da, y dejá que la pasada de brief → esquema → borrador → revisión la moldee en un artículo.
4. Revisalo como lo leería un cliente y publícalo: *"Creá este artículo de ayuda con el título …"*. Los clientes lo ven en cuanto se guarda — ese es el punto, y la razón para revisar antes.
5. Cerrá el loop en los tickets que lo motivaron: *"Dejá una nota interna en estas conversaciones apuntando al artículo nuevo."* La próxima semana, el equipo linkea en vez de reescribir.

## Por qué estas piezas van juntas

El kit sigue el loop real del mantenimiento de un centro de ayuda, no un puñado de herramientas de soporte:

- Intercom tiene **la evidencia y el destino** — las conversaciones que prueban qué preguntas se repiten, la lista de artículos que muestra qué falta, y las acciones que publican la solución y marcan los tickets como hechos.
- Doc Co-Authoring convierte esa evidencia en **un artículo que vale la pena publicar** — la diferencia entre una entrada de centro de ayuda y un mensaje de chat pegado en una es la estructura, y la estructura es justo lo que hace esta skill.

Instaladas por separado, te llevás un resumen de tu bandeja en una ventana de chat que se cierra y se evapora, y artículos escritos de memoria que se despegan de lo que los clientes realmente preguntan. Instaladas juntas, un solo camino cubre el loop: **leer los tickets → escribir el artículo que falta → publicarlo → anotar las conversaciones que cierra.**

Esta es la mitad del rol de soporte que un kit puede cubrir honestamente hoy. La otra mitad — redactar las respuestas que los clientes reciben — no tiene ninguna pieza en el catálogo que la sirva, así que este kit no la promete: nada de lo incluido acá toca una respuesta orientada al cliente.

## Límites

- **Requiere Intercom.** El conector apunta al endpoint MCP de Intercom para workspaces hospedados en EE. UU.; los workspaces hospedados en la UE usan una dirección distinta que este conector no usa, y los workspaces de Australia no están soportados. La página de Intercom no lista requisitos de plan ni de rol — si el login falla, consultá con tu administrador de Intercom.
- **No responde a los clientes.** El conector no tiene ninguna tool que envíe un mensaje a un cliente; las respuestas quedan en tus manos en Intercom. Las notas internas son solo para el equipo, y quedan atribuidas al administrador que autorizó la conexión — un 401 en una nota suele significar que la conexión es anterior al scope de escritura y hay que reconectar.
- **Publicar es visible para el cliente.** Los artículos los pueden ver tus clientes en el momento en que se guardan; revisar antes de publicar es parte del flujo, no un paso opcional.
- **No hace todo lo que necesita un equipo de soporte.** No migra ni importa un centro de ayuda desde otra plataforma, no diseña tu estructura de centro de ayuda desde cero, ni mide cuántos tickets desvió realmente un artículo — eso necesita trabajo fuera de este kit.
- **Reporta lo que la bandeja le da.** Encontrar huecos es tan bueno como las conversaciones que le apuntes; un centro de ayuda para un producto con poco historial de tickets no tiene nada que minar todavía, y esos artículos deben salir de tu propio conocimiento del producto.
