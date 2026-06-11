# Auditoría total pre-deploy — Logic Core v3

> Documento consolidado de auditorías pre-deploy. Las fases AUDIT-1/2/3 (integridad,
> flujos, seguridad) y el trabajo de perf BP.1–4 / R2 / R3 viven en
> `docs/audits/2026-05-auditoria-profunda.md`, `docs/audits/2026-05-auditoria-db.md`,
> `docs/baselines/*` y `docs/bitacora-roadmap.md`. Este archivo arranca con AUDIT-4.

---

# AUDIT-4 OPTIMIZACIÓN — Detección de oportunidades de performance

**Fecha:** 2026-06-02
**Auditor:** Claude Opus 4.8 — modo desatendido, report-only
**Tipo:** Detección + medición. **CERO cambios** de código, schema, datos, migraciones o dependencias.
**Alcance:** 5 ejes (bundle · queries Prisma · re-renders/React · cold-start/server · assets) sobre las 4 superficies (widget, admin, dashboard, runtime bot).
**No-duplicación:** NO re-reporta lo ya optimizado — bundle BP.1 (googleapis fuera), BP.2 (Prisma fuera del client), BP.3 (Lucide tree-shake), BP.4 (config build); runtime bot R2 (queries paralelas + cache); admin R3 (`unstable_cache`); ni los índices DB faltantes ya documentados en `auditoria-db` (Conversation.lastMessageAt, ChatbotEvent.type, Notification).

---

## 0. Método y limitación de medición (leer antes que la tabla)

- **El build de prod FRESCO no estuvo disponible.** `npm run build` falla por una dependencia **declarada pero no instalada**: `@googleapis/webmasters` (ver **O-2**). Respetando la regla "cero cambios", **no se instaló nada**. Por eso no hay bundle-analysis nuevo (First Load JS por ruta, tamaños de chunk actuales).
- **El bundle se apoya entonces en:** (a) mediciones ya documentadas BP.1–3 del 2026-05-26 — `.next/static` total = **6.70 MB**, Lucide ≈ 35 KB, stub Prisma ≈ 69 KB; (b) **análisis estático** de imports (eager vs lazy, client vs server) — evidencia estructural sólida; (c) **tamaños en disco** de `node_modules` como **SEÑAL, no como peso de bundle** (tras tree-shake + minify el bundle es mucho menor — lección explícita de BP.3).
- **Cada fila declara su tipo de evidencia.** Lo que no se pudo medir va como 🔵, no inflado a oportunidad confirmada.
- **Counts de DB reales** (de `auditoria-db`, 2026-05-21) usados para juzgar impacto de queries: Organization=8, User=8, OsLead=15, Conversation=49, ChatMessage=122, ChatbotEvent=73, OsLeadActivity=84, Task=34, AdminAuditLog=155, EmailContact=0, BotConfig=2 (1 activo). **La base está en estado pre-producción**: varios "sin `take`" no duelen HOY, escalan mal mañana — clasificados en consecuencia.

Leyenda impacto: 🔴 ALTO · 🟡 MEDIO · 🟢 BAJO/MARGINAL · 🔵 SOSPECHA SIN MEDIR.

---

## 1. ALTO IMPACTO / BAJO ESFUERZO — quick wins reales

