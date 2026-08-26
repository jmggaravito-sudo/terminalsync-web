"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2, PlusCircle, ExternalLink } from "lucide-react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  SKILL_CATEGORIES,
  CONNECTOR_CATEGORIES,
  isValidSlug,
} from "@/lib/marketplace/candidateContent";

type AuthState = "checking" | "anon" | "ready" | "forbidden";
type CandidateType = "skill" | "connector";

interface SuccessResult {
  pr_url: string;
  pr_number: number;
  branch: string;
  path: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Panel B of /admin/integraciones — "Agregar candidato". Sibling of
 * IntegracionesClient (Panel A, "Correr ahora"). Self-contained: owns its
 * own auth gate rather than sharing state with Panel A, since the two
 * panels are independent features that happen to live on the same page.
 *
 * Submits to POST /api/admin/integraciones/candidate, which opens a draft
 * PR in this same repo adding one content/{skills,connectors}/es/<slug>.md
 * file. See that route + src/lib/marketplace/candidateContent.ts for the
 * exact shape and the safety defaults (catalogReady:false / hidden:true).
 */
export function AgregarCandidatoPanel({ lang }: { lang: string }) {
  const isEs = lang !== "en";
  const [auth, setAuth] = useState<AuthState>("checking");

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setAuth("anon");
      return;
    }
    sb.auth.getSession().then(({ data: { session } }) => {
      setAuth(session ? "ready" : "anon");
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setAuth(session ? "ready" : "anon");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (auth !== "ready") return null; // Panel A already shows the sign-in banner for this page.

  return <CandidateForm isEs={isEs} />;
}

function CandidateForm({ isEs }: { isEs: boolean }) {
  const [type, setType] = useState<CandidateType>("skill");

  // Shared fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("");
  const [tagline, setTagline] = useState("");
  const [status, setStatus] = useState<"available" | "soon">("available");
  const [license, setLicense] = useState("");

  // Skill-only
  const [description, setDescription] = useState("");
  const [whenToUse, setWhenToUse] = useState("");
  const [whatItDoes, setWhatItDoes] = useState("");
  const [howToUse, setHowToUse] = useState("");
  const [author, setAuthor] = useState("");

  // Connector-only
  const [simpleSubtitle, setSimpleSubtitle] = useState("");
  const [simpleBody, setSimpleBody] = useState("");
  const [devBody, setDevBody] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [affiliate, setAffiliate] = useState(false);
  const [npmPackage, setNpmPackage] = useState("");
  const [envKeysRaw, setEnvKeysRaw] = useState("");
  const [tokenHelpUrl, setTokenHelpUrl] = useState("");
  const [originalAuthor, setOriginalAuthor] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);

  const categories = type === "skill" ? SKILL_CATEGORIES : CONNECTOR_CATEGORIES;

  useEffect(() => {
    // Reset category when switching type if it's not valid for the new type.
    if (!categories.includes(category as never)) setCategory("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  const slugValid = slug.length === 0 || isValidSlug(slug);

  async function submit() {
    setError(null);
    setResult(null);

    if (!name.trim()) return setError(isEs ? "Falta el nombre." : "Missing name.");
    if (!slug || !isValidSlug(slug)) {
      return setError(
        isEs
          ? 'Slug inválido. Usá minúsculas, números y guiones (ej: "mi-conector").'
          : 'Invalid slug. Use lowercase letters, numbers and hyphens (e.g. "my-connector").',
      );
    }
    if (!category) return setError(isEs ? "Elegí una categoría." : "Pick a category.");
    if (!tagline.trim()) return setError(isEs ? "Falta el tagline." : "Missing tagline.");

    const payload: Record<string, unknown> =
      type === "skill"
        ? {
            type,
            slug,
            name: name.trim(),
            category,
            tagline: tagline.trim(),
            description: description.trim(),
            whenToUse: whenToUse.trim(),
            whatItDoes: whatItDoes.trim(),
            howToUse: howToUse.trim(),
            author: author.trim() || undefined,
            status,
            license: license.trim() || undefined,
          }
        : {
            type,
            slug,
            name: name.trim(),
            category,
            tagline: tagline.trim(),
            simpleSubtitle: simpleSubtitle.trim(),
            simpleBody: simpleBody.trim(),
            devBody: devBody.trim() || undefined,
            ctaUrl: ctaUrl.trim(),
            affiliate,
            status,
            npmPackage: npmPackage.trim() || undefined,
            envKeys: envKeysRaw
              .split(",")
              .map((k) => k.trim().toUpperCase())
              .filter(Boolean),
            tokenHelpUrl: tokenHelpUrl.trim() || undefined,
            originalAuthor: originalAuthor.trim() || undefined,
            license: license.trim() || undefined,
          };

    if (type === "skill") {
      if (!description.trim()) return setError(isEs ? "Falta la descripción." : "Missing description.");
      if (!whenToUse.trim() || !whatItDoes.trim() || !howToUse.trim()) {
        return setError(
          isEs
            ? 'Completá las 3 secciones: "Cuándo usarlo", "Qué hace", "Cómo usarlo".'
            : 'Fill in all 3 sections: "When to use", "What it does", "How to use".',
        );
      }
    } else {
      if (!simpleSubtitle.trim()) return setError(isEs ? "Falta el subtítulo simple." : "Missing simple subtitle.");
      if (!simpleBody.trim()) return setError(isEs ? "Falta la descripción para el negocio." : "Missing business description.");
      if (!ctaUrl.trim()) return setError(isEs ? "Falta la URL del CTA." : "Missing CTA URL.");
      if (!affiliate && !npmPackage.trim()) {
        return setError(
          isEs
            ? 'Falta el paquete npm (o marcá "solo afiliado" si no se instala).'
            : 'Missing npm package (or check "affiliate only" if it is not installable).',
        );
      }
    }

    setBusy(true);
    try {
      const res = await authedFetch("/api/admin/integraciones/candidate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `API ${res.status}`);
      setResult(json as SuccessResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-5 md:px-6 pb-16">
      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-6">
        <h2 className="text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {isEs ? "Agregar candidato" : "Add candidate"}
        </h2>
        <p className="mt-1.5 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
          {isEs
            ? "Crea un PR draft en este repo con un nuevo skill o connector, listo para revisión. No publica nada solo: el candidato queda oculto del catálogo (catalogReady:false / hidden:true) hasta que alguien lo revise y lo apruebe al mergear."
            : "Opens a draft PR in this repo adding a new skill or connector, ready for review. Nothing goes live on its own: the candidate stays hidden from the catalog (catalogReady:false / hidden:true) until someone reviews it and approves it at merge time."}
        </p>

        <div className="mt-5 inline-flex rounded-xl border border-[var(--color-border)] p-1">
          {(["skill", "connector"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition ${
                type === t
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {t === "skill" ? "Skill" : "Connector"}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={isEs ? "Nombre" : "Name"}>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={type === "skill" ? "1099/W-9 Organizer" : "Airtable"}
              className={inputCls}
            />
          </Field>
          <Field label="Slug" hint={slugValid ? undefined : (isEs ? "kebab-case, ej: mi-conector" : "kebab-case, e.g. my-connector")}>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="mi-conector"
              className={`${inputCls} font-mono`}
            />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={isEs ? "Categoría" : "Category"}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              <option value="">{isEs ? "Elegí…" : "Choose…"}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as "available" | "soon")} className={inputCls}>
              <option value="available">available</option>
              <option value="soon">soon</option>
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Tagline">
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={isEs ? "Una línea corta y clara" : "One short, clear line"}
              className={inputCls}
            />
          </Field>
        </div>

        {type === "skill" ? (
          <>
            <div className="mt-4">
              <Field label={isEs ? "Descripción" : "Description"}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label={isEs ? '"Cuándo usarlo"' : '"When to use"'}>
                <textarea value={whenToUse} onChange={(e) => setWhenToUse(e.target.value)} rows={3} className={inputCls} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label={isEs ? '"Qué hace"' : '"What it does"'}>
                <textarea value={whatItDoes} onChange={(e) => setWhatItDoes(e.target.value)} rows={3} className={inputCls} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label={isEs ? '"Cómo usarlo"' : '"How to use"'}>
                <textarea value={howToUse} onChange={(e) => setHowToUse(e.target.value)} rows={3} className={inputCls} />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={isEs ? "Autor (opcional)" : "Author (optional)"}>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="TerminalSync" className={inputCls} />
              </Field>
              <Field label={isEs ? "Licencia (opcional)" : "License (optional)"}>
                <input value={license} onChange={(e) => setLicense(e.target.value)} placeholder="proprietary" className={inputCls} />
              </Field>
            </div>
            <p className="mt-3 text-[12px] text-[var(--color-fg-dim)]">
              {isEs
                ? 'vendors / compatibleWith: fijo en ["claude", "codex", "gemini"] — la paridad de las 4 IAs (glm hereda de claude) es un requisito, no un default que se pueda achicar acá.'
                : 'vendors / compatibleWith: fixed to ["claude", "codex", "gemini"] — 4-AI parity (glm inherits from claude) is a requirement, not a default you can shrink here.'}
            </p>
          </>
        ) : (
          <>
            <div className="mt-4">
              <Field label={isEs ? "Subtítulo simple (para el negocio)" : "Simple subtitle (for the business)"}>
                <input value={simpleSubtitle} onChange={(e) => setSimpleSubtitle(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label={isEs ? "Descripción para el negocio (cuerpo markdown)" : "Business description (markdown body)"}>
                <textarea value={simpleBody} onChange={(e) => setSimpleBody(e.target.value)} rows={5} className={inputCls} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label={isEs ? "Notas técnicas (opcional)" : "Technical notes (optional)"}>
                <textarea value={devBody} onChange={(e) => setDevBody(e.target.value)} rows={3} className={inputCls} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="CTA URL">
                <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://…" className={inputCls} />
              </Field>
            </div>
            <label className="mt-3 flex items-center gap-2 text-[13px] text-[var(--color-fg)]">
              <input type="checkbox" checked={affiliate} onChange={(e) => setAffiliate(e.target.checked)} />
              {isEs
                ? "Solo afiliado (abre el CTA, no se instala — sin manifest MCP)"
                : "Affiliate only (opens the CTA, not installable — no MCP manifest)"}
            </label>

            {!affiliate ? (
              <>
                <div className="mt-4">
                  <Field label={isEs ? "Paquete npm (npx -y <paquete>)" : "npm package (npx -y <package>)"}>
                    <input value={npmPackage} onChange={(e) => setNpmPackage(e.target.value)} placeholder="airtable-mcp-server" className={`${inputCls} font-mono`} />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field
                    label={isEs ? "Env keys (coma-separadas, opcional — vacío = OAuth)" : "Env keys (comma-separated, optional — empty = OAuth)"}
                  >
                    <input value={envKeysRaw} onChange={(e) => setEnvKeysRaw(e.target.value)} placeholder="AIRTABLE_API_KEY" className={`${inputCls} font-mono`} />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label={isEs ? "Token help URL (opcional)" : "Token help URL (optional)"}>
                    <input value={tokenHelpUrl} onChange={(e) => setTokenHelpUrl(e.target.value)} placeholder="https://…" className={inputCls} />
                  </Field>
                </div>
              </>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={isEs ? "Autor original (opcional)" : "Original author (optional)"}>
                <input value={originalAuthor} onChange={(e) => setOriginalAuthor(e.target.value)} className={inputCls} />
              </Field>
              <Field label={isEs ? "Licencia (opcional)" : "License (optional)"}>
                <input value={license} onChange={(e) => setLicense(e.target.value)} placeholder={affiliate ? "proprietary" : "MIT"} className={inputCls} />
              </Field>
            </div>
          </>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => void submit()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
            {busy
              ? isEs
                ? "Creando…"
                : "Creating…"
              : isEs
                ? "Crear candidato (PR draft)"
                : "Create candidate (draft PR)"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-[13px] text-red-400">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-[13px] text-emerald-400">
            <p className="font-medium">
              {isEs ? `PR #${result.pr_number} creado (draft).` : `PR #${result.pr_number} created (draft).`}
            </p>
            <a
              href={result.pr_url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
            >
              {result.pr_url} <ExternalLink size={13} />
            </a>
            <p className="mt-2 text-[12px] text-[var(--color-fg-dim)]">
              {isEs
                ? `Archivo: ${result.path} — rama ${result.branch}.`
                : `File: ${result.path} — branch ${result.branch}.`}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-[12.5px] font-medium text-[var(--color-fg-muted)]">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-[11px] font-normal text-amber-500">{hint}</span> : null}
    </label>
  );
}
