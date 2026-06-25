# Rediseño visual — `/dashboard/services` (Portal Cliente) — fuente de verdad de la lane

> **Branch:** `lane/services`. **Modo:** rediseño visual (NO construcción — la sección ya anda end-to-end).
> **Scope de escritura:** 3 archivos de código + este log. Todo lo demás read-only.
> **Decisiones del usuario (2026-06-24):** (1) Tipografía = **alineación total al admin** (liviano: `font-medium`/`text-sm`/`text-zinc-400`); (2) Module-cards = **mantener accent por módulo** + sumar `adminHoverCls`.

---

## Contexto

`/dashboard/services` ya funciona: `service.findMany` por org de la **sesión** + catálogo `premiumModule` (ACTIVE/COMING_SOON, data-driven) + upsell vivo, con empty y loading. El problema es **visual**: la sección no habla el lenguaje del resto del sistema. Sus cards usan tipografía negro-pesado-uppercase, radios/bordes/superficies fuera del token set, y hovers ad-hoc (CSS group-hover en `ServiceCard`, Framer `whileHover` en `PremiumModuleCard`) que predan al `adminHoverCls` que estandarizó la ola del portal. El objetivo: que las cards/pricing hablen el vocabulario de la **consola de pricing del admin** y que el chrome de página herede las convenciones de las secciones ya rediseñadas (lead-pipeline, Soporte, Mensajes) — **sin inventar estética nueva, sin tocar frozen, sin cambiar el contrato de `upsell.ts`**.

---

## Mapa del Explore (fuente de verdad)

### Scope de escritura (propio)
| Archivo | Hoy renderiza | Hover hoy | Tipografía hoy |
|---|---|---|---|
| `app/(protected)/dashboard/services/page.tsx` | server comp; `resolveOrgId()` + 2 queries; `ServiceCard` inline; header upsell con gradiente; dividers; empty | CSS `transition-all` + group-hover glow-opacity | nombre `text-xl font-black uppercase`; desc `text-xs text-zinc-500` |
| `components/dashboard/PremiumModuleCard.tsx` | `'use client'`; card catálogo con 4 estados (idle/pending/success/error) + coming-soon; llama `requestUpsellAction(slug,name)` + `triggerTransition` | Framer `whileHover` boxShadow accentColor | nombre `text-[13px] font-black`; desc `text-[11px] text-zinc-500` |
| `app/(protected)/dashboard/services/loading.tsx` | skeleton genérico (CardSkeleton) que **no** matchea la estructura real | — | — |

**`<></>` muerto:** `PremiumModuleCard.tsx:102` (`<>`) + `:252-253` (`</>`) envuelven un único `<motion.div>` → eliminar el fragment. (Cosmético, sin cambio de comportamiento → va en el commit de reskin del Sprint 1.)

### Referencia PRIMARIA — consola de pricing del admin (`admin/settings/_components/settings-console.tsx`, SOLO LEER)
- Card de módulo: `rounded-[24px] border border-white/10 bg-black/20 p-4` + `adminHoverCls` (`:360-362`).
- Wrapper GlassCard: `rounded-[30px] border-white/10 bg-white/5 p-6 backdrop-blur-xl` (`:666-671`).
- Nombre: `text-sm font-medium text-white` (`:368`). Descripción: `text-sm leading-6 text-zinc-400` (`:383`).
- Badge: `rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]`; ACTIVE = `border-emerald-400/20 bg-emerald-500/10 text-emerald-200`; inactivo/neutral = `border-white/10 bg-white/5 text-zinc-400` (`:369-381`).
- SectionTitle eyebrow: `text-[10px] uppercase tracking-[0.24em] text-zinc-500`; título `text-2xl font-semibold text-white` (`:648-663`).
- **Sin 1:1:** el admin EDITA precio (input); el cliente lo MUESTRA. Se porta el *vocabulario* (chrome, tipografía, badge, formato USD), no la pantalla.

