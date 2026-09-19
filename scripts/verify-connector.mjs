#!/usr/bin/env node

/**
 * Verify the local stdio connector contract used by TerminalSync's single AI.
 *
 * This intentionally never invokes a shell. It installs each npm package with
 * scripts disabled, starts the resolved bin/main with node, performs the MCP
 * handshake, and writes the resulting evidence back to both language fichas.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

export const REASONS = new Set([
  "ok", "no-manifest", "recipe-not-npx", "package-invalid", "install-failed",
  "no-entrypoint", "handshake-timeout", "no-jsonrpc-id", "no-usable-tools",
  "needs-postinstall", "env-denied", "unverified-needs-key", "needs-oauth",
]);
const SLUG_RE = /^[a-z0-9-]{1,40}$/;
const TOOL_RE = /^[A-Za-z0-9_-]{1,64}$/;
const DENIED_ENV_RE = /^(PATH|NODE_OPTIONS|NPM_CONFIG_.*|LD_.*|DYLD_.*)$/i;
const PACKAGE_RE = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONNECTOR_DIRS = ["content/connectors/en", "content/connectors/es"];
const FIRST_PARTY = new Set(["memory", "meta-ads", "meta-social"]);
const OAUTH_CONNECTORS = new Set(["gmail", "google-calendar", "google-sheets"]);
const KEY_REQUIRED_CONNECTORS = new Set(["postgres", "neon", "mongodb", "stripe", "todoist", "elasticsearch", "pipedream", "monday"]);

function parseArgs(argv) {
  const out = { all: false, write: false, json: false, file: [], concurrency: 2 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--all") out.all = true;
    else if (arg === "--write") out.write = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--concurrency") out.concurrency = Math.max(1, Number(argv[++i] || 2));
    else if (arg === "--file") out.file.push(argv[++i]);
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node scripts/verify-connector.mjs --all [--write] [--json]\n       node scripts/verify-connector.mjs --file path [--write]");
      process.exit(0);
    }
    else throw new Error(`unknown argument: ${arg}`);
  }
  if (!out.all && !out.file.length) throw new Error("choose --all or --file");
  return out;
}

function slugFromFile(file) { return path.basename(file, ".md"); }

export function validateSlug(slug) {
  if (!SLUG_RE.test(slug) || slug.includes("__") || slug.startsWith("_") || slug.endsWith("_")) return false;
  return !new Set(["memory", "agent-secret", "meta-ads", "meta-social", "mcp"]).has(slug);
}

function secretNames(manifest) {
  const found = new Set(Array.isArray(manifest.secrets) ? manifest.secrets.filter((x) => typeof x === "string") : []);
  const text = JSON.stringify(manifest);
  for (const match of text.matchAll(/\$\{SECRET:([A-Z0-9_]+)\}/g)) found.add(match[1]);
  return found;
}

function replaceSecrets(value) {
  return typeof value === "string" ? value.replace(/\$\{SECRET:[A-Z0-9_]+\}/g, "smoke") : value;
}

export function parseRecipe(server) {
  if (!server || server.command !== "npx" || !Array.isArray(server.args)) return { reason: "recipe-not-npx" };
  const args = server.args;
  let packageSpec = null;
  let index = 0;
  const runtimeArgs = [];
  while (index < args.length) {
    const token = args[index];
    if (packageSpec === null) {
      if (["-y", "--yes", "-q", "--quiet", "--silent"].includes(token)) { index += 1; continue; }
      if (token === "--registry" || token === "--package") {
        if (typeof args[index + 1] !== "string") return { reason: "recipe-not-npx" };
        if (token === "--package") packageSpec = args[index + 1];
        index += 2; continue;
      }
      if (token.startsWith("--registry=")) { index += 1; continue; }
      if (token === "--") { index += 1; continue; }
      if (token.startsWith("-")) return { reason: "recipe-not-npx" };
      packageSpec = token;
      index += 1;
      continue;
    }
    runtimeArgs.push(token);
    index += 1;
  }
  if (!packageSpec || packageSpec === "mcp-remote" || packageSpec.startsWith("mcp-remote@")) return { reason: "recipe-not-npx" };
  const at = packageSpec.startsWith("@") ? packageSpec.indexOf("@", 1 + packageSpec.indexOf("/")) : packageSpec.indexOf("@");
  const packageName = at > 0 ? packageSpec.slice(0, at) : packageSpec;
  const version = at > 0 ? packageSpec.slice(at + 1) : null;
  if (!PACKAGE_RE.test(packageName) || packageName.includes("..") || /[A-Z]/.test(packageName) || /^(?:https?:|git\+|file:|\.|\/)/.test(packageSpec)) return { reason: "package-invalid" };
  return { packageName, packageSpec, version, runtimeArgs };
}

function getStdioServer(data) {
  const servers = data?.manifest?.mcpServers;
  if (!servers || typeof servers !== "object" || Array.isArray(servers)) return null;
  const entries = Object.values(servers);
  return entries.length === 1 && entries[0] && typeof entries[0] === "object" ? entries[0] : null;
}

function resolveEntry(packageDir, packageJson) {
  let relative;
  if (packageJson.bin) {
    if (typeof packageJson.bin === "string") relative = packageJson.bin;
    else if (packageJson.bin && typeof packageJson.bin === "object") relative = Object.values(packageJson.bin)[0];
  }
  if (!relative) relative = packageJson.main || "index.js";
  const candidate = path.resolve(packageDir, relative);
  if (!candidate.startsWith(`${packageDir}${path.sep}`) && candidate !== packageDir) return null;
  const variants = [candidate, `${candidate}.js`, `${candidate}.mjs`, `${candidate}.cjs`, path.join(candidate, "index.js")];
  return variants.find((p) => fs.existsSync(p) && fs.statSync(p).isFile()) || null;
}

function jsonRpc(id, method, params = {}) { return `${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`; }

async function handshake(entry, args, env, allowAuthFailure, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [entry, ...args], { cwd: path.dirname(entry), env, stdio: ["pipe", "pipe", "pipe"], shell: false });
    let buffer = ""; let stderr = ""; let expectedId = 1; let initialized = false; let tools = null; let authFailure = false; let settled = false;
    const finish = (result) => { if (settled) return; settled = true; clearTimeout(timer); child.kill("SIGTERM"); setTimeout(() => child.kill("SIGKILL"), 100).unref(); resolve(result); };
    const timer = setTimeout(() => finish({ reason: allowAuthFailure ? "unverified-needs-key" : "handshake-timeout", stderr }), timeoutMs);
    child.stdin.on("error", () => finish({ reason: allowAuthFailure ? "unverified-needs-key" : "handshake-timeout", stderr }));
    const consume = () => {
      while (buffer.includes("\n")) {
        const line = buffer.slice(0, buffer.indexOf("\n")).trim(); buffer = buffer.slice(buffer.indexOf("\n") + 1);
        if (!line || line.startsWith("event:")) continue;
        let message; try { message = JSON.parse(line); } catch { continue; }
        if (!("id" in message)) return finish({ reason: "no-jsonrpc-id", stderr });
        const responseId = message.id;
        if (responseId !== expectedId) continue;
        if (responseId === 1 && ("result" in message || "error" in message)) {
          if (message.error) return finish({ reason: "handshake-timeout", detail: message.error.message });
          initialized = true; expectedId = 2;
          try { child.stdin.write(jsonRpc(2, "tools/list")); } catch { finish({ reason: allowAuthFailure ? "unverified-needs-key" : "handshake-timeout", stderr }); }
        } else if (responseId === 2 && ("result" in message || "error" in message)) {
          if (message.error) { authFailure = /auth|token|key|unauthor|forbidden|credential/i.test(String(message.error.message)); tools = []; }
          else tools = Array.isArray(message.result?.tools) ? message.result.tools : [];
          if (authFailure && allowAuthFailure) return finish({ tools: [], unverifiedNeedsKey: true, stderr });
          if (!initialized || !tools) return finish({ reason: "handshake-timeout" });
          return finish({ tools });
        }
      }
    };
    child.stdout.on("data", (chunk) => { buffer += chunk.toString(); consume(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", () => finish({ reason: allowAuthFailure ? "unverified-needs-key" : "handshake-timeout", stderr }));
    child.on("close", () => {
      if (settled) return;
      const text = stderr.toLowerCase();
      if (/oauth|authorize|authorization|browser|login/.test(text)) return finish({ reason: "needs-oauth", stderr });
      if (allowAuthFailure && /secret|token|key|credential|api[_ -]?key|environment|env\./.test(text)) return finish({ reason: "unverified-needs-key", stderr });
      finish({ reason: "handshake-timeout", stderr });
    });
    try { child.stdin.write(jsonRpc(1, "initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "terminalsync-supervisor", version: "1.0.0" } })); } catch { finish({ reason: allowAuthFailure ? "unverified-needs-key" : "handshake-timeout", stderr }); }
  });
}

function usableTools(slug, tools) {
  const accepted = tools.map((tool) => ({ tool, name: `${slug}__${tool?.name || ""}` })).filter(({ name }) => TOOL_RE.test(name)).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 40);
  return { count: accepted.length, readOnly: accepted.filter(({ tool }) => tool?.annotations?.readOnlyHint === true).length };
}

function baseResult(slug, reason, verifiedAt, packageVersion = null) {
  return { slug, installableForAi: false, installableForAiReason: reason, aiToolsCount: 0, aiReadOnlyTools: 0, verifiedAt, verifiedPackageVersion: packageVersion };
}

export async function verifyFile(file, { verifiedAt = new Date().toISOString(), npmCommand = "npm" } = {}) {
  const slug = slugFromFile(file); const parsed = matter(fs.readFileSync(file, "utf8"));
  if (FIRST_PARTY.has(slug)) return { slug, firstParty: true };
  if (!validateSlug(slug)) return baseResult(slug, "package-invalid", verifiedAt);
  const server = getStdioServer(parsed.data); if (!server) return baseResult(slug, "no-manifest", verifiedAt);
  const recipe = parseRecipe(server); if (recipe.reason) return baseResult(slug, recipe.reason, verifiedAt);
  const envInput = server.env && typeof server.env === "object" ? server.env : {};
  for (const key of Object.keys(envInput)) if (DENIED_ENV_RE.test(key)) return baseResult(slug, "env-denied", verifiedAt);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "ts-connector-"));
  try {
    const install = spawnSync(npmCommand, ["install", "--ignore-scripts", "--no-package-lock", "--omit=dev", recipe.packageSpec], { cwd: temp, encoding: "utf8", timeout: 120000, shell: false });
    if (install.error || install.status !== 0) return baseResult(slug, "install-failed", verifiedAt);
    const packageDir = path.join(temp, "node_modules", ...recipe.packageName.split("/"));
    const packageJsonPath = path.join(packageDir, "package.json");
    if (!fs.existsSync(packageJsonPath)) return baseResult(slug, "no-entrypoint", verifiedAt);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (packageJson.scripts?.postinstall) return { ...baseResult(slug, "needs-postinstall", verifiedAt), verifiedPackageVersion: packageJson.version || null };
    const entry = resolveEntry(packageDir, packageJson); if (!entry) return { ...baseResult(slug, "no-entrypoint", verifiedAt), verifiedPackageVersion: packageJson.version || null };
    const env = { ...process.env }; delete env.NODE_OPTIONS; delete env.NPM_CONFIG_USERCONFIG;
    for (const [key, value] of Object.entries(envInput)) env[key] = replaceSecrets(value);
    const args = recipe.runtimeArgs.map(replaceSecrets);
    const allowAuthFailure = secretNames({ ...server, secrets: parsed.data.secrets }).size > 0;
    const result = await handshake(entry, args, env, allowAuthFailure);
    if (OAUTH_CONNECTORS.has(slug) && ["handshake-timeout", "unverified-needs-key"].includes(result.reason)) return { ...baseResult(slug, "needs-oauth", verifiedAt), verifiedPackageVersion: packageJson.version || null };
    if (KEY_REQUIRED_CONNECTORS.has(slug) && result.reason !== "no-jsonrpc-id" && ["handshake-timeout", "needs-oauth", "unverified-needs-key"].includes(result.reason)) return { slug, installableForAi: true, installableForAiReason: "unverified-needs-key", aiToolsCount: 0, aiReadOnlyTools: 0, verifiedAt, verifiedPackageVersion: packageJson.version || null, verifiedWithoutKey: false };
    if (result.reason === "unverified-needs-key" || (result.reason === "handshake-timeout" && allowAuthFailure)) return { slug, installableForAi: true, installableForAiReason: "unverified-needs-key", aiToolsCount: 0, aiReadOnlyTools: 0, verifiedAt, verifiedPackageVersion: packageJson.version || null, verifiedWithoutKey: false };
    if (result.reason) {
      return { ...baseResult(slug, result.reason, verifiedAt), verifiedPackageVersion: packageJson.version || null };
    }
    const counts = usableTools(slug, result.tools || []);
    if (result.unverifiedNeedsKey) return { slug, installableForAi: true, installableForAiReason: "unverified-needs-key", aiToolsCount: counts.count, aiReadOnlyTools: counts.readOnly, verifiedAt, verifiedPackageVersion: packageJson.version || null, verifiedWithoutKey: false };
    if (!counts.count) return { ...baseResult(slug, "no-usable-tools", verifiedAt), verifiedPackageVersion: packageJson.version || null };
    return { slug, installableForAi: true, installableForAiReason: "ok", aiToolsCount: counts.count, aiReadOnlyTools: counts.readOnly, verifiedAt, verifiedPackageVersion: packageJson.version || null };
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
}

function writeResult(file, result) {
  const raw = fs.readFileSync(file, "utf8");
  const keys = ["installableForAi", "installableForAiReason", "aiToolsCount", "aiReadOnlyTools", "verifiedAt", "verifiedPackageVersion", "verifiedWithoutKey"];
  const values = result.firstParty ? { firstParty: true } : Object.fromEntries(keys.filter((key) => key in result).map((key) => [key, result[key]]));
  const rendered = Object.entries(values).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) { fs.writeFileSync(file, `---\n${rendered}\n---\n${raw}`); return; }
  const front = match[1].split(/\r?\n/).filter((line) => !keys.concat("firstParty").some((key) => line.startsWith(`${key}:`)));
  fs.writeFileSync(file, `---\n${front.join("\n")}\n${rendered}\n---\n${raw.slice(match[0].length)}`);
}

function collectFiles(files, all) {
  if (!all) return files.map((file) => path.resolve(file));
  return CONNECTOR_DIRS.flatMap((dir) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(".md")).map((f) => path.join(ROOT, dir, f)));
}

export async function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv); const files = collectFiles(options.file, options.all); const verifiedAt = new Date().toISOString();
  const bySlug = new Map();
  for (const file of files) { const slug = slugFromFile(file); if (!bySlug.has(slug)) bySlug.set(slug, []); bySlug.get(slug).push(file); }
  const grouped = new Map();
  const entries = [...bySlug.entries()];
  const queue = [...entries];
  const worker = async () => {
    while (queue.length) {
      const [slug, slugFiles] = queue.shift();
      const result = await verifyFile(slugFiles[0], { verifiedAt });
      grouped.set(slug, result);
    }
  };
  await Promise.all(Array.from({ length: Math.min(options.concurrency, entries.length) }, worker));
  for (const [slug, slugFiles] of entries) {
    const result = grouped.get(slug);
    grouped.set(slug, result);
    if (options.write) for (const file of slugFiles) writeResult(file, result);
  }
  const results = [...grouped.values()];
  const firstParty = results.filter((r) => r.firstParty);
  const supervised = results.filter((r) => !r.firstParty);
  const report = { verifiedAt, catalogTotal: results.length, firstParty: firstParty.map((r) => r.slug), total: supervised.length, installable: supervised.filter((r) => r.installableForAi && r.installableForAiReason === "ok").length, unverifiedNeedsKey: supervised.filter((r) => r.installableForAiReason === "unverified-needs-key").length, false: supervised.filter((r) => !r.installableForAi).map((r) => ({ slug: r.slug, reason: r.installableForAiReason })), results };
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else { console.log(`Verified ${report.total} connector fichas (${report.installable} installable).`); for (const item of report.false) console.log(`- ${item.slug}: ${item.reason}`); }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run().catch((error) => { console.error(error.stack || error); process.exit(1); });
