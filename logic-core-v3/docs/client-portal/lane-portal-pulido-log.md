# Lane `portal-pulido` — log (fuente de verdad)

> Worktree: `C:\lane-portal-pulido\logic-core-v3\` · Branch: `lane/portal-pulido` (desde `57fabe8`)
> NO merge — lo hace Valentino. Commit por sprint. Checkpoint visual humano entre tareas.
> Gate por sprint: `.\node_modules\.bin\tsc.cmd --noEmit` (solo) sin errores nuevos + lint en tocados.
> Baseline ignorado: `@googleapis/webmasters`, `react-hooks/set-state-in-effect` en PreloaderContext.

Guías: `relevamiento-empties.md`, `relevamiento-back-button.md`, plan #3 (sidebar+fullwidth).

---

## TAREA 1 — Módulos premium: sidebar + fullwidth

### 1-A) Sidebar agrupado (EDITA `SidebarNav.tsx` — autorizado por Valentino)
- **Estado:** ✅ HECHO · gate: tsc verde + eslint verde en `SidebarNav.tsx`
- Reubica el bloque de módulos premium activos (antes suelto al fondo, líneas 168-274) DENTRO
  de la sección "Servicios" (`NAV_SECTIONS[1]`), después de "Mi Chatbot".
- Mismos links per-módulo, mismas condiciones por slug (`activeModuleSlugs.includes(...)`),
  mismo markup (colores, pill `layoutId`, indent `pl-6`). Solo cambia el punto de montaje.
- Se elimina el contenedor `{hasPremium && (<div className="space-y-1">…)}` del fondo.
- Cero cambio de lógica/datos (el prop `activeModuleSlugs` ya llega).

### 1-B) Fullwidth de páginas de módulo (NO toca frozen)
- **Estado:** ✅ HECHO · gate: tsc verde + eslint verde en los 4 archivos
- Sacar el cap local `max-w-Nxl` (mantener `flex flex-col gap-6`) en:
  - `modules/motor-resenas/page.tsx:159` (max-w-2xl)
  - `modules/agenda-inteligente/page.tsx:331` (max-w-2xl)
  - `modules/email-marketing/layout.tsx:27` (max-w-3xl — cubre campaigns + contactos + new/send)
  - `modules/tienda-conectada/page.tsx:309` (max-w-3xl)
- `<main>` (DashboardLayoutClient:164) ya es fullwidth (`absolute inset-0 … p-4 sm:p-6`, sin max-w).

### Verificación adversarial Tarea 1 (workflow read-only, 4 lentes) — ✅ ALL PASS
- **scope/frozen:** exactamente 6 archivos cambiados, todos autorizados; ningún frozen tocado.
- **sidebar-fidelity:** relocación byte-fiel (condición por slug, href, ícono, color, pill `layoutId`, `onNavigate`, `pl-6` idénticos; solo cambió montaje + indent, wrapper `div`→fragment). JSX balanceado.
- **hard-rules:** sin `any`, sin `router.push/back`, sin secrets, estados loading/error/empty intactos, tenancy por sesión.
- **fullwidth:** 4 caps removidos OK; `<main>` sin max-w y ningún ancestro re-capea (`PageTransition` = `w-full`, no hay `modules/layout.tsx`) → fullwidth real.
- **PENDIENTE:** OK visual del humano (Tarea 1) antes de arrancar Tarea 2.

### 1-A bis) Fix visual: módulos como hermanos (no sub-ítems) — feedback de Valentino
- **Síntoma (verde ≠ se ve):** tras 1-A los módulos quedaron en "Servicios" pero con el
  markup atenuado heredado del bloque suelto: ícono `size={14}`, texto `text-xs text-zinc-500`,
  `pl-6` (indentado), pill/color por servicio (amber/violet/emerald). Parecían sub-ítems.
- **Causa raíz:** 1-A copió el markup viejo (fiel pero atenuado). La verificación adversarial
  validó "relocación byte-fiel" → correcto contra el spec de 1-A, pero el spec producía un
  visual malo. Una verificación de *diff-fidelity* NO detecta un problema de *diseño del spec*.
- **Fix:** los módulos activos se convierten en `NavItem[]` (`PREMIUM_MODULES`, orden fijo) y se
  inyectan en `section.items` de "Servicios" → se renderizan por el MISMO `.map` que los items
  normales. Visualmente indistinguibles de "Mi Chatbot" (size 16, `text-sm font-medium`,
  `text-zinc-400`/`hover:text-zinc-100`, indent cero, **pill cyan activo** en `/dashboard/modules/<x>`).
  Lo único propio: ícono + label. Se eliminó el bloque IIFE atenuado y `hasPremium`.
- Gate: tsc verde + eslint verde. **PENDIENTE:** re-verificación visual del humano.

---

## TAREA 1 — OK VISUAL de Valentino ✅ (incluye 1-A bis)

## TAREA 2 — Botón volver atrás
- **Estado:** EN CURSO

### 2-A) `src/components/dashboard/BackLink.tsx` (NUEVO)
- **Estado:** ✅ HECHO · gate tsc + eslint verde.
- Presentacional universal (sin hooks/'use client'): `<Link href>` + `ArrowLeft` (strokeWidth 1.5,
  `h-3.5 w-3.5`) + label. Props `href`/`label`/`className?`. Clases del patrón LeadDetail.
  `cn` desde `@/lib/utils` (canónico). href SIEMPRE estático.

### 2-B) Insertar BackLink (ALTA del relevamiento)
- **soporte/[ticketId]** → "Volver a soporte" (upgrade del breadcrumb): ✅ HECHO (tsc+lint verde).
  Reemplazó el breadcrumb "develOP / Tickets" y se quitó el import `Link` (quedaba sin uso).
- **email-marketing/campaigns + contactos** → ❌ SKIP (decisión de Valentino, 2026-06-28).
  Razón: (1) `email-marketing/page.tsx` (root) es `redirect('…/campaigns')` → "Volver al módulo" sería
  no-op en campaigns y redundante en contactos; (2) el layout ya tiene tab bar (Campañas|Contactos)
  → son tab-navegadas como `resultados/*`/`cuenta/*` (que NO llevan back por regla).

### 2-C) Violaciones de navegación
- **send/[id]**: `router.back()` (Cancelar) → `<Link>` al padre `/campaigns`: ✅ HECHO (tsc+lint verde).
  Botón Cancelar → `<Link>` con `pointer-events-none`+`opacity-40`+`aria-disabled`/`tabIndex` durante
  el envío (preserva el "disabled mientras loading"). El `router.push` post-envío (línea 23) queda
  (navegación imperativa post-acción, sancionada por CLAUDE.md).
- **campaigns/new**: los `router.push` son navegación POST-ACCIÓN (corren un server action y después
  navegan) → no pueden ser `<Link>`; `redirect()` server-side rompería la secuencia create→send→error
  de `handleSendNow`. CLAUDE.md permite `router.push` imperativo post-submit CON comentario inline.
  → ✅ DOCUMENTADO (decisión de Valentino: "Documentar"). Comentarios inline en los 3 `router.push`.
  ⚠️ **DEUDA PRE-EXISTENTE fuera de scope** (no introducida acá): eslint warn `formAction is assigned
  but never used` (línea 34). El `useActionState` no está cableado al form (usa `onSubmit={handleSendNow}`)
  → ese bloque (incl. 1 de los `router.push`) es CÓDIGO MUERTO. tsc verde, 0 errores; 1 warning baseline.
  Candidato a limpieza en su propio commit/lane si Valentino quiere (remover el `useActionState` muerto).

### Verificación adversarial Tarea 2 (workflow read-only, 4 lentes) — ✅ ALL PASS
- **scope/frozen:** 5 archivos en scope, ningún frozen; BackLink hook-free/server-safe, sin `any`.
- **backlink-soporte:** componente universal OK; swap del breadcrumb OK; sin import `Link` huérfano.
- **send-nav-fix:** `router.back()` eliminado; Cancelar = `<Link>` a padre estático; disabled-while-loading
  preservado (pointer-events-none/opacity/aria-disabled/tabIndex); `router.push` post-envío intacto.
- **nav-rules/types:** sin violaciones nuevas, sin `any`, 3 `router.push` documentados, estados preservados,
  hrefs estáticos. (warning `formAction` = baseline pre-existente, reportado, fuera de scope.)
- **PENDIENTE:** OK visual del humano (Tarea 2) antes de arrancar Tarea 3.

## TAREA 2 — OK VISUAL de Valentino ✅

## TAREA 3 — Empties: aplanar solo listas vacías, canon único
- **Estado:** EN CURSO

### 3-A) `src/components/ui/EmptyStateMuted.tsx` (NUEVO)
- **Estado:** ✅ HECHO · gate tsc + eslint verde.
- Re-export con nombre/ubicación neutros de `ResultEmptyState` (1 sola implementación = canon único):
  `EmptyStateMuted`, `emptyMutedCtaCls`, `emptyMutedCtaSecondaryCls`. Universal (sin 'use client'/hooks).
- El barrel `ui/index.ts` es FROZEN → los callers importan del path directo `@/components/ui/EmptyStateMuted`.
- Trampa de tamaño: el frozen `EmptyState` tenía `size`/`variant`; el canon NO. Para empties inline chicos
  (agenda "sin turnos", tienda "sin pedidos") se baja el padding vía `className` (twMerge pisa `py-16`).

### 3-B) Migración LIST → EmptyStateMuted (por área, commit por bloque)
- **modules** (email-marketing campaigns+contactos, motor-resenas, agenda, tienda): ✅ HECHO (tsc+lint verde).
  - campaigns: `cta` → `children` `<Link className={emptyMutedCtaCls}>` (+ ícono Plus, espejo del toolbar).
  - contactos / motor-resenas "sin reseñas": swap directo (sin CTA).
  - agenda "sin turnos" + tienda "sin pedidos": eran `size="sm"` (tienda además `variant="subtle"` = texto plano)
    → canon con `className="py-10"`. ⚠️ tienda pasa de texto-plano a caja punteada (más prominente) — revisar visual.
- **soporte** (SoporteBoard: 2 empties de columna `subtle/sm` → canon `py-10`): ✅ HECHO (tsc+lint verde).
- **project + services** (heroes hand-rolled zero-data → canon): ✅ HECHO (tsc+lint verde).
  - project "siendo preparado": glow card → `EmptyStateMuted` (icon FolderOpen, CTA "Hablar con el equipo").
  - services "sin servicios activos": hand-roll → canon (se elimina el workaround de boundary: el canon es
    universal, el ícono ya no cruza el RSC boundary). CTA ahora con ícono MessageSquare (consistente c/ project).
- **chatbot** (cliente): ✅ HECHO (tsc verde; 1 warning lint PRE-EXISTENTE en ClientLeadsTable:186
  useMemo deps, NO introducido acá). Archivos: ConversationsTable, ClientLeadsTable (4 empties: 2 swap,
  1 con CTA→children Link, 1 sm→py-10), LeadColumnOverview + LeadPipelineColumn (columnas→py-10),
  LeadDetail "sin conversación" (sm→py-10), chatbot/settings server page (Bot).
  - **CalibratingBlock**: ya usaba `ResultEmptyState` (relevamiento #8 desactualizado) → nada que hacer.
  - **LeadsTable.tsx** (dashboards/): es de ADMIN (lo usa admin/chatbots/[botId]/tabs/LeadsTab) → va en admin.
- **admin** (EN CURSO, por sub-área; `_design/*` EXCLUIDO = playground):
  - **admin/leads** ✅: pipeline-column + column-overview (py-10), inbound-leads-table (drop size=md),
    demo-form, lead-activity-feed (cta onClick→`<button>` con `!showForm`). tsc+lint verde.
  - **admin/projects+team** ✅: task-list (×2: lista + nested "sin registros" py-10), time-entry-panel,
    member-workload.
  - **admin/misc** ✅: AuditLogClient, ticket-list, messages/conversation-list, AlertsClient,
    alert-column-overview (py-10), ClientsListClient (ternary+cta→Link), BotsListClient (ternary+cta→Link).
    ⚠️ **conversation-list** arrastra error lint PRE-EXISTENTE `set-state-in-effect` (línea 57, useEffect de
    reconciliación; NO tocado por mí — mismo rule que el baseline PreloaderContext). Mi diff = solo import+empty.
  - **chatbot-admin** ✅: CrmSyncHistoryList (sm→py-10), LeadsTable (admin bot tab).
    **LatencyChart**: su `<EmptyState>` es un componente LOCAL (props status/totalSamples), NO el de ui → SKIP.
  - **Card variant="dashed"** ✅: VaultTab + ProjectsTab (empties de texto → `EmptyStateMuted` title-only),
    ChatbotTab (zero-state con icon Bot + CTA → children Link). ProjectsTab:76 (card roja "se debe crear
    proyecto") = error/instrucción, NO lista-vacía → SKIP. tsc+lint verde.
  - **boveda (cliente)** tiene `Card variant="dashed"` pero NO es lista-vacía flagged → fuera de scope (no tocar).

**TAREA 3 — TODOS los bloques migrados.**

### Verificación adversarial Tarea 3 (workflow read-only, 4 lentes) — ✅ ALL PASS
- **scope/frozen/heroes:** único archivo nuevo = `EmptyStateMuted.tsx`; ningún frozen editado; ningún hero
  aplanado; el re-export compila y es RSC-safe.
- **canon-correctness:** las 36 refs importan del path canon; sin `cta=/size=/variant=` sobrante; íconos como
  componente; toda CTA preservada (condicional→children condicional, onClick→`<button>`); `py-10` en los chicos.
- **hard-rules:** sin `any`/`router.push`/`router.back`/secrets nuevos; ramas de empty intactas; imports OK.
- **completeness:** el portal CLIENTE no tiene ningún `EmptyState` glowy frozen restante en listas vacías.
  El primitivo frozen queda solo en `_design` (showcase) + 3 páginas del setter (fuera de scope). **Canon único.**
- **PENDIENTE:** OK visual del humano (Tarea 3) → cierra el lane (sin merge).

---

## Estado final del lane (pendiente OK visual Tarea 3 + merge por Valentino)
- TAREA 1 ✅ (OK visual) · TAREA 2 ✅ (OK visual) · TAREA 3 ✅ (pendiente OK visual)
- **NO mergeado.** Merge a `main` lo hace Valentino.
- Deudas pre-existentes fichadas (NO introducidas por el lane): conversation-list set-state-in-effect (L57);
  ClientLeadsTable useMemo deps (L186); campaigns/new `formAction`/useActionState muerto.
- Decisiones (Valentino): campaigns/contactos sin back (tab-nav + root redirect); campaigns/new router.push
  documentado (no redirect). Skips: ProjectsTab:76 (error card roja), boveda cliente (no flagged), setter (otro app),
  _design (playground), LatencyChart (EmptyState local).

---

# BATCH 2 — 7 fixes (2 bloques). Worktree ya sincronizado con main. Commit por fix.

## BLOQUE A — cosmético
- **A1) loading.tsx fullwidth** (motor-resenas, agenda, project): ✅ HECHO (tsc+lint verde).
  Sacado `max-w-7xl`/`max-w-5xl` + `mx-auto` del wrapper de cada loading → matchea la page fullwidth.
- **A2) empty "sin proyectos" fullwidth** (dashboard/project): ✅ HECHO (tsc+lint verde).
  Sacado `max-w-4xl mx-auto` del wrapper de la rama empty (línea 159) → fullwidth como el main render
  (`flex flex-col gap-8 pb-20`). EmptyStateMuted NO tocado.
- **A3) hover en tiles TIPO/MONTO/INICIO/ENTREGA** (project): ✅ HECHO (tsc+lint verde).
  Tiles `detailFields.map` son server/estáticos (divs) → `adminHoverCls` directo en className (template literal).
  No HoverScaleCard (no es motion). `@/lib/hover` consumido, NO modificado.
- **A4) empties Chatbot "Leads recientes" + "Derivaciones WhatsApp"** → EmptyStateMuted: ✅ HECHO (tsc+lint verde).
  ChatbotOverview.tsx: los 2 `<p>` de vacío suelto → `EmptyStateMuted` (icon Users / PhoneForwarded, `py-10`
  por estar dentro de cards). Texto partido en title+description. Iconos ya importados.
- **A5) padding-bottom en /dashboard/plan**: ✅ HECHO (tsc+lint verde) — con MATIZ a confirmar.
  ⚠️ Hallazgo read-first: plan NO tiene layout ni padding DUPLICADO. Su `pb-20` (page.tsx:17 + loading.tsx:8)
  es IDÉNTICO al home y a TODO el portal (resultados/modules/chatbot/project/soporte todos usan `pb-20`).
  La ÚNICA página con pb reducido es **cuenta** (layout `pb-6`, pages sin pb) — ese fue su fix puntual.
  Decisión tomada (alineado al precedente cuenta que vos citaste): plan page+loading `pb-20`→`pb-6`.
  CONSECUENCIA: plan queda como cuenta pero DISTINTO del resto del portal (aún en `pb-20`).
  **DECISIÓN Valentino (2026-06-28): dejar plan en `pb-6`** (como cuenta). Sweep portal-wide `pb-20`→`pb-6`
  = fichado para un lane aparte si se quiere uniformidad total.

### Verificación adversarial Bloque A (workflow read-only, 3 lentes) — ✅ ALL PASS
- **scope/frozen:** 8 archivos en scope; ningún frozen modificado (hover.ts, EmptyStateMuted, ui/*, shell,
  primitivos solo consumidos vía import).
- **correctness:** A1-A5 matchean el spec exacto; `EmptyStateMuted` + `adminHoverCls` sin modificar.
- **hard-rules:** sin `any`/`router.push`/`router.back` nuevos; A4 importa del path canon; ramas intactas.
- **PENDIENTE:** OK visual del humano (Bloque A) antes de arrancar Bloque B.

## BLOQUE B — password (read-first obligatorio)
- **B1) READ-FIRST report** (/cambiar-password + /login): ✅ ENTREGADO (read-only, sin tocar código). Hallazgos:
  - **/cambiar-password** (`app/cambiar-password/{page,CambiarPasswordForm,actions}.tsx`): YA usa el patrón canónico
    SEGURO — **invocación DIRECTA** (`startTransition`+`await cambiarPasswordAction`) y navega `router.push('/dashboard')`
    DESPUÉS del await; NO usa `<form action>`. La action incrementa `sessionVersion` Y llama `unstable_update`
    (trigger='update' → auth.ts SKIPea el kill-check y refresca el token a N+1). → **NO tiene riesgo de pantalla negra.**
    Validación: client `validate()` on-submit + server Zod = **8 + letras + números** (difiere de cuenta = MAYÚSCULA).
    **Preserve-on-fail: SÍ** (campos en useState, no se limpian en error). **Disabled-until-valid: NO** (valida on-submit).
    **Visor: NO** (usa `<Input type="password">`).
  - **/login** (`app/login/page.tsx`): el input de password es `FloatingField` (componente LOCAL, no frozen) con `<input
    type="password">`. Mecanismo `<form action>`+useActionState (sign-in, no tocar lógica). **Visor: NO.**
  - **Canon (PasswordForm, ProfileForms.tsx)**: direct+await+`router.refresh()` después; visor Eye/EyeOff (raw input +
    botón tabIndex=-1, ojo-abierto=muestra, SIN strokeWidth → B2/B3 lo ponen en 1.5); reqs 8+MAYÚSCULA+número;
    disabled-until-score-3; preserve-on-fail.
  - **PARADAS: ninguna.** El visor NO requiere tocar `ui/Input` frozen (ui/Input no tiene slot de adorno → se usa el
    patrón raw-input+botón de PasswordForm). No hay que tocar auth.ts. B2 = solo visor (+ opcional disabled-until-valid);
    NO migrar mecanismo. B3 = visor en FloatingField. **DECISIÓN pendiente Valentino:** reqs de /cambiar-password
    ¿quedan en letras+números (como pide B2) o se unifican con cuenta (MAYÚSCULA)?
  - **FRENO** — no se toca password hasta OK de Valentino sobre este reporte.
