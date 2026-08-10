# Skill Content Rules — Gold Mold for Skills

This file is the source of truth for publishing assistant-style skills in the
TerminalSync catalog. It is the skills equivalent of `content/connectors/SOURCES.md`:
new skills must follow this mold before they can be reviewed for publication.

A skill is not published because it sounds useful. It must prove that it reliably
helps a user do a specific job better than a generic prompt.

## Filtro de persona (empresario-first)

Aplica el filtro de persona del Loop (definido en `content/connectors/SOURCES.md`
→ "Filtro de persona"): el norte es el **dueño de negocio no técnico**. Priorizá
skills que un empresario entiende y usa esta semana — documentos de un clic
(Word/Excel/PPT/PDF), ventas, marketing, comunicación, memoria del negocio.
**Backlog cerrado (2026-08-10):** las skills `docx`/`pdf`/`pptx`/`xlsx` ya
pasan el molde de contenido — frontmatter completo (`vendors`, `description`,
`license: "proprietary"` + `licenseUrl` al `LICENSE.txt` oficial de
`anthropics/skills`, `marketplaceSource: "anthropic"`), paridad ES/EN estricta
con las secciones requeridas (antes tenían prosa libre y un artefacto literal
`--- dev ---` que se renderizaba en la página), y contenido verbatim contra el
`SKILL.md` oficial de cada una en `github.com/anthropics/skills` (no de
memoria). Categoría (`productivity`) y `included: true` ya venían resueltos de
#162/#188.

**Excepción documentada — por qué `compatibleWith: ["claude"]` y sin fixture
de evals:** son skills **nativas** de Claude Code (`included: true`), no
prompt-recipes que TerminalSync entregue — `getSkillInstallPayload` y
`buildRawSkillPayload` las rechazan a propósito (`included` → null / 409). Sin
un `SKILL.md` propio que el catálogo sirva, no hay nada real que evaluar con
`run-evals.mjs`: por eso `scripts/skills-eval/fixtures-coverage.test.mjs`
las excluye explícitamente (constante `NATIVE`) del requisito de fixture. Esto
**no es una excepción a la decisión JM 2026-08-07 de "las 4 IAs"** — esa regla
rige skills nuevas que el loop autora y entrega; estas cuatro son una
capacidad nativa de Claude que Codex/Gemini no tienen un equivalente para
entregar, así que declarar más de `["claude"]` sería la misma promesa sin
evidencia que esa decisión vino a prohibir.

## El veredicto — decisión, no ensayo (skills de decisión)

Las skills que producen una **recomendación sobre la que el dueño actúa**
(marketing, ventas, operaciones) deben **cerrar su salida con un "Veredicto"**:
una decisión clara, no un choclo de texto que obliga al dueño a interpretar.
Es cómo cierra un buen asesor ("hacelo / todavía no"), pero **sin traicionar la
honestidad** — el puntaje es la lectura del modelo sobre lo que pudo ver, NO una
garantía de mercado.

El Veredicto cierra con:

- **Un puntaje 0–100** de "qué tan listo/fuerte está esto", según SOLO los datos
  que el usuario dio o el modelo pudo inspeccionar.
- **Un semáforo con umbral explícito**: 🟢 80+ = listo para actuar/probar;
  🟡 50–79 = actuá, pero cerrá primero estos gaps; 🔴 <50 = falta contexto o hay
  bloqueantes, todavía no.
- **La única próxima acción de mayor impacto** (una sola, no una lista).
- **El caveat de honestidad**: el puntaje refleja lo que el modelo pudo ver, no
  una promesa de resultados; los números reales (cuenta, ranking, ventas) mandan.

No pongas un puntaje donde no aplica: una skill que solo redacta un texto
(comunicación, documentos) informa, no puntúa una decisión de negocio. El
Veredicto es para skills de **decisión**.

## Landing-first sync gate

Every skill Loop run publishes through the **landing PR first** — it is the source of truth for `/api/marketplace/catalog`, and the desktop consumes it automatically. An **app PR is required only when the item needs desktop code** it doesn't have yet (a new surface, a special install flow, or an item that would otherwise render as a broken generic card). Do **not** open an app PR just to leave a record: that rule used to be mandatory and produced mirror PRs made of hand-written fixtures that asserted nothing — see `docs/integration-loop-two-pr-policy.md`. State `App PR: no aplica — la app consume el catálogo` in the landing body instead. Sync is verified by the desktop guard (`src/data/departamento.test.ts` + `scripts/verify-integration-loop.mjs`), not declared. If the landing PR itself cannot be created, the item is **not** ready — never compensate with an app PR that mirrors content that does not exist.

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

Every published skill must ship in both languages with strict ES/EN parity:

```text
content/skills/en/<slug>.md
content/skills/es/<slug>.md
```

Rules:

