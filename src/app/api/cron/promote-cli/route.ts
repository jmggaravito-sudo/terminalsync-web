/**
 * Disabled 2026-07-24 (decisión de JM) — teardown del marketplace
 * auto-descubierto por el scraper YT+X.
 *
 * Este cron promovía `discovery_cli_tools` (pending → cli_tool_listings)
 * a diario (06:15 UTC). Se sacó de vercel.json y el ingest del scraper
 * ahora devuelve 410, así que no queda nada que promover. Se deja como
 * endpoint 410 para que cualquier llamada residual (scheduler externo,
 * monitor viejo) falle claro en vez de re-activar la tubería.
 *
 * El catálogo real del producto es el curado file-based en
 * `content/connectors|skills|kits` (el Loop). Esta tubería NO era esa.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "promote-cli disabled 2026-07-24 — scraper marketplace retired" },
    { status: 410 },
  );
}
