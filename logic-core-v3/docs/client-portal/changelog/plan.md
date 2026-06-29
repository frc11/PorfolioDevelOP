# Changelog — Mi plan (Portal Cliente)

Sección `/dashboard/plan` — medidor de consumo mensual \+ vitrina de los 3 planes del cliente. Estado: cerrada en `lane/plan`, esperando merge a `main` (los merges los hace Valentino).

---

## Qué se hizo

### Reskin frosted a paridad admin

Todas las cards de la sección se migran a los tokens de la `GlassCard` del admin, tomando como ancla concreta `admin/settings/_components/settings-console.tsx`:

- **Card top-level** (`UsageMeter`, cada tier card de `PlansShowcase`): `rounded-2xl bg-[#0c0e12]/80` → `rounded-[30px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl`  
- **Sub-cards** (bloque de mensaje del meter, `LockedCelebrationFooter`, `LockedTeaserItem`): `rounded-xl bg-white/[0.02]` → `rounded-[24px] border border-white/10 bg-black/20 p-4`  
- En `PlansShowcase`, el `border` de la tier card queda intencionalmente sin color en la base para que el override de acento (cyan para el plan actual, amber para el destacado, `white/10` para el resto) gane sin pelear con el orden de compilación de Tailwind.

### Hover

- **Tier cards** (`PlansShowcase`): `adminHoverCls` de `@/lib/hover` — scale 1.015 \+ ring \+ shadow, ya `motion-reduce`\-safe. Reemplaza el `transition-all` previo.  
- **Meter card** (`UsageMeter`): hover **sin scale** — `transition-colors hover:border-white/20`. El scale se descarta expresamente: la barra de progreso es un child de la card y se desplazaría visualmente con el scale-transform, lo cual resulta en un efecto de salto. Solo el borde se aclara al hover.

### Estado vacío "sin bot"

`snapshot.hasBotConfigured` ya llegaba en el `OrgUsageSnapshot` pero `UsageMeter` lo ignoraba. Con un plan asignado pero sin bot configurado, el medidor mostraba "0 de N clientes este mes"

+ mensaje `calm` — confuso, porque el cliente no atendió a nadie; su vendedor virtual ni siquiera está activo todavía.

Ahora, cuando `!snapshot.hasBotConfigured`, el componente hace un early-return a una card de onboarding (misma superficie frosted, sin barra ni contador): "Tu vendedor virtual todavía no está activo" \+ texto explicando que el consumo va a aparecer cuando el bot esté configurado. Respeta `hideUpgradeHint` (pero ver punto siguiente).

### CTA "Activá tu vendedor virtual"

El estado vacío incluye un CTA que registra la intención de activar el bot con el equipo. `UpgradeCtaButton` se extiende con props opcionales `featureKey?` y `featureName?` (backward-compatible — si no se pasan, el componente deriva `plan-upgrade-{key}` / `Plan {name}` como antes, sin cambio visible en `PlansShowcase`). El CTA del empty usa:

- `featureKey='bot-activation'` · `featureName='Activación de tu vendedor virtual'`  
- acento cyan (no es upsell de plan: no corresponde amber)  
- label: "Activá tu vendedor virtual"  
- visible **siempre** en el empty, no lo gobierna `hideUpgradeHint`

`requestUpsellAction` queda **congelado** — solo se llama. Su esquema Zod acepta cualquier `featureKey` de min(1), y el lookup de `premiumModule.slug` hace skip silencioso para `'bot-activation'` igual que para los `plan-upgrade-*`. Cero server action nuevo, cero cambio de firma.

### Spinner de pending en UpgradeCtaButton

El estado `isPending` (vía `useTransition`) era invisible al ojo — solo `disabled + cursor-wait + opacity-60`. Ahora muestra un `Loader2` (`strokeWidth={1.5}`, `animate-spin`, `size=13`):

- En el variant **highlighted** (amber): reemplaza el `<Sparkles>` in-place al mismo tamaño.  
- En el variant **default** (cyan): se antepone al label sin ícono líder.  
- El botón sigue `disabled` \+ `aria-busy` \+ bloqueado a doble-click.  
- Sin cambios a `requestUpsellAction` ni a `window.location.assign`.

### Fullwidth \+ skeletons alineados

El cap `mx-auto max-w-7xl` se quita de `page.tsx` y `loading.tsx`. El contenido ocupa el ancho completo del shell (el `<main>` del dashboard ya aporta el padding lateral — `p-4 sm:p-6` — por lo que no queda edge-to-edge). Contenedor: `flex w-full flex-col gap-8 pb-20 sm:gap-10`.

Los tres skeletons (inline en `page.tsx` \+ `loading.tsx`) se actualizan para espejarse a las formas finales: `rounded-[30px]` para la card del meter y grid `lg:grid-cols-3` (mismo `gap` que `PlansShowcase`) para los tiers. `LoadingState` es frozen; el radio entra por `className` (`cn = twMerge`, gana sobre `rounded-2xl` de la base). Resultado: cero salto de ancho ni de forma al hidratar.

