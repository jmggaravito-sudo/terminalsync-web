#!/usr/bin/env node
/**
 * Offline guard for a reviewed record of remote-only migration history.
 * It never links to Supabase, reads credentials, or infers SQL equivalence
 * from a matching name or timestamp. Reconciliation is deliberately
 * unsupported here: every recorded row must remain unverified.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const defaultManifestPath = join(repositoryRoot, "supabase", "migration-history", "production-history-manifest.json");
const defaultMigrationsDirectory = join(repositoryRoot, "supabase", "migrations");

const UNVERIFIED = "unverified";
const NOT_ESTABLISHED = "not-established";
const TIMESTAMP_VERSION = /^\d{14}$/;
const REMOTE_NAME = /^[a-z0-9][a-z0-9_]*$/;
const NAME_ONLY_CANDIDATE = "name-only candidate; not evidence of SQL equivalence";

export function localMigrationVersions(fileNames) {
  return new Set(
    fileNames
      .filter((fileName) => fileName.endsWith(".sql"))
      .map((fileName) => /^(\d+)_/.exec(fileName)?.[1])
      .filter(Boolean),
  );
}

function validateCandidate(candidate, label, fileNames) {
  if (candidate === null) return [];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return [`${label}.candidate must be null or a name-only candidate object`];
  }

  const errors = [];
  for (const key of Object.keys(candidate)) {
    if (!["path", "basis"].includes(key)) errors.push(`${label}.candidate has an unsupported field: ${key}`);
  }
  if (typeof candidate.path !== "string" || !/^supabase\/migrations\/[^/]+\.sql$/.test(candidate.path)) {
    errors.push(`${label}.candidate.path must be a repository migration path`);
  } else if (!fileNames.includes(candidate.path.slice("supabase/migrations/".length))) {
    errors.push(`${label}.candidate.path must reference an existing local migration file`);
  }
  if (candidate.basis !== NAME_ONLY_CANDIDATE) {
    errors.push(`${label}.candidate.basis must state that a name-only match is not SQL-equivalence evidence`);
  }
  return errors;
}

export function validateProductionHistoryManifest(manifest, fileNames = []) {
  const errors = [];

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return ["manifest must be an object"];
  }
  if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (typeof manifest.purpose !== "string" || !manifest.purpose.includes("Source-only")) {
    errors.push("purpose must identify this as a Source-only guard");
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
    for (const key of Object.keys(entry)) {
      if (!["version", "remoteName", "status", "origin", "candidate", "sqlEquivalence"].includes(key)) {
        errors.push(`${label} has an unsupported field: ${key}`);
      }
    }

    const validVersion = typeof entry.version === "string" && TIMESTAMP_VERSION.test(entry.version);
    if (!validVersion) {
      errors.push(`${label}.version must be a 14-digit timestamp`);
    } else {
      if (versions.has(entry.version)) errors.push(`${label}.version must be unique`);
      if (previousVersion && entry.version <= previousVersion) errors.push(`${label}.version must be strictly ascending`);
      versions.add(entry.version);
      previousVersion = entry.version;
    }

    if (typeof entry.remoteName !== "string" || !REMOTE_NAME.test(entry.remoteName)) {
      errors.push(`${label}.remoteName must be a lowercase underscore-separated migration name`);
    } else if (remoteNames.has(entry.remoteName)) {
      errors.push(`${label}.remoteName must be unique`);
    } else {
      remoteNames.add(entry.remoteName);
    }

    if (entry.origin !== "remote-migration-history-metadata") {
      errors.push(`${label}.origin must remain remote-migration-history-metadata`);
    }
    errors.push(...validateCandidate(entry.candidate, label, fileNames));

    if (entry.status !== UNVERIFIED) {
      errors.push(`${label}.status must remain ${UNVERIFIED}; this guard cannot reconcile remote history`);
    }
    if (entry.sqlEquivalence !== NOT_ESTABLISHED) {
      errors.push(`${label}.sqlEquivalence must remain ${NOT_ESTABLISHED}`);
    }
    if (validVersion && sourceVersions.has(entry.version)) {
      errors.push(`${label}.version is present in supabase/migrations; recover and independently review provenance before changing this guard`);
    }
  }

  return errors;
}

export function checkProductionHistoryManifest({ manifestPath = defaultManifestPath, migrationsDirectory = defaultMigrationsDirectory } = {}) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return {
    manifest,
    errors: validateProductionHistoryManifest(manifest, readdirSync(migrationsDirectory)),
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

  console.log(`Supabase history manifest guard: ${result.manifest.entries.length} remote rows remain source-unverified; no network access was used`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
