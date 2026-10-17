import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getTeamEntitlement, startTeamUniversalTrial, TeamTrialServiceError } from "@/lib/teamTrial";

export const runtime = "nodejs";

async function authenticatedUser(req: Request) {
  const bearer = req.headers.get("authorization") ?? "";
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : "";
  if (!token) return null;
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamTrialServiceError("Team trial database is unavailable");
  const { data, error } = await sb.auth.getUser(token);
  return error || !data.user ? null : data.user;
}

/** Authenticated trial claim. Identity is derived only from the verified
 * Supabase access token; body input is neither read nor trusted. */
export async function POST(req: Request) {
  try {
    const user = await authenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const trial = await startTeamUniversalTrial(user.id);
    const entitlement = await getTeamEntitlement(user.id);
    return NextResponse.json({ ...trial, entitlement }, { status: trial.result === "started" ? 201 : 200 });
  } catch (error) {
    console.error("[team-trial] start failed", error);
    return NextResponse.json({ error: "Could not start Team trial" }, { status: 503 });
  }
}

/** Return current Team entitlement without changing Pro/Max subscription state. */
export async function GET(req: Request) {
  try {
    const user = await authenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await getTeamEntitlement(user.id));
  } catch (error) {
    console.error("[team-trial] entitlement lookup failed", error);
    return NextResponse.json({ error: "Could not read Team entitlement" }, { status: 503 });
  }
}
