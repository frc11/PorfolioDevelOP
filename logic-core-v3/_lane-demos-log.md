# Lane Revisión Demos — Log de trabajo

Branch: `lane/demos` · Stack: Next.js 16 App Router · TS estricto (cero `any`) · Prisma/Neon · NextAuth v5 · Tailwind 4 · motion/react.
Fuente de verdad de este lane. Worktree en `C:/develop-demos/logic-core-v3`. Corre EN PARALELO con el lane Chatbots (otra branch) → aislamiento crítico.

---

## Scope (archivos editables — EXCLUSIVOS de Revisión Demos)

Todo bajo `src/app/(protected)/admin/leados/`:
- `page.tsx` · `loading.tsx` · `error.tsx`
- `[leadId]/page.tsx` · `[leadId]/loading.tsx`
- `[leadId]/_components/decision-bar.tsx` · `[leadId]/_components/dossier-panels.tsx`
- `_actions/revision.actions.ts` · `_actions/revision.schemas.ts`

Más, para Sprint 1, un **script de seed nuevo y dedicado** en `scripts/` (no se edita ninguna seed compartida).

## Prohibidos (consumir/llamar, NO editar)

- `src/lib/leados/dossier.ts` (máquina de estados — la usa el setter). Llamar `transitionDossier` desde un script de seed es LECTURA/USO, permitido; editar el archivo, NO.
- `src/lib/leados/flow.ts` (labels, setter + admin/leads) · `src/lib/leados/contracts.ts` (schemas Zod — leer tipos OK, editar NO) · `src/lib/leados/revision.ts`.
- `src/components/ui/Modal.tsx` · `AdminBackButton.tsx` · `AdminErrorBoundary.tsx` · `src/lib/auth-guards.ts` · `src/lib/action-utils.ts`.
- `prisma/schema.prisma` — FROZEN, nunca.

## Read-only externos (leer para sacar URLs/patrón, nunca editar)

- `src/components/sections/web-development/WebTemplatesImmersive.tsx` (URLs reales de demos).
- `admin/leads/_components/lead-form.tsx` · `admin/projects/_components/project-form.tsx` (patrón de robustez de forms).
- `scripts/b5-qa-review-queue.ts` · `scripts/b3-qa-assign-leads.ts` (template de seed de la cola).

---

## FASE 0 — Discovery

### Datos Prisma (confirmados, no asumidos)
- `OsLeadDossier`: `leadId @unique` (1:1 `OsLead`), `stage` (enum `DossierStage`), `draftUrl` (= iframe del detalle), `finalUrl`, `aprobadaAt`, `rechazos` (Json). Cola = `stage EN_REVISION`. `@@index([stage])`.
- `OsLead`: join read-only (`businessName`, `contactName`, `industry`, `zone`, `status`...). **No hay `organizationId`** (agencia única develOP) → no hay filtro multi-tenant acá.
- `OsDemo`: **NO** se usa en esta sección. No se toca ni se introduce.
- `enum DossierStage`: `FICHA → EVALUADA → BRIEF → CONSTRUCCION → EN_REVISION → APROBADA | RECHAZADA`; `EVALUADA → DESCARTADA`; `RECHAZADA → CONSTRUCCION` (loop de rechazo).

### URLs reales de demos (verbatim de `WebTemplatesImmersive.tsx` `TEMPLATES[]`)
Las 6 son sitios Netlify desplegados, embebibles en iframe (Netlify no setea `X-Frame-Options` ni `frame-ancestors` por default; el `next.config.ts` de develOP solo restringe `/admin` y `/dashboard`, no afecta a estos sitios externos):

| Label | URL (copiar verbatim) | Vertical |
|---|---|---|
| Zero Protocol | `https://template-zero.netlify.app/` | Tech / terminal |
| The Ethereal Resort | `https://template-ethernal.netlify.app/` | Hospitality |
| Noir Dining in the Void | `https://template-noir.netlify.app/` | Gastronomía |
| Skyline Estates | `https://template-skyline.netlify.app/` | Real estate |
| NEXO Bold | `https://template-bold.netlify.app/` | Agency |
| YAKU Nebula | `https://template-nebula.netlify.app/` | SaaS |

⚠️ **`The Ethereal Resort` el host es `ethernal` (no `ethereal`)** — es así como está desplegado. Copiar literal; "corregirlo" rompe el iframe (404).

