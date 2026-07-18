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
- Include only the assistants, connectors, and CLI tools that directly support
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
