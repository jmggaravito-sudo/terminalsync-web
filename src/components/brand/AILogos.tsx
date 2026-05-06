/**
 * Brand marks for the three AI agents that ship in TerminalSync.
 * Inline SVG so we control sizing + can theme them per-render. Fair-use
 * brand identifiers — small, recognizable, used to communicate
 * compatibility on a marketing surface.
 *
 * - ClaudeMark: Anthropic's stylized burst (warm-orange #d97757)
 * - OpenAIMark: hexagonal flower / knot (currentColor — adapts to theme)
 * - GeminiMark: 4-pointed sparkle with the official blue→purple gradient
 *
 * All SVGs use viewBox 0 0 24 24 so they line up at the same nominal
 * size when rendered at the same `size` prop.
 */
type Props = { size?: number; className?: string; "aria-label"?: string };

export function ClaudeMark({ size = 24, className, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={rest["aria-label"] ?? "Anthropic Claude"}
    >
      {/* 8-arm burst — Anthropic's signature mark, simplified */}
      <g fill="#D97757">
        <path d="M12 1.5 L13.05 9.65 L21 12 L13.05 14.35 L12 22.5 L10.95 14.35 L3 12 L10.95 9.65 Z" />
        <path
          d="M5.4 5.4 L11 10.3 L11 13.7 L5.4 18.6 L11 13.7 L11 10.3 Z"
          fillOpacity="0.55"
        />
        <path
          d="M18.6 5.4 L13 10.3 L13 13.7 L18.6 18.6 L13 13.7 L13 10.3 Z"
          fillOpacity="0.55"
        />
      </g>
    </svg>
  );
}

export function OpenAIMark({ size = 24, className, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={rest["aria-label"] ?? "OpenAI Codex"}
    >
      {/* Simplified hexagonal knot — recognizable at small sizes */}
      <path d="M12 2.5a4.5 4.5 0 0 0-4.4 3.6 4.5 4.5 0 0 0-3 7.6 4.5 4.5 0 0 0 4.4 6.2 4.5 4.5 0 0 0 7 0 4.5 4.5 0 0 0 4.4-6.2 4.5 4.5 0 0 0-3-7.6A4.5 4.5 0 0 0 12 2.5Zm0 1.4a3.1 3.1 0 0 1 2.7 1.55l-2.7 1.56-2.7-1.56A3.1 3.1 0 0 1 12 3.9Zm-5.4 4.95a3.1 3.1 0 0 1 1.4-2.55v3.12L11 11l-3 1.7v-3.85ZM12 8.7l3 1.73v3.46L12 15.6l-3-1.73V10.4Zm5.4 1.7v3.85L14.4 12l3-1.55V8.85Zm-1.4 4.7v3.12a3.1 3.1 0 0 1-2.7 1.55L11 18.4l3-1.73Zm-5.6 0L13.6 18.4 12 19.6a3.1 3.1 0 0 1-2.7-1.55v-3.12L11 12.3Zm-1.4-1.4-3 1.55a3.1 3.1 0 0 1-1.4-2.55Z" />
    </svg>
  );
}

export function GeminiMark({ size = 24, className, ...rest }: Props) {
  // Unique gradient ID per render so multiple instances on the same page
  // don't collide. Stable enough for SSR via the size prop.
  const gradId = `gemini-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={rest["aria-label"] ?? "Google Gemini"}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72F5" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      {/* 4-pointed sparkle, Google's signature shape */}
      <path
        d="M12 1c0 5.5-4.5 10-10 10v2c5.5 0 10 4.5 10 10v0c0-5.5 4.5-10 10-10v-2c-5.5 0-10-4.5-10-10v0Z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}
