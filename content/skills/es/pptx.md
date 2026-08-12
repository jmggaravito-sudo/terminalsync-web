---
name: PPTX
logo: /skills/pptx.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "PowerPoint a velocidad de prompt"
description: "Arma y edita presentaciones PowerPoint (.pptx/.potx) con layouts de slide reales, charts nativos, notas de speaker y reuso de templates — en vez de un esquema de viñetas disfrazado de deck. Viene nativo con Claude; no hay nada que instalar."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/pptx/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## Cuándo usarlo

- Necesitás un deck de slides de verdad — un pitch de ventas, un update de all-hands, una revisión con cliente — no un esquema de viñetas que igual vas a tener que armar vos.
- Tenés un deck template con tus layouts de marca y querés agregar o duplicar slides en ese mismo estilo, no un deck genérico desde cero.
- Necesitás charts reales dentro del deck (barras, líneas, torta, combo) armados con tus números reales, no una imagen de un gráfico.
- Querés agregar notas de speaker a un deck existente para una presentación que estás por dar.

No la uses para documentos Word, PDFs o planillas — para eso están las skills DOCX, PDF o XLSX.

## Qué hace

- **Arma decks nuevos** con layouts de slide reales en el tamaño de canvas correcto (16:9 widescreen salvo que digas otra cosa), charts nativos de PowerPoint armados con los datos dados, y listas renderizadas como viñetas reales — no un carácter "•" tipeado literal en un cuadro de texto.
- **Edita decks y templates existentes**: duplica una slide con todo su layout intacto, reordena o borra slides, y limpia lo que quede de una eliminación, para que el resultado siga abriendo bien en PowerPoint.
- **Agrega notas de speaker** como notas de presentador reales adjuntas a la slide, no texto visible pegado en la slide misma.
- **Lee decks**: extrae el texto de cada slide, incluso de un template, para mapear contenido al layout correcto antes de armar nada.
- **Revisa su propio resultado**: después de armar o editar un deck, valida la estructura del archivo y mira imágenes renderizadas de las slides antes de entregarlo, para que un chart corrupto o un layout roto no se escape.

## Cómo usarlo

1. Describí el deck: audiencia, ocasión, cantidad de slides y los números o historia reales que tiene que llevar — ej. *"un deck de revisión con cliente de 10 slides, los KPIs del mes pasado, terminando con un ask de renovación."*
2. Si tenés un template de marca o un deck existente, compartilo — Claude trabaja con tus layouts y colores en vez de inventar unos nuevos.
3. Dale los datos reales para cualquier chart; la skill no inventa cifras para llenar una slide que se ve vacía.
4. Abrí el archivo exportado en PowerPoint o Keynote para una última pasada — Claude revisa su propio render por slides rotas, pero el pitch y el ask siguen siendo decisión tuya.

## Ideal para

Founders, vendedores y equipos que necesitan un deck de slides real y con su marca — pitches, revisiones con clientes, updates internos — sin abrir PowerPoint ellos mismos.
