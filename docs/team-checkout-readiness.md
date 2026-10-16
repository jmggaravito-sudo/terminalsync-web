# Team checkout readiness

Team is a composable add-on listed at **US$59 per employee/seat/month**. It must coexist with the customer’s Pro or Max base plan; it must never replace `subscriptions.plan` or downgrade/overwrite Pro/Max. `STRIPE_PRICE_TEAM` is the
server-side configuration key for the future monthly per-seat Stripe Price;
this repository change does not create or validate a Stripe Price remotely.

`POST /api/checkout` accepts a Team `seats` quantity only when it is a
positive safe integer. It fails closed when `STRIPE_PRICE_TEAM` is absent and
also refuses to create a Checkout Session even when configured. That second
gate is intentional: the current subscription constraint and
`SubscriptionPlan` model do not include Team, and Stripe subscription sync
does not map a Team Price. A Team purchase could otherwise be acknowledged by
Stripe while the application records the account as Free.

The future contract is a Team membership/seat entitlement layered on the unchanged Pro/Max base plan. Persist Team membership, seat quantity, and lifecycle separately from `subscriptions.plan`; webhook/subscription mapping must preserve the base plan. The agreed Team trial is seven days with no card and no automatic charge.
It is **not implemented by this checkout gate**. It needs a server-side
trial entitlement with a defined account identity, expiry, enforcement and
explicit post-trial plan selection, plus webhook/DB support for the separate Team membership/seat entitlement (not a `subscriptions.plan = team` conversion). Merely setting
Stripe `trial_period_days` would create a subscription lifecycle, and the
existing checkout requires payment-method collection; changing that without
the entitlement path would risk granting no Team access or implying a charge
after the trial. Keep Team marked as coming soon until those pieces and tests
are ready. Pro and Max checkout behavior is unchanged.
