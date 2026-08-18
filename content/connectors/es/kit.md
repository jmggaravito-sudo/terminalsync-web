---
name: Kit
logo: /connectors/kit.svg
category: messaging
status: available
simpleTitle: "Tu newsletter, manejada por tu IA"
simpleSubtitle: "Borradores, segmentos y broadcasts — escritos en chat con tu tono."
devTitle: "Kit (ConvertKit) MCP Connector"
devSubtitle: "Subscribers, sequences and broadcasts as tools — query, segment, schedule from the IDE."
ctaUrl: "https://kit.com/"
affiliate: false
tagline: "Newsletter sin abrir el panel"
originalAuthor: "Kit (ex-ConvertKit)"
originalAuthorUrl: "https://kit.com"
license: "proprietary"
---
Kit (antes ConvertKit) es donde vive tu lista. Pero escribir un broadcast, segmentar suscriptores y schedulear te lleva 30 minutos cada vez — y siempre se te olvida un campo.

Con este conector, le pides a Claude *"escribe un broadcast con el resumen del último post, mándalo solo a los suscriptores que abrieron los últimos 3 emails y prográmalo para el martes 9am"* — y él arma el draft en Kit listo para que tú solo lo apruebes.

Configurado una vez, viaja contigo gracias a Terminal Sync.

--- dev ---

Kit's v4 REST API exposes Subscribers, Tags, Sequences, Broadcasts and Forms. The community MCP wrapper turns those into tools: `kit.subscribers.query`, `kit.broadcasts.draft`, `kit.tags.apply`, `kit.sequences.add_subscribers`.

Terminal Sync stores the Kit API key in the OS Keychain (cifrado E2E) y sincroniza tu `claude_desktop_config.json` entre máquinas. Cambiás de laptop a torre y la lista, los segmentos y los borradores siguen accesibles sin re-pegar nada.

**Best for**: creators y newsletters indie; founders que escriben sus propios broadcasts y quieren outsourcear el laburo de segmentación a la IA.
