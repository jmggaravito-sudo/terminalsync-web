import { emailFromLicenseToken, LICENSE_VERSION } from "@/lib/voiceStudioLicense";
import { voiceLicenseStatus } from "@/lib/voiceStudioConsent";
import { LicenseAcceptForm } from "@/components/voice-studio/LicenseAcceptForm";

// Bilingual voice-license signing page (EN + ES). Reached via a tokenized
// link minted for one lead's email; acceptance records identity, time, IP
// and UA, and is the hard gate before any voice clone is produced.
export const metadata = {
  title: "Voice Studio — Voice Clone License",
};

export default async function LicensePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const email = emailFromLicenseToken(t);

  if (!email) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Invalid or expired link
        </h1>
        <p className="mt-3 text-zinc-600">
          This license link is invalid or has expired (they last 14 days).
          Reply to your Voice Studio email and we&apos;ll send a fresh one.
        </p>
        <p className="mt-2 text-zinc-500">
          Este enlace de licencia es inválido o expiró (duran 14 días).
          Responde tu email de Voice Studio y te enviamos uno nuevo.
        </p>
      </main>
    );
  }

  const status = await voiceLicenseStatus(email.trim().toLowerCase()).catch(() => "unavailable" as const);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs tracking-wide text-zinc-400">
        VOICE STUDIO · VOICE CLONE LICENSE · {LICENSE_VERSION}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        Voice Clone License &amp; Written Consent
      </h1>
      <p className="mt-2 text-lg text-zinc-600">
        Licencia de clonación de voz y consentimiento escrito
      </p>

      <div className="mt-6 rounded-xl border border-amber-400/60 bg-amber-50 p-4 text-sm text-zinc-800">
        This license is prepared for <strong>{email}</strong> · Esta licencia
        está preparada para <strong>{email}</strong>
      </div>

      {/* ---------- English ---------- */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">English</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-700">
          <p>
            <strong>1. Grant.</strong> You authorize Voice Studio
            (&quot;Operator&quot;) to create a synthetic voice clone derived
            solely from recordings of your own voice, for the sole purpose of
            producing Spanish-language dubbed versions of videos you own,
            published to channels you own and control.
          </p>
          <p>
            <strong>2. Scope limits.</strong> The clone may NOT be used for any
            content you have not approved, third-party channels, political,
            adult or misleading content, or any use outside this agreement.
            Every video is tagged as AI-generated voice per YouTube&apos;s
            altered/synthetic media disclosure rules.
          </p>
          <p>
            <strong>3. Approval right.</strong> You approve a test clip before
            production of any full video. You may reject the clone quality and
            terminate with no further obligation.
          </p>
          <p>
            <strong>4. Ownership.</strong> All dubbed videos, channels and
            revenue belong to you. Operator claims no ownership of content,
            channels, AdSense or sponsorships.
          </p>
          <p>
            <strong>5. Data handling.</strong> Reference audio and the voice
            model are stored locally on Operator&apos;s machine, are not shared
            with third parties, and are deleted within 30 days of a written
            termination request.
          </p>
          <p>
            <strong>6. Revocation.</strong> You may revoke this license with
            written notice. Revocation stops all new production immediately;
            videos already published remain on your own channels (they are
            your property).
          </p>
          <p>
            <strong>7. No password access.</strong> Operator receives only a
            Manager/Editor invite to the designated Spanish channel. You never
            share passwords.
          </p>
        </div>
      </section>

      {/* ---------- Español ---------- */}
      <section className="mt-10 border-t border-zinc-200 pt-8">
        <h2 className="text-lg font-semibold text-zinc-900">Español</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-700">
          <p>
            <strong>1. Autorización.</strong> Usted autoriza a Voice Studio
            (&quot;Operador&quot;) a crear un clon sintético de voz derivado
            únicamente de grabaciones de su propia voz, con el único fin de
            producir versiones dobladas al español de videos de su propiedad,
            publicados en canales de su propiedad.
          </p>
          <p>
            <strong>2. Límites de alcance.</strong> El clon NO puede usarse
            para contenido no aprobado por usted, canales de terceros,
            contenido político, para adultos o engañoso, ni ningún uso fuera de
            este acuerdo. Cada video se marca como voz generada por IA según
            las reglas de disclosure de contenido alterado/sintético de
            YouTube.
          </p>
          <p>
            <strong>3. Derecho de aprobación.</strong> Usted aprueba un clip de
            prueba antes de producir cualquier video completo. Puede rechazar
            la calidad del clon y terminar sin ninguna obligación adicional.
          </p>
          <p>
            <strong>4. Propiedad.</strong> Todos los videos doblados, canales y
            revenue son suyos. El Operador no reclama propiedad sobre
            contenido, canales, AdSense ni patrocinios.
          </p>
          <p>
            <strong>5. Manejo de datos.</strong> El audio de referencia y el
            modelo de voz se almacenan localmente en la máquina del Operador,
            no se comparten con terceros, y se borran dentro de los 30 días de
            una solicitud escrita de terminación.
          </p>
          <p>
            <strong>6. Revocación.</strong> Usted puede revocar esta licencia
            con aviso escrito. La revocación detiene toda producción nueva; los
            videos ya publicados permanecen en sus propios canales (son
            propiedad suya).
          </p>
          <p>
            <strong>7. Sin acceso por contraseña.</strong> El Operador recibe
            solo una invitación como Manager/Editor al canal español
            designado. Usted nunca comparte contraseñas.
          </p>
        </div>
      </section>

      {/* ---------- Acceptance ---------- */}
      <section className="mt-10 border-t border-zinc-200 pt-8">
        {status === "pending" ? (
          <LicenseAcceptForm email={email} licenseVersion={LICENSE_VERSION} token={t ?? ""} />
        ) : (
          <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-700">
            <p role="status">{status === "signed" ? "This license is already signed. / Esta licencia ya está firmada."
              : status === "revoked" ? "This license was revoked. / Esta licencia fue revocada."
              : "Could not check the license. Please reload. / No pudimos consultar la licencia. Recarga la página."}</p>
            <a href="/voice-studio/orders" className="mt-2 inline-block font-semibold underline">Back to your dashboard / Volver al dashboard</a>
          </div>
        )}
        {status === "pending" && <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          By clicking accept, you sign this license electronically and consent
          to its terms. We record your email, the date/time, your IP address
          and browser, and the license version ({LICENSE_VERSION}). Al hacer
          clic en aceptar, firma esta licencia electrónicamente y acepta sus
          términos. Registramos su email, fecha/hora, dirección IP, navegador y
          la versión de la licencia.
        </p>}
      </section>
    </main>
  );
}
