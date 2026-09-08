---
name: Pipedrive
logo: /connectors/pipedrive.svg
category: automation
status: available
simpleTitle: "Tu pipeline de ventas, a un mensaje de distancia"
simpleSubtitle: "MCP oficial de Pipedrive: busca negocios, actualiza registros y lee tu pipeline con tu propio inicio de sesión."
devTitle: "Conector MCP de Pipedrive"
devSubtitle: "MCP hospedado oficial de Pipedrive (mcp.pipedrive.ai) — registros de CRM y datos de pipeline mediante OAuth."
ctaUrl: "https://www.pipedrive.com"
tokenHelpUrl: "https://support.pipedrive.com/en/article/mcp"
manifest:
  mcpServers:
    pipedrive:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.pipedrive.ai/mcp"]
affiliate: false
tagline: "Tus negocios y contactos, al alcance del agente"
originalAuthor: "Pipedrive"
originalAuthorUrl: "https://www.pipedrive.com/en/features/mcp-server"
license: "proprietary"
licenseUrl: "https://www.pipedrive.com/en/terms-of-service"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Pipedrive** es el CRM que usan muchos equipos de ventas pequeños para seguir los negocios desde el primer contacto hasta el cierre — quién está en el pipeline, en qué etapa y qué se está frenando. El server MCP nativo de Pipedrive, publicado directamente por Pipedrive, permite que tu agente lea y actualice ese pipeline en lenguaje simple — sin pegar ninguna clave de API, solo con el inicio de sesión de tu propia cuenta de Pipedrive.

Puedes pedirle *"Muéstrame todos los negocios abiertos de más de $10.000 que no se actualizaron en dos semanas"* y busca en tu pipeline. Puedes decirle *"Mueve el negocio de Acme Corp a Propuesta enviada y agenda un seguimiento para el viernes"* y actualiza el negocio y crea la actividad. Sirve para buscar negocios, contactos y organizaciones, actualizar registros, convertir leads y transformar notas de una reunión en registros de CRM — en palabras de la propia Pipedrive, puede *"crear un negocio, un contacto y una actividad de seguimiento"* directo desde una conversación.

### Qué le puedes pedir

- *"Muéstrame todos los negocios abiertos de más de $10.000 que no se actualizaron en dos semanas."*
- *"Mueve el negocio de Acme Corp a Propuesta enviada y agenda un seguimiento para el viernes."*
- *"Crea un negocio, un contacto y una actividad de seguimiento a partir de estas notas de reunión."*
- *"¿Qué negocios están frenados y necesitan un empujón?"*

### Cómo te conectas

Este conector **no te pide pegar ninguna clave de API**. Usa el inicio de sesión de tu propia cuenta de Pipedrive:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el inicio de sesión de Pipedrive en tu navegador y te pide iniciar sesión y autorizar el acceso.
3. Apruébalo con tu cuenta. En palabras de la propia Pipedrive: *"Your AI assistant can only access and modify data your Pipedrive user already has permission to view and edit"* (tu asistente de IA solo puede acceder y modificar los datos que tu usuario de Pipedrive ya tiene permiso de ver y editar), y cada acción queda registrada en el historial de cambios de Pipedrive. La guía oficial de configuración está en [support.pipedrive.com](https://support.pipedrive.com/en/article/mcp).

**Aclaración honesta:** es un server **hospedado por Pipedrive** (`https://mcp.pipedrive.ai/mcp`), no algo que corre en tu computadora. Está disponible en todos los planes de Pipedrive, y el uso consume una cuota de tokens incluida en tu plan — Pipedrive vende tokens adicionales si hacen falta.

--- dev ---

Pipedrive publica su **server MCP nativo** como un endpoint hospedado en `https://mcp.pipedrive.ai/mcp`, anunciado por Pipedrive el 30 de junio de 2026 (*"Pipedrive launches native MCP server, bringing CRM workflows directly into AI assistants"*) y documentado en `support.pipedrive.com/en/article/mcp` (visión general) y `support.pipedrive.com/en/article/mcp-claude` (configuración específica para Claude). No hay paquete npm ni instalación local — TerminalSync conecta el endpoint hospedado con:

```
npx -y mcp-remote@latest https://mcp.pipedrive.ai/mcp
```

La autenticación es OAuth contra la propia cuenta de Pipedrive del usuario (sin client secret que guardar); la guía de Pipedrive para Claude describe cómo agregarlo como conector personalizado (nombre, pegar la URL del endpoint), iniciar sesión y aprobar el pop-up de autorización.

Capacidades documentadas, verbatim de la página de features y la base de conocimiento de Pipedrive: *"Search deals, contacts, organizations and leads. Retrieve pipeline details"*; *"Create and update deals, contacts and activities. Convert leads, schedule follow-ups"*; *"Turn meeting notes into CRM records, generate follow-up tasks"*; además de analizar tendencias del pipeline para identificar negocios frenados.

**Divulgación:** la propia documentación de Pipedrive dice que el acceso queda acotado a lo que el usuario conectado ya puede ver y editar, y que *"all actions are recorded in the change log for full auditability"*. La base de conocimiento también aclara que el acceso vía MCP no es automático — un administrador o el propio usuario lo tiene que autorizar explícitamente. El uso consume una cuota de tokens incluida en el plan de la cuenta; Pipedrive vende tokens adicionales por separado.

Licencia: términos propietarios de SaaS (`pipedrive.com/en/terms-of-service`). Fuente: pipedrive.com/en/features/mcp-server, support.pipedrive.com/en/article/mcp, support.pipedrive.com/en/article/mcp-claude.
