---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
tagline: "Revisá el código de tus repos — el conector trae los cambios, la skill los audita."
description: "Junta el conector de GitHub (repos, PRs, issues, archivos) con Code Reviewer (revisa un diff o PR con hallazgos priorizados por severidad y evidencia), para que 'revisá este PR' sea una sola acción."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: github
skillSlugs: ["code-reviewer"]
---
## Cuándo usarlo

- Querés que tu IA revise un Pull Request o un cambio en tus repos de GitHub, sin pegar el diff a mano.
- Querés una revisión con hallazgos priorizados por severidad, con evidencia, no un "se ve bien" genérico.
- Trabajás con Claude Code o Codex y querés una segunda mirada antes de mergear.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **GitHub (el conector)** accede a tus repos, PRs, issues y archivos.
- **Code Reviewer (la skill)** revisa el diff o PR y devuelve hallazgos priorizados por severidad, con evidencia y su límite (revisa lo que ve; no reemplaza tests ni un pipeline de CI).

Juntas: *"revisá el PR #42 de mi repo"* → el conector trae el diff, la skill lo audita.

## Cómo usarlo

1. Instalá el Plugin y conectá tu cuenta de GitHub.
2. Pedí: *"revisá los cambios del PR #42 en mi-org/mi-repo"*.
3. Recibís los hallazgos priorizados con evidencia, listos para actuar antes de mergear.

## Ideal para

Desarrolladores y equipos técnicos que quieren una revisión de código con evidencia sobre sus PRs de GitHub. Requiere conectar tu cuenta de GitHub.
