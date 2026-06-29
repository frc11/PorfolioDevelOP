# Bitácora — Fase Beta de LeadOS

Esta es la bitácora **dedicada a la fase beta de LeadOS**. Arranca con el sprint **C.0** (blindaje de seeds, 2026-06-17) y el **bloque FG-0** completo (shell + navegación + reconciliación visual del setter), que es el punto desde el cual empieza esta fase.

El **historial previo** — todas las versiones anteriores y los sprints de otros bloques/proyectos — vive intacto en [`bitacora-roadmap.md`](./bitacora-roadmap.md). Este archivo NO lo reemplaza: de acá en más, todas las entradas de bloque de la fase beta van en este documento.

> **Sección de síntesis al pie:** el cierre de bloque consolidado de FG-0 (resumen de los 4 sprints + la pasada de cierre, estado al cierre y deuda heredada) está al final de este documento, bajo *🏁 CIERRE DE BLOQUE — FG-0*.

---

## Sprint C.0 — Blindar seeds contra prod · 2026-06-17

**Estado real encontrado:**
- Seeds que mutan con `main()` incondicional: `prisma/seed.ts` (L862) y `prisma/seed-agency-os.ts` (L2059). Ambos SIN guard anti-prod previo.
- Passwords hardcodeadas: `seed-agency-os.ts` → `Admin1234!` (franco/valentino SUPER_ADMIN, L342) + `Cliente1234!` (L1992). `seed.ts` → `Admin1234!`/`Cliente1234!`/`ClienteB1234!`/`Setter1234!` (L72-77) + echo en texto plano (L848-851).
- Guards previos a reutilizar: `scripts/seed-matsu.ts` (host equality), `scripts/demos-seed-review-queue.ts` (includes host dev), `scripts/_b14-2-seed-bench-prod.ts` (dirección prod). Host dev: `ep-quiet-waterfall-acv0fpll-*`.
- `sync-plans.ts` / `sync-premium-modules.ts`: intencionalmente prod-runnables (`DATABASE_URL=<prod>`), run-if-main → NO reciben guard. `migrate-os-to-unified.ts`: read-only.
- Flag QA del setter (`passwordResetRequired: false`, fix B8A/H8): intacto.
- Mecánica de env: `@prisma/client` carga `.env` completo al importarse (verificado empíricamente); Prisma NO carga `.env.local`. `.env`/`.env.local` gitignored.

**Qué se hizo (A + B, scope cerrado):**
- A) Guard anti-prod compartido en `prisma/seed-guard.ts` (`assertDevSeedTarget`): aborta con mensaje claro si `DATABASE_URL` falta, si `NODE_ENV=production`, o si el host no parece dev/local (dev branch / localhost / 127.0.0.1). Override explícito `ALLOW_PROD_SEED=1`. Llamado como primera línea de `main()` en ambos seeds.
- B) Passwords → env var sin default (`requireSeedPassword`): `SEED_ADMIN_PASSWORD`, `SEED_CLIENT_PASSWORD`, `SEED_CLIENT_B_PASSWORD`, `SEED_SETTER_PASSWORD`. Falla claro si faltan. Echo de credenciales de `seed.ts` ya no imprime literales (referencia el nombre de la var).
- Import con extensión `.ts` (`./seed-guard.ts`) — requerido por el runner `ts-node` de `seed:agency-os` (reparse ESM); permitido por `allowImportingTsExtensions`; compatible con `tsx` y `tsc`.

**Archivos tocados:**
- `prisma/seed-guard.ts` (nuevo)
- `prisma/seed.ts`
- `prisma/seed-agency-os.ts`
- `.env.example` (sección SEEDS documentada)
- `.env` (gitignored, local: valores dev de las 4 vars para que el seed de dev siga corriendo)

**Verificación:**
- ✅ `tsc --noEmit`: `prisma/` type-clean; total de errores sin cambios (10, todos pre-existentes por módulos ausentes `@dnd-kit/*`, `emoji-picker-react` — no relacionados).
- ✅ Guard probado bajo `ts-node` Y `tsx` (sin correr seeds, solo el helper): URL prod → ABORT exit 1; URL dev/localhost → PROCEED exit 0; `ALLOW_PROD_SEED=1` sobre URL prod → PROCEED; `requireSeedPassword` ausente → ABORT exit 1, presente → devuelve valor.
- ✅ Flag QA del setter (`passwordResetRequired: false`) intacto (ahora L157/L165 por el shift del import + guard).
- ✅ Cero passwords hardcodeadas restantes en ambos seeds.
- ⚠️ No se corrió ningún seed (invariante del sprint).

**Notas:**
- `sync-plans.ts` / `sync-premium-modules.ts` quedan SIN guard a propósito (son prod-runnables por diseño). Fuera de scope.
- Si en el futuro se agregan más seeds mutadores, reusar `assertDevSeedTarget` + `requireSeedPassword` de `prisma/seed-guard.ts`.



## Sprint B0.1 — Shell del setter: rail + contenido · 2026-06-18

**Estado real encontrado:**
- `setter/layout.tsx` era un Server Component header-only: `min-h-screen` con una única columna `max-w-6xl` centrada (header `h-16` + `<main>`). Sin región para barra lateral.
- Admin (modelo a espejar) NO usa CSS grid: arma la geometría con `fixed inset-0 z-[80]` + `<aside fixed left-0 w-[240px]>` (drawer por `translate-x` en mobile, `lg:translate-x-0`) + columna de contenido `lg:pl-[240px]` con `<main overflow-y-auto>`. El drawer exige estado de cliente → split server-layout (`admin/layout.tsx`) → client-shell (`AdminLayoutClient.tsx`).
- Stacking del chrome admin: root `z-[80]`, backdrop `z-[100]`, aside `z-[110]`, botón hamburguesa `z-[120]`, botón cerrar `z-[130]`.
- Modales: el `<Modal>` compartido portalea a `<body>` con `zIndex.modal = 10000` (token en `design-tokens.ts`) — por diseño explícito vive por encima de cualquier layout `fixed inset-0 z-[80]`. Compatible sin tocar nada.
- El route group `(protected)` NO tiene layout compartido: cada zona (admin/setter/dashboard) monta su propio shell.
- Vistas internas (`setter/page.tsx`, `leads/[leadId]/page.tsx`, wizard) NO fijan ancho propio: heredan el ancho del contenedor del layout (dependían del `max-w-6xl` viejo).

**Qué se hizo (SOLO contenedor visual, cero lógica):**
- Nuevo `setter/_components/setter-shell.tsx` (Client Component, `'use client'`): espeja la geometría del admin — `fixed inset-0 z-[80]`, rail `<aside>` de 240px con drawer en mobile (mismo patrón `translate-x` + backdrop + botones hamburguesa/cerrar, mismos z-index que admin), columna de contenido `lg:pl-[240px]` con `<main overflow-y-auto>`. Único estado: `mobileOpen` (toggle del drawer). Sin datos, sin sesión, sin queries.
- Rail dejado como **placeholder rotulado** ("Navegación · 0.2") — el contenido de navegación lo monta el sprint 0.2.
- `setter/layout.tsx` sigue siendo Server Component (auth/redirect/`noStore` intactos): ahora arma el topbar (marca + usuario + logout, el `<form action={signOutAction}>` sin tocar) y lo pasa como prop `topbar` al shell. El logout queda server-renderizado (no migra a cliente).
- **Conflicto `max-w-6xl` resuelto:** el rail toma los 240px de la izquierda; la columna de contenido (topbar + `<main>`) se mantiene centrada como columna de lectura con `mx-auto w-full max-w-6xl`, preservando el ancho de las vistas internas. El scroll ahora vive dentro de `<main>` (topbar/rail fijos), igual que admin.

**Archivos tocados:**
- `src/app/(protected)/setter/_components/setter-shell.tsx` (nuevo)
- `src/app/(protected)/setter/layout.tsx` (header → prop `topbar` del shell; cero cambios de auth/lógica)

**Verificación (quality-gate ECC):**
- ✅ `eslint` en los 2 archivos → limpio, cero warnings.
- ✅ Formato: el proyecto NO usa Prettier (no es dependencia ni hay config); el formateador canónico es ESLint (pasa). El `npx prettier` transitorio marca comillas dobles + punto y coma — el estilo OPUESTO al del repo (comillas simples, sin `;`), que los archivos sí respetan espejando los de admin. No se aplicó `--write` (corrompería el estilo del repo).
- ✅ `tsc --noEmit` → mis 2 archivos type-clean, cero `any`. Total de errores sin cambios: 10, TODOS pre-existentes y ajenos (módulos ausentes `@dnd-kit/core`, `@dnd-kit/utilities`, `emoji-picker-react` en admin/chatbot — no toqué ninguno). Mismos 10 que registró el sprint C.0.

**Verificación humana declarada (Franco, perceptual — no la doy por buena yo):**
- `/setter` carga con el rail (placeholder) a la izquierda + contenido sin descentrar (home y detalle de lead renderizan igual que antes).
- En mobile colapsa a drawer: hamburguesa arriba-izquierda abre el rail, backdrop + botón cerrar lo cierran.
- Los modales existentes (ej. "Me trabé — avisar a Franco") aparecen por encima del chrome nuevo.
- `/admin` sigue intacto (no se tocó ninguno de sus archivos).

**Pendientes:**
- Sprint 0.2: montar la navegación del setter dentro del rail placeholder (espejar `admin-sidebar.tsx`, navegación por `triggerTransition()` según decisión cerrada).

---

## Sprint B0.2 — Navegación del setter: rail con destinos · 2026-06-18

**Estado real encontrado (descubrimiento):**
- Patrón a espejar (`admin/_components/admin-sidebar.tsx`): `NAV_SECTIONS` (array de secciones con items `{href,label,icon}`), activo por `usePathname` (exacto para el índice `/admin`, `startsWith` para el resto), pill cyan `motion.div layoutId="sidebar-active-pill"` (spring `380/38/0.9`), íconos lucide `strokeWidth={1.5}`. Admin navega con `<Link>`.
- **Destinos REALES de la zona setter (rutas que existen, no se inventó ninguna):** solo hay UN hub de nivel superior con `page.tsx` → `/setter` (la cartera). La otra ruta es la dinámica `/setter/leads/[leadId]` (detalle de lead) — NO es destino de barra: se llega clickeando una card y cuelga del mismo hub. No existen `/setter/agenda`, `/setter/settings`, etc. (verificado por `find` sobre el árbol setter).
- `TransitionProvider` está montado en el root `app/layout.tsx`, envolviendo todo el árbol → `useTransitionContext()`/`triggerTransition()` están disponibles dentro de `/setter`. Para navegación de ruta (`target.startsWith('/')`), `triggerTransition` no usa `lenis` y guardea misma-ruta (`if (pathname === target) return`).
- El drawer mobile ya vive en `SetterShell` (estado `mobileOpen`, B0.1). El rail era un placeholder rotulado.

**Qué se hizo (SOLO la barra de navegación; cero StatCards/numeración → eso es 0.3):**
- Nuevo `setter/_components/setter-nav.tsx` (Client Component): espeja el *mecanismo* del admin pero adaptado a la regla cerrada y al contenido real:
  - **Navegación SOLO por `triggerTransition()`** — los destinos son `<button type="button">` que llaman `handleNavigate(href)` → `triggerTransition(href)` + `onNavigate?.()`. **NO hay `<Link>` ni `router.push` ni `useRouter`** (verificado por grep, abajo).
  - Activo por `usePathname` + `startsWith`: `pathname === href || pathname.startsWith(href + "/")`. Con un único hub raíz, la Cartera queda activa en todo el subárbol `/setter` (incluido el detalle de lead, que es su drill-down) → pill siempre visible en la zona.
  - Pill cyan `motion.div` con `layoutId="setter-sidebar-active-pill"` (**namespaced**, NO el `sidebar-active-pill` de admin/dashboard) para evitar cualquier bleed de layout-animation compartido entre el overlay del setter y un árbol admin/dashboard previo durante la transición. Mismo spring `380/38/0.9`, mismas clases visuales que admin. `prefers-reduced-motion` respetado (`useReducedMotion`).
  - `aria-current="page"` en el activo. `NAV_ITEMS` es un array (un solo destino real hoy: `{ /setter, "Cartera", LayoutDashboard }`) para que 0.3+ agregue destinos sin reescribir la barra. **No se listan rutas inexistentes.**
  - Grouping adaptado al contenido: lista plana bajo un único label "Trabajo" (espejar las *secciones* del admin con un solo item daría un header huérfano). Se mirroreó el mecanismo, no la cantidad de secciones.
- `setter-shell.tsx`: el placeholder del rail se reemplazó por `<SetterNav onNavigate={() => setMobileOpen(false)} />` (cierra el drawer al navegar). El shell sigue siendo dueño solo de la geometría y del estado del drawer; doc-comment de cabecera actualizado.

**Archivos tocados:**
- `src/app/(protected)/setter/_components/setter-nav.tsx` (nuevo)
- `src/app/(protected)/setter/_components/setter-shell.tsx` (placeholder → `<SetterNav>` + comentarios)

**Verificación (quality-gate ECC):**
- ✅ `eslint` en los 2 archivos → exit 0, cero warnings.
- ✅ `tsc --noEmit` → cero `any`, mis archivos type-clean. **Total de errores TS del proyecto ahora: 0** (los 10 pre-existentes por módulos ausentes `@dnd-kit/*` se resolvieron al sincronizar `node_modules` con `npm install` — estaban declarados en `package.json` pero sin instalar; no se agregó ninguna dependencia nueva).
- ✅ `npm run build` → **verde** (`/setter` y `/setter/leads/[leadId]` compilan). El build había fallado por el `node_modules` desincronizado (admin, ajeno al sprint); `npm install` lo dejó verde.
- ✅ **Grep de la regla cerrada:** `grep -nE "next/link|<Link|router\.push|useRouter"` sobre `setter-nav.tsx` + `setter-shell.tsx` → **0 matches**. La barra navega exclusivamente por `triggerTransition`.

**Aislamiento por ownership (punto explícito — NO se da por obvio):**
- La barra de navegación **no consulta datos ni recibe `leadId`**: solo renderiza hrefs estáticos (`/setter`) y llama `triggerTransition(href)`. No hace `prisma`, no lista leads, no resuelve un lead puntual. **Por eso no aplica un test de aislamiento sobre la barra** — no hay superficie de datos que aislar acá.
- El gating real de `assignedToId` vive en las **vistas destino**, no en la barra, y ya está cerrado desde B1/B3 (sin tocar en este sprint):
  - LISTA — `/setter` (`page.tsx`) → `listOwnedLeads(userId)` filtra `where: { assignedToId: userId }` (`src/lib/leados/ownership.ts`). Un setter solo ve su cartera.
  - PUNTUAL — `/setter/leads/[leadId]` (`page.tsx:48-54`) → `requireSetter()` + `getOwnedLead(leadId, userId)` (`findFirst({ where: { id, assignedToId: userId } })`); si es `null` (ajeno o inexistente) → `notFound()` 404 sin leakear existencia (anti-IDOR).
- **Conclusión:** 0.2 no abre ninguna superficie nueva que pueda exponer leads ajenos — la barra es enrutado puro. Cualquier test de invariante de aislamiento corresponde a las vistas destino / a la capa `ownership.ts`, no a la navegación. (Infra de test del repo: solo Playwright e2e en `tests/e2e`; no hay runner unitario. Un test de aislamiento DB-bound de `ownership.ts` exige sembrar 2 setters con leads cruzados — fuera del scope de 0.2, que es la barra.)

**Verificación en runtime (hecha por mí — dev-QA, no a ciegas):**
- dev-QA (`next dev`, port 3002, `QA_ALLOW_LOCALHOST=1`) + `POST /api/qa/login {persona:'setter'}` (rol SETTER, `setter-qa@develop.test`). `/setter` probe con credenciales → 200, sin redirect.
- Desktop (1600px): rail muestra label "Trabajo" + item "Cartera" con pill cyan activa (`aria-current="page"`, borde inset cyan + texto/tint cyan). Topbar (marca LeadOS + "QA Setter" + logout) y home cartera intactos. **Cero errores de consola.**
- Mobile (480px): drawer cerrado por defecto (rail off-canvas a `left:-240`, hamburguesa visible). Click en hamburguesa → rail entra (`left:0`) + backdrop + botón cerrar. Click en "Cartera" (misma ruta) → drawer cierra (`onNavigate` dispara aunque `triggerTransition` sea no-op en misma ruta) y backdrop desaparece.

**Verificación humana declarada (Franco, perceptual):**
- Que el destino "Cartera" aparezca en el rail y se resalte (pill cyan) estando en `/setter` y en un detalle de lead.
- Que en mobile la hamburguesa abra el rail y backdrop/cerrar/navegar lo cierren.
- Caveat conocido (NO scope 0.2): el click-nav cliente-side por `triggerTransition` depende del comportamiento pre-existente de `TransitionContext` (hydration mismatch reportado en CC.2/CC.5 que afecta dev; prod funciona). Con un único destino no hay cross-route desde la barra para ejercitarlo; cuando 0.3+ agregue destinos, ahí se valida el salto entre rutas.

**Pendientes:**
- Sprint 0.3: StatCards + numeración del setter (fuera de scope de 0.2 por decisión).
- Cuando existan ≥2 destinos: validar en runtime el salto entre rutas por `triggerTransition` (y revisar el caveat de hydration de `TransitionContext` si el click-nav se siente trabado en dev).

---

## ✅ B0.3 — Reconciliación visual con la nav nueva: scoreboard + numeración única + hint   ·   2026-06-18

**Estado real encontrado (descubrimiento, los 3 elementos + su relación con 0.2):**
- **Stepper (`dossier-stepper.tsx`) — ya es la verdad canónica.** 5 etapas `Ficha · Evaluación · Brief · Construcción · Revisión` mapeadas 1:1 a `DossierStage` (sin hueco, `pasoActual` fiel al stage). **Outreach y agenda NO están en el stepper** — ya estaban modelados como acciones dentro de su etapa, no como pasos sueltos. → No requirió edición: es el ancla a la que los otros dos elementos se reconcilian.
- **StatCards (`page.tsx`) — `<div>` no clickeables pero leídos como tabs.** `StatCard` (compartido) ya renderiza un `<div>` estático sin `onClick`/hover/cursor — el problema era 100% perceptual: una tira de 5 tiles que espeja los títulos de las secciones de abajo se lee como barra de tabs. **No existe ruta por-cola** (`setter-nav` de 0.2 cierra "NO se inventan rutas"; solo existe `/setter`), así que `triggerTransition()` no aplica → la opción honesta es **scoreboard claramente no-clickeable**, no nav falsa.
- **OnboardingHint — numeración paralela que contradecía al stepper.** 4 cards `1·2·3·4` con un paso 4 "Lo que sigue" placeholder ("…llegan en los próximos pasos del panel") que quedó stale: Construcción y Revisión YA existen como etapas 4 y 5 del stepper. Ese 4-vs-5 + el placeholder era **el hueco dentro del scope**.

**Qué se hizo (presentación pura — cero gates/lógica de dossier; tipado estricto):**
1. **`page.tsx` — scoreboard declarado de solo lectura.** Envolví la grilla de 5 StatCards en `<section aria-label="Resumen de tu cartera, de solo lectura">` con eyebrow **"De un vistazo"**. Sin tocar `StatCard` (compartido). No se agregó ninguna afordancia clickeable: la cartera se trabaja en las secciones de abajo y cada lead se abre clickeando su card, no estas tarjetas.
2. **`onboarding-hint.tsx` — de-numerado, deja de duplicar.** `PASOS` (4 cards `1·2·3·4` + placeholder) → `ORIENTACION` (3 cards SIN numeración): "Trabajá tu cartera de arriba para abajo" / "Abrí un lead y seguí el panel" / "El estado del lead manda". Explica *cómo moverse* (defiriendo al panel/stepper como única fuente numerada y al scoreboard como solo-lectura) en vez de re-enumerar el flujo. H2 "Tu laburo en LeadOS, en cuatro pasos" → **"Cómo moverte en LeadOS"** (el viejo H2 afirmaba un conteo competidor). Grid `lg:grid-cols-4`→`lg:grid-cols-3`. Sigue siendo first-run descartable (localStorage intacto).
3. **`dossier-stepper.tsx` — sin cambios.** Es el canónico; los otros dos defieren a él.

**Archivos tocados:**
- `src/app/(protected)/setter/page.tsx` (scoreboard envuelto + eyebrow)
- `src/app/(protected)/setter/_components/onboarding-hint.tsx` (`PASOS`→`ORIENTACION`, H2, grid)
- (`dossier-stepper.tsx` revisado, NO editado — canónico)

**Verificación (quality-gate ECC):**
- ✅ `npm run build` → **verde** (`/setter` y `/setter/leads/[leadId]` compilan).
- ✅ `eslint` en los 2 archivos editados → **0 findings nuevos**. (El repo NO usa Prettier — sin dep ni config; el estilo lo enforcea ESLint 9. Un `npx prettier --check` inicial fue ruido de config default, descartado.)
- ⚠️ 2 errores ESLint **pre-existentes** en líneas que NO toqué (verificado: no aparecen como `+` en mi diff) → fuera de scope, no tocados:
  - `page.tsx:34` `react-hooks/purity` — `Date.now()` en el bloque de carga de datos.
  - `onboarding-hint.tsx:39` `react-hooks/set-state-in-effect` — el `setVisible` del gate first-run de localStorage (patrón original).

**Verificación en runtime (hecha por mí — dev-QA, no a ciegas):**
- dev-QA (`next-dev-qa`, port 3002, `QA_ALLOW_LOCALHOST=1`) + `POST /api/qa/login {persona:'setter'}` → 200, rol SETTER. `/setter` renderiza (`h1 "Tu cartera"`), persona sembrada con leads (3/1/7/0/1) → el scoreboard se muestra.
- **Scoreboard no-clickeable (probe DOM):** dentro de `section[aria-label^="Resumen"]` → `a,button,[role=button],[onclick]` = **0**; elementos con `cursor:pointer` = **0**. Eyebrow "De un vistazo" presente, 5 cards.
- **Numeración única (probe DOM):** `/(1|2|3|4)\s*·/` sobre `body.innerText` = **false** (cero numeración `N·` en el home). El stepper queda como única fuente numerada (vive en el detalle de lead).
- **Hint:** H2 = "Cómo moverte en LeadOS", 3 cards de orientación sin número.
- **Responsive:** mobile 390px → scoreboard a 2 columnas, `scrollWidth == innerWidth` (sin overflow horizontal).
- Screenshots desktop (≈1600) y mobile (390) capturados: nav nueva (Cartera activa) + hint de-numerado + eyebrow "De un vistazo" + scoreboard + worklist, coherentes.

**Verificación humana declarada (Franco, perceptual — es su sign-off por diseño del task):**
- Ninguna tarjeta clickeable-muerta: el scoreboard se lee como marcador de solo lectura, no como tabs.
- Una sola numeración sin hueco: el panel (stepper de 5 etapas) manda; el home no compite con "Paso N".
- El hint orienta sin duplicar la nav ni re-enumerar el flujo.

**Hallazgo FUERA DE SCOPE (reportado, NO implementado — son 9 archivos ajenos a los 3 del task):**
- Los **headers `Paso N` de los step-components** del detalle de lead siguen una numeración de **metodología de 10 pasos** que contradice al stepper canónico de 5 etapas: `ficha(1) · evaluacion(2) · brief(3) · construccion(4) · draft(5) · self-check(6) · opener(7) · seguimiento(9) · agenda(10)` → **hueco en "Paso 8"** y, en el orden de render del wizard, los números salen desordenados (1,2,7,9,10,3,4,5,6). Outreach (opener/seguimiento) y agenda aparecen ahí como **"Pasos" sueltos** — exactamente lo que el stepper ya evita. Reconciliarlos (de-numerar o realinear a las 5 etapas) toca `opener-step.tsx`, `seguimiento-step.tsx`, `agenda-step.tsx`, `brief-step.tsx`, `construccion-step.tsx`, `draft-step.tsx`, `self-check-step.tsx`, `ficha-step.tsx`, `evaluacion-step.tsx` + las notas de `lead-wizard.tsx`. **Sprint aparte** (cambia copy visible en todo el wizard; fuera de los 3 archivos de B0.3).

**Pendientes:**
- Sprint aparte: reconciliar los headers `Paso N` de los step-components con el stepper de 5 etapas (de-numerar outreach/agenda como acciones-dentro-de-etapa; cerrar el hueco del "Paso 8"). → **Cerrado en B0.4 (abajo).**
- Limpieza opcional: los 2 errores ESLint pre-existentes (`react-hooks/purity` en `page.tsx:34`, `set-state-in-effect` en `onboarding-hint.tsx:39`) — ajenos a B0.3.

---

## ✅ B0.4 — Headers `Paso N` de los step-components reconciliados con el stepper de 5 etapas   ·   2026-06-18

Follow-up declarado en B0.3. **Solo presentación**: copy visible de headers + cross-refs. NO se tocaron gates de transición, server-actions, schemas ni la lógica del dossier. Tipado estricto, cero `any`.

**Problema (heredado de la metodología de 10 pasos):** los headers de los step-components numeraban `ficha(1) · evaluacion(2) · brief(3) · construccion(4) · draft(5) · self-check(6) · opener(7) · seguimiento(9) · agenda(10)` → **hueco en "Paso 8"**, y en el orden de render del wizard (`lead-wizard.tsx`) salían desordenados (1,2,7,9,10,3,4,5,6). Outreach (opener/seguimiento) y agenda figuraban como "Pasos" sueltos — justo lo que el stepper de 5 etapas (`dossier-stepper.tsx`, canónico) ya excluye.

**Decisión (de-numerar, no realinear):** el stepper de 5 etapas (`Ficha · Evaluación · Brief · Construcción · Revisión`, 1:1 a `DossierStage`) es la verdad. Se conservó la numeración `Paso 1–4` SOLO en los cuatro componentes que mapean 1:1 a una etapa del stepper (ficha · evaluacion · brief · construccion). La 5.ª etapa (Revisión) es de Franco — no tiene step-component del setter; se sigue surfaceando vía la nota "Lo que sigue" (`POST_BRIEF_NOTAS`). Las **acciones-dentro-de-etapa** (opener, seguimiento, agenda, draft, self-check) quedaron **sin `Paso N`**, con título de acción limpio. Mismo patrón que B0.3 aplicó al `onboarding-hint`: deferir al stepper como única fuente numerada.

**Cambios (9 archivos del scope declarado + `lead-wizard.tsx`):**
1. **De-numerados (headers → título de acción):** `opener-step.tsx` "Primer contacto (opener)", `seguimiento-step.tsx` "Seguimiento y envío de la demo", `agenda-step.tsx` "Agendar la reunión" / "Reunión agendada", `draft-step.tsx` "Publicar el draft", `self-check-step.tsx` "Self-check". Incluye los JSDoc/comentarios de cada uno.
2. **Cross-refs en copy realineadas** (ya no apuntan a números muertos): "Paso 9"→«Seguimiento», "Paso 7"→"el opener", "Paso 10"→«Agendar la reunión», "Paso 5"→"el draft", "Pasos 3–6"→"brief, construcción y self-check". Tocó copy en opener, seguimiento, agenda, brief y las notas/comentarios de `lead-wizard.tsx` (incl. `POST_BRIEF_NOTAS` y el comentario del bloque de outreach).
3. **Sin cambios:** `ficha-step.tsx` (Paso 1) y `evaluacion-step.tsx` (Paso 2) — ya canónicos; las refs "ficha del Paso 1" / "Paso 3" / "Paso 4" en otros archivos se conservaron (apuntan a etapas reales del stepper).

**Resultado:** la única numeración visible en todo el wizard es `Paso 2 → 3 → 4` (Paso 1 sólo cuando la ficha está editable; con ficha congelada colapsa a summary sin h2). Hueco "Paso 8" eliminado; números ascendentes en pantalla; outreach/agenda/draft/self-check como acciones sin número.

**Verificación (dev-QA :3002 + `POST /api/qa/login {persona:'setter'}`):**
- Probe DOM sobre el detalle de lead `QA-B6 Gimnasio Atlas` (stage APROBADA): `body.innerText` contiene únicamente `["Paso 2","Paso 3","Paso 4"]` como refs numeradas — cero 5/6/7/8/9/10.
- h2 visibles en orden de render (desktop y mobile 390): `Paso 2 — Evaluación · Primer contacto (opener) · Seguimiento y envío de la demo · Agendar la reunión · Paso 3 — Brief · Paso 4 — Construcción · Publicar el draft · Self-check · Lo que sigue`.
- Cross-refs renderizadas en vivo: opener → "…desde «Seguimiento»"; agenda lock → "…respondió (en «Seguimiento»)"; "Lo que sigue" → "…el envío del link vive en «Seguimiento»".
- Screenshots desktop (1600) y mobile (390) capturados; sin errores de consola. (Nota: el wizard se duplica en el DOM por variantes responsive desktop/mobile — una con ancestro `display:none`; pre-existente, ajeno a este sprint.)

**Quality-gate ECC:**
- `tsc --noEmit`: limpio (exit 0).
- `eslint` sobre los 7 archivos editados: limpio salvo **1 error pre-existente** `react-hooks/purity` (`Date.now()` en `seguimiento-step.tsx:198`) — línea NO tocada por este sprint (hunks en 66/98/141/203/276/344); es de la misma familia que los pendientes de B0.3.
- `prisma migrate status`: up to date (61 migraciones). `npm run build`: exit 0, `/setter/leads/[leadId]` compila.

**Verificación humana declarada (Franco, perceptual — sign-off por diseño):**
- En el detalle de lead, los números visibles van 1→2→3→4 sin hueco; outreach/agenda/draft/self-check no muestran "Paso N".
- El copy ya no menciona pasos inexistentes (5/6/7/8/9/10): las referencias apuntan a nombres de acción/etapa.

**Pendiente (heredado, opcional):** los errores ESLint `react-hooks/purity` (`page.tsx:34`, `seguimiento-step.tsx:198`) y `set-state-in-effect` (`onboarding-hint.tsx:39`) — ajenos a la presentación; limpieza aparte.

---

## ✅ FG-0 · cierre — Chrome asentado (z-index tokens) + regresiones B9 corregidas   ·   2026-06-18

Pasada final del bloque FG-0. **Solo presentación**: z-index, sombras, superficies, jerarquía y un cableado de tono. NO se tocó lógica, gates, server-actions, schemas ni datos. Tipado estricto, cero `any`. Dos tandas.

### Tanda 1 — z-index del chrome nuevo a tokens

**Problema:** el shell/drawer del setter (B0.1) usaba z-index arbitrarios hardcodeados (`z-[80]`, `z-[100..130]`) — números mágicos sin trazabilidad de que son una escala compartida con el chrome admin (`AdminLayoutClient`).

**Qué se hizo:**
- `design-tokens.ts` — nuevo tier de chrome en la escala `zIndex`, ENTRE `overlay (40)` y `modal (10000)`, espejando los números del admin: `appShell: 80`, `appDrawerBackdrop: 100`, `appDrawer: 110`, `appNavTrigger: 120`, `appDrawerClose: 130`. Todos por DEBAJO de `modal: 10000` → cualquier diálogo portaleado a `<body>` tapa el shell/drawer (regla absoluta del task respetada).
- `setter-shell.tsx` — los `z-[80..130]` arbitrarios pasan a consumirse vía `style={{ zIndex: zIndex.* }}` desde los tokens. Motivo del inline-style: Tailwind v4 no emite utilidades `z-*` desde un objeto TS (no está en el theme), así que el token se aplica por estilo, no por clase.

### Tanda 2 — regresiones visuales B9

Disciplina de color B9 conservada (decisión cerrada): el "plano" se ataca con **ELEVACIÓN** (sombra / contraste de superficie) y **jerarquía** (tamaño), NUNCA re-saturando.

1. **Banner de rechazo del wizard** (`lead-wizard.tsx`) — recupera la prominencia que perdió en e26eec9 (era una `Card padding="lg"` con h2 `text-base`; quedó como `Callout` con título colapsado a `text-sm`). Sigue siendo el `Callout danger` de B9 (no se revierte el primitivo), pero el título vuelve a `text-base` y el banner SE ELEVA con sombra (`shadow-[0_16px_40px_...]`) + más aire (`p-5`). Sin re-saturar el rojo.
2. **Cyan-sobre-cyan del lane prioritario** (`home-sections.tsx`) — el carril `destacado` "Para trabajar ahora" estaba teñido de cyan (`bg-cyan-400/[0.03]` + `ring-cyan-400/15`), lavando las cards accionables (también cyan) que viven dentro. Ahora el lane se separa por **elevación**: superficie neutra (`bg-white/[0.02]` + `ring-white/[0.08]` + sombra). El cyan queda libre para las cards → las accionables vuelven a saltar.
3. **Elevación del paso activo** (`dossier-stepper.tsx`) — el dot `actual` se eleva sobre el rail con sombra + un `ring` del color del fondo (`ring-[var(--color-void)]`) que abre un hueco contra las líneas conectoras (contraste de superficie). Sin sumar color al cyan que ya tenía.
4. **Elevación del DecisionBar** (`decision-bar.tsx`) — el panel primario "Tu veredicto" estaba a la misma altura visual que los paneles informativos hermanos (todos `bg-white/5`). Ahora se eleva: superficie más alta (`bg-white/[0.07]`), borde apenas más fuerte (`/15`) y sombra grande. Profundidad por elevación, sin color.
5. **STAGE_TONE cableado en el admin** (`admin/leados/[leadId]/page.tsx`) — la pill de stage del header del detalle estaba hardcodeada en **cyan**, violando la disciplina B9 (el stage es INFORMATIVO, nunca cyan — reservado a lo accionable). Ahora se cablea a `stageTone(dossier.stage)` vía un map local `STAGE_PILL` (mantiene el lenguaje propio del admin: pills `rounded-full`, borde /20 sobre fondo /10 — NO migra al `<Badge>` del dashboard). Reasigna hue por semántica (EN_REVISION→violet, APROBADA→emerald, RECHAZADA→rose, …); no agrega color, saca un cyan mal usado.

