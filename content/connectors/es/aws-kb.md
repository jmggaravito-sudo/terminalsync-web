---
name: AWS Knowledge Base
logo: /connectors/aws-kb.svg
category: dev
status: available
simpleTitle: "Consultá tu knowledge base de AWS Bedrock"
simpleSubtitle: "Recuperá docs de tu store RAG privado directamente desde la IA."
devTitle: "AWS KB Retrieval MCP"
devSubtitle: "API de retrieval de Bedrock Knowledge Bases."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/aws-kb-retrieval-server"
affiliate: false
tagline: "RAG privado vía AWS Bedrock"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Para equipos que usan AWS Bedrock Knowledge Bases (RAG managed): este conector consulta tus knowledge bases directamente desde el chat sin escribir código de AWS.

Requiere credenciales AWS con permisos sobre las KBs target.

--- dev ---

`@modelcontextprotocol/server-aws-kb-retrieval-server` requiere `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`. Operación: `retrieve_from_aws_kb`. Licencia: MIT.
