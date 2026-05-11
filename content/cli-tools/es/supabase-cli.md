---
name: Supabase CLI
binary: supabase
installCommand: brew install supabase/tap/supabase
authCommand: supabase login
vendor: Supabase
homepage: https://supabase.com/docs/guides/cli
repo: https://github.com/supabase/cli
category: database
tagline: Dev local, migraciones y edge functions para tu Supabase.
description: Corré un stack Supabase entero local (Postgres + Auth + Storage + Studio), generá tipos type-safe, mandá migraciones a producción y publicá edge functions — todo desde el terminal. TerminalSync mantiene el workflow y contexto del proyecto cerca de la terminal que usa tu IA.
status: available
---

## Qué hace

`supabase` es el CLI oficial. Levanta un stack completo en Docker (Postgres + GoTrue + Storage + Studio + Realtime), genera tipos TypeScript desde el schema vivo, maneja migraciones como SQL plano en el repo, y publica edge functions. Es la herramienta correcta para cualquier proyecto Supabase serio.

## Qué le suma TerminalSync

- **Workflow de proyecto.** Instalación, login, stack local y comandos de migración quedan pegados al proyecto TerminalSync, así una segunda Mac tiene el mismo runbook aunque todavía autentiques Supabase localmente.
- **Memoria de sesión.** Tu IA recuerda en qué proyecto Supabase estás, cuál fue la última migración, y tu schema de auth/storage — así cuando decís "agregale una RLS" cae en el archivo correcto.
- **Puente MCP.** Combinado con el connector Supabase MCP, tu IA puede consultar tu base de datos viva usando la auth propia del connector.

## Comandos típicos

```bash
supabase init
supabase start
supabase db push                    # aplica migraciones a remoto
supabase gen types typescript --local
supabase functions deploy mi-fn
```
