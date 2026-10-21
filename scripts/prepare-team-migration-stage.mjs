#!/usr/bin/env node
/**
 * Prepare and verify an isolated, source-locked Supabase workdir for exactly
 * one approved Team production migration. Neither mode links to Supabase,
 * reads a secret, invokes the Supabase CLI, nor connects to a database.
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = resolve(dirname(scriptPath), "..");
const manifestPath = join(
  repositoryRoot,
  "supabase",
  "migration-history",
  "team-production-single-target-manifest.json",
);
const scratchRoot = "/private/tmp";
const expectedProjectRef = "zwyeqqxiwiogmtqwfnby";
const reviewedSupabaseCliVersion = "2.121.0";
const stageManifestPath = "supabase/migration-history/team-production-single-target-manifest.json";
const sha256Pattern = /^[a-f0-9]{64}$/;
const migrationFilePattern = /^\d+_[a-z0-9][a-z0-9_]*\.sql$/;

// This is intentionally duplicated from the manifest. Editing only the JSON
// must never widen the production-eligible Team slice or switch its source.
const approvedTargetChain = Object.freeze([
  Object.freeze({ version: "0039", file: "0039_team_shared_spaces_metadata.sql", sha256: "3faa7cf1e02af228adb6ff261bde7330abd87b7d5abb048681c78d4bda1a8840" }),
  Object.freeze({ version: "0040", file: "0040_team_universal_trial.sql", sha256: "e93fe94c63292442b687cda6aa875ed9284121fc5b2a40c81bca8d4bf7a4cdc6" }),
  Object.freeze({ version: "0041", file: "0041_team_entitlement_and_alias_reconciliation.sql", sha256: "bbef84ff383cc1c93a6e265a9ebdeda77519e000792f3b5b7b22607714a8ad03" }),
  Object.freeze({ version: "0042", file: "0042_team_metadata_invites.sql", sha256: "195f61c04cbbf0823a2ff8ce95e263d1a50eb4d81eac1bc8f9e3a90bd8f2a8f3" }),
  Object.freeze({ version: "0043", file: "0043_team_metadata_requests.sql", sha256: "1f1617537e975502c695d2ca28ac6cc7139de5bb30f444594eff5371c0073a6e" }),
  Object.freeze({ version: "0044", file: "0044_team_trial_on_signup.sql", sha256: "cf9f8e4ad4f61f2cfe8db2d56ace0579086c9c6bb95f0285f65406d8abbd6b8c" }),
  Object.freeze({ version: "0047", file: "0047_team_invitation_owner_alias_projection.sql", sha256: "e916a68ff242f021cbb6ec50bb24cd0bcb59d877d4e2c906234baa1c129adecc" }),
  Object.freeze({ version: "0048", file: "0048_team_request_participant_projection.sql", sha256: "8ffd6a11ded333f1a5509faa6e6786baddd3b1e66132ad500225e541e4746843" }),
  Object.freeze({ version: "0053", file: "0053_team_conversation_turns.sql", sha256: "daa1785eae21c0e6c8327302f6ae8c41e2157cc0de1951c835de6ac9479b3451" }),
  Object.freeze({ version: "0054", file: "0054_team_conversation_metadata_hardening.sql", sha256: "5c280f69ea34e659dcea57220682cc37889a97e9c2021cf1bf50b656cb4f8c4a" }),
  Object.freeze({ version: "0055", file: "0055_team_legacy_approval_hardening.sql", sha256: "634af0c164dfdd3d5ca551fb3c0fdac8e6a5cf2957cc876c5f0a86dcf432b671" }),
  Object.freeze({ version: "0056", file: "0056_team_text_deliveries.sql", sha256: "3b180107fb59978d48c7f3ccee847365930a9763157639fc704ee8ca539a5bae" }),
  Object.freeze({ version: "0058", file: "0058_team_owner_approved_text_delivery.sql", sha256: "b885465c507d41e348206db400ed53627a81a8b99c3d69c45970623958b392a1" }),
]);

// A newly recorded remote version requires a fresh review instead of silently
// becoming alignment input for --include-all.
const expectedRemoteHistoryVersions = Object.freeze([
  "0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008",
  "0009", "0010", "0011", "0012", "0013", "0014", "0015", "0016",
  "0020", "0026", "0027", "0028", "0033", "0037", "0038",
  "20260907214658", "20260921114605", "20260921114611", "20260921124719",
  "20260921183710", "20260921183713", "20260921183832", "20261006204704",
  "20261017190938", "20261018163004", "20261019220000",
]);
const expectedExcludedVersions = Object.freeze([
  "0045", "0046", "0049", "0050", "0051", "0052", "0057",
  "20261019192526", "20261019230000", "20261019235959",
]);

function usage() {
  return [
    "Usage:",
    "  node scripts/prepare-team-migration-stage.mjs --target <migration-version>",
    "  node scripts/prepare-team-migration-stage.mjs --verify-stage <directory> [--require-linked]",
    "",
    "The command only creates or verifies local /private/tmp staging files.",
    "It does not link a project, read credentials, or run the Supabase CLI.",
  ].join("\n");
}

function parseArgs(argv) {
  let target;
  let stageDirectory;
  let requireLinked = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--target") {
      target = argv[index + 1];
      index += 1;
      continue;
    }
    if (argument === "--verify-stage") {
      stageDirectory = argv[index + 1];
      index += 1;
      continue;
    }
    if (argument === "--require-linked") {
      requireLinked = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      process.stdout.write(`${usage()}\n`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (Boolean(target) === Boolean(stageDirectory)) {
    throw new Error("Provide exactly one of --target <migration-version> or --verify-stage <directory>.");
  }
  if (requireLinked && !stageDirectory) {
    throw new Error("--require-linked is valid only with --verify-stage <directory>.");
  }
  return { target, stageDirectory, requireLinked };
}

function sha256(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function assertRegularFile(filePath, label) {
  let stat;
  try {
    stat = lstatSync(filePath);
  } catch {
    throw new Error(`Missing ${label}: ${filePath}`);
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${label} must be a regular non-symlink file: ${filePath}`);
  }
}

function assertDirectory(directoryPath, label) {
  let stat;
  try {
    stat = lstatSync(directoryPath);
  } catch {
    throw new Error(`Missing ${label}: ${directoryPath}`);
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error(`${label} must be a directory and not a symlink: ${directoryPath}`);
  }
}

function assertOnlyAllowedEntries(directoryPath, allowedNames, label) {
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || !allowedNames.has(entry.name)) {
      throw new Error(`Unexpected or unsafe ${label} entry: ${entry.name}`);
    }
  }
}

function assertSafeFileName(fileName, label) {
  if (basename(fileName) !== fileName || fileName.includes("/") || fileName.includes("\\") || !migrationFilePattern.test(fileName)) {
    throw new Error(`${label} must be a single safe migration filename.`);
  }
}

function assertExactArray(actual, expected, label) {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    throw new Error(`${label} differs from the reviewed immutable list.`);
  }
  for (const [index, value] of expected.entries()) {
    if (actual[index] !== value) {
      throw new Error(`${label} differs from the reviewed immutable list at index ${index}.`);
    }
  }
}

function assertEntry(entry, label) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    throw new Error(`Invalid ${label} manifest entry.`);
  }
  if (typeof entry.version !== "string" || !/^\d+$/.test(entry.version)) {
    throw new Error(`${label} migration version must be a numeric string.`);
  }
  if (typeof entry.file !== "string") throw new Error(`${label} migration file is missing.`);
  if (typeof entry.sha256 !== "string" || !sha256Pattern.test(entry.sha256)) {
    throw new Error(`${label} SHA-256 must be a lowercase digest.`);
  }
  assertSafeFileName(entry.file, label);
  if (!entry.file.startsWith(`${entry.version}_`)) {
    throw new Error(`Manifest entry has a version/file mismatch: ${entry.version} / ${entry.file}`);
  }
}

/**
 * Validate the immutable production allowlist before ever looking at source
 * files. Exported for tests so a JSON-only edit cannot widen the stage scope.
 */
