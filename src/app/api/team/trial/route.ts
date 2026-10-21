import { teamJson } from "@/lib/teamApiResponse";
import { TeamMetadataError, verifiedTeamUser } from "@/lib/teamMetadata";
import { getTeamEntitlement, startTeamUniversalTrial, type TeamEntitlement } from "@/lib/teamTrial";
import { isTeamFeatureEnabled } from "@/lib/teamFeature";

export const runtime = "nodejs";

/** Copy only the four public entitlement fields at the HTTP boundary. */
function entitlementResponse(value: TeamEntitlement) {
  return {
    eligible: value.eligible,
    seat_limit: value.seat_limit,
    source: value.source,
    expires_at: value.expires_at,
  };
}

/** Authenticated trial claim. Identity is derived only from the verified
 * Supabase access token; body input is neither read nor trusted. */
export async function POST(req: Request) {
  // Preserve the established global-off response while the shared helper
  // handles the stricter allowlist gate once Team is explicitly enabled.
  if (!isTeamFeatureEnabled()) return teamJson({ error: "Team is not available yet" }, { status: 503 });
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const trial = await startTeamUniversalTrial(user.id);
    const entitlement = entitlementResponse(await getTeamEntitlement(user.id));
    return teamJson({ ...trial, entitlement }, { status: trial.result === "started" ? 201 : 200 });
  } catch (error) {
    if (!(error instanceof TeamMetadataError)) console.error("[team-trial] start failed", error);
    return teamJson({ error: "Could not start Team trial" }, { status: 503 });
  }
}

/** Return current Team entitlement without changing Pro/Max subscription state. */
export async function GET(req: Request) {
  if (!isTeamFeatureEnabled()) return teamJson({ error: "Team is not available yet" }, { status: 503 });
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    return teamJson(entitlementResponse(await getTeamEntitlement(user.id)));
  } catch (error) {
    if (!(error instanceof TeamMetadataError)) console.error("[team-trial] entitlement lookup failed", error);
    return teamJson({ error: "Could not read Team entitlement" }, { status: 503 });
  }
}
