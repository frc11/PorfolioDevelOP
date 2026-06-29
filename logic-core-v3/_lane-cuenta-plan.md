# Lane `lane/cuenta` — Rediseño visual de "Mi Cuenta" (Portal Cliente)

> **Sesión = RELEVAMIENTO.** Cero código tocado. Entregable de esta sesión: este plan
> (fuente de verdad del lane). **No se commitea código en esta sesión.**

---

## Context

`/dashboard/cuenta` (Perfil + Facturación + Bóveda) **ya anda end-to-end**: datos reales +
Zod, `ClientAsset` reales en la Bóveda, impersonation read-only. El problema es **estético**:
cada sub-vista se construyó con su propio lenguaje visual (glass inline en Perfil, cards
opacas `#0c0e12` con tipografía `font-black` en Facturación, tema "vault" con dot-grid/glow/
scanlines en Bóveda) y **ninguna hereda el sistema de diseño del admin**. La misión es
**re-skin + paridad + cleanup**, anclando todo a la ficha tabbeada del admin
(`admin/clients/[clientId]`) — NO inventar estética nueva.

Además el relevamiento encontró **bugs funcionales** de ruteo: `revalidatePath` y `<Link>`
que apuntan a rutas **muertas** (`/dashboard/profile`, `/dashboard/facturacion` no existen
como page), por lo que tras editar perfil/contacto/password **la página no revalida** (datos
viejos hasta refresh manual) y "Ver facturación" da 404. Y un char roto ("Ocurri?" en vez de
"Ocurrió") en la Zona de peligro.

**Decisiones de dirección visual (cerradas con el usuario en esta sesión):**
1. **Tabs** → se mantiene el `<Tabs>` compartido (subrayado cyan). Es una **desviación DELIBERADA del 1:1 con la ficha admin** (que usa píldoras): el subrayado es el primitivo compartido, ya cumple no-router.push y es consistente con el resto del portal. → *no hay sprint de tabs*.
2. **Bóveda** → alinear a la receta Card admin + `adminHoverCls` + tipografía sobria + paleta cyan/zinc, **conservando el sello de seguridad** (badge AES-256, flujo de revelar `VaultRevealButton`, timeline como placeholder pulido). Se quita el ruido: dot-grid, scanlines, glow ambiental, títulos italic-uppercase, sombra negra de hover.
3. **Perfil** → reemplazar el `<Section>` (glass inline) por el `<Card>` compartido (`variant="elevated"`) + `CardTitle`; **tinte rojo SOLO** en Seguridad y Zona de peligro (override `className`), resto card neutra admin.

---

## Mecanismo de hover y cards — confirmado en código (evita acoplar a frozen/admin)

- **`Card` (frozen `ui/Card.tsx`):** las variants **`elevated` / `interactive` / `dashed`** (y `default`, `subtle`, `highlighted`, etc.) **existen y se exportan**; `CardTitle` también (vía `ui/index.ts`). → **se USAN tal cual**. Para Seguridad/Zona de peligro, el tinte rojo va por **override de `className`** (`border-red-500/30 bg-red-500/[0.03]`): `cn = twMerge(clsx(...))`, así que tailwind-merge **resuelve el conflicto** (gana el override). **NO se hornea ninguna variant nueva en `Card.tsx`** (sería frozen).
- **Hover:** `HoverScaleCard` vive en `admin/clients/_components/HoverScaleCard.tsx` → es **interno del admin (NO `ui/*`) y client component**. **NO se importa** (acoplaría a internals del admin + forzaría client boundary en cards server). El mecanismo del lane es **`adminHoverCls`** (`src/lib/hover.ts`, string CSS puro ya probado en `SoporteBoard.tsx`): `hover:scale-[1.015]` + `hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]` + `hover:ring-1 hover:ring-white/15` + guards `motion-reduce`. Al ser CSS, funciona en cards **server-rendered** sin client boundary, y el `ring` evita desbordar el padding.

## Referencia de paridad — recetas del admin (read-only, NUNCA editar)

| Pieza | Receta admin (anclar a esto) |
|---|---|
| **Card grande** | `<Card variant="elevated" padding="lg">` → `rounded-3xl border-white/10 bg-white/[0.02]` + `p-6`. |
| **Card interactiva** | `variant="interactive"` → `rounded-2xl … hover:bg-white/[0.04]`. |
| **Card vacía** | `variant="dashed"`. |
| **Label/eyebrow** | `CardTitle` (`text-[10px] uppercase tracking-[0.2em] text-zinc-500`) o inline `tracking-[0.24em]`. |
| **Heading** | `text-2xl font-semibold tracking-tight text-zinc-100`. |
| **Hover card chica/asset/stat** | **`adminHoverCls`** (string). Aceptación visual = `scale 1.015` + ring blanco + sombra. |
| **Hover de row** (InfoRow) | `transition-colors hover:border-white/15 hover:bg-white/10`. |
| **Card grande de contenido** | **estática, sin scale** (admin `InternalNotesCard`/`PlanAssignmentCard` no llevan hover). |
| **Acentos** | cyan (primario/activo), emerald (ok), amber (warning), red (peligro), zinc (secundario). |
| **Spacing** | top-level `space-y-6`; internos `space-y-3/4`; gaps `gap-3/4/6`. |

---

## (a) Inventario de componentes propios

**Rutas** (`src/app/(protected)/dashboard/cuenta/`):
- `page.tsx` — Server, sólo `redirect('/dashboard/cuenta/perfil')`.
- `layout.tsx` — Server. `flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20` + `<PageHeader eyebrow="Configuración" title="Mi cuenta">` + `<CuentaTabs>` + `<div>{children}</div>`.
- `loading.tsx` / `error.tsx` — `LoadingState` skeleton / `SectionErrorBoundary tone="amber"`.
- `perfil/page.tsx` — Server. `max-w-3xl`. Define `Section()` (glass inline `rounded-xl p-5` + `style` con `backdropFilter blur(24px)`, 3 variantes `GLASS`/`GLASS_RED_SOFT`/`GLASS_RED_STRONG`). 7 secciones en `<FadeIn>` escalonado. **Branch read-only bajo `isAdminPreview()`** (banner ámbar + datos sin forms). + `perfil/loading.tsx`.
- `facturacion/page.tsx` — Server. `max-w-5xl`. Banners de renovación (red/amber), grid `lg:grid-cols-3` (CurrentPlanCard + tabla invoices `lg:col-span-2`), grid de billing info. Cards `rounded-2xl border-white/10 bg-[#0c0e12]/80 shadow-2xl backdrop-blur-xl`, tipografía `font-black uppercase tracking-widest`. + `facturacion/loading.tsx`.
- `boveda/page.tsx` — Server (`force-dynamic`). `max-w-6xl`. Header de badges (AES-256, count) + grid de asset cards (`group hover:scale-[1.02]` + sombra negra + dot-grid + glow + scanline) + **timeline hardcodeado** "Registro de Integridad y Accesos". + `boveda/loading.tsx`.

**Componentes** (`src/components/dashboard/`):
- `CuentaTabs.tsx` — Client. `usePathname()` → `<Tabs items activeHref layoutId="cuenta-tabs">`. **Navega con `<Link>` (cumple no-router.push).**
- `ProfileForms.tsx` — Client (789 líneas). 7 exports: `ProfileHeader`, `CompanyDataForm`, `ContactSection`, `PasswordForm` (strength meter), `NotificationPrefsForm` (5 toggles), `PlanInfoSection`, `DangerZone` (idle→confirm→done). Inputs paleta **zinc-800** (`border-zinc-700/80 bg-zinc-800/60`). Helpers inline.
- `CurrentPlanCard.tsx` — Server. Plan/servicios/módulos premium. `rounded-2xl bg-[#0c0e12]/80`.
- `VaultRequestModal.tsx` — Client. `fixed inset-0 z-50` **sin portal** (no usa `Modal`). Llama `sendClientMessageAction`.
- `VaultRevealButton.tsx` — Client. Glass rojo, máscara → link, auto-hide 30s.

