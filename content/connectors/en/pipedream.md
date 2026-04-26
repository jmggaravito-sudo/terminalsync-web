---
name: Pipedream
logo: /connectors/pipedream.svg
category: automation
status: available
simpleTitle: "Workflows built by talking"
simpleSubtitle: "Connect 2,500+ apps. Tell Claude what you need and it builds the workflow in Pipedream."
devTitle: "Pipedream MCP Connector"
devSubtitle: "Workflows, sources and SQL data stores as tools — codegen Node steps from natural language."
ctaUrl: "https://pipedream.com/?via=REPLACE_WITH_JUANS_PIPEDREAM_REFERRAL"
affiliate: true
tagline: "Workflows you build by talking"
---

Pipedream connects 2,500+ apps with the flexibility of a real code editor (Node, Python, Go) — but that same flexibility means more friction when you just want to fire off a quick workflow.

With this connector, you tell Claude *"when an email lands in my Gmail with a subject starting with 'Invoice', OCR the amount and vendor, push to Sheets and ping me in Slack"* — it writes the steps in Pipedream ready to deploy.

Set up once, follows you across machines via Terminal Sync.

--- dev ---

Pipedream's Connect API + Sources/Workflows endpoints expose the full programmatic surface: create workflows, add sources, write Node code steps, deploy and trigger. The community MCP wrapper bridges all of it: `pd.workflows.create`, `pd.workflows.deploy`, `pd.sources.add`, `pd.runs.invoke`.

Terminal Sync stores the API key in the OS Keychain and replicates your `claude_desktop_config.json` between machines. Switch from laptop to tower — your workflows, sources and data stores stay accessible without re-pasting credentials.

**Best for**: devs and indie hackers who want the power of a code editor + the speed of a low-code builder; teams who outgrew Make/Zapier on complexity.
