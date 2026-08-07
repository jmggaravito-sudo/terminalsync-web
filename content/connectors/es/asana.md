---
name: Asana
logo: /connectors/asana.svg
category: productivity
status: available
simpleTitle: "Gestioná tus tareas de Asana en lenguaje natural"
simpleSubtitle: "Server oficial de Asana: encontrá tareas, creá trabajo y consultá el estado de tus proyectos."
devTitle: "Asana MCP Connector"
devSubtitle: "Official hosted Asana MCP (mcp.asana.com) — Work Graph access over OAuth."
ctaUrl: "https://asana.com"
tokenHelpUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
manifest:
  mcpServers:
    asana:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.asana.com/v2/mcp"]
affiliate: false
tagline: "Tus proyectos de Asana, al alcance del agente"
originalAuthor: "Asana"
originalAuthorUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
license: "proprietary"
licenseUrl: "https://asana.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Asana** es la app que usa tu equipo para llevar el control de tareas, proyectos y quién está haciendo qué y para cuándo. El conector oficial de Asana es un **server MCP hospedado** que le da a tu agente acceso a tu **Work Graph** —las tareas, proyectos y secciones que tu cuenta ya puede ver— para que puedas preguntar por tu trabajo en vez de andar clickeando tableros a mano.

Le preguntás *"Encontrá todas mis tareas pendientes que vencen esta semana"* y busca entre el trabajo asignado a vos. Le pedís *"Creá una tarea nueva en el proyecto de Marketing asignada a mí"* y la crea directamente. Sirve para chequear el estado de un proyecto, listar secciones, ponerte al día con lo pendiente, y crear o actualizar trabajo sin salir del chat.

### Qué le podés pedir

- *"Encontrá todas mis tareas pendientes que vencen esta semana."*
- *"Creá una tarea nueva en el proyecto de Marketing asignada a mí."*
- *"Listá todas las secciones del proyecto Lanzamiento de Producto."*
- *"Mostrame el estado del proyecto Planificación Q2."*

Directo de los propios ejemplos de Asana: el server puede generar reportes y resúmenes, además de sacar insights con IA sobre tus proyectos, sumado a leer y crear tareas.

### Cómo conectás

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Asana:

1. Cuando lo actives, se abre una ventana del navegador para que inicies sesión en Asana y autorices el acceso (OAuth).
2. Aprobás los permisos con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta tenga permitido.
3. Listo: no hay token que copiar ni que renovar a mano. La guía oficial de conexión de Asana está en [developers.asana.com](https://developers.asana.com/docs/using-asanas-mcp-server).

**Aclaración honesta:** es un server **hospedado por Asana** (no corre en tu computadora). Localmente se usa el puente `mcp-remote`, que abre el flujo de OAuth y mantiene la conexión con `https://mcp.asana.com/v2/mcp`. Lo que el agente puede ver o crear queda acotado por los permisos de tu cuenta de Asana — la documentación de Asana no publica más detalle sobre retención de datos del lado del server más allá de eso.

--- dev ---

Asana publica un **server MCP remoto/hospedado** oficial en `https://mcp.asana.com/v2/mcp` (transporte Streamable HTTP). La fuente oficial es `developers.asana.com/docs/using-asanas-mcp-server`. No hay comando stdio local: te conectás a la URL hospedada y localmente hacés de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.asana.com/v2/mcp
```

La auth es **OAuth** contra la cuenta de Asana del usuario — el cliente debe soportar OAuth y Streamable HTTP; `mcp-remote` abre el navegador para el login y no hay secret que inyectar (por eso el manifest no declara `env`). La documentación no enumera scopes granulares de OAuth; el acceso queda acotado por lo que la cuenta autenticada puede ver en Asana.

La documentación apunta a `tools/list` (un comando del cliente MCP) y a `https://developers.asana.com/llms.txt` como la fuente de verdad para el set exacto de tools actual, en vez de una lista estática en la página. Capacidades de ejemplo documentadas: consultar tareas incompletas, crear tareas, listar secciones de proyecto, chequear el estado de un proyecto, y generar reportes/insights asistidos por IA sobre el Work Graph.

**Endpoint deprecado:** un server beta anterior en `https://mcp.asana.com/sse` usaba auth Bearer/API-key; la documentación de Asana lo marca como deprecado con fecha de apagado el **05/11/2026**, a favor del endpoint v2 OAuth/Streamable-HTTP que usa este conector.

Asana no publica un repo open-source ni un archivo LICENSE para este server (es un producto hospedado, no código que se redistribuye) — se trata como términos de SaaS propietario, mismo patrón que Zapier/Ideogram en este catálogo. Fuente: developers.asana.com.
