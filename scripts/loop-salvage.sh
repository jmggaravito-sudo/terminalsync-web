#!/usr/bin/env bash
# Salva el trabajo de un loop cuyo agente llego al tope de turnos antes de abrir el PR.
# Si hay cambios sin subir en una rama que no es main, los commitea, sube la rama y abre
# un PR en DRAFT marcado como WIP. Nunca mergea. Si ya hay PR o no hay cambios, no hace nada.
# Uso: GH_TOKEN=... scripts/loop-salvage.sh <etiqueta>
set -uo pipefail
label="${1:-loop}"
branch="$(git branch --show-current)"
if [ -z "$branch" ] || [ "$branch" = "main" ]; then echo "salvage: sin rama de trabajo, nada que salvar"; exit 0; fi
git config user.name "terminalsync-loop[bot]"
git config user.email "loop-bot@users.noreply.github.com"
git add -A
dirty=0; git diff --cached --quiet || dirty=1
git fetch -q origin main || true
ahead="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
if [ "$dirty" = 0 ] && [ "$ahead" = 0 ]; then echo "salvage: sin cambios"; exit 0; fi
if [ -n "$(gh pr list --head "$branch" --state all --json number -q '.[0].number' 2>/dev/null)" ]; then
  echo "salvage: la rama $branch ya tiene PR"; exit 0
fi
[ "$dirty" = 1 ] && git commit -q -m "wip($label): trabajo del agente al llegar al tope de turnos"
git push -q -u origin "$branch" || { echo "salvage: no se pudo subir $branch"; exit 0; }
gh pr create --draft --base main --head "$branch" \
  --title "WIP($label): el agente llego al tope de turnos" \
  --body "El agente del loop **$label** llego al tope de turnos antes de abrir su PR; este PR rescata lo que alcanzo a escribir. **No esta validado**: revisar a mano o cerrar. Nunca se mergea solo.

App PR: no aplica — la app consume el catalogo" || true