**Archivos tocados (7):**
- `src/lib/design-tokens.ts` (tier `app*` en `zIndex`)
- `src/app/(protected)/setter/_components/setter-shell.tsx` (`z-[..]` → `style={{ zIndex }}`)
- `src/app/(protected)/setter/leads/[leadId]/_components/lead-wizard.tsx` (banner: jerarquía + elevación)
- `src/app/(protected)/setter/_components/home-sections.tsx` (lane: neutro + elevación)
- `src/app/(protected)/setter/leads/[leadId]/_components/dossier-stepper.tsx` (paso activo: elevación)
- `src/app/(protected)/admin/leados/[leadId]/page.tsx` (pill stage → STAGE_TONE + map local)
- `src/app/(protected)/admin/leados/[leadId]/_components/decision-bar.tsx` (panel primario: elevación)

**Quality-gate ECC:**
- ✅ `tsc --noEmit` → exit 0 (cero `any`; total errores TS del proyecto: 0).
- ✅ `eslint` sobre los 7 archivos → exit 0, **cero findings**.
- ✅ `npm run build` → **verde** (`/setter`, `/setter/leads/[leadId]` y `/admin/leados/[leadId]` compilan).
- ✅ `prisma migrate status` → up to date (61 migraciones; sprint no toca schema).
- Formatter: el repo **no usa Prettier** (sin dep ni config) — ESLint 9 es la autoridad de estilo. Un `npx prettier --check` inicial marcó los 7 archivos por su config default (semicolons vs estilo no-semicolon del repo): **ruido descartado**, igual que en B0.3/B0.4. NO se corrió `prettier --write` (rompería la convención + ESLint).

**Reglas absolutas del task (verificadas):**
- Nada del chrome nuevo por encima de `modal: 10000` → el máximo es `appDrawerClose: 130`. ✅
- Desaturación B9 conservada: el plano se atacó con elevación + jerarquía; cero re-saturación. El cableado de STAGE_TONE reasigna hue por semántica (saca cyan), no suma color. ✅
- Solo presentación; tipado estricto. ✅

**Verificación humana declarada (Franco, perceptual — sign-off por diseño del task):**
- Abrir cada modal del setter → aparece SOBRE el sidebar/drawer (chrome ≤130 < modal 10000).
- El banner de rechazo recuperó peso en el momento de máximo golpe.
- Sin cyan-sobre-cyan en el lane prioritario; las cards accionables vuelven a saltar.
- El paso activo y el DecisionBar se sienten elevados sin más color.

---

## 🏁 CIERRE DE BLOQUE — FG-0 (chrome del setter + reconciliación visual)   ·   2026-06-18

Resumen para el postmortem del próximo bloque. FG-0 dejó la zona `/setter` con chrome propio coherente con el admin y la capa de presentación de LeadOS reconciliada (numeración única + disciplina de color B9 asentada). **Todo el bloque fue presentación**: cero lógica, gates, schemas o datos tocados.

**Los 4 sprints + la pasada de cierre:**
- **B0.1 — Shell visual del setter.** Geometría rail+contenido espejando el admin (`fixed inset-0`, rail 240px, contenido scrolleable, drawer mobile). Dueño solo de geometría y estado del drawer.
- **B0.2 — Barra de navegación (`setter-nav`).** Destinos REALES (hoy un único hub `/setter`), navegación SOLO por `triggerTransition()` (sin `<Link>`/`router.push`), pill activa `layoutId` namespaced, `aria-current`. No se inventan rutas.
- **B0.3 — Reconciliación visual.** Scoreboard declarado de solo lectura (mató la lectura "tabs falsas"), numeración única (el stepper de 5 etapas manda; el home no compite con "Paso N"), hint de-numerado que orienta sin duplicar.
- **B0.4 — Headers `Paso N` reconciliados.** De-numeró outreach/agenda/draft/self-check como acciones-dentro-de-etapa; conservó `Paso 1–4` solo en los que mapean 1:1 al stepper; eliminó el hueco "Paso 8". Única numeración visible: 1→2→3→4.
- **FG-0 · cierre (este).** Chrome asentado (z-index del shell/drawer a tokens compartidos con el admin, bajo `modal`) + 5 regresiones visuales B9 corregidas por elevación/jerarquía (banner de rechazo, cyan-sobre-cyan del lane, paso activo, DecisionBar) + STAGE_TONE cableado en la pill del admin.

**Estado al cierre:** `tsc` 0 errores · `eslint` limpio en lo tocado · `build` verde · `migrate status` up to date (61). Chrome del setter ≤ z-index 130, siempre bajo `modal: 10000`.

**Deuda heredada que cruza el límite del bloque (NO de FG-0, limpieza aparte):**
- Errores ESLint pre-existentes `react-hooks/purity` (`setter/page.tsx:34` `Date.now()` en carga de datos; `seguimiento-step.tsx:198`) y `react-hooks/set-state-in-effect` (`onboarding-hint.tsx:39`, gate first-run de localStorage). Ninguno es presentación; ninguno introducido por FG-0.
- Caveat de `TransitionContext` (hydration mismatch en dev, prod OK) para el click-nav cuando existan ≥2 destinos de barra (hoy hay uno solo).

**Para el próximo bloque (FG-1):** la base de chrome + presentación queda estable y verificada en static + build. El postmortem entra con disciplina de color B9 asentada y numeración única — cualquier superficie nueva del setter debe deferir al stepper canónico (5 etapas) y a la regla "cyan = accionable, el resto informativo por semántica".

---

## ✅ FG · Orientación de herramientas externas — qué es / qué esperar / dónde se abre   ·   2026-06-19

Capa de orientación que SUMA al flujo del setter sin reescribirlo: explica las herramientas externas que usa (qué son, qué esperar) y le da un lanzador para abrirlas. **Solo contenido + presentación**: cero lógica, datos, gates, schemas o queries. Tipado estricto, cero `any`. NO toca `/admin` ni el aislamiento por `assignedToId`. **Fuera de scope a propósito:** "cómo dirigir la IA" / ejemplos de prompt (eso es otra capa, FG-2).

**Estado real encontrado (descubrimiento):**
- El flujo usaba **5 herramientas externas** sin explicarlas ni dar forma de abrirlas:
  - **Evaluador** (Paso 2 · `evaluacion-step.tsx`) — el `CopyBlock` arma el bloque pegable; había una caja "Qué mira el Evaluador" (criterios), pero nada de qué ES la herramienta ni dónde se abre.
  - **Gem de diseño** (Paso 3 · `brief-step.tsx`) — nombrado en prosa + `CopyBlock` "Bloque para el Gem de diseño"; sin explicación ni acceso.
  - **Claude Design** (Paso 4 · `construccion-step.tsx`) — nombrado en prosa "(herramienta externa)" + `CopyBlock`; sin acceso.
  - **Netlify Drop** (Publicar el draft · `draft-step.tsx`) — **única URL del flujo, y aparecía como texto plano no clickeable** (`'Abrí app.netlify.com/drop…'` dentro de `INSTRUCCIONES`).
  - **Gem de outreach** (Primer contacto · `opener-step.tsx` + objeciones en Seguimiento · `seguimiento-step.tsx`) — `CopyBlock`s de input; sin explicación ni acceso.
- **Patrón de contenido editable ya establecido** (a clonar): `flow.ts` ya aloja `SHELL_CONSTRUCCION` y `CANAL_INSTAGRAM` documentados como "la ÚNICA copia del contenido… la UI lo consume tal cual, Franco edita SOLO la constante, sin tocar componentes". Misma filosofía que `CANAL_INSTAGRAM`/Cal.com como config.
- **Ayuda embebida de calidad a clonar:** la ficha del Paso 1 (`ficha-step.tsx`) — jerarquía clara, hints concretos, lenguaje sin jerga, `<details>` con marker oculto para el modo congelado.
- **FG-1.0 (fuente única de contenido) NO corrió** (el cierre de FG-0 lo deja como "próximo bloque"): por eso el contenido queda **localizado** en un módulo propio, con nota de migración a 1.0.
- Rail del setter (`setter-nav.tsx`, B0.2) ya invita a sumar secciones sin reescribir la barra ("array para que sprints posteriores agreguen destinos").

**Qué se hizo:**
1. **Registro editable `src/lib/leados/herramientas.ts` (nuevo) — fuente única de contenido + URLs.** Mismo patrón "única copia editable" de `SHELL_CONSTRUCCION`/`CANAL_INSTAGRAM`: tipos `HerramientaId`/`Herramienta` + `HERRAMIENTAS` (record) + `HERRAMIENTAS_ORDEN`. Cada herramienta: `nombre`, `queEs`, `queLeDas`, `queTeDevuelve`, `dondeSeUsa`, `url`. Franco corrige una descripción o carga un link editando SOLO este archivo. Sin Prisma, sin `'use server'` — importable por client y server.
2. **`ToolGuide` + `HerramientaLauncher` (`_components/tool-guide.tsx`, nuevo) — explicación inline colapsable + lanzador.** Header siempre visible (nombre + botón para abrir) y un `<details>` "Qué es y cómo se usa" (concisa, colapsable, no agrega ruido). `<details>` nativo → SSR-safe, cero JS/hydration (lección recurrente del repo). Clona la calidad de la ficha (jerarquía, lenguaje concreto). Estilo NEUTRAL por disciplina B9 (cyan reservado a lo accionable del flujo; espeja los chips de «Materiales reales» de Construcción). `url: null` → chip ámbar "Link pendiente" + nota "pedíselo a Franco" (nunca un link roto).
3. **Lanzadores inline por herramienta, en su paso:**
   - `evaluacion-step.tsx` → `<ToolGuide id="evaluador">` (antes de la caja "Qué mira el Evaluador", que se conserva).
   - `brief-step.tsx` → `<ToolGuide id="gemDiseno">` (antes del `CopyBlock` de input).
   - `construccion-step.tsx` → `<ToolGuide id="claudeDesign">` en la vista BRIEF (listo para arrancar) y en la vista CONSTRUCCION (donde se construye).
   - `opener-step.tsx` → `<ToolGuide id="gemOutreach">` (antes del `CopyBlock` del Gem).
   - `seguimiento-step.tsx` → `<HerramientaLauncher id="gemOutreach">` dentro del `<details>` de objeciones (uso secundario: solo el acceso, la explicación vive en el opener).
4. **Netlify Drop clickeable (`draft-step.tsx`).** `<ToolGuide id="netlifyDrop">` con lanzador REAL ("Abrir Netlify Drop ↗" → `https://app.netlify.com/drop`). Se reescribió el paso 3 de `INSTRUCCIONES` para apuntar al botón ("Abrí Netlify Drop (el botón de acá arriba)…") — se eliminó la URL en texto plano no clickeable.
5. **Panel persistente «Tus herramientas» (`_components/tools-rail.tsx`, nuevo) en el rail.** Accesos directos a las 5 herramientas, presentes en toda la zona `/setter` (para que un setter sin bookmarks pueda avanzar). Montado en `setter-nav.tsx` bajo la sección "Trabajo" (border-top + label espejando el eyebrow existente). Son **links externos (pestaña nueva), NO rutas** → NO usan `triggerTransition` (correcto) y NO violan "no se inventan rutas". `url: null` → item "pendiente" (ámbar tenue), no link roto. `<nav aria-label>` para a11y.

**URLs — reales vs pendientes (clave para Franco):**
- ✅ **Netlify Drop:** `https://app.netlify.com/drop` (pública, estable, ya estaba referida en código).
- ⏳ **TODO: URL** (4 herramientas — son Gems/accesos privados, NO deducibles del código; NO se inventó ninguna, por instrucción): **Evaluador, Gem de diseño, Claude Design, Gem de outreach.** Cargar el link real en `herramientas.ts` (reemplazar el `null` marcado `// TODO: URL`). Apenas se cargan, los lanzadores inline y el panel del rail se encienden solos. Mientras tanto la UI muestra "Link pendiente" / "pendiente" — honesto, no roto.

**Archivos tocados (10):**
- `src/lib/leados/herramientas.ts` (nuevo — registro editable)
- `src/app/(protected)/setter/_components/tool-guide.tsx` (nuevo — `ToolGuide` + `HerramientaLauncher`)
- `src/app/(protected)/setter/_components/tools-rail.tsx` (nuevo — panel del rail)
- `src/app/(protected)/setter/_components/setter-nav.tsx` (monta `<ToolsRail>` bajo "Trabajo")
- `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-step.tsx` (`ToolGuide` evaluador)
- `src/app/(protected)/setter/leads/[leadId]/_components/brief-step.tsx` (`ToolGuide` gemDiseno)
- `src/app/(protected)/setter/leads/[leadId]/_components/construccion-step.tsx` (`ToolGuide` claudeDesign ×2 vistas)
- `src/app/(protected)/setter/leads/[leadId]/_components/opener-step.tsx` (`ToolGuide` gemOutreach)
- `src/app/(protected)/setter/leads/[leadId]/_components/seguimiento-step.tsx` (`HerramientaLauncher` gemOutreach en objeciones)
- `src/app/(protected)/setter/leads/[leadId]/_components/draft-step.tsx` (`ToolGuide` netlifyDrop + reescritura del paso 3)

**Verificación (quality-gate ECC):**
- ✅ `tsc --noEmit` → exit 0, **cero `any`**, **0 errores TS** en el proyecto.
- ✅ `eslint` sobre los 10 archivos → mis 3 archivos nuevos + todas las inserciones: **0 findings**. Quedan **2 errores PRE-EXISTENTES en líneas que NO toqué** (verificado por `git diff`: no aparecen como `+` en mis hunks) — la misma deuda heredada ya registrada en B0.4/cierre FG-0:
  - `construccion-step.tsx:53` `react-hooks/set-state-in-effect` (`setEspera` en el efecto de `UrgenciaBanner`).
  - `seguimiento-step.tsx:199` `react-hooks/purity` (`Date.now()` en `minReactivacion`; era L198, +1 por mi import).
- ✅ `npm run build` → **verde** (`/setter` y `/setter/leads/[leadId]` compilan).
- ✅ `prisma migrate status` → up to date (61 migraciones, branch dev `ep-quiet-waterfall`). El sprint no toca schema.
- Formatter: el repo **no usa Prettier** (sin dep ni config) — ESLint 9 es la autoridad de estilo (single-quote, sin `;`). NO se corrió `prettier --write` (rompería la convención). Mismos criterios que B0.x/FG-0.

**Reglas absolutas del task (verificadas):**
- Cero lógica/datos/gates: solo contenido + presentación (capa que suma, no reescribe el flujo). ✅
- Contenido + URLs en módulo editable (`herramientas.ts`), no hardcodeados dispersos; mismo patrón que `CANAL_INSTAGRAM`/Cal.com. ✅
- Sin "cómo dirigir la IA" ni prompts (eso es FG-2). Solo qué es / qué esperar / dónde se abre. ✅
- No se inventó ninguna URL: 1 real (Netlify) + 4 `// TODO: URL` marcadas y anotadas acá. ✅
- Tipado estricto, sin `any`. No se tocó `/admin` ni `assignedToId` (cero queries/ownership). ✅

**Verificación humana declarada (Franco, en pantalla — perceptual, su sign-off por diseño del task):**
- En cada momento de uso (Evaluación · Brief · Construcción · Primer contacto/Seguimiento · Publicar el draft) la ayuda está, es concisa y **colapsable** (`<details>` "Qué es y cómo se usa").
- Cada herramienta muestra un **lanzador**: botón "Abrir …" cuando hay link (hoy solo Netlify Drop) y chip "Link pendiente" en las 4 con `// TODO: URL`.
- La **URL de Netlify Drop es clickeable** (botón "Abrir Netlify Drop ↗" en su paso y en el rail; ya no hay URL en texto plano).
- El panel **«Tus herramientas» del rail** se ve en toda la zona `/setter` (desktop y drawer mobile) sin overflow, con las 4 pendientes marcadas.
- Con Netlify cargada, **un setter sin bookmarks propios puede avanzar**; al cargar las otras 4 URLs en `herramientas.ts`, todo se enciende solo.
- *Nota:* NO corrí visual-QA autenticada de estas pantallas pesadas (auth-gated; el dev-QA da falsos negativos por hidratación en LeadOS, ya documentado). Build + tsc verdes garantizan que compila/renderiza; la confirmación perceptual queda para esta pasada de Franco, según el split de verificación del task.

**Pendientes:**
- **Franco:** cargar las 4 URLs reales (Evaluador, Gem de diseño, Claude Design, Gem de outreach) en `src/lib/leados/herramientas.ts` (reemplazar los `null` marcados `// TODO: URL`).
- Migrar el registro a la **fuente única de contenido (FG-1.0)** cuando exista — hoy queda localizado a propósito.
- Heredados (ajenos): los 2 errores ESLint `react-hooks` pre-existentes (`construccion-step.tsx:53`, `seguimiento-step.tsx:199`).

---

## ✅ FG-0.5 · Índices para la cabina del operador (queries setter-scoped) · 2026-06-19

Migración **puramente aditiva** (solo `CREATE INDEX`) que prepara las queries de la cabina del operador (FG-0.5): "Mi día" (0.5.5) filtra leads por `assignedToId` + `nextFollowUpAt`; el timeline (parte 2) ordena `OsLeadActivity` por `performedById` + `createdAt`. Sin índices, ambas escanean. **Cero cambios de campos, lógica o gates.** Tipado estricto.

**Campos reales encontrados (descubrimiento sobre `schema.prisma`):**
- `OsLead` (L791): asignación = **`assignedToId String?`** (L808, relación `OsLeadAssignee`); próximo follow-up = **`nextFollowUpAt DateTime?`** (L805). Índices previos: `@@index([status])`, `@@index([nextFollowUpAt])`, `@@index([status, nextFollowUpAt])`, `@@index([assignedToId])`.
- `OsLeadActivity` (L824): performer = **`performedById String?`** (L830, relación `OsActivityPerformer`); fecha = **`createdAt DateTime`** (L831). Índice previo: `@@index([leadId, createdAt])`.
- Ninguno de los dos compuestos objetivo existía. El `@@index([assignedToId])` suelto NO es equivalente al compuesto (es solo prefijo izquierdo) → no es duplicado; se agrega el compuesto.

**Índices agregados (2, compuestos):**
- `OsLead` → `@@index([assignedToId, nextFollowUpAt])` — sirve "Mi día" (filtra por dueño + ordena/filtra por vencimiento).
- `OsLeadActivity` → `@@index([performedById, createdAt])` — sirve el timeline (agrupa por performer + ordena por fecha).

**Migración aplicada en dev:** `prisma/migrations/20260619132830_add_operator_cabin_indexes/migration.sql` (nuevo, 2 statements):
```sql
CREATE INDEX "OsLead_assignedToId_nextFollowUpAt_idx" ON "OsLead"("assignedToId", "nextFollowUpAt");
CREATE INDEX "OsLeadActivity_performedById_createdAt_idx" ON "OsLeadActivity"("performedById", "createdAt");
```
- SQL generado por Prisma vía `migrate diff` datamodel→datamodel (schema-antes → schema-después), **aislado del drift** (ver abajo). Solo `CREATE INDEX`, cero `DROP`/`ALTER`.
- Aplicada con **`prisma migrate deploy`** (NO `migrate dev`): deploy no resetea, no corre seed, no exige shadow DB → seguro contra el endpoint **pooled** de Neon y contra la regla "NUNCA reset". Motivo extra para evitar `migrate dev`: `prisma.config.ts` define `seed: 'npx tsx prisma/seed.ts'` y `seed.ts` está modificado → `migrate dev` lo habría corrido y mutado datos dev.

**Archivos tocados (2):**
- `prisma/schema.prisma` (+2 líneas `@@index`, nada más)
- `prisma/migrations/20260619132830_add_operator_cabin_indexes/migration.sql` (nuevo)

**Verificación (quality-gate ECC):**
- ✅ `prisma validate` → "The schema is valid 🚀".
- ✅ `prisma generate` → "Generated Prisma Client (v6.19.3)" (schema consumible; los índices no cambian la superficie del client → cero impacto de tipos).
- ✅ `prisma migrate status` → "Database schema is up to date!" (**62 migraciones**, branch dev `ep-quiet-waterfall`).
- ✅ **Diff post-apply** (`migrate diff --from-schema-datasource → --to-schema-datamodel`): mis 2 índices YA NO aparecen → existen en la DB tal cual el schema; lo único que queda en el diff es el drift pre-existente (abajo), **idéntico** a antes de tocar → mi cambio quedó perfectamente aislado y aditivo.
- N/A `eslint`/`tsc`/`build`: el cambio es Prisma DSL + SQL, no TypeScript; los índices no regeneran tipos ni alteran el client.
- Formatter: NO se corrió `prisma format` (reescribiría líneas fuera de scope); las 2 líneas agregadas espejan exactamente el estilo `@@index` de las de alrededor.

**Reglas absolutas del task (verificadas):**
- Migración SOLO aditiva: el `migration.sql` tiene únicamente 2 `CREATE INDEX`. ✅
- Solo índices: cero cambios de campos, lógica o gates. ✅
- NUNCA `migrate reset`: se usó `migrate deploy` (incapaz de resetear); además el gate de baseline confirmó que no había que resetear. ✅
- Branch dev de Neon. ✅ Tipado estricto. ✅

**⚠️ Hallazgo FUERA DE SCOPE (reportado, NO implementado) — DRIFT pre-existente DB↔schema:**
El gate de baseline (diff live-DB → schema, ANTES de tocar nada) reveló que la **DB dev diverge del schema committeado** en 2 puntos ajenos a los índices:
1. **`chatbot_lead.convertedToOsLeadId`**: la DB dev TIENE esa columna; el schema NO. Casi seguro remanente del merge reciente `lane/chatbots` ("convertir lead", commit `b73c8fc`) — la feature se revirtió en el schema pero la columna quedó en la DB.
2. **enum `AuditActionType`**: la versión de la DB dev difiere de la del schema (Prisma lo quiere reconstruir).

`prisma migrate status` da "up to date" porque solo compara los ARCHIVOS de migración contra `_prisma_migrations`, NO la estructura real de la DB contra el schema — por eso este drift es invisible ahí.

**Implicación (importante para Franco):** el próximo `prisma migrate dev` va a DETECTAR este drift y va a querer **RESETEAR** la DB dev (pérdida de datos) — exactamente la catástrofe que prohíbe la regla del repo. Por eso este sprint NO usó `migrate dev` y generó su migración aislada vía diff datamodel→datamodel. **El drift NO se tocó** (fuera de scope, solo índices). Reconciliarlo (decidir si la columna/enum se dropean o se vuelven a poner en el schema, con su propia migración) es un sprint aparte, a decisión de Franco.

**Verificación humana declarada (Franco):**
- `prisma migrate status` → verde (62 migraciones).
- El SQL generado es puramente aditivo: `cat prisma/migrations/20260619132830_add_operator_cabin_indexes/migration.sql` → solo 2 `CREATE INDEX`.
- (Decisión aparte) cómo reconciliar el drift pre-existente (`convertedToOsLeadId` + `AuditActionType`) para que un futuro `migrate dev` no quiera resetear.

**Pendientes:**
- **Franco / sprint aparte:** reconciliar el drift DB↔schema (`chatbot_lead.convertedToOsLeadId`, enum `AuditActionType`) con una migración aditiva propia, ANTES del próximo `migrate dev`.
- Limpieza opcional (no aplicada — sería no-aditiva): el `@@index([assignedToId])` suelto de `OsLead` quedó como prefijo redundante del nuevo `@@index([assignedToId, nextFollowUpAt])`; un `DROP INDEX` lo limpiaría, pero eso viola "solo aditiva", así que queda fuera de esta regla.

---

## ✅ FG-0.5 · Sender único de Telegram — prep para 0.5.8 (notis al setter) · 2026-06-19

Consolidación previa a la **Parte 2 de FG-0.5** (0.5.8, notificaciones AL setter). El envío a Telegram estaba **triplicado** (3 copias leyendo `process.env` por separado) y había una config admin-editable **muerta** (`AgencySettings.osTelegram*`, nadie la leía). Extender el envío en 0.5.8 sobre 3 copias habría multiplicado el problema → primero **un solo `sendTelegram()` con una fuente de verdad de credenciales**. **NO se cambió CUÁNDO se disparan las notis** (eventos/gates intactos); solo el CÓMO se envían. Tipado estricto, cero `any`.

**Los 3 sitios encontrados (por grep `api.telegram.org` — autoritativo):**
1. **`src/lib/notifications/telegram.ts`** → `notifyTelegramOptional(message)`: env directo (`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`), `parse_mode: Markdown`, devolvía `void`, tragaba el error. Lo consumen 4 archivos del módulo chatbot (`captureLead`, `showWhatsappHandoff`, `upsellAlert`, `detectBotIssues`).
2. **`src/lib/leados/notify.ts`** → helper privado `enviarTelegram(message)`: env directo (`?.trim()`), `parse_mode: HTML`, devolvía `boolean`. Alimenta las 3 notis de LeadOS (caliente B5, escalamiento construcción B4, reunión agendada B7).
3. **`src/app/api/cron/os-follow-up/route.ts`** → `fetch` inline en el `GET`: env directo (`?.trim()`), `parse_mode: HTML`, devolvía 500 si no estaba configurado / si el envío fallaba.

**Config muerta:** `AgencySettings.osTelegramBotToken` / `osTelegramChatId` (schema.prisma:764-765). **Lado de escritura VIVO** — editable en `/admin/settings` vía `updateSettings` (`settings.actions.ts`, con masking) + `settings-console.tsx`. **Lado de lectura MUERTO** — ningún sender la consumía.

**Decisión — fuente de verdad CONFIG-FIRST, fallback a env (par atómico):**
- **Por qué config-first y no env-first:** en prod el env SIEMPRE está seteado (por eso las notis ya funcionan). Con env-first + fallback-config, la rama de config nunca se alcanzaría → la config seguiría muerta, violando "no dejar la config muerta". Config-first la vuelve **realmente viva**.
- **Por qué no rompe lo que ya funcionaba:** la config arranca vacía (`''`) → el resolver la trata como "no seteada" y **cae al env actual** → caliente + follow-up del cron siguen llegando igual. Apenas Franco completa los campos en `/admin/settings`, la config toma el control (rotar bot/chat sin redeploy — exactamente para lo que existe la config).
- **Par atómico:** se usa la config SOLO si bot token **y** chat id están completos; si no, se usa el par de env completo. Nunca se mezcla token de una fuente con chatId de otra (evita un credential Frankenstein).
- **DB caída ≠ noti muerta:** la lectura de `AgencySettings` va en try/catch; si la DB falla, cae a env igual.

**Qué se hizo:**
1. **`src/lib/notifications/telegram.ts` — único punto de envío.** Nuevo `sendTelegram(message, { parseMode })` (default `'HTML'`) + `resolveTelegramCredentials()` (config-first/env-fallback, par atómico, nunca lanza). Devuelve `boolean` (sirve tanto a quien lo ignora como a quien necesita saber si salió). `notifyTelegramOptional` se conserva como **wrapper fino** (Markdown fire-and-forget) que delega en `sendTelegram` → los 4 call-sites del chatbot quedan **sin tocar** (cero blast radius) pero ya pasan por el sender único.
2. **`src/lib/leados/notify.ts`** — se eliminó el `enviarTelegram` local (la copia env+fetch) y sus 3 call-sites llaman `sendTelegram(msg, { parseMode: 'HTML' })`. Contrato `boolean` preservado (el gate de `calienteNotificadaAt` sigue marcando SOLO tras envío exitoso). Header doc actualizado.
3. **`src/app/api/cron/os-follow-up/route.ts`** — se quitó la lectura de env + el guard temprano "Telegram is not configured", y el `fetch` inline pasó a `const sent = await sendTelegram(message, { parseMode: 'HTML' })`. Contrato externo del cron preservado: envío OK → crea marker idempotente + 200; `!sent` → 500 sin crear marker (la próxima corrida reintenta).
4. **Config muerta → viva:** `osTelegram*` ahora se consume vía `resolveTelegramCredentials`. NO se retiró nada: la única ruta de credenciales pasa por la config (con env de fallback). El lado de escritura (UI) ya existía; este sprint cierra el lado de lectura.

**Archivos tocados (3):**
- `src/lib/notifications/telegram.ts` (reescrito — `sendTelegram` + resolver config-first; `notifyTelegramOptional` ahora wrapper)
- `src/lib/leados/notify.ts` (borrado `enviarTelegram` local; 3 call-sites → `sendTelegram`)
- `src/app/api/cron/os-follow-up/route.ts` (env+guard tempranos fuera; `fetch` inline → `sendTelegram`)

**Verificación (quality-gate ECC + build):**
- ✅ **Grep de consolidación:** `api.telegram.org`, `process.env.TELEGRAM`, `enviarTelegram`, `telegramBotToken`/`telegramChatId` → aparecen **únicamente** en `telegram.ts` (el sender + su fallback de env). Cero copias dispersas.
- ✅ `eslint` sobre los 3 archivos → exit 0, **cero findings**.
- ✅ `npm run build` (`next build --webpack`) → **verde, exit 0**. "Finished TypeScript in 40s" sin errores (strict, cero `any`); 30/30 páginas estáticas; ruta `/api/cron/os-follow-up` y `/admin/settings` compilan.
- Formatter: el repo NO usa Prettier (ESLint 9 es la autoridad; single-quote, sin `;`) — mismos criterios que B0.x/FG-0. No se corrió `prettier --write`.

**Reglas absolutas del task (verificadas):**
- NO se cambió CUÁNDO disparan las notis: los eventos/gates que las llaman quedaron idénticos (caliente score≥4 + `calienteNotificadaAt`, escalamiento, reunión AGENDADA, cron pending-leads + marker diario). Solo se unificó el CÓMO. ✅
- Una sola fuente de verdad real (config-first + env-fallback), config ya **no muerta**. ✅
- Tipado estricto, cero `any`. Fallo silencioso controlado: sin credenciales o error de envío → log + `false`, **nunca lanza**, el flujo que llamó sigue intacto. ✅

**Nuance de comportamiento documentada (cron, menor):** antes el cron devolvía 500 "Telegram is not configured" **temprano** (antes del query de leads). Ahora, al centralizar la resolución de credenciales (no se puede chequear "configurado" leyendo solo env sin duplicar la lógica que justamente se eliminó), el chequeo se hace en el envío: si no hay leads pendientes devuelve 200 `no_pending_leads` sin tocar Telegram; si hay leads pero falta credencial/falla el envío, devuelve 500 "Telegram send failed" (sin crear marker → reintentable). El **gate de disparo es idéntico** (leads pendientes + sin marker del día); el delta solo afecta el caso mal-configurado, que sigue surfaceando como 500 cuando hay algo real para mandar.

**Verificación humana declarada (Franco — se confirma en uso real, según el split del task):**
- Las notis que ya funcionaban siguen llegando con el env actual: **lead caliente** (evaluación score≥4) y **follow-up diario del cron** (`/api/cron/os-follow-up`).
- Si Telegram NO está configurado (ni config ni env), nada se rompe: el flujo del setter/chatbot sigue, solo queda un log `[telegram] sin credenciales…`.
- (Opcional, para activar la config) cargar bot token + chat id en `/admin/settings` → a partir de ahí mandan esos, sin redeploy; vaciarlos vuelve al env.

**Pendientes:**
- **0.5.8 (Parte 2):** las notis AL setter se construyen sobre `sendTelegram` (sender único) — ya no hay 3 copias que tocar.
- Heredados (ajenos a este sprint): drift DB↔schema (`chatbot_lead.convertedToOsLeadId`, enum `AuditActionType`) y los 2 errores ESLint `react-hooks` pre-existentes.

---

## ✅ FG-0.5 · Reconciliación del drift DB↔schema (BOT_DELETED + convertedToOsLeadId) · 2026-06-19

Cierre del **hallazgo FUERA DE SCOPE** registrado en FG-0.5 (índices de la cabina): el drift pre-existente DB↔schema que un futuro `migrate dev` habría querido **resetear** (la catástrofe prohibida). **Decisión de producto tomada por Franco ANTES de tocar datos.** Reconciliado con **2 migraciones propias, aditivas/idempotentes**, aplicadas con `migrate deploy` (NUNCA reset). Branch dev de Neon (`ep-quiet-waterfall`). Tipado estricto.

**Diagnóstico (read-only, confirmado en vivo):** `migrate status` daba verde (solo compara archivos de migración vs `_prisma_migrations`), pero `migrate diff --from-schema-datasource → --to-schema-datamodel` mostraba 2 divergencias reales:
1. **`chatbot_lead.convertedToOsLeadId`** (`text`, nullable): la DB dev la tenía; el schema/código no. `chatbot_lead` = 2 filas, **1 con valor**. Remanente de un approach **FK abandonado** en `lane/chatbots` — la feature mergeada (`convert-chatbot-lead.actions.ts`) deduplica por email y nunca usó la columna. El string exacto **jamás** estuvo en schema/código committeado (pickaxe `--all` → solo en `lane-LOG.md`); quedó en la DB por un `db push` no revertido.
2. **enum `AuditActionType`**: la DB dev tenía **`BOT_DELETED`** (+ orden distinto), el schema no. `BOT_DELETED` lo usaba **1 fila real** de `admin_audit_log` → el rebuild que querría `migrate dev` (`USING ::text::"AuditActionType_new"`) habría **fallado / perdido esa fila**. El `lane-LOG.md` (F2, "PENDIENTE DE COORDINACIÓN") documenta que el autor quería `BOT_DELETED` pero, con el schema tratado como FROZEN, dejó un fallback `actionType:'OTHER'` + `metadata.subAction:'BOT_DELETED'`, y sugirió formalizar el valor de enum.

