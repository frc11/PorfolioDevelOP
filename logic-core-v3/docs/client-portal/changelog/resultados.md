# Changelog — Resultados (Portal Cliente)

Sección `/dashboard/resultados/*` (4 tabs: Tráfico, SEO, Reputación, Análisis). Estado: **cerrada, pendiente de merge a main.** Worktree: `C:\lane-resultados\logic-core-v3` · branch `lane/resultados`.

---

## Resumen ejecutivo

Esta lane fue exclusivamente un **reskin visual** para llevar la sección Resultados a paridad de diseño con el admin. La sección ya funcionaba end-to-end con datos reales (GA4 / Search Console / GBP / análisis IA de chatbot), gateo por plan, estados demo/empty/error e integración con dos contratos frozen (upsell SEO y el pipeline de análisis mensual de Franco, P0.2). No se construyó funcionalidad nueva ni se tocó ninguna query, action, lógica de gateo ni integración OAuth.

Lo que se resolvió fue la deuda estética acumulada: la sección usaba `style={CARD_STYLE}` inline, superficies y bordes off-canon (`bg-white/[0.025]`/`border-white/[0.07]`), tipografía `font-black`\+`font-mono`\+`uppercase`, `shadow-2xl` en reposo sin hover admin, charts recharts fuera de la convención de la app, y empties estilo "hero" en vez del patrón punteado/muted que usa el admin. Todo eso se reemplazó anclando a las mismas primitivas que ya funcionan en el admin: `StatCard`, `adminHoverCls`, los tokens de recharts de `ActivityChart`/`LatencyChart`, y `ChartEmptyState` como referencia del patrón de empty.

Se corrió en modo desatendido nocturno (sprints 1 → A → 2 → 3 → 4 → 5), sin checkpoints humanos. Ninguna parada obligatoria se disparó. El gate técnico estuvo verde en cada sprint. La verificación visual quedó diferida al humano (ver más abajo).

---

## Qué se hizo

### Sprint 1 — Header único en los 4 tabs (`90a202e`)

La sección tenía inconsistencia estructural: `layout.tsx` renderizaba un `PageHeader` genérico ("Resultados") y además `/trafico` y `/analisis` renderizaban **su propio** `PageHeader` encima, generando doble header. `/seo` y `/reputacion`, en cambio, no tenían header propio y quedaban huérfanas del título de su tab. Pre-corrida, dos commits anteriores ya habían sacado el PageHeader del layout (`583a3ee`) y puesto el contenido full-width quitando `max-w` del layout y los loadings (`e6578b6`).

El Sprint 1 completó el trabajo: se agregó `PageHeader` propio a `/seo` (`title="SEO & Posicionamiento"`, icon `Search`) y `/reputacion` (`title="Reputación Online"`, icon `Star`), con el mismo patrón `eyebrow="Resultados"` que ya usaban los otros dos. Resultado: los 4 tabs con exactamente un header, ninguno duplicado ni huérfano.

### Sprint A — Datos de QA para /analisis (`d1a2380`)

Antes de reskinear se mapeó la data real de cada tab. El tab `/analisis` (Franco P0.2, gated Pro+) lee tres modelos en la DB: `ChatbotInsight`, `QuotaUsage` y agrupaciones de `ChatbotLead`. El tab `/reputacion` usa GBP vía OAuth 100% live — no tiene mock ni flag de dev, por lo que no es posible sembrar sin conectar una cuenta real.

Se escribió un seed idempotente (`scripts/dev/_seed-resultados-qa.ts`, gitignored) que resuelve en runtime una org que ya es Pro+ con bot, prefiere las slugs conocidas (`san-miguel`/`matsu`) y aborta sin escribir nada si ninguna califica — nunca toca un plan. Se corrió contra la Neon dev, resolvió Matsu (BUSINESS) e insertó 6 insights, 4 registros de quota y 14 leads con IDs deterministas `qa-seed-*`. Re-correrlo inserta 0 (idempotente). Se puede limpiar con el argumento `clean`.

El seed no se mergea (gitignored en el worktree) y el runner es `npx ts-node --transpile-only` (tsx no está instalado en este worktree).

### Sprint 2 — /reputacion \+ infra HoverCard/ResultEmptyState (`2b51858`, `37609b5`)

Se fundó la infraestructura de componentes de `results/_shared/` con dos piezas:

**`HoverCard.tsx`** — wrapper que aporta el hover del admin (`adminHoverCls` de `lib/hover`) sin tocar el componente interno. El caller pasa el `rounded-*` que corresponde al hijo; el hover (scale 1.015 \+ ring-white/15 \+ shadow) vive afuera. Patrón necesario porque las primitivas compartidas (`StatCard`) no tienen hover propio.

