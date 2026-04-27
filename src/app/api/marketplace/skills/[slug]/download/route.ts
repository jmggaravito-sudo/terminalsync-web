import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

interface Params { params: Promise<{ slug: string }> }

/** GET /api/marketplace/skills/[slug]/download?lang=es
 *
 *  Browser-facing companion of /raw. Returns the SKILL.md file with a
 *  Content-Disposition header so clicking the link in the manual install UI
 *  triggers a regular browser download. The contents are byte-identical to
 *  what /raw exposes inside the JSON envelope — keeps both code paths in
 *  sync without parallel storage.
 *
 *  Auth: free first-party seeds are public. Paid third-party listings (when
 *  they land in Supabase) will check `connector_installs` for an active row,
 *  same as the existing install flow. */
export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const lang = (new URL(req.url).searchParams.get("lang") || "en").toLowerCase();

  // Same slug guard as /raw — block path traversal before fs.existsSync runs.
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 404 });
  }

  const candidates = [
    path.join(process.cwd(), "content", "skills", lang, `${slug}.md`),
    path.join(process.cwd(), "content", "skills", "en", `${slug}.md`),
  ];
  const file = candidates.find((c) => fs.existsSync(c));
  if (!file) {
    return NextResponse.json(
      { error: "skill not found", slug },
      { status: 404 },
    );
  }

  const raw = fs.readFileSync(file, "utf8");
  return new NextResponse(raw, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.SKILL.md"`,
      // Browsers cache aggressively; revalidate hourly so updates propagate.
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