### Mecanismo de seed de la cola (template)
- `scripts/b5-qa-review-queue.ts` puebla EN_REVISION llamando `transitionDossier` (camino legal). Hoy deja 2 dossiers con `draftUrl` PLACEHOLDER: Café La Esquina (`example.com`) y Panadería Doña Rosa (`example.org`).
- Depende de `scripts/b3-qa-assign-leads.ts` (crea los leads) y del setter QA `setter-qa@develop.test` (rol SETTER, lo crea `prisma/seed.ts`).
- Guard de host: corre SOLO si `DATABASE_URL` apunta a la branch Neon dev `ep-quiet-waterfall-acv0fpll`. Idempotente. Se corre con `npx tsx scripts/<archivo>.ts`.
- **Este worktree NO tiene `.env`/`.env.local`, `DATABASE_URL` no está seteada y `tsx` no está instalado** → no se puede correr ningún seed desde acá (ver PENDIENTE 1).

### Patrón de robustez de forms (lead-form / project-form)
- `useTransition` → `isPending`. El botón submit se deshabilita vía `loading={isPending}` (ese ES el anti doble-submit; NO hay `if (isPending) return` a nivel handler).
- Validación en dos capas: `Schema.safeParse` client (errores por campo) → action server (Zod de nuevo + `requireSuperAdmin` + try/catch con `mapError` que NUNCA expone stack).
- **Éxito**: `closeModal()` (cierra + resetea campos + limpia errores) **y DESPUÉS** `router.refresh()` (la action ya hizo `revalidatePath`). Sin `router.push` (salvo convert-lead que navega a la entidad creada).

### Gap de `decision-bar.tsx` (lo que hay que arreglar en Sprint 2)
Usa el mismo backbone (useTransition, botones `disabled={isPending}`, `closeOnBackdrop={!isPending}`, guard de cierre `if (isPending) return`, errores con banner). **Divergencias en el camino de ÉXITO**:
1. En éxito **NO cierra ni resetea el modal** — solo llama `irAlSiguiente()`. El modal se desmonta como efecto colateral de la navegación; si la nav tarda, queda colgado con input viejo.
2. **Nunca limpia `finalUrl`/`rechazo`** en éxito (no hay reset de estado de campos).
3. `irAlSiguiente()` usa **`router.push`** → viola la regla dura del lane (en admin va `router.refresh()`).

---

## Sprints (criterios de aceptación)

### Sprint 1 — Seed cola con URLs reales + verificación del preview
**Objetivo:** la cola EN_REVISION muestra demos con `draftUrl` = URLs reales; el iframe del detalle carga la demo real (o fallback limpio). Cero `example.com`/`example.org`.
**Aceptación (a ojo, humano en :3000):** cola lista demos de prueba → URLs reales; detalle carga la demo real en el iframe; cero placeholders.
**Estado:** ✅ script escrito · ⛔ correrlo = PENDIENTE 1 (sin env/DB en el worktree).

### Sprint 2 — Fix Aprobar/Rechazar (patrón nuevo-lead/nuevo-proyecto)
**Objetivo:** ambos flujos end-to-end con robustez: deshabilitado mientras pending, sin doble submit, error visible sin stack, modal cierra+resetea al éxito, navegación con `router.refresh()` (sin `router.push`).
**Aceptación:** Aprobar → URL → confirmar una vez → APROBADA, modal cierra+resetea, vista refresca; idem Rechazar con los 3 campos → RECHAZADA; error visible si falla. **+ el modal aparece como overlay centrado con backdrop sobre TODO (no atrapado en el `<main>`).**
**Estado:** ✅ hecho (re-fix: ver "Corrección Sprint 2") · gate eslint 0 + tsc 0.

### Sprint 3 — Ficha de observación: acordeón hover, one-at-a-time
**Objetivo:** las sub-secciones de la ficha se despliegan al hover, exactamente una abierta, con intención (debounce ~90-120ms), lock anti-cascada durante la transición, sin colapsar todo en mouse-leave, headers estables, body animado con grid-rows 0fr↔1fr + opacity (ease-out, <300ms), reduced-motion instantáneo, click+teclado operativos (aria-expanded).
**Aceptación:** hover abre esa sección y cierra la previa, suave; mover el mouse entre headers no genera flicker ni aperturas espurias; reduced-motion no anima; click/teclado andan.
**Estado:** ✅ hecho · gate eslint 0 + tsc 0.

