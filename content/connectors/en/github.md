---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
simpleTitle: "Let your AI work with your repos"
simpleSubtitle: "Files, issues, PRs and code search from chat — limited by the token you provide."
devTitle: "GitHub MCP Connector"
devSubtitle: "Official @modelcontextprotocol server: repos, files, issues, PRs, reviews and search."
ctaUrl: "https://github.com"
tokenHelpUrl: "https://github.com/settings/tokens"
manifest:
  mcpServers:
    github:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-github"]
      env:
        GITHUB_PERSONAL_ACCESS_TOKEN: "${SECRET:GITHUB_PERSONAL_ACCESS_TOKEN}"
affiliate: false
tagline: "Repos, issues and PRs within reach of the agent"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-github"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-github"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
**GitHub** is the platform where your repos, issues, pull requests and code reviews live. The official `@modelcontextprotocol` MCP server connects Claude to the GitHub API for *"file operations, repository management, search functionality, and more"*, always using the permissions of the Personal Access Token you configure.

What it does: it can read file and directory contents, search repos/code/issues/users, create issues, open pull requests, comment, review PRs, create branches and push changes. The official README highlights *"Automatic Branch Creation"*, *"Batch Operations"* and *"Advanced Search"* as core capabilities.

### What you can ask

- *"Find where this repo defines the auth middleware and summarize the relevant files."*
- *"Open a draft pull request from `feature/login` into `main` with this title and body."*
- *"List open issues labeled `bug`, sorted by most recently updated, and tell me what needs action."*

### What token you need

You need a **GitHub Personal Access Token**. The official README says: *"Create a token with the `repo` scope"* and notes that, if you only work with public repositories, you can use `public_repo`.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens).
2. Create a token for the exact repos you want to use with Terminal Sync.
3. For private repos, include `repo`; for public repos, prefer `public_repo`.
4. Paste it when the Lab asks for `GITHUB_PERSONAL_ACCESS_TOKEN`. Terminal Sync stores it encrypted in your Keychain.

Give it the least access possible: if the agent only needs to read, use a token limited to those repos; if it will open PRs or write files, enable write permissions only where needed.

--- dev ---

`@modelcontextprotocol/server-github` is an official package published by `Anthropic, PBC` under the `@modelcontextprotocol` scope. Verified manifest: `npx -y @modelcontextprotocol/server-github` with `GITHUB_PERSONAL_ACCESS_TOKEN` in `env`. Source note: the npm package README says development moved to `github/github-mcp-server`; this catalog keeps the official Anthropic/modelcontextprotocol installable server for compatibility.

Tools verified against the official README: `create_or_update_file`, `push_files`, `search_repositories`, `create_repository`, `get_file_contents`, `create_issue`, `create_pull_request`, `fork_repository`, `create_branch`, `list_issues`, `update_issue`, `add_issue_comment`, `search_code`, `search_issues`, `search_users`, `list_commits`, `get_issue`, `get_pull_request`, `list_pull_requests`, `create_pull_request_review`, `merge_pull_request`, `get_pull_request_files`, `get_pull_request_status`, `update_pull_request_branch`, `get_pull_request_comments`, `get_pull_request_reviews`.

Scopes: official README asks for `repo` for full control of private repositories, or `public_repo` when working only with public repositories. Use a fine-grained PAT or repo allowlist whenever possible.

Terminal Sync keeps the PAT in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-github` on npm.
