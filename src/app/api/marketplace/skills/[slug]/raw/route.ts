import { NextResponse } from "next/server";
import { buildRawSkillPayload } from "@/lib/marketplace/rawSkill";

export const runtime = "nodejs";

// Allow Tauri (and CLI tooling) to fetch the raw skill payload. Public —
// these skills are meant to be installed by anyone clicking
// terminalsync://install-skill?id=<slug>.
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
 * desktop app's `ensure_skill_installed` to write to ~/.claude/skills/<slug>/
 * SKILL.md (and ~/.codex/skills/<slug>/ when vendor includes codex).
 *
 * The payload shape, checksum, versioning, and extras are all owned by
 * `buildRawSkillPayload` — the same function the skills-loop delivery gate
 * verifies, so the endpoint and the gate can never drift.
 */
export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const result = await buildRawSkillPayload(slug);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status, headers: CORS_HEADERS },
    );
  }

  return NextResponse.json(result.payload, {
    headers: {
      ...CORS_HEADERS,
      // Edge cache for 1h — when a skill updates we wait up to 1h for the
      // desktop client to see the new version. Acceptable for MVP.
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
