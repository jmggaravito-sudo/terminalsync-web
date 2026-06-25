---
name: Airtable
logo: /connectors/airtable.svg
category: database
status: available
simpleTitle: "Tu base de datos de no-código, en el agente"
simpleSubtitle: "Airtable guarda tus CRMs, inventarios y trackers — ahora Claude los lee también."
devTitle: "Airtable MCP Connector"
devSubtitle: "Base + table introspection with read/write to Claude Code."
ctaUrl: "https://www.airtable.com"
tokenHelpUrl: "https://airtable.com/create/tokens/new"
manifest:
  mcpServers:
    airtable:
      command: npx
      args: ["-y", "airtable-mcp-server"]
      env:
        AIRTABLE_API_KEY: "${SECRET:AIRTABLE_API_KEY}"
affiliate: false
tagline: "CRM + inventario al alcance de la IA"
originalAuthor: "Adam Jones (@domdomegg)"
originalAuthorUrl: "https://github.com/domdomegg"
license: "MIT"
licenseUrl: "https://github.com/domdomegg/airtable-mcp-server/blob/master/LICENSE"
---
**Airtable** es una de las herramientas de base de datos no-código más usadas del mundo: pinta como una hoja de cálculo, funciona como una base relacional. Empresas la usan como CRM, inventario, tracker de pedidos, calendario editorial, pipeline de contenidos — todo sin programar. La descripción oficial del conector en el directorio de Anthropic lo resume así: *"Bring your structured data to Claude"*.

Con este conector, tu IA puede leer y escribir en cualquier base de Airtable a la que le des acceso. Le preguntás *"¿qué clientes no han comprado en 60 días?"* y arma la query de filterByFormula, la corre y te entrega el listado. Le pedís *"marcá el pedido 487 como enviado"* y actualiza el record sin que abras la app.

### Qué le podés pedir

- *"En mi base 'CRM Clientes', listame los leads con estado 'Calificado' que no tienen actividad en las últimas 2 semanas."*
- *"Agregá un row a la tabla 'Pedidos' con cliente: María García, monto: $450, estado: Pendiente."*
- *"Buscá en 'Inventario' los productos con stock menor a 5 unidades y mandame un resumen para el reorden."*

### Qué token necesitás

Necesitás un **Personal Access Token (PAT)** de Airtable, formato `pat123.abc123`. Reemplaza a las viejas API keys.

1. Andá a [airtable.com/create/tokens/new](https://airtable.com/create/tokens/new).
2. Ponele un nombre tipo "Terminal Sync — Claude".
3. **Scopes requeridos** (según el README oficial): `schema.bases:read` y `data.records:read`.
4. **Scopes opcionales**: `schema.bases:write`, `data.records:write`, `data.recordComments:read`, `data.recordComments:write`. Sumalos solo si querés que el agente edite o trabaje con comentarios.
5. **Access**: elegí qué bases puede ver — podés ser quirúrgico y darle solo "CRM Clientes" sin tocar el resto.
6. Copiá el token (solo lo ves una vez) y pegalo cuando el Lab te pida `AIRTABLE_API_KEY`. Cifrado en tu Keychain.

Si trabajás con varios clientes o proyectos, conviene un PAT por contexto en vez de uno omnipotente.

--- dev ---

`airtable-mcp-server` (Adam Jones / @domdomegg) expone tools verificadas contra el README oficial. Records: `list_records`, `search_records`, `get_record`, `create_record`, `update_records`, `delete_records`. Schema: `list_bases`, `list_tables`, `describe_table`, `create_table`, `update_table`, `create_field`, `update_field`. Collaboration: `create_comment`, `list_comments`.

Auth via `AIRTABLE_API_KEY` env. Required scopes: `schema.bases:read` + `data.records:read`. Writes son scopes opcionales separados. El PAT define también qué bases ve el server.

Terminal Sync mantiene el token + base IDs en tu Keychain, sincronizados cifrados entre máquinas con AES-256-GCM.

Licencia: MIT. Fuente: github.com/domdomegg/airtable-mcp-server.
