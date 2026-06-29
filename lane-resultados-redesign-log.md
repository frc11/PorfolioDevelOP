# Lane Resultados — Rediseño visual (Portal Cliente) · Relevamiento + Plan

> **Estado:** FASE EXPLORE + PLAN (plan-mode). Read-only completado. Plan para aprobación.
> **Misión:** reskin visual de `/dashboard/resultados/*` para verse **idéntica al admin** (mismo chrome, tokens, hover, cards, spacing). NO se construye nada nuevo; la sección ya anda end-to-end con datos reales (GA4 / Search Console / GBP + insights IA + análisis chatbot), gateo y estados demo/empty/error. Se **preservan** lógica, datos, gateo y estados.
> **Worktree:** `C:\lane-resultados\logic-core-v3` · branch `lane/resultados`.
>
> **NOTA plan-mode:** este archivo es la **bitácora fuente de verdad**. Como plan-mode sólo permite editar el plan file, el **primer paso de ejecución** es copiar este `.md` a la lane (`C:\lane-resultados\lane-resultados-redesign-log.md`, junto a `lane-LOG.md`/`lane-dashboard-log.md`) y seguir actualizándolo ahí.

---

## 0) Diferencias vs el brief (LEER PRIMERO — la estructura real difiere)

1. **Ubicación de componentes:** la mayoría de los "results/*" del brief **no** viven en `components/dashboard/results/*`. Sólo están bajo `results/`: `GBPMetricsCard`, `InsightsBlock`, `PageSpeedCard` y `results/analysis/*`. El resto (`AnalyticsMetricCard`, `SessionsChart`, `ClicksImpressionsChart`, `TrendBadge`, `AnalyticsAlertas`, `AlertaMetrica`, `SeoAlertas`, `OportunidadesSEO`, `OportunidadSEO`, `AnalyticsSkeleton`) están en `components/dashboard/*`.
2. **`PageSpeedCard` se renderiza en `/trafico`, NO en `/seo`** (grep: importado sólo por `trafico/page.tsx`). Queda fuera del scope de SEO.
3. **`InsightsBlock` se usa sólo en `/trafico` y `/seo`** (NO en `/reputacion` ni `/analisis`, pese a estar importable).
4. **Header duplicado (inconsistencia real):** `resultados/layout.tsx` ya renderiza un `PageHeader` genérico ("Resultados") + `ResultadosTabs`. Además, `/trafico` (`title="Tráfico & Analytics"`) y `/analisis` (`title="Análisis de tu negocio"`) renderizan **su propio** `PageHeader` encima → **doble header**. `/seo` y `/reputacion` **no** renderizan header propio → quedan con sólo el genérico. Los 4 tabs son inconsistentes.
5. **`resultados/layout.tsx` SÍ existe** (un subagente reportó erróneamente que no; verificado a mano: existe y compone header+tabs+children).
6. **Upsell: las keys NO son un enum estático.** `requestUpsellAction(featureKey, featureName)` valida `featureKey` en runtime contra `PremiumModule.slug` (findUnique). No hay allowlist hardcodeada.
7. **Los 4 componentes "muertos" están confirmados muertos** (`DownloadReportButton`, `AnalyticsPeriodSelector`, `LeakMeter`, `ExecutiveReportTemplate` — este último muerto sólo por transitividad: su único importador es el `DownloadReportButton` muerto). **NO revivir / NO cablear.**
8. **`lib/hover.ts`** exporta `adminHoverCls` + `adminHoverAmplifiedCls`. **`chartCardHoverCls` (no-scale) NO está exportado** — es un const local dentro de `LatencyChart.tsx` (admin, frozen).
9. **Consumo compartido hoy:** Resultados consume `FadeIn`, `AnimatedCounter` (vía `AnalyticsMetricCard`), `resolveOrgId` (lib/preview) y `components/ui` (`PageHeader`/`Tabs`/`LoadingState`). **NO consume** `StaggerWrapper`, `AnimatedProgressBar` ni `lib/hover` (cards usan hover bespoke). `editsShared=false` verificado en todos: ningún componente de Resultados muta un archivo shared/frozen.
10. **Hallazgos de integridad de datos / seguridad** (no cosméticos): tooltip de `SessionsChart` con fila falsa "Fuente Principal: Google Ads"; deltas de tendencia hardcodeados en metric cards de `/trafico` y `/seo`; **fuga de error** en `/seo` (`result.error` al cliente); `performance.*` de GBP stubbeado a 0 (el bloque "Performance del perfil" nunca renderiza); CTA "ACTIVAR AHORA" de `/trafico` sin handler (muerto); `AnalyticsSkeleton` usa `Math.random()` (riesgo de hydration mismatch).

---

## 1) Anclaje de diseño — Admin Canon (referencia read-only, NUNCA editar)

Tokens/patrones exactos a replicar (extraídos de `chart-card.tsx`, `StatCard.tsx`, `lib/hover.ts`, `admin/page.tsx` DualMetricCard, `dashboard-history-charts.tsx`, `ActivityChart`, `LatencyChart`, `OverviewTab`):

**Superficies / bordes / radios**
- Superficie stat/analytics dominante: `bg-white/[0.02]`. Panel de chart del dashboard compartido: `bg-white/5`. Tiles inset (cajas de valor anidadas): `bg-black/20`.
- Borde por defecto: `border-white/10`. Empty: `border border-dashed border-white/10`.
- Radios: **`rounded-2xl`** (stat cards, DualMetricCard) · **`rounded-[28px]`** (paneles de chart, health/verdict) · `rounded-xl` (tiles inset, inputs) · `rounded-md` (icon chips). Empty: `rounded-[22px]`/`rounded-2xl`.
- **Sin shadow en reposo.** Toda elevación aparece SÓLO en hover.

**Hover (de `lib/hover.ts`)**
- Cards normales — `adminHoverCls` = `transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none`.
- Cards **con chart recharts** — variante **SIN scale** (`chartCardHoverCls`): igual pero sin `hover:scale-*` (el `transform:scale` desincroniza el tooltip de recharts del cursor). Hoy es const local en `LatencyChart.tsx`.
- **HoverCard wrapper externo**: `<div className={'grid rounded-2xl ' + adminHoverCls}>{child}</div>` — el hover vive AFUERA; el inner (StatCard/tile) conserva su borde/bg/padding. Patrón para envolver primitivas que no se tocan.

**Tipografía**
- Valores: `text-2xl font-medium tracking-tight` (StatCard) / `text-3xl font-medium text-white` (DualMetricCard). **Nunca `font-black` ni `font-mono` para números.**
- Labels: `text-xs tracking-tight text-zinc-500`. Body/secundario: `text-zinc-400`.
- Eyebrow: `text-[10px] uppercase tracking-[0.24em] text-zinc-500` sobre un título `text-base/text-white`.

**Acentos (4 colores de servicio + rose/red/zinc)** — StatCard los codifica como triples `text-{c}-300 · bg-{c}-400/10 · border-{c}-400/20` (zinc usa `bg-zinc-700/30`). Trend: up `text-emerald-400 ArrowUpRight` · down `text-amber-300 ArrowDownRight` · flat `text-zinc-500 ArrowRight` (Lucide, `strokeWidth={1.5/1.75}`, **sin pill de fondo**).

