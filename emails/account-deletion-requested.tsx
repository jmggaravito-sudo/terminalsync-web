// Sent when the user clicks "Eliminar cuenta" in the desktop app and the
// DELETE /api/account endpoint marks the profile for soft-delete. Goal:
// reassure them the action was recorded, give them an obvious path to
// undo if it wasn't them, and confirm the timeline.

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
  /** ISO-8601 date string when the account will be permanently purged. */
  purgeAtIso: string;
  /** Locale-formatted date for human display (caller pre-formats). */
  purgeAtHuman: string;
  /** Sign-in URL — to undo, the user just signs back in and clicks the
   *  in-app "Recuperar cuenta" banner. We don't expose a magic-link undo
   *  here to avoid building a separate token-signing flow. */
  signInUrl: string;
  /** Optional reason captured in the deletion form. */
  reason?: string;
  unsubscribeUrl: string;
}

export function AccountDeletionRequestedEmail({
  firstName,
  purgeAtHuman,
  signInUrl,
  reason,
  unsubscribeUrl,
}: Props) {
  return (
    <EmailShell
      preheader={`Tu cuenta de Terminal Sync se eliminará el ${purgeAtHuman}. Si no fuiste vos, ingresá para deshacerlo.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>Tu cuenta está marcada para eliminación</H1>
      <P>¡Hola {firstName}!</P>
      <P>
        Recibimos tu pedido de eliminar tu cuenta de Terminal Sync. Tu cuenta
        y tu suscripción se mantienen activas durante <strong>30 días</strong>{" "}
        en caso de que cambies de opinión.
      </P>

      <Callout variant="warn">
        <strong>Se purga el {purgeAtHuman}.</strong> Después de esa fecha,
        eliminamos definitivamente tu perfil, tu suscripción y los registros
        asociados. No es reversible.
      </Callout>

      <P>
        <strong>¿No fuiste vos?</strong> Ingresá a la app antes de esa fecha
        y vas a ver un banner para cancelar la eliminación con un click.
      </P>

      <PrimaryButton href={signInUrl}>
        Ingresar para deshacer
      </PrimaryButton>

      {reason && (
        <P>
          <em>
            Anotamos como motivo: &ldquo;{reason}&rdquo;. Gracias por
            decirnos.
          </em>
        </P>
      )}

      <P>
        Una nota sobre tus archivos: los archivos cifrados que sincronizaste
        a tu Google Drive son tuyos y no los tocamos. Solo borramos los
        registros del lado de Terminal Sync. Si querés borrarlos también,
        eliminá manualmente la carpeta <code>TerminalSync_Data/</code> de
        tu Drive.
      </P>

      <P>
        Si esto vino de un bug o problema, respondé este correo — lo leo
        yo y quiero entender qué pasó.
      </P>

      <Signoff />
    </EmailShell>
  );
}

export default AccountDeletionRequestedEmail;
