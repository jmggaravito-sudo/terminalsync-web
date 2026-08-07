---
name: LTV y Cohortes
logo: /skills/ltv-cohorts.svg
category: finance
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Mirá el valor de vida por cohorte y cuánto vale adquirir un cliente"
description: "Agrupa clientes por cuándo compraron la primera vez, sigue cuánto gasta cada cohorte en el tiempo, estima el valor de vida, y muestra cuánto podés pagar para adquirir un cliente — con los supuestos dichos en claro."
license: "proprietary"
marketplaceSource: "terminalsync"
catalogReady: false
compatibleWith: ["claude", "codex"]
---
## Cuándo usarlo

- Sabés tu facturación mensual pero no cuánto vale un cliente en el tiempo, así que estás adivinando cuánto podés gastar para conseguir uno.
- Querés ver si los clientes nuevos son mejores o peores que los viejos (¿la retención mejora o se cae de a poco?).
- Estás decidiendo gasto en ads, un descuento o un precio de suscripción y necesitás un número defendible, no una corazonada.
- Querés el análisis reutilizable que un loop de finanzas o crecimiento puede invocar — calcula y explica; la decisión de gasto queda en vos.

Funciona con una tienda conectada (Shopify, Square) o un export de pedidos con id de cliente, fecha del pedido y total. Si los pedidos no están atados a un id de cliente, te va a decir que no se pueden armar cohortes y te pide pedidos identificados.

## Qué hace

- **Arma cohortes**: agrupa clientes por mes de primera compra y sigue el gasto de cada grupo en los meses siguientes — así ves retención y recompra, no solo un promedio único.
- **Estima el LTV con honestidad**: reporta el valor realizado hasta hoy por cohorte, y solo proyecta hacia adelante con el método y los supuestos a la vista (curva de retención, ticket promedio, margen si lo das) — claramente marcado como estimación, con una cifra conservadora y una optimista en vez de un número de falsa precisión.
- **Convierte el LTV en un techo de gasto**: muestra un máximo aproximado que podés pagar para adquirir un cliente (techo de CAC) según el LTV estimado y una ventana de repago que elijas — el número que la mayoría de los dueños de verdad necesita.
- **Marca la tendencia**: si las cohortes recientes retienen mejor o peor que las viejas, que importa más que el promedio de titular.
- **El veredicto (cierra siempre con esto)**: un **puntaje 0–100** de qué tan confiable es esta lectura de LTV (largo del historial, tamaño de las cohortes, si se dio el margen); un semáforo con umbral (🟢 80+ suficiente historial para planear gasto; 🟡 50–79 direccional, tratá el techo de CAC como tope no como objetivo; 🔴 <50 muy poco historial o falta margen — medí más antes de apostar presupuesto); **el único número más útil para accionar** (casi siempre el techo de CAC conservador); y el recordatorio de que las proyecciones son estimaciones del comportamiento pasado, no valor futuro garantizado.

No presenta una proyección como un hecho, no esconde el ruido de muestra chica, y separa la plata ya ganada de la que está pronosticando.

## Cómo usarlo

1. Conectá tu tienda o pegá un export de pedidos con id de cliente, fecha del pedido y total (agregá % de margen para un LTV por ganancia).
2. Decí qué estás decidiendo: *"¿Cuánto puedo gastar para adquirir un cliente y recuperar en 3 meses?"*
3. Pedí cohortes por mes de primera compra, LTV realizado por cohorte, y el rango proyectado con supuestos.
4. Usá el techo de CAC conservador como tope de gasto, no el optimista.
5. Re-corrélo a medida que las cohortes maduran; las cohortes tempranas son las menos confiables y se firman con el tiempo.

## Ideal para

Dueños y operadores que deciden gasto de adquisición, precios o inversión en retención y necesitan un LTV defendible sin un analista de finanzas. Mejor con un año o más de pedidos identificados; más débil para negocios jóvenes, cohortes chicas o exports sin identificador de cliente.
