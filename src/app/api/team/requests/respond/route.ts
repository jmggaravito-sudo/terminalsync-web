import { NextResponse } from "next/server";
import { teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";
export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(req: Request) {
  try { const u=await verifiedTeamUser(req); if(!u)return NextResponse.json({error:"Unauthorized"},{status:401}); const b=await req.json();
    if(!b||typeof b.requestId!=="string"||!UUID.test(b.requestId)||typeof b.accept!=="boolean") return NextResponse.json({error:"Invalid response metadata"},{status:400});
    return NextResponse.json(await teamMetadataRpc("respond_team_space_request",{p_user_id:u.id,p_request_id:b.requestId,p_accept:b.accept}));
  } catch(e) { const f=teamMetadataFailure(e,"Could not respond to request"); return NextResponse.json({error:f.status===503?"Could not respond to request":f.error},{status:f.status}); }
}
