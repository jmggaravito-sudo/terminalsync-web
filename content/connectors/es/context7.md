---
name: Context7
logo: /connectors/context7.svg
category: dev
status: available
simpleTitle: "Dale a tu IA documentación al día de las herramientas con las que programás"
simpleSubtitle: "Server oficial de Upstash: docs actuales y por versión — se acabaron las respuestas viejas."
devTitle: "Context7 MCP Connector"
devSubtitle: "Official @upstash/context7-mcp: resolve-library-id + get-library-docs. Keyless by default."
ctaUrl: "https://context7.com"
manifest:
  mcpServers:
    context7:
      command: npx
      args: ["-y", "@upstash/context7-mcp"]
affiliate: false
tagline: "Docs frescas, directo al prompt"
originalAuthor: "Upstash"
originalAuthorUrl: "https://github.com/upstash"
license: "MIT"
licenseUrl: "https://github.com/upstash/context7/blob/master/LICENSE"
---
**Context7** resuelve un problema silencioso pero constante: los modelos de IA se entrenan con una foto del pasado, así que cuando les preguntás por una librería o framework muchas veces responden con **APIs viejas y funciones que ya no existen**. Context7, hecho por Upstash, trae **documentación actual y por versión, con ejemplos de código reales**, directo de la fuente y la mete en el prompt — así la respuesta coincide con la versión que estás usando de verdad.

En realidad no le "preguntás" cosas a Context7 directamente — trabaja de fondo. Cuando estás programando y decís *"usá context7"*, o el agente se da cuenta de que necesita docs actuales, busca la librería correcta y trae su referencia al día antes de responder. La diferencia son menos funciones inventadas y menos momentos de "eso no funciona".

### Qué le podés pedir

- *"Armá un middleware de auth en Next.js 15. usá context7"* — trae los docs actuales de Next.js, no un recuerdo de 2023.
- *"¿Cómo hago un batched write en el cliente JS más nuevo de Supabase? usá context7"*
- *"Mostrame el formato actual de config de Tailwind v4. usá context7"*

### Configurar

No hay nada que configurar — funciona apenas lo instalás, sin clave. Si te topás con límites de uso o necesitás repositorios privados, opcionalmente podés crear una API key gratis en [context7.com/dashboard](https://context7.com/dashboard) y agregarla después; para uso normal no la vas a necesitar.

--- dev ---

`@upstash/context7-mcp` (Upstash, oficial — repo `upstash/context7`) corre con `npx -y @upstash/context7-mcp`. Dos tools según el README: `resolve-library-id` (mapear el nombre de una librería al id interno de Context7) y `get-library-docs` (traer docs actuales, acotadas a la versión, con ejemplos para ese id). Pensadas para encadenarse: resolver, traer docs, responder.

**Keyless por defecto** — este manifest no lleva ningún secreto, así que es una instalación real de un clic. Una `CONTEXT7_API_KEY` (o el flag `--api-key`) es *opcional*, solo hace falta para límites de uso más altos y repos privados/agregados; se saca en context7.com/dashboard. También existe un endpoint HTTP remoto (`https://mcp.context7.com/mcp`) si preferís no correr el proceso local.

Terminal Sync lo instala como un server `npx` común; cuando agregás la clave opcional, queda en Keychain vía `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: github.com/upstash/context7.
