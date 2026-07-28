---
name: Cohortes de LTV
logo: /skills/ltv-cohortes.svg
category: marketing
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Veá cuánto vale de verdad un cliente en el tiempo"
description: "Agrupa a tus clientes por el mes en que compraron por primera vez y sigue cuánto sigue gastando cada grupo y cuántos se quedan — para que veas si los clientes nuevos valen más o menos que los viejos. Usa solo tus datos y marca cada supuesto."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## Cuándo usarla

- Querés saber cuánto vale un cliente a lo largo del tiempo, no solo en la primera compra — y si eso está mejorando o empeorando.
- Podés compartir las órdenes con un id de cliente, fecha de orden y monto (un export de transacciones es perfecto).
- Querés ver retención y valor acumulado por cohorte, y entender qué significa para cuánto podés gastar en conseguir un cliente.

No la uses para inventar valor de vida, curvas de retención ni facturación futura. Si el historial es muy corto para proyectar, la skill lo dice y se queda con lo que realmente pasó.

## Qué hace

Corre un análisis de cohortes del valor del cliente:

- **Arma cohortes** por mes de primera compra (u otro período que elijas) desde tus transacciones.
- **Sigue la retención**: qué parte de cada cohorte sigue comprando al mes 1, 3, 6, 12.
- **Sigue el valor acumulado**: cuánto gastó un cliente promedio de cada cohorte a cada mes — la curva de LTV real, armada con tus datos.
- **Compara cohortes**: si los clientes nuevos gastan más o menos, se quedan más o menos, que los viejos — y marca la tendencia.
- **Explica qué significa**: una idea aproximada de cuánto podés gastar para conseguir un cliente, con la salvedad de que depende del margen y del período de repago.
- **Marca los límites**: historial corto, cohortes finas o meses faltantes — etiqueta las proyecciones como supuestos, nunca como hechos.
- **Cierra con un veredicto (siempre)**: un puntaje 0–100 de qué tan confiable es este análisis según la profundidad de tus datos; un semáforo (🟢 80+ listo para decidir; 🟡 50–79 orientativo, conseguí más historial; 🔴 <50 muy pocos datos para confiar en las curvas); el único insight que más importa; y una nota de que el puntaje refleja tus datos, no una garantía de valor futuro.

## Cómo usarla

1. Compartí tus transacciones: id de cliente, fecha de orden y monto por orden.
2. Pedí: *"Hacé un análisis de cohortes de LTV por mes de primera compra y decime si mis clientes nuevos valen más."*
3. Revisá las cohortes y la tendencia; pedile que muestre sus datos de entrada si un número te sorprende.
4. Usá la vista de repago para chequear cuánto gastás en adquisición — con tu propio margen.

## Para quién es

Ecommerce, suscripciones y negocios de compra repetida que quieren entender el valor real del cliente y cuánto pueden gastar para crecer. Funciona mejor con al menos varios meses de historial de transacciones.
