import { describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildReport,
  checkScope,
  decide,
  slugify,
  summarizeReviews,
  surfaces,
  validateResearch,
} from "./lib.mjs";

const officialRemote = {
  name: "Ramp",
  slug: "ramp",
  verdict: "ship_official",
  reason: "Ramp publica un MCP remoto oficial",
  already_in_catalog: false,
  persona_fit: true,
  conversational_install: "no_remote",
  official: {
    exists: true,
    kind: "remote",
    endpoint_or_package: "https://mcp.ramp.com/mcp",
    publisher: "Ramp",
    auth: "oauth",
    sources: ["https://docs.ramp.com/developer-api/v1/ramp-mcp"],
  },
};

const allPass = {
  sources: { role: "sources", verdict: "pass", findings: [] },
  voice: { role: "voice", verdict: "pass", findings: [] },
  install: { role: "install", verdict: "pass", findings: [] },
  honesty: { role: "honesty", verdict: "pass", findings: [] },
};

const cleanScope = { ok: true, violations: [], missing: [] };

describe("slugify", () => {
  it("makes a loader-safe slug", () => {
    expect(slugify("Siigo")).toBe("siigo");
    expect(slugify("  Google Búsqueda Maps! ")).toBe("google-busqueda-maps");
    expect(slugify("a".repeat(60)).length).toBeLessThanOrEqual(40);
  });
});

describe("validateResearch", () => {
  it("accepts a well-formed official verdict", () => {
    expect(validateResearch(officialRemote)).toEqual({ ok: true, errors: [] });
  });

  it("rejects ship_official without a verified official source", () => {
    const bad = { ...officialRemote, official: { ...officialRemote.official, sources: [] } };
    const v = validateResearch(bad);
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toContain("official.sources");
  });

  it("rejects ship_official when the persona gate failed or it is already shipped", () => {
    expect(validateResearch({ ...officialRemote, persona_fit: false }).ok).toBe(false);
    expect(validateResearch({ ...officialRemote, already_in_catalog: true }).ok).toBe(false);
  });

  it("needs verified API facts when the vendor has no official MCP", () => {
    const base = { name: "Siigo", slug: "siigo", verdict: "needs_own_build", reason: "sin MCP oficial", conversational_install: "unknown" };
    expect(validateResearch(base).ok).toBe(false);
    expect(validateResearch({ ...base, own_build_notes: "POST /auth + Partner-Id" }).ok).toBe(true);
  });

  it("rejects junk", () => {
    expect(validateResearch(null).ok).toBe(false);
    expect(validateResearch({ ...officialRemote, slug: "Bad Slug" }).ok).toBe(false);
    expect(validateResearch({ ...officialRemote, verdict: "yolo" }).ok).toBe(false);
  });
});

describe("checkScope", () => {
  const ok = ["content/connectors/en/ramp.md", "content/connectors/es/ramp.md", "content/connectors/SOURCES.md", "public/connectors/ramp.svg"];

  it("passes when only this connector's files change", () => {
    expect(checkScope("ramp", ok)).toEqual({ ok: true, violations: [], missing: [] });
    expect(checkScope("ramp", [...ok.slice(0, 3), "public/connectors/ramp.png"]).ok).toBe(true);
  });

  it("flags unrelated logo swaps and other files (the PR #352 case)", () => {
    const r = checkScope("ramp", [...ok, "public/connectors/klaviyo.svg", "src/lib/connectors.ts"]);
    expect(r.ok).toBe(false);
    expect(r.violations).toEqual(["public/connectors/klaviyo.svg", "src/lib/connectors.ts"]);
  });

  it("requires both language fichas", () => {
    const r = checkScope("ramp", ["content/connectors/en/ramp.md", "content/connectors/SOURCES.md"]);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(["content/connectors/es/ramp.md"]);
  });

  it("does not let a similarly named slug through", () => {
    expect(checkScope("ramp", [...ok, "public/connectors/rampart.svg"]).violations).toEqual(["public/connectors/rampart.svg"]);
  });
});

