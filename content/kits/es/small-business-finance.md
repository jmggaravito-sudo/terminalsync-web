---
name: Kit de Finanzas para Negocio Chico
logo: /logos/ts-kit.svg
category: finance
status: available
tagline: "Leé los libros, conciliá los pagos online, y sacá un resumen financiero mensual escrito — sin abrir un solo armador de reportes."
description: "Un combo coherente de finanzas para el dueño de un negocio chico o su contador que lleva los libros en Xero y cobra pagos online por Stripe: ver quién debe plata, qué está vencido, cómo vino el mes pasado, y que quede redactado como un resumen en castellano llano."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: xero
    reason: "Lee los libros de verdad: facturas, cuentas por cobrar vencidas, P&L y balance, así '¿quién nos debe?' y '¿cómo vino el mes pasado?' tienen respuestas reales en vez de una estimación."
  - kind: connector
    slug: stripe
    reason: "Lee pagos online, clientes y reembolsos, así el lado de cobros online del negocio se puede chequear contra lo que Xero muestra en los libros."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte los números de Xero y Stripe en un resumen financiero mensual estructurado y escrito que alguien sin formación contable puede leer de verdad."
---
## Para quién es

El dueño de un negocio chico, o el contador que trabaja para uno, que lleva los libros en Xero y cobra pagos online por Stripe, y necesita responder *"¿quién nos debe plata?"*, *"¿qué está vencido?"*, y *"¿cómo vino de verdad el mes pasado?"* sin armar un reporte a mano cada vez.

Usalo cuando el trabajo recurrente es leer los números y redactarlos, no hacer la contabilidad en sí — este kit lee y redacta, no reemplaza a un contador.

## Qué te ayuda a hacer

Este kit cubre el loop de leer-los-números-y-redactarlos de las finanzas de un negocio chico:

- Ver **quién debe plata y qué está vencido** leyendo las cuentas por cobrar vencidas y las facturas sin pagar en Xero.
- Ver **cómo vino el mes pasado**, leyendo el P&L y el balance directo de Xero.
- Ver el **lado de pagos online**: facturación, cargos ok vs fallidos, clientes y reembolsos en Stripe.
- Convertir el panorama combinado en un **resumen mensual escrito** con Doc Co-authoring — un solo documento en vez de dos dashboards y una nota mental de redactarlo después.

El resultado esperado es un resumen financiero corto y con fuente que el dueño puede leer o pasarle a un socio/inversor, apoyado en los libros reales y los pagos online reales.

## Qué incluye

### Conectores

- **Xero** — lee facturas, cuentas por cobrar vencidas, pagos, contactos y reportes (P&L, balance, balance de comprobación) directo de los libros de la empresa; también puede redactar una factura o presupuesto para revisar, sin mandar ni finalizar nada por su cuenta.
- **Stripe** — lee facturación, pagos (ok vs fallidos), clientes y reembolsos del lado de cobros online del negocio, así se puede chequear contra lo que está registrado en Xero.

### Skills

- **Doc Co-authoring** — convierte los números sacados de Xero y Stripe en un reporte escrito y estructurado: qué cambió, qué está vencido, qué vigilar, con el razonamiento que alguien puede seguir en vez de una pared de números exportados.

## Cómo usarlo

1. Instalá el kit, conectá Xero por una Custom Connection (Client ID + Client Secret), y conectá Stripe con su clave.
2. Preguntá *"¿quién nos debe plata y cuánto, y qué está vencido?"* — Xero responde con las cuentas por cobrar vencidas.
3. Preguntá *"¿cómo vinimos el mes pasado?"* para el P&L, y *"¿cuál es nuestra posición ahora?"* para el balance.
4. Preguntá *"¿hubo pagos fallidos o reembolsos en Stripe este mes?"* para chequear el lado online.
5. Pedile a Doc Co-authoring que *"redacte esto como un resumen financiero mensual corto que le pueda mandar a mi socio"* usando los números de arriba.

## Por qué estas piezas van juntas

El kit es coherente porque separa lo que el negocio necesita de un chequeo financiero:

- Xero aporta **los libros** — facturas, cuentas por cobrar, y el P&L/balance oficial.
- Stripe aporta **la capa de pagos online**, chequeada contra lo que está registrado en los libros.
- Doc Co-authoring aporta **la redacción** — un resumen que alguien sin formación contable puede leer de verdad, no un export de planilla.

Instaladas por separado, el dueño lee dos dashboards y igual tiene que redactar el resumen a mano cada mes. Instaladas juntas, el kit da un solo camino: **leer los libros → chequearlo contra los pagos online → redactar el resumen**.

Se solapa con el Kit Dueño de Negocio en Stripe y Doc Co-authoring, pero el propósito es distinto: el Kit Dueño de Negocio es un tracker liviano de ventas y caja en Airtable para un dueño solo que hace de todo un poco; este kit es para la contabilidad de verdad — facturas, cuentas por cobrar y P&L en Xero — para quien lleva los libros.

## Límites

- No hace la contabilidad, no declara impuestos ni reemplaza a un contador — lee lo que ya está en Xero y Stripe y ayuda a redactarlo.
- No manda facturas, no mueve plata ni hace reembolsos por su cuenta; las escrituras de Xero (facturas, pagos, contactos) y las acciones de Stripe necesitan tu revisión y confirmación.
- La Custom Connection de Xero necesita un plan pago de Xero y su propia configuración única en el portal de desarrolladores; Stripe necesita su propia cuenta y API key.
- Solo ve lo que está registrado en Xero y Stripe — efectivo, cheques, u otra plataforma de contabilidad/pagos quedan fuera de su vista.
- Si tu negocio corre en Alegra, Siigo, QuickBooks u otra plataforma en vez de Xero, este kit todavía no lo cubre; muchas preguntas de "facturas y presupuesto" pueden funcionar por el conector de Google Sheets si las llevás en una planilla.
