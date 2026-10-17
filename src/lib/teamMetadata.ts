import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export class TeamMetadataError extends Error {}
export async function teamMetadataRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamMetadataError("Team metadata database unavailable");
  const { data, error } = await sb.rpc(name, args);
  if (error) throw new TeamMetadataError(error.message);
  return data as T;
}
