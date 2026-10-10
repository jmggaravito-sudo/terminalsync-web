#!/usr/bin/env node

/**
 * Smoke the login step of remote (mcp-remote) connectors, with no vendor account.
 *
 * Runs the REAL mcp-remote against the vendor URL and checks that it reaches the
 * browser authorization step. That is exactly where two shipped connectors were
 * broken without anyone noticing (2026-10-08): Siigo's URL answered 404, and
 * Asana /v2/mcp and Zoom have no dynamic client registration, so no one could ever
 * log in. It does NOT complete a login (that needs a human with an account).
 *
 * Isolated: fresh MCP_REMOTE_CONFIG_DIR per connector (never touches ~/.mcp-auth) and a
 * fake `open`/`xdg-open` first in PATH so no browser is launched.
 *
 *   node scripts/smoke-remote-login.mjs --all
 *   node scripts/smoke-remote-login.mjs --files content/connectors/en/asana.md ...
 *   node scripts/smoke-remote-login.mjs --slugs siigo,asana
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { getStdioServer, isMcpRemote } from "./verify-connector.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EN_DIR = path.join(ROOT, "content/connectors/en");
const WAIT_MS = 25000;

/** The vendor URL a remote recipe points at, or null. */
export function extractRemoteUrl(server) {
  if (!isMcpRemote(server)) return null;
  return server.args.find((a) => typeof a === "string" && /^https:\/\//.test(a)) || null;
}

/** Turn mcp-remote's stderr into a verdict. */
export function classifyOutput(stderr, openedUrl) {
  const text = String(stderr || "");
  if (/does not support dynamic client registration/i.test(text)) {
    return { ok: false, reason: "no-dcr", detail: "the OAuth server has no dynamic client registration; mcp-remote cannot log in" };
  }
  if (openedUrl || /Please authorize this client by visiting|Authentication required\. Waiting for authorization/i.test(text)) {
    return { ok: true, reason: "reaches-login", detail: "reached the authorization step" };
  }
  const http = text.match(/status[ :(]+(4\d\d|5\d\d)/i);
  if (http) return { ok: false, reason: `http-${http[1]}`, detail: `the endpoint answered ${http[1]} before login (wrong URL?)` };
  const fatal = text.match(/(Fatal error|Connection error)[^\n]{0,160}/i);
  return { ok: false, reason: "no-login", detail: fatal ? fatal[0] : "never reached the authorization step" };
}

export function remoteTargets(slugs) {
  const out = [];
  for (const slug of slugs) {
    const file = path.join(EN_DIR, `${slug}.md`);
    if (!fs.existsSync(file)) continue;
    const data = matter(fs.readFileSync(file, "utf8")).data;
    const url = extractRemoteUrl(getStdioServer(data));
    if (!url) continue;
    // Already declared blocked (e.g. zoom): it is expected not to log in.
    if (data.installableForAi === false) continue;
    out.push({ slug, url });
  }
  return out;
}

function smokeOne({ slug, url }, mcpRemoteEntry, work) {
  return new Promise((resolve) => {
    const bin = path.join(work, "fakebin");
    const cfg = path.join(work, "cfg", slug);
    fs.mkdirSync(cfg, { recursive: true });
    const log = path.join(work, `open-${slug}.log`);
    const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, MCP_REMOTE_CONFIG_DIR: cfg, OPEN_LOG: log };
    const child = spawn(process.execPath, [mcpRemoteEntry, url, "--auth-timeout", "10"], { env, stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    child.stdin.on("error", () => {});
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "terminalsync-login-smoke", version: "1.0.0" } } }) + "\n");
    let done = false;
    let timer;
    let poll;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearInterval(poll);
      try { child.kill("SIGKILL"); } catch {}
      const opened = fs.existsSync(log) ? fs.readFileSync(log, "utf8").trim() : "";
      resolve({ slug, url, ...classifyOutput(stderr, opened) });
    };
    timer = setTimeout(finish, WAIT_MS);
    // Decide as soon as the outcome is known instead of waiting the full window.
    poll = setInterval(() => {
      if (/does not support dynamic client registration|Please authorize this client|Waiting for authorization|Fatal error/i.test(stderr) || fs.existsSync(log)) finish();
    }, 300);
    child.on("exit", finish);
  });
}

export async function run(argv = process.argv.slice(2)) {
  const arg = (name) => { const i = argv.indexOf(name); return i === -1 ? null : argv[i + 1]; };
  let slugs;
  if (argv.includes("--all")) slugs = fs.readdirSync(EN_DIR).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
  else if (arg("--slugs")) slugs = arg("--slugs").split(",").filter(Boolean);
  else if (argv.includes("--files")) slugs = argv.slice(argv.indexOf("--files") + 1).filter((f) => /content\/connectors\/(en|es)\/[a-z0-9-]+\.md$/.test(f)).map((f) => path.basename(f, ".md"));
  else { console.error("usage: smoke-remote-login.mjs --all | --slugs a,b | --files <paths>"); return 2; }
  slugs = [...new Set(slugs)];

  const targets = remoteTargets(slugs);
  if (targets.length === 0) { console.log("Remote login smoke: no remote connectors to check."); return 0; }

  const work = fs.mkdtempSync(path.join(os.tmpdir(), "ts-login-smoke-"));
  const bin = path.join(work, "fakebin");
  fs.mkdirSync(bin, { recursive: true });
  for (const name of ["open", "xdg-open", "sensible-browser", "wslview"]) {
    fs.writeFileSync(path.join(bin, name), '#!/bin/sh\necho "$@" >> "$OPEN_LOG"\n', { mode: 0o755 });
  }
  // One retry: a transient npm registry hiccup must not look like a broken connector.
  let install;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    install = spawnSync("npm", ["install", "--silent", "--no-package-lock", "--ignore-scripts", "mcp-remote"], { cwd: work, encoding: "utf8", timeout: 120000 });
    if (install.status === 0) break;
  }
  const entry = path.join(work, "node_modules/mcp-remote/dist/proxy.js");
  if (install.status !== 0 || !fs.existsSync(entry)) {
    console.error("Could not install mcp-remote for the smoke:", JSON.stringify({ status: install.status, signal: install.signal, error: install.error && install.error.message, stderr: (install.stderr || "").slice(0, 300), entry }));
    return 1;
  }

  const results = [];
  const queue = [...targets];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) results.push(await smokeOne(queue.shift(), entry, work));
  }));
  results.sort((a, b) => a.slug.localeCompare(b.slug));
  let failed = 0;
  for (const r of results) {
    console.log(`${r.ok ? "OK  " : "FAIL"} ${r.slug.padEnd(14)} ${r.url}  - ${r.detail}`);
    if (!r.ok) failed += 1;
  }
  console.log(`Remote login smoke: ${results.length - failed}/${results.length} reach the login step.`);
  if (failed) console.log("Fix the URL, or mark the connector installableForAi:false (reason needs-oauth) if its OAuth server cannot be used with mcp-remote.");
  fs.rmSync(work, { recursive: true, force: true });
  return failed ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run().then((code) => process.exit(code));
}
