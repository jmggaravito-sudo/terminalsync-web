interface Props {
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
    >
      <rect x="3"  y="3"  width="43" height="43" rx="10" fill="#c9705a" />
      <rect x="54" y="3"  width="43" height="43" rx="10" fill="#2aa87d" />
      <rect x="3"  y="54" width="43" height="43" rx="10" fill="#5b7fe8" />
      <rect x="54" y="54" width="43" height="43" rx="10" fill="#6d3bf5" />
    </svg>
  );
}
