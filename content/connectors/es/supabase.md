---
name: Supabase
logo: /connectors/supabase.svg
category: database
status: available
simpleTitle: "Que tu IA lea y escriba en tu base de datos"
simpleSubtitle: "Postgres administrado de Supabase — con modo read-only para producción crítica."
devTitle: "Supabase MCP Connector"
devSubtitle: "Official supabase-community server: SQL, migrations, edge functions, storage."
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
**Supabase** es la alternativa open-source más popular a Firebase: Postgres administrado, auth, storage, realtime, edge functions — todo bajo un solo panel. El conector oficial expone tools en 8 categorías (Account, Database, Knowledge Base, Development, Edge Functions, Debugging, Branching, Storage), permitiendo al agente leer schemas, ejecutar SQL, aplicar migrations, generar tipos TypeScript y desplegar edge functions.

Le preguntás *"¿cuántos usuarios se registraron la semana pasada?"* y genera la query SQL, la corre y te entrega el número. Le pedís *"creame una tabla nueva para tracking de invitaciones"* y prepara el migration SQL — *"SQL passed to this tool will be tracked within the database, so LLMs should use this for DDL operations"*, según el README oficial.

### Qué le podés pedir

- *"Listame las tablas del schema `public` con sus columnas y tipos — necesito entender la estructura antes de hacer un análisis."*
- *"Cuántos usuarios activos tuvimos en los últimos 30 días, agrupados por país."*
- *"Generá la migration para agregar una columna `subscription_tier` a la tabla `users` con default 'free'."*

### Modo read-only (recomendado para producción)

El server soporta un **read-only mode** documentado oficialmente: *"all queries execute as a read-only Postgres user, disabling mutating tools entirely."* Es la forma segura de dejar al agente analizar producción sin riesgo de UPDATEs/DROPs accidentales.

Para activarlo, pasale el flag `--read-only` al server o usá un Postgres role read-only en tu proyecto. Ideal para dashboards, análisis y debugging; activá el modo write solo en proyectos de desarrollo.

### Qué token necesitás

Necesitás un **Personal Access Token (PAT)** de Supabase — el server opera *"under the context of your developer permissions"* via este PAT. Distinto al `service_role` o `anon` key de tu proyecto.

1. Andá a [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
2. Click "Generate new token". Ponele un nombre tipo "Terminal Sync — Claude".
3. Copialo (solo lo ves una vez) y pegalo cuando el Lab te pida `SUPABASE_ACCESS_TOKEN`. Cifrado en tu Keychain.

El alcance del PAT es a nivel de **tu cuenta de Supabase**: el agente puede ver todos los proyectos donde sos owner/member. Para producción crítica, recomendamos crear un proyecto Supabase aparte como "sandbox del agente" o usar una cuenta dedicada.

--- dev ---

`@supabase/mcp-server-supabase` (supabase-community, oficial) expone tools en 8 grupos verificados contra el README: Account (`list_projects`, `create_project`, etc.), Database (`list_tables`, `execute_sql`, `apply_migration`), Knowledge Base (docs search), Development (TS type generation, API key retrieval), Edge Functions (deploy/manage), Debugging (logs, advisory notices), Branching (paid plans), Storage (buckets).

Auth: PAT vía `SUPABASE_ACCESS_TOKEN`, account-scoped. `apply_migration` tracker en la DB para que el LLM lo use en DDL. Flag `--read-only` ejecuta todas las queries como rol Postgres read-only y deshabilita las tools mutantes — usar siempre en prod.

Terminal Sync mantiene el PAT en el Keychain via `apiKeyHelper`, sincronizado cifrado con AES-256-GCM entre máquinas.

Licencia: Apache-2.0. Fuente: github.com/supabase-community/supabase-mcp.