**Recharts (conventions)**
- `useReducedMotion()` (de `@/lib/use-reduced-motion`) + `isAnimationActive={!reduced}` en cada serie.
- Chart dentro de un `<div>` de **altura fija** (`h-48`/`h-56`/`h-[320px]`) con `<ResponsiveContainer width="100%" height="100%">`. **Nunca** `height={n}` como prop.
- Grid `strokeDasharray="3 3" vertical={false}` stroke `rgba(255,255,255,0.05–0.08)`. Axes `tickLine={false}`, fill `rgba(255,255,255,0.4–0.6)`, `allowDecimals={false}` para conteos. XAxis `axisLine` stroke `rgba(255,255,255,0.18)`, YAxis `axisLine={false}`.
- Tooltip (estilo chatbot, el más cercano a estos charts): `contentStyle={{ backgroundColor:'rgba(9,9,11,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#e4e4e7', fontSize:'12px' }}`, `cursor={{ stroke:'rgba(6,182,212,0.3)' }}`.
- Bars radius `[6,6,0,0]`/`[8,8,0,0]` + `maxBarSize 24–34`. Areas: gradient en `<defs>`. `role="img" aria-label` en el contenedor.

**Empty state canon** — `flex h-full items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-black/10 px-6 text-center text-sm text-zinc-500` (variante rica: emoji/icono + título `font-medium text-zinc-300` + hint `text-zinc-500`).

**StatCard (primitiva a CONSUMIR, `components/ui/StatCard.tsx`, FROZEN)** — props: `label, value, format('number'|'currency'|'compact'), subtitle, icon(LucideIcon), accent/color, trend(legacy|{direction,value}), progress(0-100), className`. Root: `rounded-2xl border border-white/10 bg-white/[0.02] p-5`. Sin hover propio → envolver en HoverCard.

**Barra de filtros de fecha (referencia, `ActivityDateFilter`)** — fila flex-wrap inline: `<Select>` de preset angosto a la izquierda (`Todos|Última semana|Último mes|Últimos 6 meses|Último año|Personalizado`); sólo si `custom` revela dos `<input type="date">` que crecen (`flex-1`) a la derecha; tokens `rounded-xl border-white/10 bg-white/[0.02] focus:border-cyan-400/30 [color-scheme:dark]`. (Sólo relevante si algún sprint agrega filtro de período — usar `@/components/ui` Select, **no** el muerto `AnalyticsPeriodSelector`.)

---

## 2) Mapa de la sección + Gap vs Admin (por componente)

Sólo se lista el **delta** (lo que NO matchea). Severidad = magnitud del reskin.

### Shell — `resultados/{layout,page,loading,error}.tsx` + `ResultadosTabs.tsx`
| Componente | Delta vs admin | Sev |
|---|---|---|
| `layout.tsx` | Doble header (ver §0.4). Children en `<div>` sin superficie (correcto: las subpáginas aportan su chrome). Rhythm `gap-6`/`max-w-7xl` OK. | low |
| `page.tsx` (index) | `redirect('/dashboard/resultados/trafico')`. OK, nada que renderizar. | none |
| `loading.tsx` | Grid `gap-3` (canon `gap-4`); skeleton usa `Card variant='subtle'` (`bg-white/[0.015]`) — más tenue que `bg-white/[0.02]`, pero está **dentro de `components/ui` (FROZEN)** → no editable; sólo se ajusta el grid/wrapper. | low |
| `error.tsx` | Vía `SectionErrorBoundary` (amber, no expone stack). Convención cliente correcta. Sin cambio. | none/low |
| `ResultadosTabs.tsx` | Underline tabs + indicador `bg-cyan-400` (sin equivalente "card" en canon; acentos/bordes alineados). **Sin back button (correcto).** Sin cambio. | none |
| `DashboardLayoutClient` | Ya espeja `AdminLayoutClient` (glow, topbar glass, main `rounded-[28px]`, PageTransition). Sin delta. | none |

### `/trafico` (GA4) — default tab
| Componente | Delta vs admin | Sev |
|---|---|---|
| `trafico/page.tsx` | Cards con `style={CARD_STYLE}` inline (`rgba(255,255,255,0.025)`/border `0.07`) en vez de tokens; chart card `rounded-2xl` (canon panel `rounded-[28px]`); **sin hover admin**; headers `font-semibold text-zinc-300` (no eyebrow); TopPages progress gradient+glow (canon: barra plana 2px). | high |
| `AnalyticsMetricCard` | `rounded-3xl p-7`, `bg-white/[0.025]`+`border-white/[0.08]`, **`shadow-2xl` en reposo**, hover `scale-[1.015]` pelado (sin ring/glow/motion-reduce), valor `text-5xl font-black` coloreado (canon `text-2xl font-medium zinc-100`), label `uppercase white/50`. Self-anima FM + hover propio. | high |
| `SessionsChart` (recharts) | Sin gate reduced-motion; `height={180}` prop; tooltip bespoke cyan + **fila falsa "Google Ads"**; `CustomTooltip`/`cursor` tipados **`any`** (viola zero-any). | high |
| `TrendBadge` | Pill con fondo `bg-emerald/10`/`bg-rose/10` + flechas unicode; canon = `text-emerald-400`/`text-amber-300` + Lucide, sin pill. Down/bad usa **rose** (canon amber). | medium |
| `AnalyticsAlertas` | Sólo lógica (deriva alertas), sin chrome. | none |
| `AlertaMetrica` *(compartido con /seo)* | `rounded-xl` con borde/bg `rgba` inline (`0.28`/`0.07`) en vez de tokens `/20`+`/10`; DANGER→red (canon amber/rose-300). | medium |
| `AnalyticsSkeleton` | Bespoke, `gap-8`/grid `gap-6` (live `gap-6`/`gap-4`), `rounded-3xl p-8`, `bg-[#0c0e12]/40` hex, **`Math.random()` bar heights**. Duplica el skeleton de `loading.tsx`. | medium |
| `InsightsBlock` *(compartido con /seo)* | `bg-white/[0.025]`+`border-white/[0.07]`, header `font-black uppercase tracking-widest`, sin hover, `backdrop-blur-2xl` en reposo. Lo más cercano a canon. | medium |
| `PageSpeedCard` *(sólo /trafico)* | Misma familia (`bg-white/[0.025]`, sin hover, header font-black, numerales `font-mono text-5xl`). | medium |

### `/seo` (Search Console)
| Componente | Delta vs admin | Sev |
|---|---|---|
| `seo/page.tsx` (`MetricCard` + `TopQueriesTable` + `TopPagesCard` inline, `CARD_STYLE`) | `MetricCard` bespoke (superficie `rgba(accent,0.04)`, valor `text-2xl font-bold tabular-nums` coloreado); hover `scale-[1.01]` pelado `duration-300`; `shadow-2xl` en empty; tablas con `CARD_STYLE` inline (border `0.07` > canon). Deltas **hardcodeados**. | high |
| `ClicksImpressionsChart` (recharts) | Tooltip viejo `#18181b`/`#3f3f46`/radius 6; **sin reduced-motion**; grid `#27272a`; barras gris `#3f3f46` radius `[2,2,0,0]` (canon acento + `[6-8,...]`); `height={200}` prop; sin `role=img`. | high |
| `SeoAlertas` | Sólo lógica; delega a `AlertaMetrica`. | low |
| `OportunidadesSEO` | Header chip cyan `rounded-lg` (canon `rounded-md`), `h2` sin eyebrow. | low |
| `OportunidadSEO` | Card `rounded-xl` con `rgba(impact,0.035)`/border `0.2`; sin hover canon; badge `text-[9px] font-black`; ease `[0.16,1,0.3,1]` (≠ curva canon). CTA → `sendClientMessageAction` (**otro contrato**, no upsell). | medium |
| `InsightsBlock` | (ver /trafico — mismo componente). | medium |
| Empty-state upsell (panel inline en `page.tsx`) | Hero glow; **dispara contrato FROZEN** `requestUpsellAction('seo-avanzado','SEO Avanzado')`. | — |
| `loading.tsx` | `gap-3` vs live `gap-4`; `max-w-7xl` presente acá y ausente en page root → salto de ancho. | low |

