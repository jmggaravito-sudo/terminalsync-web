import { ImageResponse } from "next/og";
import { getSkill } from "@/lib/skills";

// fs reads in getSkill require nodejs; edge runtime can't reach process.cwd().
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export default async function SkillOG({ params }: Props) {
  const { lang, slug } = await params;
  const skill = await getSkill(lang, slug);
  const isEs = lang === "es";

  const name = skill?.name ?? slug;
  const tagline = skill?.tagline ?? "";
  const vendors = skill?.vendors ?? ["claude"];
  const category = skill?.category ?? "skill";

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
        {/* Subtle grid texture for depth */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 90% -10%, rgba(37,99,235,0.12), transparent 50%), radial-gradient(circle at -10% 110%, rgba(232,148,109,0.18), transparent 50%)",
            display: "flex",
          }}
        />

        {/* Brand */}
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
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#0b1733" }}>TerminalSync</div>
            <div
              style={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                color: "#c85a3a",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              Marketplace · Skill
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
            <div
              style={{
                fontSize: 16,
                fontFamily: "JetBrains Mono, monospace",
                color: "#2563eb",
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {category}
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 88,
                fontWeight: 600,
                color: "#0b1733",
                lineHeight: 1.0,
                letterSpacing: -2,
              }}
            >
              {name}
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 30,
                color: "#4b5563",
                lineHeight: 1.3,
                maxWidth: 920,
              }}
            >
              {tagline}
            </div>
          </div>
        </div>

        {/* Footer — vendors + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {vendors.map((v) => (
              <div
                key={v}
                style={{
                  padding: "8px 18px",
                  background: "#0b1733",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {v}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#6b7280",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {`terminalsync.ai/${isEs ? "es" : "en"}/skills/${slug}`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
