# Connector Content — Official Sources

> **Para el Loop:** todo conector instalable nuevo se redacta a partir de su fuente oficial, NO de memoria. Estos 8 son el molde de oro definitivo aprobado para el catálogo (en + es, paridad estricta).

## Filtro de persona (empresario-first) — regla del Loop

**Norte de producto:** el comprador de Terminal Sync es un **dueño/director de negocio NO técnico**. El marketplace ya se escoró una vez al lado dev (bases de datos, monitoreo, LSPs) — items que un empresario nunca va a tocar. Este filtro corrige eso sin cerrarle la puerta al segmento dev, que es real.

Por cada candidato del Loop (conector, kit o skill), etiquetá la **audiencia** y aplicá el test:

- **Test de 5 segundos:** *"¿un dueño de negocio lo entiende en 5 segundos y lo usaría esta semana?"* Si sí → `business`. Si es infra que solo un dev toca (DB, monitoreo, CI, colas, LSP) → `dev`. Si sirve a ambos (Notion, Slack, Drive) → `both`.
- **Los `dev` se PUEDEN agregar** (el segmento dev existe), pero **no se destacan** para el empresario ni cuentan para la meta de crecimiento no-dev. No featurear infra de dev en la vista del dueño de negocio.
- **Cada corrida del Loop debe traer al menos 1 item `business`.** No cerrar una corrida 100% infra de dev.
- **Preferencia fuerte por conectores remotos/OAuth** para la persona business: *"Conectá con Google/Notion"* (un botón) le gana a *"pegá tu API key"* — es el desbloqueo #1 del onboarding no-técnico.
- **Prioridad de valor para el empresario** (donde debería empujar el Loop): documentos de un clic (Word/Excel/PPT/PDF), ventas (Stripe/facturación), marketing (ads/SEO/redes), comunicación (email/WhatsApp/Slack), y **memoria del negocio** (estilo Engram). Ahí es donde el producto se vuelve "lo abro y lo uso el día uno".

Este filtro aplica igual a **kits** (`content/kits/RULES.md`) y **skills** (`content/skills/RULES.md`).

## Fuentes principales

