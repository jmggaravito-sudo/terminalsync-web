---
name: Kit de Contabilidad y Handoff al Contador
logo: /logos/ts-kit.svg
category: finance
status: available
tagline: "Ordena tus números y arma para tu contador un paquete limpio para la entrega — no un manotazo de ahogado con recibos en abril."
description: "Un combo coherente de finanzas para el dueño de un negocio chico que se prepara para la temporada de impuestos: leer los números reales desde Xero o la planilla contable, convertirlos en un paquete de entrega organizado, y mandárselo al contador o contadora con una nota clara."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: xero
    reason: "Lee facturas, cuentas por cobrar/pagar vencidas, contactos y los reportes de P&L/balance/balance de comprobación directo de los libros — justo lo que un contador pide en época de impuestos, sin exportar cada reporte a mano."
  - kind: connector
    slug: google-sheets
    reason: "La mayoría de los negocios chicos no usan un software contable — llevan ingresos y gastos en una planilla. Este conector lee esa misma planilla para que el dueño sin Xero tenga el mismo flujo de 'ordena los números'."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte los números en bruto y las notas del dueño ('este gasto fue la laptop nueva', 'este cliente todavía no pagó') en un paquete de entrega estructurado que el contador puede usar de verdad, en vez de una montaña de filas exportadas."
  - kind: skill
    slug: internal-comms
    reason: "Redacta la nota que acompaña el paquete de entrega — qué incluye, qué cambió desde el trimestre pasado, y qué necesita el contador de vuelta del dueño, y para cuándo."
---
## Para quién es

Dueños de negocios chicos y profesionales independientes que llevan sus propios libros (en Xero o en una planilla) y necesitan entregarle números limpios a un contador o contadora — en época de impuestos, a fin de trimestre, o cada vez que el contador pregunta "¿me puedes mandar un P&L actualizado?".

Úsalo cuando el trabajo recurrente es "ordena los números y mándalos", no declarar los impuestos tú mismo.

## Qué te ayuda a hacer

Este kit cubre la previa al contador, no la declaración en sí:

- Leer los números reales — P&L, balance, balance de comprobación, facturas sin cobrar — desde Xero, o desde la planilla donde realmente viven los libros.
- Hacer preguntas simples como *"¿qué sigue sin cobrarse?"* o *"¿cuánto gastamos en software este trimestre?"* en vez de buscar entre pestañas o reportes.
- Convertir los números más el contexto en un paquete de entrega organizado con Doc Co-authoring: resumen categorizado, ítems marcados, preguntas abiertas.
- Redactar la nota que lo acompaña con Internal Comms — qué se adjunta, qué cambió, qué se necesita de vuelta, y para cuándo.

El resultado esperado es que el dueño llegue a la temporada de impuestos con un paquete organizado y una nota clara, en vez de una carpeta de archivos sueltos y un email vago de "avísame si necesitas algo más".

## Qué incluye

### Conectores

- **Xero** — lee facturas, cuentas por cobrar/pagar vencidas, contactos y los reportes de P&L/balance/balance de comprobación. Es la fuente de verdad contable para los dueños que usan software de contabilidad.
- **Google Sheets** — lee la planilla donde muchos negocios chicos realmente llevan ingresos, gastos y flujo de caja, para el dueño que no usa Xero. El mismo trabajo de "ordena los números", la otra fuente común.

### Skills

- **Doc Co-authoring** — estructura los números y las notas del dueño en un paquete de entrega limpio y organizado, en vez de una pila de filas exportadas.
- **Internal Comms** — redacta la nota que acompaña el paquete: qué incluye, qué cambió, y qué se necesita de vuelta del dueño, y para cuándo.

### CLI

No incluye ninguna herramienta de CLI. El flujo es leer los libros, ordenarlos y entregarlos — no necesita ejecución de terminal.

## Cómo usarlo

1. Instala el kit y conecta Xero (si lo usas) o Google Sheets (si tus libros viven en una planilla).
2. Pregunta *"¿cuál es nuestro P&L de este trimestre?"* o *"¿qué facturas siguen sin cobrarse?"* y recibe los números reales.
3. Pídele a Doc Co-authoring que *"arme un paquete de entrega para mi contador: ingresos, gastos por categoría, facturas sin cobrar, y marque cualquier cosa rara."*
4. Suma el contexto que Doc Co-authoring no puede inferir solo — para qué fue un gasto grande, qué cliente está disputando una factura — así el paquete no queda con huecos.
5. Pídele a Internal Comms que *"redacte el email para mandar con este paquete, mencionando qué cambió desde el trimestre pasado y qué falta mandar todavía."*

## Por qué estas piezas van juntas

El kit es coherente porque sigue un solo loop: **leer los libros → ordenar los números → entregarlos con una nota clara.**

- Xero y Google Sheets son los dos lugares donde realmente viven los libros de un negocio chico — un conector para el dueño con software contable, otro para el dueño con planilla.
- Doc Co-authoring convierte números en bruto en algo sobre lo que el contador puede actuar, en vez de un export de planilla.
- Internal Comms cierra el loop con la nota que de verdad se lee antes que el adjunto. (Se solapa con el Kit Dueño de Negocio y el kit Docs & Team Comms en las mismas dos skills — la diferencia es el flujo de trabajo: esos kits son para propuestas de clientes y anuncios de equipo; este está enfocado en los números contables y el handoff al contador.)

También se solapa con un kit de finanzas basado en Xero que lee los mismos libros, así que vale la pena ser precisos con la diferencia: ese kit escribe un **resumen financiero mensual para el dueño** (o para un socio/inversor). Este kit escribe un **paquete de entrega para el contador**, un profesional externo, en época de impuestos o fin de trimestre — una audiencia distinta, un artefacto distinto (paquete organizado + nota, no un memo resumen), y suma el conector de Google Sheets para el dueño, muy común, que no usa Xero para nada — algo que ese otro kit deja explícitamente fuera de alcance.

Instaladas por separado, el dueño sigue exportando reportes a mano, reformateándolos en algo legible, y escribiendo el email que los acompaña desde cero cada vez. Instaladas juntas, es un solo flujo de "cuáles son mis números" a "mandado al contador".

## Límites

- No prepara ni declara impuestos, no genera 1099s, no calcula retenciones de nómina, ni presenta ningún formulario ante una autoridad fiscal — ningún conector ni skill del catálogo hace eso hoy. Usa software dedicado de impuestos/nómina o a tu contador para la declaración.
- No da asesoría fiscal ni interpreta la ley impositiva — ordena números y redacta la nota alrededor de ellos; las decisiones fiscales las toma el contador.
- Xero y Google Sheets necesitan cada uno su propia cuenta/conexión, y el kit solo ve lo que esas cuentas permiten.
- El paquete de entrega es tan completo como los libros detrás de él — efectivo, cheques u otro procesador que no esté en Xero o en la planilla quedan invisibles para el kit.
- No manda nada por su cuenta — redacta el paquete y la nota; el dueño los revisa y los manda.
