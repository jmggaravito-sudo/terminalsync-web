---
name: Asana
logo: /connectors/asana.svg
category: productivity
status: available
simpleTitle: "Your projects and tasks, run in plain language"
simpleSubtitle: "Official Asana MCP server: search, update, and create work across your workspace over OAuth."
devTitle: "Asana MCP Connector (V2)"
devSubtitle: "Official hosted Asana MCP (mcp.asana.com/v2) — Work Graph read/write over OAuth."
ctaUrl: "https://asana.com"
tokenHelpUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
manifest:
  mcpServers:
    asana:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.asana.com/v2/mcp"]
affiliate: false
tagline: "Your projects, within reach of the agent"
originalAuthor: "Asana"
originalAuthorUrl: "https://developers.asana.com/docs/mcp-server"
license: "proprietary"
licenseUrl: "https://asana.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Asana** is where teams track projects, tasks, and who's doing what by when. The official Asana connector is a **hosted MCP server** (`https://mcp.asana.com/v2/mcp`), published by Asana, that gives your agent direct access to your **Work Graph** — projects, tasks, portfolios, and the people on your team — through your own Asana account.

Ask *"What's overdue in the launch project?"* and it searches your tasks and projects to find what's slipping. Say *"Create a task for the Q3 report, assign it to me, and add a comment with the outline"* and it creates the task, sets the assignee, and posts the comment. It's for finding status fast and getting routine project admin off your plate.

### What you can ask

- *"What's overdue in the launch project, and who owns each item?"*
- *"Create a task called 'Send Q3 report to the board' in the Finance project and assign it to me."*
- *"Give me a status summary across all my active projects."*
- *"Add a comment to the onboarding task saying the design is approved."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Asana account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Asana's OAuth flow in your browser.
3. Sign in and authorize access. Asana's own setup docs note that MCP apps don't require you to pick scopes — access is governed by what your Asana account and role can already see and do.

**Honest note:** this is a **hosted server run by Asana** (`https://mcp.asana.com/v2/mcp`), not something that runs on your computer. What the agent can see or change is bounded by your Asana account permissions and, on Enterprise+ plans, by whatever app-access rules your admin has set.

--- dev ---

Asana publishes its MCP server as a **remote/hosted V2 server** at `https://mcp.asana.com/v2/mcp` (Streamable HTTP transport), documented at `developers.asana.com/docs/mcp-server` and `developers.asana.com/docs/using-asanas-mcp-server`. The earlier V1 Beta endpoint (`https://mcp.asana.com/sse`) is deprecated, scheduled for shutdown 2026-11-05. There's no local stdio command — connect to the hosted URL and bridge locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.asana.com/v2/mcp
```

Auth is **OAuth**: create an "MCP app" in the [Asana developer console](https://app.asana.com/0/my-apps) to get a client ID/secret and redirect URL, then `mcp-remote` opens the browser for the user's login. Per the official docs, *"MCP apps don't require scopes — remove the `scope` parameter"* from the authorization request; access is instead governed by the authenticated user's own permissions in the workspace(s) the app is distributed to.

Tools verified against `developers.asana.com/docs/mcp-tools-reference`:

- **Read**: `search_objects` (universal search), `get_task`, `get_tasks`, `get_my_tasks`, `search_tasks` (full-text + complex filters), `get_project`, `get_projects`, `get_portfolio`, `get_portfolios`, `get_items_for_portfolio`, `get_status_overview`, `get_attachments`, `get_user`, `get_me`, `get_users`, `get_teams`, `get_agent`, `get_workspace_agents`.
- **Write**: `create_tasks` (creates immediately, without confirmation, per the docs), `create_project`, `update_tasks`, `delete_task`, `add_comment`, `create_project_status_update`.
- **Interactive/preview**: `create_task_preview`, `create_project_preview`, `search_tasks_preview` — surface a UI preview before the write happens.

Since `create_tasks`/`update_tasks`/`delete_task` mutate real workspace data without an interactive preview by default, TerminalSync gates the write tools behind a confirmation step.

Enterprise+ and Legacy Enterprise orgs can additionally govern which MCP apps are allowed per client through Asana's app-management console.

License: proprietary SaaS terms (Asana User Terms of Service). Source: developers.asana.com/docs/mcp-server.
