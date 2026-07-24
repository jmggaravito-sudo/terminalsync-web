# Plugin Content Rules — the product-pack unit

This file is the source of truth for **Plugins** in the TerminalSync catalog.
It is the plugins equivalent of `content/connectors/SOURCES.md` and
`content/skills/RULES.md`.

## What a Plugin is

A **Plugin** is a **product pack**: the connector for one product bundled with
the skill(s) that teach the agent to use it well — one install, one card that
"just works".

The word is deliberate. "Plugin" is the term used by both the market (Accio) and
by **Claude Code itself** — a native Claude Code plugin already bundles `skills/`
+ `.mcp.json` (MCP connectors). So a TerminalSync Plugin is **not an invented
format**: it maps onto the native Claude Code plugin standard, which the desktop
installs (and mirrors to Codex/Gemini via `skills_sync`).

Vocabulary, from the raw piece to the role bundle:

| Term | What it is | For whom |
|---|---|---|
| **Connector** | One piece: a product's MCP tools | Advanced |
| **Skill** | One piece: behavior / know-how (`SKILL.md`) | Advanced |
| **Plugin** | A **product** combo: connector + skill(s), one install | **The owner (default)** |
| **Kit** | A **role** combo: several Plugins for a whole job | The owner |

Hierarchy: **pieces → product (Plugin) → role (Kit)**.

## The composition rule (most important)

A Plugin file **references** existing connector and skill slugs — it **never
duplicates their content**. The loader resolves the pieces by slug at read time.
A Plugin is glue, not a copy. If a referenced piece changes, the Plugin reflects
it automatically.

## Required frontmatter

```yaml
---
name: Gmail
logo: /plugins/<slug>.svg
category: communication          # marketing | sales | productivity | communication | operations | ecommerce | dev
status: available                # or "soon" while a referenced piece isn't ready
tagline: "Your inbox, handled — the agent knows Gmail's quirks."
description: "Concrete description of the product job this pack does."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gmail             # the tools layer (optional but preferred)
skillSlugs: ["gmail-usage"]      # the know-how layer (one or more)
---
Body: When to use / What it does / How to use / Best for (same mold as skills).
```

## Rules

- **At least one real piece.** A Plugin must reference a connector **or** at
  least one skill. Its value is highest when it bundles **both** and they
  reinforce each other (Accio's canonical example: the Gmail MCP + a skill so
  the agent handles Gmail's syntax).
- **Referenced pieces must exist and be publishable.** The connector must pass
  the Connector Loop gate (`content/connectors/SOURCES.md`: official publisher +
  npm/remote). The skill(s) must pass `content/skills/RULES.md` (evals, honesty,
  Veredicto for decision skills).
- **Persona filter (empresario-first).** Same filter as the rest of the Loop
  (`content/connectors/SOURCES.md` → "Filtro de persona"). Lead with the Plugin
  the owner installs; the raw pieces stay browsable for the advanced user.
- **`included: true`** for Plugins that ship natively with the app (not
  installable) — same semantics as `SkillMeta.included`.
- **`hidden` / `catalogReady: false`** behave exactly like in skills: hidden =
  retired-but-kept; catalogReady:false = pending evaluation.
- **ES/EN parity is strict.** Same `<slug>` in both languages; do not publish in
  only one.
- **Status `soon`** while any referenced piece is `soon` (e.g. a connector not
  wired yet). Never claim a Plugin works before its pieces do.

## Relationship to Kits

A **Kit** is a bundle of **Plugins** for a role/job (e.g. Business Owner Kit).
Kits stay as the role-level layer; Plugins are the product-level layer beneath
them. A Kit's `items:` may reference `kind: plugin` (as well as the existing
`connector`/`skill`).
