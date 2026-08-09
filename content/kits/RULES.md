# Kit Content Rules — Gold Mold for Marketplace Bundles

This file is the source of truth for publishing TerminalSync kits in the
marketplace catalog. It is the kits equivalent of `content/skills/RULES.md`
and `content/connectors/SOURCES.md`.

A kit is not published because the pieces are individually useful. A kit must
prove that the pieces work together for a clear job function and help a specific
user accomplish a real workflow.

## Filtro de persona (empresario-first)

Aplica el filtro de persona del Loop (definido en `content/connectors/SOURCES.md`
→ "Filtro de persona"): el norte es el **dueño de negocio no técnico**. Test de
5 segundos — *"¿un empresario lo entiende y lo usaría esta semana?"*. Los kits de
rol dev (code review, ship-app) son válidos para el segmento dev, pero **el Loop
debe priorizar kits de rol de negocio** (dueño, ventas, operaciones, finanzas,
marketing) — hoy sub-construidos. No cerrar una tanda de kits sin al menos uno
para un rol de negocio real.

## Reference pattern

TerminalSync kits follow the role-first pattern used by Anthropic's knowledge
work plugins: each bundle starts from a role or function, then combines the
domain skills and tool connections that role needs.

Use that pattern, not a tool-first catalog dump:

- Start with the role/function: marketing, sales, legal, engineering, finance,
  operations, support, research, design, or another specific job function.
- State the job the kit helps with: campaign planning, deal prep, incident
  response, contract review, close support, etc.
- Include only the skills, connectors, and CLI tools that directly support
  that job.
- Explain why each item belongs in the kit.

The model is: **purpose -> role workflow -> required pieces**. Never:
**available pieces -> generic bundle name**.

## What a kit is

A kit is a curated marketplace bundle for one type of work.

It is a first-class catalog item that expands into installable children in the
Lab. In the desktop app it maps to `BundleSummary`; each kit item declares
`items[]` entries whose `kind` is one of:

- `connector`
- `skill`
- `cli`

A kit must answer these questions clearly:

1. Who is this for?
2. What recurring job does it make easier?
3. What outcome should the user expect after installing it?
4. Why does this combination work better than installing the pieces one by one?

If the answer is only "these are good tools", it is not a kit.

## Landing-first sync gate

Every kit Loop run publishes through the **landing PR first** — it is the source of truth for `/api/marketplace/catalog`, and the desktop consumes it automatically. An **app PR is required only when the item needs desktop code** it doesn't have yet (a new surface, a special install flow, or an item that would otherwise render as a broken generic card). Do **not** open an app PR just to leave a record: that rule used to be mandatory and produced mirror PRs made of hand-written fixtures that asserted nothing — see `docs/integration-loop-two-pr-policy.md`. State `App PR: no aplica — la app consume el catálogo` in the landing body instead. Sync is verified by the desktop guard (`src/data/departamento.test.ts` + `scripts/verify-integration-loop.mjs`), not declared. If the landing PR itself cannot be created, the item is **not** ready — never compensate with an app PR that mirrors content that does not exist.

#### Cómo declarar que no hace falta app mirror

Cuando el desktop ya consume el catálogo y no hay código de app que escribir,
poné en el cuerpo del PR de landing, tal cual:

    App mirror PR: no aplica — la app consume el catálogo

El check del supervisor lo acepta y no pide el enlace. Si en cambio SÍ hay un
PR de app, enlazalo detrás de la misma etiqueta:

    App mirror PR: https://github.com/jmggaravito-sudo/terminal-sync/pull/1286

**Solo se lee lo que esté detrás de `App mirror PR:`.** Citar un PR de la app
en cualquier otra parte del texto —por ejemplo como antecedente histórico— no
cuenta, y así debe ser: antes se buscaba el patrón en todo el cuerpo y una
cita hacía que el check compilara una rama vieja y fallara por errores ajenos.

## File structure

Every published kit must ship in both languages with strict ES/EN parity:

```text
content/kits/en/<slug>.md
content/kits/es/<slug>.md
```

Rules:

