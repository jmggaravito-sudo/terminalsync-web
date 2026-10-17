import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { changePaidTeamRoster, listPaidTeamRoster, TeamPaidRosterError } from "@/lib/teamPaidRoster";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (!(error instanceof TeamPaidRosterError)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const responses = {
    unavailable: ["Team roster is unavailable", 503],
    inactive: ["Active paid Team subscription required", 403],
    capacity: ["No paid Team seats available", 409],
    not_found: ["Employee account not found", 404],
    invalid: ["Invalid roster member", 400],
  } as const;
  const [message, status] = responses[error.code];
  return NextResponse.json({ error: message }, { status });
}

function invalidJson() { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

export async function GET(req: Request) {
  try {
    const owner = await verifiedOwner(req);
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const roster = await listPaidTeamRoster(owner.id);
    if (!roster.has_active_team) return NextResponse.json({ error: "Active paid Team subscription required" }, { status: 403 });
    return NextResponse.json(roster);
  } catch (error) { return failure(error); }
}

async function mutate(req: Request, action: "assign" | "revoke") {
  try {
    const owner = await verifiedOwner(req);
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let body: unknown;
    try { body = await req.json(); } catch { return invalidJson(); }
    if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).length !== 1 || typeof (body as Record<string, unknown>).employeeUserId !== "string" ||
      !UUID.test((body as Record<string, string>).employeeUserId)) return invalidJson();
    const result = await changePaidTeamRoster(action, owner.id, (body as { employeeUserId: string }).employeeUserId);
    return NextResponse.json({ result }, { status: action === "assign" && result === "assigned" ? 201 : 200 });
  } catch (error) { return failure(error); }
}

export async function POST(req: Request) { return mutate(req, "assign"); }
export async function DELETE(req: Request) { return mutate(req, "revoke"); }
