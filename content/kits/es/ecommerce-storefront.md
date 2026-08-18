---
name: Kit de Tienda Ecommerce
logo: /logos/ts-kit.svg
category: ecommerce
status: available
tagline: "Chequea ventas y stock, redacta la descripción de una línea nueva de productos, y avísale al equipo qué cambió — el día a día de manejar una tienda en Square."
description: "Un combo coherente para un comerciante o un equipo chico de retail que maneja su tienda en Square: leer ventas, inventario y pedidos en castellano llano, co-escribir la descripción de una nueva línea de productos, y avisarle al equipo de tienda qué es nuevo antes de que llegue al mostrador o al sitio."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: square
    reason: "Lee y actualiza la tienda real: catálogo, pedidos, inventario, clientes y pagos, así las preguntas sobre ventas o stock tienen una respuesta real y se pueden agregar productos nuevos sin abrir el dashboard."
  - kind: skill
    slug: doc-coauthoring
    reason: "Co-escribe la descripción estructurada de una línea nueva de productos o una actualización de catálogo a partir de los datos del producto, en vez de textos sueltos e inconsistentes."
  - kind: skill
    slug: internal-comms
    reason: "Convierte una línea nueva, un cambio de precio, o una política de promo en un mensaje claro para el equipo de tienda, así se enteran antes de que un cliente pregunte."
---
## Para quién es

Un comerciante o un equipo chico de retail que maneja su tienda en Square — en persona, online, o ambas — que necesita chequear ventas y stock sin abrir un dashboard, redactar la descripción de productos nuevos, y asegurarse de que el equipo se entere de los cambios antes que los clientes.

Úsalo cuando el trabajo recurrente es *"¿qué vendimos, qué está bajo de stock, y el equipo sabe qué hay de nuevo?"* para un negocio cuyo catálogo, pedidos y pagos viven en Square.

## Qué te ayuda a hacer

Este kit cubre el día a día de manejar una tienda en Square:

- Chequear **ventas y pedidos**: qué se vendió hoy, qué está sin despachar, qué compró un cliente puntual.
- Chequear y actualizar el **catálogo e inventario**: agregar un producto nuevo, ver qué está bajo de stock.
- Co-escribir la **descripción** de una línea nueva de productos o una actualización de catálogo con Doc Co-authoring, a partir de los datos reales del producto en vez de una hoja en blanco.
- Redactar el **anuncio para el equipo de tienda** sobre una línea nueva, un cambio de precio, o una política de promo con Internal Comms, así el equipo se entera antes que un cliente.

El resultado esperado es un comerciante que puede preguntar en castellano llano sobre su tienda, lanzar una línea nueva con descripciones reales, y mantener al equipo alineado — sin tres herramientas separadas que no se hablan entre sí.

## Qué incluye

### Conectores

- **Square** — lee y actualiza el catálogo, pedidos, inventario, clientes y pagos de la tienda real; por default corre en modo sandbox hasta que estés listo para apuntarlo a tu cuenta real.

### Skills

- **Doc Co-authoring** — convierte los datos de una línea nueva de productos o una actualización de catálogo en descripciones estructuradas y consistentes, iterando sección por sección en vez de un texto suelto distinto por producto.
- **Internal Comms** — convierte un cambio de catálogo (línea nueva, cambio de precio, actualización de política de promo o devoluciones) en un mensaje claro para el equipo de tienda, así el personal de mostrador y el equipo online quedan alineados sobre qué cambió.

## Cómo usarlo

1. Instala el kit y conecta Square con un access token (arranca en modo sandbox; pasa a producción cuando estés listo).
2. Pregunta *"¿qué vendimos hoy, y qué sigue sin despachar?"* o *"¿qué está bajo de stock?"* para chequear la tienda.
3. Cuando agregues una línea nueva, dale a Doc Co-authoring los nombres, precios y datos clave de los productos, y pídele descripciones estructuradas para cada uno.
4. Pídele a Square que agregue los productos nuevos al catálogo una vez que la descripción esté lista.
5. Pídele a Internal Comms que redacte un anuncio corto para el equipo de tienda sobre la línea nueva, un cambio de precio, o una promo — listo para publicar donde el equipo ya mira.

## Por qué estas piezas van juntas

El kit es coherente porque sigue el loop de una actualización de catálogo real, no un montón de herramientas de retail sueltas:

- Square guarda **la tienda real** — qué está en venta, qué hay en stock, qué se pidió.
- Doc Co-authoring convierte los productos nuevos en **descripciones que los clientes pueden leer**.
- Internal Comms convierte el mismo cambio en **lo que el equipo necesita saber**.

Instaladas por separado, el comerciante chequea el dashboard, escribe descripciones de cero en un editor de textos, y le avisa al equipo de boca en boca o no le avisa. Instaladas juntas, el kit da un solo camino: **chequear la tienda → redactar la descripción de lo nuevo → avisarle al equipo antes de que los clientes pregunten**.

## Límites

- No procesa pagos reales, no despacha pedidos ni maneja un depósito — lee y actualiza el catálogo, los pedidos y el inventario de Square; el cumplimiento y el envío pasan fuera de este kit.
- El manifest de Square arranca en modo sandbox; tienes que cambiarlo a propósito a producción para que el conector actúe sobre tu tienda real, y actúa con los mismos permisos que tenga tu access token.
- No publica la descripción en ningún lado — Doc Co-authoring la redacta, tú la pegas en tu tienda, publicación o sitio.
- No manda el anuncio al equipo por su cuenta — Internal Comms lo redacta, tú lo publicas o mandas por el canal que tu equipo realmente use (este kit no incluye un conector de mensajería).
- Es un kit de operación de tienda, no de contabilidad o impuestos — para los libros y el reporte financiero, usa el Kit de Finanzas para Negocio Chico en su lugar.
