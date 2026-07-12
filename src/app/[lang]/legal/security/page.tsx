import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title =
    lang === "es"
      ? "Seguridad — TerminalSync"
      : "Security — TerminalSync";
  const description =
    lang === "es"
      ? "Cómo TerminalSync protege tus datos: secretos y conversaciones cifrados con AES-256-GCM, archivos en tu propia nube, y disclosure responsable."
      : "How TerminalSync protects your data: secrets and conversations encrypted with AES-256-GCM, files in your own cloud, and responsible disclosure.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/legal/security`,
      languages: {
        es: "https://terminalsync.ai/es/legal/security",
        en: "https://terminalsync.ai/en/legal/security",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function SecurityPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  if (lang === "es") {
    return (
      <LegalShell
        lang="es"
        title="Seguridad"
        subtitle="Cómo protegemos los datos que sincronizás con TerminalSync, qué arquitectura usamos, y cómo reportar vulnerabilidades."
        lastUpdated="Última actualización: 4 de mayo de 2026"
      >
        <h2>1. Qué se cifra y qué no</h2>
        <p>
          TerminalSync está diseñado para que <strong>nosotros nunca podamos
          acceder a tu contenido</strong>: nada de lo que sincronizás pasa por
          nuestros servidores. Además, lo sensible — secretos, credenciales,
          memoria y conversaciones de IA — se cifra localmente en tu Mac antes
          de salir. Tus archivos de proyecto se guardan en tu propia nube en su
          formato original (así podés abrirlos desde Drive), bajo el control
          exclusivo de tu cuenta.
        </p>
        <ul>
          <li>
            <strong>Algoritmo</strong>: AES-256-GCM (Galois/Counter Mode), un
            cifrado autenticado simétrico estándar de la industria. Nonce de
            96 bits aleatorio por archivo.
          </li>
          <li>
            <strong>Llave maestra</strong>: 256 bits, generada localmente la
            primera vez que abrís la app. Se guarda en tu Mac como archivo
            protegido por permisos del sistema (solo tu usuario puede leerlo)
            y envuelta con tu frase secreta. Nunca sale de tus dispositivos
            sin cifrar.
          </li>
          <li>
            <strong>Passphrase opcional</strong>: la llave maestra puede ir
            envuelta con una passphrase tuya usando Argon2id (m=19MiB, t=2,
            p=1). Sin passphrase no hay desbloqueo posible.
          </li>
        </ul>

        <h2>2. Tu nube, no la nuestra</h2>
        <p>
          Tus archivos viajan directo al proveedor de almacenamiento que vos
          elegís: Google Drive, iCloud Drive, o Dropbox. <strong>TerminalSync
          no opera servidores de almacenamiento.</strong> El contenido nunca
          pasa por nuestra infraestructura.
        </p>
        <p>
          Si querés cambiar de proveedor, simplemente lo configurás en la app
          — todo se re-sube al nuevo destino.
        </p>

        <h2>3. Vault de secretos</h2>
        <p>
          Las API keys, credenciales y secretos sensibles que vivan en archivos
          <code>.env</code> dentro de carpetas sincronizadas pueden ser
          marcadas como vault, y se cifran con una capa adicional independiente
          de la llave maestra. Lock/unlock por carpeta con un click.
        </p>

        <h2>4. API keys de terceros (Claude, OpenAI)</h2>
        <p>
          Si conectás Claude Code o Codex, las API keys se almacenan en el
          Keychain del sistema, NUNCA en disco plano ni en archivos JSON. La
          configuración usa <code>apiKeyHelper</code> que las lee on-demand
          al momento de la llamada.
        </p>

        <h2>5. Transporte</h2>
        <p>
          Toda comunicación con nuestros servicios usa TLS 1.3. HSTS preload
          activo (<code>max-age=63072000; includeSubDomains; preload</code>).
          Sin downgrades, sin tráfico claro.
        </p>

        <h2>6. Headers HTTP</h2>
        <p>El sitio implementa los siguientes headers defensivos:</p>
        <ul>
          <li>Content-Security-Policy estricto (origen propio + dominios autorizados explícitamente)</li>
          <li>Referrer-Policy: <code>strict-origin-when-cross-origin</code></li>
          <li>Permissions-Policy: cámara, micrófono, geolocalización deshabilitadas</li>
          <li>X-Frame-Options: <code>DENY</code></li>
          <li>X-Content-Type-Options: <code>nosniff</code></li>
          <li>Strict-Transport-Security con preload</li>
        </ul>

        <h2>7. Reporte de vulnerabilidades</h2>
        <p>
          Si encontraste una vulnerabilidad, escribinos a{" "}
          <a href="mailto:security@terminalsync.ai">security@terminalsync.ai</a>{" "}
          con los detalles. Te respondemos dentro de 48 horas hábiles.
        </p>
        <p>
          Pedimos disclosure responsable: dame ≥90 días para parchear antes
          de hacer público el detalle. Acreditamos a researchers en el
          security advisory.
        </p>

        <h2>8. Transparencia</h2>
        <p>
          Esta página describe lo que la app hace hoy, no promesas a futuro.
          Cuando el alcance del cifrado cambie (por ejemplo, si sumamos capas
          de cifrado adicionales), actualizamos esta página y avisamos en el
          changelog.
        </p>

        <h2>9. Contacto</h2>
        <p>
          Para temas de seguridad:{" "}
          <a href="mailto:security@terminalsync.ai">security@terminalsync.ai</a>.
          PGP key disponible bajo solicitud.
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      lang="en"
      title="Security"
      subtitle="How we protect the data you sync with TerminalSync, what architecture we use, and how to report vulnerabilities."
      lastUpdated="Last updated: May 4, 2026"
    >
      <h2>1. What is encrypted and what isn't</h2>
      <p>
        TerminalSync is designed so that <strong>we can never access your
        content</strong>: nothing you sync passes through our servers. On top
        of that, the sensitive parts — secrets, credentials, memory and AI
        conversations — are encrypted locally on your Mac before leaving.
        Your project files are stored in your own cloud in their original
        format (so you can open them from Drive), under the exclusive control
        of your account.
      </p>
      <ul>
        <li>
          <strong>Algorithm</strong>: AES-256-GCM (Galois/Counter Mode), a
          standard authenticated symmetric cipher. Random 96-bit nonce per
          file.
        </li>
        <li>
          <strong>Master key</strong>: 256-bit, generated locally the first
          time you open the app. Stored on your Mac as a file protected by
          system permissions (only your user can read it) and wrapped with
          your secret phrase. It never leaves your devices unencrypted.
        </li>
        <li>
          <strong>Optional passphrase</strong>: the master key can be wrapped
          with your passphrase using Argon2id (m=19MiB, t=2, p=1). Without
          the passphrase, there is no unlock path.
        </li>
      </ul>

      <h2>2. Your cloud, not ours</h2>
      <p>
        Your files travel straight to the storage provider you pick: Google
        Drive, iCloud Drive, or Dropbox. <strong>TerminalSync does not operate
        storage servers.</strong> Content never passes through our
        infrastructure.
      </p>
      <p>
        If you want to switch providers, just configure it in the app —
        everything is re-uploaded to the new destination.
      </p>

      <h2>3. Secrets vault</h2>
      <p>
        API keys, credentials, and sensitive secrets that live in <code>.env</code>{" "}
        files within synced folders can be marked as vault and get an
        additional encryption layer independent of the master key. Per-folder
        lock/unlock with one click.
      </p>

      <h2>4. Third-party API keys (Claude, OpenAI)</h2>
      <p>
        When you connect Claude Code or Codex, the API keys are stored in
        the OS Keychain, NEVER on plain disk or in JSON files. The
        configuration uses <code>apiKeyHelper</code> which reads them
        on-demand at call time.
      </p>

      <h2>5. Transport</h2>
      <p>
        All communication with our services uses TLS 1.3. HSTS preload active
        (<code>max-age=63072000; includeSubDomains; preload</code>). No
        downgrades, no cleartext.
      </p>

      <h2>6. HTTP headers</h2>
      <p>The site implements the following defensive headers:</p>
      <ul>
        <li>Strict Content-Security-Policy (own origin + explicitly allowed domains)</li>
        <li>Referrer-Policy: <code>strict-origin-when-cross-origin</code></li>
        <li>Permissions-Policy: camera, microphone, geolocation disabled</li>
        <li>X-Frame-Options: <code>DENY</code></li>
        <li>X-Content-Type-Options: <code>nosniff</code></li>
        <li>Strict-Transport-Security with preload</li>
      </ul>

      <h2>7. Vulnerability reporting</h2>
      <p>
        If you've found a vulnerability, email{" "}
        <a href="mailto:security@terminalsync.ai">security@terminalsync.ai</a>{" "}
        with details. We reply within 48 business hours.
      </p>
      <p>
        We ask for responsible disclosure: give us ≥90 days to patch before
        making the detail public. Researchers are credited in the security
        advisory.
      </p>

      <h2>8. Transparency</h2>
      <p>
        This page describes what the app does today, not future promises.
        When the scope of encryption changes (for example, if we add further
        encryption layers), we update this page and note it in the changelog.
      </p>

      <h2>9. Contact</h2>
      <p>
        For security matters:{" "}
        <a href="mailto:security@terminalsync.ai">security@terminalsync.ai</a>.
        PGP key available upon request.
      </p>
    </LegalShell>
  );
}
