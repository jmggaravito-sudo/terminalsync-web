---
name: Segmentación RFM
logo: /skills/rfm-segmentation.svg
category: marketing
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Ordená a tus clientes por Recencia, Frecuencia y Monto"
description: "Convierte un export de clientes/pedidos o una tienda conectada en segmentos RFM (campeones, leales, en riesgo, dormidos, nuevos) con una acción clara por grupo, y aclara qué pudo y qué no pudo ver antes de recomendar gasto."
license: "proprietary"
marketplaceSource: "terminalsync"
catalogReady: false
compatibleWith: ["claude", "codex"]
---
## Cuándo usarlo

- Tenés clientes y pedidos —en Shopify, Square, HubSpot, un Google Sheet o un CSV— y querés saber **a quién tratar distinto** en vez de mandarle lo mismo a todos.
- Estás por gastar en una campaña y querés apuntarla a los clientes con más chances de responder.
- Te repiten "enfocate en tus mejores clientes" pero no tenés una lista concreta de quiénes son.
- Querés la segmentación reutilizable que después una automatización de win-back o de promos puede usar — este skill es la capacidad que el agente USA; no manda nada por su cuenta.

Si no podés conectar una tienda, funciona con una tabla de pedidos pegada o exportada (id de cliente, fecha del pedido, total del pedido). Si solo tenés totales sin fechas, te va a decir que no se puede calcular RFM y te ofrece una división más simple.

## Qué hace

Arma una segmentación RFM a partir de tu historial de pedidos:

- **Nota de datos**: cuántos clientes y pedidos vio, el rango de fechas y lo que falta (sin fechas, sin id por cliente, devoluciones no excluidas) que debilita el resultado.
- **Los tres puntajes**: Recencia (hace cuánto fue el último pedido), Frecuencia (cuántos pedidos), Monto (total gastado) — cada uno puntuado 1–5 con los umbrales que usó, así ves por qué cada cliente cayó donde cayó.
- **Segmentos con nombre y un plan**: campeones (premiar + pedir referidos/reseñas), leales (upsell), potenciales leales (empujar a un segundo/tercer pedido), nuevos (onboarding), en riesgo (win-back antes de perderlos), dormidos (oferta de última chance), perdidos (no gastar de más). Cada uno con la cantidad y la parte de la facturación.
- **Dónde está la plata**: qué segmentos concentran la facturación, para que gastes en los pocos que importan.
- **El veredicto (cierra siempre con esto)**: un **puntaje 0–100** de qué tan accionable es esta segmentación según la calidad de los datos; un semáforo con umbral (🟢 80+ datos limpios, actuá; 🟡 50–79 usable, pero cerrá el gap de datos que se marcó; 🔴 <50 falta historial o faltan fechas/ids — arreglá el export primero); **el único próximo movimiento de mayor impacto** (casi siempre un segmento para accionar esta semana); y el recordatorio de que el puntaje refleja los datos que pudo ver, no una garantía de respuesta.

Sólo ve las filas que le das. No inventa facturación, no adivina fechas faltantes ni promete que un segmento va a convertir.

## Cómo usarlo

1. Conectá Shopify/Square/HubSpot, o pegá/exportá una tabla de pedidos con al menos: id de cliente o email, fecha del pedido, total del pedido.
2. Contale el contexto: *"Segmentá mis últimos 12 meses de pedidos; vendo consumibles de recompra"* vs. *"venta única de ticket alto."*
3. Pedí los segmentos ordenados por facturación, con la acción por segmento y las cantidades.
4. Elegí un segmento y pedile que redacte el próximo paso (un mensaje de win-back, un beneficio VIP) — o pasá el segmento al skill/loop que corresponda.
5. Re-corrélo cada mes; RFM es una foto en movimiento, no una etiqueta fija.

## Ideal para

Dueños de tienda, marketers y responsables de retención que quieren dejar de tratar a todos los clientes igual y no tienen un analista de datos. Mejor cuando tenés al menos unos meses de pedidos con fecha y un identificador por cliente; más débil para tiendas nuevas, negocios de compra única o exports sin fechas.
