import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";

interface Props {
  params: Promise<{ lang: string }>;
}

// La Chrome Web Store exige un URL público de privacy policy distinto al
// de la app de escritorio (cada producto tiene su listing). Esta página
// existe para satisfacer ese requisito — el contenido es el del extension,
// no el del desktop.
// Source-of-truth: /Users/jm/projects/terminalsync-chrome/docs/privacy-policy.md
// Si cambia uno, hay que cambiar el otro.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title =
    lang === "es"
      ? "Privacidad — Extensión Chrome — TerminalSync"
      : "Privacy — Chrome Extension — TerminalSync";
  const description =
    lang === "es"
      ? "Cómo la extensión Chrome de Terminal Sync trata tus datos: BYOK, sin backend, sin analytics, keys locales en chrome.storage.local."
      : "How the Terminal Sync Chrome extension handles your data: BYOK, no backend, no analytics, keys local in chrome.storage.local.";
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
        subtitle="Cómo la extensión Chrome de Terminal Sync trata tu información. BYOK, sin backend, sin analytics."
        lastUpdated="Última actualización: 29 de mayo de 2026"
      >
        <h2>Resumen rápido</h2>
        <ul>
          <li>La Extensión usa <strong>tus propias API keys</strong> (BYOK) para Anthropic Claude, OpenAI y Google Gemini.</li>
          <li><strong>No tenemos backend</strong>. Cada request va directo desde tu navegador al provider que consultaste.</li>
          <li>Tus API keys, modelo elegido por proveedor y conversación se guardan <strong>localmente</strong> en <code>chrome.storage.local</code> de este Chrome. No syncan a tu cuenta de Google. No nos llegan. No van a terceros (salvo al provider de IA que vos invocás).</li>
          <li><strong>No usamos analytics</strong> de ningún tipo.</li>
          <li><strong>No vemos</strong>, logueamos ni tenemos acceso a tus prompts, las respuestas de la IA, o tus API keys.</li>
        </ul>

        <h2>Qué hace la extensión</h2>
        <p>
          La extensión te permite mandarle el mismo prompt a Claude (Anthropic),
          Codex / GPT (OpenAI) y Gemini (Google) en paralelo y ver las tres
          respuestas lado a lado.
        </p>

        <h2>Qué guardamos, dónde y por qué</h2>
        <table>
          <thead>
            <tr>
              <th>Dato</th>
              <th>Dónde</th>
              <th>Por qué</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tus 3 API keys (Anthropic, OpenAI, Google)</td>
              <td><code>chrome.storage.local</code> en este perfil de Chrome</td>
              <td>Autenticar requests a cada provider</td>
            </tr>
            <tr>
              <td>Modelo elegido por proveedor</td>
              <td><code>chrome.storage.local</code> en este perfil de Chrome</td>
              <td>Recordar tu preferencia (Sonnet vs Haiku, etc.)</td>
            </tr>
            <tr>
              <td>Historial de conversación (últimos 40 turnos)</td>
              <td><code>chrome.storage.local</code> en este perfil de Chrome</td>
              <td>Restaurar el chat cuando reabrís el popup</td>
            </tr>
          </tbody>
        </table>
        <p>
          Usamos deliberadamente <code>chrome.storage.local</code>, <strong>no</strong> <code>chrome.storage.sync</code>,
          para que nada de esto salga de tu dispositivo via tu cuenta de Google.
        </p>

        <h2>Qué enviamos, y a quién</h2>
        <p>Cuando tocás "Preguntar a las 3", la extensión hace tres requests HTTPS:</p>
        <ol>
          <li><strong>Anthropic</strong> (<code>https://api.anthropic.com/v1/messages</code>) — con tu API key de Anthropic, el modelo elegido y la historia.</li>
          <li><strong>OpenAI</strong> (<code>https://api.openai.com/v1/chat/completions</code>) — con tu API key de OpenAI, el modelo elegido y la historia.</li>
          <li><strong>Google Gemini</strong> (<code>https://generativelanguage.googleapis.com/v1beta/models/&lt;model&gt;:streamGenerateContent</code>) — con tu API key de Google (como query param), el modelo elegido y la historia.</li>
        </ol>
        <p>La privacy policy de cada provider gobierna qué hacen ellos con lo que mandás:</p>
        <ul>
          <li>Anthropic: <a href="https://www.anthropic.com/legal/privacy">anthropic.com/legal/privacy</a></li>
          <li>OpenAI: <a href="https://openai.com/policies/privacy-policy">openai.com/policies/privacy-policy</a></li>
          <li>Google: <a href="https://policies.google.com/privacy">policies.google.com/privacy</a></li>
        </ul>
        <p>
          Nosotros no vemos, logueamos ni modificamos estos requests. La
          extensión es un wrapper client-side.
        </p>

        <h2>Qué NO hacemos</h2>
        <ul>
          <li>No corremos un backend.</li>
          <li>No recolectamos telemetry, analytics ni crash reports.</li>
          <li>No incluimos trackers, SDKs publicitarios ni librerías de fingerprinting.</li>
          <li>No leemos el contenido de las páginas web que visitás.</li>
          <li>No usamos tu data para entrenar ningún modelo.</li>
        </ul>

        <h2>Permisos explicados</h2>
        <p>La extensión pide dos categorías de permisos en Chrome:</p>
        <ul>
          <li><strong><code>storage</code></strong> — para guardar tus API keys, preferencias y conversación local (ver tabla arriba).</li>
          <li><strong>Host permissions</strong> para <code>api.anthropic.com</code>, <code>api.openai.com</code> y <code>generativelanguage.googleapis.com</code> — para enviar tus prompts a los 3 providers. Son los <strong>únicos</strong> dominios que la extensión puede contactar.</li>
        </ul>
        <p>
          La extensión <strong>NO</strong> pide <code>tabs</code>, <code>activeTab</code>, <code>&lt;all_urls&gt;</code> ni ningún otro permiso amplio.
        </p>

        <h2>Cómo borrar tus datos</h2>
        <p>Para borrar todo lo que la extensión guardó en tu dispositivo:</p>
        <ol>
          <li>Abrí <code>chrome://extensions</code></li>
          <li>Buscá <strong>Terminal Sync — 3 IAs en paralelo</strong></li>
          <li>Click en <strong>Quitar</strong></li>
        </ol>
        <p>
          Quitar la extensión borra toda la data de <code>chrome.storage.local</code> asociada
          a ella, incluyendo tus API keys y la conversación. Las keys siguen
          existiendo con cada provider — para revocarlas, andá a la console de
          cada uno (links desde la página de Opciones de la extensión).
        </p>
        <p>
          También podés limpiar solo la conversación sin quitar la extensión
          tocando el botón "Nueva" en el popup.
        </p>

        <h2>Niños</h2>
        <p>
          Esta extensión no está dirigida a menores de 13 años. No recolectamos
          información personal de nadie a sabiendas, incluyendo niños.
        </p>

        <h2>Cambios a esta política</h2>
        <p>
          Cambios materiales se reflejan en la fecha de "última actualización"
          arriba. La versión vigente siempre vive en esta URL.
        </p>

        <h2>Contacto</h2>
        <p>
          Preguntas sobre esta política:{" "}
          <a href="mailto:jmggaravito@gmail.com">jmggaravito@gmail.com</a> (Juan
          Manuel Garavito, sole maintainer).
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
      subtitle="How the Terminal Sync Chrome extension handles your information. BYOK, no backend, no analytics."
      lastUpdated="Last updated: May 29, 2026"
    >
      <h2>TL;DR</h2>
      <ul>
        <li>The Extension uses <strong>your own API keys</strong> (BYOK) for Anthropic Claude, OpenAI, and Google Gemini.</li>
        <li>We <strong>do not operate a backend</strong>. Every request goes directly from your browser to the provider you queried.</li>
        <li>Your API keys, per-provider model choice, and conversation history are stored <strong>locally</strong> in <code>chrome.storage.local</code> on this device. They are <strong>not</strong> synced to your Google account, <strong>not</strong> sent to us, and <strong>not</strong> sent to any third party other than the AI provider you explicitly invoke.</li>
        <li>We <strong>do not collect analytics</strong> of any kind.</li>
        <li>We <strong>do not see</strong>, log, or have access to your prompts, the AI responses, or your API keys.</li>
      </ul>

      <h2>What the extension does</h2>
      <p>
        The Extension lets you send the same prompt to Claude (Anthropic), Codex
        / GPT (OpenAI), and Gemini (Google) in parallel and view the three
        responses side-by-side.
      </p>

      <h2>What we store, where, and why</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Where</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Your 3 API keys (Anthropic, OpenAI, Google)</td>
            <td><code>chrome.storage.local</code> on this browser profile</td>
            <td>Authenticate API requests to each provider</td>
          </tr>
          <tr>
            <td>Selected model per provider</td>
            <td><code>chrome.storage.local</code> on this browser profile</td>
            <td>Remember your choice (Sonnet vs Haiku, etc.)</td>
          </tr>
          <tr>
            <td>Conversation history (last 40 turns)</td>
            <td><code>chrome.storage.local</code> on this browser profile</td>
            <td>Restore the chat when you reopen the popup</td>
          </tr>
        </tbody>
      </table>
      <p>
        We deliberately use <code>chrome.storage.local</code>, <strong>not</strong> <code>chrome.storage.sync</code>,
        so that none of this data leaves your device through your Google account.
      </p>

      <h2>What we send, to whom</h2>
      <p>When you click "Preguntar a las 3", the extension makes three HTTPS requests:</p>
      <ol>
        <li><strong>Anthropic</strong> (<code>https://api.anthropic.com/v1/messages</code>) — sent with your Anthropic API key, the selected model, and the conversation history.</li>
        <li><strong>OpenAI</strong> (<code>https://api.openai.com/v1/chat/completions</code>) — sent with your OpenAI API key, the selected model, and the conversation history.</li>
        <li><strong>Google Gemini</strong> (<code>https://generativelanguage.googleapis.com/v1beta/models/&lt;model&gt;:streamGenerateContent</code>) — sent with your Google API key (as a query param), the selected model, and the conversation history.</li>
      </ol>
      <p>Each provider's own privacy policy governs what they do with the data you send them:</p>
      <ul>
        <li>Anthropic: <a href="https://www.anthropic.com/legal/privacy">anthropic.com/legal/privacy</a></li>
        <li>OpenAI: <a href="https://openai.com/policies/privacy-policy">openai.com/policies/privacy-policy</a></li>
        <li>Google: <a href="https://policies.google.com/privacy">policies.google.com/privacy</a></li>
      </ul>
      <p>
        We do not see, log, or modify these requests. The Extension is a
        client-side wrapper.
      </p>

      <h2>What we do NOT do</h2>
      <ul>
        <li>We do not run a backend server.</li>
        <li>We do not collect telemetry, analytics, or crash reports.</li>
        <li>We do not include third-party trackers, advertising SDKs, or fingerprinting libraries.</li>
        <li>We do not read the contents of any web page you visit.</li>
        <li>We do not use your data to train any model.</li>
      </ul>

      <h2>Permissions explained</h2>
      <p>The Extension requests two Chrome permissions:</p>
      <ul>
        <li><strong><code>storage</code></strong> — to save your API keys, model preferences, and conversation locally (see table above).</li>
        <li><strong>Host permissions</strong> for <code>api.anthropic.com</code>, <code>api.openai.com</code>, and <code>generativelanguage.googleapis.com</code> — to send your prompts to the three AI providers. These are the <strong>only</strong> domains the Extension is allowed to contact.</li>
      </ul>
      <p>
        The Extension does <strong>not</strong> request <code>tabs</code>, <code>activeTab</code>, <code>&lt;all_urls&gt;</code>, or any other broad permission.
      </p>

      <h2>Removing your data</h2>
      <p>To delete everything the Extension stored on your device:</p>
      <ol>
        <li>Open <code>chrome://extensions</code></li>
        <li>Find <strong>Terminal Sync — 3 IAs en paralelo</strong></li>
        <li>Click <strong>Remove</strong></li>
      </ol>
      <p>
        Removing the Extension erases all <code>chrome.storage.local</code> data associated
        with it, including your API keys and conversation history. The keys
        themselves continue to exist with each provider — to revoke them, go to
        each provider's console (linked from the Extension's Options page).
      </p>
      <p>
        You can also clear just the conversation without removing the Extension
        by clicking the "Nueva" button in the popup.
      </p>

      <h2>Children's privacy</h2>
      <p>
        This Extension is not directed at children under 13. We do not
        knowingly collect any personal information from anyone, including
        children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        Material changes will be reflected in the "Last updated" date at the
        top. The current version always lives at this URL.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a href="mailto:jmggaravito@gmail.com">jmggaravito@gmail.com</a> (Juan
        Manuel Garavito, sole maintainer).
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
