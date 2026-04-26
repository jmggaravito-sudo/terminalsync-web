import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const runtime = "nodejs";

// Same allow-list as /api/marketplace/installed and /api/checkout — the Tauri
// desktop client sends `Origin: tauri://localhost` on macOS/Linux.
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin &&
    (origin.startsWith("tauri://") ||
      origin === "https://terminalsync.ai" ||
      origin === "https://www.terminalsync.ai" ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1"));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://terminalsync.ai",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

interface Params { params: Promise<{ slug: string }> }

/** GET /api/marketplace/skills/[slug]/raw?lang=es
 *
 *  Contract with the desktop deep-link handler (terminalsync://install-skill):
 *
 *    {
 *      slug: string,
 *      version: string,           // semver, defaults to "1.0.0"
 *      vendors: ("claude"|"codex")[],
 *      checksum: string,          // sha256 hex of skill_md (integrity check)
 *      skill_md: string,          // full file contents incl. frontmatter — the desktop
 *                                 // writes this verbatim to ~/.<vendor>/skills/<slug>/SKILL.md
 *      extras: { path: string, content: string }[],  // base64; empty for first-party seeds
 *    }
 *
 *  Status codes:
 *    200 — found
 *    404 — slug doesn't exist (fall back to the other vendor's lang dir before
 *          giving up — EN is the canonical fallback)
 *    410 — listing exists but was removed by author (future, when third-party
 *          skills land in Supabase; first-party seeds never return 410) */
export async function GET(req: Request, { params }: Params) {
  const cors = corsHeaders(req.headers.get("origin"));
  const { slug } = await params;
  const lang = (new URL(req.url).searchParams.get("lang") || "en").toLowerCase();

  const file = resolveSkillFile(slug, lang);
  if (!file) {
    return NextResponse.json(
      { error: "skill not found", slug },
      { status: 404, headers: cors },
    );
  }

  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);

  const vendorsRaw = Array.isArray(data.vendors) ? data.vendors : [];
  const vendors = vendorsRaw.filter(
    (v: unknown): v is "claude" | "codex" => v === "claude" || v === "codex",
  );
  const version = typeof data.version === "string" ? data.version : "1.0.0";

  // Checksum the entire SKILL.md (frontmatter + body) so the desktop can detect
  // any drift — including future updates that change just the frontmatter
  // (e.g. version bump, new vendor support).
  const checksum = createHash("sha256").update(raw).digest("hex");

  return NextResponse.json(
    {
      slug,
      version,
      vendors: vendors.length > 0 ? vendors : ["claude"],
      checksum,
      skill_md: raw,
      extras: [],
    },
    { headers: cors },
  );
}

function resolveSkillFile(slug: string, lang: string): string | null {
  // Reject path traversal — slug must be a flat ascii identifier.
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) return null;

  const candidates = [
    path.join(process.cwd(), "content", "skills", lang, `${slug}.md`),
    path.join(process.cwd(), "content", "skills", "en", `${slug}.md`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}
