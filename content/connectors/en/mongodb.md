---
name: MongoDB
logo: /connectors/mongodb.svg
category: dev
status: available
simpleTitle: "Ask — and act on — your MongoDB in plain language"
simpleSubtitle: "Official MongoDB server: query your databases and manage Atlas without a shell."
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
tagline: "Your MongoDB, within reach of the agent"
originalAuthor: "MongoDB"
originalAuthorUrl: "https://github.com/mongodb-js/mongodb-mcp-server"
license: "Apache-2.0"
licenseUrl: "https://github.com/mongodb-js/mongodb-mcp-server/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**MongoDB** is the document database behind countless apps — data stored as flexible JSON-like documents instead of rows and tables. The official connector, published by MongoDB, is *"a Model Context Protocol server for interacting with MongoDB Databases and MongoDB Atlas."* It's the bridge between what you ask and your data: it translates your requests into the queries and Atlas API calls needed to explore collections, run aggregations, and inspect your clusters.

Ask *"list every database on this connection and how many documents each collection holds"* and it reads your instance and answers. Say *"show me the schema of the orders collection"* and it describes the fields for you — no shell, no hand-written queries. It talks to MongoDB with your connection string, so it can reach whatever that connection is allowed to reach.

### What you can ask

- *"List all the databases on this connection, and the collections inside the 'shop' database."*
- *"Describe the schema of the 'orders' collection, then find the 10 most recent orders."*
- *"Run an aggregation on 'sales' that groups revenue by month for this year."*
- *"List my Atlas clusters and inspect the metadata of the production one."*

### What token you need

You need a **MongoDB connection string** — the single line that tells software how to reach your database, including its host and credentials. It looks like `mongodb+srv://username:password@cluster.mongodb.net/myDatabase` (or `mongodb://localhost:27017/myDatabase` for a local instance).

1. In [MongoDB Atlas](https://cloud.mongodb.com), open your cluster and click **Connect**, then choose a connection method to reveal the string; the [connection string reference](https://www.mongodb.com/docs/manual/reference/connection-string/) explains the format.
2. Copy the full string — it already embeds the database username and password.
3. Paste it when the Lab asks for `MONGODB_CONNECTION_STRING`. It's stored encrypted in your Keychain.

The connection string contains database credentials, so treat it like a password. **A word of caution, straight from MongoDB:** the connection string *"might contain credentials which can be visible in process lists"* — MongoDB *"strongly recommend[s] using environment variables to pass sensitive configuration,"* which is exactly how this manifest injects it. This connector ships with `--readOnly` on by default, which — in MongoDB's words — *"only allows read, connect, and metadata operation types, disabling create/update/delete operations."* Leave it on unless you deliberately need to write, and grant the connection only the minimum permissions it needs.

--- dev ---

`mongodb-mcp-server` (MongoDB, official — repo `mongodb-js/mongodb-mcp-server`) is *"a Model Context Protocol server for interacting with MongoDB Databases and MongoDB Atlas,"* run via `npx -y mongodb-mcp-server@latest [options]`. Auth is your MongoDB connection string, passed via the `MDB_MCP_CONNECTION_STRING` env var (CLI equivalent `--connectionString`); the manifest here injects it from Keychain as `${SECRET:MONGODB_CONNECTION_STRING}`. Atlas-management tools additionally use Atlas API service-account credentials (`MDB_MCP_API_CLIENT_ID` / `MDB_MCP_API_CLIENT_SECRET`), which you can add if you need them — see MongoDB's [Service Accounts overview](https://www.mongodb.com/docs/atlas/api/service-accounts-overview/). Requires **Node.js at least v22.13.0** (Node 20.x support is deprecated).

Tools exposed to the client (verbatim from the README):

- **MongoDB Database Tools:** `aggregate` — Run an aggregation against a MongoDB collection · `aggregate-db` — Run an aggregation against a MongoDB database · `collection-indexes` — Describe the indexes for a collection · `collection-schema` — Describe the schema for a collection · `collection-storage-size` — Gets the size of the collection · `connect` — Connect to a MongoDB instance · `count` — Gets the number of documents in a collection · `create-collection` — Creates a new collection in a database · `create-index` — Create an index for a collection · `db-stats` — Returns statistics reflecting database use state · `delete-many` — Removes all documents matching a filter · `drop-collection` — Removes a collection or view · `drop-database` — Removes the specified database · `drop-index` — Drop an index for a collection · `explain` — Returns statistics describing query execution · `export` — Export query/aggregation results in EJSON format · `find` — Run a find query against a collection · `insert-many` — Insert an array of documents · `list-collections` — List all collections for a database · `list-databases` — List all databases for a connection · `mongodb-logs` — Returns most recent logged mongod events · `rename-collection` — Renames a collection · `switch-connection` — Switch to a different MongoDB connection · `update-many` — Updates all documents matching a filter
- **MongoDB Atlas Tools:** `atlas-connect-cluster` — Connect to MongoDB Atlas cluster · `atlas-create-access-list` — Allow IP/CIDR ranges to access clusters · `atlas-create-cluster` — Create a MongoDB Atlas cluster (M10–M80) · `atlas-create-db-user` — Create a MongoDB Atlas database user · `atlas-create-free-cluster` — Create a free MongoDB Atlas cluster · `atlas-create-project` — Create a MongoDB Atlas project · `atlas-get-performance-advisor` — Get performance recommendations · `atlas-inspect-access-list` — Inspect IP/CIDR ranges with access · `atlas-inspect-cluster` — Inspect metadata of an Atlas cluster · `atlas-list-alerts` — List triggered alerts for a project · `atlas-list-clusters` — List MongoDB Atlas clusters · `atlas-list-db-users` — List MongoDB Atlas database users · `atlas-list-orgs` — List MongoDB Atlas organizations · `atlas-list-projects` — List MongoDB Atlas projects · `atlas-load-sample-dataset` — Load a sample dataset into a cluster · `atlas-pause-resume-cluster` — Pause or resume a cluster · `atlas-streams-build` — Create Atlas Stream Processing resources · `atlas-streams-discover` — Discover and inspect Stream Processing resources · `atlas-streams-manage` — Manage Stream Processing resources · `atlas-streams-teardown` — Delete Stream Processing resources · `atlas-upgrade-cluster` — Upgrade a MongoDB Atlas cluster tier
- **MongoDB Atlas Local Tools:** `atlas-local-connect-deployment` — Connect to Atlas Local deployment · `atlas-local-create-deployment` — Create Atlas local deployment · `atlas-local-delete-deployment` — Delete Atlas local deployment · `atlas-local-list-deployments` — List Atlas local deployments
- **MongoDB Assistant Tools:** `list-knowledge-sources` — List available data sources in knowledge base · `search-knowledge` — Search MongoDB Assistant knowledge base

**Security, in MongoDB's own words:** the `--readOnly` flag (env `MDB_MCP_READ_ONLY`), *"when set to true, only allows read, connect, and metadata operation types, disabling create/update/delete operations."* MongoDB advises you *"assign only the minimum required permissions to your service account,"* and *"strongly recommend[s] using environment variables to pass sensitive configuration"* because *"command line arguments can be visible in process lists and logged in various system locations."* This manifest enables `--readOnly` by default and passes the connection string via env — matching the README's own safe-default examples. Drop `--readOnly` only when you deliberately need destructive tools like `delete-many`, `drop-collection`, or `drop-database`, and always review and authorize actions before they run.

Terminal Sync keeps the connection string in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: Apache-2.0. Source: github.com/mongodb-js/mongodb-mcp-server.
