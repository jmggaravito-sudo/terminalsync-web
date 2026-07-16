import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WelcomeEmail } from "./welcome";
import { TrialEndingEmail } from "./trial-ending";
import { PaymentFailedEmail } from "./payment-failed";
import { CancellationConfirmedEmail } from "./cancellation-confirmed";
import { AccountDeletionRequestedEmail } from "./account-deletion-requested";
import { MarketplaceListingApprovedEmail } from "./marketplace-listing-approved";
import { MarketplaceListingRejectedEmail } from "./marketplace-listing-rejected";

// Behavioral proof that every customer email renders in the chosen
// language — an English marker must appear in en output and NOT in es, and
// a Spanish marker in es. Guards against a template that ignores `lang`.
function html(node: React.ReactElement): string {
  return renderToStaticMarkup(node);
}

describe("emails render bilingually", () => {
  it("welcome", () => {
    const en = html(
      WelcomeEmail({ firstName: "Sam", downloadUrl: "#", unsubscribeUrl: "#", lang: "en" }),
    );
    const es = html(
      WelcomeEmail({ firstName: "Sam", downloadUrl: "#", unsubscribeUrl: "#", lang: "es" }),
    );
    expect(en).toMatch(/Welcome to the new way|superpowers/i);
    expect(en).not.toMatch(/Bienvenido a la nueva forma/);
    expect(es).toMatch(/Bienvenido a la nueva forma/);
    // Honest security copy in both languages (no "your files are encrypted").
    expect(en).toMatch(/project files stay in your own cloud/i);
    expect(es).toMatch(/archivos de proyecto se guardan en tu propia nube/i);
  });

  it("trial-ending", () => {
    const props = {
      firstName: "Sam",
      planName: "Pro",
      trialEndDate: "May 1",
      manageBillingUrl: "#",
      unsubscribeUrl: "#",
    };
    expect(html(TrialEndingEmail({ ...props, lang: "en" }))).toMatch(/trial ends|What you keep/i);
    expect(html(TrialEndingEmail({ ...props, lang: "es" }))).toMatch(/termina|Lo que seguís/i);
  });

  it("payment-failed", () => {
    const props = {
      firstName: "Sam",
      planName: "Pro",
      amountFormatted: "$19.00",
      updatePaymentUrl: "#",
      unsubscribeUrl: "#",
    };
    expect(html(PaymentFailedEmail({ ...props, lang: "en" }))).toMatch(/couldn't charge|payment method/i);
    expect(html(PaymentFailedEmail({ ...props, lang: "es" }))).toMatch(/cobrar|método de pago/i);
  });

  it("cancellation", () => {
    const props = {
      firstName: "Sam",
      planName: "Pro",
      manageBillingUrl: "#",
      unsubscribeUrl: "#",
    };
    expect(html(CancellationConfirmedEmail({ ...props, lang: "en" }))).toMatch(/canceled|Cancellation confirmed/i);
    expect(html(CancellationConfirmedEmail({ ...props, lang: "es" }))).toMatch(/cancelaste|Cancelación confirmada/i);
  });

  it("account-deletion", () => {
    const props = {
      firstName: "Sam",
      purgeAtIso: "2026-08-01",
      purgeAtHuman: "August 1, 2026",
      signInUrl: "#",
      unsubscribeUrl: "#",
    };
    expect(html(AccountDeletionRequestedEmail({ ...props, lang: "en" }))).toMatch(/scheduled for deletion|Sign in to undo/i);
    expect(html(AccountDeletionRequestedEmail({ ...props, lang: "es" }))).toMatch(/eliminación|Ingresar para deshacer/i);
  });

  it("marketplace-listing-approved", () => {
    const props = {
      publisherName: "Sam",
      listingName: "My Connector",
      listingSlug: "my-connector",
      isPaid: true,
      unsubscribeUrl: "#",
    };
    const en = html(MarketplaceListingApprovedEmail({ ...props, lang: "en" }));
    const es = html(MarketplaceListingApprovedEmail({ ...props, lang: "es" }));
    expect(en).toMatch(/was approved|live in the marketplace/i);
    expect(en).not.toMatch(/fue aprobado/);
    expect(es).toMatch(/fue aprobado|visible en el marketplace/i);
    // URL is lang-aware.
    expect(en).toMatch(/terminalsync\.ai\/en\/connectors\/my-connector/);
    expect(es).toMatch(/terminalsync\.ai\/es\/connectors\/my-connector/);
  });

  it("marketplace-listing-rejected", () => {
    const props = {
      publisherName: "Sam",
      listingName: "My Connector",
      reviewNotes: "Fix the manifest icon.",
      unsubscribeUrl: "#",
    };
    const en = html(MarketplaceListingRejectedEmail({ ...props, lang: "en" }));
    const es = html(MarketplaceListingRejectedEmail({ ...props, lang: "es" }));
    expect(en).toMatch(/needs a few tweaks|couldn't approve/i);
    expect(en).not.toMatch(/necesita ajustes/);
    expect(es).toMatch(/necesita ajustes|No pudimos aprobar/i);
    // Review notes pass through regardless of language.
    expect(en).toMatch(/Fix the manifest icon\./);
    expect(es).toMatch(/Fix the manifest icon\./);
  });
});
