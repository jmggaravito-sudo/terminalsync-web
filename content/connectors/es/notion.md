---
name: Notion
logo: /connectors/notion.svg
category: productivity
status: available
simpleTitle: "Dale superpoderes a tu asistente con Notion"
simpleSubtitle: "Para que tu IA lea tus recetas, notas y proyectos sin que copies y pegues."
devTitle: "Notion MCP Connector"
devSubtitle: "Expose Notion databases + pages to Claude Code via the Model Context Protocol."
ctaUrl: "https://www.notion.so"
tokenHelpUrl: "https://www.notion.so/my-integrations"
manifest:
  mcpServers:
    notion:
      command: npx
      args: ["-y", "@notionhq/notion-mcp-server"]
      env:
        NOTION_API_KEY: "${SECRET:NOTION_API_KEY}"
affiliate: false
tagline: "Que tu IA entienda tu workspace"
originalAuthor: "Notion Labs (@makenotion)"
originalAuthorUrl: "https://github.com/makenotion"
license: "MIT"
licenseUrl: "https://github.com/makenotion/notion-mcp-server/blob/main/LICENSE"
---
**Notion** es donde mucha gente guarda años de trabajo: recetas, notas de clientes, decisiones de equipo, links, planes de proyectos, manuales internos. Es la base de conocimiento más completa que tenés — pero hasta hoy, cuando le pedías algo a Claude tenías que copiar y pegar contexto cada vez.

Con este conector, el agente lee tu workspace de Notion directamente (con tu permiso) y te responde con base en **tu** conocimiento. Le preguntás *"¿qué decidimos con el cliente X el mes pasado?"* y va al doc correcto. Le pedís *"creame un brief de reunión basado en mis notas de la semana"* y lo arma desde los blocks reales, no se lo inventa.

### Qué le podés pedir

- *"Leé mi database 'Reuniones 2026' y resumime las 3 decisiones más importantes de marzo."*
- *"Creá una página nueva dentro de 'Recetas' titulada 'Pasta limón' con esta lista de ingredientes y pasos."*
- *"Buscá en mi workspace cualquier mención de 'pricing' y traeme los párrafos relevantes."*

### Qué token necesitás

Necesitás una **Integration de Notion** (Internal Integration), que te genera un token al estilo `secret_xxx`.

1. Andá a [notion.so/my-integrations](https://www.notion.so/my-integrations).
2. Click "+ New integration". Ponele un nombre tipo "Terminal Sync — Claude". Capacities: dejá las defaults (Read content, Update content, Insert content) o ajustá según querés.
3. Guardá y copiá el "Internal Integration Secret".
4. **Importante** — Notion exige que vos compartas explícitamente cada página o database con la integration. Andá a la página/database raíz que querés que el agente vea, abrí el menú "..." → Connections → buscá tu integration → Confirm. Lo que no compartas, no se ve.
5. Pegá el token cuando el Lab te pida `NOTION_API_KEY`. Viaja cifrado en tu Keychain.

Si compartís solo una página padre, el agente accede a todos sus hijos. Si querés alcance limitado, compartí solo databases puntuales.

--- dev ---

`@notionhq/notion-mcp-server` (mantenido oficialmente por Notion Labs) expone databases, pages y blocks como tools sobre la Notion REST API. Tools clave: `notion_search`, `notion_get_page`, `notion_query_database`, `notion_create_page`, `notion_update_block_children`.

El modelo de permisos es opt-in por página: el token de la integration solo accede a páginas/databases compartidas explícitamente desde la UI. No hay scope global a workspace; siempre es per-page tree.

Terminal Sync sincroniza el `claude_desktop_config.json` cifrado entre máquinas. El secret vive en el Keychain via `apiKeyHelper`, nunca plaintext en disco.

Licencia: MIT. Fuente: github.com/makenotion/notion-mcp-server.
