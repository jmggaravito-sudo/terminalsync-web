---
name: Canva
logo: /connectors/canva.svg
category: automation
status: available
simpleTitle: "Generá y editá diseños de Canva desde tu agente"
simpleSubtitle: "MCP oficial de Canva: generación, edición y export de diseños por OAuth."
devTitle: "Canva MCP Connector"
devSubtitle: "Official hosted Canva MCP (mcp.canva.com) — design generation, editing and export through OAuth."
ctaUrl: "https://canva.com"
tokenHelpUrl: "https://www.canva.dev/docs/mcp/"
manifest:
  mcpServers:
    canva:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.canva.com/mcp"]
affiliate: false
tagline: "Tus diseños de Canva, al alcance del agente"
originalAuthor: "Canva"
originalAuthorUrl: "https://www.canva.dev/docs/mcp/"
license: "proprietary"
licenseUrl: "https://www.canva.com/policies/canva-developer-terms/"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Canva** es la herramienta de diseño que usan los equipos para posts de redes, presentaciones, flyers y assets de marca sin necesitar un diseñador para cada cambio chico. El server MCP oficial de Canva deja que tu agente genere, edite y exporte diseños directamente — sin pegar ninguna API key en TerminalSync, solo con el login de tu propia cuenta de Canva.

Le preguntás *"Mostrame mi diseño de Canva editado más recientemente"* y el agente lo trae. Le pedís que genere un diseño nuevo o exporte uno para una campaña, y trabaja sobre tu propia cuenta de Canva y tus assets de marca. Lo que el agente puede hacer con un diseño coincide con tu propio nivel de acceso a ese diseño — los mismos permisos que ya tenés en Canva.

### Qué le podés pedir

- *"Mostrame mi diseño de Canva editado más recientemente."*
- *"Generá un diseño nuevo para un post de redes de la promo de esta semana."*
- *"Exportá este diseño como PNG para el newsletter."*
- *"Buscá los assets de marca de la última carpeta de campaña."*

### Cómo conectás

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Canva:

1. Activá el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Canva en tu navegador y te pide autorizar el acceso.
3. Aprobalo con tu cuenta. Canva exige que cada usuario se autentique individualmente — la doc oficial de setup está en [canva.dev](https://www.canva.dev/docs/mcp/).

**Aclaración honesta:** es un server **hospedado por Canva** (`https://mcp.canva.com/mcp`), no algo que corre en tu computadora. Algunas capacidades (como redimensionar diseños o usar brand kits/autofill templates) dependen de tu plan de Canva — Pro o Enterprise desbloquean más que el plan gratis.

--- dev ---

Canva publica un **server MCP remoto oficial** en `https://mcp.canva.com/mcp`, documentado en `canva.dev/docs/mcp/`. La auth usa **Client ID Metadata Documents (CIMD)** — la doc de Canva lo llama, verbatim, *"the recommended authentication method for MCP"* — con Dynamic Client Registration (DCR) disponible por compatibilidad hacia atrás pero marcado como deprecado. Cada usuario se autentica individualmente; no hay un secret compartido que inyectar, así que TerminalSync hace de puente con el endpoint hospedado con:

```
npx -y mcp-remote@latest https://mcp.canva.com/mcp
```

Categorías de tools documentadas: generación de diseños, edición de diseños, descubrimiento de diseños, gestión de assets y marca, export de diseños (PDF, PNG, JPG, PPTX, MP4, y más), y flujos colaborativos (comentarios). La doc de Canva aclara que las operaciones quedan acotadas porque *"the operations available to a user match their level of access to a design or asset"*, y que algunas funciones (redimensionar en Canva Pro+; autofill templates y brand kits en Enterprise) dependen del plan.

Licencia: términos propietarios de SaaS, bajo los API and App Developer Terms de Canva (`canva.com/policies/canva-developer-terms/`). Fuente: canva.dev/docs/mcp/.
