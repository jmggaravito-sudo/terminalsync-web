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
}

export function CancellationConfirmedEmail({
  firstName,
  planName,
  manageBillingUrl,
  reason,
  unsubscribeUrl,
}: Props) {
  return (
    <EmailShell
      preheader={`Cancelaste tu plan ${planName}. Tus datos se mantienen — podés volver cuando quieras.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>👋 Cancelación confirmada</H1>
      <P>¡Hola {firstName}!</P>
      <P>
        Confirmado: cancelaste tu plan Terminal Sync <strong>{planName}</strong>.
        Pasaste a Free a partir de ahora — sin más cargos.
      </P>

      <Callout variant="ok">
        <strong>Tus terminales y connectors se mantienen.</strong> No
        borramos nada. Solo se aplican los límites del plan Free (1 terminal
        activa). Si un día querés crear más, te avisamos cuando lo intentes.
      </Callout>

      <P>
        Tus archivos, los MCP servers que configuraste, las contraseñas
        cifradas — todo sigue donde estaba. Tu cuenta sigue funcionando para
        siempre con plan Free.
      </P>

      {reason && (
        <P>
          <em>
            Anotamos como motivo: &ldquo;{reason}&rdquo;. Gracias por
            decirnos.
          </em>
        </P>
      )}

      <P>
        Si la cancelación fue por un bug o algo no funcionaba como esperabas,
        respondé este correo. Lo leo yo. Quiero entender qué pasó.
      </P>

      <PrimaryButton href={manageBillingUrl}>
        Reactivar mi plan o ver facturas
      </PrimaryButton>

      <Signoff />
    </EmailShell>
  );
}

export default CancellationConfirmedEmail;
