import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/0049_team_checkout_intents.sql"), "utf8");
const owner = "00000000-0000-0000-0000-000000000001";
const employee = "00000000-0000-0000-0000-000000000002";
const request = "10000000-0000-0000-0000-000000000001";

async function database() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${owner}'),('${employee}');
    CREATE TABLE public.team_memberships(user_id uuid,status text,source text,starts_at timestamptz,expires_at timestamptz);
    CREATE TABLE public.team_billing_subscriptions(stripe_subscription_id text PRIMARY KEY,user_id uuid,status text,seat_count bigint,current_period_start timestamptz,current_period_end timestamptz);
    CREATE TABLE public.team_trial_entitlements(user_id uuid,starts_at timestamptz,expires_at timestamptz);
    CREATE TABLE public.team_paid_roster_members(owner_user_id uuid,employee_user_id uuid,created_at timestamptz DEFAULT now());
    CREATE TABLE public.subscriptions(user_id uuid,plan text);`);
  await db.exec(migration);
  return db;
}

describe("Team checkout intent migration 0049", () => {
  it("keeps intents private and every RPC service-role-only", async () => {
    const db = await database();
    try {
      expect((await db.query<{rowsecurity:boolean}>(`SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename='team_checkout_intents'`)).rows[0].rowsecurity).toBe(true);
      for (const role of ["anon", "authenticated"]) {
        expect((await db.query<{ok:boolean}>(`SELECT has_table_privilege($1,'public.team_checkout_intents','SELECT') AS ok`, [role])).rows[0].ok).toBe(false);
        for (const sig of ["public.reserve_team_checkout_intent(uuid,uuid,text,bigint,text)", "public.mark_team_checkout_intent_ambiguous(uuid,text)", "public.bind_team_checkout_session(uuid,text,text)", "public.reconcile_team_checkout_intent(uuid,uuid,text,bigint,text,text,text,text,text)"]) {
          expect((await db.query<{ok:boolean}>(`SELECT has_function_privilege($1,$2,'EXECUTE') AS ok`, [role,sig])).rows[0].ok).toBe(false);
        }
      }
      expect((await db.query<{ok:boolean}>(`SELECT has_table_privilege('service_role','public.team_checkout_intents','SELECT') AS ok`)).rows[0].ok).toBe(true);
      for (const sig of ["public.reserve_team_checkout_intent(uuid,uuid,text,bigint,text)", "public.mark_team_checkout_intent_ambiguous(uuid,text)", "public.bind_team_checkout_session(uuid,text,text)", "public.reconcile_team_checkout_intent(uuid,uuid,text,bigint,text,text,text,text,text)"]) {
        expect((await db.query<{ok:boolean}>(`SELECT has_function_privilege('service_role',$1,'EXECUTE') AS ok`, [sig])).rows[0].ok).toBe(true);
      }
      await db.exec("SET ROLE authenticated");
      await expect(db.query(`SELECT * FROM public.reserve_team_checkout_intent($1::uuid,$2::uuid,'price_team123',4,'subscription')`, [owner,request])).rejects.toThrow(/permission denied/);
      await db.exec("RESET ROLE");
      const columns = (await db.query<{column_name:string}>(`SELECT column_name FROM information_schema.columns WHERE table_name='team_checkout_intents'`)).rows.map(r => r.column_name);
      for (const forbidden of ["email", "checkout_url", "payment_data", "webhook_payload", "metadata", "secret"]) expect(columns).not.toContain(forbidden);
    } finally { await db.close(); }
  }, 15_000);

  it("reserves/replays immutable terms, rejects invalid or mismatched terms, and only binds one consistent lifecycle", async () => {
    const db = await database();
    try {
      const reserve = (price = "price_team123", seats = 4, mode = "subscription", requestId = request) => db.query<any>(
        `SELECT * FROM public.reserve_team_checkout_intent($1::uuid,$2::uuid,$3::text,$4::bigint,$5::text)`, [owner,requestId,price,seats,mode]);
      const first = (await reserve()).rows[0];
      const replay = (await reserve()).rows[0];
      expect(replay.id).toBe(first.id);
      expect(replay.idempotency_key).toBe(first.idempotency_key);
      expect(replay).toMatchObject({ owner_user_id: owner, request_id: request, stripe_price_id: "price_team123", seats: 4, mode: "subscription", state: "reserved" });
      await expect(reserve("price_other")).rejects.toThrow(/terms conflict/);
      await expect(reserve("price_other", 0)).rejects.toThrow(/invalid Team checkout intent/);
      await expect(reserve("price_team123", 9007199254740992)).rejects.toThrow(/invalid Team checkout intent/);
      await expect(reserve("price_team123", 4, "payment")).rejects.toThrow(/invalid Team checkout intent/);
      await expect(reserve("bad-price")).rejects.toThrow(/invalid Team checkout intent/);
      const bind = (key: string, session: string) => db.query<{bind_team_checkout_session:string}>(`SELECT public.bind_team_checkout_session($1::uuid,$2::text,$3::text)`, [first.id,key,session]);
      expect((await bind(first.idempotency_key,"cs_team_1")).rows[0].bind_team_checkout_session).toBe("checkout_created");
      expect((await bind(first.idempotency_key,"cs_team_1")).rows[0].bind_team_checkout_session).toBe("checkout_created");
      await expect(bind("wrong-key","cs_team_1")).rejects.toThrow(/key mismatch/);
      await expect(bind(first.idempotency_key,"cs_team_2")).rejects.toThrow(/state conflict/);
      const reconcile = (key: string, session: string, sub: string | null, outcome: string, ownerId = owner, price = "price_team123", seats = 4, mode = "subscription", intentId = first.id) => db.query<{reconcile_team_checkout_intent:string}>(
        `SELECT public.reconcile_team_checkout_intent($1::uuid,$2::uuid,$3::text,$4::bigint,$5::text,$6::text,$7::text,$8::text,$9::text)`, [intentId,ownerId,price,seats,mode,key,session,sub,outcome]);
      await expect(reconcile(first.idempotency_key,"cs_wrong","sub_1","completed")).rejects.toThrow(/does not match/);
      await expect(reconcile(first.idempotency_key,"cs_team_1","sub_1","completed","00000000-0000-0000-0000-000000000002")).rejects.toThrow(/does not match/);
      await expect(reconcile(first.idempotency_key,"cs_team_1","sub_1","completed",owner,"price_wrong")).rejects.toThrow(/does not match/);
      await expect(reconcile(first.idempotency_key,"cs_team_1","sub_1","completed",owner,"price_team123",3)).rejects.toThrow(/does not match/);
      await expect(reconcile(first.idempotency_key,"cs_team_1","sub_1","completed",owner,"price_team123",4,"payment")).rejects.toThrow(/invalid Team checkout reconciliation/);
      expect((await reconcile(first.idempotency_key,"cs_team_1","sub_1","completed")).rows[0].reconcile_team_checkout_intent).toBe("completed");
      expect((await reconcile(first.idempotency_key,"cs_team_1","sub_1","completed")).rows[0].reconcile_team_checkout_intent).toBe("completed");
      await expect(reconcile(first.idempotency_key,"cs_team_1","sub_2","completed")).rejects.toThrow(/state conflict/);

      const ambiguousRequest = "10000000-0000-0000-0000-000000000002";
      const ambiguous = (await reserve("price_team123", 4, "subscription", ambiguousRequest)).rows[0];
      const markAmbiguous = () => db.query<{mark_team_checkout_intent_ambiguous:string}>(
        `SELECT public.mark_team_checkout_intent_ambiguous($1::uuid,$2::text)`, [ambiguous.id,ambiguous.idempotency_key]);
      expect((await markAmbiguous()).rows[0].mark_team_checkout_intent_ambiguous).toBe("ambiguous");
      expect((await markAmbiguous()).rows[0].mark_team_checkout_intent_ambiguous).toBe("ambiguous");
      await expect(reserve("price_team123", 4, "subscription", ambiguousRequest)).rejects.toThrow(/ambiguous; reconciliation required/);
      await expect(db.query(`SELECT public.bind_team_checkout_session($1::uuid,$2::text,'cs_retry')`, [ambiguous.id,ambiguous.idempotency_key])).rejects.toThrow(/state conflict/);
      await expect(reconcile(ambiguous.idempotency_key,"cs_verified","sub_ambiguous","completed","00000000-0000-0000-0000-000000000002","price_team123",4,"subscription",ambiguous.id)).rejects.toThrow(/does not match/);
      expect((await reconcile(ambiguous.idempotency_key,"cs_verified","sub_ambiguous","completed",owner,"price_team123",4,"subscription",ambiguous.id)).rows[0].reconcile_team_checkout_intent).toBe("completed");
      expect((await reconcile(ambiguous.idempotency_key,"cs_verified","sub_ambiguous","completed",owner,"price_team123",4,"subscription",ambiguous.id)).rows[0].reconcile_team_checkout_intent).toBe("completed");
      await expect(reconcile(ambiguous.idempotency_key,"cs_different","sub_ambiguous","completed",owner,"price_team123",4,"subscription",ambiguous.id)).rejects.toThrow(/does not match/);
      const ambiguousRow = (await db.query<{state:string;stripe_session_id:string|null;stripe_subscription_id:string|null}>(
        `SELECT state,stripe_session_id,stripe_subscription_id FROM public.team_checkout_intents WHERE id=$1::uuid`,[ambiguous.id])).rows[0];
      expect(ambiguousRow).toEqual({ state: "completed", stripe_session_id: "cs_verified", stripe_subscription_id: "sub_ambiguous" });
      await expect(db.exec(`INSERT INTO public.team_checkout_intents(owner_user_id,request_id,stripe_price_id,seats,mode,state,idempotency_key)
        VALUES ('${owner}','10000000-0000-0000-0000-000000000003','price_team123',4,'subscription','completed','invalid-lifecycle')`)).rejects.toThrow();
      await expect(db.exec(`INSERT INTO public.team_checkout_intents(owner_user_id,request_id,stripe_price_id,seats,mode,idempotency_key)
        VALUES ('${owner}','10000000-0000-0000-0000-000000000004','price_team123',9007199254740992,'subscription','invalid-seat-range')`)).rejects.toThrow();
      await expect(db.exec(`INSERT INTO public.team_checkout_intents(owner_user_id,request_id,stripe_price_id,seats,mode,idempotency_key)
        VALUES ('${owner}','10000000-0000-0000-0000-000000000005','price_team123',4,'payment','invalid-mode')`)).rejects.toThrow();
      expect((await db.query(`SELECT * FROM public.team_memberships`)).rows).toEqual([]);
      expect((await db.query(`SELECT * FROM public.team_paid_roster_members`)).rows).toEqual([]);
      expect((await db.query(`SELECT * FROM public.team_billing_subscriptions`)).rows).toEqual([]);
      expect((await db.query(`SELECT * FROM public.subscriptions`)).rows).toEqual([]);
    } finally { await db.close(); }
  });

  it("uses one canonical active subscription for owner and roster paid-capacity snapshots", async () => {
    const db = await database();
    try {
      await db.exec(`INSERT INTO public.team_billing_subscriptions VALUES
        ('sub-large','${owner}','active',3,now()-interval '1 day',now()+interval '2 days'),
        ('sub-small-later','${owner}','active',2,now()-interval '1 day',now()+interval '9 days');
        INSERT INTO public.team_paid_roster_members(owner_user_id,employee_user_id) VALUES ('${owner}','${employee}');`);
      const ownerEntitlement = (await db.query<{seat_limit:number;expires_at:string}>(`SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`,[owner])).rows[0];
      const memberEntitlement = (await db.query<{seat_limit:number;expires_at:string}>(`SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`,[employee])).rows[0];
      expect(ownerEntitlement.seat_limit).toBe(3);
      expect(memberEntitlement.seat_limit).toBe(3);
      expect(Date.parse(ownerEntitlement.expires_at)).toBeLessThan(Date.now()+3*24*60*60*1000);
      expect(Date.parse(memberEntitlement.expires_at)).toBe(Date.parse(ownerEntitlement.expires_at));
      expect(migration).toContain("ORDER BY b.seat_count DESC, b.current_period_end DESC NULLS FIRST, b.stripe_subscription_id ASC");
      expect((await db.query(`SELECT state FROM public.team_checkout_intents`)).rows).toEqual([]);
      expect((await db.query(`SELECT * FROM public.team_memberships`)).rows).toEqual([]);
      expect((await db.query(`SELECT * FROM public.team_paid_roster_members`)).rows).toHaveLength(1);
      await db.exec(`DELETE FROM public.team_billing_subscriptions;
        INSERT INTO public.team_memberships VALUES ('${owner}','active','admin_comp',now()-interval '1 day',now()+interval '1 day');
        INSERT INTO public.team_trial_entitlements VALUES ('${owner}',now()-interval '1 hour',now()+interval '6 days');`);
      const compensatedTrial = (await db.query<{eligible:boolean;seat_limit:number;source:string;expires_at:string}>(
        `SELECT * FROM public.get_team_entitlement($1::uuid)`, [owner]
      )).rows[0];
      expect(compensatedTrial).toMatchObject({ eligible: true, seat_limit: 1, source: "admin_comp" });
      expect(Date.parse(compensatedTrial.expires_at)).toBeGreaterThan(Date.now()+5*24*60*60*1000);
    } finally { await db.close(); }
  });
});
