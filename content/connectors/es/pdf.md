---
name: PDF
logo: /connectors/pdf.svg
category: productivity
status: available
simpleTitle: "Dejá que tu IA lea y marque PDFs"
simpleSubtitle: "Abrí papers locales o URLs académicas permitidas, buscá páginas, extraé texto y anotá documentos."
devTitle: "Conector MCP de PDF"
devSubtitle: "Server MCP App oficial de @modelcontextprotocol: visor interactivo, lectura por partes, anotaciones y guardado con límites."
ctaUrl: "https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/pdf-server"
manifest:
  mcpServers:
    pdf:
      command: npx
      args: ["-y", "--silent", "--registry=https://registry.npmjs.org/", "@modelcontextprotocol/server-pdf", "--stdio"]
affiliate: false
tagline: "Lectura, búsqueda y anotaciones de PDFs para el agente"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-pdf"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/ext-apps/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**PDF** es el formato que la gente usa para papers, reportes, contratos y formularios. El server oficial de `@modelcontextprotocol` abre un visor interactivo de PDFs y soporta archivos locales más URLs remotas de fuentes académicas permitidas, como arXiv, bioRxiv, Zenodo y otras.

Qué hace: tu IA puede listar PDFs disponibles, mostrar un documento, buscar dentro del archivo, ir a una página, extraer texto de páginas elegidas, tomar una captura, agregar resaltados o notas, sellar páginas, completar formularios y guardar una copia anotada cuando el archivo está dentro de una carpeta local permitida. El README describe el patrón central como *"chunked pagination"*: leer por partes para no mandar un PDF grande en una sola llamada enorme.

### Qué le podés pedir

- *"Abrí este paper y resumime el argumento de las páginas 1 a 3."*
- *"Buscá en este contrato las condiciones de cancelación y resaltá el párrafo importante."*
- *"Poné un sello de confidencial en todas las páginas y guardá una copia anotada."*

### Qué configuración necesitás

No necesitás token. El conector corre localmente con `npx` y solo puede leer archivos locales que le pases, carpetas locales expuestas por el cliente o PDFs remotos de la lista de fuentes permitidas.

1. Instalalo desde el Lab como cualquier conector sin secretos.
2. Abrí PDFs solo desde carpetas que estés cómodo exponiendo al agente.
3. Para guardar anotaciones, usá una carpeta local montada como raíz; el server rechaza escrituras fuera de las raíces permitidas.

Cuidado con documentos confidenciales. Este conector pone el contenido del PDF a disposición de la sesión de IA, así que abrí solo archivos que correspondan a ese workspace.

--- dev ---

`@modelcontextprotocol/server-pdf` es un paquete oficial bajo el scope `@modelcontextprotocol`, publicado por `ochafik-ant <ochafik@anthropic.com>` con maintainers de Anthropic/modelcontextprotocol. Paquete verificado: `@modelcontextprotocol/server-pdf@1.7.4`, solo dist-tag `latest`, licencia MIT, repo `modelcontextprotocol/ext-apps`, directorio `examples/pdf-server`.

Manifest verificado desde el README del paquete: `npx -y --silent --registry=https://registry.npmjs.org/ @modelcontextprotocol/server-pdf --stdio`; no requiere secretos.

Tools verificadas contra el README oficial: `list_pdfs`, `display_pdf`, `interact`, `read_pdf_bytes`, `save_pdf`. Notas de visibilidad: `list_pdfs` es visible para el modelo; `display_pdf` es modelo + UI; `interact` es visible para el modelo y queda activo por defecto en stdio; `read_pdf_bytes` y `save_pdf` son app-only.

Gotchas de seguridad y transporte: stdio siempre habilita client roots porque se espera que el cliente sea local. HTTP ignora client roots por defecto salvo que se pase `--use-client-roots`. `interact` depende de una cola en memoria: stdio funciona por defecto; HTTP requiere `--enable-interact`; HTTP stateless multi-instancia debería dejarlo apagado. Guardar PDFs anotados está limitado a raíces montadas y no sobreescribe salvo pedido explícito.

Fuentes remotas permitidas nombradas por el README: arxiv.org, biorxiv.org, medrxiv.org, chemrxiv.org, zenodo.org, osf.io, hal.science y ssrn.com.

Licencia: MIT. Fuente: README y metadata del paquete `@modelcontextprotocol/server-pdf` en npm, más `modelcontextprotocol/ext-apps` `examples/pdf-server`.
