#!/usr/bin/env bash
# Ensambla el primer corte del video: para cada beat, recorta la toma de demo a
# la duración EXACTA de su MP3 de voz correspondiente. La pista de audio es la
# concatenación de los mismos bloques de voz → 1:1 sincronizado por beat.
# Los textos on-screen se queman con ImageMagick + ffmpeg overlay (no drawtext).
#
# Uso:
#   ./scripts/armar-corte.sh es
#
# Salida: video/corte-<lang>.mp4
# Requiere: ffmpeg, ffprobe, bc, las tomas en video/tomas-<lang>/, los MP3 en
# locucion/<lang>/. ImageMagick (convert) opcional — sin él, sin overlays.

set -e
command -v ffmpeg >/dev/null  || { echo "Instala ffmpeg: brew install ffmpeg"; exit 1; }
command -v ffprobe >/dev/null || { echo "Instala ffmpeg (incluye ffprobe)";   exit 1; }
command -v bc >/dev/null      || { echo "Instala bc";                          exit 1; }

HAS_CONVERT=false
command -v convert >/dev/null 2>&1 && HAS_CONVERT=true

LANG="${1:-es}"
T="video/tomas-$LANG"
VOZ_DIR="locucion/$LANG"
OUT="video/corte-$LANG.mp4"
mkdir -p video video/overlays

# ── Configuración por idioma ─────────────────────────────────────────────────
# Timestamps detectados con Whisper (2026-06-21)
if [ "$LANG" = "en" ]; then
  # EN: "Also, if you don't know how to ask your AI…" starts at 6.26s
  SPLIT_CON_AST="6.26"
  SEQ=(
    "demo-tokens-cambio|01-hero-scene|no|no"
    "demo-cambio-ia|06-full-remembers|no|no"
    "demo-sync-dispositivos|09-full-mobility|no|no"
    "demo-mensajeria|10-full-whatsapp|no|no"
    ".con_ast_combined|11-full-ease|no|no"
    "demo-resultados|03-hero-result|no|no"
    "cierre-brand|12-full-close|no|yes"
  )
  TXT=(
    "AIs hit their limit. Your business doesn't."
    "Claude, Codex, and Gemini. Same chat."
    "Your work follows you wherever you go."
    "Continue from WhatsApp and Telegram."
    ""
    "Not a chat. Real work, done."
    ""
  )
  OV_CON_TXT="Your AIs already have your tools."
  OV_AST_TXT="An assistant that knows how to talk to your AIs."
else
  # ES: "Y en tu chat con la IA…" empieza a 6.72s
  SPLIT_CON_AST="6.72"
  SEQ=(
    "demo-tokens-cambio|01-hero-escena|no|no"
    "demo-cambio-ia|06-full-recuerda|no|no"
    "demo-sync-dispositivos|09-full-movilidad|no|no"
    "demo-mensajeria|10-full-whatsapp|no|no"
    ".con_ast_combined|11-full-facilidad|no|no"
    "demo-resultados|03-hero-resultado|no|no"
    "cierre-brand|12-full-cierre|no|yes"
  )
  TXT=(
    "Las IAs se detienen. Tu negocio no."
    "Claude, Codex y Gemini en el mismo chat."
    "Tu trabajo te sigue donde vayas."
    "Continúa desde WhatsApp y Telegram."
    ""
    "No es un chat. Es trabajo terminado."
    ""
  )
  OV_CON_TXT="Tus IAs ya tienen tus herramientas."
  OV_AST_TXT="Un asistente que sabe cómo hablar con las IAs."
fi

COMBINED_VID="$T/.con_ast_combined.mp4"

ZOOM_FILTER="scale=iw*1.4:ih*1.4,crop=2560:1640:(iw-2560)/2:0"
OV_FONT="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
OV_SIZE=88
OV_Y=190

dur () {
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$1"
}

mk_overlay () {
  local txt="$1" out="$2"
  convert -size 2560x1640 xc:none \
    -font "$OV_FONT" -pointsize "$OV_SIZE" \
    -fill "rgba(0,0,0,0.88)" -stroke "rgba(0,0,0,0.88)" -strokewidth 16 \
    -gravity North -annotate "+0+${OV_Y}" "$txt" \
    -fill white -stroke none \
    -gravity North -annotate "+0+${OV_Y}" "$txt" \
    "$out"
}

apply_overlay () {
  # apply_overlay vid_in dur ov_png out_mp4
  local vid_in="$1" dur_s="$2" ov="$3" out="$4"
  ffmpeg -y -ss 1.5 -i "$vid_in" -t "$dur_s" \
    -loop 1 -i "$ov" \
    -filter_complex "[0:v][1:v]overlay=0:0" \
    -t "$dur_s" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 20 "$out" 2>/dev/null
}

# ── Pre-procesar clip combinado conectores + asistente ───────────────────────
echo
echo "─── Pre-procesando clip combinado conectores/asistente ─────────────"

# Derive the ease/facilidad block name from SEQ entry 4
EASE_BLOCK=$(echo "${SEQ[4]}" | awk -F'|' '{print $2}')
FACILIDAD_DUR=$(dur "$VOZ_DIR/${EASE_BLOCK}.mp3")
ASIST_DUR=$(echo "$FACILIDAD_DUR - $SPLIT_CON_AST" | bc -l)

printf "  Conectores: 0 → %.2fs  |  Asistente: %.2f → %.2fs\n" \
  "$SPLIT_CON_AST" "$SPLIT_CON_AST" "$FACILIDAD_DUR"

OV_CON="video/overlays/ov_con.png"
OV_AST="video/overlays/ov_ast.png"
PRE_CON="video/.pre_con.mp4"
PRE_AST="video/.pre_ast.mp4"
PRE_LIST="video/.pre_list.txt"