**Decisión (Franco):**
- **enum → ADOPTAR `BOT_DELETED`** (aditivo). Prueba empírica previa: agregarlo al schema deja el `migrate diff` vacío del lado del enum (la DB ya lo tenía) — sin rebuild, sin cast, preservando la fila.
- **columna → DROPEAR `convertedToOsLeadId`** (el schema manda). Se asume conscientemente la pérdida de 1 valor dev huérfano.
- **call-sites → completar la "acción sugerida" del lane-LOG**: cambiar los 2 `actionType:'OTHER'` por `'BOT_DELETED'`.

**Qué se hizo:**
1. `schema.prisma` — `BOT_DELETED` agregado al enum `AuditActionType` (junto a las acciones BOT_* de ciclo de vida).
2. Migración `20260619140000_add_bot_deleted_audit_action` — `ALTER TYPE "AuditActionType" ADD VALUE IF NOT EXISTS 'BOT_DELETED'`.
3. Migración `20260619140100_drop_chatbot_lead_converted_column` — `ALTER TABLE "chatbot_lead" DROP COLUMN IF EXISTS "convertedToOsLeadId"`.
4. Call-sites de borrado de bot: `actionType:'OTHER'` → `'BOT_DELETED'` y se removió el `metadata.subAction:'BOT_DELETED'` ya **redundante** (verificado: `subAction` no se lee en ningún lado del repo). Comentarios stale ("el enum no tiene BOT_DELETED") eliminados.

**Por qué `IF [NOT] EXISTS` (clave del diseño):** las migraciones quedan idempotentes y correctas en AMBOS sentidos — sobre la DB dev driftada (una ya tiene el enum value; la otra todavía tiene la columna → `ADD VALUE` es no-op, `DROP COLUMN` dropea) y sobre una DB **reconstruida** desde la historia de migraciones (el enum value no existe → `ADD VALUE` lo agrega; la columna nunca se creó → `DROP COLUMN` es no-op). Así `schema ↔ migraciones ↔ DB` quedan alineados y un futuro `migrate dev` no detecta drift.

**Archivos tocados (5):**
- `prisma/schema.prisma` (+1 línea en el enum)
- `prisma/migrations/20260619140000_add_bot_deleted_audit_action/migration.sql` (nuevo)
- `prisma/migrations/20260619140100_drop_chatbot_lead_converted_column/migration.sql` (nuevo)
- `src/app/(protected)/admin/chatbots/bulk-actions.ts` (actionType + limpieza de comentario/metadata)
- `src/app/(protected)/admin/chatbots/[botId]/actions.ts` (actionType + limpieza de comentario/metadata)

**Verificación:**
- ✅ `migrate deploy` → 2 migraciones aplicadas a dev, **sin reset, sin error** (`ADD VALUE` / `DROP COLUMN` OK sobre el endpoint pooled).
- ✅ `migrate status` → "Database schema is up to date!" (**64 migraciones**, eran 62).
- ✅ `migrate diff --from-schema-datasource → --to-schema-datamodel` → **"-- This is an empty migration."** El drift documentado en FG-0.5 ya NO aparece (criterio de cierre cumplido).
- ✅ Inspección read-only en vivo (post-apply): `chatbot_lead.convertedToOsLeadId` **ya no existe**; el enum tiene `BOT_DELETED`; la fila de `admin_audit_log` con `actionType=BOT_DELETED` (1) se **preservó** (cero pérdida de auditoría).
- ✅ `prisma generate` OK; `tsc --noEmit` limpio (`actionType:'BOT_DELETED'` tipa contra el client regenerado); `eslint` en los 2 call-sites exit 0; `npm run build` **verde**.

**Reglas absolutas del task (verificadas):**
- NUNCA `migrate reset`: se usó `migrate deploy` (incapaz de resetear). ✅
- Cambio de datos **consciente y confirmado por Franco** antes de ejecutar (drop de 1 valor + adopción del enum). ✅
- Branch dev de Neon, nunca prod (host confirmado `ep-quiet-waterfall-acv0fpll-pooler...neon.tech`). ✅
- Migraciones idempotentes, alineadas en ambos sentidos (DB driftada y DB reconstruida). ✅

**Pendientes:** ninguno de este sprint — el drift queda **cerrado**: el próximo `migrate dev` (cuando se necesite) ya no querrá resetear por estos 2 puntos. Sigue vigente la deuda heredada AJENA: errores ESLint `react-hooks` pre-existentes (`setter/page.tsx`, `seguimiento-step.tsx`, `construccion-step.tsx`, `onboarding-hint.tsx`).

---

## ✅ FG · Autosave + guardia de salida de la ficha y el brief del setter · 2026-06-19

La base de confianza de la cabina: hoy el setter escribe la ficha o el brief, cierra la pestaña / se corta la conexión, y **pierde todo sin aviso**. Se agregó autosave del trabajo escrito + guardia de salida + indicador sutil de estado. **SENSIBLE: toca cómo se PERSISTE el input, NO los gates de transición.** Tipado estricto, cero `any`. Un objetivo.

**Cómo persistía ANTES (descubrimiento):**
- **Ficha** (`ficha-step.tsx`) → action `guardarFicha` (`dossier.actions.ts:78`) → `saveOwnedFicha` (`dossier.ts:244`) escribe `fichaJson`. **Solo por botón "Guardar ficha"**. La ficha es toda opcional (`FichaSchema`, `contracts.ts`) → guarda parcial sin drama. **No transiciona** de stage.
- **Brief** (`brief-step.tsx`) → action `guardarBrief` (`dossier.actions.ts:172`) → `saveOwnedBrief` (`dossier.ts:365`) escribe `briefJson`. **Solo por botón "Guardar brief"**. Validación estricta (`BriefInputSchema` exige `titulo`+`secciones`≥1+`pegadoGem`). **En EVALUADA, el primer guardado dispara `transitionDossier(EVALUADA→BRIEF)`** (`dossier.actions.ts:194`).
- **Cero** debounce / autosave / `beforeunload` en el repo (lienzo limpio). Feedback = `sonner` + `router.refresh()`.
- **Dónde guardar el borrador:** los `Json` existentes (`fichaJson`/`briefJson` en `OsLeadDossier`) **alcanzan** → **NO hizo falta migración** (evaluado y descartado: `*JsonDraft` habría sido scope extra sin valor).

**Qué se agregó (3 archivos nuevos + 2 forms cableados; CERO cambios en actions/schema/`transitionDossier`):**
1. **`src/lib/use-autosave.ts` (nuevo)** — hook genérico: debounce trailing (1200ms) **con coalescing in-flight** (si llegan ediciones mientras guarda, reintenta lo más nuevo sin solapar saves), **tope `maxWaitMs`** (8000ms: fuerza guardado aunque no pare de tipear — acota lo perdido si se corta la conexión), tracking `isDirty`, y `phase` (`idle/saving/saved/error`). **No decide qué persiste:** recibe una `save` que DEBE reusar la action de dominio. Expone `markSaved()` para que el guardado manual marque limpio.
2. **`src/lib/use-unsaved-guard.ts` (nuevo)** — `beforeunload` activo solo mientras `isDirty`. Cubre cierre de pestaña / recarga dura / salir del sitio (el caso del task). No cubre nav SPA in-app (documentado): ahí protege el autosave + el indicador.
3. **`src/app/(protected)/setter/_components/autosave-status.tsx` (nuevo)** — indicador sutil reusado por ambos forms: "Guardando…" / "Sin guardar" / "Guardado" / "No se pudo guardar". Neutro (disciplina B9), `role="status"` + `aria-live="polite"`, íconos `aria-hidden`.
4. **`ficha-step.tsx`** — `useAutosave` habilitado cuando `editable` (inerte con ficha congelada), guardia con `isDirty`, indicador en la barra de botones, `markSaved()` en el guardado manual. Hint actualizado: "Se guarda solo mientras escribís."
5. **`brief-step.tsx`** — `useAutosave` habilitado **solo en `stage==='BRIEF' && editando && briefValido`** (re-pegado), guardia con `formVisible && isDirty`, indicador, `markSaved()` en el manual. `aPayloadBrief` extraído a nivel módulo (DRY entre manual y autosave), tipado `: BriefInput`.

**Punto de aislamiento — el autosave NO dispara transiciones de etapa (cómo se garantiza, no "es obvio"):**
- **Ficha:** `guardarFicha` no llama `transitionDossier` en ningún path (`dossier.actions.ts:78-99`). Autoguardar la ficha es transición-imposible por construcción.
- **Brief:** la ÚNICA transición de `guardarBrief` es `if (dossier.stage === 'EVALUADA') transitionDossier(…→BRIEF)` (`dossier.actions.ts:194`). El autosave del brief se habilita **solo con `stage==='BRIEF'`** → ese `if` queda **muerto** (el stage real ya es BRIEF; `saveOwnedBrief` re-escribe `briefJson` con `where stage:'BRIEF'` y no toca `stage`). La **captura inicial en EVALUADA NO se autoguarda a propósito**: ese primer guardado ES la transición deliberada de stage (decisión del setter, vía botón), y queda cubierta por la **guardia de salida**, no por el autosave.
- `transitionDossier` quedó **intacto** (cero ediciones).

**Test de invariante — ownership (el check concreto, no "es obvio"):**
El autosave **no abre ningún path de escritura nuevo**: reusa las mismas actions, y por eso hereda su cuello de ownership. La cadena, verbatim:
- `guardarFicha`/`guardarBrief` arrancan con `requireSetter()` → `userId` se deriva de la **sesión server**, nunca del cliente (lo único que viaja del cliente es `leadId`, ya presente en props).
- Resuelven el lead vía `getOwnedLead(leadId, userId)` = `prisma.osLead.findFirst({ where: { id: leadId, assignedToId: userId } })` (`ownership.ts:22-24`) — directo (ficha vía `saveOwnedFicha`→`ensureOwnedDossier`→`getOwnedLead`, `dossier.ts:97`; brief vía `saveOwnedBrief`→`getOwnedDossier`→`getOwnedLead`, `dossier.ts:370,83`).
- **Lead ajeno → `findFirst` devuelve `null` → `saveOwned*` devuelve `null` → la action devuelve `fail('Lead no encontrado')`, sin escritura.** Un setter NO puede autoguardar en un lead que no es suyo (mismo cuello anti-IDOR que el guardado manual). Guard optimista extra: `saveOwned*` hace `updateMany where stage:<actual>` → si el stage se movió entre lectura y escritura, no pisa nada.
- *(Infra de test del repo: solo Playwright e2e, sin runner unitario; el invariante de aislamiento es DB-bound y exige sembrar 2 setters con leads cruzados — fuera del scope de un objetivo. Queda como esta constancia con el check concreto, según el split del task.)*

**Archivos tocados (5):**
- `src/lib/use-autosave.ts` (nuevo)
- `src/lib/use-unsaved-guard.ts` (nuevo)
- `src/app/(protected)/setter/_components/autosave-status.tsx` (nuevo)
- `src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx` (autosave + guardia + indicador)
- `src/app/(protected)/setter/leads/[leadId]/_components/brief-step.tsx` (autosave acotado + guardia + indicador; `aPayloadBrief` extraído)

**Migración:** **ninguna** — reusa `fichaJson`/`briefJson` existentes. (No corre `prisma migrate status` por eso; el schema no se tocó.)

**Verificación (quality-gate ECC + build):**
- ✅ `eslint --max-warnings=0` sobre los 5 archivos → exit 0, **cero findings** (incluye `react-hooks/rules-of-hooks` + `exhaustive-deps`: los hooks nuevos van antes de los early-returns de ambos forms).
- ✅ `npm run build` (`next build --webpack`) → **verde**, type-check estricto OK, cero `any`. `/setter/leads/[leadId]` compila.
- ✅ Grep: cero `any`/`as any`/`console.*` en los 5 archivos.
- ✅ **Code review (2 subagentes, react + typescript):** sin CRITICAL ni HIGH; los 4 invariantes (ownership, no-transición, type-safety, parcial-safe) confirmados. Fixes aplicados de los hallazgos: (a) `use-autosave` ignora el resultado de un autosave en vuelo si `markSaved` lo reclamó durante el `await` — evita un "error" falso tras guardar manual; (b) cancela el timer al volver el form a su valor original; (c) `aria-hidden` en íconos del indicador; (d) tipo explícito `BriefInput` en `aPayloadBrief`. Formatter: el repo NO usa Prettier (ESLint 9 es la autoridad; single-quote, sin `;`).

**Reglas absolutas del task (verificadas):**
- SENSIBLE: se tocó CÓMO se persiste, NO los gates. `transitionDossier` intacto; el autosave NUNCA transiciona (ficha imposible; brief gateado a BRIEF). ✅
- Aislamiento por `assignedToId` intacto: el autosave reusa la action, hereda `getOwnedLead`. ✅
- Sin migración (Json existentes alcanzan); de haberla necesitado: aditiva, branch dev, nunca reset. ✅
- Autosave en pausa (debounce 1200ms + maxWait 8s), NO por tecla. ✅ · Tipado estricto, sin `any`. ✅

**Verificación humana declarada (Franco — perceptual + funcional, su sign-off por diseño del task):**
- **Ficha:** escribir, **recargar a la fuerza (F5)** sin tocar "Guardar" → el trabajo sigue ahí (autosave lo guardó en la pausa). El indicador pasa "Sin guardar" → "Guardando…" → "Guardado".
- **Guardia:** con cambios sin guardar (justo después de tipear, antes de que cierre el debounce, o en la **captura inicial del brief en EVALUADA**), **cerrar la pestaña / recargar** muestra el diálogo nativo "los cambios no se guardarán".
- **Brief (re-pegado):** desde un brief guardado, "Quedó genérico — re-pegar", editar → autosave + indicador "Guardado". (La primera captura del brief sigue siendo botón manual a propósito: ese guardado avanza de etapa.)
- *Nota:* NO corrí visual-QA autenticada — estas pantallas están auth-gated y dependen del stage del dossier (el dev-QA da falsos negativos por hidratación en LeadOS, ya documentado); el comportamiento del autosave/guardia exige tipear + recargar + cerrar con sesión real. Build + ESLint + code-review verdes garantizan que compila/renderiza y que la lógica del hook es correcta; la confirmación perceptual+funcional queda para esta pasada de Franco, según el split del task.

**Pendientes:**
- **Franco:** la verificación perceptual+funcional de arriba.
- Posible follow-up (NO en este objetivo): autoguardar también la **captura inicial del brief en EVALUADA** exigiría un path que persista `briefJson` parcial SIN transicionar (schema laxo + flag en la action) — toca la superficie sensible; hoy lo cubre la guardia de salida.
- Heredados (ajenos): errores ESLint `react-hooks` pre-existentes (`setter/page.tsx`, `seguimiento-step.tsx`, `construccion-step.tsx`, `onboarding-hint.tsx`).

---

## ✅ FG · Por qué esta card está acá — rótulo del criterio de orden en el home   ·   2026-06-19

El setter veía su cartera ordenada pero el orden se leía arbitrario: no sabía POR QUÉ una card está arriba de otra. La razón YA se calculaba — solo faltaba exponerla. **Solo presentación**: expone el criterio existente, cero cambio en cómo se calcula el orden ni en la urgencia. Tipado estricto, cero `any`. NO toca `/admin` ni el aislamiento por `assignedToId`.

**De dónde sale la razón (descubrimiento):**
- El orden vive en `agruparParaHome` (`flow.ts:655-676`). El **único** lane ordenado por urgencia es **«Para trabajar ahora»** (`trabajar`): se ordena por la función local `urgencia` con tres tiers y, dentro de cada tier, por antigüedad (`createdAt` asc):
  - **Tier 0** — `leadRespondio(status)` (RESPONDIO/CALL_AGENDADA/CERRADO): respondió el primer contacto y espera la demo (urgencia de turnaround).
  - **Tier 1** — `caliente` (score ≥ 4): lead caliente.
  - **Tier 2** — resto, por orden de llegada.
- Los **demás lanes** (revisión, seguimiento, agendadas, archivo) van por antigüedad pura — esa razón ya es visible en la meta «hace X días». Por eso el rótulo NO aplica ahí (sería ruido redundante).
- La sección ya tenía la explicación a nivel cabecera («Primero los que respondieron, después los calientes, después el resto», `page.tsx:104`), pero **por-card** el setter no podía saber a qué bucket pertenece una card puntual. Ese es el hueco.

**Cómo se expone:**
1. **`flow.ts` — `motivoOrden(lead): string | null` (nuevo, exportado).** Pura. **NO recalcula nada**: lee los MISMOS tres tiers que `urgencia` (respondió → caliente → resto), traducidos al idioma del setter. Devuelve `null` fuera del lane `trabajar`. Doc-comment con nota **MANTENER EN SINCRONÍA con `urgencia`**: el criterio (el sort) y su traducción (el rótulo) son dos lecturas de la misma regla — tocar el sort está fuera de alcance, así que se espeja con la nota en vez de refactorizar el path de cálculo.
   - Tier 0 → `'Respondió — va primero'`
   - Tier 1 → `'Caliente — va antes del resto'`
   - Tier 2 → `'Por orden de llegada'`
2. **`home-sections.tsx` — chip por card.** `LeadCard` computa `motivoOrden(lead)` y, si hay rótulo, renderiza un chip bajo la meta: ícono `ArrowUpNarrowWide` (decorativo, `aria-hidden`) + texto. Estilo **NEUTRAL** (`text-zinc-500` sobre `bg-white/[0.03]`) por disciplina B9 — es informativo, el cyan queda para lo accionable (la caja «Próxima acción», que sigue siendo el elemento más fuerte). Subordinado: explica el ranking, no compite con el CTA.

**Archivos tocados (2):**
- `src/lib/leados/flow.ts` (nuevo `motivoOrden`; cero cambios al sort/urgencia)
- `src/app/(protected)/setter/_components/home-sections.tsx` (chip en `LeadCard` + imports)

**Verificación (quality-gate ECC + build):**
- ✅ `eslint` sobre los 2 archivos → exit 0, **cero findings**.
- ✅ `npm run build` → **verde** (`✓ Compiled successfully`), type-check estricto OK, cero `any`. `/setter` compila.
- Formatter: el repo **no usa Prettier** (ESLint 9 es la autoridad; single-quote, sin `;`). Mismos criterios que B0.x/FG-0.

**Reglas absolutas del task (verificadas):**
- Solo presentación: se EXPONE la razón existente. `urgencia` / `agruparParaHome` intactos — cero cambio en cómo se calcula el orden ni la urgencia. ✅
- Disciplina B9: el rótulo es informativo → **NEUTRAL (zinc), nunca cyan**. ✅
- El rótulo refleja la razón REAL del orden (mismos tiers que el sort), no una inventada; solo en el lane que efectivamente se ordena por urgencia. ✅
- Tipado estricto, sin `any`. ✅

**Verificación humana declarada (Franco, perceptual — su sign-off por diseño del task):**
- En «Para trabajar ahora», cada card muestra por qué está donde está: «Respondió — va primero» arriba, «Caliente — va antes del resto» después, «Por orden de llegada» en el resto.
- El rótulo coincide con el orden visual real (un card con «Respondió…» nunca aparece debajo de uno «Por orden de llegada»).
- El chip es neutro, chico y subordinado a la «Próxima acción» (no le roba el cyan).
- *Nota:* NO corrí visual-QA autenticada — el home está auth-gated y exige una cartera sembrada con leads en los tres tiers del lane `trabajar` para ejercitar los tres rótulos (el dev-QA da falsos negativos por hidratación en LeadOS, ya documentado). Build + ESLint verdes garantizan que compila/renderiza y que `motivoOrden` espeja `urgencia`; la confirmación perceptual queda para esta pasada de Franco, según el split de verificación del task.

**Pendientes:**
- **Franco:** la verificación perceptual de arriba.
- Si algún día se ordena por urgencia algún otro lane (hoy solo `trabajar`), extender `motivoOrden` en sincronía con el nuevo sort.

---

## ✅ FG · Rastro visible de reasignación de lead — que no aparezca/desaparezca mudo   ·   2026-06-19

Cuando el admin reasigna un lead, este **aparece o desaparece de la cartera del setter en silencio**, sin rastro — erosiona la confianza en que el lugar es estable. **SENSIBLE: esto MUESTRA el cambio, no lo causa.** El único writer de `assignedToId` sigue siendo el admin; el aislamiento por ownership queda intacto. Un objetivo, tipado estricto, cero `any`.

**Cómo se reasigna (descubrimiento):**
- Único writer de `OsLead.assignedToId`: **`assignLeadSetter`** (`admin/leads/_actions/lead.actions.ts:122`), `requireSuperAdmin()`, validación Zod, disparado desde `assign-setter-control.tsx`. Antes hacía el `update` y revalidaba — **mudo, cero rastro**. (`admin/leados/` es otra superficie —revisión de demos—, no toca asignación.)
- El setter alcanza sus leads SOLO vía `assignedToId` (`ownership.ts`: `listOwnedLeads` filtra por dueño; `getOwnedLead` es la puerta 404-style anti-IDOR). Ese es el **punto de aislamiento**.

**Qué rastro se agregó (todo ADITIVO sobre `OsLeadActivity`, sin tablas nuevas):**
1. **Schema** — `ActivityChannel.SISTEMA` (evento interno ≠ contacto comercial). Migración `20260619150000_add_activity_channel_sistema` = `ALTER TYPE ... ADD VALUE` (aditiva, no reescribe filas). **Pendiente de aplicar** (ver Franco).
2. **Escritura** — `registrarReasignacion` (`lib/leados/assignment-trail.ts`) crea la `OsLeadActivity` con `channel: SISTEMA`, `result: null`, nota `"Reasignado: <de> → <a>"`, `performedById` = admin. Crea la fila **directo, NO por `registrarContactoComercial`** (os-commercial dice *"eventos internos jamás"*: no es contacto al prospecto, no mueve cadencia ni status). Wireado en `assignLeadSetter`: captura el dueño previo, resuelve nombres y **solo registra si el dueño efectivamente cambió** (re-asignar al mismo no deja entrada).
3. **Que el setter lo VEA (caso "entró")** — `getUltimaAsignacion` (ownership-gated: pasa por `getOwnedLead`) alimenta un **banner en la página del lead del setter** (`setter/leads/[leadId]/page.tsx`): *"Te asignaron este lead el <fecha>"*. Cyan, subordinado, responde "por qué está acá". El setter **no tiene timeline de actividades** (solo conteos derivados), por eso el rastro se le surfacea con un banner propio, no por una lista.
4. **Admin** — el feed (`lead-activity-feed.tsx`) ya muestra la fila SISTEMA: ícono `ArrowLeftRight`, rótulo "Reasignación" (`channelLabel`), sin badge de resultado (la nota lleva el detalle).

**Punto de aislamiento — y el invariante comercial que protege (lo no-obvio):**
- `assignedToId` y quién puede reasignar (`requireSuperAdmin`) **intactos**. `ownedLeadWhere`/`ownedListWhere` (nuevo `lib/leados/isolation.ts`) extraen el filtro de ownership **sin cambiar comportamiento** (un solo lugar, ahora testeable).
- **El rastro NO puede contar como contacto comercial.** El setter no tiene timeline pero sí derivaciones que leen `OsLeadActivity`: `contactos` (= `activities.length`/`_count`), `ultimoContacto` (= `activities[0]`) y el gate `activo = contactos > 0` que **abre el paso de Seguimiento**. Una fila SISTEMA sin filtrar **abría el seguimiento antes del primer contacto real y reordenaba la cartera en el home** (`agruparParaHome` usa `contactos`). Por eso SISTEMA se **EXCLUYE de toda lectura comercial** con un único fragmento reusable `SOLO_CONTACTOS_COMERCIALES` (`isolation.ts`): `listOwnedLeadActivities`, `_count.activities` (home del setter + lista admin), cron `os-follow-up` ("último contacto" del digest — único cambio, el calendario no se toca) y `admin/leads/page.tsx`. `CreateActivitySchema` además rechaza SISTEMA (no es alta manual).

**Test de invariante (cruza ownership) — con el check, no "es obvio":**
- `npm run check:invariant` (`lib/leados/assignment-trail.invariant.ts`, `ts-node`, **puro, sin DB**) verifica de forma ejecutable que **mostrar el rastro NO cambia quién ve qué**: (1) el `where` de ownership es idéntico — tras reasignar A→B el filtro de A ya no alcanza el lead (el setter sigue viendo solo lo suyo); (2) la lista del setter está dura-filtrada por dueño; (3) SISTEMA queda excluido de lo comercial y (4) **nada de más** se excluye (todo otro canal sigue contando). Pinneado al módulo puro `isolation.ts`. → **PASA.**

**Archivos tocados:**
- Nuevos: `src/lib/leados/isolation.ts`, `src/lib/leados/assignment-trail.ts`, `src/lib/leados/assignment-trail.invariant.ts`, `prisma/migrations/20260619150000_add_activity_channel_sistema/migration.sql`.
- Editados: `prisma/schema.prisma` (enum), `lead.actions.ts` (wire + `_count` filtrado), `activity.schemas.ts` (rechaza SISTEMA), `ownership.ts`, `outreach.ts`, `cron/os-follow-up/route.ts`, `admin/leads/page.tsx`, `lead-activity.helpers.ts` (+`channelLabel`/ícono SISTEMA), `lead-activity-feed.tsx`, `setter/leads/[leadId]/page.tsx` (banner), `package.json` (script).

**Verificación (quality-gate ECC + build + invariante):**
- ✅ `eslint --max-warnings 0` sobre el scope → **cero findings**.
- ✅ `npm run build` → **verde**, type-check estricto OK, cero `any`. `/setter/leads/[leadId]` compila.
- ✅ `npm run check:invariant` → **PASA** (constancia ejecutable del aislamiento).
- ✅ `prisma migrate status` → la migración aparece como **pendiente** (correcto). Formatter: el repo **no usa Prettier** (ESLint es la autoridad; single-quote, sin `;`) — archivos sin tocar también "fallan" el Prettier por defecto.

**Reglas absolutas del task (verificadas):**
- SENSIBLE: muestra, no cambia. Quién reasigna (`requireSuperAdmin`) y el aislamiento por `assignedToId` → intactos. ✅
- Rastro vía la maquinaria existente (`OsLeadActivity`) de forma aditiva, no un sistema nuevo. ✅
- Tipado estricto, sin `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco, funcional — su sign-off):**
- **APLICAR LA MIGRACIÓN antes de probar:** `npx prisma migrate deploy`. El código escribe `channel: SISTEMA`; sin el `ADD VALUE` aplicado en Neon, el `insert` de la reasignación falla. (La divergencia previa con `20260617184913_…` es heredada, ajena a este sprint.)
- Reasignar un lead de test → el **nuevo dueño** abre el lead y ve el banner *"Te asignaron este lead el …"* (entró, no mudo) + el admin ve la entrada *"Reasignado: X → Y"* en el feed.
- **Límite declarado (honesto):** el caso **"salió"** para el setter que PIERDE el lead no tiene superficie propia acá — al perder ownership ya no puede abrir el lead (404-style), así que no ve el rastro en su historial. El evento **queda registrado** (lo ven el nuevo dueño y el admin) y el **aviso al setter saliente es el 0.5.8 (Parte 2)**: este sprint deja el rastro durable sobre el que ese aviso se construye. Coordinación declarada, no implementada (un objetivo).
- No corrí visual-QA autenticada (banner auth-gated + exige sembrar una reasignación; el dev-QA da falsos negativos por hidratación en LeadOS, ya documentado). Build + ESLint + invariante garantizan compilación/render y el aislamiento; la confirmación perceptual+funcional queda en esta pasada.

---

## ✅ FG-beta · Palancas de la cartera del setter — buscar/filtrar/ordenar + fijar/pausar/nota propia   ·   2026-06-19

Con 10–15 leads el setter **no podía organizar el volumen a su modo**: no buscaba, no filtraba, no priorizaba. `lead.notes` es del admin y el "Postergar" solo existía **dentro del Paso 9** del wizard. Este sprint suma las palancas a nivel **cartera**, más un **dato nuevo, suyo y privado**. Un objetivo, tipado estricto, cero `any`.

**Descubrimiento (subagente Explore, antes de tocar código):**
- La lista del setter es `listOwnedLeads(userId)` (`lib/leados/ownership.ts`), dura-filtrada por `assignedToId` vía `ownedListWhere` (`isolation.ts`) — el **punto de aislamiento**. El home (`setter/page.tsx`) es Server Component: clasifica con `flow.ts` (`agruparParaHome`) y rendea colas, sin estado ni params de URL.
- "Postergar" vive solo en el Paso 9: setea `status: POSTERGADO` + `reactivateAt` (estado **comercial**, lo ve el admin). NO hay storage por-setter previo.

**Palancas agregadas (búsqueda/filtro/orden — cliente, en memoria, instantáneo a esta escala):**
- `cartera-toolbar.tsx` + `cartera-view.tsx` (client): **buscar** (negocio/rubro/zona **y la nota propia**, sin acentos — `\p{Diacritic}`), **filtrar por estado** (las colas + Pausados + Archivo) y **orden elegible** (Por colas [default, agrupado] · Urgencia · Más nuevos · Más viejos · A–Z). Tocar cualquier control pasa de la **vista por colas** a una **lista plana** ordenada a gusto; "Limpiar" vuelve. La cartera ya está en memoria (la trae el server), así que el filtrado es client-side puro — cero round-trips. Helpers puros en `flow.ts`: `particionarCartera`, `filtrarYOrdenarCartera`, `vistaDeLead`.

**Priorización propia (mutaciones — server actions, mismo patrón que outreach):**
- **Fijar** (flota arriba, sección "Fijados por vos"), **Pausar** a nivel cartera (snooze personal con atajos 3d/1sem/2sem o fecha — sección "Pausados por vos", colapsable) y **nota privada** (editor inline, 240 chars). NO toca `status`/`reactivateAt` comerciales — el "Postergar" del Paso 9 sigue siendo otra cosa (pausa el lead para todos); esto es la **vista privada del setter**, solo él la ve.
- `cartera.actions.ts`: `fijarLead` / `pausarLead` / `reanudarLead` / `guardarNota`. TODAS: `requireSetter()` + `getOwnedLead` (anti-IDOR) ANTES de tocar nada + upsert keyed por `(leadId, setterId)` + `revalidatePath('/setter')`. Validación Zod (`cartera.schemas.ts`).

**El dato nuevo y su aislamiento (lo central):**
- **Tabla nueva `OsLeadSetterMeta`** (`pinned`, `snoozedUntil`, `note`), `@@unique([leadId, setterId])`, `onDelete: Cascade` por lead y por usuario. **NO es `OsLead.notes`** (campo del admin, otro dueño) — vive separado.
- **Privacidad estructural, no por convención:** toda lectura pasa por `ownSetterMetaWhere(userId) = { setterId: userId }` (`isolation.ts`). `listOwnedLeads` incluye `setterMetas: { where: ownSetterMetaWhere(userId) }` → cada lead trae **a lo sumo la fila propia**. Si un lead se **reasigna**, el nuevo dueño no hereda la nota del anterior (su `setterId` no coincide): **otro setter nunca ve la nota/pin/snooze ajenos.**

**ESLint limpiado (de paso, en el archivo):** `react-hooks/purity` en `page.tsx:34` (`Date.now()` en render). Fix limpio: el mapeo fila→lead se movió a `buildHomeLeads()` **fuera del componente** — `Date.now()` (request-time, para vencimientos y snooze) deja de estar en el cuerpo de render sin perder la semántica de "ahora" del Server Component.

**Test de invariante (con el check, no "es obvio"):**
- `npm run check:invariant:setter-meta` (`lib/leados/setter-meta.invariant.ts`, `ts-node`, **puro, sin DB**) verifica ejecutablemente: (1) **privacidad** — el meta se lee SIEMPRE por `setterId`, el filtro de A nunca alcanza la fila de B; (2) **aislamiento de listas** — la cartera sigue por `assignedToId`; (3) el filtro del meta **no es por `leadId` solo** (sería visible para cualquier setter del lead). → **PASA.** El invariante de reasignación previo (`check:invariant`) sigue **verde**.
- **Prueba E2E contra la tabla real** (script temporal, datos namespaced y borrados): 2 setters + 1 lead, cada uno escribe su nota; leyendo con el `include` exacto de `listOwnedLeads`, **A ve solo "NOTA DE A", B ve solo "NOTA DE B" — la nota de A nunca aparece para B.** Snooze persiste sin pisar la nota; upsert idempotente. → **PASA** ("otro setter no la ve", demostrado, no asumido).

**Archivos tocados:**
- Nuevos: `prisma/migrations/20260619160000_add_os_lead_setter_meta/migration.sql`, `lib/leados/setter-meta.ts`, `lib/leados/setter-meta.invariant.ts`, `setter/_actions/cartera.actions.ts`, `setter/_actions/cartera.schemas.ts`, `setter/_components/cartera-view.tsx`, `setter/_components/cartera-toolbar.tsx`, `setter/_components/lead-card-actions.tsx`.
- Editados: `prisma/schema.prisma` (modelo + relaciones, aditivo), `lib/leados/isolation.ts` (`ownSetterMetaWhere`), `lib/leados/ownership.ts` (include del meta filtrado), `lib/leados/flow.ts` (campos del meta en `HomeLead*` + `particionarCartera`/`filtrarYOrdenarCartera`/`vistaDeLead`), `setter/page.tsx` (shell + `buildHomeLeads` = fix purity), `setter/_components/home-sections.tsx` (LeadCard con nota/pin/pausa + footer de acciones fuera del `<Link>`; `CollapsibleSection` reusable), `package.json` (script invariante).

**Migración (decisión del usuario — "isolated additive apply"):**
- Tabla creada con SQL aditivo aislado: `prisma db execute` (solo el `CREATE TABLE` + índices + FKs) + `prisma migrate resolve --applied`. **No tocó el drift heredado** (`add_converted_lead_link…` DB-only) — queda para reconciliación aparte.
- **Drift heredado resuelto (con autorización del usuario en la pasada):** el render destapó que `/setter` **crasheaba para TODO setter** por `invalid input value for enum "ActivityChannel": "SISTEMA"` — la migración `20260619150000_add_activity_channel_sistema` (pendiente del sprint de reasignación, ver entrada anterior) no estaba aplicada. Se aplicó con `prisma migrate deploy` (solo esa, aditiva `ADD VALUE`). `/setter` vuelve a renderizar.

**Verificación (quality-gate ECC + build + invariante + visual):**
- ✅ `eslint` sobre todo el scope tocado → **cero findings** (incl. `react-hooks/purity` resuelto en `page.tsx`).
- ✅ `npm run build` → **verde**, type-check estricto OK, cero `any`.
- ✅ `check:invariant:setter-meta` y `check:invariant` → **PASAN** + E2E de privacidad contra la tabla real → **PASA**.
- ✅ `prisma migrate status`: mi migración **aplicada**; tras aplicar `SISTEMA` la historia quedó **consistente** → *"Database schema is up to date!"* (la entrada `add_converted_lead…` DB-only dejó de marcar drift: las migraciones locales `140000`/`140100` la reconcilian).
- ✅ **Visual-QA autenticada (dev-QA :3002, persona setter-qa, 13 leads reales):** desktop + mobile. Rendea marcador + toolbar + colas + cards con footer de acciones. **Round-trip de fijar probado en runtime** → aparece "Fijados por vos", la card flota, "Para trabajar" baja de 3→2 (el marcador estable se queda en 3, por diseño). **Búsqueda** "gastronom" → lista plana, 1 match por rubro (acento-insensible), "Limpiar". **Editor de nota inline** rendea (240, "solo vos la ves"). Estado de `setter-qa` restaurado (metas → 0).

**Reglas absolutas del task (verificadas):**
- Aislamiento (#1): toda lectura/filtro respeta `assignedToId`; el meta propio es privado por `setterId`. ✅
- NO se pisó `OsLead.notes` (admin): el dato nuevo vive en tabla aparte. ✅
- Aditivo, nunca reset, con ownership. ✅ · Tipado estricto, sin `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco — su sign-off):**
- Funcional+perceptual: lo confirmé en runtime esta pasada (fijar/buscar/ordenar/nota). Queda **idealmente** confirmar con **2 setters** que la nota es privada (yo lo demostré a nivel DB con el E2E; el de campo es tu chequeo).
- El snooze de cartera y el "Postergar" del Paso 9 conviven a propósito (personal vs comercial). Si en uso se confunden, revisar etiquetas — no es bug.

