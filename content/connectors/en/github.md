---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
simpleTitle: "Your AI browses your repos without you copying SHAs"
simpleSubtitle: "Issues, PRs, commits, releases — ask Claude and reply to the ticket in seconds."
devTitle: "GitHub MCP Connector"
devSubtitle: "Repos, issues, pull requests, branches, commits and releases as first-class tools."
ctaUrl: "https://github.com/"
affiliate: false
tagline: "Your repos, now askable"
manifest:
  command: npx
  args: ["-y", "@modelcontextprotocol/server-github"]
  env:
    GITHUB_PERSONAL_ACCESS_TOKEN: "${SECRET:GITHUB_PERSONAL_ACCESS_TOKEN}"
---

When someone says "what happened with Monday's bug in repo X" or "show me open PRs about auth" — opening GitHub, filtering, reading, replying = 10 minutes.

With this connector you ask Claude *"find open issues labeled 'bug' from the last month in repo Y, group by area, give me a summary"* and the answer arrives ready to paste into Slack.

Set up once, follows you to every machine via Terminal Sync.

--- dev ---

The MCP `@modelcontextprotocol/server-github` exposes Repositories, Issues, Pull Requests, Branches, Commits, Files (read + write) and Releases as tools. Auth via Personal Access Token — use a fine-grained PAT scoped to the repos the agent is allowed to touch.

Terminal Sync stores the PAT in the OS Keychain via `apiKeyHelper` and replicates the `claude_desktop_config.json` between machines, encrypted end-to-end. The token never lands in plaintext on disk or in the repo.

**Best for**: devs triaging issues from the IDE; PMs assembling release notes by asking Claude; maintainers replying to bug reports in bulk.

**Recommended scopes**: repo (full or public_repo only depending on use), read:org if you want the agent to see team members. Avoid `delete_repo` unless you know what you're doing.
