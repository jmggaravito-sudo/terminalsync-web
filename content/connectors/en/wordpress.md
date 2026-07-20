---
name: WordPress
logo: /connectors/wordpress.svg
category: productivity
status: available
simpleTitle: "Your website, updated by conversation"
simpleSubtitle: "\"Draft a post about the new service\" — your AI writes and publishes to your WordPress site."
devTitle: "WordPress MCP Connector"
devSubtitle: "MCP over the WordPress REST API — posts and pages via application-password auth."
ctaUrl: "https://wordpress.org"
tokenHelpUrl: "https://wordpress.org/documentation/article/application-passwords/"
manifest:
  mcpServers:
    wordpress:
      command: npx
      args: ["-y", "wordpress-mcp"]
      env:
        WORDPRESS_HOST_URL: "${SECRET:WORDPRESS_HOST_URL}"
        WORDPRESS_API_USERNAME: "${SECRET:WORDPRESS_API_USERNAME}"
        WORDPRESS_API_PASSWORD: "${SECRET:WORDPRESS_API_PASSWORD}"
        WORDPRESS_POST_AUTHOR_ID: "${SECRET:WORDPRESS_POST_AUTHOR_ID}"
affiliate: false
tagline: "Blog posts and pages, hands-free"
originalAuthor: "Utsav Ladani"
originalAuthorUrl: "https://www.npmjs.com/package/wordpress-mcp"
license: "ISC"
---
Your website's blog is one of the best ways to get found and to look alive to customers — but writing and posting is the thing that always slips. If your site runs on **WordPress**, this connector lets your AI draft a post and put it up for you, so "we should really post about that" actually happens.

Say *"draft a short post announcing our new home-delivery service, friendly tone"* and it writes it and creates the draft on your site. Ask it to publish and it does — you stay in control of what goes live.

### What you can ask

- *"Write a 300-word post about why we switched to eco-friendly packaging, and save it as a draft."*
- *"Publish the draft about the holiday hours."*
- *"Draft three blog title ideas about our winter menu."*

### What you need

WordPress connects with an **Application Password** — a safe, revocable key WordPress makes for exactly this (you never share your real login):

1. In your WordPress admin, go to **Users → Profile → Application Passwords** (see the [official guide](https://wordpress.org/documentation/article/application-passwords/)) and create one named "Terminal Sync".
2. Paste your site address, your username, that application password, and your author id when the Lab asks (`WORDPRESS_HOST_URL`, `WORDPRESS_API_USERNAME`, `WORDPRESS_API_PASSWORD`, `WORDPRESS_POST_AUTHOR_ID`).

All of it is stored encrypted in your Keychain and synced across your machines. Revoke the application password anytime from your profile — your real password is never touched.

--- dev ---

`wordpress-mcp` (Utsav Ladani) speaks the WordPress REST API to create and manage posts/pages. Config env: `WORDPRESS_HOST_URL` (your site's REST base), `WORDPRESS_API_USERNAME`, `WORDPRESS_API_PASSWORD` (an application password, not the login password), `WORDPRESS_POST_AUTHOR_ID`.

Application passwords are per-integration and revocable from the user profile, so the real account password never leaves WordPress. Terminal Sync stores all four values in your Keychain, synced encrypted across machines with AES-256-GCM. Publishing is gated behind a confirmation step in the desktop.

License: ISC. Source: npm `wordpress-mcp` (author Utsav Ladani).
