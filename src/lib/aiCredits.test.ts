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
