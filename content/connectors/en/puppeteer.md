---
name: Puppeteer
logo: /connectors/puppeteer.svg
category: dev
status: available
simpleTitle: "Let your AI use a real browser"
simpleSubtitle: "Open pages, click, fill forms and take screenshots when reading HTML is not enough."
devTitle: "Puppeteer MCP Connector"
devSubtitle: "Official @modelcontextprotocol server: browser automation with screenshots, console logs and JavaScript."
ctaUrl: "https://pptr.dev"
manifest:
  mcpServers:
    puppeteer:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-puppeteer"]
affiliate: false
tagline: "A real browser for your AI"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-puppeteer"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-puppeteer"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Puppeteer** is a tool for controlling a real browser from code. It is useful for pages that load with JavaScript, include forms or require visual interaction.

This connector lets your AI open pages, click, fill fields, select options, take screenshots, read console messages and execute JavaScript in the browser. The official README says it enables models to *"interact with web pages, take screenshots, and execute JavaScript in a real browser environment"*.

### What you can ask

- *"Open this page, take a screenshot and tell me whether the main form looks right."*
- *"Go to this staging URL, click the purchase button and tell me what appears next."*
- *"Check the browser console and summarize the errors that appear while the page loads."*

### What configuration you need

You do not need a token. The connector installs the server with `npx` and opens a local browser so the AI can interact with pages.

1. Install it from the Lab like any connector without secrets.
2. Use it only on sites where you have permission to browse or test.
3. If you need to change how the browser starts, ask someone technical to review the Puppeteer options before changing security settings.

Puppeteer is heavier than a simple page reader because it launches a real browser. Reserve it for cases where you need to see, click or test a page like a person.

--- dev ---

`@modelcontextprotocol/server-puppeteer` is an official package published by `Anthropic, PBC` under the `@modelcontextprotocol` scope. Verified manifest: `npx -y @modelcontextprotocol/server-puppeteer`; no secrets required.

Tools verified against the README and npm bundle: `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_hover`, `puppeteer_fill`, `puppeteer_select`, `puppeteer_evaluate`. Verified resources: `console://logs` and `screenshot://<name>`.

The README documents `PUPPETEER_LAUNCH_OPTIONS` as a JSON env var and `launchOptions` / `allowDangerous` parameters on `puppeteer_navigate`. Security gotcha: `allowDangerous=false` by default blocks dangerous args such as `--no-sandbox` and `--disable-web-security`.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-puppeteer` on npm.
