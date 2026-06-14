# lane/dashboard — Log de trabajo

Módulo: Dashboard admin (read-only, solo visualización). Stack: Next 16 / TS strict / recharts / Tailwind 4.

## Scope (único universo editable)
Los archivos reales viven bajo `logic-core-v3/` (no en la raíz):
- `logic-core-v3/src/app/(protected)/admin/page.tsx`
- `logic-core-v3/src/app/(protected)/admin/loading.tsx`
- `logic-core-v3/src/app/(protected)/admin/_components/dashboard-history-charts.tsx`
- `logic-core-v3/src/app/(protected)/admin/_components/chart-card.tsx`

PROHIBIDO: `prisma/schema.prisma` (frozen), `src/components/ui/*` (incl. **StatCard.tsx**, frozen), `src/lib/prisma.ts`, todo el chrome admin en `_components/` (AdminLayoutClient, sidebar, etc.).

---

## FASE 0 — DIAGNÓSTICO READ-ONLY (en curso, esperando OK)

Método: lectura directa de los 4 archivos + StatCard.tsx + agency-settings.ts, más auditoría multi-lente con verificación adversarial (workflow, 21 agentes). Sin tocar código.

### 1. Conexión de datos (15 reads en el Promise.all)

| # | Read | Alimenta |
|---|------|----------|
| 1 | `agencySettings.findFirst` (osWeeklyDemoTarget) | badge "Objetivo semanal", denominador card Demos, ReferenceLine chart demos |
| 2 | `osDemo.count` (semana) | card "Demos enviadas esta semana" (value + progress) |
| 3 | `osLead.count` (nextFollowUpAt ≤ hoy) | card "Leads pendientes de follow-up hoy" |
| 4 | `osLead.count` (DEMO_PIPELINE) | denominador `responseRate` |
| 5 | `osLead.count` (RESPONDED_PIPELINE) | num. `responseRate`, denom. `closeRate`, card "Respuesta y cierre" |
| 6 | `osLead.count` (CERRADO) | num. `closeRate` |
| 7 | `subscription.aggregate` (_sum price) | card MRR |
| 8 | `organization.count` (sub activa) | card "Clientes activos" |
| 9 | `ticket.count` (OPEN/IN_PROGRESS) | card "Tickets abiertos" |
| 10 | `project.count` (IN_PROGRESS) | card "Proyectos en curso" |
| 11 | `osDemo.findMany` (8 sem) | `demosByWeek` → chart "Demos por semana" |
| 12 | `osLead.findMany` (RESPONDED, by createdAt, 6 meses) | `closeRateByMonth` → chart "Tasa de cierre por mes" |
| 13 | `project.findMany` (agreedAmount) | `projectRevenueThisMonth` + `revenueByMonth` → card "Ingresos del mes" + chart acumulado |
| 14 | `osMaintenancePayment.findMany` (6 meses) | `maintenanceRevenueThisMonth` + `revenueByMonth` → ídem |
| 15 | `osTimeEntry.findMany` (8 sem) | `memberTotals`, `monthHoursTotal`, `hoursByMemberByWeek` → card horas, card valor-hora, chart horas |

**(a) Llegan pero NO se muestran** (candidatos "más datos" sin schema):
- `revenueByMonth.revenue` (ingreso del mes propio) — el AreaChart solo dibuja `cumulative`. ✔verificado
- `closeRateByMonth.closed` y `.responded` — el LineChart solo dibuja `closeRate`; el tooltip los ignora. ✔verificado
- `memberTotals.totalRangeHours` (suma 8 semanas por miembro) — calculado pero nunca renderizado. ✔verificado

**(b) Se muestran pero mapeo/cálculo discutible** (NO son bugs que rompan):
- `responseRate` (page.tsx:342): denominador = leads en estado actual DEMO_ENVIADA..POSTERGADO (incluye PERDIDO/POSTERGADO, excluye PROSPECTO). Es un snapshot "% de leads en etapa demo-o-posterior que hoy están en estado respondido", no una verdadera tasa de respuesta de demos enviadas. **No puede pasar 100%** (numerador ⊂ denominador — la sospecha de >100% queda descartada). Concern de claridad/etiqueta. ✔verificado (parcial).
- `closeRate` card (all-time pooled) vs chart "Tasa de cierre por mes" (cohorte por createdAt, 6 meses): mismo label "cierre", distinto cohorte/base temporal → el número de la card no coincide con el promedio del chart. Concern de consistencia. ✔verificado.
- **DESCARTADO (falso positivo):** "primer bucket sub-contado por el filtro de fecha" — REFUTADO: el corte `firstChartMonthStart` coincide exactamente con el inicio del primer bucket; no hay undercount. Los buckets de revenue/closeRate están bien.

