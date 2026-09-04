"use client";

import { useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import type { ConversationForCorrection, CorrectionResponseBody } from "@/lib/soporte/types";

/**
 * S3 — the correction loop's single integration point.
 *
 * Self-contained on purpose: S2 builds `/admin/soporte` (the conversation
 * list + thread view) in a parallel PR against the same base branch, so
 * this can't depend on anything from that PR. Whoever renders a thread
 * (S2, or a small follow-up integration PR) drops this in with just the
 * conversation's question/answer:
 *
 *   <CorreccionButton conversation={{ id, question, answer, locale }} />
 *
 * Everything else — the drawer, the form, the POST to
 * /api/admin/soporte/corrections, the result state — lives here. No CSS
 * classes or props leak out that the caller would need to know about.
 */

const MAX_LEN = 4000;

export interface CorreccionButtonProps {
  conversation: ConversationForCorrection;
  /** Optional callback once a correction is successfully submitted (e.g. so
   *  a parent list can refresh a "corregido" badge). Never throws into the
   *  caller — purely informational. */
  onSubmitted?: (result: CorrectionResponseBody) => void;
}

type Phase = "idle" | "sending" | "done" | "failed";

export function CorreccionButton({ conversation, onSubmitted }: CorreccionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="corr-btn-trigger" onClick={() => setOpen(true)}>
        ✎ Corregir
      </button>
      {open && (
        <CorreccionDrawer
          conversation={conversation}
          onClose={() => setOpen(false)}
          onSubmitted={onSubmitted}
        />
      )}
      <style>{`
        .corr-btn-trigger{
          font-family:'SF Mono',ui-monospace,'JetBrains Mono',Menlo,monospace;
          font-size:12px;font-weight:600;color:#b45309;background:#fff7ed;
          border:1px solid #fdba74;border-radius:7px;padding:6px 11px;cursor:pointer;
        }
        .corr-btn-trigger:hover{background:#ffedd5;border-color:#fb923c;}
      `}</style>
    </>
  );
}

interface CorreccionDrawerProps {
  conversation: ConversationForCorrection;
  onClose: () => void;
  onSubmitted?: (result: CorrectionResponseBody) => void;
}

/** Exported too — a caller who wants to manage its own open/close state
 *  (rather than the trigger button above) can render this directly. */