**`ResultEmptyState.tsx`** — reemplaza los empties estilo "hero" por el patrón punteado/muted del admin: `border-dashed border-white/10 bg-white/[0.01] rounded-[22px]`, ícono muted, título `font-medium text-zinc-300`, hint `text-zinc-500`. Acepta un slot `children` para el CTA que preserva la acción frozen sin tocarla. Exporta `resultEmptyCtaCls` y `resultEmptyCtaSecondaryCls` para botones consistentes.

Con esa infra, `GBPMetricsCard` se reconstruyó sobre tokens canon. La sección de rating pasó a un tile `rounded-2xl border-white/10 bg-white/[0.02]` con valor `text-3xl font-medium tabular-nums text-amber-300` e ícono en chip `rounded-md`, todo envuelto en `HoverCard`. Los tiles de reseñas pasaron a `bg-black/20 border-white/10` (inset canon). Los chips de performance consumen `StatCard` (accent cyan) \+ `HoverCard`. Se sacaron `font-black`/`font-mono`/`text-6xl`/`uppercase`. El empty de reputación (`ReputationEmptyState`) se migró a `ResultEmptyState` conservando el CTA al flujo de activación. El `loading.tsx` se ajustó a la nueva forma de 2 columnas.

### Sprint 3 — /analisis \+ infra chartTheme/chartCardHoverCls (`36bb208`, `3ee97f0`)

Se fundaron otras dos piezas de `_shared/`:

**`chartTheme.ts`** — tokens de recharts extraídos de `ActivityChart`/`LatencyChart`: tooltip glass (`rgba(9,9,11,0.95)` con borde `rgba(255,255,255,0.1)` y radius 12), strokes de grid y ejes, tick styles, cursor line/fill. Además re-exporta `useReducedMotion` para que los charts puedan hacer `isAnimationActive={!reduced}`.

**`chartHover.ts`** / `chartCardHoverCls` — variante no-scale de `adminHoverCls` (solo ring \+ shadow, sin `scale`). La razón del no-scale: `transform:scale` en el wrapper desincroniza el tooltip de recharts del cursor. Hoy es un const local en `LatencyChart.tsx` (admin, frozen); se definió localmente en la lane sin editar `lib/hover.ts` — subirlo al shared es un follow-up aditivo trivial, fuera de esta lane.

El reskin de `/analisis` fue visual only: el data contract de Franco P0.2 (`getMonthlyAnalysisForOrg`, `monthly-analysis.ts`, gate `planAllows`, thresholds, ventana 30d) quedó intacto. Se envolvieron las cards de sección en `HoverCard`, se pusieron headers con eyebrow (`text-[10px] uppercase tracking-[0.24em] text-zinc-500`)

+ título `font-medium`, y los valores `font-black`→`font-medium`. Los tone chips de `DiscoveriesSection` pasaron a triples canon (`400/20·/10·300`). `MonthlyConversationsChart` se reescribió sobre recharts canon (tooltip de `chartTheme`, axes/grid, div de altura fija `h-48` en vez de `height={180}` como prop, `maxBarSize 32`, `role="img"`, reduced-motion). `CalibratingBlock` (el estado "calibrando", compartido por las 3 secciones de análisis) delegó en `ResultEmptyState` — salió el borde sólido \+ halo cyan pulsante, entró el patrón dashed/muted. `NoBotState` (el empty de sin-bot en la página) también delegó en `ResultEmptyState` conservando su CTA de activación.

### Sprint 4 — /trafico \+ compartidos \+ 3 fixes de comportamiento

Este sprint tuvo la mayor superficie porque `TrendBadge`, `InsightsBlock` y `AlertaMetrica` se usan en dos tabs (trafico y seo), así que al restylearse acá se re-verifican en Sprint 5\.

**Fixes de comportamiento (commits propios, separados del reskin):**

`69ea796` — `SessionsChart` tenía una fila hardcodeada "Fuente Principal: Google Ads" en el tooltip. Era un dato inventado, sin ningún respaldo en la query de GA4. Se eliminó.

`ee24347` — El mismo `CustomTooltip` de `SessionsChart` estaba tipado `:any` en dos spots (el componente y el prop `cursor`). Se definió la interfaz `SessionsTooltipProps` y se tipó correctamente. Zero-any.

