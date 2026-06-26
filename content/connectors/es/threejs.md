---
name: Three.js
logo: /connectors/threejs.svg
category: dev
status: available
simpleTitle: "Previsualizá escenas 3D con tu IA"
simpleSubtitle: "Dejá que el agente renderice e itere escenas chicas de Three.js en una vista interactiva."
devTitle: "Conector MCP de Three.js"
devSubtitle: "Server MCP App oficial de @modelcontextprotocol: renderer de escenas Three.js en streaming y ayuda de documentación."
ctaUrl: "https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/threejs-server"
manifest:
  mcpServers:
    threejs:
      command: npx
      args: ["-y", "--silent", "--registry=https://registry.npmjs.org/", "@modelcontextprotocol/server-threejs", "--stdio"]
affiliate: false
tagline: "Previews 3D interactivos para el agente"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-threejs"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/ext-apps/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Three.js** es una librería JavaScript para crear escenas 3D en el navegador. El server oficial de `@modelcontextprotocol` le da a tu IA un canvas interactivo donde puede renderizar y ajustar ejemplos chicos de Three.js.

Qué hace: tu IA puede crear una escena 3D desde código JavaScript, previsualizar la escena mientras se escribe y usar una tool de ayuda para consultar documentación y ejemplos de la API de Three.js. El README describe *"Interactive 3D Rendering"*, *"Streaming Preview"* y una *"Documentation Tool"* como funciones centrales.

### Qué le podés pedir

- *"Creá una escena 3D simple con un cubo rotando y un piso."*
- *"Mostrame un mockup de producto con fondo transparente e iluminación suave."*
- *"Revisá cómo funcionan las luces de Three.js y ajustá la escena para que las sombras se vean mejor."*

### Qué configuración necesitás

No necesitás token. El conector corre localmente con `npx` y abre una vista de app interactiva para la escena generada con Three.js.

1. Instalalo desde el Lab como cualquier conector sin secretos.
2. Usalo para prototipos, explicaciones visuales y experimentos 3D chicos.
3. Revisá el JavaScript generado antes de reutilizarlo en una app de producción.

Este conector ejecuta código de escena dentro de su entorno de preview. Tratalo como un sandbox creativo/dev, no como un lugar para correr lógica de negocio no confiable.

--- dev ---

`@modelcontextprotocol/server-threejs` es un paquete oficial bajo el scope `@modelcontextprotocol`, publicado por `ochafik-ant <ochafik@anthropic.com>` con maintainers de Anthropic/modelcontextprotocol. Paquete verificado: `@modelcontextprotocol/server-threejs@1.7.4`, solo dist-tag `latest`, licencia MIT, repo `modelcontextprotocol/ext-apps`, directorio `examples/threejs-server`.

Manifest verificado desde el README del paquete: `npx -y --silent --registry=https://registry.npmjs.org/ @modelcontextprotocol/server-threejs --stdio`; no requiere secretos.

Tools verificadas contra el README oficial: `show_threejs_scene` y `learn_threejs`. `show_threejs_scene` renderiza una escena 3D desde código JavaScript. `learn_threejs` devuelve documentación y ejemplos de código para APIs de Three.js.

Notas de runtime del README: los globals disponibles incluyen `THREE`, `canvas`, `width`, `height`, `OrbitControls`, `EffectComposer`, `RenderPass` y `UnrealBloomPass`. La app soporta previews en streaming desde input parcial de tool, pausa la animación cuando sale de pantalla con `IntersectionObserver` y soporta fondos transparentes por defecto.

Licencia: MIT. Fuente: README y metadata del paquete `@modelcontextprotocol/server-threejs` en npm, más `modelcontextprotocol/ext-apps` `examples/threejs-server`.
