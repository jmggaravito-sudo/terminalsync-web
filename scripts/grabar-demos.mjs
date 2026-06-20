// Graba los 7 demos HTML (autoplay) a MP4 via Playwright + ffmpeg.
//
// Uso (con dev server en :3000, recomendado):
//   npm run dev   # en otra terminal
//   node scripts/grabar-demos.mjs es
//
// O contra los archivos locales:
//   DEMO_BASE="file://$(pwd)/public/demos" node scripts/grabar-demos.mjs es
//
// Output: video/tomas-<lang>/<demo>.mp4 (2560x1640 @30fps, libx264 CRF 18)
//
// Idempotente: salta los .mp4 que ya existen — borrá manualmente para regenerar.

import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

// nombre de archivo → segundos máximos a grabar (cubre el autoplay completo de cada demo)
const DEMOS = [
  ['demo-cambio-ia',          22],
  ['demo-resultados',         16],
  ['demo-ai-director',        18],
  ['demo-sync-dispositivos',  16],
  ['demo-conectores',         16],
  ['demo-mensajeria',         24],
  ['demo-asistente-prompts',  20],
  ['cierre-brand',             5],  // card estático: logo + tagline + URL, 5s buffer (cut lo recorta a 3.99s + fade)
];

const LANG = process.argv[2] || 'es';
const BASE = process.env.DEMO_BASE || 'http://localhost:3000/demos';
const OUT = `video/tomas-${LANG}`;
fs.mkdirSync(OUT, { recursive: true });

// Viewport = el viewport de DISEÑO de los demos (anotado en cada HTML como
// `@dsCard viewport="1280x820"`). Recording al viewport correcto hace que el
// contenido llene el frame por diseño — sin white space ni necesidad de zoom
// post. ffmpeg upscalea 2x a 2K (2560×1640) con lanczos.
const W = 1280, H = 820;
const SCALE = 2;

for (const [name, secs] of DEMOS) {
  const mp4 = `${OUT}/${name}.mp4`;
  if (fs.existsSync(mp4)) {
    console.log('↷ skip (ya existe)', mp4);
    continue;
  }
  console.log('▶', name, secs+'s');
  const ctx = await chromium.launchPersistentContext('', {
    headless: true,
    viewport: { width: W, height: H },
    deviceScaleFactor: SCALE,  // HiDPI: render a 2x para que el upscale 2x sea pixel-perfect
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', (e) => console.log('  ⚠ pageerror:', e.message.slice(0, 100)));
  await page.goto(`${BASE}/${name}.html?lang=${LANG}&embed=1`, { waitUntil: 'load' });
  await page.waitForTimeout(500);  // dejá que el JS de autoplay arranque sin caer en networkidle (flaky)
  await page.waitForTimeout(secs * 1000);
  const video = page.video();
  await ctx.close();
  const webm = await video.path();
  execSync(
    `ffmpeg -y -i "${webm}" -vf "fps=30,scale=${W*SCALE}:${H*SCALE}:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -crf 18 "${mp4}"`,
    { stdio: ['ignore', 'ignore', 'inherit'] }
  );
  fs.unlinkSync(webm);
  const sizeMB = (fs.statSync(mp4).size / 1024 / 1024).toFixed(1);
  console.log('  ✓', mp4, `(${sizeMB} MB)`);
}
console.log('\nTomas en', OUT);