`15b1d21` — `AnalyticsSkeleton` computaba la altura de sus barras con `Math.random()`. Eso genera valores distintos en server y client → riesgo de hydration mismatch. Se reemplazó por un patrón determinístico por índice (`28 + ((i * 41) % 53)`).

**Reskin cosmético (`df4fbe8`):** `CARD_STYLE` inline eliminado de `trafico/page.tsx`; el grid de métricas envuelto en `FadeIn` \+ cada `AnalyticsMetricCard` en `HoverCard` (delays FM removidos de los cards individuales). `AnalyticsMetricCard` reescrito sobre semántica StatCard (`rounded-2xl border-white/10 bg-white/[0.02] p-5`, valor `text-2xl font-medium` zinc, sin `shadow-2xl` en reposo, sin hover propio). La card del chart pasó a `chartCardHoverCls` (no-scale). `TopPagesCard` con tokens canon y barra plana `bg-cyan-400/70` (salió el gradiente+glow). `TrendBadge` reescrito como server component: flecha Lucide (ArrowUpRight/ArrowDownRight/ArrowRight) \+ color plain (emerald-400 / amber-300 / zinc-500), sin pill de fondo, sin Framer Motion. `AlertaMetrica` pasó sus `rgba` inline a tokens (`border-{c}-400/20 bg-{c}-400/10`), DANGER de `red` a `rose`. `InsightsBlock` fuera del `backdrop-blur-2xl`, header `font-black uppercase`→eyebrow canon, envuelto en `HoverCard`. `PageSpeedCard` con tipografía `text-3xl font-medium tabular-nums` (era `font-mono text-5xl font-black`), headers eyebrow, envuelto en `HoverCard`. `AnalyticsSkeleton` con tokens canon (`rounded-2xl`, `bg-white/[0.02]`, fuera `backdrop-blur`). El `AnalyticsEmptyState` delegó en `ResultEmptyState` conservando el link "VER DEMO VISUAL" \+ el CTA muerto "ACTIVAR AHORA" (flaggeado con `// FIXME(data-truth)`, no cableado).

### Sprint 5 — /seo \+ fix fuga de error (`df4854e`, `0e1d35f`, `5f7989e`)

**Fixes de comportamiento (commits propios):**

`df4854e` — `SeoPage` computaba una variable `isMockData` llamando `getSearchConsoleData()` como probe extra, y nunca la leía. Fetch redundante \+ var muerta. Se eliminó (también resuelve el warning eslint `no-unused-vars` que venía deferido desde Sprint 1 porque `seo/page.tsx` no estaba en scope hasta ahora).

`0e1d35f` — `SeoContent` renderizaba `result.error` directo en el DOM. Viola la regla de CLAUDE.md "never expose internal error messages or stack traces to the client". Se reemplazó por `console.error` server-side \+ un bloque de error genérico y accionable para el cliente (amber, sin detalle interno). Este fix estaba blesseado como parte de la lane (D4/D6 en decisiones locked).

**Reskin cosmético (`5f7989e`) — `upsell.ts` FROZEN intacto:**

`MetricCard` (la card de métrica inline de `seo/page.tsx`) reconstruida con prop `accent`, valor `font-medium` zinc (era coloreado `font-bold tabular-nums`), envuelta en `HoverCard`; salió el hover pelado `scale-[1.01]` sin ring. Las tablas (`TopQueriesTable`/`TopPagesCard`) pasaron a tokens canon \+ `HoverCard`. `PositionBadge` con triples `400/20·/10·300`. `ClicksImpressionsChart` reescrito sobre recharts canon: tooltip de `chartTheme`, axes/grid, reduced-motion en ambas series, div `h-52` (fuera `height={200}`), barras de acento `#22d3ee` con radius `[6,6,0,0]` y `maxBarSize 24` (eran grises `#3f3f46`), `role="img"`. `OportunidadSEO` con triples por impacto (URGENTE rose / ALTO emerald / MEDIO amber), badge `font-black`→`font-medium`, fuera el gradiente y el Framer Motion (curva off-canon) → server-render; `sendClientMessageAction`

+ form intactos. `OportunidadesSEO` header chip `rounded-lg`→`rounded-md`, eyebrow canon.

**El empty upsell** se migró a `ResultEmptyState` (punteado/muted). El `<form action={activarSeo}>` que llama `requestUpsellAction('seo-avanzado','SEO Avanzado')` quedó intacto; solo se restyló el botón con `resultEmptyCtaCls`. `upsell.ts` no se tocó — firma, slug y side-effects (OrganizationModule / ContactSubmission / notifications) están intactos.

---

## Infraestructura nueva: `results/_shared/`

