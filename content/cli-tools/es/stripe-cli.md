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
description: El CLI oficial de Stripe. Forward de webhooks a localhost mientras programás, trigger de cualquier evento para testing, browse de charges y customers desde el shell, y tail de logs en vivo. TerminalSync deja el workflow de Stripe cerca de la terminal del proyecto y protege secretos `.env` con el vault cifrado.
status: available
---

## Qué hace

`stripe` es el CLI oficial. El feature clave es `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, que proxea los webhooks live a tu server local así testeás el flujo de pago sin ngrok. Además: trigger de eventos (`stripe trigger checkout.session.completed`), browse de customers y charges, tarjetas de testing, y tail de logs en tiempo real.

## Qué le suma TerminalSync

- **Guía de workflow.** Instalación, login y comandos de webhooks quedan al lado de la terminal donde trabaja tu IA, así una Mac nueva tiene el runbook correcto.
- **Webhook secret en env vault.** Guardá el `whsec_…` que imprime `stripe listen` en un `.env` del proyecto y TerminalSync puede mantener ese archivo cifrado en el vault de la carpeta.
- **Puente MCP.** Combinado con el connector Stripe MCP, Claude puede leer customers, reembolsar charges y consultar subscripciones usando la misma auth.

## Comandos típicos

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
stripe customers list --limit 5
stripe logs tail
stripe products list
```
