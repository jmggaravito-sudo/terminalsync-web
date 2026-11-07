---
name: beehiiv
logo: /connectors/beehiiv.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Trabaja tu newsletter de beehiiv desde el chat"
simpleSubtitle: "MCP oficial de beehiiv: prepara posts, mira tu audiencia y tus métricas con el login de tu cuenta de beehiiv, sin pegar ninguna API key."
devTitle: "beehiiv MCP Connector"
devSubtitle: "MCP oficial hospedado de beehiiv (mcp.beehiiv.com/mcp) — posts, audiencia, monetización y analytics por OAuth 2.1."
ctaUrl: "https://www.beehiiv.com"
tokenHelpUrl: "https://app.beehiiv.com/settings/workspace/mcp"
manifest:
  mcpServers:
    beehiiv:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.beehiiv.com/mcp"]
affiliate: false
tagline: "Tu newsletter y su audiencia, al alcance del agente"
originalAuthor: "beehiiv"
originalAuthorUrl: "https://github.com/beehiiv/agents"
license: "proprietary"
licenseUrl: "https://www.beehiiv.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-02T14:30:00.000Z"
verifiedPackageVersion: null
---
**beehiiv** es la plataforma de newsletters que usan publicaciones y creadores para escribir, crecer y ganar dinero con su audiencia. El server MCP oficial de beehiiv conecta a tu agente con tu workspace de beehiiv — el repo oficial lo presenta como *"Official beehiiv tools for AI agents, built on the beehiiv MCP server"* y aclara que *"Nothing runs on your machine"* — para que trabajes tu newsletter conversando, sin pegar ninguna API key en TerminalSync.

El agente **prepara y revisa; tú decides lo público**: la doc oficial es explícita en el punto más importante — *"Publishing and sending stay human actions in beehiiv, so the agent prepares the post and you press send"* — y lo mismo pasa con las automatizaciones: *"Activating an automation stays a human action in the editor."* Le pides *"Borrador de post sobre la novedad de esta semana, con estructura de newsletter"* y te deja el borrador listo. Le pides *"¿Cómo rindió el último post: aperturas, clicks y bajas?"* y te trae las métricas.

La superficie oficial, por área: **posts** (borrar, editar y duplicar posts y plantillas; leer contenido, stats, clicks, comentarios y engagement por suscriptor), **comunidades** (canales, posts fijados, moderación, miembros, invites), **podcasts** (shows, episodios, audio, transcripciones), **automatizaciones** (journeys, steps, triggers, emails, variantes A/B), **audiencia** (suscripciones, segmentos, tags, campos custom, listas y signup flows), **monetización** (productos, tiers, offers premium, órdenes, paywalls, red de anuncios y sponsors), **crecimiento** (recomendaciones, referidos, encuestas) y **analytics** (publicación, sitio, posts, ingresos).

### Qué le puedes pedir

- *"Borrador de post anunciando la novedad de esta semana, en tono de newsletter."*
- *"¿Cómo rindió mi último post: aperturas, clicks y bajas?"*
- *"Crea un segmento con los suscriptores que abrieron los últimos 3 posts."*
- *"Resume las respuestas de la última encuesta."*
- *"¿Qué posts traen más ingresos del ad network este mes?"*
- *"Busca en la documentación de beehiiv cómo funciona un paywall."*

El server además **se documenta solo**: la doc oficial dice que le pidas al agente llamar `search_documentation`, `read_documentation` o las tools `learn_*`, y trae la guía vigente de beehiiv en vez de adivinar.

Antes de cualquier cosa que cambie tu workspace — crear un post, un segmento, una automatización — tu agente te pide confirmación primero.

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. La doc oficial es textual: *"OAuth 2.1. There is no API key to copy and no secret to store in this repo."*

1. Activas el conector en TerminalSync.
2. El puente `mcp-remote` abre beehiiv en tu navegador — el cliente se registra solo (registro dinámico RFC 7591) y te lleva al login.
3. Inicias sesión y otorgas acceso: el agente recibe un token de acceso y uno de refresco con scope `read` y `write`. *"Every tool call is authorised against your own beehiiv permissions. The agent can only reach publications you can already reach."*