describe("summarizeReviews", () => {
  it("treats a missing review as a hold", () => {
    const s = summarizeReviews({ ...allPass, voice: undefined });
    expect(s.anyHold).toBe(true);
    expect(s.allPass).toBe(false);
  });

  it("turns an unknown verdict into a hold and never passes it silently", () => {
    const s = summarizeReviews({ ...allPass, sources: { role: "sources", verdict: "lgtm", findings: [] } });
    expect(s.reviews.find((r) => r.role === "sources").verdict).toBe("hold");
  });

  it("collects findings from non-passing reviewers only", () => {
    const s = summarizeReviews({
      ...allPass,
      voice: { role: "voice", verdict: "fix", findings: [{ file: "content/connectors/es/ramp.md", issue: "voseo", fix: "tú" }] },
    });
    expect(s.findings).toEqual([{ role: "voice", file: "content/connectors/es/ramp.md", issue: "voseo", fix: "tú" }]);
  });
});

describe("decide", () => {
  const base = { research: officialRemote, scope: cleanScope, reviewsByRole: allPass, automerge: true, dryRun: false };

  it("merges only when everything passes and auto-merge is on", () => {
    expect(decide(base).action).toBe("merge");
  });

  it("leaves a passing PR ready for a human when auto-merge is off or on a dry run", () => {
    expect(decide({ ...base, automerge: false }).action).toBe("ready");
    expect(decide({ ...base, dryRun: true }).action).toBe("ready");
  });

  it("stops before building when research did not say ship_official", () => {
    expect(decide({ ...base, research: { ...officialRemote, verdict: "needs_own_build" } }).action).toBe("stop");
    expect(decide({ ...base, research: null }).action).toBe("stop");
  });

  it("holds on any reviewer hold, and a hold beats a fix", () => {
    const reviews = {
      ...allPass,
      voice: { role: "voice", verdict: "fix", findings: [{ issue: "voseo" }] },
      honesty: { role: "honesty", verdict: "hold", findings: [{ issue: "claim not in source" }] },
    };
    expect(decide({ ...base, reviewsByRole: reviews }).action).toBe("hold");
  });

  it("asks for one fix round when reviewers only found fixable issues", () => {
    const reviews = { ...allPass, voice: { role: "voice", verdict: "fix", findings: [{ issue: "voseo" }] } };
    const d = decide({ ...base, reviewsByRole: reviews });
    expect(d.action).toBe("fix");
    expect(d.findings).toHaveLength(1);
  });

  it("holds when the PR touches files outside the connector, even if reviewers passed", () => {
    const d = decide({ ...base, scope: { ok: false, violations: ["public/connectors/klaviyo.svg"], missing: [] } });
    expect(d.action).toBe("hold");
    expect(d.reasons.join(" ")).toContain("klaviyo.svg");
  });

  it("never merges with a missing review", () => {
    expect(decide({ ...base, reviewsByRole: { sources: allPass.sources } }).action).toBe("hold");
  });
});

