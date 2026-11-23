---
name: Close
logo: /connectors/close.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Tu CRM de ventas Close, gestionado conversando"
simpleSubtitle: "Server MCP oficial de Close: busca leads, crea oportunidades y notas, prepara emails y sigue tu pipeline por OAuth con tu cuenta de Close."
devTitle: "Conector MCP de Close"
devSubtitle: "MCP oficial hospedado de Close (mcp.close.com/mcp) — 155 tools por scope: 74 lectura, 24 escritura segura, 57 destructivas."
ctaUrl: "https://www.close.com"
tokenHelpUrl: "https://developer.close.com/mcp"
manifest:
  mcpServers:
    close:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.close.com/mcp"]
affiliate: false
tagline: "Tu pipeline de ventas, al alcance del agente"
originalAuthor: "Close"
originalAuthorUrl: "https://developer.close.com/mcp"
license: "proprietary"
licenseUrl: "https://www.close.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-23T14:16:08.606Z"
verifiedPackageVersion: null
---
**Close** es el CRM de ventas que usan las pymes para llevar leads, pipeline y toda la comunicación con clientes en un solo lugar. El conector oficial de Close es un **server MCP hospedado** (`https://mcp.close.com/mcp`): la doc oficial lo presenta así — *"Model Context Protocol (MCP) servers provide a standardized interface that allows any compatible AI model or agent to access your Close data in a simple and secure way."*

Qué significa en la práctica: tu agente puede buscar y leer tus leads, contactos, oportunidades, tareas, notas, llamadas, reuniones —con transcripciones—, emails y SMS del inbox; crear leads, contactos, oportunidades, notas, tareas y comentarios; dejar preparados borradores de email y SMS; y administrar pipelines, plantillas y vistas guardadas. La referencia oficial agrupa **155 tools en 3 scopes**: 74 de lectura (`mcp.read`), 24 de escritura segura (`mcp.write_safe`) y 57 destructivas (`mcp.write_destructive`) — *"Each higher scope includes all tools from the lower scopes."*

### Qué le puedes pedir

- *"Muéstrame los leads que llevan una semana sin respuesta."*
- *"Crea una nota en el lead de Acme con lo que acordamos en la llamada de hoy."*
- *"¿Cuántas oportunidades cerré este mes y cuánto hay abierto en el pipeline?"*
- *"Prepara un borrador de email de seguimiento para el lead de la propuesta."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa OAuth con tu cuenta de Close en el navegador:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Close — el server tiene soporte de *"OAuth 2.0 Dynamic Client Registration (DCR)"* según la doc oficial, así que el cliente se registra solo y te lleva a la pantalla de autorización.
3. Inicias sesión, eliges la organización de Close y los permisos que le das al agente, y apruebas.
4. Para cortar el acceso, revocas la conexión desde Close como cualquier app conectada.

**Aclaración honesta:** es un **server hospedado por Close** (`https://mcp.close.com/mcp`), no algo que corre en tu computadora. El alcance queda acotado por lo que apruebes en el OAuth: las tools destructivas —borrar leads, contactos u oportunidades, **enviar** emails y SMS reales, fusionar leads— solo entran si ese nivel de escritura está autorizado. Y para trabajar con más de una organización, la doc de Close pide una conexión por organización (en Claude lo resuelven con URLs distintas tipo `?1`, `?2`).

--- dev ---

Close publica su server MCP como **server remoto/hospedado**, documentado en `developer.close.com/mcp` (referencia de tools en `developer.close.com/mcp/tools.md`). Endpoint: `https://mcp.close.com/mcp` con soporte *"HTTP Streamable"* y *"OAuth 2.0 Dynamic Client Registration (DCR)"*. No hay paquete npm stdio; el puente del catálogo es el patrón genérico de cliente:

```
npx -y mcp-remote@latest https://mcp.close.com/mcp
```

La auth recomendada por la doc es **OAuth 2.0** (DCR + login en el navegador). Alternativa documentada para setups custom, por headers con API key: `Close-API-Key: {{ Your Close API Key }}` + `Close-Scope: {{ mcp.read, mcp.write_safe, or mcp.write_destructive }}` — el header `Close-Scope` determina el scope y las tools disponibles. La doc también documenta el conector oficial de Close dentro de Claude (Settings → Connectors → Organization connectors) y la URL con sufijo `?1`/`?2` para conectar varias organizaciones en clientes que no aceptan dos conexiones con la misma dirección.

Tools oficiales (155, IDs verbatim por scope). Lectura (`mcp.read`, 74): `lead_search`, `search`, `activity_search`, `find_leads`, `find_contacts`, `find_opportunities`, `find_tasks`, `find_notes`, `find_pipelines_and_opportunity_statuses`, `find_email_templates`, `find_sms_templates`, `find_smart_views`, `find_invoices`, `fetch_email`, `fetch_sms`, `fetch_meeting`, `fetch_meeting_transcript`, `fetch_invoice`, `show_lead`, `show_contact`, `show_opportunities`, `show_tasks`, `aggregate_objects`, `list_objects`, `org_info`, `org_users`, `get_billing_summary`, `get_voice_agents`, `render_email_template`, `render_sms_template`, `paginate_search`, `submit_feedback`, entre las demás de la referencia. Escritura segura (`mcp.write_safe`, 24): `create_lead`, `create_contact`, `create_opportunity`, `create_note`, `create_task`, `create_comment`, `create_draft_email`, `create_draft_sms`, `create_email_template`, `create_sms_template`, `create_pipeline`, `create_smart_view`, `create_workflow`, `log_call`, `rent_phone_number`, `pin_smart_view`, entre las demás. Destructivas (`mcp.write_destructive`, 57): `send_email`, `send_sms`, `merge_leads`, `delete_lead`, `delete_contact`, `delete_opportunity`, `delete_task`, `delete_note`, `update_lead`, `update_opportunity`, `update_meeting`, `bulk_update_tasks`, `enrich_field`, `cancel_email_send`, `cancel_sms_send`, `schedule_voice_agent_call`, entre las demás. La lista completa por scope está en la referencia oficial.

Gotchas verbatim de la referencia: los scopes son acumulativos — *"Each higher scope includes all tools from the lower scopes"*; los envíos reales de email/SMS, la fusión de leads y todo lo que borra viven en el scope destructivo; `activity_search` devuelve resultados por fecha descendente y `paginate_search` trae la página siguiente; `close_product_knowledge_search` busca en la documentación del propio Close; `submit_feedback` existe para reportar problemas del server.

Licencia: SaaS propietario (`close.com/terms`). Fuente: `developer.close.com/mcp` + `developer.close.com/mcp/tools.md` (markdown oficial, leído verbatim en esta corrida) + registro MCP (`com.close/close-mcp`).
