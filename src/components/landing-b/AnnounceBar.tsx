import type { Dict } from "@/content";

interface Props {
  dict: Dict;
}

export function AnnounceBar({ dict }: Props) {
  const c = dict.landingB?.announceBar;
  if (!c) return null;

  return (
    <div className="w-full bg-[#16121f] text-white text-[12.5px] font-medium text-center py-2 px-4">
      <span className="inline-flex items-center gap-2">
        <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-white">
          {c.badge}
        </span>
        <span>{c.text}</span>
      </span>{" "}
      <a
        href={c.ctaHref}
        className="underline underline-offset-2 hover:no-underline ml-1"
      >
        {c.cta}
      </a>
    </div>
  );
}
