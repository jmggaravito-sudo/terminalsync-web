---
name: Meta Ads
logo: /connectors/meta-ads.svg
category: automation
status: available
simpleTitle: "Ask your AI how your Facebook & Instagram ads are doing"
simpleSubtitle: "A first-party Terminal Sync connector over Meta's official API: spend, results and campaigns — read-only."
devTitle: "Meta Ads Insights Connector"
devSubtitle: "First-party read-only MCP server over Meta's official Marketing (Graph) API."
ctaUrl: "https://business.facebook.com"
tokenHelpUrl: "https://developers.facebook.com/docs/marketing-api/overview/authorization"
affiliate: false
tagline: "Your Meta campaigns, watched by the agent"
originalAuthor: "Terminal Sync"
originalAuthorUrl: "https://terminalsync.ai"
license: "proprietary"
licenseUrl: "https://terminalsync.ai"
---
**Meta Ads** are Facebook and Instagram ads. This connector is **built by Terminal Sync**: we talk to Meta's **official Marketing API** so your assistant can **watch how your campaigns are doing** and answer in plain language — without you opening Ads Manager.

It's the piece that powers the **"Campaign watchdog"** automated job: the AI checks spend and results and warns you before the budget runs away.

You connect it **inside the app**, at **Settings → Integrations → Meta Ads**. It's **read-only**: the AI reads your metrics, it **doesn't change or pause your ads**, so it's safe from day one. Your token is stored **encrypted on your computer**.

### What you can ask

- *"How much did I spend on ads this week and how many results?"*
- *"How is each active campaign doing — CTR, cost per click, reach?"*
- *"What ad accounts do I have connected?"*

### What you need

You need a **Meta access token** with ads read permission (`ads_read`), generated in Meta's developer ecosystem. The official guide is at [developers.facebook.com](https://developers.facebook.com/docs/marketing-api/overview/authorization). Then paste it in **Settings → Integrations → Meta Ads**, test the connection, and you're set.

> **Note:** Meta requires more steps than other platforms to grant access. We're building a **"Connect with Facebook"** button to simplify all this — for now it uses a token.

--- dev ---

**First-party** connector: Terminal Sync bundles its own MCP server (`terminalsync-meta-ads-mcp`, a Tauri sidecar) that speaks Meta's **Marketing (Graph) API**. **Read-only (insights)** — it doesn't mutate campaigns. Meta doesn't publish an owner-facing official MCP (npm packages are third-party); hence the first-party build.

**Config (injected by the app from the encrypted store):** `META_ADS_ACCESS_TOKEN` (token with `ads_read`, stored in the OS keychain, never in a config file), and optional `META_ADS_API_VERSION`.

**Tools:** `meta_ads_list_accounts`, `meta_ads_list_campaigns`, `meta_ads_insights` (spend, impressions, clicks, CTR, CPC, CPM, reach, by account or campaign and `date_preset`).

The connection happens at **Settings → Integrations → Meta Ads** (it verifies the token before saving and wires the server into Claude/Codex/Gemini). **Auth:** a long-lived token works today; the non-technical-owner path is an OAuth "Connect with Facebook" flow (a Meta app + `ads_read` review). Source: Meta's official Marketing API (`developers.facebook.com`).
