---
name: Make
logo: /connectors/make.svg
category: automation
status: available
simpleTitle: "Let your AI fire automations for you"
simpleSubtitle: "Tell Claude what you need and it builds the Make workflow without you touching a thing."
devTitle: "Make Automation Hub MCP"
devSubtitle: "Trigger Make scenarios + build new ones from natural language."
ctaUrl: "https://www.make.com/en/register?pc=REPLACE_WITH_JUANS_MAKE_AFFILIATE"
affiliate: true
tagline: "Automate by talking, not clicking"
---

Make (formerly Integromat) connects your apps without code: Slack, Gmail, Notion, Stripe, WhatsApp, you name it. But building a scenario from scratch takes 20 minutes of drag-and-drop.

With this connector, you tell Claude *"whenever a Stripe payment comes in, WhatsApp me and add a row to my Google Sheet"* and it builds the scenario in Make automatically. You review, hit run, done.

--- dev ---

Make's MCP integration uses their REST API to list scenarios, trigger runs, and programmatically create/modify scenario blueprints. Claude gets tool access to the full catalog of 2000+ integrations via Make's module registry.

Terminal Sync ensures the Make API key (scoped to your team) rides in your Keychain, synced across machines via encrypted `claude_desktop_config.json`. Switch from laptop to studio tower — your agent keeps access to the same Make workspace without re-auth.

**Best for**: non-dev users who want to ship automations via conversation. Devs get: programmatic scenario creation, bulk scenario updates, on-demand scenario runs from within the IDE.