| Capa | URL | Para qué |
|---|---|---|
| **Anthropic Connectors Directory** | https://claude.ai/directory | Descripción curada, casos de uso, capacidades read/write. Requiere auth pero la página de cada conector es la fuente más vetada. |
| **Anthropic Connectors blog** | https://claude.com/blog/connectors-directory | Anuncio oficial con use cases ejemplares por conector. |
| **Anthropic Partners MCP** | https://claude.com/partners/mcp | Listado público de partners con descripciones cortas oficiales. |
| **MCP Registry** | https://registry.modelcontextprotocol.io | Source of truth técnico (manifest, command, args, env). |
| **Anthropic Plugins Directory** | github.com/anthropics/claude-plugins-official (`.claude-plugin/marketplace.json`) | **Vía de descubrimiento pre-validada por Anthropic.** 256 plugins de terceros que pasaron su validación (bases de datos, monitoreo, SaaS, seguridad). Señal de calidad más fuerte que "el email del publisher coincide con el vendor". Para curar: cruzar la lista contra el catálogo, y por cada candidato leer su repo `source` para sacar el manifest MCP real + README oficial. **Ojo:** no todo el directorio es conector — muchos son skill-packs/toolkits sin server MCP; el gate por-ítem (npm stdio instalable + publisher oficial + README) sigue mandando. |
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
| **gmail** (SHIPPED 2026-07-20, antes SKIP 2026-06-25) | npm `gmail-mcp` README oficial (v2.3.1, tarball) | **Adam Jones / @domdomegg** — el **mismo autor de nuestros conectores de Google Sheets y Airtable** (mismo patrón OAuth-proxy `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, así un solo proyecto de Google respalda Sheets+Calendar+Gmail); repo `github.com/domdomegg/gmail-mcp`; `npx -y gmail-mcp`; tools lectura `gmail_get_profile`/`gmail_messages_list`/`gmail_message_get`/`gmail_threads_list` + escritura `gmail_message_send`/`_forward`/`_modify`/`_archive`/`_trash`/`_delete`; MIT. **Envíos con gate de confirmación**; lectura/búsqueda libre. Logo: oficial (simple-icons `gmail`). **Es la palanca #1 del catálogo de automatizaciones** (need `email` = 47 loops). Excepción de gate igual que sheets/calendar: Google no publica server oficial, se mitiga con el autor de nuestro Airtable/Sheets ya validado. **Reemplaza** el puntero roto anterior de `install.rs` (`@modelcontextprotocol/server-gmail`, que nunca existió en npm). |
| **whatsapp** | SKIP 2026-06-25 | Gate duro falló: no se encontró servidor MCP oficial de Meta/WhatsApp en npm; los paquetes encontrados son comunitarios o wrappers de terceros. |
| **kit** | SKIP 2026-06-25 | Gate duro falló: no se encontró servidor MCP oficial de Kit/ConvertKit en npm; `kit-mcp-server` es comunitario. |
| **everything** | SKIP 2026-06-26 | Gate de catálogo falló: `@modelcontextprotocol/server-everything` existe en npm y publisher/maintainers son confiables, pero el README/metadata lo define como servidor de prueba que “exercises all the features of the MCP protocol”, no como conector útil para usuarios finales. |
| **server-sdk** | SKIP 2026-06-26 | Gate duro falló: `@modelcontextprotocol/server` existe en npm pero `latest` es `2.0.0-alpha.3` y el paquete es SDK/middleware, no server MCP instalable para el catálogo; NO canario/alpha. |
| **pipedream** | npm `@pipedream/mcp` README oficial (tarball 0.0.1) + docs `pipedream.com/docs/connect/mcp` | npm package metadata + README — Pipedream, Inc.; stdio requiere `--app`; env `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ID`, `PIPEDREAM_PROJECT_ENVIRONMENT`; tools dinámicas por componentes + `configure_component`; licencia Pipedream Source Available 1.0. |
| **stripe** (2026-07-14) | npm `@stripe/mcp` README oficial (v0.3.3) | npm package metadata + README — publisher/maintainers `*-stripe <*@stripe.com>` (Stripe oficial); repo `stripe/ai` (`tools/modelcontextprotocol`); `npx -y @stripe/mcp --tools=all`; auth `STRIPE_SECRET_KEY` env o `--api-key`; `--stripe-account` para connected accounts; lista de tools versionada en docs.stripe.com/mcp#tools; MIT. Logo: oficial (simple-icons `stripe`, brand `#635BFF`). |
| **firecrawl** (2026-07-14) | npm `firecrawl-mcp` README oficial (v3.22.3) | npm package metadata + README — maintainer `hello_sideguide <hello@sideguide.dev>` (empresa detrás de Firecrawl); repo `firecrawl/firecrawl-mcp-server`; `env FIRECRAWL_API_KEY=fc-… npx -y firecrawl-mcp`; tools `scrape`/`search`/`crawl`/`map`/`extract`/`agent`/`interact`; tier keyless hosted documentado; token `firecrawl.dev/app/api-keys`; MIT. **Logo: OFICIAL** (cerrado 2026-07-17) — logo oficial de `mendableai/firecrawl` (`img/firecrawl_logo.png`) embebido en `public/connectors/firecrawl.svg`. |
| **context7** (2026-07-14) | npm `@upstash/context7-mcp` README oficial (v3.2.3) | npm package metadata + README — maintainers `*@upstash.com` (Upstash oficial); repo `upstash/context7`; `npx -y @upstash/context7-mcp`; **keyless por defecto**, `CONTEXT7_API_KEY`/`--api-key` opcional (rate limits + repos privados) en context7.com/dashboard; tools `resolve-library-id`, `get-library-docs`; MIT. Logo: marca oficial de **Upstash** (simple-icons `upstash`, brand `#00E9A3`) — Context7 es un producto de Upstash; usar la marca del vendor padre hasta que Context7 tenga logo propio disponible. |
| **exa** (2026-07-14) | npm `exa-mcp-server` README oficial (v3.2.1) | npm package metadata + README — maintainer `theishangoswami <ishan@exa.ai>`; repo `exa-labs/exa-mcp-server`; `npx -y exa-mcp-server` con `EXA_API_KEY`; tools `web_search_exa`, `web_search_advanced_exa`, `company_research_exa`, `crawling_exa`, `people_search_exa`, `linkedin_search_exa`, `deep_researcher_start/check`, `get_code_context_exa`, `deep_search_exa`; token `dashboard.exa.ai/api-keys`; LICENSE del tarball = MIT (Exa Labs, 2025). **Logo: FALLBACK TS** — no está en simple-icons y el sitio del vendor está bloqueado por el proxy en este entorno. JM: subir el logo oficial de Exa a `public/connectors/exa.svg`. |
| **playwright** | SKIP 2026-07-14 | Considerado (`@playwright/mcp`, publisher Microsoft oficial — `*@microsoft.com`, repo `microsoft/playwright-mcp`) pero diferido: (a) solapa con el conector **puppeteer** ya publicado (ambos automatización de navegador), y (b) el campo `readme` del registro npm viene vacío, así que no hay fuente oficial vía npm para redactar sin `WebFetch` (bloqueado en este entorno). Reconsiderar en una corrida con acceso al README del repo. |
| **neon** (2026-07-16) | npm `@neondatabase/mcp-server-neon` README oficial (v0.6.5) | npm package metadata + README — publisher/maintainers `*@neon.tech` (Neon oficial); repo `neondatabase/mcp-server-neon`; `npx -y @neondatabase/mcp-server-neon start <NEON_API_KEY>`; token en console.neon.tech (neon.tech/docs/manage/api-keys); 23 tools (list/describe/create/delete projects+branches, `run_sql`, `run_sql_transaction`, `prepare/complete_database_migration`, query tuning, `provision_neon_auth`, etc.); MIT. **Divulgación:** el README dice que el server local es *"intended for local development and IDE integrations only… We do not recommend using the Neon MCP Server in production"* (puede ejecutar operaciones destructivas) — citado en el conector; mencionada la alternativa Remote MCP (OAuth, Preview). Logo: oficial (simple-icons `neon`, brand `#34D59A`). |
| **elasticsearch** (2026-07-16) | npm `@elastic/mcp-server-elasticsearch` README oficial (v0.3.1) | npm package metadata + README — publisher/maintainers `*@elastic.co` (Elastic oficial); repo `elastic/mcp-server-elasticsearch`; `npx -y @elastic/mcp-server-elasticsearch`; env `ES_URL` (requerido) + `ES_API_KEY` (API key o user/pass); tools `list_indices`, `get_mappings`, `search`, `get_shards`; Apache-2.0. **Divulgación:** el README marca el repo como *"experimental features intended for research and evaluation… not production-ready"* — citado en el conector. Logo: oficial (simple-icons `elasticsearch`, brand `#005571`). |
| **square** (2026-07-16) | npm `square-mcp-server` README oficial (v0.1.2) | npm package metadata + README — publisher `oss-releases@block.xyz`, author "Block, Inc" (Square es de Block); `npx square-mcp-server start`; env `ACCESS_TOKEN` (token de acceso Square, nombre literal), toggle `SANDBOX`/`PRODUCTION` (manifest default `SANDBOX=true`), `SQUARE_VERSION`/`DISALLOW_WRITES` opcionales; token en developer.squareup.com/docs/build-basics/access-tokens; tools `get_service_info`/`get_type_info`/`make_api_request` sobre el catálogo de servicios Square (payments, catalog, orders, customers, inventory, invoices, refunds, subscriptions, loyalty, giftcards, bookings, locations, team, payouts, disputes, terminal, devices…); Apache-2.0. Logo: oficial (simple-icons `square`, brand `#3E4348`). Nota: el paquete npm no declara `repository`; fuente = npm README + Square developer docs. |
| **paypal** | SKIP 2026-07-16 | `@paypal/mcp` existe en npm (v1.8.1), publisher oficial (`*@paypal.com`) y README presente, pero el paquete **no declara licencia** (`license` unset en todas las versiones) **ni `repository`** en el registro npm → no se pueden completar los campos `license`/`licenseUrl`/source del molde de oro sin adivinar. Reconsiderar si PayPal publica licencia + repo, o con fuente oficial fuera de npm. |
| **cloudflare** | SKIP 2026-07-16 | `@cloudflare/mcp-server-cloudflare` (v0.2.0) es oficial pero **legacy/remote-first**: la oferta productizada actual de Cloudflare son servidores MCP **remotos hospedados** (endpoints SSE por producto en `*.mcp.cloudflare.com`), no este server stdio local. Diferido hasta decidir cómo modela el catálogo los conectores remote-only. |
| **mongodb** (2026-07-18) | README oficial del repo `mongodb-js/mongodb-mcp-server` (raw GitHub) | npm `mongodb-mcp-server` v1.14.0 — MongoDB oficial (`*@mongodb.com`, repo `mongodb-js`); **validado en el Anthropic Plugins Directory**; `npx -y mongodb-mcp-server --readOnly` (readOnly ON por default en los ejemplos del README); secret `MDB_MCP_CONNECTION_STRING` (`${SECRET:MONGODB_CONNECTION_STRING}`); tools Database + Atlas + Atlas-Local + Assistant (verbatim del README); Apache-2.0; Node ≥ v22.13.0. **Divulgación:** readOnly default + tools destructivas nombradas (`delete-many`, `drop-collection`, `drop-database`) + credenciales embebidas en el connection string. **Antes SKIP 2026-07-16** (README de npm vacío); cerrado leyendo el README del repo oficial. Logo: oficial (simple-icons `mongodb`, `#47A248`). |
| **posthog** (2026-07-18) | README oficial del repo `PostHog/mcp` (raw GitHub) | npm scope oficial `@posthog/mcp` v0.9.1 — **validado en el Anthropic Plugins Directory**; **REMOTO/hospedado**: el README solo documenta el endpoint `https://mcp.posthog.com/mcp`, alcanzado localmente vía el bridge `npx -y mcp-remote@latest <url> --header Authorization:${POSTHOG_AUTH_HEADER}`; secret `POSTHOG_API_KEY` como Bearer; MIT; token en `app.posthog.com/settings/user-api-keys?preset=mcp_server`. Features verbatim (29 grupos: flags/insights/experiments/error_tracking/sql/dashboards/llm_analytics…). **Primer conector remoto del catálogo** (bridge mcp-remote). **Divulgación:** server hospedado (US/EU), proxy stateless que no guarda analytics, scope acotado por la personal key. Logo: oficial (simple-icons `posthog`, `#000000`). |
| **pinecone** (2026-07-18) | README oficial (npm `@pinecone-database/mcp` + repo `pinecone-io/pinecone-mcp`) | npm `@pinecone-database/mcp` v0.2.1 — Pinecone oficial (`ops@pinecone.io`); **validado en el Anthropic Plugins Directory**; `npx -y @pinecone-database/mcp`; secret `PINECONE_API_KEY`; 9 tools verbatim (`search-docs`, `list-indexes`, `describe-index`, `describe-index-stats`, `create-index-for-model`, `upsert-records`, `search-records`, `cascading-search`, `rerank-documents`); Apache-2.0; token en `app.pinecone.io`. **Divulgación:** solo índices con integrated inference (Assistants / vector search clásico NO soportados). **Logo: FALLBACK TS** — no está en simple-icons y el sitio del vendor + repos raw no exponen un SVG oficial en esta corrida. |
| **apify** | SKIP 2026-07-16 | `@apify/actors-mcp-server` (v0.11.6) es Apify oficial (`*@apify.com`, repo `apify`) y limpio, pero el `readme` del registro npm viene **vacío en todas las versiones** → sin fuente oficial vía npm (regla #5). Recuperable desde el README del repo GitHub. |
| **grafana / redis** | SKIP 2026-07-16 | Gate duro (regla #1): no publican server MCP en **npm**. Grafana MCP ships como binario **Go** (`mcp-grafana`); Redis MCP es **Python** (PyPI, `redis/mcp-redis`). Fuera del scope npm del Loop. |
| **huggingface** | SKIP 2026-07-16 | `@huggingface/mcp` no existe en npm (E404); `huggingface-mcp-server` es un **wrapper comunitario** (author "Your Name", repo "yourusername") → falla el gate de publisher oficial (regla #3). |
| **prisma** | SKIP 2026-07-16 | El MCP de Prisma es un **subcomando** del CLI del ORM (`prisma mcp`), no un server MCP instalable independiente para el catálogo (regla #2). |
| **clickhouse / planetscale / semgrep** | SKIP 2026-07-18 | Del Anthropic Plugins Directory pero **sin server MCP en npm** (E404 en los nombres oficiales). Su MCP vive como binario/otro runtime o remoto. Fuera del scope npm-stdio del Loop actual; candidatos para la extensión de scope (remoto/no-npm). |
| **box / sonarqube** | SKIP 2026-07-18 | Aparecen en el directorio, pero el paquete npm con server MCP es **comunitario**, no del vendor: `box-mcp-server` (author `jake@heimark.org`, repo `hmk/…`) y `sonarqube-mcp-server` (author `sapientpants`). Falla el gate de publisher oficial (regla #3). El plugin oficial del directorio apunta a otra cosa (skills/remoto). |
| **convex** | SKIP 2026-07-18 | En el directorio como `convex-backend-**skill**`; el MCP de Convex es un **subcomando del CLI** (`npx convex mcp`), no un server instalable independiente (regla #2). |
| **linear / datadog** | SKIP 2026-07-18 | Del directorio, pero son **remotos/hospedados** (Linear: `mcp.linear.app` OAuth; Datadog: plugin `datadog-labs`, no server npm stdio). Candidatos para la extensión de scope remoto, no para el gate npm actual. |
| **shopify** | FIRST-PARTY 2026-07-19 | **NO pasa por el Loop npm** (Shopify no publica un server MCP operador para el dueño; `@shopify/dev-mcp` es solo docs/schema y los que operan la tienda son de terceros). Se resolvió con un **build propio**: el server `terminalsync-shopify-mcp` (repo `terminal-sync`, sidecar Tauri) sobre la Admin GraphQL API oficial, conectado desde Ajustes → Integraciones (no por manifest npm). Catálogo: `content/connectors/{es,en}/shopify.md` (`source: first-party`, sin manifest). **Un futuro run del Loop NO debe re-SKIPpearlo como npm** — ya está resuelto fuera del scope npm. Logo: **oficial** (simple-icons `shopify`, `#7AB55C`). |
| **google-sheets** (2026-07-19) | npm `google-sheets-mcp` README oficial (v1.2.1, tarball) | npm package metadata + README — **Adam Jones / @domdomegg**, el **mismo autor de nuestro conector de Airtable** ya publicado; repo `github.com/domdomegg/google-sheets-mcp`; `npx -y google-sheets-mcp`; OAuth `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (scope `spreadsheets`, redirect `http://localhost:3000/callback`); tools `sheets_spreadsheet_get`/`_create`, `sheets_values_get`/`_batch_get`/`_update`/`_batch_update`, `sheets_sheets_list`; MIT. Logo: oficial (simple-icons `googlesheets`, `#0F9D58`). **Excepción de gate documentada** (abajo). |
| **google-calendar** (2026-07-19) | npm `google-calendar-mcp` README oficial (v1.0.9, tarball) | npm package metadata + README — **Yevhen Romanov** (comunitario, individuo); el paquete npm **no declara `repository`** → fuente = npm README + metadata, `originalAuthorUrl` apunta a la página npm (regla #4: no inventar el repo); `npx -y google-calendar-mcp`; OAuth `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + `GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback` (`AUTH_METHOD=google_cloud`); capacidades: listar calendarios/eventos, próximos eventos, crear/editar/borrar eventos, detalle, chequeo de disponibilidad; MIT. Logo: oficial (simple-icons `googlecalendar`, `#4285F4`). **Excepción de gate documentada** (abajo). |

| **xero** (2026-07-19) | npm `@xeroapi/xero-mcp-server` README oficial (v0.0.17, tarball) | npm package metadata + README — **publisher oficial "Xero"** (`author: "Xero"`, repo `github.com/XeroAPI/xero-mcp-server`); `npx -y @xeroapi/xero-mcp-server`; OAuth2 **Custom Connections** (M2M, una organización por conexión): `XERO_CLIENT_ID` + `XERO_CLIENT_SECRET`, opcional `XERO_SCOPES`, alternativa `XERO_CLIENT_BEARER_TOKEN`; tools read `list-invoices`/`list-aged-receivables-by-contact`/`list-payments`/`list-profit-and-loss`/`list-report-balance-sheet`/`list-trial-balance`/`list-contacts`/`list-accounts`/`list-bank-transactions`/… + write `create-invoice`/`create-payment`/`create-quote`/`create-credit-note`/`update-*`; MIT. Logo: oficial (simple-icons `xero`, `#13B5EA`). **Pasa el gate de publisher limpio.** Cubre los 21 loops de Facturación/Contabilidad. **Nota LATAM:** Alegra/Siigo (dominantes en Colombia) **no tienen server MCP en npm** (E404); Xero es la única opción de contabilidad con publisher oficial. Muchos loops de facturación también corren sobre el conector de Google Sheets (fallback del brief). |

| **hubspot** (2026-07-20) | npm `@hubspot/mcp-server` README oficial (v0.4.0, tarball) | npm package metadata + README — **publisher oficial HubSpot** (scope `@hubspot`; README: *"HubSpot's MCP server is now available as a beta release"*, docs `developers.hubspot.com/mcp`); `npx -y @hubspot/mcp-server`; auth `PRIVATE_APP_ACCESS_TOKEN` (private app, scopes elegidos al crear, read-only recomendado por el README); tools `hubspot-list-objects`/`-search-objects`/`-batch-create-objects`/`-batch-update-objects`/`-batch-read-objects`/`-get-schemas`, properties `-list/get/create/update-property`, associations `-batch-create/list-associations`/`-get-association-definitions`, engagements `-create-engagement` (Notes/Tasks), `hubspot-get-user-details`; MIT. Logo: oficial (simple-icons `hubspot`, `#FF7A59`). **Pasa el gate de publisher limpio.** Cubre CRM #7 (8 loops). |
| **ahrefs** (2026-07-20) | npm `@ahrefs/mcp` README oficial (v0.0.11, tarball) | npm package metadata + README — **publisher oficial "Ahrefs"** (`author: "Ahrefs"`); `npx -y @ahrefs/mcp`; auth `API_KEY` (mapeado desde `${SECRET:AHREFS_API_KEY}`); el README es install-focused y **no enumera tools** → el conector describe la superficie de la Ahrefs API (keywords orgánicas/posiciones, backlinks/referring domains, domain rating, métricas e ideas de keywords, rank tracking) sin inventar nombres exactos (regla #1); MIT. **Pasa el gate de publisher limpio.** Cubre SEO #8 (4 loops). **Divulgación:** la Ahrefs API es un adicional pago a la suscripción. **Logo: FALLBACK TS** — Ahrefs no está en simple-icons (v16.27.0 ni latest); ver "Logos pendientes". |

### Excepción de gate — conectores del catálogo de Loops (2026-07-19)

Los dos conectores de Google de arriba **no pasan el gate #3 "publisher oficial"** tal como está escrito (Google no publica servers MCP de Sheets/Calendar en npm — igual que `gmail`/`whatsapp`, que están SKIP por eso). Se shipean igual por instrucción directa de JM: el **brief "Conectores para el catálogo de Automatizaciones (Loops)"** los prioriza como #1 y #2 (13 + 11 loops del catálogo `loopUseCases.ts` dependen de ellos). Mitigación del riesgo de publisher:
- **google-sheets** lo mantiene **@domdomegg**, el mismo autor comunitario cuyo `airtable-mcp-server` ya shippeamos y validamos — precedente directo, no un desconocido.
- **google-calendar** es de un individuo; se documenta como comunitario y la auth corre por el OAuth de Google (el usuario aprueba en su propio navegador, nada se delega a un tercero).

Cuando exista un server MCP **oficial de Google** para Sheets/Calendar, migrar a ese y despromover estos. La decisión de negocio (cobertura del catálogo de Loops) le gana hoy a la pureza del gate.

### Conectores first-party (fuera del scope npm del Loop)

Algunos conectores no tienen server MCP en npm y se shipean como **build propio** (sidecar de TerminalSync sobre la API oficial del vendor), igual que Shopify (#702/#177) y Meta Ads (#705/#178). Van con `source: first-party`, **sin `manifest`** (`hasManifest:false`) porque se conectan **desde la app**, no por npx.

- **google-business** (2026-07-20) — Google **no publica** server MCP de Business Profile en npm (solo librerías crudas `@googleapis/mybusiness*`). Sidecar propio `terminalsync-google-business-mcp` sobre las REST APIs oficiales (Account Management v1 + Business Information v1 + `mybusiness` v4 para reseñas). Cubre los 14 loops de Reseñas/Google Business. Tools: `gbp_list_accounts`/`gbp_list_locations`/`gbp_list_reviews`/`gbp_review_summary` (lectura) + `gbp_reply_review` (escritura con confirmación de dos pasos). Auth OAuth2 `business.manage` (token en keychain; refresh flow completo = follow-up). Requiere aprobación de acceso de Google a la Business Profile API. **Logo:** marca oficial de **Google** (simple-icons `google`, `#4285F4`) — Business Profile no tiene icono propio en simple-icons; se usa la marca del vendor padre.

### Paridad Accio — conectores npx (2026-07-20)

Del inventario exacto de Accio (lista ✅ CONSTRUIR), los que tienen server MCP real en npm. Verificados desde el README del tarball.

| Conector | Fuente | Notas |
|---|---|---|
| **todoist** | npm `@doist/todoist-mcp` v12.0.0 | **Publisher oficial Doist** (scope `@doist`, repo `Doist/todoist-mcp`); `npx -y @doist/todoist-mcp`; auth `TODOIST_API_KEY`; tareas/proyectos/secciones/etiquetas/comentarios (R/W); MIT. Logo: oficial (simple-icons `todoist`, `#E44332`). |
| **monday** | npm `@mondaydotcomorg/monday-api-mcp` v3.3.0 | **Publisher oficial monday.com** (scope `@mondaydotcomorg`, repo `mondaycom/monday-ai`); `npx -y @mondaydotcomorg/monday-api-mcp -m atp`; auth env `monday_token` (`${SECRET:MONDAY_TOKEN}`) + `NODE_OPTIONS=--no-node-snapshot` (literal, config oficial); boards/items/columnas/updates; MIT. **Logo: FALLBACK TS** — monday no está en simple-icons; ver Logos pendientes. |
| **clickup** | npm `clickup-mcp-server` v1.12.0 | David Whatley (`nsxdavid`), MIT; `npx -y clickup-mcp-server`; auth `CLICKUP_API_TOKEN` (`pk_…`); tools verbatim `get_workspaces`/`get_spaces`/`get_lists`/`get_tasks`/`get_docs_from_workspace`/`create_folder`/`create_list`/`create_task`/`update_task`. Logo: oficial (simple-icons `clickup`, `#7B68EE`). |
| **twitter** (X) | npm `@enescinar/twitter-mcp` v0.2.0 | Enes Cinar, MIT; **X API v2 oficial** (OAuth 1.0a); `npx -y @enescinar/twitter-mcp`; env `API_KEY`/`API_SECRET_KEY`/`ACCESS_TOKEN`/`ACCESS_TOKEN_SECRET` (mapeados de `TWITTER_*`); tools `post_tweet`/`search_tweets`. **Escritura pública** → gate de confirmación. Logo: oficial (simple-icons `x`, `#000000`). |
| **wordpress** | npm `wordpress-mcp` v1.0.2 | Utsav Ladani, ISC; `npx -y wordpress-mcp`; env `WORDPRESS_HOST_URL`/`WORDPRESS_API_USERNAME`/`WORDPRESS_API_PASSWORD` (**application password**, no la del login, revocable)/`WORDPRESS_POST_AUTHOR_ID`; posts/páginas sobre la REST API. Logo: oficial (simple-icons `wordpress`, `#21759B`). |

**SKIP de esta corrida (documentados):**

| Conector | SKIP | Motivo |
|---|---|---|
| **linkedin** | 2026-07-20 | Los paquetes npm (`linkedin-mcp`, `mcp-linkedin`) son comunitarios y **el README no documenta la auth**; LinkedIn no tiene API oficial para esto y los servers comunitarios suelen **scrapear con cookies de sesión** (contra los ToS + frágil). No se ship sin una fuente/auth confiable. |
| **metabase** | 2026-07-20 | `metabase-mcp` (gobenpark) existe pero **el tarball no trae README** y no se pudo extraer la config de env de la fuente (regla #1: no redactar de memoria). Recuperable leyendo el repo. |
| **similarweb** | 2026-07-20 | No hay server MCP en npm (E404). |
| **dropbox** | 2026-07-20 | `dropbox-mcp-server` existe pero **sin author ni license** en el registro npm → no se pueden completar los campos del molde. |
| **intercom** | 2026-07-20 | No hay server MCP en npm; el slot CRM lo cubre **HubSpot** (oficial). |
| **zapier** | 2026-07-20 | `zapier-mcp` existe pero es **UNLICENSED** en npm → no se ship sin licencia. (Make ya está en el catálogo para automatización.) |

## Logos pendientes (deuda del Loop)

> El Loop **tiene que conseguir el logo oficial** de cada conector (regla #9). Cuando un conector se publica con el fallback TS porque el logo oficial no se pudo obtener en esa corrida, queda anotado acá y la **próxima corrida del Loop debe cerrarlo** (bajar el oficial a `public/connectors/<slug>.svg` y borrar la fila). No es un estado terminal.

| Conector | Logo actual | Qué falta | Anotado |
|---|---|---|---|
| ~~**firecrawl**~~ | **CERRADO 2026-07-17** | Logo **oficial** de Firecrawl bajado del repo oficial (`mendableai/firecrawl`, `img/firecrawl_logo.png`, 512×512) vía `raw.githubusercontent.com` y embebido en `public/connectors/firecrawl.svg`. Deuda saldada. | — |
| **pinecone** | fallback TS (`public/connectors/pinecone.svg`) | Logo oficial de Pinecone. No está en simple-icons (2026-07-18) y los repos raw de `pinecone-io` no exponen un SVG de logo; el sitio del vendor está bloqueado por el proxy. Bajar de pinecone.io o su brand kit. | 2026-07-18 |
| **exa** | fallback TS (`public/connectors/exa.svg`) | Logo oficial de Exa. **Re-chequeado 2026-07-17:** no está en simple-icons; `exa.ai` sigue bloqueado por el proxy; `api.github.com` está scopeada (403) así que no se puede listar el repo, y las rutas raw típicas (`exa-labs/exa-mcp-server` `assets/logo.svg`, etc.) dan 404. **Pendiente JM (1 min):** guardar el SVG/PNG oficial de exa.ai o su brand kit a `public/connectors/exa.svg`. | 2026-07-14 (re-check 2026-07-17) |
| ~~**shopify**~~ | **CERRADO 2026-07-19** | Logo **oficial** de Shopify: la marca `shopify` de simple-icons (path oficial, `fill="#7AB55C"`) bajada vía `npm pack simple-icons` y embebida en `public/connectors/shopify.svg`. Deuda saldada. | — |
| **ahrefs** | fallback TS (`public/connectors/ahrefs.svg`) | Logo oficial de Ahrefs. No está en simple-icons (v16.27.0 ni latest); el sitio del vendor está bloqueado por el proxy en este entorno. **Pendiente JM (1 min):** guardar el SVG/PNG oficial de ahrefs.com o su brand kit a `public/connectors/ahrefs.svg`. | 2026-07-20 |
| **monday** | fallback TS (`public/connectors/monday.svg`) | Logo oficial de monday.com. No está en simple-icons (v16.27.0). **Pendiente JM (1 min):** guardar el SVG/PNG oficial de monday.com o su brand kit a `public/connectors/monday.svg`. | 2026-07-20 |

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