- **B2) visor + validaciones /cambiar-password**: ✅ HECHO (tsc+lint verde).
  - Visor Eye/EyeOff (strokeWidth 1.5, ojo abierto=muestra) en los 3 campos: helper `PasswordInput`
    (raw input + botón tabIndex={-1} + aria-label dentro del `<Field>`; ui/Input NO editado, reemplazado su uso).
  - Reqs UNIFICADOS con cuenta = **8 + mayúscula + número** en client `checkStrength`/`validate()` Y en el Zod
    server `CambiarPasswordSchema` (mensajes espejo de `UpdatePasswordSchema`). Sincronizados ambos lados.
  - disabled-until-valid: botón `disabled={!canSubmit}` (score 3) + chips por requisito + "Falta: …" (espejo PasswordForm).
  - Preserve-on-fail conservado (campos en useState, no se limpian en error). Mecanismo INTACTO (direct+await+push).
    auth.ts NO tocado. (Cancelar sigue con `router.back()` pre-existente; es página de auth, no portal, fuera de scope.)
- **B3) visor /login**: PENDIENTE.

## Bitácora batch 2
- `f3c2b32` — fix(dashboard): loading.tsx de módulos+proyecto a fullwidth (A1)
- `ab111c4` — fix(project): empty "sin proyectos" a fullwidth (A2)
- `82aed0e` — feat(project): hover en tiles de detalle del hero (A3)
- `6ea7df9` — refactor(chatbot): empties del overview → EmptyStateMuted (A4)
- `713c203` — fix(plan): bottom padding pb-20→pb-6 alineado a cuenta (A5)
- `4f770eb`..`713c203` = Bloque A (verificado ALL PASS, OK visual de Valentino)
- `3ea12d0` — docs: Bloque A verdict + decisión A5
- `9a1d841` — docs: B1 read-first report (sin tocar código)
- B2 — feat(cambiar-password): visor + disabled-until-valid + reqs 8+mayúscula+número (este commit)
- NO TOCAR (heroes de venta/conexión): ChatbotUpsellLanding, ConnectStoreCard, ConnectAgendaCard,
  GBP-connect (motor-resenas), MessageThread welcome, AnalysisTeaser, BriefEmptyState.

