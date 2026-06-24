# Relevamiento READ-ONLY — 6 secciones del Portal Cliente

> **Alcance:** mapa exacto (estado, ownership, datos, equivalente admin) de las 6 secciones
> pendientes del Portal Cliente de develOP (`logic-core-v3`, Next.js 16 App Router, `/dashboard/*`)
> antes de partirlas en lanes. **100% READ-ONLY del código** — el único archivo escrito es este `.md`.
> Generado: 2026-06-24. El estado *visual* real lo confirma el humano en localhost; acá todo es inferencia de código.

**Las 6 secciones:** Inicio · Mi proyecto · Resultados · Mis servicios · Mi plan · Mi cuenta.
Todas viven bajo `src/app/(protected)/dashboard/`. Las 5 ya cerradas (Mensajes, Chatbot, Soporte, Chat compartido, Notificaciones) aparecen solo como dueñas de archivos compartidos.

**Prior art:** ya existe `docs/client-portal/relevamiento-global.md` con un plan de Lanes previo (Lane 2 = Plan dueña de `UsageMeter`, Lane 4 = Inicio mergea después). Este doc lo **confirma y refina con evidencia** (ver Tabla D, supuesto B, y la recomendación de olas).

**Hallazgo macro:** ninguna sección está vacía. 4 de 6 están **`completa-a-rediseñar`** (funcionales end-to-end, solo rediseño visual) y 2 están **`parcial`** (Inicio y Mi cuenta tienen piezas placeholder dentro de pantallas por lo demás reales). El plan de lanes es de **rediseño/completado**, no de construcción desde cero.

---

## Tabla A — Estado por sección

| Sección | Ruta | Estado (inferido) | Subpáginas (→ "volver atrás") | Equivalente admin (estético) |
|---|---|---|---|---|
| **Inicio** | `/dashboard` | **parcial** — datos reales (HealthScore, WeekResults, AttentionStack, UsageMeter, Brief IA con Gemini), pero varias señales son stubs (visits=0 hardcoded, `computeSeoScore`→null, `computeTrend`=hash placeholder, leads/conversión agency-wide) | ninguna | **ninguno 1:1.** Cercano: `admin/page.tsx` (overview) + `admin/clients/[clientId]` (noción de salud vía `lib/client-health.ts`). El hero de anillos es exclusivo del cliente |
| **Mi proyecto** | `/dashboard/project` | **completa-a-rediseñar** — query real `project.findMany` por org, hero %animado, tabs por estado, flujo aprobar/rechazar entregas con server actions, empty + loading | ninguna | `admin/projects/[projectId]` (+ `/tasks`), board `admin/projects/page.tsx`. Admin **gestiona** tareas; cliente solo **ve+aprueba** |
| **Resultados** | `/dashboard/resultados` | **completa-a-rediseñar** — multi-tab funcional con datos reales (GA4 / Search Console / Google Business Profile + insights IA + análisis chatbot), gateo por plan, demo/empty/error en todas | **SÍ:** `/trafico` (default), `/seo`, `/reputacion`, `/analisis` (index redirige a `/trafico`) | **ninguno 1:1.** Cercano: `admin/chatbot/activity` + `admin/chatbot/health` + `admin/chatbots/[botId]`. Para SEO/Tráfico/Reputación: ninguno |
| **Mis servicios** | `/dashboard/services` | **completa-a-rediseñar** — `service.findMany` por org + catálogo `premiumModule` (ACTIVE/COMING_SOON data-driven), upsell vivo con server action, empty + loading | ninguna | **ninguno 1:1.** Catálogo/pricing en `admin/settings` (module-pricing console); relación Service↔org en `admin/projects` / `admin/clients/[clientId]` |
| **Mi plan** | `/dashboard/plan` | **completa-a-rediseñar** — `getOrgUsageSnapshot` real (QuotaUsage+BotConfig), `UsageMeter` + `PlansShowcase` (3 tiers), CTA upgrade/downgrade funcional, 2 Suspense + loading | ninguna | **ninguno 1:1.** `admin/settings` (config de pricing/quotas) + `admin/clients/[clientId]` (plan+subscription por org). Admin **configura**, cliente **ve** |
| **Mi cuenta** | `/dashboard/cuenta` | **parcial** — Perfil y Facturación completos sobre datos reales (Zod + impersonation read-only); **Bóveda** lista `ClientAsset` reales PERO su timeline "Registro de Integridad y Accesos" es `ACTIVITY_LOG` **hardcodeado** | **SÍ:** `/perfil` (default), `/facturacion`, `/boveda` (index redirige a `/perfil`) | `admin/clients/[clientId]` con tabs (`_components/tabs/*` → `VaultTab`/`VaultManager` para bóveda; `ClientHeader`). La ficha de cliente tabbeada es el espejo |

