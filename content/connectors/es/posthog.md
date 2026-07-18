---
name: PostHog
logo: /connectors/posthog.svg
category: dev
status: available
simpleTitle: "Preguntale a tu analítica de producto en lenguaje natural"
simpleSubtitle: "Server oficial de PostHog: feature flags, insights, experimentos y error tracking."
devTitle: "PostHog MCP Connector"
devSubtitle: "Official hosted PostHog MCP: tools over your PostHog project, personal-API-key scoped."
ctaUrl: "https://posthog.com"
tokenHelpUrl: "https://app.posthog.com/settings/user-api-keys?preset=mcp_server"
manifest:
  mcpServers:
    posthog:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.posthog.com/mcp", "--header", "Authorization:${POSTHOG_AUTH_HEADER}"]
      env:
        POSTHOG_AUTH_HEADER: "Bearer ${SECRET:POSTHOG_API_KEY}"
affiliate: false
tagline: "Tu analítica de producto, al alcance del agente"
originalAuthor: "PostHog"
originalAuthorUrl: "https://github.com/PostHog/mcp"
license: "MIT"
licenseUrl: "https://github.com/PostHog/mcp/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**PostHog** es la plataforma de analítica de producto que tu equipo usa para ver cómo la gente usa tu app de verdad: eventos y funnels, feature flags, experimentos A/B, dashboards y error tracking, todo en un solo lugar. El conector oficial, publicado por PostHog, es un **server MCP hosteado** (`https://mcp.posthog.com/mcp`) que funciona como proxy hacia tu instancia de PostHog — convierte lo que pedís en llamadas contra tu proyecto y te devuelve los resultados directo al cliente de IA.

Le preguntás *"¿Cuántos usuarios únicos se registraron en los últimos 7 días, desglosado por día?"* y la tool `query-run` corre una consulta de trends y te responde con los conteos diarios. Le decís *"Creá un feature flag llamado 'new-checkout-flow' habilitado para el 20% de los usuarios"* y lo crea y te muestra la configuración. Habla con PostHog usando tu clave de API personal, así que puede hacer lo que esa clave tenga permitido en tu cuenta.

### Qué le podés pedir

- *"Creá un feature flag llamado 'new-checkout-flow' habilitado para el 20% de los usuarios, y mostrame la configuración."*
- *"¿Cuántos usuarios únicos se registraron en los últimos 7 días, desglosado por día?"*
- *"Creá un test A/B para nuestra página de precios que mida la conversión a la página de checkout."*
- *"¿Cuáles son los 5 errores principales de mi proyecto esta semana y a cuántos usuarios afectan?"*

Para consultas más simples podés usar prompts más cortos, directo del README: *"¿Qué feature flags tengo activos?"*, *"Mostrame mis costos de LLM de esta semana"*, *"Listá mis dashboards"*, *"¿Qué eventos se están trackeando?"*

### Qué token necesitás

Necesitás una **clave de API personal de PostHog** — la que permite que un software actúe sobre tu cuenta de PostHog.

