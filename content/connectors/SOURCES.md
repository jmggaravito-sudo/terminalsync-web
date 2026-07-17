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
| **gitlab** | npm `@modelcontextprotocol/server-gitlab` README oficial (tarball 2025.4.25) | npm package metadata + README — Anthropic, PBC; `GITLAB_PERSONAL_ACCESS_TOKEN`; `GITLAB_API_URL` opcional; 9 tools; scopes `api` / `read_api` / `read_repository` / `write_repository`. |
| **google-maps** | npm `@modelcontextprotocol/server-google-maps` README oficial (tarball 0.6.2) | npm package metadata + README — Anthropic, PBC; `GOOGLE_MAPS_API_KEY`; 7 tools; geocoding, places, distance matrix, elevation, directions. |
| **brave-search** | npm `@modelcontextprotocol/server-brave-search` README oficial (tarball 0.6.2) | npm package metadata + README — Anthropic, PBC; `BRAVE_API_KEY`; `brave_web_search`; `brave_local_search`; free tier mencionado por README. |
| **puppeteer** | npm `@modelcontextprotocol/server-puppeteer` README oficial (tarball 2025.5.12) | npm package metadata + README — Anthropic, PBC; sin secrets; browser automation, screenshots, console logs, resources. |
| **pdf** | npm `@modelcontextprotocol/server-pdf` README oficial (tarball 1.7.4) | npm package metadata + README — publisher `ochafik-ant <ochafik@anthropic.com>`; maintainers Anthropic/modelcontextprotocol; sin secrets; tools `list_pdfs`, `display_pdf`, `interact`, `read_pdf_bytes`, `save_pdf`; client roots + save gates documentados. |
| **map** | npm `@modelcontextprotocol/server-map` README oficial (tarball 1.7.4) | npm package metadata + README — publisher `ochafik-ant <ochafik@anthropic.com>`; maintainers Anthropic/modelcontextprotocol; sin secrets; tools `geocode`, `show-map`; CesiumJS + OSM tiles + Nominatim rate limit. |
| **threejs** | npm `@modelcontextprotocol/server-threejs` README oficial (tarball 1.7.4) | npm package metadata + README — publisher `ochafik-ant <ochafik@anthropic.com>`; maintainers Anthropic/modelcontextprotocol; sin secrets; tools `show_threejs_scene`, `learn_threejs`; preview streaming + globals Three.js documentados. |
| **time** | SKIP 2026-06-25 | Gate duro falló: `@modelcontextprotocol/server-time` no existe en npm (E404), por lo tanto no cumple paquete npm + manifest instalable. |
| **sqlite** | SKIP 2026-06-25 | Gate duro falló: `@modelcontextprotocol/server-sqlite` no existe en npm (E404), por lo tanto no cumple paquete npm + manifest instalable. |
| **vercel** | SKIP 2026-06-25 | Gate duro falló: no se encontró servidor MCP oficial de Vercel en npm; `@vercel/mcp-adapter` es un adapter/framework, y `vercel-mcp`/similares son third-party. |
| **gmail** | SKIP 2026-06-25 | Gate duro falló: no se encontró servidor MCP oficial de Google/Gmail en npm; los paquetes encontrados son comunitarios, no publisher oficial. |
| **whatsapp** | SKIP 2026-06-25 | Gate duro falló: no se encontró servidor MCP oficial de Meta/WhatsApp en npm; los paquetes encontrados son comunitarios o wrappers de terceros. |
| **kit** | SKIP 2026-06-25 | Gate duro falló: no se encontró servidor MCP oficial de Kit/ConvertKit en npm; `kit-mcp-server` es comunitario. |
| **everything** | SKIP 2026-06-26 | Gate de catálogo falló: `@modelcontextprotocol/server-everything` existe en npm y publisher/maintainers son confiables, pero el README/metadata lo define como servidor de prueba que “exercises all the features of the MCP protocol”, no como conector útil para usuarios finales. |
| **server-sdk** | SKIP 2026-06-26 | Gate duro falló: `@modelcontextprotocol/server` existe en npm pero `latest` es `2.0.0-alpha.3` y el paquete es SDK/middleware, no server MCP instalable para el catálogo; NO canario/alpha. |
| **pipedream** | npm `@pipedream/mcp` README oficial (tarball 0.0.1) + docs `pipedream.com/docs/connect/mcp` | npm package metadata + README — Pipedream, Inc.; stdio requiere `--app`; env `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ID`, `PIPEDREAM_PROJECT_ENVIRONMENT`; tools dinámicas por componentes + `configure_component`; licencia Pipedream Source Available 1.0. |
| **stripe** (2026-07-14) | npm `@stripe/mcp` README oficial (v0.3.3) | npm package metadata + README — publisher/maintainers `*-stripe <*@stripe.com>` (Stripe oficial); repo `stripe/ai` (`tools/modelcontextprotocol`); `npx -y @stripe/mcp --tools=all`; auth `STRIPE_SECRET_KEY` env o `--api-key`; `--stripe-account` para connected accounts; lista de tools versionada en docs.stripe.com/mcp#tools; MIT. Logo: oficial (simple-icons `stripe`, brand `#635BFF`). |
| **firecrawl** (2026-07-14) | npm `firecrawl-mcp` README oficial (v3.22.3) | npm package metadata + README — maintainer `hello_sideguide <hello@sideguide.dev>` (empresa detrás de Firecrawl); repo `firecrawl/firecrawl-mcp-server`; `env FIRECRAWL_API_KEY=fc-… npx -y firecrawl-mcp`; tools `scrape`/`search`/`crawl`/`map`/`extract`/`agent`/`interact`; tier keyless hosted documentado; token `firecrawl.dev/app/api-keys`; MIT. **Logo: FALLBACK TS** — no está en simple-icons y el sitio del vendor está bloqueado por el proxy en este entorno. JM: subir el logo oficial de Firecrawl a `public/connectors/firecrawl.svg`. |
| **context7** (2026-07-14) | npm `@upstash/context7-mcp` README oficial (v3.2.3) | npm package metadata + README — maintainers `*@upstash.com` (Upstash oficial); repo `upstash/context7`; `npx -y @upstash/context7-mcp`; **keyless por defecto**, `CONTEXT7_API_KEY`/`--api-key` opcional (rate limits + repos privados) en context7.com/dashboard; tools `resolve-library-id`, `get-library-docs`; MIT. Logo: marca oficial de **Upstash** (simple-icons `upstash`, brand `#00E9A3`) — Context7 es un producto de Upstash; usar la marca del vendor padre hasta que Context7 tenga logo propio disponible. |
| **exa** (2026-07-14) | npm `exa-mcp-server` README oficial (v3.2.1) | npm package metadata + README — maintainer `theishangoswami <ishan@exa.ai>`; repo `exa-labs/exa-mcp-server`; `npx -y exa-mcp-server` con `EXA_API_KEY`; tools `web_search_exa`, `web_search_advanced_exa`, `company_research_exa`, `crawling_exa`, `people_search_exa`, `linkedin_search_exa`, `deep_researcher_start/check`, `get_code_context_exa`, `deep_search_exa`; token `dashboard.exa.ai/api-keys`; LICENSE del tarball = MIT (Exa Labs, 2025). **Logo: FALLBACK TS** — no está en simple-icons y el sitio del vendor está bloqueado por el proxy en este entorno. JM: subir el logo oficial de Exa a `public/connectors/exa.svg`. |
| **playwright** | SKIP 2026-07-14 | Considerado (`@playwright/mcp`, publisher Microsoft oficial — `*@microsoft.com`, repo `microsoft/playwright-mcp`) pero diferido: (a) solapa con el conector **puppeteer** ya publicado (ambos automatización de navegador), y (b) el campo `readme` del registro npm viene vacío, así que no hay fuente oficial vía npm para redactar sin `WebFetch` (bloqueado en este entorno). Reconsiderar en una corrida con acceso al README del repo. |
| **neon** (2026-07-16) | npm `@neondatabase/mcp-server-neon` README oficial (v0.6.5) | npm package metadata + README — publisher/maintainers `*@neon.tech` (Neon oficial); repo `neondatabase/mcp-server-neon`; `npx -y @neondatabase/mcp-server-neon start <NEON_API_KEY>`; token en console.neon.tech (neon.tech/docs/manage/api-keys); 23 tools (list/describe/create/delete projects+branches, `run_sql`, `run_sql_transaction`, `prepare/complete_database_migration`, query tuning, `provision_neon_auth`, etc.); MIT. **Divulgación:** el README dice que el server local es *"intended for local development and IDE integrations only… We do not recommend using the Neon MCP Server in production"* (puede ejecutar operaciones destructivas) — citado en el conector; mencionada la alternativa Remote MCP (OAuth, Preview). Logo: oficial (simple-icons `neon`, brand `#34D59A`). |
| **elasticsearch** (2026-07-16) | npm `@elastic/mcp-server-elasticsearch` README oficial (v0.3.1) | npm package metadata + README — publisher/maintainers `*@elastic.co` (Elastic oficial); repo `elastic/mcp-server-elasticsearch`; `npx -y @elastic/mcp-server-elasticsearch`; env `ES_URL` (requerido) + `ES_API_KEY` (API key o user/pass); tools `list_indices`, `get_mappings`, `search`, `get_shards`; Apache-2.0. **Divulgación:** el README marca el repo como *"experimental features intended for research and evaluation… not production-ready"* — citado en el conector. Logo: oficial (simple-icons `elasticsearch`, brand `#005571`). |
| **square** (2026-07-16) | npm `square-mcp-server` README oficial (v0.1.2) | npm package metadata + README — publisher `oss-releases@block.xyz`, author "Block, Inc" (Square es de Block); `npx square-mcp-server start`; env `ACCESS_TOKEN` (token de acceso Square, nombre literal), toggle `SANDBOX`/`PRODUCTION` (manifest default `SANDBOX=true`), `SQUARE_VERSION`/`DISALLOW_WRITES` opcionales; token en developer.squareup.com/docs/build-basics/access-tokens; tools `get_service_info`/`get_type_info`/`make_api_request` sobre el catálogo de servicios Square (payments, catalog, orders, customers, inventory, invoices, refunds, subscriptions, loyalty, giftcards, bookings, locations, team, payouts, disputes, terminal, devices…); Apache-2.0. Logo: oficial (simple-icons `square`, brand `#3E4348`). Nota: el paquete npm no declara `repository`; fuente = npm README + Square developer docs. |
| **paypal** | SKIP 2026-07-16 | `@paypal/mcp` existe en npm (v1.8.1), publisher oficial (`*@paypal.com`) y README presente, pero el paquete **no declara licencia** (`license` unset en todas las versiones) **ni `repository`** en el registro npm → no se pueden completar los campos `license`/`licenseUrl`/source del molde de oro sin adivinar. Reconsiderar si PayPal publica licencia + repo, o con fuente oficial fuera de npm. |
| **cloudflare** | SKIP 2026-07-16 | `@cloudflare/mcp-server-cloudflare` (v0.2.0) es oficial pero **legacy/remote-first**: la oferta productizada actual de Cloudflare son servidores MCP **remotos hospedados** (endpoints SSE por producto en `*.mcp.cloudflare.com`), no este server stdio local. Diferido hasta decidir cómo modela el catálogo los conectores remote-only. |
| **mongodb** | SKIP 2026-07-16 | `mongodb-mcp-server` (v1.14.0) es MongoDB oficial (`*@mongodb.com`, repo `mongodb-js`) y limpio, pero el campo `readme` del **registro npm viene vacío en todas las versiones** → no hay fuente oficial vía npm para redactar (regla #5). Recuperable si se permite redactar desde el README del repo GitHub oficial en una corrida futura. |
| **apify** | SKIP 2026-07-16 | `@apify/actors-mcp-server` (v0.11.6) es Apify oficial (`*@apify.com`, repo `apify`) y limpio, pero el `readme` del registro npm viene **vacío en todas las versiones** → sin fuente oficial vía npm (regla #5). Recuperable desde el README del repo GitHub. |
| **grafana / redis** | SKIP 2026-07-16 | Gate duro (regla #1): no publican server MCP en **npm**. Grafana MCP ships como binario **Go** (`mcp-grafana`); Redis MCP es **Python** (PyPI, `redis/mcp-redis`). Fuera del scope npm del Loop. |
| **huggingface** | SKIP 2026-07-16 | `@huggingface/mcp` no existe en npm (E404); `huggingface-mcp-server` es un **wrapper comunitario** (author "Your Name", repo "yourusername") → falla el gate de publisher oficial (regla #3). |
| **prisma** | SKIP 2026-07-16 | El MCP de Prisma es un **subcomando** del CLI del ORM (`prisma mcp`), no un server MCP instalable independiente para el catálogo (regla #2). |

## Logos pendientes (deuda del Loop)

> El Loop **tiene que conseguir el logo oficial** de cada conector (regla #9). Cuando un conector se publica con el fallback TS porque el logo oficial no se pudo obtener en esa corrida, queda anotado acá y la **próxima corrida del Loop debe cerrarlo** (bajar el oficial a `public/connectors/<slug>.svg` y borrar la fila). No es un estado terminal.

| Conector | Logo actual | Qué falta | Anotado |
|---|---|---|---|
| **firecrawl** | fallback TS (`public/connectors/firecrawl.svg`) | Logo oficial de Firecrawl. **Re-chequeado 2026-07-16:** sigue sin estar en simple-icons (v16.26.0) y el sitio del vendor sigue bloqueado por el proxy — no se pudo cerrar en esta corrida. Bajar el SVG/PNG oficial de firecrawl.dev o su brand kit. | 2026-07-14 (re-check 2026-07-16) |
| **exa** | fallback TS (`public/connectors/exa.svg`) | Logo oficial de Exa. **Re-chequeado 2026-07-16:** sigue sin estar en simple-icons (v16.26.0) y el sitio del vendor sigue bloqueado por el proxy — no se pudo cerrar en esta corrida. Bajar de exa.ai o su brand kit. | 2026-07-14 (re-check 2026-07-16) |

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
9. **Logos oficiales, no tiles inventados.** Cada conector nuevo debe traer el **logo oficial del vendor**, no un tile casero con iniciales. Procedimiento obligatorio en cada corrida del Loop:
   - Buscar el logo oficial del vendor en fuentes oficiales: sitio oficial, repo oficial o brand assets. Cascada sugerida: brand kit del vendor → avatar del owner **oficial** en GitHub → favicon del sitio oficial.
   - Verificar que la fuente sea oficial con el mismo criterio del gate de publisher: si el repo es de un tercero, su avatar **NO** es el logo del vendor.
   - Bajar el asset a `public/connectors/<slug>.svg` o `public/connectors/<slug>.png`. **NO** referenciar URLs externas: dependen de CDNs que cambian y pueden romper el catálogo en producción.
   - Usar la marca correctamente: no deformar, no recortar y no sugerir partnership/endorsement.
   - Para conectores propios de TerminalSync o sin vendor claro, usar logo TS (`ts-curated` / `ts-fallback`). **NO** inventar un tile con iniciales.
   - Si no se consigue logo oficial, usar fallback TS y declararlo explícitamente en el PR. No inventar logos.
   - El PR del Loop debe mostrar el logo propuesto de cada conector nuevo para aprobación de JM, igual que muestra y justifica el publisher.

### Licencia y uso de logos

- Los logos descargados desde Simple Icons se tratan como assets de marca para uso nominativo: identificar la integración/conector correspondiente, no sugerir partnership, certificación ni endorsement.
- Simple Icons publica el proyecto bajo CC0, pero su disclaimer aclara que cada icono puede tener licencia/guidelines propias y que las marcas registradas siguen perteneciendo a sus dueños. Antes de agregar o actualizar un logo, verificar la entrada del icono y/o las brand guidelines del vendor cuando existan.
- Aunque la fuente permita descargar el SVG, el uso en TerminalSync debe respetar las reglas de marca: no deformar, no recortar, no recolorear contra guidelines conocidas, y no usar el logo como marca principal de TerminalSync.
- Todo logo aprobado debe quedar vendorizado en `public/connectors/` para evitar dependencia runtime de CDNs externos.

## Dónde está cada cosa en este repo

- `content/connectors/es/<slug>.md` — versión en español
- `content/connectors/en/<slug>.md` — versión en inglés
- `src/lib/connectors.ts` — loader + tipo, expone `description` (markdown completo) y `tokenHelpUrl` al catálogo.
- `terminal-sync` Lab → `PowerUpDetailPanel.tsx` renderiza el panel con `DescriptionBlock` (split por `--- dev ---`) + `TokenSection` (gated por `hasManifest && requiresEnvSecrets`).
