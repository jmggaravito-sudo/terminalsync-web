// Synthetic PostgreSQL execution: no production credentials, network or Stripe.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const { PGlite } = createRequire(import.meta.url)("@electric-sql/pglite");
const db = new PGlite();
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const migration = new URL(
  "../supabase/migrations/20261110155236_voice_studio_production_orders.sql",
  import.meta.url,
);
const email = "customer@example.test";
const secondEmail = "other@example.test";
const demo = { source_url: "https://www.youtube.com/watch?v=abcdefghijk" };
const opening = { source_url: "https://youtu.be/12345678901", short_mode: "timestamp", short_timestamp: "01:24", notes: "Use the opening." };
const videoUrl = "https://media.example.test/video.mp4";
const shortUrl = "https://media.example.test/short.mp4";

async function grantPlan(owner, sku, range = "active") {
  const caps = { trial: [1, 0], single: [1, 0], pack4: [4, 4], pack8: [8, 8] }[sku];
  const [start, end] = {
    active: ["-1 day", caps[1] ? "1 day" : null],
    future: ["1 day", "2 days"],
    expired: ["-2 days", "-1 day"],
  }[range];
  const [row] = await query(
    `insert into public.voice_studio_entitlements (email, source_id, sku, starts_at, ends_at, video_total, short_total)
       values ($1, $2, $3, now() + $4::interval, now() + $5::interval, $6, $7) returning id`,
    [owner, randomUUID(), sku, start, end, ...caps],
  );
  return row.id;
}

const submit = (owner, plan, items, request = randomUUID()) =>
  query("select * from public.voice_studio_submit_orders($1, $2, $3, $4::jsonb)",
    [owner, plan, request, JSON.stringify(items)]);
const update = (id, status, units, video = null, short = null) =>
  query("select * from public.voice_studio_update_order($1, $2, $3, $4, $5)",
    [id, status, video, short, units]);
const used = async id => (await query(
  "select video_used, short_used from public.voice_studio_entitlements where id = $1", [id],
))[0];
const expectError = (result, message) => assert.rejects(result, { code: "P0001", message });

