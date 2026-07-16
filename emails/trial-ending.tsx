// Sent ~3 days before the 7-day trial converts to paid. Last touchpoint
// to remind the user what they get if they stay + give them a clear path
// to cancel if they want out.

import {
  Callout,
  EmailShell,
  H1,
  P,
  PrimaryButton,
  Signoff,
  COLORS,
} from "./_layout";

interface Props {
  firstName: string;
  /** "Pro" or "Dev" — user-facing name. */
  planName: string;
  /** Localized date string, e.g. "1 de mayo de 2026". */
  trialEndDate: string;
  /** Stripe customer portal URL — lets the user cancel/manage. */
  manageBillingUrl: string;
  unsubscribeUrl: string;
  lang: "es" | "en";
}

export function TrialEndingEmail({
  firstName,
  planName,
  trialEndDate,
  manageBillingUrl,
  unsubscribeUrl,
  lang,
}: Props) {
  const COPY = {
    es: {
      preheaderA: "Tu prueba de ",
      preheaderB: " termina el ",
      preheaderC: ". Esto es lo que mantenés.",
      h1Prefix: "⏰ Quedan 3 días de tu prueba ",
      greetingPre: "¡Hola ",
      greetingPost: "!",
      introA: "Tu prueba de Terminal Sync ",
      introB: " termina el ",
      introC:
        ". A partir de ahí, tu tarjeta se cobra automáticamente y mantenés todo lo que estás usando ahora.",
      benefitsHeading: "Lo que seguís teniendo",
      benefit1: "Tus terminales sincronizadas entre todas tus computadoras",
      benefit2: "Tus connectors MCP (Notion, Supabase, etc.) viajando con vos",
      benefit3: "Cifrado AES-256 — tu data nunca viaja en claro",
      benefit4:
        "Acceso a Claude Code, Claude AI y Cowork desde un solo lugar",
      continueA:
        "Si querés seguir, no tenés que hacer nada — todo continúa el día ",
      continueB: ".",
      calloutTitle: "¿Cambiaste de opinión?",
      calloutBefore: "Podés cancelar antes del ",
      calloutAfter:
        " sin cargo desde tu portal de facturación. Tu acceso sigue activo hasta esa fecha.",
      button: "Administrar mi suscripción",
      questions:
        "Si tenés alguna duda — o feedback — respondé este correo. Lo leo yo directamente.",
    },
    en: {
      preheaderA: "Your ",
      preheaderB: " trial ends on ",
      preheaderC: ". Here's what you keep.",
      h1Prefix: "⏰ 3 days left in your ",
      greetingPre: "Hi ",
      greetingPost: "!",
      introA: "Your Terminal Sync ",
      introB: " trial ends on ",
      introC:
        ". After that, your card is charged automatically and you keep everything you're using right now.",
      benefitsHeading: "What you keep",
      benefit1: "Your terminals synced across all your computers",
      benefit2:
        "Your MCP connectors (Notion, Supabase, etc.) traveling with you",
      benefit3: "AES-256 encryption — your data never travels in the clear",
      benefit4: "Access to Claude Code, Claude AI, and Cowork from one place",
      continueA:
        "If you'd like to stay, there's nothing to do — everything continues on ",
      continueB: ".",
      calloutTitle: "Changed your mind?",
      calloutBefore: "You can cancel before ",
      calloutAfter:
        " at no charge from your billing portal. Your access stays active until that date.",
      button: "Manage my subscription",
      questions:
        "If you have any questions — or feedback — just reply to this email. I read them myself.",
    },
  } as const;
  const t = COPY[lang];

  return (
    <EmailShell
      preheader={`${t.preheaderA}${planName}${t.preheaderB}${trialEndDate}${t.preheaderC}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>
        {t.h1Prefix}
        {planName}
      </H1>
      <P>
        {t.greetingPre}
        {firstName}
        {t.greetingPost}
      </P>
      <P>
        {t.introA}
        <strong>{planName}</strong>
        {t.introB}
        <strong>{trialEndDate}</strong>
        {t.introC}
      </P>

      <h2
        style={{
          marginTop: 28,
          marginBottom: 8,
          fontSize: 17,
          fontWeight: 600,
          color: COLORS.ink,
        }}
      >
        {t.benefitsHeading}
      </h2>
      <ul
        style={{
          paddingLeft: 22,
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <li style={{ marginBottom: 6 }}>{t.benefit1}</li>
        <li style={{ marginBottom: 6 }}>{t.benefit2}</li>
        <li style={{ marginBottom: 6 }}>{t.benefit3}</li>
        <li style={{ marginBottom: 6 }}>{t.benefit4}</li>
      </ul>

      <P>
        {t.continueA}
        {trialEndDate}
        {t.continueB}
      </P>

      <Callout variant="warn">
        <strong>{t.calloutTitle}</strong> {t.calloutBefore}
        {trialEndDate}
        {t.calloutAfter}
      </Callout>

      <PrimaryButton href={manageBillingUrl}>{t.button}</PrimaryButton>

      <P>{t.questions}</P>

      <Signoff />
    </EmailShell>
  );
}

export default TrialEndingEmail;
