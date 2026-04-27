import { ImageResponse } from "next/og";
import { listConnectors } from "@/lib/connectors";
import { listSkills } from "@/lib/skills";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function MarketplaceOG({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const [connectors, skills] = await Promise.all([
    listConnectors(lang),
    listSkills(lang),
  ]);

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
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 90% -10%, rgba(37,99,235,0.12), transparent 50%), radial-gradient(circle at -10% 110%, rgba(232,148,109,0.18), transparent 50%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #0284c7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              boxShadow: "0 10px 30px -10px rgba(37,99,235,0.5)",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#0b1120" }} />
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ffffff" }} />
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#f5b391" }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, color: "#0b1733" }}>TerminalSync</div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
            <div
              style={{
                fontSize: 18,
                fontFamily: "JetBrains Mono, monospace",
                color: "#c85a3a",
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Marketplace · Claude Code · Codex
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 22,
                fontSize: 80,
                fontWeight: 600,
                color: "#0b1733",
                lineHeight: 1.02,
                letterSpacing: -1.5,
              }}
            >
              <span>
                {isEs
                  ? "Todo lo que extiende a tu IA,"
                  : "Everything that extends your AI,"}
              </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #c85a3a, #e8946d)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {isEs ? "en un solo lugar." : "in one place."}
              </span>
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 26,
                color: "#4b5563",
                lineHeight: 1.35,
                maxWidth: 900,
              }}
            >
              {isEs
                ? "Connectors para tus apps. Skills para tus tareas. Sincronizados en todas tus máquinas."
                : "Connectors for your apps. Skills for your tasks. Synced across every machine."}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <Stat label={isEs ? "connectors" : "connectors"} value={String(connectors.length)} />
            <Stat label="skills" value={String(skills.length)} />
            <Stat label="vendors" value="claude · codex" />
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#6b7280",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {`terminalsync.ai/${isEs ? "es" : "en"}/marketplace`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "10px 18px",
        background: "rgba(11, 23, 51, 0.06)",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#0b1733",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}
