"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, CircleDot } from "lucide-react";
import type { Dict } from "@/content";

type ReplyId = "install" | "pricing" | "security";

interface Message {
  id: string;
  author: "agent" | "user" | "system";
  body: string;
  at: number;
}

interface Escalation {
  topic: string | null;
}

const SESSION_STORAGE_KEY = "sync-ai-session-v1";

// Inline form labels — matches the page's lang attribute (set by Next.js [lang] route).
type FormLabels = {
  formTitle: string;
  emailLabel: string;
  problemLabel: string;
  submit: string;
  sending: string;
  received: string;
  errEmail: string;
  errProblem: string;
  errNetwork: string;
};

const FORM_DICT: Record<string, FormLabels> = {
  en: {
    formTitle: "Connect with our team",
    emailLabel: "Your email",
    problemLabel: "Tell us what's happening",
    submit: "Send",
    sending: "Sending…",
    received: "✓ Received. We'll reply to your email within a few hours.",
    errEmail: "Invalid email",
    errProblem: "Please add a bit more detail (min 10 chars)",
    errNetwork: "Couldn't send. Try again in a moment.",
  },
  es: {
    formTitle: "Conectarte con nuestro equipo",
    emailLabel: "Tu email",
    problemLabel: "Cuéntanos qué pasa",
    submit: "Enviar",
    sending: "Enviando…",
    received: "✓ Recibido. Te respondemos al email en pocas horas.",
    errEmail: "Email inválido",
    errProblem: "Por favor da un poco más de detalle (mín. 10 caracteres)",
    errNetwork: "No se pudo enviar. Reintenta en un momento.",
  },
  pt: {
    formTitle: "Falar com nossa equipe",
    emailLabel: "Seu email",
    problemLabel: "Conte o que está acontecendo",
    submit: "Enviar",
    sending: "Enviando…",
    received: "✓ Recebido. Respondemos em poucas horas no email.",
    errEmail: "Email inválido",
    errProblem: "Por favor, dê um pouco mais de detalhes (mín. 10 caracteres)",
    errNetwork: "Não foi possível enviar. Tente novamente.",
  },
};

function formLabels(lang: string): FormLabels {
  const l = (lang || "en").slice(0, 2).toLowerCase();
  return FORM_DICT[l] || FORM_DICT.en;
}

export function AgentWidget({ dict }: { dict: Dict }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", author: "agent", body: dict.agent.greeting, at: Date.now() },
  ]);
  const [usedReplies, setUsedReplies] = useState<Set<ReplyId>>(new Set());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [escalation, setEscalation] = useState<Escalation | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  // Restore (or generate) session id once on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        setSessionId(stored);
      } else {
        const fresh = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem(SESSION_STORAGE_KEY, fresh);
        setSessionId(fresh);
      }
    } catch {
      // localStorage blocked (private mode) — use ephemeral id
      setSessionId(`web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    }
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [messages, open, typing, escalation]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function pushUser(body: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), author: "user", body, at: Date.now() },
    ]);
  }

  function pushAgent(body: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), author: "agent", body, at: Date.now() },
    ]);
  }

  function pushSystem(body: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), author: "system", body, at: Date.now() },
    ]);
  }

  async function callAgent(text: string) {
    setTyping(true);
    setEscalation(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          userLocale:
            (typeof document !== "undefined" && document.documentElement.lang) ||
            navigator.language ||
            "en",
          page:
            typeof window !== "undefined" ? window.location.pathname : "/",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      pushAgent(data.response || dict.agent.replies.fallback);
      if (data.escalated) setEscalation({ topic: data.topic ?? null });
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        try { localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId); } catch {}
      }
    } catch {
      pushAgent(dict.agent.replies.fallback);
    } finally {
      setTyping(false);
    }
  }

  function handleQuickReply(id: ReplyId, label: string) {
    pushUser(label);
    setUsedReplies((prev) => new Set(prev).add(id));
    void callAgent(label);
  }

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");
    void callAgent(text);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={dict.agent.open}
        className={`fixed bottom-5 right-5 md:bottom-6 md:right-6 z-40 h-14 w-14 rounded-full flex items-center justify-center transition-all duration-200 text-white ${
          open
            ? "bg-[var(--color-fg-strong)] hover:bg-[var(--color-fg)] rotate-90"
            : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] hover:-translate-y-0.5"
        }`}
        style={{
          boxShadow: open
            ? "0 10px 30px -10px rgb(15 23 42 / 0.35)"
            : "0 18px 40px -12px var(--color-accent-glow), 0 4px 10px rgb(15 23 42 / 0.08)",
        }}
      >
        {open ? (
          <X size={20} strokeWidth={2.4} />
        ) : (
          <Sparkles size={20} strokeWidth={2.2} />
        )}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[var(--color-ok)] border-2 border-[var(--color-bg)] pulse-dot" />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-4 md:right-6 z-40 w-[calc(100vw-32px)] max-w-[380px] h-[560px] max-h-[calc(100vh-112px)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-floating overflow-hidden flex flex-col origin-bottom-right transition-all duration-200 ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
      >
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent)]/6 to-transparent">
          <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-info)] flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" strokeWidth={2.2} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-ok)] border-2 border-[var(--color-panel)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[var(--color-fg-strong)] truncate">
              {dict.agent.name}
            </div>
            <div className="flex items-center gap-1 text-[10.5px] text-[var(--color-fg-muted)]">
              <CircleDot size={7} className="text-[var(--color-ok)]" fill="currentColor" />
              {dict.agent.tagline}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label={dict.agent.close}
            className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] hover:bg-[var(--color-panel-2)] transition-colors"
          >
            <X size={14} />
          </button>
        </header>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-label={dict.agent.name}
        >
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {typing && <TypingDots label={dict.agent.typing} />}

          {escalation && !typing && (
            <SupportForm
              escalation={escalation}
              sessionId={sessionId}
              lastUserMessage={
                [...messages].reverse().find((m) => m.author === "user")?.body
              }
              onSubmitted={() => {
                setEscalation(null);
                pushSystem(formLabels(document.documentElement.lang).received);
              }}
            />
          )}

          {messages.length <= 2 + usedReplies.size && !escalation && (
            <div className="pt-1.5 flex flex-wrap gap-1.5">
              {dict.agent.quickReplies
                .filter((r) => !usedReplies.has(r.id))
                .map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleQuickReply(r.id, r.label)}
                    className="rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/5 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 px-3 py-1.5 text-[11.5px] font-medium transition-colors"
                  >
                    {r.label}
                  </button>
                ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-3 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg)]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder={dict.agent.placeholder}
            aria-label={dict.agent.placeholder}
            className="flex-1 h-9 px-3 rounded-full bg-[var(--color-panel-2)] border border-[var(--color-border)] text-[12.5px] text-[var(--color-fg)] placeholder-[var(--color-fg-dim)] outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-panel)] focus:ring-4 focus:ring-[var(--color-accent-glow)] transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            aria-label={dict.agent.send}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !typing
                ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white"
                : "bg-[var(--color-panel-2)] text-[var(--color-fg-dim)]"
            }`}
          >
            <Send size={13} strokeWidth={2.2} />
          </button>
        </form>
      </div>
    </>
  );
}

