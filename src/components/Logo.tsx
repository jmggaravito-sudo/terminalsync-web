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
      <rect x="3"  y="3"  width="43" height="43" rx="10" fill="#d97757" />
      <rect x="54" y="3"  width="43" height="43" rx="10" fill="#10a37f" />
      <rect x="3"  y="54" width="43" height="43" rx="10" fill="#4a7cf0" />
      <rect x="54" y="54" width="43" height="43" rx="10" fill="#6d3bf5" />
    </svg>
  );
}