export function CorreccionDrawer({ conversation, onClose, onSubmitted }: CorreccionDrawerProps) {
  const [correctedEs, setCorrectedEs] = useState("");
  const [correctedEn, setCorrectedEn] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<CorrectionResponseBody | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = correctedEs.trim().length > 0 && correctedEs.length <= MAX_LEN && phase !== "sending";

  const submit = async () => {
    if (!canSubmit) return;
    setPhase("sending");
    setError(null);
    try {
      const res = await authedFetch("/api/admin/soporte/corrections", {
        method: "POST",
        body: JSON.stringify({
          conversation_id: conversation.id ?? null,
          question: conversation.question,
          bad_answer: conversation.answer,
          corrected_answer_es: correctedEs.trim(),
          corrected_answer_en: correctedEn.trim() || null,
          locale: conversation.locale ?? null,
        }),
      });
      const json = (await res.json()) as CorrectionResponseBody;
      if (!res.ok || !json.ok) {
        setError(json.error || `No se pudo enviar la corrección (HTTP ${res.status}).`);
        setPhase("failed");
        return;
      }
      setResult(json);
      setPhase("done");
      onSubmitted?.(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red al enviar la corrección.");
      setPhase("failed");
    }
  };

  return (
    <div className="corr-overlay" role="dialog" aria-modal="true" aria-label="Corregir respuesta">
      <div className="corr-backdrop" onClick={phase === "sending" ? undefined : onClose} />
      <div className="corr-panel">
        <div className="corr-hd">
          <h2>Corregir respuesta</h2>
          <button type="button" className="corr-close" onClick={onClose} aria-label="Cerrar" disabled={phase === "sending"}>
            ✕
          </button>
        </div>

        {phase === "done" && result ? (
          <div className="corr-body">
            <div className="corr-success">
              <p className="corr-success-title">✓ Corrección enviada</p>
              <p>
                {result.pr_number ? (
                  <>
                    PR #{result.pr_number} esperando revisión. Entra en vigencia con el deploy nocturno tras aprobarse.
                  </>
                ) : (
                  "Quedó guardada. Entra en vigencia con el deploy nocturno tras aprobarse."
                )}
              </p>
              {result.pr_url && (
                <a href={result.pr_url} target="_blank" rel="noreferrer" className="corr-pr-link">
                  Ver PR ↗
                </a>
              )}
            </div>
            <button type="button" className="corr-btn corr-btn-ghost" onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <div className="corr-body">
            <div className="corr-field">
              <div className="corr-lbl">Pregunta (solo lectura)</div>
              <div className="corr-readonly">{conversation.question || "—"}</div>
            </div>
            <div className="corr-field">
              <div className="corr-lbl">Respuesta actual del bot (solo lectura)</div>
              <div className="corr-readonly corr-readonly-bad">{conversation.answer || "—"}</div>
            </div>
            <div className="corr-field">
              <div className="corr-lbl">Cómo debía contestar (español, obligatorio)</div>
              <textarea
                className="corr-textarea"
                value={correctedEs}
                onChange={(e) => setCorrectedEs(e.target.value)}
                placeholder="Escribí la respuesta correcta, tal como se la dirías al cliente…"
                maxLength={MAX_LEN}
                disabled={phase === "sending"}
              />
              <div className="corr-count">{correctedEs.length}/{MAX_LEN}</div>
            </div>
            <div className="corr-field">
              <div className="corr-lbl">English version (opcional)</div>
              <textarea
                className="corr-textarea"
                value={correctedEn}
                onChange={(e) => setCorrectedEn(e.target.value)}
                placeholder="Optional — the correct answer in English…"
                maxLength={MAX_LEN}
                disabled={phase === "sending"}
              />
            </div>
            {error && <div className="corr-error">⚠ {error}</div>}
            <div className="corr-actions">
              <button type="button" className="corr-btn corr-btn-ghost" onClick={onClose} disabled={phase === "sending"}>
                Cancelar
              </button>
              <button type="button" className="corr-btn corr-btn-primary" onClick={submit} disabled={!canSubmit}>
                {phase === "sending" ? "Enviando…" : "Enviar corrección"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .corr-overlay{position:fixed;inset:0;z-index:1000;display:flex;justify-content:flex-end;}
        .corr-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45);}
        .corr-panel{position:relative;width:min(480px,100vw);height:100%;background:#111827;color:#e5e7eb;
          box-shadow:-8px 0 32px rgba(0,0,0,.35);display:flex;flex-direction:column;
          font-family:'Inter',system-ui,sans-serif;}
        .corr-hd{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;
          border-bottom:1px solid #1f2937;}
        .corr-hd h2{margin:0;font-size:16px;font-weight:700;}
        .corr-close{background:none;border:none;color:#9ca3af;font-size:16px;cursor:pointer;padding:4px 8px;}
        .corr-close:hover{color:#e5e7eb;}
        .corr-body{flex:1;overflow:auto;padding:20px 22px;display:flex;flex-direction:column;gap:16px;}
        .corr-field{display:flex;flex-direction:column;gap:6px;}
        .corr-lbl{font-family:'SF Mono',ui-monospace,monospace;font-size:11px;color:#9ca3af;
          text-transform:uppercase;letter-spacing:.06em;}
        .corr-readonly{background:#1c2431;border:1px solid #2a3340;border-radius:8px;padding:11px 12px;
          font-size:13.5px;line-height:1.5;white-space:pre-wrap;max-height:140px;overflow:auto;color:#d1d5db;}
        .corr-readonly-bad{border-color:#7c2d12;background:#1f1512;}
        .corr-textarea{width:100%;min-height:110px;background:#1c2431;border:1px solid #2a3340;border-radius:8px;
          color:#e5e7eb;font-family:inherit;font-size:13.5px;line-height:1.5;padding:11px 12px;resize:vertical;}
        .corr-textarea:focus{outline:2px solid #25d366;outline-offset:1px;}
        .corr-count{align-self:flex-end;font-family:'SF Mono',ui-monospace,monospace;font-size:10.5px;color:#6b7280;}
        .corr-error{background:#3a1c1c;color:#f0b3b3;border:1px solid #5a2a2a;border-radius:8px;
          padding:10px 12px;font-size:12.5px;}
        .corr-actions{display:flex;gap:10px;margin-top:4px;}
        .corr-btn{flex:1;font-family:inherit;font-size:13.5px;font-weight:600;padding:11px;border-radius:8px;
          cursor:pointer;border:1px solid #2a3340;transition:.12s;}
        .corr-btn:disabled{opacity:.5;cursor:not-allowed;}
        .corr-btn-primary{background:#25d366;color:#0d1117;border-color:#25d366;}
        .corr-btn-primary:hover:not(:disabled){filter:brightness(1.08);}
        .corr-btn-ghost{background:none;color:#e5e7eb;}
        .corr-btn-ghost:hover:not(:disabled){border-color:#6b7280;}
        .corr-success{background:#0d2a16;border:1px solid #1f7a34;border-radius:10px;padding:16px;margin-bottom:6px;}
        .corr-success-title{margin:0 0 6px;font-weight:700;color:#9ff0b2;}
        .corr-success p{margin:0 0 8px;font-size:13.5px;line-height:1.5;color:#d1d5db;}
        .corr-pr-link{color:#25d366;text-decoration:none;font-size:13px;font-weight:600;}
        .corr-pr-link:hover{text-decoration:underline;}
      `}</style>
    </div>
  );
}
