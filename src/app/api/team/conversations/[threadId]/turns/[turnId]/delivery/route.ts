import { createHash } from "node:crypto";
import { teamJson } from "@/lib/teamApiResponse";
import { readBoundedJson } from "@/lib/readBoundedJson";
import {
  MAX_TEAM_TEXT_BYTES,
  parseTeamTextDeliveryRequest,
  safeTeamTextDeliveryReceipt,
} from "@/lib/teamTextDelivery";
import { teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ threadId: string; turnId: string }> };
const BODY_LIMIT = MAX_TEAM_TEXT_BYTES * 6;
function response(body: unknown, init?: ResponseInit) {
  const res = teamJson(body, init);
  res.headers.set("Pragma", "no-cache");
  return res;
}

function uuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return response({ error: "Unauthorized" }, { status: 401 });
    const { threadId, turnId } = await params;
    if (!uuid(threadId) || !uuid(turnId) || new URL(req.url).search) return response({ error: "Invalid delivery request" }, { status: 400 });
    let parsed: ReturnType<typeof parseTeamTextDeliveryRequest>;
    try {
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get("content-type") ?? "")) throw new Error("Invalid request body");
      parsed = parseTeamTextDeliveryRequest(await readBoundedJson(req, BODY_LIMIT));
    } catch {
      return response({ error: "Invalid delivery request" }, { status: 400 });
    }
    const contentSha256 = createHash("sha256").update(parsed.content, "utf8").digest("hex");
    const result = await teamMetadataRpc<unknown>("create_team_text_delivery_v1", {
      p_user_id: user.id,
      p_thread_id: threadId,
      p_turn_id: turnId,
      p_operation_id: parsed.operationId,
      p_content: parsed.content,
      p_content_sha256: contentSha256,
    });
    return response({ delivery: safeTeamTextDeliveryReceipt(result) }, { status: 201 });
  } catch {
    return response({ error: "Team delivery is unavailable" }, { status: 503 });
  }
}
