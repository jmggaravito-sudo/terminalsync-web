---
name: Airtable
logo: /plugins/airtable.svg
category: marketing
status: available
tagline: "Tu lista de clientes, segmentada por quién merece tu esfuerzo — sin exportar CSV."
description: "Junta el conector de Airtable, que lee la base de clientes que ya llevas (clientes, pedidos, historial de compras), con Segmentación RFM (puntúa a cada cliente por recencia, frecuencia y gasto, los agrupa en Campeones / Leales / En riesgo, y nombra una acción por grupo), para que 'quiénes son mis mejores clientes' se responda desde tu base viva y no desde una planilla exportada."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: airtable
skillSlugs: ["rfm-segmentacion"]
---
## Cuándo usarlo

- Los datos de tus clientes o pedidos viven en una base de Airtable (un CRM de clientes, un registro de pedidos) y sigues exportándolos a una planilla para entender quiénes son tus mejores clientes.
- Quieres saber quiénes son tus clientes estrella, quiénes compraban y se están alejando, y quiénes casi no interactúan — con los datos que ya tienes, no por intuición.
- Quieres una acción concreta por grupo (premiar a los Campeones, recuperar a los En riesgo), no solo un gráfico.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Airtable (el conector)** lee las bases que le autorices — puede listar y buscar registros, así que el agente toma tus clientes con su fecha de última compra, su cantidad de compras y su gasto total directo desde la base.
- **Segmentación RFM (la skill)** puntúa a cada cliente de 1 a 5 en Recencia, Frecuencia y valor Monetario usando los rangos de tus propios datos — no umbrales fijos —, los agrupa en segmentos en lenguaje claro (Campeones, Leales, Potenciales, Nuevos, En riesgo, Hibernando, Perdidos), dimensiona cada uno por clientes y porción de ingresos, y recomienda una acción por segmento.

**Un ejemplo real:** llevas una tabla "Clientes" con cada compra. Pides *"haz una segmentación RFM de mis clientes y dime qué hacer con cada grupo"*. El agente lee los registros desde tu base de Airtable — sin exportar ni pegar nada — y la skill devuelve los segmentos con cuántos clientes y cuántos ingresos representa cada uno, más el único segmento por el que empezar.

## Cómo usarlo

1. Instala el Plugin y conecta Airtable — un Personal Access Token con acceso de lectura a la base donde están tus clientes; eliges exactamente qué bases puede ver.
2. Verifica que tu base tenga lo que necesita el RFM: fecha de última compra, cantidad de compras y gasto total por cliente.
3. Pide: *"Lee mis clientes de Airtable y haz una segmentación RFM."*
4. Revisa los segmentos y la acción por grupo; empieza por el segmento que la skill señale como el de mayor impacto.

## Por qué el combo funciona

La skill de RFM por sí sola necesita una lista de clientes con historial de compras — datos que de otro modo tendrías que exportar, limpiar y pegar a mano. El conector por sí solo lee tu base pero no sabe qué hacer con tres columnas de fechas y montos. Juntos: la base que ya llevas se convierte en la entrada, y "¿a quién le apunto con la próxima oferta?" se responde en el mismo lugar — sin planillas en el medio.

## Límites

- Solo puede segmentar lo que esté en la base que conectes — los clientes que compraron por canales que no registras en Airtable son invisibles para él.
- La segmentación necesita campos de compra reales: si falta la fecha de última compra, la cantidad de compras o el gasto, la skill dice qué falta en lugar de inventar números.
- Nunca promete un resultado — el puntaje 0–100 con el que cierra refleja la calidad de tus datos, no un pronóstico de quién volverá a comprar.
- Para este trabajo basta con leer: el conector también puede escribir registros si le das permisos de escritura, pero este Plugin no los necesita.
