---
name: Gmail
logo: /connectors/gmail.svg
category: messaging
status: available
simpleTitle: "Your inbox, talking to your AI"
simpleSubtitle: "\"Anything urgent today?\" \"Summarize emails from client X\" — without pasting anything."
devTitle: "Gmail MCP Connector"
devSubtitle: "OAuth-scoped Gmail API access for search, read, and draft composition."
ctaUrl: "https://gmail.com"
affiliate: false
tagline: "Smart inbox triage"
---

You arrive in the morning with 80 unread emails. You ask Claude *"what's urgent today?"* and it summarizes what matters. You ask *"draft a reply to client X, formal tone"* and it composes the draft.

It never sends automatically — you review and send.

--- dev ---

Gmail MCP uses OAuth 2.0 scopes: `gmail.readonly` (default) or `gmail.modify` for draft creation. Supports Gmail search operators, thread traversal, label management, and draft composition. Sends still require user confirmation.

Terminal Sync syncs the OAuth refresh token encrypted per-machine. Multi-account supported via profiles — configure once, available on every device.
