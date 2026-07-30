"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  id: number;
  role: "client" | "bot";
  text: string;
  escalated?: boolean;
};

const examples = [
  "hola",
  "servicios",
  "quiero agendar una cita",
  "hello, what services do you offer?",
  "estoy molesta y necesito hablar con una persona",
];

export default function KelayaTestChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      text: "Chat de prueba de Kelaya. Escribe un mensaje para simular la respuesta del agente sin enviar WhatsApp real.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(nextMessage: string) {
    const cleanMessage = nextMessage.trim();
    if (!cleanMessage || isSending) return;

    setError(null);
    setIsSending(true);
    setMessage("");
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "client", text: cleanMessage },
    ]);

    try {
      const response = await fetch("/api/kelaya/test-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanMessage }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo generar respuesta.");
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "bot",
          text: String(data.reply),
          escalated: Boolean(data.escalated),
        },
      ]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Error inesperado.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(message);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Kelaya
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Prueba del agente de chat
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Este simulador corre en terminalsync.ai y no envía mensajes reales por WhatsApp.
            Sirve para probar respuestas, servicios de Square y escalamiento humano.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-cyan-950/30 sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                className="rounded-full border border-cyan-300/30 px-3 py-1.5 text-sm text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10 disabled:opacity-60"
                disabled={isSending}
                onClick={() => void sendMessage(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex min-h-[360px] flex-col gap-3 rounded-2xl bg-slate-900/70 p-4">
            {messages.map((chatMessage) => (
              <div
                key={chatMessage.id}
                className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                  chatMessage.role === "client"
                    ? "ml-auto bg-cyan-400 text-slate-950"
                    : "mr-auto bg-white/10 text-slate-100"
                }`}
              >
                {chatMessage.text}
                {chatMessage.escalated ? (
                  <div className="mt-3 rounded-xl border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
                    Este mensaje activaría escalamiento humano.
                  </div>
                ) : null}
              </div>
            ))}
            {isSending ? (
              <div className="mr-auto rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                Generando respuesta…
              </div>
            ) : null}
          </div>

          <form className="mt-4 flex gap-3" onSubmit={handleSubmit}>
            <input
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
              disabled={isSending}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Escribe como cliente de Kelaya…"
              value={message}
            />
            <button
              className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSending || !message.trim()}
              type="submit"
            >
              Enviar
            </button>
          </form>

          {error ? (
            <p className="mt-3 rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
