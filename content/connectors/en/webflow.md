---
name: Webflow
logo: /connectors/webflow.svg
category: productivity
status: available
simpleTitle: "Let your AI edit your site without opening Webflow"
simpleSubtitle: "Copy tweaks, CMS posts, and publishes — requested in plain language."
devTitle: "Webflow MCP Connector"
devSubtitle: "Designer + CMS APIs as tools — query collections, push items, publish staging."
ctaUrl: "https://webflow.com/"
affiliate: false
tagline: "Edit your site by talking to it"
---

Your Webflow site has 80 posts, 40 products and a CMS with 12 collections. Every small change forces you to open the editor, wait for it to load and hunt down the right item.

With this connector, you tell Claude *"bump the Pro price to $19, publish the 3 blog drafts that are ready, and tell me what broke"* and it runs against your collections in seconds.

One setup, synced across every machine — edit from wherever without re-pasting API keys.

--- dev ---

Webflow's Data API exposes Sites, Collections, CMS Items and the Designer extension surface. The community MCP wrapper turns those into first-class tools — read collections, upsert items, trigger staging publishes, query the asset library.

Terminal Sync keeps the API token in the OS Keychain (`apiKeyHelper`) and syncs your `claude_desktop_config.json` between machines. The token never lands on disk plaintext and never enters the repo.

**Best for**: agencies running multiple Webflow sites who want bulk CMS edits from the IDE; founders pushing copy changes without opening the visual editor.
