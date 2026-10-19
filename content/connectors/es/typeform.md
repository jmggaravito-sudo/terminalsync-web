---
name: Typeform
logo: /connectors/typeform.svg
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Tus formularios y encuestas, gestionados conversando"
simpleSubtitle: "Server MCP oficial de Typeform: crea y edita formularios, automatiza el seguimiento y lee las respuestas por OAuth."
devTitle: "Conector MCP de Typeform"
devSubtitle: "MCP oficial hospedado de Typeform (api.typeform.com/mcp) — formularios, automatizaciones, contactos e insights."
ctaUrl: "https://www.typeform.com"
tokenHelpUrl: "https://www.typeform.com/developers/get-started/mcp/"
manifest:
  mcpServers:
    typeform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://api.typeform.com/mcp"]
affiliate: false
tagline: "Formularios que capturan leads, al alcance del agente"
originalAuthor: "Typeform"
originalAuthorUrl: "https://www.typeform.com/developers/get-started/mcp/"
license: "proprietary"
licenseUrl: "https://www.typeform.com/legal"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-19T14:30:00.000Z"
verifiedPackageVersion: null
---
**Typeform** es la plataforma de formularios y encuestas con la que los negocios capturan leads, toman pedidos y hacen investigación de clientes. El conector oficial de Typeform es un **server MCP hospedado** (`https://api.typeform.com/mcp`): en sus palabras, *"It exposes form and automation building, contact management, and response analytics over the Model Context Protocol"*.

Qué significa en la práctica: tu agente puede crear y editar formularios (campos, lógica, publicación), armar automatizaciones con pasos de email, webhook, retrasos e integraciones, administrar contactos y listas —incluida carga masiva con mapeo de campos de formulario— y consultar las respuestas como datos: crudas, agregadas, rankings y series de tiempo. La lista oficial agrupa **67 tools** en cuentas, formularios, temas, insights, automatizaciones y contactos.

### Qué le puedes pedir

- *"Crea un formulario de contacto para mi web con los campos nombre, email y mensaje, y publícalo."*
- *"Agrega a la automatización de leads un paso de email que avise al equipo cuando entra una respuesta nueva."*
- *"¿Cuántas respuestas tuvieron mis formularios esta semana y cuál convirtió mejor?"*
- *"Anota estos contactos en la lista del newsletter y mapea los campos del formulario."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa OAuth con tu cuenta de Typeform:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Typeform en tu navegador — la autorización es OAuth 2.0 y el cliente se presenta en la primera conexión: *"Authorization is OAuth 2.0, and your client is prompted on first connect"*.
3. Inicias sesión y apruebas el acceso. Lo que el agente puede ver o hacer queda acotado por tu cuenta y tu plan de Typeform.

**Aclaración honesta:** es un **server hospedado por Typeform** (`https://api.typeform.com/mcp`), no algo que corre en tu computadora. El acceso a cada función depende del plan — *"Access to the underlying features is plan-dependent and enforced when a tool is called"*. Las tools marcadas como destructivas (borrar un formulario o una lista de contactos) **no se pueden deshacer**. Y si tu cuenta está en el centro de datos de la UE, tu cuenta usa los endpoints UE de Typeform, no este.

--- dev ---

Typeform publica su server MCP como **server remoto/hospedado**, documentado en `typeform.com/developers/get-started/mcp/`. Endpoint: `https://api.typeform.com/mcp` (Streamable HTTP; la doc es explícita: *"Streamable HTTP only — there's no SSE endpoint, and clients configured for SSE fail immediately"*). No hay paquete stdio local; el puente del catálogo es el patrón genérico de cliente:

```
npx -y mcp-remote@latest https://api.typeform.com/mcp
```

La auth es **OAuth 2.0** y un conector hospedado se identifica con un *client metadata document*. Cuentas EU-hosted usan endpoints distintos. Scopes documentados: `accounts:read`, `workspaces:read`, `forms:read`/`forms:write`, `insights:read`, `automations:read`/`automations:write`, `contacts:read`/`contacts:write` y `webhooks:write` (para pasos de webhook en automatizaciones). *"The tool list is the same for every account."*

Tools oficiales (67 en 6 grupos, verbatim de la lista oficial): `forms-public_get_capabilities/get_form/list_forms/create_form/validate_patch/patch_form/publish_form/duplicate_form/update_form_metadata/delete_form`, `themes-public_list_themes` + `themes-get_theme/create_theme/update_theme`, `insights-public_discover/aggregate/timeseries/toplist/list`, `automations-public_*` (19: create/get/list_automations, add_email_step/add_webhook_step/add_delay_step/add_integration_step, publish/pause, patch_trigger, remove_steps/reorder_step, update_*_step), `contacts-public_*` (26: get/list contacts y propiedades de la base, create/update/delete_contact, bulk_upsert_contacts, create_contacts_list, import_form_responses_by_mapping, mappings de campos de formulario), `accounts-list_accounts`, `workspaces-list_workspaces` y `submit_feedback`. Primera llamada: *"Call `accounts-list_accounts` first: nearly every other tool needs the `account_id` it returns"*; en insights, `insights-public_discover` resuelve el schema y va primero. La edición de formularios es patch-based y ordenada.

No soportado por MCP (la doc manda al REST API): export completo de filas de respuestas, webhooks legacy a nivel de formulario, borrado de temas y edición de brand kit, CRUD de workspaces, códigos de embed, borrado de automatizaciones, gestión de miembros de la cuenta y renombrado de propiedades custom de contactos.

Licencia: SaaS propietario (Typeform Legal, `typeform.com/legal`). Fuente: typeform.com/developers/get-started/mcp/ + lista oficial de tools (`/developers/get-started/mcp/tools/`).
