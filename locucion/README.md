# Locución del video corporativo (ElevenLabs)

Todo el pipeline está versionado. Dos scripts, en orden:

## 1. Generar los 24 MP3 — `scripts/generar-locucion.js`

```bash
export ELEVENLABS_API_KEY="sk_..."   # cuenta Starter de JM
node scripts/generar-locucion.js      # ES + EN (24 archivos)
node scripts/generar-locucion.js es   # solo español
node scripts/generar-locucion.js en   # solo inglés
```

- Salida: `locucion/es/NN-nombre.mp3` y `locucion/en/NN-nombre.mp3` (12 por idioma).
- **Idempotente**: si el archivo ya existe lo salta (no gasta caracteres). Para regenerar UNA línea, borra su MP3 y vuelve a correr.
- Retry automático con backoff ante 429/5xx.
- Voces (elegidas en prueba A/B el 2026-06-20):
  - ES → **Catalina** "Sunny and Engaging" (colombiana) — `k7v2xzj8pZoayBVu9pvq`
  - EN → **Kristen** "Upbeat social media" (americana) — `XZUXLIpE3dqJ9aCZUj2R`
- Ajustes de voz: `stability 0.4 · similarity 0.75 · style 0.30 · speaker_boost` (más actuada: style→0.5, stability→0.3).
- Modelo: `eleven_multilingual_v2`.
- **Los textos viven en el array `LINES` dentro del script** y deben coincidir con `guion-video.html`. Si cambia el guion: editar `LINES`, borrar los MP3 afectados, correr de nuevo.
- Consumo: ~6.000 caracteres por corrida completa (~20% del cupo Starter mensual).

## 2. Armar las pistas guía — `scripts/armar-guia.sh`

```bash
./scripts/armar-guia.sh   # requiere ffmpeg (brew install ffmpeg)
```

- Concatena los 12 MP3 de cada idioma con silencios entre bloques → `locucion/es-guia.mp3` y `locucion/en-guia.mp3`.
- Los silencios se controlan en el array `GAPS` del script (segundos DESPUÉS de cada bloque, índice 0-11 = bloques 1-12).
- Los MP3 sueltos quedan intactos; las guías se sobreescriben sin preguntar.

## 3. Montaje en CapCut

- Pista base: `es-guia.mp3` (o `en-guia.mp3`).
- Los clips de demos van encima, alineados a cada beat de voz.
- Estructura del guion: bloques 01-04 = video hero (30s) · 01-12 = versión completa (~68s).
- Si un beat necesita más aire, editar `GAPS` y re-correr el paso 2 (no re-grabar).

## Advertencias

- NO commitear la API key. Solo `export` en la shell.
- Los MP3 generados NO van al repo (agregar `locucion/*.mp3` y `locucion/*/` a .gitignore si no está).
- Si ElevenLabs desactiva una voz del Voice Library, elegir otra LatAm en /v1/shared-voices y actualizar `VOICES` + este README.
