import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";

interface Props {
  params: Promise<{ lang: string }>;
}

// Scope: extension only. Reference: terminalsync-chrome 5e31577e (0.3.0).
// Keep the published legacy release separate from the unpublished Desktop bridge.
const policy = {
  es: {
    title: "Política de Privacidad — Extensión Chrome",
    description: "Datos, permisos y controles de la extensión de TerminalSync: puente con Desktop 0.3.0 y versión publicada anterior 0.2.1.",
    updated: "Última actualización: 23 de noviembre de 2026 (Colombia)",
    sections: [
      ["Versiones y editor", [
        "Editor: TerminalSync.ai. ID oficial de Chrome: fbbeeghjdjopcadipcjiabcjefbpihpb. Esta política distingue la versión publicada 0.2.1 de la versión 0.3.0 del puente con TerminalSync Desktop, todavía no publicada en Chrome Web Store a esta fecha. Consulta tu versión en chrome://extensions.",
      ]],
      ["Versión 0.3.0: propósito y recorrido de los datos", [
        "La extensión conecta el panel lateral de Chrome con TerminalSync Desktop para realizar tareas de navegador autorizadas. La extensión envía instrucciones y resultados al puente local de Desktop en http://127.0.0.1; no llama directamente a proveedores de IA ni solicita sus API keys o un trial alojado en este flujo.",
        "Desktop procesa el contenido autorizado mediante los servicios de IA configurados. Por tanto, un puente local no significa procesamiento íntegramente sin conexión ni ausencia de servidores: las instrucciones, el contexto y los resultados pueden pasar por los servicios utilizados por Desktop. Su tratamiento depende de esa configuración y de las políticas aplicables de esos servicios. Esta política no promete que nadie pueda acceder a los prompts ni fija plazos de conservación o condiciones de entrenamiento de proveedores.",
      ]],
      ["Datos utilizados para una tarea autorizada", [
        "Instrucciones y chat: solicitudes, respuestas, progreso, errores y confirmaciones para ejecutar y mostrar la tarea.",
        "Contenido del sitio web: texto visible, URL y título de la página o documento autorizado; estructura de formularios, etiquetas, opciones y valores de campos visibles admitidos para descubrir, rellenar y verificar formularios. No autorices páginas con información que no quieras compartir con Desktop y los servicios que utiliza.",
        "Acciones autorizadas y resultados: lectura, descubrimiento de formularios, valores introducidos y verificados, y envío del formulario tras una confirmación separada. Un formulario enviado también entrega datos al sitio de destino según sus propias prácticas.",
        "Metadatos de conexión y autenticación del puente local: identificador de conexión, versión y protocolo, URL local, estado, identidad de pestaña/documento, token de conexión y capacidades de alcance usadas para autenticar y delimitar la tarea. No son API keys de proveedores de IA.",
      ]],
      ["Permisos y alcance", [
        "El manifiesto 0.3.0 solicita storage para almacenamiento local; tabs para identificar la pestaña, URL y título; scripting para leer contenido y ejecutar acciones autorizadas en el documento; y sidePanel para el panel lateral.",
        "El permiso de host http://127.0.0.1/* permite comunicarse con Desktop. Los permisos de host opcionales http://*/* y https://*/* permiten solicitar acceso a los sitios que autorices. Un permiso de Chrome para un sitio y una autorización de tarea son controles distintos; el permiso no es por sí solo autorización permanente para cualquier acción.",
        "Las capacidades y concesiones de tarea tienen alcance limitado y son volátiles: se mantienen en memoria, ligadas al espacio de trabajo y a la pestaña/documento, con vencimiento y verificaciones antes de actuar. No se guardan como autorización reutilizable en el historial. Revocar acceso o detener una tarea no deshace efectos que ya hayan ocurrido.",
      ]],
      ["Almacenamiento y controles", [
        "El historial del panel se guarda en chrome.storage.local, separado por pestaña y contexto de sesión/conexión; también se conservan preferencias y metadatos locales de conexión. Las capacidades de alcance activas no se persisten con el historial. Este almacenamiento de la extensión no usa chrome.storage.sync; ello no describe ni limita el almacenamiento de Desktop o sus servicios.",
        "Puedes gestionar los permisos de sitios y quitar la extensión en chrome://extensions. Quitarla elimina su almacenamiento local de Chrome, pero no borra datos que ya hayan recibido Desktop, los servicios de IA o los sitios de destino. Gestiona esos datos por separado con sus respectivos controles. No se promete borrado remoto al limpiar el chat o desconectar el puente.",
      ]],
      ["Versión anterior publicada 0.2.1 — tratamiento separado", [
        "El flujo anterior permite comparar respuestas de Anthropic, OpenAI y Google Gemini. En modo BYOK usa API keys del usuario para solicitudes directas al proveedor seleccionado; el modo alojado/trial envía solicitudes a un servicio de TerminalSync que las procesa con proveedores de IA. No debe describirse como un producto sin backend.",
        "Ese flujo puede conservar localmente API keys, preferencias de modelos, historial de conversación y metadatos del modo alojado/trial, incluido un identificador de instalación y estado del trial. Los proveedores y el servicio alojado reciben las instrucciones y el contexto enviados en su respectivo modo; sus políticas aplican a ese procesamiento.",
        "Al actualizar, las claves y el historial antiguos pueden permanecer en chrome.storage.local hasta que los elimines. La versión 0.3.0 no implica eliminación automática de credenciales anteriores. Quitar la extensión elimina sus datos locales; para invalidar una API key debes revocarla además en la consola del proveedor. No publiques ni compartas tokens o claves al pedir soporte.",
      ]],
      ["Cambios y contacto", [
        "Los cambios de esta política se reflejan en la fecha de actualización. Para preguntas o solicitudes sobre los datos de la extensión, escribe al contacto indicado abajo e identifica la versión, sin incluir datos sensibles.",
      ]],
    ],
    contact: "Contacto",
    source: "Código fuente de referencia (0.3.0)",
  },
  en: {
    title: "Privacy Policy — Chrome Extension",
    description: "Data, permissions and controls for the TerminalSync extension: the 0.3.0 Desktop bridge and the earlier published 0.2.1 release.",
    updated: "Last updated: November 23, 2026 (Colombia)",
    sections: [
      ["Versions and publisher", [
        "Publisher: TerminalSync.ai. Official Chrome ID: fbbeeghjdjopcadipcjiabcjefbpihpb. This policy distinguishes the published 0.2.1 release from the 0.3.0 TerminalSync Desktop bridge, which is not yet published in the Chrome Web Store as of this date. Check your installed version at chrome://extensions.",
      ]],
      ["Version 0.3.0: purpose and data flow", [
        "The extension connects the Chrome side panel to TerminalSync Desktop for authorized browser tasks. The extension sends instructions and results to Desktop through the local bridge at http://127.0.0.1; it does not call AI providers directly or request their API keys or a hosted trial in this flow.",
        "Desktop processes authorized content through its configured AI services. A local bridge therefore does not mean fully offline processing or an absence of servers: instructions, context and results may pass through the services used by Desktop. Their handling depends on that configuration and those services' applicable policies. This policy does not promise that no one can access prompts or prescribe providers' retention periods or training practices.",
      ]],
      ["Data used for an authorized task", [
        "Instructions and chat: requests, responses, progress, errors and confirmations used to carry out and display the task.",
        "Website content: visible text, URL and title of the authorized page or document; form structure, labels, options and supported visible field values used to discover, fill and verify forms. Do not authorize pages containing information you do not want to share with Desktop and its services.",
        "Authorized actions and results: reading, form discovery, entered and verified values, and form submission after a separate confirmation. Submitting a form also sends data to the destination website under its own practices.",
        "Local bridge authentication and connection metadata: connection identifier, version and protocol, local URL, status, tab/document identity, connection token and scoped capabilities used to authenticate and constrain the task. These are not AI provider API keys.",
      ]],
      ["Permissions and scope", [
        "The 0.3.0 manifest requests storage for local storage; tabs to identify the tab, URL and title; scripting to read content and execute authorized actions in the document; and sidePanel for the side panel interface.",
        "The http://127.0.0.1/* host permission enables communication with Desktop. Optional host permissions http://*/* and https://*/* enable requests for access to websites you authorize. A Chrome site permission and a task authorization are separate controls; a site permission alone is not permanent authorization for every action.",
        "Task capabilities and grants are scoped and volatile: they are held in memory, bound to the workspace and tab/document, with expiry and checks before acting. They are not saved as reusable authorization in history. Revoking access or stopping a task does not undo effects that have already occurred.",
      ]],
      ["Storage and controls", [
        "Panel history is saved in chrome.storage.local, partitioned by tab and session/connection context; preferences and local connection metadata are also retained. Active scoped capabilities are not persisted with history. This extension storage does not use chrome.storage.sync; that does not describe or limit storage by Desktop or its services.",
        "You can manage site permissions and remove the extension at chrome://extensions. Removing it deletes its local Chrome storage but does not erase data already received by Desktop, AI services or destination websites. Manage that data separately using their respective controls. Clearing chat or disconnecting the bridge does not promise remote deletion.",
      ]],
      ["Earlier published version 0.2.1 — separate handling", [
        "The earlier flow compares responses from Anthropic, OpenAI and Google Gemini. BYOK mode uses the user's API keys for direct requests to the selected provider; hosted/trial mode sends requests to a TerminalSync service that processes them with AI providers. It must not be described as a product without a backend.",
        "That flow may retain API keys, model preferences, conversation history and hosted/trial metadata locally, including an installation identifier and trial status. Providers and the hosted service receive the instructions and context sent in their respective modes; their policies apply to that processing.",
        "After an update, old keys and history may remain in chrome.storage.local until you remove them. Version 0.3.0 does not imply automatic deletion of earlier credentials. Removing the extension deletes its local data; to invalidate an API key, also revoke it in the provider's console. Do not publish or share tokens or keys when requesting support.",
      ]],
      ["Changes and contact", [
        "Changes to this policy are reflected in the update date. For questions or requests about extension data, use the contact below and identify your version without including sensitive data.",
      ]],
    ],
    contact: "Contact",
    source: "Reference source code (0.3.0)",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = policy[lang];
  return {
    title: copy.title,
    description: copy.description,
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
  const copy = policy[lang];
  return (
    <LegalShell lang={lang} title={copy.title} subtitle={copy.description} lastUpdated={copy.updated}>
      {copy.sections.map(([heading, paragraphs]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}
      <h2>{copy.contact}</h2>
      <p><a href="mailto:jmggaravito@gmail.com">jmggaravito@gmail.com</a> — TerminalSync.ai</p>
      <p><a href="https://github.com/jmggaravito-sudo/terminalsync-chrome/tree/5e31577ed7567adc8d6d9b9eafd49165d072f9b0">{copy.source}</a></p>
    </LegalShell>
  );
}
