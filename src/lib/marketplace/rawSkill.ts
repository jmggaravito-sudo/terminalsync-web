/**
 * Builder for the raw SKILL.md delivery payload.
 *
 * This is the single source of truth for what `GET /api/marketplace/skills/
 * <slug>/raw` returns AND what the skills-loop delivery gate verifies. The
 * desktop `ensure_skill_installed` primitive consumes this payload; the loop
 * gate (`rawSkill.test.ts`) asserts every catalog-ready skill produces a valid
 * one before it can go public — so we never ship a skill the app can't deliver.
 *
 * Checksum: `"sha256:" + sha256(<full EN .md file>)`. The client writes
 * `skill_md` verbatim to SKILL.md, so `sha256(SKILL.md) === checksum` — that is
 * the client's no-op test.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import { listSkillSlugs } from "@/lib/skills";

export interface RawSkillExtra {
  path: string;
  content_b64: string;
}

export interface RawSkillPayload {
  slug: string;
  version: string;
  vendors: Array<"claude" | "codex">;
  checksum: string;
  skill_md: string;
  extras: RawSkillExtra[];
}

export type RawSkillResult =
  | { ok: true; payload: RawSkillPayload }
  | { ok: false; status: number; error: string; included?: boolean };

/**
 * Build the raw payload for a slug, or an error with the HTTP status the route
 * should return (404 unknown slug, 410 source file missing).
 */
export async function buildRawSkillPayload(
  slug: string,
): Promise<RawSkillResult> {
  // Validate the slug against the catalog (also blocks path traversal). Only
  // catalog-ready skills are listed, so staged (catalogReady:false) skills are
  // correctly undeliverable until published.
  const allSlugs = await listSkillSlugs();
  if (!allSlugs.includes(slug)) {
    return { ok: false, status: 404, error: "skill not found" };
  }

  // Prefer EN as the canonical SKILL.md (Claude/Codex follow English
  // instructions better). `vendors` is identical across locales.
  const file = path.join(process.cwd(), "content", "skills", "en", `${slug}.md`);
  if (!fs.existsSync(file)) {
    return { ok: false, status: 410, error: "skill source missing" };
  }

  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);

  // Native/"included" skills (docx, pdf, pptx, xlsx) ship WITH Claude Code —
  // their .md here is a marketing card, not a real SKILL.md. Delivering it
  // would drop a fake SKILL.md next to the native skill. `/raw` refuses them,
  // mirroring `getSkillInstallPayload` returning null for included skills.
  if (data.included === true) {
    return {
      ok: false,
      status: 409,
      error: "skill ships natively with Claude Code — not installable via /raw",
      included: true,
    };
  }

  const vendorsRaw = Array.isArray(data.vendors) ? data.vendors : ["claude"];
  const vendors = vendorsRaw.filter(
    (v: unknown): v is "claude" | "codex" => v === "claude" || v === "codex",
  );

  const checksum =
    "sha256:" + crypto.createHash("sha256").update(raw, "utf8").digest("hex");

  const stat = fs.statSync(file);
  const version = `v${Math.floor(stat.mtimeMs / 1000)}`;

  const extrasDir = path.join(process.cwd(), "content", "skills", "extras", slug);
  const extras: RawSkillExtra[] = [];
  if (fs.existsSync(extrasDir)) {
    walk(extrasDir, extrasDir, extras);
  }

  return {
    ok: true,
    payload: { slug, version, vendors, checksum, skill_md: raw, extras },
  };
}

// Recursive walker that emits relative paths + base64 contents. Symlinks and
// hidden files (.DS_Store etc.) are skipped so the desktop never receives
// garbage.
function walk(baseDir: string, currentDir: string, out: RawSkillExtra[]): void {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      walk(baseDir, fullPath, out);
      continue;
    }
    if (!entry.isFile()) continue;
    const rel = path.relative(baseDir, fullPath);
    const buf = fs.readFileSync(fullPath);
    out.push({ path: rel, content_b64: buf.toString("base64") });
  }
}
