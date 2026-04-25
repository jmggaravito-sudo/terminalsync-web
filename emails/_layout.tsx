// Shared shell for transactional emails. Inline styles only — no
// @react-email/components dependency. Table-based layout because Outlook,
// Gmail's clipping at 102KB, and a couple of corporate proxies still
// don't agree on flex/grid.

import type { ReactNode } from "react";

export const COLORS = {
  bg: "#f4f5f8",
  card: "#ffffff",
  ink: "#0b1733",
  body: "#1f2937",
  muted: "#4b5563",
  dim: "#9ca3af",
  border: "#e8eaef",
  accent: "#2563eb",
  accentSoft: "#1d4ed8",
  ok: "#065f46",
  okBg: "#ecfdf5",
  okBorder: "rgba(5,150,105,0.25)",
  warn: "#9a3412",
  warnBg: "#fff7ed",
  warnBorder: "rgba(234,88,12,0.25)",
  err: "#991b1b",
  errBg: "#fef2f2",
  errBorder: "rgba(220,38,38,0.25)",
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

interface ShellProps {
  /** Plaintext snippet shown in the inbox preview. Keep under 90 chars. */
  preheader: string;
  /** URL appended to the footer for one-click unsubscribe (CAN-SPAM). */
  unsubscribeUrl: string;
  children: ReactNode;
}

export function EmailShell({ preheader, unsubscribeUrl, children }: ShellProps) {
  return (
    <html>
      <head />
      <body
        style={{
          margin: 0,
          padding: 0,
          background: COLORS.bg,
          fontFamily: FONT,
          color: COLORS.body,
        }}
      >
        {/* Hidden preheader — shows next to subject in Gmail/Outlook inbox */}
        <div
          style={{
            display: "none",
            visibility: "hidden",
            opacity: 0,
            color: "transparent",
            height: 0,
            width: 0,
            overflow: "hidden",
          }}
        >
          {preheader}
        </div>

        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          width="100%"
          style={{ background: COLORS.bg, padding: "32px 0" }}
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                width="560"
                style={{
                  background: COLORS.card,
                  borderRadius: 18,
                  boxShadow: "0 2px 4px rgba(15,23,42,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <tr>
                  <td style={{ padding: "28px 36px 0" }}>
                    <BrandMark />
                  </td>
                </tr>

                {/* Body slot */}
                <tr>
                  <td style={{ padding: "24px 36px 8px" }}>{children}</td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      padding: "20px 36px 28px",
                      borderTop: `1px solid ${COLORS.border}`,
                      fontSize: 11,
                      color: COLORS.dim,
                      textAlign: "center",
                    }}
                  >
                    © TerminalSync · terminalsync.ai ·{" "}
                    <a
                      href={unsubscribeUrl}
                      style={{
                        color: COLORS.dim,
                        textDecoration: "underline",
                      }}
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

function BrandMark() {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0}>
      <tr>
        <td>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg,#2563eb,#0284c7)",
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
            color: COLORS.ink,
          }}
        >
          TerminalSync
        </td>
      </tr>
    </table>
  );
}

// ── Reusable bits ─────────────────────────────────────────────────────────

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1
      style={{
        margin: 0,
        fontSize: 26,
        lineHeight: 1.15,
        color: COLORS.ink,
        fontWeight: 600,
      }}
    >
      {children}
    </h1>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        marginTop: 14,
        marginBottom: 0,
        fontSize: 15,
        lineHeight: 1.55,
      }}
    >
      {children}
    </p>
  );
}

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: "24px 0 4px" }}
    >
      <tr>
        <td>
          <a
            href={href}
            style={{
              display: "inline-block",
              background: COLORS.accent,
              color: "#ffffff",
              textDecoration: "none",
              padding: "12px 22px",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  );
}

export function Callout({
  variant,
  children,
}: {
  variant: "ok" | "warn" | "err";
  children: ReactNode;
}) {
  const palette = {
    ok: { bg: COLORS.okBg, border: COLORS.okBorder, color: COLORS.ok },
    warn: { bg: COLORS.warnBg, border: COLORS.warnBorder, color: COLORS.warn },
    err: { bg: COLORS.errBg, border: COLORS.errBorder, color: COLORS.err },
  }[variant];
  return (
    <div
      style={{
        marginTop: 22,
        padding: 14,
        borderRadius: 10,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.color,
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  );
}

export function Signoff() {
  return (
    <p style={{ marginTop: 24, fontSize: 14 }}>
      <strong>Juan</strong>
      <br />
      <span style={{ color: COLORS.muted }}>Fundador, TerminalSync.ai</span>
    </p>
  );
}
