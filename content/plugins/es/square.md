---
name: Square
logo: /plugins/square.svg
category: marketing
status: available
tagline: "Los clientes que acaban de volver — con el pedido de reseña esa misma semana, no tres meses después."
description: "Junta el conector de Square (oficial, publicado por Block: pagos, pedidos, clientes, loyalty) con Pedir Reseñas (detecta a los clientes con más probabilidad de decir algo bueno y escribe el pedido para email, WhatsApp o SMS), para que la reseña se pida mientras la buena experiencia sigue fresca."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: square
skillSlugs: ["pedir-resenas"]
---
## Cuándo usarlo

- Cobras con Square, y las reseñas públicas — Google, un marketplace, tu propio sitio — son la forma en que te encuentran los clientes nuevos.
- Sabes que a quien hay que pedirle es al que acaba de tener una buena experiencia; solo que nunca llegas a hacerlo.
- Quieres el mensaje escrito y el follow-up planeado, y quieres elegir a quién se le manda en vez de enviárselo a todos.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Square (el conector)** es el server oficial publicado por Block. Habla con la Connect API de Square — pagos, pedidos, clientes, loyalty — así el agente puede leer quién compró, quién volvió y cuándo.
- **Pedir Reseñas (la skill)** elige el momento justo (inmediatamente después de un pedido completado, una segunda compra, un problema resuelto — nunca al azar), prioriza a los clientes recientes y recurrentes, se salta a cualquiera con una queja abierta, y escribe el pedido para email, WhatsApp o SMS con tu link directo de reseña — más exactamente un follow-up amable.

**Un ejemplo real:** viernes a la tarde preguntas *"¿qué clientes compraron más de una vez en los últimos dos meses? Escríbales un pedido de reseña para WhatsApp."* Square lee el historial de pedidos y nombra a los recurrentes; Pedir Reseñas redacta un mensaje corto y personal con tu link de reseña y un solo follow-up, y te da un veredicto sobre si el segmento está lo bastante afinado para mandarlo. Lo mandas desde tu propio teléfono.

## Cómo usarlo

1. Conecta Square con tu access token. El manifest viene en modo sandbox por defecto — pásalo a producción cuando quieras que lea tu negocio real.
2. Pega el link directo a donde quieres la reseña: Google, tu página del marketplace o tu sitio.
3. Pide: *"¿quiénes son mis clientes recurrentes este trimestre? Escríbeme el pedido de reseña y un follow-up para WhatsApp."*
4. Revisa el mensaje, comprueba que el link funcione, y mándalo desde tu propia herramienta.

## Por qué el combo funciona

Square sabe quién compró y quién volvió — no escribe el pedido, y no tiene opinión sobre a quién vale la pena pedirle. Pedir Reseñas escribe un buen pedido, pero por sí sola necesita que le describas a tus clientes de memoria. Juntos, el conector aporta la señal de "acaba de tener una buena experiencia" que la skill está hecha para apuntar, y la skill la convierte en un mensaje que vale la pena mandar. Es la mitad que pide del mismo ciclo de reputación que el Plugin de Google Business cubre de punta a punta — con Square como fuente de a quién pedirle.

## Límites

- El pedido lo mandas tú, desde tu propio email/WhatsApp/SMS — el conector no le escribe a tus clientes, y la skill nunca publica una reseña en nombre de nadie.
- Este plugin solo necesita leer, pero el servidor oficial de Square también puede escribir (expone toda la API de Square, reembolsos incluidos). Antes de pasar a producción, considera activar su opción de solo lectura (`DISALLOW_WRITES`) para que solo se pueda leer.
- Nada de incentivos atados a una calificación: no va a redactar "déjanos 5 estrellas y te damos 10% de descuento", porque la mayoría de las plataformas lo prohíbe y esto no te ayuda a romper sus reglas.
- El conector viene sandboxeado por defecto; en producción tu token actúa sobre tu cuenta real, así que trátalo como una contraseña.
- No promete cuántas reseñas van a caer. Apunta bien el pedido; el cliente igual decide.
