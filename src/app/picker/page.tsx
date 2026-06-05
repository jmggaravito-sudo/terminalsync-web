import Script from "next/script";

const pickerClientId =
  process.env.NEXT_PUBLIC_GOOGLE_PICKER_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ||
  "896546636161-6j7ahmsldklus551vsbsbspp5bb0f88v.apps.googleusercontent.com";

const pickerDeveloperKey =
  process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY ||
  "AIzaSyBEyQFjXkp85ADkMWLzAksHgDZWig0wBYc";

const copy = {
  en: {
    eyebrow: "Secure Google Drive access",
    title: "Choose a Google Drive folder",
    subtitle:
      "Terminal Sync receives access only to the folder you choose. Keep this tab open until Google Drive appears.",
    preparing: "Preparing Google Picker…",
    opening: "Opening Google Drive…",
    open: "Google Drive is open. Choose a folder to continue.",
    openMultiselect: "Google Drive is open. Click each file you want to import — you can pick more than one. Hold Cmd (or Ctrl) to add files; Shift+click to pick a range.",
    retry: "Open picker again",
    cancel: "Cancel",
    selectedTitle: "Folder selected",
    selected: "You can return to Terminal Sync.",
    selectedDetail: "Sending your selection securely…",
    missingCallback: "Missing callback data from Terminal Sync. Close this tab and try again.",
    missingToken: "Missing Google access token. Return to Terminal Sync and try again.",
    missingConfig: "Google Picker is missing its access key or client id.",
    noFolder: "Google did not return a folder. Try again.",
    loadError: "Google Picker failed to load.",
    timeout: "Google Picker timed out.",
  },
  es: {
    eyebrow: "Acceso seguro a Google Drive",
    title: "Elige una carpeta de Google Drive",
    subtitle:
      "Terminal Sync recibe acceso solo a la carpeta que elijas. Mantén esta pestaña abierta hasta que aparezca Google Drive.",
    preparing: "Preparando Google Picker…",
    opening: "Abriendo Google Drive…",
    open: "Google Drive está abierto. Elige una carpeta para continuar.",
    openMultiselect: "Google Drive está abierto. Hacé click en cada archivo que querés importar — podés elegir varios. Mantené Cmd (o Ctrl) presionado para sumar archivos; Shift+click para un rango.",
    retry: "Abrir selector otra vez",
    cancel: "Cancelar",
    selectedTitle: "Carpeta seleccionada",
    selected: "Ya puedes volver a Terminal Sync.",
    selectedDetail: "Enviando tu selección de forma segura…",
    missingCallback: "Faltan datos de retorno de Terminal Sync. Cierra esta pestaña e intenta de nuevo.",
    missingToken: "Falta el acceso a Google. Vuelve a Terminal Sync e intenta de nuevo.",
    missingConfig: "Google Picker no tiene access key o client id configurado.",
    noFolder: "Google no devolvió una carpeta. Intenta de nuevo.",
    loadError: "Google Picker no pudo cargar.",
    timeout: "Google Picker tardó demasiado en cargar.",
  },
} as const;

export const metadata = {
  title: "Google Drive Picker · Terminal Sync",
  robots: { index: false, follow: false },
};

