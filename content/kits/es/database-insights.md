---
name: Kit de Insights de Base de Datos
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Convertí una pregunta sobre tus datos de Postgres en una respuesta escrita y estructurada."
description: "Un flujo de análisis coherente para operadores y PMs con manejo de datos: consultá una base Postgres en modo solo lectura, razoná la pregunta paso a paso, y devolvé un informe escrito en vez de una tabla cruda."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: postgres
    reason: "Da acceso de consulta en solo lectura a la base real, así el análisis corre sobre filas reales en vez de suposiciones sobre los datos."
  - kind: connector
    slug: sequential-thinking
    reason: "Aporta un andamiaje de razonamiento paso a paso para que una pregunta de negocio difusa se descomponga en pasos ordenados en vez de una única consulta adivinada."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte los hallazgos en un informe escrito claro y compartible — el entregable que un stakeholder realmente lee — en vez de dejar una tabla cruda."
---
## Para quién es

Operadores, analistas y product managers con manejo de datos que tienen una base Postgres y responden seguido la misma forma de pregunta — "cuántos, qué segmento, qué cambió" — y quieren una respuesta escrita que puedan compartir, no solo el resultado de una consulta.

Usalo cuando quien pregunta puede leer output SQL pero quiere que el razonamiento y la redacción se manejen de forma consistente.

## Qué te ayuda a hacer

Este kit convierte una pregunta de datos en un informe:

- Consultar la base en solo lectura con el conector de Postgres.
- Descomponer la pregunta en pasos ordenados con Sequential Thinking, para que las suposiciones sean explícitas y cada paso construya sobre el anterior.
- Co-escribir un informe claro de los hallazgos con Doc Co-authoring.

El resultado esperado es un informe corto y con fuentes — qué se preguntó, cómo se calculó, qué dicen los números y las salvedades — no una tabla sin explicar.

## Qué incluye

### Conectores

- **Postgres** — acceso de consulta en solo lectura a la base sobre la que razona el análisis.
- **Sequential Thinking** — un andamiaje de razonamiento que convierte una pregunta en pasos ordenados e inspeccionables.

### Asistentes

- **Doc Co-authoring** — da forma a los hallazgos en un informe escrito compartible, con estructura y salvedades.

## Cómo usarlo

1. Instalá el kit y conectá Postgres con una cadena de conexión de solo lectura.
2. Hacé tu pregunta en lenguaje natural ("¿qué planes impulsaron la baja del mes pasado?").
3. Pedile a la IA que use Sequential Thinking para plantear los pasos del análisis y las consultas que cada uno necesita antes de correrlas.
4. Dejala correr las consultas de solo lectura por Postgres y revisá los resultados intermedios.
5. Pedile a Doc Co-authoring que escriba el informe: pregunta, método, hallazgos y salvedades — listo para pegar en un doc o mensaje.

## Por qué estas piezas van juntas

El kit es coherente porque separa las tres cosas que necesita una buena respuesta de datos:

- Postgres aporta la evidencia — las filas reales.
- Sequential Thinking aporta el método — pasos ordenados en vez de una consulta con suerte.
- Doc Co-authoring aporta el entregable — un informe que un stakeholder puede leer.

Instaladas por separado, tenés una herramienta de consulta y un asistente de escritura que no se hablan. Instaladas juntas, el kit da un camino: **plantear la pregunta → consultar los datos → razonar en pasos → escribir el informe**.

## Límites

- Lee datos; no los cambia. Usá una conexión de solo lectura — el kit no la impone por vos.
- Es tan correcto como los datos y la pregunta: una suposición equivocada produce un informe equivocado pero seguro. Revisá el método, no solo el número.
- No es un dashboard de BI ni un reporte programado — responde una pregunta a demanda, no monitorea métricas en el tiempo.
- Postgres requiere su propia cadena de conexión y está sujeto a los controles de acceso de esa base.
- No se conecta a planillas, warehouses ni bases que no sean Postgres; eso necesita otra configuración.
