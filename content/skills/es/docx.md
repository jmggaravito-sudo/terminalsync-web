---
name: DOCX
logo: /skills/docx.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "Docs Word sin pelea"
description: "Crea, edita y lee documentos Word (.docx/.dotx) con formato real — headings, tabla de contenidos, números de página, tablas, control de cambios — en vez de texto plano disfrazado de documento. Viene nativo con Claude; no hay nada que instalar."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/docx/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## Cuándo usarlo

- Necesitás un archivo Word de verdad — una propuesta, reporte, carta, memo, borrador de contrato o template — no solo texto formateado en el chat.
- Querés estructura que una respuesta simple no puede dar: tabla de contenidos que funciona de verdad, headings reales, números de página, membrete, tablas o imágenes embebidas.
- Tenés un `.docx` existente (o un `.doc` viejo que primero hay que convertir) y querés editarlo, reorganizarlo o hacer un buscar-y-reemplazar sin perder su formato, comentarios o control de cambios.
- Necesitás sacar contenido de un archivo Word para reusarlo en otro lado.

No la uses para PDFs, planillas, presentaciones o Google Docs — para eso están las skills PDF, XLSX o PPTX, o un conector de Docs.

## Qué hace

- **Genera documentos nuevos** con estructuras reales de Word: estilos de heading nativos (necesarios para que una tabla de contenidos se llene sola), listas numeradas/con viñetas, tablas con anchos de columna y celda correctamente calculados, imágenes embebidas, saltos de página y alineación con líder de puntos — no markdown disfrazado de Word.
- **Edita documentos existentes** abriendo la estructura real del archivo, cambiando solo lo que se pidió y dejando todo lo demás intacto — formato, comentarios, control de cambios. Los `.doc` viejos se convierten primero.
- **Lee y extrae** texto y estructura de archivos `.docx`/`.dotx` para reusar el contenido en otro lado.
- **Control de cambios y comentarios**: las ediciones se pueden atribuir a un revisor con nombre en vez de quedar como cambios anónimos.
- **Revisa su propio resultado**: después de generar un archivo, la skill lo renderiza a imágenes y mira el resultado antes de entregarlo, para agarrar roturas de formato silenciosas (una celda con sombreado que se renderiza negro sólido, un salto de página faltante) antes de que el usuario lo abra.

## Cómo usarlo

1. Pedí el entregable directamente: *"Armá una propuesta de una página para Acme basada en los wins del trimestre pasado, formato nuestro de 4 páginas."*
2. Compartí el contenido fuente — notas, un export del CRM, un doc existente — para que Claude trabaje con contenido real en vez de inventar números o afirmaciones.
3. Para editar un archivo que ya tenés, compartilo y decí exactamente qué debe cambiar: un buscar-y-reemplazar, la reescritura de una sección, o qué cambios controlados aceptar o rechazar.
4. Abrí el archivo exportado en Word, Pages o Google Docs para una última lectura. Claude revisa su propio render por roturas de formato, pero el tono y las decisiones de negocio siguen siendo tuyas.

## Ideal para

Dueños de negocio y equipos no técnicos que necesitan un archivo Word real y bien formateado — propuestas, contratos, reportes, cartas — sin abrir Word ellos mismos ni pelear con estilos de template.
