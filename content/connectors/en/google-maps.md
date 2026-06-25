---
name: Google Maps
logo: /connectors/google-maps.svg
category: research
status: available
simpleTitle: "Let your AI understand addresses, places and routes"
simpleSubtitle: "Convert addresses, find nearby places and calculate distances without opening Maps by hand."
devTitle: "Google Maps MCP Connector"
devSubtitle: "Official @modelcontextprotocol server: geocoding, places, distance matrix, elevation and directions."
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
tagline: "Places and routes from your AI"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-google-maps"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-google-maps"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
**Google Maps** is Google's mapping platform: addresses, places, routes, travel times and location data. Many teams use it for logistics, area research, travel and customer support.

This connector lets your AI query Google Maps Platform: it can turn an address into coordinates, turn coordinates into an address, search for places, fetch place details, calculate distances, inspect elevation and request step-by-step directions.

### What you can ask

- *"Find coffee shops near this address and give me the name, location and contact details if available."*
- *"Calculate how long a courier would take from these three points to the main store."*
- *"Convert this list of addresses into coordinates so I can review them on a map."*

### What token you need

You need a **Google Maps Platform API key**. The official README links to Google's guide for creating API keys.

1. Open the official guide: `https://developers.google.com/maps/documentation/javascript/get-api-key#create-api-keys`.
2. Create or choose a Google Cloud project with billing enabled.
3. Create an API key and restrict it to the Maps APIs you plan to use.
4. Review quotas and costs: Google Maps Platform charges by API and usage volume.
5. Paste the key when the Lab asks for `GOOGLE_MAPS_API_KEY`. Terminal Sync stores it encrypted in your Keychain.

If the connector will only be used for lookup and research, do not grant more access than needed: restricting the API key helps avoid accidental spend or usage.

--- dev ---

`@modelcontextprotocol/server-google-maps` is an official package published by `Anthropic, PBC` under the `@modelcontextprotocol` scope. Verified manifest: `npx -y @modelcontextprotocol/server-google-maps` with `GOOGLE_MAPS_API_KEY` in `env`.

Tools verified against the README and npm bundle: `maps_geocode`, `maps_reverse_geocode`, `maps_search_places`, `maps_place_details`, `maps_distance_matrix`, `maps_elevation`, `maps_directions`. Note: the README lists conceptual names without the prefix (`geocode`, `reverse_geocode`, etc.), but the published bundle registers tools with the `maps_` prefix.

The official README documents key inputs: `address`; `latitude`/`longitude`; `query` with `location` and `radius`; `place_id`; `origins`/`destinations` with mode `driving`, `walking`, `bicycling` or `transit`; and `origin`/`destination` for directions.

Terminal Sync keeps `GOOGLE_MAPS_API_KEY` in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-google-maps` on npm.