**(c) Reads a algo inexistente:** NINGUNO. Los 15 reads resuelven contra el schema actual (verificado campo por campo + build verde baseline). Nota: el dashboard también lee modelos no listados pero existentes: `osMaintenancePayment`, `osTimeEntry`, `organization`.

### 2. Código muerto

**In-scope (los 4 archivos):**
- `totalRangeHours` — declarado/inicializado/acumulado/tipado en page.tsx (399, 410, 413, 775), **cero lecturas**. Campo muerto + cómputo desperdiciado. → eliminar, o exponerlo como "más datos".
- Branch tooltip `if (name === 'revenue')` (dashboard-history-charts.tsx:218-220) **inalcanzable**: la única serie es `dataKey="cumulative"` sin `name`, así que `name` siempre es 'cumulative'. → eliminar o activar dibujando la serie revenue.
- `revenue` / `closed` / `responded` pasados a props pero nunca dibujados (ver §1a).

**Borderline — NO remover:**
- `weekStarts[0] ?? weekStart` y `monthStarts[0] ?? monthStart` (155-156): inalcanzables en runtime pero **requeridos** por TS strict (`noUncheckedIndexedAccess`). Dejar.
- `DualMetricCard.icon` (siempre BarChart3, también hardcodeado en el footer): consumido → no es muerto, solo indirección redundante. Recomendación.

**Confirmado limpio:** sin imports sin uso en ningún archivo; **sin controles interactivos** (cero onChange/onClick/useState) → no hay handlers muertos, coherente con read-only; loading.tsx y chart-card.tsx puramente presentacionales.

**Out-of-scope (reportar):** el prop `format` de StatCard nunca se ejercita desde el dashboard (todo `value` llega pre-formateado string). StatCard frozen → PENDIENTE DE COORDINACIÓN, sin fix del lado dashboard.

### 3. Card "Demos enviadas esta semana" — slider + círculo

**HALLAZGO DE SCOPE CLAVE:** la card la renderiza 100% `<StatCard>` (page.tsx:576-583), que vive en `src/components/ui/StatCard.tsx` — **FROZEN, fuera de scope**.

- **El "slider con handle" NO es interactivo.** Es una barra de progreso CSS estática (StatCard.tsx:90-97): track + fill con `width = demosProgress%`. Sin `<input type=range>`, sin onChange, sin drag, sin thumb. **Cero controles interactivos, cero handlers muertos.** ✔verificado.
- **El "handle sobre la barra"** = el cap redondeado del fill. Track y fill ambos `rounded-full`; el fill es más corto → su borde derecho redondeado parece un thumb de slider. Es puro border-radius. ✔verificado.
- **El "círculo suelto abajo a la derecha" NO EXISTE EN EL CÓDIGO.** No hay ningún elemento circular en StatCard ni en el markup de la card. El badge del ícono es `rounded-md` (cuadrado). El trend (zona inferior) es flecha + texto ("En alza"/"Estable"), no círculo. → **❓ A CONFIRMAR (flag al humano):** no puedo reproducir el círculo desde el código. Hipótesis: (1) el cap redondeado del fill leído como círculo; (2) crop de screenshot que toma la card vecina (DualMetricCard); (3) los dots/leyenda `iconType="circle"` de los charts (esos SÍ son círculos, pero están en la grilla de charts más abajo). **Necesito screenshot / inspector del elemento exacto.**

**Implicancia Fase 1:** como slider/cap/círculo viven en StatCard frozen, lo único in-scope es (i) dejar de pasar `progress`, o (ii) llevar el progreso al texto value/subtitle. Cualquier restyle de la barra → **PENDIENTE DE COORDINACIÓN**.

### 4. Legibilidad / copy

**In-scope (corregible):**
- "operacion" → "operación" — page.tsx:558 (subtítulo header)
- "aca" → "acá" — page.tsx:826 (empty state MemberHoursCard)
- "distribucion" → "distribución" — page.tsx:826 (misma línea)
- "Todavia" → "Todavía" — dashboard-history-charts.tsx:289 (empty state)