try {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
  await db.exec(readFileSync(migration, "utf8"));

  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    await assert.rejects(query("select * from public.voice_studio_entitlements"), { code: "42501" });
    await assert.rejects(query("select * from public.voice_studio_production_orders"), { code: "42501" });
    await assert.rejects(submit(email, randomUUID(), [demo]), { code: "42501" });
    await assert.rejects(update(randomUUID(), "delivered", 1, videoUrl, shortUrl), { code: "42501" });
    await db.exec("reset role");
  }
  console.log("PASS anonymous and authenticated browser roles cannot read or mutate");

  await db.exec("set role service_role");
  const pack = await grantPlan(email, "pack4");
  const secondPack = await grantPlan(email, "pack8");
  const single = await grantPlan(email, "single");
  const trial = await grantPlan(secondEmail, "trial");
  const future = await grantPlan(email, "pack4", "future");
  const expired = await grantPlan(email, "pack4", "expired");

  await expectError(submit(secondEmail, pack, [demo]), "VOICE_STUDIO_NO_ACTIVE_PLAN");
  await expectError(submit(email, future, [demo]), "VOICE_STUDIO_NO_ACTIVE_PLAN");
  await expectError(submit(email, expired, [demo]), "VOICE_STUDIO_NO_ACTIVE_PLAN");
  await expectError(submit(email, single, [opening]), "VOICE_STUDIO_SHORT_NOT_INCLUDED");
  await expectError(submit(email, single, [{ ...demo, video_units: 3 }]), "VOICE_STUDIO_INVALID_ORDER");
  await expectError(submit(email, single, [null]), "VOICE_STUDIO_INVALID_ORDER");
  console.log("PASS paid ownership, active billing period and plan capability gates");

  const firstRequest = randomUUID();
  const firstRows = await submit(" CUSTOMER@EXAMPLE.TEST ", pack, [demo, opening], firstRequest);
  assert.deepEqual(firstRows.map(row => row.short_mode), ["best_moment", "timestamp"]);
  assert.equal(firstRows[1].short_timestamp, "01:24");
  assert.equal(firstRows[0].status, "queued");
  assert.equal(firstRows[0].video_units, 1);
  assert.deepEqual(await used(pack), { video_used: 2, short_used: 2 });
  assert.deepEqual((await submit(email, pack, [demo, opening], firstRequest)).map(row => row.id),
    firstRows.map(row => row.id));
  assert.deepEqual(await used(pack), { video_used: 2, short_used: 2 });
  await expectError(submit(email, secondPack, [demo, opening], firstRequest),
    "VOICE_STUDIO_IDEMPOTENCY_CONFLICT");
  await expectError(submit(email, pack, [demo, { ...opening, notes: "different" }], firstRequest),
    "VOICE_STUDIO_IDEMPOTENCY_CONFLICT");
  assert.equal((await submit(secondEmail, trial, [demo], firstRequest))[0].short_mode, "none");
  console.log("PASS default included shorts, requested timestamp and email-scoped idempotency");

  await expectError(submit(email, pack, [demo, { ...opening, short_timestamp: "0:99" }]),
    "VOICE_STUDIO_INVALID_ORDER");
  await expectError(submit(email, pack, [demo, demo, demo]), "VOICE_STUDIO_INSUFFICIENT_CREDITS");
  assert.deepEqual(await used(pack), { video_used: 2, short_used: 2 });
  assert.equal((await query(
    "select count(*)::int as count from public.voice_studio_production_orders where entitlement_id = $1", [pack],
  ))[0].count, 2);
  console.log("PASS invalid later input and over-limit batches are atomic");

  const [first, second] = firstRows;
  await expectError(update(first.id, "delivered", 1, videoUrl), "VOICE_STUDIO_MISSING_DELIVERABLE");
  await expectError(update(first.id, "delivered", 1, "javascript:alert(1)", shortUrl), "VOICE_STUDIO_INVALID_ORDER");
  assert.equal((await update(first.id, "in_progress", 3))[0].video_units, 3);
  assert.deepEqual(await used(pack), { video_used: 4, short_used: 2 });
  await expectError(submit(email, pack, [demo]), "VOICE_STUDIO_INSUFFICIENT_CREDITS");
  await expectError(update(second.id, "in_progress", 2), "VOICE_STUDIO_INSUFFICIENT_CREDITS");
  await expectError(update(first.id, "queued", 3), "VOICE_STUDIO_INVALID_TRANSITION");
  await update(first.id, "in_progress", 2);
  assert.deepEqual(await used(pack), { video_used: 3, short_used: 2 });
  await update(first.id, "delivered", 2, videoUrl, shortUrl);
  assert.equal((await update(first.id, "delivered", 2, "https://example.test/new.mp4", shortUrl))[0].status,
    "delivered");
  await expectError(update(first.id, "delivered", 1, videoUrl, shortUrl), "VOICE_STUDIO_INVALID_TRANSITION");
  await expectError(update(first.id, "in_progress", 2, videoUrl, shortUrl), "VOICE_STUDIO_INVALID_TRANSITION");
  const [singleOrder] = await submit(email, single, [demo]);
  await expectError(update(singleOrder.id, "delivered", 1, videoUrl, shortUrl), "VOICE_STUDIO_SHORT_NOT_INCLUDED");
  assert.equal((await update(singleOrder.id, "delivered", 1, videoUrl))[0].status, "delivered");
  console.log("PASS long-video adjustments, required delivery links and final-state protections");

  await query("update public.voice_studio_entitlements set starts_at = now() - interval '3 days', ends_at = now() - interval '1 day' where id = $1", [pack]);
  assert.deepEqual((await submit(email, pack, [demo, opening], firstRequest)).map(row => row.id),
    firstRows.map(row => row.id));
  await expectError(submit(email, pack, [demo]), "VOICE_STUDIO_NO_ACTIVE_PLAN");
  assert.deepEqual(await used(pack), { video_used: 3, short_used: 2 });
  console.log("PASS safe idempotent retry after a billing period ends");
} finally {
  await db.close();
}
