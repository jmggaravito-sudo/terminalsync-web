---
name: Standup Notes
logo: /skills/standup-notes.svg
category: productivity
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Tu standup en 30 segundos en vez de 30 minutos"
description: "Convierte tu Slack/Linear/GitHub de las últimas 24h en un standup limpio: ayer, hoy, blockers."
---

## Cuándo usar

- Es 8:55 y olvidaste preparar el standup de las 9.
- Sos lead y necesitás resumir qué hizo el equipo sin abrir 4 tools.
- Vas a un async update y querés algo digerible para no-devs.

## Qué hace

A partir de tus actividades (commits, PRs, comentarios de Linear/GitHub, mensajes de Slack si los pegás):

- **Ayer**: lo que efectivamente cerraste (no lo que tocaste — solo lo movido a done)
- **Hoy**: lo siguiente lógico, basado en lo que está in-progress
- **Blockers**: cosas explícitas en threads + cosas implícitas (PR esperando review hace 3 días)

Output corto, en bullets, sin relleno. Para enviar a Slack, no para impresionar a un VP.

## Cómo usar

1. Pegale los logs de actividad o conectalo a tus tools vía connector (GitHub + Linear + Slack si tenés los 3).
2. Decile el formato: *"Para Slack #standup, 5 bullets máximo"*.
3. Te devuelve el draft listo para mandar.

## Mejor para

Tech leads de equipos remotos, founders que tienen 3 standups distintos al día, devs que odian escribir status updates pero saben que importan.
