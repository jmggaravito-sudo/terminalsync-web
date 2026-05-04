// Sent ~24h before the 7-day trial converts. Final, urgent reminder.
// Sibling of trial-ending.tsx (which fires 3 days before via Stripe's
// trial_will_end webhook). This 24h variant is fired by a Vercel Cron
// scanning subscriptions where trial_end is in [now, now+30h] and the
// reminder hasn't been sent yet.

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
  /** Localized date string, e.g. "1 de mayo de 2026". */
  trialEndDate: string;
  /** Amount that will be charged, e.g. "$190.00". */
  chargeAmount: string;
  /** Stripe customer portal URL — lets the user cancel/manage. */
  manageBillingUrl: string;
  unsubscribeUrl: string;
}

export function TrialChargingTomorrowEmail({
  firstName,
  planName,
  trialEndDate,
  chargeAmount,
  manageBillingUrl,
  unsubscribeUrl,
}: Props) {
  return (
    <EmailShell
      preheader={`Mañana cobramos ${chargeAmount} de tu plan ${planName}. Cancela hoy si lo querés evitar.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>Mañana se renueva tu plan {planName}</H1>
      <P>¡Hola {firstName}!</P>
      <P>
        Te aviso con anticipación: <strong>mañana ({trialEndDate})</strong> se
        cobra <strong>{chargeAmount}</strong> en la tarjeta que dejaste y
        Terminal Sync {planName} sigue activo sin interrupciones.
      </P>

      <Callout variant="ok">
        <strong>No tenés que hacer nada</strong> si querés continuar — todo
        sigue funcionando como hasta ahora.
      </Callout>

      <P>
        Si cambiaste de opinión, podés cancelar con un click desde tu portal
        de facturación y no se cobra nada. Tu acceso queda activo hasta hoy a
        la noche.
      </P>

      <PrimaryButton href={manageBillingUrl}>
        Administrar mi suscripción
      </PrimaryButton>

      <P>
        Cualquier duda, respondé este correo. Lo leo yo directamente.
      </P>

      <Signoff />
    </EmailShell>
  );
}

export default TrialChargingTomorrowEmail;
