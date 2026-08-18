---
name: Stripe
logo: /connectors/stripe.svg
category: operations
status: available
tagline: "Mira quién no pagó y envía el recordatorio — los cobros y el mensaje, juntos."
description: "Junta el conector de Stripe (facturación, pagos, clientes, reembolsos) con Internal Comms (redacta el recordatorio amable al cliente), para pasar de 'quién me debe' a 'ya le escribí' sin cambiar de herramienta — con tú aprobando antes de enviar."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: stripe
skillSlugs: ["internal-comms"]
---
## Cuándo usarlo

- Quieres ver **quién no pagó** (pagos fallidos, facturas vencidas) y mandarle un recordatorio, sin exportar planillas ni escribir cada mensaje a mano.
- Manejas las cobranzas de un negocio chico tú mismo y quieres quitarte de encima el seguimiento repetitivo.
- Quieres que la IA prepare el recordatorio pero **tú apruebas antes de que salga**.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Stripe (el conector)** lee facturación, pagos (ok/fallidos), clientes y reembolsos —la foto real de tu caja, sin abrir el dashboard.
- **Internal Comms (la skill)** redacta el recordatorio de pago con el tono justo —firme pero cordial— y declara sus límites (temas sensibles o legales van con revisión humana).

**Un ejemplo real:** es fin de mes y quieres cerrar las cuentas por cobrar. Le dices *"¿qué clientes tienen pagos fallidos o facturas vencidas este mes, y redáctame un recordatorio amable para cada uno?"*. Stripe te lista los tres clientes con el monto y los días de atraso, Internal Comms arma un recordatorio distinto para cada uno referenciando la factura, y te los muestra. Revisas, ajustas, apruebas, y salen. Lo que era una hora de planilla + redacción incómoda, son cinco minutos.

## Cómo usarlo

1. Instala el Plugin y conecta Stripe con su clave.
2. Pregunta: *"¿quién tiene pagos vencidos este mes?"* y pide *"redáctame un recordatorio para cada uno"*.
3. Revisa los mensajes —**tú apruebas**— y mándalos (por el canal que uses).

## Por qué el combo funciona

Stripe solo te muestra los números, pero después tienes que redactar cada recordatorio a mano —la parte incómoda que se posterga. Internal Comms solo redacta, pero no sabe quién te debe. Juntos cierran el loop de cobranzas: la IA ve quién no pagó, escribe el mensaje con el tono justo, y te lo deja listo —de "quién me debe" a "ya le escribí", con tu OK en el medio.

## Límites

- **No mueve plata**: no cobra, no hace reembolsos, no manda solo sin tu aprobación —lee la caja y redacta; tú decides y envías.
- Stripe refleja solo lo que está en Stripe —efectivo, cheques u otros procesadores quedan fuera de su vista.
- No reemplaza a tu contador ni asesoría legal de cobranzas; para reclamos formales, revisión profesional.
- Requiere conectar tu cuenta de Stripe; solo ve lo que esa cuenta permite.
