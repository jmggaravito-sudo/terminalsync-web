import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { localMigrationVersions, validateProductionHistoryManifest } from "./check-supabase-history-manifest.mjs";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "supabase", "migration-history", "production-history-manifest.json"), "utf8"));
const expectedRows = [
  ["20260907214658", "agency_influencers_profile_url"],
  ["20260921114605", "0019_subscription_ai_entitlement"],
  ["20260921114611", "courtesy_tier_reads_subscription_ai_marker"],
  ["20260921124719", "0032_comp_included_ai"],
  ["20260921183710", "proxy_003_ai_usage"],
  ["20260921183713", "proxy_005_connector_requests"],
  ["20260921183832", "proxy_004_ai_usage_upstream"],
  ["20261006204704", "proxy_006_search_usage"],
  ["20261017190938", "ai_credit_debits"],
  ["20261018163004", "0057_ai_credit_refunds"],
];

describe("Supabase remote migration-history source guard", () => {
  it("records exactly the reviewed remote rows without asserting local SQL equivalence", () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.entries.map(({ version, remoteName }) => [version, remoteName])).toEqual(expectedRows);
    expect(manifest.entries.every((entry) => entry.status === "unverified")).toBe(true);
    expect(manifest.entries.every((entry) => entry.sqlEquivalence === "not-established")).toBe(true);
    expect(manifest.entries.every((entry) => entry.origin === "remote-migration-history-metadata")).toBe(true);
  });

  it("passes only while no observed remote timestamp is represented by a local source file", () => {
    const files = readdirSync(join(root, "supabase", "migrations"));
    expect(validateProductionHistoryManifest(manifest, files)).toEqual([]);
    expect(localMigrationVersions(files).has("20261018163004")).toBe(false);
  });

  it("fails closed if a matching timestamp is added before provenance is independently reviewed", () => {
    const files = ["20261018163004_0057_ai_credit_refunds.sql"];
    expect(validateProductionHistoryManifest(manifest, files)).toContain(
      "entries[9].version is present in supabase/migrations; recover and independently review provenance before changing this guard",
    );
  });

  it("keeps name-only candidates from silently becoming SQL-equivalence claims", () => {
    const altered = structuredClone(manifest);
    altered.entries[3].candidate.basis = "same name means same SQL";

    expect(validateProductionHistoryManifest(altered)).toContain(
      "entries[3].candidate.basis must state that a name-only match is not SQL-equivalence evidence",
    );
  });

  it("rejects reconciliation fields and status changes even when an exact timestamped file exists", () => {
    const altered = structuredClone(manifest);
    altered.entries[0].status = "reconciled";
    altered.entries[0].sqlEquivalence = "verified-by-evidence";
    altered.entries[0].reconciliation = {
      sourceCommit: "a".repeat(40),
      sourceSqlSha256: "b".repeat(64),
      isolatedReplayEvidence: "made-up",
    };

    const localFiles = readdirSync(join(root, "supabase", "migrations"));
    expect(validateProductionHistoryManifest(altered, [
      ...localFiles,
      "20260907214658_unrelated_noop.sql",
    ])).toEqual(expect.arrayContaining([
      "entries[0] has an unsupported field: reconciliation",
      "entries[0].status must remain unverified; this guard cannot reconcile remote history",
      "entries[0].sqlEquivalence must remain not-established",
      "entries[0].version is present in supabase/migrations; recover and independently review provenance before changing this guard",
    ]));
  });
});