**Acciones/queries:**
- `lib/actions/profile.ts` — `updateProfileAction`, `updateContactAction`, `updateNotificationPrefsAction`, `updatePasswordAction`, `requestAccountDeletionAction`. Zod (`UpdateProfileSchema`, `UpdatePasswordSchema`), sesión/rol OK, multi-tenant por `organizationId` de sesión.
- `lib/billing/get-current-plan.ts` — `getCurrentPlan(orgId)`.

**Hallazgos puntuales localizados:**
- **Timeline Bóveda**: `ACTIVITY_LOG` hardcodeado `boveda/page.tsx:98–103` (shape `{icon, actor, action, resource, time, isAdmin}`), render inline `~318–354`. → **queda placeholder pulido** (modelo real = schema, parada aparte).
- **Rutas muertas** (confirmado: no existe page para `/dashboard/profile` ni `/dashboard/facturacion`):
  - `profile.ts:64, 93, 235` → `revalidatePath('/dashboard/profile')` (no-op; debe ser `/dashboard/cuenta/perfil`). *La acción de `:140` ya tiene además el path correcto; las otras 3 no revalidan nada.*
  - `ProfileForms.tsx:616, 674` → `<Link href="/dashboard/facturacion">` (404; debe ser `/dashboard/cuenta/facturacion`).
  - `SubscriptionBanner.tsx:19` → mismo link muerto (mismo bug de ruta).
- **Char roto**: `ProfileForms.tsx:698` `'Ocurri? un error inesperado.'` (×2 en la línea) → `'Ocurrió…'`.

---

## (b) Consumo de compartidos/frozen + hover HOY

- `CuentaTabs` → `Tabs`, `TabItem` de `@/components/ui` (frozen). El resto de páginas **no usan primitivas `ui/*`**: cards con divs + glass inline / clases crudas.
- Animación: `FadeIn` en las 3 vistas; `StaggerContainer/Item` en Bóveda; `motion/react` directo en `ProfileForms`/`VaultRequestModal`/`VaultRevealButton`. **No** usan `AnimatedCounter`/`AnimatedProgressBar`.
- **Hover hoy**: TODO Tailwind crudo (color/borde). Único scale: asset cards de Bóveda. **`adminHoverCls` NO adoptado en el portal cliente** (única excepción: `SoporteBoard.tsx`). → el re-skin lo introduce donde corresponde.
- **Trap de backdrop-filter**: `DashboardLayoutClient` pone el `backdrop-blur-md` en un **`<div>` hermano** (no en `<main>`), **a propósito**, para no atrapar `position:fixed`. → los modales del portal cliente **NO están atrapados** (a diferencia del shell admin). `VaultRequestModal` (fixed sin portal) **funciona**; migrarlo al `Modal` primitivo es opcional (consistencia).

---

## (c) Mapa de divergencia vs ficha admin (por sub-vista)

| Sub-vista | Hoy | Ficha admin | Acción de re-skin |
|---|---|---|---|
| **Tabs** | `<Tabs>` subrayado cyan, `<Link>` | la ficha usa píldoras | **Sin cambios — desviación DELIBERADA** (se mantiene subrayado). |
| **Perfil** | `Section` glass inline (blur 24px, tinte cyan/red), labels `text-sm`, inputs zinc-800, **sin hover** | `<Card variant="elevated">`, label `tracking-[0.24em] zinc-500`, inputs translúcidos | Section→Card; labels→CardTitle; inputs→paleta admin; rojo semántico sólo en Seguridad/Zona de peligro. |
| **Facturación** | cards `#0c0e12/80 rounded-2xl shadow-2xl`, `font-black uppercase tracking-widest`, sin hover | `bg-white/[0.02] rounded-3xl`, labels sobrios, stat cells con hover | Re-skin cards/tabla/stat cells; hover admin (`adminHoverCls`) en cells/rows; conservar semántica de status. |
| **Bóveda** | tema vault (dot-grid, glow, scanline, AES badges, italic-uppercase, hover scale+sombra negra) | `<Card variant="interactive">` sobrio | Quitar ruido; asset cards→`Card interactive` + `adminHoverCls`; **conservar** AES badge, reveal flow, timeline placeholder. |
| **Layout/anchos** | `max-w-7xl` (layout) vs `3xl`/`5xl`/`6xl` (vistas) | tabbed wide, `space-y-6` | Revisar coherencia de ancho (perfil-form angosto OK; alinear facturación/bóveda). Menor: dentro de cada sprint. |

---

## (d) Sprints de rediseño

> Por sprint: leer scope → implementar → **gate** (ver abajo) → despachar `visual-qa`
> (desktop+mobile) sobre las rutas tocadas y ESPERAR su reporte. Cero `any`.
> Preservar loading/error/empty y el read-only de impersonation.

**Gate por sprint (reemplaza al build):**
- **Tipos:** desde `logic-core-v3/`, correr `.\node_modules\.bin\tsc.cmd --noEmit` (en PowerShell, **el comando solo, sin `&&` ni `;`**). Criterio: **sin errores NUEVOS** respecto del baseline. Baseline conocido a ignorar: `@googleapis/webmasters` y `set-state-in-effect` en `PreloaderContext`. (NO usar `npm run build` como gate: da rojo por deuda ajena, nunca exit 0. NO usar `npx tsc` global.)
- **Lint:** sólo sobre los archivos tocados.
- **visual-qa:** ❌ ROTO → no cerrar; ❓ A CONFIRMAR → flag al humano.

### Sprint 0 — Cleanup funcional + encoding (sin estética)
**Archivos:** `lib/actions/profile.ts`, `components/dashboard/ProfileForms.tsx`, `components/dashboard/SubscriptionBanner.tsx`.
**Qué cambia:**
- `profile.ts:64, 93, 235` (y dedupe en `:140`): `revalidatePath('/dashboard/profile')` → `'/dashboard/cuenta/perfil'`.
- `ProfileForms.tsx:616, 674`: `href="/dashboard/facturacion"` → `"/dashboard/cuenta/facturacion"`.
- `ProfileForms.tsx:698`: `'Ocurri?…'` → `'Ocurrió…'`.
- `SubscriptionBanner.tsx:19`: mismo fix de href (**firme**: mismo bug de ruta muerta, 1 línea).
**Aceptación:** tras editar perfil/contacto/password la vista **revalida sin refresh manual**; "Ver facturación" cae en la página real; no queda el string "Ocurri?". (Bug funcional, no cosmético.)

### Sprint 1 — Perfil: `Section` glass → `Card` admin
**Archivos:** `cuenta/perfil/page.tsx`, `components/dashboard/ProfileForms.tsx`, `cuenta/perfil/loading.tsx`.
**Qué cambia:**
- Reemplazar `Section()` (y borrar las 3 consts `GLASS*`) por `<Card variant="elevated" padding="lg">` + `CardTitle`.
- **Rojo semántico sólo en**: Seguridad (`className` border-red suave) y Zona de peligro (border-red fuerte + `bg-red-500/[0.03]`) — override por `className` (twMerge resuelve). Resto = card neutra.
- `ProfileForms`: migrar inputs/toggles/botones de zinc-800 a la paleta admin (`border-white/10 bg-white/[0.02]`, `focus:border-cyan-500/50`) — adoptar el `Input` primitivo de `ui/*` donde encaje, o restyle equivalente. **Preservar** Zod, strength meter, feedback success/error, 5 toggles.
- Cards grandes de formulario **estáticas**. Filas de `PlanInfoSection`/links: hover de row admin.
- `perfil/loading.tsx`: skeleton al chrome nuevo (`rounded-3xl bg-white/[0.02]`).
**Aceptación (ancla: admin `OverviewTab` "Información de contacto"):** cada sección lee como `rounded-3xl border-white/10 bg-white/[0.02]` con label `tracking-[0.24em] zinc-500`; Seguridad/Zona de peligro mantienen carga roja; **banner read-only de impersonation intacto**.