### Referencia SECUNDARIA — chrome de la ola (hermanas, SOLO LEER)
- **`adminHoverCls`** (`@/lib/hover.ts:5`, FROZEN — solo consumir): `transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none`. Se aplica **directo en className**. El `<HoverCard>` que mencionaba la memoria **NO existe como componente** — el "wrapper" es solo un div con la clase; como mis cards son propias, aplico `adminHoverCls` directo (sin wrapper). Existe `adminHoverAmplifiedCls` (scale-1.02) pero la ola NO lo usa.
- Loadings que **matchean estructura + tokens de superficie reales** (`dashboard/messages/loading.tsx`, `dashboard/chatbot/leads/loading.tsx`): `animate-pulse`, `border-white/[0.06] bg-white/[0.015]`, anchos que siguen el contenido.
- Entrada en CSS sin volver client: `FadeIn` (client leaf) + `StaggerContainer/Item` envueltos desde la page server → la page **sigue server**.
- Dividers (ya correctos en services): label `text-xs font-bold uppercase tracking-widest text-zinc-600` + `h-px flex-1 bg-white/[0.05]`.
- Tokens de superficie de la ola: borde `border-white/10`; panel `bg-white/[0.04]`; card `bg-white/5`; elevado `bg-white/[0.07]`; badge oscuro `bg-black/20`; radios 22–26px; `backdrop-blur-xl`.

### Contratos de datos (confirmados, read-only)
- **`priceMonthlyUsd` = `Float`** (NO Decimal) → sin problema de serialización; el pase crudo a `PremiumModuleCard` (prop `number`) es correcto.
- **`resolveOrgId()`** (`lib/preview.ts:6-20`): ORG_MEMBER → org de la **sesión**; SUPER_ADMIN → org de impersonation activa o `null`. **Nunca por URL.** Multi-tenant seguro. ✓
- **`upsell.ts`** = contrato congelado: `requestUpsellAction(featureKey, featureName): Promise<ActionResult>` con `{ success, error?, data? }`; tiene Zod (`UpsellRequestSchema`) + chequeo de sesión. El rediseño NO necesita nada nuevo de upsell → **no hay parada**.
- `PremiumModule` trae `longDescription?` (hoy sin usar) y `validRubros[]` (sin filtrar acá — se muestran todos). Enums status: ACTIVE/COMING_SOON/DEPRECATED (la page ya excluye DEPRECATED).

---

## Gaps a cerrar

**D1 — diferencias con el lenguaje del admin (cómo se cierran):**
- *Chrome de card:* radio `rounded-2xl`→`rounded-[24px]`; borde `border-white/5`→`border-white/10`; superficie (`ServiceCard` `bg-[#07080a]/70`, `PremiumModuleCard` `bg-white/[0.025]`)→ `bg-white/[0.04]`/`bg-white/5`.
- *Tipografía (decisión: total al admin):* nombre→`text-sm font-medium text-white` (module) / `text-lg font-semibold text-white` (service, drop uppercase+black); desc→`text-sm leading-6 text-zinc-400`; eyebrows/labels de sección quedan uppercase (vocab admin `tracking-[0.24em]`).
- *Badge:* sizing/tracking→`text-[11px] tracking-[0.16em]`; ACTIVE emerald estilo admin.
- *Pricing:* sin 1:1; se mantiene el display de dos niveles, alineado a la voz liviana + `tabular-nums`.

**D2 — correcciones del admin/ola a heredar:**
- `adminHoverCls` (GPU-only, `motion-reduce`, sin `will-change`, scale 1.015 que NO desborda) reemplaza los hovers ad-hoc (CSS group-hover y Framer `whileHover`).
- Loading que matchea el contenido real (estructura + tokens) en vez del skeleton genérico.
- Disciplina de tokens de superficie de la ola.
- Page sigue server (FadeIn/Stagger como leaves); `ServiceCard` sigue server (adminHoverCls es className puro).

---

## Plan en sprints (commit por sprint)

> **Sprint 0 (no-código):** este doc. ✔

