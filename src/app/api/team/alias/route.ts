import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { teamMetadataRpc } from "@/lib/teamMetadata";
export const runtime = "nodejs";
async function user(req: Request) { const h=req.headers.get("authorization")??""; const token=h.startsWith("Bearer ")?h.slice(7).trim():""; if(!token)return null; const sb=getSupabaseAdmin(); if(!sb)return null; const {data,error}=await sb.auth.getUser(token); return error?null:data.user; }
export async function PUT(req: Request) { const u=await user(req); if(!u)return NextResponse.json({error:"Unauthorized"},{status:401}); try { const b=await req.json(); if(typeof b.alias!=="string"||b.alias.length>64)return NextResponse.json({error:"Invalid alias"},{status:400}); const data=await teamMetadataRpc("claim_team_alias",{p_user_id:u.id,p_alias:b.alias}); return NextResponse.json(data); } catch { return NextResponse.json({error:"Could not update alias"},{status:400}); } }
