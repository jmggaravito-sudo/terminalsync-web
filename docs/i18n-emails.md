# i18n de correos — estado y lo que falta hacer a mano

## Qué quedó bilingüe (este PR)

Los 5 correos que un cliente real recibe ahora renderizan en **español o inglés**
según `profiles.locale` del usuario (fallback `es`):

| Correo | Cuándo se manda |
|---|---|
| `welcome` | al completar el checkout / alta |
| `trial-ending` | ~3 días antes de que termine la prueba |
| `payment-failed` | tarjeta rechazada en la renovación |
| `cancellation-confirmed` | suscripción cancelada |
| `account-deletion-requested` | pidió borrar la cuenta |

El idioma se resuelve con `resolveUserLang({ email | userId })` (lee
`profiles.locale`) y se pasa a `send*`. Subjects, fechas y URLs (`/es/` vs
`/en/`) también se localizan. Verificado con render real (en/es) en
`emails/bilingual.test.tsx`.

**Bonus honesto:** de paso se corrigió la copy del `welcome` — decía "tus
archivos van cifrados / Google no ve tu código" (falso, contradecía decisión A).
Ahora dice la verdad en ambos idiomas: cifrado en secretos/claves/conversaciones;
archivos en tu propia nube, formato original.

---

## 🔴 Lo que TENÉS que hacer a mano (no se puede desde el repo)

### Magic link / OTP de login (Supabase Dashboard)

Es el **primer** correo que recibe un usuario nuevo, y lo manda **Supabase**, no
este repo. Hoy está en un solo idioma. Supabase **no** tiene templates por idioma
nativos, así que la solución práctica es un template **bilingüe** (los dos idiomas
en el mismo correo, inglés arriba / español abajo). Pegá esto en:

**Supabase Dashboard → Authentication → Email Templates → "Magic Link"** (y lo
mismo aplica a "Confirm signup" si lo usás):

**Subject:**
```
Your Terminal Sync sign-in link · Tu enlace de acceso a Terminal Sync
```

**Body (HTML):**
```html
<h2>Sign in to Terminal Sync</h2>
<p>Click the button below to sign in. This link works once and expires in 1 hour.</p>
<p><a href="{{ .ConfirmationURL }}">Sign in →</a></p>
<p>If you didn't request this, you can ignore this email.</p>
<hr>
<h2>Entrá a Terminal Sync</h2>
<p>Tocá el botón de abajo para entrar. El enlace funciona una sola vez y vence en 1 hora.</p>
<p><a href="{{ .ConfirmationURL }}">Entrar →</a></p>
<p>Si no lo pediste vos, podés ignorar este correo.</p>
```

> Si más adelante querés un solo idioma por usuario en el login, hay que mover el
> envío del OTP a este repo (mandarlo vía Resend con `resolveUserLang`) en vez de
> dejarlo en Supabase. Es una pieza aparte; por ahora el bilingüe cubre a todos.

---

## Marketplace (publishers)

- **`listing-approved`** y **`listing-rejected`** (van a un publisher):
  bilingües, mismo patrón — resuelven el idioma con `resolveUserLang({email})`
  del publisher.
- **`new-submission`** (alerta a los admins internos): queda en español a
  propósito — es un correo interno del equipo, no del cliente.

## Cerrado en otros PRs (misma tanda de i18n)

- **Bot de soporte**: `sync_ai/mod.rs` ahora fuerza responder en el idioma del
  usuario (terminal-sync, PR aparte).
- **App UI**: `onboarding.skills.note` agregada en `en` (terminal-sync).
  `batch.protecting` era falso positivo (EN usa formas de plural).
