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

### 2026-07-31 — focus "higgsfield, zapier, notebooklm, ideogram"

- **Shipped (2):**
  - `higgsfield` — bundles the `higgsfield` connector (image/15s video generation, remote/OAuth) with the `meta-ads-creator` skill. The skill's mobile/home-video ad angle needed an actual UGC-style video generator; Higgsfield is the natural pairing.
  - `ideogram` — bundles the `ideogram` connector (image generation/remix, remote/OAuth) with the `meta-ads-creator` skill. The skill writes five ad concepts with an image direction per concept; Ideogram renders the actual visual instead of leaving the owner to prompt an image tool by hand.
- **Skipped/deferred (2):**
  - `zapier` — the connector exists and is `available`, but it is a many-to-many automation hub (9,000+ apps), not a single product with one usage pattern. No skill in `content/skills/{en,es}` teaches a specific Zapier workflow, and forcing a generic skill (e.g. Internal Comms) onto it would misrepresent a broad automation hub as a one-product Plugin. Deferred: a future Skill Loop candidate could target one concrete Zapier workflow (e.g. "capture a lead into a sheet + task"); until then this is not a Plugin.
  - `notebooklm` — no connector for NotebookLM exists in `content/connectors/{en,es}` or `content/connectors/SOURCES.md`. This is a Connector Loop task first (source the official NotebookLM MCP/API surface, if one exists) — the Plugin Loop does not source new connectors.
- Validation: `vitest run src/lib/plugins.integrity.test.ts src/lib/plugins.test.ts src/lib/logoAssets.test.ts` + `tsc --noEmit`.
- Landing/web PR and app mirror PR opened per `docs/integration-loop-two-pr-policy.md`; see `/admin/ops/loop-runs` for the recorded run.
