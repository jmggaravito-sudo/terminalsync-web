---
name: ClickUp
logo: /connectors/clickup.svg
category: productivity
status: available
simpleTitle: "Tus proyectos, manejados por conversación"
simpleSubtitle: "\"¿Qué vence esta semana?\" \"Creá una tarea para el cliente nuevo\" — tu IA lee y actualiza ClickUp."
devTitle: "Conector MCP de ClickUp"
devSubtitle: "MCP sobre la ClickUp API — workspaces, spaces, listas, tareas, docs, comentarios."
ctaUrl: "https://clickup.com"
tokenHelpUrl: "https://app.clickup.com/settings/apps"
manifest:
  mcpServers:
    clickup:
      command: npx
      args: ["-y", "clickup-mcp-server"]
      env:
        CLICKUP_API_TOKEN: "${SECRET:CLICKUP_API_TOKEN}"
affiliate: false
tagline: "Tareas y proyectos al alcance de la IA"
originalAuthor: "David Whatley"
originalAuthorUrl: "https://github.com/nsxdavid/clickup-mcp-server"
license: "MIT"
licenseUrl: "https://github.com/nsxdavid/clickup-mcp-server/blob/main/LICENSE"
---
Si tu equipo lleva el trabajo en **ClickUp** — las listas, las tareas, el quién-hace-qué — este conector deja que tu IA lo lea y lo mantenga en movimiento, para que preguntes por tus proyectos en vez de andar clickeando entre ellos.

Preguntale *"¿qué vence esta semana en todas mis listas?"* y lee tus tareas. Decile *"creá una tarea en la lista 'Onboarding' para el cliente nuevo, vence el lunes"* y la agrega. Preguntale *"¿qué está trabado sin novedades?"* y las encuentra. Tu tablero de proyectos se vuelve algo con lo que simplemente hablás.

### Qué le podés pedir

- *"¿Qué tareas vencen esta semana y a quién están asignadas?"*
- *"Creá una tarea en 'Ventas': seguir la propuesta de León, vence el jueves."*
- *"Listame los spaces y las listas de mi workspace así sé dónde está cada cosa."*

### Qué necesitás

ClickUp se conecta con un **API token** de tu propia cuenta:

1. Abrí [ClickUp → Settings → Apps](https://app.clickup.com/settings/apps) y generá un token personal (empieza con `pk_`).
2. Pegalo cuando el Lab te pida `CLICKUP_API_TOKEN`.

El token queda guardado cifrado en tu Keychain y sincronizado entre tus máquinas.

--- dev ---

`clickup-mcp-server` (David Whatley / @nsxdavid) habla la ClickUp API. Tools verificadas contra el README: `get_workspaces`, `get_spaces`, `get_lists`, `get_tasks`, `get_docs_from_workspace`, `create_folder`, `create_list`, `create_task`, `update_task` — lectura y escritura sobre workspaces, spaces, folders, listas, tareas, docs, comentarios y checklists.

La auth es una sola env var `CLICKUP_API_TOKEN` (un token personal de ClickUp, `pk_…`, en Settings → Apps).

Terminal Sync guarda el token en tu Keychain, sincronizado cifrado entre máquinas con AES-256-GCM. Como los tools de create/update mutan tareas reales, el escritorio los pasa por un paso de confirmación.

Licencia: MIT. Fuente: github.com/nsxdavid/clickup-mcp-server.