**Requisitos de la doc oficial:** una cuenta de beehiiv con un plan que incluya acceso MCP, y MCP habilitado para tu workspace en [Settings → Workspace → MCP](https://app.beehiiv.com/settings/workspace/mcp). Si MCP está apagado, las tools devuelven error de permisos. Algunos grupos de tools están gated aparte — *"the tools an agent sees depend on your plan and workspace settings."*

**Aclaración honesta:** es un server **hospedado por beehiiv** (`https://mcp.beehiiv.com/mcp`), no algo que corre en tu computadora. Lo que el agente puede ver o hacer queda acotado por tus propios permisos de beehiiv y por los ajustes del workspace.

--- dev ---

beehiiv publica un **server MCP remoto oficial** — el registro MCP lista `com.beehiiv/beehiiv`, y el repo del vendor es `github.com/beehiiv/agents` (org `beehiiv`, blog oficial `beehiiv.com`): *"This repository holds the plugin manifests for Claude Code, Grok Build, Gemini CLI, Cursor and Codex, plus the official MCP registry entry. They all point at the same hosted server at `https://mcp.beehiiv.com/mcp`."* El manifiesto compartido vive en `plugins/beehiiv/.mcp.json` y *"states the server URL once"*; los manifiestos por ecosistema delegan a ese archivo.

TerminalSync usa el puente `mcp-remote` para conectar tu equipo con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.beehiiv.com/mcp
```

Auth: **OAuth 2.1 con dynamic client registration RFC 7591 + PKCE** — sin API key y sin secret. Verificación propia 2026-11-02: `POST initialize` sin credenciales → **401**; `/.well-known/oauth-protected-resource` declara resource `https://mcp.beehiiv.com` con `authorization_servers: ["https://mcp.beehiiv.com"]` y scopes `read`/`write`/`openid`/`email`; `/.well-known/oauth-authorization-server` declara `issuer: "https://mcp.beehiiv.com"` (coincide con el PRM) y `registration_endpoint: https://mcp.beehiiv.com/register` → el registro dinámico de `mcp-remote` es viable, y el smoke de login llegó a la pantalla de autorización. Tokens: access + refresh, scopes `read` y `write`.

Superficie por grupos (verbatim del README oficial): **Posts** (*"Draft, edit and duplicate posts and post templates. Read post content, stats, clicks, comments and per-subscriber engagement"*), **Communities** (*"Create channels, publish and pin posts, moderate reports, manage members and roles, send invites and direct messages, read community metrics"*), **Podcasts** (*"Create shows and episodes, upload audio, schedule episodes, read transcripts and episode stats"*), **Automations** (*"Build journeys, steps, triggers and automation emails, including A/B variants"*), **Audience** (*"Manage subscriptions, segments, tags, custom fields, newsletter lists and signup flows"*), **Monetisation** (*"Products, tiers, premium offers, orders, paywalls, the ad network and the sponsor network"*), **Growth** (*"Recommendations, referral programs, polls and surveys"*), **Analytics** (*"Publication and website analytics, post and podcast stats, poll and survey responses, earnings"*). Self-documentation: `search_documentation`, `read_documentation`, `learn_*`.

Gates humanos documentados: publishing/sending de posts y activación de automatizaciones **quedan en el editor de beehiiv** — el agente prepara, el humano ejecuta. Skill-pack del plugin (media kits, reportes de performance, unsubscribe spikes, upgrade campaigns) se carga con el plugin en clientes con Agent Skills; los demás clientes reciben solo el MCP server. La doc no publica una lista plana de tools — la lista vigente depende del plan y del workspace (*"Some tool groups are gated separately"*).

Smoke 2026-11-02: `POST initialize` sin credenciales → 401 y metadata OAuth consistente (arriba); la corrida no completó el login con una cuenta real de beehiiv. Mercados: `["GLOBAL"]` — el README no declara restricciones de país; el requisito documentado es un plan con acceso MCP y MCP habilitado por workspace.

Licencia: SaaS propietario (términos de `beehiiv.com`); el repo `beehiiv/agents` publica solo manifiestos de plugins. Fuente: github.com/beehiiv/agents (README, leído verbatim 2026-11-02) + registro MCP `com.beehiiv/beehiiv`.
