---
name: Ahrefs
logo: /connectors/ahrefs.svg
category: automation
status: available
simpleTitle: "Tu SEO, explicado en palabras simples"
simpleSubtitle: "\"¿Dónde aparecemos?\" \"¿Quién nos linkea?\" \"¿Sobre qué conviene escribir?\" — tu IA lee tus datos de SEO."
devTitle: "Conector MCP de Ahrefs"
devSubtitle: "MCP oficial de Ahrefs sobre la Ahrefs API — posiciones, backlinks, dominios que refieren, keywords orgánicas, métricas de dominio."
ctaUrl: "https://ahrefs.com"
tokenHelpUrl: "https://docs.ahrefs.com/docs/api/reference/api-keys-creation-and-management"
manifest:
  mcpServers:
    ahrefs:
      command: npx
      args: ["-y", "@ahrefs/mcp"]
      env:
        API_KEY: "${SECRET:AHREFS_API_KEY}"
affiliate: false
tagline: "Posiciones, backlinks y keywords al alcance de la IA"
originalAuthor: "Ahrefs"
originalAuthorUrl: "https://ahrefs.com"
license: "MIT"
---
Que te encuentren en Google es media batalla para un negocio chico, pero las herramientas de SEO están hechas para especialistas y te ahogan en gráficos. Si tenés una cuenta de **Ahrefs**, este conector deja que tu IA lea tus datos de SEO y responda las preguntas que de verdad importan — en palabras simples, sin que aprendas el panel.

Preguntale *"¿dónde aparecemos por nuestras palabras clave?"* y lee tus posiciones. Preguntale *"¿quién nos está linkeando y perdimos algún link este mes?"* y chequea tus backlinks. Preguntale *"¿qué está buscando la gente sobre lo que podríamos escribir?"* y trae ideas de keywords. Convierte una herramienta de especialista en algo que simplemente preguntás.

### Qué le podés pedir

- *"¿Por qué keywords estamos en la página 2? Esas son las ganancias rápidas."*
- *"Listame los sitios que nos linkean, mejores primero, y marcá los links que perdimos."*
- *"Compará la fuerza de nuestro dominio contra mis dos competidores principales."*

### Qué necesitás

Ahrefs se conecta con una **API key** de tu cuenta de Ahrefs:

1. Seguí la guía oficial en [docs.ahrefs.com → API keys](https://docs.ahrefs.com/docs/api/reference/api-keys-creation-and-management) para crear y administrar una key.
2. Asegurate de que los permisos de la key cubran los datos que querés consultar.
3. Copiá la key y pegala cuando el Lab te pida `AHREFS_API_KEY`.

La key queda guardada cifrada en tu Keychain y sincronizada entre tus máquinas.

> Aviso: la Ahrefs API es un adicional **pago** a una suscripción de Ahrefs — este conector lee los datos que tu plan ya te da, pero necesitás tener el acceso a la API habilitado en tu cuenta. Si no tenés Ahrefs, los chequeos tipo "¿está caído mi sitio / qué tan rápido carga?" los cubren otros conectores; Ahrefs es específicamente para posiciones de búsqueda y backlinks.

--- dev ---

`@ahrefs/mcp` (publicado por **Ahrefs**, oficial) expone la Ahrefs API al agente. El README del paquete está enfocado en la instalación y no enumera nombres de tools individuales; la superficie de la Ahrefs API cubre **keywords orgánicas / posiciones**, **backlinks y dominios que refieren**, **domain rating / URL rating**, **métricas e ideas de keywords**, y **rank tracking** — el conector mapea eso a tools MCP.

La auth es una sola env var `API_KEY` (una API key de Ahrefs; los permisos se setean en la propia key). Requiere acceso a la API en la suscripción de Ahrefs.

Terminal Sync guarda la key en tu Keychain, sincronizada cifrada entre máquinas con AES-256-GCM. Es un conector de solo lectura — reporta datos, no cambia nada en Ahrefs.

Licencia: MIT. Fuente: npm `@ahrefs/mcp` (autor Ahrefs).
