---
name: Google Business · Reviews
logo: /connectors/google-business.svg
category: automation
status: available
simpleTitle: "Your reviews, watched and answered"
simpleSubtitle: "\"Any new reviews?\" \"Did my rating drop?\" — the AI reads your Google reviews and drafts replies for you to approve."
devTitle: "Google Business Profile Connector (first-party)"
devSubtitle: "TerminalSync's own MCP server over the official Business Profile API — accounts, locations, reviews, and gated review replies."
ctaUrl: "https://business.google.com"
tokenHelpUrl: "https://developers.google.com/my-business/content/basic-setup"
affiliate: false
tagline: "Reviews watched, replies drafted"
originalAuthor: "Google (Business Profile API) · connector by Terminal Sync"
originalAuthorUrl: "https://developers.google.com/my-business"
license: "proprietary"
---
For a local business, your Google reviews *are* your reputation — the first thing a new customer sees. But they show up at random, and a review left unanswered for a week reads as "this place doesn't care." This connector puts your AI on watch: it reads your reviews, tells you what's new, flags a dropping rating, and drafts a reply for each one — which it only posts after you say yes.

Ask *"do I have new reviews?"* and it lists them, newest first, marking which ones you haven't answered. Ask *"did my rating drop this month?"* and it reads your average and total. Say *"draft a warm reply to the 2-star from Beto"* and it writes one — then shows it to you and waits for your OK before anything goes public.

### What you can ask

- *"Which reviews from this week haven't I replied to yet?"*
- *"What's my average rating and how many reviews do I have?"*
- *"Draft a polite reply to the latest 1-star, acknowledging the problem — don't post it yet."*

### How it connects

Google Business is a **first-party connector**: it runs Terminal Sync's own small server over Google's official Business Profile API — there's no npm package to install. You connect it in the app (Settings → Integrations → Google Business), and the AI's replies are stored encrypted in your Keychain and synced across your machines.

Posting a reply is public and can't be quietly undone, so replies are **gated**: the AI always shows you the draft and only posts it when you confirm.

> Heads up: Google's reviews API requires a Google Cloud project with Business Profile API access approved by Google — the one genuinely fiddly setup step. The in-app support chat walks you through it. (A one-click "Connect with Google" flow is on the way.)

--- dev ---

First-party MCP sidecar (`terminalsync-google-business-mcp`, in the `terminal-sync` repo) over the official Google Business Profile REST APIs — Account Management (`mybusinessaccountmanagement` v1), Business Information (`mybusinessbusinessinformation` v1), and the legacy `mybusiness` v4 surface where reviews live.

Tools:

- **Read**: `gbp_list_accounts`, `gbp_list_locations`, `gbp_list_reviews` (reviewer, star rating, comment, replied/unreplied, plus the location's average rating and total count), `gbp_review_summary` (just the aggregate — fast "did my rating drop?").
- **Write (gated)**: `gbp_reply_review` — SAFE TWO-STEP WRITE. Without `confirm=true` it previews the reply and posts nothing; with `confirm=true` it PUTs the public reply.

Auth is an OAuth2 access token with the `business.manage` scope, read from the OS keychain (env `GOOGLE_BUSINESS_ACCESS_TOKEN` for overrides). The reviews endpoints require the Google Cloud project to be granted Business Profile API access. Token model today is a stored access token; a full OAuth refresh flow (like the app's Drive auth) is the planned follow-up so the connection stays live without re-pasting.

License: the connector code is Terminal Sync's; the API and data are Google's (proprietary).
