---
name: Map
logo: /connectors/map.svg
category: productivity
status: available
simpleTitle: "Show places on a 3D globe"
simpleSubtitle: "Search for addresses or landmarks and let the agent open an interactive map view."
devTitle: "Map MCP Connector"
devSubtitle: "Official @modelcontextprotocol MCP App server: CesiumJS globe, OpenStreetMap tiles and Nominatim geocoding."
ctaUrl: "https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/map-server"
manifest:
  mcpServers:
    map:
      command: npx
      args: ["-y", "--silent", "--registry=https://registry.npmjs.org/", "@modelcontextprotocol/server-map", "--stdio"]
affiliate: false
tagline: "Geocoding and interactive maps for the agent"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-map"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/ext-apps/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Map** is an interactive globe connector for looking up places and showing them visually. The official `@modelcontextprotocol` server uses CesiumJS with OpenStreetMap tiles and OpenStreetMap Nominatim geocoding, so it does not need a commercial map API key.

What it does: your AI can search for a place by name or address, get coordinates and bounding boxes, then open a 3D globe centered on that result. The README calls out *"3D Globe Rendering"*, *"Geocoding"* and *"OpenStreetMap Tiles"* as the main features.

### What you can ask

- *"Find the Eiffel Tower and show it on the map."*
- *"Search for this customer address and tell me the coordinates you found."*
- *"Open a map around central London so we can discuss nearby locations."*

### What configuration you need

You do not need a token. The connector runs locally with `npx`, uses OpenStreetMap Nominatim for place search and loads CesiumJS from a CDN at runtime.

1. Install it from the Lab like any connector without secrets.
2. Use it for reasonable place lookups and visual orientation.
3. Avoid bulk geocoding: the README notes Nominatim rate limiting at one request per second.

This is a visual helper, not a routing or private-location system. Do not use it as the only source for safety-critical navigation decisions.

--- dev ---

`@modelcontextprotocol/server-map` is an official package under the `@modelcontextprotocol` scope, published by `ochafik-ant <ochafik@anthropic.com>` with Anthropic/modelcontextprotocol maintainers. Verified package: `@modelcontextprotocol/server-map@1.7.4`, dist-tag `latest` only, license MIT, repository `modelcontextprotocol/ext-apps`, directory `examples/map-server`.

Verified manifest from the package README: `npx -y --silent --registry=https://registry.npmjs.org/ @modelcontextprotocol/server-map --stdio`; no secrets required.

Tools verified against the official README: `geocode` and `show-map`. `geocode` queries OpenStreetMap Nominatim and returns up to five matches with lat/lon coordinates and bounding boxes. `show-map` renders the CesiumJS globe at a supplied bounding box and defaults to London if no coordinates are provided.

Architecture notes from the README: the server configures CSP for OSM tiles and Cesium CDN, the app dynamically loads CesiumJS, receives tool inputs through the MCP App SDK and handles camera navigation. Nominatim requests are rate-limited to one request per second per its usage policy.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-map` on npm, plus `modelcontextprotocol/ext-apps` `examples/map-server`.
