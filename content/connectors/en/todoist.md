---
name: Todoist
logo: /connectors/todoist.svg
category: productivity
status: available
simpleTitle: "Your to-do list, run by the AI"
simpleSubtitle: "\"What's due today?\" \"Add: call the accountant Friday\" — your AI reads and updates your Todoist."
devTitle: "Todoist MCP Connector"
devSubtitle: "Official Doist MCP over the Todoist API — tasks, projects, sections, labels, comments."
ctaUrl: "https://todoist.com"
tokenHelpUrl: "https://todoist.com/help/articles/find-your-api-token-Jpzx9IIlB"
manifest:
  mcpServers:
    todoist:
      command: npx
      args: ["-y", "@doist/todoist-mcp"]
      env:
        TODOIST_API_KEY: "${SECRET:TODOIST_API_KEY}"
affiliate: false
tagline: "Tasks and follow-ups, hands-free"
originalAuthor: "Doist"
originalAuthorUrl: "https://github.com/Doist/todoist-mcp"
license: "MIT"
licenseUrl: "https://github.com/Doist/todoist-mcp/blob/main/LICENSE"
---
Half of running a small business is remembering the next step — call this client back, send that quote, renew the insurance. If you keep those in **Todoist**, this connector lets your AI read your list and add to it, so nothing lives only in your head.

Ask *"what's due today?"* and it reads your tasks. Say *"add: send the proposal to María, due Friday, high priority"* and it creates it. Ask *"what did I not finish this week?"* and it pulls the overdue ones. Your to-do list becomes something you talk to instead of a screen you forget to open.

### What you can ask

- *"What's on my list for today and tomorrow?"*
- *"Add a task: renew the shop insurance, due the 30th, in the 'Admin' project."*
- *"Which tasks are overdue? Reschedule them for next week."*

### What you need

Todoist connects with an **API token** from your own account:

1. Open [Todoist → Settings → Integrations → Developer](https://todoist.com/help/articles/find-your-api-token-Jpzx9IIlB) and copy your API token.
2. Paste it when the Lab asks for `TODOIST_API_KEY`.

The token is stored encrypted in your Keychain and synced across your machines.

--- dev ---

`@doist/todoist-mcp` (published by **Doist**, the makers of Todoist — official) speaks the Todoist API. It covers the full task surface: tasks (create, get, update, close, reopen, move), projects, sections, labels, and comments — read and write.

Auth is a single `TODOIST_API_KEY` env var (your account's API token from Settings → Integrations → Developer).

Terminal Sync keeps the token in your Keychain, synced encrypted across machines with AES-256-GCM.

License: MIT. Source: github.com/Doist/todoist-mcp.
