---
name: Map
logo: /connectors/map.svg
category: productivity
status: available
simpleTitle: "Mostrá lugares en un globo 3D"
simpleSubtitle: "Buscá direcciones o puntos de referencia y dejá que el agente abra una vista de mapa interactiva."
devTitle: "Conector MCP de Map"
devSubtitle: "Server MCP App oficial de @modelcontextprotocol: globo CesiumJS, mapas OpenStreetMap y geocoding con Nominatim."
ctaUrl: "https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/map-server"
manifest:
  mcpServers:
    map:
      command: npx
      args: ["-y", "--silent", "--registry=https://registry.npmjs.org/", "@modelcontextprotocol/server-map", "--stdio"]
affiliate: false
tagline: "Geocoding y mapas interactivos para el agente"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-map"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/ext-apps/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Map** es un conector de globo interactivo para buscar lugares y verlos visualmente. El server oficial de `@modelcontextprotocol` usa CesiumJS con mapas de OpenStreetMap y geocoding de OpenStreetMap Nominatim, así que no necesita una clave comercial de mapas.

Qué hace: tu IA puede buscar un lugar por nombre o dirección, obtener coordenadas y límites del área, y después abrir un globo 3D centrado en ese resultado. El README destaca *"3D Globe Rendering"*, *"Geocoding"* y *"OpenStreetMap Tiles"* como funciones principales.

### Qué le podés pedir

- *"Buscá la Torre Eiffel y mostrámela en el mapa."*
- *"Buscá esta dirección de cliente y decime qué coordenadas encontraste."*
- *"Abrí un mapa del centro de Londres para que podamos revisar ubicaciones cercanas."*

### Qué configuración necesitás

No necesitás token. El conector corre localmente con `npx`, usa OpenStreetMap Nominatim para buscar lugares y carga CesiumJS desde un CDN en tiempo de ejecución.

1. Instalalo desde el Lab como cualquier conector sin secretos.
2. Usalo para búsquedas razonables de lugares y orientación visual.
3. Evitá geocoding masivo: el README menciona un límite de Nominatim de una solicitud por segundo.

Es una ayuda visual, no un sistema de rutas o ubicación privada. No lo uses como única fuente para decisiones de navegación críticas.

--- dev ---

`@modelcontextprotocol/server-map` es un paquete oficial bajo el scope `@modelcontextprotocol`, publicado por `ochafik-ant <ochafik@anthropic.com>` con maintainers de Anthropic/modelcontextprotocol. Paquete verificado: `@modelcontextprotocol/server-map@1.7.4`, solo dist-tag `latest`, licencia MIT, repo `modelcontextprotocol/ext-apps`, directorio `examples/map-server`.

Manifest verificado desde el README del paquete: `npx -y --silent --registry=https://registry.npmjs.org/ @modelcontextprotocol/server-map --stdio`; no requiere secretos.

Tools verificadas contra el README oficial: `geocode` y `show-map`. `geocode` consulta OpenStreetMap Nominatim y devuelve hasta cinco coincidencias con coordenadas lat/lon y límites del área. `show-map` renderiza el globo CesiumJS en un bounding box recibido y usa Londres por defecto si no se pasan coordenadas.

Notas de arquitectura del README: el server configura CSP para tiles de OSM y el CDN de Cesium, la app carga CesiumJS dinámicamente, recibe inputs de tools mediante MCP App SDK y maneja la navegación de cámara. Las consultas a Nominatim tienen rate limit de una solicitud por segundo según su política de uso.

Licencia: MIT. Fuente: README y metadata del paquete `@modelcontextprotocol/server-map` en npm, más `modelcontextprotocol/ext-apps` `examples/map-server`.
