---
name: MCP Builder
logo: /skills/mcp-builder.svg
category: dev
vendors: ["claude", "codex"]
author: "Anthropic"
status: available
tagline: "Diseñá y endurecé MCP servers"
description: "Guía el diseño, implementación, testing y hardening de un MCP server, con chequeos explícitos antes de llamarlo production-ready."
license: "MIT"
marketplaceSource: "anthropic"
compatibleWith: ["claude", "codex", "gemini"]
---
## Cuándo usarlo

- Querés exponer una API externa, herramienta interna, base de datos o workflow a un cliente de IA mediante MCP.
- Necesitás decidir qué tools exponer, qué schemas aceptan y cómo mantener la interfaz chica y segura.
- Tenés un MCP server prototipo y querés agregar validación, manejo de errores, tests, límites de autenticación y notas operativas.
- Querés una ruta de construcción estructurada sin fingir que el código generado queda automáticamente production-ready.

No lo uses para saltear documentación del vendor, evitar reglas de autenticación, exponer secretos o shippear tools sin tests. El skill puede ayudar a producir código con mentalidad de producción, pero sólo debe llamar a un server "production-ready" cuando existan tests, revisión de seguridad, manejo realista de errores y evidencia de deploy/runbook.

## Qué hace

Guía la construcción de un MCP por:

- **Diseño de scope**: define trabajos del usuario, set mínimo de tools, naming, schemas, paginación y límites read/write.
- **Plan de implementación**: sugiere estructura TypeScript o Python, uso del MCP SDK, inputs tipados, configuración de entorno y layout de archivos claro.
- **Revisión de seguridad**: chequea modelo de auth, manejo de secretos, least privilege, validación de inputs, rate limits, retries, idempotencia y operaciones de escritura peligrosas.
- **Plan de tests**: cubre happy path, argumentos inválidos, respuestas vacías, errores de API, paginación, falla de auth, rate limits y confirmación para acciones destructivas.
- **Readiness operativa**: documenta instalación, env vars, logging, versionado, rollback y limitaciones conocidas.

Baja o matiza claims cuando falta evidencia. "Production-grade" requiere prueba: tests pasando, auth/permisos auditados, modos de falla documentados y una ruta de deploy que el usuario pueda ejecutar.

## Cómo usarlo

1. Describí la API o herramienta que querés exponer, el cliente de IA, lenguaje preferido y si las tools son read-only o pueden escribir datos.
2. Pasá docs de API, requisitos de auth, requests/responses de ejemplo, rate limits y restricciones de compliance o sensibilidad de datos.
3. Pedí diseño antes de código: tools, schemas, límites, lista de riesgos y plan de tests.
4. Generá el server incrementalmente. Después de cada tool, corré los tests sugeridos y arreglá fallas antes de sumar más tools.
5. Antes de publicar, pedí revisión de readiness: seguridad, permisos, tests, logs, docs, pasos de instalación y caveats.

## Ideal para

Devs y equipos técnicos que construyen MCP servers internos o de nicho donde importan corrección y seguridad. Funciona mejor con docs de API y datos de ejemplo; es más débil cuando la API externa no está documentada, faltan credenciales o el usuario quiere acceso amplio de escritura sin proceso de revisión.
