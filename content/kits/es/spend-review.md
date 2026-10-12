---
name: Kit de Revisión de Gastos
logo: /logos/ts-kit.svg
category: finance
status: available
tagline: "Vé a dónde se fue la plata de verdad, despachá lo pendiente de aprobación, y cerrá cada mes con un memo de gastos que el equipo sí lee."
description: "Un bundle de finanzas coherente para el dueño, responsable financiero o jefe de operaciones que maneja el gasto de la empresa con tarjetas Ramp: consultá las transacciones reales en vez de adivinar, decidí lo pendiente, bloqueá lo que se salió de política, dejalo escrito y avisale al equipo qué cambió."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: ramp
    reason: "Tiene el libro de gastos real y las palancas en las que termina toda revisión — transacciones, principales proveedores, qué recibo falta, reembolsos y solicitudes pendientes, saldos de tarjetas, más las acciones mismas (aprobar, rechazar, bloquear una tarjeta) — así la revisión corre sobre lo que pasó de verdad, no sobre lo que alguien recuerda haber gastado."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte esas respuestas en el artefacto recurrente del trabajo — un memo mensual de revisión de gastos con estructura, decisiones y preguntas abiertas que se mantienen entre borradores — en vez de respuestas de chat que se evaporan cuando cerrás la ventana y el mes siguiente arranca de cero."
  - kind: skill
    slug: internal-comms
    reason: "Lleva las decisiones a la gente a la que le cambian las reglas — una nueva regla de recibos, límites más ajustados, una tarjeta bloqueada — como un mensaje para el equipo con audiencia, tono y qué-cambia-para-vos, en vez de reenviar el memo que nadie lee."
---
## Para quién es

Un dueño, responsable financiero o jefe de operaciones de una pyme que maneja su gasto en Ramp — tarjetas corporativas, reembolsos y políticas de gastos. El trabajo recurrente que cubre este kit es la revisión de gastos: el chequeo semanal y el cierre de mes sobre a dónde se fue la plata.

Usalo cuando las preguntas de siempre sean *"¿a dónde se fue la plata este mes?"*, *"¿qué sigue pendiente de aprobación?"* y *"¿quién debe recibos?"* — y la respuesta honesta hoy sea scrollear los reportes de Ramp línea por línea o adivinar desde el extracto del banco.

## Qué te ayuda a hacer

Este kit cubre el loop completo de una revisión de gastos, de las preguntas a las decisiones y de las decisiones a la gente que afectan:

- **Verlo**: principales proveedores por gasto, transacciones con recibo o memo faltante, reembolsos y solicitudes pendientes, saldos de tarjetas — todo consultado del libro real.
- **Decidirlo**: aprobar o rechazar transacciones, reembolsos y solicitudes pendientes con su motivo, y bloquear una tarjeta que se salió de política o se perdió.
- **Dejarlo escrito**: un memo mensual de revisión — a dónde se fue la plata, qué cambió, qué vigilar — que sobrevive más allá de la ventana del chat.
- **Comunicarlo**: cuando la revisión cambia una regla, el equipo se entera con una actualización de política clara, no con silencio seguido de una tarjeta rechazada.

El resultado esperado: la revisión de gastos deja de ser un apagón-incendio trimestral y se vuelve un loop repetible — **ver → decidir → registrar → comunicar.**

## Qué incluye

### Conectores

- **Ramp** — el libro de gastos y las palancas. Lee tus transacciones, principales proveedores, recibos faltantes, reembolsos y solicitudes pendientes, saldos de tarjetas y límites de gasto; y ejecuta las acciones rutinarias en las que termina una revisión — aprobaciones, rechazos, bloqueos de tarjeta — siempre acotado por tu propio rol en Ramp. Se conecta con tu login de Ramp en el navegador; sin pegar ninguna API key.

### Skills

- **Doc Co-Authoring** — el artefacto de la revisión. Guía el memo mensual por brief → outline → borrador → revisión, manteniendo decisiones, números y preguntas abiertas consistentes entre rondas, así mes a mes afinás un documento vivo en vez de reescribir de cero.
- **Internal Comms** — la mitad que llega al equipo. Redacta la actualización de política o el resultado de la revisión que tu gente necesita escuchar — qué cambia, qué no, qué tiene que hacer cada quien y dónde preguntar — con el tono calibrado en vez de corporativo-vago.

