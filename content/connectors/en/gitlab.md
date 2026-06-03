---
name: GitLab
logo: /connectors/gitlab.svg
category: dev
status: available
simpleTitle: "Your AI works with your GitLab repos"
simpleSubtitle: "Issues, merge requests, code search — same workflow as the GitHub connector, on GitLab."
devTitle: "GitLab MCP Connector"
devSubtitle: "Project Access Token scoped — issues, MRs, files, repos."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab"
affiliate: false
tagline: "Issues and MRs from your AI"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
The GitLab equivalent of the GitHub connector: same model, same actions, different platform.

You manage projects, MRs and issues from your AI without leaving the chat.

--- dev ---

`@modelcontextprotocol/server-gitlab` requires `GITLAB_PERSONAL_ACCESS_TOKEN` and optionally `GITLAB_API_URL` for self-hosted. Operations: `create_or_update_file`, `search_repositories`, `create_repository`, `get_file_contents`, `push_files`, `create_issue`, `create_merge_request`, `fork_repository`, `create_branch`.

License: MIT.