export function GoogleDrivePickerShell({ lang = "en" }: { lang?: "en" | "es" }) {
  const c = copy[lang] || copy.en;

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] font-sans text-[#e6e8ee]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(34,211,238,0.10),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
        <div className="rounded-[28px] border border-[#1f2330] bg-[#0f1115]/95 p-8 shadow-[0_28px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <img
              src="/brand/logo-square.svg"
              alt="Terminal Sync"
              className="h-11 w-11 rounded-2xl shadow-[0_0_24px_-8px_rgba(37,99,235,0.95)]"
            />
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#67e8f9]">
                {c.eyebrow}
              </div>
              <div className="mt-0.5 text-sm font-semibold text-white">Terminal Sync</div>
            </div>
          </div>

          <div id="successIcon" className="mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-2xl text-emerald-200">
            ✓
          </div>
          <h1 id="title" className="text-3xl font-semibold tracking-tight text-white">
            {c.title}
          </h1>
          <p id="subtitle" className="mt-3 text-sm leading-6 text-[#aab2c5]">
            {c.subtitle}
          </p>
          <div id="status" className="mt-6 rounded-2xl border border-[#2563eb]/35 bg-[#2563eb]/15 px-4 py-3 text-sm text-blue-100">
            {c.preparing}
          </div>
          <div id="actions" className="mt-6 flex flex-wrap gap-3">
            <button id="retry" className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3b82f6]">
              {c.retry}
            </button>
            <button id="cancel" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#d6dbea] transition hover:bg-white/10">
              {c.cancel}
            </button>
          </div>
        </div>
      </div>
      <Script src="https://apis.google.com/js/api.js" strategy="afterInteractive" />
      <Script id="terminal-sync-picker" strategy="afterInteractive">{`
        (function () {
          const CLIENT_ID = ${JSON.stringify(pickerClientId)};
          const DEVELOPER_KEY = ${JSON.stringify(pickerDeveloperKey)};
          const COPY = ${JSON.stringify(c)};
          const statusEl = document.getElementById('status');
          const titleEl = document.getElementById('title');
          const subtitleEl = document.getElementById('subtitle');
          const successIconEl = document.getElementById('successIcon');
          const actionsEl = document.getElementById('actions');
          const retryEl = document.getElementById('retry');
          const cancelEl = document.getElementById('cancel');
          const setStatus = (message, tone) => {
            if (!statusEl) return;
            statusEl.textContent = message;
            statusEl.className = 'mt-6 rounded-2xl border px-4 py-3 text-sm ' + (
              tone === 'error'
                ? 'border-red-400/30 bg-red-400/10 text-red-100'
                : tone === 'success'
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                  : 'border-[#2563eb]/35 bg-[#2563eb]/15 text-blue-100'
            );
          };

          function params() {
            const search = new URLSearchParams(window.location.search);
            const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
            return {
              redirect: search.get('redirect') || '',
              cancel: search.get('cancel') || '',
              state: search.get('state') || '',
              clientId: search.get('clientId') || CLIENT_ID,
              appId: search.get('appId') || (CLIENT_ID.split('-')[0] || ''),
              developerKey: search.get('developerKey') || DEVELOPER_KEY,
              accessToken: hash.get('access_token') || '',
              // ?mode=files → multi-file picker (Plan B for Drive Flow 3);
              // anything else (default) → single-folder picker (legacy).
              // The Tauri side passes mode=files when the user clicks
              // "Importar desde Google Drive". Old Tauri builds don't pass
              // the param and keep getting the folder picker, so this
              // change is backward compatible.
              mode: search.get('mode') === 'files' ? 'files' : 'folder',
            };
          }

          function safeRedirect(base, extra) {
            try {
              const url = new URL(base);
              if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') {
                throw new Error('Invalid callback host');
              }
              for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
              window.location.href = url.toString();
            } catch (err) {
              setStatus(err && err.message ? err.message : String(err), 'error');
            }
          }

          function cancel() {
            const p = params();
            if (p.cancel) safeRedirect(p.cancel, { state: p.state });
            else if (p.redirect) safeRedirect(p.redirect, { state: p.state, error: 'cancelled' });
          }

          function showSelectedAndReturn(p, doc) {
            if (titleEl) titleEl.textContent = COPY.selectedTitle;
            if (subtitleEl) subtitleEl.textContent = COPY.selected;
            if (successIconEl) successIconEl.classList.remove('hidden');
            if (successIconEl) successIconEl.classList.add('inline-flex');
            if (actionsEl) actionsEl.classList.add('hidden');
            setStatus(COPY.selectedDetail, 'success');
            window.setTimeout(function () {
              safeRedirect(p.redirect, {
                state: p.state,
                folderId: doc.id,
                folderName: doc.name || 'Google Drive',
              });
            }, 1200);
          }

          // Multi-file equivalent of showSelectedAndReturn. Sends the
          // picked items as JSON in the "files" query param so the Tauri
          // callback handler can parse them as an array. Each item is
          // "{id, name, mimeType?, parentId?}" — small enough to fit in
          // a URL even for a few hundred files.
          function showSelectedFilesAndReturn(p, docs) {
            if (titleEl) titleEl.textContent = COPY.selectedTitle;
            if (subtitleEl) subtitleEl.textContent = COPY.selected;
            if (successIconEl) successIconEl.classList.remove('hidden');
            if (successIconEl) successIconEl.classList.add('inline-flex');
            if (actionsEl) actionsEl.classList.add('hidden');
            setStatus(COPY.selectedDetail, 'success');
            const items = docs.map(function (d) {
              return {
                id: d.id,
                name: d.name || 'Untitled',
                mimeType: d.mimeType || '',
                parentId: (d.parentId || (d.parents && d.parents[0]) || ''),
              };
            });
            window.setTimeout(function () {
              safeRedirect(p.redirect, {
                state: p.state,
                files: JSON.stringify(items),
              });
            }, 1200);
          }

          function openPicker() {
            const p = params();
            if (!p.redirect || !p.state) {
              setStatus(COPY.missingCallback, 'error');
              return;
            }
            if (!p.accessToken) {
              setStatus(COPY.missingToken, 'error');
              return;
            }
            if (!p.developerKey || !p.clientId) {
              setStatus(COPY.missingConfig, 'error');
              return;
            }
            setStatus(COPY.opening);
            if (!window.gapi) {
              window.setTimeout(openPicker, 250);
              return;
            }
            window.gapi.load('picker', {
              callback: function () {
                try {
                  const picker = google.picker;
                  // Branch on mode: 'files' (multi-file) vs default 'folder'.
                  // Mode is set from the ?mode= query param (see params()).
                  const isFilesMode = p.mode === 'files';
                  const view = isFilesMode
                    ? new picker.DocsView(picker.ViewId.DOCS)
                        // Navigate into folders, but don't allow folder
                        // selection itself — the user picks files, possibly
                        // many at once.
                        .setParent('root')
                        .setIncludeFolders(true)
                        .setSelectFolderEnabled(false)
                    : new picker.DocsView(picker.ViewId.FOLDERS)
                        // Start at My Drive root so the user navigates folder hierarchy instead
                        // of seeing every folder flattened into one long list.
                        .setParent('root')
                        .setIncludeFolders(true)
                        .setSelectFolderEnabled(true)
                        .setMimeTypes('application/vnd.google-apps.folder');
                  const builder = new picker.PickerBuilder()
                    .addView(view)
                    .setOAuthToken(p.accessToken)
                    .setDeveloperKey(p.developerKey)
                    .setAppId(p.appId)
                    .setOrigin(window.location.origin)
                    .setCallback(function (data) {
                      if (data.action === picker.Action.CANCEL) {
                        cancel();
                        return;
                      }
                      if (data.action !== picker.Action.PICKED) return;
                      if (isFilesMode) {
                        const docs = data.docs || [];
                        if (docs.length === 0) {
                          setStatus(COPY.noFolder, 'error');
                          return;
                        }
                        showSelectedFilesAndReturn(p, docs);
                        return;
                      }
                      const doc = data.docs && data.docs[0];
                      if (!doc || !doc.id) {
                        setStatus(COPY.noFolder, 'error');
                        return;
                      }
                      showSelectedAndReturn(p, doc);
                    });
                  if (isFilesMode) {
                    builder.enableFeature(picker.Feature.MULTISELECT_ENABLED);
                  }
                  if (builder.setSize) builder.setSize(1051, 650);
                  if (builder.setTitle) builder.setTitle('Terminal Sync');
                  builder.build().setVisible(true);
                  // In multi-file mode show the cmd+click hint — the Picker
                  // UI itself doesn't tell the user that multi-select is on,
                  // so without this hint a customer might think they can
                  // only pick one file. Falls back to the single-folder
                  // copy for legacy callers without the mode param.
                  setStatus(isFilesMode ? COPY.openMultiselect : COPY.open);
                } catch (err) {
                  setStatus(err && err.message ? err.message : String(err), 'error');
                }
              },
              onerror: function () { setStatus(COPY.loadError, 'error'); },
              timeout: 10000,
              ontimeout: function () { setStatus(COPY.timeout, 'error'); },
            });
          }

          retryEl && retryEl.addEventListener('click', openPicker);
          cancelEl && cancelEl.addEventListener('click', cancel);
          if (window.location.hostname === 'www.terminalsync.ai') {
            window.location.replace('https://terminalsync.ai' + window.location.pathname + window.location.search + window.location.hash);
            return;
          }
          openPicker();
        })();
      `}</Script>
    </main>
  );
}

export default function GoogleDrivePickerPage() {
  return <GoogleDrivePickerShell lang="en" />;
}
