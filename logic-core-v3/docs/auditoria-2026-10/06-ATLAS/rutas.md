# Rutas

> GENERADO por `scripts/auditoria/atlas/vistas.mjs` desde `atlas.json` (57c421bc @ `57c421bc`, 2026-10-16). No se edita a mano: se regenera (ver `regenerar.md`). Auth, rol y tenant salen de `entradas.json` (verificados por lectura en la auditoría 2026-10); «sin dato» = la entrada no tiene registro y hay que verificarla.

Control: 86 páginas, 36 route handlers y 92 archivos con server actions.

## Páginas

| Ruta | Archivo | Tipo | Auth | Rol | Tenant | Evidencia |
|---|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | page | sin dato | sin dato | sin dato | — |
| `/accept-invite` | `src/app/accept-invite/page.tsx` | page | no | ninguno | N.A. | Sin datos de tenant |
| `/admin` | `src/app/(protected)/admin/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | no-filtra | Agregados globales cross-tenant por diseño: subscription.aggregate (page.tsx:222), organization.count (:230), osLead/osDemo/osTimeEntry sin filtro de org (:186… |
| `/admin/alerts` | `src/app/(protected)/admin/alerts/page.tsx` | page | si | SUPER_ADMIN | no-filtra | Alertas de todos los bots, orderBy createdAt desc y take 100 (manageAlerts.ts:24-25); global por diseño |
| `/admin/announcements` | `src/app/(protected)/admin/announcements/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | no-filtra | Lista las ultimas 100 novedades de todas las orgs y todas las orgs activas (page.tsx:12-30) |
| `/admin/audit-log` | `src/app/(protected)/admin/audit-log/page.tsx` | page | si | SUPER_ADMIN | sí | Registro global de AdminAuditLog; el modelo no tiene organizacion objetivo (schema.prisma:1652, git grep targetOrganizationId vacio) |
| `/admin/chatbot/activity` | `src/app/(protected)/admin/chatbot/activity/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | Bot fijo slug 'develop' (page.tsx:11); eventos scoped a su org con forOrg (queries.ts:36-45) |
| `/admin/chatbot/health` | `src/app/(protected)/admin/chatbot/health/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | no-filtra | getLatencyHistory agrega chat.message_completed de todas las orgs (getLatencyHistory.ts:73-84, unsafeGlobalQuery) |
| `/admin/chatbots` | `src/app/(protected)/admin/chatbots/page.tsx` | page | si | SUPER_ADMIN | no-filtra | Listado global por diseño (listAllBots.ts:6, unsafeGlobalQuery con razón declarada) |
| `/admin/chatbots/[botId]` | `src/app/(protected)/admin/chatbots/[botId]/page.tsx` | page | si | SUPER_ADMIN | parametro | botId de la URL → bot.organization.id (page.tsx:39-65); callerCanAccessOrg (page.tsx:61) es no-op para SUPER_ADMIN; cross-org por diseño del admin |
| `/admin/chatbots/new` | `src/app/(protected)/admin/chatbots/new/page.tsx` | page | si | SUPER_ADMIN | N.A. | organizationId de la query solo preselecciona y se valida contra orgsAvailable (CreateBotForm.tsx:48-51) |
| `/admin/clients` | `src/app/(protected)/admin/clients/page.tsx` | page | si | SUPER_ADMIN | N.A. | page.tsx:22-26 y :33-37 listan TODAS las orgs (activas y archivadas) por diseno de admin; unstable_cache tag 'admin-clients' revalidate 60 (:27-28, :38-39) |
| `/admin/clients/[clientId]` | `src/app/(protected)/admin/clients/[clientId]/page.tsx` | page | si | SUPER_ADMIN | parametro | page.tsx:33 `const { clientId: orgSlug } = await params` -> :40-43 findFirst OR [{id},{slug}]; las tabs reciben client.id resuelto (:87-91). Admin cross-tenant… |
| `/admin/clients/[clientId]/chatbot/[[...tab]]` | `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx` | page | si | SUPER_ADMIN | parametro | page.tsx:25-29 findUnique({ where: { slug } }) — solo slug, nunca id |
| `/admin/clients/[clientId]/edit` | `src/app/(protected)/admin/clients/[clientId]/edit/page.tsx` | page | si | SUPER_ADMIN | parametro | edit/page.tsx:16-20 findFirst OR id\|slug; miembro ADMIN mas antiguo (:30-35) |
| `/admin/clients/new` | `src/app/(protected)/admin/clients/new/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | crea una org nueva; no filtra |
| `/admin/fg2-lab` | `src/app/(protected)/admin/fg2-lab/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | lee fichas de todos los setters (take 200), sin tenant |
| `/admin/leados` | `src/app/(protected)/admin/leados/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | OsLead/OsLeadDossier son pipeline interno de develOP, sin organizationId |
| `/admin/leados/[leadId]` | `src/app/(protected)/admin/leados/[leadId]/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | sin tenant; leadId (id interno de DB) en la URL |
| `/admin/leados/setter/[setterId]` | `src/app/(protected)/admin/leados/setter/[setterId]/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | sin tenant; filtra por lead.assignedToId = setterId (:42) |
| `/admin/leads` | `src/app/(protected)/admin/leads/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | OsLead no es org-owned (pipeline interno de develOP); findMany sin where en page.tsx:23 |
| `/admin/leads/[leadId]` | `src/app/(protected)/admin/leads/[leadId]/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | OsLead sin organizationId; where: { id: leadId } en :184 |
| `/admin/messages` | `src/app/(protected)/admin/messages/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | N.A. | No lee datos |
| `/admin/messages/[orgId]` | `src/app/(protected)/admin/messages/[orgId]/page.tsx` | page | parcial | SUPER_ADMIN (dentro de las actions + heredado) | parametro | orgId de la URL (:22) usado en markAsRead(:24), findUnique where id (:28) y getConversation(:34). Por diseño: el SUPER_ADMIN opera sobre cualquier org; desvío … |
| `/admin/projects` | `src/app/(protected)/admin/projects/page.tsx` | page | parcial | SUPER_ADMIN (heredado) | no-filtra | Lista todos los proyectos (project.actions.ts:936) y todas las orgs salvo develop (page.tsx:9-13). SUPER_ADMIN es global por diseño. |
| `/admin/projects/[projectId]` | `src/app/(protected)/admin/projects/[projectId]/page.tsx` | page | parcial | usuario autenticado de la org del proyecto (guard propio); … | mixto | projectId de la URL (page.tsx:104) y callerCanAccessOrg contra la org de la sesión (page.tsx:165) |
| `/admin/projects/[projectId]/hours` | `src/app/(protected)/admin/projects/[projectId]/hours/page.tsx` | page | si | SUPER_ADMIN | no-filtra | projectId de la URL (hours/page.tsx:27); SUPER_ADMIN global |
| `/admin/projects/[projectId]/payments` | `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | no-filtra | projectId de la URL (payments/page.tsx:70) sin scoping (:73-103) |
| `/admin/projects/[projectId]/tasks` | `src/app/(protected)/admin/projects/[projectId]/tasks/page.tsx` | page | heredado | SUPER_ADMIN (heredado) | no-filtra | projectId de la URL (tasks/page.tsx:15) |
| `/admin/referrals` | `src/app/(protected)/admin/referrals/page.tsx` | page | heredado | SUPER_ADMIN (layout) | N.A. | Lista global de referidos de todas las orgs (page.tsx:9-20), por diseño del admin |
| `/admin/settings` | `src/app/(protected)/admin/settings/page.tsx` | page | si | SUPER_ADMIN | N.A. | AgencySettings es global de develOP (settings.actions.ts:38-52) |
| `/admin/settings/alerts` | `src/app/(protected)/admin/settings/alerts/page.tsx` | page | si | SUPER_ADMIN | N.A. | Conteos globales de BotAlert (page.tsx:12-22) |
| `/admin/settings/reports` | `src/app/(protected)/admin/settings/reports/page.tsx` | page | si | SUPER_ADMIN | N.A. | Consulta global botConfig/chatbotEvent con prisma directo (page.tsx:12-28), fuera de isolation (PLAN-593) |
| `/admin/team` | `src/app/(protected)/admin/team/page.tsx` | page | heredado | SUPER_ADMIN (layout) | N.A. | Usuarios internos y sus tareas (page.tsx:19-102) |
| `/admin/tickets` | `src/app/(protected)/admin/tickets/page.tsx` | page | si | SUPER_ADMIN | N.A. | Bandeja global de todas las orgs (ticket.actions.ts:59-79) |
| `/admin/tickets/[ticketId]` | `src/app/(protected)/admin/tickets/[ticketId]/page.tsx` | page | si | SUPER_ADMIN | N.A. | El ticket se resuelve por id (ticket.actions.ts:137-153); el admin ve cualquier org por diseño |
| `/ai-implementations` | `src/app/ai-implementations/page.tsx` | page | sin dato | sin dato | sin dato | — |
| `/bienvenida` | `src/app/bienvenida/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:13, :16-24 organization.findUnique({ id: organizationId }) |
| `/cambiar-password` | `src/app/cambiar-password/page.tsx` | page | si | cualquier autenticado | N.A. | Opera sobre la cuenta de la sesion |
| `/contact` | `src/app/contact/page.tsx` | page | no | público | N.A. | Formulario de develOP, sin tenant |
| `/dashboard` | `src/app/(protected)/dashboard/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:51; todos los wrappers reciben ese organizationId |
| `/dashboard/chatbot` | `src/app/(protected)/dashboard/chatbot/page.tsx` | page | parcial | ORG_MEMBER / SUPER_ADMIN impersonando (proxy.ts:154) | sí | checkClientHasChatbot con el orgId de resolveOrgId pero los datos salen de session.organization por OrgMember (page.tsx:18-31) |
| `/dashboard/chatbot/conversations` | `src/app/(protected)/dashboard/chatbot/conversations/page.tsx` | page | parcial | ORG_MEMBER (proxy) | sí | session.organization.slug → listConversationsByOrgSlug (page.tsx:12; multiTenantQueries.ts:174-198 con forOrg) |
| `/dashboard/chatbot/install` | `src/app/(protected)/dashboard/chatbot/install/page.tsx` | page | parcial | ORG_MEMBER (proxy) | sí | session.bot (page.tsx:12-19) |
| `/dashboard/chatbot/knowledge` | `src/app/(protected)/dashboard/chatbot/knowledge/page.tsx` | page | parcial | ORG_MEMBER (proxy) | sí | knowledgeBase por session.bot.id (page.tsx:13-17) |
| `/dashboard/chatbot/leads` | `src/app/(protected)/dashboard/chatbot/leads/page.tsx` | page | parcial | ORG_MEMBER (proxy) | sí | listLeadsForDashboard(session.organization.id) (page.tsx:56) |
| `/dashboard/chatbot/leads/[id]` | `src/app/(protected)/dashboard/chatbot/leads/[id]/page.tsx` | page | parcial | ORG_MEMBER (proxy) | sí | getLeadByIdForOrg(id, session.organization.id) (page.tsx:34; multiTenantQueries.ts:147-156): id ajeno → notFound |
| `/dashboard/chatbot/settings` | `src/app/(protected)/dashboard/chatbot/settings/page.tsx` | page | si | ORG_MEMBER / SUPER_ADMIN impersonando (preview.ts:6-20) | sí | botConfig por organizationId de resolveOrgId (page.tsx:20-49) |
| `/dashboard/cuenta` | `src/app/(protected)/dashboard/cuenta/page.tsx` | page | heredado | heredado | N.A. | no consulta la base |
| `/dashboard/cuenta/boveda` | `src/app/(protected)/dashboard/cuenta/boveda/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | boveda/page.tsx:66-69 clientAsset.findMany where organizationId |
| `/dashboard/cuenta/facturacion` | `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | facturacion/page.tsx:64-75 organization, subscription, invoice y getCurrentPlan por organizationId |
| `/dashboard/cuenta/perfil` | `src/app/(protected)/dashboard/cuenta/perfil/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | perfil/page.tsx:80-102 organization por organizationId; :167-175 orgMember por userId+orgId |
| `/dashboard/messages` | `src/app/(protected)/dashboard/messages/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | messages/page.tsx:16-23 message.findMany por organizationId |
| `/dashboard/modules/agenda-inteligente` | `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando + modulo activo | sí | page.tsx:323-326 organization por id de sesion; cal-com.ts:24-30 |
| `/dashboard/modules/email-marketing` | `src/app/(protected)/dashboard/modules/email-marketing/page.tsx` | page | heredado | heredado | N.A. | no consulta la base |
| `/dashboard/modules/email-marketing/campaigns` | `src/app/(protected)/dashboard/modules/email-marketing/campaigns/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | campaigns/page.tsx:36-39 emailCampaign.findMany por organizationId |
| `/dashboard/modules/email-marketing/campaigns/[id]/send` | `src/app/(protected)/dashboard/modules/email-marketing/campaigns/[id]/send/page.tsx` | page | heredado | heredado | N.A. | params.id va a sendCampaignAction, que busca por id+org (_actions.ts:177-179) |
| `/dashboard/modules/email-marketing/campaigns/new` | `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx` | page | heredado | heredado | N.A. | no lee datos; las actions toman la org de resolveOrgId (_actions.ts:18) |
| `/dashboard/modules/email-marketing/contactos` | `src/app/(protected)/dashboard/modules/email-marketing/contactos/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | contactos/page.tsx:15-33 por organizationId |
| `/dashboard/modules/motor-resenas` | `src/app/(protected)/dashboard/modules/motor-resenas/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando; vista segun modulo | sí | page.tsx:109-115 y :128-131 por organizationId |
| `/dashboard/modules/tienda-conectada` | `src/app/(protected)/dashboard/modules/tienda-conectada/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando + modulo activo | sí | page.tsx:298-301; tiendanube.ts:55 tokens de la org |
| `/dashboard/plan` | `src/app/(protected)/dashboard/plan/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | plan/page.tsx:36-46 getOrgUsageSnapshot(organizationId) |
| `/dashboard/project` | `src/app/(protected)/dashboard/project/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | project/page.tsx:134-135 project.findMany por organizationId |
| `/dashboard/referidos` | `src/app/(protected)/dashboard/referidos/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | referidos/page.tsx:30-33; referrals.service.ts:16-17, :65-66 |
| `/dashboard/resultados` | `src/app/(protected)/dashboard/resultados/page.tsx` | page | heredado | ORG_MEMBER o SUPER_ADMIN impersonando | N.A. | page.tsx:4 solo redirect('/dashboard/resultados/trafico') |
| `/dashboard/resultados/analisis` | `src/app/(protected)/dashboard/resultados/analisis/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando; contenido solo con p… | sí | page.tsx:32 resolveOrgId(); getMonthlyAnalysisForOrg.ts:53 forOrg(organizationId) |
| `/dashboard/resultados/reputacion` | `src/app/(protected)/dashboard/resultados/reputacion/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:15 y :20 getGBPMetrics(organizationId) (google-business-profile.ts:166-174 por id) |
| `/dashboard/resultados/seo` | `src/app/(protected)/dashboard/resultados/seo/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:100, :103-106 organization.findUnique({ id: organizationId }) |
| `/dashboard/resultados/trafico` | `src/app/(protected)/dashboard/resultados/trafico/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:48, :52-55 organization.findUnique({ id: organizationId }) |
| `/dashboard/services` | `src/app/(protected)/dashboard/services/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:173-176 service.findMany({ organizationId }); :185-188 organizationModule.findMany({ organizationId }); premiumModule.findMany (:177-182) es catálogo … |
| `/dashboard/soporte` | `src/app/(protected)/dashboard/soporte/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:21-22 ticket.findMany({ organizationId }); :33-37 ticket.count por org |
| `/dashboard/soporte/[ticketId]` | `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx` | page | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:60-61 ticket.findUnique({ where: { id: ticketId, organizationId } }) → ajeno = redirect (:70). Sin IDOR. |
| `/embed/[slug]` | `src/app/embed/[slug]/page.tsx` | page | no | anónimo | parametro | slug de la URL (page.tsx:26-32) |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | page | no | ninguno | N.A. | Sin datos de tenant |
| `/login` | `src/app/login/page.tsx` | page | no | ninguno | N.A. | No lee datos de tenant |
| `/process-automation` | `src/app/process-automation/page.tsx` | page | sin dato | sin dato | sin dato | — |
| `/reset-password` | `src/app/reset-password/page.tsx` | page | no | ninguno | N.A. | Sin datos de tenant |
| `/setter` | `src/app/(protected)/setter/page.tsx` | page | si | SETTER | N.A. | aislamiento por dueño de sesion: page.tsx:30 listOwnedLeads(userId) -> isolation.ts:34-35 { assignedToId: userId } |
| `/setter/leads/[leadId]` | `src/app/(protected)/setter/leads/[leadId]/page.tsx` | page | heredado | SETTER (heredado) | N.A. | no lee datos |
| `/setter/leads/[leadId]/manual` | `src/app/(protected)/setter/leads/[leadId]/manual/page.tsx` | page | si | SETTER | N.A. | _data.ts:147 getOwnedLead(leadId, userId); lead ajeno -> notFound() manual/page.tsx:20 |
| `/setter/leads/[leadId]/manual/[paso]` | `src/app/(protected)/setter/leads/[leadId]/manual/[paso]/page.tsx` | page | si | SETTER | N.A. | OsLead no tiene organizationId (prisma/schema.prisma:862-900; dueño = assignedToId :884). Aislamiento por dueño de sesion: _data.ts:147 getOwnedLead(leadId, us… |
| `/setter/nuevo` | `src/app/(protected)/setter/nuevo/page.tsx` | page | si | SETTER | N.A. | nuevo/page.tsx:22-25 prisma.osLead.findMany({ where: ownedListWhere(userId) }) — solo la cartera del setter de la sesion |
| `/setter/nuevo/importar` | `src/app/(protected)/setter/nuevo/importar/page.tsx` | page | si | SETTER | N.A. | no lee datos; la action importarProspectos (prospecto-bulk.actions.ts, fuera del lote) deduplica por ownedListWhere(userId) |
| `/software-development` | `src/app/software-development/page.tsx` | page | sin dato | sin dato | sin dato | — |
| `/styleguide` | `src/app/styleguide/page.tsx` | page | sin dato | sin dato | sin dato | — |
| `/web-development` | `src/app/web-development/page.tsx` | page | sin dato | sin dato | sin dato | — |

## Route handlers

| Ruta | Archivo | Tipo | Auth | Rol | Tenant | Evidencia |
|---|---|---|---|---|---|---|
| `/api/admin/alerts/trigger-detector` | `src/app/api/admin/alerts/trigger-detector/route.ts` | route POST | si | SUPER_ADMIN | N.A. | El detector barre todos los bots (runAlertDetector, route.ts:12) |
| `/api/admin/chatbot/demo-chat/[slug]` | `src/app/api/admin/chatbot/demo-chat/[slug]/route.ts` | route POST | si | SUPER_ADMIN | parametro | bot por slug de la URL (route.ts:34-47), admin cross-org |
| `/api/admin/chatbot/events` | `src/app/api/admin/chatbot/events/route.ts` | route GET | si | SUPER_ADMIN | parametro | slug de la query, default 'develop' (route.ts:14-17) |
| `/api/admin/chatbot/insights/generate` | `src/app/api/admin/chatbot/insights/generate/route.ts` | route POST | si | SUPER_ADMIN | parametro | botSlug del body (route.ts:12-19) |
| `/api/admin/chatbot/test-prompt` | `src/app/api/admin/chatbot/test-prompt/route.ts` | route POST | si | SUPER_ADMIN | N.A. | Borrador de KB sin org |
| `/api/admin/clients/[organizationId]/send-executive-report` | `src/app/api/admin/clients/[organizationId]/send-executive-report/route.ts` | route POST | si | SUPER_ADMIN | sí | route.ts:50-55 organizationId del path (operación admin sobre una org cliente, por diseño) |
| `/api/admin/reports/send-now` | `src/app/api/admin/reports/send-now/route.ts` | route POST | si | SUPER_ADMIN | N.A. | Envía a todos los bots activos (sendWeeklyReports, route.ts:12) |
| `/api/admin/users/[userId]/resend-credentials` | `src/app/api/admin/users/[userId]/resend-credentials/route.ts` | route POST | si | SUPER_ADMIN | N.A. | Opera sobre un userId de la URL (route.ts:39-47); no filtra por rol del usuario destino |
| `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | route  | sin dato | sin dato | sin dato | — |
| `/api/auth/google-business/callback` | `src/app/api/auth/google-business/callback/route.ts` | route GET | si | SUPER_ADMIN | parametro | callback/route.ts:30-36 orgId sale del state firmado con HMAC (oauth-state.ts:72-120), verificado antes de tocar la DB; no está atado a la sesión del admin |
| `/api/auth/google-business/start` | `src/app/api/auth/google-business/start/route.ts` | route GET | si | SUPER_ADMIN | parametro | start/route.ts:12 searchParams.get('orgId') (herramienta de admin sobre cualquier org; no valida que la org exista hasta el callback) |
| `/api/auth/tiendanube/callback` | `src/app/api/auth/tiendanube/callback/route.ts` | route GET | si | SUPER_ADMIN | parametro | callback/route.ts:42-48 orgId del state firmado (HMAC, scope tiendanube:v1, TTL 10 min) |
| `/api/auth/tiendanube/start` | `src/app/api/auth/tiendanube/start/route.ts` | route GET | si | SUPER_ADMIN | parametro | start/route.ts:16 searchParams.get('orgId') |
| `/api/chatbot/[slug]/chat` | `src/app/api/chatbot/[slug]/chat/route.ts` | route OPTIONS, POST | no | anónimo | parametro | slug de la URL |
| `/api/chatbot/[slug]/config` | `src/app/api/chatbot/[slug]/config/route.ts` | route OPTIONS, GET | no | anónimo | parametro | slug |
| `/api/chatbot/[slug]/health` | `src/app/api/chatbot/[slug]/health/route.ts` | route GET | no | anónimo | parametro | slug (route.ts:10-12) |
| `/api/cron/alerts` | `src/app/api/cron/alerts/route.ts` | route GET | si | maquina (CRON_SECRET) | N.A. | barrido global de orgs (lib/alerts.ts:195, fuera del lote) |
| `/api/cron/cleanup-old-events` | `src/app/api/cron/cleanup-old-events/route.ts` | route GET | si | maquina (CRON_SECRET) | N.A. | purga global por antigüedad (cleanupOldEvents, fuera del lote) |
| `/api/cron/detect-bot-issues` | `src/app/api/cron/detect-bot-issues/route.ts` | route GET | si | maquina (CRON_SECRET) | N.A. | barrido global (runAlertDetector, fuera del lote) |
| `/api/cron/generate-insights` | `src/app/api/cron/generate-insights/route.ts` | route POST | si | maquina (CRON_SECRET) | N.A. | route.ts:18-21 todos los bots activos (sin filtro de org archivada ni de plan); cada llamada pasa bot.organization.id |
| `/api/cron/os-follow-up` | `src/app/api/cron/os-follow-up/route.ts` | route GET | si | ninguno (llamada de maquina con CRON_SECRET) | N.A. | digest global interno de develOP (OsLead sin organizationId); lee todos los leads pendientes route.ts:176-225 |
| `/api/cron/regenerate-briefs` | `src/app/api/cron/regenerate-briefs/route.ts` | route GET | si | maquina (CRON_SECRET) | N.A. | route.ts:26-32 orgs con onboarding completo y suscripción ACTIVE (sin filtro deletedAt) |
| `/api/cron/send-executive-reports` | `src/app/api/cron/send-executive-reports/route.ts` | route GET | si | n/a (secreto compartido de cron) | N.A. | itera orgs onboardeadas con suscripción ACTIVE (send.ts:78-84) |
| `/api/cron/send-weekly-reports` | `src/app/api/cron/send-weekly-reports/route.ts` | route GET | si | maquina (CRON_SECRET) | N.A. | barrido global en sendWeeklyReports (fuera del lote) |
| `/api/dashboard/chatbot/leads/export` | `src/app/api/dashboard/chatbot/leads/export/route.ts` | route GET | parcial | cualquier usuario con OrgMember | sí | session.organization.id (route.ts:89) por OrgMember, sin impersonación |
| `/api/dashboard/leads/recent` | `src/app/api/dashboard/leads/recent/route.ts` | route GET | sin dato | sin dato | sin dato | — |
| `/api/dev/email-preview/executive-weekly` | `src/app/api/dev/email-preview/executive-weekly/route.ts` | route GET | no | ninguno (solo dev) | N.A. | datos mock fijos (:14-104) |
| `/api/email/optout/[contactId]` | `src/app/api/email/optout/[contactId]/route.ts` | route GET | no | anónimo con token | N.A. | route.ts:91-94 updateMany por id de contacto; el token ata el contactId |
| `/api/email/unsubscribe-executive` | `src/app/api/email/unsubscribe-executive/route.ts` | route GET, POST | no | anónimo con token | parametro | route.ts:41 org del query, protegida por la firma (:62) |
| `/api/motor/webhook/[channelToken]` | `src/app/api/motor/webhook/[channelToken]/route.ts` | route POST | si | BSP 360dialog (sin usuario) | parametro | Org del canal resuelto por el token secreto de la URL (resolve-channel.ts:24-37); un webhook no tiene sesión |
| `/api/qa/login` | `src/app/api/qa/login/route.ts` | route POST, GET, DELETE | parcial | ninguno (mintea SUPER_ADMIN/ORG_MEMBER/SETTER) | N.A. | La org sale de la membresia en DB de la persona (route.ts:111-142), no del body |
| `/api/reports/client-monthly` | `src/app/api/reports/client-monthly/route.ts` | route GET | si | ORG_MEMBER o SUPER_ADMIN impersonando; gate de plan insight… | sí | :25 resolveOrgId(); sin parámetros de org |
| `/api/reports/monthly` | `src/app/api/reports/monthly/route.ts` | route GET | si | cualquier sesión; SUPER_ADMIN elige la org por query | sí | :38-42 SUPER_ADMIN toma organizationId del query; :43-50 el resto usa session.user.organizationId y rechaza si el query difiere |
| `/api/test-sentry` | `src/app/api/test-sentry/route.ts` | route GET | no | ninguno | N.A. | no toca datos |
| `/api/track` | `src/app/api/track/route.ts` | route OPTIONS, POST | no | ninguno | N.A. | no toca datos |
| `/api/version` | `src/app/api/version/route.ts` | route GET | no | ninguno (público) | N.A. | route.ts:4-8 no lee la base ni datos de clientes |