describe("surfaces / report", () => {
  it("is honest that remote OAuth connectors are not installable by chat", () => {
    const s = surfaces({ research: officialRemote, merged: true });
    expect(s.landing).toBe("publicado");
    expect(s.conversation).toContain("no:");
    expect(s.conversation).toContain("Explorar");
  });

  it("says chat install works for npm connectors", () => {
    expect(surfaces({ research: { ...officialRemote, conversational_install: "yes" }, merged: false }).conversation).toBe("sí (al mergear)");
  });

  it("explains the needs_own_build outcome with the verified facts and no PR", () => {
    const md = buildReport({
      research: { name: "Siigo", slug: "siigo", verdict: "needs_own_build", reason: "sin MCP oficial", own_build_notes: "POST /auth + Partner-Id", third_party: [{ package: "@codespar/mcp-siigo", publisher: "codespar", note: "tercero" }] },
    });
    expect(md).toContain("# Integración: Siigo");
    expect(md).toContain("POST /auth + Partner-Id");
    expect(md).toContain("@codespar/mcp-siigo");
    expect(md).toContain("Decisión tuya");
    expect(md).not.toContain("Revisión por agentes");
  });

  it("reports the three surfaces, reviewers and findings for a built connector", () => {
    const decision = decide({
      research: officialRemote,
      scope: cleanScope,
      reviewsByRole: { ...allPass, voice: { role: "voice", verdict: "fix", findings: [{ file: "x.md", issue: "voseo", fix: "tú" }] } },
      automerge: true,
      dryRun: false,
    });
    const md = buildReport({ research: officialRemote, build: { pr: 400, url: "https://github.com/o/r/pull/400" }, decision, merged: false });
    expect(md).toContain("| Landing | pendiente de merge |");
    expect(md).toContain("| Voz y vocabulario | fix |");
    expect(md).toContain("voseo");
    expect(md).toContain("#400");
  });
});

describe("cli", () => {
  const cli = path.join(path.dirname(new URL(import.meta.url).pathname), "cli.mjs");
  const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "pipeline-"));

  it("research-validate prints outputs for a valid file and fails on an invalid one", () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, "research.json"), JSON.stringify(officialRemote));
    const out = execFileSync("node", [cli, "research-validate", path.join(dir, "research.json")], { encoding: "utf8" });
    expect(out).toContain("verdict=ship_official");
    expect(out).toContain("slug=ramp");
    fs.writeFileSync(path.join(dir, "bad.json"), "{}");
    const bad = spawnSync("node", [cli, "research-validate", path.join(dir, "bad.json")], { encoding: "utf8" });
    expect(bad.status).toBe(1);
  });

  it("build-validate only accepts a loop/ branch and a numeric PR", () => {
    const dir = tmp();
    const f = path.join(dir, "build.json");
    fs.writeFileSync(f, JSON.stringify({ pr: 12, branch: "loop/connectors/ramp-20261008" }));
    expect(execFileSync("node", [cli, "build-validate", f], { encoding: "utf8" })).toContain("pr=12");
    fs.writeFileSync(f, JSON.stringify({ pr: 12, branch: "main" }));
    expect(spawnSync("node", [cli, "build-validate", f]).status).toBe(1);
  });

  it("decide writes decision.json and exposes action/needs_fix", () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, "research.json"), JSON.stringify(officialRemote));
    for (const [role, r] of Object.entries(allPass)) fs.writeFileSync(path.join(dir, `review-${role}.json`), JSON.stringify(r));
    const files = path.join(dir, "files.txt");
    fs.writeFileSync(files, "content/connectors/en/ramp.md\ncontent/connectors/es/ramp.md\ncontent/connectors/SOURCES.md\npublic/connectors/ramp.svg\n");
    const out = execFileSync("node", [cli, "decide", dir, files, "true", "false"], { encoding: "utf8" });
    expect(out).toContain("action=merge");
    expect(out).toContain("needs_fix=false");
    expect(JSON.parse(fs.readFileSync(path.join(dir, "decision.json"), "utf8")).action).toBe("merge");
  });

  it("decide holds when a file outside the connector slipped in", () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, "research.json"), JSON.stringify(officialRemote));
    for (const [role, r] of Object.entries(allPass)) fs.writeFileSync(path.join(dir, `review-${role}.json`), JSON.stringify(r));
    const files = path.join(dir, "files.txt");
    fs.writeFileSync(files, "content/connectors/en/ramp.md\ncontent/connectors/es/ramp.md\npublic/connectors/klaviyo.svg\n");
    const out = execFileSync("node", [cli, "decide", dir, files, "true", "false"], { encoding: "utf8" });
    expect(out).toContain("action=hold");
  });
});
