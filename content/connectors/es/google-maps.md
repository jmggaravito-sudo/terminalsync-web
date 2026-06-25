---
name: Google Maps
logo: /connectors/google-maps.svg
category: research
status: available
simpleTitle: "Que tu IA entienda direcciones, lugares y rutas"
simpleSubtitle: "Convertí direcciones, encontrá lugares cercanos y calculá distancias sin abrir Maps a mano."
devTitle: "Google Maps MCP Connector"
devSubtitle: "Servidor oficial @modelcontextprotocol: geocoding, places, distance matrix, elevation y directions."
ctaUrl: "https://mapsplatform.google.com"
tokenHelpUrl: "https://developers.google.com/maps/documentation/javascript/get-api-key#create-api-keys"
manifest:
  mcpServers:
    google-maps:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-google-maps"]
      env:
        GOOGLE_MAPS_API_KEY: "${SECRET:GOOGLE_MAPS_API_KEY}"
affiliate: false
tagline: "Lugares y rutas desde tu IA"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-google-maps"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-google-maps"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Google Maps** es la plataforma de mapas de Google: direcciones, lugares, rutas, tiempos de viaje y datos de ubicación. Mucha gente la usa para logística, investigación de zonas, viajes y atención al cliente.

Este conector deja que tu IA consulte Google Maps Platform: puede convertir una dirección en coordenadas, convertir coordenadas en una dirección, buscar lugares, traer detalles de un lugar, calcular distancias, mirar elevación y pedir rutas paso a paso.

### Qué le podés pedir

- *"Buscá cafeterías cerca de esta dirección y pasame nombre, ubicación y datos de contacto si están disponibles."*
- *"Calculá cuánto tardaría un repartidor desde estos tres puntos hasta la tienda principal."*
- *"Convertí esta lista de direcciones en coordenadas para revisarlas en un mapa."*

### Qué token necesitás

Necesitás una **API key de Google Maps Platform**. El README oficial enlaza la guía de Google para crear claves de API.

1. Abrí la guía oficial: `https://developers.google.com/maps/documentation/javascript/get-api-key#create-api-keys`.
2. Creá o elegí un proyecto de Google Cloud con facturación habilitada.
3. Creá una API key y restringila a las APIs de Maps que vayas a usar.
4. Revisá cuotas y costos: Google Maps Platform cobra por uso según API y volumen.
5. Pegá la clave cuando el Lab te pida `GOOGLE_MAPS_API_KEY`. Terminal Sync la guarda cifrada en tu Keychain.

Si el conector solo se va a usar para lectura e investigación, no le des más acceso del necesario: restringir la API key ayuda a evitar gastos o usos accidentales.

--- dev ---

`@modelcontextprotocol/server-google-maps` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-google-maps` con `GOOGLE_MAPS_API_KEY` en `env`.

Tools verificadas contra README y bundle npm: `maps_geocode`, `maps_reverse_geocode`, `maps_search_places`, `maps_place_details`, `maps_distance_matrix`, `maps_elevation`, `maps_directions`. Nota: el README lista los nombres conceptuales sin prefijo (`geocode`, `reverse_geocode`, etc.), pero el bundle publicado registra tools con prefijo `maps_`.

El README oficial documenta inputs clave: `address`; `latitude`/`longitude`; `query` con `location` y `radius`; `place_id`; `origins`/`destinations` con modo `driving`, `walking`, `bicycling` o `transit`; y `origin`/`destination` para directions.

Terminal Sync guarda `GOOGLE_MAPS_API_KEY` en el Keychain via `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-google-maps` en npm.
