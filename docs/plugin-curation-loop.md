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

### 2026-08-02 — focus: tax plugins for small business owners

Focus input: "TaxBandits, QuickBooks, Odoo, Xero, 1099, W-9, W-2, payroll tax filing, bookkeeping reports."

- **Shipped:** `xero` Plugin (`content/plugins/{en,es}/xero.md`) — bundles the existing `xero` connector (invoices, aged receivables, payments, P&L/balance sheet, already `status: available`) with the existing `internal-comms` skill (drafts the payment-reminder follow-up), mirroring the already-shipped `stripe` Plugin's collections pattern. Xero is the only piece in this focus area with both a publishable connector and a skill that genuinely reinforces it.
- **Skipped/deferred (no connector to bundle — Connector Loop tasks, not this loop's):**
  - **QuickBooks** — already SKIP in `content/connectors/SOURCES.md` (2026-07-23): only a community `quickbooks-mcp` package exists, Intuit does not publish an official npm server. Reconfirmed still SKIP on 2026-08-02.
  - **Odoo** — new SKIP, documented in `content/connectors/SOURCES.md`: `odoo-mcp` on npm is community-maintained (not the Odoo org), fails the official-publisher gate. `@odoo/mcp` does not exist.
  - **TaxBandits** — new SKIP, documented in `content/connectors/SOURCES.md`: no npm package exists at all (`taxbandits-mcp` / `@taxbandits/mcp` both 404). No official or community MCP server to evaluate.
  - **1099 / W-9 / W-2 e-filing, payroll tax filing** — these are the actual jobs TaxBandits/QuickBooks would cover; with neither connector available, no Plugin can honestly claim this capability. The shipped `xero` Plugin's body explicitly discloses this gap rather than overclaiming.
- **Not pursued:** pairing Xero with a document skill (e.g. `xlsx`) for "bookkeeping reports" was considered, but `xlsx` is a generic spreadsheet skill with no Xero- or bookkeeping-specific behavior to demonstrate — internal-comms + Xero's own follow-up use case was the stronger, more honest bundle.
