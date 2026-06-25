---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
simpleTitle: "Que tu IA trabaje sobre tus repos"
simpleSubtitle: "Leé archivos, abrí pull requests, buscá en issues — desde el chat, con los permisos que vos elijas."
devTitle: "GitHub MCP Connector"
devSubtitle: "Servidor oficial @modelcontextprotocol: repos, files, issues, PRs, reviews y búsqueda."
ctaUrl: "https://github.com"
tokenHelpUrl: "https://github.com/settings/tokens"
manifest:
  mcpServers:
    github:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-github"]
      env:
        GITHUB_PERSONAL_ACCESS_TOKEN: "${SECRET:GITHUB_PERSONAL_ACCESS_TOKEN}"
affiliate: false
tagline: "Repos, issues y PRs al alcance del agente"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-github"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-github"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
**GitHub** es donde viven el código y las conversaciones técnicas de cualquier proyecto de software: los archivos del repo, las tareas pendientes (issues), las propuestas de cambio (pull requests) y las discusiones del equipo. Es la plataforma estándar para guardar y revisar código.

Este conector deja que tu IA trabaje contra GitHub directamente: leer archivos, contestar preguntas sobre el código, abrir tareas nuevas, proponer cambios — todo con los permisos que vos le des en el token. En palabras del README oficial, el server cubre *"file operations, repository management, search functionality, and more"*. Si el token solo permite leer, la IA solo lee; si autorizás escribir, puede abrir PRs y comentar.

### Qué le podés pedir

- *"Buscá en este repo dónde está definida la lógica de login y resumime los archivos relevantes."*
- *"Abrí un pull request en borrador desde la rama `feature/login` hacia `main`, con este título y descripción."*
- *"Listame los issues abiertos con la etiqueta `bug`, ordenados por los más recientes, y decime cuáles parecen urgentes."*

### Qué token necesitás

Necesitás un **GitHub Personal Access Token** — una clave que GitHub genera para identificarte y delimitar qué puede hacer la IA en tu nombre. El README oficial pide *"Create a token with the `repo` scope"* para repos privados, o `public_repo` si solo trabajás con repos públicos.

1. Andá a [github.com/settings/tokens](https://github.com/settings/tokens) (estando logueado en GitHub).
2. **Creá un token nuevo** y elegí los repos exactos a los que querés darle acceso (GitHub te deja seleccionar uno por uno con los "fine-grained tokens").
3. **Para repos privados**: marcá el scope `repo`. **Para repos públicos**: alcanza con `public_repo`.
4. Pegá el token cuando el Lab te pida `GITHUB_PERSONAL_ACCESS_TOKEN`. Terminal Sync lo guarda cifrado en tu Keychain — nunca queda en texto plano.

Buena práctica: **dale el mínimo acceso posible**. Si solo querés que la IA lea y conteste preguntas, no le des permisos de escritura. Si más adelante querés que abra PRs, generás otro token con permisos extra para esos repos puntuales.

--- dev ---

`@modelcontextprotocol/server-github` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-github` con `GITHUB_PERSONAL_ACCESS_TOKEN` en `env`. Nota de fuente: el README del paquete npm declara que el desarrollo se movió a `github/github-mcp-server`; este catálogo conserva el servidor instalable oficial de Anthropic/modelcontextprotocol para compatibilidad.

Tools verificadas contra el README oficial: `create_or_update_file`, `push_files`, `search_repositories`, `create_repository`, `get_file_contents`, `create_issue`, `create_pull_request`, `fork_repository`, `create_branch`, `list_issues`, `update_issue`, `add_issue_comment`, `search_code`, `search_issues`, `search_users`, `list_commits`, `get_issue`, `get_pull_request`, `list_pull_requests`, `create_pull_request_review`, `merge_pull_request`, `get_pull_request_files`, `get_pull_request_status`, `update_pull_request_branch`, `get_pull_request_comments`, `get_pull_request_reviews`.

Scopes: README oficial pide `repo` para control completo de repos privados, o `public_repo` cuando solo se trabaja con repos públicos. Usar fine-grained PAT o repo allowlist cuando sea posible.

Terminal Sync mantiene el PAT en el Keychain via `apiKeyHelper`, sincronizado cifrado con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-github` en npm.
