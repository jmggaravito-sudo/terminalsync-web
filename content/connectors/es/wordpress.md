---
name: WordPress
logo: /connectors/wordpress.svg
category: productivity
status: available
simpleTitle: "Tu sitio web, actualizado por conversación"
simpleSubtitle: "\"Armá un post sobre el servicio nuevo\" — tu IA escribe y publica en tu sitio WordPress."
devTitle: "Conector MCP de WordPress"
devSubtitle: "MCP sobre la WordPress REST API — posts y páginas con auth de application-password."
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
tagline: "Posts y páginas, sin usar las manos"
originalAuthor: "Utsav Ladani"
originalAuthorUrl: "https://www.npmjs.com/package/wordpress-mcp"
license: "ISC"
---
El blog de tu sitio es una de las mejores formas de que te encuentren y de mostrarte vivo ante los clientes — pero escribir y publicar es lo que siempre se posterga. Si tu sitio corre en **WordPress**, este conector deja que tu IA arme un post y lo suba por vos, así el "deberíamos postear sobre eso" de verdad pasa.

Decile *"armá un post corto anunciando nuestro nuevo servicio de envío a domicilio, tono amable"* y lo escribe y crea el borrador en tu sitio. Pedile que publique y lo hace — vos mantenés el control de qué sale al aire.

### Qué le podés pedir

- *"Escribí un post de 300 palabras sobre por qué cambiamos a packaging ecológico, y guardalo como borrador."*
- *"Publicá el borrador sobre los horarios de las fiestas."*
- *"Armá tres ideas de título de blog sobre nuestro menú de invierno."*

### Qué necesitás

WordPress se conecta con una **Application Password** — una clave segura y revocable que WordPress crea justo para esto (nunca compartís tu login real):

1. En tu admin de WordPress, andá a **Users → Profile → Application Passwords** (mirá la [guía oficial](https://wordpress.org/documentation/article/application-passwords/)) y creá una llamada "Terminal Sync".
2. Pegá la dirección de tu sitio, tu usuario, esa application password y tu id de autor cuando el Lab te lo pida (`WORDPRESS_HOST_URL`, `WORDPRESS_API_USERNAME`, `WORDPRESS_API_PASSWORD`, `WORDPRESS_POST_AUTHOR_ID`).

Todo queda guardado cifrado en tu Keychain y sincronizado entre tus máquinas. Podés revocar la application password cuando quieras desde tu perfil — tu contraseña real nunca se toca.

--- dev ---

`wordpress-mcp` (Utsav Ladani) habla la WordPress REST API para crear y administrar posts/páginas. Env de configuración: `WORDPRESS_HOST_URL` (la base REST de tu sitio), `WORDPRESS_API_USERNAME`, `WORDPRESS_API_PASSWORD` (una application password, no la del login), `WORDPRESS_POST_AUTHOR_ID`.

Las application passwords son por-integración y revocables desde el perfil del usuario, así que la contraseña real de la cuenta nunca sale de WordPress. Terminal Sync guarda los cuatro valores en tu Keychain, sincronizados cifrados entre máquinas con AES-256-GCM. Publicar va con un paso de confirmación en el escritorio.

Licencia: ISC. Fuente: npm `wordpress-mcp` (autor Utsav Ladani).
