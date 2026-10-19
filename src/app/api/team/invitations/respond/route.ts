import { teamJson } from "@/lib/teamApiResponse";
import { TeamMetadataError, teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The classical invitation RPC can report an unavailable or already-terminal
 * invitation. A browser must never treat that as the action it just requested.
 */
function invitationConfirmation(value: unknown, expected: "accepted" | "declined"): Array<{ result: "accepted" | "declined" }> | null {
  if (!Array.isArray(value) || value.length !== 1 || !value[0] || typeof value[0] !== "object" || Array.isArray(value[0])) {
    throw new TeamMetadataError("Unexpected Team invitation response");
  }
  const result = (value[0] as Record<string, unknown>).result;
  if (result !== "accepted" && result !== "declined" && result !== "unavailable") {
    throw new TeamMetadataError("Unexpected Team invitation response");
  }
  return result === expected ? [{ result }] : null;
}

export async function POST(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return teamJson({ error: "Invalid response metadata" }, { status: 400 });
    }
    const record = body as Record<string, unknown>;
    // An invitation decision is metadata-only. Reject rather than silently
    // accepting extra fields so this approval route cannot become a content
    // or identity-injection transport.
    if (
      Object.keys(record).some((key) => key !== "invitationId" && key !== "accept") ||
      typeof record.invitationId !== "string" || !UUID.test(record.invitationId) ||
      typeof record.accept !== "boolean"
    ) {
      return teamJson({ error: "Invalid response metadata" }, { status: 400 });
    }
    const expected = record.accept ? "accepted" : "declined";
    const result = await teamMetadataRpc<unknown>("respond_team_invitation", {
      p_user_id: user.id,
      p_invitation_id: record.invitationId,
      p_accept: record.accept,
    });
    const confirmation = invitationConfirmation(result, expected);
    if (!confirmation) return teamJson({ error: "Invitation was not updated" }, { status: 409 });
    return teamJson(confirmation);
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not respond to invitation");
    return teamJson({ error: failure.status === 503 ? "Could not respond to invitation" : failure.error }, { status: failure.status });
  }
}
