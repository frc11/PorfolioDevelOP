# CHANGELOG — lane/cuenta

**Lane:** `lane/cuenta`  
**Branch:** `lane/cuenta` (worktree `C:\lane-cuenta\logic-core-v3\`)  
**Rango de commits:** `f005d4e..040ce97` (20 commits sobre `main`)  
**Fecha de generación:** 2026-06-27  
**Autores:** Valentino Olmedo \+ Claude Opus 4.8

**Qué es este lane:** Rediseño visual de "Mi Cuenta" (`/dashboard/cuenta`: Perfil, Facturación, Bóveda) del Portal Cliente, alineado al sistema de diseño del admin (`admin/clients/[clientId]`). Incluye cleanup de rutas muertas, fix de espacio muerto, sprint de bugs y features funcionales (validación de password, avatar uploader, modal primitivo, flujo de borrado admin via ticket), re-fix de pantalla negra al cambiar password, y reorden de layout con alineación de columnas.

---

## 1\. Docs y cleanup funcional inicial

### `f005d4e` — `docs(cuenta): plan de relevamiento del rediseño visual de Mi Cuenta`

**Archivos:** `_lane-cuenta-plan.md` (+181 líneas)

Relevamiento read-only pre-sprint. Inventario de componentes propios, mapa de divergencia vs ficha admin, decisiones de dirección visual cerradas con el usuario, y la definición del gate del lane (`tsc.cmd --noEmit` \+ lint-on-touched \+ visual-qa; sin `npm run build` — rojo por deuda ajena).

**Decisiones cerradas en esta sesión:**

- Tabs → se mantiene `<Tabs>` subrayado cyan (desviación deliberada; no se migra a píldoras del admin).  
- Hover → `adminHoverCls` string de `src/lib/hover.ts` (NO `HoverScaleCard`, que es admin-internal \+ fuerza client boundary).  
- `Card` variants elevated/interactive/dashed consumidas sin modificar (rojo semántico por override `className` \+ twMerge, NO hornear nuevas variants).

---

### `2c6966e` — `fix(cuenta): rutas muertas de revalidate/links + encoding DangerZone`

**Archivos:**

- `src/lib/actions/profile.ts` (+7/-4)  
- `src/components/dashboard/ProfileForms.tsx` (+3/-3)  
- `src/components/dashboard/SubscriptionBanner.tsx` (+1/-1)  
- `_lane-cuenta-plan.md` (+24)

**Qué cambió:**

- `profile.ts` líneas 64, 93, 235: `revalidatePath('/dashboard/profile')` (ruta muerta, no-op) → `'/dashboard/cuenta/perfil'`. Línea 140: deduplicada (eliminada la no-op; la 141 ya tenía el path correcto).  
- `ProfileForms.tsx` líneas 616, 674: `href="/dashboard/facturacion"` (404) → `'/dashboard/cuenta/facturacion'`.  
- `ProfileForms.tsx` línea 698: `'Ocurri?'` (×2, mojibake `0x3F`) → `'Ocurrió'` (UTF-8 `c3 b3`).  
- `SubscriptionBanner.tsx` línea 19: mismo fix de href.

**Impacto:** tras editar perfil/contacto/password, la vista revalida sin reload manual; "Ver facturación" ya no da 404\.

---

## 2\. Rediseño visual: Sprints 1, 2 y 3

### `a5d511c` — `redesign(cuenta/perfil): full-width grid + card admin + fix toggles`

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/layout.tsx` (+1/-1)  
- `src/app/(protected)/dashboard/cuenta/perfil/page.tsx` (+\~100/-\~115)  
- `src/app/(protected)/dashboard/cuenta/perfil/loading.tsx` (+16/-10)  
- `src/components/dashboard/ProfileForms.tsx` (+43/-48)

**Qué cambió:**

*Layout:*

- `layout.tsx`: `max-w-7xl mx-auto` eliminado → `w-full` (full-width como hermanas Chatbot/Soporte).  
- `perfil/page.tsx`: eliminado `max-w-3xl`. Borradas las 3 consts `GLASS*` y el helper `Section()` (glass inline con `backdropFilter blur(24px)`). Nuevo helper local `SectionCard` \= `<Card variant="elevated" padding="lg">` \+ `<CardTitle>` \+ icono. Tinte rojo por override `className`: Seguridad `border-red-500/20` (suave, sin bg), Zona de peligro `border-red-500/30 bg-red-500/[0.03]` (fuerte). twMerge resuelve el conflicto con el `border-white/10` del variant.  
- Grid `lg:grid-cols-2` para empresa|contacto y seguridad|preferencias. `PlanInfoSection` full-width en stat-row de 4 celdas.

*ProfileForms (paleta zinc-800 → admin):*

- Inputs simples → primitivo `<Input>` de `ui/*`.  
- Composites (whatsapp, 3 campos de password) → wrappers reestilados al espejo del primitivo.  
- Toggles de notificaciones → primitivo `<Toggle>` (`h-6 w-11` track, thumb `h-5 w-5`, `items-center`). Elimina el thumb desbordado/"bulge". Se preservan los `<input type="hidden">` que cargan el estado al submit.  
- `PlanInfoSection`: 4 stats → celdas admin con `adminHoverCls`. Links → fila admin con hover color-only.

*Preservado:* Zod de actions intacto, strength meter, feedback success/error, 5 toggles, rama `isAdminPreview()` (banner ámbar, datos sin forms).

*loading.tsx:* skeleton al chrome nuevo (`rounded-3xl`, grid full-width 2-col).

---

### `26026df` — `redesign(cuenta/facturacion): full-width + receta admin + hover`

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx` (+45/-44)  
- `src/components/dashboard/CurrentPlanCard.tsx` (+57/-52)  
- `src/app/(protected)/dashboard/cuenta/facturacion/loading.tsx` (+9/-8)

**Qué cambió:**

- `page.tsx`: eliminado `mx-auto max-w-5xl`. Cards `bg-[#0c0e12]/80 shadow-2xl backdrop-blur-xl rounded-2xl` → receta admin (`bg-white/[0.02] rounded-3xl border-white/10`). Tipografía `font-black uppercase tracking-widest` → sobria (labels `text-[10px] tracking-[0.24em] zinc-500`, headings `zinc-100`).  
- Tabla invoices: dividers `border-white/5`, th `font-semibold tracking-[0.2em]`; row hover color-only `hover:bg-white/[0.04]` (sin scale en `<tr>` — el scale rompe filas de tabla). Status badges (emerald/amber/red) INTACTOS.  
- Billing-info: `divide-x/divide-y` opaco → grid 4 celdas admin (`sm:grid-cols-2 lg:grid-cols-4`). Stat cells email \+ próxima-fecha con `adminHoverCls`; "Métodos de pago" celda estática; "Actualizar datos" botón-link admin.  
- Banners de renovación: `font-black/bold` → `font-semibold`; semántica red/amber intacta.  
- `CurrentPlanCard`: reescrito sobre `<Card variant="elevated" padding="none">` \+ `overflow-hidden`; filas de servicios/módulos con `adminHoverCls`; `StatusBadge` (cyan/emerald) preservado; total `font-mono font-bold tracking-tight`; icons `strokeWidth={1.5}`.  
- **Post visual-qa:** tooltip "Generando…" `bg-[#0c0e12]` hardcodeado → `bg-zinc-900`; `InvoiceStatusIcon` sin `strokeWidth` → `strokeWidth={1.5}`.

*loading.tsx:* skeleton al chrome nuevo.

---

### `17a9e0a` — `redesign(cuenta/boveda): full-width + de-noise + receta admin`

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/boveda/page.tsx` (+121/-165)  
- `src/components/dashboard/VaultRequestModal.tsx` (+4/-4)  
- `src/components/dashboard/VaultRevealButton.tsx` (+10/-10)  
- `src/app/(protected)/dashboard/cuenta/boveda/loading.tsx` (+12/-9)

**Qué cambió:**

- `page.tsx`: eliminado `mx-auto max-w-6xl`.  
- **Quitado (de-noise):** dot-grid overlay, scanlines, glow ambiental de hover, `glowRgb` \+ `hoverBorder` del `TypeConfig` (y de los 6 entries), sombra negra de hover (`hover:shadow-[…rgba(0,0,0,…)]`), títulos `italic uppercase`, `font-black`.  
- Asset cards: `<div>` glass artesanal → `<Card variant="interactive" padding="lg">` \+ `adminHoverCls`. Color por tipo \= acento puntual (ícono \+ pill), NO tema; superficie del ícono neutra `bg-white/[0.02]`. `isAccess` suma `border-red-500/15` (override twMerge). Footer con `mt-auto` (alturas parejas).  
- Empty state: hand-rolled en server (`<Card variant="dashed">` \+ ShieldCheck icon en JSX) — NO se usó `EmptyState` de `ui/*` (es `'use client'` que recibe `icon` como componente → cruza Lucide por el boundary desde una server page).  
- **Conservado:** badge AES-256 (restyle sutil emerald, ping con `motion-reduce:animate-none`), `VaultRevealButton` (rojo semántico, máscara→link, auto-hide 30s), flujo de `VaultRequestModal`. Timeline `ACTIVITY_LOG` re-skineado al idioma admin (chrome sobrio) pero **sigue siendo data hardcodeada/fake** — el modelo real requiere schema, parada aparte.  
- `VaultRevealButton`: de-noise tipográfico únicamente; la lógica/efecto intactos.  
- `VaultRequestModal`: restyle menor (sin portal aún — migración al `Modal` primitivo se planificó para Fase 4).  
- `boveda/loading.tsx`: skeleton full-width (header \+ grid 3-col `rounded-2xl` \+ timeline `rounded-3xl`).

---

### `6122eca` — `docs(cuenta): log de ejecución de los 3 sprints visuales`

**Archivos:** `_lane-cuenta-plan.md` (+81)

Log de ejecución de los Sprints 1-3, gates, decisiones cosmáticas, y pendientes fichados para el humano.

---

## 3\. Ajuste de espacio muerto inferior

### `fde9bdb` — `fix(cuenta): elimina espacio muerto inferior en las 3 tabs`

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/layout.tsx` (+1/-1)  
- `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx` (+1/-1)  
- `src/app/(protected)/dashboard/cuenta/facturacion/loading.tsx` (+1/-1)  
- `src/app/(protected)/dashboard/cuenta/boveda/page.tsx` (+1/-1)  
- `src/app/(protected)/dashboard/cuenta/boveda/loading.tsx` (+1/-1)  
- `_lane-cuenta-plan.md` (+22)

**Causa:** `pb-20` apilado — `layout.tsx` (5rem) \+ pages de facturación/bóveda (otro `pb-20` c/u) \+ sus loadings → \~10rem de padding-bottom muerto al final del scroll. Perfil sólo sufría los 5rem del layout.

**Fix:** el padding inferior queda en una sola fuente:

- `layout.tsx`: `pb-20` → `pb-6` (1.5rem, alineado al ritmo `gap-6` del portal).  
- `facturacion/page.tsx`, `boveda/page.tsx`: eliminado `pb-20`.  
- `facturacion/loading.tsx`, `boveda/loading.tsx`: eliminado `pb-20`.

**No tocado:** el shell `DashboardLayoutClient` (FROZEN). La card frosted full-height del portal (área `flex-1` con `backdrop-blur-md`) siempre llena el viewport — eso es intencional (marco-card del portal), no banda atribuible a cuenta.

**Fuera de scope (fichado):** `cuenta/loading.tsx` (route padre que sólo hace redirect a `/perfil`, prácticamente nunca se renderiza) tiene el mismo `pb-20` \+ `max-w-5xl` stale — latente menor.

---

## 4\. Sprint bugs \+ features (Fases 0–5)

### `f0b6c77` — `chore(cuenta): relevamiento password+avatar+facturas+delete-ticket`

**Archivos:** `_lane-cuenta-plan.md` (+29)

Relevamiento Fase 0 (read-only). Hallazgos por área:

**A — Password:** Zod sin reqs mayúscula/número (sólo cliente); inputs no-controlados que React 19 resetea; visor invertido (ojo tachado \= mostrar); pantalla negra \= `unstable_update({})` vacío \+ `revalidatePath` con cookie sessionVersion N antes de aplicar N+1. Fix viable en `profile.ts` (editable); `auth.ts` NO se toca.

**B — Avatar:** `Organization` ya tiene `avatarImageUrl/avatarEmoji/avatarInitials`. `ClientAvatarField` self-contained (no contexts/guards admin). `avatarImageUrlSchema` acepta `data:image base64`. → rama "SÍ puede", sin schema/auth.

**C — Facturas:** `Invoice` existe en schema pero CERO generación en producción (sólo seed). El flujo deseado (opción factura en generador admin → PDF → historial) implica `AssetType.INVOICE` (schema) \+ librería PDF \+ form admin nuevo. → **PARADA. No se implementa en este sprint.**

**D — Eliminación→Ticket:** `requestAccountDeletionAction` guarda `organizationId` en el ticket. `hardDeleteClient` \+ `TypeToConfirmDialog` existen en `ClientsListClient.tsx` (sin deep-link). → Fase 5 viable via `?delete=<orgId>`, sin schema.

---

### `8b641a0` — `fix(cuenta/perfil): validación y UX de cambio de contraseña` *(Fase 1\)*

**Archivos:**

- `src/components/dashboard/ProfileForms.tsx` (+22/-7)  
- `src/lib/actions/profile.ts` (+5/-3)  
- `src/lib/actions/schemas.ts` (+4/-2)

**Qué cambió:**

- `UpdatePasswordSchema`: agregados `.regex(/[A-Z]/)` y `.regex(/[0-9]/)` a `newPassword` (antes sólo en el cliente).  
- Submit disabled hasta los 3 reqs (`strength.score === 3`). Cartel "Falta: …" arriba de los chips cuando `newPw.length > 0 && missing.length > 0`.  
- `currentPassword` → controlado con `useState` (React 19 reseteaba los no-controlados en form-action; `confirmPassword` puede borrarse, ok por spec).  
- Visor des-invertido: `{showX ? <Eye/> : <EyeOff/>}` (ojo abierto \= muestra) \+ aria-labels.  
- `profile.ts`: `unstable_update({})` vacío → `unstable_update({ user: { passwordResetRequired: false } })` (payload no vacío, espejo de `/cambiar-password`); eliminado `revalidatePath('/dashboard/cuenta/perfil')` (la password no se muestra en perfil, no hay nada que revalidar). `auth.ts` NO tocado.

**Nota:** este fix resolvió la acción pero NO el call site. El bug de pantalla negra persistió. Ver bloque "Re-fix" más abajo.

---

### `31bfd39` — `fix(cuenta/facturacion): hover métodos de pago + altura botón actualizar` *(Fase 2\)*

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx` (+3/-3)

**Qué cambió:**

- Celda "Métodos de pago": agregado `adminHoverCls` (era la única de las 4 sin hover).  
- Celda "Actualizar datos": `div flex items-center` → `div flex` \+ link `h-full w-full` → el botón se estira a la altura de la fila.

---

### `6c83b16` — `feat(cuenta/perfil): avatar uploader admin (imagen/emoji/iniciales)` *(Fase 3\)*

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/perfil/page.tsx` (+6/-6)  
- `src/components/dashboard/ProfileForms.tsx` (+60/-69)  
- `src/lib/actions/profile.ts` (+7/-5)  
- `src/lib/actions/schemas.ts` (+3/-2)

**Qué cambió:**

- `CompanyDataForm`: campo "URL del logo" (text input) → `<ClientAvatarField>` (uploader imagen base64 \+ emoji \+ iniciales) con 3 hidden inputs (`avatarImageUrl/avatarEmoji/avatarInitials`).  
- `ProfileHeader`: `logoUrl` de initials-del-nombre → `<ClientAvatar>` compartido (resolver imagen → emoji → iniciales → Building2 icon). Fallback pasa de iniciales-del-nombre a ícono Building2 (paridad admin).  
- `UpdateProfileSchema` \+ `updateProfileAction`: reemplazan `logoUrl` por `avatarImageUrl` (reusa `avatarImageUrlSchema`, acepta `data:image base64`) \+ `avatarEmoji` (max 8\) \+ `avatarInitials` (max 2). `logoUrl` queda **intacto en DB** (tickets/legacy lo siguen leyendo; el cliente ya no lo edita).  
- `perfil/page.tsx`: select clause suma `avatarImageUrl/avatarEmoji/avatarInitials`; pasa los 3 campos a `CompanyDataForm` y `ProfileHeader`.

---

### `f86c911` — `refactor(cuenta/boveda): solicitar-documento usa Modal primitivo con backdrop` *(Fase 4\)*

**Archivos:**

- `src/components/dashboard/VaultRequestModal.tsx` (+64/-110)

**Qué cambió:**

- `VaultRequestModal`: del overlay `fixed inset-0 z-50` hand-rolled al `<Modal>` de `ui/*` (porta a body, backdrop `bg-black/70 backdrop-blur-sm`, header con X). Eliminados: backdrop div propio, header/X propios, handler de Escape propio (el primitivo no lo trae), `useCallback`. `closeOnBackdrop={!isPending}` evita cerrar durante el envío.  
- Flujo preservado: textarea, validación, `sendClientMessageAction`, estado success, botones Cancelar/Enviar.  
- **Wart:** el handler de Escape se quitó (el primitivo `Modal` cierra por backdrop/X/Cancelar; Escape no está implementado en él).

---

### `fe32886` — `feat(admin/tickets): aprobar solicitud de eliminación → hard-delete existente` *(Fase 5\)*

**Archivos:**

- `src/app/(protected)/admin/tickets/_components/ticket-chat.tsx` (+33/-2)  
- `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx` (+44/-11)

**Qué cambió:**

`ticket-chat.tsx`:

- Bloque rojo "¿Aprobar solicitud de eliminación?" **SÓLO** cuando `ticket.title === 'Solicitud de eliminación de cuenta'` (literal de `requestAccountDeletionAction`).  
- "Ir a borrar" \= `<Link href={/admin/clients?delete=${ticket.organizationId}}>` (nav admin, NOT `router.push`). Deposita al admin en el hard-delete correcto SIN ejecutar nada.  
- "Cancelar" \= estado local `deletionDismissed`; oculta el bloque.

`ClientsListClient.tsx`:

- `useSearchParams` \+ `useEffect` \+ ref-guard `didAutoOpenDelete` para auto-abrir el `TypeToConfirmDialog` existente al leer `?delete=<orgId>`.  
- `deleteTargetId` state unificado (lo setean tanto la selección manual como el deep-link); `confirmDelete()` lo consume.  
- `hardDeleteClient` (SUPER\_ADMIN), `getClientDeletionSummary` y `TypeToConfirmDialog` REUSADOS sin modificar. Sin schema.  
- **Wart:** `?delete=` queda en la URL tras abrir el dialog (un refresh manual re-abriría el dialog; el deep-link SÓLO ABRE, nunca borra → sin riesgo de borrado accidental).

**Nota de scope:** este commit toca `/admin/tickets/_components/` y `/admin/clients/_components/` dentro del worktree `lane/cuenta`. Fue autorizado explícitamente por Valentino. Tenerlo presente al revisar el diff en el merge.

---

### `1393632` — `docs(cuenta): log de ejecución Fases 1-5 + cierre`

**Archivos:** `_lane-cuenta-plan.md` (+16)

---

## 5\. Re-fix: pantalla negra al cambiar password

El fix de Fase 1 (`8b641a0`) espejó la **action** pero no el **call site**. El bug persistió.

### `7a6ee10` — `chore(cuenta): re-diagnóstico pantalla negra password`

**Archivos:** `_lane-cuenta-plan.md` (+21)

**Causa raíz identificada (sin tocar código):**

`PasswordForm` usaba `<form action>` \+ `useActionState`. Next re-renderiza el route **same-response con el cookie viejo (sessionVersion N)** antes de que el `Set-Cookie` de `unstable_update` (N+1) sea un request-cookie. El jwt callback de `auth.ts` (FROZEN) tiene rama `shouldRefreshFromDb = ... || !user` → en **cada request normal** re-lee DB y, si `token.sessionVersion (N) !== DB (N+1)`, devuelve `null` → sesión muerta. El middleware `proxy.ts` rebota `/dashboard/...` → `/login`; pero el cookie ya quedó N+1, así que `/login` re-evalúa autenticado y rebota a `DASHBOARD_PATH` → baile de redirects, preloader "Rendering…" colgado.

`/cambiar-password` (que sí anda): llama la action **directamente** via `startTransition(async () => { const r = await cambiarPasswordAction(...); if (r.ok) router.push('/dashboard') })`. El `router.push` (o `router.refresh()`) ocurre DESPUÉS del `await` → el nuevo request ya lleva el cookie N+1 → no hay kill.

**Conclusión:** se arregla SIN tocar `auth.ts` (su jwt callback es correcto). Fix en el call site: `PasswordForm`.

---

### `2730502` — `fix(cuenta/perfil): sincroniza token tras cambio de password (evita kill de sesión)`

**Archivos:**

- `src/components/dashboard/ProfileForms.tsx` (+29/-5)

**Qué cambió:**

- `PasswordForm`: de `<form action={action}>` \+ `useActionState` → `<form onSubmit={handleSubmit}>` \+ `useState` (state) \+ `useTransition`.  
- `handleSubmit`: `preventDefault`, guard `strength.score < 3`, `new FormData(event.currentTarget)`, `startTransition(async () => { const r = await updatePasswordAction(null, fd); setState(r); if (r?.success) { reset campos + form.reset() + router.refresh() } })`.  
- `router.refresh()` ocurre en un request **separado** (después del await), cuando el cookie ya es N+1 → no hay mismatch → no hay kill. Espejo exacto de `CambiarPasswordForm.tsx` de `/cambiar-password`.  
- `profile.ts` NO se tocó (su `unstable_update` ya seteaba el cookie correctamente desde Fase 1).  
- Preservados: validación 3-reqs, cartel "Falta:", visor des-invertido, preserve-on-fail (ahora natural sin form-action).

**PENDIENTE DE VERIFICACIÓN HUMANA:** el bug sólo se reproduce con sesión autenticada y cambio real de password. El gate (tsc \+ lint \+ visual-qa estático) no puede probarlo.

---

### `b31d76b` — `docs(cuenta): cierre re-fix pantalla negra password (pendiente verif humana)`

**Archivos:** `_lane-cuenta-plan.md` (+7)

---

## 6\. Layout Perfil: reorden de columnas \+ alineación

### `b9a8565` — `layout(cuenta/perfil): reordena paneles en 2 columnas + zona de peligro full-width`

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/perfil/page.tsx` (+72/-52)  
- `src/app/(protected)/dashboard/cuenta/perfil/loading.tsx` (+14/-10)  
- `_lane-cuenta-plan.md` (+16)

**Problema:** "Datos de empresa" (izq) y "Datos de contacto" (der) iban lado a lado con `SectionCard h-full` → se igualaban en altura → Contacto (poca info) quedaba con un hueco vertical enorme abajo.

**Cambio (SÓLO layout, cero contenido/lógica):**

- `SectionCard`: quitado `h-full` (era quien forzaba alturas iguales). `cn` quedó sin uso → removido el import.  
- Los 2 `lg:grid-cols-2` previos → un único `grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start` con 2 columnas (`div.flex.flex-col.gap-6` c/u): **izq \= Datos de empresa \+ Seguridad**; **der \= Datos de contacto \+ Preferencias de notificaciones \+ Información del plan**.  
- `lg:items-start` → cada card a su altura natural. Contacto comprimido, Preferencias sube directo abajo, sin hueco.  
- Zona de peligro: fuera del grid → bloque full-width al fondo (sobre las 2 columnas).  
- Mobile (`grid-cols-1`): columna apilada (empresa → seguridad → contacto → preferencias → plan → zona de peligro).  
- `loading.tsx`: skeleton alineado al nuevo layout.

---

### `7adeae6` — `layout(cuenta/perfil): alinea columnas arriba y abajo (mismo borde inferior)`

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/perfil/page.tsx` (+6/-4)  
- `src/app/(protected)/dashboard/cuenta/perfil/loading.tsx` (+2/-2)  
- `_lane-cuenta-plan.md` (+4)

**Problema:** las 2 columnas arrancaban parejas arriba pero terminaban descalzadas abajo (izq 2 paneles vs der 3).

**Cambio (1 token):** quitado `lg:items-start` del grid → items-stretch por defecto → ambas celdas-columna comparten la altura de la más alta → mismo borde inferior. Las cards adentro siguen sin `h-full` → altura natural (Contacto NO vuelve a estirarse). El sobrante de la columna corta cae como espacio al fondo.

**Nota:** este commit dejó un hueco negro visible entre "Seguridad" y "Zona de peligro" (el contenedor se estiraba, pero las cards quedaban arriba). Ver fix siguiente.

---

### `040ce97` — `fix(cuenta/perfil): estira última card de cada columna al fondo (elimina hueco negro)`

**Archivos:**

- `src/app/(protected)/dashboard/cuenta/perfil/page.tsx` (+4/-3)  
- `src/app/(protected)/dashboard/cuenta/perfil/loading.tsx` (+2/-2)  
- `_lane-cuenta-plan.md` (+9)

**Problema:** `items-stretch` estiraba el contenedor invisible de la columna, pero las cards (`flex-col`, top-packed) quedaban arriba → hueco negro visible entre "Seguridad" y "Zona de peligro".

**Fix:** la ÚLTIMA card de cada columna crece para llenar la altura compartida:

- Izq "Seguridad": `<FadeIn className="lg:flex-1">` \+ `<SectionCard className="border-red-500/20 lg:h-full">`.  
- Der "Información del plan": `<FadeIn className="lg:flex-1">` \+ `<SectionCard className="lg:h-full">`.  
- Cadena en lg: `grid lg:grid-cols-2` (items-stretch) → cada columna `div.flex.flex-col` con altura definida (de la celda del grid) → último `FadeIn` `lg:flex-1` (crece al free-space) → `SectionCard` `lg:h-full` (la card llena el FadeIn) → borde inferior de Seguridad \== borde inferior de Información del plan. La card se ve más alta (contenido arriba, padding abajo) — aceptado.  
- Sólo la última card de cada columna: empresa/contacto/preferencias quedan a altura natural; Contacto NO vuelve a estirarse.  
- Todo `lg:`\-gated → mobile \= stack natural de 1 columna.  
- `loading.tsx`: último skeleton de cada columna con `lg:flex-1`.

**PENDIENTE DE VERIFICACIÓN HUMANA:** el render pixel-exacto (borde Seguridad \== borde Plan, cero hueco negro sobre Zona de peligro) requiere eyeball en `/dashboard/cuenta/perfil` autenticado.

---

## Decisiones de diseño y arquitectura

Estas decisiones están cerradas y son relevantes para el trabajo futuro en el portal cliente.

### Hover: `adminHoverCls`, no `HoverScaleCard`

`HoverScaleCard` (`admin/clients/_components/`) es admin-internal y fuerza client boundary → no se importa en el portal cliente. El mecanismo del lane es `adminHoverCls` (string CSS en `src/lib/hover.ts`): `hover:scale-[1.015] hover:shadow-[…] hover:ring-1 hover:ring-white/15 motion-reduce:…`. Funciona en cards server-rendered sin client boundary.

### Card: rojo por `className` \+ twMerge, nunca variants nuevas

Agregar tinte rojo (Seguridad/Zona de peligro) por override `className` en `SectionCard`: Seguridad `border-red-500/20` (suave), Zona de peligro `border-red-500/30 bg-red-500/[0.03]` (fuerte). twMerge resuelve el conflicto con el `border-white/10` del variant. `Card.tsx` (frozen) NO se modifica.

### Avatar: `avatar*` vs `logoUrl`

`Organization` tiene dos paths separados: `logoUrl` (legacy, editado por el cliente en el sistema viejo, leído por tickets) y `avatarImageUrl/avatarEmoji/avatarInitials` (moderno, escrito por el admin y ahora también por el cliente). El lane migró el portal cliente al path `avatar*`; `logoUrl` queda intacto en DB. `ClientAvatarField` (self-contained) y `ClientAvatar` (resolver) viven en `src/modules/chatbot/components/admin/client-avatar/` y son reutilizables desde el portal.

### Password: acciones que tocan `sessionVersion` → llamada directa, NO `<form action>`

`<form action>` \+ `useActionState` dispara un re-render same-response del route con el cookie viejo (N) antes de que el `Set-Cookie` de `unstable_update` (N+1) sea un request-cookie. El jwt callback de `auth.ts` (FROZEN) mata la sesión al detectar el mismatch N≠N+1. Regla: acciones que incrementan `sessionVersion` se llaman directamente (`startTransition` \+ `await`) y la navegación/refresh ocurre DESPUÉS del await. Patrón canónico: `CambiarPasswordForm.tsx`.

### Empty state en server pages: hand-roll en JSX, no `EmptyState` de `ui/*`

`EmptyState` es `'use client'` y recibe `icon` como componente → pasar un Lucide desde una server page cruza una función por el boundary → la página no renderiza. En server pages, hand-roll el empty state en JSX (`<Card variant="dashed">` \+ icono en JSX directo).

### Ticket de eliminación: discriminador por `title` literal

No hay categoría dedicada sin schema. El discriminador es `ticket.title === 'Solicitud de eliminación de cuenta'` — este es el literal exacto que escribe `requestAccountDeletionAction`. Si ese string cambia en la action, el bloque de aprobación en `ticket-chat.tsx` deja de mostrarse.

### Facturas: sólo relevamiento, sin implementación

`Invoice` existe en schema pero sin generación en producción (sólo seed). El flujo deseado (opción factura en el generador admin → PDF → historial en la Bóveda) implica `AssetType.INVOICE` (cambio de enum en schema) \+ librería PDF \+ form admin nuevo \+ poblar `Invoice.pdfUrl`. Es una tarea de schema \+ infra separada. En este lane: **parada, no implementado**.

---

## Pendientes, paradas y deuda fichada

Estos ítems quedaron abiertos al cerrar el lane. Son relevantes para el merge y el trabajo futuro.

### 1\. Facturas — SÓLO relevamiento (parada de schema)

El flujo deseado (generador admin → opción "factura" → PDF → historial en la Bóveda del cliente) requiere:

- `AssetType.INVOICE` (cambio de enum en `schema.prisma`)  
- Librería PDF (no está en el stack)  
- Form admin nuevo en el generador de la Bóveda  
- Poblar `Invoice.pdfUrl`

**No se implementó nada.** El historial de pagos (`Invoice`) sigue vacío en producción (sólo el seed de demo tiene datos). La Bóveda muestra el estado real (sin items o sólo los assets que ya existían). Esta es una **tarea propia aparte**.

### 2\. Timeline real de la Bóveda — placeholder

El "Registro de integridad y accesos" sigue siendo data hardcodeada (`ACTIVITY_LOG` en `boveda/page.tsx`). El chrome fue re-skineado al idioma admin, pero los datos son fake. El modelo de actividad real requiere schema. **Parada aparte.**

### 3\. Wart: `?delete=` queda en la URL

Tras abrir el `TypeToConfirmDialog` via deep-link desde el ticket de eliminación, el param `?delete=<orgId>` queda en la URL. Un refresh manual re-abriría el dialog (ref-guarded: la primera vez se auto-abre, las siguientes no). El deep-link SÓLO ABRE el confirm, nunca ejecuta el borrado → sin riesgo de borrado accidental. Wart menor de UX.

### 4\. Wart: `VaultRequestModal` sin handler de Escape

Tras migrar al `Modal` primitivo (Fase 4), el handler de Escape propio se quitó. El primitivo cierra por backdrop click / X / botón Cancelar. Escape no está implementado en el `Modal` de `ui/*`. Wart de UX menor.

### 5\. Deuda pre-existente: `react-hooks/set-state-in-effect` en `VaultRevealButton.tsx:21`

`setRemaining(HIDE_AFTER_SECONDS)` dentro de un `useEffect` — línea pre-existente, no tocada por el lane. El fix implica un cambio de comportamiento del effect (commit propio, fuera de scope de un lane visual). Fichado como baseline.

### 6\. Deuda pre-existente: tooltip "Generando…" puede clipearse

El tooltip del status "generando PDF" en la tabla de facturas flota dentro de `<table overflow-x-auto>` → puede clipearse en el borde derecho en viewports angostos. Necesitaría portal. Edge-case PAID-sin-pdfUrl. Pre-existente al reskin, fichado.

### 7\. Deuda pre-existente: `Eye`/`EyeOff` en `PasswordForm` sin `strokeWidth={1.5}`

Los iconos del visor de password no llevan `strokeWidth={1.5}`. Estilo pre-existente del archivo (no es regresión del lane). Cosmético menor.

### 8\. `cuenta/loading.tsx` stale (route padre)

El `loading.tsx` del route padre (`/dashboard/cuenta/`, que sólo hace redirect a `/perfil`) tiene `pb-20` y `max-w-5xl` stale. Prácticamente nunca se renderiza. Latente menor, fuera de scope.

---

## Verificaciones humanas pendientes

El gate automático del lane (tsc \+ lint \+ visual-qa estático) **no pudo verificar** los siguientes escenarios porque requieren un server con sesión autenticada:

| \# | Escenario | Estado |
| :---- | :---- | :---- |
| 1 | **Password end-to-end**: cambiar password logueado → no pantalla negra, no desloguea, no rebota a /dashboard, queda en /perfil | ⏳ pendiente |
| 2 | **Avatar**: subir imagen / setear emoji / setear iniciales → persisten tras guardar, se ven en ProfileHeader | ⏳ pendiente |
| 3 | **Modal backdrop Bóveda**: abrir "Solicitar documento" → backdrop oscurecido/desenfocado, X cierra, backdrop click cierra (si no isPending) | ⏳ pendiente |
| 4 | **Ticket → borrar end-to-end**: abrir ticket "Solicitud de eliminación de cuenta" como SUPER\_ADMIN → ver bloque rojo → "Ir a borrar" → llega a ClientsListClient con el dialog abierto para el cliente correcto | ⏳ pendiente |
| 5 | **Alineación de columnas Perfil**: borde inferior de "Seguridad" \== borde inferior de "Información del plan"; cero hueco negro entre columnas y "Zona de peligro" | ⏳ pendiente |
| 6 | **Visual fino** de las 3 vistas desktop \+ mobile: hover percibible (scale 1.015 \+ ring), grid/espaciado, contraste, mobile 390px | ⏳ pendiente |

---

## Notas de merge

1. **Fase 5 toca `/admin`:** el commit `fe32886` modifica `src/app/(protected)/admin/tickets/_components/ticket-chat.tsx` y `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx` — fuera de la carpeta `cuenta/`, pero dentro del worktree `lane/cuenta`. Fue autorizado explícitamente. Revisarlo aparte en el diff del merge para asegurarse de que no conflictúe con otros trabajos en `/admin`.  
     
2. **2 intentos de layout en Perfil:** los commits `7adeae6` (quitó `items-start`, introdujo hueco negro) y `040ce97` (fix real: flex-1+h-full en última card) son un par — el primero es un intento fallido que queda en el historial. El estado final correcto está en `040ce97`. Al revisar el diff, mirar el resultado final, no los pasos intermedios.  
     
3. **`logoUrl` intacto en DB:** el avatar del portal cliente escribe `avatarImageUrl/avatarEmoji/avatarInitials`, NO `logoUrl`. `logoUrl` sigue en la DB y es leído por tickets/legacy. No hay migración de datos ni riesgo de pérdida.  
     
4. **Todas las verificaciones humanas de la tabla anterior están pendientes antes de declarar el lane production-ready.**  
     
5. **Facturas no implementadas:** el Historial de pagos en Facturación sigue vacío en producción. Ningún cambio de schema ni de infra en este lane.  
     
6. **`auth.ts` intacto:** el jwt callback (FROZEN) no fue modificado. El fix de pantalla negra vive exclusivamente en el call site (`PasswordForm` en `ProfileForms.tsx`).
