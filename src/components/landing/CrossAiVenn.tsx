import { Sparkles, Check } from "lucide-react";
import type { Dict } from "@/content";

/**
 * CrossAiVenn — three-circle Venn diagram pitching what TerminalSync
 * shares across Claude, Codex and Gemini at the same time. Sits
 * between MultiAI ("you have 3 AIs") and MemoryPersistent ("they
 * remember together") so the visual lands the moat in one image.
 *
 * Layout:
 *   - Header (eyebrow + title + subtitle)
 *   - SVG Venn: three overlapping circles with brand colors, labels
 *     on top of each circle, "TerminalSync" baked into the central
 *     intersection
 *   - Big "shared" card with the 7 things alive in all three at once
 *   - Row of 3 small cards: per-AI unique features (so the visitor
 *     understands the circles aren't equal — each agent still has
 *     its own signature strengths, TS just makes the overlap usable)
 */
export function CrossAiVenn({ dict }: { dict: Dict }) {
  const c = dict.crossAi;

  // Brand-ish hues. Kept inline (not theme tokens) because each one
  // anchors a specific AI vendor — Claude orange, Codex green, Gemini
  // blue — and the visual identity is part of the message.
  const CLAUDE = "#D97706"; // amber-600 — anthropic-ish
  const CODEX = "#10A37F"; // emerald — openai-ish
  const GEMINI = "#4285F4"; // blue — google-ish

  // Three circles arranged in a classic Venn:
  //   - Claude on top
  //   - Codex bottom-left
  //   - Gemini bottom-right
  // Radius / centers tuned so the central triple-intersection is wide
  // enough to fit the "TerminalSync" label without crowding.
  const R = 140;
  const cx1 = 300;
  const cy1 = 175;
  const cx2 = 215;
  const cy2 = 330;
  const cx3 = 385;
  const cy3 = 330;

  return (
    <section
      id="cross-ai"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          <Sparkles size={11} strokeWidth={2.4} />
          {c.eyebrow}
        </span>
        <h2
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {c.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {c.subtitle}
        </p>
      </div>

      {/* SVG Venn — purely decorative, all info also lives in the
          cards below for screen readers + small viewports. */}
      <div className="mt-10 flex justify-center">
        <svg
          viewBox="0 0 600 500"
          className="w-full max-w-[520px] h-auto"
          role="img"
          aria-label={c.title}
        >
          <defs>
            {/* Soft fills — translucent so the triple-overlap visibly
                darkens to mark the "shared" zone. */}
            <radialGradient id="g-claude" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor={CLAUDE} stopOpacity="0.32" />
              <stop offset="100%" stopColor={CLAUDE} stopOpacity="0.18" />
            </radialGradient>
            <radialGradient id="g-codex" cx="50%" cy="55%" r="65%">
              <stop offset="0%" stopColor={CODEX} stopOpacity="0.32" />
              <stop offset="100%" stopColor={CODEX} stopOpacity="0.18" />
            </radialGradient>
            <radialGradient id="g-gemini" cx="50%" cy="55%" r="65%">
              <stop offset="0%" stopColor={GEMINI} stopOpacity="0.32" />
              <stop offset="100%" stopColor={GEMINI} stopOpacity="0.18" />
            </radialGradient>
          </defs>

          {/* Circles */}
          <circle
            cx={cx1}
            cy={cy1}
            r={R}
            fill="url(#g-claude)"
            stroke={CLAUDE}
            strokeWidth="2.5"
            strokeOpacity="0.85"
          />
          <circle
            cx={cx2}
            cy={cy2}
            r={R}
            fill="url(#g-codex)"
            stroke={CODEX}
            strokeWidth="2.5"
            strokeOpacity="0.85"
          />
          <circle
            cx={cx3}
            cy={cy3}
            r={R}
            fill="url(#g-gemini)"
            stroke={GEMINI}
            strokeWidth="2.5"
            strokeOpacity="0.85"
          />

          {/* Per-AI labels — placed in the outer (non-overlapping)
              area of each circle. */}
          <text
            x={cx1}
            y={cy1 - R + 28}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Inter, sans-serif"
            fontSize="20"
            fontWeight="700"
            fill={CLAUDE}
          >
            {c.diagram.claude}
          </text>
          <text
            x={cx2 - 38}
            y={cy2 + R - 18}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Inter, sans-serif"
            fontSize="20"
            fontWeight="700"
            fill={CODEX}
          >
            {c.diagram.codex}
          </text>
          <text
            x={cx3 + 38}
            y={cy3 + R - 18}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Inter, sans-serif"
            fontSize="20"
            fontWeight="700"
            fill={GEMINI}
          >
            {c.diagram.gemini}
          </text>

          {/* Center intersection: "TerminalSync" in the triple-overlap
              zone. The visual centroid of three equal circles arranged
              like this sits roughly at (300, 278). */}
          <text
            x="300"
            y="270"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Inter, sans-serif"
            fontSize="20"
            fontWeight="800"
            fill="currentColor"
            className="text-[var(--color-fg-strong)]"
          >
            TerminalSync
          </text>
          <text
            x="300"
            y="295"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="11"
            letterSpacing="0.12em"
            fill="currentColor"
            className="text-[var(--color-fg-muted)] uppercase"
          >
            {c.diagram.intersectionHint}
          </text>
        </svg>
      </div>

      {/* Shared list — the payoff. Big card, accent border. */}
      <div className="mt-10 mx-auto max-w-3xl rounded-2xl border-2 border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-6 md:p-8">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)]">
            {c.shared.label}
          </span>
        </div>
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {c.shared.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[13.5px] text-[var(--color-fg)] leading-relaxed"
            >
              <Check
                size={14}
                strokeWidth={2.8}
                className="text-[var(--color-accent)] mt-0.5 shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Per-AI unique items — three smaller cards underneath, color-
          coded to match the SVG. */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <UniqueCard
          title={c.unique.claude.title}
          items={c.unique.claude.items}
          accent={CLAUDE}
        />
        <UniqueCard
          title={c.unique.codex.title}
          items={c.unique.codex.items}
          accent={CODEX}
        />
        <UniqueCard
          title={c.unique.gemini.title}
          items={c.unique.gemini.items}
          accent={GEMINI}
        />
      </div>
    </section>
  );
}

function UniqueCard({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <article
      className="rounded-2xl border bg-[var(--color-panel)] p-5"
      style={{ borderColor: `${accent}40` }}
    >
      <div
        className="text-[11px] font-mono uppercase tracking-[0.14em] mb-3"
        style={{ color: accent }}
      >
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-[12.5px] text-[var(--color-fg)] leading-relaxed"
          >
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
