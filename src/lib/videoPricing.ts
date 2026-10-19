/**
 * Precio de venta del video administrado, en micros de USD, decidido por el
 * SERVIDOR. Lo usa la reserva de saldo (`reserve_ai_video_funds`): el importe
 * nunca sale del cliente ni del `creditCostUsd` que repite la app.
 *
 * Es un espejo de la tabla de la app
 * (`src-tauri/src/credits/mod.rs`: costo del proveedor x2, decisión de JM).
 * Si una cambia sin la otra, el cliente verá un precio y el servidor reservará
 * otro. La app tiene una prueba que fija los mismos números
 * (`src/lib/videoServerPriceParity.test.ts` en terminal-sync) y esta tabla
 * tiene la suya: si cambias un precio, cámbialo en los dos repos en la misma
 * entrega.
 *
 * Una duración que no esté aquí no se cobra ni se envía: la reserva falla antes
 * de llegar a WaveSpeed.
 */
const PRICE_MICROS: Record<string, Record<number, number>> = {
  "ts-video-standard": { 5: 600_000, 10: 1_200_000 },
  "ltx-2.3-text-to-video": { 5: 300_000, 10: 600_000 },
  "wan-2.6-text-to-video": { 5: 1_000_000, 10: 2_000_000 },
  "vidu-q3-turbo-image-to-video": { 5: 600_000, 10: 1_200_000 },
  "vidu-q3-image-to-video": { 5: 1_500_000, 10: 3_000_000 },
  "vidu-start-end-q2-pro": { 5: 600_000, 8: 960_000 },
  "wan-2.7-reference-to-video": { 5: 2_000_000, 10: 4_000_000 },
  "seedance-2.0-video-extend": { 5: 2_500_000, 10: 5_000_000 },
  "luma-ray-3.2-video-edit": { 5: 2_200_000, 10: 4_400_000 },
};

export function videoPriceMicros(modelId: unknown, durationSeconds: unknown): number | null {
  if (typeof modelId !== "string" || typeof durationSeconds !== "number") return null;
  if (!Object.prototype.hasOwnProperty.call(PRICE_MICROS, modelId)) return null;
  const table = PRICE_MICROS[modelId];
  if (!Number.isInteger(durationSeconds) ||
      !Object.prototype.hasOwnProperty.call(table, durationSeconds)) return null;
  return table[durationSeconds];
}

export const VIDEO_PRICE_MICROS_TABLE: Readonly<Record<string, Readonly<Record<number, number>>>> = PRICE_MICROS;