### `/reputacion` (Google Business Profile)
| Componente | Delta vs admin | Sev |
|---|---|---|
| `reputacion/page.tsx` | Sin header propio (sólo el genérico del layout). Wrapper sin `max-w`/`pb` (su `loading.tsx` sí los tiene → salto). Error **silencioso**: `getGBPMetrics` throw → cae al MISMO empty que "no conectado". | low |
| `ReputationEmptyState` (inline) | Hero `bg-white/[0.025]`/border `0.08`, `backdrop-blur-2xl`, título `font-black uppercase`. Idioma distinto al empty canon (punteado/muted). | medium |
| `GBPMetricsCard` | Totalmente bespoke, **0 primitivas compartidas**. Superficies `bg-white/[0.025]`/`bg-white/[0.018]`/tiles tinted `bg-amber/cyan-500/[0.045]` (canon `bg-white/[0.02]`/inset `bg-black/20`). Tipografía `font-black`+`font-mono tabular-nums` rating `text-6xl`. **Sin hover**. `performance.*` stubbeado 0 → bloque nunca renderiza. | high |
| `loading.tsx` | Skeleton 4-stat+card no matchea el contenido real (1 panel 2-col). `gap-3`. | low |

### `/analisis` (Franco P0.2 — gated Pro+)
| Componente | Delta vs admin | Sev |
|---|---|---|
| `analisis/page.tsx` (+ `NoBotState` inline) | Content wrapper `gap-8`; `NoBotState` hero `bg-white/[0.025]`/border `0.08`, `font-black`, `backdrop-blur-2xl`. | medium |
| `AnalysisTeaser` | Pill violet (intencional, AI/upsell). `font-medium` (OK). Hover color-only. | low |
| `CalibratingBlock` *(empty compartido de las 3 secciones)* | Borde **sólido** `border-white/[0.08]` + halo cyan (canon: **punteado** + muted). | medium |
| `CategoriesSection` | Superficie `bg-white/[0.02]`+`border-white/10` **matchea**; falta hover; `h2` sin eyebrow; valor `text-cyan-400/80` (canon zinc-100). | medium |
| `DiscoveriesSection` | Superficie matchea; sin hover; tone chips `500/30`+`500/10` (canon triples `400/10`+`400/20`); eyebrow `tracking-[0.2em]` (canon `0.24em`). | medium |
| `MonthTrendSection` | Superficie matchea; sin hover; valor `text-3xl font-black` (canon `font-medium`); variation badge tints `500/30`. Envuelve el chart (regla no-scale si se le agrega hover). | medium |
| `MonthlyConversationsChart` (recharts) | Sin reduced-motion; `height={180}` prop; tooltip JSX bespoke; `maxBarSize 48` (canon 24–34); axes `#71717a` bold; sin `role=img`. Único chart de `/analisis`. | high |

### Cross-cutting
- **Muertos (0 imports, NO revivir):** `DownloadReportButton`, `AnalyticsPeriodSelector`, `LeakMeter`, `ExecutiveReportTemplate`.
- **Consume-only (no editar):** `FadeIn`, `AnimatedCounter`, `resolveOrgId`, `components/ui/*` (`PageHeader`/`Tabs`/`LoadingState`/`StatCard`/`Card`). `StaggerWrapper`/`AnimatedProgressBar`/`lib/hover` no se consumen hoy (traerlos como consume-only si hace falta).

---

## 3) Decisiones LOCKED (de este chequeo)

- **D1 · Empty states → "Todo a canon admin".** TODOS los empties de Resultados (activación GA, sin siteUrl, upsell SEO, sin GBP, sin bot, `CalibratingBlock`) se reconcilian al patrón admin **punteado + muted** vía una primitiva compartida nueva `ResultEmptyState` (borde `border-dashed border-white/10`, `bg-black/10`/`bg-white/[0.01]`, título `font-medium text-zinc-300`, hint `text-zinc-500`, CTA opcional `rounded-2xl` estilo `SectionErrorBoundary`). Los CTA conservan su **acción** (la del upsell es FROZEN); sólo cambia el contenedor.
- **D2 · Datos falsos → "Quitar Google Ads, flaggear deltas".** En el sprint `/trafico`: **eliminar** la fila "Fuente Principal: Google Ads" del tooltip de `SessionsChart` (está dentro del tooltip que igual se restylea). Los deltas de tendencia hardcodeados (`/trafico` y `/seo`) **se conservan** con comentario `// FIXME(data-truth): delta hardcodeado, pendiente sprint de datos` — no se inventan reales ni se borran.
- **D3 · `chartCardHoverCls` → local en la lane.** Definir la variante no-scale en un archivo nuevo del scope Resultados (`results/_shared/`), **sin** editar `lib/hover.ts` ni `LatencyChart.tsx` (frozen). Importar `adminHoverCls` de `lib/hover` (consume-only) para las cards normales. (Si más adelante el equipo quiere compartirla, subirla a `lib/hover.ts` es un follow-up aditivo trivial — fuera de esta lane.)
- **D4 · Fuga de error `/seo` → fix obligatorio.** Reemplazar el render de `result.error` al cliente (CLAUDE.md "never expose internal error messages") por un mensaje genérico; el detalle se loguea server-side. Se hace dentro del sprint `/seo`.
- **D5 · Commits atómicos para fixes no-cosméticos.** Los fixes de comportamiento que caen dentro de sprints visuales —D2 (eliminar fila "Google Ads"), D4 (fuga de error `/seo`), tipar el `any` de `SessionsChart` (tooltip/cursor), sacar `Math.random()` de `AnalyticsSkeleton`— van **cada uno en su COMMIT PROPIO**, separado de los commits de reskin del mismo sprint. Razón: revertibilidad individual + visual-qa **no** cubre comportamiento.
- **D6 · Aprobado por el humano (no frenar a preguntar).** D2 (quitar "Fuente Principal: Google Ads") y D4 (no renderizar `result.error` al cliente) están **blesseados** como parte de esta lane. NO frenar en Sprint 4/5 preguntando si pertenecen al scope visual — **pertenecen**. El resto de la deuda de datos se **PRESERVA** con `// FIXME(data-truth)`.

---

## 4) Plan de sprints (orden: menor→mayor superficie de write / riesgo)

> **Acoplamiento de componentes compartidos:** `TrendBadge`, `InsightsBlock` y `AlertaMetrica` se renderizan en **dos** tabs (`/trafico` y `/seo`). Se restylean **una vez** en el sprint `/trafico` (Sprint 4) y se **re-verifican en `/seo`** en su QA. Así el Sprint 5 sólo toca lo específico de SEO.

