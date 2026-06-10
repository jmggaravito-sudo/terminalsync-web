---
name: MCP Builder
logo: /skills/mcp-builder.svg
category: dev
vendors: ["claude", "codex"]
author: "Anthropic"
status: available
tagline: "Construí MCP servers production-grade"
description: "Te guía paso a paso para diseñar, codear y testear un MCP server que conecta tu IA con una API externa."
license: "MIT"
marketplaceSource: "anthropic"
compatibleWith: ["claude", "codex", "gemini"]
---
## Cuándo usar

- Querés conectar tu IA a una API que todavía no tiene MCP.
- Tenés un MCP a medias y querés una forma estructurada de endurecerlo.
- Querés aprender cómo se escribe un MCP de calidad sin leer toda la spec.

## Qué hace

- Te guía el diseño: qué tools exponer, cómo nombrarlas, qué schemas aceptan.
- Genera código boilerplate (TS, Python, etc.) siguiendo best practices del equipo de Anthropic.
- Sugiere casos de test comunes: inputs vacíos, argumentos inválidos, rate limits.
- Revisa setup de autenticación y seguridad antes de declarar el MCP "listo".

## Cómo usar

1. Decile a tu IA: *"Quiero construir un MCP para la API de X usando `mcp-builder`"*.
2. Respondé preguntas sobre el objetivo del MCP.
3. Generás el código skeleton; iterás las tools una por una.
4. Corrés la suite de test que te sugiere; fixeás lo que aparezca.

## Mejor para

Solo devs construyendo MCPs para APIs nicho. Equipos que quieren un MCP interno para sus herramientas propietarias. Cualquiera aprendiendo a escribir MCPs production-grade.
