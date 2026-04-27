---
name: API Doc Writer
logo: /skills/api-doc-writer.svg
category: dev
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "API docs people will actually read"
description: "Generates endpoint docs from real code, with curl examples and real error cases."
---

## When to use

- Your API has 30 endpoints with no docs and you don't want to write them by hand.
- Docs were written a year ago and they're all wrong now.
- You need an SDK README that's more than "see source code".

## What it does

Reads your route handlers (Express, Fastify, FastAPI, Hono — auto-detected) and for each endpoint generates:

- **Path + method** + brief description (1 sentence, not 3 paragraphs)
- **Request shape** using real types from the code, not made up
- **Response shape** with both happy-path and a typical error example
- **curl ready to copy** that actually works
- **Edge cases**: which status codes to expect, when it breaks

Blocks: never writes "This endpoint allows users to create resources" — writes "POST /orgs creates an org. Requires admin token. Returns 409 if slug exists."

## How to use

1. Point it at your handlers directory (via filesystem connector or paste the code).
2. Tell it the output format: Markdown / OpenAPI YAML / Mintlify.
3. Returns per-endpoint docs ready to drop into your repo.

## Best for

Solo devs opening up a private API, teams whose /docs is abandoned, founders building an SDK for early users.
