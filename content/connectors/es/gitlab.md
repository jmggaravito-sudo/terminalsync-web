---
name: GitLab
logo: /connectors/gitlab.svg
category: dev
status: available
simpleTitle: "Que tu IA ayude con tus proyectos de GitLab"
simpleSubtitle: "Leé archivos, prepará issues y armá merge requests sin saltar entre pantallas."
devTitle: "GitLab MCP Connector"
devSubtitle: "Servidor oficial @modelcontextprotocol: proyectos, archivos, issues, merge requests y ramas vía GitLab API."
ctaUrl: "https://gitlab.com"
tokenHelpUrl: "https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
manifest:
  mcpServers:
    gitlab:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-gitlab"]
      env:
        GITLAB_PERSONAL_ACCESS_TOKEN: "${SECRET:GITLAB_PERSONAL_ACCESS_TOKEN}"
        GITLAB_API_URL: "https://gitlab.com/api/v4"
affiliate: false
tagline: "GitLab desde tu IA"
originalAuthor: "GitLab, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-gitlab"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-gitlab"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**GitLab** es una plataforma para guardar código, organizar tareas técnicas y revisar cambios antes de publicarlos. Es donde muchos equipos llevan sus proyectos, issues y merge requests.

Este conector deja que tu IA trabaje con GitLab usando la API oficial: puede buscar proyectos, leer archivos, crear issues, preparar merge requests, crear ramas y subir cambios cuando se lo pedís. El README oficial lo resume como un server para la API de GitLab que permite *"project management, file operations, and more"*.

### Qué le podés pedir

- *"Buscá el repositorio del sitio web y explicame qué archivos parecen controlar la página de precios."*
- *"Creá un issue para revisar el flujo de onboarding, con estos pasos y etiquetas."*
- *"Prepará una rama y un merge request con este cambio de copy en el README."*

### Qué token necesitás

Necesitás un **Personal Access Token de GitLab**. Lo creás desde tu perfil de GitLab; el README oficial indica ir a **User Settings > Access Tokens** y elegir los permisos que correspondan.

1. Abrí la guía oficial de GitLab para crear tokens personales: `https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html`.
2. Creá un token nuevo para Terminal Sync, con una fecha de vencimiento razonable.
3. Elegí permisos según el uso: `read_api` para mirar información, `read_repository` para leer repos, `write_repository` si querés que pueda subir cambios y `api` si necesitás acceso completo a la API.
4. Pegá el token cuando el Lab te pida `GITLAB_PERSONAL_ACCESS_TOKEN`. Terminal Sync lo guarda cifrado en tu Keychain.
5. Si usás GitLab self-managed, cambiá `GITLAB_API_URL` por la URL de tu instancia, por ejemplo `https://gitlab.tuempresa.com/api/v4`.

Para empezar seguro, usá el token con los permisos mínimos y ampliá solo cuando necesites que la IA escriba cambios.

--- dev ---

`@modelcontextprotocol/server-gitlab` es un paquete oficial publicado por `GitLab, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-gitlab` con `GITLAB_PERSONAL_ACCESS_TOKEN` en `env`; `GITLAB_API_URL` es opcional y por defecto apunta a `https://gitlab.com/api/v4`.

Tools verificadas contra README y bundle npm: `create_or_update_file`, `push_files`, `search_repositories`, `create_repository`, `get_file_contents`, `create_issue`, `create_merge_request`, `fork_repository`, `create_branch`.

Scopes documentados por el README oficial: `api` para full API access, `read_api` para read-only access, `read_repository` y `write_repository` para operaciones de repositorio. Gotcha: aunque el README muestra Docker y NPX, el gate del catálogo usa NPX porque el paquete existe en npm y arranca por stdio sin crashear.

Terminal Sync guarda `GITLAB_PERSONAL_ACCESS_TOKEN` en el Keychain via `apiKeyHelper`, sincronizado cifrado con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-gitlab` en npm.
