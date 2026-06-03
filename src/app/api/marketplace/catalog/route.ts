/**
 * Single-shot catalog endpoint for the desktop app's "Explorar" mode in
 * the Power-Ups drawer. Returns all four pillars in one round-trip:
 *
 *   GET /api/marketplace/catalog?lang=es
 *   →
 *   {
 *     connectors: ConnectorMeta[],       // first-party + approved third-party
 *     skills:     SkillMeta[],           // first-party (markdown)
 *     cliTools:   CliToolMeta[],         // first-party + DB-tracked
 *     bundles:    BundleSummary[],       // active Stack Packs with items resolved
 *   }
 *
 * Rationale: the panel renders the four categories in the same view at
 * once. Four separate endpoints would be four round-trips for one
 * render and four cache entries that could disagree about the catalog
 * generation. One endpoint keeps the wire shape and the cache atom in
 * sync with what the panel actually draws.
 *
 * Each item carries a `requiresEnvSecrets` flag (connectors derive it from
 * the manifest, skills are always false, CLI tools derive from
 * authCommand). The panel uses it to decide whether a drag&drop can be
 * one-click or has to route to the install modal — same flag, same
 * semantics across all four pillars.
 *
 * The flag is strict: it measures "has `${SECRET:NAME}` in the manifest /
 * has an authCommand". It is NOT "requires any setup". A connector with
 * OAuth out-of-band would read false here. The Explorar UI must combine
 * this flag with `hasManifest` to decide whether an item is one-click
 * installable — see `docs/browse-zone.md` for the full UX contract.
 *
 * Auth: none. Same posture as the per-slug manifest endpoint; the
 * catalog is what powers the marketplace web page, no auth required.
 * CORS open for Tauri.
 *
 * Cache: 10-minute revalidate window via `export const revalidate = 600`
 * below. Vercel emits the `s-maxage=600` directive on the edge from that
 * hint; the panel opens fast on warm caches. Connector manifests rarely
 * change and the desktop refetches when the panel re-mounts.
 *
 * History: the previous version of this route set `Cache-Control` by
 * hand on `NextResponse.json({ headers })`. Production observed a
 * truncated `Cache-Control: public` regardless of what the handler
 * shipped, so the CDN treated every request as uncacheable. The unit
 * test passed because invoking `GET(req)` direct reads the Response
 * before Vercel's edge layer touches it.
 */
import { NextResponse } from "next/server";
import { listAllConnectors, type ConnectorMeta } from "@/lib/connectors";
import { listSkills, type SkillMeta } from "@/lib/skills";
import { listCliTools, type CliToolMeta } from "@/lib/cliTools";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  isBundleItemKind,
  resolveBundleItems,
  type BundleItemKind,
  type BundleItemRef,
  type ResolvedBundleItem,
} from "@/lib/marketplace/bundleItems";

export const runtime = "nodejs";

// 10-minute ISR window. Route segment config is the canonical Next way to
// expose cache hints to Vercel — setting `Cache-Control` by hand on the
// NextResponse was getting stripped at the edge (production observed a
// trimmed `Cache-Control: public` regardless of what the handler sent).
// `revalidate` puts Next in charge of emitting the right `s-maxage` +
// SWR directives, which Vercel honors. Companion test verifies the
// emitted header includes `s-maxage=600`.
export const revalidate = 600;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Compact bundle shape that's friendlier to consume from the desktop
// than the raw Supabase row. Mirrors what /api/marketplace/bundles
// already returns; intentionally identical so a future consolidation
// can drop /bundles without changing client code.
export interface BundleSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  heroImageUrl: string | null;
  priceCents: number;
  currency: string;
  purchaseCount: number;
  sortOrder: number;
  /**
   * Relative path to the bundle's public detail page. Pinned by the
   * server (not derived in the client) so the URL structure can change
   * here and consumers don't have to redeploy. Matches the convention
   * of `ResolvedBundleItem.href`.
   *
   * Bundles are exposed under `/stacks/` in the public URL (not
   * `/bundles/`) because "Stack Pack" is the consumer-facing brand —
   * see `src/app/[lang]/stacks/[slug]/page.tsx`. The endpoint absorbs
   * that vocabulary mismatch so the desktop can stay vocabulary-free.
   *
   * Consumers that need an absolute URL prepend their own origin
   * (`https://terminalsync.ai${href}`) — the endpoint stays relative so
   * the same response works for preview deploys, local dev, and prod.
   */
  href: string;
  items: ResolvedBundleItem[];
  /** Claude Customize parity (added 2026-06-02 per design doc D1): full
   *  markdown description rendered on the detail panel. JM's instruction
   *  was that bundle descriptions must be "muy completas" — multiple
   *  paragraphs explaining what the kit does, for whom, what's included,
   *  how to use it, real-world use cases. Optional in the wire shape
   *  (existing bundles without this field render with `tagline` only)
   *  but required for new "Kits exclusivos TS". */
  descriptionMd?: string;
  /** Claude Customize parity (D1): flag distinguishing TS-owned kits from
   *  third-party stacks. When true, the desktop renders the kit with the
   *  "Exclusivo TS" badge + the TS-Kit logo variant. */
  isExclusiveTS?: boolean;
}

