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

### 2026-08-02 — "plugins para empresarios: ventas, ecommerce, soporte al cliente, marketing, finanzas, operaciones, reportes ejecutivos" (automated)

**Shipped 5 Plugins**, each an already-published connector + an already-evaluated skill, picked so the pairing reflects what the connector's real tools can actually feed the skill (no invented capability):

- **shopify** (`ecommerce`) — Shopify connector + Win Back Dormant Customers. Chose `winback-dormidos` over `carrito-abandonado`: the Shopify connector's tools (`shopify_list_orders`, `shopify_search_customers`) expose fulfilled-order history (last purchase date, amount), which is exactly what win-back segmentation needs — it does **not** expose abandoned-checkout/cart-level events, so bundling the cart-recovery skill here would have been an unsupported claim. Covers ecommerce + ventas.
- **meta-ads** (`marketing`) — Meta Ads (read-only insights) connector + Meta Ads Creator. The connector flags what's underperforming; the skill hands you fresh creative to test — a real "see the problem → get the next move" loop.
- **google-business** (`marketing`) — Google Business connector + Ask for Reviews. One side gets new reviews in (asking happy customers), the other watches/replies to the ones that land — both halves of the same reputation loop.
- **hubspot** (`sales`) — HubSpot connector + Internal Comms. Mirrors the already-shipped Stripe + Internal Comms pattern ("who needs a nudge" → drafted, approved, sent) applied to CRM follow-ups instead of billing.
- **xero** (`operations`) — Xero connector + Doc Co-Authoring. Turns "read the P&L / aged receivables" into an actual structured report with an executive summary. Covers finanzas + reportes ejecutivos + operaciones in one product.

**Deferred / SKIP, documented for the other Loops:**

- **Intercom (soporte al cliente)** — the connector (`content/connectors/en/intercom.md`) is published and support-first, but no publishable skill pairs with it: the obvious candidate, `email-drafter`, is `status: soon` + `hidden: true` and fails the Skill Loop's delivery gate, and it's written for internal/client email tone, not inbox-triage. Shipping Intercom as a connector-only Plugin was considered (the rule allows it) but rejected this run for low marginal value over just browsing the Connector — no skill piece to make it a real "product pack" yet. Deferred to the Skill Loop: publish a support-reply drafting skill (or un-hide/re-mold `email-drafter`), then pair it with Intercom here.
- **Shopify-adjacent ecommerce skills** (`rfm-segmentacion`, `ltv-cohortes`, `carrito-abandonado`, `promos-cupones`) — all real, evaluated, available skills that would strengthen a Shopify bundle, but stacking them all into one Plugin file would blur "one product" into a role bundle. That's what a **Kit** is for (`content/kits/RULES.md`): a future "Ecommerce Growth Kit" referencing the `shopify` Plugin plus these skills is the right home for them, not a bigger `shopify.md`. Left as a candidate for the Kit Loop.

Validation: `vitest run src/lib/plugins.integrity.test.ts src/lib/plugins.test.ts src/lib/logoAssets.test.ts` (17/17 pass) + `tsc --noEmit` (clean). All 5 new plugins reuse their connector's existing, committed logo (`/connectors/<slug>.svg`) — no new logo assets needed.
