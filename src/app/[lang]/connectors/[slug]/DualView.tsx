"use client";
import { useState } from "react";
import { User, Code2 } from "lucide-react";

interface ViewContent {
  title: string;
  subtitle: string;
  html: string;
}

interface Props {
  labels: { simple: string; dev: string };
  simple: ViewContent;
  dev: ViewContent;
}

export function ConnectorDualView({ labels, simple, dev }: Props) {
  const [view, setView] = useState<"simple" | "dev">("simple");
  const active = view === "simple" ? simple : dev;

  return (
    <div className="mt-8">
      {/* Segmented toggle */}
      <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]">
        <ToggleBtn
          active={view === "simple"}
          onClick={() => setView("simple")}
          icon={<User size={13} />}
          label={labels.simple}
        />
        <ToggleBtn
          active={view === "dev"}
          onClick={() => setView("dev")}
          icon={<Code2 size={13} />}
          label={labels.dev}
        />
      </div>

      {/* Content */}
      <div className="mt-6">
        <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight leading-tight">
          {active.title}
        </h2>
        <p className="mt-2 text-[14.5px] text-[var(--color-fg-muted)] leading-relaxed">
          {active.subtitle}
        </p>
        <div
          className="mt-6 prose prose-sm max-w-none text-[14px] leading-relaxed text-[var(--color-fg)] [&_p]:my-3 [&_strong]:text-[var(--color-fg-strong)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-[var(--color-panel-2)] [&_code]:text-[12.5px] [&_code]:font-mono [&_a]:text-[var(--color-accent)] [&_a:hover]:underline [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:my-1"
          dangerouslySetInnerHTML={{ __html: active.html }}
        />
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
