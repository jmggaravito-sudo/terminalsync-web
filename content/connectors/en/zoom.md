---
name: Zoom
logo: /connectors/zoom.svg
category: productivity
status: available
simpleTitle: "Find what was said in your Zoom meetings"
simpleSubtitle: "Official Zoom server: summaries, transcripts, recordings, chat and docs, in plain language."
devTitle: "Zoom Workspace MCP Connector"
devSubtitle: "Official hosted Zoom Workspace MCP (mcp.zoom.us) — meetings, Team Chat and Docs over OAuth."
ctaUrl: "https://zoom.us"
tokenHelpUrl: "https://developers.zoom.us/docs/mcp/servers/connect-to-zoom-mcp-servers/"
manifest:
  mcpServers:
    zoom:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.zoom.us/mcp/zoom/streamable"]
affiliate: false
tagline: "Your Zoom meetings, within reach of the agent"
originalAuthor: "Zoom"
originalAuthorUrl: "https://github.com/zoom/mcp-registry"
license: "MIT"
licenseUrl: "https://github.com/zoom/mcp-registry/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "productivity"
---
**Zoom** is the video-calling app you use for work meetings. The official Zoom connector — the **Zoom Workspace** server, published by Zoom — lets you ask, in plain language, about everything those meetings leave behind: AI-generated summaries, transcripts, recordings, your Team Chat, and Zoom Docs, without opening the app and digging by hand. It's a **hosted server** (`https://mcp.zoom.us/mcp/zoom/streamable`): it runs in Zoom's cloud and you connect with your own Zoom account, so it only sees what you can already see.

Ask *"Which meeting did we discuss the campaign budget in?"* and it searches your meetings, chats, and docs to find the summary, transcript, or recording where it came up. Say *"Draft a follow-up doc with the next steps from yesterday's meeting"* and it creates a new Zoom Doc from the notes and action items. It's for locating where a topic was discussed, generating agendas, capturing notes, identifying action items, and creating follow-up documents from what's already in Zoom.

### What you can ask

- *"Search my meetings for where we talked about the launch and bring me the summary."*
- *"Show me the recording and next steps from Tuesday's client meeting."*
- *"Create a follow-up Zoom Doc with the action items from yesterday's meeting."*
- *"What did the team chat say about the delivery date?"*

Straight from Zoom's official examples: *"Search meeting content"* (search meetings, chat and docs), *"Review recording resources"* (retrieve recording summaries, next steps, and playback links) and *"Create follow-up docs"* (generate a new Zoom Doc from Markdown with notes or action items).

### How you connect

This connector **doesn't ask you to paste any API key**. It uses your own Zoom account login:

1. When you enable it, a browser window opens for you to sign in to Zoom and authorize access (OAuth).
2. You approve the permissions with your account — the connector can only see and do what that account is allowed to.
3. That's it: no token to copy or renew by hand. Zoom's official connection guide is at [developers.zoom.us](https://developers.zoom.us/docs/mcp/servers/connect-to-zoom-mcp-servers/).

**Honest note:** it's a server **hosted by Zoom** (it doesn't run on your computer). Locally you use the `mcp-remote` bridge, which opens the OAuth flow and keeps the connection to `https://mcp.zoom.us/mcp/zoom/streamable`. What the agent can see or create is bounded by your Zoom account's permissions.

--- dev ---

Zoom publishes **Zoom Workspace** as a **remote/hosted MCP server** at `https://mcp.zoom.us/mcp/zoom/streamable` (`streamable-http` transport). The official source is the repo `github.com/zoom/mcp-registry` (namespace `io.github.zoom/zoom-workspace`, version 1.0.2, MIT) and the docs at `developers.zoom.us/docs/mcp/zoom/`. There's no local stdio command: you connect to the hosted URL and bridge it locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.zoom.us/mcp/zoom/streamable
```

Auth is **OAuth** against your Zoom account — `mcp-remote` opens the browser for login and there's no secret to inject (that's why the manifest declares no `env`). Zoom Workspace exposes meetings, Team Chat, and Zoom Docs: natural-language retrieval of AI-generated summaries, transcripts, recordings, shared documents, and meeting assets, plus recording-specific resources such as playback links and next steps; it can retrieve Zoom Docs content, list cloud recordings, and create follow-up Zoom Docs from Markdown. Zoom publishes other focused servers on the same base endpoint (`/mcp/meeting/streamable`, `/mcp/chat/streamable`, `/mcp/docs/streamable`, `/mcp/tasks/streamable`, etc.); this connector uses Workspace, the broadest one.
