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
**Aceptación:** Aprobar → URL → confirmar una vez → APROBADA, modal cierra+resetea, vista refresca; idem Rechazar con los 3 campos → RECHAZADA; error visible si falla.
**Estado:** _(se completa al cerrar)_

### Sprint 3 — Ficha de observación: acordeón hover, one-at-a-time
**Objetivo:** las sub-secciones de la ficha se despliegan al hover, exactamente una abierta, con intención (debounce ~90-120ms), lock anti-cascada durante la transición, sin colapsar todo en mouse-leave, headers estables, body animado con grid-rows 0fr↔1fr + opacity (ease-out, <300ms), reduced-motion instantáneo, click+teclado operativos (aria-expanded).
**Aceptación:** hover abre esa sección y cierra la previa, suave; mover el mouse entre headers no genera flicker ni aperturas espurias; reduced-motion no anima; click/teclado andan.
**Estado:** _(se completa al cerrar)_

### Sprint 4 — Layout del detalle: aprovechar el alto (preview sticky)
**Objetivo:** eliminar el hueco vertical bajo el preview; preview sticky que llena el alto disponible mientras se scrollea la columna derecha; arranca arriba; responsive a 1 columna en pantallas chicas.
**Aceptación:** sin hueco muerto; alto aprovechado; preview grande/usable; arranca arriba; responsive ok.
**Estado:** _(se completa al cerrar)_

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
