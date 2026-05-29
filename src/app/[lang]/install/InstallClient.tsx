"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, Zap, ExternalLink, AlertCircle } from "lucide-react";

interface SkillPayload {
  vendor: "claude";
  name: string;
  files: Record<string, string>; // base64
}

type Props =
  | {
      lang: string;
      kind: "skill";
      name: string;
      tagline: string;
      logo: string;
      skillPayload: SkillPayload;
    }
  | {
      lang: string;
      kind: "connector";
      name: string;
      tagline: string;
      logo: string;
      connectorSlug: string;
    };

/**
 * Install flow for skills + connectors.
 *
 * Skills: build a base64 payload server-side, fire the
 * `terminalsync://install?type=skill&payload=...` deep-link. TS writes it.
 *
 * Connectors: render an env-vars form (token, API key, etc.) for the user to
 * fill, then fire `terminalsync://install?type=connector&slug=...&env=...`.
 *
 * Fallback: if TS isn't installed, deep-link silently fails — we surface a
 * "Download Terminal Sync first" hint after a 3s timeout.
 */
export function InstallClient(props: Props) {
  const { lang } = props;
  const [step, setStep] = useState<"intro" | "form" | "launching" | "fallback">(
    "intro",
  );
  const [envValues, setEnvValues] = useState<Record<string, string>>({});

  const t = {
    back: lang === "es" ? "Volver" : "Back",
    intro:
      lang === "es"
        ? `Vamos a instalar ${props.name} en tu Terminal Sync.`
        : `We're about to install ${props.name} in your Terminal Sync.`,
    introBody:
      lang === "es"
        ? "Tu Terminal Sync se va a abrir, vas a confirmar la instalación, y la skill quedará disponible en todas tus máquinas. Cifrada en tu Drive."
        : "Terminal Sync will open, you confirm the install, and the skill is available on every machine. Encrypted in your Drive.",
    introBodyConn:
      lang === "es"
        ? "Necesitamos que ingreses el token de autenticación. Una vez instalado, el conector queda disponible en todas tus máquinas. Cifrado end-to-end."
        : "We need you to enter the sign-in token. Once installed, the connector is available on every machine. End-to-end encrypted.",
    install: lang === "es" ? "Instalar ahora" : "Install now",
    next: lang === "es" ? "Siguiente" : "Next",
    download: lang === "es" ? "Bajar standalone" : "Download standalone",
    notInstalled:
      lang === "es"
        ? "Parece que Terminal Sync no se abrió. ¿Lo tenés instalado?"
        : "Looks like Terminal Sync didn't open. Do you have it installed?",
    getTs:
      lang === "es" ? "Bajar Terminal Sync" : "Download Terminal Sync",
    launching:
      lang === "es"
        ? "Abriendo Terminal Sync…"
        : "Launching Terminal Sync…",
    launchingBody:
      lang === "es"
        ? "Si la app no se abre en unos segundos, asegurate de tenerla instalada."
        : "If the app doesn't open in a few seconds, make sure it's installed.",
    done: lang === "es" ? "Listo." : "All set.",
    doneBody:
      lang === "es"
        ? "Terminal Sync recibió la instalación. Confirmá adentro de la app."
        : "Terminal Sync received the install. Confirm inside the app.",
    envHeader:
      lang === "es" ? "Datos del conector" : "Connector credentials",
    envBody:
      lang === "es"
        ? "Estos valores se cifran y nunca tocan nuestros servidores — viajan directo del navegador a Terminal Sync."
        : "These values are encrypted and never touch our servers — they go straight from your browser to Terminal Sync.",
  };

  function fireSkillInstall() {
    if (props.kind !== "skill") return;
    const payloadJson = JSON.stringify(props.skillPayload);
    const payloadB64 = btoa(unescape(encodeURIComponent(payloadJson)));
    const url = `terminalsync://install?type=skill&slug=${encodeURIComponent(
      props.skillPayload.name,
    )}&payload=${encodeURIComponent(payloadB64)}`;
    setStep("launching");
    window.location.href = url;
    setTimeout(() => setStep("fallback"), 3500);
  }

  function fireConnectorInstall() {
    if (props.kind !== "connector") return;
    const envJson = JSON.stringify(envValues);
    const envB64 = btoa(unescape(encodeURIComponent(envJson)));
    const url = `terminalsync://install?type=connector&slug=${encodeURIComponent(
      props.connectorSlug,
    )}&env=${encodeURIComponent(envB64)}`;
    setStep("launching");
    window.location.href = url;
    setTimeout(() => setStep("fallback"), 3500);
  }

  // Hardcoded env schema per connector for the simulation. In a real build
  // this comes from the connector MD frontmatter or a JSON manifest.
  const envSchema = props.kind === "connector" ? envSchemaFor(props.connectorSlug) : [];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-2xl px-6 pt-20 pb-32">
        <Link
          href={
            props.kind === "skill"
              ? `/${lang}/skills/${("skillPayload" in props ? props.skillPayload.name : "")}`
              : `/${lang}/connectors/${"connectorSlug" in props ? props.connectorSlug : ""}`
          }
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          {t.back}
        </Link>

        <header className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.logo} alt="" width={36} height={36} className="h-9 w-9" onError={(e) => (e.currentTarget.style.display = "none")} />
          </div>
          <div>
            <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight leading-tight">
              {props.name}
            </h1>
            <p className="text-[13px] text-[var(--color-fg-muted)]">
              {props.tagline}
            </p>
          </div>
        </header>

        {step === "intro" && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
            <p className="text-[15px] text-[var(--color-fg)] leading-relaxed">
              {t.intro}
            </p>
            <p className="mt-3 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
              {props.kind === "skill" ? t.introBody : t.introBodyConn}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (props.kind === "skill") fireSkillInstall();
                  else setStep("form");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white px-5 py-3 text-[14px] font-semibold transition-colors"
              >
                <Zap size={15} />
                {props.kind === "connector" ? t.next : t.install}
              </button>
              <button
                type="button"
                onClick={() => alert("standalone download not yet wired")}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 px-5 py-3 text-[14px] font-medium transition-colors"
              >
                <Download size={15} />
                {t.download}
              </button>
            </div>
          </div>
        )}

        {step === "form" && props.kind === "connector" && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
            <h2 className="text-[16px] font-semibold tracking-tight">
              {t.envHeader}
            </h2>
            <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
              {t.envBody}
            </p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                fireConnectorInstall();
              }}
            >
              {envSchema.map((field) => (
                <div key={field.key}>
                  <label className="block text-[12px] font-mono uppercase tracking-[0.1em] text-[var(--color-fg-dim)]">
                    {field.label}
                  </label>
                  <input
                    type={field.secret ? "password" : "text"}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={envValues[field.key] || ""}
                    onChange={(e) =>
                      setEnvValues({ ...envValues, [field.key]: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-[13.5px] font-mono focus:border-[var(--color-accent)] focus:outline-none"
                  />
                  {field.help && (
                    <p className="mt-1 text-[11px] text-[var(--color-fg-dim)]">
                      ↳ {field.help}
                    </p>
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white px-5 py-3 text-[14px] font-semibold transition-colors"
              >
                <Zap size={15} />
                {t.install}
              </button>
            </form>
          </div>
        )}

        {step === "launching" && (
          <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-6">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center shrink-0">
                <Zap size={14} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight">
                  {t.launching}
                </h2>
                <p className="mt-1 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
                  {t.launchingBody}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "fallback" && (
          <div className="rounded-2xl border border-[var(--color-warn)]/40 bg-[var(--color-warn)]/5 p-6">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-[var(--color-warn)]/15 text-[var(--color-warn)] flex items-center justify-center shrink-0">
                <AlertCircle size={14} />
              </div>
              <div className="flex-1">
                <h2 className="text-[15px] font-semibold tracking-tight">
                  {t.notInstalled}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/${lang}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white px-4 py-2 text-[13px] font-semibold transition-colors"
                  >
                    <ExternalLink size={14} />
                    {t.getTs}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-panel)]/50 p-5">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-[var(--color-ok)]/10 text-[var(--color-ok)] flex items-center justify-center shrink-0 mt-0.5">
              <Check size={14} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-tight">
                {lang === "es" ? "Cómo funciona" : "How it works"}
              </h3>
              <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
                {lang === "es"
                  ? "El payload viaja del navegador → Terminal Sync vía un deep-link. Tus credenciales nunca tocan nuestros servidores. Una vez confirmás dentro de TS, todo queda en tu Drive cifrado."
                  : "The payload goes browser → Terminal Sync via a deep-link. Your credentials never touch our servers. Once you confirm inside TS, everything sits in your Drive encrypted."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

interface EnvField {
  key: string;
  label: string;
  placeholder: string;
  secret: boolean;
  required: boolean;
  help?: string;
}

/** Hardcoded simulation schema — replace with manifest lookup when ready. */
function envSchemaFor(slug: string): EnvField[] {
  switch (slug) {
    case "notion":
      return [
        {
          key: "NOTION_TOKEN",
          label: "Notion API Token",
          placeholder: "secret_...",
          secret: true,
          required: true,
          help: "From notion.so/profile/integrations — paste the Internal Integration Secret.",
        },
      ];
    case "supabase":
      return [
        {
          key: "SUPABASE_URL",
          label: "Project URL",
          placeholder: "https://xxxx.supabase.co",
          secret: false,
          required: true,
        },
        {
          key: "SUPABASE_ANON_KEY",
          label: "Anon Key",
          placeholder: "eyJ...",
          secret: true,
          required: true,
        },
      ];
    case "airtable":
      return [
        {
          key: "AIRTABLE_API_KEY",
          label: "Airtable Personal Access Token",
          placeholder: "patXXXX...",
          secret: true,
          required: true,
        },
      ];
    case "gmail":
    case "google-drive":
      return [];
    default:
      return [
        {
          key: "API_KEY",
          label: "access key",
          placeholder: "...",
          secret: true,
          required: true,
        },
      ];
  }
}