---

## Bitácora de commits
- `7cfe4a4` — feat(dashboard): agrupar módulos premium dentro de "Servicios" en el sidebar (1-A)
- `6bd00a6` — fix(dashboard): páginas de módulo premium a fullwidth (sacar max-w local) (1-B)
- `94efb7c` — docs: log Tarea 1 (verificación adversarial all-pass)
- `9699eaa` — fix(dashboard): módulos del sidebar como items normales de "Servicios" (1-A bis)
- `e6155f5` — feat(dashboard): componente BackLink (2-A)
- `841425c` — feat(soporte): BackLink en detalle de ticket (2-B)
- `2e6dc93` — fix(email-marketing): Cancelar de send usa Link, no router.back (2-C send)
- `461824d` — docs(email-marketing): documentar router.push post-acción en campaigns/new (2-C new)
- `e6a24a9` — docs: log Tarea 2 (verificación adversarial all-pass)
- `63c455f` — feat(ui): EmptyStateMuted (canon único de empty LIST) (3-A)
- `79ce485` — refactor(modules): empties LIST → EmptyStateMuted (3-B modules)
- `211672f` — refactor(soporte): empties de columna → EmptyStateMuted (3-B soporte)
- `565afb1` — refactor(dashboard): empties project+services → EmptyStateMuted (3-B dashboard)
- `ea8c5ff` — refactor(chatbot): empties cliente → EmptyStateMuted (3-B chatbot)
- `7e1ac3d` — refactor(admin): empties de leads → EmptyStateMuted (3-B admin/leads)
- `75c27f7` — refactor(admin): empties projects/team/misc/chatbot-admin → EmptyStateMuted (3-B admin resto)
- 3-B card-dashed — refactor(admin): Card variant="dashed" empties → EmptyStateMuted (este commit)
