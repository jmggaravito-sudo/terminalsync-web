import { ImageResponse } from "next/og";
import { getSkill } from "@/lib/skills";

export const runtime = "nodejs";
export const alt = "Skill · Terminal Sync";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { lang: string; slug: string };
}

// Per-skill OG image — what shows up when the skill landing is shared on
// X / LinkedIn / iMessage. Each skill becomes a visually distinct preview
// instead of the generic site card. Compounds the SEO/SEM effort for
// every individual marketplace listing.
export default async function SkillOG({ params }: Props) {
  const { lang, slug } = params;
  const skill = await getSkill(lang, slug);

  // Fallback: skill went 404 → generic-but-on-brand card
  const name = skill?.name ?? "Skill";
  const tagline = skill?.tagline ?? "Skills for Claude Code & Codex";
  const category = skill?.category ?? "skill";
  const vendors = skill?.vendors ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0b0f17 0%, #141923 50%, #1a1208 100%)",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top bar — TS logo + "Skill" badge */}
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
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: "#0b1120",
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: "#ffffff",
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: "#f5b391",
                }}
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
              background: "linear-gradient(135deg, rgba(232,148,109,0.18), rgba(200,90,58,0.18))",
              border: "1px solid rgba(232,148,109,0.4)",
              borderRadius: 999,
              fontSize: 14,
              color: "#f5b391",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            ✦ Skill
          </div>
        </div>

        {/* Center — skill name + tagline */}
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

        {/* Bottom — vendor badges + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {vendors.includes("claude") && (
              <VendorBadge label="Claude" color="#c85a3a" bg="rgba(200,90,58,0.18)" />
            )}
            {vendors.includes("codex") && (
              <VendorBadge label="Codex" color="#10a37f" bg="rgba(16,163,127,0.18)" />
            )}
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#94a3b8",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            terminalsync.ai/{lang}/skills/{slug}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function VendorBadge({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        padding: "10px 20px",
        background: bg,
        border: `1px solid ${color}`,
        borderRadius: 14,
        fontSize: 18,
        color,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
      }}
    >
      {label}
    </div>
  );
}
