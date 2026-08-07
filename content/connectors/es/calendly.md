---
name: Calendly
logo: /connectors/calendly.svg
category: productivity
status: available
simpleTitle: "Tus agendamientos, resueltos en lenguaje natural"
simpleSubtitle: "Server oficial de Calendly: chequeá disponibilidad, agendá y gestioná reuniones por OAuth."
devTitle: "Conector MCP de Calendly"
devSubtitle: "MCP oficial hospedado de Calendly (mcp.calendly.com) — tipos de evento, disponibilidad y reservas."
ctaUrl: "https://calendly.com"
tokenHelpUrl: "https://developer.calendly.com/calendly-mcp-server"
manifest:
  mcpServers:
    calendly:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.calendly.com"]
affiliate: false
tagline: "Tus reservas, al alcance del agente"
originalAuthor: "Calendly"
originalAuthorUrl: "https://developer.calendly.com/calendly-mcp-server"
license: "proprietary"
licenseUrl: "https://calendly.com/legal"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Calendly** es el link de agendamiento que la gente usa para reservar un horario en tu calendario sin el ida y vuelta de mensajes. El conector oficial de Calendly es un **server MCP hospedado** (`https://mcp.calendly.com`), publicado por Calendly, que le da a tu agente acceso para chequear disponibilidad, ver eventos agendados y gestionar links de reserva usando la configuración de calendario que ya tenés en Calendly.

Preguntale *"¿Cuál es mi primer horario libre esta semana para una llamada de 30 minutos?"* y chequea tus tipos de evento y disponibilidad. Decile *"Mandame un link de reserva de un solo uso para una llamada de introducción de 15 minutos"* y genera uno que le podés pasar directo a un prospecto. Sirve para responder "cuándo tengo libre" y manejar las partes rutinarias de agendar sin abrir el dashboard.

### Qué le podés pedir

- *"¿Cuál es mi primer horario libre esta semana para una llamada de 30 minutos?"*
- *"Generame un link de reserva de un solo uso para una llamada de introducción de 15 minutos."*
- *"Mostrame mis eventos agendados para mañana."*
- *"Cancelá mi llamada de las 2pm del viernes y avisame cuando esté hecho."*

### Cómo conectás

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Calendly:

1. Activá el conector en TerminalSync.
2. El puente `mcp-remote` abre el flujo de OAuth de Calendly en tu navegador — el cliente se registra solo, sin configurar ninguna app a mano.
3. Iniciá sesión y autorizá el acceso. Lo que el agente puede ver o hacer queda acotado por tu propia cuenta de Calendly.

**Aclaración honesta:** es un **server hospedado por Calendly** (`https://mcp.calendly.com`), no algo que corre en tu computadora. Pasó a disponibilidad general el 17 de febrero de 2026, así que es el camino soportado hoy para conectar asistentes de IA con Calendly.

--- dev ---

Calendly publica su server MCP como un **server remoto/hospedado**, completamente hospedado en `https://mcp.calendly.com`, documentado en `developer.calendly.com/calendly-mcp-server`. No hay paquete stdio local: te conectás a la URL hospedada y localmente hacés de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.calendly.com
```

La auth es **OAuth 2.1 (Authorization Code + PKCE, S256) con Dynamic Client Registration (RFC 7591)** — no requiere una app OAuth manual ni credenciales pre-emitidas. Según la doc oficial, los clientes descubren el server vía dos endpoints de metadata, `https://mcp.calendly.com/.well-known/oauth-protected-resource` y `https://calendly.com/.well-known/oauth-authorization-server`, y luego se auto-registran en `https://calendly.com/oauth/register` para obtener un `client_id` antes de arrancar el flujo estándar de authorization-code + PKCE (se abre un navegador para el consentimiento del usuario).

Tools, según la doc oficial: listar tipos de evento, encontrar horarios disponibles, gestionar disponibilidad y reglas de agendamiento, obtener links de agendamiento, crear eventos agendados, cancelar eventos y generar links de agendamiento de un solo uso. La lista completa de tools está publicada en la página `/supported-tools` de la doc.

Como agendar/cancelar eventos cambia lo que aparece en un calendario real, TerminalSync pasa las tools de crear/cancelar por un paso de confirmación.

Licencia: términos SaaS propietarios (Calendly Terms of Service, `calendly.com/legal`). Fuente: developer.calendly.com/calendly-mcp-server.
