import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  managementMigrationUrl,
  validateRemoteVerifierConfig,
  verifyRemoteMigrationSources,
} from "./verify-supabase-remote-migration-sources.mjs";
import { checkProductionHistoryManifest, sha256 } from "./check-supabase-history-manifest.mjs";

const root = process.cwd();
const projectRef = "abcdefghij1234567890";
const accessToken = "test-token-used-only-by-mock";
const manifest = JSON.parse(readFileSync(join(root, "supabase", "migration-history", "production-history-manifest.json"), "utf8"));

function responseFor(entry, overrides = {}) {
  const statement = readFileSync(join(root, entry.sourcePath), "utf8");
  return {
    ok: true,
    status: 200,
    json: async () => ({
      version: entry.requestedVersion,
      name: entry.remoteName,
      statements: [statement],
      created_by: "opaque-presence-only",
      ...overrides,
    }),
  };
}

function fetchForManifest(overrides = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    const entry = manifest.entries.find((candidate) => url.endsWith(`/${candidate.requestedVersion}`));
    if (!entry) return { ok: false, status: 404, json: async () => ({}) };
    return responseFor(entry, overrides[entry.requestedVersion]);
  };
  return { calls, fetchImpl };
}

describe("Supabase remote recovered-migration verifier", () => {
  it("validates safe environment config and fixed Management API URLs", () => {
    expect(validateRemoteVerifierConfig({ projectRef, accessToken })).toEqual([]);
    expect(validateRemoteVerifierConfig({ projectRef: "not-a-ref", accessToken: "" })).toEqual(expect.arrayContaining([
      "SUPABASE_PROJECT_REF must be a 20-character lowercase Supabase project ref",
      "SUPABASE_ACCESS_TOKEN must be provided through the process environment",
    ]));
    expect(managementMigrationUrl(projectRef, "20260907214658")).toBe(
      `https://api.supabase.com/v1/projects/${projectRef}/database/migrations/20260907214658`,
    );
  });

  it("compares each response without exposing its SQL or creator identity", async () => {
    const { calls, fetchImpl } = fetchForManifest();
    const result = await verifyRemoteMigrationSources({ projectRef, accessToken, fetchImpl });

    expect(result.errors).toEqual([]);
    expect(result.verifiedVersions).toEqual(manifest.entries.map((entry) => entry.requestedVersion));
    expect(calls).toHaveLength(manifest.entries.length);
    expect(calls.every(({ init }) => init.method === "GET")).toBe(true);
    expect(calls.every(({ init }) => init.redirect === "error")).toBe(true);
    expect(calls.every(({ init }) => init.headers.Authorization === `Bearer ${accessToken}`)).toBe(true);
    expect(calls.every(({ init }) => init.headers["Cache-Control"] === "no-store")).toBe(true);
  });

  it("fails closed for a remote source whose bytes or identity-presence contract changed", async () => {
    const first = manifest.entries[0];
    const { fetchImpl } = fetchForManifest({
      [first.requestedVersion]: {
        statements: ["changed remotely"],
        created_by: null,
      },
    });
    const result = await verifyRemoteMigrationSources({ projectRef, accessToken, fetchImpl });

    expect(result.errors).toEqual(expect.arrayContaining([
      `version ${first.requestedVersion}: Management API response lacked created_by presence metadata`,
      `version ${first.requestedVersion}: returned statement length did not match`,
      `version ${first.requestedVersion}: returned statement fingerprint did not match`,
      `version ${first.requestedVersion}: returned statement bytes did not match local source`,
    ]));
    expect(result.verifiedVersions).not.toContain(first.requestedVersion);
  });

  it("aggregates a non-OK Management API result without treating it as verified", async () => {
    const first = manifest.entries[0];
    const { fetchImpl } = fetchForManifest({
      [first.requestedVersion]: undefined,
    });
    let callIndex = 0;
    const deniedFetch = async (url, init) => {
      callIndex += 1;
      if (url.endsWith(`/${first.requestedVersion}`)) return { ok: false, status: 403, json: async () => ({}) };
      return fetchImpl(url, init);
    };
    const result = await verifyRemoteMigrationSources({ projectRef, accessToken, fetchImpl: deniedFetch });

    expect(result.errors).toContain(`version ${first.requestedVersion}: Management API returned HTTP 403`);
    expect(callIndex).toBe(manifest.entries.length);
  });

  it("detects a coherent local manifest/source rewrite against the independent GET response", async () => {
    const original = manifest.entries[0];
    const originalSource = readFileSync(join(root, original.sourcePath), "utf8");
    const rewrittenSource = `${originalSource}-- local rewrite that updates its manifest too\n`;
    const isolated = mkdtempSync(join(tmpdir(), "terminalsync-remote-history-"));
    const migrationsDirectory = join(isolated, "migrations");
    const manifestPath = join(isolated, "manifest.json");
    const rewritten = structuredClone(original);
    rewritten.statementChars = rewrittenSource.length;
    rewritten.statementArraySha256 = sha256(JSON.stringify([rewrittenSource]));
    rewritten.renderedFileSha256 = sha256(Buffer.from(rewrittenSource, "utf8"));

    try {
      await import("node:fs").then(({ mkdirSync }) => mkdirSync(migrationsDirectory));
      writeFileSync(join(migrationsDirectory, `${rewritten.requestedVersion}_${rewritten.remoteName}.sql`), rewrittenSource);
      writeFileSync(manifestPath, JSON.stringify({
        schemaVersion: 2,
        purpose: manifest.purpose,
        entries: [rewritten],
      }));
      expect(checkProductionHistoryManifest({ manifestPath, migrationsDirectory }).errors).toEqual([]);

      const result = await verifyRemoteMigrationSources({
        projectRef,
        accessToken,
        manifestPath,
        migrationsDirectory,
        fetchImpl: async () => responseFor(original),
      });

      expect(result.errors).toEqual(expect.arrayContaining([
        `version ${original.requestedVersion}: returned statement bytes did not match local source`,
      ]));
      expect(result.verifiedVersions).toEqual([]);
    } finally {
      rmSync(isolated, { recursive: true, force: true });
    }
  });

});