### Sprint 1 — `PremiumModuleCard.tsx` (la card 1:1 con el admin)
- Eliminar el `<></>` muerto (devolver el contenedor directo). Card wrapper → `<div>` plano con `adminHoverCls` (el botón queda `motion.button` por `whileTap` + `AnimatePresence`); **drop** del Framer `whileHover`. Importar `adminHoverCls` de `@/lib/hover`.
- Chrome admin: `rounded-[24px]`, base `border-white/10 bg-white/5`, coming-soon dimmed (`bg-white/[0.04]` + opacity), success emerald (mantener), `backdrop-blur-xl`.
- Accent (mantener): caja de ícono accentColor, glow blob estático accentColor, pill "Disponible" accentColor.
- Tipografía total-admin: nombre `text-sm font-medium text-white`; desc `text-sm leading-6 text-zinc-400`; tier eyebrow `text-[10px] uppercase tracking-[0.24em] text-zinc-500`.
- Badge admin: `text-[11px] tracking-[0.16em] px-2.5 py-1`; COMING_SOON amber; **"Premium" rojo+Lock → neutral** (`border-white/10 bg-white/5 text-zinc-300`) para igualar la calma del admin (recomendado; vetoable en approval).
- Precio: dos niveles, número `text-lg font-semibold tabular-nums text-white` + sufijo `text-xs text-zinc-500`; label "Desde" eyebrow.
- **Preservar los 4 estados** (idle/pending/success/error) + coming-soon, el call `requestUpsellAction(slug, name)` sin cambios y el `triggerTransition` post-éxito.
- *Ancla:* `settings-console.tsx` (card/badge/tipografía) + `hover.ts:5`.
- *Aceptación visual:* las module-cards se PERCIBEN como las filas de pricing del admin (tipografía liviana, radio 24px, borde white/10, badges calmos) **conservando** el color por módulo (ícono/glow/pill); hover uniforme `adminHoverCls` (scale sutil + ring blanco + sombra, respeta motion-reduce, sin desbordar borde); los 4 estados siguen funcionando; sin fragment muerto.

### Sprint 2 — `services/page.tsx` (ServiceCard inline + chrome de sección)
- ServiceCard: `rounded-[24px]`, `border-white/10`, superficie `bg-white/[0.04]`, `backdrop-blur`; reemplazar `transition-all hover:border-white/10`+group-hover por `adminHoverCls` (mantener glow blob accent por tipo de servicio — color documentado "do not change"). ServiceCard **sigue server**.
- Tipografía total-admin: nombre `text-lg font-semibold text-white` (drop uppercase/black/tracking-tight); "Servicio Principal" eyebrow `text-[10px] uppercase tracking-[0.24em]`; descripción `text-sm leading-6 text-zinc-400`; "Activo desde"/fecha eyebrow chico.
- Link "Ver detalles": mantener (target `/dashboard/messages` vía `<Link>`); pill de estado emerald/amber/red (ya cercano al admin) se mantiene.
- Header upsell "Subí al Siguiente Nivel": mantener el gradiente (es el único momento de marca intencional / hero del upsell); sub-copy a `text-zinc-400`. Dividers ya correctos.
- Mantener EmptyState + FadeIn/Stagger + `resolveOrgId` + las 2 queries sin cambios.
- *Ancla:* GlassCard/SectionTitle del admin + tokens de la ola + `hover.ts:5`.
- *Aceptación visual:* las service-cards comparten radio/borde/superficie/hover con las module-cards y el admin; voz tipográfica liviana; accent por tipo de servicio intacto; hover uniforme sin desborde; empty state preservado.

### Sprint 3 — `services/loading.tsx` (matchear el contenido rediseñado)
- Reconstruir el skeleton espejando la page: `mx-auto max-w-5xl ... pb-20`; skeleton de PageHeader (caja de ícono + eyebrow + título + desc); divider "Contratados" + grid 2-col de service-skeletons a `rounded-[24px]` con `border-white/[0.06] bg-white/[0.015]`; skeleton de header upsell; divider "Disponibles" + grid 3-col de module-skeletons (~min-h 260, `rounded-[24px]`). `animate-pulse` (motion-reduce safe vía `Skeleton`).
- *Ancla:* loadings de messages/leads.
- *Aceptación visual:* la silueta de carga matchea el layout real (anchos, ritmo de secciones, radio 24px) — sin salto al cargar el contenido.

---