> **Pendiente "volver atrás":** solo **Resultados** y **Mi cuenta** tienen rutas hijas → son las dos que necesitan el botón de back entre subpáginas.

---

## Tabla B — Ownership por sección (propios / compartidos-read / compartidos-write)

> **Regla clave:** *read* de un compartido NO colisiona; *write* sí. `components/ui/*` y archivos frozen son **siempre read-only**.

### Inicio — `/dashboard`
- **PROPIOS:** `dashboard/page.tsx`, `loading.tsx`, `error.tsx`, `_actions/regenerate-brief.ts`, `components/dashboard/home/{AIExecutiveBriefV2,HealthScore,AttentionStack,WeekResultsGrid}.tsx`, `lib/health-score.ts`*, `lib/dashboard/{attention,week-results}.ts`*, `lib/ai/executive-brief.ts`
  - *`health-score.ts` y `week-results.ts` son **autoría de Inicio pero leídos por reports + admin client-health** → tratar como compartido-read si se toca la lógica de scoring (ripple).*
- **COMPARTIDOS-READ:** `dashboard/layout.tsx` + `DashboardLayoutClient.tsx` (shell), `SubscriptionBanner.tsx`, `ImpersonationBanner.tsx`, `OnboardingStatusCard.tsx`, `plan/UsageMeter.tsx`, `lib/plan/{get-org-usage,get-plan-for-org,plan-allows}.ts`, `lib/preview.ts`, `lib/impersonation.ts`, `lib/types/data-connections.ts`, `lib/prisma.ts`, `auth.ts`, `modules/chatbot/index.server.ts`, `modules/chatbot/server/llm/factory.ts`, `components/ui/*`
- **COMPARTIDOS-WRITE:** *(ninguno)*

### Mi proyecto — `/dashboard/project`
- **PROPIOS:** `project/page.tsx`, `project/loading.tsx`, `components/dashboard/ProjectTaskTabs.tsx`, `components/dashboard/TaskApprovalButtons.tsx`
- **COMPARTIDOS-READ:** `FadeIn.tsx`, `AnimatedCounter.tsx`, `AnimatedProgressBar.tsx`, `src/actions/dashboard-actions.ts` (approve/rejectTaskAction), `lib/preview.ts`, `lib/prisma.ts`, `components/ui/*` (PageHeader, EmptyState, Tabs, Skeleton, skeletons)
- **COMPARTIDOS-WRITE:** *(ninguno)*
- ⚠️ Ojo: **NO usa `lib/actions/projects.ts`** (eso es 100% admin SUPER_ADMIN). Las actions del cliente viven en `src/actions/dashboard-actions.ts`.

