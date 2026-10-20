#!/usr/bin/env node
/**
 * Read-only provenance verifier for recovered Supabase migration sources.
 *
 * This script compares the exact local SQL bytes with the response returned by
 * GET /v1/projects/{ref}/database/migrations/{version}. It never writes to
 * the repository or remote project and deliberately never prints statements,
 * access tokens, response bodies, or created_by identities.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkProductionHistoryManifest, sha256 } from "./check-supabase-history-manifest.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const defaultManifestPath = join(repositoryRoot, "supabase", "migration-history", "production-history-manifest.json");
const defaultMigrationsDirectory = join(repositoryRoot, "supabase", "migrations");
const MANAGEMENT_API_ORIGIN = "https://api.supabase.com";
const PROJECT_REF = /^[a-z0-9]{20}$/;
const TOKEN_ENV = "SUPABASE_ACCESS_TOKEN";
const PROJECT_REF_ENV = "SUPABASE_PROJECT_REF";

export function validateRemoteVerifierConfig({ projectRef, accessToken }) {
  const errors = [];
  if (typeof projectRef !== "string" || !PROJECT_REF.test(projectRef)) {
    errors.push(`${PROJECT_REF_ENV} must be a 20-character lowercase Supabase project ref`);
  }
  if (typeof accessToken !== "string" || accessToken.trim().length === 0) {
    errors.push(`${TOKEN_ENV} must be provided through the process environment`);
  }
  return errors;
}

export function managementMigrationUrl(projectRef, version) {
  return `${MANAGEMENT_API_ORIGIN}/v1/projects/${projectRef}/database/migrations/${encodeURIComponent(version)}`;
}

function sourceFileName(entry) {
  return `${entry.requestedVersion}_${entry.remoteName}.sql`;
}

function responseErrors(entry, payload, localSourceBytes) {
  const label = `version ${entry.requestedVersion}`;
  const errors = [];
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [`${label}: Management API response must be an object`];
  }
  if (payload.version !== entry.requestedVersion) errors.push(`${label}: returned version did not match`);
  if (payload.name !== entry.remoteName) errors.push(`${label}: returned migration name did not match`);
  if (!Array.isArray(payload.statements) || payload.statements.length !== entry.statementCount) {
    errors.push(`${label}: returned statement count did not match`);
    return errors;
  }
  if (payload.statements.some((statement) => typeof statement !== "string" || statement.length === 0)) {
    errors.push(`${label}: returned statements must be non-empty strings`);
    return errors;
  }
  if (!Object.hasOwn(payload, "created_by") || payload.created_by == null || payload.created_by === "") {
    errors.push(`${label}: Management API response lacked created_by presence metadata`);
  }
  if (payload.statements[0].length !== entry.statementChars) errors.push(`${label}: returned statement length did not match`);
  if (sha256(JSON.stringify(payload.statements)) !== entry.statementArraySha256) {
    errors.push(`${label}: returned statement fingerprint did not match`);
  }
  const returnedSourceBytes = Buffer.from(payload.statements[0], "utf8");
  if (!returnedSourceBytes.equals(localSourceBytes)) errors.push(`${label}: returned statement bytes did not match local source`);
  if (sha256(localSourceBytes) !== entry.renderedFileSha256) errors.push(`${label}: local source fingerprint did not match manifest`);
  return errors;
}

/**
 * Verify all recovered sources against the read-only Management API.
 * fetchImpl is injected by tests; callers must pass an opaque scoped PAT only
 * through process environment and should never log the returned response.
 */
export async function verifyRemoteMigrationSources({
  projectRef,
  accessToken,
  manifestPath = defaultManifestPath,
  migrationsDirectory = defaultMigrationsDirectory,
  fetchImpl = globalThis.fetch,
} = {}) {
  const errors = validateRemoteVerifierConfig({ projectRef, accessToken });
  if (typeof fetchImpl !== "function") errors.push("fetch implementation is unavailable");
  const local = checkProductionHistoryManifest({ manifestPath, migrationsDirectory });
  errors.push(...local.errors.map((error) => `local guard: ${error}`));
  if (errors.length > 0) return { errors, verifiedVersions: [] };

  const verifiedVersions = [];
  for (const entry of local.manifest.entries) {
    const localSourceBytes = readFileSync(join(migrationsDirectory, sourceFileName(entry)));
    let response;
    try {
      response = await fetchImpl(managementMigrationUrl(projectRef, entry.requestedVersion), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        redirect: "error",
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      errors.push(`version ${entry.requestedVersion}: Management API request failed`);
      continue;
    }
    if (!response || !response.ok) {
      errors.push(`version ${entry.requestedVersion}: Management API returned HTTP ${response?.status ?? "unknown"}`);
      continue;
    }
    let payload;
    try {
      payload = await response.json();
    } catch {
      errors.push(`version ${entry.requestedVersion}: Management API response was not JSON`);
      continue;
    }
    const entryErrors = responseErrors(entry, payload, localSourceBytes);
    if (entryErrors.length > 0) {
      errors.push(...entryErrors);
      continue;
    }
    verifiedVersions.push(entry.requestedVersion);
  }
  return { errors, verifiedVersions };
}

async function main() {
  const result = await verifyRemoteMigrationSources({
    projectRef: process.env[PROJECT_REF_ENV],
    accessToken: process.env[TOKEN_ENV],
  });
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`Supabase remote history verifier: ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Supabase remote history verifier: ${result.verifiedVersions.length} Management API responses matched local fingerprints; GET-only, no SQL or identity output, no production action`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