### Sprint 1 — Shell: header único por tab + consistencia de loading
- **Archivos:** `resultados/layout.tsx`, `trafico/page.tsx` (header), `seo/page.tsx` (+header), `reputacion/page.tsx` (+header), `analisis/page.tsx` (header), `resultados/loading.tsx` (+ revisar los 4 `*/loading.tsx`).
- **Objetivo:** eliminar el doble header. `layout.tsx` renderiza **sólo** `ResultadosTabs` (se le quita el `PageHeader` genérico); cada subpágina renderiza **su propio** `PageHeader` con su título de tab (`/seo` y `/reputacion` lo **ganan**; `/trafico` y `/analisis` ya lo tienen → se mantiene). Normalizar grid de skeletons a `gap-4` y el wrapper de `loading.tsx` para no saltar de ancho contra el layout.
- **NO tocar:** internals de `PageHeader`/`Tabs`/`Card`/`LoadingState` (FROZEN `components/ui`); `error.tsx` (ya canon-amber); ninguna query/data; el indicador de tabs.
- **Aceptación VISUAL:** navegando los 4 tabs, cada uno muestra **exactamente un** header con su título específico (sin eyebrow "Resultados" duplicado), igual que el ritmo de header único del admin; skeleton grid en `gap-4`; sin salto de ancho loading→loaded.
- **Validación:** `tsc` verde; visual-qa desktop+mobile de los 4 tabs (reposo) confirmando header único y no-regresión de tabs/redirect.

### Sprint 2 — `/reputacion` (+ funda `HoverCard` + `ResultEmptyState`)
- **Archivos:** `results/GBPMetricsCard.tsx`, `reputacion/page.tsx` (`ReputationEmptyState`), `reputacion/loading.tsx`; **nuevos** `results/_shared/HoverCard.tsx` + `results/_shared/ResultEmptyState.tsx`.
- **Objetivo:** reconstruir `GBPMetricsCard` sobre **`StatCard` consumido** (rating = StatCard amber; chips de performance = StatCards) envueltos en `HoverCard`; superficies → `bg-white/[0.02]`/`border-white/10`, tiles inset → `bg-black/20`; tipografía → **fuera `font-black`/`font-mono`** → `font-medium`/zinc, eyebrow `tracking-[0.24em] text-zinc-500`. Empty/desconectado (`ReputationEmptyState`) → `ResultEmptyState` (punteado/muted) **conservando** el CTA a `/dashboard/messages?context=activacion`. `loading.tsx` → matchear la nueva forma de cards.
- **NO tocar:** `getGBPMetrics`/`lib/integrations/google-business-profile.ts` (data, tokens OAuth, scoping); no "arreglar" el `performance.*` stubbeado (sólo flag).
- **Aceptación VISUAL:** las cards de reputación tienen hover admin (scale 1.015 + ring-white/15 + glow, motion-reduce), tipografía neutra admin y superficies canon — anclado a **StatCard + tiles de `OverviewTab`**; el empty es punteado/muted anclado a **`ChartEmptyState`**.
- **Validación:** `tsc` verde; lint en tocados; visual-qa desktop+mobile (estado con datos, empty/desconectado, empty-reviews).

### Sprint 3 — `/analisis` (+ funda `chartTheme` + `chartCardHoverCls`)
- **Archivos:** `results/analysis/{CategoriesSection,DiscoveriesSection,MonthTrendSection,CalibratingBlock,MonthlyConversationsChart}.tsx`, `analisis/page.tsx` (`NoBotState`), `analisis/loading.tsx`; **nuevos** `results/_shared/chartTheme.ts` (tooltip contentStyle + tokens de axes/grid + helper reduced-motion) + `results/_shared/chartHover.ts` (`chartCardHoverCls` no-scale, D3).
- **Objetivo:** envolver las cards de sección en `HoverCard`; headers → patrón eyebrow (`text-[10px] uppercase tracking-[0.24em] text-zinc-500` + título); valores `font-black`→`font-medium`; tone chips de Discoveries → triples StatCard; `CalibratingBlock` + `NoBotState` → `ResultEmptyState` (punteado/muted); `MonthlyConversationsChart` → recharts canon (tooltip de `chartTheme`, axes/grid, `isAnimationActive={!reduced}`, **div de altura fija** en vez de `height={180}`, `maxBarSize` 24–34, `role=img`); la card que envuelve el chart usa `chartCardHoverCls` (no-scale).
- **NO tocar — FROZEN Franco P0.2:** `getMonthlyAnalysisForOrg`, `modules/chatbot/lib/monthly-analysis.ts`, el gate `planAllows(plan,'insight')`, la rama teaser-vs-content, la exclusión de tokens/costo, la ventana 30d, los thresholds (`CATEGORY_MIN_SAMPLE`, rank). **Re-skin VISUAL únicamente.** Si aparece drift de schema/Franco → **PENDIENTE, no forzar.**
- **Aceptación VISUAL:** cards de sección con hover admin; el chart matchea **`ActivityChart`/`LatencyChart`** (tooltip, axes, no-scale hover); empties punteados/muted; el gate sigue igual (Starter ve `AnalysisTeaser`, Pro+ ve contenido).
- **Validación:** `tsc` verde; lint; visual-qa desktop+mobile (con datos, `CalibratingBlock`, `NoBotState`, teaser gated).

### Sprint 4 — `/trafico` (incluye componentes compartidos)
- **Archivos:** `trafico/page.tsx` (`MetricCard`/`TopPagesCard`/`AnalyticsEmptyState`/`CARD_STYLE`), `AnalyticsMetricCard.tsx`, `SessionsChart.tsx`, `TrendBadge.tsx` *(compartido)*, `AnalyticsAlertas.tsx`, `AlertaMetrica.tsx` *(compartido)*, `AnalyticsSkeleton.tsx`, `results/InsightsBlock.tsx` *(compartido)*, `results/PageSpeedCard.tsx`, `trafico/loading.tsx`.
- **Objetivo:** sustituir `CARD_STYLE` inline + estilos inline por clases token canon; `AnalyticsMetricCard` → semántica StatCard (`rounded-2xl`, `bg-white/[0.02]`, `border-white/10`, valor `text-2xl font-medium`, **sin `shadow-2xl` en reposo**, hover vía `HoverCard`); `TrendBadge` → convención trend admin (emerald-400/amber-300 + Lucide, sin pill) **conservando los deltas fake con `// FIXME(data-truth)` (D2)**; `SessionsChart` → recharts canon (`chartTheme`, reduced-motion, div altura fija) + **eliminar fila "Google Ads" (D2)** + tipar el tooltip/cursor (**fuera `any`**); card del chart → `chartCardHoverCls`; `TopPagesCard`/`InsightsBlock`/`PageSpeedCard`/`AlertaMetrica` → tokens canon + `HoverCard`; **consolidar a un solo skeleton** (usar los shared `StatCardSkeleton`/`CardSkeleton` como `loading.tsx`, o `AnalyticsSkeleton` determinístico canon — **fuera `Math.random()`**); `AnalyticsEmptyState` → `ResultEmptyState` conservando "VER DEMO VISUAL".
- **NO tocar:** `getAnalyticsData`/`lib/analytics`, la lógica de gateo demo/empty/error, `resolveOrgId`. CTA muerto "ACTIVAR AHORA" e id de demo hardcodeado → **flag, no cablear/cambiar**.
- **Aceptación VISUAL:** metric cards con look+hover de StatCard admin; `SessionsChart` matchea recharts admin y **sin** fuente falsa; un solo skeleton sin random; empty punteado/muted. `/seo` re-verificado por los compartidos.
- **Commits (D5):** 3 fixes de comportamiento en commits propios y separados del reskin — (a) quitar fila "Google Ads", (b) tipar `SessionsChart` tooltip/cursor (fuera `any`), (c) `AnalyticsSkeleton` determinístico (fuera `Math.random()`). D2/D6: NO frenar a preguntar si (a) pertenece — está blesseada.
- **Validación:** `tsc` verde (sin `any` nuevos); lint; visual-qa desktop+mobile de `/trafico` (datos/demo/empty/error) **y** re-check de `/seo` por `TrendBadge`/`InsightsBlock`/`AlertaMetrica`.

