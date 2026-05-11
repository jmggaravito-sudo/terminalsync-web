---
name: Wrangler
binary: wrangler
installCommand: npm i -g wrangler
authCommand: wrangler login
vendor: Cloudflare
homepage: https://developers.cloudflare.com/workers/wrangler/
repo: https://github.com/cloudflare/workers-sdk
category: deploy
tagline: Construí, probá y deployá Workers, Pages y D1 desde un solo CLI.
description: El CLI oficial de Cloudflare para todo Workers — Workers, Pages, D1 (SQLite), R2 (object storage), KV, Queues, Durable Objects. Devs local, tail de logs en prod, secretos, deploy en un comando. TerminalSync mantiene tu auth y secretos sincronizados, así una máquina nueva deploya en segundos.
status: available
---

## Qué hace

`wrangler` es la entrada a toda la plataforma Workers de Cloudflare. Desarrollás local con Miniflare, deployás Workers en segundos a todo el edge, manejás D1 databases, buckets R2, namespaces KV, Queues y Durable Objects, tail de logs vivos, secrets cifrados — todo desde un binario. Es el camino oficial para shippear cualquier cosa en el edge de Cloudflare.

## Qué le suma TerminalSync

- **Auth Sync.** Tu `~/.wrangler/config/default.toml` viaja cifrado entre máquinas. No más re-autenticar en cada Mac.
- **Secrets en env vault.** Los valores de `wrangler secret put` se reflejan en el vault cifrado del folder, así los recuperás en otra máquina sin tener que rotarlos.
- **Memoria de sesión.** Tu IA recuerda qué Worker, qué cuenta y qué environment usás — así "deploy a staging" no pide confirmación que ya tiene.

## Comandos típicos

```bash
wrangler dev                       # dev server local (Miniflare)
wrangler deploy                    # publica al edge global
wrangler secret put STRIPE_KEY
wrangler tail                      # logs vivos de producción
wrangler d1 execute mi-db --command "SELECT * FROM users"
```
