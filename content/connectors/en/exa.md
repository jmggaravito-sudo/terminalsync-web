---
name: Exa
logo: /connectors/exa.svg
category: research
status: available
simpleTitle: "Give your AI real-time web search built for AI"
simpleSubtitle: "Official Exa server: clean, ready-to-use web results — plus company and people research."
devTitle: "Exa MCP Connector"
devSubtitle: "Official exa-mcp-server (exa-labs): web_search_exa + research/crawl tools, EXA_API_KEY."
ctaUrl: "https://exa.ai"
tokenHelpUrl: "https://dashboard.exa.ai/api-keys"
manifest:
  mcpServers:
    exa:
      command: npx
      args: ["-y", "exa-mcp-server"]
      env:
        EXA_API_KEY: "${SECRET:EXA_API_KEY}"
affiliate: false
tagline: "Web search made for the agent"
originalAuthor: "Exa Labs"
originalAuthorUrl: "https://github.com/exa-labs"
license: "MIT"
licenseUrl: "https://github.com/exa-labs/exa-mcp-server/blob/main/LICENSE"
---
**Exa** is a search engine built for AI, not for humans clicking blue links. Its official connector, per the README, is *"a Model Context Protocol server with Exa for web search and web crawling"* that gives real-time results as **clean, ready-to-use content** — so the agent gets the actual text of a page, not a list of links to open. Beyond plain search it can research a company, find people, and run deeper multi-step research tasks.

Ask *"what are people saying about this product this month?"* and it searches the live web and summarizes. Ask *"research this company — what do they do, who runs it, recent news"* and it uses its company-research tool to pull a real profile. It's the difference between an AI guessing from old training data and one that actually looked it up today.

### What you can ask

- *"Search the web for what changed in EU data-privacy rules in 2026 and summarize the practical impact for a small business."*
- *"Research the company at stripe.com — what they do, size, and any recent announcements."*
- *"Find three recent, credible articles comparing solar vs. heat pumps for home heating and give me the takeaways."*

### What token you need

You need an **Exa API key**.

1. Go to [dashboard.exa.ai/api-keys](https://dashboard.exa.ai/api-keys) and create a free account.
2. Copy your API key.
3. Paste it when the Lab asks for `EXA_API_KEY`. It's stored encrypted in your Keychain.

Exa's free tier is enough to try it; heavier search and the deep-research tools draw more from your account, so check your usage in their dashboard.

--- dev ---

`exa-mcp-server` (Exa Labs, official — repo `exa-labs/exa-mcp-server`) runs via `npx -y exa-mcp-server` with `EXA_API_KEY` in the env. Tools per the README table: `web_search_exa` and `web_search_advanced_exa` (search with filters/domains/dates), `get_code_context_exa`, `company_research_exa`, `crawling_exa` (fetch a URL's content), `people_search_exa`, `linkedin_search_exa`, `deep_researcher_start` / `deep_researcher_check` (async multi-step research via Exa's Research API), and `deep_search_exa`. The set of enabled tools is selectable via the `tools` parameter (and on the hosted endpoint via `?tools=`).

Terminal Sync keeps `EXA_API_KEY` in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: github.com/exa-labs/exa-mcp-server.