if $HAS_CONVERT; then
  mk_overlay "$OV_CON_TXT" "$OV_CON"
  printf "  ✓ overlay conectores\n"
  mk_overlay "$OV_AST_TXT" "$OV_AST"
  printf "  ✓ overlay asistente\n"

  apply_overlay "$T/demo-conectores.mp4"       "$SPLIT_CON_AST" "$OV_CON" "$PRE_CON"
  apply_overlay "$T/demo-asistente-prompts.mp4" "$ASIST_DUR"     "$OV_AST" "$PRE_AST"
else
  # Sin overlays
  ffmpeg -y -ss 1.5 -i "$T/demo-conectores.mp4" -t "$SPLIT_CON_AST" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 20 "$PRE_CON" 2>/dev/null
  ffmpeg -y -ss 1.5 -i "$T/demo-asistente-prompts.mp4" -t "$ASIST_DUR" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 20 "$PRE_AST" 2>/dev/null
fi

printf "file '%s'\nfile '%s'\n" "$(pwd)/$PRE_CON" "$(pwd)/$PRE_AST" > "$PRE_LIST"
ffmpeg -y -f concat -safe 0 -i "$PRE_LIST" -c:v copy "$COMBINED_VID" 2>/dev/null
rm -f "$PRE_CON" "$PRE_AST" "$PRE_LIST" "$OV_CON" "$OV_AST"
printf "  ✓ combinado → %s  (%.2fs)\n" "$COMBINED_VID" "$(dur "$COMBINED_VID")"

# ── Generar PNGs de overlay para beats normales ──────────────────────────────
if $HAS_CONVERT; then
  echo
  echo "─── Generando overlays de texto (beats normales) ───────────────────"
  for i in "${!TXT[@]}"; do
    txt="${TXT[$i]}"
    [ -z "$txt" ] && continue
    ov_file="video/overlays/ov${i}.png"
    mk_overlay "$txt" "$ov_file" 2>/dev/null
    printf "  ✓ ov%d: «%s»\n" "$i" "$txt"
  done
fi

echo
echo "─── Timing por beat ────────────────────────────────────────────────"
printf "%-3s %-26s %-22s %8s %8s %5s %5s %5s\n" "#" "Demo" "Voz block" "VozDur" "DemoMax" "Zoom" "Fade" "OV"

parts=()
voices=()
total=0
i=0
for entry in "${SEQ[@]}"; do
  IFS='|' read -r demo voz zoom fade <<< "$entry"
  vid_in="$T/$demo.mp4"
  voz_in="$VOZ_DIR/$voz.mp3"
  [ -f "$vid_in" ] || { echo "✗ falta $vid_in"; exit 1; }
  [ -f "$voz_in" ] || { echo "✗ falta $voz_in"; exit 1; }
  vid_dur_max=$(dur "$vid_in")
  voz_dur=$(dur "$voz_in")
  txt="${TXT[$i]}"
  ov_file="video/overlays/ov${i}.png"
  has_ov=no
  $HAS_CONVERT && [ -n "$txt" ] && [ -f "$ov_file" ] && has_ov=yes
  printf "%-3s %-26s %-22s %7.2fs %7.2fs %5s %5s %5s\n" "$i" "$demo" "$voz" "$voz_dur" "$vid_dur_max" "$zoom" "$fade" "$has_ov"

  vf_chain=""
  if [ "$zoom" = "yes" ]; then vf_chain="$ZOOM_FILTER"; fi
  if [ "$fade" = "yes" ]; then
    fade_start=$(echo "$voz_dur - 1" | bc -l)
    fade_filter="fade=t=out:st=${fade_start}:d=1"
    if [ -n "$vf_chain" ]; then vf_chain="$vf_chain,$fade_filter"; else vf_chain="$fade_filter"; fi
  fi

  out="video/.p$i.mp4"

  if [ "$has_ov" = "yes" ]; then
    if [ -n "$vf_chain" ]; then
      fc="[0:v]${vf_chain}[vx];[vx][1:v]overlay=0:0"
    else
      fc="[0:v][1:v]overlay=0:0"
    fi
    ffmpeg -y -ss 1.5 -i "$vid_in" -t "$voz_dur" \
      -loop 1 -i "$ov_file" \
      -filter_complex "$fc" \
      -t "$voz_dur" \
      -an -c:v libx264 -pix_fmt yuv420p -crf 20 "$out" 2>/dev/null
  elif [ "$demo" = ".con_ast_combined" ]; then
    # El clip combinado ya tiene overlays pre-aplicados y ya está recortado
    cp "$vid_in" "$out"
  elif [ -n "$vf_chain" ]; then
    ffmpeg -y -ss 1.5 -i "$vid_in" -t "$voz_dur" \
      -vf "$vf_chain" \
      -an -c:v libx264 -pix_fmt yuv420p -crf 20 "$out" 2>/dev/null
  else
    ffmpeg -y -ss 1.5 -i "$vid_in" -t "$voz_dur" \
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

# Concatenar voz
: > video/.a-list.txt
for v in "${voices[@]}"; do echo "file '$(pwd)/$v'" >> video/.a-list.txt; done
ffmpeg -y -f concat -safe 0 -i video/.a-list.txt -c:a aac -b:a 192k video/.voz.m4a 2>/dev/null

# Mezclar voz + video
ffmpeg -y -i video/.mudo.mp4 -i video/.voz.m4a -map 0:v -map 1:a -c:v copy -c:a aac "$OUT" 2>/dev/null

# Cleanup
rm -f video/.p*.mp4 video/.v-list.txt video/.a-list.txt video/.mudo.mp4 video/.voz.m4a
rm -f "$COMBINED_VID"
rm -f video/overlays/ov*.png
rmdir video/overlays 2>/dev/null || true

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
