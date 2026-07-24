import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";

interface Props {
  params: Promise<{ lang: string }>;
}

// Chrome Web Store rejection "Purple Nickel" (2026-07-17) required
// updating this policy to cover the v0.2 hosted-trial mode. Previously
// the page only described the BYOK-only v0.1 flow — it did not mention
// the terminalsync.ai host permission or what our proxy sees per request.
//
// Source-of-truth mirror: /Users/jm/projects/terminalsync-chrome/docs/privacy-policy.md
// If one changes, the other MUST change too. Chrome Web Store reviewers
// cross-check listed permissions against the disclosed data usage — a
// permission in the manifest that isn't disclosed here is an auto-reject.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title =
    lang === "es"
      ? "Privacidad — Extensión Chrome — TerminalSync"
      : "Privacy — Chrome Extension — TerminalSync";
  const description =
    lang === "es"
      ? "Cómo la extensión Chrome de Terminal Sync trata tus datos: modo hosted (proxy metadata-only, cero contenido) o BYOK (directo al provider, sin nuestro servidor)."
      : "How the Terminal Sync Chrome extension handles your data: hosted mode (metadata-only proxy, zero content) or BYOK (direct to provider, no server in between).";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/legal/extension-privacy`,
      languages: {
        es: "https://terminalsync.ai/es/legal/extension-privacy",
        en: "https://terminalsync.ai/en/legal/extension-privacy",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function ExtensionPrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  if (lang === "es") {
    return (
      <LegalShell
        lang="es"
        title="Política de Privacidad — Extensión Chrome"
        subtitle="Cómo la extensión Chrome de Terminal Sync trata tu información. Dos modos: hosted trial y BYOK."
        lastUpdated="Última actualización: 17 de julio de 2026"
      >
        <h2>Resumen rápido (TL;DR)</h2>
        <p>
          La Extensión tiene <strong>dos modos</strong> que podés cambiar en la página de Opciones:
        </p>
        <ul>
          <li>
            <strong>Modo Hosted trial</strong> (default los primeros 7 días) — tus prompts pasan por
            nuestro proxy en <code>terminalsync.ai</code> para que podamos ruteallos con nuestras
            propias API keys. Vemos <em>metadata</em> del prompt (timestamp, provider, model, contador
            de prompts, UUID de instalación) para el bookkeeping del trial. <strong>NO logueamos ni
            el contenido de los prompts ni las respuestas</strong>, y <strong>NO los usamos para
            entrenar ningún modelo</strong>.
          </li>
          <li>
            <strong>Modo BYOK</strong> (forever-free después del trial, o en cualquier momento cambiando
            en Opciones) — cada request va directo desde tu navegador a Anthropic / OpenAI / Google con
            <strong> tus propias API keys</strong>. Nosotros <strong>no estamos involucrados</strong>
            en esos requests: no vemos ni logueamos nada.
          </li>
        </ul>
        <p>
          <strong>No recolectamos analytics de ningún tipo.</strong> <strong>No leemos</strong> las
          páginas web que visitás. Todos tus settings y el historial de conversación se guardan
          <strong> localmente</strong> en <code>chrome.storage.local</code> de este dispositivo solamente.
        </p>

        <h2>Qué hace la extensión</h2>
        <p>
          La extensión te permite mandarle el mismo prompt a Claude (Anthropic), Codex / GPT (OpenAI)
          y Gemini (Google) en paralelo y ver las tres respuestas lado a lado.
        </p>

        <h2>Modos en detalle</h2>

        <h3>Modo Hosted trial</h3>
        <p>
          Durante los primeros 7 días después de instalar (e ilimitado si upgradés a Terminal Sync Pro),
          la extensión rutea cada prompt vía{" "}
          <code>https://terminalsync.ai/api/extension/chat</code>. Nosotros después reenviamos ese
          request al AI provider usando nuestras propias API keys.
        </p>
        <p>
          <strong>Qué ve nuestro proxy en cada request:</strong>
        </p>
        <ul>
          <li>Tu <strong>UUID de instalación</strong> (un ID random que generamos cuando abrís el popup por primera vez; no está atado a ninguna cuenta de Google ni email)</li>
          <li>El <strong>nombre del provider</strong> ("anthropic" | "openai" | "gemini")</li>
          <li>El <strong>nombre del modelo</strong> (ej. "claude-3-5-sonnet-latest")</li>
          <li>El <strong>prompt y la historia de conversación</strong> que enviaste (los recibimos para poder reenviarlos — ver retention abajo)</li>
          <li>Tu <strong>dirección IP</strong> (la recibe Vercel automáticamente para routing; se registra una sola vez en el primer request como soft-fingerprint para limitar abuso de reset del trial)</li>
          <li>El header <strong>User-Agent</strong> que manda tu browser</li>
        </ul>
        <p>
          <strong>Qué guarda nuestro proxy después de cada request:</strong>
        </p>
        <ul>
          <li>El UUID de instalación</li>
          <li>Contadores: prompts usados hoy, prompts usados en total</li>
          <li>Timestamp de inicio y expiración del trial</li>
          <li>La IP + User-Agent vistos por primera vez (una fila por UUID, nunca se actualiza)</li>
          <li>Si upgradeaste a Pro (boolean, se activa después del flow del código de linking)</li>
        </ul>
        <p>
          <strong>Qué NO guarda nuestro proxy:</strong>
        </p>
        <ul>
          <li>El <strong>texto de tus prompts</strong></li>
          <li>El <strong>texto de las respuestas de la IA</strong></li>
          <li>Token counts de requests individuales (solo counters agregados)</li>
          <li>Ningún historial de navegación</li>
        </ul>
        <p>
          Deliberadamente <strong>no logueamos</strong> el contenido de prompts ni respuestas. Nuestro
          pipeline de logging nunca recibe el body del request — el body se reenvía byte-por-byte al
          provider, y la respuesta streaming se pipea byte-por-byte de vuelta al navegador. Lo único
          que miramos del request es la metadata listada arriba.
        </p>

        <h3>Modo BYOK</h3>
        <p>
          Cuando cambiás el modo a BYOK en Opciones (o cuando expira el trial), cada request va
          directo desde tu navegador al provider:
        </p>
        <ol>
          <li><strong>Anthropic</strong> (<code>https://api.anthropic.com/v1/messages</code>) — con tu API key de Anthropic, el modelo elegido y la historia de conversación.</li>
          <li><strong>OpenAI</strong> (<code>https://api.openai.com/v1/chat/completions</code>) — con tu API key de OpenAI, el modelo elegido y la historia.</li>
          <li><strong>Google Gemini</strong> (<code>https://generativelanguage.googleapis.com/v1beta/models/&lt;model&gt;:streamGenerateContent</code>) — con tu API key de Google (como query parameter), el modelo elegido y la historia.</li>
        </ol>
        <p>
          En modo BYOK nuestro proxy <strong>NO</strong> está involucrado. No vemos, logueamos ni
          modificamos estos requests. La extensión es un wrapper puramente client-side.
        </p>
        <p>La privacy policy de cada provider gobierna qué hacen ellos con lo que mandás:</p>
        <ul>
          <li>Anthropic: <a href="https://www.anthropic.com/legal/privacy">anthropic.com/legal/privacy</a></li>
          <li>OpenAI: <a href="https://openai.com/policies/privacy-policy">openai.com/policies/privacy-policy</a></li>
          <li>Google: <a href="https://policies.google.com/privacy">policies.google.com/privacy</a></li>
        </ul>

        <h2>Qué guardamos localmente en tu Chrome</h2>
        <table>
          <thead>
            <tr>
              <th>Dato</th>
              <th>Dónde</th>
              <th>Por qué</th>
              <th>Quién puede acceder</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>UUID de instalación</td>
              <td><code>chrome.storage.local</code> en este perfil de Chrome</td>
              <td>Contador del trial en nuestro server</td>
              <td>Solo vos, en este dispositivo + nuestro server (en requests de modo hosted)</td>
            </tr>
            <tr>
              <td>Modo de uso (hosted / BYOK)</td>
              <td><code>chrome.storage.local</code></td>
              <td>Recordar qué modo elegiste</td>
              <td>Solo vos, en este dispositivo</td>
            </tr>
            <tr>
              <td>Tus 3 API keys (Anthropic, OpenAI, Google)</td>
              <td><code>chrome.storage.local</code></td>
              <td>Autenticar requests BYOK</td>
              <td>Solo vos, en este dispositivo</td>
            </tr>
            <tr>
              <td>Modelo elegido por proveedor</td>
              <td><code>chrome.storage.local</code></td>
              <td>Recordar tu preferencia (Sonnet vs Haiku, etc.)</td>
              <td>Solo vos, en este dispositivo</td>
            </tr>
            <tr>
              <td>Cache del status del trial</td>
              <td><code>chrome.storage.local</code></td>
              <td>Renderear el banner antes que el próximo <code>/chat</code> lo actualice</td>
              <td>Solo vos, en este dispositivo</td>
            </tr>
            <tr>
              <td>Historial de conversación (últimos 40 turnos)</td>
              <td><code>chrome.storage.local</code></td>
              <td>Restaurar el chat cuando reabrís el popup</td>
              <td>Solo vos, en este dispositivo</td>
            </tr>
          </tbody>
        </table>
        <p>
          Usamos deliberadamente <code>chrome.storage.local</code>, <strong>no</strong>{" "}
          <code>chrome.storage.sync</code>, para que nada de estos datos salga de tu dispositivo
          via tu cuenta de Google.
        </p>

        <h2>Qué NO hacemos (los dos modos)</h2>
        <ul>
          <li>No recolectamos telemetry, analytics ni crash reports.</li>
          <li>No incluimos trackers de terceros, SDKs publicitarios ni librerías de fingerprinting.</li>
          <li>No leemos el contenido de ninguna página web que visitás.</li>
          <li>No usamos tus prompts ni respuestas para entrenar ningún modelo.</li>
          <li>No vendemos ni transferimos tus datos a terceros más allá de: en modo hosted, el AI provider al que invocaste; en modo BYOK, ese mismo provider directamente.</li>
        </ul>

        <h2>Permisos explicados</h2>
        <p>La extensión pide dos categorías de permisos en Chrome:</p>
        <ul>
          <li><strong><code>storage</code></strong> — para guardar tus settings y conversación local (ver tabla arriba).</li>
          <li>
            <strong>Host permissions</strong> para <code>api.anthropic.com</code>,{" "}
            <code>api.openai.com</code>, <code>generativelanguage.googleapis.com</code>{" "}
            y <code>terminalsync.ai</code> — para enviar tus prompts. Los primeros tres se usan
            en modo BYOK; <code>terminalsync.ai</code> se usa en modo hosted y para el flow del
            código de linking Pro. Son los <strong>únicos</strong> dominios que la extensión
            puede contactar.
          </li>
        </ul>
        <p>
          La extensión <strong>NO</strong> pide <code>tabs</code>, <code>activeTab</code>,{" "}
          <code>&lt;all_urls&gt;</code> ni ningún otro permiso amplio.
        </p>

        <h2>Códigos de linking Pro</h2>
        <p>
          Si upgradés a Terminal Sync Pro vía <code>terminalsync.ai</code>, la página de éxito muestra
          un código de 6 dígitos one-shot que podés pegar en Opciones → "Ya pagué Pro" para hacer
          flip a esta instalación de la extensión a Pro (modo hosted, ilimitado). El código en sí es
          <strong> anónimo</strong> (no lleva email ni info de cuenta) y expira en 24 horas. Los
          códigos nunca se guardan en <code>chrome.storage</code>.
        </p>

        <h2>Cómo borrar tus datos</h2>
        <p>Para borrar todo lo que la extensión guardó en tu dispositivo:</p>
        <ol>
          <li>Abrí <code>chrome://extensions</code></li>
          <li>Buscá <strong>Terminal Sync — 3 IAs en paralelo</strong></li>
          <li>Click en <strong>Quitar</strong></li>
        </ol>
        <p>
          Quitar la extensión borra toda la data de <code>chrome.storage.local</code> asociada a
          ella, incluyendo tus API keys, historial de conversación y UUID de instalación.
        </p>
        <p>
          Si usaste el modo hosted, la fila del <strong>server</strong> que trackea tu contador de
          trial (indexada por el UUID de instalación) va a quedar. Escribinos a{" "}
          <a href="mailto:jmggaravito@gmail.com">jmggaravito@gmail.com</a> con tu UUID de instalación
          (visible en Opciones → "Tu install UUID" — próximamente) y la borramos dentro de 30 días.
        </p>
        <p>
          También podés limpiar solo la conversación sin quitar la extensión tocando el botón
          "Nueva" en el popup.
        </p>

        <h2>Privacidad de menores</h2>
        <p>
          Esta extensión no está dirigida a menores de 13 años. No recolectamos información personal
          de nadie a sabiendas, incluyendo niños.
        </p>

        <h2>Cambios a esta política</h2>
        <p>
          Cambios materiales se reflejan en la fecha de "última actualización" arriba. La versión
          canónica siempre vive en esta URL.
        </p>

        <h2>Contacto</h2>
        <p>
          Preguntas sobre esta política:{" "}
          <a href="mailto:jmggaravito@gmail.com">jmggaravito@gmail.com</a> (Juan Manuel Garavito,
          sole maintainer).
        </p>
        <p>
          Código fuente:{" "}
          <a href="https://github.com/jmggaravito-sudo/terminalsync-chrome">
            github.com/jmggaravito-sudo/terminalsync-chrome
          </a>
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      lang="en"
      title="Privacy Policy — Chrome Extension"
      subtitle="How the Terminal Sync Chrome extension handles your information. Two modes: hosted trial and BYOK."
      lastUpdated="Last updated: July 17, 2026"
    >
      <h2>TL;DR</h2>
      <p>The Extension has <strong>two modes</strong> you can switch between in Options:</p>
      <ul>
        <li>
          <strong>Hosted trial mode</strong> (default for the first 7 days) — your prompts go through
          TerminalSync's proxy at <code>terminalsync.ai</code> so we can route them with our own API
          keys. We see prompt <em>metadata</em> (timestamp, provider, model, prompt count, your
          install UUID) to bookkeep the trial. We do <strong>not</strong> log prompt or response
          content and we do <strong>not</strong> use them to train any model.
        </li>
        <li>
          <strong>BYOK mode</strong> (forever-free after the trial, or anytime by toggling in
          Options) — every request goes directly from your browser to Anthropic / OpenAI / Google
          with <strong>your own API keys</strong>. We are not involved in those requests at all; we
          don't see or log anything.
        </li>
      </ul>
      <p>
        We <strong>do not collect analytics</strong> of any kind. We <strong>do not</strong> read
        web pages you visit. All your settings and conversation history are stored{" "}
        <strong>locally</strong> in <code>chrome.storage.local</code> on this device only.
      </p>

      <h2>What the Extension does</h2>
      <p>
        The Extension lets you send the same prompt to Claude (Anthropic), Codex / GPT (OpenAI),
        and Gemini (Google) in parallel and view the three responses side-by-side.
      </p>

      <h2>Modes in detail</h2>

      <h3>Hosted trial mode</h3>
      <p>
        For the first 7 days after install (and unlimited if you upgrade to Terminal Sync Pro), the
        Extension routes each prompt through{" "}
        <code>https://terminalsync.ai/api/extension/chat</code>. We then forward the request to the
        AI provider using our own API keys.
      </p>
      <p><strong>What our proxy sees on every request:</strong></p>
      <ul>
        <li>Your <strong>install UUID</strong> (a random ID we mint when you first open the popup; not tied to any Google account or email)</li>
        <li>The <strong>provider name</strong> ("anthropic" | "openai" | "gemini")</li>
        <li>The <strong>model name</strong> (e.g. "claude-3-5-sonnet-latest")</li>
        <li>The <strong>prompt and conversation history</strong> you submitted (we receive them so we can forward them — see below for retention)</li>
        <li>Your <strong>IP address</strong> (received automatically by Vercel for routing; recorded once on first request as a soft-fingerprint to bound trial-reset abuse)</li>
        <li>The User-Agent header your browser sends</li>
      </ul>
      <p><strong>What our proxy stores after each request:</strong></p>
      <ul>
        <li>The install UUID</li>
        <li>Counters: prompts used today, prompts used in total</li>
        <li>Trial start timestamp, trial expiry timestamp</li>
        <li>The first-seen IP and User-Agent (one row per UUID, never updated)</li>
        <li>Whether you upgraded to Pro (boolean, set after the link code flow)</li>
      </ul>
      <p><strong>What our proxy does NOT store:</strong></p>
      <ul>
        <li>The <strong>text of your prompts</strong></li>
        <li>The <strong>text of the AI responses</strong></li>
        <li>Token counts of individual requests (only aggregated counters)</li>
        <li>Any browsing history</li>
      </ul>
      <p>
        We deliberately do <strong>not</strong> log prompt or response content. Our logging pipeline
        never receives the request body — the body is forwarded byte-for-byte to the provider and
        the streaming response is piped byte-for-byte back to your browser. The only request data we
        look at is the metadata above.
      </p>

      <h3>BYOK mode</h3>
      <p>
        When you toggle the mode to BYOK in Options (or after your trial expires), every request
        goes directly from your browser to the provider:
      </p>
      <ol>
        <li><strong>Anthropic</strong> (<code>https://api.anthropic.com/v1/messages</code>) — sent with your Anthropic API key, the selected model, and the conversation history.</li>
        <li><strong>OpenAI</strong> (<code>https://api.openai.com/v1/chat/completions</code>) — sent with your OpenAI API key, the selected model, and the conversation history.</li>
        <li><strong>Google Gemini</strong> (<code>https://generativelanguage.googleapis.com/v1beta/models/&lt;model&gt;:streamGenerateContent</code>) — sent with your Google API key (as a query parameter), the selected model, and the conversation history.</li>
      </ol>
      <p>
        In BYOK mode our proxy is <strong>NOT</strong> involved. We do not see, log, or modify
        these requests. The Extension is a pure client-side wrapper.
      </p>
      <p>Each provider's own privacy policy governs what they do with the data you send them:</p>
      <ul>
        <li>Anthropic: <a href="https://www.anthropic.com/legal/privacy">anthropic.com/legal/privacy</a></li>
        <li>OpenAI: <a href="https://openai.com/policies/privacy-policy">openai.com/policies/privacy-policy</a></li>
        <li>Google: <a href="https://policies.google.com/privacy">policies.google.com/privacy</a></li>
      </ul>

      <h2>What we store, where, and why (local)</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Where</th>
            <th>Purpose</th>
            <th>Who can access</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Install UUID</td>
            <td><code>chrome.storage.local</code> on this browser profile</td>
            <td>Hosted trial counter on our server</td>
            <td>Only you, on this device + our server (for hosted requests)</td>
          </tr>
          <tr>
            <td>Use mode (hosted / BYOK)</td>
            <td><code>chrome.storage.local</code></td>
            <td>Remember which mode you chose</td>
            <td>Only you, on this device</td>
          </tr>
          <tr>
            <td>Your 3 API keys (Anthropic, OpenAI, Google)</td>
            <td><code>chrome.storage.local</code></td>
            <td>Authenticate BYOK requests</td>
            <td>Only you, on this device</td>
          </tr>
          <tr>
            <td>Selected model per provider</td>
            <td><code>chrome.storage.local</code></td>
            <td>Remember your choice (Sonnet vs Haiku, etc.)</td>
            <td>Only you, on this device</td>
          </tr>
          <tr>
            <td>Trial status cache</td>
            <td><code>chrome.storage.local</code></td>
            <td>Render the banner before the next /chat call updates it</td>
            <td>Only you, on this device</td>
          </tr>
          <tr>
            <td>Conversation history (last 40 turns)</td>
            <td><code>chrome.storage.local</code></td>
            <td>Restore the chat when you reopen the popup</td>
            <td>Only you, on this device</td>
          </tr>
        </tbody>
      </table>
      <p>
        We deliberately use <code>chrome.storage.local</code>, <strong>not</strong>{" "}
        <code>chrome.storage.sync</code>, so that none of this data leaves your device through your
        Google account.
      </p>

      <h2>What we do NOT do (both modes)</h2>
      <ul>
        <li>We do not collect telemetry, analytics, or crash reports.</li>
        <li>We do not include third-party trackers, advertising SDKs, or fingerprinting libraries.</li>
        <li>We do not read the contents of any web page you visit.</li>
        <li>We do not use your prompts or responses to train any model.</li>
        <li>We do not sell or transfer your data to third parties beyond: in hosted mode, the AI provider you invoked; in BYOK mode, that same provider directly.</li>
      </ul>

      <h2>Permissions explained</h2>
      <p>The Extension requests two Chrome permissions:</p>
      <ul>
        <li><strong><code>storage</code></strong> — to save your settings and conversation locally (see table above).</li>
        <li>
          <strong>Host permissions</strong> for <code>api.anthropic.com</code>,{" "}
          <code>api.openai.com</code>, <code>generativelanguage.googleapis.com</code>, and{" "}
          <code>terminalsync.ai</code> — to send your prompts. The first three are used in BYOK
          mode; <code>terminalsync.ai</code> is used in hosted mode and for the Pro link code flow.
          These are the <strong>only</strong> domains the Extension is allowed to contact.
        </li>
      </ul>
      <p>
        The Extension does <strong>not</strong> request <code>tabs</code>, <code>activeTab</code>,{" "}
        <code>&lt;all_urls&gt;</code>, or any other broad permission.
      </p>

      <h2>Pro link codes</h2>
      <p>
        If you upgrade to Terminal Sync Pro through <code>terminalsync.ai</code>, the success page
        displays a 6-digit one-shot code that you can paste in Options → "Already paid Pro" to flip
        this Extension install to Pro (hosted mode, unlimited). The code itself is{" "}
        <strong>anonymous</strong> (no email or account info encoded into it) and expires in 24
        hours. Codes are never stored in <code>chrome.storage</code>.
      </p>

      <h2>Removing your data</h2>
      <p>To delete everything the Extension stored on your device:</p>
      <ol>
        <li>Open <code>chrome://extensions</code></li>
        <li>Find <strong>Terminal Sync — 3 IAs en paralelo</strong></li>
        <li>Click <strong>Remove</strong></li>
      </ol>
      <p>
        Removing the Extension erases all <code>chrome.storage.local</code> data associated with
        it, including your API keys, conversation history, and install UUID.
      </p>
      <p>
        If you used hosted mode, the <strong>server-side</strong> row that tracks your trial
        counter (keyed by the install UUID) will remain. Email{" "}
        <a href="mailto:jmggaravito@gmail.com">jmggaravito@gmail.com</a> with your install UUID
        (visible under Options → "Your install UUID" — coming soon) and we will delete it within 30
        days.
      </p>
      <p>
        You can also clear just the conversation without removing the Extension by clicking the
        "Nueva" button in the popup.
      </p>

      <h2>Children's privacy</h2>
      <p>
        This Extension is not directed at children under 13. We do not knowingly collect any
        personal information from anyone, including children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        Material changes will be reflected in the "Last updated" date at the top. The canonical
        version always lives at this URL.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a href="mailto:jmggaravito@gmail.com">jmggaravito@gmail.com</a> (Juan Manuel Garavito, sole
        maintainer).
      </p>
      <p>
        Source code:{" "}
        <a href="https://github.com/jmggaravito-sudo/terminalsync-chrome">
          github.com/jmggaravito-sudo/terminalsync-chrome
        </a>
      </p>
    </LegalShell>
  );
}
