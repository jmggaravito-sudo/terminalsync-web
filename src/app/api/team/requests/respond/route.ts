import { teamJson } from "@/lib/teamApiResponse";
import { teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";
export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RequestConfirmation = { id: string; status: "accepted" | "declined" };

/**
 * The database response includes internal request fields (for example a manifest
 * hash). The browser only needs confirmation of the requested terminal state.
 * Treat every other RPC shape as an unconfirmed, fail-closed transition.
 */
function requestConfirmation(result: unknown, requestId: string, accept: boolean): RequestConfirmation | null {
  const expectedStatus = accept ? "accepted" : "declined";
  if (!Array.isArray(result) || result.length !== 1) return null;
  const row = result[0];
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const record = row as Record<string, unknown>;
  if (record.id !== requestId || record.status !== expectedStatus) return null;
  return { id: requestId, status: expectedStatus };
}

export async function POST(req: Request) {
  try {
    const u = await verifiedTeamUser(req);
    if (!u) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return teamJson({ error: "Invalid response metadata" }, { status: 400 });
    }
    const record = body as Record<string, unknown>;
    // Legacy approvals are still consent metadata, never a browser content
    // channel. Keep their input contract as strict as the v3 approval route.
    if (
      Object.keys(record).some((key) => key !== "requestId" && key !== "accept") ||
      typeof record.requestId !== "string" || !UUID.test(record.requestId) ||
      typeof record.accept !== "boolean"
    ) {
      return teamJson({ error: "Invalid response metadata" }, { status: 400 });
    }
    const result = await teamMetadataRpc<unknown>("respond_team_space_request", {
      p_user_id: u.id,
      p_request_id: record.requestId,
      p_accept: record.accept,
    });
    const confirmation = requestConfirmation(result, record.requestId, record.accept);
    if (!confirmation) return teamJson({ error: "Request was not updated" }, { status: 409 });
    return teamJson(confirmation);
  } catch (e) {
    const f = teamMetadataFailure(e, "Could not respond to request");
    return teamJson({ error: f.status === 503 ? "Could not respond to request" : f.error }, { status: f.status });
  }
}
