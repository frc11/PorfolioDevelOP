# Explore: lane/inicio — Dashboard Inicio (Cliente)

**Fecha:** 2026-06-27
**Branch:** lane/inicio (worktree C:\lane-inicio)
**Autor:** Read-only subagent — sin tocar código fuente

---

## 0. Contexto rápido

`/dashboard` = índice del portal cliente. Ya funciona end-to-end. El objetivo
del lane es **rediseño visual puro** — paridad con el admin — sin tocar datos,
schema ni componentes frozen. Lo que se lee aquí es el estado actual en `main`
antes de cualquier cambio.

---

## 1. Inventario de componentes

### 1.1 `src/app/(protected)/dashboard/page.tsx`

Server Component. `dynamic = 'force-dynamic'`. Resuelve `organizationId` vía
`resolveOrgId()` y redirige a `/login` si falla. Monta todo con `Suspense`
individual por bloque:

| Slot | Fallback | Componente hijo |
|------|----------|-----------------|
| Greeting | `PageHeaderSkeleton` (hand-rolled) | `DashboardGreetingWrapper` → `PageHeader` de ui/ |
| Onboarding | `null` | `OnboardingStatusCard` |
| HealthScore | `HealthScoreSkeleton` (h-[360px] pulse) | `HealthScoreServerWrapper` → `HealthScore` |
| AttentionStack | `null` | `AttentionStackServerWrapper` → `AttentionStack` |
| WeekResults | `WeekResultsSkeleton` (grid 4-stat) | `WeekResultsServerWrapper` → `WeekResultsGrid` |
| UsageMeter | `skeleton-card` | `UsageMeterServerWrapper` → `UsageMeter` |
| Brief | `skeleton-card` | `BriefServerWrapper` → `AIExecutiveBriefV2` o `BriefEmptyState` |

Container raíz: `mx-auto flex w-full max-w-7xl flex-col gap-8 pb-20 sm:gap-10`
(max-w-7xl + gap-8/10 — sin max-w interno por sección).

---

### 1.2 `loading.tsx` y `error.tsx`

**loading.tsx** — EXISTE. Skeleton que replica la estructura visual: header +
health (h-[360px] pulse) + grid 2×2 (4 `LoadingState variant="skeleton-stat"`)
+ brief (`skeleton-card`). Falta OnboardingStatusCard y AttentionStack (ambos
con `fallback={null}`, omitir en skeleton es correcto). Estado: **correcto y
suficiente**.

**error.tsx** — EXISTE. Delega a `SectionErrorBoundary` de ui/ con
`tone="amber"` y `fullscreen`. Estado: **correcto**.

---

### 1.3 `HealthScore.tsx`

**Ruta:** `src/components/dashboard/home/HealthScore.tsx`
**'use client'** — presentational puro (cómputo en server).

Tres estados manejados:

- **ONBOARDING** — `PulsingRings` (Framer Motion opacity loop) + ícono
  Sparkles pulsando + mensaje "Calibrando" + barra de integraciones con
  `data.connectedSources / data.totalSources`. Copy: "Health Score · En
  construcción". **Placeholder honesto, conforme al brief.**
- **PARTIAL** — rings animadas + score spring (Framer `useSpring`) + 3 mini-cards
  de dimensión + disclaimer "Calibrando · X de Y fuentes activas".
- **COMPLETE** — igual que PARTIAL sin disclaimer.

Container del active state:
```
rounded-3xl border border-white/[0.08]
bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-cyan-500/[0.05]
backdrop-blur-2xl p-6 sm:p-10
```

No usa `Card` de ui/ — hand-rolled. Glassmorphism custom con gradiente
específico. La elección tiene sentido (es el hero visual) pero los tokens
no siguen exactamente el canon de CLAUDE.md.

**Hover:** ninguno. El bloque no es clickeable.

