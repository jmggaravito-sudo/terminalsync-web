---
name: Filesystem
logo: /connectors/filesystem.svg
category: dev
status: available
simpleTitle: "Tu IA lee y escribe archivos en tu computadora"
simpleSubtitle: "Elegís qué carpetas puede tocar — todo lo demás queda fuera de alcance."
devTitle: "Filesystem MCP Server"
devSubtitle: "Official MCP filesystem server: read/write, search, edit, allow-listed directories."
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
**Filesystem** es la herramienta más simple y más útil del catálogo. En palabras del propio README oficial, es un *"Node.js server implementing Model Context Protocol (MCP) for filesystem operations"* — tu IA pasa a poder leer, escribir, listar, buscar, editar y mover archivos directamente en tu disco.

Pero no es acceso total. Vos le declarás una lista de carpetas permitidas (un "allow-list") y todo lo que esté afuera de esa lista es invisible para el agente. Si le permitís `~/Documents/proyectos`, no puede mirar `~/Desktop`, ni `/etc`, ni tus fotos. Sandboxed por diseño.

### Qué le podés pedir

- *"Leéme todos los `.md` de mi carpeta de notas y decime cuáles son apuntes de viaje y cuáles de reuniones."*
- *"En `~/Documents/proyectos/cliente-X`, creame una carpeta `propuesta-mayo/` con un `README.md` que explique la estructura."*
- *"Buscá en mis notas dónde mencioné 'pricing' la semana pasada y traeme el contexto."*

### Qué necesitás configurar

A diferencia del resto, este conector **no pide token**, pero sí pide que vos elijas **qué carpetas puede acceder**. Hay dos formas de hacerlo, ambas documentadas en el README oficial:

**Opción 1 — Argumentos CLI** (la clásica): abrí `~/.claude.json`, buscá el bloque `filesystem` y agregale cada carpeta permitida al final del array `args`:

```json
"filesystem": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/tu-nombre/Desktop", "/Users/tu-nombre/Documents/proyectos"]
}
```

**Opción 2 — MCP Roots protocol** (recomendado por el oficial): el cliente puede declarar las carpetas dinámicamente sin reiniciar el server. Cuando el cliente envía `roots`, *"completely replace any server-side Allowed directories when provided"*. Útil para entornos donde la carpeta cambia por sesión.

Cada path que sumes es una llave más en el llavero del agente. Empezá con poco (una carpeta específica de proyectos) y andá agregando a medida que veas que necesitás.

--- dev ---

`@modelcontextprotocol/server-filesystem` expone 14 tools verificadas contra el README oficial: lectura (`read_text_file`, `read_media_file`, `read_multiple_files`, `list_directory`, `directory_tree`, `search_files`, `get_file_info`, `list_allowed_directories`) y escritura (`write_file`, `edit_file`, `create_directory`, `move_file`). `read_text_file` soporta `head`/`tail`; `edit_file` tiene pattern matching + dry-run; `search_files` usa glob.

Operaciones sobre paths fuera del allow-list devuelven `permission denied` — no hay escapes silenciosos. El allow-list se define vía args posicionales O vía MCP Roots (este último, cuando se envía, reemplaza por completo el allow-list de inicio).

Hoy el manifest del catálogo se sirve sin paths por defecto. El Lab no inyecta el workspace de la sesión en los args de MCP en runtime; deuda conocida que se cierra cuando el `InstallModal` gane un campo `installPath` análogo a `installEnv`, o cuando se cablee el envío de `roots` desde el cliente.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
