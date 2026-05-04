// Sent right after the FIRST paid invoice clears (i.e., the trial just
// converted to a paid subscription). Confirms the charge and reassures the
// user about everything they keep. Fired from invoice.paid when
// billing_reason === "subscription_cycle" AND the prior subscription
// status was trialing.

import {
  Callout,
  EmailShell,
  H1,
  P,
  PrimaryButton,
  Signoff,
} from "./_layout";

interface Props {
  firstName: string;
  /** "Pro" or "Dev" — user-facing name. */
  planName: string;
  /** Charged amount (already formatted), e.g. "$190.00". */
  chargeAmount: string;
  /** Localized next renewal date, e.g. "1 de mayo de 2027". */
  nextRenewalDate: string;
  /** Stripe customer portal URL. */
  manageBillingUrl: string;
  /** Stripe-hosted invoice URL (PDF + line items). */
  invoiceUrl?: string;
  unsubscribeUrl: string;
}

export function ChargeSuccessEmail({
  firstName,
  planName,
  chargeAmount,
  nextRenewalDate,
  manageBillingUrl,
  invoiceUrl,
  unsubscribeUrl,
}: Props) {
  return (
    <EmailShell
      preheader={`Cobramos ${chargeAmount}. Tu plan ${planName} sigue activo. Próxima renovación: ${nextRenewalDate}.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>✅ Listo — tu plan {planName} está activo</H1>
      <P>¡Hola {firstName}!</P>
      <P>
        Acabamos de cobrar <strong>{chargeAmount}</strong>. Tu plan{" "}
        <strong>{planName}</strong> sigue activo sin cambios — todo lo que
        configuraste estos 7 días continúa exactamente como lo dejaste.
      </P>

      <Callout variant="ok">
        <strong>Próxima renovación:</strong> {nextRenewalDate}. Te avisamos 24
        horas antes así no te toma por sorpresa.
      </Callout>

      <P>
        Si necesitás factura, cambiar tarjeta, o pausar el plan, todo se
        maneja desde el portal:
      </P>

      <PrimaryButton href={manageBillingUrl}>
        Abrir portal de facturación
      </PrimaryButton>

      {invoiceUrl ? (
        <P>
          Recibo de esta cobranza:{" "}
          <a href={invoiceUrl} style={{ color: "#2563eb" }}>
            verlo en Stripe
          </a>
          .
        </P>
      ) : null}

      <P>
        Gracias por bancar el proyecto. Si algo no funciona como esperás,
        respondé este correo y lo arreglo.
      </P>

      <Signoff />
    </EmailShell>
  );
}

export default ChargeSuccessEmail;
