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
- Querés una revisión con hallazgos priorizados por severidad, con evidencia —no un "se ve bien" genérico.
- Trabajás con Claude Code o Codex y querés una segunda mirada antes de mergear.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **GitHub (el conector)** accede a tus repos, PRs, issues y archivos —así la skill puede leer el diff completo y los archivos alrededor del cambio, no solo el fragmento.
- **Code Reviewer (la skill)** revisa el diff o PR y devuelve hallazgos priorizados por severidad, con evidencia y su límite (revisa lo que ve; no reemplaza tests ni un pipeline de CI).

**Un ejemplo real:** un colaborador abrió el PR #42 y no estás seguro de mergearlo. Le decís *"revisá el PR #42 de mi-org/mi-repo"*. GitHub trae el diff y los archivos que toca, Code Reviewer detecta un manejo de error faltante en una ruta nueva, una condición de carrera potencial y dos cosas menores de estilo, cada una con la línea exacta y por qué importa. Sabés qué pedir que arreglen antes de mergear —sin leer las 300 líneas a mano.

## Cómo usarlo

1. Instalá el Plugin y conectá tu cuenta de GitHub.
2. Pedí: *"revisá los cambios del PR #42 en mi-org/mi-repo"*.
3. Recibís los hallazgos priorizados con evidencia, listos para actuar antes de mergear.

## Por qué el combo funciona

La skill de revisión sola necesita que le pegues el código; si le das poco contexto, revisa poco. El conector solo te trae el código, pero no lo evalúa. Juntos: el conector le da a la skill el diff completo y los archivos vecinos, y la skill lo audita con criterio —una revisión con contexto real, en una sola acción.

## Límites

- Revisa lo que ve en el diff y los archivos que puede leer —no reemplaza tests, ni CI, ni el criterio final del que mergea.
- No garantiza que no queden bugs; es una segunda mirada con evidencia, no una prueba de corrección.
- Requiere conectar tu cuenta de GitHub; solo ve los repos que ese acceso permita.
