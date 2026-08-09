---
name: Tax Prep Checklist
logo: /skills/tax-prep-checklist.svg
category: finance
vendors: ["claude", "codex", "gemini"]
author: "TerminalSync"
status: available
tagline: "Sabe exactamente qué necesitas antes de que llegue la temporada de impuestos"
description: "Arma una checklist personalizada de documentos y datos para declarar los impuestos de tu negocio, según el tipo de entidad, el estado, si tenés empleados/contratistas y qué cambió este año — sin estimar nunca cuánto debés ni decirte cómo declarar."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]
---
## Cuándo usarlo

- Dijiste "¿qué necesito para declarar los impuestos de mi negocio este año?" o "¿me falta algo antes de ir a mi contador?"
- Se acerca la temporada de impuestos y querés una lista personalizada en vez de un artículo genérico de "esto es lo que necesitás".
- Tu situación cambió este año — nuevo tipo de entidad, primer empleado, primer contratista, nuevo estado, un vehículo u oficina en casa agregados — y no estás seguro de qué suma eso a la pila.
- Querés la checklist organizada por de dónde *viene* cada documento (banco, proveedor de nómina, procesador de pagos, contador anterior) para que juntarlo sea una lista de tareas, no un laberinto.

No lo uses para calcular cuánto debés, decidir cómo declarar, o interpretar la ley fiscal para tu situación específica — no hace eso. Es un organizador de documentos/datos, no un preparador ni un asesor.

## Qué hace

Hace una intake corta y después devuelve una checklist agrupada por categoría:

- **Preguntas de intake** (solo lo necesario): tipo de entidad (sole prop, LLC, S-corp, partnership, otro/no sé), estado(s) donde operás, si tenés empleados, si pagaste contratistas, si algo cambió desde el año pasado (nueva entidad, nuevo estado, vehículo, oficina en casa, compras de equipo, un préstamo, un inversor).
- **Documentos de ingresos**: extractos bancarios/de comercio, 1099s que deberías esperar *recibir*, facturas, reportes de pagos de plataformas (Stripe, Shopify, PayPal) — nombrados por fuente, no asumidos.
- **Documentos de gastos**: extractos de banco/tarjeta, registro de millaje, medidas de la oficina en casa, recibos de compras grandes, reportes de nómina si tenés empleados.
- **Referencias del año anterior**: la declaración del año pasado, cronogramas de depreciación, pérdidas trasladables — marcadas como "pedile esto a tu contador si cambiaste de preparador".
- **Ítems específicos de la entidad**: solo los que aplican al tipo de entidad dado (por ejemplo, K-1s para partnerships/S-corps, declaraciones de nómina si hay empleados) — no lista ítems de tipos de entidad que el usuario no tiene.
- **Alertas abiertas**: cualquier cosa que el intake no pudo resolver (por ejemplo, "no estás seguro si sos sole prop o LLC de un solo miembro") queda listada como pregunta para el contador, no adivinada.

Nunca le dice al usuario cuánto debe, qué formularios presentar, o cómo clasificar un ítem límite (trabajador vs. contratista, deducible o no) — eso queda marcado como **"consultá a tu contador/CPA o revisá IRS.gov"**, no respondido.

## Cómo usarlo

1. Respondé las preguntas de intake (tipo de entidad, estado, empleados/contratistas, qué cambió este año). Si no sabés una respuesta, decilo — la skill lo marca en vez de asumir.
2. Recibí la checklist categorizada. Marcá lo que ya tenés.
3. Usá las alertas "consultá a tu contador" como tu agenda real para la reunión de handoff — son las partes que necesitan un profesional, no un buscador.
4. Volvé a correrla si tu situación cambia a mitad de año (por ejemplo, contratás tu primer empleado) para ver qué se agrega.

**Si le paga a contratistas, los W-9 van primero.** Un negocio con contratistas
no puede cerrar su preparación sin tener un W-9 de cada uno: es de donde sale
el 1099-NEC, y correr atrás de un contratista en enero cuesta muchísimo más que
en junio. Listalo siempre de forma explícita; es el documento que más se olvida,
y la falta recién se descubre sobre la fecha límite.

## Ideal para

Founders solo, freelancers y dueños de pequeños negocios sin equipo de finanzas propio que quieren llegar a la temporada de impuestos (o a la oficina de su contador) con la pila correcta de documentos en vez de una adivinanza. No es para quien necesita un cálculo fiscal real, una decisión de cómo declarar, o consejo sobre una posición fiscal específica — eso siempre va a un CPA/EA con licencia o a una búsqueda en IRS.gov, y la skill lo dice cada vez que le piden cruzar esa línea.