- Use the same `<slug>` in both languages.
- Keep frontmatter fields equivalent across ES/EN unless the value is
  intentionally localized text.
- Keep the same body sections in both languages.
- Do not publish a kit in only one language.
- Do not add a kit directly to code without the matching content files.

## Required frontmatter

Every kit file must include these fields:

```yaml
---
name: Sales Call Prep Kit
logo: /logos/ts-kit.svg
category: sales
status: available
tagline: "Research prospects, prep meetings, and capture follow-up without rebuilding the stack each time."
description: "A coherent sales workflow bundle for account research, call preparation, and post-call follow-up."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: github
    reason: "Lets the seller inspect public/private repo context when the prospect is technical."
  - kind: skill
    slug: code-reviewer
    reason: "Gives Claude a repeatable review workflow for technical evaluation notes."
  - kind: cli
    slug: github-cli
    reason: "Lets a developer-facing seller inspect issues and PRs from the terminal when relevant."
---
```

Required field meanings:

- `name`: user-facing kit name. It must name the workflow, not just a pile of
  tools.
- `logo`: **must be the TerminalSync kit logo `/logos/ts-kit.svg`.** Kits are
  first-party TerminalSync bundles, not vendor products, so they carry the
  TerminalSync mark — never a connector/skill/vendor logo. This value is fixed;
  do not substitute a per-kit asset.
- `category`: role/function category. Use role language such as `marketing`,
  `sales`, `legal`, `dev`, `finance`, `operations`, `support`, `research`, or
  `design`. Do not categorize by vendor/tool.
- `status`: publication state. Use `available` only after verification.
- `tagline`: one-line outcome promise.
- `description`: concrete explanation of who the kit helps and what workflow it
  supports.
- `marketplaceSource`: use `terminalsync` for first-party TS kits.
- `items`: ordered list of included pieces. Each item must include:
  - `kind`: `connector`, `skill`, or `cli`.
  - `slug`: slug of a published, installable catalog item.
  - `reason`: kit-specific justification for why this item serves the kit's
    purpose.

## Required body sections

Each kit must use the same body section structure in English and Spanish.
Localize the headings, but keep the content equivalent.

English:

```md
## Who it is for

## What it helps you do

## What's included

## How to use it

## Why these pieces belong together

## Limits
```

Spanish:

```md
## Para quién es

## Qué te ayuda a hacer

## Qué incluye

## Cómo usarlo

## Por qué estas piezas van juntas

## Límites
```

Section requirements:

- **Who it is for / Para quién es**: the role, team, or user situation.
- **What it helps you do / Qué te ayuda a hacer**: the concrete workflow and
  expected result.
- **What's included / Qué incluye**: every item, grouped by `connector`, `skill`,
  and `cli`, with the same reasoning as frontmatter but in user-facing prose.
- **How to use it / Cómo usarlo**: realistic first-session steps after install.
- **Why these pieces belong together / Por qué estas piezas van juntas**: the
  coherence argument. This is mandatory; it prevents random bundles.
- **Limits / Límites**: what the kit does not do, required accounts/secrets, and
  cases where the user needs another kit or manual setup.

## Coherence rule

Every item in the kit must serve the kit's declared purpose.

For each included item, the PR must explain:

- What role-workflow step this item supports.
- Why the workflow is worse without it.
- Whether the item is required for the core promise or only optional support.
- What user action becomes possible because this item is present.

Do not include a connector, assistant, or CLI tool just because it exists in the
catalog. If the justification is generic enough to fit any kit, remove the item.

## Only published, installable pieces

A kit may include only items that are public and installable in the marketplace
catalog at the time the kit PR is opened.

### Allowed skills

Kits may include only the 7 assistant skills that passed the mold and are meant
to be public:

- `code-reviewer`
- `doc-coauthoring`
- `internal-comms`
- `mcp-builder`
- `meta-ads-creator`
- `seo-auditor`
- `skill-creator`

Do not include hidden, retired, pending, or no-mold skills. Specifically banned
until they pass review and are republished:

- `email-drafter`
- `copywriter`
- `learn`
- `deep-research`
- `slack-summarizer`
- `brand-guidelines`
- `brand-voice`