**Out-of-scope (reportar, NO tocar):**
- "Requiere atencion" → "Requiere atención" — StatCard.tsx:126 (frozen). Aparece en toda card con trend='down' (Leads pendientes, Tickets abiertos). Los "2 visibles" de atencion trazan al **mismo** string único. → PENDIENTE DE COORDINACIÓN.

Ya correctos (NO "arreglar"): conversión, Conversión, suscripción, acción, al día, últimas.

### 5. Recomendaciones (priorizadas)

**In-scope:**
1. Exponer datos ya calculados pero ocultos (sin schema): `revenue` por mes (barra detrás del área acumulada o en tooltip), `closed`/`responded` en tooltip de cierre ("3 de 7 cerrados"), `totalRangeHours` como cifra secundaria 8-sem por miembro. (resuelve §1a + parte de §2 a la vez)
2. Estados vacíos/cero para los 3 charts que no los tienen (demos, cierre, revenue): hoy una agencia nueva ve ejes en cero que parecen señal real. Reusar el patrón de panel dashed que ya usa el chart de horas.
3. prefers-reduced-motion: los charts (recharts) animan al montar ignorándolo → `isAnimationActive={!reduced}` con el hook existente `src/lib/use-reduced-motion.ts`. Además MemberHoursCard usa `transition-[width]` (anima layout, no GPU) → scaleX o quitar.
4. a11y: íconos decorativos sin aria-hidden (DualMetricCard 740/758, MemberHoursCard 802); el de MemberHoursCard además sin `strokeWidth={1.5}` (viola CLAUDE.md). Charts sin alternativa textual (role="img" + aria-label resumen en ChartCard).
5. Consistencia: dos formatters de moneda ("USD 1.234" en cards vs "$1.234" en eje del chart) → unificar. Superficies/radios divergentes entre cards; DualMetricCard y MemberHoursCard declaran `transition-colors` sin hover (transición muerta) → relevante para Fase 2.
6. loading.tsx no matchea el layout real (grid financiero, breakpoint lg vs xl de charts, alto h-64=256px vs ~400px real) → salto de layout.
7. ChartCard usa `<h3>` text-sm chocando con SectionHeader `<h3>` text-2xl → jerarquía de headings; pasar ChartCard a `<h4>`.
8. Claridad de métricas: reetiquetar/aclarar "Tasa de respuesta" (§1b) y reconciliar denominadores card-vs-chart de "cierre".

**PENDIENTE DE COORDINACIÓN:**
- Cualquier restyle de StatCard (cap del slider, typo "Requiere atencion", prop `format`, su propio `transition-[width]`) — primitiva frozen.
- Reduced-motion del `animate-pulse` de Skeleton (shared Skeleton.tsx).
- Cambios de semántica de métrica que requieran datos fuera de los reads actuales.

> Fase 0 cerrada con OK del humano.

---

## FASE 1 — LIMPIEZA + CORRECCIONES (commiteada, esperando verificación visual)

Entorno: el worktree no traía `node_modules` (gitignored). Corrí `npm ci` (exit 0) para poder gatear.
Gate corrido al final: `tsc --noEmit` **exit 0**; `eslint` sobre los 4 archivos → **0 errores nuevos**
(1 error es baseline, ver abajo). Verificación visual = pendiente tuya.

| Bloque | Commit | Qué |
|--------|--------|-----|
| 1.1 | `c092747` | Borrado de código muerto (sin cambio visual) |
| 1.2 | `5e25ea9` | Typos in-scope (acentos) |
| 1.3 | `651f68e` | Subtítulos precisos en "Respuesta y cierre" |
| 1.4 | `8acb272` | Empty/zero states honestos en los 4 charts |
| 1.5 | `5bb5e38` | loading.tsx alineado al layout real |
| 1.6a | `8caad3c` | h4 + alt en charts + moneda unificada + a11y íconos |
| 1.6b | `4683a2f` | reduced-motion en charts + sacar animación de layout |

### 1.1 — código muerto borrado
- `totalRangeHours`: quitado del map de miembros (tipo, init, acumulación) y del prop type de MemberHoursCard.
- `revenue` (por mes): quitado del objeto que devuelve `revenueByMonth` (la var local sigue para el acumulado) y de `RevenueByMonthItem`.
- `closed`/`responded` (por mes): quitados del objeto de `closeRateByMonth` (siguen en `bucket` para calcular `closeRate`) y de `CloseRateByMonthItem`.
- Branch inalcanzable `if (name === 'revenue')` del tooltip de ingresos: eliminado (tooltip ahora `(value) => [formatCurrency(...), 'Acumulado']`).

