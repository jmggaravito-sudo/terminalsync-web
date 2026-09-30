import type { Dict } from "@/content";

interface Props {
  dict: Dict;
}

export function AnnounceBar({ dict }: Props) {
  const c = dict.landingB?.announceBar;
  if (!c) return null;

  return (
    <div className="w-full bg-[var(--color-accent)] text-white text-[12.5px] font-medium text-center py-2 px-4">
      <span>{c.text}</span>{" "}
      <a
        href={c.ctaHref}
        className="underline underline-offset-2 hover:no-underline ml-1"
      >
        {c.cta}
      </a>
    </div>
  );
}
