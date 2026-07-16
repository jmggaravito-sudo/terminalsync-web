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
  lang: "es" | "en";
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

const COPY = {
  es: {
    preheader: (purgeAtHuman: string) =>
      `Tu cuenta de Terminal Sync se eliminará el ${purgeAtHuman}. Si no fuiste vos, ingresá para deshacerlo.`,
    heading: "Tu cuenta está marcada para eliminación",
    greeting: (firstName: string) => `¡Hola ${firstName}!`,
    intro1: "Recibimos tu pedido de eliminar tu cuenta de Terminal Sync. Tu cuenta y tu suscripción se mantienen activas durante ",
    intro30Days: "30 días",
    intro2: " en caso de que cambies de opinión.",
    calloutPurge: (purgeAtHuman: string) => `Se purga el ${purgeAtHuman}.`,
    calloutRest: " Después de esa fecha, eliminamos definitivamente tu perfil, tu suscripción y los registros asociados. No es reversible.",
    notYouStrong: "¿No fuiste vos?",
    notYouRest: " Ingresá a la app antes de esa fecha y vas a ver un banner para cancelar la eliminación con un click.",
    button: "Ingresar para deshacer",
    reasonPre: "Anotamos como motivo: “",
    reasonPost: "”. Gracias por decirnos.",
    filesNote: "Una nota sobre tus archivos: los archivos cifrados que sincronizaste a tu Google Drive son tuyos y no los tocamos. Solo borramos los registros del lado de Terminal Sync. Si querés borrarlos también, eliminá manualmente la carpeta ",
    filesNotePost: " de tu Drive.",
    bugNote: "Si esto vino de un bug o problema, respondé este correo — lo leo yo y quiero entender qué pasó.",
  },
  en: {
    preheader: (purgeAtHuman: string) =>
      `Your Terminal Sync account will be deleted on ${purgeAtHuman}. If this wasn't you, sign in to undo it.`,
    heading: "Your account is scheduled for deletion",
    greeting: (firstName: string) => `Hi ${firstName}!`,
    intro1: "We received your request to delete your Terminal Sync account. Your account and subscription stay active for ",
    intro30Days: "30 days",
    intro2: " in case you change your mind.",
    calloutPurge: (purgeAtHuman: string) => `Purged on ${purgeAtHuman}.`,
    calloutRest: " After that date, we permanently delete your profile, your subscription, and the associated records. This can't be undone.",
    notYouStrong: "Wasn't you?",
    notYouRest: " Sign in to the app before that date and you'll see a banner to cancel the deletion with one click.",
    button: "Sign in to undo",
    reasonPre: "We noted your reason: “",
    reasonPost: "”. Thanks for letting us know.",
    filesNote: "A note about your files: the encrypted files you synced to your Google Drive are yours and we don't touch them. We only delete the records on the Terminal Sync side. If you want to delete them too, manually remove the ",
    filesNotePost: " folder from your Drive.",
    bugNote: "If this came from a bug or a problem, just reply to this email — I read it myself and I want to understand what happened.",
  },
} as const;

export function AccountDeletionRequestedEmail({
  lang,
  firstName,
  purgeAtHuman,
  signInUrl,
  reason,
  unsubscribeUrl,
}: Props) {
  const t = COPY[lang];
  return (
    <EmailShell
      preheader={t.preheader(purgeAtHuman)}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>{t.heading}</H1>
      <P>{t.greeting(firstName)}</P>
      <P>
        {t.intro1}
        <strong>{t.intro30Days}</strong>
        {t.intro2}
      </P>

      <Callout variant="warn">
        <strong>{t.calloutPurge(purgeAtHuman)}</strong>
        {t.calloutRest}
      </Callout>

      <P>
        <strong>{t.notYouStrong}</strong>
        {t.notYouRest}
      </P>

      <PrimaryButton href={signInUrl}>
        {t.button}
      </PrimaryButton>

      {reason && (
        <P>
          <em>
            {t.reasonPre}
            {reason}
            {t.reasonPost}
          </em>
        </P>
      )}

      <P>
        {t.filesNote}
        <code>TerminalSync_Data/</code>
        {t.filesNotePost}
      </P>

      <P>{t.bugNote}</P>

      <Signoff />
    </EmailShell>
  );
}

export default AccountDeletionRequestedEmail;
