import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import { listSlugs } from "@/lib/connectors";
import { extractSecretNames } from "@/lib/marketplace/secrets";

export const runtime = "nodejs";

// Tauri (and any third-party tooling) can fetch this without auth — the
// manifest is the same JSON the user would paste into their config by hand.
// Secrets in the manifest are templated via ${SECRET:NAME} placeholders so
// we never ship live credentials.
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
 * Returns the MCP manifest for a connector that ships one.
 *
 * Shape:
 *   {
 *     slug, version, checksum,
 *     manifest: { mcpServers: { [name]: { command, args, env? } } },
 *     secrets: ["NOTION_API_KEY", ...]   // names the user must provide
 *   }
 *
 * 404 when the connector exists but has no `manifest:` frontmatter — that's
 * the case for affiliate-only listings (Webflow, Framer, etc. — they're
 * external SaaS without an MCP server). Desktop handler treats 404 as
 * "open the affiliate URL, no install".
 *
 * The manifest body lives in the connector's frontmatter so authors can
 * version-control it alongside the description. Frontmatter shape:
 *
 *   manifest:
 *     mcpServers:
 *       notion:
 *         command: npx
 *         args: ["-y", "@notionhq/notion-mcp-server"]
 *         env:
 *           NOTION_API_KEY: "${SECRET:NOTION_API_KEY}"
 */
export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;

  // Allowlist via listSlugs (also blocks path traversal).
  const allSlugs = await listSlugs();
  if (!allSlugs.includes(slug)) {
    return NextResponse.json(
      { error: "connector not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const file = path.join(
    process.cwd(),
    "content",
    "connectors",
    "en",
    `${slug}.md`,
  );
  if (!fs.existsSync(file)) {
    return NextResponse.json(
      { error: "connector source missing" },
      { status: 410, headers: CORS_HEADERS },
    );
  }

  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);

  // Hidden connectors should not serve their manifest either. listSlugs()
  // only validates the file exists; it doesn't honor frontmatter flags,
  // so the hide-from-catalog filter applied in listConnectors() would be
  // bypassed without this guard. Return 404 to match the catalog page
  // behavior — the connector is gone from the user's perspective.
  if (data.hidden === true) {
    return NextResponse.json(
      { error: "connector not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const manifest = data.manifest as
    | { mcpServers?: Record<string, unknown> }
    | undefined;

  // Affiliate-only connector — no MCP, no install, just an outbound link.
  // Desktop handler should fall back to opening ctaUrl in a browser.
  if (!manifest || typeof manifest !== "object") {
    return NextResponse.json(
      { error: "connector has no MCP manifest (affiliate-only)" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  // Extract secret names from ${SECRET:NAME} placeholders so the desktop
  // app can prompt for them (and stash in Keychain) before merging the
  // manifest into claude_desktop_config.json.
  const secrets = extractSecretNames(manifest);

  const checksum =
    "sha256:" +
    crypto
      .createHash("sha256")
      .update(JSON.stringify(manifest), "utf8")
      .digest("hex");

  const stat = fs.statSync(file);
  const version = `v${Math.floor(stat.mtimeMs / 1000)}`;

  return NextResponse.json(
    { slug, version, checksum, manifest, secrets },
    {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

// Note: `extractSecretNames` moved to src/lib/marketplace/secrets.ts so the
// catalog endpoint and this one share a single implementation. Sort order
// preserved — Array.from(set).sort() — so the wire shape doesn't change.