### 1.2 — typos (old→new)
- `operacion` → `operación` (header)
- `aca` → `acá`, `distribucion` → `distribución` (empty state horas)
- `Todavia` → `Todavía` (empty state chart horas)
- (`Requiere atencion` en StatCard.tsx = PENDIENTE)

### 1.3 — subtítulos precisos (old→new) ⚠ verificación clave
DualMetricCard "Respuesta y cierre" — sin tocar cálculos ni renombrar KPIs. Se sumaron captions por métrica:
- **Tasa de respuesta** (hint NUEVO): `Sobre leads en etapa demo o posterior, según su estado actual`
- **Tasa de cierre** (hint NUEVO): `Cerrados / respondidos, histórico total (distinto del chart mensual)`
- **Subtítulo de la card**:
  - old: `{respondedCount} leads respondieron y {closedCount} terminaron cerrando`
  - new: `{respondedCount} en estado respondido o posterior · {closedCount} cerrados`

### 1.4 — empty states
- `<ChartEmptyState>` reutilizable (panel dashed). Flags por `.some()` sobre datos ya en el cliente.
- Demos: `hasDemos` (algún `demos>0`) → si no, "Todavía no hay demos enviadas en las últimas semanas."
- Cierre: `hasCloseData` (algún `closeRate>0`) → si no, "Todavía no hay cierres registrados para graficar la tasa mensual."
- Ingresos: `hasRevenue` (algún `cumulative>0`) → si no, "Todavía no hay ingresos registrados en el período."
- Horas: ya tenía guard; ahora reusa `<ChartEmptyState>`.

### 1.5 — loading (old→new)
- Fila financiera: `xl:grid-cols-3` → `xl:grid-cols-[0.95fr_1.1fr_0.95fr]`; celda central = `Skeleton h-full min-h-[240px]` (refleja MemberHoursCard; laterales estiran por grid stretch).
- Charts: `lg:grid-cols-2` → `xl:grid-cols-2`.
- Alto chart placeholder: `h-64` (256px) → `h-[400px]`.

### 1.6 — calidad/consistencia
- chart-card: `<h3>`→`<h4>`; cuerpo `role="img"` + `aria-label` (prop `summary`); cada ChartCard pasa un summary.
- Moneda unificada a `USD …` (antes el chart usaba `$`, ambiguo en es-AR). YAxis de ingresos: `width={80}`, `margin.left -12→0` para que entre el prefijo. ⚠ a verificar con magnitudes reales (millones podrían apretar el eje).
- a11y íconos in-scope: `aria-hidden` en íconos de DualMetricCard (header+footer) y MemberHoursCard; este último suma `strokeWidth={1.5}`.
- reduced-motion: `useReducedMotion()` + `isAnimationActive={!reduced}` en las 4 series.
- `transition-[width]` removido de la barra de MemberHoursCard (animaba layout; valor estático en SSR).
- `transition-colors` muertas removidas de DualMetricCard y MemberHoursCard (Fase 2 mete el hover real en los wrappers).

### Gate — resultado
- `tsc --noEmit`: **exit 0** (verificado tras cada bloque que tocó tipos).
- `eslint` (4 archivos del scope): **0 errores nuevos**. Único error = **baseline**:
  `page.tsx` `cumulativeRevenue += revenue` dentro del `.map` de `revenueByMonth` → regla `react-hooks/immutability`.
  Confirmado pre-existente lintando la versión `c092747~1` (estaba en la línea 499 original, statement intacto).
  Fuera del scope de los bloques 1.1–1.6 y "baseline ignorado" por el gate. **PENDIENTE/REVISAR** aparte
  (fix = recomputar el acumulado sin reasignar un `let` externo; es un cálculo financiero, no lo toqué para no arriesgar).

### PENDIENTE DE COORDINACIÓN (reafirmado)
- `Requiere atencion` (typo) — StatCard.tsx frozen.
- Íconos que renderiza StatCard sin aria — StatCard frozen.
- `animate-pulse` de Skeleton sin motion-reduce — shared Skeleton.tsx.
- Lint baseline `cumulativeRevenue` (immutability) — pre-existente, decisión del humano.

> Estado: Fase 1 commiteada en `lane/dashboard`. Esperando tu verificación visual + OK para Fase 2.
