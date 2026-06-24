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
      args: ["-y", "@modelcontextprotocol/server-filesystem"]
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

**Antes de usarlo:** este conector necesita saber a qué carpetas puede acceder tu IA. Después de instalarlo, abrí `~/.claude.json`, buscá el bloque `filesystem` y agregale los paths permitidos al final del array `args`. Ejemplo:

```json
"filesystem": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/tu-nombre/Desktop", "/Users/tu-nombre/Documents"]
}
```

Sin paths, el conector arranca pero no puede leer ni escribir nada.

--- dev ---

`@modelcontextprotocol/server-filesystem` corre por `npx` y recibe al menos una ruta allow-listed como argumento posicional. Expone herramientas para leer, escribir, editar, listar, crear directorios, mover archivos y buscar dentro de las rutas permitidas. No requiere secrets.

El manifest del catálogo ship sin paths por defecto — el Lab no inyecta el workspace de la sesión en los args de MCP todavía. El usuario debe editar `~/.claude.json` post-install. Deuda conocida: cuando el Lab gane un campo `installPath` análogo a `installEnv`, el `InstallModal` lo pedirá interactivamente.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
