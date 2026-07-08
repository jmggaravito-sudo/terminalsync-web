---
name: Skill Creator
logo: /skills/skill-creator.svg
category: productivity
vendors: ["claude", "codex"]
author: "Anthropic"
status: available
tagline: "Creá skills que superen baseline"
description: "Guía una skill desde caso recurrente hasta contenido compatible con RULES.md, evals, comparación contra baseline, límites y plan de iteración."
license: "MIT"
marketplaceSource: "anthropic"
compatibleWith: ["claude", "codex", "gemini"]
---
## Cuándo usarlo

- Tenés una tarea recurrente y sospechás que merece una skill reutilizable en vez de otro prompt guardado.
- Necesitás diseñar o reescribir una skill para que siga el molde de TerminalSync: frontmatter completo, headings localizados, scope claro, límites, evals y evidencia contra baseline.
- Querés probar si la skill realmente le gana a un prompt genérico antes de publicarla.
- Mantenés un catálogo y necesitás un proceso repetible para decidir mantener, reescribir, fusionar o rechazar.

No lo uses para aprobar skills débiles automáticamente. Si el asistente sólo reformatea un prompt obvio, Skill Creator debe decir que no le gana claramente al baseline y recomendar no publicarlo o fusionarlo en un template más amplio.

## Qué hace

Convierte una skill propuesta en un artefacto revisable:

- **Diagnóstico del caso de uso**: identifica trabajo real, triggers, usuarios, inputs requeridos y no-objetivos.
- **Alineación al molde**: redacta frontmatter y secciones de cuerpo que cumplen `content/skills/RULES.md` en inglés y español.
- **Diseño de proceso**: captura la expertise o workflow que la skill debe imponer, no sólo el formato de salida.
- **Diseño de límites**: define cuándo preguntar, cuándo rechazar, dependencias, límites de seguridad y claims que la skill no debe hacer.
- **Plan de evidencia**: crea al menos 5 evals: 3 normales, 1 ambiguo, 1 rechazo/límite.
- **Comparación baseline**: escribe prompt genérico, prompt con skill, outputs resumidos, diferencias y veredicto honesto.

Debe decir explícitamente cuando la evidencia no alcanza. La skill puede generar evals y draft de contenido, pero la revisión humana decide si se publica.

## Cómo usarlo

1. Describí la tarea recurrente, prompt actual, usuario objetivo y ejemplos de buenos/malos outputs.
2. Pedí a Skill Creator decidir si esto merece una skill o debería quedarse como prompt/template.
3. Si califica, generá la skill con el frontmatter y headings requeridos por `RULES.md`.
4. Generá los 5 evals más comparación contra baseline genérico antes de publicar.
5. Iterá hasta que la skill demuestre ventaja real de proceso o expertise frente al baseline genérico.

## Ideal para

Mantenedores de catálogo, power users, equipos que estandarizan comportamiento de asistentes y builders que convierten workflows repetidos en skills confiables. Funciona mejor cuando hay ejemplos reales para testear; es débil cuando la skill propuesta sólo renombra un prompt sin proceso distinto.
