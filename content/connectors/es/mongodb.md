---
name: MongoDB
logo: /connectors/mongodb.svg
category: dev
status: available
simpleTitle: "Preguntale — y actuá — sobre tu MongoDB en lenguaje natural"
simpleSubtitle: "Server oficial de MongoDB: consultá tus bases y administrá Atlas sin una shell."
devTitle: "MongoDB MCP Connector"
devSubtitle: "Official mongodb-mcp-server: tools over MongoDB databases + Atlas, connection-string scoped."
ctaUrl: "https://www.mongodb.com"
tokenHelpUrl: "https://www.mongodb.com/docs/manual/reference/connection-string/"
manifest:
  mcpServers:
    mongodb:
      command: npx
      args: ["-y", "mongodb-mcp-server", "--readOnly"]
      env:
        MDB_MCP_CONNECTION_STRING: "${SECRET:MONGODB_CONNECTION_STRING}"
affiliate: false
tagline: "Tu MongoDB, al alcance del agente"
originalAuthor: "MongoDB"
originalAuthorUrl: "https://github.com/mongodb-js/mongodb-mcp-server"
license: "Apache-2.0"
licenseUrl: "https://github.com/mongodb-js/mongodb-mcp-server/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**MongoDB** es la base de datos de documentos detrás de un montón de apps — datos guardados como documentos flexibles tipo JSON en vez de filas y tablas. El conector oficial, publicado por MongoDB, es *"un servidor Model Context Protocol para interactuar con bases de datos MongoDB y MongoDB Atlas"*. Es el puente entre lo que pedís y tus datos: traduce tus pedidos en las consultas y llamadas a la API de Atlas necesarias para explorar colecciones, correr agregaciones e inspeccionar tus clusters.

Le pedís *"listá todas las bases de esta conexión y cuántos documentos tiene cada colección"* y lee tu instancia y te responde. Le decís *"mostrame el schema de la colección orders"* y te describe los campos — sin shell, sin escribir consultas a mano. Habla con MongoDB usando tu connection string, así que puede alcanzar todo lo que esa conexión tenga permitido alcanzar.

### Qué le podés pedir

- *"Listá todas las bases de esta conexión y las colecciones dentro de la base 'shop'."*
- *"Describí el schema de la colección 'orders' y después buscá las 10 órdenes más recientes."*
- *"Corré una agregación sobre 'sales' que agrupe la facturación por mes de este año."*
- *"Listá mis clusters de Atlas e inspeccioná la metadata del de producción."*

### Qué token necesitás

Necesitás un **connection string de MongoDB** — la línea única que le dice a un software cómo llegar a tu base, incluyendo su host y credenciales. Se ve así: `mongodb+srv://username:password@cluster.mongodb.net/myDatabase` (o `mongodb://localhost:27017/myDatabase` para una instancia local).

