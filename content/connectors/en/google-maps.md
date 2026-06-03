---
name: Google Maps
logo: /connectors/google-maps.svg
category: research
status: available
simpleTitle: "Locations, distances and routes from your AI"
simpleSubtitle: "\"How far is X from Y\", \"find ramen restaurants near here\", \"give me the address\" — without leaving the chat."
devTitle: "Google Maps MCP"
devSubtitle: "Google Maps Platform API. Geocoding, places, directions, distance matrix."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps"
affiliate: false
tagline: "Geo and routes from your AI"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Useful for logistics, travel research, store-finder workflows. Your AI converts addresses to coordinates, finds nearby businesses, calculates route times.

Requires a Google Maps Platform API key (paid by usage).

--- dev ---

`@modelcontextprotocol/server-google-maps` requires `GOOGLE_MAPS_API_KEY`. Operations: `maps_geocode`, `maps_reverse_geocode`, `maps_search_places`, `maps_place_details`, `maps_distance_matrix`, `maps_elevation`, `maps_directions`.

License: MIT.
