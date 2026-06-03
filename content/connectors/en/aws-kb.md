---
name: AWS Knowledge Base
logo: /connectors/aws-kb.svg
category: dev
status: available
simpleTitle: "Query your AWS Bedrock knowledge base"
simpleSubtitle: "Retrieve docs from your private RAG store directly through the AI."
devTitle: "AWS KB Retrieval MCP"
devSubtitle: "Bedrock Knowledge Bases retrieval API."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/aws-kb-retrieval-server"
affiliate: false
tagline: "Private RAG via AWS Bedrock"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
For teams using AWS Bedrock Knowledge Bases (managed RAG): this connector queries your knowledge bases directly from the chat without writing AWS code.

Requires AWS credentials with permissions on the target KBs.

--- dev ---

`@modelcontextprotocol/server-aws-kb-retrieval-server` requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`. Operation: `retrieve_from_aws_kb`. License: MIT.
