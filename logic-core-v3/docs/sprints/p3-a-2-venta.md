# P3-A.2 — Superficie de venta del módulo de reseñas + estados honestos

> Fuente de verdad del sprint (plan + log de ejecución). Solo superficie CLIENTE de venta +
> estados. La conexión GBP sigue siendo de develOP (admin); el selector de sucursal para
> `CONNECTED_NO_LOCATION('multiple')` sigue diferido.

## Objetivo

Cerrar el hueco de venta y honestidad del módulo `motor-resenas`: hoy un cliente SIN el módulo
recibía `redirect('/dashboard')` duro (no había pantalla de venta), y un cliente CON el módulo
pero sin conexión operativa veía una card gateada por un criterio local de tokens crudos
(`page.tsx:157`), no por el estado unificado de P3-A.1. El sprint construye la **LockedView de
venta** (CTA → `requestUpsellAction`), el estado **"conectando"** honesto, y unifica el criterio
de "operativo" con `deriveConnectionStatus`.

## Los 3 estados (invariante del sprint) y su resolución

`resolveMotorResenasView({ moduleActive, connection })` (**puro**, `src/lib/modules/
motor-resenas-view.ts`) — `moduleActive` = `isModuleActive(orgId, 'motor-resenas')`;
`connection` = `deriveConnectionStatus({ gbpConnectedAt, gbpLocationId })` (P3-A.1):

| Módulo | Conexión | Vista |
|---|---|---|
| inactivo | (cualquiera — no desbloquea) | **`locked`** → LockedView de venta |
| activo | `NOT_CONNECTED` o `CONNECTED_NO_LOCATION` | **`connecting`** → "develOP está terminando de conectar tu Google" |
| activo | `OPERATIONAL` | **`operational`** → vista operativa existente |

Precedencia: el gating comercial gana al técnico. **Nunca** se muestra la vista operativa vacía
cuando falta que develOP conecte — comprado ≠ operativo. `CONNECTED_NO_LOCATION` (0 o >1
sucursales sin elegir) y `NOT_CONNECTED` se muestran igual: para el dueño es la misma verdad y
no es su problema a resolver.

## Qué se construyó

- **`src/lib/modules/motor-resenas-view.ts`** (nuevo, puro): tipos + `resolveMotorResenasView`.
  Único import del invariante. `import type` de `ConnectionStatus` (se borra en build/tsx).
- **`motor-resenas-view.invariant.ts`** (nuevo) + script `check:invariant:motor-resenas-view`:
  truth table 2×3 completa · gating (sin módulo JAMÁS operativa, la conexión no desbloquea) ·
  honestidad (activo + no operativa → connecting) · composición end-to-end (los 8 combos crudos
  `moduleActive × gbpConnectedAt × gbpLocationId` pasados por `deriveConnectionStatus` — clava el
  cableado exacto de la página) · determinismo.
- **`_components/LockedView.tsx`** (nuevo, client): pill `Lock` "Módulo premium", título "Tus
  reseñas de Google, sin perseguir a nadie", 3 bullets de features REALES (ver copy), precio
  **`[FALTA:precio]`** visible, CTA "Pedir este módulo" (patrón RequestButton: `useTransition` +
  `AnimatePresence mode="wait"`, idle→loading; el success reemplaza el CTA por el bloque verde),
  error inline auto-reset 3.5s, `<Link>` secundario a mensajes. **Variante `isPaused`**: card
  ámbar "Tu Motor de Reseñas está pausado" sin CTA de venta ni precio (no se vende lo que ya se
  tiene). **Estado persistente "ya lo pediste"**: prop `alreadyRequested` (server-side, ver abajo)
  → bloque "Ya pediste este módulo" sin botón de re-pedido.
- **`_components/ConnectingState.tsx`** (nuevo, server-safe): card cyan molde
  `OnboardingStatusCard`, badge "En curso" con dot `animate-pulse`, `<Link>` a
  `/dashboard/messages?context=gbp`.
