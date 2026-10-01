import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TS — un espacio para cada trabajo, con IA incluida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #ffffff 0%, #f7f5ff 55%, #edf2ff 100%)",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#ffffff",
              boxShadow: "0 9px 28px -12px rgba(24, 26, 31, 0.24)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "#D97757" }} />
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "#10A37F" }} />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "#4A7CF0" }} />
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "#6D3BF5" }} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#16181d" }}>TS</div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
            <div
              style={{
                fontSize: 19,
                color: "#6D3BF5",
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              ESPACIOS DE TRABAJO PARA EMPRESAS
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 20,
                fontSize: 70,
                fontWeight: 700,
                color: "#16181d",
                lineHeight: 1.06,
                letterSpacing: -2,
              }}
            >
              <span>Un espacio para cada trabajo.</span>
              <span style={{ color: "#6D3BF5" }}>La IA ya viene incluida.</span>
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 24,
                color: "#565b64",
                lineHeight: 1.35,
                maxWidth: 920,
              }}
            >
              Separa clientes, proyectos y departamentos. TS recuerda el contexto
              para que no empieces de cero.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              padding: "12px 22px",
              background: "#6D3BF5",
              color: "#ffffff",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 21,
            }}
          >
            Descargar para Mac
          </div>
          <div
            style={{
              padding: "12px 20px",
              color: "#565b64",
              fontWeight: 600,
              fontSize: 20,
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
