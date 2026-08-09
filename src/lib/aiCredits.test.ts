import { describe, expect, it } from "vitest";
import {
  CREDIT_CHECKOUT_SOURCE,
  copAmountForCreditPackage,
  creditMetadata,
  creditPackageFor,
  creditReturnUrl,
  parseCreditPaymentMetadata,
} from "./aiCredits";

describe("AI credit checkout contracts", () => {
  it("only accepts the published $10 and $20 packages", () => {
    expect(creditPackageFor(1000)?.amountMicros).toBe(10_000_000);
    expect(creditPackageFor(2000)?.amountMicros).toBe(20_000_000);
    expect(creditPackageFor(999)).toBeNull();
    expect(creditPackageFor(1000.5)).toBeNull();
    expect(creditPackageFor("1000")).toBeNull();
  });

  it("uses the same rounded COP package prices shown by the desktop", () => {
    expect(copAmountForCreditPackage(creditPackageFor(1000)!, 4100)).toBe(41_000);
    expect(copAmountForCreditPackage(creditPackageFor(2000)!, 4100)).toBe(82_000);
  });

  it("builds public return URLs and preserves Stripe's session placeholder", () => {
    expect(
      creditReturnUrl({
        base: "https://terminalsync.ai",
        lang: "es",
        flavor: "lab",
        status: "success",
        stripeSessionPlaceholder: true,
      }),
    ).toBe(
      "https://terminalsync.ai/es/credits/return?status=success&flavor=lab&session_id={CHECKOUT_SESSION_ID}",
    );
  });

  it("carries the agreed peso amount so a moving rate cannot void a payment", () => {
    const creditPackage = creditPackageFor(1000)!;
    const metadata = creditMetadata({
      userId: "user-123",
      creditPackage,
      rail: "mercadopago",
      copAmount: 34_600,
    });
    // The webhook verifies against this, not against whatever the TRM is by the
    // time the payment confirms — otherwise a real payment gets rejected and
    // the customer pays without receiving credits.
    expect(metadata.cop_amount).toBe("34600");
    expect(parseCreditPaymentMetadata(metadata)?.copAmount).toBe(34_600);

    // A junk or negative amount reads as "not recorded" rather than as a price.
    expect(
      parseCreditPaymentMetadata({ ...metadata, cop_amount: "-1" })?.copAmount,
    ).toBeNull();
    expect(
      parseCreditPaymentMetadata({ ...metadata, cop_amount: "nope" })?.copAmount,
    ).toBeNull();
  });

  it("rejects tampered payment metadata before granting credits", () => {
    const creditPackage = creditPackageFor(1000)!;
    const metadata = creditMetadata({
      userId: "user-123",
      creditPackage,
      rail: "mercadopago",
    });
    expect(parseCreditPaymentMetadata(metadata)).toEqual({
      userId: "user-123",
      creditPackage,
      rail: "mercadopago",
      // No amount was recorded, so the webhook falls back to the fixed figure.
      copAmount: null,
    });
    expect(
      parseCreditPaymentMetadata({
        ...metadata,
        credit_amount_micros: "20000000",
      }),
    ).toBeNull();
    expect(
      parseCreditPaymentMetadata({
        ...metadata,
        source: `${CREDIT_CHECKOUT_SOURCE}_fake`,
      }),
    ).toBeNull();
  });
});
