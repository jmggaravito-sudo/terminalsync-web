import { teamJson } from "@/lib/teamApiResponse";
import { inputFailure, parseConversationTargetSpace, safeConversationTargets } from "@/lib/teamConversationApi";
import { teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function conversationError(error: unknown) {
  const input = inputFailure(error);
  if (input) return teamJson({ error: input.error }, { status: input.status });
  const failure = teamMetadataFailure(error, "Could not list conversation targets");
  return teamJson(
    { error: failure.status === 503 ? "Could not list conversation targets" : "Invalid conversation metadata" },
    { status: failure.status },
  );
}

/** Owner-only selector of opaque accepted relationship handles; no user IDs or emails. */
export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const spaceId = parseConversationTargetSpace(req);
    const result = await teamMetadataRpc<unknown>("list_team_conversation_targets_v3", {
      p_user_id: user.id,
      p_space_id: spaceId,
    });
    return teamJson({ targets: safeConversationTargets(result, spaceId) });
  } catch (error) {
    return conversationError(error);
  }
}
