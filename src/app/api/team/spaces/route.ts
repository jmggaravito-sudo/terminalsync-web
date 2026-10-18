import { teamJson } from "@/lib/teamApiResponse";
import { TeamMetadataError, teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";
import { isSafeTeamSpaceDisplayName, normalizeTeamSpaceDisplayName } from "@/lib/teamSpaceDisplayName";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SafeTeamSpace = {
  id: string;
  name: string;
  created_at: string;
};

/**
 * `register_team_space` and `list_team_spaces` are legacy table-shaped RPCs.
 * Project their results at the HTTP boundary so service-only owner IDs, legacy
 * descriptions, and external references can never become browser metadata.
 */
function safeSpaces(value: unknown, expectedCount?: number): SafeTeamSpace[] {
  if (!Array.isArray(value)) throw new TeamMetadataError("Unexpected Team spaces result");
  if (expectedCount !== undefined && value.length !== expectedCount) throw new TeamMetadataError("Unexpected Team spaces result");
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new TeamMetadataError("Unexpected Team space row");
    const record = row as Record<string, unknown>;
    const { id, name, created_at } = record;
    if (
      typeof id !== "string" || !UUID.test(id) ||
      !isSafeTeamSpaceDisplayName(name) ||
      typeof created_at !== "string" || !Number.isFinite(Date.parse(created_at))
    ) {
      throw new TeamMetadataError("Unexpected Team space row");
    }
    return { id, name, created_at };
  });
}

export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const spaces = await teamMetadataRpc<unknown>("list_team_spaces", { p_user_id: user.id });
    return teamJson(safeSpaces(spaces));
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not list spaces");
    return teamJson({ error: failure.status === 503 ? "Could not list spaces" : failure.error }, { status: failure.status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return teamJson({ error: "Invalid metadata" }, { status: 400 });
    }
    const record = body as Record<string, unknown>;
    // Descriptions and external references are legacy private columns, not
    // browser-writeable shared-space metadata. Reject them even when null so a
    // client cannot depend on an ignored content channel.
    if (Object.keys(record).some((key) => key !== "name")) {
      return teamJson({ error: "Invalid metadata" }, { status: 400 });
    }
    const name = normalizeTeamSpaceDisplayName(record.name);
    if (!name) return teamJson({ error: "Invalid metadata" }, { status: 400 });
    const spaces = await teamMetadataRpc<unknown>("register_team_space", {
      p_user_id: user.id,
      p_name: name,
      p_description: null,
      p_external_ref: null,
    });
    return teamJson(safeSpaces(spaces, 1), { status: 201 });
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not register space");
    return teamJson({ error: failure.status === 503 ? "Could not register space" : failure.error }, { status: failure.status });
  }
}
