# Welcome Email — TerminalSync

**Trigger:** usuario se registra en terminalsync.ai (magic link, OAuth, o form).
**From:** Juan de TerminalSync.ai `<hola@terminalsync.ai>`
**Subject:** 🛡️ Tu Claude Code ahora tiene superpoderes (y memoria)

---

¡Hola {{firstName}}!

Bienvenido a la nueva forma de trabajar con IA. Acabas de dar el primer paso para liberar tu flujo de trabajo de las limitaciones de una sola computadora.

## ¿Qué sigue ahora?

1. **Descarga la App** — [Descargar TerminalSync para Desktop]({{downloadUrl}})
2. **Configura tu IA** — Dentro de la app, usa nuestro AI Power-Up para instalar Claude Code y configurar tu API Key con un solo clic.
3. **Sé Nómada** — Crea tu primera "Terminal", actívala y vete a cualquier otra computadora. Tu contexto te estará esperando.

## Un dato importante

Tus archivos y tu API Key están protegidos por cifrado **AES-256** antes de salir de tu computadora. Nosotros no podemos ver tu código, y Google tampoco.

Si tienes alguna duda, responde a este correo. Estoy aquí para ayudarte a que tu IA sea tan móvil como tú.

**Juan**
Fundador, TerminalSync.ai

---

## Variables de plantilla

| Variable | Ejemplo |
|---|---|
| `{{firstName}}` | "Juan" |
| `{{downloadUrl}}` | "https://terminalsync.ai/download?token=..." |
| `{{unsubscribeUrl}}` | "https://terminalsync.ai/unsubscribe?token=..." |

## Stack recomendado

- **Envío:** Resend (`re_*` API key en env)
- **Remitente:** `hola@terminalsync.ai` (DNS + DKIM/SPF verificados antes de salir live)
- **Trigger:** webhook de auth provider → Edge Function → `resend.emails.send({ template: 'welcome', ... })`
- **Disparo único:** idempotency key = `welcome:${userId}` para evitar duplicados si el webhook se reintenta
