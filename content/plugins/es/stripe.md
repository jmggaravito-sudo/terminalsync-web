---
name: Stripe
logo: /connectors/stripe.svg
category: operations
status: available
tagline: "Mirá quién no pagó y mandá el recordatorio — los cobros y el mensaje, juntos."
description: "Junta el conector de Stripe (facturación, pagos, clientes, reembolsos) con Internal Comms (redacta el recordatorio amable al cliente), para pasar de 'quién me debe' a 'ya le escribí' sin cambiar de herramienta — con vos aprobando antes de enviar."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: stripe
skillSlugs: ["internal-comms"]
---
## Cuándo usarlo

- Querés ver **quién no pagó** (pagos fallidos, facturas vencidas) y mandarle un recordatorio, sin exportar planillas ni escribir cada mensaje a mano.
- Manejás las cobranzas de un negocio chico vos mismo y querés sacarte de encima el seguimiento repetitivo.
- Querés que la IA prepare el recordatorio pero **vos aprobás antes de que salga**.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Stripe (el conector)** lee facturación, pagos (ok/fallidos), clientes y reembolsos —la foto real de tu caja, sin abrir el dashboard.
- **Internal Comms (la skill)** redacta el recordatorio de pago con el tono justo —firme pero cordial— y declara sus límites (temas sensibles o legales van con revisión humana).

**Un ejemplo real:** es fin de mes y querés cerrar las cuentas por cobrar. Le decís *"¿qué clientes tienen pagos fallidos o facturas vencidas este mes, y redactame un recordatorio amable para cada uno?"*. Stripe te lista los tres clientes con el monto y los días de atraso, Internal Comms arma un recordatorio distinto para cada uno referenciando la factura, y te los muestra. Revisás, ajustás, aprobás, y salen. Lo que era una hora de planilla + redacción incómoda, son cinco minutos.

## Cómo usarlo

1. Instalá el Plugin y conectá Stripe con su clave.
2. Preguntá: *"¿quién tiene pagos vencidos este mes?"* y pedí *"redactame un recordatorio para cada uno"*.
3. Revisá los mensajes —**vos aprobás**— y mandalos (por el canal que uses).

## Por qué el combo funciona

Stripe solo te muestra los números, pero después tenés que redactar cada recordatorio a mano —la parte incómoda que se posterga. Internal Comms solo redacta, pero no sabe quién te debe. Juntos cierran el loop de cobranzas: la IA ve quién no pagó, escribe el mensaje con el tono justo, y te lo deja listo —de "quién me debe" a "ya le escribí", con tu OK en el medio.

## Límites

- **No mueve plata**: no cobra, no hace reembolsos, no manda solo sin tu aprobación —lee la caja y redacta; vos decidís y enviás.
- Stripe refleja solo lo que está en Stripe —efectivo, cheques u otros procesadores quedan fuera de su vista.
- No reemplaza a tu contador ni asesoría legal de cobranzas; para reclamos formales, revisión profesional.
- Requiere conectar tu cuenta de Stripe; solo ve lo que esa cuenta permite.
