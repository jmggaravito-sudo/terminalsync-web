---
name: Alegra
logo: /connectors/alegra.svg
category: automation
markets: ["CO", "MX", "AR", "PE", "CR", "PA", "DO", "VE", "ES"]
status: soon
simpleTitle: "Your invoicing and your books, answered in plain language"
simpleSubtitle: "Official read-only MCP. TerminalSync connection is still pending."
devTitle: "Alegra MCP Connector"
devSubtitle: "Official hosted Alegra MCP: OAuth, root endpoint and read-only queries; TerminalSync smoke pending."
ctaUrl: "https://www.alegra.com/mcp/"
manifest:
  mcpServers:
    alegra:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.alegra.com"]
affiliate: false
tagline: "Your invoices, your inventory and your reports, within reach of the agent"
originalAuthor: "Alegra"
originalAuthorUrl: "https://developer.alegra.com"
license: "MIT"
licenseUrl: "https://opensource.org/licenses/MIT"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: false
installableForAiReason: "needs-oauth"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-10T07:31:32.656Z"
verifiedPackageVersion: null
---
**Alegra** lets an AI read invoices, inventory, contacts, and reports. Its [official MCP](https://www.alegra.com/mcp/) is a remote **read-only** service: the AI can ask about data, but cannot create, edit, or delete records through this MCP.

### What you can ask

- “How much did I invoice this month?”
- “Which products are in stock?”
- “What are my outstanding receivables?”

### How it connects

Alegra says to paste `https://mcp.alegra.com` into a compatible MCP client and sign in with the existing Alegra account to authorize access. **Do not create or paste an API token or Base64 string.** [Basic authentication for the traditional API](https://developer.alegra.com/reference/autenticaci%C3%B3n) belongs to a different interface, not this MCP flow.

**TerminalSync status:** not installable yet. Opening an Alegra account does not connect it automatically. The app's current remote client does not reach Alegra's authorization screen: Alegra rejected its local redirect URI (`invalid_redirect_uri`, HTTP 400). We will not request account access or present it as ready until OAuth works and an expressly authorized installed read-only smoke passes.

--- dev ---

- Alegra's published MCP endpoint is `https://mcp.alegra.com` (root, **not** `/mcp`). `POST /mcp` returns 404; unauthenticated `POST /` returns a 401 Bearer challenge linking OAuth metadata.
- OAuth metadata: authorization server `https://auth-api.alegra.com`; dynamic registration, PKCE S256, advertised scope `owner`. Although Alegra markets the MCP as read-only, inspect the actual consent and tool list before enabling it in TerminalSync.
- The manifest points to the correct endpoint as a future recipe, but `installableForAi: false` and `needs-oauth` are intentional: Alegra rejected `mcp-remote@latest`'s `http://localhost:<port>/oauth/callback` with `invalid_redirect_uri` before opening a browser. Do not apply traditional API Basic instructions or write/delete tool claims to this MCP.
- Source: [Alegra MCP](https://www.alegra.com/mcp/). Real-account connection and installed smoke remain **unverified**.
