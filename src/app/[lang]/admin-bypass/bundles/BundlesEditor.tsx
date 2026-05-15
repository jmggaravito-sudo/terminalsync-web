"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminKey } from "@/lib/marketplace/useAdminKey";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, Trash2 } from "lucide-react";

type Kind = "connector" | "skill" | "cli";

interface BundleItem {
  kind: Kind;
  slug: string;
  sortOrder: number;
}

interface Bundle {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  status: "draft" | "active" | "archived";
  price_cents: number;
  currency: string;
  sample_prompts: string[] | null;
  items: BundleItem[];
}

interface PickerItem {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
}

const KINDS: { kind: Kind; label: string }[] = [
  { kind: "connector", label: "Connectors" },
  { kind: "skill", label: "Skills" },
  { kind: "cli", label: "CLI Tools" },
];

export function BundlesEditor({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const { key, loaded: keyLoaded } = useAdminKey();

  const [bundles, setBundles] = useState<Bundle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<BundleItem[]>([]);
  const [samplePrompts, setSamplePrompts] = useState<string[]>([]);
  const [activeKind, setActiveKind] = useState<Kind>("connector");
  const [picker, setPicker] = useState<Record<Kind, PickerItem[] | undefined>>({
    connector: undefined,
    skill: undefined,
    cli: undefined,
  });
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [savingPrompts, setSavingPrompts] = useState(false);
  const [promptsSavedAt, setPromptsSavedAt] = useState<number | null>(null);

  const t = useMemo(
    () => ({
      missingKey: isEs ? "Falta el ?key= en la URL." : "Missing ?key= URL parameter.",
      loading: isEs ? "Cargando…" : "Loading…",
      noBundles: isEs ? "No hay bundles aún." : "No bundles yet.",
      addItem: isEs ? "Agregar" : "Add",
      remove: isEs ? "Quitar" : "Remove",
      empty: isEs ? "Pack vacío — agregá ítems desde la derecha." : "Empty pack — add items from the right.",
      save: isEs ? "Guardar ítems" : "Save items",
      saving: isEs ? "Guardando…" : "Saving…",
      saved: isEs ? "✓ Guardado" : "✓ Saved",
      pickHint: isEs ? "Click para agregar al pack" : "Click to add to the pack",
      filter: isEs ? "Filtrar…" : "Filter…",
    }),
    [isEs],
  );

  const reloadBundles = useCallback(async () => {
    if (!key) return;
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/admin/bundles?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setBundles(data.bundles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [key]);

  useEffect(() => {
    reloadBundles();
  }, [reloadBundles]);

  // When a bundle is selected, copy its items + sample prompts into local
  // edit state so the form can roundtrip changes without mutating server
  // state on every keystroke.
  useEffect(() => {
    if (!selectedId || !bundles) return;
    const b = bundles.find((x) => x.id === selectedId);
    if (b) {
      setItems(b.items.map((it) => ({ ...it })));
      setSamplePrompts(Array.isArray(b.sample_prompts) ? [...b.sample_prompts] : []);
    }
  }, [selectedId, bundles]);

  // Lazy-load each pillar's picker list the first time its tab is shown.
  useEffect(() => {
    if (picker[activeKind] !== undefined) return;
    if (!key) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/marketplace/admin/picker?kind=${activeKind}&lang=${lang}&key=${encodeURIComponent(key)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        if (!cancelled) {
          setPicker((p) => ({ ...p, [activeKind]: data.items ?? [] }));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Picker error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeKind, key, lang, picker]);

  const addItem = (slug: string) => {
    setItems((prev) => {
      if (prev.some((it) => it.kind === activeKind && it.slug === slug)) return prev;
      return [
        ...prev,
        { kind: activeKind, slug, sortOrder: prev.length },
      ];
    });
  };
  const removeItem = (idx: number) =>
    setItems((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((it, i) => ({ ...it, sortOrder: i })),
    );
  const moveItem = (idx: number, delta: -1 | 1) => {
    setItems((prev) => {
      const next = prev.slice();
      const j = idx + delta;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((it, i) => ({ ...it, sortOrder: i }));
    });
  };

  const save = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/marketplace/admin/bundles?key=${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: selectedId,
            action: "update",
            items: items.map((it, i) => ({ ...it, sortOrder: i })),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setSavedAt(Date.now());
      await reloadBundles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save error");
    } finally {
      setSaving(false);
    }
  };

  const savePrompts = async () => {
    if (!selectedId) return;
    setSavingPrompts(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/marketplace/admin/bundles?key=${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: selectedId,
            action: "update",
            samplePrompts: samplePrompts
              .map((p) => p.trim())
              .filter((p) => p.length > 0),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setPromptsSavedAt(Date.now());
      await reloadBundles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save error");
    } finally {
      setSavingPrompts(false);
    }
  };

  const addPrompt = () => setSamplePrompts((prev) => [...prev, ""]);
  const updatePrompt = (i: number, value: string) =>
    setSamplePrompts((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  const removePrompt = (i: number) =>
    setSamplePrompts((prev) => prev.filter((_, idx) => idx !== i));

  if (!keyLoaded) return null;
  if (!key) return <Notice tone="warn" text={t.missingKey} />;
  if (error) return <Notice tone="error" text={error} />;
  if (!bundles) return <Notice tone="info" text={t.loading} />;
  if (bundles.length === 0) return <Notice tone="info" text={t.noBundles} />;

  const selected = bundles.find((b) => b.id === selectedId);
  const pickerItems = picker[activeKind] ?? [];
  const filteredPicker = query
    ? pickerItems.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.slug.toLowerCase().includes(query.toLowerCase()),
      )
    : pickerItems;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
      {/* Bundle list */}
      <aside className="space-y-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)] mb-1">
          {isEs ? "Bundles" : "Bundles"}
        </h2>
        {bundles.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedId(b.id)}
            className={`w-full text-left rounded-xl border p-3 transition-colors ${
              selectedId === b.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8"
                : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-accent)]/40"
            }`}
          >
            <div className="text-[13px] font-semibold tracking-tight truncate">
              {b.name}
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--color-fg-dim)] font-mono uppercase tracking-[0.12em]">
              {b.status} · {b.items.length} {isEs ? "ítems" : "items"}
            </div>
          </button>
        ))}
      </aside>

      {/* Editor */}
      <section>
        {!selected ? (
          <Notice tone="info" text={isEs ? "Elegí un bundle a la izquierda." : "Pick a bundle on the left."} />
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
              <h2 className="text-[16px] font-semibold tracking-tight">{selected.name}</h2>
              <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)]">{selected.tagline}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Selected items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)]">
                    {isEs ? "Ítems del pack" : "Pack items"} ({items.length})
                  </h3>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12px] font-semibold px-3 py-1.5 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <Loader2 size={12} className="animate-spin" strokeWidth={2.4} />
                    ) : (
                      <Check size={12} strokeWidth={2.4} />
                    )}
                    {saving ? t.saving : t.save}
                  </button>
                </div>
                {savedAt && Date.now() - savedAt < 4000 && (
                  <p className="mb-2 text-[11px] font-mono text-[var(--color-ok)]">
                    {t.saved}
                  </p>
                )}
                {items.length === 0 ? (
                  <Notice tone="info" text={t.empty} />
                ) : (
                  <ol className="space-y-1.5">
                    {items.map((it, idx) => (
                      <li
                        key={`${it.kind}:${it.slug}`}
                        className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-2.5 py-1.5"
                      >
                        <span className="inline-flex items-center text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-1.5 py-0.5 rounded-full shrink-0">
                          {it.kind}
                        </span>
                        <code className="flex-1 truncate text-[12px] font-mono text-[var(--color-fg)]">
                          {it.slug}
                        </code>
                        <button
                          onClick={() => moveItem(idx, -1)}
                          disabled={idx === 0}
                          aria-label="Move up"
                          className="text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] disabled:opacity-30"
                        >
                          <ArrowUp size={12} strokeWidth={2.4} />
                        </button>
                        <button
                          onClick={() => moveItem(idx, 1)}
                          disabled={idx === items.length - 1}
                          aria-label="Move down"
                          className="text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] disabled:opacity-30"
                        >
                          <ArrowDown size={12} strokeWidth={2.4} />
                        </button>
                        <button
                          onClick={() => removeItem(idx)}
                          aria-label={t.remove}
                          className="text-[var(--color-fg-dim)] hover:text-red-400"
                        >
                          <Trash2 size={12} strokeWidth={2.4} />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Picker */}
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)] mb-2">
                  {isEs ? "Catálogo" : "Catalog"}
                </h3>
                <div className="flex gap-1 mb-2">
                  {KINDS.map((k) => (
                    <button
                      key={k.kind}
                      onClick={() => setActiveKind(k.kind)}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold tracking-tight transition-colors ${
                        activeKind === k.kind
                          ? "bg-[var(--color-accent)]/12 text-[var(--color-accent)] border border-[var(--color-accent)]/40"
                          : "border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-accent)]/40"
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.filter}
                  className="w-full mb-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2.5 py-1.5 text-[12px] outline-none focus:border-[var(--color-accent)]/60"
                />
                <p className="text-[10.5px] font-mono text-[var(--color-fg-dim)] mb-1">
                  {t.pickHint}
                </p>
                <div className="max-h-[460px] overflow-y-auto space-y-1 pr-1">
                  {picker[activeKind] === undefined ? (
                    <p className="text-[11.5px] text-[var(--color-fg-dim)]">{t.loading}</p>
                  ) : filteredPicker.length === 0 ? (
                    <p className="text-[11.5px] text-[var(--color-fg-dim)]">
                      {isEs ? "Sin resultados." : "No results."}
                    </p>
                  ) : (
                    filteredPicker.map((p) => {
                      const selectedAlready = items.some(
                        (it) => it.kind === activeKind && it.slug === p.slug,
                      );
                      return (
                        <button
                          key={p.slug}
                          onClick={() => addItem(p.slug)}
                          disabled={selectedAlready}
                          className={`w-full flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors text-left ${
                            selectedAlready
                              ? "border-[var(--color-ok)]/40 bg-[var(--color-ok)]/8 opacity-60"
                              : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-accent)]/40"
                          }`}
                        >
                          {selectedAlready ? (
                            <Check size={12} className="text-[var(--color-ok)] shrink-0" strokeWidth={2.4} />
                          ) : (
                            <Plus size={12} className="text-[var(--color-fg-dim)] shrink-0" strokeWidth={2.4} />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-semibold truncate">{p.name}</div>
                            <div className="text-[10.5px] font-mono text-[var(--color-fg-dim)] truncate">
                              {p.slug}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Sample prompts editor — non-programmer-friendly examples
                shown on the public detail page above "what's included". */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)]">
                  {isEs ? "Prompts de ejemplo" : "Sample prompts"} ({samplePrompts.length})
                </h3>
                <button
                  onClick={savePrompts}
                  disabled={savingPrompts}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12px] font-semibold px-3 py-1.5 disabled:opacity-50 transition-colors"
                >
                  {savingPrompts ? (
                    <Loader2 size={12} className="animate-spin" strokeWidth={2.4} />
                  ) : (
                    <Check size={12} strokeWidth={2.4} />
                  )}
                  {savingPrompts
                    ? t.saving
                    : isEs
                      ? "Guardar prompts"
                      : "Save prompts"}
                </button>
              </div>
              {promptsSavedAt && Date.now() - promptsSavedAt < 4000 && (
                <p className="mb-2 text-[11px] font-mono text-[var(--color-ok)]">
                  {t.saved}
                </p>
              )}
              <div className="space-y-2">
                {samplePrompts.length === 0 && (
                  <p className="text-[11.5px] text-[var(--color-fg-dim)]">
                    {isEs
                      ? "Sin prompts. Agregá ejemplos que el usuario pueda copiar y pegar."
                      : "No prompts yet. Add examples the user can copy and paste."}
                  </p>
                )}
                {samplePrompts.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <textarea
                      value={p}
                      onChange={(e) => updatePrompt(i, e.target.value)}
                      rows={2}
                      placeholder={
                        isEs
                          ? "Ej: Listá mis deals abiertos en Salesforce"
                          : "e.g. List my open deals in Salesforce"
                      }
                      className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2.5 py-1.5 text-[12.5px] font-mono outline-none focus:border-[var(--color-accent)]/60 resize-y"
                    />
                    <button
                      onClick={() => removePrompt(i)}
                      type="button"
                      aria-label={t.remove}
                      className="shrink-0 mt-1.5 text-[var(--color-fg-dim)] hover:text-red-400"
                    >
                      <Trash2 size={13} strokeWidth={2.4} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addPrompt}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)]/60 text-[var(--color-fg-muted)] text-[11.5px] font-semibold px-2.5 py-1.5"
                >
                  <Plus size={11} strokeWidth={2.4} />{" "}
                  {isEs ? "Agregar prompt" : "Add prompt"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Notice({
  tone,
  text,
}: {
  tone: "info" | "warn" | "error";
  text: string;
}) {
  const cls =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-400"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
        : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]";
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] ${cls}`}>
      {text}
    </div>
  );
}
