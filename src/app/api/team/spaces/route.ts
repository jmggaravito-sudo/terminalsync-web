import { NextResponse } from "next/server";
import { TeamMetadataError, teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SafeTeamSpace = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

/**
 * `register_team_space` and `list_team_spaces` are legacy table-shaped RPCs.
 * Project their results at the HTTP boundary so service-only owner IDs and
 * external references can never become part of the browser contract.
 */
function safeSpaces(value: unknown, expectedCount?: number): SafeTeamSpace[] {
  if (!Array.isArray(value)) throw new TeamMetadataError("Unexpected Team spaces result");
  if (expectedCount !== undefined && value.length !== expectedCount) throw new TeamMetadataError("Unexpected Team spaces result");
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new TeamMetadataError("Unexpected Team space row");
    const record = row as Record<string, unknown>;
    const { id, name, description, created_at } = record;
    if (
      typeof id !== "string" || !UUID.test(id) ||
      typeof name !== "string" || name.length === 0 || name.length > 120 ||
      (description !== null && (typeof description !== "string" || description.length > 500)) ||
      typeof created_at !== "string" || !Number.isFinite(Date.parse(created_at))
    ) {
      throw new TeamMetadataError("Unexpected Team space row");
    }
    return { id, name, description, created_at };
  });
}

export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const spaces = await teamMetadataRpc<unknown>("list_team_spaces", { p_user_id: user.id });
    return NextResponse.json(safeSpaces(spaces));
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not list spaces");
    return NextResponse.json({ error: failure.status === 503 ? "Could not list spaces" : failure.error }, { status: failure.status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    if (
      !body || typeof body.name !== "string" || body.name.length > 120 ||
      (body.description != null && (typeof body.description !== "string" || body.description.length > 500)) ||
      (body.externalRef != null && (typeof body.externalRef !== "string" || body.externalRef.length > 256))
    ) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }
    const spaces = await teamMetadataRpc<unknown>("register_team_space", {
      p_user_id: user.id,
      p_name: body.name,
      p_description: body.description ?? null,
      p_external_ref: body.externalRef ?? null,
    });
    return NextResponse.json(safeSpaces(spaces, 1), { status: 201 });
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not register space");
    return NextResponse.json({ error: failure.status === 503 ? "Could not register space" : failure.error }, { status: failure.status });
  }
}
