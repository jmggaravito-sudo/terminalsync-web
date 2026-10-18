import { NextResponse } from "next/server";
import { TeamMetadataError, verifiedTeamUser } from "@/lib/teamMetadata";
import {
  createPaidRosterInvitation,
  revokePaidRosterInvitation,
  TeamPaidRosterInvitationError,
} from "@/lib/teamPaidRosterInvitation";

export const runtime = "nodejs";

function unavailable() {
  return NextResponse.json({ error: "Team roster invitation is unavailable" }, { status: 503 });
}

function invalid() {
  return NextResponse.json({ error: "Invalid invitation" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const owner = await verifiedTeamUser(req);
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // There is deliberately no recipient field. The server mints a capability
    // and the recipient is bound only by their authenticated acceptance.
    const invitation = await createPaidRosterInvitation(owner.id);
    return NextResponse.json(
      { invitationToken: invitation.token, expiresAt: invitation.expiresAt },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof TeamMetadataError || error instanceof TeamPaidRosterInvitationError) return unavailable();
    return invalid();
  }
}

export async function DELETE(req: Request) {
  try {
    const owner = await verifiedTeamUser(req);
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let body: unknown;
    try { body = await req.json(); } catch { return invalid(); }
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).token !== "string") return invalid();
    const revoked = await revokePaidRosterInvitation(owner.id, (body as Record<string, unknown>).token);
    if (!revoked) return NextResponse.json({ error: "Invitation unavailable" }, { status: 404 });
    return NextResponse.json({ result: "revoked" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof TeamMetadataError || error instanceof TeamPaidRosterInvitationError) return unavailable();
    return invalid();
  }
}
