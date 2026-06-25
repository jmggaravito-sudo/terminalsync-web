# Connector Content — Official Sources

> **Para el Loop:** todo conector instalable nuevo se redacta a partir de su fuente oficial, NO de memoria. Estos 8 son el molde de oro definitivo aprobado para el catálogo (en + es, paridad estricta).

## Fuentes principales

| Capa | URL | Para qué |
|---|---|---|
| **Anthropic Connectors Directory** | https://claude.ai/directory | Descripción curada, casos de uso, capacidades read/write. Requiere auth pero la página de cada conector es la fuente más vetada. |
| **Anthropic Connectors blog** | https://claude.com/blog/connectors-directory | Anuncio oficial con use cases ejemplares por conector. |
| **Anthropic Partners MCP** | https://claude.com/partners/mcp | Listado público de partners con descripciones cortas oficiales. |
| **MCP Registry** | https://registry.modelcontextprotocol.io | Source of truth técnico (manifest, command, args, env). |
| **Repos de los servers MCP** | github.com del autor de cada server | README oficial — tools verbatim, scopes requeridos, ejemplos canónicos. |

## Fuentes específicas por conector (verificadas 2026-06-25)

| Conector | Fuente principal | Fuente técnica |
|---|---|---|
| **sentry** | github.com/getsentry/sentry-mcp (README) | Mismo — describe "human-in-the-loop coding agents", scopes completos, requisito de LLM provider para search_*. |
| **filesystem** | github.com/modelcontextprotocol/servers/tree/main/src/filesystem (README) | Mismo — 14 tools enumeradas, sección "Path Configuration Approach" con CLI args + MCP Roots protocol. |
| **memory** | github.com/modelcontextprotocol/servers/tree/main/src/memory (README) | Mismo — modelo entities/relations/observations, 9 tools, system prompt de "chat personalization". |
| **sequential-thinking** | github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking (README) | Mismo — 3 ejemplos canónicos (PG14→16 migration, prod-only deploy debug, file sync architecture). |
| **webflow** | developers.webflow.com/data/v2.0.0/docs/ai-tools | npm `webflow-mcp-server` — separa Designer API (canvas) y Data API (CMS); OAuth recomendado, token local soportado. |
| **airtable** | claude.com/partners/mcp (descripción: *"Bring your structured data to Claude"*) | github.com/domdomegg/airtable-mcp-server — scopes requeridos vs opcionales explícitos, URL /create/tokens/new. |
| **notion** | github.com/makenotion/notion-mcp-server (README oficial) | Mismo — 22 tools en 6 grupos, URL canónica notion.so/profile/integrations, warning del propio repo sobre risk to workspace data. |
| **supabase** | github.com/supabase-community/supabase-mcp (README) | Mismo — 8 grupos de tools, modo `--read-only` documentado como feature de seguridad, PAT account-scoped. |
| **github** | npm `@modelcontextprotocol/server-github` README oficial (tarball 2025.4.8) | npm package metadata + README — Anthropic, PBC; `GITHUB_PERSONAL_ACCESS_TOKEN`; 26 tools; scopes `repo` / `public_repo`; nota de deprecación hacia `github/github-mcp-server`. |
| **slack** | npm `@modelcontextprotocol/server-slack` README oficial (tarball 2025.4.25) | npm package metadata + README — Anthropic, PBC; `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`; scopes Slack verbatim; 8 tools. |
| **postgres** | npm `@modelcontextprotocol/server-postgres` README oficial (tarball 0.6.2) | npm package metadata + README — Anthropic, PBC; URL Postgres posicional; tool `query`; READ ONLY transaction; schema resources. |

## Estructura del molde de oro (verificada en estos 8)

```
---
frontmatter con: name, logo, category, status, simpleTitle, simpleSubtitle,
                 devTitle, devSubtitle, ctaUrl (sitio oficial, NO afiliado),
                 tokenHelpUrl (si requiere token), manifest, affiliate: false,
                 tagline, originalAuthor, originalAuthorUrl, license, licenseUrl,
                 marketplaceSource, marketplaceCategory
---

**Nombre** + qué ES el servicio (1 párrafo) — cita verbatim del README/directorio oficial cuando ayude.

Qué HACE el conector (1 párrafo) — capabilities tomadas de la lista oficial de tools, no inventadas.

### Qué le podés pedir / What you can ask

- *"ejemplo 1"* — usar los oficiales del README si existen.
- *"ejemplo 2"*
- *"ejemplo 3"*

### Qué token necesitás / What token you need  (omitir si no requiere)

Paso a paso con la URL real de generación, scopes requeridos vs opcionales,
y nota de seguridad sobre Keychain.

--- dev ---

Sección técnica: paquete, env vars, lista de tools verbatim, scopes, gotchas.
Cerrar con licencia + fuente.
```

## Reglas para el Loop

1. **NO redactar de memoria.** Siempre WebFetch al README oficial / página del directorio antes de escribir.
2. **Citar verbatim cuando sea valioso** — descripciones cortas oficiales y use cases canónicos van entre asteriscos en cursiva.
3. **Scopes y permisos** se sacan del README oficial. Si el oficial dice "required X + Y, optional Z, W", reproducir esa estructura — no inventar combinaciones.
4. **URLs de tokenHelpUrl** se verifican navegando hasta el form de creación del token. NO inventar paths.
5. **Sin afiliados.** `affiliate: false` siempre; `ctaUrl` al sitio oficial real, sin query params de tracking ni placeholders de ejemplo.
6. **Paridad es+en estricta.** Mismo número de ejemplos, mismas secciones, misma estructura.
7. **Ejemplos de "Qué le podés pedir / What you can ask"** van en el **idioma del archivo** (español en `/es/`, inglés en `/en/`). Cuando la fuente oficial trae ejemplos en inglés, se usan como inspiración pero se **traducen y se adaptan a lenguaje natural para no-técnicos** — sin jerga SQL/CLI/API si la primera mitad del documento es para audiencia general. Lo que sí se cita **verbatim en su idioma original** son **frases técnicas cortas** del README/docs oficiales que aportan precisión, integradas en una oración en el idioma del archivo. Ejemplo aceptable en un `/es/`: *"El server lo garantiza por diseño: en sus palabras, 'All queries are executed within a READ ONLY transaction'."*
8. **Tono por sección.** La parte simple (qué es / qué hace / ejemplos / qué token o configurar) tiene que entenderla **alguien sin background técnico**. Sustituí jerga: *introspección de schema* → "ver cómo está armada la base"; *read-only transaction* → "modo solo-lectura"; *defensa en profundidad* → "cerrar dos puertas en vez de una"; *fine-grained PAT* → "token con permisos exactos por repo"; *RLS-scoped* → "limitado por permisos del rol". La sección `--- dev ---` puede usar todo el vocabulario técnico que haga falta — esa parte sí es para devs.

## Dónde está cada cosa en este repo

- `content/connectors/es/<slug>.md` — versión en español
- `content/connectors/en/<slug>.md` — versión en inglés
- `src/lib/connectors.ts` — loader + tipo, expone `description` (markdown completo) y `tokenHelpUrl` al catálogo.
- `terminal-sync` Lab → `PowerUpDetailPanel.tsx` renderiza el panel con `DescriptionBlock` (split por `--- dev ---`) + `TokenSection` (gated por `hasManifest && requiresEnvSecrets`).
