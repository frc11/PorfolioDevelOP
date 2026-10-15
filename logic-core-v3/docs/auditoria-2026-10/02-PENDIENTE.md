# 02 — Qué falta

> Madurez de cada herramienta de §6 del plan, con la escala del PROMPT §5.2 (L0 no existe · L1 esqueleto · L2 camino feliz · **L3 listo para cliente** · L4 pulido). **La unidad que se mide es la funcionalidad** (ENMIENDA-01 E7, DEC-25); la madurez de una herramienta es la de su funcionalidad más floja y la de un área, un cálculo agregado. Un L2 o más afirma que algo funciona: exige el camino feliz trazado con `ruta:línea`; si no, queda `L?`. Los faltantes se escriben como `FAL-NNN` bajo su herramienta. La hipótesis de Valentino —«el admin y el portal están muy desarrollados y les faltan sobre todo módulos»— se confirma o se desmiente acá con evidencia, no se asume. Generado por `scripts/auditoria/hallazgos-md.mjs` (funcionalidades de `_crudo/funcionalidades.json`, faltantes de `_crudo/hallazgos.json`).

## Resumen por área

| Área | Herramientas medidas | Funcionalidades | En L3 o más | Faltantes de L3 más comunes | FAL |
|---|---:|---:|---:|---|---:|
| h1 · Acceso | 5 / 5 | 15 | 0 | Sentry (11), autonomía (9), errores (8) | 3 |
| h2 · Portal del cliente | 16 / 16 | 109 | 12 | Sentry (72), sin mocks ni TODO (54), errores (53) | 11 |
| h3 · Chatbot centralizado | 8 / 8 | 111 | 3 | Sentry (66), errores (63), autonomía (51) | 6 |
| h4 · Panel de admin | 13 / 13 | 114 | 3 | Sentry (82), errores (69), autonomía (41) | 8 |
| h5 · Setter y LeadOS | 7 / 7 | 76 | 0 | autonomía (38), Sentry (37), permisos y tenant (26) | 3 |
| h6 · Entradas públicas que alimentan lo interno | 2 / 2 | 8 | 0 | Sentry (6), errores (5), autonomía (4) | 0 |

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

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 17 funcionalidades: 8×L2, 5×L3, 4×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, sin mocks ni TODO, permisos y tenant, autonomía, carga, vacíos.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-inicio.atencion-hoy` Atención hoy | L2 | errores, carga, Sentry, sin mocks ni TODO | page.tsx:177-180 → attention.ts:25-127 (org-scoped) → AttentionStack.tsx:76-160 con Links a rutas existentes; el ítem de conexiones es falso perpetuo. |
| `h2.cli-inicio.brief-ia-programado` Regeneración semanal del resumen ejecutivo IA | L1 | permisos y tenant, errores, Sentry, autonomía | route.ts:18-56 existe; solo vercel.json:8 la agenda. |
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

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 13 funcionalidades: 12×L2, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: vacíos, errores, Sentry, autonomía, permisos y tenant, carga, validación en servidor, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-resultados.analisis-mensual` Analisis mensual del negocio | L2 | errores, Sentry, sin mocks ni TODO | analisis/page.tsx:32-33,60 -> getMonthlyAnalysisForOrg.ts:48-106 -> monthly-analysis.ts:63-209 |
| `h2.cli-resultados.informe-mensual-pdf` Descargar el informe del mes en PDF | L2 | Sentry, sin mocks ni TODO | analisis/page.tsx:45 → DownloadMonthlyReportButton.tsx:18-35 → client-monthly/route.ts:24-56 → get-client-monthly-report-data.ts:20-76 → monthly-report-data.ts:73-97 → ClientMonthlyReportPdf.tsx:287-318. |
| `h2.cli-resultados.informe-pdf` Descargar informe del mes | L2 | vacíos, Sentry, sin mocks ni TODO | DownloadMonthlyReportButton.tsx:18-41 → api/reports/client-monthly/route.ts:24-56 (org de sesión, gate de plan, renderToBuffer). |
| `h2.cli-resultados.insights-ia` Insights de tráfico y SEO con IA | L2 | errores, Sentry | resultados/trafico/page.tsx:168 → getTrafficInsights (results-insights.ts:34-42) → generateTrafficInsights (:54-106) → parseInsights (:176-182) |
| `h2.cli-resultados.oportunidades-seo` Oportunidades SEO con pedido al equipo | L2 | permisos y tenant, errores, Sentry, sin mocks ni TODO | seo/page.tsx:319-321 -> OportunidadesSEO.tsx:10-56 -> OportunidadSEO.tsx:83-97 -> messages.ts:114-140. |
| `h2.cli-resultados.pagespeed` Velocidad del sitio (PageSpeed) | L2 | vacíos, errores, Sentry, autonomía | siteUrl lo carga el admin (updateClient.ts:95; createClientOnly.ts:84) → trafico/page.tsx:99-101 → PageSpeedSection (:125-136) → getPageSpeedReport (pagespeed.ts:26-35, caché 6 h) → PageSpeedCard. Requiere GOOGLE_PAGESPEED_API_KEY (pagespeed.ts:41-45). |
| `h2.cli-resultados.reputacion-gbp` Reputación: rating y últimas reseñas de Google Business | L1 | vacíos, errores, Sentry, sin mocks ni TODO, autonomía | reputacion/page.tsx:20 -> google-business-profile.ts:165-182 -> :185-236 pinta en el primer render, pero en el acierto de caché createdAt llega como string y GBPMetricsCard.tsx:124 lanza; performance fijo en 0 (:218-224). |
| `h2.cli-resultados.seo` Metricas SEO (Search Console) | L2 | Sentry, sin mocks ni TODO | seo/page.tsx:100 resolveOrgId -> :179 getSearchConsoleData -> :230-270 cards con TrendBadge -> SeoAlertas.tsx:9-44. |
| `h2.cli-resultados.seo-search-console` SEO (Search Console) | L2 | vacíos, errores, Sentry, sin mocks ni TODO, autonomía | seo/page.tsx:179 -> searchconsole.ts:99-210 tres consultas en paralelo. |
| `h2.cli-resultados.seo-solicitar-activacion` Pedir SEO avanzado (ACTIVAR AHORA) | L2 | permisos y tenant, errores, carga, validación en servidor, Sentry, autonomía | form (seo/page.tsx:137-141) → activarSeo (:110-113) → requestUpsellAction (upsell.ts:10-156) → contactSubmission.create (:88-97), webhook (:99-104), notificaciones (:112-135). |
| `h2.cli-resultados.trafico` Metricas de trafico (GA4) | L2 | vacíos, errores, Sentry, sin mocks ni TODO, autonomía | trafico/page.tsx:48 -> :147 getAnalyticsData -> :186-241 AnalyticsMetricCard -> TrendBadge; Suspense con AnalyticsSkeleton (:89-94). Datos de mentira (trends fijos) impiden L3. |
| `h2.cli-resultados.trafico-ga4` Tráfico del sitio (GA4) | L2 | permisos y tenant, vacíos, errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | trafico/page.tsx:46 -> analytics.ts:85-195 cuatro runReport en paralelo -> datos con isMockData false. |
| `h2.cli-resultados.velocidad-sitio` Velocidad del sitio (PageSpeed) | L2 | vacíos, errores, validación en servidor, Sentry | trafico/page.tsx:125 -> pagespeed.ts:26-35 (caché 6 h) -> :37-74 -> :76-149. |

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
- Evidencia: `src/app/api/auth/google-business/start/route.ts:7` — «if (!session?.user || session.user.role !== 'SUPER_ADMIN') {»; `src/app/api/auth/google-business/start/route.ts:12` — «const orgId = searchParams.get('orgId')»; `src/app/(protected)/dashboard/resultados/reputacion/page.tsx:52` — «Setup manual por ahora»; `src/app/api/auth/google-business/callback/route.ts:82` — «return NextResponse.redirect(new URL('/admin/clients?gbp=${gbp}', request.url))»; `src/app/api/auth/google-business/callback/route.ts:33` — «new URL('/admin/clients?error=oauth_state_${stateCheck.reason}', request.url),»; `src/lib/integrations/gbp-connection-logic.ts:143` — «status: 'CONNECTED_NO_LOCATION', reason: locations.length === 0 ? 'none' : 'multiple',»; `src/lib/actions/gbp-connection.ts:17` — «export async function listAvailableLocations(): Promise<ActionResult<AvailableLocation[]>> {»
- Impacto: La pestaña queda vacía para todo cliente salvo que alguien de develOP arme a mano /api/auth/google-business/start?orgId=<cuid> (git grep 'google-business/start' → 0 enlaces; tiendanube/start sí está enlazado en ConnectStoreCard.tsx:39). El Motor de reseñas depende de los mismos tokens.
- Propuesta: Botón «Conectar Google Business» en la ficha del cliente del admin (el state firmado ya existe en getAuthUrl).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [UX-015]
- Nodo(s): h2.cli-resultados.reputacion-gbp, h4.adm-clientes, int.google-business-profile, h2.cli-resenas, h4.adm-clientes.conectar-google-business, h2.cli-resenas.selector-sucursal, int.gbp

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

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 6 funcionalidades: 3×L2, 3×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, vacíos, carga, sin mocks ni TODO, autonomía, permisos y tenant, mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-reportes-email.baja-un-clic` Baja de un clic del reporte ejecutivo | L2 | Sentry, autonomía | executive-weekly.ts:289 -> unsubscribe-token.ts:57-66 -> unsubscribe-executive/route.ts:39-101. |
| `h2.cli-reportes-email.envio-automatico-semanal` Envío automático del reporte ejecutivo semanal | L1 | errores, Sentry, autonomía | la ruta (:17-37) y la plantilla (executive-weekly.ts:182-322) existen, pero solo vercel.json:12 la agenda y el hosting es Netlify: no sale sola. |
| `h2.cli-reportes-email.pdf-reporte-ejecutivo` Descarga de reporte ejecutivo en PDF | L1 | vacíos, errores, carga, Sentry, sin mocks ni TODO, autonomía | Maqueta no cableada: DownloadReportButtons (DownloadReportButton.tsx:129) sin importadores y alimentado con mockData (:82-89, :122). |
| `h2.cli-reportes-email.preferencias-del-reporte` Preferencias del reporte semanal | L2 | errores, carga, mobile, Sentry, sin mocks ni TODO | perfil/page.tsx:193-203,297-306 → ExecutiveReportPrefsForm → executive-report-prefs.actions.ts:20-46 → Organization → send.ts:83,114 y build.ts:99,161. |
| `h2.cli-reportes-email.preferencias-reporte` Frecuencia y leads destacados del reporte semanal | L2 | errores, Sentry | perfil/page.tsx:196, :304-309 -> ExecutiveReportPrefsForm.tsx:45-56 -> executive-report-prefs.actions.ts:20-47. |
| `h2.cli-reportes-email.reporte-semanal` Reporte ejecutivo semanal por email | L1 | permisos y tenant, errores, Sentry, sin mocks ni TODO, autonomía | El motor existe (send.ts:73-233, build.ts:64-198) pero no hay disparador en Netlify (netlify.toml:25-32; solo vercel.json:11-14): el cliente no recibe nada salvo envío manual del admin. |

### h2.cli-resenas — Motor de reseñas (módulo)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 8 funcionalidades: 6×L2, 1×L3, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, Sentry, sin mocks ni TODO, vacíos, errores, validación en servidor, autonomía, mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-resenas.borrador-ia` Borrador de respuesta a reseñas con IA | L2 | errores, validación en servidor, Sentry | motor-resenas/_actions.ts:11-46 → generateReviewReplyDraft (review-reply-draft.ts:5-44) |
| `h2.cli-resenas.estado-conectando` Estado 'conectando tu Google' | L3 | — | ConnectingState.tsx:13-46 via resolveMotorResenasView (motor-resenas-view.ts:38-42). |
| `h2.cli-resenas.pedir-resenas-qr` Pedir resenas con QR y link | L2 | errores, autonomía | AskReviewSection.tsx:42-137 con placeId de la org (page.tsx:161). |
| `h2.cli-resenas.publicar-respuesta` Publicar respuesta en Google | L2 | permisos y tenant, errores, validación en servidor, mobile, Sentry | ReviewItem.tsx:64-79 → _actions.ts:48-73 → google-business-profile.ts:275-305. |
| `h2.cli-resenas.responder-resenas-con-ia` Listar y responder resenas con borrador IA | L2 | vacíos, errores, validación en servidor, Sentry | page.tsx:19-80 -> listReviews; ReviewItem.tsx:46-79 -> motor-resenas/_actions.ts:11-73. |
| `h2.cli-resenas.selector-sucursal` Elegir la sucursal de Google Business | L1 | permisos y tenant, errores, Sentry, autonomía | server actions (gbp-connection.ts:17,36) sin ninguna pantalla que las importe. |
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

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 3 funcionalidades: 2×L2, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, sin mocks ni TODO, autonomía, validación en servidor, vacíos.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-tienda.conectar-tienda` Conectar la tienda Tiendanube | L1 | errores, validación en servidor, Sentry, autonomía | el botón del cliente (ConnectStoreCard.tsx:39) choca con SUPER_ADMIN en start (:10-13); solo anda impersonando: start -> tiendanube.ts:17-22 -> callback :28-85 -> tienda-conectada/page.tsx:306. |
| `h2.cli-tienda.resumen-de-ventas` Resumen de ventas de Tiendanube | L2 | errores, Sentry, sin mocks ni TODO, autonomía | page.tsx:86-255 -> tiendanube.ts:82-162 (conexion hecha por develOP). |
| `h2.cli-tienda.resumen-tienda` Resumen de la tienda (ventas, ticket, stock bajo, carritos) | L2 | vacíos, errores, Sentry, autonomía | tienda-conectada/page.tsx:87 -> tiendanube.ts:74-80 (caché 30 min) -> :82-164 cuatro GET y agregados. |

### h2.cli-agenda — Agenda inteligente (módulo)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 3 funcionalidades: 3×L1).
- Criterios de L3 que faltan en alguna funcionalidad: validación en servidor, mobile, autonomía, errores, Sentry.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-agenda.conectar-agenda` Conectar y ver la agenda (Cal.com) | L1 | validación en servidor, mobile, autonomía | La vista conectada existe (agenda-inteligente/page.tsx:344-349) pero ningún código de la app escribe calComApiKey, calComUsername ni calComEmbedUrl (git grep en src, scripts y prisma: solo lecturas). Sin edición manual de la base, el cliente ve siempre 'Tu age |
| `h2.cli-agenda.panel-de-agenda` Panel de agenda (Cal.com) | L1 | errores, mobile, Sentry, autonomía | page.tsx:316-353 -> cal-com.ts:40-111 contra api.cal.com/v1 (apagada segun cal-com-v2.ts:4-5). |
| `h2.cli-agenda.resumen-agenda` Agenda inteligente: próximas reuniones y totales de Cal.com | L1 | errores, Sentry, autonomía | agenda-inteligente/page.tsx -> cal-com.ts:32-111 contra api.cal.com/v1 (:4), que cal-com-v2.ts:4-6 da por apagada (PROBABLE). |

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
| `h3.cli-chatbot.reporte-semanal-email` Reporte semanal del chatbot por email | L2 | permisos y tenant, vacíos, errores, Sentry, autonomía | netlify.toml:28-29 -> send-weekly-reports-cron.ts:63-108 -> route.ts:7-21 -> sendWeeklyReports.ts:58-66 (fuera) -> weekly-report.ts:25-175. |
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

### [FAL-020] Reporte semanal del chatbot sin forma de darse de baja (el link de preferencias lleva a una ruta que no existe, sin List-Unsubscribe ni opt-out), con destinatario no determinístico y link con fallback a localhost
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/reports/sendWeeklyReports.ts:27` — «take: 1, (members where role ADMIN, sin orderBy)»; `src/modules/chatbot/server/reports/sendWeeklyReports.ts:57` — «const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'»; `src/lib/email/templates/executive-weekly.ts:289` — «Dejar de recibir este reporte (control: el executive report si tiene unsubscribe)»; `src/lib/email/templates/weekly-report.ts:164` — «<a href="${data.dashboardUrl}/preferences" style="color:#06b6d4; text-decoration:none;">cambiá tus preferencias</a>.»; `src/modules/chatbot/server/reports/sendWeeklyReports.ts:60` — «dashboardUrl: '${appUrl}/dashboard/chatbot',»; `prisma/schema.prisma:387` — «executiveReportOptOut Boolean @default(false)»
- Impacto: El cliente recibe dos mails semanales (este y el executive report); este no tiene baja ni registro de envio (un reintento del cron duplica), va al primer ADMIN que devuelva la base y el boton puede apuntar a localhost si falta la variable.
- Propuesta: Unificar con el executive report o sumarle opt-out y WeeklyReportLog; orderBy determinista y leadNotificationEmail como destinatario; fallar si falta la URL.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.reports, int.brevo, int.cron.send-weekly-reports, h3.cli-chatbot.reporte-semanal-email

### h3.adm-chatbots — Chatbots (admin)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 30 funcionalidades: 1×L3, 27×L2, 1×L1, 1×L?).
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
| `h3.adm-chatbots.insights-automaticos` Generación diaria de insights del chatbot | L2 | permisos y tenant, errores, Sentry, autonomía | netlify.toml:25-26 -> generate-insights-cron.ts:44-104 -> route.ts:10-96 -> generateInsightsForBot (fuera). |
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

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 6 funcionalidades: 6×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, vacíos, mobile, autonomía, errores, validación en servidor, Sentry, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h3.adm-actividad.grafico-7-dias` Grafico de actividad de 7 dias | L2 | permisos y tenant, vacíos, errores, Sentry | activity/page.tsx:12 -> getActivityChartData.ts:3-38 |
| `h3.adm-actividad.grafico-semanal` Gráfico de eventos por día | L2 | permisos y tenant, vacíos, sin mocks ni TODO | activity/page.tsx:12 -> getActivityChartData.ts:12-37 -> ActivityChart.tsx:18-79. |
| `h3.adm-actividad.log-bot-develop` Activity log del bot de develOP | L2 | permisos y tenant, vacíos, mobile, autonomía | activity/page.tsx:10-19 → ActivityChart + ActivityLog (polling events/route.ts) |
| `h3.adm-actividad.purga-eventos` Purga diaria de eventos del chatbot (30 días) | L2 | errores, Sentry | netlify.toml:31-32 -> cleanup-old-events-cron.ts:6-41 -> route.ts:16-30 -> cleanupOldEvents (fuera). |
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

### h4.adm-shell — Shell del admin

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 3 funcionalidades: 2×L2, 1×L3).
- Criterios de L3 que faltan en alguna funcionalidad: mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-shell.acceso-y-layout` Guard SUPER_ADMIN y shell del admin | L2 | mobile | Camino feliz: layout.tsx:41-49 (auth + rol) -> :52-55 badges -> AdminLayoutClient.tsx:74-101 (sidebar + main). No llega a L3 por mobile parcial (hamburguesa sobre el drawer, AdminLayoutClient.tsx:43-46). |
| `h4.adm-shell.confirmaciones` Confirmaciones de acciones destructivas | L3 | — | Consumidores fuera del lote (ClientsListClient, BotDetailClient, BulkActionBar, ImpersonateButton, BillingOverrideForm por git grep) -> confirm-dialog.tsx:42 portal a body -> :85-96 confirmar con isPending; type-to-confirm-dialog.tsx:41, :107 exige la frase. F |
| `h4.adm-shell.navegacion` Sidebar, topbar y volver | L2 | mobile | admin-sidebar.tsx:57-100 secciones -> :131-195 Link con activo y badge (datos de layout.tsx:11, :21) -> admin-topbar.tsx:66-77 breadcrumb/título -> :85 signOutAction (flujo D1 'Logout'). Título 'Detalle' en Novedades (admin-topbar.tsx:12-13) y mobile parcial. |

### h4.adm-dashboard — Dashboard del admin

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 3 funcionalidades: 3×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-dashboard.kpis-comerciales` KPIs comerciales | L2 | permisos y tenant | page.tsx:182-221 (settings, osDemo.count, osLead.count por estado) -> :343-350 objetivo, progreso y tasas -> :576-614 StatCard/DualMetricCard. Permisos heredados y tasa de respuesta sesgada. |
| `h4.adm-dashboard.kpis-operativos-y-financieros` KPIs operativos y financieros | L2 | permisos y tenant | page.tsx:222-250 (subscription.aggregate, organization.count, ticket.count, project.count) y :281-340 (proyectos con agreedAmount, pagos, horas) -> :351-427 cálculo -> :625-700 render. |
| `h4.adm-dashboard.tendencias-historicas` Tendencias de semanas y meses | L2 | permisos y tenant | page.tsx:443-542 series -> :710-716 DashboardHistoryCharts -> dashboard-history-charts.tsx:125-318 -> chart-card.tsx:18 aria-label. |

### h4.adm-clientes — Clientes

- Madurez de la herramienta: **L0** (la de su funcionalidad más floja; 37 funcionalidades: 33×L2, 1×L3, 1×L0, 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, autonomía, sin mocks ni TODO, errores, validación en servidor, permisos y tenant, mobile, carga.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-clientes.acciones-masivas` Pausar bots y exportar leads de varios clientes | L2 | validación en servidor, Sentry, sin mocks ni TODO | ClientsListClient.tsx:16 → bulk-actions.ts:8-44 / :46-80. |
| `h4.adm-clientes.alta-cliente` Alta de cliente (wizard) | L2 | errores | ClientsListClient.tsx:352 -> new/page.tsx:14 -> flujo D5 'Alta de cliente con bot (asistente)' (OnboardingWizard.tsx:87 -> Step5Review.tsx:71 -> createClientWithBot.ts:96). El listado no se invalida tras el alta. |
| `h4.adm-clientes.alta-cliente-con-bot` Alta de cliente con chatbot | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO | clients/new/page.tsx:14 -> OnboardingWizard.tsx:87-160 -> Step5Review.tsx:66-86 -> createClientWithBot.ts:96-273 -> Step5Review.tsx:123-193. |
| `h4.adm-clientes.alta-cliente-sin-bot` Alta de cliente sin chatbot | L2 | errores, validación en servidor, Sentry | Step1Company.tsx:58-69 -> Step5Review.tsx:87-108 -> createClientOnly.ts:48-175. |
| `h4.adm-clientes.alta-sin-bot` Alta de cliente sin chatbot | L2 | errores, Sentry, autonomía | Step5Review.tsx:87 -> createClientOnly.ts:48-111 -> :132-147 email -> :165-175 |
| `h4.adm-clientes.archivar` Archivar / desarchivar cliente | L2 | permisos y tenant, errores, Sentry | ClientsListClient.tsx:164 → archiveClient.ts:17 → :25-35 → :37 → :48-49 → admin/clients/page.tsx:23 (flujo D6) |
| `h4.adm-clientes.archivar-cliente` Archivar y desarchivar cliente | L2 | Sentry, autonomía | ClientsListClient.tsx:161-171 -> archiveClient.ts:16-37 (requireSuperAdmin, Zod, update deletedAt) -> page.tsx:23/:34. Funciona como filtro, pero no suspende nada (ver hallazgo). |
| `h4.adm-clientes.avatar-cliente` Avatar del cliente | L2 | Sentry | ClientAvatarField.tsx:24-83 -> AvatarUploader.tsx:19-66 (WebP 200 px) -> createClientWithBot.ts:28-30 / EditClientForm -> ClientAvatar.tsx:16-75. |
| `h4.adm-clientes.billing-override` Billing override | L2 | errores, validación en servidor, Sentry | BillingOverrideForm.tsx:50-73 -> plan.actions.ts:244-313; quitar :75-90 -> :320-370. Default 0 USD sin confirmacion y fecha corrida. |
| `h4.adm-clientes.borrador-alta` Borrador automático del alta | L2 | sin mocks ni TODO | useOnboardingDraft.ts:26-56 restaura, :59-78 autoguarda; DraftBanner.tsx:12-42; OnboardingWizard.tsx:115-121. |
| `h4.adm-clientes.borrador-del-alta` Borrador persistente del alta de cliente | L2 | errores, Sentry | admin/clients/new/page.tsx:14 -> OnboardingWizard.tsx:98 -> useOnboardingDraft.ts:26-56 restore, :59-78 autosave, OnboardingWizard.tsx:140 clearDraft al crear. |
| `h4.adm-clientes.boveda-alta-activo` Alta de activo en la bóveda del cliente | L2 | permisos y tenant, errores, validación en servidor, Sentry | VaultManager.tsx:25 (fuera del lote) -> agency-actions.ts:98-101 rol -> :103-111 clientAsset.create -> flujo D2 'Bóveda del cliente' (boveda/page.tsx:129). La credencial queda en claro. |
| `h4.adm-clientes.boveda-carga` Subir un recurso a la Bóveda del cliente | L2 | errores, validación en servidor, mobile, Sentry, sin mocks ni TODO, autonomía | VaultTab.tsx:6 → VaultManager.tsx:19-34 → agency-actions.ts:94-113 (flujo D2 «Bóveda del cliente»). |
| `h4.adm-clientes.conectar-google-business` Conectar Google Business de un cliente (OAuth) | L1 | errores, validación en servidor, Sentry, autonomía | callback trazado (callback/route.ts:14-82; oauth-state.ts:72-120; gbp-connection-logic.ts:219-230) pero sin entrada en la UI y con el resultado ?gbp= sin lector. |
| `h4.adm-clientes.crear-entregable` Crear entregable y notificar al cliente | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | ProjectsTab.tsx:7 → ProjectManager.tsx:12-26 → agency-actions.ts:14-91 (assertProjectBelongsToOrg :29). |
| `h4.adm-clientes.detalle` Ficha del cliente | L3 | — | page.tsx:28-31 -> :39-69 -> :75-83 -> :85-93; cumple los criterios aplicables. Deuda: router.push en switcher, cuid en URL, archivados sin marca. |
| `h4.adm-clientes.editar-datos` Editar datos del cliente | L2 | errores, carga, Sentry | EditClientForm.tsx:79 → updateClient.ts:29 (guard) → :33-37 (Zod) → :42-65 (lee org+admin) → :71-81 (unicidad email) → :83-119 (tx) → :121 (audit) → :148-149 (revalidate) |
| `h4.adm-clientes.eliminar` Eliminar cliente (hard-delete) | L2 | errores | ClientsListClient.tsx:437-454 -> :192-207 -> :521-531 TypeToConfirmDialog -> :222-243 -> hardDeleteClient.ts (flujo D6). |
| `h4.adm-clientes.eliminar-cliente` Eliminar cliente (hard-delete) | L2 | Sentry, autonomía | ClientsListClient.tsx:192-206 -> hardDeleteClient.ts:107-123 (resumen) -> ClientsListClient.tsx:222-243 -> hardDeleteClient.ts:125-145 (tx + delete) -> audit :166-178. |
| `h4.adm-clientes.eliminar-definitivo` Eliminar cliente (hard-delete) | L2 | permisos y tenant, errores, Sentry | ClientsListClient.tsx:196 → hardDeleteClient.ts:107-123 → ClientsListClient.tsx:527 (confirm) → :227 → hardDeleteClient.ts:125-146 → :166 → :181-182 |
| `h4.adm-clientes.envio-manual-del-reporte` Enviar ahora el reporte ejecutivo | L2 | Sentry, sin mocks ni TODO | SendExecutiveReportButton.tsx:37 → route.ts:13-57 → send-manual.ts:33-153 → build.ts → Brevo → WeeklyReportLog. |
| `h4.adm-clientes.facturacion` Ciclo de cobro del cliente | L0 | sin mocks ni TODO | No existe: OverviewTab.tsx:72-74 solo monta plan, override y reporte; invoice solo se escribe en prisma/seed.ts:595 y :618; subscription solo en plan.actions.ts y get-plan-for-org.ts:50 (git grep). |
| `h4.adm-clientes.impersonar` Impersonar al cliente | L2 | errores, validación en servidor, Sentry | ImpersonateButton.tsx:20-29 -> client.actions.ts:8 -> flujo D1 'Impersonacion de soporte'. |
| `h4.adm-clientes.listado` Listado de clientes | L2 | mobile | Camino feliz: page.tsx:91-94 -> :62-65 -> ClientsListClient.tsx:258-304 -> :497-517 -> :630. No llega a L3 por mobile parcial (fijar oculto sin hover) y cache que no se invalida en el alta. |
| `h4.adm-clientes.notas-internas` Notas internas inline | L2 | errores, Sentry | InternalNotesCard.tsx:43 → updateClientInternalNotes.ts:20 → :22-25 → :29-38 → :40 → :54 |
| `h4.adm-clientes.plan` Asignar plan | L2 | errores, Sentry | PlanAssignmentForm.tsx:39-49 -> plan.actions.ts:88-92 -> :101-122 -> :179-208 -> :210-235. Falla: precio legacy desincronizado, downgrade no cancelable, error crudo. |
| `h4.adm-clientes.plantilla-kb-industria` Plantilla de KB por industria | L2 | validación en servidor, sin mocks ni TODO | Step3KnowledgeBase.tsx:9-23 getTemplate -> kb-templates/index.ts:25-40 -> createClientWithBot.ts:192-202; también createBot.ts:58, :93-102 y lib/onboarding/core.ts:7. |
| `h4.adm-clientes.redireccion-chatbot-legacy` Redireccion legacy de chatbot | L2 | validación en servidor | page.tsx:20-23 -> :28-31 -> :35-38. Solo slug; sin install/integrations. |
| `h4.adm-clientes.reenviar-credenciales` Reenviar credenciales temporales | L2 | permisos y tenant, Sentry, sin mocks ni TODO | ResendCredentialsButton.tsx:18 → route.ts:16-113. |
| `h4.adm-clientes.reporte-ejecutivo-manual` Enviar ahora el reporte ejecutivo de una org | L2 | Sentry | Flujo D2 «Envío manual del reporte (admin)»: SendExecutiveReportButton.tsx:37 → route.ts:9-91 → send-manual.ts. |
| `h4.adm-clientes.resumen-chatbot` Resumen del chatbot en la ficha del cliente | L2 | mobile, sin mocks ni TODO, autonomía | ChatbotTab.tsx:101 → ChatbotManager.tsx:35-157. |
| `h4.adm-clientes.servicios-contratados` Servicios contratados del cliente | L1 | errores, validación en servidor, Sentry, autonomía | CRUD en services.ts sin importadores (git grep vacío); Service solo se escribe como efecto de proyectos (project.actions.ts:280, :291) y se lee en OverviewTab.tsx:26. No hay UI para gestionarlo directamente. |
| `h4.adm-clientes.tab-boveda` Pestana Boveda | L2 | errores, validación en servidor, Sentry | VaultTab.tsx:15-18 -> :39-42 -> :71; alta :26 -> VaultManager -> agency-actions.ts:94. |
| `h4.adm-clientes.tab-chatbot` Pestana Chatbot | L2 | sin mocks ni TODO | ChatbotTab.tsx:15-36 -> :65-99 -> :101-124 -> :127-163. La cuota mostrada no es la efectiva. |
| `h4.adm-clientes.tab-proyectos` Pestana Proyectos | L2 | validación en servidor | ProjectsTab.tsx:14-20 -> :22-25 -> :73 ProjectManager -> agency-actions.ts:14. |
| `h4.adm-clientes.tab-soporte` Pestana Soporte | L2 | — | SupportTab.tsx:15-26 -> :30-53 -> :55-84. 'Ver todos' sin filtro. |
| `h4.adm-clientes.tarea-para-aprobacion` Pedir aprobación de una entrega al cliente | L2 | errores, validación en servidor, Sentry | ProjectManager.tsx:18 (fuera del lote) -> agency-actions.ts:19-22 -> :29 assertProjectBelongsToOrg -> :37-72 transacción task + notificaciones -> :75-88 emails -> flujo D2 'Aprobar o pedir cambios en una entrega'. |

### [FAL-023] Falta el ciclo de cobro en el admin: facturas, renovacion y estado de la suscripcion solo existen por seed
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/_components/tabs/OverviewTab.tsx:72` — «<PlanAssignmentCard clientId={clientId} /> <BillingOverrideCard clientId={clientId} /> <ExecutiveReportCard clientId={clientId} />»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:191` — «status: SubscriptionStatus.ACTIVE,»; `prisma/seed.ts:595` — «await prisma.invoice.upsert({»
- Impacto: El portal muestra facturas (dashboard/cuenta/facturacion/page.tsx:70) y alerta por suscripciones por vencer (lib/alerts.ts:244), pero ninguna pantalla ni action del admin crea Invoice, fija renewalDate o cambia el estado de la Subscription (las unicas escrituras de subscription estan en plan.actions.ts y get-plan-for-org.ts:50; invoice solo en seed.ts:595 y :618). Para el primer cliente real, Facturacion queda vacia y la alerta nunca dispara. Confirma la hipotesis: lo que falta en Clientes son modulos, no la base.
- Propuesta: Modulo 'Facturacion' en la ficha del cliente: alta de factura (monto desde Plan/override vigente, vencimiento, link de pago, PDF), marcar pagada, fijar renovacion y estado (ACTIVE/PAST_DUE/CANCELLED) con audit.
- Esfuerzo: L  ·  Zona: libre
- Relacionado: [BUG-050]
- Nodo(s): h4.adm-clientes, h4.adm-clientes.facturacion, h2.cli-cuenta, modelo.Invoice, modelo.Subscription

### h4.adm-proyectos — Proyectos

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 12 funcionalidades: 11×L2, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, mobile, Sentry, autonomía, validación en servidor, vacíos, carga, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-proyectos.alta-edicion` Crear y editar proyecto (cliente o interno) | L2 | errores, Sentry, autonomía | project-form.tsx:152-188 -> project.actions.ts:593-641 (alta: resolveProjectOrganization :225-258, project.create :604, hitos :620) / :643-720 (edición) -> router.refresh (project-form.tsx:188). |
| `h4.adm-proyectos.aprobacion-entregas` Enviar una tarea completada a aprobación del cliente | L2 | errores, validación en servidor, Sentry, autonomía | task-list.tsx:456-458 -> :622-631 -> src/lib/actions/projects.ts:177-209 (PENDING_APPROVAL :194 + Message al cliente :197) -> flujo D2 'Aprobar o pedir cambios en una entrega'. |
| `h4.adm-proyectos.borrado` Eliminar proyecto (tablero y ficha) | L2 | errores, validación en servidor, Sentry | draggable-project-card.tsx:84-105 -> projects-board.tsx:149-166 -> project.actions.ts:782-831. Desde la ficha: delete-project-button.tsx:58-85 -> src/lib/actions/projects.ts:108-117 (fuera del lote). |
| `h4.adm-proyectos.carga-horas` Carga de horas por tarea | L2 | permisos y tenant, errores, Sentry, sin mocks ni TODO | time-entry-panel.tsx:8-11 → time-entry.actions.ts:136-189; hours/page.tsx:58 → :270-302. |
| `h4.adm-proyectos.eliminar-proyecto` Eliminar proyecto desde el detalle | L2 | errores, carga, validación en servidor, Sentry | projects/[projectId]/page.tsx:323 → delete-project-button.tsx:75 → projects.ts:109-117 |
| `h4.adm-proyectos.enviar-a-aprobacion` Enviar entrega a aprobación del cliente | L2 | errores, validación en servidor, Sentry, autonomía | task-list.tsx:622-630 → projects.ts:178-208 → flujo D2 'Aprobar o pedir cambios en una entrega' |
| `h4.adm-proyectos.ficha` Ficha del proyecto (resumen, finanzas, estado, ver como cliente) | L2 | permisos y tenant, errores, Sentry | layout.tsx:105-162 -> page.tsx:99-167 -> render; estado: project-status-control.tsx:43-63 -> project.actions.ts:722-780 -> router.refresh (project-status-control.tsx:62). |
| `h4.adm-proyectos.horas` Carga y borrado de horas por tarea, con métricas de horas y valor hora | L2 | errores, Sentry, autonomía | hours/page.tsx:28-58 -> time-entry-panel.tsx:138-179 -> time-entry.actions.ts:136 (fuera del lote) -> router.refresh (time-entry-panel.tsx:177). |
| `h4.adm-proyectos.mantenimiento` Mantenimiento mensual (generar meses y marcar pagado) | L1 | permisos y tenant, errores, carga, Sentry, autonomía | El código está completo (payments/page.tsx:175-322; maintenance.actions.ts:60-174), pero su puerta de entrada, maintenanceStartDate, no la escribe ninguna UI ni action: el único escritor es prisma/seed-agency-os.ts:1396. El camino feliz no se puede alcanzar si |
| `h4.adm-proyectos.pagos-hitos` Hitos de pago (inicio y entrega) y marcar pagado | L2 | permisos y tenant, vacíos, errores, carga, Sentry, autonomía | project.actions.ts:620 -> :330-345 (hitos 50/50) -> payments/page.tsx:81-92 -> :154-160 -> milestone.actions.ts:23-43 (revalidate :42). |
| `h4.adm-proyectos.tablero-kanban` Tablero de proyectos por estado con filtros y arrastre | L2 | permisos y tenant, errores, mobile, Sentry, autonomía | Camino feliz trazado: page.tsx:19-22 -> project.actions.ts:934-1014 -> projects-board.tsx:89-92 -> project-list.tsx:121-133 -> projects-board.tsx:130-143 -> project.actions.ts:745-754 -> projects-board.tsx:118. No llega a L3: un proyecto nuevo queda oculto por |
| `h4.adm-proyectos.tareas` Tareas de un proyecto (crear, editar, borrar) | L2 | errores, Sentry | task-form.tsx:7-10 → task.actions.ts:155-191; task-list.tsx:17-20 → :197-257; listado tasks/page.tsx:34 → :321-371. |

### [FAL-007] El ciclo de vida de Project no modela mantenimiento ni cancelación: maintenanceStartDate no tiene escritor, deliveredAt no se limpia al reabrir y la migración v2 convirtió CANCELADO en COMPLETED
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:115` — «const isInMaintenance = Boolean(project.maintenanceStartDate)»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:204` — «El proyecto pasara a mantenimiento cuando tenga una fecha de inicio de mantenimiento.»; `src/app/(protected)/admin/projects/_actions/maintenance.actions.ts:120` — «if (!project.maintenanceStartDate) { return fail('Project has no maintenance start date')»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:750` — «status: parsed.status, ...(parsed.status === ProjectStatus.COMPLETED ? { deliveredAt: new Date() }»; `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:135` — «WHEN 'EN_MANTENIMIENTO' THEN 'IN_PROGRESS'::"ProjectStatus" WHEN 'CANCELADO' THEN 'COMPLETED'::"ProjectStatus"»; `prisma/schema.prisma:38` — «enum ProjectStatus { PLANNING IN_PROGRESS»; `src/app/(protected)/admin/projects/_actions/project.schemas.ts:58` — «monthlyRate: optionalPositiveNumberSchema, estimatedEndDate: optionalDateSchema,»; `prisma/seed-agency-os.ts:1396` — «maintenanceStartDate: daysAgo(44, 10),»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:751` — «...(parsed.status === ProjectStatus.COMPLETED ? { deliveredAt: new Date() } : {}),»; `src/app/(protected)/admin/projects/[projectId]/page.tsx:208` — «Entregado: {formatDate(project.deliveredAt)}»
- Impacto: Para el primer proyecto entregado con abono mensual: ninguna action ni formulario escribe maintenanceStartDate (solo seed-agency-os.ts y los proyectos migrados lo tienen), así que 'Generar meses pendientes' nunca aparece y el mantenimiento no se puede cobrar por el flujo previsto. Reabrir un proyecto COMPLETED deja el deliveredAt viejo y volver a completarlo pisa la fecha real de entrega. Un proyecto cancelado no tiene estado posible: los CANCELADO legacy quedaron COMPLETED y el cliente los ve como 'Completado'.
- Propuesta: Agregar el inicio de mantenimiento a la edición del proyecto (o setearlo al completar si hay monthlyRate), limpiar deliveredAt al salir de COMPLETED y no pisarlo si ya existe. Decisión para Valentino (schema FROZEN): sumar CANCELLED (y quizá MAINTENANCE) a ProjectStatus y revisar los proyectos legacy que eran CANCELADO.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos, h2.cli-proyecto, modelo.Project, modelo.OsMaintenancePayment, h4.adm-proyectos.mantenimiento, h4.adm-proyectos.ficha

### h4.adm-equipo — Equipo

- Madurez de la herramienta: **L0** (la de su funcionalidad más floja; 3 funcionalidades: 1×L2, 2×L0).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, sin mocks ni TODO, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-equipo.alta-baja-miembros` Alta, baja y rol de miembros del equipo | L0 | autonomía | Ninguna UI ni action viva escribe role SUPER_ADMIN (git grep); inviteTeamMemberAction vive en lib/actions/settings.ts:148 sin importadores. |
| `h4.adm-equipo.invitar-miembro` Invitar miembro del equipo | L0 | autonomía | inviteTeamMemberAction (settings.ts:148) e invitations.ts no tienen importadores; no hay UI de invitación en admin/team ni admin/settings (git grep -i invit vacío) |
| `h4.adm-equipo.workload` Workload por miembro | L2 | permisos y tenant, sin mocks ni TODO, autonomía | team/page.tsx:19-170 → member-workload.tsx:215-266. |

### [FAL-028] No hay gestión del equipo interno: ninguna pantalla ni action viva da de alta, baja o cambia el rol de un SUPER_ADMIN, y la consola nueva perdió invitar miembro y probar el webhook
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/team/page.tsx:19` — «const users = await prisma.user.findMany({ where: { role: Role.SUPER_ADMIN,»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:521` — «Usuarios con rol SUPER_ADMIN habilitados para operar la OS.»; `src/lib/actions/settings.ts:148` — «export async function inviteTeamMemberAction(input: {»; `src/lib/actions/settings.ts:309` — «export async function testWebhookAction(input?: {»
- Impacto: Sumar un colaborador o sacar a uno que se va exige tocar la base a mano (y su JWT sigue vivo, SEC-023). Las funciones del admin clásico (invitar, probar webhook, probar n8n, verificar permisos de Google) siguen en lib/actions/settings.ts, sin importadores. Mide la hipótesis de Valentino: al admin le faltan módulos más que pantallas.
- Propuesta: Módulo Equipo con invitar (reusando inviteTeamMemberAction con token hasheado), desactivar y cambiar rol, todo auditado; botón 'Probar webhook' en Configuración; después podar lib/actions/settings.ts.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [DEU-001]
- Nodo(s): h4.adm-equipo, h4.adm-equipo.alta-baja-miembros, h4.adm-config, modelo.User

### h4.adm-leads — Leads

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 21 funcionalidades: 18×L2, 3×L1).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, validación en servidor, mobile, Sentry, errores, carga, sin mocks ni TODO, vacíos, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-leads.actividad-comercial` Registrar actividad comercial y timeline | L2 | permisos y tenant, validación en servidor, Sentry | lead-activity-feed.tsx:131 -> :75 createActivity (sale a activity.actions.ts, revalida admin-leads :28 por git grep) -> :87-90 limpia + refresh. |
| `h4.adm-leads.actividad-y-demos` Actividad comercial y demos desde el admin | L2 | errores, validación en servidor, Sentry | activity.actions.ts:13-29 -> os-commercial; demo.actions.ts:15-25, :35-62 |
| `h4.adm-leads.alta-edicion` Alta y edición de lead | L2 | permisos y tenant, validación en servidor, Sentry | page.tsx:159 -> lead-form.tsx:129 safeParse -> :140-141 createLead/updateLead (sale a lead.actions.ts) -> :148-149 cierra + refresh. |
| `h4.adm-leads.asignacion-setter` Asignar lead a setter y marcar caliente | L2 | errores, Sentry | lead.actions.ts:137-224 (rol destino, update, rastro, novedades, revalidate) |
| `h4.adm-leads.asignar-setter` Asignar setter y marcar caliente | L2 | permisos y tenant, validación en servidor, Sentry | [leadId]/page.tsx:212-216 + :225 cargarCargaSetters (sale a lib/leados) -> :412 -> assign-setter-control.tsx:224 -> :63 assignLeadSetter (sale a lead.actions.ts) -> :72-73. |
| `h4.adm-leads.carga-por-setter` Carga y ratio en la asignación | L2 | autonomía | admin/leads/[leadId]/page.tsx:225 -> setter-carga.ts:55-122 -> revision.ts:96. |
| `h4.adm-leads.cierre-post-reunion` Marcar reunión realizada y registrar el resultado | L2 | errores, Sentry, autonomía | reunion.actions.ts:50 -> agenda.ts:348-358; reunion.actions.ts:71 -> agenda.ts:365-382 -> reunion.actions.ts:81-84 |
| `h4.adm-leads.cierre-reunion` Cierre de loop post-reunión | L1 | errores, Sentry, autonomía | Requiere una agenda AGENDADA que solo crea confirmarReunion, inoperante sin Cal.com; RE_SEGUIMIENTO deja estado sin salida |
| `h4.adm-leads.convertir-a-proyecto` Convertir lead cerrado en proyecto | L1 | errores, sin mocks ni TODO | [leadId]/page.tsx:227 canConvertToProject + :281-289 botón disabled sin handler; convertLeadToProject (project.actions.ts:833) y ConvertLeadDialog (convert-lead-dialog.tsx:72) existen sin importadores. |
| `h4.adm-leads.crud-y-estado` Alta, edición, cambio de estado y borrado de leads outbound | L2 | errores, validación en servidor, Sentry, autonomía | lead.actions.ts:52-121, :230-247; UI trazada en [D3] Kanban outbound y Alta y edición de lead outbound |
| `h4.adm-leads.demanda-modulos` Demanda medida de módulos premium | L2 | errores, Sentry | module-demand.actions.ts:25-50; UI en [D3] Demanda de módulos |
| `h4.adm-leads.demos` Demos y Looms del lead | L2 | permisos y tenant, errores, validación en servidor, Sentry | demo-form.tsx:153 -> :113 createDemo (sale a demo.actions.ts) -> :126-128 refresh; :246 markDemoViewed (sale). |
| `h4.adm-leads.digest-follow-ups-telegram` Digest diario de follow-ups por Telegram | L1 | errores, Sentry, autonomía | El código del camino feliz está completo (route.ts:153-295), pero solo está agendado en vercel.json:4 y el deploy es Netlify (netlify.toml:25-32 no lo agenda): en producción no corre. |
| `h4.adm-leads.eliminar-lead` Eliminar lead con confirmación | L2 | permisos y tenant, validación en servidor, Sentry | lead-card.tsx:120-123 -> :184-195 InlineConfirm -> lead-pipeline.tsx:143-161 deleteLead (sale a lead.actions.ts) -> :153 rollback / :160 refresh. |
| `h4.adm-leads.ficha-y-estado` Ficha del lead y cambio de estado | L2 | permisos y tenant, errores, carga, validación en servidor, Sentry, sin mocks ni TODO | lead-card.tsx:69 -> [leadId]/page.tsx:183-217 -> :279 -> change-status-select.tsx:37 updateLeadStatus (sale) -> :49 refresh. |
| `h4.adm-leads.filtros-outbound` Filtros del board (servicio, período, setter, ubicación) | L2 | — | outbound-leads-view.tsx:27-30 -> lead-filters.ts:43 deriveFilterOptions / :154 applyLeadFilters -> lead-filters-bar.tsx:59-129 -> location-typeahead.tsx:118-133. |
| `h4.adm-leads.inbound` Inbound por período y conversión a Lead OS | L2 | permisos y tenant, validación en servidor, Sentry | page.tsx:117-119 listInboundLeads (sale) -> :212 -> inbound-leads-table.tsx:143 -> :52 convertInboundToLead (sale) -> :61-67. |
| `h4.adm-leads.inbound-a-oslead` Inbound por período y conversión a OsLead | L2 | errores, Sentry, autonomía | inbound.actions.ts:55-113, :123-174; UI en [D3] Inbound |
| `h4.adm-leads.pipeline-kanban` Kanban outbound con drag & drop y vista de columna | L2 | permisos y tenant, validación en servidor, mobile, Sentry | page.tsx:21-54 getLeads -> :202 -> outbound-leads-view.tsx:29 groupLeads -> lead-pipeline.tsx:192-207 handleDragEnd -> :122 updateLeadStatus (sale a lead.actions.ts, que revalida 'admin-leads' según git grep) -> :139 refresh / :132 rollback. |
| `h4.adm-leads.rastro-reasignacion` Rastro de la reasignación de un lead | L2 | — | lead.actions.ts:180 -> assignment-trail.ts:42-55; manual/_data.ts:154 -> assignment-trail.ts:68-80 |
| `h4.adm-leads.reunion-resultado` Reunión agendada: realizada y resultado | L2 | permisos y tenant, vacíos, carga, validación en servidor, Sentry, sin mocks ni TODO | [leadId]/page.tsx:229-230 parseAgenda (sale a lib/leados/flow) -> :296 -> reunion-panel.tsx:130 -> :61 marcarReunionRealizada; :165 -> :189 -> :73 registrarResultadoReunion (sale a reunion.actions.ts). |

### [FAL-024] «Convertir a proyecto» en la ficha del lead está siempre deshabilitado; la action y el diálogo existen sin conectar
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/leads/[leadId]/page.tsx:281` — «{canConvertToProject ? ( <button type="button" disabled»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:833` — «export async function convertLeadToProject(»; `src/app/(protected)/admin/projects/_components/convert-lead-dialog.tsx:72` — «export function ConvertLeadDialog({»
- Impacto: Cuando develOP cierre el primer cliente real desde el pipeline, el botón que promete crear el proyecto no hace nada y no explica por qué; la tarjeta «Proyecto vinculado» (:367-383) queda en «Todavía sin proyecto» salvo que se vincule a mano desde el form de proyectos (project.actions.ts:612 acepta leadId). ConvertLeadDialog no tiene importadores (git grep).
- Propuesta: Montar ConvertLeadDialog (ya trae schema y action) en lugar del botón deshabilitado, o quitar el botón si la conversión se decide hacer desde /admin/projects. Decisión de producto antes de tocar.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-leads, h4.adm-leads.convertir-a-proyecto, h4.adm-proyectos, modelo.OsLead, modelo.Project

### h4.adm-tickets — Tickets

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 6 funcionalidades: 6×L2).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, sin mocks ni TODO, vacíos, autonomía, mobile, permisos y tenant.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-tickets.bandeja` Bandeja de tickets con filtros | L2 | vacíos, errores, Sentry, autonomía | tickets/page.tsx:6 → ticket.actions.ts:51-94 → ticket-list.tsx:79-224. |
| `h4.adm-tickets.cambiar-estado` Cambiar estado del ticket | L2 | errores, Sentry | admin/tickets/_components/ticket-chat.tsx:9 → actions.ts:183-184 Zod → :187 requireSuperAdmin → :188-193 update + revalidate. |
| `h4.adm-tickets.cambio-estado` Cambiar el estado del ticket | L2 | Sentry | ticket-chat.tsx:160-170 → handleStatusChange :99-115 → updateTicketStatusAction (src/lib/tickets/actions.ts, fuera del lote). |
| `h4.adm-tickets.conversacion-y-respuesta` Conversación del ticket y respuesta al cliente | L2 | errores, mobile, Sentry | tickets/[ticketId]/page.tsx:12-26 → ticket.actions.ts:133-184 → ticket-chat.tsx:189-221 → ticket-reply-form.tsx:53-67 → lib/tickets/actions (flujo D2 «Responder ticket (cliente y admin)»). |
| `h4.adm-tickets.responder-y-avisar-por-email` Responder ticket como develOP y avisar al cliente | L2 | errores, Sentry, sin mocks ni TODO | actions.ts:124 (isAdmin) → :140-148 mensaje → :150-167 sendEmail por Resend (lib/email.ts:15-30); el mensaje se guarda, el email puede no salir sin registro. |
| `h4.adm-tickets.solicitud-baja` Aprobar solicitud de eliminación de cuenta desde el ticket | L2 | permisos y tenant, sin mocks ni TODO | ticket-chat.tsx:118-119, :224-247 → ClientsListClient.tsx:245-256 (flujo D6 «Eliminar cliente (hard-delete) y su cascada»). |

### h4.adm-mensajes — Mensajes (admin)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 5 funcionalidades: 4×L2, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, permisos y tenant, validación en servidor, vacíos, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-mensajes.bandeja` Bandeja de conversaciones con no leídos | L2 | errores, Sentry | layout.tsx:15-20 -> conversation-list-loader.tsx:10 -> message.actions.ts:44-120 -> conversation-list.tsx:92-150. |
| `h4.adm-mensajes.hilo-autoscroll` Auto-scroll del hilo de mensajes del admin | L2 | — | message-thread.tsx:39 → MessagesScrollAnchor.tsx:7-14. |
| `h4.adm-mensajes.hilo-y-leido` Ver conversación y marcar leído | L2 | permisos y tenant, errores, Sentry | conversation-list.tsx:104 -> [orgId]/page.tsx:24 markAsRead (updateMany :213 escribe; revalidate falla en render) -> :26-35 -> message-thread.tsx:30-39. |
| `h4.adm-mensajes.iniciar-conversacion` Iniciar conversación con un cliente sin mensajes | L1 | vacíos, validación en servidor, Sentry, autonomía | Sólo funciona tipeando /admin/messages/<id> ([orgId]/page.tsx:73 renderiza el composer con hilo vacío); la bandeja filtra orgs con mensajes (message.actions.ts:47-51) y el índice ignora ?clientId= (page.tsx:6, SupportTab.tsx:55). |
| `h4.adm-mensajes.responder` Responder al cliente (mensaje + aviso por email) | L2 | errores, validación en servidor, Sentry | message-input.tsx:88 -> :42 sendMessage -> message.actions.ts:173-181 create -> :193 queueAdminMessageEmail (sale a lib/email/admin-message-notification.ts:19) -> :199 -> message-input.tsx:49-50. |

### [FAL-025] No se puede iniciar desde la UI la primera conversación con un cliente
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/messages/_actions/message.actions.ts:46` — «const organizations = await prisma.organization.findMany({ where: { messages: {»; `src/app/(protected)/admin/messages/page.tsx:6` — «export default function AgencyOsMessagesPage() {»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/SupportTab.tsx:55` — «<SupportSection title="Mensajes recientes" href={'/admin/messages?clientId=${clientId}'}>»
- Impacto: La bandeja sólo lista orgs que ya tienen mensajes, el índice ignora ?clientId= (no recibe searchParams) y la ficha del cliente sin mensajes sólo ofrece ese link. Con el primer cliente real, develOP no puede mandarle el primer mensaje (bienvenida, pedido de accesos) salvo tipeando /admin/messages/<id> a mano; el único mensaje automático llega al completar todo el onboarding (src/actions/admin/onboarding-tasks.ts:33-40).
- Propuesta: Que el índice honre ?clientId= (redirect a /admin/messages/[id]) y agregar «Nueva conversación» con selector de clientes activos. La página [orgId] ya soporta hilo vacío + composer (:73).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-mensajes, h4.adm-mensajes.iniciar-conversacion, h4.adm-clientes, modelo.Message

### h4.adm-novedades — Novedades

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 2 funcionalidades: 2×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, carga, Sentry, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-novedades.listar-y-retirar` Novedades publicadas y retiro | L2 | permisos y tenant, errores, carga, validación en servidor, Sentry | announcements/page.tsx:12-25 -> announcement-list.tsx:58-126 -> :93 Retirar -> :75 Confirmar -> :39-44 deleteAnnouncementAction (actions.ts:66-69) -> router.refresh. |
| `h4.adm-novedades.publicar` Publicar novedad del panel | L2 | permisos y tenant, errores, carga, Sentry | announcement-publisher.tsx:53-75 safeParse -> :78 createAnnouncementAction -> announcements.actions.ts:18 guard -> :19 parse -> :41-50 create -> :52-53 revalidate -> flujo D2 'Novedades del panel'. |

### h4.adm-referidos — Referidos (admin)

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 1 funcionalidades: 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, carga, validación en servidor, Sentry, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-referidos.gestion-estados` Confirmar conversión y mes bonificado de referidos | L2 | permisos y tenant, errores, carga, validación en servidor, Sentry, autonomía | referrals/page.tsx:9-29 → referrals-admin-table.tsx:35-42, :79-101 → referrals.admin.actions.ts:13-53. |

### h4.adm-alertas — Alertas

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 9 funcionalidades: 7×L2, 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: sin mocks ni TODO, autonomía, errores, validación en servidor, mobile, Sentry, vacíos.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-alertas.alerta-upsell-cuota` Alerta de upsell al agotar cuota | L2 | sin mocks ni TODO, autonomía | handleChatRequest.ts:374 -> upsellAlert.ts:52-58 (markDegradedIfFirst) -> :68-88. |
| `h4.adm-alertas.churn-y-vencimientos` Alertas periódicas de clientes inactivos y suscripciones por vencer | L1 | errores, Sentry, sin mocks ni TODO, autonomía | Código en alerts.ts:195-296 y ruta api/cron/alerts/route.ts:2, sin disparador (netlify.toml:25-32, vercel.json:4-12); renewalDate sin escritor (FAL-006). |
| `h4.adm-alertas.deteccion-automatica` Detección automática de incidencias de bots | L1 | errores, Sentry, autonomía | route.ts:7-21 existe y anda a mano (flujo D3 'Detector de alertas de bots disparado a mano'), pero no tiene disparador. |
| `h4.adm-alertas.detector-incidencias` Detector de incidencias de bots disparado a mano | L2 | vacíos, errores, mobile, Sentry, sin mocks ni TODO, autonomía | alerts/page.tsx:7-22 → AlertSettingsClient.tsx:85-97 → trigger-detector/route.ts:5-13 → runAlertDetector (flujo D5). Sin cron (FAL-016) y sin link. |
| `h4.adm-alertas.filtros-y-vista-completa` Filtros de alertas y vista completa por columna | L2 | mobile | AlertsClient.tsx:48-49 estado -> :75-79 passesFilters -> alerts-filters.ts:50-70 -> AlertsClient.tsx:207-275 cap -> alert-column-overview.tsx:95-158 overlay con Escape/trap (:43-89). Opera sobre el recorte de 100 filas. |
| `h4.adm-alertas.listado` Listado de alertas del sistema | L2 | errores, validación en servidor, autonomía | alerts/page.tsx:5 → manageAlerts.ts:9-27 → AlertsClient (columnas con VISIBLE_CAP AlertsClient.tsx:206-208) |
| `h4.adm-alertas.marcar-vista-resolver` Marcar alerta vista / resolver | L2 | errores, Sentry | AlertsClient.tsx:90/:110 → manageAlerts.ts:31-51/:76-94 → :54/:97 → :70-71/:113-114 |
| `h4.adm-alertas.triage` Triage de alertas de bots | L2 | errores, validación en servidor, mobile, Sentry | alerts/page.tsx:5 listAlerts (manageAlerts.ts:10 guard, :25 take 100) -> AlertsClient.tsx:81-85 columnas -> alert-card.tsx:75 -> AlertsClient.tsx:87-101 acknowledgeAlert (manageAlerts.ts:30) + update optimista. |
| `h4.adm-alertas.webhook-agencia` Alertas inmediatas de la agencia por webhook | L2 | errores, validación en servidor, Sentry, autonomía | Callers (tickets/actions.ts:8, contact.ts:6, messages.ts:4, upsell.ts:4, referrals.service.ts:4) → alerts.ts:109-129 → POST :131-137. |

### [FAL-016] El detector de alertas de los bots (/api/cron/detect-bot-issues) no tiene ningún disparador programado
- Dominio: D5  ·  Severidad: ALTA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `netlify.toml:25` — «[functions."generate-insights-cron"] schedule = "0 9 * * *"»; `netlify.toml:31` — «[functions."cleanup-old-events-cron"]»; `vercel.json:4` — «"path": "/api/cron/os-follow-up",»; `src/app/api/cron/detect-bot-issues/route.ts:7` — «export async function GET(req: Request) { if (!isAuthorizedCronRequest(req)) {»; `src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:89` — «const res = await fetch('/api/admin/alerts/trigger-detector', { method: 'POST' })»; `src/app/api/cron/detect-bot-issues/route.ts:13` — «const result = await runAlertDetector()»; `src/app/(protected)/admin/alerts/page.tsx:17` — «Issues detectados automaticamente cada 15 minutos»; `src/app/api/admin/alerts/trigger-detector/route.ts:12` — «const result = await runAlertDetector()»; `src/app/api/cron/alerts/route.ts:6` — «const providedSecret = request.headers.get('X-Cron-Secret')?.trim()»; `raíz:.github/workflows/db-backup.yml:41` — «- cron: '0 6 * * *'»
- Impacto: Bloqueante para el primer cliente real: las alertas de bot (LLM_PROVIDER_ERROR, QUOTA_EXHAUSTED, LATENCY_DEGRADED, LEAD_CAPTURE_FAILURE, CLIENT_NO_ACTIVITY) solo se generan si un SUPER_ADMIN aprieta el botón manual de Configuración → Alertas. Un bot caído o con el cupo agotado pasa días sin aviso. netlify.toml agenda solo generate-insights, weekly-reports y cleanup; vercel.json agenda otros tres crons que en Netlify no corren.
- Propuesta: Agendar el detector con una función programada de Netlify (mismo patrón que cleanup-old-events-cron, p. ej. cada 15 min) o documentar el scheduler externo si existe; alinear netlify.toml y vercel.json.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-047]
- Nodo(s): int.cron.detect-bot-issues, h4.adm-alertas, h3.adm-health, lib.chatbot.admin, modelo.BotAlert, h4.adm-alertas.detector-incidencias, h4.adm-alertas.deteccion-automatica, int.cron.alerts, h4.adm-config, int.vertex
- REQUIERE-VERIFICACIÓN-HUMANA: VH-067

### [FAL-026] Las alertas periódicas de churn y vencimientos (/api/cron/alerts) no tienen disparador: los toggles 'Alertar churn' y 'Alertar vencimientos' no producen nada
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/lib/alerts.ts:195` — «export async function runPeriodicAgencyAlerts(): Promise<{»; `src/app/api/cron/alerts/route.ts:2` — «import { runPeriodicAgencyAlerts } from '@/lib/alerts'»; `netlify.toml:25` — «[functions."generate-insights-cron"]»; `vercel.json:4` — «"path": "/api/cron/os-follow-up",»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:296` — «label="Alertar churn"»
- Impacto: netlify.toml agenda solo generate-insights, send-weekly-reports y cleanup-old-events (:25, :28, :31) y vercel.json otras tres; /api/cron/alerts no figura en ningún registro ni en .github. Si el primer cliente deja de usar el portal o se le vence la suscripción, develOP no recibe el aviso aunque el toggle esté prendido. Aun con disparador, SUBSCRIPTION_EXPIRING no saldría (renewalDate sin escritor, FAL-006) y no hay deduplicación: un cron diario repetiría el aviso por org todos los días (alerts.ts:272-291).
- Propuesta: Agendar /api/cron/alerts con una scheduled function de Netlify (como send-weekly-reports-cron) con deduplicación por org antes de activarlo; si no se va a usar, ocultar los dos toggles.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [FAL-016], [BUG-047]
- Nodo(s): h4.adm-alertas, h4.adm-alertas.churn-y-vencimientos, h4.adm-config.datos-y-alertas, int.cron.alerts, lib.alerts
- REQUIERE-VERIFICACIÓN-HUMANA: VH-127

### h4.adm-config — Configuración

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 9 funcionalidades: 8×L2, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, autonomía, Sentry, sin mocks ni TODO, vacíos, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-config.alertas-periodicas-agencia` Alertas periódicas de la agencia (clientes inactivos, suscripciones por vencer) | L1 | errores, Sentry, autonomía | alerts/route.ts:4-19 -> runPeriodicAgencyAlerts (lib/alerts.ts:195) sin disparador y solo con X-Cron-Secret. |
| `h4.adm-config.avisos-telegram` Avisos por Telegram al equipo | L2 | errores, Sentry | llamadores -> telegram.ts:67-99 -> :39-61 -> POST api.telegram.org. |
| `h4.adm-config.datos-y-alertas` Datos de la agencia, webhook y toggles de alertas | L2 | errores, Sentry, sin mocks ni TODO, autonomía | Camino feliz: settings/page.tsx:6-9 → settings.actions.ts:87-121 → settings-console.tsx:100-115 → settings.actions.ts:141-169 → consumido por alerts.ts:111-129. Pero email/WhatsApp/sitio no los lee nadie y los toggles de churn/vencimientos no tienen cron. |
| `h4.adm-config.meta-demos` Objetivo semanal de demos | L2 | vacíos, errores, Sentry, sin mocks ni TODO | settings-console.tsx:451-467 → settings.actions.ts:160 (coerceWeeklyDemoTarget :23-36) → sale a admin/page.tsx:182-184. |
| `h4.adm-config.miembros-listado` Lista de miembros del equipo en Configuración | L2 | Sentry, autonomía | settings/page.tsx:8 → settings.actions.ts:207-239 → settings-console.tsx:529-554. Solo lectura. |
| `h4.adm-config.precio-modulos` Editar precio de un módulo premium | L2 | errores, autonomía | settings.actions.ts:175-199 (requireSuperAdmin, Zod, update) -> dashboard/services/page.tsx:177 muestra el precio nuevo; la home pública sigue leyendo el catálogo (ModuloActiveCard.tsx:248) y el sync lo revierte (sync-premium-modules.ts:54, :145-148). |
| `h4.adm-config.precios-modulos` Precio mensual de los módulos premium | L2 | vacíos, errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | settings-console.tsx:404-407 → :136-141 → settings.actions.ts:175-199 (update + revalidatePath('/dashboard/services')). |
| `h4.adm-config.reportes-semanales` Reportes semanales del chatbot: historial y envío manual | L2 | vacíos, errores, Sentry, autonomía | reports/page.tsx:7-28 → ReportSettingsClient.tsx:30-42 → send-now/route.ts:5-13 → sendWeeklyReports (flujo D5). Página huérfana. |
| `h4.adm-config.telegram` Credenciales de Telegram para alertas internas | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | settings-console.tsx:583-615 → settings.actions.ts:146, :161-164 → sale a src/lib/notifications/telegram.ts:41-49. |

### [FAL-027] Email, WhatsApp y sitio web de la agencia en Configuración no los lee nadie, aunque la pantalla dice que son 'la fuente de verdad del portal'
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/settings/_components/settings-console.tsx:207` — «Esta configuracion sigue siendo la fuente de verdad del portal.»; `src/app/(protected)/admin/settings/_actions/settings.actions.ts:151` — «contactEmail: normalizeNullableString(parsed.contactEmail), contactWhatsapp: normalizeNullableString(parsed.contactWhatsapp),»; `src/app/contact/page.tsx:10` — «const EMAIL = 'hola@develop.com.ar';»; `src/lib/agency-settings.ts:6` — «contactEmail: 'hello@develop.com.ar',»
- Impacto: Si develOP cambia el WhatsApp o el email desde el panel, el sitio, /contact y los emails siguen con los valores del código (lib/whatsapp.ts y 'hola@'); el default guardado es 'hello@', distinto del publicado. git grep: ningún lector de contactEmail/contactWhatsapp/websiteUrl de AgencySettings fuera de Configuración. El equipo cree que actualizó un dato que el cliente no ve.
- Propuesta: Elegir una fuente: leer AgencySettings en lib/whatsapp y en los textos de contacto (con caché) o quitar esos campos de la pantalla; unificar hola@/hello@.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-config.datos-y-alertas, modelo.AgencySettings, h6.vis-contacto.canales-directos, lib.agency-settings

### h4.adm-audit — Audit log

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 3 funcionalidades: 2×L2, 1×L3).
- Criterios de L3 que faltan en alguna funcionalidad: validación en servidor, Sentry, errores, sin mocks ni TODO, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h4.adm-audit.detalle-de-cambios` Detalle de cambios y de borrados | L3 | — | AuditLogClient.tsx:194-199 normaliza diff/metadata sin any -> :210-214 expandir -> :276-285 DeletionDetail (:447-473) o DiffDisplay (:363-403). |
| `h4.adm-audit.listado` Audit log de acciones del admin | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | audit-log/page.tsx:4 → audit-log-queries.ts:16-70; escritor audit-log.ts:17-42. |
| `h4.adm-audit.listado-y-filtros` Audit log: listado, filtros y cargar más | L2 | validación en servidor, Sentry | audit-log/page.tsx:8-11 guard -> :13-16 listAuditLog/getAuditLogStats (audit-log-queries.ts:21, :54 requireSuperAdmin) -> AuditLogClient.tsx:106-126 -> :67-104 runQuery anti-race -> audit-filters.ts:21-54. Validación de filtros no verificable desde el lote. |

## h5 · Setter y LeadOS (ZONA-FRANCO)

### h5.set-dia — Tu día (setter)

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 18 funcionalidades: 18×L2).
- Criterios de L3 que faltan en alguna funcionalidad: mobile, autonomía, Sentry, permisos y tenant, validación en servidor, carga, vacíos, errores.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h5.set-dia.cartera-agrupada` Cartera completa agrupada con búsqueda, filtro y orden | L2 | permisos y tenant, mobile | cartera-view.tsx:81 -> :106 toolbar -> :58 filtrarYOrdenarCartera -> :64 agruparCartera -> :131 GrupoPlegable -> :208 ListaTarjetas -> home-sections.tsx:68 Link al detalle. |
| `h5.set-dia.cartera-palancas` Fijar, pausar, reanudar y nota propia | L2 | Sentry | cartera.actions.ts:40-51 ownership -> :65/:101/:117/:140 upsertSetterMeta(leadId,userId); foco.actions.ts:41-45. UI fuera del lote. |
| `h5.set-dia.cartera-vistas-y-filtros` Cartera agrupada, búsqueda, filtros y archivo por causa | L2 | vacíos, autonomía | cartera-view.tsx:58 -> flow.ts:1054; cartera-view.tsx:64 -> flow.ts:983 -> flow.ts:914; home-sections.tsx:42 -> flow.ts:1012 |
| `h5.set-dia.cola-de-hoy` Tu cola de hoy | L2 | permisos y tenant, Sentry | cola-del-dia.tsx:109 FocoSurface + :113-115 FilaCola -> :83 TrabajarLeadButton -> trabajar-lead-button.tsx:26 anclarFoco -> :31 router.push. |
| `h5.set-dia.cola-del-dia` Cola del día, foco y espera | L2 | mobile, autonomía | Camino feliz: page.tsx:29-30 requireSetter+listOwnedLeads -> :44-47 partición/foco/cola -> :115-125 render. No L3: Sentry solo en render; CERRADO no se archiva (hallazgo). |
| `h5.set-dia.foco-ahora` Tu foco ahora (Ir a trabajarlo, Pausar, Saltar, Soltar y atajos) | L2 | permisos y tenant, validación en servidor, mobile, Sentry, autonomía | Camino feliz en el lote: foco-surface.tsx:231 -> :85 anclarFoco -> :90 router.push; Saltar :258 -> :97 -> :107-109; Soltar :272 -> :129 -> :137-139; Pausar :291 -> :115 -> :120-123. Le faltan para L3 la fecha en hora AR y las acciones fuera del lote verificada |
| `h5.set-dia.foco-y-cola` Foco del día y cola visible | L2 | vacíos, autonomía | setter/page.tsx:31 -> home.ts:24 -> flow.ts:629 -> setter/page.tsx:44 -> flow.ts:813 -> foco.ts:49 -> cola.ts:64; no llega a L3 por los leads CERRADO en la cola (flow.ts:417) y la APROBADA no accionable (flow.ts:441) |
| `h5.set-dia.meta-privada-cartera` Pin, snooze y nota privada | L2 | errores, Sentry | cartera.actions.ts:65/:101/:117/:140 -> setter-meta.ts:53-63 upsert -> lectura ownership.ts:61 -> setter-meta.ts:34-44. |
| `h5.set-dia.mis-numeros` Mis números | L2 | vacíos, autonomía | Camino feliz: setter/page.tsx:30 listOwnedLeads -> ownership.ts:52-64 -> setter/page.tsx:78 derivarMisNumeros -> mis-numeros.ts:117 -> :89 -> :69 -> revision.ts:96-134. No llega a L3: 'activos' incluye descartados (hallazgo) y la UI (mis-numeros.tsx) está fuer |
| `h5.set-dia.mis-numeros-y-semana` Tu semana y Mis números | L2 | — | page.tsx:141 y :144 (git) montan MisNumeros y ProgresoSemana; progreso-semana.tsx:17-40 filtra métricas con valor; mis-numeros.tsx:25-88 pinta el criterio. |
| `h5.set-dia.novedades` Novedades y demos esperando a Franco | L2 | permisos y tenant, Sentry | novedades-panel.tsx:160-162 AvisoItem -> :122 AbrirFocoButton -> novedades-abrir-foco.tsx:41 -> :47; novedades-panel.tsx:155 -> novedades-marcar-visto.tsx:21 -> :27. |
| `h5.set-dia.novedades-dirigidas` Novedades dirigidas al setter | L2 | vacíos, errores, Sentry | admin lead.actions.ts:194 -> novedades.ts:108-133 (create) -> setter/layout.tsx:40 contarNovedadesSinLeer (novedades.ts:312) -> setter/page.tsx:95 getNovedadesSetter (novedades.ts:229-306) -> novedades-vigencia.ts:88 -> novedades-agrupar.ts:98 -> novedades.act |
| `h5.set-dia.palancas-de-card` Palancas privadas de la card: fijar, pausar, nota y reanudar | L2 | permisos y tenant, validación en servidor, Sentry, autonomía | lead-card-actions.tsx:147 -> :80 fijarLead -> :85-86; :190 -> :92 pausarLead -> :97-100; :235 -> :119 guardarNota -> :124-126; :170 -> :106 reanudarLead. |
| `h5.set-dia.panel-en-espera-y-vacio` Estados «todo en espera» y «cartera vacía» | L2 | — | La page monta HomeEmpty (page.tsx:116) y HomeEnEspera (page.tsx:120, git); home-en-espera.tsx:45-115 arma el texto por turno y los chips; home-empty.tsx:14-27 ofrece cargar o importar. |
| `h5.set-dia.progreso-semana` Progreso de los últimos 7 días | L2 | errores, Sentry | setter/page.tsx:99 -> progreso.ts:105-126 -> count por performedById :114-120 -> derivarProgresoSemana :56-97. |
| `h5.set-dia.rail-navegacion` Shell y rail de navegación del setter | L2 | carga, mobile | setter-shell.tsx:70 -> setter-nav.tsx:97 -> :49 triggerTransition -> TransitionContext.tsx:116-118 router.push. |
| `h5.set-dia.resumen-cola-revision` Resumen de demos en revisión | L2 | — | setter/page.tsx:95 -> novedades.ts:246 derivarColaRevision (:190-207) -> revision.ts:61 formatEspera. |
| `h5.set-dia.turno-de-espera` A quién le toca | L2 | — | flow.ts:473-479 esperaDe -> turno.ts:164 turnoDelLead -> :131 causaDeEspera -> :199 TEXTO_TURNO -> home-en-espera.tsx:82. |

### h5.set-nuevo — Cargar un prospecto

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 4 funcionalidades: 4×L2).
- Criterios de L3 que faltan en alguna funcionalidad: errores, validación en servidor, Sentry, permisos y tenant, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h5.set-nuevo.alta-manual` Cargar un prospecto a mano | L2 | permisos y tenant, errores, validación en servidor, Sentry | nuevo/page.tsx:18 -> nuevo-prospecto-form.tsx:76-99 -> prospecto.actions.ts:21-41 (fuera) -> router.push :98 |
| `h5.set-nuevo.alta-propia` Alta de prospecto propio | L2 | autonomía | prospecto.actions.ts:29 -> isolation.ts:80-99 |
| `h5.set-nuevo.alta-prospecto` Alta manual de prospecto propio | L2 | errores, validación en servidor, Sentry | prospecto.actions.ts:25-39 requireSetter -> zod -> create(ownedLeadCreateData) -> revalidate |
| `h5.set-nuevo.aviso-duplicado` Aviso no bloqueante de posible duplicado | L2 | autonomía | nuevo/page.tsx:22-26 -> nuevo-prospecto-form.tsx:59-74 -> :119-124 |

### h5.set-importar — Importar prospectos

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 3 funcionalidades: 3×L2).
- Criterios de L3 que faltan en alguna funcionalidad: validación en servidor, Sentry, autonomía, carga.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h5.set-importar.csv` Importación CSV de prospectos | L2 | carga, Sentry, autonomía | prospecto-bulk.actions.ts:40 requireSetter -> :48 parseCsv (prospecto-import.ts:89) / mapearFilas (:182) -> :53 MAX_FILAS_IMPORT -> dedupEnLote :254 -> construirAltasLote :280 -> ownedLeadCreateData. |
| `h5.set-importar.importar-csv` Importar una lista CSV | L2 | validación en servidor, Sentry, autonomía | importar/page.tsx:16 -> importar-prospectos-form.tsx:64-76 -> :32-46 -> :84-100 importarProspectos (fuera) -> :191-249 reporte |
| `h5.set-importar.plantilla-csv` Descargar plantilla y referencia de columnas | L2 | autonomía | importar-prospectos-form.tsx:103-111 Blob + descarga; :251-280 ColumnasReferencia desde COLUMNAS_IMPORT |

### h5.set-lead — Ficha del lead

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 16 funcionalidades: 16×L2).
- Criterios de L3 que faltan en alguna funcionalidad: validación en servidor, Sentry, sin mocks ni TODO, autonomía, permisos y tenant, vacíos, errores.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h5.set-lead.agenda-reunion` Agendar la reunión con Cal.com | L2 | permisos y tenant, vacíos, Sentry, autonomía | agenda.actions.ts:134 -> agenda.ts:57; :154 -> agenda.ts:270; :204 -> agenda.ts:194; :213 -> cal-com-v2.ts:108; :236 -> agenda.ts:324; compensaciones :223 -> agenda.ts:235 y :257 -> agenda.ts:300 |
| `h5.set-lead.aviso-reunion-agendada` Traspaso de reunión agendada | L2 | errores, Sentry | agenda.actions.ts:263 -> notify.ts:79-118 -> sendTelegram. |
| `h5.set-lead.aviso-score-alto` Aviso de evaluación con score alto | L2 | errores, Sentry | dossier.actions.ts:164-166 -> notify.ts:128-177 (idempotencia :147, marca tras envío :165-173). |
| `h5.set-lead.brief-construccion-revision` Brief, construcción, borrador, chequeo final y envío a revisión | L2 | validación en servidor, Sentry, sin mocks ni TODO, autonomía | dossier.actions.ts:205-210 -> :238 -> :326 -> :355-356 -> :382-398; escalamiento :433-443 |
| `h5.set-lead.brief-y-construccion` Brief de diseño y construcción guiada | L2 | sin mocks ni TODO, autonomía | dossier.actions.ts:205 -> dossier.ts:434; :209 -> dossier.ts:160-172; m-construccion.tsx:70 -> copy-blocks.ts:177; :297 -> dossier.ts:366; :326 -> dossier.ts:281 |
| `h5.set-lead.chequeo-final-y-revision` Chequeo final y envío a revisión | L2 | — | dossier.actions.ts:355 -> flow.ts:183 -> dossier.ts:334 -> flow.ts:204 -> dossier.actions.ts:398 -> dossier.ts:116 |
| `h5.set-lead.contador-dms-hoy` DMs mandados hoy | L2 | — | manual/_data.ts:153 / outreach.actions.ts:73 -> outreach.ts:67-72 -> :21-33 -> dmsMandadosHoyWhere (isolation.ts, gte/lte). |
| `h5.set-lead.envio-demo` Envío del link de la demo aprobada | L2 | — | m15-envio.tsx:98 -> flow.ts:92; outreach.actions.ts:237 -> :244 -> dossier.ts:394-409 -> (falla) outreach.actions.ts:258 -> dossier.ts:416 |
| `h5.set-lead.escalamiento-construccion` Me trabé (escalamiento) | L2 | validación en servidor, Sentry | dossier.actions.ts:438 -> notify.ts:36-72 -> sendTelegram (flujo D7 'Aviso por Telegram'). |
| `h5.set-lead.escalar-me-trabe` Pedir ayuda durante la construcción | L2 | — | dossier.actions.ts:433 -> dossier.ts:309-327 -> escalamiento.ts:42-45; reset dossier.ts:145 |
| `h5.set-lead.ficha-y-evaluacion` Ficha de observación y veredicto | L2 | validación en servidor, Sentry, sin mocks ni TODO, autonomía | dossier.actions.ts:100 saveOwnedFicha -> :139-156 transiciones EVALUADA/DESCARTADA |
| `h5.set-lead.ficha-y-veredicto` Ficha de observación y veredicto del setter | L2 | validación en servidor | dossier.actions.ts:100 -> dossier.ts:253-274; dossier.actions.ts:139 -> flow.ts:295; :145 -> dossier.ts:150-158; :152 -> dossier.ts:174-189 |
| `h5.set-lead.opener-sin-link` Opener sin link y seguimiento por cadencia | L2 | validación en servidor, sin mocks ni TODO, autonomía | opener-form.tsx:38 -> flow.ts:221; outreach.schemas.ts:41 -> flow.ts:221; m4-opener.tsx:52 -> copy-blocks.ts:110; estado-manual.tsx:83 -> flow.ts:243 |
| `h5.set-lead.outreach-y-envio-demo` Opener, toques de seguimiento y envío de la demo aprobada | L2 | Sentry, sin mocks ni TODO, autonomía | outreach.actions.ts:103-135, :164-203, :226-264 |
| `h5.set-lead.puerta-unica` Puerta única al lead | L2 | — | leads/[leadId]/page.tsx:23 -> manual/page.tsx:18-21 -> _data.ts:145-148 -> [paso]/page.tsx:64-73. Camino feliz trazado; dos redirects y doble carga (PERF). |
| `h5.set-lead.timeline` Timeline del lead | L2 | vacíos | manual/_data.ts:158 -> timeline.ts:45-63 -> ownership.ts:24 getOwnedLead -> findMany timelineActivityWhere(lead.id). |

### h5.set-manual — Manual del lead

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 27 funcionalidades: 2×L1, 23×L2, 2×L?).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, Sentry, autonomía, vacíos, sin mocks ni TODO, validación en servidor, carga, mobile.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h5.set-manual.agenda` Agendar la reunión en Cal.com (m16) | L2 | permisos y tenant, validación en servidor, Sentry, autonomía | m16-agenda.tsx:236-244 -> agenda-form.tsx:107-119 ofrecerHorarios -> :122-137 ConfirmarReunionSchema -> :139-155 confirmarReunion -> agenda.actions.ts:185 getCalConfigLeadOS -> agenda.ts:57-97. Necesita Cal.com configurado; si no, devuelve AGENDA_NO_CONECTADA  |
| `h5.set-manual.agenda-reunion` Ofrecer horarios y agendar la reunión (Cal.com) | L1 | permisos y tenant, errores, Sentry, autonomía | Código completo (agenda.actions.ts:125-271) pero inoperante: ninguna org tiene Cal.com y no hay camino de escritura de la config (agenda.ts:63-69, git grep sin writes); nunca se ejecutó (PLAN-931) |
| `h5.set-manual.aterrizaje-y-guardia` Pantalla del manual con guardia de servidor | L2 | mobile, autonomía | [paso]/page.tsx:64 -> _data.ts:145-234 -> [paso]/page.tsx:69-73 guardia -> :213-438 slots -> :442 PantallaManual. Falla L3 por autonomía (herramientas sin URL) y por mobile no verificable dentro del lote. |
| `h5.set-manual.ayudas-de-paso` Ayudas de paso: TeachPanel, ejemplos ideales, bloques copiables, guardrail de rol y cartel del canal | L2 | errores | copy-block.tsx:64 -> :37 -> :50; teach-panel.tsx:100-148 desde GUIA_PASOS; ejemplo-ideal.tsx:79-131; guardrail-rol.tsx:35-39 monta CopyBlock; canal-seguridad.tsx:11-56 lee CANAL_INSTAGRAM (flow-content.ts:317). |
| `h5.set-manual.borrador` Publicar y registrar el borrador (m13) | L2 | permisos y tenant, Sentry | m13-borrador.tsx:147 -> borrador-form.tsx:54-92 guardarDraftUrl -> router.refresh en :90 -> estado publicado en :112-150 con el enlace al chequeo (enlace-chequeo.tsx:63-66). |
| `h5.set-manual.brief` Decidir cómo va a ser la demo (m6) | L2 | errores, Sentry, sin mocks ni TODO, autonomía | m6-brief.tsx:90 -> brief-form.tsx:131-147 -> dossier.actions.ts:186-216 (requireSetter :191, BriefInputSchema :196, getOwnedDossier :201, transición :208-209). |
| `h5.set-manual.cabecera-e-historial` Cabecera del lead e historial al pie | L2 | vacíos, mobile, autonomía | _data.ts:236-293 serializa -> [paso]/page.tsx:99-116 cabecera e historial -> :139/:170/:450 |
| `h5.set-manual.cadencia-follow-up` Cadencia +2/+2/+3 y corte | L2 | errores, Sentry, autonomía | follow-up.ts:3-13 -> os-commercial.ts:68-82 (null limpia el toque) -> _data.ts:182 -> seguimiento-form.tsx:87-89 |
| `h5.set-manual.chequeo-final` Chequeo final y envío a revisión (m14) | L2 | permisos y tenant, mobile, Sentry | m14-chequeo.tsx:147 -> chequeo-form.tsx:146-157 autoguardado -> :160-181 guardarSelfCheck + enviarARevision; el server re-valida con selfCheckAprobado (flow.ts:204-209). |
| `h5.set-manual.construccion` Construcción de la demo (mc1/mc2) | L2 | permisos y tenant, errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | m-construccion.tsx:271-278 -> construccion-ctas.tsx:28-38 iniciarConstruccion; tildes en m-construccion.tsx:302-313 -> fase-auto-reporte.tsx:67-81 guardarProgreso. Hay una carrera conocida cuando se tilda en ráfaga. |
| `h5.set-manual.derivacion-de-pantalla` Pantalla actual del manual | L2 | autonomía | manual/_data.ts:213 -> manual.ts:687 -> :446 completadasDe -> :509 posicionDe (:520, :542, :552 -> paso.ts:251, :656 -> flow.ts:92) -> :691-697 -> [paso]/page.tsx:69-73 guard. No llega a L3: APROBADA con toque vencido y CERRADO dan órdenes contradictorias (hal |
| `h5.set-manual.envio-demo` Mandar el link aprobado (m15) | L2 | permisos y tenant, Sentry, autonomía | m15-envio.tsx:97-102 gateEnvioDemo -> envio-form.tsx:52-57 barra -> :37-46 enviarDemoAprobada (idempotente según el toast de :42-44). |
| `h5.set-manual.escalar-a-franco` Me trabé: avisar a Franco | L2 | permisos y tenant, validación en servidor, Sentry | escalamiento-construccion.tsx:62 -> escalar-modal.tsx:36-66 -> escalarConstruccion -> router.refresh en :56 -> banner en escalamiento-construccion.tsx:31-56. |
| `h5.set-manual.ficha-por-bloques` Ficha por bloques con avance por completitud y nudges de calidad | L? | autonomía | El lote tiene solo la mecánica (bloques-secuenciales.tsx:136-146, :179, :215-223; autosave-status.tsx:26-53); el guardado y la regla de avance viven en ficha-form.tsx:412 y ficha-bloques.ts (otro lote), así que el camino feliz no se cierra dentro del lote. |
| `h5.set-manual.ficha-y-veredicto` Ficha por fuentes y veredicto (m1) | L2 | permisos y tenant, errores, validación en servidor, Sentry, autonomía | Camino feliz: m1-ficha.tsx:224-229 -> ficha-form.tsx:193-197 autoguarda con guardarFicha (FichaSchema.safeParse en dossier.actions.ts:97) -> evaluacion-form.tsx:142-160 -> :125 registrarEvaluacion. No llega a L3 por dos cosas: un texto de más de 5000 caractere |
| `h5.set-manual.franja-recorrido` Franja del recorrido | L2 | — | franja-recorrido.tsx:79 -> recorrido.ts:132-160 -> :111-122 destinoDeFase (mismo alcance que el guard) -> manual.ts:303-316 FASES_MANUAL. |
| `h5.set-manual.guia-y-herramientas` Guía por paso y rail de herramientas externas | L2 | sin mocks ni TODO, autonomía | teach-panel.tsx:100 -> guidance-content.ts:1197; tools-rail.tsx:26 -> herramientas.ts:122; m-construccion.tsx:135 ToolGuide claudeDesign |
| `h5.set-manual.herramientas-externas` Herramientas externas (rail «Tus herramientas» y lanzadores por paso) | L1 | vacíos, sin mocks ni TODO, autonomía | 4 de 5 herramientas con url null y TODO (herramientas.ts:63,78,90,117): el rail las pinta como «pendiente» sin destino (tools-rail.tsx:29-44). Solo Netlify Drop abre (herramientas.ts:105 -> tools-rail.tsx:50-55). |
| `h5.set-manual.historial-del-lead` Historial del lead | L2 | permisos y tenant, errores, Sentry, autonomía | historial-lead.tsx:14-28 -> lead-timeline.tsx:62-93 -> lead-timeline.helpers.ts:21-79. |
| `h5.set-manual.opener` Mandar el opener (m4) | L2 | permisos y tenant, validación en servidor, Sentry, sin mocks ni TODO, autonomía | m4-opener.tsx:101 -> opener-form.tsx:72-79 (barra) -> :46-66 registrarOpener -> router.refresh en :65. |
| `h5.set-manual.pantalla-de-espera-con-causa` Pantalla de espera con causa | L2 | — | manual.ts:548/:588/:672 actual 'espera' -> [paso]/page.tsx:118, :154 causaDeEspera (turno.ts:131) -> estado-manual.tsx:74; salida ofreceSalida manual.ts:719-725. |
| `h5.set-manual.postergar-y-retomar` Postergar un lead y retomarlo | L2 | Sentry, autonomía | seguimiento-form.tsx:175-183 -> outreach.actions.ts:197 (fuera) -> os-commercial.ts:181-191 -> _data.ts:167-170 -> flow.ts:420-423. Retomar no reanuda la cadencia (PLAN-866). |
| `h5.set-manual.prompts-de-diseno` Prompts de diseño | L2 | — | m-construccion.tsx:79 -> prompts-disenio.ts:191-197; chequeo-form.tsx:84 -> :150-154. |
| `h5.set-manual.recorrido-y-barra` Layout del manual: franja, barra de acción, cabecera, estados y archivo | L2 | permisos y tenant, autonomía | pantalla-manual.tsx:142-255 -> franja-recorrido.tsx:79-211 -> barra-accion.tsx:156-194; estado-manual.tsx:63-157; archivo-manual.tsx:39-121; error.tsx:29-39. |
| `h5.set-manual.registrar-resultado-toque` Registrar el resultado de un toque (m5) | L2 | permisos y tenant, Sentry, autonomía | seguimiento-form.tsx:104-124 -> outreach.actions.ts:188 (fuera) -> os-commercial.ts:57-115. Falla L3: pisa CALL_AGENDADA (hallazgo ALTA). |
| `h5.set-manual.retrabajo` Retrabajo tras el rechazo | L2 | permisos y tenant, errores, validación en servidor, Sentry | m13-borrador.tsx:118-131 -> construccion-ctas.tsx:42-53 reabrirConstruccion; guia-retrabajo.tsx:46-80 muestra el último rechazo y los anteriores. |
| `h5.set-manual.seguimiento` Registrar lo que pasó (m5) | L? | permisos y tenant, carga, validación en servidor, Sentry, sin mocks ni TODO | La presentación está trazada (m5-seguimiento.tsx:41-286), pero el registro sale del lote en m5-seguimiento.tsx:284 hacia seguimiento-form.tsx, así que el camino feliz no se pudo trazar entero. |

### h5.adm-revision-demos — Revisión de demos (LeadOS)

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 6 funcionalidades: 6×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, Sentry, autonomía, carga, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h5.adm-revision-demos.aprobar-rechazar` Aprobar o rechazar la demo | L2 | permisos y tenant, Sentry | revision.actions.ts:78 -> dossier.ts:191-200; revision.actions.ts:106 -> dossier.ts:202-221; re-loop dossier.ts:146 -> escalamiento.ts:102 |
| `h5.adm-revision-demos.cola-y-veredicto` Cola de revisión y veredicto aprobar/rechazar | L2 | permisos y tenant, Sentry, autonomía | page.tsx:34-49 -> [leadId]/page.tsx:53 -> decision-bar.tsx:129-141 -> revision.actions.ts:78-87 -> decision-bar.tsx:120-123 |
| `h5.adm-revision-demos.metrica-descarte` Métrica descarte/avance por setter y drill-down | L2 | permisos y tenant, carga, validación en servidor, autonomía | page.tsx:52-60, :122-134 -> setter/[setterId]/page.tsx:36-95 -> setter-evaluaciones.tsx:36-99 |
| `h5.adm-revision-demos.panorama-produccion` Panorama de producción | L2 | autonomía | admin/leados/page.tsx:101-103 -> pipeline.ts:109-125, :135-143, :167-184. |
| `h5.adm-revision-demos.pipeline-produccion` Panorama de producción, atascos y escaladas | L2 | permisos y tenant | page.tsx:64-103 -> pipeline-board.tsx:42-131 |
| `h5.adm-revision-demos.ratio-descarte` Ratio descarte/avance por setter | L2 | — | admin/leados/page.tsx:274 -> revision.ts:143 alarmaNuncaDescarta; revision.ts:96-134 calcularRatioSetters. |

### h5.adm-fg2lab — FG-2 Lab (experimento)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 2 funcionalidades: 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, errores, sin mocks ni TODO.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h5.adm-fg2lab.prompt-estructurado` Lab FG-2 de prompt estructurado (gastronomía) | L1 | permisos y tenant, errores, sin mocks ni TODO | Declarado 'EXPERIMENTAL / DESCARTABLE' (page.tsx:2-8); experimento no corrido (docs/experimentos/fg2-brief-experimento.md:3-4) |
| `h5.adm-fg2lab.prompt-estructurado-gastro` Laboratorio FG-2: prompt estructurado de gastronomía | L1 | sin mocks ni TODO | prototipo declarado descartable y no conectado al flujo (fg2-brief-lab.ts:2-8); camino: page.tsx:17 -> fg2-lab-client.tsx:136 -> fg2-brief-lab.ts:231 |

## h6 · Entradas públicas que alimentan lo interno

### h6.vis-contacto — Formulario de contacto público

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 7 funcionalidades: 7×L2).
- Criterios de L3 que faltan en alguna funcionalidad: permisos y tenant, Sentry, errores, mobile, sin mocks ni TODO, autonomía, validación en servidor.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h6.vis-contacto.atribucion-de-referido` Atribución de referido desde el formulario público | L2 | permisos y tenant, Sentry | contact.ts:16-70 → referrals.service.ts:94-121 hechos → attribution.ts:41-52 → :134-140 Referral → :143-165 alerta y Notification. |
| `h6.vis-contacto.atribucion-referido` Atribución de referido desde /contact?ref= | L2 | errores, Sentry | contact.ts:49 → :68-70 → flujo D2 'Referidos: código, link y atribución pública' |
| `h6.vis-contacto.canales-directos` Canales directos: WhatsApp, llamada y email | L2 | sin mocks ni TODO | contact/page.tsx:96-103 (getWhatsappHref de lib/whatsapp) → :281-334 y :336-341. |
| `h6.vis-contacto.captura-referido` Captura del código de referido en /contact?ref= | L2 | mobile, autonomía | contact/page.tsx:71-75 → :149 → contact.ts:42, :68-69. Solo en desktop. |
| `h6.vis-contacto.enviar-formulario` Enviar formulario de contacto | L2 | errores, validación en servidor, Sentry | contact/page.tsx:66 → contact.ts:100-105 → :23-33 → :35-47 → :62-64 → :72-85 → contact/page.tsx:212-213 |
| `h6.vis-contacto.formulario` Formulario de contacto público | L2 | errores, mobile, Sentry, sin mocks ni TODO, autonomía | En desktop: contact/page.tsx:66, :148-224 → submitContactForm (src/lib/actions/contact.ts:100). En mobile no existe (:119). |
| `h6.vis-contacto.formulario-pie-home` Formulario de contacto del pie del home | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | page.tsx:42 -> Footer.tsx:446 -> :589 -> :78-89 POST al webhook de n8n y pantalla de éxito. |

### h6.vis-optout — Baja de emails de marketing

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 1 funcionalidades: 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: errores, Sentry, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h6.vis-optout.baja-campania` Darse de baja de una campaña de email marketing | L2 | errores, Sentry, autonomía | email-marketing/_actions.ts:155 (fuera) -> optout/route.ts:69-104 -> unsubscribe-token.ts:97-109. |

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

### [FAL-031] Los fallos de LeadOS no llegan a Sentry: las server actions tragan las excepciones y los avisos, el escalamiento y el cron os-follow-up solo hacen console.error
- Dominio: D4  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/setter/_actions/dossier.actions.ts:71` — «function mapError(error: unknown, fallback: string) { ... return fail(fallback) }»; `src/app/(protected)/setter/_actions/outreach.actions.ts:52` — «function mapError(error: unknown, fallback: string): ActionResult<never> {»; `src/app/(protected)/admin/leados/_actions/revision.actions.ts:52` — «console.error('[revision] aviso al setter no fatal:', error)»; `src/app/api/cron/os-follow-up/route.ts:297` — «console.error('[cron os-follow-up] execution error:', error)»; `src/app/api/cron/os-follow-up/route.ts:270` — «return NextResponse.json( { ok: false, error: 'Telegram send failed' },»; `src/lib/leados/novedades.ts:131` — «console.error('[novedades] fallo no fatal al emitir novedad:', error)»; `src/lib/leados/novedades.ts:303` — «console.error('[novedades] fallo no fatal al leer avisos:', error) return { filas: [], ocultos: 0, revision, totalSinLeer: 0 }»; `src/lib/leados/notify.ts:69` — «console.error('[leados notify] fallo no fatal:', error)»; `src/lib/leados/notify.ts:175` — «console.error('[leados notify] fallo no fatal:', error)»; `src/lib/leados/progreso.ts:122` — «console.error('[progreso] fallo no fatal al contar contactos:', error)»
- Impacto: Ninguna de las ~40 acciones del lote llama a captureException (git grep: 0); la mayoría ni siquiera loguea. Un fallo de Neon o de Cal.com en el flujo del setter queda como un toast genérico, invisible para Franco y para Sentry. Bloquea el criterio Sentry de L3 en todo LeadOS.
- Propuesta: En cada mapError, antes del fallback, capturar con Sentry (tag section: leados, acción y leadId) los errores no esperados; mantener el copy al usuario.
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Relacionado: [FAL-029], [FAL-015]
- Nodo(s): h5.set-lead, h5.set-manual, h5.adm-revision-demos, int.sentry, lib.leados, int.cron.os-follow-up, h5.set-dia.novedades-dirigidas, h5.set-lead.escalamiento-construccion, int.telegram, modelo.OsSetterNotice

### [FAL-032] La revisión de Franco no muestra los materiales de la ficha
- Dominio: D4  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx:236` — «const FICHA_BLOQUES: Array<{ key: keyof Ficha; label: string }> = [»; `src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx:256` — «return typeof valor === 'string' && valor.trim() !== '' ? valor : null»; `src/lib/leados/contracts.ts:73` — «materiales: z.object({ resenasUrl, imagenesUrl, otraRedUrl, queVende, comoSePresenta })»
- Impacto: El setter carga en la ficha los links de reseñas e imágenes reales, qué vende y cómo se presenta (P5-A), pero el panel de revisión solo lista los seis bloques viejos y descarta todo lo que no es string: Franco aprueba o rechaza la demo sin ver el material que debía usar (PLAN-667 sigue abierto).
- Propuesta: Agregar un bloque 'Material del negocio' que renderice materiales (links como enlaces externos) en FichaPanel.
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Relacionado: —
- Nodo(s): h5.adm-revision-demos.cola-y-veredicto, modelo.OsLeadDossier

### [FAL-033] Cuatro de las cinco herramientas externas del recorrido del setter siguen sin link (TODO) y el rail ofrece el «Chat de evaluación» que el recorrido ya no usa
- Dominio: D4  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/lib/leados/herramientas.ts:63` — «url: null, // TODO: URL — chat de evaluación en Sonnet (pedir a Franco)»; `src/lib/leados/herramientas.ts:123` — «'evaluador',»; `src/app/(protected)/setter/_components/tools-rail.tsx:41` — «<span className="shrink-0 text-[10px] uppercase tracking-wide text-amber-300/50"> pendiente»; `src/app/(protected)/setter/_components/tools-rail.tsx:26` — «{HERRAMIENTAS_ORDEN.map((id) => {»; `src/app/(protected)/setter/_actions/dossier.schemas.ts:14` — «El veredicto del setter (D15-bis: antes era la transcripción de un chat de evaluación externo)»; `src/lib/leados/herramientas.ts:78` — «url: null, // TODO: URL — Gem privado de diseño/brief (pedir a Franco)»; `src/lib/leados/herramientas.ts:90` — «url: null, // TODO: URL — acceso a Claude Design que usa el equipo (pedir a Franco)»; `src/lib/leados/herramientas.ts:117` — «url: null, // TODO: URL — Gem privado de outreach (pedir a Franco)»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m4-opener.tsx:63` — «<ToolGuide id="gemOutreach" />»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m6-brief.tsx:60` — «return <ToolGuide id="gemDiseno" />»; `src/lib/leados/herramientas.ts:55` — «nombre: 'Chat de evaluación (Sonnet)',»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m1-ficha.tsx:85` — «Lo que se fue con la fusión es el 'ToolGuide' del chat de evaluación: sin»; `src/lib/leados/herramientas.ts:62` — «dondeSeUsa: 'Evaluación', url: null, // TODO: URL — chat de evaluación en Sonnet (pedir a Franco)»; `src/lib/leados/manual.ts:307` — «ficha: { titulo: 'Ficha', pantallas: ['m1'] }, // ninguna etapa se llama 'Evaluación' (:307-315)»; `src/lib/leados/guidance-content.ts:474` — «SETTER. Hasta acá el veredicto salía de un chat de evaluación externo y el setter transcribía la respuesta; el chat quedó afuera»; `src/lib/leados/herramientas.ts:53` — «evaluador: { id: 'evaluador', nombre: 'Chat de evaluación (Sonnet)',»; `src/lib/leados/manual.ts:160` — «// no tiene link cargado, así que los tres campos —obligatorios, porque // sostienen el gate— no se podían llenar sin inventarlos. Ahora el juicio es // del setter»
- Impacto: Bloqueante de autonomía para el primer setter real: Gem de diseño (herramientas.ts:78), Claude Design (:90) y Gem de outreach (:117) también tienen url null con TODO. El rail, que es el panel persistente, las muestra como «pendiente» sin decir qué hacer (la salida SalidaLinkPendiente de tool-guide.tsx:61-67 existe pero el rail no la usa) y anuncia una herramienta del paso Evaluación que tras la fusión no tiene pantalla: ningún ToolGuide ni HerramientaLauncher con id evaluador en src (solo el test tests/setter/16-municiones-salida.spec.ts:132).
- Propuesta: Franco carga las URLs (mejor en configuración editable que en código) y decide sacar 'evaluador' de HERRAMIENTAS_ORDEN, ajustando tests/setter/16-municiones-salida.spec.ts:132. Mientras falten, el rail debería mostrar la misma salida que ToolGuide.
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Relacionado: —
- Nodo(s): h5.set-manual.herramientas-externas, lib.leados, h5.set-lead, h5.set-manual.opener, h5.set-manual.brief, h5.set-manual.construccion, h5.set-dia, h5.set-manual.ficha-y-veredicto, h5.set-manual, h5.set-manual.guia-y-herramientas, h5.set-lead.brief-y-construccion

### [FAL-001] Los inicios de sesión no dejan rastro: no hay events en auth.ts ni tipo LOGIN en AuditActionType
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:173` — «callbacks: {»; `prisma/schema.prisma:190` — «enum AuditActionType {»; `prisma/schema.prisma:211` — «PASSWORD_CHANGED»; `src/app/login/actions.ts:113` — «if (error instanceof AuthError) { recordFailedAttempt(ip)»
- Impacto: Una toma de la cuenta SUPER_ADMIN (fuerza bruta de SEC-007, magic link a un buzón comprometido) o de un cliente no deja registro de cuándo ni desde dónde se entró. Los fallos solo suman a un Map en memoria y los éxitos no se guardan en ningún lado. develOP no puede detectar ni reconstruir un acceso indebido. Además, el 'registro de accesos' que se le muestra al cliente en la Bóveda es inventado (PLAN-032).
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO; el schema es FROZEN, migración sin reset). Opción: events.signIn/signOut en auth.ts que escriban en AdminAuditLog con tipos nuevos (LOGIN_SUCCEEDED/LOGIN_FAILED) o en una tabla propia. Como mínimo para SUPER_ADMIN y con la IP confiable.
- Esfuerzo: M  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login, lib.auth, h4.adm-audit, modelo.AdminAuditLog

## Faltantes transversales

### [FAL-029] Ninguna integración ni cron reporta a Sentry: las fallas atrapadas terminan en console.error, null o datos demo y develOP no se entera cuando vence una credencial (E10)
- Dominio: D7  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/analytics.ts:196` — «} catch { // Fall back to mock data on any API error return { ok: true, data: getMockAnalyticsData() }»; `src/lib/integrations/google-business-profile.ts:94` — «console.error('[GBP] Refresh failed:', err) return null»; `src/lib/email/brevo-service.ts:41` — «console.error('[Brevo] Error sending email:', error)»; `src/lib/notifications/telegram.ts:91` — «console.error('[telegram] envío falló:', await response.text())»; `src/app/api/cron/detect-bot-issues/route.ts:16` — «return NextResponse.json( { ok: false, error: String(error) },»; `src/instrumentation.ts:49` — «export const onRequestError = Sentry.captureRequestError»
- Impacto: Con el primer cliente real: si se revoca el refresh token de Google Business, vence la key de Brevo, se revoca la service account de GA4, se desinstala la app de Tiendanube o muere el token de Telegram, el cliente ve vacíos, ceros o datos demo, o simplemente no recibe emails, y develOP solo lo sabe si el cliente reclama. onRequestError solo ve excepciones no atrapadas, y todas estas se atrapan. git grep de Sentry/captureException en crons, callbacks OAuth, lib/integrations, lib/email, notifications, n8n, analytics, searchconsole y netlify/ da cero; Vertex (handleChatRequest.ts) es la única con captura y su detector automático no corre.
- Propuesta: Un helper único reportIntegrationFailure(servicio, error, contexto) con Sentry.captureException y tag de servicio (más flush en handlers serverless), usado en cada catch de integraciones y crons; persistir el estado de la conexión por org cuando falle el refresh (p. ej. última falla y fecha) y mostrar 'reconectar'; un cron diario de salud de credenciales (Brevo, GA4, GBP, Telegram, PageSpeed) que avise por Telegram/email; agendar detect-bot-issues.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [FAL-015], [BUG-041], [BUG-063], [BUG-066]
- Nodo(s): int.sentry, int.brevo, int.gbp, int.ga4, int.searchconsole, int.telegram, int.tiendanube, int.calcom, int.pagespeed, int.cron.detect-bot-issues, lib.integrations
- REQUIERE-VERIFICACIÓN-HUMANA: VH-134

### [FAL-030] Sentry depende de NEXT_PUBLIC_SENTRY_DSN incrustada en el build: sin ella queda inerte sin aviso, y la config raíz con SENTRY_DSN es código muerto
- Dominio: D7  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: PROBABLE
- Evidencia: `src/instrumentation.ts:7` — «dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,»; `src/instrumentation-client.ts:5` — «dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,»; `instrumentation.ts:3` — «await import('./sentry.server.config')»; `sentry.server.config.ts:9` — «dsn: process.env.SENTRY_DSN,»; librería next@16.2.9, dist/build/index.js línea 616 — «const rootDir = _path.default.join(pagesDir || appDir, '..');»; `src/instrumentation-client.ts:10` — «replaysOnErrorSampleRate: 1.0,»
- Impacto: Si la variable no estaba en el entorno de build de Netlify (la bitácora lo daba inactivo a 2026-08), todo Sentry (server, edge, navegador, onRequestError, error boundaries y la captura del chatbot) es no-op silencioso, y cargarla después sin recompilar no alcanza porque Next incrusta NEXT_PUBLIC_* en el bundle. Los documentos que piden SENTRY_DSN configuran una variable que solo leen archivos que nunca se ejecutan (Next solo carga src/instrumentation.ts; @sentry/nextjs 10.62 no autocarga sentry.*.config). Los replays 'on error' no se graban: no hay replayIntegration. El criterio L3 'errores en Sentry' no se cumple en ninguna herramienta hasta confirmar esto.
- Propuesta: Confirmar NEXT_PUBLIC_SENTRY_DSN en Netlify con scope de builds y recompilar; leer en el server una DSN de runtime (SENTRY_DSN) y dejar NEXT_PUBLIC solo para el navegador; borrar instrumentation.ts raíz y sentry.server/edge.config.ts; un chequeo en el build que falle o avise si falta la DSN en producción; decidir si se quiere Replay (agregar la integración) o quitar la opción.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [FAL-003], [FAL-015]
- Nodo(s): int.sentry, lib.sentry
- REQUIERE-VERIFICACIÓN-HUMANA: VH-135
