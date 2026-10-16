import { NextResponse } from "next/server";
import {
  liveSearchLote3Enabled,
  VISIBLE_LIVE_SEARCH_SOURCES,
} from "@/lib/liveSearchSources";

// El valor sale de una NEXT_PUBLIC_* que se fija en el build, así que la
// respuesta es la misma para todos los visitantes hasta el próximo deploy:
// se genera estática y la sirve el CDN.
export const dynamic = "force-static";

/**
 * Interruptor del lote 3 de la Búsqueda en vivo para la portada estática
 * (`public/landing-b/index.html`), que no puede leer env vars. La portada trae
 * las fuentes del lote 3 escritas pero ocultas y solo las muestra si esto
 * responde `lote3: true`. La portada React lee `liveSearchSources.ts` directo.
 */
export function GET() {
  return NextResponse.json({
    lote3: liveSearchLote3Enabled,
    sources: VISIBLE_LIVE_SEARCH_SOURCES.map((s) => s.name),
  });
}
