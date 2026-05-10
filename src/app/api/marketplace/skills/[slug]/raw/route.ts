import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import { listSkillSlugs } from "@/lib/skills";

export const runtime = "nodejs";

// Allow Tauri (and CLI tooling) to fetch the raw skill payload. Public —
// these skills are meant to be installed by anyone clicking
// terminalsync://install?type=skill&slug=<slug>&payload=<base64>.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Returns the raw SKILL.md payload for a marketplace skill, ready for the
 * desktop app to write to ~/.claude/skills/<slug>/SKILL.md (and the same
 * for ~/.codex/skills/<slug>/ when vendor includes codex).
 *
 * Shape:
 *   {
 *     slug, version, vendors[], checksum, skill_md,
 *     extras: [{ path, content_b64 }]
 *   }
 *
 * Versioning: derived from the file's mtime — bumping the file in the
 * repo is the publish action. Switch to a `version` frontmatter field
 * once we add a real publish flow.
 *
 * Checksum: sha256 of skill_md so the client can no-op when nothing
 * changed.
 *
 * Extras: empty for MVP — when a skill ships supplementary files (templates,
 * scripts), drop them into content/skills/extras/<slug>/ and we'll embed
 * each as base64.
 */
export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;

  // Validate slug exists in the catalog (also blocks path traversal).
  const allSlugs = await listSkillSlugs();
  if (!allSlugs.includes(slug)) {
    return NextResponse.json(
      { error: "skill not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  // Prefer EN as the canonical SKILL.md (Claude/Codex parse English better
  // for instruction-following). Frontmatter `vendors` is identical across
  // locales so this doesn't lose data.
  const file = path.join(process.cwd(), "content", "skills", "en", `${slug}.md`);
  if (!fs.existsSync(file)) {
    return NextResponse.json(
      { error: "skill source missing" },
      { status: 410, headers: CORS_HEADERS },
    );
  }

  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);
  const vendorsRaw = Array.isArray(data.vendors) ? data.vendors : ["claude"];
  const vendors = vendorsRaw.filter(
    (v: unknown): v is "claude" | "codex" => v === "claude" || v === "codex",
  );

  const checksum =
    "sha256:" + crypto.createHash("sha256").update(raw, "utf8").digest("hex");

  const stat = fs.statSync(file);
  // mtime → "v<unix-seconds>" so checksum + version both let the client
  // detect updates without picking one strategy.
  const version = `v${Math.floor(stat.mtimeMs / 1000)}`;

  // Extras hook for future skills with helper files. Lives at
  // content/skills/extras/<slug>/. Each file becomes base64 in the response.
  const extrasDir = path.join(
    process.cwd(),
    "content",
    "skills",
    "extras",
    slug,
  );
  const extras: Array<{ path: string; content_b64: string }> = [];
  if (fs.existsSync(extrasDir)) {
    walk(extrasDir, extrasDir, extras);
  }

  return NextResponse.json(
    {
      slug,
      version,
      vendors,
      checksum,
      skill_md: raw,
      extras,
    },
    {
      headers: {
        ...CORS_HEADERS,
        // Edge cache for 1h — when a skill updates we wait up to 1h for
        // the desktop client to see the new version. Acceptable for MVP;
        // tighten if push-to-Drive needs to be near-realtime.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

// Recursive walker that emits relative paths + base64 contents. Symlinks and
// hidden files (.DS_Store etc.) get skipped so the desktop client never
// receives garbage.
function walk(
  baseDir: string,
  currentDir: string,
  out: Array<{ path: string; content_b64: string }>,
): void {
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
