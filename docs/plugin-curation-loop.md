# Plugin Curation Loop protocol

The Plugin Curation Loop packages existing pieces into **Plugins** (product packs:
a connector + the skill(s) that teach the agent to use it well). It is a
**packaging loop**, not a sourcing loop — it does **not** pull new npm packages.
It sits on top of two loops that supply its raw pieces:

- the **Connector Curation Loop** (`docs/connector-curation-loop.md`) supplies the connector piece;
- the **Skills** rules (`content/skills/RULES.md`) supply the skill piece.

Its gate is `content/plugins/RULES.md`.

## Run shape

1. Start from the current `origin/main`.
2. Create a fresh branch for the curation run.
3. Pick candidate **products** through the persona filter (`content/connectors/SOURCES.md` → "Filtro de persona"): a business-owner product where bundling a connector with its usage-skill genuinely helps (Accio's canonical example: Gmail MCP + a skill for its syntax).
4. Verify both pieces already exist and are publishable:
   - the **connector** is in `content/connectors/{en,es}` and passed the Connector Loop gate (official publisher + npm/remote); if it's missing, that's a Connector Loop task first, not this one;
   - the **skill(s)** are in `content/skills/{en,es}` and pass `content/skills/RULES.md` (evals, honesty, Veredicto for decision skills); a public skill is required because the loader composes only publishable pieces.
5. Write the Plugin in `content/plugins/en` and `content/plugins/es` using `content/plugins/RULES.md`: reference the pieces **by slug** (`connectorSlug` + `skillSlugs`) — never duplicate their content. At least one real piece; value is highest with both.
6. **I18n gate before PR:** `tagline`, `description`, and body copy must be localized in both `content/plugins/en` and `content/plugins/es`; references stay identical.
6. Source/create the Plugin logo under `public/plugins/<slug>.svg`.
7. Keep ES/EN strict parity. Status `soon` if any referenced piece is `soon`.
8. Validate: `vitest run src/lib/plugins.test.ts` (composition resolves the real pieces) + `tsc`. Add a loader/catalog test for the new Plugin when it exercises a new shape.
9. Open the **landing/web draft PR**.
10. Open the **app mirror draft PR** in `jmggaravito-sudo/terminal-sync` following `docs/integration-loop-two-pr-policy.md` so the desktop Integraciones surface mirrors the Plugin correctly.
11. Stop. Do not merge and do not push to `main` (this repo merges web via the owner/coordinator).

## What makes a good Plugin (vs a Kit)

- A **Plugin** is one **product** (Gmail, Shopify, SEO): its connector + its usage skill(s).
- A **Kit** is one **role/job** (Business Owner): several Plugins.
- If the bundle is "a whole workflow across several products", it's a Kit, not a Plugin.

## Run-history registration

Plugin runs reuse the same `/admin/loop-runs` panel as the Connector Loop. After
the draft PR exists, record the completed run with `--kind plugins`:

```bash
LOOP_RUNS_ENDPOINT="https://terminalsync.ai/api/internal/loop-runs" \
LOOP_RUNS_WRITE_TOKEN="$LOOP_RUNS_WRITE_TOKEN" \
node scripts/record_loop_run.mjs \
  --kind plugins \
  --found 1 \
  --skipped 2 \
  --items "gmail" \
  --pr "https://github.com/jmggaravito-sudo/terminalsync-web/pull/123"
```

Number semantics:

- `--found`: plugins added/promoted in this run.
- `--skipped`: candidate plugins documented as SKIP/deferred in this run.
- `--items`: landing slugs for the plugins added/promoted, so `/admin/ops/loop-runs` can show direct `/es/plugins/<slug>` links.

## Landing-first sync gate

Plugin runs follow `docs/integration-loop-two-pr-policy.md`: **landing PR first, always.** An app PR is required only when the Plugin needs desktop code it doesn't have — which for Plugins is more common than for plain connectors, since bundling OAuth, secrets or first-party flows often does need a real surface change. When the generic renderer already handles it, no app PR: state `App PR: no aplica — la app consume el catálogo`. What must never happen is an app PR made of hand-written fixtures asserting a file that doesn't exist — that is what the old mandatory-mirror rule produced.

## Run log

### 2026-08-17 — automated run, no focus input given

**Shipped 3 Plugins**, each pairing an already-published, `available` connector with an already-evaluated, `available` skill (both resolve through the loader and pass the `/raw` delivery gate):

- **meta-social** (`marketing`) — Meta Social connector (organic Instagram + Facebook Page publishing, official Meta Graph API, approval-gated) + Social Content Batch (`contenido-social`). The skill's own scope line names "Instagram, Facebook, LinkedIn, TikTok" — Meta Social covers exactly the Instagram/Facebook subset of that with real publish tools, so the plugin body is explicit that LinkedIn/TikTok drafts still get posted by hand. This is the honest version of the twitter/wordpress pairing the 2026-08-10 run declined: here the connector's real capability is a genuine subset of the skill's claimed scope, not an unsupported platform.
- **dropbox** (`productivity`) — Dropbox connector (first-party, search + temporary/public links) + Doc Co-Authoring (`doc-coauthoring`). Same mold as the already-shipped `gdrive` and `notion` Plugins (search-and-write-and-file, one flow); Dropbox's real tools (search, temporary link, gated public share) support the "find a prior doc as reference, write the new one, hand back a link" story without inventing capability.
- **gusto** (`operations`) — Gusto connector (official, remote/OAuth, **read-only** payroll/employee/contractor data) + Tax Prep Checklist (`tax-prep-checklist`). Chosen over `quarterly-tax-estimate-prep` (see Skipped below): Tax Prep Checklist's intake literally asks "do you have employees / contractors / did anything change this year", which is exactly what Gusto's roster, contractor-payment, and termination/rehire tools answer directly — no invented capability, and Gusto's read-only nature matches the skill's own "never estimates what you owe" boundary.

**Skipped / deferred, documented for the other Loops:**

- **`cotizaciones` (Quotes & Estimates)** — finance skill, available, no `catalogReady:false` blocker, but no connector in the catalog gives it real reinforcement without overclaiming. `square` was considered (it lists an "invoices" service in its catalog), but its actual tools are a generic `get_service_info`/`get_type_info`/`make_api_request` gateway with no invoicing-specific tool named in `content/connectors/SOURCES.md` — bundling it here would claim a capability the connector's own documented surface doesn't clearly support. Left as a candidate for a future run once a connector exposes a named invoicing/quote tool.
- **`quarterly-tax-estimate-prep`** — finance skill, available, but it's scoped to freelancer/solo self-employment tax (its own inputs are "your net profit", safe-harbor from *your* prior liability). Gusto is a team-payroll connector — it reports what a business pays *others*, not the owner's own net profit across income sources, so pairing them would overclaim what Gusto's read-only data actually feeds. No other connector in the catalog exposes an owner's aggregate income/expense picture. Deferred — a bank-feed or full-ledger connector (Xero already covers invoicing/P&L, but is already shipped bundled with `internal-comms`) would be the real pairing.

**Also noted, not actioned this run:** the already-shipped `higgsfield` and `ideogram` Plugins bundle `meta-ads-creator`, but two more specific skills now exist and pass the catalog gate — `higgsfield-video-director` and `ideogram-creative-director`, each written for that exact connector's real limits (15s cap, async jobs, Soul/character reuse for Higgsfield; exact in-image text and remix plan for Ideogram). Swapping the bundled skill on a published Plugin is an edit to a live file, not a new pairing, and the 2026-08-02 log already documents the cost of two runs touching the same slug without seeing each other — left for a run that owns that specific edit deliberately rather than as a side effect of an unrelated pass.

Validation: `vitest run src/lib/plugins.integrity.test.ts src/lib/plugins.test.ts src/lib/logoAssets.test.ts` (20/20 pass, includes the neutral-Spanish ratchet test) + `tsc --noEmit` (clean) + full suite (`vitest run`, 251/251). All 3 new plugins reuse their connector's existing, committed logo (`/connectors/<slug>.svg`) — no new logo assets needed. ES copy written in neutral Spanish (tú-form) per `src/lib/__tests__/voz-neutral-catalogo.test.ts` — new files are not grandfathered into the existing voseo debt.


### 2026-08-10 — automated run, no focus input given

**Shipped 2 Plugins**, both pairing an already-published, `available` connector with an already-evaluated, `available` skill (evals + fixtures on disk for both):

- **zapier** (`productivity`) — Zapier connector + Zapier Automation Blueprint. Closes the gap the 2026-07-31 run documented as deferred: back then Zapier had a connector but "no skill in `content/skills/{en,es}` teaches a specific Zapier workflow." `zapier-automation-blueprint` now exists and is a near-literal match — it names `mcp.zapier.com`, the exact read/write action split, and the approval-gate pattern the connector's own body warns about. No invented capability: the skill designs the blueprint, the connector is what a user's own Zapier MCP server executes.
- **google-sheets** (`operations`) — Google Sheets connector + 1099/W-9 Organizer. The connector's real tools (`sheets_values_get`/`sheets_values_batch_get`) read exactly the kind of contractor-payment tab a small business already keeps; the skill sorts that list into needs-a-1099 / doesn't / missing-W-9 / unresolved per IRS-stated rules. Chosen over pairing 1099/W-9 Organizer with Xero (already shipped, paired with Internal Comms, and its plugin body explicitly discloses it does *not* cover 1099/W-9/W-2 — reopening that file to add a second, unrelated skill would blur one product into two jobs, which is what a Kit is for).

**Deferred / SKIP, documented for the other Loops:**

- **klaviyo (marketing, email/SMS)** — connector is `available`, and `lifecycle-email` is the obvious skill pairing (both literally about lifecycle email), but the skill carries `catalogReady: false` — it fails the Skill Loop's publication gate today. Deferred: un-flag `lifecycle-email` in the Skill Loop, then pair it with `klaviyo` here.
- **zoom (productivity, meetings)** — connector is `available` and `meeting-notes` is the natural pairing (Zoom Workspace's own capabilities include meeting summaries/transcripts, which is exactly what Meeting Notes turns into decisions/owners/action items), but `meeting-notes` carries `catalogReady: false` **and** only declares `vendors: ["claude", "codex"]` — it fails both the publication gate and the "las 4 IAs" cross-provider rule (`content/skills/RULES.md`). Deferred to the Skill Loop: publish `meeting-notes` for all three vendors first.
- **shopify / klaviyo (referral-program)** — `referral-program` is a strong ecommerce-adjacent skill, but it also carries `catalogReady: false`. Same blocker as above; not this loop's to fix.
- **asana (productivity, tasks/projects)** — connector is `available` (OAuth, business-first), but no skill in `content/skills/{en,es}` teaches a specific Asana workflow the way `zapier-automation-blueprint` does for Zapier. Forcing a generic skill onto it would be the same overclaim the 2026-07-31 run avoided for bare Zapier. Left as a Skill Loop candidate: an Asana-specific task-triage or status-digest skill would make this pairing real.
- **twitter / wordpress (marketing, content)** — both connectors are `available`, and `contenido-social` is close in spirit (organic social content), but its own body scopes to "Instagram, Facebook, LinkedIn, TikTok" — it doesn't claim X or WordPress-blog specifically, and pairing it here would be exactly the kind of unsupported-capability claim `RULES.md` warns against (see the 2026-08-02 Shopify/`carrito-abandonado` precedent). Left as candidates once a skill explicitly covers that surface.

Validation: `vitest run src/lib/plugins.integrity.test.ts src/lib/plugins.test.ts src/lib/logoAssets.test.ts` (17/17 pass) + `tsc --noEmit` (clean). Both new plugins reuse their connector's existing, committed logo (`/connectors/<slug>.svg`) — no new logo assets needed.


### 2026-08-02 — "plugins para empresarios: ventas, ecommerce, soporte al cliente, marketing, finanzas, operaciones, reportes ejecutivos" (automated)

**Shipped 5 Plugins**, each an already-published connector + an already-evaluated skill, picked so the pairing reflects what the connector's real tools can actually feed the skill (no invented capability):

- **shopify** (`ecommerce`) — Shopify connector + Win Back Dormant Customers. Chose `winback-dormidos` over `carrito-abandonado`: the Shopify connector's tools (`shopify_list_orders`, `shopify_search_customers`) expose fulfilled-order history (last purchase date, amount), which is exactly what win-back segmentation needs — it does **not** expose abandoned-checkout/cart-level events, so bundling the cart-recovery skill here would have been an unsupported claim. Covers ecommerce + ventas.
- **meta-ads** (`marketing`) — Meta Ads (read-only insights) connector + Meta Ads Creator. The connector flags what's underperforming; the skill hands you fresh creative to test — a real "see the problem → get the next move" loop.
- **google-business** (`marketing`) — Google Business connector + Ask for Reviews. One side gets new reviews in (asking happy customers), the other watches/replies to the ones that land — both halves of the same reputation loop.
- **hubspot** (`sales`) — HubSpot connector + Internal Comms. Mirrors the already-shipped Stripe + Internal Comms pattern ("who needs a nudge" → drafted, approved, sent) applied to CRM follow-ups instead of billing.
- ~~**xero** (`operations`) — Xero connector + Doc Co-Authoring.~~ **No se publicó así.** Para cuando este PR se mergeó (2026-08-09), `xero` ya estaba vivo pareado con Internal Comms (corrida del 2026-08-02 de abajo), que es el cobro de facturas vencidas. Se conservó el publicado: cambiarlo habría alterado un plugin en producción. Es el costo de que dos corridas del loop trabajen sobre el mismo slug sin verse.

**Deferred / SKIP, documented for the other Loops:**

- **Intercom (soporte al cliente)** — the connector (`content/connectors/en/intercom.md`) is published and support-first, but no publishable skill pairs with it: the obvious candidate, `email-drafter`, is `status: soon` + `hidden: true` and fails the Skill Loop's delivery gate, and it's written for internal/client email tone, not inbox-triage. Shipping Intercom as a connector-only Plugin was considered (the rule allows it) but rejected this run for low marginal value over just browsing the Connector — no skill piece to make it a real "product pack" yet. Deferred to the Skill Loop: publish a support-reply drafting skill (or un-hide/re-mold `email-drafter`), then pair it with Intercom here.
- **Shopify-adjacent ecommerce skills** (`rfm-segmentacion`, `ltv-cohortes`, `carrito-abandonado`, `promos-cupones`) — all real, evaluated, available skills that would strengthen a Shopify bundle, but stacking them all into one Plugin file would blur "one product" into a role bundle. That's what a **Kit** is for (`content/kits/RULES.md`): a future "Ecommerce Growth Kit" referencing the `shopify` Plugin plus these skills is the right home for them, not a bigger `shopify.md`. Left as a candidate for the Kit Loop.

Validation: `vitest run src/lib/plugins.integrity.test.ts src/lib/plugins.test.ts src/lib/logoAssets.test.ts` (17/17 pass) + `tsc --noEmit` (clean). All 5 new plugins reuse their connector's existing, committed logo (`/connectors/<slug>.svg`) — no new logo assets needed.


### 2026-08-02 — focus: tax plugins for small business owners

Focus input: "TaxBandits, QuickBooks, Odoo, Xero, 1099, W-9, W-2, payroll tax filing, bookkeeping reports."

- **Shipped:** `xero` Plugin (`content/plugins/{en,es}/xero.md`) — bundles the existing `xero` connector (invoices, aged receivables, payments, P&L/balance sheet, already `status: available`) with the existing `internal-comms` skill (drafts the payment-reminder follow-up), mirroring the already-shipped `stripe` Plugin's collections pattern. Xero is the only piece in this focus area with both a publishable connector and a skill that genuinely reinforces it.
- **Skipped/deferred (no connector to bundle — Connector Loop tasks, not this loop's):**
  - **QuickBooks** — already SKIP in `content/connectors/SOURCES.md` (2026-07-23): only a community `quickbooks-mcp` package exists, Intuit does not publish an official npm server. Reconfirmed still SKIP on 2026-08-02.
  - **Odoo** — new SKIP, documented in `content/connectors/SOURCES.md`: `odoo-mcp` on npm is community-maintained (not the Odoo org), fails the official-publisher gate. `@odoo/mcp` does not exist.
  - **TaxBandits** — new SKIP, documented in `content/connectors/SOURCES.md`: no npm package exists at all (`taxbandits-mcp` / `@taxbandits/mcp` both 404). No official or community MCP server to evaluate.
  - **1099 / W-9 / W-2 e-filing, payroll tax filing** — these are the actual jobs TaxBandits/QuickBooks would cover; with neither connector available, no Plugin can honestly claim this capability. The shipped `xero` Plugin's body explicitly discloses this gap rather than overclaiming.
- **Not pursued:** pairing Xero with a document skill (e.g. `xlsx`) for "bookkeeping reports" was considered, but `xlsx` is a generic spreadsheet skill with no Xero- or bookkeeping-specific behavior to demonstrate — internal-comms + Xero's own follow-up use case was the stronger, more honest bundle.


### 2026-07-31 — focus "higgsfield, zapier, notebooklm, ideogram"

- **Shipped (2):**
  - `higgsfield` — bundles the `higgsfield` connector (image/15s video generation, remote/OAuth) with the `meta-ads-creator` skill. The skill's mobile/home-video ad angle needed an actual UGC-style video generator; Higgsfield is the natural pairing.
  - `ideogram` — bundles the `ideogram` connector (image generation/remix, remote/OAuth) with the `meta-ads-creator` skill. The skill writes five ad concepts with an image direction per concept; Ideogram renders the actual visual instead of leaving the owner to prompt an image tool by hand.
- **Skipped/deferred (2):**
  - `zapier` — the connector exists and is `available`, but it is a many-to-many automation hub (9,000+ apps), not a single product with one usage pattern. No skill in `content/skills/{en,es}` teaches a specific Zapier workflow, and forcing a generic skill (e.g. Internal Comms) onto it would misrepresent a broad automation hub as a one-product Plugin. Deferred: a future Skill Loop candidate could target one concrete Zapier workflow (e.g. "capture a lead into a sheet + task"); until then this is not a Plugin.
  - `notebooklm` — no connector for NotebookLM exists in `content/connectors/{en,es}` or `content/connectors/SOURCES.md`. This is a Connector Loop task first (source the official NotebookLM MCP/API surface, if one exists) — the Plugin Loop does not source new connectors.
- Validation: `vitest run src/lib/plugins.integrity.test.ts src/lib/plugins.test.ts src/lib/logoAssets.test.ts` + `tsc --noEmit`.
- Landing/web PR and app mirror PR opened per `docs/integration-loop-two-pr-policy.md`; see `/admin/ops/loop-runs` for the recorded run.
