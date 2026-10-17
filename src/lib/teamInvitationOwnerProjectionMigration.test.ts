import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql=readFileSync(join(process.cwd(),"supabase/migrations/0047_team_invitation_owner_alias_projection.sql"),"utf8");
describe("Team invitation owner alias projection migration",()=>{
 it("exposes only invitee metadata and optional public alias via service-role RPC",()=>{
  expect(sql).toContain("list_team_invitations_v2");
  expect(sql).toContain("LEFT JOIN public.team_aliases a ON a.user_id=s.owner_user_id");
  expect(sql).toContain("i.invitee_user_id=p_user_id");
  expect(sql).toContain("a.alias");
  expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.list_team_invitations_v2(uuid) TO service_role");
  expect(sql).toContain("FROM PUBLIC, anon, authenticated");
  expect(sql).not.toContain("email");
 });
});
