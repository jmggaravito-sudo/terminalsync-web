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
  lang: "es" | "en";
  firstName: string;
  /** Friendly plan label, e.g. "Pro mensual" or "Dev anual". */
  planName: string;
  /** Amount string formatted for display, e.g. "$19.00 USD". */
  amountFormatted: string;
  /** Stripe customer portal URL where they can update the card. */
  updatePaymentUrl: string;
  unsubscribeUrl: string;
}

const COPY = {
  es: {
    preheader: (amountFormatted: string, planName: string) =>
      `No pudimos cobrar ${amountFormatted} de tu plan ${planName}. Actualizá tu método de pago.`,
    heading: "⚠️ No pudimos cobrar tu plan ",
    greeting: "¡Hola ",
    greetingEnd: "!",
    bodyBefore: "Tu banco rechazó el cobro de ",
    bodyMiddle: " correspondiente a tu plan Terminal Sync ",
    bodyAfter: ". No pasa nada — vamos a reintentar automáticamente unas veces más.",
    calloutBold: "Tu acceso sigue activo por ahora.",
    calloutRest:
      " Si los próximos intentos también fallan, tu plan vuelve a Free y perdés algunas features (las terminales que ya creaste se mantienen).",
    fixFast:
      "Lo más rápido para resolverlo: actualizá tu método de pago desde tu portal de facturación. Toma 30 segundos.",
    button: "Actualizar método de pago",
    causes:
      'Causas comunes: tarjeta vencida, fondos insuficientes, o el banco bloqueó el cobro internacional (a Stripe). Si lo último, llamá a tu banco y autorizá cobros de "Stripe Inc."',
    help: "Si necesitás ayuda específica, respondé este correo y te ayudo directamente.",
  },
  en: {
    preheader: (amountFormatted: string, planName: string) =>
      `We couldn't charge ${amountFormatted} for your ${planName} plan. Update your payment method.`,
    heading: "⚠️ We couldn't charge your ",
    greeting: "Hi ",
    greetingEnd: "!",
    bodyBefore: "Your bank declined the charge of ",
    bodyMiddle: " for your Terminal Sync ",
    bodyAfter: " plan. No worries — we'll automatically retry a few more times.",
    calloutBold: "Your access is still active for now.",
    calloutRest:
      " If the next attempts also fail, your plan reverts to Free and you'll lose some features (the terminals you already created stay put).",
    fixFast:
      "The fastest way to fix it: update your payment method from your billing portal. It takes 30 seconds.",
    button: "Update payment method",
    causes:
      'Common causes: an expired card, insufficient funds, or your bank blocking the international charge (to Stripe). If it\'s the last one, call your bank and authorize charges from "Stripe Inc."',
    help: "If you need specific help, just reply to this email and I'll help you directly.",
  },
} as const;

export function PaymentFailedEmail({
  lang,
  firstName,
  planName,
  amountFormatted,
  updatePaymentUrl,
  unsubscribeUrl,
}: Props) {
  const t = COPY[lang];
  return (
    <EmailShell
      preheader={t.preheader(amountFormatted, planName)}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>
        {t.heading}
        {planName}
      </H1>
      <P>
        {t.greeting}
        {firstName}
        {t.greetingEnd}
      </P>
      <P>
        {t.bodyBefore}
        <strong>{amountFormatted}</strong>
        {t.bodyMiddle}
        <strong>{planName}</strong>
        {t.bodyAfter}
      </P>

      <Callout variant="warn">
        <strong>{t.calloutBold}</strong>
        {t.calloutRest}
      </Callout>

      <P>{t.fixFast}</P>

      <PrimaryButton href={updatePaymentUrl}>{t.button}</PrimaryButton>

      <P>{t.causes}</P>

      <P>{t.help}</P>

      <Signoff />
    </EmailShell>
  );
}

export default PaymentFailedEmail;
