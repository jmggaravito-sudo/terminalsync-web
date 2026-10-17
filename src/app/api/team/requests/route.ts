import { NextResponse } from "next/server";
import { teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";
export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(req: Request) {
  try { const u=await verifiedTeamUser(req); if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});
    return NextResponse.json(await teamMetadataRpc("list_team_space_requests",{p_user_id:u.id}));
  } catch(e) { const f=teamMetadataFailure(e,"Could not list requests"); return NextResponse.json({error:f.status===503?"Could not list requests":f.error},{status:f.status}); }
}
export async function POST(req: Request) {
  try { const u=await verifiedTeamUser(req); if(!u)return NextResponse.json({error:"Unauthorized"},{status:401}); const b=await req.json();
    const meta=b?.metadata??{};
    if(!b||typeof b.spaceId!=="string"||!UUID.test(b.spaceId)||!['document','context'].includes(b.kind)||typeof b.manifestHash!=="string"||! /^[0-9a-f]{64}$/.test(b.manifestHash)||
       !meta||typeof meta!=="object"||Array.isArray(meta)||new TextEncoder().encode(JSON.stringify(meta)).length>2048||Object.keys(meta).some(k=>!['label','category','itemCount'].includes(k))||
       ["label","category"].some(k=>meta[k]!==undefined&&(typeof meta[k]!=="string"||meta[k].length>120))||meta.itemCount!==undefined&&(typeof meta.itemCount!=="number"||!Number.isInteger(meta.itemCount)||meta.itemCount<0||meta.itemCount>1000000)) return NextResponse.json({error:"Invalid request metadata"},{status:400});
    return NextResponse.json(await teamMetadataRpc("create_team_space_request",{p_user_id:u.id,p_space_id:b.spaceId,p_request_kind:b.kind,p_manifest_hash:b.manifestHash,p_metadata:meta}));
  } catch(e) { const f=teamMetadataFailure(e,"Could not create request"); return NextResponse.json({error:f.status===503?"Could not create request":f.error},{status:f.status}); }
}
