---
name: Kit
logo: /connectors/kit.svg
category: messaging
status: available
simpleTitle: "Your newsletter, run by your AI"
simpleSubtitle: "Drafts, segments and broadcasts — written in chat with your voice."
devTitle: "Kit (ConvertKit) MCP Connector"
devSubtitle: "Subscribers, sequences and broadcasts as tools — query, segment, schedule from the IDE."
ctaUrl: "https://kit.com/?lmref=REPLACE_WITH_JUANS_KIT_AFFILIATE"
affiliate: true
tagline: "Newsletter without opening the dashboard"
---

Kit (formerly ConvertKit) is where your list lives. But writing a broadcast, segmenting subscribers and scheduling it takes you 30 minutes every time — and you always forget a field.

With this connector, you ask Claude *"draft a broadcast summarizing the latest post, send it only to subscribers who opened the last 3 emails, and schedule it for Tuesday 9am"* — and it sets up the draft in Kit, ready for you to approve.

Set up once, follows you across machines via Terminal Sync.

--- dev ---

Kit's v4 REST API exposes Subscribers, Tags, Sequences, Broadcasts and Forms. The community MCP wrapper turns those into tools: `kit.subscribers.query`, `kit.broadcasts.draft`, `kit.tags.apply`, `kit.sequences.add_subscribers`.

Terminal Sync stores the Kit API key in the OS Keychain (E2E encrypted) and syncs your `claude_desktop_config.json` across machines. Switch from laptop to tower — your list, segments and drafts stay accessible without re-pasting anything.

**Best for**: indie creators and newsletter operators; founders who write their own broadcasts and want to outsource the segmentation grunt-work to AI.
