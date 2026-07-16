---
name: Neon
logo: /connectors/neon.svg
category: dev
status: available
simpleTitle: "Preguntale — y actuá — sobre tu Postgres de Neon en lenguaje natural"
simpleSubtitle: "Server oficial de Neon: administrá proyectos, branches y corré SQL."
devTitle: "Neon MCP Connector"
devSubtitle: "Official @neondatabase/mcp-server-neon: tools over the Neon API, API-key scoped."
ctaUrl: "https://neon.tech"
tokenHelpUrl: "https://neon.tech/docs/manage/api-keys"
manifest:
  mcpServers:
    neon:
      command: npx
      args: ["-y", "@neondatabase/mcp-server-neon", "start", "${SECRET:NEON_API_KEY}"]
affiliate: false
tagline: "Tu Postgres, al alcance del agente"
originalAuthor: "Neon"
originalAuthorUrl: "https://github.com/neondatabase/mcp-server-neon"
license: "MIT"
licenseUrl: "https://github.com/neondatabase/mcp-server-neon/blob/main/LICENSE"
---
**Neon** es Postgres serverless — bases de datos con branching, así que podés levantar una copia de tus datos igual que ramificás código. El conector oficial, publicado por Neon, es *"una herramienta open-source que te deja interactuar con tus bases Postgres de Neon en lenguaje natural"*. Funciona como puente entre lo que pedís y la [API de Neon](https://api-docs.neon.tech/reference/getting-started-with-neon-api), traduciendo tus pedidos en las llamadas necesarias para crear proyectos y branches, correr consultas y hacer migraciones de la base.

Le pedís *"dame un resumen de todos mis proyectos de Neon y qué datos hay en cada uno"* y lee tu cuenta y te responde. Le decís *"creá una base llamada my-database con una tabla users"* y lo arma solo — sin SQL, sin tocar la consola. Habla con Neon usando tu clave de API, así que puede hacer todo lo que vos podés hacer desde tu propia cuenta.

### Qué le podés pedir

- *"Creemos una base Postgres nueva y llamémosla 'my-database'. Después creá una tabla users con las columnas: id, name, email y password."*
- *"Quiero correr una migración en mi proyecto 'my-project' que altere la tabla users para agregar una columna nueva llamada 'created_at'."*
- *"¿Me das un resumen de todos mis proyectos de Neon y qué datos hay en cada uno?"*

### Qué token necesitás

Necesitás una **clave de API de Neon** — la que permite que un software actúe sobre tu cuenta de Neon.

1. Entrá a [console.neon.tech](https://console.neon.tech/signup) y abrí la configuración de tu cuenta.
2. Seguí la [guía de API Keys de Neon](https://neon.tech/docs/manage/api-keys) para generar una clave nueva y copiala.
3. Pegala cuando el Lab te pida `NEON_API_KEY`. Se guarda cifrada en tu Keychain.

La clave de API puede crear, cambiar y borrar proyectos y datos reales, así que tratala como una contraseña. **Una advertencia, directo de Neon:** este server local está *pensado solo para desarrollo local e integraciones con IDEs* — Neon **no recomienda usarlo en producción**, porque puede ejecutar operaciones potentes que pueden llevar a cambios accidentales o no autorizados. Revisá y autorizá siempre lo que el agente propone antes de que corra.

--- dev ---

`@neondatabase/mcp-server-neon` (Neon, oficial — repo `neondatabase/mcp-server-neon`) es el **Local MCP Server**, corre con `npx -y @neondatabase/mcp-server-neon start <NEON_API_KEY>`. La auth es una clave de API de Neon pasada como el último argumento posicional (`start <key>`); el manifest de acá la inyecta desde Keychain como `${SECRET:NEON_API_KEY}`. Requiere Node.js >= v18.

Tools expuestas al cliente (verbatim del README):

- **Project management:** `list_projects`, `list_shared_projects`, `describe_project`, `create_project`, `delete_project`
- **Branch management:** `create_branch`, `delete_branch`, `describe_branch`, `list_branch_computes`, `list_organizations`, `reset_from_parent`
- **SQL query execution:** `get_connection_string`, `run_sql`, `run_sql_transaction`, `get_database_tables`, `describe_table_schema`, `list_slow_queries`
- **Database migrations (schema changes):** `prepare_database_migration`, `complete_database_migration`
- **Query performance tuning:** `explain_sql_statement`, `prepare_query_tuning`, `complete_query_tuning`
- **Neon Auth:** `provision_neon_auth`

Las migraciones corren de forma segura vía el par `prepare_database_migration` ("Start") / `complete_database_migration` ("Commit") — el comando "Start" aplica la migración a un branch temporal para que el LLM la pueda testear antes de commitearla al branch original.

**Seguridad, en las palabras de Neon:** *"The Neon MCP Server is intended for local development and IDE integrations only. We do not recommend using the Neon MCP Server in production environments. It can execute powerful operations that may lead to accidental or unauthorized changes."* Revisá y autorizá siempre las acciones que pide el LLM antes de ejecutarlas.

**Alternativa — Remote MCP Server (Preview):** en vez del setup local con clave de API, Neon ofrece un server remoto gestionado que autentica vía OAuth (`npx -y mcp-remote https://mcp.neon.tech/mcp`), lo que elimina el manejo de claves de API y trae las últimas features automáticamente. También soporta auth por clave de API vía un header `Authorization: Bearer`.

Terminal Sync mantiene la clave de API en Keychain vía `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: github.com/neondatabase/mcp-server-neon.
