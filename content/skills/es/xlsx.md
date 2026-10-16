---
name: XLSX
logo: /skills/xlsx.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "Excel que se recalcula solo"
description: "Crea y edita archivos de Excel (.xlsx y .xlsm) con fórmulas de verdad, formato condicional y gráficos. Cuando cambias un dato, la hoja se recalcula sola — no son números fijos escritos a mano que parecen fórmulas. Ya viene incluido: no hay nada que instalar."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/xlsx/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## Cuándo usarlo

- Necesitas una planilla de verdad —un estado de resultados, un calculador de comisiones, un presupuesto, una limpieza de datos— y no una tabla de números pegada en el chat.
- Ya tienes un archivo de Excel y quieres agregarle una columna, una fórmula o una hoja respetando el formato que el archivo ya trae.
- Quieres un gráfico o un formato condicional —por ejemplo, resaltar las filas que quedan bajo la meta— manejado por una regla de verdad, y no celdas pintadas a mano que quedan desactualizadas apenas cambian los datos.
- Tienes datos desordenados (un CSV, una exportación mal armada) y hay que reordenarlos en un archivo limpio y usable.

No la uses para documentos de Word, PDF o presentaciones — para eso están las skills DOCX, PDF o PPTX.

## Qué hace

- **Crea archivos nuevos** con fórmulas de verdad (`=SUM(...)`, `=IF(...)` y similares) en vez de totales escritos a mano, para que la hoja se recalcule bien cuando cambian los números de base.
- **Edita archivos que ya tienes**, buscando las celdas donde van los datos y respetando sus convenciones tal cual — no rediseña la hoja por su cuenta ni toca fórmulas que no le pediste cambiar.
- **Agrega gráficos y formato condicional** como objetos de Excel manejados por reglas, no como un pintado manual de una sola vez.
- **Recalcula todas las fórmulas antes de terminar** y avisa si alguna celda queda con error, en vez de entregarte un archivo que se ve vacío o roto hasta que lo abres.
- **Deja anotado de dónde salió cada número fijo** — un comentario en la celda o una nota al lado, en vez de una cifra sin explicación.

## Cómo usarlo

1. Describe lo que necesitas y comparte los datos: *"Toma este CSV de ventas, arma un estado de resultados por región con un gráfico y resalta en rojo las regiones bajo los $50k."*
2. Si vas a editar un archivo que ya tienes, compártelo: se respetan los nombres de las pestañas, los encabezados y el formato que ya trae, en vez de reordenarlo todo.
3. Di la regla exacta de cada cálculo (tramos de comisión, tasa de crecimiento, umbrales). Así se usa la regla que diste, en vez de adivinar una fórmula aproximada.
4. Abre el archivo en Excel o Numbers y revisa algunas celdas al azar. Que recalcule limpio prueba que las fórmulas funcionan, no que la lógica sea la que querías.

## Ideal para

Dueños de negocio y equipos que necesitan una planilla de verdad, basada en fórmulas —estados de resultados, presupuestos, calculadores de comisión, datos limpios— sin armarla celda por celda ellos mismos.