Cuatro archivos nuevos que sirven como fundación para el patrón admin dentro de la sección:

| Archivo | Qué hace |
| :---- | :---- |
| `HoverCard.tsx` | Wrapper `<div>` con `adminHoverCls`; el hover vive afuera del componente interno |
| `ResultEmptyState.tsx` | Empty canon dashed/muted; slot `children` para CTA; exporta clases de botones |
| `chartTheme.ts` | Tokens recharts (tooltip glass, grid, ejes, cursor) \+ re-export `useReducedMotion` |
| `chartHover.ts` | `chartCardHoverCls`: variante no-scale de `adminHoverCls` para cards con recharts |

El patrón de `HoverCard` permite consumir `StatCard` (frozen) dándole el hover del admin sin tocarlo, lo que fue la llave para reconciliar todos los metric cards.

---

## Decisiones locked (D1–D6)

**D1 — Todos los empties a canon admin.** Los seis empties de la sección (activación GA, sin siteUrl, upsell SEO, sin GBP, sin bot, "calibrando") se reconciliaron al patrón punteado/muted vía `ResultEmptyState`. Los CTAs conservan su acción; solo cambia el contenedor.

**D2 — Quitar datos falsos, flaggear deltas hardcodeados.** La fila "Fuente Principal: Google Ads" del tooltip de `SessionsChart` era un dato inventado sin respaldo en GA4; se eliminó (commit atómico propio). Los deltas de tendencia hardcodeados en las metric cards de `/trafico` y `/seo` se **preservaron** con `// FIXME(data-truth)` — no son inventables sin un sprint de datos real.

**D3 — `chartCardHoverCls` local en la lane.** La variante no-scale de `adminHoverCls` existe como const local en `LatencyChart.tsx` (admin, frozen). Se definió en `results/_shared/chartHover.ts` sin editar `lib/hover.ts`. Subirla al shared es un follow-up aditivo trivial fuera de esta lane.

**D4 — Fix de seguridad obligatorio en `/seo`.** Renderizar `result.error` al cliente es una fuga de error interna (viola CLAUDE.md). Se fijó como parte de la lane, con commit atómico propio, y se consideró blesseado (D6).

**D5 — Commits atómicos para fixes no-cosméticos.** Cada fix de comportamiento (D2: Google Ads, D4: fuga de error, tipado `any`, `Math.random()`, probe muerto) fue un commit propio separado del reskin cosmético del mismo sprint. El criterio: el visual-qa automatizado no cubre comportamiento; la revertibilidad individual lo requiere.

**D6 — Blesseados, no frenar.** D2 y D4 estaban aprobados como parte del scope de la lane. La corrida no pausó a preguntar si pertenecían al scope visual — pertenecen.

---

## Contratos frozen respetados

**`upsell.ts`** — `requestUpsellAction(featureKey, featureName)` valida el key en runtime contra `PremiumModule.slug`. La firma, el slug `'seo-avanzado'`, y los side-effects (OrganizationModule / ContactSubmission / notifications) quedaron intactos. El empty del panel upsell se restyló sin tocar la acción.

**Franco P0.2 (análisis mensual)** — `getMonthlyAnalysisForOrg`, `monthly-analysis.ts`, el gate `planAllows(plan,'insight')`, la rama teaser vs. contenido, los thresholds (`CATEGORY_MIN_SAMPLE`), la ventana 30d, y los enums de `InsightCategory`/`InsightStatus`/ `LeadCategory` quedaron intactos. El Sprint 3 fue reskin visual únicamente.

---

## Deuda de datos preservada

Los siguientes elementos se flaggearon con `// FIXME(data-truth)` y se dejaron sin tocar. No son arreglables en un sprint visual sin datos reales o sin cablear endpoints:

- **Deltas de tendencia hardcodeados** en las metric cards de `/trafico` y `/seo` (el porcentaje "▲ 12%" que aparece bajo el valor es un literal, no viene de la query).  
- **`performance.*` de GBP stubbeado a 0** — el bloque "Performance del perfil" en `GBPMetricsCard` nunca renderiza porque los campos llegan como 0 de la API.  
- **CTA "ACTIVAR AHORA"** en el empty demo de `/trafico` — el botón existe en el UI pero no tiene handler; pertenece a un sprint de activación futuro.  
- **Demo property ID hardcodeado** en `getAnalyticsData` — identificador de GA4 de demostración, no dinámico por org.

---

## Gate técnico