export function validateTeamStageManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Team stage manifest must be an object.");
  }
  const allowedKeys = new Set([
    "schema_version",
    "project_ref",
    "purpose",
    "remote_history",
    "target_chain",
    "excluded_versions",
  ]);
  for (const key of Object.keys(manifest)) {
    if (!allowedKeys.has(key)) throw new Error(`Unsupported Team stage manifest field: ${key}`);
  }
  if (manifest.schema_version !== 1) throw new Error("Unsupported Team stage manifest version.");
  if (manifest.project_ref !== expectedProjectRef) {
    throw new Error(`Team stage manifest must target reviewed project ${expectedProjectRef}.`);
  }
  if (typeof manifest.purpose !== "string" || manifest.purpose.trim() === "") {
    throw new Error("Team stage manifest purpose is missing.");
  }
  if (!Array.isArray(manifest.remote_history) || !Array.isArray(manifest.target_chain) || !Array.isArray(manifest.excluded_versions)) {
    throw new Error("Team stage manifest is missing source lists.");
  }

  assertExactArray(manifest.remote_history.map((entry) => entry?.version), expectedRemoteHistoryVersions, "remote_history versions");
  assertExactArray(manifest.target_chain.map((entry) => entry?.version), approvedTargetChain.map((entry) => entry.version), "target_chain versions");
  assertExactArray(manifest.excluded_versions, expectedExcludedVersions, "excluded_versions");

  const versions = new Set();
  const files = new Set();
  for (const [label, entries] of [["remote_history", manifest.remote_history], ["target_chain", manifest.target_chain]]) {
    for (const entry of entries) {
      assertEntry(entry, label);
      if (versions.has(entry.version)) throw new Error(`Duplicate migration version in manifest: ${entry.version}`);
      if (files.has(entry.file)) throw new Error(`Duplicate migration file in manifest: ${entry.file}`);
      versions.add(entry.version);
      files.add(entry.file);
    }
  }

  for (const [index, expected] of approvedTargetChain.entries()) {
    const actual = manifest.target_chain[index];
    if (actual.version !== expected.version || actual.file !== expected.file || actual.sha256 !== expected.sha256) {
      throw new Error(`target_chain entry ${expected.version} differs from the reviewed immutable source.`);
    }
  }
  for (const excluded of manifest.excluded_versions) {
    if (versions.has(excluded)) throw new Error(`Excluded migration appears in the stage manifest: ${excluded}`);
  }
}

