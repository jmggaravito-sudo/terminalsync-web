import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { teamMetadataRpc } from "@/lib/teamMetadata";
export const runtime = "nodejs";
async function user(req: Request) { const h=req.headers.get("authorization")??""; const token=h.startsWith("Bearer ")?h.slice(7).trim():""; if(!token)return null; const sb=getSupabaseAdmin(); if(!sb)return null; const {data,error}=await sb.auth.getUser(token); return error?null:data.user; }
export async function GET(req: Request) { const u=await user(req); if(!u)return NextResponse.json({error:"Unauthorized"},{status:401}); try { return NextResponse.json(await teamMetadataRpc("list_team_invitations",{p_user_id:u.id})); } catch { return NextResponse.json({error:"Could not list invitations"},{status:503}); } }
export async function POST(req: Request) { const u=await user(req); if(!u)return NextResponse.json({error:"Unauthorized"},{status:401}); try { const b=await req.json(); if(typeof b.spaceId!=="string"||typeof b.alias!=="string"||b.alias.length>64)return NextResponse.json({error:"Invalid invitation metadata"},{status:400}); const data=await teamMetadataRpc("invite_team_alias",{p_user_id:u.id,p_space_id:b.spaceId,p_alias:b.alias}); return NextResponse.json(data); } catch { return NextResponse.json({error:"Could not create invitation"},{status:400}); } }
