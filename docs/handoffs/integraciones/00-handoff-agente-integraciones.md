Estado verificado el 2026-10-25 contra `main` del repo web (a2abc02) y `release/v0.2.18-lab` del repo app. Lo que no pude verificar está marcado **[NV]**.

# Handoff: agente de integraciones de TerminalSync

**Misión del agente:** buscar, verificar e implementar más integraciones útiles para **dueños de negocio en Latinoamérica, Estados Unidos y España**, usando los loops y herramientas que ya existen, sin romper lo que ya funciona y sin afirmar nada que no esté verificado.

**Quién es el cliente:** dueño de pyme no técnico. No usa terminal ni git. Habla español (neutro, con "tú") o inglés. Mercados de primer nivel: **EE. UU., Latinoamérica (CO, MX, AR, CL, PE y el resto) y España**.

**Decisión vigente (JM, 2026-10-08):** TerminalSync vive **solo con GLM** (Z.ai). "Funciona" significa: **funciona en el chat de GLM de la app**. Ignora Claude, Codex y Gemini en catálogo, pruebas y texto.

**Solo la build estable.** Lab está congelado desde 2026-09-18: no se compila ni se instala nada para Lab. El nombre de la rama `release/v0.2.18-lab` es solo el tronco del que salen las builds estables. En el catálogo no hay ninguna distinción Lab/estable: lo que se mergea llega a los clientes de la estable. Los campos heredados `deliveredTo` / `vendors` / `compatibleWith` (claude, codex, gemini) del catálogo y de las skills no se usan para decidir nada hoy: no inviertas tiempo en ellos.

---

## 0. Reglas duras (léelas antes de tocar nada)

1. **No inventes.** Cada URL, herramienta, plan, precio, límite y país sale de una fuente oficial que **leíste**. Si no puedes verificarlo, quítalo o márcalo.
2. **No mergees lo que no pasó el smoke de login** (`scripts/smoke-remote-login.mjs`) si es un conector remoto. El 2026-10-14 se publicaron Alegra (URL 404, auth y alcance equivocados) y antes Siigo (URL 404) sin probarlo.
3. **Un revisor distinto del que escribió.** Un "arreglo" del corrector **sin segunda revisión** no es evidencia (pasó con Alegra y Mercado Pago).
4. **Ningún secreto en el chat, en el repo ni en logs.** Las credenciales se guardan "cifradas en Secretos de la app", no en el Keychain.
5. **El tronco de la app es `release/v0.2.18-lab`, no `main`.** Workers no mergean en la app; el coordinador sí. Cada worker usa su propio `git worktree`. Lee `CLAUDE.md` del repo app antes de tocarlo.
6. **Repo web:** ramas de PR desde `main`; el cuerpo del PR debe incluir la línea exacta `App PR: no aplica — la app consume el catálogo` (la supervisión la exige) salvo que haya cambio de código en la app.
7. **No borres datos de cliente** (`~/Library/Application Support/net.nexflowai.terminalsync*/`, `~/.claude/projects/`, `~/.codex/sessions/`, `~/.gemini/tmp/`, `TerminalSync_Data/`).
8. **No nombres a Claude al cliente.** El producto se presenta como TerminalSync.
9. **Español neutro con "tú"** en fichas `es` (sin voseo: vos, tenés, pedí, mirá…; sin regionalismos del Cono Sur). Hay un test que lo detecta, pero no lo detecta todo.
10. **Hora de Colombia (UTC-5)** en todo lo que reportes.

---

## 1. Estado actual del catálogo (2026-10-25)

**77 fichas** en `content/connectors/{en,es}/<slug>.md` (misma cantidad en cada idioma).

### Funcionando y supervisadas (paquete arranca, o login llega a la pantalla de autorización)
Slack, Notion, HubSpot, Airtable, GitHub, Square, Xero, WordPress y otras técnicas (ver admin "Por país").

