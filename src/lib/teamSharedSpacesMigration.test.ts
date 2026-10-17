import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(join(process.cwd(), "supabase/migrations/0039_team_shared_spaces_metadata.sql"), "utf8")
  .toLowerCase().replace(/--[^\n]*/g, "").replace(/\s+/g, " ");

describe("Team shared spaces metadata migration contract", () => {
  it("creates only bounded metadata and hash fields", () => {
    for (const table of ["team_aliases", "team_shared_spaces", "team_space_invitations", "team_space_requests", "team_space_proposals"])
      expect(sql).toContain(`create table public.${table}`);
    expect(sql).toContain("invitee_email_hash text");
    expect(sql).toContain("manifest_hash text");
    expect(sql).toContain("proposal_hash text not null");
    expect(sql).not.toMatch(/\b(ciphertext|decrypt|document_payload|file_bytes|content_payload)\b/);
    expect(sql).not.toContain("'approved'");
    expect(sql).not.toContain("'delivered'");
    expect(sql).not.toContain("'imported'");
  });

  it("keeps all tables inaccessible to clients and enables RLS", () => {
    expect((sql.match(/enable row level security/g) ?? []).length).toBe(5);
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("revoke all on function public.team_shared_spaces_eligible(uuid) from public, anon, authenticated");
  });

  it("derives eligibility from active, unexpired Team membership, not base plan", () => {
    const body = sql.match(/create or replace function public\.team_shared_spaces_eligible\(p_user_id uuid\)[\s\S]*?as \$\$[\s\S]*?\$\$;/)?.[0];
    expect(body).toContain("public.team_memberships");
    expect(body).toContain("m.status = 'active'");
    expect(body).toContain("m.expires_at > now()");
    expect(body).not.toContain("public.subscriptions");
  });
});
