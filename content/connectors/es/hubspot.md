---
name: HubSpot
logo: /connectors/hubspot.svg
category: automation
status: available
simpleTitle: "Tu CRM, trabajando mientras hablas"
simpleSubtitle: "\"¿Qué clientes no compran hace 60 días?\" \"Registra una llamada con María\" — tu IA lee y actualiza tu CRM."
devTitle: "Conector MCP de HubSpot"
devSubtitle: "MCP oficial de HubSpot sobre la CRM API — list/search objects, batch create/update, properties, associations, engagements."
ctaUrl: "https://www.hubspot.com"
tokenHelpUrl: "https://developers.hubspot.com/docs/api/private-apps"
manifest:
  mcpServers:
    hubspot:
      command: npx
      args: ["-y", "@hubspot/mcp-server"]
      env:
        PRIVATE_APP_ACCESS_TOKEN: "${SECRET:HUBSPOT_PRIVATE_APP_ACCESS_TOKEN}"
affiliate: false
tagline: "Contactos, negocios y seguimientos al alcance de la IA"
originalAuthor: "HubSpot"
originalAuthorUrl: "https://developers.hubspot.com/mcp"
license: "MIT"
---
Tu CRM es donde vive la relación con cada cliente — quién es, qué compró, qué le prometiste, cuándo hablaron por última vez. Si eso lo llevas en **HubSpot**, este conector deja que tu IA lo lea y lo mantenga al día, para que los seguimientos no se te escapen mientras estás ocupado con el negocio.

Pregúntale *"¿qué clientes no compran hace 60 días?"* y busca en tus contactos y te da la lista. Dile *"registra una llamada con María García y pon una tarea para seguir el viernes"* y escribe la nota y crea la tarea. El CRM deja de ser eso que se te olvida actualizar.

### Qué le puedes pedir

- *"Busca los negocios trabados en 'Propuesta' sin actividad en las últimas dos semanas."*
- *"Agrega una nota al contacto de Carlos Pérez: 'Interesado en el plan anual, llamar el martes.'"*
- *"Lístame los contactos que marcamos como leads este mes y cómo llegó cada uno."*

### Qué necesitas

HubSpot se conecta con un **token de Private App** — una clave que creas dentro de tu propia cuenta de HubSpot:

1. En HubSpot, ve a **Settings → Integrations → Private Apps** (o abre [developers.hubspot.com/docs/api/private-apps](https://developers.hubspot.com/docs/api/private-apps)).
2. Crea una private app, nómbrala algo como "Terminal Sync", y elige los **scopes** que quieras — arranca con scopes de **solo lectura** del CRM (contactos, negocios, empresas) y suma los de escritura recién cuando quieras que la IA edite.
3. Copia el **access token** generado y pégalo cuando el Lab te pida `HUBSPOT_PRIVATE_APP_ACCESS_TOKEN`.

El token queda guardado cifrado en tu Keychain y sincronizado entre tus máquinas. Los scopes que elijas deciden exactamente qué puede ver y hacer la IA — empieza acotado, amplías después.

--- dev ---

`@hubspot/mcp-server` (publicado por **HubSpot**, oficial — beta) habla la HubSpot CRM API. Tools verificadas contra el README del paquete:

- **Objects**: `hubspot-list-objects`, `hubspot-search-objects` (filtros complejos por propiedad), `hubspot-batch-create-objects`, `hubspot-batch-update-objects`, `hubspot-batch-read-objects`, `hubspot-get-schemas`.
- **Properties**: `hubspot-list-properties`, `hubspot-get-property`, `hubspot-create-property`, `hubspot-update-property`.
- **Associations**: `hubspot-batch-create-associations`, `hubspot-list-associations`, `hubspot-get-association-definitions`.
- **Engagements**: `hubspot-create-engagement` (Notes / Tasks sobre contactos, empresas, negocios, tickets).
- **Auth**: `hubspot-get-user-details` (valida el token, devuelve hub + scopes).

Auth vía `PRIVATE_APP_ACCESS_TOKEN` (un token de private app de HubSpot). Los scopes se eligen al crear la app — solo-lectura primero es la recomendación del propio README.

Terminal Sync guarda el token en tu Keychain, sincronizado cifrado entre máquinas con AES-256-GCM. Como los tools de batch-create/update mutan registros reales del CRM, el escritorio los pasa por un paso de confirmación.

Licencia: MIT. Fuente: developers.hubspot.com/mcp.
