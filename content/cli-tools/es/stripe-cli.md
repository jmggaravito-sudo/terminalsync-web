---
name: Stripe CLI
binary: stripe
installCommand: brew install stripe/stripe-cli/stripe
authCommand: stripe login
vendor: Stripe
homepage: https://stripe.com/docs/stripe-cli
repo: https://github.com/stripe/stripe-cli
category: payments
tagline: Forwardeá webhooks, disparar eventos, ver logs — sin tocar el dashboard.
description: El CLI oficial de Stripe. Forward de webhooks a localhost mientras programás, trigger de cualquier evento para testing, browse de charges y customers desde el shell, y tail de logs en vivo. TerminalSync sincroniza tu auth Stripe entre máquinas, así seguís debuggeando en la laptop que tengas a mano.
status: available
---

## Qué hace

`stripe` es el CLI oficial. El feature clave es `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, que proxea los webhooks live a tu server local así testeás el flujo de pago sin ngrok. Además: trigger de eventos (`stripe trigger checkout.session.completed`), browse de customers y charges, tarjetas de testing, y tail de logs en tiempo real.

## Qué le suma TerminalSync

- **Auth Sync.** Tu `~/.config/stripe/config.toml` (test + live mode) viaja cifrado entre máquinas. Login una vez, autenticado en todas.
- **Webhook secret en env vault.** Cuando `stripe listen` imprime un `whsec_…`, TerminalSync te pregunta si lo guardás cifrado en el `.env` vault del folder, así sobrevive reboots sin filtrarse.
- **Puente MCP.** Combinado con el connector Stripe MCP, Claude puede leer customers, reembolsar charges y consultar subscripciones usando la misma auth.

## Comandos típicos

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
stripe customers list --limit 5
stripe logs tail
stripe products list
```
