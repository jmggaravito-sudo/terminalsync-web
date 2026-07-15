---
name: Kit de Investigación Web y Briefs
logo: /logos/ts-kit.svg
category: research
status: available
tagline: "Investigá un tema en la web, recordá lo que encontrás entre sesiones y convertilo en un brief claro."
description: "Un bundle de investigación para analistas, consultores y fundadores que investigan temas en la web y necesitan hallazgos que persistan entre sesiones y se conviertan en un brief estructurado, no en pestañas sueltas."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: brave-search
    reason: "Busca en la web a través de un índice independiente para que la investigación se apoye en fuentes actuales en vez de la memoria de entrenamiento del modelo."
  - kind: connector
    slug: memory
    reason: "Persiste hallazgos, entidades y relaciones entre sesiones para que una investigación de varios días se acumule en vez de empezar de cero cada vez."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte los hallazgos acumulados en un brief claro y bien estructurado junto al usuario, en vez de un pegado crudo de links."
---
## Para quién es

Analistas, consultores, investigadores y fundadores que investigan un mercado, competidor, tecnología o pregunta en la web y necesitan que el resultado sea un brief claro — con hallazgos que se arrastren de una sesión a la siguiente.

Usalo cuando el trabajo recurrente es "averiguá esto, llevá registro de lo que aprendemos y escribilo".

## Qué te ayuda a hacer

Este kit conecta la investigación web con un resultado durable:

- Buscar en la web con Brave Search para juntar fuentes actuales sobre un tema.
- Persistir los hallazgos, entidades y relaciones en Memory para que una investigación de varias sesiones se vaya construyendo.
- Recuperar hallazgos anteriores en una sesión posterior en vez de reinvestigar desde cero.
- Convertir el material acumulado en un brief estructurado con Doc Co-authoring.

El resultado esperado es un brief con fuentes que refleja varias pasadas de investigación, no una respuesta de una sola vez que se olvida de todo mañana.

## Qué incluye

### Skills

- **Doc Co-authoring** — co-escribe el brief a partir de los hallazgos acumulados, dándole estructura y claridad. Es donde la investigación se convierte en un entregable.

### Conectores

- **Brave Search** — busca en la web a través de un índice independiente para que la investigación se apoye en fuentes actuales.
- **Memory** — guarda hallazgos, entidades y relaciones entre sesiones para que la investigación se acumule en vez de reiniciarse.

### CLI

No se incluye ninguna CLI. El usuario objetivo suele ser no-técnico, y el workflow de investigación-a-brief no requiere ejecución en la terminal.

## Cómo usarlo

1. Instalá el kit y conectá Brave Search con un `BRAVE_API_KEY`.
2. Pedile al asistente que investigue el tema con Brave Search y capture los hallazgos y fuentes clave en Memory.
3. Continuá entre sesiones: preguntale qué ya sabe antes de volver a buscar, para que las nuevas pasadas se apoyen en las anteriores.
4. Cuando el panorama esté completo, usá Doc Co-authoring para redactar un brief estructurado a partir de los hallazgos guardados.
5. Revisá el brief, pedí una sección de fuentes y afiná el encuadre.

## Por qué estas piezas van juntas

El kit sirve porque investigar rara vez es una sola sesión:

- Brave Search apoya cada pasada en fuentes actuales e independientes.
- Memory conserva lo que aprendiste para que la próxima sesión sume en vez de repetir.
- Doc Co-authoring convierte el conocimiento acumulado en un brief que alguien realmente puede leer.

Instalados por separado, los hallazgos viven en el scrollback y desaparecen, y cada sesión reinvestiga lo mismo. Instalados juntos, el kit da un camino coherente: **buscar → recordar → seguir construyendo → escribir el brief**.

## Límites

- No garantiza la completitud ni la exactitud de las fuentes web; una persona valida los hallazgos antes de usarlos para decisiones.
- Brave Search requiere una API key de Brave Search y está sujeto a los límites de plan de esa cuenta.
- Memory persiste lo que se le indica guardar; no es una base de conocimiento ni una base de datos completa, y vos decidís qué vale la pena conservar.
- No accede a fuentes con paywall, privadas o autenticadas salvo que le pases ese contenido directamente.
- Es un kit de investigación y redacción, no una herramienta de analytics o pipeline de datos — para datasets estructurados, usá un conector de base de datos.
