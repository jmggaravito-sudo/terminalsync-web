---
name: Xero
logo: /connectors/xero.svg
category: operations
status: available
tagline: "Leé los libros contables — y convertilos en el informe que de verdad podés compartir."
description: "Junta el conector de Xero (facturas, cuentas por cobrar vencidas, P&L, balance general de tus libros reales) con Doc Co-Authoring (estructura un informe pulido con resumen ejecutivo), para que 'cómo nos fue el mes pasado' se convierta en un documento listo para el equipo, no solo números en pantalla."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: xero
skillSlugs: ["doc-coauthoring"]
---
## Cuándo usarlo

- Querés saber **quién te debe, qué está vencido y cómo te fue el mes pasado**, sin abrir el software contable y buscar entre columnas.
- Necesitás convertir eso en un documento de verdad —un informe mensual, una novedad para el directorio, un resumen ejecutivo— no solo una respuesta de chat que tenés que reformatear vos.
- Querés que la redacción se haga en pasadas estructuradas (primero el outline, después las secciones, después la revisión), no en un solo bloque sin revisar.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Xero (el conector)** lee tus libros reales —cuentas por cobrar vencidas, facturas atrasadas, estado de resultados, balance general, balance de comprobación— en palabras simples, sin armar un reporte vos.
- **Doc Co-Authoring (la skill)** toma ese material y lo estructura en un documento pulido: brief, outline, borradores por sección, una pasada de revisión, y un resumen ejecutivo opcional —marcando cualquier supuesto en vez de inventar números.

**Un ejemplo real:** se acerca fin de mes y necesitás actualizar a tu equipo. Le decís *"¿cómo nos fue el mes pasado? Leé el P&L y traeme las facturas vencidas"*. Xero lee los números reales. Le decís *"convertí esto en un informe de una página con resumen ejecutivo para la reunión de equipo"*. Doc Co-Authoring propone un outline, lo redacta sección por sección usando solo los números que le dio Xero, y marca cualquier cosa donde necesitaría más contexto. Revisás y queda listo para compartir.

## Cómo usarlo

1. Instalá el Plugin y conectá Xero con una Custom Connection (Client ID + Client Secret).
2. Pedí: *"leé el P&L del mes pasado y mis facturas vencidas"*.
3. Pedí: *"escribime un informe ejecutivo de una página con esto"* —revisá el outline y después cada sección, antes de compartirlo.

## Por qué el combo funciona

Xero solo te da los números reales, pero una respuesta cruda no es algo que le entregás a tu equipo o a un socio —igual tendrías que redactarla y darle formato vos. Doc Co-Authoring solo escribe documentos bien estructurados, pero no conoce tus finanzas reales a menos que se las pegues a mano. Juntos: Xero aporta los números reales, y la skill los convierte en un documento —de "cómo nos fue" a un informe listo para compartir, con cada supuesto marcado en vez de inventado.

## Límites

- Xero se conecta mediante una **Custom Connection** paga —el paso de configuración genuinamente más engorroso, se hace una sola vez en el portal de desarrolladores de Xero.
- **Nunca mueve plata ni finaliza nada por su cuenta**: crear una factura o una cotización es un borrador que revisás antes de que sea real.
- El informe refleja solo lo que está en Xero —efectivo, otros procesadores, o libros paralelos fuera de él no son visibles.
- No reemplaza a tu contador: para declaraciones, auditorías o decisiones impositivas, conseguí revisión profesional.
