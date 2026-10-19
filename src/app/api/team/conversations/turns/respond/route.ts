import { teamJson } from "@/lib/teamApiResponse";
import { inputFailure, parseConversationResponse, respondConversationTurnConfirmation } from "@/lib/teamConversationApi";
import { teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function conversationError(error: unknown) {
  const input = inputFailure(error);
  if (input) return teamJson({ error: input.error }, { status: input.status });
  const failure = teamMetadataFailure(error, "Could not respond to conversation turn");
  return teamJson(
    { error: failure.status === 503 ? "Could not respond to conversation turn" : "Invalid conversation metadata" },
    { status: failure.status },
  );
}

/** Accepts or declines exactly one pending opaque turn; no document content moves here. */
export async function POST(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return teamJson({ error: "Invalid conversation metadata" }, { status: 400 });
    }
    const body = parseConversationResponse(raw);
    const result = await teamMetadataRpc<unknown>("respond_team_conversation_turn_v4", {
      p_user_id: user.id,
      p_turn_id: body.turnId,
      p_decision: body.decision,
      p_client_operation_id: body.operationId,
    });
    const turn = respondConversationTurnConfirmation(result, body.turnId, body.decision);
    if (!turn) return teamJson({ error: "Conversation turn was not updated" }, { status: 409 });
    return teamJson({ turn });
  } catch (error) {
    return conversationError(error);
  }
}