### Sprint 2 — Facturación: cards opacas → receta admin + hover
**Archivos:** `cuenta/facturacion/page.tsx`, `components/dashboard/CurrentPlanCard.tsx`, `cuenta/facturacion/loading.tsx`.
**Qué cambia:**
- Cards `bg-[#0c0e12]/80 shadow-2xl rounded-2xl` → receta admin (`bg-white/[0.02] rounded-3xl border-white/10`, padding lg).
- Tipografía `font-black uppercase tracking-widest` → sobria (labels `text-[10px] tracking-[0.24em] zinc-500`, headings `zinc-100`).
- Tabla invoices: dividers `border-white/5`, idioma admin; **conservar semántica** de status badges (emerald/amber/red) y banners de renovación.
- **Hover percibible** con **`adminHoverCls`** en celdas de billing info, filas de servicios y módulos de `CurrentPlanCard` (ancla: admin `BillingOverrideCard` stat cells). El `ring` no desborda el padding.
- `facturacion/loading.tsx`: skeleton al chrome nuevo.
**Aceptación (ancla: admin `PlanAssignmentCard` + `BillingOverrideCard`):** `CurrentPlanCard` lee como card elevated admin; las stat cells hacen el hover admin (`scale 1.015` + ring blanco).

### Sprint 3 — Bóveda: re-skin conservando el sello de seguridad
**Archivos:** `cuenta/boveda/page.tsx`, `components/dashboard/VaultRevealButton.tsx`, `components/dashboard/VaultRequestModal.tsx`, `cuenta/boveda/loading.tsx`.
**Qué cambia:**
- **Quitar**: dot-grid, scanlines, glow ambiental de hover, títulos `italic uppercase`, sombra negra de hover.
- Asset cards → estilo `<Card variant="interactive">` (`rounded-2xl border-white/10 bg-white/[0.02] hover:bg-white/[0.04]`) + **`adminHoverCls`** (ancla: admin `VaultTab`). Mantener el color de ícono por tipo como **acento puntual**, no como tema.
- **Conservar**: badge AES-256 (restyle sutil), `VaultRevealButton` (rojo semántico, auto-hide 30s), flujo de `VaultRequestModal`, y el **timeline como placeholder pulido** (re-skin del chrome del `ACTIVITY_LOG` al idioma admin; sigue siendo data fake).
- `VaultRequestModal`: **opcional** migrar al `Modal` primitivo (portalea a body). No es fix obligatorio (no está atrapado por el backdrop del layout cliente).
- `boveda/loading.tsx`: skeleton al chrome nuevo.
**Aceptación (ancla: admin `VaultTab`):** grid de assets lee como cards interactivas admin con hover `adminHoverCls`; reveal + AES badge preservados; el timeline se percibe como placeholder pulido, no dato real.

---

## (e) PENDIENTES (frozen / schema)

1. **Timeline real de la Bóveda** = modelo de actividad en `schema.prisma` → **parada/tarea aparte**. En este lane queda placeholder (decisión cerrada).
2. **`ui/*` frozen** (`Card`, `Tabs`, `Modal`, `Input`, `PageHeader`) → se **USAN** tal cual; el plan **no requiere modificarlas** (variants `elevated/interactive/dashed` y `CardTitle` ya existen; rojo por `className` + twMerge). No hay edición frozen pendiente.
3. **Shell/frozen no tocados**: `DashboardLayoutClient`, `HoverScaleCard` (admin-internal, **no se importa**), `lib/preview`, `auth`, `prisma`, `HeroArtifact`, `TransitionContext`, `PreloaderContext`, drift de Franco / migraciones → **N/A** (lane puramente visual; no se corre ninguna migración).

---

## Verificación (end-to-end)

1. **Tipos:** desde `logic-core-v3/`, `.\node_modules\.bin\tsc.cmd --noEmit` (PowerShell, comando solo) → **sin errores nuevos** (baseline ignorado: `@googleapis/webmasters`, `set-state-in-effect` en `PreloaderContext`). Cero `any`.
2. **Lint:** sobre archivos tocados.
3. **DB:** no se toca schema → `migrate status` debe quedar en baseline (no es gate del trabajo visual).
4. **visual-qa** (subagente, obligatorio): `/dashboard/cuenta/perfil`, `/facturacion`, `/boveda` en desktop **y** mobile; screenshots; ESPERAR reporte.
5. **Manual (prueba el cleanup):** editar perfil/contacto/password → la vista **refresca sin reload manual** (prueba `revalidatePath` arreglado); "Ver facturación" → página real (no 404); no aparece "Ocurri?".
6. **Impersonation:** SUPER_ADMIN impersonando → Perfil sigue **read-only** (banner ámbar, sin forms).
7. **Hover percibible:** a ojo, asset cards (Bóveda) y stat cells (Facturación) hacen el hover admin (`scale 1.015` + ring blanco), sin desbordar padding.

---

## Disciplina

- Sólo `C:\lane-cuenta`. **Nada** en `C:\PorfolioDevelOP`.
- Esta sesión de relevamiento **no commitea código**; sólo el `.md` del plan (en `logic-core-v3\_lane-cuenta-plan.md`).
- Checkpoints humanos dentro de cada sprint (no avanzar sin OK).

---

## Log de ejecución — Sprint 0 (corrida DESATENDIDA, 2026-06-25)

