import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
try {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
  await db.exec(await readFile(new URL("../supabase/migrations/20261112205207_voice_studio_service_agreement_and_quote_requests.sql", import.meta.url), "utf8"));
  for (const role of ["anon", "authenticated"]) {
    for (const table of ["voice_studio_service_acceptances", "voice_studio_quote_requests"]) {
      const { rows: [p] } = await db.query("select has_table_privilege($1,$2,'select') as read, has_table_privilege($1,$2,'insert') as write", [role, table]);
      assert.equal(p.read || p.write, false);
    }
  }
  await db.exec("set role service_role");
  const account = "00000000-0000-4000-8000-000000000001";
  const request = "00000000-0000-4000-8000-000000000002";
  const insert = `insert into voice_studio_quote_requests (account_id,email,request_id,request_fingerprint,agreement_version,rights_confirmed,items,estimated_cents)
    values ($1,'buyer@example.test',$2,repeat('a',64),'v1',true,'[{}]',815)`;
  await assert.rejects(db.query(insert, [account, request]), { code: "23503" });
  await db.query("insert into voice_studio_service_acceptances (account_id,agreement_version,agreement_url) values ($1,'v1','https://example.test/v1')", [account]);
  await db.query(insert, [account, request]);
  await assert.rejects(db.query(insert, [account, request]), { code: "23505" });
  await db.exec("update voice_studio_quote_requests set status='reviewed'");
  await assert.rejects(db.exec("update voice_studio_quote_requests set estimated_cents=1"), { code: "42501" });
  console.log("Quote intake SQL: browser isolation, agreement FK, idempotency and staff update scope verified.");
} finally { await db.close(); }
