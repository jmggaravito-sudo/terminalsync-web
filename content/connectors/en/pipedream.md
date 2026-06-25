---
name: Pipedream
logo: /connectors/pipedream.svg
category: automation
status: available
simpleTitle: "Connect your AI to thousands of apps"
simpleSubtitle: "Let it run approved actions in Slack, Gmail, Sheets, GitHub and more through Pipedream."
devTitle: "Pipedream MCP Connector"
devSubtitle: "Official @pipedream/mcp server: local stdio or self-hosted SSE over Pipedream Connect."
ctaUrl: "https://pipedream.com/docs/connect/mcp/users"
tokenHelpUrl: "https://pipedream.com/docs/rest-api/auth/#creating-an-oauth-client"
manifest:
  mcpServers:
    pipedream:
      command: npx
      args: ["-y", "@pipedream/mcp", "stdio", "--app", "${SECRET:PIPEDREAM_APP}", "--external-user-id", "${SECRET:PIPEDREAM_EXTERNAL_USER_ID}"]
      env:
        PIPEDREAM_CLIENT_ID: "${SECRET:PIPEDREAM_CLIENT_ID}"
        PIPEDREAM_CLIENT_SECRET: "${SECRET:PIPEDREAM_CLIENT_SECRET}"
        PIPEDREAM_PROJECT_ID: "${SECRET:PIPEDREAM_PROJECT_ID}"
        PIPEDREAM_PROJECT_ENVIRONMENT: "development"
affiliate: false
tagline: "Thousands of app actions through Pipedream"
originalAuthor: "Pipedream, Inc."
originalAuthorUrl: "https://www.npmjs.com/package/@pipedream/mcp"
license: "Pipedream Source Available License 1.0"
licenseUrl: "https://github.com/PipedreamHQ/pipedream/blob/master/LICENSE"
hidden: true
marketplaceSource: "official"
---
**Pipedream** connects apps and APIs so you can automate work that usually means opening five tabs: messages, spreadsheets, tickets, calendars, databases and internal tools.

This connector lets your AI use Pipedream's official MCP layer for a specific app, such as Slack, Gmail, GitHub, Google Sheets or thousands more. Pipedream's docs describe the promise as adding *"10,000+ tools from 3,000+ APIs"* to AI tools, with managed account connection handled by Pipedream.

### What you can ask

- *"Find the new Typeform responses and add the qualified leads to Google Sheets."*
- *"Create a GitHub issue from this customer note and post the link in Slack."*
- *"Look up today's calendar events and draft a follow-up email for each meeting."*

### What setup you need

You need a **Pipedream project** and OAuth client credentials. You also choose the app slug for this MCP server — for example `slack`, `gmail`, `github` or `google_sheets`.

1. Create or open a Pipedream project.
2. Create a Pipedream OAuth client from the REST API auth settings.
3. Copy the client ID, client secret and project ID.
4. Pick the app slug you want this server to expose. Pipedream shows app slugs in each app's Authentication section.
5. Paste those values when the Lab asks for `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ID`, `PIPEDREAM_APP` and `PIPEDREAM_EXTERNAL_USER_ID`. Terminal Sync stores them encrypted in your Keychain.

Start with one app at a time. Pipedream can reach a very wide set of tools, so limiting the app slug is the easiest way to keep the first install understandable.

--- dev ---

`@pipedream/mcp` is the official npm package published by Pipedream maintainers. Verified package: `@pipedream/mcp@0.0.1`, dist-tag `latest` only (no canary tag). Verified entrypoints: `npx -y @pipedream/mcp --help`, `npx -y @pipedream/mcp stdio --help`, and SSE startup with dummy credentials staying alive until terminated.

Manifest used here targets stdio: `npx -y @pipedream/mcp stdio --app ${SECRET:PIPEDREAM_APP} --external-user-id ${SECRET:PIPEDREAM_EXTERNAL_USER_ID}` with `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ID` and `PIPEDREAM_PROJECT_ENVIRONMENT` in `env`. The README documents the same env vars and says the stdio mode runs a server for one app slug.

Tools are registered dynamically from Pipedream components for the selected app. The implementation calls `getComponents({ app, componentType: "action" })`, registers each component key as an MCP tool, and also registers `configure_component` for progressive option lookup. Gotcha: without valid Pipedream OAuth credentials, stdio exits while retrieving the OAuth access token; the gate therefore verifies the CLI and transport entrypoints locally and relies on real credentials for full tool hydration.

Terminal Sync keeps the Pipedream credentials in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: Pipedream Source Available License 1.0. Source: official README and package metadata for `@pipedream/mcp` on npm, plus Pipedream MCP docs.