1. En [MongoDB Atlas](https://cloud.mongodb.com), abrí tu cluster y hacé clic en **Connect**, después elegí un método de conexión para ver el string; la [referencia del connection string](https://www.mongodb.com/docs/manual/reference/connection-string/) explica el formato.
2. Copiá el string completo — ya trae adentro el usuario y la contraseña de la base.
3. Pegalo cuando el Lab te pida `MONGODB_CONNECTION_STRING`. Se guarda cifrado en tu Keychain.

El connection string contiene credenciales de la base, así que tratalo como una contraseña. **Una advertencia, directo de MongoDB:** el connection string *"puede contener credenciales que quedan visibles en las listas de procesos"* — MongoDB *"recomienda fuertemente usar variables de entorno para pasar la configuración sensible"*, que es exactamente como este manifest lo inyecta. Este conector viene con `--readOnly` activado por defecto, que — en palabras de MongoDB — *"solo permite operaciones de lectura, conexión y metadata, deshabilitando las operaciones de create/update/delete"*. Dejalo activado salvo que deliberadamente necesites escribir, y dale a la conexión solo los permisos mínimos que necesite.

--- dev ---

`mongodb-mcp-server` (MongoDB, oficial — repo `mongodb-js/mongodb-mcp-server`) es *"un servidor Model Context Protocol para interactuar con bases de datos MongoDB y MongoDB Atlas"*, corre con `npx -y mongodb-mcp-server@latest [options]`. La auth es tu connection string de MongoDB, pasado vía la variable de entorno `MDB_MCP_CONNECTION_STRING` (equivalente por CLI `--connectionString`); el manifest de acá lo inyecta desde Keychain como `${SECRET:MONGODB_CONNECTION_STRING}`. Las tools de administración de Atlas usan además credenciales de service account de la API de Atlas (`MDB_MCP_API_CLIENT_ID` / `MDB_MCP_API_CLIENT_SECRET`), que podés agregar si las necesitás — ver el [overview de Service Accounts](https://www.mongodb.com/docs/atlas/api/service-accounts-overview/) de MongoDB. Requiere **Node.js al menos v22.13.0** (el soporte de Node 20.x está deprecado).

Tools expuestas al cliente (verbatim del README):

- **MongoDB Database Tools:** `aggregate` — Run an aggregation against a MongoDB collection · `aggregate-db` — Run an aggregation against a MongoDB database · `collection-indexes` — Describe the indexes for a collection · `collection-schema` — Describe the schema for a collection · `collection-storage-size` — Gets the size of the collection · `connect` — Connect to a MongoDB instance · `count` — Gets the number of documents in a collection · `create-collection` — Creates a new collection in a database · `create-index` — Create an index for a collection · `db-stats` — Returns statistics reflecting database use state · `delete-many` — Removes all documents matching a filter · `drop-collection` — Removes a collection or view · `drop-database` — Removes the specified database · `drop-index` — Drop an index for a collection · `explain` — Returns statistics describing query execution · `export` — Export query/aggregation results in EJSON format · `find` — Run a find query against a collection · `insert-many` — Insert an array of documents · `list-collections` — List all collections for a database · `list-databases` — List all databases for a connection · `mongodb-logs` — Returns most recent logged mongod events · `rename-collection` — Renames a collection · `switch-connection` — Switch to a different MongoDB connection · `update-many` — Updates all documents matching a filter
- **MongoDB Atlas Tools:** `atlas-connect-cluster` — Connect to MongoDB Atlas cluster · `atlas-create-access-list` — Allow IP/CIDR ranges to access clusters · `atlas-create-cluster` — Create a MongoDB Atlas cluster (M10–M80) · `atlas-create-db-user` — Create a MongoDB Atlas database user · `atlas-create-free-cluster` — Create a free MongoDB Atlas cluster · `atlas-create-project` — Create a MongoDB Atlas project · `atlas-get-performance-advisor` — Get performance recommendations · `atlas-inspect-access-list` — Inspect IP/CIDR ranges with access · `atlas-inspect-cluster` — Inspect metadata of an Atlas cluster · `atlas-list-alerts` — List triggered alerts for a project · `atlas-list-clusters` — List MongoDB Atlas clusters · `atlas-list-db-users` — List MongoDB Atlas database users · `atlas-list-orgs` — List MongoDB Atlas organizations · `atlas-list-projects` — List MongoDB Atlas projects · `atlas-load-sample-dataset` — Load a sample dataset into a cluster · `atlas-pause-resume-cluster` — Pause or resume a cluster · `atlas-streams-build` — Create Atlas Stream Processing resources · `atlas-streams-discover` — Discover and inspect Stream Processing resources · `atlas-streams-manage` — Manage Stream Processing resources · `atlas-streams-teardown` — Delete Stream Processing resources · `atlas-upgrade-cluster` — Upgrade a MongoDB Atlas cluster tier
- **MongoDB Atlas Local Tools:** `atlas-local-connect-deployment` — Connect to Atlas Local deployment · `atlas-local-create-deployment` — Create Atlas local deployment · `atlas-local-delete-deployment` — Delete Atlas local deployment · `atlas-local-list-deployments` — List Atlas local deployments
- **MongoDB Assistant Tools:** `list-knowledge-sources` — List available data sources in knowledge base · `search-knowledge` — Search MongoDB Assistant knowledge base

**Seguridad, en las palabras de MongoDB:** el flag `--readOnly` (env `MDB_MCP_READ_ONLY`), *"cuando se pone en true, solo permite operaciones de lectura, conexión y metadata, deshabilitando las operaciones de create/update/delete"*. MongoDB aconseja *"asignar solo los permisos mínimos requeridos a tu service account"*, y *"recomienda fuertemente usar variables de entorno para pasar la configuración sensible"* porque *"los argumentos de línea de comandos pueden quedar visibles en las listas de procesos y logueados en varias ubicaciones del sistema"*. Este manifest activa `--readOnly` por defecto y pasa el connection string vía env — igual que los ejemplos de safe-default del propio README. Sacá `--readOnly` solo cuando deliberadamente necesites tools destructivas como `delete-many`, `drop-collection` o `drop-database`, y revisá y autorizá siempre las acciones antes de que corran.

Terminal Sync mantiene el connection string en Keychain vía `apiKeyHelper`, sincronizado cifrado con AES-256-GCM entre máquinas.

Licencia: Apache-2.0. Fuente: github.com/mongodb-js/mongodb-mcp-server.
