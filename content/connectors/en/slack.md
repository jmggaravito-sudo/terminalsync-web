---
name: Slack
logo: /connectors/slack.svg
category: messaging
status: available
simpleTitle: "Let your AI read and write in Slack"
simpleSubtitle: "Channels, threads, users, profiles, messages and reactions — with explicit scopes."
devTitle: "Slack MCP Connector"
devSubtitle: "Official @modelcontextprotocol server for Slack Web API: channel history, post, replies, users."
ctaUrl: "https://slack.com"
tokenHelpUrl: "https://api.slack.com/apps"
manifest:
  mcpServers:
    slack:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-slack"]
      env:
        SLACK_BOT_TOKEN: "${SECRET:SLACK_BOT_TOKEN}"
        SLACK_TEAM_ID: "${SECRET:SLACK_TEAM_ID}"
affiliate: false
tagline: "Your Slack workspace, connected to the agent"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-slack"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-slack"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
**Slack** is where team decisions, status updates, incidents, threads and conversations live. The official MCP server connects Claude to the Slack Web API to *"interact with Slack workspaces"*: read channels, fetch threads, list users, inspect profiles, post messages and add reactions.

What it does: it lists public or pre-defined channels, reads recent channel history, fetches thread replies, posts messages, replies in threads, adds emoji reactions and reads users/profiles. If you set `SLACK_CHANNEL_IDS`, you limit scope to specific channels.

### What you can ask

- *"Summarize the last 50 messages in the incident channel and extract action items."*
- *"Post this deploy status in `#engineering` and reply in the release thread."*
- *"Find the profile for this user ID and tell me their timezone before I ping them."*

### What token you need

You need a **Slack App** installed in your workspace and its **Bot User OAuth Token** (`xoxb-...`). The official README asks you to create the app from [api.slack.com/apps](https://api.slack.com/apps), go to OAuth & Permissions and add these scopes:

- `channels:history` — View messages and other content in public channels
- `channels:read` — View basic channel information
- `chat:write` — Send messages as the app
- `reactions:write` — Add emoji reactions to messages
- `users:read` — View users and their basic information
- `users.profile:read` — View detailed profiles about users

Then install the app to the workspace, copy the Bot User OAuth Token and find the Team ID (starts with `T`). Paste them when the Lab asks for `SLACK_BOT_TOKEN` and `SLACK_TEAM_ID`. Terminal Sync stores them encrypted in your Keychain.

--- dev ---

`@modelcontextprotocol/server-slack` is an official package published by `Anthropic, PBC` under the `@modelcontextprotocol` scope. Verified manifest: `npx -y @modelcontextprotocol/server-slack` with `SLACK_BOT_TOKEN` and `SLACK_TEAM_ID` in `env`. The README also documents `SLACK_CHANNEL_IDS` as optional to limit access: comma-separated list of channel IDs.

Tools verified against the official README: `slack_list_channels`, `slack_post_message`, `slack_reply_to_thread`, `slack_add_reaction`, `slack_get_channel_history`, `slack_get_thread_replies`, `slack_get_users`, `slack_get_user_profile`.

Official scopes required for full capabilities: `channels:history`, `channels:read`, `chat:write`, `reactions:write`, `users:read`, `users.profile:read`. To reduce risk, install the app only in needed channels and configure `SLACK_CHANNEL_IDS`.

Terminal Sync keeps secrets in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-slack` on npm.