| # | Oportunidad | archivo:línea | Medición / evidencia | Impacto | Esfuerzo |
|---|---|---|---|---|---|
| **O-1** | **~12.9 MB de video autoplay sin optimizar en `/web-development`.** Dos `<video autoPlay loop muted playsInline>` apuntan directo a mp4 crudos de `/public`, **sin `poster`, sin `preload`, sin compresión adaptativa** → el browser baja el video completo al cargar la página. Brutal en mobile/datos. | [VideoCard.tsx:4-14](../src/components/ui/VideoCard.tsx#L4) (render en [WebDevelopmentBento.tsx:473](../src/components/sections/web-development/WebDevelopmentBento.tsx#L473)) · [WebDevelopmentSensory.tsx:124-139](../src/components/sections/web-development/WebDevelopmentSensory.tsx#L124) | Tamaños medidos en `/public`: `Woman_engrossed…mp4` = **5.81 MB**, `Male_business_owner…mp4` = **7.11 MB**. Ambos en la misma página pública. Ningún atributo `poster`/`preload` en el JSX. | 🔴 | Bajo-medio (poster + `preload="none"`/metadata + recomprimir; o click-to-play) |
| **O-2** | **Build de prod ROTO** — bloquea deploy y bloqueó la medición de bundle de este audit. `@googleapis/webmasters` está declarada en package.json pero **no instalada** en `node_modules` → `next build` corta con `Module not found: Can't resolve '@googleapis/webmasters'`. | [package.json:28](../package.json#L28) · import en [searchconsole.ts:2](../src/lib/searchconsole.ts#L2) → arrastrado por [api/reports/monthly/route.ts](../src/app/api/reports/monthly/route.ts) | Reproducido 2× esta noche. Log: `./src/lib/searchconsole.ts:2 Module not found`. `node_modules/@googleapis/webmasters` no existe (verificado). | 🔴 (blocker; es correctness, no perf, pero es trivial y crítico) | Bajísimo (`npm ci` / `npm install`) |
| **O-3** | **~18 MB de video HUÉRFANO en `/public`** — archivos que ninguna parte de `src/` referencia. Peso muerto en el deploy (Netlify). | `/public/video/`, `/public/videos/` | Grep exhaustivo de `.mp4` y nombres base en `src/` → solo 2 videos referenciados. **Sin referencia:** `Man_sips_coffee_scrolls_phone…mp4` = **10.13 MB** (el más grande), `Muestra-pagina-ejemplo.mp4` = **5.03 MB**, `videos/ia-ingenieria-aplicada-demo.mp4` = **2.41 MB**, `videos/software-development-hero-intro.mp4` = **0.66 MB**. | 🟡 (deploy size; no afecta carga de usuario salvo que se referencien) | Bajo (confirmar y borrar) |

---

## 2. MEDIO — vale evaluar

| # | Oportunidad | archivo:línea | Medición / evidencia | Impacto | Esfuerzo |
|---|---|---|---|---|---|
| **O-4** | **El root layout carga el "chrome" de landing en TODA ruta autenticada.** `CustomCursor`, `NoiseOverlay`, `SmoothScroll` (lenis), `PreloaderProvider`, `TransitionProvider` y `Toaster` están **fuera** de `PublicOnlyComponents` → se montan y corren (rAF loops de lenis + cursor) también en `/dashboard/*` y `/admin/*`, donde no aportan. Solo `Shutter`/`Navbar`/`Preloader` están bien acotados. | [layout.tsx:73-90](../src/app/layout.tsx#L73) | Análisis estático del árbol de providers del root layout. `SmoothScroll`=lenis (1.3.17), `CustomCursor`=pointer-tracking client. | 🟡 | Medio (riesgo: hooks que dependen de los providers; requiere un layout público vs app) |
| **O-5** | **recharts importado estático en 5 charts** (todos tras auth). No están en páginas públicas — el único uso "público" (`ShowcaseSoftware`) es código muerto (ver O-8). Candidatos a `next/dynamic` para sacarlos del First Load JS de las páginas de analytics. | [SessionsChart.tsx:11](../src/components/dashboard/SessionsChart.tsx#L11) · [ClicksImpressionsChart.tsx:15](../src/components/dashboard/ClicksImpressionsChart.tsx#L15) · [dashboard-history-charts.tsx:18](../src/app/(protected)/admin/_components/dashboard-history-charts.tsx#L18) · [ActivityChart.tsx:11](../src/modules/chatbot/components/admin/activity/ActivityChart.tsx#L11) · [LatencyChart.tsx:12](../src/modules/chatbot/components/admin/health/LatencyChart.tsx#L12) | recharts en disco: **6.44 MB** (señal; bundle real ≈ 90-110 KB gz estimado, **no medido**). Import estático confirmado (`} from 'recharts'`). | 🟡 (bajo: tras auth, suele ser contenido principal de su página) | Bajo (`dynamic(…, { ssr:false })` con skeleton) |
| **O-6** | **cron `generate-insights`: over-fetch + dead code.** `botConfig.findMany({ include: { organization: true } })` trae la **fila completa** de cada org cuando solo usa `leadNotificationEmail`/`leadNotificationMode`/`companyName`/`name`/`slug`. Loop secuencial de LLM por bot (inherente). Además: query comentada (línea 39) y `const org: any` (línea 57). | [generate-insights/route.ts:21-24](../src/app/api/cron/generate-insights/route.ts#L21), [:39](../src/app/api/cron/generate-insights/route.ts#L39), [:57](../src/app/api/cron/generate-insights/route.ts#L57) | Lectura del archivo. Over-fetch marginal con 2 bots; el `any` ya estaba en el code-smell list de auditoria-profunda 7.G. | 🟡 (marginal hoy; el `include` sin `select` escala con columnas de Organization) | Bajo (`select` explícito) |
| **O-7** | **Reportes semanales: DOS implementaciones + loops secuenciales con email adentro.** `sendExecutiveWeeklyReports` itera orgs y por cada una hace `findUnique → build → upsert → sendEmail → update` **en serie**; `sendWeeklyReports` itera bots igual. Round-trip de email por iteración ⇒ O(N) secuencial ⇒ **riesgo de timeout serverless** a escala. (El `findMany` inicial SÍ usa `select`/`include` acotado — bien). Parecen lógicas paralelas duplicadas. | [executive-weekly/send.ts:65-188](../src/lib/reports/executive-weekly/send.ts#L65) · [sendWeeklyReports.ts:38-87](../src/modules/chatbot/server/reports/sendWeeklyReports.ts#L38) | Lectura de ambos archivos. Cron tolerante a latencia (8 orgs / 2 bots hoy → ok); `regenerate-briefs` ya declara `maxDuration=300` (señal de que el patrón es lento). | 🟡 (bajo ahora; escala mal; consolidar las 2 implementaciones) | Medio (concurrencia con límite + dedupe de lógica) |

---

## 3. BAJO / MARGINAL

| # | Oportunidad | archivo:línea | Medición / evidencia | Impacto | Esfuerzo |
|---|---|---|---|---|---|
| **O-8** | **Código muerto (cero impacto en bundle, solo higiene).** Componentes sin ningún importador vivo — Next no los compila ni entran al grafo, así que **no pesan en runtime**; pero son ~miles de líneas que hacen parecer que three.js/recharts se usan más de lo real. | `canvas/`: [AuroraBackground](../src/components/canvas/AuroraBackground.tsx), [Interactive3DNetwork](../src/components/canvas/Interactive3DNetwork.tsx), [LiquidProject](../src/components/canvas/LiquidProject.tsx), [NeuralNetwork](../src/components/canvas/NeuralNetwork.tsx), [ReactiveBackground](../src/components/canvas/ReactiveBackground.tsx) · [dashboard/AnimatedTaskList](../src/components/dashboard/AnimatedTaskList.tsx), [AnalyticsPeriodSelector](../src/components/dashboard/AnalyticsPeriodSelector.tsx) · [automation/ComparativaAutomation](../src/components/automation/ComparativaAutomation.tsx) · [software/ShowcaseSoftware](../src/components/software/ShowcaseSoftware.tsx) (recharts) · 3 archivos `page.tsx.bak` (software-development, web-development, process-automation) | Grep de cada nombre → solo su definición + referencias en `.bak`. Cero `import` desde rutas vivas. | 🟢 (sin impacto perf; cleanup) | Bajo (borrar tras confirmar) |
| **O-9** | **Logo PNG de 1.19 MB como source.** `logodevelOP.png` se usa vía `next/image` (que lo optimiza — **no shippea 1.19 MB al cliente**), pero existe `logodevelOP.svg` (0.6 KB) ya usado en el resto del sitio. Source sobre-dimensionado + inconsistencia (PNG donde hay SVG vectorial). | [login/page.tsx:225](../src/app/login/page.tsx#L225),[:369](../src/app/login/page.tsx#L369) · [soporte/[ticketId]/page.tsx:180](../src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx#L180) · [OnboardingWizard.tsx:246](../src/components/onboarding/OnboardingWizard.tsx#L246) | Las 4 usan `<Image>` (verificado). `/public/logodevelOP.png` = 1.19 MB; `.svg` = 0.6 KB. | 🟢 (next/image mitiga; overhead de optimización + storage) | Bajo (usar el SVG o un PNG dimensionado) |
| **O-10** | **`pipeline-section-bg.png` (1.07 MB) huérfano.** Sin referencia en `src/` ni en `globals.css`. | `/public/images/backgrounds/pipeline-section-bg.png` | Grep en `src/` y en `globals.css` → 0 hits. | 🟢 (deploy size) | Bajo (confirmar y borrar) |
| **O-11** | **Value de contexts sin memoizar.** `value={{...}}` crea objeto nuevo en cada render → consumidores re-renderizan por identidad. **Pero el re-render es ACOTADO**, no por-frame: PreloaderContext cambia solo en transiciones de `phase` (`introProgress`/`canvasReveal` son MotionValues, no disparan render React); TransitionContext cambia por navegación. | [PreloaderContext.tsx:118](../src/context/PreloaderContext.tsx#L118) · [TransitionContext.tsx:163](../src/context/TransitionContext.tsx#L163) | Lectura: callbacks ya son `useCallback`; lo único no memoizado es el wrapper. Frecuencia de cambio baja. | 🟢 (los agentes lo marcaron HIGH; verificado: impacto bajo) | Bajo (`useMemo`; **OJO**: archivos sensibles/frozen — no rompe el contrato de `triggerTransition`/phase flow) |
| **O-12** | **Dos proveedores de email coexisten.** Resend (transaccional: leads/insights/mensajes — instanciado **lazy** dentro de funciones) + Brevo (`@getbrevo/brevo`, reportes semanales). Server-side, **fuera del hot-path** del bot. Consolidar a uno reduce superficie/peso de deps. | Resend: [lib/email.ts:1](../src/lib/email.ts#L1), [sendLeadNotification.ts:25](../src/modules/chatbot/server/notifications/sendLeadNotification.ts#L25), [sendInsightsNotification.ts:49](../src/modules/chatbot/server/notifications/sendInsightsNotification.ts#L49), [notify-message.ts](../src/lib/email/notify-message.ts) · Brevo: [brevo-service.ts:1](../src/lib/email/brevo-service.ts#L1) | Disco: `@getbrevo/brevo`=4.71 MB, `resend`=0.19 MB. `new Resend()` se construye en runtime de la función, no en import (cold-start marginal). | 🟢 (server, no hot-path; nota arquitectónica) | Medio (migrar plantillas a un solo proveedor) |
| **O-13** | **`findMany` sin `take` en tablas hoy chicas (escala futura).** Varias listas sin paginación. Con los counts actuales el impacto es **nulo**; escalan linealmente con datos. | p.ej. [email-marketing/_actions.ts:135](../src/app/(protected)/dashboard/modules/email-marketing/_actions.ts#L135) (EmailContact=0), [bulk-actions.ts](../src/lib/bulk-actions.ts) (export de leads con `include` anidado), `dashboard/project/page.tsx` (Project=8) | Lectura + counts de `auditoria-db`. Honesto: oportunidad de **escala**, no de hoy. | 🟢 (escala) | Bajo-medio (paginar / `take` defensivo) |

---

## 4. 🔵 SOSPECHA SIN MEDIR (no se pudo cuantificar el impacto real)

| # | Oportunidad | archivo:línea | Por qué no se midió | Señal disponible |
|---|---|---|---|---|
| **O-14** | **Stack 3D completo en el First Load JS del home.** `Hero` se importa **estático** (no `dynamic`) y se renderiza primero (ATF) en el home; `Hero.tsx` importa estático `three` + `three-stdlib` (SVGLoader) + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`. | [page.tsx:7](../src/app/page.tsx#L7),[:25](../src/app/page.tsx#L25) · [Hero.tsx:3-11](../src/components/layout/Hero.tsx#L3) | Peso real en bundle **no medible** (build roto, O-2). | Disco (señal, no bundle): three=34.4 MB, postprocessing=2.64, R3F=2.15, drei=1.70. **Lever limitado**: es el centerpiece ATF — diferirlo con `ssr:false` no evita cargarlo (igual se necesita al instante) y daña LCP/UX. Ver **NO TOCAR**. |
| **O-15** | **Bundle por ruta (First Load JS) no medible.** No hay build fresco. | — | Build roto (O-2). | Baseline documentado: `.next/static` = **6.70 MB** total (BP.3, 2026-05-26). Para números frescos: resolver O-2 y correr `next build`. |
| **O-16** | **`date-fns` (21.5 MB en disco) — patrón de import no verificado.** Si algún archivo hace `import * as` o import del barrel completo, no tree-shakea. | (no auditado en detalle) | No se grepearon los ~N sitios de `date-fns`. | Disco 21.5 MB. Tree-shakeable si los imports son puntuales (`import { format } from 'date-fns'`). Verificar en un próximo pase. |

---

## 5. NO TOCAR — ya está bien, o riesgo > beneficio

Importante para no "optimizar" lo que ya funciona y romperlo:

- **Code-splitting del home ya hecho:** secciones below-the-fold con `next/dynamic` ([page.tsx:11-19](../src/app/page.tsx#L11)).
- **Canvases 3D ya con `ssr:false`** en login, forgot-password, accept-invite, web-development (`HeroBackground`), process-automation (`DataPacketsCanvas`).
- **PDF libs (`jspdf`+`html2canvas`) ya lazy** — `import()` dinámico dentro del click handler ([DownloadReportButton.tsx](../src/components/dashboard/DownloadReportButton.tsx)). Patrón correcto.
- **Widget chatbot lazy** vía `PublicOnlyComponents` con `ssr:false` (no carga en el First Load).
- **Queries ya paralelizadas** (NO son waterfalls): dashboard layout (2× `Promise.all`, [layout.tsx:69](../src/app/(protected)/dashboard/layout.tsx#L69),[:91](../src/app/(protected)/dashboard/layout.tsx#L91)), `health-score`, `week-results`, `attention`, `executive-brief`, admin OS page (14 queries en `Promise.all`).
- **Runtime del bot (R2):** queries pre-LLM paralelas + cache de `resolveBotBySlug`. **No re-optimizar.** El email de notificación de lead es **fire-and-forget** (`void notifyClient()`), no bloquea la respuesta — el "Resend crítico en hot path" que sugería el análisis inicial es **falso** (cliente Resend instanciado lazy, módulo de 0.19 MB).
- **Admin (R3):** `unstable_cache` + `revalidateTag`. Sin N+1 real (verificado en R3).
- **Bundle BP.1-3:** googleapis fuera, Prisma fuera del client (stubs browser-safe by-design), Lucide tree-shake OK (~35 KB). **No re-auditar.**
- **Assets bien resueltos:** fonts vía `next/font/google` (self-host + optimize, [layout.tsx:2,7-15](../src/app/layout.tsx#L2)); `next/image` disciplinado (solo 4 `<img>` crudos en todo `src/`, y justificados por URLs dinámicas de usuario que no pueden usar `next/image` sin `remotePatterns`).
- **`computeReplyScore`** ([health-score.ts:357](../src/lib/health-score.ts#L357)) — usa `select` y filtra por ventana de 30 días. **NO es over-fetch** (descartado un falso positivo del análisis inicial). Igual `regenerate-briefs` y `executive-weekly/send` ya usan `select`.
- **Sentry instrumentation** ([instrumentation.ts](../src/instrumentation.ts)) — pesa en cold-start pero es requisito de monitoreo. Aceptado.
- **Índices DB faltantes** (Conversation.lastMessageAt, ChatbotEvent `(botConfigId,type,createdAt)`, Notification `(organizationId,createdAt)`) — **ya documentados en `auditoria-db` §3.2**. No re-reportados acá; aplicarlos cuando las tablas crezcan (hoy 49/73/19 filas → invisible).

---

## 6. Resumen

- **Oportunidades detectadas: 16** (O-1 … O-16) + sección NO TOCAR.
- **Distribución por impacto:**
  - 🔴 ALTO: **2** — O-1 (videos autoplay 12.9 MB en /web-development) · O-2 (build roto, blocker).
  - 🟡 MEDIO: **5** — O-3 (18 MB video huérfano) · O-4 (chrome landing en rutas auth) · O-5 (recharts sin code-split) · O-6 (cron over-fetch) · O-7 (reportes semanales secuenciales/duplicados).
  - 🟢 BAJO/MARGINAL: **6** — O-8 (código muerto) · O-9 (logo PNG source) · O-10 (bg PNG huérfano) · O-11 (contexts sin memo) · O-12 (2 email providers) · O-13 (findMany sin take, escala).
  - 🔵 SIN MEDIR: **3** — O-14 (Hero 3D en home) · O-15 (bundle por ruta) · O-16 (date-fns).
- **Quick wins recomendados (orden):** **O-2** (trivial, desbloquea deploy + medición) → **O-1** (mayor impacto de usuario, una página) → **O-3 + O-10** (borrar peso muerto) → **O-5** (code-split charts).
- **Lo más valioso que NO conviene tocar:** el runtime del bot (R2), el code-splitting/caching ya hecho, y el Hero 3D ATF (diseño).
- **Hallazgo transversal:** la mayoría de los "sin `take`/sin `select`" **no duelen hoy** (base pre-producción) pero escalan linealmente. Y varios hallazgos que un análisis superficial marcaría como graves resultaron falsos o sobre-estimados al verificarlos con evidencia (Resend en hot-path, over-fetch en health-score, contexts HIGH) — coherente con la REGLA #0: **medir antes de afirmar**.

**Pendiente para una medición completa:** resolver O-2 y correr `next build` para obtener First Load JS por ruta y cerrar O-14/O-15/O-16 con números reales.

— Fin AUDIT-4. Report-only: cero cambios de código, schema, datos o dependencias.
