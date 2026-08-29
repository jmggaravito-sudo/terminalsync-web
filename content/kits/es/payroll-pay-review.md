---
name: Kit de Revisión de Nómina y Pagos al Equipo
logo: /logos/ts-kit.svg
category: finance
status: available
tagline: "Revisá la nómina antes de aprobarla, y avisale al equipo qué cambió — sin perderte entre pestañas de Gusto."
description: "Un combo coherente de nómina para el dueño de un negocio chico que corre payroll en Gusto: revisar cambios de plantilla y de costo antes de aprobar una corrida de pago, convertirlos en una nota de revisión corta, y redactar el mensaje al equipo cuando el pago realmente cambia."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: gusto
    reason: "Lee la plantilla real, la lista de contratistas, el próximo período de pago y la info de impuestos/deducciones de nómina directo de Gusto — de solo lectura, así el dueño ve qué está por correr antes de aprobarlo dentro de Gusto."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte los datos en bruto de Gusto (altas, bajas, cambios de contratistas, costo del período) en una nota de revisión corta y estructurada antes de aprobar la corrida, en vez de que el dueño cruce pestañas de memoria."
  - kind: skill
    slug: internal-comms
    reason: "Redacta el mensaje al equipo cuando un cambio de pago realmente necesita anunciarse — una fecha efectiva de aumento, un beneficio nuevo, una corrección de nómina — con el aviso de revisión para temas sensibles de compensación que Internal Comms ya trae incorporado."
---
## Para quién es

Dueños de negocios chicos, o quien corra la nómina en un equipo chico (a menudo el mismo dueño), que procesan payroll en Gusto y quieren detectar qué cambió — una alta, una baja, un contratista sumado o dado de baja, un salto de costo — antes de aprobar una corrida, y que necesitan avisarle al equipo cuando el pago realmente cambia.

Usalo cuando el trabajo recurrente es "revisá esta corrida de pago antes de que apruebe" y "avisale al equipo qué cambió", no correr la nómina en sí.

## Qué te ayuda a hacer

- Hacerle a Gusto preguntas simples antes de aprobar la nómina: *"¿quién es nuevo desde el último período de pago?"*, *"¿alguien fue dado de baja?"*, *"¿cuánto va a costar esta corrida?"*, *"¿cuánto les pagamos a los contratistas el mes pasado?"*
- Convertir esos datos de solo lectura en una nota de revisión corta con Doc Co-authoring: cambios de plantilla, diferencia de costo, ítems a chequear antes de aprobar.
- Cuando un cambio de pago necesita un anuncio al equipo — un aumento, una ventana de inscripción a un beneficio nuevo, una corrección de nómina — redactarlo con Internal Comms, que marca cuándo el tema necesita ojos de RR.HH. o legal antes de mandarse.
- El resultado esperado es que el dueño apruebe la nómina (dentro de Gusto — este kit no hace esa parte) con una idea clara de qué cambió, y que el equipo se entere de los cambios de pago con un mensaje claro en vez de por rumores o no enterarse.

## Qué incluye

### Conectores

- **Gusto** — de solo lectura en Empresa y Organización, Empleados, Contratistas, Nómina y Control de Tiempo. Responde "qué cambió" y "cuánto va a costar" sin que el dueño tenga que clickear las pestañas de Gusto, y no puede correr la nómina ni editar un registro por sí mismo — cada aprobación sigue pasando dentro de Gusto.

### Skills

- **Doc Co-authoring** — estructura los datos de Gusto más las notas del dueño ("esta alta es la conversión de un contratista a empleado full-time", "esta baja fue involuntaria, RR.HH. ya lo aprobó") en una nota de revisión corta antes de aprobar la corrida.
- **Internal Comms** — redacta el mensaje al equipo cuando cambia el pago. Compensación, beneficios y actualizaciones de políticas están explícitamente dentro de su propio alcance declarado, y marca cuándo un borrador necesita revisión de RR.HH. o legal antes de mandarse — algo que importa para cualquier cosa relacionada con el pago.

### CLI

No incluye ninguna herramienta de CLI. El flujo es leer datos de nómina, redactar una nota de revisión y redactar un anuncio — nada de eso necesita ejecución de terminal.

## Cómo usarlo