---

## ✅ FG-beta · Recorrido de cola — prev/next sobre "Mi día" (dejar de entrar y salir lead por lead)   ·   2026-06-19

🔴 **Cada lead era una isla.** Para mandar los openers del día, el setter entraba a un lead, lo accionaba, **volvía al home**, abría el siguiente, y así. No había "hacé todos los openers de hoy" ni un prev/next dentro de una cola — los "pasos sueltos" hechos física. Este sprint convierte las colas de la cartera en un **recorrido**: abrís la cola y vas lead por lead con **‹ Anterior / Siguiente ›**, sin pasar por el home entre cada uno. Un objetivo, tipado estricto, cero `any`.

**Descubrimiento (subagente Explore + lectura directa, antes de tocar código):**
- Las colas del home (`/setter`) se computan por request: `particionarCartera(buildHomeLeads(listOwnedLeads(userId)))` → `fijados`, `trabajar`, `revision`, `seguimiento`, `agendadas`, `pausados`, `archivo` (`flow.ts`). Cada card era un `<Link href="/setter/leads/[id]">` puro — **modo isla, sin prev/next** (confirmado: no existía ninguna navegación intra-cola).
- Los **gates** viven en el wizard del detalle (`lead-wizard.tsx` + steps) y en las server actions (`dossier.actions.ts`, `outreach.actions.ts`). El **hard-block B6 (opener SIN link)** está en `outreach.schemas.ts` (`OpenerInputSchema.refine(!contieneLink)`) y se **re-valida server-side** en `registrarOpener()` — no es solo UI. El **flujo invertido** (opener pegado a la evaluación; producción brief→construcción se abre recién cuando la conversación habilita) está cableado en el orden de los steps.
- El contenedor scrolleable es `<main overflow-y-auto>` (shell), con el topbar **fuera** de él → un strip `sticky top-0` dentro del contenido se pega bien, sin tapar la topbar.

**El mecanismo — contexto de cola por URL, recomputado en server (cero estado nuevo):**
- Al abrir un lead desde una cola se pasa `?cola=<key>`. El detalle (Server Component, `force-dynamic`) lee el param y, **solo si está presente**, recomputa la cartera propia con la **MISMA** clasificación del home y arma prev/next. En modo isla (sin `?cola=`) **no paga nada**: cero queries extra, render idéntico al de antes.
- **DRY que garantiza el orden:** `buildHomeLeads` se extrajo de `setter/page.tsx` a **`lib/leados/home.ts`**; home y recorrido parten de la misma función → el orden de la cola en "Mi día" y el de prev/next en el detalle son **EL MISMO** (urgencia en `trabajar`/`fijados`, antigüedad en el resto).
- **Módulo PURO `lib/leados/recorrido.ts`** (sin Prisma, sin server-only): `ColaKey`, `COLA_LABELS`, `esColaKey` (guard del param del cliente) y `construirRecorrido(particion, cola, leadId)` → solo ordena vecinos de una cola **ya clasificada**. **Self-healing:** si el lead salió de la cola (lo accionaste y cambió de grupo, o lo pausaste), `posicion=null` y `siguiente` apunta al **próximo pendiente** (la cima de la cola) — así encadenás openers: accionás → el lead sale de "trabajar" → "Siguiente" te lleva al que falta, sin volver al home.

**Lo que NO se tocó (las reglas absolutas):**
- **Gates intactos — el recorrido orquesta, no saltea.** Cada lead abre su **wizard completo** igual que en modo isla; prev/next son `<Link>` que navegan al lead, nada más. Ninguna acción se dispara desde el strip; cada transición sigue pasando por su gate (evaluación, gate del brief, self-check, envío de demo). El recorrido es navegación, no un atajo de estado.
- **Flujo invertido + opener SIN link intactos (B6).** No se tocó ningún step ni schema. El opener sigue saliendo antes que la demo y **sigue sin link** — el `OpenerInputSchema.refine(!contieneLink)` y su re-validación server-side quedan tal cual. Verificado en runtime: el step "Primer contacto (opener)" se ve dentro del recorrido con su leyenda *"nada de link — el link viaja recién con la demo"*.
- **Aislamiento (#1).** El recorrido recompone la cola desde `listOwnedLeads(userId)` (dura-filtrada por `assignedToId` vía `ownedListWhere`). `recorrido.ts` **nunca toca la DB** → no hay forma de recorrer una cola ajena por ahí. Sin `?cola=` válido (`esColaKey`), no se arma recorrido.

**Puntos de entrada (UI):**
- Botón **"Recorrer"** (pill cyan + play) en el header de las colas de **trabajo real** — `Para trabajar ahora` (`trabajar`) y `Fijados por vos` (`fijados`), donde viven los openers/follow-ups del día. Aparece solo con **2+ leads** (recorrer uno solo es entrar y salir). Las colas de espera (revisión/seguimiento/agendadas) no lo llevan: no son trabajo de ahora. El mecanismo soporta todas; la UI abre las útiles.
- **Strip sticky** en el detalle: etiqueta de la cola + contador *"Lead N de M"* + `‹ Anterior / Siguiente ›`. Bordes de cola: en el primero "Anterior" queda deshabilitado; en el último, "Siguiente". Cuando saliste de la cola: *"Listo en esta cola — seguí con el siguiente"*; cola vacía: *"Cola completa"* + volver a la cartera. Mobile: colapsa a flechas-icono (labels `hidden sm:inline`), sin overflow.

**Archivos:**
- Nuevos: `lib/leados/recorrido.ts` (módulo puro), `lib/leados/home.ts` (`buildHomeLeads` extraído), `setter/leads/[leadId]/_components/recorrido-strip.tsx` (strip sticky, Server Component).
- Editados: `setter/leads/[leadId]/page.tsx` (lee `?cola=`, arma `recorrido`, rendea el strip), `setter/page.tsx` (usa `buildHomeLeads` del lib — borra la copia local), `setter/_components/home-sections.tsx` (`GroupSection` con prop `cola` + botón "Recorrer"), `setter/_components/cartera-view.tsx` (pasa `cola="trabajar"` / `cola="fijados"`).

**Verificación (quality-gate ECC + build + visual):**
- ✅ `eslint` sobre todo el scope tocado → **cero findings**. (Prettier no es dependencia del repo — el formatter de hecho es ESLint; correrlo impondría un estilo ajeno, así que sus warnings son ruido y se ignoran a propósito.)
- ✅ `npm run build` → **verde**, type-check estricto OK, cero `any`. `/setter/leads/[leadId]` compila dinámico (ƒ).
- ✅ **Visual-QA autenticada (dev-QA :3002, persona `setter`, leads reales):** desktop + mobile, **happy path end-to-end**. "Recorrer" rendea en "Para trabajar ahora" (3 leads) → `?cola=trabajar`. Strip sticky correcto: **Lead 1/3** (Anterior off, Siguiente→lead 2), **Lead 2/3** (ambos activos, Anterior→1 / Siguiente→3), **Lead 3/3** (Anterior on, Siguiente off). `?cola=trabajar` se preserva en cada salto; navegación **directa lead→lead, nunca por el home**. Cada lead abre su wizard completo (stepper Ficha→…→Revisión + opener-sin-link visible). Mobile: flechas-icono sin overflow. **Cero errores de consola.**

**Reglas absolutas del task (verificadas):**
- SENSIBLE-lite: gates de transición y flujo invertido **intactos**; el opener sigue SIN link (B6 sin tocar). El recorrido orquesta, no saltea pasos ni gates. ✅
- Aislamiento (#1): las colas se recomputan desde `assignedToId`; `recorrido.ts` no lee DB. ✅
- Tipado estricto, sin `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco — funcional, su sign-off):**
- Recorré "Para trabajar ahora" con ‹ Anterior / Siguiente › sin volver al home: lo confirmé en runtime (1→2→3, bordes y contador). Tu chequeo: que el ritmo "openers del día lead por lead" se sienta bien en uso real.
- **Self-healing tras accionar (no lo probé en runtime para no mutar el seed QA):** mandá un opener desde dentro del recorrido → el lead sale de "trabajar" → el strip pasa a *"Listo en esta cola — seguí con el siguiente"* y "Siguiente" te lleva al próximo pendiente. La lógica es directa (`idx<0 → siguiente = cima de la cola`) y quedó verificada estáticamente; el de campo es tu confirmación. Cada una de esas acciones **sigue pasando por su gate** — el strip no acciona nada.

---

## ✅ FG-beta · Atajos de teclado del operador en "Mi día" + ayuda mínima de teclas   ·   2026-06-19

🟡 **El operador de volumen no tenía atajos — todo era mouse.** Sobre la vista "Mi día" y el recorrido de cola (0.5.5/0.5.6), este sprint suma **teclado** para las acciones frecuentes que ya existían por click, más una **ayuda mínima de discoverability**. Un objetivo, tipado estricto, cero `any`.

**Lo que NO cruzan los atajos (reglas absolutas):**
- **No saltean gates ni confirmaciones.** Los atajos disparan **exactamente el mismo `<Link>` que el click** — vía `.click()` sobre el ancla ya renderizada. El teclado hace **LO MISMO** que el mouse, ni más ni menos. Las acciones sensibles (enviar opener/demo, transiciones, fijar/pausar) **siguen siendo click** con su gate/confirmación: deliberadamente **no** tienen atajo. "Marcar hecho" no se mapeó a ninguna acción destructiva — en el recorrido, "Siguiente" ES "terminé con este, al próximo" (y el self-healing ya saca el accionado de la cola).
- **No rompen accesibilidad.** Guard NO negociable en `useKeyboardShortcuts`: el atajo **no dispara** si el foco está en un campo de escritura (`input`/`textarea`/`select`/`contenteditable`/`role=textbox|listbox|combobox`) ni con modificador (Ctrl/Cmd/Alt). Así escribir en el buscador o en la nota/opener, y los atajos del navegador, quedan **intactos**. El foco de cards es **foco DOM real** (`.focus()` sobre las anclas `[data-lead-card]`), no un estado de selección paralelo → accesible, y `Enter` abre nativo.

**Atajos (sobre acciones que ya existían por click):**
- **En "Mi día" (cartera):** `j`/`k` mueven el **foco entre cards** (saltando las palancas pin/snooze/nota, que es lo molesto de recorrer con Tab a secas) · `Enter` **abre** el lead enfocado (nativo, es un `<Link>`) · `r` **recorre** "Para trabajar ahora" (mismo destino que el botón "Recorrer") · `?` ayuda.
- **En el recorrido (detalle con `?cola=`):** `j`/`→` **siguiente** lead · `k`/`←` **anterior** · `b` **volver** a la cartera · `?` ayuda. Cada salto es el mismo `<Link>` del strip que ya existía por click.

**Ayuda mínima (discoverability, sin intrusión):**
- Pastilla fija abajo a la derecha (ícono de teclado + `?`); se abre con click o con `?`, se cierra con `Esc` o el botón cerrar. **No es modal** — no atrapa el foco ni bloquea la página. Lista las teclas de la superficie actual. `Esc` solo cierra la ayuda **cuando está abierta** (no le roba el `preventDefault` a otros usos de Escape).

**Arquitectura (DRY, tipado estricto):**
- `useKeyboardShortcuts(bindings)` (hook compartido, client): listener `window` único por instancia, bindings leídos por ref (no re-suscribe en cada render), con el guard de escritura/modificadores. `ShortcutMap = Record<string, (e: KeyboardEvent) => void>`.
- **Por qué `.click()` y no `router.push`/`triggerTransition`:** la regla del repo prohíbe `router.push()` directo; `triggerTransition()` (del root) está pensado para la nav del **rail** con su shutter de 300ms — meterlo por lead haría el recorrido lento y **distinto** al click. Activar el `<Link>` existente respeta la regla, no agrega shutter, y garantiza "hace lo mismo que el click". Z-index por tokens existentes (`zIndex.sticky` strip, `zIndex.overlay` ayuda) — Tailwind v4 acá no emite `z-*`.

**Archivos:**
- Nuevos: `setter/_components/use-keyboard-shortcuts.ts` (hook + guard), `setter/_components/shortcuts-help.tsx` (pastilla + panel).
- Editados: `setter/_components/cartera-view.tsx` (atajos j/k/r + ayuda + ancla `r` oculta), `setter/_components/home-sections.tsx` (`data-lead-card` en el `<Link>` de la card), `setter/leads/[leadId]/_components/recorrido-strip.tsx` (→ client: atajos j/k/←/→/b por refs a las anclas + ayuda).

**Verificación (quality-gate ECC + build + visual):**
- ✅ `eslint` sobre todo el scope → **cero findings**. ✅ `tsc` estricto, cero `any`. ✅ `npm run build` **verde**.
- ✅ **Visual-QA autenticada (dev-QA :3002, persona `setter`, 13 leads), desktop + mobile, simulando teclas reales:**
  - **Cartera:** `j` (nada enfocado) → enfoca card 0 → `j` card 1 → `k` card 0 (foco DOM real). **Guard probado:** con el **buscador enfocado**, `j` NO mueve foco ni navega — el foco se queda en el input. `?` abre la ayuda, `Esc` la cierra. `r` → navega a `/setter/leads/…?cola=trabajar` (Lead 1 de 3).
  - **Recorrido:** `j` → Lead 2/3, `k` → Lead 1/3, `b` → vuelve a `/setter`. **Guard probado:** con un **`<textarea>` enfocado**, `j` NO navega (foco se queda en el textarea). Panel de ayuda lista las 4 teclas correctas.
  - **Cero errores de consola.** Ayuda renderiza bien en mobile (panel `w-64`, sin overflow).

**Reglas absolutas del task (verificadas):**
- Atajos = mismas acciones por click, sin saltear gates/confirmaciones (sensibles siguen siendo click). ✅
- No capturan teclas mientras se escribe (guard probado en input y textarea). ✅
- Tipado estricto, sin `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco — funcional, su sign-off):**
- Con teclado físico: recorré la cartera con `j`/`k`, abrí con `Enter`, arrancá con `r`; en un lead andá con `j`/`k` y volvé con `b`. Confirmá que cada atajo hace lo mismo que el click y que **nada se dispara mientras escribís** (buscador, nota, opener). Lo simulé despachando KeyboardEvents reales; tu chequeo es el de dedos sobre el teclado.

---

## ✅ FG-beta · Carga + ratio del setter al asignar — que Franco no reparta a ciegas   ·   2026-06-20

🟡 **Asignar lead era a ciegas.** El dropdown "Setter asignado" del detalle (`/admin/leads/[id]`) listaba nombres pelados: no mostraba a quién le estabas cargando trabajo ni cómo venía filtrando. La carga (leads activos) y el ratio descarte/avance **YA se calculaban**, pero enterrados en otra pantalla (`/admin/leados`) y por la cola, no por la decisión de asignar. Con un setter es inocuo; con dos+ es reparto a ciegas. Un objetivo, tipado estricto, cero `any`.

**Lo que se REUSÓ (no se recalculó nada):**
- **Ratio descarte/avance:** mismísima función pura `calcularRatioSetters` (`src/lib/leados/revision.ts`) + `pctDescarte` + `alarmaNuncaDescarta` que alimenta la cola de revisión. Mismo insumo (dossiers evaluados con el contrato zod `parseEvaluacion`), misma cuenta → los dos lados cuentan IGUAL. No se tocó `revision.ts`.
- **`assignLeadSetter` intacta.** El sprint **no cambia la lógica de asignación** (la tocó 0.5.3, sigue igual): solo la **enriquece con datos** al momento de elegir. Cero cambios en la server action, el schema o el rastro de reasignación.

**Lo que se MUESTRA (al lado de cada setter, en el control de asignación):**
- **Carga viva:** `# leads activos` = asignados al setter **excluyendo terminales** (`CERRADO`/`PERDIDO`) — el trabajo que sube si le cargás otro lead. Aparece en **dos lugares**: el label del dropdown (`QA Setter · 12 activos`, visible al elegir) y una **vista de equipo** "Carga del equipo" debajo del select (una fila por setter, el asignado resaltado en cyan).
- **Ratio:** badge `% desc` por setter (con `title` = nº evaluadas); si el setter tiene volumen y **nunca descarta**, el badge se pone rose con ⚠ y `title` "revisar criterio" (reusa la alarma anti-rubber-stamp). Sin evaluaciones → pastilla muda "sin evaluar".

**Arquitectura (DRY, server/client limpio):**
- **Nuevo:** `src/lib/leados/setter-carga.ts` — capa de datos server-side. Un `groupBy` (carga viva por dueño, no N counts) + la query de dossiers evaluados (misma shape que `/admin/leados`), arma `EvaluacionDeSetter[]`, llama `calcularRatioSetters` y devuelve `Map<setterId, { activos, ratio }>` para join O(1) en el caller. `ahora = new Date()` se estampa **dentro del helper** (función async de lib, no en el render) para no disparar `react-hooks/purity` — mismo criterio que `isFollowUpPending` en esta página.
- **`assign-setter-control.tsx`** (client, presentacional): suma `activos` + `ratio` a `SetterOption`, el panel de equipo y el sufijo del label. Sin lógica de negocio: recibe los números ya cocidos.
- **`[leadId]/page.tsx`**: un `await cargarCargaSetters(setterIds)` tras cargar los setters; mapea a las props enriquecidas.

**Archivos:**
- Nuevo: `src/lib/leados/setter-carga.ts`.
- Editados: `admin/leads/_components/assign-setter-control.tsx` (panel "Carga del equipo" + label con activos), `admin/leads/[leadId]/page.tsx` (fetch carga + props enriquecidas).
- **Fuera de scope (pre-existente, desbloqueo del build):** `admin/leados/setter/[setterId]/_components/setter-evaluaciones.tsx` — archivo **untracked** de trabajo previo importaba `formatFechaHora` desde `@/lib/leados/revision` (no existe ahí; vive en `flow`). Rompía `tsc` de TODO el build. Corregí ese **único import** (todos los demás consumidores ya usan `flow`) para poder correr el gate de build de mi propio cambio. Es una corrección mecánica de una referencia rota, no un cambio de diseño — **flag para Franco** por si el dueño de ese WIP esperaba otra cosa.

**Verificación (quality-gate ECC + build + runtime real):**
- ✅ `eslint` sobre todo el scope → **cero findings**. ✅ `tsc` estricto, cero `any`. ✅ `npm run build` **verde**. ✅ `prisma migrate status` — 66 migraciones, DB al día (no se tocó schema).
- ✅ **Runtime autenticado contra Neon real (dev-QA :3002, persona `super-admin`, vía `/api/qa/login` + cookie):** GET del detalle de un lead asignado (`Inmobiliaria Laprida Propiedades`) → **HTTP 200, cero errores de servidor**. El HTML SSR renderiza el panel con datos vivos: "Carga del equipo" ×1, fila `QA Setter`, badge **`12 activos`** (coincide con el `groupBy` de la DB: 12 leads no-terminales), badge **`8% desc`** con `title="12 evaluadas"` (sale de `calcularRatioSetters` → reuse probado end-to-end), y el label del dropdown **`QA Setter · 12 activos`**.

**Reglas absolutas del task (verificadas):**
- Admin-only; **no** cambia `assignLeadSetter` (solo la enriquece con datos al elegir). ✅
- Reusa `calcularRatioSetters`, no recalcula el ratio. ✅
- Tipado estricto, sin `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco — su sign-off):**
- **Funcional (probado, tu confirmación visual):** abrí cualquier lead en `/admin/leads/[id]` → la card "Setter asignado" ahora muestra, debajo del select, "Carga del equipo": cada setter con sus **activos** y su **% descarte**. Al elegir en el dropdown ves el conteo en el propio label. El reparto deja de ser a ciegas.
- **Visual puro (no automatizable acá):** el screenshot desktop+mobile de la ruta admin **no** lo pude sacar — la cookie de sesión es `httpOnly`, inalcanzable desde el browser de preview, así que verifiqué el **render real por HTML SSR** (arriba), no por captura. Dale un ojo al **layout en mobile** del panel y a la comparación **con 2+ setters** (el seed de QA tiene **un solo** usuario rol `SETTER` — los otros `assignedToId` activos no son setters, así que el panel hoy muestra una fila; con 2+ setters reales se ve la comparación que es el punto del sprint).


---

## ✅ FG-beta · Drill-down de la métrica descarte/avance — la fila del setter clickea a sus evaluaciones   ·   2026-06-20

🟡 **La métrica descarte/avance estaba bien pensada pero era read-only sin salida:** la alarma *"Nunca descarta — revisar criterio"* no tenía a dónde ir — para revisar el criterio del setter había que ir a buscar las evaluaciones a mano en la base. Este sprint le da destino al click. Admin-only, read-only, un objetivo, tipado estricto sin `any`.

**Concurrencia con A1 (mismo archivo `admin/leados/page.tsx`):**
- Corrió pegado a A1 (cabina/*pipeline cockpit*), que comparte el archivo. A1 aterrizó SU trabajo durante este sprint (tercer query `pipelineDossiers`, `resumirPipeline`/`detectarAtascos`, `<PipelineCockpit>`, y quita del eyebrow "develOP / LeadOS"). Se respetó: mis cambios viven SOLO en la sección de la métrica (la fila `<div>`→`<Link>`); el cockpit y el header de A1 quedaron intactos. Re-leído el archivo post-A1 antes de cada toque; **build final consolidado (A1 + esto) en verde**.

**Qué se hizo:**
- **Nueva ruta `/admin/leados/setter/[setterId]`** (server component, `force-dynamic`): las últimas evaluaciones del setter — por cada lead evaluado muestra **score /5 + veredicto + stage actual + fecha + razonamiento completo** (+ `motivoDescarte` si lo hay), y cada fila linkea al detalle del lead (`/admin/leados/[leadId]`). Orden: la más reciente primero (por `evaluacion.fecha` de B5); las pre-B5 sin fecha caen al final. Header con el nombre del setter, la misma alarma *"Nunca descarta — revisar criterio"* si aplica, y el resumen total (evaluadas · descartes · avances · % descarte) **recalculado con la MISMA `calcularRatioSetters`** de la cola → los números coinciden con los que dispararon la alarma. Setter inexistente → `redirect('/admin/leados')` (mismo criterio que el detalle de lead sin dossier).
- **La fila del setter en la métrica pasó de `<div>` a `<Link>`** a esa ruta, con hover cyan (disciplina B9: cyan = navegable/accionable, igual que la cola de arriba en este mismo archivo) y la pista *"Ver últimas evaluaciones →"* (ChevronRight). **"Revisar criterio" pasó de búsqueda manual en DB a un click.**

**Cómo se mantuvo autocontenido (no tocar fuera de scope):**
- Solo lee `evaluacionJson` (contrato `EvaluacionSchema`) y `stage` — jamás los escribe. No toca la métrica ni el scoring (reusa `calcularRatioSetters`/`pctDescarte`/`alarmaNuncaDescarta` tal cual).
- `VEREDICTO_TONES` (rose/blue/amber) es **copia LOCAL deliberada** del mapa canónico de `dossier-panels.tsx`: evita exportar/tocar un archivo fuera del scope; el `Record<Evaluacion['veredicto'], string>` rompe en compilación si el enum del contrato cambia (no deriva en silencio).
- Admin-only por el layout (`SUPER_ADMIN`, `admin/layout.tsx`) — mismo patrón que el resto de `/admin/leados/*` (sin check per-page, sin Server Action ni API route nuevos).

**Archivos:**
- Nuevos: `admin/leados/setter/[setterId]/page.tsx` (datos + shell), `admin/leados/setter/[setterId]/_components/setter-evaluaciones.tsx` (lista presentacional).
- Editado: `admin/leados/page.tsx` (la fila de la métrica → `<Link>` + pista; SOLO esa sección).

**Verificación (quality-gate ECC + build + smoke HTTP autenticado):**
- ✅ `eslint` sobre los 3 archivos → **cero findings**.
- ✅ `npm run build` consolidado (con A1) → **verde**, type-check estricto OK, cero `any`. `/admin/leados/setter/[setterId]` compila dinámico (ƒ).
- ✅ `prisma migrate status` → *"Database schema is up to date!"* (sin cambios de schema).
- ✅ **Smoke HTTP autenticado (dev:qa :3002, persona `super-admin`, datos reales de Neon):**
  - `/admin/leados` → **200**; la fila del setter es `<Link href="/admin/leados/setter/…">` con la pista *"Ver últimas evaluaciones →"* visible.
  - `/admin/leados/setter/<id>` → **200**: **12 evaluaciones** renderizadas, cada una con score/5 + veredicto + stage (Aprobada/Descartada/Evaluada/Rechazada) + razonamiento + link al detalle del lead; header + "Volver a la cola".
  - setterId inexistente → **graceful** (redirige a la cola; sin 500, sin `__next_error__`, sin fuga a `/login`).
  - Nota: sobre `next start` (:3000) la cookie del bypass QA no decodifica (queda como quirk de **prod-QA, no del código**); el recipe documentado **dev:qa :3002** renderiza limpio. Para un smoke por `curl` la hidratación rota de dev es irrelevante (solo importa el HTML server-rendered).

**Reglas absolutas del task (verificadas):**
- Admin-only; solo presenta, no altera métrica ni scoring. ✅
- No se pisó lo de A1 en el mismo archivo (cockpit/header intactos; build consolidado verde). ✅
- Tipado estricto, sin `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco — su sign-off):**
- Entrá a `/admin/leados`, tocá la fila de un setter (la del *"Ver últimas evaluaciones →"*) y confirmá que el click te lleva a sus últimas evaluaciones con el razonamiento detrás — sin buscar nada en la base. Lo verifiqué por HTTP autenticado (200 + 12 evaluaciones reales); tu chequeo es el visual/de uso (que la lista se lea bien y el criterio del setter se entienda de un vistazo). Desktop + mobile.

---

## ✅ FG-beta · Panorama de producción del admin — conteo por etapa + antigüedad (cazar atascos)   ·   2026-06-20

🔴 **El dueño del cuello de botella estaba ciego al cuello de botella.** Los dos tableros mostraban sólo los extremos: `/admin/leados` la cola `EN_REVISION` (lo que ya llegó al final) y `/admin/leads` el estado COMERCIAL (`LeadStatus`) sin nada del dossier. Ninguno dejaba ver **cuántas demos hay en cada etapa de PRODUCCIÓN** (FICHA/EVALUADA/BRIEF/CONSTRUCCION) ni cuáles están paradas. El dato YA existía (`OsLeadDossier.stage`); este sprint lo **presenta en agregado**, arriba de la cola, como el equivalente admin de "Mi día". Un objetivo, tipado estricto, cero `any`.

**Conteo por stage (cómo se agregó):**
- **Una sola query nueva** en `page.tsx`, sumada al `Promise.all` existente (sin waterfall): `findMany` de los dossiers en vuelo — `stage in [FICHA, EVALUADA, BRIEF, CONSTRUCCION, EN_REVISION, RECHAZADA]` — con `leadId, stage, updatedAt, lead.businessName, lead.assignedTo`. Volumen chico (un setter), igual criterio que las dos queries que ya tenía la página.
- **Toda la lógica en un módulo puro** (`lib/leados/pipeline.ts`, espejo de `revision.ts`: sin Prisma, sin `'use server'`, testeable en frío): `resumirPipeline()` cuenta por etapa **en orden de flujo y con las vacías incluidas** (el tablero muestra el pipeline completo, no sólo lo que hoy tiene volumen); `detectarAtascos()` saca las paradas ordenadas de la más vieja a la menos.
- El tablero rendea 5 carriles FICHA→EN_REVISION con su conteo + antigüedad + badge de atasco. La cola de revisión y la métrica descarte/avance quedan **intactas** abajo (se de-duplicó el eyebrow "develOP / LeadOS" que ahora vivía dos veces).

**La antigüedad — DERIVADA, no migrada (decisión clave):**
- `OsLeadDossier` **no guarda "cuándo entró a este stage"** y `transitionDossier` está fuera de alcance (sólo presentación). Antes de migrar se evaluó derivarla de lo que hay: el proxy honesto es **`updatedAt` = "sin movimiento desde"**. Es **exacto en EN_REVISION** (la transición es el último write y los blobs quedan congelados — misma base que `ordenarCola`) y es la **última señal de actividad** en el resto — que es justo lo que delata un atasco (una demo sin tocar hace días está parada, sin importar el instante exacto de entrada). **Cero migración, schema sin tocar.**
- SLA por etapa en una constante editable (`STAGE_SLA_HORAS`, patrón `SHELL_CONSTRUCCION`): FICHA/EVALUADA/BRIEF 48 h · CONSTRUCCION 72 h · EN_REVISION 24 h · RECHAZADA 48 h · terminales `Infinity`. Superar el SLA = atascada.
- **RECHAZADA** entra a la lista de atascos (una demo que Franco bochó y el setter no retoma es atasco de manual) pero **no tiene carril propio** en el tablero (es loop-back, no etapa de avance). Por eso el KPI "Atascadas" puede superar la suma de los badges de carril; un caption lo aclara.

**Disciplina de color B9 (respetada):** el stage es informativo (su tono: zinc/azul/violeta, nunca cyan ni amber) · atasco = atención (ámbar) · RECHAZADA = problema (rosa).

**Arquitectura / Archivos:**
- Nuevo: `lib/leados/pipeline.ts` (módulo puro — tipos + `resumirPipeline`/`detectarAtascos`/`esAtascado`/`STAGE_SLA_HORAS`/`PIPELINE_STAGES`), `admin/leados/_components/pipeline-board.tsx` (Server Component: `PipelineCockpit` + tablero + panel de atascos).
- Editado: `admin/leados/page.tsx` (3ª query + mapeo a input puro + render del cockpit arriba de la cola; de-dup del eyebrow; contraste de labels muteadas).
- **Sin tocar:** `transitionDossier`, la máquina de estados, el schema, el canal SISTEMA, la métrica comercial. Admin-only por el guard del layout `(protected)/admin` (`role !== 'SUPER_ADMIN'` → redirect), igual que el resto de las páginas admin.

**Verificación (review adversarial + build + runtime):**
- ✅ **Review multi-agente adversarial** (18 agentes, 5 dimensiones + verificación escéptica): **0 CRITICAL / 0 HIGH** — no muta stage, no toca `transitionDossier`/schema, gating correcto, lógica de derivación correcta, sin `any`. 6 hallazgos MEDIUM/LOW confirmados y resueltos: **contraste WCAG AA** (labels `zinc-500`→`zinc-400`, "Vacío" `zinc-600`→`zinc-400`), **SC 1.3.1** (cada carril ahora con `aria-label` "Etapa: N demos, más viejo hace X, N atascadas" + fragmentos visuales `aria-hidden`), y el caption de RECHAZADA. El DRY de `setterLabel` quedó anotado como deuda pre-existente sistémica (fuera de alcance).
- ✅ `tsc --noEmit` estricto a nivel proyecto, cero `any`. ✅ `npm run build` **verde** (con los fixes).
- ✅ **Runtime autenticado (dev-QA :3002, persona `super-admin`, datos reales del seed con ~7 días):** HTTP 200 sobre `/admin/leados`, **cero errores**, 185 KB. Datos reales reconciliando: **En producción 9** (Ficha 1 · Evaluada 1 · Brief 0 · Construcción 0 · En revisión 7) · **Atascadas 11** = 9 de carriles + 2 RECHAZADA (caption mostrándose). Antigüedad derivada correcta ("hace 4/6/7 días"), detección de atascos disparando por SLA, `aria-label`s correctos, cola de revisión + "Calientes 7" **sin regresión**. **Sin migración → `prisma migrate status` no aplica.**

**Reglas absolutas del task (verificadas):**
- Sólo presentación: lee y agrega `stage`, jamás lo escribe; máquina de estados y `transitionDossier` intactos. ✅
- Admin-only (`requireSuperAdmin` vía guard del layout); no es superficie del setter; SISTEMA y conteos comerciales sin tocar. ✅
- Antigüedad derivada de `updatedAt` (sin migrar); schema sin cambios. ✅ Tipado estricto, sin `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco — perceptual, tu sign-off):**
- Entrá a `/admin/leados`: el panorama de producción está arriba de la cola. Verificá de un vistazo **cuántas demos hay en cada etapa y hace cuánto**, y que los **atascos** (carriles ámbar + lista ordenada por antigüedad, rechazadas en rosa) salten a la vista. Lo confirmé funcional en runtime con datos reales (9 en producción, 11 atascadas, números reconciliando); tu chequeo es el **perceptual** sobre la superficie real (glassmorphism oscuro): que el tablero "se lea como pipeline" y los atascos griten lo justo. Desktop + mobile.
- No pude sacar screenshot con el MCP de preview (el `:3002` dev-QA ya estaba corriendo y no se adjunta a un server ajeno; `next-prod-qa :3001` rebota a `:3000` por el `AUTH_URL` del build). El mock estructural del chat refleja los números reales pero en tema claro del host, no el oscuro real.

---

## ✅ FG-beta · Señal in-app de las 3 alarmas + el "me trabé" deja de ser invisible   ·   2026-06-20

🔴 **Las 3 señales (caliente · setter trabado · reunión) sólo viajaban por Telegram fire-and-forget.** Dos fragilidades: (a) si Franco no mira Telegram, se entera recién al abrir la página; (b) el "me trabé" del setter **no se persistía** — el lead quedaba en CONSTRUCCION sin marca, y como la cola sólo muestra EN_REVISION, ese lead trabado **ni aparecía** en el admin. Este sprint: cablea el badge del sidebar a la cola (señal in-app), persiste el escalamiento como dato del dossier (deja de ser invisible) y avisa visible cuando Telegram no está configurado. Aditivo, tipado estricto, cero `any`, un objetivo.

**1 · Badge del sidebar → cola de revisión + calientes (señal in-app, no sólo Telegram):**
- Reusa la **infra de badge existente** (no se duplicó): el `admin/layout.tsx` (Server Component) ya tenía `getPendingAlerts` con `unstable_cache(…, {revalidate:30})`. Se sumó **`getRevisionResumen`** con el mismo patrón (key + tag propios) — un `findMany` chico de `EN_REVISION` que devuelve `{pendientes, calientes}` (sólo números, nada de Dates que rompan el cache de Next 16). `calientes` reusa `parseEvaluacion` + `esCaliente` (score ≥ 4). Awaited en paralelo con `getPendingAlerts`.
- Props cableadas server→shell→sidebar: `layout.tsx` → `AdminLayoutClient` (props nuevas `revisionPendientes`/`revisionCalientes`) → `AdminSidebar`. El render del badge ya era genérico (`badges[badgeKey]`); se amplió la unión `BadgeKey` y se agregó `hotKey`. El item **"Revisión demos"** ahora muestra el conteo (cyan = demos esperando) y **vira a ámbar con una flama** cuando hay calientes. `aria-label` describe ambas dimensiones; la flama es `aria-hidden`. El badge rojo de `pendingAlerts` queda intacto.
- Lag ≤ 30 s (timer del cache, igual que `pendingAlerts` — su tag tampoco se invalida en mutaciones). La página `/admin/leados` en sí sigue `force-dynamic` (fresca); sólo el badge tiene ese lag.

**2 · El escalamiento "me trabé" ahora PERSISTE (deja de ser invisible) — migración aditiva:**
- **Migración** `20260620180000_add_dossier_escalado`: dos columnas nullable en `OsLeadDossier` — `escaladoAt DateTime?` (la marca) + `escaladoNota Text?` (el contexto que dejó el setter, para verlo in-app). **Aditiva, sin tocar datos ni otras tablas.**
- **Dueño = el DOSSIER, no el meta privado del setter** (decisión clave): el escalamiento es una señal OPERATIVA que el admin debe ver y que **sobrevive a una reasignación** del lead — no es organización personal del setter (`OsLeadSetterMeta`, keyed por `setterId`, muere al reasignar). Por eso su patch **nunca lleva `setterId`**: no roza el aislamiento.
- **Módulo puro** `lib/leados/escalamiento.ts` (espejo de `pipeline.ts`/`revision.ts`: sin Prisma, testeable en frío): `buildEscaladoPatch` (trim + cap 1000, **sin clave `stage`** → persistir nunca es transición), `estaEscalado` (predicado: vigente sólo en CONSTRUCCION) y `ESCALADO_RESET`.
- **Write** vía `marcarEscaladoOwned` en `dossier.ts` (mirror de `saveOwnedDraftUrl`: ownership + guard de stage + `updateMany` optimista scopeado a CONSTRUCCION). La action `escalarConstruccion` ahora **persiste PRIMERO** y empuja el Telegram después: el registro durable no depende de Telegram.
- **Limpieza de la marca, aditiva, en el chokepoint:** `transitionDossier` mergea `ESCALADO_RESET` en el `data` de **toda** transición — el escalamiento es de la construcción vigente, así que cualquier movida de stage lo resuelve/invalida. Esto + el gate por stage de `estaEscalado` (doble cinturón) evita el falso positivo en el re-loop RECHAZADA→CONSTRUCCION. No altera ninguna transición legal.
- **Marca visible en el admin:** `/admin/leados` rendea un **`EscaladasPanel`** nuevo en el cockpit (pure `detectarEscaladas` sobre la query de pipeline, que sumó `escaladoAt`/`escaladoNota` al select) — rosa + salvavidas (más urgente que un atasco por SLA: el setter está bloqueado AHORA), con nota, "escaló hace X" y link al lead. Un lead trabado ya no es invisible.
- **Marca visible para el setter (simetría):** `construccion-step.tsx` muestra un estado persistente "**Ya avisaste a Franco** (hace X) — está al tanto" cuando hay `escaladoAt`, y el botón pasa a "Avisar de nuevo" — evita que re-escale a ciegas. `escaladoAt` viaja como ISO por `WizardData` (page→wizard→step), igual que `respondioDesde`.

**3 · Aviso visible si Telegram no está configurado (antes se evaporaba en silencio):**
- Nuevo export **`isTelegramConfigured()`** en `telegram.ts`: reusa el resolver privado existente (config-first / env-fallback, par como unidad) **sin enviar nada**. Devuelve sólo el booleano — **no expone token ni chatId**.
- `/admin/leados` lo llama (sumado al `Promise.all`) y, si es `false`, muestra un **banner ámbar** arriba del panel: "Telegram sin configurar — no te llegan los avisos de calientes, setters trabados ni reuniones", con link a `/admin/settings`. La señal deja de evaporarse.
- En el setter, el toast del escalamiento ahora refleja la persistencia: aunque Telegram falle, "**Guardamos tu pedido — Franco lo ve en el panel**" (antes daba a entender que se perdía).

**4 · ESLint pre-existente limpiado (toqué `construccion-step.tsx`):**
- Había un error real `react-hooks/set-state-in-effect` en `UrgenciaBanner` (`setEspera` dentro de un `useEffect` → cascading renders). Se reemplazó por **`useSyncExternalStore` con snapshots estables** (`true` cliente / `false` server): la forma hidratación-safe de diferir el "hace X" (que depende del reloj del cliente) **sin** setState-en-effect y **sin** hydration mismatch. No se suprimió la regla — se corrigió el patrón. El mismo `useHidratado` alimenta el "hace X" del indicador de escalado.

**Arquitectura / Archivos:**
- **Nuevo:** `lib/leados/escalamiento.ts` (módulo puro), `lib/leados/escalamiento.invariant.ts` (+ script `check:invariant:escalamiento`), `prisma/migrations/20260620180000_add_dossier_escalado/`.
- **Editado:** `prisma/schema.prisma` (2 columnas), `lib/leados/dossier.ts` (reset en transición + `marcarEscaladoOwned`), `lib/leados/pipeline.ts` (`detectarEscaladas` + 2 campos), `lib/leados/notify.ts` (docstring), `lib/notifications/telegram.ts` (`isTelegramConfigured`), `admin/leados/page.tsx` (escaladas + banner Telegram), `admin/leados/_components/pipeline-board.tsx` (`EscaladasPanel` + stat), `admin/layout.tsx` (`getRevisionResumen`), `admin/_components/AdminLayoutClient.tsx` + `admin-sidebar.tsx` (badge), setter `[leadId]/page.tsx` + `lead-wizard.tsx` + `construccion-step.tsx` + `escalar-modal.tsx`.
- **Sin tocar:** las transiciones legales (sólo se mergea el reset aditivo), el aislamiento del setter, el canal SISTEMA, la métrica comercial, `HeroArtifact`/contextos frozen.

**Verificación:**
- ✅ **Test de invariante** (`check:invariant:escalamiento`, DB-free, no "es obvio"): prueba ejecutablemente que persistir el escalamiento **(1) no dispara transiciones** (patch sin `stage`; la marca no es un `DossierStage`; `ESCALADO_RESET` sólo limpia; gate por CONSTRUCCION) **y (2) no toca el aislamiento del setter** (patch sin `setterId`/`assignedToId`; los filtros `ownSetterMetaWhere`/`ownedLeadWhere`/`ownedListWhere` quedan idénticos). **PASA.**
- ✅ **ESLint** limpio sobre los 16 archivos tocados (incluido el error pre-existente de `construccion-step.tsx`, ahora resuelto).
- ✅ `npm run build` **verde** (type-check estricto incluido; client de Prisma regenerado con los campos nuevos).
- ✅ **`prisma migrate status` limpio** (67 migraciones, schema up to date). La migración se aplicó **sin reset** (ver flag abajo).
- ⏳ **Verificación visual/funcional → Franco** (la consigna la asignó a él explícitamente): por qué no la corrí yo, abajo.

**⚠️ Flag de migración (PRE-EXISTENTE, no causado por este sprint — Franco, importante):**
- `prisma migrate dev` quería **`migrate reset`** (PROHIBIDO). Causa: el **Neon dev compartido está ADELANTE de `main`** — tiene 3 migraciones aplicadas que **faltan en el repo local**: `20260617184913_add_converted_lead_link_and_bot_deleted_audit`, `20260619234252_add_organization_city_avatar_notes_softdelete`, `20260620173833_add_agency_settings_singleton_unique` (tocan `AgencySettings.singleton`, `Organization.avatar*/city/deletedAt/internalNotes`, `chatbot_lead.convertedToOsLeadId` — todo de otras ramas, ajeno a este sprint). El `schema.prisma` de `main` tampoco tiene esas columnas.
- **NO reseteé.** Apliqué SÓLO mis 2 `ADD COLUMN` de forma quirúrgica: `prisma db execute` del `migration.sql` (aditivo, sin DROPs, sin tocar las tablas driftadas) + `prisma migrate resolve --applied` para registrarla + `prisma generate`. `migrate status` quedó limpio.
- **Acción para Franco:** reconciliar `main` con esas 3 migraciones (traer los archivos al repo / mergear las ramas) antes del próximo `migrate dev` en `main`, o `migrate dev` volverá a pedir reset. El `migration.sql` de este sprint ya está en git para cuando se reconcilie.

**Reglas absolutas del task (verificadas):**
- Admin-only (badge + paneles bajo el guard `SUPER_ADMIN` del layout). El write del escalamiento lo hace el setter sobre su propio lead (ownership), que es correcto. ✅
- Persistir es **aditivo** — no rompe el flujo del setter ni `transitionDossier` (sólo se mergea `ESCALADO_RESET`, columnas nullable). ✅
- Se **reusó** `sendTelegram`/`resolveTelegramCredentials` (vía `isTelegramConfigured`) y la infra de badge; nada duplicado. ✅
- Migración aditiva, **nunca reset**. ✅ Tipado estricto, cero `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco — funcional/visual, tu sign-off):**
- **Sidebar:** abrí cualquier página `/admin/*` con demos en revisión — el item "Revisión demos" muestra **cuántas esperan**; si alguna es caliente, el badge vira a **ámbar con flama**. Desktop + mobile.
- **Setter trabado visible:** con un lead en CONSTRUCCION, entrá como setter y tocá **"Me trabé"** → en `/admin/leados` aparece el panel **"Setters trabados"** (rosa) con el negocio, la nota y "escaló hace X"; del lado del setter, el paso 4 muestra **"Ya avisaste a Franco"**. Confirmá que un trabado deja **marca visible** en el admin.
- **Telegram:** con `AgencySettings.osTelegram*` y env `TELEGRAM_*` vacíos, `/admin/leados` muestra el **banner ámbar** "Telegram sin configurar" con link a Ajustes. Configuralo y confirmá que desaparece.
- No corrí visual-qa con browser: ver el `EscaladasPanel`/indicador poblados exige **sembrar un lead escalado** en CONSTRUCCION sobre el **Neon dev compartido y driftado** — preferí no mutarlo más tras el lío de migración de arriba. Lo cubierto por mí: build + ESLint + invariante + migración aplicada limpia. Lo perceptual/funcional es tu sign-off (la consigna lo asignó así).

