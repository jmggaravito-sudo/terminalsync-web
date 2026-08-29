---
name: Square
logo: /connectors/square.svg
category: operations
status: available
tagline: "Mira quién no pagó en Square — y envía el recordatorio, en un solo producto."
description: "Junta el conector de Square (pagos, facturas, órdenes y clientes de tu cuenta de Square) con Internal Comms (redacta el seguimiento con el tono justo), para que '¿quién está atrasado?' se convierta en un recordatorio listo para enviar — con tú aprobando antes de que salga."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: square
skillSlugs: ["internal-comms"]
---
## Cuándo usarlo

- Cobras a través de **Square** —en persona, por factura o en línea— y quieres ver quién no pagó sin abrir el dashboard.
- Quieres que el mensaje de seguimiento te lo redacten, con un tono firme pero cordial —no escribirlo de cero cada vez.
- Quieres que la IA prepare el recordatorio pero **tú apruebas antes de que se envíe**.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Square (el conector)** lee tus pagos, facturas, órdenes y clientes directo de tu cuenta de Square —la foto real de quién pagó y quién no.
- **Internal Comms (la skill)** redacta el seguimiento de pago con el tono justo —firme pero cordial— y marca cuándo un caso es lo bastante sensible como para necesitar revisión humana en vez de un aviso automático.

**Un ejemplo real:** es mediados de mes y quieres perseguir las facturas sin pagar antes de que se atrasen más. Preguntas *"¿qué facturas de Square siguen sin pagarse, y redáctame un recordatorio para cada cliente?"*. Square lista las facturas impagas con el monto y cuánto atraso tienen, Internal Comms redacta un recordatorio distinto para cada cliente referenciando su factura, y te los muestra. Revisas, ajustas, apruebas y envías. Lo que antes era recorrer el dashboard de Square y escribir cada mensaje a mano, son un par de minutos.

## Cómo usarlo

1. Instala el Plugin y conecta Square con un token de acceso (el manifest viene por defecto en modo **sandbox** —cambia a producción tú mismo cuando quieras trabajar sobre tu cuenta real).
2. Pregunta: *"¿quién no pagó este mes?"*.
3. Pide *"redáctame un recordatorio para cada uno"* —revisa los mensajes, **tú apruebas**, y mándalos por el canal que uses.

## Por qué el combo funciona

Square solo te muestra quién no pagó, pero después tienes que redactar cada recordatorio a mano —la parte que se posterga. Internal Comms solo redacta, pero no sabe quién te debe ni cuánto. Juntos cierran el loop: la IA lee las facturas impagas, escribe el recordatorio con el tono justo, y te lo deja listo —con tu OK antes de que salga cualquier cosa.

## Límites

- **No mueve plata**: no cobra, no hace reembolsos, ni manda nada por sí solo sin tu aprobación —lee los pagos y redacta; tú decides y envías.
- El manifest de Square viene por defecto en **modo sandbox** —no ves ni tocas los datos de tus clientes reales hasta que tú mismo lo cambies a producción.
- Refleja solo lo que está cargado en Square —efectivo, otros procesadores o tratos en persona no cargados en Square quedan fuera de su vista.
- No reemplaza a tu contador ni asesoría legal de cobranzas; para reclamos formales, revisión profesional.
- Requiere conectar tu cuenta de Square; solo ve lo que ese token de acceso permite.