## Cómo usarlo

1. Instalá el kit y conectá Ramp con tu propia cuenta — un login en el navegador, sin API key. Tus permisos de Ramp viajan con la conexión: los administradores ven datos de toda la empresa, los empleados solo los suyos.
2. Primera mirada al mes: *"Muéstrame nuestros principales proveedores de software por gasto de este trimestre."* Después la pasada de higiene: *"Encontrá transacciones de los últimos 14 días con recibo o memo faltante."*
3. Despachá la cola: *"Trae los reembolsos y solicitudes pendientes para la revisión de esta semana"* y decidí cada uno — las aprobaciones están gated detrás de un paso de confirmación antes de escribir nada.
4. Cerrá el mes: pedile a Doc Co-Authoring el memo de revisión — a dónde se fue la plata, qué decidiste, qué vigilar el mes que viene — construyendo sobre el memo del mes anterior en vez de arrancar de nuevo.
5. Cuando la revisión cambie una regla — recibos ahora dentro de 14 días, un límite más bajo en una tarjeta — pedile a Internal Comms la actualización, y compartila donde lee tu equipo antes de que la primera tarjeta rechazada se los enseñe por las malas.

## Por qué estas piezas van juntas

El kit sigue el loop real de una revisión de gastos, no una pila de herramientas de finanzas:

- Ramp tiene **lo que pasó de verdad** — transacciones, proveedores, recibos y aprobaciones pendientes — y carga las acciones en las que termina la revisión.
- Doc Co-Authoring convierte las respuestas en **el registro** — un memo con estructura que sobrevive al mes.
- Internal Comms hace que las decisiones **lleguen al equipo** — una política que la gente entiende en vez de rechazos sorpresa.

Instaladas por separado, obtenés respuestas precisas en una ventana de chat que se cierra y desaparece; la cola de aprobaciones queda viviendo en Ramp; y el equipo se entera de la nueva regla de recibos cuando le rechazan una tarjeta. Instaladas juntas, un solo camino cubre el loop: **leer el libro → decidir lo pendiente → escribir el memo → avisarle al equipo.**

Comparte sus dos skills con los otros kits de finanzas, pero el terreno es distinto: Kit de Finanzas para Negocio Chico lee los libros (Xero + Stripe) y escribe el resumen financiero mensual que lee el dueño; Kit de Contabilidad y Handoff al Contador arma el paquete para el contador. Este kit corre una capa más abajo de los libros — en la capa de tarjetas corporativas y reembolsos, donde la plata se va de verdad — y termina en acciones (aprobaciones, bloqueos) y un aviso de política para el equipo, no en un artefacto contable.

## Límites

- **Requiere Ramp.** Si tus tarjetas, reembolsos y políticas de gasto no corren en Ramp, no hay nada que conectar; este kit no tiene un ancla equivalente para otra plataforma de gasto.
- **No es contabilidad.** Sin libro mayor, sin conciliación, sin preparación de impuestos — para el resumen financiero mensual o el paquete del contador, usá esos kits. Los libros de Ramp siguen siendo la fuente de verdad.
- **Dos acciones quedan dentro de la app de Ramp**: las aprobaciones de facturas no están disponibles por MCP, y los archivos de recibos no se pueden adjuntar por ahí — las facturas se aprueban y los recibos se adjuntan directo en Ramp.
- **Ramp MCP es hospedado por Ramp** y puede leer y escribir (aprobaciones, bloqueos de tarjetas, codificación contable). Lo que el agente puede ver o hacer está acotado por tu propio rol en Ramp; los administradores controlan quién puede conectarse (Company → Integrations → Ramp MCP → Manage access). Ramp advierte que su MCP está sujeto a cambios, con tools nuevas agregándose regularmente.
- **Los queries grandes hay que acotarlos**: las consultas que devolverían más de 100 filas llegan vacías hasta que limitás el pedido (por mes, proveedor o tarjeta).
- **Reporta y aplica la política; no la escribe.** Los límites, programas y reglas de recibos que chequea son los que vos seteaste en Ramp — decidir cómo debe ser la política sigue siendo decisión del dueño.
