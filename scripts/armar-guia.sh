#!/usr/bin/env bash
# Concatena los 13 MP3 de cada idioma en una pista guía única (`locucion/{es,en}-guia.mp3`)
# insertando silencios entre bloques para que el editor pueda alinear los demos
# encima de cada beat sin volver a cortar las voces.
#
# Uso (desde la raíz del repo):
#   ./scripts/armar-guia.sh
#
# Requiere ffmpeg. Sobrescribe sin preguntar. Los 12 MP3 sueltos quedan intactos.

set -e

command -v ffmpeg >/dev/null || { echo "ffmpeg no instalado. brew install ffmpeg"; exit 1; }

# Silencio en segundos DESPUÉS de cada bloque, según los tiempos del guion.
# Hero (1-4) + Completa (5-12). Ajustá a gusto al editar.
GAPS=(0.6 0.6 0.6 1.2  0.5 0.5 0.5 0.5 0.5 0.5 0.6 0.5 1.0)

build () {
  local lang="$1"
  local dir="locucion/$lang"
  local list="locucion/.$lang-list.txt"
  [ -d "$dir" ] || { echo "✗ falta $dir"; return 1; }
  : > "$list"
  local i=0
  for f in "$dir"/[0-9][0-9]*-*.mp3; do
    echo "file '$(pwd)/$f'" >> "$list"
    local gap="${GAPS[$i]:-0.5}"
    local sil="locucion/.sil-$lang-$i.mp3"
    ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t "$gap" -q:a 9 "$sil" 2>/dev/null
    echo "file '$(pwd)/$sil'" >> "$list"
    i=$((i+1))
  done
  local out="locucion/$lang-guia.mp3"
  local log
  if ! log=$(ffmpeg -y -f concat -safe 0 -i "$list" -c:a libmp3lame -q:a 2 "$out" 2>&1); then
    echo "✗ ffmpeg concat falló para $lang:"
    echo "$log" | tail -10
    return 1
  fi
  rm -f "$list" "locucion/.sil-${lang}-"*.mp3
  echo "✓ $out ($(du -h "$out" | cut -f1))"
}

build es
build en
echo "Listo. Pistas guía en locucion/es-guia.mp3 y locucion/en-guia.mp3"
