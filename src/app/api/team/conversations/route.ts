import { teamJson } from "@/lib/teamApiResponse";
import {
  createConversationTurnConfirmation,
  inputFailure,
  parseConversationCursor,
  parseInitialConversationTurn,
  safeConversationThreads,
} from "@/lib/teamConversationApi";
import { teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function conversationError(error: unknown, fallback: string) {
  const input = inputFailure(error);
  if (input) return teamJson({ error: input.error }, { status: input.status });
  const failure = teamMetadataFailure(error, fallback);
  return teamJson(
    { error: failure.status === 503 ? fallback : "Invalid conversation metadata" },
    { status: failure.status },
  );
}

/** Lists only the caller's opaque conversation-thread handles. */
export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const cursor = parseConversationCursor(req);
    const result = await teamMetadataRpc<unknown>("list_team_conversation_threads_v3", {
      p_user_id: user.id,
      p_limit: cursor.limit,
      p_before_activity_at: cursor.beforeActivityAt,
      p_before_thread_id: cursor.beforeThreadId,
    });
    const threads = safeConversationThreads(result);
    const last = threads.at(-1);
    return teamJson({
      threads,
      nextCursor: threads.length === cursor.limit && last
        ? { beforeActivityAt: last.last_activity_at, beforeThreadId: last.thread_id }
        : null,
    });
  } catch (error) {
    return conversationError(error, "Could not list conversations");
  }
}

/** Starts a new approval-gated metadata turn for an accepted shared-space pair. */
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
    const body = parseInitialConversationTurn(raw);
    const result = await teamMetadataRpc<unknown>("create_team_space_conversation_turn_v4", {
      p_user_id: user.id,
      p_space_id: body.spaceId,
      p_relationship_id: body.relationshipId,
      p_request_kind: body.kind,
      p_manifest_hash: body.manifestHash,
      p_metadata: body.metadata,
      p_client_operation_id: body.operationId,
    });
    const turn = createConversationTurnConfirmation(result);
    if (!turn) return teamJson({ error: "Conversation turn was not created" }, { status: 409 });
    return teamJson({ turn });
  } catch (error) {
    return conversationError(error, "Could not create conversation turn");
  }
}
