---
name: Filesystem
logo: /connectors/filesystem.svg
category: dev
status: available
simpleTitle: "Tu IA lee y escribe archivos en tu computadora"
simpleSubtitle: "Elegís una carpeta permitida y la IA trabaja solo ahí: leer, listar, editar y crear archivos."
devTitle: "Filesystem MCP Server"
devSubtitle: "Expose allow-listed local directories over the official MCP filesystem server."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem"
manifest:
  mcpServers:
    filesystem:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
affiliate: false
tagline: "Archivos locales, con allow-list"
originalAuthor: "modelcontextprotocol"
originalAuthorUrl: "https://github.com/modelcontextprotocol"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/servers/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Le decís: "miráme esta carpeta y contame qué hay en cada subdirectorio". Lo hace. Le decís: "creá el archivo `notas.md` con este resumen". Lo hace — solo dentro de la ruta que vos permitiste.

El punto importante: no es acceso total a tu disco. El servidor recibe una lista de directorios permitidos y todo lo demás queda fuera de alcance.

--- dev ---

`@modelcontextprotocol/server-filesystem` corre por `npx` y recibe al menos una ruta allow-listed como argumento. Expone herramientas para leer, escribir, editar, listar, crear directorios, mover archivos y buscar dentro de las rutas permitidas. No requiere secrets.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