### Resultados — `/dashboard/resultados`
- **PROPIOS:** las 4 subpáginas + `layout/loading/error/page`, `ResultadosTabs.tsx`, `AnalyticsMetricCard.tsx`, `AnalyticsSkeleton.tsx`, `AnalyticsAlertas.tsx`, `SeoAlertas.tsx`, `AlertaMetrica.tsx`, `OportunidadesSEO.tsx`, `OportunidadSEO.tsx`, `SessionsChart.tsx`, `ClicksImpressionsChart.tsx`, `TrendBadge.tsx`, `results/{InsightsBlock,PageSpeedCard,GBPMetricsCard}.tsx`, `results/analysis/*` (6 archivos)
- **COMPARTIDOS-READ:** `FadeIn.tsx`, `PreviewBanner.tsx`, `components/ui/*`, `lib/preview.ts`, `lib/prisma.ts`, `lib/analytics.ts`, `lib/searchconsole.ts`, `lib/integrations/{pagespeed,google-business-profile}.ts`, `lib/ai/results-insights.ts`, `lib/plan/{get-plan-for-org,plan-allows}.ts`, `modules/chatbot/index.server.ts`
- **COMPARTIDOS-WRITE:** **`lib/actions/upsell.ts`** — el empty-state de SEO llama `requestUpsellAction('seo-avanzado',…)`; un rediseño del flujo *podría* requerir nuevas keys/variantes (única posible escritura a un compartido en las 6 secciones).

### Mis servicios — `/dashboard/services`
- **PROPIOS:** `services/page.tsx`, `services/loading.tsx`, `PremiumModuleCard.tsx` (vive en root pero solo lo monta esta página)
- **COMPARTIDOS-READ:** `FadeIn.tsx`, `StaggerWrapper.tsx`, `components/ui/*`, `lib/actions/upsell.ts` (solo lo **llama**), `lib/actions/schemas.ts`, `lib/preview.ts`, `lib/prisma.ts`, `context/TransitionContext.tsx` (frozen)
- **COMPARTIDOS-WRITE:** *(ninguno)*

### Mi plan — `/dashboard/plan`
- **PROPIOS:** `plan/page.tsx`, `plan/loading.tsx`, `plan/PlansShowcase.tsx`, `plan/UpgradeCtaButton.tsx`
- **COMPARTIDOS-READ:** `plan/UsageMeter.tsx` (co-dueño con Inicio; prop `hideUpgradeHint` aísla la variante), `lib/actions/upsell.ts` (solo **llama**), `lib/plan/{get-org-usage,plan-presentation,get-plan-for-org,fallback}.ts`, `lib/preview.ts`, `lib/actions/schemas.ts`, `lib/data/message-context.ts`, `components/ui/*`
- **COMPARTIDOS-WRITE:** *(ninguno)*
- ⚠️ Ojo: `CurrentPlanCard` y `SubscriptionBanner` (en el hint) **NO** los usa esta página → son de Mi cuenta y del layout respectivamente.

### Mi cuenta — `/dashboard/cuenta`
- **PROPIOS:** `cuenta/{page,layout,loading,error}.tsx` + `perfil/facturacion/boveda` pages, `CuentaTabs.tsx`, `ProfileForms.tsx`, `VaultRequestModal.tsx`, `VaultRevealButton.tsx`, `CurrentPlanCard.tsx`, `lib/actions/profile.ts`, `lib/billing/get-current-plan.ts`
- **COMPARTIDOS-READ:** `FadeIn.tsx`, `StaggerWrapper.tsx`, `components/ui/*`, `lib/actions/messages.ts` (VaultRequestModal pide doc vía `sendClientMessageAction`), `lib/actions/schemas.ts`, `lib/preview.ts`, `lib/prisma.ts`, `auth.ts`, `lib/action-utils.ts`
- **COMPARTIDOS-WRITE:** *(ninguno en código existente)* — pero ver **FLAG schema (ACTIVITY_LOG)**: para hacer real la timeline de la Bóveda hace falta un modelo nuevo (parada obligatoria).

---

## Tabla C — Matriz de cruce 6×6

**Leyenda:** ✅ = RR / sin shared relevante (**paralelo seguro**) · ⚠️ = RW, un lado escribe el compartido (**paralelo con cuidado**) · 🔴 = WW, ambos escriben (**colisión → serie**).
**Resultado: 0 colisiones 🔴.** Solo 2 aristas ⚠️, ambas por `lib/actions/upsell.ts`.

