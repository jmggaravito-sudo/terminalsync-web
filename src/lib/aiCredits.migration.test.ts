import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/0027_ai_credits.sql"),
  "utf8",
).toLowerCase().replace(/\s+/g, " ");

describe("AI credit migration privileges", () => {
  it("gives authenticated users only RLS-filtered SELECT access", () => {
    for (const table of ["ai_credit_accounts", "ai_credit_ledger"]) {
      expect(sql).toContain(
        `revoke all on table public.${table} from public, anon, authenticated;`,
      );
      expect(sql).toContain(
        `grant select on table public.${table} to authenticated;`,
      );
    }
    expect(sql).not.toMatch(
      /grant (insert|update|delete|all).*ai_credit_(accounts|ledger).*authenticated/,
    );
  });

  it("keeps the balance grant RPC exclusive to service_role", () => {
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain(
      ") from public, anon, authenticated; grant execute on function public.grant_ai_credits(",
    );
    expect(sql).toContain(
      ") to service_role;",
    );
  });
});
