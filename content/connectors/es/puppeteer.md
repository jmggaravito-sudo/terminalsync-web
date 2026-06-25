---
name: Puppeteer
logo: /connectors/puppeteer.svg
category: dev
status: available
simpleTitle: "Que tu IA use un navegador real"
simpleSubtitle: "Abrí páginas, hacé clic, completá formularios y sacá capturas cuando leer HTML no alcanza."
devTitle: "Puppeteer MCP Connector"
devSubtitle: "Servidor oficial @modelcontextprotocol: browser automation con screenshots, console logs y JavaScript."
ctaUrl: "https://pptr.dev"
manifest:
  mcpServers:
    puppeteer:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-puppeteer"]
affiliate: false
tagline: "Navegador real para tu IA"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-puppeteer"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-puppeteer"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Puppeteer** es una herramienta para controlar un navegador real desde código. Sirve para páginas que cargan con JavaScript, tienen formularios o necesitan interacción visual.

Este conector deja que tu IA abra páginas, haga clic, complete campos, seleccione opciones, saque capturas, lea mensajes de consola y ejecute JavaScript en el navegador. El README oficial dice que permite a los modelos *"interact with web pages, take screenshots, and execute JavaScript in a real browser environment"*.

### Qué le podés pedir

- *"Abrí esta página, sacá una captura y decime si el formulario principal se ve bien."*
- *"Entrá a esta URL de staging, hacé clic en el botón de compra y contame qué aparece después."*
- *"Revisá la consola del navegador y resumí los errores que aparezcan al cargar la página."*

### Qué configuración necesitás

No necesitás token. El conector instala el server con `npx` y abre un navegador local para que la IA pueda interactuar con páginas.

1. Instalalo desde el Lab como cualquier conector sin secretos.
2. Usalo solo con sitios donde tengas permiso para navegar o testear.
3. Si necesitás cambiar cómo arranca el navegador, pedile a alguien técnico que revise las opciones de Puppeteer antes de tocar seguridad.

Puppeteer es más pesado que un lector simple de páginas porque levanta un navegador real. Reservalo para casos donde necesitás ver, hacer clic o probar una página como una persona.

--- dev ---

`@modelcontextprotocol/server-puppeteer` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-puppeteer`; no requiere secrets.

Tools verificadas contra README y bundle npm: `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_hover`, `puppeteer_fill`, `puppeteer_select`, `puppeteer_evaluate`. Resources verificadas: `console://logs` y `screenshot://<name>`.

El README documenta `PUPPETEER_LAUNCH_OPTIONS` como env var JSON y parámetros `launchOptions` / `allowDangerous` en `puppeteer_navigate`. Gotcha de seguridad: `allowDangerous=false` por defecto bloquea args peligrosos como `--no-sandbox` y `--disable-web-security`.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-puppeteer` en npm.