- **`page.tsx`** (edit): `Promise.all(isModuleActive, findUnique{googleMapsPlaceId,
  gbpConnectedAt, gbpLocationId})` → `resolveMotorResenasView` → switch de 3 ramas con el
  `PageHeader` amber idéntico arriba de las tres. Murieron: el `redirect('/dashboard')`, el
  `gbpConnected` local por tokens crudos (`:157`), la card bespoke "GBP no conectado" (`:22-56`,
  superada por ConnectingState), la prop `gbpConnected` de `ReviewsList`, y los selects muertos
  (`companyName` + los 2 tokens). `AskReviewSection` (QR, usa `googleMapsPlaceId`, independiente
  de GBP) se mantiene en connecting + operational; NO en locked. `force-dynamic` se mantiene
  (el pase connecting→operational se ve sin caché vieja).
- **`message-context.ts`** (edit, 1 key): `gbp` — el CTA `?context=gbp` ya era la convención en
  esta ruta pero la key NO existía (composer vacío, bug latente). Ahora prefillea.

## Copy elegida (es producto — revisable)

- **Venta:** "Tus reseñas de Google, sin perseguir a nadie" · "El Motor de Reseñas junta todas
  tus reseñas en un solo lugar, te prepara la respuesta de cada una y te ayuda a pedir nuevas.
  Vos aprobás, él se encarga del resto." · Bullets (features reales de la vista operativa, sin
  números inventados): "Todas tus reseñas en un solo lugar, con las que faltan responder primero"
  / "Cada reseña con un borrador de respuesta listo para aprobar y publicar" / "Un QR y un link
  listos para pedirle la reseña a tus clientes" · "Precio: **[FALTA:precio]** /mes" · CTA "Pedir
  este módulo" → "Enviando solicitud..." → bloque verde "Listo — develOP ya lo sabe" (o "Ya
  pediste este módulo" si venía pedido de antes) + "develOP te va a contactar para activarlo."
- **Pausado:** "Tu Motor de Reseñas está pausado. Lo tenés contratado, pero está en pausa. Hablá
  con develOP para reactivarlo."
- **Conectando:** "develOP está terminando de conectar tu Google" + "Estamos dejando lista la
  conexión con tu perfil de Google Business. No tenés que hacer nada — te avisamos apenas esté
  funcionando y tus reseñas van a aparecer acá."
- **Empty operativo (ajuste mínimo, objetivo 3):** "Tu Google ya está conectado. Cuando lleguen
  reseñas van a aparecer acá para responderlas; mientras tanto podés pedir la primera con el QR
  de acá abajo." + CTA ancla "Pedir mi primera reseña" → `#pedir-resenas` (wrapper div sobre
  `AskReviewSection`, sin tocar el componente).

**`[FALTA:precio]`** queda en `LockedView.tsx` (línea del precio), con comentario inline del
mandato. El componente NO importa el catálogo ni recibe precio por prop — imposibilidad
estructural de que se filtre el `priceMonthlyUsd=60` que la vitrina sí muestra.

## Reuso de `requestUpsellAction` + registro admin (Paso 4: cero código)

- El CTA llama `requestUpsellAction('motor-resenas', 'Motor de Reseñas Automático')` (slug y
  nombre EXACTOS del catálogo) **sin parámetro de org** — la action la deriva de la SESIÓN
  (`upsell.ts:14-20`, anti-IDOR estructural). Dedup 24h server-side ya existente
  (`shouldCreateUpsellSubmission`).
- **"Ya lo pediste" persistente**: la página (server) lee `OrganizationModule.upsellRequestCount`
  (query lazy SOLO en la rama locked) → `alreadyRequested = count > 0`. Es el contador que la
  action ya incrementa en cada click; `force-dynamic` lo lee fresco en cada visita.
- **Registro admin CONFIRMADO existente, no se duplicó**: los pedidos caen solos en
  `/admin/leads?tab=demand` (`module-demand.actions.ts` lista `upsellRequestCount > 0`), más
  `ContactSubmission` en la tab Inbound + webhook `LEAD_UPSELL` + notificación in-app
  ACTION_REQUIRED — todo pre-existente de P5.2.

