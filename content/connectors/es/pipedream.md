---
name: Pipedream
logo: /connectors/pipedream.svg
category: automation
status: available
simpleTitle: "Workflows automáticos creados por chat"
simpleSubtitle: "Conectá 2.500+ apps. Decile a Claude qué querés y él arma el workflow en Pipedream."
devTitle: "Pipedream MCP Connector"
devSubtitle: "Workflows, sources and SQL data stores as tools — codegen Node steps from natural language."
ctaUrl: "https://pipedream.com/"
affiliate: false
tagline: "Workflows construidos hablando"
manifest:
  command: npx
  args: ["-y", "@pipedream/mcp"]
  env:
    PIPEDREAM_API_KEY: "${SECRET:PIPEDREAM_API_KEY}"
---

Pipedream conecta 2.500+ apps con la flexibilidad de un editor de código real (Node, Python, Go) — pero esa misma flexibilidad implica más fricción cuando solo querés disparar un workflow rápido.

Con este conector, le decís a Claude *"cuando llegue un email a mi Gmail con asunto que empiece con 'Factura', extraé monto y vendor con OCR, mandá a Sheets y avisame en Slack"* — él escribe los pasos en Pipedream listos para deploy.

Configurado una vez, viaja contigo a todas tus máquinas vía Terminal Sync.

--- dev ---

Pipedream's Connect API + Sources/Workflows endpoints expose the full programmatic surface: create workflows, add sources, write Node code steps, deploy and trigger. The community MCP wrapper bridges all of it: `pd.workflows.create`, `pd.workflows.deploy`, `pd.sources.add`, `pd.runs.invoke`.

Terminal Sync stores the API key in the OS Keychain and replicates your `claude_desktop_config.json` between machines. Cambiás de laptop a torre — tus workflows, sources y data stores quedan accesibles sin re-pegar credentials.

**Best for**: devs e indie hackers que quieren la potencia de un editor de código + la velocidad de un constructor de bajo código; equipos que ya pasaron de Make/Zapier por límites de complejidad.
