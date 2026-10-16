---
name: Pipedrive
logo: /connectors/pipedrive.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Tu pipeline de ventas, resuelto en lenguaje natural"
simpleSubtitle: "Server MCP oficial de Pipedrive: busca, crea y actualiza tratos, contactos y seguimientos por OAuth."
devTitle: "Conector MCP de Pipedrive"
devSubtitle: "MCP oficial hospedado de Pipedrive (mcp.pipedrive.ai/mcp) — tratos, contactos, organizaciones, leads, actividades, notas."
ctaUrl: "https://www.pipedrive.com"
tokenHelpUrl: "https://support.pipedrive.com/en/article/mcp"
manifest:
  mcpServers:
    pipedrive:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.pipedrive.ai/mcp"]
affiliate: false
tagline: "Tu pipeline, al alcance del agente"
originalAuthor: "Pipedrive"
originalAuthorUrl: "https://www.pipedrive.com/en/features/mcp-server"
license: "proprietary"
licenseUrl: "https://www.pipedrive.com/en/terms-of-service"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-12T14:38:42.430Z"
verifiedPackageVersion: null
---
**Pipedrive** es el CRM construido alrededor de un pipeline visual de ventas: los tratos avanzan etapa por etapa hasta cerrar. El conector oficial de Pipedrive es un **server MCP hospedado** (`https://mcp.pipedrive.ai/mcp`), construido y mantenido por Pipedrive, que le da a tu agente acceso para buscar y actualizar tus tratos, contactos, organizaciones y leads con los permisos de tu propio usuario de Pipedrive.

Pregúntale *"Muéstrame todos los tratos abiertos que no se actualizaron en dos semanas"* y revisa tu pipeline por ti. Pega *"estas son mis notas de la llamada de hoy"* y puede crear el trato, el contacto y la actividad de seguimiento de una sola vez. Sirve para la parte rutinaria de mantener un CRM al día — la que todo equipo de ventas termina abandonando — sin abrir el dashboard.

### Qué le puedes pedir

- *"Muéstrame todos los tratos abiertos que no se actualizaron en dos semanas."*
- *"¿Qué tratos tienen más chances de cerrar este mes y cuáles son los próximos pasos?"*
- *"Aquí van mis notas de la llamada de hoy. Crea un trato, un contacto y una actividad de seguimiento."*
- *"Mueve el trato de [empresa] a la etapa [nombre de la etapa] y agenda un seguimiento para [fecha]."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Pipedrive:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login OAuth de Pipedrive en tu navegador — inicias sesión y haces clic en *"Permitir e instalar"*.
3. El agente solo puede acceder y modificar datos que tu usuario de Pipedrive ya tiene permiso para ver y editar, y cada acción queda registrada en el log de cambios de Pipedrive.

**Aclaración honesta:** es un **server hospedado por Pipedrive** (`https://mcp.pipedrive.ai/mcp`), no algo que corre en tu computadora. Está en beta y disponible para todos los clientes de Pipedrive, en cualquier plan; el uso está sujeto a límites de tokens según tu plan, y puedes comprar tokens adicionales si los necesitas.

--- dev ---

Pipedrive publica su server MCP como **server remoto/hospedado** en `https://mcp.pipedrive.ai/mcp`, documentado en `pipedrive.com/en/features/mcp-server` y `support.pipedrive.com/en/article/mcp` (con una referencia publicada de tools). No hay paquete stdio local: te conectas a la URL hospedada y localmente haces de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.pipedrive.ai/mcp
```

La auth es **OAuth con login en el navegador** — según la guía oficial de setup, inicias sesión en Pipedrive y haces clic en *"Allow and install"*; el acceso se otorga *"in accordance with your existing user permissions"*. Sin API key, sin app custom que registrar. Pipedrive declara que el server *"works with any AI assistant that supports custom MCP connections"*.

Tools, según la referencia oficial (`support.pipedrive.com/en/article/mcp-tools`): siguen un patrón de nombres `get*` (traer una lista), `get*` singular (traer un registro), `add*` (crear), `update*` (editar) y `search*` (buscar por palabra clave) — sobre **actividades, tratos, contactos (persons), organizaciones, leads, productos y notas**, más `getStages`/`getStage` para las etapas del pipeline y `convertLeadToDeal`/`getLeadConversionStatus` para la conversión de leads.

Divulgación: el server está hospedado por Pipedrive; el agente *"can only access and modify data your Pipedrive user already has permission to view and edit"*; *"All actions are recorded in the change log for full auditability"*; *"MCP does not automatically grant access to your Pipedrive data"* — las apps de IA pueden actuar *"only when explicitly permitted by the user or administrator"*. Disponible para todos los clientes en cualquier plan; *"Usage is subject to token limits based on your plan and you can purchase additional tokens if needed"*.

Licencia: términos SaaS propietarios (Pipedrive Terms of Service, `pipedrive.com/en/terms-of-service`). Fuentes: pipedrive.com/en/features/mcp-server, support.pipedrive.com/en/article/mcp, support.pipedrive.com/en/article/mcp-claude, support.pipedrive.com/en/article/mcp-tools.
