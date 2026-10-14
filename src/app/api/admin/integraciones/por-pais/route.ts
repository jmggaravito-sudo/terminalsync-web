import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { listConnectors } from "@/lib/connectors";
import { buildIntegrationRows } from "@/lib/adminIntegrationsByCountry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/integraciones/por-pais — catálogo de conectores con sus
 * países y su estado de supervisión, leído del frontmatter de las fichas.
 * Sin red: no corre ningún smoke. Mismo gate que el resto del admin
 * (sesión + lista ADMIN_EMAILS).
 */
export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const connectors = await listConnectors("es");
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    rows: buildIntegrationRows(connectors),
  });
}
