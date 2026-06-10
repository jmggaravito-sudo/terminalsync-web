---
name: Skill Creator
logo: /skills/skill-creator.svg
category: productivity
vendors: ["claude", "codex"]
author: "Anthropic"
status: available
tagline: "Creá, mejorá y medí tus propias habilidades"
description: "Te guía paso a paso para crear nuevas skills, refinar las existentes, y medir cómo performan en la práctica."
license: "MIT"
marketplaceSource: "anthropic"
compatibleWith: ["claude", "codex", "gemini"]
---
## Cuándo usar

- Querés crear una skill nueva para una tarea recurrente.
- Tenés una skill que no siempre se comporta bien — y querés una forma estructurada de iterarla.
- Necesitás medir qué tan bien performa una skill contra casos reales.

## Qué hace

- Te ayuda a definir el objetivo de la skill (cuándo se activa, qué hace, qué queda fuera).
- Drafts del SKILL.md siguiendo las convenciones que funcionan en distintas IAs.
- Sugiere casos de test para validarla.
- Ciclo de iteración: draft → test → medición → ajuste.

## Cómo usar

1. Decile a tu IA: *"Quiero crear una skill para X usando `skill-creator`"*.
2. Respondé las preguntas estructuradas (objetivo, scope, anti-ejemplos).
3. Revisás el SKILL.md generado y ajustás prosa.
4. Corrés los casos de test que la skill sugiere; ajustás hasta que converja.

## Mejor para

Power users con casos de uso recurrentes que justifican convertir sus prompts en skills reutilizables. Solo builders que quieren que su IA se especialice en su dominio sin depender de un catálogo de terceros.
