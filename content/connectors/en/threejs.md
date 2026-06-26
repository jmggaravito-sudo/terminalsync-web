---
name: Three.js
logo: /connectors/threejs.svg
category: dev
status: available
simpleTitle: "Preview 3D scenes with your AI"
simpleSubtitle: "Let the agent render and iterate on small Three.js scenes in an interactive view."
devTitle: "Three.js MCP Connector"
devSubtitle: "Official @modelcontextprotocol MCP App server: streaming Three.js scene renderer and docs helper."
ctaUrl: "https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/threejs-server"
manifest:
  mcpServers:
    threejs:
      command: npx
      args: ["-y", "--silent", "--registry=https://registry.npmjs.org/", "@modelcontextprotocol/server-threejs", "--stdio"]
affiliate: false
tagline: "Interactive 3D previews for the agent"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-threejs"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/ext-apps/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Three.js** is a JavaScript library for building 3D scenes in the browser. The official `@modelcontextprotocol` server gives your AI an interactive preview canvas where it can render and adjust small Three.js examples.

What it does: your AI can create a 3D scene from JavaScript code, preview the scene as it is being written, and ask a helper tool for Three.js API docs and examples. The README describes *"Interactive 3D Rendering"*, *"Streaming Preview"* and a *"Documentation Tool"* as its core features.

### What you can ask

- *"Create a simple 3D scene with a rotating cube and a floor."*
- *"Show me a transparent-background product mockup with soft lighting."*
- *"Look up how Three.js lights work and update the scene so the shadows are easier to see."*

### What configuration you need

You do not need a token. The connector runs locally with `npx` and opens an interactive app view for the generated Three.js scene.

1. Install it from the Lab like any connector without secrets.
2. Use it for prototypes, visual explanations and small 3D experiments.
3. Review generated JavaScript before reusing it in a production app.

This connector executes scene code inside its preview environment. Treat it as a creative/dev sandbox, not as a place to run untrusted business logic.

--- dev ---

`@modelcontextprotocol/server-threejs` is an official package under the `@modelcontextprotocol` scope, published by `ochafik-ant <ochafik@anthropic.com>` with Anthropic/modelcontextprotocol maintainers. Verified package: `@modelcontextprotocol/server-threejs@1.7.4`, dist-tag `latest` only, license MIT, repository `modelcontextprotocol/ext-apps`, directory `examples/threejs-server`.

Verified manifest from the package README: `npx -y --silent --registry=https://registry.npmjs.org/ @modelcontextprotocol/server-threejs --stdio`; no secrets required.

Tools verified against the official README: `show_threejs_scene` and `learn_threejs`. `show_threejs_scene` renders a 3D scene from JavaScript code. `learn_threejs` returns documentation and code examples for Three.js APIs.

Runtime notes from the README: available globals include `THREE`, `canvas`, `width`, `height`, `OrbitControls`, `EffectComposer`, `RenderPass` and `UnrealBloomPass`. The app supports streaming previews from partial tool input, pauses animation when scrolled out of view with `IntersectionObserver`, and supports transparent backgrounds by default.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-threejs` on npm, plus `modelcontextprotocol/ext-apps` `examples/threejs-server`.
