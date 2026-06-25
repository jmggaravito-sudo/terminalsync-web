---
name: Filesystem
logo: /connectors/filesystem.svg
category: dev
status: available
simpleTitle: "Tu IA lee y escribe archivos en tu computadora"
simpleSubtitle: "Elegís qué carpetas puede tocar — todo lo demás queda fuera de alcance."
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
**Filesystem** es la herramienta más simple y más útil del catálogo: tu IA pasa a poder leer y escribir archivos directamente en tu disco. Sin copiar-pegar, sin capturas de pantalla, sin describir contenido a mano.

Pero no es acceso total. Vos le declarás una lista de carpetas permitidas (un "allow-list") y todo lo que esté afuera de esa lista es invisible para el agente. Si le permitís `~/Documents/proyectos`, no puede mirar `~/Desktop`, ni `/etc`, ni tus fotos. Sandboxed por diseño.

### Qué le podés pedir

- *"Leéme todos los `.md` de mi carpeta de notas y decime cuáles son apuntes de viaje y cuáles de reuniones."*
- *"En `~/Documents/proyectos/cliente-X`, creame una carpeta `propuesta-mayo/` con un `README.md` que explique la estructura."*
- *"Buscá en mis notas dónde mencioné 'pricing' la semana pasada y traeme el contexto."*

### Qué necesitás configurar

A diferencia del resto, este conector **no pide token**, pero sí pide que vos elijas **qué carpetas puede acceder**. Sin eso, el servidor arranca pero no tiene nada para mirar.

Después de instalarlo, abrí `~/.claude.json`, buscá el bloque `filesystem` y agregale al final del array `args` cada carpeta permitida. Ejemplo típico:

```json
"filesystem": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/tu-nombre/Desktop", "/Users/tu-nombre/Documents/proyectos"]
}
```

Podés agregar tantas como quieras. Pensalo así: cada path que sumes es una llave más en el llavero del agente. Empezá con poco (una carpeta específica de proyectos) y andá agregando a medida que veas que necesitás.

--- dev ---

`@modelcontextprotocol/server-filesystem` corre por `npx` y recibe al menos una ruta allow-listed como argumento posicional. Tools expuestas: `read_file`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `move_file`, `search_files`. Operaciones sobre paths fuera del allow-list devuelven `permission denied` — no hay escapes silenciosos.

Hoy el manifest se sirve sin paths por defecto. El Lab no inyecta el workspace de la sesión en los args de MCP en runtime; deuda conocida que se cierra cuando el `InstallModal` gane un campo `installPath` análogo a `installEnv`.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
