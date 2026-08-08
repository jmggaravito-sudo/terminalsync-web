---
name: Quarterly Tax Estimate Prep
logo: /skills/quarterly-tax-estimate-prep.svg
category: finance
vendors: ["claude", "codex", "gemini"]
author: "TerminalSync"
status: available
tagline: "Preparate los números para el pago trimestral estimado — no una factura de impuestos"
description: "Organiza tus ingresos y gastos en los datos que necesita un pago trimestral de impuestos estimados (ganancia neta, cifra de safe-harbor del año pasado, fecha de pago), y muestra un rango aproximado claramente marcado — nunca un número final, nunca presentado, nunca un sustituto de un CPA o del Formulario 1040-ES del IRS."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]
---
## Cuándo usarlo

- Dijiste "ayudame a prepararme para mis impuestos trimestrales" o "¿qué necesito antes de calcular mi pago estimado?"
- Se acerca una fecha límite trimestral (mediados de abril, junio, septiembre o enero) y querés tus números de ingresos/gastos organizados antes de sentarte con una calculadora, tu contador, o el Formulario 1040-ES.
- Querés un **rango aproximado** para chequear contra lo que te da tu CPA o tu software — no un número que vayas a pagar sin verificar.
- Querés las fechas límite y qué significa "safe harbor" explicado en lenguaje simple.

No lo uses para obtener un monto final de pago para presentar al IRS, para decidir tu retención, o para saltarte un CPA/software fiscal en la declaración real — produce un rango aproximado a partir de los números que le des, y lo dice cada vez.

## Qué hace

- **Organiza los datos**: ganancia neta acumulada del año (ingresos menos gastos del negocio), la obligación fiscal total del año pasado (para la comparación de safe-harbor), y para qué trimestre te estás preparando.
- **Indica la regla de safe-harbor** en términos simples (pagar aproximadamente la obligación del año pasado, o la de este año, la que sea menor, generalmente evita una multa) como regla general para verificar, no como un fallo personalizado.
- **Muestra un rango aproximado marcado**, calculado solo con los números provistos, con la tasa de impuesto de trabajo independiente y un rango aproximado de impuesto sobre la renta mostrados por separado y la cuenta mostrada paso a paso — para que sea verificable, no una caja negra.
- **Marca cada suposición**: si falta un número (obligación del año pasado, gastos acumulados, estado civil fiscal), dice exactamente qué falta y da el rango **con** y **sin** esa suposición en vez de elegir uno en silencio.
- **Siempre cierra con la misma advertencia**: esto es una estimación de planificación a partir de los datos dados, no un número presentado, no es asesoría fiscal, y no sustituye el Formulario 1040-ES, un software fiscal, o un CPA/EA — el número real depende de detalles (deducciones, créditos, otros ingresos) que esta skill no recibió y no debe adivinar.

Nunca presenta un número como final, nunca le dice al usuario que se salte consultar a un profesional, y nunca inventa ingresos o gastos acumulados que el usuario no dio.

## Cómo usarlo

1. Dale tu ganancia neta acumulada del año (o ingresos y gastos por separado) y, si la tenés, la obligación fiscal total del año pasado.
2. Decí para qué trimestre te estás preparando.
3. Revisá el rango aproximado y las suposiciones sobre las que está construido — si algo se ve raro, es porque faltó un dato, no porque se adivinó.
4. Llevá el rango al Formulario 1040-ES, tu software fiscal, o tu CPA/EA para obtener el monto real del pago — la salida de esta skill es una ayuda de planificación, no el número que mandás.

**Derivar no es toda la respuesta.** Cuando la deducibilidad de algo depende del
caso concreto — oficina en casa, un celular de uso mixto, un viaje que mezcló
trabajo y placer — igual decí qué hay que juntar: metros cuadrados y costo
total de la casa, qué proporción es uso del negocio, fechas y motivo del viaje,
comprobantes. Y ahí sí, la decisión la toma el profesional. Un "consultá a tu
contador" a secas deja a la persona donde estaba.

## Ideal para

Freelancers, founders solo y dueños de pequeños negocios que quieren llegar a la temporada de impuestos estimados con números organizados y un rango de chequeo en vez de arrancar en frío. No es para quien quiere una cifra final de pago sin confirmación profesional o de software — la skill se niega a presentar su rango como algo distinto de una estimación aproximada marcada con sus suposiciones.
