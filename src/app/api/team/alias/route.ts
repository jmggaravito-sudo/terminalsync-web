import { NextResponse } from "next/server";
import { TeamMetadataError, teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";

const TEAM_ALIAS = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;

/**
 * `claim_team_alias` currently returns only an alias, but keep the HTTP
 * contract explicit so a future RPC/table change cannot add service-only data
 * to a browser response. This mutation must confirm exactly one row.
 */
function aliasConfirmation(value: unknown): Array<{ alias: string }> {
  if (!Array.isArray(value) || value.length !== 1) {
    throw new TeamMetadataError("Unexpected Team alias result");
  }
  const row = value[0];
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new TeamMetadataError("Unexpected Team alias row");
  }
  const alias = (row as Record<string, unknown>).alias;
  if (typeof alias !== "string" || !TEAM_ALIAS.test(alias) || alias.includes("..")) {
    throw new TeamMetadataError("Unexpected Team alias row");
  }
  return [{ alias }];
}

export async function PUT(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid alias" }, { status: 400 });
    }
    const alias = (body as Record<string, unknown>).alias;
    if (typeof alias !== "string" || alias.length > 64) {
      return NextResponse.json({ error: "Invalid alias" }, { status: 400 });
    }
    const result = await teamMetadataRpc<unknown>("claim_team_alias", { p_user_id: user.id, p_alias: alias });
    return NextResponse.json(aliasConfirmation(result));
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not update alias");
    return NextResponse.json({ error: failure.status === 503 ? "Could not update alias" : failure.error }, { status: failure.status });
  }
}
