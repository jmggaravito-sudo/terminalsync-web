import { teamJson } from "@/lib/teamApiResponse";
import { parseTeamDeliveryListQuery, safeTeamTextDeliveryList, TeamTextDeliveryInputError } from "@/lib/teamTextDelivery";
import { teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(body: unknown, init?: ResponseInit) {
  const res = teamJson(body, init);
  res.headers.set("Pragma", "no-cache");
  return res;
}

export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return response({ error: "Unauthorized" }, { status: 401 });
    const query = parseTeamDeliveryListQuery(req);
    const result = await teamMetadataRpc<unknown>("list_team_text_deliveries_v1", {
      p_user_id: user.id,
      p_thread_id: query.threadId,
      p_limit: query.limit,
      p_before_created_at: query.beforeCreatedAt,
      p_before_delivery_id: query.beforeDeliveryId,
    });
    const deliveries = safeTeamTextDeliveryList(result);
    const last = deliveries.at(-1);
    return response({
      deliveries,
      nextCursor: deliveries.length === query.limit && last
        ? { beforeCreatedAt: last.createdAt, beforeDeliveryId: last.id }
        : null,
    });
  } catch (error) {
    if (error instanceof TeamTextDeliveryInputError) return response({ error: "Invalid delivery query" }, { status: 400 });
    return response({ error: "Team deliveries are unavailable" }, { status: 503 });
  }
}
