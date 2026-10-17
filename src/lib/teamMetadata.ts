import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export class TeamMetadataError extends Error {}
export async function verifiedTeamUser(req: Request) {
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
  return result.data.user??null;
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
