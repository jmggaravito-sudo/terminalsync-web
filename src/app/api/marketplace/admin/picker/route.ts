import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isBundleItemKind } from "@/lib/marketplace/bundleItems";
import { listConnectors } from "@/lib/connectors";
import { listSkills } from "@/lib/skills";
import { listCliTools } from "@/lib/cliTools";

export const runtime = "nodejs";

/** GET /api/marketplace/admin/picker?kind=connector|skill|cli&key=...
 *
 *  Returns a thin list of {slug, name, logo, tagline} items that an
 *  admin can pick from when assembling a bundle. Connectors and CLIs
 *  merge markdown + DB sources; skills are markdown-only.
 *
 *  Auth: same DISCOVERY_INGEST_KEY as the other admin endpoints, since
 *  this is a no-PII picker list and we don't want to gate JM behind the
 *  Supabase auth UI for curation tasks.
 */
function authorized(req: Request): boolean {
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  return !!expected && provided === expected;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const lang = url.searchParams.get("lang") === "es" ? "es" : "en";
  if (!isBundleItemKind(kind)) {
    return NextResponse.json(
      { error: "kind must be 'connector', 'skill', or 'cli'" },
      { status: 400 },
    );
  }

  if (kind === "skill") {
    const skills = await listSkills(lang);
    return NextResponse.json({
      kind,
      items: skills.map((s) => ({
        slug: s.slug,
        name: s.name,
        tagline: s.tagline,
        logo: s.logo,
      })),
    });
  }

  if (kind === "cli") {
    const cli = await listCliTools(lang);
    return NextResponse.json({
      kind,
      items: cli.map((c) => ({
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        logo: c.logo,
      })),
    });
  }

  // Connectors: list markdown-backed ones plus approved DB rows.
  const firstParty = await listConnectors(lang);
  const sb = getSupabaseAdmin();
  const dbItems: { slug: string; name: string; tagline: string; logo: string }[] = [];
  if (sb) {
    try {
      const { data } = await sb
        .from("connector_listings")
        .select("slug, name, tagline, logo_url, status")
        .eq("status", "approved");
      if (data) {
        const seen = new Set(firstParty.map((m) => m.slug));
        for (const row of data) {
          const slug = String(row.slug ?? "");
          if (!slug || seen.has(slug)) continue;
          dbItems.push({
            slug,
            name: String(row.name ?? slug),
            tagline: String(row.tagline ?? ""),
            logo:
              typeof row.logo_url === "string" && row.logo_url
                ? row.logo_url
                : `/connectors/${slug}.svg`,
          });
        }
      }
    } catch {
      // Table missing locally — fall back to file-only picker.
    }
  }

  const items = [
    ...firstParty.map((m) => ({
      slug: m.slug,
      name: m.name,
      tagline: m.tagline,
      logo: m.logo,
    })),
    ...dbItems,
  ].sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ kind, items });
}
