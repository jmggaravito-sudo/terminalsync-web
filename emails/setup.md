# Email setup — terminalsync.ai

Dos buzones de producción:

| Dirección | Uso |
|---|---|
| `support@terminalsync.ai` | Tickets, soporte, respuestas públicas |
| `jgaravito@terminalsync.ai` | Correo personal del founder |

**Arquitectura** (igual a NexFlowAI):

- **Recepción:** Cloudflare Email Routing → reenvía a `jmggaravito@gmail.com` (gratis, ilimitado).
- **Envío:** Resend con el dominio verificado. Gmail "Send mail as" te deja responder como `support@` o `jgaravito@` desde la misma bandeja.
- **DNS:** Cloudflare (el dominio en Namecheap apuntando a los nameservers de Cloudflare).

---

## 1. Pre-requisitos (si falta algo avísame)

- [ ] Dominio `terminalsync.ai` registrado en Namecheap.
- [ ] Nameservers apuntando a Cloudflare (`kip.ns.cloudflare.com`, `nova.ns.cloudflare.com` como en NexFlow).
- [ ] Zona creada en Cloudflare Dashboard.
- [ ] Cuenta Resend (puede ser la misma de NexFlowAI).

---

## 2. Cloudflare Email Routing (recepción)

**Dashboard → terminalsync.ai → Email → Email Routing → Enable**

Enable auto-crea 3 MX records + 1 TXT. Solo necesitas agregar las direcciones a reenviar:

| Custom address | Destination |
|---|---|
| `support@terminalsync.ai` | `jmggaravito@gmail.com` |
| `jgaravito@terminalsync.ai` | `jmggaravito@gmail.com` |
| (opcional) `*@terminalsync.ai` catch-all | `jmggaravito@gmail.com` |

Cloudflare te mandará un correo de verificación al destino — acéptalo.

Si preferís hacerlo vía API (requiere `CF_API_TOKEN` con permiso `Email Routing Addresses:Edit`):

```bash
export CF_TOKEN="..."
export ZONE_ID="..."

curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "support",
    "enabled": true,
    "matchers": [{"type":"literal","field":"to","value":"support@terminalsync.ai"}],
    "actions":  [{"type":"forward","value":["jmggaravito@gmail.com"]}]
  }'

curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "jgaravito",
    "enabled": true,
    "matchers": [{"type":"literal","field":"to","value":"jgaravito@terminalsync.ai"}],
    "actions":  [{"type":"forward","value":["jmggaravito@gmail.com"]}]
  }'
```

---

## 3. Resend (envío)

**Dashboard → Domains → Add Domain → `terminalsync.ai`** → región `us-east-1` (mismo que NexFlow).

Resend te muestra 3 records DNS a copiar en Cloudflare:

| Type | Name | Value |
|---|---|---|
| `MX` | `send.terminalsync.ai` | `feedback-smtp.us-east-1.amazonses.com` priority 10 |
| `TXT` | `send.terminalsync.ai` | `"v=spf1 include:amazonses.com ~all"` |
| `TXT` | `resend._domainkey.terminalsync.ai` | (DKIM, ~400 chars — copy-paste el que te dé Resend) |

**Proxy OFF** en todos (nube gris en Cloudflare, NO naranja).

Espera ~5 min y dale **Verify** en Resend. Una vez verde, creás una API key **"TerminalSync production"** con scope "Full access" o solo "Sending access".

### Para el bot de bienvenida / soporte

Add esta DMARC opcional para evitar que Gmail ponga tus correos en spam:

| Type | Name | Value |
|---|---|---|
| `TXT` | `_dmarc.terminalsync.ai` | `"v=DMARC1; p=none; rua=mailto:dmarc@terminalsync.ai"` |

---

## 4. Gmail — "Send mail as"

Para poder **responder** desde tu Gmail como `support@terminalsync.ai`:

**Gmail → Settings → Accounts → Send mail as → Add another email**

Por cada dirección (`support@` y `jgaravito@`):

