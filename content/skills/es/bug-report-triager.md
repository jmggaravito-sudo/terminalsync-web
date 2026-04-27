---
name: Bug Report Triager
logo: /skills/bug-report-triager.svg
category: dev
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Triage de bugs en 30 segundos, no 30 minutos"
description: "Lee un bug report y devuelve severidad, owner sugerido, y reproducción mínima."
---

## Cuándo usar

- Te llegan 20 bug reports al día via Linear/GitHub/Slack y todos parecen "urgentes".
- El reporter te puso un screenshot pero ningún paso para reproducir.
- Necesitás decidir rápido qué arreglar hoy y qué va a backlog.

## Qué hace

A partir del reporte (texto + capturas + logs si pegás):

- **Severidad**: P0/P1/P2/P3 con razón explícita ("data loss" / "user blocker" / "cosmetic")
- **Probable owner**: qué área del código toca (frontend auth, API billing, etc.) basado en el síntoma
- **Repro steps mínimos**: si el reporter no los puso, los infiere de los screenshots/logs
- **Hipótesis de causa**: top 2-3 razones probables ranqueadas
- **Qué pedirle al reporter**: 1-2 cosas máximo si falta info crítica

Bloqueos: no marca todo como P1, no sugiere "investigar más" como acción. Si no puede triagear con la info dada, lo dice y pide algo concreto.

## Cómo usar

1. Pegale el bug report completo (incluyendo conversación si hay back-and-forth).
2. Pasale contexto del producto si querés: *"Somos un SaaS B2B, P0 = afecta cobros"*.
3. Te devuelve la card lista para pegar en tu issue tracker.

## Mejor para

Tech leads que reciben bugs de soporte y deben rutear, founders que no tienen team de QA, devs en on-call rotation.
