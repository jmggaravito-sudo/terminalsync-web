---
name: Vercel
logo: /connectors/vercel.svg
category: dev
status: available
simpleTitle: "Deploys without leaving chat"
simpleSubtitle: "\"How's the deploy?\" \"Promote staging to prod\" — straight to the agent."
devTitle: "Vercel MCP Connector"
devSubtitle: "Project, deployment, env var, and log access via Vercel REST API."
ctaUrl: "https://vercel.com"
affiliate: false
tagline: "Conversational CI/CD"
manifest:
  command: npx
  args: ["-y", "vercel-mcp"]
  env:
    VERCEL_TOKEN: "${SECRET:VERCEL_TOKEN}"
---

If you deploy on Vercel, you can ask Claude for build status, pull error logs, promote preview deploys to prod, or add env vars — all without opening the dashboard.

--- dev ---

Uses Vercel REST API with a scoped token (project-level or team-level). Exposes: `list_deployments`, `get_deployment_logs`, `promote_to_prod`, `rollback`, `get_env`, `set_env`, `list_domains`.

Terminal Sync syncs the token per-team across machines. Useful when you switch between personal + client teams — the right token comes with you.
