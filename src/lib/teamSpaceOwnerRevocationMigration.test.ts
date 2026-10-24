import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(join(process.cwd(), "supabase/migrations/20261024000000_team_space_owner_revocation.sql"), "utf8").toLowerCase();
const executableSql = sql.replace(/^--.*$/gm, "");

describe("Team owner shared-space revocation migration", () => {
  it("keeps owner revocation service-only and entitlement-gated", () => {
    expect(sql).toContain("function public.list_team_owned_space_invitations_v3");
    expect(sql).toContain("function public.revoke_team_space_invitation");
    expect(sql).toContain("s.owner_user_id = p_user_id");
    expect(sql).toContain("get_team_entitlement(p_user_id)");
    expect(sql).toContain("for update of i");
    expect(sql).toContain("set status = 'revoked'");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
  });

  it("projects only revocable metadata, never identities or shared content", () => {
    for (const forbidden of ["email", "content", "payload", "ciphertext", "external_ref", "description"]) {
      expect(executableSql).not.toContain(forbidden);
    }
    expect(sql).toContain("i.id, i.space_id, s.name, a.alias, i.status, i.created_at, i.responded_at");
  });
});
