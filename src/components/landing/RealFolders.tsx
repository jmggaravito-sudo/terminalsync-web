import type { Locale } from "@/content";
import { Folder, FileText, FileSpreadsheet, File, Zap } from "lucide-react";

const T = {
  es: {
    eyebrow: "Tus archivos, donde ya viven",
    title: "No vuelvas a subir un archivo dos veces.",
    p1: "Conecta la carpeta de tu proyecto una sola vez. La IA entiende tus documentos, recuerda el contexto y trabaja siempre sobre la versión más reciente — sin que subas nada.",
    p2: "No llevas tus archivos a la IA. TerminalSync lleva la IA hasta donde ya trabajas.",
    chips: ["Conecta una sola vez", "Siempre la última versión", "Nunca pierde el contexto"],
    folderName: "/proyectos/Martínez",
    files: [
      { name: "Propuesta.docx", tag: "v. actual" },
      { name: "Presupuesto.xlsx", tag: "v. actual" },
      { name: "Contrato.pdf", tag: "v. actual" },
    ],
    connectorLabel: "conectada una vez",
    aiCard: "Tu equipo de IAs — lee la última versión, sin subir nada",
    ais: ["Claude", "Codex", "Gemini"],
  },
  en: {
    eyebrow: "Your files, where they already live",
    title: "Never upload a file twice.",
    p1: "Connect your project folder once. The AI understands your documents, remembers the context and always works on the latest version — without you uploading anything.",
    p2: "You don't bring your files to the AI. TerminalSync brings the AI to where you already work.",
    chips: ["Connect once", "Always the latest version", "Never loses context"],
    folderName: "/projects/Martinez",
    files: [
      { name: "Proposal.docx", tag: "latest" },
      { name: "Budget.xlsx", tag: "latest" },
      { name: "Contract.pdf", tag: "latest" },
    ],
    connectorLabel: "connected once",
    aiCard: "Your AI team — reads the latest version, no uploading needed",
    ais: ["Claude", "Codex", "Gemini"],
  },
} as const;

const AI_COLORS = [
  "bg-[var(--color-accent)]/15 text-[var(--color-accent)]",
  "bg-emerald-500/15 text-emerald-400",
  "bg-blue-500/15 text-blue-400",
];

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx")
    return <FileSpreadsheet size={14} className="text-emerald-400 shrink-0" />;
  if (ext === "pdf")
    return <File size={14} className="text-red-400 shrink-0" />;
  return <FileText size={14} className="text-blue-400 shrink-0" />;
}

export function RealFolders({ lang }: { lang: Locale }) {
  const t = T[lang];
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-16 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left: copy */}
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
            {t.eyebrow}
          </span>
          <h2
            className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
          >
            {t.title}
          </h2>
          <p className="mt-4 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
            {t.p1}
          </p>
          <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
            {t.p2}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {t.chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Right: folder visual */}
        <div className="flex flex-col items-center gap-3 select-none">
          {/* Folder card */}
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Folder size={16} className="text-[var(--color-accent)] shrink-0" />
              <span className="text-[13px] font-mono text-[var(--color-fg-strong)] truncate">
                {t.folderName}
              </span>
            </div>
            <div className="space-y-2">
              {t.files.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 bg-[var(--color-panel-2)]/60"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <FileIcon name={f.name} />
                    <span className="text-[12.5px] text-[var(--color-fg)] truncate">
                      {f.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-ok)]/12 text-[var(--color-ok)]">
                    {f.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-5 bg-[var(--color-border)]" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[11px] text-[var(--color-accent)] font-medium">
              <Zap size={10} strokeWidth={2.5} />
              {t.connectorLabel}
            </div>
            <div className="w-px h-5 bg-[var(--color-border)]" />
          </div>

          {/* AI team card */}
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent)]/6 to-transparent p-4">
            <div className="flex gap-2 mb-3">
              {t.ais.map((ai, i) => (
                <span
                  key={ai}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-full ${AI_COLORS[i]}`}
                >
                  {ai}
                </span>
              ))}
            </div>
            <p className="text-[12.5px] text-[var(--color-fg-muted)] leading-snug">
              {t.aiCard}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
