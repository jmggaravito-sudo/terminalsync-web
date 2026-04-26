---
name: Beehiiv
logo: /connectors/beehiiv.svg
category: messaging
status: available
simpleTitle: "Tu newsletter en Beehiiv, escrita por tu IA"
simpleSubtitle: "Posts, segmentos y broadcasts — pedidos en chat, listos para revisar."
devTitle: "Beehiiv MCP Connector"
devSubtitle: "Posts, subscriptions and segments as tools — draft, schedule and analyze from the IDE."
ctaUrl: "https://www.beehiiv.com/?via=REPLACE_WITH_JUANS_BEEHIIV_PARTNER"
affiliate: true
tagline: "Newsletter sin abrir el editor"
---

Beehiiv es donde está creciendo tu lista. Pero cada post es una hora entre redacción, segmentación, scheduling y métricas post-envío.

Con este conector, le pedís a Claude *"escribí un post con los 3 highlights de esta semana, mandalo solo a los suscriptores que abrieron los últimos 4, y dejame el draft para revisar"* — él arma todo en Beehiiv listo para que aprobás.

Configurado una vez, viaja contigo a todas tus máquinas.

--- dev ---

Beehiiv's API exposes Publications, Posts, Subscriptions, Segments and Custom Fields. The community MCP wrapper turns those into tools: `beehiiv.posts.draft`, `beehiiv.subscriptions.query`, `beehiiv.segments.create`, `beehiiv.posts.schedule`.

Terminal Sync stores the API key in the OS Keychain and replicates your `claude_desktop_config.json` snippet across machines. Vos cambiás de laptop a torre y la lista, los segmentos y los borradores quedan accesibles sin re-pegar credenciales.

**Best for**: indie creators y newsletters de growth que ya pasaron a Beehiiv; founders que quieren outsourcear segmentación + scheduling sin contratar editor.
