---
name: GitLab
logo: /connectors/gitlab.svg
category: dev
status: available
simpleTitle: "Tu IA trabaja sobre tus repos de GitLab"
simpleSubtitle: "Issues, merge requests, code search — el mismo workflow que el conector de GitHub, en GitLab."
devTitle: "GitLab MCP Connector"
devSubtitle: "Project Access Token con scope — issues, MRs, files, repos."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab"
affiliate: false
tagline: "Issues y MRs desde tu IA"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
El equivalente de GitLab al conector de GitHub: mismo modelo, mismas acciones, plataforma distinta.

Manejás proyectos, MRs e issues desde tu IA sin salir del chat.

--- dev ---

`@modelcontextprotocol/server-gitlab` requiere `GITLAB_PERSONAL_ACCESS_TOKEN` y opcionalmente `GITLAB_API_URL` para self-hosted. Operaciones: `create_or_update_file`, `search_repositories`, `create_repository`, `get_file_contents`, `push_files`, `create_issue`, `create_merge_request`, `fork_repository`, `create_branch`.

Licencia: MIT.