- Use the same `<slug>` in both languages.
- Keep frontmatter fields equivalent across ES/EN unless the value is intentionally localized text.
- Keep the same body sections in both languages.
- Do not publish a skill in only one language.

## Required frontmatter

Every skill file must include these fields:

```yaml
---
name: Skill Name
logo: /skills/<slug>.svg
category: productivity
vendors: ["claude", "codex", "gemini"]
author: "TerminalSync"
status: available
tagline: "Short one-line promise"
description: "Concrete description of what the assistant does and when it helps."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]  # las 4 IAs — ver "Cross-provider coverage"
---
```

Required field meanings:

- `name`: user-facing skill name.
- `logo`: local `/skills/<slug>.svg` path or an approved existing asset.
- `category`: one of the allowed categories below.
- `vendors`: the agent/provider surfaces where this skill can run. **Una skill
  nueva se publica con las tres (`claude`, `codex`, `gemini`) o no se publica** —
  GLM/TerminalSync hereda la de Claude, así que esas tres son las 4 IAs. No
  copies este bloque con menos: ver "Cross-provider coverage" abajo.
- `author`: original author or maintainer.
- `status`: publication state; use `available` only after review approval.
- `tagline`: short catalog-card promise.
- `description`: concrete, non-hype explanation of the behavior.
- `license`: SPDX identifier when applicable, otherwise `proprietary`.
- `marketplaceSource`: provenance of the skill.
- `compatibleWith`: provider compatibility list surfaced to users.

## Allowed categories

Valid categories are defined in `src/lib/skills.ts`. Do not invent a category
without updating that loader and reviewing the UI impact.

Allowed today:

- `marketing`
- `dev`
- `productivity`
- `research`
- `design`
- `finance`

## Required body sections

Each skill must use the same body section structure in English and Spanish.
Localize the headings, but keep the content equivalent.

English:

```md
## When to use

## What it does

## How to use

## Best for
```

Spanish:

```md
## Cuándo usarlo

## Qué hace

## Cómo usarlo

## Ideal para
```

Section requirements:

- **When to use / Cuándo usarlo**: concrete user situations and triggers.
- **What it does / Qué hace**: specific behaviors, not vague capability claims.
- **How to use / Cómo usarlo**: steps the user can actually follow.
- **Best for / Ideal para**: target users, teams, or workflows.

## Verification gate

No assistant is published only because it sounds good. Every new skill must bring
reproducible evidence in the PR.

### Required eval set

Each skill must include at least 5 test cases in the PR evidence:

1. 3 normal cases where the skill should help.
2. 1 ambiguous case where the skill should ask a clarifying question or state assumptions.
3. 1 refusal / boundary case where the skill should refuse, narrow scope, or ask for a safer framing.

The tests must be reproducible: include the input prompt, the expected behavior,
and the actual output or summarized result.

Reproducibility is mechanized by the skills-eval harness
(`scripts/skills-eval/`): encode the cases as a fixture
(`scripts/skills-eval/fixtures/<slug>.json`) and run
`node scripts/skills-eval/run-evals.mjs <slug>` to generate the baseline-vs-skill
evidence report at `docs/skills-evals/<slug>.md`. The harness produces evidence
only — see "Evidence is not the verdict" below.

### Baseline comparison

The skill must be compared against an equivalent generic prompt.

Required evidence:

- Generic baseline prompt.
- Skill-enabled prompt.
- Outputs from both runs.
- Specific differences that matter to the user: correctness, structure, speed,
  safer boundaries, better use of context, fewer hallucinations, or clearer next steps.

If the skill does not clearly beat the generic baseline, it does not publish.

### Cross-provider coverage — las 4 IAs, no una lista por skill

**Decisión JM 2026-08-07: todo tiene que funcionar en las 4 IAs.** Una skill que
solo anda en algunas no es una skill "parcialmente compatible": es una skill
**incompleta**, y el trabajo es arreglarla, no documentar dónde falla.

Esto cambia para qué sirve `compatibleWith`. Sigue siendo una promesa que exige
evidencia — nunca se declara un proveedor sin evals ahí — pero ya no es una
característica que el cliente compara. Es un **termómetro interno**: lo que
todavía no llegó a la barra.

Las 4 superficies y cómo les llega:

