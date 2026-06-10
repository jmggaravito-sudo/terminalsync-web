---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
simpleTitle: "Tu IA trabaja sobre tus repos"
simpleSubtitle: "\"Abrime un PR con estos cambios\", \"resumime los últimos 10 issues\" — sin salir del chat."
devTitle: "GitHub MCP Connector"
devSubtitle: "Personal Access Token con scope — issues, PRs, code search, repos, contents."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/github"
affiliate: false
tagline: "Issues, PRs y code search desde tu IA"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
"Abrime un PR con estos cambios, base `main`." Listo. "Decime qué hay pendiente en los issues de este repo." Resumen en segundos. "Buscame el archivo donde definimos el middleware de auth." Localizado.

Lee con los permisos del token que le des — read-only o full access, vos decidís.

--- dev ---

`@modelcontextprotocol/server-github` requiere `GITHUB_PERSONAL_ACCESS_TOKEN`. Operaciones: `create_issue`, `list_issues`, `create_pull_request`, `get_file_contents`, `search_code`, `search_repositories`, `create_or_update_file`, `push_files`. Usá un PAT fine-grained con scope solo sobre los repos que realmente vas a tocar.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/github.
