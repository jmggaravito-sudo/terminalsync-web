---
name: Meeting Notes
logo: /skills/meeting-notes.svg
category: productivity
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Convertí las notas de una reunión en decisiones y tareas con dueño"
description: "Lee notas crudas o la transcripción de una reunión y devuelve las decisiones tomadas, las tareas con dueño y fecha cuando están dichas, y las preguntas abiertas — sin inventar dueños, fechas ni compromisos que nadie asumió."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude"]
catalogReady: false
---
## Cuándo usarlo

- Tenés notas crudas de una reunión, una transcripción de una llamada o un pegado desprolijo y querés sacar las decisiones y los próximos pasos.
- Dijiste "¿qué decidimos realmente?", "¿quién queda a cargo de qué después de esta call?" o "convertí estas notas en tareas".
- La reunión mezcló compromisos reales con tangentes y charla, y querés separar la señal del ruido.
- Necesitás un resumen de seguimiento para mandar sin releer toda la transcripción.

No lo uses para inventar una estructura que no existe. Si las notas son demasiado flacas para recuperar decisiones, la skill debe decirlo en vez de fabricar una lista prolija.

## Qué hace

Lee las notas y devuelve un resumen estructurado:

- **Decisiones**: lo que realmente se acordó, citado o parafraseado de cerca a partir de las notas.
- **Tareas**: cada una como *qué — dueño — fecha*. El dueño y la fecha se completan **solo cuando las notas los dicen**; si no, quedan marcados como `dueño: sin asignar` / `fecha: no dicha`, nunca adivinados.
- **Preguntas abiertas**: puntos sin resolver, desacuerdos y cosas explícitamente pospuestas.
- **Resumen de una línea** (opcional): el resultado de la reunión en una frase.

Su disciplina es lo que la hace útil: nunca le atribuye un compromiso a alguien que no lo asumió, nunca inventa una fecha límite, y nunca convierte un "capaz deberíamos mirar X" en una decisión firme. La incertidumbre se marca, no se disimula.

## Cómo usarlo

1. Pegá las notas o la transcripción. Agregá los nombres de los asistentes si la transcripción usa iniciales o "Speaker 1".
2. Pedí el resumen: decisiones, tareas (dueño + fecha cuando estén dichas) y preguntas abiertas.
3. Si falta un dueño o una fecha, pedile a la skill que lo deje sin asignar en vez de asumir — ya lo hace por defecto.
4. Revisá las tareas y completá el dueño/fecha que las notas no capturaron antes de mandar el resumen.

## Ideal para

Managers, founders y equipos que corren reuniones y quieren un resumen confiable sin una app de notas — sobre todo usuarios no técnicos que solo quieren "quién queda a cargo de qué, para cuándo" sacado limpio de un pegado, sin nada inventado.
