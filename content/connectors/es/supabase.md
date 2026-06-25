---
name: Supabase
logo: /connectors/supabase.svg
category: database
status: available
simpleTitle: "Que tu IA lea y escriba en tu base de datos"
simpleSubtitle: "Sin darle acceso total — solo las tablas que elegís, con las llaves guardadas seguras."
devTitle: "Supabase MCP Connector"
devSubtitle: "Expose Postgres schemas + RLS-scoped queries to Claude Code."
ctaUrl: "https://supabase.com"
tokenHelpUrl: "https://supabase.com/dashboard/account/tokens"
manifest:
  mcpServers:
    supabase:
      command: npx
      args: ["-y", "@supabase/mcp-server-supabase"]
      env:
        SUPABASE_ACCESS_TOKEN: "${SECRET:SUPABASE_ACCESS_TOKEN}"
affiliate: false
tagline: "Tu Postgres, al alcance del agente"
originalAuthor: "Supabase community"
originalAuthorUrl: "https://github.com/supabase-community"
license: "Apache-2.0"
licenseUrl: "https://github.com/supabase-community/supabase-mcp/blob/main/LICENSE"
---
**Supabase** es la alternativa open-source más popular a Firebase: Postgres administrado, auth, storage, realtime, edge functions — todo bajo un solo panel. Si tu app guarda datos ahí, este conector le da a tu IA acceso seguro y acotado a ese Postgres, sin que vos toques el dashboard.

Le preguntás *"¿cuántos usuarios se registraron la semana pasada?"* y genera la query SQL, la corre y te entrega el número. Le pedís *"exportame los pedidos de marzo a CSV"* y arma el dump. Le pedís *"creame una tabla nueva para tracking de invitaciones"* y prepara el migration SQL para que vos lo apliques.

### Qué le podés pedir

- *"Listame las tablas del schema `public` con sus columnas y tipos — necesito entender la estructura antes de hacer un análisis."*
- *"Cuántos usuarios activos tuvimos en los últimos 30 días, agrupados por país."*
- *"Generá la migration para agregar una columna `subscription_tier` a la tabla `users` con default 'free'."*

### Qué token necesitás

Necesitás un **Personal Access Token (PAT)** de Supabase — distinto al `service_role` o `anon` key de tu proyecto. El PAT te identifica como dueño/colaborador y permite que el agente liste proyectos, lea schemas, ejecute queries.

1. Andá a [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
2. Click "Generate new token". Ponele un nombre tipo "Terminal Sync — Claude".
3. Copialo (solo lo ves una vez) y pegalo cuando el Lab te pida `SUPABASE_ACCESS_TOKEN`. Cifrado en tu Keychain, nunca plaintext en disco.

El alcance del PAT es a nivel de **tu cuenta de Supabase**: el agente puede ver todos los proyectos donde sos owner/member. Si querés alcance más fino (solo un proyecto, solo lectura), pasale al agente instrucciones explícitas — no hay scope granular en el PAT mismo todavía.

Para producción crítica, recomendamos crear un proyecto Supabase aparte como "sandbox del agente", o usar una cuenta dedicada.

--- dev ---

`@supabase/mcp-server-supabase` envuelve la Management API + SQL execution. Tools clave: `list_projects`, `list_tables`, `execute_sql`, `apply_migration`, `get_logs`. El PAT es scope cuenta — no es service_role.

Para queries con RLS, el server ejecuta como `postgres` rol (bypass RLS por default). Si necesitás simular un user específico, hay que usar `set role` dentro del SQL o configurar un PAT más restringido cuando Supabase lo soporte.

Terminal Sync mantiene el PAT en el Keychain via `apiKeyHelper`, sincronizado cifrado con AES-256-GCM entre máquinas. El project URL y anon key (si los necesitás aparte) viven en `~/.claude/claude_desktop_config.json`, también cifrado en transit.

Licencia: Apache-2.0. Fuente: github.com/supabase-community/supabase-mcp.
