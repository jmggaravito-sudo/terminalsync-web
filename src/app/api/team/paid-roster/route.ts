import { teamJson } from "@/lib/teamApiResponse";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { listPaidTeamRoster, TeamPaidRosterError } from "@/lib/teamPaidRoster";

export const runtime = "nodejs";

async function verifiedOwner(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  let sb;
  try { sb = getSupabaseAdmin(); } catch { throw new TeamPaidRosterError("unavailable"); }
  if (!sb) throw new TeamPaidRosterError("unavailable");
  let result;
  try { result = await sb.auth.getUser(token); } catch { throw new TeamPaidRosterError("unavailable"); }
  if (result.error) {
    const status = (result.error as { status?: number }).status;
    if (status === 400 || status === 401 || status === 403) return null;
    throw new TeamPaidRosterError("unavailable");
  }
  return result.data.user ?? null;
}

function failure(error: unknown) {
  if (!(error instanceof TeamPaidRosterError)) return teamJson({ error: "Invalid request" }, { status: 400 });
  return teamJson({ error: "Team roster is unavailable" }, { status: 503 });
}

function readOnly() {
  return teamJson(
    { error: "Team roster changes are unavailable until secure employee selection is ready" },
    { status: 405, headers: { Allow: "GET" } },
  );
}

export async function GET(req: Request) {
  try {
    const owner = await verifiedOwner(req);
    if (!owner) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const roster = await listPaidTeamRoster(owner.id);
    if (!roster.has_active_team) return teamJson({ error: "Active paid Team subscription required" }, { status: 403 });
    return teamJson(roster);
  } catch (error) { return failure(error); }
}

// Assignment and revocation intentionally remain disabled. The previous
// endpoint accepted arbitrary employee UUIDs, and there is not yet a secure
// owner-side resolver (for example, an accepted invitation or non-enumerating
// alias flow) that can safely select a Team member.
export async function POST(_req: Request) { return readOnly(); }
export async function DELETE(_req: Request) { return readOnly(); }
