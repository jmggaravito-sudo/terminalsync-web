// Sent when Stripe reports a failed charge (invoice.payment_failed). Stripe
// will retry the card on its own schedule (usually 3 attempts over 2 weeks);
// this email gives the user a clear path to fix their card before access
// gets revoked.

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
  /** Friendly plan label, e.g. "Pro mensual" or "Dev anual". */
  planName: string;
  /** Amount string formatted for display, e.g. "$19.00 USD". */
  amountFormatted: string;
  /** Stripe customer portal URL where they can update the card. */
  updatePaymentUrl: string;
  unsubscribeUrl: string;
}

export function PaymentFailedEmail({
  firstName,
  planName,
  amountFormatted,
  updatePaymentUrl,
  unsubscribeUrl,
}: Props) {
  return (
    <EmailShell
      preheader={`No pudimos cobrar ${amountFormatted} de tu plan ${planName}. Actualizá tu método de pago.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>⚠️ No pudimos cobrar tu plan {planName}</H1>
      <P>¡Hola {firstName}!</P>
      <P>
        Tu banco rechazó el cobro de <strong>{amountFormatted}</strong>{" "}
        correspondiente a tu plan Terminal Sync <strong>{planName}</strong>. No
        pasa nada — vamos a reintentar automáticamente unas veces más.
      </P>

      <Callout variant="warn">
        <strong>Tu acceso sigue activo por ahora.</strong> Si los próximos
        intentos también fallan, tu plan vuelve a Free y perdés algunas
        features (las terminales que ya creaste se mantienen).
      </Callout>

      <P>
        Lo más rápido para resolverlo: actualizá tu método de pago desde tu
        portal de facturación. Toma 30 segundos.
      </P>

      <PrimaryButton href={updatePaymentUrl}>
        Actualizar método de pago
      </PrimaryButton>

      <P>
        Causas comunes: tarjeta vencida, fondos insuficientes, o el banco
        bloqueó el cobro internacional (a Stripe). Si lo último, llamá a tu
        banco y autorizá cobros de "Stripe Inc."
      </P>

      <P>
        Si necesitás ayuda específica, respondé este correo y te ayudo
        directamente.
      </P>

      <Signoff />
    </EmailShell>
  );
}

export default PaymentFailedEmail;
