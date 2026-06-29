# develOP — Dashboard (admin): registro de cambios (cierre de etapa)

Cierre del trabajo sobre el **módulo Dashboard del admin** (Logic Core v3), realizado como **lane/dashboard** en una tanda de trabajo en paralelo (3 lanes en git worktrees). **Repo:** github.com/frc11/PorfolioDevelOP · **app:** logic-core-v3/ · **archivos:** `src/app/(protected)/admin/page.tsx` \+ `loading.tsx` \+ `_components/dashboard-history-charts.tsx` \+ `_components/chart-card.tsx`. **Fecha de cierre:** 16 de junio de 2026\.

**Naturaleza del módulo.** El Dashboard del admin es un **agregador read-only** (\~833 líneas en `page.tsx`): hace \~16 reads en un `Promise.all`, calcula KPIs y dibuja 4 gráficos recharts. **No escribe nada** (cero server actions). Por eso todas las mejoras de esta tanda fueron de **visualización / UX / presentación**, nunca de datos. Lane verificado: cero archivos fuera de scope, cero toques a schema o shared.

---

## 1\. Cambios hechos

Listados en el orden de los commits del lane (todos contra el merge-base `d97f9c6`; mergeado a main en `4cdd988`).

### Limpieza de código muerto (`c092747`)

Borrado puro de material no usado: `totalRangeHours` (cálculo \+ tipos), las props `revenue`/`closed`/`responded` que no se dibujaban y sus campos de tipo, y el branch inalcanzable `if (name==='revenue')` del tooltip de ingresos.

### Typos de copy (`5e25ea9`)

`operacion→operación`, `aca→acá`, `distribucion→distribución`, `Todavia→Todavía`.

### Labels precisas en las métricas (`651f68e`)

`DualMetricCard` suma props `primaryHint`/`secondaryHint` y reescribe el subtítulo para aclarar qué mide cada número: "Tasa de respuesta" (snapshot del estado actual) vs "Tasa de cierre" (histórico, distinto del chart mensual). **Sin tocar los cálculos** — solo aclara qué significan.

### Empty / zero states (`8acb272`)

Componente `<ChartEmptyState>` reutilizable \+ guards `hasDemos`/`hasCloseData`/`hasRevenue` en los 3 charts que no los tenían; el de horas pasa a reusar el mismo componente. Nada de gráficos vacíos sin explicación.

### Loading alineado al layout real (`5bb5e38`)

Grid financiero `xl:grid-cols-3 → [0.95fr_1.1fr_0.95fr]` (celda central más alta); charts `lg → xl:grid-cols-2`; alto `h-64 → h-[400px]`. El skeleton ahora matchea la grilla real, sin salto al cargar.

### A11y \+ jerarquía \+ moneda (`8caad3c`)

`ChartCard` pasa de `<h3>` a `<h4>` (jerarquía correcta) \+ `role="img"`/`aria-label` con una prop `summary` por chart; moneda unificada a formato `USD …` (con `YAxis` de ingresos `width=80`, `margin.left 0`); `aria-hidden` en íconos decorativos \+ el `strokeWidth={1.5}` que faltaba en `MemberHoursCard`.

### Motion respetando reduced-motion (`4683a2f`)

`useReducedMotion()` \+ `isAnimationActive={!reduced}` en las 4 series de los gráficos; saca el `transition-[width]` de la barra de `MemberHoursCard`; elimina `transition-colors` muertas en `DualMetricCard`/`MemberHoursCard`.

### Hover en las cards — Fase 2 (`1ded1c7`)

Wrapper externo `<HoverCard>` (un `div` con `grid`) en las 10 cards KPI y en el `<article>` de `ChartCard`: `scale 1.015` \+ shadow \+ `ring-white/15`, 200ms, easing de la guía de motion, con `motion-reduce:*`. **No toca `StatCard`** (frozen-ish, shared) — el hover vive en el wrapper externo.

