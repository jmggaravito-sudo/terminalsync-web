---
name: Pinecone
logo: /connectors/pinecone.svg
category: dev
status: available
simpleTitle: "Preguntale — y actuá — sobre tu base de datos vectorial de Pinecone en lenguaje natural"
simpleSubtitle: "Server oficial de Pinecone: buscá en la doc, configurá índices, subí y consultá datos."
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
tagline: "Tu base de datos vectorial, al alcance del agente"
originalAuthor: "Pinecone"
originalAuthorUrl: "https://github.com/pinecone-io/pinecone-mcp"
license: "Apache-2.0"
licenseUrl: "https://github.com/pinecone-io/pinecone-mcp/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Pinecone** es una base de datos vectorial — la capa de almacenamiento que hace posible la búsqueda semántica y el retrieval para apps de IA, guardando tus datos como embeddings para que un asistente encuentre registros por significado y no por palabras exactas. El conector oficial, publicado por Pinecone, es el *Pinecone Developer MCP Server*: deja que los asistentes de código y otras herramientas de IA se conecten con tus proyectos de Pinecone y con la documentación. Una vez conectado, la IA puede buscar en la doc de Pinecone para responder con precisión, ayudarte a configurar índices según lo que tu aplicación necesita, generar código a partir de la configuración y los datos de tu índice, y subir y buscar registros para que pruebes consultas y evalúes resultados en tu propio entorno de desarrollo.

Le pedís *"listá todos mis índices de Pinecone y describí sus configuraciones"* y lee tu proyecto y te responde. Le decís *"creá un índice nuevo llamado 'my-docs' usando el modelo multilingual-e5-large"* y lo arma solo. Habla con Pinecone usando tu clave de API, así que puede hacer todo lo que vos podés hacer desde tu propia cuenta. Ojo: sin clave de API la IA igual puede buscar en la documentación — lo que no puede es administrar ni consultar tus índices.

### Qué le podés pedir

- *"Buscá en la doc de Pinecone información sobre filtrado por metadata."*
- *"Listá todos mis índices de Pinecone y describí sus configuraciones."*
- *"Creá un índice nuevo llamado 'my-docs' usando el modelo multilingual-e5-large."*
- *"Subí estos documentos a mi índice: [pegá tus documentos]."*
- *"Buscá en mi índice los registros relacionados con 'authentication best practices'."*
- *"¿Qué namespaces existen en mi índice y cuántos registros hay en cada uno?"*

### Qué token necesitás

Necesitás una **clave de API de Pinecone** — la que permite que un software actúe sobre tu proyecto de Pinecone.

1. Entrá a la [consola de Pinecone](https://app.pinecone.io) y generá una clave de API.
2. Copiala.
3. Pegala cuando el Lab te pida `PINECONE_API_KEY`. Se guarda cifrada en tu Keychain.

La clave de API puede crear, cambiar y consultar índices y datos reales, así que tratala como una contraseña. **Una aclaración honesta:** sin clave de API el server igual sirve para buscar en la documentación, pero no va a poder administrar ni consultar tus índices. El server además **solo soporta índices con integrated inference** — mirá la limitación más abajo.

--- dev ---

`@pinecone-database/mcp` (Pinecone, oficial — repo `pinecone-io/pinecone-mcp`) es el **Pinecone Developer MCP Server**, corre con `npx -y @pinecone-database/mcp`. La auth es una clave de API de Pinecone generada en la [consola](https://app.pinecone.io) y pasada por la variable de entorno `PINECONE_API_KEY`; el manifest de acá la inyecta desde Keychain como `${SECRET:PINECONE_API_KEY}`. Requiere Node.js v18 o superior, con `node` y `npx` en tu `PATH`. Este server está enfocado en desarrolladores que trabajan con Pinecone como parte de su stack y está pensado para usarse con asistentes de código. Sin clave de API la IA igual puede buscar documentación, pero no puede administrar ni consultar índices.

Tools expuestas al cliente (verbatim del README):

- `search-docs`: Search the official Pinecone documentation.
- `list-indexes`: Lists all Pinecone indexes.
- `describe-index`: Describes the configuration of an index.
- `describe-index-stats`: Provides statistics about the data in the index, including the number of records and available namespaces.
- `create-index-for-model`: Creates a new index that uses an integrated inference model to embed text as vectors.
- `upsert-records`: Inserts or updates records in an index with integrated inference.
- `search-records`: Searches for records in an index based on a text query, using integrated inference for embedding. Has options for metadata filtering and reranking.
- `cascading-search`: Searches for records across multiple indexes, deduplicating and reranking the results.
- `rerank-documents`: Reranks a collection of records or text documents using a specialized reranking model.

**Limitación, directo de Pinecone:** *solo se soportan índices con integrated inference.* Los Assistants, los índices sin integrated inference, los embeddings standalone y la vector search no están soportados. Si estás tratando de usar un índice serverless sin integrated inference, vas a tener que crear un índice nuevo con un modelo de embedding. Pinecone además ofrece un [Assistant MCP](https://github.com/pinecone-io/assistant-mcp) aparte, diseñado para darle a los asistentes de IA contexto relevante sacado de tu base de conocimiento — ese es un server distinto de este de desarrollo.

Terminal Sync mantiene la clave de API en Keychain vía `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: Apache-2.0. Fuente: github.com/pinecone-io/pinecone-mcp.