**Estado:** **PARCIALMENTE rediseñado**. Ya tiene lenguaje propio del portal
(anillos concéntricos, animaciones) pero con border-radius `rounded-3xl` vs
el `rounded-[28px]` de la superficie principal del shell; y glassmorphism
hardcodeado. No es el bloque más urgente de rediseñar — su estética específica
está justificada como hero.

---

### 1.4 `AttentionStack.tsx`

**Ruta:** `src/components/dashboard/home/AttentionStack.tsx`
**'use client'**

Lista de ítems de atención (billing, approval, message, connection, review)
filtrados por prioridad. Retorna `null` si `items.length === 0` — correcto.

Usa `Card` y `Badge` de ui/ — bien. Cada ítem envuelto en `motion.div`
(entrada staggered). Hover sobre la Card:

```
hover:scale-[1.005]
```

Admin usa `hover:scale-[1.015]` en su `HoverCard` wrapper. **Inconsistencia
menor pero visible.**

`transition-all duration-300` está en Card por defecto. La card de cada ítem
tiene sus propias clases de color de borde/fondo por prioridad (rose, amber,
blue, cyan) — bien diferenciados.

**Estado:** **A REDISEÑAR (S2)** — hover scale desalineado con admin. El resto
del componente está bien estructurado.

---

### 1.5 `WeekResultsGrid.tsx`

**Ruta:** `src/components/dashboard/home/WeekResultsGrid.tsx`
**'use client'**

Grilla 2-col mobile / 4-col desktop. Usa `Card` + `Stat` de ui/. Cada Card
envuelta en `motion.div` (stagger de entrada), pero ese `motion.div` no tiene
hover — las Cards salen planas sin el efecto escala del admin.

Stat recibe `trend?: { value: number, invertColors?: boolean }` — correcto para
la interfaz de ui/Stat.

Section label: `text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500`
+ `vs semana anterior` al lado. Este estilo de label pequeño es el mismo que
usa AttentionStack — hay consistencia interna entre los dos bloques del cliente,
aunque es distinto del `SectionHeader` (h3 font-medium) del admin.

**Estado:** **A REDISEÑAR (S3)** — sin hover en los wrappers de Card; label
estilo puede unificarse con SectionHeader del admin (decisión de sprint).

---

### 1.6 `AIExecutiveBriefV2.tsx`

**Ruta:** `src/components/dashboard/home/AIExecutiveBriefV2.tsx`
**'use client'** — tiene estado interactivo real (regenerar).

Usa `Card variant="highlighted" glow` + `Badge tone="violet"` — primitivos de
ui/ correctos. El botón "Regenerar" es **hand-rolled** (no usa `Button` de
ui/). Loading inline con `RefreshCw animate-spin`.

Si no hay brief disponible, page.tsx renderiza `BriefEmptyState` (server) —
copy honesto: "Tu primer resumen ejecutivo se genera el próximo lunes".

**Estado:** **YA REDISEÑADO** (usa primitivos compartidos). El botón hand-rolled
es un detalle menor; visualmente es coherente con el resto.

---

### 1.7 `OnboardingStatusCard.tsx`

**Ruta:** `src/components/dashboard/OnboardingStatusCard.tsx`
**Server Component (async)** — hace query Prisma directo.

Solo visible cuando hay tareas y no están todas COMPLETED/SKIPPED. Muestra:
- Eyebrow + título + barra de progreso + lista de próximas 3 tareas.
- Link a `/dashboard/messages?prefill=conexiones`.

**Glassmorphism completamente via `style={{ }}` inline:**
```tsx
style={{
  background: 'rgba(6,182,212,0.04)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(6,182,212,0.12)',
  borderRadius: '24px',
}}
```

No usa `Card` ni el token de CLAUDE.md. No tiene hover.

**Estado:** **A REDISEÑAR (S1)** — máxima deuda visual. Primer candidato
por ser el bloque más arriba (después del header) y el que más dista del
sistema de tokens.

