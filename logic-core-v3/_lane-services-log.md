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
- **Sprint 0** — doc persistido. _(en progreso)_