1. Entrá a PostHog y abrí la [configuración de claves de API personales con el preset MCP Server](https://app.posthog.com/settings/user-api-keys?preset=mcp_server).
2. Creá la clave con ese preset — que ya define los scopes que el server MCP necesita — y copiala.
3. Pegala cuando el Lab te pida `POSTHOG_API_KEY`. Se guarda cifrada en tu Keychain y se inyecta como el header `Authorization: Bearer` (`POSTHOG_AUTH_HEADER`) que el server espera.

**Aclaración honesta, directo de los docs de PostHog:** este es un **server hosteado/remoto**, no uno local — corre en los clusters de Kubernetes de PostHog en US y EU y guarda el estado de sesión (tu proyecto/organización activa) en la región a la que te conectás, cacheado temporalmente y con clave el hash de tu API key. Delante hay un Cloudflare Worker stateless que solo autentica los requests y los rutea a tu región de cloud; *"no almacena ningún dato sensible."* El server *"funciona como proxy hacia tu instancia de PostHog. No almacena tus datos de analítica — todas las consultas se ejecutan contra tu proyecto de PostHog y los resultados se devuelven directo a tu cliente de IA."* Lo que el agente puede leer o cambiar está acotado por los scopes de tu clave de API personal. Los usuarios de EU deberían usar el endpoint `mcp-eu.posthog.com` para que los flujos de OAuth ruteen a la instancia de EU.

--- dev ---

PostHog ofrece el MCP como un **server remoto/hosteado** en `https://mcp.posthog.com/mcp` (repo `PostHog/mcp`; el server en sí ahora vive en el monorepo de PostHog bajo `services/mcp`). El README **no documenta ningún comando stdio local `@posthog/mcp`** — te conectás a la URL hosteada, y localmente hacés de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.posthog.com/mcp --header "Authorization:${POSTHOG_AUTH_HEADER}"
```

La auth es una clave de API **personal** de PostHog pasada como Bearer token en el header `Authorization`. En el README la clave va en la env var `POSTHOG_AUTH_HEADER` como `Bearer {INSERT_YOUR_PERSONAL_API_KEY_HERE}`; el manifest de acá inyecta la clave desde Keychain como `${SECRET:POSTHOG_API_KEY}` dentro de ese mismo header `Bearer …`. PostHog además ofrece un instalador automático para Cursor, Claude, Claude Code, VS Code y Zed vía `npx @posthog/wizard@latest mcp add`.

**Server mode (`cli` vs `tools`).** El server puede registrar cada tool de PostHog por separado (modo **tools**) o envolverlas todas detrás de una única tool tipo CLI llamada `posthog` (modo **cli**). Según el README, *"cli is the default for all clients"* (solo auto-selecciona el modo tools para una allow-list corta — Cursor y ChatGPT). Podés fijarlo con `?mode=cli` / `?mode=tools` o el header `x-posthog-mcp-mode`.

**Las capacidades se agrupan en features** (de la tabla de feature-filtering del README — podés limitar qué se expone vía `?features=…`):

| Feature                  | Descripción                                      |
| ------------------------ | ------------------------------------------------ |
| `workspace`              | Organization and project management              |
| `actions`                | Action definitions                               |
| `activity_logs`          | Activity log viewing                             |
| `alerts`                 | Alert management                                 |
| `annotations`            | Annotation management                            |
| `cohorts`                | Cohort management                                |
| `dashboards`             | Dashboard creation and management                |
| `data_schema`            | Data schema exploration                          |
| `data_warehouse`         | Data warehouse management                        |
| `debug`                  | Debug and diagnostic tools                       |
| `docs`                   | PostHog documentation search                     |
| `early_access_features`  | Early access feature management                  |
| `error_tracking`         | Error monitoring and debugging                   |
| `events`                 | Event and property definitions                   |
| `experiments`            | A/B testing experiments                          |
| `flags`                  | Feature flag management                          |
| `hog_functions`          | CDP function management                          |
| `hog_function_templates` | CDP function template browsing                   |
| `insights`               | Analytics insights                               |
| `llm_analytics`          | AI observability evaluations                     |
| `prompts`                | LLM prompt management                            |
| `logs`                   | Log querying                                     |
| `notebooks`              | Notebook management                              |
| `persons`                | Person and group management                      |
| `reverse_proxy`          | Reverse proxy record management                  |
| `search`                 | Entity search across the project                 |
| `sql`                    | SQL query execution                              |
| `surveys`                | Survey management                                |
| `workflows`              | Workflow management                              |

Los guiones y guiones bajos se tratan como equivalentes en los nombres de feature (`error-tracking` == `error_tracking`). El README **no** publica una lista plana completa de tools inline — apunta a `schema/tool-definitions-all.json` y a la [documentación](https://posthog.com/docs/model-context-protocol) — pero los ejemplos trabajados nombran tools individuales verbatim: `create-feature-flag`, `query-run`, `experiment-create`, `query-error-tracking-issues-list`, y el ejemplo de tool-filtering lista `dashboard-get`, `feature-flag-get-all`, `execute-sql`. Podés allowlistear nombres exactos con `?tools=dashboard-get,feature-flag-get-all,execute-sql`; cuando das `features` y `tools` juntos se combinan como **unión**.

**PostHog self-hosted:** seteá `POSTHOG_API_BASE_URL` (ej. `https://posthog.example.com`) al correr el server contra tu propia instancia.

**Manejo de datos, en las palabras de PostHog:** *"The MCP server acts as a proxy to your PostHog instance. It does not store your analytics data — all queries are executed against your PostHog project and results are returned directly to your AI client. Session state (active project/organization) is cached temporarily, keyed by your API key hash."*

Terminal Sync mantiene la clave de API en Keychain vía `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT (Copyright (c) 2025 PostHog). Fuente: github.com/PostHog/mcp. Docs: posthog.com/docs/model-context-protocol.