---

## Sprint 0.5.8 — Novedades dirigidas al setter (deja de volver a ciegas) · 2026-06-20

**El agujero:** el sistema notificaba SOLO a Franco. El setter volvía a ciegas a los handoffs del flujo invertido — (a) le asignaron un lead (modelo 100% pull, nada se lo avisaba), (b) Franco aprobó/rechazó su demo (no le llegaba nada → un lead aprobado podía quedar horas sin link, el momento caliente), (c) le **sacaron** un lead por reasignación (cabo que el sprint 0.5.3 dejó declarado para el setter saliente). Este sprint agrega a QUIÉN se avisa (el setter) + una superficie de novedades; **NO** cambia CUÁNDO se disparan los eventos.

**1 · Disparadores REUSADOS — no se tocó CUÁNDO (SENSIBLE-lite):**
- Los tres gates ya existían y quedaron intactos: la asignación es `assignLeadSetter` (admin, `requireSuperAdmin`); la aprobación/rechazo son `aprobarRevision`/`rechazarRevision` (admin, vía `transitionDossier` — el único chokepoint de stage); la reasignación deja su `OsLeadActivity` canal `SISTEMA` (rastro de 0.5.3, `registrarReasignacion`). **Cero líneas de transición/gate modificadas** — solo se agregó, después del write que ya persistía, una emisión de novedad dirigida.

**2 · Cómo se dirige al setter — modelo addressed `OsSetterNotice` (in-app), no Telegram:**
- **Por qué in-app y no Telegram al setter:** `sendTelegram` (sender ÚNICO, config-first/env-fallback) resuelve a UN solo chat (Franco). No hay chatId por setter, así que Telegram no puede alcanzarlo; el canal dirigido al setter es **in-app**. NO se duplicó el sender ni se dispararon Telegrams redundantes por handoffs que Franco mismo ejecuta. (Desbloquear Telegram-al-setter requeriría chatId por usuario — fuera de scope, anotado abajo.)
- **Modelo nuevo `OsSetterNotice`** (`setterId`, `leadId?`, `kind`, `title`, `body`, `read`, `createdAt`) + enum `OsSetterNoticeKind` (`LEAD_ASIGNADO`, `DEMO_APROBADA`, `DEMO_RECHAZADA`, `LEAD_REASIGNADO_SALIENTE`). **Addressed por `setterId`**, no derivado de la cartera: es la única forma de alcanzar al setter saliente (ver §3). Sibling de `OsLeadActivity`/`OsLeadSetterMeta`; **NO es un `OsLeadActivity`** → no toca el historial comercial del lead ni cuenta como contacto.
- **`title`/`body` se SNAPSHOTEAN al crear** (incluyen el nombre del negocio): el lector NUNCA re-lee el lead — clave para el saliente, que ya no puede verlo.
- Emisión fire-and-forget vía `emitirNovedadSetter` (NUNCA lanza): un fallo del aviso jamás revierte el handoff (ya persistido). El destinatario sale de la **regla única `destinatarioNovedad`** (no de un id pasado a mano), la MISMA que verifica el invariante.

**3 · El cabo 0.5.3 → 0.5.8 cerrado (el setter SALIENTE):**
- Al reasignar A→B, el lead deja de ser `assignedToId` de A: A ya **no lo ve en su cartera** ni en su historial (lo decía el comentario de `[leadId]/page.tsx`). Underivable por ownership → por eso el modelo es **addressed**. `assignLeadSetter` ahora emite, en el mismo bloque del rastro (solo si el dueño cambió de verdad): **entrante** → al nuevo dueño (`LEAD_ASIGNADO`), **saliente** → al dueño previo (`LEAD_REASIGNADO_SALIENTE`, `leadId: null`, sin link — no puede abrirlo). Cada extremo nulo (unassign / asignar desde nadie) se ignora solo.

**4 · La superficie de novedades en `/setter` (+ badge + demo en cola):**
- **`NovedadesPanel`** (server component, arriba de la cartera, incluso con cartera vacía: un setter que perdió su único lead igual ve el aviso de salida). Dos cosas distintas:
  - **Avisos dirigidos sin leer** = "qué cambió desde tu última visita" (el flag `read` ES el cursor de "última visita"); cada uno con ícono/color semántico (cyan asignación, esmeralda aprobada, rosa rechazada, zinc saliente), "hace X" y "Abrir" (salvo el saliente). Botón **"Marcar como vistas"** (server action `requireSetter`, sin id del cliente).
  - **"Tus demos esperando a Franco"** = `derivarDemosEnCola` (LIVE, cero campos nuevos) sobre los leads EN_REVISION de su cartera, "en cola hace X" con el MISMO `formatEspera` que ve Franco del otro lado. Es el dato que él ya tiene y el setter no veía.
- **Badge persistente en el topbar** (`contarNovedadesSinLeer`, lectura indexada y resiliente): el setter ve el conteo de pendientes desde cualquier ruta `/setter`, no solo el home.

**5 · El punto de aislamiento (lo central) + invariante ejecutable:**
- **Dos ejes, cada uno limpio:** el feed dirigido se filtra por **DESTINATARIO** (`ownSetterNoticeWhere` = `{ setterId }`); la cola en revisión por **DUEÑO ACTUAL** (`ownedListWhere` = `{ assignedToId }`). Son dimensiones distintas a propósito: el saliente ya no es dueño pero sí destinatario. La regla de a-quién-va (`destinatarioNovedad`) es ÚNICA, compartida por las actions y el invariante.
- **`SISTEMA` sigue EXCLUIDO de lo comercial:** mostrar novedades no reclasifica nada; la reasignación `SISTEMA` queda intacta y una `OsSetterNotice` ni siquiera es un canal de actividad (conjuntos disjuntos) → no puede inflar `_count.activities`, "último contacto" ni cadencia.
- **`check:invariant:novedades`** (DB-free, no "es obvio"): prueba ejecutablemente (1) aislamiento por `setterId` (A nunca alcanza a B), (2) dirección correcta — actual para asignar/aprobar/rechazar, **previo para el saliente** (en A→B el entrante B y el saliente A no se cruzan; extremo nulo → sin fila), (3) `esContactoComercial(SISTEMA)===false` + `SOLO_CONTACTOS_COMERCIALES` sin cambios + novedad-≠-canal. **PASA.**

**6 · ESLint + review adversarial:**
- **ESLint** limpio sobre los 10 archivos tocados (incluido el `aria-hidden` faltante en el `LogOut` pre-existente de `setter/layout.tsx`, corregido de paso). Cero `any`, cero `console.log` (el `console.error '… fallo no fatal'` espeja el patrón de `notify.ts`).
- **Review multi-lente (5 revisores, adversarial):** 0 CRITICAL, 1 HIGH confirmado → aplicado: `assignLeadSetter` ahora `revalidatePath('/setter')` (mismo contrato de invalidación que `revalidarRevision`). MEDIUMs aplicados: casts del invariante tipados, `aria-hidden` del LogOut. Rechazados con razón: import `.ts` (es la convención de los `*.invariant.ts` ejecutados por ts-node) y `router.refresh()` (espeja `lead-card-actions`/`cartera.actions`, que hacen revalidatePath + refresh).

**Arquitectura / Archivos:**
- **Nuevo:** `lib/leados/novedades.ts` (copy pura + writer addressed + lectores resilientes + `derivarDemosEnCola`), `lib/leados/novedades.invariant.ts` (+ script `check:invariant:novedades`), `setter/_actions/novedades.actions.ts` (marcar vistas), `setter/_components/novedades-panel.tsx` (server) + `novedades-marcar-visto.tsx` (client), `prisma/migrations/20260620190000_add_setter_novedades/`.
- **Editado:** `prisma/schema.prisma` (modelo `OsSetterNotice` + enum + relaciones virtuales en User/OsLead), `lib/leados/isolation.ts` (`ownSetterNoticeWhere` + `destinatarioNovedad` puros), admin `lead.actions.ts` (emite IN/OUT + revalida setter) y `revision.actions.ts` (emite al dueño), setter `page.tsx` (panel, reusa los leads ya cargados) + `layout.tsx` (badge topbar), `package.json`.
- **Sin tocar:** transiciones/gates (`transitionDossier`, `dossier.ts`), el rastro `SISTEMA` (`assignment-trail.ts`), la métrica comercial, el aislamiento existente, `sendTelegram` (no se duplicó), `HeroArtifact`/contextos frozen.

**Verificación:**
- ✅ **Invariante** `check:invariant:novedades` PASA (+ los otros 3 siguen verdes).
- ✅ **ESLint** limpio (10 archivos) · **`npm run build` verde** (type-check estricto, client de Prisma regenerado) · **`prisma migrate status` limpio** (68 migraciones).
- ✅ **Migración aditiva** `20260620190000_add_setter_novedades`: `CREATE TYPE` + `CREATE TABLE` + 2 índices + 2 FKs (setter Cascade, lead SetNull). **Sin ALTER/DROP sobre tablas existentes** (las relaciones en User/OsLead son virtuales). Aplicada sin reset (`db execute` + `migrate resolve --applied` + `generate`). `migrate status` lo confirmó limpio.
- ✅ **Verificación visual/runtime corrida POR MÍ** (dev:qa 3002, QA-login persona `setter`, novedades sembradas y luego purgadas): el panel rendea los 3 avisos con copy + acentos correctos, el **saliente sin link "Abrir"** (no puede abrirlo), la cola "esperando a Franco" con "en cola hace X días", el **badge "3"** en panel y topbar, y **"Marcar como vistas"** vacía avisos + ambos badges mientras la cola (live) persiste. Desktop + mobile, sin errores de cliente. (Bonus: cuando Neon hizo cold-start, el `error.tsx` del setter atrapó el fallo — la resiliencia del lector funciona.)

**Reglas absolutas del task (verificadas):**
- SENSIBLE-lite: **no se cambió CUÁNDO** (gates/transiciones intactos), solo a QUIÉN se avisa + la superficie. ✅
- Aislamiento #1: cada setter ve SOLO lo suyo (feed por `setterId`, cola por `assignedToId`); el saliente se alcanza por addressed, no por cartera. ✅
- `SISTEMA` excluido de lecturas comerciales; las novedades lo LEEN/derivan sin que cuente como contacto. ✅
- Se **reusó** `sendTelegram` (no se creó otro sender) — el canal al setter es in-app por el límite de chat único. ✅ Tipado estricto, cero `any`, un objetivo. ✅

**Pendientes / Verificación humana (Franco — funcional, tu sign-off):**
- **Asignar:** asigná un lead a un setter de test → en su `/setter` aparece "Te asignaron un lead" + badge.
- **Aprobar/Rechazar:** aprobá/rechazá su demo → ve "Franco aprobó tu demo — enviá el link ya" / "Franco pidió cambios" dirigido a él (no a ciegas).
- **Reasignar A→B:** el setter B ve "te asignaron"; el setter A (saliente) ve **"Te reasignaron un lead — ya no está en tu cartera"** (el cabo 0.5.3 cerrado), sin link.
- **Demo en cola:** con una demo suya EN_REVISION, ve "tu demo en cola hace X" (lo que vos ves del otro lado).
- **Desbloqueo futuro (fuera de scope):** para que estos avisos también lleguen por Telegram AL setter haría falta un chatId por setter (hoy `sendTelegram` es un único chat tuyo). Anotado por si lo querés en un próximo sprint.

---

## 0.5.9 — Carril de re-entrada "Continuá donde dejaste" (home del setter)

**Objetivo (uno):** el setter que vuelve no debería reconstruir mentalmente en qué andaba. Un carril/CTA arriba del home que lleva directo al lead correcto. **Solo presentación** — reusa el motor existente, cero motor nuevo de prioridad.

**1 · La señal elegida y por qué — `próxima acción más urgente`, NO `último lead tocado`:**
- El motor ya calcula el punto de re-entrada: `particionarCartera(leads).grupos.trabajar[0]`, el tope del carril "trabajar" ya ordenado por `ordenUrgencia` (respondió → caliente → resto, y a igualdad antigüedad). Por construcción ese tope es **siempre `accionable`** (el grupo "trabajar" es, por definición, lo que hay para hacer ahora).
- **Descarté "último lead tocado" por dos razones concretas:**
  - **No existe en los datos cargados.** `listOwnedLeads` no trae `updatedAt` del lead ni timestamps de actividad — solo `_count.activities`. Derivar recencia = query + orden nuevos = **motor nuevo de prioridad**, prohibido por el task.
  - **Recencia ≠ utilidad.** El último lead tocado puede ser uno recién parkeado ("esperando respuesta del negocio"), que es justo donde NO conviene retomar. La urgencia ya calculada apunta a "qué hacer ahora", que es lo que un setter que vuelve necesita.
- **Un solo origen:** el mismo `particion.grupos.trabajar[0]` alimenta el carril nuevo, el atajo de teclado `r` y el ancla oculta de "Recorrer". Los tres apuntan al MISMO lead → coherencia total.

**2 · Cómo se presenta:**
- Componente nuevo `continuar-cta.tsx` (presentacional puro): un `<Link>` a `/setter/leads/[id]?cola=trabajar` — el **MISMO destino que "Recorrer"/`r`**, así retomar **encadena el recorrido** en vez de cortarlo (entrás al lead y seguís con prev/next).
- Ubicado **arriba de todo** en `CarteraView`, antes de "De un vistazo". Render condicional: solo aparece si hay al menos un lead en "trabajar" (cartera calma sin urgencias → sin carril, sin ruido).
- Muestra: eyebrow "Continuá donde dejaste", `businessName` (truncado), `proximaAccion`, y el rótulo de motivo de orden (`motivoOrden`) como chip — oculto en mobile (`hidden sm:inline-flex`). Ícono `PlayCircle` + `ArrowRight` con micro-hover.
- **Disciplina B9:** es un CTA (navega, accionable) → **cyan justificado** (borde `cyan-400/25`, fondo `cyan-500/[0.06]`, barra de acento cyan a la izquierda — los mismos tokens que ya viven en las cards accionables de esta página). El chip de motivo va **neutro** (zinc): es informativo, no compite con la acción.

**Arquitectura / Archivos:**
- **Nuevo:** `setter/_components/continuar-cta.tsx` (presentacional, recibe el `HomeLead` ya elegido por el padre).
- **Editado:** `setter/_components/cartera-view.tsx` (deriva `const continuar = particion.grupos.trabajar[0]` — reusa el mismo tope que `r`/Recorrer — y renderiza el carril arriba de todo).
- **Sin tocar:** el motor (`flow.ts`: `particionarCartera`, `ordenUrgencia`, `proximaAccionPara`, `motivoOrden`), `listOwnedLeads`/aislamiento, `home.ts`, contextos/HeroArtifact frozen. Cero campos nuevos, cero query nueva.

**Reglas absolutas del task (verificadas):**
- **Solo presentación, cero motor nuevo:** el carril no calcula prioridad — consume `grupos.trabajar[0]` que el motor ya ordena. ✅
- **Aislamiento #1:** el lead sale de `particionarCartera` sobre `listOwnedLeads` (`assignedToId = userId`) — solo la cartera de este setter. ✅
- **B9:** CTA → cyan; rótulo informativo → neutro. ✅
- **Tipado estricto, un objetivo:** cero `any`, un solo objetivo. ✅

**Verificación:**
- ✅ **`npm run build` verde** (type-check estricto) · **ESLint limpio** sobre los 2 archivos (es el gate de formato real del repo — NO hay config de prettier; `npx prettier` corre con defaults y corrompe el estilo single-quote/no-semicolon, error detectado y revertido).
- ✅ **Render server-side confirmado por HTTP** (dev:qa 3002, QA-login persona `setter`, `/setter` → 200): el carril es el **primer hijo** del contenedor, arriba de "De un vistazo"; eligió **QA-B6 Gimnasio Atlas** con acción accionable "Demo aprobada — enviá el link (Paso 9)" (= tope de "trabajar"); `href` correcto a `…?cola=trabajar`; aria-label completo; todos los tokens cyan/glass presentes. (Bonus, esperado: primer hit a Neon fue cold-start 500, el retry dio 200.)

**Pendiente / Verificación humana (Franco — perceptual, tu sign-off):**
- **Capa de píxeles NO capturada:** el MCP `Claude_Preview` no está conectado en esta sesión (ni padre ni subagente `visual-qa` tienen browser). No cierro la perceptual a ciegas — queda para tu confirmación, que el task ya te asignaba ("Perceptual: lo confirmo yo").
- **Qué mirar:** volvé al home → el carril cyan "Continuá donde dejaste" arriba de todo lleva al lead correcto; contraste del eyebrow cyan legible; en mobile el nombre + acción truncan sin romper layout y el chip de motivo queda oculto.

---

## 0.5.10 — Señal de avance del setter "Tu semana" (home)

**Objetivo (uno):** el setter no tenía ninguna señal de que avanza — el laburo se sentía sin recompensa, aunque los datos del avance ya existían. Una señal **sobria** de progreso en el home (no gamificación, no ranking, no métrica de presión). **Solo presentación** de datos existentes.

**1 · Datos elegidos y por qué — 3 métricas event-timestamped, ventana móvil de 7 días:**
- **Contactos** → `OsLeadActivity.count` con `performedById = userId` + `SOLO_CONTACTOS_COMERCIALES` (excluye `SISTEMA`) + `createdAt ≥ desde`. Es la atribución **más fuerte de "suyo"**: lo hizo él (vale aunque el lead se haya reasignado después — el contacto fue suyo). Única lectura nueva (un `count` indexado por `[performedById, createdAt]`).
- **Demos enviadas** → derivada en memoria de `dossier.enviadaAt` (la marca canónica del envío B6) dentro de la ventana. **Cero query nueva** — ya viene en `listOwnedLeads`.
- **Reuniones agendadas** → derivada en memoria de `dossier.agendaJson` (`AgendaSchema`: `estado === 'AGENDADA'` + `agendadaAt ≥ desde`). `agendadaAt` lo estampa el propio setter al confirmar (`agenda.actions.ts:211`), así que la ventana es real. **Cero query nueva.**
- **Ventana MÓVIL de 7 días, no semana calendario:** decisión de bienestar — la semana calendario resetea a 0·0·0 cada lunes (vacío/castigador); la ventana móvil siempre refleja el laburo reciente.

**2 · Cómo se presenta (sobrio por diseño, cuidado del operador):**
- Componente nuevo `progreso-semana.tsx` (server component presentacional puro). Tira fina, **no** un dashboard de números grandes: eyebrow "Tu semana", chips `ícono · número · label` y "últimos 7 días" al margen. Glass de la página (`border-white/[0.06] bg-white/[0.02]`), un solo acento `emerald-300/70` (semántica "positivo/logro" ya usada para "Demos aprobadas"). Lucide `strokeWidth={1.5}`.
- **Sin metas, sin racha, sin comparación, sin trend** — solo un acuse de "esto laburaste".
- **Anti-presión:** se **oculta entera** si `total === 0` (setter nuevo ⇒ sin ceros que culpen); muestra **solo las métricas con valor > 0** (un "0 reuniones" no aparece, no naguea).
- Ubicado en `page.tsx` después de `NovedadesPanel`, antes de `OnboardingHint` — momento de "volviste, esto venís haciendo". Va a nivel de page (no dentro de `CarteraView`), así aparece aun con cartera vacía si el setter hizo contactos en la ventana.

**3 · ESLint limpiado (lo pedía el task) — `onboarding-hint.tsx:39` `set-state-in-effect`:**
- El patrón viejo `useState(false)` + `useEffect(() => setVisible(localStorage…))` disparaba la regla. **No** se puede arreglar con inicializador lazy de `useState`: leería `window` en SSR y rompería.
- Fix correcto: `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` — la lectura idiomática de un store externo (localStorage). El server-snapshot (`false`, oculto) evita el desajuste de hidratación; tras hidratar pasa al valor real. `dismiss` ahora hace `setItem` + notifica a los listeners. Misma UX, regla satisfecha, sin efecto.