---

### 1.8 `UsageMeter.tsx` (consumido, no es de este lane)

**Ruta:** `src/components/dashboard/plan/UsageMeter.tsx`
Este componente fue rediseñado en `lane/plan` y ya está en `main`.
Ver sección 2 para análisis de compatibilidad.

---

## 2. Consumo del UsageMeter — verificación de API

`page.tsx` importa:
```ts
import { UsageMeter } from '@/components/dashboard/plan/UsageMeter'
```

Llamada en `UsageMeterServerWrapper` (line 78-79):
```tsx
const snapshot = await getOrgUsageSnapshot(organizationId)
return <UsageMeter snapshot={snapshot} />
```

API actual del UsageMeter en `main` (post-lane/plan):
```ts
interface UsageMeterProps {
  snapshot: OrgUsageSnapshot
  hideUpgradeHint?: boolean
}
```

La llamada de Inicio pasa **solo `snapshot`**, sin `hideUpgradeHint`. Eso
es equivalente a `hideUpgradeHint={false}` — el default del componente.

**Veredicto: COMPATIBLE. No hay mismatch.** El UsageMeter ya está en main
y Inicio lo consume correctamente. No hay props faltantes ni removidas.

---

## 3. Señales sucias (solo relevamiento — decisión de negocio: NO arreglar acá)

### 3.1 Visitas en WeekResultsGrid — `'—'` sin disclaimer

`lib/dashboard/week-results.ts` lines 41-42:
```ts
Promise.resolve(0),   // visitsThisWeek
Promise.resolve(0),   // visitsLastWeek
```
GA4 no está integrado todavía. `value: visitsThisWeek > 0 ? visitsThisWeek : '—'`.

La tarjeta "Visitas" siempre muestra `'—'` (el code oculta el cero pero no
explica el porqué). Diferencia con HealthScore ONBOARDING: allá hay copy
honesto ("Calibrando", "En construcción"). En WeekResults el `'—'` es
silencioso — el cliente no sabe si son cero visitas o sin integración.

**Dato honesto pero sin label explicativo.** Nivel: informar al cliente que
es un placeholder hasta que GA4 esté conectado.

### 3.2 Leads en WeekResultsGrid — dato agency-wide ⚠️ CRÍTICO

`lib/dashboard/week-results.ts` lines 43-57:
```ts
prisma.contactSubmission.count({
  where: { createdAt: { gte: weekAgo } },  // SIN organizationId
})
```

`ContactSubmission` no tiene `organizationId` como FK todavía. El contador
de "Leads" en la grilla refleja los leads de **todo el sistema** (agency-wide),
no del cliente específico. Se presenta bajo el label "Leads" sin disclaimer.

Mismo problema en `computeLeadsScore` de `lib/health-score.ts` (la dim
Commercial del HealthScore). El comentario inline lo reconoce:
```ts
// ContactSubmission is global (no orgId FK yet), so this gives an agency-wide
// lead volume signal — still useful as a relative trend metric.
```

**Choca con multi-tenant: dato de otra empresa mostrado como propio.** No
arreglar en este lane (requiere migración de schema). Sí ponerle un estado
honesto visible (badge "Estimado" o subtext "del sistema") — eso sí es
rediseño visual.

### 3.3 Trend en HealthScore — valor FAKE ⚠️ CRÍTICO

`lib/health-score.ts` lines 456-468:
```ts
function computeTrend(organizationId: string, currentScore: number) {
  void currentScore
  const seed = hashStringToNumber(organizationId)
  const trendValue = ((seed % 21) - 10) as number
  // Produces a stable -10..+10 value unique per org
```

El trend es **un hash del orgId**, no un cálculo real. `currentScore` se
ignora (`void`). Para cada org siempre será el mismo número entero en
–10..+10, determinístico pero falso.