| | Inicio | Mi proyecto | Resultados | Mis servicios | Mi plan | Mi cuenta |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Inicio** | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mi proyecto** | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| **Resultados** | ✅ | ✅ | — | ⚠️ | ⚠️ | ✅ |
| **Mis servicios** | ✅ | ✅ | ⚠️ | — | ✅ | ✅ |
| **Mi plan** | ✅ | ✅ | ⚠️ | ✅ | — | ✅ |
| **Mi cuenta** | ✅ | ✅ | ✅ | ✅ | ✅ | — |

### Detalle por par (archivos compartidos + read/write)

| Par | Clasif. | Archivos compartidos (modo) |
|---|:---:|---|
| Inicio ↔ Mi proyecto | ✅ RR | `lib/preview.ts` (R/R), `lib/prisma.ts` (R/R) |
| Inicio ↔ Resultados | ✅ RR | `lib/preview.ts`, `lib/plan/get-plan-for-org.ts`, `lib/plan/plan-allows.ts`, `lib/prisma.ts` (todos R/R) |
| Inicio ↔ Mis servicios | ✅ RR | `lib/prisma.ts` (R/R) |
| Inicio ↔ Mi plan | ✅ RR | `plan/UsageMeter.tsx`, `lib/plan/get-org-usage.ts`, `lib/preview.ts`, `lib/plan/get-plan-for-org.ts` (todos R/R) — *co-propiedad blanda, ver supuesto B* |
| Inicio ↔ Mi cuenta | ✅ RR | `lib/preview.ts`, `lib/prisma.ts`, `auth.ts` (todos R/R) |
| Mi proyecto ↔ Resultados | ✅ RR | `FadeIn.tsx`, `lib/preview.ts`, `lib/prisma.ts` (todos R/R) |
| Mi proyecto ↔ Mis servicios | ✅ RR | `FadeIn.tsx`, `lib/prisma.ts`, `ui/Skeleton.tsx` (todos R/R) |
| Mi proyecto ↔ Mi plan | ✅ RR | `lib/preview.ts`, `ui/index.ts` (R/R) |
| Mi proyecto ↔ Mi cuenta | ✅ RR | `FadeIn.tsx`, `lib/preview.ts`, `lib/prisma.ts`, `ui/index.ts` (R/R) |
| **Resultados ↔ Mis servicios** | **⚠️ RW** | `FadeIn.tsx` (R/R), `lib/prisma.ts` (R/R), **`lib/actions/upsell.ts` (W/R)** |
| **Resultados ↔ Mi plan** | **⚠️ RW** | `lib/preview.ts` (R/R), `lib/plan/get-plan-for-org.ts` (R/R), **`lib/actions/upsell.ts` (W/R)** |
| Resultados ↔ Mi cuenta | ✅ RR | `FadeIn.tsx`, `lib/preview.ts`, `lib/prisma.ts` (R/R) |
| Mis servicios ↔ Mi plan | ✅ RR | `lib/actions/upsell.ts` (R/R), `lib/actions/schemas.ts` (R/R) |
| Mis servicios ↔ Mi cuenta | ✅ RR | `FadeIn.tsx`, `StaggerWrapper.tsx`, `lib/actions/schemas.ts`, `lib/prisma.ts` (R/R) |
| Mi plan ↔ Mi cuenta | ✅ RR | `lib/preview.ts`, `ui/index.ts`, `lib/actions/schemas.ts` (R/R) |

> El único compartido con potencial de escritura en todo el cruce es **`lib/actions/upsell.ts`**, y solo desde **Resultados**. Servicios y Plan únicamente lo *llaman*. No hay write-write en ninguna parte.

---

## Tabla D — Validación de los 4 supuestos heredados

