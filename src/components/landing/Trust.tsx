import { Lock, KeyRound, Code2, Shield } from "lucide-react";
import type { Dict } from "@/content";

export function Trust({ dict }: { dict: Dict }) {
  const features = [
    { Icon: Lock, key: "e2ee" as const },
    { Icon: KeyRound, key: "keychain" as const },
    { Icon: Code2, key: "opensource" as const },
    { Icon: Shield, key: "noVendor" as const },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2
            className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
            style={{ fontSize: "clamp(1.5rem, 3.6vw, 2.25rem)" }}
          >
            {dict.trust.title}
          </h2>
          <p className="mt-4 text-[14px] md:text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
            {dict.trust.body}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ok)] bg-[var(--color-ok)]/10 border border-[var(--color-ok)]/25 rounded-full px-3 py-1.5">
            ✓ {dict.trust.guarantee}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {features.map(({ Icon, key }) => (
            <div
              key={key}
              className="lift rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] p-4 flex items-start gap-3"
            >
              <div className="h-9 w-9 rounded-lg bg-[var(--color-ok)]/10 text-[var(--color-ok)] flex items-center justify-center shrink-0">
                <Icon size={16} strokeWidth={2.2} />
              </div>
              <span className="text-[13px] font-medium text-[var(--color-fg-strong)] leading-snug">
                {dict.trust.features[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
