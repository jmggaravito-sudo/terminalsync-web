import { NextResponse } from "next/server";
import { teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";
export const runtime = "nodejs";
export async function PUT(req: Request) { try { const u=await verifiedTeamUser(req); if(!u)return NextResponse.json({error:"Unauthorized"},{status:401}); const b=await req.json(); if(!b||typeof b.alias!=="string"||b.alias.length>64)return NextResponse.json({error:"Invalid alias"},{status:400}); return NextResponse.json(await teamMetadataRpc("claim_team_alias",{p_user_id:u.id,p_alias:b.alias})); } catch(e) { const f=teamMetadataFailure(e,"Could not update alias"); return NextResponse.json({error:f.status===503?"Could not update alias":f.error},{status:f.status}); } }
