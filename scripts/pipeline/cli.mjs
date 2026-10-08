#!/usr/bin/env node
// Thin CLI over lib.mjs so the workflow stays declarative.
//   cli.mjs research-validate <research.json>             -> key=value lines (GITHUB_OUTPUT)
//   cli.mjs build-validate <build.json>                   -> key=value lines
//   cli.mjs scope <slug> <files.txt>                      -> JSON, exit 1 when out of scope
//   cli.mjs decide <dir> <files.txt> <automerge> <dryRun> -> writes <dir>/decision.json, key=value lines
//   cli.mjs report <dir> [merged] [mergeNote] [checks]    -> markdown on stdout
import fs from "node:fs";
import path from "node:path";
import {
  REVIEW_ROLES,
  buildReport,
  checkScope,
  decide,
  validateResearch,
} from "./lib.mjs";

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function readLines(file) {
  try {
    return fs.readFileSync(file, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function loadReviews(dir) {
  const byRole = {};
  for (const role of REVIEW_ROLES) byRole[role] = readJson(path.join(dir, `review-${role}.json`));
  return byRole;
}

const [cmd, ...args] = process.argv.slice(2);

switch (cmd) {
  case "research-validate": {
    const r = readJson(args[0]);
    const v = validateResearch(r);
    if (!v.ok) {
      console.error(`research.json invalid:\n- ${v.errors.join("\n- ")}`);
      process.exit(1);
    }
    console.log(`verdict=${r.verdict}`);
    console.log(`slug=${r.slug}`);
    console.log(`conversational=${r.conversational_install}`);
    break;
  }
  case "build-validate": {
    const b = readJson(args[0]);
    const pr = Number(b?.pr);
    if (!b || !Number.isInteger(pr) || pr <= 0 || typeof b.branch !== "string" || !b.branch.startsWith("loop/")) {
      console.error("build.json invalid: need { pr: <number>, branch: 'loop/...' }");
      process.exit(1);
    }
    console.log(`pr=${pr}`);
    console.log(`branch=${b.branch}`);
    break;
  }
  case "scope": {
    const result = checkScope(args[0], readLines(args[1]));
    console.log(JSON.stringify(result));
    process.exit(result.ok ? 0 : 1);
    break;
  }
  case "decide": {
    const [dir, filesFile, automerge, dryRun] = args;
    const research = readJson(path.join(dir, "research.json"));
    const scope = research?.slug ? checkScope(research.slug, readLines(filesFile)) : null;
    const decision = decide({
      research,
      scope,
      reviewsByRole: loadReviews(dir),
      automerge: automerge === "true",
      dryRun: dryRun === "true",
    });
    fs.writeFileSync(path.join(dir, "decision.json"), JSON.stringify({ ...decision, scope }, null, 2));
    console.log(`action=${decision.action}`);
    console.log(`needs_fix=${decision.action === "fix"}`);
    break;
  }
  case "report": {
    const [dir, merged, mergeNote, checks] = args;
    const research = readJson(path.join(dir, "research.json"));
    const build = readJson(path.join(dir, "build.json"));
    const decision = readJson(path.join(dir, "decision.json"));
    console.log(
      buildReport({
        research,
        build,
        decision,
        merged: merged === "true",
        mergeNote: mergeNote || undefined,
        checks: checks || undefined,
      }),
    );
    break;
  }
  default:
    console.error("usage: cli.mjs research-validate|build-validate|scope|decide|report ...");
    process.exit(2);
}