function Bubble({ msg }: { msg: Message }) {
  if (msg.author === "system") {
    return (
      <div className="flex justify-center">
        <div className="rounded-lg border border-[var(--color-ok)]/30 bg-[var(--color-ok)]/8 text-[var(--color-ok)] px-3 py-1.5 text-[11.5px]">
          {msg.body}
        </div>
      </div>
    );
  }
  const isAgent = msg.author === "agent";
  return (
    <div className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug whitespace-pre-wrap ${
          isAgent
            ? "bg-[var(--color-panel-2)] text-[var(--color-fg)] rounded-bl-sm"
            : "bg-[var(--color-accent)] text-white rounded-br-sm"
        }`}
      >
        {msg.body}
      </div>
    </div>
  );
}

function TypingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <div className="inline-flex items-center gap-1 rounded-full bg-[var(--color-panel-2)] px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-fg-dim)] pulse-dot" />
        <span
          className="h-1.5 w-1.5 rounded-full bg-[var(--color-fg-dim)] pulse-dot"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-[var(--color-fg-dim)] pulse-dot"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
      <span className="text-[10px] text-[var(--color-fg-dim)]">{label}</span>
    </div>
  );
}

function SupportForm({
  escalation,
  sessionId,
  lastUserMessage,
  onSubmitted,
}: {
  escalation: Escalation;
  sessionId: string | null;
  lastUserMessage?: string;
  onSubmitted: () => void;
}) {
  const lang =
    (typeof document !== "undefined" ? document.documentElement.lang : "en") ||
    "en";
  const t = formLabels(lang);

  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState(lastUserMessage || "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.errEmail);
      return;
    }
    if (problem.trim().length < 10) {
      setError(t.errProblem);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/agent/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          problem,
          sessionId,
          topicHint: escalation.topic ?? "",
          userLocale: lang,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errs = (data.errors || []).join(", ") || `HTTP ${res.status}`;
        setError(errs);
        return;
      }
      onSubmitted();
    } catch {
      setError(t.errNetwork);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)] p-3 space-y-2.5">
      <div className="text-[12px] font-semibold text-[var(--color-fg-strong)]">
        {t.formTitle}
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        placeholder={t.emailLabel}
        autoComplete="email"
        className="w-full h-8 px-2.5 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[12.5px] text-[var(--color-fg)] placeholder-[var(--color-fg-dim)] outline-none focus:border-[var(--color-accent)]"
      />
      <textarea
        value={problem}
        onChange={(e) => setProblem(e.currentTarget.value)}
        placeholder={t.problemLabel}
        rows={3}
        className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[12.5px] text-[var(--color-fg)] placeholder-[var(--color-fg-dim)] outline-none focus:border-[var(--color-accent)] resize-y"
      />
      {error && (
        <div className="text-[11px] text-[var(--color-danger)]">{error}</div>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
            submitting
              ? "bg-[var(--color-panel)] text-[var(--color-fg-dim)] cursor-not-allowed"
              : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white"
          }`}
        >
          {submitting ? t.sending : t.submit}
        </button>
      </div>
    </div>
  );
}
