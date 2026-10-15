# 02 — Qué falta

> Madurez de cada herramienta de §6 del plan, con la escala del PROMPT §5.2 (L0 no existe · L1 esqueleto · L2 camino feliz · **L3 listo para cliente** · L4 pulido). **La unidad que se mide es la funcionalidad** (ENMIENDA-01 E7, DEC-25); la madurez de una herramienta es la de su funcionalidad más floja y la de un área, un cálculo agregado. Un L2 o más afirma que algo funciona: exige el camino feliz trazado con `ruta:línea`; si no, queda `L?`. Los faltantes se escriben como `FAL-NNN` bajo su herramienta. La hipótesis de Valentino —«el admin y el portal están muy desarrollados y les faltan sobre todo módulos»— se confirma o se desmiente acá con evidencia, no se asume. Generado por `scripts/auditoria/hallazgos-md.mjs` (funcionalidades de `_crudo/funcionalidades.json`, faltantes de `_crudo/hallazgos.json`).

## Resumen por área

| Área | Herramientas medidas | Funcionalidades | En L3 o más | Faltantes de L3 más comunes | FAL |
|---|---:|---:|---:|---|---:|
| h1 · Acceso | 5 / 5 | 15 | 0 | Sentry (11), autonomía (9), errores (8) | 3 |
| h2 · Portal del cliente | 16 / 16 | 103 | 12 | Sentry (66), sin mocks ni TODO (55), errores (48) | 11 |
| h3 · Chatbot centralizado | 8 / 8 | 109 | 3 | Sentry (64), errores (61), autonomía (50) | 6 |
| h4 · Panel de admin | 4 / 13 | 15 | 0 | Sentry (11), errores (8), autonomía (6) | 2 |
| h5 · Setter y LeadOS | 0 / 7 | 0 | 0 | — | 0 |
| h6 · Entradas públicas que alimentan lo interno | 1 / 2 | 1 | 0 | permisos y tenant (1), Sentry (1) | 0 |

## h1 · Acceso

### h1.auth-login — Login (contraseña, magic link, Google)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 6 funcionalidades: 5×L2, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, validación en servidor, mobile, Sentry, sin mocks ni TODO, autonomía, carga, permisos y tenant.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-login.google-oauth` Ingreso con Google | L1 | errores, carga, Sentry, sin mocks ni TODO, autonomía | El boton (page.tsx:286-299) inicia OAuth (actions.ts:162-164) pero el signIn callback rechaza toda cuenta sin Account vinculada (user.id = sub, auth.ts:125 y :192-201; callback/index.js:64) y no existe camino que vincule (git grep account.create/linkAccount va |
| `h1.auth-login.login-password` Login con email y contrasena | L2 | errores, validación en servidor, mobile, Sentry, sin mocks ni TODO, autonomía | Camino feliz: page.tsx:347 -> actions.ts:65-111 -> auth.ts:142-169 (bcrypt :157) -> signIn callback auth.ts:192-203 -> jwt auth.ts:209-230 -> redirect actions.ts:102-108 -> proxy.ts:134-146 / layouts |
| `h1.auth-login.logout` Cerrar sesion | L2 | carga, Sentry | admin-topbar.tsx:85 / setter/layout.tsx:76 / DashboardLayoutClient.tsx:150 -> auth-actions.ts:5-7 -> signOut -> /login |
| `h1.auth-login.magic-link` Ingreso por magic link | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | page.tsx:204 -> actions.ts:140-151 -> send-token.js:23-33 (signIn callback auth.ts:175-186) -> auth.ts:101-120 -> brevo-service.ts:25-39 -> callback route.ts:3 -> /dashboard (actions.ts:148) |
| `h1.auth-login.ruteo-por-rol` Ruteo y proteccion por rol | L2 | permisos y tenant, errores, validación en servidor, autonomía | proxy.ts:98-168 (SETTER :117-122, admin :148-152, dashboard :154-156) + re-chequeo en Node: admin/layout.tsx:43-49, setter/layout.tsx:28-34, dashboard/layout.tsx:90-92 via preview.ts:6-20 |
| `h1.auth-login.sesion-jwt` Sesion JWT, expiracion e invalidacion | L2 | permisos y tenant, errores, autonomía | jwt refresca de DB en cada auth() (auth.ts:205-231); invalida en Node por version (auth.ts:215-223); cookie explicita (auth-cookies.ts:21-30) |

### h1.auth-recupero — Olvidé / restablecer contraseña

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 2 funcionalidades: 2×L2).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, validación en servidor, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-recupero.restablecer-password` Restablecer contrasena con el token | L2 | validación en servidor, Sentry, autonomía | page.tsx:10-11 -> ResetPasswordForm.tsx:186-188 -> actions.ts:19-40 -> :45-63 token -> :68-84 transaccion -> :87-96 audit -> exito ResetPasswordForm.tsx:146-183 |
| `h1.auth-recupero.solicitar-enlace` Pedir enlace de recupero | L2 | Sentry | login/page.tsx:365-370 -> forgot-password/page.tsx:120 -> actions.ts:29-57 (Zod + limites) -> :73-83 token -> :96-101 Brevo -> exito :109 |

### h1.auth-cambio — Cambio obligatorio de contraseña

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 1 funcionalidades: 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, sin mocks ni TODO, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-cambio.cambio-forzado` Cambio obligatorio de contrasena temporal | L2 | Sentry, sin mocks ni TODO, autonomía | auth.ts:168 -> proxy.ts:84-90 -> page.tsx:6-27 -> CambiarPasswordForm.tsx:116-131 -> actions.ts:25-75 (update :51-61, unstable_update :73) -> router.push :126 |

### [FAL-002] Cambiar o restablecer la contraseña no le avisa al titular por email
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/cambiar-password/actions.ts:73` — «await unstable_update({ user: { passwordResetRequired: false } }) return { ok: true }»; `src/app/reset-password/actions.ts:86` — «// 5) Audit log — sin password, sin token. Solo el evento. await logAdminAction({»; `src/lib/actions/profile.ts:239` — «await unstable_update({ user: { passwordResetRequired: false } }) return { success: true }»
- Impacto: Si alguien con una sesión robada adivina la contraseña actual y la cambia (SEC-015), o usa un token de reset filtrado (SEC-013), el cliente no recibe ningún 'tu contraseña cambió'. Se entera recién cuando no puede entrar, así que no hay reacción temprana ni pedido de soporte.
- Propuesta: Zona libre. Mandar un email transaccional por Brevo 'tu contraseña cambió' con fecha y link a /forgot-password en las tres actions (cambiar-password, reset-password y updatePasswordAction de profile.ts). Fire-and-forget con captura en Sentry y sin datos sensibles.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-cambio, h1.auth-recupero, h2.cli-cuenta, int.brevo

### h1.auth-invite — Aceptar invitación

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 2 funcionalidades: 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-invite.aceptar-invitacion` Aceptar invitacion y definir contrasena | L1 | validación en servidor, Sentry, autonomía | AcceptInviteForm.tsx:187 -> actions.ts:15-82 funciona con un token, pero nada vivo entrega tokens de invitacion (h1.auth-invite.emitir-invitacion) |
| `h1.auth-invite.emitir-invitacion` Emitir invitacion | L1 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | inviteClientAction (invitations.ts:43-118) sin callers y sin envio (mensaje falso :116); inviteTeamMemberAction (settings.ts:148-237) en modulo sin importadores, por Resend |

### h1.auth-impersonacion — Ver como cliente (impersonación)

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 4 funcionalidades: 4×L2).
- Criterios de L3 que faltan en alguna funcionalidad: errores, validación en servidor, Sentry, carga, permisos y tenant.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-impersonacion.banner-sesion-soporte` Banner de sesion de soporte (impersonacion) | L2 | permisos y tenant | layout.tsx:148-153 -> ImpersonationBanner.tsx:5-38 -> ImpersonationTimer.tsx:18-40; expiracion tambien server-side (lib/impersonation.ts:72); Salir -> impersonation.ts:50-80. |
| `h1.auth-impersonacion.iniciar` Iniciar sesion de soporte (impersonar) | L2 | errores, validación en servidor, Sentry | ImpersonateButton.tsx:24 -> client.actions.ts:8-9 -> impersonation.ts (actions) :12-47 -> cookie + audit -> /dashboard |
| `h1.auth-impersonacion.navegar-como-cliente` Ver el portal como el cliente | L2 | errores | proxy.ts:154 -> dashboard/layout.tsx:72-77 -> preview.ts:14-17 -> impersonation.ts:54-80 -> banner layout.tsx:148-153 |
| `h1.auth-impersonacion.terminar` Terminar sesion de soporte | L2 | carga, Sentry | ImpersonationBanner.tsx:28 -> impersonation.ts (actions) :50-79 (borra cookie, audita, /admin/clients) |

## h2 · Portal del cliente

### h2.cli-bienvenida — Bienvenida / onboarding inicial

- Madurez de la herramienta: **L0** (la de su funcionalidad más floja; 2 funcionalidades: 1×L0, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: validación en servidor, Sentry, sin mocks ni TODO, permisos y tenant, errores, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-bienvenida.guardar-perfil-legacy` Wizard de onboarding legacy (onboarding-actions) | L0 | validación en servidor, Sentry, sin mocks ni TODO | Sin importadores vivos: solo components/onboarding/OnboardingWizard.tsx:6, que nadie importa; el onboarding real es src/app/bienvenida (fuera del lote). |
| `h2.cli-bienvenida.wizard-3-pasos` Bienvenida en 3 pasos | L1 | permisos y tenant, errores, validación en servidor, sin mocks ni TODO, autonomía | Código completo pero inalcanzable: las 3 altas vivas crean la org con onboardingCompleted: true (core.ts:85, createClientOnly.ts:85, createClientWithBot.ts:135); las que dejan false (clients.ts:124, invitations.ts:86) no tienen importadores. Guarda el GA ID eq |

