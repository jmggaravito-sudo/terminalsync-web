---
name: Vercel CLI
binary: vercel
installCommand: npm i -g vercel
authCommand: vercel login
vendor: Vercel
homepage: https://vercel.com/docs/cli
repo: https://github.com/vercel/vercel
category: deploy
tagline: Deploy, env vars, preview URLs y team scopes desde un solo comando.
description: El CLI oficial de Vercel. Deployás cualquier commit a un preview URL, manejás environment variables por entorno, linkás proyectos, mirás logs y promovés a producción — todo scripteable. TerminalSync mantiene comandos de deploy y `.env` cifrados cerca de la terminal.
status: available
---

## Qué hace

`vercel` es la puerta de entrada a Vercel desde el terminal. Deployás una carpeta a un preview URL, pull/push de env vars, linkás un proyecto, mirás logs de funciones, promovés un deploy a prod, corrés `vercel build --prebuilt` en CI — todo desde un único binario. Funciona igual para proyectos personales y team accounts.

## Qué le suma TerminalSync

- **Runbook de deploy.** Instalación, login, previews y deploy a producción quedan pegados a la terminal del proyecto.
- **Env vault.** Cuando hacés `vercel env pull` dentro de una carpeta TerminalSync, el `.env.local` resultante puede cifrarse en el vault de la carpeta. Tus secretos siguen al folder sin escaparse a Drive en plano.
- **Memoria de sesión.** Tu IA recuerda contra qué proyecto + environment Vercel estás trabajando, así "redeploy preview" no pide aclaración.

## Comandos típicos

```bash
vercel                          # deploya el dir actual como preview
vercel --prod                   # promueve a producción
vercel env pull .env.local
vercel env add MI_SECRETO production
vercel inspect <url>
vercel logs <url>
```