| # | Supuesto | Veredicto | Evidencia + consecuencia para lanes |
|---|---|:---:|---|
| **A** | Resultados + Mis servicios + Mi plan comparten `lib/actions/upsell.ts` | **CONFIRMADO** | Las 3 usan `requestUpsellAction(featureKey, featureName)`: Resultados-SEO inline (`upsell.ts:9-12`; `seo/page.tsx:13,124`), Servicios vía `PremiumModuleCard.tsx:24,83`, Plan vía `UpgradeCtaButton.tsx:36,70`. **Las 3 solo READ** (invocan la firma de 2 strings). **NO es cluster forzado-serial:** corren en paralelo mientras la **firma quede congelada**. `services.ts` NO es el link (es CRUD SUPER_ADMIN-only). → Tratar `upsell.ts` como **contrato congelado**; si alguien cambia su firma, esa lane se vuelve bloqueante y va sola primero. |
| **B** | Inicio depende de un `UsageMeter` que el cluster construiría (no existe aún) | **REFUTADO** | `UsageMeter` **ya existe y está completo** (`plan/UsageMeter.tsx:74-179`, 4 tonos + CTA) y **ya lo consume Inicio** (`dashboard/page.tsx:5,66-80`) y Plan (`plan/page.tsx:5,38`). Vive en `plan/` → **dueño = Mi plan**; Inicio es **consumidor**. No hay nada que construir ni dependencia de orden de build. El acople real es de **edición concurrente** sobre `UsageMeter.tsx` + `lib/plan/get-org-usage.ts`. → Regla: **Inicio mergea DESPUÉS de Plan** (no fusionar Inicio en Plan; entra solo como consumidor). Coincide con `relevamiento-global.md:703,716,745`. |
| **C** | Mi proyecto es aislado (solo necesita `FadeIn` / nada compartido propio) | **REFUTADO** (pero bajo acople) | NO es solo FadeIn: comparte (read) `FadeIn`, `AnimatedCounter`, `AnimatedProgressBar`, `ui/*` y `src/actions/dashboard-actions.ts` (approve/rejectTaskAction). SÍ tiene **propios reales**: `ProjectTaskTabs.tsx` + `TaskApprovalButtons.tsx` (0 montajes fuera). `OnboardingStatusCard` **NO** lo toca (solo Inicio) → la premisa de que lo comparte es falsa. (`project/page.tsx:8-12,212-217`; `TaskApprovalButtons.tsx:5`). → Lane segura: write libre sobre sus 2 componentes propios; todo lo demás read-only. |
| **D** | Mi cuenta requiere construir un ACTIVITY_LOG real que hoy no existe | **CONFIRMADO** | No hay modelo de activity/audit log **de cara al cliente**. La timeline "Registro de Integridad y Accesos" de la Bóveda es `ACTIVITY_LOG` hardcodeado de 4 entradas demo (`boveda/page.tsx:96-103,299-360`). Perfil y Facturación no muestran actividad. `AdminAuditLog` (`schema:1560-1584`) es admin-facing y **sin `organizationId`** (no scopeable a la org cliente sin riesgo de leak); `OsLeadActivity` (`schema:899-913`) es CRM/ventas. → **PENDIENTE: schema** (parada obligatoria, OK de Valentino). La lane de Mi cuenta debe tratar la timeline como contenido fake a reemplazar y **no puede cerrar** ese bloque con datos reales sin un modelo nuevo. |

---

## FLAGS PENDIENTES

### 🛑 Paradas obligatorias (schema — requieren OK de Valentino, NO construir)

1. **ACTIVITY_LOG de cliente (Mi cuenta / Bóveda)** — *bloqueante para esa pieza.*
   No existe modelo. `AdminAuditLog` y `OsLeadActivity` no son reutilizables (sin `organizationId` cliente / semántica equivocada). Para una timeline real haría falta un modelo nuevo tipo `AccountActivity { organizationId, actorType, action, targetType/Id, createdAt }`. Hoy la Bóveda muestra `ACTIVITY_LOG` hardcodeado (`cuenta/boveda/page.tsx:96-103`).

