---
name: Kit de Operaciones de Equipo
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Mirá qué vence, sacá el contexto del hilo, y contale al equipo qué se mueve y qué está frenado — manejá la operación del día a día desde un solo lugar."
description: "Un combo coherente de operaciones para un líder de operaciones o un equipo chico que lleva el trabajo en ClickUp y coordina en Slack: ver qué vence o está frenado, sacar el contexto del hilo relevante, y convertirlo en un status claro en vez de perseguir gente para un resumen verbal."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: clickup
    reason: "Lee y actualiza el tablero de tareas real: qué vence, qué está frenado sin novedades, a quién está asignado, así las preguntas de status tienen una respuesta real en vez de una estimación."
  - kind: connector
    slug: slack
    reason: "Saca el contexto del hilo detrás de una tarea o un bloqueo, y es donde el status resultante se comparte de verdad con el equipo."
  - kind: skill
    slug: internal-comms
    reason: "Convierte el status de tareas y proyectos en un update interno claro — qué cambió, qué está bloqueado, quién lo tiene, qué sigue — en vez de un volcado crudo de tareas."
---
## Para quién es

Un líder de operaciones, coordinador de proyectos, o un equipo chico que lleva el trabajo en sí en ClickUp y coordina al equipo en Slack, y necesita convertir *"¿cómo viene esto?"* en una respuesta real sin escribirle a cinco personas para un resumen verbal.

Usalo cuando el trabajo recurrente es *"¿qué vence, qué está frenado, y el equipo se enteró?"* para trabajo que vive en un tablero de tareas, no en una wiki.

## Qué te ayuda a hacer

Este kit cubre el loop de tarea-a-update-de-equipo de la operación del día a día:

- Chequear **qué vence, qué está frenado sin actividad, y quién lo tiene** leyendo ClickUp directamente.
- Sacar el **contexto del hilo de Slack** detrás de una tarea o un bloqueo, así el update refleja lo que realmente se discutió.
- Convertir el status de la tarea en un **update interno** claro con Internal Comms — qué cambió, qué está bloqueado, quién está en eso, qué sigue.
- Compartir ese update de vuelta donde el equipo ya está, en Slack.

El resultado esperado es un status apoyado en el estado real del trabajo, escrito con claridad, y entregado donde el equipo realmente mira — en vez de una planilla vieja o un mensaje de Slack armado de memoria.

## Qué incluye

### Conectores

- **ClickUp** — lee y actualiza workspaces, spaces, listas, tareas y docs, así *"qué vence esta semana"* o *"qué está frenado sin novedades"* tiene una respuesta real, y se puede crear una tarea o seguimiento directamente.
- **Slack** — lee el historial de canales e hilos para el contexto detrás de una tarea o un bloqueo, y publica el update resultante donde está el equipo.

### Skills

- **Internal Comms** — convierte el contexto crudo de tareas e hilos en un update de status estructurado: qué cambió, qué está bloqueado, quién lo tiene, y qué pasa después, con el tono justo para la audiencia.

## Cómo usarlo

1. Instalá el kit, conectá ClickUp con un token personal de API, y conectá Slack con un bot token con scope a los canales relevantes.
2. Preguntá *"¿qué vence esta semana en mis listas, y qué está frenado sin novedades?"* para chequear ClickUp.
3. Para lo que esté en riesgo, pedile al asistente que saque el hilo de Slack relevante así el contexto es real, no supuesto.
4. Pedile a Internal Comms que convierta el status de la tarea y el contexto del hilo en un update corto: qué cambió, qué está bloqueado, quién lo tiene, qué sigue.
5. Publicá el update en el canal de Slack correspondiente, o creá una tarea de seguimiento en ClickUp para lo que necesite un responsable.

## Por qué estas piezas van juntas

El kit es coherente porque sigue el loop real de operaciones, no un montón de herramientas de productividad sueltas:

- ClickUp guarda **el estado real del trabajo** — qué vence, qué está frenado, quién lo tiene.
- Slack guarda **la conversación detrás del trabajo** — por qué está frenado, qué se discutió ya.
- Internal Comms convierte ambos en **el update que el equipo puede leer de verdad**.

Instaladas por separado, el líder de operaciones chequea un tablero de tareas, scrollea Slack buscando contexto, y escribe el update de memoria. Instaladas juntas, el kit da un solo camino: **chequear qué vence y qué está frenado → sacar el contexto real → escribir el update → compartirlo donde está el equipo**.

Se solapa con Docs & Team Comms en Internal Comms y Slack, pero el propósito es distinto: Docs & Team Comms se apoya en la wiki de Notion para documentación y anuncios; este kit se apoya en el tablero de tareas de ClickUp para el status de ejecución de proyectos del día a día, no para redacción de base de conocimiento.

## Límites

- No maneja deadlines, no reasigna trabajo ni toma decisiones de prioridad por su cuenta — muestra el status y redacta el update; una persona sigue decidiendo y actuando.
- ClickUp y Slack necesitan cada uno su propia conexión de token/app y están sujetos a los permisos y el scope de canales de esas cuentas.
- Las acciones de creación/actualización en ClickUp modifican tareas reales y están frenadas por un paso de confirmación.
- No es una plataforma de gestión de proyectos completa — sin diagramas de Gantt, seguimiento de horas, o asignación de recursos; para eso usá las vistas propias de ClickUp.
- Para documentación y anuncios internos largos apoyados en una wiki de equipo, usá el Kit Docs & Team Comms en su lugar — este kit está acotado al status de tareas/proyectos, no a la redacción de base de conocimiento.
