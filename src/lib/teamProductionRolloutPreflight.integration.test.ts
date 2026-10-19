import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const docs = readFileSync(join(process.cwd(), "docs/team-production-rollout.md"), "utf8");
const block = docs.match(/## Read-only shared-space compatibility preflight[\s\S]*?```sql\n([\s\S]*?)\n```/)?.[1];
if (!block) throw new Error("Could not find documented shared-space preflight SQL");
const checks = [...block.matchAll(/(SELECT (?:user_id, alias|alias, count\(\*\) AS duplicate_rows|space_id, invitee_user_id, count\(\*\) AS duplicate_pending_rows)[\s\S]*?;)/g)].map((m) => m[1]);

describe("documented Team production rollout preflight", () => {
  it("detects invalid/duplicate aliases and duplicate pending invitees without changing rows", async () => {
    expect(checks).toHaveLength(3);
    const db = new PGlite();
    try {
      await db.exec(`CREATE TABLE public.team_aliases(user_id uuid, alias text);
        CREATE TABLE public.team_space_invitations(space_id uuid, invitee_user_id uuid, status text);
        INSERT INTO public.team_aliases VALUES
          ('00000000-0000-0000-0000-000000000001','BadAlias'),
          ('00000000-0000-0000-0000-000000000002','dup'),
          ('00000000-0000-0000-0000-000000000003','dup');
        INSERT INTO public.team_space_invitations VALUES
          ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','pending'),
          ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','pending'),
          ('10000000-0000-0000-0000-000000000001',NULL,'pending');`);
      const before = await db.query<{ aliases: number; invitations: number }>(`SELECT (SELECT count(*)::int FROM public.team_aliases) AS aliases, (SELECT count(*)::int FROM public.team_space_invitations) AS invitations`);
      const invalid = await db.query(checks[0]);
      const duplicateAliases = await db.query(checks[1]);
      const duplicateInvitations = await db.query(checks[2]);
      expect(invalid.rows).toHaveLength(1);
      expect(duplicateAliases.rows).toHaveLength(1);
      expect(duplicateInvitations.rows).toHaveLength(1);
      const after = await db.query<{ aliases: number; invitations: number }>(`SELECT (SELECT count(*)::int FROM public.team_aliases) AS aliases, (SELECT count(*)::int FROM public.team_space_invitations) AS invitations`);
      expect(after.rows).toEqual(before.rows);
    } finally { await db.close(); }
  }, 30_000);
});
