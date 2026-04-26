"use client";
import { useState } from "react";

/** Displays a skill logo. Hides itself cleanly if the SVG is missing. */
export function SkillLogo({
  src,
  size = 28,
  className,
}: {
  src: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
