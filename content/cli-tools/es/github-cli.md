---
name: GitHub CLI
logo: https://github.com/cli.png?size=128
binary: gh
installCommand: brew install gh
authCommand: gh auth login
vendor: GitHub
homepage: https://cli.github.com
repo: https://github.com/cli/cli
category: dev
tagline: Issues, PRs, releases y GitHub Actions desde tu shell.
description: El CLI oficial de GitHub. Leé y creá issues, abrí PRs, corré workflows, manejá releases — todo sin salir del terminal. TerminalSync tiene GitHub Auth Sync dedicado para que tu sesión de `gh` viaje cifrada entre Macs.
status: available
---

## Qué hace

`gh` es el CLI oficial de GitHub sobre las APIs REST v3 y GraphQL. Una vez autenticado podés crear y revisar pull requests, abrir y triagear issues, lanzar runs de Actions, manejar releases y gists, clonar repos — todo sin pasar al navegador.

## Qué le suma TerminalSync

- **GitHub Auth Sync.** TerminalSync le pide el token activo a `gh`, lo cifra con tu master key y lo reinstala en otra Mac usando `gh auth login --with-token`. Lo controlás desde Ajustes.
- **Memoria de sesión.** El agente IA recuerda en qué repo trabajás y qué PRs están abiertas — así cuando le decís "revisame el PR" sabe a cuál.
- **Puente MCP.** Combinado con el connector GitHub MCP, Claude / Codex / Gemini pueden leer commits o PRs usando la misma auth.

## Comandos típicos

```bash
gh pr create --fill
gh issue list --assignee @me --state open
gh release create v1.2.0 --generate-notes
gh workflow run deploy.yml --ref main
gh repo clone miorg/mirepo
```