### Vida — animación de entrada, Fase 3A (`a9739cc`)

Reveal a nivel sección (header \+ 4 bloques): fade \+ `translateY(8px)`, stagger 0/0.06/0.12/0.18/0.24s, vía un `@keyframes dashReveal` en `<style>` inline. Se usó **CSS, no `motion/react`**, para evitar conflicto del `transform` con el hover de Fase 2 y no introducir un client boundary en un server component.

### Estética mínima — Fase 3B (`3240425`)

`space-y-8 → space-y-10`; descripción de `SectionHeader` `text-zinc-400 → text-zinc-500`; 2 boxes internos de `DualMetricCard` `rounded-md → rounded-xl`.

---

## 2\. Decisiones cerradas (no son deuda)

- **"Más datos derivables" (Fase 3\) NO se ejecutó:** los candidatos a exponer (`revenue`/`closed`/`responded` por mes, `totalRangeHours`) se habían **borrado** en `c092747` por decisión de Fase 1, así que la Fase 3 quedó sin material. Decisión cerrada, no pendiente.  
- **Count-up de KPIs: descartado.** `StatCard` (shared) no deja animar su `value`, y los números son chicos / strings con formato. No se sumó `motion/react` para esto.  
- **La entrada es CSS, no `motion/react`** — decisión deliberada (ver Fase 3A).

---

## 3\. Deuda / pendiente

- **Baseline `cumulativeRevenue` (`page.tsx:500`):** `cumulativeRevenue += revenue` dentro de un `.map()` dispara `react-hooks/immutability` en el lint. Es **pre-existente** (ya estaba antes del lane), no introducido acá. El fix es un refactor del cálculo financiero fuera del `map` — no se tocó por estar fuera del scope acordado. Queda a criterio.  
- **`bg` de `MemberHoursCard`** (`bg-white/5`) más brillante que sus vecinas `StatCard` (`bg-white/[0.02]`) en la fila financiera. No igualado (posible énfasis intencional). Fix de 1 línea si se quiere.  
- **Pendientes de coordinación ya resueltos post-merge** (estaban bloqueados por archivos shared, se cerraron en la tanda transversal — ver el registro Transversal): el typo "Requiere atención" de `StatCard`, el `aria-hidden` \+ `motion-reduce` de `StatCard`/`Skeleton`.

---

## 4\. Estado del gate (en el cierre del lane)

- **`tsc --noEmit`** → exit 0, sin errores de tipos.  
- **ESLint (4 archivos)** → 1 error, **0 nuevos** (el `cumulativeRevenue` baseline de arriba).  
- **Aislamiento:** verificado contra `git diff --stat` — solo los 4 archivos del scope \+ el log de control. Cero toques a `StatCard`, `ui/*`, `schema.prisma`, chrome admin, `action-utils`, `auth-guards`.  
- **Verificación visual:** hecha por el humano, fase por fase. No se corrió `visual-qa` automatizado (el MCP de preview es flaky en este repo).

---

## 5\. Lecciones / notas

- **Read-only no es excusa para no documentar dependencias:** el dashboard LEE muchos modelos de otros módulos. Si otro lane renombra/borra un campo (ej. valores de `LeadStatus`, que alimentan `DEMO_PIPELINE_STATUSES`/`RESPONDED_PIPELINE_STATUSES`), el dashboard rompe en silencio. Esa lista de dependencias cross-módulo quedó registrada en la auditoría de cierre.  
- **El hover en wrapper externo, no en la primitiva:** para no tocar `StatCard` (shared), el hover se montó en un `<HoverCard>` que lo envuelve. Patrón a reusar cuando hay que animar algo que vive en una primitiva compartida.  
- **CSS vs `motion/react` en server components:** la animación de entrada se hizo en CSS para no convertir el server component en client y no pelear con el `transform` del hover. Criterio para animaciones de entrada en páginas server.
