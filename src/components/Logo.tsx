interface Props {
  size?: number;
  className?: string;
}

// Brand mark: a Royal Blue / Sky gradient tile with three tiny terminal
// chips inside — black, white, rose — echoing the three terminal themes
// we use throughout the product (dark classic, white clean, rosé warm).
export function Logo({ size = 28, className = "" }: Props) {
  // Chip size scales with the container so the triplet stays balanced.
  const chip = Math.max(3, Math.round(size * 0.19));
  const gap = Math.max(1, Math.round(size * 0.06));
  const radius = Math.max(1, Math.round(chip * 0.22));

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-[calc(22%+1px)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-info)] shadow-[0_0_14px_-2px_var(--color-accent-glow)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="inline-flex items-center"
        style={{ gap }}
      >
        <span
          className="block bg-zinc-950 shadow-[0_1px_1px_rgb(0_0_0_/_0.2)]"
          style={{ width: chip, height: chip, borderRadius: radius }}
        />
        <span
          className="block bg-white shadow-[0_1px_1px_rgb(0_0_0_/_0.18)]"
          style={{ width: chip, height: chip, borderRadius: radius }}
        />
        <span
          className="block shadow-[0_1px_1px_rgb(0_0_0_/_0.2)]"
          style={{
            width: chip,
            height: chip,
            borderRadius: radius,
            background: "var(--color-claude-soft)",
          }}
        />
      </span>
    </span>
  );
}
