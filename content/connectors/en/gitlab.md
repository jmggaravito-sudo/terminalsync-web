---
name: GitLab
logo: /connectors/gitlab.svg
category: dev
status: available
simpleTitle: "Let your AI help with GitLab projects"
simpleSubtitle: "Read files, draft issues and prepare merge requests without jumping between screens."
devTitle: "GitLab MCP Connector"
devSubtitle: "Official @modelcontextprotocol server: projects, files, issues, merge requests and branches through the GitLab API."
ctaUrl: "https://gitlab.com"
tokenHelpUrl: "https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
manifest:
  mcpServers:
    gitlab:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-gitlab"]
      env:
        GITLAB_PERSONAL_ACCESS_TOKEN: "${SECRET:GITLAB_PERSONAL_ACCESS_TOKEN}"
        GITLAB_API_URL: "https://gitlab.com/api/v4"
affiliate: false
tagline: "GitLab from your AI"
originalAuthor: "GitLab, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-gitlab"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-gitlab"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**GitLab** is a platform for storing code, organizing technical work and reviewing changes before they ship. It is where many teams keep their projects, issues and merge requests.

This connector lets your AI work with GitLab through the official API: it can search projects, read files, create issues, prepare merge requests, create branches and push changes when you ask. The official README describes it as a server for the GitLab API enabling *"project management, file operations, and more"*.

### What you can ask

- *"Find the website repository and explain which files seem to control the pricing page."*
- *"Create an issue to review the onboarding flow, with these steps and labels."*
- *"Prepare a branch and merge request with this README copy change."*

### What token you need

You need a **GitLab Personal Access Token**. Create it from your GitLab profile; the official README says to go to **User Settings > Access Tokens** and select the permissions you need.

1. Open GitLab's official guide for personal access tokens: `https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html`.
2. Create a new token for Terminal Sync, with a reasonable expiration date.
3. Choose scopes based on the job: `read_api` to inspect information, `read_repository` to read repos, `write_repository` if you want it to push changes and `api` if you need full API access.
4. Paste the token when the Lab asks for `GITLAB_PERSONAL_ACCESS_TOKEN`. Terminal Sync stores it encrypted in your Keychain.
5. If you use self-managed GitLab, change `GITLAB_API_URL` to your instance URL, for example `https://gitlab.yourcompany.com/api/v4`.

Start safely with the smallest set of scopes, then expand only when you need the AI to write changes.

--- dev ---

`@modelcontextprotocol/server-gitlab` is an official package published by `GitLab, PBC` under the `@modelcontextprotocol` scope. Verified manifest: `npx -y @modelcontextprotocol/server-gitlab` with `GITLAB_PERSONAL_ACCESS_TOKEN` in `env`; `GITLAB_API_URL` is optional and defaults to `https://gitlab.com/api/v4`.

Tools verified against the README and npm bundle: `create_or_update_file`, `push_files`, `search_repositories`, `create_repository`, `get_file_contents`, `create_issue`, `create_merge_request`, `fork_repository`, `create_branch`.

Scopes documented by the official README: `api` for full API access, `read_api` for read-only access, `read_repository` and `write_repository` for repository operations. Gotcha: although the README shows Docker and NPX, the catalog gate uses NPX because the package exists on npm and starts on stdio without crashing.

Terminal Sync keeps `GITLAB_PERSONAL_ACCESS_TOKEN` in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-gitlab` on npm.
