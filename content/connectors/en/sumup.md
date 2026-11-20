---
name: SumUp
logo: /connectors/sumup.svg
category: automation
markets: ["GLOBAL"]
status: soon
simpleTitle: "Your SumUp payments, reviewed and created by conversation"
simpleSubtitle: "Official SumUp MCP server: review transactions, create checkouts and query your merchant profile over OAuth."
devTitle: "SumUp MCP Connector"
devSubtitle: "Official hosted SumUp MCP (mcp.sumup.com) — merchant, transactions, checkouts and payment workflows."
ctaUrl: "https://www.sumup.com"
tokenHelpUrl: "https://developer.sumup.com/tools/llms/mcp-server/"
manifest:
  mcpServers:
    sumup:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.sumup.com/mcp"]
affiliate: false
tagline: "Your business's money, within reach of the agent"
originalAuthor: "SumUp"
originalAuthorUrl: "https://developer.sumup.com/tools/llms/mcp-server/"
license: "Apache-2.0"
licenseUrl: "https://github.com/sumup/sumup-mcp/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: false
installableForAiReason: "needs-oauth"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-16T14:28:17.460Z"
verifiedPackageVersion: null
---
**SumUp** is the payments platform businesses use to take card payments online and in person. It published its official MCP server for *"interactions between large language models (LLMs) and SumUp APIs"*, so that *"you can connect to SumUp's services from an MCP client (e.g. Cursor, Claude) and use natural language to work with your SumUp account"*. The server's official card describes it as: *"SumUp payment APIs and developer documentation. Connect through your client's OAuth sign-in"*. The connector is a **hosted MCP server** (`https://mcp.sumup.com/mcp`).

What that means day to day — straight from the official *"What You Can Do"* section: your agent can query your merchant profile and review transactions, create checkouts and inspect their status, build payment workflows with SumUp's Cloud API (online and in-person payments), and read the developer documentation and the OpenAPI specification of the SumUp API as MCP resources.

### What you can ask

- *"Show me my merchant profile."*
- *"Review my store's transactions and summarize how the day is going."*
- *"Using my sandbox merchant, create a checkout for 12.34 EUR with a unique reference and return its ID. Do not process a payment."*
- *"What is SumUp's Cloud API and how do I build an in-person payment flow?"*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses SumUp's sign-in:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge discovers SumUp's authorization server from the endpoint's metadata and opens the authorization page in your browser: you sign in with your SumUp account and approve access.
3. Done — the connection is tied to your SumUp account and to whatever you approve in that login.

**Honest note:** this is a **server hosted by SumUp** (`https://mcp.sumup.com/mcp`), not something that runs on your computer. SumUp API keys (`sup_sk_...`) **do not work** against the hosted server — the connection is OAuth with your SumUp account, and access is capped by what you approve in that authorization. The official docs recommend testing against a **sandbox merchant** first: *"Before testing payment workflows, connect a sandbox merchant account"* — and its own verification example is read-only: *"Use the SumUp MCP tools to show my merchant profile"*. Creating checkouts is a real action on your SumUp account.

**Why it shows as Coming soon:** the server is live and its login is OAuth, but when this listing was prepared (2026-11-16) TerminalSync's connection smoke stopped **before the login**: SumUp's two OAuth metadata documents (the protected resource's and the authorization server's) declare the same identity differently — `https://auth.sumup.com` vs `https://auth.sumup.com/` — and the connection bridge compares those identities exactly (RFC 8414 §3.3), aborting with `IssuerMismatchError`. The listing ships with SumUp's documented official configuration and will be enabled as soon as the vendor aligns the metadata — re-verify with `node scripts/smoke-remote-login.mjs --slugs sumup`.

--- dev ---

SumUp (official GitHub org `sumup`) publishes its MCP server as a **remote/hosted server**: official repo `github.com/sumup/sumup-mcp` (LICENSE Apache-2.0), official server card `com.sumup/mcp` at `developer.sumup.com/.well-known/mcp/server-card.json`, and the MCP guide at `developer.sumup.com/tools/llms/mcp-server/`. The hosted worker *"runs as a Cloudflare Worker and serves the MCP transport for SumUp"*. Endpoint: `https://mcp.sumup.com/mcp` (**Streamable HTTP**; it also exposes the legacy `/sse` transport — *"Use `/mcp` for new connections"*). The catalog bridge is the generic client pattern:

```
npx -y mcp-remote@latest https://mcp.sumup.com/mcp
```

Auth: **OAuth resource-server flow** — *"The worker publishes protected resource metadata that points clients to the SumUp authorization server"*, and *"The client discovers the SumUp authorization server through the endpoint's protected resource metadata and asks you to authorize access in your browser"*. The server accepts *"OAuth access tokens issued for the MCP resource"* — *"Bearer tokens must be JWT access tokens issued by `SUMUP_AUTH_HOST` and valid for the worker resource URL"* — and API keys *"such as `sup_sk_...` are not valid Bearer tokens for the hosted server"* (the official troubleshooting repeats it: if you configured a `sup_sk_...` Bearer token, *"remove it and reconnect through OAuth"*). **Smoke 2026-11-16:** `mcp-remote` vs `https://mcp.sumup.com/mcp` → `IssuerMismatchError: Issuer mismatch in authorization server metadata (RFC 8414 §3.3): expected "https://auth.sumup.com", received "https://auth.sumup.com/"` — hence the listing ships with `installableForAi: false` (reason `needs-oauth`) and `sumup` in `REMOTE_WITHOUT_DCR` in `scripts/verify-connector.mjs` until the vendor aligns the metadata.

Surface (verbatim from the official guide, "What You Can Do"): *"Query your merchant profile and review transactions"*, *"Create checkouts and inspect their status"*, *"Build payment workflows with [Cloud API]"*, *"Read SumUp developer documentation and the OpenAPI specification through MCP resources"* — clients with MCP resource support can read `https://developer.sumup.com/llms.txt` (docs index) and `https://developer.sumup.com/openapi.json` (full SumUp API specification). The docs do not publish a flat list of payment-server tools. The separate **documentation server** at `https://developer.sumup.com/mcp` (two tools, `list_pages` and `get_page`) is not the payments connector and is not shipped. Official verification example: *"Using my sandbox merchant, create a checkout for 12.34 EUR with a unique reference and return its ID. Do not process a payment."* — to test payment workflows, the docs point to connecting a sandbox merchant account first (`developer.sumup.com/online-payments/#getting-a-sandbox-merchant-account`).

Documented local variant, **not shipped**: there is a local MCP CLI (`npx -y @sumup/mcp`, repo `sumup/sumup-ai/tree/main/mcp`, Node ≥ 22, auth `SUMUP_API_KEY` with a `sup_sk_...` API key) for stdio clients — the docs position it for that case and recommend the hosted server for new connections. Companion official skills at `github.com/sumup/sumup-skills`.

License: Apache-2.0 (LICENSE of the official repo `sumup/sumup-mcp`); the hosted server is consumed as SumUp's SaaS. Source: developer.sumup.com/tools/llms/mcp-server/ + developer.sumup.com/tools/llms/setup/ + repo README + official server card + MCP registry (`io.github.sumup/mcp`).
