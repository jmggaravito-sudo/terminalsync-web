---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
simpleTitle: "Tu IA navega tus repos sin que copies SHAs"
simpleSubtitle: "Issues, PRs, commits, releases — preguntales a Claude y respondé el ticket en segundos."
devTitle: "GitHub MCP Connector"
devSubtitle: "Repos, issues, pull requests, branches, commits and releases as first-class tools."
ctaUrl: "https://github.com/"
affiliate: false
tagline: "Tus repos, ahora hablables"
manifest:
  command: npx
  args: ["-y", "@modelcontextprotocol/server-github"]
  env:
    GITHUB_PERSONAL_ACCESS_TOKEN: "${SECRET:GITHUB_PERSONAL_ACCESS_TOKEN}"
---

Cuando alguien dice "qué pasó con el bug del lunes en repo X" o "mostrame los PRs abiertos sobre auth" — abrir GitHub, filtrar, leer, responder = 10 minutos.

Con este conector le pedís a Claude *"buscá los issues abiertos con label 'bug' del último mes en repo Y, agrupá por área, y dame un summary"* y la respuesta llega lista para pegar en Slack.

Configurado una vez, viaja con vos a todas tus máquinas vía Terminal Sync.

--- dev ---

The MCP `@modelcontextprotocol/server-github` exposes Repositories, Issues, Pull Requests, Branches, Commits, Files (read + write) and Releases as tools. Authentication via Personal Access Token — usá un fine-grained PAT con scope acotado a los repos que el agent puede tocar.

Terminal Sync stores the PAT in the OS Keychain via `apiKeyHelper` and replicates the `claude_desktop_config.json` between machines, encrypted end-to-end. El token nunca aterriza en plaintext en tu disco ni en tu repo.

**Best for**: devs que hacen triage de issues desde el IDE; PMs que arman release notes preguntándole a Claude; mantainers que responden bug reports en bulk.

**Scopes recomendados**: repo (full o solo public_repo según uso), read:org si querés que el agent vea miembros del equipo. Evitá `delete_repo` salvo que sepás bien lo que estás haciendo.
