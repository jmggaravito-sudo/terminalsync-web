import { teamJson } from "@/lib/teamApiResponse";
import { TeamMetadataError, verifiedTeamUser } from "@/lib/teamMetadata";
import {
  createPaidRosterInvitation,
  revokePaidRosterInvitation,
  TeamPaidRosterInvitationError,
} from "@/lib/teamPaidRosterInvitation";

export const runtime = "nodejs";

function unavailable() {
  return teamJson({ error: "Team roster invitation is unavailable" }, { status: 503 });
}

function invalid() {
  return teamJson({ error: "Invalid invitation" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const owner = await verifiedTeamUser(req);
    if (!owner) return teamJson({ error: "Unauthorized" }, { status: 401 });
    // There is deliberately no recipient field. The server mints a capability
    // and the recipient is bound only by their authenticated acceptance.
    const invitation = await createPaidRosterInvitation(owner.id);
    return teamJson(
      { invitationToken: invitation.token, expiresAt: invitation.expiresAt },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof TeamMetadataError || error instanceof TeamPaidRosterInvitationError) return unavailable();
    return invalid();
  }
}

export async function DELETE(req: Request) {
  try {
    const owner = await verifiedTeamUser(req);
    if (!owner) return teamJson({ error: "Unauthorized" }, { status: 401 });
    let body: unknown;
    try { body = await req.json(); } catch { return invalid(); }
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).token !== "string") return invalid();
    const revoked = await revokePaidRosterInvitation(owner.id, (body as Record<string, unknown>).token);
    if (!revoked) return teamJson({ error: "Invitation unavailable" }, { status: 404 });
    return teamJson({ result: "revoked" });
  } catch (error) {
    if (error instanceof TeamMetadataError || error instanceof TeamPaidRosterInvitationError) return unavailable();
    return invalid();
  }
}
