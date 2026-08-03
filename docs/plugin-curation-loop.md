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

## Two-PR app mirror gate

Plugin runs must follow `docs/integration-loop-two-pr-policy.md`: a Plugin is not fully ready with only a web catalog PR. The app mirror PR must verify install/render behavior in the desktop app, especially where a Plugin bundles connectors with OAuth, secrets, or first-party flows.

## Run log

### 2026-08-03 (automated) — 2 shipped, several deferred

**Shipped:**

- **meta-ads**: `connectorSlug: meta-ads` (first-party, read-only `ads_read` insights) + `skillSlugs: ["meta-ads-creator"]`. The connector watches what's already spending/working; the skill drafts the next batch of ad ideas informed by that — a create-then-watch loop for a business owner running their own Meta ads.
- **google-business**: `connectorSlug: google-business` (first-party, reads reviews + gated replies) + `skillSlugs: ["pedir-resenas"]`. The connector reacts to reviews that already exist; the skill proactively asks happy customers for new ones — closes the reputation loop instead of only reacting to what shows up.

Both pieces already existed and pass their respective Loop gates (`content/connectors/SOURCES.md`, `content/skills/RULES.md`); this run only composed them by slug per `content/plugins/RULES.md` (no new connector/skill content written). Plugin logos sourced/created at `public/plugins/meta-ads.svg` and `public/plugins/google-business.svg` (brand-colored, matching each connector's official color).

**Skipped / deferred (documented, not this run's scope):**

- **Shopify + ecommerce marketing skills** (`carrito-abandonado`, `rfm-segmentacion`, `winback-dormidos`, `ltv-cohortes`, `promos-cupones`) — all five skills work well off Shopify's order/customer data, but bundling a single connector with five skills at once reads closer to a whole growth workflow than one product pack. Deferred to a future Plugin run (picking the single highest-leverage skill first, e.g. abandoned-cart recovery) or to the Kit Loop (`content/kits/RULES.md`) if the intent is a bundled "ecommerce growth" role kit instead.
- **hubspot / xero / todoist / clickup / monday connectors** — no published, evaluated skill in `content/skills/{en,es}` yet teaches CRM, accounting, or task-management usage well enough to bundle. Deferred to the Skill Loop to produce the matching skill first.
- **docx / pptx / xlsx / pdf skills** — still `hidden` per the skills backlog note in `content/skills/RULES.md` (invalid category, no ES parity, no evals), so not publishable pieces yet; not eligible for a Plugin until the Skill Loop un-hides them.
- **ahrefs / wordpress / twitter connectors** — no existing skill in the catalog specifically teaches their syntax/quirks (the general-purpose `seo-auditor` and `copywriter` skills are already used elsewhere and aren't a tight enough product-specific pairing); left for a future run once a matching skill exists.

No new connector or skill packages were sourced in this run (out of scope per the Plugin Loop's packaging-only mandate).