**Arquitectura / Archivos:**
- **Nuevo:** `src/lib/leados/progreso.ts` — `derivarProgresoSemana` (pura, `ahora` inyectado, espejo de `derivarDemosEnCola`) + `getProgresoSemana(userId, leads)` (1 count resiliente, reusa los leads ya cargados). Reusa `SOLO_CONTACTOS_COMERCIALES` (isolation) y `AgendaSchema` (contracts).
- **Nuevo:** `src/app/(protected)/setter/_components/progreso-semana.tsx` (presentacional).
- **Editado:** `setter/page.tsx` (carga `getProgresoSemana` en `Promise.all` junto a novedades — ambas reusan `leads`, son independientes — y renderiza `<ProgresoSemana>`).
- **Editado:** `setter/_components/onboarding-hint.tsx` (fix ESLint `set-state-in-effect`).
- **Sin tocar:** schema (cero campos/migración nuevos), aislamiento, motor, frozen files.

**Reglas absolutas del task (verificadas):**
- **Solo presentación de datos existentes, cero motor/campo nuevo:** ✅ (3 fuentes ya existían; 1 sola lectura `count`, resto derivado).
- **Aislamiento #1 — la señal es del propio setter:** contactos por `performedById = userId`; demos/reuniones derivadas de `listOwnedLeads` (`assignedToId = userId`). ✅
- **Sin gamificación intrusiva / sin vanidad / bienestar del operador:** sin metas, sin ranking, sin racha; se oculta en cero; solo métricas positivas. ✅
- **Tipado estricto, un objetivo:** cero `any`, un solo objetivo. ✅

**Verificación:**
- ✅ **`npm run build` verde** (type-check estricto del proyecto) · **ESLint limpio y estricto** (`--max-warnings 0`) sobre los 4 archivos. El `set-state-in-effect` de `onboarding-hint.tsx` ya no aparece.

**Pendiente / Verificación humana (Franco — perceptual, tu sign-off):**
- **Capa de píxeles NO capturada.** Además, la tira **solo aparece con actividad del setter en los últimos 7 días** (por diseño se oculta en cero) — una captura significativa exige sesión de setter autenticada + datos sembrados recientes. El task ya te asignaba la perceptual ("lo confirmo yo").
- **Qué mirar:** con un setter que hizo contactos/demos/reuniones esta semana → la tira "Tu semana" aparece después de Novedades, sobria, sin sensación de presión ni vacío; un setter nuevo (sin actividad) **no** ve la tira ni ceros; contraste emerald/zinc legible; en mobile los chips envuelven sin romper layout.

---

## 0.5.11 — "Mis números" del setter (home)

**Objetivo (uno):** el setter no podía ver sus propios números — cuántos leads trabaja, su ratio descarte/avance — esos datos vivían solo del lado admin (`/admin/leados`). Darle al setter **SUS** métricas, scope propio: leads activos + ratio (la actividad ya la cubre "Tu semana"). **Solo presentación**, **reusando el cálculo existente**.

**1 · Qué cálculo se reusó — `calcularRatioSetters` tal cual (cero recálculo):**
- El ratio descarte/avance (total + ventana 30d) sale de `calcularRatioSetters(filas, ahora)` de `revision.ts` — **la misma función pura** que alimenta la cola de revisión del admin (`/admin/leados`) y la carga de asignación (`setter-carga.ts`). No se duplicó la lógica: se le pasan las filas del propio setter y se toma el único bucket que puede producir. `pctDescarte` también reusado.
- **De dónde salen las filas:** de los leads **ya cargados** por `listOwnedLeads(userId)` (filtrados por `assignedToId = userId`), parseando `dossier.evaluacionJson` con `EvaluacionSchema`. **Cero queries nuevas** — se deriva en memoria de la cartera que el home ya trae.

**2 · Qué métricas se muestran (sobrio, no comparativo):**
- **Leads activos** → conteo de leads **no terminales** (`leadActivo` = `status ∉ {CERRADO, PERDIDO}`), con el total de cartera como contexto ("3 de 5 en tu cartera").
- **Mi criterio · descarte vs avance** → evaluadas, % descarte, desglose descartes/avances + barra estática de proporción, sub-línea de últimos 30 días, y nota de "sin fecha" (pre-B5) cuando aplica. Si todavía no evaluó nada → hint sobrio, no ceros.
- **Decisión de diseño:** **NO** se muestra la alarma `alarmaNuncaDescarta` ("nunca descarta — revisar criterio"). Esa es una lectura de **gestión del admin**; al setter se le muestra su número, no un juicio. Mismo criterio anti-presión que "Tu semana".

