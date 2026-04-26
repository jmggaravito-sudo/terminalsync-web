---
name: Framer
logo: /connectors/framer.svg
category: productivity
status: available
simpleTitle: "Your AI edits Framer while you design"
simpleSubtitle: "Text tweaks, breakpoint fixes, CMS pushes — requested in chat, applied to the canvas."
devTitle: "Framer MCP Connector"
devSubtitle: "Plugin API + CMS bridge — read components, push CMS rows, trigger publishes."
ctaUrl: "https://www.framer.com/"
affiliate: false
tagline: "Design by talking, not clicking"
---

Framer is fast for designing, but the small stuff (fixing copy across 12 breakpoints, syncing the CMS, exporting components) pulls you out of flow.

With this connector, you ask Claude *"make the hero say 'Your Claude Code, synced' on mobile and tablet, and push the 3 blog drafts from Notion"* — and it applies the changes in your Framer project.

Set it up once, it follows you to any machine via Terminal Sync.

--- dev ---

The Framer Plugin API exposes the canvas (components, breakpoints, text nodes) and the Framer CMS exposes collections and items. The community MCP wrapper bridges both into tools Claude Code can call: `framer.text.update`, `framer.cms.upsert`, `framer.publish`.

Terminal Sync keeps your Framer API token in the OS Keychain and replicates the `claude_desktop_config.json` snippet across machines. Open Framer on your laptop, then your studio tower — same agent access without re-pasting tokens.

**Best for**: design-eng hybrids who hate context-switching; agencies maintaining Framer sites for clients who want changes via Slack-able prompts.
