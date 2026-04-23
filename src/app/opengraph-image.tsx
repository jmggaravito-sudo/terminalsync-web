import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TerminalSync — Lleva tu Claude Code a cualquier parte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #fff1eb 100%)",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "linear-gradient(135deg, #2563eb, #0284c7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px -10px rgba(37,99,235,0.5)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#fff",
              }}
            />
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, color: "#0b1733" }}>
            TerminalSync
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          <div
            style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}
          >
            <div
              style={{
                fontSize: 18,
                color: "#c85a3a",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              AI Power-Ups · Official with Anthropic
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 76,
                fontWeight: 600,
                color: "#0b1733",
                lineHeight: 1.04,
                letterSpacing: -1,
              }}
            >
              Lleva tu{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #c85a3a, #e8946d)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Claude Code
              </span>
              <br />a cualquier parte.
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 24,
                color: "#4b5563",
                lineHeight: 1.35,
                maxWidth: 800,
              }}
            >
              Sincroniza tus terminales, archivos y el contexto de tu IA entre
              computadoras al instante.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 18,
            color: "#6b7280",
          }}
        >
          <div
            style={{
              padding: "10px 22px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 22,
            }}
          >
            Descargar Gratis
          </div>
          <div
            style={{
              padding: "10px 22px",
              background: "rgba(15,23,42,0.06)",
              color: "#0b1733",
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 22,
            }}
          >
            terminalsync.ai
          </div>
        </div>
      </div>
    ),
    size,
  );
}