export interface CatalogResponse {
  connectors: ConnectorMeta[];
  skills: SkillMeta[];
  cliTools: CliToolMeta[];
  bundles: BundleSummary[];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") === "es" ? "es" : "en";

  // The four list functions are independent — fetch in parallel so the
  // total wait is max(N), not sum(N). `bundles` reaches into Supabase
  // and may be slowest in cold cache; running it next to the markdown
  // reads keeps the wall-clock short.
  const [connectors, skills, cliTools, bundles] = await Promise.all([
    listAllConnectors(lang),
    listSkills(lang),
    listCliTools(lang),
    loadBundles(lang),
  ]);

  // Drop hidden items from the public response. The lib functions
  // already filter their own `hidden:true` entries, but defensively
  // re-check here so a regression in one of them can't leak hidden
  // items into the catalog the desktop installs from.
  const visibleConnectors = connectors.filter((c) => !c.hidden);
  const visibleSkills = skills.filter((s) => !s.hidden);

  const body: CatalogResponse = {
    connectors: visibleConnectors,
    skills: visibleSkills,
    cliTools,
    bundles,
  };

  // Cache-Control intentionally NOT set here. The `export const
  // revalidate = 600` above is what Vercel reads to emit the s-maxage
  // header; passing one through `headers` here got stripped in
  // production. CORS headers still go through — they're not in
  // Vercel's "managed cache" path.
  return NextResponse.json(body, { headers: CORS_HEADERS });
}

/**
 * Loads active bundles with their items already resolved. Same shape and
 * sort order as /api/marketplace/bundles — kept inline (not imported
 * from the other route) because Next route handlers aren't a clean
 * module import surface and we want the catalog to keep working if
 * /bundles changes its response shape.
 *
 * Failure mode: returns [] if Supabase isn't configured (preview env
 * without secrets, for example). The desktop tolerates an empty
 * `bundles` array — same as having no kits curated yet.
 */
async function loadBundles(lang: string): Promise<BundleSummary[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data: bundles, error } = await sb
    .from("bundles")
    .select(
      "id, slug, name, tagline, hero_image_url, price_cents, currency, purchase_count, sort_order, description_md, is_exclusive_ts",
    )
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  if (error || !bundles) return [];
  if (bundles.length === 0) return [];

  const bundleIds = bundles.map((b) => b.id);
  const linksRes = await sb
    .from("bundle_listings")
    .select("bundle_id, kind, item_slug, sort_order")
    .in("bundle_id", bundleIds);
  if (linksRes.error) return [];

  type LinkRow = {
    bundle_id: string;
    kind: BundleItemKind;
    item_slug: string;
    sort_order: number;
  };
  const linksByBundle = new Map<string, BundleItemRef[]>();
  for (const raw of linksRes.data ?? []) {
    const row = raw as LinkRow;
    if (!isBundleItemKind(row.kind)) continue;
    const arr = linksByBundle.get(row.bundle_id) ?? [];
    arr.push({ kind: row.kind, slug: row.item_slug, sortOrder: row.sort_order });
    linksByBundle.set(row.bundle_id, arr);
  }

  // Resolve items per bundle in parallel — each bundle's resolution is
  // an independent lookup against the same markdown/DB sources the
  // other endpoints use.
  const resolved = await Promise.all(
    bundles.map(async (b) => {
      const refs = linksByBundle.get(b.id) ?? [];
      const items = await resolveBundleItems(refs, lang);
      const summary: BundleSummary = {
        id: b.id,
        slug: b.slug,
        name: b.name,
        tagline: b.tagline ?? null,
        heroImageUrl: b.hero_image_url ?? null,
        priceCents: b.price_cents,
        currency: b.currency,
        purchaseCount: b.purchase_count,
        sortOrder: b.sort_order,
        href: `/${lang}/stacks/${b.slug}`,
        items,
        // Claude Customize parity fields (added 2026-06-02): expose only when
        // the DB row has them. Existing bundles without these columns return
        // the row with `undefined` for both, which is the wire-compatible default.
        descriptionMd:
          (b as { description_md?: string | null }).description_md ?? undefined,
        isExclusiveTS:
          ((b as { is_exclusive_ts?: boolean | null }).is_exclusive_ts ??
            false) || undefined,
      };
      return summary;
    }),
  );
  return resolved;
}
