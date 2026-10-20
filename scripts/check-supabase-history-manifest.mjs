#!/usr/bin/env node
/**
 * Offline guard for timestamped production migration-history rows recovered
 * from Supabase Management API GET responses. It never links to Supabase,
 * reads credentials, or changes a database. Hashes are checked against source
 * already reviewed in the repository; passing this guard does not authorize
 * any production migration.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const defaultManifestPath = join(repositoryRoot, "supabase", "migration-history", "production-history-manifest.json");
const defaultMigrationsDirectory = join(repositoryRoot, "supabase", "migrations");

const RECOVERED = "recovered-authoritative-source";
const AUTHORITATIVE_SOURCE = "supabase-management-api:get-migration";
const VERIFIED = "verified-from-authoritative-source";
const RENDER_RULE = "single statement stored byte-for-byte as returned";
const TIMESTAMP_VERSION = /^\d{14}$/;
const REMOTE_NAME = /^[a-z0-9][a-z0-9_]*$/;
const SHA_256 = /^[a-f0-9]{64}$/;

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function localMigrationVersions(fileNames) {
  return new Set(
    fileNames
      .filter((fileName) => fileName.endsWith(".sql"))
      .map((fileName) => /^(\d+)_/.exec(fileName)?.[1])
      .filter(Boolean),
  );
}

function expectedSourceFileName(entry) {
  return `${entry.requestedVersion}_${entry.remoteName}.sql`;
}

function validateHash(value, label, errors) {
  if (typeof value !== "string" || !SHA_256.test(value)) {
    errors.push(`${label} must be a lowercase SHA-256 hex digest`);
  }
}

export function validateProductionHistoryManifest(manifest, fileNames = []) {
  const errors = [];

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return ["manifest must be an object"];
  }
  if (manifest.schemaVersion !== 2) errors.push("schemaVersion must be 2");
  if (typeof manifest.purpose !== "string" || !manifest.purpose.includes("authoritative Supabase Management API")) {
    errors.push("purpose must identify authoritative Supabase Management API source recovery");
  }
  if (!Array.isArray(manifest.entries) || manifest.entries.length === 0) {
    errors.push("entries must be a non-empty array");
    return errors;
  }

  const versions = new Set();
  const remoteNames = new Set();
  const sourceVersions = localMigrationVersions(fileNames);
  let previousVersion = "";

  for (const [index, entry] of manifest.entries.entries()) {
    const label = `entries[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    const allowed = [
      "requestedVersion", "returnedVersion", "remoteName", "status", "source", "sourcePath",
      "statementCount", "statementChars", "statementArraySha256", "renderedFileSha256",
      "renderRule", "createdByPresent", "sqlEquivalence",
    ];
    for (const key of Object.keys(entry)) {
      if (!allowed.includes(key)) errors.push(`${label} has an unsupported field: ${key}`);
    }

    const validVersion = typeof entry.requestedVersion === "string" && TIMESTAMP_VERSION.test(entry.requestedVersion);
    if (!validVersion) {
      errors.push(`${label}.requestedVersion must be a 14-digit timestamp`);
    } else {
      if (versions.has(entry.requestedVersion)) errors.push(`${label}.requestedVersion must be unique`);
      if (previousVersion && entry.requestedVersion <= previousVersion) errors.push(`${label}.requestedVersion must be strictly ascending`);
      versions.add(entry.requestedVersion);
      previousVersion = entry.requestedVersion;
    }
    if (entry.returnedVersion !== entry.requestedVersion) {
      errors.push(`${label}.returnedVersion must exactly match requestedVersion`);
    }

    if (typeof entry.remoteName !== "string" || !REMOTE_NAME.test(entry.remoteName)) {
      errors.push(`${label}.remoteName must be a lowercase underscore-separated migration name`);
    } else if (remoteNames.has(entry.remoteName)) {
      errors.push(`${label}.remoteName must be unique`);
    } else {
      remoteNames.add(entry.remoteName);
    }

    if (entry.status !== RECOVERED) errors.push(`${label}.status must remain ${RECOVERED}`);
    if (entry.source !== AUTHORITATIVE_SOURCE) errors.push(`${label}.source must remain ${AUTHORITATIVE_SOURCE}`);
    if (entry.statementCount !== 1) errors.push(`${label}.statementCount must be 1 for the reviewed recovery set`);
    if (!Number.isInteger(entry.statementChars) || entry.statementChars <= 0) errors.push(`${label}.statementChars must be a positive integer`);
    validateHash(entry.statementArraySha256, `${label}.statementArraySha256`, errors);
    validateHash(entry.renderedFileSha256, `${label}.renderedFileSha256`, errors);
    if (entry.renderRule !== RENDER_RULE) errors.push(`${label}.renderRule must remain ${JSON.stringify(RENDER_RULE)}`);
    if (entry.createdByPresent !== true) errors.push(`${label}.createdByPresent must record presence without storing identity`);
    if (entry.sqlEquivalence !== VERIFIED) errors.push(`${label}.sqlEquivalence must remain ${VERIFIED}`);

    const expectedPath = validVersion && typeof entry.remoteName === "string"
      ? `supabase/migrations/${entry.requestedVersion}_${entry.remoteName}.sql`
      : null;
    if (entry.sourcePath !== expectedPath) {
      errors.push(`${label}.sourcePath must be the exact timestamped authoritative source path`);
    } else {
      const fileName = expectedSourceFileName(entry);
      if (!fileNames.includes(fileName)) errors.push(`${label}.sourcePath must reference an existing local migration file`);
    }
    if (validVersion && !sourceVersions.has(entry.requestedVersion)) {
      errors.push(`${label}.requestedVersion must be represented by its recovered local migration file`);
    }
  }

  return errors;
}

export function verifyRecoveredMigrationSources(manifest, migrationsDirectory = defaultMigrationsDirectory) {
  const errors = [];
  for (const [index, entry] of manifest.entries.entries()) {
    const label = `entries[${index}]`;
    const fileName = expectedSourceFileName(entry);
    const sourcePath = join(migrationsDirectory, fileName);
    let source;
    try {
      source = readFileSync(sourcePath, "utf8");
    } catch (error) {
      errors.push(`${label}.sourcePath could not be read: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    if (source.length !== entry.statementChars) errors.push(`${label}.statementChars does not match local source`);
    if (sha256(JSON.stringify([source])) !== entry.statementArraySha256) errors.push(`${label}.statementArraySha256 does not match local source`);
    if (sha256(source) !== entry.renderedFileSha256) errors.push(`${label}.renderedFileSha256 does not match local source`);
  }
  return errors;
}

export function checkProductionHistoryManifest({ manifestPath = defaultManifestPath, migrationsDirectory = defaultMigrationsDirectory } = {}) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const files = readdirSync(migrationsDirectory);
  return {
    manifest,
    errors: [
      ...validateProductionHistoryManifest(manifest, files),
      ...verifyRecoveredMigrationSources(manifest, migrationsDirectory),
    ],
  };
}

function main() {
  let result;
  try {
    result = checkProductionHistoryManifest();
  } catch (error) {
    console.error(`Supabase history manifest guard could not run: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`Supabase history manifest guard: ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Supabase history manifest guard: ${result.manifest.entries.length} authoritative source rows verified locally; no network access or production action was used`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
