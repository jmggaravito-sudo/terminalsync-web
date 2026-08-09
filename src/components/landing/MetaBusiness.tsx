import { CheckCircle2, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";
import type { Locale } from "@/content";

const COPY = {
  es: {
    eyebrow: "Facebook, Instagram, Meta Ads y WhatsApp",
    title: "Tu negocio en redes, con aprobación antes de cada acción.",
    subtitle:
      "Terminal Sync te ayuda a revisar, preparar y responder en tus canales de Meta. Tú apruebas, Terminal Sync ejecuta: nada se publica, se envía o gasta sin tu confirmación explícita.",
    availableTitle: "Ya disponible en la app",
    permissionsTitle: "Requiere conexión o permisos",
    safetyTitle: "Seguro por diseño",
    safetyBody:
      "No prometemos publicaciones, envíos, activaciones ni gasto automático. Primero ves el borrador, la cuenta, el público, el presupuesto o la respuesta sugerida; después decides si aprobar.",
    approval: "Tú apruebas, Terminal Sync ejecuta.",
    available: [
      "Conectar Facebook e Instagram desde el flujo guiado de Meta.",
      "Preparar publicaciones para Facebook e Instagram con copy, idea visual y checklist de aprobación.",
      "Crear calendarios de contenido semanales para tu negocio.",
      "Preparar ideas de anuncios, copies, audiencias y riesgos antes de invertir.",
    ],
    requires: [
      "Revisar publicaciones recientes cuando tus cuentas de Meta estén conectadas.",
      "Ver campañas activas y gasto solo si tienes permisos de Meta Ads.",
      "Preparar respuestas para comentarios o mensajes sin enviarlas.",
      "Usar WhatsApp o Telegram como puente de seguimiento cuando esté configurado.",
    ],
    useCasesTitle: "Casos de uso reales",
    useCases: [
      "Revisar qué publicaste esta semana y qué señales dejó.",
      "Convertir una promoción en post para Facebook e Instagram.",
      "Armar 5 ideas de anuncios para vender más sin tocar presupuesto.",
      "Detectar campañas que gastan mucho y explicar qué revisar primero.",
      "Responder comentarios de clientes con tono amable, sin publicar la respuesta.",
      "Preparar seguimientos de WhatsApp para prospectos que no cerraron.",
      "Encontrar el contenido que funcionó mejor y reciclarlo en nuevas piezas.",
      "Separar lo urgente: quejas, preguntas de compra, soporte y spam.",
    ],
    preview: {
      title: "Ejemplo de trabajo seguro",
      steps: [
        "Terminal Sync revisa lo permitido o te dice qué conexión falta.",
        "Te muestra resumen, borrador, copy, audiencia o respuesta sugerida.",
        "Tú apruebas explícitamente antes de publicar, enviar o gastar.",
      ],
    },
  },
  en: {
    eyebrow: "Facebook, Instagram, Meta Ads & WhatsApp",
    title: "Your social channels, with approval before every action.",
    subtitle:
      "Terminal Sync helps you review, prepare, and respond across Meta channels. You approve, Terminal Sync executes: nothing is posted, sent, activated, or spent without your explicit confirmation.",
    availableTitle: "Available in the app",
    permissionsTitle: "Requires connection or permissions",
    safetyTitle: "Safe by design",
    safetyBody:
      "We do not promise automatic posting, sending, activation, or spend. First you see the draft, account, audience, budget, or suggested reply; then you decide whether to approve.",
    approval: "You approve, Terminal Sync executes.",
    available: [
      "Connect Facebook and Instagram through the guided Meta flow.",
      "Prepare Facebook and Instagram posts with copy, visual ideas, and an approval checklist.",
      "Create weekly content calendars for your business.",
      "Prepare ad ideas, copy, audiences, and risks before investing.",
    ],
    requires: [
      "Review recent posts when your Meta accounts are connected.",
      "See active campaigns and spend only if you have Meta Ads permissions.",
      "Prepare replies for comments or messages without sending them.",
      "Use WhatsApp or Telegram as a follow-up bridge when configured.",
    ],
    useCasesTitle: "Real use cases",
    useCases: [
      "Review what you posted this week and what signals it left.",
      "Turn a promotion into a Facebook and Instagram post.",
      "Draft 5 ad ideas to sell more without touching budget.",
      "Spot campaigns spending too much and explain what to review first.",
      "Reply to customer comments in a friendly tone without posting the reply.",
      "Prepare WhatsApp follow-ups for leads that did not close.",
      "Find the content that worked best and recycle it into new pieces.",
      "Separate what is urgent: complaints, buying questions, support, and spam.",
    ],
    preview: {
      title: "Example safe workflow",
      steps: [
        "Terminal Sync reads what is allowed or tells you what connection is missing.",
        "It shows a summary, draft, copy, audience, or suggested reply.",
        "You explicitly approve before anything is posted, sent, or spent.",
      ],
    },
  },
} as const;

export function MetaBusiness({ lang }: { lang: Locale }) {
  const t = COPY[lang];

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <div className="rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.10] via-[var(--color-panel)] to-emerald-500/[0.08] p-5 md:p-8 shadow-[0_24px_70px_-40px_rgba(59,130,246,0.75)]">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-300">
              <MessageCircle size={13} />
              {t.eyebrow}
            </span>
            <h2
              className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.05]"
              style={{ fontSize: "clamp(30px, 4.8vw, 54px)" }}
            >
              {t.title}
            </h2>
            <p className="mt-4 max-w-2xl text-[15.5px] md:text-[17px] leading-relaxed text-[var(--color-fg-muted)]">
              {t.subtitle}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck size={17} />
              {t.approval}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 md:p-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-fg-strong)]">
              <LockKeyhole size={15} className="text-emerald-500" />
              {t.safetyTitle}
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-fg-muted)]">
              {t.safetyBody}
            </p>
            <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
                {t.preview.title}
              </div>
              <ol className="mt-3 space-y-3">
                {t.preview.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-[13.5px] leading-relaxed text-[var(--color-fg-muted)]">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-500/10 text-[12px] font-bold text-blue-600 dark:text-blue-300">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <CapabilityList title={t.availableTitle} items={t.available} tone="available" />
          <CapabilityList title={t.permissionsTitle} items={t.requires} tone="requires" />
        </div>

        <div className="mt-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 md:p-6">
          <h3 className="text-[18px] md:text-[20px] font-semibold text-[var(--color-fg-strong)]">
            {t.useCasesTitle}
          </h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {t.useCases.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3 text-[13px] leading-snug text-[var(--color-fg-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilityList({
  title,
  items,
  tone,
}: {
  title: string;
  items: readonly string[];
  tone: "available" | "requires";
}) {
  const color = tone === "available" ? "text-emerald-500" : "text-blue-500";
  const bg = tone === "available" ? "bg-emerald-500/10" : "bg-blue-500/10";

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[13.5px] leading-relaxed text-[var(--color-fg-muted)]">
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${bg} ${color}`}>
              <CheckCircle2 size={13} strokeWidth={2.4} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