Cada sprint corrió `.\node_modules\.bin\tsc.cmd --noEmit` (exit 0, sin errores nuevos) y eslint en los archivos tocados (exit 0, zero `any`). El build (`npm run build`) NO forma parte del gate porque el checkout tiene deuda baseline preexistente no introducida por esta lane (`@googleapis/webmasters` faltante, `react-hooks/set-state-in-effect` en `PreloaderContext`).

**Visual QA automatizado: no corrió.** El subagente `visual-qa` existe pero el único `next dev` disponible durante la corrida era el del checkout principal (`C:\PorfolioDevelOP:3000`), que no tiene los cambios del lane. Next 16 no permite un segundo `next dev` con el puerto ocupado. Matar el server del usuario en una corrida desatendida sería destructivo. Las rutas además son auth-gated y `/analisis` necesita sesión Pro+ sembrada. Por todo eso la verificación visual quedó diferida al humano.

**Resumen de commits (16 commits propios \+ 2 pre-corrida \= 18 total sobre `dd0a3c4`):**

| Sprint | Commits |
| :---- | :---- |
| Pre-corrida | `583a3ee` (header único layout) · `e6578b6` (full-width) |
| 1 | `9e692fc` (bitácora) · `90a202e` (headers /seo+/reputacion) |
| A | `d1a2380` (seed gitignored \+ bitácora Sprint A) |
| 2 | `2b51858` (infra HoverCard+ResultEmptyState) · `37609b5` (reskin /reputacion) |
| 3 | `36bb208` (infra chartTheme+chartHover) · `3ee97f0` (reskin /analisis) |
| 4 | `69ea796` (quitar Google Ads) · `ee24347` (tipar tooltip any) · `15b1d21` (skeleton determinístico) · `df4fbe8` (reskin /trafico+compartidos) |
| 5 | `df4854e` (cleanup isMockData) · `0e1d35f` (D4 fuga de error) · `5f7989e` (reskin /seo) |
| Cierre | `a08e860` (resumen final) |

30 archivos cambiados · \+1478/−1196 líneas.

---

## Lecciones

**"Verde en tsc" ≠ "se ve bien".** Esta es la lección más vieja del proyecto, reforzada acá: la corrida pasó todos los gates técnicos en cada sprint pero el visual QA quedó diferido. El compilador valida tipos, no tokens de diseño. La verificación visual sigue siendo irreemplazable y no puede ser autenticada por quien escribió el código.

**HoverCard / ResultEmptyState como infra reutilizable.** El patrón de envolver primitivas frozen con un wrapper de hover (`HoverCard`) resultó la solución más limpia para darle hover admin a `StatCard` sin tocarlo. Antes de esta lane, cada componente tenía su propio hover bespoke sin ring ni motion-reduce. Ahora hay un punto único. Lo mismo con `ResultEmptyState`: seis empties distintos con estilos distintos pasaron a un molde canónico en un archivo.

**Reskin sobre primitiva compartida sin tocarla.** `StatCard` (frozen) se consumió en 5 componentes distintos de esta sección sin que ninguno lo modificara. La disciplina de "consume-only" permite reskinear toda una sección sin riesgo de regresión en otras partes que comparten la primitiva.

**`chartCardHoverCls` local por el desfase del tooltip de recharts.** `transform:scale` en un wrapper que contiene un chart recharts desincroniza el tooltip del cursor. La variante no-scale ya existía como const local en `LatencyChart.tsx` (frozen). Definirla en la lane en vez de subirla a `lib/hover.ts` fue la decisión correcta para no tocar shared sin consenso — follow-up aditivo trivial cuando se quiera elevarla.

---

## Pendientes / a futuro

- **Verificación visual humana** (obligatoria antes de merge): levantar `next dev` desde `C:\lane-resultados\logic-core-v3` (bajar el :3000 del checkout principal primero), recorrer los 4 tabs con `?demo=true` para trafico/seo, seed de Matsu para /analisis, empty canon para /reputacion. Verificar coreografía hover/recharts/reveals por grabación.  
- **Sprint de datos** (futura lane): resolver la deuda `// FIXME(data-truth)` — deltas de tendencia reales, `performance.*` GBP, CTA de activación cableado, demo id dinámico por org.  
- **`chartCardHoverCls` a `lib/hover.ts`** (follow-up aditivo, sin urgencia): exportar la variante no-scale desde el shared para que otros módulos puedan consumirla sin copiarla.  
- **GBP /reputacion**: la única forma de ver datos reales en dev es conectar una cuenta GBP real vía el flujo OAuth en settings. El empty canon que deja la lane es el estado correcto para dev sin cuenta conectada.
