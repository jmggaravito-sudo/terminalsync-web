---
name: Ramp
logo: /plugins/ramp.svg
category: operations
status: available
tagline: "Tus números para el impuesto trimestral, con el lado del gasto sacado directo de Ramp."
description: "Junta el conector de Ramp (MCP oficial: transacciones, facturas por pagar, reembolsos, proveedores y categorías contables por OAuth) con Preparación del Impuesto Trimestral Estimado (organiza ingresos y gastos en lo que necesita un pago estimado trimestral, con un rango aproximado claramente etiquetado y cada supuesto marcado), para que la mitad de gastos de tu estimado salga de lo que realmente gastaste en tarjetas, facturas y reembolsos — y no de una caja de extractos."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: ramp
skillSlugs: ["quarterly-tax-estimate-prep"]
---
## Cuándo usarlo

- Se acerca un vencimiento de impuesto estimado trimestral (mediados de abril, junio, septiembre y enero) y el gasto de tu negocio corre por Ramp — tarjetas corporativas, pago de facturas, reembolsos.
- Estás cansado de exportar extractos de tarjeta y banco y sumar el lado de gastos a mano cada trimestre.
- Quieres un rango aproximado etiquetado para contrastar con lo que te diga tu contador o tu software de impuestos — no un número que pagarías sin revisar.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Ramp (el conector)** es el MCP oficial hospedado de Ramp: con el login de tu propia cuenta (sin pegar ninguna API key), el agente lee tus transacciones, proveedores y categorías contables, reembolsos pendientes y facturas por pagar — los administradores ven datos de toda la compañía, los empleados solo los suyos. El MCP de Ramp también puede actuar (aprobar transacciones, bloquear tarjetas), pero el trabajo de este Plugin solo necesita la mitad de lectura.
- **Preparación del Impuesto Trimestral Estimado (la skill)** organiza la utilidad neta del año a la fecha (ingresos menos gastos del negocio) y el pasivo total del año anterior en los insumos que necesita un estimado trimestral, explica la regla de safe harbor en lenguaje claro, y muestra un rango aproximado paso a paso con cada supuesto marcado — nunca un número final, nunca una declaración presentada.

**Un ejemplo real:** pides *"Trae mis gastos del negocio del año a la fecha desde Ramp — tarjetas, facturas y reembolsos — y prepara mi estimado del Q3. Los ingresos van en $84.000; el impuesto total del año pasado fue $19.400."* El agente lee el gasto desde tu cuenta de Ramp, la skill calcula el rango etiquetado, y la salida dice exactamente qué insumos son reales y cuáles son supuestos.

## Cómo usarlo

1. Instala el Plugin y conecta Ramp — tu login de Ramp en el navegador, sin API key; tu rol y permisos viajan con la conexión.
2. Dale tú el lado de ingresos (Ramp no conoce tu facturación) y el pasivo total del año anterior si lo tienes — la skill se niega a inventar cualquiera de los dos.
3. Pídele al agente leer el gasto del año desde Ramp y preparar el estimado del trimestre.
4. Lleva el rango al Form 1040-ES, a tu software de impuestos o a tu CPA/EA para el monto real a pagar — lo que produce este Plugin es una ayuda de planificación, no el número que envías.

## Por qué el combo funciona

La skill por sí sola necesita que le entreguen ingresos *y* gastos — y la mitad de gastos es la dolorosa de juntar cada trimestre. El conector por sí solo sabe qué gastaste, pero no lo convierte en un estimado listo para impuestos. Juntos: las tarjetas, facturas y reembolsos que ya corres por Ramp se vuelven los insumos de gasto, con la matemática mostrada paso a paso y nada tipeado a mano.

## Límites

- Ramp aporta solo el lado de gastos — los ingresos y el pasivo del año anterior los das tú; la skill marca qué falta en lugar de adivinarlo.
- Según la documentación del propio Ramp, las consultas por MCP que devolverían más de 100 filas llegan vacías hasta que las acotas — con volúmenes altos de transacciones el agente puede necesitar traer el gasto del año por trozos (por mes o por proveedor), y libros muy grandes pueden igualmente requerir una exportación de gastos desde Ramp.
- El rango aproximado es una estimación de planificación con supuestos marcados — no un número presentado, no asesoría tributaria, y no un sustituto del Form 1040-ES, un software de impuestos o un CPA/EA.
- El conector también puede aprobar transacciones y bloquear tarjetas; este Plugin no usa nada de eso — preparar tus números solo lee, y no cambia nada en Ramp.
- Es un server hospedado por Ramp (`mcp.ramp.com`), no algo que corre en tu computadora: lo que el agente ve está acotado por tu rol en Ramp, y los administradores deciden quién puede conectarse.
