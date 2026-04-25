"use client";

import { useState } from "react";
import { Check, Loader2, Undo2 } from "lucide-react";

interface Props {
  email: string;
  token: string;
}

type Status = "idle" | "loading" | "unsubscribed" | "resubscribed" | "error";

export function UnsubscribeForm({ email, token }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function call(action: "unsubscribe" | "resubscribe") {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? "No pudimos procesar tu pedido. Reintenta.");
        setStatus("error");
        return;
      }
      setStatus(action === "unsubscribe" ? "unsubscribed" : "resubscribed");
    } catch {
      setErrorMsg("Error de red. Verificá tu conexión y reintenta.");
      setStatus("error");
    }
  }

  if (status === "unsubscribed") {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 space-y-3">
        <div className="flex items-center gap-2 text-[var(--color-ok)]">
          <Check size={16} strokeWidth={2.6} />
          <span className="text-[13.5px] font-semibold">
            Listo, {email} dado de baja.
          </span>
        </div>
        <p className="text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
          No vas a recibir más novedades ni promos. Si fue un error, podés
          reactivarlas con un click.
        </p>
        <button
          type="button"
          onClick={() => call("resubscribe")}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold text-[var(--color-fg-strong)] border border-[var(--color-border)] hover:bg-[var(--color-panel-2)] transition-colors"
        >
          <Undo2 size={13} strokeWidth={2.4} />
          Reactivar emails
        </button>
      </div>
    );
  }

  if (status === "resubscribed") {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <div className="flex items-center gap-2 text-[var(--color-ok)]">
          <Check size={16} strokeWidth={2.6} />
          <span className="text-[13.5px] font-semibold">
            ¡Bienvenida de vuelta! Vas a recibir nuestros emails de nuevo.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => call("unsubscribe")}
        disabled={status === "loading"}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-white bg-[var(--color-err)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={14} className="animate-spin" strokeWidth={2.4} />
            Procesando…
          </>
        ) : (
          "Confirmar baja"
        )}
      </button>
      {status === "error" ? (
        <p className="text-[12.5px] text-[var(--color-err)] leading-relaxed">
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}
