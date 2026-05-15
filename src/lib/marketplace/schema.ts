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

/** Shape of a single proposed item inside a bundle proposal. Carries an
 *  extra `whyItHelps` blurb so the reviewer can see Claude's reasoning
 *  for picking this specific item next to the slug in the queue UI. */
export interface ProposedItem {
  kind: BundleItemKind;
  slug: string;
  sortOrder: number;
  whyItHelps: string;
}

/** Public shape of a row in the `bundle_proposals` table after it's
 *  been read back by the admin list endpoint. snake_case → camelCase
 *  is done at the API boundary; consumers see camelCase. */
export interface BundleProposal {
  id: string;
  persona: string;
  personaLabel: string;
  painPoint: string;
  name: string;
  slug: string;
  tagline: string;
  descriptionMd: string;
  setupMd: string;
  samplePrompts: string[];
  proposedItems: ProposedItem[];
  priceCents: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "superseded";
  publishedBundleId: string | null;
  proposedBy: string;
  reviewerNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Public shape of a Stack Pack as exposed by the admin list endpoint.
 *  Mirrors the `bundles` table columns plus `samplePrompts` added in
 *  migration 0012. Public detail pages use this same field. */
export interface Bundle {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  descriptionMd: string;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  priceCents: number;
  currency: string;
  status: "draft" | "active" | "archived";
  samplePrompts: string[];
  items: BundleItemInput[];
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

/** Validate a single proposal payload from the n8n ingest endpoint.
 *  Slug uniqueness is NOT checked here — collisions are resolved on
 *  approval, not at insert time. Item slugs are accepted as-is (the
 *  reviewer catches bad refs visually). */
export interface ProposalIngestInput {
  persona: string;
  personaLabel: string;
  painPoint: string;
  name: string;
  slug: string;
  tagline: string;
  descriptionMd: string;
  setupMd: string;
  samplePrompts: string[];
  proposedItems: ProposedItem[];
  priceCents?: number;
  currency?: string;
  proposedBy?: string;
}

export function validateProposal(
  raw: unknown,
):
  | { ok: true; data: ProposalIngestInput }
  | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const obj = (raw ?? {}) as Record<string, unknown>;

  const persona = stringOf(obj.persona);
  if (!persona || persona.length > 60) {
    errors.push({ field: "persona", message: "must be 1-60 chars" });
  }
  const personaLabel = stringOf(obj.personaLabel ?? obj.persona_label);
  if (!personaLabel || personaLabel.length > 160) {
    errors.push({ field: "personaLabel", message: "must be 1-160 chars" });
  }
  const painPoint = stringOf(obj.painPoint ?? obj.pain_point);
  if (!painPoint || painPoint.length > 200) {
    errors.push({ field: "painPoint", message: "must be 1-200 chars" });
  }
  const name = stringOf(obj.name);
  if (!name || name.length < 2 || name.length > 80) {
    errors.push({ field: "name", message: "must be 2-80 chars" });
  }
  const slug = stringOf(obj.slug);
  if (!slug || !SLUG_RE.test(slug)) {
    errors.push({ field: "slug", message: "lowercase letters/digits/hyphens, 3-40 chars" });
  }
  const tagline = stringOf(obj.tagline);
  if (!tagline || tagline.length < 8 || tagline.length > 200) {
    errors.push({ field: "tagline", message: "must be 8-200 chars" });
  }
  const descriptionMd = stringOf(obj.descriptionMd ?? obj.description_md) ?? "";
  if (!descriptionMd || descriptionMd.length < 20 || descriptionMd.length > 8000) {
    errors.push({ field: "descriptionMd", message: "must be 20-8000 chars" });
  }
  const setupMd = stringOf(obj.setupMd ?? obj.setup_md) ?? "";
  if (!setupMd || setupMd.length < 10 || setupMd.length > 8000) {
    errors.push({ field: "setupMd", message: "must be 10-8000 chars" });
  }

  const promptsRaw = obj.samplePrompts ?? obj.sample_prompts;
  let samplePrompts: string[] = [];
  if (promptsRaw !== undefined && promptsRaw !== null) {
    if (!Array.isArray(promptsRaw)) {
      errors.push({ field: "samplePrompts", message: "must be an array of strings" });
    } else {
      samplePrompts = promptsRaw
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .map((p) => p.trim().slice(0, 1000));
      if (samplePrompts.length > 10) {
        errors.push({ field: "samplePrompts", message: "max 10 prompts" });
      }
    }
  }

  const itemsRaw = obj.proposedItems ?? obj.proposed_items;
  const proposedItems: ProposedItem[] = [];
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    errors.push({ field: "proposedItems", message: "must be a non-empty array" });
  } else {
    itemsRaw.forEach((entry, i) => {
      const ent = (entry ?? {}) as Record<string, unknown>;
      const kind = ent.kind;
      const itemSlug = stringOf(ent.slug);
      if (!isBundleItemKind(kind)) {
        errors.push({
          field: `proposedItems[${i}].kind`,
          message: "must be 'connector', 'skill', or 'cli'",
        });
        return;
      }
      if (!itemSlug) {
        errors.push({
          field: `proposedItems[${i}].slug`,
          message: "must be a non-empty string",
        });
        return;
      }
      const sortRaw = ent.sortOrder ?? ent.sort_order;
      const sortOrder =
        typeof sortRaw === "number" && Number.isFinite(sortRaw) ? sortRaw : i;
      const whyRaw = ent.whyItHelps ?? ent.why_it_helps;
      const whyItHelps =
        typeof whyRaw === "string" ? whyRaw.trim().slice(0, 500) : "";
      proposedItems.push({ kind, slug: itemSlug, sortOrder, whyItHelps });
    });
  }

  const priceCents =
    typeof obj.priceCents === "number"
      ? obj.priceCents
      : typeof obj.price_cents === "number"
        ? (obj.price_cents as number)
        : undefined;
  if (priceCents !== undefined && (!Number.isInteger(priceCents) || priceCents <= 0)) {
    errors.push({ field: "priceCents", message: "must be a positive integer (cents)" });
  }
  const currency = stringOf(obj.currency);
  const proposedBy = stringOf(obj.proposedBy ?? obj.proposed_by);

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      persona: persona!,
      personaLabel: personaLabel!,
      painPoint: painPoint!,
      name: name!,
      slug: slug!,
      tagline: tagline!,
      descriptionMd,
      setupMd,
      samplePrompts,
      proposedItems,
      priceCents,
      currency,
      proposedBy,
    },
  };
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