- Name: `Support TerminalSync` o `Juan (TerminalSync)`
- Email: `support@terminalsync.ai` / `jgaravito@terminalsync.ai`
- **Treat as alias:** ☐ no
- SMTP: `smtp.resend.com` port `465` SSL
- Username: `resend`
- Password: **API key de Resend** (la de `re_*`)

Gmail envía un correo de verificación → llega al forward de Cloudflare → Gmail → confirmas.

Después, al redactar, Gmail te deja elegir el `From:` del dropdown.

---

## 5. DNS records consolidados (para Cloudflare)

Pega esto tal cual en Cloudflare → DNS → Records:

```
; Email Routing (Cloudflare los crea solos)
MX   @                   route1.mx.cloudflare.net     priority 17
MX   @                   route2.mx.cloudflare.net     priority 18
MX   @                   route3.mx.cloudflare.net     priority 20
TXT  @                   "v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all"

; Resend (envío)
MX   send                feedback-smtp.us-east-1.amazonses.com  priority 10
TXT  resend._domainkey   "p=MIGfMA0GCSq...(lo que te dé Resend)..."

; DMARC opcional
TXT  _dmarc              "v=DMARC1; p=none; rua=mailto:dmarc@terminalsync.ai"
```

Nota: el SPF es UN solo record (no dos). Si Cloudflare Email Routing ya creó uno, **añade** `include:amazonses.com` al existente en vez de crear otro. Dos SPF = inválido.

---

## 6. Verificar que funciona

### Recibir

Desde otro correo (tu iPhone, etc.) manda un test:

- To: `support@terminalsync.ai` → debe llegar a Gmail.
- To: `jgaravito@terminalsync.ai` → debe llegar a Gmail.

### Enviar (vía Resend API)

```bash
export RESEND_KEY="re_..."   # la nueva API key de TerminalSync

curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Juan <jgaravito@terminalsync.ai>",
    "to": ["jmggaravito@gmail.com"],
    "subject": "Test desde TerminalSync",
    "html": "<p>Si ves esto, el envío funciona ✓</p>"
  }'
```

### Enviar (vía Gmail "Send mail as")

Abre Gmail → nuevo correo → dropdown From → `support@terminalsync.ai` → enviate a ti mismo a `jmggaravito@gmail.com` → debe llegar sin spam warning.

---

## 7. Integración con la landing

- `~/projects/terminalsync-web/` ya usa:
  - Footer Legal → link `mailto:hola@terminalsync.ai` (opcional: cambiar a `support@`)
  - AgentWidget fallback → "un humano del equipo te contactará"
  - Affiliates terms → `partners@terminalsync.ai` mencionado (agregar ese alias también?)

- Welcome email (`emails/welcome.md` + `welcome.tsx`) — se envía desde `support@terminalsync.ai` vía Resend. En el código de Next.js:

```ts
// src/lib/email.ts (a crear)
import { Resend } from "resend";
import { WelcomeEmail } from "../../emails/welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcome(to: string, firstName: string) {
  return resend.emails.send({
    from: "Juan de TerminalSync <support@terminalsync.ai>",
    to,
    subject: "🛡️ Tu Claude Code ahora tiene superpoderes (y memoria)",
    react: WelcomeEmail({
      firstName,
      downloadUrl: `https://terminalsync.ai/download?token=...`,
      unsubscribeUrl: `https://terminalsync.ai/unsubscribe?token=...`,
    }),
  });
}
```

Env vars a agregar en Vercel:
```
RESEND_API_KEY=re_...
```

---

## 8. Aliases adicionales sugeridos (todos forward → Gmail)

| Alias | Para qué |
|---|---|
| `hola@terminalsync.ai` | Contacto general (ya referenciado en la landing) |
| `partners@terminalsync.ai` | Programa de afiliados (ya referenciado en los términos) |
| `ventas@terminalsync.ai` | Leads del plan Agency (ya referenciado en checkout cancel) |
| `dmarc@terminalsync.ai` | Reportes DMARC (si activaste el record) |
| `postmaster@terminalsync.ai` | Requerido por RFC — buena práctica |

Podés crear los 5 como catch-all `*@terminalsync.ai` → Gmail en Cloudflare y listo.
