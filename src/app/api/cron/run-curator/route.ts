/**
 * Disabled 2026-07-24 (decisión de JM) — teardown del marketplace
 * auto-descubierto + curación automática.
 *
 * Este cron semanal (domingos 07:00 UTC) disparaba Claude ×6 personas
 * para proponer bundles Stack Pack en `bundle_proposals`. Se sacó de
 * vercel.json para dejar de gastar tokens/recursos en una cola que no
 * se estaba revisando. Se deja como endpoint 410 para que cualquier
 * llamada residual falle claro.
 *
 * Los bundles/Stack Packs curados a mano siguen vivos (checkout Stripe
 * vía `admin/bundles` + catálogo). Lo que se apaga es SOLO la propuesta
 * automática por Claude. El fallback manual `scripts/run_curator.mjs`
 * sigue en git si alguna vez se quiere disparar a mano.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "run-curator disabled 2026-07-24 — auto-curation retired" },
    { status: 410 },
  );
}
