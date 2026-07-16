// React Email template — send via Resend: `await resend.emails.send({ react: <WelcomeEmail ... /> })`.
// No external dependency here; inline styles so the markup works in every
// mail client without needing @react-email/components. Swap for that library
// once email design needs to scale.

interface Props {
  lang: "es" | "en";
  firstName: string;
  downloadUrl: string;
  unsubscribeUrl: string;
}

export function WelcomeEmail({ lang, firstName, downloadUrl, unsubscribeUrl }: Props) {
  const COPY = {
    es: {
      brand: "TerminalSync",
      heading: "🛡️ Tu Claude Code ahora tiene superpoderes (y memoria)",
      greeting: "¡Hola",
      intro:
        "Bienvenido a la nueva forma de trabajar con IA. Acabas de dar el primer paso para liberar tu flujo de trabajo de las limitaciones de una sola computadora.",
      whatsNext: "¿Qué sigue ahora?",
      step1Strong: "Descarga la App",
      step1Rest: " — hacelo desde el botón de abajo.",
      step2Strong: "Configura tu IA",
      step2Rest:
        " — dentro de la app, usa nuestro AI Power-Up para instalar Claude Code y configurar tu API Key con un solo clic.",
      step3Strong: "Sé Nómada",
      step3Rest:
        " — crea tu primera “Terminal”, actívala y vete a cualquier otra computadora. Tu contexto te estará esperando.",
      cta: "Descargar TerminalSync para Desktop",
      securityStrong: "🔒 Un dato importante:",
      securityRest:
        " tus secretos, tus claves API y tus conversaciones con la IA viajan cifrados con AES-256 antes de salir de tu computadora. Tus archivos de proyecto se guardan en tu propia nube (tu Google Drive), en tu cuenta y en su formato original — nunca pasan por nuestros servidores.",
      closing:
        "Si tienes alguna duda, responde a este correo. Estoy aquí para ayudarte a que tu IA sea tan móvil como tú.",
      signName: "Juan",
      signRole: "Fundador, TerminalSync.ai",
      unsubscribe: "Cancelar suscripción",
    },
    en: {
      brand: "TerminalSync",
      heading: "🛡️ Your Claude Code now has superpowers (and memory)",
      greeting: "Hi",
      intro:
        "Welcome to the new way of working with AI. You've just taken the first step to free your workflow from the limits of a single computer.",
      whatsNext: "What's next?",
      step1Strong: "Download the App",
      step1Rest: " — grab it from the button below.",
      step2Strong: "Set up your AI",
      step2Rest:
        " — inside the app, use our AI Power-Up to install Claude Code and configure your API Key with a single click.",
      step3Strong: "Go Nomad",
      step3Rest:
        " — create your first “Terminal”, activate it, and move to any other computer. Your context will be waiting for you.",
      cta: "Download TerminalSync for Desktop",
      securityStrong: "🔒 One important thing:",
      securityRest:
        " your secrets, API keys and AI conversations are encrypted with AES-256 before they ever leave your computer. Your project files stay in your own cloud (your Google Drive), under your account and in their original format — they never pass through our servers.",
      closing:
        "If you have any questions, just reply to this email. I'm here to help make your AI as mobile as you are.",
      signName: "Juan",
      signRole: "Founder, TerminalSync.ai",
      unsubscribe: "Unsubscribe",
    },
  } as const;
  const t = COPY[lang];

  return (
    <html>
      <head />
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#f4f5f8",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#1f2937",
        }}
      >
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          width="100%"
          style={{ background: "#f4f5f8", padding: "32px 0" }}
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                width="560"
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  boxShadow: "0 2px 4px rgba(15,23,42,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <tr>
                  <td style={{ padding: "28px 36px 0" }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 9,
                              background:
                                "linear-gradient(135deg,#2563eb,#0284c7)",
                              display: "inline-block",
                              verticalAlign: "middle",
                              textAlign: "center",
                              lineHeight: "32px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                background: "#fff",
                                verticalAlign: "middle",
                              }}
                            />
                          </div>
                        </td>
                        <td
                          style={{
                            paddingLeft: 10,
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#0b1733",
                          }}
                        >
                          {t.brand}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: "24px 36px 8px" }}>
                    <h1
                      style={{
                        margin: 0,
                        fontSize: 26,
                        lineHeight: 1.15,
                        color: "#0b1733",
                        fontWeight: 600,
                      }}
                    >
                      {t.heading}
                    </h1>
                    <p
                      style={{
                        marginTop: 18,
                        marginBottom: 0,
                        fontSize: 15,
                        lineHeight: 1.55,
                      }}
                    >
                      {t.greeting} {firstName}!
                    </p>
                    <p
                      style={{
                        marginTop: 10,
                        marginBottom: 0,
                        fontSize: 15,
                        lineHeight: 1.55,
                      }}
                    >
                      {t.intro}
                    </p>

                    <h2
                      style={{
                        marginTop: 28,
                        marginBottom: 8,
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#0b1733",
                      }}
                    >
                      {t.whatsNext}
                    </h2>

                    <ol
                      style={{
                        paddingLeft: 22,
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      <li style={{ marginBottom: 6 }}>
                        <strong>{t.step1Strong}</strong>
                        {t.step1Rest}
                      </li>
                      <li style={{ marginBottom: 6 }}>
                        <strong>{t.step2Strong}</strong>
                        {t.step2Rest}
                      </li>
                      <li style={{ marginBottom: 6 }}>
                        <strong>{t.step3Strong}</strong>
                        {t.step3Rest}
                      </li>
                    </ol>

                    <table
                      role="presentation"
                      cellPadding={0}
                      cellSpacing={0}
                      style={{ margin: "28px 0 4px" }}
                    >
                      <tr>
                        <td>
                          <a
                            href={downloadUrl}
                            style={{
                              display: "inline-block",
                              background: "#2563eb",
                              color: "#ffffff",
                              textDecoration: "none",
                              padding: "12px 22px",
                              borderRadius: 12,
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {t.cta}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div
                      style={{
                        marginTop: 28,
                        padding: 14,
                        borderRadius: 10,
                        background: "#ecfdf5",
                        border: "1px solid rgba(5,150,105,0.25)",
                        color: "#065f46",
                        fontSize: 13,
                        lineHeight: 1.55,
                      }}
                    >
                      <strong>{t.securityStrong}</strong>
                      {t.securityRest}
                    </div>

                    <p
                      style={{
                        marginTop: 24,
                        fontSize: 14,
                        lineHeight: 1.55,
                      }}
                    >
                      {t.closing}
                    </p>

                    <p style={{ marginTop: 24, fontSize: 14 }}>
                      <strong>{t.signName}</strong>
                      <br />
                      <span style={{ color: "#4b5563" }}>
                        {t.signRole}
                      </span>
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      padding: "20px 36px 28px",
                      borderTop: "1px solid #e8eaef",
                      fontSize: 11,
                      color: "#9ca3af",
                      textAlign: "center",
                    }}
                  >
                    © TerminalSync · terminalsync.ai ·{" "}
                    <a
                      href={unsubscribeUrl}
                      style={{ color: "#9ca3af", textDecoration: "underline" }}
                    >
                      {t.unsubscribe}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

export default WelcomeEmail;