1. Instalá el kit y conectá Gusto (login por OAuth; elegí qué categorías de datos compartir — Información de la Empresa, Datos de Empleados, Datos de Contratistas, Datos de Nómina, Control de Tiempo).
2. Unos días antes de una corrida de pago programada, preguntá *"¿quién cambió desde el último período de pago — altas, bajas, cambios de contratistas?"* y *"¿cuánto va a costar esta nómina?"*
3. Pedile a Doc Co-authoring que *"arme una nota corta de revisión previa a la aprobación: cambios de plantilla, costo contra la corrida anterior, y qué debería chequear antes de aprobar."*
4. Sumá el contexto que los datos de Gusto no pueden traer solos — por qué pasó una baja, si un salto de costo era esperado — así la nota no queda como un volcado de datos sin contexto.
5. Cuando un cambio de pago necesite un anuncio al equipo, pedile a Internal Comms que *"redacte el mensaje sobre [el aumento / el beneficio nuevo / la corrección], y marque qué necesita revisión de RR.HH. o legal antes."*
6. Aprobá la corrida de pago real dentro de Gusto — este kit nunca hace ese paso por vos.

## Por qué estas piezas van juntas

El kit es coherente porque sigue un solo loop: **ver qué está cambiando → revisarlo antes de aprobar → avisarle al equipo cuando importa.**

- Gusto es la única pieza que ve los datos reales de nómina — sin él, "revisar antes de aprobar" significa que el dueño recuerde de memoria los cambios de plantilla o clickee a mano la interfaz de Gusto.
- Doc Co-authoring convierte esos datos crudos y de solo lectura en algo sobre lo que el dueño puede actuar en dos minutos, en vez de pestañas abiertas y cálculo mental.
- Internal Comms cierra el loop hacia el equipo: lista explícitamente compensación, beneficios y cambios de política dentro de su propio alcance, y trae incorporado el aviso de "esto necesita revisión de RR.HH./legal" que un mensaje relacionado con el pago necesita específicamente. (Este kit comparte Doc Co-authoring + Internal Comms con el Kit de Contabilidad y Handoff al Contador y con el Kit Dueño de Negocio — las mismas dos skills base, un flujo distinto: esos convierten números en un paquete para el contador o en una propuesta para un cliente; este convierte los datos de nómina de Gusto en una nota de revisión previa y un anuncio de pago para el equipo.)
- También es un kit de finanzas que no se solapa con los kits de finanzas basados en Xero del catálogo: Kit de Contabilidad y Handoff al Contador y Kit de Finanzas para Negocios Chicos leen los libros generales de Xero; este kit lee específicamente los datos de nómina y RR.HH. de Gusto — la mayoría de los negocios chicos corren nómina y contabilidad como sistemas separados, así que un cliente de Gusto puede instalar este kit junto a cualquiera de los dos kits de Xero sin duplicación.

Instaladas por separado, el dueño cruza las pestañas de Gusto de memoria antes de aprobar, y escribe el anuncio al equipo desde una página en blanco cada vez. Instaladas juntas, es un solo flujo de "qué cambió este período de pago" a "el equipo se enteró, y aprobé con los ojos abiertos".

## Límites

- Está construido enteramente sobre las herramientas de solo lectura de Gusto: no puede correr la nómina, aprobar una corrida de pago, editar el registro de un empleado o contratista, ni cambiar la compensación. Cada una de esas acciones sigue pasando dentro de Gusto directamente.
- No calcula ni presenta formularios de impuestos de nómina (941, retenciones estatales, W-2) ni genera/presenta 1099s — ningún conector o skill del catálogo hace eso hoy; ver los Límites del Kit de Contabilidad y Handoff al Contador para el mismo vacío del lado contable.
- Solo ve lo que el dueño le concede a Gusto al momento de conectar (Información de la Empresa, Datos de Empleados, Datos de Contratistas, Datos de Nómina y Control de Tiempo son cada uno opcional) — lo que no se comparte queda invisible para el kit.
- Para despidos, cambios de compensación, beneficios u otros temas sensibles de RR.HH., Internal Comms redacta un punto de partida y marca explícitamente la necesidad de revisión de RR.HH./legal antes de mandar nada — no reemplaza esa revisión.
- No manda nada por su cuenta — redacta la nota de revisión y el anuncio; el dueño los revisa, aprueba la nómina en Gusto y manda el mensaje.