### Sprint 4 — Layout del detalle: aprovechar el alto (preview sticky)
**Objetivo:** eliminar el hueco vertical bajo el preview; preview sticky que llena el alto disponible mientras se scrollea la columna derecha; arranca arriba; responsive a 1 columna en pantallas chicas.
**Aceptación:** sin hueco muerto; alto aprovechado; preview grande/usable; arranca arriba; responsive ok.
**Estado:** ✅ hecho · gate eslint 0 + tsc 0.

---

## Gate por sprint
`eslint` limpio en los archivos tocados + `.\node_modules\.bin\tsc.cmd --noEmit` (desde `logic-core-v3`, NO `npx tsc`) sin errores NUEVOS. **Baseline al arrancar el lane: tsc exit 0, 0 errores.** Lo visual lo verifica el humano a ojo en :3000 (preview MCP flaky; visual-qa no ve el browser). No se autoconfirma por compilar.

---

## PENDIENTE DE COORDINACIÓN

1. **(Sprint 1) Correr el seed contra la DB dev.** Este worktree no tiene `.env`/`.env.local` ni `DATABASE_URL` seteada, y `tsx` no está instalado → el script no se puede correr desde acá (además el script aborta si `DATABASE_URL` no apunta a `ep-quiet-waterfall-acv0fpll`). El script queda escrito e idempotente; el humano lo corre con el env de dev cargado. Comando exacto en la sección del Sprint 1. DB compartida con el lane Chatbots → el script es upsert no destructivo y solo toca filas propias (leads `DEMO Web · *` + las QA legacy con `example.*`).

---

## Ejecución por sprint

### ✅/⛔ Sprint 1 — Seed cola con URLs reales + preview
**Hecho:** nuevo script `scripts/demos-seed-review-queue.ts` (dedicado, idempotente, no destructivo). Siembra 6 leads `DEMO Web · <Template>` (Zero/Ethereal/Noir/Skyline/Bold/Nebula), cada uno con un dossier caminado por el **camino legal** (`transitionDossier`: FICHA→EVALUADA→BRIEF→CONSTRUCCION→EN_REVISION), con ficha + evaluación (score 5 CALIENTE → abre el gate del brief sin tocar `status`) + brief + self-check en verde + `draftUrl` = URL real del template. Asigna al setter QA si existe (`setter-qa@develop.test` o cualquier `SETTER`), si no deja sin asignar. Migra placeholders: todo dossier EN_REVISION con `draftUrl` `example.*` (las filas QA de `b5-qa-review-queue.ts`) pasa a una URL real → **cero example.* en la cola**.
**No tocado / por qué:** el iframe del detalle (`[leadId]/page.tsx`) ya tiene fallback limpio ("Abrir en pestaña nueva" + nota de hosts que bloquean embed + empty state sin draftUrl) y las 6 URLs son embebibles (Netlify, sin X-Frame/CSP) → **no se tocó el iframe** (la regla dice mejorarlo solo si está roto; no lo está). No se editó ninguna lib compartida ni schema; `transitionDossier` se **llama** (uso, permitido), no se edita.
**Gate:** `scripts/**` está EXCLUIDO de tsc (`tsconfig.exclude`) y de eslint (igual que los `b5-qa-*`/`b3-qa-*` existentes) → el script no pasa por los gates del proyecto; se escribió siguiendo verbatim los idioms del `b5-qa-review-queue.ts` (template probado) y verificado a mano: cero `any`, tipos contra las firmas reales. Ningún archivo `src/` incluido cambió → **tsc sigue en baseline (exit 0)**.
**Cómo correrlo (PENDIENTE — lo corre el humano con el env de dev):**
```
cd logic-core-v3
# requiere .env.local con DATABASE_URL apuntando a la branch Neon dev (ep-quiet-waterfall-acv0fpll)
npx tsx scripts/demos-seed-review-queue.ts
```
Esperado: "Cola de revisión: N dossier(s) EN_REVISION · M placeholder(s) migrado(s) · 0 con example.* restante(s)".