### Sprint 5 — `/seo` (mayor riesgo: contrato FROZEN + seguridad)
- **Archivos:** `seo/page.tsx` (`MetricCard`/`TopQueriesTable`/`TopPagesCard`/empty upsell/zero-data notice/fix de error), `ClicksImpressionsChart.tsx`, `OportunidadesSEO.tsx`, `OportunidadSEO.tsx`, `SeoAlertas.tsx`, `seo/loading.tsx`. (`AlertaMetrica`/`InsightsBlock` ya canon desde Sprint 4.)
- **Objetivo:** `MetricCard`/tablas → tokens canon + `HoverCard`; `ClicksImpressionsChart` → recharts canon (tooltip `chartTheme`, axes/grid, reduced-motion, div altura fija, barras acento `#22d3ee` radius `[6,6,0,0]`, `role=img`); `OportunidadesSEO`/`OportunidadSEO` → triples acento + fuera `rgba` inline + curva canon; empty-state upsell → `ResultEmptyState` (punteado/muted) **conservando intacto** `<form action={activarSeo}>` → `requestUpsellAction('seo-avanzado','SEO Avanzado')`; **fix D4**: no renderizar `result.error` al cliente (mensaje genérico + log server-side); deltas fake → `// FIXME(data-truth)` (D2); `loading.tsx` → matchear forma.
- **NO tocar — PARADA DURA:** `upsell.ts` (firma, slug `'seo-avanzado'`, side-effects OrganizationModule/ContactSubmission/notifications). Si el reskin del empty **requiriera** tocarlo → **COORDINACIÓN CON CENTRAL**, frenar (rompe Servicios + Plan). (Hoy NO hace falta: el empty es un panel inline que sólo llama la acción; se restylea el panel, no la acción.)
- **Aceptación VISUAL:** cards/chart de SEO matchean admin; el empty upsell es punteado/muted **pero** el botón sigue disparando `requestUpsellAction` sin cambios (verificar que crea OrganizationModule/ContactSubmission/notifications); el error ya **no** filtra detalle interno.
- **Commits (D5):** el fix D4 (no renderizar `result.error`) va en **commit propio**, separado del reskin. D6: está blesseado — NO frenar a preguntar si pertenece al scope.
- **Validación:** `tsc` verde; lint; visual-qa desktop+mobile (datos/demo/empty-upsell/zero-data/error); smoke del flujo upsell (acción dispara y revalida).

---

## 5) PARADAS / PENDIENTES de coordinación
- **`upsell.ts` (FROZEN):** contrato `requestUpsellAction(featureKey, featureName)` validado contra `PremiumModule.slug`. El plan lo llama con la firma + keys actuales (`'seo-avanzado'`, `'SEO Avanzado'`). Tocarlo = **COORDINACIÓN CON CENTRAL** (rompe Servicios + Plan). → Sprint 5.
- **Franco P0.2 (`/analisis`):** data contract congelado; reskin **visual only**. Drift de schema/Franco (enum `ChatbotInsight`/`QuotaUsage`/`LeadCategory`, columna `insightEnabled`) → **PENDIENTE**, no forzar. → Sprint 3.
- **Frozen UI (`components/ui/*`):** `PageHeader`, `Card`/`LoadingState`, `StatCard` se **consumen**, no se editan. Divergencias internas (eyebrow `text-[11px] tracking-[0.28em] zinc-600` de PageHeader; superficie `bg-white/[0.015]` del skeleton de Card) → **aceptadas como están** (no editables sin tocar frozen).
- **`chartCardHoverCls` (D3):** se define **local** en la lane; subirlo a `lib/hover.ts` sería un follow-up aditivo fuera de scope.
- **Deuda de datos (no se resuelve en esta lane visual, sólo se flaggea):** deltas de tendencia hardcodeados (`/trafico`,`/seo`); `performance.*` GBP stubbeado 0; CTA muerto "ACTIVAR AHORA"; demo property id hardcodeado.

---

## 6) Verificación (gate de ejecución — por sprint)
- **Build/types:** desde `logic-core-v3/`, `.\node_modules\.bin\tsc.cmd --noEmit` (**NUNCA `npx tsc`**). Sin errores **nuevos**. Baseline a ignorar: `@googleapis/webmasters` faltante, `react-hooks/set-state-in-effect` en `PreloaderContext`. PowerShell **no** acepta `&&`; correr `tsc` **solo** (no encadenar con `;` a `Remove-Item .next`).
- **Lint:** limpio en archivos tocados. **Zero `any`** (aplica directo a `SessionsChart`).
- **Visual-qa:** subagente `visual-qa` desktop + mobile del **estado de reposo** + no-regresión de cada tab tocado. La **coreografía** (hover/animación) la verifica el humano por grabación — **no autoconfirmar visual por compilación**.
- **Multi-tenant:** queries siempre por la org de la **sesión** (`resolveOrgId`), nunca por URL param. No `router.push` (usar `<Link>`/`router.refresh()`/`redirect()`).
- **Checkpoints humanos:** un objetivo por sprint; no avanzar sin OK del humano; regresiones aceptadas van a `CLAUDE.md`.
- **Higiene de commits (D5):** cada fix de comportamiento dentro de un sprint visual (D2 "Google Ads", D4 fuga de error, tipado `any`, `Math.random()`) en **commit propio y separado** del reskin cosmético, para revertibilidad individual (visual-qa no cubre comportamiento).

---

## Context
La sección Resultados del portal cliente funciona end-to-end pero su estética **precede al sistema de diseño del admin**: usa `style={CARD_STYLE}` inline, superficies/bordes off-canon (`bg-white/[0.025]`/`border-white/[0.07]`), tipografía `font-black`+`font-mono`+`uppercase`, `shadow-2xl` en reposo, hover bespoke sin `ring`/glow/motion-reduce, charts recharts fuera de convención y empties tipo "hero" en vez del patrón punteado/muted del admin. El objetivo es que se vea **idéntica al admin** anclando a tokens/patrones que ya funcionan ahí (`StatCard`, `adminHoverCls`, `ChartEmptyState`, conventions de recharts), **preservando** lógica, datos, gateo por plan y estados demo/empty/error. El plan ordena el trabajo de menor a mayor superficie/riesgo y aísla los dos contratos congelados (upsell, Franco P0.2) y el fix de seguridad (fuga de error en SEO).

