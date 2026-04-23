"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, CircleDot } from "lucide-react";
import type { Dict } from "@/content";

type ReplyId = "install" | "pricing" | "security";

interface Message {
  id: string;
  author: "agent" | "user";
  body: string;
  at: number;
}

export function AgentWidget({ dict }: { dict: Dict }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      author: "agent",
      body: dict.agent.greeting,
      at: Date.now(),
    },
  ]);
  // Hide a quick-reply chip after the user has tapped it once.
  const [usedReplies, setUsedReplies] = useState<Set<ReplyId>>(new Set());

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [messages, open, typing]);

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

  function pushAgent(body: string, delayMs = 700) {
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), author: "agent", body, at: Date.now() },
      ]);
      setTyping(false);
    }, delayMs);
  }

  function handleQuickReply(id: ReplyId, label: string) {
    pushUser(label);
    setUsedReplies((prev) => new Set(prev).add(id));
    pushAgent(dict.agent.replies[id]);
  }

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");
    pushAgent(dict.agent.replies.fallback, 900);
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
        {/* Header */}
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
              <CircleDot
                size={7}
                className="text-[var(--color-ok)]"
                fill="currentColor"
              />
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

        {/* Message list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
        >
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {typing && <TypingDots label={dict.agent.typing} />}

          {/* Quick replies — visible while at least one hasn't been used */}
          {messages.length <= 2 + usedReplies.size && (
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

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-3 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg)]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder={dict.agent.placeholder}
            className="flex-1 h-9 px-3 rounded-full bg-[var(--color-panel-2)] border border-[var(--color-border)] text-[12.5px] text-[var(--color-fg)] placeholder-[var(--color-fg-dim)] outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-panel)] focus:ring-4 focus:ring-[var(--color-accent-glow)] transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label={dict.agent.send}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
              input.trim()
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
  const isAgent = msg.author === "agent";
  return (
    <div className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
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