El `TrendChip` lo muestra como `"+3 esta semana"` o `"–7 esta semana"` —
**dato presentado como métrica real.** No hay campo en `HealthScoreResult`
que indique que el trend es placeholder.

Para poner estado honesto en el componente (ocultar TrendChip o cambiarlo
por "— sin historial") habría que: a) agregar `trend.isFake: boolean` en
`HealthScoreResult` (toca `lib/health-score.ts`), o b) ocultar siempre el
TrendChip en `HealthScore.tsx` hasta que la lib lo implemente real.

La opción b) (ocultar en el componente) no requiere tocar la lib.

**PENDIENTE/parada**: decidir si el rediseño visual puede suprimir el chip
sin conocer la intención de datos futura, o si mejor se deja visible hasta
que esté en un sprint de datos dedicado.

### 3.4 MessagesAnswered y TasksCompleted — datos reales ✅

Ambas queries en `week-results.ts` filtran por `organizationId`. Son datos
reales del tenant. Sin problema.

---

## 4. Paridad con Admin — mapa de tokens

### 4.1 Shell chrome (ya en paridad)

`DashboardLayoutClient.tsx` y `AdminLayoutClient.tsx` comparten el mismo
patrón:
- Fondo raíz: `bg-[#080a0c]`
- Ambient glow: radial-gradient cyan + emerald
- Topbar: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl h-16`
- Superficie principal: capa decorativa `rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-md` + `<main absolute inset-0 overflow-y-auto rounded-[28px]>`

Los dos portales ya tienen el mismo chrome. **No hay deuda aquí.**

### 4.2 HoverCard del admin → equivalente en cliente

`admin/page.tsx` define:
```ts
const cardHoverClass =
  'grid rounded-2xl transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
   hover:scale-[1.015]
   hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]
   hover:ring-1 hover:ring-white/15
   motion-reduce:transition-none
   motion-reduce:hover:scale-100
   motion-reduce:hover:shadow-none'
