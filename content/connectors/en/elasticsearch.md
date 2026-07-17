---
name: Elasticsearch
logo: /connectors/elasticsearch.svg
category: dev
status: available
simpleTitle: "Ask questions over your Elasticsearch data in plain language"
simpleSubtitle: "Official Elastic server: search your indices in natural language."
devTitle: "Elasticsearch MCP Connector"
devSubtitle: "Official @elastic/mcp-server-elasticsearch: tools over your Elasticsearch cluster, API-key scoped."
ctaUrl: "https://www.elastic.co"
tokenHelpUrl: "https://www.elastic.co/guide/en/kibana/current/api-keys.html"
manifest:
  mcpServers:
    elasticsearch:
      command: npx
      args: ["-y", "@elastic/mcp-server-elasticsearch"]
      env:
        ES_URL: "${SECRET:ES_URL}"
        ES_API_KEY: "${SECRET:ES_API_KEY}"
affiliate: false
tagline: "Your search cluster, in plain language"
originalAuthor: "Elastic"
originalAuthorUrl: "https://github.com/elastic/mcp-server-elasticsearch"
license: "Apache-2.0"
licenseUrl: "https://github.com/elastic/mcp-server-elasticsearch/blob/main/LICENSE"
---
**Elasticsearch** is the search and analytics engine where a lot of teams keep their logs, product catalogs, orders and events. The official connector, published by Elastic, connects the agent to your Elasticsearch data using the Model Context Protocol so you can — in the README's words — *"interact with your Elasticsearch indices through natural language conversations."*

The agent can see which indices you have, look at how a given index is structured, and run searches across your data — then read the results back to you in plain language. A heads-up worth being clear about: Elastic states that this repository *"contains experimental features intended for research and evaluation and are not production-ready."* Treat it as an evaluation tool, not something to point at a critical production system.

### What you can ask

- *"What indices do I have in my Elasticsearch cluster?"*
- *"Show me the field mappings for the 'products' index."*
- *"Find all orders over $500 from last month."*

### What token you need

This connector needs two things: the **URL** of your Elasticsearch instance, and a way to authenticate. Elastic notes you must provide **either** an API key **or** a username and password — this connector uses an **API key**.

- `ES_URL` — your Elasticsearch instance URL (required). This is the address where your cluster lives.
- `ES_API_KEY` — an Elasticsearch API key that lets the agent authenticate (required for this setup).

To create an API key:

1. Open **Kibana** and go to **Stack Management → Security → API keys** (see [Elastic's API keys guide](https://www.elastic.co/guide/en/kibana/current/api-keys.html)).
2. Click **Create API key**, give it a name, and — following Elastic's own security advice — grant it only the permissions the agent needs (read plus view metadata on the specific indices), not cluster-admin.
3. Copy the key value and paste it when the Lab asks for `ES_API_KEY`, and paste your cluster address into `ES_URL`. Both are stored encrypted in your Keychain.

Elastic warns against cluster-admin privileges: create a dedicated key with limited scope and apply access control at the index level, so the agent only ever sees the data you meant it to.

--- dev ---

`@elastic/mcp-server-elasticsearch` (Elastic, official — repo `elastic/mcp-server-elasticsearch`) runs via `npx -y @elastic/mcp-server-elasticsearch`. The README is explicit that this is experimental: *"This repository contains experimental features intended for research and evaluation and are not production-ready."* Not for production clusters.

Configuration is entirely via env vars. `ES_URL` (required) is the instance URL. Authentication requires **either** `ES_API_KEY` **or** both `ES_USERNAME` + `ES_PASSWORD` — the manifest here uses `ES_API_KEY` so the secret stays in Keychain. Other optional env vars documented by the README: `ES_CA_CERT` (path to a custom CA cert for SSL/TLS), `ES_SSL_SKIP_VERIFY` (`1`/`true` to skip cert verification), `ES_PATH_PREFIX` (for instances behind a non-root path), and `ES_VERSION` (defaults to assuming Elasticsearch 9.x; set to `8` to target 8.x).

Tools exposed (verbatim from the README):

- `list_indices` — list all available Elasticsearch indices
- `get_mappings` — get field mappings for a specific Elasticsearch index
- `search` — perform an Elasticsearch search with the provided query DSL (supports highlighting, query profiling, and query explanation)
- `get_shards` — get shard information for all or specific indices

Security: the README warns to *"avoid using cluster-admin privileges"* — create a dedicated API key with `cluster: ["monitor"]` and per-index `read` + `view_index_metadata` privileges via `POST /_security/api_key`, scoped to the exact index names or patterns the agent should touch.

Terminal Sync keeps `ES_URL` and `ES_API_KEY` in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: Apache-2.0. Source: github.com/elastic/mcp-server-elasticsearch.
