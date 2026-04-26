// Revenue-share math for the connector marketplace.
//
// Decisions (see MARKETPLACE design):
//   • Take-rate = 10% by default.
//   • First 50 publishers get a 0% take-rate for 6 months from approval —
//     a launch incentive. Eligibility is tracked via the publisher's row
//     (`approved_at` + a global count of approved publishers at that time).
//   • One-time pricing only in MVP, $5–$29 (500–2900 cents).

export const MARKETPLACE_TAKE_RATE_DEFAULT = 0.10;
export const FOUNDING_PUBLISHERS_LIMIT = 50;
export const FOUNDING_WAIVER_DAYS = 180;
export const PRICE_CENTS_MIN = 500;   // $5
export const PRICE_CENTS_MAX = 2900;  // $29

export interface SplitInput {
  grossCents: number;
  /** When the publisher was first approved (their approved_at). Null means
   *  not yet approved — should never get here, but treated as ineligible. */
  publisherApprovedAt: Date | null;
  /** Their position in the approval order (1 = first publisher approved).
   *  Anything > FOUNDING_PUBLISHERS_LIMIT is not eligible for the waiver. */
  publisherApprovalRank: number | null;
}

export interface Split {
  grossCents: number;
  takeRate: number;          // 0 or 0.10
  tsTakeCents: number;       // grossCents * takeRate, rounded
  publisherCents: number;    // grossCents - tsTakeCents (Stripe fees deducted from this side via Connect)
  waiverApplied: boolean;
}

/** Compute the revenue split for a single one-time charge. Stripe fees are
 *  not modeled here — Stripe Connect deducts them from the destination
 *  transfer automatically. The numbers in this object describe the *gross*
 *  application fee (TS take) vs the destination transfer (publisher cents
 *  before Stripe fees). */
export function computeSplit(input: SplitInput): Split {
  const { grossCents, publisherApprovedAt, publisherApprovalRank } = input;

  const eligible =
    publisherApprovedAt !== null &&
    publisherApprovalRank !== null &&
    publisherApprovalRank <= FOUNDING_PUBLISHERS_LIMIT &&
    daysSince(publisherApprovedAt) <= FOUNDING_WAIVER_DAYS;

  const takeRate = eligible ? 0 : MARKETPLACE_TAKE_RATE_DEFAULT;
  const tsTakeCents = Math.round(grossCents * takeRate);
  const publisherCents = grossCents - tsTakeCents;

  return {
    grossCents,
    takeRate,
    tsTakeCents,
    publisherCents,
    waiverApplied: eligible,
  };
}

function daysSince(date: Date): number {
  const ms = Date.now() - date.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export function isValidPriceCents(cents: number): boolean {
  return (
    Number.isInteger(cents) &&
    cents >= PRICE_CENTS_MIN &&
    cents <= PRICE_CENTS_MAX
  );
}
