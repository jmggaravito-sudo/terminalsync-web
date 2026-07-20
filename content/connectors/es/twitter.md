---
name: X (Twitter)
logo: /connectors/twitter.svg
category: messaging
status: available
simpleTitle: "Publicá y escuchá en X, desde el chat"
simpleSubtitle: "\"Publicá este anuncio\" \"¿Qué dicen de nosotros?\" — tu IA publica en X y lo busca por vos."
devTitle: "Conector MCP de X (Twitter)"
devSubtitle: "MCP sobre la X API v2 oficial — publicar tweets, buscar tweets recientes."
ctaUrl: "https://x.com"
tokenHelpUrl: "https://developer.twitter.com/en/portal/dashboard"
manifest:
  mcpServers:
    twitter:
      command: npx
      args: ["-y", "@enescinar/twitter-mcp"]
      env:
        API_KEY: "${SECRET:TWITTER_API_KEY}"
        API_SECRET_KEY: "${SECRET:TWITTER_API_SECRET_KEY}"
        ACCESS_TOKEN: "${SECRET:TWITTER_ACCESS_TOKEN}"
        ACCESS_TOKEN_SECRET: "${SECRET:TWITTER_ACCESS_TOKEN_SECRET}"
affiliate: false
tagline: "Publicá y escuchá en X"
originalAuthor: "Enes Cinar"
originalAuthorUrl: "https://github.com/EnesCinr/twitter-mcp"
license: "MIT"
licenseUrl: "https://github.com/EnesCinr/twitter-mcp/blob/main/LICENSE"
---
Mantener presencia en **X** come tiempo que no tenés. Este conector deja que tu IA publique por vos y escuche lo que se dice — desde el mismo chat donde manejás todo lo demás, así un anuncio rápido o un "¿qué dicen de nosotros?" no significa abrir otra app más.

Decile *"publicá: ya lanzamos envío en el día en la ciudad 🚚"* y lo publica. Preguntale *"¿qué dicen de nuestra marca esta semana?"* y busca tweets recientes y te resume. Publicar es público y no se puede deshacer, así que la IA te muestra el texto antes de que salga.

### Qué le podés pedir

- *"Publicá esto: 'Nuevo horario de invierno — abierto hasta las 21 toda la semana.'"*
- *"Buscá tweets recientes que mencionen mi local y decime el clima general."*
- *"Armá tres posts cortos anunciando la liquidación del finde — yo elijo cuál publicar."*

### Qué necesitás

X se conecta con las **claves de desarrollador** de tu propia cuenta de X:

1. Entrá al [Portal de Desarrolladores de X](https://developer.twitter.com/en/portal/dashboard), creá una app y generá las cuatro credenciales: API Key, API Secret Key, Access Token, Access Token Secret.
2. Asegurate de que la app tenga permiso de **Lectura y Escritura** (para que pueda publicar, no solo leer).
3. Pegá cada una cuando el Lab te pida `TWITTER_API_KEY`, `TWITTER_API_SECRET_KEY`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`.

Las cuatro quedan guardadas cifradas en tu Keychain y sincronizadas entre tus máquinas.

> Aviso: publicar es público e irreversible — la IA te muestra el texto y publica solo cuando confirmás.

--- dev ---

`@enescinar/twitter-mcp` (Enes Cinar) habla la X (Twitter) API v2 oficial. Tools verificadas contra el README: `post_tweet` (publica un tweet) y `search_tweets` (busca tweets recientes, devuelve texto + métricas de engagement).

La auth es OAuth 1.0a user context — cuatro env vars: `API_KEY`, `API_SECRET_KEY`, `ACCESS_TOKEN`, `ACCESS_TOKEN_SECRET` del Portal de Desarrolladores de X (la app necesita Lectura+Escritura para publicar). Terminal Sync las mapea desde secretos `TWITTER_*` en tu Keychain.

Terminal Sync guarda las claves en tu Keychain, sincronizadas cifradas entre máquinas con AES-256-GCM. Como `post_tweet` es público e irreversible, el escritorio lo pasa por un paso de confirmación.

Licencia: MIT. Fuente: github.com/EnesCinr/twitter-mcp.
