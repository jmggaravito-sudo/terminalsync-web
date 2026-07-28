#!/usr/bin/env node
/**
 * Record a completed marketplace Loop run.
 *
 * This is only the bookkeeping utility that posts the final numbers to
 * /api/internal/loop-runs. It is NOT the Connector Curation Loop entrypoint:
 * the Loop is run by an agent from the approved prompt/protocol, and the agent
 * calls this script after it has opened the draft PR.
 *
 * Usage:
 *   LOOP_RUNS_ENDPOINT=https://terminalsync.ai/api/internal/loop-runs \
 *   LOOP_RUNS_WRITE_TOKEN=... \
 *   node scripts/record_loop_run.mjs --kind connectors --found 3 --skipped 2 --pr https://github.com/owner/repo/pull/123
 *
 * Semantics:
 *   --kind     loop family: connectors, plugins, kits, or skills (default: connectors)
 *   --found    items added/promoted in this run
 *   --skipped  candidates documented as SKIP/deferred in this run
 */

const args = process.argv.slice(2);

function usage(exitCode = 1) {
  const stream = exitCode === 0 ? process.stdout : process.stderr;
  stream.write(
    `Usage: node scripts/record_loop_run.mjs [--kind connectors|plugins|kits|skills] --found N --skipped N --pr https://...\n`,
  );
  process.exit(exitCode);
}

function readFlag(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function parseNonNegativeInteger(flag) {
  const raw = readFlag(flag);
  if (raw == null) throw new Error(`${flag} is required`);
  if (!/^\d+$/.test(raw))
    throw new Error(`${flag} must be a non-negative integer`);
  return Number(raw);
}

const ALLOWED_KINDS = new Set(["connectors", "plugins", "kits", "skills"]);

function parseKind() {
  const raw = readFlag("--kind") ?? "connectors";
  const kind = raw.trim().toLowerCase();
  if (!ALLOWED_KINDS.has(kind)) {
    throw new Error("--kind must be one of: connectors, plugins, kits, skills");
  }
  return kind;
}

function parsePrUrl() {
  const raw = readFlag("--pr");
  if (raw == null) throw new Error("--pr is required");
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") throw new Error("not https");
    return trimmed;
  } catch {
    throw new Error("--pr must be a valid https URL");
  }
}

if (args.includes("--help") || args.includes("-h")) usage(0);

let kind;
let itemsFound;
let itemsSkipped;
let prUrl;
try {
  kind = parseKind();
  itemsFound = parseNonNegativeInteger("--found");
  itemsSkipped = parseNonNegativeInteger("--skipped");
  prUrl = parsePrUrl();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  usage(1);
}

const endpoint =
  process.env.LOOP_RUNS_ENDPOINT ||
  (process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api/internal/loop-runs`
    : null);
const token = process.env.LOOP_RUNS_WRITE_TOKEN;

if (!endpoint) {
  console.error("Missing LOOP_RUNS_ENDPOINT or NEXT_PUBLIC_SITE_URL");
  process.exit(1);
}
if (!token) {
  console.error("Missing LOOP_RUNS_WRITE_TOKEN");
  process.exit(1);
}

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    kind,
    itemsFound,
    itemsSkipped,
    // Back-compat while the server/API migrates across deployments.
    connectorsFound: itemsFound,
    connectorsSkipped: itemsSkipped,
    prUrl,
  }),
});

const text = await res.text();
let json = null;
try {
  json = text ? JSON.parse(text) : null;
} catch {
  // Keep raw text below for non-JSON failures.
}

if (!res.ok) {
  console.error(`loop run history: failed ${res.status} ${text}`);
  process.exit(1);
}

const run = json?.run;
console.log(
  `loop run history: recorded kind=${run?.kind ?? kind}${run?.id ? ` id=${run.id}` : ""}${run?.ran_at ? ` ran_at=${run.ran_at}` : ""}`,
);