```

El cliente NO tiene este wrapper. `Card.tsx` tiene `variant="interactive"` que
solo agrega `hover:bg-white/[0.04]` — sin escala ni sombra. Los dos bloques
que deben tener hover (WeekResultsGrid cards, AttentionStack items) necesitan
envolver sus Cards en un div con estas clases, o recibir className de hover.

### 4.3 SectionHeader del admin vs labels del cliente

Admin usa:
```tsx
<h3 className="text-2xl font-medium tracking-tight text-white">{title}</h3>
<p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">{description}</p>
```

Cliente usa para todos los bloques:
```
text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500
```

Son filosóficamente diferentes: el admin tiene sección-headers prominentes (h3)
mientras que el cliente usa eyebrows discretos. La decisión de unificarlos al
estilo admin es de sprint — no es un bug, es una elección de diseño. Se puede
mantener el eyebrow discreto (más apropiado para un panel de cliente que para
un OS panel) o adoptarse el SectionHeader. **A decidir explícitamente en S3.**

### 4.4 Card tokens — comparativa

| Uso | Clase actual | Paridad admin |
|-----|-------------|---------------|
| HealthScore (hero) | `rounded-3xl border border-white/[0.08] bg-gradient-to-br ... backdrop-blur-2xl` | OK — diferenciado a propósito |
| OnboardingStatusCard | `style={{ background, border, borderRadius }}` inline | ❌ Debe ser `rounded-[24px] border border-cyan-500/[0.12] bg-cyan-500/[0.04] backdrop-blur-xl` |
| AttentionStack items | `Card padding="none"` con clases custom de prioridad | OK — diferenciación de prioridad es correcta |
| WeekResults cards | `Card` default (`rounded-2xl border border-white/10 bg-white/[0.02]`) | OK |
| Brief | `Card variant="highlighted" glow` | OK |

### 4.5 `lib/client-health.ts` — no es referencia visual

Este archivo existe en `src/lib/client-health.ts` y expone:
- `estimateLastLoginAt` — helper de sesión
- `daysSince` — días desde fecha
- `getLastConnectionTone` — tone para colores
- `getHealthScore(input)` — score 1..5 basado en inputs booleanos

Es un helper que usa el admin en `/admin/clients/[clientId]` para el panel
de salud del cliente desde la perspectiva del admin. **No es la misma
entidad** que `lib/health-score.ts` (el score de 9 métricas que muestra
el cliente sobre su propio negocio). No es referencia visual para el
rediseño de Inicio.

---

## 5. Plan de rediseño por sprints

### Frozen / solo se consume (no tocar)
- `src/components/ui/*` — todos los primitivos
- `src/components/dashboard/plan/UsageMeter.tsx` — es de lane/plan, ya en main
- `src/components/dashboard/home/HealthScore.tsx` — tiene rediseño propio suficiente (hero)
- `src/context/TransitionContext.tsx`, `PreloaderContext.tsx`
- `prisma/schema.prisma`, auth, guards
- `src/lib/health-score.ts`, `src/lib/dashboard/*` — datos/lógica server

---

### S1 — OnboardingStatusCard: tokens → primitivos

**Archivo:** `src/components/dashboard/OnboardingStatusCard.tsx`

**Qué cambia visualmente:**
- Reemplazar el `style={{ background, backdropFilter, border, borderRadius }}`
  por clases Tailwind:
  `rounded-[24px] border border-cyan-500/[0.12] bg-cyan-500/[0.04] backdrop-blur-xl backdrop-saturate-[180%]`
  (equivale a la glassmorphism canon de CLAUDE.md con acento cyan, mismo tono
  que el inline actual pero via token).
- Agregar hover wrapper: misma `cardHoverClass` del admin (scale + shadow + ring
  + motion-reduce guards).
- La barra de progreso y el link interno quedan intactos.

**Ancla admin:** panel del header `rounded-[28px] border border-white/10` +
`cardHoverClass`.

**No toca:** query Prisma, lógica de tareas, copy, link a messages.

**Effort:** S (30 líneas max).

---

### S2 — AttentionStack: hover paridad

**Archivo:** `src/components/dashboard/home/AttentionStack.tsx`

**Qué cambia visualmente:**
- El `motion.div` que envuelve cada ítem recibe adicionalmente:
  `hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]`
  `hover:ring-1 hover:ring-white/[0.10] motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none`
- El `hover:scale-[1.005]` en la Card desaparece (el scale va en el wrapper).
  Evitar doble escala.

**Ancla admin:** `cardHoverClass`.

**No toca:** prioridad, colores de borde, lógica, datos, tipos.

**Effort:** S (2-3 líneas diff).

---

### S3 — WeekResultsGrid: hover + señal honesta de Visitas

**Archivo:** `src/components/dashboard/home/WeekResultsGrid.tsx`

**Qué cambia visualmente:**
- El `motion.div` que envuelve cada `Card` recibe las clases de hover del admin:
  `hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]`
  `hover:ring-1 hover:ring-white/[0.10] motion-reduce:hover:scale-100`
- La tarjeta "Visitas" (key: `'visits'`) necesita comunicar que el dato no
  está disponible. Opción: pasar un prop `badge` o `hint` al `Stat`, o
  renderizar la tarjeta de visitas condicionalmente con un subtítulo "Sin
  integración aún" si `stat.value === '—'`. Verificar si `Stat` de ui/
  soporta hint/subtitle — si no, hand-roll inline para ese caso.
- La tarjeta "Leads" (dato agency-wide) debe recibir un badge o subtext
  tipo `"Estimado"` o `"Sistema"` — idem, a nivel de WeekResultsGrid que
  conoce qué key es cuál.

**Ancla admin:** `cardHoverClass`.

**No toca:** queries, `WeekResultsData`, lógica de trend, el resto de tarjetas.

**NOTA:** La señal de "Leads agency-wide" se marca visualmente como estimado —
no se arregla el dato (requiere schema). Esto es estrictamente visual.

**Effort:** M (necesita verificar API de Stat antes de implementar).

---

### S4 — HealthScore TrendChip: placeholder honesto

**Archivo:** `src/components/dashboard/home/HealthScore.tsx`

**PENDIENTE/PARADA** — no entra en el rediseño visual de este lane.

**Por qué:** para ocultar o reemplazar el `TrendChip` con un estado honesto
("sin historial") el componente necesita saber que el trend es fake. Dos
opciones:
1. Agregar `trend.isFake: boolean` en `HealthScoreResult` → toca `lib/health-score.ts`
   (shared lib fuera del scope visual).
2. Siempre ocultar `TrendChip` en el componente hasta que haya datos reales.

La opción 2 no requiere tocar la lib, pero es una decisión de negocio ("¿queremos
mostrar un trend hardcoded o no mostrar ninguno?"). Valentino debe decidir.

**Acción:** marcar como pendiente. Si se aprueba opción 2, se agrega como S4
en el mismo lane — sería solo eliminar `<TrendChip ... />` en `HealthScoreActive`.

---

### S5 — Revisar Stat/StaCard del admin para client

**Scope:** Opcional / post-S1-S3.

El admin usa `StatCard` de ui/ (con `label`, `value`, `subtitle`, `trend`,
`progress`, `color`, `icon`). El cliente usa `Stat` (más ligero). Ambos son de
ui/ pero distintos. Si en S3 se necesita `subtitle` o `hint` en `Stat`, puede
ser más limpio migrar las tarjetas de WeekResults a `StatCard` — verificar
primero si la API de `StatCard` cubre el caso.

**No es blocker de los sprints anteriores.**

---

## 6. Checklist resumen

| # | Bloque | Estado actual | Sprint |
|---|--------|---------------|--------|
| 1 | OnboardingStatusCard | glassmorphism inline, sin hover | **S1** |
| 2 | AttentionStack hover | scale 1.005 vs 1.015 del admin | **S2** |
| 3 | WeekResultsGrid hover | sin hover en wrappers | **S3** |
| 4 | WeekResultsGrid visits | '—' sin label honesto | **S3** |
| 5 | WeekResultsGrid leads | dato agency-wide sin badge | **S3** |
| 6 | HealthScore TrendChip | trend fake presentado como real | **PARADA** |
| 7 | UsageMeter | ya rediseñado, API compatible | ✅ OK |
| 8 | AIExecutiveBriefV2 | usa primitivos, visualmente OK | ✅ OK |
| 9 | HealthScore (rings) | hero visual ya OK | ✅ OK |
| 10 | loading.tsx / error.tsx | ambos existen y son correctos | ✅ OK |
| 11 | DashboardLayoutClient | shell chrome en paridad con admin | ✅ OK |

---

## 7. Notas de implementación (para el agente padre)

- **No existe `HoverScaleCard` en ui/** — el hover se agrega via className
  directo en el `motion.div` wrapper o en un thin wrapper local. No crear
  un nuevo componente de ui/ para esto (antivibecode: 3 usos no justifican
  abstracción nueva en este lane).
- **`Card.tsx` variant `interactive`** solo da `hover:bg-white/[0.04]` — no
  sirve como reemplazo del hover del admin. Usar className adicional.
- **OnboardingStatusCard es Server Component** — no puede tener `motion.div`
  (no hay 'use client'). El hover debe ser CSS puro: `transition-transform
  duration-200 hover:scale-[1.015]` + `motion-reduce:hover:scale-100`.
- **`lib/client-health.ts`** no es referencia para este rediseño. Solo lo usa
  el admin para la vista de cliente.
- El orden de los sprints S1 → S2 → S3 es el de mayor impacto visual → menor.
  S1 (Onboarding) es el bloque más alto de la página y el más desalineado.
