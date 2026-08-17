---
name: Dropbox
logo: /connectors/dropbox.svg
category: productivity
status: available
tagline: "Escribe el documento y guárdalo en tu Dropbox — en una sola acción."
description: "Combina el conector de Dropbox (encontrar archivos con búsqueda en lenguaje simple y crear enlaces compartibles) con Doc Co-Authoring (escribe propuestas, informes y documentos listos para enviar), para que 'escribe esto y ponlo donde están mis otros archivos de cliente' sea un solo paso."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: dropbox
skillSlugs: ["doc-coauthoring"]
---
## Cuándo usarlo

- Quieres que tu IA escriba un documento —propuesta, informe, resumen— usando un archivo anterior que **ya está en tu Dropbox** como formato o contexto, sin tener que descargarlo a mano primero.
- Guardas contratos, facturas y propuestas de clientes en Dropbox y quieres quitarte de encima el armado inicial de cada documento nuevo.
- Quieres un enlace compartible del borrador terminado, listo para enviar, en vez de buscarlo entre carpetas después.

## Qué hace

Combina dos piezas que se potencian entre sí, en una sola instalación:

- **Dropbox (el conector)** encuentra archivos con búsqueda en lenguaje simple y devuelve un enlace de descarga temporal o un enlace público con confirmación previa — así la IA puede traer un documento anterior como referencia y devolver un enlace del nuevo.
- **Doc Co-Authoring (la skill)** escribe propuestas, informes y documentos listos para enviar, con revisiones de coherencia, evidencia y tono, y sus límites (no reemplaza a un abogado en contratos legalmente vinculantes).

**Un ejemplo real:** acabas de terminar una llamada con un cliente y tienes notas sueltas. Le dices *"busca la plantilla de propuesta que usé para el proyecto García, y escribe una nueva para Acme con el mismo formato a partir de estas notas"*. Dropbox busca y encuentra la propuesta anterior, Doc Co-Authoring escribe la nueva con esa estructura, y le pides un enlace para compartirla — Dropbox genera uno solo después de que confirmas, porque un enlace público lo puede ver cualquiera que lo tenga.

## Cómo usarlo

1. Instala el Plugin y conecta tu cuenta de Dropbox (un token de acceso desde la consola de desarrolladores de Dropbox; un flujo de "Conectar con Dropbox" en un clic está en camino).
2. Pide: *"busca [documento anterior] en mi Dropbox y úsalo de formato para un [propuesta/informe] nuevo sobre [tema]"*.
3. Revisa el borrador, y luego pide un enlace para compartir cuando esté listo para enviar — tú confirmas antes de que se cree cualquier enlace público.

## Por qué funciona el combo

La skill de escritura sola te da un texto sin contexto previo que igualar y sin un lugar donde vivir automáticamente. El conector solo encuentra y enlaza archivos, pero no los escribe. Juntas: la IA busca en tu Dropbox la referencia que importa, escribe el documento nuevo con esa estructura y criterio, y te entrega un enlace listo para compartir —sin el paso manual de descargar y volver a subir.

## Límites

- Escribe borradores listos para revisar, no documentos finales sin tu supervisión —tú apruebas antes de enviar.
- No reemplaza asesoría legal, contable ni médica; para contratos vinculantes o temas regulados, se necesita revisión profesional.
- Leer y buscar en Dropbox son acciones gratuitas; **crear un enlace público es una acción hacia afuera** — la IA muestra qué va a compartir y solo crea el enlace cuando confirmas.
- Requiere conectar tu cuenta de Dropbox; solo ve y enlaza lo que esa cuenta permite.
