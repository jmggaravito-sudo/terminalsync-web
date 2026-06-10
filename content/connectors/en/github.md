---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
simpleTitle: "Your AI works with your repos"
simpleSubtitle: "\"Open a PR with these changes\", \"summarize the last 10 issues\" — without leaving the chat."
devTitle: "GitHub MCP Connector"
devSubtitle: "Personal Access Token scoped — issues, PRs, code search, repos, contents."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/github"
affiliate: false
tagline: "Issues, PRs and code search from your AI"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
"Open a PR with these changes, base `main`." Done. "Tell me what's pending in the issues of this repo." Summary in seconds. "Find the file where we define the auth middleware." Located.

Reads with the permissions of the token you provide — read-only or full access, your call.

--- dev ---

`@modelcontextprotocol/server-github` requires `GITHUB_PERSONAL_ACCESS_TOKEN`. Operations: `create_issue`, `list_issues`, `create_pull_request`, `get_file_contents`, `search_code`, `search_repositories`, `create_or_update_file`, `push_files`. Use a fine-grained PAT scoped to the repos that actually need it.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/github.
