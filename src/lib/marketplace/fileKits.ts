import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  isBundleItemKind,
  resolveBundleItems,
  type BundleItemRef,
  type ResolvedBundleItem,
} from "@/lib/marketplace/bundleItems";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const PUBLIC_ROOT = path.join(process.cwd(), "public");

export interface FileKitBundle {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  heroImageUrl: string | null;
  priceCents: number;
  currency: string;
  purchaseCount: number;
  sortOrder: number;
  href: string;
  items: ResolvedBundleItem[];
  descriptionMd?: string;
  isExclusiveTS?: boolean;
}

function kitsLangDir(lang: string): string {
  const dir = path.join(CONTENT_ROOT, "kits", lang);
  if (fs.existsSync(dir)) return dir;
  return path.join(CONTENT_ROOT, "kits", "en");
}

function stringValue(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value.trim() : "";
}

function publicAssetExists(value: string | null | undefined): boolean {
  if (!value) return true;
  let pathname = value;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      pathname = new URL(value).pathname;
    } catch {
      return false;
    }
  }
  if (!pathname.startsWith("/")) return true;
  return fs.existsSync(path.join(PUBLIC_ROOT, pathname));
}

function parseKitItems(raw: unknown): BundleItemRef[] {
  if (!Array.isArray(raw)) return [];
  const items: BundleItemRef[] = [];
  for (const [index, value] of raw.entries()) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    const kind = row.kind;
    const slug = row.slug;
    if (!isBundleItemKind(kind) || typeof slug !== "string" || !slug.trim()) {
      continue;
    }
    const sortOrder =
      typeof row.sortOrder === "number"
        ? row.sortOrder
        : typeof row.sort_order === "number"
          ? row.sort_order
          : index;
    const reason = typeof row.reason === "string" ? row.reason.trim() : "";
    items.push({
      kind,
      slug: slug.trim(),
      sortOrder,
      whyItHelps: reason || undefined,
    });
  }
  return items;
}

async function readFileKit(
  lang: string,
  file: string,
  index: number,
): Promise<FileKitBundle | null> {
  const dir = kitsLangDir(lang);
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const { data, content } = matter(raw);
  const fm = data as Record<string, unknown>;
  if (stringValue(fm, "status") !== "available") return null;

  const refs = parseKitItems(fm.items);
  const items = await resolveBundleItems(refs, lang);
  const logo = stringValue(fm, "logo") || "/logos/ts-kit.svg";
  if (!publicAssetExists(logo)) {
    throw new Error(`File kit ${slug} references missing logo asset: ${logo}`);
  }

  return {
    id: `kit:${slug}`,
    slug,
    name: stringValue(fm, "name") || slug,
    tagline: stringValue(fm, "tagline") || null,
    heroImageUrl: logo,
    priceCents: 0,
    currency: "usd",
    purchaseCount: 0,
    sortOrder:
      typeof fm.sortOrder === "number"
        ? fm.sortOrder
        : typeof fm.sort_order === "number"
          ? fm.sort_order
          : index,
    href: `/${lang}/stacks/${slug}`,
    items,
    descriptionMd:
      content.trim() || stringValue(fm, "description") || undefined,
    isExclusiveTS: true,
  };
}

export async function loadFileKits(lang: string): Promise<FileKitBundle[]> {
  const dir = kitsLangDir(lang);
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  const kits = await Promise.all(
    files.map((file, index) => readFileKit(lang, file, index)),
  );

  return kits
    .filter((kit): kit is FileKitBundle => kit !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function loadFileKit(
  slug: string,
  lang: string,
): Promise<FileKitBundle | null> {
  const dir = kitsLangDir(lang);
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(dir, file))) return null;
  return readFileKit(lang, file, 0);
}
