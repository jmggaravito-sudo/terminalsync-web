---
name: Time
logo: /connectors/time.svg
category: productivity
status: available
simpleTitle: "Conversiones de timezone y now() desde tu IA"
simpleSubtitle: "\"¿Qué hora es ahora en Madrid?\", \"convertí 3pm BOG a UTC\" — sin abrir otra app."
devTitle: "Time MCP"
devSubtitle: "Utility de hora actual + conversión de timezones. Sin auth."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/time"
affiliate: false
tagline: "Timezones en la conversación"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Pequeño pero útil: le dice a tu IA la hora en cualquier IANA timezone, convierte entre zonas sin errores, ancla reuniones a múltiples regiones.

No requiere keys, no setup — instalás y listo.

--- dev ---

`@modelcontextprotocol/server-time` expone `get_current_time` y `convert_time`. Acepta nombres IANA de timezone (ej. `America/Bogota`, `Europe/Madrid`). Licencia: MIT.
