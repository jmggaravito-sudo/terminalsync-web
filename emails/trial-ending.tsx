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
}

export function TrialEndingEmail({
  firstName,
  planName,
  trialEndDate,
  manageBillingUrl,
  unsubscribeUrl,
}: Props) {
  return (
    <EmailShell
      preheader={`Tu prueba de ${planName} termina el ${trialEndDate}. Esto es lo que mantenés.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>⏰ Quedan 3 días de tu prueba {planName}</H1>
      <P>¡Hola {firstName}!</P>
      <P>
        Tu prueba de Terminal Sync <strong>{planName}</strong> termina el{" "}
        <strong>{trialEndDate}</strong>. A partir de ahí, tu tarjeta se cobra
        automáticamente y mantenés todo lo que estás usando ahora.
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
        Lo que seguís teniendo
      </h2>
      <ul
        style={{
          paddingLeft: 22,
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <li style={{ marginBottom: 6 }}>
          Tus terminales sincronizadas entre todas tus computadoras
        </li>
        <li style={{ marginBottom: 6 }}>
          Tus connectors MCP (Notion, Supabase, etc.) viajando con vos
        </li>
        <li style={{ marginBottom: 6 }}>
          Cifrado AES-256 — tu data nunca viaja en claro
        </li>
        <li style={{ marginBottom: 6 }}>
          Acceso a Claude Code, Claude AI y Cowork desde un solo lugar
        </li>
      </ul>

      <P>
        Si querés seguir, no tenés que hacer nada — todo continúa el día{" "}
        {trialEndDate}.
      </P>

      <Callout variant="warn">
        <strong>¿Cambiaste de opinión?</strong> Podés cancelar antes del{" "}
        {trialEndDate} sin cargo desde tu portal de facturación. Tu acceso
        sigue activo hasta esa fecha.
      </Callout>

      <PrimaryButton href={manageBillingUrl}>
        Administrar mi suscripción
      </PrimaryButton>

      <P>
        Si tenés alguna duda — o feedback — respondé este correo. Lo leo yo
        directamente.
      </P>

      <Signoff />
    </EmailShell>
  );
}

export default TrialEndingEmail;
