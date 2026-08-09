type Params = Promise<{ lang: string }>;
type Search = Promise<{ status?: string; flavor?: string }>;

export default async function CreditReturnPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const [{ lang: rawLang }, query] = await Promise.all([params, searchParams]);
  const lang = rawLang === "en" ? "en" : "es";
  const flavor = query.flavor === "lab" ? "lab" : "stable";
  const status = ["success", "pending", "failure", "cancel"].includes(query.status ?? "")
    ? query.status
    : "cancel";
  const scheme = flavor === "lab" ? "terminalsync-lab" : "terminalsync";
  const appUrl = `${scheme}://billing/credits/${status}`;

  const copy = lang === "en"
    ? {
        successTitle: "Payment received",
        successBody: "Your balance will be added after the payment provider confirms it. You can return to Terminal Sync now.",
        pendingTitle: "Payment pending",
        pendingBody: "No balance is added until the payment provider confirms the payment.",
        cancelTitle: "Top-up canceled",
        cancelBody: "No charge was made. Your previous balance stays unchanged.",
        back: "Return to Terminal Sync",
        support: "If the balance does not update after confirmation, open Help → Suggestions in Terminal Sync and include your payment receipt.",
      }
    : {
        successTitle: "Pago recibido",
        successBody: "El saldo se acreditará cuando el medio de pago lo confirme. Ya puedes volver a Terminal Sync.",
        pendingTitle: "Pago pendiente",
        pendingBody: "No se acredita saldo hasta que el medio de pago confirme la operación.",
        cancelTitle: "Recarga cancelada",
        cancelBody: "No se realizó ningún cobro. Tu saldo anterior queda igual.",
        back: "Volver a Terminal Sync",
        support: "Si el saldo no se actualiza después de la confirmación, abre Ayuda → Sugerencias en Terminal Sync e incluye el comprobante.",
      };

  const isSuccess = status === "success";
  const isPending = status === "pending";
  const title = isSuccess
    ? copy.successTitle
    : isPending
      ? copy.pendingTitle
      : copy.cancelTitle;
  const body = isSuccess
    ? copy.successBody
    : isPending
      ? copy.pendingBody
      : copy.cancelBody;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-2xl">
          {isSuccess ? "✓" : isPending ? "…" : "↩"}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 leading-7 text-slate-300">{body}</p>
        <a
          href={appUrl}
          className="mt-7 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          {copy.back}
        </a>
        <p className="mt-6 text-sm leading-6 text-slate-400">{copy.support}</p>
      </section>
    </main>
  );
}
