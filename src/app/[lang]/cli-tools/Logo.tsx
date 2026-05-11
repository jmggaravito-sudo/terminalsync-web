"use client";
import { useState } from "react";

/** Renders a CLI tool's vendor logo (Cloudflare, Stripe, etc.). Falls
 *  back to nothing if the SVG isn't there yet — same pattern as the
 *  SkillLogo / ConnectorLogo. */
export function CliToolLogo({
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