> Corrida automática de un solo sprint (Sprint 0 — cleanup funcional, sin estética).
> Sin checkpoints humanos. Branch `lane/cuenta`, worktree `C:\lane-cuenta\logic-core-v3\`.

**Read-first — números de línea reales confirmados antes de tocar** (coincidían con el plan):
- `src/lib/actions/profile.ts`: 4 ocurrencias de `revalidatePath('/dashboard/profile')` (ruta MUERTA) en líneas **64, 93, 140, 235**. La acción `updateNotificationPrefsAction` ya tenía además el path correcto en **141**.
- `src/components/dashboard/ProfileForms.tsx`: `href="/dashboard/facturacion"` (ruta MUERTA) en **616 y 674**; mojibake `'Ocurri?'` (×2 en la misma línea, `?` = byte ASCII `0x3F`) en **698**.
- `src/components/dashboard/SubscriptionBanner.tsx`: `href="/dashboard/facturacion"` en **19**.

**Cambios aplicados (solo strings; cero cambio de firma/lógica):**
- `profile.ts` — líneas 64, 93, 235: `'/dashboard/profile'` → `'/dashboard/cuenta/perfil'`. Línea 140: **deduplicada** (eliminada la no-op; la 141 ya revalidaba el path correcto). `revalidatePath('/dashboard')`, `'/dashboard/soporte'` intactos. Tras dedupe, la última quedó en línea 234.
- `ProfileForms.tsx` — líneas 616 y 674: `href` → `'/dashboard/cuenta/facturacion'`. Línea 698: `'Ocurri?'` → `'Ocurrió'` (×2). Encoding verificado UTF-8 (`ó` = `c3 b3`); sin mojibake nuevo.
- `SubscriptionBanner.tsx` — línea 19: `href` → `'/dashboard/cuenta/facturacion'`.

**Gate (verde):**
- `.\node_modules\.bin\tsc.cmd --noEmit` → **exit 0, sin errores** (baseline igual; mis cambios son swaps de string, no pueden tipar mal).
- Lint sobre los 3 archivos tocados → **exit 0, limpio**.
- `visual-qa` (subagente, desktop + mobile) sobre `/dashboard/cuenta/perfil` y `/dashboard/cuenta/facturacion` → **✅ OK** ambas: resuelven y renderizan sin romper (redirect a login = ruta viva, no 404), sin errores de consola. Nota de infra: por el lock de single-dev-server de Next 16 (con `:3000` del repo principal arriba) no se pudo levantar server del worktree; se verificó contra `:3000` (archivos de ruta idénticos main↔worktree; el diff es solo strings → válido como no-regresión de carga). Verificación fina + prueba manual de revalidación quedan para el humano (designadas como tarea humana en el plan).

**Cierre:** commiteado en el worktree (`lane/cuenta`); **NO** se tocó `main` ni se hizo merge. Sin paradas obligatorias disparadas (no se tocó frozen/schema/negocio). DETENIDO — no hay más sprints en esta corrida.

---

## Log de ejecución — Sprints 1·2·3 (corrida visual, 2026-06-25)

> Corrida de los 3 sprints visuales de corrido, commit por sprint, gate
> (tsc + lint-on-touched + visual-qa) entre cada uno. Worktree `C:\lane-cuenta\logic-core-v3\`.

### Sprint 1 — Perfil — commit `a5d511c`
**Archivos:** `cuenta/layout.tsx`, `cuenta/perfil/page.tsx`, `cuenta/perfil/loading.tsx`, `components/dashboard/ProfileForms.tsx`.

**Full-width:** confirmado contra hermanas (Explore): el `<main>` del `DashboardLayoutClient` da `p-4 sm:p-6` + frame redondeado y **no** impone ancho; Soporte usa `w-full`, Chatbot `flex flex-col gap-6` sin cap. → `layout.tsx`: `max-w-7xl mx-auto w-full` → `w-full`. `perfil/page.tsx`: soltado `max-w-3xl` (también en la rama preview).

**Section→Card:** borradas las 3 consts `GLASS*` y `Section()`; nuevo helper local `SectionCard` = `<Card variant="elevated" padding="lg">` + `<CardTitle>` + icono. Tinte rojo por override `className` (twMerge): Seguridad `border-red-500/20` (suave, sin bg), Zona de peligro `border-red-500/30 bg-red-500/[0.03]` (fuerte).

**Decisión de grilla (DELEGADA):** banner `ProfileHeader` full-width arriba → fila 2-col `[Datos de empresa | Datos de contacto]` → fila 2-col `[Seguridad (rojo suave) | Preferencias de notificaciones]` → `Información del plan` full (stat-row de 4 celdas) → `Zona de peligro` full. 2-col para que los forms no queden estirados de borde a borde; Preferencias en media-columna evita que los toggles se vayan al borde. `SectionCard` lleva `h-full` para emparejar alturas por fila.

**ProfileForms (paleta zinc-800 → admin):**
- Inputs simples → primitivo `<Input>` de `ui/*` (`rounded-xl border-white/10 bg-white/[0.02] focus:border-cyan-400/30`); readOnly = `Input` + `className="cursor-not-allowed text-zinc-500"`. Borradas `INPUT_BASE`/`INPUT_READONLY`.
- Composites (whatsapp + 3 password) y preview de logo: wrappers reestilados al espejo del primitivo (`rounded-xl border-white/10 bg-white/[0.02] focus-within:border-cyan-400/30`).
- **Fix toggles:** migrados al primitivo `<Toggle>` (`h-6 w-11` track, thumb `h-5 w-5` con `items-center` → centrado vertical robusto, `translate-x-5/1`). Elimina el thumb desbordado/"bulge". Se mantienen los `<input type="hidden">` que cargan el estado al submit; `onChange={() => toggle(key)}`.
- `PlanInfoSection`: las 4 stats → celdas admin (`rounded-xl border-white/5 bg-white/[0.015] px-3 py-2.5` + `adminHoverCls`); valor a `text-sm` (no `text-base`) para que entre la fecha de vencimiento. Links "Ver facturación" + cancel de DangerZone → fila admin (`border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/10`).
- Filas de notificaciones: superficie admin + `hover:border-white/15 hover:bg-white/[0.04]` (color-only).
- **Preservado:** Zod intacto (no se tocaron actions), strength meter, feedback success/error, los 5 toggles, y la rama `isAdminPreview()` (banner ámbar + datos en `SectionCard` sin forms; full-width).

`perfil/loading.tsx`: skeleton al chrome nuevo (`rounded-3xl`, grid full-width 2-col).

**Gate:** `tsc.cmd --noEmit` → exit 0 (sin errores nuevos). Lint sobre los 4 tocados → limpio. **visual-qa → ❓ A CONFIRMAR (infra-limited):** el subagente (Read/Grep + preview-MCP, sin Bash) no pudo bootear server — `npm run build` rojo por deuda ajena (motivo por el que el gate usa tsc, no build), ruta tras auth, y lock de single-`next dev` con `:3000` del repo principal. Es la limitación de infra prevista por el plan + Sprint 0 → **flag al humano** para verificación visual fina (no-regresión de carga confirmada por tsc+lint). No se reintentó en loop (guard anti-loop).

### Sprint 2 — Facturación — commit `26026df`
**Archivos:** `cuenta/facturacion/page.tsx`, `components/dashboard/CurrentPlanCard.tsx`, `cuenta/facturacion/loading.tsx`.

**Full-width:** `page.tsx` soltó `mx-auto max-w-5xl` → `w-full`; `gap-8` → `gap-6` (espaciado admin).

**Receta admin + tipografía:**
- Cards `bg-[#0c0e12]/80 shadow-2xl backdrop-blur-xl rounded-2xl` → `bg-white/[0.02] rounded-3xl border-white/10` (invoice card como div con la receta; billing-info sobre el primitivo `<Card variant="elevated" padding="lg">`).
- `font-black uppercase tracking-widest` → sobrio: labels `text-[10px] font-semibold tracking-[0.24em]/[0.2em] text-zinc-500`, headings/valores `text-zinc-100/200`. Banners de renovación: span `font-black`→`font-semibold`, link `font-bold`→`font-semibold` (semántica red/amber intacta).
- Tabla invoices: dividers `border-white/5`, th `font-semibold tracking-[0.2em]`, status badge `font-semibold tracking-[0.16em]` con `cfg.pill` (emerald/amber/red) INTACTO; row hover color-only `hover:bg-white/[0.04]` (sin scale en filas de tabla — el scale rompe `<tr>`).

**Hover admin (`adminHoverCls`):** stat cells de "Información de facturación" (email + próxima fecha) y filas de servicios/módulos + celda "Próxima facturación" de `CurrentPlanCard` (ancla: admin `BillingOverrideCard`/`HoverScaleCard`, replicado vía `adminHoverCls` string, NO se importó `HoverScaleCard`). El ring no desborda (padding propio de cada celda).

**CurrentPlanCard:** reescrito sobre `<Card variant="elevated" padding="none">` (secciones con `p-6` + footer `border-t`); `overflow-hidden` para clip de esquinas; `StatusBadge` semántico (cyan=configurando, emerald=activo) preservado; total mensual `font-mono font-bold tracking-tight`; icons `strokeWidth={1.5}`.

**Decisión (billing-info):** la grilla `divide-x/divide-y` opaca → grid de 4 celdas admin (`sm:grid-cols-2 lg:grid-cols-4`): email + próxima-fecha = stat cells con hover; métodos de pago = celda estática con pills; "Actualizar datos" = botón-link admin. Se quitó la nota redundante "Aceptamos transferencia…" (de-noise cosmético).

**Gate:** `tsc.cmd --noEmit` → exit 0; lint sobre los 3 tocados → limpio. **visual-qa → infra-limited** (mismo blocker; sin Bash/build/port → análisis estático). Flag accionado: (1) tooltip "Generando…" `bg-[#0c0e12]` hardcodeado → token `bg-zinc-900` (un tooltip debe quedar OPACO/legible — NO se translucidó); (2) `InvoiceStatusIcon` sin `strokeWidth` → `strokeWidth={1.5}` (convención CLAUDE.md). Re-gate verde tras los fixes. **Pre-existente NO tocado (fuera de scope):** el tooltip flota en `<table overflow-x-auto>` y puede clipearse en el borde derecho (necesitaría portal; bug de layout previo al reskin, edge-case PAID-sin-pdfUrl) → fichado para el humano.

### Sprint 3 — Bóveda — commit `17a9e0a`
**Archivos:** `cuenta/boveda/page.tsx`, `components/dashboard/VaultRevealButton.tsx`, `components/dashboard/VaultRequestModal.tsx`, `cuenta/boveda/loading.tsx`.

**Full-width:** `page.tsx` soltó `mx-auto max-w-6xl`; `gap-8` → `gap-6`.

**De-noise (quitado):** dot-grid overlay, scanlines, glow ambiental de hover, glow por-tipo (`glowRgb` + `hoverBorder` borrados del `TypeConfig` y de los 6 entries), sombra negra de hover (`hover:shadow-[…rgba(0,0,0,…)]`), títulos `italic uppercase`, nota italic del timeline, `font-black` varios.

**Asset cards:** `<div>` glass artesanal → primitivo `<Card variant="interactive" padding="lg">` + `adminHoverCls` (scale 1.015 + ring blanco; `variant` ya da `hover:bg-white/[0.04]`). Color por tipo = **acento puntual** (ícono + pill `cfg.bg/border/color`), NO tema; superficie del ícono neutra `bg-white/[0.02]`. `isAccess` suma `border-red-500/15` (override twMerge sobre el `border-white/10` del variant). Footer con `mt-auto` (alturas parejas). Acceder: hover neutro cyan (antes glow por-tipo); swap Lock→LockOpen preservado.

**Conservado:** badge AES-256 (restyle sutil emerald, ping con `motion-reduce:animate-none`), `VaultRevealButton` (rojo semántico, máscara→link, auto-hide 30s — sólo de-noise tipográfico), flujo de `VaultRequestModal` (fixed inset-0 SIN portal — NO atrapado por el backdrop del layout cliente; migración a `Modal` primitivo = OPCIONAL, se omitió). **Timeline "Registro de integridad y accesos" = PLACEHOLDER:** `ACTIVITY_LOG` sigue hardcodeado/fake; sólo se re-skineó el chrome al idioma admin (`<Card variant="elevated">`, fonts sobrias, dot con `ring-2 ring-zinc-950`). El modelo real = schema → parada aparte (decisión cerrada).

**Empty state:** hand-rolled en server (`<Card variant="dashed">` + ShieldCheck) — NO se usó el primitivo `EmptyState` (es `'use client'` y recibe `icon` como componente → cruzar un Lucide desde una server page rompe el boundary).

`boveda/loading.tsx`: skeleton full-width (header + grid 3-col `rounded-2xl` + timeline `rounded-3xl`).

**Gate:** `tsc.cmd --noEmit` → exit 0. Lint sobre los 4 tocados → **limpio salvo 1 baseline pre-existente:** `react-hooks/set-state-in-effect` en `VaultRevealButton.tsx:21` — el `setRemaining(HIDE_AFTER_SECONDS)` del `useEffect` que YA estaba en HEAD (confirmado: mi diff no toca el effect, líneas 19-32 intactas). Es la clase de error de baseline documentada; fix = cambio de comportamiento en effect no tocado → **fuera de scope** de un lane visual (iría en commit propio). **visual-qa → ✅ OK estático / ❓ render infra-limited:** sin red flags estructurales/TS/iconos/JSX/hex/mojibake; timeline placeholder reconocido como intencional; render gráfico fino (hover percibible, mobile 390px, contraste) → **humano**.

---

## CIERRE — corrida visual completa (2026-06-25)

**Los 3 commits quedan separados en el worktree `lane/cuenta` para revisión humana:**
- `a5d511c` — redesign(cuenta/perfil): full-width grid + card admin + fix toggles
- `26026df` — redesign(cuenta/facturacion): full-width + receta admin + hover
- `17a9e0a` — redesign(cuenta/boveda): full-width + de-noise + receta admin
- (+ este `docs(cuenta)` con los logs de ejecución)

**Disciplina:** trabajado SÓLO en `C:\lane-cuenta\logic-core-v3\`; **NADA** en `C:\PorfolioDevelOP`; **cero merges**, **`main` intacto**. Commit por sprint. Sin paradas obligatorias disparadas (no se tocó `schema.prisma` / `ui/*` / shell admin / drift de Franco; no hubo decisión de negocio/auth ni cambio de firma de actions — los gates de sesión/rol + Zod de `lib/actions/profile.ts` y `messages.ts` quedaron INTACTOS, el lane no tocó ninguna action). Read-only de impersonation preservado en Perfil. Guard anti-loop: el blocker de visual-qa (server no booteable en worktree) es de infra constante → no se reintentó en loop; verificación visual fina designada al humano.

**Pendientes fichados para el humano (NO bugs del reskin):**
1. **Verificación visual fina** de las 3 vistas (desktop + mobile): hover percibible (scale 1.015 + ring), grid/espaciado, contraste, mobile 390px. El gate automático sólo confirmó no-regresión de carga (tsc + lint + análisis estático visual-qa).
2. **Tooltip "Generando…"** (Facturación) flota en `<table overflow-x-auto>` → puede clipearse en el borde derecho (necesita portal). Pre-existente, edge-case PAID-sin-pdfUrl.
3. **`react-hooks/set-state-in-effect`** en `VaultRevealButton.tsx:21` — baseline pre-existente; fix = cambio de comportamiento (commit propio, fuera de este lane visual).
4. **Timeline real de la Bóveda** = modelo de actividad en `schema.prisma` (parada aparte ya fichada).

---

## Sprint de ajuste — espacio muerto inferior en las 3 tabs (2026-06-25)

### FASE 0 — Relevamiento (read-only, antes de tocar)
Grep `pb-|min-h-|flex-1|h-screen|h-full` sobre `cuenta/**` + lectura del shell. **Causa real diagnosticada:**

- **Atribuible al contenedor de cuenta (MÍO) → la banda a eliminar:** `pb-20` **apilado**. El wrapper de `layout.tsx:7` lleva `pb-20` (5rem) **Y ADEMÁS** las pages de facturación (`page.tsx:109`) y bóveda (`page.tsx:73`) agregan **otro** `pb-20`, igual sus loadings (`facturacion/loading.tsx:5`, `boveda/loading.tsx:5`). Resultado: ~10rem de padding-bottom muerto al final del scroll en facturación/bóveda, 5rem en perfil (su page no tiene pb). **NO hay `min-h` en ningún archivo de cuenta** (los `flex-1`/`h-full` son internos: centrado del empty state, alturas de cards). → fix 100% en archivos propios.
- **Shell (FROZEN, NO tocar, esperado):** el área de contenido del `DashboardLayoutClient` es `<div className="relative mt-4 min-h-0 flex-1">` con una capa hermana frosted (`bg-white/[0.03] backdrop-blur-md`) y el `<main className="absolute inset-0 overflow-y-auto … p-4 sm:p-6">`, ambos `absolute inset-0`. Al ser el área `flex-1`, **siempre llena el alto del viewport**; con contenido corto, la card frosted del shell se ve debajo. Eso es el **marco-card de altura completa del portal (intencional)** — el goal lo declara aceptable ("el fondo del shell ocupa el resto"). NO es banda atribuible a cuenta → **NO se toca** (no disparó la parada obligatoria porque la causa atribuible es mía, no el shell).
- **Fuera de scope (no tocado):** `cuenta/loading.tsx` (loading del route padre que sólo redirige a perfil → prácticamente nunca se renderiza) tiene el mismo `pb-20` + un `max-w-5xl` stale; latente menor, fichado, no es una de las 3 tabs.

### FIX aplicado
El padding-bottom queda **una sola fuente** (el layout), alineado al ritmo `gap-6` del portal (las hermanas Chatbot/Soporte no agregan pb propio; usan el `p-4 sm:p-6` del `<main>`). Cambios (1 línea c/u, sólo `className`):
- `cuenta/layout.tsx:7`: `pb-20` → **`pb-6`** (1.5rem; respira sin banda muerta; + el `p-6` del `<main>` da ~3rem al fondo).
- `cuenta/facturacion/page.tsx:109`, `cuenta/boveda/page.tsx:73`: **eliminado** `pb-20` (el wrapper de page no aporta pb; el layout es el dueño del espacio inferior).
- `cuenta/facturacion/loading.tsx:5`, `cuenta/boveda/loading.tsx:5`: **eliminado** `pb-20` (mismo hueco en estado de carga).
- `cuenta/perfil/page.tsx` + `perfil/loading.tsx`: sin cambios (nunca tuvieron pb; su banda era sólo el `pb-20` del layout, ya reducido a `pb-6`).

**NO se tocó el shell** (no se disparó la parada obligatoria: la causa atribuible era mía). Full-width / grid / estética / hover / toggles / read-only de impersonation / loading-error-empty: intactos (cambio puramente de espaciado).

**Gate:** `.\node_modules\.bin\tsc.cmd --noEmit` → exit 0 (sin errores nuevos). Lint sobre los 5 tocados → limpio. **visual-qa → ✅ PASS estático / ❓ render infra-limited:** confirmó estáticamente que el apilado `pb-20`+`pb-20` desapareció (sólo `pb-6` en el layout, 0 pb en pages/loadings); el render fino (no-banda en contenido corto, scroll en largo) queda para eyeball humano (mismo blocker de server-en-worktree de toda la corrida). **Commit:** `fix(cuenta): elimina espacio muerto inferior en las 3 tabs`.

---

# Sprint bugs + ajustes (Fases 0-5, 2026-06-26)

## FASE 0 — Relevamiento read-only (4 subagentes Explore + lectura propia de auth.ts/schemas.ts/cambiar-password)

### A) PASSWORD (`ProfileForms.tsx` PasswordForm + `profile.ts` updatePasswordAction + `schemas.ts` UpdatePasswordSchema)
- **Reqs sólo en cliente, NO en Zod:** `UpdatePasswordSchema.newPassword` es sólo `min(8)`. La mayúscula+número se chequean SÓLO en `checkStrength()` del cliente. → Fase 1 endurece el Zod (regex `[A-Z]` y `[0-9]`).
- **Campos se borran al fallar:** los inputs `currentPassword` y `confirmPassword` son **NO controlados**; React 19 `<form action>` resetea el form al completar la action (éxito o error) → se limpian. `newPassword` es controlado (`value={newPw}`) → persiste. Fix: controlar `currentPassword` (estado). `confirmPassword` puede limpiarse (OK por spec).
- **Visor invertido:** `ProfileForms.tsx:401,424,479` = `{showX ? <EyeOff/> : <Eye/>}` → muestra el ojo TACHADO cuando revela. Convención pedida = ojo abierto al mostrar. Fix: swap a `{showX ? <Eye/> : <EyeOff/>}`. La PERSISTENCIA del visor ya existe (es `useState`, la action no remonta) → no requiere cambio.
- **Pantalla negra al guardar (causa CIERTA, en código EDITABLE):** `updatePasswordAction` incrementa `sessionVersion` en DB, luego `await unstable_update({})` (payload VACÍO) + `revalidatePath('/dashboard/cuenta/perfil')`. El jwt callback de `auth.ts:247-254` (FROZEN, sólo lectura) **devuelve `null` (destruye la sesión)** en un `auth()` normal cuando `token.sessionVersion !== DB` (N vs N+1). El revalidate re-renderiza con el cookie viejo → mismatch → `null` → pantalla negra. El flujo que SÍ funciona (`/cambiar-password/actions.ts:70`) usa `unstable_update({ user: { passwordResetRequired: false } })` (payload NO vacío que sí refresca el cookie) y **NO** llama `revalidatePath`. → Fix en `profile.ts` (editable): espejá el flujo que anda (payload no vacío) y sacá el `revalidatePath` (la password no se muestra en perfil, no hay nada que revalidar). **NO se toca `auth.ts`** (su callback es correcto) → sin parada.

### B) AVATAR — verdict: el CLIENTE PUEDE escribir avatar* SIN tocar schema/auth → Fase 3 rama "reusar uploader"
- `Organization` ya tiene `avatarEmoji`/`avatarImageUrl`/`avatarInitials` (`schema.prisma:393-397`). `updateProfileAction` hoy escribe sólo `name/companyName/logoUrl`.
- Uploader admin = `src/modules/chatbot/components/admin/client-avatar/ClientAvatarField.tsx` (`'use client'`, props `{ value, onChange, companyName }` con `ClientAvatarValue {avatarImageUrl,avatarEmoji,avatarInitials}`), **auto-contenido** (no contexts/guards admin; trae `AvatarUploader`+`EmojiPickerField` standalone). `avatarImageUrlSchema` (`src/modules/chatbot/server/admin/avatarImageUrlSchema.ts`) acepta `data:image/(png|jpeg|webp);base64` (base64-in-DB, cap ~600KB) — coincide con [[no-external-storage-infra]]. El comment de `avatarStyleSchema.ts` confirma intención de producto ("the client now gets the emoji picker and the custom-image uploader too"). El admin lo escribe vía `updateClient.ts` (requireSuperAdmin; el del cliente queda org-scoped sin ese guard, correcto). → Fase 3: reusar `ClientAvatarField` + agregar avatar* a `UpdateProfileSchema`+`updateProfileAction` (+ pasar valores iniciales desde `perfil/page.tsx`). Pendiente de Fase 3: cómo se muestra hoy el avatar en el portal (logoUrl vs avatar*) para reconciliar el display.

### C) FACTURAS — relevamiento PURO (NO se implementa en todo el sprint)
- `Invoice` existe (`schema.prisma:628`): amount, currency, status(`InvoiceStatus` PENDING/PAID/OVERDUE), dueDate, paidAt, paymentLink, pdfUrl, organizationId. **Generación = CERO en producción**: ningún `prisma.invoice.create` en `/src` (ni cron, ni action); sólo `prisma/seed.ts` siembra 2 facturas demo para "San Miguel". → el "Historial de pagos" está **siempre vacío en la práctica**. `getCurrentPlan` calcula plan desde Service/OrganizationModule/PremiumModule (no toca Invoice). Generador de assets admin = `VaultManager.tsx` → `createClientAssetAction(orgId, {name,url,type,description})` (SUPER_ADMIN); `AssetType` = DOCUMENT/IMAGE/BRANDBOOK/LOGO/ACCESS/OTHER (**no hay INVOICE**); sin librería PDF en el stack.
- **Flujo deseado** (opción "factura" en el generador de la Bóveda admin → form formal → PDF → historial) implicaría: `AssetType.INVOICE` (enum = **schema**), generación de Invoice + PDF (lib nueva), form admin nuevo, y poblar `Invoice.pdfUrl`. **= schema + infra → parada, laburo propio aparte. NO se toca acá.**

### D) ELIMINACIÓN→TICKET — verdict: todo existe SIN schema → Fase 5 viable (sin parada)
- `requestAccountDeletionAction` (`profile.ts:148`) crea `Ticket{ title:'Solicitud de eliminación de cuenta', category:'OTHER', priority:'HIGH', organizationId (de sesión), userId, 1 mensaje }`. **El ticket SÍ guarda `organizationId`** → no falta el orgId.
- Detalle admin: `admin/tickets/[ticketId]/page.tsx` (server) → `admin/tickets/_components/ticket-chat.tsx` (client) que recibe el ticket completo (`organizationId`, `organization{id,slug,companyName}`, `title`, `category`). Inyectar el bloque debajo del contenedor de mensajes.
- Hard-delete EXISTENTE: `src/modules/chatbot/server/admin/hardDeleteClient.ts` (`getClientDeletionSummary` + `hardDeleteClient`, ambos `requireSuperAdmin`, cascade) + `TypeToConfirmDialog` (`admin/_components/type-to-confirm-dialog.tsx`, props open/onClose/onConfirm/title/description/confirmPhrase/confirmLabel/isPending). **PERO vive SÓLO en la LISTA** (`admin/clients/_components/ClientsListClient.tsx`, botón "Eliminar" de la barra de selección + estado local `openDelete(id)`), **sin deep-link**, y **NO** está en la ficha `/admin/clients/[clientId]` (que igual acepta id-or-slug).
- Discriminador del ticket = `title === 'Solicitud de eliminación de cuenta'` (literal de la action; no hay categoría dedicada sin schema).
- **Plan Fase 5:** bloque en `ticket-chat.tsx` (solo si título == el literal) → "Ir a borrar" = `<Link href="/admin/clients?delete={organizationId}">` (nav admin, NO router.push) + agregar en `ClientsListClient.tsx` un auto-open del `TypeToConfirmDialog` existente leyendo `?delete=` (reusa dialog+actions SIN modificarlos). "Cancelar" = estado local. Así "Ir a borrar" deposita al admin en el hard-delete del cliente correcto sin ejecutar nada.

**Commit Fase 0:** `chore(cuenta): relevamiento password+avatar+facturas+delete-ticket`.

## Ejecución Fases 1-5 — commits + decisiones

Gate por fase: `tsc.cmd --noEmit` exit 0 + lint-on-touched limpio + visual-qa (✅ estático / ❓ render infra-limited — server no booteable en worktree, igual que toda la corrida; verificación visual+comportamiento = humano). **Ninguna parada obligatoria disparada.**

- **Fase 1 — `8b641a0`** `fix(cuenta/perfil): validación y UX de cambio de contraseña`. Zod `UpdatePasswordSchema` exige mayúscula+número (antes sólo en cliente); submit disabled hasta los 3 reqs + cartel "Falta: …". `currentPassword` → controlado (React 19 reseteaba los no-controlados). Visor des-invertido (ojo abierto=muestra) + aria-labels. **Pantalla negra**: `unstable_update({})` vacío + `revalidatePath` re-renderizaba con cookie viejo (sessionVersion N vs DB N+1) → jwt callback de `auth.ts` invalidaba la sesión. Fix en `profile.ts` (editable): payload no vacío (espejo de `/cambiar-password`) + sacar el revalidate. **`auth.ts` NO tocado.**
- **Fase 2 — `31bfd39`** `fix(cuenta/facturacion): hover métodos de pago + altura botón actualizar`. `adminHoverCls` a la celda "Métodos de pago" (era la única sin hover); celda "Actualizar datos" → `flex` + link `h-full` (se estira a la altura de la fila).
- **Fase 3 — `6c83b16`** `feat(cuenta/perfil): avatar uploader admin`. **Rama tomada: "SI puede"** (B confirmó: `Organization` ya tiene avatar*, `ClientAvatarField` self-contained, `avatarImageUrlSchema` acepta base64 → sin schema/auth). Reemplazado "URL del logo" por `ClientAvatarField` (imagen base64 + emoji + iniciales) vía hidden inputs; `ProfileHeader` muestra el avatar con el resolver compartido `ClientAvatar`. `UpdateProfileSchema`+`updateProfileAction` escriben avatar*. **Decisiones:** `logoUrl` queda intacto en DB (lo siguen leyendo tickets/legacy; el cliente ya no lo edita) → divergencia logoUrl↔avatar* aceptada/fichada; el fallback del header pasa de iniciales-del-nombre a ícono Building2 (paridad admin), el cliente puede setear iniciales a mano.
- **Fase 4 — `f86c911`** `refactor(cuenta/boveda): solicitar-documento usa Modal primitivo con backdrop`. `VaultRequestModal` → `<Modal>` de ui/* (portal + backdrop estándar + header X). Flujo preservado (textarea/validación/`sendClientMessageAction`/success/cancelar). Se quitó el handler de Escape propio (el primitivo no lo trae; cierra por backdrop/X/Cancelar) — wart menor fichado.
- **Fase 5 — `fe32886`** `feat(admin/tickets): aprobar solicitud de eliminación → hard-delete existente`. Bloque rojo en `ticket-chat.tsx` SOLO si `title === 'Solicitud de eliminación de cuenta'`; "Ir a borrar" = `<Link href="/admin/clients?delete={organizationId}">` (nav admin). `ClientsListClient.tsx` auto-abre el `TypeToConfirmDialog` existente por `?delete=` (ref-guarded, una vez), con `deleteTargetId` unificado (selección + deep-link). **`hardDeleteClient` (SUPER_ADMIN) y `TypeToConfirmDialog` (tipear ELIMINAR) REUSADOS sin modificar; sin schema.** Wart menor: el `?delete=` queda en la URL (un refresh manual re-abriría el diálogo; el deep-link sólo ABRE, nunca borra → sin riesgo de borrado accidental).

## CIERRE
- **FACTURAS = SOLO relevamiento** (ver Fase 0.C): el flujo deseado (opción factura en el generador de la Bóveda admin → PDF → historial) es schema (`AssetType.INVOICE`) + librería PDF → **parada, laburo propio aparte. No se implementó.**
- **El borrado real lo sigue ejecutando el flujo existente** (TypeToConfirmDialog, tipear ELIMINAR, `hardDeleteClient` SUPER_ADMIN). Fase 5 sólo deposita al admin ahí.
- Trabajado SÓLO en `C:\lane-cuenta\logic-core-v3\`; **`main` intacto, sin merges**. Commit por fase (6 commits: `f0b6c77` relevamiento + 5 de fase). Ninguna parada obligatoria; no se tocó `schema.prisma`/`ui/*`/shell/`auth.ts`/drift de Franco/`hardDeleteClient`/`TypeToConfirmDialog`.
- **Para el humano:** verificación visual+comportamiento (server authenticado) de: contraseña (no-pantalla-negra, preservar campos al fallar, validación), avatar (subir imagen/emoji/iniciales + persistencia + fit en la card), modal bóveda (backdrop), y el flujo admin ticket→borrar end-to-end.

---

# Re-fix pantalla negra al cambiar password (2026-06-26) — el fix previo NO alcanzó

## FASE 0 — Re-diagnóstico (read-only; lectura propia de auth.ts/proxy.ts/cambiar-password, NO subagente)

**Estado tras el intento previo (`8b641a0`):** `updatePasswordAction` (profile.ts) sube `sessionVersion: {increment:1}` + `await unstable_update({ user: { passwordResetRequired: false } })` + return (SIN revalidatePath). **El bug sigue.**

**Por qué el fix previo NO alcanzó — la diferencia real es el CALL SITE, no la action:**
- `updatePasswordAction` y `cambiarPasswordAction` (/cambiar-password) son **idénticos** en el manejo de sesión (ambos incrementan `sessionVersion` + el MISMO `unstable_update({ user: { passwordResetRequired: false } })`). El intento previo espejó la ACTION, no la INVOCACIÓN.
- **`/cambiar-password` (anda)** llama la action **DIRECTO**: `startTransition(async () => { const r = await cambiarPasswordAction(...); if (r.ok) router.push('/dashboard') })` (`CambiarPasswordForm.tsx:46-55`). Llamada directa = Next NO auto-refresca; la navegación explícita ocurre DESPUÉS del `await` (cuando el Set-Cookie con `sessionVersion` N+1 ya está aplicado) → el request nuevo lleva N+1 → no hay kill.
- **`PasswordForm` (rompe)** usa **`<form action={action}>` + `useActionState`** (`ProfileForms.tsx`). El form-action de Next dispara un **re-render same-response del route con el cookie VIEJO (N)** — el Set-Cookie de `unstable_update` (N+1) está en los headers de respuesta pero **todavía no es un request-cookie** → ese render corre `auth()` con N.
- **El kill** (auth.ts:247-254, FROZEN, SOLO LECTURA): el jwt callback hace `shouldRefreshFromDb` con `... || !user`, así que **en CADA request normal** (no signIn/update) re-lee la DB y, si `token.sessionVersion (N) !== DB (N+1)`, **devuelve `null`** (mata la sesión). El re-render del form-action con cookie N dispara exactamente eso.
- **El "redirige a /dashboard"** (no a /login) lo explica `proxy.ts` (middleware): sesión muerta en `/dashboard/...` → redirect a `/login` (`:104-108`); pero el cookie ya quedó N+1, así que `/login` re-evalúa autenticado y rebota a `DASHBOARD_PATH` (`:143-145`). El preloader "Rendering…" cuelga en ese baile de redirects.

**No hay `SessionProvider`/`useSession` en el app** (auth 100% server-side: `auth()` en RSC + `proxy.ts`). → el kill lo dispara un **request del server**, no un poll del cliente; el request culpable es el re-render del form-action.

**Conclusión:** **se arregla SIN tocar `auth.ts`.** El jwt callback es correcto; el problema es que `PasswordForm` invoca la action vía form-action (re-render same-response con cookie viejo) en vez de llamarla directo y navegar después como `/cambiar-password`. → **NO parada.** Fix en `PasswordForm` (call site): `<form onSubmit>` + `startTransition` + `await updatePasswordAction(null, fd)` directo + `router.refresh()` on success (request separado, ya con cookie N+1). `profile.ts` queda como está (su `unstable_update` setea el cookie; estaba bien).

**Commit Fase 0:** `chore(cuenta): re-diagnóstico pantalla negra password`.

## FASE 1 — Fix (call site, sin tocar auth.ts) — commit `2730502`
`PasswordForm` (ProfileForms.tsx): de `<form action={action}>` + `useActionState` → `<form onSubmit={handleSubmit}>` + `useState`(state) + `useTransition`. `handleSubmit`: `preventDefault`, guard `strength.score<3`, `new FormData(form)`, `startTransition(async () => { const r = await updatePasswordAction(null, fd); setState(r); if (r?.success) { reset campos + form.reset() + router.refresh() } })`. Es el espejo EXACTO de `/cambiar-password` (llamada directa + navegar/refrescar DESPUÉS del await, cuando el cookie ya es N+1). `profile.ts` NO se tocó (su `unstable_update` ya seteaba el cookie). **Preservado:** validación 3-reqs + cartel "Falta:" + visor des-invertido + preserve-on-fail (ahora natural: sin form-action no hay auto-reset).

**Gate:** `tsc.cmd --noEmit` exit 0; lint ProfileForms.tsx limpio; visual-qa **✅ OK estático** (estructura correcta, todo preservado, sin regresión). **NO declarado resuelto:** el bug sólo se reproduce con sesión autenticada y un cambio real de password → el gate no lo puede probar. **PENDIENTE de verificación humana** (Valentino, logueado): cambiar el password y confirmar que NO hay pantalla negra, NO desloguea, NO rebota a /dashboard, y se queda en /perfil con la contraseña ya cambiada.
**Parada obligatoria:** NO disparada — el fix vive en el call site (PasswordForm), `auth.ts` quedó intacto.
**Pre-existente NO tocado:** los íconos de ojo del visor (`<Eye/>`/`<EyeOff/>`) no llevan `strokeWidth={1.5}` (estilo pre-existente del archivo, no es regresión de este fix).

---

# Reorden de layout Perfil (2 columnas) — commit `layout(cuenta/perfil)…` (2026-06-26)

**Problema:** "Datos de empresa" (izq) y "Datos de contacto" (der) iban lado a lado en un `lg:grid-cols-2` con `SectionCard` `h-full` → se igualaban en altura → Contacto (poca info) quedaba con un hueco vertical enorme.

**Cambio (SOLO layout, cero contenido/lógica):**
- `SectionCard`: quitado `h-full` (era el que forzaba alturas iguales); con eso `cn` quedó sin uso → removido el import.
- Los DOS `lg:grid-cols-2` (empresa|contacto y seguridad|prefs) → UN `grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start` con DOS columnas reales (`<div className="flex flex-col gap-6">`): **izq = Datos de empresa + Seguridad**; **der = Datos de contacto + Preferencias + Información del plan**. `lg:items-start` (sin stretch) + flujo vertical natural → cada panel a su altura real; Contacto comprimido y Preferencias sube directo abajo, sin hueco.
- **Zona de peligro** queda FUERA del grid, como bloque full-width al fondo (sobre las 2 columnas).
- Mobile (`grid-cols-1`): una sola columna apilada (empresa → seguridad → contacto → preferencias → plan → zona de peligro).
- `perfil/loading.tsx`: skeleton alineado al nuevo layout (2 col `items-start`, contacto corto, danger full-width).
- **Preservado:** estética admin, tinte rojo Seguridad/Zona, avatar uploader, toggles, hover, loading/error/empty, y el branch `isAdminPreview()` (return aparte, intacto). Spacing gap-6/space-y-6 (sin inventar).

**Gate:** `tsc.cmd --noEmit` exit 0; lint (page+loading) limpio; visual-qa **✅ OK estático** (2 columnas, sin hueco bajo Contacto, danger full-width, mobile apilado). Render fino = eyeball humano. Sin parada (todo en archivos del lane; nada frozen/shell).

## Ajuste de alineación: mismas columnas, mismo borde inferior — commit `layout(cuenta/perfil): alinea columnas…`
**Problema:** las 2 columnas arrancaban parejas arriba pero terminaban en líneas distintas abajo (izq 2 paneles vs der 3) → borde inferior descalzado antes de Zona de peligro.
**Cambio (1 token):** el grid de columnas pasó de `lg:grid-cols-2 lg:items-start` → `lg:grid-cols-2` (quitado `lg:items-start`). Sin `items-start`, el grid usa `items-stretch` por defecto → **ambas celdas-columna comparten la altura de la más alta** → **mismo borde inferior**. Las CARDS adentro siguen SIN `h-full` → mantienen su altura natural (Contacto **no** vuelve a estirarse); el sobrante de la columna corta cae como **espacio al fondo** (Opción B), no como hueco intermedio. El desfase del medio (Seguridad vs Plan a distinta altura) se deja libre, como pide el objetivo. `perfil/loading.tsx` igual (quitado `lg:items-start`). Mobile (`grid-cols-1`) intacto (single-column natural). **Gate:** tsc 0 + lint limpio + visual-qa ✅ OK estático.

## Fix REAL del hueco: estira la ÚLTIMA CARD (no el contenedor) — commit `fix(cuenta/perfil): estira última card…`
**Por qué el ajuste anterior (`items-stretch` solo) falló:** estiraba el CONTENEDOR invisible de la columna, pero las CARDS adentro (flex-col, top-packed) quedaban arriba → el sobrante caía como **hueco negro visible** entre "Seguridad" y "Zona de peligro". Estirar el contenedor no alinea nada que se vea.
**Fix correcto:** la ÚLTIMA card de cada columna CRECE para llenar la altura compartida:
- Izq "Seguridad": `<FadeIn className="lg:flex-1">` + `<SectionCard className="border-red-500/20 lg:h-full">`.
- Der "Información del plan": `<FadeIn className="lg:flex-1">` + `<SectionCard className="lg:h-full">`.
- Cadena en lg: grid `lg:grid-cols-2` (items-stretch) → cada columna `flex flex-col` con altura definida (de la celda) → último `FadeIn` `lg:flex-1` (crece al free-space, altura definida) → `SectionCard` `lg:h-full` (la CARD llena el FadeIn). Resultado: el borde inferior de Seguridad coincide con el de Información del plan, **cero hueco negro**. La card se ve más alta (contenido arriba, padding abajo dentro de la card) — aceptado.
- Solo la ÚLTIMA card de cada columna lleva flex-1/h-full: empresa/contacto/preferencias quedan naturales (Contacto NO se re-estira). Todo `lg:`-gated → mobile = stack natural. `loading.tsx`: último skeleton de cada columna con `lg:flex-1`.
**Gate:** tsc 0 + lint limpio + visual-qa **✅ OK** (chain flex-1+h-full en las DOS últimas cards confirmada, NO en las otras; razonado que la card visible crece y cierra el hueco). Render pixel-exacto = eyeball humano, pero el mecanismo (card crece, no contenedor) es el correcto. Sin parada.
