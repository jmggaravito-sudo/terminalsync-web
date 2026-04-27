---
name: Supabase
logo: /connectors/supabase.svg
category: database
status: available
simpleTitle: "Que tu IA lea y escriba en tu base de datos"
simpleSubtitle: "Sin darle acceso total — solo las tablas que elegís, con las llaves guardadas seguras."
devTitle: "Supabase MCP Connector"
devSubtitle: "Expose Postgres schemas + RLS-scoped queries to Claude Code."
ctaUrl: "https://supabase.com/partners/REPLACE_WITH_JUANS_SUPABASE_AFFILIATE"
manifest:
  mcpServers:
    supabase:
      command: npx
      args: ["-y", "@supabase/mcp-server-supabase"]
      env:
        SUPABASE_ACCESS_TOKEN: "${SECRET:SUPABASE_ACCESS_TOKEN}"
affiliate: true
tagline: "Tu Postgres, al alcance del agente"
---

Si tu app guarda datos en Supabase, ahora podés pedirle a Claude cosas como *"¿cuántos usuarios se registraron la semana pasada?"* o *"exportame los pedidos de marzo a CSV"* — y él genera la consulta, la ejecuta, y te da la respuesta.

Con permisos granulares: vos elegís qué tablas puede ver el agente, qué operaciones puede hacer (solo lectura vs escritura). Nunca le das el `service_role` completo a menos que quieras.

Terminal Sync sincroniza la config entre tus equipos cifrada, así que el acceso viaja sin pegar credenciales en archivos.

--- dev ---

Supabase's MCP server wraps the REST/PostgREST API with RLS-aware tool definitions. Claude Code gets schema introspection + parameterized queries without ever seeing the service_role key — it uses a scoped anon/auth token you provision.

Terminal Sync keeps your `claude_desktop_config.json` in sync across machines. The connector URL + anon key live in your `~/.claude` folder, which Terminal Sync encrypts with AES-256-GCM before pushing to Drive. The service_role stays in your OS Keychain via `apiKeyHelper` — never plaintext on disk.

**Best for**: analytics queries, admin dashboards, AI agents that need to read-own-write-approved data. Not for: giving the model unscoped write access to production.
