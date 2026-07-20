---
name: X (Twitter)
logo: /connectors/twitter.svg
category: messaging
status: available
simpleTitle: "Post and listen on X, from the chat"
simpleSubtitle: "\"Post this update\" \"What are people saying about us?\" — your AI posts to X and searches it for you."
devTitle: "X (Twitter) MCP Connector"
devSubtitle: "MCP over the official X API v2 — post tweets, search recent tweets."
ctaUrl: "https://x.com"
tokenHelpUrl: "https://developer.twitter.com/en/portal/dashboard"
manifest:
  mcpServers:
    twitter:
      command: npx
      args: ["-y", "@enescinar/twitter-mcp"]
      env:
        API_KEY: "${SECRET:TWITTER_API_KEY}"
        API_SECRET_KEY: "${SECRET:TWITTER_API_SECRET_KEY}"
        ACCESS_TOKEN: "${SECRET:TWITTER_ACCESS_TOKEN}"
        ACCESS_TOKEN_SECRET: "${SECRET:TWITTER_ACCESS_TOKEN_SECRET}"
affiliate: false
tagline: "Post and listen on X"
originalAuthor: "Enes Cinar"
originalAuthorUrl: "https://github.com/EnesCinr/twitter-mcp"
license: "MIT"
licenseUrl: "https://github.com/EnesCinr/twitter-mcp/blob/main/LICENSE"
---
Keeping a presence on **X** eats time you don't have. This connector lets your AI post for you and listen to what's being said — from the same chat where you run everything else, so a quick update or a "what are people saying about us" check doesn't mean opening yet another app.

Say *"post: we just launched same-day delivery in the city 🚚"* and it publishes it. Ask *"what are people saying about our brand this week?"* and it searches recent tweets and summarizes. Posting is public and can't be undone, so the AI shows you the text before it goes out.

### What you can ask

- *"Post this: 'New winter hours — open until 9pm all week.'"*
- *"Search recent tweets mentioning our shop and tell me the general mood."*
- *"Draft three short posts announcing the weekend sale — I'll pick one to publish."*

### What you need

X connects with **developer API keys** from your own X account:

1. Go to the [X Developer Portal](https://developer.twitter.com/en/portal/dashboard), create an app, and generate the four credentials: API Key, API Secret Key, Access Token, Access Token Secret.
2. Make sure the app has **Read and Write** permission (so it can post, not just read).
3. Paste each when the Lab asks for `TWITTER_API_KEY`, `TWITTER_API_SECRET_KEY`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`.

All four are stored encrypted in your Keychain and synced across your machines.

> Heads up: posting is public and irreversible — the AI shows you the text and posts only when you confirm.

--- dev ---

`@enescinar/twitter-mcp` (Enes Cinar) speaks the official X (Twitter) API v2. Tools verified against the README: `post_tweet` (publish a tweet) and `search_tweets` (search recent tweets, returns text + engagement metrics).

Auth is OAuth 1.0a user context — four env vars: `API_KEY`, `API_SECRET_KEY`, `ACCESS_TOKEN`, `ACCESS_TOKEN_SECRET` from the X Developer Portal (the app needs Read+Write for posting). Terminal Sync maps these from `TWITTER_*` secrets in your Keychain.

Terminal Sync keeps the keys in your Keychain, synced encrypted across machines with AES-256-GCM. Because `post_tweet` is public and irreversible, the desktop gates it behind a confirmation step.

License: MIT. Source: github.com/EnesCinr/twitter-mcp.
