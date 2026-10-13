import type { PlanId } from "./stripe";

export function shouldApplyCheckoutTrial(
  plan: PlanId,
  supabaseUserId?: string | null,
): boolean {
  return !supabaseUserId && (plan === "pro" || plan === "max");
}