### Remotas con login (`installableForAi: true`, razón `remote-needs-login`)
**El login nunca se probó con una cuenta real.** Solo se probó que llegan a la pantalla de autorización. Siigo, Mercado Pago, Asana, Canva, Calendly, Klaviyo, PostHog, Ideogram, Higgsfield, Gusto, Ramp, Intercom, Pipedrive, Linear, Tiendanube, Fintoc, Holded, Qonto, MONEI, Brevo, PayPal (y otras).

### Bloqueadas o retiradas (no las "arregles" a ciegas; ver motivo)
| Slug | Estado | Motivo real |
|---|---|---|
| `gmail`, `google-calendar`, `google-sheets` | `installableForAi:false`, `needs-oauth` | Los paquetes npm exigen un token de acceso de Google ya emitido (dura ~1 h, sin renovación) o no son servidores MCP por stdio (Calendar). La app no inyecta `GOOGLE_ACCESS_TOKEN`. Pendiente: cliente OAuth propio de TerminalSync. Verificado con comandos el 2026-10-14 (PR #416). |
| `gdrive`, `whatsapp`, `kit`, `zapier`, `sqlite`, `vercel`, `dropbox`, `elasticsearch`, `google-business` | bloqueadas | Sin receta instalable (`no-manifest`) u otra razón; ver ficha. |
| `zoom` | bloqueada | OAuth sin registro dinámico de clientes: `mcp-remote` no puede registrarse. Fijada en `REMOTE_WITHOUT_DCR` del verificador. |
| `shopify` | `status: soon` | No hay MCP oficial usable por comerciantes (el de desarrolladores no toca datos de la tienda). La ficha ya no promete la pantalla "Ajustes → Integraciones", que se retiró el 2026-09-10. |
| `alegra` | `status: soon`, retirada (#419) | `POST mcp.alegra.com/mcp` da 404; la raíz da 401 con metadatos OAuth y `mcp-remote` recibe 400; la doc actual dice Bearer y **solo lectura**, la ficha decía Basic y herramientas de borrado. Reabrir requiere **un token real de Alegra**. |
| `conekta`, `factorial` | `status: soon`, `needs-oauth` | Sus corridas del pipeline tuvieron una etapa de revisión en rojo (ver §1.2) y las fichas están en `soon`. **[NV]** No revisé por qué quedaron así; verifica antes de reintentar. |

### 1.2 Resultados del pipeline sobre candidatos (corridas del 2026-10-15 y 2026-10-16)

| Integración | Veredicto | Notas |
|---|---|---|
| Tiendanube, Fintoc, Holded, Qonto, MONEI, Brevo, PayPal | `ship_official` → en catálogo, `available` | Login sin probar con cuenta. Revisar los hallazgos de cada PR. |
| Factorial, Conekta | `ship_official` pero fichas en `soon` | La etapa de revisión falló. Rehacer: pipeline o PR manual con revisores. |
| Mercado Libre | `skip` | Su MCP oficial es un asistente de documentación para desarrolladores, no un conector del marketplace. |
| Wompi (CO), Facturapi (MX), Bsale (CL/MX/PE), Defontana (CL/PE/MX/CO) | `needs_own_build` | Tienen API pública, no MCP. Candidatos a construir (ver §9). |
| Alegra | `exists` | Ya existe y está retirada (ver arriba). |

---

## 2. Cómo funciona una integración, de punta a punta

```
content/connectors/{en,es}/<slug>.md  (frontmatter + cuerpo)
        │  src/lib/connectors.ts lee con gray-matter y valida
        ▼
GET /api/marketplace/catalog?lang=es|en   (revalidate 600 s, CORS abierto)
        │
        ├─► Landing (revalidate 3600): /[lang]/... fichas, /casos-de-uso
        ├─► Admin: /[lang]/admin/integraciones (+ /por-pais, /loop-runs)
        └─► App de escritorio: Explorer (caché ~10 min)
                 └─ instala con connectors/commands.rs → runtime.rs
                      ├─ remoto (mcp-remote): connectors/remote_login.rs
                      │     login único con navegador, tokens en ~/.mcp-auth
                      └─ chat GLM: workspace_tools.rs (buscar_integracion)
                           + api_tools.rs (arranca cada conector en cada turno,
                             herramientas con prefijo <slug>__<tool>)
                                └─ panel de Contexto: context_integrations/
```

### 2.1 La ficha (frontmatter que importa)
`name, logo, category, markets, status (available|soon), simpleTitle/Subtitle, devTitle/Subtitle, ctaUrl, tokenHelpUrl, manifest.mcpServers.<slug>.{command,args,env}, affiliate, tagline, originalAuthor(Url), license(Url), marketplaceSource, marketplaceCategory` y los campos de **supervisión** (los rellena `verify-connector.mjs --write`, no a mano): `installableForAi, installableForAiReason, aiToolsCount, aiReadOnlyTools, verifiedAt, verifiedPackageVersion`.

Cuerpo: explicación para no técnicos, sección **"What you can ask" / "Qué le puedes pedir"** (4 a 6 casos, **obligatoria**; un test la exige en las 77 menos 5 heredadas), cómo se conecta, divulgación honesta (qué lee, qué escribe, qué plan exige, qué NO cubre), y bloque `dev`.

### 2.2 Semántica de `installableForAi` (regla de la app)
- **Solo un `false` explícito bloquea.** Ausente = instalable. `false` → la app **no ofrece** instalarlo; GLM responde "Próximamente" y anota el pedido (`buscar_integracion` en `workspace_tools.rs`).
- Razones (`REASONS` en `scripts/verify-connector.mjs`): `ok`, `unverified-needs-key`, `remote-needs-login`, `needs-oauth`, `no-manifest`, `recipe-not-npx`, `package-invalid`, `install-failed`, `no-entrypoint`, `handshake-timeout`, `no-jsonrpc-id`, `no-usable-tools`, `needs-postinstall`, `env-denied`.
- Conectores de primera parte (`memory`, `meta-ads`, `meta-social`) están excluidos del verificador.

### 2.3 Dos moldes de manifiesto
- **Molde A (token):** `npx -y <paquete>` con `env` que usa `${SECRET:NOMBRE}`. O remoto con `--header "Authorization:${VAR}"`. La app pide el secreto y lo guarda cifrado.
- **Molde B (OAuth remoto):** `npx -y mcp-remote@latest <URL>` **sin `env`**. La app hace un login único al instalar (`remote_login.rs`, paciencia de 150 s, `--auth-timeout`); los turnos siguientes reutilizan `~/.mcp-auth` (saludo de 8 s). Si falta el token, el chat ofrece `<slug>__reconectar` (siempre con tarjeta de confirmación).

### 2.4 En el chat de GLM (app)
- `buscar_integracion`: busca por nombre/slug (sin acentos); **no** por sinónimos ni eslóganes. Una ficha `false` nunca llega a la tarjeta de instalación.
- `api_tools.rs`: arranca los conectores instalados en cada turno (handshake de 5 s los locales, 8 s los remotos), nombra las herramientas `<slug>__<tool>`. **Solo las herramientas con `readOnlyHint: true` corren solas; el resto pide tarjeta de confirmación.** Por eso un conector sin anotaciones de solo-lectura se siente lento.
- Flags del Worker proxy: `API_TOOLS_ENABLED` y `API_CHAT_ENABLED` en "true".

### 2.5 Panel de Contexto (app)
Cada capacidad que la IA puede usar (nativas, conectores, skills) es una herramienta de primera clase en el panel (`context_integrations.rs`, `context_integrations/availability.rs`, `context_sources.rs`). Un conector remoto sin login aparece como **"Falta iniciar sesión: usa Reconectar"** (PR #2546, mergeado). El audit por turno usa el mismo origen que el panel.

---

## 3. Herramientas del repo WEB (`jmggaravito-sudo/terminalsync-web`)

### Scripts
| Script | Para qué |
|---|---|
| `scripts/verify-connector.mjs` | Verifica instalabilidad para la IA. `--file <ficha>... --write` rellena los campos de supervisión; `--all --json` reporte global. Detecta `mcp-remote` (instalable con `remote-needs-login`) salvo los de `REMOTE_WITHOUT_DCR` (zoom, alegra). |
| `scripts/smoke-remote-login.mjs` | **Corre el `mcp-remote` real** contra la URL y exige llegar a la autorización (sin cuenta, config aislada, sin abrir navegador). `--slugs a,b`, `--files ...`, `--all`. Omite los ya `false`. Distingue `no-dcr` (sin registro dinámico), `http-404`, `no-login`. |
| `scripts/pipeline/{lib,cli}.mjs` | Lógica determinista del pipeline (`validateResearch`, `checkScope`, `summarizeReviews`, `decide`, `buildReport`). Tests en `pipeline.test.mjs`. |
| `scripts/loop-salvage.sh` | Si un loop agota los turnos sin abrir PR, sube lo escrito como PR **draft WIP** (nunca mergea). |
| `scripts/record_loop_run.mjs` | Registra la corrida del loop (panel "Loop runs"). |
| `scripts/export-use-cases.mjs` | Exportación de casos de uso desde la app (ya migrados). |

### Workflows (`.github/workflows/`)
- `integration-pipeline.yml`: **escribes un nombre** → investiga → construye → 3 a 4 revisores independientes → decisión → corrector → CI y merge → reporte. Se lanza con `gh workflow run integration-pipeline.yml -f focus="Nombre" -f dry_run=false` (nombre: letras, números, espacios, `. _ & + -`, máx. 60). `dry_run=true`: solo investiga.
- `integration-supervision-loop.yml`: gate de **todo PR que toque catálogo** y cron los martes 09:00 COL. Corre tests del catálogo, `verify-connector --all`, **el smoke de login de los conectores que el PR toca** (todos en el cron), y los tests de arrastre/instalación de la **app** contra el catálogo servido en producción. Exige la línea `App PR: no aplica…` en el cuerpo del PR.
- Loops de curación (lunes): `connector-curation-loop.yml`, `plugin-curation-loop.yml`, `kit-curation-loop.yml`, `skill-curation-loop.yml`. Agentes GLM vía `anthropics/claude-code-action@v1` apuntando a Z.ai.
- `marketplace-gate.yml`: tests de marketplace en cada PR.
- Variables/secretos: secret `Z_AI_API_KEY`; variable `ZAI_MODEL` (id exacto que sirve la clave, hoy `glm-5.3`). **`INTEGRATION_AUTOMERGE` no está definida: el pipeline NUNCA mergea solo** (se queda en "listo").

### Prompts del pipeline (`.github/pipeline/prompts/`)
`research.md` (decide `ship_official | needs_own_build | skip | exists`, `conversational_install`, `markets`), `build.md` (fichas, casos de uso, logo, `SOURCES.md`), `review.md` (voz, instalabilidad, honestidad, fuentes), `fix.md`. España cuenta como mercado de primer nivel desde el 2026-10-16.

### Páginas y rutas de admin
- `/[lang]/admin/integraciones`: **panel de ejecución** (escribes un nombre y lanzas el pipeline, o un loop), info de loops, agregar candidato, loop runs.
- `/[lang]/admin/integraciones/por-pais`: tabla de las integraciones con **países** y **estado de supervisión**; filtro por país con conteos; por defecto muestra funcionando + login sin probar. "Supervisada" = pasó verificación técnica, **no** que un cliente la usó. Estados: working, login-pending, blocked, unverified.
- `/[lang]/admin/integraciones/loop-runs`: historial de corridas.
- API: `src/app/api/admin/integraciones/{run,candidate,por-pais}` (acceso con sesión + `ADMIN_EMAILS`).

### Datos y tests relevantes
`content/connectors/SOURCES.md` (fuente de cada ficha y SKIPs documentados; **léelo antes de investigar**), `content/use-cases/` (casos de uso con `connectors: [slug]`, fuente única), `src/lib/markets.ts` (países permitidos), `src/lib/connectors.ts`, tests `connector-use-cases.test.ts`, `markets.test.ts`, `voz-neutral-catalogo.test.ts`, `useCases*.test.ts`.

---

## 4. Herramientas del repo APP (`jmggaravito-sudo/terminal-sync`, rama `release/v0.2.18-lab`)

| Archivo | Rol |
|---|---|
| `src-tauri/src/marketplace_catalog.rs` | Lee `slug/name/tagline/installableForAi` del catálogo, caché 10 min, `blocked_for_ai`. |
| `src-tauri/src/connectors/{commands,runtime,writers,remote_login}.rs` | Instalar, resolver `${SECRET:X}` desde la bóveda, ejecutar, login remoto. |
| `src-tauri/src/api_tools.rs` | Herramientas de la IA en cada turno; confirmación para escrituras; `<slug>__reconectar`. |
| `src-tauri/src/workspace_tools.rs` | `buscar_integracion` y tarjeta de instalación. |
| `src-tauri/src/context_integrations*.rs`, `context_sources*.rs` | Panel de Contexto y su inventario. |
| `src/lib/marketplaceCatalog.ts` (+ `catalogStore.ts`) | Catálogo en el frontend, normalización defensiva. |
| `src/components/PowerUpDetailPanel*`, `InstallModal*` | Detalle/instalación en el Explorer. |
| `scripts/verify-integration-loop.mjs` | Supervisión del lado app (hoy solo exige cobertura GLM). |
| `src-tauri/tests/fixtures/mcp-remote/proxy.py` | Servidor falso para tests de login remoto (sin red). |

**Reglas de trabajo en el repo app:** worktree propio, PR **draft** a `release/v0.2.18-lab`, `git add -A` antes de cada commit, `cargo check --lib --tests`, `CARGO_TARGET_DIR=~/projects/.terminal-sync-cargo-target-lab`, **sin** `npm run build:lab`, **sin** instalar el `.app`, PR body con `## Lo que el bot de soporte debe saber`. Carga los skills `ts-coordinacion`, `ts-verificar-cambio`, `ts-bot-soporte` según corresponda.

---

## 5. Procedimiento: cómo agregar una integración (paso a paso)

### Camino normal (hay MCP oficial)
1. Mira `content/connectors/SOURCES.md`: ¿ya se evaluó o se descartó? No repitas SKIPs sin evidencia nueva.
2. **Investiga con fuentes oficiales** (docs de desarrolladores, GitHub oficial, npm, página de precios): ¿hay MCP oficial? URL exacta, autenticación (OAuth con registro dinámico, token, o cliente pre-registrado), herramientas reales (lectura/escritura), plan o rol exigido, países, ¿plan gratuito o sandbox? **Prueba la URL con `curl`**: una `POST` de `initialize` debe dar 401 con `www-authenticate`, no 404.
3. Lanza el pipeline (`integration-pipeline.yml`) con el nombre, o construye manualmente con el molde de oro (remoto: `asana.md`, `klaviyo.md`; token: `todoist.md`; **no** uses `alegra.md` de molde: está retirada por datos incorrectos).
4. Escribe/revisa: ficha `en` y `es` (localizadas de verdad, mismas secciones), `markets` (códigos ISO; `GLOBAL` solo si de verdad es mundial), casos de uso, logo (`public/connectors/<slug>.svg`, máx. 2 intentos; si no, el de reserva y anótalo en "Logos pendientes"), fila en `SOURCES.md`.
5. `node scripts/verify-connector.mjs --file content/connectors/en/<slug>.md --file content/connectors/es/<slug>.md --write`.
6. **Remoto con login:** `node scripts/smoke-remote-login.mjs --slugs <slug>` debe imprimir `OK`. Si dice `no-dcr` → añade a `REMOTE_WITHOUT_DCR` y deja `installableForAi:false`. Si dice `http-404` → la URL está mal.
7. Tests: `npx vitest run src/lib src/app/api/marketplace scripts` y `npx tsc --noEmit`.
8. PR a `main` con la línea `App PR: no aplica — la app consume el catálogo`. Espera la supervisión verde. **Segunda revisión independiente** si hubo arreglos.
9. Mergea solo con todo en verde. Tras el deploy, el catálogo llega a la app en ≤10 min y a la landing en ≤1 h.

### Camino "no hay MCP oficial" (`needs_own_build`)
Hay API pública pero no MCP. Opciones: (a) esperar/pedir al vendor su MCP, (b) construir un MCP propio en el monorepo `~/projects/terminalsync-mcps` (privado; modelo: `packages/siigo`), con herramientas **solo donde la API documentada lo permite**, escrituras con `readOnlyHint` falso, `*_READ_ONLY` global, sin reintentos en escrituras, tests sin red, README honesto ("proyecto de la comunidad, no es del proveedor; no probado contra cuenta real"), y publicación en npm **solo con decisión de JM** (`publish.yml` manual, dry-run por defecto). **Antes de construir, confirma que el vendor no tiene ya uno** (se pasó por alto el de Siigo y el de World Office).

### Si el proveedor exige cliente OAuth propio (Zoom, Google, QuickBooks, a veces Alegra)
No se arregla con una ficha. Hace falta que **TerminalSync registre su propia app** con el proveedor y que la app de escritorio use ese `client_id` (con `mcp-remote` soporta `--static-oauth-client-info` / `--static-oauth-client-metadata`). Trabajo humano (JM abre la cuenta de desarrollador) + código en la app. Existe un handoff para esto (`docs/handoffs/espana/` y el handoff de Zoom en el historial de esta conversación): una sola pieza desbloquea Google, Zoom y QuickBooks.

---

## 6. Gotchas reales (cada uno costó un error)

1. **GLM cierra "con éxito" tras más turnos que `--max-turns`** y la acción lo reporta como fallo. Por eso `research` y `review` usan `tolerate-failure: "true"`; **build y fix NO** (deben fallar fuerte). Los loops de curación agotan 80 turnos (~7 USD por corrida); el rescate (`loop-salvage.sh`) sube lo escrito como WIP.
2. **`success()` implícito**: un job que depende de uno rojo se salta. El corrector usa `always()`.
3. **`mcp-remote` instala `@latest`** en cada corrida: un cambio suyo puede romper el login sin que nos enteremos. Hay un smoke semanal en la supervisión (martes).
4. **Siigo:** el recurso OAuth real es `https://mcp.siigo.com/mcp-adapter` (la raíz da 404). Pide credenciales de API que Siigo entrega al cliente; la ficha lo debe decir.
5. **Asana:** `/v2/mcp` exige cliente pre-registrado; `/sse` sí llega al login (es el endpoint anterior de Asana, riesgo de retiro).
6. **Mercado Pago, Intercom (EE. UU./UE), Pipedrive (beta):** requisitos propios del proveedor; el login puede completarse y aun así el cliente no poder usarlo.
7. **Reviewer ≠ autor.** Un corrector que "arregla" sin nueva revisión introdujo o dejó errores (Alegra).
8. **Las cifras de relevancia/mercado de terceros son suposiciones** hasta ver una fuente. Márcalas.
9. **Los PRs de loops** llegan 15 commits detrás de `main` y chocan en `SOURCES.md` (conserva **todas** las filas de ambos lados).
10. **No toques conectores ajenos** en un PR de una integración (un PR anterior cambió 7 logos ajenos y fue rechazado).
11. **BSD sed en macOS** no entiende `\b`; usa Python o `perl` para reemplazos.
12. **El panel de Contexto** muestra "falta login" solo si el conector remoto ya está instalado; un conector bloqueado ni aparece para instalar.

---

## 7. Qué buscar: criterios y mapa de oportunidades

### Criterios de priorización (en este orden)
1. **Lo usan miles de pymes** en el mercado (fuente, no intuición).
2. **Tiene MCP oficial o API pública** y un camino de login que `mcp-remote` completa (smoke OK).
3. **Probable de verificar con cuenta gratuita o sandbox** (así se puede probar de verdad).
4. **Valor en el chat:** lectura útil + al menos una acción que el dueño pediría ("crea", "envía", "concilia").
5. **Esfuerzo bajo**: molde B con DCR < molde A con token < construir MCP propio < cliente OAuth propio.

### Estado por mercado y candidatos (verifica antes de actuar; lo marcado "conocimiento general" no está verificado)

**España**
- En catálogo: Holded, Qonto, MONEI (Bizum), Brevo, PayPal. Factorial en `soon` (rehacer).
- Candidatos con API sin MCP (`needs_own_build`): **Quipu** (autónomos, la primera), Billin, Woffu, PayFit, Sage Active, Revolut Business. SumUp: tiene MCP remoto pero su login no completa con `mcp-remote` (sin DCR); camino alterno `@sumup/mcp` con API key.
- Pendiente de verificar: Sesame HR, FacturaDirecta, Factuarea, GoCardless (MCP vivos encontrados por sondeo de host; sin documentación oficial hallada para Sesame).
- Veri*Factu obliga a los clientes (no a TerminalSync): los conectores de contabilidad **no deben emitir ni modificar facturas fiscales**.

**Colombia**
- En catálogo: Siigo, Mercado Pago, Tiendanube. Alegra retirada (reabrir con token real). World Office: **espera respuesta del proveedor** (tiene un conector de IA anunciado en su plan Enterprise y una API de ~110 operaciones; no construir hasta confirmar que no hay MCP oficial).
- `needs_own_build`: Wompi (pasarela de Bancolombia).
- Por investigar: Bold, PayU, Addi, Treinta (conocimiento general, sin verificar).

**México**
- En catálogo: Mercado Pago, Tiendanube, Fintoc. Conekta en `soon` (rehacer).
- `needs_own_build`: Facturapi (CFDI 4.0), Bsale.
- Por investigar: Contpaqi, Aspel, Clip, Konfío, Bind ERP.

**Argentina / Chile / Perú**
- En catálogo: Mercado Pago (AR, CL, PE), Tiendanube (AR, CL), Fintoc (CL).
- `needs_own_build`: Bsale (CL/PE), Defontana (CL/PE).
- Mercado Libre: `skip` (su MCP oficial es para documentación de desarrolladores). Revisar si publican un MCP de vendedor.
- Por investigar: Nubox, Flow, Khipu, Transbank (CL), Afip/Facturante, Ualá (AR), Yape (PE) (conocimiento general, sin verificar).

**Estados Unidos / Canadá**
- En catálogo: Gusto, Ramp, Square, Xero, HubSpot, Slack, Notion, Asana, Linear, Pipedrive, Stripe, PayPal, Intercom…
- **QuickBooks**: `needs_own_build` (Intuit: repo git sin npm ni endpoint remoto; OAuth exige registrar una app propia; sandbox gratuito). Es el contable más usado en EE. UU.; se desbloquea con el cliente OAuth propio.
- Canadá usa las herramientas de EE. UU. y las globales; casi no hay herramientas propias. FreshBooks y Wave estaban en SKIP (sin oficial).
- Por investigar: ADP, Rippling, Bill.com, Wave, Housecall/Jobber (servicios locales), Calendly ya está.

**Globales de alto valor que faltan (bloqueadas hoy)**: **Gmail, Google Calendar/Sheets/Drive**, **WhatsApp**, **Zoom**, **Shopify**, **Outlook/Microsoft**. Todas dependen de un trámite o de un cliente OAuth propio.

### Importante: Outlook/Hotmail
El **Inbox de la app** ya lee Gmail y Outlook/Hotmail por un carril propio (`src-tauri/src/microsoft_mail.rs`, permiso `Mail.Read`; app de Microsoft "TerminalSync Mail Reader"; login comprobado con captura el 2026-10-25), **separado del catálogo de integraciones**. El correo se ve en el Inbox y solo llega a la IA al pulsar "Send to a workspace". No es una ficha del catálogo. Documentos: `docs/handoff-lectura-correo-gmail-hotmail.md`, `docs/inbox-flag.md` (repo app).

---

## 8. Backlog accionable (orden sugerido)

1. **Rehacer Factorial y Conekta** (fichas en `soon`): re-ejecutar pipeline o PR manual con revisión; ambos tienen MCP oficial según su investigación.
2. **Re-verificar todas las remotas con login**: correr `node scripts/smoke-remote-login.mjs --all` y registrar el resultado; abrir un issue por cada FAIL.
3. **Probar con cuenta real** (una persona): una sola prueba de punta a punta con un proveedor de plan gratuito (Linear, Asana o Canva) en una build de la app con el login. Es lo que más reduce la incertidumbre. El agente prepara el plan; no puede crear cuentas.
4. **Lista de sandbox/plan gratuito por integración** (de las que están en `login-pending`): fuente oficial, qué probar, quién lo hace. Hay un borrador en `docs/handoffs/espana/22-handoff-pruebas-con-cuenta.md`.
5. **Candidatos `needs_own_build` por prioridad de mercado**: Quipu (ES), Wompi (CO), Facturapi (MX), Bsale (CL/MX/PE). Para cada uno: confirmar ausencia de MCP oficial, verificar API, proponer construcción en `terminalsync-mcps`. **No publicar en npm sin decisión de JM.**
6. **Alegra**: abrir un hilo con soporte de Alegra para la URL y auth reales del MCP; con token real, rehacer la ficha.
7. **World Office**: esperar respuesta; si hay MCP, catalogar como Siigo.
8. **Casos de uso**: cada integración nueva trae los suyos (`content/use-cases/cases/<slug>-NNN.json` con `connectors: [slug]`); el 2026-10-14 faltaban casos para supabase, todoist, twitter y firecrawl; las integraciones añadidas después (Tiendanube, Fintoc, Holded, Qonto, MONEI, Brevo, PayPal, Pipedrive, Linear, Intercom…) hay que revisarlas con `src/lib/__tests__/connector-use-cases.test.ts` y `content/use-cases/`.
9. **Bloqueo del cliente OAuth propio** (Google, Zoom, QuickBooks): coordinar con JM; sin su trámite no avanza.
10. **Mantenimiento**: revisar mensualmente las URLs de `SOURCES.md` (los vendors cambian endpoints sin avisar: Alegra, Siigo).

---

## 9. Qué NO puede hacer el agente (necesita a JM o a un humano)

- Crear cuentas de proveedores, completar logins con credenciales, registrar apps OAuth propias (Google, Zoom, Intuit), contratar o pagar planes.
- Publicar en npm el MCP propio, activar `INTEGRATION_AUTOMERGE`, tocar Stripe/Vercel/Supabase.
- Mergear en el repo de la app (lo hace el coordinador). Buildear/instalar el `.app` (Regla 9 del repo app).
- Confirmar en una build real que un login funciona: solo una persona con cuenta.

---

## 10. Qué reportar al terminar cada tarea

Un reporte corto en español, en hora de Colombia: qué integración, veredicto, URL/PR, qué verificaste (con el comando) y qué **no** verificaste, riesgos, y qué decisión humana falta. Si algo falla, di cuál es el fallo exacto, no lo suavices.

## Archivos de referencia
Repo web: `docs/integration-pipeline.md`, `docs/integration-supervision-loop.md`, `docs/connector-curation-loop.md`, `docs/integration-loop-two-pr-policy.md`, `content/connectors/SOURCES.md`, `docs/handoffs/espana/*`. Repo app: `CLAUDE.md`, `.claude/skills/*`, `docs/handoff-lectura-correo-gmail-hotmail.md`, `docs/inbox-flag.md`, `docs/team-shared-spaces-mvp.md`.
