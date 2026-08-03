---
name: PDF
logo: /skills/pdf.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "PDFs editables directo desde un prompt"
description: "Lee, llena, combina, divide, marca con watermark y genera PDFs — incluyendo detectar y llenar campos AcroForm reales en vez de retipear un formulario como texto en el chat. Viene nativo con Claude; no hay nada que instalar."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/pdf/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## Cuándo usarlo

- Tenés un formulario PDF para llenar — un formulario de proveedor, una solicitud, una planilla de alta — y querés que se llenen los campos reales, no un resumen en texto de qué debería ir dónde.
- Necesitás combinar varios PDFs en uno, dividir uno, rotar páginas o poner un watermark en un contrato antes de mandarlo.
- Necesitás sacar texto o tablas de un PDF (incluyendo uno escaneado que primero necesita OCR) para reusarlo en otro lado.
- Querés un PDF nuevo generado — una cotización, factura o one-pager — como archivo real.

No la uses para documentos Word, presentaciones o planillas — para eso están las skills DOCX, PPTX o XLSX.

## Qué hace

- **Llena formularios correctamente**: primero chequea si el PDF tiene campos rellenables reales. Si los tiene, llena cada campo (texto, checkbox, grupo de radio, opción múltiple) por su ID y valor real — nunca adivinando coordenadas o simulando un llenado con una imagen.
- **Lee y extrae** texto y tablas de PDFs existentes, incluyendo correr OCR sobre un documento escaneado para hacerlo buscable.
- **Combina, divide y reordena** páginas entre varios PDFs preservando el orden.
- **Rota, marca con watermark y encripta/desencripta** un PDF sin alterar el contenido de base.
- **Genera PDFs nuevos** desde cero para cotizaciones, facturas, cartas y documentos puntuales similares.

## Cómo usarlo

1. Compartí el PDF y decí exactamente qué necesitás: *"Llená este formulario con [los valores específicos]"* o *"Combiná estas tres facturas en una, en orden de fecha."*
2. Para un formulario, Claude chequea si tiene campos rellenables antes de hacer nada — si no los tiene, te lo dice en vez de darte un resultado que parece llenado pero no lo es.
3. Dale los datos reales para llenar — Claude no inventa nombres, montos o fechas que no le diste.
4. Revisá el PDF exportado antes de mandarlo, especialmente si tiene peso legal o financiero (contratos, formularios firmados) — la skill llena y formatea con precisión, pero el contenido y la decisión de enviarlo siguen siendo tuyos.

## Ideal para

Dueños de negocio y equipos que necesitan un PDF real, correctamente llenado o armado — formularios, contratos, facturas, reportes combinados — sin buscar un editor de PDF aparte.
