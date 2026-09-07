"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2, PlusCircle, ExternalLink, Sparkles } from "lucide-react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  SKILL_CATEGORIES,
  CONNECTOR_CATEGORIES,
  PLUGIN_CATEGORIES,
  KIT_CATEGORIES,
  CLI_TOOL_CATEGORIES,
  isValidSlug,
} from "@/lib/marketplace/candidateContent";

type AuthState = "checking" | "anon" | "ready" | "forbidden";
type CandidateType = "skill" | "connector" | "plugin" | "kit" | "cli-tool";

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
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const CONTROL_CLASS =
  "w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-fg)] outline-none";

const TYPE_LABEL: Record<CandidateType, { es: string; en: string }> = {
  skill: { es: "Skill", en: "Skill" },
  connector: { es: "Conector", en: "Connector" },
  plugin: { es: "Plugin", en: "Plugin" },
  kit: { es: "Kit", en: "Kit" },
  "cli-tool": { es: "Herramienta CLI", en: "CLI tool" },
};

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

  if (auth !== "ready") return null;
  return <CandidateForm isEs={isEs} />;
}

function CandidateForm({ isEs }: { isEs: boolean }) {
  const [type, setType] = useState<CandidateType>("skill");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"available" | "soon">("available");
  const [license, setLicense] = useState("");

  const [whenToUse, setWhenToUse] = useState("");
  const [whatItDoes, setWhatItDoes] = useState("");
  const [howToUse, setHowToUse] = useState("");
  const [author, setAuthor] = useState("");

  const [simpleSubtitle, setSimpleSubtitle] = useState("");
  const [simpleBody, setSimpleBody] = useState("");
  const [devBody, setDevBody] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [affiliate, setAffiliate] = useState(false);
  const [npmPackage, setNpmPackage] = useState("");
  const [envKeysRaw, setEnvKeysRaw] = useState("");
  const [tokenHelpUrl, setTokenHelpUrl] = useState("");
  const [originalAuthor, setOriginalAuthor] = useState("");

  const [connectorSlug, setConnectorSlug] = useState("");
  const [skillSlugs, setSkillSlugs] = useState("");
  const [kitItems, setKitItems] = useState("");
  const [audience, setAudience] = useState("");
  const [limits, setLimits] = useState("");

  const [binary, setBinary] = useState("");
  const [installCommand, setInstallCommand] = useState("");
  const [authCommand, setAuthCommand] = useState("");
  const [vendor, setVendor] = useState("");
  const [homepage, setHomepage] = useState("");
  const [repo, setRepo] = useState("");
  const [terminalSyncAdds, setTerminalSyncAdds] = useState("");
  const [commonCommands, setCommonCommands] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);

  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchSources, setResearchSources] = useState<string[]>([]);

  const categories =
    type === "skill"
      ? SKILL_CATEGORIES
      : type === "connector"
        ? CONNECTOR_CATEGORIES
        : type === "plugin"
          ? PLUGIN_CATEGORIES
          : type === "kit"
            ? KIT_CATEGORIES
            : CLI_TOOL_CATEGORIES;

  useEffect(() => {
    if (!(categories as readonly string[]).includes(category)) setCategory("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  /** Aplica la ficha investigada a los campos del formulario. Solo pisa lo
   *  que la sugerencia trae con contenido: si el modelo no encontró el
   *  paquete npm, lo que ya hubiera escrito el dueño se queda. */
  function applySuggestion(s: Record<string, unknown>) {
    const text = (k: string) => (typeof s[k] === "string" ? (s[k] as string) : "");
    const put = (v: string, set: (x: string) => void) => {
      if (v) set(v);
    };

    put(text("name"), setName);
    if (text("slug")) {
      setSlugTouched(true);
      setSlug(text("slug"));
    }
    // La categoría solo entra si es una de las válidas para este tipo — la
    // ruta ya la filtra, pero el select se rompe visualmente con un valor
    // que no está en sus opciones.
    if ((categories as readonly string[]).includes(text("category"))) {
      setCategory(text("category"));
    }
    if (s.status === "available" || s.status === "soon") setStatus(s.status);
    put(text("tagline"), setTagline);
    put(text("license"), setLicense);
    put(text("description"), setDescription);

    put(text("whenToUse"), setWhenToUse);
    put(text("whatItDoes"), setWhatItDoes);
    put(text("howToUse"), setHowToUse);
    put(text("author"), setAuthor);

    put(text("simpleSubtitle"), setSimpleSubtitle);
    put(text("simpleBody"), setSimpleBody);
    put(text("devBody"), setDevBody);
    put(text("ctaUrl"), setCtaUrl);
    if (typeof s.affiliate === "boolean") setAffiliate(s.affiliate);
    put(text("npmPackage"), setNpmPackage);
    if (Array.isArray(s.envKeys) && s.envKeys.length > 0) {
      setEnvKeysRaw(s.envKeys.filter((k) => typeof k === "string").join(", "));
    }
    put(text("tokenHelpUrl"), setTokenHelpUrl);
    put(text("originalAuthor"), setOriginalAuthor);

    put(text("connectorSlug"), setConnectorSlug);
    if (Array.isArray(s.skillSlugs) && s.skillSlugs.length > 0) {
      setSkillSlugs(s.skillSlugs.filter((k) => typeof k === "string").join(", "));
    }
    if (Array.isArray(s.items) && s.items.length > 0) {
      setKitItems(
        s.items
          .map((raw) => {
            const it = raw as { kind?: string; slug?: string; reason?: string };
            return `${it.kind}|${it.slug}|${it.reason}`;
          })
          .join("\n"),
      );
    }
    put(text("audience"), setAudience);
    put(text("limits"), setLimits);

    put(text("binary"), setBinary);
    put(text("installCommand"), setInstallCommand);
    put(text("authCommand"), setAuthCommand);
    put(text("vendor"), setVendor);
    put(text("homepage"), setHomepage);
    put(text("repo"), setRepo);
    put(text("terminalSyncAdds"), setTerminalSyncAdds);
    put(text("commonCommands"), setCommonCommands);
  }

  async function research() {
    setResearchError(null);
    setResearchSources([]);
    if (!name.trim()) {
      return setResearchError(
        isEs
          ? "Escribe el nombre de la herramienta antes de investigar."
          : "Type the tool name before researching.",
      );
    }
    setResearching(true);
    try {
      const res = await authedFetch(
        "/api/admin/integraciones/candidate/suggest",
        { method: "POST", body: JSON.stringify({ name: name.trim(), type }) },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `API ${res.status}`);
      applySuggestion(json.suggestion as Record<string, unknown>);
      setResearchSources(
        Array.isArray(json.sources)
          ? (json.sources as unknown[]).filter(
              (u): u is string => typeof u === "string",
            )
          : [],
      );
    } catch (e) {
      setResearchError(e instanceof Error ? e.message : String(e));
    } finally {
      setResearching(false);
    }
  }

  async function submit() {
    setError(null);
    setResult(null);
    if (!name.trim())
      return setError(isEs ? "Falta el nombre." : "Missing name.");
    if (!slug || !isValidSlug(slug))
      return setError(isEs ? "Slug inválido." : "Invalid slug.");
    if (!category)
      return setError(isEs ? "Elegí una categoría." : "Pick a category.");
    if (!tagline.trim())
      return setError(isEs ? "Falta el tagline." : "Missing tagline.");

    const base = {
      type,
      slug,
      name: name.trim(),
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      status,
      license: license.trim() || undefined,
    };

    let payload: Record<string, unknown>;
    if (type === "connector") {
      payload = {
        ...base,
        simpleSubtitle: simpleSubtitle.trim(),
        simpleBody: simpleBody.trim(),
        devBody: devBody.trim() || undefined,
        ctaUrl: ctaUrl.trim(),
        affiliate,
        npmPackage: npmPackage.trim() || undefined,
        envKeys: envKeysRaw
          .split(",")
          .map((k) => k.trim().toUpperCase())
          .filter(Boolean),
        tokenHelpUrl: tokenHelpUrl.trim() || undefined,
        originalAuthor: originalAuthor.trim() || undefined,
      };
    } else if (type === "plugin") {
      payload = {
        ...base,
        connectorSlug: connectorSlug.trim() || undefined,
        skillSlugs: skillSlugs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        whenToUse: whenToUse.trim(),
        whatItDoes: whatItDoes.trim(),
        howToUse: howToUse.trim(),
        author: author.trim() || undefined,
      };
    } else if (type === "kit") {
      payload = {
        ...base,
        audience: audience.trim(),
        whatItDoes: whatItDoes.trim(),
        howToUse: howToUse.trim(),
        limits: limits.trim(),
        itemsRaw: kitItems,
      };
    } else if (type === "cli-tool") {
      payload = {
        ...base,
        binary: binary.trim(),
        installCommand: installCommand.trim(),
        authCommand: authCommand.trim() || undefined,
        vendor: vendor.trim(),
        homepage: homepage.trim(),
        repo: repo.trim() || undefined,
        whatItDoes: whatItDoes.trim(),
        terminalSyncAdds: terminalSyncAdds.trim(),
        commonCommands: commonCommands.trim(),
      };
    } else {
      payload = {
        ...base,
        whenToUse: whenToUse.trim(),
        whatItDoes: whatItDoes.trim(),
        howToUse: howToUse.trim(),
        author: author.trim() || undefined,
      };
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
    <section className="mx-auto max-w-5xl px-5 pb-16 md:px-6">
      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-6">
        <h2 className="text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {isEs ? "Agregar candidato" : "Add candidate"}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
          {isEs
            ? "Crea un PR draft para Skill, Conector, Plugin, Kit o Herramienta CLI. Queda oculto/pendiente hasta revisión; no publica nada solo."
            : "Opens a draft PR for a Skill, Connector, Plugin, Kit or CLI tool. It stays hidden/pending until review; nothing publishes itself."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 rounded-xl border border-[var(--color-border)] p-1">
          {(["skill", "connector", "plugin", "kit", "cli-tool"] as const).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg px-3 py-1.5 text-[13px] ${type === t ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"}`}
              >
                {TYPE_LABEL[t][isEs ? "es" : "en"]}
              </button>
            ),
          )}
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border-strong)] p-4">
          <p className="text-[13px] text-[var(--color-fg-muted)]">
            {isEs
              ? "Escribe solo el nombre y deja que la IA investigue el resto: sitio oficial, paquete npm, variables de entorno y descripciones. Pre-llena el formulario; tú revisas antes de crear el PR."
              : "Type just the name and let the AI research the rest: official site, npm package, env vars and copy. It pre-fills the form; you review before creating the PR."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void research();
              }}
              placeholder={isEs ? "Ej: Dapta" : "e.g. Dapta"}
              className={`${CONTROL_CLASS} max-w-xs`}
            />
            <button
              type="button"
              onClick={() => void research()}
              disabled={researching}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-[var(--color-accent)] disabled:opacity-50"
            >
              {researching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {researching
                ? isEs
                  ? "Investigando…"
                  : "Researching…"
                : isEs
                  ? "Investigar y pre-llenar con IA"
                  : "Research and pre-fill with AI"}
            </button>
          </div>
          {researchError ? (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-[12.5px] text-red-400">
              {researchError}
            </div>
          ) : null}
          {researchSources.length > 0 ? (
            <div className="mt-3 text-[12px] text-[var(--color-fg-muted)]">
              <span className="font-medium">
                {isEs ? "Fuentes consultadas" : "Sources consulted"}:
              </span>
              <ul className="mt-1 space-y-0.5">
                {researchSources.slice(0, 8).map((u) => (
                  <li key={u}>
                    <a
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="underline break-all"
                    >
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input value={name} onChange={onNameChange} />
          </Field>
          <Field label="Slug">
            <Input
              value={slug}
              onChange={(v) => {
                setSlugTouched(true);
                setSlug(v);
              }}
            />
          </Field>
          <Field label="Categoría">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Elegí…</option>
              {(categories as readonly string[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "available" | "soon")
              }
              className={CONTROL_CLASS}
            >
              <option value="available">available</option>
              <option value="soon">soon</option>
            </select>
          </Field>
          <Field label="Tagline">
            <Input value={tagline} onChange={setTagline} />
          </Field>
          <Field label="Licencia (opcional)">
            <Input value={license} onChange={setLicense} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4">
          {type !== "connector" ? (
            <Field label="Descripción">
              <Textarea value={description} onChange={setDescription} />
            </Field>
          ) : null}

          {type === "connector" ? (
            <ConnectorFields
              {...{
                simpleSubtitle,
                setSimpleSubtitle,
                simpleBody,
                setSimpleBody,
                devBody,
                setDevBody,
                ctaUrl,
                setCtaUrl,
                affiliate,
                setAffiliate,
                npmPackage,
                setNpmPackage,
                envKeysRaw,
                setEnvKeysRaw,
                tokenHelpUrl,
                setTokenHelpUrl,
                originalAuthor,
                setOriginalAuthor,
              }}
            />
          ) : null}

          {type === "skill" || type === "plugin" ? (
            <>
              {type === "plugin" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Conector slug (opcional)">
                    <Input value={connectorSlug} onChange={setConnectorSlug} />
                  </Field>
                  <Field label="Skill slugs (coma)">
                    <Input value={skillSlugs} onChange={setSkillSlugs} />
                  </Field>
                </div>
              ) : null}
              <Field label="Cuándo usarlo">
                <Textarea value={whenToUse} onChange={setWhenToUse} />
              </Field>
              <Field label="Qué hace">
                <Textarea value={whatItDoes} onChange={setWhatItDoes} />
              </Field>
              <Field label="Cómo usarlo">
                <Textarea value={howToUse} onChange={setHowToUse} />
              </Field>
              <Field label="Autor (opcional)">
                <Input value={author} onChange={setAuthor} />
              </Field>
            </>
          ) : null}

          {type === "kit" ? (
            <>
              <Field label="Items del kit">
                <Textarea
                  value={kitItems}
                  onChange={setKitItems}
                  placeholder={
                    "connector|github|Trae PRs y repos\nskill|code-reviewer|Revisa diffs\ncli-tool|github-cli|Permite correr gh"
                  }
                />
              </Field>
              <Field label="Para quién es">
                <Textarea value={audience} onChange={setAudience} />
              </Field>
              <Field label="Qué ayuda a hacer">
                <Textarea value={whatItDoes} onChange={setWhatItDoes} />
              </Field>
              <Field label="Cómo usarlo">
                <Textarea value={howToUse} onChange={setHowToUse} />
              </Field>
              <Field label="Límites">
                <Textarea value={limits} onChange={setLimits} />
              </Field>
            </>
          ) : null}

          {type === "cli-tool" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Binary">
                  <Input value={binary} onChange={setBinary} placeholder="gh" />
                </Field>
                <Field label="Install command">
                  <Input
                    value={installCommand}
                    onChange={setInstallCommand}
                    placeholder="brew install gh"
                  />
                </Field>
                <Field label="Auth command (opcional)">
                  <Input
                    value={authCommand}
                    onChange={setAuthCommand}
                    placeholder="gh auth login"
                  />
                </Field>
                <Field label="Vendor">
                  <Input value={vendor} onChange={setVendor} />
                </Field>
                <Field label="Homepage">
                  <Input value={homepage} onChange={setHomepage} />
                </Field>
                <Field label="Repo (opcional)">
                  <Input value={repo} onChange={setRepo} />
                </Field>
              </div>
              <Field label="Qué hace">
                <Textarea value={whatItDoes} onChange={setWhatItDoes} />
              </Field>
              <Field label="Qué le suma TerminalSync">
                <Textarea
                  value={terminalSyncAdds}
                  onChange={setTerminalSyncAdds}
                />
              </Field>
              <Field label="Comandos típicos">
                <Textarea value={commonCommands} onChange={setCommonCommands} />
              </Field>
            </>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-[13px] text-red-400">
            {error}
          </div>
        ) : null}
        {result ? (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-[13px] text-emerald-300">
            PR draft creado:{" "}
            <a
              href={result.pr_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              <ExternalLink size={13} />#{result.pr_number}
            </a>{" "}
            · <code>{result.path}</code>
          </div>
        ) : null}

        <button
          onClick={() => void submit()}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <PlusCircle size={15} />
          )}
          {busy
            ? isEs
              ? "Creando…"
              : "Creating…"
            : isEs
              ? "Crear candidato (PR draft)"
              : "Create candidate (draft PR)"}
        </button>
      </div>
    </section>
  );
}

function ConnectorFields(props: {
  simpleSubtitle: string;
  setSimpleSubtitle: (v: string) => void;
  simpleBody: string;
  setSimpleBody: (v: string) => void;
  devBody: string;
  setDevBody: (v: string) => void;
  ctaUrl: string;
  setCtaUrl: (v: string) => void;
  affiliate: boolean;
  setAffiliate: (v: boolean) => void;
  npmPackage: string;
  setNpmPackage: (v: string) => void;
  envKeysRaw: string;
  setEnvKeysRaw: (v: string) => void;
  tokenHelpUrl: string;
  setTokenHelpUrl: (v: string) => void;
  originalAuthor: string;
  setOriginalAuthor: (v: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Subtítulo simple">
          <Input
            value={props.simpleSubtitle}
            onChange={props.setSimpleSubtitle}
          />
        </Field>
        <Field label="CTA URL">
          <Input value={props.ctaUrl} onChange={props.setCtaUrl} />
        </Field>
        <Field label="NPM package">
          <Input value={props.npmPackage} onChange={props.setNpmPackage} />
        </Field>
        <Field label="Env keys (coma)">
          <Input value={props.envKeysRaw} onChange={props.setEnvKeysRaw} />
        </Field>
        <Field label="Token help URL">
          <Input value={props.tokenHelpUrl} onChange={props.setTokenHelpUrl} />
        </Field>
        <Field label="Original author">
          <Input
            value={props.originalAuthor}
            onChange={props.setOriginalAuthor}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-[12px] text-[var(--color-fg-muted)]">
        <input
          type="checkbox"
          checked={props.affiliate}
          onChange={(e) => props.setAffiliate(e.target.checked)}
        />
        Solo afiliado / no instalable
      </label>
      <Field label="Descripción negocio">
        <Textarea value={props.simpleBody} onChange={props.setSimpleBody} />
      </Field>
      <Field label="Descripción dev (opcional)">
        <Textarea value={props.devBody} onChange={props.setDevBody} />
      </Field>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-[12px] font-medium text-[var(--color-fg-muted)]">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={CONTROL_CLASS}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className={`${CONTROL_CLASS} min-h-24`}
    />
  );
}
