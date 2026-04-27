---
name: API Doc Writer
logo: /skills/api-doc-writer.svg
category: dev
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Docs de tu API que la gente va a leer"
description: "Genera docs de endpoint a partir del código real, con ejemplos curl y errores reales."
---

## Cuándo usar

- Tu API tiene 30 endpoints sin documentar y no querés escribirlos a mano.
- Hicieron docs hace un año y ahora están todas mal.
- Necesitás un README de SDK que no sea solo "ver código fuente".

## Qué hace

Lee tus route handlers (Express, Fastify, FastAPI, Hono — los detecta) y para cada endpoint genera:

- **Path + método** + brief description (1 frase, no 3 párrafos)
- **Request shape** con tipos reales del código, no inventados
- **Response shape** con ejemplo del happy path Y de un error típico
- **curl listo para copiar** que efectivamente funciona
- **Edge cases**: qué status codes esperan, cuándo se rompe

Bloqueos: no escribe "This endpoint allows users to create resources" — escribe "POST /orgs creates an org. Requires admin token. Returns 409 if slug exists."

## Cómo usar

1. Apuntale al directorio de tus handlers (vía connector de filesystem o pegando el código).
2. Decile el formato output: Markdown / OpenAPI YAML / Mintlify.
3. Te devuelve docs por endpoint, listas para meter en tu repo.

## Mejor para

Solo devs que tienen una API privada que necesitan abrir, equipos cuyo /docs está abandonado, founders que arman SDK para early users.
