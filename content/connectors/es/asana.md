---
name: Asana
logo: /connectors/asana.svg
category: productivity
status: available
simpleTitle: "Tus proyectos y tareas, en lenguaje natural"
simpleSubtitle: "Server oficial de Asana: buscá, actualizá y creá trabajo en tu workspace por OAuth."
devTitle: "Conector MCP de Asana (V2)"
devSubtitle: "MCP oficial hospedado de Asana (mcp.asana.com/v2) — lectura/escritura del Work Graph por OAuth."
ctaUrl: "https://asana.com"
tokenHelpUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
manifest:
  mcpServers:
    asana:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.asana.com/v2/mcp"]
affiliate: false
tagline: "Tus proyectos, al alcance del agente"
originalAuthor: "Asana"
originalAuthorUrl: "https://developers.asana.com/docs/mcp-server"
license: "proprietary"
licenseUrl: "https://asana.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Asana** es donde los equipos llevan proyectos, tareas y quién hace qué y para cuándo. El conector oficial de Asana es un **server MCP hospedado** (`https://mcp.asana.com/v2/mcp`), publicado por Asana, que le da a tu agente acceso directo a tu **Work Graph** —proyectos, tareas, portfolios y la gente de tu equipo— usando tu propia cuenta de Asana.

Preguntale *"¿Qué está atrasado en el proyecto de lanzamiento?"* y busca entre tus tareas y proyectos para encontrar lo que se está retrasando. Decile *"Creá una tarea para el reporte de Q3, asignámela a mí y agregá un comentario con el esquema"* y crea la tarea, pone el asignado y publica el comentario. Sirve para encontrar el estado rápido y sacarte de encima la administración rutinaria del proyecto.

### Qué le podés pedir

- *"¿Qué está atrasado en el proyecto de lanzamiento y quién es responsable de cada ítem?"*
- *"Creá una tarea llamada 'Enviar el reporte de Q3 a la junta' en el proyecto de Finanzas y asignámela a mí."*
- *"Dame un resumen de estado de todos mis proyectos activos."*
- *"Agregá un comentario a la tarea de onboarding diciendo que el diseño está aprobado."*

### Cómo conectás

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Asana:

1. Activá el conector en TerminalSync.
2. El puente `mcp-remote` abre el flujo de OAuth de Asana en tu navegador.
3. Iniciá sesión y autorizá el acceso. La propia guía de Asana aclara que las apps MCP no requieren elegir scopes — el acceso lo definen lo que tu cuenta y tu rol ya pueden ver y hacer.

**Aclaración honesta:** es un **server hospedado por Asana** (`https://mcp.asana.com/v2/mcp`), no algo que corre en tu computadora. Lo que el agente puede ver o cambiar queda acotado por los permisos de tu cuenta de Asana y, en planes Enterprise+, por las reglas de acceso de apps que haya configurado tu admin.

--- dev ---

Asana publica su server MCP como un **server V2 remoto/hospedado** en `https://mcp.asana.com/v2/mcp` (transporte Streamable HTTP), documentado en `developers.asana.com/docs/mcp-server` y `developers.asana.com/docs/using-asanas-mcp-server`. El endpoint V1 Beta anterior (`https://mcp.asana.com/sse`) está deprecado, con apagado programado para el 2026-11-05. No hay comando stdio local: te conectás a la URL hospedada y localmente hacés de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.asana.com/v2/mcp
```

La auth es **OAuth**: creás una "MCP app" en la [consola de desarrolladores de Asana](https://app.asana.com/0/my-apps) para obtener client ID/secret y redirect URL, y luego `mcp-remote` abre el navegador para el login del usuario. Según la doc oficial, *"MCP apps don't require scopes — remove the `scope` parameter"* del pedido de autorización; el acceso lo gobierna directamente los permisos del usuario autenticado en el/los workspace(s) donde la app está distribuida.

Tools verificadas contra `developers.asana.com/docs/mcp-tools-reference`:

- **Lectura**: `search_objects` (búsqueda universal), `get_task`, `get_tasks`, `get_my_tasks`, `search_tasks` (texto completo + filtros complejos), `get_project`, `get_projects`, `get_portfolio`, `get_portfolios`, `get_items_for_portfolio`, `get_status_overview`, `get_attachments`, `get_user`, `get_me`, `get_users`, `get_teams`, `get_agent`, `get_workspace_agents`.
- **Escritura**: `create_tasks` (crea de inmediato, sin confirmación, según la doc), `create_project`, `update_tasks`, `delete_task`, `add_comment`, `create_project_status_update`.
- **Interactivas/preview**: `create_task_preview`, `create_project_preview`, `search_tasks_preview` — muestran una vista previa en la UI antes de que la escritura ocurra.

Como `create_tasks`/`update_tasks`/`delete_task` mutan datos reales del workspace sin preview interactivo por defecto, TerminalSync pasa las tools de escritura por un paso de confirmación.

Las orgs Enterprise+ y Legacy Enterprise además pueden gobernar qué apps MCP están permitidas por cliente desde la consola de gestión de apps de Asana.

Licencia: términos SaaS propietarios (Asana User Terms of Service). Fuente: developers.asana.com/docs/mcp-server.
