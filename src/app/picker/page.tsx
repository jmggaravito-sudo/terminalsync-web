import Script from "next/script";

const pickerClientId =
  process.env.NEXT_PUBLIC_GOOGLE_PICKER_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ||
  "896546636161-6j7ahmsldklus551vsbsbspp5bb0f88v.apps.googleusercontent.com";

const pickerDeveloperKey =
  process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY ||
  "AIzaSyBEyQFjXkp85ADkMWLzAksHgDZWig0wBYc";

export const metadata = {
  title: "Google Drive Picker · Terminal Sync",
  robots: { index: false, follow: false },
};

export default function GoogleDrivePickerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/40">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-2xl">
            ✨
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Choose a Google Drive folder</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Terminal Sync will receive access only to the folder you choose. Keep this tab open until
            Google Drive appears.
          </p>
          <div id="status" className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm text-blue-100">
            Preparing Google Picker…
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button id="retry" className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">
              Open picker again
            </button>
            <button id="cancel" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
              Cancel
            </button>
          </div>
        </div>
      </div>
      <Script src="https://apis.google.com/js/api.js" strategy="afterInteractive" />
      <Script id="terminal-sync-picker" strategy="afterInteractive">{`
        (function () {
          const CLIENT_ID = ${JSON.stringify(pickerClientId)};
          const DEVELOPER_KEY = ${JSON.stringify(pickerDeveloperKey)};
          const statusEl = document.getElementById('status');
          const retryEl = document.getElementById('retry');
          const cancelEl = document.getElementById('cancel');
          const setStatus = (message, tone) => {
            if (!statusEl) return;
            statusEl.textContent = message;
            statusEl.className = 'mt-6 rounded-2xl border px-4 py-3 text-sm ' + (
              tone === 'error'
                ? 'border-red-400/30 bg-red-400/10 text-red-100'
                : 'border-blue-400/30 bg-blue-400/10 text-blue-100'
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

          function openPicker() {
            const p = params();
            if (!p.redirect || !p.state) {
              setStatus('Missing callback data from Terminal Sync. Close this tab and try again.', 'error');
              return;
            }
            if (!p.accessToken) {
              setStatus('Missing Google access token. Return to Terminal Sync and try again.', 'error');
              return;
            }
            if (!p.developerKey || !p.clientId) {
              setStatus('Google Picker is missing its API key or client id.', 'error');
              return;
            }
            setStatus('Opening Google Drive…');
            if (!window.gapi) {
              window.setTimeout(openPicker, 250);
              return;
            }
            window.gapi.load('picker', {
              callback: function () {
                try {
                  const picker = google.picker;
                  const view = new picker.DocsView(picker.ViewId.FOLDERS)
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
                      const doc = data.docs && data.docs[0];
                      if (!doc || !doc.id) {
                        setStatus('Google did not return a folder. Try again.', 'error');
                        return;
                      }
                      safeRedirect(p.redirect, {
                        state: p.state,
                        folderId: doc.id,
                        folderName: doc.name || 'Google Drive',
                      });
                    });
                  if (builder.setSize) builder.setSize(1051, 650);
                  if (builder.setTitle) builder.setTitle('Terminal Sync');
                  builder.build().setVisible(true);
                  setStatus('Google Drive is open. Choose a folder to continue.');
                } catch (err) {
                  setStatus(err && err.message ? err.message : String(err), 'error');
                }
              },
              onerror: function () { setStatus('Google Picker failed to load.', 'error'); },
              timeout: 10000,
              ontimeout: function () { setStatus('Google Picker timed out.', 'error'); },
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
