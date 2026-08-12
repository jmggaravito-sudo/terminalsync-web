---
name: XLSX
logo: /skills/xlsx.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "Excel sin cazar fórmulas"
description: "Arma y edita workbooks Excel (.xlsx/.xlsm) con fórmulas reales, formato condicional y charts — la hoja recalcula cuando cambian los inputs, en vez de shippear números hardcodeados que parecen fórmulas. Viene nativo con Claude; no hay nada que instalar."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/xlsx/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## Cuándo usarlo

- Necesitás una planilla de verdad — un P&L, un calculador de comisiones, un presupuesto, una limpieza de datos — no una tabla de números pegada en el chat.
- Tenés un workbook existente y querés agregar una columna, fórmula u hoja que respete sus convenciones y formato existentes.
- Querés un chart o formato condicional (como resaltar filas bajo target) manejado por una regla real, no celdas coloreadas a mano que quedan obsoletas apenas cambian los datos.
- Tenés datos tabulares desordenados (CSV, export mal formado) que hay que reestructurar en un archivo limpio y usable.

No la uses para documentos Word, PDFs o presentaciones — para eso están las skills DOCX, PDF o PPTX.

## Qué hace

- **Arma workbooks nuevos** usando fórmulas reales (`=SUM(...)`, `=IF(...)` y similares) en vez de totales hardcodeados, para que la hoja recalcule bien si los números de base cambian.
- **Edita archivos existentes** encontrando sus celdas de input designadas y respetando sus convenciones exactamente — no rediseña en silencio el layout de una hoja ni toca fórmulas que no le pediste cambiar.
- **Agrega charts y formato condicional** como objetos nativos de Excel manejados por reglas, no coloreado manual de una sola vez.
- **Recalcula cada fórmula antes de terminar** y reporta cualquier celda que dé error, en vez de entregar un workbook que se lee vacío o roto hasta que el usuario lo abre y recalcula a mano.
- **Documenta supuestos e inputs hardcodeados** — un comentario de celda o una nota al lado explicando de dónde salió un número, en vez de una cifra silenciosa sin explicación.

## Cómo usarlo

1. Describí el entregable y compartí los datos fuente: *"Tomá este CSV de ventas, armá un P&L por región con un chart, resaltá en rojo las regiones bajo los $50k."*
2. Si estás editando un workbook existente, compartilo — Claude respeta sus nombres de pestaña, headers y formato existentes en vez de reestructurarlo.
3. Especificá la regla exacta para cualquier cálculo (tramos de comisión, tasa de crecimiento, umbrales) — la skill sigue la spec que le diste en vez de adivinar una fórmula "más o menos".
4. Abrí el archivo exportado en Excel o Numbers y chequeá algunas celdas al azar — un recálculo limpio prueba que las fórmulas evalúan, no que la lógica de base sea la que realmente querías.

## Ideal para

Dueños de negocio y equipos que necesitan una planilla real basada en fórmulas — P&Ls, presupuestos, calculadores de comisión, datos limpios — sin armarla celda por celda ellos mismos.
