---
name: SumUp
logo: /connectors/sumup.svg
category: automation
markets: ["US", "MX", "CO", "CL", "PE", "BR", "ES", "FR", "GB", "IE", "AU"]
status: available
simpleTitle: "Your SumUp payments and sales, managed by conversation"
simpleSubtitle: "SumUp's official MCP server: check your transactions, create checkouts and review your account with your SumUp API key."
devTitle: "SumUp MCP connector"
devSubtitle: "Official @sumup/mcp server (sumup/sumup-ai) — merchant profile, transactions, checkouts, customers and payouts."
ctaUrl: "https://sumup.com"
tokenHelpUrl: "https://developer.sumup.com/tools/authorization/api-keys/"
manifest:
  mcpServers:
    sumup:
      command: npx
      args: ["-y", "@sumup/mcp"]
      env:
        SUMUP_API_KEY: "${SECRET:SUMUP_API_KEY}"
affiliate: false
tagline: "SumUp payments and sales, within your agent's reach"
originalAuthor: "SumUp"
originalAuthorUrl: "https://github.com/sumup/sumup-ai"
license: "Apache-2.0"
licenseUrl: "https://github.com/sumup/sumup-ai/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "unverified-needs-key"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-09T12:00:00.000Z"
verifiedPackageVersion: "0.14.0"
verifiedWithoutKey: false
---
**SumUp** is the payments platform more than 4 million merchants use to take card payments, generate payment links and run their day-to-day sales — in their own words: *"We keep payments simple and reliable, so your business can keep the neighborhood buzzing."* SumUp's official MCP is described in the official registry as: *"Tools to explore SumUp accounts, payments, customers, and payouts."*

What that means in practice: your agent can query your merchant profile and your transactions, create and inspect checkouts (payment links for your customers), build payment workflows with SumUp's Cloud API, and read the official API documentation and specification the server exposes as resources. The tool surface evolves with the product — the official docs do not publish a flat list of tool names, so none are invented here.

### What you can ask

- *"How did my payments go this week and which transactions came in?"*
- *"Create a 50 USD checkout for the customer to pay and show me the details."*
- *"Show me my merchant profile: which currency it uses and how it is set up."*
- *"How do I build a payment with the SumUp API? Look it up in its official documentation."*

### What token you need

It connects with a **SumUp API key** — a one-time setup:

1. Go to [developer.sumup.com/tools/authorization/api-keys](https://developer.sumup.com/tools/authorization/api-keys/) (also reachable from the dashboard: `me.sumup.com/settings/developer`) and create your API key — it starts with `sup_sk_`.
2. Copy the value and paste it when the Lab asks you for `SUMUP_API_KEY`.

The key is stored encrypted in your Keychain and the server runs locally on your computer reading it from there — it never goes through third parties. Since charging touches real money, SumUp's guide recommends connecting a sandbox merchant account first to test payment workflows (*"connect a sandbox merchant account before testing payment workflows"*).

**Honest disclosure:** SumUp also offers a hosted OAuth variant (`https://mcp.sumup.com/mcp`, official in their documentation). At this run's verification (2026-11-09), its authorization metadata declares the issuer `https://auth.sumup.com/` with a trailing slash that breaks sign-in through `mcp-remote` (RFC 8414 §3.3) — that fix is on SumUp's side. That is why this connector uses the official local stdio server, the primary setup in the official docs; once SumUp fixes the metadata, it can migrate to the one-button sign-in.

--- dev ---

`@sumup/mcp` (v0.14.0, published by **SumUp** — publisher `SumUp <support@sumup.com>`, official repo `github.com/sumup/sumup-ai`, Apache-2.0) is SumUp's local stdio MCP server from their official AI toolkit. Setup verbatim from the official README:

```sh
SUMUP_API_KEY='sup_sk_...' npx -y @sumup/mcp
```

Requires Node.js 22+. The key (`sup_sk_...`) is created at `developer.sumup.com/tools/authorization/api-keys/` (dashboard: `me.sumup.com/settings/developer`); the README warns to keep it in your client's private configuration (*"Keep API keys in your client's private configuration and out of shared project files"*).

Official capabilities (from the developer docs, with no published tool names): query merchant profile and transactions, create and inspect checkouts, workflows with the Cloud API, and read documentation/OpenAPI via MCP resources; the official MCP registry describes it as *"Tools to explore SumUp accounts, payments, customers, and payouts"*.

The **hosted** OAuth variant (`https://mcp.sumup.com/mcp`, Streamable HTTP; the docs say to use `/mcp` for new connections and mark `/sse` as legacy) is documented at `developer.sumup.com/tools/llms/setup/`, but its authorization metadata declares issuer `https://auth.sumup.com/` (with a trailing slash) and `mcp-remote 0.15.2` rejects it: `IssuerMismatchError` (RFC 8414 §3.3), verified by this run's smoke (2026-11-09) — the same bug pattern Factorial had, which was fixed vendor-side. API keys do not work as a Bearer on the hosted server (*"keys 'are not valid Bearer tokens for the hosted endpoint'"*).

License: Apache-2.0 (LICENSE of the `sumup/sumup-ai` repo); the SumUp service is proprietary SaaS (`sumup.com/en-us/terms-and-conditions-overview/`). Source: npm `@sumup/mcp` (tarball README) + `developer.sumup.com/tools/llms/setup/` + `developer.sumup.com/tools/llms/mcp-server/` + MCP registry (`io.github.sumup/mcp`) + sumup.com.
