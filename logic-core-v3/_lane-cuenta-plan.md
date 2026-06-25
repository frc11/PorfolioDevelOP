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
