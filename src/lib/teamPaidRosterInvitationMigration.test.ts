import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const root = process.cwd();
const migration0038 = readFileSync(join(root, "supabase/migrations/0038_team_stripe_billing.sql"), "utf8");
const migration0045 = readFileSync(join(root, "supabase/migrations/0045_team_paid_roster.sql"), "utf8");
const migration0046 = readFileSync(join(root, "supabase/migrations/0046_team_paid_roster_api.sql"), "utf8");
const migration0052 = readFileSync(join(root, "supabase/migrations/0052_team_paid_roster_opaque_invitations.sql"), "utf8");
const owner = "00000000-0000-0000-0000-000000000001";
const employee1 = "00000000-0000-0000-0000-000000000002";
const employee2 = "00000000-0000-0000-0000-000000000003";
const outsider = "00000000-0000-0000-0000-000000000004";
const hash = (letter: string) => letter.repeat(64);

async function fixture(seats = 4) {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE TABLE public.team_memberships(user_id uuid,status text,source text,starts_at timestamptz,expires_at timestamptz);
    CREATE TABLE public.team_trial_entitlements(user_id uuid,starts_at timestamptz,expires_at timestamptz);
    INSERT INTO auth.users VALUES ('${owner}'),('${employee1}'),('${employee2}'),('${outsider}');
  `);
  await db.exec(migration0038);
  await db.exec(`
    INSERT INTO public.team_billing_subscriptions(
      stripe_subscription_id,user_id,stripe_customer_id,stripe_price_id,seat_count,status,
      current_period_start,current_period_end,cancel_at_period_end,latest_event_id,latest_event_created_at,metadata
    ) VALUES ('sub_team','${owner}','cus_team','price_team',${seats},'active',NULL,NULL,false,'evt_team',pg_catalog.now(),'{}'::jsonb);
  `);
  await db.exec(migration0045);
  await db.exec(migration0046);
  await db.exec(migration0052);
  return db;
}

describe("paid Team opaque roster invitation migration", () => {
  it("reserves capacity with a hash-only token and assigns only after authenticated acceptance", async () => {
    const db = await fixture(3);
    try {
      const create = async (tokenHash: string) => db.query<{ expires_at: string }>(
        "SELECT * FROM public.create_team_paid_roster_invitation($1::uuid,$2)", [owner, tokenHash],
      );
      const accept = async (user: string, tokenHash: string) => db.query<{ result: string }>(
        "SELECT * FROM public.accept_team_paid_roster_invitation($1::uuid,$2)", [user, tokenHash],
      );

      const first = await create(hash("a"));
      expect(first.rows[0].expires_at).toBeTruthy();
      const columns = (await db.query<{ column_name: string }>(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name='team_paid_roster_invitations'
      `)).rows.map((row) => row.column_name);
      expect(columns).toContain("token_hash");
      expect(columns).not.toContain("token");

      let snapshot = (await db.query<{ list_team_paid_roster: any }>(
        "SELECT public.list_team_paid_roster($1::uuid)", [owner],
      )).rows[0].list_team_paid_roster;
      expect(snapshot).toMatchObject({ pending_invites: 1, occupied_seats: 2, available_slots: 1 });

      expect((await accept(owner, hash("a"))).rows[0].result).toBe("unavailable");
      expect((await accept(employee1, hash("a"))).rows[0].result).toBe("accepted");
      expect((await accept(employee1, hash("a"))).rows[0].result).toBe("unavailable");
      expect((await db.query(`SELECT * FROM public.team_paid_roster_members`)).rows).toHaveLength(1);
      expect((await db.query<{ eligible: boolean }>(
        "SELECT eligible FROM public.get_team_entitlement($1::uuid)", [employee1],
      )).rows[0].eligible).toBe(true);

      await create(hash("b"));
      snapshot = (await db.query<{ list_team_paid_roster: any }>(
        "SELECT public.list_team_paid_roster($1::uuid)", [owner],
      )).rows[0].list_team_paid_roster;
      expect(snapshot).toMatchObject({ assigned_count: 1, pending_invites: 1, occupied_seats: 3, available_slots: 0 });
      await expect(create(hash("c"))).rejects.toThrow(/capacity reached/);
      expect((await accept(employee2, hash("b"))).rows[0].result).toBe("accepted");
      expect((await db.query(`SELECT * FROM public.team_paid_roster_members`)).rows).toHaveLength(2);

      await expect(db.query(
        "SELECT public.assign_team_paid_employee($1::uuid,$2::uuid)", [owner, outsider],
      )).rejects.toThrow(/direct Team roster assignment is disabled/);
    } finally { await db.close(); }
  }, 20_000);

  it("fails closed after a seat reduction, supports owner revocation, expires stale reservations, and is service-only", async () => {
    const db = await fixture(4);
    try {
      const create = async (tokenHash: string) => db.query(
        "SELECT * FROM public.create_team_paid_roster_invitation($1::uuid,$2)", [owner, tokenHash],
      );
      await create(hash("d"));
      await db.exec("UPDATE public.team_billing_subscriptions SET seat_count=1 WHERE stripe_subscription_id='sub_team'");
      const reduced = await db.query<{ result: string }>(
        "SELECT * FROM public.accept_team_paid_roster_invitation($1::uuid,$2)", [employee1, hash("d")],
      );
      expect(reduced.rows[0].result).toBe("unavailable");
      expect((await db.query(`SELECT * FROM public.team_paid_roster_members`)).rows).toHaveLength(0);

      await db.exec("UPDATE public.team_billing_subscriptions SET seat_count=2 WHERE stripe_subscription_id='sub_team'");
      const revoked = await db.query<{ result: string }>(
        "SELECT * FROM public.revoke_team_paid_roster_invitation($1::uuid,$2)", [owner, hash("d")],
      );
      expect(revoked.rows[0].result).toBe("revoked");
      await expect(create(hash("e"))).resolves.toBeTruthy();
      await db.exec(`
        UPDATE public.team_paid_roster_invitations
           SET created_at=pg_catalog.now()-interval '8 days', expires_at=pg_catalog.now()-interval '1 day'
         WHERE token_hash='${hash("e")}';
      `);
      await expect(create(hash("f"))).resolves.toBeTruthy();
      expect((await db.query<{ status: string }>(
        "SELECT status FROM public.team_paid_roster_invitations WHERE token_hash=$1", [hash("e")],
      )).rows[0].status).toBe("expired");

      expect((await db.query<{ ok: boolean }>(
        "SELECT has_function_privilege('authenticated','public.create_team_paid_roster_invitation(uuid,text)','EXECUTE') AS ok",
      )).rows[0].ok).toBe(false);
      expect((await db.query<{ ok: boolean }>(
        "SELECT has_function_privilege('authenticated','public.accept_team_paid_roster_invitation(uuid,text)','EXECUTE') AS ok",
      )).rows[0].ok).toBe(false);
      expect((await db.query<{ ok: boolean }>(
        "SELECT has_function_privilege('service_role','public.accept_team_paid_roster_invitation(uuid,text)','EXECUTE') AS ok",
      )).rows[0].ok).toBe(true);
    } finally { await db.close(); }
  }, 20_000);
});