## Verificación (gates reales corridos; build NO es gate)

- ✅ **GATE A** `npm run check:invariant:motor-resenas-view` → **verde** (a la primera).
- ✅ **GATE B** `npx tsc --noEmit` → **sin errores nuevos** (único: baseline `searchconsole.ts:119`).
- ✅ **GATE C** `eslint` sobre los archivos tocados → 0 errores (warning de `package.json` = eslint
  no lintea JSON, no es un problema).
- ✅ **GATE D** invariantes vecinos re-corridos: `gbp-connection` ✓ (el log `rating boom` es el
  test best-effort intencional) · `modules` ✓ · `upsell-dedup` ✓.
- ✅ `npx prisma migrate status` → "Database schema is up to date!" (sin migración).
- ⚠️ **GATE E — visual-qa NO ejecutable en esta sesión**: el subagente reportó que las
  herramientas de preview (`preview_start`/`preview_screenshot`/etc.) no estaban disponibles en
  su entorno (ni siquiera llegó al timeout conocido del preloader). Su **inspección estática**
  dio todo ✅ (3 vistas mapeadas, strokeWidth 1.5, AnimatePresence mode="wait", aria-hidden
  correctos) y **cero ❌**. → **La verificación visual pixel-perfect queda DECLARADA para el
  humano en `:3000`** (fallback previsto por el propio brief; no es regresión).

## Hallazgos del descubrimiento incorporados

- **PAUSED caía en venta** (isModuleActive exige ACTIVE) → variante `isPaused` honesta.
- **`context=gbp` era key muerta** → agregada (el CTA viejo de `:22-56` ya la usaba en vano).
- `companyName` + tokens eran selects muertos en la página → eliminados del `findUnique`.
- El `gbpConnected` local de `page.tsx:157` era el ÚLTIMO criterio propio del repo — con este
  sprint, UI y motor de reglas usan el MISMO criterio (`deriveConnectionStatus`). Cierra también
  el pendiente #2 de P5.1-fix-reviews-rule.

## Fuera de scope (anotado, NO implementado)

- La vitrina muestra `priceMonthlyUsd=60` mientras el pricing "no está cerrado" — inconsistencia
  a resolver cuando se cierre el precio.
- CTA (vitrina y LockedView) en preview de admin falla honesto con "Sesión inválida." (SUPER_ADMIN
  sin `organizationId`) — precedente aceptado de P5.2; si molesta, se arregla en ambas superficies
  en un sprint aparte.
- Selector de sucursal para `CONNECTED_NO_LOCATION('multiple')` — diferido por el brief.
- `PremiumModuleCard` usa `triggerTransition` en portal (contradice CLAUDE.md) — el código nuevo
  NO lo imitó; migrarlo es otro alcance.

## Archivos

**Nuevos (4):** `src/lib/modules/motor-resenas-view.ts` · `motor-resenas-view.invariant.ts` ·
`motor-resenas/_components/LockedView.tsx` · `motor-resenas/_components/ConnectingState.tsx`
**Editados (3):** `motor-resenas/page.tsx` · `package.json` (script) ·
`src/lib/data/message-context.ts` (key `gbp`)
**Intocables respetados:** `src/components/ui/*` (FROZEN — `EmptyStateMuted` consumido tal cual),
`_actions.ts` (su re-chequeo de `isModuleActive` + anti-IDOR queda como defensa en profundidad),
`AskReviewSection`, `ReviewItem`, `upsell.ts`, servicios P3-A.1, admin leads, schema.

## Pendiente del humano (Valentino)

1. **Recorrer en `:3000` los 3 estados como dueño** (desktop + mobile): venta (org sin módulo),
   conectando (org con módulo sin GBP operativo), operativa. Confirmar que la copy vende y es
   honesta. El visual-qa headless no corrió (sin herramientas de preview en la sesión).
2. **`[FALTA:precio]`**: cerrarlo antes de mostrarle la pantalla a un cliente real.
3. **Commitear** cuando revises (lo hacés vos): 4 nuevos + 3 edits.