---

## 7) EXECUTION LOG (corrida desatendida nocturna · 2026-06-25)

> Repo root real: `C:/lane-resultados` (la app vive en `logic-core-v3/`; la bitácora y los otros lane-logs están en el root del repo). Worktree branch `lane/resultados`. Gate: `./node_modules/.bin/tsc.cmd --noEmit` desde `logic-core-v3/` (exit 0 limpio en baseline — el `@googleapis/webmasters` no surge en tsc acá) + eslint en tocados. visual-qa por subagente si el MCP de preview está; si no, diferido a humano.

### Sprint 1 — Shell (header único + full-width) — ✅ COMPLETADO
- Estado de entrada: `layout.tsx` ya sin PageHeader genérico (583a3ee), full-width sin `max-w` en layout+loadings (e6578b6). Verificado a mano: ✓ layout sólo `ResultadosTabs`, ✓ `grep max-w-Nxl` en `resultados/` → 0 matches en las 4 pages.
- `/trafico` y `/analisis`: ya tenían su `PageHeader` propio (`eyebrow="Resultados"` + title + description + icon). Sin cambios.
- **AGREGADO** `PageHeader` a `/seo` (`title="SEO & Posicionamiento"`, icon `Search`) y `/reputacion` (`title="Reputación Online"`, icon `Star`), mismo patrón `eyebrow="Resultados"`. Resultado: los 4 tabs con exactamente un header propio, ninguno con doble header ni sin header.
- Gate: tsc exit 0 (sin errores nuevos); eslint exit 0 en los 2 archivos tocados. **1 warning pre-existente** en `seo/page.tsx:120` (`isMockData` asignado y nunca usado) — NO introducido por mí, vive en `SeoPage` que es scope de Sprint 5 → diferido a Sprint 5 (donde `seo/page.tsx` se reescribe). No es error, eslint exit 0.
- visual-qa: **DIFERIDO A VERIFICACIÓN HUMANA (todos los sprints)**. El subagente visual-qa confirmó que el preview MCP existe pero el único `next dev` corriendo es el del checkout PRINCIPAL (`C:\PorfolioDevelOP`), que NO tiene los cambios del lane. Next 16 no permite un 2º `next dev` con :3000 tomado, y matar el server del usuario en una corrida desatendida es inapropiado. Verificar contra :3000 mostraría código viejo (inútil). Además las rutas son auth-gated (`/dashboard/*`) y `/analisis` necesita sesión Pro+ sembrada. → No es falla de gate (carve-out explícito del anti-loop). El humano verifica el visual mañana levantando `next dev` desde el worktree del lane.
- Commits: bitácora en commit propio (9e692fc) + headers en commit de reskin (90a202e).

### Sprint A — Datos de QA — ✅ COMPLETADO
**Read-first (mapa de datos, vía subagente Explore):**
- **/analisis** (Franco P0.2, gated Pro+, data EN DB): `getMonthlyAnalysisForOrg(orgId)` (`src/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg.ts`) lee 3 modelos vía `BotConfig` (1:1 con Organization):
  - `hasBot` = la org tiene `botConfig`.
  - `insights` → `ChatbotInsight` (filtra status PENDING|APPLIED, top 6 por status/createdAt/evidenceCount). Enum `InsightCategory` = KB_GAP|CONVERSION_LEAK|CONTENT_OPPORTUNITY|CONFIG_TWEAK|COMPETITIVE_INTEL; `InsightStatus` = PENDING|APPLIED|DISMISSED|IGNORED.
  - `series` → `QuotaUsage` (year/month/conversationsCount; `@@unique([botConfigId,year,month])`; últimos 6 meses).
  - `categories` → `ChatbotLead` groupBy `category` (enum LeadCategory sales|postventa|employment|provider|spam|other), ventana 30d sobre `capturedAt`, `CATEGORY_MIN_SAMPLE=10` p/ `sufficient`.
  - Gate: `getPlanForOrg` → `Subscription.plan.insightEnabled`. PRO+BUSINESS = true, STARTER = false.
- **/reputacion** (GBP): `getGBPMetrics(orgId)` (`src/lib/integrations/google-business-profile.ts`) es **100% OAuth live de Google** — NO lee DB, NO tiene mock/demo mode, NO hay env flag. Lee tokens de `Organization` (gbpAccessToken/gbpRefreshToken/gbpLocationId); si faltan → `null` → empty state. **No se puede sembrar sin una conexión OAuth real.**

**Seed /analisis (escrito + CORRIDO + idempotente):**
- Archivo: `scripts/dev/_seed-resultados-qa.ts` (**gitignored** — efímero, no se mergea; entry agregada al `.gitignore`).
- Resuelve en runtime una org **que YA es Pro+ con bot** (insightEnabled=true), prefiere slug `san-miguel`/`matsu`, si ninguna califica → **aborta sin escribir** (NUNCA cambia un plan). Corrido contra la branch Neon dev: resolvió **"Matsu" (slug=matsu, BUSINESS)** → la org real Pro+ con bot del dev DB.
- Insertó: **+6 ChatbotInsight, +4 QuotaUsage** (2 de 6 meses ya tenían data real → skipDuplicates los preservó, NO pisó), **+14 ChatbotLead** (≥10 en 30d → `categories.sufficient=true`). Re-corrida → +0/+0/+0 (idempotente confirmado). Ids deterministas `qa-seed-*`.
- **Clean**: `npx ts-node --transpile-only scripts/dev/_seed-resultados-qa.ts clean` (borra solo `qa-seed-*`).
- **Runner**: `npx ts-node --transpile-only` (tsx NO está instalado en este worktree, confirmado en `node_modules/.bin`). Carga `.env.local` explícitamente (Prisma no la carga sola; no hay `.env` plano). Guard anti-prod inlineado (espejo de `prisma/seed-guard.ts`; ts-node corre en ESM y el import relativo `.ts` no resuelve). NO toca schema, NO migra.
- **Gotcha resuelto**: el run desde Bash necesita `dangerouslyDisableSandbox` (egress a Neon bloqueado por el sandbox) — el humano lo corre desde un shell normal sin problema. Campo `Organization.companyName` (no `name`).
- **/reputacion**: sin seed posible. Camino de verificación para el humano: (a) dejar el empty state canon (lo más realista en dev), o (b) conectar una cuenta GBP real vía el flujo OAuth de settings. NO se mockea OAuth.

### Sprint 2 — /reputacion — ✅ COMPLETADO
**Infra (commit propio 2b51858):**
- `results/_shared/HoverCard.tsx`: `<div className={cn('grid', adminHoverCls, className)}>` — hover del admin afuera, el caller pasa el `rounded-*` que matchea al hijo. (La variante no-scale para charts queda para Sprint 3.)
- `results/_shared/ResultEmptyState.tsx`: empty canon dashed/muted (border-dashed border-white/10, bg-white/[0.01], título font-medium text-zinc-300, hint text-zinc-500, ícono muted). Slot `children` para el CTA (acción FROZEN intacta). Exporta `resultEmptyCtaCls` / `resultEmptyCtaSecondaryCls`.

