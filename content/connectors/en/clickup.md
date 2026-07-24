---
name: ClickUp
logo: /connectors/clickup.svg
category: productivity
status: available
simpleTitle: "Your projects, run by conversation"
simpleSubtitle: "\"What's due this week?\" \"Create a task for the new client\" — your AI reads and updates ClickUp."
devTitle: "ClickUp MCP Connector"
devSubtitle: "MCP over the ClickUp API — workspaces, spaces, lists, tasks, docs, comments."
ctaUrl: "https://clickup.com"
tokenHelpUrl: "https://app.clickup.com/settings/apps"
manifest:
  mcpServers:
    clickup:
      command: npx
      args: ["-y", "clickup-mcp-server"]
      env:
        CLICKUP_API_TOKEN: "${SECRET:CLICKUP_API_TOKEN}"
affiliate: false
tagline: "Tasks and projects at AI reach"
originalAuthor: "David Whatley"
originalAuthorUrl: "https://github.com/nsxdavid/clickup-mcp-server"
license: "MIT"
licenseUrl: "https://github.com/nsxdavid/clickup-mcp-server/blob/main/LICENSE"
---
If your team runs its work in **ClickUp** — the lists, the tasks, the who's-doing-what — this connector lets your AI read it and keep it moving, so you can ask about your projects instead of clicking through them.

Ask *"what's due this week across all my lists?"* and it reads your tasks. Say *"create a task in the 'Onboarding' list for the new client, due Monday"* and it adds it. Ask *"what's stuck with no updates?"* and it finds them. Your project board becomes something you can just talk to.

### What you can ask

- *"What tasks are due this week, and who are they assigned to?"*
- *"Create a task in 'Sales': follow up with the León proposal, due Thursday."*
- *"List the spaces and lists in my workspace so I know where things live."*

### What you need

ClickUp connects with an **API token** from your own account:

1. Open [ClickUp → Settings → Apps](https://app.clickup.com/settings/apps) and generate a personal API token (starts with `pk_`).
2. Paste it when the Lab asks for `CLICKUP_API_TOKEN`.

The token is stored encrypted in your Keychain and synced across your machines.

--- dev ---

`clickup-mcp-server` (David Whatley / @nsxdavid) speaks the ClickUp API. Tools verified against the README: `get_workspaces`, `get_spaces`, `get_lists`, `get_tasks`, `get_docs_from_workspace`, `create_folder`, `create_list`, `create_task`, `update_task` — read and write across workspaces, spaces, folders, lists, tasks, docs, comments and checklists.

Auth is a single `CLICKUP_API_TOKEN` env var (a ClickUp personal token, `pk_…`, from Settings → Apps).

Terminal Sync keeps the token in your Keychain, synced encrypted across machines with AES-256-GCM. Because the create/update tools mutate real tasks, the desktop gates those behind a confirmation step.

License: MIT. Source: github.com/nsxdavid/clickup-mcp-server.
