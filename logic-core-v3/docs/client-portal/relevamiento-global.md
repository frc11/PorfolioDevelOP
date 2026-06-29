# Relevamiento global — Portal cliente
_Fecha: 2026-06-22 · Base: origin/main · Read-only · App: `logic-core-v3`_

> **Método.** Relevamiento estrictamente read-only orquestado con 7 subagentes (1 mapeo de rutas + 5 áreas en paralelo + 1 síntesis). Cero modificaciones de código; la única escritura es este `.md`. Baseline verificado por el orquestador: `tsc --noEmit` → **exit 0**. Los hallazgos load-bearing (chrome admin/cliente, `proxy.ts`, `auth.config.ts`, multi-tenancy) se re-verificaron abriendo los archivos reales contra `origin/main`.

## 0. Resumen ejecutivo

**Hallazgo que reencuadra la misión:** el portal cliente **NO es greenfield**. Las 9 secciones objetivo (Inicio · Mi proyecto · Resultados · Mi servicio · Mi plan · Mi chatbot · Mensajes · Soporte · Mi cuenta) **ya existen con contenido REAL** (datos de Prisma/integraciones, con estados loading/empty/error por ruta), más rutas EXTRA (módulos premium `modules/*` y una `/dashboard/leads` legacy huérfana). El trabajo pendiente no es "construir el portal" sino **(a) alinear la estética al admin (D1), (b) heredar los fixes del admin (D2) y (c) cerrar deudas puntuales.**

Puntos clave:

1. **D1 (estética) NO es bloqueo y NO toca `ui/*`.** Admin y cliente ya comparten tokens de color, primitivas `ui/*`, el pill activo del sidebar (`layoutId` + mismo spring), el hover (`adminHoverCls`) y los estados loading/empty/error. La divergencia es puramente de **chrome estructural** (admin: shell `fixed` + card flotante `rounded-[28px]` glass + topbar flotante + sidebar agrupada; cliente: shell `flex` + `<main>` directo + header inline + sidebar plana). Alinear ≈ modificar 2-3 archivos del cliente (`DashboardLayoutClient.tsx`, `SidebarNav.tsx`, opc. `PageTransition.tsx`). `src/components/ui/*` **no es landmine** (0 CSS-vars de tema, 0 `setProperty`). Ver §4.

2. **Seguridad multi-tenant: sólida, sin leaks cross-tenant.** Toda query alcanzable desde `/dashboard` deriva la org de la **sesión** (vía `resolveOrgId()` o `getClientChatbotSession()`); los accesos por ID dinámico (`leads/[id]`, `soporte/[ticketId]`, replies, export) tienen guard anti-IDOR. Ver §5B.

3. **Inconsistencia de impersonation (no es leak, es UX rota).** Varias acciones de escritura (`profile`, `messages`, `upsell`, `notifications`) usan `session.user.organizationId` directo en vez de `resolveOrgId()`, por lo que **fallan-cerrado** cuando un SUPER_ADMIN impersona (no escriben; devuelven error genérico). Raíz: **no existe un helper `requireOrgMember()`** (solo `requireSuperAdmin`/`requireSetter`), así que cada acción re-implementa el chequeo a mano. Ver §5B/§5C.

4. **El guard de borde real es `src/proxy.ts`** (Next 16 renombró `middleware` → `proxy`). Gatea `/dashboard/*` a `role === ORG_MEMBER` (o `SUPER_ADMIN` impersonando). **Discrepancia doc-vs-código:** CLAUDE.md dice que `CLIENT` accede a `/dashboard`, pero el proxy **bloquea** a `CLIENT`. En la práctica los clientes se crean como `ORG_MEMBER`, así que no rompe en runtime — pero hay que decidir si `CLIENT` es enum legacy a borrar. Ver §5C / §7.

5. **Baseline TypeScript: VERDE** (`tsc --noEmit` exit 0; el dashboard no aporta errores propios). Ver §6.

6. **Deudas concretas a heredar/cerrar:** (a) `cuenta/boveda` tiene el "Registro de Integridad y Accesos" **hardcodeado** (`ACTIVITY_LOG` const), no es activity log real; (b) `/dashboard/leads` es ruta **huérfana** que duplica `/dashboard/chatbot/leads`; (c) violaciones de `router.push()` directo en `modules/email-marketing`, `NewTicketModal`, `NotificationCenter` (aunque el admin **también** las tiene: la regla `triggerTransition` está rota pareja en ambas zonas). Ver §5A, §3, §7.

---

## 1. Estructura real del portal cliente (`/dashboard`)

App root: `C:/PorfolioDevelOP/logic-core-v3`. Todas las rutas viven en `src/app/(protected)/dashboard/`. Auth se hace en cada `layout.tsx`/`page.tsx` (no hay middleware): el patron es `resolveOrgId()` + `redirect('/login')`, y onboarding gate en el layout raiz. Hay **mas rutas que las 9 secciones objetivo** (modulos premium + leads legacy). Estado: **REAL** = trae datos de Prisma/integraciones con loading/empty/error; **SHELL** = estructura UI con datos demo/hardcodeados; **VACIO** = no existe.

### Infraestructura (no es una de las 9)

| Ruta URL | Archivo principal | Que renderiza | Seccion objetivo | Estado |
|---|---|---|---|---|
| `/dashboard` (layout) | `layout.tsx` → `DashboardLayoutClient` | Chrome cliente: sidebar, banners (Subscription/Impersonation), onboarding gate, badges (unread/hot leads), modulos activos | Infra | REAL |
| `/dashboard` (loading/error) | `loading.tsx`, `error.tsx` | Skeleton + error boundary del grupo | Infra | REAL |
| `_actions/regenerate-brief.ts` | server action | Regenera brief IA del home (Zod + auth + revalidate) | Infra | REAL |

### Las 9 secciones objetivo

| Ruta URL | Archivo principal | Que renderiza | Seccion objetivo | Estado |
|---|---|---|---|---|
| `/dashboard` | `page.tsx` | **Inicio**: saludo + fecha, OnboardingStatusCard, HealthScore, AttentionStack, WeekResultsGrid, UsageMeter, AIExecutiveBrief (Suspense por bloque, cada uno con su empty/skeleton) | **Inicio** | REAL |
| `/dashboard/project` | `project/page.tsx` (+`loading.tsx`) | **Mi proyecto**: proyecto IN_PROGRESS, barra de progreso animada, ProjectTaskTabs (TODO/IN_PROGRESS/DONE + aprobaciones). Empty state "proyecto en preparacion" | **Mi proyecto** | REAL |
| `/dashboard/resultados` | `resultados/page.tsx` | Redirect → `/dashboard/resultados/trafico` | **Resultados** | REAL (redirect) |
| `/dashboard/resultados` (layout) | `resultados/layout.tsx` | PageHeader + `ResultadosTabs` (chrome de las 4 sub-tabs) | **Resultados** | REAL |
| `/dashboard/resultados/trafico` | `resultados/trafico/page.tsx` (+`loading.tsx`) | GA4 analytics: 4 metric cards, SessionsChart, top pages, PageSpeed, insights IA. Empty state "activar" + `?demo=true` con mock | **Resultados** | REAL (con demo mock fallback) |
| `/dashboard/resultados/seo` | `resultados/seo/page.tsx` (+`loading.tsx`) | Search Console: clicks/impr/CTR/pos, chart, top queries/pages, oportunidades, insights IA. Empty + demo | **Resultados** | REAL (con demo mock fallback) |
| `/dashboard/resultados/reputacion` | `resultados/reputacion/page.tsx` (+`loading.tsx`) | Google Business Profile (`GBPMetricsCard`). Empty state "pendiente de conexion" | **Resultados** | REAL (empty si GBP no conectado) |
| `/dashboard/resultados/analisis` | `resultados/analisis/page.tsx` (+`loading.tsx`) | Analisis mensual IA (descubrimientos, tendencia, categorias) del chatbot. Gate de plan `insight` → teaser en Starter; NoBotState si no hay bot | **Resultados** | REAL (gateado por plan + bot) |
| `/dashboard/services` | `services/page.tsx` (+`loading.tsx`) | **Mi servicio**: ServiceCards (WEB_DEV/AI/AUTOMATION/SOFTWARE) + catalogo PremiumModule (activos / coming soon). Empty si sin servicios | **Mi servicio** | REAL |
| `/dashboard/plan` | `plan/page.tsx` (+`loading.tsx`) | **Mi plan**: UsageMeter (consumo) + PlansShowcase (planes). Suspense por bloque | **Mi plan** | REAL |
| `/dashboard/chatbot` (layout) | `chatbot/layout.tsx` | PageHeader con nombre del bot + `ClientDashboardTabs` (Overview/Conversaciones/Leads/Knowledge/Settings/Install). Redirect a `/dashboard` si no hay sesion chatbot | **Mi chatbot** | REAL |
| `/dashboard/chatbot` | `chatbot/page.tsx` (+`loading.tsx`, `error.tsx`) | Overview del bot (usage, leads recientes, handoffs). Si no hay bot → `ChatbotUpsellLanding` | **Mi chatbot** | REAL (upsell si sin bot) |
| `/dashboard/chatbot/conversations` | `chatbot/conversations/page.tsx` (+`loading.tsx`) | `ConversationsTable` (hasta 100 conversaciones) | **Mi chatbot** | REAL |
| `/dashboard/chatbot/knowledge` | `chatbot/knowledge/page.tsx` (+`loading.tsx`) | `ClientKnowledgeView` (KnowledgeBase del bot) | **Mi chatbot** | REAL |
| `/dashboard/chatbot/leads` | `chatbot/leads/page.tsx` (+`loading.tsx`) | `ClientLeadsTable`: leads con scoring efectivo (decay), filtros status/range/DQ, gate `leadScoring` por plan | **Mi chatbot** | REAL |
| `/dashboard/chatbot/leads/[id]` | `chatbot/leads/[id]/page.tsx` (+`loading.tsx`) | `LeadDetail`: detalle del lead + mensajes de conversacion origen, anti-IDOR por orgId | **Mi chatbot** | REAL |
| `/dashboard/chatbot/settings` | `chatbot/settings/page.tsx` (+`loading.tsx`) | `BotPersonalization` (color/avatar/welcome/quick replies) + `CrmStatusIndicator` read-only. Empty si sin bot | **Mi chatbot** | REAL |
| `/dashboard/chatbot/install` | `chatbot/install/page.tsx` → `ClientInstallView.tsx` (+`loading.tsx`) | Vista de instalacion del widget (slug, snippet, dominios permitidos) | **Mi chatbot** | REAL |
| `/dashboard/messages` | `messages/page.tsx` (+`loading.tsx`) | **Mensajes**: `MessageThread` (chat directo con develOP). Marca leidos al entrar. Acepta `?context=` | **Mensajes** | REAL |
| `/dashboard/soporte` | `soporte/page.tsx` (+`loading.tsx`) | **Soporte**: StatCards (tickets abiertos/SLA/equipo) + `NewTicketModal` + `SoporteTabsClient` (activos/resueltos) | **Soporte** | REAL (SLA "< 4h" hardcodeado) |
| `/dashboard/soporte/[ticketId]` | `soporte/[ticketId]/page.tsx` (+`loading.tsx`) | Detalle de ticket: chat con burbujas, timeline derivado, reply form, resolver. Selector de status solo SUPER_ADMIN | **Soporte** | REAL |
| `/dashboard/cuenta` | `cuenta/page.tsx` | Redirect → `/dashboard/cuenta/perfil` | **Mi cuenta** | REAL (redirect) |
| `/dashboard/cuenta` (layout) | `cuenta/layout.tsx` | PageHeader + `CuentaTabs` (Perfil/Facturacion/Boveda) | **Mi cuenta** | REAL |
| `/dashboard/cuenta/perfil` | `cuenta/perfil/page.tsx` (+`loading.tsx`) | Perfil: datos empresa/contacto, password, prefs notif, info plan, danger zone. Modo impersonado read-only | **Mi cuenta** | REAL |
| `/dashboard/cuenta/facturacion` | `cuenta/facturacion/page.tsx` (+`loading.tsx`) | Facturacion: CurrentPlanCard + historial de invoices (descarga PDF / pagar) + info de facturacion. Empty si sin facturas | **Mi cuenta** | REAL |
| `/dashboard/cuenta/boveda` | `cuenta/boveda/page.tsx` (+`loading.tsx`) | Boveda de assets (`ClientAsset`): grid por tipo, reveal de accesos. **PERO** el "Registro de Integridad y Accesos" (activity log) es **hardcodeado** (`ACTIVITY_LOG` const, lineas 98-103) | **Mi cuenta** | REAL grid + **SHELL** activity log |

### Extras — fuera de las 9 (modulos premium + leads legacy)