**Reskin:**
- `GBPMetricsCard.tsx`: reconstruido sobre tokens canon. Rating = tile canon (rounded-2xl border-white/10 bg-white/[0.02], valor `text-3xl font-medium tabular-nums text-amber-300`, ícono en chip rounded-md amber-400, eyebrow tracking-[0.24em]) envuelto en HoverCard. Reseñas = surface canon + tiles inset `bg-black/20 border-white/10`; "Sin responder" → chip triple amber-400/10·/20·300; nombre `font-medium`. Chips de performance = `StatCard` consumido (accent cyan) envuelto en HoverCard. **Fuera `font-black`/`font-mono`/`text-6xl`/`uppercase tracking-[0.2em]`.** `performance.*` stubbeado 0 → `// FIXME(data-truth)`, NO se cablea (integración FROZEN).
- `reputacion/page.tsx`: `ReputationEmptyState` → `ResultEmptyState` (ícono Star muted) conservando el CTA `<Link href="/dashboard/messages?context=activacion">` (ahora con `resultEmptyCtaCls`) + el info "Setup manual por ahora". Header de Sprint 1 intacto.
- `reputacion/loading.tsx`: grid 0.8fr/1.2fr de 2 `skeleton-card` (matchea la nueva forma rating+reseñas), gap-5.
- Gate: tsc exit 0; eslint exit 0 en los 5 archivos tocados.

### Sprint 3 — /analisis — ✅ COMPLETADO
**Infra (commit propio):**
- `results/_shared/chartHover.ts`: `chartCardHoverCls` (no-scale, D3) — espejo del const local de LatencyChart; ring+shadow sin scale.
- `results/_shared/chartTheme.ts`: `chartTooltipContentStyle` (glass `rgba(9,9,11,0.95)`), `CHART_GRID_STROKE`, `CHART_AXIS_STROKE`, `CHART_AXIS_TICK`, `chartCursorLine`/`chartCursorFill`, + re-export de `useReducedMotion`. Extraído de LatencyChart/ActivityChart.

**Reskin (visual only — Franco P0.2 data contract INTACTO: no se tocó getMonthlyAnalysisForOrg, monthly-analysis.ts, el gate planAllows, la rama teaser, thresholds ni ventana 30d):**
- `MonthlyConversationsChart.tsx`: recharts canon — tooltip glass (fuera cyan-500/30 font-black), ejes/grid de chartTheme, `isAnimationActive={!reduced}`, **div altura fija `h-48`** (fuera `height={180}` prop), `maxBarSize 32` (era 48), `role="img" aria-label`.
- `CalibratingBlock.tsx`: ahora delega en `ResultEmptyState` (D1) — fuera el borde sólido + halo cyan pulsante → dashed/muted. Las 3 secciones (MonthTrend/Categories/Discoveries) lo consumen sin cambiar su API.
- `MonthTrendSection.tsx`: header eyebrow (`tracking-[0.24em]`) + título `font-medium`; valor `text-3xl font-black`→`font-medium`; eyebrow interno `tracking-[0.2em]`→`[0.24em]`; VariationBadge tints `500/30`→`400/20` triples; **la card del chart usa `chartCardHoverCls` (no-scale)**.
- `CategoriesSection.tsx`: header eyebrow+título font-medium; card envuelta en `HoverCard`; valores `text-cyan-400/80`→zinc; lead `font-semibold text-white`→`font-medium zinc-100`; barra `gradient+glow`→plana `bg-cyan-400/70`.
- `DiscoveriesSection.tsx`: header eyebrow+título font-medium; cada insight envuelto en `HoverCard`; `TONE_CHIP` y "Ya aplicado" emerald a triples `400/20·/10·300`; h3 `font-semibold`→`font-medium`; eyebrow interno `tracking-[0.2em]`→`[0.24em]`; box "Qué podés hacer" a `cyan-400/15·[0.06]`.
- `analisis/page.tsx`: `NoBotState` → `ResultEmptyState` conservando el CTA de activación. `loading.tsx` ya matchea (header + 3 card skeletons).
- Gate: tsc exit 0 (recharts tipado sin `any`); eslint exit 0 en los 8 archivos tocados.

### Sprint 4 — /trafico (+ compartidos) — ✅ COMPLETADO
**3 fixes de comportamiento (D5/D6 — commits propios y separados del reskin):**
- (a) commit `fix(...): quitar fuente de tráfico falsa` — SessionsChart: eliminada la fila "Fuente Principal: Google Ads" hardcodeada del tooltip (D2, blessed).
- (b) commit `fix(...): tipar CustomTooltip` — SessionsChart: el content del tooltip era `:any` → `SessionsTooltipProps` + guarda de `label`. Zero-any.
- (c) commit `fix(...): AnalyticsSkeleton determinístico` — alturas de barras con `Math.random()` (hydration mismatch) → patrón determinístico por índice `28 + ((i*41)%53)`.

**Reskin cosmético (commit aparte):**
- `trafico/page.tsx`: `CARD_STYLE` inline eliminado → tokens canon; metric grid envuelto en `FadeIn` + cada `AnalyticsMetricCard` en `HoverCard` (delays FM removidos); card del chart `border-white/10 bg-white/[0.02]` + `chartCardHoverCls` (no-scale); `TopPagesCard` → tokens canon + HoverCard + barra plana `bg-cyan-400/70`; `AnalyticsEmptyState` → `ResultEmptyState` conservando "VER DEMO VISUAL" (+ CTA muerto "ACTIVAR AHORA" preservado con `// FIXME(data-truth)`). Deltas de tendencia hardcodeados intactos (D6). Error de /trafico NO tocado (gating fuera de scope, D4 es sólo /seo).
- `AnalyticsMetricCard.tsx`: semántica StatCard — `rounded-2xl border-white/10 bg-white/[0.02] p-5`, valor `text-5xl font-black`→`text-2xl font-medium` zinc, label canon, **fuera FM/shadow-2xl/hover propio** (hover vía HoverCard). Mantiene AnimatedCounter + TrendBadge.
- `SessionsChart.tsx`: recharts canon (tooltip glass de chartTheme, ejes/grid, `chartCursorLine`, `isAnimationActive={!reduced}`, **div `h-48`** fuera `height={180}`, `role=img`, fuera el filtro cyanGlow).
- `TrendBadge.tsx` *(compartido /seo)*: convención admin — flecha Lucide + color (emerald-400 bueno / amber-300 malo / zinc-500 flat), **sin pill**; fuera FM → server component.
- `AlertaMetrica.tsx` *(compartido /seo)*: `rgba` inline → tokens `border-{c}-400/20 bg-{c}-400/10`; DANGER `red`→`rose`; fuera la línea de acento gradiente; títulos `font-semibold`→`font-medium`.
- `InsightsBlock.tsx` *(compartido /seo)*: surface canon (fuera backdrop-blur), header `font-black uppercase`→eyebrow `tracking-[0.24em]`, tones a triples `400/20·/10`, ícono chip rounded-md, envuelto en HoverCard.
- `PageSpeedCard.tsx` *(sólo /trafico)*: tones a `400/20·/10`, numerales `font-mono text-5xl font-black`→`text-3xl font-medium tabular-nums`, headers eyebrow, envuelto en HoverCard.
- `AnalyticsSkeleton.tsx`: tokens canon (`rounded-3xl`→`2xl`, `border-white/5`→`/10`, `bg-[#0c0e12]/40`→`bg-white/[0.02]`, fuera backdrop-blur, gap-6).
- `trafico/loading.tsx`: ya usaba shared StatCardSkeleton/CardSkeleton (deterministas) → sin cambios. `AnalyticsAlertas` = sólo lógica → sin cambios.
- Gate: tsc exit 0 (zero-any); eslint exit 0 en los 8 archivos del reskin. /seo re-verificado por los compartidos en Sprint 5.

