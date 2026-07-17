---
name: MCP Builder
logo: /skills/mcp-builder.svg
category: dev
vendors: ["claude", "codex"]
author: "Anthropic"
status: available
tagline: "Design and harden MCP servers"
description: "Guides the design, implementation, testing, and hardening of an MCP server, with explicit checks before calling it production-ready."
license: "MIT"
marketplaceSource: "anthropic"
compatibleWith: ["claude", "codex"]
---
## When to use

- You want to expose an external API, internal tool, database, or workflow to an AI client through MCP.
- You need help deciding which tools to expose, what schemas they accept, and how to keep the interface small and safe.
- You have a prototype MCP server and want to add validation, error handling, tests, authentication boundaries, and operational notes.
- You want a structured build path without pretending that generated code is automatically production-ready.

Do not use it to skip vendor docs, bypass authentication rules, expose secrets, or ship untested tools. The skill may help produce production-aware code, but it should call a server "production-ready" only after tests, security review, realistic error handling, and deployment/runbook evidence are present.

## What it does

Guides an MCP build through:

- **Scope design**: defines the user jobs, the minimum tool set, naming, schemas, pagination, and read/write boundaries.
- **Implementation plan**: suggests TypeScript or Python structure, MCP SDK usage, typed inputs, environment configuration, and clear file layout.
- **Safety review**: checks auth model, secret handling, least privilege, input validation, rate limits, retries, idempotency, and dangerous write operations.
- **Test plan**: covers happy path, invalid arguments, empty responses, API errors, pagination, auth failure, rate limits, and destructive-action confirmation.
- **Operational readiness**: documents install steps, env vars, logging, versioning, rollback, and known limitations.

It lowers or qualifies claims when evidence is missing. "Production-grade" requires proof: passing tests, audited auth/permissions, documented failure modes, and a deployment path the user can run.

## How to use

1. Describe the API or tool you want to expose, the AI client, preferred language, and whether tools are read-only or can write data.
2. Provide API docs, auth requirements, sample requests/responses, rate limits, and any compliance or data-sensitivity constraints.
3. Ask for a design before code: tools, schemas, boundaries, risk list, and test plan.
4. Generate the server incrementally. After each tool, run the suggested tests and fix failures before adding more tools.
5. Before shipping, ask for a readiness review: security, permissions, tests, logs, docs, install steps, and caveats.

## Best for

Developers and technical teams building internal or niche MCP servers where correctness and safety matter. Best when API docs and sample data are available; weaker when the external API is undocumented, credentials are missing, or the user wants broad write access without a review process.
