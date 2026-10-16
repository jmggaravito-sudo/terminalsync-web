---
name: Factorial
logo: /connectors/factorial.png
category: automation
markets: ["US", "MX", "CO", "AR", "CL", "BR", "ES", "FR", "GB"]
status: soon
simpleTitle: "Clock in, request time off and find teammates, right from chat"
simpleSubtitle: "Official Factorial MCP: attendance, tasks, time off and coworker lookup over OAuth — no API key to paste."
devTitle: "Factorial MCP Connector"
devSubtitle: "Official hosted Factorial MCP (mcp.factorialhr.com) — attendance, tasks, time off and employee lookup over OAuth."
ctaUrl: "https://factorial.com"
tokenHelpUrl: "https://apidoc.factorialhr.com/docs/mcp-server"
manifest:
  mcpServers:
    factorial:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.factorialhr.com"]
affiliate: false
tagline: "Your Factorial HR, within reach of the agent"
originalAuthor: "Factorial"
originalAuthorUrl: "https://apidoc.factorialhr.com/docs/mcp-server"
license: "proprietary"
licenseUrl: "https://factorial.com/terms-of-use"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: false
installableForAiReason: "needs-oauth"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:40:00.000Z"
verifiedPackageVersion: null
---
**Factorial** is the HR platform growing businesses use to run their team in one place: employee records, time tracking, attendance, time off and payroll. The official Factorial MCP server gives your agent direct access to your own HR day — no API key pasted into TerminalSync, just the login of your own Factorial account.

Ask *"Am I clocked in right now?"* and the agent checks your attendance status. Ask *"Clock me in"* and your shift start is registered without opening the app. The server covers attendance (clock in and out, and your current status), your tasks (view them and create new ones), time off (see your absences and the time-off types your company offers, and request vacations) and finding coworkers by name or email. Factorial's own docs pitch it as *"Connect your AI assistant to Factorial and let it clock you in, manage tasks, request time off, and more…"*

### What you can ask

- *"Am I clocked in right now?"*
- *"Clock me in."*
- *"What time-off types does the company offer?"*
- *"Request vacations for me from December 22 to January 2."*
- *"Find the email of María, from the design team."*
- *"Create a task to prepare the onboarding of our new teammate before Monday."*

Actions that change your data — clocking in, requesting time off, creating a task — go through a confirmation step: the AI shows you what it's about to do and waits for your approval before running it.

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Factorial account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Factorial's login in your browser and asks you to authorize access.
3. Approve it with your account — the server acts as you, the authenticated user, so the connector can only see and do what your own Factorial user is allowed to. The official guide lives at [apidoc.factorialhr.com](https://apidoc.factorialhr.com/docs/mcp-server).

**Honest note:** this is a **server hosted by Factorial** (`https://mcp.factorialhr.com`), not something that runs on your computer — Factorial's docs state "there is nothing to install or run". The agent operates with your user's permissions, never as an admin or a service account, and attendance times are handled in your user's timezone. The docs list no country or plan restrictions for the direct tools. The separate Factorial One tools (policies, contracts, reports, knowledge base, performance) only apply if your plan includes Factorial One, and they consume its credits — the direct tools above don't.

**Why it shows as Coming soon:** the server is live and its login is OAuth, but while preparing this card (2026-10-16) we verified that the login window doesn't open correctly through TerminalSync's connection bridge yet — Factorial publishes its login identity at a different address from the one the connector uses, and the bridge stops at that difference as a security precaution. The card ships with Factorial's official documented configuration and will be enabled as soon as that handshake completes.

--- dev ---

Factorial publishes an **official remote MCP server** at `https://mcp.factorialhr.com`, documented in its developer portal ([apidoc.factorialhr.com/docs/mcp-server](https://apidoc.factorialhr.com/docs/mcp-server)). Transport is Streamable HTTP; the server is hosted by the vendor (*"there is nothing to install or run"*). Auth is **OAuth 2.0 with Dynamic Client Registration**, with refresh tokens; the server acts as the authenticated user (*"as the authenticated user, never as an admin or service account"*). The docs describe installation as a custom connector with OAuth login in Claude (web and desktop), ChatGPT and *"any assistant that supports remote MCP connectors"*.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.factorialhr.com
```

**Smoke (2026-10-16):** the endpoint is live and requires auth — `initialize` without credentials returns `401` (`invalid_token`, missing Authorization header). `/.well-known/oauth-authorization-server` publishes dynamic client registration (`mcp.factorialhr.com/oauth/register`), PKCE `S256`, and scopes that mirror the documented tool surface: `one:read`, `one:write`, `company_holidays`, `company_legal_entities`, `company_locations`, `employees`, `shift_management`, `tasks`, `time_off`, `time_tracking`.

**Login blocker (why this ships as `soon`):** the login cannot complete through `mcp-remote` today. The metadata served at `mcp.factorialhr.com/.well-known/oauth-authorization-server` declares its issuer as `https://api.factorialhr.com/` (where the authorization and token endpoints live), while `api.factorialhr.com` serves no `.well-known` of its own (404). `mcp-remote@latest` enforces the RFC 8414 §3.3 issuer check — the issuer must match the origin the metadata was fetched from — and aborts with `IssuerMismatchError` before opening the browser login. Verified with the smoke script and a direct bridge run. Unblock: re-run `node scripts/smoke-remote-login.mjs --slugs factorial`; if Factorial aligns its issuer with the MCP origin, or a future `mcp-remote` accepts the cross-domain issuer, flip to `status: available` / `installableForAi: true`.

**Tool surface (from the official docs):**

- **Attendance:** clock in, clock out, and check your current status. Times are recorded in the user's timezone.
- **Tasks:** view your tasks and create new ones.
- **Time off:** view absences and the time-off types available in the company; request vacations.
- **Employee lookup:** find a coworker by name or email.
- **Factorial One:** delegates to Factorial's own AI assistant (policies, contracts, reports, knowledge base, performance) — only if the plan includes Factorial One, and it consumes credits; the direct tools above don't.

**Disclosure:** a hosted server that reads and writes real HR data (clock-ins, time-off requests, tasks) under the identity of the connecting user. The docs document no rate limits and no country restrictions. Third-party MCP servers for Factorial exist on npm and GitHub; this connector ships only the vendor's official remote server.

License: proprietary SaaS terms (`factorial.com/terms-of-use`). Source: apidoc.factorialhr.com/docs/mcp-server.