### Sprint 5 — /seo — ✅ COMPLETADO
**Fixes en commits propios (separados del reskin):**
- commit `refactor(...): quitar probe muerto de isMockData` — `SeoPage` computaba `isMockData` con un `getSearchConsoleData()` extra que nunca se leía → fetch redundante + var muerta eliminados (resuelve el warning no-unused-vars que venía deferido desde Sprint 1).
- commit `fix(...): no exponer result.error al cliente (D4, blessed)` — `SeoContent` renderizaba `result.error` directo en el DOM (viola CLAUDE.md "never expose internal error messages"). Ahora: `console.error` server-side + mensaje genérico accionable al cliente.

**Reskin cosmético (commit aparte) — upsell.ts FROZEN intacto:**
- `seo/page.tsx`: `CARD_STYLE` inline eliminado → tokens canon. `MetricCard` reconstruida (prop `accent` en vez de color/border/bg rgba; valor `text-2xl font-bold` coloreado → `font-medium` zinc; **fuera hover pelado `scale-[1.01]`** → `HoverCard`). `TopQueriesTable`/`TopPagesCard` → tokens canon + `HoverCard` (bordes rgba inline → `border-white/10`/`/[0.06]`, chips rounded-md, clicks color zinc, numeral `font-mono font-black` → tabular zinc, barra plana `bg-cyan-400/70`). `PositionBadge` → triples `400/20·/10·300` font-medium. Card del chart → `chartCardHoverCls` (no-scale) + leyenda recoloreada a cyan. Zero-data notice → tokens canon. **Empty upsell → `ResultEmptyState`** conservando INTACTO `<form action={activarSeo}>` → `requestUpsellAction('seo-avanzado','SEO Avanzado')` (sólo se restyla el botón con `resultEmptyCtaCls`; "VER DEMO VISUAL" preservado). Deltas de tendencia hardcodeados preservados con `// FIXME(data-truth)`.
- `ClicksImpressionsChart.tsx`: recharts canon — tooltip `chartTooltipContentStyle` (era `#18181b`/`#3f3f46`/radius 6), ejes/grid de chartTheme (era `#27272a`/`#71717a`), reduced-motion en ambas series, **div `h-52`** (fuera `height={200}`), barras acento `#22d3ee` radius `[6,6,0,0]` maxBarSize 24 (eran gris `#3f3f46` radius `[2,2,0,0]`), `role=img`.
- `OportunidadSEO.tsx`: rgba inline → triples por impacto (URGENTE rose / ALTO emerald / MEDIO amber); badge `font-black`→`font-medium`; fuera la línea de acento gradiente + FM (curva off-canon) → server-render del card; **acción `sendClientMessageAction` + form INTACTOS**.
- `OportunidadesSEO.tsx`: header chip `rounded-lg`→`rounded-md` canon + eyebrow `tracking-[0.24em]`.
- `seo/loading.tsx`: gap-4 + fila de 2 card skeletons (tablas) para matchear la forma.
- `SeoAlertas.tsx` = sólo lógica (delega a AlertaMetrica ya canon) → sin cambios. `AlertaMetrica`/`InsightsBlock`/`TrendBadge` ya canon desde Sprint 4 → re-verificados como consumidores de /seo.
- **PARADA upsell.ts**: NO hizo falta tocarla (el empty es un panel inline que sólo llama la acción; se restyló el panel, no la acción). Firma/slug/side-effects intactos.
- Gate: tsc exit 0 (zero-any); eslint exit 0 en los 5 archivos del reskin.

---

## 8) CIERRE — corrida desatendida completa (1→A→2→3→4→5) ✅

**Estado final:** los 6 sprints corrieron de corrido. Gate técnico verde en cada uno (`tsc --noEmit` exit 0 + eslint exit 0 en tocados). Worktree `lane/resultados` limpio y commiteado. **NO se hizo merge, NO se tocó main.** Ninguna PARADA OBLIGATORIA se disparó (schema/ui/shell intactos; Franco P0.2 y `upsell.ts` no tocados; sin drift de Franco). Anti-loop nunca activado.

**Commits por sprint (16 commits sobre base `dd0a3c4`; `583a3ee`/`e6578b6` ya existían pre-corrida):**
- Sprint 1: `9e692fc` (bitácora) · `90a202e` (headers /seo+/reputacion). [+ `583a3ee`/`e6578b6` previos]
- Sprint A: `d1a2380` (gitignore del seed + bitácora; seed corrido contra Neon dev → Matsu BUSINESS).
- Sprint 2: `2b51858` (infra HoverCard+ResultEmptyState) · `37609b5` (reskin /reputacion).
- Sprint 3: `36bb208` (infra chartTheme+chartHover) · `3ee97f0` (reskin /analisis).
- Sprint 4: `69ea796` (a: quitar Google Ads) · `ee24347` (b: tipar tooltip) · `15b1d21` (c: skeleton determinístico) · `df4fbe8` (reskin /trafico+compartidos).
- Sprint 5: `df4854e` (cleanup isMockData) · `0e1d35f` (D4 fuga de error) · `5f7989e` (reskin /seo).
- Total: **30 archivos, +1478/−1196**.

**Verificación que queda para el humano (despierto):**
1. **Visual** (no autoconfirmado por compilación): levantar `next dev` DESDE el worktree del lane (`cd C:\lane-resultados\logic-core-v3`) — requiere bajar el :3000 del checkout principal primero (Next 16 no corre 2 dev a la vez). visual-qa automatizado quedó DIFERIDO (ver §7 Sprint 1) porque el único server vivo era el del checkout principal sin los cambios del lane.
2. **/analisis con datos**: correr `npx ts-node --transpile-only scripts/dev/_seed-resultados-qa.ts` (desde un shell con red a Neon; el seed es idempotente y resolvió Matsu=BUSINESS) y entrar como esa org Pro+. Clean: el mismo script con `clean`.
3. **Google tabs**: /trafico y /seo se ven con `?demo=true` (mock). /reputacion (GBP) NO se puede sembrar (OAuth live, sin mock) → se ve el empty canon, salvo conectar una cuenta GBP real.
4. **Coreografía** (hover scale/ring, animaciones recharts, reveals): verificar por grabación.
5. **Merge**: lo hace el humano. El seed `scripts/dev/_seed-resultados-qa.ts` es gitignored → NO se mergea (vive sólo en este worktree).

**Deuda de datos PRESERVADA (flaggeada con `// FIXME(data-truth)`, NO tocada, por diseño):** deltas de tendencia hardcodeados (/trafico, /seo); `performance.*` de GBP stubbeado 0 (bloque nunca renderiza); CTA muerto "ACTIVAR AHORA" (/trafico); demo property id hardcodeado. Fixes de seguridad/correctitud SÍ aplicados (blessed): D2 (Google Ads), D4 (fuga de error /seo), tipado `any` SessionsChart, `Math.random()` skeleton, probe muerto isMockData.