### Por qué no se adoptaron AnimatedProgressBar ni AnimatedCounter

Ambos son componentes compartidos ya existentes. Se descartaron como herramientas en este lane:

- `AnimatedProgressBar` trae copy hardcodeado del flujo de proyectos ("¡Proyecto completado\! 🎉") y un gradiente cyan fijo — incompatible con el medidor tono-variable de `UsageMeter` (4 tonos: calm/busy/crowded/full, cada uno con su gradiente propio).  
- `AnimatedCounter` usa `Math.round().toString()` — rompe el formato es-AR (`"1.234"`, punto como separador de miles) que `formatNumberEs` entrega. Adoptarlo sería regresión de formato, no mejora.

Se mantienen la barra inline tono-aware y el contador con `formatNumberEs`.

---

## Blast radius

`UsageMeter` es un componente compartido. Se monta en **dos rutas**:

- `/dashboard/plan` — con `hideUpgradeHint={true}` (el hint de upgrade a `/dashboard/plan` no tiene sentido si ya estás ahí; la vitrina de planes está debajo).  
- `/dashboard` (home) — sin `hideUpgradeHint` (muestra el hint si el uso lo justifica: ≥85%).

El reskin, el estado vacío y el CTA de activación **propagan a ambas rutas** (DRY-correcto; es el comportamiento esperado de un componente compartido). La verificación visual debe cubrir las dos.

---

## Gate (cómo se verificó)

**Gate técnico por sprint:**

- `.\node_modules\.bin\tsc.cmd --noEmit` corrido **solo** (PowerShell, sin encadenar) → 0 errores nuevos en cada sprint. El build completo está ROJO por deuda baseline ajena (`@googleapis/webmasters` faltante \+ `react-hooks/set-state-in-effect` en `PreloaderContext`) → `npm run build` **no forma parte del gate** de este lane.  
- Lint limpio solo en los archivos tocados por sprint. Única deuda pre-existente: warning `isUpgrade` sin uso en `PlansShowcase.tsx` (prop de `PlanCta`, anterior al lane) — no se toca; refactorizarlo es fuera del scope del reskin.  
- Un commit por sprint, SIEMPRE. Commits de comportamiento separados de los cosméticos (revertibilidad individual; visual-qa no cubre comportamiento).

**Visual-QA:** El subagente `visual-qa` quedó **bloqueado** en la corrida desatendida: la ruta `/dashboard/plan` tiene auth-wall de cliente y el endpoint documentado `/api/qa/login` es bloqueado por el clasificador de auto-mode (lo lee como bypass de auth). Se registró 1 intento fallido en S2; no se re-intentó por sprint (mismo bloqueo, gasto sin resultado). La verificación visual de reposo \+ hover \+ coreografía la hizo **Valentino** contra `:3000` por grabación.

Como compensación, se corrió un **workflow de review adversarial no-visual** (3 dimensiones: regresión de callers, scope/frozen/any/multi-tenant, tokens de aceptación). Resultado: **0 hallazgos confirmados**.

---

## Archivos tocados

src/app/(protected)/dashboard/plan/page.tsx

src/app/(protected)/dashboard/plan/loading.tsx

src/components/dashboard/plan/UsageMeter.tsx

src/components/dashboard/plan/PlansShowcase.tsx

src/components/dashboard/plan/UpgradeCtaButton.tsx

(Más `lane-plan-log.md`, el log de control de ejecución del lane. Ningún archivo frozen tocado. Cero `any` introducido.)

---

## Pendientes / out-of-scope

Estos ítems fueron identificados durante el lane pero **no se construyeron acá**:

1. **Panel "mis servicios \+ CTA a `/dashboard/services`"** → diferido a post-merge. Involucra otra sección del portal y una decisión pendiente de diseño (catálogo fijo vs. servicios activos de la org). Se registra para un lane propio.  
     
2. **`/dashboard/plan` sin `error.tsx`** → pendiente para un lane futuro. Este es un lane de rediseño visual; agregar un boundary de error es construcción. `loading.tsx` y el estado vacío de "sin bot" sí se cubren.  
     
3. **Warning lint `isUpgrade` sin uso en `PlansShowcase.tsx`** — prop pre-existente de `PlanCta`, anterior al lane y no introducido por el reskin. Limpiarlo es un refactor independiente.  
     
4. **Doble fetch de `getOrgUsageSnapshot`** — la página llama `getOrgUsageSnapshot` dos veces (una por cada `<Suspense>` wrapper), lo que habilita el streaming independiente de cada bloque. `lib/plan` es frozen; colapsar los dos fetches a uno mataría el streaming. Se conserva a propósito; el costo es 2 reads de la misma vista materializada.
