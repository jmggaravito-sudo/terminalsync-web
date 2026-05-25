/**
 * Disabled 2026-05-25 — see migration
 *   supabase/migrations/0017_hide_auto_promoted_connectors.sql
 *
 * Background: this cron used to promote `discovery_connectors` rows
 * into `connector_listings` daily at 06:00 UTC. It populated the row
 * with `publisher_id = terminalsync-curated` and dropped the upstream
 * `creator_name` / `creator_handle` / `creator_email` on the floor.
 * Result: 525 catalog entries with zero author attribution and zero
 * license metadata. We hid all 525 in migration 0017 and pulled this
 * cron out of vercel.json.
 *
 * The route is left as a 410 endpoint so any stale call (manual,
 * external scheduler, leftover monitor) gets a clear failure with
 * the migration reference. Restore the route only after the
 * promotion pipeline carries:
 *   - original author (handle + url)
 *   - license (SPDX id) + LICENSE url
 *   - repo liveness verification before publish
 *
 * The previous implementation lives in git history at the commit
 * that introduced this kill switch.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "promote-connectors disabled — see supabase/migrations/0017_hide_auto_promoted_connectors.sql",
    },
    { status: 410 },
  );
}