### Allowed connectors

Kits may include **any connector that is public and installable** — i.e. its
`content/connectors/en/<slug>.md` has a `manifest:` block and is not `hidden`.
This is a principle, not a frozen list, so it doesn't go stale as the catalog
grows: check the connector file before including it.

Business-relevant installable connectors a business-owner kit will reach for
(non-exhaustive): `stripe` (sales/payments), `notion`, `slack`, `airtable`,
`google-maps`, plus the dev/data ones (`postgres`, `supabase`, `github`,
`mongodb`, `pinecone`, `posthog`, `neon`, …) for technical kits.

Do not include **card-only** connectors (no `manifest:` — they render a card but
can't be installed) or `hidden` connectors. Card-only today:

- `gmail`
- `gdrive`
- `kit`
- `sqlite`
- `vercel`
- `whatsapp`

Hidden connectors are also banned even if they have a manifest.

### Allowed CLI tools

Kits may include CLI tools only when they are public and the kit explains why the
role workflow needs terminal-level execution.

Allowed today:

- `github-cli`
- `stripe-cli`
- `supabase-cli`
- `vercel-cli`
- `wrangler`

A CLI tool must never be filler. If the kit is useful to non-technical users,
explain why the CLI belongs or remove it.

## Verification gate

No kit is published because it sounds coherent. A kit PR must bring evidence.

Minimum required evidence:

1. **Installability check**: every `items[]` entry resolves to a public catalog
   item and installs in the Lab flow, or the PR explicitly blocks publication.
2. **Coherence review**: every item has a purpose-specific `reason`, and the
   body explains how the pieces work together for the declared role.
3. **Workflow smoke test**: run at least one realistic scenario for the target
   role using the installed kit. The evidence must include:
   - user goal,
   - installed items,
   - prompt or action taken,
   - expected behavior,
   - actual result or summarized result,
   - gaps found.
4. **Negative fit check**: include one workflow that the kit should not claim to
   solve. This prevents overbroad positioning.
5. **Human review**: evals are evidence, not approval. JM / human review decides
   whether the kit is coherent enough to publish.

If any item fails to install, the kit does not publish.

## Prohibitions

Do not publish a kit that:

- Promises outcomes its pieces cannot deliver.
- Includes hidden, retired, pending, card-only, or unpublished items.
- Includes connectors just because they are recognizable brands.
- Hides setup requirements, required tokens, or CLI prerequisites.
- Is a generic catch-all such as "Productivity Kit" or "Business Kit" with
  unrelated pieces inside.
- Duplicates another kit's purpose without a clear audience or workflow
  distinction.
- Uses tool/vendor categories instead of role/function categories.
- Claims end-to-end automation when the included items only provide research,
  drafting, inspection, or read-only access.
- Publishes only an English or only a Spanish version.

## PR checklist

A kit PR must include:

- ES and EN files with matching slugs.
- Required frontmatter in both files.
- `logo` set to the TerminalSync kit logo `/logos/ts-kit.svg` (never a vendor logo).
- Required body sections in both files.
- Role/function category, not tool/vendor category.
- `items[]` with `kind`, `slug`, and purpose-specific `reason` for every item.
- Only allowed public installable skills, connectors, and CLI tools.
- Installability evidence for every item.
- Coherence evidence that the combo serves the declared role workflow.
- One positive workflow smoke test.
- One negative fit check.
- Human-review note that the evidence does not self-approve publication.

Until these are present, keep the kit out of the published marketplace catalog.

## Loop run log

### 2026-08-02 — empresario-first batch (dueño, ecommerce, B2B, soporte, finanzas, marketing local, operaciones)

**Shipped (4 kits, EN/ES parity):**

- `b2b-sales-pipeline` (category: sales) — `hubspot` + `doc-coauthoring` + `internal-comms`.
- `small-business-finance` (category: finance) — `xero` + `stripe` + `doc-coauthoring`.
- `ecommerce-storefront` (category: ecommerce) — `square` + `doc-coauthoring` + `internal-comms`.
- `team-operations` (category: operations) — `clickup` + `slack` + `internal-comms`.

All items use only `kind: connector`/`kind: skill` (the two kinds `bundleItems.ts`/`isBundleItemKind` actually resolves, along with `cli`), only manifest-bearing connectors and the 7 allowed skills, and carry the fixed `/logos/ts-kit.svg` logo.

**Deferred — Customer Service kit (servicio al cliente):** the natural core connector is `intercom`, but `content/connectors/en/intercom.md` has no `manifest:` block (first-party, app-side connection) — it fails this file's literal "Allowed connectors" test (`manifest:` block required). Building a support kit instead from `notion` + `slack` + `doc-coauthoring` + `internal-comms` would duplicate 3 of the 4 items already in `docs-and-team-comms` with no distinct connector to anchor a genuinely different workflow — that reads as a relabeled kit, not a coherent new one (see "Duplicates another kit's purpose" prohibition). Deferred until either (a) the Connector Loop ships a manifest-eligible support/ticketing connector, or (b) this file gets an explicit first-party exception (see next item).

**Deferred — Local Marketing kit (marketing local):** the natural core connector is `google-business` (reviews/local listings), also first-party with no `manifest:` block, same gate failure as above. A version built from `google-maps` + `seo-auditor` + `meta-ads-creator` would overlap 2 of 3 items with the existing `marketing-campaign-seo` kit without a connector strong enough to justify a distinct local-business audience — same duplicate-purpose risk. Deferred for the same reason as Customer Service.

**Open question for a future run (not resolved here):** this file's "Allowed connectors" section defines installable as "has a `manifest:` block", which pre-dates first-party connectors (`shopify`, `meta-ads`, `meta-social`, `google-business`, `intercom`, `dropbox`) that install via the app's Settings → Integrations flow instead of an npx manifest — they are not "card-only" dead-end CTAs in the sense the "Card-only today" list means (`gmail`, `gdrive`, `kit`, `sqlite`, `vercel`, `whatsapp`), but they also don't satisfy the literal manifest test. This run treated the literal text as authoritative and excluded them rather than reinterpret the rule. If JM confirms first-party app-connected connectors should count as kit-eligible, `ecommerce-storefront` could gain `shopify` and a real Customer Service / Local Marketing kit becomes buildable — but that is a rule change, not a call for an automated run to make unilaterally.

**Separate drift note:** `content/plugins/RULES.md` ("Relationship to Kits") says a Kit's `items:` may reference `kind: plugin`. The actual resolver (`isBundleItemKind` in `src/lib/marketplace/bundleItems.ts`) only accepts `connector` / `skill` / `cli` — `plugin` is not a valid `BundleItemKind` and would be dropped/fail the `kitsIntegrity.test.ts` gate. No kit in this run uses `kind: plugin`; flagging so a future run doesn't try it and hit a silent-drop or test failure.

**Solapamiento resuelto (2026-08-09):** la corrida de abajo pidió que alguien confirmara si
`small-business-finance` y `bookkeeping-tax-handoff` se pisan, ya que los dos son `finance` y los dos
anclan en `xero`. Se publican los dos: cambian el destinatario y el artefacto — este escribe el
**resumen mensual que lee el dueño** (Xero + Stripe), el otro arma el **paquete de entrega al contador**
(Xero + Google Sheets). Si en uso real resultan indistinguibles, lo barato es bajar uno a `status: soon`.

### 2026-08-02 — tax kits for entrepreneurs (tax prep, bookkeeping cleanup, 1099, payroll tax forms, accountant handoff, SMB finance ops)

**Shipped (1 kit, EN/ES parity):**

- `bookkeeping-tax-handoff` (category: finance) — `xero` + `google-sheets` + `doc-coauthoring` + `internal-comms`. Scoped to the run-up to the accountant: read the real books (Xero, or a spreadsheet for the very common owner without accounting software), organize them into a structured handoff packet, and draft the cover note that goes with it. Not a general finance/summary kit — see the differentiation note below.

**Overlap check against a parallel, not-yet-merged Kit Curation Loop run:** a separate open PR (branch `kits-loop/empresario-2026-08-02`, not merged at the time of this run) proposes `content/kits/en/small-business-finance.md` — also category `finance`, also anchored on the `xero` connector. This run's kit deliberately targets a different audience and artifact so the two don't duplicate purpose: that kit reads Xero + Stripe and writes a **monthly financial summary for the owner** to read; this kit reads Xero (or Google Sheets, for owners without Xero) and writes an **accountant handoff packet + cover note** for an outside professional at tax time or quarter-end. Both kits' own "Why these pieces belong together" sections cross-reference this distinction. If both are ever reviewed together, JM should confirm the distinction holds; if not, they should be merged into one kit rather than published as two overlapping ones.

**Deferred / SKIP — no catalog piece exists for these parts of the focus, documented for the proper Loop instead of forced into this kit:**

- **1099 contractor compliance** (e.g. generating/e-filing 1099-NEC forms) — no connector or skill in the catalog does tax-form generation or e-filing. Candidates like Track1099/Tax1099/Avalara 1099 have no known official npm-stdio or documented remote MCP server as of this run. Candidate for a future **Connector Loop** run, not this one.
- **Payroll tax forms** (e.g. 941, state withholding filings) — no payroll-provider connector (Gusto, ADP, Rippling, QuickBooks Payroll) exists in the catalog; Xero's own payroll tools are read-oriented and scoped to orgs with Xero Payroll enabled, not a general payroll-tax-forms solution. Candidate for a future **Connector Loop** run.
- **Tax prep / filing itself** — no tax-prep or e-filing connector exists (and none of the 7 allowed skills covers tax law). This kit explicitly documents in its Limits that it organizes numbers for the accountant, it does not prepare or file returns.

None of the 7 allowed skills (`code-reviewer`, `doc-coauthoring`, `internal-comms`, `mcp-builder`, `meta-ads-creator`, `seo-auditor`, `skill-creator`) covers bookkeeping/tax/finance directly — `doc-coauthoring` and `internal-comms` are used here for their generic structuring/messaging behavior, applied to the accountant-handoff artifact, the same pattern already used for client proposals (Business Owner Kit) and team announcements (Docs & Team Comms Kit).

## Loop run notes

### 2026-07-31 — focus "higgsfield, zapier, notebooklm, ideogram"

**Shipped:** `social-ad-creative-studio` (marketing) — `meta-ads-creator` (skill) +
`ideogram` (connector) + `higgsfield` (connector). Both connectors are official,
OAuth-connected, and already `status: available` with a `manifest:` block
(`content/connectors/{en,es}/{ideogram,higgsfield}.md`), so they pass the
"only published, installable pieces" gate. Coherence: Meta Ads Creator supplies
the creative brief (copy + image description + format); Ideogram turns it into
the still image; Higgsfield turns it into the video for Stories/Reels formats a
still image can't serve.

**SKIP/deferred — `zapier`:** shipped as a connector (`status: available`,
2026-07-29) but its `content/connectors/{en,es}/zapier.md` has **no `manifest:`
block** — it is a user-managed MCP where the URL/tools are configured entirely
in the user's own Zapier dashboard (`docs/integration-loop-two-pr-policy.md`
explicitly calls this out: "must not look one-click installable"). Kits'
"Only published, installable pieces" rule requires a connector file to have a
`manifest:` block before it can be included. Zapier does not clear that bar
today, so it is left out of this kit. Reconsider if/when Zapier ships a
kit-eligible install path (e.g. a documented default manifest), or once a
dedicated "connect your own automation" kit pattern exists that can disclose
the user-managed setup honestly.

**SKIP/deferred — `notebooklm`:** no `content/connectors/{en,es}/notebooklm.md`
exists in the catalog at all — Google does not publish an installable MCP
server for NotebookLM (it's a consumer research/notebook product, not an
MCP-exposed API), matching the same gate that already SKIPs other
Google-consumer-product connectors in `content/connectors/SOURCES.md`. This is
a Connector Loop candidate, not a Kit Loop one: it cannot be added to any kit
until (if ever) an official installable connector exists. No kit content
references `notebooklm` in this run.