### h2.cli-shell — Shell del portal (sidebar, notificaciones, novedades)

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 6 funcionalidades: 1×L3, 5×L2).
- Criterios de L3 que faltan en alguna funcionalidad: mobile, sin mocks ni TODO, autonomía, permisos y tenant, errores, validación en servidor, Sentry.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-shell.banner-suscripcion-vencida` Banner de suscripcion vencida | L2 | errores, Sentry, autonomía | layout.tsx:147 -> SubscriptionBanner.tsx:5-10 -> subscription.ts:4-12 (findUnique por organizationId). |
| `h2.cli-shell.campana-notificaciones` Campana de notificaciones e historial | L2 | permisos y tenant, errores, validación en servidor, Sentry, autonomía | layout.tsx:101-105 -> DashboardLayoutClient.tsx:148 -> NotificationCenter.tsx:41-127 -> dashboard-actions.ts:188-218 / notifications.ts:46-93. No L3 por scoping sin userId y errores ignorados. |
| `h2.cli-shell.layout-y-navegacion` Shell del portal y gate de onboarding | L3 | — | proxy.ts:154 -> layout.tsx:72-113 -> DashboardLayoutClient; cumple los nueve. Deuda: gate salteable por header (layout.tsx:123-129) y lastDashboardVisit del admin en soporte (:79-88). |
| `h2.cli-shell.navegacion-sidebar` Navegacion del portal (sidebar y drawer mobile) | L2 | mobile, sin mocks ni TODO, autonomía | Camino feliz: layout.tsx:74 resolveOrgId -> :115 activeModuleSlugs -> DashboardLayoutClient.tsx:94-100 -> SidebarNav.tsx:101-103, :123-172. No L3: item de Email marketing con slug que no coincide con el catalogo (SidebarNav.tsx:78) y drawer cerrado enfocable. |
| `h2.cli-shell.notificaciones` Centro de notificaciones | L2 | permisos y tenant, mobile, Sentry, sin mocks ni TODO | layout.tsx:101-105 → NotificationCenter.tsx:114 → notifications.ts:46-66; historial NotificationHistoryModal.tsx:34 → notifications.ts:73-93. |
| `h2.cli-shell.novedades` Novedades del panel | L2 | errores, mobile, Sentry | layout.tsx:110-112 → get-announcements-for-org.ts:31-69 → AnnouncementsFeed.tsx:57-66 → announcements.ts:17-52. |

### h2.cli-inicio — Inicio

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 16 funcionalidades: 8×L2, 5×L3, 3×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, sin mocks ni TODO, permisos y tenant, autonomía, carga, vacíos.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-inicio.atencion-hoy` Atención hoy | L2 | errores, carga, Sentry, sin mocks ni TODO | page.tsx:177-180 → attention.ts:25-127 (org-scoped) → AttentionStack.tsx:76-160 con Links a rutas existentes; el ítem de conexiones es falso perpetuo. |
| `h2.cli-inicio.campanas-utm` Campañas | L3 | — | home-metrics.ts:134 → home-metrics-logic.ts:206-234 → LeadCampaigns.tsx:18-69. |
| `h2.cli-inicio.checklist-de-onboarding` Checklist 'Estamos configurando tu negocio' | L1 | vacíos, errores, carga, Sentry, autonomía | La card lee tareas (OnboardingStatusCard.tsx:17-28) pero ninguna alta viva las crea: seedOnboardingTasksForOrg (seed-tasks-for-org.ts:4-16) solo lo llaman lib/actions/clients.ts:139 e invitations.ts:93, sin importadores; solo un script de QA siembra tareas. |
| `h2.cli-inicio.embudo-leads` Qué pasó con tus leads | L3 | — | home-metrics.ts:123-125 → home-metrics-logic.ts:117-127 → LeadFunnel.tsx:27-85 (link ?status=NEW soportado por leads/page.tsx:32-40). |
| `h2.cli-inicio.estado-onboarding` Card de estado de onboarding en Inicio | L2 | errores, autonomía | dashboard/page.tsx:51, :61 -> OnboardingStatusCard.tsx:17-26 (onboardingTask por org) -> render :44-104. |
| `h2.cli-inicio.estimacion-plata` Estimación de plata por ticket promedio | L3 | — | MoneyEstimate.tsx:36-53 → business-profile.actions.ts:22-40 (resolveOrgId, Zod, update) → home-metrics-logic.ts:93-96; título engañoso como UX aparte. |
| `h2.cli-inicio.health-score` Health Score | L1 | permisos y tenant, errores, Sentry, sin mocks ni TODO | health-score.ts:86-87 deriva el nivel de dataConnections, que nadie escribe → level ONBOARDING para toda org → HealthScore.tsx:31-33 siempre muestra 'Estamos calibrando tu score'; el score real nunca se ve. |
| `h2.cli-inicio.ideas-para-crecer` Ideas para crecer | L2 | permisos y tenant, Sentry, sin mocks ni TODO | dashboard/page.tsx:78-80,238-248 → get-recommendations-for-org.ts:29-64 → rules.ts:175-218 → Recommendations.tsx:78-101 → upsell.ts → Mensajes. |
| `h2.cli-inicio.origen-leads` De dónde llegan | L3 | — | home-metrics.ts:105-115, :126-132 → home-metrics-logic.ts:149-178 (suma preservada) → LeadOrigins.tsx:16-59. |
| `h2.cli-inicio.resultados-de-la-semana` Resultados de la semana | L2 | permisos y tenant, errores, Sentry, sin mocks ni TODO | page.tsx:182-185 -> week-results.ts:26-105. |
| `h2.cli-inicio.resultados-del-negocio` Resultados del negocio | L2 | errores | page.tsx:110-138 -> home-metrics.ts:96-118 org-scoped; no L3 por manejo de errores. |
| `h2.cli-inicio.resultados-semana` Resultados de la semana | L1 | permisos y tenant, vacíos, errores, Sentry, sin mocks ni TODO | page.tsx:182-185 → week-results.ts:18-105 → WeekResultsGrid.tsx:21-88: visitas hardcodeadas (:41-42), leads de otros tenants (:43-52); solo mensajes y tareas son de la org. |
| `h2.cli-inicio.resumen-ejecutivo-ia` Resumen ejecutivo IA | L2 | errores, Sentry, sin mocks ni TODO | page.tsx:187-212; AIExecutiveBriefV2.tsx:33-47 -> regenerate-brief.ts:9-26 -> executive-brief.ts:137-220. |
| `h2.cli-inicio.resumen-ia` Resumen ejecutivo IA | L2 | Sentry, sin mocks ni TODO | Camino trazado por lectura: page.tsx:187-212 → executive-brief.ts:52-135 → :272-309 (Vertex) → AIExecutiveBriefV2; regen regenerate-brief.ts:9-26 → executive-brief.ts:137-221. En runtime hoy cae a BriefEmptyState por la credencial Vertex vencida (requiere veri |
| `h2.cli-inicio.semana-en-numeros` Tu semana en números | L2 | sin mocks ni TODO | Camino trazado: page.tsx:51 resolveOrgId → :123 getHomeBusinessMetrics → home-metrics.ts:96-118 (ChatbotLead por botConfig.organizationId) → BusinessHero.tsx:67-74, :94-149, :163-179. No llega a L3 por el delta que compara semana parcial contra completa (home- |
| `h2.cli-inicio.ticket-promedio` Ticket promedio para estimar ingresos | L3 | — | MoneyEstimate.tsx:43-52 -> business-profile.actions.ts:22-40 -> organization.averageTicketUsd. |

### h2.cli-proyecto — Mi proyecto

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 4 funcionalidades: 1×L3, 3×L2).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, mobile, sin mocks ni TODO, permisos y tenant.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-proyecto.aprobacion-entregas` Aprobar o pedir cambios en entregas | L2 | permisos y tenant, Sentry | ProjectTaskTabs.tsx:160-162 -> TaskApprovalButtons.tsx:14-37 -> dashboard-actions.ts:12-95/:97-186 (ownership :35/:123). |
| `h2.cli-proyecto.aprobar-o-pedir-cambios` Aprobar o pedir cambios en entregas | L2 | Sentry | TaskApprovalButtons.tsx:14-37 -> dashboard-actions.ts:12-186 con confirmacion (:44-79). |
| `h2.cli-proyecto.tablero-del-proyecto` Tablero del proyecto | L3 | — | project/page.tsx:131-356 org-scoped; cumple los nueve (deuda: cuid en ?p=). |
| `h2.cli-proyecto.tareas-por-estado` Tareas del proyecto por estado y progreso | L2 | mobile, sin mocks ni TODO | project/page.tsx:131-135, :186-206 -> ProjectTaskTabs.tsx:172-297; vacio ProjectEmptyState.tsx:18-44. |

### h2.cli-resultados — Resultados

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 13 funcionalidades: 1×L1, 12×L2).
- Criterios de L3 que faltan en alguna funcionalidad: vacíos, errores, Sentry, sin mocks ni TODO, autonomía, permisos y tenant, carga, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-resultados.analisis-mensual` Analisis mensual del negocio | L2 | errores, Sentry, sin mocks ni TODO | analisis/page.tsx:32-33,60 -> getMonthlyAnalysisForOrg.ts:48-106 -> monthly-analysis.ts:63-209 |
| `h2.cli-resultados.informe-mensual-pdf` Descargar el informe del mes en PDF | L2 | Sentry, sin mocks ni TODO | analisis/page.tsx:45 → DownloadMonthlyReportButton.tsx:18-35 → client-monthly/route.ts:24-56 → get-client-monthly-report-data.ts:20-76 → monthly-report-data.ts:73-97 → ClientMonthlyReportPdf.tsx:287-318. |
| `h2.cli-resultados.informe-pdf` Descargar informe del mes | L2 | vacíos, Sentry, sin mocks ni TODO | DownloadMonthlyReportButton.tsx:18-41 → api/reports/client-monthly/route.ts:24-56 (org de sesión, gate de plan, renderToBuffer). |
| `h2.cli-resultados.insights-ia` Insights de tráfico y SEO con IA | L2 | errores, Sentry | resultados/trafico/page.tsx:168 → getTrafficInsights (results-insights.ts:34-42) → generateTrafficInsights (:54-106) → parseInsights (:176-182) |
| `h2.cli-resultados.oportunidades-seo` Oportunidades SEO con pedido al equipo | L2 | permisos y tenant, errores, Sentry, sin mocks ni TODO | seo/page.tsx:319-321 -> OportunidadesSEO.tsx:10-56 -> OportunidadSEO.tsx:83-97 -> messages.ts:114-140. |
| `h2.cli-resultados.pagespeed` Velocidad del sitio (PageSpeed) | L2 | vacíos, errores, Sentry, autonomía | siteUrl lo carga el admin (updateClient.ts:95; createClientOnly.ts:84) → trafico/page.tsx:99-101 → PageSpeedSection (:125-136) → getPageSpeedReport (pagespeed.ts:26-35, caché 6 h) → PageSpeedCard. Requiere GOOGLE_PAGESPEED_API_KEY (pagespeed.ts:41-45). |
| `h2.cli-resultados.reputacion-gbp` Reputación en Google | L2 | errores, Sentry, sin mocks ni TODO | reputacion/page.tsx:15-34 → getGBPMetrics(org) → GBPMetricsCard.tsx:37-178. |
| `h2.cli-resultados.seo` Metricas SEO (Search Console) | L2 | Sentry, sin mocks ni TODO | seo/page.tsx:100 resolveOrgId -> :179 getSearchConsoleData -> :230-270 cards con TrendBadge -> SeoAlertas.tsx:9-44. |
| `h2.cli-resultados.seo-search-console` SEO & Posicionamiento (Search Console) | L2 | errores, Sentry, sin mocks ni TODO, autonomía | siteUrl (admin) → seo/page.tsx:103-108, :150-152 → getSearchConsoleData (searchconsole.ts:99-210, datos reales si la service account tiene acceso) → métricas y tablas (:223-342). Sin credenciales o con error → mock con PreviewBanner (:226). |
| `h2.cli-resultados.seo-solicitar-activacion` Pedir SEO avanzado (ACTIVAR AHORA) | L2 | permisos y tenant, errores, carga, validación en servidor, Sentry, autonomía | form (seo/page.tsx:137-141) → activarSeo (:110-113) → requestUpsellAction (upsell.ts:10-156) → contactSubmission.create (:88-97), webhook (:99-104), notificaciones (:112-135). |
| `h2.cli-resultados.trafico` Metricas de trafico (GA4) | L2 | vacíos, errores, Sentry, sin mocks ni TODO, autonomía | trafico/page.tsx:48 -> :147 getAnalyticsData -> :186-241 AnalyticsMetricCard -> TrendBadge; Suspense con AnalyticsSkeleton (:89-94). Datos de mentira (trends fijos) impiden L3. |
| `h2.cli-resultados.trafico-ga4` Tráfico & Analytics (GA4) | L1 | vacíos, errores, Sentry, sin mocks ni TODO, autonomía | Ningún flujo vivo escribe Organization.analyticsPropertyId (git grep: solo complete-onboarding.ts:38, inalcanzable, y lib/actions/clients.ts:161-197, sin importadores). Un cliente real ve siempre AnalyticsEmptyState (trafico/page.tsx:82-86) con CTA muerto (:11 |
| `h2.cli-resultados.velocidad-sitio` Velocidad del sitio (PageSpeed) | L2 | vacíos, errores, Sentry | trafico/page.tsx:125-136 → pagespeed.ts:26-35 (cache 6 h) → PageSpeedCard.tsx:176-250. |

### [FAL-010] Tráfico (GA4) sin camino de activación: nadie escribe analyticsPropertyId y el CTA no hace nada
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/dashboard/resultados/trafico/page.tsx:115` — «<button type="button" className={resultEmptyCtaCls}> ACTIVAR AHORA»; `src/app/bienvenida/_actions/complete-onboarding.ts:38` — «analyticsPropertyId: parsed.data.ga4MeasurementId,»; `src/app/bienvenida/_components/Step2Conexiones.tsx:38` — «ID de medición (formato G-XXXXXXX)»; `src/lib/analytics.ts:66` — «if (/^G-|^GA-/i.test(trimmed)) {»; `src/app/(protected)/dashboard/resultados/trafico/page.tsx:158` — «<p className="mt-1 text-xs text-amber-400/70">{result.error}</p>»; `src/lib/actions/clients.ts:161` — «const analyticsPropertyId =»; `src/components/dashboard/PreviewBanner.tsx:14` — «develOP se encarga de la activación en tu primera semana.»
- Impacto: Ningún cliente real puede ver su tráfico: el único escritor vivo-en-código es /bienvenida (inalcanzable) y el otro está en lib/actions/clients.ts, sin importadores; el admin no tiene campo para cargarlo. El tab muestra siempre «Activá el seguimiento profesional» con un botón sin handler, mientras el banner promete activación «en tu primera semana». Si se reactivara /bienvenida, el paso 2 pide el Measurement ID (G-…) que analytics.ts rechaza y el tab mostraría el mensaje técnico de result.error. Medición de la hipótesis de Valentino: en Resultados no faltan pantallas sino la plomería de activación y datos.
- Propuesta: Campo «GA4 Property ID» numérico con validación en la edición de cliente del admin (updateClient.ts), acceso de la service account a la propiedad, cablear el CTA (requestUpsellAction como en SEO o Link a Mensajes), corregir o borrar el paso 2 de /bienvenida y no renderizar result.error.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-045], [BUG-035], [DEU-023]
- Nodo(s): h2.cli-resultados.trafico-ga4, h2.cli-bienvenida.wizard-3-pasos, int.google-analytics, h4.adm-clientes, modelo.Organization

### [FAL-011] Reputación: la conexión con Google Business Profile no tiene entrada en ninguna UI
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/auth/google-business/start/route.ts:7` — «if (!session?.user || session.user.role !== 'SUPER_ADMIN') {»; `src/app/api/auth/google-business/start/route.ts:12` — «const orgId = searchParams.get('orgId')»; `src/app/(protected)/dashboard/resultados/reputacion/page.tsx:52` — «Setup manual por ahora»
- Impacto: La pestaña queda vacía para todo cliente salvo que alguien de develOP arme a mano /api/auth/google-business/start?orgId=<cuid> (git grep 'google-business/start' → 0 enlaces; tiendanube/start sí está enlazado en ConnectStoreCard.tsx:39). El Motor de reseñas depende de los mismos tokens.
- Propuesta: Botón «Conectar Google Business» en la ficha del cliente del admin (el state firmado ya existe en getAuthUrl).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [UX-015]
- Nodo(s): h2.cli-resultados.reputacion-gbp, h4.adm-clientes, int.google-business-profile, h2.cli-resenas

### h2.cli-servicios — Mis servicios y módulos

- Madurez de la herramienta: **L0** (la de su funcionalidad más floja; 7 funcionalidades: 6×L2, 1×L0).
- Criterios de L3 que faltan en alguna funcionalidad: sin mocks ni TODO, autonomía, permisos y tenant, vacíos, validación en servidor, Sentry, errores, mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-servicios.activacion-modulo-premium` Activación de un módulo contratado | L0 | autonomía | No existe camino: activateModule (premium-modules.ts:103) sin llamadores; ToggleModulePremiumSchema (client.schemas.ts:15) sin acción; único escritor upsell.ts:57-71 crea INACTIVE. |
| `h2.cli-servicios.avisame-cuando-este` Avisame cuando esté (demanda de módulos) | L2 | permisos y tenant, mobile, Sentry, sin mocks ni TODO | PremiumModuleCard.tsx:200-216 → upsell.ts:45-71 OrganizationModule upsert → :81-97 dedup (dedup.ts:33-40) y ContactSubmission → :99-139 alerta y notificaciones. |
| `h2.cli-servicios.catalogo-y-detalle` Catalogo de modulos y modal de detalle | L2 | sin mocks ni TODO, autonomía | services/page.tsx:169-186, :266-353 -> PremiumModuleCard.tsx:174-441 -> ServiceDetailModal.tsx:53-234 (portal, foco, Esc). |
| `h2.cli-servicios.servicios-contratados` Servicios contratados | L2 | sin mocks ni TODO, autonomía | services/page.tsx:168-176 resolveOrgId + service.findMany por org → ServiceCard (:84-166, :242-250). |
| `h2.cli-servicios.solicitar-modulo` Solicitar un módulo premium | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | PremiumModuleCard.tsx:206 / LockedView.tsx:68 → upsell.ts:10-156 (fila INACTIVE + ContactSubmission + alertas). |
| `h2.cli-servicios.vitrina-de-modulos` Vitrina de módulos premium | L2 | mobile, sin mocks ni TODO, autonomía | services/page.tsx:169-196 (resolveOrgId, catálogo y módulos de la org) → showroom.ts:58-74 → PremiumModuleCard. |
| `h2.cli-servicios.vitrina-modulos` Vitrina de módulos premium | L2 | permisos y tenant, vacíos, validación en servidor, Sentry, sin mocks ni TODO, autonomía | services/page.tsx:177-196 → buildShowroom (showroom.ts:58-74) → PremiumModuleCard → submitInterest (:201-227) → requestUpsellAction → window.location.assign a Mensajes (:215). |

### [FAL-005] Activar, pausar o cancelar un módulo premium no tiene camino en la app y el precio congelado (priceLockedUsd) solo lo lee una suma, no la facturación
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/premium-modules.ts:103` — «export async function activateModule(»; `src/lib/premium-modules.ts:127` — «update: { status: 'ACTIVE', pausedAt: null,»; `src/lib/actions/upsell.ts:66` — «status: 'INACTIVE', priceLockedUsd: 0,»; `prisma/schema.prisma:1195` — «status OrganizationModuleStatus @default(ACTIVE) activatedAt DateTime @default(now())»; `src/lib/billing/get-current-plan.ts:92` — «priceMonthlyUsd: om.module.priceMonthlyUsd ?? 0,»; `src/components/dashboard/CurrentPlanCard.tsx:147` — «Activo desde {formatDate(moduleData.activatedAt)}»; `src/lib/data/onboarding-tasks.ts:37` — «'Activar los OrganizationModule según lo que pagó el cliente. Ej: Motor de Reseñas si lo contrató.',»; `src/app/(protected)/admin/clients/_actions/client.schemas.ts:15` — «export const ToggleModulePremiumSchema = z.object({»; `src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:20` — «const isActive = await isModuleActive(organizationId, 'email-marketing') if (!isActive) redirect('/dashboard')»
- Impacto: Bloqueante para el primer cliente que compre un módulo: develOP no puede activarlo, pausarlo ni cancelarlo desde el admin (activateModule y cancelModule no tienen llamadores, PAUSED no lo escribe nadie); hay que editar organization_module a mano en la Neon compartida. La única fila que existe es la del pedido de upsell (INACTIVE, priceLockedUsd 0, activatedAt = fecha del pedido): si se activa esa fila (a mano o con activateModule tal como está, que no toca precio ni fecha), queda con precio congelado 0 y el portal muestra 'Activo desde' la fecha del pedido. Como el portal muestra el precio vivo del catálogo y no priceLockedUsd, subir un precio en /admin/settings cambia lo que ve un cliente que ya contrató. El default ACTIVE del schema activaría gratis cualquier alta futura que olvide el status.
- Propuesta: Exponer en /admin/clients/<id> una action con requireSuperAdmin y Zod que active, pause o cancele, usando activateModule corregido (en el update setear priceLockedUsd del catálogo y activatedAt al pasar de INACTIVE/CANCELLED a ACTIVE, y pausedAt al pausar); leer priceLockedUsd en get-current-plan. Decisión para Valentino (schema FROZEN): default INACTIVE en OrganizationModule.status.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-servicios, h2.cli-plan, h4.adm-clientes, modelo.OrganizationModule, modelo.PremiumModule, lib.actions, lib.premium-modules

### h2.cli-mensajes — Mensajes

- Madurez de la herramienta: **L?** (la de su funcionalidad más floja; 6 funcionalidades: 5×L2, 1×L?).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, sin mocks ni TODO, permisos y tenant, mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-mensajes.aviso-por-email` Aviso por email de mensaje nuevo | L? | errores, Sentry, sin mocks ni TODO | admin-message-notification.ts -> notify-message.ts:11-66: el camino feliz depende de la verificacion del dominio en Resend, no trazable por lectura. |
| `h2.cli-mensajes.chat-con-equipo` Chat con el equipo develOP | L2 | permisos y tenant, Sentry, sin mocks ni TODO | messages/page.tsx:12-31 -> MessageThread.tsx:50-188 -> ClientChatComposer.tsx:92-126 -> messages.ts:114-140. |
| `h2.cli-mensajes.conversacion` Conversacion con develOP | L2 | errores, Sentry, sin mocks ni TODO | messages/page.tsx:11-35 -> MessageThread.tsx:51 -> messages.ts:114-140. |
| `h2.cli-mensajes.enviar-mensaje` Enviar mensaje a develOP | L2 | mobile, Sentry, sin mocks ni TODO | MessageThread.tsx:51 → messages.ts:114-208 → message.create :134-140. |
| `h2.cli-mensajes.mensaje-precargado` Mensaje precargado por contexto | L2 | — | MessageThread.tsx:72-88 lee context/moduleName -> message-context.ts:54-63 -> setInputValue; respuestas rápidas en MessageThread.tsx:173. El envío lo hace la action de mensajes (fuera del lote). |
| `h2.cli-mensajes.no-leidos-al-abrir` Badge de no leidos que se limpia al abrir | L2 | permisos y tenant, errores, Sentry | MarkReadOnMount.tsx:13-17 -> mark-read.ts:11-22. |

### h2.cli-soporte — Soporte

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 5 funcionalidades: 5×L2).
- Criterios de L3 que faltan en alguna funcionalidad: sin mocks ni TODO, autonomía, mobile, Sentry, validación en servidor, errores.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-soporte.conversacion-ticket` Ver y responder un ticket | L2 | mobile, Sentry, sin mocks ni TODO | soporte/[ticketId]/page.tsx:54-70 -> ClientChatThread + TicketReplyForm.tsx:14-35 -> tickets/actions.ts:110-176. |
| `h2.cli-soporte.crear-ticket` Crear ticket de soporte | L2 | validación en servidor, mobile, Sentry, sin mocks ni TODO | soporte/page.tsx:73 → NewTicketModal.tsx:38-55 → actions.ts:49-61 (sesión, org, Zod) → :64-86 create con mensaje → :98-99 ok → NewTicketModal.tsx:59-63 navega al detalle (soporte/[ticketId]/page.tsx:60-62). |
| `h2.cli-soporte.resolver-ticket` Marcar ticket como resuelto | L2 | errores, validación en servidor, Sentry, autonomía | soporte/[ticketId]/page.tsx:150-153 → ResolveTicketButton.tsx:12-17 → actions.ts:205-216 update por id + org → router.refresh. |
| `h2.cli-soporte.responder-ticket` Responder un ticket | L2 | mobile, Sentry, sin mocks ni TODO, autonomía | soporte/[ticketId]/page.tsx:187 → TicketReplyForm.tsx:16-20 → actions.ts:117-137 (sesión + assertTicketBelongsToOrg) → :140-148 create → :170-171 revalidate; ClientChatComposer.tsx:84-86 muestra errores. |
| `h2.cli-soporte.tablero-tickets` Tablero de tickets (3 columnas) | L2 | sin mocks ni TODO, autonomía | soporte/page.tsx:14-54 -> SoporteBoard.tsx:246-354. |

### [FAL-012] Los recursos de autogestion de Soporte (Guia, FAQ, Tips) son botones sin accion
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/SoporteBoard.tsx:331` — «<button key={item.label} className={'group flex items-center gap-3 rounded-2xl ...»; `src/components/dashboard/SoporteBoard.tsx:313` — «label: 'Guía del Usuario',»
- Impacto: El cliente que busca resolver solo hace clic en 'Guia del Usuario', 'Preguntas Frecuentes' o 'Tips de Optimizacion' y no pasa nada (los unicos onClick del archivo son :180 y :231). Maqueta en el camino del cliente que rompe el criterio de autonomia.
- Propuesta: Conectarlos a contenido real (pagina de ayuda/FAQ) o retirarlos hasta tenerlo; no dejar controles inertes.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-soporte, h2.cli-soporte.tablero-tickets

### [FAL-014] 'develOP será notificado de inmediato' es falso: ni la respuesta del cliente ni los tickets de prioridad baja o media avisan
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/TicketReplyForm.tsx:32` — «helperText="El equipo de develOP será notificado de inmediato. Respuesta asíncrona estándar en menos de 24hs."»; `src/lib/tickets/actions.ts:126` — «if (!isAdmin) { const organizationId = await resolveOrgId() (luego solo ticketMessage.create :140, sin alerta ni Notification)»; `src/lib/tickets/actions.ts:88` — «if (parsed.data.priority === 'HIGH' || parsed.data.priority === 'URGENT') {»; `src/lib/alerts.ts:125` — «const webhookUrl = settings?.alertWebhookUrl?.trim() if (!webhookUrl) return»
- Impacto: Un cliente que responde un ticket o abre uno de prioridad baja o media queda esperando sin que nadie en develOP se entere (solo el contador del dashboard admin, admin/page.tsx:239). Para el primer cliente real: tickets sin respuesta con una promesa de '< 4h' en pantalla.
- Propuesta: Crear una Notification para SUPER_ADMIN (y la alerta) en createTicketAction para todas las prioridades y en la rama cliente de replyToTicketAction; o cambiar el copy hasta tenerlo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-soporte, h2.cli-soporte.responder-ticket, h4.adm-tickets, int.alert-webhook, modelo.Ticket, modelo.Notification

### [FAL-015] Los errores del portal no llegan a Sentry: actions, Inicio y módulos solo hacen console.error o dejan una fila FAILED
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/lib/tickets/actions.ts:101` — «console.error('createTicketAction error:', error) (idem :173, :196, :219)»; `src/lib/reports/executive-weekly/send.ts:207` — «result.failed++ result.errors.push({ organizationId: orgId, message })»; `src/lib/referrals/referrals.service.ts:167` — «console.error('[referrals] notificación admin falló:', error)»; `src/app/api/reports/client-monthly/route.ts:58` — «console.error('[client-monthly-report] PDF generation error', error)»; `src/lib/ai/executive-brief.ts:128` — «console.error('[Brief] Generation failed:', err)»; `src/lib/actions/upsell.ts:153` — «console.error('requestUpsellAction error:', error)»; `src/lib/actions/messages.ts:205` — «console.error('sendClientMessageAction error:', error)»; `src/lib/actions/notifications.ts:90` — «console.error('getMyNotificationsAction error:', error)»; `src/app/(protected)/dashboard/page.tsx:244` — «console.error('[Recommendations] Server wrapper failed:', err)»
- Impacto: Un reporte que falla para todas las orgs, un PDF que no se genera o un ticket que no se guarda quedan invisibles salvo para quien lea los logs de la función. Bloquea el criterio Sentry de L3 en Soporte, Reportes, Referidos e Informe PDF.
- Propuesta: captureException en esos catch (o captureConsoleIntegration) y una alerta cuando el cron termine con failed > 0.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [FAL-003], [BUG-041]
- Nodo(s): int.sentry, h2.cli-soporte, h2.cli-reportes-email, h2.cli-referidos, h2.cli-resultados.informe-mensual-pdf, lib.actions, lib.ai, lib.dashboard

### h2.cli-plan — Mi plan

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 7 funcionalidades: 3×L3, 4×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, Sentry, validación en servidor, autonomía, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-plan.activacion-bot` Pedido de activación del vendedor virtual | L2 | errores, validación en servidor, Sentry, autonomía | UsageMeter.tsx:118-123 → UpgradeCtaButton.tsx:80-101 → upsell.ts; el destino no tiene prefill (message-context.ts sin 'bot-activation'). |
| `h2.cli-plan.consumo-y-planes` Consumo del plan y planes | L3 | — | plan/page.tsx:12-46 -> get-org-usage.ts:50-85 -> UsageMeter/PlansShowcase. |
| `h2.cli-plan.medidor-consumo` Medidor de clientes atendidos | L3 | — | plan/page.tsx:36-39 y page.tsx:163-166 → get-org-usage.ts:49-85 (botConfig por organizationId, QuotaUsage) → UsageMeter.tsx:75-233. Período en UTC (PLAN-084) como salvedad. |
| `h2.cli-plan.medidor-de-consumo` Medidor de consumo del mes | L3 | — | plan/page.tsx:13,36-38 → get-org-usage.ts:49-85 (QuotaUsage del bot de la org) → get-plan-for-org.ts:68-125 → UsageMeter (estado sin bot :79-95; mensajes plan-presentation.ts:240-278). |
| `h2.cli-plan.pedir-cambio-de-plan` Pedir upgrade de plan | L2 | permisos y tenant, errores, Sentry | PlansShowcase.tsx:213-243 -> UpgradeCtaButton.tsx:88-100 -> upsell.ts:10-140 -> window.location.assign. |
| `h2.cli-plan.planes-y-upgrade` Planes y pedido de upgrade | L2 | errores, validación en servidor, Sentry, autonomía | plan/page.tsx:41-46 → PlansShowcase.tsx:45-81 → UpgradeCtaButton.tsx:84-101 → upsell.ts:10-156 → window.location.assign. |
| `h2.cli-plan.vitrina-de-planes-y-upgrade` Vitrina de planes y pedido de upgrade | L2 | permisos y tenant, errores, Sentry, sin mocks ni TODO, autonomía | plan/page.tsx:41-46 → PlansShowcase (plan-presentation.ts:144-196) → UpgradeCtaButton.tsx:80-100 → upsell.ts:10-155 → /dashboard/messages?context=plan-upgrade-*. |

### [FAL-006] La facturación no tiene escritor: ninguna pantalla crea ni cambia Invoice, Subscription.status nunca sale de ACTIVE y renewalDate no se escribe, pero el portal, las alertas, el MRR y el health score los leen
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/_actions/plan.actions.ts:187` — «await prisma.subscription.create({ data: { organizationId,»; `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx:70` — «prisma.invoice.findMany({ where: { organizationId },»; `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx:118` — «Tu suscripción está vencida.{' '}»; `src/components/dashboard/SubscriptionBanner.tsx:8` — «if (!subscription || subscription.status !== 'PAST_DUE') {»; `src/lib/alerts.ts:244` — «renewalDate: { gte: today,»; `src/app/(protected)/admin/page.tsx:222` — «prisma.subscription.aggregate({ where: { status: SubscriptionStatus.ACTIVE,»; `src/lib/plan/get-plan-for-org.ts:98` — «const plan = sub?.plan»; `src/lib/health-score.ts:442` — «if (sub.status === 'PAST_DUE') return 30»; `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx:164` — «Tus facturas apareceran aca automaticamente cada mes.»; `prisma/seed.ts:595` — «await prisma.invoice.upsert({ // unico escritor de Invoice junto con :618»; `prisma/schema.prisma:96` — «enum AssetType { // DOCUMENT IMAGE BRANDBOOK LOGO ACCESS OTHER, sin INVOICE»; `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx:106` — «const billingEmail = session?.user?.email ?? '' // en soporte muestra el email del admin»
- Impacto: Para el primer cliente: el historial de pagos de /dashboard/cuenta/facturacion queda vacío para siempre (Invoice solo la escribe prisma/seed.ts), nunca ve 'Pago pendiente' ni el aviso de vencimiento, y si deja de pagar sigue ACTIVE: el MRR y el conteo de clientes activos del admin lo incluyen, el health score no baja, la alerta SUBSCRIPTION_EXPIRING no puede disparar (renewalDate null en toda alta hecha desde la app) y el bot conserva el plan completo porque getPlanForOrg no mira status. Las suscripciones del seed traen renewalDate a 30 días: pasada esa fecha la org demo ve 'Tu suscripción está vencida' sin forma de salir.
- Propuesta: Decidir dónde vive la facturación: si es externa, ocultar el historial y los avisos que dependen de Invoice/status/renewalDate y sacarlos del MRR; si es interna, agregar en el admin alta de Invoice, marcar pagada (paidAt) y las transiciones de Subscription (ACTIVE, PAST_DUE, CANCELED con renewalDate), y que getPlanForOrg caiga al plan de respaldo con CANCELED.
- Esfuerzo: L  ·  Zona: libre
- Relacionado: [BUG-010]
- Nodo(s): h2.cli-plan, h4.adm-clientes, h4.adm-dashboard, modelo.Invoice, modelo.Subscription, lib.plan, h2.cli-cuenta.historial-de-facturas

### h2.cli-referidos — Recomendá y ganá

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 4 funcionalidades: 3×L2, 1×L3).
- Criterios de L3 que faltan en alguna funcionalidad: errores, carga, Sentry, mobile, permisos y tenant, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-referidos.codigo-referido` Código de referido | L2 | mobile, Sentry | referidos/page.tsx:26-33 → ReferralPanel.tsx:40-51 → referrals.ts:12-28 → referrals.service.ts getOrCreateReferralCodeForOrg. |
| `h2.cli-referidos.codigo-y-link` Código y link de referido | L2 | permisos y tenant, mobile, Sentry, sin mocks ni TODO | referidos/page.tsx:26-35 → ReferralPanel.tsx:32-45 → referrals.ts:12-27 → referrals.service.ts:28-61 → code.ts:23-32. |
| `h2.cli-referidos.lista-de-referidos` Lista y estado de referidos | L3 | — | referidos/page.tsx:29-33 → referrals.service.ts:64-76 → render :48-80 con vacío :59-64. |
| `h2.cli-referidos.programa-de-referidos` Programa de referidos | L2 | errores, carga, Sentry | referidos/page.tsx:26-35 -> referrals.service.ts; ReferralPanel.tsx:43 -> referrals.ts:12-28. |

### h2.cli-cuenta — Mi cuenta

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 12 funcionalidades: 10×L2, 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: mobile, sin mocks ni TODO, permisos y tenant, errores, Sentry, autonomía, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-cuenta.boveda` Bóveda de recursos y accesos | L2 | mobile, sin mocks ni TODO | boveda/page.tsx:63-69 (clientAsset por organizationId) → resolveCredentialDisplay → VaultRevealButton.tsx:15-147; datos inventados en la misma pantalla. |
| `h2.cli-cuenta.boveda-solicitar-documento` Solicitar documento a la boveda | L2 | permisos y tenant, Sentry | boveda/page.tsx:63-67 -> VaultRequestModal.tsx:35-52 -> messages.ts:114-140. |
| `h2.cli-cuenta.cambiar-password` Cambiar contrasena desde el perfil | L2 | Sentry, autonomía | ProfileForms.tsx:359-397 -> profile.ts:187-246 (Zod, bcrypt, sessionVersion, unstable_update) -> router.refresh. |
| `h2.cli-cuenta.eliminar-cuenta` Solicitar eliminacion de cuenta | L2 | permisos y tenant, Sentry, sin mocks ni TODO, autonomía | ProfileForms.tsx:689-704 (confirmacion :752-786) -> profile.ts:150-177 -> admin ticket-chat.tsx:119, :224-246. |
| `h2.cli-cuenta.facturacion-plan-actual` Plan actual en Facturación | L2 | mobile, sin mocks ni TODO | facturacion/page.tsx:60-75 → get-current-plan.ts:37-99 → CurrentPlanCard.tsx:173-196. |
| `h2.cli-cuenta.historial-de-facturas` Historial de pagos y facturas | L1 | sin mocks ni TODO, autonomía | La tabla existe (facturacion/page.tsx:157-272) pero Invoice nunca se genera fuera del seed (prisma/seed.ts:595, :618). |
| `h2.cli-cuenta.perfil` Perfil, seguridad y notificaciones | L2 | permisos y tenant, errores, Sentry | perfil/page.tsx:73-337; soporte solo lectura (:107-154); actions de ProfileForms en lib/actions/profile.ts. |
| `h2.cli-cuenta.perfil-empresa` Datos de empresa, avatar y contacto | L2 | permisos y tenant, errores, validación en servidor, Sentry | perfil/page.tsx:74-81 -> ProfileForms.tsx:208-327 -> profile.ts:24-101. |
| `h2.cli-cuenta.plan-actual` Plan actual y facturacion resumida | L2 | sin mocks ni TODO | facturacion/page.tsx:61-74, :147 -> getCurrentPlan (get-current-plan.ts:37-97, por organizationId :40-41, :53-54) -> CurrentPlanCard.tsx:52-203; PlanInfoSection ProfileForms.tsx:620-685. |
| `h2.cli-cuenta.plan-y-precio` Ver plan y precio en el perfil | L2 | mobile, sin mocks ni TODO | Camino feliz: perfil/page.tsx:74 resolveOrgId → :80-101 select de subscription.plan.name y price → :208-216 serializa → ProfileForms.tsx:620-662 renderiza. Es correcto hasta el primer cambio de plan: el precio queda viejo (plan.actions.ts:179-200, get-plan-for |
| `h2.cli-cuenta.plan-y-renovacion` Plan actual y renovacion | L2 | sin mocks ni TODO, autonomía | facturacion/page.tsx:60-138, :278-334. |
| `h2.cli-cuenta.preferencias-notificacion` Preferencias de notificacion | L1 | permisos y tenant, errores, Sentry, sin mocks ni TODO, autonomía | Se guarda (ProfileForms.tsx:571-608 -> profile.ts:103-148) pero 4 de 5 claves no tienen lector fuera de perfil (git grep); solo emailNotificationsOnMessage se respeta (notify-message.ts:40). |

### [FAL-009] La Bóveda le muestra al cliente seguridad que no existe: sello «AES-256» sobre credenciales en claro, un «Registro de integridad y accesos» inventado, «Monitoreo activo» y una retención de 30 días
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:85` — «AES-256»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:148` — «AES-256»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:51` — «// Demo activity log (PLACEHOLDER — data fake; modelo real = schema, parada aparte)»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:54` — «{ icon: User, actor: 'Vos', action: 'accediste a', resource: 'Credenciales de Dominio', time: 'hace 2 h', isAdmin: false },»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:265` — «Monitoreo activo»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:320` — «Los registros de acceso se mantienen por 30 días para tu auditoría personal.»
- Impacto: El cliente lee accesos que nunca ocurrieron sobre sus credenciales y garantias de auditoria inexistentes; incumple 'sin datos de mentira' de L3.
- Propuesta: Decision para Valentino: ocultar la seccion hasta tener un modelo real de accesos, o implementarlo (modelo + escritura en cada reveal/descarga).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-036]
- Nodo(s): h2.cli-cuenta.boveda

### [FAL-013] Cuatro de las cinco preferencias de notificacion del perfil no tienen efecto
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/profile.ts:123` — «const organizationPrefs = { projectUpdates: prefs.projectUpdates, teamMessages: prefs.teamMessages,»; `src/components/dashboard/ProfileForms.tsx:560` — «key: 'metricAlerts',»; `src/lib/email/notify-message.ts:40` — «if (!member.emailNotificationsOnMessage) {»
- Impacto: El cliente apaga 'Notificaciones de proyecto', 'Mensajes del equipo', 'Alertas de metricas' o 'Novedades de develOP' y nada cambia: Organization.notificationPrefs solo lo lee la propia pagina de perfil (perfil/page.tsx:178-183); los emails de 'Accion requerida' (agency-actions.ts) salen siempre. Configuracion de mentira; si se lanza un newsletter, el opt-out de 'Novedades' no se respetaria.
- Propuesta: Conectar cada preferencia a su emisor o eliminar los toggles sin emisor; agregar un invariante que falle si una clave de NotificationPrefs no tiene lector fuera de la UI.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-cuenta, h2.cli-cuenta.preferencias-notificacion, modelo.Organization

### h2.cli-reportes-email — Reportes por email

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 4 funcionalidades: 2×L2, 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, vacíos, carga, sin mocks ni TODO, autonomía, permisos y tenant, mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-reportes-email.pdf-reporte-ejecutivo` Descarga de reporte ejecutivo en PDF | L1 | vacíos, errores, carga, Sentry, sin mocks ni TODO, autonomía | Maqueta no cableada: DownloadReportButtons (DownloadReportButton.tsx:129) sin importadores y alimentado con mockData (:82-89, :122). |
| `h2.cli-reportes-email.preferencias-del-reporte` Preferencias del reporte semanal | L2 | errores, carga, mobile, Sentry, sin mocks ni TODO | perfil/page.tsx:193-203,297-306 → ExecutiveReportPrefsForm → executive-report-prefs.actions.ts:20-46 → Organization → send.ts:83,114 y build.ts:99,161. |
| `h2.cli-reportes-email.preferencias-reporte` Frecuencia y leads destacados del reporte semanal | L2 | errores, Sentry | perfil/page.tsx:196, :304-309 -> ExecutiveReportPrefsForm.tsx:45-56 -> executive-report-prefs.actions.ts:20-47. |
| `h2.cli-reportes-email.reporte-semanal` Reporte ejecutivo semanal por email | L1 | permisos y tenant, errores, Sentry, sin mocks ni TODO, autonomía | El motor existe (send.ts:73-233, build.ts:64-198) pero no hay disparador en Netlify (netlify.toml:25-32; solo vercel.json:11-14): el cliente no recibe nada salvo envío manual del admin. |

### h2.cli-resenas — Motor de reseñas (módulo)

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 7 funcionalidades: 6×L2, 1×L3).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, Sentry, sin mocks ni TODO, vacíos, errores, validación en servidor, autonomía, mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-resenas.borrador-ia` Borrador de respuesta a reseñas con IA | L2 | errores, validación en servidor, Sentry | motor-resenas/_actions.ts:11-46 → generateReviewReplyDraft (review-reply-draft.ts:5-44) |
| `h2.cli-resenas.estado-conectando` Estado 'conectando tu Google' | L3 | — | ConnectingState.tsx:13-46 via resolveMotorResenasView (motor-resenas-view.ts:38-42). |
| `h2.cli-resenas.pedir-resenas-qr` Pedir resenas con QR y link | L2 | errores, autonomía | AskReviewSection.tsx:42-137 con placeId de la org (page.tsx:161). |
| `h2.cli-resenas.publicar-respuesta` Publicar respuesta en Google | L2 | permisos y tenant, errores, validación en servidor, mobile, Sentry | ReviewItem.tsx:64-79 → _actions.ts:48-73 → google-business-profile.ts:275-305. |
| `h2.cli-resenas.responder-resenas-con-ia` Listar y responder resenas con borrador IA | L2 | vacíos, errores, validación en servidor, Sentry | page.tsx:19-80 -> listReviews; ReviewItem.tsx:46-79 -> motor-resenas/_actions.ts:11-73. |
| `h2.cli-resenas.vista-de-venta` Vista de venta del Motor de resenas | L2 | permisos y tenant, Sentry, sin mocks ni TODO | motor-resenas/page.tsx:120-148 -> LockedView.tsx:63-82 -> upsell.ts:10-140. |
| `h2.cli-resenas.vista-segun-estado` Motor de Reseñas: vista bloqueada, conectando u operativa | L2 | validación en servidor, mobile, sin mocks ni TODO, autonomía | motor-resenas/page.tsx:106-127 (resolveOrgId, isModuleActive, deriveConnectionStatus) → motor-resenas-view.ts:38-42 → LockedView/ConnectingState/ReviewsList (:144-153); acciones con resolveScopedOrgId + isModuleActive (_actions.ts:20-24,55-59). |

### h2.cli-email-mkt — Email marketing (módulo)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 6 funcionalidades: 3×L2, 2×L1, 1×L?).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, validación en servidor, Sentry, autonomía, mobile, vacíos, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-email-mkt.acceso-al-modulo` Acceso al módulo de email marketing | L? | permisos y tenant, validación en servidor, autonomía | El gate pide 'email-marketing' (layout.tsx:20) y el catálogo define 'email-marketing-pro' (premium-modules.ts:38): el camino feliz depende del slug real en la base, no trazable por lectura. |
| `h2.cli-email-mkt.baja-de-contactos` Baja de contactos (opt-out) | L1 | sin mocks ni TODO, autonomía | optout/[contactId]/route.ts:69-104 marca la baja en la base pero los envios van a la lista Brevo completa (brevo.ts:77). |
| `h2.cli-email-mkt.crear-y-enviar-campana` Crear y enviar campana | L2 | permisos y tenant, errores, validación en servidor, mobile, Sentry, autonomía | new/page.tsx:47-73 -> _actions.ts:128-218 -> brevo.ts:60-103; /send con confirmacion (send/page.tsx:46-49). |
| `h2.cli-email-mkt.importar-contactos` Importar contactos por CSV | L2 | permisos y tenant, errores, validación en servidor, Sentry | ImportCSVButton.tsx:14-30 -> _actions.ts:71-126 -> brevo.ts:31-58. |
| `h2.cli-email-mkt.listar-contactos` Listado de contactos | L2 | autonomía | contactos/page.tsx:10-153. |
| `h2.cli-email-mkt.metricas-de-campana` Metricas de campana | L1 | vacíos, mobile, sin mocks ni TODO, autonomía | Los contadores existen en el modelo y la UI (campaigns/page.tsx:102-125) pero nada los escribe (getCampaignStats sin llamadores, brevo.ts:143). |

### [FAL-008] Contactos de email marketing: solo se ven los 50 ultimos, sin paginacion ni baja o borrado manual
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/contactos/page.tsx:18` — «take: 50,»; `src/app/(protected)/dashboard/modules/email-marketing/contactos/page.tsx:74` — «{contacts.length < totalCount ? 'Mostrando ${contacts.length} de ${totalCount}' : ...}»
- Impacto: Con mas de 50 contactos el cliente no puede ver, buscar, dar de baja ni borrar al resto sin pedirselo a develOP.
- Propuesta: Paginacion y busqueda server-side y acciones de baja/borrado por contacto (org de la sesion, Zod).
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt.listar-contactos, modelo.EmailContact

### h2.cli-tienda — Tienda online (módulo)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 2 funcionalidades: 1×L1, 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, Sentry, sin mocks ni TODO, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-tienda.conectar-tienda` Conectar Tiendanube | L1 | permisos y tenant, errores, Sentry, sin mocks ni TODO, autonomía | ConnectStoreCard.tsx:38-54 -> start/route.ts:9-19 rechaza al ORG_MEMBER con 401. |
| `h2.cli-tienda.resumen-de-ventas` Resumen de ventas de Tiendanube | L2 | errores, Sentry, sin mocks ni TODO, autonomía | page.tsx:86-255 -> tiendanube.ts:82-162 (conexion hecha por develOP). |

### h2.cli-agenda — Agenda inteligente (módulo)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 2 funcionalidades: 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: validación en servidor, mobile, autonomía, errores, Sentry.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-agenda.conectar-agenda` Conectar y ver la agenda (Cal.com) | L1 | validación en servidor, mobile, autonomía | La vista conectada existe (agenda-inteligente/page.tsx:344-349) pero ningún código de la app escribe calComApiKey, calComUsername ni calComEmbedUrl (git grep en src, scripts y prisma: solo lecturas). Sin edición manual de la base, el cliente ve siempre 'Tu age |
| `h2.cli-agenda.panel-de-agenda` Panel de agenda (Cal.com) | L1 | errores, mobile, Sentry, autonomía | page.tsx:316-353 -> cal-com.ts:40-111 contra api.cal.com/v1 (apagada segun cal-com-v2.ts:4-5). |

### [FAL-004] Agenda y QR de reseñas sin camino de configuración: calCom* y googleMapsPlaceId no tienen escritor en la app
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:375` — «calComApiKey String? @db.Text»; `prisma/schema.prisma:363` — «googleMapsPlaceId String?»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:42` — «develOP se encarga de configurar tu sistema de reservas con tus horarios, servicios y precios.»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:329` — «const isConnected = Boolean(org.calComApiKey)»; `src/app/(protected)/dashboard/modules/motor-resenas/page.tsx:161` — «<AskReviewSection placeId={org.googleMapsPlaceId} />»
- Impacto: Para activar la agenda o el QR de reseñas del primer cliente alguien tiene que editar la base de prod a mano: no hay formulario ni action, ni en el admin ni en el portal, que escriba esas columnas (git grep en src, scripts y prisma solo encuentra lecturas). Es un paso sin validación ni auditoría y deja la API key de Cal.com en claro. El cliente ve 'Tu agenda en construcción' indefinidamente.
- Propuesta: Agregar en /admin/clients/[clientId] una sección de integraciones con server action (Zod, requireSuperAdmin, logAdminAction) que escriba calComUsername, calComEmbedUrl, calComApiKey (cifrada) y googleMapsPlaceId.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-agenda, h2.cli-resenas, h4.adm-clientes, modelo.Organization, int.calcom

## h3 · Chatbot centralizado

### h3.cli-chatbot — Mi chatbot (cliente)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 31 funcionalidades: 25×L2, 3×L1, 1×L?, 2×L3).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, vacíos, errores, Sentry, mobile, sin mocks ni TODO, autonomía, carga, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.cli-chatbot.acciones-rapidas-de-lead` Acciones de un tap sobre el lead (Lo contacte / Vendido / No avanzo) | L2 | permisos y tenant, errores, Sentry, autonomía | LeadStatusActions.tsx:120-136 -> :92 updateLeadStatus -> updateLeadStatus.ts:18-47 -> :78 revalidatePath; metricas en home-metrics.ts:120-125. |
| `h3.cli-chatbot.acciones-rapidas-lead` Acciones de un tap sobre el contacto | L2 | permisos y tenant, errores, Sentry | LeadStatusActions.tsx:78-115 -> updateLeadStatus.ts:17-94 (seal :40-46, revalidateTag :84-92). |
| `h3.cli-chatbot.activacion-upsell` Landing de activación del chatbot | L1 | sin mocks ni TODO, autonomía | page.tsx:18-22 → ChatbotUpsellLanding con WhatsApp de relleno (ChatbotUpsellLanding.tsx:15,49,156) |
| `h3.cli-chatbot.aviso-lead-email` Aviso de lead por email al dueño | L2 | errores, Sentry, sin mocks ni TODO | captureLead → notify.ts:87-177 → decide.ts:40-75 → templates.ts:123-187 (escapeHtml) → Brevo |
| `h3.cli-chatbot.base-conocimiento` Lo que sabe tu chatbot (KB de solo lectura) | L2 | permisos y tenant, vacíos, autonomía | knowledge/page.tsx:10-21 -> ClientKnowledgeView.tsx:116-180. |
| `h3.cli-chatbot.conocimiento-lectura` Información del bot (KB de solo lectura) | L2 | permisos y tenant, sin mocks ni TODO, autonomía | knowledge/page.tsx:10-21 → ClientKnowledgeView |
| `h3.cli-chatbot.contacto-detalle` Detalle del contacto | L2 | permisos y tenant, errores, Sentry, autonomía | [id]/page.tsx:29-101 -> LeadDetail.tsx:150-542; transcript roto (LeadDetail.tsx:546) y guardado sin chequear resultado (:182-186). |
| `h3.cli-chatbot.contactos-lista` Lista de contactos (pipeline y filtros) | L2 | permisos y tenant, errores | leads/page.tsx:35-59 -> ClientLeadsTable.tsx:90-374 -> LeadPipeline.tsx:29-80 / BusinessLeadCard.tsx:77-252; filtros via URL ClientLeadsTable.tsx:166-182. |
| `h3.cli-chatbot.conversaciones` Conversaciones con transcript | L2 | permisos y tenant | conversations/page.tsx:9-23 -> multiTenantQueries.ts:174-197 -> ConversationsTable.tsx:48-180. |
| `h3.cli-chatbot.conversaciones-transcript` Conversaciones con transcript | L2 | permisos y tenant, Sentry | conversations/page.tsx:9-23 → ConversationsTable → transcript-action.ts:31-56 |
| `h3.cli-chatbot.detalle-de-lead` Ficha del contacto en lenguaje de dueno | L2 | permisos y tenant, errores, mobile | leads/[id]/page.tsx:29-34 -> :39-90 -> LeadDetail.tsx:161-169 (lead-detail-presentation.ts:28-87; lead-intent-labels.ts:44-57) -> :436 senales -> :467-470 vacio -> :182-186 guardar. |
| `h3.cli-chatbot.elegir-avatar` El cliente elige el avatar de su bot | L2 | errores, mobile | dashboard/chatbot/settings/page.tsx:63 -> BotPersonalization.tsx:271-278 -> AvatarPicker.tsx:58-161 onChange -> updateBotAppearance.ts:32 CLIENT_AVATAR_STYLE_SCHEMA (persistencia en otro lote). |
| `h3.cli-chatbot.email-insights` Email de insights nuevos | L2 | errores, mobile, Sentry, sin mocks ni TODO | src/app/api/cron/generate-insights/route.ts:61-66 -> sendInsightsNotification.ts:11-24 -> Brevo. |
| `h3.cli-chatbot.estado-crm` Estado de la integracion CRM | L3 | — | CrmStatusIndicator.tsx:20-31 resolveOrgId + planAllows + forOrg crmIntegration; tres estados :33-138. |
| `h3.cli-chatbot.estado-lead` Cambiar estado y notas de un lead | L2 | permisos y tenant, errores, validación en servidor, Sentry | LeadStatusActions.tsx:92 -> updateLeadStatus.ts:17-21 -> getClientSession.ts:6-25 -> forOrg findFirst :27-30 -> update :42-47 -> revalidatePath :78 |
| `h3.cli-chatbot.export-csv` Exportar leads a CSV | L2 | permisos y tenant, vacíos, errores, Sentry | ExportLeadsButton.tsx:52 → export/route.ts:83-208 (csvEscape, audit) |
| `h3.cli-chatbot.exportar-csv` Exportar contactos a CSV | L? | errores, carga | El boton arma la URL (ExportLeadsButton.tsx:44-64); la route (export/route.ts) es de otro lote y no se re-trazo. |
| `h3.cli-chatbot.exportar-leads-csv` Exportar leads a CSV | L2 | permisos y tenant, vacíos, sin mocks ni TODO | export/route.ts:84 -> :156 -> :166 buildLeadsCsv.ts:132-208 -> csvEscape.ts:25-42. |
| `h3.cli-chatbot.gestionar-insights` Aplicar o descartar insights del bot | L1 | permisos y tenant, vacíos, errores, carga, Sentry, autonomía | La action existe (manageInsight.ts:15-53) pero ninguna UI la llama (git grep actOnInsight: solo index.server.ts:73 e insights/index.ts:2). |
| `h3.cli-chatbot.instalacion` Instalacion del snippet | L2 | permisos y tenant, errores, autonomía | buildEmbedSnippet platforms.ts:26-28 -> SnippetCopyBlock.tsx:28-33; ClientInstallView (otro lote) los consume. |
| `h3.cli-chatbot.lead-detalle` Detalle de lead | L2 | permisos y tenant, mobile, sin mocks ni TODO | leads/[id]/page.tsx:26-102 → getLeadByIdForOrg + getConversationMessagesForOrg → LeadDetail |
| `h3.cli-chatbot.leads-lista-filtros` Leads del bot (pipeline y filtros) | L2 | permisos y tenant | leads/page.tsx:36-125 → listLeadsForDashboard (multiTenantQueries.ts:75-122) → ClientLeadsTable |
| `h3.cli-chatbot.leads-y-conversaciones` Listas de leads y conversaciones del cliente | L2 | errores, Sentry, autonomía | leads/page.tsx:36,56 -> listLeadsForDashboard multiTenantQueries.ts:75-122; conversations/page.tsx:9-12 -> listConversationsByOrgSlug :174-198 |
| `h3.cli-chatbot.personalizacion` Personalizacion del bot | L2 | permisos y tenant, errores, Sentry, autonomía | settings/page.tsx:13-60 -> BotPersonalization.tsx:149-169 -> updateBotAppearance.ts:55-138. Varios campos no llegan al widget instalado. |
| `h3.cli-chatbot.personalizar-apariencia` Personalizar apariencia del bot (cliente) | L2 | permisos y tenant, errores, Sentry | BotPersonalization.tsx:151 -> updateBotAppearance.ts:56-66 -> :77 -> :95-107 -> :109 -> :135-136. |
| `h3.cli-chatbot.pestanas` Pestanas de Mi Chatbot | L3 | — | layout.tsx:57 -> ClientDashboardTabs.tsx:21-98 con Link y fades de overflow. |
| `h3.cli-chatbot.reporte-semanal-email` Reporte semanal del chatbot por email | L2 | vacíos, errores, Sentry, sin mocks ni TODO, autonomía | netlify.toml:28-29 -> route.ts:7-14 -> sendWeeklyReports.ts:14-93 -> buildWeeklyReport.ts:26-139 -> Brevo :63-67. |
| `h3.cli-chatbot.resumen` Resumen del chatbot del cliente | L2 | permisos y tenant, errores, Sentry, sin mocks ni TODO, autonomía | page.tsx:15-31 -> getUsageByOrgSlug/listLeadsByOrgSlug/listRecentHandoffsByOrgSlug (multiTenantQueries.ts:27-54, :208-258) -> ChatbotOverview.tsx:40-111 |
| `h3.cli-chatbot.scoring-leads` Scoring, decay y explicacion del score | L2 | sin mocks ni TODO, autonomía | captureLead.ts:343-361 -> calculateLeadScore.ts:259-329 -> persistido :406-412; lectura getEffectiveScore :461-485. |
| `h3.cli-chatbot.sync-crm` Enviar leads al CRM del cliente (n8n) | L2 | errores, validación en servidor, Sentry, autonomía | captureLead.ts:500 -> syncLeadToCrm.ts:41-133 -> postToN8n.ts:152-199 (fetch :87-92). |
| `h3.cli-chatbot.upsell-activacion` Landing de activacion del chatbot | L1 | sin mocks ni TODO, autonomía | Maqueta: WhatsApp placeholder (ChatbotUpsellLanding.tsx:15) y precio que no coincide con el catalogo (:148-152 vs sync-plans.ts:70,102). |

### [FAL-019] El cliente no recibe aviso de cuota (ni al 80% ni al agotarse): alert80Sent no se usa
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:1587` — «alert80Sent Boolean @default(false)»; `src/modules/chatbot/server/quota/upsellAlert.ts:68` — «await Promise.allSettled([ sendAgencyAlert({ type: 'LEAD_UPSELL', ...»; `src/modules/chatbot/server/quota/upsellAlert.ts:80` — «notifyTelegramOptional(»
- Impacto: Al agotar la cuota solo se avisa a develOP (webhook de agencia + Telegram). El dueno del negocio no se entera de que sus visitantes reciben 'alcanzamos el limite de atencion automatica' hasta que mire el panel; no hay preaviso al 80% pese a la columna.
- Propuesta: Email al leadNotificationEmail del cliente al 80% (usando alert80Sent con UPDATE condicional) y al degradar (degradedAt).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.quota, int.brevo, modelo.QuotaUsage

### [FAL-020] Reporte semanal del chatbot sin opt-out, destinatario no deterministico y link con fallback a localhost
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/reports/sendWeeklyReports.ts:27` — «take: 1, (members where role ADMIN, sin orderBy)»; `src/modules/chatbot/server/reports/sendWeeklyReports.ts:57` — «const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'»; `src/lib/email/templates/executive-weekly.ts:289` — «Dejar de recibir este reporte (control: el executive report si tiene unsubscribe)»
- Impacto: El cliente recibe dos mails semanales (este y el executive report); este no tiene baja ni registro de envio (un reintento del cron duplica), va al primer ADMIN que devuelva la base y el boton puede apuntar a localhost si falta la variable.
- Propuesta: Unificar con el executive report o sumarle opt-out y WeeklyReportLog; orderBy determinista y leadNotificationEmail como destinatario; fallar si falta la URL.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.reports, int.brevo, int.cron.send-weekly-reports

### h3.adm-chatbots — Chatbots (admin)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 29 funcionalidades: 1×L3, 26×L2, 1×L1, 1×L?).
- Criterios de L3 que faltan en alguna funcionalidad: errores, validación en servidor, mobile, Sentry, autonomía, sin mocks ni TODO, vacíos, permisos y tenant, carga.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.adm-chatbots.acciones-bulk` Acciones masivas sobre bots | L2 | errores, validación en servidor, mobile, Sentry, autonomía | BulkActionBar.tsx:57-107 → bulk-actions.ts:18-62, 64-108, 110-158, 163-233 con ConfirmDialog (BulkActionBar.tsx:180-211) |
| `h3.adm-chatbots.activar-bot-preflight` Activar el bot con chequeos previos | L2 | permisos y tenant, errores, validación en servidor, mobile, Sentry, sin mocks ni TODO | BotDetailClient.tsx:227 -> :140 runPreflightChecks -> ActivationModal.tsx:82-84 -> :136 -> BotDetailClient.tsx:165 -> actions.ts:42-44 update isActive -> :69 invalidateBotCache. |
| `h3.adm-chatbots.activar-pausar-eliminar` Activar, pausar y eliminar bot | L2 | permisos y tenant, errores, Sentry, sin mocks ni TODO | BotDetailClient.tsx:134-186 → runPreflightChecks / toggleBotActiveAction (actions.ts:25-99) / deleteBotAction (actions.ts:110-174) |
| `h3.adm-chatbots.actividad-por-bot` Actividad del bot en vivo (tab) | L2 | errores, validación en servidor, Sentry | [botId]/page.tsx:67 listRecentEvents -> ActivityTab.tsx:12 -> ActivityLog.tsx:101-125 -> events/route.ts:8-36. |
| `h3.adm-chatbots.alta-cliente-con-bot` Alta de cliente con bot (wizard) | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | Step5Review.tsx:71 -> createClientWithBot.ts:96-207 (tx) -> :229-243 email -> :261-273 respuesta |
| `h3.adm-chatbots.config-llm-y-cuota` Ajustes LLM y cuota del bot | L1 | errores, mobile, Sentry, sin mocks ni TODO, autonomía | Se guardan (AdvancedTab.tsx:48-85 → saveBotConfig.ts:45-48,78) pero el runtime usa plan.llmModel, 0.7 fijo, sin maxOutputTokens y plan.quota (handleChatRequest.ts:713,952,345); DAILY_DIGEST no implementado (notify.ts:91-94) |
| `h3.adm-chatbots.conversaciones-transcript` Conversaciones del bot con transcript | L2 | Sentry | ConversationsTab.tsx:12-24 → transcript-action.ts:23-64 → getConversationMessagesForOrg (multiTenantQueries.ts:161-172) |
| `h3.adm-chatbots.crear-bot` Alta de chatbot (org existente o de cero) | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | CreateBotForm.tsx:70-85 → new/actions.ts:54-86 → createBot.ts:41-123 o core.ts:58-200 → router.push |
| `h3.adm-chatbots.crear-bot-org-existente` Crear bot para una org existente | L2 | errores, Sentry, sin mocks ni TODO, autonomía | new/actions.ts:41-66 -> createBot.ts:41-123 (tx bot + KB :62-105, audit :107-120) |
| `h3.adm-chatbots.detalle-overview` Overview del bot | L2 | vacíos, sin mocks ni TODO | [botId]/page.tsx:39-71 → OverviewTab.tsx:36-181 |
| `h3.adm-chatbots.editar-config` Editar configuracion del bot | L2 | errores, Sentry, sin mocks ni TODO, autonomía | BotConfigEditor.tsx:80-81 -> saveBotConfig.ts:77-131 -> invalidateBotCache :133 -> audit :135-148 |
| `h3.adm-chatbots.editar-config-bot` Editar la configuración del bot | L2 | errores, Sentry, sin mocks ni TODO | Camino feliz: ConfigTab.tsx:54 -> BotConfigEditor.tsx:222 -> BotConfigDiffModal.tsx:148 -> BotConfigEditor.tsx:87-95 -> saveBotConfigByOrgSlug.ts:71-117 ($transaction) -> :119 invalidateBotCache -> :136 revalidatePath. |
| `h3.adm-chatbots.editar-kb` Editar base de conocimiento | L2 | errores, Sentry, autonomía | KnowledgeBaseEditor.tsx:112, :132-133 -> saveKnowledgeBase.ts:23-62 -> audit :64-82 |
| `h3.adm-chatbots.elegir-avatar` El admin elige el avatar del bot | L2 | errores, mobile | AppearanceTab.tsx:40-45 y Step4Appearance.tsx:58-63 -> AvatarPicker -> AVATAR_STYLE_SCHEMA en saveBotConfig.ts:30, createClientWithBot.ts:56. |
| `h3.adm-chatbots.email-prueba` Email de prueba de notificacion de leads | L2 | Sentry | BotConfigEditor.tsx:118 -> sendTestNotification.ts:16-83 |
| `h3.adm-chatbots.email-prueba-notificacion` Email de prueba de notificacion de leads | L2 | Sentry, sin mocks ni TODO | sendTestNotification.ts:16-58 -> sendLeadNotification.ts:18-39 -> Brevo. |
| `h3.adm-chatbots.generar-insights` Generar insights con IA | L2 | errores, validación en servidor | insights/generate/route.ts:24 y cron route.ts:43 -> generateInsights.ts:30-130. Hoy falla por Vertex vencido. |
| `h3.adm-chatbots.historial-sync-crm` Historial de syncs y reintento | L2 | Sentry | CrmIntegrationAdminCard.tsx:72 getOrgSyncHistory -> CrmSyncHistoryList.tsx:39-79 -> RetrySyncButton.tsx:17-25 -> retryCrmSync.ts:24-79. |
| `h3.adm-chatbots.instalacion` Instalación del widget (admin) | L2 | sin mocks ni TODO | InstallTab.tsx:24-131 buildEmbedSnippet + instrucciones |
| `h3.adm-chatbots.integracion-crm` Integracion CRM por webhook (n8n) | L2 | Sentry, autonomía | CrmConfigForm.tsx:48 -> saveCrmIntegration.ts:29-182; :70 -> testCrmConnection.ts:21-118; RetrySyncButton.tsx:19 -> retryCrmSync.ts:23-79; CrmIntegrationAdminCard.tsx:72 -> getCrmSyncHistory.ts:85-127 |
| `h3.adm-chatbots.integraciones-crm` Integración CRM (n8n) por org | L? | sin mocks ni TODO | IntegrationsTab.tsx:36-39 → CrmIntegrationAdminCard → saveCrmIntegration.ts:30 (requireSuperAdmin); el envío a n8n es de D7 y no se trazó |
| `h3.adm-chatbots.kb-y-sandbox` Knowledge base y sandbox de prompt | L2 | errores, mobile, Sentry, sin mocks ni TODO | KnowledgeTab.tsx:21-30 → KnowledgeBaseEditor → saveKnowledgeBase.ts:24; TestPromptSandbox.tsx:42 → test-prompt/route.ts:27-111 |
| `h3.adm-chatbots.leads-del-bot` Tabla de leads del bot (admin) | L2 | mobile | admin/chatbots/[botId]/tabs/LeadsTab.tsx -> LeadsTable.tsx:46-97. |
| `h3.adm-chatbots.leads-y-conversion-crm` Leads del bot y conversión a Lead CRM | L2 | errores, mobile, Sentry | LeadsTab.tsx:12-44 → ConvertChatbotLeadButton.tsx:31-41 → convert-chatbot-lead.actions.ts:24-78 ($transaction, idempotencia por convertedToOsLeadId) |
| `h3.adm-chatbots.listado-bots` Listado de bots y estadisticas globales | L2 | errores, Sentry | admin/chatbots/page.tsx:19 -> listAllBots.ts:4-34 + getGlobalBotsOverviewStats.ts:22-51; detalle [botId]/page.tsx:28-71 -> queries.ts:6-61 |
| `h3.adm-chatbots.listado-filtros` Listado de bots con filtros | L3 | — | page.tsx:14-19 guard + listAllBots/getGlobalBotsOverviewStats → BotsListClient.tsx:37-52 filtros → :138-153 vacío → :162-171 cards |
| `h3.adm-chatbots.preflight-activacion` Preflight y activacion del bot | L2 | permisos y tenant, validación en servidor, Sentry, autonomía | BotDetailClient.tsx:140 -> preflightChecks.ts:13-168 -> ActivationModal.tsx:30 |
| `h3.adm-chatbots.probar-prompt` Probar prompt con la KB en borrador | L2 | errores, carga, validación en servidor, Sentry, sin mocks ni TODO | KnowledgeBaseEditor.tsx:178 -> TestPromptSandbox.tsx:33-83 -> test-prompt/route.ts:28-99. Hoy no responde con la credencial de Vertex vencida (burbuja vacía). |
| `h3.adm-chatbots.vista-previa-config` Preview vivo de la configuracion | L2 | sin mocks ni TODO | BotPersonalization.tsx:347 y BotConfigEditor -> BotConfigPreview.tsx:65-244; no es espejo del embed (ChatbotEmbed no usa accent/tint). |

### [FAL-017] El pack vertical (EV) no se puede asignar a un bot nuevo desde ningún lado
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:1329` — «verticalPack String @default("base")»; `prisma/seeds/backfill-vertical-pack.ts:72` — «develop: 'agencia', sanmiguel: 'usados', matsu: 'usados',»; `src/modules/chatbot/server/chat/handleChatRequest.ts:625` — «const verticalPack = getVerticalPack(bot.verticalPack)»; `src/modules/chatbot/server/admin/createBot.ts:63` — «const newBot = await tx.botConfig.create({»; `src/lib/onboarding/core.ts:133` — «llmModel: 'gemini-2.5-flash', monthlyQuota: 1000, ... industry: resolvedIndustry,»; `src/modules/chatbot/server/admin/createClientWithBot.ts:159` — «const bot = await tx.botConfig.create({»; `prisma/seeds/backfill-vertical-pack.ts:71` — «export const VERTICAL_PACK_BACKFILL_MAP: Readonly<Record<string, string>> = { develop: 'agencia', sanmiguel: 'usados',»; `src/modules/chatbot/server/tools/captureLead.ts:340` — «// 'base' (distinta). REQUERIDO antes de produccion: backfillear los bots»; `src/modules/chatbot/server/admin/createClientWithBot.ts:188` — «industry: parsed.industry,»; `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts:19` — «const SaveBotConfigInputSchema = z.object({»; `scripts/ev5-smoke.mjs:212` — «"# UPDATE chatbot_bot_config SET \"verticalPack\"='agencia' WHERE slug='develop';",»; `src/modules/chatbot/server/tools/captureLead.ts:343` — «const packScoring = getVerticalPack(ctx.verticalPack ?? 'base').scoring»
- Impacto: Un concesionario nuevo vendido con el pack 'usados' corre con intents y scoring 'base' hasta que alguien edite la base a mano: el diferencial vertical no llega a clientes nuevos.
- Propuesta: Agregar verticalPack (claves del registry) al alta y al tab Avanzado, con Zod contra el registry.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, lib.chatbot.verticals, modelo.BotConfig, h4.adm-clientes.alta-cliente-con-bot, h3.adm-chatbots.editar-config-bot, h3.adm-chatbots.editar-config, h3.vis-whatsapp, lib.chatbot.scoring

### h3.adm-actividad — Actividad global de chatbots

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 5 funcionalidades: 5×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, vacíos, mobile, autonomía, errores, validación en servidor, Sentry, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.adm-actividad.grafico-7-dias` Grafico de actividad de 7 dias | L2 | permisos y tenant, vacíos, errores, Sentry | activity/page.tsx:12 -> getActivityChartData.ts:3-38 |
| `h3.adm-actividad.grafico-semanal` Gráfico de eventos por día | L2 | permisos y tenant, vacíos, sin mocks ni TODO | activity/page.tsx:12 -> getActivityChartData.ts:12-37 -> ActivityChart.tsx:18-79. |
| `h3.adm-actividad.log-bot-develop` Activity log del bot de develOP | L2 | permisos y tenant, vacíos, mobile, autonomía | activity/page.tsx:10-19 → ActivityChart + ActivityLog (polling events/route.ts) |
| `h3.adm-actividad.registro-eventos` Registro de eventos del chatbot | L2 | errores, Sentry, autonomía | logChatbotEvent persistentLogger.ts:87-148 (forOrg create :129); purga :154-163 via cron netlify.toml:31-32. |
| `h3.adm-actividad.stream-eventos` Activity Log del bot develOP | L2 | permisos y tenant, errores, validación en servidor, Sentry | activity/page.tsx:10-19 -> ActivityLog.tsx:33-45 -> polling :101-125 -> events/route.ts. |

### h3.adm-health — Health de chatbots

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 3 funcionalidades: 3×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, sin mocks ni TODO, errores, Sentry.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.adm-health.latencia` Latencia p50/p95 por hora | L2 | permisos y tenant, errores, Sentry | health/page.tsx:13 -> getLatencyHistory.ts:63-144 |
| `h3.adm-health.latencia-p50-p95` Latencia P50/P95 por hora | L2 | permisos y tenant, sin mocks ni TODO | health/page.tsx:11-14 -> getLatencyHistory.ts:63-143 -> LatencyChart.tsx:28-59. |
| `h3.adm-health.veredicto-salud` Veredicto de salud del bot | L2 | permisos y tenant, errores, sin mocks ni TODO | health/page.tsx:12-16 -> checkHealth.ts:21-98 -> buildHealthVerdict.ts:24-133. El veredicto no detecta un provider caído y valida la variable de credenciales equivocada. |

### h3.vis-widget-cliente — Widget embebible en el sitio del cliente

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 7 funcionalidades: 6×L2, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, Sentry, autonomía, errores, sin mocks ni TODO, vacíos, mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.vis-widget-cliente.apariencia-de-marca` Colores de marca del cliente en el widget embebido | L1 | sin mocks ni TODO, autonomía | Solo ChatHeader (ChatHeader.tsx:67,83) y el avatar usan accentColor; el resto del embed es cyan fijo (ChatbotEmbed.tsx:269, :537; git grep accentColor/accentSecondary/chatSurfaceTint en ChatbotEmbed = 0). |
| `h3.vis-widget-cliente.avatar-del-bot` Avatar animado del bot en cabecera y launcher | L2 | vacíos, errores, mobile, Sentry | ChatHeader.tsx:61-72 -> AvatarRenderer.tsx:51-101 -> registry.ts:96-104 -> HeavyAvatarsLazy.tsx:27-35 -> NeuroAvatar.tsx:45-64 / LegacyNeuroAvatarAdapter.tsx:31. |
| `h3.vis-widget-cliente.chat-embebido` Chat embebido en el sitio del cliente | L2 | permisos y tenant, Sentry, sin mocks ni TODO | widget.js:115-131 -> embed/[slug]/page.tsx:25-44 -> ChatbotEmbed.tsx:27,119-133 -> chat/route.ts:40-110. |
| `h3.vis-widget-cliente.conversar` Conversar con el bot desde el widget | L2 | permisos y tenant, vacíos, errores, Sentry, autonomía | Camino feliz por codigo: sendMessage useChatbot.ts:537-549 -> transport :269-305 -> route.ts:8 -> handleChatRequest (entrada) -> stream al SDK :356. Hoy no responde en produccion por la credencial de Vertex vencida (hecho conocido). |
| `h3.vis-widget-cliente.embed-chat` Widget embebido en el sitio del cliente | L2 | permisos y tenant, Sentry, autonomía | widget.js:99-153 → embed/[slug]/page.tsx:25-44 → ChatbotEmbed → /api/chatbot/<slug>/chat |
| `h3.vis-widget-cliente.estados-degradados` Banners de degradado en el widget embebido del cliente | L2 | errores, Sentry, autonomía | ChatbotEmbed.tsx:419 <DegradedBanner info={chatbot.degradedInfo}> con el mismo hook (useChatbot); ramas en DegradedBanner.tsx:41-215. |
| `h3.vis-widget-cliente.tarjetas-derivacion` Tarjetas de derivacion (WhatsApp / que me contacten) | L2 | vacíos | ChatbotEmbed.tsx:398-409 -> renderToolCall.tsx:47-84 -> HandoffOptionsCard.tsx:22-69 / WhatsappHandoffCard.tsx:12-58. |

### [FAL-018] El widget no avisa que la conversacion la procesa un proveedor de IA ni enlaza una politica de privacidad, y la app no tiene paginas legales
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/chat/ChatWindow.tsx:311` — «Sistema Listo»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:280` — «{config.welcomeMessage}»
- Impacto: El bot captura nombre, telefono y email del visitante en el sitio del cliente y los manda a Vertex y a n8n, sin aviso ni link a una politica (Ley 25.326). git grep de vertex|n8n|privacidad|disclaimer en chat/, embed/ y LogicCompanion = 0 (control: 'PRIVACIDAD' aparece en api/chatbot/[slug]/chat/route.ts:75), y ls-tree de src/app no tiene rutas privac|legal|termin|terms|cookies (control: 86 page.tsx listados). Bloqueante para el primer cliente real.
- Propuesta: Decision para Valentino (texto legal): aviso breve en el empty state y en el primer mensaje del widget ('Este chat usa IA de Google; ver politica') con link a una pagina de privacidad publicada en el sitio de develOP y configurable por cliente.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-develop, int.vertex

### h3.vis-api-chatbot — API pública del chatbot

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 12 funcionalidades: 10×L2, 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.vis-api-chatbot.captura-lead` Captura de lead (capture_lead) | L2 | errores, Sentry, autonomía | captureLead.ts:212-233 -> :241-261 -> :358-361 -> :379-419 -> :521-550 (flujo trazado). |
| `h3.vis-api-chatbot.chat-streaming` API de chat con streaming | L2 | permisos y tenant, errores, validación en servidor | chat/route.ts:35-111 → handleChatRequest.ts:99-1358 → persistTurn.ts:412-472 |
| `h3.vis-api-chatbot.config-publica` Config pública del widget | L2 | errores, Sentry | handleConfigRequest.ts:11-25 -> getPublicConfig.ts:69-126 (select acotado :76-98, pausado :124). |
| `h3.vis-api-chatbot.costo-por-turno` Costo estimado por turno | L2 | autonomía | persistTurn.ts:372-377 -> costs.ts:21-51 -> google.ts:99-106; acumulado persistTurn.ts:450,468. |
| `h3.vis-api-chatbot.cuota-mensual` Cuota mensual de conversaciones | L2 | validación en servidor, Sentry, autonomía | handleChatRequest.ts:345 / :401 -> checker.ts:126-151; compensacion checker.ts:189-212; upsell upsellAlert.ts:46-91. |
| `h3.vis-api-chatbot.derivacion-whatsapp` Derivacion a WhatsApp con contexto | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | showWhatsappHandoff.ts:172-185 -> :96-114 -> :127-147 -> panel multiTenantQueries.ts:208-240. |
| `h3.vis-api-chatbot.gating-degradado` Respuesta degradada por cupo, dominio o tope de conversación | L2 | — | handleChatRequest.ts:309-341 (dominio), :345-395 (cupo), :400-446 (reserva atómica), :547-579 (tope de 40 mensajes) -> degradedResponse.ts:30-48. Con el bug de cupo para conversaciones existentes (:345). |
| `h3.vis-api-chatbot.health-publico` Health público del bot | L1 | permisos y tenant, errores, validación en servidor, Sentry, sin mocks ni TODO | health/route.ts:6-20 → checkHealth.ts:21-99 (no prueba el proveedor, expone detalles) |
| `h3.vis-api-chatbot.pedido-contacto` Pedido de contacto (confirm_contact_request) | L1 | errores, Sentry, autonomía | El lado visitante funciona (confirmContactRequest.ts:185-200), pero el registro handoff.callback (:112-124) no tiene lector: el camino no llega al cliente. |
| `h3.vis-api-chatbot.prompt-sistema` Armado del system prompt | L2 | validación en servidor, sin mocks ni TODO, autonomía | handleChatRequest.ts:635-658 -> buildSystemPrompt.ts:33-47 -> sections.ts:20-223; extras :817-827. |
| `h3.vis-api-chatbot.responder-turno` Responder un turno del visitante | L2 | errores, validación en servidor, sin mocks ni TODO | Camino feliz trazado: route.ts:42 -> :81 -> :97; handleChatRequest.ts:134-136, :155, :215-247, :612-616, :635, :937-1179; persistTurn.ts:412-472. Por código es L2; hoy no responde por la credencial de Vertex vencida (hecho conocido). |
| `h3.vis-api-chatbot.respuesta-llm-streaming` Respuesta del bot en streaming | L2 | errores, validación en servidor, autonomía | Camino feliz: handleChatRequest.ts:713 -> resolveEffectiveModel.ts:37-51 -> google.ts:91-97 -> wrapLanguageModel handleChatRequest.ts:735-760 -> streamText :937 -> persistTurn.ts:372-473. Bloqueado operativamente hoy por la credencial de Vertex vencida. |

### h3.vis-widget-develop — Widget de develOP en el sitio público

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 14 funcionalidades: 14×L2).
- Criterios de L3 que faltan en alguna funcionalidad: vacíos, Sentry, sin mocks ni TODO, carga, mobile, autonomía, errores, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.vis-widget-develop.abrir-y-cerrar-chat` Abrir y cerrar el chat desde la burbuja | L2 | carga, mobile, Sentry, autonomía | Camino feliz trazado: app/layout.tsx:137 -> ChatWidgetMount.tsx:37-42 -> LogicCompanion.tsx:53, :95, :143-221 -> handleToggle :68-80 -> ChatWindow montado :146-173; cierre por chatbot.close :153. |
| `h3.vis-widget-develop.carga-config-reintento` Carga de la config del widget con reintento | L2 | carga, Sentry | useChatbot.ts:239 -> configCache.ts:54-65 -> fetchConfigWithRetry :43-52; error LogicCompanion.tsx:103-120. |
| `h3.vis-widget-develop.companion` Widget del sitio de develOP | L2 | vacíos, Sentry, sin mocks ni TODO | ChatWidgetMount.tsx:27-43 (prefetch :37-39, gate :41) → LogicCompanion → useChatbot → API de chat |
| `h3.vis-widget-develop.contenido-bot-develop` Contenido del bot publico de develOP (seed y preguntas proactivas) | L2 | errores, sin mocks ni TODO | seed.ts:252-369 upsert org (:259-268), bot (:272-338) y KB (:342-365) via unsafeGlobalQuery con razon SEED; prompts fuente unica developProactivePrompts.ts:21-57 escritos por update-proactive-prompts.ts:22-32 |
| `h3.vis-widget-develop.conversar-con-el-bot` Conversar con el bot en streaming | L2 | vacíos, Sentry, autonomía | Camino feliz trazado en codigo: ChatWindow.tsx:186-197 -> useChatbot.ts:537-549 -> transport :271-272 -> chat/route.ts:35-110 -> handleChatRequest.ts:136, :155, :215-247, :612, :937 -> persistTurn.ts:412-472. Hoy no responde en runtime por la credencial de Ver |
| `h3.vis-widget-develop.conversar-en-streaming` Conversar con el bot de develOP con respuesta revelada en vivo | L2 | vacíos, errores, mobile, Sentry, sin mocks ni TODO, autonomía | Camino feliz en UI trazado: ChatWidgetMount.tsx:42 -> LogicCompanion.tsx:147-152 -> ChatWindow.tsx:540-546,185-198 -> useChatbot.ts:537,272 -> render ChatWindow.tsx:369-381 -> StreamingMarkdown.tsx:75-121. El tramo server queda en otro lote; en runtime hoy no  |
| `h3.vis-widget-develop.estados-degradados` Banners de degradado y derivacion a WhatsApp en el widget de develOP | L2 | errores, Sentry, autonomía | useChatbot.ts:318-340/383-398/470-478 -> degradedInfo -> ChatWindow.tsx:280 -> DegradedBanner.tsx:41-98 (ambar) / :101-215 (verde con wa.me :106-109). |
| `h3.vis-widget-develop.ir-a-una-seccion` Tarjeta del bot para ir a una seccion del sitio | L2 | errores, validación en servidor, autonomía | getTools.ts:121 (solo bot develop) -> renderToolCall.tsx:71-81 -> NavigateToPageCard.tsx:35-36 -> LogicCompanion.tsx:165 -> useChatbot.ts:583-586 window.location.href. |
| `h3.vis-widget-develop.navegacion-sitio` Navegar a seccion del sitio de develOP | L2 | — | getTools.ts:121 gate por slug; navigateToPage.ts:25-43 z.enum de rutas cuyos anchors existen (OurServices.tsx id=servicios, Portfolio.tsx, About.tsx). |
| `h3.vis-widget-develop.navegar-a-pagina` Tarjeta 'Llevame ahi' | L2 | — | renderToolCall.tsx:71-81 -> NavigateToPageCard.tsx:35-45; gate solo bot develop (navigate-to-page-gate.invariant.ts:41-53). |
| `h3.vis-widget-develop.reintento-de-config` Reintento manual cuando /config no carga | L2 | carga, Sentry | LogicCompanion.tsx:103-120 -> ConfigLoadError.tsx:17-73 onRetry=chatbot.retryLoadConfig; mismo componente en ChatbotEmbed.tsx:189. |
| `h3.vis-widget-develop.respuestas-rapidas` Chips de respuestas rapidas | L2 | — | ChatWindow.tsx:467-489 onClick -> onQuickReply(qr.promptToSend) = chatbot.sendMessage (LogicCompanion.tsx:154). QuickReplyChips.tsx es codigo muerto. |
| `h3.vis-widget-develop.teaser-y-retomar` Burbuja proactiva y burbuja 'retomar' | L2 | mobile, autonomía | LogicCompanion.tsx:263-282 -> ProactiveTooltip.tsx:71-80 (trigger) -> :129-138 onAccept -> useChatbot.ts:551-572 acceptProactivePrompt -> transport :420-443 proactiveOpener -> handleChatRequest.ts:811-824 (opener validado al system prompt). |
| `h3.vis-widget-develop.tooltip-proactivo` Teaser proactivo del widget de develOP | L2 | autonomía | LogicCompanion monta ProactiveTooltip; useTooltipTriggers.ts:33-87 -> ProactiveTooltip.tsx:71-94 -> onAccept :137. |

### h3.vis-whatsapp — Canal WhatsApp (motor)

- Madurez de la herramienta: **L0** (la de su funcionalidad más floja; 8 funcionalidades: 4×L1, 2×L2, 2×L0).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, autonomía, errores, validación en servidor, permisos y tenant, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.vis-whatsapp.alta-canal` Alta y rotacion del canal de WhatsApp de un negocio | L0 | autonomía | Las piezas existen (channel-credentials.ts:30-38; secret-box), pero no hay script, action ni pantalla: git grep 'wabaChannel.(create/upsert/createMany)' en src/scripts/prisma da 0 (control: tests/integration/motor-inbound.spec.ts:113). |
| `h3.vis-whatsapp.envio-mensajes` Envio de mensajes (texto en ventana de 24 h y plantillas aprobadas) | L1 | permisos y tenant, errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | El servicio esta completo (sendMessage.ts:204-256 -> client.ts:252-290), pero no tiene llamadores en src ni scripts (solo tests/integration/motor-outbound.spec.ts:188) y tampoco hay forma de cargar la API key cifrada del canal. |
| `h3.vis-whatsapp.estados-entrega` Estados de entrega de mensajes salientes | L1 | errores, Sentry, autonomía | El handler es correcto (handle-status.ts:37-60), pero en produccion no existe ninguna fila OUT: sendMotorMessage (sendMessage.ts:204) solo lo llaman los tests. |
| `h3.vis-whatsapp.identidad-bsuid` Identidad BSUID-first del contacto y cambio de numero | L2 | errores, validación en servidor, Sentry | Camino feliz trazado: identity.ts:40-76 (bsuid, reconciled, created) y :106-140 (user_id_update), con los tests (b), (d), (e) e (i) de motor-inbound.spec.ts. Tiene un bug de mezcla de identidades por telefono (identity.ts:56-65). |
| `h3.vis-whatsapp.recepcion-mensajes` Recepcion autenticada de mensajes entrantes | L2 | errores, Sentry, autonomía | Camino feliz trazado: route.ts:27 -> handle-request.ts:21-55 -> process.ts:136-157 -> handle-message.ts:24-58 (con un test de integracion en motor-inbound.spec.ts:214). No llega a L3: no hay forma de dar de alta un canal fuera de los tests (channel-credentials |
| `h3.vis-whatsapp.respuesta-automatica` Respuesta automatica del bot a los mensajes entrantes | L0 | autonomía | No existe: route.ts:9-10 la difiere a B2. No hay llamador de sendMotorMessage (git grep en src y scripts: solo la definicion en sendMessage.ts:204) ni llamadas a LLM en el motor (git grep vertex/streamText/generateText: 0). |
| `h3.vis-whatsapp.salud-canal` Salud del canal y alertas operativas | L1 | errores, Sentry, autonomía | Escribe estado y alertas (handle-health.ts:176, :219, :243, :115), pero nadie las lee ni hay transporte (schema.prisma:2216-2218; git grep motorAlert fuera del motor: 0). El dedupe pierde el escalado a baneado (handle-health.ts:106-113). |
| `h3.vis-whatsapp.webhook-entrante` Webhook entrante de WhatsApp (motor) | L1 | Sentry, autonomía | route.ts:27-58 → handle-request.ts:21-56 → process.ts; sin respuesta (route.ts:9-10) ni alta de canales |

### [FAL-021] El bot de WhatsApp no responde ni se puede dar de alta: nada consume los mensajes entrantes, sendMotorMessage no tiene llamadores y no hay alta de canal
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/motor/webhook/[channelToken]/route.ts:9` — «* Contrato de respuesta: 200 rápido y sin trabajo lento (nada de LLM — eso * es B2); 401 auth; 400 shape; 429 rate limit; 500 SOLO errores de»; `src/modules/motor/adapters/whatsapp/inbound/handle-message.ts:45` — «await tx.motorMessage.create({ conversationId: conversation.id, direction: 'IN',»; `src/modules/motor/services/sendMessage.ts:204` — «export async function sendMotorMessage(»; `src/modules/motor/domain/channel-credentials.ts:30` — «export function generateChannelWebhookCredentials(): ChannelWebhookCredentials {»; `src/modules/motor/adapters/whatsapp/inbound/handle-request.ts:53` — «const summary = await processInboundPayload(forOrg(channel.organizationId), channel, envelope.data)»; `src/modules/motor/README.md:63` — «número restringido/baneado); el transporte (email/WhatsApp) es B3.»; `src/modules/motor/adapters/whatsapp/inbound/resolve-channel.ts:27` — «client.wabaChannel.findUnique({»
- Impacto: Bloquea al primer negocio cliente. Si le vendemos el bot de WhatsApp, sus clientes escriben, el mensaje se guarda y nadie contesta. El negocio tampoco puede ver esas conversaciones: ningun archivo fuera de src/modules/motor y src/lib/isolation lee las tablas motor_*. Ademas, no hay forma de dar de alta el canal sin escribir a mano en la base (no hay ninguna escritura de WabaChannel fuera de tests; ver S6-08).
- Propuesta: Decision para Valentino: si el motor es producto vendible, planificar B2 (consumidor de los IN que genera la respuesta, con llamador de sendMotorMessage que derive la org del canal autenticado), el alta y rotacion del canal (script o pantalla admin, S6-08) y una vista del negocio sobre sus conversaciones. Si no lo es, dejar documentado en la oferta comercial que hoy lo vende BotZ (repo aparte).
- Esfuerzo: L  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp, h3.vis-whatsapp.respuesta-automatica, h3.vis-whatsapp.alta-canal, modelo.MotorMessage, modelo.WabaChannel, int.360dialog, lib.motor

### [FAL-022] Las alertas de salud del canal (numero baneado o restringido, plantilla rechazada) se guardan en MotorAlert y nadie las lee ni las envia
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/modules/motor/adapters/whatsapp/inbound/handle-health.ts:115` — «await scope.motorAlert.create({ wabaChannelId: channel.id, type: input.type,»; `prisma/schema.prisma:2216` — «// premortem de ban de Meta por calidad: enterarse ANTES del ban). Solo // REGISTRO consultable acá — el transporte (email/WhatsApp al equipo) es B3,»; `src/modules/motor/services/sendMessage.ts:113` — «if (channel === null || channel.apiKeyEncrypted === null || channel.apiKeyIv === null || channel.apiKeyTag === null) {»
- Impacto: El objetivo de B1-S3 era enterarse antes del baneo de Meta, y con este codigo no pasa: la alerta CRITICAL de numero baneado queda en una tabla que ninguna pantalla, cron ni email lee. channelStatus=BANNED tampoco frena el envio (resolveTargets solo mira la API key). El primer negocio cliente podria quedar baneado sin que develOP se entere.
- Propuesta: Cablear el transporte (B3): email o Telegram de agencia por las alertas CRITICAL/HIGH, reusando src/lib/alerts.ts, y mostrarlas en /admin/chatbot/health o en una vista del motor. Que sendMotorMessage rechace con un motivo tipado cuando channelStatus sea BANNED o RESTRICTED.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp.salud-canal, modelo.MotorAlert, modelo.WabaChannel, h3.adm-health

## h4 · Panel de admin

### h4.adm-clientes — Clientes

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 10 funcionalidades: 10×L2).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, autonomía, sin mocks ni TODO, errores, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-clientes.alta-cliente-con-bot` Alta de cliente con chatbot | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO | clients/new/page.tsx:14 -> OnboardingWizard.tsx:87-160 -> Step5Review.tsx:66-86 -> createClientWithBot.ts:96-273 -> Step5Review.tsx:123-193. |
| `h4.adm-clientes.alta-cliente-sin-bot` Alta de cliente sin chatbot | L2 | errores, validación en servidor, Sentry | Step1Company.tsx:58-69 -> Step5Review.tsx:87-108 -> createClientOnly.ts:48-175. |
| `h4.adm-clientes.alta-sin-bot` Alta de cliente sin chatbot | L2 | errores, Sentry, autonomía | Step5Review.tsx:87 -> createClientOnly.ts:48-111 -> :132-147 email -> :165-175 |
| `h4.adm-clientes.archivar-cliente` Archivar y desarchivar cliente | L2 | Sentry, autonomía | ClientsListClient.tsx:161-171 -> archiveClient.ts:16-37 (requireSuperAdmin, Zod, update deletedAt) -> page.tsx:23/:34. Funciona como filtro, pero no suspende nada (ver hallazgo). |
| `h4.adm-clientes.avatar-cliente` Avatar del cliente | L2 | Sentry | ClientAvatarField.tsx:24-83 -> AvatarUploader.tsx:19-66 (WebP 200 px) -> createClientWithBot.ts:28-30 / EditClientForm -> ClientAvatar.tsx:16-75. |
| `h4.adm-clientes.borrador-alta` Borrador automático del alta | L2 | sin mocks ni TODO | useOnboardingDraft.ts:26-56 restaura, :59-78 autoguarda; DraftBanner.tsx:12-42; OnboardingWizard.tsx:115-121. |
| `h4.adm-clientes.borrador-del-alta` Borrador persistente del alta de cliente | L2 | errores, Sentry | admin/clients/new/page.tsx:14 -> OnboardingWizard.tsx:98 -> useOnboardingDraft.ts:26-56 restore, :59-78 autosave, OnboardingWizard.tsx:140 clearDraft al crear. |
| `h4.adm-clientes.eliminar-cliente` Eliminar cliente (hard-delete) | L2 | Sentry, autonomía | ClientsListClient.tsx:192-206 -> hardDeleteClient.ts:107-123 (resumen) -> ClientsListClient.tsx:222-243 -> hardDeleteClient.ts:125-145 (tx + delete) -> audit :166-178. |
| `h4.adm-clientes.envio-manual-del-reporte` Enviar ahora el reporte ejecutivo | L2 | Sentry, sin mocks ni TODO | SendExecutiveReportButton.tsx:37 → route.ts:13-57 → send-manual.ts:33-153 → build.ts → Brevo → WeeklyReportLog. |
| `h4.adm-clientes.plantilla-kb-industria` Plantilla de KB por industria | L2 | validación en servidor, sin mocks ni TODO | Step3KnowledgeBase.tsx:9-23 getTemplate -> kb-templates/index.ts:25-40 -> createClientWithBot.ts:192-202; también createBot.ts:58, :93-102 y lib/onboarding/core.ts:7. |

### h4.adm-proyectos — Proyectos

### [FAL-007] El ciclo de vida de Project no modela mantenimiento ni cancelación: maintenanceStartDate no tiene escritor, deliveredAt no se limpia al reabrir y la migración v2 convirtió CANCELADO en COMPLETED
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:115` — «const isInMaintenance = Boolean(project.maintenanceStartDate)»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:204` — «El proyecto pasara a mantenimiento cuando tenga una fecha de inicio de mantenimiento.»; `src/app/(protected)/admin/projects/_actions/maintenance.actions.ts:120` — «if (!project.maintenanceStartDate) { return fail('Project has no maintenance start date')»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:750` — «status: parsed.status, ...(parsed.status === ProjectStatus.COMPLETED ? { deliveredAt: new Date() }»; `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:135` — «WHEN 'EN_MANTENIMIENTO' THEN 'IN_PROGRESS'::"ProjectStatus" WHEN 'CANCELADO' THEN 'COMPLETED'::"ProjectStatus"»; `prisma/schema.prisma:38` — «enum ProjectStatus { PLANNING IN_PROGRESS»
- Impacto: Para el primer proyecto entregado con abono mensual: ninguna action ni formulario escribe maintenanceStartDate (solo seed-agency-os.ts y los proyectos migrados lo tienen), así que 'Generar meses pendientes' nunca aparece y el mantenimiento no se puede cobrar por el flujo previsto. Reabrir un proyecto COMPLETED deja el deliveredAt viejo y volver a completarlo pisa la fecha real de entrega. Un proyecto cancelado no tiene estado posible: los CANCELADO legacy quedaron COMPLETED y el cliente los ve como 'Completado'.
- Propuesta: Agregar el inicio de mantenimiento a la edición del proyecto (o setearlo al completar si hay monthlyRate), limpiar deliveredAt al salir de COMPLETED y no pisarlo si ya existe. Decisión para Valentino (schema FROZEN): sumar CANCELLED (y quizá MAINTENANCE) a ProjectStatus y revisar los proyectos legacy que eran CANCELADO.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos, h2.cli-proyecto, modelo.Project, modelo.OsMaintenancePayment

### h4.adm-tickets — Tickets

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 2 funcionalidades: 2×L2).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-tickets.cambiar-estado` Cambiar estado del ticket | L2 | errores, Sentry | admin/tickets/_components/ticket-chat.tsx:9 → actions.ts:183-184 Zod → :187 requireSuperAdmin → :188-193 update + revalidate. |
| `h4.adm-tickets.responder-y-avisar-por-email` Responder ticket como develOP y avisar al cliente | L2 | errores, Sentry, sin mocks ni TODO | actions.ts:124 (isAdmin) → :140-148 mensaje → :150-167 sendEmail por Resend (lib/email.ts:15-30); el mensaje se guarda, el email puede no salir sin registro. |

### h4.adm-alertas — Alertas

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 2 funcionalidades: 1×L1, 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, autonomía, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-alertas.alerta-upsell-cuota` Alerta de upsell al agotar cuota | L2 | sin mocks ni TODO, autonomía | handleChatRequest.ts:374 -> upsellAlert.ts:52-58 (markDegradedIfFirst) -> :68-88. |
| `h4.adm-alertas.detector-incidencias` Detector de incidencias de bots | L1 | errores, Sentry, autonomía | Funciona solo a mano: AlertSettingsClient.tsx:89 -> trigger-detector/route.ts:5-16 -> detectBotIssues.ts:285-297; sin scheduler (netlify.toml:25-32) y ciego a errores de stream |

### [FAL-016] El detector de alertas de los bots (/api/cron/detect-bot-issues) no tiene ningún disparador programado
- Dominio: D5  ·  Severidad: ALTA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `netlify.toml:25` — «[functions."generate-insights-cron"] schedule = "0 9 * * *"»; `netlify.toml:31` — «[functions."cleanup-old-events-cron"]»; `vercel.json:4` — «"path": "/api/cron/os-follow-up",»; `src/app/api/cron/detect-bot-issues/route.ts:7` — «export async function GET(req: Request) { if (!isAuthorizedCronRequest(req)) {»; `src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:89` — «const res = await fetch('/api/admin/alerts/trigger-detector', { method: 'POST' })»; `src/app/api/cron/detect-bot-issues/route.ts:13` — «const result = await runAlertDetector()»
- Impacto: Bloqueante para el primer cliente real: las alertas de bot (LLM_PROVIDER_ERROR, QUOTA_EXHAUSTED, LATENCY_DEGRADED, LEAD_CAPTURE_FAILURE, CLIENT_NO_ACTIVITY) solo se generan si un SUPER_ADMIN aprieta el botón manual de Configuración → Alertas. Un bot caído o con el cupo agotado pasa días sin aviso. netlify.toml agenda solo generate-insights, weekly-reports y cleanup; vercel.json agenda otros tres crons que en Netlify no corren.
- Propuesta: Agendar el detector con una función programada de Netlify (mismo patrón que cleanup-old-events-cron, p. ej. cada 15 min) o documentar el scheduler externo si existe; alinear netlify.toml y vercel.json.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-047]
- Nodo(s): int.cron.detect-bot-issues, h4.adm-alertas, h3.adm-health, lib.chatbot.admin, modelo.BotAlert, h4.adm-alertas.detector-incidencias
- REQUIERE-VERIFICACIÓN-HUMANA: VH-067

### h4.adm-config — Configuración

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 1 funcionalidades: 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: errores, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-config.precio-modulos` Editar precio de un módulo premium | L2 | errores, autonomía | settings.actions.ts:175-199 (requireSuperAdmin, Zod, update) -> dashboard/services/page.tsx:177 muestra el precio nuevo; la home pública sigue leyendo el catálogo (ModuloActiveCard.tsx:248) y el sync lo revierte (sync-premium-modules.ts:54, :145-148). |

## h5 · Setter y LeadOS (ZONA-FRANCO)

## h6 · Entradas públicas que alimentan lo interno

### h6.vis-contacto — Formulario de contacto público

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 1 funcionalidades: 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, Sentry.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h6.vis-contacto.atribucion-de-referido` Atribución de referido desde el formulario público | L2 | permisos y tenant, Sentry | contact.ts:16-70 → referrals.service.ts:94-121 hechos → attribution.ts:41-52 → :134-140 Referral → :143-165 alerta y Notification. |

## ZONA-FRANCO

> Faltantes en herramientas de Franco; se repiten en `09-PARA-FRANCO.md`.

### [FAL-003] Los errores de autenticación no llegan a Sentry: NextAuth sin logger y loginAction convierte todo AuthError en 'error inesperado' (y lo cuenta como intento fallido)
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:76` — «const nextAuthResult = NextAuth({ adapter: PrismaAdapter(prisma) as Adapter, trustHost: true,»; librería @auth/core@0.41.2, lib/utils/logger.js línea 7 — «error(error) { const name = error instanceof AuthError ? error.type : error.name; console.error('${red}[auth][error]${reset} ${name}: ${error.message}');»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 388 — «const error = new CallbackRouteError(e, { provider: provider.id });»; `src/app/login/actions.ts:113` — «if (error instanceof AuthError) { recordFailedAttempt(ip)»; `src/app/login/actions.ts:122` — «return 'Ocurrió un error inesperado. Intentá de nuevo.'»; `src/app/login/actions.ts:153` — «if (error instanceof AuthError) { return 'No se pudo generar el Magic Link. Intentá de nuevo.'»; `src/instrumentation.ts:49` — «export const onRequestError = Sentry.captureRequestError»
- Impacto: Auth.js atrapa sus errores internos (base caída en authorize o en los callbacks, que llegan como CallbackRouteError o AccessDenied; AdapterError al crear el token del magic link; JWTSessionError; errores de OAuth) y solo los imprime con console.error. La config no define logger ni events y no hay captureConsoleIntegration. Lo que sí llega a las actions se devuelve como texto, y onRequestError solo ve errores que se lanzan. Para el primer cliente real: si el login se rompe por la plataforma, cada intento dice 'Ocurrió un error inesperado' o 'No se pudo generar el Magic Link' y develOP se entera cuando el cliente llama. Además loginAction cuenta esas fallas del servidor como intentos fallidos: con 5 seguidas el cliente queda bloqueado 5 minutos ('Demasiados intentos fallidos') aunque nunca se equivocó.
- Propuesta: Zona libre en login/actions.ts: capturar en Sentry los AuthError que no sean CredentialsSignin (ni el AccessDenied esperado del magic link) y no llamar a recordFailedAttempt para ellos. Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): logger.error de NextAuth que envíe a Sentry (el scrub de PII ya corre en beforeSend).
- Esfuerzo: S  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login, h1.auth-login.password, h1.auth-login.magic-link, lib.auth, int.sentry
- REQUIERE-VERIFICACIÓN-HUMANA: VH-023

### [FAL-001] Los inicios de sesión no dejan rastro: no hay events en auth.ts ni tipo LOGIN en AuditActionType
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:173` — «callbacks: {»; `prisma/schema.prisma:190` — «enum AuditActionType {»; `prisma/schema.prisma:211` — «PASSWORD_CHANGED»; `src/app/login/actions.ts:113` — «if (error instanceof AuthError) { recordFailedAttempt(ip)»
- Impacto: Una toma de la cuenta SUPER_ADMIN (fuerza bruta de SEC-007, magic link a un buzón comprometido) o de un cliente no deja registro de cuándo ni desde dónde se entró. Los fallos solo suman a un Map en memoria y los éxitos no se guardan en ningún lado. develOP no puede detectar ni reconstruir un acceso indebido. Además, el 'registro de accesos' que se le muestra al cliente en la Bóveda es inventado (PLAN-032).
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO; el schema es FROZEN, migración sin reset). Opción: events.signIn/signOut en auth.ts que escriban en AdminAuditLog con tipos nuevos (LOGIN_SUCCEEDED/LOGIN_FAILED) o en una tabla propia. Como mínimo para SUPER_ADMIN y con la IP confiable.
- Esfuerzo: M  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login, lib.auth, h4.adm-audit, modelo.AdminAuditLog