function sourcePathFor(entry) {
  return join(repositoryRoot, "supabase", "migrations", entry.file);
}

function verifyRepositorySources(manifest) {
  for (const entry of [...manifest.remote_history, ...manifest.target_chain]) {
    const source = sourcePathFor(entry);
    assertRegularFile(source, `source migration ${entry.file}`);
    if (sha256(source) !== entry.sha256) {
      throw new Error(`Source hash mismatch for ${entry.file}; stop and investigate.`);
    }
  }
}

function readManifest() {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read Team stage manifest: ${error instanceof Error ? error.message : String(error)}`);
  }
  validateTeamStageManifest(manifest);
  verifyRepositorySources(manifest);
  return manifest;
}

function entriesThroughTarget(manifest, targetVersion) {
  const targetIndex = approvedTargetChain.findIndex((entry) => entry.version === targetVersion);
  if (targetIndex < 0) {
    throw new Error(`Unsupported Team target ${targetVersion}. Allowed: ${approvedTargetChain.map((entry) => entry.version).join(", ")}.`);
  }
  return {
    targetIndex,
    target: manifest.target_chain[targetIndex],
    entries: [...manifest.remote_history, ...manifest.target_chain.slice(0, targetIndex + 1)],
  };
}

function stageConfig() {
  return [
    "# Local-only stage generated by TerminalSync. It is not the production project configuration.",
    'project_id = "terminalsync-team-single-target"',
    "",
    "[db.migrations]",
    "enabled = true",
    "",
  ].join("\n");
}

function stageDescriptor({ target, entries }) {
  return {
    project_ref: expectedProjectRef,
    target_version: target.version,
    target_file: target.file,
    migration_count: entries.length,
    source_manifest: stageManifestPath,
    sources: entries.map(({ version, file, sha256: digest }) => ({ version, file, sha256: digest })),
  };
}

function reviewedCliGuard() {
  return `     SUPABASE_CLI_BIN=''
     require_reviewed_supabase_cli() {
       local actual_version
       if ! SUPABASE_CLI_BIN="$(command -v supabase)"; then
         print -u2 'Supabase CLI not found; aborting.'
         return 1
       fi
       if [[ "$SUPABASE_CLI_BIN" != /* || ! -f "$SUPABASE_CLI_BIN" || ! -x "$SUPABASE_CLI_BIN" ]]; then
         print -u2 'Supabase CLI must resolve to an absolute executable file; aborting.'
         return 1
       fi
       if ! actual_version="$("$SUPABASE_CLI_BIN" --version)"; then
         print -u2 'Could not read Supabase CLI version; aborting.'
         return 1
       fi
       if [[ "$actual_version" != '${reviewedSupabaseCliVersion}' ]]; then
         print -u2 "Expected Supabase CLI ${reviewedSupabaseCliVersion}, got $actual_version; aborting."
         return 1
       fi
       print -r -- "Using reviewed Supabase CLI $actual_version at $SUPABASE_CLI_BIN"
     }
     if ! require_reviewed_supabase_cli; then
       exit 1
     fi`;
}

function stageReadme({ target, entries, directory }) {
  const teamTargetCount = entries.length - expectedRemoteHistoryVersions.length;
  return `# Controlled one-target Team migration stage

This directory is local-only scratch created by \`prepare-team-migration-stage.mjs\`.
It has **no** project link, database password, token, or production connection.

- Project ref: \`${expectedProjectRef}\`
- Intended next migration: \`${target.version}\` / \`${target.file}\`
- Source set: ${expectedRemoteHistoryVersions.length} provider-recorded remote versions, each represented once for CLI version alignment, + ${teamTargetCount} Team target version(s) through the intended next step.
- Deliberately absent: pending paid-roster/checkout, numeric AI-credit, and later Team targets outside the approved no-card slice. Already-applied remote-history entries remain only for version alignment.
- Directory: \`${directory}\`

## Safety boundary

This is the sole allowed shape for the narrow \`--include-all\` exception: a
fresh, source-hash-pinned workdir containing every revalidated remote-history
version and only one currently pending Team target. The recovered timestamped
sources remain verified by the separate production-history manifest; older
already-applied sources are present only for CLI version alignment and must not
run. This is **not** permission to run \`--include-all\` from the repository
root, to add a migration file, to use \`migration repair\`, or to replay a
directory blindly.

The normal CLI order check rejects the numeric Team target because verified
remote history already contains later timestamp versions. In this one-target
stage, \`--include-all\` makes the official CLI apply and record the exact
numeric version; it must still be dry-run and reviewed before each apply.
This procedure is reviewed only for exact Supabase CLI
\`v${reviewedSupabaseCliVersion}\`. Every provider-contacting command below resolves
an executable and checks that exact version immediately before it runs. A mismatch
or unreadable binary is a stop condition. Do not write a CLI receipt inside this
verified stage; if durable operator evidence is required, record only nonsecret
version/path information outside the stage (for example, under \`/private/tmp\`).

## Operator sequence — do not skip or batch

Bind the exact generated directory once in the private operator shell:
\`STAGE='${directory}'\`. Every Supabase CLI command below must include
\`--workdir "\${STAGE}" --profile supabase\`; never rely on the current directory,
an inherited profile, or a bare \`supabase db push\` from the source checkout.

1. Immediately before generating **and** before using this stage, obtain fresh
   evidence that the provider reports a recoverable physical backup and that
   the recovery procedure/permissions are known. Do not perform a destructive
   restore merely to prove it. This is mandatory before **every** target apply
   and is particularly critical for the data-mutating \`0043\`, \`0054\`, and
   \`0055\` targets. Also re-run the approved
   metadata-only history/schema preflight and the authorized GET-only source
   provenance verifier. Any new remote history row, schema drift, failed hash,
   or missing prerequisite is a stop condition. Keep \`TEAM_FEATURE_ENABLED=0\`
   and paid checkout disabled.
2. From the reviewed clean source checkout that generated this directory, run
   \`npm run verify:team-migration-stage -- --verify-stage "\${STAGE}"\`. It must
   report the same target and source count. Do not edit this stage after that
   verification.
3. Link only this scratch stage in a guarded zsh subshell:

   \`\`\`zsh
   (
     set +x
     unset SUPABASE_DB_PASSWORD SUPABASE_DB_POOLER_CONNECTION_STRING SUPABASE_PROJECT_ID PROJECT_ID SUPABASE_PROFILE SUPABASE_DEBUG SUPABASE_ENV SUPABASE_WORKDIR SUPABASE_HOME SUPABASE_YES SUPABASE_CLI_BIN
${reviewedCliGuard()}
     "$SUPABASE_CLI_BIN" --workdir "\${STAGE}" --profile supabase link --project-ref ${expectedProjectRef}
   )
   \`\`\`

   This provider-contacting command applies no SQL. Its project-link metadata
   resides only in this scratch stage, although the CLI may update its own global
   local telemetry state; do not link the repository itself. The explicit
   profile, workdir, and cleared routing/debug/prompt overrides are mandatory.
   Then return to the reviewed source checkout and run
   \`npm run verify:team-migration-stage -- --verify-stage "\${STAGE}" --require-linked\`.
   It must confirm the linked project ref before any CLI push.
4. Set the database password only in a process-local shell variable, never in
   command arguments, files, chat, or history. Use a new short zsh subshell for
   each CLI invocation. Each command clears inherited password, project,
   profile, debug, and auto-confirm overrides before prompting. This avoids the CLI's fallback
   creation of a writable \`cli_login_*\` role, including during dry-run, and
   prevents an inherited \`SUPABASE_DEBUG\` setting from logging the database
   protocol. The password remains visible to child processes of that subshell
   while exported, so keep the terminal private. The exact-version guard runs
   before the password export, so its local \`--version\` probe cannot receive
   that credential.
5. In a short subshell, run:

   \`\`\`zsh
   (
     set +x
     unset SUPABASE_DB_PASSWORD SUPABASE_DB_POOLER_CONNECTION_STRING SUPABASE_PROJECT_ID PROJECT_ID SUPABASE_PROFILE SUPABASE_DEBUG SUPABASE_ENV SUPABASE_WORKDIR SUPABASE_HOME SUPABASE_YES SUPABASE_CLI_BIN
     if ! read -r -s "SUPABASE_DB_PASSWORD?Database password: "; then
       print -u2 'Password input failed; aborting.'
       exit 1
     fi
     echo
     if [[ -z \${SUPABASE_DB_PASSWORD:-} ]]; then
       print -u2 'Database password required; aborting.'
       exit 1
     fi
${reviewedCliGuard()}
     export SUPABASE_DB_PASSWORD
     "$SUPABASE_CLI_BIN" --workdir "\${STAGE}" --profile supabase db push --linked --include-all --skip-vault --dry-run
   )
   \`\`\`

   It must show **only** \`${target.file}\`. Stop for any extra, missing,
   renamed, or unexpected migration; do not run an apply. Do not add
   \`--include-seed\` or \`--include-roles\`.
6. Re-run the metadata-only history preflight and
   \`npm run verify:team-migration-stage -- --verify-stage "\${STAGE}" --require-linked\`
   immediately before the apply. During the approved change window, in a
   **new** short subshell, run:

   \`\`\`zsh
   (
     set +x
     unset SUPABASE_DB_PASSWORD SUPABASE_DB_POOLER_CONNECTION_STRING SUPABASE_PROJECT_ID PROJECT_ID SUPABASE_PROFILE SUPABASE_DEBUG SUPABASE_ENV SUPABASE_WORKDIR SUPABASE_HOME SUPABASE_YES SUPABASE_CLI_BIN
     if ! read -r -s "SUPABASE_DB_PASSWORD?Database password: "; then
       print -u2 'Password input failed; aborting.'
       exit 1
     fi
     echo
     if [[ -z \${SUPABASE_DB_PASSWORD:-} ]]; then
       print -u2 'Database password required; aborting.'
       exit 1
     fi
${reviewedCliGuard()}
     export SUPABASE_DB_PASSWORD
     "$SUPABASE_CLI_BIN" --workdir "\${STAGE}" --profile supabase db push --linked --include-all --skip-vault
   )
   \`\`\`

   Do not pass \`--yes\`: the CLI must retain its interactive confirmation.
   Exiting each subshell discards the exported password.
7. Stop after this one target. Re-read migration history and run the specific
   aggregate-only postchecks before generating a new stage for the next target.
   Do not continue automatically, retry a failed SQL file, alter history, or
   activate Team.

The CLI application is the only component that writes the migration-history
entry; it records \`${target.version}\` from the file prefix. This stage neither
creates billing objects nor changes Pro/Max.
`;
}

function assertStageDescriptor(descriptor, expected) {
  if (!descriptor || typeof descriptor !== "object" || Array.isArray(descriptor)) {
    throw new Error("Stage descriptor must be a JSON object.");
  }
  const expectedKeys = ["project_ref", "target_version", "target_file", "migration_count", "source_manifest", "sources"];
  const actualKeys = Object.keys(descriptor).sort();
  if (actualKeys.length !== expectedKeys.length || actualKeys.some((key, index) => key !== [...expectedKeys].sort()[index])) {
    throw new Error("Stage descriptor has unexpected or missing fields.");
  }
  if (descriptor.project_ref !== expectedProjectRef) throw new Error("Stage descriptor project ref does not match the reviewed production project.");
  if (descriptor.target_version !== expected.target.version || descriptor.target_file !== expected.target.file) {
    throw new Error("Stage descriptor target does not match the reviewed allowlist.");
  }
  if (descriptor.migration_count !== expected.entries.length) throw new Error("Stage descriptor migration count does not match the reviewed prefix.");
  if (descriptor.source_manifest !== stageManifestPath) throw new Error("Stage descriptor source manifest path is unexpected.");
  if (!Array.isArray(descriptor.sources) || descriptor.sources.length !== expected.entries.length) {
    throw new Error("Stage descriptor sources do not match the reviewed prefix.");
  }
  for (const [index, expectedEntry] of expected.entries.entries()) {
    const actual = descriptor.sources[index];
    if (!actual || typeof actual !== "object" || Array.isArray(actual)) throw new Error(`Stage descriptor source ${index} is invalid.`);
    const keys = Object.keys(actual).sort();
    if (keys.length !== 3 || keys[0] !== "file" || keys[1] !== "sha256" || keys[2] !== "version") {
      throw new Error(`Stage descriptor source ${index} has unexpected fields.`);
    }
    if (actual.version !== expectedEntry.version || actual.file !== expectedEntry.file || actual.sha256 !== expectedEntry.sha256) {
      throw new Error(`Stage descriptor source ${index} differs from the reviewed source set.`);
    }
  }
}

function resolveStageDirectory(stageDirectory) {
  const resolved = resolve(stageDirectory);
  // Keep the stage in a direct local /private/tmp child. A lexical nesting
  // could traverse a symlinked ancestor into iCloud or another external path.
  if (dirname(resolved) !== scratchRoot) {
    throw new Error(`Stage directory must be a direct child of ${scratchRoot}.`);
  }
  assertDirectory(resolved, "stage directory");
  const physicalScratchRoot = realpathSync(scratchRoot);
  const physicalDirectory = realpathSync(resolved);
  if (dirname(physicalDirectory) !== physicalScratchRoot) {
    throw new Error(`Stage directory must physically reside directly under ${scratchRoot}.`);
  }
  return physicalDirectory;
}

/**
 * Fail closed if an existing stage differs from the source-locked prefix. This
 * intentionally verifies copied bytes and rejects extra or symlinked SQL files
 * because --include-all considers every migration file in the directory.
 */
export function verifyStageDirectory(stageDirectory, { requireLinked = false } = {}) {
  const manifest = readManifest();
  const directory = resolveStageDirectory(stageDirectory);
  const stageJsonPath = join(directory, "stage.json");
  assertRegularFile(stageJsonPath, "stage descriptor");
  let descriptor;
  try {
    descriptor = JSON.parse(readFileSync(stageJsonPath, "utf8"));
  } catch (error) {
    throw new Error(`Stage descriptor is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const expected = entriesThroughTarget(manifest, descriptor?.target_version);
  if (!basename(directory).startsWith(`terminalsync-team-${expected.target.version}-`)) {
    throw new Error("Stage directory name does not match its approved target.");
  }
  assertStageDescriptor(descriptor, expected);

  assertOnlyAllowedEntries(directory, new Set(["README.md", "stage.json", "supabase"]), "stage root");
  const readmePath = join(directory, "README.md");
  assertRegularFile(readmePath, "stage README");
  if (readFileSync(readmePath, "utf8") !== stageReadme({ target: expected.target, entries: expected.entries, directory })) {
    throw new Error("Stage README differs from the reviewed operator instructions.");
  }

  const supabaseDirectory = join(directory, "supabase");
  assertDirectory(supabaseDirectory, "stage supabase directory");
  assertOnlyAllowedEntries(supabaseDirectory, new Set(["config.toml", "migrations", ".temp"]), "stage supabase directory");
  const configPath = join(supabaseDirectory, "config.toml");
  assertRegularFile(configPath, "stage config");
  if (readFileSync(configPath, "utf8") !== stageConfig()) {
    throw new Error("Stage config differs from the reviewed local-only config.");
  }

  const migrationsDirectory = join(supabaseDirectory, "migrations");
  assertDirectory(migrationsDirectory, "stage migrations directory");
  const expectedFiles = new Set(expected.entries.map((entry) => entry.file));
  const actualEntries = readdirSync(migrationsDirectory, { withFileTypes: true });
  for (const entry of actualEntries) {
    if (!entry.isFile() || entry.isSymbolicLink() || !expectedFiles.has(entry.name)) {
      throw new Error(`Unexpected or unsafe migration entry in stage: ${entry.name}`);
    }
  }
  if (actualEntries.length !== expected.entries.length) {
    throw new Error("Stage migration directory does not contain exactly the reviewed source set.");
  }
  for (const entry of expected.entries) {
    const copiedPath = join(migrationsDirectory, entry.file);
    assertRegularFile(copiedPath, `staged migration ${entry.file}`);
    if (sha256(copiedPath) !== entry.sha256) {
      throw new Error(`Staged migration hash mismatch for ${entry.file}; stop and regenerate.`);
    }
  }

  const tempDirectory = join(supabaseDirectory, ".temp");
  const linked = existsSync(tempDirectory);
  if (linked) {
    assertDirectory(tempDirectory, "stage link metadata directory");
    const allowedLinkMetadata = new Set([
      "project-ref",
      "linked-project.json",
      "postgres-version",
      "storage-migration",
      "pooler-url",
      "rest-version",
      "gotrue-version",
      "storage-version",
      "cli-latest",
    ]);
    assertOnlyAllowedEntries(tempDirectory, allowedLinkMetadata, "stage link metadata");
    for (const entry of readdirSync(tempDirectory, { withFileTypes: true })) {
      assertRegularFile(join(tempDirectory, entry.name), `stage link metadata ${entry.name}`);
    }
    const linkedProjectPath = join(tempDirectory, "project-ref");
    assertRegularFile(linkedProjectPath, "stage linked project ref");
    if (readFileSync(linkedProjectPath, "utf8").trim() !== expectedProjectRef) {
      throw new Error("Stage link metadata points to an unexpected Supabase project.");
    }
  } else if (requireLinked) {
    throw new Error("Stage is not linked; run the reviewed local supabase link command first.");
  }

  return {
    directory,
    target: expected.target,
    migrationCount: expected.entries.length,
    projectRef: expectedProjectRef,
    linked,
  };
}

export function prepareStage(targetVersion) {
  const manifest = readManifest();
  const expected = entriesThroughTarget(manifest, targetVersion);
  const directory = mkdtempSync(join(scratchRoot, `terminalsync-team-${targetVersion}-`));
  try {
    const migrationsDirectory = join(directory, "supabase", "migrations");
    mkdirSync(migrationsDirectory, { recursive: true });

    for (const entry of expected.entries) {
      const source = sourcePathFor(entry);
      const destination = join(migrationsDirectory, entry.file);
      copyFileSync(source, destination);
      assertRegularFile(destination, `staged migration ${entry.file}`);
      if (sha256(destination) !== entry.sha256) {
        throw new Error(`Copied migration hash mismatch for ${entry.file}; staging was discarded.`);
      }
    }

    writeFileSync(join(directory, "supabase", "config.toml"), stageConfig());
    writeFileSync(join(directory, "README.md"), stageReadme({ target: expected.target, entries: expected.entries, directory }));
    writeFileSync(join(directory, "stage.json"), `${JSON.stringify(stageDescriptor(expected), null, 2)}\n`);

    return verifyStageDirectory(directory);
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}

function isMainModule() {
  return process.argv[1] && resolve(process.argv[1]) === scriptPath;
}

if (isMainModule()) {
  try {
    const { target, stageDirectory, requireLinked } = parseArgs(process.argv.slice(2));
    const result = target
      ? prepareStage(target)
      : verifyStageDirectory(stageDirectory, { requireLinked });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.stderr.write(`${usage()}\n`);
    process.exitCode = 1;
  }
}
