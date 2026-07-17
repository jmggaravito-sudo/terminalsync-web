---
name: Elasticsearch
logo: /connectors/elasticsearch.svg
category: dev
status: available
simpleTitle: "Preguntale a tu Elasticsearch en lenguaje común"
simpleSubtitle: "Server oficial de Elastic: buscá en tus índices en lenguaje natural."
devTitle: "Elasticsearch MCP Connector"
devSubtitle: "Official @elastic/mcp-server-elasticsearch: tools over your Elasticsearch cluster, API-key scoped."
ctaUrl: "https://www.elastic.co"
tokenHelpUrl: "https://www.elastic.co/guide/en/kibana/current/api-keys.html"
manifest:
  mcpServers:
    elasticsearch:
      command: npx
      args: ["-y", "@elastic/mcp-server-elasticsearch"]
      env:
        ES_URL: "${SECRET:ES_URL}"
        ES_API_KEY: "${SECRET:ES_API_KEY}"
affiliate: false
tagline: "Tu cluster de búsqueda, en lenguaje común"
originalAuthor: "Elastic"
originalAuthorUrl: "https://github.com/elastic/mcp-server-elasticsearch"
license: "Apache-2.0"
licenseUrl: "https://github.com/elastic/mcp-server-elasticsearch/blob/main/LICENSE"
---
**Elasticsearch** es el motor de búsqueda y analítica donde muchos equipos guardan sus logs, catálogos de productos, pedidos y eventos. El conector oficial, publicado por Elastic, conecta al agente con tus datos de Elasticsearch usando el Model Context Protocol para que puedas — en palabras del README — *"interact with your Elasticsearch indices through natural language conversations"* (interactuar con tus índices mediante conversaciones en lenguaje natural).

El agente puede ver qué índices tenés, mirar cómo está armado un índice y correr búsquedas sobre tus datos — y después leerte los resultados en lenguaje común. Un aviso que conviene dejar claro: Elastic dice que este repositorio *"contains experimental features intended for research and evaluation and are not production-ready"* (contiene funciones experimentales pensadas para investigación y evaluación, y no está listo para producción). Tratalo como una herramienta de evaluación, no como algo para apuntar a un sistema de producción crítico.

### Qué le podés pedir

- *"¿Qué índices tengo en mi cluster de Elasticsearch?"*
- *"Mostrame el mapeo de campos del índice 'products'."*
- *"Encontrá todos los pedidos de más de $500 del mes pasado."*

### Qué token necesitás

Este conector necesita dos cosas: la **URL** de tu instancia de Elasticsearch y una forma de autenticarse. Elastic aclara que tenés que dar **o bien** una API key **o bien** un usuario y contraseña — este conector usa una **API key**.

- `ES_URL` — la URL de tu instancia de Elasticsearch (obligatorio). Es la dirección donde vive tu cluster.
- `ES_API_KEY` — una API key de Elasticsearch que deja al agente autenticarse (obligatorio en esta configuración).

Para crear una API key:

1. Abrí **Kibana** y andá a **Stack Management → Security → API keys** (ver la [guía de API keys de Elastic](https://www.elastic.co/guide/en/kibana/current/api-keys.html)).
2. Hacé clic en **Create API key**, ponele un nombre y — siguiendo el consejo de seguridad del propio Elastic — dale solo los permisos que el agente necesita (lectura más ver metadata sobre los índices específicos), no cluster-admin.
3. Copiá el valor de la key y pegalo cuando el Lab te pida `ES_API_KEY`, y pegá la dirección de tu cluster en `ES_URL`. Los dos se guardan cifrados en tu Keychain.

Elastic advierte contra los privilegios de cluster-admin: creá una key dedicada con alcance limitado y aplicá control de acceso a nivel de índice, así el agente solo ve los datos que vos quisiste mostrarle.

--- dev ---

`@elastic/mcp-server-elasticsearch` (Elastic, oficial — repo `elastic/mcp-server-elasticsearch`) corre con `npx -y @elastic/mcp-server-elasticsearch`. El README es explícito en que esto es experimental: *"This repository contains experimental features intended for research and evaluation and are not production-ready."* No es para clusters de producción.

La configuración es enteramente por env vars. `ES_URL` (obligatorio) es la URL de la instancia. La autenticación requiere **o bien** `ES_API_KEY` **o bien** `ES_USERNAME` + `ES_PASSWORD` — el manifest de acá usa `ES_API_KEY` para que el secreto quede en Keychain. Otras env vars opcionales documentadas por el README: `ES_CA_CERT` (path a un certificado CA propio para SSL/TLS), `ES_SSL_SKIP_VERIFY` (`1`/`true` para saltear la verificación del certificado), `ES_PATH_PREFIX` (para instancias detrás de un path no-raíz) y `ES_VERSION` (por defecto asume Elasticsearch 9.x; poné `8` para apuntar a 8.x).

Tools expuestas (verbatim del README):

- `list_indices` — list all available Elasticsearch indices
- `get_mappings` — get field mappings for a specific Elasticsearch index
- `search` — perform an Elasticsearch search with the provided query DSL (soporta highlighting, query profiling y query explanation)
- `get_shards` — get shard information for all or specific indices

Seguridad: el README advierte *"avoid using cluster-admin privileges"* — creá una API key dedicada con `cluster: ["monitor"]` y privilegios por índice `read` + `view_index_metadata` vía `POST /_security/api_key`, acotada a los nombres o patrones de índice exactos que el agente debería tocar.

Terminal Sync mantiene `ES_URL` y `ES_API_KEY` en Keychain vía `apiKeyHelper`, sincronizados cifrados con AES-256-GCM entre máquinas.

Licencia: Apache-2.0. Fuente: github.com/elastic/mcp-server-elasticsearch.
