---
name: PostHog
logo: /connectors/posthog.svg
category: dev
status: available
simpleTitle: "Ask your product analytics in plain language"
simpleSubtitle: "Official PostHog server: feature flags, insights, experiments, and error tracking."
devTitle: "PostHog MCP Connector"
devSubtitle: "Official hosted PostHog MCP: tools over your PostHog project, personal-API-key scoped."
ctaUrl: "https://posthog.com"
tokenHelpUrl: "https://app.posthog.com/settings/user-api-keys?preset=mcp_server"
manifest:
  mcpServers:
    posthog:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.posthog.com/mcp", "--header", "Authorization:${POSTHOG_AUTH_HEADER}"]
      env:
        POSTHOG_AUTH_HEADER: "Bearer ${SECRET:POSTHOG_API_KEY}"
affiliate: false
tagline: "Your product analytics, within reach of the agent"
originalAuthor: "PostHog"
originalAuthorUrl: "https://github.com/PostHog/mcp"
license: "MIT"
licenseUrl: "https://github.com/PostHog/mcp/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**PostHog** is the product analytics platform your team uses to see how people actually use your app: events and funnels, feature flags, A/B experiments, dashboards, and error tracking, all in one place. The official connector, published by PostHog, is a **hosted MCP server** (`https://mcp.posthog.com/mcp`) that acts as a proxy to your PostHog instance — it turns what you ask into calls against your project and returns the results directly to your AI client.

Ask *"How many unique users signed up in the last 7 days, broken down by day?"* and the `query-run` tool executes a trends query and answers with daily counts. Say *"Create a feature flag called 'new-checkout-flow' that's enabled for 20% of users"* and it creates the flag and shows the configuration. It talks to PostHog with your personal API key, so it can do what that key is allowed to do in your account.

### What you can ask

- *"Create a feature flag called 'new-checkout-flow' that's enabled for 20% of users, and show me the configuration."*
- *"How many unique users signed up in the last 7 days, broken down by day?"*
- *"Create an A/B test for our pricing page that measures conversion to the checkout page."*
- *"What are the top 5 errors in my project this week and how many users are affected?"*

For simpler queries you can use shorter prompts, straight from the README: *"What feature flags do I have active?"*, *"Show me my LLM costs this week"*, *"List my dashboards"*, *"What events are being tracked?"*

### What token you need

You need a **PostHog personal API key** — the key that lets software act on your PostHog account.

1. Sign in to PostHog and open the [personal API keys settings with the MCP Server preset](https://app.posthog.com/settings/user-api-keys?preset=mcp_server).
2. Create the key with that preset — it sets the scopes the MCP server needs — then copy it.
3. Paste it when the Lab asks for `POSTHOG_API_KEY`. It's stored encrypted in your Keychain, and injected as the `Authorization: Bearer` header (`POSTHOG_AUTH_HEADER`) the server expects.

**Honest disclosure, straight from PostHog's docs:** this is a **hosted/remote server**, not a local one — it runs in PostHog's US and EU Kubernetes clusters and stores session state (your active project/organization) in the region you connect to, cached temporarily and keyed by your API key hash. A stateless Cloudflare Worker sits in front of it only to authenticate requests and route them to your cloud region; *"it does not store any sensitive data."* The server *"acts as a proxy to your PostHog instance. It does not store your analytics data — all queries are executed against your PostHog project and results are returned directly to your AI client."* What the agent can read or change is bounded by your personal API key's scopes. EU users should use the `mcp-eu.posthog.com` endpoint so OAuth flows route to the EU instance.

--- dev ---

PostHog ships the MCP as a **remote/hosted server** at `https://mcp.posthog.com/mcp` (repo `PostHog/mcp`; the server itself now lives in the PostHog monorepo under `services/mcp`). The README documents **no local `@posthog/mcp` stdio command** — you connect to the hosted URL, and locally you bridge to it with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.posthog.com/mcp --header "Authorization:${POSTHOG_AUTH_HEADER}"
```

Auth is a **personal** PostHog API key passed as a Bearer token in the `Authorization` header. In the README the key is placed in the `POSTHOG_AUTH_HEADER` env var as `Bearer {INSERT_YOUR_PERSONAL_API_KEY_HERE}`; the manifest here injects the key from Keychain as `${SECRET:POSTHOG_API_KEY}` inside that same `Bearer …` header. PostHog also offers an automated installer for Cursor, Claude, Claude Code, VS Code and Zed via `npx @posthog/wizard@latest mcp add`.

**Server mode (`cli` vs `tools`).** The server can register every PostHog tool individually (**tools** mode) or wrap them all behind a single `posthog` CLI-like tool (**cli** mode). Per the README, *"cli is the default for all clients"* (it auto-selects tools mode only for a short allow-list — Cursor and ChatGPT). You can pin it with `?mode=cli` / `?mode=tools` or the `x-posthog-mcp-mode` header.

**Capabilities are grouped into features** (from the README's feature-filtering table — you can limit what's exposed via `?features=…`):

| Feature                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `workspace`              | Organization and project management              |
| `actions`                | Action definitions                               |
| `activity_logs`          | Activity log viewing                             |
| `alerts`                 | Alert management                                 |
| `annotations`            | Annotation management                            |
| `cohorts`                | Cohort management                                |
| `dashboards`             | Dashboard creation and management                |
| `data_schema`            | Data schema exploration                          |
| `data_warehouse`         | Data warehouse management                        |
| `debug`                  | Debug and diagnostic tools                       |
| `docs`                   | PostHog documentation search                     |
| `early_access_features`  | Early access feature management                  |
| `error_tracking`         | Error monitoring and debugging                   |
| `events`                 | Event and property definitions                   |
| `experiments`            | A/B testing experiments                          |
| `flags`                  | Feature flag management                          |
| `hog_functions`          | CDP function management                          |
| `hog_function_templates` | CDP function template browsing                   |
| `insights`               | Analytics insights                               |
| `llm_analytics`          | AI observability evaluations                     |
| `prompts`                | LLM prompt management                            |
| `logs`                   | Log querying                                     |
| `notebooks`              | Notebook management                              |
| `persons`                | Person and group management                      |
| `reverse_proxy`          | Reverse proxy record management                  |
| `search`                 | Entity search across the project                 |
| `sql`                    | SQL query execution                              |
| `surveys`                | Survey management                                |
| `workflows`              | Workflow management                              |

Hyphens and underscores are treated as equivalent in feature names (`error-tracking` == `error_tracking`). The README does **not** publish a full flat tool list inline — it points to `schema/tool-definitions-all.json` and the [docs](https://posthog.com/docs/model-context-protocol) — but the worked examples name individual tools verbatim: `create-feature-flag`, `query-run`, `experiment-create`, `query-error-tracking-issues-list`, and the tool-filtering example lists `dashboard-get`, `feature-flag-get-all`, `execute-sql`. You can allowlist exact tool names with `?tools=dashboard-get,feature-flag-get-all,execute-sql`; when both `features` and `tools` are given they combine as a **union**.

**Self-hosted PostHog:** set `POSTHOG_API_BASE_URL` (e.g. `https://posthog.example.com`) when running the server against your own instance.

**Data handling, in PostHog's own words:** *"The MCP server acts as a proxy to your PostHog instance. It does not store your analytics data — all queries are executed against your PostHog project and results are returned directly to your AI client. Session state (active project/organization) is cached temporarily, keyed by your API key hash."*

Terminal Sync keeps the API key in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT (Copyright (c) 2025 PostHog). Source: github.com/PostHog/mcp. Docs: posthog.com/docs/model-context-protocol.
