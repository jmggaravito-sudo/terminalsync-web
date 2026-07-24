---
name: Todoist
logo: /connectors/todoist.svg
category: productivity
status: available
simpleTitle: "Tu lista de tareas, manejada por la IA"
simpleSubtitle: "\"¿Qué vence hoy?\" \"Agregá: llamar al contador el viernes\" — tu IA lee y actualiza tu Todoist."
devTitle: "Conector MCP de Todoist"
devSubtitle: "MCP oficial de Doist sobre la Todoist API — tareas, proyectos, secciones, etiquetas, comentarios."
ctaUrl: "https://todoist.com"
tokenHelpUrl: "https://todoist.com/help/articles/find-your-api-token-Jpzx9IIlB"
manifest:
  mcpServers:
    todoist:
      command: npx
      args: ["-y", "@doist/todoist-mcp"]
      env:
        TODOIST_API_KEY: "${SECRET:TODOIST_API_KEY}"
affiliate: false
tagline: "Tareas y seguimientos, sin usar las manos"
originalAuthor: "Doist"
originalAuthorUrl: "https://github.com/Doist/todoist-mcp"
license: "MIT"
licenseUrl: "https://github.com/Doist/todoist-mcp/blob/main/LICENSE"
---
La mitad de llevar un negocio chico es acordarse del próximo paso — devolverle la llamada a este cliente, mandar aquel presupuesto, renovar el seguro. Si eso lo llevás en **Todoist**, este conector deja que tu IA lea tu lista y le agregue, para que nada viva solo en tu cabeza.

Preguntale *"¿qué vence hoy?"* y lee tus tareas. Decile *"agregá: mandar la propuesta a María, vence el viernes, prioridad alta"* y la crea. Preguntale *"¿qué no terminé esta semana?"* y trae las vencidas. Tu lista de tareas se vuelve algo con lo que hablás en vez de una pantalla que te olvidás de abrir.

### Qué le podés pedir

- *"¿Qué tengo en la lista para hoy y mañana?"*
- *"Agregá una tarea: renovar el seguro del local, vence el 30, en el proyecto 'Administración'."*
- *"¿Qué tareas están vencidas? Reprogramalas para la semana que viene."*

### Qué necesitás

Todoist se conecta con un **API token** de tu propia cuenta:

1. Abrí [Todoist → Settings → Integrations → Developer](https://todoist.com/help/articles/find-your-api-token-Jpzx9IIlB) y copiá tu API token.
2. Pegalo cuando el Lab te pida `TODOIST_API_KEY`.

El token queda guardado cifrado en tu Keychain y sincronizado entre tus máquinas.

--- dev ---

`@doist/todoist-mcp` (publicado por **Doist**, los creadores de Todoist — oficial) habla la Todoist API. Cubre toda la superficie de tareas: tareas (crear, obtener, actualizar, cerrar, reabrir, mover), proyectos, secciones, etiquetas y comentarios — lectura y escritura.

La auth es una sola env var `TODOIST_API_KEY` (el API token de tu cuenta, en Settings → Integrations → Developer).

Terminal Sync guarda el token en tu Keychain, sincronizado cifrado entre máquinas con AES-256-GCM.

Licencia: MIT. Fuente: github.com/Doist/todoist-mcp.
