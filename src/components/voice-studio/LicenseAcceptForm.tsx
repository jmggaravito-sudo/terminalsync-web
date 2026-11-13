"use client";

import { useState } from "react";

// Electronic acceptance of the Voice Studio voice license. Confirms the
// channel URL (free text — it's also how we know which channel the license
// covers) and posts the token back to the accept endpoint, which records
// identity/time/IP/UA and emails the signed record.
export function LicenseAcceptForm({
  email,
  licenseVersion,
  token,
}: {
  email: string;
  licenseVersion: string;
  /** Raw ?t= token, passed from the server page (never read from window —
   *  SSR would crash on window.location). */
  token: string;
}) {
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function accept(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/voice-studio/license/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, channel }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Something went wrong. Try again.");
      }
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50 p-6">
        <p className="font-semibold text-emerald-800">
          License accepted — you&apos;re covered. / Licencia aceptada — todo
          en orden.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">
          We&apos;ve recorded your acceptance for <strong>{email}</strong>{" "}
          (license {licenseVersion}). Your 60-second sample goes into
          production now — expect it within 5 business days.
          <br />
          Registramos tu aceptación. Tu muestra de 60 segundos entra en
          producción — llega en ~5 días hábiles.
        </p>
        <a href="/voice-studio/orders" className="mt-4 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">
          Back to your dashboard / Volver al dashboard
        </a>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-amber-400";

  return (
    <form onSubmit={accept} className="space-y-4">
      <input
        type="text"
        required
        maxLength={200}
        placeholder="Your YouTube channel URL — El URL de tu canal de YouTube"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        className={inputClass}
      />
      {status === "error" && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-zinc-950 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending"
          ? "Recording…"
          : "I accept this license / Acepto esta licencia"}
      </button>
    </form>
  );
}