**3 · Aislamiento (regla #1, doble candado — verificado por invariante ejecutable):**
- **Entrada (nivel query):** las filas vienen de `listOwnedLeads(userId)` = `ownedListWhere` = `{ assignedToId: userId }`. La cartera de A nunca alcanza la de B.
- **Atribución (nivel cálculo):** `filasCriterioPropio` etiqueta **cada** fila con el `userId` de la sesión, **nunca** con un id leído del lead — así `calcularRatioSetters` solo puede bucketear bajo el setter propio (a lo sumo UN setter, y es él). Aunque entrara una fila ajena, no hay camino para verla. Atribución por dueño ACTUAL, idéntica al admin.

**Arquitectura / Archivos:**
- **Nuevo:** `src/lib/leados/mis-numeros.ts` — módulo **puro y liviano** (sin `@/` en runtime, para que el chequeo de invariante lo alcance sin Neon): `calcularMisNumeros(leads, userId, ahora)` (core puro) + `derivarMisNumeros(leads, userId)` (estampa `ahora`, espejo de `buildHomeLeads`) + `filasCriterioPropio` (la garantía de atribución). Reusa `calcularRatioSetters`/`pctDescarte`/`leadActivo` de `revision.ts` y `EvaluacionSchema` de `contracts.ts`.
- **Nuevo:** `src/app/(protected)/setter/_components/mis-numeros.tsx` (presentacional puro, glass de la página, acento cyan, Lucide `strokeWidth={1.5}`, `role="img"` + aria en la barra). Se oculta si la cartera está vacía y sin criterio.
- **Nuevo:** `src/lib/leados/mis-numeros.invariant.ts` + script `check:invariant:mis-numeros` — chequeo ejecutable del aislamiento (doble candado) + correctitud del reuso (activos no terminales; ratio idéntico a `calcularRatioSetters`; ventana 30d; sin-fecha; cartera vacía).
- **Editado:** `revision.ts` — se movió acá `ESTADOS_TERMINALES` + `leadActivo` (única copia, módulo de métricas puro) para que tanto la carga del admin como los números del setter cuenten "activo" igual, **y** para que el invariante no arrastre `flow.ts` (que importa `@/lib/follow-up`).
- **Editado:** `setter-carga.ts` — ahora importa `ESTADOS_TERMINALES` de `revision.ts` (DRY; antes lo definía local).
- **Editado:** `setter/page.tsx` — `derivarMisNumeros(leads, userId)` (reusa los leads ya cargados) + `<MisNumeros>` **al pie** del home (reflexivo y secundario: no compite con el trabajo "de arriba para abajo"), solo en la rama con cartera.
- **Sin tocar:** schema (cero campos/migración), motor, frozen files, nav/shell.

**Reglas absolutas del task (verificadas):**
- **Aislamiento #1 — el setter ve SOLO sus números:** doble candado (entrada `assignedToId` + atribución por sesión), constatado por `check:invariant:mis-numeros`. ✅
- **Reusar `calcularRatioSetters`, no duplicar:** el ratio sale de la misma función pura; el invariante asserta `numeros.criterio.total === calcularRatioSetters(...).total`. ✅
- **Tipado estricto, un objetivo:** cero `any`, un solo objetivo. ✅

**Verificación:**
- ✅ **`npm run build` verde** (type-check estricto, compila `/setter`) · **ESLint limpio** sobre los 6 archivos del scope · **`check:invariant:mis-numeros` verde** + los 3 invariantes hermanos (novedades / escalamiento / setter-meta) siguen verdes tras mover `ESTADOS_TERMINALES`.

**Pendiente / Verificación humana (Franco — funcional, tu sign-off):**
- **Capa de píxeles NO capturada** (la sección con datos reales exige sesión de setter autenticada + cartera con evaluaciones sembradas). El task ya te asignaba la funcional ("lo confirmo yo").
- **Qué mirar:** el setter ve SUS leads activos y SU ratio al pie del home; **no aparece nada de otro setter** (logueá con dos setters distintos: cada uno ve solo lo suyo); un setter sin evaluaciones ve el hint, no ceros; en mobile las dos tiles apilan sin romper layout.

---

## ✅ 0.5.12 — Al abrir el lead, caer en el paso activo (no arriba de todo)   ·   2026-06-20

**Problema:** al abrir un lead, el setter caía en el tope del wizard y tenía que scrollear/buscar en qué paso estaba — pero el estado real ya lo sabe el dossier (`stage`) y el stepper canónico de 5 etapas. Este sprint **lleva el foco a la sección del paso activo al abrir**. **Solo presentación/navegación interna:** cero cambio de gates, stage, server-actions, schemas. Tipado estricto, cero `any`. Un objetivo.

**Cómo se determina el paso activo (deferir al stepper, no re-derivar):**
- La verdad de "dónde está el lead" es `pasoActual(stage)` (`dossier-stepper.tsx`, canónico FG-0) — se **exportó** para reusarla como **fuente única**. El `stage` nombra el hito cumplido; el índice apunta al SIGUIENTE paso accionable: `null/FICHA→0` · `EVALUADA/DESCARTADA→2` · `BRIEF/CONSTRUCCION/RECHAZADA→3` · `EN_REVISION→4` · `APROBADA→5` (el `1` no ocurre: no hay stage "en evaluación").
- `anchorActivo(stage)` en `lead-wizard.tsx` es **glue de presentación** sobre ese índice → a qué sección del wizard aterrizar:
  - `0` (lead nuevo) → `null` = **no scrollea**, se queda en el tope natural con la cabecera del lead a la vista.
  - `2` (EVALUADA) → «brief». `3` y `4` (BRIEF/CONSTRUCCION/RECHAZADA · EN_REVISION) → «construccion» (la 5.ª etapa Revisión es de Franco, sin step del setter: su build entregado vive en construcción).
  - `5` (APROBADA) → «seguimiento» (ahí vive el envío del link).
  - `DESCARTADA` → «evaluacion» (brief/construcción/seguimiento no se renderizan; el foco útil es el veredicto).
- **No se re-implementa el flujo:** el "paso activo" lo decide siempre `pasoActual`; `anchorActivo` solo traduce índice→sección. No toca `gateBriefAbierto` ni ninguna transición.

**Cómo se aterriza (`step-anchor.tsx`, nuevo):**
- `StepAnchor` envuelve la sección y, si es la activa, se trae a sí misma al viewport con `ref.scrollIntoView({ block:'start', behavior:'auto' })` (salto instantáneo en el mount, sin pelear con la restauración de scroll). Se envuelven 4 secciones: evaluación, brief, construcción, seguimiento. Ficha queda sin envolver (lead nuevo = tope natural).
- **Robusto a la duplicación responsive del wizard** (documentada en B0.4: una copia vive bajo un ancestro `display:none`): el guard `el.offsetParent === null` detecta esa copia y la saltea (su scroll sería no-op) → **solo enfoca la copia visible**. No depende de `id`/`getElementById` (que podría resolver la copia oculta). El scroll-container es `<main className="relative overflow-y-auto">` (ancestro posicionado) → la copia visible siempre tiene `offsetParent` no-null.
- `scroll-mt-24` en el wrapper deja la cabecera por debajo del recorrido sticky (modo cola) y da aire en modo isla. El wrapper es un `div` de bloque sin margen propio → el `space-y-5` del wizard no cambia (sigue espaciando entre hijos directos).

**Compatibilidad (sin romper recorrido 0.5.6 ni atajos 0.5.7):**
- **Recorrido de cola (`?cola=`):** las deps del efecto son `[active, leadId]` → re-enfoca al **cambiar de lead** (prev/next, `leadId` cambia) y al **avanzar de stage** en sesión (`active` cambia). **NO** re-scrollea en cada `router.refresh()` de autosave (mismo `leadId`/`active`). Modo isla (sin `?cola=`): funciona igual, sin recorrido sticky.
- **Atajos de teclado (`j/k/→/←/b`, `?`):** intactos — viven en `recorrido-strip.tsx` y `cartera-view.tsx`; este sprint **no agrega ningún keyhandler** ni toca esos componentes. El aterrizaje es por efecto de mount/nav, independiente del teclado.

**Matiz declarado (deferencia estricta al stepper):** para `EVALUADA` el paso canónico es «Brief» (gated hasta que el lead responda), con el opener/seguimiento **justo arriba** en el DOM. Se aterriza en «brief» por deferir al stepper (no re-interpretar el flujo). Si en la verificación humana se prefiere que los leads en outreach (EVALUADA) caigan en el **opener**, es un ajuste de 1 línea en `anchorActivo` — pero es una decisión de interpretación del flujo, tuya, no la asumo.

**Arquitectura / Archivos:**
- **Nuevo:** `step-anchor.tsx` — wrapper cliente, puro de presentación (scroll + guard de copia oculta).
- **Editado:** `lead-wizard.tsx` — `anchorActivo` + 4 secciones envueltas en `<StepAnchor>`; import de `pasoActual`/`StepAnchor`.
- **Editado:** `dossier-stepper.tsx` — `export` de `pasoActual` (antes module-private); cero cambio de comportamiento del stepper.

**Verificación (gate ECC — tooling real del repo es ESLint, no Prettier):**
- ✅ `tsc --noEmit` limpio · ✅ `eslint` limpio sobre los 3 archivos · ✅ `npm run build` verde (`/setter/leads/[leadId]` compila) · ✅ `prisma migrate status` up to date (68 migs).
- ✅ **react-reviewer**: *Approve*, sin CRITICAL/HIGH. Confirmó: el truco `offsetParent` para la copia `display:none`; deps `[active, leadId]` disparan en open/prev-next/avance y bailan en refresh; reglas de hooks y SSR OK; el wrapper no rompe `space-y-5`; switch de `anchorActivo` exhaustivo. Las 2 notas LOW (maintainability) se aplicaron como comentarios.

**Pendiente / Verificación humana (Franco — funcional, tu sign-off; el task ya te la asignaba: "lo confirmo yo"):**
- **Capa de runtime NO capturada** acá (exige sesión de setter autenticada + leads sembrados en cada stage; en pantallas pesadas de LeadOS el dev:qa tiene hidratación inestable → mirar sobre prod-QA).
- **Qué mirar:** abrir un lead a mitad de proceso (BRIEF/CONSTRUCCION → cae en «Construcción»; APROBADA → «Seguimiento»; EVALUADA → «Brief», con el opener apenas arriba; DESCARTADA → el veredicto) → **cae en el paso activo, no arriba de todo**; un lead nuevo (FICHA) se queda en el tope con la cabecera visible; el **recorrido de cola** (prev/next) re-enfoca al lead nuevo; los **atajos** (`j/k/→/←/b/?`) siguen andando; modo isla (sin `?cola=`) aterriza igual.

---

## ✅ 0.5.13 — Timeline del lead: la "memoria del lead" en el detalle del setter   ·   2026-06-21

**El agujero (lo que esta bitácora ya anotaba):** el setter no tenía vista cronológica de qué le pasó a un lead. La memoria estaba dispersa en conteos derivados (`contactos`, `ultimoContacto`) y un banner de "te asignaron" que solo muestra la ÚLTIMA reasignación. Los eventos YA viven en `OsLeadActivity` (contactos comerciales + el canal `SISTEMA` de reasignación, 0.5.3). Este sprint los **PRESENTA** como timeline. **Solo presentación: cero eventos nuevos, cero cambios de conteos/gates.** Un objetivo, tipado estricto, cero `any`.

**Cómo se arma el timeline (lectura NUEVA y SEPARADA):**
- `listOwnedLeadTimeline(leadId, userId)` (`lib/leados/timeline.ts`, nuevo) trae TODO el historial del lead, del más nuevo al más viejo, **sin** el filtro `SOLO_CONTACTOS_COMERCIALES` → incluye los eventos `SISTEMA`. Es deliberadamente SEPARADA de `listOwnedLeadActivities` (que sigue filtrando comercial porque alimenta `contactos`/cadencia/gate — esa NO se tocó).
- En `page.tsx` se suma como 5.º fetch del `Promise.all`. `outreach.contactos` (= `actividades.length`), `countFollowUps` y `ultimoContacto` **siguen leyendo `actividades`** (solo comercial) — el timeline no toca esas derivaciones.
- `lead-timeline.tsx` es un **Server Component puro de presentación**: rinde la cronología debajo del wizard. Sin estado ni client JS; fechas absolutas es-AR (`Intl.DateTimeFormat`, evita `Date.now()` en render).

**Distinción sistema vs. comercial (visual y explícita):**
- **Contacto comercial:** nodo sólido + ícono de canal, etiqueta del canal, badge de resultado tonal (Respondió / Sin respuesta / …), nota, y quién lo registró.
- **Evento de sistema (`SISTEMA`):** nodo de **anillo punteado**, ícono `Repeat2`, etiqueta "Reasignación" + pill **"Sistema"**, la nota ("Reasignado: X → Y"), **sin** badge de resultado, y caption explícito *"Evento del sistema — no cuenta como contacto comercial."* Se lee de un vistazo y deja escrito que no es un contacto. El criterio sistema/comercial NO se duplica: sale de `esContactoComercial` (isolation.ts), la misma fuente que usan los conteos.

**El uso del índice — y una corrección honesta a la nota de Parte 1:**
- El timeline per-lead lo sirve **`@@index([leadId, createdAt])`** (range por lead + orden por fecha), NO el índice "T6" `@@index([performedById, createdAt])`.
- **Por qué NO T6:** la nota de FG-0.5 Parte 1 (más arriba: *"el timeline ordena OsLeadActivity por performedById + createdAt"*) imaginaba un timeline **por-performer** (la actividad propia del operador). Pero ESTE timeline es **per-lead** y DEBE mostrar la reasignación (`SISTEMA`), que la registra el **admin** (`performedById` = admin, no el setter). Un timeline keyed por el `performedById` del setter dejaría AFUERA justo la reasignación → la consigna no se cumpliría. Por eso keyea por `leadId`.
- **T6 igual gana su lugar:** sirve las lecturas **por-performer** que sí existen — `contarDmsHoy` (capa de seguridad de canal) y "Mis números" (0.5.11). El par `[leadId, createdAt]` + `[performedById, createdAt]` cubre los dos ejes; el timeline usa el primero. **Sin cambio de schema** (ambos índices ya existían). Anotado para no atribuir mal el índice — es una decisión de lectura, no de Franco.

**Punto de aislamiento (#1):**
- `listOwnedLeadTimeline` pasa por **`getOwnedLead`** (= `ownedLeadWhere(leadId, userId)` = `{ id, assignedToId }`): un lead ajeno o inexistente → `null` (404-style, sin leakear), igual que toda superficie del setter. El where del historial (`timelineActivityWhere`, nuevo en isolation.ts) es **lead-scoped** (`{ leadId }`) y se aplica DESPUÉS del gate. Mostrar el historial no abre ninguna puerta nueva.

**Test de invariante (con el check, no "es obvio") — `npm run check:invariant:timeline`** (`lib/leados/timeline.invariant.ts`, puro, sin DB):
- **(a) Aislamiento:** el gate `ownedLeadWhere` restringe al dueño; el where del timeline keyea por `leadId` y **NO** por `performedById` (pin explícito: keyear por performer perdería la reasignación SISTEMA — el caso que el timeline debe mostrar).
- **(b) SISTEMA se muestra pero NO cuenta:** `SOLO_CONTACTOS_COMERCIALES` sigue intacto y excluye SISTEMA; el where del timeline NO lleva filtro de canal (incluye SISTEMA); y el conteo que abre Seguimiento da IGUAL con o sin la fila SISTEMA (la reasignación aporta 0; un lead con solo eventos de sistema cuenta 0). → **PASA.** Los otros 5 invariantes de `lib/leados` siguen verdes (el módulo puro `isolation.ts` se extendió, no se rompió).

**Verificación (gate ECC + build + smoke autenticado):**
- ✅ `eslint --max-warnings 0` sobre el scope → cero findings (el `react-hooks/static-components` que pega contra `const Icon = fn()` se resolvió con `<IconoCanal>` de JSX estático).
- ✅ `tsc --noEmit` limpio · ✅ `npm run build` verde (`/setter/leads/[leadId]` compila).
- ✅ **Smoke HTTP autenticado sobre dev:qa** (curl, sin depender de hidratación — patrón documentado): login persona `setter`; 7 leads → **HTTP 200** con la sección "Historial del lead". Con una fila `SISTEMA` sembrada (idéntica a la que crea `registrarReasignacion`, borrada después), el HTML mostró el contacto **Instagram DM** Y la **"Reasignación"** con pill "Sistema" + el caption "no cuenta como contacto".
- ✅ **Prueba del gate en runtime (la mitad funcional que pedía la consigna):** sobre un lead limpio (0 contactos, Seguimiento bloqueado), sembrar un ÚNICO evento `SISTEMA` → el timeline lo muestra (deja de estar vacío) **y Seguimiento sigue BLOQUEADO** ("Se abre cuando registrás el primer contacto"). El evento de sistema se ve pero no abrió el paso. Datos de prueba borrados; DB dev restaurada (el lead limpio vuelve a vacío, 0 filas test).

**Reglas absolutas del task (verificadas):**
- Solo presentación: muestra eventos existentes, no crea ninguno (el único write fue la fila de prueba, ya borrada). ✅
- Aislamiento #1: el timeline pasa por `getOwnedLead`. ✅
- `SISTEMA` se MUESTRA pero NO cuenta como contacto (conteos/gates intactos) — constatado ejecutable + en runtime. ✅
- Tipado estricto, cero `any`, un objetivo. ✅

**Arquitectura / Archivos:**
- **Nuevos:** `lib/leados/timeline.ts` (lectura), `lib/leados/timeline.invariant.ts` (check), `setter/leads/[leadId]/_components/lead-timeline.tsx` (componente), `.../lead-timeline.helpers.ts` (etiquetas/tonos LOCALES — no se importan los del admin: superficies con lenguaje de diseño propio, y el helper del admin está fuera de scope).
- **Editados:** `lib/leados/isolation.ts` (+`timelineActivityWhere`, puro), `setter/leads/[leadId]/page.tsx` (5.º fetch + serialización + render), `package.json` (script del invariante).

**Verificación humana (Franco — funcional, tu sign-off; el task: "lo confirmo yo"):**
- Abrir un lead con historial → ver la cronología: contactos (canal/resultado) y reasignaciones (pill "Sistema", anillo punteado) **distinguibles de un vistazo**.
- Confirmar que un evento de sistema **no** abre Seguimiento (ya verificado en runtime arriba; tu sign-off perceptual cierra).

---

## 🏁 FG-0.5 COMPLETO — cierre del bloque (cabina del operador + handoffs del flujo invertido)   ·   2026-06-21

Cierra el **BLOQUE FG-0.5** entero, para el postmortem de FG-1. El bloque llevó la cabina del setter de "modelo 100% pull, vuelve a ciegas" a una superficie con orientación, memoria y aislamiento testeado.

**Las piezas (Parte 1 + 3 admin + 7 del setter):**
- **Parte 1 — Índices** (cabina del operador): 2 compuestos aditivos (`OsLead[assignedToId, nextFollowUpAt]` + `OsLeadActivity[performedById, createdAt]`). El de actividad sirve las lecturas **por-performer** (cadencia / "mis números"), no el timeline per-lead — corregido y documentado en 0.5.13.
- **3 admin** (commit `feat(fg-0.5 admin)`): pipeline de producción (A1) · drill-down de métrica (A4) · carga del setter visible en la asignación (A2).
- **7 del setter:** rastro de reasignación visible (`SISTEMA`, 0.5.3) · sender único de Telegram (prep) · novedades dirigidas al setter (0.5.8, cierra el cabo del saliente) · "Continuá donde dejaste" (0.5.9) · "Tu semana" (0.5.10) · "Mis números" (0.5.11) · caer en el paso activo (0.5.12) · **timeline del lead (0.5.13)**.

**El hilo conductor (lo que el bloque protegió, invariante por invariante):**
- **Un solo eje de aislamiento, en un solo lugar.** `lib/leados/isolation.ts` quedó como fuente única: `ownedLeadWhere`/`ownedListWhere` (cartera por `assignedToId`), `ownSetterMetaWhere`/`ownSetterNoticeWhere` (dato dirigido por `setterId`), `SOLO_CONTACTOS_COMERCIALES`/`esContactoComercial`/`timelineActivityWhere` (separación sistema/comercial). Cada feature nueva pinchó de acá, no reinventó el filtro.
- **El evento `SISTEMA` es memoria, no contacto.** Se introdujo en 0.5.3 y atravesó todo el bloque sin contaminar un solo conteo: `_count.activities` filtrado, cron "último contacto", el gate `activo = contactos > 0`, y ahora el timeline (lo MUESTRA sin contarlo). **6 invariantes ejecutables** (`assignment-trail`, `setter-meta`, `escalamiento`, `novedades`, `mis-numeros`, `timeline`) lo constatan **sin DB** — no es "obvio", es chequeable.
- **Disciplina de color B9 y numeración única** (heredadas de FG-0): cyan = accionable; el resto informativo por semántica. El timeline es informativo (zinc/punteado), no compite con el wizard.

**Para el postmortem de FG-1:**
- **Deuda declarada que entra a FG-1:** (1) el **drift DB↔schema** pre-existente (`chatbot_lead.convertedToOsLeadId`, enum `AuditActionType`) que haría que un `migrate dev` quiera resetear — reconciliar con migración aditiva ANTES de cualquier `migrate dev`; (2) **FG-1.0 fuente única de contenido** — los textos del setter quedaron localizados a propósito, a migrar cuando exista.
- **Patrón que FG-1 hereda:** descubrimiento con subagente `Explore` → módulo puro + invariante ejecutable por cada regla de aislamiento → verificación por **smoke HTTP autenticado** (dev:qa, sin hidratación) cuando la pantalla es auth-gated. Es lo que mantuvo el bloque honesto.
- **Estado:** las 11 piezas compilan (build verde), tipado estricto, 6 invariantes verdes. La verificación **perceptual** de cada superficie queda en la cola de sign-off de Franco — declarada pieza por pieza, nunca cerrada a ciegas.

---

## ✅ FG-1.pre — Cierre del drift DB↔schema (la deuda que un `migrate dev` resetearía)   ·   2026-06-21

**Por qué primero:** FG-0.5 dejó declarado un drift pre-existente que haría que un `prisma migrate dev` quisiera RESETEAR la DB dev (la catástrofe prohibida). FG-0.5 lo esquivó usando siempre `migrate deploy`, pero no lo cerró. FG-1 puede tocar migraciones → esto va ANTES.

**Diagnóstico (read-only primero — no asumir que el drift declarado sigue vivo):**
- `migrate status` daba **verde** (68 migs, "up to date") — pero eso solo compara archivos vs `_prisma_migrations`, **esconde** el drift físico.
- El detector real, `migrate diff --from-schema-datasource → --to-schema-datamodel`, mostró **9 divergencias**, todas del tipo "la DB tiene algo que el schema ya NO declara":
  - `AgencySettings.singleton` (+ índice único `AgencySettings_singleton_key`)
  - `Organization`: `avatarEmoji`, `avatarImageUrl`, `avatarInitials`, `city`, `deletedAt`, `internalNotes` (6 columnas)
  - `chatbot_lead.convertedToOsLeadId`
- **El enum `AuditActionType` ya NO aparece** → esa mitad del drift FG-0.5 sí la había cerrado (reconciliación `BOT_DELETED`). El resto seguía vivo, y **el drift era MÁS grande de lo declarado** (las 6 de Organization + el singleton no estaban en la nota original).

**Por qué seguían (las dos causas raíz):**
- **`convertedToOsLeadId`:** ya existía la migración `20260619140100_drop_chatbot_lead_converted_column` y estaba **marcada como aplicada** — pero el diff la seguía mostrando física. Causa: se resolvió con `migrate resolve --applied` **sin ejecutar el SQL** (para no disparar el shadow-DB) → el DROP nunca corrió.
- **Las 6 de Organization + el singleton:** ninguna migración de la historia las **agrega** (grep en `prisma/migrations`) → entraron out-of-band (db push temprano / migración squasheada). Son vestigios pre-refactor: avatar migró a `BotConfig`, `city` a la creación de bot, `internalNotes` a `OnboardingTask`/`chatbot_lead` (ahí el schema SÍ las define y el código las usa); el soft-delete (`deletedAt`) nunca se adoptó en este modelo.

**Decisión por divergencia (criterio: DB tiene algo que el schema no quiere → DROP):** las 9 son DROP. Ninguna es ADD (el schema no quiere ninguna). Confirmado que **ningún código las lee**: los tipos del client salen del schema y el **build estaba verde** → un `organization.avatarEmoji` sería error TS. (Las refs en `src` a esos nombres son a OTRAS entidades: BotConfig, OnboardingTask, chatbot_lead — desambiguadas por grep.)

**Cambio de datos consciente (reportado ANTES del drop — regla del task):** conteo read-only sobre la DB dev (`ep-quiet-waterfall`, branch dev, NUNCA prod): 4 columnas con dato — `Organization.avatarEmoji`×1, `Organization.city`×1, `Organization.internalNotes`×1 (sobre 9 orgs) y `AgencySettings.singleton`×1 (flag). `deletedAt`×0 (no se perdió ningún registro soft-deleted), `convertedToOsLeadId`×0, el resto 0. Todo dev/seed muerto (ni schema ni código lo alcanzan). **Franco aprobó "DROP todo (alinear)"** antes de ejecutar.

**La reconciliación (1 migración aditiva, idempotente, aplicada SIN reset):**
- `20260621120000_reconcile_dev_drift_schema_align`: `DROP INDEX IF EXISTS` + `DROP COLUMN IF EXISTS` para las 9 divergencias.
- **Idempotente → correcta en ambos sentidos:** DB dev driftada (las columnas existen → las dropea) Y DB reconstruida desde la historia (la historia nunca las agrega → el DROP es no-op por el guard `IF EXISTS`). El drop de `convertedToOsLeadId` repite el de `20260619140100` a propósito: ese quedó resuelto sin ejecutar; este lo cierra física.
- Aplicada con **`migrate deploy`** (no usa shadow-DB, no puede resetear). **Nunca** `migrate dev`/`reset`.

**Cierre (criterio: diff live→schema VACÍO):**
- ✅ `migrate diff --from-schema-datasource → --to-schema-datamodel` ahora **VACÍO** (`-- This is an empty migration.`).
- ✅ `migrate status` up to date (69 migraciones) · ✅ `prisma generate` OK · ✅ `npm run build` verde.

**Verificación humana (Franco):** un futuro `prisma migrate dev` ya **no querrá resetear por este drift** (la causa física desapareció: schema y DB dev coinciden 1:1). Queda como deuda separada de FG-1.0 la fuente única de contenido del setter (sin relación con migraciones).

---

## ✅ FG-1.1 — Onboarding del setter: enseñar el flujo INVERTIDO (que no choque contra el gate score-3)   ·   2026-06-21

**El agujero:** el card "Cómo funciona" del home del setter (`setter/_components/onboarding-hint.tsx`) era el único lugar que forma el modelo mental inicial, y era **silencioso sobre la pieza más contraintuitiva del sistema**: el flujo es INVERTIDO (opener ANTES que demo; esperás la respuesta; recién si el negocio responde se construye la demo — excepción: caliente score 4–5 produce preventivo). Resultado: un setter nuevo llegaba a su primer lead score-3 esperando construir la demo y chocaba contra un gate que su mapa no le anticipó.

**Diagnóstico (releer antes de tocar — la nota lo pedía):** el contenido literal de "4 pasos lineales / paso 4: «Construcción, revisión y envío llegan en los próximos pasos»" YA no existía: **0.5.10 lo había reemplazado** por 3 tarjetas de orientación de navegación ("trabajá de arriba para abajo", "seguí el panel", "el estado manda") al arreglar el ESLint con `useSyncExternalStore`. Pero esas 3 tarjetas, siendo correctas, **no nombraban el opener ni la espera** → el agujero del modelo mental seguía abierto. El problema era real aunque el síntoma textual ya no.

**Fuente de verdad del flujo invertido (no se reinventó — se leyó):**
- `lib/leados/flow.ts` → `gateBriefAbierto(status, score) = leadRespondio(status) || score >= 4`: la producción (brief→construcción) se abre solo si el negocio respondió **o** el lead es caliente (4–5). Score 1–3 sin respuesta = gate cerrado (el caso que sorprende).
- `lead-wizard.tsx` (comentario líneas 176–179): "el opener sale apenas hay veredicto, y la producción se abre recién cuando la conversación lo habilita". El orden real del DOM: Ficha → Evaluación → **Opener** → Seguimiento (espera) → Agenda → Brief (gated) → Construcción → Draft.
- La cadencia de follow-up la calcula la maquinaria (`calculateNextFollowUp` + cron), no el setter; el link va SIEMPRE en el 2.º mensaje, nunca en el opener (`contieneLink` hard-block).

**Qué enseña ahora (4 tarjetas honestas, sin tour, SIN numerar el flujo — regla heredada de 0.5.10 para no duplicar/contradecir al stepper):**
1. **El score del Evaluador marca el camino** — puntaje 1–5; decide frío (la mayoría) vs caliente (4–5), y eso cambia el ORDEN.
2. **Frío: primero el opener, no la demo** — opener corto sin link ni precio; la demo todavía NO se construye; la producción se abre recién si responde.
3. **La espera es parte del laburo** — esperás; la maquinaria avisa el próximo seguimiento (vos no llevás fechas); si un paso del panel está apagado, no es su momento (absorbe la orientación de navegación de 0.5.10).
4. **Caliente (4–5): podés adelantar la demo** — la excepción; preventivo sin esperar; para el resto (1–3), primero la conversación (cierra la sorpresa del score-3).
- **Línea clave (alto retorno), banda dedicada con ícono `Megaphone`:** *"Ojo: la demo se construye DESPUÉS de que el negocio responde — primero va el opener."*

**Disciplina B9 (heredada FG-0):** cyan = accionable. La banda clave se enfatiza por **layout/peso** (borde + ícono + negritas en "Ojo/DESPUÉS"), NO por color — cyan queda solo en el acento izquierdo + eyebrow (identidad de guía existente del card). Nada acá es un CTA falso.

**Reglas absolutas del task (verificadas):**
- Solo contenido + estructura: cero lógica/gates/datos. El mecanismo first-run (`useSyncExternalStore`/localStorage/`dismissOnboarding`) NO se tocó. ✅
- El onboarding refleja el flujo REAL invertido, no el viejo lineal. ✅
- Tipado estricto, cero `any`, un objetivo. ✅

**Arquitectura / Archivos:**
- **Editado (único):** `onboarding-hint.tsx` — array `ORIENTACION` (3) → `FLUJO` (4, contenido del flujo invertido); eyebrow "Antes de tu primer lead" + h2 "Cómo funciona el flujo invertido"; grid `sm:grid-cols-2` (2×2, antes 3-col); banda clave nueva con `Megaphone`; import del ícono; comentarios reescritos (mantienen la regla "no numerar el flujo"). Mecanismo first-run intacto.

**Verificación (gate ECC + build + runtime visual):**
- ✅ `eslint --max-warnings 0` sobre el archivo → cero findings · ✅ `tsc --noEmit` limpio · ✅ `npm run build` verde.
- ✅ **Runtime sobre dev:qa (3002)**, sesión `setter` por `/api/qa/login`: el card renderiza en `/setter` con el h2 "Cómo funciona el flujo invertido", las 4 tarjetas y la banda "Ojo:". **Desktop (1600)**: grid 2×2 + banda full-width + dismiss, coherente. **Mobile (480)**: las 4 tarjetas apilan a 1 columna, textos completos sin desbordar, la banda clave legible. Cero errores de consola.
- ✅ **Mecanismo first-run constatado en runtime:** click en "Entendido, no lo muestres más" → la card desaparece (re-render) y `localStorage['leados-onboarding-v1'] === '1'`. El `useSyncExternalStore` que dejó 0.5.10 sigue andando.

**Verificación humana (Franco — perceptual, "lo confirmo yo"):** leer el card como setter nuevo → se entiende que el opener va antes que la demo y que un score-3 espera la conversación antes de producir; el first-run sigue ocultándose al cerrarlo.

---

## ✅ FG-1.0 — Fuente única del contenido de guía (`guidance-content.ts`) + ficha del Paso 1 migrada como prueba   ·   2026-06-21

El cimiento que faltaba: si cada paso de guía hardcodea su contenido, diverge de la capacitación cuando se actualice — el problema al revés. Este sprint crea **UN módulo de contenido tipado y editable**, separado de los componentes, y lo prueba migrando la ficha del Paso 1 (el modelo de guía bien hecha). **Solo contenido + presentación**: cero lógica, gates, queries. Tipado estricto, cero `any`, un objetivo.

**Estado real encontrado (descubrimiento — los precedentes que la nota pedía mirar):**
- **Patrón "única copia editable" ya establecido** (a clonar): `herramientas.ts` (FG-1.AI) y `flow.ts` (`SHELL_CONSTRUCCION`, `CANAL_INSTAGRAM`, `HARD_CHECKS`) — constantes puras, sin Prisma ni `'use server'`, importables por client y server; "la UI lo consume tal cual, Franco edita SOLO la constante". `herramientas.ts` se declara explícitamente **hermano** de este 1.0: aquel registra las herramientas EXTERNAS (qué son / dónde se abren / URLs), este la guía del PASO. No se fusionan.
- **Modelo de guía bien hecha** (a clonar en calidad): `ficha-step.tsx` (Paso 1) — jerarquía clara, hints concretos, ejemplos esto-sí en los placeholders, lenguaje sin jerga, modo congelado `<details>`. Hardcodeaba ~30 strings de guía: título, encuadre (con «ves» en negrita), duración, 7 labels + 7 hints + 5 ejemplos + 4 labels de opción, mensajes de validación, copy del bloque y del modo congelado.
- **Consumidores futuros que el esquema debe cubrir:** 1.1 (teach/porqués), 1.2 (ejemplos esto-sí/esto-no), 1.3 (validación de calidad), FG-4 (razones de self-check).

**Esquema elegido (`src/lib/leados/guidance-content.ts`, nuevo) — tipos + registro:**
- **Primitivas:** `Segmento`/`LineaRica` (copy con fragmentos enfatizados — la primitiva que preserva el «ves» en negrita sin volver a meter markup en el componente; la reusa el teach de 1.1). `CampoOpcion` (value del dominio + label).
- **`CampoGuia`** (label + `hint` [teach] + `ejemplo` [esto-sí] + `opciones`) — lo que usa la ficha hoy.
- **`PasoGuia`** (guía completa de un paso): `titulo` + `intro` mínimos; opcionales `porque` [teach·1.1], `campos`, `ejemplos: EjemploContrastado[]` [1.2], `validacion: ValidacionGuia` [1.3], `selfCheckRazones: SelfCheckRazon[]` [FG-4], `copyBlock`, `congelada`.
- **Cobertura por sprint:** `LineaRica`/`porque` → **1.1**; `EjemploContrastado` (tema + asiSi + asiNo + porque) → **1.2**; `ValidacionGuia` → **1.3**; `SelfCheckRazon` (checkId casa con `HARD_CHECKS`/`SOFT_CHECKS`) → **FG-4**. Cada tipo tiene un consumidor nombrado — sin abstracción especulativa (no CMS, no i18n, no DB).
- **Registro `GUIA_PASOS: Partial<Record<GuiaPasoId, PasoGuia>>`** — hoy solo `{ ficha }`. `Partial` deliberado: declara honestamente qué pasos YA tienen guía, sin claves vacías (misma disciplina "no inventar destinos" de la nav del setter). `GuiaPasoId` enumera los pasos REALES (ficha, evaluacion, brief, construccion, opener, seguimiento, draft, selfCheck, agenda).
- **Límite de capas (explícito en el doc):** acá viven las PALABRAS; el CRITERIO (qué falta, qué gate abre) sigue en `flow.ts`/`contracts.ts`; la ESTRUCTURA (qué controles, autosave) en el componente. Este módulo nunca decide ni dibuja.

**Ficha migrada como prueba (`ficha-step.tsx`):** los ~30 strings ahora se leen de `GUIA_FICHA` (29 sitios). `satisfies PasoGuia` valida la forma pero conserva las claves de `campos` para acceso tipado (`GUIA_FICHA.campos.resenas.hint`, sin `| undefined`). El «ves» en negrita se preserva con `intro.map` sobre los segmentos. El `otros` sigue sin placeholder (sin `ejemplo`). Render **idéntico**: solo se extrajeron literales, cero cambio de className/estructura. Quedó en el componente, a propósito, el *chrome de interacción* (botón "Guardar ficha", footer de autosave, toasts, aria-label) — no es contenido de guía.

**Hardening tras review (1 hallazgo MEDIUM aplicado):** `CampoOpcion.value` queda como `string` (primitiva genérica correcta), pero las opciones de `igManejadoPor` se **atan por tipo** al enum del dominio vía `satisfies readonly { value: '' | (typeof IG_MANEJADO_POR_VALUES)[number]; label }[]` (único import del archivo: el const de valores de `contracts.ts`, dato puro). Antes el contrato "los value espejan el enum" era prosa; ahora un typo (`'DUEÑO'`, `'OWNER'`) **no compila** — justo la divergencia que este módulo existe para evitar.

**Archivos tocados (2):**
- `src/lib/leados/guidance-content.ts` (nuevo — tipos + `GUIA_FICHA` + `GUIA_PASOS`).
- `src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx` (lee de `GUIA_FICHA`; cero cambio de estructura).

**Verificación (quality-gate ECC):**
- ✅ `tsc --noEmit` exit 0, cero `any` · ✅ `eslint` sobre los 2 archivos limpio · ✅ `npm run build` verde (`/setter/leads/[leadId]` compila) · ✅ `prisma migrate status` up to date (69, no toca schema).
- ✅ **Review adversarial (workflow, 3 revisores read-only):** *Fidelidad* PASS — 30 strings verbatim byte-a-byte (✓, …, ★☆, `\n` y el «ves» en negrita preservados), nada hardcodeado quedó en el componente. *TS/React* PASS — el único cast es sano, el spread `[...opciones]` es correcto (readonly→mutable de Select), `satisfies` hace seguro el acceso. *Esquema* PASS_WITH_NOTES — el MEDIUM (value sin atar al enum) **ya aplicado**; las notas LOW son confirmaciones de forma para sprints futuros (ver abajo).

**Notas para sprints que consumen 1.0 (de la review, sin acción ahora):**
- **FG-4:** `SelfCheckRazon.checkId` es `string` (no unión a los ids reales) — decoupling deliberado "la lista vigente de `flow.ts` manda" (igual que `buildSelfCheck`). Es la primera fricción que verá FG-4; consciente.
- **1.3:** `ValidacionGuia` modela encabezado + completo; el detalle por-faltante lo da `fichaFaltantes` (lógica). Si 1.3 quiere copy de calidad por-campo, falta un tipo — confirmar alcance antes de construir.
- **1.2:** `EjemploContrastado` es 1 asiSi + 1 asiNo por `tema` (lista por paso, soporta varios pares). Validar contra contenido real que el formato 1:1 por tema alcanza (lo hace el propio 1.2).

**Pendiente declarado (deuda heredada, NO de 1.0):** la guía del onboarding de **FG-1.1** (`onboarding-hint.tsx`) y el registro de **`herramientas.ts`** siguen localizados — podrían consumir este módulo más adelante (misma nota de migración diferida). Fuera de alcance acá.

**Verificación humana (Franco — perceptual, "lo confirmo yo"):** editar una entrada de `guidance-content.ts` (ej. un hint de la ficha) → se refleja en la ficha del Paso 1; la ficha se ve y funciona idéntica a antes (mismos textos, mismo «ves» en negrita, mismos ejemplos en los placeholders).

---

## ✅ FG-1.2 — Componente teach reutilizable («¿por qué importa?» + esto-sí/esto-no) aplicado a los 5 pasos que no enseñaban   ·   2026-06-21

Va DESPUÉS de 1.0 verificado. La ficha del Paso 1 era el único paso que enseñaba *por qué*; en construcción, self-check, opener, objeciones y traspaso el mentor "se adelgazaba o desaparecía". Este sprint **productiza el patrón de la ficha** como un componente reutilizable que consume el contenido de 1.0 y lo aplica a esos 5 pasos. **Solo presentación**: el componente enseña, no toca lógica/gates/datos. Consume 1.0, NO hardcodea texto. Disciplina B9, tipado estricto, un objetivo.

**Estado real encontrado (descubrimiento — precedentes y dónde falta el porqué):**
- **Patrón a clonar (calidad):** la ficha (`ficha-step.tsx`, ya sobre 1.0) — porqué + ejemplo concreto. **Patrón a clonar (mecánica colapsable):** `ToolGuide` (`tool-guide.tsx`, FG-1.AI) — `<details>` nativo SSR-safe, marker oculto, header neutro, contenido del registro editable.
- **Los 5 pasos son funcionales sin guía** (tienen estados locked/empty/activo, hints inline, reglas duras visibles): el opener rebota links por schema, el self-check muestra el arreglo de cada hard-check, el seguimiento embebe `GuardrailRol`, la agenda exige notas de traspaso. Lo que les **falta es el PORQUÉ** y el contraste esto-sí/esto-no — qué hace *bueno* a cada paso. Ahí entra el teach, como complemento.

**Componente nuevo (`_components/teach-panel.tsx`):** `TeachPanel` — header «¿Por qué importa?» (Lightbulb) + el `porque` (líneas con énfasis) + el contraste «esto sí / esto no» (`EjemploContraste`), colapsable por `<details>` clonando a `ToolGuide`. Color **semántico** (esto-sí emerald, esto-no rosa) reforzado con ícono **y** texto (no depende del color solo — WCAG 1.4.1); **cero cyan** (B9: el cyan es para lo accionable). Prop `collapsible={false}` para cuando ya vive dentro de un `<details>` (objeciones) → renderiza un `<div>`, **sin anidar colapsables**. `return null` si no hay porqué ni ejemplos (nunca un panel vacío). Sin `'use client'` (sin hooks, presentacional puro). Íconos `aria-hidden` (el significado vive en el texto), `strokeWidth={1.5}`.

**Qué consumió de 1.0:** los tipos `PasoGuia.porque` (teach) y `PasoGuia.ejemplos: EjemploContrastado[]` (esto-sí/esto-no) — los puntos de extensión que 1.0 dejó listos. Se sumaron 5 entradas al registro `GUIA_PASOS` (`GUIA_CONSTRUCCION`, `GUIA_SELF_CHECK`, `GUIA_OPENER`, `GUIA_OBJECIONES`, `GUIA_TRASPASO`), cada una con su `porque` + `ejemplos`, editables por Franco en un solo archivo. **Evolución de esquema (aditiva, no rompe la ficha):** `PasoGuia.intro` pasó a **opcional** (las superficies solo-teach no tienen intro de formulario) y `GuiaPasoId` sumó `objeciones`/`traspaso` (momentos de enseñanza ⊂ seguimiento/agenda — el step amplio queda libre para su propia guía). La ficha sigue intacta (lee `GUIA_FICHA.intro` vía `satisfies`, presente).

**Aplicado a los 5 pasos (un `<TeachPanel>` por paso, colapsado salvo objeciones):**
- **Construcción** (`construccion-step.tsx`, vista CONSTRUCCION) — `id="construccion"` tras el intro, antes del `ToolGuide`. Porqué: la demo es la carnada; genérica no genera respuesta. Ejemplos: assets reales vs stock, fidelidad al brief vs ruido.
- **Self-check** (`self-check-step.tsx`, vista activa) — `id="selfCheck"` tras el intro, antes de los obligatorios. Porqué: último filtro antes de Franco; cada rechazo enfría. Ejemplos: probar de verdad vs suponer, honestidad en los flags.
- **Opener** (`opener-step.tsx`, vista activa) — `id="opener"` tras el encuadre, antes de `CanalSeguridad`. Porqué: abre conversación, no vende; sin link ni precio. Ejemplo: opener dolor-first vs folleto genérico.
- **Objeciones** (`seguimiento-step.tsx`, dentro del `<details>` de objeciones) — `id="objeciones" collapsible={false}`. Porqué: nunca cotizás; toda objeción → agendar. Ejemplo: deflectar a reunión vs tirar un número.
- **Traspaso** (`agenda-step.tsx`, vista activa) — `id="traspaso"` tras el header, antes de confirmar decisor. Porqué: la reunión es el handoff; sin notas Franco entra a ciegas. Ejemplo: nota rica vs «quiere una web».

**🔎 HALLAZGO (invariante del task — la guía es complemento, no muleta):** **la pantalla de CONSTRUCCIÓN (vista CONSTRUCCION) está sobre-guiada**, y el problema es del **diseño base, no del teach**. Apila 10+ bloques verticales: `BadgeProvisorio` + `UrgenciaBanner` + `GuiaRetrabajo` + intro + `TeachPanel` + `ToolGuide` + `CopyBlock` + `MaterialesNegocio` + la lista de 6 fases de `SHELL_CONSTRUCCION` (~24 líneas de instrucción) + aviso de guardado + bloque de escalado. El `TeachPanel` es complemento legítimo (colapsado, solo el porqué), pero aterriza sobre una pantalla que ya se apoya demasiado en prosa para entenderse. Además hay **cuasi-duplicación**: el ejemplo «Assets del negocio» repite la fase 3 del shell («Assets reales») y el cartel de `MaterialesNegocio`; «Fidelidad al brief» repite la fase 1. **Recomendación (sprint aparte, NO acá):** rediseñar la base — el shell de 6 fases podría ser un stepper/acordeón, y `MaterialesNegocio` plegarse dentro de la fase que lo usa. No se tapó con más guía: se deja anotado. Los otros 4 pasos pasan el invariante limpio (base auto-explicativa, teach como complemento colapsado).

**Notas menores de la review (no bloqueantes, criterio de Franco):** opener y objeciones traen 1 par esto-sí/no (vs 2 en construcción/self-check) — asimetría **deliberada**: un contraste filoso alcanza donde alcanza, y sumar más juega en contra del invariante "complemento, no muleta". El self-check podría sumar un 2.º par (datosReales/fielAlBrief) si Franco lo quiere.

**Archivos tocados (8):**
- `src/app/(protected)/setter/_components/teach-panel.tsx` (nuevo — `TeachPanel` + `EjemploContraste` + `LineaRicaText`).
- `src/lib/leados/guidance-content.ts` (5 entradas teach + `intro` opcional + `GuiaPasoId` ampliado).
- `construccion-step.tsx`, `self-check-step.tsx`, `opener-step.tsx`, `seguimiento-step.tsx`, `agenda-step.tsx` (import + un `<TeachPanel>` cada uno).

**Verificación (quality-gate ECC):**
- ✅ `tsc --noEmit` exit 0, cero `any` · ✅ `eslint` sobre `teach-panel.tsx` + `guidance-content.ts` limpio · ✅ `npm run build` verde (`/setter/leads/[leadId]` compila) · ✅ schema sin tocar (69 migraciones, `guidance-content.ts` no es Prisma).
- ⚠️ **1 error ESLint PRE-EXISTENTE** en `seguimiento-step.tsx:200` (`react-hooks/purity`, `Date.now()` en `minReactivacion`) — **NO introducido por este sprint** (verificado por `git diff`: mi diff es solo el import + el `<TeachPanel>`; el `Date.now()` estaba en L199, +1 por mi import). Es la deuda heredada ya registrada en B0.4 / cierre FG-0.
- ✅ **Review adversarial (workflow, 3 revisores read-only):** *Diseño/B9* PASS_WITH_NOTES — sin cyan, emerald/rosa semántico, nested-`<details>` evitado, íconos `strokeWidth 1.5` + `aria-hidden` aplicado. *Contenido/invariante* PASS_WITH_NOTES — ejemplos concretos en voz «vos», **cero contradicciones** contra la lógica del flujo (`gateEnvioDemo`, `contieneLink`, `HARD_CHECKS`, `GUARDRAIL_ROL`, notas de traspaso); HALLAZGO de construcción registrado arriba. *TS/wiring* PASS — sin texto hardcodeado, sin `any`, `undefined` guardado, `intro` opcional no rompió la ficha, boundary client/server seguro.

**Verificación humana (Franco — perceptual, "lo confirmo yo"):** abrir cada paso (construcción, self-check, opener, objeciones en seguimiento, traspaso en agenda) → cada uno muestra su «¿Por qué importa?» colapsable + el contraste esto-sí/esto-no; un setter sin contexto entiende qué hace *bueno* a cada paso. Pendiente de QA visual en runtime (desktop + mobile) sobre las 5 pantallas con leads en el stage correspondiente — los gates de stage exigen sembrar leads en construcción/en-revisión/respondió, por eso queda para tu pasada perceptual.

---

## ✅ FG-1.4 — Ejemplo del estado ideal en las pantallas vacías del setter (ficha buena / self-check bueno)   ·   2026-06-21

Va DESPUÉS de 1.0. **Una pantalla en blanco no enseña:** el setter abre la ficha (Paso 1) o el self-check y no tiene un «así se ve bien» contra qué comparar lo suyo. Este sprint llena ese hueco: cada pantalla vacía relevante ofrece un **«Ver ejemplo»** que despliega un artefacto modelo —una ficha buena de verdad, un self-check bien hecho— para contrastar. **Solo presentación**: consume 1.0, no hardcodea. Disciplina B9, tipado estricto, un objetivo.

**Estado encontrado (descubrimiento — 2 subagentes `Explore` en paralelo):**
- **Empty states de la zona setter:** los de *lista vacía* (sin leads asignados, búsqueda sin resultados, colas vacías, timeline sin movimientos) usan el `EmptyState` compartido o un `<p>` inline neutro. **No aplican** acá: no hay un "artefacto gold-standard" que mostrar en una lista vacía — mostrar una ficha buena ahí sería ruido. Fuera de alcance a propósito (el task nombra «ficha buena, self-check bueno» = los artefactos que el setter PRODUCE).
- **Ejemplos gold-standard en 1.0:** `guidance-content.ts` tenía hints por-campo (`CampoGuia.ejemplo`) y contrastes esto-sí/esto-no (`EjemploContrastado`, vía `TeachPanel`), pero **NINGÚN ejemplar COMPLETO** de una ficha o un self-check terminados. Ese era el faltante → se agrega a 1.0 (lo que el task autoriza: "o agregalos a 1.0 si faltan").
- **Idioma a clonar:** `TeachPanel` — `<details>` neutro SSR-safe, marker oculto, **cero cyan** (B9: el cyan es para lo accionable; el ejemplo es enseñanza).

**Contenido nuevo en 1.0 (`guidance-content.ts`):** dos ejemplares COMPLETOS, editables por Franco en un solo archivo:
- **`FichaEjemplar` + `GUIA_FICHA_EJEMPLAR`** — una ficha modelo (café de barrio con IG activo que pierde consultas). **Tipo atado al dominio:** `campos: Record<keyof typeof GUIA_FICHA.campos, string>` → el tipo **obliga a cubrir los 7 campos** y el componente **reusa los labels de `GUIA_FICHA.campos`** (no se duplican). `igManejadoPor` guarda el value del enum; el componente resuelve su label. `satisfies` valida la forma.
- **`SelfCheckEjemplar` + `GUIA_SELF_CHECK_EJEMPLAR`** — un self-check modelo. **No re-lista el checklist** (ese vive en `flow.ts: HARD_CHECKS/SOFT_CHECKS` y el step ya lo dibuja): modela la FORMA del artefacto terminado y el criterio único que los `EjemploContrastado` no dan — *un sheet impecable sin un solo flag suele ser señal de que NO se miró en serio; un buen self-check casi siempre deja algún flag*. Referencia los 6 obligatorios reales y 2 soft-flags reales en prosa, sin acoplar al data-structure.

**Componente nuevo (`_components/ejemplo-ideal.tsx`):** `EjemploIdealShell` (chrome `<details>` colapsable, neutro, clonando a `TeachPanel`) + dos consumidores finos:
- **`FichaEjemplo`** — recorre `GUIA_FICHA.campos` (labels) × `GUIA_FICHA_EJEMPLAR.campos` (valores) en un `<dl>`; `whitespace-pre-line` preserva el formato multilínea de las reseñas. Resuelve el label del select desde las opciones.
- **`SelfCheckEjemplo`** — lista las líneas del ejemplar con check emerald (verde = verificado, semántico, no decorativo).
- Sin `'use client'` (presentacional puro, sin hooks). Íconos `aria-hidden` + `strokeWidth 1.5`. Contenido 100% de 1.0.

**Wiring (un componente por paso, colapsado):**
- **Ficha** (`ficha-step.tsx`, rama editable) — `<FichaEjemplo />` tras el header (título/intro/duración), antes de los campos. **Decisión de alcance:** se muestra siempre que la ficha es editable (no solo cuando está 100% vacía) — cubre el caso vacío (el momento de aprendizaje) y queda a mano para comparar mientras se llena, sin aparecer/desaparecer al tipear la primera letra. Mejor UX que el literal "solo si vacío", mismo objetivo del task.
- **Self-check** (`self-check-step.tsx`, vista activa CONSTRUCCION+draft) — `<SelfCheckEjemplo />` justo después del `<TeachPanel id="selfCheck">`. El ejemplo (artefacto terminado) complementa al teach (porqué por-principio), no lo duplica.

**Archivos tocados (4):**
- `src/lib/leados/guidance-content.ts` (+`FichaEjemplar`/`GUIA_FICHA_EJEMPLAR` + `SelfCheckEjemplar`/`GUIA_SELF_CHECK_EJEMPLAR`; no toca lo existente).
- `src/app/(protected)/setter/_components/ejemplo-ideal.tsx` (nuevo — shell + `FichaEjemplo` + `SelfCheckEjemplo`).
- `src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx` (import + `<FichaEjemplo/>`).
- `src/app/(protected)/setter/leads/[leadId]/_components/self-check-step.tsx` (import + `<SelfCheckEjemplo/>`).

**Verificación (quality-gate ECC):**
- ✅ `npm run build` verde (type-check de todo el proyecto; `/setter/leads/[leadId]` compila) — prueba que el `satisfies` + `keyof typeof GUIA_FICHA.campos` tipan bien y que los componentes (estáticos, sin data/hooks) renderizan sin error.
- ✅ `eslint` sobre los 4 archivos limpio (exit 0). Sin Prettier en el proyecto (formato lo gobierna ESLint).
- ✅ `prisma migrate status` up to date (69 migraciones; no toca schema).

**Verificación humana (Franco — perceptual, "lo confirmo yo"):** abrir un lead en **FICHA** (ficha editable) → arriba aparece «Ver ejemplo de una ficha bien hecha»; al desplegarlo se ve la ficha modelo campo por campo. Abrir un lead en **CONSTRUCCION con draft publicado** (self-check activo) → bajo el «¿Por qué importa?» aparece «Ver ejemplo de un self-check bien hecho». En ambos: se puede comparar el trabajo propio contra el ejemplo. ⚠️ **No capturé screenshots** — las dos pantallas están detrás de auth de setter + leads sembrados en el stage exacto (mismo motivo de gate que FG-1.2); la pasada perceptual (desktop + mobile, que el bloque no rompa el spacing del form) queda para vos, como pediste.

---

## ✅ FG-1.3 — Validación de CALIDAD del input de la ficha (orienta al salir del campo, NO gatea)   ·   2026-06-21

Va DESPUÉS de 1.0. Cuando el setter carga algo pobre («tiene Instagram» sin más), **nada le señalaba el estándar ni cómo mejorarlo**: el form aceptaba el input flojo en silencio. Este sprint suma una validación de CALIDAD que enseña, **al salir del campo (onBlur)**, sin ser hostil. **Solo presentación + contenido de 1.0.** Disciplina B9, tipado estricto, un objetivo.

**🔴 SENSIBLE-lite — el límite que define el sprint:** esto es validación de **calidad del input**, NO un gate de transición. **ORIENTA, no bloquea.** Los gates (`fichaFaltantes`, `transitionDossier`) deciden si el lead AVANZA; esta capa solo decide si vale la pena SUGERIR más detalle. Jamás habilita/deshabilita el submit ni dispara una transición.

**Estado encontrado (descubrimiento — forms del setter + autosave 0.5.1 + 1.0):**
- **Ficha** (`ficha-step.tsx`): `useState`+zod, 7 campos. El **autosave de 0.5.1** (`useAutosave`) observa `form` (debounce trailing, coalescing, `maxWaitMs`); guarda con `guardarFicha` (parcial-safe, **nunca** transiciona). La señal de "todavía falta" (`fichaFaltantes` → caja amber) es **gate-level** (habilita la evaluación): presencia, no calidad. El submit (`guardar`) **no está gateado** por nada — guarda siempre.
- **1.0**: `CampoGuia` tenía `label`/`hint`/`ejemplo`/`opciones`, pero **faltaba** el copy de calidad por-campo (ya anotado como pendiente al cierre de 1.0: «si 1.3 quiere copy de calidad por-campo, falta un tipo»). Se agrega ahora.
- **`TextArea`** reenvía props nativas (`{...props}`) → `onBlur` directo; tiene un flag `invalid` (rojo) que **NO se usa** (esto no es error). **`Field`** renderiza `label → children → hint`; su prop `error` es roja y **tapa el hint** → tampoco se usa. El nudge va como hijo del `Field` (grid-safe, **sin tocar el primitivo compartido** — disciplina "compartidos = SENSIBLE").

**Qué validan (5 campos sustantivos de la ficha):** `identidadNotas`, `presenciaDigital`, `resenas`, `contenidoReal`, `senalesOperativas`. **Excluidos a propósito:** `igManejadoPor` (es un select, no puede quedar "flojo") y `otros` (catch-all, «mejor que sobre» — no se nag-uea).

**Cómo orienta (no hostil):** al salir de un campo flojo aparece, debajo del input, un mensaje **neutro** (`CampoMejora`, tono ayuda — nada de amber/rojo que acá significan gate/error, ni cyan accionable) que explica el arreglo **con contexto**, p.ej. presencia digital → *«Eso queda corto. Bajá lo que se ve: ¿cuántos seguidores? ¿cada cuánto postean? ¿tienen web, Maps, WhatsApp? ¿responden mensajes y comentarios?»*. El texto vive en `GUIA_FICHA.campos[campo].mejora` (1.0, editable por Franco).

**Reglas de disparo (nunca mientras tipea):**
- **onBlur** evalúa `campoFichaFlojo(valor)` (heurística pura) y marca el nudge.
- **onChange** lo apaga al instante (`set` limpia el nudge del campo) → el mensaje desaparece apenas el setter empieza a mejorar, nunca molesta tipeando; se re-evalúa recién en el próximo blur.
- **Vacío → sin nudge**: de "falta llenar esto" se ocupa la guía de faltantes/gate; este nudge es para ENRIQUECER, no exigir.

**Criterio en lógica pura (módulo nuevo `src/lib/leados/ficha-calidad.ts`):** `campoFichaFlojo()` + `FICHA_MIN_DETALLE = 40` (umbral SUAVE: «tiene Instagram» (15) cae; una o dos cláusulas lo superan — y como el mensaje INVITA, un falso positivo en una respuesta corta-pero-ok no molesta y igual no bloquea). **Vive FUERA de `flow.ts` a propósito**, para que la frontera advisory-vs-gate sea explícita: este módulo nunca decide si el lead avanza. Sin Prisma, sin React, sin `'use server'` — testeable e importable como `flow.ts`.

**Compatibilidad con el autosave (0.5.1) — intacto:** el estado de nudges es **separado** de `form`; `set` mantiene EXACTO el `setForm((actual) => ({ ...actual, [campo]: valor }))` que el autosave observa (solo suma un `setNudges` al lado). El `onBlur` no escribe en `form` → cero guardados extra, timing de autosave idéntico. La guardia de salida (`useUnsavedGuard`) y `markSaved` sin tocar.

**✅ Check de no-tocar-gates (pedido del task, verificado):**
- `grep transitionDossier|disabled=` en `ficha-step.tsx` → **0 calls / 0 `disabled`**: el botón «Guardar ficha» no quedó gateado por nada, y no hay transición. Los únicos matches de "gate" son **comentarios míos** declarando el límite.
- `fichaFaltantes` (gate-level) **sin tocar** (L87-88 idénticas); la caja amber/emerald y la visibilidad del `CopyBlock` siguen dependiendo SOLO de los faltantes, no de los nudges.
- El único `transitionDossier` en `ficha-calidad.ts` está **dentro del doc-comment** que explica lo que NO hace.

**Archivos tocados (4):**
- `src/lib/leados/ficha-calidad.ts` (nuevo — heurística pura advisory; `campoFichaFlojo` + `FICHA_MIN_DETALLE`).
- `src/app/(protected)/setter/_components/campo-mejora.tsx` (nuevo — nudge neutro `role="status"`, presentación pura).
- `src/lib/leados/guidance-content.ts` (+`CampoGuia.mejora` + copy de calidad en los 5 campos; no toca lo existente).
- `src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx` (estado `nudges` + `evaluarCalidad` onBlur + `set` limpia el nudge + `<CampoMejora>` en los 5 campos; **el flujo de gate/submit/autosave sin cambios**).

**Verificación (quality-gate ECC):**
- ✅ `npm run build` verde (type-check de todo el proyecto; `/setter/leads/[leadId]` compila) — valida el tipado del `nudges` Record, el `mejora?` opcional y la heurística.
- ✅ `eslint` sobre los 4 archivos limpio (exit 0). Sin Prettier (lo gobierna ESLint).
- ✅ Schema sin tocar (no es Prisma; 69 migraciones).

**Verificación humana (Franco — funcional, "lo confirmo yo"):** en un lead en FICHA, escribir «tiene Instagram» en Presencia digital y **salir del campo** → aparece debajo el mensaje que explica cómo mejorarlo (¿cuántos seguidores?, etc.), sin bloquear ni teñir de rojo. Empezar a escribir de nuevo → el mensaje desaparece (no molesta tipeando). El **autosave sigue andando** (el indicador de guardado se mueve igual que antes). El botón «Guardar ficha» y el pase al Evaluador **no cambian** por la calidad del texto.

---

## 🏁 BLOQUE FG-1 — CERRADO (capa de mentoría del setter) · recap para el postmortem de FG-2   ·   2026-06-21

El bloque **FG-1** instaló la **capa de guía/mentoría** del flujo del setter: que un setter sin contexto entienda *qué hacer, por qué, cómo se ve bien, y cómo mejorar lo flojo* — sin tocar la lógica del dossier. Entradas (orden de ejecución):

| Sprint | Qué dejó | Capa |
|---|---|---|
| **FG-1.pre** | Cerró el drift DB↔schema que un `migrate dev` habría reseteado (pre-requisito limpio). | infra |
| **FG-1.0** | `guidance-content.ts` — **fuente única tipada** del contenido de guía (hermano de `herramientas.ts`); ficha del Paso 1 migrada como prueba. | contenido |
| **FG-1.1** | Onboarding del setter: enseña el flujo INVERTIDO sin chocar contra el gate score-3. | contenido |
| **FG-1.2** | `TeachPanel` — «¿por qué importa?» + esto-sí/esto-no, aplicado a los 5 pasos que no enseñaban. | presentación |
| **FG-1.4** | «Ver ejemplo» del estado ideal (ficha buena / self-check bueno) en las pantallas vacías. | presentación |
| **FG-1.3** | Validación de CALIDAD inline (orienta al blur, no gatea). | presentación |

**Arquitectura que quedó (la que hereda FG-2):**
- **Una fuente de contenido:** todo el copy de guía vive en `guidance-content.ts` (1.0). Tipos extensibles ya probados: `CampoGuia` (label/hint/ejemplo/**mejora**), `PasoGuia` (porque/ejemplos/validacion/congelada), `EjemploContrastado`, `FichaEjemplar`/`SelfCheckEjemplar`. Franco corrige una palabra editando un solo archivo.
- **Frontera dura contenido / criterio / estructura:** las PALABRAS en 1.0; el CRITERIO en lógica pura (`flow.ts` para gates, **`ficha-calidad.ts` para calidad advisory** — separados a propósito); la ESTRUCTURA en los componentes. Ningún componente hardcodea copy.
- **Disciplina B9 sostenida en todo el bloque:** cyan = accionable; enseñanza/ejemplo/nudge = neutro; amber/rojo reservados para gate-pendiente/error; verde = verificado. Sin tocar primitivos compartidos.

**Invariante del bloque, mantenido entrada por entrada:** la guía es **complemento, no muleta**, y **nunca toca los gates** ni el autosave. FG-1.3 lo formaliza (advisory ≠ gate). 

**Deuda/decisiones abiertas que FG-2 debería mirar (heredadas, NO de FG-1):**
- 🔎 **Pantalla de CONSTRUCCIÓN sobre-guiada** (registrado en FG-1.2): apila 10+ bloques verticales — el problema es el **diseño base**, no la guía. Candidato a rediseño (shell de 6 fases → stepper/acordeón). No se tapó con más guía.
- ⚠️ **`react-hooks/purity` pre-existente** en `seguimiento-step.tsx` (`Date.now()` en `minReactivacion`) — deuda de B0.4, sigue viva.
- **Otros forms del setter** (brief/construcción) podrían adoptar la validación de calidad de FG-1.3 (la infra es reusable: `mejora` en 1.0 + `campoFichaFlojo`/uno análogo + `CampoMejora`). Quedó fuera de alcance (un objetivo = la ficha).
- **QA visual en runtime pendiente** para todo el bloque: las pantallas del setter están detrás de auth + leads sembrados por stage; las verificaciones perceptuales quedaron delegadas a Franco (ver cada entrada). FG-2 podría montar el harness de seed para automatizarlo.

**Estado: BLOQUE FG-1 COMPLETO.** Capa de mentoría instalada (contenido único + teach + ejemplos + validación de calidad), gates y autosave intactos, verificación funcional/perceptual en manos de Franco.

---

## 🧪 FG-2.0 — Prototipo + harness para validar la hipótesis del formulario estructurado · 2026-06-21

**GATE ABIERTO.** El supuesto central de FG-2 — *«un formulario estructurado produce mejores demos que el prompteo libre»* — **nadie lo probó en este stack** (Claude Design + rubros reales de develOP). Hoy es una apuesta. Este sprint NO construye el formulario definitivo: arma un **prototipo descartable** que pone la hipótesis a prueba con **un** rubro, de forma acotada, **antes** de invertir en los 4 rubros. **El bloque FG-2 (2.1 → 2.3) no se deriva hasta que Franco corra el experimento.**

**Descubrimiento (cómo se arma hoy el prompt — la vía «a-mano» que se compara):** en `CONSTRUCCION`, `construccion-step.tsx` muestra `buildConstruccionBlock(lead, brief, ficha)` (`copy-blocks.ts:151`): **texto libre** ensamblado desde el `brief`, y el brief lo produce un **Gem de diseño externo** (prompteo libre) que el setter pega crudo en `brief.pegadoGem`. Ese es el baseline. Datos de ficha ya a mano: `businessName/industry/zone/instagramUrl/googleMapsUrl/currentWebUrl` (lead) + `ficha.resenas` (prueba social) + `ficha.contenidoReal` (logo/fotos/tono).

**Rubro elegido: gastronomía.** Criterio: es el rubro más común para demos de PyME local y tiene la estructura de landing más canónica (hero del plato → menú → reseñas → ubicación → CTA WhatsApp) — el mayor margen de mejora del formulario sobre el prompteo libre, o sea el mejor caso para ver señal clara.

**Qué construyó el prototipo:**
- **Core puro** (`src/lib/leados/_experimental/fg2-brief-lab.ts`): catálogo de rubro tipado (4 estilos visuales, 3 tonos, 7 secciones, 4 CTAs — cada opción carga su **directiva** opinada que viaja al prompt: ahí vive el conocimiento de rubro que el formulario codifica y el prompteo libre deja a la memoria del setter). `assembleGastroPrompt` ensambla un prompt **más prescriptivo** que el bloque libre (orden canónico de secciones + dirección visual + guardrails de calidad/mobile como parte del brief). Sin Prisma/'use server'/React.
- **Lab** (`/admin/fg2-lab`, gated SUPER_ADMIN por el layout admin, **NO linkeado en el sidebar** — se entra por URL): formulario estructurado + vista del prompt (copiar) + panel de medición. Autocompleta desde fichas reales (**read-only**) o se carga a mano.

**Harness de medición (qué se instrumenta y qué no — sin sobre-vender):**
| Métrica | Cómo |
|---|---|
| Tokens del prompt (input) | **Auto** — estimación heurística (~4 car/token), no exacta |
| Tiempo de generación | **Auto** — cronómetro del lab (`performance.now()`, arrancar/frenar) |
| Cuota/créditos consumidos | **Manual** — Claude Design es externo, no se puede instrumentar su medidor; Franco lo carga |
| Calidad de la demo | **Manual** — juicio humano 1–5 |

El botón **«Copiar fila de log»** emite un TSV (negocio · método · estilo · secciones · tokens · tiempo · cuota · calidad · notas) para pegar en la tabla del experimento. **Esto alimenta la economía unitaria que pedía el roadmap: costo por demo = tiempo + cuota.**

**🔴 Límites respetados (es EXPERIMENTO + JUICIO, no construcción definitiva):**
- NO escala a 4 rubros, NO productiza — código marcado **EXPERIMENTAL/DESCARTABLE** en cada archivo, a borrar tras la decisión.
- **SENSIBLE-lite:** el prototipo SOLO LEE la ficha; no escribe lógica de dossier ni toca gates/transiciones. Datos que entran al prompt = todos de cara pública (nombre, zona, reseñas ya públicas, links de assets, **WhatsApp comercial cargado a mano** — NO se auto-toma el `phone` posiblemente privado del lead).
- NO conectado al flujo real del setter — es un lab aparte para medir.

**Protocolo del experimento (lo corre Franco) → `docs/experimentos/fg2-brief-experimento.md`:** 5 demos con el formulario + 5 a mano (prompteo libre, mismos 5 negocios, setter capacitado), comparar calidad (Franco + setter juzgan), registrar costo por demo. Decisión: ¿el formulario mejora la calidad? ¿cuánto cuesta una demo? → destraba/ajusta/replantea 2.1→2.3. La tabla de log (5-vs-5, encabezado + filas pre-armadas) está en ese doc.

**Archivos creados (5, todos nuevos — cero archivos de producción tocados):**
- `src/lib/leados/_experimental/fg2-brief-lab.ts` (core puro: catálogo + `assembleGastroPrompt` + `estimarCostoPrompt` + `buildLogRowTsv`).
- `src/app/(protected)/admin/fg2-lab/page.tsx` (server: lee fichas read-only para autocompletar + banner experimental).
- `src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx` (formulario estructurado).
- `src/app/(protected)/admin/fg2-lab/_components/medicion-panel.tsx` (cronómetro + captura manual + copiar-fila).
- `docs/experimentos/fg2-brief-experimento.md` (protocolo + tabla de log del experimento).

**Verificación (quality-gate ECC):**
- ✅ `npm run build` verde (type-check de todo el proyecto; `/admin/fg2-lab` compila — confirmado en `.next/server/app/(protected)/admin/fg2-lab/page.js`).
- ✅ `eslint` sobre los 4 archivos de código limpio (exit 0). Sin Prettier (lo gobierna ESLint).
- ✅ **Los 6 invariantes existentes verdes** (`check:invariant`, `:setter-meta`, `:escalamiento`, `:novedades`, `:mis-numeros`, `:timeline`) — prueba de que el prototipo no rozó la lógica del setter.
- ⚠️ **QA visual en runtime pendiente para Franco:** `/admin/fg2-lab` está detrás de auth SUPER_ADMIN; no se verificó perceptualmente en browser. Bajo riesgo (reusa primitivos ya verificados: `Card/Field/Input/Select/Toggle/Button/Callout`), pero **no cerrar a ciegas** — Franco lo ve al abrir el lab para correr el experimento.

**Verificación humana (Franco — el experimento es tuyo):** build verde + invariantes verdes = el prototipo no cambió comportamiento del flujo. Lo que **destraba** (o replantea) 2.1→2.3 es el resultado del experimento: correr las 5 vs 5, juzgar calidad, registrar costo por demo. Sin ese resultado, el resto del bloque NO se deriva.

**Estado: FG-2.0 COMPLETO (prototipo + harness listos). GATE ABIERTO hasta el resultado del experimento.**

---

## 🧹 Refactor preparatorio FG-2 — partir `flow.ts` (contenido → `flow-content.ts`) · 2026-06-21

**Movimiento PURO.** La Auditoría 4 marcó `flow.ts` como módulo-dios. Antes de que FG-2 vuelva data-driven el constructor de prompts (`SHELL_CONSTRUCCION` es el ancla), editar copy obligaba a navegar un archivo que mezcla **gates de SEGURIDAD con copy**. Este refactor saca el contenido editable; NO cambia ningún comportamiento.

**PROBE-FIRST — estado real medido (antes de tocar nada):**
- `flow.ts` = **824 líneas** — **creció** desde las ~677 de la Auditoría 4 (B-beta le sumó las palancas de cartera). Seguía siendo módulo-dios: ~12 grupos de responsabilidad. FG-0.5 (`home.ts`) y FG-1 (`guidance-content.ts`/`ficha-calidad.ts`) NO lo habían aliviado.
- `SHELL_CONSTRUCCION` seguía en `flow.ts` con su `// PROVISORIO: refinar tras el test de Claude Design` — el ancla de FG-2.
- **Decisión: SÍ partir** (no era "partir por partir": 824 líneas, copy enterrado entre gates). Extraer **solo CONTENIDO**; los gates **no se mueven**.

**Qué se movió a `src/lib/leados/flow-content.ts` (módulo nuevo, hermano de `guidance-content.ts`/`herramientas.ts`):** 8 grupos de copy/datos editables — `ShellFase`+`SHELL_CONSTRUCCION`, `HardCheck`+`HARD_CHECKS`, `SoftCheck`+`SOFT_CHECKS`, `CanalParams`+`CANAL_INSTAGRAM`, `GUARDRAIL_ROL`, `PLANTILLAS_FOLLOW_UP`, `STATUS_LABELS`, `STAGE_LABELS`. Misma frontera que codificó FG-1: **acá las PALABRAS; el CRITERIO se queda**.

**Qué se quedó en `flow.ts` (SOLO reglas/gates/clasificación), idéntico:** gates del flujo invertido (`gateBriefAbierto`/`gateEnvioDemo`/`leadRespondio`), parsers Json, `buildSelfCheck`/`selfCheckAprobado` (gate), `contieneLink` (hard-block), `cadenciaInfo`, formatters de fecha, `fichaFaltantes`/`fichaTieneSenal` (gate de señal), y toda la clasificación del home-hub + palancas de cartera. **La clasificación del home NO se movió a `home.ts`: es lógica, no contenido — moverla sería un refactor de lógica fuera de alcance.**

**Técnica (diff mínimo, cero churn en call-sites):**
- `flow.ts` **re-exporta** los 8 símbolos desde `flow-content.ts` → los ~12 call-sites que importan desde `@/lib/leados/flow` siguen intactos (incluidos los imports mixtos contenido+lógica como `notify.ts` `{ formatFechaHora, STAGE_LABELS }`).
- Única dependencia gate→dato: `flow.ts` **importa de vuelta** `HARD_CHECKS`/`SOFT_CHECKS` porque `buildSelfCheck`/`selfCheckAprobado` los consumen (la lógica depende del dato/config, dirección correcta).
- Resultado: `flow.ts` **824 → 614 líneas** (−210); `flow-content.ts` = 265.

**Verificación (quality-gate ECC):**
- ✅ `tsc --noEmit` exit 0 (señal autoritativa del movimiento de tipos/imports: el barrel re-export compila, el import-back es válido, todos los call-sites resuelven).
- ✅ `npm run build` verde (route table completa, `/setter` y `/admin/leados` incluidos). *Nota: hubo contención del lock de build de Next — había builds externos corriendo; el lock OS solo reintenta 1 s. Se resolvió con reintento; no es problema del refactor.*
- ✅ `eslint` sobre los 2 archivos limpio (exit 0; `unused-imports` no marcó ni el import-back ni el barrel). Sin Prettier (lo gobierna ESLint).
- ✅ **Los 6 invariantes verdes** (`check:invariant`, `:setter-meta`, `:escalamiento`, `:novedades`, `:mis-numeros`, `:timeline`) — verdes en baseline Y post-refactor: prueba de que el movimiento no rompió nada.

**Dónde quedó `SHELL_CONSTRUCCION`:** en `flow-content.ts`, con su comentario `PROVISORIO` intacto — listo como **ancla editable del constructor de FG-2**: ahora FG-2 edita copy sin navegar gates de seguridad. Objetivo del refactor cumplido.

**Verificación humana (Franco):** build verde + invariantes verdes = el refactor no cambió comportamiento. Solo se movió copy entre archivos; ninguna pantalla cambia (re-export mantiene la salida byte-idéntica).

**Estado: REFACTOR COMPLETO.** `flow.ts` aliviado y data-clean para FG-2; comportamiento intacto.



## 🧪 FG-2.0 — Experimento listo para correr (5 negocios precargados + 10 prompts + checklist) · 2026-06-21

**Objetivo del sprint (autónomo, scope cerrado):** dejar el experimento de FG-2 **máximamente preparado** para que Franco solo tenga que pegar en Claude Design, mirar y anotar. NO correr el experimento (no se puede abrir Claude Design ni juzgar demos desde acá), NO productizar el prototipo, NO conectarlo al flujo del setter. SENSIBLE-lite: lectura read-only de fichas, cero gates/transiciones/dossier.

**Estado real encontrado (inventario de fichas de gastronomía):**
- El lab autocompleta desde `OsLeadDossier.fichaJson` filtrado por señal. En los seeds del repo hay **1 ficha de gastronomía completa** (Noir Dining, `demos-seed-review-queue.ts`), **1 parcial** (Pizzería Don Carlo, ficha QA de `b6-qa-outreach.ts`, sin `contenidoReal`) y **1 lead real sin ficha de contenido** (Café La Esquina, `b3-qa-assign-leads.ts`). **NO hay 5 fichas reales de gastronomía** cargadas.
- Decisión (alineada con la consigna): completar a 5 con **2 arquetipos representativos marcados como tales** (Parrilla El Fogón, Verde Hoja). Regla dura respetada: **nunca se inyecta una reseña inventada como "real"** — los 3 casos sin reseñas reales viajan SIN sección de reseñas (el assembler omite el bloque con `resenas: ''`).

**Los 5 negocios elegidos (con procedencia):**
1. **Noir Dining** (Yerba Buena) — restaurante de autor — **real (seed verbatim)** — con reseñas reales.
2. **Pizzería Don Carlo** (Barrio Norte) — pizzería — **real (ficha QA seed)** — con reseña real; voz de marca representativa (el seed no carga `contenidoReal`).
3. **Café La Esquina** (Yerba Buena) — cafetería — **lead real del seed**, contenido representativo — sin reseñas.
4. **Parrilla El Fogón** (Tucumán) — parrilla — **representativo (no real)** — sin reseñas.
5. **Verde Hoja** (Palermo) — café saludable/brunch — **representativo (no real)** — sin reseñas.

Cobertura del catálogo del rubro a propósito: los 4 estilos (nocturno / apetitoso×2 / rústico / minimal), 3 tonos y los 3 CTAs principales quedan representados → más señal en el 5-vs-5.

**Qué se hizo (todo EXPERIMENTAL / DESCARTABLE):**
- **Casos precargados:** `src/lib/leados/_experimental/fg2-casos-gastro.ts` (NUEVO) — los 5 negocios como `Fg2BriefInput` completo (ficha + decisiones estructuradas) + `origen` (`seed-real`/`seed-lead`/`representativo`) + `nota` de procedencia + `promptLibre` (el brazo "a mano"). WhatsApp de ejemplo (la demo no depende del dígito), flag explícito. Tipado estricto, cero `any`.
- **Selector de precarga en el lab:** `fg2-lab-client.tsx` — nuevo `<Select>` "Precargar un caso del experimento" que llena TODO el formulario (estilo, tono, secciones, CTA, WhatsApp, diferencial, color, ficha) de un click. Helper puro `seccionesAToggles`. Convive con el autocompletar-desde-lead (fuentes alternativas, se resetean entre sí).
- **Generador de prompts:** `scripts/_experimental/fg2-gen-prompts.ts` (NUEVO) — emite los 10 prompts desde `CASOS_GASTRO` + `assembleGastroPrompt`. Imports relativos con extensión `.ts` (mismo workaround ESM/ts-node documentado en C.0).
- **Doc de prompts listos:** `docs/experimentos/fg2-prompts-listos.md` (NUEVO, generado) — los **10 prompts** (5 A formulario + 5 B a-mano), cada uno en bloque de texto para copiar-pegar, con procedencia y costo estimado de input.
- **Doc del experimento ampliado:** `docs/experimentos/fg2-brief-experimento.md` — sección de inventario real (de dónde sale cada negocio), **checklist literal A1→B5** (10 pasos), **rúbrica "qué mirar" para calidad 1–5** (¿captura el negocio? ¿se ve profesional? ¿secciones correctas? ¿el setter la mandaría?), **cómo registrar el costo** (tiempo del cronómetro + cuota de Claude Design), y la **tabla de resultados precargada** con los 5 negocios + estilo/secciones/tokens del lado formulario — solo falta llenar tiempo·cuota·calidad·notas.

**Archivos:**
- `src/lib/leados/_experimental/fg2-casos-gastro.ts` (nuevo)
- `src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx` (selector de precarga)
- `scripts/_experimental/fg2-gen-prompts.ts` (nuevo, generador)
- `docs/experimentos/fg2-prompts-listos.md` (nuevo, generado)
- `docs/experimentos/fg2-brief-experimento.md` (checklist + rúbrica + tabla precargada)

**Verificación:**
- ✅ **ESLint** limpio en los 3 archivos de código tocados.
- ✅ **tsc** — los archivos de FG-2 (`_experimental/*`, `fg2-lab/*`, generador) dan **cero errores**. El lab compila (webpack: `✓ Compiled successfully in 84s`).
- ✅ Generador corrido OK → los 10 prompts en el doc; casos sin reseñas reales omiten la sección de reseñas correctamente (verificado en el output A3/A4/A5).
- 🔴 **`npm run build` NO llega a verde** — pero NO por FG-2. El type-check global está **bloqueado por un bug pre-existente de `prisma/schema.prisma`**: enum `AuditActionType` define `BOT_DELETED` **dos veces** (líneas 192 y 199 → Prisma P1012). El schema inválido impide `prisma generate`, el client queda viejo y cascadea errores de tipos en `admin/chatbots/**` y `admin/clients/**` (`convertedToOsLeadId`, `deletedAt`, `avatarImageUrl`, `city`, `internalNotes`, …). `git status` confirma que NO toqué `schema.prisma` ni esos módulos. **Fuera de scope + archivo sensible → reportado y flagueado (chip), no corregido.** Fix de una línea: borrar el `BOT_DELETED` duplicado de `schema.prisma:199` y `npx prisma generate`.
- ⚠️ **QA visual en runtime pendiente para Franco:** `/admin/fg2-lab` está detrás de auth SUPER_ADMIN; el selector de precarga no se verificó perceptualmente en browser. Bajo riesgo (reusa `Select/Field/Card` ya verificados y solo agrega un control), pero **no cerrar a ciegas** — Franco lo ve al abrir el lab para correr el experimento.

**Verificación humana (Franco):** entrar a `/admin/fg2-lab`, abrir `docs/experimentos/fg2-brief-experimento.md`, y tener TODO listo para empezar a pegar en Claude Design sin preparar nada más (5 casos en el selector, 10 prompts en `fg2-prompts-listos.md`, checklist + tabla armadas).

**Estado: EXPERIMENTO PREPARADO — NO CORRIDO.** El gate de FG-2 sigue **ABIERTO**: no se generó ni se juzgó ninguna demo (eso es de Franco). Bloque 2.1→2.3 no se deriva hasta que el experimento corra y la decisión quede anotada en el doc.


## 🧪 Sprint 0.2 — Línea base e2e PRE-REDISEÑO (Playwright destrabado) · 2026-06-25

**Objetivo:** correr el suite e2e en browser por primera vez y dejar la LÍNEA BASE pre-rediseño. Premisa de entrada: "Playwright bloqueado en esta máquina (sospecha antivirus/firewall contra los binarios de ms-playwright)".

**Diagnóstico — la premisa era falsa. Playwright NO está bloqueado:**
- Binarios YA instalados: `chromium-1223` + `chrome-headless-shell-1223` en `%LOCALAPPDATA%\ms-playwright` (markers `INSTALLATION_COMPLETE` + `DEPENDENCIES_VALIDATED` presentes). `@playwright/test@1.60.0`.
- `chromium.launch({headless:true})` + `newPage()` + `setContent()` → **`LAUNCH_OK`**. El ejecutable arranca y renderiza.
- `npx playwright install chromium` → **exit 0** (sin descarga, sin bloqueo de red/AV).
- El suite corrió entero en Chromium sin un solo error de spawn/launch.
- **Conclusión:** no hubo nada que destrabar — ni handoff de whitelist al antivirus. El bloqueo histórico, si existió, ya no aplica.

**Aclaraciones de scope (la consigna asumía un setup que no existe tal cual):**
- No hay script `npm run test:setter` ni specs "setter". El suite e2e real es **`npm run test:e2e`** (`playwright test`), 22 archivos spec, **50 tests** (no 35).
- El config (`playwright.config.ts`) levanta su propio `webServer: npm run start` en `:3000` (build de hoy ya presente). Corrido **exactamente como está** — sin tocar config ni tests (medir, no maquillar).

**LÍNEA BASE (`npm run test:e2e`, reporter list, 1 worker, 3.9m):**
- **32 passed · 10 failed · 8 skipped** · exit 1.
- Log completo: `C:\tmp\e2e-baseline.log`. Artefactos (screenshots/diffs): `test-results/`.

**Los 10 fallos — clasificados (NINGUNO es Playwright):**
- **7× regresión visual** (`22-visual-regression.spec.ts`): diffs de 3–8% px contra los snapshots guardados (`/admin`, `/admin/clients`, `/admin/alerts`, `/admin/_design`, `/dashboard`, `/dashboard/chatbot`, `/dashboard/chatbot/settings`). ⚠️ **La baseline visual YA está roja ANTES del rediseño** → los snapshots `*-chromium-win32.png` están desactualizados respecto del estado actual. No sirven como "before" limpio; el rediseño va a regenerarlos igual (`--update-snapshots`).
- **2× `16-admin-bulk-actions`**: `locator.check()` timeout 15s — el checkbox es `sr-only` y un `<label class="absolute … cursor-pointer">` **intercepta los pointer events** ("element is not stable" / "intercepts pointer events"). Interacción rota/flaky real, no bloqueo de browser.
- **1× `30-onboarding-e2e-complete`** (flujo completo): timeout esperando el input de teléfono (`getByPlaceholder(/5493815555555/i)`) en `helpers/form.ts:15` — el wizard no llegó al campo esperado.

**8 skipped:** tests con `test.skip()` condicional (gating `@smoke` / conteo de fixtures) — comportamiento normal, no fallos.

**Restricción respetada:** cero cambios a tests o código de app. Esto es el estado real medido.

**Para el rediseño:** este 32/10/8 es el "antes". Los 7 fallos visuales NO son deuda nueva del rediseño — la baseline de snapshots ya divergió y deberá regenerarse. Los 3 fallos funcionales (bulk-actions ×2, onboarding ×1) sí son señal a vigilar: si el rediseño los toca, distinguir regresión-nueva de roto-preexistente.

**Estado: LÍNEA BASE CAPTURADA.** Playwright operativo; suite corre en browser sin intervención de entorno.

---

## Sprint 0.3 — Seed de estados del setter (2026-06-25)

**Objetivo:** sembrar ≥1 OsLead en cada estado relevante del flujo del setter para verificación perceptual del rediseño B9.

**Descubrimiento:**

| Estado objetivo | Cobertura previa |
|---|---|
| Frío (PROSPECTO, sin dossier) | ✅ ya cubría (Ferretería El Constructor, etc.) |
| Esperando respuesta (DEMO_ENVIADA + nextFollowUpAt) | ✅ ya cubría (Restaurante El Portal) |
| Postergado futuro (POSTERGADO + reactivateAt > now) | ✅ ya cubría (Gimnasio Olimpo) |
| Ficha a medias (dossier FICHA, fichaJson parcial) | ❌ faltaba |
| Caliente (dossier EVALUADA, score ≥ 4) | ❌ faltaba |
| En revisión (dossier EN_REVISION) | ❌ faltaba |
| Aprobado (dossier APROBADA + aprobadaAt + draftUrl) | ❌ faltaba |
| Rechazado con nota (dossier RECHAZADA + rechazos[]) | ❌ faltaba |
| Descartado (dossier DESCARTADA) | ❌ faltaba |
| Postergado vencido (POSTERGADO + reactivateAt < now) | ❌ faltaba |

**Cambios:**

Archivo modificado: `prisma/seed-agency-os.ts`

- Import agregado: `DossierStage`
- Tipos nuevos: `DossierData`, `QaLeadSeed`
- Array nuevo: `qaLeadSeeds` — 7 leads con datos realistas, todos bajo `franco`
- Funciones nuevas: `ensureLeadDossier()` (upsert idempotente) y `ensureQaLeads()`
- `main()`: llama a `ensureQaLeads(members)` después del loop de `leadSeeds`

**Leads QA sembrados:**

| businessName | status | dossier stage |
|---|---|---|
| Café Bergamota | POSTERGADO | sin dossier (reactivateAt: 7 días atrás) |
| Panadería Don Cosme | PROSPECTO | FICHA (fichaJson parcial) |
| Veterinaria San Marcos | PROSPECTO | EVALUADA (score 5) |
| Centro Pilates Armonía | RESPONDIO | EN_REVISION |
| Clínica Dental Omega | CERRADO | APROBADA (aprobadaAt + draftUrl) |
| Studio Yoga Balance | RESPONDIO | RECHAZADA (rechazos con nota) |
| Zapatería El Buen Paso | PERDIDO | DESCARTADA |

**Conteo tras correr el seed (37 leads totales):**

Por status: PROSPECTO×14, DEMO_ENVIADA×5, RESPONDIO×5, VIO_VIDEO×3, CALL_AGENDADA×1, CERRADO×4, PERDIDO×3, POSTERGADO×2

Por stage de dossier: FICHA×2, EVALUADA×2, CONSTRUCCION×1, EN_REVISION×8, APROBADA×2, RECHAZADA×2, DESCARTADA×2

**Chequeos:**
- `tsc --noEmit`: sin errores
- `prisma migrate diff` (live→schema): `No difference detected`
- 7/7 leads QA verificados en BD por query directo
- Guard anti-prod: intacto (no tocado)

**Issue pre-existente detectado (fuera de scope):** el seed falla en la fase `projectSeeds` con "No se encontro organizationId para develop" cuando se corre sin org `develop` en la BD. Los `qaLeadSeeds` se insertan antes de ese punto y quedan completos. No se toca en este sprint.
---

## Smoke test inmenso del setter + reconciliación de drift de migraciones [2026-06-22]

**Objetivo:** (1) un smoke test e2e que recorra todo el flujo del setter "como si fuese un setter" probando que TODO ANDA; (2) el paquete completo para completar los archivos de migración y cerrar el drift DB↔schema. Reporte completo en `docs/smoke-report.md`.

**PASO 0 — build (precondición):** el enum `AuditActionType` tenía `BOT_DELETED` duplicado (`schema.prisma` L192+L199 → P1012). Se borró la línea duplicada (queda una). `prisma generate` ✅ + `next build` ✅. **Gotcha de environment:** `next build --webpack` se queda sin heap con el default (~2 GB) en esta máquina → corre verde con `NODE_OPTIONS=--max-old-space-size=6144`. (También: cuidado con pipear `npm run build | tail` — el exit code es el de `tail`, enmascara un OOM del build.)

**Suite e2e (nuevo, `tests/setter/` + `playwright.setter.config.ts`):** 35 tests en 6 specs cubriendo A–G (superficies+salud, recorrido completo del lead, aislamiento, cabina/cross-lead, admin, vacíos/mobile/a11y). Aislado del `playwright.config.ts` principal (testDir + config propios) → `npm run test:e2e` queda intacta; nuevo `npm run test:setter`. Corre contra **build de producción** (`start:qa`, :3001), no `next dev`. Aserciones apoyadas en **estado de DB** tras cada acción (robustas a copy) + selectores reales del descubrimiento. Helpers: seed/teardown namespaced con borrado por id exacto, resolución de persona, minteo de cookie de sesión, guard de consola.

**Lo que QUEDÓ VERIFICADO:**
- **6 invariantes verdes** (`check:invariant*`) — prueba de dominio de aislamiento/escalamiento/novedades/mis-números/timeline.
- **Harness del suite ejecuta OK** contra el build prod (seed/teardown/auth/persona/mint corren sin error; el suite llega hasta `page.goto`). Teardown limpio: cleanup final `leads=0 users=0 notices=0` en la Neon compartida.
- `tsc --noEmit` exit 0 sobre todo el repo (incluye los specs nuevos; **`next build` type-checa `tests/`** → los specs deben estar type-clean o rompen el build).

**Lo que QUEDÓ BLOQUEADO (environment del host, NO defecto de código):** los browsers de Playwright (Chromium **y** Firefox) dan `ERR_CONNECTION_REFUSED` contra el server local, mientras `curl`/`Invoke-WebRequest`/Node llegan (200/403). Probado sin éxito: IPv6→IPv4, `--no-proxy-server`, puerto virgen, bind `-H 127.0.0.1`, server gestionado vs externo. Como ambos browsers fallan igual pero los clientes de sistema andan → seguridad/firewall del host bloqueando el loopback de los ejecutables de `ms-playwright`. **Para destrabar:** permitir esos binarios en el AV/firewall, o correr en CI/otra máquina. El suite queda listo para correr.

**Bug encontrado (documentado, NO arreglado — es auth de prod):** `/api/qa/login` nombra el cookie por el protocolo del request (http → `authjs.session-token`), pero `src/auth.ts` lo nombra por `NODE_ENV` (production → `__Secure-authjs.session-token`). En prod-sobre-http el server busca el `__Secure-` y no lo encuentra → `Unauthorized` en todo `/setter`. Anda en dev (ambos sin prefijo). Workaround test-side: mintear el JWT con el nombre que el server prod lee (Chromium trata `127.0.0.1` como contexto seguro → acepta cookies `Secure`). Fix real (1 línea): que el route use `NODE_ENV` igual que `auth.ts`.

**Drift de migraciones — diagnóstico + decisión (NO aplicada, queda en el reporte):** `migrate status` dice "up to date" (72 migs, historia en sync) PERO el diff `schema↔DB` NO es vacío: la DB viva **NO tiene** `AgencySettings.singleton`(+índice), `Organization.avatar*/city/deletedAt/internalNotes`, `chatbot_lead.convertedToOsLeadId` — que el `schema.prisma` SÍ declara. Causa: la lane de clientes agregó esas columnas (migraciones + código que las usa: avatar, notas internas, hard-delete, conversión); la lane de leados trajo `20260621120000_reconcile_dev_drift_schema_align` que las **dropea** asumiendo que eran vestigios. Ambas se mergearon; la reconciliación (última por timestamp) ganó en la DB. **Landmine:** Prisma selecciona todos los scalars declarados → cualquier read de Organization/AgencySettings/chatbot_lead sin `select` explícito tira `column does not exist` en runtime → esas features de cliente están **rotas contra esta Neon** aunque el build compile. **Decisión (mía, a confirmar por Franco):** adoptar las columnas (el código las usa) → migración aditiva `IF NOT EXISTS` (en el reporte §2.5) aplicada **solo con `migrate deploy`**, NUNCA `migrate dev`/`reset`. Verificar read-only con `migrate diff … --exit-code` ("No difference").

**Verificación humana (Franco):** correr `npm run test:setter` (tras permitir los browsers de Playwright en el host) + leer `docs/smoke-report.md`. La Parte 1 te deja la verificación reducida a lo perceptual (que se vea bien / sea intuitivo / la guía enseñe / calidad de demos); la Parte 2 te da todo para completar los archivos de migración y cerrar el drift. Los 6 invariantes y el diagnóstico de migraciones ya están verdes/listos hoy.

**Estado: SUITE ESCRITA + TYPE-CLEAN, INVARIANTES VERDES, BUILD VERDE, MIGRACIÓN DIAGNOSTICADA.** Ejecución browser pendiente del desbloqueo del host; reconciliación pendiente de tu OK.
