import { teamJson } from "@/lib/teamApiResponse";
import { TeamMetadataError, verifiedTeamUser } from "@/lib/teamMetadata";
import { acceptPaidRosterInvitation, TeamPaidRosterInvitationError } from "@/lib/teamPaidRosterInvitation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const recipient = await verifiedTeamUser(req);
    if (!recipient) return teamJson({ error: "Unauthorized" }, { status: 401 });
    let body: unknown;
    try { body = await req.json(); } catch { return teamJson({ error: "Invalid invitation" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).token !== "string") {
      return teamJson({ error: "Invalid invitation" }, { status: 400 });
    }
    const accepted = await acceptPaidRosterInvitation(recipient.id, (body as Record<string, unknown>).token);
    if (!accepted) return teamJson({ error: "Invitation unavailable" }, { status: 404 });
    return teamJson({ result: "accepted" });
  } catch (error) {
    if (error instanceof TeamMetadataError || error instanceof TeamPaidRosterInvitationError) {
      return teamJson({ error: "Team roster invitation is unavailable" }, { status: 503 });
    }
    return teamJson({ error: "Invalid invitation" }, { status: 400 });
  }
}
