---
name: beehiiv
logo: /connectors/beehiiv.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Work your beehiiv newsletter from the chat"
simpleSubtitle: "Official beehiiv MCP: draft posts, review your audience and your metrics with your beehiiv account sign-in — no API key to paste."
devTitle: "beehiiv MCP Connector"
devSubtitle: "Official hosted beehiiv MCP (mcp.beehiiv.com/mcp) — posts, audience, monetisation and analytics over OAuth 2.1."
ctaUrl: "https://www.beehiiv.com"
tokenHelpUrl: "https://app.beehiiv.com/settings/workspace/mcp"
manifest:
  mcpServers:
    beehiiv:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.beehiiv.com/mcp"]
affiliate: false
tagline: "Your newsletter and its audience, one ask away"
originalAuthor: "beehiiv"
originalAuthorUrl: "https://github.com/beehiiv/agents"
license: "proprietary"
licenseUrl: "https://www.beehiiv.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-02T14:30:00.000Z"
verifiedPackageVersion: null
---
**beehiiv** is the newsletter platform publications and creators use to write, grow and make money from their audience. beehiiv's official MCP server connects your agent to your beehiiv workspace — the official repo introduces itself as *"Official beehiiv tools for AI agents, built on the beehiiv MCP server"* and clarifies that *"Nothing runs on your machine"* — so you work your newsletter by chatting, without pasting any API key into TerminalSync.

The agent **prepares and reviews; you decide what goes public**: the official docs are explicit about the most important point — *"Publishing and sending stay human actions in beehiiv, so the agent prepares the post and you press send"* — and the same goes for automations: *"Activating an automation stays a human action in the editor."* Ask *"Draft a post about this week's news, newsletter style"* and it leaves the draft ready. Ask *"How did the last post perform: opens, clicks and churn?"* and it brings the metrics.

The official surface, by area: **posts** (draft, edit and duplicate posts and post templates; read content, stats, clicks, comments and per-subscriber engagement), **communities** (channels, pinned posts, moderation, members, invites), **podcasts** (shows, episodes, audio, transcripts), **automations** (journeys, steps, triggers, emails, A/B variants), **audience** (subscriptions, segments, tags, custom fields, lists and signup flows), **monetisation** (products, tiers, premium offers, orders, paywalls, the ad network and the sponsor network), **growth** (recommendations, referral programs, surveys) and **analytics** (publication, website, posts, earnings).

### What you can ask

- *"Draft a post announcing this week's news, newsletter tone."*
- *"How did my last post perform: opens, clicks and unsubscribes?"*
- *"Create a segment with the subscribers who opened the last 3 posts."*
- *"Summarize the responses to the latest survey."*
- *"Which posts brought the most ad network revenue this month?"*
- *"Search beehiiv's documentation for how a paywall works."*

The server also **documents itself**: the official docs say to ask the agent to call `search_documentation`, `read_documentation`, or any of the `learn_*` tools, and it fetches current guidance on beehiiv rather than guessing.

Before anything that changes your workspace — creating a post, a segment, an automation — your agent asks for confirmation first.

### How you connect

This connector **does not ask you to paste any API key**. The official docs put it verbatim: *"OAuth 2.1. There is no API key to copy and no secret to store in this repo."*

1. Activate the connector in TerminalSync.
2. The `mcp-remote` bridge opens beehiiv in your browser — the client registers itself (RFC 7591 dynamic registration) and takes you to the sign-in.
3. You sign in and grant access: the agent receives an access token and a refresh token scoped to `read` and `write`. *"Every tool call is authorised against your own beehiiv permissions. The agent can only reach publications you can already reach."*

**Requirements from the official docs:** a beehiiv account on a plan that includes MCP access, and MCP enabled for your workspace under [Settings → Workspace → MCP](https://app.beehiiv.com/settings/workspace/mcp). If MCP is off, tool calls return a permission error. Some tool groups are gated separately — *"the tools an agent sees depend on your plan and workspace settings."*

**Honest disclosure:** this is a server **hosted by beehiiv** (`https://mcp.beehiiv.com/mcp`), not something running on your computer. What the agent can see or do is limited by your own beehiiv permissions and by your workspace settings.

--- dev ---

beehiiv publishes an **official remote MCP server** — the MCP registry lists `com.beehiiv/beehiiv`, and the vendor repo is `github.com/beehiiv/agents` (org `beehiiv`, official site `beehiiv.com`): *"This repository holds the plugin manifests for Claude Code, Grok Build, Gemini CLI, Cursor and Codex, plus the official MCP registry entry. They all point at the same hosted server at `https://mcp.beehiiv.com/mcp`."* The shared manifest lives at `plugins/beehiiv/.mcp.json` and *"states the server URL once"*; the per-ecosystem manifests delegate to that file.

TerminalSync uses the `mcp-remote` bridge to connect your machine to the hosted endpoint:

```
npx -y mcp-remote@latest https://mcp.beehiiv.com/mcp
```

Auth: **OAuth 2.1 with RFC 7591 dynamic client registration + PKCE** — no API key and no secret. Own verification 2026-11-02: `POST initialize` without credentials → **401**; `/.well-known/oauth-protected-resource` declares resource `https://mcp.beehiiv.com` with `authorization_servers: ["https://mcp.beehiiv.com"]` and scopes `read`/`write`/`openid`/`email`; `/.well-known/oauth-authorization-server` declares `issuer: "https://mcp.beehiiv.com"` (matches the PRM) and `registration_endpoint: https://mcp.beehiiv.com/register` → `mcp-remote`'s dynamic registration is viable. Tokens: access + refresh, scopes `read` and `write`.

Surface by group (verbatim from the official README): **Posts** (*"Draft, edit and duplicate posts and post templates. Read post content, stats, clicks, comments and per-subscriber engagement"*), **Communities** (*"Create channels, publish and pin posts, moderate reports, manage members and roles, send invites and direct messages, read community metrics"*), **Podcasts** (*"Create shows and episodes, upload audio, schedule episodes, read transcripts and episode stats"*), **Automations** (*"Build journeys, steps, triggers and automation emails, including A/B variants"*), **Audience** (*"Manage subscriptions, segments, tags, custom fields, newsletter lists and signup flows"*), **Monetisation** (*"Products, tiers, premium offers, orders, paywalls, the ad network and the sponsor network"*), **Growth** (*"Recommendations, referral programs, polls and surveys"*), **Analytics** (*"Publication and website analytics, post and podcast stats, poll and survey responses, earnings"*). Self-documentation: `search_documentation`, `read_documentation`, `learn_*`.

Documented human gates: post publishing/sending and automation activation **stay in beehiiv's editor** — the agent prepares, the human executes. The plugin's skill pack (media kits, performance reports, unsubscribe spikes, upgrade campaigns) loads with the plugin on Agent Skills clients; other clients get the MCP server alone. The docs do not publish a flat tool list — the live list depends on plan and workspace (*"Some tool groups are gated separately"*).

Smoke 2026-11-02: `POST initialize` without credentials → 401 and consistent OAuth metadata (above); this run did not complete a sign-in with a real beehiiv account. Markets: `["GLOBAL"]` — the README declares no country restrictions; the documented requirement is a plan with MCP access and MCP enabled per workspace.

License: proprietary SaaS (`beehiiv.com` terms); the `beehiiv/agents` repo publishes plugin manifests only. Source: github.com/beehiiv/agents (README, read verbatim 2026-11-02) + MCP registry `com.beehiiv/beehiiv`.
