---
name: Bird
logo: /connectors/bird.svg
category: messaging
markets: ["GLOBAL"]
status: available
simpleTitle: "Your business email, SMS and WhatsApp, sent by conversation"
simpleSubtitle: "Official Bird MCP server: send and review email, SMS and WhatsApp messages, manage contacts and templates over OAuth."
devTitle: "Bird MCP Connector"
devSubtitle: "Official hosted Bird MCP (mcp.bird.com) — messaging, templates, contacts, numbers and verification."
ctaUrl: "https://www.bird.com"
tokenHelpUrl: "https://bird.com/docs/ai/mcp-server"
manifest:
  mcpServers:
    bird:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.bird.com"]
affiliate: false
tagline: "Your business messaging channels, within reach of the agent"
originalAuthor: "Bird"
originalAuthorUrl: "https://bird.com/docs/ai/mcp-server"
license: "proprietary"
licenseUrl: "https://bird.com/legal/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-19T14:30:00.000Z"
verifiedPackageVersion: null
---
**Bird** (formerly MessageBird) is the customer-communications platform businesses use to send email, SMS, WhatsApp and voice over a single API. Its official MCP server in the registry describes it as: *"Send and receive across email, SMS, WhatsApp, and voice. One API, one contract"*. The connector is a **hosted MCP server** (`https://mcp.bird.com`) with the full tool catalog.

What that means day to day: your agent can send email, SMS and WhatsApp messages (one at a time or in batches), review what was sent and its delivery events, manage email and WhatsApp templates, manage contacts, properties and audiences, set up email domains and SMS senders, order and manage numbers, verify users per channel, and review webhooks and your workspace. The toolset is curated: it doesn't expose Bird's whole API, just the operations a client needs.

### What you can ask

- *"Send a thank-you email to the customers who bought this month."*
- *"WhatsApp tomorrow's appointment reminder to each contact."*
- *"How many SMS did we send this week, and how many were delivered?"*
- *"Create the order-confirmation email template and save it to the account."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses Bird's OAuth sign-in:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Bird's login in your browser — the client registers itself, no manual app setup: *"Dynamic registration removes the need for a pre-shared client ID or manual configuration"*.
3. Sign in and approve the permissions. Before that, the server gives you nothing — *"A client that has only the URL receives a `401` until you sign in"*.

**Honest note:** this is a **server hosted by Bird** (`https://mcp.bird.com`), not something that runs on your computer, and it **sends real messages to real recipients** (every send consumes your Bird account's credit or cost). The grant is capped three ways: *"capped to the intersection of what the client requested, what you approved, and what you actually hold"* — and org-owner or platform-admin scopes are never delegable. You can revoke access at any time in Connected apps: *"revoking it there cuts the client off immediately"*.

--- dev ---

Bird (the company formerly known as MessageBird; official GitHub org `messagebird`) publishes its MCP server as a **remote/hosted server**, documented at `bird.com/docs/ai/mcp-server` (official repo `github.com/messagebird/bird-ai`). Hosted endpoints: `https://mcp.bird.com` (full catalog) and `https://mcp.bird.com/dynamic` — *"Only `search` and `execute`"*, for clients with hard tool-count limits (returns data, no widgets). There is also a local mode via the CLI (`bird mcp` over stdio after `bird auth login`), which is what the catalog manifest does NOT use. The catalog bridge is the generic client pattern:

```
npx -y mcp-remote@latest https://mcp.bird.com
```

Both hosted endpoints use Streamable HTTP and the same Bird OAuth sign-in: *"Both hosted endpoints use Streamable HTTP and the same Bird OAuth sign-in"*; each request carries your own OAuth bearer token, which Bird's API validates per request, and the hosted server *"stores no secrets and validates nothing itself"*. Token exchange uses PKCE and refreshes automatically. Region: *"The API host follows your login's region automatically"*.

Tools verbatim from the official catalog (curated): messaging `email_send`, `email_send_batch`, `email_list`, `email_get`, `sms_send`, `sms_send_batch`, `sms_get`, `sms_list`, `sms_list_events`, `sms_templates_list`/`sms_templates_get`, `whatsapp_send/get/list/list_events/media`, `whatsapp_templates_*`, `voice_legs_get`/`voice_legs_list`, `voice_stats_*`, `voice_session_credentials_create`, `verify_verifications_create/check/next_channel`, `voice_calls_create` (preview); channel setup `email_domains_create/verify/list/get`, `sms_senders_create/requirements`, `sms_senders_registrations_create`, `sms_10dlc_*`, `numbers_available_list`, `numbers_orders_create`, `numbers_cancel`, `numbers_release`, `whatsapp_numbers_precheck`, `trust_*`; deliverability `email_templates_create/list/get/update/duplicate/preview`, `email_templates_versions_*`, `email_suppressions_list/check/add/remove`, `email_dedicated_ips_*`, `email_ip_pools_*`; audience and config `contacts_*`, `contact_properties_*`, `audiences_*`, `preferences_*`, `realtime_apps_*`, `realtime_apps_keys_*`, `lookup_phone_number`, `lookup_email`, `webhooks_list`, `workspace_get`, `whoami`. The hosted endpoint omits the 4 stdio-only tools (`auth_signup`, `auth_verify_email`, `auth_create_org`, `compliance_attachments_upload`). Preview voice calls don't dial by themselves: *"preparing it does not place the call"* — a human runs it in the browser.

License: proprietary SaaS terms (Bird Terms, `bird.com/legal/terms`). Source: bird.com/docs/ai/mcp-server + MCP registry (`com.bird/mcp`).
