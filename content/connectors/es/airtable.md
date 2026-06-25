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
tokenHelpUrl: "https://airtable.com/create/tokens"
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
**Airtable** es una de las herramientas de base de datos no-código más usadas del mundo: pinta como una hoja de cálculo, funciona como una base relacional. Empresas la usan como CRM, inventario, tracker de pedidos, calendario editorial, pipeline de contenidos — todo sin programar.

Con este conector, tu IA puede leer y escribir en cualquier base de Airtable a la que le des acceso. Le preguntás *"¿qué clientes no han comprado en 60 días?"* y arma la query de filterByFormula, la corre contra Airtable y te entrega el listado. Le pedís *"marcá el pedido 487 como enviado"* y actualiza el record sin que abras la app.

### Qué le podés pedir

- *"En mi base 'CRM Clientes', listame los leads con estado 'Calificado' que no tienen actividad en las últimas 2 semanas."*
- *"Agregá un row a la tabla 'Pedidos' con cliente: María García, monto: $450, estado: Pendiente."*
- *"Buscá en 'Inventario' los productos con stock menor a 5 unidades y mandame un resumen para el reorden."*

### Qué token necesitás

Necesitás un **Personal Access Token (PAT)** de Airtable — reemplaza a las viejas API keys, da control fino sobre qué bases ve el agente.

1. Andá a [airtable.com/create/tokens](https://airtable.com/create/tokens).
2. Click en "Create new token". Ponele un nombre tipo "Terminal Sync — Claude".
3. **Scopes**: marcá `data.records:read` y `data.records:write` (también `schema.bases:read` si querés que el agente entienda la estructura de la base sin que le expliques).
4. **Access**: elegí qué bases puede ver — podés ser quirúrgico y darle solo "CRM Clientes" sin tocar el resto.
5. Copiá el token (sólo lo ves una vez) y pegalo cuando el Lab te pida `AIRTABLE_API_KEY`. Viaja cifrado en tu Keychain.

Si trabajás con varios clientes o proyectos, conviene un PAT por contexto en vez de uno omnipotente.

--- dev ---

`airtable-mcp-server` (Adam Jones / @domdomegg) expone bases, tables, fields y records sobre la Airtable REST API. Soporta `filterByFormula` para queries server-side, batch upserts y attachments. El PAT define el alcance: bases específicas + scopes granulares (`data.records:read/write`, `schema.bases:read`, `webhook:manage`).

Terminal Sync mantiene el token + base IDs en tu Keychain, sincronizados cifrados entre máquinas con AES-256-GCM. La sub-cuenta del bot ve solo lo que el PAT autoriza.

Licencia: MIT. Fuente: github.com/domdomegg/airtable-mcp-server.
