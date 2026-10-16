"use client";
import { useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";

// Inspection surface for the authorized operator. Tokens stay inside the
// existing authedFetch flow; only the authenticated API exposes booleans.
export default function StripeConfigDiagnostic() {
  const [result, setResult] = useState("Not checked");
  const [busy, setBusy] = useState(false);
  async function inspect() {
    setBusy(true);
    try {
      const r = await authedFetch("/api/admin/diagnostics/stripe-config", { cache: "no-store" });
      if (!r.ok) { setResult(`Access unavailable (${r.status})`); return; }
      const b = await r.json();
      if ([b.livePresent, b.testPresent, b.secretsDistinct].some(v => typeof v !== "boolean")) {
        setResult("Invalid diagnostic response"); return;
      }
      setResult(JSON.stringify({ livePresent: b.livePresent, testPresent: b.testPresent, secretsDistinct: b.secretsDistinct }));
    } catch { setResult("Access unavailable; sign in with the existing administrator account."); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-xl p-8">
    <h1>Temporary private Stripe configuration check</h1>
    <p>Read-only. No payments or account changes.</p>
    <button onClick={inspect} disabled={busy}>{busy ? "Checking…" : "Check configuration"}</button>
    <pre role="status">{result}</pre>
  </section>;
}
