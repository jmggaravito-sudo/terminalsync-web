---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
simpleTitle: "Que tu IA trabaje sobre tus repos"
simpleSubtitle: "Archivos, issues, PRs y búsquedas de código desde el chat — limitado por el token que le des."
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
**GitHub** es la plataforma donde viven tus repos, issues, pull requests y revisiones de código. El server MCP oficial de `@modelcontextprotocol` conecta Claude con la API de GitHub para *"file operations, repository management, search functionality, and more"*, usando siempre los permisos del Personal Access Token que configurás.

Qué hace: permite leer contenido de archivos y directorios, buscar repos/código/issues/usuarios, crear issues, abrir pull requests, comentar, revisar PRs, crear ramas y subir cambios. El README oficial destaca *"Automatic Branch Creation"*, *"Batch Operations"* y *"Advanced Search"* como capacidades centrales.

### Qué le podés pedir

- *"Find where this repo defines the auth middleware and summarize the relevant files."*
- *"Open a draft pull request from `feature/login` into `main` with this title and body."*
- *"List open issues labeled `bug`, sorted by most recently updated, and tell me what needs action."*

### Qué token necesitás

Necesitás un **GitHub Personal Access Token**. El README oficial indica: *"Create a token with the `repo` scope"* y aclara que, si trabajás solo con repos públicos, podés usar `public_repo`.

1. Andá a [github.com/settings/tokens](https://github.com/settings/tokens).
2. Creá un token para los repos exactos que querés usar con Terminal Sync.
3. Para repos privados, incluí `repo`; para repos públicos, preferí `public_repo`.
4. Pegalo cuando el Lab te pida `GITHUB_PERSONAL_ACCESS_TOKEN`. Terminal Sync lo guarda cifrado en tu Keychain.

Dale el mínimo acceso posible: si el agente solo necesita leer, usá un token limitado a esos repos; si va a abrir PRs o escribir archivos, habilitá permisos de escritura solo donde haga falta.

--- dev ---

`@modelcontextprotocol/server-github` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-github` con `GITHUB_PERSONAL_ACCESS_TOKEN` en `env`. Nota de fuente: el README del paquete npm declara que el desarrollo se movió a `github/github-mcp-server`; este catálogo conserva el servidor instalable oficial de Anthropic/modelcontextprotocol para compatibilidad.

Tools verificadas contra el README oficial: `create_or_update_file`, `push_files`, `search_repositories`, `create_repository`, `get_file_contents`, `create_issue`, `create_pull_request`, `fork_repository`, `create_branch`, `list_issues`, `update_issue`, `add_issue_comment`, `search_code`, `search_issues`, `search_users`, `list_commits`, `get_issue`, `get_pull_request`, `list_pull_requests`, `create_pull_request_review`, `merge_pull_request`, `get_pull_request_files`, `get_pull_request_status`, `update_pull_request_branch`, `get_pull_request_comments`, `get_pull_request_reviews`.

Scopes: README oficial pide `repo` para control completo de repos privados, o `public_repo` cuando solo se trabaja con repos públicos. Usar fine-grained PAT o repo allowlist cuando sea posible.

Terminal Sync mantiene el PAT en el Keychain via `apiKeyHelper`, sincronizado cifrado con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-github` en npm.
