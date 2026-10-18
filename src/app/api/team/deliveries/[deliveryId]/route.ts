import { teamJson } from "@/lib/teamApiResponse";
import { parseTeamDeliveryId, safeTeamTextDelivery } from "@/lib/teamTextDelivery";
import { teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ deliveryId: string }> };
function response(body: unknown, init?: ResponseInit) {
  const res = teamJson(body, init);
  res.headers.set("Pragma", "no-cache");
  return res;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return response({ error: "Unauthorized" }, { status: 401 });
    if (new URL(req.url).search) return response({ error: "Delivery unavailable" }, { status: 404 });
    let deliveryId: string;
    try {
      deliveryId = parseTeamDeliveryId((await params).deliveryId);
    } catch {
      return response({ error: "Delivery unavailable" }, { status: 404 });
    }
    const result = await teamMetadataRpc<unknown>("read_team_text_delivery_v1", {
      p_user_id: user.id,
      p_delivery_id: deliveryId,
    });
    const delivery = safeTeamTextDelivery(result);
    if (!delivery) return response({ error: "Delivery unavailable" }, { status: 404 });
    return response({ delivery });
  } catch {
    return response({ error: "Team delivery is unavailable" }, { status: 503 });
  }
}
