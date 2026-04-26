---
name: Code Reviewer
logo: /skills/code-reviewer.svg
category: dev
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Review honesto antes de mergear"
description: "Revisa diffs como un senior cansado pero justo: bugs reales, no lint."
---

## Cuándo usar

- Pediste "reviseme este PR", "qué le falta a este diff", "ojos críticos antes de mergear".
- Estás por hacer merge y querés un last-pass antes del CI.

## Qué hace

Lee el diff y devuelve:

- **Bugs reales** (no estilo): off-by-one, race conditions, error handling faltante, leaks.
- **Riesgos arquitectónicos**: cambios que tocan algo crítico sin tests.
- **Edge cases olvidados**: el listado típico que un senior revisaría.
- **Veredicto**: ship / fix-first / no-ship con razón concreta.

No te tira lint, no te dice "considerá usar TypeScript", no te dice "agregá comentarios". Va al grano.

## Cómo usar

1. Pegale el diff (`git diff main...HEAD`) o pasale el PR URL.
2. Si querés contexto, agregale: *"este código maneja pagos, ojo con concurrency."*
3. Lee el output; lo importante está marcado con 🔴 (bloqueante), 🟡 (revisar), 🟢 (ok).

## Mejor para

Devs solos sin team de review, juniors que quieren simular code review de senior, equipos que usan CI para lint pero no tienen reviewer humano disponible.