| IA | Cómo recibe la skill |
|---|---|
| **Claude** | `~/.claude/skills/<slug>/SKILL.md` |
| **Codex** | `~/.codex/skills/<slug>/SKILL.md` |
| **TerminalSync / GLM** | hereda la de Claude — corre sobre ese CLI (`proxy-via-claude-cli`) |
| **Gemini** | `~/.gemini/skills/<slug>/` **+** el bloque `@import` en `GEMINI.md` — no auto-descubre el dir (terminal-sync#1268) |

#### Regla para skills NUEVAS

> **Ojo con el bloque de frontmatter de arriba.** Hasta el 2026-08-08 ese
> ejemplo decía `["claude", "codex"]`, contradiciendo esta regla escrita 100
> líneas más abajo. Los loops copian el ejemplo, no leen hasta acá: por eso
> #260 salió con 2 vendedores en vez de 3. Si cambiás la regla, cambiá el
> ejemplo en el mismo commit — es el que se obedece.

Una skill nueva **nace multi-IA o no se publica.** No se shipea con
`compatibleWith: ["claude"]` "por ahora": eso es lo que produce catálogos donde
cada ítem anda en un subconjunto distinto, y deja al cliente adivinando.

Antes de publicar, el loop corre los evals en **cada** proveedor y las cuatro
tienen que pasar el umbral. Si una no pasa, la skill se reescribe hasta que
pase — o no entra. Un `SKILL.md` que depende de tools, formato o mecanismos
específicos de un proveedor está mal escrito para este catálogo; hacerlo
portable es parte del trabajo, no un extra.

#### Skills que YA están publicadas y no cumplen

Se tratan como deuda, no como diseño. Se declaran solo donde tienen evidencia
—para no mentir mientras tanto— y quedan en la lista de arreglo. Al 2026-08-07:
`rfm-segmentacion` y `doc-coauthoring` no pasan en Gemini.

#### Cómo se corre

    GEMINI_API_KEY=... ANTHROPIC_API_KEY=... \
      node scripts/skills-eval/run-evals.mjs <slug> --provider gemini

- **Mediana de 3 corridas**, no una. Medido el 2026-08-07: la misma skill con
  el mismo prompt dio 5/5, 4/5 y 5/5 en tres corridas seguidas — una sola es un
  sorteo en el margen.
- El **sujeto** es el proveedor evaluado y el **juez** es Claude: modelos
  distintos, así el que produce no es el que aprueba.
- `--local` evalúa el `SKILL.md` del repo antes de publicarlo, que es el orden
  correcto: medir el arreglo sin tener que shipearlo primero.

### Evidence is not the verdict

The evals produce evidence, not the final verdict.

The AI that generates the skill cannot approve its own work. It is judge and party.
The PR must include eval results, but the decision that the skill beats the baseline
belongs to JM / human review.

## Delivery gate (el skill tiene que LLEGAR al disco)

Una skill no está "lista" porque su contenido y sus evals existan — está lista
cuando la app la puede **poner en el disco del usuario**. El camino de entrega es:

```
tile del catálogo → desktop ensure_skill_installed(slug) → GET /api/marketplace/skills/<slug>/raw → SKILL.md
```

Si `/raw` no puede servir una skill publicada, el install de un usuario nuevo
falla en silencio ("la skill no está en Drive"). Por eso el loop tiene un **gate
de entrega** además del gate de evals:

- `src/lib/marketplace/rawSkill.ts::buildRawSkillPayload` es la **única** fuente
  del payload de `/raw` (la ruta lo llama; el gate lo verifica — no pueden
  driftear).
- `src/lib/marketplace/rawSkill.test.ts` recorre **todas** las skills
  catalog-ready y asserta que `/raw` sirve un payload válido (SKILL.md no vacío,
  checksum = sha256(skill_md), vendors ⊆ {claude, codex}, extras sin traversal).
  **Ninguna skill se publica (`catalogReady` sin `false`) si no pasa este gate.**
- Las skills staged (`catalogReady: false`) **no** son servibles por `/raw` a
  propósito (404) — no se pueden entregar hasta que se publiquen. Cuando se
  flipea `catalogReady`, el gate empieza a cubrirlas automáticamente.

El **primitivo de entrega** vive en el app (`terminal-sync`,
`skills_sync::ensure::ensure_skill_installed`): consume este `/raw`, escribe
SKILL.md + extras atómico a cada vendor dir declarado, no-op por checksum, nunca
tira. El gate del loop cuida el contrato web que ese primitivo consume.

## Prohibitions

Do not publish a skill that:

- Repackages an obvious prompt with no demonstrated improvement over baseline.
- Makes medical, legal, or financial claims without explicit boundaries and safety language.
- Depends on tools, connectors, files, apps, or runtimes that are not installed or documented.
- Requires secrets, API keys, private credentials, or user tokens.
- Pretends to guarantee outcomes that depend on external platforms or human decisions.
- Hides limitations, refusal conditions, or cases where the user must provide more context.
- Publishes only an English or only a Spanish version.

## PR checklist

A skill PR must include:

- ES and EN files with matching slugs.
- Required frontmatter in both files.
- Required body sections in both files.
- Valid category from `src/lib/skills.ts`.
- At least 5 reproducible eval cases.
- Baseline comparison evidence.
- Human-review note that the evals are evidence, not self-approval.
- Clear list of limitations, refusal conditions, or clarification triggers.

Until these are present, keep the skill out of the published catalog.
