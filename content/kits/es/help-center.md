---
name: Kit de Centro de Ayuda
logo: /logos/ts-kit.svg
category: support
status: available
tagline: "Convierte las preguntas que los clientes repiten en artículos del centro de ayuda que encuentran y usan solos."
description: "Un bundle de soporte coherente para el dueño o la persona que atiende soporte en un negocio que corre sus conversaciones de clientes en Intercom: encuentra cuáles preguntas se repiten en la bandeja real, lee cómo se resolvió de verdad el caso, coescribe un artículo claro, publícalo en el centro de ayuda y apunta los tickets abiertos hacia él."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: intercom
    reason: "Tiene los dos extremos del loop: la evidencia cruda (conversaciones reales, contactos, empresas) y el estante donde cae la respuesta (artículos del centro de ayuda que puede crear y actualizar). También es la frontera honesta del kit — no puede responderle a un cliente, y por eso mismo la respuesta tiene que volverse un artículo en vez de otra respuesta suelta."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte un hilo de soporte desordenado en un artículo con estructura — brief, outline, borradores por sección, rondas de revisión — manteniendo audiencia, tono y lo que se decidió de verdad consistente entre rondas, en vez de un draft de una sola pasada que invente tu política de reembolsos o esconda una pregunta abierta."
---
## Para quién es

El dueño, o la persona que atiende soporte, de un negocio chico que corre sus conversaciones de clientes en Intercom. El trabajo recurrente que cubre este kit es el de toda semana repetitiva de bandeja: las mismas preguntas llegan una y otra vez — reembolsos, tiempos de envío, cómo resetear algo, qué incluye un plan — y las respuestas viven en tickets viejos, no en ningún lugar donde el cliente las encuentre.

Úsalo cuando el patrón honesto sea *"ya respondimos esto tres veces este mes"* y el centro de ayuda esté vacío, flaco o desactualizado.

## Qué te ayuda a hacer

Este kit cubre el loop de una pregunta repetida a una respuesta publicada:

- **Encontrar lo que se repite**: busca en las conversaciones reales por tema y mira cuántos clientes lo preguntaron, con qué palabras y qué se les prometió.
- **Tener la respuesta verdadera**: lee el hilo donde el equipo resolvió el caso de verdad, para que el artículo refleje lo que el negocio realmente hace — no una suposición verosímil.
- **Escribirlo bien**: coescribe el artículo con estructura — audiencia, outline, borradores por sección, rondas de revisión — en vez de un párrafo flaco de una sola pasada.
- **Ponerlo donde el cliente mira**: crea o actualiza el artículo del centro de ayuda para que la próxima persona se sirva sola, y deja una nota interna en los tickets ya abiertos apuntando a tu compañero hacia él.

El resultado esperado: cada pregunta que llega dos veces se vuelve un artículo, así la tercera vez no necesita a ninguna persona. La bandeja se achica por las preguntas que dejas de tener que responder, no por ignorar a nadie.

## Qué incluye

### Conectores

- **Intercom** — la bandeja y el centro de ayuda en una sola conexión. Lee conversaciones, contactos, empresas y los artículos del centro de ayuda que ya existen; escribe artículos del centro de ayuda y notas internas solo para el equipo. Se conecta con tu propio login de Intercom en el navegador — sin pegar ningún token. No puede enviar respuestas a clientes a propósito, y este kit nunca promete que pueda.

### Skills

- **Doc Co-Authoring** — el proceso de escritura del artículo. Lo guía por brief → outline → borradores por sección → revisión → final, preservando la audiencia, el tono, las decisiones y las preguntas abiertas entre rondas, así el artículo dice lo que el negocio realmente hace y marca lo que falta confirmar en vez de inventarlo.

## Cómo usarlo

