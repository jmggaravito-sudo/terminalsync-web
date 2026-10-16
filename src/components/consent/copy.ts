/**
 * Textos del banner y del panel de configuración. BORRADOR: los valida el
 * abogado (documento 13, apartado 6). `public/consent.js` repite estos textos
 * para la home estática; `consent.test.ts` comprueba que coinciden.
 */
export type ConsentCopy = {
  title: string;
  body: string;
  accept: string;
  reject: string;
  configure: string;
  policy: string;
  policyHref: string;
  panelTitle: string;
  necessaryTitle: string;
  necessaryBody: string;
  analyticsTitle: string;
  analyticsBody: string;
  affiliatesTitle: string;
  affiliatesBody: string;
  alwaysOn: string;
  save: string;
};

export const CONSENT_COPY: Record<"es" | "en", ConsentCopy> = {
  es: {
    title: "Tus preferencias de cookies",
    body: "Usamos almacenamiento técnico imprescindible para que el sitio funcione. Con tu permiso, también medimos el uso y los errores del sitio (analítica) y registramos de qué enlace de afiliado vienes. Puedes aceptar, rechazar o elegir. Puedes cambiar tu decisión cuando quieras desde «Configurar cookies», en el pie de página.",
    accept: "Aceptar todas",
    reject: "Rechazar todas",
    configure: "Configurar",
    policy: "Política de cookies",
    policyHref: "/es/legal/cookies",
    panelTitle: "Configurar cookies",
    necessaryTitle: "Necesarias",
    necessaryBody: "Tema, idioma, sesión y tu propia decisión sobre las cookies. Sin ellas el sitio no funciona.",
    analyticsTitle: "Analítica y errores",
    analyticsBody: "Vercel Web Analytics y Speed Insights, detección de errores con Sentry y un registro de la página de la que vienes.",
    affiliatesTitle: "Afiliados",
    affiliatesBody: "Rewardful: guarda 60 días qué afiliado te recomendó TerminalSync.",
    alwaysOn: "Siempre activas",
    save: "Guardar selección",
  },
  en: {
    title: "Your cookie preferences",
    body: "We use technical storage that is essential for the site to work. With your permission, we also measure site usage and errors (analytics) and record which affiliate link you came from. You can accept, reject or choose. You can change your decision at any time from “Configure cookies” in the footer.",
    accept: "Accept all",
    reject: "Reject all",
    configure: "Configure",
    policy: "Cookie Policy",
    policyHref: "/en/legal/cookies",
    panelTitle: "Configure cookies",
    necessaryTitle: "Necessary",
    necessaryBody: "Theme, language, session and your own cookie decision. The site does not work without them.",
    analyticsTitle: "Analytics and errors",
    analyticsBody: "Vercel Web Analytics and Speed Insights, error detection with Sentry and a record of the page you came from.",
    affiliatesTitle: "Affiliates",
    affiliatesBody: "Rewardful: stores for 60 days which affiliate referred you to TerminalSync.",
    alwaysOn: "Always on",
    save: "Save selection",
  },
};
