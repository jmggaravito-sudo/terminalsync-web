---
name: Slack
logo: /connectors/slack.svg
category: messaging
status: available
simpleTitle: "Talk to your Slack workspace from your AI"
simpleSubtitle: "\"Summarize today's #general\", \"send a message to @juan\" — without opening Slack."
devTitle: "Slack MCP Connector"
devSubtitle: "Slack Web API access. Read channels, post messages, lookup users."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack"
affiliate: false
tagline: "Read and post in Slack from your AI"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Useful for catching up on channels while you were heads down, posting status updates, or finding messages from a specific person.

Permissions are governed by the Slack token you give it — exactly what it can do in your workspace.

--- dev ---

`@modelcontextprotocol/server-slack` requires `SLACK_BOT_TOKEN` and `SLACK_TEAM_ID`. Operations: `slack_list_channels`, `slack_post_message`, `slack_reply_to_thread`, `slack_add_reaction`, `slack_get_channel_history`, `slack_get_thread_replies`, `slack_get_users`, `slack_get_user_profile`.

License: MIT.
