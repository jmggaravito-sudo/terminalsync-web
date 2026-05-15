/**
 * Helpers for the bundle-proposal staging table.
 *
 * The DB stores snake_case columns (matches every other table in this
 * project) but consumers — admin page, ingest response, approval flow —
 * want camelCase. Centralizing the mapping here keeps the routes tiny
 * and avoids 4 different inline transforms.
 */

import type {
  BundleProposal,
  ProposalIngestInput,
  ProposedItem,
} from "./schema";
import { isBundleItemKind } from "./bundleItems";

/** Raw row shape coming out of `select * from bundle_proposals`. Field
 *  list is hand-maintained — adding a column requires updating this
 *  interface + `rowToProposal` below. */
export interface ProposalRow {
  id: string;
  persona: string;
  persona_label: string;
  pain_point: string;
  name: string;
  slug: string;
  tagline: string;
  description_md: string;
  setup_md: string;
  sample_prompts: string[] | null;
  proposed_items: unknown;
  price_cents: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "superseded";
  published_bundle_id: string | null;
  proposed_by: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

function coerceItems(raw: unknown): ProposedItem[] {
  if (!Array.isArray(raw)) return [];
  const out: ProposedItem[] = [];
  raw.forEach((entry, i) => {
    if (!entry || typeof entry !== "object") return;
    const obj = entry as Record<string, unknown>;
    const kind = obj.kind;
    const slug = typeof obj.slug === "string" ? obj.slug : "";
    if (!isBundleItemKind(kind) || !slug) return;
    const sortRaw = obj.sortOrder ?? obj.sort_order;
    const sortOrder =
      typeof sortRaw === "number" && Number.isFinite(sortRaw) ? sortRaw : i;
    const whyRaw = obj.whyItHelps ?? obj.why_it_helps;
    const whyItHelps = typeof whyRaw === "string" ? whyRaw : "";
    out.push({ kind, slug, sortOrder, whyItHelps });
  });
  out.sort((a, b) => a.sortOrder - b.sortOrder);
  return out;
}

/** Normalize a DB row to the camelCase wire shape. */
export function rowToProposal(row: ProposalRow): BundleProposal {
  return {
    id: row.id,
    persona: row.persona,
    personaLabel: row.persona_label,
    painPoint: row.pain_point,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    descriptionMd: row.description_md,
    setupMd: row.setup_md,
    samplePrompts: Array.isArray(row.sample_prompts) ? row.sample_prompts : [],
    proposedItems: coerceItems(row.proposed_items),
    priceCents: row.price_cents,
    currency: row.currency,
    status: row.status,
    publishedBundleId: row.published_bundle_id,
    proposedBy: row.proposed_by,
    reviewerNotes: row.reviewer_notes,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Convert a validated ingest payload to the row shape ready to insert. */
export function proposalToInsertRow(
  p: ProposalIngestInput,
): Record<string, unknown> {
  return {
    persona: p.persona,
    persona_label: p.personaLabel,
    pain_point: p.painPoint,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description_md: p.descriptionMd,
    setup_md: p.setupMd,
    sample_prompts: p.samplePrompts,
    // jsonb column — store the camelCase shape so we can read it back
    // without a second normalization step.
    proposed_items: p.proposedItems,
    price_cents: p.priceCents ?? 1900,
    currency: p.currency ?? "usd",
    proposed_by: p.proposedBy ?? "claude",
  };
}