1. Instala el kit y conecta Intercom con tu propia cuenta — un login en el navegador, sin API key. Tus permisos de Intercom viajan con la conexión.
2. Nombra el tema que no para de volver: *"Busca en nuestras conversaciones de los últimos 30 días lo de reembolsos y resume qué preguntan los clientes de verdad y qué les respondimos."*
3. Abre el mejor hilo: *"Lee esta conversación y lista qué prometimos, qué cobramos y qué le dijimos al cliente que hiciera."*
4. Coescríbelo: pídele a Doc Co-Authoring primero el outline — pregunta, respuesta corta, pasos, casos borde — y después el draft sección por sección. Todo lo que no esté confirmado en un hilo entra como pregunta abierta, no como política.
5. Publícalo: *"Crea un artículo del centro de ayuda titulado 'Cómo funcionan los reembolsos' con este contenido."* Revisa título y cuerpo antes de que salga — los artículos son visibles para el cliente en el momento en que existen.
6. Para los tickets ya abiertos sobre ese tema: *"Agrega una nota interna a esta conversación apuntando al artículo nuevo"* — y la respuesta la envías tú en Intercom.

## Por qué estas piezas van juntas

El kit sigue el loop real del soporte autoservicio, no una pila de herramientas de soporte:

- Intercom tiene **la evidencia y el destino** — las conversaciones donde la pregunta se respondió de verdad, y el centro de ayuda donde la respuesta tiene que vivir. Sin él no hay de qué escribir ni dónde publicar.
- Doc Co-Authoring hace que **el tramo del medio quede bien** — un artículo con estructura y revisión en vez de un ticket parafraseado, que es la diferencia entre un artículo que resuelve la pregunta y uno que genera el siguiente ticket.

Instaladas por separado, obtienes respuestas precisas en una ventana de chat que se cierra y desaparece, y un centro de ayuda que sigue vacío porque escribirlo no es el trabajo de nadie. Instaladas juntas, un solo camino cubre el loop: **encontrar lo repetido → leer la respuesta real → escribirla con estructura → ponerla en el centro de ayuda → apuntar los tickets abiertos hacia ella.**

Comparte Doc Co-Authoring con los kits de finanzas y ventas, pero el artefacto y la audiencia son distintos: aquellos escriben memos y propuestas que lee el dueño; este escribe la página pública que lee un cliente, con fuente en tickets reales en vez de memoria. Y es deliberadamente **no** un kit de respuestas de servicio al cliente — el conector de Intercom no tiene tool de respuesta, así que la promesa de este kit es exactamente lo que las piezas pueden hacer: convertir tickets en artículos de autoservicio.

## Límites

- **Requiere Intercom.** Si tus conversaciones de clientes corren en otra bandeja u otro helpdesk, no hay nada que conectar; este kit no tiene un ancla equivalente para otra plataforma de soporte.
- **No puede responderle a un cliente.** El conector no tiene tool de respuesta, y este kit no promete triage en vivo, cobertura de chat ni respuestas automáticas. Las respuestas siguen siendo tuyas en Intercom — el trabajo del kit es que hagan falta menos.
- **Los artículos son visibles para el cliente apenas se crean o actualizan.** Revisa antes de publicar. Las notas internas son la única escritura que se queda dentro del equipo.
- **La conexión apunta a workspaces hospedados en EE. UU.** Intercom hospeda los workspaces de la UE en otra dirección MCP que este conector no usa, y los workspaces hospedados en Australia no tienen soporte en el MCP de Intercom.
- **Las escrituras quedan atribuidas a quien autorizó la conexión** (el admin que inició sesión), y si las notas internas fallan con un error de permisos, reconecta para que la conexión tome el scope de escritura.
- **La página de Intercom no documenta requisitos de plan ni de rol** — si el login falla, consultá con tu admin de Intercom.
- **El artículo es tan verdadero como el hilo de donde salió.** La skill marca las suposiciones en vez de inventar hechos, pero no conoce tu política: confirma todo lo que involucre plata, reembolsos o compromisos antes de que sea público.
