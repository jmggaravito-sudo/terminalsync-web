---
name: Xero
logo: /connectors/xero.svg
category: operations
status: available
tagline: "Sabe qué está vencido y reclámalo — los libros y el recordatorio, juntos."
description: "Junta el conector de Xero (facturas, cuentas por cobrar vencidas, pagos, P&L, balance) con Internal Comms (redacta el recordatorio de pago con el tono justo), para que un dueño de negocio pase de 'quién me debe' a 'ya le hice seguimiento' sin abrir Xero ni escribir el mail a mano."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: xero
skillSlugs: ["internal-comms"]
---
## Cuándo usarlo

- Llevas tus libros en **Xero** y quieres saber **quién te debe plata, qué está vencido y cómo le fue al negocio el mes pasado** sin abrir el dashboard ni armar un reporte.
- Quieres que el recordatorio de seguimiento de una factura vencida **te lo redacten**, con un tono firme pero cordial — no escribirlo de cero cada vez.
- Quieres que la IA prepare el recordatorio pero **tú apruebas antes de que salga**.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Xero (el conector)** lee tus facturas, cuentas por cobrar vencidas, pagos, contactos y reportes (P&L, balance, balance de comprobación) — el estado real de tus libros, en palabras simples.
- **Internal Comms (la skill)** redacta el recordatorio de pago con el tono justo — firme pero cordial — y marca cuándo un caso es lo bastante sensible como para necesitar revisión humana en vez de un mensaje automático.

**Un ejemplo real:** es fin de mes y quieres cerrar las cuentas por cobrar antes de correr la nómina. Le dices *"¿qué facturas están vencidas, y redáctame un recordatorio para cada cliente?"*. Xero lista las facturas vencidas con el monto y los días de atraso, Internal Comms redacta un recordatorio distinto para cada cliente referenciando su factura, y te los muestra. Revisas, ajustas, apruebas y mandas. Lo que antes era exportar un reporte y escribir tres mails incómodos, son cinco minutos.

## Cómo usarlo

1. Instala el Plugin y conecta Xero con una Custom Connection (Client ID + Secret de tu cuenta de desarrollador de Xero).
2. Pregunta: *"¿quién me debe plata y qué está vencido?"* o *"¿cómo nos fue el mes pasado?"*.
3. Pide *"redáctame un recordatorio para cada factura vencida"* — revisa los mensajes, **tú apruebas**, y mándalos por el canal que uses.

## Por qué el combo funciona

Xero solo te muestra los números, pero después tienes que redactar cada recordatorio a mano — la parte que se posterga hasta que ya está muy atrasada. Internal Comms solo redacta, pero no sabe quién te debe ni cuánto. Juntos cierran el loop: la IA lee los libros, escribe el recordatorio con el tono justo, y te lo deja listo — con tu OK antes de que salga cualquier cosa.

## Límites

- **No mueve plata ni presenta nada**: no registra pagos, no presenta impuestos, no manda recordatorios solo — lee los libros y redacta; tú decides y envías.
- Refleja solo lo que está en Xero — efectivo, otros procesadores o movimientos fuera de libros quedan afuera de su vista.
- **Este Plugin no es una herramienta de presentación de impuestos.** No prepara ni presenta 1099s, W-9s, W-2s ni declaraciones de nómina, y no se conecta con QuickBooks, Odoo ni TaxBandits — ninguno de esos tiene hoy un conector oficial e instalable en el catálogo.
- No reemplaza a tu contador; para presentaciones y posiciones fiscales formales, revisión profesional.
- Requiere conectar tu cuenta de Xero; solo ve lo que esa Custom Connection permite.
