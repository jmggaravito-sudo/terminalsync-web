import { NextResponse } from "next/server";
import { getConnector } from "@/lib/connectors";

export const runtime = "nodejs";

interface Params { params: Promise<{ slug: string }> }

/** GET /api/marketplace/connectors/[slug]/manifest.json?lang=es
 *
 *  Returns the bare MCP manifest for a connector (the inner object that goes
 *  under `mcpServers["<slug>"]` in claude_desktop_config.json). Used by the
 *  manual-install UI on the connector detail page so users can copy/paste
 *  without the desktop app.
 *
 *  Source resolution:
 *    1. First-party: read `manifest:` from the connector frontmatter at
 *       content/connectors/<lang>/<slug>.md. Connectors that ARE pure
 *       affiliate landings (no hosted MCP) don't define `manifest` and
 *       this endpoint 404s — the detail page hides the install UI in that
 *       case as well.
 *    2. Third-party (Supabase) — TODO when connector_listings + versions
 *       become writable from the API. For now, only first-party is served.
 *
 *  No auth required: first-party connectors are public. When paid third-party
 *  listings are wired in, this endpoint will gate on `connector_installs`. */
export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const lang = (new URL(req.url).searchParams.get("lang") || "en").toLowerCase();

  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 404 });
  }

  const doc = await getConnector(lang, slug);
  if (!doc) {
    return NextResponse.json({ error: "connector not found", slug }, { status: 404 });
  }
  if (!doc.manifest) {
    return NextResponse.json(
      {
        error: "manifest not hosted",
        slug,
        hint: "This connector is an affiliate landing. Follow the SaaS provider's MCP install instructions instead.",
      },
      { status: 404 },
    );
  }

  // Returned as a plain JSON object so curl/copy-paste workflows are clean.
  // The detail page wraps it as `{ "<slug>": <manifest> }` for display, but
  // we serve the inner object so programmatic consumers stay flexible.
  return NextResponse.json(doc.manifest, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
