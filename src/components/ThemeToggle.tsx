"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

type Choice = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE = "terminalsync:theme";

function resolve(c: Choice): Resolved {
  if (c === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return c;
}

function apply(r: Resolved) {
  if (r === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = r;
}

export function ThemeToggle({
  labels,
}: {
  labels: { light: string; dark: string; system: string };
}) {
  const [choice, setChoice] = useState<Choice>("system");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE) as Choice | null) ?? "system";
    setChoice(saved);
  }, []);

  function change(next: Choice) {
    setChoice(next);
    localStorage.setItem(STORAGE, next);
    apply(resolve(next));
  }

  const options: { id: Choice; Icon: typeof Sun; label: string }[] = [
    { id: "light", Icon: Sun, label: labels.light },
    { id: "dark", Icon: Moon, label: labels.dark },
    { id: "system", Icon: Monitor, label: labels.system },
  ];

  return (
    <div
      className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] p-0.5"
      role="radiogroup"
    >
      {options.map(({ id, Icon, label }) => {
        const active = choice === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => change(id)}
            title={label}
            className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
              active
                ? "bg-[var(--color-accent)]/12 text-[var(--color-accent)]"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]"
            }`}
          >
            <Icon size={12} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
