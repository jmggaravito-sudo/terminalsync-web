---
name: Kit de Estudio Creativo para Avisos y Redes
logo: /logos/ts-kit.svg
category: marketing
status: available
tagline: "Planifica el concepto del aviso y después genera la imagen y el video — sin contratar un estudio."
description: "Un bundle de producción creativa para dueños de negocio y marketers que necesitan convertir una oferta en un concepto de aviso probado, más la imagen y el video reales, en vez de quedarse solo en un brief de texto."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: meta-ads-creator
    reason: "Convierte la oferta, la audiencia y el precio en cinco conceptos distintos de avisos para Meta con copy, descripción de imagen, formato y plan de prueba — la dirección creativa que necesitan los conectores visuales de abajo antes de generar nada."
  - kind: connector
    slug: ideogram
    reason: "Genera la imagen fija de cada concepto — la foto de producto, el poster o el mockup que describe el copy del aviso — directamente desde el agente, con el login y los créditos propios de la cuenta de Ideogram."
  - kind: connector
    slug: higgsfield
    reason: "Genera la versión en video/movimiento de un concepto para Historias, Reels o un clip corto estilo UGC, extendiendo la misma dirección creativa a formatos que una imagen fija no puede cubrir."
---
## Para quién es

Dueños de negocios chicos, locales, profesionales independientes y marketers que ya tienen (o pueden escribir) una oferta, pero no tienen un estudio de diseño ni un equipo de video para convertirla en piezas listas para pautar.

Úsalo cuando el trabajo no es solo "escríbeme el copy del aviso" — es "dame el concepto, la imagen y el video, listos para probar".

## Qué te ayuda a hacer

Este kit cubre el salto de concepto a pieza terminada en creatividad de avisos:

- Convertir una oferta en cinco conceptos distintos de avisos para Meta con copy, formato y plan de prueba (Meta Ads Creator).
- Generar la imagen fija que describe cada concepto — fotos de producto, posters, mockups — con Ideogram.
- Generar una versión corta en video o con movimiento de un concepto — clips estilo UGC, piezas listas para Reels — con Higgsfield.

El resultado esperado es un pequeño set de conceptos de aviso que ya tienen su copy, una imagen real y un video corto, listos para que el dueño los revise y los cargue en Meta Ads Manager para probar.

## Qué incluye

### Skills

- **Meta Ads Creator** — arma cinco conceptos de avisos para Meta (Facebook + Instagram) con copy, botón, descripción de imagen, formato y plan de prueba, siempre cerrando con un veredicto de qué tan listo está. Pertenece acá porque es la capa de concepto: los conectores de imagen y video necesitan una dirección creativa concreta para generar, no un prompt en blanco.

### Connectors

- **Ideogram** — un estudio de generación de imágenes oficial, conectado por OAuth. Pertenece acá porque convierte la descripción de "cómo se ve la imagen" de Meta Ads Creator en un visual real que el dueño puede revisar, remixar o reusar en otros formatos.
- **Higgsfield** — un servicio oficial de generación de imagen/video conectado por OAuth (30+ modelos, videos de hasta 15 segundos). Pertenece acá porque los formatos que mejor funcionan en Meta (Historias, Reels) son de video, y una herramienta de solo imagen no puede producir esa pieza.

### CLI

No se incluye ninguna herramienta CLI. El usuario objetivo es un dueño de negocio no técnico y el flujo central no requiere ejecución desde terminal.

## Cómo usarlo

1. Instala el kit y conecta Ideogram y Higgsfield — ambos usan el login de tu cuenta ya existente en el navegador, sin pegar ninguna API key.
2. Cuéntale a Meta Ads Creator tu oferta: qué vendes, a qué precio, a quién, en qué zona y qué acción quieres (escribir, comprar, reservar).
3. Pide la tanda de 5 conceptos de aviso para Meta con copy, descripción de imagen, formato y plan de prueba.
4. Elige el o los 1–2 conceptos más fuertes y pídele a Ideogram que genere la imagen fija usando la descripción de imagen del concepto.
5. Para un concepto de Historias/Reels, pídele a Higgsfield que genere una versión corta en video usando la misma dirección creativa.
6. Revisa el copy, la imagen y el video juntos antes de cargarlos en Meta Ads Manager para probar.

## Por qué estas piezas van juntas

El kit es coherente porque sigue una sola línea de producción, no tres herramientas sueltas:

- Meta Ads Creator decide **qué tiene que decir y cómo se tiene que ver el aviso** — el brief creativo.
- Ideogram convierte ese brief en **la imagen fija real**.
- Higgsfield convierte el mismo brief en **el video real**, para los formatos que una imagen fija no puede cubrir.

Instaladas por separado, el dueño se queda con un brief de texto y tiene que buscar (o pagar) a alguien que realmente haga la imagen y el video. Instaladas juntas, el kit da un solo camino: **concepto -> imagen -> video**, todo desde la misma dirección creativa, listo para probar.

Se consideraron Zapier y NotebookLM para este bundle y quedaron afuera a propósito (ver la nota de la corrida): el MCP de Zapier no tiene un manifest de instalación fijo — el usuario gestiona las tools/URLs enteramente en su propio dashboard de Zapier, así que no cumple la barra de "instalable" del kit — y NotebookLM todavía no tiene un conector instalable en el catálogo. Ninguno de los dos pertenece a este kit hasta que eso cambie.

## Límites

- No publica, programa ni corre el aviso — el dueño sigue revisando y cargando el copy/imagen/video en Meta Ads Manager.
- No garantiza ROAS, CPA, alcance ni ventas de ningún concepto, imagen o video generado.
- La generación de Ideogram e Higgsfield consume el plan/créditos propios de cada cuenta, y la generación de video (Higgsfield) puede tardar más que una imagen y correr de forma asincrónica.
- No hace edición de video completa (líneas de tiempo multi-clip, diseño de sonido) — Higgsfield produce un clip generado, no un pipeline de post-producción.
- Se requiere revisión humana antes de pautar, sobre todo para claims de precio, disponibilidad o categorías reguladas.
