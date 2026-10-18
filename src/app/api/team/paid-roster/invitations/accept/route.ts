import { NextResponse } from "next/server";
import { TeamMetadataError, verifiedTeamUser } from "@/lib/teamMetadata";
import { acceptPaidRosterInvitation, TeamPaidRosterInvitationError } from "@/lib/teamPaidRosterInvitation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const recipient = await verifiedTeamUser(req);
    if (!recipient) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid invitation" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).token !== "string") {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 400 });
    }
    const accepted = await acceptPaidRosterInvitation(recipient.id, (body as Record<string, unknown>).token);
    if (!accepted) return NextResponse.json({ error: "Invitation unavailable" }, { status: 404 });
    return NextResponse.json({ result: "accepted" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof TeamMetadataError || error instanceof TeamPaidRosterInvitationError) {
      return NextResponse.json({ error: "Team roster invitation is unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "Invalid invitation" }, { status: 400 });
  }
}
