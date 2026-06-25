---
name: Notion
logo: /connectors/notion.svg
category: productivity
status: available
simpleTitle: "Dale superpoderes a tu asistente con Notion"
simpleSubtitle: "Para que tu IA lea tus recetas, notas y proyectos sin que copies y pegues."
devTitle: "Notion MCP Connector"
devSubtitle: "Official Notion MCP server: data sources, pages, comments, search, markdown."
ctaUrl: "https://www.notion.so"
tokenHelpUrl: "https://www.notion.so/profile/integrations"
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
**Notion** es donde mucha gente guarda años de trabajo: recetas, notas de clientes, decisiones de equipo, links, planes de proyectos, manuales internos. El conector oficial — mantenido por Notion Labs — implementa un *"MCP server for the Notion API"* y expone 22 tools cubriendo data sources (databases), páginas, comentarios, búsqueda y conversión de contenido a Markdown.

Con este conector, el agente lee tu workspace directamente (con tu permiso) y te responde con base en **tu** conocimiento. Le preguntás *"¿qué decidimos con el cliente X el mes pasado?"* y va al doc correcto. Le pedís *"agregame un comentario en la página de Getting Started"* y lo escribe.

### Qué le podés pedir

- *"Leé mi database 'Reuniones 2026' y resumime las 3 decisiones más importantes de marzo."*
- *"Creá una página nueva dentro de 'Recetas' titulada 'Pasta limón' con esta lista de ingredientes y pasos."*
- *"Buscá en mi workspace cualquier mención de 'pricing' y traeme los párrafos relevantes."*

> **Nota oficial del repo:** *"While we limit the scope of Notion API's exposed (for example, you will not be able to delete databases via MCP), there is a non-zero risk to workspace data by exposing it to LLMs."* Compartí solo lo que necesites que el agente vea.

### Qué token necesitás

Necesitás una **Internal Integration** de Notion, que te genera un token al estilo `secret_xxx`.

1. Andá a [notion.so/profile/integrations](https://www.notion.so/profile/integrations).
2. Click "+ New integration". Ponele un nombre tipo "Terminal Sync — Claude". Capacities: dejá las defaults (Read content, Update content, Insert content) o ajustá según querés.
3. Guardá y copiá el "Internal Integration Secret".
4. **Importante** — Notion exige que vos compartas explícitamente cada página o database con la integration. Dos formas: (a) en la pestaña Access de tu integration elegís páginas/databases; (b) por página, abrís el menú "..." → Connect to integration → buscás la tuya. Lo que no compartas, no se ve.
5. Pegá el token cuando el Lab te pida `NOTION_API_KEY`. Cifrado en tu Keychain.

Si compartís solo una página padre, el agente accede a todos sus hijos. Si querés alcance limitado, compartí solo databases puntuales.

--- dev ---

`@notionhq/notion-mcp-server` (mantenido oficialmente por Notion Labs) expone 22 tools sobre la Notion REST API, agrupadas en: data sources ops (query/retrieve/update/create), page management (create/retrieve/update/move), content-as-markdown (2 tools para token efficiency), search (pages + data sources), comments (add to pages), database metadata.

Modelo de permisos: opt-in por página. El token de la integration solo accede a páginas/databases explícitamente compartidas desde la UI. No hay scope global a workspace; siempre per-page tree. El server limita destructive ops (no hay delete database vía MCP).

Terminal Sync sincroniza el `claude_desktop_config.json` cifrado entre máquinas. El secret vive en el Keychain via `apiKeyHelper`, nunca plaintext en disco.

Licencia: MIT. Fuente: github.com/makenotion/notion-mcp-server.
