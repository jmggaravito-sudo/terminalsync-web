---
name: Pinecone
logo: /connectors/pinecone.svg
category: dev
status: available
simpleTitle: "Ask — and act on — your Pinecone vector database in plain language"
simpleSubtitle: "Official Pinecone server: search the docs, configure indexes, upsert and query data."
devTitle: "Pinecone MCP Connector"
devSubtitle: "Official @pinecone-database/mcp: developer tools over Pinecone projects and docs, API-key scoped."
ctaUrl: "https://www.pinecone.io"
tokenHelpUrl: "https://app.pinecone.io"
manifest:
  mcpServers:
    pinecone:
      command: npx
      args: ["-y", "@pinecone-database/mcp"]
      env:
        PINECONE_API_KEY: "${SECRET:PINECONE_API_KEY}"
affiliate: false
tagline: "Your vector database, within reach of the agent"
originalAuthor: "Pinecone"
originalAuthorUrl: "https://github.com/pinecone-io/pinecone-mcp"
license: "Apache-2.0"
licenseUrl: "https://github.com/pinecone-io/pinecone-mcp/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Pinecone** is a vector database — the storage layer that powers semantic search and retrieval for AI apps, holding your data as embeddings so an assistant can find records by meaning rather than exact keywords. The official connector, published by Pinecone, is the *Pinecone Developer MCP Server*: it lets coding assistants and other AI tools connect to your Pinecone projects and documentation. Once connected, the AI can search the Pinecone docs to answer questions accurately, help you configure indexes based on your application's needs, generate code informed by your index configuration and data, and upsert and search records so you can test queries and evaluate results right in your dev environment.

Ask *"list all my Pinecone indexes and describe their configurations"* and it reads your project and answers. Say *"create a new index called 'my-docs' using the multilingual-e5-large model"* and it sets it up. It talks to Pinecone with your API key, so it can do what you can do from your own account. Note: without an API key the AI can still search the documentation — it just can't manage or query your indexes.

### What you can ask

- *"Search the Pinecone docs for information about metadata filtering."*
- *"List all my Pinecone indexes and describe their configurations."*
- *"Create a new index called 'my-docs' using the multilingual-e5-large model."*
- *"Upsert these documents into my index: [paste your documents]."*
- *"Search my index for records related to 'authentication best practices'."*
- *"What namespaces exist in my index, and how many records are in each?"*

### What token you need

You need a **Pinecone API key** — the key that lets software act on your Pinecone project.

1. Sign in to the [Pinecone console](https://app.pinecone.io) and generate an API key.
2. Copy it.
3. Paste it when the Lab asks for `PINECONE_API_KEY`. It's stored encrypted in your Keychain.

The API key can create, change, and query real indexes and data, so treat it like a password. **A word of honesty:** without an API key the server still works for documentation search, but it won't be able to manage or query your indexes. The server also **only supports indexes with integrated inference** — see the limitation below.

--- dev ---

`@pinecone-database/mcp` (Pinecone, official — repo `pinecone-io/pinecone-mcp`) is the **Pinecone Developer MCP Server**, run via `npx -y @pinecone-database/mcp`. Auth is a Pinecone API key generated in the [console](https://app.pinecone.io) and passed via the `PINECONE_API_KEY` environment variable; the manifest here injects it from Keychain as `${SECRET:PINECONE_API_KEY}`. Requires Node.js v18 or later, with `node` and `npx` on your `PATH`. This server is focused on developers working with Pinecone as part of their stack and is intended for use with coding assistants. Without an API key the AI can still search documentation, but cannot manage or query indexes.

Tools exposed to the client (verbatim from the README):

- `search-docs`: Search the official Pinecone documentation.
- `list-indexes`: Lists all Pinecone indexes.
- `describe-index`: Describes the configuration of an index.
- `describe-index-stats`: Provides statistics about the data in the index, including the number of records and available namespaces.
- `create-index-for-model`: Creates a new index that uses an integrated inference model to embed text as vectors.
- `upsert-records`: Inserts or updates records in an index with integrated inference.
- `search-records`: Searches for records in an index based on a text query, using integrated inference for embedding. Has options for metadata filtering and reranking.
- `cascading-search`: Searches for records across multiple indexes, deduplicating and reranking the results.
- `rerank-documents`: Reranks a collection of records or text documents using a specialized reranking model.

**Limitation, straight from Pinecone:** *only indexes with integrated inference are supported.* Assistants, indexes without integrated inference, standalone embeddings, and vector search are not supported. If you're trying to use a serverless index without integrated inference, you'll need to create a new index with an embedding model. Pinecone also offers a separate [Assistant MCP](https://github.com/pinecone-io/assistant-mcp) designed to give AI assistants relevant context sourced from your knowledge base — that's a different server from this developer one.

Terminal Sync keeps the API key in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: Apache-2.0. Source: github.com/pinecone-io/pinecone-mcp.