| Ruta URL | Archivo principal | Que renderiza | Categoria | Estado |
|---|---|---|---|---|
| `/dashboard/leads` | `leads/page.tsx` (+`loading.tsx`) | `LeadsTable` legacy (otro componente: `components/dashboards/LeadsTable`, query `listLeadsForBot`). **Duplica** la funcion de `/dashboard/chatbot/leads`; no esta en el sidebar | Extra / legacy | REAL (probablemente huerfana — sin link en SidebarNav) |
| `/dashboard/modules` (loading/error) | `modules/loading.tsx`, `modules/error.tsx` | Boundaries del grupo modules (no hay `modules/page.tsx`) | Extra / infra | REAL |
| `/dashboard/modules/email-marketing` | `modules/email-marketing/page.tsx` | Redirect → `…/campaigns` | Extra (premium) | REAL (redirect) |
| `/dashboard/modules/email-marketing` (layout) | `modules/email-marketing/layout.tsx` | Gate `isModuleActive('email-marketing')` → redirect si inactivo; PageHeader + tabs Campañas/Contactos | Extra (premium) | REAL |
| `/dashboard/modules/email-marketing/campaigns` | `campaigns/page.tsx` (+`loading.tsx`) | Lista de `EmailCampaign` con stats (abiertos/clicks/bajas). Empty state. `_actions.ts` (create/send) | Extra (premium) | REAL |
| `/dashboard/modules/email-marketing/campaigns/new` | `campaigns/new/page.tsx` (+`…/[id]/loading.tsx`) | Form client de nueva campaña (guardar/enviar). **Usa `router.push()` directo** (viola regla CLAUDE.md) | Extra (premium) | REAL |
| `/dashboard/modules/email-marketing/campaigns/[id]/send` | `campaigns/[id]/send/page.tsx` | Confirmacion de envio de campaña | Extra (premium) | REAL |
| `/dashboard/modules/email-marketing/contactos` | `contactos/page.tsx` (+`loading.tsx`) + `_components/ImportCSVButton.tsx` | Stats (total/suscriptos/bajas) + tabla `EmailContact` + import CSV. Empty state | Extra (premium) | REAL |
| `/dashboard/modules/motor-resenas` | `motor-resenas/page.tsx` (+`loading.tsx`) + `_components/{ReviewItem,AskReviewSection}` | Gate `isModuleActive`; reseñas GBP (sin/con responder) + pedir reseña. Empty si GBP no conectado | Extra (premium) | REAL (empty si GBP off) |
| `/dashboard/modules/tienda-conectada` | `tienda-conectada/page.tsx` (+`loading.tsx`) + `_components/ConnectStoreCard` | Gate; resumen Tiendanube (ventas/stock/carritos/top products). `ConnectStoreCard` si no conectada | Extra (premium) | REAL (connect-flow si no conectada) |
| `/dashboard/modules/agenda-inteligente` | `agenda-inteligente/page.tsx` (+`loading.tsx`) | Gate; resumen Cal.com (turnos semana/mes/cancelados + embed iframe). `ConnectAgendaCard` si no conectada. **`CopyLinkButton` es un hack** (`<a download>` en vez de copy real, comentado en el codigo) | Extra (premium) | REAL (copy-link degradado) |

### API route handlers (`src/app/api/dashboard/*`)

| Ruta URL | Archivo | Que hace | Estado |
|---|---|---|---|
| `GET /api/dashboard/leads/recent` | `api/dashboard/leads/recent/route.ts` | Devuelve ultimos 50 leads del bot (excluye DQ), con scoring efectivo (decay). Auth + orgId | REAL |
| `GET /api/dashboard/chatbot/leads/export` | `api/dashboard/chatbot/leads/export/route.ts` | Exporta CSV de leads respetando filtros, multi-tenant, audit-log `LEADS_EXPORTED`, gate `leadScoring` para columna de clasificacion | REAL |

### Las 9 secciones: cobertura
Las 9 existen con ruta y contenido real. **Ninguna falta.** Mapeo de label de sidebar → ruta: Inicio=`/dashboard`, Mi proyecto=`/dashboard/project`, Resultados=`/dashboard/resultados`, Mis servicios=`/dashboard/services`, Mi plan=`/dashboard/plan`, Mi Chatbot=`/dashboard/chatbot`, Mensajes=`/dashboard/messages`, Soporte=`/dashboard/soporte`, Mi cuenta=`/dashboard/cuenta`. (Nota: "Mi servicio" objetivo = ruta `/dashboard/services` con label "Mis servicios"; "Mi plan" tiene su propia seccion separada de servicios.)

---

## 2. Acoplamiento entre secciones del portal cliente

Mapa basado en grep de imports reales sobre `C:/PorfolioDevelOP/logic-core-v3/src/app/(protected)/dashboard/**` (las 9 secciones canonicas + rutas EXTRA `leads` legacy y `modules/*` premium). Convencion de columnas:

- **Exclusivos**: archivo importado solo desde esa seccion.
- **Compartido cliente**: mismo archivo importado desde 2+ secciones del dashboard (acoplamiento real entre secciones cliente, NO infra generica).
- **Compartido admin**: mismo archivo importado tanto desde `/dashboard/*` como desde `/admin/*` (acoplamiento cross-rol).
- **Infra compartida**: `src/lib/*`, `src/components/ui/*`, `src/hooks/*` y el modulo `@/modules/chatbot` usado de forma transversal.

> Nota de carpetas (trampa real): existen DOS carpetas con nombre casi igual.
> - `src/components/dashboard/` (singular) = componentes del portal CLIENTE.
> - `src/modules/chatbot/components/dashboards/` (plural, dentro del modulo chatbot) = tablas COMPARTIDAS admin+cliente (`ConversationsTable`, `LeadsTable`).
> - `src/modules/chatbot/components/dashboard/` (singular, dentro del modulo) = vistas SOLO cliente del chatbot (`LeadDetail`, `ClientLeadsTable`, `BotPersonalization`, etc.).

### Tabla de acoplamiento

| Seccion | Exclusivos (solo esta seccion) | Compartido con otra seccion CLIENTE | Compartido con ADMIN | Infra compartida (lib / ui / modules) |
|---|---|---|---|---|
| **Inicio** (`page.tsx`) | `components/dashboard/home/AIExecutiveBriefV2.tsx`, `home/AttentionStack.tsx`, `home/HealthScore.tsx`, `home/WeekResultsGrid.tsx`, `components/dashboard/OnboardingStatusCard.tsx`, `_actions/regenerate-brief.ts`, `lib/dashboard/attention.ts`, `lib/dashboard/week-results.ts`, `lib/ai/executive-brief.ts`, `lib/health-score.ts` | `components/dashboard/plan/UsageMeter.tsx` (con **Mi plan**); `lib/plan/get-org-usage.ts` (con **Mi plan**) | — | `lib/preview`, `lib/prisma`, `lib/plan/*`, `components/ui` (Badge/Card/PageHeader/LoadingState) |
| **Mi proyecto** (`project/`) | `components/dashboard/ProjectTaskTabs.tsx`, `AnimatedCounter.tsx`, `AnimatedProgressBar.tsx` | `components/dashboard/FadeIn.tsx` (transversal) | — | `lib/preview`, `lib/prisma`, `components/ui` (EmptyState/PageHeader) |
| **Resultados** (`resultados/` + trafico/seo/reputacion/analisis) | `components/dashboard/ResultadosTabs.tsx`, `SessionsChart.tsx`, `ClicksImpressionsChart.tsx`, `AnalyticsAlertas.tsx`, `AnalyticsMetricCard.tsx`, `AnalyticsSkeleton.tsx`, `SeoAlertas.tsx`, `OportunidadesSEO.tsx`, `TrendBadge.tsx`, `results/GBPMetricsCard.tsx`, `results/PageSpeedCard.tsx`, `results/analysis/*` (4 comp), `lib/integrations/google-business-profile`, `lib/searchconsole`, `lib/integrations/pagespeed`, `lib/analytics`, `lib/ai/results-insights` | `components/dashboard/PreviewBanner.tsx` (con **Mi chatbot**); `results/InsightsBlock.tsx` (trafico+seo, intra-seccion); `lib/actions/upsell.ts` → `requestUpsellAction` (con **Mi servicio** y **Mi plan**); `lib/plan/get-plan-for-org.ts` + `plan-allows.ts` (gate `insight`, con **Mi chatbot**); `@/modules/chatbot/index.server` → `getMonthlyAnalysisForOrg` (con **Mi chatbot**) | — | `lib/preview`, `lib/prisma`, `components/ui`, `FadeIn` |
| **Mi servicio** (`services/`) | `components/dashboard/PremiumModuleCard.tsx` | `components/dashboard/StaggerWrapper.tsx` (con **Mi cuenta/boveda**); `FadeIn`; `lib/actions/upsell.ts` (via PremiumModuleCard, con **Resultados**/**Mi plan**) | — | `lib/preview`, `lib/prisma`, `lib/premium-modules`/`lib/data/premium-modules`, `components/ui` |
| **Mi plan** (`plan/`) | `components/dashboard/plan/PlansShowcase.tsx`, `plan/UpgradeCtaButton.tsx` | `components/dashboard/plan/UsageMeter.tsx` (con **Inicio**); `lib/plan/get-org-usage.ts` (con **Inicio**); `lib/actions/upsell.ts` via UpgradeCtaButton (con **Servicio**/**Resultados**) | — | `lib/preview`, `lib/prisma`, `lib/plan/*`, `components/ui` |
| **Mi chatbot** (`chatbot/` + 6 subrutas) | `@/modules/chatbot/components/dashboard/*` (`ClientDashboardTabs`, `ClientKnowledgeView`, `ClientLeadsTable`, `LeadDetail`, `BotPersonalization`, `CrmStatusIndicator`), `chatbot/install/ClientInstallView.tsx`, `@/modules/chatbot/components/installation`, `chatbot/error.tsx` | `components/dashboard/PreviewBanner.tsx` (con **Resultados**); `lib/plan/get-plan-for-org`+`plan-allows` (gate `leadScoring`, con **Resultados** y `layout` raiz) | `@/modules/chatbot/index.server` (`getClientChatbotSession`, `listConversationsByOrgSlug`, `countHotNewLeadsForOrg`), `@/modules/chatbot/server/scoring`, `@/modules/chatbot/components/dashboards/ConversationsTable` (← tb. `admin/chatbots/[botId]/tabs/ConversationsTab.tsx`) | `lib/preview`, `lib/prisma`, `components/ui`, todo el modulo `@/modules/chatbot` |
| **Mensajes** (`messages/`) | `components/dashboard/MessageThread.tsx` (y su unico consumidor de `lib/data/message-context.ts`), `lib/actions/messages.ts` | `FadeIn` | — | `lib/preview`, `lib/prisma`, `components/ui` (PageHeader) |
| **Soporte** (`soporte/` + `[ticketId]`) | `components/dashboard/SoporteTabsClient.tsx`, `NewTicketModal.tsx`, `TicketReplyForm.tsx`, `TicketStatusSelector.tsx`, `ResolveTicketButton.tsx`, `AnimatedChatBubble.tsx`, `lib/actions/tickets.ts` | — | — | `lib/preview`, `lib/prisma`, `components/ui` (PageHeader/StatCard) |
| **Mi cuenta** (`cuenta/` + perfil/facturacion/boveda) | `components/dashboard/CuentaTabs.tsx`, `ProfileForms.tsx`, `CurrentPlanCard.tsx`, `VaultRevealButton.tsx`, `VaultRequestModal.tsx`, `lib/actions/profile.ts`, `lib/billing/get-current-plan` | `components/dashboard/StaggerWrapper.tsx` (boveda, con **Mi servicio**); `FadeIn` | — | `lib/preview`, `lib/prisma`, `components/ui` |
| **(EXTRA) `leads` legacy** (`leads/`) | — (la pagina entera es huerfana, sin link en sidebar) | duplica funcionalidad de **Mi chatbot › leads** pero NO comparte componentes con la version viva | `@/modules/chatbot/server/admin/getClientSession`, `@/modules/chatbot/server/admin/queries` (`listLeadsForBot`), `@/modules/chatbot/components/dashboards/LeadsTable` (← tb. `admin/chatbots/[botId]/tabs/LeadsTab.tsx`) | `components/ui` (PageHeader), `lib/prisma` |
| **(EXTRA) `modules/*` premium** (email-marketing, motor-resenas, tienda-conectada, agenda-inteligente) | `components/dashboard/modules/motor-resenas/_actions.ts`, `modules/email-marketing/_actions.ts`, `_components/*` por modulo (ImportCSVButton, ReviewItem, AskReviewSection, ConnectStoreCard), `lib/integrations/{brevo,tiendanube,cal-com}` | `lib/modules/check-activation.ts` → `isModuleActive` (compartido por los 4 modulos premium entre si) | — | `lib/preview`, `lib/prisma`, `components/ui` (EmptyState/PageHeader) |

**Chrome / layout raiz** (`dashboard/layout.tsx`, transversal a TODAS las secciones, no es una "seccion"): `components/dashboard/DashboardLayoutClient.tsx` (que a su vez monta `SidebarNav.tsx`, `PageTransition.tsx`, `NotificationCenter.tsx`, `components/layout/VersionBadge.tsx`, `actions/auth-actions`), `ImpersonationBanner.tsx` (monta `ImpersonationTimer.tsx`), `SubscriptionBanner.tsx`, mas `lib/plan/get-plan-for-org`+`plan-allows`, `@/modules/chatbot/index.server` (`countHotNewLeadsForOrg`), `lib/auth-guards`, `lib/preview`.

### Infra verdaderamente transversal (no es de ninguna seccion)

- `@/lib/preview` — importado por **24 de 25** archivos de seccion (gate read-only en impersonacion/preview). Es el acoplamiento mas amplio del portal pero es infra pura: tocarlo afecta todo, ningun lane lo "posee".
- `@/lib/prisma` (20 archivos), `@/components/ui/*` (Button/Card/Badge/Field/Input/Select/Modal/PageHeader/EmptyState/ErrorState/LoadingState/StatCard/Tabs/SectionErrorBoundary) — base de TODAS las secciones.
- `@/lib/plan/*` (get-plan-for-org, plan-allows, get-org-usage, billing/get-current-plan) — gating de plan repartido en Inicio, Plan, Resultados-analisis y todo Mi chatbot + layout raiz.
- `@/lib/actions/upsell.ts` (`requestUpsellAction`) — cruza **Resultados-SEO**, **Mi servicio** (PremiumModuleCard) y **Mi plan** (UpgradeCtaButton).

### Lanes aisladas vs lanes que DEBEN fusionarse

**Pueden ir en lanes AISLADAS** (no comparten archivos PROPIOS con otra seccion; solo tocan infra estable ui/prisma/preview que cualquier lane consume read-only):

