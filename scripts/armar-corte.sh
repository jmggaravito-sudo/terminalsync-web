#!/usr/bin/env bash
# Ensambla el primer corte del video: para cada beat, recorta la toma de demo a
# la duración EXACTA de su MP3 de voz correspondiente. La pista de audio es la
# concatenación de los mismos bloques de voz → 1:1 sincronizado por beat.
#
# Uso:
#   ./scripts/armar-corte.sh es
#
# Salida: video/corte-<lang>.mp4
# Requiere: ffmpeg, ffprobe, bc, las tomas en video/tomas-<lang>/, los MP3 en
# locucion/<lang>/.

set -e
command -v ffmpeg >/dev/null  || { echo "Instala ffmpeg: brew install ffmpeg"; exit 1; }
command -v ffprobe >/dev/null || { echo "Instala ffmpeg (incluye ffprobe)";   exit 1; }
command -v bc >/dev/null      || { echo "Instala bc";                          exit 1; }

LANG="${1:-es}"
T="video/tomas-$LANG"
VOZ_DIR="locucion/$LANG"
OUT="video/corte-$LANG.mp4"
mkdir -p video

# Mapping beat → demo → bloque de voz. Editá si querés otro orden o reemplazar
# alguna toma. demo-ai-director reemplaza la 2da cambio-ia del .md original
# (decisión JM 2026-06-20).
SEQ=(
  "demo-cambio-ia|05-full-dolor"
  "demo-resultados|07-full-resultado"
  "demo-ai-director|08-full-cambio"
  "demo-sync-dispositivos|09-full-movilidad"
  "demo-mensajeria|10-full-whatsapp"
  "demo-conectores|11-full-facilidad"
  "demo-asistente-prompts|12-full-cierre"
)

# Texto en pantalla por beat (frase corta resumen). Editar a gusto.
TXT=(
  "Tu trabajo con IA se rompe todo el tiempo."
  "No es un chat. Es trabajo terminado."
  "Cuando una IA se detiene, tu trabajo no."
  "Continúa desde donde estés."
  "Tu trabajo te sigue hasta el chat."
  "Trabaja con IA sin ser developer."
  "Las IAs se detienen. Tu negocio no."
)

dur () {
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$1"
}

echo
echo "─── Timing por beat ───────────────────────────────────────────────"
printf "%-3s %-26s %-22s %8s %8s\n" "#" "Demo" "Voz block" "VozDur" "DemoMax"

parts=()
voices=()
total=0
i=0
for entry in "${SEQ[@]}"; do
  demo="${entry%%|*}"
  voz="${entry##*|}"
  vid_in="$T/$demo.mp4"
  voz_in="$VOZ_DIR/$voz.mp3"
  [ -f "$vid_in" ] || { echo "✗ falta $vid_in"; exit 1; }
  [ -f "$voz_in" ] || { echo "✗ falta $voz_in"; exit 1; }
  vid_dur_max=$(dur "$vid_in")
  voz_dur=$(dur "$voz_in")
  printf "%-3s %-26s %-22s %7.2fs %7.2fs\n" "$i" "$demo" "$voz" "$voz_dur" "$vid_dur_max"

  out="video/.p$i.mp4"
  # NOTA: drawtext requiere ffmpeg compilado con libfreetype (Homebrew default no lo trae).
  # Para este primer corte saltamos el texto en pantalla — se agrega trivial en CapCut.
  # El array TXT queda como referencia editorial de qué decir en cada beat.
  ffmpeg -y -i "$vid_in" -t "$voz_dur" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 20 "$out" 2>/dev/null
  parts+=("$out")
  voices+=("$voz_in")
  total=$(echo "$total + $voz_dur" | bc -l)
  i=$((i+1))
done

# Concatenar videos
: > video/.v-list.txt
for p in "${parts[@]}"; do echo "file '$(pwd)/$p'" >> video/.v-list.txt; done
ffmpeg -y -f concat -safe 0 -i video/.v-list.txt -c:v libx264 -pix_fmt yuv420p -crf 20 video/.mudo.mp4 2>/dev/null

# Concatenar voz (mismos 7 bloques, sin gaps → 1:1 con el video)
: > video/.a-list.txt
for v in "${voices[@]}"; do echo "file '$(pwd)/$v'" >> video/.a-list.txt; done
ffmpeg -y -f concat -safe 0 -i video/.a-list.txt -c:a aac -b:a 192k video/.voz.m4a 2>/dev/null

# Mezclar voz sobre video
ffmpeg -y -i video/.mudo.mp4 -i video/.voz.m4a -map 0:v -map 1:a -c:v copy -c:a aac "$OUT" 2>/dev/null

# Cleanup
rm -f video/.p*.mp4 video/.v-list.txt video/.a-list.txt video/.mudo.mp4 video/.voz.m4a

# Report final
final=$(dur "$OUT")
printf "\n✓ %s · duración total: %.2fs · suma voz: %.2fs · suma demos máx: " "$OUT" "$final" "$total"
ffprobe -v error -show_entries format=size -of default=nw=1:nk=1 "$OUT" | awk '{printf "%.1f MB\n", $1/1024/1024}'

echo
echo "─── Bloques de voz NO usados en este corte ────────────────────────"
for prefix in 01 02 03 04 06; do
  for f in "$VOZ_DIR"/$prefix-*.mp3; do
    [ -f "$f" ] || continue
    d=$(dur "$f")
    printf "  - %-30s  %5.2fs\n" "$(basename $f)" "$d"
  done
done
