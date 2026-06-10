---
name: Time
logo: /connectors/time.svg
category: productivity
status: available
simpleTitle: "Timezone conversions and now() from your AI"
simpleSubtitle: "\"What time is it in Madrid right now?\", \"convert 3pm BOG to UTC\" — without opening another app."
devTitle: "Time MCP"
devSubtitle: "Current time + timezone conversion utility. Zero auth."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/time"
affiliate: false
tagline: "Timezones in conversation"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Tiny but useful: tells your AI the time at any IANA timezone, converts between zones without errors, anchors meetings to multiple regions.

No keys, no setup — install and ready.

--- dev ---

`@modelcontextprotocol/server-time` exposes `get_current_time` and `convert_time`. Accepts IANA timezone names (e.g. `America/Bogota`, `Europe/Madrid`). License: MIT.
