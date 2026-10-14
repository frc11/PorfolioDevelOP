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
 "dominio": "D2",
 "nombre": "Portal del cliente",
 "ciclo": "D2-c1",
 "lente": "",
 "foco": "Portal del cliente multi-tenant: aislamiento por tenant en CADA lectura y escritura (la org sale de resolveOrgId/sesion, nunca de params/body/searchParams), IDOR por ids cuid en URLs, onboarding (bienvenida), y los nueve criterios L3 por funcionalidad. Hipotesis de Valentino a medir: el portal esta muy desarrollado y le faltan sobre todo modulos.",
 "contexto": "ALERTAS DE LOS DOCS PARA ESTE DOMINIO (afirmaciones o contradicciones de documentos, NO evidencia: confirmar o descartar cada una contra el codigo y reportarlo en alertas_verificadas, empezando el campo 'alerta' con su id entre corchetes; si se confirma, tambien va como hallazgo):\n- [D2-A1] POSIBLE FUGA ENTRE TENANTS: _insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:97 registra que el conteo de leads de Inicio y computeLeadsScore usan ContactSubmission sin filtrar por organizationId (datos de otros tenants mostrados al cliente). Choca con la Auditoria III que declara 0 rojos de aislamiento (_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:28). Verificar por lectura con prioridad maxima.\n- [D2-A2] IDs internos en URL: docs/bitacora-roadmap.md:3919 (B5.6) crea /dashboard/chatbot/leads/[id] con el id del lead; :5259 (B6.3) dice que los IDs de lead no van en URLs; CLAUDE.md lo prohibe. Barrer las rutas dinamicas del portal y ver si el id se resuelve contra la org de la sesion (IDOR).\n- [D2-A3] Promesas visibles al cliente: 'Proximamente Q3 2026' en los modulos coming-soon (_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:175), vencida al 2026-10-13; 'Respondemos en < 4 hs, Lun-Vie 9-18' (Mensajes_ registro de cambios.md:30). Buscar los literales en el codigo.\n- [D2-A4] Lanes del portal declaradas cerradas pero 'sin mergear a main' (inicio, plan, project, services, resultados, cuenta y Bloques A/B de portal-pulido; tambien la rama b0-isolation-motor-chatbot, registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:81). Para cada 'hecho (sin mergear)' del planeado de tu lote: esta o no en origin/main.\n- [D2-A5] Credenciales de onboarding: el previo PD-1 (docs/audit-repo-20260707.md:113) dice texto plano con etiqueta ENCRIPTADO; el registro de Valentino menciona ONBOARDING_SECRET_KEY (registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:15). Confirmar si el cifrado existe en origin/main.\n- [D2-A6] Navegacion post-exito con window.location.assign() en el flujo de venta (docs/sprints/p3-a-2-venta.md:190-192), patron que CLAUDE.md no lista para portales.\n- [D2-A7] Avatar: base64 en la base sin infra externa (_insumos/drive/Olme/Chatbot_ registro de cambios.md:97,119) contra storage externo abierto (Cliente - Registro de cambios/Chatbot_ registro de cambios.md:89): ver tamano maximo validado en servidor.\nPATRONES DEFECTUOSOS QUE YA APARECIERON EN OTROS DOMINIOS (buscalos en tu lote; cada aparicion es un hallazgo con su propia evidencia, o se suma al hallazgo del mismo patron si es la misma causa raiz):\n- [D1-c1] IP del cliente tomada del primer valor de X-Forwarded-For (falsificable segun la plataforma) para rate limit y auditoria (visto en: src/app/login/actions.ts:53, src/lib/security/auth-rate-limit.ts:39, src/lib/audit-log.ts:21)\n- [D1-c1] Alta de usuarios sin normalizar el email (trim + lowercase) mientras el login normaliza (visto en: createClientOnly.ts:26, createClientWithBot.ts:34, admin/chatbots/new/actions.ts:27 -> onboarding/core.ts:70)\n- [D1-c1] Actions que usan session.user.organizationId (fallan en preview admin) frente a resolveOrgId (escriben como el cliente) (visto en: src/lib/actions/profile.ts:29, src/lib/actions/upsell.ts:16 vs email-marketing/_actions.ts:18)\n- [D1-c1] Mensajes internos de error devueltos al cliente (toErrorMessage o error instanceof Error ? error.message) (visto en: src/lib/actions/profile.ts:72, src/lib/actions/settings.ts:92, src/lib/action-utils.ts:31)\n- [D1-c1] Envios de email cuyo resultado se ignora o que fingen exito sin API key (visto en: src/auth.ts:104, src/lib/actions/settings.ts:194, src/lib/email.ts:15-16)\n- [D1-c1] orgMemberships con take:1 sin orderBy (org primaria no deterministica) (visto en: src/auth.ts:37, src/app/login/actions.ts:94, src/app/api/qa/login/route.ts:126)\n- [D1-c1] Texto funcional en text-zinc-600/700 sobre #080a0c (contraste < 4,5:1) (visto en: src/app/login/page.tsx:263, :367, :404; forgot-password, reset-password, accept-invite)\n- [D1-c1] Bloques de error sin role=alert/aria-live (visto en: login/page.tsx:358, forgot-password/page.tsx:157, ResetPasswordForm.tsx:212, AcceptInviteForm.tsx:217)\n- [D1-c1] Paginas admin sin guard propio (dependen de admin/layout + proxy) (visto en: 22 de 34 paginas /admin (p. ej. admin/leads/page.tsx, admin/tickets/[ticketId]/page.tsx, admin/settings/page.tsx))\n- [D1-c1] Modulos 'use server' sin importadores (actions muertas pero publicas si se reconectan) (visto en: src/lib/actions/invitations.ts, src/lib/actions/settings.ts, src/lib/actions/clients.ts)\n- [D1-c1] Fallos manejados que solo hacen console.error (no llegan a Sentry; no hay captureConsoleIntegration) (visto en: forgot-password/actions.ts:105, audit-log.ts:40, brevo-service.ts:41)\n- [D1-c1] Tokens de un solo uso guardados en claro en la DB (visto en: forgot-password/actions.ts:73, invitations.ts:102, settings.ts:180)\n- [D1-c1] requireSuperAdmin reimplementado en varios modulos (visto en: src/lib/auth-guards.ts:3, src/lib/actions/settings.ts:20, src/modules/chatbot/server/admin/requireSuperAdmin.ts)\n- [D1-c1] Config de NextAuth duplicada entre auth.ts y auth.config.ts que diverge (maxAge, callbacks) (visto en: session.maxAge solo en auth.ts:81; jwt callback solo en auth.ts:205)\n- [D1-c2] Página de servidor que lee la base confiando en el guard del layout, sin auth()/require* propio. El render parcial de RSC no re-ejecuta el layout y el proxy decide con claims viejos del JWT (visto en: 15 páginas de /admin (admin/page.tsx:182, team/page.tsx:19, referrals/page.tsx:9, projects/page.tsx:9, leads/page.tsx:23, leados/page.tsx:34, ...). Control: /se)\n- [D1-c2] IP de cliente tomada del primer valor de X-Forwarded-For (visto en: lib/security/auth-rate-limit.ts:39 (forgot, reset, contacto), lib/audit-log.ts:21, app/login/actions.ts:53 (SEC-007) y modules/chatbot/server/chat/requestSchema)\n- [D1-c2] Resolución de la org de sesión paralela a resolveOrgId: orgMember.findFirst sin orderBy, sin mirar el rol y sin honrar la impersonación (visto en: modules/chatbot/server/admin/getClientSession.ts:5-33. La usan dashboard/chatbot/* y api/dashboard/chatbot/leads/export. Puede discrepar de session.user.organiz)\n- [D1-c2] Header de request que nadie setea, leído como si lo pusiera el servidor (x-pathname) (visto en: (protected)/dashboard/layout.tsx:124: el gate de onboarding se saltea mandando el header. dashboard/modules/email-marketing/layout.tsx:24: la tab activa nunca s)\n- [D1-c2] Interpolación sin escapar en el HTML de emails (la variable 'safeName' no escapa) (visto en: lib/email/templates/password-reset.ts:12 y el h1. Es el nombre propio del destinatario, así que el riesgo es bajo. Revisar welcome-client.ts, bot-activated.ts y)\n- [D1-c2] Servidores de desarrollo y QA escuchando en todas las interfaces (sin -H) con flags de QA encendidos (visto en: package.json:7-13 (dev, dev:qa, start, start:qa, start:setter, start:galeria). QA_ALLOW_LOCALHOST también abre los escapes de validate-origin.ts (D3).)\n- [D1-c2] Server action exportada que escribe estado o auditoría sin chequear rol (visto en: lib/actions/impersonation.ts:50 (stopImpersonationAction) y su wrapper admin/clients/_actions/client.actions.ts:12.)\n- [D1-c3] Org de la impersonación resuelta al momento de la acción desde una cookie global (resolveOrgId en server actions que escriben) (visto en: (protected)/dashboard/_actions/business-profile.actions.ts:25, dashboard/modules/email-marketing/_actions.ts:18, lib/tickets/actions.ts, executive-report-prefs.)\n- [D1-c3] Claves de rate limit armadas con datos del pedido sin validar: cada valor nuevo es una fila nueva en rate_limit, que no se purga (visto en: api/motor/webhook/[channelToken]/route.ts:34 (token de la URL), modules/chatbot/server/chat/handleChatRequest.ts:185 (sessionId del body), forgot-password/actio)\n- [D1-c3] Texto libre sin .max() que termina en el prompt del chatbot o en emails (visto en: lib/actions/schemas.ts:15-16, bienvenida/_actions/complete-onboarding.ts:10, actions/onboarding-actions.ts:20, lib/actions/clients.ts:26)\n- [D1-c3] Mutación en la base y después envío por Brevo dentro de la respuesta (SDK con 60 s x 3 intentos): si la función expira, se pierde lo que solo se devolvía al final (visto en: modules/chatbot/server/admin/createClientOnly.ts:142 (tempPassword solo en la respuesta), api/admin/users/[userId]/resend-credentials/route.ts:85, forgot-passwo)\n- [D1-c3] Auditoría escrita después del efecto con un helper que traga el error sin Sentry (visto en: 43 llamadas en 31 archivos; p. ej. modules/chatbot/server/admin/hardDeleteClient.ts:166, archiveClient.ts:37, reset-password/actions.ts:87)\n- [D1-c3] Guards que lanzan Error('Unauthorized') genérico sin try/catch: sesión vencida o invalidada a mitad de una acción lleva a error.tsx y a un evento en Sentry en vez de a /login (visto en: lib/actions/projects.ts:109, :159, :178; (protected)/setter/page.tsx:29)\n- [D1-c3] Fallback de URL base a http://localhost:3000 en links de emails: link roto si falta la variable en producción (check-env.js no corre en el build) (visto en: forgot-password/actions.ts:87 y 11 sitios más (lib/tickets/actions.ts:156, lib/alerts.ts:50, lib/email/unsubscribe-token.ts:58 y :118, lib/reports/executive-wee)\n- [D1-c3] Tokens de un solo uso en el query string que pueden ir a Sentry: scrub-pii no cubre tokens hex y no hay beforeSendTransaction (tracesSampleRate 0.1 y replays on error en el cliente) (visto en: lib/sentry/scrub-pii.ts:53-67, instrumentation-client.ts:6-11)\n- [D1-c3] Escritura fire-and-forget en cada navegación a una columna sin lectores, que durante la impersonación marca al SUPER_ADMIN (visto en: (protected)/dashboard/layout.tsx:80-87)",
 "lotes": [
  {
   "id": "D2-L1",
   "loc": 5444,
   "archivos": [
    "src/actions/dashboard-actions.ts",
    "src/actions/onboarding-actions.ts",
    "src/app/(protected)/dashboard/_actions/business-profile.actions.ts",
    "src/app/(protected)/dashboard/_actions/executive-report-prefs.actions.ts",
    "src/app/(protected)/dashboard/_actions/executive-report-prefs.schemas.ts",
    "src/app/(protected)/dashboard/_actions/regenerate-brief.ts",
    "src/app/(protected)/dashboard/cuenta/boveda/loading.tsx",
    "src/app/(protected)/dashboard/cuenta/boveda/page.tsx",
    "src/app/(protected)/dashboard/cuenta/error.tsx",
    "src/app/(protected)/dashboard/cuenta/facturacion/loading.tsx",
    "src/app/(protected)/dashboard/cuenta/facturacion/page.tsx",
    "src/app/(protected)/dashboard/cuenta/layout.tsx",
    "src/app/(protected)/dashboard/cuenta/loading.tsx",
    "src/app/(protected)/dashboard/cuenta/page.tsx",
    "src/app/(protected)/dashboard/cuenta/perfil/loading.tsx",
    "src/app/(protected)/dashboard/cuenta/perfil/page.tsx",
    "src/app/(protected)/dashboard/error.tsx",
    "src/app/(protected)/dashboard/layout.tsx",
    "src/app/(protected)/dashboard/loading.tsx",
    "src/app/(protected)/dashboard/messages/_actions/mark-read.ts",
    "src/app/(protected)/dashboard/messages/_components/MarkReadOnMount.tsx",
    "src/app/(protected)/dashboard/messages/loading.tsx",
    "src/app/(protected)/dashboard/messages/page.tsx",
    "src/app/(protected)/dashboard/modules/agenda-inteligente/loading.tsx",
    "src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts",
    "src/app/(protected)/dashboard/modules/email-marketing/campaigns/[id]/loading.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/campaigns/[id]/send/page.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/campaigns/loading.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/campaigns/page.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/contactos/_components/ImportCSVButton.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/contactos/loading.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/contactos/page.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/layout.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/loading.tsx",
    "src/app/(protected)/dashboard/modules/email-marketing/page.tsx",
    "src/app/(protected)/dashboard/modules/error.tsx",
    "src/app/(protected)/dashboard/modules/loading.tsx",
    "src/app/(protected)/dashboard/modules/motor-resenas/_components/AskReviewSection.tsx",
    "src/app/(protected)/dashboard/modules/motor-resenas/_components/ConnectingState.tsx",
    "src/app/(protected)/dashboard/modules/motor-resenas/_components/LockedView.tsx",
    "src/app/(protected)/dashboard/modules/motor-resenas/_components/ReviewItem.tsx",
    "src/app/(protected)/dashboard/modules/motor-resenas/loading.tsx",
    "src/app/(protected)/dashboard/modules/motor-resenas/page.tsx",
    "src/app/(protected)/dashboard/modules/tienda-conectada/_components/ConnectStoreCard.tsx",
    "src/app/(protected)/dashboard/modules/tienda-conectada/loading.tsx",
    "src/app/(protected)/dashboard/modules/tienda-conectada/page.tsx",
    "src/app/(protected)/dashboard/page.tsx",
    "src/app/(protected)/dashboard/plan/loading.tsx",
    "src/app/(protected)/dashboard/plan/page.tsx",
    "src/app/(protected)/dashboard/project/loading.tsx",
    "src/app/(protected)/dashboard/project/page.tsx",
    "src/app/(protected)/dashboard/referidos/page.tsx"
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
     "doc": "docs/audit-repo-20260707.md",
     "linea": 113,
     "id_previo": "PD-1",
     "titulo": "Credenciales de onboarding en texto plano con etiqueta ENCRIPTADO",
     "severidad_original": "ALTA",
     "estado_declarado": "VISTO; cruce (c) NUEVO (:306); Tier 1 #6 (:236). Abierto; el doc posterior docs/baselines/2026-07-auditoria-seguridad.md lo re-reporta sin cerrar como S2b-05 (:1443, BAJO) y S6-01 (:2668, MEDIO), con contradiccion interna sobre si el modulo es alcanzable (:1482 vs :2710).",
     "archivos_citados": [
      "src/actions/onboarding-actions.ts:110-132",
      "src/actions/onboarding-actions.ts:27"
     ],
     "dominio_probable": "D2",
     "resumen": "completeOnboardingAction guarda credenciales de dominio/hosting y redes del cliente en ClientAsset.description en texto plano con un url literal que sugiere un cifrado inexistente; el input OnboardingData no pasa por Zod."
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
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 105,
     "id_previo": "P1-12",
     "titulo": "4 server actions sin Zod",
     "severidad_original": "P1 (2026-05-auditoria-profunda)",
     "estado_declarado": "CERRADO (:150): las 4 tienen Zod (commit 6def504)",
     "archivos_citados": [
      "src/app/(protected)/admin/chatbots/[botId]/actions.ts",
      "src/app/(protected)/dashboard/_actions/regenerate-brief.ts",
      "src/actions/onboarding-actions.ts",
      "src/lib/actions/clients.ts"
     ],
     "dominio_probable": "D9",
     "resumen": "Re-verificar que siguen validando con Zod."
    },
    {
     "doc": "rama:chore/auditoria-clean:docs/baselines/2026-07-auditoria-clean.md",
     "linea": 74,
     "id_previo": "CLEAN-R2",
     "titulo": "Fechas formateadas en el server sin timeZone: con el host en UTC salen corridas",
     "severidad_original": "EJECUTAR P1 acotado — VERIFICADO",
     "estado_declarado": "abierto al 2026-07-18 (tabla :223)",
     "archivos_citados": [
      "src/app/(protected)/dashboard/page.tsx:41",
      "src/modules/chatbot/server/admin/getActivityChartData.ts:25",
      "src/modules/chatbot/server/admin/getLatencyHistory.ts:24",
      "src/lib/alerts.ts:277,287",
      "src/lib/email/templates/weekly-report.ts:12",
      "src/modules/chatbot/server/notifications/sendLeadNotification.ts:74",
      "src/lib/dates-ar.ts"
     ],
     "dominio_probable": "D9",
     "resumen": "Solo 2 de 116 toLocale* pasan timeZone: el header del dashboard muestra el día siguiente entre las 21 y las 24 hs AR, los buckets de admin se corren 3h y los emails salen en UTC."
    }
   ],
   "previas_omitidas": 0,
   "planeado": [
    {
     "id": "PLAN-080",
     "clave": "docs/bitacora-roadmap.md:2952",
     "tipo": "pendiente",
     "titulo": "Banner 'Plan pendiente de asignación' para orgs en fallback",
     "descripcion": "Opcional y de bajo impacto; hoy las orgs sin planId ven las 3 cards como 'Subir a X'.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/app/(protected)/dashboard/plan/page.tsx",
      "tambien en docs/bitacora-roadmap.md:2967"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-033",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:435",
     "tipo": "pendiente",
     "titulo": "Defectos menores de UX en Mi Cuenta",
     "descripcion": "?delete= queda en la URL. VaultRequestModal no cierra con Escape. set-state-in-effect en VaultRevealButton:21. El tooltip 'Generando' se recorta. Eye sin strokeWidth. cuenta/loading.tsx desactualizado.",
     "estado_declarado": "pendiente",
     "refs": [
      "VaultRevealButton.tsx:21",
      "VaultRequestModal.tsx",
      "cuenta/loading.tsx",
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:439",
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:443",
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:455"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-091",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:54",
     "tipo": "pendiente",
     "titulo": "Empties con tinte teal restantes",
     "descripcion": "Quedan el 'Sin proyectos' de page.tsx y otros 2 EmptyState de task-list.tsx. bg-zinc-950/70 sin verificar visualmente.",
     "estado_declarado": "pendiente",
     "refs": [
      "dashboard/project/page.tsx",
      "admin/projects/_components/task-list.tsx",
      "tambien en Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:55",
      "ver Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:49"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-041",
     "clave": "docs/bitacora-roadmap.md:11020#2",
     "tipo": "pendiente",
     "titulo": "sendCampaignAction: updates por id y htmlContent sin sanitizar",
     "descripcion": "Dos update scoped solo por id y HTML de campañas sin sanitizar (XSS saliente).",
     "estado_declarado": "pendiente (reportado para decisión)",
     "refs": [
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-055",
     "clave": "docs/bitacora-roadmap.md:11207",
     "tipo": "pendiente",
     "titulo": "Refactors futuros del home",
     "descripcion": "getGreeting()/formatDateES() a dates-ar (usa hora del server) y currentPath como 'página específica' del origen.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/app/(protected)/dashboard/page.tsx",
      "también en fuente:11190",
      "también en fuente:11222"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-064",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mensajes_ registro de cambios.md:9",
     "tipo": "hecho-declarado",
     "titulo": "Mensajes del cliente",
     "descripcion": "Burbujas izquierda/derecha según autor, altura fija con scroll interno y word-break. Badge de no leídos que desaparece al abrir (markClientMessagesRead). Badge de presencia honesto.",
     "estado_declarado": "hecho",
     "refs": [
      "_actions/mark-read.ts",
      "MarkReadOnMount",
      "tambien en Olme/Cliente - Registro de cambios/Mensajes_ registro de cambios.md:32"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-119",
     "clave": "docs/sprints/p3-a-2-venta.md:7",
     "tipo": "hecho-declarado",
     "titulo": "Venta y estados del Motor de Reseñas",
     "descripcion": "LockedView (con variante pausada y 'ya lo pediste'), ConnectingState, resolveMotorResenasView y key gbp en message-context.",
     "estado_declarado": "hecho, verificación visual pendiente",
     "refs": [
      "src/lib/modules/motor-resenas-view.ts",
      "LockedView.tsx",
      "ConnectingState.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-110",
     "clave": "docs/bitacora-roadmap.md:11008",
     "tipo": "hecho-declarado",
     "titulo": "SEC vía 2: motor-reseñas deriva la org de la sesión",
     "descripcion": "generateDraft/replyAction validan organizationId contra la sesión (resolveScopedOrgId).",
     "estado_declarado": "hecho",
     "refs": [
      "src/components/dashboard/modules/motor-resenas/_actions.ts",
      "src/lib/security/org-scope.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-077",
     "clave": "docs/bitacora-roadmap.md:2214",
     "tipo": "pendiente",
     "titulo": "Dimensiones reports/insight/crm solo con helper en B4.2",
     "descripcion": "planAllows quedó listo pero las features no se construyeron en B4.2; luego B5.8 usa crmEnabled y B6.2 gatea el reporte por plan; en este rango no hay consumidor declarado de insightEnabled.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/lib/plan/plan-allows.ts",
      "tambien en docs/bitacora-roadmap.md:2215",
      "tambien en docs/bitacora-roadmap.md:2216",
      "tambien en docs/bitacora-roadmap.md:4450",
      "tambien en docs/bitacora-roadmap.md:4989"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-092",
     "clave": "docs/bitacora-roadmap.md:6195",
     "tipo": "pendiente",
     "titulo": "Modelar ProjectMilestone + admin UI",
     "descripcion": "Para volver a mostrar milestones con datos reales en /dashboard/project; el componente CurrentMilestone quedó sin uso.",
     "estado_declarado": "pendiente",
     "refs": [
      "docs/roadmap-pendientes.md",
      "src/components/dashboard/CurrentMilestone",
      "tambien en docs/bitacora-roadmap.md:6188"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-066",
     "clave": "docs/bitacora-roadmap.md:8321",
     "tipo": "pendiente",
     "titulo": "SEC-PII-01: email en un log de notify-message.ts",
     "descripcion": "P1 de la auditoría de seguridad pendiente de corregir.",
     "estado_declarado": "pendiente",
     "refs": [
      "notify-message.ts:62",
      "docs/auditoria-seguridad-2026-05.md"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-031",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:420",
     "tipo": "pendiente",
     "titulo": "Facturas sin generación (frenado por schema)",
     "descripcion": "Invoice existe pero nunca se genera en producción. Requiere AssetType.INVOICE, una librería PDF, un form en el admin y poblar Invoice.pdfUrl.",
     "estado_declarado": "bloqueado",
     "refs": [
      "Invoice.pdfUrl",
      "AssetType.INVOICE",
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:171",
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:410"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-032",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:431",
     "tipo": "pendiente",
     "titulo": "Timeline de la Bóveda con datos falsos",
     "descripcion": "El 'Registro de integridad y accesos' muestra ACTIVITY_LOG hardcodeado. El modelo real requiere schema.",
     "estado_declarado": "bloqueado",
     "refs": [
      "boveda/page.tsx ACTIVITY_LOG",
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:117"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-072",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:112",
     "tipo": "pendiente",
     "titulo": "Panel 'mis servicios' y error.tsx en Mi plan",
     "descripcion": "Panel con CTA a /dashboard/services, diferido por decisión de diseño. /dashboard/plan no tiene error.tsx. Warning isUpgrade sin uso.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/app/(protected)/dashboard/plan",
      "tambien en Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:114",
      "tambien en Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:116"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-093",
     "clave": "docs/roadmap-pendientes.md:85",
     "tipo": "pendiente",
     "titulo": "Milestones reales de proyecto",
     "descripcion": "Modelo ProjectMilestone + CRUD admin + reactivar CurrentMilestone en /dashboard/project.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/components/dashboard/CurrentMilestone.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-023",
     "clave": "STATUS.md:198",
     "tipo": "pendiente",
     "titulo": "Agenda Cal.com y WhatsApp Business API",
     "descripcion": "Pospuestas a Beta (hoy WhatsApp es link).",
     "estado_declarado": "pospuesto a Beta",
     "refs": [
      "tambien en :199"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-118",
     "clave": "docs/sprints/p3-a-1-gbp-connection.md:150",
     "tipo": "pendiente",
     "titulo": "UI de conexión GBP y selector de sucursal",
     "descripcion": "Botón self-service, wizard y selector para CONNECTED_NO_LOCATION('multiple'); P3-A.2 lo dejó diferido.",
     "estado_declarado": "diferido",
     "refs": [
      "tambien en :19",
      "docs/sprints/p3-a-2-venta.md:5, :134"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-067",
     "clave": "docs/bitacora-roadmap.md:12216",
     "tipo": "pendiente",
     "titulo": "Migrar notify-message y email.ts de Resend a Brevo",
     "descripcion": "notify-message (from no verificado) y email.ts (agency/tickets/invites, from develop-agency.com) siguen en Resend.",
     "estado_declarado": "pendiente (decisión)",
     "refs": [
      "src/lib/email/notify-message.ts",
      "src/lib/email.ts",
      "también en fuente:12239",
      "también en fuente:12271"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-112",
     "clave": "docs/bitacora-roadmap.md:12542",
     "tipo": "pendiente",
     "titulo": "Verificación viva de la conexión GBP",
     "descripcion": "No hay cuenta GBP de prueba; OAuth vivo y locations reales sin ejercitar.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-114",
     "clave": "docs/bitacora-roadmap.md:12661",
     "tipo": "pendiente",
     "titulo": "Selector de sucursal GBP y CTA en preview admin",
     "descripcion": "Selector para CONNECTED_NO_LOCATION('multiple') diferido; el CTA en preview de admin falla con 'Sesión inválida.'.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-115",
     "clave": "docs/bitacora-roadmap.md:12669",
     "tipo": "pendiente",
     "titulo": "Cerrar el precio del Motor de Reseñas",
     "descripcion": "LockedView muestra [FALTA:precio] y la vitrina 60 USD con pricing no cerrado.",
     "estado_declarado": "pendiente",
     "refs": [
      "también en fuente:12629",
      "también en fuente:12661"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-171",
     "clave": "docs/bitacora-roadmap.md:9832",
     "tipo": "idea",
     "titulo": "Botón desconectar Tiendanube",
     "descripcion": "No existe acción de desconexión de la tienda.",
     "estado_declarado": "sin estado",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-075",
     "clave": "docs/bitacora-roadmap.md:2036",
     "tipo": "decision",
     "titulo": "Valores lockeados de los planes STARTER/PRO/BUSINESS",
     "descripcion": "50/90/150 USD al mes; setup 700/900/1000; 500/3000/5000 conversaciones; 1/3/ilimitados dominios; reportes e insight desde PRO; CRM solo BUSINESS; soporte STANDARD/PRIORITY/PRIORITY_24H.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/seeds/sync-plans.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-036",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:12",
     "tipo": "decision",
     "titulo": "Cifrado serializado dentro de description",
     "descripcion": "Formato enc:v1:<iv>:<tag>:<ciphertext> en ClientAsset.description en lugar de columnas nuevas, para no depender de una migración.",
     "estado_declarado": "hecho",
     "refs": [
      "ClientAsset.description"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-039",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:84",
     "tipo": "decision",
     "titulo": "Email marketing: sin BackLink y router.push documentado",
     "descripcion": "Sin botón volver en campaigns/contactos (mismo criterio que resultados/* y cuenta/*). Los router.push post-acción de campaigns/new se documentan, no se migran.",
     "estado_declarado": "hecho",
     "refs": [
      "campaigns/new",
      "tambien en Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:85"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-022",
     "clave": "_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:14",
     "tipo": "decision",
     "titulo": "D-C3: la reserva de turnos no va en el bot",
     "descripcion": "Pertenece al proyecto agenda (~35%, API v1 apagada).",
     "estado_declarado": "descartado",
     "refs": [
      "tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:25",
      "tambien en Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:89"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-068",
     "clave": "_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:130",
     "tipo": "hecho-declarado",
     "titulo": "P0.3 scoring según plan y P0.4 coherencia comercial",
     "descripcion": "El lead scoring se habilita según el plan (planAllows('leadScoring')), también en el CSV. Starter baja de 50 a 49 y se quita mini-crm de los módulos premium.",
     "estado_declarado": "hecho",
     "refs": [
      "planAllows('leadScoring')",
      "premium-modules",
      "tambien en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:131"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-026",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:49",
     "tipo": "hecho-declarado",
     "titulo": "Mi Cuenta: rediseño de Perfil, Facturación y Bóveda",
     "descripcion": "Ancho completo, receta visual del admin, primitivos Input y Toggle, menos ruido en la Bóveda. Corrige rutas muertas de revalidate/links y el mojibake.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "2c6966e",
      "a5d511c",
      "26026df",
      "17a9e0a",
      "31bfd39",
      "lane/cuenta"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-030",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:319",
     "tipo": "hecho-declarado",
     "titulo": "Layout de Perfil en 2 columnas alineadas",
     "descripcion": "Reorden de columnas, zona de peligro a ancho completo y última card con flex-1 y h-full. También quita el espacio muerto inferior. Pendiente de verificación humana.",
     "estado_declarado": "hecho (sin verificar)",
     "refs": [
      "b9a8565",
      "7adeae6",
      "040ce97",
      "fde9bdb"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-089",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:9",
     "tipo": "hecho-declarado",
     "titulo": "Mi proyecto: reskin y pulida",
     "descripcion": "Header, TaskCards, hero de progreso y hover split-wrapper. Ancho completo, fix del tab destino del banner de aprobación y empties sin tinte teal.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "e644e55",
      "92f1218",
      "e86ae3d",
      "8c71ec1",
      "fe89c1b",
      "32caad8"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-116",
     "clave": "docs/sprints/p3-a-1-gbp-connection.md:8",
     "tipo": "hecho-declarado",
     "titulo": "Backend de conexión GBP",
     "descripcion": "Descubre account+location, persiste por cardinalidad con estados honestos, listAvailableLocations/setActiveLocation y rating one-shot desde el callback (fetch crudo, sin dependencia).",
     "estado_declarado": "hecho (sin verificación viva)",
     "refs": [
      "src/lib/integrations/gbp-connection-logic.ts",
      "src/lib/actions/gbp-connection.ts",
      "tambien en :29"
     ],
     "zona_franco": false
    }
   ],
   "planeado_omitidos": [],
   "insumos": "C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\Cliente - Registro de cambios\\ (el archivo de la seccion que toca tu lote) y C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\registro-cambios-2026-07-13-panel-PD1-PA-CO5.md"
  },
  {
   "id": "D2-L2",
   "loc": 2831,
   "archivos": [
    "src/app/(protected)/dashboard/resultados/analisis/loading.tsx",
    "src/app/(protected)/dashboard/resultados/analisis/page.tsx",
    "src/app/(protected)/dashboard/resultados/error.tsx",
    "src/app/(protected)/dashboard/resultados/layout.tsx",
    "src/app/(protected)/dashboard/resultados/loading.tsx",
    "src/app/(protected)/dashboard/resultados/page.tsx",
    "src/app/(protected)/dashboard/resultados/reputacion/loading.tsx",
    "src/app/(protected)/dashboard/resultados/reputacion/page.tsx",
    "src/app/(protected)/dashboard/resultados/seo/loading.tsx",
    "src/app/(protected)/dashboard/resultados/seo/page.tsx",
    "src/app/(protected)/dashboard/resultados/trafico/loading.tsx",
    "src/app/(protected)/dashboard/resultados/trafico/page.tsx",
    "src/app/(protected)/dashboard/services/loading.tsx",
    "src/app/(protected)/dashboard/services/page.tsx",
    "src/app/(protected)/dashboard/soporte/[ticketId]/loading.tsx",
    "src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx",
    "src/app/(protected)/dashboard/soporte/loading.tsx",
    "src/app/(protected)/dashboard/soporte/page.tsx",
    "src/app/api/dashboard/leads/recent/route.ts",
    "src/app/api/reports/client-monthly/route.ts",
    "src/app/api/reports/monthly/route.ts",
    "src/app/bienvenida/_actions/complete-onboarding.ts",
    "src/app/bienvenida/_components/BienvenidaWizard.tsx",
    "src/app/bienvenida/_components/Step1Empresa.tsx",
    "src/app/bienvenida/_components/Step2Conexiones.tsx",
    "src/app/bienvenida/_components/Step3Tour.tsx",
    "src/app/bienvenida/layout.tsx",
    "src/app/bienvenida/page.tsx"
   ],
   "previas": [
    {
     "doc": "docs/auditoria-total-pre-deploy.md",
     "linea": 36,
     "id_previo": "O-2",
     "titulo": "Build de prod ROTO (@googleapis/webmasters declarada pero no instalada)",
     "severidad_original": "ALTO (rojo; blocker, 'trivial y critico')",
     "estado_declarado": "Blocker reproducido 2 veces, abierto al 2026-06-02; quick win #1 (:102). Posterior: docs/baselines/2026-07-auditoria-seguridad.md:90 reporta npm run build exit 0 en 49fec9b (indicio de resolucion, no lo cierra explicitamente); docs/audit-repo-20260707.md:181 menciona un error tsc baseline en src/lib/searchconsole.ts.",
     "archivos_citados": [
      "package.json:28",
      "src/lib/searchconsole.ts:2",
      "src/app/api/reports/monthly/route.ts"
     ],
     "dominio_probable": "D8",
     "resumen": "next build fallaba con Module not found por @googleapis/webmasters declarada pero ausente en node_modules, importada por searchconsole.ts y arrastrada por /api/reports/monthly; bloqueaba deploy y medicion de bundle."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-profunda.md",
     "linea": 50,
     "id_previo": "P1-7",
     "titulo": "/dashboard/resultados/seo muestra mock data como si fuera real",
     "severidad_original": "P1",
     "estado_declarado": "Abierto en el doc. PARCIAL según 2026-06-revalidacion-dashboard-chatbot.md:81 y 2026-06-revalidacion.md:75 (el flag isMockData existe, pero no hay badge visible).",
     "archivos_citados": [
      "src/app/(protected)/dashboard/resultados/seo/page.tsx:188"
     ],
     "dominio_probable": "D2",
     "resumen": "Sin Search Console conectado, el cliente ve métricas SEO inventadas."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 81,
     "id_previo": "P1-7",
     "titulo": "/dashboard/resultados/seo muestra mock como real",
     "severidad_original": "P1",
     "estado_declarado": "PARCIAL: isMockData viaja en el payload, pero sin badge visible (:81).",
     "archivos_citados": [
      "src/app/(protected)/dashboard/resultados/seo/page.tsx:188"
     ],
     "dominio_probable": "D2",
     "resumen": "Re-verificación del P1-7 de profunda:50."
    }
   ],
   "previas_omitidas": 0,
   "planeado": [
    {
     "id": "PLAN-133",
     "clave": "docs/bitacora-roadmap.md:12109",
     "tipo": "pendiente",
     "titulo": "Borrar motores PDF huérfanos",
     "descripcion": "ExecutiveReportTemplate/DownloadReportButton (mock) y MonthlyReport + /api/reports/monthly sin uso.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/components/dashboard/ExecutiveReportTemplate.tsx",
      "src/app/api/reports/monthly/route.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-155",
     "clave": "docs/sprints/p3-a-2-venta.md:158",
     "tipo": "hecho-declarado",
     "titulo": "P3-A.2-acceso: vitrina -> LockedView",
     "descripcion": "salesRouteHref en PremiumModuleCard solo para motor-resenas; submitInterest navega con window.location.assign en vez de triggerTransition. Los otros 3 módulos siguen pidiendo inline.",
     "estado_declarado": "hecho",
     "refs": [
      "src/components/dashboard/PremiumModuleCard.tsx",
      "src/app/(protected)/dashboard/services/page.tsx",
      "tambien en :176"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-132",
     "clave": "docs/bitacora-roadmap.md:12062",
     "tipo": "hecho-declarado",
     "titulo": "P2.C PDF del informe mensual",
     "descripcion": "Descarga en /dashboard/resultados/analisis vía @react-pdf/renderer server-side.",
     "estado_declarado": "hecho (verificación humana pendiente)",
     "refs": [
      "src/app/api/reports/client-monthly/route.ts",
      "src/lib/reports/client-monthly/ClientMonthlyReportPdf.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-049",
     "clave": "docs/bitacora-roadmap.md:6193",
     "tipo": "pendiente",
     "titulo": "Badge/disclaimer 'Generado por IA' en outputs LLM",
     "descripcion": "Anotado en roadmap-pendientes §B9.3; incluye el AIExecutiveBrief (transparencia de IA, sprint propio).",
     "estado_declarado": "pendiente",
     "refs": [
      "docs/roadmap-pendientes.md",
      "tambien en docs/bitacora-roadmap.md:6201"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-130",
     "clave": "docs/bitacora-roadmap.md:7154",
     "tipo": "pendiente",
     "titulo": "upsertBusinessMetrics sin callers ni UI",
     "descripcion": "La función existe pero ninguna UI la usa.",
     "estado_declarado": "sin estado",
     "refs": [
      "src/actions/metrics-actions.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-024",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:87",
     "tipo": "pendiente",
     "titulo": "completeOnboardingAction sin caller y con auth débil",
     "descripcion": "No tiene caller en src/, y obtiene la session pero no la usa. ¿Ruta muerta o a medio cablear?",
     "estado_declarado": "pendiente",
     "refs": [
      "completeOnboardingAction"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-145",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:217",
     "tipo": "pendiente",
     "titulo": "Modal de detalle de servicios contratados",
     "descripcion": "'1 cuadro por servicio + N entidades por tipo'. Requiere relevar la relación Service→Project, que hoy no existe, y posiblemente schema.",
     "estado_declarado": "pendiente",
     "refs": [
      "ServiceCard",
      "tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:266"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-127",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:174",
     "tipo": "pendiente",
     "titulo": "Verificación visual de Resultados antes del merge",
     "descripcion": "Obligatoria: 4 tabs, con ?demo=true y el seed de Matsu.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-169",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:85",
     "tipo": "pendiente",
     "titulo": "Tickets en tiempo real",
     "descripcion": "Polling, SSE o websockets. Está fichado pero sin diseñar.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-141",
     "clave": "STATUS.md:209",
     "tipo": "pendiente",
     "titulo": "Mocks sin aviso en Resultados",
     "descripcion": "SEO muestra mock sin badge 'datos demo'; analytics/searchconsole/n8n devuelven mock sin avisar en UI.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :210"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-140",
     "clave": "raiz:lane-resultados-redesign-log.md:309",
     "tipo": "pendiente",
     "titulo": "Verificación y merge de lane/resultados",
     "descripcion": "Visual desde el worktree, /analisis con seed, coreografía por grabación; el merge lo hace el humano.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-051",
     "clave": "docs/bitacora-roadmap.md:8921#3",
     "tipo": "pendiente",
     "titulo": "AIExecutiveBrief sin feature flag",
     "descripcion": "El brief IA del dashboard no tiene feature flag; derivado a B14.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-152",
     "clave": "docs/bitacora-roadmap.md:11720",
     "tipo": "pendiente",
     "titulo": "Módulo DEPRECATED poseído desaparece de 'Tus módulos'",
     "descripcion": "Decisión de producto: honrar 'ya lo tenés' para discontinuados exige tocar query y classifyModuleState.",
     "estado_declarado": "pendiente (decisión de Franco)",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-025",
     "clave": "docs/bitacora-beta-3.md:4928",
     "tipo": "pendiente",
     "titulo": "OnboardingWizard no reutilizable y borrador global",
     "descripcion": "30 campos hardcodeados; el autoguardado es localStorage con clave global develop:onboarding:draft, sin servidor.",
     "estado_declarado": "sin estado",
     "refs": [
      "OnboardingWizard",
      "ProgressBar.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-129",
     "clave": "docs/bitacora-rediseno.md:1553",
     "tipo": "pendiente",
     "titulo": "Error de tsc preexistente en src/lib/searchconsole.ts",
     "descripcion": "Conflicto de tipos googleapis/google-gax; aparece en B2-S1, B2-S2 y B2-S3 y no aparece en B2-S4.",
     "estado_declarado": "intermitente",
     "refs": [
      "src/lib/searchconsole.ts",
      "también en docs/bitacora-rediseno.md:1825",
      "también en docs/bitacora-rediseno.md:2048",
      "también en docs/bitacora-rediseno.md:2529"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-126",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:106",
     "tipo": "decision",
     "titulo": "D2: quitar datos falsos y marcar deltas fijos",
     "descripcion": "Los datos inventados se eliminan. Los deltas hardcodeados se conservan con FIXME(data-truth) hasta un sprint de datos.",
     "estado_declarado": "hecho",
     "refs": [
      "FIXME(data-truth)"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-135",
     "clave": "raiz:lane-resultados-redesign-log.md:19",
     "tipo": "decision",
     "titulo": "Componentes muertos de Resultados",
     "descripcion": "DownloadReportButton, AnalyticsPeriodSelector, LeakMeter, ExecutiveReportTemplate: no revivir ni cablear.",
     "estado_declarado": "decidido",
     "refs": [
      "tambien en :122"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-136",
     "clave": "raiz:lane-resultados-redesign-log.md:127",
     "tipo": "decision",
     "titulo": "Decisiones D1-D6 de Resultados",
     "descripcion": "ResultEmptyState canónico, quitar fila 'Google Ads', FIXME en deltas, chartCardHoverCls local, no exponer result.error, commits atómicos.",
     "estado_declarado": "decidido",
     "refs": [
      "tambien en :129-:134"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-122",
     "clave": "_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:129",
     "tipo": "hecho-declarado",
     "titulo": "P0.2 Análisis mensual (Franco)",
     "descripcion": "Pestaña en /dashboard/resultados/analisis, solo desde el plan Pro, filtrada por organización, sobre ChatbotInsight y agregados. Su contrato quedó congelado para la lane resultados.",
     "estado_declarado": "hecho",
     "refs": [
      "getMonthlyAnalysisForOrg",
      "monthly-analysis.ts",
      "planAllows",
      "tambien en Olme/Chatbot_ registro de cambios.md:50",
      "tambien en Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:122"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-042",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:9",
     "tipo": "hecho-declarado",
     "titulo": "Inicio: reskin S1, S2, S3a y S5",
     "descripcion": "OnboardingStatusCard con tokens y vidrio canónico. Hover split-wrapper en AttentionStack y WeekResultsGrid. Ancho completo y barrido de strokeWidth.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "2725caf",
      "b811c17",
      "6e19f7e",
      "f9eb475",
      "7b8aa4f",
      "lane/inicio"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-144",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:205",
     "tipo": "hecho-declarado",
     "titulo": "Servicios: Sprints 0-4 y hotfix",
     "descripcion": "PremiumModuleCard y ServiceCard con el lenguaje del admin, loading espejado y 3 paneles de vidrio a ancho completo. El estado vacío se arma a mano por el boundary.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "5d97587",
      "97c02c1",
      "ab86804",
      "a6550e9",
      "7fda87c",
      "91b3b20"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-123",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:19",
     "tipo": "hecho-declarado",
     "titulo": "Resultados: Sprints 1, A, 2 y 3",
     "descripcion": "Header único en los 4 tabs. Seed de QA para /analisis (gitignored). Infra en _shared (HoverCard, ResultEmptyState, chartTheme). Reskin de reputación y análisis.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "583a3ee",
      "e6578b6",
      "90a202e",
      "d1a2380",
      "2b51858",
      "37609b5"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-124",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:55",
     "tipo": "hecho-declarado",
     "titulo": "Resultados Sprint 4: Tráfico",
     "descripcion": "Saca el dato inventado 'Google Ads', tipa el any del tooltip y hace determinístico el skeleton (sin Math.random). Reskin de tráfico y de los componentes compartidos.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "69ea796",
      "ee24347",
      "15b1d21",
      "df4fbe8",
      "SessionsChart"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-139",
     "clave": "raiz:lane-resultados-redesign-log.md:217",
     "tipo": "hecho-declarado",
     "titulo": "Seed QA de /analisis",
     "descripcion": "scripts/dev/_seed-resultados-qa.ts (gitignored) corrido en Neon dev; resolvió Matsu BUSINESS.",
     "estado_declarado": "hecho",
     "refs": [
      "d1a2380"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-057",
     "clave": "docs/bitacora-roadmap.md:11312",
     "tipo": "hecho-declarado",
     "titulo": "P1.C-fix cosméticos del home",
     "descripcion": "Hover canónico, input sin spinners y empty states muted.",
     "estado_declarado": "hecho",
     "refs": [],
     "zona_franco": false
    }
   ],
   "planeado_omitidos": [],
   "insumos": "C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\Cliente - Registro de cambios\\ (el archivo de la seccion que toca tu lote) y C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\registro-cambios-2026-07-13-panel-PD1-PA-CO5.md"
  },
  {
   "id": "D2-L3",
   "loc": 6433,
   "archivos": [
    "src/components/dashboard/AlertaMetrica.tsx",
    "src/components/dashboard/AnalyticsAlertas.tsx",
    "src/components/dashboard/AnalyticsMetricCard.tsx",
    "src/components/dashboard/AnalyticsSkeleton.tsx",
    "src/components/dashboard/AnimatedCounter.tsx",
    "src/components/dashboard/AnimatedProgressBar.tsx",
    "src/components/dashboard/AnnouncementsFeed.tsx",
    "src/components/dashboard/BackLink.tsx",
    "src/components/dashboard/ChatBubble.tsx",
    "src/components/dashboard/ClicksImpressionsChart.tsx",
    "src/components/dashboard/ClientChatComposer.tsx",
    "src/components/dashboard/ClientChatThread.tsx",
    "src/components/dashboard/CuentaTabs.tsx",
    "src/components/dashboard/CurrentPlanCard.tsx",
    "src/components/dashboard/DashboardLayoutClient.tsx",
    "src/components/dashboard/EmojiPopover.tsx",
    "src/components/dashboard/ExecutiveReportPrefsForm.tsx",
    "src/components/dashboard/ExecutiveReportTemplate.tsx",
    "src/components/dashboard/FadeIn.tsx",
    "src/components/dashboard/ImpersonationBanner.tsx",
    "src/components/dashboard/ImpersonationTimer.tsx",
    "src/components/dashboard/MessageThread.tsx",
    "src/components/dashboard/NewTicketModal.tsx",
    "src/components/dashboard/NotificationCenter.tsx",
    "src/components/dashboard/NotificationHistoryModal.tsx",
    "src/components/dashboard/OnboardingStatusCard.tsx",
    "src/components/dashboard/OportunidadSEO.tsx",
    "src/components/dashboard/OportunidadesSEO.tsx",
    "src/components/dashboard/PageTransition.tsx",
    "src/components/dashboard/PremiumModuleCard.tsx",
    "src/components/dashboard/PreviewBanner.tsx",
    "src/components/dashboard/ProfileForms.tsx",
    "src/components/dashboard/ProjectEmptyState.tsx",
    "src/components/dashboard/ProjectTaskTabs.tsx",
    "src/components/dashboard/ReferralPanel.tsx",
    "src/components/dashboard/ResolveTicketButton.tsx",
    "src/components/dashboard/ResultadosTabs.tsx",
    "src/components/dashboard/ScrollTopOnNavigate.tsx",
    "src/components/dashboard/SeoAlertas.tsx",
    "src/components/dashboard/ServiceDetailModal.tsx",
    "src/components/dashboard/SessionsChart.tsx",
    "src/components/dashboard/SidebarNav.tsx",
    "src/components/dashboard/SoporteBoard.tsx",
    "src/components/dashboard/StaggerWrapper.tsx",
    "src/components/dashboard/SubscriptionBanner.tsx",
    "src/components/dashboard/TaskApprovalButtons.tsx",
    "src/components/dashboard/TicketReplyForm.tsx",
    "src/components/dashboard/TrendBadge.tsx",
    "src/components/dashboard/VaultRequestModal.tsx",
    "src/components/dashboard/notification-shared.tsx"
   ],
   "previas": [
    {
     "doc": "rama:chore/auditoria-clean:docs/baselines/2026-07-auditoria-clean.md",
     "linea": 26,
     "id_previo": "CLEAN-H3",
     "titulo": "Identidad de email fragmentada: 3 remitentes, 2 dominios (uno legacy) y un Gmail personal",
     "severidad_original": "EJECUTAR P1 — VERIFICADO",
     "estado_declarado": "abierto al 2026-07-18 (tabla :226)",
     "archivos_citados": [
      "src/lib/email.ts:21",
      "src/lib/email/brevo-service.ts:33",
      "src/lib/integrations/brevo.ts:124",
      "src/components/dashboard/ExecutiveReportTemplate.tsx:120"
     ],
     "dominio_probable": "D7",
     "resumen": "email.ts usa un remitente de dominio legacy hardcodeado e ignora RESEND_FROM_EMAIL. Si falta BREVO_FROM_EMAIL (opcional), brevo-service cae a un Gmail personal. El dominio legacy se le ve al cliente."
    }
   ],
   "previas_omitidas": 0,
   "planeado": [
    {
     "id": "PLAN-170",
     "clave": "docs/bitacora-roadmap.md:305",
     "tipo": "pendiente",
     "titulo": "Sacar el cliente Prisma del bundle del browser (NewTicketModal)",
     "descripcion": "El chunk de Prisma (~65KB) persiste porque NewTicketModal usa z.nativeEnum(TicketCategory/TicketPriority); el refactor a z.enum quedó diferido.",
     "estado_declarado": "pendiente",
     "refs": [
      "NewTicketModal.tsx",
      "tambien en docs/bitacora-roadmap.md:327",
      "tambien en docs/bitacora-roadmap.md:374"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-153",
     "clave": "docs/bitacora-roadmap.md:12663",
     "tipo": "pendiente",
     "titulo": "PremiumModuleCard usa triggerTransition en portal",
     "descripcion": "Viola la regla de navegación de portales; migrar es otro alcance.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/components/dashboard/PremiumModuleCard.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-143",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:175",
     "tipo": "promesa",
     "titulo": "Badge 'Próximamente Q3 2026'",
     "descripcion": "Los módulos coming-soon muestran al cliente 'Próximamente Q3 2026', en la card y en el modal. Es una fecha comprometida.",
     "estado_declarado": "sin estado",
     "refs": [
      "PremiumModuleCard.tsx",
      "ServiceDetailModal.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-162",
     "clave": "docs/bitacora-roadmap.md:2491",
     "tipo": "hecho-declarado",
     "titulo": "B4.4 — Drop de User.unlockedFeatures (legacy)",
     "descripcion": "Slug legacy migrado a OrganizationModule, refactor de dashboard/layout, DashboardLayoutClient y SidebarNav, borradas toggleClientFeatureAction y toggleClientFeature (sin callers), DROP COLUMN con migración manual; fix de activeModuleSlugs en el sidebar mobile.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql",
      "prisma/schema.prisma",
      "prisma/seed.ts",
      "src/app/(protected)/dashboard/layout.tsx",
      "src/components/dashboard/DashboardLayoutClient.tsx",
      "src/components/dashboard/SidebarNav.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-159",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:9",
     "tipo": "hecho-declarado",
     "titulo": "Tarea 1: módulos premium en el sidebar y fullwidth",
     "descripcion": "Los módulos activos pasan a la sección Servicios por el mismo .map que el resto de los ítems. Las páginas de módulo van a ancho completo. Mergeado.",
     "estado_declarado": "hecho",
     "refs": [
      "7cfe4a4",
      "9699eaa",
      "6bd00a6",
      "src/components/dashboard/SidebarNav.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-160",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:21",
     "tipo": "hecho-declarado",
     "titulo": "Tarea 2: BackLink y navegación",
     "descripcion": "Componente BackLink aplicado en soporte/[ticketId]. router.back de campaigns/send pasa a <Link>, y los router.push de campaigns/new quedan documentados. Mergeado.",
     "estado_declarado": "hecho",
     "refs": [
      "e6155f5",
      "841425c",
      "2e6dc93",
      "461824d",
      "src/components/dashboard/BackLink.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-028",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:211",
     "tipo": "hecho-declarado",
     "titulo": "Fases 3 y 4: avatar del cliente y modal de la Bóveda",
     "descripcion": "ClientAvatarField reemplaza logoUrl en el form; logoUrl queda intacto en la DB. VaultRequestModal pasa al Modal primitivo.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "6c83b16",
      "f86c911",
      "ClientAvatarField",
      "VaultRequestModal.tsx",
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:229"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-029",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:276",
     "tipo": "hecho-declarado",
     "titulo": "Fix de la pantalla negra al cambiar password",
     "descripcion": "PasswordForm pasa a onSubmit con startTransition, await y router.refresh, sin <form action>. auth.ts intacto. Pendiente de verificación humana.",
     "estado_declarado": "hecho (sin verificar)",
     "refs": [
      "7a6ee10",
      "2730502",
      "b31d76b",
      "ProfileForms.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-142",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:159",
     "tipo": "hecho-declarado",
     "titulo": "Sprint 5: 'Ver detalles' y ServiceDetailModal",
     "descripcion": "Modal portaleado con longDescription tomado de un preset local. El CTA 'Desbloquear' y sus 4 estados quedan intactos.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "bded0be",
      "ServiceDetailModal.tsx",
      "PremiumModuleCard.tsx",
      "PRESET_MODULE_DETAILS"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-168",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:21",
     "tipo": "hecho-declarado",
     "titulo": "Soporte: tablero de 3 columnas",
     "descripcion": "SoporteBoard con fade, overview portaleado, página sin scroll y hover. Badges de prioridad y categoría también en el admin.",
     "estado_declarado": "hecho",
     "refs": [
      "SoporteBoard.tsx",
      "tambien en Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:17"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-158",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/General_ registro de cambios.md:9",
     "tipo": "hecho-declarado",
     "titulo": "Notificaciones del portal",
     "descripcion": "NotificationCenter portaleado a body (trampa de backdrop-filter) y modal con el historial completo.",
     "estado_declarado": "hecho",
     "refs": [
      "NotificationCenter.tsx",
      "NotificationHistoryModal.tsx",
      "lib/actions/notifications.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-166",
     "clave": "docs/bitacora-roadmap.md:11419",
     "tipo": "hecho-declarado",
     "titulo": "P1-fix scroll reset al navegar",
     "descripcion": "ScrollTopOnNavigate montado en el main del dashboard.",
     "estado_declarado": "hecho",
     "refs": [
      "src/components/dashboard/ScrollTopOnNavigate.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-163",
     "clave": "docs/bitacora-roadmap.md:4226",
     "tipo": "pendiente",
     "titulo": "Quitar '(scaffolding)' del nombre del usuario seed",
     "descripcion": "Aparece en el banner del dashboard ('Matsu Admin (scaffolding)'); el doc no precisa en qué seed ('seed-agency-os o similar').",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en docs/bitacora-roadmap.md:4230",
      "tambien en docs/bitacora-roadmap.md:5934"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-037",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:24",
     "tipo": "pendiente",
     "titulo": "Credencial en claro al mostrarla (at-display)",
     "descripcion": "El enmascarado es cosmético: el valor descifrado viaja en el prop del RSC. PD-1 solo cerró el cifrado en reposo; endurecer lo que se muestra es deuda aparte.",
     "estado_declarado": "pendiente",
     "refs": [
      "/dashboard/cuenta/boveda",
      "VaultRevealButton"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-034",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:461",
     "tipo": "pendiente",
     "titulo": "6 verificaciones humanas pendientes de lane/cuenta",
     "descripcion": "Password end-to-end, avatar, backdrop del modal, ticket→borrar, alineación de columnas y visual fino. Necesarias antes de declararla lista para producción.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:484"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-117",
     "clave": "docs/sprints/p3-a-1-gbp-connection.md:138",
     "tipo": "pendiente",
     "titulo": "Verificación viva de GBP",
     "descripcion": "Sin cuenta GBP de prueba; /reputacion no se puede sembrar (OAuth vivo, sin mock).",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :149",
      "raiz:lane-resultados-redesign-log.md:225, :234, :312"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-164",
     "clave": "docs/bitacora-roadmap.md:8921#4",
     "tipo": "pendiente",
     "titulo": "error.tsx faltantes en 12 páginas del dashboard",
     "descripcion": "12 dashboard pages sin error boundary propio; derivado a B14.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-040",
     "clave": "docs/bitacora-roadmap.md:9822",
     "tipo": "pendiente",
     "titulo": "fromEmail libre en campañas sin validar dominio",
     "descripcion": "Riesgo de spoofing/deliverability si el envío no valida SPF/DKIM del remitente; sprint de deliverability propio.",
     "estado_declarado": "pendiente",
     "refs": [
      "también en fuente:9871"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-038",
     "clave": "docs/bitacora-roadmap.md:13623",
     "tipo": "pendiente",
     "titulo": "PD-1 Onboarding Vault sin cerrar",
     "descripcion": "Cambios de cifrado de credenciales del onboarding sin commitear y sin entrada de cierre en esta bitácora.",
     "estado_declarado": "en curso",
     "refs": [
      "src/lib/crypto/",
      "docs/audit-PD1-cifrado-onboarding.md",
      "src/components/dashboard/VaultRevealButton.tsx",
      "también en fuente:13731"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-103",
     "clave": "docs/bitacora-roadmap.md:5259",
     "tipo": "idea",
     "titulo": "Link directo al detalle del lead desde el email",
     "descripcion": "Requiere firmar un token porque 'los IDs de lead no van en URLs por política'.",
     "estado_declarado": "sin estado",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-071",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:56",
     "tipo": "decision",
     "titulo": "No adoptar AnimatedProgressBar ni AnimatedCounter",
     "descripcion": "Traen copy fijo de proyectos y rompen el formato es-AR. Se mantienen la barra inline y formatNumberEs.",
     "estado_declarado": "descartado",
     "refs": [
      "AnimatedProgressBar",
      "AnimatedCounter"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-073",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:118",
     "tipo": "decision",
     "titulo": "Doble fetch de getOrgUsageSnapshot a propósito",
     "descripcion": "Permite streaming independiente de cada Suspense. lib/plan está frozen y no se colapsa.",
     "estado_declarado": "hecho",
     "refs": [
      "getOrgUsageSnapshot"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-172",
     "clave": "STATUS.md:234",
     "tipo": "decision",
     "titulo": "Integración Tiendanube por API",
     "descripcion": "Pendiente de decisión.",
     "estado_declarado": "pendiente",
     "refs": [
      "docs/sprints/alpha-RESUMEN-FINAL.md:78"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-106",
     "clave": "docs/bitacora-roadmap.md:11940",
     "tipo": "decision",
     "titulo": "executiveReportOptOut convive con la frecuencia",
     "descripcion": "Reactivar una frecuencia limpia el opt-out; la UI muestra el estado efectivo.",
     "estado_declarado": "hecho",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-035",
     "clave": "_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:8",
     "tipo": "hecho-declarado",
     "titulo": "PD-1: credenciales de la bóveda cifradas",
     "descripcion": "AES-256-GCM en ClientAsset.description con formato enc:v1. Ambos caminos de escritura cifran con validación Zod. Los lectores descifran y enmascaran con botón reveal. Backfill de 2 filas. Verificado end-to-end.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/crypto/credential-cipher.ts",
      "src/lib/crypto/encrypt-for-storage.ts",
      "src/lib/crypto/resolve-credential.ts",
      "completeOnboardingAction",
      "VaultRevealButton",
      "env ONBOARDING_SECRET_KEY (solo nombre)"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-027",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:177",
     "tipo": "hecho-declarado",
     "titulo": "Fase 1: validación de password",
     "descripcion": "Regex de mayúscula y número en UpdatePasswordSchema, submit deshabilitado, visor corregido y unstable_update con payload.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "8b641a0",
      "src/lib/actions/schemas.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-090",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:21",
     "tipo": "hecho-declarado",
     "titulo": "Tiles de datos y selector de proyectos",
     "descripcion": "Tipo, monto, inicio y entrega derivados sin schema. Selector por ?p=<id> con fallback que no filtra datos de otros tenants.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "7876c02",
      "be6aa4c"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-083",
     "clave": "docs/bitacora-roadmap.md:11035",
     "tipo": "hecho-declarado",
     "titulo": "P0.4 coherencia comercial",
     "descripcion": "Precio Starter USD 49 unificado; mini-crm removido.",
     "estado_declarado": "hecho",
     "refs": [
      "fallback.ts",
      "premium-features.ts",
      "next.config.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-108",
     "clave": "docs/bitacora-roadmap.md:11999",
     "tipo": "hecho-declarado",
     "titulo": "FIX-BRIEF: el brief IA ya no contradice las cards",
     "descripcion": "Gemini recibe solo los 4 números de las cards con dirección; corte de cache BRIEF_LOGIC_CUTOFF.",
     "estado_declarado": "hecho (verificación viva pendiente)",
     "refs": [
      "src/lib/ai/executive-brief-input.ts",
      "src/lib/ai/executive-brief.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-111",
     "clave": "docs/bitacora-roadmap.md:12500",
     "tipo": "hecho-declarado",
     "titulo": "P3-A.1 backend de conexión GBP",
     "descripcion": "Descubre y persiste account/location, estados honestos y rating one-shot.",
     "estado_declarado": "hecho (verificación viva pendiente)",
     "refs": [
      "src/lib/actions/gbp-connection.ts",
      "docs/sprints/p3-a-1-gbp-connection.md"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-113",
     "clave": "docs/bitacora-roadmap.md:12609",
     "tipo": "hecho-declarado",
     "titulo": "P3-A.2 venta del módulo de reseñas + estados honestos",
     "descripcion": "Vistas locked/connecting/operational según módulo × conexión.",
     "estado_declarado": "hecho (verificación visual pendiente)",
     "refs": [
      "src/lib/modules/motor-resenas-view.ts",
      "docs/sprints/p3-a-2-venta.md"
     ],
     "zona_franco": false
    }
   ],
   "planeado_omitidos": [],
   "insumos": "C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\Cliente - Registro de cambios\\ (el archivo de la seccion que toca tu lote) y C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\registro-cambios-2026-07-13-panel-PD1-PA-CO5.md"
  },
  {
   "id": "D2-L4",
   "loc": 6413,
   "archivos": [
    "src/components/dashboard/VaultRevealButton.tsx",
    "src/components/dashboard/home/AIExecutiveBriefV2.tsx",
    "src/components/dashboard/home/AttentionStack.tsx",
    "src/components/dashboard/home/BusinessHero.tsx",
    "src/components/dashboard/home/HealthScore.tsx",
    "src/components/dashboard/home/LeadCampaigns.tsx",
    "src/components/dashboard/home/LeadFunnel.tsx",
    "src/components/dashboard/home/LeadOrigins.tsx",
    "src/components/dashboard/home/MoneyEstimate.tsx",
    "src/components/dashboard/home/Recommendations.tsx",
    "src/components/dashboard/home/SectionEmptyState.tsx",
    "src/components/dashboard/home/WeekResultsGrid.tsx",
    "src/components/dashboard/modules/motor-resenas/_actions.ts",
    "src/components/dashboard/plan/PlansShowcase.tsx",
    "src/components/dashboard/plan/UpgradeCtaButton.tsx",
    "src/components/dashboard/plan/UsageMeter.tsx",
    "src/components/dashboard/results/GBPMetricsCard.tsx",
    "src/components/dashboard/results/InsightsBlock.tsx",
    "src/components/dashboard/results/PageSpeedCard.tsx",
    "src/components/dashboard/results/_shared/HoverCard.tsx",
    "src/components/dashboard/results/_shared/ResultEmptyState.tsx",
    "src/components/dashboard/results/_shared/chartHover.ts",
    "src/components/dashboard/results/_shared/chartTheme.ts",
    "src/components/dashboard/results/analysis/AnalysisTeaser.tsx",
    "src/components/dashboard/results/analysis/CalibratingBlock.tsx",
    "src/components/dashboard/results/analysis/CategoriesSection.tsx",
    "src/components/dashboard/results/analysis/DiscoveriesSection.tsx",
    "src/components/dashboard/results/analysis/DownloadMonthlyReportButton.tsx",
    "src/components/dashboard/results/analysis/MonthTrendSection.tsx",
    "src/components/dashboard/results/analysis/MonthlyConversationsChart.tsx",
    "src/lib/actions/announcements.ts",
    "src/lib/actions/messages.ts",
    "src/lib/actions/notifications.ts",
    "src/lib/actions/referrals.ts",
    "src/lib/actions/upsell.ts",
    "src/lib/ai/brief-history.ts",
    "src/lib/ai/executive-brief-input.ts",
    "src/lib/ai/executive-brief.ts",
    "src/lib/announcements/get-announcements-for-org.ts",
    "src/lib/announcements/visibility.ts",
    "src/lib/billing/get-current-plan.ts",
    "src/lib/dashboard/attention.ts",
    "src/lib/dashboard/home-metrics-logic.ts",
    "src/lib/dashboard/home-metrics.ts",
    "src/lib/dashboard/lead-origin.ts",
    "src/lib/dashboard/week-results.ts",
    "src/lib/health-score.ts",
    "src/lib/premium-modules.ts",
    "src/lib/preview.ts",
    "src/lib/subscription.ts"
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
     "doc": "docs/audits/2026-05-auditoria-profunda.md",
     "linea": 35,
     "id_previo": "P0-4",
     "titulo": "AIExecutiveBrief ya es un LLM real pero STATUS.md dice mock; sin flag, badge ni observabilidad",
     "severidad_original": "P0",
     "estado_declarado": "Abierto en el doc. PARCIAL según 2026-06-revalidacion-dashboard-chatbot.md:65 y 2026-06-revalidacion.md:66 (gemini-2.5-flash con historial ExecutiveBriefSnapshot; sin flag por plan ni badge de IA).",
     "archivos_citados": [
      "src/lib/ai/executive-brief.ts:194-240"
     ],
     "dominio_probable": "D2",
     "resumen": "El cliente ve texto generado por un LLM como si fuera análisis real, sin disclaimer, sin feature flag para apagarlo y sin historial."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 65,
     "id_previo": "P0-4",
     "titulo": "AIExecutiveBrief con LLM real sin flag ni badge",
     "severidad_original": "P0",
     "estado_declarado": "PARCIAL: gemini-2.5-flash con historial ExecutiveBriefSnapshot; sin feature flag por plan ni badge de IA (:65).",
     "archivos_citados": [
      "src/lib/ai/executive-brief.ts:11"
     ],
     "dominio_probable": "D2",
     "resumen": "Re-verificación del P0-4 de profunda:35."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 83,
     "id_previo": "P1-9",
     "titulo": "health-score con placeholders",
     "severidad_original": "P1",
     "estado_declarado": "PARCIAL: el trend es un placeholder dummy (:83).",
     "archivos_citados": [
      "src/lib/health-score.ts:454"
     ],
     "dominio_probable": "D2",
     "resumen": "Re-verificación del P1-9 de profunda:52."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion.md",
     "linea": 66,
     "id_previo": "P0-4",
     "titulo": "AIExecutiveBrief sin flag ni badge",
     "severidad_original": "P0",
     "estado_declarado": "PARCIAL (:66).",
     "archivos_citados": [
      "src/lib/ai/executive-brief.ts:11"
     ],
     "dominio_probable": "D2",
     "resumen": "Re-verificación de profunda:35."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion.md",
     "linea": 70,
     "id_previo": "sin-id (maxTokens→maxOutputTokens)",
     "titulo": "El build rompía por maxTokens en lugar de maxOutputTokens (migración al Vercel AI SDK)",
     "severidad_original": "Fila de la tabla P0 (:59-70), marcada 'caso pedido'",
     "estado_declarado": "CERRADO (:70). El origen está en 2026-05-cleanup-db-dev.md:215.",
     "archivos_citados": [
      "src/lib/ai/executive-brief.ts:304"
     ],
     "dominio_probable": "D8",
     "resumen": "El build ya no se rompe en ese punto; ahora se rompe por webmasters (N-2)."
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
    }
   ],
   "previas_omitidas": 0,
   "planeado": [
    {
     "id": "PLAN-082",
     "clave": "docs/bitacora-roadmap.md:3191",
     "tipo": "pendiente",
     "titulo": "Idempotencia del lead de upsell de plan",
     "descripcion": "Clicks repetidos generan filas y notificaciones duplicadas; dedupe por (org, service) en una ventana o ocultar el CTA 24h.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/lib/actions/upsell.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-046",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:97",
     "tipo": "pendiente",
     "titulo": "El conteo de leads de Inicio mezcla tenants",
     "descripcion": "contactSubmission.count se calcula sin organizationId: el número y el delta incluyen leads de otros tenants. Se tapó con el caption 'En calibración'. El fix real es scopear por organizationId (schema y query).",
     "estado_declarado": "pendiente",
     "refs": [
      "week-results.ts",
      "computeLeadsScore",
      "ContactSubmission"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-045",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:96",
     "tipo": "pendiente",
     "titulo": "Deuda de datos de Inicio",
     "descripcion": "Dos fuentes de score que se contradicen (CALIBRANDO contra Brief IA 84). Visitas fijas en 0 (falta GA4). Centinela ↑100% de calcTrend cuando la semana previa es 0.",
     "estado_declarado": "pendiente",
     "refs": [
      "week-results.ts",
      "calcTrend",
      "lib/dashboard/*",
      "tambien en Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:98",
      "tambien en Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:99"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-053",
     "clave": "docs/bitacora-roadmap.md:11101",
     "tipo": "pendiente",
     "titulo": "Ventanas de semana por milisegundos crudos",
     "descripcion": "week-results.ts no alinea a días AR; migrar a weekRangeAR.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/lib/dashboard/week-results.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-047",
     "clave": "docs/bitacora-rediseno.md:2698",
     "tipo": "pendiente",
     "titulo": "Portal cliente: 'visits' hardcodeado en 0 en Resultados de la semana",
     "descripcion": "No hay integración de analítica (la card muestra 'Sin integración aún'); WeekResultsData no tiene ventas ni facturación y compara contra la semana anterior.",
     "estado_declarado": "sin estado",
     "refs": [
      "src/lib/dashboard/week-results.ts",
      "src/lib/health-score.ts",
      "src/lib/dashboard/attention.ts",
      "src/lib/ai/executive-brief.ts",
      "también en docs/bitacora-rediseno.md:2690"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-149",
     "clave": "docs/bitacora-roadmap.md:2499",
     "tipo": "decision",
     "titulo": "Los planes no incluyen módulos premium",
     "descripcion": "El chatbot es el producto core; PremiumModule/OrganizationModule son add-ons que se venden aparte vía requestUpsellAction; no hay auto-activación por plan.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/premium-modules.ts",
      "src/lib/actions/upsell.ts",
      "tambien en docs/bitacora-roadmap.md:2613"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-079",
     "clave": "docs/bitacora-roadmap.md:2949",
     "tipo": "decision",
     "titulo": "La cortesía/override de precio no se muestra al cliente",
     "descripcion": "Decisión de no exponer el priceOverride en /dashboard/plan (mostrarlo serían ~10 líneas).",
     "estado_declarado": "hecho",
     "refs": [
      "src/components/dashboard/plan/UsageMeter.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-157",
     "clave": "raiz:lane-resultados-redesign-log.md:182",
     "tipo": "decision",
     "titulo": "Contrato de upsell congelado",
     "descripcion": "requestUpsellAction(featureKey, featureName) contra PremiumModule.slug; tocarlo requiere coordinación (rompe Servicios y Plan).",
     "estado_declarado": "decidido",
     "refs": [
      "src/lib/actions/upsell.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-148",
     "clave": "docs/bitacora-rediseno.md:3380",
     "tipo": "decision",
     "titulo": "No borrar src/lib/data/premium-modules.ts",
     "descripcion": "Sin consumidores en src/, pero lo usa prisma/seeds/sync-premium-modules.ts, que hace deleteMany sobre PremiumModule y organizationModule; borrarlo rompe el seed.",
     "estado_declarado": "vigente",
     "refs": [
      "src/lib/data/premium-modules.ts",
      "prisma/seeds/sync-premium-modules.ts",
      "relacionado docs/bitacora-beta.md:17 (sync-premium-modules prod-runnable sin guard)"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-078",
     "clave": "docs/bitacora-roadmap.md:2792",
     "tipo": "hecho-declarado",
     "titulo": "B4.6 — Medidor de consumo + presentación de planes",
     "descripcion": "getOrgUsageSnapshot, UsageMeter con tono adaptativo sin alarma, PlansShowcase con Pro destacado y footer locked-as-celebration, página /dashboard/plan, medidor en /dashboard e item 'Mi plan' en el sidebar; adenda con fix de TZ en periodLabel.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/plan/get-org-usage.ts",
      "src/lib/plan/plan-presentation.ts",
      "src/components/dashboard/plan/UsageMeter.tsx",
      "src/components/dashboard/plan/PlansShowcase.tsx",
      "src/app/(protected)/dashboard/plan/page.tsx",
      "src/app/(protected)/dashboard/page.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-081",
     "clave": "docs/bitacora-roadmap.md:3093",
     "tipo": "hecho-declarado",
     "titulo": "MS-3 — CTA de upgrade conectado a requestUpsellAction",
     "descripcion": "UpgradeCtaButton registra el lead (contactSubmission, alerta y notificaciones) y navega con window.location.assign a mensajes con texto pre-cargado (plan-upgrade-* / plan-change-*).",
     "estado_declarado": "hecho",
     "refs": [
      "src/components/dashboard/plan/UpgradeCtaButton.tsx",
      "src/components/dashboard/plan/PlansShowcase.tsx",
      "src/lib/data/message-context.ts",
      "src/lib/actions/upsell.ts",
      "pendiente originado en docs/bitacora-roadmap.md:2853",
      "pendiente originado en docs/bitacora-roadmap.md:2951"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-048",
     "clave": "docs/bitacora-roadmap.md:5264",
     "tipo": "hecho-declarado",
     "titulo": "B6.4 — Gate de 4h entre regeneraciones manuales del brief (cierre de B6)",
     "descripcion": "MIN_HOURS_BETWEEN_MANUAL_REGENS = 4 sobre el límite semanal de 3, inferido del estado existente sin schema nuevo; declara cerrado el bloque B6 (B6.1 a B6.4).",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/ai/executive-brief.ts",
      "AIExecutiveBriefV2.tsx",
      "tambien en docs/bitacora-roadmap.md:5342"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-050",
     "clave": "docs/bitacora-roadmap.md:7265",
     "tipo": "hecho-declarado",
     "titulo": "B12.7 — Brief truncado por thinking tokens + label '0/6'",
     "descripcion": "maxOutputTokens del brief a 1024 (gemini-2.5-flash consume tokens de thinking), isBriefValid invalida el brief truncado cacheado, BriefEmptyState honesto y label 'Integraciones conectadas'.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/ai/executive-brief.ts",
      "src/app/(protected)/dashboard/page.tsx",
      "src/components/dashboard/home/HealthScore.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-043",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:34",
     "tipo": "hecho-declarado",
     "titulo": "Inicio: datos honestos (S3b, S4, S4b)",
     "descripcion": "Captions 'Sin integración aún' y 'En calibración'. Oculta el TrendChip falso (hash del orgId) y la frase de tendencia falsa del subtítulo.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "b735b3f",
      "7777cdc",
      "8c7f12b",
      "HealthScore.tsx",
      "lib/health-score.ts computeTrend"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-069",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:9",
     "tipo": "hecho-declarado",
     "titulo": "Mi plan: reskin, hover y ancho completo",
     "descripcion": "Tokens de GlassCard del admin y adminHoverCls en los tiers. Hover sin scale en el medidor. Skeletons alineados.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "lane/plan",
      "UsageMeter.tsx",
      "PlansShowcase.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-070",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:22",
     "tipo": "hecho-declarado",
     "titulo": "Mi plan: estado sin bot y CTA de activación",
     "descripcion": "UsageMeter usa hasBotConfigured: card de onboarding y CTA bot-activation vía requestUpsellAction, sin acción nueva. Spinner de pending en UpgradeCtaButton.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "UpgradeCtaButton.tsx",
      "requestUpsellAction",
      "featureKey bot-activation"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-063",
     "clave": "docs/sprints/p4-1-render-utm.md:16",
     "tipo": "hecho-declarado",
     "titulo": "Campaña UTM en el panel",
     "descripcion": "campaignLabel y tallyCampaigns, tarjeta LeadCampaigns en el home y celda Campaña en LeadDetail; nulos como 'Sin campaña'.",
     "estado_declarado": "hecho, verificación visual pendiente",
     "refs": [
      "src/lib/dashboard/lead-origin.ts",
      "src/components/dashboard/home/LeadCampaigns.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-054",
     "clave": "docs/bitacora-roadmap.md:11172",
     "tipo": "hecho-declarado",
     "titulo": "P1.C home como panel de resultados",
     "descripcion": "Hero con las 4 preguntas del dueño, origen y embudo.",
     "estado_declarado": "hecho (checkpoint visual humano)",
     "refs": [
      "src/lib/dashboard/home-metrics.ts",
      "src/components/dashboard/home/BusinessHero.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-056",
     "clave": "docs/bitacora-roadmap.md:11278",
     "tipo": "hecho-declarado",
     "titulo": "P1.C-fix1 frontera RSC de empty states",
     "descripcion": "SectionEmptyState client resuelve íconos por key.",
     "estado_declarado": "hecho",
     "refs": [
      "src/components/dashboard/home/SectionEmptyState.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-058",
     "clave": "docs/bitacora-roadmap.md:11594",
     "tipo": "hecho-declarado",
     "titulo": "P5.1 motor de recomendaciones por reglas",
     "descripcion": "'Ideas para crecer' en el home con 4 reglas y CTA de upsell.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/recommendations/rules.ts",
      "src/components/dashboard/home/Recommendations.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-134",
     "clave": "docs/bitacora-roadmap.md:12113",
     "tipo": "hecho-declarado",
     "titulo": "P2.C-fix-signo guion ASCII en deltas",
     "descripcion": "MINUS SIGN U+2212 reemplazado en el PDF y en deltaPhrase del home.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/reports/client-monthly/monthly-report-data.ts",
      "src/lib/dashboard/home-metrics-logic.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-060",
     "clave": "docs/bitacora-roadmap.md:12325",
     "tipo": "hecho-declarado",
     "titulo": "D1 computeTrend zombie eliminado",
     "descripcion": "Se borró el trend por hash de health-score.ts.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/health-score.ts",
      "cierra pendiente fuente:12058"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-062",
     "clave": "docs/bitacora-roadmap.md:12778",
     "tipo": "hecho-declarado",
     "titulo": "P4.1 atribución por campaña en el panel",
     "descripcion": "LeadCampaigns en el home y celda 'Campaña' en el detalle del lead.",
     "estado_declarado": "hecho (visual parcial)",
     "refs": [
      "src/components/dashboard/home/LeadCampaigns.tsx",
      "docs/sprints/p4-1-render-utm.md"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-074",
     "clave": "docs/bitacora-roadmap.md:2015",
     "tipo": "pendiente",
     "titulo": "Sumar tools premium al plan BUSINESS cuando existan",
     "descripcion": "Hoy BUSINESS tiene las mismas 4 tools que PRO; nuevas tools (show_product_card, score_lead) se agregan al array tools de BUSINESS en sync-plans.ts sin cambiar schema.",
     "estado_declarado": "pendiente",
     "refs": [
      "prisma/seeds/sync-plans.ts",
      "tambien en docs/bitacora-roadmap.md:2133",
      "tambien en docs/bitacora-roadmap.md:2306"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-161",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:84",
     "tipo": "pendiente",
     "titulo": "Botón 'volver atrás' en subpáginas",
     "descripcion": "Patrón global del admin, diferido para todas las secciones con subpáginas.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en Olme/Cliente - Registro de cambios/Mensajes_ registro de cambios.md:58",
      "tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:83",
      "ver Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:21 (BackLink)"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-088",
     "clave": "STATUS.md:200",
     "tipo": "pendiente",
     "titulo": "Sistema modular por planes",
     "descripcion": "Sin modelo Plan (B-Plan-1); definir con el socio y cuándo activar toggles por suscripción.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :232, :235",
      "docs/sprints/alpha-RESUMEN-FINAL.md:76"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-086",
     "clave": "raiz:lane-plan-log.md:43",
     "tipo": "pendiente",
     "titulo": "/dashboard/plan sin error.tsx",
     "descripcion": "Queda para un lane futuro.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :100"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-120",
     "clave": "docs/sprints/p3-a-2-venta.md:84",
     "tipo": "pendiente",
     "titulo": "[FALTA:precio] en LockedView",
     "descripcion": "Cerrar el precio antes de mostrarle la pantalla a un cliente real.",
     "estado_declarado": "pendiente",
     "refs": [
      "tambien en :43, :71, :153"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-084",
     "clave": "docs/bitacora-roadmap.md:11100",
     "tipo": "pendiente",
     "titulo": "Clave de período de cuota/billing en UTC",
     "descripcion": "En las últimas 3h del mes AR la cuota/billing apunta al mes equivocado; migrar a monthRangeAR.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/lib/plan/get-org-usage.ts",
      "src/modules/chatbot/server/quota/checker.ts",
      "src/modules/chatbot/server/admin/multiTenantQueries.ts",
      "src/app/(protected)/admin/clients/_actions/plan.actions.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-065",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mensajes_ registro de cambios.md:30",
     "tipo": "promesa",
     "titulo": "'Respondemos en < 4 hs, Lun–Vie 9–18hs'",
     "descripcion": "Pill fija en el chat del cliente que reemplazó al falso 'Equipo en línea'. Es un compromiso de tiempo de respuesta.",
     "estado_declarado": "sin estado",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-076",
     "clave": "docs/bitacora-roadmap.md:2065",
     "tipo": "decision",
     "titulo": "PLAN_FALLBACK es espejo manual del plan STARTER",
     "descripcion": "Si cambia STARTER en sync-plans.ts hay que actualizar la constante en paralelo (no DRY a propósito, para que exista aunque la DB esté caída).",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/plan/fallback.ts",
      "prisma/seeds/sync-plans.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-085",
     "clave": "raiz:lane-plan-log.md:15",
     "tipo": "decision",
     "titulo": "Frozen del lane y decisiones locked de Mi plan",
     "descripcion": "lib/plan, upsell.ts y components/ui solo lectura; superficie frosted, estado vacío sin bot, downgrade sin confirmación, meter sin scale.",
     "estado_declarado": "decidido",
     "refs": [
      "tambien en :18-:20"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-087",
     "clave": "raiz:lane-plan-log.md:72",
     "tipo": "hecho-declarado",
     "titulo": "Rediseño de Mi plan (5 sprints)",
     "descripcion": "Reskin y estado vacío de UsageMeter (también en /dashboard), tier cards, spinner, fullwidth y CTA de activación sin bot; sin merge.",
     "estado_declarado": "cerrado, verificación visual pendiente",
     "refs": [
      "bedbda8",
      "40c37a7",
      "c15b740",
      "4387cc1",
      "ba584ac",
      "3fbbfe2"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-165",
     "clave": "docs/bitacora-roadmap.md:10233",
     "tipo": "hecho-declarado",
     "titulo": "CC.5 pulida visual del dashboard cliente",
     "descripcion": "PageHeader unificado en 10 pantallas; seed BotConfig client-a y 4 errores TS resueltos; flag B7 declarado falso positivo.",
     "estado_declarado": "hecho",
     "refs": [
      "src/components/ui/PageHeader.tsx",
      "prisma/seed.ts",
      "cierra pendientes fuente:10020, 10120, 10228, 10022, 9864"
     ],
     "zona_franco": false
    }
   ],
   "planeado_omitidos": [],
   "insumos": "C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\Cliente - Registro de cambios\\ (el archivo de la seccion que toca tu lote) y C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\registro-cambios-2026-07-13-panel-PD1-PA-CO5.md"
  },
  {
   "id": "D2-L5",
   "loc": 3501,
   "archivos": [
    "src/lib/modules/check-activation.ts",
    "src/lib/modules/motor-resenas-view.ts",
    "src/lib/modules/showroom.ts",
    "src/lib/onboarding/seed-tasks-for-org.ts",
    "src/lib/plan/fallback.ts",
    "src/lib/plan/get-org-usage.ts",
    "src/lib/plan/get-plan-for-org.ts",
    "src/lib/plan/index.ts",
    "src/lib/plan/plan-allows.ts",
    "src/lib/plan/plan-presentation.ts",
    "src/lib/recommendations/get-recommendations-for-org.ts",
    "src/lib/recommendations/rules.ts",
    "src/lib/recommendations/types.ts",
    "src/lib/referrals/attribution.ts",
    "src/lib/referrals/code.ts",
    "src/lib/referrals/referrals.service.ts",
    "src/lib/reports/MonthlyReport.tsx",
    "src/lib/reports/client-monthly/ClientMonthlyReportPdf.tsx",
    "src/lib/reports/client-monthly/get-client-monthly-report-data.ts",
    "src/lib/reports/client-monthly/monthly-report-data.ts",
    "src/lib/reports/executive-weekly/build.ts",
    "src/lib/reports/executive-weekly/report-eligible-plan.ts",
    "src/lib/reports/executive-weekly/send-manual.ts",
    "src/lib/reports/executive-weekly/send.ts",
    "src/lib/reports/executive-weekly/top-hot-leads.ts",
    "src/lib/security/org-scope.ts",
    "src/lib/tickets/actions.ts",
    "src/lib/tickets/schemas.ts",
    "src/lib/upsell/dedup.ts"
   ],
   "previas": [
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
     "id": "PLAN-101",
     "clave": "docs/bitacora-roadmap.md:5154",
     "tipo": "pendiente",
     "titulo": "Sin tests unitarios del HMAC de unsubscribe ni del builder del reporte",
     "descripcion": "Hoy solo cubren el build y visual-qa; sumar un smoke en un sprint posterior.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/lib/email/unsubscribe-token.ts",
      "src/lib/reports/executive-weekly/build.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-100",
     "clave": "docs/bitacora-roadmap.md:4986",
     "tipo": "decision",
     "titulo": "Reglas lockeadas del reporte ejecutivo semanal",
     "descripcion": "Sin LLM al enviar (reusa cachedExecutiveBrief), solo PRO/BUSINESS, idempotente por (org, periodKey), falla parcial no aborta el cron, periodKey en TZ-AR, opt-out 1-click RFC 8058 y cero PII en logs.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/reports/executive-weekly/send.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-105",
     "clave": "docs/bitacora-roadmap.md:11936",
     "tipo": "decision",
     "titulo": "Gate de plan del reporte duplicado a mano",
     "descripcion": "report-eligible-plan.ts calca el chequeo literal PRO/BUSINESS de build.ts (no planAllows); sincronizar a mano.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/reports/executive-weekly/report-eligible-plan.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-099",
     "clave": "docs/bitacora-roadmap.md:4978",
     "tipo": "hecho-declarado",
     "titulo": "B6.2 — Reporte ejecutivo semanal por email",
     "descripcion": "WeeklyReportLog + Organization.executiveReportOptOut; cron lunes 12:00 UTC registrado en vercel.json; gating PRO/BUSINESS, idempotencia por (org, periodKey), template nuevo y unsubscribe 1-click con HMAC; ruta de preview dev-only.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/migrations/20260524230542_b62_executive_weekly_report_log/migration.sql",
      "src/lib/email/unsubscribe-token.ts",
      "src/lib/email/templates/executive-weekly.ts",
      "src/lib/reports/executive-weekly/build.ts",
      "src/lib/reports/executive-weekly/send.ts",
      "src/app/api/cron/send-executive-reports/route.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-102",
     "clave": "docs/bitacora-roadmap.md:5158",
     "tipo": "hecho-declarado",
     "titulo": "B6.3 — Top 3 leads calientes en el reporte (solo Business)",
     "descripcion": "getTopHotLeadsForWeek rankea por score efectivo con decay, excluye DQ y filtra por org; sección en el email solo para BUSINESS.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/reports/executive-weekly/top-hot-leads.ts",
      "src/lib/email/templates/executive-weekly.ts",
      "src/lib/reports/executive-weekly/build.ts",
      "src/app/api/dev/email-preview/executive-weekly/route.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-167",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:9",
     "tipo": "hecho-declarado",
     "titulo": "Soporte: actions de tickets consolidadas",
     "descripcion": "Todo en lib/tickets. Responder no cambia el status y cada respuesta del admin manda email. Se borraron los archivos muertos.",
     "estado_declarado": "hecho",
     "refs": [
      "lib/tickets/actions.ts",
      "lib/tickets/schemas.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-151",
     "clave": "docs/bitacora-roadmap.md:11654",
     "tipo": "hecho-declarado",
     "titulo": "P5.2 vitrina de servicios + demanda medida",
     "descripcion": "3 estados, 'avisame cuando esté', dedup del upsell y tab Demanda en admin.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/modules/showroom.ts",
      "src/lib/upsell/dedup.ts",
      "src/app/(protected)/admin/leads/_components/module-demand-table.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-094",
     "clave": "docs/bitacora-roadmap.md:11777",
     "tipo": "hecho-declarado",
     "titulo": "P5.5 sistema de referidos",
     "descripcion": "Código/link /contact?ref=, atribución anti-abuso y admin de conversión.",
     "estado_declarado": "hecho (verificación visual pendiente)",
     "refs": [
      "src/lib/referrals/attribution.ts",
      "src/app/(protected)/admin/referrals"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-104",
     "clave": "docs/bitacora-roadmap.md:11927",
     "tipo": "hecho-declarado",
     "titulo": "P2.B.2 reporte ejecutivo a medida",
     "descripcion": "Frecuencia y cantidad de leads configurables por el dueño en /dashboard/cuenta/perfil.",
     "estado_declarado": "hecho (migración editada, no aplicada)",
     "refs": [
      "src/components/dashboard/ExecutiveReportPrefsForm.tsx",
      "src/lib/reports/executive-weekly/send.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-061",
     "clave": "docs/bitacora-roadmap.md:12549",
     "tipo": "hecho-declarado",
     "titulo": "P5.1-fix reviewsEngineRule exige GBP operativa",
     "descripcion": "Nueva señal gbpOperational para el borde CONNECTED_NO_LOCATION.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/recommendations/rules.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-146",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:220",
     "tipo": "pendiente",
     "titulo": "longDescription real desde la DB en el modal",
     "descripcion": "Reemplazar PRESET_MODULE_DETAILS pasando el campo como prop desde page.tsx. Mini-lane.",
     "estado_declarado": "pendiente",
     "refs": [
      "PRESET_MODULE_DETAILS",
      "tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:268"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-128",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:175",
     "tipo": "pendiente",
     "titulo": "Sprint de datos de Resultados",
     "descripcion": "Deltas reales, performance de GBP (hoy llega en 0), CTA 'ACTIVAR AHORA' sin handler e ID de propiedad GA4 de demo fijo.",
     "estado_declarado": "pendiente",
     "refs": [
      "getAnalyticsData",
      "GBPMetricsCard",
      "tambien en Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:130",
      "tambien en Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:133"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-156",
     "clave": "raiz:lane-plan-log.md:99",
     "tipo": "pendiente",
     "titulo": "Panel servicios + CTA a más servicios",
     "descripcion": "Diferido a post-merge.",
     "estado_declarado": "diferido",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-137",
     "clave": "raiz:lane-resultados-redesign-log.md:186",
     "tipo": "pendiente",
     "titulo": "Deuda data-truth en Resultados",
     "descripcion": "Deltas de tendencia hardcodeados (/trafico, /seo), performance GBP en 0, CTA muerto 'ACTIVAR AHORA', demo property id hardcodeado.",
     "estado_declarado": "pendiente (FIXME data-truth)",
     "refs": [
      "tambien en :22, :316"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-154",
     "clave": "docs/sprints/p3-a-2-venta.md:129",
     "tipo": "pendiente",
     "titulo": "Vitrina muestra priceMonthlyUsd=60",
     "descripcion": "Precio visible con el pricing sin cerrar.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-131",
     "clave": "docs/bitacora-roadmap.md:8843",
     "tipo": "pendiente",
     "titulo": "/dashboard/resultados/seo con mock data visible",
     "descripcion": "Flag P1-7 del audit: la página SEO muestra datos mock.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-150",
     "clave": "docs/bitacora-roadmap.md:8921#2",
     "tipo": "pendiente",
     "titulo": "/dashboard/modules/* sin gating",
     "descripcion": "Los módulos premium del dashboard no tenían gating al cierre de B13; derivado a B14.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-052",
     "clave": "docs/bitacora-roadmap.md:10355",
     "tipo": "pendiente",
     "titulo": "UX del Health Score 'Calibrando' tras redirect",
     "descripcion": "Al entrar a un módulo desactivado se redirige al home con 'Calibrando tu score'; decidir si es la UX deseada.",
     "estado_declarado": "pendiente (decisión de Franco)",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-107",
     "clave": "docs/bitacora-roadmap.md:11994",
     "tipo": "pendiente",
     "titulo": "Cadencia quincenal y ubicación del botón de reporte",
     "descripcion": "Decidir si el botón manual respeta la cadencia quincenal y si se copia a /admin/settings/reports.",
     "estado_declarado": "pendiente (decisión)",
     "refs": [
      "también en fuente:11995"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-109",
     "clave": "docs/bitacora-roadmap.md:12041",
     "tipo": "pendiente",
     "titulo": "Ajustar BRIEF_LOGIC_CUTOFF a la fecha de deploy",
     "descripcion": "Si el deploy fue posterior al 2026-07-02, subir la fecha del corte.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-097",
     "clave": "docs/bitacora-beta-3.md:5331",
     "tipo": "pendiente",
     "titulo": "client-monthly-report-pdf no es invariante puro",
     "descripcion": "Consulta la DB; quedó excluido del agregado y reclasificarlo al job con base es C1b.",
     "estado_declarado": "pendiente (C1b)",
     "refs": [
      "scripts/run-invariants.mjs"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-121",
     "clave": "_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:18",
     "tipo": "bloque",
     "titulo": "R1: reporte de ROI (input y render del panel)",
     "descripcion": "El runtime calcula calculatePotentialValue. El panel captura tasa de cierre y ticket promedio, y renderiza. Exige que MH esté cerrado.",
     "estado_declarado": "bloqueado",
     "refs": [
      "calculatePotentialValue",
      "tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:39"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-096",
     "clave": "_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:23",
     "tipo": "bloque",
     "titulo": "MH.1: orderBy en reportes y latencia",
     "descripcion": "Agregar orderBy en buildWeeklyReport (3 sets) y en getLatencyHistory, para que las métricas salgan sobre filas reales.",
     "estado_declarado": "pendiente",
     "refs": [
      "buildWeeklyReport",
      "getLatencyHistory",
      "A2.3",
      "A2.2"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-059",
     "clave": "docs/bitacora-roadmap.md:11649",
     "tipo": "idea",
     "titulo": "Señal 'fuera de horario' en recomendaciones v2",
     "descripcion": "Señal cara (EXTRACT(HOUR)) diferida a v2.",
     "estado_declarado": "pendiente",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-044",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:72",
     "tipo": "decision",
     "titulo": "TrendChip oculto (opción B)",
     "descripcion": "No se toca lib/health-score. Se reactiva cuando exista historial real (HealthScoreSnapshot, lane de datos aparte).",
     "estado_declarado": "hecho",
     "refs": [
      "HealthScoreSnapshot",
      "TrendChip"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-147",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:244",
     "tipo": "decision",
     "titulo": "Servicios: tipografía del admin, accent y badge",
     "descripcion": "Tipografía liviana del admin. Accent por módulo y servicio. Badge 'Premium' neutral. 'Ver detalles' como ícono.",
     "estado_declarado": "hecho",
     "refs": [
      "tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:3"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-095",
     "clave": "docs/bitacora-roadmap.md:11823",
     "tipo": "decision",
     "titulo": "Beneficio de referidos: 1 mes bonificado",
     "descripcion": "Conversión = plan pago confirmado por develOP; el mes no se auto-aplica ni se notifica al cliente.",
     "estado_declarado": "hecho",
     "refs": [
      "también en fuente:11830"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-098",
     "clave": "docs/bitacora-roadmap.md:4866",
     "tipo": "hecho-declarado",
     "titulo": "B6.1 — Histórico semanal del executive brief",
     "descripcion": "Tabla ExecutiveBriefSnapshot (una fila por org y semana ISO en TZ-AR) upserteada desde los 3 paths que escriben el cache; helper getBriefHistory.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/schema.prisma",
      "prisma/migrations/20260524225006_b61_executive_brief_snapshots/migration.sql",
      "src/lib/ai/executive-brief.ts",
      "src/lib/tz-ar.ts",
      "src/lib/ai/brief-history.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-125",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:69",
     "tipo": "hecho-declarado",
     "titulo": "Resultados Sprint 5: SEO",
     "descripcion": "Saca un probe muerto. result.error ya no se muestra al cliente. Reskin de SEO con upsell.ts intacto.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "df4854e",
      "0e1d35f",
      "5f7989e",
      "SeoContent"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-138",
     "clave": "raiz:lane-resultados-redesign-log.md:205",
     "tipo": "hecho-declarado",
     "titulo": "Reskin de Resultados (sprints 1-5)",
     "descripcion": "Header único por tab; /reputacion, /analisis, /trafico y /seo al canon admin; fixes Google Ads, tooltip tipado, skeleton determinístico y fuga de error.",
     "estado_declarado": "hecho, sin merge",
     "refs": [
      "90a202e",
      "37609b5",
      "3ee97f0",
      "df4fbe8",
      "0e1d35f",
      "5f7989e"
     ],
     "zona_franco": false
    }
   ],
   "planeado_omitidos": [],
   "insumos": "C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\Cliente - Registro de cambios\\ (el archivo de la seccion que toca tu lote) y C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive\\Olme\\registro-cambios-2026-07-13-panel-PD1-PA-CO5.md"
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
