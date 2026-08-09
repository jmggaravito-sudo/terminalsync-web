---
name: Calendly
logo: /connectors/calendly.svg
category: productivity
status: available
simpleTitle: "Your scheduling, handled in plain language"
simpleSubtitle: "Official Calendly MCP server: check availability, book, and manage meetings over OAuth."
devTitle: "Calendly MCP Connector"
devSubtitle: "Official hosted Calendly MCP (mcp.calendly.com) — event types, availability, and bookings."
ctaUrl: "https://calendly.com"
tokenHelpUrl: "https://developer.calendly.com/calendly-mcp-server"
manifest:
  mcpServers:
    calendly:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.calendly.com"]
affiliate: false
tagline: "Your bookings, within reach of the agent"
originalAuthor: "Calendly"
originalAuthorUrl: "https://developer.calendly.com/calendly-mcp-server"
license: "proprietary"
licenseUrl: "https://calendly.com/legal"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Calendly** is the scheduling link people use to book time on your calendar without the back-and-forth. The official Calendly connector is a **hosted MCP server** (`https://mcp.calendly.com`), published by Calendly, that lets your agent check availability, look up scheduled events, and manage booking links using the calendar setup you already have in Calendly.

Ask *"What's my earliest opening this week for a 30-minute call?"* and it checks your event types and availability. Say *"Send me a one-time scheduling link for a 15-minute intro call"* and it generates one you can hand to a prospect directly. It's for answering "when am I free" and handling the routine parts of booking without opening the dashboard.

### What you can ask

- *"What's my earliest opening this week for a 30-minute call?"*
- *"Generate a one-time scheduling link for a 15-minute intro call."*
- *"Show me my scheduled events for tomorrow."*
- *"Cancel my 2pm call on Friday and let me know it's done."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Calendly account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Calendly's OAuth flow in your browser — the client registers itself automatically, no manual app setup.
3. Sign in and authorize access. What the agent can see or do is bounded by your own Calendly account.

**Honest note:** this is a **hosted server run by Calendly** (`https://mcp.calendly.com`), not something that runs on your computer. It went generally available February 17, 2026, so it's the current supported path for connecting AI assistants to Calendly.

--- dev ---

Calendly publishes its MCP server as a **remote/hosted server**, fully hosted at `https://mcp.calendly.com`, documented at `developer.calendly.com/calendly-mcp-server`. There's no local stdio package — you connect to the hosted URL and bridge locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.calendly.com
```

Auth is **OAuth 2.1 (Authorization Code + PKCE, S256) with Dynamic Client Registration (RFC 7591)** — no manual OAuth app or pre-issued credentials required. Per the official docs, clients discover the server via two metadata endpoints, `https://mcp.calendly.com/.well-known/oauth-protected-resource` and `https://calendly.com/.well-known/oauth-authorization-server`, then self-register at `https://calendly.com/oauth/register` to get a `client_id` before starting the standard authorization-code + PKCE flow (a browser opens for user consent).

Tools, per the official docs: listing event types, finding available time slots, managing availability and scheduling rules, retrieving scheduling links, creating scheduled events, canceling events, and generating one-time scheduling links. The full tool list is published at the docs' `/supported-tools` page.

Since booking/canceling events changes what shows up on a real calendar, TerminalSync gates the create/cancel tools behind a confirmation step.

License: proprietary SaaS terms (Calendly Terms of Service, `calendly.com/legal`). Source: developer.calendly.com/calendly-mcp-server.
