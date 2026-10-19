---
name: Alegra
logo: /connectors/alegra.svg
category: automation
markets: ["CO", "MX", "AR", "PE", "CR", "PA", "DO", "VE", "ES"]
status: soon
simpleTitle: "Tu facturación y tu contabilidad, respondidas en lenguaje natural"
simpleSubtitle: "La conexión por API ya está en TerminalSync. El MCP oficial sigue pendiente de autorización."
devTitle: "Conector MCP de Alegra"
devSubtitle: "MCP oficial hospedado de Alegra: OAuth, endpoint raíz y consultas de solo lectura; pendiente de smoke en TerminalSync."
ctaUrl: "https://www.alegra.com/mcp/"
manifest:
  mcpServers:
    alegra:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.alegra.com"]
affiliate: false
tagline: "Tus facturas, tu inventario y tus reportes, al alcance del agente"
originalAuthor: "Alegra"
originalAuthorUrl: "https://developer.alegra.com"
license: "MIT"
licenseUrl: "https://opensource.org/licenses/MIT"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: false
installableForAiReason: "needs-oauth"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-10T07:31:32.656Z"
verifiedPackageVersion: null
---
**Alegra** permite consultar facturas, inventario, contactos y reportes desde una IA. Su [MCP oficial](https://www.alegra.com/mcp/) es un servicio remoto de **solo lectura**: la IA puede preguntar por datos, pero no crear, editar ni borrar información mediante este MCP.

### Qué le puedes pedir

- «¿Cuánto facturé este mes?»
- «¿Qué productos tengo disponibles?»
- «¿Cuáles son mis cuentas por cobrar?»

### Cómo se conecta

Alegra indica que se pega `https://mcp.alegra.com` en un cliente MCP compatible y se autoriza iniciando sesión con la cuenta habitual de Alegra. **No hay que generar ni pegar un token API o una cadena Base64.** La [autenticación Basic del API tradicional](https://developer.alegra.com/reference/autenticaci%C3%B3n) corresponde a otra interfaz, no a este flujo MCP.

**Dos vías distintas:** la conexión **por API** ya se configura dentro de TerminalSync en **Integraciones → Explorar → Alegra**, con el correo y la clave de conexión de Alegra. La app comprueba la conexión antes de mostrar «Conectado». Las consultas están disponibles; los cambios admitidos requieren aprobación individual. No hay que introducir esa clave en el MCP.

**Estado de este MCP oficial:** todavía no se puede instalar. Abrir una cuenta Alegra no lo conecta automáticamente. El cliente remoto actual de la app no llega a la pantalla de autorización: Alegra rechazó su URI local de retorno (`invalid_redirect_uri`, HTTP 400). El MCP no se presentará como listo hasta que el flujo OAuth funcione y pase un smoke de lectura con autorización expresa.

--- dev ---

- Endpoint MCP publicado por Alegra: `https://mcp.alegra.com` (raíz, **no** `/mcp`). `POST /mcp` devuelve 404; `POST /` sin credencial devuelve 401 con desafío Bearer y enlace a metadata OAuth.
- Metadata OAuth: servidor de autorización `https://auth-api.alegra.com`; registro dinámico, PKCE S256 y scope anunciado `owner`. Aunque Alegra promociona el MCP como solo lectura, hay que inspeccionar el consentimiento y las herramientas reales antes de habilitarlo en TerminalSync.
- El manifest apunta al endpoint correcto como receta futura, pero `installableForAi: false` y `needs-oauth` son deliberados: Alegra rechazó el callback `http://localhost:<puerto>/oauth/callback` de `mcp-remote@latest` con `invalid_redirect_uri` antes de abrir el navegador. No copiar al MCP las instrucciones Basic ni las herramientas de escritura/borrado del API tradicional.
- Fuente: [Alegra MCP](https://www.alegra.com/mcp/). La conexión de una cuenta real y el smoke instalado siguen **no verificados**.
