# 02 — Qué falta

> Madurez de cada herramienta de §6 del plan, con la escala del PROMPT §5.2 (L0 no existe · L1 esqueleto · L2 camino feliz · **L3 listo para cliente** · L4 pulido). **La unidad que se mide es la funcionalidad** (ENMIENDA-01 E7, DEC-25); la madurez de una herramienta es la de su funcionalidad más floja y la de un área, un cálculo agregado. Un L2 o más afirma que algo funciona: exige el camino feliz trazado con `ruta:línea`; si no, queda `L?`. Los faltantes se escriben como `FAL-NNN` bajo su herramienta. La hipótesis de Valentino —«el admin y el portal están muy desarrollados y les faltan sobre todo módulos»— se confirma o se desmiente acá con evidencia, no se asume. Generado por `scripts/auditoria/hallazgos-md.mjs` (funcionalidades de `_crudo/funcionalidades.json`, faltantes de `_crudo/hallazgos.json`).

## Resumen por área

| Área | Herramientas medidas | Funcionalidades | En L3 o más | Faltantes de L3 más comunes | FAL |
|---|---:|---:|---:|---|---:|
| h1 · Acceso | 5 / 5 | 15 | 0 | Sentry (11), autonomía (9), errores (8) | 3 |
| h2 · Portal del cliente | 16 / 16 | 103 | 13 | Sentry (65), sin mocks ni TODO (54), errores (47) | 11 |
| h3 · Chatbot centralizado | 0 / 8 | 0 | 0 | — | 0 |
| h4 · Panel de admin | 3 / 13 | 6 | 0 | Sentry (5), autonomía (3), errores (3) | 1 |
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

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 13 funcionalidades: 1×L1, 11×L2, 1×L3).
- Criterios de L3 que faltan en alguna funcionalidad: vacíos, errores, Sentry, sin mocks ni TODO, autonomía, permisos y tenant, carga, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-resultados.analisis-mensual` Análisis mensual de conversaciones | L3 | — | analisis/page.tsx:31-60 (gate planAllows) → getMonthlyAnalysisForOrg (forOrg :53-56) → secciones con CalibratingBlock como vacío. |
| `h2.cli-resultados.informe-mensual-pdf` Descargar el informe del mes en PDF | L2 | Sentry, sin mocks ni TODO | analisis/page.tsx:45 → DownloadMonthlyReportButton.tsx:18-35 → client-monthly/route.ts:24-56 → get-client-monthly-report-data.ts:20-76 → monthly-report-data.ts:73-97 → ClientMonthlyReportPdf.tsx:287-318. |
| `h2.cli-resultados.informe-pdf` Descargar informe del mes | L2 | vacíos, Sentry, sin mocks ni TODO | DownloadMonthlyReportButton.tsx:18-41 → api/reports/client-monthly/route.ts:24-56 (org de sesión, gate de plan, renderToBuffer). |
| `h2.cli-resultados.insights-ia` Insights automáticos | L2 | errores, Sentry | trafico/page.tsx:47-49 → results-insights.ts:34-42 (Anthropic, cache 24 h por org) → InsightsBlock.tsx:37-89; no corre sobre datos mock. |
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
| `h2.cli-resenas.borrador-ia` Borrador de respuesta con IA | L2 | errores, validación en servidor, mobile, Sentry | ReviewItem.tsx:46-61 → _actions.ts:11-46 → review-reply-draft.ts:5-44 (Anthropic). |
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

## h4 · Panel de admin

### h4.adm-clientes — Clientes

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 3 funcionalidades: 3×L2).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, autonomía, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-clientes.archivar-cliente` Archivar y desarchivar cliente | L2 | Sentry, autonomía | ClientsListClient.tsx:161-171 -> archiveClient.ts:16-37 (requireSuperAdmin, Zod, update deletedAt) -> page.tsx:23/:34. Funciona como filtro, pero no suspende nada (ver hallazgo). |
| `h4.adm-clientes.eliminar-cliente` Eliminar cliente (hard-delete) | L2 | Sentry, autonomía | ClientsListClient.tsx:192-206 -> hardDeleteClient.ts:107-123 (resumen) -> ClientsListClient.tsx:222-243 -> hardDeleteClient.ts:125-145 (tx + delete) -> audit :166-178. |
| `h4.adm-clientes.envio-manual-del-reporte` Enviar ahora el reporte ejecutivo | L2 | Sentry, sin mocks ni TODO | SendExecutiveReportButton.tsx:37 → route.ts:13-57 → send-manual.ts:33-153 → build.ts → Brevo → WeeklyReportLog. |

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
