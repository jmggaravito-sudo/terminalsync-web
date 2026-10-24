import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  prepareStage,
  validateTeamStageManifest,
  verifyStageDirectory,
} from "./prepare-team-migration-stage.mjs";

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(scriptsDirectory, "../supabase/migration-history/team-production-single-target-manifest.json");
const manifest = () => JSON.parse(readFileSync(manifestPath, "utf8"));

function withStage(target, callback) {
  const result = prepareStage(target);
  try {
    callback(result);
  } finally {
    rmSync(result.directory, { recursive: true, force: true });
  }
}

function runGeneratedCliGuard(block, version) {
  const commandStart = block.indexOf('     "$SUPABASE_CLI_BIN" --workdir');
  assert.notEqual(commandStart, -1, "generated block must invoke the resolved CLI");
  const guardOnly = `${block.slice(0, commandStart)}     print -r -- guard-ok\n   )`;
  const fakeBinDirectory = mkdtempSync(join(tmpdir(), "terminalsync-fake-supabase-"));
  const fakeCli = join(fakeBinDirectory, "supabase");
  writeFileSync(
    fakeCli,
    `#!/bin/sh\nif [ "$1" = "--version" ]; then\n  printf '%s\\n' '${version}'\n  exit 0\nfi\nexit 42\n`,
  );
  chmodSync(fakeCli, 0o755);
  try {
    return spawnSync("/bin/zsh", ["-c", guardOnly], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${fakeBinDirectory}:${process.env.PATH ?? ""}` },
    });
  } finally {
    rmSync(fakeBinDirectory, { recursive: true, force: true });
  }
}

test("prepares and verifies an isolated prefix through exactly one approved Team target", () => {
  withStage("0047", (result) => {
    assert.equal(result.target.version, "0047");
    assert.equal(result.migrationCount, 41); // 34 remote records + seven Team targets through 0047
    const stage = JSON.parse(readFileSync(join(result.directory, "stage.json"), "utf8"));
    assert.equal(stage.project_ref, "zwyeqqxiwiogmtqwfnby");
    assert.deepEqual(stage.sources.slice(-7).map((entry) => entry.version), ["0039", "0040", "0041", "0042", "0043", "0044", "0047"]);
    assert.equal(stage.sources.some((entry) => entry.version === "0045"), false);
    assert.equal(stage.sources.some((entry) => entry.version === "0046"), false);
    assert.equal(existsSync(join(result.directory, "supabase", "migrations", "0047_team_invitation_owner_alias_projection.sql")), true);
    assert.equal(existsSync(join(result.directory, "supabase", "migrations", "0048_team_request_participant_projection.sql")), false);
    assert.equal(verifyStageDirectory(result.directory).linked, false);
    const readme = readFileSync(join(result.directory, "README.md"), "utf8");
    assert.match(readme, /--verify-stage/);
    const zshBlocks = [...readme.matchAll(/```zsh\n([\s\S]*?)\n\s*```/g)].map((match) => match[1]);
    assert.equal(zshBlocks.length, 3);
    for (const block of zshBlocks) {
      assert.match(block, /SUPABASE_CLI_BIN="\$\(command -v supabase\)"/);
      assert.match(block, /\[\[ "\$SUPABASE_CLI_BIN" != \/\* \|\| ! -f "\$SUPABASE_CLI_BIN" \|\| ! -x "\$SUPABASE_CLI_BIN" \]\]/);
      assert.match(block, /if \[\[ "\$actual_version" != '2\.121\.0' \]\]/);
      assert.match(block, /if ! require_reviewed_supabase_cli; then\n       exit 1\n     fi/);
    }
    assert.match(zshBlocks[0], /"\$SUPABASE_CLI_BIN" --workdir "\$\{STAGE\}" --profile supabase link --project-ref zwyeqqxiwiogmtqwfnby/);
    assert.match(zshBlocks[1], /"\$SUPABASE_CLI_BIN" --workdir "\$\{STAGE\}" --profile supabase db push --linked --include-all --skip-vault --dry-run/);
    assert.match(zshBlocks[2], /"\$SUPABASE_CLI_BIN" --workdir "\$\{STAGE\}" --profile supabase db push --linked --include-all --skip-vault/);
    for (const pushBlock of zshBlocks.slice(1)) {
      const guard = pushBlock.indexOf("if ! require_reviewed_supabase_cli; then");
      const exportPassword = pushBlock.indexOf("export SUPABASE_DB_PASSWORD");
      const push = pushBlock.indexOf('"$SUPABASE_CLI_BIN" --workdir');
      assert.ok(guard >= 0 && guard < exportPassword && exportPassword < push);
    }
    const rejectedGuard = runGeneratedCliGuard(zshBlocks[0], "2.98.1");
    assert.equal(rejectedGuard.status, 1);
    assert.match(rejectedGuard.stderr, /Expected Supabase CLI 2\.121\.0, got 2\.98\.1; aborting\./);
    assert.doesNotMatch(rejectedGuard.stdout, /guard-ok/);
    const acceptedGuard = runGeneratedCliGuard(zshBlocks[0], "2.121.0");
    assert.equal(acceptedGuard.status, 0);
    assert.match(acceptedGuard.stdout, /guard-ok/);
    assert.doesNotMatch(readme, /shasum -a 256/);
    assert.doesNotMatch(readme, /db push[^\n]*--yes/);
    assert.match(readme, /outside the stage .*\/private\/tmp/s);
    assert.match(readme, /unset SUPABASE_DB_PASSWORD SUPABASE_DB_POOLER_CONNECTION_STRING SUPABASE_PROJECT_ID PROJECT_ID SUPABASE_PROFILE SUPABASE_DEBUG SUPABASE_ENV SUPABASE_WORKDIR SUPABASE_HOME SUPABASE_YES SUPABASE_CLI_BIN/);
    assert.match(readme, /Database password required; aborting\./);
  });
});

test("permits the first and last reviewed targets only with their exact prefixes", () => {
  withStage("0039", (first) => {
    assert.equal(first.migrationCount, 35);
    assert.equal(first.target.file, "0039_team_shared_spaces_metadata.sql");
  });
  withStage("20261024000000", (last) => {
    const stage = JSON.parse(readFileSync(join(last.directory, "stage.json"), "utf8"));
    assert.equal(last.migrationCount, 48);
    assert.deepEqual(stage.sources.slice(-14).map((entry) => entry.version), [
      "0039", "0040", "0041", "0042", "0043", "0044", "0047", "0048", "0053", "0054", "0055", "0056", "0058", "20261024000000",
    ]);
    for (const excluded of ["0045", "0046", "0049", "0050", "0051", "0052", "0057"]) {
      assert.equal(stage.sources.some((entry) => entry.version === excluded), false, `must exclude ${excluded}`);
    }
  });
});

test("rejects a target outside the reviewed no-card Team chain", () => {
  assert.throws(() => prepareStage("0045"), /Unsupported Team target 0045/);
});

test("fails closed when manifest edits widen, reorder, or retarget the allowlist", () => {
  const appendedPaid = manifest();
  appendedPaid.target_chain.push({
    version: "0045",
    file: "0045_team_paid_roster.sql",
    sha256: "0".repeat(64),
  });
  assert.throws(() => validateTeamStageManifest(appendedPaid), /target_chain versions differs/);

  const reordered = manifest();
  [reordered.target_chain[6], reordered.target_chain[7]] = [reordered.target_chain[7], reordered.target_chain[6]];
  assert.throws(() => validateTeamStageManifest(reordered), /target_chain versions differs/);

  const missingFinal = manifest();
  missingFinal.target_chain.pop();
  assert.throws(() => validateTeamStageManifest(missingFinal), /target_chain versions differs/);

  const exclusionChanged = manifest();
  exclusionChanged.excluded_versions.reverse();
  assert.throws(() => validateTeamStageManifest(exclusionChanged), /excluded_versions differs/);

  const wrongProject = manifest();
  wrongProject.project_ref = "aaaaaaaaaaaaaaaaaaaa";
  assert.throws(() => validateTeamStageManifest(wrongProject), /reviewed project/);
});

test("stage verifier rejects a missing, modified, extra, symlinked, or self-described-mismatched migration", () => {
  withStage("0047", (result) => {
    const migrations = join(result.directory, "supabase", "migrations");
    unlinkSync(join(migrations, "0047_team_invitation_owner_alias_projection.sql"));
    assert.throws(() => verifyStageDirectory(result.directory), /does not contain exactly|Missing staged migration/);
  });

  withStage("0047", (result) => {
    appendFileSync(join(result.directory, "supabase", "migrations", "0047_team_invitation_owner_alias_projection.sql"), "\n-- tamper\n");
    assert.throws(() => verifyStageDirectory(result.directory), /hash mismatch/);
  });

  withStage("0047", (result) => {
    writeFileSync(join(result.directory, "supabase", "migrations", "9999_unreviewed.sql"), "select 1;\n");
    assert.throws(() => verifyStageDirectory(result.directory), /Unexpected or unsafe migration entry/);
  });

  withStage("0047", (result) => {
    const migration = join(result.directory, "supabase", "migrations", "0047_team_invitation_owner_alias_projection.sql");
    const sameContent = join("/private/tmp", `terminalsync-team-same-content-${process.pid}-${Date.now()}.sql`);
    writeFileSync(sameContent, readFileSync(migration));
    try {
      unlinkSync(migration);
      symlinkSync(sameContent, migration);
      assert.throws(() => verifyStageDirectory(result.directory), /Unexpected or unsafe migration entry|non-symlink/);
    } finally {
      if (existsSync(sameContent)) unlinkSync(sameContent);
    }
  });

  withStage("0047", (result) => {
    const descriptorPath = join(result.directory, "stage.json");
    const descriptor = JSON.parse(readFileSync(descriptorPath, "utf8"));
    descriptor.project_ref = "aaaaaaaaaaaaaaaaaaaa";
    descriptor.sources[0].sha256 = "0".repeat(64);
    writeFileSync(descriptorPath, `${JSON.stringify(descriptor)}\n`);
    assert.throws(() => verifyStageDirectory(result.directory), /project ref does not match/);
  });
});

test("stage verifier rejects README tampering and root or Supabase environment injection", () => {
  withStage("0039", (result) => {
    appendFileSync(join(result.directory, "README.md"), "\nmalicious instruction\n");
    assert.throws(() => verifyStageDirectory(result.directory), /README differs/);
  });

  withStage("0039", (result) => {
    writeFileSync(join(result.directory, ".env"), "SUPABASE_PROJECT_ID=aaaaaaaaaaaaaaaaaaaa\n");
    assert.throws(() => verifyStageDirectory(result.directory), /Unexpected or unsafe stage root entry: .env/);
  });

  withStage("0039", (result) => {
    writeFileSync(join(result.directory, "supabase", ".env"), "SUPABASE_DEBUG=true\n");
    assert.throws(() => verifyStageDirectory(result.directory), /Unexpected or unsafe stage supabase directory entry: .env/);
  });
});

test("stage verifier rejects nested or symlinked stage paths outside its direct local scratch boundary", () => {
  withStage("0039", (result) => {
    const nested = join(result.directory, "nested");
    mkdirSync(nested);
    assert.throws(() => verifyStageDirectory(nested), /direct child/);

    const symlinkedStage = join("/private/tmp", `terminalsync-team-symlink-${process.pid}-${Date.now()}`);
    symlinkSync(result.directory, symlinkedStage);
    try {
      assert.throws(() => verifyStageDirectory(symlinkedStage), /not a symlink/);
    } finally {
      unlinkSync(symlinkedStage);
    }
  });
});

test("requires exact verified link metadata only when an operator asks for a linked stage", () => {
  withStage("0039", (result) => {
    assert.throws(() => verifyStageDirectory(result.directory, { requireLinked: true }), /not linked/);
    const tempDirectory = join(result.directory, "supabase", ".temp");
    mkdirSync(tempDirectory);
    writeFileSync(join(tempDirectory, "project-ref"), "aaaaaaaaaaaaaaaaaaaa\n");
    assert.throws(() => verifyStageDirectory(result.directory, { requireLinked: true }), /unexpected Supabase project/);
    writeFileSync(join(tempDirectory, "project-ref"), "zwyeqqxiwiogmtqwfnby\n");
    writeFileSync(join(tempDirectory, "postgres-version"), "17.0\n");
    assert.equal(verifyStageDirectory(result.directory, { requireLinked: true }).linked, true);
    writeFileSync(join(tempDirectory, "unexpected"), "unsafe\n");
    assert.throws(() => verifyStageDirectory(result.directory, { requireLinked: true }), /Unexpected or unsafe stage link metadata entry: unexpected/);
  });
});
