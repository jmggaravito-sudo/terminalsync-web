---
name: Google Maps
logo: /connectors/google-maps.svg
category: research
status: available
simpleTitle: "Ubicaciones, distancias y rutas desde tu IA"
simpleSubtitle: "\"¿A cuánto está X de Y?\", \"encontrame restaurantes de ramen cerca\", \"dame la dirección\" — sin salir del chat."
devTitle: "Google Maps MCP"
devSubtitle: "API de Google Maps Platform. Geocoding, places, directions, distance matrix."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps"
affiliate: false
tagline: "Geo y rutas desde tu IA"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Útil para logística, research de viajes, store-finder workflows. Tu IA convierte direcciones a coordenadas, encuentra negocios cercanos, calcula tiempos de ruta.

Requiere una API key de Google Maps Platform (pago por uso).

--- dev ---

`@modelcontextprotocol/server-google-maps` requiere `GOOGLE_MAPS_API_KEY`. Operaciones: `maps_geocode`, `maps_reverse_geocode`, `maps_search_places`, `maps_place_details`, `maps_distance_matrix`, `maps_elevation`, `maps_directions`.

Licencia: MIT.
