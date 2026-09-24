---
name: Ramp
logo: /connectors/ramp.svg
category: automation
status: available
simpleTitle: "Your company spend, answered in plain language"
simpleSubtitle: "Official Ramp MCP server: cards, expenses, reimbursements and approvals over OAuth, no API key to paste."
devTitle: "Ramp MCP Connector"
devSubtitle: "Official hosted Ramp MCP (mcp.ramp.com/mcp) — transactions, reimbursements, cards, vendors, approvals and spend analysis through OAuth."
ctaUrl: "https://ramp.com"
tokenHelpUrl: "https://support.ramp.com/hc/en-us/articles/45516494479891-Ramp-MCP"
manifest:
  mcpServers:
    ramp:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.ramp.com/mcp"]
affiliate: false
tagline: "Your spend and your cards, within reach of the agent"
originalAuthor: "Ramp"
originalAuthorUrl: "https://docs.ramp.com/developer-api/v1/ramp-mcp"
license: "proprietary"
licenseUrl: "https://ramp.com/legal/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Ramp** is the spend-management platform many small and mid-size businesses run their corporate cards, bill pay, expense policies and reimbursements on. The official Ramp connector is a **hosted MCP server** (`https://mcp.ramp.com/mcp`), published by Ramp, that lets your agent answer questions about your spend and take the routine actions using your own Ramp login — no API key to paste.

Ask *"Show me our top software vendors by spend this quarter"* and it reads your transaction data. Ask *"Find transactions with missing receipts or memos in the last 14 days"* and it combs the ledger for you. Employees get their own wins: *"What Ramp cards do I have, and what are their balances?"*, *"Is my planned $300 client dinner within policy?"* — even *"Lock my card — I can't find it."* In Ramp's own words, "admins can analyze data to identify spend trends and forecasting insights, while employees can check balances, request reimbursements, or get policy answers directly from their daily tools."

### What you can ask

- *"Show me our top software vendors by spend this quarter."*
- *"Find transactions with missing receipts or memos in the last 14 days."*
- *"Pull pending reimbursements and requests for the CFO's weekly report."*
- *"What Ramp cards do I have, and what are their balances?"*
- *"Is my planned $300 client dinner within policy?"*
- *"Lock my card — I can't find it."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Ramp account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Ramp's OAuth login in your browser — sign in with the Ramp account you already use.
3. Approve it, and your permissions come with you: "The Ramp connection respects each user's role and access. The AI tool can only see data and take actions that the signed-in user can already perform in Ramp."

**Honest note:** this is a server **hosted by Ramp** (`https://mcp.ramp.com/mcp`), not something that runs on your computer. Unlike read-only connectors, Ramp MCP can also **act**: approve or reject transactions and reimbursements, lock or unlock cards, and apply accounting coding — always bounded by what your own Ramp role already allows. Two things it can't do, per Ramp's docs: approve bills (you do that in Ramp directly) and upload receipt files (attach those in Ramp). Ramp's setup guide lives at [support.ramp.com](https://support.ramp.com/hc/en-us/articles/45516494479891-Ramp-MCP).

--- dev ---

Ramp publishes its **Ramp MCP** as a remote/hosted server, production endpoint `https://mcp.ramp.com/mcp` (Streamable HTTP), documented in Ramp's developer docs (`docs.ramp.com/developer-api/v1/ramp-mcp`) and the Help Center setup guide. There's no npm package and no local stdio server — you bridge locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.ramp.com/mcp
```

Auth is **OAuth** in the browser (no client secret to store). Ramp's docs note that custom MCP clients and third-party gateways must have their exact redirect URI allowlisted by Ramp first (`https://`, `localhost`/`127.0.0.1` or approved schemes; no wildcard subdomains); off-the-shelf clients like the one bridged by `mcp-remote` work out of the box. A demo endpoint with sample data exists at `https://demo-mcp.ramp.com/mcp`, and businesses managing multiple Ramp entities can keep one connection per business via the alias form `https://mcp.ramp.com/<business-identifier>/mcp`.

Ramp documents its tools **grouped by intent, not by tool name** — "the underlying surface evolves continuously. Disconnect and reconnect your client to pick up new tools" — so this connector describes the published capability surface instead of a frozen tool list:

- **Read and analyze spend** — search transactions, pull spend exports, query vendors and accounting categories, load departments and entities, get treasury balances and the org chart.
- **Process approvals** — approve or reject transactions, reimbursements, and unified requests (POs, fund requests). Bill approvals are not yet available via MCP.
- **Submit and complete expenses** — employees submit expenses and reimbursements, complete required details, and move their own reimbursement requests forward.
- **Edit, submit, and act on workflows** — edit transactions (memo, coding, trip), submit reimbursements, post comments, manage cards (lock, unlock, activate), apply GL coding.
- **Answer questions** — policy Q&A, Help Center search, decline explanations.
- **Make purchases** — generate Agent Card credentials for one-time payments.
- **Manage trips** — create trips, view trips, connect transactions to trips, retrieve flight and hotel bookings.

The Help Center's full capability reference additionally covers bills (search, details, invoice attachments, pending approvals), spending limits and Spend Programs, Ramp Banking accounts and balances, organization and people data, and accounting coding. On permissions: "most company-wide data tools (spend exports, vendor management, GL coding) require admin or business-owner permissions. Employees see only their own data; admins see company-wide data", and admins control who can connect at all from **Company → Integrations → Ramp MCP → Manage access** (a Ramp Plus feature). Ramp attributes MCP calls to the signed-in user.

**Disclosure:** this is a hosted server (not local) that can both read and write (approvals, card locks, coding); receipt/PDF uploads are not supported through MCP; queries that would return more than 100 rows come back empty until you narrow the request; and Ramp states "Ramp MCP is subject to change", with new tools added regularly. The archived open-source repo `ramp-public/ramp_mcp` (MIT) predates the hosted server and is not what this connector installs.

License: proprietary SaaS (Ramp Terms of Service, `ramp.com/legal/terms`). Source: Ramp developer docs (`docs.ramp.com/developer-api/v1/ramp-mcp`) + Ramp Help Center (`support.ramp.com/hc/en-us/articles/45516494479891-Ramp-MCP`).