2. **Señales placeholder del Inicio (deuda de datos / multi-tenant)** — *no bloquea el rediseño visual, pero degrada/ensucia datos:*
   - No hay tabla de history de health-score → `computeTrend()` es un **hash placeholder** (comment: "stable placeholder until we have score history in DB"). Para tendencia real haría falta algo tipo `HealthScoreSnapshot` (hoy solo existe `ExecutiveBriefSnapshot`).
   - `week-results` **visits hardcodeadas en 0** (no hay fuente de tráfico por org cableada).
   - ⚠️ **`ContactSubmission` no tiene `organizationId`** → `computeLeadsScore`/`computeConversionScore` y week-results calculan **agency-wide, no por tenant**. Es una preocupación de correctitud/aislamiento multi-tenant: revisar antes de presentarlo como métrica "de tu empresa".

### 📝 Notas (no bloquean, decidir en el rediseño)

3. **`upsell.ts` = contrato congelado.** Firma `requestUpsellAction(featureKey, featureName)`. Si **Resultados** (único con write potencial) necesita cambiarla → se vuelve **pre-paso bloqueante** que mergea solo y primero (rompe Resultados+Servicios+Plan a la vez). Mientras la firma no cambie, las 3 van en paralelo.

4. **Posibles componentes muertos (legacy de Resultados):** `DownloadReportButton.tsx`, `ExecutiveReportTemplate.tsx` (solo usado por el anterior), `AnalyticsPeriodSelector.tsx`, `LeakMeter.tsx` — **0 imports desde `src/app`**. En el rediseño de Resultados: decidir revivir (selector de período + descarga de reporte son features naturales) o eliminar.

5. **Bugs menores fuera de scope (Mi cuenta):** links a rutas viejas (`/dashboard/facturacion` y revalidate `/dashboard/profile` en `profile.ts`, en vez de `/dashboard/cuenta/*`); char roto "Ocurri?" en DangerZone; fragmento `<></>` muerto en `PremiumModuleCard`. Anotados, no bloqueantes.

---

## Recomendación de agrupamiento (olas) — *para revisión de Valentino, no definitiva*

**Headline:** la matriz tiene **0 colisiones write-write**. Por la regla determinística, las 6 secciones *podrían* ir en una sola ola paralela. La serialización de abajo es **por riesgo**, no forzada por colisión.

- **Ola 0 (condicional, solo si hace falta):** cambio de firma de `upsell.ts` desde Resultados — **solo, bloqueante**. Se omite por completo si el contrato queda congelado (lo recomendado).
- **Ola 1 (paralelo):** **Mi proyecto · Mi cuenta · Resultados · Mis servicios · Mi plan.** Todas RR entre sí; la única arista RW (Resultados→Servicios/Plan en `upsell.ts`) es segura mientras Resultados no cambie la firma (la Ola 0 absorbe ese riesgo).
- **Ola 2:** **Inicio** — mergea **después de Plan** para consumir el `UsageMeter.tsx`/`get-org-usage.ts` final sin edición concurrente. Inicio es puro-consumidor (todo RR).

**Caveats para el humano:**
- **Mi cuenta** carga un bloqueante *no-de-colisión* (supuesto D): sin modelo de actividad, el "registro de accesos" no cierra con datos reales en ninguna ola → prerrequisito de schema, fuera de scope de rediseño.
- **Primitivas compartidas** (`FadeIn`, `StaggerWrapper`, `AnimatedCounter/ProgressBar`, `ui/*`, `Skeleton`, `prisma`, `preview`, `auth`) son RR en todas partes → **mantener read-only** en todas las lanes. Cualquier edición deliberada escala a coordinación cross-lane y debería salir como pre-ola propia.
- Esta ola-3 (0/1/2) **refina** el plan de `relevamiento-global.md`; reconciliarlos antes de ejecutar.
