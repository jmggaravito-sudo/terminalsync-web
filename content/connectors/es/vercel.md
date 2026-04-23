---
name: Vercel
logo: /connectors/vercel.svg
category: dev
status: available
simpleTitle: "Deploys sin salir de tu chat"
simpleSubtitle: "\"¿Cómo está el deploy?\" \"Promové staging a producción\" — directo al agente."
devTitle: "Vercel MCP Connector"
devSubtitle: "Project, deployment, env var, and log access via Vercel REST API."
ctaUrl: "https://vercel.com"
affiliate: false
tagline: "CI/CD conversacional"
---

Si deployás en Vercel, podés preguntarle a Claude el status de builds, revisar logs de errores, promover deploys de preview a producción, o agregar variables de entorno — todo sin abrir el dashboard.

--- dev ---

Uses Vercel REST API with a scoped token (project-level or team-level). Exposes: `list_deployments`, `get_deployment_logs`, `promote_to_prod`, `rollback`, `get_env`, `set_env`, `list_domains`.

Terminal Sync syncs the token per-team across machines. Useful when you switch between personal + client teams — the right token comes with you.
