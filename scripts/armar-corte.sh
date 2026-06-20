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

# Orden narrativo v2 (JM 2026-06-20): continuidad como héroe, no las 3 IAs.
# La escena más fuerte es portátil↔escritorio + WhatsApp; cambio/multi-AI van
# como capacidades, no como protagonistas.
#
# Formato: "demo|voz_block|zoom" donde zoom = yes|no.
#   yes → scale 1.4x + crop 2K top-anchored (chat demos: contenido vive arriba,
#         elimina el espacio blanco inferior).
#   no  → sin zoom (demos de continuidad: portátil↔escritorio, mensajería,
#         conectores funcionan mejor centrados con aire).
SEQ=(
  "demo-mensajeria|01-hero-escena|no"           # opening dramático: AI llega al límite, WhatsApp arriva
  "demo-cambio-ia|08-full-cambio|no"            # continúa con otra IA sin perder contexto
  "demo-ai-director|06-full-recuerda|no"        # multi-AI en el mismo chat
  "demo-sync-dispositivos|09-full-movilidad|no"  # portátil → escritorio (la escena más fuerte)
  "demo-conectores|11-full-facilidad|no"         # tus IAs ya tienen tus herramientas
  "demo-resultados|03-hero-resultado|no"        # cierre: no es chat, es trabajo terminado
)

# Texto on-screen sugerido por beat (referencia editorial para CapCut). ffmpeg
# del Homebrew default no trae libfreetype/libass → drawtext/subtitles no
# disponibles. Cuando edites en CapCut, usá estas líneas.
TXT=(
  "Las IAs se detienen. Tu negocio no."
  "Continúas con otra IA. Sin perder nada."
  "Claude, Codex y Gemini en el mismo chat."
  "Tu trabajo te sigue donde vayas."
  "Tus IAs ya tienen tus herramientas."
  "No es un chat. Es trabajo terminado."
)

# Zoom para chat-demos: scale 1.4x + crop 2K anclado arriba (y=0) → enfoca
# el contenido superior donde viven las burbujas de chat, elimina el aire de
# abajo. El usuario explícitamente NO quiere zoom en los de continuidad porque
# ahí el aire ayuda al concepto.
ZOOM_FILTER="scale=iw*1.4:ih*1.4,crop=2560:1640:(iw-2560)/2:0"

dur () {
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$1"
}

echo
echo "─── Timing por beat (orden v2) ────────────────────────────────────"
printf "%-3s %-26s %-22s %8s %8s %6s\n" "#" "Demo" "Voz block" "VozDur" "DemoMax" "Zoom"

parts=()
voices=()
total=0
i=0
for entry in "${SEQ[@]}"; do
  IFS='|' read -r demo voz zoom <<< "$entry"
  vid_in="$T/$demo.mp4"
  voz_in="$VOZ_DIR/$voz.mp3"
  [ -f "$vid_in" ] || { echo "✗ falta $vid_in"; exit 1; }
  [ -f "$voz_in" ] || { echo "✗ falta $voz_in"; exit 1; }
  vid_dur_max=$(dur "$vid_in")
  voz_dur=$(dur "$voz_in")
  printf "%-3s %-26s %-22s %7.2fs %7.2fs %6s\n" "$i" "$demo" "$voz" "$voz_dur" "$vid_dur_max" "$zoom"

  out="video/.p$i.mp4"
  if [ "$zoom" = "yes" ]; then
    ffmpeg -y -i "$vid_in" -t "$voz_dur" \
      -vf "$ZOOM_FILTER" \
      -an -c:v libx264 -pix_fmt yuv420p -crf 20 "$out" 2>/dev/null
  else
    ffmpeg -y -i "$vid_in" -t "$voz_dur" \
      -an -c:v libx264 -pix_fmt yuv420p -crf 20 "$out" 2>/dev/null
  fi
  parts+=("$out")
  voices+=("$voz_in")
  total=$(echo "$total + $voz_dur" | bc -l)
  i=$((i+1))
done

# Concatenar videos
: > video/.v-list.txt
for p in "${parts[@]}"; do echo "file '$(pwd)/$p'" >> video/.v-list.txt; done
ffmpeg -y -f concat -safe 0 -i video/.v-list.txt -c:v libx264 -pix_fmt yuv420p -crf 20 video/.mudo.mp4 2>/dev/null

# Concatenar voz (mismos N bloques, sin gaps → 1:1 con el video)
: > video/.a-list.txt
for v in "${voices[@]}"; do echo "file '$(pwd)/$v'" >> video/.a-list.txt; done
ffmpeg -y -f concat -safe 0 -i video/.a-list.txt -c:a aac -b:a 192k video/.voz.m4a 2>/dev/null

# Mezclar voz sobre video
ffmpeg -y -i video/.mudo.mp4 -i video/.voz.m4a -map 0:v -map 1:a -c:v copy -c:a aac "$OUT" 2>/dev/null

# Cleanup
rm -f video/.p*.mp4 video/.v-list.txt video/.a-list.txt video/.mudo.mp4 video/.voz.m4a

# Report final
final=$(dur "$OUT")
printf "\n✓ %s · duración total: %.2fs · suma voz: %.2fs · " "$OUT" "$final" "$total"
ffprobe -v error -show_entries format=size -of default=nw=1:nk=1 "$OUT" | awk '{printf "%.1f MB\n", $1/1024/1024}'

echo
echo "─── Bloques de voz NO usados en este corte ────────────────────────"
USED_BLOCKS=$(printf '%s\n' "${SEQ[@]}" | awk -F'|' '{print $2}')
for f in "$VOZ_DIR"/*.mp3; do
  name=$(basename "$f" .mp3)
  if ! echo "$USED_BLOCKS" | grep -qx "$name"; then
    d=$(dur "$f")
    printf "  - %-30s  %5.2fs\n" "$(basename $f)" "$d"
  fi
done

echo
echo "─── Texto on-screen sugerido por beat (para CapCut) ───────────────"
i=0
for entry in "${SEQ[@]}"; do
  IFS='|' read -r demo _ _ <<< "$entry"
  printf "  %d %-26s  «%s»\n" "$i" "$demo" "${TXT[$i]}"
  i=$((i+1))
done
