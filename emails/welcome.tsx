// React Email template — send via Resend: `await resend.emails.send({ react: <WelcomeEmail ... /> })`.
// No external dependency here; inline styles so the markup works in every
// mail client without needing @react-email/components. Swap for that library
// once email design needs to scale.

interface Props {
  firstName: string;
  downloadUrl: string;
  unsubscribeUrl: string;
}

export function WelcomeEmail({ firstName, downloadUrl, unsubscribeUrl }: Props) {
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
                          TerminalSync
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
                      🛡️ Tu Claude Code ahora tiene superpoderes (y memoria)
                    </h1>
                    <p
                      style={{
                        marginTop: 18,
                        marginBottom: 0,
                        fontSize: 15,
                        lineHeight: 1.55,
                      }}
                    >
                      ¡Hola {firstName}!
                    </p>
                    <p
                      style={{
                        marginTop: 10,
                        marginBottom: 0,
                        fontSize: 15,
                        lineHeight: 1.55,
                      }}
                    >
                      Bienvenido a la nueva forma de trabajar con IA. Acabas de
                      dar el primer paso para liberar tu flujo de trabajo de
                      las limitaciones de una sola computadora.
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
                      ¿Qué sigue ahora?
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
                        <strong>Descarga la App</strong> — hacelo desde el
                        botón de abajo.
                      </li>
                      <li style={{ marginBottom: 6 }}>
                        <strong>Configura tu IA</strong> — dentro de la app,
                        usa nuestro AI Power-Up para instalar Claude Code y
                        configurar tu API Key con un solo clic.
                      </li>
                      <li style={{ marginBottom: 6 }}>
                        <strong>Sé Nómada</strong> — crea tu primera
                        &ldquo;Terminal&rdquo;, actívala y vete a cualquier
                        otra computadora. Tu contexto te estará esperando.
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
                            Descargar TerminalSync para Desktop
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
                      <strong>🔒 Un dato importante:</strong> tus archivos y tu
                      API Key están protegidos por cifrado AES-256 antes de
                      salir de tu computadora. Nosotros no podemos ver tu
                      código, y Google tampoco.
                    </div>

                    <p
                      style={{
                        marginTop: 24,
                        fontSize: 14,
                        lineHeight: 1.55,
                      }}
                    >
                      Si tienes alguna duda, responde a este correo. Estoy aquí
                      para ayudarte a que tu IA sea tan móvil como tú.
                    </p>

                    <p style={{ marginTop: 24, fontSize: 14 }}>
                      <strong>Juan</strong>
                      <br />
                      <span style={{ color: "#4b5563" }}>
                        Fundador, TerminalSync.ai
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
                      Unsubscribe
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
