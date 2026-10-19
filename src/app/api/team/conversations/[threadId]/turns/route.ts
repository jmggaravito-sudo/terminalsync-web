import { teamJson } from "@/lib/teamApiResponse";
import {
  createConversationTurnConfirmation,
  inputFailure,
  parseConversationThreadId,
  parseConversationTurnCursor,
  parseFollowUpConversationTurn,
  safeConversationTurns,
} from "@/lib/teamConversationApi";
import { TeamMetadataError, teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ threadId: string }> };

function conversationError(error: unknown, fallback: string) {
  const input = inputFailure(error);
  if (input) return teamJson({ error: input.error }, { status: input.status });
  const failure = teamMetadataFailure(error, fallback);
  return teamJson(
    { error: failure.status === 503 ? fallback : "Invalid conversation metadata" },
    { status: failure.status },
  );
}

/** Lists a caller-authorized thread page using only its opaque thread handle. */
export async function GET(req: Request, { params }: Params) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const { threadId: rawThreadId } = await params;
    const threadId = parseConversationThreadId(rawThreadId);
    const cursor = parseConversationTurnCursor(req);
    const result = await teamMetadataRpc<unknown>("list_team_conversation_turns_v4", {
      p_user_id: user.id,
      p_thread_id: threadId,
      p_limit: cursor.limit,
      p_before_created_at: cursor.beforeCreatedAt,
      p_before_turn_id: cursor.beforeTurnId,
    });
    const turns = safeConversationTurns(result);
    if (turns.some((turn) => turn.thread_id !== threadId)) {
      throw new TeamMetadataError("Unexpected Team conversation turn");
    }
    const last = turns.at(-1);
    return teamJson({
      turns,
      nextCursor: turns.length === cursor.limit && last
        ? { beforeCreatedAt: last.created_at, beforeTurnId: last.id }
        : null,
    });
  } catch (error) {
    return conversationError(error, "Could not list conversation turns");
  }
}

/** Adds a follow-up metadata turn after the database revalidates the pair. */
export async function POST(req: Request, { params }: Params) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const { threadId: rawThreadId } = await params;
    const threadId = parseConversationThreadId(rawThreadId);
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return teamJson({ error: "Invalid conversation metadata" }, { status: 400 });
    }
    const body = parseFollowUpConversationTurn(raw);
    const result = await teamMetadataRpc<unknown>("create_team_conversation_turn_v4", {
      p_user_id: user.id,
      p_thread_id: threadId,
      p_request_kind: body.kind,
      p_manifest_hash: body.manifestHash,
      p_metadata: body.metadata,
      p_client_operation_id: body.operationId,
    });
    const turn = createConversationTurnConfirmation(result);
    if (!turn || turn.thread_id !== threadId) {
      return teamJson({ error: "Conversation turn was not created" }, { status: 409 });
    }
    return teamJson({ turn });
  } catch (error) {
    return conversationError(error, "Could not create conversation turn");
  }
}
