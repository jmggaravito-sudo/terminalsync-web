---
name: PandaDoc
logo: /connectors/pandadoc.svg
category: productivity
markets: ["GLOBAL"]
status: available
simpleTitle: "Your proposals and contracts, sent and signed"
simpleSubtitle: "Official PandaDoc MCP server: create, send and track proposals, quotes and invoices over OAuth."
devTitle: "PandaDoc MCP Connector"
devSubtitle: "Official hosted PandaDoc MCP (mcp.pandadoc.com/v1/mcp) — documents, quotes, approvals and invoices."
ctaUrl: "https://www.pandadoc.com"
tokenHelpUrl: "https://github.com/PandaDoc/mcp-server-guide"
manifest:
  mcpServers:
    pandadoc:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.pandadoc.com/v1/mcp"]
affiliate: false
tagline: "Proposals and contracts that go out on their own"
originalAuthor: "PandaDoc"
originalAuthorUrl: "https://github.com/PandaDoc/mcp-server-guide"
license: "MIT"
licenseUrl: "https://github.com/PandaDoc/mcp-server-guide/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-26T15:15:00.000Z"
verifiedPackageVersion: null
---
**PandaDoc** is the platform businesses use to build proposals, quotes, contracts and invoices, send them for e-signature and track every document. The official PandaDoc connector is a **hosted MCP server**: in its official description, *"Official PandaDoc MCP server and AI plugins · Hosted by PandaDoc · OAuth sign-in"*, and it says it plainly: *"PandaDoc hosts the server; you do not need to run one locally."*

What that means day to day: your agent can cover a document's full lifecycle — building proposals and quotes, sending NDAs and onboarding agreements for signature, routing internal approvals, handing off the invoice and seeing who has already signed. The official guide organizes that work into **9 guided workflows**: engagement tracker (signing progress), follow-up list, signing velocity, contract register, NDA fast send, quote builder, approval send, onboarding agreement and invoice handoff.

### What you can ask

- *"Draft a proposal with our standard pricing and get it ready to send to the client."*
- *"Send this NDA to the vendor and let me know once it's signed."*
- *"Who hasn't signed the contract I sent on Monday yet?"*
- *"Hand the project invoice off to the collections team."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses OAuth with your PandaDoc account:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens PandaDoc's login in your browser. When authorizing you pick your workspace and what the assistant may use: *"During authorization, select your workspace and choose what your assistant can access."*
3. Sign in and approve access. What the agent can do follows your own permissions: *"Actions follow the access you grant and your existing PandaDoc permissions."*

**Honest note:** this is a **server hosted by PandaDoc** (`https://mcp.pandadoc.com/v1/mcp`), not something that runs on your computer. Sending a document can notify its recipients — *"Sending a document can notify its recipients"* — and returned document content becomes part of your assistant's conversation. PandaDoc's document and operation limits apply. And if your account lives on `app.pandadoc.eu`, your account uses the European endpoint `https://mcp.pandadoc.eu/v1/mcp`, not this one.

--- dev ---

PandaDoc publishes its MCP server as a **remote/hosted server**, documented in the official guide `github.com/PandaDoc/mcp-server-guide`. Endpoints: `https://mcp.pandadoc.com/v1/mcp` (global) and `https://mcp.pandadoc.eu/v1/mcp` (`app.pandadoc.eu` accounts), both Streamable HTTP. There is no local stdio package; the catalog bridge is the generic client pattern the guide itself documents for HTTP clients (`claude mcp add pandadoc --transport http https://mcp.pandadoc.com/v1/mcp`):

```
npx -y mcp-remote@latest https://mcp.pandadoc.com/v1/mcp
```

Auth is **browser OAuth** — *"OAuth sign-in"* — with workspace selection during authorization. The guide does not publish a flat tool list: the surface is organized into 9 official skills/workflows (`pandadoc-engagement-tracker`, `pandadoc-followup-list`, `pandadoc-signing-velocity`, `pandadoc-contract-register`, `pandadoc-nda-fast-send`, `pandadoc-quote-builder`, `pandadoc-approval-send`, `pandadoc-onboarding-agreement`, `pandadoc-invoice-handoff`) covering proposals, quotes, NDAs, internal approvals, onboarding agreements, the contract register, signing metrics and invoice handoff.

Disclosure: a hosted server that **reads and writes** (sends documents and can notify recipients); *"Returned document content becomes part of your assistant's conversation"*; *"PandaDoc document and operation limits"* apply (PandaDoc API rate limits); every connection is bound to the workspace and permissions chosen at authorization.

License: MIT (LICENSE of the guide repo, published by the official `PandaDoc` org). Source: github.com/PandaDoc/mcp-server-guide (official README).
