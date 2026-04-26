---
name: Typeform
logo: /connectors/typeform.svg
category: productivity
status: available
simpleTitle: "Your AI builds and analyzes forms for you"
simpleSubtitle: "Design a form in chat, read the responses, export insights — without opening Typeform."
devTitle: "Typeform MCP Connector"
devSubtitle: "Forms, responses and webhooks as tools — build, query and route from the IDE."
ctaUrl: "https://www.typeform.com/?utm_source=REPLACE_WITH_JUANS_TYPEFORM_AFFILIATE"
affiliate: true
tagline: "Forms and responses without clicking"
---

Typeform looks great, but building a 12-question form with conditional logic still takes 15 minutes of drag-and-drop. And when responses come in, opening the dashboard every time to spot patterns is tedious.

With this connector, you ask Claude *"build a feedback form with 5 questions, hide the last one if NPS is low, and pipe each response to my Notion"* — it creates the form and sets up the webhook.

Set it up once, follows you across machines via Terminal Sync.

--- dev ---

Typeform's Create + Responses APIs expose Forms, Themes, Workspaces, Responses and Webhooks. The community MCP wrapper turns those into tools: `typeform.forms.create`, `typeform.responses.query`, `typeform.webhooks.subscribe`.

Terminal Sync keeps the token in the OS Keychain and replicates your `claude_desktop_config.json` snippet across machines. Switch from laptop to tower — your forms, responses and webhooks stay accessible without re-pasting API keys.

**Best for**: founders + agencies running many onboarding/survey flows; researchers who want to analyze responses with an AI agent instead of opening the dashboard every time.