- **Soporte** — la mas limpia: 7 componentes exclusivos + `lib/actions/tickets.ts`, cero solapamiento con otras secciones cliente. Lane segura.
- **Mensajes** — `MessageThread.tsx` + `lib/actions/messages.ts` + `lib/data/message-context.ts` son exclusivos (MessageThread es el unico consumidor de message-context). Solo comparte `FadeIn`. Lane segura.
- **Mi proyecto** — todo exclusivo salvo `FadeIn`. Lane segura.
- **modules/* premium** — autocontenidos por `_actions`/`_components` y `lib/integrations/*` propios; entre ellos comparten `isModuleActive`, asi que pueden ser UNA lane "modulos premium", pero esa lane esta aislada del resto de las 9 secciones.

**DEBEN fusionarse / coordinarse en una misma lane** por compartir archivos PROPIOS (no infra):

1. **Inicio + Mi plan** — comparten `components/dashboard/plan/UsageMeter.tsx` y `lib/plan/get-org-usage.ts` (ambos archivos propios del dominio plan, no UI generica). Editar UsageMeter o el snapshot de uso impacta las dos. Fusionar en lane "plan/uso".
2. **Mi servicio + Mi plan + Resultados-SEO** — atadas por `lib/actions/upsell.ts` (`requestUpsellAction`): lo invocan `PremiumModuleCard` (servicios), `UpgradeCtaButton` (plan) y `resultados/seo/page.tsx`. Un cambio de firma en la action rompe las tres. La cadena Plan↔Servicio↔Resultados es el cluster mas acoplado del portal.
3. **Mi chatbot + (legacy) leads** — ambas dependen del modulo `@/modules/chatbot`; ademas `leads` legacy usa `LeadsTable` (carpeta `dashboards/` plural) que tambien usa el ADMIN. Cualquier toque al modulo chatbot o a esas tablas debe coordinarse con admin, no solo entre secciones cliente. **Recomendacion**: la `leads` legacy es huerfana (sin sidebar, duplica chatbot/leads) → candidata a borrado en vez de mantenerla en una lane.
4. **Mi chatbot + Resultados-analisis** — `resultados/analisis/page.tsx` consume `getMonthlyAnalysisForOrg` de `@/modules/chatbot/index.server` y comparte el gate de plan. La sub-pestana de analisis de Resultados es realmente codigo del dominio chatbot embebido en Resultados → deben ir en la misma lane que Mi chatbot, o al menos el editor de Mi chatbot debe saber que `resultados/analisis` lo consume.
5. **Mi cuenta(boveda) + Mi servicio** — comparten `StaggerWrapper.tsx`. Acoplamiento leve (componente de animacion casi-infra), pero es un archivo de `components/dashboard/` no de `ui/`; si se refactoriza StaggerWrapper, ambas se ven afectadas.

**Acoplamiento cross-ADMIN a vigilar** (no son lanes cliente puras): `@/modules/chatbot/components/dashboards/ConversationsTable.tsx` y `LeadsTable.tsx` los importan tanto el cliente (`chatbot/conversations`, `leads` legacy) como el admin (`admin/chatbots/[botId]/tabs/`). Igual `@/modules/chatbot/server/admin/queries` y `getClientSession`. Toda lane que toque Mi chatbot es de facto una lane admin+cliente.

---

## 3. Qué comparte / hereda cada sección del cliente con el admin

Análisis por pares cliente ↔ admin. Para cada uno: **qué comparten HOY** (mismo archivo), **qué debería heredar** del admin (correcciones ya hechas allá, ref. changelog), **qué falta**. Convención de estados de sharing:
- 🟢 **SHARED** = consumen el mismo archivo/módulo.
- 🟡 **PARALELO** = archivos distintos que hacen lo mismo (riesgo de desincronización).
- 🔴 **HUÉRFANO** = el cliente tiene su propia versión sin contraparte / sin relación real con el admin.

---

### 3.1 Mensajes — `dashboard/messages` ↔ `/admin/messages` — 🟡 PARALELO (action shared, UI diverge)

**Qué comparten HOY:**
- **Server actions co-ubicadas** en `src/lib/actions/messages.ts`: `sendClientMessageAction` (cliente) y `sendMessageAction` (admin) viven en el mismo archivo y comparten `SendMessageSchema` + tipo `ActionResult` (`src/lib/actions/schemas.ts`). El `markAdminMessagesAsReadAction` también vive ahí. El modelo `Message` es el mismo (org-scoped por `organizationId`).
- Revalidación cruzada: cuando el cliente manda mensaje, revalida `/admin/messages` y crea `Notification` + `AgencyAlert` al SUPER_ADMIN (`messages.ts:142-197`).

**Qué NO comparten (UI 100% paralela):**
- Cliente: `src/components/dashboard/MessageThread.tsx` (323 líneas, un solo componente monolítico: header de estado, lista, input con quick-replies, auto-scroll vía `bottomRef.scrollIntoView`).
- Admin: árbol completo en `admin/messages/_components/` — `message-thread.tsx`, `message-bubble.tsx`, `message-input.tsx`, `conversation-list.tsx`, `messages-inbox-shell.tsx`, `emoji-popover.tsx`, `MessagesScrollAnchor`. Inbox master-detail (lista de orgs + thread), no monolito.

**Qué debería heredar el cliente (del changelog Operaciones/Clientes §2 — lane messages):**
- **Auto-expand del textarea con tope de filas** (admin `message-input.tsx:25-35`): el textarea del cliente (`MessageThread.tsx:282`) usa `max-h-32 min-h-[44px]` por CSS pero sin la lógica de auto-resize que el admin sí tiene.
- **Guard de composición IME / dead-keys** (admin `message-input.tsx:63`: `!event.nativeEvent.isComposing`). El cliente (`MessageThread.tsx:290-295`) envía con Enter SIN chequear `isComposing` → un cliente que escribe con acentos del teclado español puede disparar el envío al confirmar la composición. **Bug latente heredable directo.**
- **Emoji picker** (`EmojiPopover` / `EmojiPickerPanel`, changelog Chatbot §3): el admin tiene picker tipo WhatsApp; el cliente no tiene emoji picker en mensajes.

**Qué falta:**
- El cliente NO tiene scroll-anchor dedicado (usa `scrollIntoView` directo); el admin extrajo `MessagesScrollAnchor` reutilizable.
- Consolidación: el código del thread está duplicado conceptualmente; un `MessageBubble` compartido en `components/ui` o `modules/messaging` evitaría que un fix (ej. IME) tenga que aplicarse dos veces.

---

### 3.2 Mi chatbot — `dashboard/chatbot/*` ↔ `/admin/chatbots` — 🟢 SHARED (mejor caso del repo)

**Qué comparten HOY (el módulo `src/modules/chatbot/` es infra compartida real):**
- **Tablas de datos idénticas:**
  - `ConversationsTable` (`modules/chatbot/components/dashboards/ConversationsTable.tsx`): cliente la monta en `dashboard/chatbot/conversations/page.tsx:13`; admin en `admin/chatbots/[botId]/tabs/ConversationsTab.tsx:14` (con prop `expandable` + `fetchTranscript`). MISMO componente.
  - `LeadsTable` (`modules/chatbot/components/dashboards/LeadsTable.tsx`): admin la usa en `LeadsTab.tsx:3` (con `renderRowAction` para convertir). El cliente usa el wrapper `ClientLeadsTable` (`components/dashboard/ClientLeadsTable.tsx`) — variante distinta con scoring/filtros/gate de plan.
- **Server layer compartido:** ambos leen de `modules/chatbot/index.server` (`listConversationsByOrgSlug`, `listLeadsForDashboard`) y `modules/chatbot/server/scoring`. La sesión del cliente pasa por `getClientChatbotSession()` (anti-IDOR).
- **Editor vs viewer espejados:**
  - Knowledge: admin monta `KnowledgeBaseEditor` (`modules/chatbot/components/admin/`) en `KnowledgeTab.tsx:3`; cliente monta `ClientKnowledgeView` (read-only, mismo modelo `KnowledgeBase`) en `dashboard/chatbot/knowledge/page.tsx`. Diseño deliberado: cliente VE, admin EDITA.
  - Settings: cliente edita un subconjunto vía `BotPersonalization.tsx` (`accentColor`, `position`, `avatarStyle`, `welcomeMessage`, `quickReplies` — ver `BotPersonalization.tsx:34-58`) con `updateBotAppearance`; admin edita todo en `ConfigTab.tsx`. Ambos comparten `BotConfigPreview` (`modules/chatbot/components/preview`) y `AvatarPicker`.

**Qué debería heredar el cliente (changelog Chatbot rdc.md):**
- **§4 Paridad config↔widget — accent colors:** el cliente edita `accentColor`/`accentSecondary` en `BotPersonalization`. El changelog deja FICHADO que **botón enviar, `Sparkles` del empty-state y `thinkPulse` siguen en cyan hardcodeado** en el widget runtime → lo que el cliente configura no se aplica del todo. Aplica a la experiencia que el cliente paga.
- **§7 Industria/Tono:** el Select de industria del admin se recortó al vocabulario canónico; el `BotPersonalization` del cliente no expone industria (correcto), pero si se expusiera debe usar `INDUSTRIES_LABELS`, no el vocab viejo.
- **§1 trap de `backdrop-filter` / portal de modales:** ya resuelto centralizadamente en `AdminLayoutClient`. El layout del cliente (`DashboardLayoutClient`) debe verificarse contra el mismo trap si monta modales (memoria `admin-fixed-backdrop-trap`).

**Qué falta:**
- El `BotPersonalization` (settings cliente) NO tiene el emoji picker WhatsApp del admin (§3) — el campo emoji del avatar es el mismo problema de "Input de texto imposible en PC" que el admin ya resolvió.
- El gate offline del widget (§6, `degraded`) es del widget runtime, no de estas pantallas, pero es la misma org/bot — coherencia de estado.

---

### 3.3 Soporte — `dashboard/soporte` ↔ `/admin/tickets` — 🟡 PARALELO (TRES sets de actions, UI diverge)

**Qué comparten HOY:**
- Mismo modelo `Ticket` + `TicketMessage` (org-scoped). Mismos schemas Zod base (`TicketReplySchema`, `CreateTicketSchema` en `src/lib/actions/schemas.ts`).
- Revalidación cruzada: las tres familias de actions revalidan tanto `/dashboard/soporte/*` como `/admin/tickets/*`.

**Qué NO comparten — fragmentación de actions (3 archivos con lógica solapada):**
1. `src/actions/ticket-actions.ts` → flujo cliente: `createTicketAction`, `replyTicketAction` (con guard anti-IDOR `assertTicketBelongsToOrg`, comentario B11.2), `resolveTicketClientAction`, `updateTicketStatusDashboardAction`.
2. `src/lib/actions/tickets.ts` → flujo admin "viejo" (FormData): `replyToTicketAction`, `updateTicketStatusAction`, `markTicketResolvedAction` — todos `requireSuperAdmin` inline.
3. `admin/tickets/_actions/ticket.actions.ts` → flujo admin "nuevo" (typed, `ok`/`fail`, `requireSuperAdmin()`): `listTickets`, `getTicketById`, `replyToTicket`, `updateTicketStatus`. **Es el que la UI admin actual usa** (`admin/tickets/[ticketId]/page.tsx:3`).
- UI: cliente usa `src/components/dashboard/` (`TicketReplyForm`, `ResolveTicketButton`, `TicketStatusSelector`, `AnimatedChatBubble`, `NewTicketModal`) con bubbles INLINE en `dashboard/soporte/[ticketId]/page.tsx` (348 líneas + timeline sidebar). Admin usa `admin/tickets/_components/ticket-chat.tsx` + `ticket-reply-form.tsx`.

**Qué debería heredar el cliente (changelog Chatbot §2 + memoria `ticket-status-select-shared-migration`):**
- **`ticket-chat.tsx` (admin) YA migró el status select** al `<Select>` compartido con spinner adyacente + disabled (memoria supersede la lección de CLAUDE.md). El `TicketStatusSelector.tsx` del **dashboard** (cliente, solo visible a SUPER_ADMIN impersonando) **sigue nativo** — heredar la migración o dejar nativo conscientemente.
- **Select compartido** (changelog Chatbot §2): listbox custom con estética develOP, `color-scheme:dark`, portal a body. El cliente debería usar el mismo `<Select>` en sus selectores.

**Qué falta / riesgo:**
- **Drift de lógica de negocio entre los 3 archivos:** ej. al responder, el cliente pone status `OPEN` y el admin `IN_PROGRESS`; `replyToTicket` (admin nuevo, archivo 3) **NO** cambia status, mientras `replyToTicketAction` (archivo 1) y el viejo (archivo 2) SÍ. Un cambio de regla SLA exige tocar hasta 3 archivos. Candidato a consolidar en un módulo `lib/tickets` con un solo set de actions parametrizadas por rol.
- El SLA del cliente está **hardcodeado** (`dashboard/soporte/page.tsx:78` "< 4h", "Lun-Vie 9-19hs") y no sale de `AgencySettings` (que el admin sí gestiona).

---

### 3.4 Mi plan — `dashboard/plan` ↔ pestaña plan&billing de `/admin/clients/[clientId]` — 🟢 SHARED (lib común, write vs read separados por diseño)

**Qué comparten HOY:**
- **`src/lib/plan/*` es la fuente de verdad común:** `get-plan-for-org.ts`, `plan-allows.ts` (gating), `get-org-usage.ts` (snapshot), `index.ts` (`invalidateOrgPlanCache`). Cliente (`dashboard/plan/page.tsx:7,36`) lee `getOrgUsageSnapshot`; admin (`assignPlanToOrg` en `admin/clients/_actions/plan.actions.ts:10`) escribe y llama `invalidateOrgPlanCache`. Mismo modelo `Subscription`/`Plan`/`QuotaUsage`.
- El gating `planAllows('leadScoring')` se usa idéntico en cliente (`dashboard/chatbot/leads/page.tsx:65`) y en otros gates.

**Qué NO comparten (correctamente):**
- Admin: lógica de escritura (upgrade inmediato + reset de cuota, downgrade diferido a fin de mes, billing override con audit `SUBSCRIPTION_CHANGED`) en `plan.actions.ts`.
- Cliente: capa de **presentación** read-only `src/lib/plan/plan-presentation.ts` (PLAN_PRESENTATIONS: traducción "técnico→beneficio", cero jerga) + `UsageMeter`/`PlansShowcase` (`components/dashboard/plan/`). El cliente no puede cambiar su plan, solo ver/upgradear como CTA.

**Qué debería heredar el cliente:**
- **Coherencia de catálogo** (memoria `premium-module-slug-source-of-truth` + changelog Chatbot §8 P0.4): el precio Starter se unificó a 49 y se sacó `mini-crm`. `plan-presentation.ts:149` ya tiene Starter=49 — verificar que `PLAN_PRESENTATIONS` siga alineado con `prisma/seeds/sync-plans.ts` (el propio archivo advierte "Si cambia el seed, actualizar acá": acoplamiento manual frágil).
- El admin valida `moduleKey` por slug contra la tabla `PremiumModule` (no contra el catálogo legacy). La pantalla cliente `services`/`plan` que liste módulos debe usar la misma fuente.

**Qué falta:**
- La sincronización catálogo presentación (cliente) ↔ seed de planes (admin) es **manual** — riesgo de desincronización de precios/cupos mostrados al cliente vs. los que el admin asigna.

---

### 3.5 Mi proyecto — `dashboard/project` ↔ `/admin/projects` — 🟡 PARALELO (mismo modelo, cero código compartido)

**Qué comparten HOY:**
- Solo el modelo Prisma (`Project` + `Task`, enums `ProjectStatus`/task status) y los labels de estado. Nada de código.

**Qué NO comparten:**
- Cliente: `dashboard/project/page.tsx` lee `prisma.project.findMany` directo (org-scoped), serializa tasks a mano y monta `ProjectTaskTabs` + `AnimatedProgressBar`/`AnimatedCounter` (`components/dashboard/`). Read-only, vista de UN proyecto.
- Admin: `admin/projects/**` + las server actions de `Task`/`OsTimeEntry` viven en `admin/team/_actions/*` (changelog Proyectos §intro: Proyectos y Equipo inseparables). Kanban `@dnd-kit`, CRUD completo, horas, pagos.

**Qué debería heredar el cliente (changelog Proyectos):**
- **§3 unificación interno/cliente con helper `isInternalProject`:** si el dashboard cliente alguna vez filtra/clasifica proyectos, debe usar el helper único, no `organizationId === null` (la lección "criterio duplicado = bomba de tiempo").
- **Enum casing** (PLANNING/IN_PROGRESS/REVIEW/COMPLETED mayúsculas punta a punta): el cliente ya respeta esto (`page.tsx:16`), mantenerlo.

**Qué falta:**
- El cliente tiene un `as any[]` en `dashboard/project/page.tsx:115` (con eslint-disable) — deuda de tipos local. Cero impacto cross-tenant, pero candidato a un tipo `SerializedTask` ya existente.
- No hay aprobación de tasks desde el cliente (`approvalStatus PENDING_APPROVAL` se cuenta pero el flujo de aprobar es admin-side `TaskApprovalControl`).

---

### 3.6 Resultados — `dashboard/resultados/*` ↔ `/admin/intel` (Inteligencia) — 🔴 NO es par real

**Hallazgo clave:** el admin **NO tiene** un equivalente de "Resultados del cliente". `/admin/chatbot/health` + `/admin/chatbot/activity` + `/admin/alerts` (sector Inteligencia) son **observabilidad interna de la agencia sobre el bot** (verdict de health, latencia P50/P95, stream de `ChatbotEvent`, alertas del sistema), **mono-bot** (changelog Operaciones: "Inteligencia mono-bot: scoping per-tenant archivado — 3 migraciones que no se hicieron").

**Qué comparten HOY:**
- Solo el modelo `ChatbotEvent`/`ChatbotInsight` y `src/modules/chatbot/server/scoring`. El único cruce real: `dashboard/resultados/analisis` reutiliza `ChatbotInsight` + agregados mensuales del módulo chatbot (changelog Chatbot §8 P0.2), gateado Pro+.
- Trafico/SEO/Reputacion del cliente (GA4, Search Console, GBP) **no tienen ninguna contraparte admin** — son integraciones externas read-only por org.

**Qué debería heredar:**
- Nada del admin Inteligencia es replicable al cliente (es interno de agencia). **Lo inverso** sí aplica: la deuda "Inteligencia mono-bot, per-tenant archivado" significa que el admin NO puede ver health/actividad por-cliente como el cliente ve sus propios resultados.

**Qué falta:** documentar que NO es un par; evitar asumir reutilización.

---

### 3.7 Inicio — `dashboard/page` ↔ `/admin/page` (admin dashboard) — 🟡 PARALELO conceptual (cero código compartido)

**Qué comparten HOY:**
- Solo el patrón (agregador read-only con Suspense por bloque) y modelos Prisma comunes. Cero archivos.
- Admin dashboard (changelog Admin Operaciones): agregador read-only ~833 líneas, **cero server actions**, 4 charts recharts sobre datos de TODAS las orgs.
- Cliente Inicio: greeting + HealthScore + AttentionStack + WeekResults + UsageMeter + AIBrief, scoped a la org del cliente.

**Qué debería heredar el cliente (changelog Admin Operaciones / Dashboard admin):**
- **Empty/zero states (`<ChartEmptyState>`):** "nada de gráficos vacíos sin explicación". El Inicio del cliente debe tener empty states por bloque (el WeekResults/UsageMeter sin datos).
- **A11y:** `role="img"` + `aria-label`/`summary` en charts, `aria-hidden` en íconos decorativos, jerarquía `<h4>`, `strokeWidth={1.5}` (regla CLAUDE.md).
- **Reduced-motion:** `useReducedMotion()` + `isAnimationActive={!reduced}` en charts/series (el admin lo aplicó; el cliente usa Framer reveal — verificar `motion-reduce`).
- **Hover en wrapper externo, no en la primitiva** (`<HoverCard>` envolviendo `StatCard` shared) — patrón para no tocar `StatCard`/`Stat` compartidos.
- **CSS keyframes vs `motion/react` en server components** para reveals de entrada (evita client boundary + conflicto de transform con hover).

**Qué falta:** las KPI primitivas (`StatCard`, `Stat`, `StatCard`) en `components/ui/` SÍ son compartidas cliente+admin — son el verdadero punto de herencia. Cualquier fix de a11y/typo en ellas beneficia ambos (changelog Dashboard admin §3: typo "Requiere atención" + aria-hidden de `StatCard`/`Skeleton` se cerraron en la tanda transversal, ya heredado por el cliente automáticamente).

---

### 3.8 Mi cuenta — `dashboard/cuenta/*` ↔ `/admin/settings` — 🔴 NO es par real (conceptos distintos)

**Hallazgo clave:** `dashboard/cuenta` = perfil del **usuario/org cliente** (datos de empresa, contacto, password, preferencias de notificación, plan info, danger zone) vía `components/dashboard/ProfileForms` + `src/lib/actions/profile`. `/admin/settings` = configuración de **la agencia develOP** (agencyName, webhooks de alerta, token de Telegram, module pricing, team) vía `admin/settings/_actions/settings.actions` + `AgencySettings` singleton. **No gestionan lo mismo.**

**Qué comparten HOY:**
- Modelos `User`/`Organization` (el cliente edita su `Organization`; el admin gestiona `AgencySettings`, otro modelo). Cero código compartido.
- `cuenta/perfil` tiene un modo impersonación read-only (`isAdminPreview()`, `perfil/page.tsx:119-178`) — es el único cruce admin↔cliente (SUPER_ADMIN viendo el perfil del cliente).

**Qué debería heredar el cliente (changelog Clientes §3 + memoria):**
- **`toErrorMessage` helper** (commit `5e33733`): el admin lo aplicó a `updateSettings` porque **leakeaba el ZodError crudo al cliente** — viola la regla CLAUDE.md "nunca exponer errores internos". Las actions de `src/lib/actions/profile` del cliente deben usar el mismo helper para no leakear ZodError. **Heredable directo (seguridad).**
- **Avatar emoji + imagen base64 + iniciales editables** (commit `e8c7ae0`, memoria `no-external-storage-infra`): el admin lo construyó para el cliente (`ClientAvatar`/`ClientAvatarField` en módulo chatbot, compartidos wizard+app). El `ProfilePage`/`CompanyDataForm` del cliente sigue mostrando solo `logoUrl` (URL) — heredar el patrón avatar (base64, sin S3/Blob).
- **`internalNotes`** (commit `ef97856`): es campo admin-only sobre el cliente — NO heredar al cliente (no debe verlo).

**Qué falta:**
- Confirmar que `DangerZone` del cliente (`perfil/page.tsx:314`) y el hard/soft-delete del admin (changelog Clientes §3: `TypeToConfirmDialog`, cascade opción C) usan criterios coherentes — el cliente no debería poder disparar el hard-delete con cascade que el admin gobierna.

---

### Tabla resumen — estado de sharing por par

| Par cliente ↔ admin | Estado | Comparten HOY | Mayor deuda / herencia pendiente |
|---|---|---|---|
| Mensajes ↔ /admin/messages | 🟡 PARALELO | actions (`lib/actions/messages.ts`) + `SendMessageSchema` | guard IME (bug), auto-expand, emoji picker; UI duplicada |
| Mi chatbot ↔ /admin/chatbots | 🟢 SHARED | módulo `src/modules/chatbot/*` entero (tables, server, preview) | accent no llega al widget (§4); emoji picker en settings |
| Soporte ↔ /admin/tickets | 🟡 PARALELO | modelo + schemas base; **3 archivos de actions** | consolidar 3 sets de actions; status select compartido; SLA hardcodeado |
| Mi plan ↔ admin/clients plan&billing | 🟢 SHARED | `src/lib/plan/*` (verdad común) | sync manual presentation↔seed; catálogo por slug |
| Mi proyecto ↔ /admin/projects | 🟡 PARALELO | solo modelo `Project`/`Task` | `isInternalProject` helper; `as any` local |
| Resultados ↔ Inteligencia | 🔴 NO PAR | solo `ChatbotEvent`/scoring | son conceptos distintos (interno agencia vs externo cliente) |
| Inicio ↔ admin dashboard | 🟡 PARALELO | primitivas `ui/StatCard` etc. | empty states, a11y, reduced-motion, hover-wrapper |
| Mi cuenta ↔ /admin/settings | 🔴 NO PAR | solo `User`/`Org`; impersonación read-only | `toErrorMessage` (leak ZodError, seguridad); avatar base64 |

---

## 4. Sistema de diseño: Admin vs Cliente

Comparación del chrome (shell de layout) y del sistema de diseño compartido entre el portal admin (`/admin/*`) y el portal cliente (`/dashboard/*`), enfocada en el objetivo D1: que el portal cliente se vea **estéticamente idéntico** al admin.

**Veredicto adelantado:** los dos portales **ya comparten** el mismo lenguaje visual de bajo nivel (mismos tokens de color hardcodeados, los mismos `src/components/ui/*`, el mismo `BrandMark`, el mismo pill cyan activo de sidebar con el mismo `layoutId`). La diferencia es **estructural en el chrome** (cómo se arma el shell: sidebar, header, wrapper de contenido, fondo), no en las primitivas. Alinear el cliente al admin es trabajo de **chrome/layout**, NO toca `ui/*`. `ui/*` **no es un landmine** (ver 4D).

---

### 4A. Chrome del Admin

**Cadena de montaje:**
`admin/layout.tsx` (server) → `AdminLayoutClient` → `AdminSidebar` + `AdminTopbar` + `<main>` con `PageTransition` envolviendo `{children}`.

**`AdminLayoutClient.tsx`** (`src/app/(protected)/admin/_components/AdminLayoutClient.tsx`) — qué hace:
- **Shell fijo full-viewport:** raíz `div.fixed inset-0 z-[80] bg-[#080a0c] text-zinc-100` (línea 30). El `z-[80]` espeja `zIndex.appShell` de `design-tokens.ts`.
- **Capa de fondo ambiental** (líneas 31-41): `div` absoluto `pointer-events-none` con `background` inline de **tres capas**: dos `radial-gradient` (cyan `rgba(6,182,212,0.08)` arriba-izq + emerald `rgba(16,185,129,0.05)` abajo-der) y un `linear-gradient` blanco sutil. NO usa textura de ruido.
- **Sidebar fija** (`<aside>` líneas 61-82): `fixed left-0 top-0 z-[110] h-screen w-[240px]`, con drawer mobile vía `translate-x` y botón hamburguesa `fixed left-4 top-4 z-[120]` (líneas 43-50) + scrim `z-[100]` (líneas 52-59). Los z-index (`80/100/110/120/130`) espejan la escala `appShell…appDrawerClose` de los tokens.
- **Columna de contenido** (líneas 84-109): `div.relative h-full lg:pl-[240px]` con padding `p-3 pt-16 sm:p-4 lg:pt-4`. Dentro: `<AdminTopbar />` arriba, luego la **superficie principal como card flotante** (líneas 94-102):
  - capa hermana `aria-hidden` con `rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md` (el blur va en hermana, NO en `<main>`, para no convertir `<main>` en containing block de los `position:fixed` — lección documentada en CLAUDE.md).
  - `<main className="absolute inset-0 overflow-y-auto rounded-[28px] p-4 sm:p-6">{children}`.
- **Footer** (líneas 104-107): `text-xs text-zinc-700`, "develOP Admin" + `<VersionBadge />`.

**`AdminSidebar` (`admin-sidebar.tsx`):** `div.w-[240px] border-r border-white/10 bg-white/5 backdrop-blur-xl`. Header con `<BrandMark href="/admin" tagline="Admin" />`. Nav en **4 secciones agrupadas con label** (`Operaciones / Clientes / Inteligencia / Configuración`), cada item es `<Link>` con pill activo cyan (`motion.div layoutId="sidebar-active-pill"`, `bg-cyan-500/10 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]`, spring `stiffness:380 damping:38 mass:0.9`). Estado activo = `text-cyan-400`, inactivo = `text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100`. Badges numéricos (rojo/ámbar/cyan según tipo). Footer con `userName` + `userRole` en card `bg-black/20`.

**`AdminTopbar` (`admin-topbar.tsx`):** header como **card flotante** `h-16 rounded-2xl border border-white/10 bg-white/5 px-5 backdrop-blur-xl`. Deriva breadcrumb+título del `pathname` (mapa de labels), muestra fecha en pill `rounded-full border border-white/10 bg-black/20`, y botón sign-out `rounded-xl border border-white/10 bg-black/20 hover:text-red-400 hover:bg-red-500/10`.

**`PageTransition` (admin):** `motion.div` con variantes `fadeUp`/`fadeUpTransition` de `@/lib/motion-variants`, `className="min-h-full"`, gateado por `useReducedMotion` (si reduced, devuelve children pelado). Animación de **mount** (no por ruta).

**`AdminBreadcrumbs.tsx`:** existe pero **NO se monta en el shell** (el layout usa `AdminTopbar` para el breadcrumb). Solo lo consume `admin/clients/[clientId]/_components/ClientHeader.tsx`. Es un componente lateral, no parte del chrome principal.

**`adminHoverCls` (`src/lib/hover.ts`):** clase utilitaria de hover uniforme — `hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15` + variantes `motion-reduce`. Variante `adminHoverAmplifiedCls` con `scale-[1.02]`. El docstring dice literalmente *"igual al pattern del Dashboard"* → confirma que el hover ya es **compartido en intención** entre ambos portales. Se aplica en cards/tiles de páginas admin (no en el chrome).

**Colores/CSS del chrome admin:** todo Tailwind hardcodeado sobre dark — `bg-[#080a0c]` (raíz), `bg-white/5` + `backdrop-blur-xl` (sidebar/topbar, glass), `border-white/10`, `text-zinc-100/400/500/700`, accent cyan `#06b6d4`/`cyan-400`. Sin CSS variables custom; los gradientes ambientales van inline en `style`.

---

### 4B. Chrome del Cliente

**Cadena de montaje:**
`dashboard/layout.tsx` (server) → `DashboardLayoutClient` → `SidebarNav` + `<header>` inline + `<main>` con `PageTransition`. Banners (`SubscriptionBanner`, `ImpersonationBanner`) se inyectan como prop `banners`.

**¿Tiene sidebar?** Sí. **¿Header?** Sí. Es un chrome **completo y paralelo**, no comparte el shell del admin.

**`DashboardLayoutClient.tsx`** (`src/components/dashboard/DashboardLayoutClient.tsx`) — qué hace:
- **Shell flexbox (NO fixed):** raíz `div.flex h-screen bg-[#040506] text-zinc-100 selection:bg-cyan-500/30` (línea 43). Fondo base `#040506` (más oscuro que el `#080a0c` del admin).
- **Dos capas de fondo fijas:** (1) **textura de ruido** SVG `feTurbulence` inline `opacity-[0.015]` (líneas 45-51) — el admin **no tiene esto**; (2) **ambient glow** con los mismos dos `radial-gradient` cyan+emerald que el admin (líneas 53-61), prácticamente idénticos en color/posición.
- **Sidebar desktop** (`SidebarNav`, líneas 64-71) + **drawer mobile** con `AnimatePresence` + `motion.div` spring (líneas 74-105). El admin hace el drawer con CSS `translate-x` puro; el cliente usa Framer Motion.
- **Columna principal** (líneas 107-181): `banners` arriba, luego **`<header>` inline** (NO componente separado, NO card flotante) `h-14 sm:h-16` con borde inferior `1px rgba(255,255,255,0.04)`, `background rgba(4,5,6,0.75)` + `backdropFilter blur(20px)` vía `style` inline. El header muestra: hamburguesa mobile, **avatar de iniciales de la empresa** (círculo cyan `rgba(6,182,212,0.12)` con borde y glow), `companyName`, `userDisplayName`, `<NotificationCenter>` y sign-out.
- **`<main>`** (líneas 173-175): `relative flex-1 overflow-y-auto p-3 sm:p-6 scrollbar-thin scrollbar-thumb-white/10` con `PageTransition`. **NO** es la card flotante `rounded-[28px]` del admin — el contenido va directo sobre el fondo.
- **Footer** (líneas 177-180): `border-t border-white/[0.05] text-xs text-zinc-600`, "© 2026 develOP" + `<VersionBadge />`.

**`SidebarNav.tsx`:** `nav.w-60 border-r border-white/5 bg-[#040506]` + textura de ruido propia. Header con `<BrandMark href="/dashboard" size="sm" />` (**sin tagline**, a diferencia del admin que pasa `tagline="Admin"`). Nav **plano, sin secciones agrupadas** (9 items en una lista + módulos premium condicionales sangrados). Mismo pill activo cyan (`layoutId="sidebar-active-pill"`, mismo spring, mismo `shadow-[inset_2px_0_0_0…]`), mismos estados `text-cyan-400`/`text-zinc-400 hover:bg-white/[0.04]`. Badges: mensajes (cyan sólido `bg-cyan-500`), hot-leads (rose con `animate-ping`). Módulos premium usan accent por servicio (amber/cyan/violet/emerald).

**¿Comparte componentes de chrome con el admin?** Comparte **piezas atómicas** (`BrandMark`, `VersionBadge`, el patrón del pill cyan con el mismo `layoutId`, los gradientes ambientales, `adminHoverCls` en cards de páginas) pero **NO el shell**: `DashboardLayoutClient` / `SidebarNav` / header inline son **archivos paralelos** a `AdminLayoutClient` / `AdminSidebar` / `AdminTopbar`. Cero reutilización del shell.

**Colores/CSS del chrome cliente:** Tailwind hardcodeado sobre dark, casi el mismo vocabulario que el admin (`bg-white/[0.0x]`, `border-white/5`, `text-zinc-*`, cyan `#06b6d4`). Diferencias: fondo base `#040506` (vs `#080a0c`), `border-white/5` en sidebar (vs `/10`), textura de ruido SVG, header translúcido inline (vs card glass). Sin CSS variables custom.

---

### 4C. Diferencias concretas (punto a punto)

| Eje | Admin | Cliente | ¿Igual? |
|---|---|---|---|
| **Estrategia de shell** | `fixed inset-0 z-[80]` full-viewport | `flex h-screen` (flow normal) | ❌ Estructura distinta |
| **Fondo base** | `bg-[#080a0c]` | `bg-[#040506]` | ⚠️ Casi (cliente más oscuro) |
| **Textura de ruido** | No | Sí (SVG `feTurbulence`, `opacity-[0.015]`) | ❌ Solo cliente |
| **Ambient glow** | radial cyan+emerald inline | radial cyan+emerald inline (≈mismos valores) | ✅ Prácticamente idéntico |
| **Sidebar — contenedor** | `w-[240px] bg-white/5 backdrop-blur-xl border-r border-white/10` | `w-60 bg-[#040506] border-r border-white/5` | ⚠️ Mismo ancho, distinta superficie (admin glass, cliente sólido) |
| **Sidebar — agrupación** | 4 secciones con labels (`Operaciones`…) | Lista plana (9 items) + premium sangrados | ❌ Distinto |
| **Sidebar — pill activo** | `layoutId="sidebar-active-pill"`, `bg-cyan-500/10 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]`, spring 380/38/0.9 | **idéntico** (mismo layoutId, mismo shadow, mismo spring) | ✅ Idéntico |
| **Sidebar — brand** | `BrandMark` con `tagline="Admin"` | `BrandMark size="sm"` sin tagline | ⚠️ Mismo componente, distinto tagline |
| **Header** | `AdminTopbar` = card flotante `rounded-2xl bg-white/5 backdrop-blur-xl`, breadcrumb+título derivado del path | `<header>` inline, `bg rgba(4,5,6,0.75) blur(20px)`, avatar empresa + notif + signout | ❌ Distinto (componente vs inline; card vs barra) |
| **Wrapper de contenido** | Card flotante `rounded-[28px] border bg-white/[0.03] shadow backdrop-blur-md` (capa hermana) + `<main>` scrolleable | `<main>` directo sobre el fondo (sin card contenedora) | ❌ Distinto |
| **PageTransition** | `fadeUp` variants, mount-only, gate `useReducedMotion` | `key={pathname}`, transición **por ruta** (opacity+y15, ease 0.22,1,0.36,1) | ❌ Mecánica distinta |
| **Drawer mobile** | CSS `translate-x` + scrim | Framer `AnimatePresence` + spring | ❌ Técnica distinta (visual similar) |
| **Footer** | `text-zinc-700` "develOP Admin" + VersionBadge | `border-t` `text-zinc-600` "© 2026 develOP" + VersionBadge | ⚠️ Casi |
| **Paleta / tokens** | Tailwind hardcodeado, accent cyan `#06b6d4` | Mismo set hardcodeado, mismo cyan | ✅ Mismos valores |
| **Tipografía / espaciado base** | Sin font-family propia (system); `text-zinc-*`, `tracking-tight` | Igual | ✅ Igual |
| **Cards / tablas / inputs** | `src/components/ui/*` (Card, Button, Badge, Field, Input, Select, Modal, Stat…) | **los mismos** `ui/*` | ✅ Idéntico (primitivas compartidas) |
| **PageHeader de página** | NO usa `ui/PageHeader` (0 matches en admin) — título via `AdminTopbar` | SÍ usa `ui/PageHeader` directamente (ej. `soporte/page.tsx`) | ❌ Patrón de encabezado de página distinto |
| **Hover de cards** | `adminHoverCls` (`hover.ts`) | mismo patrón (docstring: "igual al Dashboard"); cliente además usa whileHover en algunos | ✅ Mismo lenguaje |
| **Loading state** | `ui/LoadingState` + `loading.tsx` por ruta | `ui/LoadingState` + `loading.tsx` por ruta (todas las rutas tienen loading) | ✅ Comparten componente |
| **Empty state** | `ui/EmptyState` | `ui/EmptyState` | ✅ Comparten componente |
| **Error state** | `ui/ErrorState` / `SectionErrorBoundary` | mismos + `error.tsx` por ruta | ✅ Comparten componente |

**Resumen de 4C:** Lo que difiere es **el chrome estructural** (estrategia de shell fixed-vs-flex, sidebar agrupada-vs-plana, header card-vs-inline, contenido en card-flotante-vs-directo, mecánica de PageTransition, encabezado de página vía topbar-vs-PageHeader). Lo que coincide es **el lenguaje atómico** (tokens de color, primitivas `ui/*`, pill activo, hover, estados loading/empty/error). El "look" del admin = card flotante `rounded-[28px]` glass + topbar flotante + sidebar glass `bg-white/5` con secciones. Esos 3-4 rasgos son los que el cliente NO tiene hoy.

---

### 4D. El "problema" de `src/components/ui/*` — ¿landmine?

**Grep `var(--` dentro de `src/components/ui/`:** solo **2 hits**, ambos en componentes **de marketing/landing**, no en primitivas de portal:
- `ui/IntroLockupText.tsx:122` → `fontFamily: "var(--font-geist-sans), sans-serif"` (variable de fuente Next, no de tema custom).
- `ui/buttons/MagneticCta.tsx:130` → `conic-gradient(from var(--angle), …)` (variable de ángulo animada vía `@property`, local al CTA de la landing).

**Grep `setProperty` / `style.setProperty` / `CSS.setProperty` dentro de `src/components/ui/`:** **0 hits.** Ningún `ui/*` setea CSS variables en runtime.

**¿Algún `ui/*` lee una CSS variable de tema custom (no utilitaria Tailwind)?** **NO.** Las primitivas de portal (`Card`, `Button`, `PageHeader`, `Badge`, `EmptyState`, `ErrorState`, `LoadingState`, `Modal`, `Input`, `Field`, `Select`, `Stat`, `StatCard`, `Tabs`, `Skeleton`…) son **100% Tailwind hardcodeado** sobre dark:
- `Card`: variantes con `rounded-2xl border border-white/10 bg-white/[0.02]` (líneas 22-33). Idéntico vocabulario a las cards del admin.
- `PageHeader`: `text-white`, `text-zinc-500/600`, accent map `border-cyan-500/20 bg-cyan-500/10 text-cyan-400` (líneas 20-27).
- `EmptyState` / `ErrorState` / `LoadingState`: borde `border-white/10 bg-white/[0.02]`, spinner cyan, `text-zinc-*`.
- Único uso de `design-tokens.ts` en un `ui/*`: **`Modal.tsx:7`** importa `zIndex` (un número TS, `zIndex.modal = 10000`), **no una CSS variable**.

**`src/lib/design-tokens.ts`:** es un objeto **TS de constantes** (colors/spacing/radii/typography/shadows/motion/zIndex). **No inyecta CSS variables.** Quien lo consume: `tailwind.config.ts` (mapea tokens al theme en build), `ui/Modal.tsx` (solo `zIndex`), el setter-shell, y la sección `_design/TokensSection`. Los `ui/*` de portal NO leen estos tokens en runtime — los colores ya están horneados como clases Tailwind.

**Conclusión 4D:** `src/components/ui/*` **NO es un landmine** para D1. No hay tematización por CSS variables que haya que duplicar/sobrescribir; las primitivas son neutras-dark y **ya idénticas** entre admin y cliente (de hecho el admin no introduce ningún `ui/*` propio: usa los mismos). "Idéntico al admin" se logra **100% a nivel chrome/layout, SIN tocar `ui/*`**. Los 2 `var(--)` existentes son de marketing y quedan fuera de scope.

---

### 4E. Camino de alineación (D1) — propuesta

**Diagnóstico base (de 4A-4D):** la divergencia es puramente de **chrome estructural**. Las primitivas (`ui/*`) y los tokens ya son comunes. Por lo tanto, alinear el cliente al admin **NO requiere tocar `ui/*`** → **no es bloqueo.**

**Opción descartada — compartir el shell del admin con un prop de modo:** técnicamente posible (extraer un `<AppShell mode="admin"|"client">`), pero los dos shells divergen en demasiados ejes funcionales: el admin usa `fixed inset-0 z-[80]` con escala de z propia, drawer CSS, topbar derivada del path; el cliente necesita banners (impersonation/subscription), avatar de empresa, `NotificationCenter`, módulos premium en sidebar, y transición por-ruta. Unificarlos en un solo componente con flags multiplicaría condicionales y arriesga regresiones en el admin (que está estable). **No recomendado para D1.**

**Opción recomendada — alinear el `DashboardLayoutClient` existente al patrón visual del admin (paralelo, no compartido):** ya existe el shell cliente; el trabajo es **portar los rasgos visuales del admin** sobre él. Cambios concretos, todos en chrome:

1. **`DashboardLayoutClient.tsx`** (el archivo central):
   - Adoptar el **wrapper de contenido como card flotante** del admin: capa hermana `rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md` + `<main absolute inset-0 overflow-y-auto rounded-[28px]>` (copiar el patrón de `AdminLayoutClient` líneas 94-102, incluida la nota de por qué el blur va en hermana y no en `<main>`).
   - Igualar el **fondo base** a `#080a0c` (o decidir conscientemente mantener `#040506`).
   - Evaluar quitar/atenuar la textura de ruido si se busca paridad exacta (el admin no la tiene).
   - Header: convertir el `<header>` inline en una **card flotante glass** estilo `AdminTopbar` (`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl`), conservando avatar empresa + `NotificationCenter` + signout (no descartar funcionalidad del cliente).

2. **`SidebarNav.tsx`:**
   - Igualar superficie a la del admin: `bg-white/5 backdrop-blur-xl border-r border-white/10` (hoy `bg-[#040506] border-r border-white/5`).
   - Adoptar **agrupación por secciones con labels** (como `NAV_SECTIONS` del admin) si se quiere paridad estructural; el pill activo y badges ya son iguales (no tocar).

3. **`PageTransition` (cliente):** opcional — alinear a la mecánica del admin (`fadeUp` mount-only con gate `useReducedMotion`) si se busca igualar la sensación de transición; baja prioridad.

4. **Encabezados de página:** los `dashboard/*/page.tsx` ya usan `ui/PageHeader`; el admin deriva el título del `AdminTopbar`. Para paridad, mantener `ui/PageHeader` en el cliente (es la pieza compartida correcta) — no requiere cambio salvo decisión de diseño.

**Archivos a crear/modificar (chrome solamente):**
- Modificar: `src/components/dashboard/DashboardLayoutClient.tsx` (card flotante + fondo + header glass).
- Modificar: `src/components/dashboard/SidebarNav.tsx` (superficie glass + secciones).
- Opcional: `src/components/dashboard/PageTransition.tsx` (alinear mecánica).
- **NO crear archivos nuevos obligatorios**; el shell paralelo ya existe.
- **NO tocar:** `src/components/ui/*` (ver 4D), `AdminLayoutClient`/`AdminSidebar`/`AdminTopbar` (riesgo de regresión en admin), `src/lib/hover.ts`, `src/lib/design-tokens.ts`.

**¿Toca `ui/*`?** **NO.** → **No hay bloqueo.** D1 es 100% trabajo de chrome/layout sobre archivos del cliente, reutilizando el lenguaje visual que el admin ya define. Si en la ejecución apareciera la necesidad de tematizar una primitiva `ui/*` (p. ej. una variante nueva de `Card`), eso **sí** debería marcarse como bloqueo y consultarse antes de avanzar — pero el análisis actual indica que no hará falta.

---

## 5. Navegación, multi-tenancy y guards del cliente

> **Corrección de grounding (importante para la síntesis):** la premisa "NO existe `src/middleware.ts` → auth no se hace por middleware" es **parcialmente falsa**. En Next 16 el middleware se renombró a **`proxy.ts`**. El archivo `src/proxy.ts` **SÍ existe y ES el guard de borde real** (cumple exactamente el rol de un middleware: redirects por rol antes de tocar el layout). El `src/auth.config.ts` que sí aparece es **código muerto/no-op** (`authorized()` → `return true`). Toda la sección 5C se reescribe alrededor de `proxy.ts`.

---

### 5A — Patrón de navegación

**Resumen:** el dashboard del cliente navega mayoritariamente con `<Link>` de `next/dom` (sidebar, tabs, breadcrumbs internos) y usa `router.refresh()` para revalidar tras mutaciones — el mismo patrón que el admin. El uso de `triggerTransition()` es **marginal** (1 sola llamada real en todo el árbol del dashboard). Hay **violaciones reales de la regla CLAUDE.md "nunca `router.push()` directo"**, todas concentradas en el módulo premium email-marketing y en dos componentes de soporte/notificaciones.

**`SidebarNav` (cliente) vs nav del admin:** ambos son idénticos en filosofía — array de items + `<Link href>` + `usePathname()` para el activo + pill animada con `layoutId` (FM `motion.div`, spring `stiffness:380 damping:38 mass:0.9`, que es el preset de dock de CLAUDE.md). El cliente NO usa `triggerTransition` en el sidebar (usa `<Link>` puro), igual que el admin. Correcto.

**Violaciones de `router.push()` directo (regla CLAUDE.md):**

| Archivo | Línea | Uso | Severidad | Nota |
|---|---|---|---|---|
| `dashboard/modules/email-marketing/campaigns/new/page.tsx` | 38, 67, 145 | `router.push('/dashboard/modules/email-marketing/campaigns')` | Media | 3 sitios; navegación post-submit/cancel sin `triggerTransition` |
| `dashboard/modules/email-marketing/campaigns/[id]/send/page.tsx` | 23 | `router.push(...)` | Media | post-envío |
| `components/dashboard/NewTicketModal.tsx` | 63 | `router.push(\`/dashboard/soporte/${res.data.ticketId}\`)` | Media | redirect al ticket recién creado |
| `components/dashboard/NotificationCenter.tsx` | 114 | `router.push(notif.actionUrl)` | Baja-media | navega a URL de la notificación |

**Usos legítimos / no-violación (para contraste):**
- `MessageThread.tsx:105` usa `router.replace('/dashboard/messages', { scroll:false })` — limpieza de query param `?context=`, no navegación de página. Aceptable.
- `NotificationCenter.tsx:98,106` y `ResolveTicketButton.tsx:16` usan `router.refresh()` — revalidación, idéntico al patrón admin. Correcto.
- `PremiumModuleCard.tsx:88` es el **único** que respeta la regla: `triggerTransition('/dashboard/messages?...')`. 
- `plan/UpgradeCtaButton.tsx:82` usa `window.location.assign()` **a propósito y documentado** (comentario lín. 77-81: `requestUpsellAction` dispara `revalidatePath('/dashboard')` que cancelaría un `router.push` pendiente — race detectado en QA visual MS-3). Es una excepción justificada, no un descuido.

**Hallazgo de consistencia:** el admin **también** usa `router.push` en 6 archivos (`leados/[leadId]/.../decision-bar.tsx`, `chatbots/new/CreateBotForm.tsx`, `alerts/_components/alert-card.tsx`, `leads/_components/lead-card.tsx`, `projects/_components/convert-lead-dialog.tsx`, `clients/[clientId]/_components/ClientSwitcher.tsx`). O sea: **la regla "el admin nunca usa `router.push`" no se cumple ni en el admin**. La regla está rota de forma pareja en ambas zonas; no es un déficit exclusivo del cliente. El patrón canónico (`triggerTransition`) está prácticamente abandonado fuera del sitio público.

---

### 5B — Multi-tenancy (seguridad)

**Veredicto general: sólido.** No encontré ninguna query alcanzable desde `/dashboard` que tome el `organizationId` de un parámetro de URL no confiable. Todo el árbol resuelve la org desde la **sesión** por dos caminos, y los accesos por ID dinámico tienen guard anti-IDOR.

**Dos resolvedores de org (ambos session-derived, pero distintos):**

1. **`resolveOrgId()`** (`src/lib/preview.ts:6`) — el canónico para páginas/acciones. `ORG_MEMBER` → `session.user.organizationId`; `SUPER_ADMIN` → `getImpersonationSession().orgId` (cookie JWT firmada, verificada contra `adminId` y `expiresAt`). **Respeta impersonation.** Usado por casi todas las páginas server y por `email-marketing/_actions.ts`, `ticket-actions.ts`, `regenerate-brief.ts`.
2. **`getClientChatbotSession()`** (`modules/chatbot/server/admin/getClientSession.ts:5`) — usado por toda la sección `/dashboard/chatbot/*` y `/dashboard/leads`. Hace `orgMember.findFirst({ where:{ userId } })` → org del **propio usuario logueado**. **NO respeta impersonation** (un SUPER_ADMIN impersonando ve su propia org/bot, no la del cliente). Seguro frente a IDOR, pero inconsistente con `resolveOrgId`.

**Anti-IDOR en accesos por ID dinámico (todos correctos):**

| Ruta / acción | Mecanismo | Archivo:línea |
|---|---|---|
| `/dashboard/chatbot/leads/[id]` | `getLeadByIdForOrg(id, org.id)` → `findFirst({ id, botConfig:{ organizationId } })` → `notFound()` | `multiTenantQueries.ts:158-169`; page `chatbot/leads/[id]/page.tsx:33` |
| mensajes de conversación del lead | `getConversationMessagesForOrg(convId, org.id)` filtra `conversation:{ botConfig:{ organizationId } }` | `multiTenantQueries.ts:175-189` |
| `/dashboard/soporte/[ticketId]` | `prisma.ticket.findUnique({ where:{ id, organizationId } })` → `redirect('/dashboard/soporte')` | `soporte/[ticketId]/page.tsx:66-76` |
| `replyTicketAction` (POST) | `assertTicketBelongsToOrg(ticketId, orgId)` antes de mutar (IDOR previo confirmado en B11.0, fix B11.2-C2) | `actions/ticket-actions.ts:121-130` + `lib/auth/assert-ownership.ts:32-43` |
| `resolveTicketClientAction` | `update({ where:{ id, organizationId } })` | `actions/ticket-actions.ts:198-201` |
| `markNotificationReadAction` | `updateMany({ where:{ id, organizationId } })` | `lib/actions/notifications.ts:27-30` |
| `sendCampaignAction` | `findFirst({ id: campaignId, organizationId: org.id })` | `email-marketing/_actions.ts:169-172` |
| `GET /api/dashboard/chatbot/leads/export` | `listLeadsForDashboard(session.organization.id, …)` + audit `LEADS_EXPORTED` | `export/route.ts:88,104,161` |
| `GET /api/dashboard/leads/recent` | `findMany({ where:{ botConfig:{ organizationId: orgId } } })`, orgId de `resolveOrgId()` | `recent/route.ts:16,22-29` |

**Páginas que filtran correctamente por org de sesión** (muestra): `boveda` (`clientAsset.findMany({ where:{ organizationId } })`, `boveda/page.tsx:111`), `perfil`, `services`, `plan`, `project`, `resultados/*`, `messages`, `dashboard/page.tsx` (pasa `organizationId` de `resolveOrgId()` a cada wrapper de Suspense). Ninguna acepta org por URL/prop del cliente.

**Hallazgos (no son leaks cross-tenant, pero conviene anotarlos):**

- **[Media — inconsistencia de impersonation] Acciones de escritura que NO usan `resolveOrgId()`.** Varias server actions derivan la org de `session.user.organizationId` **directo**, no de `resolveOrgId()`:
  - `lib/actions/profile.ts` — `updateProfileAction:28`, `updateContactAction:78`, `updateNotificationPrefsAction:105`, `requestAccountDeletionAction:150`.
  - `lib/actions/messages.ts:119` — `sendClientMessageAction`.
  - `lib/actions/upsell.ts:15` — `requestUpsellAction`.
  - `lib/actions/notifications.ts:16,42` — mark read.
  
  Como para un `SUPER_ADMIN` el `session.user.organizationId` es `undefined` (ver `auth.ts:282`; el admin no tiene `OrgMember`), estas acciones **fallan-cerrado** durante impersonation (devuelven "Sesión inválida"/"No autorizado") en vez de escribir en la org impersonada. **No hay fuga ni escritura cruzada** — es robusto en términos de seguridad — pero es **UX inconsistente**: durante una sesión de soporte el admin puede *ver* la org (páginas usan `resolveOrgId`) pero no puede ejecutar estas acciones, y el modo de fallo es un error genérico, no un bloqueo explícito. La página `perfil` ya esquiva esto mostrando una vista read-only en `preview` (`perfil/page.tsx:119-179`), pero `messages`/`upsell`/`notifications` no tienen ese tratamiento.

- **[Baja] `agencySettings.findFirst({ orderBy:{ updatedAt:'desc' } })` en `sendClientMessageAction`** (`messages.ts:148`) lee el settings singleton global de la agencia — correcto (es config de develOP, no tenant-scoped), solo se anota para que no se confunda con un dato de org.

- **[Informativo] Ruta huérfana `/dashboard/leads`** (`leads/page.tsx`): duplica `/dashboard/chatbot/leads`, sin link en el sidebar, usa `listLeadsForBot(session.bot.id)` (bot de sesión → scoped, sin IDOR). No es bug de seguridad, es deuda/superficie muerta.

---

### 5C — Auth / Guards

**Arquitectura de dos capas (defensa en profundidad):**

**Capa 1 — `src/proxy.ts` (el "middleware" de Next 16, edge, sin DB).** `matcher` = `['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password']`. Reglas:
- No autenticado + ruta protegida → `/login?callbackUrl=…` (`proxy.ts:104-108`).
- `passwordResetRequired` → fuerza `/cambiar-password` (`proxy.ts:84-90`).
- `/admin/*` exige `role === SUPER_ADMIN`; si no → dashboard/onboarding (`proxy.ts:148-152`).
- **`/dashboard/*` exige `role === ORG_MEMBER` OR (`SUPER_ADMIN` + cookie de impersonation presente)** (`proxy.ts:154-156`). Cualquier otro → admin (si es admin) o login.
- `SETTER` confinado a `/setter` (early return, `proxy.ts:117-122`).
- Detalle: el guard de `/dashboard` solo chequea **presencia** de la cookie de impersonation (`proxy.ts:77`), no su validez criptográfica (eso lo hace `getImpersonationSession()` en la capa 2). Es correcto: el borde es coarse-grained, el layout/`resolveOrgId` valida la firma.

**Capa 2 — `layout.tsx` server components (re-chequean con DB):**
- `admin/layout.tsx:45-54`: `auth()`; sin user → `/login`; `role !== SUPER_ADMIN` → `/dashboard`. Mismo guard que proxy, redundante a propósito.
- `dashboard/layout.tsx:71-120`: resuelve `resolveOrgId()`; si `!organizationId` → redirect (`SUPER_ADMIN` → `/admin/clients`, resto → `/login`, lín. 90). Esto es lo que saca a un admin **sin impersonar** que llega a `/dashboard`. Luego: gate de onboarding → `/bienvenida` (lín. 118-120).

**Roles que acceden a `/dashboard/*`:** efectivamente **`ORG_MEMBER`** (y `SUPER_ADMIN` solo en impersonation). El layout y el proxy son el mismo criterio.

- **[Hallazgo — confirmar con humano] El rol `CLIENT` está bloqueado del dashboard.** El enum Prisma tiene 4 roles (`schema.prisma:12-17`: `SUPER_ADMIN, ORG_MEMBER, CLIENT, SETTER`) y CLAUDE.md dice "`CLIENT` → `/dashboard/*`". Pero el proxy define `USER_ROLE = 'ORG_MEMBER'` y la condición `isDashboardRoute && role !== USER_ROLE && !(SUPER_ADMIN && impersonating)` (`proxy.ts:154`) **redirige a `/login` a cualquier usuario con `role === 'CLIENT'`**. Mismo en `dashboard/layout` (un CLIENT sin `OrgMember` daría `organizationId` undefined → redirect). En la práctica los clientes se crean como `ORG_MEMBER` (ver Google provider `auth.ts:161` y credentials `auth.ts:197` que asignan/usan `ORG_MEMBER`), así que el rol `CLIENT` parece **no asignarse nunca** → no rompe en runtime. Pero es una **discrepancia doc-vs-código**: si algún flujo creara un usuario `CLIENT`, quedaría sin acceso al portal. A confirmar si `CLIENT` es legacy a borrar del enum o un rol futuro a soportar.

**¿Mismo guard que el admin o uno específico?** Misma **maquinaria** (proxy + layout server-component, ambos vía `auth()`), distinto **predicado de rol** por zona. No hay un helper compartido tipo `requireOrgMember()` análogo a `requireSuperAdmin()` (`auth-guards.ts:3`); el chequeo de rol del cliente vive inline en `proxy.ts` y en cada layout/acción. `auth-guards.ts` solo expone `requireSuperAdmin` y `requireSetter` — **no hay `requireClient`/`requireOrgMember`**, por eso cada acción del cliente re-implementa el chequeo a mano (fuente de la inconsistencia `resolveOrgId` vs `session.organizationId` de 5B).

**¿Alguna ruta del dashboard sin guard?**
- Páginas/layouts bajo `/dashboard/*`: **todas** cubiertas (proxy capa 1 + `resolveOrgId()`/`redirect` en cada page server, verificado en `dashboard/page.tsx:41`, `boveda:108`, `perfil:95`, `soporte/[ticketId]:62`, `email-marketing/layout:17-21`, etc.).
- **API routes `/api/dashboard/*`: fuera del matcher del proxy** → NO las protege la capa 1. **Se autoprotegen** en la capa 2: `recent/route.ts:11-17` (`auth()` 401 + `resolveOrgId()`), `export/route.ts:83-85` (`getClientChatbotSession()` 401). Correcto, pero depende 100% de que cada route handler recuerde llamar al guard — sin red de seguridad de borde.

- **[Informativo] `src/auth.config.ts` es código muerto engañoso.** Su `authorized()` retorna `true` con el comentario "Route protection is handled in middleware logic" (`auth.config.ts:14-15`), pero la lógica real está en `proxy.ts` (que importa `authConfig` solo para instanciar `NextAuth` edge-safe, `proxy.ts:2,5`). Quien busque el guard por el comentario se desorienta. No es bug, es deuda de claridad.

---

## 6. Baseline de errores TS del dashboard

### 6.1 Estado: BASELINE VERDE

El padre corrió `src/node_modules/.bin/tsc.cmd --noEmit` → **EXIT 0, salida vacía**. El portal cliente (`src/app/(protected)/dashboard/` + `src/components/dashboard/`) **no tiene errores de TypeScript propios**. Cualquier error de tsc que aparezca tras una edición de un lane es atribuible a ese cambio, no al baseline.

### 6.2 tsc vs ESLint — los "baseline conocidos" históricos NO afectan el exit 0

Históricamente se citaban dos "baseline conocidos". Verificados en el árbol actual, **ninguno de los dos rompe el tsc exit 0 hoy**:

| Item histórico | Naturaleza | Estado real verificado |
|---|---|---|
| `@googleapis/webmasters` (`searchconsole.ts:2`) | Era un **`Module not found` de build** + `TS2307` de tsc cuando `node_modules` estaba desfasado (paquete declarado en `package.json:38` pero no instalado). | **RESUELTO.** El paquete está **instalado** (`node_modules/@googleapis/webmasters` existe). Por eso tsc da exit 0. El único `import` real en el árbol es `src/lib/searchconsole.ts:2` (`import { webmasters, webmasters_v3 } from '@googleapis/webmasters'`); lo consume la cadena `api/reports/monthly` → Resultados/SEO. Las menciones restantes son docs de auditorías viejas (`docs/audits/*`, `docs/bitacora-roadmap.md`), no código. |
| `react-hooks/set-state-in-effect` en `PreloaderContext` | Regla de **ESLint**, no de tsc. Nunca participó del `tsc --noEmit`. | No hay supresión ni violación activa en `src/context/PreloaderContext.tsx` (cero `eslint-disable` / `set-state-in-effect`). La regla aparece sólo como referencia documental/cumplida en otros archivos (TransitionContext, useIsClient, use-is-client, setter, admin/leads, etc.) — todos la respetan; única supresión explícita: `src/components/layout/SmoothScroll.tsx:64` (fuera del scope dashboard). |

Conclusión: ambos eran ítems de **build/lint**, no de `tsc`. Con el paquete ya instalado, el baseline de TS está limpio.

### 6.3 Deuda detectada: `any` y `ts-ignore` en el scope dashboard

Búsqueda en `src/app/(protected)/dashboard/` + `src/components/dashboard/`:

**`@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`: 0 ocurrencias** en todo el scope. Limpio.

**`any`: 2 ocurrencias** (deuda relevante para los lanes, no error de tsc — pasan por estar tipadas como `any` o por eslint-disable):

| Archivo | Línea | Uso | Nota |
|---|---|---|---|
| `src/app/(protected)/dashboard/project/page.tsx` | 115 | `const tasks = project.tasks as any[]` | Ya tiene `// eslint-disable-next-line @typescript-eslint/no-explicit-any` en la línea 114 (deuda asumida explícitamente). Sección "Mi proyecto". |
| `src/components/dashboard/SessionsChart.tsx` | 27 | `const CustomTooltip = ({ active, payload, label }: any) => {` | Props del tooltip de Recharts sin tipar. Sección "Resultados" (tráfico GA4). |

Ambas violan la regla no-negociable de `CLAUDE.md` ("Never use `any`. Zero exceptions"), pero **preexisten** y no afectan el `tsc --noEmit` exit 0. Recomendación para quien toque "Mi proyecto" o "Resultados": tipar `project.tasks` con el tipo Prisma real y los props del tooltip con `TooltipProps` de Recharts.

---

## 7. Bloqueantes y decisiones que requieren coordinación humana (Valentino)

> Nada de esto se puede resolver "vibecodeando": cada ítem es una decisión de producto, de seguridad o de scope que un lane no debe tomar solo. Ordenados por severidad / costo de equivocarse.

### P0 — Seguridad / multi-tenancy (decisión + fix antes de tocar las secciones afectadas)

**7.1 — Leak de `ZodError` crudo al cliente en `lib/actions/profile.ts` (bug de seguridad heredable). [BLOQUEA lane Mi cuenta]**
- **Qué es:** el admin ya tapó este leak en `updateSettings` con el helper `toErrorMessage` (commit `5e33733`) porque exponía el `ZodError` crudo al cliente — viola la regla CLAUDE.md "Never expose internal error messages". Las actions del cliente en `src/lib/actions/profile.ts` (`updateProfileAction`, `updateContactAction`, `updateNotificationPrefsAction`, `requestAccountDeletionAction`) **NO** tienen el helper → mismo leak latente.
- **Por qué bloquea:** es la regla no-negociable de seguridad; quien toque Mi cuenta debe replicar el patrón, pero el helper `toErrorMessage` y su contrato de mensajes son del dominio admin. Aplicarlo mal puede silenciar errores reales.
- **Decisión necesaria:** confirmar que el lane Mi cuenta debe portar `toErrorMessage` (mismo helper, no uno nuevo) y a qué actions exactamente. Es seguridad → no opcional, pero requiere OK de scope porque toca un archivo compartido conceptualmente con el admin.

**7.2 — Rol `CLIENT` bloqueado del dashboard: discrepancia doc-vs-código. [BLOQUEA cualquier decisión sobre el enum de roles]**
- **Qué es:** `proxy.ts:154` exige `role === 'ORG_MEMBER'` (o SUPER_ADMIN impersonando). Un usuario con `role === 'CLIENT'` (valor que existe en el enum Prisma) es **redirigido a `/login`**. CLAUDE.md dice "`CLIENT` → `/dashboard/*`". Hoy no rompe porque los clientes se crean como `ORG_MEMBER` (Google/credentials providers), así que `CLIENT` parece no asignarse nunca.
- **Por qué bloquea:** es contradicción entre la fuente de verdad (código) y la doc oficial. Codear sobre cualquiera de las dos premisas sin decisión es riesgoso: si un flujo futuro crea un `CLIENT`, queda sin acceso al portal.
- **Decisión necesaria de producto:** ¿`CLIENT` es legacy a borrar del enum, o un rol futuro a soportar? Si se soporta → hay que tocar `proxy.ts` + layout + actualizar CLAUDE.md. No codear hasta que Valentino lo defina.

**7.3 — Acciones de escritura que NO respetan impersonation (UX rota en soporte, no leak). [Decisión de alcance del lane de seguridad]**
- **Qué es:** `profile.ts`, `messages.ts` (`sendClientMessageAction`), `upsell.ts` (`requestUpsellAction`), `notifications.ts` derivan la org de `session.user.organizationId` **directo** en vez de `resolveOrgId()`. Para un SUPER_ADMIN ese campo es `undefined` → estas acciones **fallan-cerrado** durante impersonation (devuelven error genérico, no escriben en la org impersonada). No hay fuga; es UX inconsistente: el admin VE la org pero no puede actuar, y el modo de fallo es opaco. `perfil/page.tsx` ya lo esquiva con vista read-only en preview; `messages`/`upsell`/`notifications` no.
- **Causa raíz:** no existe helper `requireOrgMember()`/`requireClient()` en `auth-guards.ts` (solo `requireSuperAdmin`/`requireSetter`) → cada acción reimplementa el chequeo a mano.
- **Por qué bloquea:** el fix correcto (crear `requireOrgMember` y/o migrar todas las actions a `resolveOrgId`) toca `lib/actions/*` y `auth-guards.ts`, ambos compartidos con admin. Es refactor transversal, no de una sección.
- **Decisión necesaria:** ¿se quiere que el admin impersonando PUEDA escribir (migrar a `resolveOrgId` + crear `requireOrgMember`), o se prefiere bloqueo explícito read-only en impersonation (como hace `perfil`)? Define si es un lane de seguridad propio o queda como deuda documentada.

### P1 — Sincronización con el admin (D2) y contenido falso

**7.4 — Contenido SHELL/falso en producción: `ACTIVITY_LOG` hardcodeado en la Bóveda. [Decisión de producto]**
- **Qué es:** `cuenta/boveda/page.tsx:98-103` — el "Registro de Integridad y Accesos" es un array constante con datos demo ("hace 2 h", "Admin develOP subió Guía de Estilo v2"…). El grid de assets de arriba SÍ es real. Es el ÚNICO contenido falso detectado en todo el portal cliente.
- **Por qué bloquea:** mostrar un log de auditoría inventado a un cliente que paga es un riesgo de confianza. Pero hacerlo real requiere un modelo de eventos/auditoría que hoy no existe para `ClientAsset`.
- **Decisión necesaria:** (a) construir el log real (nuevo modelo + tracking), (b) ocultar la sección hasta tenerlo, o (c) dejarlo explícitamente como placeholder. No es decisión de un lane de UI.

**7.5 — Drift de lógica de negocio entre 3 sets de actions de Soporte/Tickets. [Decisión: consolidar o no]**
- **Qué es:** la regla "responder cambia el status" diverge entre `src/actions/ticket-actions.ts` (cliente → `OPEN`), `src/lib/actions/tickets.ts` (admin viejo FormData) y `admin/tickets/_actions/ticket.actions.ts` (admin nuevo typed → NO cambia status). Un cambio de SLA toca hasta 3 archivos. Además el SLA del cliente está **hardcodeado** (`soporte/page.tsx` "< 4h", "Lun-Vie 9-19hs"), no sale de `AgencySettings`.
- **Por qué bloquea:** consolidar en un único módulo `lib/tickets` parametrizado por rol es un refactor cross-rol (admin+cliente) que cambia comportamiento. Un lane de cliente no puede unilateralmente redefinir la regla compartida.
- **Decisión necesaria:** ¿se consolida ahora (lane propio cross-rol) o el lane Soporte solo toca UI cliente sin tocar la fragmentación? Y: ¿el SLA debe venir de `AgencySettings`?

**7.6 — Sincronización manual catálogo de presentación ↔ seed de planes. [Decisión de robustez]**
- **Qué es:** `plan-presentation.ts` (precios/cupos mostrados AL CLIENTE) se sincroniza A MANO con `prisma/seeds/sync-plans.ts` (el propio archivo lo advierte). Riesgo: el cliente ve un precio distinto al que el admin asigna. Regla viva (memoria): validar `moduleKey` por slug contra la tabla `PremiumModule`, NUNCA contra el catálogo legacy `premium-features.ts`.
- **Por qué bloquea:** eliminar el acoplamiento manual implica decidir una única fuente de verdad (tabla DB vs constante TS) que afecta admin y cliente.
- **Decisión necesaria:** ¿el lane Plan toca solo la presentación, o se ataca la fuente de verdad? Si se toca, coordinar con admin billing.

### P2 — Decisiones de scope (no bloquean seguridad, pero hay que definirlas antes de codear)

**7.7 — Ruta huérfana `/dashboard/leads` (legacy): ¿borrar o mantener?**
- **Qué es:** duplica `/dashboard/chatbot/leads` con OTRO componente (`components/dashboards/LeadsTable`) y OTRA query (`listLeadsForBot`); no tiene link en `SidebarNav`. PERO usa `LeadsTable` + `server/admin/*` compartidos con el admin. Es superficie muerta probable.
- **Decisión necesaria:** borrarla (recomendado) vs. mantenerla. Borrar es lo limpio, pero toca código compartido con admin → requiere OK. No meterla en un lane de feature.

**7.8 — D1 (estética cliente = admin): ¿`ui/*` es landmine? → NO, pero confirmar el alcance del chrome.**
- **Confirmado:** `ui/*` NO es landmine. Cero CSS-vars de tema, cero `setProperty`; las primitivas son Tailwind hardcodeado idéntico al admin. D1 es 100% trabajo de chrome (`DashboardLayoutClient.tsx` + `SidebarNav.tsx`, opcional `PageTransition.tsx`), sin tocar `ui/*` ni el shell admin.
- **Decisión necesaria (estética, no técnica):** ¿paridad EXACTA (fondo `#080a0c`, quitar la textura de ruido SVG que el admin no tiene, sidebar agrupada en secciones) o "inspirado en el admin" conservando la identidad del cliente? Y: ¿se acepta el riesgo de NO compartir el shell (decisión recomendada por Área 4: unificar shells con flags arriesga regresión en el admin estable)? Si durante la ejecución apareciera necesidad de tematizar una primitiva `ui/*`, eso SÍ pasaría a bloqueo y debe consultarse.

**7.9 — Violaciones `router.push()` directo (regla CLAUDE.md). [Decisión: enforce o aceptar]**
- **Qué es:** `campaigns/new/page.tsx` (38,67,145), `campaigns/[id]/send` (23), `NewTicketModal.tsx:63`, `NotificationCenter.tsx:114` usan `router.push()` directo. PERO el admin también la viola en 6 archivos → la regla está rota PAREJA en ambas zonas; `triggerTransition` está casi abandonado (1 uso real en el portal). `UpgradeCtaButton:82` usa `window.location.assign` a propósito y documentado (race MS-3) — NO es violación.
- **Decisión necesaria:** ¿se enforce `triggerTransition` en el cliente (lane cosmético) sabiendo que el admin queda inconsistente, o se relaja la regla en CLAUDE.md para reflejar la realidad? No tiene sentido arreglar solo un lado.

**7.10 — Deuda de `any` violando regla no-negociable (no bloquea tsc).**
- `project/page.tsx:115` (`as any[]`, con eslint-disable) y `SessionsChart.tsx:27` (props tooltip Recharts). Preexisten, no rompen el `tsc --noEmit` exit 0. Limpieza barata DENTRO del lane que toque "Mi proyecto" o "Resultados/tráfico". No requiere decisión propia, solo se autoriza tiparlo al pasar.

### Grounding a corregir en el entregable (no es bloqueante pero evita codear sobre premisa falsa)
- **SÍ existe guard de borde:** `src/proxy.ts` (Next 16 renombró `middleware.ts` → `proxy.ts`) es el middleware real (confirmado: `proxy.ts:154` hace el redirect por rol). `auth.config.ts` es no-op muerto. Cualquier lane que asuma "auth solo por layouts" está mal.
- **`@googleapis/webmasters` está instalado** → el histórico build error en `searchconsole.ts:2` está RESUELTO; baseline TS verde real.

---

## 8. División en lanes + orden de merge

Basado en el **acoplamiento por archivos PROPIOS** (Área 2), no por infra. Regla rectora: dos secciones van JUNTAS solo si comparten un archivo de dominio (`components/dashboard/*` o `lib/*` de dominio); compartir `ui/*`, `lib/preview`, `lib/prisma` NO obliga a fusionar (es infra read-only que todos consumen). El orden de merge minimiza superficie de escritura compartida: lo más transversal (chrome) primero y solo; lo más aislado al final.

### 8.0 — Realidad del acoplamiento (resumen)
- **Cluster acoplado #1:** Plan ↔ Servicio ↔ Resultados-SEO, atados por `lib/actions/upsell.ts` (`requestUpsellAction`, lo invocan `UpgradeCtaButton`, `PremiumModuleCard` y `resultados/seo`). Cambiar su firma rompe las 3.
- **Cluster acoplado #2:** Inicio ↔ Plan, comparten `components/dashboard/plan/UsageMeter.tsx` + `lib/plan/get-org-usage.ts` (archivos propios).
- **Cluster acoplado #3:** Mi chatbot ↔ Resultados-análisis, `resultados/analisis` consume `getMonthlyAnalysisForOrg` de `@/modules/chatbot/index.server` (es código del dominio chatbot embebido en Resultados).
- **Acople cross-ADMIN obligado:** todo lo que toca `@/modules/chatbot/*` (ConversationsTable/LeadsTable, server/admin) es de facto admin+cliente → requiere autorización para tocar.
- **Aisladas reales:** Soporte, Mensajes, Mi proyecto, y el cluster `modules/*` premium (unidas entre sí solo por `isModuleActive`).
- **Chrome raíz** (`DashboardLayoutClient` + `SidebarNav` + `PageTransition`): transversal a las 9 secciones; cualquier toque es cross-lane.

### 8.1 — Lanes propuestos (8 lanes)

**LANE 0 — BASE / Seguridad transversal (merge PRIMERO, solo)**
- **Qué toca:** `auth-guards.ts` (crear `requireOrgMember` si se decide 7.3), el helper `toErrorMessage` aplicado a `lib/actions/profile.ts` (7.1), y la decisión de `resolveOrgId` en las write-actions (7.3). NO toca chrome ni UI.
- **Por qué primero:** estos archivos (`lib/actions/*`, `auth-guards.ts`) los consumen varios lanes. Si se mergean después, todos los lanes posteriores rebasan sobre ellos.
- **Gate humano antes de empezar:** depende de las decisiones 7.1, 7.2, 7.3. Si Valentino no resuelve 7.2/7.3, este lane se reduce solo a 7.1 (leak ZodError, que es seguridad pura y se puede hacer ya).

**LANE 1 — CHROME / Estética D1 (merge SEGUNDO, solo, NO se cruza con páginas)**
- **Secciones:** ninguna feature; es el shell. Archivos: `DashboardLayoutClient.tsx`, `SidebarNav.tsx`, opcional `PageTransition.tsx`.
- **Por qué solo y temprano:** el chrome es transversal a las 9 secciones; cualquier edición de página que también tocara el shell colisionaría. Aislándolo y mergeándolo segundo, todos los lanes de página rebasan sobre el chrome ya alineado. **No toca `ui/*`** (confirmado, no es landmine) → no colisiona con lanes de página que solo consumen `ui/*` read-only.
- **Riesgo de acoplamiento:** bajo. El chrome ya recibe todo scoped por `organizationId` desde `dashboard/layout.tsx`. NO tocar `AdminLayoutClient/Sidebar/Topbar` ni `hover.ts`/`design-tokens.ts`.
- **Gate humano:** decisión 7.8 (paridad exacta vs inspirada).

**LANE 2 — PLAN + SERVICIO + RESULTADOS (cluster acoplado, una sola lane)**
- **Secciones fusionadas:** Mi plan, Mi servicio, y Resultados (las 4 sub-tabs). Van juntas SÍ O SÍ por:
  - `lib/actions/upsell.ts` compartido entre `UpgradeCtaButton` (plan), `PremiumModuleCard` (servicio) y `resultados/seo`.
  - `UsageMeter.tsx` + `get-org-usage.ts` compartidos Plan↔Inicio (Inicio entra parcialmente — ver Lane 4: el editor de UsageMeter vive acá, Inicio solo lo consume → coordinar, no fusionar Inicio entero).
  - Catálogo de presentación ↔ seed (7.6) si se ataca.
- **Subordinada admin:** `resultados/analisis` consume el módulo chatbot → coordinar con Lane 3 (ver orden).
- **Justificación:** es el cluster más acoplado del portal; partirlo garantiza conflictos sobre `upsell.ts`.

**LANE 3 — MI CHATBOT (lane admin+cliente, requiere autorización)**
- **Secciones:** todo `dashboard/chatbot/*` (6 sub-rutas) + la sub-tab `resultados/analisis` (porque es código del dominio chatbot embebido).
- **Por qué separada y con cuidado:** toca `@/modules/chatbot/*` (ConversationsTable/LeadsTable/server-admin) que el ADMIN también importa. Es de facto un lane cross-rol → autorización requerida (como lanes previas).
- **Incluye decidir 7.7:** la ruta huérfana `/dashboard/leads` usa `LeadsTable` + `server/admin` compartidos → su borrado va EN este lane (mismo módulo), no en uno de feature.
- **Herencias a aplicar:** accent color que no llega al widget (§4), emoji picker en settings (§3).

**LANE 4 — INICIO (lane casi-aislada, depende de Lane 2 por UsageMeter)**
- **Sección:** `dashboard/page.tsx` (Inicio) + sus componentes propios (`home/*`, `OnboardingStatusCard`, `lib/dashboard/*`, `lib/ai/executive-brief`, `lib/health-score`).
- **Acople:** consume `UsageMeter` + `get-org-usage` (propiedad de Lane 2). → **mergear DESPUÉS de Lane 2** para no editar UsageMeter en paralelo.
- **Herencias:** empty states (`ChartEmptyState`), a11y de charts, reduced-motion (del admin dashboard).

**LANE 5 — MI CUENTA (lane casi-aislada)**
- **Secciones:** `cuenta/*` (perfil, facturación, bóveda).
- **Acople propio:** comparte `StaggerWrapper.tsx` con Mi servicio (leve, componente de animación). Decisión 7.4 (ACTIVITY_LOG falso) vive acá. Depende de Lane 0 (7.1, leak ZodError en profile.ts).
- **Orden:** después de Lane 0.

**LANE 6 — SOPORTE (la más limpia, aislada)**
- **Secciones:** `soporte/*` + `[ticketId]`. 7 componentes exclusivos + `lib/actions/tickets.ts`. Cero solapamiento con otras secciones cliente.
- **Salvedad:** si se ataca la consolidación de los 3 sets de actions (7.5), eso es cross-rol y NO entra acá → sería un lane propio o queda fuera de scope. Este lane = solo UI/feature de soporte cliente.

**LANE 7 — MENSAJES (aislada)**
- **Sección:** `messages/*`. `MessageThread.tsx` + `lib/actions/messages.ts` + `lib/data/message-context.ts` (MessageThread es su único consumidor). Solo comparte `FadeIn`.
- **Herencia heredable directa (bug):** guard IME `!isComposing` (admin `message-input.tsx:63`) que falta en `MessageThread.tsx:290-295` → envío prematuro con acentos. Aplicar acá.
- **Nota:** `sendClientMessageAction` (en `lib/actions/messages.ts`) está en el radar de Lane 0 (7.3 resolveOrgId). Si Lane 0 toca esa action, Mensajes mergea DESPUÉS de Lane 0.

**LANE 8 — MÓDULOS PREMIUM (una sola lane para los 4, aislada)**
- **Secciones EXTRA (fuera de las 9):** email-marketing (4 sub-rutas), motor-resenas, tienda-conectada, agenda-inteligente. Unidas entre sí por `isModuleActive` y `lib/integrations/*` propios; aisladas del resto.
- **Limpiezas dentro del lane:** `router.push` directos en campaigns (7.9, si se decide enforce), hack `CopyLinkButton` `<a download>` en agenda.

### 8.2 — Orden de merge (minimizando superficie de escritura compartida)

| # | Lane | Por qué en esta posición |
|---|---|---|
| 1 | **LANE 0 — Base/Seguridad** | Toca `lib/actions/*` + `auth-guards.ts` que varios lanes consumen. Todo rebasa sobre él. Empezar por 7.1 (no requiere decisión); 7.2/7.3 esperan a Valentino. |
| 2 | **LANE 1 — Chrome/D1** | Transversal a las 9 secciones. Mergeado segundo, todas las páginas rebasan sobre el shell ya alineado. No toca `ui/*` → no colisiona con páginas. |
| 3 | **LANE 3 — Mi chatbot** | Cross-rol (módulo chatbot + admin). Es la superficie compartida más grande y delicada; mergearla temprano (tras base+chrome) evita que lanes de cliente rebasen mil cambios del módulo. Incluye borrar `/dashboard/leads` (7.7). |
| 4 | **LANE 2 — Plan+Servicio+Resultados** | Cluster `upsell.ts`. Va después de chatbot porque `resultados/analisis` consume el módulo chatbot (Lane 3) → con Lane 3 ya mergeada, Resultados rebasa sobre el módulo estable. |
| 5 | **LANE 4 — Inicio** | Consume `UsageMeter`/`get-org-usage` que son propiedad de Lane 2 → DESPUÉS de Lane 2 para no editar UsageMeter en paralelo. |
| 6 | **LANE 5 — Mi cuenta** | Depende de Lane 0 (7.1). Sin acople con 2/3/4 salvo `StaggerWrapper` (leve, con Servicio ya mergeada en Lane 2). |
| 7 | **LANE 7 — Mensajes** | Depende de Lane 0 si toca `sendClientMessageAction` (7.3). Aislada del resto. |
| 8 | **LANE 6 — Soporte** | Totalmente aislada (cero archivos propios compartidos). Orden flexible; va al final junto con Mensajes/Premium. |
| 9 | **LANE 8 — Módulos premium** | EXTRA, fuera de las 9, totalmente autocontenida. Último, sin riesgo de conflicto. |

### 8.3 — Notas de coordinación
- **Lanes 6, 7, 8 son intercambiables en orden** entre sí (aisladas); el orden 1→5 sí importa por superficie compartida.
- **Archivos infra de alto riesgo que NINGÚN lane de feature debe modificar:** `lib/preview` (24/25 archivos lo importan), `lib/prisma`, `components/ui/*`, `lib/plan/*` (gating), `hover.ts`, `design-tokens.ts`. Si un lane necesita cambiarlos, sube a Lane 0 (base) y se mergea primero.
- **`@/modules/chatbot/*` es shared admin+cliente:** solo el Lane 3 lo toca, con autorización; ningún otro lane debe editarlo aunque lo consuma.
- **Cluster Plan↔Servicio↔Resultados (Lane 2) NO se puede subdividir** sin garantizar conflictos sobre `upsell.ts` — es el hallazgo de acoplamiento más fuerte del portal.
