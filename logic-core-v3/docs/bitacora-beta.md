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
