---
name: Typeform
logo: /connectors/typeform.svg
category: automation
status: available
simpleTitle: "Crea, publica y lee tus formularios de Typeform pidiéndolo"
simpleSubtitle: "MCP oficial de Typeform: formularios, automatizaciones y contactos por OAuth, sin pegar ninguna API key."
devTitle: "Conector MCP de Typeform"
devSubtitle: "MCP hospedado oficial de Typeform (api.typeform.com/mcp) — formularios, automatizaciones, contactos e insights sobre OAuth."
ctaUrl: "https://www.typeform.com"
tokenHelpUrl: "https://www.typeform.com/developers/get-started/mcp/"
manifest:
  mcpServers:
    typeform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://api.typeform.com/mcp"]
affiliate: false
tagline: "Tus formularios y contactos, al alcance del agente"
originalAuthor: "Typeform"
originalAuthorUrl: "https://www.typeform.com/developers/get-started/mcp/"
license: "proprietary"
licenseUrl: "https://www.typeform.com/legal/service-terms-and-conditions"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Typeform** es la herramienta para crear formularios y encuestas que la gente sí termina de responder — captación de leads, inscripción a eventos, encuestas de satisfacción, quizzes. El conector oficial de Typeform deja que tu agente cree y publique formularios, organice los contactos que van dejando, y arme automatizaciones simples directamente desde tu propia cuenta de Typeform — sin pegar ninguna API key en TerminalSync, solo con tu propio login.

Pídele *"Crea un formulario nuevo para captar leads de la promo de fin de año"* y el agente lo crea en tu workspace, listo para editar. Pídele *"Lístame a todos los que respondieron el formulario de inscripción al evento"* y trae los contactos directo de Typeform. Sirve para crear y publicar formularios, mantener organizados los contactos que juntan, y armar automatizaciones como un paso de email después de que alguien responde.

### Qué le puedes pedir

- *"Crea un formulario nuevo para juntar feedback de clientes."*
- *"Publica el formulario de la promo de fin de año para que quede en vivo."*
- *"Lístame todos los formularios de mi workspace."*
- *"Agrega un paso de email a la automatización de mi formulario de registro."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Typeform:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Typeform en tu navegador y te pide autorizar el acceso, acotado a lo que necesita cada acción (formularios, automatizaciones, contactos).
3. Apruébalo con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta tenga permitido. La guía oficial de Typeform está en [typeform.com/developers](https://www.typeform.com/developers/get-started/mcp/).

**Aclaración honesta:** es un server **hospedado por Typeform** (`https://api.typeform.com/mcp`), no algo que corre en tu computadora. El propio Typeform lo describe como una *"beta de disponibilidad general con capacidades limitadas"* que todavía están ampliando — algunas funciones que podrías esperar quizás no estén todavía, y lo disponible hoy puede depender de tu plan de Typeform.

--- dev ---

Typeform publica un **server MCP remoto oficial** en `https://api.typeform.com/mcp`, documentado en `typeform.com/developers/get-started/mcp/`. Las cuentas del data center europeo usan en cambio `https://api.eu.typeform.com/mcp` o `https://api.typeform.eu/mcp`. El transporte es **solo streamable HTTP** — la doc de Typeform dice explícitamente que no hay endpoint SSE. La auth es OAuth contra la cuenta de Typeform del usuario, con scopes por tool (por ejemplo `forms:read`, `forms:write`, `automations:write`, `contacts:read`, `contacts:write`, `insights:read`, `accounts:read`, `workspaces:read`).

TerminalSync hace de puente con el endpoint hospedado localmente:

```
npx -y mcp-remote@latest https://api.typeform.com/mcp
```

La doc de Typeform publica una tabla completa y versionada de tools (60+) agrupadas por namespace — ejemplos verbatim: `forms-public_create_form`, `forms-public_patch_form` (requiere un `validation_token` de `forms-public_validate_patch`), `forms-public_publish_form`, `automations-public_create_automation`, `automations-public_add_email_step`, `contacts-public_bulk_upsert_contacts`, `contacts-public_list_contacts_lists`, `insights-public_discover`, `workspaces-list_workspaces`. La propia doc de Typeform aclara, verbatim: *"we'll be extending its capabilities over the next few months"*, y que las tools de insights siguen limitadas (*"Tools for getting form insights will be coming soon!"*). El acceso a las features también queda condicionado al plan de Typeform de quien llama.

Licencia: términos propietarios de SaaS (`typeform.com/legal/service-terms-and-conditions`). Fuente: typeform.com/developers/get-started/mcp/.
