import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  checkProductionHistoryManifest,
  localMigrationVersions,
  validateProductionHistoryManifest,
  verifyRecoveredMigrationSources,
} from "./check-supabase-history-manifest.mjs";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "supabase", "migration-history", "production-history-manifest.json"), "utf8"));
const expectedRows = [
  ["20260907214658", "agency_influencers_profile_url", 302, "70f9370c0c2943af9bdc595de7885283c0c11b9d084ab156f3f32403e4b3ff59", "bcb7a77ba0f01b0ae237f2a8d17f1db4a75342d1ccc686384584ac3aae737034"],
  ["20260921114605", "0019_subscription_ai_entitlement", 487, "781fe1d50683a256efed91ea6caa8e113e52309f0bd4ad88f62dd6fe1d20e0b0", "7a5f382c96b62768028ae5c32c62e1bddd8ecc10429a6045b63304f4b4c1b416"],
  ["20260921114611", "courtesy_tier_reads_subscription_ai_marker", 1632, "21ef76fb7b2ef72e869563f365ba570dc86dfefc9602fa8587f3a853297ed063", "81cc3f73d6932d33dfabd5cf97009d942393de32626884fe8c76b14b347e6fa0"],
  ["20260921124719", "0032_comp_included_ai", 1943, "de2533213e1aaecee8f44e7f900eeba599f20da5d6e39eb4334d16dadbbcb795", "61cd0e91a613c2f1003fc69540a6680e3722907a2e0446e41ba7d1910de80717"],
  ["20260921183710", "proxy_003_ai_usage", 3935, "c74b2214292cbafafa4a104616ad67ab7233ca87febcbf87736cb638eac7aeaa", "e2d559164db64fbf50b5962edef00b91633183855944fd29f2c8c1aa38b366b3"],
  ["20260921183713", "proxy_005_connector_requests", 3367, "8600bec87bea672825621cec9f770b5484c4b21a5ddf9585ddd831a3b384da55", "0a7155ccd018a0a7c4926fe852047e811b25f4c9e70e2ed2dd2a183613bc863f"],
  ["20260921183832", "proxy_004_ai_usage_upstream", 3184, "9c46d15ad23872cef6ea9be586925eebc38d8b2536cba048f6ace6b3d19db8cc", "2e47859bd2a31845b25b7e91891d31bd4c81b8067aa3b4f6ada62581638bdc18"],
  ["20261006204704", "proxy_006_search_usage", 4176, "c72751a9495f299adadd37cab944284220fdcb2072425a9b6eb115d33288989a", "34fa1cfc5ec056541432a6a030b285d220f8a283c603b7eca69a9974a111dd92"],
  ["20261017190938", "ai_credit_debits", 1961, "f23a47a33f658380148feffa3f691e59a7efe1ed593d564ec156749073f4a00c", "0ff1c65d934c1608f07a31fbcb32af541c9d1c7cbd00377b7983bf94b675c74b"],
  ["20261018163004", "0057_ai_credit_refunds", 6591, "bb6e31051f65aaf75d7c28dbd07930751d1d87cd2ca0bc09b18cc3b04b1f1725", "e541d8e4848f1db146d2110cfa10b6cd72f05d2be56847e76532ceee65dfb3b4"],
];

const serialisedRows = manifest.entries.map((entry) => [
  entry.requestedVersion,
  entry.remoteName,
  entry.statementChars,
  entry.statementArraySha256,
  entry.renderedFileSha256,
]);

describe("Supabase recovered migration-history source guard", () => {
  it("pins the ten reviewed Management API responses by version, name, size, and hashes", () => {
    expect(manifest.schemaVersion).toBe(2);
    expect(serialisedRows).toEqual(expectedRows);
    expect(manifest.entries.every((entry) => entry.returnedVersion === entry.requestedVersion)).toBe(true);
    expect(manifest.entries.every((entry) => entry.statementCount === 1)).toBe(true);
    expect(manifest.entries.every((entry) => entry.source === "supabase-management-api:get-migration")).toBe(true);
    expect(manifest.entries.every((entry) => entry.status === "recovered-authoritative-source")).toBe(true);
    expect(manifest.entries.every((entry) => entry.createdByPresent === true)).toBe(true);
  });

  it("finds every recovered timestamp in the source tree and verifies byte hashes offline", () => {
    const files = readdirSync(join(root, "supabase", "migrations"));
    expect(validateProductionHistoryManifest(manifest, files)).toEqual([]);
    expect(verifyRecoveredMigrationSources(manifest, join(root, "supabase", "migrations"))).toEqual([]);
    expect(checkProductionHistoryManifest().errors).toEqual([]);
    expect(localMigrationVersions(files).has("20261018163004")).toBe(true);
  });

  it("fails closed if a recovered source changes even by one byte", () => {
    const source = manifest.entries[0];
    const directory = mkdtempSync(join(tmpdir(), "terminalsync-recovered-history-"));
    try {
      const fileName = `${source.requestedVersion}_${source.remoteName}.sql`;
      writeFileSync(join(directory, fileName), `${readFileSync(join(root, source.sourcePath), "utf8")}\n`);
      expect(verifyRecoveredMigrationSources({ entries: [source] }, directory)).toEqual(expect.arrayContaining([
        "entries[0].statementChars does not match local source",
        "entries[0].statementArraySha256 does not match local source",
        "entries[0].renderedFileSha256 does not match local source",
      ]));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects unverifiable substitutions and persisted operator identity", () => {
    const altered = structuredClone(manifest);
    altered.entries[0].source = "remote-migration-history-metadata";
    altered.entries[0].sourcePath = "supabase/migrations/0001_init.sql";
    altered.entries[0].createdBy = "must-not-be-stored@example.test";

    const files = readdirSync(join(root, "supabase", "migrations"));
    expect(validateProductionHistoryManifest(altered, files)).toEqual(expect.arrayContaining([
      "entries[0] has an unsupported field: createdBy",
      "entries[0].source must remain supabase-management-api:get-migration",
      "entries[0].sourcePath must be the exact timestamped authoritative source path",
    ]));
  });
});