## Paradas / Pendiente de coordinación
- **Ninguna parada bloqueante.** El rediseño entra 100% en el scope de escritura (3 archivos) consumiendo solo primitivas compartidas read-only. No toca schema / ui/* / shell admin / drift de Franco, ni cambia el contrato de `upsell.ts`.
- **Cosmético flagueado (vetoable en approval, no parada):** badge "Premium" rojo+Lock → neutral para igualar la calma del admin. Si se prefiere conservar el rojo, es trivial dejarlo.
- `adminHoverCls` / `FadeIn` / `StaggerWrapper` / `ui/*` / `lib/preview` / `upsell.ts` → **solo se importan**.

---

## Verificación (gate post-sprint, el humano confirma en :3000)

> ⚠️ **El build NO es verde:** baseline ROJO **ajeno** — `@googleapis/webmasters` faltante (resuelve a nivel webpack/build, NO a nivel tsc) + `react-hooks/set-state-in-effect` en `PreloaderContext` (FROZEN). **No** correr `npm run build` como gate. (Confirmado 2026-06-24: `tsc --noEmit` baseline = 0 errores en esta worktree.)

1. **`.\node_modules\.bin\tsc.cmd --noEmit`** desde `logic-core-v3/` → **sin errores NUEVOS** (baseline = 0). NUNCA `npx tsc`. Correr `tsc` **solo**, NO encadenarlo con `Remove-Item .next` por `;`.
2. **eslint limpio** en los 3 archivos tocados (**cero `any`**).
3. **`git diff --name-only`** → SOLO los 3 archivos del scope + `_lane-services-log.md`. **Cero** toques a schema / ui/* / shell admin / frozen / `lib/preview` / `upsell.ts`.
4. Subagente **`visual-qa` desktop + mobile** (reposo + no-regresión): chrome de cards, `adminHoverCls` (+ `prefers-reduced-motion`), badges, formato de precio, empty state, silueta del loading; flujo de upsell (idle→pending→success→`triggerTransition`) + path de error. ❌ → no cerrar; ❓ → flag al humano.
5. El humano valida visualmente en **localhost:3000**.

> **ELIMINADO del gate:** `npm run build` (baseline rojo ajeno) y `npx prisma migrate status` (rediseño visual, cero schema).

---

## Bitácora de ejecución
- **Sprint 0** (`5d97587`) — doc persistido como fuente de verdad.
- **Sprint 1** (`97c02c1`) — PremiumModuleCard reskin (chrome 24px, adminHoverCls, tipografía liviana, badge Premium→neutral, precio tabular-nums, accent intacto, `<></>` muerto fuera).
- **Sprint 2** (`ab86804`) — ServiceCard + chrome de sección al lenguaje admin.
- **Sprint 3** (`a6550e9`) — loading.tsx espeja la page.

## Sprint 4 — refinamiento full-width + paridad de paneles
- **Anclas:** ancho → secciones del portal (`dashboard/soporte/page.tsx` usa `flex w-full flex-col gap-4`, el padding lo da `<main>`); estructura de panel → admin `settings-console` (GlassCard + superficie anidada).
- **page.tsx:**
  - Container full-width `flex w-full flex-col gap-6` (fuera `mx-auto max-w-5xl pb-20`). Header flush izq / badge "N servicio activo" flush der (vía `PageHeader action`, ya estaba).
  - "Contratados", "Disponibles" y "Próximamente" envueltos cada uno en GlassCard `rounded-[30px] border-white/10 bg-white/5 p-6 backdrop-blur-xl`.
  - El eyebrow de sección pasa a **header del panel** (`text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400` + grid `mt-5`); **eliminados los hairline dividers flotantes** (`h-px bg-white/[0.05]`).
  - **Superficie anidada:** las cards DENTRO del panel bajan a `bg-black/20` (contrastan con el `bg-white/5` del panel); se mantiene `border-white/10`, `rounded-[24px]`, `adminHoverCls`.
  - **Upsell header "Subí al Siguiente Nivel" standalone** entre Contratados y Disponibles, gradiente preservado.
  - **Grids que llenan:** Contratados `sm:grid-cols-2 xl:grid-cols-3`; Disponibles/Próximamente `sm:grid-cols-2 lg:grid-cols-3`. Con 1 card queda flush-izq y las celdas vacías no renderizan nada (no había orphan/spinner que sacar). Paneles hugean el contenido (sin alto fijo).
  - **Decisión menor:** "Próximamente" sigue el MISMO patrón de panel (3er GlassCard) por consistencia — no estaba nombrado explícito en el brief; extensión natural del patrón, sin estética nueva.
- **PremiumModuleCard.tsx:** solo el token de superficie (available + coming-soon → `bg-black/20`). Sin tocar estados/accent/upsell/tipografía.
- **loading.tsx:** re-espejado full-width + dos paneles GlassCard con headers + grids 2/3-col anidados a `rounded-[24px]`, skeletons `border-white/[0.06] bg-white/[0.015]`. Sin layout shift.
- **NO tocado:** schema, ui/*, shell, frozen, `lib/preview`, contrato `upsell.ts`, `resolveOrgId`, las 2 queries, los 4 estados de upsell, `triggerTransition`, gradiente del header upsell, accent por módulo/servicio, tipografía liviana.
- **Gate:** tsc 0 / eslint 0 (3 archivos) / diff acotado. visual-qa → humano en :3000 (preview/browser MCP ausente en sesión).

## Hotfix — boundary server/client del empty state
- **Síntoma:** "Functions cannot be passed directly to Client Components" → la page no renderiza con org sin servicios.
- **Causa raíz:** `EmptyState` (`@/components/ui/*`, **FROZEN**) es **`'use client'`** y su API exige `icon: LucideIcon` (referencia de componente). La page server le pasa `icon={FolderOpen}` → la función cruza el boundary al serializar el client component. **No es FadeIn** el boundary — es el propio `EmptyState`; sacar el wrapper no alcanzaba.
- **Convención confirmada:** `PageHeader` (server) puede recibir `icon` (lo renderiza server-side); los client components reciben **string** y mapean adentro (`PremiumModuleCard.iconName`); las hermanas rediseñadas `resultados/{trafico,reputacion}` **hand-rollean** su empty inline.
- **Fix (caso frozen):** empty **hand-rolled inline** en `page.tsx`, con `FolderOpen` renderizado en JSX **server** (nunca cruza), replicando el look `EmptyState` lg/default (rounded-3xl dashed, icon chip cyan, título/desc, CTA `<Link>`), full-width, dentro de `<FadeIn>`. Se quitó el import de `EmptyState`. Sin tocar el frozen, sin volver client la page.
- **Hallazgo fuera de scope:** el mismo bug es **latente** en toda server page que pase un Lucide a `EmptyState` (project/agenda/tienda/motor-resenas/email-marketing/chatbot-settings) — reportado, no corregido (fuera de los 3 archivos).
- **Gate:** tsc 0 / eslint 0 (page.tsx) / diff = solo page.tsx + log. Único cruce de función al cliente eliminado (verificado estáticamente). Render real → confirma el humano en :3000 con org vacía.

## Sprint 5 — botón "Ver detalles" + modal de detalle del módulo (corrida desatendida 2026-06-25)
**Objetivo:** "Ver detalles" en las module-cards que abre un modal con la descripción general del módulo premium. Componente propio, reusable, portalizado a body.

**Archivos tocados (2 código + log):**
- **NUEVO** `components/dashboard/ServiceDetailModal.tsx` (`'use client'`, presentacional puro).
- `components/dashboard/PremiumModuleCard.tsx` (estado de apertura + botón(es) + preset + render del modal).
- `loading.tsx` → **NO tocado** (decisión documentada abajo: el alto de la card *available* no cambia).

**ServiceDetailModal.tsx (presentacional):**
- Props: `{ open, onClose, name, longDescription, icon: LucideIcon, accentColor, priceMonthlyUsd, tierLabel, isComingSoon }`. NO importa Prisma, NO server action, NO upsell — la card resuelve los datos y se los pasa listos. Recibe el `icon` ya resuelto (no duplica el `ICON_MAP`).
- **Portal a `document.body`** vía `createPortal` + gate `useIsClient` (escapa el `backdrop-filter` del `<main>` que atrapa `position:fixed`). Patrón copiado 1:1 de `LeadColumnOverview` (lead-pipeline): backdrop `fixed inset-0 z-[200] bg-[#05070a]/80 backdrop-blur-md`; panel `rounded-[30px] border-white/10 bg-[#0c1016]/95 backdrop-blur-xl` (misma superficie de modal que la hermana, más legible que `bg-white/5` sobre el backdrop oscuro).
- **Cierre:** botón X, click en backdrop (`onClick` en overlay + `stopPropagation` en panel), Esc. **Focus:** foco inicial al botón cerrar, trap básico (Tab/Shift+Tab ciclan dentro del panel), restore al cerrar; `body.overflow='hidden'` mientras está abierto. `role="dialog"`, `aria-modal`, `aria-label`.
- **AnimatePresence** entrada/salida (scale+opacity 0.24s ease de la ola) con `useReducedMotion` → sin animación si `prefers-reduced-motion`.
- **Contenido:** header = icon-chip accentColor + tier eyebrow + nombre (`text-lg font-semibold`, voz liviana) + badge (Premium neutral / "Próximamente Q3 2026" amber, igual que la card); cuerpo = eyebrow "Descripción general" + `longDescription` (`text-sm leading-7 text-zinc-300`); footer = precio "Desde $X USD/mes" (`tabular-nums`) o, si `isComingSoon`, nota "preparando para el catálogo comercial" (sin precio, coherente con la card que NO surfacea precio vendible en próximamente).

**Descripción = preset (decisión determinista, NO parada):**
- `PremiumModuleCard` **NO recibe** `longDescription` como prop hoy (la query no lo pasa y **ampliar el select queda fuera de scope** → no se tocó). Por lo tanto se usa el fallback diseñado: dict local `PRESET_MODULE_DETAILS` keyeado por slug + `GENERIC_MODULE_DETAIL` para slugs desconocidos. Marcado `// PLACEHOLDER — editar copy real luego`.
- El copy del preset refleja el catálogo vivo `@/lib/data/premium-modules.ts` (los `longDescription` reales del producto), así el humano ve copy correcto mañana, NO lorem. Si se quiere mostrar el `longDescription` real **de la DB**, hay que pasarlo como prop desde la page en un sprint aparte (no se hizo: implicaría tocar page.tsx/query, fuera de scope de Sprint 5).
- **NO** se importó `getModuleBySlug` ni se acopló la card al módulo de datos: el brief pidió explícitamente "dict local PRESET_MODULE_DETAILS". Se respetó la letra.

**Botones — DOS lado a lado (decisión de layout, clave):**
- **Available:** fila `flex items-stretch gap-2.5` = `[Ver detalles: botón icono `Info`, `w-11` `flex-shrink-0`, `aria-label`+`title`]` + `[Desbloquear: CTA intacto]`. El CTA cambió SOLO sus clases de ancho (`w-full` → `min-w-0 flex-1`) para compartir la fila; **comportamiento/estados/acción INTACTOS** (`requestUpsellAction(slug, name)` + `triggerTransition` + 4 estados idle/pending/success/error + `whileTap` + `AnimatePresence`, sin tocar).
- **Por qué "Ver detalles" es ICONO (no etiquetado) en available:** medí el ancho real. Sidebar `w-[240px]` + `<main>` `p-6` + panel `p-6` + grid `lg:grid-cols-3 gap-4` → en el tramo **lg (1024–1280px, 3 columnas)** la card baja a **~178px de ancho interno**, donde el label "DESBLOQUEAR MÓDULO" (~166px) ya usa casi todo el ancho del botón actual. Un segundo botón **etiquetado** forzaría stacking en casi todos los anchos (rompiendo "lado a lado") o haría wrappear el CTA. El botón **icono** (≈44px) es lo único que mantiene los dos **genuinamente lado a lado en todos los anchos reales**, con impacto de alto SOLO en el tramo lg (el label del CTA puede ir a 2 líneas ahí; `min-w-0` evita overflow). En mobile/2-col/xl entra en una línea. → **`loading.tsx` NO necesita cambio** (el alto de la card available no cambia salvo el tramo lg angosto, dentro del `min-h-[260px]` del skeleton genérico).
- **Coming-soon:** sin CTA Desbloquear (comportamiento actual intacto) → "Ver detalles" va **etiquetado full-width** debajo de la nota amber (hay lugar de sobra). Leve asimetría con el icono de available, justificada por el espacio disponible.

**Gate (corrida desatendida):**
- `tsc --noEmit` desde `logic-core-v3/` → **exit 0** (baseline 0 → 0 nuevos). ✓
- `eslint` sobre `ServiceDetailModal.tsx` + `PremiumModuleCard.tsx` → **exit 0**, cero `any`. ✓
- `git diff` → SOLO `PremiumModuleCard.tsx` (mod) + `ServiceDetailModal.tsx` (nuevo) + este log. Cero toques a schema/ui/shell/frozen/page.tsx/loading.tsx/upsell. ✓
- **visual-qa: NO ejecutable en esta sesión.** El único preview corre con `cwd: C:\PorfolioDevelOP` (= **main**, no el worktree) y la ruta es auth-gated; Next 16 no levanta un 2º dev server con :3000 activo. El preview no refleja el código de Sprint 5 → verificar contra él sería ver *main* sin estos cambios. Revisión hecha **estáticamente** (estructura del portal/focus-trap/props/scope, espejo de `LeadColumnOverview`). El humano hace la revisión visual mañana sobre el commit (gate 1–3 + commit ya gatean; el brief autoriza seguir si visual-qa no es ejecutable).
- **Commit del sprint.** ✓

**Reglas duras verificadas:** cero `any`; multi-tenant intacto (no se tocó `resolveOrgId`/queries/page.tsx); sin secrets; sin `router.push` (el modal no navega; el CTA sigue con `triggerTransition`); page.tsx sigue server, modal + card son client. Ninguna PARADA OBLIGATORIA gatillada (todo en scope propio).

---

## Cierre de la lane `lane/services`
**Estado:** Sprints 0–5 + hotfix commiteados en el worktree `C:\lane-services\logic-core-v3` (branch `lane/services`). **NO** merge, **NO** main — la integración la hace el humano. Working tree limpio.

| Commit | Sprint | Qué |
|---|---|---|
| `5d97587` | 0 | doc fuente de verdad (`_lane-services-log.md`). |
| `97c02c1` | 1 | reskin `PremiumModuleCard` al lenguaje del admin (chrome 24px, `adminHoverCls`, tipografía liviana, badge Premium→neutral, precio `tabular-nums`, accent intacto, `<></>` muerto fuera). |
| `ab86804` | 2 | reskin `ServiceCard` + chrome de sección. |
| `a6550e9` | 3 | `loading.tsx` espeja la page. |
| `7fda87c` | 4 | full-width + 3 paneles glass (Contratados/Disponibles/Próximamente) + superficie anidada + grids que llenan. |
| `91b3b20` | hotfix | empty state hand-rolled inline en page.tsx (boundary server/client de `EmptyState`). |
| (este) | 5 | botón "Ver detalles" + `ServiceDetailModal` portalizado a body, con preset de `longDescription` + 2 botones lado a lado. |

**Pendientes post-merge fichados (NO ejecutar en esta lane):**
1. **Modal de detalle de SERVICIOS CONTRATADOS** (el "Ver detalles" del `ServiceCard`, hoy `<Link>` a `/dashboard/messages`). Idea: "1 cuadro por servicio + N entidades por tipo de servicio". Es feature con relevamiento de `Project` + posible schema → fuera de un lane visual. El `<Link>` del `ServiceCard` quedó **como estaba** (sin tocar).
2. **Bug latente `EmptyState` + Lucide en server pages** (`project`, `modules/{agenda-inteligente,tienda-conectada,motor-resenas,email-marketing/*}`, `chatbot/settings`): pasar un `LucideIcon` a `EmptyState` ('use client', FROZEN) cruza una función por el boundary y la página no renderiza con data vacía. Mismo patrón que el hotfix de Sprint 5 anterior. NO tocado acá; **sigue fichado**.

**Mejora opcional futura (no bloqueante):** mostrar el `longDescription` real de la DB en el modal pasándolo como prop desde `page.tsx` (la query ya lo devuelve, no haría falta tocar el select) — reemplazaría el preset. Queda como mini-lane si se quiere copy 100% data-driven.
