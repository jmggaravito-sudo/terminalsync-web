// Lightweight runtime validators for marketplace API payloads. Hand-rolled
// rather than pulling in Zod for one feature; if the project later adds a
// validation lib, swap these out wholesale.

import { isValidPriceCents } from "./pricing";
import { isBundleItemKind, type BundleItemKind } from "./bundleItems";

export type { BundleItemKind } from "./bundleItems";

/** Input shape for a single item inside a bundle. `sortOrder` is
 *  optional on the wire — the API derives it from array position when
 *  callers omit it (so a simple JSON array of {kind, slug} still works). */
export interface BundleItemInput {
  kind: BundleItemKind;
  slug: string;
  sortOrder?: number;
}

export type ListingCategory =
  | "productivity"
  | "database"
  | "automation"
  | "storage"
  | "messaging"
  | "dev";

export type PricingType = "free" | "one_time";

export interface PublisherOnboardInput {
  displayName: string;
  slug: string;
  bio?: string;
  website?: string;
}

export interface ListingDraftInput {
  slug: string;
  name: string;
  tagline: string;
  category: ListingCategory;
  logoUrl: string;
  screenshots?: string[];
  descriptionMd: string;
  setupMd: string;
  pricingType: PricingType;
  /** Required when pricingType='one_time'. */
  priceCents?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;
const HTTPS_RE = /^https:\/\//;
const VALID_CATEGORIES: ReadonlySet<ListingCategory> = new Set([
  "productivity", "database", "automation", "storage", "messaging", "dev",
]);

export function validatePublisherOnboard(
  raw: unknown,
): { ok: true; data: PublisherOnboardInput } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const obj = (raw ?? {}) as Record<string, unknown>;

  const displayName = stringOf(obj.displayName);
  if (!displayName || displayName.length < 2 || displayName.length > 60) {
    errors.push({ field: "displayName", message: "must be 2–60 chars" });
  }

  const slug = stringOf(obj.slug);
  if (!slug || !SLUG_RE.test(slug)) {
    errors.push({ field: "slug", message: "lowercase letters/digits/hyphens, 3–40 chars" });
  }

  const bio = stringOrUndef(obj.bio);
  if (bio !== undefined && bio.length > 280) {
    errors.push({ field: "bio", message: "≤ 280 chars" });
  }

  const website = stringOrUndef(obj.website);
  if (website !== undefined && !HTTPS_RE.test(website)) {
    errors.push({ field: "website", message: "must be an https:// URL" });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: { displayName: displayName!, slug: slug!, bio, website } };
}

export function validateListingDraft(
  raw: unknown,
): { ok: true; data: ListingDraftInput } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const obj = (raw ?? {}) as Record<string, unknown>;

  const slug = stringOf(obj.slug);
  if (!slug || !SLUG_RE.test(slug)) {
    errors.push({ field: "slug", message: "lowercase letters/digits/hyphens, 3–40 chars" });
  }

  const name = stringOf(obj.name);
  if (!name || name.length < 2 || name.length > 60) {
    errors.push({ field: "name", message: "must be 2–60 chars" });
  }

  const tagline = stringOf(obj.tagline);
  if (!tagline || tagline.length < 8 || tagline.length > 140) {
    errors.push({ field: "tagline", message: "must be 8–140 chars" });
  }

  const category = stringOf(obj.category) as ListingCategory | "";
  if (!category || !VALID_CATEGORIES.has(category)) {
    errors.push({ field: "category", message: `must be one of: ${[...VALID_CATEGORIES].join(", ")}` });
  }

  const logoUrl = stringOf(obj.logoUrl);
  if (!logoUrl || !HTTPS_RE.test(logoUrl)) {
    errors.push({ field: "logoUrl", message: "must be an https:// URL (Supabase Storage)" });
  }

  const screenshots = arrayOf(obj.screenshots, "string") as string[] | undefined;
  if (screenshots && screenshots.some((s) => !HTTPS_RE.test(s))) {
    errors.push({ field: "screenshots", message: "all entries must be https://" });
  }
  if (screenshots && screenshots.length > 6) {
    errors.push({ field: "screenshots", message: "max 6 screenshots" });
  }

  const descriptionMd = stringOf(obj.descriptionMd);
  if (!descriptionMd || descriptionMd.length < 40 || descriptionMd.length > 8000) {
    errors.push({ field: "descriptionMd", message: "must be 40–8000 chars" });
  }

  const setupMd = stringOf(obj.setupMd);
  if (!setupMd || setupMd.length < 20 || setupMd.length > 8000) {
    errors.push({ field: "setupMd", message: "must be 20–8000 chars" });
  }

  const pricingType = stringOf(obj.pricingType) as PricingType | "";
  if (pricingType !== "free" && pricingType !== "one_time") {
    errors.push({ field: "pricingType", message: "must be 'free' or 'one_time'" });
  }

  let priceCents: number | undefined;
  if (pricingType === "one_time") {
    const raw = obj.priceCents;
    if (typeof raw !== "number" || !isValidPriceCents(raw)) {
      errors.push({ field: "priceCents", message: "must be integer cents in $5–$29 range" });
    } else {
      priceCents = raw;
    }
  } else if (obj.priceCents !== undefined && obj.priceCents !== null) {
    errors.push({ field: "priceCents", message: "must be omitted when pricingType='free'" });
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      slug: slug!,
      name: name!,
      tagline: tagline!,
      category: category as ListingCategory,
      logoUrl: logoUrl!,
      screenshots: screenshots ?? [],
      descriptionMd: descriptionMd!,
      setupMd: setupMd!,
      pricingType: pricingType as PricingType,
      priceCents,
    },
  };
}

/** Validate the `items` array on a bundle create/update payload. Each
 *  element must be {kind, slug} where `kind` is one of the polymorphic
 *  pillar names. `sortOrder` is optional; missing values are filled from
 *  array index by the caller. */
export function validateBundleItems(
  raw: unknown,
): { ok: true; data: BundleItemInput[] } | { ok: false; errors: ValidationError[] } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, errors: [{ field: "items", message: "must be a non-empty array" }] };
  }
  const errors: ValidationError[] = [];
  const out: BundleItemInput[] = [];
  raw.forEach((entry, i) => {
    const obj = (entry ?? {}) as Record<string, unknown>;
    const kind = obj.kind;
    const slug = stringOf(obj.slug);
    if (!isBundleItemKind(kind)) {
      errors.push({ field: `items[${i}].kind`, message: "must be 'connector', 'skill', or 'cli'" });
      return;
    }
    if (!slug || !SLUG_RE.test(slug)) {
      errors.push({ field: `items[${i}].slug`, message: "must be a valid slug" });
      return;
    }
    const sortOrderRaw = obj.sortOrder;
    let sortOrder: number | undefined;
    if (sortOrderRaw !== undefined && sortOrderRaw !== null) {
      if (typeof sortOrderRaw !== "number" || !Number.isFinite(sortOrderRaw)) {
        errors.push({ field: `items[${i}].sortOrder`, message: "must be a finite number" });
        return;
      }
      sortOrder = sortOrderRaw;
    }
    out.push({ kind, slug, sortOrder });
  });
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: out };
}

function stringOf(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}
function stringOrUndef(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  return stringOf(v);
}
function arrayOf(v: unknown, kind: "string"): unknown[] | undefined {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v)) return undefined;
  if (kind === "string" && v.some((x) => typeof x !== "string")) return undefined;
  return v;
}