## Server actions

| Archivo | Funciones | Nodo | Auth | Rol | Tenant | Evidencia |
|---|---|---|---|---|---|---|
| `src/actions/admin/onboarding-tasks.ts` | updateTaskStatus, updateTaskNotes | lib.actions | sin dato | sin dato | sin dato | — |
| `src/actions/agency-actions.ts` | createTaskForClientAction, createClientAssetAction | lib.actions | si | SUPER_ADMIN | sí | organizationId llega como argumento (agency-actions.ts:16); validado contra el proyecto con assertProjectBelongsToOrg (:29). Admin cross-te… |
| `src/actions/auth-actions.ts` | signOutAction | lib.actions | no | ninguno | N.A. | n/a |
| `src/actions/dashboard-actions.ts` | approveTaskAction, rejectTaskAction, markNotificationAsRead | lib.actions | si | cualquier sesion con organizationId (no exige rol) | sí | :18 session.user.organizationId; :35 compara task.project.organizationId |
| `src/actions/metrics-actions.ts` | upsertBusinessMetrics | lib.actions | sin dato | sin dato | sin dato | — |
| `src/actions/onboarding-actions.ts` | saveOnboardingProfile, completeOnboardingAction | lib.actions | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | :42, :60-61 |
| `src/actions/task-approvals.ts` | requestTaskApproval, approveTask, rejectTask | lib.actions | sin dato | sin dato | sin dato | — |
| `src/app/(protected)/admin/announcements/_actions/announcements.actions.ts` | createAnnouncementAction, deleteAnnouncementAction | h4.adm-novedades | si | SUPER_ADMIN | sí | body.organizationId es el destino elegido por el admin (audiencia ORG); se verifica que exista (announcements.actions.ts:25-29) pero no que… |
| `src/app/(protected)/admin/chatbots/_actions/convert-chatbot-lead.actions.ts` | convertChatbotLeadToOsLead | h3.adm-chatbots | si | SUPER_ADMIN | N.A. | Solo bot slug 'develop' (convert-chatbot-lead.actions.ts:33-35) |
| `src/app/(protected)/admin/chatbots/[botId]/actions.ts` | toggleBotActiveAction, deleteBotAction | h3.adm-chatbots | si | SUPER_ADMIN | parametro | botId del cliente; admin cross-org (actions.ts:42-56) |
| `src/app/(protected)/admin/chatbots/[botId]/transcript-action.ts` | getConversationTranscriptAction | h3.adm-chatbots | si | SUPER_ADMIN | parametro | Org derivada de la conversación (transcript-action.ts:37-46) |
| `src/app/(protected)/admin/chatbots/bulk-actions.ts` | bulkPauseBotsAction, bulkActivateBotsAction, exportLeadsBulkAction, bulkDeleteBotsAction | h3.adm-chatbots | si | SUPER_ADMIN | parametro | botIds del cliente |
| `src/app/(protected)/admin/chatbots/new/actions.ts` | createBotAction | h3.adm-chatbots | si | SUPER_ADMIN | sí | organizationId del body en modo existing_org (actions.ts:16-17,56-65); admin cross-org |
| `src/app/(protected)/admin/clients/_actions/client.actions.ts` | startImpersonationAction, stopImpersonationAction | h4.adm-clientes | parcial | SUPER_ADMIN (delegado) | sí | client.actions.ts:8 organizationId del argumento; lo pasa ImpersonateButton.tsx:24 con client.id resuelto en el server |
| `src/app/(protected)/admin/clients/_actions/plan.actions.ts` | assignPlanToOrg, setBillingOverride, clearBillingOverride | h4.adm-clientes | si | SUPER_ADMIN | sí | plan.actions.ts:93 organizationId del input (admin cross-tenant por diseno); no verifica que la org exista ni que no este archivada (:101-1… |
| `src/app/(protected)/admin/leados/_actions/revision.actions.ts` | aprobarRevision, rechazarRevision | h5.adm-revision-demos | si | SUPER_ADMIN | N.A. | OsLeadDossier sin tenant |
| `src/app/(protected)/admin/leads/_actions/activity.actions.ts` | createActivity | h4.adm-leads | si | SUPER_ADMIN | N.A. | OsLead sin organizationId |
| `src/app/(protected)/admin/leads/_actions/demo.actions.ts` | createDemo, markDemoViewed | h4.adm-leads | si | SUPER_ADMIN | N.A. | OsLead sin organizationId |
| `src/app/(protected)/admin/leads/_actions/inbound.actions.ts` | listInboundLeads, convertInboundToLead | h4.adm-leads | si | SUPER_ADMIN | N.A. | ContactSubmission es global (comentario :60-61) |
| `src/app/(protected)/admin/leads/_actions/lead.actions.ts` | createLead, updateLead, updateLeadStatus, assignLeadSetter, deleteLead, listLeads, getLeadById | h4.adm-leads | si | SUPER_ADMIN | N.A. | OsLead sin organizationId |
| `src/app/(protected)/admin/leads/_actions/module-demand.actions.ts` | listModuleDemand | h4.adm-leads | si | SUPER_ADMIN | sí | cruza organizaciones a proposito (comentario :19-21; query :27-37 sin organizationId ni filtro de archivadas) |
| `src/app/(protected)/admin/leads/_actions/reunion.actions.ts` | marcarReunionRealizada, registrarResultadoReunion | h4.adm-leads | si | SUPER_ADMIN | N.A. | OsLeadDossier sin tenant |
| `src/app/(protected)/admin/messages/_actions/message.actions.ts` | listConversations, getConversation, sendMessage, markAsRead | h4.adm-mensajes | si | SUPER_ADMIN | no-filtra | organization.findMany where messages some (:46-51) + groupBy (:78-90): global por diseño, sin filtro deletedAt |
| `src/app/(protected)/admin/projects/_actions/maintenance.actions.ts` | createMaintenancePayment, markMaintenancePaid, generatePendingMaintenance | h4.adm-proyectos | si | SUPER_ADMIN | no-filtra | projectId del body (maintenance.schemas.ts:20) |
| `src/app/(protected)/admin/projects/_actions/milestone.actions.ts` | markMilestonePaid, unmarkMilestonePaid | h4.adm-proyectos | si | SUPER_ADMIN | no-filtra | update por id (milestone.actions.ts:26-27) |
| `src/app/(protected)/admin/projects/_actions/project.actions.ts` | createProject, updateProject, updateProjectStatus, deleteProject, convertLeadToProject, listProjects, getProjectById | h4.adm-proyectos | si | SUPER_ADMIN | sí | organizationId sale del body (project.schemas.ts:55) y se resuelve en resolveProjectOrganization (project.actions.ts:242-251); si es null, … |
| `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx` |  | h4.adm-proyectos | heredado | SUPER_ADMIN (heredado) | no-filtra | projectId de la URL (payments/page.tsx:70) sin scoping (:73-103) |
| `src/app/(protected)/admin/referrals/_actions/referrals.admin.actions.ts` | markReferralConvertedAction, markReferralRewardedAction | h4.adm-referidos | si | SUPER_ADMIN | N.A. | Referral por id (:18-21), admin global |
| `src/app/(protected)/admin/settings/_actions/settings.actions.ts` | getSettings, updateSettings, updateModulePricing, listTeamMembers | h4.adm-config | si | SUPER_ADMIN | N.A. | AgencySettings global (:90-93) |
| `src/app/(protected)/admin/team/_actions/task.actions.ts` | createTask, updateTask, deleteTask, reorderTasks, listTasksByProject, listTasksByUser | h4.adm-equipo | si | SUPER_ADMIN | N.A. | projectId del input (:162,:170), admin global |
| `src/app/(protected)/admin/team/_actions/time-entry.actions.ts` | createTimeEntry, updateTimeEntry, deleteTimeEntry, listTimeEntriesByProject, listTimeEntriesByUser | h4.adm-equipo | si | SUPER_ADMIN | N.A. | taskId (:143-150); rechaza tareas asignadas a otro (:160-162) |
| `src/app/(protected)/admin/tickets/_actions/ticket.actions.ts` | listTickets, getTicketById | h4.adm-tickets | si | SUPER_ADMIN | sí | organizationId opcional como filtro del admin (:62-64); hoy la página no lo pasa (tickets/page.tsx:6) |
| `src/app/(protected)/dashboard/_actions/business-profile.actions.ts` | saveAverageTicket | h2.cli-inicio | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | :25, :33-36 |
| `src/app/(protected)/dashboard/_actions/executive-report-prefs.actions.ts` | saveExecutiveReportPrefs | h2.cli-inicio | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | :23, :31-43 |
| `src/app/(protected)/dashboard/_actions/regenerate-brief.ts` | regenerateBriefAction | h2.cli-inicio | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | :16-17 |
| `src/app/(protected)/dashboard/chatbot/conversations/transcript-action.ts` | getClientConversationTranscriptAction | h3.cli-chatbot | parcial | usuario con OrgMember | sí | session.organization.id (transcript-action.ts:44-48); conversación ajena → [] |
| `src/app/(protected)/dashboard/messages/_actions/mark-read.ts` | markClientMessagesRead | h2.cli-mensajes | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | :12, :15-18 |
| `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts` | importContactsAction, createCampaignAction, sendCampaignAction | h2.cli-email-mkt | si | ORG_MEMBER o SUPER_ADMIN impersonando; NO verifica el modulo | sí | _actions.ts:18, :86-101 |
| `src/app/(protected)/dashboard/resultados/seo/page.tsx` |  | h2.cli-resultados | si | ORG_MEMBER o SUPER_ADMIN impersonando | sí | page.tsx:100, :103-106 organization.findUnique({ id: organizationId }) |
| `src/app/(protected)/setter/_actions/agenda.actions.ts` | ofrecerHorarios, confirmarReunion | h5.set-dia | si | SETTER | N.A. | ownership por sesion: gateAgenda :94 getOwnedLead(leadId, userId), :106 getOwnedDossier; la config de Cal.com sale de CUALQUIER Organizatio… |
| `src/app/(protected)/setter/_actions/cartera.actions.ts` | fijarLead, pausarLead, reanudarLead, guardarNota | h5.set-dia | si | SETTER | N.A. | cartera.actions.ts:48 getOwnedLead(leadId, userId); upsertSetterMeta keyed (leadId, userId) :65 |
| `src/app/(protected)/setter/_actions/dossier.actions.ts` | guardarFicha, registrarEvaluacion, guardarBrief, iniciarConstruccion, reabrirConstruccion, guardarProgreso, guardarDraf… | h5.set-dia | si | SETTER | N.A. | dossier.actions.ts:100 saveOwnedFicha(leadId, userId, ...) (stage FICHA, dossier.ts:260) |
| `src/app/(protected)/setter/_actions/foco.actions.ts` | anclarFoco, soltarFoco | h5.set-dia | si | SETTER | N.A. | foco.actions.ts:41 getOwnedLead antes de escribir la cookie (:45) |
| `src/app/(protected)/setter/_actions/novedades.actions.ts` | marcarNovedadesVistasAction | h5.set-dia | si | SETTER | N.A. | destinatario = userId de sesion (:19-20), sin ids del cliente |
| `src/app/(protected)/setter/_actions/outreach.actions.ts` | registrarOpener, registrarResultado, enviarDemoAprobada | h5.set-dia | si | SETTER | N.A. | outreach.actions.ts:103 getOwnedLead, :109 getOwnedDossier, :119 listOwnedLeadActivities |
| `src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts` | importarProspectos | h5.set-dia | si | SETTER | N.A. | dueño derivado de la sesion: :104-107 construirAltasLote(..., userId); dedup global deliberado :143-146 |
| `src/app/(protected)/setter/_actions/prospecto.actions.ts` | cargarProspecto | h5.set-dia | si | SETTER | N.A. | prospecto.actions.ts:29 ownedLeadCreateData(parsed, userId) (assignedToId de sesion, caliente false: isolation.ts:96) |
| `src/app/accept-invite/actions.ts` | acceptInviteAction | h1.auth-invite | no | ninguno | N.A. | n/a |
| `src/app/bienvenida/_actions/complete-onboarding.ts` | completeOnboardingAction | h2.cli-bienvenida | si | implícito por resolveOrgId (ORG_MEMBER o SUPER_ADMIN impers… | sí | complete-onboarding.ts:23 resolveOrgId(); :33-34 organization.update({ id: organizationId }); :47-48 clientBrandProfile.upsert por organiza… |
| `src/app/cambiar-password/actions.ts` | cambiarPasswordAction | h1.auth-cambio | si | cualquier autenticado | N.A. | Opera sobre session.user.id (actions.ts:35-38) |
| `src/app/forgot-password/actions.ts` | forgotPasswordAction | h1.auth-recupero | no | ninguno | N.A. | n/a |
| `src/app/login/actions.ts` | loginAction, magicLinkAction, googleSignInAction | h1.auth-login | no | ninguno | N.A. | Solo prefetch de rol para el redirect (actions.ts:84-108) |
| `src/app/reset-password/actions.ts` | resetPasswordAction | h1.auth-recupero | no | ninguno | N.A. | n/a |
| `src/components/dashboard/modules/motor-resenas/_actions.ts` | generateDraft, replyAction | h2.cli-resenas | si | ORG_MEMBER o SUPER_ADMIN impersonando; OrgRole no se mira; … | sí | _actions.ts:20 resolveScopedOrgId(await resolveOrgId(), params.organizationId): el parámetro solo se compara y si difiere se rechaza (org-s… |
| `src/lib/actions/announcements.ts` | markAnnouncementsSeenAction | h2.cli-shell | si | cualquier sesion con userId+organizationId | sí | announcements.ts:20, :33 audience ALL u ORG+organizationId |
| `src/lib/actions/clients.ts` | createClientAction, updateClientAction | h4.adm-clientes | si | SUPER_ADMIN | N.A. | crea una org nueva (clients.ts:124-126); no recibe organizationId |
| `src/lib/actions/contact.ts` | contactFormAction, submitContactForm, markLeadAsRead | h6.vis-contacto | no | anónimo | N.A. | ContactSubmission es global (prisma/schema.prisma:688-708) |
| `src/lib/actions/gbp-connection.ts` | listAvailableLocations, setActiveLocation | h2.cli-resenas | parcial | cualquiera con organizationId (sin rol ni OrgRole) | sí | gbp-connection.ts:19 session.user.organizationId (no honra impersonación, patrón D1-c1) |
| `src/lib/actions/impersonation.ts` | startImpersonationAction, stopImpersonationAction | h1.auth-impersonacion | si | SUPER_ADMIN | parametro | orgId argumento (impersonation.ts:11), existencia validada (:17-24); legitimo para SUPER_ADMIN que elige a quien impersonar |
| `src/lib/actions/invitations.ts` | inviteClientAction | h1.auth-invite | sin dato | sin dato | sin dato | — |
| `src/lib/actions/leads.ts` | updateLeadStatusAction, updateLeadNotesAction | h4.adm-leads | si | SUPER_ADMIN | N.A. | ContactSubmission global; update por id leads.ts:31-37 |
| `src/lib/actions/messages.ts` | sendMessageAction, markAdminMessagesAsReadAction, markMessagesAsReadAction, sendClientMessageAction | h2.cli-mensajes | si | cualquier sesion con organizationId | sí | messages.ts:119 session.user.organizationId (la pagina usa resolveOrgId, messages/page.tsx:12) |
| `src/lib/actions/notifications.ts` | markNotificationReadAction, markAllNotificationsReadAction, getMyNotificationsAction | h2.cli-shell | si | cualquier sesion con organizationId | sí | notifications.ts:48, :55-58 updateMany por organizationId (sin userId) |
| `src/lib/actions/profile.ts` | updateProfileAction, updateContactAction, updateNotificationPrefsAction, requestAccountDeletionAction, updatePasswordAc… | h2.cli-cuenta | si | miembro con organizationId en sesion (ORG_MEMBER); OrgRole … | sí | session.user.organizationId (profile.ts:29) usado en update (:55-63) |
| `src/lib/actions/projects.ts` | createProjectAction, updateProjectAction, deleteProjectAction, createTaskAction, updateTaskStatusAction, sendTaskForApp… | h4.adm-proyectos | si | SUPER_ADMIN | sí | organizationId del FormData projects.ts:44, chequeo de existencia :52-53 |
| `src/lib/actions/referrals.ts` | generateMyReferralCodeAction | h2.cli-referidos | si | cualquier sesion con organizationId | sí | referrals.ts:14 session.user.organizationId (la pagina usa resolveOrgId, referidos/page.tsx:27) |
| `src/lib/actions/services.ts` | createServiceAction, updateServiceStatusAction, deleteServiceAction | h4.adm-config | si | SUPER_ADMIN | sí | organizationId del FormData services.ts:30, existencia :41-42 |
| `src/lib/actions/settings.ts` | saveAgencySettingsAction, updateModulePricingAction, inviteTeamMemberAction, testN8nConnectionAction, verifyGooglePermi… | h4.adm-config | si | SUPER_ADMIN | N.A. | AgencySettings global (settings.ts:53-81) |
| `src/lib/actions/upsell.ts` | requestUpsellAction | h2.cli-servicios | si | cualquier sesion con organizationId | sí | upsell.ts:16 session.user.organizationId; la pagina services usa resolveOrgId (services/page.tsx:169) |
| `src/lib/audit-log-queries.ts` | listAuditLog, getAuditLogStats | lib.audit-log-queries | si | SUPER_ADMIN | N.A. | Log global (:32-45) |
| `src/lib/bulk-actions.ts` | bulkPauseBots, bulkExportLeads | lib.bulk-actions | si | SUPER_ADMIN | parametro | orgIds elegidos en la lista de clientes (:8-10, :18-25): legítimo para SUPER_ADMIN |
| `src/lib/tickets/actions.ts` | createTicketAction, replyToTicketAction, updateTicketStatusAction, resolveTicketClientAction | h2.cli-soporte | si | ORG_MEMBER o SUPER_ADMIN impersonando (via resolveOrgId) | sí | tickets/actions.ts:50 resolveOrgId(), :70 organizationId |
| `src/modules/chatbot/server/admin/archiveClient.ts` | archiveClient, unarchiveClient | h4.adm-clientes | si | SUPER_ADMIN | sí | organizationId del input archiveClient.ts:21, re-leída :25-29 (cross-tenant por diseño) |
| `src/modules/chatbot/server/admin/createClientOnly.ts` | createClientOnly | lib.chatbot.admin | si | SUPER_ADMIN | N.A. | Crea org+user+orgMember en $transaction :73-111 |
| `src/modules/chatbot/server/admin/createClientWithBot.ts` | createClientWithBot | lib.chatbot.admin | si | SUPER_ADMIN | N.A. | Crea una org nueva (slug derivado de orgName, :106-107); no escribe en una org existente |
| `src/modules/chatbot/server/admin/hardDeleteClient.ts` | getClientDeletionSummary, hardDeleteClient | h4.adm-clientes | si | SUPER_ADMIN | parametro | hardDeleteClient.ts:116-119 (unsafeGlobalQuery TENANT-MGMT) |
| `src/modules/chatbot/server/admin/integrations/retryCrmSync.ts` | retryCrmSync | lib.chatbot.admin | si | SUPER_ADMIN | sí | organizationId del body (:30), lead verificado dentro de la org con forOrg (:53-56) |
| `src/modules/chatbot/server/admin/integrations/saveCrmIntegration.ts` | saveCrmIntegration | lib.chatbot.admin | si | SUPER_ADMIN | sí | organizationId del body (:40), existencia (:44-47), upsert scoped forOrg (:80, :128) |
| `src/modules/chatbot/server/admin/integrations/testCrmConnection.ts` | testCrmConnection | lib.chatbot.admin | si | SUPER_ADMIN | sí | organizationId del body (:28), integración scoped forOrg (:51) |
| `src/modules/chatbot/server/admin/manageAlerts.ts` | listAlerts, acknowledgeAlert, resolveAlert | h4.adm-alertas | si | SUPER_ADMIN | no-filtra | PLATFORM-AGG cross-org por diseño (manageAlerts.ts:12-13) |
| `src/modules/chatbot/server/admin/preflightChecks.ts` | runPreflightChecks, canActivate | lib.chatbot.admin | no | ninguno | no-filtra | botId del caller -> botConfig.findUnique global por id con include organization (:18-25) |
| `src/modules/chatbot/server/admin/saveBotConfig.ts` | saveBotConfig | lib.chatbot.admin | si | SUPER_ADMIN | parametro | botConfigId del body -> botConfig.findUnique (:84-96); org derivada del bot (:120-123) |
| `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts` | saveBotConfigByOrgSlug | lib.chatbot.admin | si | SUPER_ADMIN | parametro | orgSlug del body -> organization.findUnique por slug (:77-83). Cross-org por diseño de admin, con rol verificado. |
| `src/modules/chatbot/server/admin/saveClientSettings.ts` | saveClientSettings | lib.chatbot.admin | si | Cualquier usuario autenticado con org resuelta; sin chequeo… | sí | updateBotAppearance.ts:61 resolveOrgId() (lib/preview.ts) + :75 forOrg(orgId); no recibe org por parametro |
| `src/modules/chatbot/server/admin/saveKnowledgeBase.ts` | saveKnowledgeBase | lib.chatbot.admin | si | SUPER_ADMIN | sí | botConfigId -> bot.organizationId (:32-39), forOrg (:44-52) |
| `src/modules/chatbot/server/admin/saveKnowledgeBaseByOrgSlug.ts` | saveKnowledgeBaseByOrgSlug | lib.chatbot.admin | si | SUPER_ADMIN | sí | orgSlug del body -> org (:33-40); escritura scoped forOrg(org.id) (:48) |
| `src/modules/chatbot/server/admin/sendTestNotification.ts` | sendTestNotification | lib.chatbot.admin | si | SUPER_ADMIN | parametro | orgSlug del body sólo para armar el preview (:37-44) |
| `src/modules/chatbot/server/admin/updateClient.ts` | updateClient | h4.adm-clientes | si | SUPER_ADMIN | sí | organizationId del input (updateClient.ts:15), re-leída :42-65 (cross-tenant por diseño admin) |
| `src/modules/chatbot/server/admin/updateClientInternalNotes.ts` | updateClientInternalNotes | h4.adm-clientes | si | SUPER_ADMIN | parametro | updateClientInternalNotes.ts:24, :29-33 |
| `src/modules/chatbot/server/admin/updateLeadStatus.ts` | updateLeadStatus | lib.chatbot.admin | si | Cualquier usuario con una fila OrgMember; no exige Role ni … | sí | updateLeadStatus.ts:23 forOrg(session.organization.id); la org sale de getClientSession.ts:15-17 (findFirst sin orderBy, no honra la impers… |
| `src/modules/chatbot/server/dashboard/updateBotAppearance.ts` | updateBotAppearance | lib.chatbot.dashboard | si | ninguno: no mira Role ni OrgRole (cualquier usuario con org… | sí | updateBotAppearance.ts:61 resolveOrgId() (cookie de impersonacion: en preview escribe como el cliente); :75-77 forOrg(orgId).botConfig.find… |
| `src/modules/chatbot/server/insights/manageInsight.ts` | actOnInsight | lib.chatbot.insights | si | miembro de org según getClientChatbotSession (orgMember.fin… | sí | manageInsight.ts:21 forOrg(session.organization.id); :25-32 findFirst scoped + doble chequeo de org |
