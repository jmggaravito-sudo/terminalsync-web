/* Gestor de consentimiento de cookies para páginas ESTÁTICAS (hoy: la home
   /landing-b/index.html, servida por el middleware en /es y /en).

   Las páginas de Next.js usan src/components/consent/*; este archivo habla el
   MISMO formato. Si cambias CONSENT_KEY, CONSENT_VERSION o los textos, cámbialos
   también en src/lib/consent.ts y src/components/consent/copy.ts:
   src/lib/consent.test.ts comprueba que coinciden.

   Banner estricto SOLO para visitantes de Europa (cookie ts_region=eu o ausente).
   Fuera de Europa (ts_region=row) no hay banner y la analítica carga como antes.

   Regla (en Europa): nada de analítica (Vercel Web Analytics), ni eventos, ni la cookie de
   atribución se activan antes de que la persona acepte la categoría. Rechazar
   es el estado por defecto. BORRADOR: textos pendientes de validación legal. */
(function () {
  'use strict';

  var CONSENT_KEY = 'terminalsync:cookie-consent-v2';
  var CONSENT_VERSION = '2026-10-16';
  var CONSENT_EVENT = 'ts:consent:changed';
  var OPEN_SETTINGS_EVENT = 'ts:consent:open';

  var COPY = {
    es: {
      title: 'Tus preferencias de cookies',
      body: 'Usamos almacenamiento técnico imprescindible para que el sitio funcione. Con tu permiso, también medimos el uso y los errores del sitio (analítica) y registramos de qué enlace de afiliado vienes. Puedes aceptar, rechazar o elegir. Puedes cambiar tu decisión cuando quieras desde «Configurar cookies», en el pie de página.',
      accept: 'Aceptar todas',
      reject: 'Rechazar todas',
      configure: 'Configurar',
      policy: 'Política de cookies',
      policyHref: '/es/legal/cookies',
      panelTitle: 'Configurar cookies',
      necessaryTitle: 'Necesarias',
      necessaryBody: 'Tema, idioma, sesión y tu propia decisión sobre las cookies. Sin ellas el sitio no funciona.',
      analyticsTitle: 'Analítica y errores',
      analyticsBody: 'Vercel Web Analytics y Speed Insights, detección de errores con Sentry y un registro de la página de la que vienes.',
      affiliatesTitle: 'Afiliados',
      affiliatesBody: 'Rewardful: guarda 60 días qué afiliado te recomendó TerminalSync.',
      alwaysOn: 'Siempre activas',
      save: 'Guardar selección'
    },
    en: {
      title: 'Your cookie preferences',
      body: 'We use technical storage that is essential for the site to work. With your permission, we also measure site usage and errors (analytics) and record which affiliate link you came from. You can accept, reject or choose. You can change your decision at any time from “Configure cookies” in the footer.',
      accept: 'Accept all',
      reject: 'Reject all',
      configure: 'Configure',
      policy: 'Cookie Policy',
      policyHref: '/en/legal/cookies',
      panelTitle: 'Configure cookies',
      necessaryTitle: 'Necessary',
      necessaryBody: 'Theme, language, session and your own cookie decision. The site does not work without them.',
      analyticsTitle: 'Analytics and errors',
      analyticsBody: 'Vercel Web Analytics and Speed Insights, error detection with Sentry and a record of the page you came from.',
      affiliatesTitle: 'Affiliates',
      affiliatesBody: 'Rewardful: stores for 60 days which affiliate referred you to TerminalSync.',
      alwaysOn: 'Always on',
      save: 'Save selection'
    }
  };

  function lang() {
    return location.pathname.indexOf('/en') === 0 ? 'en' : 'es';
  }

  /* Región (cookie ts_region, la fija el middleware desde x-vercel-ip-country).
     Solo el valor exacto "row" (fuera de Europa) relaja; cualquier otra cosa, o
     la ausencia de cookie, es Europa (fail-safe). Misma regla que src/lib/region.ts. */
  function region() {
    try {
      var m = /(?:^|;\s*)ts_region=([^;]*)/.exec(document.cookie || '');
      return m && m[1] === 'row' ? 'row' : 'eu';
    } catch (e) { return 'eu'; }
  }

  function storage() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  function readRecord() {
    var s = storage();
    if (!s) return null;
    try {
      var v = JSON.parse(s.getItem(CONSENT_KEY));
      if (!v || v.version !== CONSENT_VERSION || typeof v.date !== 'string') return null;
      var c = v.categories;
      if (!c || typeof c.analytics !== 'boolean' || typeof c.affiliates !== 'boolean') return null;
      return v;
    } catch (e) { return null; }
  }

  function effective() {
    var r = readRecord();
    // Una decisión guardada se respeta siempre, en cualquier región.
    if (r) return { analytics: r.categories.analytics, affiliates: r.categories.affiliates };
    // Fuera de Europa sin decisión: como antes (analítica activa, sin banner).
    if (region() === 'row') return { analytics: true, affiliates: true };
    return { analytics: false, affiliates: false };
  }

  function write(categories) {
    var rec = {
      version: CONSENT_VERSION,
      date: new Date().toISOString(),
      categories: { analytics: !!categories.analytics, affiliates: !!categories.affiliates }
    };
    var s = storage();
    try { if (s) s.setItem(CONSENT_KEY, JSON.stringify(rec)); } catch (e) {}
    return rec;
  }

  /* ── Activación de lo no esencial: SOLO aquí, SOLO con consentimiento ── */
  var analyticsStarted = false;
  function startAnalytics() {
    if (analyticsStarted) return;
    analyticsStarted = true;
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    var s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/insights/script.js';
    document.head.appendChild(s);
    // Cookie de atribución del origen (antes la fijaba el middleware sin consentimiento).
    try {
      if (!/(?:^|;\s*)tsync_landing=/.test(document.cookie) && /^\/(?:es|en)\/?$/.test(location.pathname)) {
        document.cookie = 'tsync_landing=consumer; max-age=' + (60 * 60 * 24 * 30) + '; path=/; samesite=lax';
      }
    } catch (e) {}
  }

  function applyConsent(c) {
    if (c && c.analytics) startAnalytics();
    // "Afiliados" (Rewardful) no se carga en esta página: no hay rastreador de afiliados aquí.
  }

  /* ── Interfaz ── */
  var root = null;

  function css() {
    if (document.getElementById('ts-consent-css')) return;
    var st = document.createElement('style');
    st.id = 'ts-consent-css';
    st.textContent =
      '.ts-cc{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:460px;margin-left:auto;' +
      'background:#fff;color:#1b1b1f;border:1px solid #d6d6dc;border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,.22);' +
      'padding:18px;font:13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}' +
      '@media (prefers-color-scheme:dark){.ts-cc{background:#17181c;color:#f1f1f3;border-color:#33343b}}' +
      '.ts-cc h2{margin:0 0 6px;font-size:14px;font-weight:600}' +
      '.ts-cc p{margin:0;opacity:.82;font-size:12.5px}' +
      '.ts-cc a{color:inherit;text-decoration:underline}' +
      '.ts-cc-row{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;margin:0 0 12px}' +
      '.ts-cc-row strong{display:block;font-size:13px}' +
      '.ts-cc-row span{font-size:12px;opacity:.8}' +
      '.ts-cc-btns{display:flex;gap:8px;margin-top:14px}' +
      '.ts-cc-btn{flex:1;height:40px;padding:0 12px;border-radius:999px;border:1px solid currentColor;background:transparent;' +
      'color:inherit;font:600 13px system-ui,sans-serif;cursor:pointer}' +
      '.ts-cc-btn:hover{background:rgba(127,127,127,.18)}' +
      '.ts-cc-btn:focus-visible{outline:2px solid #2f9e78;outline-offset:2px}' +
      '.ts-cc-sw{position:relative;width:44px;height:24px;border-radius:999px;border:1px solid currentColor;background:transparent;cursor:pointer;flex:none}' +
      '.ts-cc-sw::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:currentColor;transition:left .15s}' +
      '.ts-cc-sw[aria-checked="true"]{background:#2f9e78;border-color:#2f9e78}' +
      '.ts-cc-sw[aria-checked="true"]::after{left:22px;background:#fff}';
    document.head.appendChild(st);
  }

  function el(tag, props, children) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      if (k === 'text') n.textContent = props[k];
      else if (k === 'onclick') n.addEventListener('click', props[k]);
      else n.setAttribute(k, props[k]);
    }
    (children || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  function close() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  }

  function decide(c) {
    write(c);
    close();
    applyConsent(c);
    try { window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c })); } catch (e) {}
  }

  function button(label, fn) {
    return el('button', { type: 'button', 'class': 'ts-cc-btn', text: label, onclick: fn });
  }

  function showBanner() {
    close(); css();
    var t = COPY[lang()];
    var link = el('a', { href: t.policyHref, text: t.policy });
    var p = el('p', { text: t.body + ' ' }, [link]);
    p.appendChild(document.createTextNode('.'));
    root = el('div', { 'class': 'ts-cc', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'ts-cc-title' }, [
      el('h2', { id: 'ts-cc-title', text: t.title }),
      p,
      el('div', { 'class': 'ts-cc-btns' }, [
        button(t.accept, function () { decide({ analytics: true, affiliates: true }); }),
        button(t.reject, function () { decide({ analytics: false, affiliates: false }); }),
        button(t.configure, function () { showPanel({ analytics: false, affiliates: false }); })
      ])
    ]);
    document.body.appendChild(root);
  }

  function showPanel(draft) {
    close(); css();
    var t = COPY[lang()];
    function sw(key, label) {
      var b = el('button', { type: 'button', role: 'switch', 'class': 'ts-cc-sw', 'aria-label': label, 'aria-checked': String(!!draft[key]) });
      b.addEventListener('click', function () {
        draft[key] = !draft[key];
        b.setAttribute('aria-checked', String(!!draft[key]));
      });
      return b;
    }
    function row(title, body, control) {
      return el('div', { 'class': 'ts-cc-row' }, [
        el('div', null, [el('strong', { text: title }), el('span', { text: body })]),
        control
      ]);
    }
    root = el('div', { 'class': 'ts-cc', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'ts-cc-title' }, [
      el('h2', { id: 'ts-cc-title', text: t.panelTitle }),
      row(t.necessaryTitle, t.necessaryBody, el('span', { text: t.alwaysOn })),
      row(t.analyticsTitle, t.analyticsBody, sw('analytics', t.analyticsTitle)),
      row(t.affiliatesTitle, t.affiliatesBody, sw('affiliates', t.affiliatesTitle)),
      el('div', { 'class': 'ts-cc-btns' }, [
        button(t.accept, function () { decide({ analytics: true, affiliates: true }); }),
        button(t.reject, function () { decide({ analytics: false, affiliates: false }); }),
        button(t.save, function () { decide(draft); })
      ])
    ]);
    document.body.appendChild(root);
  }

  function openSettings() { showPanel(effective()); }

  // Enlace permanente "Configurar cookies" del pie (cualquier [data-cookie-settings]).
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('[data-cookie-settings]');
    if (!a) return;
    e.preventDefault();
    openSettings();
  });
  window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);

  window.tsConsent = { open: openSettings, get: effective };

  // Arranque: aplicar una decisión vigente; si no la hay, preguntar SOLO en Europa
  // (o ante la duda). Fuera de Europa no hay banner y todo carga como antes.
  var rec = readRecord();
  if (rec) applyConsent(effective());
  else if (region() === 'row') applyConsent(effective());
  else showBanner();
})();
