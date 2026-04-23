#!/usr/bin/env node
// Envía un correo de prueba por cada alias para verificar que Resend está
// bien configurado con el dominio terminalsync.ai.
//
// Uso:
//   RESEND_API_KEY=re_... node scripts/send-test-email.mjs [destino]
//
// Si no pasas destino, usa jmggaravito@gmail.com.

const key = process.env.RESEND_API_KEY;
if (!key) {
  console.error("❌ Falta RESEND_API_KEY en el entorno");
  process.exit(1);
}

const to = process.argv[2] ?? "jmggaravito@gmail.com";

const senders = [
  { from: "Support TerminalSync <support@terminalsync.ai>", subject: "Test: support@" },
  { from: "Juan (TerminalSync) <jgaravito@terminalsync.ai>", subject: "Test: jgaravito@" },
];

for (const s of senders) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: s.from,
      to: [to],
      subject: s.subject,
      html: `<p>Test desde <strong>${s.from}</strong>.</p><p>Si ves esto, Resend + DNS están OK ✓</p>`,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`❌ ${s.from} → ${res.status}`, body);
  } else {
    console.log(`✓ ${s.from} → id ${body.id}`);
  }
}
