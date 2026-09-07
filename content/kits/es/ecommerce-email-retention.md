---
name: Kit de Email y SMS de Retención para Ecommerce
logo: /logos/ts-kit.svg
category: marketing
status: available
tagline: "Convierte lo que realmente se está vendiendo en una campaña de email o SMS, y chequea si funcionó — sin exportar una planilla primero."
description: "Un combo coherente de marketing para un comerciante de ecommerce que vende en Square y maneja (o quiere manejar) campañas de email/SMS en Klaviyo: fundamentar la promo en datos reales de ventas y catálogo, redactar la copy, enviar la campaña, y chequear su rendimiento real."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: square
    reason: "Aporta los datos reales de ventas y catálogo — lo más vendido, lo bajo de stock, pedidos y clientes recientes — así una campaña de promo se fundamenta en lo que realmente pasa en la tienda en vez de una suposición."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte el objetivo de la promo y los datos de ventas/catálogo de Square en un asunto, cuerpo y llamado a la acción estructurados, listos para pegar en una campaña de Klaviyo en vez de una ventana en blanco."
  - kind: connector
    slug: klaviyo
    reason: "Convierte la copy redactada en una campaña real de email o SMS contra las listas y segmentos reales del comerciante, y reporta aperturas, clics y conversiones para saber si funcionó."
---
## Para quién es

Un comerciante de ecommerce o un equipo chico de marketing que vende a través de Square y maneja (o quiere manejar) campañas de email/SMS en Klaviyo, y quiere que cada campaña se fundamente en datos reales de ventas y catálogo en vez de una suposición sobre qué promocionar.

Úsalo cuando el trabajo recurrente es *"¿qué deberíamos promocionar, y la campaña funcionó?"* para una tienda cuyas ventas viven en Square y cuyas campañas salen por Klaviyo.

## Qué te ayuda a hacer

Este kit cubre el loop de promo-a-resultado del marketing de canal propio en ecommerce:

- Chequear **qué se está vendiendo, qué está bajo de stock, y quiénes son los clientes recientes**, directo de Square.
- Convertir esos datos reales más un objetivo de promo en **copy de campaña estructurada** (asunto, cuerpo, llamado a la acción) con Doc Co-authoring.
- Convertir la copy en una **campaña real de email o SMS** en Klaviyo, contra listas y segmentos reales.
- Chequear **cómo rindió la campaña** — aperturas, clics, conversiones — en Klaviyo, así la siguiente promo tampoco es una suposición.

El resultado esperado es una campaña de promo fundamentada en datos reales de inventario/ventas, redactada sin arrancar de una ventana en blanco, enviada a través de la propia cuenta de Klaviyo del comerciante, y chequeada contra números reales de rendimiento — en vez de tres herramientas desconectadas y una corazonada sobre qué mandar.

## Qué incluye

### Conectores

- **Square** — lee ventas, pedidos, catálogo, inventario y clientes de la tienda real, así "qué se está vendiendo" o "qué está bajo de stock" tiene una respuesta real para armar una promo.
- **Klaviyo** — convierte la copy redactada en una campaña real de email o SMS contra las propias listas y segmentos del comerciante, y reporta el rendimiento de campañas y flows (aperturas, clics, conversiones) después de enviarla.

### Skills

- **Doc Co-authoring** — convierte el objetivo de la promo y los datos de Square detrás de ella en copy de campaña estructurada — asunto, cuerpo y llamado a la acción — en vez de una ventana en blanco en Klaviyo.

### CLI

No incluye ninguna herramienta CLI. El usuario objetivo es un comerciante o un marketer, y el flujo — chequear ventas, redactar la copy, enviar la campaña, chequear el rendimiento — no necesita ejecución por terminal.

## Cómo usarlo

1. Instala el kit, conecta Square con un access token, y conecta Klaviyo con el login de su propia cuenta (OAuth, sin API key para pegar).
2. Pregunta *"¿qué se vendió bien esta semana, y qué está bajo de stock?"* para chequear Square antes de decidir qué promocionar.
3. Dale a Doc Co-authoring el objetivo de la promo (liquidar exceso de inventario, lanzar una línea nueva, una oferta de temporada) y los datos de Square, y pídele un asunto, cuerpo y llamado a la acción estructurados.
4. Pídele a Klaviyo que cree una campaña de email o SMS con esa copy contra la lista o segmento correcto, y revísala antes de enviarla — Klaviyo puede enviar campañas reales.
5. Unos días después, pregunta *"¿cómo rindió esa campaña?"* para conseguir aperturas, clics y conversiones de Klaviyo, y usa eso para la siguiente promo.

## Por qué estas piezas van juntas

El kit es coherente porque sigue un solo loop desde el dato real hasta el resultado chequeado, no un montón de herramientas de marketing sueltas:

- Square aporta **la señal real** de lo que pasa en la tienda — ventas, stock, clientes.
- Doc Co-authoring convierte esa señal más un objetivo en **copy que un cliente realmente puede leer**.
- Klaviyo convierte la copy en **una campaña real** y reporta **si funcionó**.

Instaladas por separado, el comerciante chequea un dashboard de Square, exporta números para entender qué promocionar, redacta la copy desde una hoja en blanco, y chequea el rendimiento de la campaña en otra pestaña días después sin ningún vínculo con lo que disparó la promo. Instaladas juntas, el kit da un solo camino: **chequear qué se vende → redactar la campaña alrededor de eso → enviarla → chequear si funcionó**.

Se superpone con el Kit de Tienda Ecommerce en Square, pero el propósito es distinto: ese kit es operación de catálogo e inventario de cara al equipo de tienda; este kit es campañas promocionales de cara al cliente. Para ads pagos de redes sociales o búsqueda en vez de email/SMS de canal propio, usa el Kit de Campañas de Marketing y SEO o el Kit de Estudio de Creativos para Ads Sociales — este kit no toca canales pagos.

## Límites

- No corre ads pagos de redes sociales o búsqueda, no maneja presupuestos de ads, ni produce creativos de ads — para eso, usa el Kit de Campañas de Marketing y SEO o el Kit de Estudio de Creativos para Ads Sociales.
- No maneja la operación diaria de la tienda, los anuncios al equipo, ni la copy de descripción de producto del catálogo en sí — para eso, usa el Kit de Tienda Ecommerce.
- Las campañas y envíos de SMS de Klaviyo son reales una vez que los confirmas; revísalos antes de enviar, y el SMS tiene sus propios requisitos de opt-in/cumplimiento que este kit no gestiona por ti.
- El set completo de funciones de Klaviyo está restringido por Klaviyo a roles Owner, Admin o Manager de la cuenta, según la propia doc de Klaviyo.
- Square y Klaviyo necesitan cada uno su propia cuenta/conexión, y el kit solo ve lo que esas cuentas permiten.
- No garantiza tasas de apertura, clics, ni ingresos de una campaña — eso depende de la oferta, la calidad de la lista y el timing, no solo de la copy.
