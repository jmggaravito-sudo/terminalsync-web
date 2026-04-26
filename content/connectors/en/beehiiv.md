---
name: Beehiiv
logo: /connectors/beehiiv.svg
category: messaging
status: available
simpleTitle: "Your Beehiiv newsletter, written by your AI"
simpleSubtitle: "Posts, segments and broadcasts — requested in chat, ready to review."
devTitle: "Beehiiv MCP Connector"
devSubtitle: "Posts, subscriptions and segments as tools — draft, schedule and analyze from the IDE."
ctaUrl: "https://www.beehiiv.com/?via=REPLACE_WITH_JUANS_BEEHIIV_PARTNER"
affiliate: true
tagline: "Newsletter without opening the editor"
---

Beehiiv is where your list is growing. But every post is an hour between drafting, segmenting, scheduling and post-send analytics.

With this connector, you ask Claude *"draft a post with this week's 3 highlights, send it only to subscribers who opened the last 4 emails, and leave the draft for me to review"* — it sets everything up in Beehiiv ready for your approval.

Set up once, follows you across every machine.

--- dev ---

Beehiiv's API exposes Publications, Posts, Subscriptions, Segments and Custom Fields. The community MCP wrapper turns those into tools: `beehiiv.posts.draft`, `beehiiv.subscriptions.query`, `beehiiv.segments.create`, `beehiiv.posts.schedule`.

Terminal Sync stores the API key in the OS Keychain and replicates your `claude_desktop_config.json` snippet across machines. Switch from laptop to tower — your list, segments and drafts stay accessible without re-pasting credentials.

**Best for**: indie creators and growth newsletters already on Beehiiv; founders who want to outsource segmentation + scheduling without hiring an editor.
