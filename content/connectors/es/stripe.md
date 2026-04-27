---
name: Stripe
logo: /connectors/stripe.svg
category: dev
status: available
simpleTitle: "Tu IA mira tu Stripe sin que copies y pegues"
simpleSubtitle: "Cobros, suscripciones, refunds — preguntá en lenguaje natural y respondé al cliente más rápido."
devTitle: "Stripe MCP Connector"
devSubtitle: "Read + write tools across Customers, Charges, Subscriptions, Invoices, Refunds and Disputes."
ctaUrl: "https://stripe.com/"
affiliate: false
tagline: "Tu billing dashboard, ahora preguntable"
manifest:
  command: npx
  args: ["-y", "@stripe/mcp", "--tools=all"]
  env:
    STRIPE_SECRET_KEY: "${SECRET:STRIPE_SECRET_KEY}"
---

Cuando un cliente te escribe "no me llegó la factura del mes pasado" o "cobrame de nuevo con otra tarjeta", abrir Stripe, encontrar al cliente, mirar el invoice y responder te lleva 5 minutos. Por cada cliente.

Con este conector le decís a Claude *"buscá al cliente con email X, dame su última factura y reenviála a este otro mail"* y la respuesta llega en segundos. Sin sacarlo del chat.

Configurado una sola vez, viaja con vos a todas tus máquinas vía Terminal Sync.

--- dev ---

The official `@stripe/mcp` server exposes Customers, Charges, PaymentIntents, Subscriptions, Invoices, Refunds, Disputes and Products as tools. The `--tools=all` flag mounts the full surface; you can scope it to read-only with `--tools=read-only` for production agents.

Terminal Sync stores the secret key in the OS Keychain via `apiKeyHelper` and replicates the `claude_desktop_config.json` snippet across machines, encrypted end-to-end. Switch from laptop to studio tower — your agent keeps access to the same Stripe account without re-pasting `sk_live_*`.

**Best for**: founders haciendo soporte ad-hoc desde el IDE; finance ops que quieren consultar billing sin abrir el dashboard; SRE que automatiza ops de cobros.

**Scopes**: por defecto, solo el secret key del proyecto que vos elijas. Recomendado: crear una restricted key con permisos read-only para agents que no deberían cobrar.
