# Video funds reservation — el permiso de envío también es dinero

## El problema

`Evidence: Reserve` (web #523) comprobaba la sesión y registraba un permiso único
por cotización, pero no recibía el importe ni miraba el saldo. Una cuenta con
sesión válida y sin fondos podía llegar a WaveSpeed y gastar el saldo del
proveedor.

## Qué hace ahora `reserve`

`POST /api/credits/video-evidence` con `event: "reserve"` llama a
`reserve_ai_video_funds` (migración `20261019220000_ai_video_funds_reservation.sql`).
En una sola transacción, serializada por la fila de la cuenta (`for update`):

1. rechaza un permiso repetido (misma clave o mismo job) → `409 evidence_conflict`;
2. si el débito de la app ya llegó con la misma clave `design-video:vq_…`, lo
   acepta solo si cubre el precio y no tiene sobregiro; si no →
   `409 video_debit_mismatch`;
3. si no llegó, descuenta el precio del servidor con esa misma clave y exige
   saldo suficiente; si no → `402 insufficient_funds` y no se mueve nada;
4. registra el permiso `reserved`.

Como el débito del servidor usa la clave original, cuando la app sincroniza el
suyo (`record_ai_credit_debit`) lo encuentra y devuelve `applied = false`:
**no se cobra dos veces**, llegue primero la app o el servidor. El débito lleva
`overdraft_micros = 0`, así que `record_ai_credit_refund` devuelve el importe
completo si el proveedor confirma el fallo.

`record_ai_video_evidence('reserve', …)` **sigue existiendo durante el corte**,
a propósito: el orquestador publicado la usa hasta que se active la fase 3. Su
retiro es una migración posterior (fase 4). `submitted` y `terminal` no cambian.

## Precio confiable

El importe lo fija el servidor con `src/lib/videoPricing.ts` a partir de
`modelId` y `durationSeconds`, que el orquestador copia de la cotización que él
mismo registró. No se acepta ningún importe del cliente. Modelo o duración sin
precio → `400 video_not_priced`, antes de mover dinero.

La tabla es un espejo de `src-tauri/src/credits/mod.rs` (costo del proveedor x2).
Si una cambia, cambia la otra en la misma entrega: terminal-sync tiene una
prueba con los mismos números.

## Fases de despliegue (cada paso es compatible con el estado anterior)

Ningún paso rompe el flujo de video que está publicado. La prueba del estado
intermedio está en `scripts/test-credit-refunds-sql.py`: con la migración
aplicada, la reserva antigua sigue funcionando de punta a punta.

1. **Migración aditiva** `20261019220000_ai_video_funds_reservation.sql`. Solo crea
   `reserve_ai_video_funds`; no cambia ninguna función existente.
2. **Publicar esta web.** Una reserva que no trae `modelId` ni `durationSeconds`
   (el orquestador actual) conserva el comportamiento anterior. Una que los trae
   ya pasa por la reserva de saldo. Sin `VIDEO_RESERVE_REQUIRE_FUNDS`, **la brecha
   sigue abierta**: esta fase no la cierra.
3. **Corte.** Importar el workflow de terminal-sync#2717 (con snapshot y clon),
   verificar con una reserva real, y recién entonces definir
   `VIDEO_RESERVE_REQUIRE_FUNDS=1` en Vercel y volver a desplegar. Desde ahí toda
   reserva exige modelo, duración y saldo; sin ellos, `400 video_not_priced`.
4. **Retiro de la reserva antigua**, en una migración aparte y posterior, que
   reemplace `record_ai_video_evidence` para rechazar `reserve`. Se aplica solo
   cuando la fase 3 lleve un tiempo verificada. Esa migración no forma parte de
   este PR.

**Reversa de la fase 3:** quitar `VIDEO_RESERVE_REQUIRE_FUNDS` y volver a
desplegar. El orquestador que envía los campos sigue usando la reserva de saldo
(es opcional por presencia), y uno antiguo vuelve a funcionar.

## Límites conocidos (decisión pendiente, no se resuelven aquí)

- **Reservado y nunca enviado.** Si tras la reserva falla algo antes de que
  WaveSpeed acepte el trabajo, el permiso queda `reserved` sin predicción. Sin
  evidencia del proveedor no hay reembolso automático; queda pendiente de
  conciliación manual, igual que antes con el débito local.
- **Débito de la app corto o con sobregiro** (el preflight de saldo de la app lo
  evita en el flujo normal): se rechaza el permiso y ese dinero también queda
  para conciliar a mano.
- **Reintento de la reserva** (por ejemplo, n8n repite la llamada tras perder la
  respuesta): el segundo intento recibe `409` y el trabajo falla; el primero ya
  cobró. Mismo tratamiento que el punto anterior.
- **Precios duplicados** en dos repos hasta que haya una fuente única.

## Verificación

- `scripts/test-credit-refunds-sql.py` ejecuta las migraciones exactas en un
  PostgreSQL desechable, sin red ni acceso a producción: **44/44**, incluidas
  ocho conexiones simultáneas reales (solo 3 de 8 reservas pasan con saldo para
  3; ocho reservas de una misma cotización cobran una vez; una carrera entre el
  débito de la app y la reserva cobra una vez). Quitando el `for update` la
  prueba de concurrencia falla (4 de 8 en vez de 3).
- `npx vitest run src/app/api/credits/video-evidence src/lib/videoPricing.test.ts`.
- Nada de esto se ha aplicado a producción.
