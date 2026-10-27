import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hasTeamUserAccessGate, isTeamFeatureEnabled, isTeamUserAllowed } from "@/lib/teamFeature";

export class TeamMetadataError extends Error {}
export async function verifiedTeamUser(req: Request) {
  // Keep every API that authenticates through this shared helper unavailable
  // while Team is disabled, before even validating a bearer token or touching
  // Supabase. Route handlers translate this service error to a fail-closed 503.
  if (!isTeamFeatureEnabled()) throw new TeamMetadataError("Team is not available yet");
  // A missing or malformed rollout configuration must deny access before
  // consulting Auth. General rollout requires its own exact server-only flag;
  // otherwise only the controlled two-account smoke list is accepted.
  if (!hasTeamUserAccessGate()) throw new TeamMetadataError("Team access gate is unavailable");
  const h=req.headers.get("authorization")??"";
  const token=h.startsWith("Bearer ")?h.slice(7).trim():"";
  if(!token)return null;
  let sb;
  try { sb=getSupabaseAdmin(); } catch { throw new TeamMetadataError("Auth service unavailable"); }
  if(!sb)throw new TeamMetadataError("Auth service unavailable");
  let result;
  try { result=await sb.auth.getUser(token); } catch { throw new TeamMetadataError("Auth service unavailable"); }
  if(result.error) {
    const status=(result.error as {status?:number}).status;
    if(status===400||status===401||status===403)return null;
    throw new TeamMetadataError("Auth service unavailable");
  }
  const user = result.data.user ?? null;
  if (!user) return null;
  // user.id came from Supabase's verified bearer lookup above. Never trust a
  // caller-supplied identity when deciding whether this rollout may use Team.
  if (!isTeamUserAllowed(user.id)) throw new TeamMetadataError("Team access is unavailable");
  return user;
}
export async function teamMetadataRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  let sb; try { sb = getSupabaseAdmin(); } catch { throw new TeamMetadataError("Team metadata database unavailable"); }
  if (!sb) throw new TeamMetadataError("Team metadata database unavailable");
  let result; try { result=await sb.rpc(name,args); } catch { throw new TeamMetadataError("Team metadata database unavailable"); }
  const { data, error } = result;
  if (error) throw new TeamMetadataError("Team metadata operation failed");
  return data as T;
}
export function teamMetadataFailure(error: unknown, fallback: string) {
  return { error: error instanceof TeamMetadataError ? fallback : "Invalid request", status: error instanceof TeamMetadataError ? 503 : 400 };
}
