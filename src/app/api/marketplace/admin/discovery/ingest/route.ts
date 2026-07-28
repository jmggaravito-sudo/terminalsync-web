/**
 * Disabled 2026-07-24 (decisión de JM) — teardown del marketplace
 * auto-descubierto por el scraper YT+X.
 *
 * Este endpoint recibía los candidatos scrapeados (connectors/skills/cli)
 * del workflow n8n y los escribía a `discovery_*`. Se apaga: la cola de
 * "muchos MCPs para aprobar" era zombie (el promotor `promote-connectors`
 * ya estaba muerto desde 2026-05-25 tras el incidente de 525 entradas sin
 * autor). Ahora devuelve 410 para que el scraper deje de escribir.
 *
 * NOTA: el workflow n8n en sí hay que pausarlo aparte (no se puede desde
 * el repo). Mientras esté activo, sus POSTs van a chocar contra este 410
 * — cero writes, pero sigue gastando la corrida del scraper hasta pausarlo.
 *
 * El catálogo real es el curado file-based (`content/`, el Loop).
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "discovery ingest disabled 2026-07-24 — scraper marketplace retired" },
    { status: 410 },
  );
}
