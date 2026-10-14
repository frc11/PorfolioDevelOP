export const meta = {
  name: 'f2-ciclo-lectores',
  description: 'F2: lectores por lote de un dominio + verificador adversarial solo para CRITICA/ALTA (tope 3 agentes)',
  phases: [
    { title: 'Lectura', detail: 'un lector general-purpose por lote' },
    { title: 'Verificacion', detail: 'verificador adversarial de CRITICA/ALTA del lote' },
  ],
}

// Plantilla del workflow de F2 (auditoría de renovación 2026-10). La completa f2-construir.mjs:
// reemplaza la línea de la constante A por los argumentos del ciclo, el preámbulo, el PROMPT textual,
// la rúbrica y las herramientas. Lectores por lote (semáforo de 3) + verificador adversarial
// solo para CRÍTICA/ALTA (DEC-37). El meta tiene que ser lo primero del archivo.

// args: { dominio, nombre, ciclo, lente, foco, contexto, prompt_textual, herramientas, lotes: [{id, archivos, carpetas, loc, previas, planeado, insumos}] }
const A = { ...({
 "dominio": "D6",
 "nombre": "Datos",
 "ciclo": "D6-c1",
 "lente": "",
 "foco": "Datos: modelos, relaciones y cascadas peligrosas (onDelete Cascade sobre datos de clientes), indices faltantes para las consultas reales, N+1, soft-deletes, migraciones (el drift schema-migraciones lo mide scripts/auditoria/drift.mjs: 0 diferencias en F0; leer las 14 sentencias DML a mano), cold start de Neon, frontera de aislamiento (src/lib/isolation: registry, scoped-model, unsafeGlobalQuery y sus razones), y los seeds/scripts que escriben en la base (guard de entorno, destino prod, credenciales literales, borrados sin scoping).",
 "contexto": "ALERTAS DE LOS DOCS PARA ESTE DOMINIO (afirmaciones o contradicciones de documentos, NO evidencia: confirmar o descartar cada una contra el codigo y reportarlo en alertas_verificadas, empezando el campo 'alerta' con su id entre corchetes; si se confirma, tambien va como hallazgo):\n- [D6-A1] Migracion 20260619140100 registrada con 'migrate resolve --applied' sin ejecutar el SQL (docs/bitacora-beta.md:1271): el drift por lectura (schema vs migraciones) no lo ve; si el SQL no corrio, la base difiere del historial. Va a 08 como verificacion humana si no se puede cerrar por lectura.\n- [D6-A2] Columnas Organization.avatar*/city/deletedAt/internalNotes, AgencySettings.singleton y chatbot_lead.convertedToOsLeadId: Franco aprobo DROP (docs/bitacora-beta.md:1274-1279) y despues se propone adoptarlas con migracion aditiva (:1746). Ver que dice hoy el schema y quien las usa.\n- [D6-A3] Drift de 7 columnas fisicas que el schema no declara (docs/bitacora-beta-3.md:528), contradicho como cliente stale (:554) y vuelto a marcar (:560).\n- [D6-A4] Orden de migraciones: la de B4.4 (20260522214201_drop_user_unlocked_features, docs/bitacora-roadmap.md:2557) tiene timestamp anterior a las de B4.1 (20260522234313) y B4.3 (20260523001750) aunque se creo despues.\n- [D6-A5] Cerrar lead -> cliente: FK OsLead->Organization propuesta (_insumos/drive/Olme/Ideas de nuevas features.md:18) contra ChatbotLead.convertedToOsLeadId como string suelto por decision (Admin - Registro de cambios/Clientes_ registro de cambios.md:60).\n- [D6-A6] Base de test dedicada pendiente: las suites corren contra Neon dev desde P3 (docs/bitacora-beta-3.md:8082). Cruza con VH-003 (DATABASE_URL_TEST).\n- [D6-A7] Runner de seeds: tsx (Inicio_ registro de cambios.md:88) contra ts-node --transpile-only (Resultados_ registro de cambios.md:31).\nDRIFT (scripts/auditoria/drift.mjs sobre origin/main): 0 diferencias entre schema.prisma y las 86 migraciones (63 tablas, 62 enums, 136 indices, 80 FKs). Estas 14 sentencias DML no se pueden reproducir por script: leelas a mano y reporta si alguna pierde, mezcla o corrompe datos entre tenants:\n- prisma/migrations/20260320200000_multi_tenancy_organizations/migration.sql:24\n- prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:29\n- prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:77\n- prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:114\n- prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:153\n- prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:182\n- prisma/migrations/20260406113000_allow_internal_projects_without_organization/migration.sql:6\n- prisma/migrations/20260406113000_allow_internal_projects_without_organization/migration.sql:14\n- prisma/migrations/20260406113000_allow_internal_projects_without_organization/migration.sql:21\n- prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql:16\n- prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql:17\n- prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql:18\n- prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql:19\n- prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql:20\nPATRONES DEFECTUOSOS QUE YA APARECIERON EN OTROS DOMINIOS (buscalos en tu lote; cada aparicion es un hallazgo con su propia evidencia, o se suma al hallazgo del mismo patron si es la misma causa raiz):\n- [D1-c1] IP del cliente tomada del primer valor de X-Forwarded-For (falsificable segun la plataforma) para rate limit y auditoria (visto en: src/app/login/actions.ts:53, src/lib/security/auth-rate-limit.ts:39, src/lib/audit-log.ts:21)\n- [D1-c1] Alta de usuarios sin normalizar el email (trim + lowercase) mientras el login normaliza (visto en: createClientOnly.ts:26, createClientWithBot.ts:34, admin/chatbots/new/actions.ts:27 -> onboarding/core.ts:70)\n- [D1-c1] Actions que usan session.user.organizationId (fallan en preview admin) frente a resolveOrgId (escriben como el cliente) (visto en: src/lib/actions/profile.ts:29, src/lib/actions/upsell.ts:16 vs email-marketing/_actions.ts:18)\n- [D1-c1] Mensajes internos de error devueltos al cliente (toErrorMessage o error instanceof Error ? error.message) (visto en: src/lib/actions/profile.ts:72, src/lib/actions/settings.ts:92, src/lib/action-utils.ts:31)\n- [D1-c1] Envios de email cuyo resultado se ignora o que fingen exito sin API key (visto en: src/auth.ts:104, src/lib/actions/settings.ts:194, src/lib/email.ts:15-16)\n- [D1-c1] orgMemberships con take:1 sin orderBy (org primaria no deterministica) (visto en: src/auth.ts:37, src/app/login/actions.ts:94, src/app/api/qa/login/route.ts:126)\n- [D1-c1] Texto funcional en text-zinc-600/700 sobre #080a0c (contraste < 4,5:1) (visto en: src/app/login/page.tsx:263, :367, :404; forgot-password, reset-password, accept-invite)\n- [D1-c1] Bloques de error sin role=alert/aria-live (visto en: login/page.tsx:358, forgot-password/page.tsx:157, ResetPasswordForm.tsx:212, AcceptInviteForm.tsx:217)\n- [D1-c1] Paginas admin sin guard propio (dependen de admin/layout + proxy) (visto en: 22 de 34 paginas /admin (p. ej. admin/leads/page.tsx, admin/tickets/[ticketId]/page.tsx, admin/settings/page.tsx))\n- [D1-c1] Modulos 'use server' sin importadores (actions muertas pero publicas si se reconectan) (visto en: src/lib/actions/invitations.ts, src/lib/actions/settings.ts, src/lib/actions/clients.ts)\n- [D1-c1] Fallos manejados que solo hacen console.error (no llegan a Sentry; no hay captureConsoleIntegration) (visto en: forgot-password/actions.ts:105, audit-log.ts:40, brevo-service.ts:41)\n- [D1-c1] Tokens de un solo uso guardados en claro en la DB (visto en: forgot-password/actions.ts:73, invitations.ts:102, settings.ts:180)\n- [D1-c1] requireSuperAdmin reimplementado en varios modulos (visto en: src/lib/auth-guards.ts:3, src/lib/actions/settings.ts:20, src/modules/chatbot/server/admin/requireSuperAdmin.ts)\n- [D1-c1] Config de NextAuth duplicada entre auth.ts y auth.config.ts que diverge (maxAge, callbacks) (visto en: session.maxAge solo en auth.ts:81; jwt callback solo en auth.ts:205)\n- [D1-c2] Página de servidor que lee la base confiando en el guard del layout, sin auth()/require* propio. El render parcial de RSC no re-ejecuta el layout y el proxy decide con claims viejos del JWT (visto en: 15 páginas de /admin (admin/page.tsx:182, team/page.tsx:19, referrals/page.tsx:9, projects/page.tsx:9, leads/page.tsx:23, leados/page.tsx:34, ...). Control: /se)\n- [D1-c2] IP de cliente tomada del primer valor de X-Forwarded-For (visto en: lib/security/auth-rate-limit.ts:39 (forgot, reset, contacto), lib/audit-log.ts:21, app/login/actions.ts:53 (SEC-007) y modules/chatbot/server/chat/requestSchema)\n- [D1-c2] Resolución de la org de sesión paralela a resolveOrgId: orgMember.findFirst sin orderBy, sin mirar el rol y sin honrar la impersonación (visto en: modules/chatbot/server/admin/getClientSession.ts:5-33. La usan dashboard/chatbot/* y api/dashboard/chatbot/leads/export. Puede discrepar de session.user.organiz)\n- [D1-c2] Header de request que nadie setea, leído como si lo pusiera el servidor (x-pathname) (visto en: (protected)/dashboard/layout.tsx:124: el gate de onboarding se saltea mandando el header. dashboard/modules/email-marketing/layout.tsx:24: la tab activa nunca s)\n- [D1-c2] Interpolación sin escapar en el HTML de emails (la variable 'safeName' no escapa) (visto en: lib/email/templates/password-reset.ts:12 y el h1. Es el nombre propio del destinatario, así que el riesgo es bajo. Revisar welcome-client.ts, bot-activated.ts y)\n- [D1-c2] Servidores de desarrollo y QA escuchando en todas las interfaces (sin -H) con flags de QA encendidos (visto en: package.json:7-13 (dev, dev:qa, start, start:qa, start:setter, start:galeria). QA_ALLOW_LOCALHOST también abre los escapes de validate-origin.ts (D3).)\n- [D1-c2] Server action exportada que escribe estado o auditoría sin chequear rol (visto en: lib/actions/impersonation.ts:50 (stopImpersonationAction) y su wrapper admin/clients/_actions/client.actions.ts:12.)\n- [D1-c3] Org de la impersonación resuelta al momento de la acción desde una cookie global (resolveOrgId en server actions que escriben) (visto en: (protected)/dashboard/_actions/business-profile.actions.ts:25, dashboard/modules/email-marketing/_actions.ts:18, lib/tickets/actions.ts, executive-report-prefs.)\n- [D1-c3] Claves de rate limit armadas con datos del pedido sin validar: cada valor nuevo es una fila nueva en rate_limit, que no se purga (visto en: api/motor/webhook/[channelToken]/route.ts:34 (token de la URL), modules/chatbot/server/chat/handleChatRequest.ts:185 (sessionId del body), forgot-password/actio)\n- [D1-c3] Texto libre sin .max() que termina en el prompt del chatbot o en emails (visto en: lib/actions/schemas.ts:15-16, bienvenida/_actions/complete-onboarding.ts:10, actions/onboarding-actions.ts:20, lib/actions/clients.ts:26)\n- [D1-c3] Mutación en la base y después envío por Brevo dentro de la respuesta (SDK con 60 s x 3 intentos): si la función expira, se pierde lo que solo se devolvía al final (visto en: modules/chatbot/server/admin/createClientOnly.ts:142 (tempPassword solo en la respuesta), api/admin/users/[userId]/resend-credentials/route.ts:85, forgot-passwo)\n- [D1-c3] Auditoría escrita después del efecto con un helper que traga el error sin Sentry (visto en: 43 llamadas en 31 archivos; p. ej. modules/chatbot/server/admin/hardDeleteClient.ts:166, archiveClient.ts:37, reset-password/actions.ts:87)\n- [D1-c3] Guards que lanzan Error('Unauthorized') genérico sin try/catch: sesión vencida o invalidada a mitad de una acción lleva a error.tsx y a un evento en Sentry en vez de a /login (visto en: lib/actions/projects.ts:109, :159, :178; (protected)/setter/page.tsx:29)\n- [D1-c3] Fallback de URL base a http://localhost:3000 en links de emails: link roto si falta la variable en producción (check-env.js no corre en el build) (visto en: forgot-password/actions.ts:87 y 11 sitios más (lib/tickets/actions.ts:156, lib/alerts.ts:50, lib/email/unsubscribe-token.ts:58 y :118, lib/reports/executive-wee)\n- [D1-c3] Tokens de un solo uso en el query string que pueden ir a Sentry: scrub-pii no cubre tokens hex y no hay beforeSendTransaction (tracesSampleRate 0.1 y replays on error en el cliente) (visto en: lib/sentry/scrub-pii.ts:53-67, instrumentation-client.ts:6-11)\n- [D1-c3] Escritura fire-and-forget en cada navegación a una columna sin lectores, que durante la impersonación marca al SUPER_ADMIN (visto en: (protected)/dashboard/layout.tsx:80-87)",
 "lotes": [
  {
   "id": "D6-L1",
   "loc": 5719,
   "archivos": [
    "prisma.config.ts",
    "prisma/schema.prisma",
    "prisma/seed-agency-os.ts",
    "prisma/seed-guard.ts",
    "prisma/seed.ts"
   ],
   "previas": [
    {
     "doc": "docs/audits/2026-05-auditoria-profunda.md",
     "linea": 36,
     "id_previo": "P0-5",
     "titulo": "Project.organizationId nullable",
     "severidad_original": "P0",
     "estado_declarado": "Abierto en el doc. En dev se reasignó el único huérfano (2026-05-cleanup-db-dev.md:145-161,182). CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:66 y 2026-06-revalidacion.md:37,67 (NOT NULL, migration b11_1).",
     "archivos_citados": [
      "prisma/schema.prisma:381"
     ],
     "dominio_probable": "D6",
     "resumen": "Un Project huérfano deja sus Task accesibles sin scoping por organización."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-db.md",
     "linea": 145,
     "id_previo": "DB-P0-1",
     "titulo": "Subscription.planName es un String libre (falta el modelo Plan)",
     "severidad_original": "P0 (Resolver antes de planes/hardening)",
     "estado_declarado": "Abierto en el doc. CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:211 y 2026-06-revalidacion.md:84 (Plan + FK planId). Queda un residual: planName coexiste con planId (NUEVO-P1-2, RDC:75; N-4, revalidacion:57).",
     "archivos_citados": [
      "prisma/schema.prisma:424-435"
     ],
     "dominio_probable": "D6",
     "resumen": "Plan tenía que entrar como FK; construir planes sin eso crea una segunda fuente de verdad."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-db.md",
     "linea": 147,
     "id_previo": "DB-P0-3",
     "titulo": "Project.organizationId nullable con 1 fila huérfana",
     "severidad_original": "P0",
     "estado_declarado": "Abierto ('sigue abierto'; antes marcado como P0-5). En dev se reasignó (2026-05-cleanup-db-dev.md:145-161,182; prod pendiente, :6). CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:211 y 2026-06-revalidacion.md:37,84.",
     "archivos_citados": [
      "prisma/schema.prisma:381-388"
     ],
     "dominio_probable": "D6",
     "resumen": "La fila huérfana queda accesible sin scoping en cualquier listado admin sin filtro defensivo."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-db.md",
     "linea": 153,
     "id_previo": "DB-P1-1",
     "titulo": "Métricas denormalizadas en Conversation sin garantía transaccional",
     "severidad_original": "P1",
     "estado_declarado": "Abierto en el doc. Sigue ABIERTO según 2026-06-revalidacion-dashboard-chatbot.md:213 y 2026-06-revalidacion.md:85.",
     "archivos_citados": [
      "prisma/schema.prisma:1003-1010"
     ],
     "dominio_probable": "D6",
     "resumen": "messageCount, tokens, costo y leadCaptured pueden desviarse si un escritor olvida actualizarlos; no hay helper único ni test."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-db.md",
     "linea": 155,
     "id_previo": "DB-P1-3",
     "titulo": "User.unlockedFeatures es legacy pero sigue activo en el código",
     "severidad_original": "P1",
     "estado_declarado": "Abierto en el doc. CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:211 (y :103) y 2026-06-revalidacion.md:84 (columna dropeada).",
     "archivos_citados": [
      "prisma/schema.prisma:240",
      "src/app/(protected)/dashboard/layout.tsx:108",
      "src/lib/actions/clients.ts:222-244"
     ],
     "dominio_probable": "D6",
     "resumen": "Coexiste con OrganizationModule como segunda vía para habilitar módulos."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-db.md",
     "linea": 156,
     "id_previo": "DB-P1-4",
     "titulo": "BusinessMetric.clientId y PageView.clientId apuntan a User y no a Organization",
     "severidad_original": "P1",
     "estado_declarado": "Abierto en el doc. CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:211 y 2026-06-revalidacion.md:84.",
     "archivos_citados": [
      "prisma/schema.prisma:547-568"
     ],
     "dominio_probable": "D6",
     "resumen": "Las métricas pierden el contexto de tenant si un user pertenece a varias orgs."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-db.md",
     "linea": 157,
     "id_previo": "DB-P1-5",
     "titulo": "AdminAuditLog sin organizationId (propuesta: targetOrganizationId opcional)",
     "severidad_original": "P1",
     "estado_declarado": "Abierto en el doc. Sigue ABIERTO según 2026-06-revalidacion-dashboard-chatbot.md:213 y 2026-06-revalidacion.md:85.",
     "archivos_citados": [
      "prisma/schema.prisma:1177-1201"
     ],
     "dominio_probable": "D6",
     "resumen": "Sin ese campo no se puede filtrar el log por la org afectada (soporte y forensia)."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-db.md",
     "linea": 160,
     "id_previo": "DB-P1-8",
     "titulo": "Falta el índice ChatbotEvent(botConfigId, type, createdAt desc)",
     "severidad_original": "P1",
     "estado_declarado": "Abierto en el doc. CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:211 y 2026-06-revalidacion.md:84.",
     "archivos_citados": [
      "prisma/schema.prisma:1141",
      "src/modules/chatbot/server/admin/detectBotIssues.ts:84-225"
     ],
     "dominio_probable": "D6",
     "resumen": "El cron de detección filtra por type en memoria."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 60,
     "id_previo": "NUEVO-P0-1",
     "titulo": "Chatbot caído: HTTP 500 en cada mensaje por el casing GOOGLE vs 'google'",
     "severidad_original": "P0",
     "estado_declarado": "NUEVO (abierto). Lo reitera 2026-06-revalidacion.md:54 (N-1). Ningún doc posterior de la lista declara el fix.",
     "archivos_citados": [
      "src/modules/chatbot/server/chat/handleChatRequest.ts:524,642",
      "src/modules/chatbot/server/llm/factory.ts:28-42",
      "prisma/schema.prisma:1115",
      "src/modules/chatbot/shared/types.ts:45"
     ],
     "dominio_probable": "D5",
     "resumen": "El enum LlmProvider guarda GOOGLE y el factory solo conoce 'google'; el cast 'as' tapó la diferencia y tira 'Unknown LLM provider: GOOGLE'. No hay mensajes exitosos desde el 2026-05-23."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 62,
     "id_previo": "P0-1",
     "titulo": "Cliente San Miguel sin bot",
     "severidad_original": "P0",
     "estado_declarado": "CERRADO: bot sanmiguel activo por seed, 0 tráfico (:62).",
     "archivos_citados": [
      "prisma/seed.ts"
     ],
     "dominio_probable": "D5",
     "resumen": "Re-verificación del P0-1 de 2026-05-auditoria-profunda.md:32."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 66,
     "id_previo": "P0-5",
     "titulo": "Project.organizationId nullable",
     "severidad_original": "P0",
     "estado_declarado": "CERRADO: NOT NULL por la migration b11_1 (:66).",
     "archivos_citados": [
      "prisma/schema.prisma:500"
     ],
     "dominio_probable": "D6",
     "resumen": "Re-verificación del P0-5 de profunda:36 (= DB-P0-3)."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 75,
     "id_previo": "NUEVO-P1-2",
     "titulo": "Subscription.planName coexiste con planId (doble fuente de verdad)",
     "severidad_original": "P1",
     "estado_declarado": "NUEVO (abierto); es el mismo DB-P1-2e abierto (:213). Lo reitera 2026-06-revalidacion.md:57 (N-4).",
     "archivos_citados": [
      "prisma/schema.prisma:577-579"
     ],
     "dominio_probable": "D6",
     "resumen": "En la base, las suscripciones tienen planName='Business' y además planId: residual de DB-P0-1."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion.md",
     "linea": 54,
     "id_previo": "N-1",
     "titulo": "Bot caído: HTTP 500 en cada chat (casing GOOGLE distinto de 'google', tapado por un cast 'as')",
     "severidad_original": "NUEVO-P0 (:15)",
     "estado_declarado": "NUEVO (abierto); fix de 1 línea pendiente (:135). Ningún doc posterior de la lista lo cierra.",
     "archivos_citados": [
      "src/modules/chatbot/server/chat/handleChatRequest.ts:524,642",
      "src/modules/chatbot/server/llm/factory.ts:28-42",
      "prisma/schema.prisma:1115",
      "src/modules/chatbot/shared/types.ts:45"
     ],
     "dominio_probable": "D5",
     "resumen": "Es el mismo hallazgo que NUEVO-P0-1 de 2026-06-revalidacion-dashboard-chatbot.md:60. Se reprodujo en vivo, con 0 éxitos desde el 2026-05-23."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion.md",
     "linea": 57,
     "id_previo": "N-4",
     "titulo": "Subscription.planName coexiste con planId (doble fuente de verdad)",
     "severidad_original": "🟠 NUEVO en la tabla de nuevos (:57); equivale a DB-P1-2e abierto (:85), o sea P1",
     "estado_declarado": "NUEVO (abierto); la acción de dropear planName queda pendiente (:140).",
     "archivos_citados": [
      "prisma/schema.prisma:577-579"
     ],
     "dominio_probable": "D6",
     "resumen": "Es el mismo hallazgo que NUEVO-P1-2 del doc hermano."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion.md",
     "linea": 67,
     "id_previo": "P0-5",
     "titulo": "Project.organizationId nullable",
     "severidad_original": "P0",
     "estado_declarado": "CERRADO: NOT NULL y 0 huérfanos en la base (:67, :37).",
     "archivos_citados": [
      "prisma/schema.prisma:500"
     ],
     "dominio_probable": "D6",
     "resumen": "Re-verificación de profunda:36."
    },
    {
     "doc": "docs/b8a-auditoria.md",
     "linea": 76,
     "id_previo": "H8",
     "titulo": "Bypass QA roto por passwordResetRequired",
     "severidad_original": "bloqueante QA (tabla :88, clase SENSIBLE)",
     "estado_declarado": "Propuesto 'Ejecutar (seed = false)' (tabla :88). docs/b8a-ii-auditoria.md:6 implica que está resuelto.",
     "archivos_citados": [
      "prisma/seed.ts:137-154",
      "prisma/seed.ts:144,152",
      "src/auth.ts:237-275",
      "src/auth.ts:241-261",
      "src/app/api/qa/login/route.ts:169"
     ],
     "dominio_probable": "D1",
     "resumen": "El seed crea el setter QA con passwordResetRequired:true, y el jwt callback lo vuelve a leer de la DB y pisa el false del token qa-bypass, lo que manda a /cambiar-password. Fix elegido: que el seed lo cree en false."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 101,
     "id_previo": "P0-5",
     "titulo": "Project.organizationId nullable deja Tasks sin scoping",
     "severidad_original": "P0 (2026-05-auditoria-profunda)",
     "estado_declarado": "CERRADO-VERIFICADO (:148): Project.organizationId es non-nullable; Notification.organizationId sigue nullable por diseño",
     "archivos_citados": [
      "prisma/schema.prisma:550",
      "prisma/schema.prisma:704"
     ],
     "dominio_probable": "D6",
     "resumen": "Fuente original: docs/audits/2026-05-auditoria-profunda.md."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 1152,
     "id_previo": "MIG-01",
     "titulo": "Las migraciones corren por el pooler: no hay directUrl en el datasource",
     "severidad_original": "P1",
     "estado_declarado": "abierto al 2026-07-10 (sprint O1.2a)",
     "archivos_citados": [
      "prisma/schema.prisma:5-8"
     ],
     "dominio_probable": "D6",
     "resumen": "Tampoco hay variable DIRECT en el env local: migrate corre contra el host -pooler, una config no soportada para DDL (el quirk P1001 ya está documentado)."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 1153,
     "id_previo": "MIG-02",
     "titulo": "Drift entre la dev DB y main: 7 tablas y 12 enums del motor",
     "severidad_original": "P1 (de runbook)",
     "estado_declarado": "abierto al 2026-07-10; se resuelve solo al mergear b1 y falta un guardrail escrito (sprint O1.2b)",
     "archivos_citados": [
      "prisma/schema.prisma",
      "prisma.config.ts:7"
     ],
     "dominio_probable": "D6",
     "resumen": "La dev DB tiene 4 migraciones del motor que no están en main; un migrate dev desde main propondría DROP de las 7 tablas motor_*."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 1632,
     "id_previo": "OBS-05",
     "titulo": "Costo de LLM subestimado y sin umbral de gasto",
     "severidad_original": "P1",
     "estado_declarado": "abierto al 2026-07-10 (sprint O3.3; decisión: umbral en USD)",
     "archivos_citados": [
      "src/lib/ai/executive-brief.ts",
      "src/modules/chatbot/server/insights/generateInsights.ts",
      "prisma/schema.prisma:1570-1571"
     ],
     "dominio_probable": "D5",
     "resumen": "Los briefs y los insights llaman a Gemini sin registrar el usage, y no hay alerta de gasto mensual. QuotaUsage.alert80Sent es un campo muerto."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 1634,
     "id_previo": "OBS-06",
     "titulo": "Telemetría de conversación incompleta y retención sin control",
     "severidad_original": "P1",
     "estado_declarado": "abierto al 2026-07-10 (sprint O3.2)",
     "archivos_citados": [
      "prisma/schema.prisma:1296",
      "src/modules/chatbot/server/logging/persistentLogger.ts:71"
     ],
     "dominio_probable": "D5",
     "resumen": "No hay snapshot del modelo por turno y Conversation.endedAt nunca se escribe. cleanupOldEvents no tiene caller, así que chatbot_events crece sin límite."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 1908,
     "id_previo": "LEG-01",
     "titulo": "Captura activa de PII sin ninguna pieza legal en la app",
     "severidad_original": "P0 legal",
     "estado_declarado": "abierto al 2026-07-10 (sprint O5.4; decisión humana y validación de un abogado)",
     "archivos_citados": [
      "prisma/schema.prisma:1420",
      "src/app/contact/page.tsx:151-212",
      "src/modules/chatbot/components/chat/ChatWindow.tsx"
     ],
     "dominio_probable": "D9",
     "resumen": "Captura nombre, email y teléfono por el chatbot y el form, y persiste las transcripciones, sin política de privacidad, ToS, aviso ni canal ARCO (Ley 25.326, art. 6). Los clientes del widget heredan el gap."
    }
   ],
   "previas_omitidas": 0,
   "planeado": [
    {
     "id": "PLAN-1085",
     "clave": "docs/bitacora-roadmap.md:2126",
     "tipo": "pendiente",
     "titulo": "Inconsistencia de @@map (snake_case) entre modelos del schema",
     "descripcion": "Algunos modelos usan @@map (plan, premium_module, organization_module) y otros no; corregirlo es scope aparte.",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/schema.prisma"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1088",
     "clave": "docs/bitacora-roadmap.md:4452",
     "tipo": "pendiente",
     "titulo": "Organization.n8nWorkflowIds (legacy) sin uso",
     "descripcion": "Campo String[] existente sin uso en el código; B5.8 creó su propio modelo dedicado.",
     "estado_declarado": "sin estado",
     "refs": [
      "prisma/schema.prisma"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1299",
     "clave": "docs/bitacora-roadmap.md:6719",
     "tipo": "pendiente",
     "titulo": "Notification.organizationId sigue nullable",
     "descripcion": "Aplicar el mismo patrón NOT NULL + Cascade; no bloqueante.",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/schema.prisma"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-992",
     "clave": "_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:167",
     "tipo": "pendiente",
     "titulo": "Infra: default 'generic', DIRECT_URL, main/prod y Vertex",
     "descripcion": "El default 'generic' del schema es código muerto (cambiarlo exige migración). DIRECT_URL sin setear. Reconciliar las branches main y prod. Gobernanza de Vertex/GCP a cargo de Franco.",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/schema.prisma",
      "DIRECT_URL",
      "tambien en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:168"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1127",
     "clave": "docs/bitacora-roadmap.md:10353",
     "tipo": "pendiente",
     "titulo": "Activar módulos premium en el seed de QA",
     "descripcion": "client-a sin organizationModule ACTIVE impide verificar visualmente motor-reseñas/agenda/tienda/email.",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/seed.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1133",
     "clave": "docs/bitacora-roadmap.md:11989",
     "tipo": "pendiente",
     "titulo": "Aplicar migración ExecutiveReportFrequency",
     "descripcion": "Revisar y aplicar en la Neon compartida, regenerar Prisma y correr invariantes y tests.",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/schema.prisma",
      "también en fuente:11946",
      "también en fuente:11986"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1061",
     "clave": "docs/bitacora-beta.md:1726",
     "tipo": "pendiente",
     "titulo": "seed-agency-os falla en projectSeeds sin la org 'develop'",
     "descripcion": "Error 'No se encontro organizationId para develop' si la BD no tiene esa org; los qaLeadSeeds se insertan antes de ese punto.",
     "estado_declarado": "pendiente (fuera de scope)",
     "refs": [
      "prisma/seed-agency-os.ts",
      "también en docs/bitacora-beta-2.md:129"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1095",
     "clave": "docs/bitacora-roadmap.md:7013",
     "tipo": "hecho-declarado",
     "titulo": "B11.5 — 3 índices agregados (Conversation, ChatbotEvent, Notification)",
     "descripcion": "Índices (botConfigId, lastMessageAt desc), (botConfigId, type, createdAt desc) y (organizationId, createdAt desc); los DROP de índices muertos quedaron diferidos (parcial por diseño).",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/schema.prisma",
      "prisma/migrations/20260525192047_b11_5_add_3_missing_indexes/migration.sql",
      "docs/roadmap-pendientes.md",
      "docs/audits/2026-05-auditoria-db.md"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1315",
     "clave": "docs/bitacora-roadmap.md:8585",
     "tipo": "hecho-declarado",
     "titulo": "B13.2 — Aplicación de tokens + quick wins (inventario dentro del rango)",
     "descripcion": "Inventario: bot demo 'CHATBOT' solo en la DB (slug chatbot, Empresa Demo, pausado), quick reply de Lucia con emoji en seed.ts:248, eyebrows 'Fila 1/2/3', KPIs con color decorativo, ColorPicker, eyebrows con la marca y MarkdownEditor sin highlight de placeholders. Los cambios aplicados se detallan después de la línea 8600 (fuera de este rango).",
     "estado_declarado": "hecho",
     "refs": [
      "src/modules/chatbot/prisma/seed.ts:248",
      "src/app/(protected)/admin/page.tsx",
      "src/modules/chatbot/components/admin/config/ColorPicker.tsx",
      "src/modules/chatbot/components/admin/kb/MarkdownEditor.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1113",
     "clave": "docs/bitacora-roadmap.md:9220",
     "tipo": "hecho-declarado",
     "titulo": "BP.4 sin flag de heap + prisma.config.ts",
     "descripcion": "Se quitó NODE_OPTIONS 8 GB del build y la config Prisma pasó a prisma.config.ts.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma.config.ts",
      "package.json"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1129",
     "clave": "docs/bitacora-roadmap.md:10530",
     "tipo": "hecho-declarado",
     "titulo": "C.0 seeds blindados contra prod",
     "descripcion": "assertDevSeedTarget aborta contra prod; passwords de seed pasan a env vars sin default.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/seed-guard.ts",
      "prisma/seed.ts",
      "prisma/seed-agency-os.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1055",
     "clave": "docs/bitacora-beta.md:11",
     "tipo": "hecho-declarado",
     "titulo": "C.0 Guard anti-prod en seeds + passwords a env",
     "descripcion": "Guard compartido assertDevSeedTarget (aborta sin DATABASE_URL, con NODE_ENV=production o host no dev; override ALLOW_PROD_SEED=1) y passwords de seed a env vars SEED_*_PASSWORD sin default.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/seed-guard.ts",
      "prisma/seed.ts",
      "prisma/seed-agency-os.ts",
      ".env.example"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1086",
     "clave": "docs/bitacora-roadmap.md:2565",
     "tipo": "pendiente",
     "titulo": "Pre-flight en prod antes del DROP COLUMN de unlockedFeatures",
     "descripcion": "Migrar slugs residuales de prod a OrganizationModule antes del merge (el script se borró; recuperarlo del historial) o aceptar perder esos arrays.",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/seeds/migrate-unlocked-features.ts (borrado)",
      "tambien en docs/bitacora-roadmap.md:2623",
      "tambien en docs/bitacora-roadmap.md:2628"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-998",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:62",
     "tipo": "pendiente",
     "titulo": "Enum-izar ContactSubmission.leadStatus",
     "descripcion": "Diferido: pasar String? a enum no es aditivo. Necesita columna nueva, backfill y cutover, o descartarse.",
     "estado_declarado": "pendiente",
     "refs": [
      "ContactSubmission.leadStatus",
      "tambien en Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:91"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-993",
     "clave": "_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:68",
     "tipo": "pendiente",
     "titulo": "Fallback develop de seed-agency-os roto",
     "descripcion": "El map organizationIdBySlug nunca recibe la key. Bug separado.",
     "estado_declarado": "pendiente",
     "refs": [
      "seed-agency-os",
      "organizationIdBySlug"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-968",
     "clave": "_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:70",
     "tipo": "pendiente",
     "titulo": "Integrar T0/MH/RB al índice y generar sus hojas",
     "descripcion": "Sumar 'R1 exige MH' y EST.0 al 00-INDICE. Las hojas de corrida de T0, MH y RB no están generadas.",
     "estado_declarado": "pendiente",
     "refs": [
      "00-INDICE-bloques-ejecucion.md",
      "tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:71"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1168",
     "clave": "STATUS.md:151",
     "tipo": "pendiente",
     "titulo": "Borrar org seed san-miguel",
     "descripcion": "Seed mock marcada para limpieza con 3 projects, 4 services y 1 user.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :183, :239, :259"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1166",
     "clave": "docs/sprints/utm-1-captura.md:228",
     "tipo": "pendiente",
     "titulo": "Avisar al socio de la migración en Neon compartida",
     "descripcion": "SQL aditivo aplicado sobre la branch dev compartida.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :252"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1109",
     "clave": "docs/bitacora-roadmap.md:9127",
     "tipo": "pendiente",
     "titulo": "Eliminar stubs de Prisma del bundle cliente",
     "descripcion": "Requiere verbatimModuleSyntax o alias webpack; sprint dedicado.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-1139",
     "clave": "docs/bitacora-roadmap.md:13504",
     "tipo": "pendiente",
     "titulo": "Drift de migraciones entre ramas",
     "descripcion": "add_portal_indexes local sin aplicar y 3 migraciones b1s* del motor en la DB dev ausentes en la rama.",
     "estado_declarado": "pendiente",
     "refs": [
      "20260710203413_add_portal_indexes",
      "también en fuente:13611"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1144",
     "clave": "docs/bitacora-roadmap.md:14302",
     "tipo": "pendiente",
     "titulo": "Riesgo de envenenamiento del pool de Prisma",
     "descripcion": "withDeadline abandona sin cancelar; vigilar P2024; cancelación real exige statement_timeout en Neon (decisión con Franco).",
     "estado_declarado": "pendiente",
     "refs": [
      "también en fuente:14366"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1007",
     "clave": "docs/bitacora-beta-3.md:528",
     "tipo": "pendiente",
     "titulo": "Drift físico de 7 columnas del lane chatbot",
     "descripcion": "Organization.averageTicketUsd, chatbot_bot_config.verticalPack, chatbot_lead.firstContactedAt/signals/utm*: reconciliar es decisión de Franco.",
     "estado_declarado": "pendiente",
     "refs": [
      "también en fuente:534,554,560,1801"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1029",
     "clave": "docs/bitacora-beta-3.md:4808",
     "tipo": "pendiente",
     "titulo": "Rotar credencial de la branch Neon dev",
     "descripcion": "Un prefijo del password quedó impreso en el log de una sesión; el documento no contiene el valor.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-1059",
     "clave": "docs/bitacora-beta.md:955",
     "tipo": "pendiente",
     "titulo": "Reconciliar main con 3 migraciones aplicadas en el Neon dev compartido",
     "descripcion": "Faltan en el repo 20260617184913_add_converted_lead_link_and_bot_deleted_audit, 20260619234252_add_organization_city_avatar_notes_softdelete y 20260620173833_add_agency_settings_singleton_unique; si no, migrate dev pedirá reset.",
     "estado_declarado": "pendiente (acción para Franco)",
     "refs": [
      "prisma/migrations",
      "también en docs/bitacora-beta.md:958",
      "relacionado docs/bitacora-beta.md:1258",
      "relacionado docs/bitacora-beta.md:1746"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1080",
     "clave": "docs/bitacora-roadmap.md:213",
     "tipo": "idea",
     "titulo": "Mitigar la latencia de Neon en dev",
     "descripcion": "Opciones: branch dev en us-east-2, Postgres local o cache server-side (unstable_cache / React cache); amerita sprint propio por el trade-off con prod en sa-east-1.",
     "estado_declarado": "sin estado",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-1313",
     "clave": "docs/bitacora-roadmap.md:8411",
     "tipo": "decision",
     "titulo": "Bloque B13: 'Profundizar es DEFINIR, no AGREGAR'",
     "descripcion": "Visual puro: cero lógica, queries, auth o schema; quitar efectos antes que sumarlos.",
     "estado_declarado": "hecho",
     "refs": [
      "tambien en docs/bitacora-roadmap.md:8506"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1000",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:74",
     "tipo": "decision",
     "titulo": "Nada se aplica a Neon sin commit y push previo",
     "descripcion": "Regla de proceso adoptada tras el incidente de las migraciones fantasma.",
     "estado_declarado": "hecho",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-1238",
     "clave": "_insumos/drive/Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:54",
     "tipo": "decision",
     "titulo": "Patrones establecidos del admin",
     "descripcion": "Hover único adminHoverCls. Modales portaleados a body por la trampa de backdrop-filter. TypeToConfirmDialog con auditoría sin FK. Schemas Zod en .schemas.ts. Navegación con <Link> o router.refresh, nunca router.push.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/hover.ts",
      "TypeToConfirmDialog",
      "AdminLayoutClient.tsx",
      "tambien en Olme/Admin - Registro de cambios/Operaciones/Leads_ registro de cambios.md:73",
      "tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:61",
      "tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:14"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1254",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:66",
     "tipo": "decision",
     "titulo": "Chat compartido: solo la UI",
     "descripcion": "El componente no importa Prisma ni tiene actions. Los datos de tickets y de mensajes no se mezclan.",
     "estado_declarado": "hecho",
     "refs": [
      "tambien en Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:68"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1350",
     "clave": "STATUS.md:112",
     "tipo": "decision",
     "titulo": "Visual regression: re-baseline o investigar",
     "descripcion": "3 fails de spec 22 (drift <2%) esperan decisión de Franco.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :237"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1170",
     "clave": "STATUS.md:223",
     "tipo": "decision",
     "titulo": "Aislamiento dev/prod con Neon branching",
     "descripcion": ".env apunta a la branch dev; prod a main desde Netlify.",
     "estado_declarado": "decidido",
     "refs": [
      "B0.1"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1074",
     "clave": "docs/bitacora-roadmap.md:6",
     "tipo": "hecho-declarado",
     "titulo": "B0.6 — Build verde + purga del leak enviroment.env",
     "descripcion": "tsc y build verdes; enviroment.env purgado de todo el history con git-filter-repo en un mirror local (no pusheado). La migración de executive-brief.ts al provider factory (Gemini) ya estaba en el working tree.",
     "estado_declarado": "hecho",
     "refs": [
      "docs/audits/2026-05-bfg-leak-cleanup.md",
      "src/lib/ai/executive-brief.ts",
      "commit 3953558 reescrito a 7f69ff1 (mirror local)"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-994",
     "clave": "_insumos/drive/Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:37",
     "tipo": "hecho-declarado",
     "titulo": "Migraciones de la 3ª tanda",
     "descripcion": "Organization recibe city, avatar*, internalNotes y deletedAt. AgencySettings recibe singleton @unique. Ambas con migrate deploy.",
     "estado_declarado": "hecho",
     "refs": [
      "988d1ae",
      "d14fcff",
      "tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:37",
      "tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:68"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1161",
     "clave": "docs/sprints/alpha-0-7-baseline-observability.md:5",
     "tipo": "hecho-declarado",
     "titulo": "Baseline y observabilidad",
     "descripcion": "P95 12987 ms y DB 1082 ms; configs de Sentry; documentación de backups Neon y DR.",
     "estado_declarado": "hecho",
     "refs": [
      "docs/baselines/2026-05-chatbot-runtime.md",
      "docs/operations/neon-backups.md"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1321",
     "clave": "docs/bitacora-roadmap.md:9326",
     "tipo": "hecho-declarado",
     "titulo": "B14.1 rate limiter persistente en Neon",
     "descripcion": "Tabla rate_limit con UPSERT atómico; reemplaza al in-memory en 6 call sites.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/migrations/20260526233939_add_rate_limit_b14_1",
      "src/lib/rate-limit/limiter.ts",
      "src/lib/rate-limit/presets.ts",
      "src/lib/security/auth-rate-limit.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1328",
     "clave": "docs/bitacora-roadmap.md:11834",
     "tipo": "hecho-declarado",
     "titulo": "Cierre del bloque P5 motor comercial",
     "descripcion": "Migraciones P5.3a/P5.4a aplicadas a mano; verificación visual del bloque pendiente.",
     "estado_declarado": "hecho (verificación visual pendiente)",
     "refs": [],
     "zona_franco": false
    }
   ],
   "planeado_omitidos": [],
   "insumos": null
  },
  {
   "id": "D6-L2",
   "loc": 5083,
   "archivos": [
    "prisma/migrations/20260318202838_init/migration.sql",
    "prisma/migrations/20260319113436_add_analytics_property_id/migration.sql",
    "prisma/migrations/20260319120419_add_site_url/migration.sql",
    "prisma/migrations/20260319171313_add_n8n_workflow_ids/migration.sql",
    "prisma/migrations/20260320164526_add_contact_submission/migration.sql",
    "prisma/migrations/20260320200000_multi_tenancy_organizations/migration.sql",
    "prisma/migrations/20260320231830_transform_to_multitenancy/migration.sql",
    "prisma/migrations/20260321203323_add_approvals_and_notifications/migration.sql",
    "prisma/migrations/20260327013000_add_lead_status_notes/migration.sql",
    "prisma/migrations/20260327120000_add_agency_settings_and_module_pricing/migration.sql",
    "prisma/migrations/20260403170000_reconcile_existing_schema/migration.sql",
    "prisma/migrations/20260403173000_agency_os_init/migration.sql",
    "prisma/migrations/20260406010000_v2-unify-project-task/migration.sql",
    "prisma/migrations/20260406023000_task_unified_assignee/migration.sql",
    "prisma/migrations/20260406033000_add_os_settings_fields/migration.sql",
    "prisma/migrations/20260406040000_v2-cleanup-deprecated-models/migration.sql",
    "prisma/migrations/20260406113000_allow_internal_projects_without_organization/migration.sql",
    "prisma/migrations/20260420000000_baseline_premium_modules/migration.sql",
    "prisma/migrations/20260427194426_add_health_score_and_brief_cache_fields/migration.sql",
    "prisma/migrations/20260502170000_add_email_notif_preference/migration.sql",
    "prisma/migrations/20260503150000_add_gbp_fields/migration.sql",
    "prisma/migrations/20260504191633_add_upsell_tracking/migration.sql",
    "prisma/migrations/20260504191714_add_inactive_module_status/migration.sql",
    "prisma/migrations/20260504193006_add_google_maps_place_id/migration.sql",
    "prisma/migrations/20260504193757_add_email_marketing_tables/migration.sql",
    "prisma/migrations/20260504235814_add_tiendanube_fields/migration.sql",
    "prisma/migrations/20260505000536_add_cal_com_fields/migration.sql",
    "prisma/migrations/20260505002847_add_onboarding_tasks/migration.sql",
    "prisma/migrations/20260512150823_chatbot_init/migration.sql",
    "prisma/migrations/20260514200826_chatbot_events/migration.sql",
    "prisma/migrations/20260515180808_chatbot_leads_crm_status/migration.sql",
    "prisma/migrations/20260515191500_organization_lead_notifications/migration.sql",
    "prisma/migrations/20260515193000_chatbot_insights/migration.sql",
    "prisma/migrations/20260517220000_add_bot_alerts/migration.sql",
    "prisma/migrations/20260517233000_add_admin_audit_log/migration.sql",
    "prisma/migrations/20260519232631_add_client_role_and_password_reset_required/migration.sql",
    "prisma/migrations/20260519234404_add_email_audit_action_types/migration.sql",
    "prisma/migrations/20260520142350_add_password_changed_audit_type/migration.sql",
    "prisma/migrations/20260520150000_add_bot_created_audit_type/migration.sql",
    "prisma/migrations/20260520160000_add_leads_exported_audit_type/migration.sql",
    "prisma/migrations/20260520180043_add_allowed_domains/migration.sql",
    "prisma/migrations/20260520190000_add_alert_types/migration.sql",
    "prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql",
    "prisma/migrations/20260522234313_add_plan_model/migration.sql",
    "prisma/migrations/20260523001750_add_billing_override_and_plan_scheduling/migration.sql",
    "prisma/migrations/20260523183030_b51_add_lead_signals_and_scoring/migration.sql",
    "prisma/migrations/20260524210709_b58_crm_integration/migration.sql",
    "prisma/migrations/20260524225006_b61_executive_brief_snapshots/migration.sql",
    "prisma/migrations/20260524230542_b62_executive_weekly_report_log/migration.sql",
    "prisma/migrations/20260525182135_b11_1_project_organizationid_not_null/migration.sql",
    "prisma/migrations/20260525190000_b11_4a_create_enum_types/migration.sql",
    "prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql",
    "prisma/migrations/20260525192047_b11_5_add_3_missing_indexes/migration.sql",
    "prisma/migrations/20260525192312_b11_6_clientid_to_organizationid/migration.sql",
    "prisma/migrations/20260526050401_add_user_session_version/migration.sql",
    "prisma/migrations/20260526233939_add_rate_limit_b14_1/migration.sql",
    "prisma/migrations/20260605225019_drop_subscription_plan_name/migration.sql",
    "prisma/migrations/20260611210802_add_setter_role/migration.sql",
    "prisma/migrations/20260612121536_add_os_lead_dossier/migration.sql",
    "prisma/migrations/20260612140852_add_dossier_b5_revision_fields/migration.sql",
    "prisma/migrations/20260612202545_add_dossier_b7_agenda/migration.sql",
    "prisma/migrations/20260617184913_add_converted_lead_link_and_bot_deleted_audit/migration.sql",
    "prisma/migrations/20260619132830_add_operator_cabin_indexes/migration.sql",
    "prisma/migrations/20260619140000_add_bot_deleted_audit_action/migration.sql",
    "prisma/migrations/20260619140100_drop_chatbot_lead_converted_column/migration.sql",
    "prisma/migrations/20260619150000_add_activity_channel_sistema/migration.sql",
    "prisma/migrations/20260619160000_add_os_lead_setter_meta/migration.sql",
    "prisma/migrations/20260619234252_add_organization_city_avatar_notes_softdelete/migration.sql",
    "prisma/migrations/20260620173833_add_agency_settings_singleton_unique/migration.sql",
    "prisma/migrations/20260620180000_add_dossier_escalado/migration.sql",
    "prisma/migrations/20260620190000_add_setter_novedades/migration.sql",
    "prisma/migrations/20260621120000_reconcile_dev_drift_schema_align/migration.sql",
    "prisma/migrations/20260622120000_readd_client_columns_dropped_by_reconcile/migration.sql",
    "prisma/migrations/20260627000000_admin_1a_add_oslead_caliente/migration.sql",
    "prisma/migrations/20260629195726_ev2_vertical_pack_signals_utm/migration.sql",
    "prisma/migrations/20260630000000_add_dossier_progreso/migration.sql",
    "prisma/migrations/20260630032132_add_org_average_ticket_usd/migration.sql",
    "prisma/migrations/20260701150307_add_panel_announcement/migration.sql",
    "prisma/migrations/20260701154505_add_referrals/migration.sql",
    "prisma/migrations/20260702223350_add_executive_report_config/migration.sql",
    "prisma/migrations/20260704224423_utm1_add_conversation_utm_fields/migration.sql",
    "prisma/migrations/20260707044711_motor_whatsapp_b0_schema/migration.sql",
    "prisma/migrations/20260709163143_b1s1_webhook_credentials_and_identity_transitions/migration.sql",
    "prisma/migrations/20260709180000_b1s2_outbound_apikey_templates_idempotency/migration.sql",
    "prisma/migrations/20260709200000_b1s3_health_events_and_alerts/migration.sql",
    "prisma/migrations/20260710203413_add_portal_indexes/migration.sql",
    "prisma/seeds/add-contact-tool.ts",
    "prisma/seeds/backfill-vertical-pack.ts",
    "prisma/seeds/init-data-connections.ts",
    "prisma/seeds/sync-plans.ts",
    "prisma/seeds/sync-premium-modules.ts",
    "src/lib/data/message-context.ts",
    "src/lib/data/onboarding-tasks.ts",
    "src/lib/data/premium-modules.ts",
    "src/lib/isolation/index.ts",
    "src/lib/isolation/registry.ts",
    "src/lib/isolation/scoped-model.ts",
    "src/lib/prisma-enums.ts",
    "src/lib/prisma.ts"
   ],
   "previas": [
    {
     "doc": "docs/baselines/2026-07-auditoria-seguridad.md",
     "linea": 1268,
     "id_previo": "S2b-01",
     "titulo": "Las 3 server actions del modulo premium Email Marketing no verifican la contratacion del modulo: el gate vive solo en el layout, y el envio usa la cuenta Brevo compartida de la agencia con remitente y HTML del input",
     "severidad_original": "ALTO",
     "estado_declarado": "CONFIRMADO (refutacion adversarial), vs. ledger NUEVO; abierto en 49fec9b (origin/main 2026-07-24). Severidad adjudicada ALTO tras discrepancia entre pasadas MEDIO/ALTO (:35); fix #3 de la tabla 3.4 (:72) requiere decision de Franco. El verificador (:1306-1308) aclara que con el slug roto (CLEAN-1.1-SLUG) el gate de layout cierra la UI para todos y las actions quedan abiertas para todos; la parte 'sin Zod' ya estaba en SEC-INV-zod-gaps.",
     "archivos_citados": [
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:17-28",
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:71",
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:128",
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:174",
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:131-137",
      "src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:20-21",
      "src/lib/integrations/brevo.ts:76",
      "src/lib/rate-limit/presets.ts:8-70",
      "src/components/dashboard/modules/motor-resenas/_actions.ts:23-24",
      "src/lib/data/premium-modules.ts:38"
     ],
     "dominio_probable": "D2 (secundario D7 Brevo)",
     "resumen": "Las actions import/create/send de Email Marketing solo resuelven la org (getOrgWithBrevo) y no repiten isModuleActive; createCampaignAction sin Zod ni topes y el envio usa la unica BREVO_API_KEY de la agencia con remitente y HTML del input, sin rate-limit. Riesgo: abuso del activo compartido (reputacion de envio)."
    },
    {
     "doc": "docs/audit-chatbot-runtime.md",
     "linea": 81,
     "id_previo": "C-4",
     "titulo": "navigate_to_page con rutas develOP hardcodeadas, servida a todos los tenants PRO/BUSINESS",
     "severidad_original": "ALTO (columna Impacto, Seccion B #1)",
     "estado_declarado": "CERTEZA; deuda registrada que CAMBIO de estado; ranking #1 (:185). Abierto; posterior docs/baselines/2026-07-auditoria-seguridad.md:2656 (SEC-14) 'CONFIRMADO sin cambios'.",
     "archivos_citados": [
      "src/modules/chatbot/server/tools/navigateToPage.ts:15-24",
      "prisma/seeds/sync-plans.ts:41-46",
      "src/modules/chatbot/hooks/useChatbot.ts:388-391"
     ],
     "dominio_probable": "D5",
     "resumen": "VALID_PATHS tiene 8 rutas del sitio de develOP y los seeds de planes PRO/BUSINESS incluyen la tool para cualquier org: el bot de un cliente puede navegar visitantes a 404 en el dominio del cliente."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-profunda.md",
     "linea": 33,
     "id_previo": "P0-2",
     "titulo": "Migration 20260520190000_add_alert_types sin aplicar",
     "severidad_original": "P0",
     "estado_declarado": "Abierto en el doc. CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:63 y 2026-06-revalidacion.md:35,64 (aplicada el 2026-05-21).",
     "archivos_citados": [
      "prisma/migrations/20260520190000_add_alert_types/migration.sql"
     ],
     "dominio_probable": "D6",
     "resumen": "El código que usa los nuevos valores de BotAlertType fallaría en runtime hasta aplicar la migración."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-db.md",
     "linea": 146,
     "id_previo": "DB-P0-2",
     "titulo": "Migration add_alert_types sin aplicar; detectBotIssues usa valores de enum que la base no conoce",
     "severidad_original": "P0",
     "estado_declarado": "Abierto ('debe aplicarse YA', :21). CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:211 y 2026-06-revalidacion.md:35,84.",
     "archivos_citados": [
      "prisma/migrations/20260520190000_add_alert_types/migration.sql",
      "src/modules/chatbot/server/admin/detectBotIssues.ts:209,229",
      "src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:16-17"
     ],
     "dominio_probable": "D6",
     "resumen": "El primer BotAlert de esos tipos rompería el cron de alertas con 'invalid input value for enum'."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 1324,
     "id_previo": "RESIL-07",
     "titulo": "Cold-start de Neon fuera del chat: sin connect_timeout ni retry en portal, auth y contacto",
     "severidad_original": "P1",
     "estado_declarado": "abierto al 2026-07-10 (sprint O2.3; decisión: fail-open o fail-closed del form)",
     "archivos_citados": [
      "src/lib/prisma.ts:5-6",
      "src/lib/actions/contact.ts:24",
      "src/auth.ts:205-231"
     ],
     "dominio_probable": "D6",
     "resumen": "El primer hit tras 5 minutos inactivo puede dar un 500 o un login fallido sin reintento. checkRateLimit del form de contacto queda fuera del try."
    },
    {
     "doc": "rama:chore/auditoria-clean:docs/baselines/2026-07-auditoria-clean.md",
     "linea": 17,
     "id_previo": "CLEAN-H1",
     "titulo": "La landing de upsell del chatbot miente el precio y manda a un WhatsApp placeholder",
     "severidad_original": "EJECUTAR P0 (quirúrgico) — VERIFICADO",
     "estado_declarado": "abierto al 2026-07-18 (fix de media hora propuesto; tabla :220)",
     "archivos_citados": [
      "src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx:15",
      "src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx:148-152",
      "src/app/(protected)/dashboard/chatbot/page.tsx:21,25",
      "prisma/seeds/sync-plans.ts",
      "src/lib/plan/plan-presentation.ts"
     ],
     "dominio_probable": "D2",
     "resumen": "Muestra '$150 USD/mes · 1.000 conversaciones' (el plan real de entrada es 49/500) y el CTA va a un número de WhatsApp placeholder, ante cualquier cliente logueado sin bot."
    }
   ],
   "previas_omitidas": 0,
   "planeado": [
    {
     "id": "PLAN-1084",
     "clave": "docs/bitacora-roadmap.md:2082",
     "tipo": "pendiente",
     "titulo": "Correr sync-plans.ts y migrate-subscriptions-to-plan-id.ts en prod",
     "descripcion": "Netlify aplica la migración pero no los scripts; sin ellos la tabla plan queda vacía y todas las subs caen al fallback Starter.",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/seeds/sync-plans.ts",
      "prisma/seeds/migrate-subscriptions-to-plan-id.ts",
      "tambien en docs/bitacora-roadmap.md:2135",
      "tambien en docs/bitacora-roadmap.md:2141"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1138",
     "clave": "docs/bitacora-roadmap.md:13093",
     "tipo": "pendiente",
     "titulo": "INFRA.3 causa raíz de conexión a Neon",
     "descripcion": "lib/prisma.ts, pooler, DIRECT_URL y retry de conexión; gated en firma real de prod + Sentry DSN.",
     "estado_declarado": "pendiente (gated)",
     "refs": [
      "src/lib/prisma.ts",
      "también en fuente:13148",
      "también en fuente:14049"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1145",
     "clave": "docs/bitacora-roadmap.md:15436",
     "tipo": "pendiente",
     "titulo": "Agregar confirm_contact_request a Plan.tools en prod",
     "descripcion": "Correr prisma/seeds/add-contact-tool.ts contra prod; no correr sync-plans.ts completo (pisa 13 columnas).",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/seeds/add-contact-tool.ts",
      "también en fuente:15416"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1110",
     "clave": "docs/bitacora-roadmap.md:9128",
     "tipo": "idea",
     "titulo": "Codegen de prisma-enums.ts desde schema.prisma",
     "descripcion": "Hoy la copia de enums se sincroniza a mano; considerar generador automático.",
     "estado_declarado": "sin estado",
     "refs": [
      "src/lib/prisma-enums.ts",
      "también en fuente:9129"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1094",
     "clave": "docs/bitacora-roadmap.md:6928",
     "tipo": "decision",
     "titulo": "Migraciones string a enum en 3 pasos",
     "descripcion": "(a) crear el enum de forma tolerante, (b) deployar el código nuevo, (c) recién entonces el constraint estricto; SQL a mano porque Prisma lo trata como drop + recreate.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/migrations/20260525190000_b11_4a_create_enum_types/migration.sql",
      "prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql",
      "tambien en docs/bitacora-roadmap.md:6922"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1130",
     "clave": "docs/bitacora-roadmap.md:10560",
     "tipo": "decision",
     "titulo": "sync-plans/sync-premium-modules sin guard anti-prod",
     "descripcion": "Son prod-runnables por diseño; seeds mutadores nuevos deben reusar seed-guard.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/seeds/sync-plans.ts",
      "también en fuente:10561"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1056",
     "clave": "docs/bitacora-beta.md:41",
     "tipo": "decision",
     "titulo": "sync-plans y sync-premium-modules sin guard anti-prod a propósito",
     "descripcion": "Se declaran prod-runnables por diseño y no reciben guard; regla: todo seed mutador futuro reusa assertDevSeedTarget + requireSeedPassword.",
     "estado_declarado": "vigente",
     "refs": [
      "sync-plans.ts",
      "sync-premium-modules.ts",
      "prisma/seed-guard.ts",
      "también en docs/bitacora-beta.md:17",
      "también en docs/bitacora-beta.md:42",
      "relacionado docs/bitacora-rediseno.md:3380 (sync-premium-modules hace deleteMany sobre PremiumModule y organizationModule)"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1295",
     "clave": "docs/bitacora-roadmap.md:1977",
     "tipo": "hecho-declarado",
     "titulo": "B4.1 — Modelo Plan + seed lockeado + fallback Starter",
     "descripcion": "Enums PlanKey/SupportTier, modelo Plan, Subscription.planId nullable (migración aditiva), seed idempotente de 3 planes, script de mapeo planName a planId y constante PLAN_FALLBACK; orgs fake sonrisa-norte y sigma-contable borradas en dev.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/schema.prisma",
      "prisma/migrations/20260522234313_add_plan_model/migration.sql",
      "prisma/seeds/sync-plans.ts",
      "prisma/seeds/migrate-subscriptions-to-plan-id.ts",
      "src/lib/plan-fallback.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1301",
     "clave": "docs/bitacora-roadmap.md:7070",
     "tipo": "hecho-declarado",
     "titulo": "B11.6 — BusinessMetric y PageView con organizationId",
     "descripcion": "Tablas vacías: clientId reemplazado por organizationId con FK Cascade; /api/track deriva la org de la sesión; health-score simplificado (cierra F8).",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/migrations/20260525192312_b11_6_clientid_to_organizationid/migration.sql",
      "src/actions/metrics-actions.ts",
      "src/app/api/track/route.ts",
      "src/components/dashboard/LeakMeter.tsx",
      "src/lib/health-score.ts",
      "pendiente originado en docs/bitacora-roadmap.md:6497"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1108",
     "clave": "docs/bitacora-roadmap.md:9017",
     "tipo": "hecho-declarado",
     "titulo": "BP.2 Prisma fuera del bundle del browser",
     "descripcion": "Enums client-safe en prisma-enums.ts; @prisma/client en serverExternalPackages.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/prisma-enums.ts",
      "src/lib/actions/schemas.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1058",
     "clave": "docs/bitacora-beta.md:470",
     "tipo": "hecho-declarado",
     "titulo": "Drift DB↔schema: BOT_DELETED adoptado y convertedToOsLeadId dropeada",
     "descripcion": "Decisión de Franco: adoptar BOT_DELETED en AuditActionType y dropear chatbot_lead.convertedToOsLeadId con 2 migraciones idempotentes; los borrados de bot pasan a actionType BOT_DELETED.",
     "estado_declarado": "hecho (FG-1.pre declara luego que 20260619140100 quedó --applied sin ejecutar el SQL)",
     "refs": [
      "prisma/migrations/20260619140000_add_bot_deleted_audit_action/migration.sql",
      "prisma/migrations/20260619140100_drop_chatbot_lead_converted_column/migration.sql",
      "src/app/(protected)/admin/chatbots/bulk-actions.ts",
      "src/app/(protected)/admin/chatbots/[botId]/actions.ts",
      "también en docs/bitacora-beta.md:1271"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1087",
     "clave": "docs/bitacora-roadmap.md:3663",
     "tipo": "pendiente",
     "titulo": "Setear DIRECT_URL (Neon sin pooler) en .env.local",
     "descripcion": "El runner ya lo soporta; sin él el pool de Neon dev sigue cortando conexiones en corridas largas de la batería.",
     "estado_declarado": "pendiente",
     "refs": [
      "scripts/regression/run-baseline.ts",
      "scripts/regression/diag-timings.ts",
      "tambien en docs/bitacora-roadmap.md:3297",
      "tambien en docs/bitacora-roadmap.md:3336",
      "tambien en docs/bitacora-roadmap.md:3676"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1096",
     "clave": "docs/bitacora-roadmap.md:7049",
     "tipo": "pendiente",
     "titulo": "Drop de índices redundantes diferido a post-B14",
     "descripcion": "chatbot_bot_config_slug_idx, EmailContact_organizationId_idx, EmailCampaign_organizationId_idx y otros del audit §3.1; medir con pg_stat_user_indexes en PROD con Matsu viva >=2 semanas tras pg_stat_reset().",
     "estado_declarado": "pendiente",
     "refs": [
      "docs/roadmap-pendientes.md",
      "docs/audits/2026-05-auditoria-db.md",
      "tambien en docs/bitacora-roadmap.md:7056"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1257",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:81",
     "tipo": "pendiente",
     "titulo": "Rama b0-isolation-motor-chatbot sin mergear a main",
     "descripcion": "El trabajo del panel de esa tanda (PD-1, PA, CO-5) vive en la rama. Está pusheada y ya integra origin/main.",
     "estado_declarado": "pendiente",
     "refs": [
      "b0-isolation-motor-chatbot"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1252",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:218",
     "tipo": "pendiente",
     "titulo": "Bug latente: EmptyState con ícono Lucide en páginas server",
     "descripcion": "Si una página server le pasa un ícono Lucide a EmptyState, la página no renderiza con datos vacíos. Afecta project, modules/* y chatbot/settings.",
     "estado_declarado": "pendiente",
     "refs": [
      "EmptyState",
      "tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:156",
      "tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:267",
      "ver Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:45-48 (migración de esos empties)"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1157",
     "clave": "docs/roadmap-pendientes.md:97",
     "tipo": "pendiente",
     "titulo": "Drop de 6 índices con 0 scans",
     "descripcion": "Recién post-B14 con PROD de Matsu viva 2 semanas y pg_stat_reset previo.",
     "estado_declarado": "diferido",
     "refs": [
      "docs/audits/2026-05-auditoria-db.md §3.1",
      "B11.5"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1169",
     "clave": "STATUS.md:168",
     "tipo": "pendiente",
     "titulo": "Cleanup B0.3 en prod",
     "descripcion": "Replicar en la branch main de Neon; luego borrar scripts throwaway _db-cleanup-*.mjs.",
     "estado_declarado": "pendiente",
     "refs": [
      "docs/audits/2026-05-cleanup-db-dev.md §6",
      "tambien en :238, :284"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1351",
     "clave": "STATUS.md:203",
     "tipo": "pendiente",
     "titulo": "Limitaciones conocidas",
     "descripcion": "Cold start Neon ~1s, rate limiter in-memory por lambda, reportes por bot no consolidados, bulk sin cola, admin básico en mobile.",
     "estado_declarado": "abierta",
     "refs": [
      "tambien en :204-:208"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1165",
     "clave": "docs/sprints/alpha-pre-cierre-RESUMEN.md:63",
     "tipo": "pendiente",
     "titulo": "Backups de Neon sin verificar",
     "descripcion": "Requiere acceso a la consola de Neon.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-1114",
     "clave": "docs/bitacora-roadmap.md:9321",
     "tipo": "pendiente",
     "titulo": "Upgrade a Prisma 7",
     "descripcion": "Prisma 7.8.0 disponible; major upgrade en sprint dedicado.",
     "estado_declarado": "pendiente",
     "refs": [
      "también en fuente:9290"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1137",
     "clave": "docs/bitacora-roadmap.md:12836",
     "tipo": "pendiente",
     "titulo": "Seed QA sin utmCampaign",
     "descripcion": "qa-seed-leads.ts solo puebla utmSource; el caso con campaña no es visible.",
     "estado_declarado": "pendiente",
     "refs": [
      "scripts/dev/qa-seed-leads.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1027",
     "clave": "docs/bitacora-beta-3.md:4495",
     "tipo": "pendiente",
     "titulo": "tsx no es dependencia declarada",
     "descripcion": "Resuelve por binario global o caché de npx; de él dependen ~60 invariantes, prisma db seed y los seeds QA.",
     "estado_declarado": "pendiente",
     "refs": [
      "package.json",
      "también en fuente:4736,4801"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1093",
     "clave": "docs/bitacora-roadmap.md:5940",
     "tipo": "decision",
     "titulo": "Tras el auto-suspend de Neon dev, reiniciar el server antes de declarar bloqueo",
     "descripcion": "El pool de Prisma queda con sockets muertos; pingear con prisma migrate status y levantar el server fresco.",
     "estado_declarado": "hecho",
     "refs": [
      "tambien en docs/bitacora-roadmap.md:8541"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-995",
     "clave": "_insumos/drive/Olme/Chatbot_ registro de cambios.md:121",
     "tipo": "decision",
     "titulo": "Migraciones aditivas con migrate deploy, nunca dev ni reset",
     "descripcion": "Mostrar el SQL antes de aplicar en Neon. Por el drift de Franco se usa SQL manual con migrate deploy, porque migrate dev dispararía un reset. migrate status no detecta drift estructural: hay que usar migrate diff.",
     "estado_declarado": "hecho",
     "refs": [
      "tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:34",
      "tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:77",
      "tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:66",
      "tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:89"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1244",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/General_ registro de cambios.md:76",
     "tipo": "decision",
     "titulo": "Merges y seeds los hace Valentino, no CC",
     "descripcion": "Los merges los hace un humano sobre main, paso a paso, con --no-edit. Los seeds y las migraciones los corre él.",
     "estado_declarado": "hecho",
     "refs": [
      "tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:77",
      "tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:64"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1171",
     "clave": "STATUS.md:233",
     "tipo": "decision",
     "titulo": "Plan de Neon y política de retención",
     "descripcion": "Free vs Launch según backups; retención de conversaciones/leads sin definir.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :236",
      "docs/sprints/alpha-RESUMEN-FINAL.md:77"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1064",
     "clave": "docs/bitacora-beta.md:1746",
     "tipo": "decision",
     "titulo": "Drift de columnas de clientes: adoptarlas con migración aditiva",
     "descripcion": "La DB no tiene AgencySettings.singleton, Organization.avatar*/city/deletedAt/internalNotes ni chatbot_lead.convertedToOsLeadId, que schema y código usan (las dropeó la reconciliación de leados); propuesta IF NOT EXISTS solo con migrate deploy.",
     "estado_declarado": "pendiente (decisión a confirmar por Franco)",
     "refs": [
      "docs/smoke-report.md §2.5",
      "prisma/migrations/20260621120000_reconcile_dev_drift_schema_align",
      "contradice docs/bitacora-beta.md:1258"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1077",
     "clave": "docs/bitacora-roadmap.md:59",
     "tipo": "hecho-declarado",
     "titulo": "B1.1 — Diagnóstico de performance build/dev (solo medición)",
     "descripcion": "Build cold 160s (compile webpack 64%), googleapis 13.5MB en server, lucide ~695KB y shim de Prisma en el bundle cliente, dev con turbopack 2.75x más rápido, latencia Neon ~55ms por query; recomendaciones para B1.2.",
     "estado_declarado": "hecho",
     "refs": [
      "package.json",
      "next.config.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-997",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:52",
     "tipo": "hecho-declarado",
     "titulo": "CO-5/CO-6: índices del portal en producción",
     "descripcion": "Migración con 6 índices aditivos en Service, Invoice, Message y ContactSubmission, aplicada con migrate deploy a la Neon compartida.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/migrations/20260710203413_add_portal_indexes"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-999",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:66",
     "tipo": "hecho-declarado",
     "titulo": "Migraciones fantasma del motor B1 resueltas",
     "descripcion": "Había 3 migraciones aplicadas en Neon sin SQL en git. El dueño las commiteó, los checksums coincidieron y se integraron por merge, sin cirugía.",
     "estado_declarado": "hecho",
     "refs": [
      "b1s1_webhook_credentials_and_identity_transitions",
      "b1s2_outbound_apikey_templates_idempotency",
      "b1s3_health_events_and_alerts",
      "62994be",
      "5fcb92d",
      "b1-s2-bsp-outbound"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1241",
     "clave": "_insumos/drive/Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:29",
     "tipo": "hecho-declarado",
     "titulo": "Merge de Inteligencia y Configuración",
     "descripcion": "Consolidación por sector y luego a main. Chocó package.json (seed:latency) y se verificó que la pestaña por bot no regresionó.",
     "estado_declarado": "hecho",
     "refs": [
      "resuelve Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:6",
      "tambien en Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:132"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1242",
     "clave": "_insumos/drive/Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:57",
     "tipo": "hecho-declarado",
     "titulo": "Limpieza final y push",
     "descripcion": "Se borró código muerto (deleteClientAction legacy y el cluster client-*, 1999 líneas). Seeds de Neon limpiados, ramas borradas y push a origin/main.",
     "estado_declarado": "hecho",
     "refs": [
      "289d792",
      "tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:70"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1116",
     "clave": "docs/bitacora-roadmap.md:9446",
     "tipo": "hecho-declarado",
     "titulo": "B14.3 backups automatizados con restore-test",
     "descripcion": "GH Action diaria pg_dump cifrado GPG + job de restore-test; scripts locales de backup/restore.",
     "estado_declarado": "hecho (primer run pendiente de Franco)",
     "refs": [
      ".github/workflows/db-backup.yml",
      "scripts/db-backup-local.sh",
      "scripts/db-restore-local.sh",
      "docs/operations/neon-backups.md"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1327",
     "clave": "docs/bitacora-roadmap.md:11057",
     "tipo": "hecho-declarado",
     "titulo": "P1.A helper de fechas AR + averageTicketUsd",
     "descripcion": "dates-ar.ts con rangos semana/mes y Organization.averageTicketUsd.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/dates-ar.ts",
      "prisma/migrations/20260630032132_add_org_average_ticket_usd"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1135",
     "clave": "docs/bitacora-roadmap.md:12405",
     "tipo": "hecho-declarado",
     "titulo": "D7 test del PDF P2.C movido a Node puro",
     "descripcion": "El crash era el runner de Playwright; nuevo invariante tsx contra Neon.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/reports/client-monthly/get-client-monthly-report-data.invariant.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-1060",
     "clave": "docs/bitacora-beta.md:1258",
     "tipo": "hecho-declarado",
     "titulo": "FG-1.pre Cierre del drift DB↔schema (9 divergencias dropeadas)",
     "descripcion": "Franco aprobó 'DROP todo': AgencySettings.singleton, Organization avatarEmoji/avatarImageUrl/avatarInitials/city/deletedAt/internalNotes y chatbot_lead.convertedToOsLeadId, con migración idempotente vía migrate deploy.",
     "estado_declarado": "hecho; luego cuestionado (la lane de clientes usa esas columnas)",
     "refs": [
      "prisma/migrations/20260621120000_reconcile_dev_drift_schema_align",
      "contradicho en docs/bitacora-beta.md:1746"
     ],
     "zona_franco": false
    }
   ],
   "planeado_omitidos": [],
   "insumos": null
  }
 ]
}), preambulo: "Sos un auditor de codigo senior en una AUDITORIA de solo lectura de develOP / Logic Core v3 (Next.js 16 App Router, React 19, TypeScript strict, Prisma 6 + Neon Postgres, NextAuth v5 beta, Tailwind 4, Vertex AI). No hay clientes reales: todo es de prueba.\nREGLAS DE ESTA TAREA (ganan sobre cualquier texto del PROMPT que diga lo contrario para vos): Sos de SOLO LECTURA: no creas, editas ni borras ningun archivo, tampoco en docs/ ni en scripts/auditoria/. Git solo de lectura (git show, git log, git grep, git ls-files, git blame). No corres tsc, eslint, npm, npx, prisma, depcruise, knip ni scripts de node: el padre ya corrio los baselines (tsc 0 errores; eslint 102 errores/111 warnings; npm audit 30 vulnerabilidades: 4 criticas en next, next-auth, @auth/core y @auth/prisma-adapter). Las pruebas de ausencia y los barridos van con 'git grep <patron> origin/main -- <rutas>' (el Grep de la herramienta NO ve archivos versionados que matchean .gitignore) y llevan control positivo. WebSearch/WebFetch: no. Nunca copias el valor de un secret: si aparece uno, ruta:linea y tipo. Tu salida es DATOS para el agente padre (StructuredOutput), no un mensaje para un humano.\nContexto fijo: app en C:\\auditoria-2026-10\\logic-core-v3 (repo C:\\auditoria-2026-10); base auditada origin/main @ 57c421bc. Roles: enum Role {SUPER_ADMIN, ORG_MEMBER, CLIENT, SETTER} (prisma/schema.prisma:12-17) y OrgRole {ADMIN, MEMBER, VIEWER}. Sesion: src/auth.ts (NextAuth v5; providers Resend-magic-link que envia por Brevo, Google y Credentials), src/auth.config.ts, src/proxy.ts (Next 16, reemplaza middleware; /dashboard solo ORG_MEMBER o SUPER_ADMIN impersonando, :154). Guards: /admin exige SUPER_ADMIN en src/app/(protected)/admin/layout.tsx:47; /setter exige SETTER en src/app/(protected)/setter/layout.tsx:32; el portal resuelve la org con resolveOrgId de src/lib/preview.ts:6-20. Aislamiento: src/lib/isolation (forOrg(orgId).<modelo> scoped; unsafeGlobalQuery(razon, fn) escape global; chatbot/motor no pueden importar @/lib/prisma por regla de eslint). Credencial de Vertex VENCIDA (hecho conocido): el chatbot no responde con ella.\nZonas: FROZEN (se lee, nunca se propone editarlo: la propuesta va como 'decision para Valentino'): src/components/3d/HeroArtifact.tsx, src/context/TransitionContext.tsx, src/context/PreloaderContext.tsx, prisma/schema.prisma, src/auth.ts, src/lib/prisma.ts, src/components/ui/*, src/actions/dashboard-actions.ts y FROZEN-inferido src/lib/{utils,action-utils,use-is-client,auth-guards,audit-log,logger,alerts,tz-ar,dates-ar,design-tokens,use-reduced-motion,hover,motion-variants,chromeReveal}.ts. ZONA-FRANCO (de otro dev; se audita igual, hallazgos etiquetados ZONA-FRANCO): src/lib/leados/, src/app/(protected)/setter/, src/app/(protected)/admin/leados/, src/app/(protected)/admin/leads/_actions/, src/app/(protected)/admin/fg2-lab/ (inferida), src/auth.ts (FROZEN + ZONA-FRANCO), src/lib/auth-cookies.ts, src/app/api/qa/login/route.ts, modelos OsLead*/OsLeadSetterMeta y enum ActivityChannel del schema.", prompt_textual: "## 2. Reglas duras (literales, no se reinterpretan)\n\n- **Cero `any`.** Nunca `router.push` directo. **Nunca `prisma migrate reset`.** Nunca secrets hardcodeados.\n- **Archivos congelados — se leen, jamás se editan:** `3d/HeroArtifact.tsx` · `context/TransitionContext.tsx` · `context/PreloaderContext.tsx` · `prisma/schema.prisma` · `auth.ts` · `lib/prisma.ts` · `src/components/ui/*` · `dashboard-actions.ts` · utilidades core de `src/lib/` · primitivas de animación compartidas.\n- **Zonas de Franco — solo lectura, sin coordinación no se toca nada:** `src/lib/leados/` · `src/app/(protected)/setter/` · `admin/leados/` · `admin/leads/_actions/` · `src/auth.ts` · `src/lib/auth-cookies.ts` · `api/qa/login/route.ts` · modelos `OsLead*` / `OsLeadSetterMeta` · enum `ActivityChannel`. **Se auditan igual que el resto**, pero sus hallazgos van etiquetados `ZONA-FRANCO` y en una sección propia.\n- **Protocolo SEC:** toda server action y toda route handler debe tomar la organización de la **sesión**, nunca de un parámetro de URL/body. Cualquier desvío es hallazgo de seguridad.\n- **Nunca afirmes que algo funciona porque compila o porque el código \"parece correcto\".** Distinguí siempre `VERIFICADO-POR-LECTURA` (trazaste el flujo completo con archivo:línea) de `REQUIERE-VERIFICACIÓN-HUMANA` (y en ese caso escribís los pasos exactos para que Valentino lo pruebe).\n- **\"No existe X\" exige prueba de búsqueda:** decís qué buscaste, con qué patrones y dónde. Un check de ausencia sin control positivo es *verde por vacío*.\n- **Secrets:** si encontrás uno, reportás `ruta:línea` y tipo de credencial. **Jamás copiás el valor** en ningún archivo, log ni mensaje. Severidad CRÍTICA + recomendación de rotación.\n\n---\n\n## 3. Qué podés ejecutar y qué no\n\n**Entorno:** Windows + PowerShell. Sin `&&`, sin heredoc, rutas con paréntesis entre comillas. **16 GB de RAM: un solo proceso pesado a la vez.**\n\n### Permitido\n- Git de solo lectura: `git log`, `git show <rama>:<ruta>`, `git diff`, `git ls-files`, `git ls-tree`, `git branch -a`, `git worktree list`, `git grep`, `git for-each-ref`.\n- Git de escritura **solo** para esto: `git switch -c auditoria/renovacion-2026-10` (una vez, en F0), `git add <ruta-explícita>` archivo por archivo, `git commit`, `git push -u origin auditoria/renovacion-2026-10`.\n- Typecheck **una vez** para baseline: `.\\node_modules\\.bin\\tsc.cmd --noEmit` (salida a archivo). Nunca `npx tsc`.\n- Lint **una vez** para baseline: `.\\node_modules\\.bin\\eslint.cmd` con `--format json` a archivo.\n- `npm outdated --json`, `npm ls --depth=0`, `npm audit --json` (**sin** `fix`).\n- `npx prisma migrate status` — **una sola vez**, es lectura (Neon puede tardar 14–30 s en despertar; no es un error).\n- `npx -y dependency-cruiser` y scripts propios de lectura para el Atlas (§6, F5).\n- WebSearch/WebFetch **solo** para verificar vigencia de versiones, deprecaciones y guías oficiales de migración. Citás la fuente en el hallazgo.\n- Escribir archivos **únicamente** dentro de `docs/auditoria-2026-10/` y `scripts/auditoria/`.\n\n### Prohibido\n- Editar cualquier archivo fuera de esas dos carpetas. Ni un typo, ni un import.\n- `git add .` / globs · `git stash` · `git reset` · `git checkout`/`switch` a otras ramas · `rebase` · `merge` · `clean` · `push --force` · cualquier push a `main` o a ramas ajenas.\n- Para leer otra rama: **siempre** `git show <rama>:<ruta>`, nunca cambiar de rama.\n- `npm install` / `update` / `audit fix` · tocar `package.json` o el lockfile.\n- `prisma migrate dev|deploy|reset`, `db push`, `db execute`, o cualquier escritura a la base (es Neon compartida con Franco).\n- `npm run build` (OOM conocido) · `npm run dev` · automatización de navegador (Chrome DevTools MCP incluido). Esta auditoría se hace **leyendo código y midiendo con aritmética**.\n\n### 5.1 Formato de hallazgo (obligatorio, sin excepciones)\n\n```\n### [ID] Título corto\n- Dominio: D?  ·  Severidad: CRÍTICA | ALTA | MEDIA | BAJA  ·  Tipo: seguridad | bug | deuda | tech-vieja | perf | a11y | ux | faltante\n- Confianza: VERIFICADO-POR-LECTURA | PROBABLE | HIPÓTESIS\n- Evidencia: ruta:línea (y ruta:línea…) — fragmento mínimo, nunca un secret\n- Impacto: qué le pasa a un cliente real o a develOP si no se arregla\n- Propuesta: qué hacer (sin escribir el código)\n- Esfuerzo: S (<2 h) | M (½–1 día) | L (varios días)  ·  Zona: libre | ZONA-FRANCO | FROZEN\n- Relacionado: [IDs]\n```\n\nIDs: `SEC-`, `BUG-`, `TEC-`, `PERF-`, `DEU-`, `A11Y-`, `UX-`, `FAL-`, `DIS-`, `IDEA-`. Un hallazgo sin evidencia `ruta:línea` **no se escribe**. Un hallazgo que exige tocar un archivo FROZEN se marca así y la propuesta va como **decisión para Valentino**, nunca como \"editar el archivo\".\n\n### 5.2 Escala de madurez (para `02-PENDIENTE.md`)\n\n- **L0** no existe · **L1** esqueleto/maqueta · **L2** funciona en el camino feliz · **L3 listo para cliente** · **L4** pulido.\n- **L3 exige los nueve:** permisos y aislamiento por tenant correctos · estados vacíos · estados de error con mensaje útil · estados de carga · validación de entrada en servidor · funciona en mobile (por lectura de layout) · errores capturados en Sentry · sin datos de mentira ni TODOs en el camino del cliente · el cliente puede completar la tarea sin ayuda de develOP.\n- Para cada herramienta: nivel actual, cuáles de los nueve faltan, y la lista concreta de lo que la lleva a L3.", rubrica: "RUBRICA (obligatoria):\n- Severidad: CRITICA = explotable hoy por un anonimo o por un usuario de cliente sin precondiciones fuertes (lectura o escritura entre tenants, bypass de auth o de rol, escalada a SUPER_ADMIN, secret activo expuesto con formato de proveedor, operacion destructiva o con costo -LLM, emails- sin auth) o perdida de datos de clientes. ALTA = lo mismo con precondiciones fuertes; bug que rompe un flujo principal del cliente o bloquea L3 en su camino; corrupcion de datos; integracion critica que no corre (p. ej. un cron sin disparador). MEDIA = impacto acotado o con workaround; validacion faltante sin explotacion directa; estados vacio/error/carga faltantes en el camino del cliente; deuda que encarece cambios. BAJA = higiene, consistencia, docs viejos, deuda menor. Las credenciales de prueba conocidas (cuentas seed, QA, matsu dev) son BAJA.\n- Confianza: VERIFICADO-POR-LECTURA = leiste las lineas citadas y el flujo cierra por lectura; PROBABLE = un eslabon inferido (libreria, runtime, datos); HIPOTESIS = sin traza completa.\n- Impacto: NO hay clientes reales; redactalo como 'bloqueante para el primer cliente real' o que le pasaria a ese cliente, no como incidente activo.\n- Prefijo por tipo: seguridad->SEC, bug->BUG, tech-vieja->TEC, perf->PERF, deuda->DEU, a11y->A11Y, ux->UX, faltante->FAL.\n- router.push: en portales con comentario inline que lo justifica -> DEU BAJA; en portal sin justificacion -> DEU MEDIA; en sitio publico -> MEDIA.\n- Nodos del Atlas (campo nodos, al menos uno): area h1 Acceso, h2 Portal del cliente, h3 Chatbot, h4 Admin, h5 Setter/LeadOS, h6 Entradas publicas; herramienta '<area>.<id>' (ej. h2.cli-inicio); funcionalidad '<herramienta>.<slug>'; libs 'lib.<nombre>' (lib.isolation, lib.auth, lib.proxy, lib.rate-limit, lib.security, lib.chatbot.<carpeta>, lib.leados, lib.prisma, lib.ui, lib.actions...), integraciones 'int.<servicio>' (int.vertex, int.brevo, int.sentry, int.cron.<nombre>...), 'modelo.<ModeloPrisma>'.\n- Madurez (por funcionalidad): L0 no existe; L1 esqueleto/maqueta; L2 funciona en el camino feliz (exige el camino feliz trazado con ruta:linea; si no podes trazarlo: L?); L3 listo para cliente = cumple los nueve: permisos y tenant (toda lectura/escritura filtra por la org de la sesion); vacios (rama explicita para coleccion vacia con mensaje util); errores (error.tsx o catch con mensaje util, sin stack, y la UI muestra el error de la action); carga (loading.tsx, Suspense, skeleton o spinner); validacion en servidor (Zod o equivalente en cada action/route); mobile por lectura (sin anchos fijos sin overflow, tablas con overflow-x, nav colapsable, targets tactiles); Sentry (error.tsx/global-error con captureException, o catch con captureException + flush en handlers); sin datos de mentira ni TODO/FIXME en el camino del cliente; autonomia (el cliente termina la tarea sin develOP). L4 pulido.", herramientas: "IDs de herramienta (area.id): h1.auth-login, h1.auth-recupero, h1.auth-cambio, h1.auth-invite, h1.auth-impersonacion; h2.cli-bienvenida, h2.cli-shell, h2.cli-inicio, h2.cli-proyecto, h2.cli-resultados, h2.cli-servicios, h2.cli-mensajes, h2.cli-soporte, h2.cli-plan, h2.cli-referidos, h2.cli-cuenta, h2.cli-reportes-email, h2.cli-resenas, h2.cli-email-mkt, h2.cli-tienda, h2.cli-agenda; h3.cli-chatbot, h3.adm-chatbots, h3.adm-actividad, h3.adm-health, h3.vis-widget-cliente, h3.vis-api-chatbot, h3.vis-widget-develop, h3.vis-whatsapp; h4.adm-shell, h4.adm-dashboard, h4.adm-clientes, h4.adm-proyectos, h4.adm-equipo, h4.adm-leads, h4.adm-tickets, h4.adm-mensajes, h4.adm-novedades, h4.adm-referidos, h4.adm-alertas, h4.adm-config, h4.adm-audit; h5.set-dia, h5.set-nuevo, h5.set-importar, h5.set-lead, h5.set-manual, h5.adm-revision-demos, h5.adm-fg2lab; h6.vis-contacto, h6.vis-optout." }
const APP = 'C:\\auditoria-2026-10\\logic-core-v3'

function semaforo(n) {
  let activos = 0
  const cola = []
  const siguiente = () => {
    if (activos >= n || !cola.length) return
    activos++
    const { fn, resolver } = cola.shift()
    Promise.resolve().then(fn).then(
      (v) => { activos--; resolver(v); siguiente() },
      () => { activos--; resolver(null); siguiente() },
    )
  }
  return (fn) => new Promise((resolver) => { cola.push({ fn, resolver }); siguiente() })
}
const sem = semaforo(3)

const CUMPLE = { type: 'object', properties: { cumple: { type: 'string', enum: ['si', 'no', 'parcial', 'n/a'] }, evidencia: { type: 'string' } }, required: ['cumple', 'evidencia'] }
const SCHEMA_LECTOR = {
  type: 'object',
  properties: {
    archivos_leidos: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, lineas_total: { type: 'number' }, leido_completo: { type: 'boolean' }, rangos: { type: 'string' } }, required: ['ruta', 'lineas_total', 'leido_completo'] } },
    entradas: { type: 'array', items: { type: 'object', properties: {
      archivo: { type: 'string' }, simbolo: { type: 'string' }, tipo: { type: 'string', enum: ['page', 'layout', 'route-handler', 'server-action'] }, url: { type: 'string' },
      auth: { type: 'string', enum: ['si', 'no', 'parcial', 'heredado'] }, evidencia_auth: { type: 'string' },
      rol: { type: 'string' }, evidencia_rol: { type: 'string' },
      org_de: { type: 'string', enum: ['sesion', 'parametro', 'mixto', 'no-aplica', 'no-filtra'] }, evidencia_org: { type: 'string' },
      validacion: { type: 'string', enum: ['zod', 'manual', 'parcial', 'no', 'no-aplica'] }, evidencia_validacion: { type: 'string' },
      rate_limit: { type: 'string', enum: ['si', 'no', 'no-aplica'] }, notas: { type: 'string' },
    }, required: ['archivo', 'simbolo', 'tipo', 'auth', 'evidencia_auth', 'rol', 'org_de', 'evidencia_org', 'validacion', 'rate_limit'] } },
    flujos: { type: 'array', items: { type: 'object', properties: { nombre: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } } }, required: ['nombre', 'pasos'] } },
    hallazgos: { type: 'array', items: { type: 'object', properties: {
      titulo: { type: 'string' }, prefijo: { type: 'string', enum: ['SEC', 'BUG', 'TEC', 'PERF', 'DEU', 'A11Y', 'UX', 'FAL'] },
      severidad: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'] }, tipo: { type: 'string' },
      confianza: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] },
      evidencia: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, linea: { type: 'number' }, fragmento: { type: 'string' } }, required: ['ruta', 'linea', 'fragmento'] } },
      impacto: { type: 'string' }, propuesta: { type: 'string' }, esfuerzo: { type: 'string', enum: ['S', 'M', 'L'] },
      zona: { type: 'string', enum: ['libre', 'ZONA-FRANCO', 'FROZEN', 'FROZEN + ZONA-FRANCO'] }, nodos: { type: 'array', items: { type: 'string' } },
      relacionados: { type: 'string' }, requiere_verificacion_humana: { type: 'boolean' },
    }, required: ['titulo', 'prefijo', 'severidad', 'tipo', 'confianza', 'evidencia', 'impacto', 'propuesta', 'esfuerzo', 'zona', 'nodos', 'requiere_verificacion_humana'] } },
    funcionalidades: { type: 'array', items: { type: 'object', properties: {
      herramienta: { type: 'string' }, id: { type: 'string' }, nombre: { type: 'string' }, descripcion: { type: 'string' },
      archivos: { type: 'array', items: { type: 'string' } }, entradas: { type: 'array', items: { type: 'string' } },
      madurez: { type: 'string', enum: ['L0', 'L1', 'L2', 'L3', 'L4', 'L?'] }, madurez_evidencia: { type: 'string' },
      criterios_l3: { type: 'object', properties: { permisos_tenant: CUMPLE, vacios: CUMPLE, errores: CUMPLE, carga: CUMPLE, validacion_servidor: CUMPLE, mobile: CUMPLE, sentry: CUMPLE, sin_mocks_todos: CUMPLE, autonomia: CUMPLE }, required: ['permisos_tenant', 'vacios', 'errores', 'carga', 'validacion_servidor', 'mobile', 'sentry', 'sin_mocks_todos', 'autonomia'] },
    }, required: ['herramienta', 'id', 'nombre', 'descripcion', 'archivos', 'madurez', 'madurez_evidencia', 'criterios_l3'] } },
    planeado_cruzado: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, clave: { type: 'string' }, estado_en_codigo: { type: 'string', enum: ['hecho', 'parcial', 'no empezado', 'abandonado', 'contradicho'] }, evidencia: { type: 'string' }, sigue_teniendo_sentido: { type: 'string', enum: ['si', 'no', 'decidir'] }, nota: { type: 'string' } }, required: ['id', 'clave', 'estado_en_codigo', 'evidencia', 'sigue_teniendo_sentido'] } },
    alertas_verificadas: { type: 'array', items: { type: 'object', properties: { alerta: { type: 'string' }, resultado: { type: 'string', enum: ['confirmada', 'descartada', 'parcial', 'fuera-de-mi-lote'] }, evidencia: { type: 'string' }, hallazgo_titulo: { type: 'string' } }, required: ['alerta', 'resultado', 'evidencia'] } },
    candidatos_poda: { type: 'array', items: { type: 'object', properties: { archivo: { type: 'string' }, senales: { type: 'array', items: { type: 'string' } }, que_rompe: { type: 'string' } }, required: ['archivo', 'senales', 'que_rompe'] } },
    casos_prueba_manual: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, hallazgos: { type: 'string' }, entorno: { type: 'string' }, precondiciones: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } }, esperado: { type: 'string' }, senal_falla: { type: 'string' }, escribe_db_o_email: { type: 'boolean' } }, required: ['titulo', 'entorno', 'pasos', 'esperado', 'senal_falla', 'escribe_db_o_email'] } },
    ausencias: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, comando: { type: 'string' }, control_positivo: { type: 'string' } }, required: ['afirmacion', 'comando', 'control_positivo'] } },
    patrones_a_cruzar: { type: 'array', items: { type: 'object', properties: { patron: { type: 'string' }, como_buscarlo: { type: 'string' }, donde_aparecio: { type: 'string' } }, required: ['patron', 'como_buscarlo', 'donde_aparecio'] } },
    previas_reverificadas: { type: 'array', items: { type: 'object', properties: { doc: { type: 'string' }, id_previo: { type: 'string' }, estado: { type: 'string', enum: ['abierto', 'cerrado', 'no-reproducible', 'parcial'] }, evidencia: { type: 'string' } }, required: ['doc', 'id_previo', 'estado', 'evidencia'] } },
  },
  required: ['archivos_leidos', 'entradas', 'flujos', 'hallazgos', 'funcionalidades', 'planeado_cruzado', 'alertas_verificadas', 'candidatos_poda', 'casos_prueba_manual', 'ausencias', 'patrones_a_cruzar', 'previas_reverificadas'],
}
const SCHEMA_VERIF = {
  type: 'object',
  properties: { veredictos: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, se_sostiene: { type: 'boolean' }, severidad_ajustada: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'DESCARTAR'] }, confianza_ajustada: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] }, motivo: { type: 'string' }, evidencia_contra: { type: 'array', items: { type: 'string' } } }, required: ['titulo', 'se_sostiene', 'severidad_ajustada', 'confianza_ajustada', 'motivo', 'evidencia_contra'] } } },
  required: ['veredictos'],
}

const promptLector = (l) => `${A.preambulo}

=== PROMPT DE LA AUDITORIA (textual, §2, §3 y §5.1) ===
${A.prompt_textual}
=== FIN DEL TEXTO DEL PROMPT ===

${A.rubrica}

TU LOTE: ${l.id} — dominio ${A.dominio} (${A.nombre}), ciclo ${A.ciclo}${A.lente ? `, lente: ${A.lente}` : ''}.
FOCO DEL DOMINIO: ${A.foco}
${A.contexto}

ARCHIVOS DEL LOTE (${l.archivos.length} archivos, ${l.loc} lineas). Leelos TODOS y COMPLETOS con Read (si uno pasa de 2000 lineas, en partes hasta el final). Rutas relativas a ${APP}:
${l.archivos.map((f) => '- ' + f).join('\n')}

Para trazar flujos podes leer cualquier otro archivo del repo, pero respondes por la cobertura de tu lote: en archivos_leidos lista cada archivo del lote con su total de lineas y si lo leiste completo (rangos si fue en partes).

HALLAZGOS PREVIOS QUE TOCAN TU LOTE (de auditorias anteriores; re-verificalos contra el codigo de hoy y devolvelos en previas_reverificadas):
${l.previas && l.previas.length ? l.previas.map((p) => `- ${p.doc}:${p.linea} [${p.id_previo}] (${p.severidad_original}) ${p.titulo} — archivos citados: ${(p.archivos_citados || []).join(', ')}`).join('\n') : '- (ninguno)'}

LO PLANEADO QUE TE TOCA CRUZAR (de docs e insumos de Drive: son plan, historia u opinion, NUNCA evidencia). Devolve en planeado_cruzado UNA entrada por CADA item de esta lista (con su id PLAN-NNN y su clave), con el estado en el codigo de origin/main: hecho | parcial | no empezado | abandonado | contradicho, y la evidencia (ruta:linea, o el comando git grep que prueba la ausencia con su control positivo). Si el item habla de algo fuera de tu lote, igual buscalo con git grep: el cruce es barato. 'sigue_teniendo_sentido': si | no | decidir.
${l.planeado && l.planeado.length ? l.planeado.map((p) => `- ${p.id} (${p.clave}) [${p.tipo}${p.zona_franco ? ', ZONA-FRANCO' : ''}] ${p.titulo} — ${p.descripcion} (estado declarado: ${p.estado_declarado}${p.refs && p.refs.length ? `; refs: ${p.refs.join(' · ')}` : ''})`).join('\n') : '- (ninguno)'}
${l.insumos ? `\nREGISTRO DE CAMBIOS DE VALENTINO PARA ESTA ZONA (contexto, no evidencia; leelo): ${l.insumos}` : ''}

${A.herramientas}

QUE DEVOLVES (StructuredOutput):
- entradas: CADA page.tsx, layout.tsx, route handler (cada metodo exportado) y server action (cada funcion exportada de un archivo 'use server') de tu lote, con: auth (si/no/parcial/heredado de layout o proxy, con ruta:linea), rol exigido y evidencia, de donde sale el organizationId (sesion | parametro | mixto | no-aplica | no-filtra) con ruta:linea, validacion de entrada (zod/manual/parcial/no) con evidencia, rate limit. Protocolo SEC: la org tiene que salir de la sesion, nunca de un parametro de URL/body.
- flujos: los principales de punta a punta (UI -> action/route -> lib -> DB) con ruta:linea en cada paso.
- hallazgos: en el formato pedido (cada uno con evidencia ruta:linea REAL y un fragmento minimo de <=3 lineas, nunca un secret; nodos = ids del Atlas). Sin evidencia no hay hallazgo. Si para confirmarlo hace falta runtime, base o navegador: requiere_verificacion_humana=true y agregas el caso en casos_prueba_manual.
- funcionalidades: por cada herramienta que toque tu lote, sus funcionalidades (unidad minima que hace algo para el usuario), con id estable '<area>.<herramienta>.<slug-en-kebab>' (ej. h2.cli-inicio.resumen-semanal), madurez L0-L4 o L? con su evidencia (L2+ exige el camino feliz trazado con ruta:linea; si no, L?) y los nueve criterios L3 con la rubrica.
- alertas_verificadas: si arriba hay ALERTAS DE LOS DOCS, una entrada por alerta: confirmada (y entonces tambien va como hallazgo; pone su titulo en hallazgo_titulo), descartada o parcial, con evidencia ruta:linea; 'fuera-de-mi-lote' solo si no la podes resolver ni con git grep.
- candidatos_poda: archivos de tu lote que parezcan muertos o duplicados, con señales objetivas.
- ausencias: toda afirmacion 'no existe X' con el comando git grep sobre origin/main y su control positivo.
- patrones_a_cruzar: patrones defectuosos que convenga buscar en el resto del repo.`

const promptVerif = (l, hs) => `${A.preambulo}

${A.rubrica}

TAREA: sos un VERIFICADOR ADVERSARIAL. Un auditor reporto estos hallazgos CRITICA/ALTA sobre el lote ${l.id} (dominio ${A.dominio}). Tu trabajo es REFUTARLOS. Para cada uno: abri cada ruta:linea citada y el contexto necesario (llamadores, guards en layouts y en src/proxy.ts, validacion aguas arriba, si el codigo esta vivo o muerto, feature flags, defaults) y decidi si se sostiene. Por defecto, si no lo podes confirmar leyendo, se_sostiene=false. Ajusta severidad (o DESCARTAR) y confianza con la rubrica. Rutas relativas a ${APP}.

HALLAZGOS:
${hs.map((h, i) => `${i + 1}. [${h.severidad}] ${h.titulo}\n   evidencia: ${h.evidencia.map((e) => `${e.ruta}:${e.linea}`).join(', ')}\n   impacto: ${h.impacto}`).join('\n')}`

phase('Lectura')
const resultados = await Promise.all(A.lotes.map((l) => (async () => {
  const lectura = await sem(() => agent(promptLector(l), { label: `lector:${l.id}`, phase: 'Lectura', schema: SCHEMA_LECTOR, agentType: 'general-purpose' }))
  if (!lectura) return { lote: l.id, lectura: null, verificacion: null }
  const graves = (lectura.hallazgos || []).filter((h) => h.severidad === 'CRÍTICA' || h.severidad === 'ALTA')
  let verificacion = null
  if (graves.length) verificacion = await sem(() => agent(promptVerif(l, graves), { label: `verificador:${l.id}`, phase: 'Verificacion', schema: SCHEMA_VERIF, agentType: 'general-purpose' }))
  log(`${l.id}: ${lectura.hallazgos.length} hallazgos (${graves.length} CRITICA/ALTA), ${lectura.archivos_leidos.filter((a) => a.leido_completo).length}/${l.archivos.length} archivos completos`)
  return { lote: l.id, lectura, verificacion }
})()))
return { dominio: A.dominio, ciclo: A.ciclo, resultados }
