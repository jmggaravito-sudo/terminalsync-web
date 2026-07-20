import { NextResponse } from "next/server";
import { aggregate, readAiSelectionRows } from "@/lib/aiSelectionSheet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ai-selection
 *
 * Live read of the AI-Selection-Events Google Sheet, re-aggregated on
 * demand for /[lang]/admin/ai-selection. The desktop app beacons one row
 * per AI-selection event (no PII) → an n8n webhook appends it to the Sheet.
 * The terminal-sync repo has a daily GH Action that writes the same numbers
 * to a markdown snapshot; this route gives JM the LIVE version on a page
 * instead of `git fetch`-ing the file once a day.
 *
 * No auth gate: matches the sibling metrics panels (trends/ops). The page
 * is robots-noindex, the numbers are aggregates only (SAFE_COLUMNS firewall
 * in aiSelectionSheet.ts), and JM is the only person who knows the URL.
 *
 * Degrades gracefully to 503 when the two envs aren't set (dev sandbox /
 * before JM adds them to Vercel).
 */
export async function GET() {
  const saKey = process.env.GOOGLE_SHEETS_SA_KEY;
  const sheetId = process.env.AI_SELECTION_SHEET_ID;
  const tab = process.env.AI_SELECTION_SHEET_TAB || "Sheet1";

  if (!saKey || !sheetId) {
    return NextResponse.json(
      {
        error: "not_configured",
        detail:
          "GOOGLE_SHEETS_SA_KEY and AI_SELECTION_SHEET_ID must be set in the environment.",
      },
      { status: 503 },
    );
  }

  try {
    const rows = await readAiSelectionRows({ sheetId, tab, saKey });
    const agg = aggregate(rows, {});
    return NextResponse.json(
      { ok: true, aggregate: agg, generatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "read_failed", detail: message }, { status: 500 });
  }
}
