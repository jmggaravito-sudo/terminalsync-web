---
name: Segmentación RFM
logo: /skills/rfm-segmentacion.svg
category: marketing
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Ordená tus clientes por quién vale la pena"
description: "Toma tu lista de clientes y la agrupa por qué tan reciente compraron, con qué frecuencia y cuánto — para que sepas quiénes son tus mejores clientes, quiénes se están yendo y qué decirle a cada grupo. Sin números inventados."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## Cuándo usarla

- Tenés una lista de clientes con, como mínimo, cuándo compró cada uno por última vez, cuántas veces compró y cuánto gastó en total.
- Querés saber quiénes son tus mejores clientes, quiénes compraban y se están enfriando, y quiénes casi no interactúan — sin adivinar.
- Querés una acción concreta por grupo, no solo un gráfico.

No la uses para inventar ingresos, tasas de abandono ni cuántos van a volver. Si faltan datos, la skill te dice qué necesita y trabaja con lo que le diste.

## Qué hace

Corre una segmentación RFM (Recencia, Frecuencia, Monto) sobre tu lista:

- **Puntúa a cada cliente** del 1 al 5 en qué tan reciente compró (Recencia), con qué frecuencia (Frecuencia) y cuánto gastó (Monto), usando los rangos de TUS datos — no umbrales fijos.
- **Los agrupa en segmentos en lenguaje simple**: Campeones (recientes, frecuentes, gastan mucho), Leales, Potenciales, Nuevos, En Riesgo (eran buenos, se apagan), Dormidos y Perdidos.
- **Mide cada segmento** (cuántos clientes, qué parte de la facturación) para que veas dónde está la plata de verdad.
- **Recomienda una acción por segmento**: premiar a los Campeones, reactivar a los En Riesgo, dar la bienvenida a los Nuevos — con el porqué.
- **Marca los límites**: cuando falta un campo o un segmento es muy chico para confiar, lo dice en vez de fingir.
- **Cierra con un veredicto (siempre)**: un puntaje 0–100 de qué tan usable es esta segmentación con los datos que diste; un semáforo (🟢 80+ accioná; 🟡 50–79 usable, completá lo que falta; 🔴 <50 datos insuficientes para confiar en los grupos); el único segmento por el que empezar; y el recordatorio de que el puntaje refleja la calidad de tus datos, no una promesa de resultados.

## Cómo usarla

1. Compartí la lista de clientes: fecha de última compra, cantidad de compras y total gastado por cliente (un CSV, planilla o export es ideal).
2. Pedí: *"Segmentá mis clientes con RFM y decime qué hago con cada grupo."*
3. Revisá los segmentos y las acciones. Si un número parece inventado, no lo es — la skill solo usa tus datos; pedile que muestre los rangos que usó.
4. Arrancá por el segmento que marca como de mayor palanca.

## Para quién es

Dueños de comercios, tiendas online, negocios de servicios y cualquiera con una lista de clientes que quiera invertir su tiempo y sus ofertas en la gente correcta. Funciona mejor con historial de compras real; cuanto más completos los datos, más confiables los grupos.