### ✅ Sprint 2 — Fix Aprobar/Rechazar (patrón nuevo-lead)
**El bug:** en el camino de ÉXITO, `decision-bar.tsx` solo llamaba `irAlSiguiente()` y **nunca cerraba ni reseteaba el modal**: el modal se desmontaba como efecto colateral de la navegación → si la nav tardaba quedaba colgado con el input viejo; `finalUrl`/`rechazo` nunca se limpiaban. Además `irAlSiguiente()` usaba **`router.push`** (viola la regla del lane: en admin va `router.refresh()`).
**El fix (patrón lead-form/project-form: cerrar+resetear y DESPUÉS refrescar):**
- `old → new` (navegación): `router.push(next || '/admin/leados') + router.refresh()` **→** `router.refresh()` en el lugar. La demo deja de estar EN_REVISION, la página re-renderiza sin la barra y muestra el banner "ya no está en revisión"; **"Siguiente en la cola"** (link del header, que ya existía) avanza a mano. Se eliminó el auto-salto a la URL del siguiente (era lo que requería `router.push`).
- `old → new` (cierre/reset): nuevo `resetAndClose()` = `setModal(null)` + limpia `finalUrl`/`rechazo` + limpia errores. Lo usa el éxito (`resolverYRefrescar` = `resetAndClose(); router.refresh()`) y también el cierre manual `closeModal` (guardado con `if (isPending) return`). Antes el cierre manual NO reseteaba los campos; ahora reabrir el modal arranca limpio.
- Doble-submit: se agregó `if (isPending) return` al tope de `handleAprobar`/`handleRechazar` (defensivo; además los botones de confirmar ya eran `disabled={isPending}` y el `closeOnBackdrop={!isPending}` y el guard de cierre ya estaban).
- Prop muerta: se quitó `nextLeadId` de `DecisionBar` (props + el call en `[leadId]/page.tsx`). `nextLeadId` sigue calculándose en la page para el link del header.
**No tocado:** `revision.actions.ts`/`revision.schemas.ts` (el fix es 100% client), `Modal.tsx`, `requireSuperAdmin`/autorización.
**Gate:** eslint 0 (decision-bar.tsx + page.tsx) + `tsc --noEmit` exit 0.
**Nota UX para el humano:** verificar que tras aprobar/rechazar el modal cierra al toque y la vista refresca mostrando el estado nuevo; el avance a la próxima demo ahora es un click en "Siguiente en la cola" (no auto-salto).

