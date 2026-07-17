// Sent when a subscription gets fully canceled (subscription.deleted from
// Stripe). The goal is reassurance, not retention pressure: confirm the
// cancellation, tell them what stays, and leave a clean door open in case
// they want to come back.

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
  /** Plan they had, e.g. "Pro" or "Dev". */
  planName: string;
  /** Stripe customer portal URL — for restarting later or downloading invoices. */
  manageBillingUrl: string;
  /** Optional one-line reason text from Stripe / cancellation form. */
  reason?: string;
  unsubscribeUrl: string;
  lang: "es" | "en";
}

export function CancellationConfirmedEmail({
  firstName,
  planName,
  manageBillingUrl,
  reason,
  unsubscribeUrl,
  lang,
}: Props) {
  const COPY = {
    es: {
      preheader: (plan: string) =>
        `Cancelaste tu plan ${plan}. Tus datos se mantienen — podés volver cuando quieras.`,
      heading: "👋 Cancelación confirmada",
      greeting: (name: string) => `¡Hola ${name}!`,
      confirmedPrefix: "Confirmado: cancelaste tu plan Terminal Sync ",
      confirmedSuffix:
        ". Pasaste a Free a partir de ahora — sin más cargos.",
      calloutStrong: "Tus terminales y connectors se mantienen.",
      calloutRest:
        " No borramos nada. Solo se aplican los límites del plan Free (1 terminal activa). Si un día querés crear más, te avisamos cuando lo intentes.",
      dataKept:
        "Tus archivos, los MCP servers que configuraste, las contraseñas cifradas — todo sigue donde estaba. Tu cuenta sigue funcionando para siempre con plan Free.",
      reasonPrefix: "Anotamos como motivo: “",
      reasonSuffix: "”. Gracias por decirnos.",
      bugNote:
        "Si la cancelación fue por un bug o algo no funcionaba como esperabas, respondé este correo. Lo leo yo. Quiero entender qué pasó.",
      button: "Reactivar mi plan o ver facturas",
    },
    en: {
      preheader: (plan: string) =>
        `You canceled your ${plan} plan. Your data stays put — come back whenever you like.`,
      heading: "👋 Cancellation confirmed",
      greeting: (name: string) => `Hi ${name}!`,
      confirmedPrefix: "Confirmed: you canceled your Terminal Sync ",
      confirmedSuffix:
        " plan. You're on Free from now on — no more charges.",
      calloutStrong: "Your terminals and connectors stay put.",
      calloutRest:
        " We don't delete anything. Only the Free plan limits apply (1 active terminal). If you ever want to create more, we'll let you know when you try.",
      dataKept:
        "Your files, the MCP servers you set up, your encrypted passwords — everything stays right where it was. Your account keeps working forever on the Free plan.",
      reasonPrefix: "We noted your reason: “",
      reasonSuffix: "”. Thanks for telling us.",
      bugNote:
        "If you canceled because of a bug or something wasn't working the way you expected, just reply to this email. I read it myself. I want to understand what happened.",
      button: "Reactivate my plan or view invoices",
    },
  } as const;
  const t = COPY[lang];

  return (
    <EmailShell
      preheader={t.preheader(planName)}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>{t.heading}</H1>
      <P>{t.greeting(firstName)}</P>
      <P>
        {t.confirmedPrefix}
        <strong>{planName}</strong>
        {t.confirmedSuffix}
      </P>

      <Callout variant="ok">
        <strong>{t.calloutStrong}</strong>
        {t.calloutRest}
      </Callout>

      <P>{t.dataKept}</P>

      {reason && (
        <P>
          <em>
            {t.reasonPrefix}
            {reason}
            {t.reasonSuffix}
          </em>
        </P>
      )}

      <P>{t.bugNote}</P>

      <PrimaryButton href={manageBillingUrl}>{t.button}</PrimaryButton>

      <Signoff />
    </EmailShell>
  );
}

export default CancellationConfirmedEmail;
