import { ImageResponse } from "next/og";
import { getConnector } from "@/lib/connectors";

export const runtime = "nodejs";
export const alt = "Connector · Terminal Sync";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { lang: string; slug: string };
}

// Per-connector OG image for social sharing of /[lang]/connectors/<slug>.
// Mirrors the skills card but in a cooler palette + emphasizes the
// install-vs-affiliate state via the badge.
export default async function ConnectorOG({ params }: Props) {
  const { lang, slug } = params;
  const connector = await getConnector(lang, slug);

  const name = connector?.name ?? "Connector";
  const tagline = connector?.tagline ?? "MCP connectors for Claude & Codex";
  const category = connector?.category ?? "connector";
  const isAffiliate = connector?.affiliate === true;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0b0f17 0%, #0a1f2e 50%, #06140e 100%)",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
              <div
                style={{ width: 8, height: 8, borderRadius: 2, background: "#0b1120" }}
              />
              <div
                style={{ width: 8, height: 8, borderRadius: 2, background: "#ffffff" }}
              />
              <div
                style={{ width: 8, height: 8, borderRadius: 2, background: "#f5b391" }}
              />
            </div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>Terminal Sync</div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#94a3b8",
                marginLeft: 12,
              }}
            >
              · {category}
            </div>
          </div>
          <div
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(2,132,199,0.18))",
              border: "1px solid rgba(59,130,246,0.4)",
              borderRadius: 999,
              fontSize: 14,
              color: "#7dd3fc",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            🔌 Connector
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              textAlign: "center",
              maxWidth: 1000,
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "#cbd5e1",
              lineHeight: 1.35,
              textAlign: "center",
              maxWidth: 950,
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                padding: "10px 20px",
                background: isAffiliate
                  ? "rgba(245,158,11,0.18)"
                  : "rgba(34,197,94,0.18)",
                border: isAffiliate
                  ? "1px solid #f59e0b"
                  : "1px solid #22c55e",
                borderRadius: 14,
                fontSize: 18,
                color: isAffiliate ? "#fbbf24" : "#86efac",
                fontWeight: 600,
                display: "flex",
              }}
            >
              {isAffiliate ? "External · Affiliate link" : "MCP install"}
            </div>
            <div
              style={{
                padding: "10px 20px",
                background: "rgba(232,148,109,0.18)",
                border: "1px solid rgba(232,148,109,0.4)",
                borderRadius: 14,
                fontSize: 18,
                color: "#f5b391",
                fontWeight: 600,
                display: "flex",
              }}
            >
              Claude · Codex
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#94a3b8",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            terminalsync.ai/{lang}/connectors/{slug}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