### ✅ Sprint 3 — Ficha de observación: acordeón hover, one-at-a-time
**`old → new`:** los bloques de la ficha eran `<details>` independientes (click-toggle; podían quedar todos abiertos o todos cerrados) **→** nuevo componente client `[leadId]/_components/ficha-accordion.tsx`, controlado, **exactamente una sección abierta** (default la primera), que se abre al **hover**. `FichaPanel` (server, en `dossier-panels.tsx`) arma los bloques con contenido y le pasa `items: {key,label,texto}[]` (solo strings serializables).
**Valores elegidos:**
- **Animación:** `260ms` (< 300), ease `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (la firma del proyecto; ease-out, nunca ease-in/linear). Sólo anima el **body** vía `grid-template-rows 0fr↔1fr` + `opacity` (header de altura estable; el chevron rota con `transform`/`will-change`).
- **Hover con intención:** debounce `110ms` — pasar el mouse de largo entre headers no abre nada (anti-flicker de pass-through).
- **Lock anti-cascada (lo que pidió el usuario):** al confirmar una apertura, `locked=true` por `ANIM + 60ms` (= `320ms`); mientras está locked se **ignoran los `mouseenter`**. Así, cuando el reflow del abrir/cerrar mueve los headers bajo el cursor quieto, los `mouseenter` espurios del reflow no disparan toggles. Tras el lock el layout ya está estable y, sin un movimiento real del mouse, no se emite otro `mouseenter` → cero aperturas espurias.
- **Sin colapsar todo en mouse-leave:** salir del panel sólo cancela una intención pendiente; la sección abierta queda abierta (evita flicker). Siempre hay una abierta.
- **reduced-motion:** `transition: none` (instantáneo), lock reducido a `60ms`. (El hover-intent de 110ms se mantiene en ambos modos: es intención, no animación; fácil de quitar para reduced si el humano lo prefiere.)
- **A11y:** headers son `<button>` con `aria-expanded`; `onClick` y `onFocus` abren igual (teclado: tabular a un header lo abre) — el hover es enhancement, no el único camino.
**No tocado:** `contracts.ts` (solo se leen tipos de `Ficha`), los otros 4 paneles de `dossier-panels.tsx`, Modal, libs compartidas.
**Gate:** eslint 0 (ficha-accordion.tsx + dossier-panels.tsx) + `tsc --noEmit` exit 0.
**Nota para el humano:** la animación de `grid-template-rows` es la técnica canónica de height-auto (Chrome 107+/FF/Safari 16+); en un browser viejo haría snap (sigue funcional). Verificar a ojo: hover suave, cero flicker entre headers, reduced-motion instantáneo, click/teclado.

### ✅ Sprint 4 — Layout del detalle: aprovechar el alto (preview sticky)
**Causa del hueco (diagnóstico):** el grid (`xl:grid-cols-[1.55fr_1fr]`) usa `align-items: stretch` por default → la columna izquierda (la demo) se estiraba a la altura de la columna derecha (paneles, mucho más alta), dejando un hueco enorme **debajo** del iframe `h-[70vh]` fijo.
**Estrategia (la preferida del pedido):** preview **sticky** que llena el alto del viewport mientras se scrollea la derecha; arranca arriba.
**`old → new`:**
- Grid item izquierdo: stretch (estirado) **→** `xl:self-start` (corta el stretch — esto solo ya mata el hueco).
- Sección "La demo": estática **→** `xl:sticky xl:top-0` (se ancla al tope del scroll-container, que es el `<main>` del admin, una vez que el header card scrollea) + `xl:flex xl:flex-col` con **altura definida** `xl:h-[calc(100vh-12.5rem)]` (12.5rem ≈ topbar `h-16` 4rem + paddings del contenedor 2rem + `mt-4` 1rem + footer ~2rem + padding del `<main>` p-6 3rem + colchón). Tunable si el humano ve clip/gap.
- Wrapper del iframe: `xl:flex-1 xl:min-h-0` (crece para llenar el alto restante de la sección).
- Iframe: `h-[70vh]` fijo **→** `h-[60vh] w-full xl:h-full` (en xl llena el wrapper sticky; en pantallas chicas baja a 60vh, "no queda gigante").
- Empty state (sin draftUrl): crece con `xl:flex-1` + centrado, así no deja gap en la sección sticky (caso borde; el seed garantiza draftUrl).
- Responsive: el grid ya colapsa a 1 columna < xl; sin sticky, iframe 60vh.
**No tocado:** `AdminLayoutClient`/`<main>` (se LEYÓ para fundamentar el offset; no se editó), libs, Modal, schema.
**Gate:** eslint 0 (page.tsx) + `tsc --noEmit` exit 0.
**Nota para el humano:** el valor `calc(100vh-12.5rem)` está calculado contra el alto real del `<main>`; si en tu pantalla el preview clippea el pie ("Si el embed no carga…") o deja un gap, ajustar ese rem. Verificar a ojo: scrollear la derecha con el preview grande y fijo, sin hueco, arrancando arriba; y el colapso a 1 columna en mobile.

### ✅ Review adversaria + hardening (post-sprints)
Se corrió una review adversaria (3 reviewers: correctness UI, romper el acordeón, type-safety del seed + scope). Resultado: **0 violaciones de scope, 0 blockers, 0 majors**; el core del acordeón (anti-cascada, one-at-a-time, hydration) y las reglas del lane (sin `router.push`, cero `any`, ningún archivo prohibido tocado) quedaron confirmados. Se aplicaron las mejoras minor/nit que valían:
- **ficha-accordion:** la sección abierta ahora se trackea por **`key`** (no por índice) + fallback al primero → garantiza **siempre exactamente una abierta** aunque cambie el set de bloques (antes, si `items` se achicaba, podía quedar cero). Los side-effects (lock/timer) salieron del **updater de `setState`** (pureza React; se mantienen en `commitOpen`, event handler) — y el ref espejo se actualiza sólo ahí (la regla `react-hooks/refs` prohíbe escribir refs en render). **A11y de disclosure:** `aria-controls`+`id` ligando botón↔region y `aria-hidden` en el body colapsado (saca el texto cerrado del árbol de accesibilidad).
- **seed:** el patch idempotente EN_REVISION ahora corre sólo si la fila **ya estaba** EN_REVISION al entrar (`startedEnRevision`) → elimina un UPDATE redundante (inofensivo, mismos valores) en la primera corrida de una fila nueva.
- **Se dejó como está (cosmético, validado por el humano):** el `calc(100vh-12.5rem)` del preview sticky (no afecta correctness; el iframe `flex-1` lo absorbe) y el mapeo URL↔nombre de las filas legacy migradas (el objetivo es sólo "cero example.*").
**Gate:** eslint 0 + `tsc --noEmit` exit 0.

### 🔧 Corrección Sprint 2 — alinear forms Aprobar/Rechazar con nuevo-lead/proyecto
**El bug REAL (el de Sprint 2 era una hipótesis equivocada — el cierre/reset NO era la causa):** `decision-bar.tsx` usaba el `<Modal>` compartido (`@/components/ui`), que renderiza `fixed inset-0` **INLINE, sin portal**. El `<main>` del admin (`AdminLayoutClient.tsx:82`) tiene `backdrop-blur-md` → ese `backdrop-filter` crea un **containing block** que re-ancla cualquier `position:fixed` descendiente. Resultado: el modal no se centraba sobre el viewport — quedaba atrapado/desplazado dentro del `<main>`, tapando los paneles a la derecha. Es exactamente la trampa de la memoria `admin-fixed-backdrop-trap`; los forms que andan (`lead-form`, `project-form`) la esquivan **portaleando a `document.body`**.
**`old → new` (diff estructural concreto vs lead-form/project-form):**
1. **Render del modal:** `<Modal>` compartido (NO portalea) **→** overlay **portaleado a `document.body`** con `createPortal` + `useIsClient` (gate SSR-safe), réplica local de la estructura de `lead-form` (mismo overlay `fixed inset-0 z-[130] flex items-center justify-center bg-[#05070a]/80 backdrop-blur-md` y panel `bg-[#0c1016]/95 … backdrop-blur-xl`). Se escapa el trap del `<main>` → overlay centrado sobre TODO.
2. **Mecanismo de submit:** botones con `onClick` imperativo en el footer del Modal **→** `<form onSubmit={handle}>` con `<Button type="submit" loading={isPending}>` (Enter submitea, igual que los forms).
3. **Pending/loading:** `<LoaderCircle>` manual **→** prop `loading` del `<Button>` compartido (deshabilita + spinner).
4. **Inputs:** `<input>`/`<textarea>` nativos **→** `<Input>` compartido (+ textarea nativo para el arreglo, igual que lead-form). Validación Zod doble, `serverError` en banner, reset+`router.refresh()` se mantienen.
**Por qué local y no el `OverlayModal` del lane Proyectos:** aislamiento entre lanes (ese archivo lo posee Proyectos; importarlo acopla las branches). Se replicó la **estructura** de `lead-form` dentro de `decision-bar.tsx` — sin tocar `Modal.tsx`, sin tocar los forms de referencia, sin tocar el layout admin.
**No tocado:** `Modal.tsx` (compartido, intacto), `lead-form`/`project-form` (referencia read-only), `AdminLayoutClient`/`<main>` (la causa es su `backdrop-filter`, pero el fix correcto vive en scope = portalear, no editar el layout). Actions/schemas sin cambios (el fix es client).
**Gate:** eslint 0 (decision-bar.tsx) + `tsc --noEmit` exit 0. **Lo visual lo verifica el humano en :3000** (preview MCP flaky / visual-qa no puede bootear un 2º `next dev`).

---

## CIERRE DEL LANE — Auditoría y notas de merge

Fecha: 2026-06-17 · Branch: `lane/demos` · Gate final: tsc exit 0 · eslint exit 0

---

### 1 · AUDITORÍA DE LO HECHO (desde git)

#### Commits (`git log --oneline main..HEAD`)

| SHA | Mensaje | Qué resolvió (deducido del diff) |
|---|---|---|
| `ec561ff` | chore(demos): plan + log del lane | Creó `_lane-demos-log.md`: scope, lista prohibidos, discovery (URLs reales, mecanismo seed, patrón forms, gap de decision-bar), 4 sprints con criterios. Paso 0 del super-prompt. |
| `58458f8` | feat(demos): seed cola de revisión con URLs reales + verificación del preview | Creó `scripts/demos-seed-review-queue.ts` (395 líneas): 6 leads `DEMO Web · *` con URLs Netlify reales, camino legal FICHA→EN_REVISION vía `transitionDossier`, migración de filas legacy `example.*`. Sprint 1. |
| `45bf684` | fix(demos): robustez de Aprobar/Rechazar (patrón nuevo-lead) | **SUPERSEDED.** Diagnosticó mal: arregló el cierre/reset del modal en el camino de éxito y sustituyó `router.push` por `router.refresh()`. El bug visual del modal (pegado a la derecha, no centrado) PERSISTÍA. Sprint 2 — primer intento. |
| `9265791` | feat(demos): ficha de observación con acordeón hover (one-at-a-time) | Creó `ficha-accordion.tsx` (142 líneas): acordeón hover debounce 110ms, lock anti-cascada, grid-rows 0fr↔1fr, reduced-motion, a11y. Modificó `dossier-panels.tsx` para pasar items. Sprint 3 — versión inicial (tracking por índice; corregida en 284f897). |
| `c2a6c66` | feat(demos): layout del detalle aprovecha el alto (preview sticky) | Modificó `[leadId]/page.tsx`: `xl:self-start` + `xl:sticky xl:top-0` + `h-[calc(100vh-12.5rem)]` en la sección preview; iframe `xl:h-full`; empty state con `xl:flex-1`. Eliminó el hueco. Sprint 4. |
| `284f897` | refactor(demos): hardening del acordeón y seed (post-review adversaria) | Hardening post review: `ficha-accordion` pasó a tracking por `key` (no índice) + fallback al primero → siempre exactamente una abierta; side-effects fuera del setState updater (pureza React); `aria-controls`+`id`+`aria-hidden`. Seed: guard `startedEnRevision` elimina UPDATE redundante. |
| `be48efa` | fix(demos): alinear forms Aprobar/Rechazar con estructura de nuevo-lead/proyecto | **FIX CORRECTO.** Reescribió `decision-bar.tsx`: overlay portaleado a `document.body` con `createPortal` + `useIsClient`; `<form onSubmit>`; `<Button loading={isPending}>` / `<Input>` compartidos; serverError en banner. Sprint 2 — corrección definitiva. |

#### Archivos tocados (`git diff --stat main...HEAD`)

```
logic-core-v3/_lane-demos-log.md                        +177  (plan + log — propio)
logic-core-v3/scripts/demos-seed-review-queue.ts        +400  (seed nuevo — propio)
admin/leados/[leadId]/_components/decision-bar.tsx      +267 / -129  (fix Aprobar/Rechazar)
admin/leados/[leadId]/_components/dossier-panels.tsx     +28  (integración FichaAccordion)
admin/leados/[leadId]/_components/ficha-accordion.tsx   +165  (nuevo — acordeón hover)
admin/leados/[leadId]/page.tsx                           +18  (sticky preview)
```

6 archivos · +926 inserciones / -129 borrados.

#### Desviaciones del plan

**Desviación 1 — Sprint 2 necesitó dos commits (45bf684 → be48efa).**
El primer diagnóstico era incorrecto: el bug no era el cierre/reset. La causa real era estructural: `decision-bar` usaba el `<Modal>` compartido, que renderiza `position:fixed` inline sin portal; el `<main>` del admin tiene `backdrop-blur-md` → ese `backdrop-filter` crea un containing block que atrapa `position:fixed` → modal anclado al `<main>`, no al viewport. La corrección replicó la estructura de `lead-form.tsx` (portal a `document.body`). Las mejoras del commit superseded (reset+router.refresh) se conservaron en el re-fix.

**Desviación 2 — `ficha-accordion.tsx` inicial (9265791) requirió hardening (284f897).**
La primera versión trackeaba por índice numérico y ejecutaba side-effects dentro del setState updater. La review adversaria detectó: (a) cambio en `items` podía dejar cero secciones abiertas; (b) React StrictMode puede llamar updaters dos veces → timers duplicados; (c) `react-hooks/refs` prohíbe escribir refs durante render. Hardening: tracking por `key` + fallback, side-effects fuera del updater, aria semántico completo.

---

### 2 · PILA DE PENDIENTES DE COORDINACIÓN

**Sin pendientes de coordinación.** Ningún cambio requirió tocar archivos compartidos, schema, o libs prohibidas.

**Pendiente OPERATIVO (no afecta el merge):**
Correr el seed contra la DB dev. El worktree no tiene `.env.local` / `DATABASE_URL` / `tsx`. Comando:
```
cd logic-core-v3
# requiere .env.local con DATABASE_URL → ep-quiet-waterfall-acv0fpll
npx tsx scripts/demos-seed-review-queue.ts
```

---

### 3 · CHECK DE DISCIPLINA DE AISLAMIENTO

| Archivo | Clasificación |
|---|---|
| `_lane-demos-log.md` | Propio del lane ✅ |
| `scripts/demos-seed-review-queue.ts` | Nuevo, propio del lane ✅ |
| `admin/leados/[leadId]/_components/decision-bar.tsx` | Exclusivo leados ✅ |
| `admin/leados/[leadId]/_components/dossier-panels.tsx` | Exclusivo leados ✅ |
| `admin/leados/[leadId]/_components/ficha-accordion.tsx` | Nuevo, exclusivo leados ✅ |
| `admin/leados/[leadId]/page.tsx` | Exclusivo leados ✅ |

Archivos prohibidos — check negativo: `dossier.ts` · `flow.ts` · `contracts.ts` · `revision.ts` · `auth-guards.ts` · `action-utils.ts` · `Modal.tsx` · `AdminBackButton.tsx` · `AdminErrorBoundary.tsx` · `AdminLayoutClient.tsx` · `prisma/schema.prisma` → **todos ausentes del diff** ✅

`schema.prisma` no está en el diff. Seed y actions usan solo columnas existentes de `OsLeadDossier` (`leadId`, `stage`, `draftUrl`, `finalUrl`, `aprobadaAt`, `rechazos`) y `OsLead` (read-only join) ✅

**VEREDICTO: cero violaciones de scope. Cero archivos prohibidos tocados.**

---

### 4 · ESTADO DEL GATE

```
.\node_modules\.bin\tsc.cmd --noEmit   →  EXIT: 0  (0 errores)
npx eslint [4 src files]               →  EXIT: 0  (0 errores)
```

Build completo no corrido en la auditoría (el gate del lane es tsc+eslint; el build puede tener deuda baseline ajena preexistente al lane).

---

### 5 · VERIFICACIÓN FUNCIONAL/VISUAL PENDIENTE

**✅ Verificado técnico:** tsc exit 0 · eslint exit 0 · cero archivos fuera de scope · cero `any` · cero `router.push` en admin · cero imports de `Modal.tsx`.

**👁 A probar por el humano en :3000:**

**APROBAR / RECHAZAR** — actions: `aprobarRevision` + `rechazarRevision` (`_actions/revision.actions.ts`). Confirmar: modal aparece centrado con backdrop sobre TODO el viewport (no pegado al panel); submit con spinner una sola vez; transición EN_REVISION→APROBADA/RECHAZADA persistida; modal cierra y limpia campos; vista refresca. Campo vacío → error inline. Reabrir modal → campos limpios. **UX nueva:** ya no hay auto-salto; la vista queda en la demo procesada; avanzar con "Siguiente en la cola" (header).

**DEMOS REALES** (post-seed): iframe carga las URLs Netlify reales; fallback "Abrir en pestaña nueva" disponible si un host bloquea framing.

**FICHA ACORDEÓN** — hover >110ms abre la sección suave (260ms), la previa cierra. Pasar el mouse rápido: sin flicker. Reflow del layout al abrir/cerrar: sin apertura espuria (lock 320ms). Mouse fuera del panel: sección abierta queda abierta. `prefers-reduced-motion`: instantáneo. Click + Tab+Enter: andan.

**LAYOUT STICKY** — en xl: iframe llena el alto, sin hueco, sticky mientras se scrollea la columna derecha, arranca arriba. En mobile: 1 columna, iframe 60vh. Si clippea: ajustar `calc(100vh-12.5rem)`.

---

### 6 · NOTAS PARA EL MERGE

**Dependencias:** `package.json` y `package-lock.json` (logic-core-v3) — no tocados ✅. El `package-lock.json` en la raíz del repo es preexistente al lane (untracked), no cuenta.

**Archivos nuevos del lane** (cruzar contra lane/chatbots):
- `src/app/(protected)/admin/leados/[leadId]/_components/ficha-accordion.tsx`
- `scripts/demos-seed-review-queue.ts`
- `_lane-demos-log.md`

No puedo ver la branch chatbots → el orquestador debe cruzar estos 3 paths. Si Chatbots no tocó `admin/leados/` ni creó `scripts/demos-seed-*`, el merge es limpio.

**DEUDA COMPARTIDA LATENTE — `AdminLayoutClient.tsx:82` (SHARED, no tocado):**
El `<main>` del admin tiene `backdrop-blur-md` → CSS containing block que atrapa `position:fixed` de todos los descendientes. El fix de este lane portaleó los modales de `decision-bar` a `document.body` para escapar la trampa. **La causa raíz vive en el archivo compartido.** Si otros lanes tienen o crean modales sin portal bajo `/admin/` (usando el `<Modal>` compartido u otro componente que no portalee), sufrirán el mismo síntoma. Recomendación al orquestador: coordinar un fix centralizado de `AdminLayoutClient` (sacar el `backdrop-filter` del `<main>` o moverlo a un pseudo-elemento) para que el `<Modal>` compartido funcione sin necesidad de portalear caso por caso. Al menos 5 modales admin potencialmente afectados (memoria `admin-fixed-backdrop-trap`).

**Riesgos de merge:** ninguno detectado. Sin cambios de schema, sin deps nuevas, sin archivos compartidos tocados.
