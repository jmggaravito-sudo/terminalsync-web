#!/usr/bin/env node
// Focused, read-only connector gate for a catalog hit. It cannot certify a real
// account login or an installed desktop app; the report says so explicitly.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { verifyFile } from "../verify-connector.mjs";

export async function superviseExisting(research, country, root = process.cwd()) {
  const slug = research?.slug;
  if (!/^[a-z0-9-]{1,40}$/.test(slug ?? "")) throw new Error("Invalid research slug");
  const en = path.join(root, "content/connectors/en", `${slug}.md`);
  const es = path.join(root, "content/connectors/es", `${slug}.md`);
  if (!fs.existsSync(en) || !fs.existsSync(es)) return {
    slug, country, outcome: "missing_catalog_file", appSmoke: "not_run",
  };
  const a = matter(fs.readFileSync(en, "utf8")).data;
  const b = matter(fs.readFileSync(es, "utf8")).data;
  const marketsEqual = JSON.stringify(a.markets) === JSON.stringify(b.markets);
  const marketListed = marketsEqual && Array.isArray(a.markets) &&
    (a.markets.includes(country) || a.markets.includes("GLOBAL"));
  const statusAvailable = a.status === "available" && b.status === "available";
  const declaredInstallable = a.installableForAi === true && b.installableForAi === true;
  const probe = await verifyFile(en);
  const probeInstallable = probe.installableForAi === true;
  return {
    slug, country, outcome: marketListed && statusAvailable && declaredInstallable && probeInstallable
      ? "needs_app_smoke" : "catalog_blocked",
    checks: { marketsEqual, marketListed, statusAvailable, declaredInstallable, probeInstallable, probeReason: probe.installableForAiReason ?? "unknown" },
    appSmoke: "not_run",
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const [researchFile, country, outputFile] = process.argv.slice(2);
  superviseExisting(JSON.parse(fs.readFileSync(researchFile, "utf8")), country)
    .then((result) => {
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      console.log(JSON.stringify(result));
    })
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
